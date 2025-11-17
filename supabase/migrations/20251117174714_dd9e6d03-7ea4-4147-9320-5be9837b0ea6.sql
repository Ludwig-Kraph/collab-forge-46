-- Create registration_requests table for client onboarding
CREATE TABLE IF NOT EXISTS public.registration_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name TEXT NOT NULL,
  business_type TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  email TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  mpesa_account_type TEXT NOT NULL,
  mpesa_account_number TEXT NOT NULL,
  requested_tier TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create mpesa_credential_validations table
CREATE TABLE IF NOT EXISTS public.mpesa_credential_validations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_request_id UUID REFERENCES public.registration_requests(id),
  validation_type TEXT NOT NULL,
  status TEXT NOT NULL,
  test_phone_number TEXT,
  test_amount NUMERIC,
  validated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create communication_channels table
CREATE TABLE IF NOT EXISTS public.communication_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  channel_type TEXT NOT NULL,
  is_private BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create channel_messages table
CREATE TABLE IF NOT EXISTS public.channel_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES public.communication_channels(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.registration_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mpesa_credential_validations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communication_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for registration_requests
CREATE POLICY "Super admins can view all registration requests"
  ON public.registration_requests FOR SELECT
  TO authenticated
  USING (is_super_admin(auth.uid()));

CREATE POLICY "Super admins can update registration requests"
  ON public.registration_requests FOR UPDATE
  TO authenticated
  USING (is_super_admin(auth.uid()));

CREATE POLICY "Anyone can create registration requests"
  ON public.registration_requests FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for mpesa_credential_validations
CREATE POLICY "Super admins can view validations"
  ON public.mpesa_credential_validations FOR SELECT
  TO authenticated
  USING (is_super_admin(auth.uid()));

CREATE POLICY "Super admins can insert validations"
  ON public.mpesa_credential_validations FOR INSERT
  TO authenticated
  WITH CHECK (is_super_admin(auth.uid()));

-- RLS Policies for communication_channels
CREATE POLICY "Super admins can manage channels"
  ON public.communication_channels FOR ALL
  TO authenticated
  USING (is_super_admin(auth.uid()));

-- RLS Policies for channel_messages
CREATE POLICY "Super admins can view all messages"
  ON public.channel_messages FOR SELECT
  TO authenticated
  USING (is_super_admin(auth.uid()));

CREATE POLICY "Super admins can send messages"
  ON public.channel_messages FOR INSERT
  TO authenticated
  WITH CHECK (is_super_admin(auth.uid()));

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_registration_requests_status ON public.registration_requests(status);
CREATE INDEX IF NOT EXISTS idx_channel_messages_channel_id ON public.channel_messages(channel_id);
CREATE INDEX IF NOT EXISTS idx_channel_messages_created_at ON public.channel_messages(created_at);