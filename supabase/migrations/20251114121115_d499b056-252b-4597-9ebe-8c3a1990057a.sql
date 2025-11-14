-- Extend app_role enum with government roles
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'government_level') THEN
    CREATE TYPE government_level AS ENUM ('national', 'county');
  END IF;
END $$;

-- Create government_entities table
CREATE TABLE IF NOT EXISTS public.government_entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type government_level NOT NULL,
  entity_name TEXT NOT NULL,
  county_name TEXT,
  entity_code TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create government_officials table
CREATE TABLE IF NOT EXISTS public.government_officials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  government_entity_id UUID REFERENCES public.government_entities(id) ON DELETE CASCADE NOT NULL,
  office_title TEXT NOT NULL, -- 'President', 'Governor', 'Cabinet Secretary', etc.
  can_be_blocked BOOLEAN DEFAULT true, -- false for constitutional offices
  is_super_admin BOOLEAN DEFAULT false, -- true for President, Governors, Auditor General, etc.
  access_level INTEGER DEFAULT 1, -- 1=view, 2=manage, 3=full_control
  appointed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create government_revenue_streams table
CREATE TABLE IF NOT EXISTS public.government_revenue_streams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  government_entity_id UUID REFERENCES public.government_entities(id) ON DELETE CASCADE NOT NULL,
  stream_name TEXT NOT NULL,
  stream_category TEXT NOT NULL, -- 'tax', 'fees', 'levies', 'grants'
  target_amount NUMERIC DEFAULT 0,
  collected_amount NUMERIC DEFAULT 0,
  fiscal_year TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create inter_governmental_communications table
CREATE TABLE IF NOT EXISTS public.inter_governmental_communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_entity_id UUID REFERENCES public.government_entities(id) NOT NULL,
  to_entity_id UUID REFERENCES public.government_entities(id) NOT NULL,
  from_official_id UUID REFERENCES public.government_officials(id) NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
  is_read BOOLEAN DEFAULT false,
  is_encrypted BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create government_audit_trails table
CREATE TABLE IF NOT EXISTS public.government_audit_trails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  government_entity_id UUID REFERENCES public.government_entities(id) NOT NULL,
  official_id UUID REFERENCES public.government_officials(id) NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  changes JSONB,
  ip_address INET,
  is_compliant BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create government_compliance_reports table
CREATE TABLE IF NOT EXISTS public.government_compliance_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  government_entity_id UUID REFERENCES public.government_entities(id) NOT NULL,
  report_type TEXT NOT NULL, -- 'quarterly', 'annual', 'audit'
  report_period TEXT NOT NULL,
  total_revenue NUMERIC DEFAULT 0,
  total_expenditure NUMERIC DEFAULT 0,
  compliance_score INTEGER CHECK (compliance_score >= 0 AND compliance_score <= 100),
  issues_found INTEGER DEFAULT 0,
  generated_by UUID REFERENCES public.government_officials(id),
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_government_entities_type ON public.government_entities(entity_type);
CREATE INDEX IF NOT EXISTS idx_government_entities_county ON public.government_entities(county_name);
CREATE INDEX IF NOT EXISTS idx_government_officials_user ON public.government_officials(user_id);
CREATE INDEX IF NOT EXISTS idx_government_officials_entity ON public.government_officials(government_entity_id);
CREATE INDEX IF NOT EXISTS idx_government_revenue_entity ON public.government_revenue_streams(government_entity_id);
CREATE INDEX IF NOT EXISTS idx_inter_gov_comm_from ON public.inter_governmental_communications(from_entity_id);
CREATE INDEX IF NOT EXISTS idx_inter_gov_comm_to ON public.inter_governmental_communications(to_entity_id);
CREATE INDEX IF NOT EXISTS idx_gov_audit_entity ON public.government_audit_trails(government_entity_id);
CREATE INDEX IF NOT EXISTS idx_gov_compliance_entity ON public.government_compliance_reports(government_entity_id);

-- Enable RLS
ALTER TABLE public.government_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.government_officials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.government_revenue_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inter_governmental_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.government_audit_trails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.government_compliance_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for government_entities
CREATE POLICY "Government officials can view entities"
ON public.government_entities FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.government_officials
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Super admins can manage entities"
ON public.government_entities FOR ALL
USING (
  is_super_admin(auth.uid()) OR
  EXISTS (
    SELECT 1 FROM public.government_officials
    WHERE user_id = auth.uid() AND is_super_admin = true
  )
);

-- RLS Policies for government_officials
CREATE POLICY "Officials can view their own profile"
ON public.government_officials FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Super admins can view all officials"
ON public.government_officials FOR SELECT
USING (
  is_super_admin(auth.uid()) OR
  EXISTS (
    SELECT 1 FROM public.government_officials
    WHERE user_id = auth.uid() AND is_super_admin = true
  )
);

CREATE POLICY "Super admins can manage officials"
ON public.government_officials FOR ALL
USING (
  is_super_admin(auth.uid()) OR
  EXISTS (
    SELECT 1 FROM public.government_officials
    WHERE user_id = auth.uid() AND is_super_admin = true
  )
);

-- RLS Policies for government_revenue_streams
CREATE POLICY "Officials can view their entity revenue"
ON public.government_revenue_streams FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.government_officials
    WHERE user_id = auth.uid()
    AND government_entity_id = government_revenue_streams.government_entity_id
  )
);

CREATE POLICY "National officials can view all revenue"
ON public.government_revenue_streams FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.government_officials go
    JOIN public.government_entities ge ON go.government_entity_id = ge.id
    WHERE go.user_id = auth.uid() AND ge.entity_type = 'national'
  )
);

-- RLS Policies for inter_governmental_communications
CREATE POLICY "Officials can view their entity communications"
ON public.inter_governmental_communications FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.government_officials
    WHERE user_id = auth.uid()
    AND (government_entity_id = from_entity_id OR government_entity_id = to_entity_id)
  )
);

CREATE POLICY "Officials can send communications"
ON public.inter_governmental_communications FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.government_officials
    WHERE user_id = auth.uid()
    AND government_entity_id = from_entity_id
    AND id = from_official_id
  )
);

-- RLS Policies for government_audit_trails
CREATE POLICY "Officials can view their entity audit trails"
ON public.government_audit_trails FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.government_officials
    WHERE user_id = auth.uid()
    AND government_entity_id = government_audit_trails.government_entity_id
  )
);

CREATE POLICY "System can insert audit trails"
ON public.government_audit_trails FOR INSERT
WITH CHECK (true);

-- RLS Policies for government_compliance_reports
CREATE POLICY "Officials can view their entity reports"
ON public.government_compliance_reports FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.government_officials
    WHERE user_id = auth.uid()
    AND government_entity_id = government_compliance_reports.government_entity_id
  )
);

CREATE POLICY "National officials can view all reports"
ON public.government_compliance_reports FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.government_officials go
    JOIN public.government_entities ge ON go.government_entity_id = ge.id
    WHERE go.user_id = auth.uid() AND ge.entity_type = 'national'
  )
);

-- Triggers for updated_at
CREATE TRIGGER update_government_entities_updated_at
BEFORE UPDATE ON public.government_entities
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_government_officials_updated_at
BEFORE UPDATE ON public.government_officials
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_government_revenue_streams_updated_at
BEFORE UPDATE ON public.government_revenue_streams
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();