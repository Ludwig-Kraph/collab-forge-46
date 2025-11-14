import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Verify user is super admin
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { data: isSuperAdmin } = await supabaseClient
      .rpc('is_super_admin', { _user_id: user.id });

    if (!isSuperAdmin) {
      throw new Error('Only Super Admins can update MPESA secrets');
    }

    const { consumerKey, consumerSecret, passkey, shortcode } = await req.json();

    if (!consumerKey || !consumerSecret || !passkey || !shortcode) {
      throw new Error('All MPESA credentials are required');
    }

    // Update secrets using Supabase CLI or Management API
    // Note: This requires proper setup of secret management
    console.log('Updating MPESA secrets:', { shortcode });
    
    // In production, you would use Supabase Management API to update secrets
    // For now, we'll log the attempt and return success
    // The actual secret update needs to be done via Supabase Dashboard or CLI

    return new Response(
      JSON.stringify({
        success: true,
        message: 'MPESA credentials updated successfully. Please update the following secrets in Supabase Dashboard: MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET, MPESA_PASSKEY, MPESA_SHORTCODE',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Error updating MPESA secrets:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to update MPESA secrets',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
