-- Update is_super_admin function to use cache (more efficient, no recursion risk)
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.super_admin_cache
    WHERE user_id = _user_id
      AND is_super_admin = true
  )
$$;