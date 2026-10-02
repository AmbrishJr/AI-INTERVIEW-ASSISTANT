import type { ReactNode } from "react";
import {
  ArrowLeft, BookOpen, Clock, History, Maximize2, Minimize2, Pause, Play, RotateCw, Save, Settings2, Square,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatClock } from "@/lib/format";
import type { InterviewSession } from "@/hooks/use-interview-session";

interface SessionHeaderCardProps {
  session: InterviewSession;
  subtitle: string;
  totalQuestions: number;
  exitLabel: string;
  onExit: () => void;
  onRequestEnd: () => void;
  onRequestReset: () => void;
  onToggleNotes: () => void;
  onToggleHistory: () => void;
  onToggleSettings?: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

const ONE_HOUR = 3600;

export default function SessionHeaderCard({
  session,
  subtitle,
  totalQuestions,
  exitLabel,
  onExit,
  onRequestEnd,
  onRequestReset,
  onToggleNotes,
  onToggleHistory,
  onToggleSettings,
  isFullscreen,
  onToggleFullscreen,
}: SessionHeaderCardProps) {
  const { status, isActive, elapsedSeconds, questionIndex, currentQuestion, lastSaved, notes } = session;

  return (
    <Card className="p-6 bg-card/60 backdrop-blur-md border-primary/20 shadow-[0_0_30px_rgba(0,0,0,0.3)] relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-primary" />

      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-start gap-4">
          <div>
            <h2 className="text-muted-foreground text-sm font-mono uppercase tracking-wider">{subtitle}</h2>
            <div className="flex items-center mt-1 space-x-2">
              <div className="flex items-center text-sm text-primary bg-primary/10 px-2 py-0.5 rounded">
                <Clock className="w-3.5 h-3.5 mr-1" />
                {formatClock(elapsedSeconds)}
              </div>
              {lastSaved && (
                <span className="text-xs text-muted-foreground">Saved at {lastSaved.toLocaleTimeString()}</span>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {onToggleSettings && (
              <IconButton label="Toggle settings" onClick={onToggleSettings}>
                <Settings2 size={16} />
              </IconButton>
            )}
            <IconButton label={isFullscreen ? "Exit fullscreen" : "Fullscreen"} onClick={onToggleFullscreen}>
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </IconButton>
            <button
              type="button"
              onClick={onExit}
              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-lg transition-all flex items-center gap-2 text-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{exitLabel}</span>
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xl font-medium font-heading leading-tight">"{currentQuestion}"</p>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Question {questionIndex + 1} of {totalQuestions}
            </span>
            <Progress value={((questionIndex + 1) / Math.max(totalQuestions, 1)) * 100} className="w-32 h-2" />
          </div>
        </div>

        <Progress value={Math.min(100, (elapsedSeconds / ONE_HOUR) * 100)} className="h-1.5" />

        <div className="flex flex-wrap gap-2 pt-2">
          {status === "idle" ? (
            <Button onClick={session.start} className="gap-1.5 bg-primary hover:bg-primary/90">
              <Play className="w-4 h-4" />
              Start Session
            </Button>
          ) : status === "paused" ? (
            <Button onClick={session.resume} className="gap-1.5 bg-green-600 hover:bg-green-700">
              <Play className="w-4 h-4" />
              Resume
            </Button>
          ) : (
            <Button onClick={session.pause} variant="outline" className="gap-1.5">
              <Pause className="w-4 h-4" />
              Pause
            </Button>
          )}

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={session.previousQuestion}
              disabled={questionIndex === 0}
              className="border-white/10 hover:bg-white/5"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={session.nextQuestion}
              disabled={questionIndex >= totalQuestions - 1}
              className="border-white/10 hover:bg-white/5"
            >
              Next
            </Button>
          </div>

          <div className="flex-1" />

          <ToolbarButton icon={<BookOpen className="w-4 h-4" />} label="Notes" title="Toggle Notes (Ctrl+N)" onClick={onToggleNotes} />
          <ToolbarButton icon={<History className="w-4 h-4" />} label="History" onClick={onToggleHistory} />
          <ToolbarButton
            icon={<Save className="w-4 h-4" />}
            label="Save"
            title="Save (Ctrl+S)"
            onClick={session.save}
            disabled={!isActive && !notes.trim()}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={onRequestReset}
            className="gap-1.5 border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-400"
          >
            <RotateCw className="w-4 h-4" />
            <span className="hidden sm:inline">Reset</span>
          </Button>
          <Button variant="destructive" size="sm" onClick={onRequestEnd} className="gap-1.5" disabled={!isActive}>
            <Square className="w-4 h-4" />
            <span className="hidden sm:inline">End Session</span>
          </Button>
        </div>
      </div>
    </Card>
  );
}

function IconButton({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className="p-1.5 text-muted-foreground hover:text-white transition-colors rounded-full hover:bg-white/5"
    >
      {children}
    </button>
  );
}

interface ToolbarButtonProps {
  icon: ReactNode;
  label: string;
  title?: string;
  onClick: () => void;
  disabled?: boolean;
}

function ToolbarButton({ icon, label, title, onClick, disabled }: ToolbarButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      title={title ?? label}
      className="gap-1.5 border-white/10 hover:bg-white/5"
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </Button>
  );
}
