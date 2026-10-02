import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, ChevronDown, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { HERO_HEADLINE } from "@/data/home-content";

function useTypewriter(text: string, msPerChar = 22) {
  const [typed, setTyped] = useState("");

  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setTyped(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, msPerChar);
    return () => clearInterval(id);
  }, [text, msPerChar]);

  return typed;
}

interface HeroSectionProps {
  onWatchDemo: () => void;
  onScrollDown: () => void;
}

export default function HeroSection({ onWatchDemo, onScrollDown }: HeroSectionProps) {
  const [, setLocation] = useLocation();
  const { isLoggedIn } = useAuth();
  const headline = useTypewriter(HERO_HEADLINE);

  return (
    <div className="relative h-[92vh] flex items-center justify-center overflow-hidden">
      <HeroBackground />

      <div className="relative z-20 max-w-7xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center">
          <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">AI-powered session tracking</Badge>
          <h1
            className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent min-h-[1.2em]"
            aria-label={HERO_HEADLINE}
          >
            {headline}
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Real-time AI feedback, a live session workspace, and analytics that turn practice into measurable improvement.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
            {isLoggedIn ? (
              <Button size="lg" onClick={() => setLocation("/dashboard")} className="text-lg px-8">
                Go to Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            ) : (
              <Button size="lg" onClick={() => setLocation("/login")} className="text-lg px-8">
                Start Free Session
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            )}
            <Button size="lg" variant="outline" onClick={onWatchDemo} className="text-lg px-8 border-white/20 hover:bg-white/10">
              <Play className="mr-2 h-5 w-5" />
              Watch 60-sec Demo
            </Button>
          </div>

          <motion.div
            className="absolute bottom-16 left-1/2 -translate-x-1/2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.5 }}
          >
            <Button
              variant="outline"
              size="sm"
              onClick={onScrollDown}
              aria-label="Scroll to stats"
              className="animate-bounce border-white/20 hover:bg-white/10"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

function HeroBackground() {
  return (
    <div className="absolute inset-0 z-0">
      <div className="absolute inset-0 bg-background/80 z-10 backdrop-blur-[2px]" />
      <motion.div
        className="absolute inset-0 z-10"
        initial={{ opacity: 0.55 }}
        animate={{ opacity: 0.75 }}
        transition={{ duration: 2.2, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
        style={{
          background:
            "radial-gradient(1200px 600px at 50% 20%, rgba(0,240,255,0.18), transparent 55%), radial-gradient(900px 520px at 20% 70%, rgba(168,85,247,0.18), transparent 55%)",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent z-10" />
      <div className="w-full h-full bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 opacity-60" />
    </div>
  );
}
