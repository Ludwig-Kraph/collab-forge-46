import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to prefetch data for likely next pages
 * Improves perceived performance by loading data before user navigates
 */
export function usePrefetch(userId: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;

    // Prefetch transactions
    queryClient.prefetchQuery({
      queryKey: ['transactions', userId],
      queryFn: async () => {
        const { data } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(50);
        return data || [];
      },
      staleTime: 60000, // Consider fresh for 1 minute
    });

    // Prefetch payment requests
    queryClient.prefetchQuery({
      queryKey: ['payment_requests', userId],
      queryFn: async () => {
        const { data } = await supabase
          .from('payment_requests')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(20);
        return data || [];
      },
      staleTime: 60000,
    });

    // Prefetch MPESA accounts
    queryClient.prefetchQuery({
      queryKey: ['mpesa_accounts', userId],
      queryFn: async () => {
        const { data } = await supabase
          .from('mpesa_accounts')
          .select('*')
          .eq('user_id', userId)
          .eq('is_active', true);
        return data || [];
      },
      staleTime: 300000, // Consider fresh for 5 minutes
    });
  }, [userId, queryClient]);
}
