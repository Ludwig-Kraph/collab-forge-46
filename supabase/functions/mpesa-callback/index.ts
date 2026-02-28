import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const callbackData = await req.json();
    console.log('MPESA Callback received:', JSON.stringify(callbackData, null, 2));

    const { Body } = callbackData;
    const { stkCallback } = Body;

    const merchantRequestId = stkCallback.MerchantRequestID;
    const checkoutRequestId = stkCallback.CheckoutRequestID;
    const resultCode = stkCallback.ResultCode;
    const resultDesc = stkCallback.ResultDesc;

    // Find the payment request
    const { data: paymentRequest, error: findError } = await supabaseClient
      .from('payment_requests')
      .select('*')
      .eq('checkout_request_id', checkoutRequestId)
      .single();

    if (findError || !paymentRequest) {
      console.error('Payment request not found:', findError);
      return new Response(
        JSON.stringify({ ResultCode: 1, ResultDesc: 'Payment request not found' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    let status = 'failed';
    let mpesaReceiptNumber = null;
    let transactionAmount = null;
    let transactionDate = null;
    let phoneNumber = null;

    if (resultCode === 0) {
      // Payment successful
      status = 'completed';
      const callbackMetadata = stkCallback.CallbackMetadata?.Item || [];

      for (const item of callbackMetadata) {
        switch (item.Name) {
          case 'Amount':
            transactionAmount = item.Value;
            break;
          case 'MpesaReceiptNumber':
            mpesaReceiptNumber = item.Value;
            break;
          case 'TransactionDate':
            const dateStr = String(item.Value);
            const year = dateStr.substring(0, 4);
            const month = dateStr.substring(4, 6);
            const day = dateStr.substring(6, 8);
            const hour = dateStr.substring(8, 10);
            const minute = dateStr.substring(10, 12);
            const second = dateStr.substring(12, 14);
            transactionDate = `${year}-${month}-${day}T${hour}:${minute}:${second}Z`;
            break;
          case 'PhoneNumber':
            phoneNumber = item.Value;
            break;
        }
      }

      // Create transaction record
      const { error: txError } = await supabaseClient.from('transactions').insert({
        user_id: paymentRequest.user_id,
        mpesa_account_id: paymentRequest.mpesa_account_id,
        transaction_id: merchantRequestId,
        phone_number: phoneNumber || paymentRequest.customer_phone,
        amount: transactionAmount || paymentRequest.amount,
        transaction_type: 'received',
        description: paymentRequest.description,
        status: 'completed',
        mpesa_receipt_number: mpesaReceiptNumber,
        transaction_date: transactionDate || new Date().toISOString(),
      });

      if (txError) {
        console.error('Failed to create transaction:', txError);
      }

      // Generate payment receipt
      try {
        // Get user's subscription tier and mpesa account number
        const { data: userSub } = await supabaseClient
          .from('subscriptions')
          .select('tier')
          .eq('user_id', paymentRequest.user_id)
          .eq('is_active', true)
          .maybeSingle();

        const { data: mpesaAccount } = await supabaseClient
          .from('mpesa_accounts')
          .select('account_number')
          .eq('id', paymentRequest.mpesa_account_id)
          .maybeSingle();

        const { data: receiptNumber, error: receiptError } = await supabaseClient
          .rpc('create_payment_receipt', {
            _user_id: paymentRequest.user_id,
            _receipt_type: 'subscription',
            _amount: transactionAmount || paymentRequest.amount,
            _description: paymentRequest.description || 'MPESA Payment',
            _payment_reference: merchantRequestId,
            _mpesa_receipt_number: mpesaReceiptNumber,
            _subscription_tier: userSub?.tier || 'free_trial',
            _account_number: mpesaAccount?.account_number || '',
          });

        if (receiptError) {
          console.error('Failed to generate receipt:', receiptError);
        } else {
          console.log('Receipt generated:', receiptNumber);
        }
      } catch (receiptErr) {
        console.error('Receipt generation error:', receiptErr);
      }
    }

    // Update payment request
    const { error: updateError } = await supabaseClient
      .from('payment_requests')
      .update({
        status,
        result_code: String(resultCode),
        result_desc: resultDesc,
        completed_at: new Date().toISOString(),
      })
      .eq('id', paymentRequest.id);

    if (updateError) {
      console.error('Failed to update payment request:', updateError);
    }

    console.log('Callback processed successfully:', {
      checkoutRequestId,
      status,
      resultCode,
      mpesaReceiptNumber,
    });

    return new Response(
      JSON.stringify({ ResultCode: 0, ResultDesc: 'Accepted' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Error in mpesa-callback:', error);
    return new Response(
      JSON.stringify({ ResultCode: 1, ResultDesc: 'Internal error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  }
});
