import { Home, CreditCard, Receipt, BarChart3, MoreHorizontal } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Home, label: "Home", path: "/dashboard" },
  { icon: CreditCard, label: "Payments", path: "/payment" },
  { icon: Receipt, label: "Transactions", path: "/transactions" },
  { icon: BarChart3, label: "Analytics", path: "/analytics" },
  { icon: MoreHorizontal, label: "More", path: "/more" },
];

const BottomNavigation = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
      <div className="grid h-16 grid-cols-5">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
                           (item.path === "/dashboard" && location.pathname === "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center gap-1 transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;
