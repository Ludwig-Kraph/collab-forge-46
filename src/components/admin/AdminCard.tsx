import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminCardProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  value?: string | number;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  children?: React.ReactNode;
}

export const AdminCard = ({
  title,
  description,
  icon: Icon,
  value,
  trend,
  className,
  children
}: AdminCardProps) => {
  return (
    <Card className={cn("hover:shadow-lg transition-shadow", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {description && (
            <CardDescription className="text-xs">{description}</CardDescription>
          )}
        </div>
        {Icon && (
          <Icon className="h-4 w-4 text-muted-foreground" />
        )}
      </CardHeader>
      <CardContent>
        {value !== undefined && (
          <div className="flex items-baseline gap-2">
            <div className="text-2xl font-bold">{value}</div>
            {trend && (
              <span
                className={cn(
                  "text-xs font-medium",
                  trend.isPositive ? "text-green-600" : "text-red-600"
                )}
              >
                {trend.isPositive ? "+" : "-"}
                {Math.abs(trend.value)}%
              </span>
            )}
          </div>
        )}
        {children}
      </CardContent>
    </Card>
  );
};
