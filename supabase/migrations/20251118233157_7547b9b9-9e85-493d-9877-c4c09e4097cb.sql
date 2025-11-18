-- Update decrement_stk_pushes function to handle NULL (unlimited) properly
CREATE OR REPLACE FUNCTION public.decrement_stk_pushes(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Only decrement if not unlimited (NULL means unlimited)
  UPDATE public.subscriptions
  SET 
    free_stk_pushes_remaining = CASE 
      WHEN free_stk_pushes_remaining IS NULL THEN NULL -- Keep unlimited
      ELSE GREATEST(0, free_stk_pushes_remaining - 1)
    END,
    used_stk_pushes = used_stk_pushes + 1
  WHERE user_id = _user_id
    AND is_active = true;
END;
$function$;