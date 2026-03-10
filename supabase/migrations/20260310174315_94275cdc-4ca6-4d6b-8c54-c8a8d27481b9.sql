
-- Add account limits to subscription_tiers
ALTER TABLE public.subscription_tiers 
ADD COLUMN IF NOT EXISTS max_paybill_accounts integer DEFAULT NULL,
ADD COLUMN IF NOT EXISTS max_till_accounts integer DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.subscription_tiers.max_paybill_accounts IS 'Maximum number of Paybill accounts allowed for this tier. NULL means unlimited.';
COMMENT ON COLUMN public.subscription_tiers.max_till_accounts IS 'Maximum number of Till accounts allowed for this tier. NULL means unlimited.';
