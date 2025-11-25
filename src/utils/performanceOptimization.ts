/**
 * Performance Optimization Utilities
 * Ensures browser storage stays under 200kb
 */

// Cache key prefix
const CACHE_PREFIX = 'm-leja-';
const MAX_CACHE_SIZE = 180 * 1024; // 180kb limit (leaving 20kb buffer)

// Clean old cache entries
export const cleanOldCache = () => {
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(CACHE_PREFIX)) {
      try {
        const item = JSON.parse(localStorage.getItem(key) || '{}');
        if (item.expiry && now > item.expiry) {
          localStorage.removeItem(key);
        }
      } catch (e) {
        localStorage.removeItem(key!);
      }
    }
  }
};

// Get current cache size
export const getCacheSize = (): number => {
  let size = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      size += (localStorage.getItem(key) || '').length;
    }
  }
  return size;
};

// Smart cache with size limits
export const setCache = (key: string, value: any, ttlMinutes: number = 60) => {
  const cacheKey = `${CACHE_PREFIX}${key}`;
  const expiry = Date.now() + (ttlMinutes * 60 * 1000);
  
  const item = JSON.stringify({
    value,
    expiry,
  });
  
  // Check if adding this would exceed limit
  if (getCacheSize() + item.length > MAX_CACHE_SIZE) {
    cleanOldCache();
    
    // If still too large, remove oldest entries
    if (getCacheSize() + item.length > MAX_CACHE_SIZE) {
      const entries: Array<{key: string, expiry: number}> = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k?.startsWith(CACHE_PREFIX)) {
          try {
            const data = JSON.parse(localStorage.getItem(k) || '{}');
            entries.push({ key: k, expiry: data.expiry || 0 });
          } catch (e) {}
        }
      }
      
      // Remove oldest first
      entries.sort((a, b) => a.expiry - b.expiry);
      for (const entry of entries) {
        localStorage.removeItem(entry.key);
        if (getCacheSize() + item.length <= MAX_CACHE_SIZE) break;
      }
    }
  }
  
  localStorage.setItem(cacheKey, item);
};

// Get cached data
export const getCache = <T>(key: string): T | null => {
  const cacheKey = `${CACHE_PREFIX}${key}`;
  const item = localStorage.getItem(cacheKey);
  
  if (!item) return null;
  
  try {
    const { value, expiry } = JSON.parse(item);
    if (Date.now() > expiry) {
      localStorage.removeItem(cacheKey);
      return null;
    }
    return value as T;
  } catch (e) {
    localStorage.removeItem(cacheKey);
    return null;
  }
};

// Clear all app cache
export const clearAppCache = () => {
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i);
    if (key?.startsWith(CACHE_PREFIX)) {
      localStorage.removeItem(key);
    }
  }
};

// Monitor cache size in development
export const monitorCacheSize = () => {
  if (process.env.NODE_ENV === 'development') {
    const size = getCacheSize();
    const sizeKb = (size / 1024).toFixed(2);
    console.log(`[Cache Monitor] Current size: ${sizeKb} KB / ${(MAX_CACHE_SIZE / 1024).toFixed(0)} KB`);
    
    if (size > MAX_CACHE_SIZE * 0.8) {
      console.warn('[Cache Monitor] Cache size approaching limit. Consider cleanup.');
    }
  }
};

// Initialize - run on app start
export const initPerformanceOptimization = () => {
  cleanOldCache();
  monitorCacheSize();
  
  // Clean cache every 30 minutes
  setInterval(() => {
    cleanOldCache();
    monitorCacheSize();
  }, 30 * 60 * 1000);
};
