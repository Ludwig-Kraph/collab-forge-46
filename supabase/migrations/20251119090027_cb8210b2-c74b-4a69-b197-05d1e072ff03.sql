
-- Fix super admin cache for M-Leja Founder
INSERT INTO super_admin_cache (user_id, is_super_admin)
VALUES ('6ae938d7-f726-4729-bd14-26be5d5926a9', true)
ON CONFLICT (user_id) DO UPDATE SET 
  is_super_admin = true,
  updated_at = now();

-- Verify the cache was updated
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM super_admin_cache WHERE user_id = '6ae938d7-f726-4729-bd14-26be5d5926a9' AND is_super_admin = true) THEN
    RAISE EXCEPTION 'Failed to insert super admin into cache';
  END IF;
END $$;
