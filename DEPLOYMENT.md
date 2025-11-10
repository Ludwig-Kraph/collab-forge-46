# M-Leja Deployment Guide

## Pre-Deployment Checklist

### 1. Environment Configuration
- [ ] Supabase project is configured and running
- [ ] Phone authentication is enabled in Supabase
- [ ] SMS provider is configured for OTP
- [ ] MPESA API credentials are added to Supabase secrets
- [ ] Database migrations are applied
- [ ] RLS policies are tested and verified

### 2. Security Review
- [ ] All security scan issues resolved
- [ ] RLS policies prevent data leaks
- [ ] Financial records are immutable (no UPDATE/DELETE)
- [ ] Input validation is in place for all forms
- [ ] Authentication flows are secure
- [ ] API keys are stored in Supabase secrets, not in code

### 3. Performance Optimization
- [ ] Code splitting and lazy loading implemented
- [ ] Service worker registered for offline support
- [ ] Images are optimized
- [ ] Bundle size is acceptable (<1MB initial load)
- [ ] Page load time is under 3 seconds

### 4. Accessibility
- [ ] All interactive elements are keyboard accessible
- [ ] ARIA labels are properly set
- [ ] Color contrast meets WCAG 2.1 AA standards
- [ ] Screen reader announcements work correctly
- [ ] Focus management in modals

### 5. PWA Requirements
- [ ] manifest.json is configured
- [ ] Service worker is registered
- [ ] App is installable on mobile devices
- [ ] Offline functionality works
- [ ] App icons are set (192x192, 512x512)

### 6. Testing
- [ ] Authentication flow tested
- [ ] Payment triggering works
- [ ] Real-time updates function properly
- [ ] Export features work (CSV, PDF)
- [ ] Notifications display correctly
- [ ] Mobile responsiveness verified

## Deployment Steps

### Option 1: Lovable Deployment (Recommended)
1. Click the "Publish" button in top right
2. Update the production deployment
3. Monitor the deployment logs
4. Verify the deployed site works correctly

### Option 2: Self-Hosting
1. Build the application: `npm run build`
2. Deploy the `dist` folder to your hosting provider
3. Configure environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
4. Set up custom domain with SSL
5. Configure CDN for static assets

## Post-Deployment

### 1. Supabase Configuration
1. Go to Supabase Dashboard > Authentication > URL Configuration
2. Set Site URL to your deployed URL
3. Add Redirect URLs (both preview and production)
4. Test authentication flow with real phone numbers

### 2. MPESA Integration
1. Switch from sandbox to production credentials
2. Update callback URLs in MPESA dashboard
3. Test STK push with small amounts
4. Monitor transaction logs

### 3. Monitoring
- Set up error tracking (consider Sentry)
- Monitor Supabase logs for errors
- Check Edge Function logs regularly
- Track performance metrics
- Monitor API rate limits

### 4. User Communication
- Notify beta testers of launch
- Prepare support documentation
- Set up feedback channels
- Monitor user reports

## Rollback Procedure
If issues occur post-deployment:
1. Use Lovable's History feature to restore previous version
2. Alternatively, revert the git commit and redeploy
3. Check Supabase logs for data integrity
4. Communicate with affected users

## Production Monitoring URLs
- Supabase Dashboard: https://supabase.com/dashboard/project/cfuolhkzxsxfovalswhp
- Edge Functions Logs: https://supabase.com/dashboard/project/cfuolhkzxsxfovalswhp/functions
- Database Tables: https://supabase.com/dashboard/project/cfuolhkzxsxfovalswhp/editor

## Support Contacts
- Technical Issues: [Your Email]
- MPESA Integration: Safaricom Support
- Supabase Issues: Supabase Support

## Performance Targets
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s
- Lighthouse Score: > 90
- Core Web Vitals: All green
