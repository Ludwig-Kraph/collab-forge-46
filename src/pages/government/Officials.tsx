import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, Users, Shield, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface GovernmentOfficial {
  id: string;
  user_id: string;
  office_title: string;
  is_super_admin: boolean;
  access_level: number;
  appointed_at: string;
  profile: {
    full_name: string;
    email: string | null;
    phone_number: string;
  };
}

export default function Officials() {
  const { toast } = useToast();
  const [officials, setOfficials] = useState<GovernmentOfficial[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [currentEntityId, setCurrentEntityId] = useState<string | null>(null);

  useEffect(() => {
    fetchOfficials();
  }, []);

  const fetchOfficials = async () => {
    try {
      setLoading(true);
      
      // Get current user's government entity
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: currentOfficial, error: officialError } = await supabase
        .from('government_officials')
        .select('government_entity_id')
        .eq('user_id', user.id)
        .single();

      if (officialError) throw officialError;
      
      setCurrentEntityId(currentOfficial.government_entity_id);

      // Fetch all officials in the same government entity
      const { data: officialsData, error: officialsError } = await supabase
        .from('government_officials')
        .select('*')
        .eq('government_entity_id', currentOfficial.government_entity_id)
        .order('appointed_at', { ascending: false });

      if (officialsError) throw officialsError;

      // Fetch profiles separately
      const userIds = officialsData?.map(o => o.user_id) || [];
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email, phone_number')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      // Combine officials with profiles
      const officialsWithProfiles = officialsData?.map(official => ({
        ...official,
        profile: profilesData?.find(p => p.id === official.user_id) || {
          full_name: 'Unknown',
          email: null,
          phone_number: ''
        }
      })) || [];

      setOfficials(officialsWithProfiles);
    } catch (error: any) {
      console.error("Fetch officials error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load officials",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredOfficials = officials.filter(official => {
    const profile = official.profile as any;
    return (
      official.office_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile?.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile?.phone_number.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const getAccessLevelBadge = (level: number) => {
    if (level >= 5) return { variant: "destructive" as const, label: "Executive" };
    if (level >= 3) return { variant: "default" as const, label: "Senior" };
    return { variant: "secondary" as const, label: "Standard" };
  };

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Government Officials</h1>
            <p className="text-muted-foreground">Manage government entity officials and access levels</p>
          </div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Official
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Government Official</DialogTitle>
                <DialogDescription>
                  Contact your super admin to add new government officials
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search officials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </CardContent>
        </Card>

        {/* Officials List */}
        <div className="grid gap-4">
          {loading ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">Loading officials...</p>
              </CardContent>
            </Card>
          ) : filteredOfficials.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No officials found</p>
              </CardContent>
            </Card>
          ) : (
            filteredOfficials.map((official) => {
              const profile = official.profile as any;
              const accessBadge = getAccessLevelBadge(official.access_level);
              
              return (
                <Card key={official.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{profile?.full_name}</CardTitle>
                          <CardDescription>{official.office_title}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {official.is_super_admin && (
                          <Badge variant="destructive">
                            <Shield className="h-3 w-3 mr-1" />
                            Super Admin
                          </Badge>
                        )}
                        <Badge variant={accessBadge.variant}>
                          Level {official.access_level} - {accessBadge.label}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{profile?.email || profile?.phone_number}</span>
                        <span>•</span>
                        <span>Appointed {formatDistanceToNow(new Date(official.appointed_at), { addSuffix: true })}</span>
                      </div>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </Layout>
  );
}
