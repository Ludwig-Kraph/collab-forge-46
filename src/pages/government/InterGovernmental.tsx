import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Building2, TrendingUp, FileText, Shield } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function InterGovernmental() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [official, setOfficial] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    try {
      const { data: officialData, error } = await supabase
        .from('government_officials')
        .select('*, government_entities(*)')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setOfficial(officialData);
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
          <h1 className="text-3xl font-bold">Inter-Governmental Dashboard</h1>
          <p className="text-muted-foreground">
            Consolidated view across national and county governments
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">National Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">KES 2.1T</div>
              <p className="text-xs text-muted-foreground">Total collected</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">County Revenue</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">KES 450B</div>
              <p className="text-xs text-muted-foreground">Combined counties</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">91%</div>
              <p className="text-xs text-muted-foreground">Across all levels</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="comparison" className="space-y-6">
          <TabsList>
            <TabsTrigger value="comparison">National vs County</TabsTrigger>
            <TabsTrigger value="audit">Audit Trails</TabsTrigger>
            <TabsTrigger value="compliance">Compliance Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="comparison">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">National Government</p>
                      <p className="text-sm text-muted-foreground">Total revenue collected</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">KES 2.1T</p>
                      <Badge variant="default">100% target</Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">County Governments (Combined)</p>
                      <p className="text-sm text-muted-foreground">Total revenue collected</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">KES 450B</p>
                      <Badge variant="secondary">92% target</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audit">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Government-Wide Audit Trail
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Comprehensive audit trail showing all governmental transactions and activities
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compliance">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Monitoring</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { level: 'National', score: 95, status: 'Excellent' },
                    { level: 'Nairobi County', score: 93, status: 'Excellent' },
                    { level: 'Mombasa County', score: 88, status: 'Good' },
                    { level: 'Kisumu County', score: 90, status: 'Excellent' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{item.level}</p>
                        <p className="text-sm text-muted-foreground">Compliance Status</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-green-600">{item.score}%</p>
                        <Badge variant="default">{item.status}</Badge>
                      </div>
                    </div>
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
