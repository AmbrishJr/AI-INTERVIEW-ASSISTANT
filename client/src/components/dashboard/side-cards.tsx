import { useState } from "react";
import { Award, BarChart3, CheckCircle, Play, Star } from "lucide-react";
import GlassCard from "@/components/common/glass-card";
import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toastInfo, toastSuccess } from "@/hooks/use-toast";
import { LiveClock } from "./dashboard-header";
import type { DashboardSession } from "./dashboard-data";

const TIPS = [
  "Tip: pause briefly before answering to improve clarity.",
  "Tip: summarize your answer in one sentence at the end.",
];

export function InsightsCard({ latestSession }: { latestSession?: DashboardSession }) {
  const [tipIndex, setTipIndex] = useState(0);
  const items = [
    "Best time slot: 4–6 PM",
    latestSession
      ? `Your recent focus score is ${latestSession.focusScore}. Try 15–20m sessions.`
      : "Complete a session to unlock insights.",
    TIPS[tipIndex],
  ];

  return (
    <GlassCard>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>AI insights</CardTitle>
        <Button size="sm" variant="outline" onClick={() => setTipIndex((i) => (i + 1) % TIPS.length)}>
          Refresh
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((text) => (
          <div key={text} className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-muted-foreground">
            {text}
          </div>
        ))}
      </CardContent>
    </GlassCard>
  );
}

const INITIAL_REMINDERS = [
  { id: "rem-1", title: "Upcoming session reminder", message: "Schedule a 20-minute practice session this evening.", time: "Today", read: false },
  { id: "rem-2", title: "Goal deadline alert", message: "You’re 30 minutes away from today’s goal.", time: "This week", read: false },
];

export function RemindersCard() {
  const [reminders, setReminders] = useState(INITIAL_REMINDERS);
  const markRead = (id?: string) =>
    setReminders((prev) => prev.map((r) => (id === undefined || r.id === id ? { ...r, read: true } : r)));
  const dismiss = (id: string) => setReminders((prev) => prev.filter((r) => r.id !== id));

  return (
    <GlassCard>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Reminders</CardTitle>
        <Button size="sm" variant="outline" onClick={() => markRead()}>
          Mark all read
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        {reminders.length === 0 && <div className="text-sm text-muted-foreground">You're all caught up.</div>}
        {reminders.map((r) => (
          <div key={r.id} className={`rounded-lg border border-white/10 p-3 ${r.read ? "bg-white/5" : "bg-primary/10"}`}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-sm font-medium">{r.title}</div>
                <div className="text-xs text-muted-foreground">{r.message}</div>
                <div className="mt-1 text-xs text-muted-foreground">{r.time}</div>
              </div>
              <div className="flex gap-2">
                {!r.read && (
                  <Button size="sm" variant="outline" onClick={() => markRead(r.id)}>
                    Read
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={() => dismiss(r.id)}>
                  Dismiss
                </Button>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </GlassCard>
  );
}

const TIMELINE = [
  { title: "Session started", time: "Today", Icon: Play },
  { title: "Session completed", time: "Yesterday", Icon: CheckCircle },
  { title: "Goal achieved", time: "This week", Icon: Award },
  { title: "Analytics viewed", time: "This week", Icon: BarChart3 },
];

export function ActivityTimelineCard({ className }: { className?: string }) {
  return (
    <GlassCard className={className}>
      <CardHeader>
        <CardTitle>Activity timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="space-y-4">
          {TIMELINE.map(({ title, time, Icon }, idx) => (
            <li key={title} className="flex gap-3">
              <div className="w-8 flex flex-col items-center">
                <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                {idx < TIMELINE.length - 1 && <div className="flex-1 w-px bg-white/10" />}
              </div>
              <div className="flex-1 rounded-lg border border-white/10 bg-white/5 p-3 flex items-center justify-between">
                <div className="font-medium">{title}</div>
                <div className="text-xs text-muted-foreground">{time}</div>
              </div>
            </li>
          ))}
        </ol>
      </CardContent>
    </GlassCard>
  );
}

export function SystemStatusCard() {
  const [notificationsOn, setNotificationsOn] = useState(true);
  return (
    <GlassCard>
      <CardHeader>
        <CardTitle>System & settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">App status</span>
          <span className="text-green-400">Online</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Last sync</span>
          <LiveClock timeOnly />
        </div>
        <div className="flex items-center justify-between">
          <span>Notifications</span>
          <Button size="sm" variant="outline" aria-pressed={notificationsOn} onClick={() => setNotificationsOn((v) => !v)}>
            {notificationsOn ? "On" : "Off"}
          </Button>
        </div>
      </CardContent>
    </GlassCard>
  );
}

export function FeedbackCard({ className }: { className?: string }) {
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");

  const submit = () => {
    toastSuccess("Feedback sent", "Thanks! We recorded your feedback.");
    setText("");
    setRating(0);
  };

  return (
    <GlassCard className={className}>
      <CardHeader>
        <CardTitle>Feedback & support</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating">
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              type="button"
              role="radio"
              aria-checked={rating === s}
              aria-label={`Rate ${s} stars`}
              className="p-1"
              onClick={() => setRating(s)}
            >
              <Star className={`h-5 w-5 ${rating >= s ? "text-yellow-400 fill-current" : "text-muted-foreground"}`} />
            </button>
          ))}
        </div>
        <Textarea value={text} onChange={(e) => setText(e.target.value)} className="min-h-24" placeholder="Tell us what to improve..." />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Button onClick={submit} disabled={!rating && !text.trim()}>
            Submit feedback
          </Button>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <button type="button" className="hover:underline" onClick={() => toastInfo("Docs", "Docs link coming soon.")}>
              Help / Docs
            </button>
            <button type="button" className="hover:underline" onClick={() => toastInfo("Support", "Support contact coming soon.")}>
              Contact Support
            </button>
          </div>
        </div>
      </CardContent>
    </GlassCard>
  );
}
