/*
  # Add plan type and region fields for efficient filtering

  1. New Columns
    - `plan_type` (text): 'country' or 'regional' to identify plan type
    - `region_code` (text): Region identifier for regional plans (e.g., 'latinoamerica', 'europa')
    - `country_code` (text): ISO country code for country-specific plans
    - `coverage_area` (text): Human-readable coverage description

  2. Indexes
    - Add indexes on new fields for fast filtering
    - Composite indexes for common query patterns

  3. Data Migration
    - Analyze existing products and populate new fields based on SKU and metadata patterns
*/

-- Add new columns for plan classification
ALTER TABLE wc_products 
ADD COLUMN IF NOT EXISTS plan_type text CHECK (plan_type IN ('country', 'regional')),
ADD COLUMN IF NOT EXISTS region_code text,
ADD COLUMN IF NOT EXISTS country_code text,
ADD COLUMN IF NOT EXISTS coverage_area text;

-- Create indexes for efficient filtering
CREATE INDEX IF NOT EXISTS wc_products_plan_type_idx ON wc_products(plan_type);
CREATE INDEX IF NOT EXISTS wc_products_region_code_idx ON wc_products(region_code);
CREATE INDEX IF NOT EXISTS wc_products_country_code_idx ON wc_products(country_code);
CREATE INDEX IF NOT EXISTS wc_products_plan_type_region_idx ON wc_products(plan_type, region_code);
CREATE INDEX IF NOT EXISTS wc_products_plan_type_country_idx ON wc_products(plan_type, country_code);

-- Create function to classify and update existing products
CREATE OR REPLACE FUNCTION classify_existing_products()
RETURNS void AS $$
DECLARE
  product_record RECORD;
  product_name_lower text;
  product_sku_lower text;
BEGIN
  -- Loop through all products and classify them
  FOR product_record IN 
    SELECT id, name, sku, metadata 
    FROM wc_products 
    WHERE plan_type IS NULL
  LOOP
    product_name_lower := lower(product_record.name);
    product_sku_lower := lower(product_record.sku);
    
    -- Check for Latinoamérica regional plans
    IF product_sku_lower LIKE '%my-latam%' OR 
       product_sku_lower LIKE '%latam%' OR
       product_name_lower LIKE '%latinoamerica%' OR
       product_name_lower LIKE '%latin america%' OR
       product_name_lower LIKE '%america latina%' THEN
      
      UPDATE wc_products 
      SET plan_type = 'regional',
          region_code = 'latinoamerica',
          coverage_area = 'Latinoamérica'
      WHERE id = product_record.id;
      
    -- Check for Europa regional plans
    ELSIF product_name_lower LIKE '%europa%' OR
          product_name_lower LIKE '%europe%' OR
          product_sku_lower LIKE '%europe%' OR
          product_sku_lower LIKE '%my-europe%' THEN
      
      UPDATE wc_products 
      SET plan_type = 'regional',
          region_code = 'europa',
          coverage_area = 'Europa'
      WHERE id = product_record.id;
      
    -- Check for Oriente Medio regional plans
    ELSIF product_name_lower LIKE '%oriente medio%' OR
          product_name_lower LIKE '%middle east%' OR
          product_sku_lower LIKE '%middle-east%' OR
          product_sku_lower LIKE '%middleeast%' OR
          product_sku_lower LIKE '%my-middleeast%' THEN
      
      UPDATE wc_products 
      SET plan_type = 'regional',
          region_code = 'oriente-medio',
          coverage_area = 'Oriente Medio'
      WHERE id = product_record.id;
      
    -- Check for Caribe regional plans
    ELSIF product_name_lower LIKE '%caribe%' OR
          product_name_lower LIKE '%caribbean%' OR
          product_sku_lower LIKE '%caribbean%' OR
          product_sku_lower LIKE '%my-caribbean%' THEN
      
      UPDATE wc_products 
      SET plan_type = 'regional',
          region_code = 'caribe',
          coverage_area = 'Caribe'
      WHERE id = product_record.id;
      
    -- Check for Asia regional plans
    ELSIF product_name_lower LIKE '%asia%' OR
          product_sku_lower LIKE '%asia%' OR
          product_sku_lower LIKE '%my-asia%' THEN
      
      UPDATE wc_products 
      SET plan_type = 'regional',
          region_code = 'asia',
          coverage_area = 'Asia'
      WHERE id = product_record.id;
      
    -- Check for África regional plans
    ELSIF product_name_lower LIKE '%africa%' OR
          product_name_lower LIKE '%áfrica%' OR
          product_sku_lower LIKE '%africa%' OR
          product_sku_lower LIKE '%my-africa%' THEN
      
      UPDATE wc_products 
      SET plan_type = 'regional',
          region_code = 'africa',
          coverage_area = 'África'
      WHERE id = product_record.id;
      
    -- Check for Norteamérica regional plans
    ELSIF product_name_lower LIKE '%norteamerica%' OR
          product_name_lower LIKE '%north america%' OR
          product_name_lower LIKE '%america del norte%' OR
          product_sku_lower LIKE '%northamerica%' OR
          product_sku_lower LIKE '%my-northamerica%' THEN
      
      UPDATE wc_products 
      SET plan_type = 'regional',
          region_code = 'norteamerica',
          coverage_area = 'Norteamérica'
      WHERE id = product_record.id;
      
    -- Check for Balcanes regional plans
    ELSIF product_name_lower LIKE '%balcanes%' OR
          product_name_lower LIKE '%balkans%' OR
          product_sku_lower LIKE '%balkans%' OR
          product_sku_lower LIKE '%my-balkans%' THEN
      
      UPDATE wc_products 
      SET plan_type = 'regional',
          region_code = 'balcanes',
          coverage_area = 'Balcanes'
      WHERE id = product_record.id;
      
    -- Check for Cáucaso regional plans
    ELSIF product_name_lower LIKE '%caucaso%' OR
          product_name_lower LIKE '%caucasus%' OR
          product_sku_lower LIKE '%caucasus%' OR
          product_sku_lower LIKE '%my-caucasus%' THEN
      
      UPDATE wc_products 
      SET plan_type = 'regional',
          region_code = 'caucaso',
          coverage_area = 'Cáucaso'
      WHERE id = product_record.id;
      
    -- Check for Asia Central regional plans
    ELSIF product_name_lower LIKE '%asia central%' OR
          product_name_lower LIKE '%central asia%' OR
          product_sku_lower LIKE '%centralasia%' OR
          product_sku_lower LIKE '%my-centralasia%' THEN
      
      UPDATE wc_products 
      SET plan_type = 'regional',
          region_code = 'asia-central',
          coverage_area = 'Asia Central'
      WHERE id = product_record.id;
      
    -- Check for Oceanía regional plans
    ELSIF product_name_lower LIKE '%oceania%' OR
          product_name_lower LIKE '%oceanía%' OR
          product_sku_lower LIKE '%oceania%' OR
          product_sku_lower LIKE '%my-oceania%' THEN
      
      UPDATE wc_products 
      SET plan_type = 'regional',
          region_code = 'oceania',
          coverage_area = 'Oceanía'
      WHERE id = product_record.id;
      
    -- If no regional pattern found, classify as country-specific
    ELSE
      -- Try to extract country code from category_ids
      DECLARE
        category_slug text;
      BEGIN
        -- Get the first category slug if available
        SELECT slug INTO category_slug
        FROM wc_categories 
        WHERE id = ANY(
          SELECT jsonb_array_elements_text(product_record.category_ids)::integer
        )
        LIMIT 1;
        
        UPDATE wc_products 
        SET plan_type = 'country',
            country_code = category_slug,
            coverage_area = COALESCE(category_slug, 'Individual')
        WHERE id = product_record.id;
      EXCEPTION
        WHEN OTHERS THEN
          -- Fallback: mark as country without specific code
          UPDATE wc_products 
          SET plan_type = 'country',
              coverage_area = 'Individual'
          WHERE id = product_record.id;
      END;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Run the classification function
SELECT classify_existing_products();

-- Create trigger function to automatically classify new products
CREATE OR REPLACE FUNCTION auto_classify_product()
RETURNS TRIGGER AS $$
DECLARE
  product_name_lower text;
  product_sku_lower text;
  category_slug text;
BEGIN
  -- Only process if plan_type is not already set
  IF NEW.plan_type IS NOT NULL THEN
    RETURN NEW;
  END IF;
  
  product_name_lower := lower(NEW.name);
  product_sku_lower := lower(NEW.sku);
  
  -- Check for regional patterns (same logic as above)
  IF product_sku_lower LIKE '%my-latam%' OR 
     product_sku_lower LIKE '%latam%' OR
     product_name_lower LIKE '%latinoamerica%' OR
     product_name_lower LIKE '%latin america%' OR
     product_name_lower LIKE '%america latina%' THEN
    
    NEW.plan_type := 'regional';
    NEW.region_code := 'latinoamerica';
    NEW.coverage_area := 'Latinoamérica';
    
  ELSIF product_name_lower LIKE '%europa%' OR
        product_name_lower LIKE '%europe%' OR
        product_sku_lower LIKE '%europe%' OR
        product_sku_lower LIKE '%my-europe%' THEN
    
    NEW.plan_type := 'regional';
    NEW.region_code := 'europa';
    NEW.coverage_area := 'Europa';
    
  ELSIF product_name_lower LIKE '%oriente medio%' OR
        product_name_lower LIKE '%middle east%' OR
        product_sku_lower LIKE '%middle-east%' OR
        product_sku_lower LIKE '%middleeast%' OR
        product_sku_lower LIKE '%my-middleeast%' THEN
    
    NEW.plan_type := 'regional';
    NEW.region_code := 'oriente-medio';
    NEW.coverage_area := 'Oriente Medio';
    
  ELSIF product_name_lower LIKE '%caribe%' OR
        product_name_lower LIKE '%caribbean%' OR
        product_sku_lower LIKE '%caribbean%' OR
        product_sku_lower LIKE '%my-caribbean%' THEN
    
    NEW.plan_type := 'regional';
    NEW.region_code := 'caribe';
    NEW.coverage_area := 'Caribe';
    
  ELSIF product_name_lower LIKE '%asia%' OR
        product_sku_lower LIKE '%asia%' OR
        product_sku_lower LIKE '%my-asia%' THEN
    
    NEW.plan_type := 'regional';
    NEW.region_code := 'asia';
    NEW.coverage_area := 'Asia';
    
  ELSIF product_name_lower LIKE '%africa%' OR
        product_name_lower LIKE '%áfrica%' OR
        product_sku_lower LIKE '%africa%' OR
        product_sku_lower LIKE '%my-africa%' THEN
    
    NEW.plan_type := 'regional';
    NEW.region_code := 'africa';
    NEW.coverage_area := 'África';
    
  ELSIF product_name_lower LIKE '%norteamerica%' OR
        product_name_lower LIKE '%north america%' OR
        product_name_lower LIKE '%america del norte%' OR
        product_sku_lower LIKE '%northamerica%' OR
        product_sku_lower LIKE '%my-northamerica%' THEN
    
    NEW.plan_type := 'regional';
    NEW.region_code := 'norteamerica';
    NEW.coverage_area := 'Norteamérica';
    
  ELSIF product_name_lower LIKE '%balcanes%' OR
        product_name_lower LIKE '%balkans%' OR
        product_sku_lower LIKE '%balkans%' OR
        product_sku_lower LIKE '%my-balkans%' THEN
    
    NEW.plan_type := 'regional';
    NEW.region_code := 'balcanes';
    NEW.coverage_area := 'Balcanes';
    
  ELSIF product_name_lower LIKE '%caucaso%' OR
        product_name_lower LIKE '%caucasus%' OR
        product_sku_lower LIKE '%caucasus%' OR
        product_sku_lower LIKE '%my-caucasus%' THEN
    
    NEW.plan_type := 'regional';
    NEW.region_code := 'caucaso';
    NEW.coverage_area := 'Cáucaso';
    
  ELSIF product_name_lower LIKE '%asia central%' OR
        product_name_lower LIKE '%central asia%' OR
        product_sku_lower LIKE '%centralasia%' OR
        product_sku_lower LIKE '%my-centralasia%' THEN
    
    NEW.plan_type := 'regional';
    NEW.region_code := 'asia-central';
    NEW.coverage_area := 'Asia Central';
    
  ELSIF product_name_lower LIKE '%oceania%' OR
        product_name_lower LIKE '%oceanía%' OR
        product_sku_lower LIKE '%oceania%' OR
        product_sku_lower LIKE '%my-oceania%' THEN
    
    NEW.plan_type := 'regional';
    NEW.region_code := 'oceania';
    NEW.coverage_area := 'Oceanía';
    
  ELSE
    -- Default to country-specific
    NEW.plan_type := 'country';
    
    -- Try to get country code from first category
    BEGIN
      SELECT slug INTO category_slug
      FROM wc_categories 
      WHERE id = ANY(
        SELECT jsonb_array_elements_text(NEW.category_ids)::integer
      )
      LIMIT 1;
      
      NEW.country_code := category_slug;
      NEW.coverage_area := COALESCE(category_slug, 'Individual');
    EXCEPTION
      WHEN OTHERS THEN
        NEW.coverage_area := 'Individual';
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic classification
DROP TRIGGER IF EXISTS auto_classify_product_trigger ON wc_products;
CREATE TRIGGER auto_classify_product_trigger
  BEFORE INSERT OR UPDATE ON wc_products
  FOR EACH ROW
  EXECUTE FUNCTION auto_classify_product();