import { motion } from "framer-motion";
import { Brain, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { JobTrend } from "@/data/jobs";

export default function MarketTrends({ trends }: { trends: JobTrend[] }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {trends.map((trend, index) => (
          <motion.div
            key={trend.role}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <TrendCard trend={trend} />
          </motion.div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Career Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-900/20 rounded-lg">
            <h4 className="font-semibold text-blue-100 mb-2">🚀 High Growth Areas</h4>
            <p className="text-sm text-blue-200">
              AI/ML and DevOps roles showing 40%+ growth. Focus on cloud skills and automation tools.
            </p>
          </div>
          <div className="p-4 bg-green-900/20 rounded-lg">
            <h4 className="font-semibold text-green-100 mb-2">💡 Skill Recommendations</h4>
            <p className="text-sm text-green-200">
              Python, AWS, and Kubernetes appear in 70% of high-paying tech roles.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function TrendCard({ trend }: { trend: JobTrend }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{trend.role}</h3>
          <div className="flex items-center gap-1 text-green-600">
            <TrendingUp className="h-4 w-4" />
            <span className="font-medium">+{trend.growth}%</span>
          </div>
        </div>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Open Positions</dt>
            <dd className="font-medium">{trend.openings.toLocaleString()}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Average Salary</dt>
            <dd className="font-medium">{trend.avgSalary}</dd>
          </div>
        </dl>
        <div className="pt-3 mt-3 border-t">
          <div className="text-sm font-medium mb-2">Top Skills in Demand</div>
          <div className="flex flex-wrap gap-1">
            {trend.topSkills.map((skill) => (
              <Badge key={skill} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
