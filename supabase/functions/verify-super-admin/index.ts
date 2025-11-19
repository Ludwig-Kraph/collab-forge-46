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

    // Get current user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      throw new Error('Not authenticated');
    }

    console.log('Verifying super admin for user:', user.id);

    // Check user role directly from database
    const { data: roleData, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (roleError) {
      console.error('Role query error:', roleError);
      throw roleError;
    }

    console.log('Role data:', roleData);

    // Check profile data
    const { data: profileData, error: profileError } = await supabaseClient
      .from('profiles')
      .select('phone_number, full_name, is_blocked')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Profile query error:', profileError);
    }

    console.log('Profile data:', profileData);

    // Use RPC to check super admin status
    const { data: isSuperAdminRPC, error: rpcError } = await supabaseClient
      .rpc('is_super_admin', { _user_id: user.id });

    if (rpcError) {
      console.error('RPC error:', rpcError);
    }

    console.log('Is super admin (RPC):', isSuperAdminRPC);

    return new Response(
      JSON.stringify({
        success: true,
        user_id: user.id,
        phone: user.phone,
        role: roleData?.role,
        profile: profileData,
        is_super_admin: roleData?.role === 'super_admin',
        is_super_admin_rpc: isSuperAdminRPC,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Error verifying super admin:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to verify super admin status',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
