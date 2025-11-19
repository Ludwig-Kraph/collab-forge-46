-- Fix RLS policies to prevent access denied errors

-- Drop the restrictive policies
DROP POLICY IF EXISTS "Super admins can view control panel RBAC users" ON public.profiles;
DROP POLICY IF EXISTS "Organization admins can view their RBAC users" ON public.profiles;
DROP POLICY IF EXISTS "Government officials can view their entity RBAC users" ON public.profiles;

-- Create balanced policies that allow proper access

-- 1. Users can always view their own profile
-- (This policy already exists: "Users can view their own profile")

-- 2. Super admins can view all profiles (Control Panel access)
CREATE POLICY "Super admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  is_super_admin(auth.uid())
);

-- 3. Organization admins/corporate admins can view all profiles in their organization
CREATE POLICY "Organization members can view organization profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'corporate_admin'))
  AND EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
      AND p.organization_id IS NOT NULL
      AND p.organization_id = profiles.organization_id
  )
);

-- 4. Government officials can view profiles in their entity
CREATE POLICY "Government officials can view entity profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM government_officials go1
    JOIN government_officials go2 ON go1.government_entity_id = go2.government_entity_id
    WHERE go1.user_id = auth.uid()
      AND go2.user_id = profiles.id
  )
);

-- Fix UPDATE policies
DROP POLICY IF EXISTS "Super admins can update control panel RBAC users" ON public.profiles;
DROP POLICY IF EXISTS "Organization admins can update their RBAC users" ON public.profiles;
DROP POLICY IF EXISTS "Government super admins can update their entity RBAC users" ON public.profiles;

-- Super admins can update any profile
CREATE POLICY "Super admins can update any profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (is_super_admin(auth.uid()));

-- Organization admins can update profiles in their organization
CREATE POLICY "Organization admins can update organization profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'corporate_admin'))
  AND EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
      AND p.organization_id IS NOT NULL
      AND p.organization_id = profiles.organization_id
  )
);

-- Government super admins can update profiles in their entity
CREATE POLICY "Government super admins can update entity profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  is_government_super_admin(auth.uid())
  AND EXISTS (
    SELECT 1 
    FROM government_officials go1
    JOIN government_officials go2 ON go1.government_entity_id = go2.government_entity_id
    WHERE go1.user_id = auth.uid()
      AND go2.user_id = profiles.id
  )
);

-- Fix INSERT policies
DROP POLICY IF EXISTS "Super admins can insert control panel RBAC users" ON public.profiles;
DROP POLICY IF EXISTS "Organization admins can insert their RBAC users" ON public.profiles;
DROP POLICY IF EXISTS "Government admins can insert their entity RBAC users" ON public.profiles;

-- Super admins can insert any RBAC user
CREATE POLICY "Super admins can insert RBAC users"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (
  is_super_admin(auth.uid())
  OR (
    (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'corporate_admin'))
    AND is_rbac_user
  )
);