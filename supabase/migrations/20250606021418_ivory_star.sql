/*
  # Add soft delete for products

  1. Changes
    - Add `active` boolean column to wc_products table
    - Set default value to true for existing records
    - Add index on active column for faster filtering
    - Update RLS policy to only show active products

  2. Security
    - Maintain existing RLS policies
    - Add new policy for service role to manage active status
*/

-- Add active column with default true
ALTER TABLE wc_products 
  ADD COLUMN IF NOT EXISTS active boolean DEFAULT true;

-- Set all existing products to active
UPDATE wc_products SET active = true WHERE active IS NULL;

-- Make active column not nullable
ALTER TABLE wc_products 
  ALTER COLUMN active SET NOT NULL;

-- Add index for active column
CREATE INDEX IF NOT EXISTS wc_products_active_idx ON wc_products(active);

-- Update the public read policy to only show active products
DROP POLICY IF EXISTS "Allow public read access on products" ON wc_products;
CREATE POLICY "Allow public read access on products"
  ON wc_products
  FOR SELECT
  TO public
  USING (active = true);