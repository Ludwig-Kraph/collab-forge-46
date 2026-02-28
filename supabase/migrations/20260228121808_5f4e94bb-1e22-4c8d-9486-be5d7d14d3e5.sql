
-- Token Packages table
CREATE TABLE public.token_packages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  token_count INTEGER NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'KES',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.token_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active token packages"
ON public.token_packages FOR SELECT
USING (is_active = true);

CREATE POLICY "Super admins can manage token packages"
ON public.token_packages FOR ALL
USING (is_super_admin(auth.uid()));

-- Token Balances table
CREATE TABLE public.token_balances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  balance INTEGER NOT NULL DEFAULT 0,
  total_purchased INTEGER NOT NULL DEFAULT 0,
  total_used INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.token_balances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own token balance"
ON public.token_balances FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Super admins can view all token balances"
ON public.token_balances FOR SELECT
USING (is_super_admin(auth.uid()));

CREATE POLICY "System can insert token balances"
ON public.token_balances FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update token balances"
ON public.token_balances FOR UPDATE
USING (auth.uid() = user_id OR is_super_admin(auth.uid()));

-- Token Transactions table
CREATE TABLE public.token_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('purchase', 'usage', 'refund', 'bonus')),
  amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  reference_id TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.token_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own token transactions"
ON public.token_transactions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Super admins can view all token transactions"
ON public.token_transactions FOR SELECT
USING (is_super_admin(auth.uid()));

CREATE POLICY "System can insert token transactions"
ON public.token_transactions FOR INSERT
WITH CHECK (auth.uid() = user_id OR is_super_admin(auth.uid()));

CREATE POLICY "Prevent token transaction updates"
ON public.token_transactions FOR UPDATE
USING (false);

CREATE POLICY "Prevent token transaction deletes"
ON public.token_transactions FOR DELETE
USING (false);

-- Consume token function (atomic)
CREATE OR REPLACE FUNCTION public.consume_token(_user_id UUID, _count INTEGER DEFAULT 1)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_balance INTEGER;
  new_balance INTEGER;
BEGIN
  -- Lock the row for update
  SELECT balance INTO current_balance
  FROM token_balances
  WHERE user_id = _user_id
  FOR UPDATE;

  IF current_balance IS NULL OR current_balance < _count THEN
    RETURN false;
  END IF;

  new_balance := current_balance - _count;

  UPDATE token_balances
  SET balance = new_balance,
      total_used = total_used + _count,
      updated_at = now()
  WHERE user_id = _user_id;

  INSERT INTO token_transactions (user_id, type, amount, balance_after, description)
  VALUES (_user_id, 'usage', _count, new_balance, 'STK push token consumed');

  RETURN true;
END;
$$;

-- Updated_at trigger for token_packages
CREATE TRIGGER update_token_packages_updated_at
BEFORE UPDATE ON public.token_packages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Updated_at trigger for token_balances
CREATE TRIGGER update_token_balances_updated_at
BEFORE UPDATE ON public.token_balances
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
