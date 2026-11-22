import { useCallback, useState } from "react";
import { readLocal, writeLocal } from "@/lib/local-data";
import { useAuth } from "@/contexts/auth-context";
import { toastInfo } from "@/hooks/use-toast";
export function useBookmarks(itemNoun: string) {
  const { user } = useAuth();
  const key = `bookmarks:${itemNoun}`;
  const read = () => {
    try {
      const value = JSON.parse(readLocal(key) ?? "[]");
      return new Set<string>(
        Array.isArray(value) ? value.filter((v) => typeof v === "string") : [],
      );
    } catch {
      return new Set<string>();
    }
  };
  const [state, setState] = useState(() => ({ owner: user?.id, ids: read() }));
  const ids = state.owner === user?.id ? state.ids : read();
  if (state.owner !== user?.id) setState({ owner: user?.id, ids });
  const toggle = useCallback(
    (id: string) => {
      const next = new Set(ids);
      const saved = next.has(id);
      saved ? next.delete(id) : next.add(id);
      const durable = writeLocal(key, JSON.stringify([...next]));
      setState({ owner: user?.id, ids: next });
      toastInfo(
        durable
          ? saved
            ? "Bookmark removed"
            : "Bookmarked"
          : "Saved for this visit only",
        durable
          ? `${itemNoun} ${saved ? "removed" : "saved in this browser"}.`
          : "Browser storage is unavailable.",
      );
    },
    [ids, key, itemNoun, user?.id],
  );
  return { isBookmarked: (id: string) => ids.has(id), toggle, count: ids.size };
}
