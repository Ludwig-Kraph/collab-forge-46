import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Users, Activity, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface InsightMetric {
  label: string;
  value: string;
  change: number;
  trend: "up" | "down";
  icon: any;
}

export const PlatformInsights = () => {
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<InsightMetric[]>([]);

  useEffect(() => {
    fetchPlatformInsights();
  }, []);

  const fetchPlatformInsights = async () => {
    try {
      setLoading(true);
      
      // Get current period data (last 30 days)
      const currentDate = new Date();
      const last30Days = new Date(currentDate.getTime() - 30 * 24 * 60 * 60 * 1000);
      const last60Days = new Date(currentDate.getTime() - 60 * 24 * 60 * 60 * 1000);

      // Fetch current period data
      const { data: currentTransactions } = await supabase
        .from('transactions')
        .select('*')
        .gte('created_at', last30Days.toISOString());

      const { data: currentProfiles } = await supabase
        .from('profiles')
        .select('id')
        .gte('created_at', last30Days.toISOString());

      // Fetch previous period data for comparison
      const { data: previousTransactions } = await supabase
        .from('transactions')
        .select('*')
        .gte('created_at', last60Days.toISOString())
        .lt('created_at', last30Days.toISOString());

      const { data: previousProfiles } = await supabase
        .from('profiles')
        .select('id')
        .gte('created_at', last60Days.toISOString())
        .lt('created_at', last30Days.toISOString());

      // Calculate metrics
      const currentUserCount = currentProfiles?.length || 0;
      const previousUserCount = previousProfiles?.length || 0;
      const userGrowthChange = previousUserCount > 0 
        ? ((currentUserCount - previousUserCount) / previousUserCount) * 100 
        : 0;

      const currentTransCount = currentTransactions?.length || 0;
      const previousTransCount = previousTransactions?.length || 0;
      const transGrowthChange = previousTransCount > 0 
        ? ((currentTransCount - previousTransCount) / previousTransCount) * 100 
        : 0;

      const currentRevenue = currentTransactions
        ?.filter(t => t.transaction_type === 'received')
        .reduce((sum, t) => sum + Number(t.amount), 0) || 0;
      const previousRevenue = previousTransactions
        ?.filter(t => t.transaction_type === 'received')
        .reduce((sum, t) => sum + Number(t.amount), 0) || 0;
      const revenueGrowthChange = previousRevenue > 0 
        ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 
        : 0;

      const calculatedInsights: InsightMetric[] = [
        {
          label: "User Growth",
          value: currentUserCount > 0 ? `+${currentUserCount}` : "0",
          change: Math.abs(Math.round(userGrowthChange * 10) / 10),
          trend: userGrowthChange >= 0 ? "up" : "down",
          icon: Users
        },
        {
          label: "Transaction Volume",
          value: currentTransCount > 0 ? `+${currentTransCount}` : "0",
          change: Math.abs(Math.round(transGrowthChange * 10) / 10),
          trend: transGrowthChange >= 0 ? "up" : "down",
          icon: Activity
        },
        {
          label: "Revenue Growth",
          value: currentRevenue > 0 ? `+KES ${Math.round(currentRevenue / 1000)}K` : "KES 0",
          change: Math.abs(Math.round(revenueGrowthChange * 10) / 10),
          trend: revenueGrowthChange >= 0 ? "up" : "down",
          icon: DollarSign
        }
      ];

      setInsights(calculatedInsights);
    } catch (error) {
      console.error('Error fetching platform insights:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Platform Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Platform Insights</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.map((insight, index) => {
            const Icon = insight.icon;
            const TrendIcon = insight.trend === "up" ? TrendingUp : TrendingDown;
            
            return (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">{insight.label}</div>
                    <div className="font-semibold">{insight.value}</div>
                  </div>
                </div>
                <div className={`flex items-center gap-1 text-sm font-medium ${
                  insight.trend === "up" ? "text-green-600" : "text-red-600"
                }`}>
                  <TrendIcon className="h-4 w-4" />
                  {insight.change}%
                </div>
              </div>
            );
          })}
          
          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground text-center">
              Compared to last 30 days
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
