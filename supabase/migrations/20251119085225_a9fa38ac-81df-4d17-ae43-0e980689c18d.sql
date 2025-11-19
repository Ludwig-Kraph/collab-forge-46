-- Fix infinite recursion by completely rebuilding user_roles policies
-- Drop ALL existing conflicting policies
DROP POLICY IF EXISTS "Admins can assign admin role" ON user_roles;
DROP POLICY IF EXISTS "Admins can insert roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON user_roles;
DROP POLICY IF EXISTS "Admins manage roles in account" ON user_roles;
DROP POLICY IF EXISTS "Only admins can delete roles" ON user_roles;
DROP POLICY IF EXISTS "Organization admins can view organization roles" ON user_roles;
DROP POLICY IF EXISTS "Organization admins can view their organization roles" ON user_roles;
DROP POLICY IF EXISTS "Super admins can assign any role" ON user_roles;
DROP POLICY IF EXISTS "Super admins can delete any role" ON user_roles;
DROP POLICY IF EXISTS "Super admins can update any role" ON user_roles;
DROP POLICY IF EXISTS "Super admins can view all user roles" ON user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON user_roles;
DROP POLICY IF EXISTS "user_roles_select_own" ON user_roles;
DROP POLICY IF EXISTS "user_roles_select_super_admin" ON user_roles;
DROP POLICY IF EXISTS "user_roles_insert_super_admin" ON user_roles;
DROP POLICY IF EXISTS "user_roles_update_super_admin" ON user_roles;
DROP POLICY IF EXISTS "user_roles_delete_super_admin" ON user_roles;
DROP POLICY IF EXISTS "user_roles_manual_insert" ON user_roles;
DROP POLICY IF EXISTS "user_roles_manual_update" ON user_roles;
DROP POLICY IF EXISTS "user_roles_manual_delete" ON user_roles;
DROP POLICY IF EXISTS "user_roles_manual_select" ON user_roles;

-- Create simple, non-recursive policies
-- Users can view their own roles (no function calls)
CREATE POLICY "users_view_own_roles"
  ON user_roles FOR SELECT
  USING (user_id = auth.uid());

-- Allow service role (Supabase admin/dashboard) full access
CREATE POLICY "service_role_full_access"
  ON user_roles FOR ALL
  USING (auth.uid() IS NULL);

-- Super admins need a helper table to avoid recursion
-- Create a materialized way to check super admin without querying user_roles
CREATE TABLE IF NOT EXISTS public.super_admin_cache (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  is_super_admin boolean NOT NULL DEFAULT true,
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on cache table
ALTER TABLE public.super_admin_cache ENABLE ROW LEVEL SECURITY;

-- Cache table policies (simple, no recursion)
CREATE POLICY "anyone_can_read_super_admin_cache"
  ON super_admin_cache FOR SELECT
  USING (true);

CREATE POLICY "service_role_manage_cache"
  ON super_admin_cache FOR ALL
  USING (auth.uid() IS NULL);

-- Populate cache with existing super admins
INSERT INTO public.super_admin_cache (user_id, is_super_admin)
SELECT DISTINCT user_id, true
FROM public.user_roles
WHERE role = 'super_admin'
ON CONFLICT (user_id) DO UPDATE SET updated_at = now();

-- Create trigger to auto-update cache
CREATE OR REPLACE FUNCTION update_super_admin_cache()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.role = 'super_admin' THEN
    INSERT INTO public.super_admin_cache (user_id, is_super_admin)
    VALUES (NEW.user_id, true)
    ON CONFLICT (user_id) DO UPDATE SET updated_at = now();
  ELSIF TG_OP = 'DELETE' AND OLD.role = 'super_admin' THEN
    DELETE FROM public.super_admin_cache WHERE user_id = OLD.user_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS sync_super_admin_cache ON user_roles;
CREATE TRIGGER sync_super_admin_cache
  AFTER INSERT OR DELETE ON user_roles
  FOR EACH ROW
  EXECUTE FUNCTION update_super_admin_cache();

-- Now create super admin policies using the cache (no recursion!)
CREATE POLICY "cached_super_admins_full_access"
  ON user_roles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM super_admin_cache 
      WHERE user_id = auth.uid() AND is_super_admin = true
    )
  );