-- CRITICAL FIX: Automatic Super Admin Cache Synchronization
-- This prevents the cache from ever getting out of sync

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS sync_super_admin_cache ON user_roles;
DROP FUNCTION IF EXISTS update_super_admin_cache();

-- Create robust function to keep cache in sync
CREATE OR REPLACE FUNCTION public.update_super_admin_cache()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.role = 'super_admin' THEN
    -- Add to cache when super_admin role is assigned
    INSERT INTO public.super_admin_cache (user_id, is_super_admin)
    VALUES (NEW.user_id, true)
    ON CONFLICT (user_id) 
    DO UPDATE SET 
      is_super_admin = true,
      updated_at = now();
      
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.role = 'super_admin' AND OLD.role != 'super_admin' THEN
      -- Promoted to super_admin
      INSERT INTO public.super_admin_cache (user_id, is_super_admin)
      VALUES (NEW.user_id, true)
      ON CONFLICT (user_id) 
      DO UPDATE SET 
        is_super_admin = true,
        updated_at = now();
        
    ELSIF NEW.role != 'super_admin' AND OLD.role = 'super_admin' THEN
      -- Demoted from super_admin (shouldn't happen but handle it)
      DELETE FROM public.super_admin_cache WHERE user_id = NEW.user_id;
    END IF;
    
  ELSIF TG_OP = 'DELETE' AND OLD.role = 'super_admin' THEN
    -- Remove from cache when super_admin role is deleted
    DELETE FROM public.super_admin_cache WHERE user_id = OLD.user_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create trigger to automatically maintain cache
CREATE TRIGGER sync_super_admin_cache
  AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_super_admin_cache();

-- Ensure cache is populated with all current super admins
INSERT INTO public.super_admin_cache (user_id, is_super_admin)
SELECT user_id, true
FROM public.user_roles
WHERE role = 'super_admin'
ON CONFLICT (user_id) 
DO UPDATE SET 
  is_super_admin = true,
  updated_at = now();

-- Add comment for documentation
COMMENT ON FUNCTION public.update_super_admin_cache() IS 
'Automatically maintains super_admin_cache table in sync with user_roles. This prevents cache mismatches and ensures super admin status is always accurate.';