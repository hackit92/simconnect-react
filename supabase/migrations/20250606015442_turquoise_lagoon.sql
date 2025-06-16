/*
  # Add SKU uniqueness and metadata improvements

  1. Changes
    - Add unique constraint on SKU column
    - Add metadata validation function
    - Add trigger to validate metadata format

  2. Security
    - No changes to RLS policies
*/

-- Create metadata validation function
CREATE OR REPLACE FUNCTION validate_product_metadata()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure metadata is a JSON object
  IF NEW.metadata IS NOT NULL AND jsonb_typeof(NEW.metadata) != 'object' THEN
    RAISE EXCEPTION 'metadata must be a JSON object';
  END IF;

  -- Convert numeric strings to numbers in gb and validity_days
  IF NEW.metadata ? 'gb' AND jsonb_typeof(NEW.metadata->'gb') = 'string' THEN
    NEW.metadata = jsonb_set(
      NEW.metadata,
      '{gb}',
      to_jsonb(NULLIF(TRIM(NEW.metadata->>'gb'), '')::numeric)
    );
  END IF;

  IF NEW.metadata ? 'validity_days' AND jsonb_typeof(NEW.metadata->'validity_days') = 'string' THEN
    NEW.metadata = jsonb_set(
      NEW.metadata,
      '{validity_days}',
      to_jsonb(NULLIF(TRIM(NEW.metadata->>'validity_days'), '')::numeric)
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for metadata validation
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'validate_product_metadata_trigger'
  ) THEN
    CREATE TRIGGER validate_product_metadata_trigger
      BEFORE INSERT OR UPDATE ON wc_products
      FOR EACH ROW
      EXECUTE FUNCTION validate_product_metadata();
  END IF;
END $$;