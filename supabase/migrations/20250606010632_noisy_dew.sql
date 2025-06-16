/*
  # WooCommerce Data Integration Schema

  1. Tables
    - wc_categories: Store product categories
    - wc_products: Store product information with metadata

  2. Features
    - Trigram search indexes for name fields
    - RLS policies for secure access
    - Automatic timestamp updates
    - SKU tracking
    - Multi-currency price support via metadata
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create wc_categories table
CREATE TABLE IF NOT EXISTS public.wc_categories (
  id integer PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL,
  parent integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create wc_products table with extended fields
CREATE TABLE IF NOT EXISTS public.wc_products (
  id integer PRIMARY KEY,
  name text NOT NULL,
  description text,
  price text,
  regular_price text,
  sale_price text,
  images jsonb,
  metadata jsonb DEFAULT '{}',
  category_id integer REFERENCES public.wc_categories(id),
  stock_status text DEFAULT 'instock',
  stock_quantity integer,
  virtual boolean DEFAULT false,
  downloadable boolean DEFAULT false,
  tax_status text DEFAULT 'taxable',
  tax_class text DEFAULT '',
  manage_stock boolean DEFAULT false,
  status text DEFAULT 'publish',
  catalog_visibility text DEFAULT 'visible',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add SKU column separately to avoid issues
ALTER TABLE public.wc_products ADD COLUMN IF NOT EXISTS sku text;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS wc_products_category_id_idx ON public.wc_products(category_id);
CREATE INDEX IF NOT EXISTS wc_products_sku_idx ON public.wc_products(sku);
CREATE INDEX IF NOT EXISTS wc_products_name_trgm_idx ON public.wc_products USING gist (name gist_trgm_ops);
CREATE INDEX IF NOT EXISTS wc_categories_name_trgm_idx ON public.wc_categories USING gist (name gist_trgm_ops);

-- Enable Row Level Security
ALTER TABLE public.wc_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wc_categories ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Allow public read access on products" ON public.wc_products;
    DROP POLICY IF EXISTS "Allow public read access on categories" ON public.wc_categories;
    DROP POLICY IF EXISTS "Allow service role write access on products" ON public.wc_products;
    DROP POLICY IF EXISTS "Allow service role write access on categories" ON public.wc_categories;
EXCEPTION
    WHEN OTHERS THEN 
END $$;

-- Create policies for public read access
CREATE POLICY "Allow public read access on products" 
  ON public.wc_products
  FOR SELECT 
  TO public 
  USING (true);

CREATE POLICY "Allow public read access on categories" 
  ON public.wc_categories
  FOR SELECT 
  TO public 
  USING (true);

-- Create policies for service role write access
CREATE POLICY "Allow service role write access on products" 
  ON public.wc_products
  FOR ALL 
  TO service_role 
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow service role write access on categories" 
  ON public.wc_categories
  FOR ALL 
  TO service_role 
  USING (true)
  WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_wc_products_updated_at ON public.wc_products;
DROP TRIGGER IF EXISTS update_wc_categories_updated_at ON public.wc_categories;

CREATE TRIGGER update_wc_products_updated_at
  BEFORE UPDATE ON public.wc_products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_wc_categories_updated_at
  BEFORE UPDATE ON public.wc_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();