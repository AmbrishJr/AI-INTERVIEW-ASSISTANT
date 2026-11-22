import { useState, type FormEvent } from "react";
import { Mic, ScanFace, NotebookPen } from "lucide-react";
import PageHeader from "@/components/common/page-header";
import { FilterSelect } from "@/components/common/filters";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
export interface PracticeSetupData {
  selectedDomain: string;
  experienceLevel: string;
  difficulty: string;
  questionType: string;
}
const domains = [
  "Artificial Intelligence",
  "Data Science",
  "Web Development",
  "Mobile App Development",
  "Cybersecurity",
  "Cloud Computing",
  "DevOps",
  "Machine Learning",
  "UI/UX Design",
  "Software Engineering",
  "Blockchain",
  "IoT",
];
export default function PracticeSetup({
  onSubmit,
}: {
  onSubmit: (data: PracticeSetupData) => void;
}) {
  const [setup, setSetup] = useState<PracticeSetupData>({
    selectedDomain: "Web Development",
    experienceLevel: "Student",
    difficulty: "Easy",
    questionType: "Technical",
  });
  const submit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(setup);
  };
  return (
    <div className="space-y-9">
      <PageHeader
        title="A little preparation goes a long way."
        description="Choose what you’d like to practice. We’ll take it one question at a time."
      />
      <div className="grid lg:grid-cols-[1.5fr_1fr] gap-8 items-start">
        <Card className="p-6 sm:p-8">
          <div className="border-b pb-6 mb-7">
            <h2 className="text-xl font-semibold">
              Build your practice session
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              20 questions from the built-in question bank.
            </p>
          </div>
          <form onSubmit={submit} className="space-y-6">
            {(
              [
                { key: "selectedDomain", label: "Your field", values: domains },
                {
                  key: "experienceLevel",
                  label: "Experience level",
                  values: [
                    "Student",
                    "Fresher",
                    "1-3 Years",
                    "3-5 Years",
                    "5+ Years",
                  ],
                },
                {
                  key: "questionType",
                  label: "Question type",
                  values: ["Technical", "HR", "Other"],
                },
              ] as const
            ).map(({ key, label, values }) => (
              <div key={key} className="space-y-2">
                <p id={`${key}-label`} className="text-sm font-medium">
                  {label}
                </p>
                <FilterSelect
                  value={setup[key]}
                  onChange={(value) => setSetup({ ...setup, [key]: value })}
                  options={values.map((value) => ({ value, label: value }))}
                  placeholder={label}
                />
                {key === "experienceLevel" && (
                  <p className="text-xs text-muted-foreground">
                    Saved as session context. Difficulty controls the question
                    level.
                  </p>
                )}
              </div>
            ))}
            <fieldset>
              <legend className="text-sm font-medium mb-3">Difficulty</legend>
              <div className="grid grid-cols-3 gap-3">
                {["Easy", "Medium", "Hard"].map((value) => (
                  <label
                    key={value}
                    className={`cursor-pointer rounded-lg border p-3 text-center text-sm ${setup.difficulty === value ? "border-primary bg-blue-50 text-primary" : "hover:bg-muted"}`}
                  >
                    <input
                      type="radio"
                      name="difficulty"
                      value={value}
                      checked={setup.difficulty === value}
                      onChange={() => setSetup({ ...setup, difficulty: value })}
                      className="sr-only peer"
                    />
                    <span className="peer-focus-visible:outline peer-focus-visible:outline-2">
                      {value}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="border-t pt-6">
              <Button size="lg" type="submit" className="w-full sm:w-auto">
                Enter practice room
              </Button>
              <p className="text-xs text-muted-foreground mt-3">
                The timer starts when you’re ready.
              </p>
            </div>
          </form>
        </Card>
        <aside className="space-y-7 lg:pt-3">
          <div>
            <p className="text-sm text-primary font-medium mb-3">
              SET YOURSELF UP WELL
            </p>
            <h2 className="text-2xl font-semibold">
              A quiet space.
              <br />A chance to try.
            </h2>
          </div>
          {[
            {
              Icon: Mic,
              title: "Speak your answer out loud",
              text: "Your microphone enables live speaking feedback. Speech recognition depends on your browser.",
            },
            {
              Icon: ScanFace,
              title: "Find a comfortable frame",
              text: "Camera analysis checks framing and estimated camera presence. You can turn it off at any time.",
            },
            {
              Icon: NotebookPen,
              title: "Keep what you learn",
              text: "Save notes and review your session. The latest 10 summaries stay in this browser.",
            },
          ].map(({ Icon, title, text }) => (
            <div className="flex gap-4" key={title}>
              <Icon className="text-muted-foreground shrink-0 mt-1" size={21} />
              <div>
                <h3 className="text-sm font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  {text}
                </p>
              </div>
            </div>
          ))}
        </aside>
      </div>
    </div>
  );
}
