import { useState, useEffect } from "react";
import { ControlPanelLayout } from "@/components/layout/ControlPanelLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Key, Server, AlertTriangle, CheckCircle, Save, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import PerformanceMonitor from "@/components/admin/PerformanceMonitor";
import SupabaseConnectionSettings from "@/components/settings/SupabaseConnectionSettings";

export default function SystemSettings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  const [mpesaCredentials, setMpesaCredentials] = useState({
    consumerKey: '',
    consumerSecret: '',
    passkey: '',
    shortcode: ''
  });

  const handleUpdateMpesaCredentials = async () => {
    try {
      setLoading(true);

      // Validate all fields are filled
      if (!mpesaCredentials.consumerKey || !mpesaCredentials.consumerSecret || 
          !mpesaCredentials.passkey || !mpesaCredentials.shortcode) {
        toast({
          title: "Validation Error",
          description: "All MPESA credential fields are required",
          variant: "destructive"
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('update-mpesa-secrets', {
        body: mpesaCredentials
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: "Credentials Update Initiated",
          description: data.message || "Please update the secrets in Supabase Dashboard to complete the process",
        });

        // Clear the form for security
        setMpesaCredentials({
          consumerKey: '',
          consumerSecret: '',
          passkey: '',
          shortcode: ''
        });
      } else {
        throw new Error(data?.error || "Failed to update credentials");
      }

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update MPESA credentials",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    try {
      setTestingConnection(true);
      setConnectionStatus('idle');

      // Test MPESA connection by getting OAuth token
      const { data, error } = await supabase.functions.invoke('test-mpesa-connection');

      if (error) throw error;

      if (data?.success) {
        setConnectionStatus('success');
        toast({
          title: "Connection Successful",
          description: "MPESA Daraja API is configured correctly",
        });
      } else {
        setConnectionStatus('error');
        toast({
          title: "Connection Failed",
          description: data?.error || "Failed to connect to MPESA API",
          variant: "destructive"
        });
      }

    } catch (error: any) {
      setConnectionStatus('error');
      toast({
        title: "Connection Error",
        description: error.message || "Failed to test MPESA connection",
        variant: "destructive"
      });
    } finally {
      setTestingConnection(false);
    }
  };

  return (
    <ControlPanelLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Server className="h-8 w-8" />
            System Settings
          </h1>
          <p className="text-muted-foreground">Manage system-wide configurations and credentials</p>
        </div>

        <Tabs defaultValue="mpesa" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="mpesa">MPESA Credentials</TabsTrigger>
            <TabsTrigger value="daraja">Daraja API Secrets</TabsTrigger>
            <TabsTrigger value="api">API Settings</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="database">Database</TabsTrigger>
            <TabsTrigger value="system">System Config</TabsTrigger>
          </TabsList>

          <TabsContent value="mpesa" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  MPESA Daraja API Credentials
                </CardTitle>
                <CardDescription>
                  Configure system-wide MPESA Daraja API credentials for STK Push functionality
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Security Notice:</strong> MPESA credentials are stored as secure secrets in Supabase.
                    Update them via Supabase Dashboard → Project Settings → Edge Functions → Manage secrets.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="consumerKey">Consumer Key</Label>
                    <Input
                      id="consumerKey"
                      type="password"
                      placeholder="Enter MPESA Consumer Key"
                      value={mpesaCredentials.consumerKey}
                      onChange={(e) => setMpesaCredentials({ ...mpesaCredentials, consumerKey: e.target.value })}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="consumerSecret">Consumer Secret</Label>
                    <Input
                      id="consumerSecret"
                      type="password"
                      placeholder="Enter MPESA Consumer Secret"
                      value={mpesaCredentials.consumerSecret}
                      onChange={(e) => setMpesaCredentials({ ...mpesaCredentials, consumerSecret: e.target.value })}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="passkey">Passkey</Label>
                    <Input
                      id="passkey"
                      type="password"
                      placeholder="Enter MPESA Passkey"
                      value={mpesaCredentials.passkey}
                      onChange={(e) => setMpesaCredentials({ ...mpesaCredentials, passkey: e.target.value })}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="shortcode">Business Shortcode</Label>
                    <Input
                      id="shortcode"
                      placeholder="Enter MPESA Shortcode (e.g., 174379)"
                      value={mpesaCredentials.shortcode}
                      onChange={(e) => setMpesaCredentials({ ...mpesaCredentials, shortcode: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button 
                    onClick={handleUpdateMpesaCredentials}
                    disabled={loading}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {loading ? "Updating..." : "Update Credentials"}
                  </Button>

                  <Button 
                    onClick={handleTestConnection}
                    disabled={testingConnection}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    {connectionStatus === 'success' ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : connectionStatus === 'error' ? (
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                    ) : (
                      <Server className="h-4 w-4" />
                    )}
                    {testingConnection ? "Testing..." : "Test Connection"}
                  </Button>
                </div>

                {connectionStatus !== 'idle' && (
                  <Alert className={connectionStatus === 'success' ? 'border-green-500' : 'border-destructive'}>
                    {connectionStatus === 'success' ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                    )}
                    <AlertDescription>
                      {connectionStatus === 'success' 
                        ? "MPESA API connection is working correctly. All credentials are valid."
                        : "MPESA API connection failed. Please verify your credentials and try again."
                      }
                    </AlertDescription>
                  </Alert>
                )}

                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-2">Current Configuration Status</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Environment</span>
                      <Badge variant="outline">Sandbox</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">API Endpoint</span>
                      <span className="text-sm font-mono">sandbox.safaricom.co.ke</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Setup Instructions</CardTitle>
                <CardDescription>Follow these steps to configure MPESA Daraja API</CardDescription>
              </CardHeader>
              <CardContent>
                <ol className="list-decimal list-inside space-y-3 text-sm">
                  <li>Register on <a href="https://developer.safaricom.co.ke" target="_blank" rel="noopener noreferrer" className="text-primary underline">Safaricom Daraja Portal</a></li>
                  <li>Create a new app to get Consumer Key and Consumer Secret</li>
                  <li>Get your STK Push Passkey from the app credentials</li>
                  <li>Note your Business Shortcode (Till/Paybill number)</li>
                  <li>Update the secrets in Supabase Dashboard:
                    <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                      <li><code className="text-xs bg-muted px-1 py-0.5 rounded">MPESA_CONSUMER_KEY</code></li>
                      <li><code className="text-xs bg-muted px-1 py-0.5 rounded">MPESA_CONSUMER_SECRET</code></li>
                      <li><code className="text-xs bg-muted px-1 py-0.5 rounded">MPESA_PASSKEY</code></li>
                      <li><code className="text-xs bg-muted px-1 py-0.5 rounded">MPESA_SHORTCODE</code></li>
                    </ul>
                  </li>
                  <li>Configure callback URL in Daraja Portal: <code className="text-xs bg-muted px-1 py-0.5 rounded">{window.location.origin}/mpesa/callback</code></li>
                  <li>Test the connection using the button above</li>
                </ol>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Daraja API Secrets Tab */}
          <TabsContent value="daraja">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  M-Pesa Daraja API Secrets
                </CardTitle>
                <CardDescription>
                  Update MPESA Daraja API secrets from Sandbox to Live environment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Important:</strong> These credentials are highly sensitive. After updating, 
                    you must manually update the secrets in Supabase Dashboard under Edge Functions → Secrets.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="daraja-consumer-key">Consumer Key</Label>
                    <Input
                      id="daraja-consumer-key"
                      type="password"
                      placeholder="Enter MPESA Consumer Key"
                      value={mpesaCredentials.consumerKey}
                      onChange={(e) => setMpesaCredentials({ ...mpesaCredentials, consumerKey: e.target.value })}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="daraja-consumer-secret">Consumer Secret</Label>
                    <Input
                      id="daraja-consumer-secret"
                      type="password"
                      placeholder="Enter MPESA Consumer Secret"
                      value={mpesaCredentials.consumerSecret}
                      onChange={(e) => setMpesaCredentials({ ...mpesaCredentials, consumerSecret: e.target.value })}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="daraja-passkey">Passkey</Label>
                    <Input
                      id="daraja-passkey"
                      type="password"
                      placeholder="Enter MPESA Passkey"
                      value={mpesaCredentials.passkey}
                      onChange={(e) => setMpesaCredentials({ ...mpesaCredentials, passkey: e.target.value })}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="daraja-shortcode">Shortcode</Label>
                    <Input
                      id="daraja-shortcode"
                      placeholder="Enter MPESA Shortcode"
                      value={mpesaCredentials.shortcode}
                      onChange={(e) => setMpesaCredentials({ ...mpesaCredentials, shortcode: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button 
                    onClick={handleUpdateMpesaCredentials} 
                    disabled={loading}
                    className="gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {loading ? "Updating..." : "Update Secrets"}
                  </Button>
                </div>

                <Alert>
                  <AlertDescription>
                    <strong>Next Steps:</strong>
                    <ol className="mt-2 space-y-1 list-decimal list-inside">
                      <li>Go to Supabase Dashboard → Project Settings → Edge Functions</li>
                      <li>Update the following secrets with your new credentials:</li>
                      <ul className="ml-6 mt-1 space-y-1 list-disc list-inside text-sm">
                        <li><code className="bg-muted px-1 rounded">MPESA_CONSUMER_KEY</code></li>
                        <li><code className="bg-muted px-1 rounded">MPESA_CONSUMER_SECRET</code></li>
                        <li><code className="bg-muted px-1 rounded">MPESA_PASSKEY</code></li>
                        <li><code className="bg-muted px-1 rounded">MPESA_SHORTCODE</code></li>
                      </ul>
                      <li>Redeploy your edge functions to use the new credentials</li>
                    </ol>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="api">
            <Card>
              <CardHeader>
                <CardTitle>API Settings</CardTitle>
                <CardDescription>Configure API rate limits and access controls</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">API settings coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance">
            <PerformanceMonitor />
          </TabsContent>

          <TabsContent value="database">
            <SupabaseConnectionSettings />
          </TabsContent>

          <TabsContent value="system">
            <Card>
              <CardHeader>
                <CardTitle>System Configuration</CardTitle>
                <CardDescription>General system settings and preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">System configuration coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ControlPanelLayout>
  );
}
