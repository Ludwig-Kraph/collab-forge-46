import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SMSData {
  userId: string;
  phoneNumber: string;
  messageBody: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { userId, phoneNumber, messageBody }: SMSData = await req.json();

    if (!userId || !phoneNumber || !messageBody) {
      throw new Error('Missing required fields');
    }

    console.log('Processing SMS:', { userId, phoneNumber, messageBody });

    // Parse MPESA confirmation message
    // Example format: "RBK1ABC123 Confirmed. Ksh5,000.00 received from 254712345678 on 01/01/2024 at 10:30 AM"
    const mpesaRegex = /([A-Z0-9]+)\s+Confirmed\.\s+(?:Ksh|KES)?([\d,]+\.?\d*)\s+(?:received from|sent to)\s+(\d+)/i;
    const dateRegex = /(\d{1,2}\/\d{1,2}\/\d{4})\s+at\s+(\d{1,2}:\d{2}\s*(?:AM|PM)?)/i;

    const match = messageBody.match(mpesaRegex);
    const dateMatch = messageBody.match(dateRegex);

    let parsedData: any = {};
    let mpesaCode = null;
    let amount = null;
    let senderPhone = null;
    let transactionDate = null;
    let transactionType = 'received';

    if (match) {
      mpesaCode = match[1];
      amount = parseFloat(match[2].replace(/,/g, ''));
      senderPhone = match[3];

      // Determine transaction type
      if (messageBody.toLowerCase().includes('sent to')) {
        transactionType = 'sent';
      }

      parsedData = {
        mpesaCode,
        amount,
        senderPhone,
        transactionType,
      };

      if (dateMatch) {
        const [, date, time] = dateMatch;
        // Convert to ISO format (basic parsing)
        const [day, month, year] = date.split('/');
        transactionDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${time}`;
        parsedData.transactionDate = transactionDate;
      }
    }

    // Save SMS message
    const { data: smsMessage, error: smsError } = await supabaseClient
      .from('sms_messages')
      .insert({
        user_id: userId,
        phone_number: phoneNumber,
        message_body: messageBody,
        mpesa_code: mpesaCode,
        amount,
        sender_phone: senderPhone,
        transaction_date: transactionDate,
        parsed_data: parsedData,
        is_processed: false,
      })
      .select()
      .single();

    if (smsError) {
      console.error('Failed to save SMS message:', smsError);
      throw new Error('Failed to save SMS message');
    }

    // If successfully parsed, create transaction
    if (mpesaCode && amount && senderPhone) {
      // Get user's MPESA account
      const { data: mpesaAccount } = await supabaseClient
        .from('mpesa_accounts')
        .select('id')
        .eq('user_id', userId)
        .eq('is_active', true)
        .limit(1)
        .single();

      if (mpesaAccount) {
        const { data: transaction, error: txError } = await supabaseClient
          .from('transactions')
          .insert({
            user_id: userId,
            mpesa_account_id: mpesaAccount.id,
            transaction_id: mpesaCode,
            phone_number: senderPhone,
            amount,
            transaction_type: transactionType,
            description: 'SMS Confirmation',
            status: 'completed',
            mpesa_receipt_number: mpesaCode,
            transaction_date: transactionDate || new Date().toISOString(),
          })
          .select()
          .single();

        if (txError) {
          console.error('Failed to create transaction:', txError);
        } else {
          // Update SMS message as processed
          await supabaseClient
            .from('sms_messages')
            .update({
              is_processed: true,
              processed_at: new Date().toISOString(),
              transaction_id: transaction.id,
            })
            .eq('id', smsMessage.id);

          console.log('Transaction created successfully:', transaction.id);
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'SMS processed successfully',
        data: {
          smsId: smsMessage.id,
          parsed: parsedData,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Error in process-sms:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'An error occurred',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
