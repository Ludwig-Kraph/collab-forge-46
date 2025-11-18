import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Eye, EyeOff, Plus, Trash2, Edit2, Key } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

interface MpesaCredential {
  id: string;
  shortcode: string;
  consumer_key: string;
  consumer_secret: string;
  passkey: string;
  environment: string;
  is_active: boolean;
  created_at: string;
}

export const MpesaDarajaCredentials = ({ userId }: { userId: string }) => {
  const [credentials, setCredentials] = useState<MpesaCredential[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    shortcode: '',
    consumer_key: '',
    consumer_secret: '',
    passkey: '',
    environment: 'live' as 'live' | 'sandbox',
  });

  useEffect(() => {
    fetchCredentials();
  }, [userId]);

  const fetchCredentials = async () => {
    const { data, error } = await supabase
      .from('mpesa_credentials')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (data) {
      setCredentials(data);
    }
  };

  const handleSubmit = async () => {
    if (!formData.shortcode || !formData.consumer_key || !formData.consumer_secret || !formData.passkey) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      if (editingId) {
        const { error } = await supabase
          .from('mpesa_credentials')
          .update({
            shortcode: formData.shortcode,
            consumer_key: formData.consumer_key,
            consumer_secret: formData.consumer_secret,
            passkey: formData.passkey,
            environment: formData.environment,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingId);

        if (error) throw error;
        toast.success("Credentials updated successfully");
      } else {
        const { error } = await supabase
          .from('mpesa_credentials')
          .insert({
            user_id: userId,
            shortcode: formData.shortcode,
            consumer_key: formData.consumer_key,
            consumer_secret: formData.consumer_secret,
            passkey: formData.passkey,
            environment: formData.environment,
            is_active: true,
          });

        if (error) throw error;
        toast.success("Credentials added successfully");
      }

      setShowDialog(false);
      setFormData({
        shortcode: '',
        consumer_key: '',
        consumer_secret: '',
        passkey: '',
        environment: 'live',
      });
      setEditingId(null);
      fetchCredentials();
    } catch (error: any) {
      toast.error(error.message || "Failed to save credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (credential: MpesaCredential) => {
    setFormData({
      shortcode: credential.shortcode || '',
      consumer_key: credential.consumer_key || '',
      consumer_secret: credential.consumer_secret || '',
      passkey: credential.passkey || '',
      environment: credential.environment as 'live' | 'sandbox',
    });
    setEditingId(credential.id);
    setShowDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete these credentials?")) return;

    const { error } = await supabase
      .from('mpesa_credentials')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error("Failed to delete credentials");
    } else {
      toast.success("Credentials deleted successfully");
      fetchCredentials();
    }
  };

  const toggleSecret = (id: string) => {
    setShowSecrets(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const maskSecret = (secret: string) => {
    if (!secret) return '';
    return '•'.repeat(Math.min(secret.length, 40));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              MPESA Daraja API Credentials
            </CardTitle>
            <CardDescription>
              Manage your MPESA Daraja API credentials for different shortcodes
            </CardDescription>
          </div>
          <Dialog open={showDialog} onOpenChange={(open) => {
            setShowDialog(open);
            if (!open) {
              setEditingId(null);
              setFormData({
                shortcode: '',
                consumer_key: '',
                consumer_secret: '',
                passkey: '',
                environment: 'live',
              });
            }
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Credentials
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingId ? 'Edit' : 'Add'} MPESA Daraja Credentials
                </DialogTitle>
                <DialogDescription>
                  Enter your MPESA Daraja API credentials from Safaricom Developer Portal
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="environment">Environment</Label>
                  <Select
                    value={formData.environment}
                    onValueChange={(value: 'live' | 'sandbox') =>
                      setFormData({ ...formData, environment: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sandbox">Sandbox (Testing)</SelectItem>
                      <SelectItem value="live">Live (Production)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shortcode">Shortcode *</Label>
                  <Input
                    id="shortcode"
                    placeholder="e.g., 174379, 600100"
                    value={formData.shortcode}
                    onChange={(e) => setFormData({ ...formData, shortcode: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="consumer_key">Consumer Key *</Label>
                  <Input
                    id="consumer_key"
                    placeholder="Your Consumer Key from Daraja Portal"
                    value={formData.consumer_key}
                    onChange={(e) => setFormData({ ...formData, consumer_key: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="consumer_secret">Consumer Secret *</Label>
                  <Input
                    id="consumer_secret"
                    type="password"
                    placeholder="Your Consumer Secret from Daraja Portal"
                    value={formData.consumer_secret}
                    onChange={(e) => setFormData({ ...formData, consumer_secret: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passkey">Passkey *</Label>
                  <Input
                    id="passkey"
                    type="password"
                    placeholder="Your Lipa Na M-PESA Online Passkey"
                    value={formData.passkey}
                    onChange={(e) => setFormData({ ...formData, passkey: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={loading}>
                  {loading ? 'Saving...' : editingId ? 'Update' : 'Add'} Credentials
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {credentials.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Key className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No MPESA Daraja credentials configured yet</p>
            <p className="text-sm mt-1">Add your credentials to start processing payments</p>
          </div>
        ) : (
          <div className="space-y-4">
            {credentials.map((cred) => (
              <div
                key={cred.id}
                className="border rounded-lg p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Shortcode: {cred.shortcode}</span>
                      <Badge variant={cred.environment === 'live' ? 'default' : 'secondary'}>
                        {cred.environment}
                      </Badge>
                      <Badge variant={cred.is_active ? 'default' : 'outline'}>
                        {cred.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Added {new Date(cred.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(cred)}
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(cred.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Consumer Key:</span>
                    <div className="flex items-center gap-2">
                      <code className="text-xs">
                        {showSecrets[cred.id] ? cred.consumer_key : maskSecret(cred.consumer_key || '')}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleSecret(cred.id)}
                      >
                        {showSecrets[cred.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Consumer Secret:</span>
                    <code className="text-xs">
                      {maskSecret(cred.consumer_secret || '')}
                    </code>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Passkey:</span>
                    <code className="text-xs">
                      {maskSecret(cred.passkey || '')}
                    </code>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
