import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface DockItem {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
}

interface DockProps {
  items: DockItem[];
  magnification?: number;
  panelHeight?: number;
  baseItemSize?: number;
}

export default function Dock({
  items,
  magnification = 0.3,
  panelHeight = 60,
  baseItemSize = 40,
}: DockProps) {
  return (
    <motion.nav
      aria-label="Main navigation"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 flex items-end gap-2 px-4 py-2 rounded-full bg-black/20 backdrop-blur-md border border-white/10"
      style={{ height: panelHeight }}
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", mass: 0.1, stiffness: 1000, damping: 15 }}
    >
      {items.map((item) => (
        <motion.button
          key={item.label}
          type="button"
          title={item.label}
          aria-label={item.label}
          aria-current={item.active ? "page" : undefined}
          className={cn(
            "p-2 rounded-full border transition-colors duration-200 flex items-center justify-center",
            item.active
              ? "bg-primary/20 border-primary/50 text-primary"
              : "bg-white/10 hover:bg-white/20 border-white/20",
          )}
          style={{ width: baseItemSize, height: baseItemSize }}
          whileHover={{ scale: 1 + magnification }}
          onClick={item.onClick}
        >
          {item.icon}
        </motion.button>
      ))}
    </motion.nav>
  );
}
