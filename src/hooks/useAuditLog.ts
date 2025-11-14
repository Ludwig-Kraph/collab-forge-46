import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AuditLogParams {
  action: string;
  entityType: string;
  entityId?: string;
  changes?: Record<string, any>;
}

export const useAuditLog = () => {
  const { toast } = useToast();

  const logAuditEvent = async ({
    action,
    entityType,
    entityId,
    changes
  }: AuditLogParams) => {
    try {
      const { error } = await supabase.rpc('log_audit_event', {
        _action: action,
        _entity_type: entityType,
        _entity_id: entityId || null,
        _changes: changes ? JSON.stringify(changes) : null,
        _ip_address: null,
        _user_agent: navigator.userAgent
      });

      if (error) {
        console.error('Failed to log audit event:', error);
      }
    } catch (error) {
      console.error('Error logging audit event:', error);
    }
  };

  const fetchAuditLogs = async (filters?: {
    userId?: string;
    action?: string;
    entityType?: string;
    limit?: number;
  }) => {
    try {
      let query = supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.userId) {
        query = query.eq('user_id', filters.userId);
      }
      if (filters?.action) {
        query = query.eq('action', filters.action);
      }
      if (filters?.entityType) {
        query = query.eq('entity_type', filters.entityType);
      }
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch audit logs",
        variant: "destructive"
      });
      return [];
    }
  };

  return {
    logAuditEvent,
    fetchAuditLogs
  };
};
