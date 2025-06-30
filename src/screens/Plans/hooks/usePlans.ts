import { useState, useEffect, useCallback } from 'react';
import { supabase, type Product } from '../../../lib/supabase';

interface UsePlansParams {
  searchTerm: string;
  selectedCategory: number | undefined;
  selectedRegion: string | undefined;
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
  currentPage, 
  pageSize 
}: UsePlansParams): UsePlansReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      let productsQuery = supabase
        .from('wc_products')
        .select('*')
        .eq('active', true)
        .order('name');

      // Apply search filter
      if (searchTerm) {
        productsQuery = productsQuery.ilike('name', `%${searchTerm}%`);
      }

      // Apply region filter - much more efficient now!
      if (selectedRegion) {
        productsQuery = productsQuery
          .eq('plan_type', 'regional')
          .eq('region_code', selectedRegion);
      }

      // Apply category filter for country-specific plans
      if (selectedCategory) {
        console.log('Filtering by category:', selectedCategory);
        
        // Use PostgreSQL's JSONB operators to find products containing the category ID
        productsQuery = productsQuery.contains('category_ids', JSON.stringify([selectedCategory]));
      }

      // Apply pagination
      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;
      productsQuery = productsQuery.range(from, to);

      const { data: fetchedProducts, error: productsError } = await productsQuery;
      if (productsError) throw productsError;
      
      // Ensure we always set an array, never null or undefined
      setProducts(Array.isArray(fetchedProducts) ? fetchedProducts : []);
      
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Error al cargar los datos. Por favor intente nuevamente.');
      // Set empty array on error to prevent undefined issues
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedCategory, selectedRegion, currentPage, pageSize]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { 
    products, 
    loading, 
    error, 
    refetch 
  };
}