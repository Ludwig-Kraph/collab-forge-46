import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, AlertTriangle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface AlertBannerProps {
  severity: "info" | "warning" | "error" | "critical";
  title: string;
  message: string;
  onDismiss?: () => void;
  actionLabel?: string;
  onAction?: () => void;
}

const severityConfig = {
  info: {
    icon: Info,
    className: "border-blue-500/50 bg-blue-500/10 text-blue-900 dark:text-blue-100"
  },
  warning: {
    icon: AlertTriangle,
    className: "border-yellow-500/50 bg-yellow-500/10 text-yellow-900 dark:text-yellow-100"
  },
  error: {
    icon: AlertCircle,
    className: "border-red-500/50 bg-red-500/10 text-red-900 dark:text-red-100"
  },
  critical: {
    icon: AlertCircle,
    className: "border-red-600/50 bg-red-600/20 text-red-950 dark:text-red-50"
  }
};

export const AlertBanner = ({
  severity,
  title,
  message,
  onDismiss,
  actionLabel,
  onAction
}: AlertBannerProps) => {
  const config = severityConfig[severity];
  const Icon = config.icon;

  return (
    <Alert className={cn(config.className, "relative")}>
      <Icon className="h-4 w-4" />
      <AlertTitle className="flex items-center justify-between">
        {title}
        {onDismiss && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </AlertTitle>
      <AlertDescription className="mt-2">
        {message}
        {actionLabel && onAction && (
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={onAction}
          >
            {actionLabel}
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
};
