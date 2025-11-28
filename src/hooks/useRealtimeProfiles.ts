import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface Profile {
  id: string;
  full_name: string;
  phone_number: string;
  email: string | null;
  subscription_tier: string | null;
  is_blocked: boolean | null;
  is_verified: boolean | null;
  verification_badge_color: string | null;
  account_status: string | null;
}

export function useRealtimeProfile(userId: string | undefined) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const updateTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    // Initial fetch
    const fetchProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (data) {
        setProfile(data as Profile);
      }
      setLoading(false);
    };

    fetchProfile();

    // Set up realtime listener with throttling (1 second)
    const channel: RealtimeChannel = supabase
      .channel('profile-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${userId}`,
        },
        (payload) => {
          // Throttle updates to prevent excessive re-renders
          if (updateTimeoutRef.current) {
            clearTimeout(updateTimeoutRef.current);
          }
          
          updateTimeoutRef.current = setTimeout(() => {
            if (payload.eventType === 'UPDATE') {
              setProfile(payload.new as Profile);
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

  return { profile, loading };
}
