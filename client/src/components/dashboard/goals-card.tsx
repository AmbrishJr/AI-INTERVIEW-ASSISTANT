import { forwardRef, useEffect, useState } from "react";
import GlassCard from "@/components/common/glass-card";
import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { toastError, toastSuccess } from "@/hooks/use-toast";

interface Goal {
  id: string;
  title: string;
  targetPerDayMinutes: number;
  progressMinutesToday: number;
  completed: boolean;
}

const STORAGE_KEY = "dashboardGoals";
const VISIBLE_GOALS = 5;

function loadGoals(): Goal[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((g) => ({
        id: String(g?.id ?? ""),
        title: String(g?.title ?? ""),
        targetPerDayMinutes: Number(g?.targetPerDayMinutes ?? 0),
        progressMinutesToday: Number(g?.progressMinutesToday ?? 0),
        completed: Boolean(g?.completed),
      }))
      .filter((g) => g.id && g.title);
  } catch {
    return [];
  }
}

/** Daily goals persisted in localStorage. The forwarded ref lets the page scroll here. */
const GoalsCard = forwardRef<HTMLDivElement, { className?: string }>(function GoalsCard({ className }, ref) {
  const [goals, setGoals] = useState<Goal[]>(loadGoals);
  const [draftTitle, setDraftTitle] = useState("Study 2 hrs/day");
  const [draftMinutes, setDraftMinutes] = useState(120);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
  }, [goals]);

  const addGoal = () => {
    if (!draftTitle.trim() || draftMinutes <= 0) {
      toastError("Invalid goal", "Please provide a title and target minutes.");
      return;
    }
    const goal: Goal = {
      id: `goal-${Date.now()}`,
      title: draftTitle.trim(),
      targetPerDayMinutes: Math.round(draftMinutes),
      progressMinutesToday: 0,
      completed: false,
    };
    setGoals((prev) => [goal, ...prev]);
    toastSuccess("Goal created", "Your goal was added.");
  };

  const updateGoal = (id: string, patch: Partial<Goal>) =>
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, ...patch } : g)));

  return (
    <GlassCard ref={ref} className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Goals & progress</CardTitle>
        <Button size="sm" variant="outline" onClick={addGoal}>
          Add Goal
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <div className="text-sm font-medium">New goal</div>
            <div className="mt-2 grid gap-2">
              <Input value={draftTitle} onChange={(e) => setDraftTitle(e.target.value)} aria-label="Goal title" />
              <Input
                type="number"
                min={1}
                value={draftMinutes}
                onChange={(e) => setDraftMinutes(Number(e.target.value))}
                aria-label="Goal minutes per day"
              />
              <div className="text-xs text-muted-foreground">Target minutes per day</div>
            </div>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <div className="text-sm font-medium">Tip</div>
            <div className="mt-2 text-sm text-muted-foreground">
              Keep a small daily goal and build a streak. Consistency beats intensity.
            </div>
          </div>
        </div>

        {goals.length === 0 ? (
          <div className="text-sm text-muted-foreground">No goals yet. Create one above.</div>
        ) : (
          <ul className="space-y-3">
            {goals.slice(0, VISIBLE_GOALS).map((g) => {
              const pct = g.targetPerDayMinutes
                ? Math.min(100, Math.round((g.progressMinutesToday / g.targetPerDayMinutes) * 100))
                : 0;
              return (
                <li key={g.id} className="rounded-lg border border-white/10 bg-white/5 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className={g.completed ? "font-medium line-through opacity-70" : "font-medium"}>{g.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {g.progressMinutesToday} / {g.targetPerDayMinutes} minutes today
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          updateGoal(g.id, {
                            progressMinutesToday: Math.min(g.targetPerDayMinutes, g.progressMinutesToday + 10),
                          })
                        }
                      >
                        +10m
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => updateGoal(g.id, { completed: !g.completed })}>
                        {g.completed ? "Undo" : "Mark completed"}
                      </Button>
                    </div>
                  </div>
                  <Progress value={pct} className="mt-3 h-2" />
                  <div className="mt-2 text-xs text-muted-foreground">{pct}%</div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </GlassCard>
  );
});

export default GoalsCard;
