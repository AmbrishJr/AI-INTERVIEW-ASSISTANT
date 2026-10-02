import { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { TranscriptMessage } from "@/hooks/use-interview-session";

interface TranscriptPanelProps {
  messages: TranscriptMessage[];
  /** Words being recognised right now, not final yet. */
  interim?: string;
}

export default function TranscriptPanel({ messages, interim }: TranscriptPanelProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, interim]);

  return (
    <Card className="bg-card/40 backdrop-blur-md border-white/5 h-64 md:h-72">
      <div className="p-4 border-b border-white/5 bg-white/5">
        <h3 className="font-heading font-semibold flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          Live Transcript
        </h3>
      </div>
      <ScrollArea className="p-4 h-[calc(100%-60px)]">
        <div className="space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={cn("flex", msg.role === "ai" ? "justify-start" : "justify-end")}>
              <div
                className={cn(
                  "max-w-[85%] p-3 rounded-2xl text-sm",
                  msg.role === "ai"
                    ? "bg-white/10 text-white rounded-tl-none"
                    : "bg-primary/20 text-white border border-primary/20 rounded-tr-none",
                )}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {interim && (
            <div className="flex justify-end">
              <div className="max-w-[85%] p-3 rounded-2xl rounded-tr-none text-sm border border-dashed border-primary/30 text-white/60 italic">
                {interim}…
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>
      </ScrollArea>
    </Card>
  );
}
