import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Plus, MapPin, Building2, TrendingUp } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface Outlet {
  id: string;
  name: string;
  location: string;
  classification: string;
  outlet_type: string;
  county?: string;
  subcounty?: string;
  is_active: boolean;
  created_at: string;
}

export default function Outlets() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    classification: "county",
    outlet_type: "branch",
    county: "",
    subcounty: ""
  });

  useEffect(() => {
    fetchOutlets();
  }, [user]);

  const fetchOutlets = async () => {
    if (!user) return;
    
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (!profile?.organization_id) {
        toast({
          title: "No Organization",
          description: "Please create an organization first",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('outlets')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOutlets(data || []);
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

  const handleCreateOutlet = async () => {
    if (!user) return;

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (!profile?.organization_id) {
        toast({
          title: "Error",
          description: "Organization not found",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('outlets')
        .insert({
          organization_id: profile.organization_id,
          ...formData
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Outlet created successfully"
      });

      setDialogOpen(false);
      setFormData({
        name: "",
        location: "",
        classification: "county",
        outlet_type: "branch",
        county: "",
        subcounty: ""
      });
      fetchOutlets();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Multi-Outlet Management</h1>
            <p className="text-muted-foreground">Manage your business locations</p>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Outlet
          </Button>
        </div>

        {outlets.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No outlets yet. Add your first outlet to get started.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {outlets.map((outlet) => (
              <Card key={outlet.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{outlet.name}</span>
                    <Badge variant={outlet.is_active ? "default" : "secondary"}>
                      {outlet.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{outlet.location}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="capitalize">{outlet.outlet_type}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <TrendingUp className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="capitalize">{outlet.classification}</span>
                    </div>
                    {outlet.county && (
                      <div className="text-sm text-muted-foreground">
                        County: {outlet.county}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Outlet</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Outlet Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Downtown Branch"
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="123 Main Street"
                />
              </div>
              <div>
                <Label htmlFor="outlet_type">Outlet Type</Label>
                <Select value={formData.outlet_type} onValueChange={(value) => setFormData({ ...formData, outlet_type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select outlet type" />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    <SelectItem value="branch">Branch</SelectItem>
                    <SelectItem value="station">Station</SelectItem>
                    <SelectItem value="regional_office">Regional Office</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="classification">Classification</Label>
                <Select value={formData.classification} onValueChange={(value) => setFormData({ ...formData, classification: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select classification" />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    <SelectItem value="national">National</SelectItem>
                    <SelectItem value="regional">Regional</SelectItem>
                    <SelectItem value="county">County</SelectItem>
                    <SelectItem value="subcounty">Subcounty</SelectItem>
                    <SelectItem value="location">Location</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="county">County</Label>
                <Input
                  id="county"
                  value={formData.county}
                  onChange={(e) => setFormData({ ...formData, county: e.target.value })}
                  placeholder="Nairobi"
                />
              </div>
              <div>
                <Label htmlFor="subcounty">Subcounty</Label>
                <Input
                  id="subcounty"
                  value={formData.subcounty}
                  onChange={(e) => setFormData({ ...formData, subcounty: e.target.value })}
                  placeholder="Westlands"
                />
              </div>
              <Button onClick={handleCreateOutlet} className="w-full">
                Create Outlet
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
