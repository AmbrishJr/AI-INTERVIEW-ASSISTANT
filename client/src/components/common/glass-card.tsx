import type { ComponentProps } from "react";
import { Card } from "@/components/ui/card";
/** Compatibility wrapper for the shared solid-surface panel. */
export default function GlassCard(props: ComponentProps<typeof Card>) {
  return <Card {...props} />;
}
