import React from 'react';
import { Filter, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
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
  isVisible: boolean;
  onToggleVisibility: () => void;
}

export const PlanFilters: React.FC<PlanFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  isVisible,
  onToggleVisibility
}) => {
  const { t } = useTranslation();
  const isDesktop = useIsDesktop();

  const validityOptions = [
    { value: '1_7_days', label: '1-7 días' },
    { value: '8_15_days', label: '8-15 días' },
    { value: '16_30_days', label: '16-30 días' },
    { value: '30_plus_days', label: 'Más de 30 días' }
  ];

  const dataOptions = [
    { value: 'under_1gb', label: 'Menos de 1 GB' },
    { value: '1_5gb', label: '1-5 GB' },
    { value: '6_10gb', label: '6-10 GB' },
    { value: '11_20gb', label: '11-20 GB' },
    { value: 'over_20gb', label: 'Más de 20 GB' },
    { value: 'unlimited', label: 'Ilimitado' }
  ];

  const planTypeOptions = [
    { value: 'country', label: 'Planes por País' },
    { value: 'regional', label: 'Planes Regionales' }
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
    <div className="w-full">
      {/* Filter Toggle Button */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onToggleVisibility}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl border transition-all duration-200 ${
            isVisible || hasActiveFilters
              ? 'bg-primary/10 border-primary/20 text-primary'
              : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Filter className="w-4 h-4" />
          <span className="font-medium">Filtros</span>
          {hasActiveFilters && (
            <span className="bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {Object.keys(filters).length}
            </span>
          )}
        </button>

        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 text-sm"
          >
            <X className="w-4 h-4" />
            <span>Limpiar filtros</span>
          </button>
        )}
      </div>

      {/* Filter Panel */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className={`bg-white border border-gray-200 rounded-xl p-6 mb-6 ${
              isDesktop ? 'grid grid-cols-3 gap-6' : 'space-y-6'
            }`}>
              {/* Plan Type Filter */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Tipo de Plan</h3>
                <div className="space-y-2">
                  {planTypeOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleFilterChange('planType', option.value)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                        filters.planType === option.value
                          ? 'bg-primary/10 text-primary border border-primary/20'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-transparent'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Data Amount Filter */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Cantidad de Datos</h3>
                <div className="space-y-2">
                  {dataOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleFilterChange('dataAmount', option.value)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                        filters.dataAmount === option.value
                          ? 'bg-primary/10 text-primary border border-primary/20'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-transparent'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Validity Filter */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Vigencia</h3>
                <div className="space-y-2">
                  {validityOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleFilterChange('validity', option.value)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                        filters.validity === option.value
                          ? 'bg-primary/10 text-primary border border-primary/20'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-transparent'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};