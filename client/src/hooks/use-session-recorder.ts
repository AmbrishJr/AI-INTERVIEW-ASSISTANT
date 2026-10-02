import { useCallback, useEffect, useRef } from "react";
import type { SessionMetrics } from "@/lib/session-history";
import type { FaceAnalysis } from "./use-face-detection";
import type { SessionStatus, TranscriptMessage } from "./use-interview-session";
import type { CoachingMessage } from "./use-live-coaching";
import type { SpeechAnalysis } from "./use-speech-analysis";

/** What the camera saw at one sample. */
export type FaceSample = "facing" | "looking-away" | "no-face" | "multiple-faces" | "off";

export interface ReplaySample {
  /** Seconds into the session (paused time excluded). */
  t: number;
  speaking: boolean;
  face: FaceSample;
}

export interface ReplayEntry {
  t: number;
  role: TranscriptMessage["role"];
  text: string;
  wpm?: number | null;
  fillers?: string[];
}

export interface ReplayMoment {
  t: number;
  tone: CoachingMessage["tone"];
  title: string;
  message: string;
}

export interface SessionReport {
  durationSec: number;
  samples: ReplaySample[];
  transcript: ReplayEntry[];
  moments: ReplayMoment[];
  metrics: SessionMetrics;
}

const SAMPLE_INTERVAL_MS = 1000;

const faceSample = (face: FaceAnalysis, camOn: boolean): FaceSample => {
  if (!camOn || face.status === "off" || face.status === "loading" || face.status === "unavailable") return "off";
  if (face.status === "ok") return face.issues.includes("looking-away") ? "looking-away" : "facing";
  return face.status;
};

const pct = (part: number, whole: number) => (whole > 0 ? Math.round((part / whole) * 100) : 0);

function computeMetrics(samples: ReplaySample[], transcript: ReplayEntry[]): SessionMetrics {
  const camSamples = samples.filter((s) => s.face !== "off");
  const userEntries = transcript.filter((e) => e.role === "user");
  const words = userEntries.reduce((n, e) => n + e.text.split(/\s+/).filter(Boolean).length, 0);
  const paced = userEntries.filter((e): e is ReplayEntry & { wpm: number } => typeof e.wpm === "number");
  const pacedWords = paced.reduce((n, e) => n + e.text.split(/\s+/).filter(Boolean).length, 0);
  const weightedWpm = paced.reduce((n, e) => n + e.wpm * e.text.split(/\s+/).filter(Boolean).length, 0);

  return {
    talkPct: pct(samples.filter((s) => s.speaking).length, samples.length),
    faceVisiblePct: camSamples.length
      ? pct(camSamples.filter((s) => s.face === "facing" || s.face === "looking-away").length, camSamples.length)
      : null,
    eyeContactPct: camSamples.length ? pct(camSamples.filter((s) => s.face === "facing").length, camSamples.length) : null,
    avgWpm: pacedWords ? Math.round(weightedWpm / pacedWords) : null,
    words,
    fillers: userEntries.reduce((n, e) => n + (e.fillers?.length ?? 0), 0),
  };
}

interface RecorderInput {
  status: SessionStatus;
  elapsedSeconds: number;
  transcript: TranscriptMessage[];
  speech: SpeechAnalysis;
  face: FaceAnalysis;
  camOn: boolean;
  coachingMessages: CoachingMessage[];
}

/**
 * Records what actually happened during a session — speaking, face/eye contact,
 * the transcript and every coaching message — so it can be replayed and summarised.
 */
export function useSessionRecorder({ status, elapsedSeconds, transcript, speech, face, camOn, coachingMessages }: RecorderInput) {
  const recording = useRef<{ samples: ReplaySample[]; transcript: ReplayEntry[]; moments: ReplayMoment[] }>({
    samples: [],
    transcript: [],
    moments: [],
  });
  const stampedMessages = useRef(0);
  const seenCoaching = useRef(new Set<number>());

  const latest = useRef({ elapsedSeconds, speech, face, camOn });
  latest.current = { elapsedSeconds, speech, face, camOn };

  // Start a fresh recording each time a session starts (idle -> running).
  const prevStatus = useRef(status);
  useEffect(() => {
    if (prevStatus.current === "idle" && status === "running") {
      recording.current = { samples: [], transcript: [], moments: [] };
      stampedMessages.current = 0;
      seenCoaching.current = new Set();
    }
    prevStatus.current = status;
  }, [status]);

  // Sample voice + face once per second while running (pauses are skipped).
  useEffect(() => {
    if (status !== "running") return;
    const id = setInterval(() => {
      const { elapsedSeconds, speech, face, camOn } = latest.current;
      recording.current.samples.push({ t: elapsedSeconds, speaking: speech.isSpeaking, face: faceSample(face, camOn) });
    }, SAMPLE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [status]);

  // Timestamp each new transcript line; attach pace/fillers to the candidate's answers.
  useEffect(() => {
    if (status === "idle") return;
    const fresh = transcript.slice(stampedMessages.current);
    stampedMessages.current = transcript.length;
    const { elapsedSeconds, speech } = latest.current;
    for (const msg of fresh) {
      const segment = msg.role === "user" && speech.lastSegment?.text === msg.text ? speech.lastSegment : null;
      recording.current.transcript.push({
        t: elapsedSeconds,
        role: msg.role,
        text: msg.text,
        ...(segment && { wpm: segment.wpm, fillers: segment.fillers }),
      });
    }
  }, [transcript, status]);

  // Keep every coaching message as a "key moment".
  useEffect(() => {
    if (status === "idle") return;
    for (const m of coachingMessages) {
      if (seenCoaching.current.has(m.id)) continue;
      seenCoaching.current.add(m.id);
      recording.current.moments.push({ t: latest.current.elapsedSeconds, tone: m.tone, title: m.title, message: m.message });
    }
  }, [coachingMessages, status]);

  /** Snapshot of the recording so far, with summary metrics. */
  const finish = useCallback((): SessionReport => {
    const { samples, transcript, moments } = recording.current;
    return {
      durationSec: Math.max(latest.current.elapsedSeconds, samples[samples.length - 1]?.t ?? 0),
      samples: [...samples],
      transcript: [...transcript],
      moments: [...moments],
      metrics: computeMetrics(samples, transcript),
    };
  }, []);

  return { finish };
}
