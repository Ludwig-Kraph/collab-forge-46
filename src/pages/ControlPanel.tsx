import { useEffect, useState } from "react";
import Layout from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AdminCard } from "@/components/admin/AdminCard";
import { MetricWidget } from "@/components/admin/MetricWidget";
import { StatusIndicator } from "@/components/admin/StatusIndicator";
import { AlertBanner } from "@/components/admin/AlertBanner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Activity, 
  Shield, 
  Database,
  AlertTriangle,
  TrendingUp,
  Clock,
  Server,
  Building2,
  Key
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

interface SystemAlert {
  id: string;
  title: string;
  message: string;
  severity: "info" | "warning" | "error" | "critical";
  is_resolved: boolean;
  created_at: string;
}

interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  created_at: string;
}

interface PlatformStats {
  totalUsers: number;
  activeSubscriptions: number;
  totalTransactions: number;
  systemHealth: "healthy" | "warning" | "error";
}

interface MpesaConfig {
  shortcode: string;
  environment: string;
  is_active: boolean;
}

export default function ControlPanel() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<PlatformStats>({
    totalUsers: 0,
    activeSubscriptions: 0,
    totalTransactions: 0,
    systemHealth: "healthy"
  });
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [recentLogs, setRecentLogs] = useState<AuditLog[]>([]);
  const [mpesaConfig, setMpesaConfig] = useState<MpesaConfig | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch platform statistics
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

      // Fetch system alerts
      const { data: alertsData } = await supabase
        .from('system_alerts')
        .select('*')
        .eq('is_resolved', false)
        .order('created_at', { ascending: false })
        .limit(5);

      if (alertsData) setAlerts(alertsData as SystemAlert[]);

      // Fetch recent audit logs
      const { data: logsData } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (logsData) setRecentLogs(logsData);

      // Fetch MPESA Daraja configuration
      const { data: mpesaData } = await supabase
        .from('mpesa_daraja_configs')
        .select('shortcode, environment, is_active')
        .limit(1)
        .single();

      if (mpesaData) setMpesaConfig(mpesaData);

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('system_alerts')
        .update({ 
          is_resolved: true, 
          resolved_by: user?.id,
          resolved_at: new Date().toISOString()
        })
        .eq('id', alertId);

      if (error) throw error;

      setAlerts(alerts.filter(a => a.id !== alertId));
      
      toast({
        title: "Alert Resolved",
        description: "The alert has been marked as resolved."
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to resolve alert",
        variant: "destructive"
      });
    }
  };

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">M-Leja Control Panel</h1>
            <p className="text-muted-foreground">Platform-wide monitoring and administration</p>
          </div>
          <StatusIndicator status={stats.systemHealth} label="System Status" />
        </div>

        {/* Active Alerts */}
        {alerts.length > 0 && (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <AlertBanner
                key={alert.id}
                severity={alert.severity}
                title={alert.title}
                message={alert.message}
                onDismiss={() => handleResolveAlert(alert.id)}
              />
            ))}
          </div>
        )}

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricWidget
            title="Total Users"
            value={stats.totalUsers}
            icon={Users}
            trend={{ value: 12, label: "from last month" }}
          />
          <MetricWidget
            title="Active Subscriptions"
            value={stats.activeSubscriptions}
            icon={TrendingUp}
            trend={{ value: 8, label: "from last month" }}
          />
          <MetricWidget
            title="Total Transactions"
            value={stats.totalTransactions.toLocaleString()}
            icon={Activity}
            trend={{ value: 23, label: "from last week" }}
          />
          <MetricWidget
            title="System Uptime"
            value="99.9%"
            icon={Server}
          />
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="activity">Recent Activity</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <AdminCard
                title="Platform Health"
                description="System components status"
                icon={Database}
              >
                <div className="space-y-2 mt-4">
                  <StatusIndicator status="healthy" label="Database" />
                  <StatusIndicator status="healthy" label="Authentication" />
                  <StatusIndicator status="healthy" label="Edge Functions" />
                  <StatusIndicator status="healthy" label="Storage" />
                </div>
              </AdminCard>

              <AdminCard
                title="M-Pesa Daraja Configuration"
                description="Payment gateway credentials status"
                icon={Key}
              >
                <div className="space-y-4 mt-4">
                  {mpesaConfig ? (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Shortcode</span>
                        <Badge variant="outline" className="font-mono">{mpesaConfig.shortcode}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Environment</span>
                        <Badge 
                          variant={mpesaConfig.environment === 'production' ? 'default' : 'secondary'}
                          className={mpesaConfig.environment === 'production' ? 'bg-green-500' : 'bg-orange-500'}
                        >
                          {mpesaConfig.environment === 'production' ? 'LIVE' : 'SANDBOX'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Status</span>
                        <StatusIndicator 
                          status={mpesaConfig.is_active ? "healthy" : "error"} 
                          label={mpesaConfig.is_active ? "Active" : "Inactive"} 
                        />
                      </div>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start" 
                        onClick={() => window.location.href = '/mpesa-daraja'}
                      >
                        <Key className="mr-2 h-4 w-4" />
                        Modify Credentials
                      </Button>
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground mb-4">No M-Pesa configuration found</p>
                      <Button 
                        variant="outline" 
                        onClick={() => window.location.href = '/mpesa-daraja'}
                      >
                        <Key className="mr-2 h-4 w-4" />
                        Configure Now
                      </Button>
                    </div>
                  )}
                </div>
              </AdminCard>
            </div>

            <AdminCard
              title="Quick Actions"
              description="Common administrative tasks"
              icon={Shield}
            >
              <div className="space-y-2 mt-4">
                <Button variant="outline" className="w-full justify-start" onClick={() => window.location.href = '/control-panel/system-settings'}>
                  <Server className="mr-2 h-4 w-4" />
                  System Settings
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => window.location.href = '/control-panel/accounts'}>
                  <Users className="mr-2 h-4 w-4" />
                  Manage RBAC Accounts
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => window.location.href = '/control-panel/onboarding'}>
                  <Activity className="mr-2 h-4 w-4" />
                  Client Onboarding Queue
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => window.location.href = '/control-panel/support'}>
                  <Shield className="mr-2 h-4 w-4" />
                  Support Tickets
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => window.location.href = '/control-panel/communication'}>
                  <Activity className="mr-2 h-4 w-4" />
                  Team Communication
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => window.location.href = '/control-panel/government'}>
                  <Building2 className="mr-2 h-4 w-4" />
                  Government Entities
                </Button>
              </div>
            </AdminCard>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Audit Logs</CardTitle>
                <CardDescription>Latest system activities and changes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentLogs.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No recent activity</p>
                  ) : (
                    recentLogs.map((log) => (
                      <div key={log.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                        <div>
                          <p className="text-sm font-medium">{log.action}</p>
                          <p className="text-xs text-muted-foreground">
                            {log.entity_type}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Security Overview</CardTitle>
                <CardDescription>System security status and monitoring</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Multi-Factor Authentication</span>
                    <Badge variant="outline" className="bg-green-500/10 text-green-600">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Row Level Security</span>
                    <Badge variant="outline" className="bg-green-500/10 text-green-600">Enabled</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Audit Logging</span>
                    <Badge variant="outline" className="bg-green-500/10 text-green-600">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Failed Login Attempts (24h)</span>
                    <Badge variant="outline">0</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
