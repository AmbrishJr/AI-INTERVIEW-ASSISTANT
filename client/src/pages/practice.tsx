import { useState } from "react";
import InterviewRoom from "@/components/interview/interview-room";
import PracticeSetup, { type PracticeSetupData } from "@/components/interview/practice-setup";
import { generateQuestions, type Difficulty, type QuestionType } from "@/data/complete-questions-data";

const QUESTIONS_PER_PRACTICE = 20;

interface PracticeConfig extends PracticeSetupData {
  questions: string[];
}

/** Guided practice: pick a domain/level on the setup screen, then interview with generated questions. */
export default function Practice() {
  const [config, setConfig] = useState<PracticeConfig | null>(null);

  if (!config) {
    return (
      <PracticeSetup
        onSubmit={(setup) =>
          setConfig({
            ...setup,
            questions: generateQuestions(
              setup.selectedDomain,
              setup.questionType as QuestionType,
              setup.difficulty as Difficulty,
              QUESTIONS_PER_PRACTICE,
            ),
          })
        }
      />
    );
  }

  return (
    <InterviewRoom
      questions={config.questions}
      subtitle={`${config.selectedDomain} • ${config.questionType} • ${config.difficulty}`}
      exitLabel="Back to Setup"
      onExit={() => setConfig(null)}
    />
  );
}
