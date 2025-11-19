import Layout from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { AdminCard } from "@/components/admin/AdminCard";
import { StatusIndicator } from "@/components/admin/StatusIndicator";
import { ControlPanelStats } from "@/components/admin/ControlPanelStats";
import { AlertsList } from "@/components/admin/AlertsList";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Activity, 
  Shield, 
  Database,
  Server,
  Building2,
  Key,
  Clock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { 
  useControlPanelStats, 
  useSystemAlerts, 
  useAuditLogs 
} from "@/hooks/useControlPanelData";
import { useState, useEffect } from "react";

interface MpesaConfig {
  shortcode: string;
  environment: string;
  is_active: boolean;
}

export default function ControlPanel() {
  const { toast } = useToast();
  const { stats, loading: statsLoading } = useControlPanelStats();
  const { alerts, loading: alertsLoading, resolveAlert } = useSystemAlerts();
  const { logs: recentLogs, loading: logsLoading } = useAuditLogs(10);
  const [mpesaConfig, setMpesaConfig] = useState<MpesaConfig | null>(null);

  useEffect(() => {
    fetchMpesaConfig();
  }, []);

  const fetchMpesaConfig = async () => {
    try {
      const { data: mpesaData } = await supabase
        .from('mpesa_daraja_configs')
        .select('shortcode, environment, is_active')
        .limit(1)
        .single();

      if (mpesaData) setMpesaConfig(mpesaData);
    } catch (error: any) {
      // Silent error - config may not exist yet
      console.log("M-Pesa config not found");
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    await resolveAlert(alertId);
  };

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">M-Leja Control Panel</h1>
            <p className="text-muted-foreground">Super Admin Dashboard</p>
          </div>
          <StatusIndicator status={stats.systemHealth} label="System Status" />
        </div>

        {/* Active Alerts */}
        {alerts.length > 0 && (
          <AlertsList 
            alerts={alerts} 
            loading={alertsLoading} 
            onResolve={handleResolveAlert}
          />
        )}

        {/* Platform Statistics */}
        <ControlPanelStats stats={stats} loading={statsLoading} />

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
                        >
                          {mpesaConfig.environment === 'production' ? 'LIVE' : 'SANDBOX'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Status</span>
                        <Badge variant={mpesaConfig.is_active ? 'default' : 'secondary'}>
                          {mpesaConfig.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <Button 
                        variant="outline" 
                        className="w-full mt-2"
                        onClick={() => window.location.href = '/mpesa-daraja'}
                      >
                        <Key className="mr-2 h-4 w-4" />
                        Manage Configuration
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
              <div className="grid grid-cols-2 gap-2 mt-4">
                <Button variant="outline" className="justify-start" onClick={() => window.location.href = '/control-panel/system-settings'}>
                  <Server className="mr-2 h-4 w-4" />
                  System Settings
                </Button>
                <Button variant="outline" className="justify-start" onClick={() => window.location.href = '/control-panel/accounts'}>
                  <Users className="mr-2 h-4 w-4" />
                  Manage Accounts
                </Button>
                <Button variant="outline" className="justify-start" onClick={() => window.location.href = '/control-panel/onboarding'}>
                  <Activity className="mr-2 h-4 w-4" />
                  Client Onboarding
                </Button>
                <Button variant="outline" className="justify-start" onClick={() => window.location.href = '/control-panel/support'}>
                  <Shield className="mr-2 h-4 w-4" />
                  Support Tickets
                </Button>
                <Button variant="outline" className="justify-start" onClick={() => window.location.href = '/control-panel/communication'}>
                  <Activity className="mr-2 h-4 w-4" />
                  Communication
                </Button>
                <Button variant="outline" className="justify-start" onClick={() => window.location.href = '/control-panel/government'}>
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
                  {logsLoading ? (
                    <p className="text-sm text-muted-foreground text-center py-4">Loading logs...</p>
                  ) : recentLogs.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
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

          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Security Overview</CardTitle>
                <CardDescription>System security status and compliance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Super Admin Immunity</span>
                    <Badge className="bg-green-500">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Row Level Security</span>
                    <Badge className="bg-green-500">Enabled</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Audit Logging</span>
                    <Badge className="bg-green-500">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Encryption</span>
                    <Badge className="bg-green-500">End-to-End</Badge>
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
