import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProductPreview } from "./hero-section";
export default function DemoDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [tab, setTab] = useState("Practice");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>A look inside your workspace</DialogTitle>
          <DialogDescription>
            Illustrative previews. Your workspace starts with your own data.
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-2">
          {["Practice", "Overview", "Progress"].map((t) => (
            <Button
              key={t}
              size="sm"
              variant={t === tab ? "default" : "outline"}
              onClick={() => setTab(t)}
            >
              {t}
            </Button>
          ))}
        </div>
        {tab === "Practice" ? (
          <ProductPreview />
        ) : (
          <div className="border rounded-xl p-6 space-y-4">
            <h3 className="text-lg font-semibold">
              {tab === "Overview"
                ? "A clear next step"
                : "Progress you can understand"}
            </h3>
            <p className="text-muted-foreground">
              {tab === "Overview"
                ? "Start a practice session, set a daily goal, and revisit your recent sessions from one place."
                : "See speaking pace, camera presence, and time spent practicing. Missing measurements stay clearly marked."}
            </p>
            <div className="grid grid-cols-2 gap-3">
              {(tab === "Overview"
                ? ["Recent sessions", "Daily goals"]
                : ["Speaking pace", "Camera presence"]
              ).map((t) => (
                <div className="rounded-lg bg-muted p-4" key={t}>
                  <p className="text-sm font-medium">{t}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Your data appears here
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
