import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ThrottledRealtimeConfig {
  throttleMs?: number;
  batchUpdates?: boolean;
}

/**
 * Throttled real-time subscription hook
 * Reduces update frequency for better performance
 */
export function useThrottledRealtime<T>(
  tableName: string,
  filter: string | null,
  onUpdate: (payload: any) => void,
  config: ThrottledRealtimeConfig = {}
) {
  const { throttleMs = 1000, batchUpdates = true } = config;
  const pendingUpdates = useRef<any[]>([]);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const flushUpdates = useCallback(() => {
    if (pendingUpdates.current.length > 0) {
      if (batchUpdates) {
        onUpdate(pendingUpdates.current);
      } else {
        pendingUpdates.current.forEach(update => onUpdate(update));
      }
      pendingUpdates.current = [];
    }
  }, [onUpdate, batchUpdates]);

  useEffect(() => {
    const channelName = `${tableName}-${filter || 'all'}-throttled`;
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: tableName,
          ...(filter ? { filter } : {}),
        },
        (payload) => {
          pendingUpdates.current.push(payload);
          
          // Clear existing timeout
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
          
          // Schedule flush
          timeoutRef.current = setTimeout(flushUpdates, throttleMs);
        }
      )
      .subscribe();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      flushUpdates(); // Flush remaining updates
      supabase.removeChannel(channel);
    };
  }, [tableName, filter, flushUpdates, throttleMs]);
}
