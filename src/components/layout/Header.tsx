import { LogOut, Shield, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import NotificationCenter from "@/components/notifications/NotificationCenter";
import { SidebarTrigger } from "@/components/ui/sidebar";
import logo from "@/assets/m-leja-logo.png";

const Header = () => {
  const { user, signOut, isAdmin, isSuperAdmin } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full glass border-b">
      <div className="flex h-14 items-center justify-between px-4 lg:px-6">
        {/* Left: trigger + logo */}
        <div className="flex items-center gap-2">
          <SidebarTrigger className="h-8 w-8" />
          <Link
            to="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <img src={logo} alt="M-Leja" className="h-7 w-auto" />
          </Link>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-1.5">
          <NotificationCenter />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative h-9 w-9 rounded-full"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" alt="User" />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                    {user?.phone?.slice(-2) || "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">My Account</p>
                    {isSuperAdmin ? (
                      <Badge variant="default" className="text-[10px] px-1.5 py-0">
                        <Shield className="mr-0.5 h-2.5 w-2.5" />
                        Super Admin
                      </Badge>
                    ) : isAdmin ? (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        <Shield className="mr-0.5 h-2.5 w-2.5" />
                        Admin
                      </Badge>
                    ) : null}
                  </div>
                  <p className="text-xs text-muted-foreground font-mono">
                    {user?.phone}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/settings">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/subscription">Subscription</Link>
              </DropdownMenuItem>
              {isSuperAdmin && (
                <DropdownMenuItem asChild>
                  <Link to="/control-panel">Control Panel</Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem asChild>
                <Link to="/help">Help & Support</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => signOut()}
                className="text-destructive focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
