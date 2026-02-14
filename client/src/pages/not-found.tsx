import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Gauge, Home, Search } from "lucide-react";

export default function NotFound() {
  const [, navigate] = useLocation();
  const [query, setQuery] = useState("");
  const [redirectEnabled, setRedirectEnabled] = useState(true);
  const [secondsLeft, setSecondsLeft] = useState(10);

  const routes = useMemo(
    () =>
      [
        { label: "Home", path: "/" },
        { label: "Dashboard", path: "/dashboard" },
        { label: "Session", path: "/session" },
        { label: "Analytics", path: "/analytics" },
        { label: "Login", path: "/login" },
      ],
    [],
  );

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return routes;
    return routes.filter(
      (r) => r.label.toLowerCase().includes(q) || r.path.toLowerCase().includes(q),
    );
  }, [query, routes]);

  useEffect(() => {
    if (!redirectEnabled) return;
    if (secondsLeft <= 0) {
      navigate("/");
      return;
    }
    const t = window.setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [navigate, redirectEnabled, secondsLeft]);

  const goHome = () => navigate("/");
  const goDashboard = () => navigate("/dashboard");

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    const target = matches[0];
    if (target) navigate(target.path);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-2xl">
        <CardContent className="pt-6 pb-6">
          <div className="grid gap-6 md:grid-cols-[240px_1fr] md:items-center">
            <div className="relative h-44 w-full overflow-hidden rounded-xl border bg-white">
              <motion.div
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              />
              <motion.div
                className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20"
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 2.1, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.35 }}
              >
                <div className="flex items-center gap-2 rounded-lg border bg-white px-3 py-2 shadow-sm">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-gray-900">Lost?</span>
                </div>
              </motion.div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <h1 className="text-3xl font-bold text-gray-900">Page Not Found</h1>
                <p className="text-sm text-gray-600">
                  The page you’re looking for doesn’t exist or may have been moved.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button onClick={goHome}>
                  <Home />
                  Go to Home
                </Button>
                <Button variant="secondary" onClick={goDashboard}>
                  <Gauge />
                  Go to Dashboard
                </Button>
                <Button variant="outline" onClick={() => window.history.back()}>
                  <ArrowLeft />
                  Go Back
                </Button>
              </div>

              <form onSubmit={handleSearchSubmit} className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search pages (e.g. dashboard, session, analytics)"
                    aria-label="Search pages"
                  />
                  <Button type="submit" variant="outline">
                    <Search />
                    Search
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {matches.slice(0, 5).map((r) => (
                    <Button
                      key={r.path}
                      type="button"
                      variant="ghost"
                      onClick={() => navigate(r.path)}
                    >
                      {r.label}
                      <span className="text-muted-foreground">{r.path}</span>
                    </Button>
                  ))}
                </div>
              </form>

              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                <Button
                  type="button"
                  variant={redirectEnabled ? "secondary" : "outline"}
                  onClick={() => {
                    setRedirectEnabled((v) => !v);
                    setSecondsLeft(10);
                  }}
                >
                  {redirectEnabled ? "Auto-redirect on" : "Auto-redirect off"}
                </Button>

                {redirectEnabled ? (
                  <span>
                    Redirecting to Home in <span className="font-medium">{secondsLeft}s</span>
                  </span>
                ) : null}

                {redirectEnabled ? (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setRedirectEnabled(false)}
                  >
                    Cancel
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
