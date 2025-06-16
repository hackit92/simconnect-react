/*
  # Populate country_code field from category data

  1. Changes
    - Create mapping function from ISO3 (category slugs) to ISO2 codes
    - Update existing products with country_code based on their categories
    - Update auto_classify_product function to set country_code automatically

  2. Process
    - Map category slugs (ISO3) to ISO2 country codes
    - Update products where plan_type = 'country' with appropriate country_code
    - Ensure future products get country_code set automatically
*/

-- Create function to map ISO3/slug to ISO2 country codes
CREATE OR REPLACE FUNCTION get_iso2_from_slug(slug_input text)
RETURNS text AS $$
BEGIN
  -- Direct mapping for common country slugs to ISO2 codes
  RETURN CASE slug_input
    -- Europe
    WHEN 'spain' THEN 'es'
    WHEN 'espana' THEN 'es'
    WHEN 'españa' THEN 'es'
    WHEN 'france' THEN 'fr'
    WHEN 'francia' THEN 'fr'
    WHEN 'germany' THEN 'de'
    WHEN 'alemania' THEN 'de'
    WHEN 'italy' THEN 'it'
    WHEN 'italia' THEN 'it'
    WHEN 'united-kingdom' THEN 'gb'
    WHEN 'reino-unido' THEN 'gb'
    WHEN 'netherlands' THEN 'nl'
    WHEN 'holanda' THEN 'nl'
    WHEN 'paises-bajos' THEN 'nl'
    WHEN 'portugal' THEN 'pt'
    WHEN 'greece' THEN 'gr'
    WHEN 'grecia' THEN 'gr'
    WHEN 'switzerland' THEN 'ch'
    WHEN 'suiza' THEN 'ch'
    WHEN 'austria' THEN 'at'
    WHEN 'belgium' THEN 'be'
    WHEN 'belgica' THEN 'be'
    WHEN 'denmark' THEN 'dk'
    WHEN 'dinamarca' THEN 'dk'
    WHEN 'finland' THEN 'fi'
    WHEN 'finlandia' THEN 'fi'
    WHEN 'ireland' THEN 'ie'
    WHEN 'irlanda' THEN 'ie'
    WHEN 'norway' THEN 'no'
    WHEN 'noruega' THEN 'no'
    WHEN 'sweden' THEN 'se'
    WHEN 'suecia' THEN 'se'
    WHEN 'poland' THEN 'pl'
    WHEN 'polonia' THEN 'pl'
    WHEN 'czechia' THEN 'cz'
    WHEN 'czech-republic' THEN 'cz'
    WHEN 'republica-checa' THEN 'cz'
    WHEN 'hungary' THEN 'hu'
    WHEN 'hungria' THEN 'hu'
    WHEN 'romania' THEN 'ro'
    WHEN 'rumania' THEN 'ro'
    WHEN 'bulgaria' THEN 'bg'
    WHEN 'croatia' THEN 'hr'
    WHEN 'croacia' THEN 'hr'
    WHEN 'slovenia' THEN 'si'
    WHEN 'eslovenia' THEN 'si'
    WHEN 'slovakia' THEN 'sk'
    WHEN 'eslovaquia' THEN 'sk'
    WHEN 'lithuania' THEN 'lt'
    WHEN 'lituania' THEN 'lt'
    WHEN 'latvia' THEN 'lv'
    WHEN 'letonia' THEN 'lv'
    WHEN 'estonia' THEN 'ee'
    
    -- Americas
    WHEN 'united-states' THEN 'us'
    WHEN 'estados-unidos' THEN 'us'
    WHEN 'canada' THEN 'ca'
    WHEN 'mexico' THEN 'mx'
    WHEN 'mejico' THEN 'mx'
    WHEN 'brazil' THEN 'br'
    WHEN 'brasil' THEN 'br'
    WHEN 'argentina' THEN 'ar'
    WHEN 'chile' THEN 'cl'
    WHEN 'colombia' THEN 'co'
    WHEN 'peru' THEN 'pe'
    WHEN 'venezuela' THEN 've'
    WHEN 'ecuador' THEN 'ec'
    WHEN 'bolivia' THEN 'bo'
    WHEN 'paraguay' THEN 'py'
    WHEN 'uruguay' THEN 'uy'
    WHEN 'costa-rica' THEN 'cr'
    WHEN 'panama' THEN 'pa'
    WHEN 'guatemala' THEN 'gt'
    WHEN 'honduras' THEN 'hn'
    WHEN 'el-salvador' THEN 'sv'
    WHEN 'nicaragua' THEN 'ni'
    WHEN 'cuba' THEN 'cu'
    WHEN 'dominican-republic' THEN 'do'
    WHEN 'republica-dominicana' THEN 'do'
    WHEN 'jamaica' THEN 'jm'
    WHEN 'haiti' THEN 'ht'
    
    -- Asia
    WHEN 'china' THEN 'cn'
    WHEN 'japan' THEN 'jp'
    WHEN 'japon' THEN 'jp'
    WHEN 'south-korea' THEN 'kr'
    WHEN 'corea-del-sur' THEN 'kr'
    WHEN 'india' THEN 'in'
    WHEN 'thailand' THEN 'th'
    WHEN 'tailandia' THEN 'th'
    WHEN 'singapore' THEN 'sg'
    WHEN 'singapur' THEN 'sg'
    WHEN 'malaysia' THEN 'my'
    WHEN 'malasia' THEN 'my'
    WHEN 'indonesia' THEN 'id'
    WHEN 'philippines' THEN 'ph'
    WHEN 'filipinas' THEN 'ph'
    WHEN 'vietnam' THEN 'vn'
    WHEN 'cambodia' THEN 'kh'
    WHEN 'camboya' THEN 'kh'
    WHEN 'laos' THEN 'la'
    WHEN 'myanmar' THEN 'mm'
    WHEN 'bangladesh' THEN 'bd'
    WHEN 'pakistan' THEN 'pk'
    WHEN 'sri-lanka' THEN 'lk'
    
    -- Middle East
    WHEN 'israel' THEN 'il'
    WHEN 'turkey' THEN 'tr'
    WHEN 'turquia' THEN 'tr'
    WHEN 'united-arab-emirates' THEN 'ae'
    WHEN 'emiratos-arabes-unidos' THEN 'ae'
    WHEN 'saudi-arabia' THEN 'sa'
    WHEN 'arabia-saudita' THEN 'sa'
    WHEN 'qatar' THEN 'qa'
    WHEN 'catar' THEN 'qa'
    WHEN 'kuwait' THEN 'kw'
    WHEN 'bahrain' THEN 'bh'
    WHEN 'barein' THEN 'bh'
    WHEN 'oman' THEN 'om'
    WHEN 'jordan' THEN 'jo'
    WHEN 'jordania' THEN 'jo'
    WHEN 'lebanon' THEN 'lb'
    WHEN 'libano' THEN 'lb'
    
    -- Africa
    WHEN 'south-africa' THEN 'za'
    WHEN 'sudafrica' THEN 'za'
    WHEN 'egypt' THEN 'eg'
    WHEN 'egipto' THEN 'eg'
    WHEN 'morocco' THEN 'ma'
    WHEN 'marruecos' THEN 'ma'
    WHEN 'nigeria' THEN 'ng'
    WHEN 'kenya' THEN 'ke'
    WHEN 'ghana' THEN 'gh'
    WHEN 'ethiopia' THEN 'et'
    WHEN 'etiopia' THEN 'et'
    WHEN 'tanzania' THEN 'tz'
    WHEN 'uganda' THEN 'ug'
    WHEN 'zimbabwe' THEN 'zw'
    WHEN 'zambia' THEN 'zm'
    WHEN 'botswana' THEN 'bw'
    WHEN 'namibia' THEN 'na'
    
    -- Oceania
    WHEN 'australia' THEN 'au'
    WHEN 'new-zealand' THEN 'nz'
    WHEN 'nueva-zelanda' THEN 'nz'
    WHEN 'fiji' THEN 'fj'
    WHEN 'papua-new-guinea' THEN 'pg'
    WHEN 'papua-nueva-guinea' THEN 'pg'
    
    -- Russia and Eastern Europe
    WHEN 'russia' THEN 'ru'
    WHEN 'rusia' THEN 'ru'
    WHEN 'ukraine' THEN 'ua'
    WHEN 'ucrania' THEN 'ua'
    WHEN 'belarus' THEN 'by'
    WHEN 'bielorrusia' THEN 'by'
    
    -- Additional countries
    WHEN 'iceland' THEN 'is'
    WHEN 'islandia' THEN 'is'
    WHEN 'luxembourg' THEN 'lu'
    WHEN 'luxemburgo' THEN 'lu'
    WHEN 'malta' THEN 'mt'
    WHEN 'cyprus' THEN 'cy'
    WHEN 'chipre' THEN 'cy'
    
    -- If no match found, try to extract first 2 characters if it looks like an ISO2 code
    ELSE 
      CASE 
        WHEN length(slug_input) = 2 THEN lower(slug_input)
        WHEN length(slug_input) >= 2 AND slug_input ~ '^[a-zA-Z]{2}$' THEN lower(slug_input)
        ELSE NULL
      END
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Update existing products with country_code based on their categories
UPDATE wc_products 
SET country_code = (
  SELECT get_iso2_from_slug(c.slug)
  FROM wc_categories c
  WHERE c.id = ANY(
    SELECT jsonb_array_elements_text(wc_products.category_ids)::integer
  )
  AND get_iso2_from_slug(c.slug) IS NOT NULL
  LIMIT 1
)
WHERE plan_type = 'country' 
  AND (country_code IS NULL OR country_code = '')
  AND category_ids IS NOT NULL 
  AND jsonb_array_length(category_ids) > 0;

-- Update the auto_classify_product function to also set country_code
CREATE OR REPLACE FUNCTION auto_classify_product()
RETURNS TRIGGER AS $$
DECLARE
  product_name_lower text;
  product_sku_lower text;
  category_slug text;
  iso2_code text;
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
    
    -- Try to get country code from first category and map to ISO2
    BEGIN
      SELECT slug INTO category_slug
      FROM wc_categories 
      WHERE id = ANY(
        SELECT jsonb_array_elements_text(NEW.category_ids)::integer
      )
      LIMIT 1;
      
      IF category_slug IS NOT NULL THEN
        iso2_code := get_iso2_from_slug(category_slug);
        NEW.country_code := iso2_code;
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

-- Create a function to update country_code for existing products when categories change
CREATE OR REPLACE FUNCTION update_country_code_from_categories()
RETURNS void AS $$
BEGIN
  UPDATE wc_products 
  SET country_code = (
    SELECT get_iso2_from_slug(c.slug)
    FROM wc_categories c
    WHERE c.id = ANY(
      SELECT jsonb_array_elements_text(wc_products.category_ids)::integer
    )
    AND get_iso2_from_slug(c.slug) IS NOT NULL
    LIMIT 1
  )
  WHERE plan_type = 'country' 
    AND category_ids IS NOT NULL 
    AND jsonb_array_length(category_ids) > 0;
END;
$$ LANGUAGE plpgsql;

-- Run the update function to populate country_code for existing products
SELECT update_country_code_from_categories();