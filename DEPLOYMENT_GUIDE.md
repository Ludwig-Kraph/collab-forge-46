# M-Leja Multi-Platform Deployment Guide

Complete guide for deploying M-Leja to various hosting platforms and CMS systems.

## Quick Start

M-Leja is production-ready and compatible with:
- ✅ Static hosting (Vercel, Netlify, Cloudflare Pages)
- ✅ Traditional web hosting (cPanel, FTP, Apache, Nginx)
- ✅ Cloud platforms (AWS, Google Cloud, Azure)
- ✅ Container deployments (Docker, Kubernetes)

## Prerequisites

- Node.js 18+ installed
- Git repository (recommended)
- Supabase project configured
- MPESA Daraja API credentials

---

## Platform-Specific Deployment

### 1. Vercel (Recommended for Speed)

**Automatic GitHub Deployment:**
1. Connect GitHub repository to Vercel
2. Import project
3. Set environment variables:
   ```
   VITE_SUPABASE_URL=your_url
   VITE_SUPABASE_ANON_KEY=your_key
   ```
4. Deploy automatically on push

**Configuration included:** `vercel.json` (already in project)

**Manual CLI Deployment:**
```bash
npm install -g vercel
vercel --prod
```

---

### 2. Netlify

**GitHub Integration:**
1. Connect repository
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Set environment variables
5. Deploy

**Configuration included:** `netlify.toml` (already in project)

**Deploy via CLI:**
```bash
npm install -g netlify-cli
netlify deploy --prod
```

---

### 3. Cloudflare Pages

**GitHub Integration:**
1. Connect repository
2. Framework preset: None
3. Build command: `npm run build`
4. Output directory: `dist`
5. Set environment variables

**Configuration included:** `_redirects` (already in project)

---

### 4. Traditional Web Hosting (cPanel/FTP)

**Perfect for shared hosting, GoDaddy, Bluehost, Hostinger, etc.**

**Step 1: Build locally**
```bash
npm install
npm run build
```

**Step 2: Upload `dist/` contents to server**
- Via FTP: Upload all files from `dist/` to `public_html` or `www`
- Via cPanel File Manager: Upload and extract zip of `dist/`

**Step 3: Configure Apache (included)**
- `.htaccess` file is already in the project
- If not present, create one with the provided config
- Ensures SPA routing works correctly

**Step 4: Set environment variables**
Create `config.js` in `public_html`:
```javascript
window.ENV = {
  VITE_SUPABASE_URL: 'your_url',
  VITE_SUPABASE_ANON_KEY: 'your_key'
};
```

Then load before main script in `index.html`:
```html
<script src="/config.js"></script>
```

---

### 5. GitHub Pages

**Step 1: Configure**
Add to `vite.config.ts`:
```typescript
base: '/m-leja/' // Replace with your repo name
```

**Step 2: Build and deploy**
```bash
npm run build
npx gh-pages -d dist
```

**Step 3: Enable in GitHub**
Settings → Pages → Source: gh-pages branch

---

### 6. AWS S3 + CloudFront

**Step 1: Build**
```bash
npm run build
```

**Step 2: Create S3 bucket**
```bash
aws s3 mb s3://m-leja-app
aws s3 sync dist/ s3://m-leja-app
```

**Step 3: Configure CloudFront**
- Create distribution pointing to S3
- Set default root object: `index.html`
- Error page: `index.html` (for SPA routing)

---

### 7. Docker Deployment

**Dockerfile included:**
```dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Build and run:**
```bash
docker build -t m-leja .
docker run -p 80:80 m-leja
```

---

### 8. Nginx Server

**Step 1: Build and copy**
```bash
npm run build
sudo cp -r dist/* /var/www/html/m-leja/
```

**Step 2: Configure Nginx**
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/html/m-leja;
    index index.html;

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Service Worker - no cache
    location = /sw.js {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Service-Worker-Allowed "/";
    }

    # Static assets cache
    location ~* \.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

**Restart Nginx:**
```bash
sudo nginx -t
sudo systemctl restart nginx
```

---

## CMS & Platform Compatibility

### WordPress Integration
1. Upload `dist/` to `/wp-content/m-leja/`
2. Create custom page template
3. Enqueue assets in functions.php:
```php
function mleja_enqueue_scripts() {
    wp_enqueue_script('mleja', 
        get_template_directory_uri() . '/m-leja/assets/index.js', 
        [], null, true);
}
add_action('wp_enqueue_scripts', 'mleja_enqueue_scripts');
```

### Drupal Integration
1. Create custom module
2. Upload assets to `/modules/custom/mleja/`
3. Include in route controller

### Joomla Integration
1. Create custom component
2. Upload to `/components/com_mleja/`
3. Register in manifest XML

---

## Environment Variables

For client-side access, prefix with `VITE_`:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

**Important:** Never commit `.env` files. Use platform's environment variable settings.

---

## Performance Optimizations

All optimization files are included:

### Pre-configured:
- ✅ Service Worker for offline support
- ✅ Code splitting and lazy loading
- ✅ Database indexes and materialized views
- ✅ Aggressive caching strategies
- ✅ Bundle optimization (Vite)
- ✅ Virtual scrolling for large lists

### Hosting checklist:
- [ ] Enable Gzip/Brotli compression
- [ ] Configure CDN (Cloudflare, AWS CloudFront)
- [ ] Enable HTTP/2 or HTTP/3
- [ ] Set proper cache headers
- [ ] Monitor Core Web Vitals

---

## Security Configuration

### SSL/TLS
Always use HTTPS in production:
- Most platforms provide free SSL (Let's Encrypt)
- Configure redirect from HTTP to HTTPS
- Set HSTS headers

### Supabase RLS
Verify Row Level Security policies:
```sql
-- Check enabled tables
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = true;
```

### CSP Headers
Add to your server config:
```
Content-Security-Policy: default-src 'self'; 
  script-src 'self' 'unsafe-inline'; 
  style-src 'self' 'unsafe-inline';
```

---

## Post-Deployment Checklist

### Immediate Testing
- [ ] Login/signup works
- [ ] MPESA STK push functional
- [ ] Transactions recorded correctly
- [ ] Real-time updates working
- [ ] Mobile responsive
- [ ] PWA installs correctly

### Performance
- [ ] Run Lighthouse audit (aim for 90+)
- [ ] Check page load time (< 2 seconds)
- [ ] Verify service worker registration
- [ ] Test offline functionality

### Security
- [ ] HTTPS enabled
- [ ] RLS policies active
- [ ] No console errors
- [ ] Authentication working
- [ ] Rate limiting in place

---

## Troubleshooting Common Issues

### Issue: 404 on page refresh
**Cause:** SPA routing not configured
**Fix:** Ensure `.htaccess`, `_redirects`, or nginx config is in place

### Issue: Environment variables undefined
**Cause:** Missing `VITE_` prefix or not set in hosting
**Fix:** Prefix with `VITE_` and rebuild

### Issue: Service Worker not updating
**Cause:** Aggressive caching
**Fix:** Hard refresh (Ctrl+Shift+R) or clear cache

### Issue: MPESA not working
**Cause:** Secrets not configured or wrong environment
**Fix:** Verify Supabase secrets and MPESA environment setting

---

## Monitoring & Maintenance

### Uptime Monitoring
Set up with:
- UptimeRobot (free)
- Pingdom
- StatusCake

### Error Tracking
Integrate:
- Sentry
- LogRocket
- Datadog

### Performance Monitoring
Use:
- Google Analytics
- Vercel Analytics
- Cloudflare Web Analytics

---

## Support Resources

- **Documentation:** `TESTING_CHECKLIST.md`, `SECURITY_AUDIT.md`, `PERFORMANCE_OPTIMIZATION.md`
- **Supabase Docs:** https://supabase.com/docs
- **Vite Docs:** https://vitejs.dev/guide/

---

**Deployment Status:** ✅ Production Ready
**Last Updated:** 2024-11-21
**Compatible Platforms:** 15+ hosting options

### Step 1: Configure Supabase Secrets

Navigate to your Supabase project dashboard and add the following secrets:

```bash
# MPESA Daraja API Credentials
MPESA_CONSUMER_KEY=your_production_consumer_key
MPESA_CONSUMER_SECRET=your_production_consumer_secret
MPESA_PASSKEY=your_production_passkey
MPESA_SHORTCODE=your_shortcode

# Environment
MPESA_ENVIRONMENT=production
```

**How to add secrets:**
1. Go to: https://supabase.com/dashboard/project/{project_id}/settings/functions
2. Scroll to "Secrets" section
3. Add each secret with its value
4. Click "Save"

### Step 2: Update MPESA Callback URL

Register your production callback URL with Safaricom:

```
Callback URL: https://{project_ref}.supabase.co/functions/v1/mpesa-callback
```

**Registration Process:**
1. Log in to Safaricom Daraja Portal
2. Navigate to your app configuration
3. Add callback URL
4. Verify URL is reachable
5. Test with sample STK push

### Step 3: Deploy Edge Functions

Edge functions deploy automatically with your code. Verify deployment:

```bash
# Check function status
curl https://{project_ref}.supabase.co/functions/v1/health

# Test MPESA connection
curl -X POST https://{project_ref}.supabase.co/functions/v1/test-mpesa-connection \
  -H "Authorization: Bearer {anon_key}"
```

### Step 4: Configure Database

#### Apply Final Migrations
```sql
-- Set search_path for functions (fixes Warning 1)
ALTER FUNCTION public.has_role SET search_path = public;
ALTER FUNCTION public.log_audit_event SET search_path = public;
ALTER FUNCTION public.decrement_stk_pushes SET search_path = public;

-- Create necessary indexes for production
CREATE INDEX IF NOT EXISTS idx_transactions_user_date 
  ON transactions(user_id, transaction_date DESC);

CREATE INDEX IF NOT EXISTS idx_payment_requests_status 
  ON payment_requests(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_entity 
  ON audit_logs(entity_type, entity_id, created_at DESC);
```

#### Enable Password Protection
1. Go to Supabase Dashboard → Authentication → Providers
2. Enable "Leaked Password Protection"
3. Save changes

### Step 5: Create Super Admin Account

```sql
-- Create first super admin user
INSERT INTO public.profiles (id, full_name, phone_number, account_status)
VALUES (
  '{user_id_from_auth}',
  'Super Administrator',
  '254700000000',
  'active'
);

INSERT INTO public.user_roles (user_id, role)
VALUES ('{user_id_from_auth}', 'super_admin');
```

### Step 6: Build and Deploy Frontend

#### Using Lovable Deploy
1. Click "Publish" button in Lovable
2. Configure custom domain (optional)
3. Wait for deployment to complete
4. Verify deployment at provided URL

#### Manual Deployment (if needed)
```bash
# Build production bundle
npm run build

# Preview build locally
npm run preview

# Deploy to hosting service
# (Netlify, Vercel, AWS S3, etc.)
```

### Step 7: DNS Configuration

If using custom domain:

```
# Add DNS records
A Record: @ → {server_ip}
CNAME: www → {deployment_url}

# SSL Certificate
- Enable automatic SSL via hosting provider
- Or configure Let's Encrypt
```

### Step 8: Post-Deployment Verification

#### Functional Testing
```bash
# 1. Test Authentication
- Register new user
- Login with phone/PIN
- Test role-based access

# 2. Test Payment Flow
- Initiate STK push
- Complete payment on phone
- Verify transaction recorded
- Check balance update

# 3. Test Control Panel
- Access as super admin
- Test MPESA connection
- View system statistics
- Create test alert

# 4. Test Real-time Features
- Payment status updates
- Notification system
- Live transaction updates
```

#### Performance Testing
```bash
# Run Lighthouse audit
lighthouse https://your-domain.com --view

# Check Core Web Vitals
# Should see:
# - LCP < 2.5s
# - FID < 100ms
# - CLS < 0.1
```

#### Security Testing
```bash
# Verify RLS policies
# Try to access other users' data
# Should fail with authorization error

# Test authentication
# Invalid credentials should be rejected
# Rate limiting should prevent brute force
```

## Monitoring Setup

### 1. Supabase Monitoring

Enable monitoring in Supabase Dashboard:
- Database performance metrics
- Edge function logs and errors
- Authentication activity
- Real-time connection count

**Access logs:**
- Database: https://supabase.com/dashboard/project/{project_id}/logs/postgres-logs
- Edge Functions: https://supabase.com/dashboard/project/{project_id}/functions/{function_name}/logs
- Auth: https://supabase.com/dashboard/project/{project_id}/logs/auth-logs

### 2. Error Tracking

Consider integrating:
- Sentry for error tracking
- LogRocket for session replay
- Mixpanel for analytics

### 3. Uptime Monitoring

Set up with services like:
- UptimeRobot (free)
- Pingdom
- StatusCake

Monitor:
- Main application URL
- Edge function endpoints
- Database connectivity

## Backup Strategy

### Automatic Backups (Supabase)
- Daily automated backups enabled by default
- 7-day retention on free tier
- Extended retention on paid plans

### Manual Backup Procedure
```bash
# Backup database
pg_dump -h db.{project_ref}.supabase.co \
        -U postgres \
        -d postgres \
        > backup_$(date +%Y%m%d).sql

# Backup storage files (if applicable)
# Download via Supabase Dashboard → Storage
```

### Restore Procedure
```bash
# Restore from backup
psql -h db.{project_ref}.supabase.co \
     -U postgres \
     -d postgres \
     < backup_20241114.sql
```

## Rollback Plan

### If Issues Occur:

#### 1. Immediate Rollback
```bash
# Revert to previous deployment
git revert HEAD
npm run build
# Redeploy

# Or use Lovable History
# Click "View History" → Select previous version → "Restore"
```

#### 2. Database Rollback
```sql
-- Revert last migration
-- Run reverse migration SQL
-- Or restore from backup
```

#### 3. Communication
- Update status page
- Notify users via email/SMS
- Post on social media

## Production Checklist

### Before Going Live
- [ ] All tests passing
- [ ] Security audit complete
- [ ] Performance benchmarks met
- [ ] Backup system configured
- [ ] Monitoring tools set up
- [ ] Error tracking enabled
- [ ] Documentation updated
- [ ] Team trained on deployment

### Launch Day
- [ ] Deploy to production
- [ ] Verify all features working
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Test payment flow end-to-end
- [ ] Verify email/SMS notifications
- [ ] Monitor real-time features

### Post-Launch (First Week)
- [ ] Daily monitoring of errors
- [ ] User feedback collection
- [ ] Performance optimization
- [ ] Bug fixes as needed
- [ ] Documentation updates

## Maintenance Schedule

### Daily
- Monitor error logs
- Check system health
- Review failed transactions

### Weekly
- Review performance metrics
- Analyze user feedback
- Update documentation
- Security patch check

### Monthly
- Full security audit
- Performance optimization review
- Backup verification
- Dependency updates

### Quarterly
- Comprehensive system review
- Feature roadmap planning
- Infrastructure scaling assessment
- Disaster recovery drill

## Support & Troubleshooting

### Common Issues

#### Issue 1: MPESA Connection Failed
**Symptoms**: STK push not working
**Debug Steps**:
1. Check edge function logs
2. Verify credentials in Supabase secrets
3. Test connection: `/control-panel/system-settings`
4. Verify callback URL with Safaricom

**Fix**: Update credentials or contact Safaricom support

#### Issue 2: Slow Performance
**Symptoms**: Page load > 3 seconds
**Debug Steps**:
1. Run Lighthouse audit
2. Check database query times
3. Review edge function logs
4. Analyze bundle size

**Fix**: Add indexes, optimize queries, enable caching

#### Issue 3: Authentication Errors
**Symptoms**: Users can't log in
**Debug Steps**:
1. Check Supabase auth logs
2. Verify RLS policies
3. Test in incognito mode
4. Check rate limiting

**Fix**: Review auth configuration, check policies

### Getting Help

**Supabase Support**:
- Documentation: https://supabase.com/docs
- Discord: https://discord.supabase.com
- Email: support@supabase.io

**M-Leja Documentation**:
- Testing Guide: `TESTING_CHECKLIST.md`
- Security Audit: `SECURITY_AUDIT.md`
- Performance Guide: `PERFORMANCE_OPTIMIZATION.md`

## Success Metrics

### Key Performance Indicators

**Technical Metrics**:
- Uptime: > 99.9%
- Response time: < 1s
- Error rate: < 0.1%
- Payment success rate: > 95%

**Business Metrics**:
- Active users
- Transaction volume
- Revenue processed
- User satisfaction (NPS score)

## Compliance & Legal

### Required Documentation
- [ ] Terms of Service
- [ ] Privacy Policy
- [ ] Data Protection Policy
- [ ] Cookie Policy
- [ ] MPESA Payment Terms

### Regulatory Compliance
- [ ] Kenya Data Protection Act compliance
- [ ] PCI DSS compliance (if storing card data)
- [ ] AML/KYC requirements (if applicable)
- [ ] Tax compliance documentation

## Emergency Contacts

**Technical Issues**:
- System Administrator: [Contact]
- Database Admin: [Contact]
- Supabase Support: support@supabase.io

**Business Issues**:
- Project Manager: [Contact]
- Product Owner: [Contact]
- Customer Support: [Contact]

**External Services**:
- Safaricom Support: 0711123456
- Hosting Provider: [Contact]
- Domain Registrar: [Contact]

---

## Deployment Sign-off

### Pre-Production
- [ ] Development complete
- [ ] Testing complete
- [ ] Security audit passed
- [ ] Documentation complete

**Signed**: _____________ Date: _______

### Production Deployment
- [ ] Deployment successful
- [ ] All tests passed
- [ ] Monitoring active
- [ ] Team notified

**Signed**: _____________ Date: _______

### Post-Launch Review
- [ ] Week 1 review complete
- [ ] Performance acceptable
- [ ] No critical issues
- [ ] User feedback positive

**Signed**: _____________ Date: _______

---

**Last Updated**: 2024-11-14
**Version**: 1.0.0
**Next Review**: 2025-02-14
