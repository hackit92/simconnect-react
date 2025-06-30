/*
  # Fix duplicate categories and add unique constraint

  1. Changes
    - Remove duplicate categories, keeping the one with the lowest ID
    - Update product references to point to canonical categories
    - Add unique constraint on slug to prevent future duplicates
    - Add index for better performance

  2. Process
    - First update all product references to canonical categories
    - Then delete duplicate categories
    - Finally add unique constraint and index
*/

-- Step 1: Update products to reference canonical categories before deleting duplicates
DO $$
DECLARE
    duplicate_record RECORD;
    canonical_id INTEGER;
BEGIN
    -- Loop through each set of duplicates
    FOR duplicate_record IN 
        SELECT slug, MIN(id) as keep_id, ARRAY_AGG(id ORDER BY id) as all_ids
        FROM wc_categories 
        GROUP BY slug 
        HAVING COUNT(*) > 1
    LOOP
        canonical_id := duplicate_record.keep_id;
        
        -- Update products that reference any of the duplicate IDs to use the canonical ID
        UPDATE wc_products 
        SET category_ids = (
            SELECT jsonb_agg(
                CASE 
                    WHEN elem::int = ANY(duplicate_record.all_ids[2:])
                    THEN canonical_id
                    ELSE elem::int
                END
            )
            FROM jsonb_array_elements_text(category_ids) AS elem
        )
        WHERE EXISTS (
            SELECT 1 FROM jsonb_array_elements_text(category_ids) AS elem
            WHERE elem::int = ANY(duplicate_record.all_ids[2:])
        );
    END LOOP;
END $$;

-- Step 2: Delete duplicate categories (keep only the one with lowest ID)
DO $$
DECLARE
    duplicate_record RECORD;
BEGIN
    FOR duplicate_record IN 
        SELECT slug, MIN(id) as keep_id, ARRAY_AGG(id ORDER BY id) as all_ids
        FROM wc_categories 
        GROUP BY slug 
        HAVING COUNT(*) > 1
    LOOP
        -- Delete all duplicates except the canonical one
        DELETE FROM wc_categories 
        WHERE id = ANY(duplicate_record.all_ids[2:]);
    END LOOP;
END $$;

-- Step 3: Add unique constraint on slug (check if it exists first)
DO $$
BEGIN
    -- Check if constraint already exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'wc_categories_slug_unique'
    ) THEN
        ALTER TABLE wc_categories 
        ADD CONSTRAINT wc_categories_slug_unique UNIQUE (slug);
    END IF;
END $$;

-- Step 4: Create index on slug for better performance (if not exists)
CREATE INDEX IF NOT EXISTS wc_categories_slug_idx ON wc_categories(slug);