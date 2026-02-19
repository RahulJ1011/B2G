import { Outlet, useNavigate } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { Bell } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useQuery } from "@tanstack/react-query";
import { getUnreadNotifications } from "@/api/notifications";
import { useEffect } from "react";

export function AppLayout() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const navigate = useNavigate();

  // Auth guard — redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Fetch unread notification count
  const { data: notifData } = useQuery({
    queryKey: ["unreadNotifications"],
    queryFn: getUnreadNotifications,
    refetchInterval: 15000, // poll every 15s
    enabled: isAuthenticated,
  });

  const unreadCount = notifData?.notifications?.length || 0;

  if (!isAuthenticated) return null;

  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar />
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b bg-card px-6">
          <h2 className="text-lg font-semibold text-card-foreground">
            Case Management System
          </h2>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/notifications")}
              className="relative rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              {user?.name?.charAt(0) || "U"}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
