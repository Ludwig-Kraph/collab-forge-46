import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Building2, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function GovLanding() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState({
    phone: "",
    password: "",
    governmentLevel: "national"
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        phone: credentials.phone,
        password: credentials.password
      });

      if (error) throw error;

      if (data.user) {
        // Check if user is a government official
        const { data: official, error: officialError } = await supabase
          .from('government_officials')
          .select('*, government_entities(*)')
          .eq('user_id', data.user.id)
          .single();

        if (officialError || !official) {
          toast({
            title: "Access Denied",
            description: "You are not authorized to access the government portal",
            variant: "destructive"
          });
          await supabase.auth.signOut();
          return;
        }

        // Navigate based on entity type
        if (official.government_entities.entity_type === 'national') {
          navigate('/gov/national');
        } else {
          navigate('/gov/county');
        }
      }
    } catch (error: any) {
      toast({
        title: "Authentication Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-4 text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Government Portal</CardTitle>
            <p className="text-sm text-muted-foreground">
              Secure access for government officials
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="governmentLevel">Government Level</Label>
                <Select
                  value={credentials.governmentLevel}
                  onValueChange={(value) => setCredentials({ ...credentials, governmentLevel: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select government level" />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    <SelectItem value="national">
                      <div className="flex items-center">
                        <Building2 className="h-4 w-4 mr-2" />
                        National Government
                      </div>
                    </SelectItem>
                    <SelectItem value="county">
                      <div className="flex items-center">
                        <Building2 className="h-4 w-4 mr-2" />
                        County Government
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="phone">Official Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+254..."
                  value={credentials.phone}
                  onChange={(e) => setCredentials({ ...credentials, phone: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="password">Secure Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                <Lock className="h-4 w-4 mr-2" />
                {loading ? "Authenticating..." : "Secure Login"}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                This portal uses government-grade encryption and multi-factor authentication
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
