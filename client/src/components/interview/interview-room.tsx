import {
  clearNavigationGuard,
  registerNavigationGuard,
} from "@/lib/guarded-location";
import { useEffect, useRef, useState, type ReactNode } from "react";
import ConfirmDialog from "@/components/common/confirm-dialog";
import { useFullscreen } from "@/hooks/use-fullscreen";
import { useFaceDetection } from "@/hooks/use-face-detection";
import { useInterviewSession } from "@/hooks/use-interview-session";
import { useLiveCoaching } from "@/hooks/use-live-coaching";
import {
  useSessionRecorder,
  type SessionReport,
} from "@/hooks/use-session-recorder";
import { useSpeechAnalysis } from "@/hooks/use-speech-analysis";
import InterviewReplay from "./interview-replay";
import InterviewTimer from "./interview-timer";
import NotesPanel from "./notes-panel";
import RealTimeFeedback from "./real-time-feedback";
import SessionHeaderCard from "./session-header-card";
import SessionHistoryPanel from "./session-history-panel";
import {
  FeedbackPanel,
  QuestionProgressPanel,
  SessionOptionsPanel,
} from "./sidebar-panels";
import TranscriptPanel from "./transcript-panel";
import WebcamPanel from "./webcam-panel";

type PendingConfirm = "end" | "reset" | "exit" | "navigate" | null;

const CONFIRM_COPY = {
  end: {
    title: "End Session?",
    message:
      "Are you sure you want to end this session? Your progress will be saved.",
    confirmLabel: "End Session",
  },
  reset: {
    title: "Reset Session?",
    message: "This clears the timer and your notes. This cannot be undone.",
    confirmLabel: "Reset",
  },
  navigate: {
    title: "Leave this session?",
    message: "Your session will be saved and ended before you leave.",
    confirmLabel: "Save and leave",
  },
  exit: {
    title: "Leave Session?",
    message:
      "Your session is still running. It will be saved and ended if you leave.",
    confirmLabel: "Leave",
  },
} as const;

interface InterviewRoomProps {
  questions: string[];
  /** Small caps line above the question, e.g. "Frontend • Technical • Medium". */
  subtitle: string;
  exitLabel: string;
  onExit: () => void;
  /** Optional settings card; when given, a settings toggle appears in the header. */
  settingsPanel?: ReactNode;
}

export default function InterviewRoom({
  questions,
  subtitle,
  exitLabel,
  onExit,
  settingsPanel,
}: InterviewRoomProps) {
  const session = useInterviewSession(questions, subtitle);
  const { isFullscreen, toggleFullscreen } = useFullscreen();

  const [pendingConfirm, setPendingConfirm] = useState<PendingConfirm>(null);
  const [showNotes, setShowNotes] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(true);
  const [showReplay, setShowReplay] = useState(false);
  const [pressureMode, setPressureMode] = useState(false);
  const pendingNavigation = useRef<(() => void) | null>(null);
  const notesRef = useRef<HTMLTextAreaElement>(null);

  // Real-time analysis: camera (face) and microphone (voice + speech-to-text).
  const [camOn, setCamOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [video, setVideo] = useState<HTMLVideoElement | null>(null);
  const running = session.status === "running";
  const face = useFaceDetection(video, camOn);
  const speech = useSpeechAnalysis(
    running && micOn,
    session.addUserText,
    session.sessionId,
  );
  const coaching = useLiveCoaching({
    active: running,
    micOn,
    camOn,
    face,
    speech,
    resetKey: session.questionIndex,
  });
  const recorder = useSessionRecorder({
    status: session.status,
    elapsedSeconds: session.elapsedSeconds,
    transcript: session.transcript,
    speech,
    face,
    camOn,
    micOn,
    coachingMessages: coaching.messages,
  });
  const [report, setReport] = useState<SessionReport | null>(null);

  /** Saves the session with its measured metrics and returns the full recording. */
  const finishSession = () => {
    const finished = recorder.finish();
    session.end(finished.metrics);
    clearNavigationGuard();
    return finished;
  };

  const endSession = () => {
    setReport(finishSession());
    setShowReplay(true);
  };

  const requestExit = () => {
    if (session.isActive) setPendingConfirm("exit");
    else onExit();
  };

  const handleConfirm = () => {
    if (pendingConfirm === "navigate") {
      finishSession();
      pendingNavigation.current?.();
      pendingNavigation.current = null;
    }
    if (pendingConfirm === "end") endSession();
    if (pendingConfirm === "reset") session.reset();
    if (pendingConfirm === "exit") {
      finishSession();
      onExit();
    }
    setPendingConfirm(null);
  };

  const saveRef = useRef(session.save);
  saveRef.current = session.save;
  useEffect(() => {
    if (!session.isActive) return;
    const unregister = registerNavigationGuard((proceed) => {
      pendingNavigation.current = proceed;
      setPendingConfirm("navigate");
    });
    const beforeUnload = (event: BeforeUnloadEvent) => {
      saveRef.current();
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => {
      unregister();
      window.removeEventListener("beforeunload", beforeUnload);
    };
  }, [session.isActive]);
  const togglePlayback = () => {
    if (!pressureMode || session.status !== "running") session.togglePlayback();
  };
  const setPressure = (next: boolean) => {
    if (next && session.status === "paused") session.resume();
    setPressureMode(next);
  };
  const toggleNotes = () => {
    setShowNotes((open) => {
      if (!open) setTimeout(() => notesRef.current?.focus(), 100);
      return !open;
    });
  };

  // Keyboard shortcuts: Space = start/pause/resume, Ctrl/Cmd+N = notes, Ctrl/Cmd+S = save.
  const shortcuts = useRef({ togglePlayback, save: session.save, toggleNotes });
  shortcuts.current = { togglePlayback, save: session.save, toggleNotes };
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isTyping = Boolean(
        target?.closest(
          "input, textarea, select, button, a, [role=dialog], [role=combobox], [contenteditable=true]",
        ),
      );
      const mod = e.ctrlKey || e.metaKey;

      if (e.code === "Space" && !isTyping) {
        e.preventDefault();
        shortcuts.current.togglePlayback();
      } else if (mod && e.code === "KeyN") {
        e.preventDefault();
        shortcuts.current.toggleNotes();
      } else if (mod && e.code === "KeyS") {
        e.preventDefault();
        shortcuts.current.save();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="gap-6 flex flex-col max-w-[1600px] mx-auto">
      <InterviewReplay
        isOpen={showReplay}
        onClose={() => setShowReplay(false)}
        report={report}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        <div className="lg:col-span-2 min-w-0 space-y-4">
          <SessionHeaderCard
            session={session}
            pressureMode={pressureMode}
            subtitle={subtitle}
            totalQuestions={questions.length}
            exitLabel={exitLabel}
            onExit={requestExit}
            onRequestEnd={() => setPendingConfirm("end")}
            onRequestReset={() => setPendingConfirm("reset")}
            onToggleNotes={toggleNotes}
            onToggleHistory={() => setShowHistory((v) => !v)}
            onToggleSettings={
              settingsPanel ? () => setShowSettings((v) => !v) : undefined
            }
            isFullscreen={isFullscreen}
            onToggleFullscreen={toggleFullscreen}
          />

          <WebcamPanel
            isActive={session.isActive}
            onStart={session.start}
            onEnd={() => setPendingConfirm("end")}
            camOn={camOn}
            micOn={micOn}
            onToggleCam={() => setCamOn((on) => !on)}
            onToggleMic={() => setMicOn((on) => !on)}
            face={face}
            onVideoElement={setVideo}
          />

          <TranscriptPanel
            messages={session.transcript}
            interim={speech.interim}
          />

          {showNotes && (
            <NotesPanel
              notes={session.notes}
              onNotesChange={session.setNotes}
              autoSave={session.autoSave}
              onAutoSaveChange={session.setAutoSave}
              lastSaved={session.lastSaved}
              textareaRef={notesRef}
            />
          )}

          {showHistory && <SessionHistoryPanel sessions={session.history} />}
        </div>

        <aside className="min-w-0 space-y-4">
          <InterviewTimer
            status={session.status}
            elapsedSeconds={session.elapsedSeconds}
            pressureMode={pressureMode}
            onToggle={togglePlayback}
          />
          <FeedbackPanel
            active={running}
            micOn={micOn}
            speech={speech}
            face={face}
            latest={coaching.latest}
          />
          <QuestionProgressPanel
            index={session.questionIndex}
            total={questions.length}
          />
          <SessionOptionsPanel
            pressureMode={pressureMode}
            onPressureModeChange={setPressure}
          />
          {settingsPanel && showSettings && (
            <fieldset disabled={session.isActive}>
              <legend className="sr-only">Session settings</legend>
              {settingsPanel}
              {session.isActive && (
                <p className="text-xs text-muted-foreground mt-2">
                  End the session to change its question set.
                </p>
              )}
            </fieldset>
          )}
        </aside>
      </div>

      {pendingConfirm && (
        <ConfirmDialog
          open
          {...CONFIRM_COPY[pendingConfirm]}
          onConfirm={handleConfirm}
          onCancel={() => {
            setPendingConfirm(null);
            pendingNavigation.current = null;
          }}
        />
      )}
    </div>
  );
}
