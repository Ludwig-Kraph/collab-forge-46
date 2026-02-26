import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import Header from "./Header";
import BottomNavigation from "./BottomNavigation";
import Footer from "./Footer";
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

  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <div className="hidden md:block">
          <AppSidebar />
        </div>

        <SidebarInset className="flex-1 flex flex-col min-w-0">
          <Header />

          <main className={cn("flex-1 pb-16 md:pb-0", className)}>
            {children}
          </main>

          <div className="hidden md:block">
            <Footer />
          </div>
          {showBottomNav && <BottomNavigation />}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
