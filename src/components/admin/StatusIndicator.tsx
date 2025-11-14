import { cn } from "@/lib/utils";
import { Circle } from "lucide-react";

interface StatusIndicatorProps {
  status: "healthy" | "warning" | "error" | "info";
  label: string;
  className?: string;
}

const statusConfig = {
  healthy: {
    color: "text-green-500",
    bg: "bg-green-500/10",
    label: "Healthy"
  },
  warning: {
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
    label: "Warning"
  },
  error: {
    color: "text-red-500",
    bg: "bg-red-500/10",
    label: "Error"
  },
  info: {
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    label: "Info"
  }
};

export const StatusIndicator = ({ status, label, className }: StatusIndicatorProps) => {
  const config = statusConfig[status];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn("p-1 rounded-full", config.bg)}>
        <Circle className={cn("h-2 w-2 fill-current", config.color)} />
      </div>
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
};
