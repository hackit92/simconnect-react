/*
  # Add unique constraint on SKU
  
  1. Changes
    - Add unique constraint on SKU column in wc_products table
    - Add NOT NULL constraint to ensure SKU is always provided
  
  2. Notes
    - This ensures we can reliably use SKU for product identification
    - Prevents duplicate products with the same SKU
*/

-- First ensure SKU is not null
UPDATE wc_products 
SET sku = 'LEGACY-' || id::text 
WHERE sku IS NULL;

ALTER TABLE wc_products 
  ALTER COLUMN sku SET NOT NULL,
  ADD CONSTRAINT wc_products_sku_unique UNIQUE (sku);