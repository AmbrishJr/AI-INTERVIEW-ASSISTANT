import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import PageHeader from "@/components/common/page-header";
import ContentState from "@/components/common/content-state";
import { FilterSelect } from "@/components/common/filters";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { InsightsCard } from "@/components/analytics/detail-cards";
import PerformanceChartCard from "@/components/dashboard/performance-chart-card";
import { loadSessionHistory } from "@/lib/session-history";
import { filterSessions, summarizeSessions } from "@/lib/session-metrics";
import { useAnalyticsInsights, useExplainChart } from "@/hooks/use-analytics";
const options = [
  { value: "24h", label: "Last 24 hours" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
];
export default function Analytics() {
  const [, navigate] = useLocation();
  const [timeframe, setTimeframe] = useState("7d");
  const [all, setAll] = useState(loadSessionHistory);
  const sessions = useMemo(
    () => filterSessions(all, timeframe),
    [all, timeframe],
  );
  const totals = summarizeSessions(sessions);
  const insights = useAnalyticsInsights(timeframe, sessions);
  const explain = useExplainChart();
  return (
    <div className="space-y-7">
      <PageHeader
        title="Your progress"
        description="A clearer view of the practice you’ve put in."
        actions={
          <>
            <div className="w-44">
              <FilterSelect
                value={timeframe}
                onChange={(v) => {
                  setTimeframe(v);
                  explain.reset();
                }}
                options={options}
                placeholder="Timeframe"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setAll(loadSessionHistory());
                explain.reset();
              }}
            >
              Refresh
            </Button>
          </>
        }
      />
      <p className="text-sm text-muted-foreground">
        Based on up to 10 saved sessions in this browser. Camera presence is an
        estimate, not a performance score.
      </p>
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="flex h-auto flex-wrap justify-start gap-1">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="insights">AI insights</TabsTrigger>
          <TabsTrigger value="behavior">Behavior flow</TabsTrigger>
          <TabsTrigger value="features">Feature usage</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-6">
          {!sessions.length ? (
            <ContentState
              title="Make your first data point"
              description="Complete a practice session to start seeing your progress. Try a wider timeframe if you already have saved sessions."
              action={{
                label: "Start practicing",
                onClick: () => navigate("/practice"),
              }}
            />
          ) : (
            <>
              <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {[
                  ["Saved sessions", totals.count],
                  ["Practice time", `${totals.minutes} min`],
                  [
                    "Average speaking pace",
                    totals.pace === null
                      ? "Not measured"
                      : `${totals.pace} WPM`,
                  ],
                  [
                    "Facing camera",
                    totals.camera === null
                      ? "Not measured"
                      : `${totals.camera}%`,
                  ],
                ].map(([label, value]) => (
                  <Card key={label}>
                    <CardContent className="p-5">
                      <p className="text-sm text-muted-foreground">{label}</p>
                      <p className="mt-3 text-2xl font-semibold">{value}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <PerformanceChartCard sessions={sessions} />
              <Card>
                <CardHeader>
                  <CardTitle>Understand your measurements</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Ask the AI coach to explain this timeframe’s measurements.
                    Session metrics are sent to the AI provider; notes are
                    excluded.
                  </p>
                  <Button
                    variant="outline"
                    disabled={explain.isPending}
                    onClick={() =>
                      explain.mutate({
                        chartType: "interview measurements",
                        data: sessions.map(({ date, duration, metrics }) => ({
                          date,
                          durationSeconds: duration,
                          metrics,
                        })),
                      })
                    }
                  >
                    {explain.isPending ? "Explaining…" : "Explain my progress"}
                  </Button>
                  {explain.isError && (
                    <p role="alert" className="mt-4 text-sm text-destructive">
                      The explanation is unavailable. Please try again.
                    </p>
                  )}
                  {explain.data && (
                    <div className="mt-4 rounded-lg bg-muted p-4 text-sm">
                      <p>{explain.data.explanation}</p>
                      {explain.data.nextSteps && (
                        <p className="mt-3">{explain.data.nextSteps}</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
        <TabsContent value="insights" className="space-y-4">
          {!sessions.length ? (
            <ContentState
              title="Your practice comes first"
              description="Save a session before requesting personalized insights."
            />
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <p className="text-sm text-muted-foreground max-w-xl">
                  Generate guidance from this timeframe’s session metrics. Notes
                  are excluded from the request.
                </p>
                <Button
                  onClick={() => insights.refetch()}
                  disabled={insights.isFetching}
                >
                  {insights.isFetching ? "Generating…" : "Generate insights"}
                </Button>
              </div>
              {insights.isError && (
                <ContentState
                  title="Insights are unavailable"
                  description="The AI service couldn’t respond. Your saved measurements are still available."
                  action={{
                    label: "Try again",
                    onClick: () => void insights.refetch(),
                  }}
                />
              )}
              {insights.data && (
                <InsightsCard insights={insights.data} isLoading={false} />
              )}
            </>
          )}
        </TabsContent>
        <TabsContent value="behavior">
          <ContentState
            title="Behavior tracking isn’t enabled"
            description="Page navigation and drop-off analytics are not collected. This view will stay empty until tracking is connected."
          />
        </TabsContent>
        <TabsContent value="features">
          <ContentState
            title="Feature tracking isn’t enabled"
            description="Usage and conversion statistics are not collected. Your interview measurements remain available in Overview."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
