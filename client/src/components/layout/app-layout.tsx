import type { ReactNode } from "react";
import { useLocation } from "wouter";
import { Activity, Briefcase, Code, Home, LayoutDashboard, Mic, Newspaper } from "lucide-react";
import Dock from "./dock";

const NAV_ITEMS = [
  { path: "/", label: "Home", Icon: Home },
  { path: "/practice", label: "Practice", Icon: Mic },
  { path: "/dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { path: "/analytics", label: "Analytics", Icon: Activity },
  { path: "/news", label: "News", Icon: Newspaper },
  { path: "/jobs", label: "Jobs", Icon: Briefcase },
  { path: "/projects", label: "Projects", Icon: Code },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const [location, setLocation] = useLocation();
  const current = NAV_ITEMS.find((item) => item.path === location);

  const dockItems = NAV_ITEMS.map(({ path, label, Icon }) => ({
    label,
    icon: <Icon className="w-5 h-5" />,
    active: path === location,
    onClick: () => setLocation(path),
  }));

  return (
    <div className="min-h-screen bg-background text-foreground flex font-sans overflow-hidden">
      <main className="flex-1 relative z-10 overflow-y-auto h-screen bg-grid-pattern">
        <header className="sticky top-0 z-30 border-b border-border/40 bg-card/30 backdrop-blur-xl">
          <div className="h-14 px-4 md:px-6 flex items-center">
            <span className="text-sm font-medium text-muted-foreground">{current?.label ?? location}</span>
          </div>
        </header>

        <div className="px-4 md:px-6 pb-24">{children}</div>

        <Dock items={dockItems} />
      </main>
    </div>
  );
}
