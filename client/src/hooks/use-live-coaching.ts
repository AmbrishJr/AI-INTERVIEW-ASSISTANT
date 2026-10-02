import { useCallback, useEffect, useRef, useState } from "react";
import type { FaceAnalysis, FaceIssue } from "./use-face-detection";
import type { SpeechAnalysis } from "./use-speech-analysis";

export type CoachingTone = "positive" | "suggestion" | "warning" | "error";
export type CoachingTopic = "face" | "eyes" | "framing" | "pace" | "fillers" | "silence";

export interface CoachingMessage {
  id: number;
  tone: CoachingTone;
  topic: CoachingTopic;
  title: string;
  message: string;
}

interface Rule {
  key: string;
  /** How long the condition must hold continuously before we say anything. */
  holdMs: number;
  /** Minimum gap before the same advice is repeated. */
  cooldownMs: number;
  build: () => Omit<CoachingMessage, "id">;
}

const MESSAGE_LIFETIME_MS = 6000;
const MAX_VISIBLE = 3;
const TICK_MS = 500;
const FAST_WPM = 180;
const SLOW_WPM = 95;

const FACE_RULES: Record<"no-face" | "multiple-faces" | FaceIssue, Rule> = {
  "no-face": {
    key: "no-face",
    holdMs: 1500,
    cooldownMs: 10_000,
    build: () => ({ tone: "error", topic: "face", title: "Face not detected", message: "Make sure your face is visible, well lit and inside the frame." }),
  },
  "multiple-faces": {
    key: "multiple-faces",
    holdMs: 2000,
    cooldownMs: 20_000,
    build: () => ({ tone: "warning", topic: "face", title: "Multiple faces", message: "More than one person is in view. Interview alone if you can." }),
  },
  "looking-away": {
    key: "looking-away",
    holdMs: 2500,
    cooldownMs: 15_000,
    build: () => ({ tone: "suggestion", topic: "eyes", title: "Eye contact", message: "You're looking away. Look at the camera as if it's the interviewer." }),
  },
  "too-far": {
    key: "too-far",
    holdMs: 3000,
    cooldownMs: 30_000,
    build: () => ({ tone: "suggestion", topic: "framing", title: "Framing", message: "You're far from the camera. Move a little closer." }),
  },
  "too-close": {
    key: "too-close",
    holdMs: 3000,
    cooldownMs: 30_000,
    build: () => ({ tone: "suggestion", topic: "framing", title: "Framing", message: "You're very close to the camera. Lean back slightly." }),
  },
  "off-center": {
    key: "off-center",
    holdMs: 3000,
    cooldownMs: 30_000,
    build: () => ({ tone: "suggestion", topic: "framing", title: "Framing", message: "Center yourself in the frame." }),
  },
};

const SILENCE_RULE: Rule = {
  key: "silence",
  holdMs: 30_000,
  cooldownMs: 60_000,
  build: () => ({ tone: "suggestion", topic: "silence", title: "Ready when you are", message: "Take a breath and start answering. A short pause to think is fine." }),
};

interface LiveCoachingInput {
  /** Session is running (not idle/paused). */
  active: boolean;
  micOn: boolean;
  camOn: boolean;
  face: FaceAnalysis;
  speech: SpeechAnalysis;
  /** Changing this (e.g. the question index) resets the silence timer. */
  resetKey: unknown;
}

/**
 * Turns real measurements (face detection + speech analysis) into coaching messages.
 * Nothing is emitted unless the underlying condition was actually observed.
 */
export function useLiveCoaching({ active, micOn, camOn, face, speech, resetKey }: LiveCoachingInput) {
  const [messages, setMessages] = useState<CoachingMessage[]>([]);
  const nextId = useRef(1);
  const lastSaidAt = useRef<Record<string, number>>({});
  const conditionSince = useRef<Record<string, number>>({});
  const quietSince = useRef(performance.now());

  const say = useCallback((rule: Pick<Rule, "key" | "cooldownMs">, body: Omit<CoachingMessage, "id">) => {
    const now = performance.now();
    if (now - (lastSaidAt.current[rule.key] ?? -Infinity) < rule.cooldownMs) return;
    lastSaidAt.current[rule.key] = now;
    const msg = { ...body, id: nextId.current++ };
    setMessages((prev) => [...prev.slice(-(MAX_VISIBLE - 1)), msg]);
    setTimeout(() => setMessages((prev) => prev.filter((m) => m.id !== msg.id)), MESSAGE_LIFETIME_MS);
  }, []);

  // Clear everything when the session stops or the question changes.
  useEffect(() => {
    conditionSince.current = {};
    quietSince.current = performance.now();
    if (!active) setMessages([]);
  }, [active, resetKey]);

  // Latest inputs for the ticking evaluator, without restarting the interval on every change.
  const latest = useRef({ face, speech, micOn, camOn });
  latest.current = { face, speech, micOn, camOn };

  // Condition-based rules (face + silence), checked on a steady tick.
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => {
      const { face, speech, micOn, camOn } = latest.current;
      const now = performance.now();
      const holding = new Set<Rule>();

      if (camOn && face.status === "no-face") holding.add(FACE_RULES["no-face"]);
      if (camOn && face.status === "multiple-faces") holding.add(FACE_RULES["multiple-faces"]);
      if (camOn && face.status === "ok") face.issues.forEach((issue) => holding.add(FACE_RULES[issue]));

      const lastSpoke = Math.max(speech.lastSpokeAtRef.current ?? 0, quietSince.current);
      if (micOn && !speech.micError && now - lastSpoke >= SILENCE_RULE.holdMs) holding.add(SILENCE_RULE);

      for (const rule of [...Object.values(FACE_RULES), SILENCE_RULE]) {
        if (!holding.has(rule)) {
          delete conditionSince.current[rule.key];
          continue;
        }
        // Silence measures its own duration; other rules start counting now.
        const since = rule === SILENCE_RULE ? lastSpoke : (conditionSince.current[rule.key] ??= now);
        if (now - since >= rule.holdMs) say(rule, rule.build());
      }
    }, TICK_MS);
    return () => clearInterval(id);
  }, [active, say]);

  // Speech rules: evaluated once per finished utterance, so feedback only follows real speech.
  const segment = speech.lastSegment;
  useEffect(() => {
    if (!active || !micOn || !segment) return;

    if (segment.fillers.length > 0) {
      const unique = Array.from(new Set(segment.fillers)).map((f) => `"${f}"`).join(", ");
      say(
        { key: "fillers", cooldownMs: 15_000 },
        { tone: "warning", topic: "fillers", title: "Filler words", message: `You said ${unique}. Try a short silent pause instead.` },
      );
    }

    if (segment.wpm !== null) {
      if (segment.wpm > FAST_WPM) {
        say(
          { key: "pace-fast", cooldownMs: 20_000 },
          { tone: "warning", topic: "pace", title: "Pace", message: `You're speaking quickly (~${segment.wpm} words/min). Slow down a little.` },
        );
      } else if (segment.wpm < SLOW_WPM) {
        say(
          { key: "pace-slow", cooldownMs: 20_000 },
          { tone: "suggestion", topic: "pace", title: "Pace", message: `Your pace is slow (~${segment.wpm} words/min). Try to keep a steady flow.` },
        );
      } else if (segment.fillers.length === 0) {
        const { face, camOn } = latest.current;
        const goodEyes = !camOn || (face.status === "ok" && !face.issues.includes("looking-away"));
        if (goodEyes) {
          say(
            { key: "positive", cooldownMs: 45_000 },
            { tone: "positive", topic: "pace", title: "Nice delivery", message: "Clear, steady pace. Keep it up." },
          );
        }
      }
    }
    // Only react to a new segment, not to every face/mic change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [segment?.id]);

  return { messages, latest: messages[messages.length - 1] ?? null };
}
