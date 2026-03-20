import { useEffect, useState } from 'react';
import { ControlPanelLayout } from '@/components/layout/ControlPanelLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { MetricWidget } from '@/components/admin/MetricWidget';
import { StatusIndicator } from '@/components/admin/StatusIndicator';
import { AlertBanner } from '@/components/admin/AlertBanner';
import { QuickActionPanel } from '@/components/admin/QuickActionPanel';
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
  FileText, Image, Globe, Palette, Layout as LayoutIcon,
  Upload, Eye, Edit3
} from 'lucide-react';

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

export default function ControlPanelCMS() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<PlatformStats>({
    totalUsers: 0, activeSubscriptions: 0, totalTransactions: 0,
    totalRevenue: 0, pendingRegistrations: 0, openTickets: 0,
    systemHealth: "healthy", rbacUsers: 0, governmentEntities: 0
  });
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [recentLogs, setRecentLogs] = useState<AuditLog[]>([]);

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

      const { data: logsData } = await supabase
        .from('audit_logs').select('*')
        .order('created_at', { ascending: false }).limit(10);
      if (logsData) setRecentLogs(logsData);
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
      toast({ title: "Alert Resolved", description: "The alert has been marked as resolved." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to resolve alert", variant: "destructive" });
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
              <h1 className="text-2xl font-bold">M-Leja Super Admin CMS</h1>
              <p className="text-sm text-muted-foreground">Master administration &amp; content management</p>
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

          {/* Main CMS Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="flex-wrap h-auto gap-1">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="media">Media</TabsTrigger>
              <TabsTrigger value="design">Design</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>

            {/* Dashboard Tab */}
            <TabsContent value="dashboard" className="space-y-4">
              {/* Key Metrics */}
              <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                <MetricWidget title="Total Users" value={stats.totalUsers} icon={Users} trend={{ value: 12, label: "from last month" }} />
                <MetricWidget title="Active Subscriptions" value={stats.activeSubscriptions} icon={TrendingUp} trend={{ value: 8, label: "from last month" }} />
                <MetricWidget title="Total Transactions" value={stats.totalTransactions.toLocaleString()} icon={Activity} trend={{ value: 23, label: "from last week" }} />
                <MetricWidget title="Total Revenue" value={`KES ${stats.totalRevenue.toLocaleString()}`} icon={TrendingUp} trend={{ value: 22, label: "from last month" }} />
              </div>

              <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                <MetricWidget title="RBAC Users" value={stats.rbacUsers} icon={Shield} className="border-primary/20" />
                <MetricWidget title="Government Entities" value={stats.governmentEntities} icon={Building2} className="border-primary/20" />
                <MetricWidget title="Pending Registrations" value={stats.pendingRegistrations} icon={Clock} className="border-orange-500/20" />
                <MetricWidget title="Open Tickets" value={stats.openTickets} icon={AlertTriangle} className="border-yellow-500/20" />
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <QuickActionPanel
                  actions={[
                    { title: "Create Super Admin", description: "Register new Super Admin accounts", icon: Shield, path: "/control-panel/super-admin-management", variant: "outline" },
                    { title: "Review Registrations", description: "Approve or reject new registrations", icon: UserPlus, path: "/control-panel/onboarding", badge: stats.pendingRegistrations, variant: stats.pendingRegistrations > 0 ? "default" : "outline" },
                    { title: "Support Tickets", description: "Respond to support requests", icon: MessageSquare, path: "/control-panel/support", badge: stats.openTickets, variant: stats.openTickets > 0 ? "default" : "outline" },
                    { title: "RBAC Management", description: "Manage role-based accounts", icon: Shield, path: "/control-panel/accounts" },
                    { title: "System Settings", description: "Platform configuration", icon: Settings, path: "/control-panel/system-settings" },
                    { title: "Landing Page Builder", description: "Customize landing page", icon: Globe, path: "/control-panel/landing-page-builder" },
                    { title: "Subscription Tiers", description: "Manage plans & pricing", icon: Settings, path: "/control-panel/subscription-control" },
                    { title: "Token Management", description: "Manage token packages", icon: Settings, path: "/control-panel/tokens" },
                  ]}
                />
                <SystemHealthMonitor />
              </div>

              <PlatformInsights />
            </TabsContent>

            {/* Activity Tab */}
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
                            <p className="text-xs text-muted-foreground">{log.entity_type}</p>
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

            {/* Content Tab */}
            <TabsContent value="content" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Content Management</h2>
                  <p className="text-sm text-muted-foreground">Manage pages, posts, and sections</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm"><Eye className="h-4 w-4 mr-2" />Preview</Button>
                  <Button size="sm"><Upload className="h-4 w-4 mr-2" />Publish</Button>
                </div>
              </div>

              <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Pages</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent><div className="text-2xl font-bold">12</div></CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Media Assets</CardTitle>
                    <Image className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent><div className="text-2xl font-bold">248</div></CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Site Visitors</CardTitle>
                    <Globe className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent><div className="text-2xl font-bold">12.5K</div></CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
                    <Settings className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent><div className="text-2xl font-bold">2h</div></CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Pages</CardTitle>
                  <CardDescription>Manage site pages and content</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[
                      { title: 'Landing Page', icon: LayoutIcon, status: 'published', lastEdit: '2h ago' },
                      { title: 'About Us', icon: FileText, status: 'published', lastEdit: '1d ago' },
                      { title: 'Services', icon: FileText, status: 'published', lastEdit: '3d ago' },
                      { title: 'Blog Posts', icon: FileText, status: 'draft', lastEdit: '5d ago' },
                      { title: 'FAQ', icon: FileText, status: 'published', lastEdit: '1w ago' },
                      { title: 'Contact', icon: FileText, status: 'published', lastEdit: '2w ago' },
                    ].map((page, index) => {
                      const Icon = page.icon;
                      return (
                        <Card key={index} className="hover:border-primary/50 transition-colors cursor-pointer">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <Icon className="h-8 w-8 text-primary" />
                              <Badge variant={page.status === 'published' ? 'default' : 'secondary'}>{page.status}</Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            <h3 className="font-semibold">{page.title}</h3>
                            <p className="text-xs text-muted-foreground">Last edited {page.lastEdit}</p>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" className="w-full"><Edit3 className="h-3 w-3 mr-1" />Edit</Button>
                              <Button size="sm" variant="ghost" className="w-full"><Eye className="h-3 w-3 mr-1" />View</Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Media Tab */}
            <TabsContent value="media" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Media Library</CardTitle>
                  <CardDescription>Manage images, videos, and documents</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 border-2 border-dashed rounded-lg">
                    <Image className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Upload Media</h3>
                    <p className="text-sm text-muted-foreground mb-4">Drag and drop files here or click to browse</p>
                    <Button><Upload className="h-4 w-4 mr-2" />Choose Files</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Design Tab */}
            <TabsContent value="design" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Theme &amp; Design</CardTitle>
                  <CardDescription>Customize the look and feel of M-Leja</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <Card className="border-2 border-primary">
                      <CardHeader><Palette className="h-8 w-8 text-primary mb-2" /><CardTitle className="text-base">Current Theme</CardTitle></CardHeader>
                      <CardContent><p className="text-sm text-muted-foreground">Professional Green</p><Button size="sm" variant="outline" className="w-full mt-3">Customize</Button></CardContent>
                    </Card>
                    <Card>
                      <CardHeader><Palette className="h-8 w-8 text-muted-foreground mb-2" /><CardTitle className="text-base">Alternative Theme</CardTitle></CardHeader>
                      <CardContent><p className="text-sm text-muted-foreground">Modern Blue</p><Button size="sm" variant="outline" className="w-full mt-3">Apply</Button></CardContent>
                    </Card>
                    <Card>
                      <CardHeader><Palette className="h-8 w-8 text-muted-foreground mb-2" /><CardTitle className="text-base">Custom Theme</CardTitle></CardHeader>
                      <CardContent><p className="text-sm text-muted-foreground">Create Your Own</p><Button size="sm" variant="outline" className="w-full mt-3">Create</Button></CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Security Overview</CardTitle>
                  <CardDescription>System security status and monitoring</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { label: 'Multi-Factor Authentication', status: 'Active' },
                      { label: 'Row Level Security', status: 'Enabled' },
                      { label: 'Audit Logging', status: 'Active' },
                      { label: 'Data Encryption', status: 'Enabled' },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{item.label}</span>
                        <Badge variant="outline" className="bg-green-500/10 text-green-600">{item.status}</Badge>
                      </div>
                    ))}
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
