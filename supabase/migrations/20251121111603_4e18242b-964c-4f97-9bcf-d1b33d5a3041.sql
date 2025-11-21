-- Fix security warnings from previous migration

-- 1. Fix function search path - recreate with proper search_path
DROP FUNCTION IF EXISTS refresh_dashboard_stats();

CREATE OR REPLACE FUNCTION refresh_dashboard_stats()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY dashboard_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Revoke public access to materialized view (only functions should access it)
REVOKE ALL ON dashboard_stats FROM PUBLIC;
REVOKE ALL ON dashboard_stats FROM anon;
REVOKE ALL ON dashboard_stats FROM authenticated;

-- Grant access only to service role
GRANT SELECT ON dashboard_stats TO service_role;

-- Add comment
COMMENT ON FUNCTION refresh_dashboard_stats() IS 'Refreshes dashboard statistics materialized view. Search path is set to public for security.';