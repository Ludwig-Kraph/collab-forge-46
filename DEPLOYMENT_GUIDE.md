# M-Leja Production Deployment Guide

## Pre-Deployment Checklist

### 1. Environment Setup
- [ ] Supabase project configured
- [ ] Production database set up
- [ ] All migrations applied successfully
- [ ] Edge functions deployed
- [ ] Secrets configured in Supabase

### 2. MPESA Configuration
- [ ] MPESA Daraja API credentials obtained (production)
- [ ] MPESA shortcode registered
- [ ] Passkey configured
- [ ] Callback URL registered with Safaricom
- [ ] Test STK push in production environment

### 3. Security Configuration
- [ ] Enable leaked password protection
- [ ] Configure RLS policies
- [ ] Set up database functions with search_path
- [ ] Review and test all access controls
- [ ] Enable SSL/TLS

### 4. Performance Optimization
- [ ] Database indexes created
- [ ] Bundle size optimized
- [ ] Images compressed
- [ ] CDN configured (if applicable)
- [ ] Caching strategies implemented

## Deployment Steps

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
