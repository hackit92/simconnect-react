import React, { useState, useEffect } from 'react';
import { ArrowLeft, AlertCircle, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { CardContent } from "../../components/ui/card";
import { useCurrency } from '../../contexts/CurrencyContext';
import { useIsDesktop } from '../../hooks/useIsDesktop';
import { SearchBar } from './components/SearchBar';
import { TabSelector } from './components/TabSelector';
import { CountryGrid } from './components/CountryGrid';
import { RegionGrid } from './components/RegionGrid';
import { PlanList } from './components/PlanList';
import { SyncButton } from './components/SyncButton';
import { usePlans } from './hooks/usePlans';
import { useSync } from './hooks/useSync';
import { useDebounce } from '../../hooks/useDebounce';
import { supabase, type Category, type Product } from '../../lib/supabase';
import { IntelligentSearch, type SearchSuggestion } from '../../lib/search/searchUtils';
import { countryUtils } from '../../lib/countries/countryUtils';

interface PlansProps {
  isEmbedded?: boolean;
}

export const Plans: React.FC<PlansProps> = ({ isEmbedded = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState<'countries' | 'regions'>('countries');
  const [showGrids, setShowGrids] = useState(false);
  const { selectedCurrency } = useCurrency();
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>();
  const [selectedRegion, setSelectedRegion] = useState<string | undefined>();
  const [currentCategoryPage, setCurrentCategoryPage] = useState(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [searchEngine, setSearchEngine] = useState<IntelligentSearch | null>(null);
  const isDesktop = useIsDesktop();
  
  const categoriesPerPage = isDesktop ? 30 : 6;
  
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  
  const {
    products,
    loading,
    error,
    refetch
  } = usePlans({
    searchTerm: debouncedSearchTerm,
    selectedCategory,
    selectedRegion,
    currentPage: 1,
    pageSize: 20
  });

  const { handleSync, syncing } = useSync();

  // Load data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setCategoriesLoading(true);
      setCategoriesError(null);
      
      try {
        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('wc_categories')
          .select('*')
          .order('name');
        
        if (categoriesError) throw categoriesError;
        
        // Fetch all products for region analysis
        const { data: productsData, error: productsError } = await supabase
          .from('wc_products')
          .select('*')
          .eq('active', true);
        
        if (productsError) throw productsError;
        
        setCategories(categoriesData || []);
        setAllProducts(productsData || []);
        setFilteredCategories(categoriesData || []);
        
        // Initialize search engine
        if (categoriesData) {
          const search = new IntelligentSearch(categoriesData);
          setSearchEngine(search);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setCategoriesError('Error al cargar los datos. Por favor intente nuevamente.');
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter categories based on search term - REMOVED AUTO-SELECTION
  useEffect(() => {
    if (!searchEngine) return;
    
    if (debouncedSearchTerm.trim()) {
      const filtered = searchEngine.search(debouncedSearchTerm);
      setFilteredCategories(filtered);
      setShowGrids(true); // Show grids when user searches
      
      // REMOVED: Auto-selection logic that was causing confusion
      // Users now need to explicitly click on suggestions or countries
    } else {
      setFilteredCategories(categories);
      // Clear selections when search is empty
      setSelectedCategory(undefined);
      setSelectedRegion(undefined);
      setShowGrids(false); // Hide grids when search is cleared
    }
  }, [debouncedSearchTerm, searchEngine, categories]);

  // Reset page when search term or category changes
  useEffect(() => {
    setCurrentCategoryPage(1);
  }, [debouncedSearchTerm, selectedCategory, selectedRegion]);

  // Reset selected category/region when switching tabs
  useEffect(() => {
    setSelectedCategory(undefined);
    setSelectedRegion(undefined);
    setCurrentCategoryPage(1);
    // Show grids when user explicitly selects a tab
    if (selectedTab) {
      setShowGrids(true);
    }
  }, [selectedTab]);

  const handleCategorySelect = (categoryId: number) => {
    setSelectedCategory(categoryId === selectedCategory ? undefined : categoryId);
    setSelectedRegion(undefined); // Clear region selection when selecting country
    
    // Debug: Log category selection and check for products
    console.log('Selected category ID:', categoryId);
    const selectedCat = categories.find(cat => cat.id === categoryId);
    console.log('Selected category data:', selectedCat);
    
    // Check if there are products with this category ID
    const productsWithCategory = allProducts.filter(product => {
      const categoryIds = product.category_ids || [];
      const hasCategory = Array.isArray(categoryIds) && categoryIds.includes(categoryId);
      console.log(`Product ${product.name} (${product.sku}):`, {
        categoryIds,
        hasCategory,
        planType: product.plan_type,
        countryCode: product.country_code
      });
      return hasCategory;
    });
    console.log(`Found ${productsWithCategory.length} products for category ${categoryId}:`, productsWithCategory);
  };

  const handleRegionSelect = (regionValue: string) => {
    setSelectedRegion(regionValue === selectedRegion ? undefined : regionValue);
    setSelectedCategory(undefined); // Clear category selection when selecting region
  };

  const handleSyncData = async () => {
    await handleSync();
    refetch();
  };

  const handleCategoryPageChange = (page: number) => {
    setCurrentCategoryPage(page);
  };

  const handleTabChange = (tab: 'countries' | 'regions') => {
    setSelectedTab(tab);
    setShowGrids(true); // Show grids when user selects a tab
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    // Show grids immediately when user starts typing
    if (value.trim()) {
      setShowGrids(true);
    }
  };

  // NEW: Handle suggestion click with explicit selection
  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setSearchTerm(suggestion.text);
    
    if (suggestion.type === 'country' && suggestion.id) {
      // Directly select the country
      setSelectedCategory(suggestion.id);
      setSelectedRegion(undefined);
      setSelectedTab('countries');
    } else if (suggestion.type === 'region' && suggestion.value) {
      // Directly select the region
      setSelectedRegion(suggestion.value);
      setSelectedCategory(undefined);
      setSelectedTab('regions');
    }
  };

  // Calculate pagination for categories
  const totalCategoryPages = Math.ceil(filteredCategories.length / categoriesPerPage);
  const paginatedCategories = filteredCategories.slice(
    (currentCategoryPage - 1) * categoriesPerPage,
    currentCategoryPage * categoriesPerPage
  );

  // Generate intelligent suggestions
  const suggestions = searchEngine && searchTerm.length >= 2 
    ? searchEngine.getSuggestions(searchTerm)
    : [];

  const clearSearch = () => {
    setSearchTerm('');
    setSelectedCategory(undefined);
    setSelectedRegion(undefined);
    setFilteredCategories(categories); // Reset filtered categories
    setShowGrids(false); // Hide grids when clearing search
  };

  const selectedCategoryData = categories.find(cat => cat.id === selectedCategory);

  // Get region name for display
  const getRegionDisplayName = (regionValue: string): string => {
    const regionNames: Record<string, string> = {
      'latinoamerica': 'Latinoamérica',
      'europa': 'Europa',
      'norteamerica': 'Norteamérica',
      'balcanes': 'Balcanes',
      'oriente-medio': 'Oriente Medio',
      'caribe': 'Caribe',
      'caucaso': 'Cáucaso',
      'asia-central': 'Asia Central'
    };
    return regionNames[regionValue] || regionValue;
  };

  // Determine if we should show plans
  const shouldShowPlans = selectedCategory || selectedRegion;

  return (
    <CardContent className={`flex flex-col px-0 py-0 relative self-stretch w-full bg-white ${
      isEmbedded ? 'min-h-0' : 'min-h-screen'
    }`}>
      <div className="flex flex-col w-full">
        {/* Header with Search - Hide title when embedded */}
        <div className={`${
          isEmbedded ? 'px-0 pt-0 pb-4' : 'px-6 pt-6 pb-4'
        } ${
          isDesktop ? 'max-w-4xl mx-auto' : ''
        }`}>
          {!isEmbedded && (
            <div className="mb-6">
              <div className="text-center w-full mb-8">
                <h1 className="text-4xl font-normal text-gray-800 mb-3">
                  ¿Dónde necesitas <span className="text-primary font-semibold">Conectarte</span>?
                </h1>
                <p className="text-lg text-gray-600 mb-8">
                  Te ayudamos a conectarte desde cualquier parte del mundo.
                </p>
              </div>
            </div>
          )}
          
          <div className={`${isDesktop ? 'max-w-5xl mx-auto' : ''}`}>
            <SearchBar
              value={searchTerm}
              onChange={handleSearchChange}
              suggestions={suggestions}
              onSuggestionClick={handleSuggestionClick}
              onClear={clearSearch}
              placeholder="Buscar país..."
            />
          </div>
        </div>

        {/* Error Display */}
        {(error || categoriesError) && (
          <div className={`mb-6 bg-red-50 border border-red-200 rounded-2xl p-4 ${
            isEmbedded ? 'mx-0' : 'mx-6'
          }`}>
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
              <span className="text-red-700 font-medium">Error:</span>
              <span className="text-red-600 ml-1">{error || categoriesError}</span>
            </div>
          </div>
        )}

        {/* Loading State */}
        {(loading || categoriesLoading) && (
          <div className={`flex items-center justify-center ${isEmbedded ? 'py-8' : 'py-12'}`}>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-600">Cargando...</span>
          </div>
        )}

        {/* Content Area */}
        {!loading && !categoriesLoading && (
          <div className="flex-1">
            {/* Sync Button - Positioned absolutely in top right */}
            {!isEmbedded && (
              <div className="absolute top-6 right-6">
                <SyncButton onSync={handleSyncData} syncing={syncing} />
              </div>
            )}
            
            {isEmbedded && (
              <div className="flex justify-end mb-6 px-6">
                <SyncButton onSync={handleSyncData} syncing={syncing} />
              </div>
            )}
            
            {/* Two-column layout for desktop */}
            <div className={`${
              isDesktop && !isEmbedded
                ? 'max-w-7xl mx-auto px-8 flex flex-row gap-8' 
                : isEmbedded ? 'px-0 flex flex-col' : 'px-6 flex flex-col'
            }`}>
              
              {/* Left Column - Filters and Selection */}
              <div className={`${
                isDesktop && !isEmbedded
                  ? 'w-1/3' 
                  : 'w-full'
              }`}>
                {/* Tab Selector - Always visible when no country/region is selected */}
                {!selectedCategory && !selectedRegion && !showGrids && (
                  <div className={`mb-6 ${
                    isDesktop ? '' : ''
                  }`}>
                    <TabSelector
                      selectedTab={selectedTab}
                      onTabChange={handleTabChange}
                    />
                  </div>
                )}

                {/* Tab Selector - Show when grids are visible but no selection made */}
                {!selectedCategory && !selectedRegion && showGrids && (
                  <div className={`mb-6 ${
                    isDesktop ? '' : ''
                  }`}>
                    <div className="flex items-center justify-center relative">
                      {/* Back button positioned absolutely to the left */}
                      <button
                        onClick={() => setShowGrids(false)}
                        className="absolute left-0 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-all duration-200"
                        title="Volver"
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </button>
                      
                      {/* Centered tabs */}
                      <TabSelector
                        selectedTab={selectedTab}
                        onTabChange={handleTabChange}
                      />
                    </div>
                  </div>
                )}

                {/* Selected Country/Region Header */}
                {(selectedCategory || selectedRegion) && (
                  <div className="mb-6">
                    <button
                      onClick={() => {
                        setSelectedCategory(undefined);
                        setSelectedRegion(undefined);
                        setSearchTerm(''); // Clear search when going back
                      }}
                      className="flex items-center space-x-3 text-blue-600 hover:text-blue-700 transition-colors duration-200"
                    >
                      <ArrowLeft className="w-5 h-5" />
                      <span className="font-medium">
                        Volver a {selectedTab === 'countries' ? 'países' : 'regiones'}
                      </span>
                    </button>
                    
                    {selectedRegion && (
                      <div className="mt-2">
                        <h2 className="text-xl font-bold text-gray-900">
                          Planes para {getRegionDisplayName(selectedRegion)}
                        </h2>
                      </div>
                    )}
                  </div>
                )}

                {/* Countries/Regions Grid - Show when tab is selected but no country/region is selected and no search */}
                {!selectedCategory && !selectedRegion && !debouncedSearchTerm.trim() && showGrids && (
                  <div className="mb-8">
                    {selectedTab === 'countries' ? (
                      <CountryGrid
                        categories={paginatedCategories}
                        selectedCategory={selectedCategory}
                        onSelectCategory={handleCategorySelect}
                        currentPage={currentCategoryPage}
                        totalPages={totalCategoryPages}
                        onPageChange={handleCategoryPageChange}
                      />
                    ) : (
                      <RegionGrid
                        categories={filteredCategories}
                        products={allProducts}
                        selectedCategory={selectedCategory}
                        onSelectCategory={handleCategorySelect}
                        onSelectRegion={handleRegionSelect}
                        currentPage={currentCategoryPage}
                        totalPages={totalCategoryPages}
                        onPageChange={handleCategoryPageChange}
                      />
                    )}
                  </div>
                )}

                {/* Search Results for Countries/Regions */}
                {debouncedSearchTerm.trim() && !selectedCategory && !selectedRegion && filteredCategories.length > 0 && showGrids && (
                  <div className="mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">
                      Países encontrados para "{debouncedSearchTerm}"
                    </h2>
                    <CountryGrid
                      categories={paginatedCategories}
                      selectedCategory={selectedCategory}
                      onSelectCategory={handleCategorySelect}
                      currentPage={currentCategoryPage}
                      totalPages={totalCategoryPages}
                      onPageChange={handleCategoryPageChange}
                    />
                  </div>
                )}

                {/* No Results Message */}
                {debouncedSearchTerm.trim() && !selectedCategory && !selectedRegion && filteredCategories.length === 0 && showGrids && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                      <Globe className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron resultados</h3>
                    <p className="text-gray-500 max-w-sm mb-4">
                      No encontramos países o regiones que coincidan con "{debouncedSearchTerm}".
                    </p>
                    <button
                      onClick={clearSearch}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Limpiar búsqueda
                    </button>
                  </div>
                )}

                {/* Welcome Message - Show when no search, no selection, and data is loaded */}
                {!isDesktop && !debouncedSearchTerm.trim() && !selectedCategory && !selectedRegion && !categoriesLoading && categories.length > 0 && !showGrids && (
                  <div className={`text-center ${isEmbedded ? 'py-6' : 'py-8'}`}>
                    <div className="max-w-md mx-auto">
                      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-blue-50 flex items-center justify-center">
                        <Globe className="w-10 h-10 text-[#299ae4]" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">
                        Encuentra tu plan perfecto
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Usa el buscador arriba o las pestañas de "Países" y "Regiones" para explorar nuestros planes de datos móviles
                      </p>
                      
                      <div className="space-y-3 text-sm text-gray-500">
                        <div className="flex items-center justify-center space-x-2">
                          <span className="w-2 h-2 bg-[#299ae4] rounded-full"></span>
                          <span>Más de 200 países disponibles</span>
                        </div>
                        <div className="flex items-center justify-center space-x-2">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          <span>Planes regionales y por país</span>
                        </div>
                        <div className="flex items-center justify-center space-x-2">
                          <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                          <span>Activación instantánea</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Empty State - Show when no data is loaded */}
                {!isDesktop && !debouncedSearchTerm.trim() && !selectedCategory && !selectedRegion && !categoriesLoading && categories.length === 0 && !showGrids && (
                  <div className={`text-center ${isEmbedded ? 'py-6' : 'py-8'}`}>
                    <div className="max-w-md mx-auto">
                      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
                        <Globe className="w-10 h-10 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">
                        No hay datos disponibles
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Parece que no hay países o planes cargados. Intenta sincronizar los datos.
                      </p>
                      <SyncButton onSync={handleSyncData} syncing={syncing} />
                    </div>
                  </div>
                )}
              </div>
              
              {/* Right Column - Plans List */}
              <div className={`${
                isDesktop && !isEmbedded
                  ? 'w-2/3 pl-8 border-l border-gray-100' 
                  : 'w-full mt-6'
              }`}>
                {/* Currency indicator */}
                {(selectedCategory || selectedRegion) && (
                  <div className="mb-4 text-sm text-gray-600">
                    Precios mostrados en: <span className="font-semibold">{selectedCurrency}</span>
                  </div>
                )}
                
                {/* Plans List - Show when country/region is selected */}
                {shouldShowPlans && (
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-6">
                      Planes Disponibles
                      {selectedRegion && ` - ${getRegionDisplayName(selectedRegion)}`}
                      {selectedCategoryData && ` - ${countryUtils.getCountryName(selectedCategoryData.slug)}`}
                    </h2>
                    <PlanList
                      products={products}
                      loading={loading}
                      selectedCategory={selectedCategory}
                      selectedCategoryData={selectedCategoryData}
                      categories={categories}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </CardContent>
  );
};