# Demo Account Setup Guide

## Step 1: Create the Demo Account

**Login Credentials:**
- **Phone Number:** +254000000000
- **Password:** Demo123456
- **Full Name:** M-Leja Demo

### How to Create:
1. Go to the app and click "Create Account" / "Register"
2. Enter the phone number: `+254000000000`
3. Enter full name: `M-Leja Demo`
4. Set password: `Demo123456`
5. Complete the registration flow

**Note:** This is a demo account with mock data. Super Admin and Admin accounts should remain clean without any mock/dummy data.

Since phone authentication requires SMS verification in production, you may need to either:
- Set up a test phone provider in Supabase (recommended for demo)
- Or manually verify the user in Supabase Dashboard > Authentication > Users

## Step 2: Run Demo Data SQL

After creating the account, run the SQL script below in Supabase SQL Editor to populate demo data:

```sql
-- Get the demo user's ID
DO $$
DECLARE
  demo_user_id uuid;
  pochi_account_id uuid;
  till_account_id uuid;
  paybill_account_id uuid;
BEGIN
  -- Get user ID
  SELECT id INTO demo_user_id 
  FROM profiles 
  WHERE phone_number = '+254000000000';

  IF demo_user_id IS NULL THEN
    RAISE EXCEPTION 'Demo user not found. Please create account first with phone +254000000000 and name M-Leja Demo';
  END IF;

  -- Ensure this is a regular user, not admin or super_admin
  -- Delete any existing admin/super_admin roles for this user
  DELETE FROM user_roles WHERE user_id = demo_user_id AND role IN ('admin', 'super_admin');
  
  -- Ensure user has a regular user role
  INSERT INTO user_roles (user_id, role)
  VALUES (demo_user_id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Insert MPESA Accounts
  -- 1. Pochi la Biashara (same as phone number)
  INSERT INTO mpesa_accounts (user_id, account_type, account_number, account_name, is_active)
  VALUES (demo_user_id, 'pochi', '+254712345678', 'Demo Pochi Account', true)
  RETURNING id INTO pochi_account_id;

  -- 2. Till Number
  INSERT INTO mpesa_accounts (user_id, account_type, account_number, account_name, is_active)
  VALUES (demo_user_id, 'till', '123456', 'Demo Till Account', true)
  RETURNING id INTO till_account_id;

  -- 3. Paybill Number
  INSERT INTO mpesa_accounts (user_id, account_type, account_number, account_name, is_active)
  VALUES (demo_user_id, 'paybill', '1234', 'Demo Paybill Account', true)
  RETURNING id INTO paybill_account_id;

  -- Insert Mock Transactions (Recent Activity)
  -- Transaction 1: Received payment to Pochi
  INSERT INTO transactions (
    user_id, mpesa_account_id, transaction_id, transaction_type, 
    phone_number, amount, status, description, 
    mpesa_receipt_number, balance_after, transaction_date
  ) VALUES (
    demo_user_id, pochi_account_id, 'TXN001', 'received',
    '+254722334455', 2500.00, 'completed', 'Payment for services',
    'RBK1A2B3C4', 15750.00, NOW() - INTERVAL '2 hours'
  );

  -- Transaction 2: Received payment to Till
  INSERT INTO transactions (
    user_id, mpesa_account_id, transaction_id, transaction_type,
    phone_number, amount, status, description,
    mpesa_receipt_number, balance_after, transaction_date
  ) VALUES (
    demo_user_id, till_account_id, 'TXN002', 'received',
    '+254733445566', 5000.00, 'completed', 'Product purchase',
    'RBK2B3C4D5', 20750.00, NOW() - INTERVAL '1 hour'
  );

  -- Transaction 3: Sent payment
  INSERT INTO transactions (
    user_id, mpesa_account_id, transaction_id, transaction_type,
    phone_number, amount, status, description,
    mpesa_receipt_number, balance_after, transaction_date
  ) VALUES (
    demo_user_id, pochi_account_id, 'TXN003', 'sent',
    '+254744556677', 1500.00, 'completed', 'Supplier payment',
    'RBK3C4D5E6', 19250.00, NOW() - INTERVAL '30 minutes'
  );

  -- Transaction 4: Received payment to Paybill
  INSERT INTO transactions (
    user_id, mpesa_account_id, transaction_id, transaction_type,
    phone_number, amount, status, description,
    mpesa_receipt_number, balance_after, transaction_date
  ) VALUES (
    demo_user_id, paybill_account_id, 'TXN004', 'received',
    '+254755667788', 3200.00, 'completed', 'Invoice payment',
    'RBK4D5E6F7', 22450.00, NOW() - INTERVAL '15 minutes'
  );

  -- Transaction 5: Received payment to Till
  INSERT INTO transactions (
    user_id, mpesa_account_id, transaction_id, transaction_type,
    phone_number, amount, status, description,
    mpesa_receipt_number, balance_after, transaction_date
  ) VALUES (
    demo_user_id, till_account_id, 'TXN005', 'received',
    '+254766778899', 1800.00, 'completed', 'Service payment',
    'RBK5E6F7G8', 24250.00, NOW() - INTERVAL '5 minutes'
  );

  -- Transaction 6: Recent pending transaction
  INSERT INTO transactions (
    user_id, mpesa_account_id, transaction_id, transaction_type,
    phone_number, amount, status, description,
    balance_after, transaction_date
  ) VALUES (
    demo_user_id, pochi_account_id, 'TXN006', 'received',
    '+254777889900', 950.00, 'pending', 'Payment processing',
    NULL, NOW() - INTERVAL '1 minute'
  );

  -- Add some older transactions for history
  INSERT INTO transactions (
    user_id, mpesa_account_id, transaction_id, transaction_type,
    phone_number, amount, status, description,
    mpesa_receipt_number, balance_after, transaction_date
  ) VALUES 
  (demo_user_id, till_account_id, 'TXN007', 'received', '+254711222333', 4500.00, 'completed', 'Monthly subscription', 'RBK6F7G8H9', 13250.00, NOW() - INTERVAL '2 days'),
  (demo_user_id, pochi_account_id, 'TXN008', 'sent', '+254722333444', 2200.00, 'completed', 'Utility payment', 'RBK7G8H9I0', 11050.00, NOW() - INTERVAL '3 days'),
  (demo_user_id, paybill_account_id, 'TXN009', 'received', '+254733444555', 6800.00, 'completed', 'Bulk payment', 'RBK8H9I0J1', 17850.00, NOW() - INTERVAL '4 days'),
  (demo_user_id, till_account_id, 'TXN010', 'received', '+254744555666', 3300.00, 'completed', 'Product sale', 'RBK9I0J1K2', 21150.00, NOW() - INTERVAL '5 days');

  RAISE NOTICE 'Demo data created successfully for user %', demo_user_id;
  RAISE NOTICE 'Pochi Account ID: %', pochi_account_id;
  RAISE NOTICE 'Till Account ID: %', till_account_id;
  RAISE NOTICE 'Paybill Account ID: %', paybill_account_id;
END $$;
```

## Step 3: Clean Up Admin/Super Admin Mock Data (Optional)

If there's any mock data in admin or super admin accounts, run this cleanup:

```sql
-- Remove any demo transactions from admin/super admin accounts
DELETE FROM transactions 
WHERE user_id IN (
  SELECT user_id FROM user_roles 
  WHERE role IN ('admin', 'super_admin')
) AND description LIKE '%demo%' OR description LIKE '%test%' OR description LIKE '%mock%';

-- Remove any demo MPESA accounts from admin/super admin accounts
DELETE FROM mpesa_accounts 
WHERE user_id IN (
  SELECT user_id FROM user_roles 
  WHERE role IN ('admin', 'super_admin')
) AND account_name LIKE '%demo%' OR account_name LIKE '%test%';
```

## Step 4: Login with Demo Account

Use these credentials to login:
- **Phone:** +254000000000
- **Password:** Demo123456
- **Name:** M-Leja Demo

## Demo Account Features

**Important:** This account contains all mock/dummy data for demonstration purposes. Super Admin and Admin accounts should remain clean.

### MPESA Accounts
1. **Pochi la Biashara:** +254000000000
2. **Till Number:** 123456
3. **Paybill Number:** 1234

### Demo Transactions
- **Total Balance:** KES 24,250.00
- **Recent Transactions:** 10 transactions showing various activities
- **Transaction Types:** Both received and sent payments
- **Status Types:** Completed and pending transactions
- **Realistic Timestamps:** From 5 days ago to 1 minute ago

### What You'll See
- Dashboard with balance overview and recent transactions
- Transaction history with filtering and search
- Digital ledger with income/expense tracking
- Analytics and reporting features
- Free trial status (3 STK pushes remaining)

## Troubleshooting

If you encounter issues:

1. **User not created:** Verify the account was created in Supabase Dashboard > Authentication > Users
2. **SQL errors:** Make sure the user exists before running the demo data SQL
3. **Login issues:** Check that phone authentication is enabled in Supabase settings
4. **No data showing:** Verify RLS policies are correctly configured and user is authenticated

## Quick Reset

To reset the demo account, delete all data and recreate:

```sql
-- Delete demo user's data (but not the user itself)
DELETE FROM transactions WHERE user_id IN (SELECT id FROM profiles WHERE phone_number = '+254000000000');
DELETE FROM mpesa_accounts WHERE user_id IN (SELECT id FROM profiles WHERE phone_number = '+254000000000');
DELETE FROM user_roles WHERE user_id IN (SELECT id FROM profiles WHERE phone_number = '+254000000000') AND role != 'user';
-- Then re-run the demo data SQL
```

## Important Notes

- **Demo Account Purpose:** This account (+254000000000) contains all mock/dummy data for testing and demonstration
- **Admin Accounts:** Super Admin and Admin accounts should be kept clean without any mock/dummy data
- **Role Assignment:** Demo account is assigned 'user' role only, never 'admin' or 'super_admin'
- **Data Separation:** Always ensure demo data is only associated with the demo account
