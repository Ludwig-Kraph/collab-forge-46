-- Create account_type enum
CREATE TYPE public.account_type AS ENUM ('subscription', 'government', 'control_panel');

-- Create role_level enum for government hierarchy
CREATE TYPE public.role_level AS ENUM ('super_admin', 'admin', 'user');

-- Add new columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN account_type public.account_type DEFAULT 'subscription',
ADD COLUMN account_id uuid,
ADD COLUMN role_level public.role_level DEFAULT 'user';

-- Add new columns to user_roles table
ALTER TABLE public.user_roles 
ADD COLUMN account_type public.account_type DEFAULT 'subscription',
ADD COLUMN account_id uuid,
ADD COLUMN role_level public.role_level DEFAULT 'user';

-- Create composite indexes for performance
CREATE INDEX idx_profiles_account_isolation ON public.profiles(account_type, account_id);
CREATE INDEX idx_user_roles_account_isolation ON public.user_roles(account_type, account_id);

-- Create security definer function to get user's account context
CREATE OR REPLACE FUNCTION public.get_user_account_context(_user_id uuid)
RETURNS TABLE(account_type public.account_type, account_id uuid, role_level public.role_level)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT account_type, account_id, role_level
  FROM public.profiles
  WHERE id = _user_id
  LIMIT 1;
$$;

-- Create security definer function to check if user can manage another user
CREATE OR REPLACE FUNCTION public.can_manage_user(_admin_id uuid, _target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_context RECORD;
  target_context RECORD;
  admin_role app_role;
BEGIN
  -- Get admin's account context
  SELECT * INTO admin_context FROM get_user_account_context(_admin_id);
  
  -- Get target user's account context
  SELECT * INTO target_context FROM get_user_account_context(_target_user_id);
  
  -- Get admin's role
  SELECT role INTO admin_role FROM user_roles WHERE user_id = _admin_id LIMIT 1;
  
  -- Must be in same account_type and account_id
  IF admin_context.account_type != target_context.account_type OR 
     admin_context.account_id != target_context.account_id THEN
    RETURN false;
  END IF;
  
  -- Control Panel Super Admin can manage all Control Panel users
  IF admin_context.account_type = 'control_panel' AND 
     admin_role IN ('super_admin', 'admin') THEN
    RETURN true;
  END IF;
  
  -- Subscription Account Admin can manage all Subscription users
  IF admin_context.account_type = 'subscription' AND 
     admin_role IN ('super_admin', 'admin', 'corporate_admin') THEN
    RETURN true;
  END IF;
  
  -- Government System Super Admin can manage all Government users
  IF admin_context.account_type = 'government' AND 
     admin_context.role_level = 'super_admin' THEN
    RETURN true;
  END IF;
  
  -- Government Admin can manage Government RBAC users (not other admins)
  IF admin_context.account_type = 'government' AND 
     admin_context.role_level = 'admin' AND
     target_context.role_level = 'user' THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

-- Update RLS policies for profiles table to enforce account isolation
DROP POLICY IF EXISTS "Organization members can view organization profiles" ON public.profiles;
DROP POLICY IF EXISTS "Organization admins can update organization profiles" ON public.profiles;

-- New RLS policy: Users can only see profiles in their account context
CREATE POLICY "Users can view profiles in same account"
ON public.profiles
FOR SELECT
USING (
  -- Super admins can see all
  is_super_admin(auth.uid()) OR
  -- Same user can see themselves
  auth.uid() = id OR
  -- Users in same account_type and account_id can see each other
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
    AND p.account_type = profiles.account_type
    AND p.account_id = profiles.account_id
    AND (
      -- Admins can see all in their account
      has_role(auth.uid(), 'admin'::app_role) OR
      has_role(auth.uid(), 'corporate_admin'::app_role) OR
      p.role_level IN ('super_admin', 'admin')
    )
  )
);

-- New RLS policy: Admins can update profiles in their account
CREATE POLICY "Admins can update profiles in same account"
ON public.profiles
FOR UPDATE
USING (can_manage_user(auth.uid(), id));

-- Update RLS policies for user_roles table
DROP POLICY IF EXISTS "Admins can manage department assignments" ON public.user_roles;

CREATE POLICY "Admins can manage roles in same account"
ON public.user_roles
FOR ALL
USING (
  is_super_admin(auth.uid()) OR
  can_manage_user(auth.uid(), user_id)
);

-- Create audit trigger for account isolation violations
CREATE OR REPLACE FUNCTION public.audit_account_isolation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log any suspicious cross-account access attempts
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    INSERT INTO audit_logs (action, entity_type, entity_id, changes, user_id)
    VALUES (
      'account_isolation_check',
      TG_TABLE_NAME,
      NEW.id,
      jsonb_build_object(
        'account_type', NEW.account_type,
        'account_id', NEW.account_id,
        'operation', TG_OP
      ),
      auth.uid()
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER audit_profiles_account_isolation
AFTER INSERT OR UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.audit_account_isolation();

-- Set default account_type and generate account_id for existing users
UPDATE public.profiles 
SET account_type = 'subscription',
    account_id = gen_random_uuid()
WHERE account_id IS NULL;

UPDATE public.user_roles
SET account_type = 'subscription',
    account_id = (SELECT account_id FROM profiles WHERE profiles.id = user_roles.user_id)
WHERE account_id IS NULL;