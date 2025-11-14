-- Create payment_requests table
CREATE TABLE IF NOT EXISTS public.payment_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mpesa_account_id UUID NOT NULL REFERENCES public.mpesa_accounts(id) ON DELETE CASCADE,
  customer_phone TEXT NOT NULL,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  checkout_request_id TEXT,
  merchant_request_id TEXT,
  result_code TEXT,
  result_desc TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX idx_payment_requests_user_id ON public.payment_requests(user_id);
CREATE INDEX idx_payment_requests_status ON public.payment_requests(status);
CREATE INDEX idx_payment_requests_checkout_request_id ON public.payment_requests(checkout_request_id);
CREATE INDEX idx_payment_requests_created_at ON public.payment_requests(created_at DESC);

-- Enable RLS
ALTER TABLE public.payment_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own payment requests"
  ON public.payment_requests
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own payment requests"
  ON public.payment_requests
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update payment requests"
  ON public.payment_requests
  FOR UPDATE
  USING (true);

CREATE POLICY "Prevent payment request deletion"
  ON public.payment_requests
  FOR DELETE
  USING (false);

-- Enable real-time for payment_requests
ALTER TABLE public.payment_requests REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.payment_requests;