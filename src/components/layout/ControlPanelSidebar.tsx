import { 
  LayoutDashboard,
  Users,
  UserPlus,
  MessageSquare,
  Settings,
  Landmark,
  Package,
  Layout as LayoutIcon,
  Shield,
  Monitor,
  Coins
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

const navigationItems = [
  {
    title: 'Dashboard',
    url: '/control-panel',
    icon: LayoutDashboard,
  },
  {
    title: 'CMS',
    url: '/control-panel/cms',
    icon: Monitor,
  },
  {
    title: 'Accounts',
    url: '/control-panel/accounts',
    icon: Users,
  },
  {
    title: 'Onboarding',
    url: '/control-panel/onboarding',
    icon: UserPlus,
  },
  {
    title: 'Support',
    url: '/control-panel/support',
    icon: MessageSquare,
  },
  {
    title: 'Communication',
    url: '/control-panel/communication',
    icon: MessageSquare,
  },
  {
    title: 'System Settings',
    url: '/control-panel/system-settings',
    icon: Settings,
  },
  {
    title: 'Government',
    url: '/control-panel/government',
    icon: Landmark,
  },
  {
    title: 'Subscriptions',
    url: '/control-panel/subscription-control',
    icon: Package,
  },
  {
    title: 'Landing Page',
    url: '/control-panel/landing-page-builder',
    icon: LayoutIcon,
  },
  {
    title: 'Super Admins',
    url: '/control-panel/super-admin-management',
    icon: Shield,
  },
  {
    title: 'Token Management',
    url: '/control-panel/tokens',
    icon: Coins,
  },
];

export function ControlPanelSidebar() {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === '/control-panel') {
      return currentPath === path;
    }
    return currentPath.startsWith(path);
  };

  return (
    <Sidebar className="w-60">
      <SidebarContent>
        <div className="p-4 border-b">
          <span className="font-semibold text-lg">Control Panel</span>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>M-Leja Administration</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end={item.url === '/control-panel'}
                        className="flex items-center gap-3 hover:bg-muted/50"
                        activeClassName="bg-muted text-primary font-medium"
                      >
                        <Icon className="h-4 w-4 flex-shrink-0" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
