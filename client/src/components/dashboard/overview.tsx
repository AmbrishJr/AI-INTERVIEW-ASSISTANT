import { useLocation } from "wouter";
import { Activity, BarChart3, CheckCircle, Download, Play, RefreshCw, Target, TrendingUp, Zap } from "lucide-react";
import GlassCard from "@/components/common/glass-card";
import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import type { DashboardTotals } from "./dashboard-data";

export function WelcomeCard({ onRefresh }: { onRefresh: () => void }) {
  const { profileName } = useAuth();
  return (
    <GlassCard>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Welcome back, {profileName}</CardTitle>
          <div className="text-sm text-muted-foreground mt-1">
            Keep the streak alive—small sessions daily beat long sessions rarely.
          </div>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={onRefresh}>
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </CardHeader>
    </GlassCard>
  );
}

export function StatCards({ totals }: { totals: DashboardTotals }) {
  const stats = [
    { title: "Total Sessions", value: totals.totalSessions, Icon: Activity },
    { title: "Completed Sessions", value: totals.completedSessions, Icon: CheckCircle },
    { title: "Average Focus Score", value: totals.avgFocus, Icon: TrendingUp },
    { title: "Active Streak (days)", value: totals.streakDays, Icon: Zap },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map(({ title, value, Icon }) => (
        <GlassCard key={title}>
          <CardContent className="p-5 flex items-start justify-between">
            <div>
              <div className="text-sm text-muted-foreground">{title}</div>
              <div className="mt-1 text-3xl font-bold">{value}</div>
            </div>
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Icon className="h-5 w-5" />
            </div>
          </CardContent>
        </GlassCard>
      ))}
    </div>
  );
}

interface QuickActionsCardProps {
  onCreateGoal: () => void;
  onExport: () => void;
}

export function QuickActionsCard({ onCreateGoal, onExport }: QuickActionsCardProps) {
  const [, setLocation] = useLocation();
  return (
    <GlassCard>
      <CardHeader>
        <CardTitle>Quick actions</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        <Button className="gap-2" onClick={() => setLocation("/session")}>
          <Play className="h-4 w-4" /> Start New Session
        </Button>
        <Button variant="outline" className="gap-2" onClick={() => setLocation("/practice")}>
          <Target className="h-4 w-4" /> Guided Practice
        </Button>
        <Button variant="outline" className="gap-2" onClick={() => setLocation("/analytics")}>
          <BarChart3 className="h-4 w-4" /> View Analytics
        </Button>
        <Button variant="outline" className="gap-2" onClick={onCreateGoal}>
          <Target className="h-4 w-4" /> Create Goal
        </Button>
        <Button variant="outline" className="gap-2" onClick={onExport}>
          <Download className="h-4 w-4" /> Export Data (CSV)
        </Button>
      </CardContent>
    </GlassCard>
  );
}
