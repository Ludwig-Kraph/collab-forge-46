import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Users, Activity, DollarSign } from "lucide-react";

interface InsightMetric {
  label: string;
  value: string;
  change: number;
  trend: "up" | "down";
  icon: any;
}

export const PlatformInsights = () => {
  const insights: InsightMetric[] = [
    {
      label: "User Growth",
      value: "+245",
      change: 12.5,
      trend: "up",
      icon: Users
    },
    {
      label: "Transaction Volume",
      value: "+1.2K",
      change: 18.2,
      trend: "up",
      icon: Activity
    },
    {
      label: "Revenue Growth",
      value: "+KES 89K",
      change: 22.4,
      trend: "up",
      icon: DollarSign
    }
  ];

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
