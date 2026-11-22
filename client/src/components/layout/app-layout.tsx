import { requestGuardedAction } from "@/lib/guarded-location";
import { useState, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import {
  Activity,
  Briefcase,
  Code2,
  LayoutDashboard,
  Mic,
  Newspaper,
  Menu,
  LogOut,
  UserRound,
  AudioLines,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/auth-context";
import { toastError } from "@/hooks/use-toast";
import { hasLegacyData, importLegacyData } from "@/lib/local-data";
const groups = [
  {
    label: "YOUR WORKSPACE",
    items: [
      { path: "/dashboard", label: "Overview", Icon: LayoutDashboard },
      { path: "/practice", label: "Guided practice", Icon: Mic },
      { path: "/session", label: "Quick session", Icon: AudioLines },
      { path: "/analytics", label: "Your progress", Icon: Activity },
    ],
  },
  {
    label: "EXPLORE",
    items: [
      { path: "/news", label: "Tech news", Icon: Newspaper },
      { path: "/jobs", label: "Opportunities", Icon: Briefcase },
      { path: "/projects", label: "Projects & research", Icon: Code2 },
    ],
  },
];
export default function AppLayout({ children }: { children: ReactNode }) {
  const [location, navigate] = useLocation();
  const [open, setOpen] = useState(false);
  const { user, isLoggedIn, profileName, logout } = useAuth();
  const [dismissImport, setDismissImport] = useState(false);
  const current =
    groups.flatMap((g) => g.items).find((i) => i.path === location)?.label ??
    "Your profile";
  const navigation = (
    <>
      <Link
        href="/"
        className="flex items-center gap-2 px-3 text-2xl font-semibold tracking-tight"
        onClick={() => setOpen(false)}
      >
        aicoach<span className="text-primary">.</span>
      </Link>
      <nav aria-label="Main navigation" className="mt-12 space-y-8">
        {groups.map((group) => (
          <div key={group.label}>
            <p className="px-3 mb-3 text-xs tracking-widest font-medium text-muted-foreground">
              {group.label}
            </p>
            <div className="space-y-1">
              {group.items.map(({ path, label, Icon }) => (
                <Link
                  key={path}
                  href={path}
                  onClick={() => setOpen(false)}
                  aria-current={location === path ? "page" : undefined}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${location === path ? "bg-blue-50 text-primary font-semibold" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
                >
                  <Icon size={18} />
                  {label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>
      <div className="mt-auto pt-10">
        <div className="rounded-xl bg-muted/60 p-4 mb-5">
          <p className="text-sm font-medium">A little practice, every day.</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            One thoughtful answer is a good place to start.
          </p>
        </div>
        {isLoggedIn ? (
          <>
            <Link
              href="/profile"
              className="flex items-center gap-3 rounded-lg px-3 py-3 hover:bg-muted"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-primary font-medium">
                {profileName.slice(0, 1).toUpperCase()}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">
                  {profileName}
                </span>
                <span className="text-xs text-muted-foreground">
                  Your account
                </span>
              </span>
            </Link>
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground"
              onClick={() =>
                requestGuardedAction(async () => {
                  try {
                    await logout();
                    navigate("/login");
                  } catch (e) {
                    toastError(
                      "Couldn’t sign out",
                      e instanceof Error ? e.message : "Try again.",
                    );
                  }
                })
              }
            >
              <LogOut />
              Sign out
            </Button>
          </>
        ) : (
          <Button asChild className="w-full">
            <Link href="/login">Sign in</Link>
          </Button>
        )}
      </div>
    </>
  );
  return (
    <div className="min-h-screen lg:pl-64">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:bg-card focus:p-3"
      >
        Skip to content
      </a>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r bg-card px-5 py-8 lg:flex">
        {navigation}
      </aside>
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-card px-5 sm:px-8">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Open navigation"
            onClick={() => setOpen(true)}
          >
            <Menu />
          </Button>
          <span className="text-sm text-muted-foreground">
            Workspace <span className="mx-3 text-border">/</span>
            <span className="text-foreground font-medium">{current}</span>
          </span>
        </div>
        <Link
          href={isLoggedIn ? "/profile" : "/login"}
          aria-label="Your account"
          className="rounded-full border p-2 text-muted-foreground"
        >
          <UserRound size={18} />
        </Link>
      </header>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="fixed left-0 top-0 translate-x-0 translate-y-0 h-dvh w-72 rounded-none flex flex-col overflow-y-auto px-5 py-8">
          <DialogTitle className="sr-only">Navigation</DialogTitle>
          <DialogDescription className="sr-only">
            Your workspace and discovery pages
          </DialogDescription>
          {navigation}
        </DialogContent>
      </Dialog>
      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto max-w-[1440px] px-4 py-7 pb-28 sm:px-8 lg:py-9 lg:pb-28"
      >
        {user && !dismissImport && hasLegacyData() && (
          <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm">
            <p className="font-medium">
              Practice data from an earlier visit is on this browser.
            </p>
            <p className="mt-1 text-muted-foreground">
              Import it only if it belongs to you. Existing account data will be
              kept.
            </p>
            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                onClick={() => {
                  if (importLegacyData()) window.location.reload();
                  else
                    toastError(
                      "Import unavailable",
                      "Your browser could not save this data.",
                    );
                }}
              >
                Import my data
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setDismissImport(true)}
              >
                Not now
              </Button>
            </div>
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
