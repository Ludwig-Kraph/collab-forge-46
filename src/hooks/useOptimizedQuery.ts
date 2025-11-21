import { useQuery, UseQueryOptions } from '@tanstack/react-query';

/**
 * Optimized query hook with automatic caching
 * Uses React Query for intelligent caching and background refetching
 */
export function useOptimizedQuery<T>(
  queryKey: string[],
  queryFn: () => Promise<T>,
  options?: Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey,
    queryFn,
    staleTime: 30000, // 30 seconds - data is fresh for this period
    gcTime: 5 * 60 * 1000, // 5 minutes - cached data lifetime
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    retry: 2, // Retry failed requests twice
    ...options,
  });
}
