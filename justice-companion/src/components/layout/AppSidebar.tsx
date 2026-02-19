import {
  LayoutDashboard, FileText, Plus, Bell, Building2, Users, Scale, Shield, LogOut, ChevronLeft,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuthStore, type UserRole } from "@/store/authStore";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface NavItem {
  title: string;
  url: string;
  icon: typeof LayoutDashboard;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, roles: ["CITIZEN", "POLICE", "SUPERIOR", "JUDICIARY"] },
  { title: "Submit Case", url: "/submit-case", icon: Plus, roles: ["CITIZEN"] },
  { title: "My Cases", url: "/my-cases", icon: FileText, roles: ["CITIZEN"] },
  { title: "Assigned Cases", url: "/assigned-cases", icon: FileText, roles: ["POLICE"] },
  { title: "Escalated Cases", url: "/escalated-cases", icon: Scale, roles: ["SUPERIOR", "JUDICIARY"] },
  { title: "All Cases", url: "/all-cases", icon: FileText, roles: ["JUDICIARY"] },
  { title: "Stations", url: "/stations", icon: Building2, roles: ["SUPERIOR", "JUDICIARY"] },
  { title: "Officers", url: "/officers", icon: Users, roles: ["SUPERIOR"] },
  { title: "Notifications", url: "/notifications", icon: Bell, roles: ["CITIZEN", "POLICE", "SUPERIOR", "JUDICIARY"] },
];

export function AppSidebar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const role = user?.role || "CITIZEN";
  const filteredItems = navItems.filter((item) => item.roles.includes(role));

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className={cn(
      "flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-sidebar-primary" />
            <span className="text-lg font-bold text-sidebar-primary">AK Justice</span>
          </div>
        )}
        {collapsed && <Shield className="mx-auto h-6 w-6 text-sidebar-primary" />}
        <button onClick={() => setCollapsed(!collapsed)} className="rounded-md p-1 text-sidebar-foreground hover:bg-sidebar-accent">
          <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
        </button>
      </div>

      {/* Role badge */}
      {!collapsed && (
        <div className="mx-4 mt-4 rounded-md bg-sidebar-accent px-3 py-2">
          <p className="text-xs text-sidebar-foreground/60">Logged in as</p>
          <p className="text-sm font-semibold text-sidebar-accent-foreground">{user?.name || "Guest"}</p>
          <p className="text-xs font-medium text-sidebar-primary">{role}</p>
        </div>
      )}

      {/* Nav */}
      <nav className="mt-4 flex-1 space-y-1 px-2 overflow-y-auto">
        {filteredItems.map((item) => (
          <NavLink
            key={item.url}
            to={item.url}
            end
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              collapsed && "justify-center px-2"
            )}
            activeClassName="bg-sidebar-accent text-sidebar-primary"
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span>{item.title}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="border-t border-sidebar-border p-2">
        <button
          onClick={handleLogout}
          className={cn(
            "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-destructive",
            collapsed && "justify-center px-2"
          )}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
