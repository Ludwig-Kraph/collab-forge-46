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
      const { data, error } = await supabase.functions.invoke('mpesa-stk-push', {
        body: params,
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Failed to initiate payment');
      }

      toast({
        title: 'Payment Initiated',
        description: 'STK push sent to customer. Waiting for confirmation...',
      });

      return data.data;
    } catch (error: any) {
      console.error('Payment initiation error:', error);
      toast({
        title: 'Payment Failed',
        description: error.message || 'Failed to initiate payment',
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
