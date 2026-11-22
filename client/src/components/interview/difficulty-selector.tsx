import { Button } from "@/components/ui/button";
export type Difficulty = "easy" | "medium" | "hard";
export type QuestionType = "behavioral" | "technical" | "hr";
interface Props {
  difficulty: Difficulty;
  questionType: QuestionType;
  onDifficultyChange: (v: Difficulty) => void;
  onTypeChange: (v: QuestionType) => void;
}
export default function DifficultySelector({
  difficulty,
  questionType,
  onDifficultyChange,
  onTypeChange,
}: Props) {
  return (
    <div className="space-y-5">
      <fieldset>
        <legend className="text-sm font-medium mb-3">Difficulty</legend>
        <div className="flex flex-wrap gap-2">
          {(["easy", "medium", "hard"] as const).map((v) => (
            <Button
              key={v}
              type="button"
              size="sm"
              variant={v === difficulty ? "default" : "outline"}
              aria-pressed={v === difficulty}
              className="capitalize"
              onClick={() => onDifficultyChange(v)}
            >
              {v}
            </Button>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="text-sm font-medium mb-3">Question type</legend>
        <div className="flex flex-wrap gap-2">
          {(["behavioral", "technical", "hr"] as const).map((v) => (
            <Button
              key={v}
              type="button"
              size="sm"
              variant={v === questionType ? "default" : "outline"}
              aria-pressed={v === questionType}
              className="capitalize"
              onClick={() => onTypeChange(v)}
            >
              {v === "hr" ? "HR" : v}
            </Button>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
