/*
  # Update product categories structure
  
  1. Changes
    - Add category_ids JSONB column to store multiple category IDs
    - Remove old category_id column
    - Add validation for category_ids format
  
  2. Security
    - Maintain existing RLS policies
*/

-- Add new category_ids column
ALTER TABLE wc_products 
ADD COLUMN IF NOT EXISTS category_ids jsonb DEFAULT '[]'::jsonb;

-- Create function to validate category_ids format
CREATE OR REPLACE FUNCTION validate_category_ids()
RETURNS trigger AS $$
BEGIN
  -- Ensure category_ids is an array
  IF NOT (jsonb_typeof(NEW.category_ids) = 'array') THEN
    RAISE EXCEPTION 'category_ids must be a JSONB array';
  END IF;
  
  -- Ensure all elements are numbers
  IF EXISTS (
    SELECT 1
    FROM jsonb_array_elements(NEW.category_ids) AS element
    WHERE jsonb_typeof(element) != 'number'
  ) THEN
    RAISE EXCEPTION 'category_ids must contain only numbers';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for category_ids validation
DROP TRIGGER IF EXISTS validate_category_ids_trigger ON wc_products;
CREATE TRIGGER validate_category_ids_trigger
  BEFORE INSERT OR UPDATE ON wc_products
  FOR EACH ROW
  EXECUTE FUNCTION validate_category_ids();

-- Drop the old category_id column if it exists
ALTER TABLE wc_products
DROP COLUMN IF EXISTS category_id;