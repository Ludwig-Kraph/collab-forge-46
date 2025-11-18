-- Create user_mpesa_accounts junction table for assigning MPESA accounts to RBAC users
CREATE TABLE IF NOT EXISTS public.user_mpesa_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mpesa_account_id UUID NOT NULL REFERENCES public.mpesa_accounts(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  assigned_by UUID REFERENCES auth.users(id),
  UNIQUE(user_id, mpesa_account_id)
);

-- Enable RLS
ALTER TABLE public.user_mpesa_accounts ENABLE ROW LEVEL SECURITY;

-- Create index for faster queries
CREATE INDEX idx_user_mpesa_accounts_user_id ON public.user_mpesa_accounts(user_id);
CREATE INDEX idx_user_mpesa_accounts_mpesa_account_id ON public.user_mpesa_accounts(mpesa_account_id);

-- RLS Policies
-- Admins can manage all assignments
CREATE POLICY "Admins can manage assignments"
  ON public.user_mpesa_accounts
  FOR ALL
  USING (
    is_super_admin(auth.uid()) OR 
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'corporate_admin'::app_role)
  );

-- Users can view their own assigned accounts
CREATE POLICY "Users can view their assignments"
  ON public.user_mpesa_accounts
  FOR SELECT
  USING (auth.uid() = user_id);

-- Add comment
COMMENT ON TABLE public.user_mpesa_accounts IS 'Junction table for assigning MPESA accounts to RBAC users';