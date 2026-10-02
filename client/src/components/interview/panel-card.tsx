import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface PanelCardProps {
  icon?: ReactNode;
  title: ReactNode;
  actions?: ReactNode;
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
}

/** Card with a titled header strip, used by all interview-room panels. */
export default function PanelCard({ icon, title, actions, className, bodyClassName, children }: PanelCardProps) {
  return (
    <Card className={cn("bg-gray-900/50 border-white/5", className)}>
      <div className="p-4 border-b border-white/5 flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 font-medium">
          {icon}
          {title}
        </h3>
        {actions}
      </div>
      <div className={cn("p-4", bodyClassName)}>{children}</div>
    </Card>
  );
}
