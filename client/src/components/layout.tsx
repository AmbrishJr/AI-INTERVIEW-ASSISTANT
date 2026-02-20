import { type ReactNode } from "react";
import { useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Mic, 
  Home, 
  Bell,
  Activity,
  Newspaper,
  Briefcase,
  Code
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Dock from "@/components/Dock";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location, setLocation] = useLocation();

  const dockItems = [
    { icon: <Home className="w-6 h-6" />, label: "Home", onClick: () => setLocation("/") },
    { icon: <Mic className="w-6 h-6" />, label: "Practice", onClick: () => setLocation("/practice") },
    { icon: <LayoutDashboard className="w-6 h-6" />, label: "Dashboard", onClick: () => setLocation("/dashboard") },
    { icon: <Activity className="w-6 h-6" />, label: "Analytics", onClick: () => setLocation("/analytics") },
    { icon: <Newspaper className="w-6 h-6" />, label: "News", onClick: () => setLocation("/news") },
    { icon: <Briefcase className="w-6 h-6" />, label: "Jobs", onClick: () => setLocation("/jobs") },
    { icon: <Code className="w-6 h-6" />, label: "Projects", onClick: () => setLocation("/projects") },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex font-sans overflow-hidden">
      {/* Main Content */}
      <main className="flex-1 relative z-10 overflow-y-auto h-screen bg-grid-pattern">
        <header className="sticky top-0 z-30 border-b border-border/40 bg-card/30 backdrop-blur-xl">
          <div className="h-14 px-4 md:px-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
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

        <div className="px-4 md:px-6 pb-24">{children}</div>

        {/* Dock Navigation */}
        <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center">
          <Dock 
            items={dockItems}
            className=""
            magnification={0.3}
            distance={150}
            panelHeight={60}
            dockHeight={180}
            baseItemSize={40}
          />
        </div>
      </main>
    </div>
  );
}