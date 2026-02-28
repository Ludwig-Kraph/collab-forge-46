
-- Receipt sequence counter table for incremental codes
CREATE TABLE public.receipt_counters (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  counter_key text NOT NULL UNIQUE,
  current_value integer NOT NULL DEFAULT 0,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.receipt_counters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "System can manage receipt counters"
ON public.receipt_counters FOR ALL
USING (true)
WITH CHECK (true);

-- Payment receipts table
CREATE TABLE public.payment_receipts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  receipt_number text NOT NULL UNIQUE,
  receipt_type text NOT NULL CHECK (receipt_type IN ('subscription', 'token')),
  amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'KES',
  description text,
  payment_reference text,
  mpesa_receipt_number text,
  subscription_tier text,
  token_package_name text,
  token_count integer,
  token_serial text,
  account_number text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.payment_receipts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own receipts"
ON public.payment_receipts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Super admins can view all receipts"
ON public.payment_receipts FOR SELECT
USING (is_super_admin(auth.uid()));

CREATE POLICY "System can insert receipts"
ON public.payment_receipts FOR INSERT
WITH CHECK (true);

CREATE POLICY "Prevent receipt updates"
ON public.payment_receipts FOR UPDATE
USING (false);

CREATE POLICY "Prevent receipt deletion"
ON public.payment_receipts FOR DELETE
USING (false);

CREATE INDEX idx_receipts_user_id ON public.payment_receipts(user_id);
CREATE INDEX idx_receipts_receipt_number ON public.payment_receipts(receipt_number);
CREATE INDEX idx_receipts_created_at ON public.payment_receipts(created_at DESC);

-- Function to generate receipt numbers
-- Subscription format: MLJ-{TIER}-{INCREMENTAL}-{MM-YYYY}-{ACCOUNT_NUMBER}
-- Token format: MLJ-TKN-{INCREMENTAL}-{MM-YYYY}-{ACCOUNT_NUMBER}-{TOKEN_SERIAL}
CREATE OR REPLACE FUNCTION public.generate_receipt_number(
  _receipt_type text,
  _subscription_tier text DEFAULT NULL,
  _account_number text DEFAULT NULL,
  _token_serial text DEFAULT NULL
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _counter_key text;
  _next_val integer;
  _month_year text;
  _tier_code text;
  _receipt_number text;
  _acct text;
BEGIN
  -- Get current month-year
  _month_year := to_char(now(), 'MM-YYYY');
  
  -- Determine tier code
  IF _receipt_type = 'subscription' THEN
    _tier_code := UPPER(COALESCE(_subscription_tier, 'GEN'));
  ELSE
    _tier_code := 'TKN';
  END IF;
  
  -- Counter key per type per month
  _counter_key := _receipt_type || '-' || _month_year;
  
  -- Atomically increment counter
  INSERT INTO receipt_counters (counter_key, current_value)
  VALUES (_counter_key, 1)
  ON CONFLICT (counter_key)
  DO UPDATE SET current_value = receipt_counters.current_value + 1, updated_at = now()
  RETURNING current_value INTO _next_val;
  
  -- Format account number (last 6 digits or full if shorter)
  _acct := COALESCE(_account_number, '000000');
  IF length(_acct) > 6 THEN
    _acct := right(_acct, 6);
  END IF;
  
  -- Build receipt number
  _receipt_number := 'MLJ-' || _tier_code || '-' || lpad(_next_val::text, 5, '0') || '-' || _month_year || '-' || _acct;
  
  -- Append token serial for token receipts
  IF _receipt_type = 'token' AND _token_serial IS NOT NULL THEN
    _receipt_number := _receipt_number || '-' || _token_serial;
  END IF;
  
  RETURN _receipt_number;
END;
$$;

-- Function to create a receipt (callable from edge functions via service role)
CREATE OR REPLACE FUNCTION public.create_payment_receipt(
  _user_id uuid,
  _receipt_type text,
  _amount numeric,
  _description text DEFAULT NULL,
  _payment_reference text DEFAULT NULL,
  _mpesa_receipt_number text DEFAULT NULL,
  _subscription_tier text DEFAULT NULL,
  _token_package_name text DEFAULT NULL,
  _token_count integer DEFAULT NULL,
  _account_number text DEFAULT NULL
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _receipt_number text;
  _token_serial text;
BEGIN
  -- Generate token serial for token receipts
  IF _receipt_type = 'token' THEN
    _token_serial := 'TS' || lpad((floor(random() * 999999) + 1)::text, 6, '0');
  END IF;
  
  -- Generate receipt number
  _receipt_number := generate_receipt_number(_receipt_type, _subscription_tier, _account_number, _token_serial);
  
  -- Insert receipt
  INSERT INTO payment_receipts (
    user_id, receipt_number, receipt_type, amount, description,
    payment_reference, mpesa_receipt_number, subscription_tier,
    token_package_name, token_count, token_serial, account_number
  ) VALUES (
    _user_id, _receipt_number, _receipt_type, _amount, _description,
    _payment_reference, _mpesa_receipt_number, _subscription_tier,
    _token_package_name, _token_count, _token_serial, _account_number
  );
  
  RETURN _receipt_number;
END;
$$;
