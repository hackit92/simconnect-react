import { createClient } from "npm:@supabase/supabase-js@2";

interface ExternalPlan {
  id: number;
  name: string;
  description?: string;
  price: number;
  currency: string;
  data_gb: number;
  validity_days: number;
  technology: string;
  has_5g: boolean;
  has_lte: boolean;
  plan_type: 'country' | 'regional';
  region_code?: string;
  country_code?: string;
  coverage_countries?: string[];
  active: boolean;
  sku: string;
  images?: Array<{ src: string }>;
  metadata?: Record<string, any>;
}

interface ExternalCategory {
  id: number;
  name: string;
  slug: string;
  parent?: number;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get("SUPABASE_URL") || "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
);

// Get external API configuration
const EXTERNAL_API_URL = "https://api-iot.ucc.systems/api";
const EXTERNAL_API_TOKEN = Deno.env.get("EXTERNAL_API_TOKEN") || "";

async function fetchExternalData(endpoint: string): Promise<any> {
  const response = await fetch(`${EXTERNAL_API_URL}${endpoint}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${EXTERNAL_API_TOKEN}`,
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

function transformExternalPlans(rawPlans: any[]): any[] {
  return rawPlans.map(plan => {
    // Parse price and determine currency-specific prices
    const price = parsePrice(plan.price || plan.regular_price || 0);
    const currency = plan.currency || 'USD';
    
    // Set currency-specific prices
    const regular_price_usd = currency === 'USD' ? price : null;
    const regular_price_eur = currency === 'EUR' ? price : null;
    const regular_price_mxn = currency === 'MXN' ? price : null;

    // Determine plan type and codes
    const planType = determinePlanType(plan);
    const regionCode = planType === 'regional' ? normalizeRegionCode(plan.region_code || plan.region || '') : null;
    const countryCode = planType === 'country' ? (plan.country_code || plan.country) : null;

    // Extract category IDs (we'll populate this after syncing categories)
    const categoryIds: number[] = [];

    return {
      id: plan.id,
      name: plan.name || plan.title || 'Plan sin nombre',
      description: plan.description || '',
      price: price.toString(),
      regular_price: price.toString(),
      sale_price: plan.sale_price || price.toString(),
      images: plan.images || [],
      sku: plan.sku || `external-plan-${plan.id}`,
      metadata: {
        ...plan.metadata,
        external_id: plan.id,
        original_currency: currency,
        sync_date: new Date().toISOString()
      },
      active: plan.active !== false,
      categories: [],
      category_ids: categoryIds,
      // Structured fields
      data_gb: parseDataAmount(plan.data_gb || plan.gb || plan.data || 0),
      validity_days: parseInt(plan.validity_days || plan.days || plan.validity || 30),
      technology: plan.technology || '4G',
      has_5g: Boolean(plan.has_5g || plan.technology?.includes('5G')),
      has_lte: Boolean(plan.has_lte !== false),
      regular_price_usd,
      regular_price_eur,
      regular_price_mxn,
      plan_type: planType,
      region_code: regionCode,
      country_code: countryCode
    };
  });
}

function transformExternalCategories(rawCategories: any[]): any[] {
  return rawCategories.map(category => ({
    id: category.id,
    name: category.name || 'Categoría sin nombre',
    slug: category.slug || category.name?.toLowerCase().replace(/\s+/g, '-') || 'categoria',
    parent: category.parent || null
  }));
}

function extractCategoriesFromPlans(plans: ExternalPlan[]): any[] {
  const categories = new Map<string, any>();
  let categoryId = 10000; // Start with high ID to avoid conflicts

  plans.forEach(plan => {
    // Extract country categories
    if (plan.plan_type === 'country' && plan.country_code) {
      const slug = plan.country_code;
      if (!categories.has(slug)) {
        categories.set(slug, {
          id: categoryId++,
          name: getCountryName(plan.country_code),
          slug: slug,
          parent: null
        });
      }
    }

    // Extract region categories
    if (plan.plan_type === 'regional' && plan.region_code) {
      const slug = normalizeRegionCode(plan.region_code);
      if (!categories.has(slug)) {
        categories.set(slug, {
          id: categoryId++,
          name: getRegionName(slug),
          slug: slug,
          parent: null
        });
      }
    }
  });

  return Array.from(categories.values());
}

function parsePrice(price: any): number {
  if (typeof price === 'number') return price;
  if (typeof price === 'string') {
    const numericPrice = parseFloat(price.replace(/[^0-9.]/g, ''));
    return isNaN(numericPrice) ? 0 : numericPrice;
  }
  return 0;
}

function parseDataAmount(data: any): number {
  if (typeof data === 'number') return data;
  if (typeof data === 'string') {
    const numericData = parseFloat(data.replace(/[^0-9.]/g, ''));
    return isNaN(numericData) ? 0 : numericData;
  }
  return 0;
}

function determinePlanType(plan: any): 'country' | 'regional' {
  if (plan.plan_type) return plan.plan_type;
  if (plan.region_code || plan.region) return 'regional';
  if (plan.country_code || plan.country) return 'country';
  
  // Analyze plan name for regional indicators
  const name = (plan.name || '').toLowerCase();
  const regionalKeywords = [
    'europa', 'europe', 'latinoamerica', 'latin america', 'asia', 'africa',
    'oriente medio', 'middle east', 'caribe', 'caribbean', 'regional'
  ];
  
  if (regionalKeywords.some(keyword => name.includes(keyword))) {
    return 'regional';
  }
  
  return 'country';
}

function getCountryName(countryCode: string): string {
  const countryNames: Record<string, string> = {
    'us': 'Estados Unidos',
    'es': 'España',
    'fr': 'Francia',
    'de': 'Alemania',
    'it': 'Italia',
    'gb': 'Reino Unido',
    'mx': 'México',
    'br': 'Brasil',
    'ar': 'Argentina',
    'cl': 'Chile',
    'co': 'Colombia',
    'pe': 'Perú',
    've': 'Venezuela',
    'ca': 'Canadá',
    'au': 'Australia',
    'jp': 'Japón',
    'cn': 'China',
    'kr': 'Corea del Sur',
    'in': 'India',
    'th': 'Tailandia',
    'sg': 'Singapur',
    'my': 'Malasia',
    'id': 'Indonesia',
    'ph': 'Filipinas',
    'vn': 'Vietnam',
    'tr': 'Turquía',
    'il': 'Israel',
    'ae': 'Emiratos Árabes Unidos',
    'sa': 'Arabia Saudita',
    'za': 'Sudáfrica',
    'eg': 'Egipto',
    'ma': 'Marruecos',
    'ng': 'Nigeria',
    'ke': 'Kenia',
    'gh': 'Ghana',
    'nz': 'Nueva Zelanda',
    'fj': 'Fiyi'
  };
  
  return countryNames[countryCode.toLowerCase()] || countryCode.toUpperCase();
}

function getRegionName(regionCode: string): string {
  const regionNames: Record<string, string> = {
    'latinoamerica': 'Latinoamérica',
    'europa': 'Europa',
    'norteamerica': 'Norteamérica',
    'asia': 'Asia',
    'africa': 'África',
    'oriente-medio': 'Oriente Medio',
    'caribe': 'Caribe',
    'oceania': 'Oceanía',
    'balcanes': 'Balcanes',
    'caucaso': 'Cáucaso',
    'asia-central': 'Asia Central'
  };
  
  return regionNames[regionCode] || regionCode;
}

function normalizeRegionCode(regionInput: string): string {
  if (!regionInput) return '';
  
  const normalized = regionInput.toLowerCase().trim();
  
  // Map various input formats to canonical region codes
  const regionMappings: Record<string, string> = {
    // Latin America variations
    'latin america': 'latinoamerica',
    'latin-america': 'latinoamerica',
    'latinamerica': 'latinoamerica',
    'latino america': 'latinoamerica',
    'latino-america': 'latinoamerica',
    'south america': 'latinoamerica',
    'central america': 'latinoamerica',
    
    // Europe variations
    'europe': 'europa',
    'european union': 'europa',
    'eu': 'europa',
    
    // North America variations
    'north america': 'norteamerica',
    'north-america': 'norteamerica',
    'northamerica': 'norteamerica',
    
    // Middle East variations
    'middle east': 'oriente-medio',
    'middle-east': 'oriente-medio',
    'middleeast': 'oriente-medio',
    'oriente medio': 'oriente-medio',
    'orientemedio': 'oriente-medio',
    
    // Caribbean variations
    'caribbean': 'caribe',
    
    // Balkans variations
    'balkans': 'balcanes',
    'balkan': 'balcanes',
    
    // Caucasus variations
    'caucasus': 'caucaso',
    
    // Central Asia variations
    'central asia': 'asia-central',
    'central-asia': 'asia-central',
    'centralasia': 'asia-central',
    
    // Africa variations
    'africa': 'africa',
    
    // Asia variations
    'asia': 'asia',
    
    // Oceania variations
    'oceania': 'oceania',
    'pacific': 'oceania'
  };
  
  // Return mapped value or original normalized input
  return regionMappings[normalized] || normalized;
}

async function syncCategories(categories: any[]): Promise<Map<string, number>> {
  const slugToIdMap = new Map<string, number>();
  
  if (categories.length === 0) return slugToIdMap;

  // Upsert categories in batches
  const batchSize = 50;
  for (let i = 0; i < categories.length; i += batchSize) {
    const batch = categories.slice(i, i + batchSize);
    
    const { error } = await supabase
      .from('wc_categories')
      .upsert(batch, { onConflict: 'id' });

    if (error) {
      console.error(`Error upserting categories batch ${i/batchSize + 1}:`, error);
      throw error;
    }
  }

  // Build slug to ID mapping
  categories.forEach(category => {
    slugToIdMap.set(category.slug, category.id);
  });

  return slugToIdMap;
}

async function syncProducts(products: any[], categoryMap: Map<string, number>): Promise<void> {
  if (products.length === 0) return;

  // Update category_ids for products based on their plan_type and codes
  const updatedProducts = products.map(product => {
    const categoryIds: number[] = [];
    
    if (product.plan_type === 'country' && product.country_code) {
      const categoryId = categoryMap.get(product.country_code);
      if (categoryId) {
        categoryIds.push(categoryId);
      }
    } else if (product.plan_type === 'regional' && product.region_code) {
      const categoryId = categoryMap.get(product.region_code);
      if (categoryId) {
        categoryIds.push(categoryId);
      }
    }

    return {
      ...product,
      category_ids: categoryIds
    };
  });

  // Get existing products to track which ones to deactivate
  const { data: existingProducts } = await supabase
    .from('wc_products')
    .select('id, sku, metadata')
    .eq('active', true);

  const existingExternalIds = new Set(
    existingProducts
      ?.filter(p => p.metadata?.external_id)
      .map(p => p.metadata.external_id) || []
  );

  const currentExternalIds = new Set(
    updatedProducts.map(p => p.metadata.external_id)
  );

  // Upsert products in batches
  const batchSize = 20;
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < updatedProducts.length; i += batchSize) {
    const batch = updatedProducts.slice(i, i + batchSize);
    
    try {
      const { error } = await supabase
        .from('wc_products')
        .upsert(batch, { onConflict: 'id' });

      if (error) {
        console.error(`Error upserting products batch ${i/batchSize + 1}:`, error);
        errorCount += batch.length;
      } else {
        successCount += batch.length;
        console.log(`Successfully synced products batch ${i/batchSize + 1}`);
      }
    } catch (error) {
      console.error(`Error processing products batch ${i/batchSize + 1}:`, error);
      errorCount += batch.length;
    }

    // Small delay between batches
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Deactivate products that no longer exist in external API
  const idsToDeactivate = Array.from(existingExternalIds).filter(
    id => !currentExternalIds.has(id)
  );

  if (idsToDeactivate.length > 0) {
    const { error: deactivateError } = await supabase
      .from('wc_products')
      .update({ active: false })
      .in('metadata->external_id', idsToDeactivate);

    if (deactivateError) {
      console.error('Error deactivating products:', deactivateError);
    } else {
      console.log(`Deactivated ${idsToDeactivate.length} products`);
    }
  }

  console.log(`Sync completed: ${successCount} success, ${errorCount} errors, ${idsToDeactivate.length} deactivated`);
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
    if (!EXTERNAL_API_TOKEN) {
      throw new Error("EXTERNAL_API_TOKEN environment variable is required");
    }

    console.log("Starting external API synchronization...");

    // Fetch data from external API
    console.log("Fetching plans from external API...");
    const plansResponse = await fetchExternalData("/plans/public/yes");
    
    // Handle different response formats
    let rawPlans: any[] = [];
    if (Array.isArray(plansResponse)) {
      rawPlans = plansResponse;
    } else if (plansResponse.data) {
      // Handle nested data structure: data.records
      if (plansResponse.data.records && Array.isArray(plansResponse.data.records)) {
        rawPlans = plansResponse.data.records;
      } else if (Array.isArray(plansResponse.data)) {
        rawPlans = plansResponse.data;
      }
    } else if (plansResponse.plans && Array.isArray(plansResponse.plans)) {
      rawPlans = plansResponse.plans;
    } else {
      console.warn('Unexpected plans API response format:', plansResponse);
      rawPlans = [];
    }

    console.log(`Fetched ${rawPlans.length} plans from external API`);

    // Transform plans
    const transformedPlans = transformExternalPlans(rawPlans);

    // Try to fetch categories, fallback to extracting from plans
    let categories: any[] = [];
    try {
      console.log("Fetching categories from external API...");
      const categoriesResponse = await fetchExternalData("/categories/public/yes");
      
      if (Array.isArray(categoriesResponse)) {
        categories = transformExternalCategories(categoriesResponse);
      } else if (categoriesResponse.data && Array.isArray(categoriesResponse.data)) {
        categories = transformExternalCategories(categoriesResponse.data);
      } else {
        throw new Error("Categories endpoint returned unexpected format");
      }
    } catch (error) {
      console.log("Categories endpoint not available, extracting from plans...");
      categories = extractCategoriesFromPlans(rawPlans);
    }

    console.log(`Processing ${categories.length} categories`);

    // Sync categories first
    const categoryMap = await syncCategories(categories);
    console.log("Categories synchronized successfully");

    // Sync products
    await syncProducts(transformedPlans, categoryMap);
    console.log("Products synchronized successfully");

    const stats = {
      plans_processed: transformedPlans.length,
      categories_processed: categories.length,
      sync_timestamp: new Date().toISOString()
    };

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'External API synchronization completed successfully',
        stats 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Synchronization error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
        status: 500
      }
    );
  }
});