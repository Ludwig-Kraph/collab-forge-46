-- Update user_roles for Timothy Ng'ang'a to have correct Super Admin settings
UPDATE user_roles 
SET 
  account_type = 'control_panel',
  role_level = 'super_admin'
WHERE user_id = '79d827d7-e2b8-47c8-b566-a79fcb6a7652';

-- Verify the update
SELECT ur.role, ur.role_level, ur.account_type, p.phone_number, p.full_name
FROM user_roles ur
JOIN profiles p ON ur.user_id = p.id
WHERE p.phone_number = '254114712989';