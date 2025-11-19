import { useState, useEffect } from "react";
import { 
  Home, 
  CreditCard, 
  Receipt, 
  BookOpen, 
  BarChart3, 
  Users, 
  Settings, 
  HelpCircle,
  Shield,
  CreditCard as Subscription,
  BookMarked,
  ChevronDown,
  UserCog,
  UserPlus,
  MessageSquare,
  Wrench,
  DollarSign,
  Key
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const mainItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Make Payment", url: "/payment", icon: CreditCard },
  { title: "Transactions", url: "/transactions", icon: Receipt },
  { title: "Ledger", url: "/ledger", icon: BookOpen },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
];

const controlPanelItems = [
  { title: "Dashboard", url: "/control-panel", icon: Home },
  { title: "Accounts", url: "/control-panel/accounts", icon: UserCog },
  { title: "Onboarding", url: "/control-panel/onboarding", icon: UserPlus },
  { title: "Support", url: "/control-panel/support", icon: MessageSquare },
  { title: "Government", url: "/control-panel/government", icon: Shield },
  { title: "Subscriptions", url: "/control-panel/subscriptions", icon: DollarSign },
  { title: "M-Pesa Daraja", url: "/mpesa-daraja", icon: Key },
  { title: "System Settings", url: "/control-panel/system-settings", icon: Wrench },
  { title: "Communication", url: "/control-panel/communication", icon: MessageSquare },
];

const settingsItems = [
  { title: "Settings", url: "/settings", icon: Settings },
  { title: "M-Pesa Daraja", url: "/mpesa-daraja", icon: Key },
  { title: "Subscription", url: "/subscription", icon: Subscription },
  { title: "Help", url: "/help", icon: HelpCircle },
  { title: "How To Guide", url: "/how-to", icon: BookMarked },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { isAdmin, isSuperAdmin } = useAuth();
  const currentPath = location.pathname;

  const isCollapsed = state === "collapsed";
  const isActive = (path: string) => currentPath === path;
  const isControlPanelActive = currentPath.startsWith("/control-panel");
  const [isControlPanelOpen, setIsControlPanelOpen] = useState(isControlPanelActive);

  useEffect(() => {
    if (isControlPanelActive) {
      setIsControlPanelOpen(true);
    }
  }, [isControlPanelActive]);

  return (
    <Sidebar>
      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className={isCollapsed ? "sr-only" : ""}>
            Main Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink 
                      to={item.url} 
                      end 
                      className="hover:bg-muted/50" 
                      activeClassName="bg-muted text-primary font-medium"
                    >
                      <item.icon className={isCollapsed ? "h-5 w-5" : "mr-3 h-5 w-5"} />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin Section */}
        {(isAdmin || isSuperAdmin) && (
          <SidebarGroup>
            <SidebarGroupLabel className={isCollapsed ? "sr-only" : ""}>
              Administration
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {isAdmin && (
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/users")}>
                      <NavLink 
                        to="/users" 
                        className="hover:bg-muted/50" 
                        activeClassName="bg-muted text-primary font-medium"
                      >
                        <Users className={isCollapsed ? "h-5 w-5" : "mr-3 h-5 w-5"} />
                        {!isCollapsed && <span>Users</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
                {isSuperAdmin && (
                  <>
                    {isCollapsed ? (
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={isControlPanelActive}>
                          <NavLink 
                            to="/control-panel" 
                            className="hover:bg-muted/50" 
                            activeClassName="bg-muted text-primary font-medium"
                          >
                            <Shield className="h-5 w-5 text-primary" />
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ) : (
                      <Collapsible
                        open={isControlPanelOpen}
                        onOpenChange={setIsControlPanelOpen}
                        className="group/collapsible"
                      >
                        <SidebarMenuItem>
                          <CollapsibleTrigger asChild>
                            <SidebarMenuButton isActive={isControlPanelActive} className="bg-primary/5 hover:bg-primary/10 data-[state=open]:bg-primary/10">
                              <Shield className="mr-3 h-5 w-5 text-primary" />
                              <span className="font-medium">Control Panel</span>
                              <ChevronDown className="ml-auto h-4 w-4 text-primary transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
                            </SidebarMenuButton>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <SidebarMenuSub>
                              {controlPanelItems.map((item) => (
                                <SidebarMenuSubItem key={item.title}>
                                  <SidebarMenuSubButton asChild isActive={isActive(item.url)}>
                                    <NavLink 
                                      to={item.url}
                                      end
                                      className="hover:bg-muted/50" 
                                      activeClassName="bg-muted text-primary font-medium"
                                    >
                                      <item.icon className="mr-2 h-4 w-4" />
                                      {!isCollapsed && <span>{item.title}</span>}
                                    </NavLink>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              ))}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        </SidebarMenuItem>
                      </Collapsible>
                    )}
                  </>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Settings Section */}
        <SidebarGroup>
          <SidebarGroupLabel className={isCollapsed ? "sr-only" : ""}>
            Settings
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink 
                      to={item.url} 
                      className="hover:bg-muted/50" 
                      activeClassName="bg-muted text-primary font-medium"
                    >
                      <item.icon className={isCollapsed ? "h-5 w-5" : "mr-3 h-5 w-5"} />
                      {!isCollapsed && <span>{item.title}</span>}
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
}
