import { useState } from "react";
import { useLocation } from "wouter";
import { Settings2 } from "lucide-react";
import DifficultySelector, { type Difficulty, type QuestionType } from "@/components/interview/difficulty-selector";
import InterviewRoom from "@/components/interview/interview-room";
import PanelCard from "@/components/interview/panel-card";
import { QUICK_SESSION_QUESTIONS } from "@/data/quick-session-questions";

/** Quick mock interview using the built-in question bank. */
export default function Session() {
  const [, setLocation] = useLocation();
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [questionType, setQuestionType] = useState<QuestionType>("behavioral");

  return (
    <InterviewRoom
      questions={QUICK_SESSION_QUESTIONS[difficulty][questionType]}
      subtitle={`${difficulty} • ${questionType}`}
      exitLabel="Back"
      onExit={() => setLocation("/")}
      settingsPanel={
        <PanelCard icon={<Settings2 className="w-4 h-4 text-blue-400" />} title="Interview Settings">
          <DifficultySelector
            difficulty={difficulty}
            questionType={questionType}
            onDifficultyChange={setDifficulty}
            onTypeChange={setQuestionType}
          />
        </PanelCard>
      }
    />
  );
}
