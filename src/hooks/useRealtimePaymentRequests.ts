import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface PaymentRequest {
  id: string;
  user_id: string;
  mpesa_account_id: string;
  customer_phone: string;
  amount: number;
  status: string;
  description: string | null;
  created_at: string;
  completed_at: string | null;
  merchant_request_id: string | null;
  checkout_request_id: string | null;
  result_code: string | null;
  result_desc: string | null;
}

export function useRealtimePaymentRequests(userId: string | undefined) {
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    // Initial fetch
    const fetchPaymentRequests = async () => {
      const { data } = await supabase
        .from('payment_requests')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (data) {
        setPaymentRequests(data as PaymentRequest[]);
      }
      setLoading(false);
    };

    fetchPaymentRequests();

    // Set up realtime listener
    const channel: RealtimeChannel = supabase
      .channel('payment-requests-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payment_requests',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('Payment request update:', payload);
          
          if (payload.eventType === 'INSERT') {
            setPaymentRequests(prev => [payload.new as PaymentRequest, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setPaymentRequests(prev => 
              prev.map(req => req.id === payload.new.id ? payload.new as PaymentRequest : req)
            );
          } else if (payload.eventType === 'DELETE') {
            setPaymentRequests(prev => prev.filter(req => req.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return { paymentRequests, loading };
}
