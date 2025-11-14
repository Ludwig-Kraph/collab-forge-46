import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Plus, Users, Briefcase } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface Department {
  id: string;
  name: string;
  description?: string;
  department_type: string;
  created_at: string;
}

export default function Departments() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    department_type: "operations"
  });

  useEffect(() => {
    fetchDepartments();
  }, [user]);

  const fetchDepartments = async () => {
    if (!user) return;
    
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (!profile?.organization_id) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDepartments(data || []);
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

  const handleCreateDepartment = async () => {
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
        .from('departments')
        .insert({
          organization_id: profile.organization_id,
          ...formData
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Department created successfully"
      });

      setDialogOpen(false);
      setFormData({
        name: "",
        description: "",
        department_type: "operations"
      });
      fetchDepartments();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getDepartmentIcon = (type: string) => {
    switch (type) {
      case 'customer_care':
        return <Users className="h-5 w-5" />;
      case 'sales':
      case 'finance':
      case 'hr':
      case 'operations':
      default:
        return <Briefcase className="h-5 w-5" />;
    }
  };

  const getDepartmentBadgeVariant = (type: string) => {
    switch (type) {
      case 'customer_care':
        return 'default';
      case 'sales':
        return 'secondary';
      default:
        return 'outline';
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
            <h1 className="text-3xl font-bold">Department Management</h1>
            <p className="text-muted-foreground">Organize your team into departments</p>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Department
          </Button>
        </div>

        {departments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No departments yet. Create your first department.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((department) => (
              <Card key={department.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      {getDepartmentIcon(department.department_type)}
                      <span className="ml-2">{department.name}</span>
                    </div>
                    <Badge variant={getDepartmentBadgeVariant(department.department_type)}>
                      {department.department_type.replace('_', ' ')}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {department.description && (
                    <p className="text-sm text-muted-foreground">{department.description}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Department</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Department Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Customer Care"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Department description..."
                />
              </div>
              <div>
                <Label htmlFor="department_type">Department Type</Label>
                <Select value={formData.department_type} onValueChange={(value) => setFormData({ ...formData, department_type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer_care">Customer Care</SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="hr">Human Resources</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="operations">Operations</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleCreateDepartment} className="w-full">
                Create Department
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
