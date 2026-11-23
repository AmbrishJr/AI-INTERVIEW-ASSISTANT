import { useMemo, useRef, useState } from "react";
import DashboardHeader from "@/components/dashboard/dashboard-header";
import {
  computeTotals,
  exportSessionsCsv,
  loadDashboardSessions,
} from "@/components/dashboard/dashboard-data";
import FocusTimerCard from "@/components/dashboard/focus-timer-card";
import GoalsCard from "@/components/dashboard/goals-card";
import { QuickActionsCard, StatCards } from "@/components/dashboard/overview";
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
      <DashboardHeader onRefresh={refresh} />

      <QuickActionsCard
        onCreateGoal={() =>
          goalsRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          })
        }
        onExport={() => exportSessionsCsv(sessions)}
      />
      <StatCards totals={totals} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <PerformanceChartCard
          key={JSON.stringify(sessions)}
          className="lg:col-span-2"
        />
        <FocusTimerCard />
      </div>

      <SessionsTableCard sessions={sessions} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GoalsCard ref={goalsRef} className="lg:col-span-2" />
        <InsightsCard latestSession={sessions[0]} />
      </div>

      <details className="group rounded-xl border bg-card p-5">
        <summary className="cursor-pointer font-medium">
          Activity, reminders & support
        </summary>
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ActivityTimelineCard />
          <RemindersCard />
          <SystemStatusCard />
          <FeedbackCard />
        </div>
      </details>
    </div>
  );
}
