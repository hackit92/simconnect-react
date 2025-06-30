import React from 'react';
import { Globe, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from "../../../components/ui/button";
import type { Product } from "../../../lib/supabase";
import { countryUtils } from '../../../lib/countries/countryUtils';
import { useCurrency } from '../../../contexts/CurrencyContext';
import { useCart } from '../../../contexts/CartContext';

interface PlanListProps {
  products: Product[];
  loading: boolean;
  selectedCategory: number | undefined;
  selectedCategoryData?: { id: number; name: string; slug: string; parent: number | null };
  categories?: { id: number; name: string; slug: string; parent: number | null }[];
}

// Regional coverage mapping
const regionalCoverage: Record<string, string[]> = {
  'latinoamerica': [
    'Argentina', 'Bolivia', 'Brasil', 'Chile', 'Colombia', 'Costa Rica', 'Cuba',
    'Ecuador', 'El Salvador', 'Guatemala', 'Honduras', 'México', 'Nicaragua',
    'Panamá', 'Paraguay', 'Perú', 'República Dominicana', 'Uruguay', 'Venezuela'
  ],
  'europa': [
    'Alemania', 'Austria', 'Bélgica', 'Bulgaria', 'Croacia', 'Dinamarca', 'Eslovaquia',
    'Eslovenia', 'España', 'Estonia', 'Finlandia', 'Francia', 'Grecia', 'Hungría',
    'Irlanda', 'Italia', 'Letonia', 'Lituania', 'Luxemburgo', 'Países Bajos',
    'Polonia', 'Portugal', 'Reino Unido', 'República Checa', 'Rumanía', 'Suecia', 'Suiza'
  ],
  'norteamerica': ['Estados Unidos', 'Canadá'],
  'balcanes': ['Serbia', 'Bosnia y Herzegovina', 'Montenegro', 'Macedonia del Norte', 'Albania', 'Kosovo'],
  'oriente-medio': [
    'Israel', 'Turquía', 'Emiratos Árabes Unidos', 'Arabia Saudita', 'Qatar',
    'Kuwait', 'Baréin', 'Omán', 'Jordania', 'Líbano'
  ],
  'caribe': [
    'Cuba', 'República Dominicana', 'Jamaica', 'Bahamas', 'Barbados',
    'Trinidad y Tobago', 'Antigua y Barbuda', 'Santa Lucía', 'Granada'
  ],
  'caucaso': ['Georgia', 'Armenia', 'Azerbaiyán'],
  'asia-central': ['Kazajistán', 'Uzbekistán', 'Turkmenistán', 'Tayikistán', 'Kirguistán'],
  'asia': [
    'China', 'Japón', 'Corea del Sur', 'India', 'Tailandia', 'Singapur', 'Malasia',
    'Indonesia', 'Filipinas', 'Vietnam', 'Camboya', 'Laos', 'Myanmar', 'Bangladesh', 'Pakistán', 'Sri Lanka'
  ],
  'africa': [
    'Sudáfrica', 'Egipto', 'Marruecos', 'Nigeria', 'Kenia', 'Ghana', 'Etiopía',
    'Tanzania', 'Uganda', 'Zimbabue', 'Zambia', 'Botsuana', 'Namibia'
  ],
  'oceania': ['Australia', 'Nueva Zelanda', 'Fiyi', 'Papúa Nueva Guinea', 'Samoa', 'Tonga']
};
// Helper function to get technology icon
function getTechnologyIcon(tech: string): JSX.Element {
  switch (tech) {
    case '5G':
      return (
        <div className="w-5 h-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded text-white text-xs font-bold flex items-center justify-center">
          5G
        </div>
      );
    case '4G/LTE':
    case '4G':
      return (
        <div className="w-5 h-5 bg-blue-500 rounded text-white text-xs font-bold flex items-center justify-center">
          4G
        </div>
      );
    case '3G':
      return (
        <div className="w-5 h-5 bg-green-500 rounded text-white text-xs font-bold flex items-center justify-center">
          3G
        </div>
      );
    case '2G':
    case '2G/EDGE':
      return (
        <div className="w-5 h-5 bg-gray-500 rounded text-white text-xs font-bold flex items-center justify-center">
          2G
        </div>
      );
    default:
      return (
        <div className="w-5 h-5 bg-blue-500 rounded text-white text-xs font-bold flex items-center justify-center">
          4G
        </div>
      );
  }
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
      'caucaso': 'Cáucaso',
      'asia-central': 'Asia Central',
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
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
    <div className="space-y-4">
      {products.map((plan) => {
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
        
        // Safely get coverage countries with proper null checks - always ensure it's an array
        const coverageCountries: string[] = (() => {
          if (isRegional && plan.region_code && typeof plan.region_code === 'string') {
            try {
              const rawCoverage = regionalCoverage?.[plan.region_code];
              const safeCoverage = Array.isArray(rawCoverage) ? rawCoverage : [];
              if (safeCoverage.length > 0) {
                return safeCoverage.filter(country => 
                  country && typeof country === 'string' && country.trim().length > 0
                );
              }
            } catch (error) {
              console.warn('Error accessing regional coverage for', plan.region_code, ':', error);
            }
          }
          return [];
          return [];
        })();
        
        return (
          <div key={plan.id} className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-lg transition-all duration-200">
            {/* Header with Flag and Country/Region */}
            <div className="relative flex items-center justify-between mb-6">
              {/* Block 1: Flag, Name, Technology Icon */}
              <div className="flex items-center space-x-3">
                {/* Flag or Regional Icon */}
                <div className="w-10 h-7 rounded-md overflow-hidden flex items-center justify-center bg-gray-50 border flex-shrink-0">
                  {isRegional ? (
                    <Globe className="w-6 h-6 text-blue-500" />
                  ) : (
                    <span 
                      className={flagClass} 
                      style={{ transform: 'scale(1.5)' }} 
                    />
                  )}
                </div>
                
                {/* Country/Region Name and Technology Icon */}
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-bold text-gray-900 truncate">{displayName}</h3>
                  {/* Technology Icon */}
                  {getTechnologyIcon(technology)}
                </div>
              </div>
              
              {/* Regional Button - Positioned absolutely to align with card edge */}
              {isRegional && Array.isArray(coverageCountries) && coverageCountries.length > 0 && (
                <button
                  onClick={() => toggleRegionalCoverage(plan.id)}
                  className="absolute -top-2 -right-2 flex items-center space-x-1 px-4 py-2 bg-blue-500 text-white rounded-full text-sm font-medium hover:bg-blue-600 transition-colors duration-200 shadow-lg z-10"
                >
                  <span>Plan Regional</span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              )}
              
              {/* Block 2: Price with Currency */}
              <div className="text-right flex-shrink-0">
                <div className="text-2xl font-bold text-blue-600">
                  {displayPrice}
                </div>
              </div>
            </div>
            
            {/* Regional Coverage Dropdown */}
            {isRegional && isExpanded && Array.isArray(coverageCountries) && coverageCountries.length > 0 && (
              <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Cobertura Regional:</h4>
                <div className="grid grid-cols-2 gap-2">
                  {coverageCountries.map((country, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0"></div>
                      <span>{country}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Plan Details */}
            <div className="flex items-center justify-start mb-6">
              <div className="flex items-center space-x-6">
                {/* Data Amount */}
                {gbAmount !== null && gbAmount !== undefined && (
                  <div>
                    <div className="text-lg font-semibold text-gray-900">
                      {gbAmount < 1 ? `${Math.round(gbAmount * 1024)} MB` : `${gbAmount} GB`}
                    </div>
                    <div className="text-xs text-gray-500">Datos</div>
                  </div>
                )}
                
                {/* Validity */}
                {validityDays !== null && validityDays !== undefined && (
                  <div>
                    <div className="text-lg font-semibold text-gray-900">{validityDays} días</div>
                    <div className="text-xs text-gray-500">Vigencia</div>
                  </div>
                )}
                
                {/* Show plan name if no GB or validity found */}
                {(gbAmount === null || gbAmount === undefined) && (validityDays === null || validityDays === undefined) && (
                  <div>
                    <div className="text-sm font-medium text-gray-900 max-w-48 truncate">{plan.name}</div>
                    <div className="text-xs text-gray-500">Plan</div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Debug info for development (remove in production) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mb-4 p-3 bg-yellow-50 rounded-lg text-xs">
                <div className="font-semibold text-yellow-800 mb-2">Debug Info:</div>
                <div className="space-y-1 text-yellow-700">
                  <div><strong>Name:</strong> {plan.name}</div>
                  <div><strong>SKU:</strong> {plan.sku}</div>
                  <div><strong>Plan Type:</strong> {plan.plan_type}</div>
                  <div><strong>Region Code:</strong> {plan.region_code || 'N/A'}</div>
                  <div><strong>Country Code:</strong> {plan.country_code || 'N/A'}</div>
                  <div><strong>Category IDs:</strong> {JSON.stringify(plan.category_ids)}</div>
                  <div><strong>Flag Class:</strong> {flagClass}</div>
                  <div><strong>Display Name:</strong> {displayName}</div>
                  <div><strong>Data GB:</strong> {gbAmount !== null && gbAmount !== undefined ? gbAmount : 'Not found'}</div>
                  <div><strong>Validity Days:</strong> {validityDays !== null && validityDays !== undefined ? validityDays : 'Not found'}</div>
                  <div><strong>Technology:</strong> {technology}</div>
                  <div><strong>Has 5G:</strong> {plan.has_5g ? 'Yes' : 'No'}</div>
                  <div><strong>Has LTE:</strong> {plan.has_lte ? 'Yes' : 'No'}</div>
                  <div><strong>Price USD:</strong> {plan.regular_price_usd || 'N/A'}</div>
                  <div><strong>Price EUR:</strong> {plan.regular_price_eur || 'N/A'}</div>
                  <div><strong>Price MXN:</strong> {plan.regular_price_mxn || 'N/A'}</div>
                  <div><strong>Selected Currency:</strong> {selectedCurrency}</div>
                  <div><strong>Current Price:</strong> {displayPrice}</div>
                </div>
              </div>
            )}
            
            {/* Purchase Button */}
            <div className="flex justify-end">
              <Button
                onClick={() => handlePurchase(plan.id)}
                className={`px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl ${
                  isInCart(plan.id)
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
                size="lg"
              >
                {isInCart(plan.id) ? 'AÑADIDO AL CARRITO' : 'AÑADIR AL CARRITO'}
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
};