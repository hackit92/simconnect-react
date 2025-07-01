import { useState, useEffect, useCallback } from 'react';
import { supabase, type Product, type Category } from '../../../lib/supabase';
import { countryUtils } from '../../../lib/countries/countryUtils';

interface UsePlansParams {
  searchTerm: string;
  selectedCategory: number | undefined;
  selectedRegion: string | undefined;
  allCategories: Category[];
  currentPage: number;
  pageSize: number;
}

interface UsePlansReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function usePlans({ 
  searchTerm, 
  selectedCategory, 
  selectedRegion,
  allCategories,
  currentPage, 
  pageSize 
}: UsePlansParams): UsePlansReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      let productsQuery = supabase
        .from('wc_products')
        .select('*')
        .eq('active', true)
        .order('name');

      // Apply search filter
      if (searchTerm) {
        productsQuery = productsQuery.ilike('name', `%${searchTerm}%`);
      }

      // Apply region filter - much more efficient now!
      if (selectedRegion) {
        productsQuery = productsQuery
          .eq('plan_type', 'regional')
          .eq('region_code', selectedRegion);
      }

      // Apply category filter for country-specific plans
      if (selectedCategory) {
        console.log('Filtering by category:', selectedCategory);
        
        // Get the selected category to find its slug and convert to ISO3
        const selectedCategoryData = allCategories.find(cat => cat.id === selectedCategory);
        let countryISO3: string | null = null;
        
        if (selectedCategoryData) {
          // Convert category slug to ISO3 code for regional plan matching
          countryISO3 = iso2ToIso3(selectedCategoryData.slug);
        }
        
        if (countryISO3) {
          // Use OR condition to get both country-specific plans and regional plans that include this country
          productsQuery = productsQuery.or(
            `category_ids.cs.[${selectedCategory}],and(plan_type.eq.regional,metadata->countries_iso3.cs.["${countryISO3}"])`
          );
        } else {
          // Fallback to just country-specific plans if ISO3 conversion fails
          productsQuery = productsQuery.contains('category_ids', `[${selectedCategory}]`);
        }
      }

      // Apply pagination
      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;
      productsQuery = productsQuery.range(from, to);

      const { data: fetchedProducts, error: productsError } = await productsQuery;
      if (productsError) throw productsError;
      
      setProducts(fetchedProducts || []);
      
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Error al cargar los datos. Por favor intente nuevamente.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedCategory, selectedRegion, allCategories, currentPage, pageSize]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { 
    products, 
    loading, 
    error, 
    refetch 
  };
}

// Helper function to convert ISO2 country codes to ISO3
function iso2ToIso3(iso2Code: string): string | null {
  const iso2ToIso3Map: Record<string, string> = {
    'au': 'AUS', // Australia
    'cn': 'CHN', // China
    'hk': 'HKG', // Hong Kong
    'id': 'IDN', // Indonesia
    'mo': 'MAC', // Macao
    'my': 'MYS', // Malaysia
    'nz': 'NZL', // New Zealand
    'ph': 'PHL', // Philippines
    'sg': 'SGP', // Singapore
    'th': 'THA', // Thailand
    'tw': 'TWN', // Taiwan
    'vn': 'VNM', // Vietnam
    'ar': 'ARG', // Argentina
    'bo': 'BOL', // Bolivia
    'br': 'BRA', // Brazil
    'cl': 'CHL', // Chile
    'co': 'COL', // Colombia
    'cr': 'CRI', // Costa Rica
    'cu': 'CUB', // Cuba
    'ec': 'ECU', // Ecuador
    'sv': 'SLV', // El Salvador
    'gt': 'GTM', // Guatemala
    'hn': 'HND', // Honduras
    'mx': 'MEX', // Mexico
    'ni': 'NIC', // Nicaragua
    'pa': 'PAN', // Panama
    'py': 'PRY', // Paraguay
    'pe': 'PER', // Peru
    'do': 'DOM', // Dominican Republic
    'uy': 'URY', // Uruguay
    've': 'VEN', // Venezuela
    'de': 'DEU', // Germany
    'at': 'AUT', // Austria
    'be': 'BEL', // Belgium
    'bg': 'BGR', // Bulgaria
    'hr': 'HRV', // Croatia
    'dk': 'DNK', // Denmark
    'sk': 'SVK', // Slovakia
    'si': 'SVN', // Slovenia
    'es': 'ESP', // Spain
    'ee': 'EST', // Estonia
    'fi': 'FIN', // Finland
    'fr': 'FRA', // France
    'gr': 'GRC', // Greece
    'hu': 'HUN', // Hungary
    'ie': 'IRL', // Ireland
    'it': 'ITA', // Italy
    'lv': 'LVA', // Latvia
    'lt': 'LTU', // Lithuania
    'lu': 'LUX', // Luxembourg
    'nl': 'NLD', // Netherlands
    'pl': 'POL', // Poland
    'pt': 'PRT', // Portugal
    'gb': 'GBR', // United Kingdom
    'cz': 'CZE', // Czech Republic
    'ro': 'ROU', // Romania
    'se': 'SWE', // Sweden
    'ch': 'CHE', // Switzerland
    'us': 'USA', // United States
    'ca': 'CAN', // Canada
    'rs': 'SRB', // Serbia
    'ba': 'BIH', // Bosnia and Herzegovina
    'me': 'MNE', // Montenegro
    'mk': 'MKD', // North Macedonia
    'al': 'ALB', // Albania
    'xk': 'XKX', // Kosovo
    'il': 'ISR', // Israel
    'tr': 'TUR', // Turkey
    'ae': 'ARE', // United Arab Emirates
    'sa': 'SAU', // Saudi Arabia
    'qa': 'QAT', // Qatar
    'kw': 'KWT', // Kuwait
    'bh': 'BHR', // Bahrain
    'om': 'OMN', // Oman
    'jo': 'JOR', // Jordan
    'lb': 'LBN', // Lebanon
    'jm': 'JAM', // Jamaica
    'bs': 'BHS', // Bahamas
    'bb': 'BRB', // Barbados
    'tt': 'TTO', // Trinidad and Tobago
    'ag': 'ATG', // Antigua and Barbuda
    'lc': 'LCA', // Saint Lucia
    'gd': 'GRD', // Grenada
    'ge': 'GEO', // Georgia
    'am': 'ARM', // Armenia
    'az': 'AZE', // Azerbaijan
    'kz': 'KAZ', // Kazakhstan
    'uz': 'UZB', // Uzbekistan
    'tm': 'TKM', // Turkmenistan
    'tj': 'TJK', // Tajikistan
    'kg': 'KGZ', // Kyrgyzstan
    'jp': 'JPN', // Japan
    'kr': 'KOR', // South Korea
    'in': 'IND', // India
    'bd': 'BGD', // Bangladesh
    'pk': 'PAK', // Pakistan
    'lk': 'LKA', // Sri Lanka
    'kh': 'KHM', // Cambodia
    'la': 'LAO', // Laos
    'mm': 'MMR', // Myanmar
    'za': 'ZAF', // South Africa
    'eg': 'EGY', // Egypt
    'ma': 'MAR', // Morocco
    'ng': 'NGA', // Nigeria
    'ke': 'KEN', // Kenya
    'gh': 'GHA', // Ghana
    'et': 'ETH', // Ethiopia
    'tz': 'TZA', // Tanzania
    'ug': 'UGA', // Uganda
    'zw': 'ZWE', // Zimbabwe
    'zm': 'ZMB', // Zambia
    'bw': 'BWA', // Botswana
    'na': 'NAM', // Namibia
    'fj': 'FJI', // Fiji
    'pg': 'PNG', // Papua New Guinea
    'ws': 'WSM', // Samoa
    'to': 'TON', // Tonga
    'af': 'AFG', // Afghanistan
    'aw': 'ABW', // Aruba
    // Add more mappings as needed
  };
  
  return iso2ToIso3Map[iso2Code.toLowerCase()] || null;
}