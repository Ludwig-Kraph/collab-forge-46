import { ControlPanelLayout } from "@/components/layout/ControlPanelLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Coins, Plus, Edit, Package, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface PackageFormData {
  name: string;
  description: string;
  token_count: number;
  price: number;
}

const TokenManagement = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PackageFormData>({
    name: '', description: '', token_count: 100, price: 100,
  });

  const { data: packages, isLoading } = useQuery({
    queryKey: ['admin-token-packages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('token_packages')
        .select('*')
        .order('price', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: PackageFormData & { id?: string }) => {
      if (data.id) {
        const { error } = await supabase.from('token_packages').update({
          name: data.name, description: data.description,
          token_count: data.token_count, price: data.price,
        }).eq('id', data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('token_packages').insert({
          name: data.name, description: data.description,
          token_count: data.token_count, price: data.price,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-token-packages'] });
      toast.success(editingId ? 'Package updated' : 'Package created');
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (err: any) => toast.error(err.message),
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from('token_packages').update({ is_active }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-token-packages'] });
      toast.success('Package status updated');
    },
  });

  const resetForm = () => {
    setForm({ name: '', description: '', token_count: 100, price: 100 });
    setEditingId(null);
  };

  const openEdit = (pkg: any) => {
    setForm({ name: pkg.name, description: pkg.description || '', token_count: pkg.token_count, price: pkg.price });
    setEditingId(pkg.id);
    setIsDialogOpen(true);
  };

  const openCreate = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  return (
    <ControlPanelLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Token Management</h1>
            <p className="text-muted-foreground">Configure M-Leja credit packages</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4 mr-2" />
                New Package
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingId ? 'Edit Package' : 'Create Package'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label>Package Name</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Starter Pack" />
                </div>
                <div>
                  <Label>Description</Label>
                  <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief description" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Token Count</Label>
                    <Input type="number" value={form.token_count} onChange={(e) => setForm({ ...form, token_count: parseInt(e.target.value) || 0 })} />
                  </div>
                  <div>
                    <Label>Price (KES)</Label>
                    <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} />
                  </div>
                </div>
                {form.token_count > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Per-token cost: <span className="font-mono font-medium">KES {(form.price / form.token_count).toFixed(2)}</span>
                  </p>
                )}
                <Button
                  className="w-full"
                  disabled={!form.name || form.token_count <= 0 || form.price < 0}
                  onClick={() => saveMutation.mutate({ ...form, id: editingId || undefined })}
                >
                  {editingId ? 'Update' : 'Create'} Package
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="pt-6 flex items-center gap-4">
              <Package className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{packages?.length ?? 0}</p>
                <p className="text-sm text-muted-foreground">Total Packages</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 flex items-center gap-4">
              <Coins className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{packages?.filter(p => p.is_active).length ?? 0}</p>
                <p className="text-sm text-muted-foreground">Active Packages</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 flex items-center gap-4">
              <TrendingUp className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">-</p>
                <p className="text-sm text-muted-foreground">Total Sold</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Package List */}
        {isLoading ? (
          <div className="flex justify-center py-12"><LoadingSpinner /></div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {packages?.map((pkg) => (
              <Card key={pkg.id} className={!pkg.is_active ? 'opacity-60' : ''}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{pkg.name}</CardTitle>
                    <Switch
                      checked={pkg.is_active}
                      onCheckedChange={(checked) => toggleMutation.mutate({ id: pkg.id, is_active: checked })}
                    />
                  </div>
                  {pkg.description && <CardDescription className="text-xs">{pkg.description}</CardDescription>}
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Tokens:</span>
                    <span className="font-mono font-medium">{pkg.token_count.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Price:</span>
                    <span className="font-mono font-medium">KES {pkg.price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Per Token:</span>
                    <Badge variant="secondary" className="text-xs font-mono">
                      KES {(pkg.price / pkg.token_count).toFixed(2)}
                    </Badge>
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => openEdit(pkg)}>
                    <Edit className="h-3 w-3 mr-2" />
                    Edit
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </ControlPanelLayout>
  );
};

export default TokenManagement;
