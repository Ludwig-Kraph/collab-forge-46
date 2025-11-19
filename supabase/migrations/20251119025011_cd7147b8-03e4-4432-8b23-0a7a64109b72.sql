-- Update super admin subscription to unlimited access
UPDATE subscriptions
SET 
  tier = 'enterprise',  -- Use enterprise tier enum
  max_stk_pushes = NULL,  -- NULL = unlimited STK pushes
  max_users = NULL,  -- NULL = unlimited users
  free_stk_pushes_remaining = NULL,  -- NULL = unlimited free pushes
  expires_at = NULL,  -- NULL = never expires (lifetime access)
  is_active = true,
  period = NULL,  -- No period restriction
  used_stk_pushes = 0,  -- Reset counter
  updated_at = now()
WHERE user_id = '79d827d7-e2b8-47c8-b566-a79fcb6a7652';

-- Also update profile to mark as Control Panel super admin
UPDATE profiles
SET 
  subscription_tier = 'Control Panel Super Admin',
  is_verified = true,
  updated_at = now()
WHERE id = '79d827d7-e2b8-47c8-b566-a79fcb6a7652';