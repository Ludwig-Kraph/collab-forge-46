-- Delete all related data for Super Admin account before deletion

-- Drop the protection function temporarily
DROP FUNCTION IF EXISTS protect_super_admin_role() CASCADE;

-- Delete from communication_channels
DELETE FROM communication_channels 
WHERE created_by = '79d827d7-e2b8-47c8-b566-a79fcb6a7652';

-- Delete from channel_messages
DELETE FROM channel_messages 
WHERE user_id = '79d827d7-e2b8-47c8-b566-a79fcb6a7652';

-- Delete from subscriptions
DELETE FROM subscriptions 
WHERE user_id = '79d827d7-e2b8-47c8-b566-a79fcb6a7652';

-- Delete from user_roles
DELETE FROM user_roles 
WHERE user_id = '79d827d7-e2b8-47c8-b566-a79fcb6a7652';

-- Delete from profiles
DELETE FROM profiles 
WHERE id = '79d827d7-e2b8-47c8-b566-a79fcb6a7652';

-- Delete from auth.users
DELETE FROM auth.users 
WHERE id = '79d827d7-e2b8-47c8-b566-a79fcb6a7652';

-- Recreate the protection function and trigger
CREATE OR REPLACE FUNCTION public.protect_super_admin_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'DELETE' AND OLD.role = 'super_admin' THEN
    RAISE EXCEPTION 'Cannot delete super_admin role - Super Admins have permanent immunity';
  END IF;
  
  IF TG_OP = 'UPDATE' AND OLD.role = 'super_admin' AND NEW.role != 'super_admin' THEN
    RAISE EXCEPTION 'Cannot modify super_admin role - Super Admins have permanent immunity';
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER protect_super_admin_role_trigger
  BEFORE UPDATE OR DELETE ON user_roles
  FOR EACH ROW
  EXECUTE FUNCTION protect_super_admin_role();