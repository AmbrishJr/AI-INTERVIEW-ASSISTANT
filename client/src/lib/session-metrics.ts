import type { SessionRecord } from "./session-history";
export function measured(value: unknown, max = Infinity): number | null {
  return typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 0 &&
    value <= max
    ? value
    : null;
}
export function averageMeasured(values: (number | null)[]): number | null {
  const valid = values.filter((v): v is number => v !== null);
  return valid.length
    ? Math.round(valid.reduce((sum, v) => sum + v, 0) / valid.length)
    : null;
}
export function filterSessions(
  sessions: SessionRecord[],
  timeframe: string,
  now = new Date(),
) {
  const days =
    ({ "24h": 1, "7d": 7, "30d": 30, "90d": 90 } as Record<string, number>)[
      timeframe
    ] ?? 7;
  const cutoff = now.getTime() - days * 86400000;
  return sessions.filter(
    (s) => Date.parse(s.date) >= cutoff && Date.parse(s.date) <= now.getTime(),
  );
}
export function currentStreak(dates: string[], now = new Date()) {
  const day = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  const active = new Set(
    dates
      .filter((d) => Number.isFinite(Date.parse(d)))
      .map((d) => day(new Date(d))),
  );
  const cursor = new Date(now);
  cursor.setHours(0, 0, 0, 0);
  if (!active.has(day(cursor))) cursor.setDate(cursor.getDate() - 1);
  let count = 0;
  while (active.has(day(cursor)) && count < 366) {
    count++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return count;
}
export function summarizeSessions(sessions: SessionRecord[]) {
  return {
    count: sessions.length,
    completed: sessions.filter((s) => s.status === "completed").length,
    minutes: Math.round(sessions.reduce((sum, s) => sum + s.duration, 0) / 60),
    camera: averageMeasured(
      sessions.map((s) => measured(s.metrics?.eyeContactPct, 100)),
    ),
    pace: averageMeasured(sessions.map((s) => measured(s.metrics?.avgWpm))),
    streak: currentStreak(
      sessions.filter((s) => s.status === "completed").map((s) => s.date),
    ),
  };
}
