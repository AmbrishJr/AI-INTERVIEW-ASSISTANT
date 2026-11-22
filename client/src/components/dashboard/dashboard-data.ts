import {
  averageMeasured,
  currentStreak,
  measured,
} from "@/lib/session-metrics";
import { parseDate } from "@/lib/format";
import { loadSessionHistory } from "@/lib/session-history";
import { toastSuccess } from "@/hooks/use-toast";

export interface DashboardSession {
  id: string;
  duration: number;
  date: string;
  notes?: string;
  focusScore: number | null;
  status: "completed" | "paused" | "active" | "unknown";
}

export interface DashboardTotals {
  totalSessions: number;
  completedSessions: number;
  avgFocus: number | null;
  streakDays: number;
}

/** Project saved measurements into the dashboard; missing values stay unknown. */
export function loadDashboardSessions(): DashboardSession[] {
  return loadSessionHistory()
    .map<DashboardSession>((s) => ({
      id: s.id,
      duration: s.duration,
      date: s.date,
      notes: s.notes,
      focusScore: measured(s.metrics?.eyeContactPct, 100),
      status: s.status ?? "unknown",
    }))
    .sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
}

export function computeTotals(sessions: DashboardSession[]): DashboardTotals {
  const completed = sessions.filter((s) => s.status === "completed");
  const avgFocus = averageMeasured(sessions.map((s) => s.focusScore));
  const streakDays = currentStreak(completed.map((s) => s.date));

  return {
    totalSessions: sessions.length,
    completedSessions: completed.length,
    avgFocus,
    streakDays,
  };
}

export function exportSessionsCsv(sessions: DashboardSession[]) {
  const header = "date,duration_seconds,facing_camera_percent,status";
  const rows = sessions.map((s) => {
    const date = parseDate(s.date)?.toISOString() ?? s.date;
    return `${date},${s.duration},${s.focusScore ?? ""},${s.status}`;
  });
  const blob = new Blob([[header, ...rows].join("\n") + "\n"], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `dashboard_export_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  toastSuccess("Export started", "Downloaded CSV report.");
}
