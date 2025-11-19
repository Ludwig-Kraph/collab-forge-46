-- Fix RLS policies for user_roles table to allow users to read their own roles
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view organization roles" ON public.user_roles;

CREATE POLICY "Users can view their own role"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Super admins can view control panel roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (
  is_super_admin(auth.uid())
  AND organization_id IS NULL
);

CREATE POLICY "Organization admins can view their organization roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (
  (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'corporate_admin'))
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.organization_id IS NOT NULL
      AND p.organization_id = user_roles.organization_id
  )
);

CREATE POLICY "Government super admins can view their entity roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (
  is_government_super_admin(auth.uid())
  AND EXISTS (
    SELECT 1 FROM public.government_officials go1
    JOIN public.government_officials go2 ON go1.government_entity_id = go2.government_entity_id
    WHERE go1.user_id = auth.uid()
      AND go2.user_id = user_roles.user_id
  )
);

-- Update profiles RLS to allow users to always view their own profile (fix pre-load issue)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Ensure blocked users policy doesn't prevent initial load
DROP POLICY IF EXISTS "Blocked users cannot access system" ON public.profiles;

CREATE POLICY "Blocked users cannot modify system"
ON public.profiles
FOR UPDATE
TO authenticated
USING (NOT is_blocked OR auth.uid() = id OR is_super_admin(auth.uid()));