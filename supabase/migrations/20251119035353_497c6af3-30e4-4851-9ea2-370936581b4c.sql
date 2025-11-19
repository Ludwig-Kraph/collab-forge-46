-- Sync Super Admin phone number format with Supabase Auth
-- Supabase Auth stores phone numbers without the + prefix for phone authentication

UPDATE profiles
SET phone_number = '254114712989'
WHERE id = '79d827d7-e2b8-47c8-b566-a79fcb6a7652' 
AND phone_number = '+254114712989';

-- Add comment for clarity
COMMENT ON COLUMN profiles.phone_number IS 'Phone number format must match auth.users phone format (without + prefix for phone auth users)';