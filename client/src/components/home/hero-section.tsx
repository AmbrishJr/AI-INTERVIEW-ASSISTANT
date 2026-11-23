import { Link } from "wouter";
import { Check, Mic, Pause, Video, AudioLines } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
export function ProductPreview() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xl shadow-black/5 dark:shadow-black/20 text-left">
      <div className="flex justify-between border-b px-5 py-4 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">Practice room</span>
        <span>Illustrative preview</span>
      </div>
      <div className="p-5 sm:p-7">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>WEB DEVELOPMENT · TECHNICAL</span>
          <span>01 / 20</span>
        </div>
        <p className="mt-4 text-lg sm:text-xl leading-relaxed font-medium">
          How would you explain the difference between state and props in React?
        </p>
        <div className="mt-6 rounded-lg bg-muted p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Your answer</span>
            <AudioLines className="text-primary" size={22} />
          </div>
          <div
            className="my-7 flex h-12 items-center justify-center gap-1.5"
            aria-hidden="true"
          >
            {[
              12, 20, 32, 18, 40, 28, 44, 24, 36, 48, 26, 38, 20, 30, 42, 22,
              34, 16, 28, 12,
            ].map((height, i) => (
              <span
                key={i}
                className="w-1.5 rounded-full bg-primary/60"
                style={{ height }}
              />
            ))}
          </div>
          <div className="flex justify-center gap-3">
            {[Mic, Pause, Video].map((Icon, i) => (
              <span
                key={i}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-card border"
              >
                <Icon size={15} />
              </span>
            ))}
          </div>
        </div>
        <div className="mt-4 flex items-start gap-3 rounded-lg border border-emerald-100 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/50 p-4">
          <Check
            className="mt-0.5 text-emerald-700 dark:text-emerald-300 shrink-0"
            size={17}
          />
          <div>
            <p className="text-sm font-medium text-emerald-900 dark:text-emerald-300">
              Make space for your next thought
            </p>
            <p className="mt-1 text-xs text-emerald-800 dark:text-emerald-300">
              Pause briefly before moving to your example.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
export default function HeroSection({
  onWatchDemo,
}: {
  onWatchDemo: () => void;
  onScrollDown?: () => void;
}) {
  const { isLoggedIn } = useAuth();
  return (
    <section className="max-w-7xl mx-auto px-6 py-16 sm:py-24 lg:py-28 grid lg:grid-cols-2 items-center gap-14 lg:gap-20">
      <div>
        <p className="text-sm font-medium tracking-widest text-primary mb-6">
          PREPARE WITH PURPOSE
        </p>
        <h1 className="text-5xl sm:text-6xl xl:text-7xl leading-[1.08] font-semibold tracking-[-0.045em]">
          Find your words.
          <br />
          <span className="text-primary">Build your confidence.</span>
        </h1>
        <p className="mt-7 max-w-lg text-lg text-muted-foreground leading-relaxed">
          Your next interview deserves more than last-minute prep. Practice out
          loud, get useful feedback, and see how you’re improving.
        </p>
        <div className="mt-9 flex flex-wrap gap-3">
          <Button size="lg" asChild>
            <Link href={isLoggedIn ? "/practice" : "/login?next=/practice"}>
              Start practicing
            </Link>
          </Button>
          <Button size="lg" variant="outline" onClick={onWatchDemo}>
            Explore the workspace
          </Button>
        </div>
        <p className="mt-6 text-sm text-muted-foreground">
          Your pace. Your field. One answer at a time.
        </p>
      </div>
      <ProductPreview />
    </section>
  );
}
