-- Add is_recommended column to subscription_tiers table
ALTER TABLE subscription_tiers ADD COLUMN IF NOT EXISTS is_recommended boolean DEFAULT false;

-- Create function to ensure only one tier can be recommended at a time
CREATE OR REPLACE FUNCTION ensure_single_recommended_tier()
RETURNS TRIGGER AS $$
BEGIN
  -- If this tier is being set as recommended, unset all others
  IF NEW.is_recommended = true THEN
    UPDATE subscription_tiers
    SET is_recommended = false
    WHERE id != NEW.id AND is_recommended = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to enforce single recommended tier
DROP TRIGGER IF EXISTS trigger_ensure_single_recommended ON subscription_tiers;
CREATE TRIGGER trigger_ensure_single_recommended
BEFORE INSERT OR UPDATE ON subscription_tiers
FOR EACH ROW
EXECUTE FUNCTION ensure_single_recommended_tier();

-- Add comment for documentation
COMMENT ON COLUMN subscription_tiers.is_recommended IS 'Flag to mark a tier as recommended/popular. Only one tier can be recommended at a time.';
COMMENT ON FUNCTION ensure_single_recommended_tier() IS 'Ensures only one subscription tier can be marked as recommended at any given time.';