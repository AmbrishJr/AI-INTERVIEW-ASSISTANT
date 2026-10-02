import { useEffect, useRef, useState, type ReactNode } from "react";
import ConfirmDialog from "@/components/common/confirm-dialog";
import { useFullscreen } from "@/hooks/use-fullscreen";
import { useFaceDetection } from "@/hooks/use-face-detection";
import { useInterviewSession } from "@/hooks/use-interview-session";
import { useLiveCoaching } from "@/hooks/use-live-coaching";
import { useSessionRecorder, type SessionReport } from "@/hooks/use-session-recorder";
import { useSpeechAnalysis } from "@/hooks/use-speech-analysis";
import InterviewReplay from "./interview-replay";
import InterviewTimer from "./interview-timer";
import NotesPanel from "./notes-panel";
import RealTimeFeedback from "./real-time-feedback";
import SessionHeaderCard from "./session-header-card";
import SessionHistoryPanel from "./session-history-panel";
import { FeedbackPanel, QuestionProgressPanel, SessionOptionsPanel } from "./sidebar-panels";
import TranscriptPanel from "./transcript-panel";
import WebcamPanel from "./webcam-panel";

type PendingConfirm = "end" | "reset" | "exit" | null;

const CONFIRM_COPY = {
  end: {
    title: "End Session?",
    message: "Are you sure you want to end this session? Your progress will be saved.",
    confirmLabel: "End Session",
  },
  reset: {
    title: "Reset Session?",
    message: "This clears the timer and your notes. This cannot be undone.",
    confirmLabel: "Reset",
  },
  exit: {
    title: "Leave Session?",
    message: "Your session is still running. It will be saved and ended if you leave.",
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

export default function InterviewRoom({ questions, subtitle, exitLabel, onExit, settingsPanel }: InterviewRoomProps) {
  const session = useInterviewSession(questions);
  const { isFullscreen, toggleFullscreen } = useFullscreen();

  const [pendingConfirm, setPendingConfirm] = useState<PendingConfirm>(null);
  const [showNotes, setShowNotes] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(true);
  const [showReplay, setShowReplay] = useState(false);
  const [pressureMode, setPressureMode] = useState(false);
  const notesRef = useRef<HTMLTextAreaElement>(null);

  // Real-time analysis: camera (face) and microphone (voice + speech-to-text).
  const [camOn, setCamOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [video, setVideo] = useState<HTMLVideoElement | null>(null);
  const running = session.status === "running";
  const face = useFaceDetection(video, camOn);
  const speech = useSpeechAnalysis(running && micOn, session.addUserText);
  const coaching = useLiveCoaching({ active: running, micOn, camOn, face, speech, resetKey: session.questionIndex });
  const recorder = useSessionRecorder({
    status: session.status,
    elapsedSeconds: session.elapsedSeconds,
    transcript: session.transcript,
    speech,
    face,
    camOn,
    coachingMessages: coaching.messages,
  });
  const [report, setReport] = useState<SessionReport | null>(null);

  /** Saves the session with its measured metrics and returns the full recording. */
  const finishSession = () => {
    const finished = recorder.finish();
    session.end(finished.metrics);
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
    if (pendingConfirm === "end") endSession();
    if (pendingConfirm === "reset") session.reset();
    if (pendingConfirm === "exit") {
      finishSession();
      onExit();
    }
    setPendingConfirm(null);
  };

  const toggleNotes = () => {
    setShowNotes((open) => {
      if (!open) setTimeout(() => notesRef.current?.focus(), 100);
      return !open;
    });
  };

  // Keyboard shortcuts: Space = start/pause/resume, Ctrl/Cmd+N = notes, Ctrl/Cmd+S = save.
  const shortcuts = useRef({ togglePlayback: session.togglePlayback, save: session.save, toggleNotes });
  shortcuts.current = { togglePlayback: session.togglePlayback, save: session.save, toggleNotes };
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isTyping = target?.tagName === "TEXTAREA" || target?.tagName === "INPUT" || target?.isContentEditable;
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
    <div className="p-6 gap-6 flex flex-col max-w-[1600px] mx-auto">
      <RealTimeFeedback messages={coaching.messages} />
      <InterviewReplay isOpen={showReplay} onClose={() => setShowReplay(false)} report={report} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        <div className="lg:col-span-2 space-y-4">
          <SessionHeaderCard
            session={session}
            subtitle={subtitle}
            totalQuestions={questions.length}
            exitLabel={exitLabel}
            onExit={requestExit}
            onRequestEnd={() => setPendingConfirm("end")}
            onRequestReset={() => setPendingConfirm("reset")}
            onToggleNotes={toggleNotes}
            onToggleHistory={() => setShowHistory((v) => !v)}
            onToggleSettings={settingsPanel ? () => setShowSettings((v) => !v) : undefined}
            isFullscreen={isFullscreen}
            onToggleFullscreen={toggleFullscreen}
          />

          <WebcamPanel
            isActive={session.isActive}
            onStart={session.start}
            onEnd={endSession}
            camOn={camOn}
            micOn={micOn}
            onToggleCam={() => setCamOn((on) => !on)}
            onToggleMic={() => setMicOn((on) => !on)}
            face={face}
            onVideoElement={setVideo}
          />

          <TranscriptPanel messages={session.transcript} interim={speech.interim} />

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

        <aside className="space-y-4">
          <InterviewTimer isActive={session.isActive} pressureMode={pressureMode} />
          <FeedbackPanel active={running} micOn={micOn} speech={speech} face={face} latest={coaching.latest} />
          <QuestionProgressPanel index={session.questionIndex} total={questions.length} />
          <SessionOptionsPanel pressureMode={pressureMode} onPressureModeChange={setPressureMode} />
          {settingsPanel && showSettings && settingsPanel}
        </aside>
      </div>

      {pendingConfirm && (
        <ConfirmDialog
          open
          {...CONFIRM_COPY[pendingConfirm]}
          onConfirm={handleConfirm}
          onCancel={() => setPendingConfirm(null)}
        />
      )}
    </div>
  );
}
