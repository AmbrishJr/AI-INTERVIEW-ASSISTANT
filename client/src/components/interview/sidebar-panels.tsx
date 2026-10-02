import type { ReactNode } from "react";
import { AlertTriangle, BookOpen, CheckCircle, Mic, ScanFace, Settings2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { FaceAnalysis } from "@/hooks/use-face-detection";
import type { CoachingMessage } from "@/hooks/use-live-coaching";
import type { SpeechAnalysis } from "@/hooks/use-speech-analysis";
import PanelCard from "./panel-card";
import { TONE_STYLES } from "./real-time-feedback";

const TIPS = [
  "Speak clearly and at a moderate pace",
  "Structure your answers using the STAR method",
  "Maintain good posture and eye contact",
];

const FACE_LABELS: Record<FaceAnalysis["status"], { text: string; tone: "ok" | "warn" | "bad" | "muted" }> = {
  off: { text: "Camera off", tone: "muted" },
  loading: { text: "Starting…", tone: "muted" },
  unavailable: { text: "Detection unavailable", tone: "warn" },
  "no-face": { text: "No face detected", tone: "bad" },
  "multiple-faces": { text: "Multiple faces", tone: "bad" },
  ok: { text: "Face detected", tone: "ok" },
};

const TONE_TEXT = { ok: "text-green-400", warn: "text-yellow-400", bad: "text-red-400", muted: "text-muted-foreground" };

interface FeedbackPanelProps {
  active: boolean;
  micOn: boolean;
  speech: SpeechAnalysis;
  face: FaceAnalysis;
  latest: CoachingMessage | null;
}

/** Live readings from the mic and camera, plus the most recent coaching message. */
export function FeedbackPanel({ active, micOn, speech, face, latest }: FeedbackPanelProps) {
  const faceLabel = FACE_LABELS[face.status];
  const voice = !micOn
    ? { text: "Muted", tone: "muted" as const }
    : !active
      ? { text: "Starts with the session", tone: "muted" as const }
      : speech.isSpeaking
        ? { text: "Speaking", tone: "ok" as const }
        : { text: "Silent", tone: "muted" as const };

  return (
    <PanelCard icon={<Sparkles className="w-4 h-4 text-yellow-400" />} title="Live Feedback" bodyClassName="space-y-4">
      <dl className="space-y-2 text-sm">
        <Reading icon={<Mic className="w-4 h-4" />} label="Voice">
          <span className={TONE_TEXT[voice.tone]}>{voice.text}</span>
          {micOn && active && <Progress value={speech.level * 100} className="w-16 h-1.5" aria-label="Microphone level" />}
        </Reading>
        <Reading icon={<ScanFace className="w-4 h-4" />} label="Camera">
          <span className={TONE_TEXT[faceLabel.tone]}>{faceLabel.text}</span>
        </Reading>
        {micOn && speech.totals.words > 0 && (
          <Reading icon={<BookOpen className="w-4 h-4" />} label="Words / fillers">
            <span>
              {speech.totals.words} / {speech.totals.fillers}
            </span>
          </Reading>
        )}
      </dl>

      {micOn && active && (speech.error || speech.transcriptStalled) && (
        <p className="flex items-start gap-2 text-xs text-yellow-300">
          <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          {speech.error ??
            "We can hear you, but this browser isn't returning a transcript, so pace and filler-word feedback is off. Try Google Chrome."}
        </p>
      )}

      {latest ? (
        <div className={cn("p-3 rounded-md border", TONE_STYLES[latest.tone].box)}>
          <div className="font-medium text-sm">{latest.title}</div>
          <div className="text-xs mt-1 opacity-90">{latest.message}</div>
        </div>
      ) : (
        <p className="text-center text-muted-foreground text-xs py-2">
          {active ? "Feedback appears only when something is actually detected." : "Start the session to get live feedback."}
        </p>
      )}

      <div className="space-y-2">
        <h4 className="text-xs font-medium text-muted-foreground">Quick Tips</h4>
        <ul className="space-y-2 text-sm">
          {TIPS.map((tip) => (
            <li key={tip} className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 mt-0.5 text-green-400 shrink-0" />
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    </PanelCard>
  );
}

function Reading({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="flex items-center gap-2 text-muted-foreground">
        {icon}
        {label}
      </dt>
      <dd className="flex items-center gap-2">{children}</dd>
    </div>
  );
}

export function QuestionProgressPanel({ index, total }: { index: number; total: number }) {
  const current = Math.min(index + 1, total);
  return (
    <PanelCard icon={<BookOpen className="w-4 h-4 text-blue-400" />} title="Question Progress" bodyClassName="space-y-2">
      <div className="flex justify-between text-sm">
        <span>Progress</span>
        <span>
          {current}/{total}
        </span>
      </div>
      <Progress value={total ? (current / total) * 100 : 0} className="h-2" />
      <div className="text-xs text-muted-foreground">{total - current} questions remaining</div>
    </PanelCard>
  );
}

const SHORTCUTS = [
  { keys: "Space", label: "Play/Pause" },
  { keys: "Ctrl+N", label: "Toggle Notes" },
  { keys: "Ctrl+S", label: "Save" },
  { keys: "F11", label: "Fullscreen" },
];

interface SessionOptionsPanelProps {
  pressureMode: boolean;
  onPressureModeChange: (value: boolean) => void;
}

export function SessionOptionsPanel({ pressureMode, onPressureModeChange }: SessionOptionsPanelProps) {
  return (
    <PanelCard icon={<Settings2 className="w-4 h-4 text-blue-400" />} title="Session Options" bodyClassName="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Pressure Mode</span>
        <Button
          variant="outline"
          size="sm"
          aria-pressed={pressureMode}
          onClick={() => onPressureModeChange(!pressureMode)}
          className={cn(
            "gap-1.5",
            pressureMode
              ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20"
              : "border-white/10",
          )}
        >
          <AlertTriangle className="w-4 h-4" />
          {pressureMode ? "On" : "Off"}
        </Button>
      </div>

      <div className="pt-2 border-t border-white/5">
        <p className="text-xs text-muted-foreground mb-2">Keyboard Shortcuts:</p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {SHORTCUTS.map(({ keys, label }) => (
            <div key={keys} className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-[0.7rem] font-mono">{keys}</kbd>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </PanelCard>
  );
}
