import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { AIInsight } from "@/data/analytics";
import type { SessionRecord } from "@/lib/session-history";
import { useAuth } from "@/contexts/auth-context";
export interface ChartExplanation {
  explanation: string;
  nextSteps?: string;
}
export function useAnalyticsInsights(
  timeframe: string,
  sessions: SessionRecord[] = [],
) {
  const { user } = useAuth();
  const data = sessions.map(({ id, date, duration, metrics, status }) => ({
    id,
    date,
    durationSeconds: duration,
    metrics,
    status,
  }));
  return useQuery({
    queryKey: ["analytics-insights", user?.id, timeframe, data],
    enabled: false,
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<AIInsight[]> => {
      const res = await apiRequest("POST", "/api/analytics/insights", {
        type: "general",
        timeframe,
        data: { sessions: data },
      });
      const result = await res.json();
      if (!Array.isArray(result.insights))
        throw new Error("No insights were returned. Try again.");
      return result.insights;
    },
  });
}
export function useExplainChart() {
  return useMutation({
    mutationFn: async ({
      chartType,
      data,
    }: {
      chartType: string;
      data: unknown;
    }): Promise<ChartExplanation> => {
      const res = await apiRequest("POST", "/api/analytics/explain", {
        chartType,
        data,
      });
      return res.json();
    },
  });
}
