-- Allow first user to self-designate as admin during signup
-- After that, only admins can assign admin roles

-- Function to check if any admin exists
CREATE OR REPLACE FUNCTION public.admin_exists()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE role = 'admin'
  )
$$;

-- Update the handle_new_user trigger to make first user admin
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, phone_number, full_name)
  VALUES (
    NEW.id,
    NEW.phone,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User')
  );
  
  -- Insert role (first user becomes admin, others are regular users)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id, 
    CASE 
      WHEN NOT admin_exists() THEN 'admin'::app_role
      ELSE 'user'::app_role
    END
  );
  
  -- Insert free trial subscription
  INSERT INTO public.subscriptions (
    user_id,
    tier,
    max_users,
    free_stk_pushes_remaining,
    expires_at
  )
  VALUES (
    NEW.id,
    'free_trial',
    1,
    3,
    NOW() + INTERVAL '30 days'
  );
  
  RETURN NEW;
END;
$$;

-- Create policy to allow admins to promote users
CREATE POLICY "Admins can assign admin role"
ON public.user_roles
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR
  NOT admin_exists()
);