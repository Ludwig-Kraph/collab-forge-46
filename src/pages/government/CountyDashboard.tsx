import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { MapPin, DollarSign, Users, TrendingUp, Building } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface RevenueStream {
  id: string;
  stream_name: string;
  stream_category: string;
  target_amount: number;
  collected_amount: number;
}

export default function CountyDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [official, setOfficial] = useState<any>(null);
  const [revenueStreams, setRevenueStreams] = useState<RevenueStream[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalTarget, setTotalTarget] = useState(0);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      // Fetch official profile and entity
      const { data: officialData, error: officialError } = await supabase
        .from('government_officials')
        .select('*, government_entities(*)')
        .eq('user_id', user.id)
        .single();

      if (officialError) throw officialError;
      setOfficial(officialData);

      // Fetch revenue streams for this county
      const { data: streams, error: streamsError } = await supabase
        .from('government_revenue_streams')
        .select('*')
        .eq('government_entity_id', officialData.government_entity_id)
        .eq('fiscal_year', new Date().getFullYear().toString());

      if (streamsError) throw streamsError;
      
      setRevenueStreams(streams || []);
      const revenue = streams?.reduce((sum, s) => sum + Number(s.collected_amount), 0) || 0;
      const target = streams?.reduce((sum, s) => sum + Number(s.target_amount), 0) || 0;
      setTotalRevenue(revenue);
      setTotalTarget(target);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  const collectionRate = totalTarget > 0 ? ((totalRevenue / totalTarget) * 100).toFixed(1) : '0';

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">County Government Dashboard</h1>
              <p className="text-muted-foreground">
                {official?.office_title} • {official?.government_entities?.entity_name}
              </p>
            </div>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              <MapPin className="h-5 w-5 mr-2" />
              County Level
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Revenue Collected</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                KES {(totalRevenue / 1000000).toFixed(2)}M
              </div>
              <p className="text-xs text-muted-foreground">Fiscal Year {new Date().getFullYear()}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{collectionRate}%</div>
              <p className="text-xs text-muted-foreground">Of target revenue</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Revenue Streams</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{revenueStreams.length}</div>
              <p className="text-xs text-muted-foreground">Active streams</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">County Staff</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156</div>
              <p className="text-xs text-muted-foreground">Government employees</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="revenue" className="space-y-6">
          <TabsList>
            <TabsTrigger value="revenue">Revenue Streams</TabsTrigger>
            <TabsTrigger value="departments">Departments</TabsTrigger>
            <TabsTrigger value="wards">Ward Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="revenue">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Stream Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {revenueStreams.map((stream) => {
                    const percentage = stream.target_amount > 0 
                      ? ((Number(stream.collected_amount) / Number(stream.target_amount)) * 100).toFixed(1)
                      : '0';
                    
                    return (
                      <Card key={stream.id}>
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{stream.stream_name}</span>
                              <Badge variant="outline">{stream.stream_category}</Badge>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Target:</span>
                              <span>KES {Number(stream.target_amount).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Collected:</span>
                              <span className="font-medium text-green-600">
                                KES {Number(stream.collected_amount).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Performance:</span>
                              <span className="font-medium">{percentage}%</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="departments">
            <Card>
              <CardHeader>
                <CardTitle>County Departments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['Finance', 'Health', 'Education', 'Public Works', 'Agriculture', 'Trade'].map((dept) => (
                    <Card key={dept}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{dept}</p>
                            <p className="text-sm text-muted-foreground">Department</p>
                          </div>
                          <Badge>Active</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="wards">
            <Card>
              <CardHeader>
                <CardTitle>Ward-Level Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Ward performance data will be displayed here</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
