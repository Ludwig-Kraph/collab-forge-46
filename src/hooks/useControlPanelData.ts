import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface PlatformStats {
  totalUsers: number;
  activeSubscriptions: number;
  totalTransactions: number;
  systemHealth: "healthy" | "warning" | "error";
}

export function useControlPanelStats() {
  const { toast } = useToast();
  const [stats, setStats] = useState<PlatformStats>({
    totalUsers: 0,
    activeSubscriptions: 0,
    totalTransactions: 0,
    systemHealth: "healthy"
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      const [usersRes, subsRes, transRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('subscriptions').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('transactions').select('id', { count: 'exact', head: true })
      ]);

      setStats({
        totalUsers: usersRes.count || 0,
        activeSubscriptions: subsRes.count || 0,
        totalTransactions: transRes.count || 0,
        systemHealth: "healthy"
      });
    } catch (error: any) {
      toast({
        title: "Error Loading Stats",
        description: error.message || "Failed to load platform statistics",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return { stats, loading, refresh: fetchStats };
}

export function useSystemAlerts() {
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();

    const channel = supabase
      .channel('system_alerts_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'system_alerts' },
        () => fetchAlerts()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('system_alerts')
        .select('*')
        .eq('is_resolved', false)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setAlerts(data || []);
    } catch (error: any) {
      toast({
        title: "Error Loading Alerts",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resolveAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('system_alerts')
        .update({ 
          is_resolved: true, 
          resolved_at: new Date().toISOString(),
          resolved_by: (await supabase.auth.getUser()).data.user?.id 
        })
        .eq('id', alertId);

      if (error) throw error;

      toast({
        title: "Alert Resolved",
        description: "System alert has been marked as resolved."
      });

      fetchAlerts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return { alerts, loading, refresh: fetchAlerts, resolveAlert };
}

export function useAuditLogs(limit: number = 10) {
  const { toast } = useToast();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, [limit]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      setLogs(data || []);
    } catch (error: any) {
      toast({
        title: "Error Loading Logs",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return { logs, loading, refresh: fetchLogs };
}
