-- Create function to decrement STK pushes
CREATE OR REPLACE FUNCTION public.decrement_stk_pushes(_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.subscriptions
  SET 
    free_stk_pushes_remaining = GREATEST(0, free_stk_pushes_remaining - 1),
    used_stk_pushes = used_stk_pushes + 1
  WHERE user_id = _user_id
    AND is_active = true;
END;
$$;