-- Create audit log table for comprehensive activity tracking
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  changes jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Super admins can view all audit logs
CREATE POLICY "Super admins can view all audit logs"
  ON public.audit_logs
  FOR SELECT
  USING (is_super_admin(auth.uid()));

-- System can insert audit logs
CREATE POLICY "System can insert audit logs"
  ON public.audit_logs
  FOR INSERT
  WITH CHECK (true);

-- Prevent audit log updates and deletions (immutable)
CREATE POLICY "Prevent audit log updates"
  ON public.audit_logs
  FOR UPDATE
  USING (false);

CREATE POLICY "Prevent audit log deletions"
  ON public.audit_logs
  FOR DELETE
  USING (false);

-- Create index for faster queries
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX idx_audit_logs_entity_type ON public.audit_logs(entity_type);

-- Create system alerts table
CREATE TABLE IF NOT EXISTS public.system_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message text NOT NULL,
  severity text NOT NULL DEFAULT 'info',
  is_resolved boolean NOT NULL DEFAULT false,
  resolved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  resolved_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT valid_severity CHECK (severity IN ('info', 'warning', 'error', 'critical'))
);

-- Enable RLS on system_alerts
ALTER TABLE public.system_alerts ENABLE ROW LEVEL SECURITY;

-- Super admins can view all alerts
CREATE POLICY "Super admins can view all alerts"
  ON public.system_alerts
  FOR SELECT
  USING (is_super_admin(auth.uid()));

-- Super admins can create alerts
CREATE POLICY "Super admins can create alerts"
  ON public.system_alerts
  FOR INSERT
  WITH CHECK (is_super_admin(auth.uid()));

-- Super admins can update alerts
CREATE POLICY "Super admins can update alerts"
  ON public.system_alerts
  FOR UPDATE
  USING (is_super_admin(auth.uid()));

-- System can insert alerts
CREATE POLICY "System can insert alerts"
  ON public.system_alerts
  FOR INSERT
  WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_system_alerts_created_at ON public.system_alerts(created_at DESC);
CREATE INDEX idx_system_alerts_severity ON public.system_alerts(severity);
CREATE INDEX idx_system_alerts_is_resolved ON public.system_alerts(is_resolved);

-- Function to log audit events
CREATE OR REPLACE FUNCTION public.log_audit_event(
  _action text,
  _entity_type text,
  _entity_id uuid DEFAULT NULL,
  _changes jsonb DEFAULT NULL,
  _ip_address inet DEFAULT NULL,
  _user_agent text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _log_id uuid;
BEGIN
  INSERT INTO public.audit_logs (
    user_id,
    action,
    entity_type,
    entity_id,
    changes,
    ip_address,
    user_agent
  )
  VALUES (
    auth.uid(),
    _action,
    _entity_type,
    _entity_id,
    _changes,
    _ip_address,
    _user_agent
  )
  RETURNING id INTO _log_id;
  
  RETURN _log_id;
END;
$$;