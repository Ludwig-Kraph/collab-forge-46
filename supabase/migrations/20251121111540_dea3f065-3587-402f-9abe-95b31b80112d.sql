-- Add indexes for performance optimization
-- These indexes will dramatically speed up common queries

-- Transactions table indexes
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_user_status ON transactions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_transactions_mpesa_account ON transactions(mpesa_account_id, created_at DESC);

-- Payment requests indexes
CREATE INDEX IF NOT EXISTS idx_payment_requests_user ON payment_requests(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payment_requests_status ON payment_requests(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payment_requests_mpesa ON payment_requests(mpesa_account_id, created_at DESC);

-- Subscriptions indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_active ON subscriptions(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_subscriptions_expires ON subscriptions(expires_at) WHERE is_active = true;

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone_number);
CREATE INDEX IF NOT EXISTS idx_profiles_org ON profiles(organization_id) WHERE organization_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_account_type ON profiles(account_type, role_level);

-- Audit logs indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id, created_at DESC);

-- MPESA accounts indexes
CREATE INDEX IF NOT EXISTS idx_mpesa_accounts_user_active ON mpesa_accounts(user_id, is_active);

-- Support tickets indexes
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_tickets_assigned ON support_tickets(assigned_to, status);

-- Outlets indexes
CREATE INDEX IF NOT EXISTS idx_outlets_org_active ON outlets(organization_id, is_active);

-- User roles indexes
CREATE INDEX IF NOT EXISTS idx_user_roles_user ON user_roles(user_id, role);
CREATE INDEX IF NOT EXISTS idx_user_roles_org ON user_roles(organization_id) WHERE organization_id IS NOT NULL;

-- Create materialized view for dashboard statistics
CREATE MATERIALIZED VIEW IF NOT EXISTS dashboard_stats AS
SELECT 
  COUNT(DISTINCT p.id) as total_users,
  COUNT(DISTINCT CASE WHEN s.is_active THEN s.id END) as active_subscriptions,
  COUNT(DISTINCT t.id) as total_transactions,
  COALESCE(SUM(CASE WHEN t.transaction_type = 'received' AND t.status = 'completed' THEN t.amount ELSE 0 END), 0) as total_revenue,
  COUNT(DISTINCT CASE WHEN t.created_at >= NOW() - INTERVAL '30 days' THEN t.id END) as transactions_last_30_days,
  COUNT(DISTINCT CASE WHEN p.created_at >= NOW() - INTERVAL '30 days' THEN p.id END) as users_last_30_days
FROM profiles p
LEFT JOIN subscriptions s ON p.id = s.user_id
LEFT JOIN transactions t ON p.id = t.user_id;

-- Create index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_dashboard_stats_refresh ON dashboard_stats((1));

-- Function to refresh dashboard stats
CREATE OR REPLACE FUNCTION refresh_dashboard_stats()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY dashboard_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment explaining manual refresh
COMMENT ON FUNCTION refresh_dashboard_stats() IS 'Call this function to refresh dashboard statistics. Can be called manually or via scheduled job.';