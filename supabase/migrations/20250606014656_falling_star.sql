/*
  # Add metadata column to wc_products table

  1. Changes
    - Add JSONB metadata column to wc_products table to store product metadata
      - GB data
      - Validity days
      - Prices in different currencies
      - Other custom metadata fields
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'wc_products' 
    AND column_name = 'metadata'
  ) THEN
    ALTER TABLE wc_products ADD COLUMN metadata JSONB;
  END IF;
END $$;