import React, { useState, useEffect } from 'react';
import { ArrowLeft, AlertCircle, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { CardContent } from "../../components/ui/card";
import { useCurrency } from '../../contexts/CurrencyContext';
import { useCart } from '../../contexts/CartContext';
import { useIsDesktop } from '../../hooks/useIsDesktop';
import { SearchBar } from './components/SearchBar';
import { TabSelector } from './components/TabSelector';
import { CountryGrid } from './components/CountryGrid';
import { RegionGrid } from './components/RegionGrid';
import { PlanList } from './components/PlanList';
import { SyncButton } from './components/SyncButton';
import { PlanFilters, type FilterValues } from './components/PlanFilters';
import { usePlans } from './hooks/usePlans';
import { useSync } from './hooks/useSync';
import { useDebounce } from '../../hooks/useDebounce';
import { supabase, type Category, type Product } from '../../lib/supabase';
import { IntelligentSearch, type SearchSuggestion } from '../../lib/search/searchUtils';
import { useCountryName } from '../../hooks/useCountryName';
import { countryUtils } from '../../lib/countries/countryUtils';

interface PlansProps {
  isEmbedded?: boolean;
}

export const Plans: React.FC<PlansProps> = ({ isEmbedded = false }) => {
  const { t, i18n } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState<'countries' | 'regions'>('countries');
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(true);
  const [filters, setFilters] = useState<FilterValues>({});
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
  const { getCountryName } = useCountryName();
  
  const categoriesPerPage = isDesktop ? 30 : 6;
  
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  
  const {
    products: plans,
    loading,
    error,
    refetch
  } = usePlans({
    searchTerm: debouncedSearchTerm,
    selectedCategory,
    selectedRegion,
    filters,
    allCategories: categories,
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
        console.log('Fetching categories and products...');
        
        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('wc_categories')
          .select('*')
          .order('name');
        
        if (categoriesError) {
          console.error('Categories error:', categoriesError);
          throw new Error(`Categories fetch failed: ${categoriesError.message}`);
        }
        
        console.log('Categories fetched:', categoriesData?.length || 0);
        
        // Fetch all products for region analysis
        const { data: productsData, error: productsError } = await supabase
          .from('wc_products')
          .select('*')
          .eq('active', true);
        
        if (productsError) {
          console.error('Products error:', productsError);
          throw new Error(`Products fetch failed: ${productsError.message}`);
        }
        
        console.log('Products fetched:', productsData?.length || 0);
        
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
        
        let errorMessage = 'Error al cargar los datos. Por favor intente nuevamente.';
        if (err instanceof Error) {
          if (err.message.includes('Failed to fetch')) {
            errorMessage = 'Error de conexión. Verifique su conexión a internet y que Supabase esté accesible.';
          } else {
            errorMessage = `Error: ${err.message}`;
          }
        }
        setCategoriesError(errorMessage);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter categories based on search term
  useEffect(() => {
    if (!searchEngine) return;
    
    if (debouncedSearchTerm.trim()) {
      const filtered = searchEngine.search(debouncedSearchTerm);
      setFilteredCategories(filtered);
      // Clear selections when searching
      setSelectedCategory(undefined);
      setSelectedRegion(undefined);
      setFilters({});
    } else {
      setFilteredCategories(categories);
      // Don't clear selections when search is empty - let user keep their selection
    }
  }, [debouncedSearchTerm, searchEngine, categories]);

  // Reset page when search term or category changes
  useEffect(() => {
    setCurrentCategoryPage(1);
  }, [debouncedSearchTerm, selectedCategory, selectedRegion, filters]);

  // Reset selected category/region when switching tabs
  useEffect(() => {
    setSelectedCategory(undefined);
    setSelectedRegion(undefined);
    setFilters({});
    setCurrentCategoryPage(1);
  }, [selectedTab]);

  const handleCategorySelect = (categoryId: number) => {
    const newSelectedCategory = categoryId === selectedCategory ? undefined : categoryId;
    setSelectedCategory(newSelectedCategory);
    setSelectedRegion(undefined); // Clear region selection when selecting country
    setFilters({}); // Clear filters when selecting category
    setShowWelcomeMessage(false); // Hide welcome message when user interacts
    
    // Clear search term when explicitly selecting a category to avoid conflicts
    if (newSelectedCategory !== undefined) {
      setSearchTerm('');
    }
  };

  const handleRegionSelect = (regionValue: string) => {
    const newSelectedRegion = regionValue === selectedRegion ? undefined : regionValue;
    setSelectedRegion(newSelectedRegion);
    setSelectedCategory(undefined); // Clear category selection when selecting region
    setFilters({}); // Clear filters when selecting region
    setShowWelcomeMessage(false); // Hide welcome message when user interacts
    
    // Clear search term when explicitly selecting a region to avoid conflicts
    if (newSelectedRegion !== undefined) {
      setSearchTerm('');
    }
  };

  const handleFiltersChange = (newFilters: FilterValues) => {
    setFilters(newFilters);
    setShowWelcomeMessage(false);
  };

  const handleClearFilters = () => {
    setFilters({});
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
    setShowWelcomeMessage(false); // Hide welcome message when user interacts with tabs
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    if (value.trim()) {
      setShowWelcomeMessage(false); // Hide welcome message when user starts searching
      setFilters({}); // Clear filters when searching
    }
  };

  // Handle suggestion click with explicit selection
  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    // Clear search term for clean filtering
    setSearchTerm('');
    setFilters({}); // Clear filters when selecting suggestion
    
    setShowWelcomeMessage(false); // Hide welcome message when user selects suggestion
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
    ? searchEngine.getSuggestions(searchTerm, i18n.language)
    : [];

  const clearSearch = () => {
    setSearchTerm('');
    setSelectedCategory(undefined);
    setSelectedRegion(undefined);
    setFilters({});
    setFilteredCategories(categories);
    setSelectedTab('countries'); // Default to countries tab
    setShowWelcomeMessage(true); // Show welcome message when clearing search
  };

  const selectedCategoryData = categories.find(cat => cat.id === selectedCategory);

  // Get region name for display
  const getRegionDisplayName = (regionValue: string): string => {
    const regionNames: Record<string, string> = {
      'latinoamerica': t('region.latinoamerica'),
      'europa': t('region.europa'),
      'norteamerica': t('region.norteamerica'),
      'balcanes': t('region.balcanes'),
      'oriente-medio': t('region.oriente-medio'),
      'caribe': t('region.caribe'),
      'asia-central': t('region.asia-central'),
      'africa': t('region.africa'),
      'oceania': t('region.oceania')
    };
    return regionNames[regionValue] || regionValue;
  };

  // Determine what to show based on current state
  const hasSearchTerm = debouncedSearchTerm.trim().length > 0;
  const hasSelection = selectedCategory || selectedRegion;
  const hasFilters = Object.keys(filters).length > 0;
  const shouldShowPlans = hasSelection || hasFilters;
  const shouldShowEmptyState = !hasSearchTerm && !hasSelection && !categoriesLoading && categories.length === 0;
  const shouldShowSearchResults = hasSearchTerm && filteredCategories.length > 0;
  const shouldShowNoResults = hasSearchTerm && filteredCategories.length === 0;
  
  // Control what lists are displayed
  const shouldShowCountriesList = !hasSearchTerm && !hasSelection && !hasFilters && selectedTab === 'countries' && !categoriesLoading && !showWelcomeMessage;
  const shouldShowRegionsList = !hasSearchTerm && !hasSelection && !hasFilters && selectedTab === 'regions' && !categoriesLoading;
  const shouldShowInitialWelcome = !hasSearchTerm && !hasSelection && !hasFilters && !categoriesLoading && categories.length > 0 && selectedTab === 'countries' && showWelcomeMessage;

  return (
    <CardContent className={`flex flex-col px-0 py-0 relative self-stretch w-full bg-white ${
      isEmbedded ? 'min-h-0' : 'min-h-screen'
    }`}>
      <div className="flex flex-col w-full">
        {/* Header with Search - Hide title when embedded */}
        <div className={`${
          isEmbedded ? 'px-0 pt-0 pb-4' : 'px-6 pt-6 pb-4'
        }`}>
          {!isEmbedded && (
            <div className="mb-6">
              <div className="text-center w-full mb-8">
                <h1 className="text-4xl font-normal text-gray-800 mb-3">
                  {t('plans.title')}
                </h1>
                <p className="text-lg text-gray-600 mb-8">
                  {t('plans.subtitle')}
                </p>
              </div>
            </div>
          )}
          
          <div className={`${isDesktop ? 'w-full max-w-none flex justify-center' : ''}`}>
            <div className={`${isDesktop ? 'w-3/5' : 'w-full'}`}>
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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3 text-gray-600">Cargando...</span>
          </div>
        )}

        {/* Content Area */}
        {!loading && !categoriesLoading && (
          <motion.div 
            className="flex-1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
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
                
                {/* Tab Selector - Show when no selection and no filters */}
                {!hasSelection && !hasFilters && (
                  <div className={`mb-6 ${isDesktop ? '' : ''}`}>
                    <TabSelector
                      selectedTab={selectedTab}
                      onTabChange={handleTabChange}
                    />
                  </div>
                )}

                {/* Selected Country/Region Header */}
                {hasSelection && (
                  <div className="mb-6">
                    {selectedCategory && (
                      <div className="flex items-center space-x-3 p-4 bg-primary/10 rounded-xl border border-primary/20">
                        <div className="w-8 h-5 rounded overflow-hidden flex items-center justify-center bg-white shadow-sm">
                          <span 
                            className={countryUtils.getFlagClass(selectedCategoryData?.slug || '')}
                            style={{ transform: 'scale(1.3)' }} 
                          />
                        </div>
                        <h3 className="text-lg font-semibold text-primary">
                          {t('plans.plans_for')} {getCountryName(selectedCategoryData?.slug || '')}
                        </h3>
                        <button
                          onClick={() => setSelectedCategory(undefined)}
                          className="ml-auto text-primary hover:text-primary/90 text-sm font-medium"
                        >
                          {t('common.change_country')}
                        </button>
                      </div>
                    )}
                    {selectedRegion && (
                      <div className="flex items-center space-x-3 p-4 bg-primary/10 rounded-xl border border-primary/20">
                        <Globe className="w-6 h-6 text-primary" />
                        <h3 className="text-lg font-semibold text-primary">
                          {t('plans.plans_for')} {getRegionDisplayName(selectedRegion)}
                        </h3>
                        <button
                          onClick={() => setSelectedRegion(undefined)}
                          className="ml-auto text-primary hover:text-primary/90 text-sm font-medium"
                        >
                          {t('common.change_region')}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Active Filters Display */}
                {hasFilters && !hasSelection && (
                  <div className="mb-6">
                    <div className="flex items-center space-x-3 p-4 bg-primary/10 rounded-xl border border-primary/20">
                      <div className="w-6 h-6 text-primary flex items-center justify-center">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-primary">
                        {t('common.filtered_plans')}
                      </h3>
                      <button
                        onClick={handleClearFilters}
                        className="ml-auto text-primary hover:text-primary/90 text-sm font-medium"
                      >
                        {t('common.clear_filters')}
                      </button>
                    </div>
                  </div>
                )}
                {/* Countries/Regions Grid - Show when tabs are visible and no search */}
                {shouldShowCountriesList && (
                  <div className="mb-8">
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

                {shouldShowRegionsList && (
                  <div className="mb-8">
                    <RegionGrid
                      categories={categories}
                      onSelectRegion={handleRegionSelect}
                    />
                  </div>
                )}

                {/* Search Results for Countries/Regions */}
                {shouldShowSearchResults && (
                  <div className="mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">
                      {t('plans.countries_found')} "{debouncedSearchTerm}"
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
                {shouldShowNoResults && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                      <Globe className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{t('plans.no_results')}</h3>
                    <p className="text-gray-500 max-w-sm mb-4">
                      {t('plans.no_results_message')} "{debouncedSearchTerm}".
                    </p>
                    <button
                      onClick={clearSearch}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      {t('plans.clear_search')}
                    </button>
                  </div>
                )}

                {/* Welcome Message - Show when no search, no selection, and data is loaded */}
                {shouldShowInitialWelcome && !isDesktop && (
                  <div className={`text-center ${isEmbedded ? 'py-6' : 'py-8'}`}>
                    <div className="max-w-md mx-auto">
                      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                        <Globe className="w-10 h-10 text-[#299ae4]" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">
                        {t('welcome.title')}
                      </h3>
                      <p className="text-gray-600 mb-6">
                        {t('welcome.message')}
                      </p>
                      
                      <div className="space-y-3 text-sm text-gray-500">
                        <div className="flex items-center justify-center space-x-2">
                          <span className="w-2 h-2 bg-primary rounded-full"></span>
                          <span>{t('welcome.feature1')}</span>
                        </div>
                        <div className="flex items-center justify-center space-x-2">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          <span>{t('welcome.feature2')}</span>
                        </div>
                        <div className="flex items-center justify-center space-x-2">
                          <span className="w-2 h-2 bg-primary rounded-full"></span>
                          <span>{t('welcome.feature3')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Empty State - Show when no data is loaded */}
                {shouldShowEmptyState && !isDesktop && (
                  <div className={`text-center ${isEmbedded ? 'py-6' : 'py-8'}`}>
                    <div className="max-w-md mx-auto">
                      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
                        <Globe className="w-10 h-10 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">
                        {t('welcome.no_data_title')}
                      </h3>
                      <p className="text-gray-600 mb-6">
                        {t('welcome.no_data_message')}
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
                {/* Plan Filters - Show when plans are displayed */}
                {shouldShowPlans && (
                  <div className="mb-6">
                    <PlanFilters
                      filters={filters}
                      onFiltersChange={handleFiltersChange}
                      onClearFilters={handleClearFilters}
                    />
                  </div>
                )}
                
                {/* Currency indicator */}
                {shouldShowPlans && (
                  <div className="mb-4 text-sm text-gray-600">
                    {t('cart.prices_in')} <span className="font-semibold">{selectedCurrency}</span>
                  </div>
                )}
                
                {/* Plans List - Show when country/region is selected */}
                {shouldShowPlans && (
                  <div>
                    <PlanList
                      products={plans}
                      loading={loading}
                      selectedCategory={selectedCategory}
                      selectedCategoryData={selectedCategoryData}
                      categories={categories}
                    />
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </CardContent>
  );
};