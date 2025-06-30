/*
  # Fix duplicate categories and add unique constraint

  1. Changes
    - Remove duplicate categories based on slug
    - Add unique constraint on slug column
    - Update category IDs in products to reference the canonical category

  2. Security
    - No changes to RLS policies
*/

-- First, identify and remove duplicate categories, keeping the one with the lowest ID
WITH duplicates AS (
  SELECT slug, MIN(id) as keep_id, ARRAY_AGG(id ORDER BY id) as all_ids
  FROM wc_categories 
  GROUP BY slug 
  HAVING COUNT(*) > 1
),
ids_to_delete AS (
  SELECT UNNEST(all_ids[2:]) as delete_id, keep_id, slug
  FROM duplicates
)
-- Update products to reference the canonical category before deleting duplicates
UPDATE wc_products 
SET category_ids = (
  SELECT jsonb_agg(
    CASE 
      WHEN elem::int IN (SELECT delete_id FROM ids_to_delete)
      THEN (SELECT keep_id FROM ids_to_delete WHERE delete_id = elem::int)
      ELSE elem::int
    END
  )
  FROM jsonb_array_elements_text(category_ids) AS elem
)
WHERE EXISTS (
  SELECT 1 FROM jsonb_array_elements_text(category_ids) AS elem
  WHERE elem::int IN (SELECT delete_id FROM ids_to_delete)
);

-- Delete duplicate categories
WITH duplicates AS (
  SELECT slug, MIN(id) as keep_id, ARRAY_AGG(id ORDER BY id) as all_ids
  FROM wc_categories 
  GROUP BY slug 
  HAVING COUNT(*) > 1
)
DELETE FROM wc_categories 
WHERE id IN (
  SELECT UNNEST(all_ids[2:]) 
  FROM duplicates
);

-- Add unique constraint on slug
ALTER TABLE wc_categories 
ADD CONSTRAINT IF NOT EXISTS wc_categories_slug_unique UNIQUE (slug);

-- Create index on slug for better performance
CREATE INDEX IF NOT EXISTS wc_categories_slug_idx ON wc_categories(slug);