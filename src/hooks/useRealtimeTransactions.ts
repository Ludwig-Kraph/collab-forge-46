import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Transaction {
  id: string;
  amount: number;
  transaction_type: string;
  phone_number: string;
  status: string;
  created_at: string;
  mpesa_receipt_number: string | null;
  description: string | null;
}

export const useRealtimeTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;

    // Initial fetch with user filter and reduced limit
    const fetchTransactions = async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching transactions:', error);
        toast({
          title: 'Error loading transactions',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        setTransactions(data || []);
      }
      setLoading(false);
    };

    fetchTransactions();

    // Set up realtime subscription
    const channel = supabase
      .channel('transactions-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('New transaction received:', payload);
          setTransactions((prev) => [payload.new as Transaction, ...prev]);
          
          toast({
            title: 'New Transaction',
            description: `${payload.new.transaction_type}: KES ${payload.new.amount}`,
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Transaction updated:', payload);
          setTransactions((prev) =>
            prev.map((t) => (t.id === payload.new.id ? (payload.new as Transaction) : t))
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast]);

  return { transactions, loading };
};
