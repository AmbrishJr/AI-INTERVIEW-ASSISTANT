import { useAuth } from "@/contexts/auth-context";
export function LiveClock({ timeOnly = false }: { timeOnly?: boolean }) {
  const now = new Date();
  return (
    <span className="text-sm text-muted-foreground">
      {timeOnly
        ? now.toLocaleTimeString()
        : now.toLocaleDateString(undefined, {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
    </span>
  );
}
export default function DashboardHeader() {
  const { profileName } = useAuth();
  return (
    <header className="flex flex-wrap justify-between items-end gap-4">
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground mb-2">
          YOUR PRACTICE, AT A GLANCE
        </p>
        <h1 className="text-3xl sm:text-4xl font-semibold break-words">
          Welcome back, {profileName}.
        </h1>
        <p className="mt-3 text-muted-foreground">
          Make a little progress toward your next interview.
        </p>
      </div>
      <LiveClock />
    </header>
  );
}
