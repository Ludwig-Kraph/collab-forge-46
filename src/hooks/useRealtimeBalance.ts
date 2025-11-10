import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useRealtimeBalance = () => {
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Calculate balance from transactions
    const calculateBalance = async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('amount, transaction_type, status')
        .eq('status', 'completed');

      if (error) {
        console.error('Error calculating balance:', error);
      } else {
        const total = data?.reduce((acc, transaction) => {
          if (transaction.transaction_type === 'received') {
            return acc + Number(transaction.amount);
          } else if (transaction.transaction_type === 'sent') {
            return acc - Number(transaction.amount);
          }
          return acc;
        }, 0) || 0;
        
        setBalance(total);
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
