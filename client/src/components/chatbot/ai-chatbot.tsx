import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: Date;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: "1",
    role: "assistant",
    text: "Hi! I'm your AI Interview Coach Assistant. I can help you with interview tips, answer questions, or provide feedback on your practice sessions. What would you like to know?",
    timestamp: new Date(),
  },
];

const SAMPLE_RESPONSES = [
  "That's a great question! Let me help you with that...",
  "Here's what I recommend based on best practices...",
  "To improve in that area, focus on...",
  "This is important for interviews because...",
  "You're on the right track! Here's how to excel even more...",
];

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      text: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const userInput = input;
    setInput("");
    setIsLoading(true);

    try {
      // Send message to AI backend
      const response = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userInput }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();

      // Add AI response
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        text: data.response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('AI Chat error:', error);
      
      // Fallback to sample response on error
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        text: "I'm having trouble connecting right now. Here's a quick tip: Practice common interview questions and focus on the STAR method (Situation, Task, Action, Result) for behavioral questions!",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <div className="fixed bottom-6 right-6 z-40 flex items-end gap-2">
            {/* Tooltip */}
            <AnimatePresence>
              {showTooltip && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.9 }}
                  className="bg-card/95 backdrop-blur-md border border-primary/20 rounded-lg px-3 py-2 shadow-lg max-w-xs"
                >
                  <p className="text-sm text-white font-medium">
                    Hi! I'm your AI chatbot. I'm here to help you - ask me any questions!
                  </p>
                  <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-8 border-l-primary/20 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Chatbot Button */}
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              onClick={() => setIsOpen(true)}
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              className="w-14 h-14 rounded-full bg-gradient-to-r from-primary to-secondary shadow-[0_0_30px_rgba(0,240,255,0.4)] flex items-center justify-center hover:scale-110 transition-transform duration-300 group"
              data-testid="button-chatbot"
            >
              <MessageCircle className="w-6 h-6 text-white group-hover:animate-pulse" />
            </motion.button>
          </div>
        )}
      </AnimatePresence>

      {/* Chatbot Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-96 h-[600px] rounded-2xl overflow-hidden shadow-2xl"
          >
            <Card className="bg-card/95 backdrop-blur-xl border-primary/20 h-full flex flex-col">
              {/* Header */}
              <div className="p-4 bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/50">
                    <MessageCircle className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-white text-sm">AI Coach</h3>
                    <p className="text-[10px] text-muted-foreground">Always here to help</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 hover:bg-white/10"
                  data-testid="button-close-chatbot"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4 space-y-4">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                        message.role === "user"
                          ? "bg-primary/20 text-white border border-primary/30 rounded-tr-none"
                          : "bg-white/10 text-muted-foreground border border-white/5 rounded-tl-none"
                      }`}
                      data-testid={`message-${message.role}-${message.id}`}
                    >
                      {message.text}
                    </div>
                  </motion.div>
                ))}

                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2 text-muted-foreground text-sm"
                  >
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.4s]" />
                  </motion.div>
                )}
              </ScrollArea>

              {/* Input */}
              <div className="p-4 border-t border-white/5 bg-black/20">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input
                    placeholder="Ask me anything..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={isLoading}
                    className="bg-white/10 border-white/10 focus:border-primary/50 text-white placeholder:text-muted-foreground text-sm h-10"
                    data-testid="input-chatbot"
                  />
                  <Button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    size="icon"
                    className="h-10 w-10 bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
                    data-testid="button-send-message"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </form>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}