import { useState } from 'react';
import { 
  LayoutDashboard, Users, MessageSquare, Settings, Landmark,
  Package, Shield, Monitor, ChevronDown, ChevronRight,
  Globe, Headphones, UserPlus, Coins, BarChart3, FileText,
  User, Lock, Bell, Palette, Image, Upload, Key,
  Building2, ScrollText, TicketCheck, Database
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import logo from '@/assets/m-leja-logo.png';

interface NavItem {
  title: string;
  url?: string;
  icon: any;
  children?: { title: string; url: string }[];
}

const navigationGroups: { label: string; items: NavItem[] }[] = [
  {
    label: 'Dashboard',
    items: [
      { title: 'Dashboard', url: '/control-panel/cms', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Administration — M-Leja Centre',
    items: [
      {
        title: 'Accounts',
        icon: Users,
        children: [
          { title: 'All Accounts', url: '/control-panel/accounts' },
          { title: 'Onboarding', url: '/control-panel/onboarding' },
        ],
      },
      {
        title: 'Subscriptions',
        icon: Package,
        children: [
          { title: 'Tier Management', url: '/control-panel/subscription-control' },
          { title: 'Token Management', url: '/control-panel/tokens' },
        ],
      },
      {
        title: 'Content',
        icon: Monitor,
        children: [
          { title: 'CMS Pages', url: '/control-panel/content' },
          { title: 'Landing Page', url: '/control-panel/landing-page-builder' },
          { title: 'Media Library', url: '/control-panel/media' },
        ],
      },
      {
        title: 'Communication',
        icon: MessageSquare,
        children: [
          { title: 'Support Tickets', url: '/control-panel/support' },
          { title: 'Messaging', url: '/control-panel/communication' },
        ],
      },
      {
        title: 'Diplomatics',
        icon: Landmark,
        children: [
          { title: 'Government Entities', url: '/control-panel/diplomatics' },
          { title: 'Officials Management', url: '/control-panel/diplomatics/officials' },
          { title: 'Diplomatic Tickets', url: '/control-panel/diplomatics/tickets' },
          { title: 'Access & Security', url: '/control-panel/diplomatics/security' },
        ],
      },
      { title: 'System Settings', url: '/control-panel/system-settings', icon: Settings },
    ],
  },
  {
    label: 'Super Admin Account',
    items: [
      {
        title: 'Account',
        icon: User,
        children: [
          { title: 'Profile', url: '/control-panel/account/profile' },
          { title: 'Super Admins', url: '/control-panel/super-admin-management' },
          { title: 'Security & MFA', url: '/control-panel/account/security' },
        ],
      },
      {
        title: 'Navigation',
        icon: Globe,
        children: [
          { title: 'Theme & Design', url: '/control-panel/account/theme' },
          { title: 'Audit Logs', url: '/control-panel/account/audit' },
          { title: 'Activity Feed', url: '/control-panel/account/activity' },
        ],
      },
    ],
  },
];

function SidebarMenuItem({ item }: { item: NavItem }) {
  const location = useLocation();
  const [expanded, setExpanded] = useState(() => {
    if (item.children) {
      return item.children.some(c => location.pathname.startsWith(c.url));
    }
    return false;
  });

  const Icon = item.icon;

  if (item.children) {
    const isChildActive = item.children.some(c => location.pathname === c.url || location.pathname.startsWith(c.url + '/'));

    return (
      <div>
        <button
          onClick={() => setExpanded(!expanded)}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors',
            'hover:bg-white/10 text-slate-300 hover:text-white',
            isChildActive && 'bg-white/10 text-white'
          )}
        >
          <Icon className="h-4 w-4 flex-shrink-0 opacity-70" />
          <span className="flex-1 text-left">{item.title}</span>
          {expanded ? (
            <ChevronDown className="h-3.5 w-3.5 opacity-50" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 opacity-50" />
          )}
        </button>
        {expanded && (
          <div className="ml-4 mt-0.5 space-y-0.5 border-l border-white/10 pl-3">
            {item.children.map((child) => (
              <NavLink
                key={child.url}
                to={child.url}
                className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                activeClassName="text-white bg-primary/30 font-medium"
              >
                <span>{child.title}</span>
              </NavLink>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <NavLink
      to={item.url!}
      end={item.url === '/control-panel/cms'}
      className="flex items-center gap-3 px-3 py-2 text-sm rounded-md text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
      activeClassName="bg-primary/30 text-white font-medium"
    >
      <Icon className="h-4 w-4 flex-shrink-0 opacity-70" />
      <span>{item.title}</span>
    </NavLink>
  );
}

export function ControlPanelSidebar() {
  return (
    <aside className="w-60 min-h-screen bg-slate-900 text-white flex flex-col flex-shrink-0 border-r border-slate-800">
      {/* Brand */}
      <div className="h-16 flex items-center gap-3 px-4 border-b border-slate-800">
        <img src={logo} alt="M-Leja" className="h-7 w-auto" />
        <div>
          <span className="font-bold text-sm tracking-wide">Mleja Berkshire</span>
          <span className="block text-[10px] text-slate-400 -mt-0.5">Berkshire Console</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {navigationGroups.map((group) => (
          <div key={group.label}>
            <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <SidebarMenuItem key={item.title} item={item} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-slate-800">
        <p className="text-[10px] text-slate-500 text-center">
          Mleja Berkshire v3.0
        </p>
      </div>
    </aside>
  );
}
