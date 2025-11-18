-- Create subscription_tiers table for dynamic tier management
CREATE TABLE IF NOT EXISTS public.subscription_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'KES',
  period TEXT NOT NULL DEFAULT 'monthly' CHECK (period IN ('daily', 'weekly', 'monthly', 'annual')),
  max_users INTEGER,
  max_stk_pushes INTEGER,
  features JSONB DEFAULT '[]'::jsonb,
  icon_name TEXT DEFAULT 'Building2',
  is_active BOOLEAN DEFAULT true,
  is_period_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.subscription_tiers ENABLE ROW LEVEL SECURITY;

-- Policies for subscription_tiers
CREATE POLICY "Anyone can view active tiers"
ON public.subscription_tiers
FOR SELECT
USING (is_active = true);

CREATE POLICY "Super admins can manage tiers"
ON public.subscription_tiers
FOR ALL
USING (is_super_admin(auth.uid()));

-- Create trigger for updated_at
CREATE TRIGGER update_subscription_tiers_updated_at
BEFORE UPDATE ON public.subscription_tiers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add period column to subscriptions table if not exists
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS period TEXT DEFAULT 'monthly' CHECK (period IN ('daily', 'weekly', 'monthly', 'annual'));

-- Create mpesa_daraja_configs table for user-specific M-Pesa Daraja API credentials
CREATE TABLE IF NOT EXISTS public.mpesa_daraja_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mpesa_account_id UUID NOT NULL REFERENCES public.mpesa_accounts(id) ON DELETE CASCADE,
  consumer_key TEXT NOT NULL,
  consumer_secret TEXT NOT NULL,
  passkey TEXT NOT NULL,
  shortcode TEXT NOT NULL,
  environment TEXT NOT NULL DEFAULT 'sandbox' CHECK (environment IN ('sandbox', 'production')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(mpesa_account_id)
);

-- Enable RLS
ALTER TABLE public.mpesa_daraja_configs ENABLE ROW LEVEL SECURITY;

-- Policies for mpesa_daraja_configs
CREATE POLICY "Users can view their own configs"
ON public.mpesa_daraja_configs
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own configs"
ON public.mpesa_daraja_configs
FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Super admins can view all configs"
ON public.mpesa_daraja_configs
FOR SELECT
USING (is_super_admin(auth.uid()));

-- Create trigger for updated_at
CREATE TRIGGER update_mpesa_daraja_configs_updated_at
BEFORE UPDATE ON public.mpesa_daraja_configs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Modify user_mpesa_accounts to support better management
COMMENT ON TABLE public.user_mpesa_accounts IS 'Tracks which RBAC users have access to which M-Pesa accounts';