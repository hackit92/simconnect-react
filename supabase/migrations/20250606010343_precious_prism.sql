/*
  # Create WooCommerce tables

  1. New Tables
    - `wc_categories`: Stores WooCommerce categories
      - `id` (integer, primary key)
      - `name` (text)
      - `slug` (text)
      - `parent` (integer)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `wc_products`: Stores WooCommerce products
      - `id` (integer, primary key)
      - `name` (text)
      - `description` (text)
      - `price` (text)
      - `regular_price` (text)
      - `sale_price` (text)
      - `images` (jsonb)
      - `category_id` (integer, foreign key)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Public read access
    - Service role write access

  3. Features
    - Automatic updated_at timestamps
    - Full text search capabilities
    - Foreign key constraints
*/

-- Enable trigram extension first
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

-- Create wc_products table
CREATE TABLE IF NOT EXISTS public.wc_products (
  id integer PRIMARY KEY,
  name text NOT NULL,
  description text,
  price text,
  regular_price text,
  sale_price text,
  images jsonb,
  category_id integer REFERENCES public.wc_categories(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS wc_products_category_id_idx ON public.wc_products(category_id);
CREATE INDEX IF NOT EXISTS wc_products_name_trgm_idx ON public.wc_products USING gist(name gist_trgm_ops);
CREATE INDEX IF NOT EXISTS wc_categories_name_trgm_idx ON public.wc_categories USING gist(name gist_trgm_ops);

-- Enable Row Level Security
ALTER TABLE public.wc_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wc_categories ENABLE ROW LEVEL SECURITY;

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

-- Create function to update updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_wc_products_updated_at
  BEFORE UPDATE ON public.wc_products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_wc_categories_updated_at
  BEFORE UPDATE ON public.wc_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();