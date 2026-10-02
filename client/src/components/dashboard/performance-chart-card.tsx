import { useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import GlassCard from "@/components/common/glass-card";
import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Period = "weekly" | "monthly";

const CHART_DATA: Record<Period, { name: string; score: number }[]> = {
  weekly: [
    { name: "Mon", score: 65 },
    { name: "Tue", score: 72 },
    { name: "Wed", score: 68 },
    { name: "Thu", score: 85 },
    { name: "Fri", score: 82 },
    { name: "Sat", score: 90 },
    { name: "Sun", score: 88 },
  ],
  monthly: [
    { name: "W1", score: 70 },
    { name: "W2", score: 76 },
    { name: "W3", score: 81 },
    { name: "W4", score: 85 },
  ],
};

export default function PerformanceChartCard({ className }: { className?: string }) {
  const [period, setPeriod] = useState<Period>("weekly");

  return (
    <GlassCard className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Performance analytics preview</CardTitle>
        <div className="flex gap-2">
          {(["weekly", "monthly"] as const).map((p) => (
            <Button key={p} size="sm" variant={period === p ? "default" : "outline"} onClick={() => setPeriod(p)} className="capitalize">
              {p}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={CHART_DATA[period]}>
            <defs>
              <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} />
            <Tooltip />
            <Area type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorScore)" />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </GlassCard>
  );
}
