import { useState, type ReactNode, type Ref } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/** Fades content up the first time it scrolls into view. */
export function Reveal({ delay = 0, className, children }: { delay?: number; className?: string; children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      viewport={{ once: true }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface SectionProps {
  title?: string;
  subtitle?: string;
  className?: string;
  ref?: Ref<HTMLElement>;
  children: ReactNode;
}

/** Landing page section with an optional centered heading. */
export function Section({ title, subtitle, className, ref, children }: SectionProps) {
  return (
    <section ref={ref} className={cn("py-16 bg-background", className)}>
      <div className="max-w-7xl mx-auto px-6">
        {title && (
          <Reveal className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{title}</h2>
            {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
          </Reveal>
        )}
        {children}
      </div>
    </section>
  );
}

/** Card whose body expands/collapses when the header is clicked. */
export function ExpandableCard({ header, children }: { header: ReactNode; children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <Card>
      <CardContent className="p-6">
        <button
          type="button"
          className="w-full flex items-center justify-between gap-4 text-left"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <div className="flex-1">{header}</div>
          <ChevronDown className={cn("h-5 w-5 shrink-0 transition-transform", open && "rotate-180")} />
        </button>
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="pt-4">{children}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
