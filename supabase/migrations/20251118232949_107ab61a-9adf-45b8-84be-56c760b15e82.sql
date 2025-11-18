-- Make subscription limits nullable to support unlimited access
ALTER TABLE public.subscriptions 
ALTER COLUMN max_users DROP NOT NULL;

ALTER TABLE public.subscriptions 
ALTER COLUMN free_stk_pushes_remaining DROP NOT NULL;

-- Add comment explaining NULL means unlimited
COMMENT ON COLUMN public.subscriptions.max_users IS 'Maximum users allowed. NULL means unlimited.';
COMMENT ON COLUMN public.subscriptions.max_stk_pushes IS 'Maximum STK pushes per period. NULL means unlimited.';
COMMENT ON COLUMN public.subscriptions.free_stk_pushes_remaining IS 'Free STK pushes remaining. NULL means unlimited.';

-- Update government tier subscriptions to have NULL (unlimited) values
UPDATE public.subscriptions
SET 
  max_users = NULL,
  max_stk_pushes = NULL,
  free_stk_pushes_remaining = NULL
WHERE tier = 'government';