import { useEffect, useState } from 'react';
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

    // Set up realtime listener
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
          console.log('Profile update:', payload);
          if (payload.eventType === 'UPDATE') {
            setProfile(payload.new as Profile);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return { profile, loading };
}
