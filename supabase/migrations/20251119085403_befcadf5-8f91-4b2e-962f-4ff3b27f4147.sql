-- Temporarily disable the protection trigger to clean duplicates
DROP TRIGGER IF EXISTS protect_super_admin_role_trigger ON user_roles;

-- Clean up existing duplicates
DELETE FROM user_roles a
USING user_roles b
WHERE a.ctid < b.ctid
  AND a.user_id = b.user_id
  AND a.role = b.role;

-- Add unique constraint (drop first if exists)
DO $$ 
BEGIN
  ALTER TABLE user_roles DROP CONSTRAINT IF EXISTS unique_user_role;
  ALTER TABLE user_roles ADD CONSTRAINT unique_user_role UNIQUE (user_id, role);
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;

-- Recreate the protection trigger
CREATE TRIGGER protect_super_admin_role_trigger
  BEFORE DELETE OR UPDATE ON user_roles
  FOR EACH ROW
  EXECUTE FUNCTION protect_super_admin_role();