import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Verify the requesting user is an admin
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body first
    const { email, password, fullName, role, organizationId, accountType, accountId, roleLevel } = await req.json();

    // Check if user has admin role and get their account context
    const { data: adminProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('account_type, account_id, role_level')
      .eq('id', user.id)
      .single();

    if (profileError || !adminProfile) {
      return new Response(
        JSON.stringify({ error: 'Admin profile not found' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (roleError || !roleData || !['admin', 'super_admin', 'corporate_admin'].includes(roleData.role)) {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate account context - new user must be in same account as admin
    if (accountType !== adminProfile.account_type || accountId !== adminProfile.account_id) {
      return new Response(
        JSON.stringify({ error: 'Cannot create users in different account context' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Government Admin cannot create other Admins or Super Admins
    if (adminProfile.account_type === 'government' && 
        adminProfile.role_level === 'admin' && 
        roleLevel !== 'user') {
      return new Response(
        JSON.stringify({ error: 'Government Admins can only create RBAC users, not other admins' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create user with admin API
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        is_rbac_user: true
      }
    });

    if (createError) {
      throw createError;
    }

    if (!newUser.user) {
      throw new Error('Failed to create user');
    }

    // Insert into profiles with account context
    const { error: profileInsertError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: newUser.user.id,
        full_name: fullName,
        email: email,
        phone_number: email, // Using email as placeholder for RBAC users
        is_rbac_user: true,
        organization_id: organizationId || null,
        account_type: accountType,
        account_id: accountId,
        role_level: roleLevel || 'user'
      });

    if (profileInsertError) {
      console.error('Profile creation error:', profileInsertError);
      // Continue anyway, the trigger might have created it
    }

    // Insert role with account context
    const { error: roleInsertError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: newUser.user.id,
        role: role,
        organization_id: organizationId || null,
        account_type: accountType,
        account_id: accountId,
        role_level: roleLevel || 'user'
      });

    if (roleInsertError) {
      throw roleInsertError;
    }

    // Log audit event
    await supabaseAdmin.rpc('log_audit_event', {
      _action: 'create_rbac_user',
      _entity_type: 'user',
      _entity_id: newUser.user.id,
      _changes: { role, email, full_name: fullName },
      _ip_address: null,
      _user_agent: req.headers.get('user-agent')
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        user: {
          id: newUser.user.id,
          email: newUser.user.email,
          full_name: fullName,
          role: role
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error creating RBAC user:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to create RBAC user' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
