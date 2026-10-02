import { History } from "lucide-react";
import { formatClock } from "@/lib/format";
import type { SessionRecord } from "@/lib/session-history";
import PanelCard from "./panel-card";

export default function SessionHistoryPanel({ sessions }: { sessions: SessionRecord[] }) {
  return (
    <PanelCard icon={<History className="w-4 h-4 text-purple-400" />} title="Session History">
      {sessions.length > 0 ? (
        <ul className="space-y-3 max-h-60 overflow-y-auto pr-2">
          {sessions.map((session) => (
            <li key={session.id} className="p-3 bg-gray-800/50 rounded-md border border-gray-700/50">
              <div className="flex justify-between items-center">
                <span className="font-medium text-sm">{new Date(session.date).toLocaleDateString()}</span>
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                  {formatClock(session.duration)}
                </span>
              </div>
              {session.notes && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{session.notes}</p>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center py-6 text-muted-foreground text-sm">
          <p>No previous sessions found</p>
          <p className="text-xs mt-1">Your session history will appear here</p>
        </div>
      )}
    </PanelCard>
  );
}
