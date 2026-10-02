import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  ANALYTICS_SESSIONS,
  FALLBACK_INSIGHTS,
  FEATURE_USAGE,
  type AIInsight,
} from "@/data/analytics";

export interface ChartExplanation {
  explanation: string;
  nextSteps?: string;
}

/** AI-generated insights for the analytics page; falls back to canned insights offline. */
export function useAnalyticsInsights(timeframe: string) {
  return useQuery({
    queryKey: ["analytics-insights", timeframe],
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<AIInsight[]> => {
      try {
        const res = await apiRequest("POST", "/api/analytics/insights", {
          type: "general",
          timeframe,
          data: { sessions: ANALYTICS_SESSIONS, features: FEATURE_USAGE, timeframe },
        });
        const data: { insights?: AIInsight[] } = await res.json();
        return data.insights?.length ? data.insights : FALLBACK_INSIGHTS;
      } catch {
        return FALLBACK_INSIGHTS;
      }
    },
  });
}

/** Asks the AI to explain a chart's data in plain language. */
export function useExplainChart() {
  return useMutation({
    mutationFn: async ({ chartType, data }: { chartType: string; data: unknown }): Promise<ChartExplanation> => {
      const res = await apiRequest("POST", "/api/analytics/explain", { chartType, data });
      return res.json();
    },
  });
}
