import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase, type Product, type Category } from '../../../lib/supabase';
import { countryUtils } from '../../../lib/countries/countryUtils';
import { regionMapping } from '../../../lib/search/searchUtils';
import type { FilterValues } from '../components/PlanFilters';

interface UsePlansParams {
  searchTerm: string;
  selectedCategory: number | undefined;
  selectedRegion: string | undefined;
  filters: FilterValues;
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
  filters,
  allCategories,
  currentPage, 
  pageSize 
}: UsePlansParams): UsePlansReturn {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data only when selection changes (not when filters change)
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('usePlans: Starting fetch with params:', {
        searchTerm,
        selectedCategory,
        selectedRegion
      });
      
      let productsQuery = supabase
        .from('wc_products')
        .select('*')
        .eq('active', true)
        .order('name');

      // Apply search filter
      if (searchTerm) {
        console.log('usePlans: Applying search filter:', searchTerm);
        productsQuery = productsQuery.ilike('name', `%${searchTerm}%`);
      }

      // Apply region filter - much more efficient now!
      if (selectedRegion) {
        console.log('usePlans: Applying region filter:', selectedRegion);
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

      console.log('usePlans: Executing query...');
      const { data, error: queryError } = await productsQuery;

      if (queryError) {
        console.error('usePlans: Query error:', queryError);
        throw queryError;
      }

      console.log('usePlans: Query successful, products found:', data?.length || 0);
      setAllProducts(data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
      
      let errorMessage = 'An error occurred while fetching products';
      if (err instanceof Error) {
        if (err.message.includes('Failed to fetch')) {
          errorMessage = 'Connection error. Please check your internet connection and that Supabase is accessible.';
        } else {
          errorMessage = err.message;
        }
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedCategory, selectedRegion, allCategories]);

  // Apply filters in memory
  const filteredProducts = useMemo(() => {
    let filtered = [...allProducts];

    // Apply plan type filter
    if (filters.planType) {
      if (selectedCategory) {
        // For country selections, filter between country-specific and regional plans
        if (filters.planType === 'country') {
          filtered = filtered.filter(product => product.plan_type === 'country');
        } else if (filters.planType === 'regional') {
          // Only show regional plans that include this country
          const selectedCategoryData = allCategories.find(cat => cat.id === selectedCategory);
          if (selectedCategoryData) {
            const countryISO3 = iso2ToIso3(selectedCategoryData.slug);
            if (countryISO3) {
              filtered = filtered.filter(product => 
                product.plan_type === 'regional' && 
                product.metadata?.countries_iso3 && 
                Array.isArray(product.metadata.countries_iso3) &&
                product.metadata.countries_iso3.includes(countryISO3)
              );
            }
          }
        }
      } else if (selectedRegion) {
        // For region selections, filter between regional and country plans within that region
        if (filters.planType === 'regional') {
          filtered = filtered.filter(product => product.plan_type === 'regional');
        } else if (filters.planType === 'country') {
          // Show country plans for countries within this region
          const regionCountries = regionMapping[selectedRegion] || [];
          if (regionCountries.length > 0) {
            // Get category IDs for countries in this region
            const regionCategoryIds = allCategories
              .filter(cat => regionCountries.includes(cat.slug))
              .map(cat => cat.id);
            
            filtered = filtered.filter(product => 
              product.plan_type === 'country' &&
              product.category_ids &&
              Array.isArray(product.category_ids) &&
              product.category_ids.some(id => regionCategoryIds.includes(id))
            );
          }
        }
      }
    }

    // Apply data amount filter
    if (filters.dataAmount) {
      const dataGb = parseFloat(filters.dataAmount);
      filtered = filtered.filter(product => product.data_gb === dataGb);
    }

    // Apply validity filter
    if (filters.validity) {
      const validityDays = parseInt(filters.validity);
      filtered = filtered.filter(product => product.validity_days === validityDays);
    }

    return filtered;
  }, [allProducts, filters, selectedCategory, selectedRegion, allCategories]);

  // Apply pagination to filtered results
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, currentPage, pageSize]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { 
    products: paginatedProducts, 
    loading, 
    error, 
    refetch: fetchData 
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