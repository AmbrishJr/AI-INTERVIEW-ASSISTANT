import { useEffect, useRef, useState, type FormEvent } from "react";
import { MessageCircle, Send, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/contexts/auth-context";
interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
}
export default function AIChatbot() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [lastQuestion, setLastQuestion] = useState("");
  const end = useRef<HTMLDivElement>(null);
  const generation = useRef(0);
  useEffect(() => {
    generation.current++;
    setMessages([]);
    setError("");
    setInput("");
    setLastQuestion("");
    setBusy(false);
    setOpen(false);
  }, [user?.id]);
  useEffect(() => {
    end.current?.scrollIntoView({ block: "nearest" });
  }, [messages, busy]);
  const send = async (text: string, retry = false) => {
    const current = generation.current;
    if (!text.trim() || busy) return;
    setBusy(true);
    setError("");
    setLastQuestion(text);
    setInput("");
    if (!retry)
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "user", text },
      ]);
    try {
      const res = await apiRequest("POST", "/api/chat", { message: text });
      const data = await res.json();
      if (current !== generation.current) return;
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", text: data.response },
      ]);
    } catch (e) {
      if (current === generation.current)
        setError(
          e instanceof Error
            ? e.message
            : "The coach is unavailable. Try again.",
        );
    } finally {
      if (current === generation.current) setBusy(false);
    }
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    void send(input.trim());
  };
  return (
    <>
      <Button
        className="fixed bottom-5 right-5 z-30 shadow-md rounded-full"
        onClick={() => setOpen(true)}
        aria-label="Open AI coach"
      >
        <MessageCircle />
        <span className="hidden sm:inline">Ask your coach</span>
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg flex flex-col max-h-[85dvh]">
          <DialogTitle>Your interview coach</DialogTitle>
          <DialogDescription>
            Ask about preparation, answer structure, or a tricky question.
            Messages are sent to the configured AI provider.
          </DialogDescription>
          <div
            className="min-h-40 max-h-[45dvh] overflow-y-auto space-y-4 py-3"
            role="log"
            aria-live="polite"
          >
            {!messages.length && (
              <div className="rounded-lg bg-muted p-5">
                <p className="font-medium">What would you like to work on?</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Try “How do I answer a question about a project that failed?”
                </p>
              </div>
            )}
            {messages.map((message) => (
              <div
                key={message.id}
                className={`rounded-lg p-4 text-sm ${message.role === "user" ? "bg-blue-50 dark:bg-blue-950/50 ml-6" : "bg-muted mr-6"}`}
              >
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  {message.role === "user" ? "You" : "Coach"}
                </p>
                <p className="whitespace-pre-wrap leading-relaxed">
                  {message.text}
                </p>
              </div>
            ))}
            {busy && (
              <p
                role="status"
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <Loader2 size={16} className="animate-spin" />
                Thinking…
              </p>
            )}
            <div ref={end} />
          </div>
          {error && (
            <div
              role="alert"
              className="bg-red-50 dark:bg-red-950/50 p-3 rounded-lg text-sm text-red-700 dark:text-red-300"
            >
              <p>{error}</p>
              <Button
                size="sm"
                variant="outline"
                className="mt-2"
                disabled={busy}
                onClick={() => void send(lastQuestion, true)}
              >
                Try again
              </Button>
              <p className="mt-3 text-xs">
                General tip: use a specific example and explain what you
                learned.
              </p>
            </div>
          )}
          <form className="flex gap-2 border-t pt-4" onSubmit={submit}>
            <Input
              aria-label="Message your coach"
              placeholder="Ask a question…"
              maxLength={8000}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={busy}
            />
            <Button
              type="submit"
              size="icon"
              aria-label="Send message"
              disabled={!input.trim() || busy}
            >
              <Send />
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
