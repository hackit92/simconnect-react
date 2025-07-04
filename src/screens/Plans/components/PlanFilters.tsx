import React from 'react';
import { RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useIsDesktop } from '../../../hooks/useIsDesktop';

export interface FilterValues {
  validity?: string;
  dataAmount?: string;
  planType?: string;
}

interface PlanFiltersProps {
  filters: FilterValues;
  onFiltersChange: (filters: FilterValues) => void;
  onClearFilters: () => void;
}

export const PlanFilters: React.FC<PlanFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters
}) => {
  const { t } = useTranslation();
  const isDesktop = useIsDesktop();

  const validityOptions = [
    { value: '5', label: '5' },
    { value: '10', label: '10' },
    { value: '15', label: '15' },
    { value: '30', label: '30' }
  ];

  const dataOptions = [
    { value: '3', label: '3' },
    { value: '5', label: '5' },
    { value: '10', label: '10' },
    { value: '20', label: '20' }
  ];

  const planTypeOptions = [
    { value: 'country', label: 'LOCAL' },
    { value: 'regional', label: 'REGIONAL' }
  ];

  const handleFilterChange = (filterType: keyof FilterValues, value: string) => {
    const newFilters = { ...filters };
    
    if (newFilters[filterType] === value) {
      // If same value is selected, remove the filter
      delete newFilters[filterType];
    } else {
      // Set new filter value
      newFilters[filterType] = value;
    }
    
    onFiltersChange(newFilters);
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-gray-50 rounded-2xl p-6 mb-6 ${
        isDesktop ? '' : ''
      }`}
    >
      <div className={`${
        isDesktop ? 'grid grid-cols-4 gap-8 items-start' : 'space-y-6'
      }`}>
        {/* Validity Filter */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-4 tracking-wide uppercase">
            {t('plans.filters.duration')}
          </h3>
          <div className={`flex gap-2 ${isDesktop ? 'flex-wrap' : 'flex-wrap'}`}>
            {validityOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleFilterChange('validity', option.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
                  filters.validity === option.value
                    ? 'bg-primary text-white border-primary shadow-md'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Data Amount Filter */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-4 tracking-wide uppercase">
            {t('plans.filters.data')}
          </h3>
          <div className={`flex gap-2 ${isDesktop ? 'flex-wrap' : 'flex-wrap'}`}>
            {dataOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleFilterChange('dataAmount', option.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
                  filters.dataAmount === option.value
                    ? 'bg-primary text-white border-primary shadow-md'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Plan Type Filter */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-4 tracking-wide uppercase">
            {t('plans.filters.plan_type')}
          </h3>
          <div className={`flex gap-2 ${isDesktop ? 'flex-wrap' : 'flex-wrap'}`}>
            {planTypeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleFilterChange('planType', option.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
                  filters.planType === option.value
                    ? 'bg-primary text-white border-primary shadow-md'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                {option.value === 'country' ? t('plans.filters.local') : t('plans.filters.regional')}
              </button>
            ))}
          </div>
        </div>

        {/* Clear Filters Button */}
        <div className={`${isDesktop ? 'flex justify-end items-start' : 'flex justify-center'}`}>
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="flex items-center gap-2 px-4 py-2 text-gray-500 hover:text-gray-700 transition-colors duration-200 bg-white border border-gray-200 rounded-full hover:border-gray-300 hover:bg-gray-50"
              title={t('common.clear_filters')}
            >
              <RotateCcw className="w-4 h-4" />
              {isDesktop && <span className="text-sm font-medium">{t('plans.filters.clear')}</span>}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};