import { useState, useEffect, useCallback } from 'react';
import { externalApiService, type ExternalPlan, type ExternalCategory } from '../lib/api';

interface UseExternalPlansParams {
  searchTerm?: string;
  selectedCountry?: string;
  selectedRegion?: string;
  autoFetch?: boolean;
}

interface UseExternalPlansReturn {
  plans: ExternalPlan[];
  categories: ExternalCategory[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  searchPlans: (query: string) => Promise<void>;
  getPlansByCountry: (countryCode: string) => Promise<void>;
  getPlansByRegion: (regionCode: string) => Promise<void>;
}

export function useExternalPlans({
  searchTerm = '',
  selectedCountry = '',
  selectedRegion = '',
  autoFetch = true
}: UseExternalPlansParams = {}): UseExternalPlansReturn {
  const [plans, setPlans] = useState<ExternalPlan[]>([]);
  const [categories, setCategories] = useState<ExternalCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch plans and categories in parallel
      const [plansData, categoriesData] = await Promise.all([
        externalApiService.getPlans(),
        externalApiService.getCategories()
      ]);
      
      setPlans(plansData);
      setCategories(categoriesData);
    } catch (err) {
      console.error('Error fetching external data:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  }, []);

  const searchPlans = useCallback(async (query: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const searchResults = await externalApiService.searchPlans(query);
      setPlans(searchResults);
    } catch (err) {
      console.error('Error searching plans:', err);
      setError(err instanceof Error ? err.message : 'Error al buscar planes');
    } finally {
      setLoading(false);
    }
  }, []);

  const getPlansByCountry = useCallback(async (countryCode: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const countryPlans = await externalApiService.getPlansByCountry(countryCode);
      setPlans(countryPlans);
    } catch (err) {
      console.error('Error fetching country plans:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar planes del país');
    } finally {
      setLoading(false);
    }
  }, []);

  const getPlansByRegion = useCallback(async (regionCode: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const regionPlans = await externalApiService.getPlansByRegion(regionCode);
      setPlans(regionPlans);
    } catch (err) {
      console.error('Error fetching region plans:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar planes de la región');
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [autoFetch, fetchData]);

  // Handle search term changes
  useEffect(() => {
    if (searchTerm.trim()) {
      searchPlans(searchTerm);
    }
  }, [searchTerm, searchPlans]);

  // Handle country selection
  useEffect(() => {
    if (selectedCountry) {
      getPlansByCountry(selectedCountry);
    }
  }, [selectedCountry, getPlansByCountry]);

  // Handle region selection
  useEffect(() => {
    if (selectedRegion) {
      getPlansByRegion(selectedRegion);
    }
  }, [selectedRegion, getPlansByRegion]);

  return {
    plans,
    categories,
    loading,
    error,
    refetch,
    searchPlans,
    getPlansByCountry,
    getPlansByRegion
  };
}