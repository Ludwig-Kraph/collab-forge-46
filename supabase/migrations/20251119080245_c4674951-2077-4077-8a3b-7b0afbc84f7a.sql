-- Fix infinite recursion in RLS policies by using security definer functions consistently

-- Drop problematic policies on profiles table
DROP POLICY IF EXISTS "Super admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view profiles in same account" ON profiles;
DROP POLICY IF EXISTS "Admins can update profiles in same account" ON profiles;
DROP POLICY IF EXISTS "Government officials can view entity profiles" ON profiles;
DROP POLICY IF EXISTS "Government super admins can update entity profiles" ON profiles;

-- Drop problematic policies on user_roles table  
DROP POLICY IF EXISTS "Admins can view all roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can manage roles in same account" ON user_roles;
DROP POLICY IF EXISTS "Government super admins can view their entity roles" ON user_roles;

-- Create simple, non-recursive policies for profiles using security definer functions
CREATE POLICY "Super admins full access to profiles"
ON profiles FOR ALL
TO authenticated
USING (user_is_super_admin(auth.uid()))
WITH CHECK (user_is_super_admin(auth.uid()));

CREATE POLICY "Users view own profile"
ON profiles FOR SELECT
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Admins can manage same account profiles"
ON profiles FOR ALL
TO authenticated
USING (can_manage_user(auth.uid(), id))
WITH CHECK (can_manage_user(auth.uid(), id));

-- Create simple, non-recursive policies for user_roles using security definer functions
CREATE POLICY "Super admins full access to roles"
ON user_roles FOR ALL
TO authenticated
USING (user_is_super_admin(auth.uid()))
WITH CHECK (user_is_super_admin(auth.uid()));

CREATE POLICY "Users view own roles"
ON user_roles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins manage roles in account"
ON user_roles FOR ALL
TO authenticated
USING (can_manage_user(auth.uid(), user_id))
WITH CHECK (can_manage_user(auth.uid(), user_id));

-- Update password for Timothy Ng'ang'a
-- Note: Supabase auth.users table password updates must be done through Supabase Auth API
-- This is a placeholder - actual password update will be done via Auth API