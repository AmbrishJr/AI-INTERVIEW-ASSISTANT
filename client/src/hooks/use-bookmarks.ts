import { useCallback, useState } from "react";
import { toastInfo } from "@/hooks/use-toast";

/** Toggleable set of bookmarked ids with a toast on each change. */
export function useBookmarks(itemNoun: string) {
  const [ids, setIds] = useState<Set<string>>(() => new Set());

  const toggle = useCallback(
    (id: string) => {
      const wasSaved = ids.has(id);
      setIds((prev) => {
        const next = new Set(prev);
        if (wasSaved) next.delete(id);
        else next.add(id);
        return next;
      });
      toastInfo(
        wasSaved ? "Removed" : "Saved",
        wasSaved ? `${itemNoun} removed from bookmarks` : `${itemNoun} added to bookmarks`,
      );
    },
    [ids, itemNoun],
  );

  const isBookmarked = useCallback((id: string) => ids.has(id), [ids]);

  return { isBookmarked, toggle, count: ids.size };
}
