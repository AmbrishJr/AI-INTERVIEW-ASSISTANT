import { useMemo, useRef, useState } from "react";
import DashboardHeader from "@/components/dashboard/dashboard-header";
import { computeTotals, exportSessionsCsv, loadDashboardSessions } from "@/components/dashboard/dashboard-data";
import FocusTimerCard from "@/components/dashboard/focus-timer-card";
import GoalsCard from "@/components/dashboard/goals-card";
import { QuickActionsCard, StatCards, WelcomeCard } from "@/components/dashboard/overview";
import PerformanceChartCard from "@/components/dashboard/performance-chart-card";
import SessionsTableCard from "@/components/dashboard/sessions-table-card";
import {
  ActivityTimelineCard,
  FeedbackCard,
  InsightsCard,
  RemindersCard,
  SystemStatusCard,
} from "@/components/dashboard/side-cards";
import { toastSuccess } from "@/hooks/use-toast";

export default function Dashboard() {
  const [sessions, setSessions] = useState(loadDashboardSessions);
  const totals = useMemo(() => computeTotals(sessions), [sessions]);
  const goalsRef = useRef<HTMLDivElement>(null);

  const refresh = () => {
    setSessions(loadDashboardSessions());
    toastSuccess("Updated", "Dashboard data refreshed.");
  };

  return (
    <div className="max-w-7xl mx-auto pb-6 space-y-8">
      <DashboardHeader />
      <WelcomeCard onRefresh={refresh} />
      <StatCards totals={totals} />
      <QuickActionsCard
        onCreateGoal={() => goalsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
        onExport={() => exportSessionsCsv(sessions)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <PerformanceChartCard className="lg:col-span-2" />
        <FocusTimerCard />
      </div>

      <SessionsTableCard sessions={sessions} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GoalsCard ref={goalsRef} className="lg:col-span-2" />
        <InsightsCard latestSession={sessions[0]} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RemindersCard />
        <ActivityTimelineCard className="lg:col-span-2" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SystemStatusCard />
        <FeedbackCard className="lg:col-span-2" />
      </div>
    </div>
  );
}
