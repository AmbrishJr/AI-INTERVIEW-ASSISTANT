import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { AlertTriangle, Award, Bell, CheckCircle, ChevronRight, Info, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/auth-context";
import { toastInfo } from "@/hooks/use-toast";

const NOTIFICATIONS = [
  { id: 1, type: "success", title: "Great job!", message: "Your score improved by 8% from last week", time: "2h ago", read: false },
  { id: 2, type: "warning", title: "Practice reminder", message: "You have a practice session scheduled in 1 hour", time: "5h ago", read: false },
  { id: 3, type: "info", title: "New feature", message: "Try our new mock interview feature", time: "1d ago", read: true },
  { id: 4, type: "achievement", title: "Achievement unlocked", message: "5-day streak! Keep it up!", time: "2d ago", read: true },
] as const;

const NOTIFICATION_ICONS = {
  success: <CheckCircle className="h-4 w-4 text-green-500" />,
  warning: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
  info: <Info className="h-4 w-4 text-blue-500" />,
  achievement: <Award className="h-4 w-4 text-purple-500" />,
};

export default function DashboardHeader() {
  return (
    <div className="py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
        <LiveClock />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <NotificationsMenu />
        <AccountMenu />
      </div>
    </div>
  );
}

/** Ticks every second in isolation so the rest of the dashboard doesn't re-render. */
export function LiveClock({ timeOnly = false }: { timeOnly?: boolean }) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  if (timeOnly) return <span className="font-mono">{now.toLocaleTimeString()}</span>;

  return (
    <div className="text-sm text-muted-foreground flex flex-wrap items-center gap-2">
      <span>{now.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}</span>
      <span className="opacity-50">•</span>
      <span className="font-mono">{now.toLocaleTimeString()}</span>
    </div>
  );
}

function NotificationsMenu() {
  const [readIds, setReadIds] = useState<Set<number>>(
    () => new Set(NOTIFICATIONS.filter((n) => n.read).map((n) => n.id)),
  );
  const unreadCount = NOTIFICATIONS.length - readIds.size;

  const markRead = (id: number) => setReadIds((prev) => new Set(prev).add(id));
  const markAllRead = () => setReadIds(new Set(NOTIFICATIONS.map((n) => n.id)));

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label={`Notifications (${unreadCount} unread)`}>
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          <button type="button" onClick={markAllRead} className="text-xs text-primary hover:underline">
            Mark all read
          </button>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {NOTIFICATIONS.map((n) => (
          <DropdownMenuItem
            key={n.id}
            className="flex items-start gap-2"
            onClick={() => {
              markRead(n.id);
              toastInfo(n.title, n.message);
            }}
          >
            <div className="mt-0.5">{NOTIFICATION_ICONS[n.type]}</div>
            <div className="flex-1">
              <div className="text-sm font-medium flex items-center justify-between">
                <span>{n.title}</span>
                <span className="text-xs text-muted-foreground">{n.time}</span>
              </div>
              <div className="text-xs text-muted-foreground">{n.message}</div>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function AccountMenu() {
  const [, setLocation] = useLocation();
  const { profileName, logout } = useAuth();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Users className="h-4 w-4" />
          {profileName}
          <ChevronRight className="h-4 w-4 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setLocation("/profile")}>View Profile</DropdownMenuItem>
        <DropdownMenuItem onClick={() => toastInfo("Settings", "Settings panel coming soon.")}>Settings</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-red-500"
          onClick={() => {
            logout();
            setLocation("/login");
          }}
        >
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
