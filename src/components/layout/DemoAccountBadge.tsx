import { AlertCircle, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

interface DemoAccountBadgeProps {
  variant?: "banner" | "badge";
  isDemoAccount?: boolean;
}

export const DemoAccountBadge = ({ variant = "banner", isDemoAccount = false }: DemoAccountBadgeProps) => {
  if (!isDemoAccount) return null;

  if (variant === "badge") {
    return (
      <Badge 
        variant="outline" 
        className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 gap-1"
      >
        <Info className="h-3 w-3" />
        Demo Account
      </Badge>
    );
  }

  return (
    <Alert className="border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400 mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="text-sm">
        <strong>Demo Account:</strong> You're viewing demonstration data. All transactions and accounts shown are mock data for testing purposes.
      </AlertDescription>
    </Alert>
  );
};
