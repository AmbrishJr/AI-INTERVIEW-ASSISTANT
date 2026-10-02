import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle, Pause, Play, RotateCcw, SkipBack, SkipForward } from "lucide-react";
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { formatClock } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { SessionReport } from "@/hooks/use-session-recorder";

const PLAYBACK_SPEED = 4; // seconds of session per real second
const SKIP_SECONDS = 10;

const MOMENT_STYLES = {
  positive: "bg-green-500/10 border-l-green-500 text-green-200",
  suggestion: "bg-blue-500/10 border-l-blue-500 text-blue-200",
  warning: "bg-yellow-500/10 border-l-yellow-500 text-yellow-200",
  error: "bg-red-500/10 border-l-red-500 text-red-200",
} as const;

/** Groups per-second samples into chart points (% of each bucket spent speaking / facing the camera). */
function buildTimeline(report: SessionReport) {
  const bucket = Math.max(5, Math.ceil(report.durationSec / 40));
  const points: { t: number; speaking: number; eyeContact: number | null }[] = [];
  for (let start = 0; start <= report.durationSec; start += bucket) {
    const inBucket = report.samples.filter((s) => s.t >= start && s.t < start + bucket);
    if (!inBucket.length) continue;
    const withCam = inBucket.filter((s) => s.face !== "off");
    points.push({
      t: start,
      speaking: Math.round((inBucket.filter((s) => s.speaking).length / inBucket.length) * 100),
      eyeContact: withCam.length
        ? Math.round((withCam.filter((s) => s.face === "facing").length / withCam.length) * 100)
        : null,
    });
  }
  return points;
}

interface InterviewReplayProps {
  isOpen: boolean;
  onClose: () => void;
  report: SessionReport | null;
}

export default function InterviewReplay({ isOpen, onClose, report }: InterviewReplayProps) {
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const maxTime = Math.max(1, report?.durationSec ?? 0);
  const timeline = useMemo(() => (report ? buildTimeline(report) : []), [report]);

  // Each new report starts from the beginning.
  useEffect(() => {
    setCurrentTime(0);
    setIsPlaying(false);
  }, [report]);

  // Playback: advance the cursor until the end.
  useEffect(() => {
    if (!isPlaying) return;
    const id = setInterval(() => setCurrentTime((t) => Math.min(maxTime, t + 1)), 1000 / PLAYBACK_SPEED);
    return () => clearInterval(id);
  }, [isPlaying, maxTime]);

  useEffect(() => {
    if (currentTime >= maxTime) setIsPlaying(false);
  }, [currentTime, maxTime]);

  const seek = (t: number) => setCurrentTime(Math.min(maxTime, Math.max(0, Math.round(t))));
  const visibleTranscript = report?.transcript.filter((e) => e.t <= currentTime) ?? [];
  const hasData = Boolean(report && report.samples.length > 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 md:p-8"
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="replay-title"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-5xl max-h-[90vh] flex flex-col bg-card/95 backdrop-blur-xl rounded-2xl border border-primary/20 shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-white/5 bg-gradient-to-r from-primary/10 to-secondary/10 flex items-start justify-between gap-4">
              <div>
                <h2 id="replay-title" className="text-2xl font-heading font-bold text-white">
                  Interview Replay
                </h2>
                <p className="text-sm text-muted-foreground">Everything below was measured during your session.</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close replay"
                className="text-muted-foreground hover:text-foreground transition-colors text-2xl leading-none"
              >
                ×
              </button>
            </div>

            {!hasData || !report ? (
              <div className="p-12 text-center text-muted-foreground">
                <p className="font-medium text-foreground">Nothing was recorded</p>
                <p className="text-sm mt-1">Start a session and answer for a few seconds to get a replay.</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <SummaryTiles report={report} />

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm font-mono">
                    <span className="text-muted-foreground">Timeline</span>
                    <span className="text-primary">
                      {formatClock(currentTime)} / {formatClock(maxTime)}
                    </span>
                  </div>
                  <Slider value={[currentTime]} onValueChange={([v]) => seek(v)} max={maxTime} step={1} aria-label="Replay position" />
                </div>

                <div className="flex items-center gap-3 justify-center">
                  <Button size="icon" variant="outline" className="border-white/10" onClick={() => seek(currentTime - SKIP_SECONDS)} aria-label="Back 10 seconds">
                    <SkipBack className="w-4 h-4" />
                  </Button>
                  <Button
                    size="lg"
                    onClick={() => {
                      if (currentTime >= maxTime) seek(0);
                      setIsPlaying((p) => !p);
                    }}
                    aria-label={isPlaying ? "Pause replay" : "Play replay"}
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : currentTime >= maxTime ? <RotateCcw className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </Button>
                  <Button size="icon" variant="outline" className="border-white/10" onClick={() => seek(currentTime + SKIP_SECONDS)} aria-label="Forward 10 seconds">
                    <SkipForward className="w-4 h-4" />
                  </Button>
                </div>

                <Card className="bg-white/5 border-white/5 p-4">
                  <h3 className="text-sm font-mono text-muted-foreground uppercase tracking-wider mb-4">Performance Timeline</h3>
                  <div className="h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={timeline} onClick={(e) => e?.activeLabel !== undefined && seek(Number(e.activeLabel))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="t" tickFormatter={(t) => formatClock(t).slice(3)} stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 12 }} />
                        <YAxis domain={[0, 100]} unit="%" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 12 }} />
                        <Tooltip
                          labelFormatter={(t) => `At ${formatClock(Number(t))}`}
                          formatter={(v) => `${v}%`}
                          contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "rgba(255,255,255,0.1)" }}
                        />
                        <ReferenceLine x={timeline.reduce((best, p) => (p.t <= currentTime ? p.t : best), 0)} stroke="hsl(var(--primary))" strokeDasharray="5 5" />
                        <Line type="monotone" dataKey="speaking" name="Speaking" stroke="#10b981" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="eyeContact" name="Facing camera" stroke="#3b82f6" strokeWidth={2} dot={false} connectNulls />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-0.5 bg-[#10b981]" /> Speaking
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-0.5 bg-[#3b82f6]" /> Facing camera
                    </span>
                  </div>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-white/5 border-white/5 p-4">
                    <h3 className="text-sm font-mono text-muted-foreground uppercase tracking-wider mb-4">Transcript</h3>
                    <ScrollArea className="h-[220px]">
                      <div className="space-y-3 pr-4">
                        {visibleTranscript.length === 0 && <p className="text-sm text-muted-foreground">Press play or drag the timeline.</p>}
                        {visibleTranscript.map((entry, i) => (
                          <button
                            type="button"
                            key={i}
                            onClick={() => seek(entry.t)}
                            className={cn(
                              "w-full text-left p-3 rounded-lg",
                              entry.role === "ai" ? "bg-white/10 text-muted-foreground" : "bg-primary/10 text-white border border-primary/20",
                            )}
                          >
                            <div className="text-xs font-mono text-muted-foreground mb-1">
                              {formatClock(entry.t)} • {entry.role === "ai" ? "INTERVIEWER" : "YOU"}
                            </div>
                            <p className="text-sm">{entry.text}</p>
                            {entry.role === "user" && (entry.wpm || entry.fillers?.length) ? (
                              <div className="flex gap-4 mt-2 text-xs text-muted-foreground font-mono">
                                {entry.wpm ? <span>{entry.wpm} words/min</span> : null}
                                {entry.fillers?.length ? <span>Fillers: {entry.fillers.join(", ")}</span> : null}
                              </div>
                            ) : null}
                          </button>
                        ))}
                      </div>
                    </ScrollArea>
                  </Card>

                  <Card className="bg-white/5 border-white/5 p-4">
                    <h3 className="text-sm font-mono text-muted-foreground uppercase tracking-wider mb-4">Key Moments</h3>
                    {report.moments.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No coaching was triggered in this session.</p>
                    ) : (
                      <ScrollArea className="h-[220px]">
                        <div className="space-y-2 pr-4">
                          {report.moments.map((m, i) => {
                            const near = Math.abs(m.t - currentTime) <= 2;
                            return (
                              <button
                                type="button"
                                key={i}
                                onClick={() => seek(m.t)}
                                className={cn("w-full text-left p-3 rounded-lg border-l-4 transition-opacity", MOMENT_STYLES[m.tone], near ? "opacity-100" : "opacity-70")}
                              >
                                <div className="flex items-center gap-2">
                                  {m.tone === "positive" ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                                  <span className="text-sm font-semibold">{m.title}</span>
                                  <span className="text-xs ml-auto font-mono text-muted-foreground">{formatClock(m.t)}</span>
                                </div>
                                <p className="text-xs mt-1 opacity-90">{m.message}</p>
                              </button>
                            );
                          })}
                        </div>
                      </ScrollArea>
                    )}
                  </Card>
                </div>
              </div>
            )}

            <div className="p-4 border-t border-white/5 flex justify-end bg-white/5">
              <Button onClick={onClose}>Close Replay</Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SummaryTiles({ report }: { report: SessionReport }) {
  const m = report.metrics;
  const tiles = [
    { label: "Duration", value: formatClock(report.durationSec) },
    { label: "Talk time", value: `${m.talkPct}%` },
    { label: "Face visible", value: m.faceVisiblePct === null ? "Camera off" : `${m.faceVisiblePct}%` },
    { label: "Facing camera", value: m.eyeContactPct === null ? "Camera off" : `${m.eyeContactPct}%` },
    { label: "Avg pace", value: m.avgWpm === null ? "—" : `${m.avgWpm} wpm` },
    { label: "Words / fillers", value: `${m.words} / ${m.fillers}` },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {tiles.map(({ label, value }) => (
        <div key={label} className="rounded-lg border border-white/10 bg-white/5 p-3">
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="text-lg font-semibold mt-0.5">{value}</div>
        </div>
      ))}
    </div>
  );
}
