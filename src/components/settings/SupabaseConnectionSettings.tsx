import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Database, Globe } from "lucide-react";

const SupabaseConnectionSettings = () => {
  const [useSelfHosted, setUseSelfHosted] = useState(false);
  const [supabaseUrl, setSupabaseUrl] = useState("");
  const [supabaseAnonKey, setSupabaseAnonKey] = useState("");

  const handleSave = () => {
    if (useSelfHosted && (!supabaseUrl || !supabaseAnonKey)) {
      toast.error("Please provide both Supabase URL and Anon Key");
      return;
    }

    // Store configuration in localStorage
    localStorage.setItem("supabase_use_self_hosted", useSelfHosted.toString());
    if (useSelfHosted) {
      localStorage.setItem("supabase_custom_url", supabaseUrl);
      localStorage.setItem("supabase_custom_anon_key", supabaseAnonKey);
    } else {
      localStorage.removeItem("supabase_custom_url");
      localStorage.removeItem("supabase_custom_anon_key");
    }

    toast.success("Supabase connection settings updated. Please refresh the page.");
  };

  const handleTestConnection = async () => {
    try {
      const testUrl = useSelfHosted ? supabaseUrl : "https://cfuolhkzxsxfovalswhp.supabase.co";
      const response = await fetch(`${testUrl}/rest/v1/`, {
        headers: {
          'apikey': useSelfHosted ? supabaseAnonKey : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmdW9saGt6eHN4Zm92YWxzd2hwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyMzQ5MDUsImV4cCI6MjA3NzgxMDkwNX0.d8LjLPuVyHW8JkvQX17zcpQDQ0VhpbHXXExGI3jGmMo"
        }
      });
      
      if (response.ok) {
        toast.success("Connection successful!");
      } else {
        toast.error("Connection failed. Please check your credentials.");
      }
    } catch (error) {
      toast.error("Connection test failed. Please check your settings.");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Supabase Connection Settings
        </CardTitle>
        <CardDescription>
          Switch between Supabase Cloud and self-hosted Supabase instance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="self-hosted">Use Self-Hosted Supabase</Label>
            <p className="text-sm text-muted-foreground">
              Connect to your own Supabase instance instead of cloud
            </p>
          </div>
          <Switch
            id="self-hosted"
            checked={useSelfHosted}
            onCheckedChange={setUseSelfHosted}
          />
        </div>

        {useSelfHosted && (
          <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Globe className="h-4 w-4" />
              <span>Self-Hosted Configuration</span>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="supabase-url">Supabase URL</Label>
              <Input
                id="supabase-url"
                placeholder="https://your-project.supabase.co"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="supabase-key">Supabase Anon Key</Label>
              <Input
                id="supabase-key"
                type="password"
                placeholder="Your anon/public key"
                value={supabaseAnonKey}
                onChange={(e) => setSupabaseAnonKey(e.target.value)}
              />
            </div>

            <Button 
              variant="outline" 
              onClick={handleTestConnection}
              className="w-full"
            >
              Test Connection
            </Button>
          </div>
        )}

        <Button onClick={handleSave} className="w-full">
          Save Connection Settings
        </Button>
      </CardContent>
    </Card>
  );
};

export default SupabaseConnectionSettings;
