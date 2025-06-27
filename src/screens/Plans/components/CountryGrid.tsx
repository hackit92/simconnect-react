import React from 'react';
import { Search, Check } from 'lucide-react';
import type { Category } from "../../../lib/supabase";
import { countryUtils } from '../../../lib/countries/countryUtils';
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
  const isDesktop = useIsDesktop();

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
        <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron países</h3>
        <p className="text-gray-500 max-w-sm">
          Intenta ajustar tu búsqueda o verifica que los datos estén sincronizados correctamente.
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
              <button
                key={category.id}
                onClick={() => onSelectCategory(category.id)}
                className={`group relative w-full rounded-lg transition-all duration-200 p-3 text-left ${
                  isSelected
                    ? 'bg-blue-50 border-2 border-blue-200'
                    : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                }`}
                title={countryName}
              >
                <div className="flex items-center space-x-3">
                  {/* Flag Container */}
                  <div className="relative w-8 h-5 rounded overflow-hidden flex items-center justify-center bg-white shadow-sm flex-shrink-0">
                    <span 
                      className={countryCode} 
                      style={{ transform: 'scale(1.5)' }} 
                    />
                  </div>
                  
                  {/* Country Name */}
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-xs font-medium transition-colors duration-200 truncate ${
                      isSelected ? 'text-blue-700' : 'text-gray-900'
                    }`}>
                      {countryName}
                    </h3>
                  </div>
                  
                  {/* Selection indicator */}
                  {isSelected && (
                    <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-2 h-2 text-white" />
                    </div>
                  )}
                </div>
              </button>
            );
          } else {
            // Mobile: Original card layout
            return (
              <button
                key={category.id}
                onClick={() => onSelectCategory(category.id)}
                className={`group relative w-full rounded-2xl transition-all duration-200 ${
                  isSelected
                    ? 'bg-blue-50 border-2 border-blue-200'
                    : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center p-4">
                  {/* Flag Container */}
                  <div className="relative w-12 h-8 rounded-lg overflow-hidden flex items-center justify-center bg-white shadow-sm">
                    <span 
                      className={countryCode} 
                      style={{ transform: 'scale(1.8)' }} 
                    />
                  </div>
                  
                  {/* Country Info */}
                  <div className="flex-1 ml-4 text-left">
                    <h3 className={`text-base font-semibold transition-colors duration-200 ${
                      isSelected ? 'text-blue-700' : 'text-gray-900'
                    }`}>
                      {countryName}
                    </h3>
                  </div>
                  
                  {/* Selection indicator */}
                  {isSelected && (
                    <div className="ml-3 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              </button>
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
            Anterior
          </button>
          
          <span className="px-4 py-2 text-sm text-gray-600">
            Página {currentPage} de {totalPages}
          </span>
          
          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
};