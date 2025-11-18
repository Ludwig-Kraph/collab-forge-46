-- Add new columns to profiles table for avatar, verification, and government features
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS avatar_type TEXT DEFAULT 'default',
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free_trial',
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS verification_badge_color TEXT,
ADD COLUMN IF NOT EXISTS government_coat_of_arms_url TEXT,
ADD COLUMN IF NOT EXISTS is_flagged BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS flagged_by UUID,
ADD COLUMN IF NOT EXISTS flagged_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS blocked_by UUID,
ADD COLUMN IF NOT EXISTS blocked_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS block_reason TEXT,
ADD COLUMN IF NOT EXISTS flag_reason TEXT,
ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'active';

-- Add subscription expiry columns to subscriptions table
ALTER TABLE public.subscriptions
ADD COLUMN IF NOT EXISTS expiry_notified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_notification_date TIMESTAMP WITH TIME ZONE;

-- Create function to check if subscription is expired
CREATE OR REPLACE FUNCTION is_subscription_expired(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  subscription_record RECORD;
BEGIN
  SELECT * INTO subscription_record
  FROM subscriptions
  WHERE subscriptions.user_id = is_subscription_expired.user_id
  AND is_active = true
  LIMIT 1;
  
  IF subscription_record IS NULL THEN
    RETURN true;
  END IF;
  
  IF subscription_record.expires_at IS NOT NULL AND subscription_record.expires_at < NOW() THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

-- Update profiles RLS to consider blocked/flagged status
CREATE POLICY "Blocked users cannot access system" ON profiles
FOR ALL
TO authenticated
USING (
  NOT is_blocked OR auth.uid() = id OR is_super_admin(auth.uid())
);

-- Add comments for documentation
COMMENT ON COLUMN profiles.avatar_type IS 'Avatar type based on subscription tier (default, basic, premium, etc.)';
COMMENT ON COLUMN profiles.verification_badge_color IS 'Color code for subscription tier badge';
COMMENT ON COLUMN profiles.government_coat_of_arms_url IS 'URL to government coat of arms (only for government accounts)';
COMMENT ON COLUMN profiles.is_flagged IS 'Whether account is flagged by control panel staff';
COMMENT ON COLUMN profiles.is_blocked IS 'Whether account is blocked from accessing system';
COMMENT ON COLUMN profiles.account_status IS 'Current account status (active, suspended, blocked, expired)';