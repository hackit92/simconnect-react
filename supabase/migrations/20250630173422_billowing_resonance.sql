/*
  # Fix duplicate categories and add unique constraint

  1. Changes
    - Clean up duplicate categories in wc_categories table
    - Update products to reference the canonical category
    - Add unique constraint on slug to prevent future duplicates

  2. Process
    - Identify and merge duplicate categories
    - Update product category_ids to reference canonical categories
    - Remove duplicate entries
    - Add unique constraint on slug
*/

-- First, let's create a temporary function to clean up duplicates
CREATE OR REPLACE FUNCTION cleanup_duplicate_categories()
RETURNS void AS $$
DECLARE
  duplicate_record RECORD;
  canonical_id integer;
  duplicate_ids integer[];
BEGIN
  -- Find all duplicate slugs and clean them up
  FOR duplicate_record IN 
    SELECT slug, array_agg(id ORDER BY id) as ids, array_agg(name ORDER BY id) as names
    FROM wc_categories 
    GROUP BY slug 
    HAVING count(*) > 1
  LOOP
    -- Use the first ID as canonical (lowest ID)
    canonical_id := duplicate_record.ids[1];
    duplicate_ids := duplicate_record.ids[2:];
    
    RAISE NOTICE 'Processing duplicates for slug: %, canonical_id: %, duplicates: %', 
      duplicate_record.slug, canonical_id, duplicate_ids;
    
    -- Update all products that reference duplicate category IDs
    FOR i IN 1..array_length(duplicate_ids, 1) LOOP
      -- Update products that have this duplicate category ID
      UPDATE wc_products 
      SET category_ids = (
        -- Remove the duplicate ID and add the canonical ID if not already present
        CASE 
          WHEN category_ids @> to_jsonb(canonical_id) THEN 
            category_ids - duplicate_ids[i]
          ELSE 
            (category_ids - duplicate_ids[i]) || to_jsonb(canonical_id)
        END
      )
      WHERE category_ids @> to_jsonb(duplicate_ids[i]);
      
      RAISE NOTICE 'Updated products for duplicate category ID: %', duplicate_ids[i];
    END LOOP;
    
    -- Delete duplicate categories
    DELETE FROM wc_categories WHERE id = ANY(duplicate_ids);
    
    RAISE NOTICE 'Deleted duplicate categories with IDs: %', duplicate_ids;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute the cleanup function
SELECT cleanup_duplicate_categories();

-- Drop the temporary function
DROP FUNCTION cleanup_duplicate_categories();

-- Add unique constraint on slug to prevent future duplicates
DO $$ 
BEGIN
  -- Check if constraint already exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'wc_categories_slug_unique'
  ) THEN
    ALTER TABLE wc_categories ADD CONSTRAINT wc_categories_slug_unique UNIQUE (slug);
    RAISE NOTICE 'Added unique constraint on slug column';
  ELSE
    RAISE NOTICE 'Unique constraint on slug already exists';
  END IF;
END $$;

-- Update the country_code for products after cleanup
UPDATE wc_products 
SET country_code = (
  SELECT get_iso2_from_slug(c.slug)
  FROM wc_categories c
  WHERE c.id = ANY(
    SELECT jsonb_array_elements_text(wc_products.category_ids)::integer
  )
  AND get_iso2_from_slug(c.slug) IS NOT NULL
  LIMIT 1
)
WHERE plan_type = 'country' 
  AND category_ids IS NOT NULL 
  AND jsonb_array_length(category_ids) > 0;