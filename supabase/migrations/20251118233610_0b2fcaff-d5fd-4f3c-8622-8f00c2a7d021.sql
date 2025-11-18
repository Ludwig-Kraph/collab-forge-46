-- Update subscription to unlimited government tier for +254711625144
UPDATE public.subscriptions
SET 
  tier = 'government',
  max_users = NULL,
  max_stk_pushes = NULL,
  free_stk_pushes_remaining = NULL,
  used_stk_pushes = 0,
  expires_at = NULL,
  period = 'annual',
  is_active = true,
  updated_at = NOW()
WHERE user_id = '53c694cc-4792-4628-9ea7-839059fcbbad';

-- Update profile to government tier
UPDATE public.profiles
SET 
  subscription_tier = 'government',
  verification_badge_color = 'purple',
  account_status = 'active',
  is_verified = true,
  updated_at = NOW()
WHERE id = '53c694cc-4792-4628-9ea7-839059fcbbad';

-- Update role to super_admin (delete old, insert new to avoid conflicts)
DELETE FROM public.user_roles WHERE user_id = '53c694cc-4792-4628-9ea7-839059fcbbad';
INSERT INTO public.user_roles (user_id, role)
VALUES ('53c694cc-4792-4628-9ea7-839059fcbbad', 'super_admin');