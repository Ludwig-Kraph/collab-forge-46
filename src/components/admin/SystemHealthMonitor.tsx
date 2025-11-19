import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Database, Server, Shield, Cloud, Zap, CheckCircle, AlertTriangle } from "lucide-react";

interface HealthStatus {
  component: string;
  status: "operational" | "degraded" | "down";
  latency?: number;
  lastChecked: Date;
}

export const SystemHealthMonitor = () => {
  const healthStatuses: HealthStatus[] = [
    {
      component: "Database",
      status: "operational",
      latency: 12,
      lastChecked: new Date()
    },
    {
      component: "Authentication",
      status: "operational",
      latency: 8,
      lastChecked: new Date()
    },
    {
      component: "Edge Functions",
      status: "operational",
      latency: 45,
      lastChecked: new Date()
    },
    {
      component: "Storage",
      status: "operational",
      latency: 23,
      lastChecked: new Date()
    },
    {
      component: "Real-time Sync",
      status: "operational",
      latency: 15,
      lastChecked: new Date()
    }
  ];

  const getIcon = (component: string) => {
    switch (component) {
      case "Database":
        return Database;
      case "Authentication":
        return Shield;
      case "Edge Functions":
        return Zap;
      case "Storage":
        return Cloud;
      case "Real-time Sync":
        return Server;
      default:
        return Server;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "operational":
        return "text-green-600 bg-green-100 dark:bg-green-900/20";
      case "degraded":
        return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20";
      case "down":
        return "text-red-600 bg-red-100 dark:bg-red-900/20";
      default:
        return "text-gray-600 bg-gray-100 dark:bg-gray-900/20";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="h-5 w-5" />
          System Health Monitor
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {healthStatuses.map((item) => {
            const Icon = getIcon(item.component);
            return (
              <div
                key={item.component}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{item.component}</div>
                    {item.latency && (
                      <div className="text-xs text-muted-foreground">
                        {item.latency}ms response time
                      </div>
                    )}
                  </div>
                </div>
                <Badge className={getStatusColor(item.status)}>
                  {item.status === "operational" && (
                    <CheckCircle className="h-3 w-3 mr-1" />
                  )}
                  {item.status === "degraded" && (
                    <AlertTriangle className="h-3 w-3 mr-1" />
                  )}
                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </Badge>
              </div>
            );
          })}
        </div>
        
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Overall Status</span>
            <Badge className="text-green-600 bg-green-100 dark:bg-green-900/20">
              <CheckCircle className="h-3 w-3 mr-1" />
              All Systems Operational
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
