/**
 * Persistence for completed interview sessions and the in-progress notes draft.
 * Shared by the interview room (writes) and the dashboard (reads).
 */

/** Measured performance for one session (all percentages 0-100). */
export interface SessionMetrics {
  /** Share of session time the microphone detected you speaking. */
  talkPct: number;
  /** Share of camera-on time a single face was in frame (null if the camera was off). */
  faceVisiblePct: number | null;
  /** Share of camera-on time you were facing the camera. */
  eyeContactPct: number | null;
  /** Word-weighted average speaking pace, or null if too little speech was recognised. */
  avgWpm: number | null;
  words: number;
  fillers: number;
}

export interface SessionRecord {
  id: string;
  duration: number;
  date: string;
  notes: string;
  metrics?: SessionMetrics;
}

const HISTORY_KEY = "sessionHistory";
const NOTES_KEY = "sessionNotes";
const MAX_HISTORY = 10;

export function loadSessionHistory(): SessionRecord[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(HISTORY_KEY) ?? "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((s) => ({
        id: String(s?.id ?? ""),
        duration: Number(s?.duration ?? 0),
        date: String(s?.date ?? ""),
        notes: String(s?.notes ?? ""),
        metrics: s?.metrics && typeof s.metrics === "object" ? (s.metrics as SessionMetrics) : undefined,
      }))
      .filter((s) => s.id && s.date);
  } catch {
    return [];
  }
}

/** Inserts the record, or replaces an existing one with the same id. Returns the new history. */
export function upsertSessionRecord(record: SessionRecord): SessionRecord[] {
  const rest = loadSessionHistory().filter((s) => s.id !== record.id);
  const next = [record, ...rest].slice(0, MAX_HISTORY);
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  } catch {
    // ignore storage failures
  }
  return next;
}

export function loadNotesDraft(): string {
  try {
    return localStorage.getItem(NOTES_KEY) ?? "";
  } catch {
    return "";
  }
}

export function saveNotesDraft(notes: string) {
  try {
    if (notes) localStorage.setItem(NOTES_KEY, notes);
    else localStorage.removeItem(NOTES_KEY);
  } catch {
    // ignore storage failures
  }
}
