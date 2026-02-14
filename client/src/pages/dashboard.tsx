import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { 
  ArrowLeft,
  Play,
  BarChart3,
  RefreshCw,
  Download,
  Bell,
  TrendingUp,
  Target,
  Activity,
  Users,
  Zap,
  Award,
  MessageSquare,
  CheckCircle,
  AlertTriangle,
  Info,
  ChevronRight,
  Star,
} from "lucide-react";
import { useLocation } from "wouter";
import { useMemo, useRef, useState, useEffect } from "react";
import { useAuthState } from "@/contexts/AuthStateContext";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toastError, toastInfo, toastSuccess } from "@/hooks/use-toast";

const mockWeeklyData = [
  { name: 'Mon', score: 65 },
  { name: 'Tue', score: 72 },
  { name: 'Wed', score: 68 },
  { name: 'Thu', score: 85 },
  { name: 'Fri', score: 82 },
  { name: 'Sat', score: 90 },
  { name: 'Sun', score: 88 },
];

const mockMonthlyData = [
  { name: 'W1', score: 70 },
  { name: 'W2', score: 76 },
  { name: 'W3', score: 81 },
  { name: 'W4', score: 85 },
];

type SessionItem = {
  id: string;
  duration: number;
  date: string;
  notes?: string;
  focusScore: number;
  status: "completed" | "paused" | "active";
};

type Goal = {
  id: string;
  title: string;
  targetPerDayMinutes: number;
  progressMinutesToday: number;
  completed: boolean;
};

type Reminder = {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
};

const notifications = [
  { id: 1, type: 'success', title: 'Great job!', message: 'Your score improved by 8% from last week', time: '2h ago', read: false },
  { id: 2, type: 'warning', title: 'Practice reminder', message: 'You have a practice session scheduled in 1 hour', time: '5h ago', read: false },
  { id: 3, type: 'info', title: 'New feature', message: 'Try our new mock interview feature', time: '1d ago', read: true },
  { id: 4, type: 'achievement', title: 'Achievement unlocked', message: '5-day streak! Keep it up!', time: '2d ago', read: true },
];

const formatDuration = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m < 60) return `${m}m ${s.toString().padStart(2, "0")}s`;
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${h}h ${mm}m`;
};

const parseISO = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
};

const safeLoadSessionHistory = (): Array<{ id: string; duration: number; date: string; notes?: string }> => {
  try {
    const raw = localStorage.getItem("sessionHistory");
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((s: any) => ({
        id: String(s?.id ?? ""),
        duration: Number(s?.duration ?? 0),
        date: String(s?.date ?? ""),
        notes: String(s?.notes ?? ""),
      }))
      .filter((s) => Boolean(s.id) && Boolean(s.date));
  } catch {
    return [];
  }
};

const scoreFor = (id: string) => {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return 55 + (h % 46);
};

interface DashboardProps {
  profileName: string;
}

export default function Dashboard({ profileName }: DashboardProps) {
  const [, setLocation] = useLocation();
  const { isLoggedIn, login, logout } = useAuthState();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoggedIn) {
      setLocation('/login');
    }
  }, [isLoggedIn, setLocation]);
  
  // Don't render if not logged in
  if (!isLoggedIn) {
    return null;
  }
  
  // Dark mode is the only theme now
  const [isLoading, setIsLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(2);
  const [now, setNow] = useState<Date>(() => new Date());
  const [period, setPeriod] = useState<"weekly" | "monthly">("weekly");

  const [activeSessionState, setActiveSessionState] = useState<"none" | "active" | "paused">("none");
  const [activeSessionSeconds, setActiveSessionSeconds] = useState(0);
  const activeSessionTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [selectedSession, setSelectedSession] = useState<SessionItem | null>(null);
  const [sessionSort, setSessionSort] = useState<"date" | "score">("date");
  const [statusFilter, setStatusFilter] = useState<"all" | SessionItem["status"]>("all");

  const [goals, setGoals] = useState<Goal[]>([]);
  const [goalDraftTitle, setGoalDraftTitle] = useState("Study 2 hrs/day");
  const [goalDraftMinutes, setGoalDraftMinutes] = useState(120);

  const [insightSeed, setInsightSeed] = useState(0);
  const [reminders, setReminders] = useState<Reminder[]>([
    {
      id: "rem-1",
      title: "Upcoming session reminder",
      message: "Schedule a 20-minute practice session this evening.",
      time: "Today",
      read: false,
    },
    {
      id: "rem-2",
      title: "Goal deadline alert",
      message: "You’re 30 minutes away from today’s goal.",
      time: "This week",
      read: false,
    },
  ]);

  const [systemTheme, setSystemTheme] = useState<"dark" | "light">("dark");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const [rating, setRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState("");
  
  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (activeSessionState !== "active") {
      if (activeSessionTimerRef.current) {
        clearInterval(activeSessionTimerRef.current);
        activeSessionTimerRef.current = null;
      }
      return;
    }

    activeSessionTimerRef.current = setInterval(() => {
      setActiveSessionSeconds((s) => s + 1);
    }, 1000);

    return () => {
      if (activeSessionTimerRef.current) {
        clearInterval(activeSessionTimerRef.current);
        activeSessionTimerRef.current = null;
      }
    };
  }, [activeSessionState]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("dashboardGoals");
      if (!raw) return;
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) return;
      setGoals(
        parsed
          .map((g: any) => ({
            id: String(g?.id ?? ""),
            title: String(g?.title ?? ""),
            targetPerDayMinutes: Number(g?.targetPerDayMinutes ?? 0),
            progressMinutesToday: Number(g?.progressMinutesToday ?? 0),
            completed: Boolean(g?.completed ?? false),
          }))
          .filter((g) => Boolean(g.id) && Boolean(g.title)),
      );
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("dashboardGoals", JSON.stringify(goals));
  }, [goals]);

  const handleBack = () => setLocation("/");
  const handleLogout = () => {
    logout();
    setLocation("/login");
  };

  const handleExportCsv = (items: SessionItem[]) => {
    const header = "date,duration_seconds,focus_score,status\n";
    const body = items
      .map((s) => {
        const d = parseISO(s.date);
        const dateStr = d ? d.toISOString() : s.date;
        return `${dateStr},${s.duration},${s.focusScore},${s.status}`;
      })
      .join("\n");
    const blob = new Blob([header + body + "\n"], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dashboard_export_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toastSuccess("Export started", "Downloaded CSV report.");
  };

  const markAllAsRead = () => {
    setUnreadCount(0);
  };

  const sessions = useMemo<SessionItem[]>(() => {
    const base = safeLoadSessionHistory();
    if (base.length === 0) {
      const now = new Date();
      return [
        {
          id: "mock-1",
          duration: 15 * 60,
          date: new Date(now.getTime() - 2 * 3600 * 1000).toISOString(),
          focusScore: 92,
          status: "completed",
        },
        {
          id: "mock-2",
          duration: 25 * 60,
          date: new Date(now.getTime() - 24 * 3600 * 1000).toISOString(),
          focusScore: 78,
          status: "completed",
        },
        {
          id: "mock-3",
          duration: 40 * 60,
          date: new Date(now.getTime() - 3 * 24 * 3600 * 1000).toISOString(),
          focusScore: 65,
          status: "completed",
        },
      ];
    }
    return base
      .map((s) => ({
        id: s.id,
        duration: Math.max(0, Math.floor(s.duration)),
        date: s.date,
        notes: s.notes,
        focusScore: scoreFor(s.id),
        status: "completed" as const,
      }))
      .sort((a, b) => (parseISO(b.date)?.getTime() ?? 0) - (parseISO(a.date)?.getTime() ?? 0));
  }, [isLoading]);

  const filteredSessions = useMemo(() => {
    const list = statusFilter === "all" ? sessions : sessions.filter((s) => s.status === statusFilter);
    const sorted = [...list].sort((a, b) => {
      if (sessionSort === "score") return b.focusScore - a.focusScore;
      return (parseISO(b.date)?.getTime() ?? 0) - (parseISO(a.date)?.getTime() ?? 0);
    });
    return sorted;
  }, [sessions, sessionSort, statusFilter]);

  const totals = useMemo(() => {
    const totalSessions = sessions.length;
    const completedSessions = sessions.filter((s) => s.status === "completed").length;
    const avgFocus = totalSessions
      ? Math.round(sessions.reduce((acc, s) => acc + s.focusScore, 0) / totalSessions)
      : 0;

    const dayKey = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    };

    const dayKeys = new Set(
      sessions
        .filter((s) => s.status === "completed")
        .map((s) => parseISO(s.date))
        .filter((d): d is Date => Boolean(d))
        .map((d) => dayKey(d)),
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastSessionDay = sessions
      .map((s) => parseISO(s.date))
      .filter((d): d is Date => Boolean(d))
      .sort((a, b) => b.getTime() - a.getTime())[0];

    const start = new Date((dayKeys.has(dayKey(today)) ? today : lastSessionDay ?? today).getTime());
    start.setHours(0, 0, 0, 0);

    let streakDays = 0;
    for (let i = 0; i < 366; i++) {
      const d = new Date(start.getTime());
      d.setDate(start.getDate() - i);
      if (!dayKeys.has(dayKey(d))) break;
      streakDays += 1;
    }

    return { totalSessions, completedSessions, avgFocus, streakDays };
  }, [sessions]);

  const chartData = period === "weekly" ? mockWeeklyData : mockMonthlyData;

  const insights = useMemo(() => {
    const best = sessions[0];
    const bestTime = "4–6 PM";
    const suggestion = best ? `Your recent focus score is ${best.focusScore}. Try 15–20m sessions.` : "Complete a session to unlock insights.";
    return {
      headline: "AI Insights",
      items: [
        `Best time slot: ${bestTime}`,
        suggestion,
        insightSeed % 2 === 0 ? "Tip: pause briefly before answering to improve clarity." : "Tip: summarize your answer in one sentence at the end.",
      ],
    };
  }, [sessions, insightSeed]);

  const refreshAll = () => {
    setIsLoading(true);
    toastInfo("Refreshing", "Reloading dashboard data...");
    window.setTimeout(() => {
      setIsLoading(false);
      toastSuccess("Updated", "Dashboard data refreshed.");
    }, 800);
  };

  const addGoal = () => {
    if (!goalDraftTitle.trim() || goalDraftMinutes <= 0) {
      toastError("Invalid goal", "Please provide a title and target minutes.");
      return;
    }
    const g: Goal = {
      id: `goal-${Date.now()}`,
      title: goalDraftTitle.trim(),
      targetPerDayMinutes: Math.round(goalDraftMinutes),
      progressMinutesToday: 0,
      completed: false,
    };
    setGoals((prev) => [g, ...prev]);
    toastSuccess("Goal created", "Your goal was added.");
  };

  const updateGoal = (id: string, patch: Partial<Goal>) => {
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, ...patch } : g)));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Sticky Header */}
        <div className="sticky top-0 z-30 border-b border-border/40 bg-card/30 backdrop-blur-xl">
          <div className="px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={handleBack} aria-label="Back">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
                <div className="text-sm text-muted-foreground flex flex-wrap items-center gap-2">
                  <span>
                    {now.toLocaleDateString(undefined, {
                      weekday: "long",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <span className="opacity-50">•</span>
                  <span className="font-mono">{now.toLocaleTimeString()}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 justify-between md:justify-end">
              <DropdownMenu open={showNotifications} onOpenChange={setShowNotifications}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel className="flex items-center justify-between">
                    <span>Notifications</span>
                    <button onClick={markAllAsRead} className="text-xs text-primary hover:underline">
                      Mark all read
                    </button>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {notifications.map((n) => (
                    <DropdownMenuItem
                      key={n.id}
                      className="flex items-start gap-2"
                      onClick={() => {
                        if (!n.read) setUnreadCount((c) => Math.max(0, c - 1));
                        toastInfo(n.title, n.message);
                      }}
                    >
                      <div className="mt-0.5">
                        {n.type === "success" && <CheckCircle className="h-4 w-4 text-green-500" />}
                        {n.type === "warning" && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                        {n.type === "info" && <Info className="h-4 w-4 text-blue-500" />}
                        {n.type === "achievement" && <Award className="h-4 w-4 text-purple-500" />}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium flex items-center justify-between">
                          <span>{n.title}</span>
                          <span className="text-xs text-muted-foreground">{n.time}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">{n.message}</div>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Users className="h-4 w-4" />
                    {isLoggedIn ? "Alex" : "Guest"}
                    <ChevronRight className="h-4 w-4 opacity-60" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setLocation("/profile")}>View Profile</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toastInfo("Settings", "Settings panel coming soon.")}>Settings</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-500">Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-8">
          {/* Welcome */}
          <Card className="bg-card/40 backdrop-blur-md border-white/5">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Welcome back, {isLoggedIn ? profileName : "Guest"}</CardTitle>
                <div className="text-sm text-muted-foreground mt-1">
                  Keep the streak alive—small sessions daily beat long sessions rarely.
                </div>
              </div>
              <Button variant="outline" size="sm" className="gap-2" onClick={refreshAll}>
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </CardHeader>
          </Card>

          {/* Overview cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: "Total Sessions", value: totals.totalSessions, icon: Activity },
              { title: "Completed Sessions", value: totals.completedSessions, icon: CheckCircle },
              { title: "Average Focus Score", value: totals.avgFocus, icon: TrendingUp },
              { title: "Active Streak (days)", value: totals.streakDays, icon: Zap },
            ].map((s) => (
              <Card key={s.title} className="bg-card/40 backdrop-blur-md border-white/5">
                <CardContent className="p-5">
                  {isLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-8 w-20" />
                    </div>
                  ) : (
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-sm text-muted-foreground">{s.title}</div>
                        <div className="mt-1 text-3xl font-bold">{s.value}</div>
                      </div>
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <s.icon className="h-5 w-5" />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick actions */}
          <Card className="bg-card/40 backdrop-blur-md border-white/5">
            <CardHeader>
              <CardTitle>Quick actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button className="gap-2" onClick={() => setLocation("/session")}> <Play className="h-4 w-4" /> Start New Session</Button>
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => {
                  setActiveSessionState("active");
                  toastSuccess("Resumed", "Resuming last session (mock)." );
                }}
              >
                <Play className="h-4 w-4" /> Resume Last Session
              </Button>
              <Button variant="outline" className="gap-2" onClick={() => setLocation("/analytics")}>
                <BarChart3 className="h-4 w-4" /> View Analytics
              </Button>
              <Button variant="outline" className="gap-2" onClick={addGoal}>
                <Target className="h-4 w-4" /> Create Goal
              </Button>
              <Button variant="outline" className="gap-2" onClick={() => handleExportCsv(sessions)}>
                <Download className="h-4 w-4" /> Export Data (CSV)
              </Button>
            </CardContent>
          </Card>

          {/* Live session + charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 bg-card/40 backdrop-blur-md border-white/5">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Performance analytics preview</CardTitle>
                <div className="flex gap-2">
                  <Button size="sm" variant={period === "weekly" ? "default" : "outline"} onClick={() => setPeriod("weekly")}>Weekly</Button>
                  <Button size="sm" variant={period === "monthly" ? "default" : "outline"} onClick={() => setPeriod("monthly")}>Monthly</Button>
                </div>
              </CardHeader>
              <CardContent className="h-[320px]">
                {isLoading ? (
                  <Skeleton className="h-full w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip />
                      <Area type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorScore)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card className="bg-card/40 backdrop-blur-md border-white/5">
              <CardHeader>
                <CardTitle>Active session status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">State</div>
                  <div className="text-sm font-medium">
                    {activeSessionState === "none" ? "None" : activeSessionState === "active" ? "Active" : "Paused"}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">Timer</div>
                  <div className="font-mono">{formatDuration(activeSessionSeconds)}</div>
                </div>
                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${Math.min(100, (activeSessionSeconds / (30 * 60)) * 100)}%` }} />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (activeSessionState === "none") {
                        setActiveSessionState("active");
                        setActiveSessionSeconds(0);
                        toastSuccess("Session started", "Live status is now active.");
                        return;
                      }
                      if (activeSessionState === "active") {
                        setActiveSessionState("paused");
                        toastInfo("Paused", "Session paused.");
                      }
                    }}
                    disabled={activeSessionState === "paused"}
                  >
                    Pause
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (activeSessionState === "paused") {
                        setActiveSessionState("active");
                        toastInfo("Resumed", "Session resumed.");
                      }
                    }}
                    disabled={activeSessionState !== "paused"}
                  >
                    Resume
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      if (activeSessionState === "none") return;
                      setActiveSessionState("none");
                      setActiveSessionSeconds(0);
                      toastSuccess("Ended", "Session ended (mock)." );
                    }}
                    disabled={activeSessionState === "none"}
                  >
                    End
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sessions table */}
          <Card className="bg-card/40 backdrop-blur-md border-white/5">
            <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <CardTitle>Recent sessions</CardTitle>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant={sessionSort === "date" ? "default" : "outline"} onClick={() => setSessionSort("date")}>Sort: Date</Button>
                <Button size="sm" variant={sessionSort === "score" ? "default" : "outline"} onClick={() => setSessionSort("score")}>Sort: Score</Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="outline">Filter: {statusFilter}</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setStatusFilter("all")}>all</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("completed")}>completed</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("active")}>active</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("paused")}>paused</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-40 w-full" />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Focus Score</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSessions.slice(0, 10).map((s) => {
                      const d = parseISO(s.date);
                      return (
                        <TableRow key={s.id} className="cursor-pointer" onClick={() => setSelectedSession(s)}>
                          <TableCell>{d ? d.toLocaleString() : s.date}</TableCell>
                          <TableCell>{formatDuration(s.duration)}</TableCell>
                          <TableCell>{s.focusScore}</TableCell>
                          <TableCell className="capitalize">{s.status}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Goals + Insights + Reminders + Timeline + System + Feedback */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 bg-card/40 backdrop-blur-md border-white/5">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Goals & progress</CardTitle>
                <Button size="sm" variant="outline" onClick={addGoal}>Add Goal</Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                    <div className="text-sm font-medium">New goal</div>
                    <div className="mt-2 grid grid-cols-1 gap-2">
                      <input
                        value={goalDraftTitle}
                        onChange={(e) => setGoalDraftTitle(e.target.value)}
                        className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                        aria-label="Goal title"
                      />
                      <input
                        type="number"
                        value={goalDraftMinutes}
                        onChange={(e) => setGoalDraftMinutes(Number(e.target.value))}
                        className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                        aria-label="Goal minutes per day"
                      />
                      <div className="text-xs text-muted-foreground">Target minutes per day</div>
                    </div>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                    <div className="text-sm font-medium">Tip</div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      Keep a small daily goal and build a streak. Consistency beats intensity.
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {goals.length === 0 ? (
                    <div className="text-sm text-muted-foreground">No goals yet. Create one above.</div>
                  ) : (
                    goals.slice(0, 5).map((g) => {
                      const pct = g.targetPerDayMinutes
                        ? Math.min(100, Math.round((g.progressMinutesToday / g.targetPerDayMinutes) * 100))
                        : 0;
                      return (
                        <div key={g.id} className="rounded-lg border border-white/10 bg-white/5 p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="font-medium">{g.title}</div>
                              <div className="text-xs text-muted-foreground">
                                {g.progressMinutesToday} / {g.targetPerDayMinutes} minutes today
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  updateGoal(g.id, {
                                    progressMinutesToday: Math.min(
                                      g.targetPerDayMinutes,
                                      g.progressMinutesToday + 10,
                                    ),
                                  })
                                }
                              >
                                +10m
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateGoal(g.id, { completed: !g.completed })}
                              >
                                {g.completed ? "Undo" : "Mark completed"}
                              </Button>
                            </div>
                          </div>
                          <div className="mt-3 h-2 w-full rounded-full bg-white/10 overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                          </div>
                          <div className="mt-2 text-xs text-muted-foreground">{pct}%</div>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/40 backdrop-blur-md border-white/5">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>AI insights</CardTitle>
                <Button size="sm" variant="outline" onClick={() => setInsightSeed((s) => s + 1)}>Refresh</Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {insights.items.map((text, idx) => (
                  <div key={idx} className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-muted-foreground">
                    {text}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="bg-card/40 backdrop-blur-md border-white/5">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Notifications & reminders</CardTitle>
                <Button size="sm" variant="outline" onClick={() => setReminders((r) => r.map((x) => ({ ...x, read: true })))}>Mark all read</Button>
              </CardHeader>
              <CardContent className="space-y-2">
                {reminders.map((r) => (
                  <div key={r.id} className={`rounded-lg border border-white/10 p-3 ${r.read ? "bg-white/5" : "bg-primary/10"}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-sm font-medium">{r.title}</div>
                        <div className="text-xs text-muted-foreground">{r.message}</div>
                        <div className="mt-1 text-xs text-muted-foreground">{r.time}</div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => setReminders((prev) => prev.map((x) => x.id === r.id ? { ...x, read: true } : x))}>Read</Button>
                        <Button size="sm" variant="outline" onClick={() => setReminders((prev) => prev.filter((x) => x.id !== r.id))}>Dismiss</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="lg:col-span-2 bg-card/40 backdrop-blur-md border-white/5">
              <CardHeader>
                <CardTitle>Activity timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { title: "Session started", time: "Today", icon: Play },
                  { title: "Session completed", time: "Yesterday", icon: CheckCircle },
                  { title: "Goal achieved", time: "This week", icon: Award },
                  { title: "Analytics viewed", time: "This week", icon: BarChart3 },
                ].map((e, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="w-8 flex flex-col items-center">
                      <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <e.icon className="h-4 w-4 text-primary" />
                      </div>
                      {idx < 3 && <div className="flex-1 w-px bg-white/10" />}
                    </div>
                    <div className="flex-1 rounded-lg border border-white/10 bg-white/5 p-3">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{e.title}</div>
                        <div className="text-xs text-muted-foreground">{e.time}</div>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">Auto-generated timeline event (mock).</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="bg-card/40 backdrop-blur-md border-white/5">
              <CardHeader>
                <CardTitle>System status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">App status</div>
                  <div className="text-sm text-green-400">Online</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">Last sync</div>
                  <div className="text-sm font-mono">{now.toLocaleTimeString()}</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/40 backdrop-blur-md border-white/5">
              <CardHeader>
                <CardTitle>Quick settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm">Notifications</div>
                  <Button size="sm" variant="outline" onClick={() => {
                    toastSuccess("Updated", "Toggled notifications (mock)." );
                  }}>
                    Toggle
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/40 backdrop-blur-md border-white/5">
              <CardHeader>
                <CardTitle>Feedback & support</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      className="p-1"
                      onClick={() => setRating(s)}
                      aria-label={`Rate ${s} stars`}
                    >
                      <Star className={`h-5 w-5 ${rating >= s ? "text-yellow-400 fill-current" : "text-muted-foreground"}`} />
                    </button>
                  ))}
                </div>
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  className="w-full min-h-24 rounded-md border border-input bg-transparent p-3 text-sm"
                  placeholder="Tell us what to improve..."
                />
                <Button
                  onClick={() => {
                    toastSuccess("Feedback sent", "Thanks! We recorded your feedback (mock)." );
                    setFeedbackText("");
                    setRating(0);
                  }}
                >
                  Submit feedback
                </Button>
              </CardContent>
            </Card>
          </div>

          <footer className="border-t border-border/40 pt-6 pb-2 text-sm text-muted-foreground flex flex-col md:flex-row gap-2 md:items-center md:justify-between">
            <div>Version 1.0.0</div>
            <div className="flex gap-4">
              <button className="hover:underline" onClick={() => toastInfo("Docs", "Docs link coming soon.")}>Help / Docs</button>
              <button className="hover:underline" onClick={() => toastInfo("Support", "Support contact coming soon.")}>Contact Support</button>
            </div>
          </footer>
        </div>

        <Dialog open={Boolean(selectedSession)} onOpenChange={(o) => !o && setSelectedSession(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Session details</DialogTitle>
              <DialogDescription>Preview of a session entry (mock/localStorage).</DialogDescription>
            </DialogHeader>
            {selectedSession ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">Date</div>
                  <div className="text-sm">{parseISO(selectedSession.date)?.toLocaleString() ?? selectedSession.date}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">Duration</div>
                  <div className="text-sm font-mono">{formatDuration(selectedSession.duration)}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">Focus Score</div>
                  <div className="text-sm">{selectedSession.focusScore}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">Status</div>
                  <div className="text-sm capitalize">{selectedSession.status}</div>
                </div>
                {selectedSession.notes ? (
                  <div className="rounded-md border border-white/10 bg-white/5 p-3 text-sm text-muted-foreground">
                    {selectedSession.notes}
                  </div>
                ) : null}
              </div>
            ) : null}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}