import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import Header from "./Header";
import BottomNavigation from "./BottomNavigation";

interface LayoutProps {
  children: ReactNode;
  className?: string;
  showBottomNav?: boolean;
}

const Layout = ({ children, className, showBottomNav = true }: LayoutProps) => {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      
      <main className={cn("flex-1 pb-20 md:pb-6", className)}>
        {children}
      </main>

      {showBottomNav && <BottomNavigation />}
    </div>
  );
};

export default Layout;
