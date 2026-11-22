import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { DashboardSession } from "./dashboard-data";
import { loadSessionHistory } from "@/lib/session-history";
const tips = [
  "Pause briefly before answering. Give yourself time to choose an example.",
  "Try the STAR structure: situation, task, action, and result.",
  "Finish with what you learned or what changed because of your work.",
];
export function InsightsCard({
  latestSession,
}: {
  latestSession?: DashboardSession;
}) {
  const [index, setIndex] = useState(0);
  return (
    <Card>
      <CardHeader>
        <CardTitle>For your next practice</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-relaxed">{tips[index]}</p>
        <p className="mt-4 text-xs text-muted-foreground">
          General practice guidance · not an AI assessment
        </p>
        {latestSession && (
          <p className="mt-4 text-sm text-muted-foreground">
            Your latest session is ready to review in recent sessions.
          </p>
        )}
        <Button
          className="mt-5"
          variant="outline"
          size="sm"
          onClick={() => setIndex((index + 1) % tips.length)}
        >
          Another tip
        </Button>
      </CardContent>
    </Card>
  );
}
export function RemindersCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Reminders</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          No scheduled reminders. Scheduling and notifications aren’t available
          yet.
        </p>
        <Button variant="outline" size="sm" className="mt-4" disabled>
          Notifications unavailable
        </Button>
      </CardContent>
    </Card>
  );
}
export function ActivityTimelineCard({ className }: { className?: string }) {
  const sessions = loadSessionHistory();
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Recent activity</CardTitle>
      </CardHeader>
      <CardContent>
        {sessions.length ? (
          <ol className="divide-y">
            {sessions.slice(0, 5).map((s) => (
              <li
                key={s.id}
                className="py-3 flex flex-wrap justify-between gap-2 text-sm"
              >
                <span>
                  {s.status === "completed"
                    ? "Practice completed"
                    : "Practice saved"}
                </span>
                <time className="text-muted-foreground">
                  {new Date(s.date).toLocaleString()}
                </time>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-sm text-muted-foreground">
            Your saved practice sessions will appear here.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
export function SystemStatusCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>About your data</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground space-y-3">
        <p>
          Session summaries, notes, goals, and bookmarks stay in this browser,
          separated by account.
        </p>
        <p>
          The latest 10 sessions are retained. Export your history to keep a
          copy. Data does not sync across devices.
        </p>
      </CardContent>
    </Card>
  );
}
export function FeedbackCard({ className }: { className?: string }) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Feedback & support</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Feedback submission and support channels aren’t connected yet.
        </p>
        <Textarea
          aria-label="Feedback unavailable"
          placeholder="Feedback submission is unavailable"
          disabled
        />
        <Button className="mt-3" variant="outline" disabled>
          Submit feedback
        </Button>
      </CardContent>
    </Card>
  );
}
