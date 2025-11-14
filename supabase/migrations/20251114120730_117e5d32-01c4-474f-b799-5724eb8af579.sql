-- Add missing columns to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'active';

-- Create outlets table
CREATE TABLE IF NOT EXISTS public.outlets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  classification TEXT NOT NULL, -- 'national', 'regional', 'county', 'subcounty', 'location'
  outlet_type TEXT NOT NULL, -- 'branch', 'station', 'regional_office'
  county TEXT,
  subcounty TEXT,
  is_active BOOLEAN DEFAULT true,
  mpesa_account_id UUID REFERENCES public.mpesa_accounts(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create departments table
CREATE TABLE IF NOT EXISTS public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  department_type TEXT NOT NULL, -- 'customer_care', 'sales', 'hr', 'finance', 'operations'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create staff_outlets table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS public.staff_outlets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  outlet_id UUID REFERENCES public.outlets(id) ON DELETE CASCADE NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, outlet_id)
);

-- Create staff_departments table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS public.staff_departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE NOT NULL,
  is_manager BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, department_id)
);

-- Create invitations table
CREATE TABLE IF NOT EXISTS public.invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL,
  outlet_id UUID REFERENCES public.outlets(id),
  department_id UUID REFERENCES public.departments(id),
  invited_by UUID NOT NULL,
  invitation_token TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'expired', 'revoked'
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create cashier_metrics table
CREATE TABLE IF NOT EXISTS public.cashier_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  outlet_id UUID REFERENCES public.outlets(id),
  date DATE DEFAULT CURRENT_DATE,
  transactions_count INTEGER DEFAULT 0,
  total_amount NUMERIC DEFAULT 0,
  successful_transactions INTEGER DEFAULT 0,
  failed_transactions INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, outlet_id, date)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_outlets_organization ON public.outlets(organization_id);
CREATE INDEX IF NOT EXISTS idx_outlets_mpesa_account ON public.outlets(mpesa_account_id);
CREATE INDEX IF NOT EXISTS idx_departments_organization ON public.departments(organization_id);
CREATE INDEX IF NOT EXISTS idx_staff_outlets_user ON public.staff_outlets(user_id);
CREATE INDEX IF NOT EXISTS idx_staff_outlets_outlet ON public.staff_outlets(outlet_id);
CREATE INDEX IF NOT EXISTS idx_staff_departments_user ON public.staff_departments(user_id);
CREATE INDEX IF NOT EXISTS idx_staff_departments_department ON public.staff_departments(department_id);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON public.invitations(email);
CREATE INDEX IF NOT EXISTS idx_invitations_token ON public.invitations(invitation_token);
CREATE INDEX IF NOT EXISTS idx_cashier_metrics_user_date ON public.cashier_metrics(user_id, date);

-- Enable RLS
ALTER TABLE public.outlets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_outlets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cashier_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for outlets
CREATE POLICY "Organization members can view outlets"
ON public.outlets FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
    AND p.organization_id = outlets.organization_id
  )
);

CREATE POLICY "Admins can manage outlets"
ON public.outlets FOR ALL
USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'super_admin') OR
  has_role(auth.uid(), 'corporate_admin')
);

-- RLS Policies for departments
CREATE POLICY "Organization members can view departments"
ON public.departments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
    AND p.organization_id = departments.organization_id
  )
);

CREATE POLICY "Admins can manage departments"
ON public.departments FOR ALL
USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'super_admin') OR
  has_role(auth.uid(), 'corporate_admin')
);

-- RLS Policies for staff_outlets
CREATE POLICY "Users can view their outlet assignments"
ON public.staff_outlets FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage outlet assignments"
ON public.staff_outlets FOR ALL
USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'super_admin') OR
  has_role(auth.uid(), 'corporate_admin')
);

-- RLS Policies for staff_departments
CREATE POLICY "Users can view their department assignments"
ON public.staff_departments FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage department assignments"
ON public.staff_departments FOR ALL
USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'super_admin') OR
  has_role(auth.uid(), 'corporate_admin')
);

-- RLS Policies for invitations
CREATE POLICY "Organization admins can view invitations"
ON public.invitations FOR SELECT
USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'super_admin') OR
  has_role(auth.uid(), 'corporate_admin')
);

CREATE POLICY "Admins can create invitations"
ON public.invitations FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'super_admin') OR
  has_role(auth.uid(), 'corporate_admin')
);

CREATE POLICY "Admins can update invitations"
ON public.invitations FOR UPDATE
USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'super_admin') OR
  has_role(auth.uid(), 'corporate_admin')
);

-- RLS Policies for cashier_metrics
CREATE POLICY "Users can view their own metrics"
ON public.cashier_metrics FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can insert metrics"
ON public.cashier_metrics FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update metrics"
ON public.cashier_metrics FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all metrics"
ON public.cashier_metrics FOR SELECT
USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'super_admin') OR
  has_role(auth.uid(), 'corporate_admin')
);

-- Triggers for updated_at
CREATE TRIGGER update_outlets_updated_at
BEFORE UPDATE ON public.outlets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_departments_updated_at
BEFORE UPDATE ON public.departments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cashier_metrics_updated_at
BEFORE UPDATE ON public.cashier_metrics
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();