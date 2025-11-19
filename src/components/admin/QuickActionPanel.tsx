import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface QuickAction {
  title: string;
  description: string;
  icon: LucideIcon;
  path: string;
  badge?: number;
  variant?: "default" | "destructive" | "outline" | "secondary";
}

interface QuickActionPanelProps {
  actions: QuickAction[];
}

export const QuickActionPanel = ({ actions }: QuickActionPanelProps) => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Button
              key={index}
              variant={action.variant || "outline"}
              className="w-full justify-start h-auto py-4"
              onClick={() => navigate(action.path)}
            >
              <div className="flex items-start gap-4 w-full">
                <Icon className="h-5 w-5 mt-0.5 shrink-0" />
                <div className="flex-1 text-left">
                  <div className="font-semibold flex items-center gap-2">
                    {action.title}
                    {action.badge !== undefined && action.badge > 0 && (
                      <span className="inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 text-xs font-medium rounded-full bg-destructive text-destructive-foreground">
                        {action.badge}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {action.description}
                  </div>
                </div>
              </div>
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
};
