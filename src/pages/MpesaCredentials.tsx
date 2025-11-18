import Layout from "@/components/layout/Layout";
import { MpesaDarajaCredentials } from "@/components/settings/MpesaDarajaCredentials";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Key, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const MpesaCredentials = () => {
  const { user, isAdmin, isSuperAdmin } = useAuth();

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Key className="h-8 w-8" />
              MPESA Daraja API Credentials
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your MPESA Daraja API credentials for payment processing
            </p>
          </div>
          {(isAdmin || isSuperAdmin) && (
            <Badge variant="default" className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              {isSuperAdmin ? 'Super Admin' : 'Admin'}
            </Badge>
          )}
        </div>

        {user ? (
          <MpesaDarajaCredentials userId={user.id} />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Authentication Required</CardTitle>
              <CardDescription>
                Please log in to manage your MPESA credentials
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                You need to be authenticated to access this page.
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>About MPESA Daraja Credentials</CardTitle>
            <CardDescription>
              Understanding your MPESA API credentials
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">What are these credentials?</h4>
              <p className="text-sm text-muted-foreground">
                MPESA Daraja API credentials are required to process STK push payments. Each shortcode (Till/Paybill) 
                needs its own set of credentials from the Safaricom Developer Portal.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">How to get your credentials:</h4>
              <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-1">
                <li>Visit the <a href="https://developer.safaricom.co.ke" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Safaricom Developer Portal</a></li>
                <li>Create an app or select your existing app</li>
                <li>Copy your Consumer Key and Consumer Secret</li>
                <li>Get your Lipa Na M-PESA Online Passkey from the credentials section</li>
                <li>Add them here for each shortcode you want to use</li>
              </ol>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Security Notice:</h4>
              <p className="text-sm text-muted-foreground">
                Your credentials are encrypted and stored securely. Never share your Consumer Secret or Passkey with anyone.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default MpesaCredentials;
