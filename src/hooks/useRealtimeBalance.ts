import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useRealtimeBalance = () => {
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Calculate balance from transactions - with user filter for performance
    const calculateBalance = async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('amount, transaction_type, status')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error calculating balance:', error);
      } else if (data && data.length > 0) {
        // Use the most recent transaction's balance_after
        const { data: latestTrans } = await supabase
          .from('transactions')
          .select('balance_after')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        setBalance(latestTrans?.balance_after || 0);
      }
      setLoading(false);
    };

    calculateBalance();

    // Subscribe to transaction changes for real-time balance updates
    const channel = supabase
      .channel('balance-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          calculateBalance();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return { balance, loading };
};
