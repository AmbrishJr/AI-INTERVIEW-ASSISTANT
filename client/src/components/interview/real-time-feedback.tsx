import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle, Eye, Gauge, MessageSquareWarning, ScanFace, Timer } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CoachingMessage, CoachingTone, CoachingTopic } from "@/hooks/use-live-coaching";

export const TOPIC_ICONS: Record<CoachingTopic, typeof Eye> = {
  face: ScanFace,
  eyes: Eye,
  framing: ScanFace,
  pace: Gauge,
  fillers: MessageSquareWarning,
  silence: Timer,
};

export const TONE_STYLES: Record<CoachingTone, { box: string; bar: string }> = {
  positive: { box: "bg-green-500/15 border-green-500/30 text-green-200", bar: "bg-green-500" },
  suggestion: { box: "bg-blue-500/15 border-blue-500/30 text-blue-200", bar: "bg-blue-500" },
  warning: { box: "bg-yellow-500/15 border-yellow-500/30 text-yellow-100", bar: "bg-yellow-500" },
  error: { box: "bg-red-500/15 border-red-500/30 text-red-200", bar: "bg-red-500" },
};

const MESSAGE_SECONDS = 6;

/** Floating coaching toasts; only shows messages produced from real measurements. */
export default function RealTimeFeedback({ messages }: { messages: CoachingMessage[] }) {
  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-30 space-y-3 pointer-events-none w-[min(24rem,calc(100vw-2rem))]" aria-live="polite">
      <AnimatePresence mode="popLayout">
        {messages.map((m) => {
          const Icon = m.tone === "positive" ? CheckCircle : m.tone === "error" ? AlertCircle : TOPIC_ICONS[m.topic];
          const style = TONE_STYLES[m.tone];
          return (
            <motion.div
              key={m.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ type: "spring", damping: 18, stiffness: 140 }}
              className={cn("p-4 rounded-lg border backdrop-blur-md flex items-start gap-3 shadow-lg", style.box)}
            >
              <Icon className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold leading-tight">{m.title}</p>
                <p className="text-sm leading-snug opacity-90">{m.message}</p>
                <motion.div
                  initial={{ scaleX: 1 }}
                  animate={{ scaleX: 0 }}
                  transition={{ duration: MESSAGE_SECONDS, ease: "linear" }}
                  className={cn("h-1 rounded-full mt-2 origin-left", style.bar)}
                />
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
