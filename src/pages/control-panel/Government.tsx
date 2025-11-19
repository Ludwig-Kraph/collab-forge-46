import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Building2, Plus, Shield, Users, Activity, AlertCircle, CheckCircle } from "lucide-react";
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

export default function Government() {
  const { toast } = useToast();
  const [entities, setEntities] = useState<GovernmentEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newEntity, setNewEntity] = useState({
    entity_name: "",
    entity_code: "",
    entity_type: "county" as 'national' | 'county',
    county_name: ""
  });

  useEffect(() => {
    fetchEntities();
  }, []);

  const fetchEntities = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('government_entities')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEntities(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
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

      const { error } = await supabase
        .from('government_entities')
        .insert([entityData]);

      if (error) throw error;

      toast({
        title: "Entity Created",
        description: `Government entity "${newEntity.entity_name}" has been created successfully.`
      });

      setCreateDialogOpen(false);
      setNewEntity({ entity_name: "", entity_code: "", entity_type: "county", county_name: "" });
      fetchEntities();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleToggleStatus = async (entityId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('government_entities')
        .update({ is_active: !currentStatus })
        .eq('id', entityId);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Entity has been ${!currentStatus ? 'activated' : 'deactivated'}.`
      });

      fetchEntities();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const filteredEntities = entities.filter(entity => {
    const matchesSearch = entity.entity_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         entity.entity_code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || entity.entity_type === typeFilter;
    return matchesSearch && matchesType;
  });

  const getEntityBadgeVariant = (type: string) => {
    switch (type) {
      case 'national': return 'default';
      case 'county': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
              <Building2 className="w-8 h-8 text-primary" />
              Government Entities Management
            </h1>
            <p className="text-muted-foreground">
              Manage national and county government accounts and RBAC access
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={() => window.location.href = '/control-panel/government/officials'}
            >
              <Users className="w-4 h-4" />
              Government Officials
            </Button>
            
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Create Entity
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Government Entity</DialogTitle>
                  <DialogDescription>
                    Add a new government entity to the system
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Entity Type</label>
                    <Select
                      value={newEntity.entity_type}
                      onValueChange={(value: 'national' | 'county') => 
                        setNewEntity({ ...newEntity, entity_type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select entity type" />
                      </SelectTrigger>
                      <SelectContent className="bg-background z-50">
                        <SelectItem value="national">National Government</SelectItem>
                        <SelectItem value="county">County Government</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Entity Name</label>
                    <Input
                      placeholder="e.g., National Treasury, Nairobi County"
                      value={newEntity.entity_name}
                      onChange={(e) => setNewEntity({ ...newEntity, entity_name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Entity Code</label>
                    <Input
                      placeholder="e.g., NAT-001, CTY-047"
                      value={newEntity.entity_code}
                      onChange={(e) => setNewEntity({ ...newEntity, entity_code: e.target.value })}
                    />
                  </div>

                  {newEntity.entity_type === 'county' && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">County Name</label>
                      <Input
                        placeholder="e.g., Nairobi, Mombasa"
                        value={newEntity.county_name}
                        onChange={(e) => setNewEntity({ ...newEntity, county_name: e.target.value })}
                      />
                    </div>
                  )}
                </div>
                <Button onClick={handleCreateEntity} className="w-full">
                  Create Entity
                </Button>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-4">
          <div className="flex-1 min-w-[250px]">
            <Input
              placeholder="Search entities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent className="bg-background z-50">
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="national">National</SelectItem>
              <SelectItem value="county">County</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Entity List */}
        <div className="grid gap-4">
          {loading ? (
            <Card>
              <CardContent className="py-8">
                <p className="text-center text-muted-foreground">Loading entities...</p>
              </CardContent>
            </Card>
          ) : filteredEntities.length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <p className="text-center text-muted-foreground">No government entities found</p>
              </CardContent>
            </Card>
          ) : (
            filteredEntities.map((entity) => (
              <Card key={entity.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Building2 className="w-6 h-6 text-primary" />
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {entity.entity_name}
                          <Badge variant={getEntityBadgeVariant(entity.entity_type)}>
                            {entity.entity_type}
                          </Badge>
                        </CardTitle>
                        <CardDescription>
                          Code: {entity.entity_code}
                          {entity.county_name && ` • ${entity.county_name}`}
                        </CardDescription>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant={entity.is_active ? "default" : "secondary"}>
                        {entity.is_active ? <CheckCircle className="w-3 h-3 mr-1" /> : <AlertCircle className="w-3 h-3 mr-1" />}
                        {entity.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleToggleStatus(entity.id, entity.is_active)}
                      >
                        {entity.is_active ? 'Deactivate' : 'Activate'}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    Created {formatDistanceToNow(new Date(entity.created_at), { addSuffix: true })}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}
