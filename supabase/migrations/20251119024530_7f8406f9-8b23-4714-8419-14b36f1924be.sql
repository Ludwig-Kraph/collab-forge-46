-- Fix trigger_lovable_refresh function to have proper search_path
CREATE OR REPLACE FUNCTION public.trigger_lovable_refresh()
RETURNS event_trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM pg_notify('lovable_refresh', 'ok');
END;
$$;