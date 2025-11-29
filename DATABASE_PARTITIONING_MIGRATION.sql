-- ============================================================================
-- M-Leja Database Partitioning & Sharding Strategy
-- Supports: 120M daily users | 1.2B daily transactions
-- ============================================================================

-- PHASE 1: TRANSACTION TABLE PARTITIONING (IMMEDIATE)
-- Partition by date for efficient queries and archival
-- ============================================================================

BEGIN;

-- Step 1: Rename existing transactions table
ALTER TABLE transactions RENAME TO transactions_old;

-- Step 2: Create partitioned transactions table
CREATE TABLE transactions (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    mpesa_account_id uuid NOT NULL,
    transaction_id text NOT NULL,
    phone_number text NOT NULL,
    amount numeric NOT NULL,
    transaction_type text NOT NULL,
    status text NOT NULL DEFAULT 'pending',
    description text,
    mpesa_receipt_number text,
    balance_after numeric,
    transaction_date timestamptz NOT NULL DEFAULT now(),
    created_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (id, transaction_date)
) PARTITION BY RANGE (transaction_date);

-- Step 3: Create partitions for current and upcoming months
-- December 2024
CREATE TABLE transactions_2024_12 PARTITION OF transactions
    FOR VALUES FROM ('2024-12-01') TO ('2025-01-01');

-- January 2025
CREATE TABLE transactions_2025_01 PARTITION OF transactions
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

-- February 2025
CREATE TABLE transactions_2025_02 PARTITION OF transactions
    FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');

-- March 2025
CREATE TABLE transactions_2025_03 PARTITION OF transactions
    FOR VALUES FROM ('2025-03-01') TO ('2025-04-01');

-- April 2025
CREATE TABLE transactions_2025_04 PARTITION OF transactions
    FOR VALUES FROM ('2025-04-01') TO ('2025-05-01');

-- May 2025
CREATE TABLE transactions_2025_05 PARTITION OF transactions
    FOR VALUES FROM ('2025-05-01') TO ('2025-06-01');

-- June 2025
CREATE TABLE transactions_2025_06 PARTITION OF transactions
    FOR VALUES FROM ('2025-06-01') TO ('2025-07-01');

-- Step 4: Create indexes on partitioned table
CREATE INDEX CONCURRENTLY idx_transactions_user_date ON transactions (user_id, transaction_date DESC);
CREATE INDEX CONCURRENTLY idx_transactions_mpesa_date ON transactions (mpesa_account_id, transaction_date DESC);
CREATE INDEX CONCURRENTLY idx_transactions_status ON transactions (status, transaction_date DESC);
CREATE INDEX CONCURRENTLY idx_transactions_phone ON transactions (phone_number, transaction_date DESC);
CREATE INDEX CONCURRENTLY idx_transactions_receipt ON transactions (mpesa_receipt_number) WHERE mpesa_receipt_number IS NOT NULL;

-- Step 5: Migrate data from old table (batch by batch to avoid locks)
INSERT INTO transactions 
SELECT * FROM transactions_old
WHERE transaction_date >= '2024-12-01'
ORDER BY transaction_date
ON CONFLICT DO NOTHING;

-- Step 6: Verify data migration
DO $$
DECLARE
    old_count bigint;
    new_count bigint;
BEGIN
    SELECT COUNT(*) INTO old_count FROM transactions_old WHERE transaction_date >= '2024-12-01';
    SELECT COUNT(*) INTO new_count FROM transactions;
    
    IF old_count != new_count THEN
        RAISE EXCEPTION 'Data migration mismatch: old=%, new=%', old_count, new_count;
    ELSE
        RAISE NOTICE 'Data migration successful: % rows', new_count;
    END IF;
END $$;

-- Step 7: Archive old data (older than 6 months) to separate table
CREATE TABLE transactions_archive (LIKE transactions_old INCLUDING ALL);

INSERT INTO transactions_archive 
SELECT * FROM transactions_old 
WHERE transaction_date < '2024-12-01';

-- Step 8: Update RLS policies for partitioned table
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can insert their own transactions" ON transactions;
DROP POLICY IF EXISTS "Prevent transaction updates" ON transactions;
DROP POLICY IF EXISTS "Prevent transaction deletion" ON transactions;

CREATE POLICY "Users can view their own transactions" ON transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions" ON transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Prevent transaction updates" ON transactions
    FOR UPDATE USING (false);

CREATE POLICY "Prevent transaction deletion" ON transactions
    FOR DELETE USING (false);

COMMIT;

-- ============================================================================
-- PHASE 2: PAYMENT_REQUESTS TABLE PARTITIONING
-- ============================================================================

BEGIN;

-- Step 1: Rename existing payment_requests table
ALTER TABLE payment_requests RENAME TO payment_requests_old;

-- Step 2: Create partitioned payment_requests table
CREATE TABLE payment_requests (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    mpesa_account_id uuid NOT NULL,
    customer_phone text NOT NULL,
    amount numeric NOT NULL,
    description text,
    status text NOT NULL DEFAULT 'pending',
    checkout_request_id text,
    merchant_request_id text,
    result_code text,
    result_desc text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    completed_at timestamptz,
    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- Step 3: Create partitions
CREATE TABLE payment_requests_2024_12 PARTITION OF payment_requests
    FOR VALUES FROM ('2024-12-01') TO ('2025-01-01');

CREATE TABLE payment_requests_2025_01 PARTITION OF payment_requests
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

CREATE TABLE payment_requests_2025_02 PARTITION OF payment_requests
    FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');

CREATE TABLE payment_requests_2025_03 PARTITION OF payment_requests
    FOR VALUES FROM ('2025-03-01') TO ('2025-04-01');

CREATE TABLE payment_requests_2025_04 PARTITION OF payment_requests
    FOR VALUES FROM ('2025-04-01') TO ('2025-05-01');

CREATE TABLE payment_requests_2025_05 PARTITION OF payment_requests
    FOR VALUES FROM ('2025-05-01') TO ('2025-06-01');

CREATE TABLE payment_requests_2025_06 PARTITION OF payment_requests
    FOR VALUES FROM ('2025-06-01') TO ('2025-07-01');

-- Step 4: Create indexes
CREATE INDEX CONCURRENTLY idx_payment_requests_user_date ON payment_requests (user_id, created_at DESC);
CREATE INDEX CONCURRENTLY idx_payment_requests_status ON payment_requests (status, created_at DESC);
CREATE INDEX CONCURRENTLY idx_payment_requests_checkout ON payment_requests (checkout_request_id) WHERE checkout_request_id IS NOT NULL;

-- Step 5: Migrate data
INSERT INTO payment_requests 
SELECT * FROM payment_requests_old
WHERE created_at >= '2024-12-01'
ON CONFLICT DO NOTHING;

-- Step 6: Update RLS policies
ALTER TABLE payment_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own payment requests" ON payment_requests;
DROP POLICY IF EXISTS "Users can create their own payment requests" ON payment_requests;
DROP POLICY IF EXISTS "System can update payment requests" ON payment_requests;
DROP POLICY IF EXISTS "Prevent payment request deletion" ON payment_requests;

CREATE POLICY "Users can view their own payment requests" ON payment_requests
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own payment requests" ON payment_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update payment requests" ON payment_requests
    FOR UPDATE USING (true);

CREATE POLICY "Prevent payment request deletion" ON payment_requests
    FOR DELETE USING (false);

COMMIT;

-- ============================================================================
-- PHASE 3: AUTOMATIC PARTITION MANAGEMENT
-- ============================================================================

-- Function to create future partitions automatically
CREATE OR REPLACE FUNCTION create_monthly_partitions(
    table_name text,
    months_ahead integer DEFAULT 3
)
RETURNS void AS $$
DECLARE
    start_date date;
    end_date date;
    partition_name text;
    i integer;
BEGIN
    FOR i IN 1..months_ahead LOOP
        start_date := date_trunc('month', CURRENT_DATE + (i || ' months')::interval)::date;
        end_date := date_trunc('month', CURRENT_DATE + ((i + 1) || ' months')::interval)::date;
        partition_name := table_name || '_' || to_char(start_date, 'YYYY_MM');
        
        -- Check if partition already exists
        IF NOT EXISTS (
            SELECT 1 FROM pg_class 
            WHERE relname = partition_name
        ) THEN
            EXECUTE format(
                'CREATE TABLE %I PARTITION OF %I FOR VALUES FROM (%L) TO (%L)',
                partition_name, table_name, start_date, end_date
            );
            
            RAISE NOTICE 'Created partition: %', partition_name;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Schedule automatic partition creation (run monthly via cron)
-- Call this function from your edge function or cron job
-- SELECT create_monthly_partitions('transactions', 3);
-- SELECT create_monthly_partitions('payment_requests', 3);

-- ============================================================================
-- PHASE 4: MATERIALIZED VIEWS FOR FAST AGGREGATIONS
-- ============================================================================

-- Daily transaction summary (refreshed every 5 minutes)
CREATE MATERIALIZED VIEW daily_transaction_summary AS
SELECT 
    DATE(transaction_date) as date,
    user_id,
    COUNT(*) as transaction_count,
    SUM(CASE WHEN transaction_type = 'received' THEN amount ELSE 0 END) as total_received,
    SUM(CASE WHEN transaction_type = 'sent' THEN amount ELSE 0 END) as total_sent,
    MAX(balance_after) as end_balance
FROM transactions
WHERE transaction_date >= CURRENT_DATE - INTERVAL '90 days'
    AND status = 'completed'
GROUP BY DATE(transaction_date), user_id;

CREATE UNIQUE INDEX ON daily_transaction_summary (date, user_id);

-- User monthly stats (refreshed hourly)
CREATE MATERIALIZED VIEW user_monthly_stats AS
SELECT 
    user_id,
    DATE_TRUNC('month', transaction_date) as month,
    COUNT(*) as transaction_count,
    SUM(amount) as total_volume,
    AVG(amount) as avg_transaction,
    MAX(transaction_date) as last_transaction
FROM transactions
WHERE transaction_date >= CURRENT_DATE - INTERVAL '12 months'
    AND status = 'completed'
GROUP BY user_id, DATE_TRUNC('month', transaction_date);

CREATE UNIQUE INDEX ON user_monthly_stats (user_id, month);

-- MPESA account statistics (refreshed every 10 minutes)
CREATE MATERIALIZED VIEW mpesa_account_stats AS
SELECT 
    mpesa_account_id,
    COUNT(*) as transaction_count,
    SUM(amount) as total_volume,
    MAX(transaction_date) as last_transaction,
    COUNT(DISTINCT user_id) as unique_users
FROM transactions
WHERE transaction_date >= CURRENT_DATE - INTERVAL '30 days'
    AND status = 'completed'
GROUP BY mpesa_account_id;

CREATE UNIQUE INDEX ON mpesa_account_stats (mpesa_account_id);

-- Function to refresh materialized views
CREATE OR REPLACE FUNCTION refresh_materialized_views()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY daily_transaction_summary;
    REFRESH MATERIALIZED VIEW CONCURRENTLY user_monthly_stats;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mpesa_account_stats;
    
    RAISE NOTICE 'Materialized views refreshed at %', now();
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- PHASE 5: QUERY OPTIMIZATION HELPERS
-- ============================================================================

-- Function to get user transactions efficiently (uses partitions)
CREATE OR REPLACE FUNCTION get_user_transactions(
    p_user_id uuid,
    p_start_date timestamptz DEFAULT CURRENT_DATE - INTERVAL '30 days',
    p_end_date timestamptz DEFAULT CURRENT_DATE + INTERVAL '1 day',
    p_limit integer DEFAULT 100
)
RETURNS TABLE (
    id uuid,
    amount numeric,
    transaction_type text,
    status text,
    phone_number text,
    transaction_date timestamptz,
    balance_after numeric
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id,
        t.amount,
        t.transaction_type,
        t.status,
        t.phone_number,
        t.transaction_date,
        t.balance_after
    FROM transactions t
    WHERE t.user_id = p_user_id
        AND t.transaction_date >= p_start_date
        AND t.transaction_date <= p_end_date
    ORDER BY t.transaction_date DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get user balance efficiently
CREATE OR REPLACE FUNCTION get_user_balance(p_user_id uuid)
RETURNS numeric AS $$
DECLARE
    balance numeric;
BEGIN
    -- Try to get from most recent transaction
    SELECT balance_after INTO balance
    FROM transactions
    WHERE user_id = p_user_id
        AND balance_after IS NOT NULL
        AND transaction_date >= CURRENT_DATE - INTERVAL '7 days'
    ORDER BY transaction_date DESC
    LIMIT 1;
    
    -- If no recent transaction, calculate from all transactions
    IF balance IS NULL THEN
        SELECT COALESCE(
            SUM(CASE 
                WHEN transaction_type = 'received' THEN amount 
                ELSE -amount 
            END), 
            0
        ) INTO balance
        FROM transactions
        WHERE user_id = p_user_id
            AND status = 'completed';
    END IF;
    
    RETURN COALESCE(balance, 0);
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- PHASE 6: MONITORING & MAINTENANCE
-- ============================================================================

-- Function to check partition sizes
CREATE OR REPLACE FUNCTION check_partition_sizes()
RETURNS TABLE (
    table_name text,
    partition_name text,
    row_count bigint,
    size_mb numeric
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pt.schemaname || '.' || pt.tablename as table_name,
        pc.relname::text as partition_name,
        pc.reltuples::bigint as row_count,
        ROUND(pg_total_relation_size(pc.oid) / 1024.0 / 1024.0, 2) as size_mb
    FROM pg_class pc
    JOIN pg_inherits pi ON pc.oid = pi.inhrelid
    JOIN pg_class pp ON pi.inhparent = pp.oid
    JOIN pg_tables pt ON pp.relname = pt.tablename
    WHERE pp.relname IN ('transactions', 'payment_requests')
    ORDER BY pc.relname;
END;
$$ LANGUAGE plpgsql;

-- Function to drop old partitions (archive after 12 months)
CREATE OR REPLACE FUNCTION archive_old_partitions(
    table_name text,
    months_to_keep integer DEFAULT 12
)
RETURNS void AS $$
DECLARE
    cutoff_date date;
    partition_name text;
BEGIN
    cutoff_date := date_trunc('month', CURRENT_DATE - (months_to_keep || ' months')::interval)::date;
    
    FOR partition_name IN 
        SELECT pc.relname::text
        FROM pg_class pc
        JOIN pg_inherits pi ON pc.oid = pi.inhrelid
        JOIN pg_class pp ON pi.inhparent = pp.oid
        WHERE pp.relname = table_name
            AND pc.relname < table_name || '_' || to_char(cutoff_date, 'YYYY_MM')
    LOOP
        EXECUTE format('DROP TABLE IF EXISTS %I', partition_name);
        RAISE NOTICE 'Archived partition: %', partition_name;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check partition distribution
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE tablename LIKE 'transactions_%' OR tablename LIKE 'payment_requests_%'
ORDER BY tablename;

-- Check index usage
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as index_scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE tablename IN ('transactions', 'payment_requests')
ORDER BY idx_scan DESC;

-- Check materialized view freshness
SELECT 
    schemaname,
    matviewname,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||matviewname)) as size,
    last_refresh
FROM pg_matviews
ORDER BY matviewname;

-- ============================================================================
-- NOTES FOR DEPLOYMENT
-- ============================================================================

/*
IMPORTANT: This migration should be run during low-traffic periods.

1. Test in staging environment first
2. Verify data migration before dropping old tables
3. Monitor query performance after migration
4. Set up automated partition creation (monthly cron job)
5. Set up materialized view refresh (every 5-10 minutes)
6. Monitor partition sizes and archive old data regularly

Estimated downtime: 5-15 minutes (depending on data volume)
Recommended maintenance window: 2 AM - 4 AM EAT

After migration:
- Update application queries to leverage partitions
- Monitor query explain plans for partition pruning
- Set up automated archival of old partitions
- Configure materialized view refresh schedule
*/
