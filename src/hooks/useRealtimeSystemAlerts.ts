import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface SystemAlert {
  id: string;
  title: string;
  message: string;
  severity: string;
  is_resolved: boolean;
  created_at: string;
  resolved_at: string | null;
  resolved_by: string | null;
}

export function useRealtimeSystemAlerts() {
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial fetch
    const fetchAlerts = async () => {
      const { data } = await supabase
        .from('system_alerts')
        .select('*')
        .eq('is_resolved', false)
        .order('created_at', { ascending: false });

      if (data) {
        setAlerts(data as SystemAlert[]);
      }
      setLoading(false);
    };

    fetchAlerts();

    // Set up realtime listener
    const channel: RealtimeChannel = supabase
      .channel('system-alerts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'system_alerts',
        },
        (payload) => {
          console.log('System alert update:', payload);
          
          if (payload.eventType === 'INSERT') {
            setAlerts(prev => [payload.new as SystemAlert, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setAlerts(prev => 
              prev.map(alert => alert.id === payload.new.id ? payload.new as SystemAlert : alert)
            );
          } else if (payload.eventType === 'DELETE') {
            setAlerts(prev => prev.filter(alert => alert.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { alerts, loading };
}
