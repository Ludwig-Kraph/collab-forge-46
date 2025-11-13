-- Add email column to profiles table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'email'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN email text;
    END IF;
END $$;

-- Create function to check if super admin exists
CREATE OR REPLACE FUNCTION public.super_admin_exists()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE role = 'super_admin'
  )
$$;

-- Update handle_new_user to make first user super admin if none exists
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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
  
  -- Assign role based on user type
  IF NOT COALESCE((NEW.raw_user_meta_data->>'is_rbac_user')::boolean, false) THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (
      NEW.id, 
      CASE 
        WHEN NOT super_admin_exists() THEN 'super_admin'::app_role
        WHEN NOT admin_exists() THEN 'admin'::app_role
        ELSE 'user'::app_role
      END
    );
    
    -- Insert free trial subscription for non-super-admin users
    IF super_admin_exists() OR admin_exists() THEN
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
  END IF;
  
  RETURN NEW;
END;
$$;