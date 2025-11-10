-- Fix critical security issues identified in security scan

-- 1. Prevent transaction modifications (financial records should be immutable)
CREATE POLICY "Prevent transaction updates"
  ON public.transactions
  FOR UPDATE
  USING (false);

-- 2. Prevent transaction deletion (financial records must be permanent)
CREATE POLICY "Prevent transaction deletion"
  ON public.transactions
  FOR DELETE
  USING (false);

-- 3. Prevent unauthorized subscription creation (system-only)
CREATE POLICY "System can create subscriptions"
  ON public.subscriptions
  FOR INSERT
  WITH CHECK (false);

-- 4. Prevent subscription deletion
CREATE POLICY "Prevent subscription deletion"
  ON public.subscriptions
  FOR DELETE
  USING (false);

-- 5. Prevent profile deletion (data integrity)
CREATE POLICY "Prevent profile deletion"
  ON public.profiles
  FOR DELETE
  USING (false);

-- 6. Prevent organization deletion by owners
CREATE POLICY "Prevent organization deletion"
  ON public.organizations
  FOR DELETE
  USING (false);

-- 7. Restrict user role deletion to admins only
CREATE POLICY "Only admins can delete roles"
  ON public.user_roles
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 8. Prevent MPESA account deletion (use is_active flag for soft delete)
CREATE POLICY "Prevent MPESA account deletion"
  ON public.mpesa_accounts
  FOR DELETE
  USING (false);