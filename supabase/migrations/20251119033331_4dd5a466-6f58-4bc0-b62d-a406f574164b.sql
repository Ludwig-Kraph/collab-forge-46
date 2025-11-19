-- Remove subscription restrictions for super admin account
-- Super admins should have unlimited access without subscription constraints
UPDATE subscriptions
SET 
  tier = 'enterprise',
  max_stk_pushes = NULL, -- NULL means unlimited
  free_stk_pushes_remaining = NULL, -- NULL means unlimited
  max_users = NULL, -- NULL means unlimited
  expires_at = NULL, -- Never expires
  is_active = true
WHERE user_id = '79d827d7-e2b8-47c8-b566-a79fcb6a7652';

-- If no subscription exists, create one with unlimited access
INSERT INTO subscriptions (user_id, tier, max_stk_pushes, free_stk_pushes_remaining, max_users, expires_at, is_active)
SELECT '79d827d7-e2b8-47c8-b566-a79fcb6a7652', 'enterprise', NULL, NULL, NULL, NULL, true
WHERE NOT EXISTS (
  SELECT 1 FROM subscriptions WHERE user_id = '79d827d7-e2b8-47c8-b566-a79fcb6a7652'
);

-- Clean up any demo/test data (keeping only real accounts)
-- Delete transactions from demo accounts
DELETE FROM transactions WHERE user_id IN (
  SELECT id FROM profiles WHERE phone_number LIKE '%000000%' OR phone_number = '254000000000'
);

-- Delete payment requests from demo accounts
DELETE FROM payment_requests WHERE user_id IN (
  SELECT id FROM profiles WHERE phone_number LIKE '%000000%' OR phone_number = '254000000000'
);

-- Delete mpesa accounts from demo accounts
DELETE FROM mpesa_accounts WHERE user_id IN (
  SELECT id FROM profiles WHERE phone_number LIKE '%000000%' OR phone_number = '254000000000'
);

-- Delete subscriptions from demo accounts
DELETE FROM subscriptions WHERE user_id IN (
  SELECT id FROM profiles WHERE phone_number LIKE '%000000%' OR phone_number = '254000000000'
);

-- Delete user roles from demo accounts
DELETE FROM user_roles WHERE user_id IN (
  SELECT id FROM profiles WHERE phone_number LIKE '%000000%' OR phone_number = '254000000000'
);

-- Delete demo profiles
DELETE FROM profiles WHERE phone_number LIKE '%000000%' OR phone_number = '254000000000';

-- Update the profile to ensure phone number has correct format
UPDATE profiles
SET phone_number = '+254114712989'
WHERE id = '79d827d7-e2b8-47c8-b566-a79fcb6a7652' AND phone_number = '254114712989';