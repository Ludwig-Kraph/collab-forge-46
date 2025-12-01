import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Building2,
  Briefcase,
  BarChart3,
  FileText,
  CreditCard,
  Settings,
  HelpCircle,
  ChevronLeft,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavLink } from "@/components/NavLink";
import { useTierAccess } from "@/hooks/useTierAccess";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";

const CMSSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { hasFeature } = useTierAccess();

  const menuItems = [
    {
      title: "CMS Home",
      url: "/cms",
      icon: LayoutDashboard,
      enabled: true,
    },
    {
      title: "Team",
      url: "/subscription/staff",
      icon: Users,
      enabled: hasFeature('rbacManagement'),
      badge: !hasFeature('rbacManagement') ? 'Pro' : null,
    },
    {
      title: "Outlets",
      url: "/subscription/outlets",
      icon: Building2,
      enabled: hasFeature('multiOutlet'),
      badge: !hasFeature('multiOutlet') ? 'Pro' : null,
    },
    {
      title: "Departments",
      url: "/subscription/departments",
      icon: Briefcase,
      enabled: hasFeature('departments'),
      badge: !hasFeature('departments') ? 'Pro' : null,
    },
    {
      title: "Analytics",
      url: "/analytics",
      icon: BarChart3,
      enabled: hasFeature('advancedAnalytics'),
      badge: !hasFeature('advancedAnalytics') ? 'Pro' : null,
    },
    {
      title: "Transactions",
      url: "/transactions",
      icon: FileText,
      enabled: true,
    },
    {
      title: "Subscription",
      url: "/subscription",
      icon: CreditCard,
      enabled: true,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
      enabled: true,
    },
    {
      title: "Help",
      url: "/help",
      icon: HelpCircle,
      enabled: true,
    },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar className="w-60">
      <SidebarContent>
        <div className="p-4 flex items-center justify-between border-b">
          <span className="font-semibold text-lg">CMS</span>
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            title="Back to Dashboard"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild disabled={!item.enabled}>
                    <NavLink
                      to={item.url}
                      className="hover:bg-muted/50 flex items-center gap-3"
                      activeClassName="bg-muted text-primary font-medium"
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      <span className="flex-1">{item.title}</span>
                      {item.badge && (
                        <Badge variant="secondary" className="text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default CMSSidebar;
