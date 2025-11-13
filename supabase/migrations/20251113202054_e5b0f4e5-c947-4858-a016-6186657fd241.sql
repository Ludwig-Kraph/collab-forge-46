-- Create function to check if super admin exists
CREATE OR REPLACE FUNCTION public.super_admin_exists()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE role = 'super_admin'
  )
$$;

-- Function to check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'super_admin'
  )
$$;

-- Update the handle_new_user function to support RBAC users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, phone_number, full_name, email, is_rbac_user)
  VALUES (
    NEW.id,
    COALESCE(NEW.phone, ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'is_rbac_user')::boolean, false)
  );
  
  -- Insert role based on user type
  -- If RBAC user, don't assign role automatically (will be assigned by admin)
  IF NOT COALESCE((NEW.raw_user_meta_data->>'is_rbac_user')::boolean, false) THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (
      NEW.id, 
      CASE 
        WHEN NOT admin_exists() THEN 'admin'::app_role
        ELSE 'user'::app_role
      END
    );
    
    -- Insert free trial subscription for regular users
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
  END IF;
  
  RETURN NEW;
END;
$$;

-- Allow super admins to manage all users
DROP POLICY IF EXISTS "Super admins can view all profiles" ON public.profiles;
CREATE POLICY "Super admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Super admins can update all profiles" ON public.profiles;
CREATE POLICY "Super admins can update all profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (is_super_admin(auth.uid()));

-- Allow super admins and corporate admins to create RBAC users
DROP POLICY IF EXISTS "Admins can insert RBAC profiles" ON public.profiles;
CREATE POLICY "Admins can insert RBAC profiles"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (
  is_super_admin(auth.uid()) OR 
  has_role(auth.uid(), 'corporate_admin') OR
  has_role(auth.uid(), 'admin')
);

-- Super admins can assign any role
DROP POLICY IF EXISTS "Super admins can assign any role" ON public.user_roles;
CREATE POLICY "Super admins can assign any role"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Super admins can view all user roles" ON public.user_roles;
CREATE POLICY "Super admins can view all user roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Super admins can update any role" ON public.user_roles;
CREATE POLICY "Super admins can update any role"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Super admins can delete any role" ON public.user_roles;
CREATE POLICY "Super admins can delete any role"
ON public.user_roles
FOR DELETE
TO authenticated
USING (is_super_admin(auth.uid()));