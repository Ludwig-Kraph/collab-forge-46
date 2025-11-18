import Layout from "@/components/layout/Layout";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, CreditCard, HelpCircle, Users, Key } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const More = () => {
  const { isAdmin, isSuperAdmin } = useAuth();
  
  const menuItems = [
    { icon: Users, label: "User Management", path: "/users", description: "Manage team members and roles", requiresAdmin: true },
    { icon: Key, label: "MPESA Credentials", path: "/mpesa-credentials", description: "Manage Daraja API credentials", requiresAdmin: true },
    { icon: Settings, label: "Settings", path: "/settings", description: "Account and preferences" },
    { icon: CreditCard, label: "Subscription", path: "/subscription", description: "Manage your plan" },
    { icon: HelpCircle, label: "Help & Support", path: "/help", description: "Get assistance" },
  ].filter(item => !item.requiresAdmin || isAdmin || isSuperAdmin);

  return (
    <Layout>
      <div className="container px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold">More Options</h1>
        <div className="grid gap-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.path} className="transition-smooth hover:shadow-elegant">
                <CardHeader>
                  <Button
                    asChild
                    variant="ghost"
                    className="h-auto w-full justify-start gap-4 p-0"
                  >
                    <Link to={item.path}>
                      <Icon className="h-6 w-6 text-primary" />
                      <div className="flex-1 text-left">
                        <CardTitle className="text-base">{item.label}</CardTitle>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </Link>
                  </Button>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>
    </Layout>
  );
};

export default More;
