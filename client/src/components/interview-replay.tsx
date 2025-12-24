import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, SkipBack, SkipForward, AlertTriangle, TrendingDown } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

interface ReplayMessage {
  time: number;
  role: "user" | "ai";
  text: string;
  confidence: number;
  eyeContact: number;
  fillerWords: number;
}

interface MetricEvent {
  time: number;
  type: "confidence-drop" | "eye-contact-break" | "filler-words";
  severity: "low" | "medium" | "high";
  message: string;
}

const MOCK_REPLAY_DATA: ReplayMessage[] = [
  { time: 0, role: "ai", text: "Tell me about your biggest project challenge.", confidence: 0, eyeContact: 0, fillerWords: 0 },
  { time: 5, role: "user", text: "Um, well, I worked on a distributed system...", confidence: 65, eyeContact: 75, fillerWords: 2 },
  { time: 15, role: "user", text: "...and we had to scale it to handle millions of requests.", confidence: 82, eyeContact: 90, fillerWords: 0 },
  { time: 25, role: "user", text: "Like, the main issue was, um, database performance.", confidence: 58, eyeContact: 45, fillerWords: 4 },
  { time: 35, role: "user", text: "We implemented caching and optimized the queries.", confidence: 88, eyeContact: 95, fillerWords: 0 },
];

const METRIC_EVENTS: MetricEvent[] = [
  { time: 10, type: "filler-words", severity: "medium", message: "Multiple filler words detected" },
  { time: 25, type: "confidence-drop", severity: "high", message: "Confidence dropped significantly" },
  { time: 25, type: "eye-contact-break", severity: "medium", message: "Eye contact interrupted" },
];

export default function InterviewReplay({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<"confidence" | "eyeContact" | "fillerWords">("confidence");

  const maxTime = Math.max(...MOCK_REPLAY_DATA.map(m => m.time));
  
  // Get current message based on time
  const currentMessages = MOCK_REPLAY_DATA.filter(m => m.time <= currentTime);
  
  // Get events at current time
  const eventsAtTime = METRIC_EVENTS.filter(e => Math.abs(e.time - currentTime) < 2);

  // Prepare metrics timeline
  const metricsTimeline = MOCK_REPLAY_DATA.map(msg => ({
    time: msg.time,
    confidence: msg.confidence,
    eyeContact: msg.eyeContact,
    fillerWords: msg.fillerWords * 20, // Scale for visibility
  }));

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-5xl max-h-[90vh] flex flex-col gap-6 bg-card/95 backdrop-blur-xl rounded-2xl border border-primary/20 shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5 bg-gradient-to-r from-primary/10 to-secondary/10">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-heading font-bold text-white">Interview Replay</h2>
                <button
                  onClick={onClose}
                  className="text-muted-foreground hover:text-foreground transition-colors text-2xl leading-none"
                >
                  ×
                </button>
              </div>
              <p className="text-sm text-muted-foreground">Review your performance with detailed metrics and feedback</p>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6">
              <div className="space-y-6 pb-6">
                {/* Timeline Slider */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-mono text-muted-foreground">Timeline</span>
                    <span className="text-sm font-mono text-primary">{currentTime}s / {maxTime}s</span>
                  </div>
                  <Slider
                    value={[currentTime]}
                    onValueChange={(v) => setCurrentTime(v[0])}
                    max={maxTime}
                    step={1}
                    className="w-full"
                  />
                </div>

                {/* Play Controls */}
                <div className="flex items-center gap-3 justify-center p-4 rounded-lg bg-white/5 border border-white/5">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => setCurrentTime(Math.max(0, currentTime - 5))}
                    className="border-white/10"
                  >
                    <SkipBack className="w-4 h-4" />
                  </Button>
                  <Button
                    size="lg"
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => setCurrentTime(Math.min(maxTime, currentTime + 5))}
                    className="border-white/10"
                  >
                    <SkipForward className="w-4 h-4" />
                  </Button>
                </div>

                {/* Metrics Chart */}
                <Card className="bg-white/5 border-white/5 p-4">
                  <h3 className="text-sm font-mono text-muted-foreground uppercase tracking-wider mb-4">Performance Timeline</h3>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={metricsTimeline}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="time" stroke="rgba(255,255,255,0.3)" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 12 }} />
                        <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 12 }} />
                        <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "rgba(255,255,255,0.1)" }} />
                        <ReferenceLine x={currentTime} stroke="hsl(var(--primary))" strokeDasharray="5 5" />
                        <Line type="monotone" dataKey="confidence" stroke="#10b981" strokeWidth={2} dot={false} name="Confidence" />
                        <Line type="monotone" dataKey="eyeContact" stroke="#3b82f6" strokeWidth={2} dot={false} name="Eye Contact" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                {/* Transcript Review */}
                <Card className="bg-white/5 border-white/5 p-4">
                  <h3 className="text-sm font-mono text-muted-foreground uppercase tracking-wider mb-4">Transcript</h3>
                  <ScrollArea className="h-[150px]">
                    <div className="space-y-3 pr-4">
                      {currentMessages.map((msg, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className={`p-3 rounded-lg ${
                            msg.role === "ai"
                              ? "bg-white/10 text-muted-foreground"
                              : "bg-primary/10 text-primary border border-primary/20"
                          }`}
                        >
                          <div className="text-xs font-mono text-muted-foreground mb-1">{msg.time}s • {msg.role.toUpperCase()}</div>
                          <p className="text-sm">{msg.text}</p>
                          {msg.role === "user" && (
                            <div className="flex gap-4 mt-2 text-xs text-muted-foreground font-mono">
                              <span>Confidence: {msg.confidence}%</span>
                              <span>Eye Contact: {msg.eyeContact}%</span>
                              <span>Fillers: {msg.fillerWords}</span>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </ScrollArea>
                </Card>

                {/* Issues & Highlights */}
                <Card className="bg-white/5 border-white/5 p-4">
                  <h3 className="text-sm font-mono text-muted-foreground uppercase tracking-wider mb-4">Key Moments</h3>
                  <div className="space-y-2">
                    {METRIC_EVENTS.map((event, i) => {
                      const isActive = Math.abs(event.time - currentTime) < 3;
                      return (
                        <motion.div
                          key={i}
                          animate={{
                            scale: isActive ? 1.02 : 1,
                            opacity: isActive ? 1 : 0.6,
                          }}
                          className={`p-3 rounded-lg border-l-4 cursor-pointer ${
                            event.severity === "high"
                              ? "bg-red-500/10 border-l-red-500 text-red-200"
                              : "bg-yellow-500/10 border-l-yellow-500 text-yellow-200"
                          }`}
                          onClick={() => setCurrentTime(event.time)}
                        >
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            <span className="text-sm font-semibold">{event.message}</span>
                            <span className="text-xs ml-auto text-muted-foreground">{event.time}s</span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </Card>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/5 flex items-center justify-between bg-white/5">
              <div className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">Average Score: 75/100</span>
                <span className="ml-4">Filler Words: 6 instances</span>
              </div>
              <Button onClick={onClose} className="bg-primary hover:bg-primary/90">
                Close Replay
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}