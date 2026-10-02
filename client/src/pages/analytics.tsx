import { useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import { BehaviorFlowCard, FeatureUsageCard, InsightsCard } from "@/components/analytics/detail-cards";
import {
  computeSessionMetrics,
  EngagementScoreCard,
  MetricTiles,
  PerformanceTrendsCard,
} from "@/components/analytics/overview-tab";
import { FilterSelect } from "@/components/common/filters";
import PageHeader from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ANALYTICS_SESSIONS, BEHAVIOR_FLOW, FEATURE_USAGE } from "@/data/analytics";
import { useAnalyticsInsights } from "@/hooks/use-analytics";

const TIMEFRAME_OPTIONS = [
  { value: "24h", label: "Last 24h" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
] as const;

type Timeframe = (typeof TIMEFRAME_OPTIONS)[number]["value"];

export default function Analytics() {
  const [timeframe, setTimeframe] = useState<Timeframe>("7d");
  const insights = useAnalyticsInsights(timeframe);
  const metrics = useMemo(() => computeSessionMetrics(ANALYTICS_SESSIONS), []);

  return (
    <div className="max-w-7xl mx-auto py-6 space-y-6">
      <PageHeader
        title="Analytics"
        description="AI-powered insights into your interview preparation journey"
        actions={
          <>
            <div className="w-36">
              <FilterSelect value={timeframe} onChange={setTimeframe} options={TIMEFRAME_OPTIONS} placeholder="Timeframe" />
            </div>
            <Button variant="outline" onClick={() => insights.refetch()} disabled={insights.isFetching}>
              <RefreshCw className={insights.isFetching ? "h-4 w-4 mr-2 animate-spin" : "h-4 w-4 mr-2"} />
              Refresh
            </Button>
          </>
        }
      />

      <EngagementScoreCard engagement={metrics.engagement} />

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="behavior">Behavior Flow</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <MetricTiles metrics={metrics} />
          <PerformanceTrendsCard sessions={ANALYTICS_SESSIONS} />
        </TabsContent>

        <TabsContent value="behavior">
          <BehaviorFlowCard steps={BEHAVIOR_FLOW} />
        </TabsContent>

        <TabsContent value="features">
          <FeatureUsageCard features={FEATURE_USAGE} />
        </TabsContent>

        <TabsContent value="insights">
          <InsightsCard insights={insights.data ?? []} isLoading={insights.isLoading} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
