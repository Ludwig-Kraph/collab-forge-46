-- Add new roles to app_role enum
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'cashier';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'sales_agent';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'supervisor';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'assistant_manager';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'senior_manager';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'cfo';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'director';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'ceo';

-- Add verification badge and status to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verification_badge_color TEXT DEFAULT NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free_trial';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_type TEXT DEFAULT 'default';

-- Add account management fields
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_flagged BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS flag_reason TEXT DEFAULT NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS flagged_by UUID REFERENCES auth.users(id) DEFAULT NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS flagged_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS block_reason TEXT DEFAULT NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS blocked_by UUID REFERENCES auth.users(id) DEFAULT NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS blocked_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Add government coat of arms field
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS government_coat_of_arms_url TEXT DEFAULT NULL;

-- Create support tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  organization_id UUID REFERENCES organizations(id),
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  assigned_to UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  resolved_by UUID REFERENCES auth.users(id) DEFAULT NULL
);

-- Create ticket responses table
CREATE TABLE IF NOT EXISTS ticket_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES support_tickets(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  message TEXT NOT NULL,
  is_staff_response BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on support tables
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_responses ENABLE ROW LEVEL SECURITY;

-- RLS policies for support_tickets
CREATE POLICY "Users can view their own tickets"
  ON support_tickets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tickets"
  ON support_tickets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Staff can view all tickets"
  ON support_tickets FOR SELECT
  USING (is_super_admin(auth.uid()) OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Staff can update tickets"
  ON support_tickets FOR UPDATE
  USING (is_super_admin(auth.uid()) OR has_role(auth.uid(), 'admin'));

-- RLS policies for ticket_responses
CREATE POLICY "Users can view responses to their tickets"
  ON ticket_responses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM support_tickets
      WHERE support_tickets.id = ticket_responses.ticket_id
      AND support_tickets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create responses to their tickets"
  ON ticket_responses FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM support_tickets
      WHERE support_tickets.id = ticket_responses.ticket_id
      AND support_tickets.user_id = auth.uid()
    )
  );

CREATE POLICY "Staff can view all responses"
  ON ticket_responses FOR SELECT
  USING (is_super_admin(auth.uid()) OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Staff can create responses"
  ON ticket_responses FOR INSERT
  WITH CHECK (is_super_admin(auth.uid()) OR has_role(auth.uid(), 'admin'));

-- Add subscription expiry notification tracking
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS expiry_notified BOOLEAN DEFAULT false;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS last_notification_date TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Add trigger for updating updated_at on tickets
CREATE OR REPLACE FUNCTION update_ticket_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_support_tickets_updated_at
  BEFORE UPDATE ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_ticket_updated_at();