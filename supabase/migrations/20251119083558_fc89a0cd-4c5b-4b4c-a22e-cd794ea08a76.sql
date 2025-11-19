-- Add policies to allow manual role delegation via Supabase dashboard/SQL editor
-- These policies allow operations when auth.uid() is NULL (service role context)

CREATE POLICY "user_roles_manual_insert"
  ON user_roles
  FOR INSERT
  WITH CHECK (auth.uid() IS NULL OR is_super_admin(auth.uid()));

CREATE POLICY "user_roles_manual_update"
  ON user_roles
  FOR UPDATE
  USING (auth.uid() IS NULL OR is_super_admin(auth.uid()));

CREATE POLICY "user_roles_manual_delete"
  ON user_roles
  FOR DELETE
  USING (auth.uid() IS NULL OR is_super_admin(auth.uid()));

CREATE POLICY "user_roles_manual_select"
  ON user_roles
  FOR SELECT
  USING (auth.uid() IS NULL OR auth.uid() = user_id OR is_super_admin(auth.uid()));