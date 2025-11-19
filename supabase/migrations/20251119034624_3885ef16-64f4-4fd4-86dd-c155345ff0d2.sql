-- Super Admins have their own tier but are above subscription policies
-- Keep tier as 'super_admin' for tracking, but implement absolute immunity

-- Add function to check if user is super admin (for absolute access bypass)
CREATE OR REPLACE FUNCTION public.user_is_super_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'super_admin'
  )
$$;

-- Ensure super admins can NEVER be blocked
CREATE OR REPLACE FUNCTION public.prevent_super_admin_block()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if user is super admin
  IF EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = NEW.id AND role = 'super_admin'
  ) THEN
    -- Force is_blocked to false for super admins
    NEW.is_blocked = false;
    NEW.blocked_by = NULL;
    NEW.blocked_at = NULL;
    NEW.block_reason = NULL;
    NEW.is_flagged = false;
    NEW.flagged_by = NULL;
    NEW.flagged_at = NULL;
    NEW.flag_reason = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to prevent super admin blocking
DROP TRIGGER IF EXISTS enforce_super_admin_immunity ON profiles;
CREATE TRIGGER enforce_super_admin_immunity
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION prevent_super_admin_block();

-- Update RLS policy for profiles to ensure super admins always have full access
DROP POLICY IF EXISTS "Super admins have absolute access" ON profiles;
CREATE POLICY "Super admins have absolute access"
ON profiles
FOR ALL
TO authenticated
USING (user_is_super_admin(auth.uid()))
WITH CHECK (user_is_super_admin(auth.uid()));

-- Ensure super admin role cannot be deleted or modified
CREATE OR REPLACE FUNCTION public.protect_super_admin_role()
RETURNS TRIGGER AS $$
BEGIN
  -- Prevent deletion of super admin role
  IF TG_OP = 'DELETE' AND OLD.role = 'super_admin' THEN
    RAISE EXCEPTION 'Cannot delete super_admin role - Super Admins have permanent immunity';
  END IF;
  
  -- Prevent modification of super admin role
  IF TG_OP = 'UPDATE' AND OLD.role = 'super_admin' AND NEW.role != 'super_admin' THEN
    RAISE EXCEPTION 'Cannot modify super_admin role - Super Admins have permanent immunity';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to protect super admin role
DROP TRIGGER IF EXISTS protect_super_admin_role_trigger ON user_roles;
CREATE TRIGGER protect_super_admin_role_trigger
  BEFORE UPDATE OR DELETE ON user_roles
  FOR EACH ROW
  EXECUTE FUNCTION protect_super_admin_role();

-- Prevent super admin subscriptions from being deactivated or restricted
CREATE OR REPLACE FUNCTION public.protect_super_admin_subscription()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if this subscription belongs to a super admin
  IF EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = NEW.user_id AND role = 'super_admin'
  ) THEN
    -- Force unlimited access
    NEW.max_stk_pushes = NULL; -- Unlimited
    NEW.free_stk_pushes_remaining = NULL; -- Unlimited
    NEW.max_users = NULL; -- Unlimited
    NEW.expires_at = NULL; -- Never expires
    NEW.is_active = true; -- Always active
    -- Keep tier as super_admin for tracking
    IF NEW.tier != 'super_admin' THEN
      NEW.tier = 'super_admin';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to protect super admin subscription
DROP TRIGGER IF EXISTS protect_super_admin_subscription_trigger ON subscriptions;
CREATE TRIGGER protect_super_admin_subscription_trigger
  BEFORE INSERT OR UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION protect_super_admin_subscription();