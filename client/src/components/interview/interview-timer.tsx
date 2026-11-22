import { Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { SessionStatus } from "@/hooks/use-interview-session";
export default function InterviewTimer({
  status,
  elapsedSeconds,
  pressureMode,
  onToggle,
}: {
  status: SessionStatus;
  elapsedSeconds: number;
  pressureMode: boolean;
  onToggle: () => void;
}) {
  const remaining = Math.max(0, 900 - elapsedSeconds);
  const low = remaining < 60;
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Clock size={16} />
        {pressureMode ? "Pressure mode" : "Session timer"}
      </div>
      <p
        className={`mt-5 text-4xl font-mono tabular-nums ${low ? "text-destructive" : "text-foreground"}`}
      >
        {String(Math.floor(remaining / 60)).padStart(2, "0")}:
        {String(remaining % 60).padStart(2, "0")}
      </p>
      <p className="text-xs text-muted-foreground mt-2">
        {remaining === 0
          ? "Time is up. Finish your answer when you’re ready."
          : "Remaining in your 15-minute practice window"}
      </p>
      <Progress
        className="mt-5 h-1.5"
        value={(remaining / 900) * 100}
        aria-label="Time remaining"
      />
      <Button
        className="w-full mt-5"
        size="sm"
        variant="outline"
        disabled={status === "idle" || pressureMode}
        onClick={onToggle}
      >
        {status === "paused" ? "Resume" : "Pause"}
      </Button>
      {pressureMode && (
        <p className="mt-2 text-xs text-muted-foreground">
          Pause is disabled in pressure mode.
        </p>
      )}
    </Card>
  );
}
