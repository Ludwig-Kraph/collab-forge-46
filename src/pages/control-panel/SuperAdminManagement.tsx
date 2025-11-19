import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Shield, UserPlus, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function SuperAdminManagement() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { createRBACUser } = useAuth();
  const navigate = useNavigate();

  const handleCreateSuperAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate inputs
      if (!email || !password || !fullName || !phoneNumber) {
        toast({
          title: "Validation Error",
          description: "All fields are required",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Validate password strength
      if (password.length < 8) {
        toast({
          title: "Weak Password",
          description: "Password must be at least 8 characters long",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Create Super Admin user
      const { error } = await createRBACUser(
        email,
        password,
        fullName,
        "super_admin",
        "control_panel",
        undefined,
        "super_admin"
      );

      if (error) {
        throw error;
      }

      toast({
        title: "Super Admin Created",
        description: `New Super Admin account created successfully for ${fullName}`,
      });

      // Reset form
      setEmail("");
      setPassword("");
      setFullName("");
      setPhoneNumber("");
    } catch (error: any) {
      console.error("Error creating Super Admin:", error);
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create Super Admin account",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto p-6 max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Shield className="h-8 w-8 text-primary" />
              Super Admin Management
            </h1>
            <p className="text-muted-foreground mt-2">
              Create new Super Admin accounts for the M-Leja Control Panel
            </p>
          </div>
        </div>

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Super Admin accounts have complete control over the M-Leja platform. Only create these accounts for trusted individuals who will manage the Control Panel system.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Create New Super Admin
            </CardTitle>
            <CardDescription>
              Register a new Super Admin account with full Control Panel privileges
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateSuperAdmin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@mleja.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number *</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="254712345678"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
                <p className="text-sm text-muted-foreground">
                  Must be at least 8 characters long
                </p>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create Super Admin Account"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/control-panel")}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Super Admin Privileges</CardTitle>
            <CardDescription>
              What Super Admin accounts can do
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-primary mt-0.5" />
                <span>Full access to all Control Panel features</span>
              </li>
              <li className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-primary mt-0.5" />
                <span>Create and manage all RBAC accounts</span>
              </li>
              <li className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-primary mt-0.5" />
                <span>Review and approve registration requests</span>
              </li>
              <li className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-primary mt-0.5" />
                <span>Access system settings and configurations</span>
              </li>
              <li className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-primary mt-0.5" />
                <span>View all audit logs and security events</span>
              </li>
              <li className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-primary mt-0.5" />
                <span>Cannot be blocked or suspended</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
