import { useEffect, useState, type ReactNode } from "react";
import GlassCard from "@/components/common/glass-card";
import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatDuration } from "@/lib/format";
import { toastInfo, toastSuccess } from "@/hooks/use-toast";

type TimerState = "idle" | "running" | "paused";

const TARGET_SECONDS = 30 * 60;
const STATE_LABEL: Record<TimerState, string> = { idle: "Not started", running: "Running", paused: "Paused" };

/** Lightweight study timer for practising outside a full interview session. */
export default function FocusTimerCard() {
  const [state, setState] = useState<TimerState>("idle");
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (state !== "running") return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [state]);

  const start = () => {
    setSeconds(0);
    setState("running");
    toastSuccess("Timer started", "Focus timer is running.");
  };

  const stop = () => {
    setState("idle");
    toastSuccess("Timer stopped", `You focused for ${formatDuration(seconds)}.`);
    setSeconds(0);
  };

  return (
    <GlassCard>
      <CardHeader>
        <CardTitle>Focus timer</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Row label="State" value={STATE_LABEL[state]} />
        <Row label="Timer" value={<span className="font-mono">{formatDuration(seconds)}</span>} />
        <Progress value={Math.min(100, (seconds / TARGET_SECONDS) * 100)} className="h-2" />
        <div className="flex flex-wrap gap-2">
          {state === "idle" && (
            <Button size="sm" onClick={start}>
              Start
            </Button>
          )}
          {state === "running" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setState("paused");
                toastInfo("Paused", "Timer paused.");
              }}
            >
              Pause
            </Button>
          )}
          {state === "paused" && (
            <Button size="sm" variant="outline" onClick={() => setState("running")}>
              Resume
            </Button>
          )}
          <Button size="sm" variant="destructive" onClick={stop} disabled={state === "idle"}>
            Stop
          </Button>
        </div>
      </CardContent>
    </GlassCard>
  );
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  );
}
