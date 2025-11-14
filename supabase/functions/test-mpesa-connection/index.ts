import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    // Get MPESA credentials
    const consumerKey = Deno.env.get('MPESA_CONSUMER_KEY');
    const consumerSecret = Deno.env.get('MPESA_CONSUMER_SECRET');
    const passkey = Deno.env.get('MPESA_PASSKEY');
    const shortcode = Deno.env.get('MPESA_SHORTCODE');

    if (!consumerKey || !consumerSecret || !passkey || !shortcode) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'MPESA credentials not configured. Please set MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET, MPESA_PASSKEY, and MPESA_SHORTCODE in Supabase secrets.',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Test OAuth token generation
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
      const errorText = await tokenResponse.text();
      console.error('Token generation failed:', errorText);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to authenticate with MPESA API. Check your Consumer Key and Consumer Secret.',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    const tokenData = await tokenResponse.json();
    console.log('MPESA connection test successful:', {
      hasAccessToken: !!tokenData.access_token,
      shortcode,
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'MPESA API connection successful',
        data: {
          shortcode,
          environment: 'sandbox',
          hasValidCredentials: true,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Error testing MPESA connection:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'An error occurred while testing MPESA connection',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
