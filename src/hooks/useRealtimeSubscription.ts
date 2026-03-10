import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface Subscription {
  id: string;
  user_id: string;
  tier: string;
  max_users: number | null;
  max_stk_pushes: number | null;
  used_stk_pushes: number;
  free_stk_pushes_remaining: number | null;
  is_active: boolean;
  expires_at: string | null;
  period: string;
}

export function useRealtimeSubscription(userId: string | undefined) {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const updateTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    // Initial fetch
    const fetchSubscription = async () => {
      const { data } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      if (data) {
        setSubscription(data as Subscription);
      }
      setLoading(false);
    };

    fetchSubscription();

    // Set up realtime listener with throttling (1 second)
    const channel: RealtimeChannel = supabase
      .channel('subscription-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscriptions',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          // Throttle updates to prevent excessive re-renders
          if (updateTimeoutRef.current) {
            clearTimeout(updateTimeoutRef.current);
          }
          
          updateTimeoutRef.current = setTimeout(() => {
            if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
              setSubscription(payload.new as Subscription);
            } else if (payload.eventType === 'DELETE') {
              setSubscription(null);
            }
          }, 1000);
        }
      )
      .subscribe();

    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return { subscription, loading };
}
