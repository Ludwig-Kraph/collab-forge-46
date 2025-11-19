-- Create unlimited Control Panel Super Admin subscription tier with valid period
INSERT INTO subscription_tiers (
  name,
  description,
  price,
  currency,
  period,
  max_stk_pushes,
  max_users,
  is_active,
  is_period_enabled,
  icon_name,
  features
)
VALUES (
  'Control Panel Super Admin',
  'Unlimited access for M-Leja Control Panel Super Administrators. No restrictions.',
  0,
  'KES',
  'monthly',  -- Use monthly but disable period enforcement
  NULL,  -- NULL means unlimited STK pushes
  NULL,  -- NULL means unlimited users
  true,
  false,  -- Period not enforced
  'Shield',
  '[
    "Unlimited STK Push Requests",
    "Unlimited User Accounts",
    "Full Control Panel Access",
    "All System Features Unlocked",
    "Lifetime Access",
    "No Restrictions",
    "Complete System Administration",
    "All RBAC Account Management",
    "Government Portal Management",
    "Subscription Tier Management",
    "System Settings Control",
    "Audit Log Access"
  ]'::jsonb
)
ON CONFLICT DO NOTHING;