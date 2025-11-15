import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.78.0';

const DEMO_PHONE = '+254000000000';

Deno.serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting demo data refresh...');

    // Get demo user ID
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('phone_number', DEMO_PHONE)
      .single();

    if (profileError || !profile) {
      console.error('Demo user not found:', profileError);
      return new Response(
        JSON.stringify({ error: 'Demo user not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const demoUserId = profile.id;
    console.log('Demo user ID:', demoUserId);

    // Delete existing demo data
    await supabase.from('transactions').delete().eq('user_id', demoUserId);
    await supabase.from('mpesa_accounts').delete().eq('user_id', demoUserId);
    
    // Ensure demo user has only 'user' role
    await supabase.from('user_roles').delete().eq('user_id', demoUserId).in('role', ['admin', 'super_admin']);
    await supabase.from('user_roles').upsert({ user_id: demoUserId, role: 'user' });

    console.log('Deleted existing demo data');

    // Create MPESA accounts
    const { data: pochiAccount } = await supabase
      .from('mpesa_accounts')
      .insert({
        user_id: demoUserId,
        account_type: 'pochi',
        account_number: '+254712345678',
        account_name: 'Demo Pochi Account',
        is_active: true
      })
      .select()
      .single();

    const { data: tillAccount } = await supabase
      .from('mpesa_accounts')
      .insert({
        user_id: demoUserId,
        account_type: 'till',
        account_number: '123456',
        account_name: 'Demo Till Account',
        is_active: true
      })
      .select()
      .single();

    const { data: paybillAccount } = await supabase
      .from('mpesa_accounts')
      .insert({
        user_id: demoUserId,
        account_type: 'paybill',
        account_number: '1234',
        account_name: 'Demo Paybill Account',
        is_active: true
      })
      .select()
      .single();

    console.log('Created MPESA accounts');

    // Generate realistic transaction patterns
    const transactions = generateRealisticTransactions(
      demoUserId,
      pochiAccount!.id,
      tillAccount!.id,
      paybillAccount!.id
    );

    // Insert transactions in batches
    const { error: txError } = await supabase
      .from('transactions')
      .insert(transactions);

    if (txError) {
      console.error('Error inserting transactions:', txError);
      throw txError;
    }

    console.log(`Created ${transactions.length} transactions`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Demo data refreshed successfully',
        transactions: transactions.length
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error refreshing demo data:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

function generateRealisticTransactions(
  userId: string,
  pochiId: string,
  tillId: string,
  paybillId: string
) {
  const transactions = [];
  const now = new Date();
  let runningBalance = 10000; // Starting balance

  // Generate transactions for the last 7 days
  for (let day = 7; day >= 0; day--) {
    const date = new Date(now);
    date.setDate(date.getDate() - day);

    // Morning peak (8-10 AM): 5-8 transactions
    const morningTxCount = Math.floor(Math.random() * 4) + 5;
    for (let i = 0; i < morningTxCount; i++) {
      const tx = createTransaction(date, 8, 10, userId, pochiId, tillId, paybillId, runningBalance);
      runningBalance = tx.balance_after;
      transactions.push(tx);
    }

    // Midday (11-2 PM): 3-6 transactions
    const middayTxCount = Math.floor(Math.random() * 4) + 3;
    for (let i = 0; i < middayTxCount; i++) {
      const tx = createTransaction(date, 11, 14, userId, pochiId, tillId, paybillId, runningBalance);
      runningBalance = tx.balance_after;
      transactions.push(tx);
    }

    // Afternoon (3-5 PM): 2-5 transactions
    const afternoonTxCount = Math.floor(Math.random() * 4) + 2;
    for (let i = 0; i < afternoonTxCount; i++) {
      const tx = createTransaction(date, 15, 17, userId, pochiId, tillId, paybillId, runningBalance);
      runningBalance = tx.balance_after;
      transactions.push(tx);
    }

    // Evening peak (6-9 PM): 6-10 transactions
    const eveningTxCount = Math.floor(Math.random() * 5) + 6;
    for (let i = 0; i < eveningTxCount; i++) {
      const tx = createTransaction(date, 18, 21, userId, pochiId, tillId, paybillId, runningBalance);
      runningBalance = tx.balance_after;
      transactions.push(tx);
    }
  }

  // Add some recent pending transactions
  const pendingCount = Math.floor(Math.random() * 3) + 1;
  for (let i = 0; i < pendingCount; i++) {
    const minutes = Math.floor(Math.random() * 30) + 1;
    const txDate = new Date(now.getTime() - minutes * 60000);
    transactions.push({
      user_id: userId,
      mpesa_account_id: [pochiId, tillId, paybillId][Math.floor(Math.random() * 3)],
      transaction_id: `TXN${Date.now()}${i}`,
      transaction_type: 'received',
      phone_number: generatePhoneNumber(),
      amount: Math.floor(Math.random() * 2000) + 500,
      status: 'pending',
      description: 'Payment processing',
      transaction_date: txDate.toISOString(),
      balance_after: null,
      mpesa_receipt_number: null
    });
  }

  return transactions;
}

function createTransaction(
  baseDate: Date,
  startHour: number,
  endHour: number,
  userId: string,
  pochiId: string,
  tillId: string,
  paybillId: string,
  currentBalance: number
) {
  const hour = Math.floor(Math.random() * (endHour - startHour)) + startHour;
  const minute = Math.floor(Math.random() * 60);
  const txDate = new Date(baseDate);
  txDate.setHours(hour, minute, 0, 0);

  const accounts = [
    { id: pochiId, name: 'Pochi' },
    { id: tillId, name: 'Till' },
    { id: paybillId, name: 'Paybill' }
  ];
  const account = accounts[Math.floor(Math.random() * accounts.length)];

  // 75% received, 25% sent
  const isReceived = Math.random() > 0.25;
  const type = isReceived ? 'received' : 'sent';

  // Varied amounts based on transaction type and time
  let amount: number;
  if (isReceived) {
    // Received payments: 200-8000
    amount = Math.floor(Math.random() * 7800) + 200;
  } else {
    // Sent payments: 500-5000
    amount = Math.floor(Math.random() * 4500) + 500;
  }

  const newBalance = isReceived ? currentBalance + amount : currentBalance - amount;

  const descriptions = {
    received: [
      'Product purchase',
      'Service payment',
      'Invoice payment',
      'Subscription payment',
      'Monthly fee',
      'Retail purchase',
      'Online order',
      'Customer payment',
      'Delivery payment',
      'Consultation fee'
    ],
    sent: [
      'Supplier payment',
      'Utility payment',
      'Stock purchase',
      'Service charge',
      'Rent payment',
      'Salary payment',
      'Tax payment',
      'Expense reimbursement',
      'Vendor payment',
      'Maintenance cost'
    ]
  };

  const description = descriptions[type][Math.floor(Math.random() * descriptions[type].length)];

  return {
    user_id: userId,
    mpesa_account_id: account.id,
    transaction_id: `TXN${txDate.getTime()}${Math.floor(Math.random() * 1000)}`,
    transaction_type: type,
    phone_number: generatePhoneNumber(),
    amount: amount,
    status: 'completed',
    description: description,
    mpesa_receipt_number: `RBK${generateReceiptNumber()}`,
    balance_after: newBalance,
    transaction_date: txDate.toISOString()
  };
}

function generatePhoneNumber(): string {
  const prefixes = ['0722', '0733', '0744', '0755', '0766', '0777', '0711'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  return `+254${prefix.slice(1)}${suffix}`;
}

function generateReceiptNumber(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
