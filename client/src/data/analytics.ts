export interface AnalyticsSession {
  id: string;
  date: string;
  sessionName: string;
  /** Minutes. */
  duration: number;
  /** 0-100. */
  focusScore: number;
  breakCount: number;
  status: "completed" | "paused" | "abandoned";
  pageViews: number;
  scrollDepth: number;
  interactions: number;
}

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

export const ANALYTICS_SESSIONS: AnalyticsSession[] = [
  { id: "1", date: "2024-01-23", sessionName: "Morning Practice", duration: 45, focusScore: 85, breakCount: 1, status: "completed", pageViews: 12, scrollDepth: 78, interactions: 25 },
  { id: "2", date: "2024-01-23", sessionName: "News Reading", duration: 30, focusScore: 72, breakCount: 0, status: "completed", pageViews: 8, scrollDepth: 65, interactions: 15 },
  { id: "3", date: "2024-01-22", sessionName: "Evening Review", duration: 60, focusScore: 90, breakCount: 2, status: "completed", pageViews: 15, scrollDepth: 85, interactions: 32 },
  { id: "4", date: "2024-01-22", sessionName: "Quick Session", duration: 20, focusScore: 65, breakCount: 0, status: "paused", pageViews: 5, scrollDepth: 45, interactions: 8 },
  { id: "5", date: "2024-01-21", sessionName: "Deep Work", duration: 120, focusScore: 88, breakCount: 3, status: "completed", pageViews: 25, scrollDepth: 92, interactions: 45 },
];

export const BEHAVIOR_FLOW: BehaviorFlowStep[] = [
  { from: "Home", to: "Dashboard", count: 145, dropoffRate: 5 },
  { from: "Dashboard", to: "News", count: 89, dropoffRate: 12 },
  { from: "News", to: "Jobs", count: 67, dropoffRate: 8 },
  { from: "Jobs", to: "Analytics", count: 34, dropoffRate: 15 },
  { from: "Analytics", to: "Session", count: 28, dropoffRate: 3 },
];

export const FEATURE_USAGE: FeatureUsage[] = [
  { feature: "News Search", usage: 234, engagement: 78, conversion: 45 },
  { feature: "Job Filters", usage: 189, engagement: 65, conversion: 32 },
  { feature: "AI Coach", usage: 156, engagement: 82, conversion: 28 },
  { feature: "Bookmarks", usage: 98, engagement: 71, conversion: 19 },
  { feature: "Sessions", usage: 267, engagement: 89, conversion: 67 },
];

/** Used when the AI insights endpoint is unavailable. */
export const FALLBACK_INSIGHTS: AIInsight[] = [
  {
    type: "achievement",
    title: "Focus Score Improved",
    description: "Your average focus score increased by 12% this week, showing better concentration during practice sessions.",
    impact: "high",
    actionable: false,
    recommendation: "Keep up the great work!",
  },
  {
    type: "trend",
    title: "News Engagement Rising",
    description: "You're spending 23% more time reading tech news, which helps with interview preparation.",
    impact: "medium",
    actionable: true,
    recommendation: "Focus on AI and cloud computing news for better results.",
  },
];
