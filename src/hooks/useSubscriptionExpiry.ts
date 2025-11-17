import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { differenceInDays } from 'date-fns';

interface SubscriptionStatus {
  isExpired: boolean;
  isExpiringSoon: boolean;
  daysUntilExpiry: number | null;
  tier: string;
  expiresAt: string | null;
}

export const useSubscriptionExpiry = (userId: string | null) => {
  const { toast } = useToast();
  const [status, setStatus] = useState<SubscriptionStatus>({
    isExpired: false,
    isExpiringSoon: false,
    daysUntilExpiry: null,
    tier: 'free_trial',
    expiresAt: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const checkSubscriptionStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('subscriptions')
          .select('tier, expires_at, is_active, expiry_notified')
          .eq('user_id', userId)
          .eq('is_active', true)
          .single();

        if (error) throw error;

        if (!data) {
          setStatus({
            isExpired: true,
            isExpiringSoon: false,
            daysUntilExpiry: null,
            tier: 'free_trial',
            expiresAt: null
          });
          setLoading(false);
          return;
        }

        const now = new Date();
        const expiryDate = data.expires_at ? new Date(data.expires_at) : null;
        
        if (expiryDate) {
          const daysUntilExpiry = differenceInDays(expiryDate, now);
          const isExpired = daysUntilExpiry < 0;
          const isExpiringSoon = daysUntilExpiry <= 7 && daysUntilExpiry >= 0;

          setStatus({
            isExpired,
            isExpiringSoon,
            daysUntilExpiry,
            tier: data.tier,
            expiresAt: data.expires_at
          });

          // Show notifications
          if (isExpired) {
            toast({
              title: "Subscription Expired",
              description: "Your subscription has expired. Please renew to continue using all features.",
              variant: "destructive",
            });

            // Mark subscription as inactive
            await supabase
              .from('subscriptions')
              .update({ is_active: false })
              .eq('user_id', userId);
          } else if (isExpiringSoon && !data.expiry_notified) {
            toast({
              title: "Subscription Expiring Soon",
              description: `Your subscription will expire in ${daysUntilExpiry} days. Please renew to avoid service interruption.`,
              variant: "default",
            });

            // Mark as notified
            await supabase
              .from('subscriptions')
              .update({ 
                expiry_notified: true,
                last_notification_date: new Date().toISOString()
              })
              .eq('user_id', userId);
          }
        } else {
          // No expiry date means lifetime or government tier
          setStatus({
            isExpired: false,
            isExpiringSoon: false,
            daysUntilExpiry: null,
            tier: data.tier,
            expiresAt: null
          });
        }
      } catch (error: any) {
        console.error('Error checking subscription status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSubscriptionStatus();

    // Check every hour
    const interval = setInterval(checkSubscriptionStatus, 3600000);

    return () => clearInterval(interval);
  }, [userId, toast]);

  return { ...status, loading };
};
