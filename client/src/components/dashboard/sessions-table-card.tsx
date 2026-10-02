import { useMemo, useState, type ReactNode } from "react";
import GlassCard from "@/components/common/glass-card";
import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDuration, parseDate } from "@/lib/format";
import type { DashboardSession } from "./dashboard-data";

type SortKey = "date" | "score";
type StatusFilter = "all" | DashboardSession["status"];

const STATUS_FILTERS: StatusFilter[] = ["all", "completed", "active", "paused"];
const MAX_ROWS = 10;

const formatDate = (iso: string) => parseDate(iso)?.toLocaleString() ?? iso;

export default function SessionsTableCard({ sessions }: { sessions: DashboardSession[] }) {
  const [sortBy, setSortBy] = useState<SortKey>("date");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selected, setSelected] = useState<DashboardSession | null>(null);

  const rows = useMemo(() => {
    const list = statusFilter === "all" ? sessions : sessions.filter((s) => s.status === statusFilter);
    return [...list]
      .sort((a, b) =>
        sortBy === "score"
          ? b.focusScore - a.focusScore
          : (parseDate(b.date)?.getTime() ?? 0) - (parseDate(a.date)?.getTime() ?? 0),
      )
      .slice(0, MAX_ROWS);
  }, [sessions, sortBy, statusFilter]);

  return (
    <GlassCard>
      <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <CardTitle>Recent sessions</CardTitle>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant={sortBy === "date" ? "default" : "outline"} onClick={() => setSortBy("date")}>
            Sort: Date
          </Button>
          <Button size="sm" variant={sortBy === "score" ? "default" : "outline"} onClick={() => setSortBy("score")}>
            Sort: Score
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline">
                Filter: {statusFilter}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {STATUS_FILTERS.map((f) => (
                <DropdownMenuItem key={f} onClick={() => setStatusFilter(f)}>
                  {f}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Focus Score</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((s) => (
              <TableRow key={s.id} className="cursor-pointer" onClick={() => setSelected(s)}>
                <TableCell>{formatDate(s.date)}</TableCell>
                <TableCell>{formatDuration(s.duration)}</TableCell>
                <TableCell>{s.focusScore}</TableCell>
                <TableCell className="capitalize">{s.status}</TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No sessions match this filter.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>

      <SessionDetailsDialog session={selected} onClose={() => setSelected(null)} />
    </GlassCard>
  );
}

function SessionDetailsDialog({ session, onClose }: { session: DashboardSession | null; onClose: () => void }) {
  return (
    <Dialog open={session !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Session details</DialogTitle>
          <DialogDescription>Saved practice session.</DialogDescription>
        </DialogHeader>
        {session && (
          <dl className="space-y-3 text-sm">
            <DetailRow label="Date" value={formatDate(session.date)} />
            <DetailRow label="Duration" value={<span className="font-mono">{formatDuration(session.duration)}</span>} />
            <DetailRow label="Focus Score" value={session.focusScore} />
            <DetailRow label="Status" value={<span className="capitalize">{session.status}</span>} />
            {session.notes && (
              <div className="rounded-md border border-white/10 bg-white/5 p-3 text-muted-foreground">{session.notes}</div>
            )}
          </dl>
        )}
      </DialogContent>
    </Dialog>
  );
}

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
