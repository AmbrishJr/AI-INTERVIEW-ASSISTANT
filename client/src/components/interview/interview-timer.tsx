import { useState, useEffect } from "react";
import { Clock, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface InterviewTimerProps {
  isActive: boolean;
  pressureMode: boolean;
  onTimeUp?: () => void;
}

export default function InterviewTimer({ isActive, pressureMode, onTimeUp }: InterviewTimerProps) {
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes default
  const [isPaused, setIsPaused] = useState(false);
  const [totalTime] = useState(15 * 60);

  useEffect(() => {
    if (!isActive || isPaused) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onTimeUp?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, isPaused, onTimeUp]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const percentage = (timeLeft / totalTime) * 100;

  const isLowTime = timeLeft < 60;
  const isCritical = timeLeft < 30;

  const timerColor = isCritical ? "text-red-500" : isLowTime ? "text-yellow-500" : "text-primary";
  const bgColor = isCritical ? "bg-red-500/10" : isLowTime ? "bg-yellow-500/10" : "bg-primary/10";
  const borderColor = isCritical ? "border-red-500/30" : isLowTime ? "border-yellow-500/30" : "border-primary/30";

  return (
    <Card className={`bg-card/40 backdrop-blur-md border ${borderColor} p-6 overflow-hidden relative`}>
      {/* Background pulse effect for critical time */}
      {isCritical && (
        <motion.div
          animate={{ opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="absolute inset-0 bg-red-500/10"
        />
      )}

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <Clock className={`w-5 h-5 ${timerColor}`} />
          <span className="text-sm font-mono text-muted-foreground uppercase tracking-wider">
            {pressureMode ? "⚠️ Pressure Mode" : "Standard Mode"}
          </span>
        </div>

        {/* Timer Display */}
        <div className="text-center mb-6">
          <div className={`text-5xl font-mono font-bold ${timerColor} tracking-wider`}>
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </div>
          <p className="text-xs text-muted-foreground mt-2">Time Remaining</p>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden mb-6 border border-white/10">
          <motion.div
            className={`h-full ${
              isCritical ? "bg-red-500" : isLowTime ? "bg-yellow-500" : "bg-primary"
            } rounded-full shadow-[0_0_10px_currentColor]`}
            initial={{ width: "100%" }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1, ease: "linear" }}
          />
        </div>

        {/* Status */}
        {isCritical && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-200 text-sm font-medium flex items-center gap-2 mb-4"
          >
            <AlertTriangle className="w-4 h-4 animate-pulse" />
            Wrap up your answer!
          </motion.div>
        )}

        {/* Controls */}
        {!pressureMode && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPaused(!isPaused)}
            disabled={!isActive}
            className="w-full border-white/10 hover:bg-white/5 text-sm"
          >
            {isPaused ? "Resume" : "Pause"}
          </Button>
        )}

        {pressureMode && (
          <p className="text-xs text-muted-foreground text-center font-mono">
            ⏸️ Pause disabled in pressure mode
          </p>
        )}
      </div>
    </Card>
  );
}