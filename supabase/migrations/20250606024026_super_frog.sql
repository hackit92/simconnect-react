/*
  # Add support for multiple categories per product

  1. Changes
    - Add product_categories junction table
    - Add validation for category assignments
    - Migrate existing category relationships

  2. Security
    - Enable RLS on product_categories table
    - Add policies for public read access
    - Add policies for service role write access
*/

-- Create junction table for product categories
CREATE TABLE IF NOT EXISTS wc_product_categories (
  product_id integer REFERENCES wc_products(id),
  category_id integer REFERENCES wc_categories(id),
  PRIMARY KEY (product_id, category_id)
);

-- Enable RLS
ALTER TABLE wc_product_categories ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Allow public read access on product categories"
  ON wc_product_categories
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow service role write access on product categories"
  ON wc_product_categories
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Migrate existing category relationships
INSERT INTO wc_product_categories (product_id, category_id)
SELECT id, category_id
FROM wc_products
WHERE category_id IS NOT NULL;

-- Drop the foreign key constraint
ALTER TABLE wc_products
DROP CONSTRAINT IF EXISTS wc_products_category_id_fkey;

-- Add categories JSON column
ALTER TABLE wc_products
ADD COLUMN IF NOT EXISTS categories jsonb DEFAULT '[]'::jsonb;

-- Create function to validate categories format
CREATE OR REPLACE FUNCTION validate_categories()
RETURNS trigger AS $$
BEGIN
  -- Ensure categories is an array
  IF NOT (jsonb_typeof(NEW.categories) = 'array') THEN
    RAISE EXCEPTION 'categories must be a JSONB array';
  END IF;
  
  -- Ensure all elements are numbers
  IF EXISTS (
    SELECT 1
    FROM jsonb_array_elements(NEW.categories) AS element
    WHERE jsonb_typeof(element) != 'number'
  ) THEN
    RAISE EXCEPTION 'categories must contain only numbers';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for categories validation
DROP TRIGGER IF EXISTS validate_categories_trigger ON wc_products;
CREATE TRIGGER validate_categories_trigger
  BEFORE INSERT OR UPDATE ON wc_products
  FOR EACH ROW
  EXECUTE FUNCTION validate_categories();

-- Update categories with existing category_id data
UPDATE wc_products
SET categories = CASE
  WHEN category_id IS NOT NULL THEN jsonb_build_array(category_id)
  ELSE '[]'::jsonb
END;

-- Drop the old category_id column
ALTER TABLE wc_products
DROP COLUMN IF EXISTS category_id;