import { useEffect, useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Shield, RefreshCw } from 'lucide-react';

export default function DebugAuth() {
  const { user, userRole, isAdmin, isSuperAdmin, loading } = useAuth();
  const [dbRole, setDbRole] = useState<any>(null);
  const [dbProfile, setDbProfile] = useState<any>(null);
  const [rpcResult, setRpcResult] = useState<any>(null);
  const [checking, setChecking] = useState(false);

  const checkDatabase = async () => {
    if (!user) return;
    
    setChecking(true);
    
    try {
      // Check role from database
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      console.log('DB Role query result:', roleData, roleError);
      setDbRole({ data: roleData, error: roleError?.message });

      // Check profile from database
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      console.log('DB Profile query result:', profileData, profileError);
      setDbProfile({ data: profileData, error: profileError?.message });

      // Check RPC function
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('is_super_admin', { _user_id: user.id });
      
      console.log('RPC is_super_admin result:', rpcData, rpcError);
      setRpcResult({ data: rpcData, error: rpcError?.message });

    } catch (error: any) {
      console.error('Error checking database:', error);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    if (user && !loading) {
      checkDatabase();
    }
  }, [user, loading]);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto p-6">
          <p>Loading authentication state...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Authentication Debug</h1>
            <p className="text-muted-foreground">Check your authentication and role status</p>
          </div>
          <Button onClick={checkDatabase} disabled={checking}>
            <RefreshCw className={`mr-2 h-4 w-4 ${checking ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Auth Context State */}
        <Card>
          <CardHeader>
            <CardTitle>Auth Context State</CardTitle>
            <CardDescription>Current state from useAuth() hook</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">User ID:</span>
              <code className="text-xs bg-muted px-2 py-1 rounded">{user?.id || 'Not logged in'}</code>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Phone:</span>
              <code className="text-xs bg-muted px-2 py-1 rounded">{user?.phone || 'N/A'}</code>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">User Role:</span>
              <Badge variant={userRole ? 'default' : 'secondary'}>
                {userRole || 'Not set'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Is Admin:</span>
              <Badge variant={isAdmin ? 'default' : 'secondary'}>
                {isAdmin ? 'Yes' : 'No'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Is Super Admin:</span>
              <Badge variant={isSuperAdmin ? 'default' : 'secondary'} className={isSuperAdmin ? 'bg-primary' : ''}>
                <Shield className="mr-1 h-3 w-3" />
                {isSuperAdmin ? 'Yes' : 'No'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Database Role */}
        <Card>
          <CardHeader>
            <CardTitle>Database Role Query</CardTitle>
            <CardDescription>Direct query to user_roles table</CardDescription>
          </CardHeader>
          <CardContent>
            {dbRole?.error ? (
              <div className="text-destructive text-sm">
                <strong>Error:</strong> {dbRole.error}
              </div>
            ) : dbRole?.data ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Role:</span>
                  <Badge>{dbRole.data.role}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">User ID:</span>
                  <code className="text-xs bg-muted px-2 py-1 rounded">{dbRole.data.user_id}</code>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Created:</span>
                  <span className="text-xs">{new Date(dbRole.data.created_at).toLocaleString()}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No data yet</p>
            )}
          </CardContent>
        </Card>

        {/* Database Profile */}
        <Card>
          <CardHeader>
            <CardTitle>Database Profile Query</CardTitle>
            <CardDescription>Direct query to profiles table</CardDescription>
          </CardHeader>
          <CardContent>
            {dbProfile?.error ? (
              <div className="text-destructive text-sm">
                <strong>Error:</strong> {dbProfile.error}
              </div>
            ) : dbProfile?.data ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Full Name:</span>
                  <span className="text-sm">{dbProfile.data.full_name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Phone:</span>
                  <code className="text-xs bg-muted px-2 py-1 rounded">{dbProfile.data.phone_number}</code>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Is Blocked:</span>
                  <Badge variant={dbProfile.data.is_blocked ? 'destructive' : 'secondary'}>
                    {dbProfile.data.is_blocked ? 'Yes' : 'No'}
                  </Badge>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No data yet</p>
            )}
          </CardContent>
        </Card>

        {/* RPC Function Result */}
        <Card>
          <CardHeader>
            <CardTitle>RPC Function: is_super_admin</CardTitle>
            <CardDescription>Result from database function call</CardDescription>
          </CardHeader>
          <CardContent>
            {rpcResult?.error ? (
              <div className="text-destructive text-sm">
                <strong>Error:</strong> {rpcResult.error}
              </div>
            ) : rpcResult !== null ? (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Result:</span>
                <Badge variant={rpcResult.data ? 'default' : 'secondary'} className={rpcResult.data ? 'bg-primary' : ''}>
                  <Shield className="mr-1 h-3 w-3" />
                  {rpcResult.data ? 'TRUE - Is Super Admin' : 'FALSE - Not Super Admin'}
                </Badge>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No data yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
