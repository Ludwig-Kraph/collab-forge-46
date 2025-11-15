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
    if (!user || !paymentRequestId) {
      setPaymentStatus(null);
      return;
    }

    let isSubscribed = true;

    const fetchStatus = async () => {
      if (!isSubscribed) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('payment_requests')
          .select('*')
          .eq('id', paymentRequestId)
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Failed to fetch payment status:', error);
          return;
        }
        
        if (isSubscribed) {
          setPaymentStatus(data as PaymentRequest);
        }
      } catch (error) {
        console.error('Failed to fetch payment status:', error);
      } finally {
        if (isSubscribed) {
          setLoading(false);
        }
      }
    };

    fetchStatus();

    // Subscribe to real-time updates
    const channel = supabase
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
          if (isSubscribed) {
            console.log('Real-time payment update:', payload.new);
            setPaymentStatus(payload.new as PaymentRequest);
          }
        }
      )
      .subscribe();

    return () => {
      isSubscribed = false;
      supabase.removeChannel(channel);
    };
  }, [user, paymentRequestId]);

  return { paymentStatus, loading };
};
