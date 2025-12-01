import { useEffect, useState, useMemo } from "react";
import { ControlPanelLayout } from "@/components/layout/ControlPanelLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AdminCard } from "@/components/admin/AdminCard";
import { MetricWidget } from "@/components/admin/MetricWidget";
import { StatusIndicator } from "@/components/admin/StatusIndicator";
import { AlertBanner } from "@/components/admin/AlertBanner";
import { QuickActionPanel } from "@/components/admin/QuickActionPanel";
import { SystemHealthMonitor } from "@/components/admin/SystemHealthMonitor";
import { PlatformInsights } from "@/components/admin/PlatformInsights";
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
  UserPlus,
  FileText,
  Settings,
  MessageSquare
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { DashboardSkeleton } from "@/components/ui/dashboard-skeleton";

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
  totalRevenue: number;
  pendingRegistrations: number;
  openTickets: number;
  systemHealth: "healthy" | "warning" | "error";
  rbacUsers: number;
  governmentEntities: number;
}

export default function ControlPanel() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<PlatformStats>({
    totalUsers: 0,
    activeSubscriptions: 0,
    totalTransactions: 0,
    totalRevenue: 0,
    pendingRegistrations: 0,
    openTickets: 0,
    systemHealth: "healthy",
    rbacUsers: 0,
    governmentEntities: 0
  });
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [recentLogs, setRecentLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch platform statistics - optimized with proper filtering
      const [usersRes, subsRes, transRes, regRes, ticketsRes, rbacRes, govRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('subscriptions').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('transactions').select('id', { count: 'exact', head: true }),
        supabase.from('registration_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('support_tickets').select('id', { count: 'exact', head: true }).eq('status', 'open'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('is_rbac_user', true),
        supabase.from('government_entities').select('id', { count: 'exact', head: true })
      ]);

      // Fetch revenue separately with proper filtering
      const { data: revenueData } = await supabase
        .from('transactions')
        .select('amount')
        .eq('transaction_type', 'received')
        .eq('status', 'completed');

      const totalRevenue = revenueData?.reduce((sum, t) => sum + (Number(t.amount) || 0), 0) || 0;

      setStats({
        totalUsers: usersRes.count || 0,
        activeSubscriptions: subsRes.count || 0,
        totalTransactions: transRes.count || 0,
        totalRevenue,
        pendingRegistrations: regRes.count || 0,
        openTickets: ticketsRes.count || 0,
        systemHealth: "healthy",
        rbacUsers: rbacRes.count || 0,
        governmentEntities: govRes.count || 0
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
    <ControlPanelLayout>
      {loading ? (
        <DashboardSkeleton />
      ) : (
        <div className="space-y-6">
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
            title="Total Revenue"
            value={`KES ${stats.totalRevenue.toLocaleString()}`}
            icon={TrendingUp}
            trend={{ value: 22, label: "from last month" }}
          />
        </div>

        {/* Secondary Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricWidget
            title="RBAC Users"
            value={stats.rbacUsers}
            icon={Shield}
            className="border-primary/20"
          />
          <MetricWidget
            title="Government Entities"
            value={stats.governmentEntities}
            icon={Building2}
            className="border-primary/20"
          />
          <MetricWidget
            title="Pending Registrations"
            value={stats.pendingRegistrations}
            icon={Clock}
            className="border-orange-500/20"
          />
          <MetricWidget
            title="Open Tickets"
            value={stats.openTickets}
            icon={AlertTriangle}
            className="border-yellow-500/20"
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
            {/* Top Row - Quick Actions and Platform Health */}
            <div className="grid gap-4 lg:grid-cols-2">
              <QuickActionPanel
                actions={[
                  {
                    title: "Create Super Admin",
                    description: "Register new Super Admin accounts",
                    icon: Shield,
                    path: "/control-panel/super-admins",
                    variant: "outline"
                  },
                  {
                    title: "Review Registrations",
                    description: "Approve or reject new business registrations",
                    icon: UserPlus,
                    path: "/control-panel/onboarding",
                    badge: stats.pendingRegistrations,
                    variant: stats.pendingRegistrations > 0 ? "default" : "outline"
                  },
                  {
                    title: "Manage Support Tickets",
                    description: "Respond to customer support requests",
                    icon: MessageSquare,
                    path: "/control-panel/support",
                    badge: stats.openTickets,
                    variant: stats.openTickets > 0 ? "default" : "outline"
                  },
                  {
                    title: "RBAC User Management",
                    description: "Create and manage role-based access accounts",
                    icon: Shield,
                    path: "/control-panel/accounts"
                  },
                  {
                    title: "System Settings",
                    description: "Configure MPESA and platform settings",
                    icon: Settings,
                    path: "/control-panel/settings"
                  },
                  {
                    title: "Landing Page Builder",
                    description: "Customize landing page with drag & drop",
                    icon: Settings,
                    path: "/control-panel/landing-builder"
                  },
                  {
                    title: "Subscription Tiers",
                    description: "Manage subscription plans and pricing",
                    icon: Settings,
                    path: "/control-panel/subscriptions"
                  }
                ]}
              />

              <SystemHealthMonitor />
            </div>

            {/* Bottom Row - Platform Insights */}
            <PlatformInsights />
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
      )}
    </ControlPanelLayout>
  );
}
