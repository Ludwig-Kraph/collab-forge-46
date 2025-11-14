# M-Leja Performance Optimization Guide

## Current Optimizations Implemented

### 1. Database Performance
- **Indexed Columns**: All foreign keys and frequently queried columns
- **RLS Policies**: Optimized with security definer functions to prevent recursion
- **Query Optimization**: Using `.select()` with specific columns instead of `*`
- **Materialized Views**: Consider implementing for analytics dashboards

### 2. Frontend Performance
- **Code Splitting**: React lazy loading for routes
- **Image Optimization**: Consider using next-gen formats (WebP, AVIF)
- **Bundle Size**: Minimize by tree-shaking unused imports
- **Caching**: Service Worker for PWA offline functionality

### 3. Real-time Features
- **Selective Subscriptions**: Only subscribe to necessary channels
- **Debouncing**: User input debounced to reduce API calls
- **Optimistic Updates**: UI updates before server confirmation

## Recommended Additional Optimizations

### Database Layer

#### 1. Add Indexes for Common Queries
```sql
-- Add indexes for frequently filtered columns
CREATE INDEX idx_transactions_user_date ON transactions(user_id, transaction_date DESC);
CREATE INDEX idx_payment_requests_status ON payment_requests(status, created_at DESC);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id, created_at DESC);
CREATE INDEX idx_mpesa_accounts_active ON mpesa_accounts(user_id) WHERE is_active = true;
```

#### 2. Implement Materialized Views for Analytics
```sql
-- Create materialized view for dashboard statistics
CREATE MATERIALIZED VIEW dashboard_stats AS
SELECT 
  COUNT(DISTINCT user_id) as total_users,
  COUNT(DISTINCT CASE WHEN is_active THEN id END) as active_subscriptions,
  SUM(amount) as total_transaction_amount
FROM subscriptions
JOIN transactions ON subscriptions.user_id = transactions.user_id;

-- Refresh periodically
REFRESH MATERIALIZED VIEW dashboard_stats;
```

#### 3. Query Optimization
```typescript
// ❌ Bad: Fetches all columns
const { data } = await supabase.from('transactions').select('*');

// ✅ Good: Only fetch needed columns
const { data } = await supabase
  .from('transactions')
  .select('id, amount, transaction_date, status')
  .limit(20);
```

### Frontend Layer

#### 1. Implement React Query for Caching
```typescript
// Install: npm install @tanstack/react-query

import { useQuery } from '@tanstack/react-query';

// Cache frequently accessed data
const { data: transactions } = useQuery({
  queryKey: ['transactions', userId],
  queryFn: () => fetchTransactions(userId),
  staleTime: 5 * 60 * 1000, // 5 minutes
});
```

#### 2. Virtual Scrolling for Large Lists
```typescript
// Install: npm install react-virtual

import { useVirtualizer } from '@tanstack/react-virtual';

// For transaction lists with 1000+ items
const rowVirtualizer = useVirtualizer({
  count: transactions.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 60,
});
```

#### 3. Lazy Load Images
```typescript
// Use native lazy loading
<img 
  src={imageUrl} 
  alt="Description" 
  loading="lazy"
  decoding="async"
/>
```

#### 4. Debounce Search Inputs
```typescript
import { useMemo, useState } from 'react';
import { debounce } from 'lodash';

const debouncedSearch = useMemo(
  () => debounce((searchTerm) => {
    // Perform search
  }, 300),
  []
);
```

### Edge Functions Performance

#### 1. Use Connection Pooling
```typescript
// In edge functions, reuse Supabase client
const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  {
    db: {
      schema: 'public'
    },
    global: {
      headers: { 'x-application-name': 'm-leja' }
    }
  }
);
```

#### 2. Implement Caching in Edge Functions
```typescript
// Use Deno KV for caching (if available)
const kv = await Deno.openKv();

// Cache MPESA OAuth tokens
const cachedToken = await kv.get(['mpesa_token']);
if (cachedToken.value) {
  return cachedToken.value;
}

// Fetch new token and cache
const token = await fetchOAuthToken();
await kv.set(['mpesa_token'], token, { expireIn: 3600 * 1000 }); // 1 hour
```

### Monitoring & Metrics

#### 1. Add Performance Monitoring
```typescript
// Create performance monitor hook
export const usePerformanceMonitor = (metricName: string) => {
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Log to analytics
      console.log(`${metricName} took ${duration}ms`);
      
      // Send to monitoring service if needed
      if (duration > 1000) {
        console.warn(`Slow operation: ${metricName}`);
      }
    };
  }, [metricName]);
};
```

#### 2. Track Core Web Vitals
```typescript
// Add to main.tsx
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric: any) {
  // Send to your analytics service
  console.log(metric);
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

## Performance Targets

### Page Load Times
- **First Contentful Paint (FCP)**: < 1.8s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Time to Interactive (TTI)**: < 3.8s
- **Cumulative Layout Shift (CLS)**: < 0.1

### API Response Times
- **Database Queries**: < 100ms
- **Edge Functions**: < 500ms
- **MPESA API Calls**: < 2s (external dependency)

### Bundle Sizes
- **Initial Bundle**: < 200KB gzipped
- **Total JavaScript**: < 500KB gzipped
- **Images**: Optimized and lazy loaded

## Testing Performance

### 1. Lighthouse Audit
```bash
# Run Lighthouse in Chrome DevTools
# Or use CLI
npm install -g lighthouse
lighthouse https://your-app-url.com --view
```

### 2. Bundle Analysis
```bash
# Analyze bundle size
npm run build -- --analyze

# Or use webpack-bundle-analyzer
npm install --save-dev webpack-bundle-analyzer
```

### 3. Load Testing Edge Functions
```bash
# Use Apache Bench
ab -n 1000 -c 10 https://your-edge-function-url

# Or use Artillery
npm install -g artillery
artillery quick --count 100 --num 10 https://your-edge-function-url
```

## Common Performance Issues

### Issue 1: Slow Dashboard Load
**Symptom**: Dashboard takes > 3 seconds to load
**Cause**: Multiple sequential API calls
**Solution**: Use `Promise.all()` to parallelize

### Issue 2: Real-time Updates Lag
**Symptom**: Transaction updates delayed
**Cause**: Too many subscriptions or inefficient filters
**Solution**: Optimize RLS policies and use selective subscriptions

### Issue 3: Large Transaction Lists
**Symptom**: UI freezes with 1000+ transactions
**Cause**: Rendering all items at once
**Solution**: Implement pagination or virtual scrolling

### Issue 4: Slow MPESA Operations
**Symptom**: STK push takes > 5 seconds
**Cause**: Network latency or API timeout
**Solution**: Implement proper loading states and retry logic

## Maintenance Checklist

### Weekly
- [ ] Review slow query logs
- [ ] Check Edge Function error rates
- [ ] Monitor database size and growth

### Monthly
- [ ] Analyze bundle size trends
- [ ] Review Core Web Vitals
- [ ] Optimize database indexes
- [ ] Clear old audit logs (retention policy)

### Quarterly
- [ ] Full performance audit
- [ ] Update dependencies
- [ ] Review and optimize RLS policies
- [ ] Load testing with production data volumes
