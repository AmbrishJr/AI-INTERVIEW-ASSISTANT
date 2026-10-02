import { useQuery } from "@tanstack/react-query";

export interface ProductPulse {
  activeUsers: number;
  jobsTracked: number;
  newsUpdates: number;
  engagementRate: number;
  userGrowth: { daily: number; weekly: number; monthly: number };
}

const FALLBACK_SUMMARY =
  "Today in Tech: AI continues to dominate job markets, cloud computing sees rapid growth, and cybersecurity roles are in high demand.";

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/** Homepage KPIs plus an AI-written "today in tech" summary derived from them. */
export function useProductPulse() {
  const pulse = useQuery({
    queryKey: ["/api/product/pulse"],
    select: (data: { kpis: ProductPulse }) => data.kpis,
    staleTime: 5 * 60 * 1000,
  });

  const summary = useQuery({
    queryKey: ["ai-summary", pulse.data],
    enabled: pulse.isSuccess,
    queryFn: async () => {
      const data = await postJson<{ summary?: string }>("/api/ai/insights", {
        type: "summary",
        data: pulse.data,
        context: "Today in tech - daily summary for homepage",
      });
      return data.summary || FALLBACK_SUMMARY;
    },
  });

  return {
    pulse: pulse.data,
    summary: summary.data ?? FALLBACK_SUMMARY,
  };
}
