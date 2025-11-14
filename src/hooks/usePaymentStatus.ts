import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface PaymentRequest {
  id: string;
  status: string;
  amount: number;
  customer_phone: string;
  description: string | null;
  result_desc: string | null;
  created_at: string;
  completed_at: string | null;
}

export const usePaymentStatus = (paymentRequestId?: string) => {
  const [paymentStatus, setPaymentStatus] = useState<PaymentRequest | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user || !paymentRequestId) return;

    const fetchStatus = async () => {
      setLoading(true);
      try {
        const { data, error } = await (supabase as any)
          .from('payment_requests')
          .select('*')
          .eq('id', paymentRequestId)
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;
        setPaymentStatus(data as PaymentRequest);
      } catch (error) {
        console.error('Failed to fetch payment status:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();

    // Subscribe to real-time updates
    const channel = (supabase as any)
      .channel(`payment-status-${paymentRequestId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'payment_requests',
          filter: `id=eq.${paymentRequestId}`,
        },
        (payload: any) => {
          console.log('Real-time payment update:', payload.new);
          setPaymentStatus(payload.new as PaymentRequest);
        }
      )
      .subscribe();

    return () => {
      (supabase as any).removeChannel(channel);
    };
  }, [user, paymentRequestId]);

  return { paymentStatus, loading };
};
