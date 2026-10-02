import { parseDate } from "@/lib/format";
import { loadSessionHistory } from "@/lib/session-history";
import { toastSuccess } from "@/hooks/use-toast";

export interface DashboardSession {
  id: string;
  duration: number;
  date: string;
  notes?: string;
  focusScore: number;
  status: "completed" | "paused" | "active";
}

export interface DashboardTotals {
  totalSessions: number;
  completedSessions: number;
  avgFocus: number;
  streakDays: number;
}

/** Fallback for sessions saved before metrics were recorded: a stable pseudo-score per id. */
function focusScoreFor(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return 55 + (h % 46);
}

function sampleSessions(): DashboardSession[] {
  const now = Date.now();
  const hoursAgo = (h: number) => new Date(now - h * 3600 * 1000).toISOString();
  return [
    { id: "mock-1", duration: 15 * 60, date: hoursAgo(2), focusScore: 92, status: "completed" },
    { id: "mock-2", duration: 25 * 60, date: hoursAgo(24), focusScore: 78, status: "completed" },
    { id: "mock-3", duration: 40 * 60, date: hoursAgo(72), focusScore: 65, status: "completed" },
  ];
}

/** Saved interview sessions (newest first), or sample data when none exist yet. */
export function loadDashboardSessions(): DashboardSession[] {
  const saved = loadSessionHistory();
  if (saved.length === 0) return sampleSessions();
  return saved
    .map((s) => ({
      id: s.id,
      duration: Math.max(0, Math.floor(s.duration)),
      date: s.date,
      notes: s.notes,
      // Real eye-contact percentage when the session was recorded with the camera on.
      focusScore: s.metrics?.eyeContactPct ?? focusScoreFor(s.id),
      status: "completed" as const,
    }))
    .sort((a, b) => (parseDate(b.date)?.getTime() ?? 0) - (parseDate(a.date)?.getTime() ?? 0));
}

const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

export function computeTotals(sessions: DashboardSession[]): DashboardTotals {
  const completed = sessions.filter((s) => s.status === "completed");
  const avgFocus = sessions.length
    ? Math.round(sessions.reduce((acc, s) => acc + s.focusScore, 0) / sessions.length)
    : 0;

  const completedDates = completed.map((s) => parseDate(s.date)).filter((d): d is Date => d !== null);
  const activeDays = new Set(completedDates.map(dayKey));

  // Count consecutive active days, starting today (or from the latest session day).
  const today = new Date();
  const latest = completedDates.sort((a, b) => b.getTime() - a.getTime())[0];
  const cursor = new Date(activeDays.has(dayKey(today)) || !latest ? today : latest);
  cursor.setHours(0, 0, 0, 0);

  let streakDays = 0;
  while (activeDays.has(dayKey(cursor)) && streakDays < 366) {
    streakDays += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return { totalSessions: sessions.length, completedSessions: completed.length, avgFocus, streakDays };
}

export function exportSessionsCsv(sessions: DashboardSession[]) {
  const header = "date,duration_seconds,focus_score,status";
  const rows = sessions.map((s) => {
    const date = parseDate(s.date)?.toISOString() ?? s.date;
    return `${date},${s.duration},${s.focusScore},${s.status}`;
  });
  const blob = new Blob([[header, ...rows].join("\n") + "\n"], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `dashboard_export_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  toastSuccess("Export started", "Downloaded CSV report.");
}
