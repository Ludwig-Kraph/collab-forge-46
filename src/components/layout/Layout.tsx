import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import Header from "./Header";
import BottomNavigation from "./BottomNavigation";
import { AppSidebar } from "./AppSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { useLocation } from "react-router-dom";

interface LayoutProps {
  children: ReactNode;
  className?: string;
  showBottomNav?: boolean;
}

const Layout = ({ children, className, showBottomNav = true }: LayoutProps) => {
  const location = useLocation();
  const isAuthPage = location.pathname === "/auth" || location.pathname === "/";

  // Don't show sidebar on landing and auth pages
  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-background">
        <main>{children}</main>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        {/* Sidebar - Hidden on mobile, visible on desktop */}
        <div className="hidden md:block">
          <AppSidebar />
        </div>

        {/* Main content area */}
        <SidebarInset className="flex-1">
          <Header />
          
          <main className={cn("flex-1 pb-20 md:pb-6", className)}>
            {children}
          </main>

          {showBottomNav && <BottomNavigation />}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
