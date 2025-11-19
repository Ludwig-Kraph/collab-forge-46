-- Add super_admin to subscription_tier enum
ALTER TYPE subscription_tier ADD VALUE IF NOT EXISTS 'super_admin';

-- Update subscription_tiers table to include super_admin tier
INSERT INTO subscription_tiers (
  name,
  description,
  price,
  currency,
  period,
  max_users,
  max_stk_pushes,
  features,
  icon_name,
  is_active,
  is_period_enabled
)
VALUES (
  'Super Admin',
  'Unlimited access for M-Leja Control Panel administrators with complete system control',
  0,
  'KES',
  'monthly', -- set to monthly but period is not enabled
  NULL, -- unlimited users
  NULL, -- unlimited STK pushes
  jsonb_build_array(
    'Unlimited STK Push Requests',
    'Unlimited User Accounts',
    'Full Control Panel Access',
    'Multi-Outlet Management',
    'Advanced Analytics & Reporting',
    'Priority Support',
    'System Configuration Access',
    'Government Portal Access',
    'Audit Log Access',
    'No Expiration'
  ),
  'Shield',
  true,
  false -- no period for super admin
)
ON CONFLICT (name) DO UPDATE
SET
  description = EXCLUDED.description,
  max_users = EXCLUDED.max_users,
  max_stk_pushes = EXCLUDED.max_stk_pushes,
  features = EXCLUDED.features,
  is_period_enabled = EXCLUDED.is_period_enabled;