-- Update the profile for phone number 254114712989 to have correct Super Admin settings
UPDATE profiles
SET 
  role_level = 'super_admin',
  account_type = 'control_panel',
  account_id = NULL
WHERE phone_number = '254114712989';

-- Verify the update
SELECT p.id, p.phone_number, p.full_name, p.role_level, p.account_type, ur.role
FROM profiles p
LEFT JOIN user_roles ur ON p.id = ur.user_id
WHERE p.phone_number = '254114712989';