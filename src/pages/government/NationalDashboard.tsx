import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Building2, DollarSign, MapPin, TrendingUp, Users, FileText } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface GovernmentEntity {
  id: string;
  entity_name: string;
  entity_type: string;
  county_name?: string;
  is_active: boolean;
}

interface RevenueData {
  total_revenue: number;
  total_expenditure: number;
  compliance_score: number;
}

export default function NationalDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [official, setOfficial] = useState<any>(null);
  const [counties, setCounties] = useState<GovernmentEntity[]>([]);
  const [nationalRevenue, setNationalRevenue] = useState<RevenueData>({
    total_revenue: 0,
    total_expenditure: 0,
    compliance_score: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      // Fetch official profile
      const { data: officialData, error: officialError } = await supabase
        .from('government_officials')
        .select('*, government_entities(*)')
        .eq('user_id', user.id)
        .single();

      if (officialError) throw officialError;
      setOfficial(officialData);

      // Fetch all county entities
      const { data: countiesData, error: countiesError } = await supabase
        .from('government_entities')
        .select('*')
        .eq('entity_type', 'county')
        .eq('is_active', true)
        .order('entity_name');

      if (countiesError) throw countiesError;
      setCounties(countiesData || []);

      // Fetch aggregated national revenue data
      const { data: revenueData, error: revenueError } = await supabase
        .from('government_revenue_streams')
        .select('collected_amount')
        .eq('fiscal_year', new Date().getFullYear().toString());

      if (revenueError) throw revenueError;

      const totalRevenue = revenueData?.reduce((sum, item) => sum + Number(item.collected_amount), 0) || 0;
      setNationalRevenue({
        total_revenue: totalRevenue,
        total_expenditure: totalRevenue * 0.85, // Example calculation
        compliance_score: 92
      });
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

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">National Government Dashboard</h1>
              <p className="text-muted-foreground">
                {official?.office_title} • {official?.government_entities?.entity_name}
              </p>
            </div>
            <Badge variant="default" className="text-lg px-4 py-2">
              <Building2 className="h-5 w-5 mr-2" />
              National Level
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">National Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                KES {(nationalRevenue.total_revenue / 1000000000).toFixed(2)}B
              </div>
              <p className="text-xs text-muted-foreground">Fiscal Year {new Date().getFullYear()}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Counties</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{counties.length}</div>
              <p className="text-xs text-muted-foreground">County governments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {nationalRevenue.compliance_score}%
              </div>
              <p className="text-xs text-muted-foreground">Across all counties</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Government Officials</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">247</div>
              <p className="text-xs text-muted-foreground">Across ministries</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="counties" className="space-y-6">
          <TabsList>
            <TabsTrigger value="counties">County Overview</TabsTrigger>
            <TabsTrigger value="ministries">Ministries</TabsTrigger>
            <TabsTrigger value="reports">Audit Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="counties">
            <Card>
              <CardHeader>
                <CardTitle>County Government Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {counties.map((county) => (
                    <Card key={county.id}>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center justify-between">
                          <span>{county.entity_name}</span>
                          <Badge variant={county.is_active ? "default" : "secondary"}>
                            {county.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Revenue:</span>
                            <span className="font-medium">KES 2.5B</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Compliance:</span>
                            <span className="font-medium text-green-600">94%</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ministries">
            <Card>
              <CardHeader>
                <CardTitle>Ministry Access</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['Finance', 'Health', 'Education', 'Infrastructure', 'Agriculture', 'Interior'].map((ministry) => (
                    <Card key={ministry}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Building2 className="h-5 w-5 mr-2 text-primary" />
                            <span className="font-medium">Ministry of {ministry}</span>
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

          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Audit & Compliance Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { title: 'Q4 2024 National Audit Report', date: '2024-12-01', status: 'Published' },
                    { title: 'County Revenue Analysis 2024', date: '2024-11-15', status: 'Published' },
                    { title: 'Q3 2024 Compliance Report', date: '2024-09-30', status: 'Published' }
                  ].map((report, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{report.title}</p>
                            <p className="text-sm text-muted-foreground">{report.date}</p>
                          </div>
                          <Badge variant="secondary">{report.status}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
