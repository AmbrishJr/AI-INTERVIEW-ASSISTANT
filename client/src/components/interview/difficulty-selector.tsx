import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Zap, BarChart3, Brain } from "lucide-react";

export type Difficulty = "easy" | "medium" | "hard";
export type QuestionType = "behavioral" | "technical" | "hr";

interface DifficultySelectorProps {
  difficulty: Difficulty;
  questionType: QuestionType;
  onDifficultyChange: (difficulty: Difficulty) => void;
  onTypeChange: (type: QuestionType) => void;
}

const difficultyConfig = {
  easy: { label: "Easy", icon: "🎯", color: "from-green-500 to-emerald-600", accent: "text-green-400" },
  medium: { label: "Medium", icon: "⚡", color: "from-yellow-500 to-orange-600", accent: "text-yellow-400" },
  hard: { label: "Hard", icon: "🔥", color: "from-red-500 to-pink-600", accent: "text-red-400" },
};

const typeConfig = {
  behavioral: { label: "Other", icon: Brain, desc: "General interview questions" },
  technical: { label: "Technical", icon: BarChart3, desc: "Problem-solving & coding" },
  hr: { label: "HR", icon: Zap, desc: "Culture fit & values" },
};

export default function DifficultySelector({
  difficulty,
  questionType,
  onDifficultyChange,
  onTypeChange,
}: DifficultySelectorProps) {
  return (
    <div className="space-y-4">
      {/* Difficulty Level */}
      <Card className="bg-card/40 backdrop-blur-md border-white/5 p-6">
        <h3 className="text-sm font-mono text-muted-foreground uppercase tracking-wider mb-4">Difficulty</h3>
        <div className="grid grid-cols-3 gap-3">
          {(["easy", "medium", "hard"] as const).map((level) => {
            const config = difficultyConfig[level];
            const isSelected = difficulty === level;

            return (
              <motion.div key={level} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={() => onDifficultyChange(level)}
                  className={`w-full h-auto py-4 flex flex-col items-center gap-2 transition-all ${
                    isSelected
                      ? `bg-gradient-to-b ${config.color} text-white shadow-[0_0_20px_rgba(0,0,0,0.3)] border-0`
                      : "bg-white/5 border border-white/10 text-muted-foreground hover:bg-white/10"
                  }`}
                  data-testid={`button-difficulty-${level}`}
                >
                  <span className="text-2xl">{config.icon}</span>
                  <span className="text-sm font-semibold">{config.label}</span>
                </Button>
              </motion.div>
            );
          })}
        </div>

        {/* Difficulty Info */}
        <div className="mt-4 p-3 rounded-lg bg-white/5 border border-white/5 text-xs text-muted-foreground">
          {difficulty === "easy" && "✓ Great for warm-ups and practice"}
          {difficulty === "medium" && "⚡ Standard interview level"}
          {difficulty === "hard" && "🔥 Top-tier companies difficulty"}
        </div>
      </Card>

      {/* Question Type */}
      <Card className="bg-card/40 backdrop-blur-md border-white/5 p-6">
        <h3 className="text-sm font-mono text-muted-foreground uppercase tracking-wider mb-4">Question Type</h3>
        <div className="space-y-2">
          {(["behavioral", "technical", "hr"] as const).map((type) => {
            const config = typeConfig[type];
            const Icon = config.icon;
            const isSelected = questionType === type;

            return (
              <motion.div key={type} whileHover={{ x: 4 }}>
                <Button
                  onClick={() => onTypeChange(type)}
                  variant="ghost"
                  className={`w-full justify-start px-4 py-3 h-auto transition-all ${
                    isSelected
                      ? "bg-primary/10 border border-primary/30 text-primary"
                      : "hover:bg-white/5 text-muted-foreground hover:text-foreground"
                  }`}
                  data-testid={`button-type-${type}`}
                >
                  <Icon className="w-4 h-4 mr-3" />
                  <div className="text-left">
                    <div className="text-sm font-semibold">{config.label}</div>
                    <div className="text-xs text-muted-foreground">{config.desc}</div>
                  </div>
                  {isSelected && <div className="ml-auto text-primary">✓</div>}
                </Button>
              </motion.div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}