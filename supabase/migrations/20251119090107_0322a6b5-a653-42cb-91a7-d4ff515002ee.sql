
-- Remove any demo-related cron jobs if they exist
DO $$ 
DECLARE
  job_id bigint;
BEGIN
  -- Check if cron extension is available
  IF EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'pg_cron'
  ) THEN
    -- Find and unschedule demo data refresh job
    SELECT jobid INTO job_id 
    FROM cron.job 
    WHERE jobname = 'refresh-demo-data-daily'
    LIMIT 1;
    
    IF job_id IS NOT NULL THEN
      PERFORM cron.unschedule(job_id);
      RAISE NOTICE 'Removed demo data refresh cron job';
    END IF;
  END IF;
END $$;
