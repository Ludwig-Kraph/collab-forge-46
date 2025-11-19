-- Reset password for Timothy Ng'ang'a using Supabase Admin API
-- Note: This approach uses a trigger that will be executed once

-- Create a temporary table to hold the password reset request
CREATE TABLE IF NOT EXISTS temp_password_resets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  new_password_hash text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Insert the password reset request
-- Password: M-Leja@2025
-- Using crypt function to hash the password
INSERT INTO temp_password_resets (user_id, new_password_hash)
VALUES (
  '79d827d7-e2b8-47c8-b566-a79fcb6a7652',
  crypt('M-Leja@2025', gen_salt('bf'))
);

-- Note: Actual password update must be done through Supabase Auth API
-- This migration prepares the data, but the actual update needs to be done via the dashboard or API
-- The user should reset their password via Supabase Dashboard:
-- 1. Go to Authentication > Users
-- 2. Find user with phone 254114712989  
-- 3. Click the three dots menu
-- 4. Select "Reset Password"
-- 5. Set new password: M-Leja@2025

-- Clean up
DROP TABLE IF EXISTS temp_password_resets;