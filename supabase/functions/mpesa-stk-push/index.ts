import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface STKPushRequest {
  mpesaAccountId: string;
  customerPhone: string;
  amount: number;
  description?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { mpesaAccountId, customerPhone, amount, description }: STKPushRequest = await req.json();

    // Validate input
    if (!mpesaAccountId || !customerPhone || !amount) {
      throw new Error('Missing required fields');
    }

    // Format phone number (ensure 254 format)
    let formattedPhone = customerPhone.replace(/\s+/g, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '254' + formattedPhone.substring(1);
    } else if (!formattedPhone.startsWith('254')) {
      formattedPhone = '254' + formattedPhone;
    }

    // Get MPESA credentials
    const consumerKey = Deno.env.get('MPESA_CONSUMER_KEY');
    const consumerSecret = Deno.env.get('MPESA_CONSUMER_SECRET');
    const passkey = Deno.env.get('MPESA_PASSKEY');
    const shortcode = Deno.env.get('MPESA_SHORTCODE');

    if (!consumerKey || !consumerSecret || !passkey || !shortcode) {
      throw new Error('MPESA credentials not configured');
    }

    // Get OAuth token
    const authString = btoa(`${consumerKey}:${consumerSecret}`);
    const tokenResponse = await fetch(
      'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
      {
        headers: {
          Authorization: `Basic ${authString}`,
        },
      }
    );

    if (!tokenResponse.ok) {
      throw new Error('Failed to get MPESA OAuth token');
    }

    const { access_token } = await tokenResponse.json();

    // Generate timestamp
    const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').substring(0, 14);
    const password = btoa(`${shortcode}${passkey}${timestamp}`);

    // Prepare STK Push request
    const callbackUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/mpesa-callback`;
    
    const stkPushPayload = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.round(amount),
      PartyA: formattedPhone,
      PartyB: shortcode,
      PhoneNumber: formattedPhone,
      CallBackURL: callbackUrl,
      AccountReference: mpesaAccountId.substring(0, 12),
      TransactionDesc: description || 'Payment',
    };

    console.log('Initiating STK Push:', {
      phone: formattedPhone,
      amount,
      shortcode,
    });

    // Send STK Push request
    const stkResponse = await fetch(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(stkPushPayload),
      }
    );

    const stkData = await stkResponse.json();
    console.log('STK Push Response:', stkData);

    if (!stkResponse.ok || stkData.errorCode) {
      throw new Error(stkData.errorMessage || 'STK Push failed');
    }

    // Save payment request to database
    const { data: paymentRequest, error: dbError } = await supabaseClient
      .from('payment_requests')
      .insert({
        user_id: user.id,
        mpesa_account_id: mpesaAccountId,
        customer_phone: formattedPhone,
        amount,
        description,
        merchant_request_id: stkData.MerchantRequestID,
        checkout_request_id: stkData.CheckoutRequestID,
        status: 'processing',
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error('Failed to save payment request');
    }

    // Update subscription STK push count
    const { error: subError } = await supabaseClient.rpc('decrement_stk_pushes', {
      _user_id: user.id,
    });

    if (subError) {
      console.error('Failed to update subscription:', subError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'STK Push initiated successfully',
        data: {
          paymentRequestId: paymentRequest.id,
          merchantRequestId: stkData.MerchantRequestID,
          checkoutRequestId: stkData.CheckoutRequestID,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Error in mpesa-stk-push:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'An error occurred',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
