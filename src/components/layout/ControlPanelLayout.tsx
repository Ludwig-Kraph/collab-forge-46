import { ReactNode } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { ControlPanelSidebar } from './ControlPanelSidebar';
import Header from './Header';
import Footer from './Footer';

interface ControlPanelLayoutProps {
  children: ReactNode;
}

export function ControlPanelLayout({ children }: ControlPanelLayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full">
        <ControlPanelSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b flex items-center px-4 gap-4">
            <SidebarTrigger />
            <div className="flex-1">
              <Header />
            </div>
          </header>
          <main className="flex-1 overflow-auto">
            <div className="container mx-auto p-6">
              {children}
            </div>
          </main>
          <Footer />
        </div>
      </div>
    </SidebarProvider>
  );
}
