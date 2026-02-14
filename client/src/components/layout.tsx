import { useEffect, useState, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Mic, 
  Home, 
  User, 
  Activity, 
  LogOut, 
  Bell, 
  Menu, 
  X, 
  Newspaper, 
  Briefcase, 
  Brain,
  Code
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthState } from "@/contexts/AuthStateContext";
import { Button } from "@/components/ui/button";

interface LayoutProps {
  children: ReactNode;
  profileName?: string;
  setProfileName?: (name: string) => void;
}

export default function Layout({ children, profileName, setProfileName }: LayoutProps) {
  const [location] = useLocation();
  const { logout } = useAuthState();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!sidebarOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSidebarOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [sidebarOpen]);

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  const navItems = [
    { icon: Home, label: "Home", href: "/" },
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: Mic, label: "Practice", href: "/practice" },
    { icon: Activity, label: "Analytics", href: "/analytics" },
    { icon: Newspaper, label: "News", href: "/news" },
    { icon: Briefcase, label: "Jobs", href: "/jobs" },
    { icon: Code, label: "Projects", href: "/projects" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex font-sans overflow-hidden">
      {/* Sidebar - Glassmorphism */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/50 backdrop-blur-[1px] md:hidden",
          sidebarOpen ? "block" : "hidden",
        )}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      <aside
        className={cn(
          "w-64 border-r border-border/40 bg-card/30 backdrop-blur-xl h-screen flex flex-col fixed z-50 transition-transform duration-200",
          "md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
        aria-label="Primary navigation"
      >
        <div className="p-6 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/50 shadow-[0_0_15px_rgba(0,240,255,0.3)]">
            <Activity className="w-5 h-5 text-primary" />
          </div>
          <span className="font-heading font-bold text-xl tracking-tight">AI Coach</span>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <a className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                  isActive 
                    ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_10px_rgba(0,240,255,0.1)]" 
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                )}
                onClick={() => setSidebarOpen(false)}
                aria-current={isActive ? "page" : undefined}
                >
                  <item.icon className={cn("w-5 h-5", isActive && "animate-pulse")} />
                  <span className="font-medium">{item.label}</span>
                </a>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border/40">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-3 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors cursor-pointer border border-white/5 mb-3 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            aria-label="Logout"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Logout</span>
          </button>
          <Link href="/profile">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer border border-white/5">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-secondary p-[1px]">
              <div className="w-full h-full rounded-full bg-card flex items-center justify-center overflow-hidden">
                <User className="w-5 h-5 text-muted-foreground" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium">{profileName || "Alex Chen"}</p>
              <p className="text-xs text-muted-foreground">Pro Member</p>
            </div>
          </div>
        </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 relative z-10 overflow-y-auto h-screen bg-grid-pattern">
        <header className="sticky top-0 z-30 border-b border-border/40 bg-card/30 backdrop-blur-xl">
          <div className="h-14 px-4 md:px-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setSidebarOpen((v) => !v)}
                aria-label={sidebarOpen ? "Close navigation" : "Open navigation"}
              >
                {sidebarOpen ? <X /> : <Menu />}
              </Button>
              <div className="hidden md:flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{location}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Notifications"
                onClick={() => {
                  // placeholder for notifications panel
                }}
              >
                <Bell />
              </Button>
            </div>
          </div>
        </header>

        <div className="px-4 md:px-6 py-6">{children}</div>
      </main>
    </div>
  );
}