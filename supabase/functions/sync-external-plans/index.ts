import { createClient } from "npm:@supabase/supabase-js@2";

interface ExternalPlan {
  plan_type_id: number;
  identifier: string;
  name: { es: string; en: string };
  description: { es: string; en: string };
  coverage: 'country' | 'regional';
  status: string;
  created_at: string;
  updated_at: string;
  data_quota_mb: number;
  validity_days: number;
  countries_enabled: number;
  prices: Array<{
    currency: string;
    amount: number;
    [key: string]: any;
  }>;
  countries: string[]; // ISO3 codes like ["ABW"]
  connectivity: {
    "5g": "yes" | "no";
    lte: "yes" | "no";
  };
  provider_details: {
    plan_type_id: number;
    data_quota_mb: number;
    validity_days: number;
    countries_enabled: string;
    uid: string;
    policy_id: number;
    policy_description: string;
  };
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

// Function to convert ISO3 country codes to ISO2
function iso3ToIso2(iso3Code: string): string {
  const iso3ToIso2Map: Record<string, string> = {
    'ABW': 'aw', // Aruba
    'AFG': 'af', // Afghanistan
    'AGO': 'ao', // Angola
    'AIA': 'ai', // Anguilla
    'ALA': 'ax', // Åland Islands
    'ALB': 'al', // Albania
    'AND': 'ad', // Andorra
    'ARE': 'ae', // United Arab Emirates
    'ARG': 'ar', // Argentina
    'ARM': 'am', // Armenia
    'ASM': 'as', // American Samoa
    'ATA': 'aq', // Antarctica
    'ATF': 'tf', // French Southern Territories
    'ATG': 'ag', // Antigua and Barbuda
    'AUS': 'au', // Australia
    'AUT': 'at', // Austria
    'AZE': 'az', // Azerbaijan
    'BDI': 'bi', // Burundi
    'BEL': 'be', // Belgium
    'BEN': 'bj', // Benin
    'BES': 'bq', // Bonaire, Sint Eustatius and Saba
    'BFA': 'bf', // Burkina Faso
    'BGD': 'bd', // Bangladesh
    'BGR': 'bg', // Bulgaria
    'BHR': 'bh', // Bahrain
    'BHS': 'bs', // Bahamas
    'BIH': 'ba', // Bosnia and Herzegovina
    'BLM': 'bl', // Saint Barthélemy
    'BLR': 'by', // Belarus
    'BLZ': 'bz', // Belize
    'BMU': 'bm', // Bermuda
    'BOL': 'bo', // Bolivia
    'BRA': 'br', // Brazil
    'BRB': 'bb', // Barbados
    'BRN': 'bn', // Brunei Darussalam
    'BTN': 'bt', // Bhutan
    'BVT': 'bv', // Bouvet Island
    'BWA': 'bw', // Botswana
    'CAF': 'cf', // Central African Republic
    'CAN': 'ca', // Canada
    'CCK': 'cc', // Cocos (Keeling) Islands
    'CHE': 'ch', // Switzerland
    'CHL': 'cl', // Chile
    'CHN': 'cn', // China
    'CIV': 'ci', // Côte d'Ivoire
    'CMR': 'cm', // Cameroon
    'COD': 'cd', // Congo (Democratic Republic)
    'COG': 'cg', // Congo
    'COK': 'ck', // Cook Islands
    'COL': 'co', // Colombia
    'COM': 'km', // Comoros
    'CPV': 'cv', // Cabo Verde
    'CRI': 'cr', // Costa Rica
    'CUB': 'cu', // Cuba
    'CUW': 'cw', // Curaçao
    'CXR': 'cx', // Christmas Island
    'CYM': 'ky', // Cayman Islands
    'CYP': 'cy', // Cyprus
    'CZE': 'cz', // Czechia
    'DEU': 'de', // Germany
    'DJI': 'dj', // Djibouti
    'DMA': 'dm', // Dominica
    'DNK': 'dk', // Denmark
    'DOM': 'do', // Dominican Republic
    'DZA': 'dz', // Algeria
    'ECU': 'ec', // Ecuador
    'EGY': 'eg', // Egypt
    'ERI': 'er', // Eritrea
    'ESH': 'eh', // Western Sahara
    'ESP': 'es', // Spain
    'EST': 'ee', // Estonia
    'ETH': 'et', // Ethiopia
    'FIN': 'fi', // Finland
    'FJI': 'fj', // Fiji
    'FLK': 'fk', // Falkland Islands
    'FRA': 'fr', // France
    'FRO': 'fo', // Faroe Islands
    'FSM': 'fm', // Micronesia
    'GAB': 'ga', // Gabon
    'GBR': 'gb', // United Kingdom
    'GEO': 'ge', // Georgia
    'GGY': 'gg', // Guernsey
    'GHA': 'gh', // Ghana
    'GIB': 'gi', // Gibraltar
    'GIN': 'gn', // Guinea
    'GLP': 'gp', // Guadeloupe
    'GMB': 'gm', // Gambia
    'GNB': 'gw', // Guinea-Bissau
    'GNQ': 'gq', // Equatorial Guinea
    'GRC': 'gr', // Greece
    'GRD': 'gd', // Grenada
    'GRL': 'gl', // Greenland
    'GTM': 'gt', // Guatemala
    'GUF': 'gf', // French Guiana
    'GUM': 'gu', // Guam
    'GUY': 'gy', // Guyana
    'HKG': 'hk', // Hong Kong
    'HMD': 'hm', // Heard Island and McDonald Islands
    'HND': 'hn', // Honduras
    'HRV': 'hr', // Croatia
    'HTI': 'ht', // Haiti
    'HUN': 'hu', // Hungary
    'IDN': 'id', // Indonesia
    'IMN': 'im', // Isle of Man
    'IND': 'in', // India
    'IOT': 'io', // British Indian Ocean Territory
    'IRL': 'ie', // Ireland
    'IRN': 'ir', // Iran
    'IRQ': 'iq', // Iraq
    'ISL': 'is', // Iceland
    'ISR': 'il', // Israel
    'ITA': 'it', // Italy
    'JAM': 'jm', // Jamaica
    'JEY': 'je', // Jersey
    'JOR': 'jo', // Jordan
    'JPN': 'jp', // Japan
    'KAZ': 'kz', // Kazakhstan
    'KEN': 'ke', // Kenya
    'KGZ': 'kg', // Kyrgyzstan
    'KHM': 'kh', // Cambodia
    'KIR': 'ki', // Kiribati
    'KNA': 'kn', // Saint Kitts and Nevis
    'KOR': 'kr', // Korea (Republic of)
    'KWT': 'kw', // Kuwait
    'LAO': 'la', // Lao People's Democratic Republic
    'LBN': 'lb', // Lebanon
    'LBR': 'lr', // Liberia
    'LBY': 'ly', // Libya
    'LCA': 'lc', // Saint Lucia
    'LIE': 'li', // Liechtenstein
    'LKA': 'lk', // Sri Lanka
    'LSO': 'ls', // Lesotho
    'LTU': 'lt', // Lithuania
    'LUX': 'lu', // Luxembourg
    'LVA': 'lv', // Latvia
    'MAC': 'mo', // Macao
    'MAF': 'mf', // Saint Martin (French part)
    'MAR': 'ma', // Morocco
    'MCO': 'mc', // Monaco
    'MDA': 'md', // Moldova
    'MDG': 'mg', // Madagascar
    'MDV': 'mv', // Maldives
    'MEX': 'mx', // Mexico
    'MHL': 'mh', // Marshall Islands
    'MKD': 'mk', // North Macedonia
    'MLI': 'ml', // Mali
    'MLT': 'mt', // Malta
    'MMR': 'mm', // Myanmar
    'MNE': 'me', // Montenegro
    'MNG': 'mn', // Mongolia
    'MNP': 'mp', // Northern Mariana Islands
    'MOZ': 'mz', // Mozambique
    'MRT': 'mr', // Mauritania
    'MSR': 'ms', // Montserrat
    'MTQ': 'mq', // Martinique
    'MUS': 'mu', // Mauritius
    'MWI': 'mw', // Malawi
    'MYS': 'my', // Malaysia
    'MYT': 'yt', // Mayotte
    'NAM': 'na', // Namibia
    'NCL': 'nc', // New Caledonia
    'NER': 'ne', // Niger
    'NFK': 'nf', // Norfolk Island
    'NGA': 'ng', // Nigeria
    'NIC': 'ni', // Nicaragua
    'NIU': 'nu', // Niue
    'NLD': 'nl', // Netherlands
    'NOR': 'no', // Norway
    'NPL': 'np', // Nepal
    'NRU': 'nr', // Nauru
    'NZL': 'nz', // New Zealand
    'OMN': 'om', // Oman
    'PAK': 'pk', // Pakistan
    'PAN': 'pa', // Panama
    'PCN': 'pn', // Pitcairn
    'PER': 'pe', // Peru
    'PHL': 'ph', // Philippines
    'PLW': 'pw', // Palau
    'PNG': 'pg', // Papua New Guinea
    'POL': 'pl', // Poland
    'PRI': 'pr', // Puerto Rico
    'PRK': 'kp', // Korea (Democratic People's Republic of)
    'PRT': 'pt', // Portugal
    'PRY': 'py', // Paraguay
    'PSE': 'ps', // Palestine, State of
    'PYF': 'pf', // French Polynesia
    'QAT': 'qa', // Qatar
    'REU': 're', // Réunion
    'ROU': 'ro', // Romania
    'RUS': 'ru', // Russian Federation
    'RWA': 'rw', // Rwanda
    'SAU': 'sa', // Saudi Arabia
    'SDN': 'sd', // Sudan
    'SEN': 'sn', // Senegal
    'SGP': 'sg', // Singapore
    'SGS': 'gs', // South Georgia and the South Sandwich Islands
    'SHN': 'sh', // Saint Helena, Ascension and Tristan da Cunha
    'SJM': 'sj', // Svalbard and Jan Mayen
    'SLB': 'sb', // Solomon Islands
    'SLE': 'sl', // Sierra Leone
    'SLV': 'sv', // El Salvador
    'SMR': 'sm', // San Marino
    'SOM': 'so', // Somalia
    'SPM': 'pm', // Saint Pierre and Miquelon
    'SRB': 'rs', // Serbia
    'SSD': 'ss', // South Sudan
    'STP': 'st', // Sao Tome and Principe
    'SUR': 'sr', // Suriname
    'SVK': 'sk', // Slovakia
    'SVN': 'si', // Slovenia
    'SWE': 'se', // Sweden
    'SWZ': 'sz', // Eswatini
    'SXM': 'sx', // Sint Maarten (Dutch part)
    'SYC': 'sc', // Seychelles
    'SYR': 'sy', // Syrian Arab Republic
    'TCA': 'tc', // Turks and Caicos Islands
    'TCD': 'td', // Chad
    'TGO': 'tg', // Togo
    'THA': 'th', // Thailand
    'TJK': 'tj', // Tajikistan
    'TKL': 'tk', // Tokelau
    'TKM': 'tm', // Turkmenistan
    'TLS': 'tl', // Timor-Leste
    'TON': 'to', // Tonga
    'TTO': 'tt', // Trinidad and Tobago
    'TUN': 'tn', // Tunisia
    'TUR': 'tr', // Turkey
    'TUV': 'tv', // Tuvalu
    'TWN': 'tw', // Taiwan
    'TZA': 'tz', // Tanzania
    'UGA': 'ug', // Uganda
    'UKR': 'ua', // Ukraine
    'UMI': 'um', // United States Minor Outlying Islands
    'URY': 'uy', // Uruguay
    'USA': 'us', // United States of America
    'UZB': 'uz', // Uzbekistan
    'VAT': 'va', // Holy See
    'VCT': 'vc', // Saint Vincent and the Grenadines
    'VEN': 've', // Venezuela
    'VGB': 'vg', // Virgin Islands (British)
    'VIR': 'vi', // Virgin Islands (U.S.)
    'VNM': 'vn', // Viet Nam
    'VUT': 'vu', // Vanuatu
    'WLF': 'wf', // Wallis and Futuna
    'WSM': 'ws', // Samoa
    'XKX': 'xk', // Kosovo
    'YEM': 'ye', // Yemen
    'ZAF': 'za', // South Africa
    'ZMB': 'zm', // Zambia
    'ZWE': 'zw', // Zimbabwe
  };

  return iso3ToIso2Map[iso3Code.toUpperCase()] || iso3Code.toLowerCase();
}

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
    // Extract prices from the prices array
    const prices = plan.prices || [];
    let regular_price_usd: number | null = null;
    let regular_price_eur: number | null = null;
    let regular_price_mxn: number | null = null;

    prices.forEach((price: any) => {
      if (price.currency === 'USD') {
        regular_price_usd = parseFloat(price.amount) || null;
      } else if (price.currency === 'EUR') {
        regular_price_eur = parseFloat(price.amount) || null;
      } else if (price.currency === 'MXN') {
        regular_price_mxn = parseFloat(price.amount) || null;
      }
    });

    // Determine plan type and codes
    const planType = determinePlanType(plan);
    const regionCode = planType === 'regional' ? normalizeRegionCode(plan.region_code || plan.region || '') : null;
    
    // Get country code from the first country in the countries array
    let countryCode: string | null = null;
    if (planType === 'country' && plan.countries && Array.isArray(plan.countries) && plan.countries.length > 0) {
      countryCode = iso3ToIso2(plan.countries[0]);
    }

    // Extract category IDs (we'll populate this after syncing categories)
    const categoryIds: number[] = [];

    // Convert data from MB to GB
    const dataGb = plan.data_quota_mb ? plan.data_quota_mb / 1024 : null;

    // Extract technology information
    const connectivity = plan.connectivity || {};
    const has5g = connectivity["5g"] === "yes";
    const hasLte = connectivity.lte === "yes";
    let technology = '4G';
    
    if (has5g) {
      technology = '5G';
    } else if (hasLte) {
      technology = '4G/LTE';
    } else {
      technology = '3G';
    }

    // Use the first available price as the main price
    const mainPrice = regular_price_usd || regular_price_eur || regular_price_mxn || 0;

    return {
      id: plan.plan_type_id,
      name: plan.name?.es || plan.name?.en || 'Plan sin nombre',
      description: plan.description?.es || plan.description?.en || '',
      price: mainPrice.toString(),
      regular_price: mainPrice.toString(),
      sale_price: mainPrice.toString(),
      images: [],
      sku: plan.identifier || `external-plan-${plan.plan_type_id}`,
      metadata: {
        external_id: plan.plan_type_id,
        identifier: plan.identifier,
        name_en: plan.name?.en,
        description_en: plan.description?.en,
        provider_details: plan.provider_details,
        countries_iso3: plan.countries,
        sync_date: new Date().toISOString()
      },
      active: plan.status === 'active',
      categories: [],
      category_ids: categoryIds,
      // Structured fields
      data_gb: dataGb,
      validity_days: plan.validity_days || null,
      technology,
      has_5g: has5g,
      has_lte: hasLte,
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
    // Extract country categories from ISO3 codes
    if (plan.coverage === 'country' && plan.countries && Array.isArray(plan.countries)) {
      plan.countries.forEach(iso3Code => {
        const iso2Code = iso3ToIso2(iso3Code);
        const slug = iso2Code;
        
        if (!categories.has(slug)) {
          categories.set(slug, {
            id: categoryId++,
            name: getCountryNameFromIso3(iso3Code),
            slug: slug,
            parent: null
          });
        }
      });
    }

    // Extract region categories
    if (plan.coverage === 'regional') {
      // Try to determine region from plan name or identifier
      const planName = (plan.name?.es || plan.name?.en || '').toLowerCase();
      const identifier = (plan.identifier || '').toLowerCase();
      
      let regionCode = '';
      if (planName.includes('latin') || planName.includes('latam') || identifier.includes('latam')) {
        regionCode = 'latinoamerica';
      } else if (planName.includes('europ') || identifier.includes('europe')) {
        regionCode = 'europa';
      } else if (planName.includes('asia') || identifier.includes('asia')) {
        regionCode = 'asia';
      } else if (planName.includes('africa') || identifier.includes('africa')) {
        regionCode = 'africa';
      } else if (planName.includes('middle') || planName.includes('medio') || identifier.includes('middle')) {
        regionCode = 'oriente-medio';
      } else if (planName.includes('carib') || identifier.includes('carib')) {
        regionCode = 'caribe';
      } else if (planName.includes('north') || planName.includes('norte') || identifier.includes('north')) {
        regionCode = 'norteamerica';
      } else if (planName.includes('ocean') || identifier.includes('ocean')) {
        regionCode = 'oceania';
      }
      
      if (regionCode && !categories.has(regionCode)) {
        categories.set(regionCode, {
          id: categoryId++,
          name: getRegionName(regionCode),
          slug: regionCode,
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
  if (plan.coverage) {
    return plan.coverage === 'country' ? 'country' : 'regional';
  }
  
  if (plan.plan_type) return plan.plan_type;
  if (plan.region_code || plan.region) return 'regional';
  if (plan.country_code || plan.country) return 'country';
  
  // Analyze plan name for regional indicators - handle object structure
  const planName = plan.name?.es || plan.name?.en || '';
  const name = (typeof planName === 'string' ? planName : '').toLowerCase();
  const regionalKeywords = [
    'europa', 'europe', 'latinoamerica', 'latin america', 'asia', 'africa',
    'oriente medio', 'middle east', 'caribe', 'caribbean', 'regional'
  ];
  
  if (regionalKeywords.some(keyword => name.includes(keyword))) {
    return 'regional';
  }
  
  return 'country';
}

function getCountryNameFromIso3(iso3Code: string): string {
  const countryNames: Record<string, string> = {
    'ABW': 'Aruba',
    'AFG': 'Afganistán',
    'AGO': 'Angola',
    'AIA': 'Anguila',
    'ALA': 'Islas Åland',
    'ALB': 'Albania',
    'AND': 'Andorra',
    'ARE': 'Emiratos Árabes Unidos',
    'ARG': 'Argentina',
    'ARM': 'Armenia',
    'ASM': 'Samoa Americana',
    'ATA': 'Antártida',
    'ATF': 'Territorios Franceses del Sur',
    'ATG': 'Antigua y Barbuda',
    'AUS': 'Australia',
    'AUT': 'Austria',
    'AZE': 'Azerbaiyán',
    'BDI': 'Burundi',
    'BEL': 'Bélgica',
    'BEN': 'Benín',
    'BES': 'Bonaire, San Eustaquio y Saba',
    'BFA': 'Burkina Faso',
    'BGD': 'Bangladés',
    'BGR': 'Bulgaria',
    'BHR': 'Baréin',
    'BHS': 'Bahamas',
    'BIH': 'Bosnia y Herzegovina',
    'BLM': 'San Bartolomé',
    'BLR': 'Bielorrusia',
    'BLZ': 'Belice',
    'BMU': 'Bermudas',
    'BOL': 'Bolivia',
    'BRA': 'Brasil',
    'BRB': 'Barbados',
    'BRN': 'Brunéi',
    'BTN': 'Bután',
    'BVT': 'Isla Bouvet',
    'BWA': 'Botsuana',
    'CAF': 'República Centroafricana',
    'CAN': 'Canadá',
    'CCK': 'Islas Cocos',
    'CHE': 'Suiza',
    'CHL': 'Chile',
    'CHN': 'China',
    'CIV': 'Costa de Marfil',
    'CMR': 'Camerún',
    'COD': 'República Democrática del Congo',
    'COG': 'Congo',
    'COK': 'Islas Cook',
    'COL': 'Colombia',
    'COM': 'Comoras',
    'CPV': 'Cabo Verde',
    'CRI': 'Costa Rica',
    'CUB': 'Cuba',
    'CUW': 'Curazao',
    'CXR': 'Isla de Navidad',
    'CYM': 'Islas Caimán',
    'CYP': 'Chipre',
    'CZE': 'Chequia',
    'DEU': 'Alemania',
    'DJI': 'Yibuti',
    'DMA': 'Dominica',
    'DNK': 'Dinamarca',
    'DOM': 'República Dominicana',
    'DZA': 'Argelia',
    'ECU': 'Ecuador',
    'EGY': 'Egipto',
    'ERI': 'Eritrea',
    'ESH': 'Sahara Occidental',
    'ESP': 'España',
    'EST': 'Estonia',
    'ETH': 'Etiopía',
    'FIN': 'Finlandia',
    'FJI': 'Fiyi',
    'FLK': 'Islas Malvinas',
    'FRA': 'Francia',
    'FRO': 'Islas Feroe',
    'FSM': 'Micronesia',
    'GAB': 'Gabón',
    'GBR': 'Reino Unido',
    'GEO': 'Georgia',
    'GGY': 'Guernesey',
    'GHA': 'Ghana',
    'GIB': 'Gibraltar',
    'GIN': 'Guinea',
    'GLP': 'Guadalupe',
    'GMB': 'Gambia',
    'GNB': 'Guinea-Bisáu',
    'GNQ': 'Guinea Ecuatorial',
    'GRC': 'Grecia',
    'GRD': 'Granada',
    'GRL': 'Groenlandia',
    'GTM': 'Guatemala',
    'GUF': 'Guayana Francesa',
    'GUM': 'Guam',
    'GUY': 'Guyana',
    'HKG': 'Hong Kong',
    'HMD': 'Isla Heard y Islas McDonald',
    'HND': 'Honduras',
    'HRV': 'Croacia',
    'HTI': 'Haití',
    'HUN': 'Hungría',
    'IDN': 'Indonesia',
    'IMN': 'Isla de Man',
    'IND': 'India',
    'IOT': 'Territorio Británico del Océano Índico',
    'IRL': 'Irlanda',
    'IRN': 'Irán',
    'IRQ': 'Irak',
    'ISL': 'Islandia',
    'ISR': 'Israel',
    'ITA': 'Italia',
    'JAM': 'Jamaica',
    'JEY': 'Jersey',
    'JOR': 'Jordania',
    'JPN': 'Japón',
    'KAZ': 'Kazajistán',
    'KEN': 'Kenia',
    'KGZ': 'Kirguistán',
    'KHM': 'Camboya',
    'KIR': 'Kiribati',
    'KNA': 'San Cristóbal y Nieves',
    'KOR': 'Corea del Sur',
    'KWT': 'Kuwait',
    'LAO': 'Laos',
    'LBN': 'Líbano',
    'LBR': 'Liberia',
    'LBY': 'Libia',
    'LCA': 'Santa Lucía',
    'LIE': 'Liechtenstein',
    'LKA': 'Sri Lanka',
    'LSO': 'Lesoto',
    'LTU': 'Lituania',
    'LUX': 'Luxemburgo',
    'LVA': 'Letonia',
    'MAC': 'Macao',
    'MAF': 'San Martín',
    'MAR': 'Marruecos',
    'MCO': 'Mónaco',
    'MDA': 'Moldavia',
    'MDG': 'Madagascar',
    'MDV': 'Maldivas',
    'MEX': 'México',
    'MHL': 'Islas Marshall',
    'MKD': 'Macedonia del Norte',
    'MLI': 'Malí',
    'MLT': 'Malta',
    'MMR': 'Myanmar',
    'MNE': 'Montenegro',
    'MNG': 'Mongolia',
    'MNP': 'Islas Marianas del Norte',
    'MOZ': 'Mozambique',
    'MRT': 'Mauritania',
    'MSR': 'Montserrat',
    'MTQ': 'Martinica',
    'MUS': 'Mauricio',
    'MWI': 'Malaui',
    'MYS': 'Malasia',
    'MYT': 'Mayotte',
    'NAM': 'Namibia',
    'NCL': 'Nueva Caledonia',
    'NER': 'Níger',
    'NFK': 'Isla Norfolk',
    'NGA': 'Nigeria',
    'NIC': 'Nicaragua',
    'NIU': 'Niue',
    'NLD': 'Países Bajos',
    'NOR': 'Noruega',
    'NPL': 'Nepal',
    'NRU': 'Nauru',
    'NZL': 'Nueva Zelanda',
    'OMN': 'Omán',
    'PAK': 'Pakistán',
    'PAN': 'Panamá',
    'PCN': 'Islas Pitcairn',
    'PER': 'Perú',
    'PHL': 'Filipinas',
    'PLW': 'Palaos',
    'PNG': 'Papúa Nueva Guinea',
    'POL': 'Polonia',
    'PRI': 'Puerto Rico',
    'PRK': 'Corea del Norte',
    'PRT': 'Portugal',
    'PRY': 'Paraguay',
    'PSE': 'Palestina',
    'PYF': 'Polinesia Francesa',
    'QAT': 'Catar',
    'REU': 'Reunión',
    'ROU': 'Rumanía',
    'RUS': 'Rusia',
    'RWA': 'Ruanda',
    'SAU': 'Arabia Saudita',
    'SDN': 'Sudán',
    'SEN': 'Senegal',
    'SGP': 'Singapur',
    'SGS': 'Georgia del Sur e Islas Sandwich del Sur',
    'SHN': 'Santa Elena',
    'SJM': 'Svalbard y Jan Mayen',
    'SLB': 'Islas Salomón',
    'SLE': 'Sierra Leona',
    'SLV': 'El Salvador',
    'SMR': 'San Marino',
    'SOM': 'Somalia',
    'SPM': 'San Pedro y Miquelón',
    'SRB': 'Serbia',
    'SSD': 'Sudán del Sur',
    'STP': 'Santo Tomé y Príncipe',
    'SUR': 'Surinam',
    'SVK': 'Eslovaquia',
    'SVN': 'Eslovenia',
    'SWE': 'Suecia',
    'SWZ': 'Esuatini',
    'SXM': 'San Martín',
    'SYC': 'Seychelles',
    'SYR': 'Siria',
    'TCA': 'Islas Turcas y Caicos',
    'TCD': 'Chad',
    'TGO': 'Togo',
    'THA': 'Tailandia',
    'TJK': 'Tayikistán',
    'TKL': 'Tokelau',
    'TKM': 'Turkmenistán',
    'TLS': 'Timor Oriental',
    'TON': 'Tonga',
    'TTO': 'Trinidad y Tobago',
    'TUN': 'Túnez',
    'TUR': 'Turquía',
    'TUV': 'Tuvalu',
    'TWN': 'Taiwán',
    'TZA': 'Tanzania',
    'UGA': 'Uganda',
    'UKR': 'Ucrania',
    'UMI': 'Islas Ultramarinas de Estados Unidos',
    'URY': 'Uruguay',
    'USA': 'Estados Unidos',
    'UZB': 'Uzbekistán',
    'VAT': 'Ciudad del Vaticano',
    'VCT': 'San Vicente y las Granadinas',
    'VEN': 'Venezuela',
    'VGB': 'Islas Vírgenes Británicas',
    'VIR': 'Islas Vírgenes de los Estados Unidos',
    'VNM': 'Vietnam',
    'VUT': 'Vanuatu',
    'WLF': 'Wallis y Futuna',
    'WSM': 'Samoa',
    'XKX': 'Kosovo',
    'YEM': 'Yemen',
    'ZAF': 'Sudáfrica',
    'ZMB': 'Zambia',
    'ZWE': 'Zimbabue'
  };
  
  return countryNames[iso3Code.toUpperCase()] || iso3Code;
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
        .upsert(batch, { onConflict: 'sku' });

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