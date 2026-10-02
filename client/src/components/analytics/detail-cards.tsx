import { AlertTriangle, ArrowRight, CheckCircle, TrendingUp, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { AIInsight, BehaviorFlowStep, FeatureUsage } from "@/data/analytics";

export function BehaviorFlowCard({ steps }: { steps: BehaviorFlowStep[] }) {
  const maxCount = Math.max(...steps.map((s) => s.count), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Behavior Flow</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {steps.map((step) => (
          <div key={`${step.from}-${step.to}`} className="flex items-center gap-4">
            <div className="flex items-center gap-2 min-w-0">
              <Badge variant="outline">{step.from}</Badge>
              <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
              <Badge variant="outline">{step.to}</Badge>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{step.count} users</span>
                {step.dropoffRate !== undefined && (
                  <Badge variant="secondary" className="text-xs">
                    {step.dropoffRate}% dropoff
                  </Badge>
                )}
              </div>
              <Progress value={(step.count / maxCount) * 100} className="mt-1" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function FeatureUsageCard({ features }: { features: FeatureUsage[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Feature Analytics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {features.map((f) => (
          <div key={f.feature} className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-semibold">{f.feature}</h4>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span>{f.usage} uses</span>
                {f.conversion !== undefined && <span>{f.conversion}% conversion</span>}
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{f.engagement}%</div>
              <div className="text-sm text-muted-foreground">engagement</div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

const INSIGHT_STYLES: Record<AIInsight["type"], { Icon: typeof TrendingUp; className: string }> = {
  trend: { Icon: TrendingUp, className: "text-blue-400 bg-blue-900/20 border-blue-800/50" },
  anomaly: { Icon: AlertTriangle, className: "text-orange-400 bg-orange-900/20 border-orange-800/50" },
  achievement: { Icon: CheckCircle, className: "text-green-400 bg-green-900/20 border-green-800/50" },
  warning: { Icon: AlertTriangle, className: "text-red-400 bg-red-900/20 border-red-800/50" },
};

export function InsightsCard({ insights, isLoading }: { insights: AIInsight[]; isLoading: boolean }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>AI-Generated Insights</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading && <p className="text-sm text-muted-foreground">Generating insights…</p>}
        {insights.map((insight) => {
          const { Icon, className } = INSIGHT_STYLES[insight.type] ?? INSIGHT_STYLES.trend;
          return (
            <div key={insight.title} className={`p-4 rounded-lg border ${className}`}>
              <div className="flex items-start gap-3">
                <Icon className="h-5 w-5 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-semibold">{insight.title}</h4>
                    <Badge variant="outline">{insight.impact} impact</Badge>
                  </div>
                  <p className="text-sm mt-2 text-foreground/80">{insight.description}</p>
                  {insight.actionable && insight.recommendation && (
                    <div className="mt-3 p-3 bg-white/5 rounded border border-white/10">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Zap className="h-4 w-4" />
                        Recommendation
                      </div>
                      <p className="text-sm mt-1 text-foreground/80">{insight.recommendation}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
