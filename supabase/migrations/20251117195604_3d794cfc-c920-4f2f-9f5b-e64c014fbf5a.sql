-- Fix function search_path warnings by adding SET search_path to trigger functions
CREATE OR REPLACE FUNCTION update_mpesa_credentials_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;