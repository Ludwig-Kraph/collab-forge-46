-- Drop existing policies that are too permissive for RBAC users
DROP POLICY IF EXISTS "Super admins can view all profiles" ON public.profiles;

-- Create more granular policies for RBAC account visibility

-- 1. Super admins can view control panel RBAC users and non-RBAC users
CREATE POLICY "Super admins can view control panel RBAC users"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  is_super_admin(auth.uid()) 
  AND (
    -- Can see non-RBAC users (subscription accounts)
    NOT is_rbac_user 
    -- Can see control panel RBAC users (no organization_id)
    OR (is_rbac_user AND organization_id IS NULL AND NOT EXISTS (
      SELECT 1 FROM government_officials WHERE user_id = profiles.id
    ))
    -- Can see their own profile
    OR id = auth.uid()
  )
);

-- 2. Organization admins can view RBAC users in their organization
CREATE POLICY "Organization admins can view their RBAC users"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'corporate_admin'))
  AND organization_id IS NOT NULL
  AND organization_id = (
    SELECT organization_id FROM profiles WHERE id = auth.uid()
  )
);

-- 3. Government officials can view RBAC users in their entity
CREATE POLICY "Government officials can view their entity RBAC users"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  is_rbac_user
  AND EXISTS (
    SELECT 1 
    FROM government_officials go1
    JOIN government_officials go2 ON go1.government_entity_id = go2.government_entity_id
    WHERE go1.user_id = auth.uid()
      AND go2.user_id = profiles.id
  )
);

-- 4. Restrict RBAC user updates to appropriate context
DROP POLICY IF EXISTS "Super admins can update all profiles" ON public.profiles;

CREATE POLICY "Super admins can update control panel RBAC users"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  is_super_admin(auth.uid())
  AND (
    NOT is_rbac_user
    OR (is_rbac_user AND organization_id IS NULL AND NOT EXISTS (
      SELECT 1 FROM government_officials WHERE user_id = profiles.id
    ))
  )
);

CREATE POLICY "Organization admins can update their RBAC users"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'corporate_admin'))
  AND organization_id IS NOT NULL
  AND organization_id = (
    SELECT organization_id FROM profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Government super admins can update their entity RBAC users"
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

-- 5. Restrict RBAC user creation to appropriate context
DROP POLICY IF EXISTS "Admins can insert RBAC profiles" ON public.profiles;

CREATE POLICY "Super admins can insert control panel RBAC users"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (
  is_super_admin(auth.uid())
  AND is_rbac_user
  AND organization_id IS NULL
);

CREATE POLICY "Organization admins can insert their RBAC users"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (
  (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'corporate_admin'))
  AND is_rbac_user
  AND organization_id IS NOT NULL
  AND organization_id = (
    SELECT organization_id FROM profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Government admins can insert their entity RBAC users"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (
  (is_super_admin(auth.uid()) OR is_government_super_admin(auth.uid()))
  AND is_rbac_user
  AND EXISTS (
    SELECT 1 FROM government_officials WHERE user_id = profiles.id
  )
);