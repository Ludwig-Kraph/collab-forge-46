import { ReactNode } from 'react';
import { ControlPanelSidebar } from './ControlPanelSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { Bell, Search, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Footer from './Footer';

interface ControlPanelLayoutProps {
  children: ReactNode;
}

export function ControlPanelLayout({ children }: ControlPanelLayoutProps) {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex w-full bg-muted/30">
      <ControlPanelSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        {/* WP-style top bar */}
        <header className="h-12 bg-slate-800 text-white flex items-center px-4 gap-3 flex-shrink-0">
          <div className="flex-1 flex items-center gap-3">
            <div className="relative max-w-xs w-full hidden md:block">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <Input
                placeholder="Search..."
                className="h-8 pl-8 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 text-xs focus-visible:ring-primary"
              />
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-white hover:bg-slate-700">
            <Bell className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="text-xs text-slate-300 hidden md:inline">
              {user?.email || 'Super Admin'}
            </span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
