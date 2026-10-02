import { useCallback, useEffect, useRef, useState } from "react";
import {
  loadNotesDraft,
  loadSessionHistory,
  saveNotesDraft,
  upsertSessionRecord,
  type SessionMetrics,
  type SessionRecord,
} from "@/lib/session-history";

export type SessionStatus = "idle" | "running" | "paused";

export interface TranscriptMessage {
  role: "ai" | "user";
  text: string;
}

const INITIAL_TRANSCRIPT: TranscriptMessage[] = [
  { role: "ai", text: "Hello! I'm your AI interviewer today. Let's start with the question on your screen." },
];

const AUTO_SAVE_INTERVAL_MS = 60_000;

/**
 * State and actions for a single mock-interview run: timer with pause/resume,
 * question navigation, the transcript, notes and persistence.
 */
export function useInterviewSession(questions: string[]) {
  const [status, setStatus] = useState<SessionStatus>("idle");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [transcript, setTranscript] = useState<TranscriptMessage[]>(INITIAL_TRANSCRIPT);
  const [notes, setNotesState] = useState(loadNotesDraft);
  const [history, setHistory] = useState<SessionRecord[]>(loadSessionHistory);
  const [autoSave, setAutoSave] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Timing is tracked in refs so pausing doesn't lose sub-second precision.
  const accumulatedMs = useRef(0);
  const runStartedAt = useRef<number | null>(null);
  const sessionMeta = useRef<{ id: string; startedAt: string } | null>(null);

  const isActive = status !== "idle";
  const currentQuestion = questions[questionIndex] ?? "";

  const readElapsedSeconds = () => {
    const runningMs = runStartedAt.current ? Date.now() - runStartedAt.current : 0;
    return Math.floor((accumulatedMs.current + runningMs) / 1000);
  };

  const resetTimer = () => {
    accumulatedMs.current = 0;
    runStartedAt.current = null;
    sessionMeta.current = null;
    setElapsedSeconds(0);
  };

  const setNotes = useCallback((value: string) => {
    setNotesState(value);
    saveNotesDraft(value);
  }, []);

  const saveRecord = useCallback(
    (metrics?: SessionMetrics) => {
      saveNotesDraft(notes);
      if (sessionMeta.current) {
        setHistory(
          upsertSessionRecord({
            id: sessionMeta.current.id,
            date: sessionMeta.current.startedAt,
            duration: readElapsedSeconds(),
            notes,
            metrics,
          }),
        );
      }
      setLastSaved(new Date());
    },
    [notes],
  );

  /** Saves notes and the in-progress session (used by the Save button and auto-save). */
  const save = useCallback(() => saveRecord(), [saveRecord]);

  const start = useCallback(() => {
    accumulatedMs.current = 0;
    runStartedAt.current = Date.now();
    sessionMeta.current = { id: Date.now().toString(), startedAt: new Date().toISOString() };
    setElapsedSeconds(0);
    setTranscript(INITIAL_TRANSCRIPT);
    setStatus("running");
  }, []);

  const pause = useCallback(() => {
    if (runStartedAt.current) {
      accumulatedMs.current += Date.now() - runStartedAt.current;
      runStartedAt.current = null;
    }
    setStatus("paused");
  }, []);

  const resume = useCallback(() => {
    runStartedAt.current = Date.now();
    setStatus("running");
  }, []);

  const togglePlayback = useCallback(() => {
    if (status === "idle") start();
    else if (status === "running") pause();
    else resume();
  }, [status, start, pause, resume]);

  /** Saves the run (with its measured metrics, if any) and returns to idle. */
  const end = useCallback(
    (metrics?: SessionMetrics) => {
      saveRecord(metrics);
      resetTimer();
      setStatus("idle");
    },
    [saveRecord],
  );

  /** Discards the current run and clears notes without saving. */
  const reset = useCallback(() => {
    resetTimer();
    setStatus("idle");
    setNotes("");
  }, [setNotes]);

  /** Appends recognised speech from the candidate to the transcript. */
  const addUserText = useCallback((text: string) => {
    setTranscript((prev) => [...prev, { role: "user", text }]);
  }, []);

  const nextQuestion = useCallback(
    () => setQuestionIndex((i) => Math.min(i + 1, questions.length - 1)),
    [questions.length],
  );
  const previousQuestion = useCallback(() => setQuestionIndex((i) => Math.max(i - 1, 0)), []);

  // Start from the first question whenever the question set changes.
  useEffect(() => setQuestionIndex(0), [questions]);

  // Tick the visible clock while running.
  useEffect(() => {
    if (status !== "running") return;
    const id = setInterval(() => setElapsedSeconds(readElapsedSeconds()), 250);
    return () => clearInterval(id);
  }, [status]);

  // Periodic auto-save; the ref keeps the interval stable while notes change.
  const saveRef = useRef(save);
  saveRef.current = save;
  useEffect(() => {
    if (status !== "running" || !autoSave) return;
    const id = setInterval(() => saveRef.current(), AUTO_SAVE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [status, autoSave]);

  // Post each new question to the transcript.
  useEffect(() => {
    if (!isActive || !currentQuestion) return;
    const text = `Question: "${currentQuestion}"`;
    setTranscript((prev) => (prev[prev.length - 1]?.text === text ? prev : [...prev, { role: "ai", text }]));
  }, [currentQuestion, isActive]);

  return {
    status,
    isActive,
    elapsedSeconds,
    questionIndex,
    currentQuestion,
    transcript,
    addUserText,
    notes,
    setNotes,
    history,
    autoSave,
    setAutoSave,
    lastSaved,
    start,
    pause,
    resume,
    togglePlayback,
    end,
    reset,
    save,
    nextQuestion,
    previousQuestion,
  };
}

export type InterviewSession = ReturnType<typeof useInterviewSession>;
