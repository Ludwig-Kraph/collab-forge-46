import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, Plus, Trash2, Key, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { FormField } from '@/components/ui/form-field';

interface MpesaDarajaConfig {
  id: string;
  mpesa_account_id: string;
  consumer_key: string;
  consumer_secret: string;
  passkey: string;
  shortcode: string;
  environment: 'sandbox' | 'production';
  is_active: boolean;
  mpesa_account?: {
    account_name: string;
    account_number: string;
    account_type: string;
  };
}

export default function MpesaDarajaSettings() {
  const { user, isSuperAdmin } = useAuth();
  const [configs, setConfigs] = useState<MpesaDarajaConfig[]>([]);
  const [mpesaAccounts, setMpesaAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [showDialog, setShowDialog] = useState(false);
  const [newConfig, setNewConfig] = useState({
    mpesa_account_id: '',
    consumer_key: '',
    consumer_secret: '',
    passkey: '',
    shortcode: '',
    environment: 'sandbox' as 'sandbox' | 'production',
    is_active: true,
  });

  useEffect(() => {
    fetchConfigs();
    fetchMpesaAccounts();
  }, [user]);

  const fetchConfigs = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('mpesa_daraja_configs')
      .select(`
        *,
        mpesa_account:mpesa_accounts(account_name, account_number, account_type)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to fetch M-Pesa Daraja configurations');
      return;
    }

    setConfigs((data || []).map(item => ({
      ...item,
      environment: item.environment as 'sandbox' | 'production',
    })));
  };

  const fetchMpesaAccounts = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('mpesa_accounts')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (data) {
      setMpesaAccounts(data);
    }
  };

  const handleAddConfig = async () => {
    if (!user || !newConfig.mpesa_account_id || !newConfig.consumer_key || 
        !newConfig.consumer_secret || !newConfig.passkey || !newConfig.shortcode) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from('mpesa_daraja_configs')
      .insert({
        user_id: user.id,
        ...newConfig,
      });

    setLoading(false);

    if (error) {
      toast.error('Failed to add M-Pesa Daraja configuration');
      return;
    }

    toast.success('M-Pesa Daraja configuration added successfully');
    setShowDialog(false);
    setNewConfig({
      mpesa_account_id: '',
      consumer_key: '',
      consumer_secret: '',
      passkey: '',
      shortcode: '',
      environment: 'sandbox',
      is_active: true,
    });
    fetchConfigs();
  };

  const handleToggleActive = async (configId: string, isActive: boolean) => {
    const { error } = await supabase
      .from('mpesa_daraja_configs')
      .update({ is_active: !isActive })
      .eq('id', configId);

    if (error) {
      toast.error('Failed to update configuration status');
      return;
    }

    toast.success(`Configuration ${!isActive ? 'activated' : 'deactivated'}`);
    fetchConfigs();
  };

  const handleDeleteConfig = async (configId: string) => {
    if (!confirm('Are you sure you want to delete this configuration?')) return;

    const { error } = await supabase
      .from('mpesa_daraja_configs')
      .delete()
      .eq('id', configId);

    if (error) {
      toast.error('Failed to delete configuration');
      return;
    }

    toast.success('Configuration deleted successfully');
    fetchConfigs();
  };

  const toggleShowSecret = (configId: string) => {
    setShowSecrets(prev => ({ ...prev, [configId]: !prev[configId] }));
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">M-Pesa Daraja API Settings</h1>
            <p className="text-muted-foreground">
              Manage M-Pesa Daraja API credentials for your payment accounts
            </p>
          </div>
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Configuration
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add M-Pesa Daraja Configuration</DialogTitle>
                <DialogDescription>
                  Configure M-Pesa Daraja API credentials for a specific payment account
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <FormField label="M-Pesa Account" required>
                  <Select
                    value={newConfig.mpesa_account_id}
                    onValueChange={(value) => setNewConfig({ ...newConfig, mpesa_account_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select M-Pesa account" />
                    </SelectTrigger>
                    <SelectContent>
                      {mpesaAccounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.account_name} ({account.account_number})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label="Consumer Key" required>
                  <Input
                    value={newConfig.consumer_key}
                    onChange={(e) => setNewConfig({ ...newConfig, consumer_key: e.target.value })}
                    placeholder="Enter consumer key"
                  />
                </FormField>

                <FormField label="Consumer Secret" required>
                  <Input
                    type="password"
                    value={newConfig.consumer_secret}
                    onChange={(e) => setNewConfig({ ...newConfig, consumer_secret: e.target.value })}
                    placeholder="Enter consumer secret"
                  />
                </FormField>

                <FormField label="Passkey" required>
                  <Input
                    type="password"
                    value={newConfig.passkey}
                    onChange={(e) => setNewConfig({ ...newConfig, passkey: e.target.value })}
                    placeholder="Enter passkey"
                  />
                </FormField>

                <FormField label="Shortcode" required>
                  <Input
                    value={newConfig.shortcode}
                    onChange={(e) => setNewConfig({ ...newConfig, shortcode: e.target.value })}
                    placeholder="Enter shortcode"
                  />
                </FormField>

                <FormField label="Environment" required>
                  <Select
                    value={newConfig.environment}
                    onValueChange={(value: 'sandbox' | 'production') => 
                      setNewConfig({ ...newConfig, environment: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sandbox">Sandbox</SelectItem>
                      <SelectItem value="production">Production</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddConfig} disabled={loading}>
                  {loading ? 'Adding...' : 'Add Configuration'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4">
          {configs.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Key className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  No M-Pesa Daraja configurations found. Add one to get started.
                </p>
              </CardContent>
            </Card>
          ) : (
            configs.map((config) => (
              <Card key={config.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Wallet className="h-5 w-5 text-primary" />
                      <div>
                        <CardTitle className="text-lg">
                          {config.mpesa_account?.account_name || 'Unknown Account'}
                        </CardTitle>
                        <CardDescription>
                          {config.mpesa_account?.account_number} ({config.mpesa_account?.account_type})
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={config.environment === 'production' ? 'default' : 'secondary'}>
                        {config.environment}
                      </Badge>
                      <Badge variant={config.is_active ? 'default' : 'secondary'}>
                        {config.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label className="text-sm text-muted-foreground">Consumer Key</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="flex-1 text-sm bg-muted px-2 py-1 rounded">
                          {showSecrets[config.id] ? config.consumer_key : '••••••••••••••••'}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleShowSecret(config.id)}
                        >
                          {showSecrets[config.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm text-muted-foreground">Shortcode</Label>
                      <code className="block text-sm bg-muted px-2 py-1 rounded mt-1">
                        {config.shortcode}
                      </code>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={config.is_active}
                        onCheckedChange={() => handleToggleActive(config.id, config.is_active)}
                      />
                      <Label className="text-sm">
                        {config.is_active ? 'Active' : 'Inactive'}
                      </Label>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteConfig(config.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
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
