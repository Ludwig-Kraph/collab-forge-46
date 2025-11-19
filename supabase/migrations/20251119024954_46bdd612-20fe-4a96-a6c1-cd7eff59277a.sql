-- Ensure super admin has unrestricted access through RLS policies
-- Super admins bypass all subscription checks and limits

-- Drop and recreate subscription policies to exclude super admins from restrictions
DROP POLICY IF EXISTS "Super admins bypass subscription limits" ON public.subscriptions;

CREATE POLICY "Super admins bypass subscription limits"
ON public.subscriptions
FOR ALL
USING (
  is_super_admin(auth.uid()) OR auth.uid() = user_id
);