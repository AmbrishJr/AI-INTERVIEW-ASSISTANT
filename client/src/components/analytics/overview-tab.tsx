import { useMemo } from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { Activity, Brain, CheckCircle, Clock, Loader2, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Progress } from "@/components/ui/progress";
import type { AnalyticsSession } from "@/data/analytics";
import { useExplainChart } from "@/hooks/use-analytics";

const average = (values: number[]) => (values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0);

export function computeSessionMetrics(sessions: AnalyticsSession[]) {
  const avgFocus = average(sessions.map((s) => s.focusScore));
  const avgDuration = average(sessions.map((s) => s.duration));
  const completionRate = sessions.length
    ? (sessions.filter((s) => s.status === "completed").length / sessions.length) * 100
    : 0;
  const engagement = Math.round(avgFocus * 0.4 + avgDuration * 0.3 + completionRate * 0.3);

  return {
    totalSessions: sessions.length,
    avgFocusScore: Math.round(avgFocus),
    completionRate: Math.round(completionRate),
    totalHours: Math.round(sessions.reduce((sum, s) => sum + s.duration, 0) / 60),
    engagement: {
      overall: engagement,
      timeSpent: Math.min(100, Math.round(avgDuration * 2)),
      interactions: 85,
      returnVisits: 92,
      quality: engagement,
    },
  };
}

type SessionMetrics = ReturnType<typeof computeSessionMetrics>;

export function EngagementScoreCard({ engagement }: { engagement: SessionMetrics["engagement"] }) {
  const parts = [
    { label: "Time Spent", value: engagement.timeSpent },
    { label: "Interactions", value: engagement.interactions },
    { label: "Return Visits", value: engagement.returnVisits },
    { label: "Quality", value: engagement.quality },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Engagement Quality Score
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="text-center">
          <div className="text-4xl font-bold text-primary">{engagement.overall}</div>
          <div className="text-sm text-muted-foreground mt-1">Overall Score</div>
          <Progress value={engagement.overall} className="mt-2" />
        </div>
        {parts.map(({ label, value }) => (
          <div key={label} className="text-center">
            <div className="text-2xl font-semibold">{value}%</div>
            <div className="text-sm text-muted-foreground">{label}</div>
            <Progress value={value} className="mt-2" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function MetricTiles({ metrics }: { metrics: SessionMetrics }) {
  const tiles = [
    { label: "Total Sessions", value: metrics.totalSessions, Icon: Activity },
    { label: "Avg Focus Score", value: `${metrics.avgFocusScore}%`, Icon: Target },
    { label: "Completion Rate", value: `${metrics.completionRate}%`, Icon: CheckCircle },
    { label: "Total Time", value: `${metrics.totalHours}h`, Icon: Clock },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {tiles.map(({ label, value, Icon }) => (
        <Card key={label}>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{label}</p>
              <p className="text-2xl font-bold">{value}</p>
            </div>
            <Icon className="h-8 w-8 text-muted-foreground" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

const CHART_CONFIG = {
  focusScore: { label: "Focus Score", color: "hsl(217, 91%, 60%)" },
  duration: { label: "Duration (min)", color: "hsl(142, 76%, 36%)" },
} satisfies ChartConfig;

export function PerformanceTrendsCard({ sessions }: { sessions: AnalyticsSession[] }) {
  const explain = useExplainChart();

  const data = useMemo(
    () =>
      sessions
        .map(({ date, focusScore, duration, sessionName }) => ({ date, focusScore, duration, sessionName }))
        .sort((a, b) => a.date.localeCompare(b.date)),
    [sessions],
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Performance Trends</CardTitle>
        <Button
          variant="outline"
          size="sm"
          disabled={explain.isPending}
          onClick={() => explain.mutate({ chartType: "performance", data: sessions })}
        >
          {explain.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Brain className="h-4 w-4 mr-2" />}
          Explain
        </Button>
      </CardHeader>
      <CardContent>
        {explain.isError && (
          <p className="mb-4 text-sm text-red-400">Couldn't get an explanation right now. Please try again later.</p>
        )}
        {explain.data && (
          <div className="mb-4 p-4 bg-blue-900/20 rounded-lg border border-blue-800/50">
            <h4 className="font-semibold text-blue-100 mb-2">AI Explanation</h4>
            <p className="text-sm text-blue-200">{explain.data.explanation}</p>
            {explain.data.nextSteps && (
              <p className="text-sm text-blue-300 mt-2">
                <strong>Next steps:</strong> {explain.data.nextSteps}
              </p>
            )}
          </div>
        )}
        <ChartContainer config={CHART_CONFIG} className="h-64 w-full">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
            <ChartTooltip content={<ChartTooltipContent labelFormatter={(value) => `Date: ${value}`} />} />
            <Line type="monotone" dataKey="focusScore" stroke="var(--color-focusScore)" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="duration" stroke="var(--color-duration)" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
