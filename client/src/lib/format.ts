/** Formats seconds as HH:MM:SS. */
export function formatClock(totalSeconds: number): string {
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = Math.floor(totalSeconds % 60);
  return [hrs, mins, secs].map((n) => n.toString().padStart(2, "0")).join(":");
}

/** Formats seconds as a short human duration, e.g. "4m 05s" or "1h 20m". */
export function formatDuration(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.floor(totalSeconds % 60);
  if (m < 60) return `${m}m ${s.toString().padStart(2, "0")}s`;
  return `${Math.floor(m / 60)}h ${m % 60}m`;
}

/** Parses an ISO date string, returning null when invalid. */
export function parseDate(iso: string): Date | null {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** "Today", "1 day ago", "3 days ago", "2 weeks ago". */
export function formatDaysAgo(days: number): string {
  if (days <= 0) return "Today";
  if (days === 1) return "1 day ago";
  if (days % 7 === 0) {
    const weeks = days / 7;
    return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  }
  return `${days} days ago`;
}
