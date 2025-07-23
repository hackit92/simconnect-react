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
    // Only fetch data if there's a specific selection or search term
    if (!searchTerm && !selectedCategory && !selectedRegion) {
      setAllProducts([]);
      setLoading(false);
      setError(null);
      return;
    }

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
          countryISO3 = countryUtils.iso2ToIso3(selectedCategoryData.slug);
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
            const countryISO3 = countryUtils.iso2ToIso3(selectedCategoryData.slug);
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
