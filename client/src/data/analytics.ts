export interface AIInsight {
  type: "trend" | "anomaly" | "achievement" | "warning";
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  actionable: boolean;
  recommendation?: string;
}

export interface BehaviorFlowStep {
  from: string;
  to: string;
  count: number;
  dropoffRate?: number;
}

export interface FeatureUsage {
  feature: string;
  usage: number;
  engagement: number;
  conversion?: number;
}
