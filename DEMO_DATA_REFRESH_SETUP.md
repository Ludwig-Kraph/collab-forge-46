# Demo Data Automatic Refresh Setup

This guide explains how to set up automatic daily refresh of demo account data using Supabase Edge Functions and pg_cron.

## Overview

The system automatically:
- Runs daily at 2 AM UTC
- Deletes existing demo data (transactions, MPESA accounts)
- Recreates MPESA accounts with fresh data
- Generates 100+ realistic transactions with:
  - Peak hour patterns (morning, lunch, evening rushes)
  - Various payment types (75% received, 25% sent)
  - Realistic amounts and descriptions
  - Multiple customer behaviors
  - Recent pending transactions

## Prerequisites

- Supabase project with Edge Functions enabled
- `pg_cron` and `pg_net` extensions enabled
- Service role key configured

## Setup Instructions

### Step 1: Enable Required Extensions

Run this SQL in your Supabase SQL Editor:

```sql
-- Enable pg_cron for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;
```

### Step 2: Deploy the Edge Function

The `refresh-demo-data` edge function is already created in `supabase/functions/refresh-demo-data/index.ts`. It will be automatically deployed when you push changes.

### Step 3: Schedule the Daily Refresh

Run this SQL to schedule the refresh at 2 AM UTC daily:

```sql
-- Schedule demo data refresh daily at 2 AM UTC
SELECT cron.schedule(
  'refresh-demo-data-daily',
  '0 2 * * *', -- 2 AM UTC every day
  $$
  SELECT
    net.http_post(
        url:='https://cfuolhkzxsxfovalswhp.supabase.co/functions/v1/refresh-demo-data',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmdW9saGt6eHN4Zm92YWxzd2hwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyMzQ5MDUsImV4cCI6MjA3NzgxMDkwNX0.d8LjLPuVyHW8JkvQX17zcpQDQ0VhpbHXXExGI3jGmMo"}'::jsonb,
        body:='{}'::jsonb
    ) as request_id;
  $$
);
```

### Step 4: Verify the Schedule

Check that the cron job was created:

```sql
SELECT * FROM cron.job WHERE jobname = 'refresh-demo-data-daily';
```

## Manual Testing

You can manually trigger the demo data refresh:

```bash
curl -X POST https://cfuolhkzxsxfovalswhp.supabase.co/functions/v1/refresh-demo-data \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmdW9saGt6eHN4Zm92YWxzd2hwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyMzQ5MDUsImV4cCI6MjA3NzgxMDkwNX0.d8LjLPuVyHW8JkvQX17zcpQDQ0VhpbHXXExGI3jGmMo" \
  -H "Content-Type: application/json"
```

## Transaction Pattern Details

### Peak Hours Distribution

- **Morning (8-10 AM)**: 5-8 transactions
  - Breakfast purchases, morning services
  - Medium to high amounts

- **Midday (11-2 PM)**: 3-6 transactions
  - Lunch orders, regular services
  - Varied amounts

- **Afternoon (3-5 PM)**: 2-5 transactions
  - Lower activity period
  - Smaller amounts

- **Evening (6-9 PM)**: 6-10 transactions
  - Peak shopping hours
  - Highest activity period

### Transaction Types

- **75% Received Payments**
  - Amounts: KES 200 - 8,000
  - Descriptions: Product purchase, Service payment, Invoice payment, etc.
  
- **25% Sent Payments**
  - Amounts: KES 500 - 5,000
  - Descriptions: Supplier payment, Utility payment, Stock purchase, etc.

### Account Distribution

Transactions are randomly distributed across:
- Pochi la Biashara account
- Till account
- Paybill account

### Pending Transactions

- 1-3 recent pending transactions are added
- Created within the last 30 minutes
- No MPESA receipt or balance_after values

## Monitoring

### Check Last Run

```sql
SELECT * FROM cron.job_run_details 
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'refresh-demo-data-daily')
ORDER BY start_time DESC 
LIMIT 5;
```

### View Edge Function Logs

Go to: [Edge Function Logs](https://supabase.com/dashboard/project/cfuolhkzxsxfovalswhp/functions/refresh-demo-data/logs)

## Modifying the Schedule

To change the refresh time:

```sql
-- Unschedule the old job
SELECT cron.unschedule('refresh-demo-data-daily');

-- Create new schedule (example: 4 AM UTC)
SELECT cron.schedule(
  'refresh-demo-data-daily',
  '0 4 * * *', -- 4 AM UTC
  $$
  SELECT
    net.http_post(
        url:='https://cfuolhkzxsxfovalswhp.supabase.co/functions/v1/refresh-demo-data',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmdW9saGt6eHN4Zm92YWxzd2hwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyMzQ5MDUsImV4cCI6MjA3NzgxMDkwNX0.d8LjLPuVyHW8JkvQX17zcpQDQ0VhpbHXXExGI3jGmMo"}'::jsonb,
        body:='{}'::jsonb
    ) as request_id;
  $$
);
```

## Troubleshooting

### Demo account not found
- Ensure the demo account (+254000000000) exists in the profiles table
- Check that the phone number matches exactly

### Cron job not running
- Verify pg_cron extension is enabled
- Check cron.job_run_details for error messages
- Ensure service role key has proper permissions

### Edge function errors
- Check function logs in Supabase dashboard
- Verify SUPABASE_SERVICE_ROLE_KEY secret is set
- Test function manually with curl

## Data Characteristics

The generated demo data includes:
- **Time Range**: Last 7 days of transactions
- **Total Transactions**: ~100-150 transactions
- **Balance Tracking**: Running balance maintained across all transactions
- **Realistic Patterns**: Peak hours, varied amounts, diverse descriptions
- **Customer Variety**: Random phone numbers with Kenyan prefixes
- **Receipt Numbers**: Realistic MPESA-style receipt codes

## UI Indicators

When logged in as the demo account (+254000000000), users will see:
- **Banner Alert**: At the top of the dashboard explaining demo data
- **Badge**: In the header showing "Demo Account" status
- Both indicators are styled with amber colors for visibility

## Security Notes

- Demo account is restricted to 'user' role only
- Admin/Super Admin roles are automatically removed during refresh
- Demo data is completely isolated from production accounts
- Regular users cannot access or modify demo data
