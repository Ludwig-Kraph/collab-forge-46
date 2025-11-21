-- Add show_on_landing field to subscription_tiers table
ALTER TABLE subscription_tiers 
ADD COLUMN IF NOT EXISTS show_on_landing BOOLEAN DEFAULT false;

-- Update existing tiers to show on landing by default
UPDATE subscription_tiers 
SET show_on_landing = true 
WHERE is_active = true;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_subscription_tiers_show_on_landing 
ON subscription_tiers(show_on_landing) 
WHERE show_on_landing = true;