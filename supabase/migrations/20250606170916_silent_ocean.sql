/*
  # Drop coverage_area column from wc_products

  1. Changes
    - Remove coverage_area column from wc_products table
    - Update auto_classify_product function to not set coverage_area
    - Update classify_existing_products function to not set coverage_area

  2. Reasoning
    - coverage_area is redundant since we have structured data in:
      - plan_type (regional/country)
      - region_code (for regional plans)
      - country_code (for country plans)
      - category_ids (for country associations)
*/

-- Drop the coverage_area column
ALTER TABLE wc_products DROP COLUMN IF EXISTS coverage_area;

-- Update the auto_classify_product function to remove coverage_area references
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
  
  -- Check for regional patterns
  IF product_sku_lower LIKE '%my-latam%' OR 
     product_sku_lower LIKE '%latam%' OR
     product_name_lower LIKE '%latinoamerica%' OR
     product_name_lower LIKE '%latin america%' OR
     product_name_lower LIKE '%america latina%' THEN
    
    NEW.plan_type := 'regional';
    NEW.region_code := 'latinoamerica';
    
  ELSIF product_name_lower LIKE '%europa%' OR
        product_name_lower LIKE '%europe%' OR
        product_sku_lower LIKE '%europe%' OR
        product_sku_lower LIKE '%my-europe%' THEN
    
    NEW.plan_type := 'regional';
    NEW.region_code := 'europa';
    
  ELSIF product_name_lower LIKE '%oriente medio%' OR
        product_name_lower LIKE '%middle east%' OR
        product_sku_lower LIKE '%middle-east%' OR
        product_sku_lower LIKE '%middleeast%' OR
        product_sku_lower LIKE '%my-middleeast%' THEN
    
    NEW.plan_type := 'regional';
    NEW.region_code := 'oriente-medio';
    
  ELSIF product_name_lower LIKE '%caribe%' OR
        product_name_lower LIKE '%caribbean%' OR
        product_sku_lower LIKE '%caribbean%' OR
        product_sku_lower LIKE '%my-caribbean%' THEN
    
    NEW.plan_type := 'regional';
    NEW.region_code := 'caribe';
    
  ELSIF product_name_lower LIKE '%asia%' OR
        product_sku_lower LIKE '%asia%' OR
        product_sku_lower LIKE '%my-asia%' THEN
    
    NEW.plan_type := 'regional';
    NEW.region_code := 'asia';
    
  ELSIF product_name_lower LIKE '%africa%' OR
        product_name_lower LIKE '%áfrica%' OR
        product_sku_lower LIKE '%africa%' OR
        product_sku_lower LIKE '%my-africa%' THEN
    
    NEW.plan_type := 'regional';
    NEW.region_code := 'africa';
    
  ELSIF product_name_lower LIKE '%norteamerica%' OR
        product_name_lower LIKE '%north america%' OR
        product_name_lower LIKE '%america del norte%' OR
        product_sku_lower LIKE '%northamerica%' OR
        product_sku_lower LIKE '%my-northamerica%' THEN
    
    NEW.plan_type := 'regional';
    NEW.region_code := 'norteamerica';
    
  ELSIF product_name_lower LIKE '%balcanes%' OR
        product_name_lower LIKE '%balkans%' OR
        product_sku_lower LIKE '%balkans%' OR
        product_sku_lower LIKE '%my-balkans%' THEN
    
    NEW.plan_type := 'regional';
    NEW.region_code := 'balcanes';
    
  ELSIF product_name_lower LIKE '%caucaso%' OR
        product_name_lower LIKE '%caucasus%' OR
        product_sku_lower LIKE '%caucasus%' OR
        product_sku_lower LIKE '%my-caucasus%' THEN
    
    NEW.plan_type := 'regional';
    NEW.region_code := 'caucaso';
    
  ELSIF product_name_lower LIKE '%asia central%' OR
        product_name_lower LIKE '%central asia%' OR
        product_sku_lower LIKE '%centralasia%' OR
        product_sku_lower LIKE '%my-centralasia%' THEN
    
    NEW.plan_type := 'regional';
    NEW.region_code := 'asia-central';
    
  ELSIF product_name_lower LIKE '%oceania%' OR
        product_name_lower LIKE '%oceanía%' OR
        product_sku_lower LIKE '%oceania%' OR
        product_sku_lower LIKE '%my-oceania%' THEN
    
    NEW.plan_type := 'regional';
    NEW.region_code := 'oceania';
    
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
    EXCEPTION
      WHEN OTHERS THEN
        -- No specific country code available
        NULL;
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update the classify_existing_products function to remove coverage_area references
CREATE OR REPLACE FUNCTION classify_existing_products()
RETURNS void AS $$
DECLARE
  product_record RECORD;
  product_name_lower text;
  product_sku_lower text;
BEGIN
  -- Loop through all products and classify them
  FOR product_record IN 
    SELECT id, name, sku, metadata, category_ids
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
          region_code = 'latinoamerica'
      WHERE id = product_record.id;
      
    -- Check for Europa regional plans
    ELSIF product_name_lower LIKE '%europa%' OR
          product_name_lower LIKE '%europe%' OR
          product_sku_lower LIKE '%europe%' OR
          product_sku_lower LIKE '%my-europe%' THEN
      
      UPDATE wc_products 
      SET plan_type = 'regional',
          region_code = 'europa'
      WHERE id = product_record.id;
      
    -- Check for Oriente Medio regional plans
    ELSIF product_name_lower LIKE '%oriente medio%' OR
          product_name_lower LIKE '%middle east%' OR
          product_sku_lower LIKE '%middle-east%' OR
          product_sku_lower LIKE '%middleeast%' OR
          product_sku_lower LIKE '%my-middleeast%' THEN
      
      UPDATE wc_products 
      SET plan_type = 'regional',
          region_code = 'oriente-medio'
      WHERE id = product_record.id;
      
    -- Check for Caribe regional plans
    ELSIF product_name_lower LIKE '%caribe%' OR
          product_name_lower LIKE '%caribbean%' OR
          product_sku_lower LIKE '%caribbean%' OR
          product_sku_lower LIKE '%my-caribbean%' THEN
      
      UPDATE wc_products 
      SET plan_type = 'regional',
          region_code = 'caribe'
      WHERE id = product_record.id;
      
    -- Check for Asia regional plans
    ELSIF product_name_lower LIKE '%asia%' OR
          product_sku_lower LIKE '%asia%' OR
          product_sku_lower LIKE '%my-asia%' THEN
      
      UPDATE wc_products 
      SET plan_type = 'regional',
          region_code = 'asia'
      WHERE id = product_record.id;
      
    -- Check for África regional plans
    ELSIF product_name_lower LIKE '%africa%' OR
          product_name_lower LIKE '%áfrica%' OR
          product_sku_lower LIKE '%africa%' OR
          product_sku_lower LIKE '%my-africa%' THEN
      
      UPDATE wc_products 
      SET plan_type = 'regional',
          region_code = 'africa'
      WHERE id = product_record.id;
      
    -- Check for Norteamérica regional plans
    ELSIF product_name_lower LIKE '%norteamerica%' OR
          product_name_lower LIKE '%north america%' OR
          product_name_lower LIKE '%america del norte%' OR
          product_sku_lower LIKE '%northamerica%' OR
          product_sku_lower LIKE '%my-northamerica%' THEN
      
      UPDATE wc_products 
      SET plan_type = 'regional',
          region_code = 'norteamerica'
      WHERE id = product_record.id;
      
    -- Check for Balcanes regional plans
    ELSIF product_name_lower LIKE '%balcanes%' OR
          product_name_lower LIKE '%balkans%' OR
          product_sku_lower LIKE '%balkans%' OR
          product_sku_lower LIKE '%my-balkans%' THEN
      
      UPDATE wc_products 
      SET plan_type = 'regional',
          region_code = 'balcanes'
      WHERE id = product_record.id;
      
    -- Check for Cáucaso regional plans
    ELSIF product_name_lower LIKE '%caucaso%' OR
          product_name_lower LIKE '%caucasus%' OR
          product_sku_lower LIKE '%caucasus%' OR
          product_sku_lower LIKE '%my-caucasus%' THEN
      
      UPDATE wc_products 
      SET plan_type = 'regional',
          region_code = 'caucaso'
      WHERE id = product_record.id;
      
    -- Check for Asia Central regional plans
    ELSIF product_name_lower LIKE '%asia central%' OR
          product_name_lower LIKE '%central asia%' OR
          product_sku_lower LIKE '%centralasia%' OR
          product_sku_lower LIKE '%my-centralasia%' THEN
      
      UPDATE wc_products 
      SET plan_type = 'regional',
          region_code = 'asia-central'
      WHERE id = product_record.id;
      
    -- Check for Oceanía regional plans
    ELSIF product_name_lower LIKE '%oceania%' OR
          product_name_lower LIKE '%oceanía%' OR
          product_sku_lower LIKE '%oceania%' OR
          product_sku_lower LIKE '%my-oceania%' THEN
      
      UPDATE wc_products 
      SET plan_type = 'regional',
          region_code = 'oceania'
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
            country_code = category_slug
        WHERE id = product_record.id;
      EXCEPTION
        WHEN OTHERS THEN
          -- Fallback: mark as country without specific code
          UPDATE wc_products 
          SET plan_type = 'country'
          WHERE id = product_record.id;
      END;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;