import { useEffect, type ReactNode } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/auth-context";
import ContentState from "@/components/common/content-state";
export default function RequireAuth({ children }: { children: ReactNode }) {
  const { status, user, error, retry } = useAuth();
  const [location, navigate] = useLocation();
  useEffect(() => {
    if (status === "unauthenticated")
      navigate(`/login?next=${encodeURIComponent(location)}`);
  }, [status, location, navigate]);
  if (status === "error")
    return (
      <ContentState
        title="Unable to restore your session"
        description={error || "Check your connection and try again."}
        action={{ label: "Try again", onClick: retry }}
      />
    );
  if (status !== "authenticated")
    return (
      <p role="status" className="p-8 text-muted-foreground">
        Checking your session…
      </p>
    );
  return <div key={user?.id}>{children}</div>;
}
