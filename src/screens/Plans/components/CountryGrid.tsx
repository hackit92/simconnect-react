import React from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Category } from "../../../lib/supabase";
import { useCountryName } from '../../../hooks/useCountryName';
import { useIsDesktop } from '../../../hooks/useIsDesktop';

interface CountryGridProps {
  categories: Category[];
  selectedCategory: number | undefined;
  onSelectCategory: (id: number) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const CountryGrid: React.FC<CountryGridProps> = ({
  categories,
  selectedCategory, 
  onSelectCategory,
  currentPage,
  totalPages,
  onPageChange
}) => {
  const { t } = useTranslation();
  const isDesktop = useIsDesktop();
  const { getCountryName } = useCountryName();

  // Adjust grid columns based on screen size
  const getGridCols = () => {
    if (!isDesktop) return '';
    // For desktop, use responsive grid that shows more countries
    return 'grid grid-cols-4 xl:grid-cols-6 2xl:grid-cols-7 gap-3';
  };
  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
          <Search className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">{t('plans.no_countries_found')}</h3>
        <p className="text-gray-500 max-w-sm">
          {t('plans.no_countries_message')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Country List */}
      <div className={`${
        isDesktop 
          ? getGridCols()
          : 'space-y-3'
      }`}>
        {categories.map((category) => {
          const countryCode = countryUtils.getFlagClass(category.slug);
          const countryName = countryUtils.getCountryName(category.slug);
          const isSelected = selectedCategory === category.id;
          
          if (isDesktop) {
            // Desktop: Compact grid layout
            return (
              <motion.button
                key={category.id}
                onClick={() => onSelectCategory(category.id)}
                className={`group relative w-full rounded-lg transition-all duration-200 p-3 text-left ${
                  isSelected
                    ? 'bg-primary/10 border-2 border-primary/20'
                    : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                }`}
                title={countryName}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center space-x-3">
                  {/* Flag Container */}
                  <div className="relative w-8 h-5 rounded overflow-hidden flex items-center justify-center bg-white shadow-sm flex-shrink-0">
                    <span 
                      className={countryUtils.getFlagClass(category.slug)}
                      style={{ transform: 'scale(1.5)' }} 
                    />
                  </div>
                  
                  {/* Country Name */}
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-xs font-medium transition-colors duration-200 truncate ${
                      isSelected ? 'text-primary' : 'text-gray-900'
                    }`}>
                      {getCountryName(category.slug)}
                    </h3>
                  </div>
                  
                  {/* Selection indicator */}
                  {isSelected && (
                    <div className="w-3 h-3 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-2 h-2 text-white" />
                    </div>
                  )}
                </div>
              </motion.button>
            );
          } else {
            // Mobile: Original card layout
            return (
              <motion.button
                key={category.id}
                onClick={() => onSelectCategory(category.id)}
                className={`group relative w-full rounded-2xl transition-all duration-200 ${
                  isSelected
                    ? 'bg-primary/10 border-2 border-primary/20'
                    : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center p-4">
                  {/* Flag Container */}
                  <div className="relative w-12 h-8 rounded-lg overflow-hidden flex items-center justify-center bg-white shadow-sm">
                    <span 
                      className={countryUtils.getFlagClass(category.slug)}
                      style={{ transform: 'scale(1.8)' }} 
                    />
                  </div>
                  
                  {/* Country Info */}
                  <div className="flex-1 ml-4 text-left">
                    <h3 className={`text-base font-semibold transition-colors duration-200 ${
                      isSelected ? 'text-primary' : 'text-gray-900'
                    }`}>
                      {getCountryName(category.slug)}
                    </h3>
                  </div>
                  
                  {/* Selection indicator */}
                  {isSelected && (
                    <div className="ml-3 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              </motion.button>
            );
          }
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center pt-6 space-x-2">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {t('plans.previous')}
          </button>
          
          <span className="px-4 py-2 text-sm text-gray-600">
            {t('plans.page_of', { current: currentPage, total: totalPages })}
          </span>
          
          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {t('plans.next')}
          </button>
        </div>
      )}
    </div>
  );
};