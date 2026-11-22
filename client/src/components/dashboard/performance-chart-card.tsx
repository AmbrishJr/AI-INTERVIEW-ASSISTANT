import { useMemo, useState } from "react";
import {
  Line,
  LineChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { loadSessionHistory, type SessionRecord } from "@/lib/session-history";
import { filterSessions, measured } from "@/lib/session-metrics";
export default function PerformanceChartCard({
  className,
  sessions,
}: {
  className?: string;
  sessions?: SessionRecord[];
}) {
  const [period, setPeriod] = useState("7d");
  const data = useMemo(
    () =>
      filterSessions(sessions ?? loadSessionHistory(), period)
        .sort((a, b) => Date.parse(a.date) - Date.parse(b.date))
        .map((s) => ({
          date: new Date(s.date).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          }),
          camera: measured(s.metrics?.eyeContactPct, 100),
        })),
    [sessions, period],
  );
  return (
    <Card className={className}>
      <CardHeader className="flex sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <CardTitle>Camera presence over time</CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">
            Estimated time facing the camera during measured sessions.
          </p>
        </div>
        <div className="flex gap-1">
          {[
            ["7d", "Week"],
            ["30d", "Month"],
          ].map(([value, label]) => (
            <Button
              key={value}
              size="sm"
              variant={period === value ? "secondary" : "ghost"}
              onClick={() => setPeriod(value)}
            >
              {label}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {data.some((d) => d.camera !== null) ? (
          <div
            className="h-64"
            role="img"
            aria-label="Facing-camera percentage across saved sessions"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  domain={[0, 100]}
                  width={35}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  formatter={(value: number) => [`${value}%`, "Facing camera"]}
                />
                <Line
                  dataKey="camera"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  connectNulls={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center text-center rounded-lg bg-muted/40">
            <p className="font-medium">Your progress starts with a session</p>
            <p className="mt-2 text-sm text-muted-foreground max-w-xs">
              Practice with the camera on to see measured camera presence here.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
