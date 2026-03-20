import { useEffect, useState } from 'react';
import { ControlPanelLayout } from '@/components/layout/ControlPanelLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MetricWidget } from '@/components/admin/MetricWidget';
import { StatusIndicator } from '@/components/admin/StatusIndicator';
import { AlertBanner } from '@/components/admin/AlertBanner';
import { SystemHealthMonitor } from '@/components/admin/SystemHealthMonitor';
import { PlatformInsights } from '@/components/admin/PlatformInsights';
import { DashboardSkeleton } from '@/components/ui/dashboard-skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import {
  Users, Activity, Shield, TrendingUp, Clock, Building2,
  AlertTriangle, UserPlus, MessageSquare, Settings,
  Package, Landmark, BarChart3, Globe
} from 'lucide-react';

interface SystemAlert {
  id: string;
  title: string;
  message: string;
  severity: "info" | "warning" | "error" | "critical";
  is_resolved: boolean;
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

export default function ControlPanelCMS() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<PlatformStats>({
    totalUsers: 0, activeSubscriptions: 0, totalTransactions: 0,
    totalRevenue: 0, pendingRegistrations: 0, openTickets: 0,
    systemHealth: "healthy", rbacUsers: 0, governmentEntities: 0
  });
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [usersRes, subsRes, transRes, regRes, ticketsRes, rbacRes, govRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('subscriptions').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('transactions').select('id', { count: 'exact', head: true }),
        supabase.from('registration_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('support_tickets').select('id', { count: 'exact', head: true }).eq('status', 'open'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('is_rbac_user', true),
        supabase.from('government_entities').select('id', { count: 'exact', head: true })
      ]);

      const { data: revenueData } = await supabase
        .from('transactions').select('amount')
        .eq('transaction_type', 'received').eq('status', 'completed');

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

      const { data: alertsData } = await supabase
        .from('system_alerts').select('*')
        .eq('is_resolved', false).order('created_at', { ascending: false }).limit(5);
      if (alertsData) setAlerts(alertsData as SystemAlert[]);
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to load dashboard data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('system_alerts')
        .update({ is_resolved: true, resolved_by: user?.id, resolved_at: new Date().toISOString() })
        .eq('id', alertId);
      if (error) throw error;
      setAlerts(alerts.filter(a => a.id !== alertId));
      toast({ title: "Alert Resolved" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  return (
    <ControlPanelLayout>
      {loading ? (
        <DashboardSkeleton />
      ) : (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <p className="text-sm text-muted-foreground">Platform overview &amp; real-time monitoring</p>
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
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            <MetricWidget title="Total Users" value={stats.totalUsers} icon={Users} trend={{ value: 12, label: "from last month" }} />
            <MetricWidget title="Active Subscriptions" value={stats.activeSubscriptions} icon={Package} trend={{ value: 8, label: "from last month" }} />
            <MetricWidget title="Transactions" value={stats.totalTransactions.toLocaleString()} icon={Activity} trend={{ value: 23, label: "from last week" }} />
            <MetricWidget title="Revenue" value={`KES ${stats.totalRevenue.toLocaleString()}`} icon={TrendingUp} trend={{ value: 22, label: "from last month" }} />
          </div>

          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            <MetricWidget title="RBAC Users" value={stats.rbacUsers} icon={Shield} className="border-primary/20" />
            <MetricWidget title="Gov. Entities" value={stats.governmentEntities} icon={Landmark} className="border-primary/20" />
            <MetricWidget title="Pending Registrations" value={stats.pendingRegistrations} icon={Clock} className="border-orange-500/20" />
            <MetricWidget title="Open Tickets" value={stats.openTickets} icon={AlertTriangle} className="border-yellow-500/20" />
          </div>

          {/* Quick Actions + Health */}
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2 grid-cols-2">
                {[
                  { title: "Onboarding", icon: UserPlus, path: "/control-panel/onboarding", badge: stats.pendingRegistrations },
                  { title: "Support", icon: MessageSquare, path: "/control-panel/support", badge: stats.openTickets },
                  { title: "Subscriptions", icon: Package, path: "/control-panel/subscription-control" },
                  { title: "Accounts", icon: Shield, path: "/control-panel/accounts" },
                  { title: "Diplomatics", icon: Landmark, path: "/control-panel/diplomatics" },
                  { title: "Settings", icon: Settings, path: "/control-panel/system-settings" },
                  { title: "Landing Page", icon: Globe, path: "/control-panel/landing-page-builder" },
                  { title: "Analytics", icon: BarChart3, path: "/control-panel/account/activity" },
                ].map((action) => {
                  const Icon = action.icon;
                  return (
                    <Button
                      key={action.title}
                      variant="outline"
                      size="sm"
                      className="justify-start gap-2 h-auto py-2.5"
                      onClick={() => window.location.href = action.path}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="flex-1 text-left">{action.title}</span>
                      {action.badge ? <Badge variant="destructive" className="text-[10px] h-5">{action.badge}</Badge> : null}
                    </Button>
                  );
                })}
              </CardContent>
            </Card>
            <SystemHealthMonitor />
          </div>

          <PlatformInsights />
        </div>
      )}
    </ControlPanelLayout>
  );
}
