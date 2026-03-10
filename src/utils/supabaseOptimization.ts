import { supabase } from "@/integrations/supabase/client";

/**
 * Supabase Performance Optimization Utilities
 * 
 * Note: Supabase Cloud automatically handles:
 * - Container scaling during peak times
 * - Connection pooling (PgBouncer)
 * - Automatic failover
 * 
 * For self-hosted: Configure Docker resources in docker-compose.yml
 */

// Connection health monitoring
export interface ConnectionHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  latency: number;
  timestamp: Date;
}

export async function checkConnectionHealth(): Promise<ConnectionHealth> {
  const startTime = performance.now();
  
  try {
    const { error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)
      .single();
    
    const latency = performance.now() - startTime;
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      return {
        status: 'unhealthy',
        latency,
        timestamp: new Date()
      };
    }
    
    return {
      status: latency < 200 ? 'healthy' : latency < 500 ? 'degraded' : 'unhealthy',
      latency,
      timestamp: new Date()
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      latency: performance.now() - startTime,
      timestamp: new Date()
    };
  }
}

// Query result cache with TTL
class QueryCache {
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();

  set(key: string, data: any, ttlSeconds: number = 60) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlSeconds * 1000
    });
  }

  get(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > cached.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  clear() {
    this.cache.clear();
  }

  clearPattern(pattern: RegExp) {
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.cache.delete(key);
      }
    }
  }
}

export const queryCache = new QueryCache();

// Optimized query builder with automatic caching
export async function optimizedQuery<T = any>(
  tableName: string,
  options: {
    select?: string;
    filters?: Record<string, any>;
    orderBy?: { column: string; ascending?: boolean };
    limit?: number;
    cache?: boolean;
    cacheTTL?: number;
  } = {}
): Promise<{ data: T[] | null; error: any }> {
  const {
    select = '*',
    filters = {},
    orderBy,
    limit,
    cache = true,
    cacheTTL = 60
  } = options;

  // Generate cache key
  const cacheKey = `${tableName}:${JSON.stringify({ select, filters, orderBy, limit })}`;

  // Check cache if enabled
  if (cache) {
    const cached = queryCache.get(cacheKey);
    if (cached) {
      return { data: cached as T[], error: null };
    }
  }

  // Build query - use type assertion for dynamic table names
  const queryBuilder = (supabase as any).from(tableName).select(select);
  let query = queryBuilder;

  // Apply filters
  Object.entries(filters).forEach(([key, value]) => {
    query = query.eq(key, value);
  });

  // Apply ordering
  if (orderBy) {
    query = query.order(orderBy.column, { ascending: orderBy.ascending ?? true });
  }

  // Apply limit
  if (limit) {
    query = query.limit(limit);
  }

  // Execute query
  const { data, error } = await query;

  // Cache result if successful and caching is enabled
  if (cache && !error && data) {
    queryCache.set(cacheKey, data, cacheTTL);
  }

  return { data: data as T[] | null, error };
}

// Batch request handler to reduce number of roundtrips
export async function batchQueries<T>(
  queries: Array<() => Promise<{ data: T | null; error: any }>>
): Promise<Array<{ data: T | null; error: any }>> {
  return Promise.all(queries.map(query => query()));
}

// Retry logic with exponential backoff
export async function retryQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: any }>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<{ data: T | null; error: any }> {
  let lastError: any;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const result = await queryFn();
      
      // If no error, return immediately
      if (!result.error) {
        return result;
      }

      lastError = result.error;

      // Don't retry on client errors (4xx)
      if (result.error.code && result.error.code.startsWith('4')) {
        return result;
      }

      // Wait before retry (exponential backoff)
      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    } catch (error) {
      lastError = error;
    }
  }

  return { data: null, error: lastError };
}

// Connection pool configuration recommendations
export const PERFORMANCE_CONFIG = {
  // For Supabase Cloud (automatically configured)
  cloud: {
    poolMode: 'transaction', // Managed by PgBouncer
    maxConnections: 'auto', // Scaled automatically
    statementTimeout: 60000, // 60 seconds
  },
  
  // For Self-Hosted Supabase (Docker Compose settings)
  selfHosted: {
    postgres: {
      // Add to postgresql.conf or docker-compose.yml environment
      max_connections: 200,
      shared_buffers: '256MB',
      effective_cache_size: '1GB',
      maintenance_work_mem: '64MB',
      checkpoint_completion_target: 0.9,
      wal_buffers: '16MB',
      default_statistics_target: 100,
      random_page_cost: 1.1,
      effective_io_concurrency: 200,
      work_mem: '4MB',
      min_wal_size: '1GB',
      max_wal_size: '4GB',
      max_worker_processes: 4,
      max_parallel_workers_per_gather: 2,
      max_parallel_workers: 4,
    },
    pgbouncer: {
      pool_mode: 'transaction',
      max_client_conn: 1000,
      default_pool_size: 25,
      reserve_pool_size: 10,
      server_lifetime: 3600,
      server_idle_timeout: 600,
    }
  }
};

// Real-time subscription optimization
export function optimizedRealtimeChannel(
  channelName: string,
  config: {
    throttleMs?: number;
    batchUpdates?: boolean;
  } = {}
) {
  const { throttleMs = 100, batchUpdates = true } = config;
  
  let throttleTimer: ReturnType<typeof setTimeout> | null = null;
  let batchedUpdates: any[] = [];

  return {
    subscribe: (callback: (payload: any) => void) => {
      const channel = supabase
        .channel(channelName)
        .on('postgres_changes', { event: '*', schema: 'public' } as any, (payload) => {
          if (batchUpdates) {
            batchedUpdates.push(payload);
            
            if (!throttleTimer) {
              throttleTimer = setTimeout(() => {
                callback(batchedUpdates);
                batchedUpdates = [];
                throttleTimer = null;
              }, throttleMs);
            }
          } else {
            callback(payload);
          }
        })
        .subscribe();

      return channel;
    }
  };
}

// Performance metrics collector
export class PerformanceMetrics {
  private metrics: Array<{
    operation: string;
    duration: number;
    timestamp: Date;
    success: boolean;
  }> = [];

  private maxMetrics = 1000;

  recordQuery(operation: string, duration: number, success: boolean) {
    this.metrics.push({
      operation,
      duration,
      timestamp: new Date(),
      success
    });

    // Keep only last N metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }
  }

  getAverageDuration(operation?: string): number {
    const filtered = operation 
      ? this.metrics.filter(m => m.operation === operation)
      : this.metrics;

    if (filtered.length === 0) return 0;

    const sum = filtered.reduce((acc, m) => acc + m.duration, 0);
    return sum / filtered.length;
  }

  getSuccessRate(operation?: string): number {
    const filtered = operation 
      ? this.metrics.filter(m => m.operation === operation)
      : this.metrics;

    if (filtered.length === 0) return 0;

    const successful = filtered.filter(m => m.success).length;
    return (successful / filtered.length) * 100;
  }

  getMetrics() {
    return {
      total: this.metrics.length,
      averageDuration: this.getAverageDuration(),
      successRate: this.getSuccessRate(),
      recentErrors: this.metrics
        .filter(m => !m.success)
        .slice(-10)
        .map(m => ({ operation: m.operation, timestamp: m.timestamp }))
    };
  }

  clear() {
    this.metrics = [];
  }
}

export const performanceMetrics = new PerformanceMetrics();

// Wrap Supabase queries with performance tracking
export async function trackedQuery<T>(
  operation: string,
  queryFn: () => Promise<{ data: T | null; error: any }>
): Promise<{ data: T | null; error: any }> {
  const startTime = performance.now();
  
  try {
    const result = await queryFn();
    const duration = performance.now() - startTime;
    
    performanceMetrics.recordQuery(operation, duration, !result.error);
    
    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    performanceMetrics.recordQuery(operation, duration, false);
    throw error;
  }
}
