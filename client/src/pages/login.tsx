import { useState, type FormEvent } from "react";
import { Link, useLocation } from "wouter";
import { Eye, EyeOff, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeMenu } from "@/components/common/theme-menu";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-context";
export default function Login() {
  const [, navigate] = useLocation();
  const auth = useAuth();
  const [creating, setCreating] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await (creating ? auth.register : auth.login)(username.trim(), password);
      const next = new URLSearchParams(window.location.search).get("next");
      navigate(
        next &&
          /^\/(dashboard|practice|session|analytics|profile)(\?|$)/.test(next)
          ? next
          : "/dashboard",
      );
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Unable to sign in. Try again.",
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <main className="min-h-screen grid lg:grid-cols-2 bg-card">
      <section className="hidden lg:flex flex-col justify-between bg-muted border-r p-14 xl:p-20">
        <Link href="/" className="text-xl font-semibold tracking-tight">
          aicoach<span className="text-primary">.</span>
        </Link>
        <div className="max-w-lg">
          <p className="text-sm font-medium text-primary mb-5">
            YOUR NEXT CHAPTER STARTS HERE
          </p>
          <h1 className="text-5xl font-semibold leading-tight">
            Good interviews start with practice.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            A quiet place to find your words, build confidence, and prepare for
            the opportunities ahead.
          </p>
          <ul className="mt-10 space-y-4">
            {[
              "Practice questions for your field",
              "Live feedback on speaking and camera presence",
              "Progress grounded in your own sessions",
            ].map((t) => (
              <li key={t} className="flex gap-3">
                <Check className="w-5 h-5 text-primary shrink-0" />
                {t}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-sm text-muted-foreground">
          Made for the work before the interview.
        </p>
      </section>
      <section className="flex flex-col justify-center px-6 py-12 sm:px-12">
        <div className="w-full max-w-sm mx-auto">
          <div className="flex items-center justify-between gap-3">
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-primary"
            >
              Back to AICoach
            </Link>
            <ThemeMenu />
          </div>
          <h2 className="mt-10 text-3xl font-semibold">
            {creating ? "Create your account" : "Welcome back"}
          </h2>
          <p className="mt-3 text-muted-foreground">
            {creating
              ? "Make room for your next opportunity."
              : "Pick up where your last practice left off."}
          </p>
          <form onSubmit={submit} className="mt-8 space-y-5">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">
                Username
              </label>
              <Input
                id="username"
                autoComplete="username"
                required
                maxLength={80}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose your username"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={visible ? "text" : "password"}
                  autoComplete={creating ? "new-password" : "current-password"}
                  required
                  minLength={creating ? 6 : 1}
                  maxLength={72}
                  className="pr-12"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-0 top-0 h-full w-11 flex items-center justify-center"
                  aria-label={visible ? "Hide password" : "Show password"}
                  onClick={() => setVisible(!visible)}
                >
                  {visible ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {creating && (
                <p className="text-xs text-muted-foreground">
                  Use at least 6 characters.
                </p>
              )}
            </div>
            {error && (
              <p
                role="alert"
                className="rounded-lg bg-red-50 dark:bg-red-950/50 p-3 text-sm text-red-700 dark:text-red-300"
              >
                {error}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? "Please wait…" : creating ? "Create account" : "Sign in"}
            </Button>
          </form>
          <p className="mt-6 text-sm text-muted-foreground">
            {creating ? "Already have an account?" : "New to AICoach?"}{" "}
            <button
              className="font-medium text-primary"
              disabled={busy}
              onClick={() => {
                setCreating(!creating);
                setError("");
              }}
            >
              {creating ? "Sign in" : "Create an account"}
            </button>
          </p>
          <details className="mt-10 border-t pt-5 text-sm text-muted-foreground">
            <summary className="cursor-pointer">Other sign-in options</summary>
            <p className="mt-3">
              Google, GitHub sign-in, and password recovery are not available
              yet. Use your username and password.
            </p>
          </details>
        </div>
      </section>
    </main>
  );
}
