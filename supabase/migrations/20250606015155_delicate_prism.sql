/*
  # Add trigram index for better text search

  1. Extensions
    - Add pg_trgm extension for text search capabilities
  
  2. Indexes
    - Add trigram indexes on name columns for fuzzy search
*/

-- Enable the pg_trgm extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Add trigram indexes for better text search
CREATE INDEX IF NOT EXISTS wc_categories_name_trgm_idx ON wc_categories USING gist (name gist_trgm_ops);
CREATE INDEX IF NOT EXISTS wc_products_name_trgm_idx ON wc_products USING gist (name gist_trgm_ops);