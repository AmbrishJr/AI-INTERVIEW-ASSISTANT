import { useState } from "react";
import { BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const PREVIEWS = ["dashboard", "analytics", "session"] as const;

export default function DemoDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [active, setActive] = useState<(typeof PREVIEWS)[number]>("dashboard");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Live Platform Preview</DialogTitle>
          <DialogDescription>Explore a static preview of the dashboard, analytics, and session timer experience.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            {PREVIEWS.map((preview) => (
              <Button
                key={preview}
                variant={active === preview ? "default" : "outline"}
                onClick={() => setActive(preview)}
                className="capitalize"
              >
                {preview}
              </Button>
            ))}
          </div>

          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground capitalize">{active} Preview</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
