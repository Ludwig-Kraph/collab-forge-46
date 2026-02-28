import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface InitiatePaymentParams {
  mpesaAccountId: string;
  customerPhone: string;
  amount: number;
  description?: string;
}

interface PaymentResponse {
  paymentRequestId: string;
  merchantRequestId: string;
  checkoutRequestId: string;
}

export const useMpesaPayment = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const initiatePayment = async (params: InitiatePaymentParams): Promise<PaymentResponse | null> => {
    setLoading(true);
    try {
      // Validate params before sending
      if (!params.mpesaAccountId || !params.customerPhone || !params.amount) {
        throw new Error('Missing required payment parameters');
      }

      if (params.amount < 10) {
        throw new Error('Minimum payment amount is KES 10');
      }

      // Check subscription STK push availability
      const { data: session } = await supabase.auth.getSession();
      const userId = session?.session?.user?.id;
      
      if (userId) {
        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('free_stk_pushes_remaining, max_stk_pushes, used_stk_pushes')
          .eq('user_id', userId)
          .eq('is_active', true)
          .maybeSingle();

        const hasSubscriptionPushes = subscription && (
          subscription.free_stk_pushes_remaining === null || // unlimited
          (subscription.free_stk_pushes_remaining !== null && subscription.free_stk_pushes_remaining > 0)
        );

        if (!hasSubscriptionPushes) {
          // Try to consume a token instead
          const { data: tokenResult, error: tokenError } = await supabase
            .rpc('consume_token', { _user_id: userId, _count: 1 });

          if (tokenError || tokenResult === false) {
            throw new Error('No STK pushes or tokens remaining. Please upgrade your subscription or purchase M-Leja Credits.');
          }
          // Token consumed successfully, proceed without decrementing subscription
        }
      }

      const { data, error } = await supabase.functions.invoke('mpesa-stk-push', {
        body: params,
      });

      if (error) {
        console.error('Function invocation error:', error);
        throw new Error(error.message || 'Failed to connect to payment service');
      }

      if (!data) {
        throw new Error('No response from payment service');
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to initiate payment');
      }

      if (!data.data?.paymentRequestId) {
        throw new Error('Invalid response from payment service');
      }

      toast({
        title: 'Payment Initiated',
        description: 'STK push sent to customer. Waiting for confirmation...',
      });

      return data.data;
    } catch (error: any) {
      console.error('Payment initiation error:', error);
      
      let errorMessage = 'Failed to initiate payment';
      if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      toast({
        title: 'Payment Failed',
        description: errorMessage,
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = async (checkoutRequestId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('mpesa-status', {
        body: { checkoutRequestId },
      });

      if (error) throw error;

      return data;
    } catch (error: any) {
      console.error('Status check error:', error);
      toast({
        title: 'Status Check Failed',
        description: error.message || 'Failed to check payment status',
        variant: 'destructive',
      });
      return null;
    }
  };

  return {
    initiatePayment,
    checkPaymentStatus,
    loading,
  };
};
