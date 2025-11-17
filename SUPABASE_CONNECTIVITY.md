# M-Leja Supabase Connectivity Guide

This document provides comprehensive information about M-Leja's connection to Supabase, including configuration details, testing procedures, and troubleshooting guides.

## Overview

M-Leja uses Supabase as its backend platform for:
- **Authentication**: User login and registration
- **Database**: PostgreSQL for data persistence
- **Edge Functions**: Server-side logic for MPESA integration
- **Real-time**: Live updates for transactions and notifications
- **Row Level Security (RLS)**: Data access control

---

## Supabase Project Configuration

### Project Details

| Setting | Value |
|---------|-------|
| **Project ID** | `cfuolhkzxsxfovalswhp` |
| **Project URL** | `https://cfuolhkzxsxfovalswhp.supabase.co` |
| **Region** | Auto-selected during setup |
| **Database Host** | `db.cfuolhkzxsxfovalswhp.supabase.co` |

### API Keys

**Anonymous (Public) Key:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmdW9saGt6eHN4Zm92YWxzd2hwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyMzQ5MDUsImV4cCI6MjA3NzgxMDkwNX0.d8LjLPuVyHW8JkvQX17zcpQDQ0VhpbHXXExGI3jGmMo
```

> **Note**: The anonymous key is safe to expose in client-side code. It provides limited access controlled by Row Level Security policies.

**Service Role Key:**
- Stored securely in Supabase Edge Functions
- Used for server-side operations requiring elevated privileges
- Never exposed to client-side code

---

## Client Configuration

### Location of Configuration Files

1. **Primary Client Configuration**
   - File: `src/integrations/supabase/client.ts`
   - Hardcoded with project credentials
   - Used throughout the application

2. **Environment Variables**
   - File: `.env`
   - Backup configuration
   - Used during build process

### Client Configuration Code

**`src/integrations/supabase/client.ts`:**
```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://cfuolhkzxsxfovalswhp.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";

export const supabase = createClient<Database>(
  SUPABASE_URL, 
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);
```

---

## Testing Connectivity

### Method 1: Web-Based Connectivity Checker

Access the built-in connectivity checker:

1. Navigate to your deployed app
2. Open browser console (F12)
3. Run:
   ```javascript
   import { supabase } from './integrations/supabase/client';
   const { data, error } = await supabase.from('profiles').select('count');
   console.log(data, error);
   ```

### Method 2: Command-Line Testing

Create a test script: `scripts/test-supabase.js`

```javascript
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://cfuolhkzxsxfovalswhp.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testConnection() {
  console.log('🔍 Testing Supabase Connection...\n');
  
  // Test 1: Check if Supabase is reachable
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`);
    console.log('✅ Supabase API is reachable');
  } catch (error) {
    console.error('❌ Cannot reach Supabase API:', error.message);
    return;
  }

  // Test 2: Test authentication
  const { data: authData, error: authError } = await supabase.auth.getSession();
  if (authError) {
    console.log('⚠️  Not authenticated (this is normal for new connections)');
  } else {
    console.log('✅ Authentication working');
  }

  // Test 3: Test database read
  const { data, error } = await supabase
    .from('profiles')
    .select('count')
    .limit(1);
  
  if (error) {
    console.error('❌ Database query failed:', error.message);
  } else {
    console.log('✅ Database queries working');
  }

  // Test 4: Test Edge Functions
  const { data: fnData, error: fnError } = await supabase.functions.invoke('test-mpesa-connection');
  if (fnError) {
    console.log('⚠️  Edge Functions test:', fnError.message);
  } else {
    console.log('✅ Edge Functions working');
  }

  console.log('\n✨ Connection test complete!');
}

testConnection();
```

Run with:
```bash
node scripts/test-supabase.js
```

### Method 3: Browser DevTools

Open browser console on your deployed app:

```javascript
// Test basic connection
fetch('https://cfuolhkzxsxfovalswhp.supabase.co/rest/v1/')
  .then(response => response.json())
  .then(data => console.log('✅ Supabase connected', data))
  .catch(error => console.error('❌ Connection failed', error));
```

---

## Database Tables and Structure

### Core Tables

1. **profiles** - User profile information
2. **user_roles** - User role assignments (RBAC)
3. **subscriptions** - Subscription tier management
4. **mpesa_accounts** - Linked MPESA payment accounts
5. **transactions** - Payment transaction records
6. **payment_requests** - STK push payment requests
7. **support_tickets** - Support ticket system
8. **audit_logs** - System audit trails

### Government Tables

9. **government_entities** - Government organizations
10. **government_officials** - Government user accounts
11. **government_audit_trails** - Government-specific audits
12. **government_revenue_streams** - Revenue tracking

### Organization Tables

13. **organizations** - Multi-user organizations
14. **outlets** - Physical business locations
15. **departments** - Organizational departments
16. **invitations** - User invitation system

### Check Table Access

```sql
-- Run in Supabase SQL Editor
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

---

## Edge Functions

### Available Edge Functions

1. **mpesa-stk-push**
   - Initiates MPESA payment requests
   - Endpoint: `/functions/v1/mpesa-stk-push`

2. **mpesa-callback**
   - Handles MPESA payment confirmations
   - Endpoint: `/functions/v1/mpesa-callback`

3. **mpesa-status**
   - Checks payment status
   - Endpoint: `/functions/v1/mpesa-status`

4. **process-sms**
   - Processes MPESA SMS confirmations
   - Endpoint: `/functions/v1/process-sms`

5. **test-mpesa-connection**
   - Tests MPESA API connectivity
   - Endpoint: `/functions/v1/test-mpesa-connection`

6. **refresh-demo-data**
   - Refreshes demo account data
   - Endpoint: `/functions/v1/refresh-demo-data`

### Testing Edge Functions

```javascript
// From browser or Node.js
const { data, error } = await supabase.functions.invoke('test-mpesa-connection');
console.log(data, error);
```

---

## Row Level Security (RLS)

### Understanding RLS

All tables have Row Level Security enabled. Users can only access data they own or have permission to view.

### Example RLS Policies

**Profiles Table:**
```sql
-- Users can view their own profile
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- Super admins can view all profiles
CREATE POLICY "Super admins view all"
ON profiles FOR SELECT
USING (is_super_admin(auth.uid()));
```

**Transactions Table:**
```sql
-- Users can only see their own transactions
CREATE POLICY "Users view own transactions"
ON transactions FOR SELECT
USING (auth.uid() = user_id);
```

---

## Troubleshooting

### Connection Issues

**Symptom**: Cannot connect to Supabase

**Checks**:
1. Verify project URL is correct
2. Check API key is valid
3. Ensure network allows outbound HTTPS
4. Check browser console for CORS errors

**Solutions**:
```bash
# Test basic connectivity
curl https://cfuolhkzxsxfovalswhp.supabase.co/rest/v1/

# Expected response: 404 (but connection works)
```

### Authentication Failures

**Symptom**: Login not working

**Checks**:
1. Verify email/phone authentication is enabled in Supabase
2. Check RLS policies on profiles table
3. Verify user exists in auth.users

**Solution**:
```sql
-- Check if user exists
SELECT * FROM auth.users WHERE email = 'user@example.com';

-- Check if profile exists
SELECT * FROM profiles WHERE id = '<user-id>';
```

### Database Query Failures

**Symptom**: "permission denied" or "row level security" errors

**Checks**:
1. Verify RLS policies exist and are correct
2. Check user is authenticated
3. Verify user has correct role

**Solution**:
```sql
-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'your_table';

-- Check user role
SELECT * FROM user_roles WHERE user_id = auth.uid();
```

### Edge Function Errors

**Symptom**: Edge function returns 500 error

**Checks**:
1. View Edge Function logs in Supabase dashboard
2. Verify secrets are configured (MPESA keys)
3. Check function has correct permissions

**Access Logs**:
- Dashboard: https://supabase.com/dashboard/project/cfuolhkzxsxfovalswhp/functions/[function-name]/logs

---

## Security Best Practices

### Client-Side Security

1. **Never expose service role key**
   - Only use anonymous key in client code
   - Service role key only in Edge Functions

2. **Use RLS policies**
   - All tables must have RLS enabled
   - Test policies thoroughly

3. **Validate user input**
   - Always validate on both client and server
   - Use TypeScript types for type safety

### Edge Function Security

1. **Validate requests**
   ```typescript
   // Verify user is authenticated
   const { data: { user }, error } = await supabaseClient.auth.getUser(
     req.headers.get('Authorization')?.replace('Bearer ', '') || ''
   );
   ```

2. **Use environment variables**
   - Store API keys in Supabase secrets
   - Never hardcode credentials

3. **Rate limiting**
   - Implement rate limiting for expensive operations
   - Use Supabase built-in rate limits

---

## Monitoring and Logs

### Database Logs

Access via Supabase Dashboard:
- https://supabase.com/dashboard/project/cfuolhkzxsxfovalswhp/logs/postgres-logs

### Edge Function Logs

Access per function:
- https://supabase.com/dashboard/project/cfuolhkzxsxfovalswhp/functions/[function-name]/logs

### Real-time Monitoring

Subscribe to database changes:
```typescript
const channel = supabase
  .channel('table-changes')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'transactions' },
    (payload) => console.log('Change detected:', payload)
  )
  .subscribe();
```

---

## Performance Optimization

### Database Indexes

Ensure proper indexes exist:
```sql
-- Check existing indexes
SELECT * FROM pg_indexes WHERE tablename = 'transactions';

-- Add index if needed
CREATE INDEX idx_transactions_user_date 
ON transactions(user_id, created_at DESC);
```

### Connection Pooling

The Supabase client handles connection pooling automatically. For high-traffic applications:

1. Use connection pooling mode
2. Implement caching for frequently accessed data
3. Use Supabase's PostgREST caching

### Query Optimization

```typescript
// Bad: Select all columns
const { data } = await supabase.from('transactions').select('*');

// Good: Select only needed columns
const { data } = await supabase
  .from('transactions')
  .select('id, amount, created_at, status');
```

---

## Backup and Recovery

### Automated Backups

Supabase automatically backs up your database:
- Daily backups retained for 7 days (Free tier)
- Point-in-time recovery available (Pro tier)

### Manual Backup

Download database backup:
```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Pull database schema
supabase db pull
```

### Restore from Backup

Via Supabase Dashboard:
1. Go to Database > Backups
2. Select backup to restore
3. Click "Restore"

---

## Additional Resources

### Documentation Links

- [Supabase Dashboard](https://supabase.com/dashboard/project/cfuolhkzxsxfovalswhp)
- [Supabase Docs](https://supabase.com/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [PostgREST API Docs](https://postgrest.org/)

### Support

- Supabase Discord: https://discord.supabase.com
- GitHub Issues: https://github.com/supabase/supabase/issues
- Stack Overflow: Tag with `supabase`

---

**Last Updated**: November 2024
**Supabase Version**: Latest
**Database Version**: PostgreSQL 15
