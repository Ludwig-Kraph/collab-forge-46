# Supabase Performance Optimization Guide

Complete guide for optimizing M-Leja's Supabase performance during peak times and improving data throughput.

## Copyright Notice
**© 2024 Timothy Ng'ang'a. All Rights Reserved.**

---

## Table of Contents

1. [Understanding Supabase Architecture](#understanding-supabase-architecture)
2. [Supabase Cloud Optimization](#supabase-cloud-optimization)
3. [Self-Hosted Supabase Optimization](#self-hosted-supabase-optimization)
4. [Application-Level Optimizations](#application-level-optimizations)
5. [Database Query Optimization](#database-query-optimization)
6. [Real-Time Performance](#real-time-performance)
7. [Monitoring & Troubleshooting](#monitoring--troubleshooting)

---

## Understanding Supabase Architecture

### Supabase Cloud (Managed)
- **Automatic Scaling**: Handles container creation and scaling automatically
- **PgBouncer**: Built-in connection pooling (managed)
- **Read Replicas**: Available on Pro+ plans for read-heavy workloads
- **CDN**: Global edge network for API requests

### Self-Hosted Supabase
- **Manual Configuration**: You control Docker containers and resources
- **Scalability**: Depends on your infrastructure and configuration
- **Full Control**: Can optimize for specific workloads

---

## Supabase Cloud Optimization

### 1. Upgrade Instance Size

For peak time performance, upgrade your Supabase instance:

**Via Supabase Dashboard:**
1. Go to Settings → Infrastructure
2. Select larger compute instance
3. Upgrade takes ~10 minutes

**Recommended Tiers:**
- **Small** (default): Up to 1,000 concurrent users
- **Medium**: 1,000-5,000 concurrent users  
- **Large**: 5,000-10,000 concurrent users
- **2XL/4XL**: 10,000+ concurrent users

### 2. Enable Read Replicas (Pro+ Plans)

Distribute read load across multiple database instances:

```typescript
// Configure in your Supabase client
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!,
  {
    db: {
      schema: 'public',
    },
    global: {
      headers: {
        // Route read queries to read replica
        'x-supabase-replica': 'read',
      },
    },
  }
);
```

### 3. Connection Pooling Configuration

Supabase Cloud uses PgBouncer automatically, but you can optimize:

**Adjust via Supabase CLI:**
```bash
# Connect to your project
supabase link --project-ref your-project-ref

# View current pool settings
supabase db pooler list

# Pool modes available:
# - transaction (recommended for web apps)
# - session (for complex transactions)
# - statement (maximum concurrency)
```

### 4. Request Optimization

**Use the built-in cache:**
```typescript
import { supabase } from "@/integrations/supabase/client";

// Cache frequently accessed data
const { data } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .single()
  .cache(60); // Cache for 60 seconds
```

---

## Self-Hosted Supabase Optimization

### 1. Docker Compose Resource Allocation

Edit `docker-compose.yml` in your Supabase installation:

```yaml
services:
  db:
    image: supabase/postgres:15.1.0.117
    command:
      - postgres
      - -c
      - max_connections=200
      - -c
      - shared_buffers=512MB
      - -c
      - effective_cache_size=2GB
      - -c
      - maintenance_work_mem=128MB
      - -c
      - checkpoint_completion_target=0.9
      - -c
      - wal_buffers=32MB
      - -c
      - default_statistics_target=100
      - -c
      - random_page_cost=1.1
      - -c
      - effective_io_concurrency=200
      - -c
      - work_mem=8MB
      - -c
      - min_wal_size=1GB
      - -c
      - max_wal_size=4GB
      - -c
      - max_worker_processes=4
      - -c
      - max_parallel_workers_per_gather=2
      - -c
      - max_parallel_workers=4
    deploy:
      resources:
        limits:
          cpus: '4'
          memory: 8G
        reservations:
          cpus: '2'
          memory: 4G
    volumes:
      - ./volumes/db/data:/var/lib/postgresql/data
      - ./volumes/db/config:/etc/postgresql

  pgbouncer:
    image: pgbouncer/pgbouncer:1.21.0
    environment:
      - POOL_MODE=transaction
      - MAX_CLIENT_CONN=1000
      - DEFAULT_POOL_SIZE=25
      - RESERVE_POOL_SIZE=10
      - SERVER_LIFETIME=3600
      - SERVER_IDLE_TIMEOUT=600
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G

  # Scale Kong API Gateway
  kong:
    image: kong:2.8.1
    deploy:
      replicas: 2  # Run multiple instances
      resources:
        limits:
          cpus: '2'
          memory: 2G
```

### 2. PostgreSQL Configuration

Create `postgresql.conf`:

```conf
# Memory Configuration
shared_buffers = 512MB              # 25% of system RAM
effective_cache_size = 2GB          # 50-75% of system RAM
work_mem = 8MB                      # Per operation
maintenance_work_mem = 128MB

# Connection Settings
max_connections = 200
superuser_reserved_connections = 3

# Write Ahead Log
wal_buffers = 32MB
min_wal_size = 1GB
max_wal_size = 4GB
wal_compression = on

# Query Planning
random_page_cost = 1.1              # For SSD
effective_io_concurrency = 200      # For SSD

# Parallel Query Execution
max_worker_processes = 4
max_parallel_workers_per_gather = 2
max_parallel_workers = 4

# Checkpoints
checkpoint_completion_target = 0.9
checkpoint_timeout = 10min

# Logging
log_min_duration_statement = 1000   # Log slow queries (>1s)
log_connections = on
log_disconnections = on
```

### 3. PgBouncer Configuration

Create `pgbouncer.ini`:

```ini
[databases]
postgres = host=db port=5432 dbname=postgres

[pgbouncer]
# Connection Pooling
pool_mode = transaction
max_client_conn = 1000
default_pool_size = 25
min_pool_size = 10
reserve_pool_size = 10

# Connection Limits
server_lifetime = 3600
server_idle_timeout = 600
server_connect_timeout = 15
query_timeout = 120

# Performance
server_reset_query = DISCARD ALL
server_check_delay = 30
max_packet_size = 2147483647
```

### 4. Horizontal Scaling

**Add Read Replicas:**

```yaml
# docker-compose.yml
services:
  db-replica-1:
    image: supabase/postgres:15.1.0.117
    environment:
      - POSTGRES_PRIMARY_HOST=db
      - POSTGRES_REPLICATION_MODE=replica
    command:
      - postgres
      - -c
      - hot_standby=on
      - -c
      - max_standby_streaming_delay=30s
  
  db-replica-2:
    image: supabase/postgres:15.1.0.117
    environment:
      - POSTGRES_PRIMARY_HOST=db
      - POSTGRES_REPLICATION_MODE=replica
```

**Load Balancer Configuration (HAProxy):**

```conf
# haproxy.cfg
frontend postgres_frontend
    bind *:5432
    mode tcp
    default_backend postgres_backend

backend postgres_backend
    mode tcp
    balance roundrobin
    option tcp-check
    
    # Primary for writes
    server db-primary 172.20.0.2:5432 check
    
    # Replicas for reads (backup)
    server db-replica-1 172.20.0.3:5432 check backup
    server db-replica-2 172.20.0.4:5432 check backup
```

---

## Application-Level Optimizations

M-Leja includes built-in performance utilities in `src/utils/supabaseOptimization.ts`.

### 1. Query Caching

```typescript
import { optimizedQuery } from "@/utils/supabaseOptimization";

// Cached query with 60-second TTL
const { data, error } = await optimizedQuery<Profile[]>(
  'profiles',
  {
    select: 'id, full_name, email',
    filters: { is_active: true },
    limit: 100,
    cache: true,
    cacheTTL: 60 // seconds
  }
);
```

### 2. Batch Requests

```typescript
import { batchQueries } from "@/utils/supabaseOptimization";

// Execute multiple queries in parallel
const results = await batchQueries([
  () => supabase.from('profiles').select('*'),
  () => supabase.from('transactions').select('*'),
  () => supabase.from('mpesa_accounts').select('*')
]);
```

### 3. Retry Logic

```typescript
import { retryQuery } from "@/utils/supabaseOptimization";

// Automatically retry failed queries with exponential backoff
const { data, error } = await retryQuery(
  () => supabase.from('profiles').select('*'),
  3, // max retries
  1000 // base delay (ms)
);
```

### 4. Performance Tracking

```typescript
import { trackedQuery, performanceMetrics } from "@/utils/supabaseOptimization";

// Track query performance
const { data } = await trackedQuery(
  'fetch_user_profile',
  () => supabase.from('profiles').select('*').eq('id', userId)
);

// View metrics
const metrics = performanceMetrics.getMetrics();
console.log('Average query duration:', metrics.averageDuration);
console.log('Success rate:', metrics.successRate);
```

### 5. Connection Health Monitoring

```typescript
import { checkConnectionHealth } from "@/utils/supabaseOptimization";

// Check database connectivity
const health = await checkConnectionHealth();

if (health.status === 'unhealthy') {
  console.error('Database connection issues detected');
  // Implement fallback or notification
}
```

---

## Database Query Optimization

### 1. Create Proper Indexes

```sql
-- Frequently queried columns
CREATE INDEX idx_profiles_phone_number ON profiles(phone_number);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);
CREATE INDEX idx_payment_requests_status ON payment_requests(status);

-- Composite indexes for common queries
CREATE INDEX idx_transactions_user_date 
  ON transactions(user_id, transaction_date DESC);

-- Partial indexes for filtered queries
CREATE INDEX idx_active_subscriptions 
  ON subscriptions(user_id) 
  WHERE is_active = true;
```

### 2. Optimize Queries

**Before (Inefficient):**
```typescript
// Fetches all columns, no limit
const { data } = await supabase
  .from('transactions')
  .select('*');
```

**After (Optimized):**
```typescript
// Fetch only needed columns with limit
const { data } = await supabase
  .from('transactions')
  .select('id, amount, created_at')
  .order('created_at', { ascending: false })
  .limit(50);
```

### 3. Use Materialized Views for Complex Queries

```sql
-- Create materialized view for dashboard stats
CREATE MATERIALIZED VIEW user_statistics AS
SELECT 
  user_id,
  COUNT(*) as total_transactions,
  SUM(amount) as total_amount,
  AVG(amount) as average_amount,
  MAX(created_at) as last_transaction
FROM transactions
GROUP BY user_id;

-- Create index on materialized view
CREATE INDEX idx_user_stats_user_id ON user_statistics(user_id);

-- Refresh periodically (via cron or trigger)
REFRESH MATERIALIZED VIEW CONCURRENTLY user_statistics;
```

### 4. Use RLS Efficiently

```sql
-- Efficient RLS policy with indexed column
CREATE POLICY "Users access own data" ON transactions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Ensure user_id is indexed
CREATE INDEX IF NOT EXISTS idx_transactions_user_id 
  ON transactions(user_id);
```

---

## Real-Time Performance

### 1. Throttle Real-Time Updates

```typescript
import { optimizedRealtimeChannel } from "@/utils/supabaseOptimization";

// Batch updates every 100ms to reduce re-renders
const channel = optimizedRealtimeChannel('transactions-updates', {
  throttleMs: 100,
  batchUpdates: true
});

channel.subscribe((updates) => {
  // Process batched updates
  updates.forEach(update => {
    console.log('Transaction update:', update);
  });
});
```

### 2. Selective Column Subscriptions

```typescript
// Only listen to specific columns
const channel = supabase
  .channel('profile-changes')
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'profiles',
      // Only trigger on these column changes
      filter: 'id=eq.123'
    },
    (payload) => {
      console.log('Profile updated:', payload);
    }
  )
  .subscribe();
```

### 3. Unsubscribe When Not Needed

```typescript
useEffect(() => {
  const channel = supabase
    .channel('data-channel')
    .on('postgres_changes', { event: '*', schema: 'public' } as any, handleChange)
    .subscribe();

  // Clean up subscription
  return () => {
    supabase.removeChannel(channel);
  };
}, []);
```

---

## Monitoring & Troubleshooting

### 1. Enable Application Monitoring

M-Leja includes a performance monitoring dashboard:

```typescript
// In your Settings page or Admin panel
import { performanceMetrics } from "@/utils/supabaseOptimization";

const metrics = performanceMetrics.getMetrics();

console.log({
  totalQueries: metrics.total,
  avgDuration: metrics.averageDuration,
  successRate: metrics.successRate,
  recentErrors: metrics.recentErrors
});
```

### 2. Database Query Logs

**Supabase Cloud:**
```bash
# View logs via Supabase Dashboard
# Settings → Logs → Database

# Or via CLI
supabase db logs --project-ref your-project-ref
```

**Self-Hosted:**
```bash
# View PostgreSQL logs
docker-compose logs -f db

# View slow queries
docker exec -it supabase-db psql -U postgres -c "
  SELECT query, calls, mean_exec_time, total_exec_time
  FROM pg_stat_statements
  ORDER BY mean_exec_time DESC
  LIMIT 10;
"
```

### 3. Connection Pool Status

```sql
-- Check active connections
SELECT 
  datname as database,
  count(*) as connections,
  max(state) as state
FROM pg_stat_activity
GROUP BY datname;

-- Check connection pool usage
SELECT * FROM pg_stat_database;
```

### 4. Performance Bottlenecks

```sql
-- Find slow queries
SELECT 
  query,
  calls,
  total_exec_time,
  mean_exec_time,
  max_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 20;

-- Find missing indexes
SELECT 
  schemaname,
  tablename,
  attname,
  n_distinct,
  correlation
FROM pg_stats
WHERE schemaname = 'public'
  AND n_distinct > 100
  AND correlation < 0.1;
```

---

## Production Checklist

### Performance Optimization Checklist

- [ ] **Supabase Cloud**: Upgraded to appropriate instance size
- [ ] **Indexes**: Created on frequently queried columns
- [ ] **Caching**: Implemented query caching with appropriate TTL
- [ ] **Connection Pooling**: Configured PgBouncer settings
- [ ] **Real-Time**: Throttled updates and selective subscriptions
- [ ] **Monitoring**: Performance metrics tracking enabled
- [ ] **Query Optimization**: All queries use selective columns and limits
- [ ] **RLS Policies**: Optimized with proper indexes
- [ ] **Materialized Views**: Created for complex aggregations
- [ ] **Retry Logic**: Implemented for critical operations

### Self-Hosted Specific

- [ ] **Resources**: Docker containers allocated sufficient CPU/RAM
- [ ] **PostgreSQL Config**: Tuned for available resources
- [ ] **PgBouncer**: Configured for expected load
- [ ] **Backups**: Automated backup strategy in place
- [ ] **Replicas**: Read replicas configured (if needed)
- [ ] **Load Balancer**: HAProxy or similar configured
- [ ] **Monitoring**: Prometheus/Grafana or similar setup

---

## Troubleshooting Common Issues

### Issue: "Too many connections"

**Solution:**
```sql
-- Check current connections
SELECT count(*) FROM pg_stat_activity;

-- Kill idle connections
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE state = 'idle'
  AND state_change < NOW() - INTERVAL '5 minutes';
```

### Issue: Slow queries during peak time

**Solution:**
1. Enable query caching
2. Add database indexes
3. Upgrade Supabase instance
4. Implement read replicas

### Issue: Real-time updates causing lag

**Solution:**
1. Throttle updates (100-500ms)
2. Use selective column filters
3. Batch updates before processing
4. Unsubscribe when component unmounts

---

## Support

For production optimization consulting:

**Contact**: [Nassir Group](https://nassirgroup.com)  
**Developer**: Timothy Ng'ang'a

---

**© 2024 Timothy Ng'ang'a. All Rights Reserved.**
