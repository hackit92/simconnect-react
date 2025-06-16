import { createClient } from "npm:@supabase/supabase-js@2";
import WooCommerceRestApi from "npm:@woocommerce/woocommerce-rest-api@1.0.1";

interface WooCommerceCategory {
  id: number;
  name: string;
  slug: string;
  parent: number | null;
}

interface WooCommerceProduct {
  id: number;
  name: string;
  description: string;
  price: string;
  regular_price: string;
  sale_price: string;
  images: any[];
  sku: string;
  meta_data: Array<{ key: string; value: any }>;
  categories: Array<{ id: number }>;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Initialize WooCommerce API client
const api = new WooCommerceRestApi.default({
  url: Deno.env.get("WC_URL") || "",
  consumerKey: Deno.env.get("WC_CONSUMER_KEY") || "",
  consumerSecret: Deno.env.get("WC_CONSUMER_SECRET") || "",
  version: "wc/v3"
});

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get("SUPABASE_URL") || "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
);

// Helper function to process product metadata
function processMetadata(metaData: Array<{ key: string; value: any }> = []): Record<string, any> {
  const metadata: Record<string, any> = {};
  for (const item of metaData) {
    if (item.key && item.value !== undefined) {
      metadata[item.key] = item.value;
    }
  }
  return metadata;
}

// Helper function to extract structured data from metadata
function extractStructuredData(metadata: Record<string, any>, productName: string, productSku: string) {
  const result = {
    data_gb: null as number | null,
    validity_days: null as number | null,
    technology: '4G' as string,
    has_5g: false as boolean,
    has_lte: true as boolean,
    regular_price_usd: null as number | null,
    regular_price_eur: null as number | null,
    regular_price_mxn: null as number | null
  };

  // Extract GB data
  if (metadata['_data_quota_gb']) {
    const gb = parseFloat(String(metadata['_data_quota_gb']));
    if (!isNaN(gb) && gb > 0) result.data_gb = gb;
  } else if (metadata['gb']) {
    const gb = parseFloat(String(metadata['gb']));
    if (!isNaN(gb) && gb > 0) result.data_gb = gb;
  } else if (metadata['_gb']) {
    const gb = parseFloat(String(metadata['_gb']));
    if (!isNaN(gb) && gb > 0) result.data_gb = gb;
  } else if (metadata['data_amount']) {
    const gb = parseFloat(String(metadata['data_amount']));
    if (!isNaN(gb) && gb > 0) result.data_gb = gb;
  }

  // Extract validity days
  if (metadata['_validity_days']) {
    const days = parseInt(String(metadata['_validity_days']));
    if (!isNaN(days) && days > 0 && days <= 365) result.validity_days = days;
  } else if (metadata['validity_days']) {
    const days = parseInt(String(metadata['validity_days']));
    if (!isNaN(days) && days > 0 && days <= 365) result.validity_days = days;
  } else if (metadata['days']) {
    const days = parseInt(String(metadata['days']));
    if (!isNaN(days) && days > 0 && days <= 365) result.validity_days = days;
  }

  // Extract technology information
  if (metadata['_connectivity_5g'] === 'yes') {
    result.technology = '5G';
    result.has_5g = true;
    result.has_lte = true;
  } else if (metadata['_connectivity_lte'] === 'yes') {
    result.technology = '4G/LTE';
    result.has_5g = false;
    result.has_lte = true;
  } else if (metadata['technology']) {
    const tech = String(metadata['technology']).toUpperCase();
    if (tech.includes('5G')) {
      result.technology = '5G';
      result.has_5g = true;
      result.has_lte = true;
    } else if (tech.includes('4G') || tech.includes('LTE')) {
      result.technology = '4G/LTE';
      result.has_5g = false;
      result.has_lte = true;
    } else if (tech.includes('3G')) {
      result.technology = '3G';
      result.has_5g = false;
      result.has_lte = false;
    } else if (tech.includes('2G')) {
      result.technology = '2G';
      result.has_5g = false;
      result.has_lte = false;
    }
  } else {
    // Check product name for technology indicators
    const nameLower = productName.toLowerCase();
    if (nameLower.includes('5g')) {
      result.technology = '5G';
      result.has_5g = true;
      result.has_lte = true;
    } else if (nameLower.includes('4g') || nameLower.includes('lte')) {
      result.technology = '4G/LTE';
      result.has_5g = false;
      result.has_lte = true;
    } else if (nameLower.includes('3g')) {
      result.technology = '3G';
      result.has_5g = false;
      result.has_lte = false;
    }
  }

  // Extract prices from metadata
  if (metadata['_regular_price_wmcp']) {
    try {
      const priceData = JSON.parse(String(metadata['_regular_price_wmcp']));
      if (priceData.USD) result.regular_price_usd = parseFloat(String(priceData.USD));
      if (priceData.EUR) result.regular_price_eur = parseFloat(String(priceData.EUR));
      if (priceData.MXN) result.regular_price_mxn = parseFloat(String(priceData.MXN));
    } catch (error) {
      // Try individual price fields
      if (metadata['_woocs_regular_price_USD']) {
        result.regular_price_usd = parseFloat(String(metadata['_woocs_regular_price_USD']));
      }
      if (metadata['_woocs_regular_price_EUR']) {
        result.regular_price_eur = parseFloat(String(metadata['_woocs_regular_price_EUR']));
      }
      if (metadata['_woocs_regular_price_MXN']) {
        result.regular_price_mxn = parseFloat(String(metadata['_woocs_regular_price_MXN']));
      }
    }
  } else {
    // Try individual price fields
    if (metadata['_woocs_regular_price_USD']) {
      result.regular_price_usd = parseFloat(String(metadata['_woocs_regular_price_USD']));
    }
    if (metadata['_woocs_regular_price_EUR']) {
      result.regular_price_eur = parseFloat(String(metadata['_woocs_regular_price_EUR']));
    }
    if (metadata['_woocs_regular_price_MXN']) {
      result.regular_price_mxn = parseFloat(String(metadata['_woocs_regular_price_MXN']));
    }
  }

  return result;
}

Deno.serve(async (req) => {
  try {
    if (req.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          ...corsHeaders,
          "Access-Control-Allow-Methods": "POST, OPTIONS",
        },
        status: 204
      });
    }
    
    // Validate required environment variables
    const requiredEnvVars = {
      "WC_URL": Deno.env.get("WC_URL"),
      "WC_CONSUMER_KEY": Deno.env.get("WC_CONSUMER_KEY"),
      "WC_CONSUMER_SECRET": Deno.env.get("WC_CONSUMER_SECRET")
    };

    const missingVars = Object.entries(requiredEnvVars)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingVars.join(", ")}`);
    }

    // Get existing products from Supabase
    const { data: existingProducts, error: fetchError } = await supabase
      .from('wc_products')
      .select('id, sku, metadata');

    if (fetchError) {
      throw new Error(`Failed to fetch existing products: ${fetchError.message}`);
    }

    const existingProductsMap = new Map(
      existingProducts?.map(p => [p.sku, p]) || []
    );

    // Get existing categories from Supabase
    const { data: existingCategories, error: categoriesFetchError } = await supabase
      .from('wc_categories')
      .select('id');

    if (categoriesFetchError) {
      throw new Error(`Failed to fetch existing categories: ${categoriesFetchError.message}`);
    }

    const existingCategoryIds = new Set(existingCategories?.map(c => c.id) || []);

    // Sync categories
    let allCategories: WooCommerceCategory[] = [];
    let hasMoreCategories = true;
    let categoryPage = 1;
    
    while (hasMoreCategories) {
      const { data: categories } = await api.get('products/categories', {
        per_page: 100,
        page: categoryPage
      });
      
      if (!categories || categories.length === 0) {
        hasMoreCategories = false;
        break;
      }
      
      allCategories = allCategories.concat(categories);
      console.log(`Fetched ${categories.length} categories from page ${categoryPage}`);
      categoryPage++;
      
      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Insert or update categories in batches
    const categoryBatchSize = 50;
    for (let i = 0; i < allCategories.length; i += categoryBatchSize) {
      const batch = allCategories.slice(i, i + categoryBatchSize);
      
      try {
        const { error: upsertError } = await supabase
          .from('wc_categories')
          .upsert(
            batch.map(category => ({
              id: category.id,
              name: category.name,
              slug: category.slug,
              parent: category.parent || null
            })),
            { onConflict: 'id' }
          );

        if (upsertError) {
          console.error(`Error upserting categories batch ${i/categoryBatchSize + 1}:`, upsertError);
        } else {
          console.log(`Successfully synced categories batch ${i/categoryBatchSize + 1}`);
        }
      } catch (error) {
        console.error(`Error processing categories batch ${i/categoryBatchSize + 1}:`, error);
      }

      // Add a small delay between batches
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Sync products with pagination
    let productPage = 1;
    let hasMore = true;
    const processedSkus = new Set();
    const perPage = 100;
    const batchSize = 20;
    const processedProducts = new Set();

    const stats = {
      success: 0,
      errors: 0,
      skipped: 0,
      updated: 0,
      maxPages: 100,
      created: 0,
      deactivated: 0
    };

    while (hasMore) {
      const { data: products } = await api.get('products', {
        per_page: perPage,
        page: productPage,
        status: 'publish',
        orderby: 'id',
        order: 'asc'
      });

      if (!products || products.length === 0) {
        hasMore = false;
        break;
      }
      
      console.log(`Processing page ${productPage} with ${products.length} products`);

      for (let i = 0; i < products.length; i += batchSize) {
        const batch = products.slice(i, i + batchSize);
        const batchData = [];

        for (const product of batch as WooCommerceProduct[]) {
          if (!product.sku) {
            console.log(`Skipping product ${product.id} - No SKU`);
            stats.skipped++;
            continue;
          }
          
          if (processedSkus.has(product.sku)) {
            console.log(`Skipping duplicate SKU ${product.sku}`);
            stats.skipped++;
            continue;
          }
          
          processedSkus.add(product.sku);
          processedProducts.add(product.id);

          const existingProduct = existingProductsMap.get(product.sku);
          const action = existingProduct ? 'Updating' : 'Creating';
          console.log(`${action} product ${product.sku}`);
          
          const newMetadata = processMetadata(product.meta_data);
          const metadata = existingProduct
            ? { ...existingProduct.metadata, ...newMetadata }
            : newMetadata;
          
          // Extract category IDs from the WooCommerce categories array
          const categoryIds = (product.categories || [])
            .map(cat => cat.id)
            .filter(id => typeof id === 'number');
          
          // Extract structured data from metadata for direct database storage
          const extractedData = extractStructuredData(newMetadata, product.name, product.sku);
          
          batchData.push({
            id: product.id,
            name: product.name,
            description: product.description,
            price: product.price,
            regular_price: product.regular_price,
            sale_price: product.sale_price,
            images: product.images,
            sku: product.sku,
            metadata,
            active: true,
            categories: [],
            category_ids: categoryIds,
            // Add structured fields
            data_gb: extractedData.data_gb,
            validity_days: extractedData.validity_days,
            technology: extractedData.technology,
            has_5g: extractedData.has_5g,
            has_lte: extractedData.has_lte,
            regular_price_usd: extractedData.regular_price_usd,
            regular_price_eur: extractedData.regular_price_eur,
            regular_price_mxn: extractedData.regular_price_mxn
          });
          
          // Note: plan_type, region_code, country_code, and coverage_area 
          // will be automatically set by the auto_classify_product trigger
        }

        try {
          if (batchData.length === 0) continue;
          console.log(`Inserting batch of ${batchData.length} products`);

          const { error } = await supabase
            .from('wc_products')
            .upsert(batchData, { onConflict: 'sku' });

          if (error) {
            console.error('Batch insert error:', error);
            stats.errors += batchData.length;
            throw error;
          }
          stats.success += batchData.length;
          for (const product of batchData) {
            if (existingProductsMap.has(product.sku)) {
              stats.updated++;
            } else {
              stats.created++;
            }
          }
          console.log(`Successfully processed batch of ${batchData.length} products`);
        } catch (error) {
          console.error(`Error processing batch: ${error.message}. Retrying in 2 seconds...`);
          await new Promise(resolve => setTimeout(resolve, 2000));

          try {
            const { error: retryError } = await supabase
              .from('wc_products')
              .upsert(batchData, { onConflict: 'sku' });

            if (retryError) {
              console.error(`Retry failed:`, retryError);
              stats.errors += batchData.length;
              throw retryError;
            }
          } catch (retryError) {
            console.error(`Retry failed:`, retryError);
            stats.errors += batchData.length;
            continue;
          }
        }

        // Reduced delay between batches
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      productPage++;
      
      if (productPage > stats.maxPages) {
        console.log(`Reached maximum page limit of ${stats.maxPages}`);
        hasMore = false;
        break;
      }
      
      // Reduced delay between pages
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    // Deactivate products that no longer exist in WooCommerce
    try {
      // Get all active products
      const { data: activeProducts, error: fetchError } = await supabase
        .from('wc_products')
        .select('sku')
        .eq('active', true);

      if (fetchError) throw fetchError;

      // Find SKUs to deactivate
      const skusToDeactivate = activeProducts
        ?.filter(p => p.sku && !processedSkus.has(p.sku))
        .map(p => p.sku) || [];

      if (skusToDeactivate.length > 0) {
        // Deactivate in batches of 100
        for (let i = 0; i < skusToDeactivate.length; i += 100) {
          const batch = skusToDeactivate.slice(i, i + 100);
          const { error } = await supabase
            .from('wc_products')
            .update({ active: false })
            .in('sku', batch);

          if (error) {
            console.error(`Error deactivating batch ${i/100 + 1}:`, error);
          } else {
            stats.deactivated += batch.length;
          }
        }
      }
    } catch (error) {
      console.error('Error during deactivation process:', error);
    }
    
    return new Response(
      JSON.stringify({ message: 'Sync completed successfully', stats }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});