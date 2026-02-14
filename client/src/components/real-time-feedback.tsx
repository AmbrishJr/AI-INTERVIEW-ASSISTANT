import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Zap, Volume2, Eye, Lightbulb } from "lucide-react";

interface FeedbackMessage {
  id: string;
  type: "warning" | "suggestion" | "positive";
  icon: "alert" | "zap" | "volume" | "eye" | "lightbulb";
  message: string;
  duration: number;
}

interface RealTimeFeedbackProps {
  isActive: boolean;
}

const FEEDBACK_QUEUE = [
  { type: "warning", icon: "volume", message: "Slow down, you're speaking too fast" },
  { type: "suggestion", icon: "eye", message: "Look at the camera more" },
  { type: "positive", icon: "zap", message: "Great eye contact!" },
  { type: "warning", icon: "alert", message: "Avoid filler words like 'um' and 'like'" },
];

const iconMap = {
  alert: AlertCircle,
  zap: Zap,
  volume: Volume2,
  eye: Eye,
  lightbulb: Lightbulb,
};

export default function RealTimeFeedback({ isActive }: RealTimeFeedbackProps) {
  const [feedbackStack, setFeedbackStack] = useState<FeedbackMessage[]>([]);

  useEffect(() => {
    if (!isActive) {
      setFeedbackStack([]);
      return;
    }

    // Simulate real-time feedback generation
    const interval = setInterval(() => {
      const randomFeedback = FEEDBACK_QUEUE[Math.floor(Math.random() * FEEDBACK_QUEUE.length)];
      const newMessage: FeedbackMessage = {
        id: Date.now().toString(),
        type: randomFeedback.type as "warning" | "suggestion" | "positive",
        icon: randomFeedback.icon as any,
        message: randomFeedback.message,
        duration: 4000,
      };
      setFeedbackStack((prev) => [...prev.slice(-2), newMessage]); // Keep max 3 messages
      
      // Auto-remove after duration
      setTimeout(() => {
        setFeedbackStack((prev) => prev.filter((m) => m.id !== newMessage.id));
      }, newMessage.duration);
    }, 6000);

    return () => clearInterval(interval);
  }, [isActive]);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 transform z-30 space-y-3 pointer-events-none max-w-sm">
      <AnimatePresence mode="popLayout">
        {feedbackStack.map((feedback) => {
          const Icon = iconMap[feedback.icon];
          const bgColor =
            feedback.type === "positive"
              ? "bg-green-500/15 border-green-500/30 text-green-200"
              : feedback.type === "warning"
                ? "bg-red-500/15 border-red-500/30 text-red-200"
                : "bg-blue-500/15 border-blue-500/30 text-blue-200";

          return (
            <motion.div
              key={feedback.id}
              initial={{ opacity: 0, y: 20, x: -20 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, y: -20, x: -20 }}
              transition={{ type: "spring", damping: 15, stiffness: 100 }}
              className={`p-4 rounded-lg border backdrop-blur-md pointer-events-auto flex items-start gap-3 shadow-lg ${bgColor}`}
            >
              <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium leading-tight">{feedback.message}</p>
                <motion.div
                  initial={{ scaleX: 1 }}
                  animate={{ scaleX: 0 }}
                  transition={{ duration: feedback.duration / 1000, ease: "linear" }}
                  className={`h-1 rounded-full mt-2 origin-left ${
                    feedback.type === "positive"
                      ? "bg-green-500"
                      : feedback.type === "warning"
                        ? "bg-red-500"
                        : "bg-blue-500"
                  }`}
                />
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}