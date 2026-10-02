import { useIsFetching } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";

/** Small spinner in the corner while any react-query request is in flight. */
export function GlobalLoadingIndicator() {
  const isFetching = useIsFetching();

  return (
    <AnimatePresence>
      {isFetching > 0 && (
        <motion.div
          key="global-loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed top-3 right-3 z-[110]"
          aria-label="Loading"
          role="status"
        >
          <div className="h-9 w-9 rounded-full border bg-background/80 backdrop-blur flex items-center justify-center shadow-sm">
            <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/40 border-t-primary animate-spin" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Fallback shown while a lazily loaded page chunk downloads. */
export function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center" role="status" aria-label="Loading page">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );
}
