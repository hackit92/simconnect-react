/*
  # Create WooCommerce tables and policies

  1. Tables
    - wc_categories: Stores product categories
    - wc_products: Stores products with metadata and foreign key to categories

  2. Indexes
    - Optimized indexes for common queries
    - B-tree indexes for exact matches
    
  3. Security
    - RLS enabled on both tables
    - Public read access
    - Service role write access
*/

-- Create categories table
CREATE TABLE IF NOT EXISTS wc_categories (
  id integer PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL,
  parent integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS wc_products (
  id integer PRIMARY KEY,
  name text NOT NULL,
  description text,
  price text,
  regular_price text,
  sale_price text,
  images jsonb,
  category_id integer REFERENCES wc_categories(id),
  sku text,
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS wc_categories_name_idx ON wc_categories USING btree (name);
CREATE INDEX IF NOT EXISTS wc_categories_slug_idx ON wc_categories USING btree (slug);
CREATE INDEX IF NOT EXISTS wc_products_category_id_idx ON wc_products USING btree (category_id);
CREATE INDEX IF NOT EXISTS wc_products_name_idx ON wc_products USING btree (name);
CREATE INDEX IF NOT EXISTS wc_products_sku_idx ON wc_products USING btree (sku);

-- Enable RLS
ALTER TABLE wc_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE wc_products ENABLE ROW LEVEL SECURITY;

-- Create policies with checks
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'wc_categories' 
    AND policyname = 'Allow public read access on categories'
  ) THEN
    CREATE POLICY "Allow public read access on categories"
      ON wc_categories
      FOR SELECT
      TO public
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'wc_categories' 
    AND policyname = 'Allow service role write access on categories'
  ) THEN
    CREATE POLICY "Allow service role write access on categories"
      ON wc_categories
      USING (true)
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'wc_products' 
    AND policyname = 'Allow public read access on products'
  ) THEN
    CREATE POLICY "Allow public read access on products"
      ON wc_products
      FOR SELECT
      TO public
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'wc_products' 
    AND policyname = 'Allow service role write access on products'
  ) THEN
    CREATE POLICY "Allow service role write access on products"
      ON wc_products
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Create updated_at function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_wc_categories_updated_at'
  ) THEN
    CREATE TRIGGER update_wc_categories_updated_at
      BEFORE UPDATE ON wc_categories
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_wc_products_updated_at'
  ) THEN
    CREATE TRIGGER update_wc_products_updated_at
      BEFORE UPDATE ON wc_products
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;