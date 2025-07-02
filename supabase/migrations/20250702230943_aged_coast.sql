/*
  # Unificar regiones Cáucaso y Asia Central

  1. Cambios
    - Actualizar productos de 'caucaso' para usar 'asia-central'
    - Actualizar productos de 'asia-central' para mantener el código unificado
    - Actualizar función de clasificación automática
    - Actualizar mapeos de región

  2. Proceso
    - Migrar todos los productos de 'caucaso' a 'asia-central'
    - Actualizar las funciones de clasificación para usar 'asia-central' como región unificada
    - Mantener compatibilidad con ambos nombres en la clasificación
*/

-- Actualizar productos existentes que usan 'caucaso' para usar 'asia-central'
UPDATE wc_products 
SET region_code = 'asia-central'
WHERE plan_type = 'regional' 
  AND region_code = 'caucaso';

-- Actualizar la función de clasificación automática para unificar las regiones
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
    
  -- Unificar Cáucaso y Asia Central bajo 'asia-central'
  ELSIF product_name_lower LIKE '%caucaso%' OR
        product_name_lower LIKE '%caucasus%' OR
        product_sku_lower LIKE '%caucasus%' OR
        product_sku_lower LIKE '%my-caucasus%' OR
        product_name_lower LIKE '%asia central%' OR
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
      
      IF category_slug IS NOT NULL THEN
        NEW.country_code := get_iso2_from_slug(category_slug);
      END IF;
    EXCEPTION
      WHEN OTHERS THEN
        -- No specific country code available
        NULL;
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;