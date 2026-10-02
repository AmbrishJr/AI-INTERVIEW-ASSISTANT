import type { ComponentProps } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/** Translucent card used across the app's dark, blurred surfaces. */
export default function GlassCard({ className, ...props }: ComponentProps<typeof Card>) {
  return <Card className={cn("bg-card/40 backdrop-blur-md border-white/5", className)} {...props} />;
}
