import { MetricWidget } from "./MetricWidget";
import { Users, Activity, TrendingUp, Database } from "lucide-react";
import { PlatformStats } from "@/hooks/useControlPanelData";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface ControlPanelStatsProps {
  stats: PlatformStats;
  loading: boolean;
}

export function ControlPanelStats({ stats, loading }: ControlPanelStatsProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center justify-center h-32 border rounded-lg">
            <LoadingSpinner />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <MetricWidget
        title="Total Users"
        value={stats.totalUsers}
        icon={Users}
        trend={undefined}
      />
      <MetricWidget
        title="Active Subscriptions"
        value={stats.activeSubscriptions}
        icon={Activity}
        trend={undefined}
      />
      <MetricWidget
        title="Total Transactions"
        value={stats.totalTransactions}
        icon={TrendingUp}
        trend={undefined}
      />
      <MetricWidget
        title="System Health"
        value={stats.systemHealth === "healthy" ? "Healthy" : stats.systemHealth}
        icon={Database}
        trend={undefined}
      />
    </div>
  );
}
