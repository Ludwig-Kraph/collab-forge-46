import { AlertBanner } from "./AlertBanner";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { AlertCircle } from "lucide-react";

interface Alert {
  id: string;
  title: string;
  message: string;
  severity: "info" | "warning" | "error" | "critical";
  is_resolved: boolean;
  created_at: string;
}

interface AlertsListProps {
  alerts: Alert[];
  loading: boolean;
  onResolve: (alertId: string) => void;
}

export function AlertsList({ alerts, loading, onResolve }: AlertsListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <div className="text-center p-8 space-y-2">
        <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground" />
        <p className="text-muted-foreground">No active alerts</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {alerts.map((alert) => (
        <div key={alert.id} className="relative">
          <AlertBanner
            severity={alert.severity}
            title={alert.title}
            message={alert.message}
          />
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2"
            onClick={() => onResolve(alert.id)}
          >
            Resolve
          </Button>
        </div>
      ))}
    </div>
  );
}
