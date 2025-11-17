-- Fix infinite recursion in government_officials RLS policies
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Officials can view their own profile" ON public.government_officials;
DROP POLICY IF EXISTS "Super admins can manage officials" ON public.government_officials;
DROP POLICY IF EXISTS "Super admins can view all officials" ON public.government_officials;

-- Create security definer function to check if user is government official
CREATE OR REPLACE FUNCTION public.is_government_official(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.government_officials
    WHERE user_id = _user_id
  )
$$;

-- Create security definer function to check if user is government super admin
CREATE OR REPLACE FUNCTION public.is_government_super_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.government_officials
    WHERE user_id = _user_id
      AND is_super_admin = true
  )
$$;

-- Recreate policies using security definer functions
CREATE POLICY "Officials can view their own profile"
ON public.government_officials
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Super admins can manage officials"
ON public.government_officials
FOR ALL
USING (
  is_super_admin(auth.uid()) OR is_government_super_admin(auth.uid())
);

CREATE POLICY "Super admins can view all officials"
ON public.government_officials
FOR SELECT
USING (
  is_super_admin(auth.uid()) OR is_government_super_admin(auth.uid())
);

-- Add delete policy for government entities
CREATE POLICY "Super admins can delete government entities"
ON public.government_entities
FOR DELETE
USING (
  is_super_admin(auth.uid()) OR is_government_super_admin(auth.uid())
);

-- Create table for device sessions (for revoking access)
CREATE TABLE IF NOT EXISTS public.user_devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_name text NOT NULL,
  device_fingerprint text NOT NULL,
  last_active_at timestamp with time zone DEFAULT now(),
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, device_fingerprint)
);

ALTER TABLE public.user_devices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own devices"
ON public.user_devices
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can revoke their own devices"
ON public.user_devices
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "System can insert devices"
ON public.user_devices
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create table for system contact information (editable by super admin)
CREATE TABLE IF NOT EXISTS public.system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value text NOT NULL,
  updated_at timestamp with time zone DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view system settings"
ON public.system_settings
FOR SELECT
USING (true);

CREATE POLICY "Super admins can manage system settings"
ON public.system_settings
FOR ALL
USING (is_super_admin(auth.uid()));

-- Insert default contact information
INSERT INTO public.system_settings (setting_key, setting_value) VALUES
  ('support_email', 'support@m-leja.com'),
  ('support_phone', '+254700000000'),
  ('support_whatsapp', '+254700000000')
ON CONFLICT (setting_key) DO NOTHING;

-- Create table for MPESA API credentials per subscription account
CREATE TABLE IF NOT EXISTS public.mpesa_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  consumer_key text,
  consumer_secret text,
  passkey text,
  shortcode text,
  environment text DEFAULT 'live' CHECK (environment IN ('sandbox', 'live')),
  is_active boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.mpesa_credentials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own credentials"
ON public.mpesa_credentials
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own credentials"
ON public.mpesa_credentials
FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Super admins can view all credentials"
ON public.mpesa_credentials
FOR SELECT
USING (is_super_admin(auth.uid()));

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION update_mpesa_credentials_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER mpesa_credentials_updated_at
BEFORE UPDATE ON public.mpesa_credentials
FOR EACH ROW
EXECUTE FUNCTION update_mpesa_credentials_updated_at();