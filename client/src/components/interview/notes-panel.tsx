import type { Ref } from "react";
import { BookOpen } from "lucide-react";
import PanelCard from "./panel-card";

interface NotesPanelProps {
  notes: string;
  onNotesChange: (value: string) => void;
  autoSave: boolean;
  onAutoSaveChange: (value: boolean) => void;
  lastSaved: Date | null;
  textareaRef?: Ref<HTMLTextAreaElement>;
}

export default function NotesPanel({
  notes,
  onNotesChange,
  autoSave,
  onAutoSaveChange,
  lastSaved,
  textareaRef,
}: NotesPanelProps) {
  return (
    <PanelCard
      icon={<BookOpen className="w-4 h-4 text-blue-400" />}
      title="Session Notes"
      actions={
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={autoSave}
              onChange={(e) => onAutoSaveChange(e.target.checked)}
              className="rounded border-gray-600 bg-gray-700"
            />
            Auto-save
          </label>
          {lastSaved && (
            <span className="text-xs text-muted-foreground">Last saved: {lastSaved.toLocaleTimeString()}</span>
          )}
        </div>
      }
    >
      <textarea
        ref={textareaRef}
        value={notes}
        onChange={(e) => onNotesChange(e.target.value)}
        placeholder="Type your notes here..."
        className="w-full h-40 p-3 bg-gray-800/50 border border-gray-700 rounded-md text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent resize-none"
      />
      <div className="mt-2 flex justify-between items-center text-xs text-muted-foreground">
        <span>Press Ctrl+S to save manually</span>
        <span>{notes.length} characters</span>
      </div>
    </PanelCard>
  );
}
