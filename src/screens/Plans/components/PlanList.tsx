import React from 'react';
import { Globe, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from "../../../components/ui/button";
import type { Product } from "../../../lib/supabase";
import { countryUtils } from '../../../lib/countries/countryUtils';
import { useCurrency } from '../../../contexts/CurrencyContext';
import { useCart } from '../../../contexts/CartContext';
import { useIsDesktop } from '../../../hooks/useIsDesktop';

interface PlanListProps {
  products: Product[];
  loading: boolean;
  selectedCategory: number | undefined;
  selectedCategoryData?: { id: number; name: string; slug: string; parent: number | null };
  categories?: { id: number; name: string; slug: string; parent: number | null }[];
}

// Helper function to convert ISO3 country codes to country names
function getCountryNameFromISO3(iso3Code: string): string {
  // Convert ISO3 to ISO2 first, then get the country name
  const iso2Code = iso3ToIso2(iso3Code);
  if (iso2Code) {
    return countryUtils.getCountryName(iso2Code);
  }
  
  // Fallback: return the ISO3 code if conversion fails
  return iso3Code;
}

// Helper function to convert ISO3 to ISO2 country codes
function iso3ToIso2(iso3Code: string): string | null {
  const iso3ToIso2Map: Record<string, string> = {
    'AUS': 'au', // Australia
    'CHN': 'cn', // China
    'HKG': 'hk', // Hong Kong
    'IDN': 'id', // Indonesia
    'MAC': 'mo', // Macao
    'MYS': 'my', // Malaysia
    'NZL': 'nz', // New Zealand
    'PHL': 'ph', // Philippines
    'SGP': 'sg', // Singapore
    'THA': 'th', // Thailand
    'TWN': 'tw', // Taiwan
    'VNM': 'vn', // Vietnam
    'ARG': 'ar', // Argentina
    'BOL': 'bo', // Bolivia
    'BRA': 'br', // Brazil
    'CHL': 'cl', // Chile
    'COL': 'co', // Colombia
    'CRI': 'cr', // Costa Rica
    'CUB': 'cu', // Cuba
    'ECU': 'ec', // Ecuador
    'SLV': 'sv', // El Salvador
    'GTM': 'gt', // Guatemala
    'HND': 'hn', // Honduras
    'MEX': 'mx', // Mexico
    'NIC': 'ni', // Nicaragua
    'PAN': 'pa', // Panama
    'PRY': 'py', // Paraguay
    'PER': 'pe', // Peru
    'DOM': 'do', // Dominican Republic
    'URY': 'uy', // Uruguay
    'VEN': 've', // Venezuela
    'DEU': 'de', // Germany
    'AUT': 'at', // Austria
    'BEL': 'be', // Belgium
    'BGR': 'bg', // Bulgaria
    'HRV': 'hr', // Croatia
    'DNK': 'dk', // Denmark
    'SVK': 'sk', // Slovakia
    'SVN': 'si', // Slovenia
    'ESP': 'es', // Spain
    'EST': 'ee', // Estonia
    'FIN': 'fi', // Finland
    'FRA': 'fr', // France
    'GRC': 'gr', // Greece
    'HUN': 'hu', // Hungary
    'IRL': 'ie', // Ireland
    'ITA': 'it', // Italy
    'LVA': 'lv', // Latvia
    'LTU': 'lt', // Lithuania
    'LUX': 'lu', // Luxembourg
    'NLD': 'nl', // Netherlands
    'POL': 'pl', // Poland
    'PRT': 'pt', // Portugal
    'GBR': 'gb', // United Kingdom
    'CZE': 'cz', // Czech Republic
    'ROU': 'ro', // Romania
    'SWE': 'se', // Sweden
    'CHE': 'ch', // Switzerland
    'USA': 'us', // United States
    'CAN': 'ca', // Canada
    'SRB': 'rs', // Serbia
    'BIH': 'ba', // Bosnia and Herzegovina
    'MNE': 'me', // Montenegro
    'MKD': 'mk', // North Macedonia
    'ALB': 'al', // Albania
    'XKX': 'xk', // Kosovo
    'ISR': 'il', // Israel
    'TUR': 'tr', // Turkey
    'ARE': 'ae', // United Arab Emirates
    'SAU': 'sa', // Saudi Arabia
    'QAT': 'qa', // Qatar
    'KWT': 'kw', // Kuwait
    'BHR': 'bh', // Bahrain
    'OMN': 'om', // Oman
    'JOR': 'jo', // Jordan
    'LBN': 'lb', // Lebanon
    'JAM': 'jm', // Jamaica
    'BHS': 'bs', // Bahamas
    'BRB': 'bb', // Barbados
    'TTO': 'tt', // Trinidad and Tobago
    'ATG': 'ag', // Antigua and Barbuda
    'LCA': 'lc', // Saint Lucia
    'GRD': 'gd', // Grenada
    'GEO': 'ge', // Georgia
    'ARM': 'am', // Armenia
    'AZE': 'az', // Azerbaijan
    'KAZ': 'kz', // Kazakhstan
    'UZB': 'uz', // Uzbekistan
    'TKM': 'tm', // Turkmenistan
    'TJK': 'tj', // Tajikistan
    'KGZ': 'kg', // Kyrgyzstan
    'JPN': 'jp', // Japan
    'KOR': 'kr', // South Korea
    'IND': 'in', // India
    'BGD': 'bd', // Bangladesh
    'PAK': 'pk', // Pakistan
    'LKA': 'lk', // Sri Lanka
    'KHM': 'kh', // Cambodia
    'LAO': 'la', // Laos
    'MMR': 'mm', // Myanmar
    'ZAF': 'za', // South Africa
    'EGY': 'eg', // Egypt
    'MAR': 'ma', // Morocco
    'NGA': 'ng', // Nigeria
    'KEN': 'ke', // Kenya
    'GHA': 'gh', // Ghana
    'ETH': 'et', // Ethiopia
    'TZA': 'tz', // Tanzania
    'UGA': 'ug', // Uganda
    'ZWE': 'zw', // Zimbabwe
    'ZMB': 'zm', // Zambia
    'BWA': 'bw', // Botswana
    'NAM': 'na', // Namibia
    'FJI': 'fj', // Fiji
    'PNG': 'pg', // Papua New Guinea
    'WSM': 'ws', // Samoa
    'TON': 'to'  // Tonga
  };
  
  return iso3ToIso2Map[iso3Code.toUpperCase()] || null;
}

// Helper function to format price with currency
function getProductPrice(product: Product, currency: string): number | null {
  switch (currency) {
    case 'USD':
      return product.regular_price_usd || parseFloat(product.regular_price || '0') || null;
    case 'EUR':
      return product.regular_price_eur;
    case 'MXN':
      return product.regular_price_mxn;
    default:
      return product.regular_price_usd || parseFloat(product.regular_price || '0') || null;
  }
}

// Fallback function for old price format
function getFallbackPrice(product: Product): { amount: string; currency: string } {
  // Use structured price data first, then fallback to old method
  if (product.regular_price_usd && product.regular_price_usd > 0) {
    return {
      amount: product.regular_price_usd.toString(),
      currency: 'USD'
    };
  }
  
  if (product.regular_price_eur && product.regular_price_eur > 0) {
    return {
      amount: product.regular_price_eur.toString(),
      currency: 'EUR'
    };
  }
  
  if (product.regular_price_mxn && product.regular_price_mxn > 0) {
    return {
      amount: product.regular_price_mxn.toString(),
      currency: 'MXN'
    };
  }
  
  // Fallback to old method
  const price = product.sale_price || product.regular_price || '0';
  
  // Try to extract currency from metadata
  if (product.metadata?.prices) {
    const prices = product.metadata.prices;
    if (typeof prices === 'object') {
      const firstPrice = Object.entries(prices)[0];
      if (firstPrice) {
        return {
          amount: firstPrice[1] as string,
          currency: firstPrice[0]
        };
      }
    }
  }
  
  // Check if price already includes currency symbol
  if (typeof price === 'string') {
    if (price.includes('$')) {
      return {
        amount: price.replace('$', ''),
        currency: 'USD'
      };
    }
    if (price.includes('€')) {
      return {
        amount: price.replace('€', ''),
        currency: 'EUR'
      };
    }
    if (price.includes('£')) {
      return {
        amount: price.replace('£', ''),
        currency: 'GBP'
      };
    }
  }
  
  // Default to USD if no currency specified
  return {
    amount: price,
    currency: 'USD'
  };
}

// Helper function to get display name - now using database fields
function getDisplayName(
  product: Product, 
  selectedCategoryData?: { id: number; name: string; slug: string; parent: number | null },
  categories?: { id: number; name: string; slug: string; parent: number | null }[]
): string {
  // For regional plans, use formatted region names
  if (product.plan_type === 'regional') {
    const regionNames: Record<string, string> = {
      'latinoamerica': 'Latinoamérica',
      'europa': 'Europa',
      'norteamerica': 'Norteamérica',
      'balcanes': 'Balcanes',
      'oriente-medio': 'Oriente Medio',
      'caribe': 'Caribe',
      'asia-central': 'Asia Central y Cáucaso',
      'asia': 'Asia',
      'africa': 'África',
      'oceania': 'Oceanía'
    };
    return regionNames[product.region_code || ''] || 'Plan Regional';
  }
  
  // For country-specific plans, try to get the country name from various sources
  if (product.plan_type === 'country') {
    // First try to use the selected category data
    if (selectedCategoryData) {
      return countryUtils.getCountryName(selectedCategoryData.slug);
    }
    
    // If no selected category, try to find the country from the product's category_ids
    if (product.category_ids && Array.isArray(product.category_ids) && categories) {
      for (const categoryId of product.category_ids) {
        const category = categories.find(cat => cat.id === categoryId);
        if (category) {
          const countryName = countryUtils.getCountryName(category.slug);
          // Only return if it's a valid country name (not just the slug)
          if (countryName !== category.slug) {
            return countryName;
          }
        }
      }
    }
    
    // Try to use country_code if available
    if (product.country_code) {
      const countryName = countryUtils.getCountryName(product.country_code);
      if (countryName !== product.country_code) {
        return countryName;
      }
    }
  }
  
  return 'Plan Internacional';
}

// Helper function to get the correct flag for a product
function getProductFlag(
  product: Product,
  selectedCategoryData?: { id: number; name: string; slug: string; parent: number | null },
  categories?: { id: number; name: string; slug: string; parent: number | null }[]
): string {
  // For regional plans, return a generic international flag
  if (product.plan_type === 'regional') {
    return 'fi fi-un'; // UN flag for regional plans
  }
  
  // For country-specific plans, try to get the flag from various sources
  if (product.plan_type === 'country') {
    // First try to use the selected category data
    if (selectedCategoryData) {
      return countryUtils.getFlagClass(selectedCategoryData.slug);
    }
    
    // If no selected category, try to find the country from the product's category_ids
    if (product.category_ids && Array.isArray(product.category_ids) && categories) {
      for (const categoryId of product.category_ids) {
        const category = categories.find(cat => cat.id === categoryId);
        if (category) {
          const flagClass = countryUtils.getFlagClass(category.slug);
          // Only return if it's not the default UN flag
          if (flagClass !== 'fi fi-un') {
            return flagClass;
          }
        }
      }
    }
    
    // Try to use country_code if available
    if (product.country_code) {
      const flagClass = countryUtils.getFlagClass(product.country_code);
      if (flagClass !== 'fi fi-un') {
        return flagClass;
      }
    }
  }
  
  // Default to UN flag
  return 'fi fi-un';
}

export const PlanList: React.FC<PlanListProps> = ({
  products,
  loading,
  selectedCategory,
  selectedCategoryData,
  categories
}) => {
  const { selectedCurrency, formatPrice } = useCurrency();
  const { addToCart, isInCart } = useCart();
  const isDesktop = useIsDesktop();
  const [expandedRegionalPlans, setExpandedRegionalPlans] = React.useState<Set<number>>(new Set());

  const handlePurchase = (productId: number) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      addToCart(product);
    }
  };

  const toggleRegionalCoverage = (productId: number) => {
    setExpandedRegionalPlans(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-3 text-gray-600">Cargando planes...</span>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
          <Globe className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron planes</h3>
        <p className="text-gray-500 max-w-sm">
          {selectedCategory 
            ? 'No hay planes disponibles para el país seleccionado.' 
            : 'Selecciona un país o región para ver los planes disponibles.'
          }
        </p>
      </div>
    );
  }

  return (
    <div className={`${isDesktop ? 'space-y-3' : 'space-y-4'}`}>
      {products.filter(Boolean).map((plan) => {
        // Defensive check: ensure plan is a valid object
        if (!plan || typeof plan !== 'object') {
          console.warn('Invalid plan object encountered:', plan);
          return null;
        }

        // Use structured data from database fields
        const technology = plan.technology || '4G';
        
        // Get price in selected currency
        const priceAmount = getProductPrice(plan, selectedCurrency);
        let displayPrice: string;
        
        if (priceAmount !== null && priceAmount !== undefined && priceAmount > 0) {
          displayPrice = formatPrice(priceAmount, selectedCurrency);
        } else {
          // Fallback to old price format
          const fallback = getFallbackPrice(plan);
          // Always use the selected currency symbol, regardless of the fallback currency
          displayPrice = formatPrice(parseFloat(fallback.amount), selectedCurrency);
        }
        
        const displayName = getDisplayName(plan, selectedCategoryData, categories);
        const isRegional = plan.plan_type === 'regional';
        const gbAmount = plan.data_gb;
        const validityDays = plan.validity_days;
        const flagClass = getProductFlag(plan, selectedCategoryData, categories);
        const isExpanded = expandedRegionalPlans.has(plan.id);
        
        // Get coverage countries from plan data
        let coverageCountries: string[] = [];
        
        if (isRegional && plan.metadata?.countries_iso3 && Array.isArray(plan.metadata.countries_iso3)) {
          try {
            // Convert ISO3 codes to country names
            coverageCountries = plan.metadata.countries_iso3
              .filter((iso3Code: string) => iso3Code && typeof iso3Code === 'string' && iso3Code.trim().length > 0)
              .map((iso3Code: string) => getCountryNameFromISO3(iso3Code))
              .filter((countryName: string) => countryName && countryName !== iso3Code); // Filter out failed conversions
          } catch (error) {
            console.warn('Error processing countries for plan', plan.id, ':', error);
          }
        }
        
        return (
          <div key={plan.id} className={`relative bg-white border border-gray-200 hover:shadow-md transition-all duration-200 ${
            isDesktop ? 'rounded-xl p-4' : 'rounded-2xl p-4'
          }`}>
            {/* Price positioned in top-right corner for mobile */}
            {!isDesktop && (
              <div className="absolute top-3 right-3 bg-primary/10 text-primary px-3 py-1 rounded-lg text-xl font-bold">
                {displayPrice}
              </div>
            )}

            {isDesktop ? (
              // Desktop Layout - Horizontal single row
              <div className="flex items-center justify-between">
                {/* Left: Flag + Country + Technology */}
                <div className="flex items-center space-x-4">
                  {/* Flag */}
                  <div className="w-12 h-8 rounded-lg overflow-hidden flex items-center justify-center bg-gray-50 border flex-shrink-0">
                    {isRegional ? (
                      <Globe className="w-6 h-6 text-primary" />
                    ) : (
                      <span 
                        className={flagClass} 
                        style={{ transform: 'scale(1.8)' }} 
                      />
                    )}
                  </div>
                  
                  {/* Country Name */}
                  <h3 className="text-lg font-semibold text-gray-900 min-w-[120px]">
                    {displayName}
                  </h3>
                  
                  {/* Technology Tag */}
                  <span className="bg-primary text-white rounded-full px-2 py-0.5 text-xs font-medium">
                    {technology}
                  </span>
                  
                  {/* Regional Plan Indicator */}
                  {isRegional && (
                    <span className="bg-primary/20 text-primary rounded-full px-2 py-0.5 text-xs font-medium">
                      Plan Regional
                    </span>
                  )}
                </div>
                
                {/* Center: Data and Validity */}
                <div className="flex items-center space-x-2 text-gray-700 text-base font-medium">
                  {gbAmount !== null && gbAmount !== undefined && (
                    <span>
                      {gbAmount < 1 ? `${Math.round(gbAmount * 1024)} MB` : `${gbAmount} GB`}
                    </span>
                  )}
                  {gbAmount !== null && gbAmount !== undefined && validityDays !== null && validityDays !== undefined && (
                    <span className="text-gray-400">|</span>
                  )}
                  {validityDays !== null && validityDays !== undefined && (
                    <span>{validityDays} días</span>
                  )}
                </div>
                
                {/* Right: Price and Button */}
                <div className="flex items-center space-x-6">
                  <div className="text-2xl font-bold text-primary">
                    {displayPrice}
                  </div>
                  <Button
                    onClick={() => handlePurchase(plan.id)}
                    className={`rounded-full px-6 py-3 font-semibold transition-all duration-200 shadow-md hover:shadow-lg ${
                      isInCart(plan.id)
                        ? 'bg-green-500 hover:bg-green-600 text-white'
                        : 'bg-primary hover:bg-primary/90 text-white'
                    }`}
                  >
                    {isInCart(plan.id) ? 'AÑADIDO' : 'COMPRAR'}
                  </Button>
                </div>
              </div>
            ) : (
              // Mobile Layout - Compact vertical layout with price in top-right
              <>
                {/* Header with Flag and Country/Region */}
                <div className="flex items-center space-x-3 mb-4 pr-20">
                  {/* Flag or Regional Icon */}
                  <div className="w-8 h-5 rounded overflow-hidden flex items-center justify-center bg-gray-50 border flex-shrink-0">
                    {isRegional ? (
                      <Globe className="w-4 h-4 text-primary" />
                    ) : (
                      <span 
                        className={flagClass} 
                        style={{ transform: 'scale(1.2)' }} 
                      />
                    )}
                  </div>
                  
                  {/* Country/Region Name */}
                  <h3 className="text-base font-semibold text-gray-900 flex-1">{displayName}</h3>
                  
                  {/* Technology Tag */}
                  <span className="bg-primary text-white rounded-full px-2 py-0.5 text-xs font-medium">
                    {technology}
                  </span>
                  
                  {/* Regional Plan Indicator with Expand/Collapse */}
                  {isRegional && coverageCountries.length > 0 && (
                    <button
                      onClick={() => toggleRegionalCoverage(plan.id)}
                      className="flex items-center space-x-1 bg-primary/20 text-primary rounded-full px-2 py-0.5 text-xs font-medium"
                    >
                      <span>Regional</span>
                      {isExpanded ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )}
                    </button>
                  )}
                </div>
                
                {/* Regional Coverage Dropdown */}
                {isRegional && isExpanded && coverageCountries.length > 0 && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-xl">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Cobertura Regional:</h4>
                    <div className="grid grid-cols-2 gap-1">
                      {coverageCountries.map((country, index) => (
                        <div key={index} className="flex items-center space-x-1 text-xs text-gray-600">
                          <div className="w-1 h-1 bg-primary rounded-full flex-shrink-0"></div>
                          <span>{country}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Plan Details */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    {/* Data Amount */}
                    {gbAmount !== null && gbAmount !== undefined && (
                      <span>
                        {gbAmount < 1 ? `${Math.round(gbAmount * 1024)} MB` : `${gbAmount} GB`}
                      </span>
                    )}
                    
                    {/* Validity */}
                    {validityDays !== null && validityDays !== undefined && (
                      <span>{validityDays} días</span>
                    )}
                  </div>
                  
                  {/* Purchase Button */}
                  <Button
                    onClick={() => handlePurchase(plan.id)}
                    className={`px-4 py-2 rounded-full font-semibold text-sm transition-all duration-200 ${
                      isInCart(plan.id)
                        ? 'bg-green-500 hover:bg-green-600 text-white'
                        : 'bg-primary hover:bg-primary/90 text-white'
                    }`}
                  >
                    {isInCart(plan.id) ? 'AÑADIDO' : 'COMPRAR'}
                  </Button>
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};