import React from 'react';
import { Globe, ChevronDown, ChevronUp, Wifi } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Button } from "../../../components/ui/button";
import type { Product } from "../../../lib/supabase";
import { countryUtils } from '../../../lib/countries/countryUtils';
import { useCountryName } from '../../../hooks/useCountryName';
import { useCurrency } from '../../../contexts/CurrencyContext';
import { useCart } from '../../../contexts/CartContext';
import { useIsDesktop } from '../../../hooks/useIsDesktop';

// Import technology SVG assets
import FiveGIcon from '../../../assets/technology/5G.svg?react';
import LTEIcon from '../../../assets/technology/LTE.svg?react';
import ThreeGIcon from '../../../assets/technology/3G.svg?react';

// Import region SVG assets
import AsiaIcon from '../../../assets/regions/asia.svg?react';
import CaribeIcon from '../../../assets/regions/caribe.svg?react';
import CaucasoIcon from '../../../assets/regions/caucaso.svg?react';
import EuropaIcon from '../../../assets/regions/europa.svg?react';
import LatinoAmericaIcon from '../../../assets/regions/latino-america.svg?react';
import MedioOrienteIcon from '../../../assets/regions/medio-oriente.svg?react';
import NorteamericaIcon from '../../../assets/regions/norteamerica.svg?react';

interface PlanListProps {
  products: Product[];
  loading: boolean;
  selectedCategory: number | undefined;
  selectedCategoryData?: { id: number; name: string; slug: string; parent: number | null };
  categories?: { id: number; name: string; slug: string; parent: number | null }[];
}

// Map region codes to their corresponding SVG components
const regionSvgIcons: Record<string, React.ComponentType<any>> = {
  'latinoamerica': LatinoAmericaIcon,
  'europa': EuropaIcon,
  'norteamerica': NorteamericaIcon,
  'oriente-medio': MedioOrienteIcon,
  'caribe': CaribeIcon,
  'asia-central': CaucasoIcon, // Using Caucaso icon for unified Asia Central y Cáucaso
  'asia': AsiaIcon,
};

// Helper function to convert ISO3 country codes to country names
function getCountryNameFromISO3(iso3Code: string, getCountryName: (code: string) => string): string {
  // Convert ISO3 to ISO2 first, then get the country name
  const iso2Code = countryUtils.iso3ToIso2(iso3Code);
  if (iso2Code) {
    return getCountryName(iso2Code);
  }
  
  // Fallback: return the ISO3 code if conversion fails
  return iso3Code;
}

// Helper function to get technology icon
function getTechnologyIcon(tech: string): JSX.Element {
  const iconClass = "w-6 h-6";
  
  switch (tech) {
    case '5G':
      return (
        <FiveGIcon className={`${iconClass} text-purple-600`} />
      );
    case '4G/LTE':
    case '4G':
      return (
        <LTEIcon className={`${iconClass} text-blue-600`} />
      );
    case '3G':
      return (
        <ThreeGIcon className={`${iconClass} text-green-600`} />
      );
    case '2G':
    case '2G/EDGE':
      return (
        <div className="w-6 h-6 bg-gray-500 rounded-full text-white text-xs font-bold flex items-center justify-center">
          <span>2G</span>
        </div>
      );
    default:
      return (
        <LTEIcon className={`${iconClass} text-blue-600`} />
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

// Helper function to get display name - now using database fields
function getDisplayName(
  product: Product, 
  getCountryName: (code: string) => string,
  t: (key: string, options?: any) => string,
  currentLanguage: string,
  selectedCategoryData?: { id: number; name: string; slug: string; parent: number | null },
  categories?: { id: number; name: string; slug: string; parent: number | null }[]
): string {
  // For regional plans, use formatted region names
  if (product.plan_type === 'regional') {
    const regionNames: Record<string, string> = {
      'latinoamerica': t('region.latinoamerica'),
      'europa': t('region.europa'),
      'norteamerica': t('region.norteamerica'),
      'balcanes': t('region.balcanes'),
      'oriente-medio': t('region.oriente-medio'),
      'caribe': t('region.caribe'),
      'asia-central': t('region.asia-central'),
      'asia': t('region.asia'),
      'africa': t('region.africa'),
      'oceania': t('region.oceania')
    };
    return regionNames[product.region_code || ''] || t('plan.regional_plan');
  }
  
  // For country-specific plans, try to get the country name from various sources
  if (product.plan_type === 'country') {
    // First try to use the selected category data
    if (selectedCategoryData) {
      const lang = currentLanguage === 'en' ? 'en' : 'es';
      return countryUtils.getCountryName(selectedCategoryData.slug, lang);
    }
    
    // If no selected category, try to find the country from the product's category_ids
    if (product.category_ids && Array.isArray(product.category_ids) && categories) {
      for (const categoryId of product.category_ids) {
        const category = categories.find(cat => cat.id === categoryId);
        if (category) {
          const countryName = getCountryName(category.slug);
          // Only return if it's a valid country name (not just the slug)
          if (countryName !== category.slug) {
            return countryName;
          }
        }
      }
    }
    
    // Try to use country_code if available
    if (product.country_code) {
      const countryName = getCountryName(product.country_code);
      if (countryName !== product.country_code) {
        return countryName;
      }
    }
  }
  
  return t('plan.international_plan');
}

// Helper function to get the correct flag for a product
function getProductFlag(
  product: Product,
  selectedCategoryData?: { id: number; name: string; slug: string; parent: number | null },
  categories?: { id: number; name: string; slug: string; parent: number | null }[]
): string | React.ComponentType<any> {
  // For regional plans, return a generic international flag
  if (product.plan_type === 'regional') {
    // Return the appropriate region icon component if available
    const RegionIcon = regionSvgIcons[product.region_code || ''];
    if (RegionIcon) {
      return RegionIcon;
    }
    return 'fi fi-un'; // Fallback to UN flag for regional plans
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
  const { t, i18n } = useTranslation();
  const { selectedCurrency, formatPrice } = useCurrency();
  const { addToCart, isInCart } = useCart();
  const isDesktop = useIsDesktop();
  const { getCountryName } = useCountryName();
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
  // Show initial loading state only when there are no products
  if (loading && products.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
       <span className="ml-3 text-gray-600">{t('plans.loading_plans')}</span>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
          <Globe className="w-8 h-8 text-gray-400" />
        </div>
       <h3 className="text-lg font-medium text-gray-900 mb-2">{t('plans.no_plans_found')}</h3>
        <p className="text-gray-500 max-w-sm">
          {selectedCategory 
           ? t('plans.no_plans_country_message')
           : t('plans.no_plans_select_message')
          }
        </p>
      </div>
    );
  }

  return (
    <div className={`relative ${isDesktop ? 'space-y-3' : 'space-y-4'}`}>
      {/* Subtle loading overlay when filtering */}
      {loading && products.length > 0 && (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl">
          <div className="flex items-center space-x-3 bg-white px-6 py-3 rounded-full shadow-lg border border-gray-100">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent"></div>
            <span className="text-sm font-medium text-gray-700">{t('plans.loading_plans')}</span>
          </div>
        </div>
      )}
      
      <AnimatePresence mode="popLayout">
        {products.filter(Boolean).map((plan, index) => {
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
        
        if (priceAmount !== null && priceAmount !== undefined) {
          displayPrice = formatPrice(priceAmount, selectedCurrency);
        } else {
          // Fallback to 0 if no price is available
          displayPrice = formatPrice(0, selectedCurrency);
        }
        
        const displayName = getDisplayName(plan, getCountryName, t, i18n.language, selectedCategoryData, categories);
        const isRegional = plan.plan_type === 'regional';
        const gbAmount = plan.data_gb;
        const validityDays = plan.validity_days;
        const flagOrIcon = getProductFlag(plan, selectedCategoryData, categories);
        const isExpanded = expandedRegionalPlans.has(plan.id);
        
        // Get coverage countries from plan data
        let coverageCountries: string[] = [];
        
        if (isRegional && plan.metadata?.countries_iso3 && Array.isArray(plan.metadata.countries_iso3)) {
          try {
            // Convert ISO3 codes to country names
            coverageCountries = plan.metadata.countries_iso3
              .filter((iso3Code: string) => iso3Code && typeof iso3Code === 'string' && iso3Code.trim().length > 0)
              .map((iso3Code: string) => getCountryNameFromISO3(iso3Code, getCountryName))
              .filter((countryName: string) => countryName && countryName !== iso3Code); // Filter out failed conversions
          } catch (error) {
            console.warn('Error processing countries for plan', plan.id, ':', error);
          }
        }
        
        return (
          <motion.div 
            key={plan.id}
            layout
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              transition: {
                duration: 0.4,
                delay: index * 0.05, // Stagger animation
                ease: [0.25, 0.46, 0.45, 0.94] // Custom easing
              }
            }}
            exit={{ 
              opacity: 0, 
              y: -20, 
              scale: 0.95,
              transition: {
                duration: 0.3,
                ease: [0.25, 0.46, 0.45, 0.94]
              }
            }}
            className={`bg-white border border-gray-200 transition-all duration-200 ${
            isDesktop ? 'rounded-xl p-4' : 'rounded-2xl p-4'
          }`}
            whileHover={{ 
              scale: 1.01, 
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' 
            }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 30 
            }}
          >
            {isDesktop ? (
              // Desktop Layout - Horizontal single row
              <div className="flex items-center justify-between">
                {/* Left: Flag + Country + Technology */}
                <div className="flex items-center space-x-4">
                  {/* Flag */}
                  <div className="w-12 h-8 rounded-lg overflow-hidden flex items-center justify-center bg-gray-50 border flex-shrink-0">
                    {typeof flagOrIcon === 'string' ? (
                      isRegional ? (
                        <Globe className="w-6 h-6 text-blue-500" />
                      ) : (
                        <span 
                          className={flagOrIcon} 
                          style={{ transform: 'scale(1.8)' }} 
                        />
                      )
                    ) : (
                      React.createElement(flagOrIcon, { className: "w-6 h-6 text-[#299ae4]" })
                    )}
                  </div>
                  
                  {/* Country Name */}
                  <h3 className="text-lg font-semibold text-gray-900 min-w-[120px]">
                    {displayName}
                  </h3>
                  
                  {/* Technology Icon */}
                  <div className="flex items-center justify-center">
                    {getTechnologyIcon(technology)}
                  </div>
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
                  <div className="text-2xl font-bold text-[#299ae4]">
                    {displayPrice}
                  </div>
                  <Button
                    onClick={() => handlePurchase(plan.id)}
                    className={`rounded-full px-6 py-3 font-semibold transition-all duration-200 shadow-md hover:shadow-lg ${
                      isInCart(plan.id)
                        ? 'bg-green-500 hover:bg-green-600 text-white'
                        : 'bg-[#299ae4] hover:bg-[#299ae4]/90 text-white'
                    }`}
                  >
                    {isInCart(plan.id) ? t('plan.added') : t('plan.buy')}
                  </Button>
                </div>
              </div>
            ) : (
              // Mobile Layout - Original vertical layout
              <>
                {/* Header with Flag and Country/Region */}
                <div className="relative flex items-center mb-6">
                  {/* Block 1: Flag, Name, Technology Icon */}
                  <div className="flex items-center space-x-2">
                    {/* Flag or Regional Icon */}
                    <div className="w-10 h-7 rounded-lg overflow-hidden flex items-center justify-center bg-gray-50 border flex-shrink-0">
                      {typeof flagOrIcon === 'string' ? (
                        isRegional ? (
                          <Globe className="w-6 h-6 text-primary" />
                        ) : (
                          <span 
                            className={flagOrIcon} 
                            style={{ transform: 'scale(1.2)' }} 
                          />
                        )
                      ) : (
                        React.createElement(flagOrIcon, { className: "w-6 h-6 text-[#299ae4]" })
                      )}
                    </div>
                    
                    {/* Country/Region Name and Technology Icon */}
                    <div className="flex items-center space-x-1">
                      <h3 className="text-base font-semibold text-gray-900 truncate">{displayName}</h3>
                      {/* Technology Icon */}
                      {getTechnologyIcon(technology)}
                    </div>
                  </div>
                  
                  {/* Price - Positioned in top-right corner */}
                  <div className="absolute top-0 right-0 text-xl font-bold text-primary">
                    {displayPrice}
                  </div>
                  
                  {/* Regional Button - Positioned absolutely to align with card edge */}
                  {isRegional && coverageCountries.length > 0 && (
                    <button
                      onClick={() => toggleRegionalCoverage(plan.id)}
                      className="absolute -top-2 -right-2 flex items-center space-x-1 px-3 py-1 bg-primary text-white rounded-full text-sm font-medium hover:bg-primary/90 transition-colors duration-200 shadow-lg z-10"
                    >
                      <span>{t('plan.regional_plan')}</span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>
                
                {/* Regional Coverage Dropdown */}
                {isRegional && isExpanded && coverageCountries.length > 0 && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">{t('plan.regional_coverage')}</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {coverageCountries.map((country, index) => (
                        <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0"></div>
                          <span>{country}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Plan Details */}
                <div className="flex items-center justify-start mb-4">
                  <div className="flex items-center space-x-4">
                    {/* Data Amount */}
                    {gbAmount !== null && gbAmount !== undefined && (
                      <div>
                        <div className="text-base font-medium text-gray-900 whitespace-nowrap">
                          {gbAmount < 1 ? `${Math.round(gbAmount * 1024)} MB` : `${gbAmount} GB`}
                        </div>
                        <div className="text-xs text-gray-500">{t('plan.data')}</div>
                      </div>
                    )}
                    
                    {/* Validity */}
                    {validityDays !== null && validityDays !== undefined && (
                      <div>
                        <div className="text-base font-medium text-gray-900 whitespace-nowrap">{validityDays} {t('plan.days')}</div>
                        <div className="text-xs text-gray-500">{t('plan.validity')}</div>
                      </div>
                    )}
                    
                    {/* Show plan name if no GB or validity found */}
                    {(gbAmount === null || gbAmount === undefined) && (validityDays === null || validityDays === undefined) && (
                      <div>
                        <div className="text-sm font-medium text-gray-900 max-w-48 truncate">{plan.name}</div>
                        <div className="text-xs text-gray-500">{t('plan.plan')}</div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Purchase Button */}
                <div className="flex justify-end">
                  <Button
                    onClick={() => handlePurchase(plan.id)}
                    className={`px-6 py-2 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl ${
                      isInCart(plan.id)
                        ? 'bg-green-500 hover:bg-green-600 text-white'
                        : 'bg-primary hover:bg-primary/90 text-white'
                    }`}
                  >
                    {isInCart(plan.id) ? t('plan.added') : t('plan.buy')}
                  </Button>
                </div>
              </>
            )}
          </motion.div>
        );
        })}
      </AnimatePresence>
    </div>
  );
};