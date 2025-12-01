import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import CMSSidebar from "./CMSSidebar";
import Header from "./Header";
import Footer from "./Footer";

interface CMSLayoutProps {
  children: ReactNode;
}

const CMSLayout = ({ children }: CMSLayoutProps) => {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full">
        <CMSSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b flex items-center px-4 gap-4">
            <SidebarTrigger />
            <div className="flex-1">
              <Header />
            </div>
          </header>
          <main className="flex-1 overflow-auto">
            {children}
          </main>
          <Footer />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default CMSLayout;
