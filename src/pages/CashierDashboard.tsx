import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { TrendingUp, DollarSign, CheckCircle, XCircle } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface CashierMetrics {
  transactions_count: number;
  total_amount: number;
  successful_transactions: number;
  failed_transactions: number;
}

export default function CashierDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<CashierMetrics>({
    transactions_count: 0,
    total_amount: 0,
    successful_transactions: 0,
    failed_transactions: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCashierMetrics();
  }, [user]);

  const fetchCashierMetrics = async () => {
    if (!user) return;
    
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('cashier_metrics')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setMetrics({
          transactions_count: data.transactions_count,
          total_amount: data.total_amount,
          successful_transactions: data.successful_transactions,
          failed_transactions: data.failed_transactions
        });
      }
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

  const successRate = metrics.transactions_count > 0
    ? ((metrics.successful_transactions / metrics.transactions_count) * 100).toFixed(1)
    : 0;

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">My Dashboard</h1>
          <p className="text-muted-foreground">Today's performance metrics</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.transactions_count}</div>
              <p className="text-xs text-muted-foreground">Processed today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">KES {metrics.total_amount.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Collected today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Successful</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{metrics.successful_transactions}</div>
              <p className="text-xs text-muted-foreground">Success rate: {successRate}%</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Failed</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{metrics.failed_transactions}</div>
              <p className="text-xs text-muted-foreground">Need attention</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Performance Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Average transaction value</span>
                <span className="font-medium">
                  KES {metrics.transactions_count > 0 
                    ? (metrics.total_amount / metrics.transactions_count).toFixed(2) 
                    : '0.00'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Success rate</span>
                <span className="font-medium">{successRate}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Status</span>
                <span className={`font-medium ${parseFloat(successRate as string) >= 90 ? 'text-green-600' : 'text-yellow-600'}`}>
                  {parseFloat(successRate as string) >= 90 ? 'Excellent' : 'Good'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
