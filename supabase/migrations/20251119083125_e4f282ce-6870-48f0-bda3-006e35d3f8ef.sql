-- Drop ALL existing policies on user_roles to fix infinite recursion
DROP POLICY IF EXISTS "Admins can manage same account profiles" ON user_roles;
DROP POLICY IF EXISTS "Super admins full access to profiles" ON user_roles;
DROP POLICY IF EXISTS "Super admins have absolute access" ON user_roles;
DROP POLICY IF EXISTS "Users can view their own profile" ON user_roles;
DROP POLICY IF EXISTS "Users view own profile" ON user_roles;
DROP POLICY IF EXISTS "Users can view own roles" ON user_roles;
DROP POLICY IF EXISTS "Super admins can view all roles" ON user_roles;
DROP POLICY IF EXISTS "Super admins can insert roles" ON user_roles;
DROP POLICY IF EXISTS "Super admins can update roles" ON user_roles;
DROP POLICY IF EXISTS "Super admins can delete roles" ON user_roles;

-- Create clean, non-recursive policies
CREATE POLICY "user_roles_select_own"
  ON user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "user_roles_select_super_admin"
  ON user_roles
  FOR SELECT
  USING (is_super_admin(auth.uid()));

CREATE POLICY "user_roles_insert_super_admin"
  ON user_roles
  FOR INSERT
  WITH CHECK (is_super_admin(auth.uid()));

CREATE POLICY "user_roles_update_super_admin"
  ON user_roles
  FOR UPDATE
  USING (is_super_admin(auth.uid()));

CREATE POLICY "user_roles_delete_super_admin"
  ON user_roles
  FOR DELETE
  USING (is_super_admin(auth.uid()));