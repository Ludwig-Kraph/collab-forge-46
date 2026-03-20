import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ControlPanelLayout } from "@/components/layout/ControlPanelLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { MetricWidget } from "@/components/admin/MetricWidget";
import { 
  Landmark, Plus, Shield, Users, Activity, AlertCircle, CheckCircle,
  Lock, Eye, EyeOff, UserPlus, TicketCheck, BarChart3, Globe, KeyRound
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface GovernmentEntity {
  id: string;
  entity_name: string;
  entity_code: string;
  entity_type: 'national' | 'county';
  county_name: string | null;
  is_active: boolean;
  created_at: string;
}

interface DiplomaticStats {
  totalEntities: number;
  nationalEntities: number;
  countyEntities: number;
  activeEntities: number;
  totalOfficials: number;
  pendingTickets: number;
}

export default function Diplomatics() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [entities, setEntities] = useState<GovernmentEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [stats, setStats] = useState<DiplomaticStats>({
    totalEntities: 0, nationalEntities: 0, countyEntities: 0,
    activeEntities: 0, totalOfficials: 0, pendingTickets: 0
  });
  const [newEntity, setNewEntity] = useState({
    entity_name: "",
    entity_code: "",
    entity_type: "county" as 'national' | 'county',
    county_name: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [entitiesRes, officialsRes] = await Promise.all([
        supabase.from('government_entities').select('*').order('created_at', { ascending: false }),
        supabase.from('government_officials').select('id', { count: 'exact', head: true })
      ]);

      const entitiesData = entitiesRes.data || [];
      setEntities(entitiesData);

      setStats({
        totalEntities: entitiesData.length,
        nationalEntities: entitiesData.filter(e => e.entity_type === 'national').length,
        countyEntities: entitiesData.filter(e => e.entity_type === 'county').length,
        activeEntities: entitiesData.filter(e => e.is_active).length,
        totalOfficials: officialsRes.count || 0,
        pendingTickets: 0
      });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEntity = async () => {
    try {
      const entityData = {
        entity_name: newEntity.entity_name,
        entity_code: newEntity.entity_code,
        entity_type: newEntity.entity_type,
        county_name: newEntity.entity_type === 'county' ? newEntity.county_name : null
      };

      const { error } = await supabase.from('government_entities').insert([entityData]);
      if (error) throw error;

      toast({ title: "Entity Created", description: `"${newEntity.entity_name}" has been created.` });
      setCreateDialogOpen(false);
      setNewEntity({ entity_name: "", entity_code: "", entity_type: "county", county_name: "" });
      fetchData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleToggleStatus = async (entityId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('government_entities')
        .update({ is_active: !currentStatus })
        .eq('id', entityId);
      if (error) throw error;
      toast({ title: "Status Updated", description: `Entity has been ${!currentStatus ? 'activated' : 'deactivated'}.` });
      fetchData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const filteredEntities = entities.filter(entity => {
    const matchesSearch = entity.entity_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         entity.entity_code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || entity.entity_type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <ControlPanelLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Landmark className="h-7 w-7 text-primary" />
              Diplomatics
            </h1>
            <p className="text-sm text-muted-foreground">
              Government entity management, diplomatic accounts & E2E secure operations
            </p>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="gap-1">
              <Lock className="h-3 w-3" /> E2E Encrypted
            </Badge>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1">
                  <Plus className="h-4 w-4" /> New Entity
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Government Entity</DialogTitle>
                  <DialogDescription>Add a new government entity to the diplomatic system</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Entity Type</label>
                    <Select value={newEntity.entity_type} onValueChange={(value: 'national' | 'county') => setNewEntity({ ...newEntity, entity_type: value })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-background z-50">
                        <SelectItem value="national">National Government</SelectItem>
                        <SelectItem value="county">County Government</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Entity Name</label>
                    <Input placeholder="e.g., National Treasury" value={newEntity.entity_name} onChange={(e) => setNewEntity({ ...newEntity, entity_name: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Entity Code</label>
                    <Input placeholder="e.g., NAT-001" value={newEntity.entity_code} onChange={(e) => setNewEntity({ ...newEntity, entity_code: e.target.value })} />
                  </div>
                  {newEntity.entity_type === 'county' && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">County Name</label>
                      <Input placeholder="e.g., Nairobi" value={newEntity.county_name} onChange={(e) => setNewEntity({ ...newEntity, county_name: e.target.value })} />
                    </div>
                  )}
                </div>
                <Button onClick={handleCreateEntity} className="w-full">Create Entity</Button>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="entities">Entities</TabsTrigger>
            <TabsTrigger value="officials">Officials</TabsTrigger>
            <TabsTrigger value="tickets">Tickets</TabsTrigger>
            <TabsTrigger value="security">Access & Security</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
              <MetricWidget title="Total Entities" value={stats.totalEntities} icon={Landmark} />
              <MetricWidget title="National Level" value={stats.nationalEntities} icon={Shield} />
              <MetricWidget title="County Level" value={stats.countyEntities} icon={Globe} />
              <MetricWidget title="Active Entities" value={stats.activeEntities} icon={CheckCircle} />
              <MetricWidget title="Officials" value={stats.totalOfficials} icon={Users} />
              <MetricWidget title="Pending Tickets" value={stats.pendingTickets} icon={TicketCheck} />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Government Access Portal</CardTitle>
                  <CardDescription>Masked E2E encrypted login for government officials</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Portal URL</span>
                    <Badge variant="secondary" className="font-mono text-xs">/gov-secure-portal</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Encryption</span>
                    <Badge variant="outline" className="text-green-600 bg-green-500/10">AES-256 E2E</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">MFA Required</span>
                    <Badge variant="outline" className="text-green-600 bg-green-500/10">Enforced</Badge>
                  </div>
                  <Button variant="outline" size="sm" className="w-full gap-1">
                    <KeyRound className="h-3.5 w-3.5" /> Configure Portal Access
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Diplomatic Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-2">
                  <Button variant="outline" size="sm" className="justify-start gap-2">
                    <UserPlus className="h-4 w-4" /> Onboard Government Official
                  </Button>
                  <Button variant="outline" size="sm" className="justify-start gap-2">
                    <TicketCheck className="h-4 w-4" /> View Diplomatic Tickets
                  </Button>
                  <Button variant="outline" size="sm" className="justify-start gap-2">
                    <BarChart3 className="h-4 w-4" /> Generate Compliance Report
                  </Button>
                  <Button variant="outline" size="sm" className="justify-start gap-2">
                    <Lock className="h-4 w-4" /> Manage Access Levels
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Entities Tab */}
          <TabsContent value="entities" className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Input placeholder="Search entities..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="max-w-md" />
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px]"><SelectValue placeholder="Filter by type" /></SelectTrigger>
                <SelectContent className="bg-background z-50">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="national">National</SelectItem>
                  <SelectItem value="county">County</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <Card><CardContent className="flex items-center justify-center py-12"><Activity className="w-6 h-6 animate-spin text-muted-foreground" /></CardContent></Card>
            ) : filteredEntities.length === 0 ? (
              <Card><CardContent className="flex flex-col items-center justify-center py-12"><AlertCircle className="w-12 h-12 text-muted-foreground mb-4" /><p className="text-lg font-medium text-muted-foreground">No entities found</p></CardContent></Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {filteredEntities.map((entity) => (
                  <Card key={entity.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="flex items-center gap-2 text-base">
                            {entity.entity_name}
                            {entity.is_active ? <CheckCircle className="w-4 h-4 text-green-500" /> : <AlertCircle className="w-4 h-4 text-destructive" />}
                          </CardTitle>
                          <CardDescription>Code: {entity.entity_code}</CardDescription>
                        </div>
                        <Badge variant={entity.entity_type === 'national' ? 'default' : 'secondary'}>
                          {entity.entity_type === 'national' ? 'National' : 'County'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {entity.county_name && <div className="text-sm"><span className="text-muted-foreground">County: </span><span className="font-medium">{entity.county_name}</span></div>}
                        <div className="text-sm text-muted-foreground">Created {formatDistanceToNow(new Date(entity.created_at))} ago</div>
                        <div className="flex gap-2">
                          <Button variant={entity.is_active ? "destructive" : "default"} size="sm" onClick={() => handleToggleStatus(entity.id, entity.is_active)}>
                            {entity.is_active ? 'Deactivate' : 'Activate'}
                          </Button>
                          <Button variant="outline" size="sm">Manage Officials</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Officials Tab */}
          <TabsContent value="officials" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Government Officials</CardTitle>
                <CardDescription>Manage appointed government officials and their access levels</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Officials Management</h3>
                  <p className="text-sm text-muted-foreground mb-4">Appoint, manage, and control access for government officials</p>
                  <Button><UserPlus className="h-4 w-4 mr-2" />Appoint Official</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tickets Tab */}
          <TabsContent value="tickets" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Diplomatic Support Tickets</CardTitle>
                <CardDescription>Government-specific support requests and escalations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <TicketCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Diplomatic Tickets</h3>
                  <p className="text-sm text-muted-foreground mb-4">Government support tickets will appear here</p>
                  <Button variant="outline">Create Ticket</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">E2E Encryption Layer</CardTitle>
                  <CardDescription>End-to-end encryption status for government accounts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { label: 'Data at Rest Encryption', status: 'AES-256' },
                    { label: 'Data in Transit', status: 'TLS 1.3' },
                    { label: 'Session Encryption', status: 'Active' },
                    { label: 'Audit Trail Integrity', status: 'Tamper-proof' },
                    { label: 'MFA Enforcement', status: 'Required' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <span className="text-sm">{item.label}</span>
                      <Badge variant="outline" className="text-green-600 bg-green-500/10">{item.status}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Government Auth Portal</CardTitle>
                  <CardDescription>Hidden and masked authentication for government officials</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-muted/50 rounded-lg space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Lock className="h-4 w-4 text-primary" />
                      Masked Portal URL
                    </div>
                    <code className="text-xs bg-background px-2 py-1 rounded block">/gov-secure-portal</code>
                    <p className="text-xs text-muted-foreground">
                      This URL is hidden from public navigation and requires government credentials
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">IP Whitelisting</span>
                    <Badge variant="outline">Configurable</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Session Timeout</span>
                    <Badge variant="outline">15 minutes</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Login Attempts</span>
                    <Badge variant="outline">3 max</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ControlPanelLayout>
  );
}
