import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";

interface ConfidenceMetrics {
  speechRate: number; // words per minute
  pauseLength: number; // seconds
  eyeContact: number; // percentage
  fillerWords: number; // count
}

interface ConfidenceScoreProps {
  isActive: boolean;
}

export default function ConfidenceScore({ isActive }: ConfidenceScoreProps) {
  const [metrics, setMetrics] = useState<ConfidenceMetrics>({
    speechRate: 0,
    pauseLength: 0,
    eyeContact: 0,
    fillerWords: 0,
  });

  const [history, setHistory] = useState<Array<{ time: string; score: number }>>([
    { time: "00:00", score: 0 },
  ]);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      // Simulate real-time metric changes
      setMetrics({
        speechRate: Math.min(180, 60 + Math.random() * 100),
        pauseLength: Math.random() * 3,
        eyeContact: Math.min(100, 40 + Math.random() * 50),
        fillerWords: Math.floor(Math.random() * 5),
      });

      setHistory((prev) => {
        const lastTime = parseInt(prev[prev.length - 1].time.split(":")[0]);
        const newTime = lastTime + 1;
        return [
          ...prev.slice(-14), // Keep last 15 data points
          {
            time: `${String(Math.floor(newTime / 60)).padStart(2, "0")}:${String(newTime % 60).padStart(2, "0")}`,
            score: 50 + Math.random() * 40,
          },
        ];
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isActive]);

  // Calculate overall confidence score (0-100)
  const calculateConfidence = () => {
    const speechRateScore = Math.max(0, Math.min(100, (metrics.speechRate / 150) * 100)); // 150 is ideal
    const pauseScore = Math.max(0, Math.min(100, 100 - metrics.pauseLength * 20)); // Shorter pauses = better
    const eyeContactScore = metrics.eyeContact; // 0-100
    const fillerScore = Math.max(0, Math.min(100, 100 - metrics.fillerWords * 15)); // Fewer fillers = better

    return Math.round((speechRateScore + pauseScore + eyeContactScore + fillerScore) / 4);
  };

  const overallConfidence = calculateConfidence();

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return { fill: "#10b981", stroke: "#059669", label: "Excellent" };
    if (score >= 60) return { fill: "#f59e0b", stroke: "#d97706", label: "Good" };
    if (score >= 40) return { fill: "#ef4444", stroke: "#dc2626", label: "Fair" };
    return { fill: "#6b7280", stroke: "#4b5563", label: "Needs Work" };
  };

  const color = getConfidenceColor(overallConfidence);

  return (
    <div className="space-y-4">
      {/* Main Confidence Score */}
      <Card className="bg-card/40 backdrop-blur-md border-white/5 p-6 flex flex-col items-center">
        <h3 className="text-sm font-mono text-muted-foreground uppercase tracking-wider mb-4">Confidence Score</h3>
        <div className="w-40 h-40">
          <CircularProgressbar
            value={overallConfidence}
            text={`${overallConfidence}%`}
            styles={buildStyles({
              pathColor: color.fill,
              textColor: "#fff",
              trailColor: "rgba(255,255,255,0.05)",
              pathTransitionDuration: 0.5,
            })}
          />
        </div>
        <p className="text-center text-sm font-semibold mt-4" style={{ color: color.fill }}>
          {color.label} Performance
        </p>
      </Card>

      {/* Metrics Breakdown */}
      <Card className="bg-card/40 backdrop-blur-md border-white/5 p-6">
        <h3 className="text-sm font-mono text-muted-foreground uppercase tracking-wider mb-4">Live Metrics</h3>
        <div className="space-y-3">
          {[
            { label: "Speech Rate", value: `${Math.round(metrics.speechRate)} wpm`, ideal: "120-150", icon: "🎤" },
            { label: "Pause Length", value: `${metrics.pauseLength.toFixed(1)}s`, ideal: "<1s", icon: "⏸️" },
            { label: "Eye Contact", value: `${Math.round(metrics.eyeContact)}%`, ideal: ">80%", icon: "👁️" },
            { label: "Filler Words", value: `${metrics.fillerWords}`, ideal: "0", icon: "📝" },
          ].map((metric, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5"
            >
              <div>
                <p className="text-xs text-muted-foreground">{metric.label}</p>
                <p className="text-sm font-semibold text-foreground">{metric.value}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Ideal: {metric.ideal}</p>
                <p className="text-lg">{metric.icon}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Trend Graph */}
      <Card className="bg-card/40 backdrop-blur-md border-white/5 p-6">
        <h3 className="text-sm font-mono text-muted-foreground uppercase tracking-wider mb-4">Confidence Trend</h3>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis
                dataKey="time"
                stroke="rgba(255,255,255,0.3)"
                tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                stroke="rgba(255,255,255,0.3)"
                tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                domain={[0, 100]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  borderColor: "rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                }}
                itemStyle={{ color: "white" }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
                isAnimationActive={true}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}