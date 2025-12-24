import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Circle, Lightbulb } from "lucide-react";

interface StructureAnalysis {
  intro: boolean;
  body: boolean;
  conclusion: boolean;
  starDetected: boolean;
}

interface AnswerStructureAnalyzerProps {
  isActive: boolean;
}

export default function AnswerStructureAnalyzer({ isActive }: AnswerStructureAnalyzerProps) {
  const [analysis, setAnalysis] = useState<StructureAnalysis>({
    intro: false,
    body: false,
    conclusion: false,
    starDetected: false,
  });

  const [detectedPatterns, setDetectedPatterns] = useState<string[]>([]);

  useEffect(() => {
    if (!isActive) {
      setAnalysis({ intro: false, body: false, conclusion: false, starDetected: false });
      setDetectedPatterns([]);
      return;
    }

    // Simulate structure detection
    const patterns = ["intro", "body", "conclusion", "star"];
    const interval = setInterval(() => {
      const detected = patterns.filter(() => Math.random() > 0.5);
      setAnalysis({
        intro: detected.includes("intro"),
        body: detected.includes("body"),
        conclusion: detected.includes("conclusion"),
        starDetected: detected.includes("star"),
      });

      // Simulate detected keywords
      const keywords = {
        intro: ["Initially", "First", "At that time"],
        body: ["I took action", "I implemented", "I collaborated"],
        conclusion: ["As a result", "This taught me", "The outcome"],
        star: ["Situation", "Task", "Action", "Result"],
      };

      const newPatterns: string[] = [];
      if (detected.includes("intro")) newPatterns.push(keywords.intro[Math.floor(Math.random() * 3)]);
      if (detected.includes("body")) newPatterns.push(keywords.body[Math.floor(Math.random() * 3)]);
      if (detected.includes("conclusion")) newPatterns.push(keywords.conclusion[Math.floor(Math.random() * 3)]);
      if (detected.includes("star")) newPatterns.push(keywords.star[Math.floor(Math.random() * 4)]);

      setDetectedPatterns(newPatterns);
    }, 4000);

    return () => clearInterval(interval);
  }, [isActive]);

  const sections = [
    { key: "intro" as const, label: "Introduction", hint: "Set the context for your answer" },
    { key: "body" as const, label: "Body", hint: "Explain your actions and reasoning" },
    { key: "conclusion" as const, label: "Conclusion", hint: "Summarize what you learned" },
  ];

  const completionScore = Object.values(analysis).filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Main Analyzer Card */}
      <Card className="bg-card/40 backdrop-blur-md border-white/5 p-6">
        <h3 className="text-sm font-mono text-muted-foreground uppercase tracking-wider mb-4">
          Answer Structure
        </h3>

        {/* STAR Method Detection */}
        <div className="mb-6 p-4 rounded-lg bg-secondary/10 border border-secondary/20">
          <div className="flex items-center gap-3 mb-2">
            <Lightbulb className={`w-5 h-5 ${analysis.starDetected ? "text-secondary animate-pulse" : "text-muted-foreground"}`} />
            <span className="text-sm font-semibold">STAR Method</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {["Situation", "Task", "Action", "Result"].map((star, i) => (
              <motion.div
                key={i}
                animate={{
                  scale: analysis.starDetected ? [1, 1.05, 1] : 1,
                  opacity: analysis.starDetected ? 1 : 0.5,
                }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className={`px-3 py-1 rounded-full text-xs font-mono ${
                  analysis.starDetected
                    ? "bg-secondary/30 text-secondary border border-secondary/50"
                    : "bg-white/5 text-muted-foreground border border-white/5"
                }`}
              >
                {star}
              </motion.div>
            ))}
          </div>
          {analysis.starDetected && (
            <p className="text-xs text-secondary mt-2 font-medium">✓ STAR structure detected!</p>
          )}
        </div>

        {/* Answer Structure Sections */}
        <div className="space-y-3">
          {sections.map((section, i) => {
            const isDetected = analysis[section.key];
            return (
              <motion.div
                key={section.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`p-4 rounded-lg border transition-all ${
                  isDetected
                    ? "bg-green-500/10 border-green-500/30"
                    : "bg-white/5 border-white/5 hover:border-white/10"
                }`}
              >
                <div className="flex items-start gap-3">
                  <motion.div animate={{ scale: isDetected ? 1.2 : 1 }}>
                    {isDetected ? (
                      <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" />
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-1" />
                    )}
                  </motion.div>
                  <div className="flex-1">
                    <h4 className={`font-semibold text-sm ${isDetected ? "text-green-200" : "text-foreground"}`}>
                      {section.label}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">{section.hint}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Completion Progress */}
        <div className="mt-6 p-3 rounded-lg bg-primary/10 border border-primary/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-primary">Structure Completion</span>
            <span className="text-sm font-bold text-primary">{completionScore}/4</span>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: `${(completionScore / 4) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </Card>

      {/* Real-time Detection */}
      <Card className="bg-card/40 backdrop-blur-md border-white/5 p-6">
        <h3 className="text-sm font-mono text-muted-foreground uppercase tracking-wider mb-4">
          Detected Keywords
        </h3>
        <AnimatePresence mode="wait">
          {detectedPatterns.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {detectedPatterns.map((pattern, i) => (
                <motion.div
                  key={`${pattern}-${i}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="px-3 py-2 rounded-full bg-primary/20 text-primary border border-primary/30 text-xs font-mono font-semibold"
                >
                  "{pattern}"
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-muted-foreground italic"
            >
              Start speaking to detect structure patterns...
            </motion.p>
          )}
        </AnimatePresence>
      </Card>

      {/* Tips Card */}
      <Card className="bg-primary/10 backdrop-blur-md border-primary/20 p-6">
        <h3 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
          <Lightbulb className="w-4 h-4" />
          Pro Tips
        </h3>
        <ul className="space-y-2 text-xs text-primary/80">
          <li>✓ Use clear transitions between intro, body, and conclusion</li>
          <li>✓ For behavioral questions, follow the STAR method</li>
          <li>✓ Use specific metrics and quantifiable results</li>
          <li>✓ Avoid rambling—structure your thoughts first</li>
        </ul>
      </Card>
    </div>
  );
}