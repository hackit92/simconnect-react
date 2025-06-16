-- Add new columns for structured data
ALTER TABLE wc_products 
ADD COLUMN IF NOT EXISTS data_gb numeric,
ADD COLUMN IF NOT EXISTS validity_days integer,
ADD COLUMN IF NOT EXISTS technology text DEFAULT '4G',
ADD COLUMN IF NOT EXISTS has_5g boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS has_lte boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS regular_price_usd numeric,
ADD COLUMN IF NOT EXISTS regular_price_eur numeric,
ADD COLUMN IF NOT EXISTS regular_price_mxn numeric;

-- Create indexes for efficient filtering
CREATE INDEX IF NOT EXISTS wc_products_data_gb_idx ON wc_products(data_gb);
CREATE INDEX IF NOT EXISTS wc_products_validity_days_idx ON wc_products(validity_days);
CREATE INDEX IF NOT EXISTS wc_products_technology_idx ON wc_products(technology);
CREATE INDEX IF NOT EXISTS wc_products_has_5g_idx ON wc_products(has_5g);
CREATE INDEX IF NOT EXISTS wc_products_has_lte_idx ON wc_products(has_lte);
CREATE INDEX IF NOT EXISTS wc_products_regular_price_usd_idx ON wc_products(regular_price_usd);

-- Create function to extract and populate structured data from metadata
CREATE OR REPLACE FUNCTION extract_metadata_to_fields()
RETURNS void AS $$
DECLARE
  product_record RECORD;
  gb_value numeric;
  days_value integer;
  tech_value text;
  has_5g_value boolean;
  has_lte_value boolean;
  price_usd numeric;
  price_eur numeric;
  price_mxn numeric;
BEGIN
  -- Loop through all products and extract metadata
  FOR product_record IN 
    SELECT id, name, sku, metadata, regular_price
    FROM wc_products 
    WHERE metadata IS NOT NULL
  LOOP
    -- Initialize values
    gb_value := NULL;
    days_value := NULL;
    tech_value := '4G';
    has_5g_value := false;
    has_lte_value := true;
    price_usd := NULL;
    price_eur := NULL;
    price_mxn := NULL;
    
    -- Extract GB data
    IF product_record.metadata ? '_data_quota_gb' THEN
      BEGIN
        gb_value := (product_record.metadata->>'_data_quota_gb')::numeric;
      EXCEPTION WHEN OTHERS THEN
        gb_value := NULL;
      END;
    ELSIF product_record.metadata ? 'gb' THEN
      BEGIN
        gb_value := (product_record.metadata->>'gb')::numeric;
      EXCEPTION WHEN OTHERS THEN
        gb_value := NULL;
      END;
    ELSIF product_record.metadata ? '_gb' THEN
      BEGIN
        gb_value := (product_record.metadata->>'_gb')::numeric;
      EXCEPTION WHEN OTHERS THEN
        gb_value := NULL;
      END;
    ELSIF product_record.metadata ? 'data_amount' THEN
      BEGIN
        gb_value := (product_record.metadata->>'data_amount')::numeric;
      EXCEPTION WHEN OTHERS THEN
        gb_value := NULL;
      END;
    END IF;
    
    -- Extract validity days
    IF product_record.metadata ? '_validity_days' THEN
      BEGIN
        days_value := (product_record.metadata->>'_validity_days')::integer;
      EXCEPTION WHEN OTHERS THEN
        days_value := NULL;
      END;
    ELSIF product_record.metadata ? 'validity_days' THEN
      BEGIN
        days_value := (product_record.metadata->>'validity_days')::integer;
      EXCEPTION WHEN OTHERS THEN
        days_value := NULL;
      END;
    ELSIF product_record.metadata ? 'days' THEN
      BEGIN
        days_value := (product_record.metadata->>'days')::integer;
      EXCEPTION WHEN OTHERS THEN
        days_value := NULL;
      END;
    END IF;
    
    -- Extract technology information
    IF product_record.metadata ? '_connectivity_5g' AND 
       (product_record.metadata->>'_connectivity_5g') = 'yes' THEN
      tech_value := '5G';
      has_5g_value := true;
      has_lte_value := true;
    ELSIF product_record.metadata ? '_connectivity_lte' AND 
          (product_record.metadata->>'_connectivity_lte') = 'yes' THEN
      tech_value := '4G/LTE';
      has_5g_value := false;
      has_lte_value := true;
    ELSIF product_record.metadata ? 'technology' THEN
      CASE upper(product_record.metadata->>'technology')
        WHEN '5G' THEN 
          tech_value := '5G';
          has_5g_value := true;
          has_lte_value := true;
        WHEN '4G', 'LTE', '4G/LTE' THEN 
          tech_value := '4G/LTE';
          has_5g_value := false;
          has_lte_value := true;
        WHEN '3G' THEN 
          tech_value := '3G';
          has_5g_value := false;
          has_lte_value := false;
        WHEN '2G' THEN 
          tech_value := '2G';
          has_5g_value := false;
          has_lte_value := false;
        ELSE 
          tech_value := '4G';
          has_5g_value := false;
          has_lte_value := true;
      END CASE;
    ELSE
      -- Check product name for technology indicators
      IF lower(product_record.name) LIKE '%5g%' THEN
        tech_value := '5G';
        has_5g_value := true;
        has_lte_value := true;
      ELSIF lower(product_record.name) LIKE '%4g%' OR lower(product_record.name) LIKE '%lte%' THEN
        tech_value := '4G/LTE';
        has_5g_value := false;
        has_lte_value := true;
      ELSIF lower(product_record.name) LIKE '%3g%' THEN
        tech_value := '3G';
        has_5g_value := false;
        has_lte_value := false;
      END IF;
    END IF;
    
    -- Extract prices from metadata
    IF product_record.metadata ? '_regular_price_wmcp' THEN
      BEGIN
        DECLARE
          price_json jsonb;
        BEGIN
          price_json := (product_record.metadata->>'_regular_price_wmcp')::jsonb;
          IF price_json ? 'USD' THEN
            price_usd := (price_json->>'USD')::numeric;
          END IF;
          IF price_json ? 'EUR' THEN
            price_eur := (price_json->>'EUR')::numeric;
          END IF;
          IF price_json ? 'MXN' THEN
            price_mxn := (price_json->>'MXN')::numeric;
          END IF;
        EXCEPTION WHEN OTHERS THEN
          -- Try individual price fields
          IF product_record.metadata ? '_woocs_regular_price_USD' THEN
            price_usd := (product_record.metadata->>'_woocs_regular_price_USD')::numeric;
          END IF;
          IF product_record.metadata ? '_woocs_regular_price_EUR' THEN
            price_eur := (product_record.metadata->>'_woocs_regular_price_EUR')::numeric;
          END IF;
          IF product_record.metadata ? '_woocs_regular_price_MXN' THEN
            price_mxn := (product_record.metadata->>'_woocs_regular_price_MXN')::numeric;
          END IF;
        END;
      EXCEPTION WHEN OTHERS THEN
        NULL;
      END;
    ELSE
      -- Try individual price fields
      IF product_record.metadata ? '_woocs_regular_price_USD' THEN
        BEGIN
          price_usd := (product_record.metadata->>'_woocs_regular_price_USD')::numeric;
        EXCEPTION WHEN OTHERS THEN
          price_usd := NULL;
        END;
      END IF;
      IF product_record.metadata ? '_woocs_regular_price_EUR' THEN
        BEGIN
          price_eur := (product_record.metadata->>'_woocs_regular_price_EUR')::numeric;
        EXCEPTION WHEN OTHERS THEN
          price_eur := NULL;
        END;
      END IF;
      IF product_record.metadata ? '_woocs_regular_price_MXN' THEN
        BEGIN
          price_mxn := (product_record.metadata->>'_woocs_regular_price_MXN')::numeric;
        EXCEPTION WHEN OTHERS THEN
          price_mxn := NULL;
        END;
      END IF;
    END IF;
    
    -- Update the product with extracted values
    UPDATE wc_products 
    SET 
      data_gb = gb_value,
      validity_days = days_value,
      technology = tech_value,
      has_5g = has_5g_value,
      has_lte = has_lte_value,
      regular_price_usd = price_usd,
      regular_price_eur = price_eur,
      regular_price_mxn = price_mxn
    WHERE id = product_record.id;
    
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create trigger function to automatically extract metadata for new/updated products
CREATE OR REPLACE FUNCTION extract_metadata_on_upsert()
RETURNS TRIGGER AS $$
DECLARE
  gb_value numeric;
  days_value integer;
  tech_value text;
  has_5g_value boolean;
  has_lte_value boolean;
  price_usd numeric;
  price_eur numeric;
  price_mxn numeric;
BEGIN
  -- Initialize values
  gb_value := NEW.data_gb;
  days_value := NEW.validity_days;
  tech_value := COALESCE(NEW.technology, '4G');
  has_5g_value := COALESCE(NEW.has_5g, false);
  has_lte_value := COALESCE(NEW.has_lte, true);
  price_usd := NEW.regular_price_usd;
  price_eur := NEW.regular_price_eur;
  price_mxn := NEW.regular_price_mxn;
  
  -- Only extract if metadata exists and fields are not already set
  IF NEW.metadata IS NOT NULL THEN
    
    -- Extract GB data if not already set
    IF gb_value IS NULL THEN
      IF NEW.metadata ? '_data_quota_gb' THEN
        BEGIN
          gb_value := (NEW.metadata->>'_data_quota_gb')::numeric;
        EXCEPTION WHEN OTHERS THEN
          gb_value := NULL;
        END;
      ELSIF NEW.metadata ? 'gb' THEN
        BEGIN
          gb_value := (NEW.metadata->>'gb')::numeric;
        EXCEPTION WHEN OTHERS THEN
          gb_value := NULL;
        END;
      ELSIF NEW.metadata ? '_gb' THEN
        BEGIN
          gb_value := (NEW.metadata->>'_gb')::numeric;
        EXCEPTION WHEN OTHERS THEN
          gb_value := NULL;
        END;
      ELSIF NEW.metadata ? 'data_amount' THEN
        BEGIN
          gb_value := (NEW.metadata->>'data_amount')::numeric;
        EXCEPTION WHEN OTHERS THEN
          gb_value := NULL;
        END;
      END IF;
    END IF;
    
    -- Extract validity days if not already set
    IF days_value IS NULL THEN
      IF NEW.metadata ? '_validity_days' THEN
        BEGIN
          days_value := (NEW.metadata->>'_validity_days')::integer;
        EXCEPTION WHEN OTHERS THEN
          days_value := NULL;
        END;
      ELSIF NEW.metadata ? 'validity_days' THEN
        BEGIN
          days_value := (NEW.metadata->>'validity_days')::integer;
        EXCEPTION WHEN OTHERS THEN
          days_value := NULL;
        END;
      ELSIF NEW.metadata ? 'days' THEN
        BEGIN
          days_value := (NEW.metadata->>'days')::integer;
        EXCEPTION WHEN OTHERS THEN
          days_value := NULL;
        END;
      END IF;
    END IF;
    
    -- Extract technology information if not already set properly
    IF NEW.technology IS NULL OR NEW.technology = '4G' THEN
      IF NEW.metadata ? '_connectivity_5g' AND 
         (NEW.metadata->>'_connectivity_5g') = 'yes' THEN
        tech_value := '5G';
        has_5g_value := true;
        has_lte_value := true;
      ELSIF NEW.metadata ? '_connectivity_lte' AND 
            (NEW.metadata->>'_connectivity_lte') = 'yes' THEN
        tech_value := '4G/LTE';
        has_5g_value := false;
        has_lte_value := true;
      ELSIF NEW.metadata ? 'technology' THEN
        CASE upper(NEW.metadata->>'technology')
          WHEN '5G' THEN 
            tech_value := '5G';
            has_5g_value := true;
            has_lte_value := true;
          WHEN '4G', 'LTE', '4G/LTE' THEN 
            tech_value := '4G/LTE';
            has_5g_value := false;
            has_lte_value := true;
          WHEN '3G' THEN 
            tech_value := '3G';
            has_5g_value := false;
            has_lte_value := false;
          WHEN '2G' THEN 
            tech_value := '2G';
            has_5g_value := false;
            has_lte_value := false;
          ELSE 
            tech_value := '4G';
            has_5g_value := false;
            has_lte_value := true;
        END CASE;
      ELSE
        -- Check product name for technology indicators
        IF lower(NEW.name) LIKE '%5g%' THEN
          tech_value := '5G';
          has_5g_value := true;
          has_lte_value := true;
        ELSIF lower(NEW.name) LIKE '%4g%' OR lower(NEW.name) LIKE '%lte%' THEN
          tech_value := '4G/LTE';
          has_5g_value := false;
          has_lte_value := true;
        ELSIF lower(NEW.name) LIKE '%3g%' THEN
          tech_value := '3G';
          has_5g_value := false;
          has_lte_value := false;
        END IF;
      END IF;
    END IF;
    
    -- Extract prices from metadata if not already set
    IF price_usd IS NULL OR price_eur IS NULL OR price_mxn IS NULL THEN
      IF NEW.metadata ? '_regular_price_wmcp' THEN
        BEGIN
          DECLARE
            price_json jsonb;
          BEGIN
            price_json := (NEW.metadata->>'_regular_price_wmcp')::jsonb;
            IF price_usd IS NULL AND price_json ? 'USD' THEN
              price_usd := (price_json->>'USD')::numeric;
            END IF;
            IF price_eur IS NULL AND price_json ? 'EUR' THEN
              price_eur := (price_json->>'EUR')::numeric;
            END IF;
            IF price_mxn IS NULL AND price_json ? 'MXN' THEN
              price_mxn := (price_json->>'MXN')::numeric;
            END IF;
          EXCEPTION WHEN OTHERS THEN
            -- Try individual price fields
            IF price_usd IS NULL AND NEW.metadata ? '_woocs_regular_price_USD' THEN
              price_usd := (NEW.metadata->>'_woocs_regular_price_USD')::numeric;
            END IF;
            IF price_eur IS NULL AND NEW.metadata ? '_woocs_regular_price_EUR' THEN
              price_eur := (NEW.metadata->>'_woocs_regular_price_EUR')::numeric;
            END IF;
            IF price_mxn IS NULL AND NEW.metadata ? '_woocs_regular_price_MXN' THEN
              price_mxn := (NEW.metadata->>'_woocs_regular_price_MXN')::numeric;
            END IF;
          END;
        EXCEPTION WHEN OTHERS THEN
          NULL;
        END;
      ELSE
        -- Try individual price fields
        IF price_usd IS NULL AND NEW.metadata ? '_woocs_regular_price_USD' THEN
          BEGIN
            price_usd := (NEW.metadata->>'_woocs_regular_price_USD')::numeric;
          EXCEPTION WHEN OTHERS THEN
            price_usd := NULL;
          END;
        END IF;
        IF price_eur IS NULL AND NEW.metadata ? '_woocs_regular_price_EUR' THEN
          BEGIN
            price_eur := (NEW.metadata->>'_woocs_regular_price_EUR')::numeric;
          EXCEPTION WHEN OTHERS THEN
            price_eur := NULL;
          END;
        END IF;
        IF price_mxn IS NULL AND NEW.metadata ? '_woocs_regular_price_MXN' THEN
          BEGIN
            price_mxn := (NEW.metadata->>'_woocs_regular_price_MXN')::numeric;
          EXCEPTION WHEN OTHERS THEN
            price_mxn := NULL;
          END;
        END IF;
      END IF;
    END IF;
    
  END IF;
  
  -- Set the extracted values
  NEW.data_gb := gb_value;
  NEW.validity_days := days_value;
  NEW.technology := tech_value;
  NEW.has_5g := has_5g_value;
  NEW.has_lte := has_lte_value;
  NEW.regular_price_usd := price_usd;
  NEW.regular_price_eur := price_eur;
  NEW.regular_price_mxn := price_mxn;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic metadata extraction
DROP TRIGGER IF EXISTS extract_metadata_trigger ON wc_products;
CREATE TRIGGER extract_metadata_trigger
  BEFORE INSERT OR UPDATE ON wc_products
  FOR EACH ROW
  EXECUTE FUNCTION extract_metadata_on_upsert();

-- Run the extraction function to populate existing products
SELECT extract_metadata_to_fields();