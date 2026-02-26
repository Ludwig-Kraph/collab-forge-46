import { Home, CreditCard, Receipt, BarChart3, MoreHorizontal } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Home, label: "Home", path: "/dashboard" },
  { icon: CreditCard, label: "Pay", path: "/payment" },
  { icon: Receipt, label: "History", path: "/transactions" },
  { icon: BarChart3, label: "Analytics", path: "/analytics" },
  { icon: MoreHorizontal, label: "More", path: "/more" },
];

const BottomNavigation = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t md:hidden safe-area-bottom">
      <div className="grid h-14 grid-cols-5 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (item.path === "/dashboard" && location.pathname === "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 transition-all duration-200",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground active:scale-95"
              )}
            >
              <div
                className={cn(
                  "flex items-center justify-center rounded-lg h-7 w-7 transition-all duration-200",
                  isActive && "bg-primary/10"
                )}
              >
                <Icon className={cn("h-[18px] w-[18px]", isActive && "stroke-[2.5px]")} />
              </div>
              <span className="text-[10px] font-medium leading-none">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;
