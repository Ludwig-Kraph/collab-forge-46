# M-Leja Caching Strategy
## Multi-Layer Caching for 120M Daily Users

---

## Caching Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│ Layer 1: Browser/Client Cache (React Query)                │
│ - Duration: 30s-5min                                         │
│ - Storage: RAM                                               │
│ - Size: 10-50MB per user                                     │
└─────────────────────────────────────────────────────────────┘
                           ↓ Cache Miss
┌─────────────────────────────────────────────────────────────┐
│ Layer 2: CDN Edge Cache (Cloudflare)                       │
│ - Duration: 5min-1hr                                         │
│ - Storage: Global edge nodes                                 │
│ - Size: Unlimited                                            │
└─────────────────────────────────────────────────────────────┘
                           ↓ Cache Miss
┌─────────────────────────────────────────────────────────────┐
│ Layer 3: Application Cache (Redis)                         │
│ - Duration: 5min-24hr                                        │
│ - Storage: In-memory cluster                                │
│ - Size: 100GB-1TB                                            │
└─────────────────────────────────────────────────────────────┘
                           ↓ Cache Miss
┌─────────────────────────────────────────────────────────────┐
│ Layer 4: Database Cache (Materialized Views)               │
│ - Duration: 5min-24hr                                        │
│ - Storage: PostgreSQL                                        │
│ - Size: 10-100GB                                             │
└─────────────────────────────────────────────────────────────┘
                           ↓ Cache Miss
┌─────────────────────────────────────────────────────────────┐
│ Layer 5: Database (Source of Truth)                        │
│ - Duration: Permanent                                        │
│ - Storage: PostgreSQL + Replicas                            │
│ - Size: 1-10TB                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Layer 1: React Query (Client-Side Caching)

### Current Implementation (Already Optimized)

```typescript
// src/hooks/useOptimizedQuery.ts
export function useOptimizedQuery<T>(
  queryKey: string[],
  queryFn: () => Promise<T>,
  options?: Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey,
    queryFn,
    staleTime: 30000, // 30 seconds - data is fresh
    gcTime: 5 * 60 * 1000, // 5 minutes - cached data lifetime
    refetchOnWindowFocus: false,
    retry: 2,
    ...options,
  });
}
```

### Cache Configuration by Data Type

```typescript
// src/lib/cacheConfig.ts
export const CACHE_DURATIONS = {
  // User & Auth (rarely changes)
  userProfile: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  },
  
  userRole: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  },
  
  // Subscription (changes occasionally)
  subscription: {
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  },
  
  // Dashboard (updated frequently)
  dashboardStats: {
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  },
  
  // Transactions (frequently changing)
  recentTransactions: {
    staleTime: 15 * 1000, // 15 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
  },
  
  // MPESA Accounts (rarely changes)
  mpesaAccounts: {
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  },
  
  // Static data (almost never changes)
  subscriptionTiers: {
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
  },
};
```

### Cache Invalidation Strategy

```typescript
// src/lib/cacheInvalidation.ts
import { useQueryClient } from '@tanstack/react-query';

export const useCacheInvalidation = () => {
  const queryClient = useQueryClient();
  
  // Invalidate after payment success
  const invalidateAfterPayment = () => {
    queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    queryClient.invalidateQueries({ queryKey: ['recentTransactions'] });
    queryClient.invalidateQueries({ queryKey: ['subscription'] });
  };
  
  // Invalidate after profile update
  const invalidateProfile = () => {
    queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    queryClient.invalidateQueries({ queryKey: ['userRole'] });
  };
  
  // Invalidate after MPESA account change
  const invalidateMpesaAccounts = () => {
    queryClient.invalidateQueries({ queryKey: ['mpesaAccounts'] });
  };
  
  return {
    invalidateAfterPayment,
    invalidateProfile,
    invalidateMpesaAccounts,
  };
};
```

---

## Layer 2: CDN Edge Caching (Cloudflare)

### Configuration

```typescript
// cloudflare-workers/cache-config.js
const CACHE_CONFIG = {
  // Static assets
  images: {
    cacheTTL: 7 * 24 * 60 * 60, // 7 days
    browserTTL: 7 * 24 * 60 * 60,
    cacheEverything: true,
  },
  
  // JavaScript bundles
  scripts: {
    cacheTTL: 24 * 60 * 60, // 24 hours
    browserTTL: 24 * 60 * 60,
    cacheEverything: true,
  },
  
  // API responses (GET only)
  api: {
    cacheTTL: 60, // 1 minute
    browserTTL: 0, // Don't cache in browser
    cacheEverything: false,
  },
};

// Cloudflare Worker for intelligent caching
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  
  // Cache static assets aggressively
  if (url.pathname.match(/\.(jpg|jpeg|png|gif|webp|ico|svg)$/)) {
    return cacheAsset(request, CACHE_CONFIG.images);
  }
  
  if (url.pathname.match(/\.(js|css|woff|woff2)$/)) {
    return cacheAsset(request, CACHE_CONFIG.scripts);
  }
  
  // Cache API GET requests with short TTL
  if (request.method === 'GET' && url.pathname.startsWith('/api/')) {
    return cacheAPI(request, CACHE_CONFIG.api);
  }
  
  // Pass through everything else
  return fetch(request);
}

async function cacheAsset(request, config) {
  const cache = caches.default;
  let response = await cache.match(request);
  
  if (!response) {
    response = await fetch(request);
    
    if (response.ok) {
      const newResponse = new Response(response.body, response);
      newResponse.headers.set('Cache-Control', `public, max-age=${config.cacheTTL}`);
      
      event.waitUntil(cache.put(request, newResponse.clone()));
    }
  }
  
  return response;
}
```

### Cache Headers Strategy

```typescript
// Edge function cache headers
const getCacheHeaders = (contentType: string): Record<string, string> => {
  // Static assets - cache forever with version hash
  if (contentType.includes('image') || contentType.includes('font')) {
    return {
      'Cache-Control': 'public, max-age=31536000, immutable',
      'CDN-Cache-Control': 'public, max-age=31536000',
    };
  }
  
  // JavaScript/CSS - cache with revalidation
  if (contentType.includes('javascript') || contentType.includes('css')) {
    return {
      'Cache-Control': 'public, max-age=86400, must-revalidate',
      'CDN-Cache-Control': 'public, max-age=86400',
    };
  }
  
  // API responses - short cache
  if (contentType.includes('json')) {
    return {
      'Cache-Control': 'private, max-age=60',
      'CDN-Cache-Control': 'public, max-age=60',
    };
  }
  
  // Default - no cache
  return {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
  };
};
```

---

## Layer 3: Redis Application Cache

### Redis Cluster Setup

```typescript
// supabase/functions/_shared/redis.ts
import { Redis } from 'ioredis';

const REDIS_CONFIG = {
  // Production cluster
  production: {
    nodes: [
      { host: process.env.REDIS_NODE_1, port: 6379 },
      { host: process.env.REDIS_NODE_2, port: 6379 },
      { host: process.env.REDIS_NODE_3, port: 6379 },
    ],
    options: {
      enableReadyCheck: true,
      maxRetriesPerRequest: 3,
      retryStrategy(times: number) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    },
  },
};

export const redis = new Redis.Cluster(
  REDIS_CONFIG.production.nodes,
  REDIS_CONFIG.production.options
);

// Cache helper functions
export const cache = {
  // Get with automatic JSON parsing
  async get<T>(key: string): Promise<T | null> {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  },
  
  // Set with automatic JSON stringifying
  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    const data = JSON.stringify(value);
    if (ttlSeconds) {
      await redis.setex(key, ttlSeconds, data);
    } else {
      await redis.set(key, data);
    }
  },
  
  // Delete
  async delete(key: string): Promise<void> {
    await redis.del(key);
  },
  
  // Batch operations
  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    const values = await redis.mget(...keys);
    return values.map(v => v ? JSON.parse(v) : null);
  },
  
  // Cache with fallback
  async getOrFetch<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttlSeconds: number
  ): Promise<T> {
    let data = await this.get<T>(key);
    
    if (!data) {
      data = await fetchFn();
      await this.set(key, data, ttlSeconds);
    }
    
    return data;
  },
};
```

### Cache Key Strategy

```typescript
// supabase/functions/_shared/cacheKeys.ts
export const CacheKeys = {
  // User data
  userProfile: (userId: string) => `user:profile:${userId}`,
  userRole: (userId: string) => `user:role:${userId}`,
  userSubscription: (userId: string) => `user:subscription:${userId}`,
  
  // Dashboard data
  dashboardStats: (userId: string) => `dashboard:stats:${userId}`,
  recentTransactions: (userId: string, limit: number) => 
    `transactions:recent:${userId}:${limit}`,
  
  // MPESA data
  mpesaAccounts: (userId: string) => `mpesa:accounts:${userId}`,
  mpesaBalance: (accountId: string) => `mpesa:balance:${accountId}`,
  
  // Aggregations
  dailyRevenue: (userId: string, date: string) => 
    `revenue:daily:${userId}:${date}`,
  monthlyStats: (userId: string, month: string) => 
    `stats:monthly:${userId}:${month}`,
  
  // System-wide
  activeTiers: () => 'tiers:active',
  systemSettings: () => 'system:settings',
};
```

### Edge Function with Caching

```typescript
// supabase/functions/get-dashboard-stats/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from '@supabase/supabase-js';
import { cache, CacheKeys } from '../_shared/redis.ts';

serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    
    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    const { data: { user } } = await supabase.auth.getUser(
      authHeader?.replace('Bearer ', '')
    );
    
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
      });
    }
    
    // Try to get from cache first
    const cacheKey = CacheKeys.dashboardStats(user.id);
    const cachedData = await cache.get(cacheKey);
    
    if (cachedData) {
      return new Response(JSON.stringify(cachedData), {
        headers: {
          'Content-Type': 'application/json',
          'X-Cache-Status': 'HIT',
        },
      });
    }
    
    // Cache miss - fetch from database
    const [subscription, transactions, revenue] = await Promise.all([
      supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single(),
      supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('transactions')
        .select('amount, transaction_type')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .gte('created_at', new Date(new Date().setDate(1)).toISOString()),
    ]);
    
    const stats = {
      subscription: subscription.data,
      recentTransactions: transactions.data,
      monthlyRevenue: revenue.data
        ?.filter(t => t.transaction_type === 'received')
        .reduce((sum, t) => sum + Number(t.amount), 0) || 0,
    };
    
    // Cache for 30 seconds
    await cache.set(cacheKey, stats, 30);
    
    return new Response(JSON.stringify(stats), {
      headers: {
        'Content-Type': 'application/json',
        'X-Cache-Status': 'MISS',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
});
```

---

## Cache Invalidation Strategy

### Event-Based Invalidation

```typescript
// Invalidate cache on data changes
const invalidateUserCache = async (userId: string) => {
  await Promise.all([
    cache.delete(CacheKeys.userProfile(userId)),
    cache.delete(CacheKeys.dashboardStats(userId)),
    cache.delete(CacheKeys.recentTransactions(userId, 5)),
  ]);
};

// After transaction completed
await invalidateUserCache(userId);

// After subscription update
await cache.delete(CacheKeys.userSubscription(userId));
```

### Time-Based Expiration

```typescript
const CACHE_TTL = {
  userProfile: 300, // 5 minutes
  dashboardStats: 30, // 30 seconds
  transactions: 15, // 15 seconds
  mpesaAccounts: 600, // 10 minutes
  tiers: 3600, // 1 hour
};
```

---

## Monitoring & Metrics

```typescript
// Track cache performance
const cacheMetrics = {
  hits: 0,
  misses: 0,
  errors: 0,
  
  recordHit() {
    this.hits++;
  },
  
  recordMiss() {
    this.misses++;
  },
  
  getHitRate() {
    const total = this.hits + this.misses;
    return total > 0 ? (this.hits / total) * 100 : 0;
  },
};

// Target: >90% cache hit rate
```

---

## Implementation Checklist

### Phase 1: Immediate (This Week)
- [x] React Query optimization (already done)
- [ ] Set up Cloudflare CDN
- [ ] Configure cache headers
- [ ] Implement service worker

### Phase 2: Short-term (Next 30 Days)
- [ ] Set up Redis cluster
- [ ] Implement cache helper functions
- [ ] Add caching to edge functions
- [ ] Create cache invalidation system

### Phase 3: Ongoing
- [ ] Monitor cache hit rates
- [ ] Tune TTL values based on usage
- [ ] Optimize cache key structure
- [ ] Implement cache warming strategies
