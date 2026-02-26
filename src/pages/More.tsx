import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import {
  Settings,
  CreditCard,
  HelpCircle,
  Users,
  BookMarked,
  Key,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";

const More = () => {
  const menuItems = [
    {
      icon: Users,
      label: "User Management",
      path: "/users",
      description: "Manage team members and roles",
    },
    {
      icon: Settings,
      label: "Settings",
      path: "/settings",
      description: "Account and preferences",
    },
    {
      icon: Key,
      label: "M-Pesa Daraja",
      path: "/mpesa-daraja",
      description: "API configuration",
    },
    {
      icon: CreditCard,
      label: "Subscription",
      path: "/subscription",
      description: "Manage your plan",
    },
    {
      icon: BookMarked,
      label: "How To Guide",
      path: "/how-to",
      description: "Step-by-step tutorials",
    },
    {
      icon: HelpCircle,
      label: "Help & Support",
      path: "/help",
      description: "Get assistance",
    },
  ];

  return (
    <Layout>
      <div className="container px-4 py-6 max-w-lg mx-auto">
        <h1 className="mb-5">More</h1>
        <div className="space-y-2 stagger-children">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.path} to={item.path}>
                <Card className="hover-lift border-border/60">
                  <CardContent className="flex items-center gap-3.5 py-3 px-4">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </Layout>
  );
};

export default More;
