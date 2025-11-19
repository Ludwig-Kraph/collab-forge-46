-- Update super admin subscription to use super_admin tier
UPDATE subscriptions
SET 
  tier = 'super_admin'::subscription_tier,
  period = NULL -- super admin has no period restrictions
WHERE user_id = '79d827d7-e2b8-47c8-b566-a79fcb6a7652';