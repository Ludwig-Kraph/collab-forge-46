# M-Leja Performance Metrics

## Browser Storage Optimization

### Target: < 200KB Total Storage
- **Current Implementation**: Smart caching system with automatic cleanup
- **Cache Prefix**: `m-leja-` for easy identification
- **Maximum Cache Size**: 180KB (with 20KB safety buffer)
- **TTL Strategy**: Default 60 minutes, configurable per cache entry

### Storage Breakdown
```
Category               | Size Target | Implementation
-----------------------|-------------|----------------
User Session          | < 20KB      | Auth tokens only
Cached Analytics      | < 50KB      | Time-limited queries
UI State             | < 10KB      | Collapsed states
Prefetched Data      | < 60KB      | Next pages
Misc                 | < 40KB      | Settings, preferences
-----------------------|-------------|----------------
TOTAL                | < 180KB     | Auto-cleanup system
```

### Automatic Optimization Features

1. **Time-Based Expiry**: All cached items expire automatically
2. **Size Monitoring**: Continuous monitoring prevents overflow
3. **Smart Cleanup**: Removes oldest entries when approaching limit
4. **Conditional Caching**: Only caches when safe to do so

### Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| Initial Load | < 1.5s | ✅ Optimized |
| Page Transitions | < 100ms | ✅ Lazy loading |
| API Response | < 300ms | ✅ Cached |
| Cache Size | < 180KB | ✅ Monitored |
| Memory Usage | < 100MB | ✅ Efficient |

## Lazy Loading Strategy

### Code Splitting
All major routes and heavy components are lazy-loaded:
- Analytics pages (separate bundle)
- Control Panel pages (admin-only)
- Government Portal (specialized)
- Chart libraries (on-demand)

### Bundle Sizes (Gzipped)
```
vendor-react.js      ~45KB  (React, Router)
vendor-ui.js         ~35KB  (Radix components)
vendor-charts.js     ~25KB  (Recharts - lazy)
vendor-supabase.js   ~30KB  (Database client)
app-core.js          ~60KB  (Main app logic)
```

## CMS Architecture

### Separate CMS Systems
1. **Subscription CMS** (`/cms`)
   - For regular subscription account admins
   - Tier-based feature access
   - Team management, outlets, departments
   - Analytics and reporting

2. **Super Admin CMS** (`/control-panel`)
   - Platform-wide management
   - User registration approval
   - Support ticket system
   - System settings

### Benefits
- Reduced code in each bundle
- Better security isolation
- Improved performance
- Clear separation of concerns

## Tier-Based Access Control

### Feature Matrix
```typescript
Feature               | Trial | Basic | Standard | Pro | Enterprise
---------------------|-------|-------|----------|-----|------------
Max Users            | 1     | 3     | 10       | 25  | Unlimited
Max STK Pushes       | 3     | 100   | 500      | 2K  | Unlimited
Multi-Outlet         | ❌    | ❌    | ✅       | ✅  | ✅
Advanced Analytics   | ❌    | ❌    | ✅       | ✅  | ✅
RBAC Management      | ❌    | ✅    | ✅       | ✅  | ✅
API Access           | ❌    | ❌    | ❌       | ✅  | ✅
Priority Support     | ❌    | ❌    | ❌       | ✅  | ✅
```

### Implementation
- Hook-based access control (`useTierAccess`)
- Real-time subscription updates
- Feature gates in UI components
- Upgrade prompts for locked features

## Analytics Enhancement

### New Visualizations
1. **Area Charts**: Revenue trends with gradients
2. **Pie Charts**: Payment methods and customer segments
3. **Bar Charts**: Hourly distribution
4. **Progress Bars**: Success rates and KPIs
5. **Infographics**: Business insights and recommendations

### Data Processing
- Client-side aggregation for performance
- Smart caching of calculated metrics
- Efficient data structures
- Optimized re-renders

## Monitoring & Maintenance

### Automatic Systems
- Cache size monitoring (console logs in dev)
- Cleanup runs every 30 minutes
- Warning at 80% capacity
- Auto-removal of expired entries

### Development Tools
```javascript
// Check current cache size
import { getCacheSize, monitorCacheSize } from '@/utils/performanceOptimization';

console.log('Cache size:', getCacheSize() / 1024, 'KB');
monitorCacheSize(); // Logs status
```

## Best Practices

1. **Always use `setCache` for storing data**
   - Automatic expiry management
   - Size checking
   - Cleanup on overflow

2. **Set appropriate TTL**
   - Static data: 60 minutes
   - Dynamic data: 5-10 minutes
   - User-specific: 30 minutes

3. **Use lazy loading for heavy components**
   - Charts and visualizations
   - Admin panels
   - Large lists

4. **Implement pagination**
   - Virtual scrolling for transactions
   - Load-on-demand for analytics
   - Batch processing for exports

## Production Deployment

### Pre-Launch Checklist
- ✅ Browser storage < 200KB
- ✅ Lazy loading configured
- ✅ Service worker optimized
- ✅ Cache cleanup automated
- ✅ Tier access controls tested
- ✅ CMS isolation verified
- ✅ Analytics performance validated
- ✅ Mobile responsiveness confirmed

### Launch Monitoring
Monitor these metrics post-launch:
1. Average cache size per user
2. Page load times
3. Bundle sizes
4. Memory usage
5. API response times

## Future Optimizations

### Planned Enhancements
1. IndexedDB for large datasets
2. Web Workers for heavy computations
3. Progressive image loading
4. Advanced prefetching strategies
5. HTTP/2 push for critical resources
