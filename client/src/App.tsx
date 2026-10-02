import { lazy, Suspense, type ComponentType } from "react";
import { Route, Switch, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/auth-context";
import AppLayout from "@/components/layout/app-layout";
import RequireAuth from "@/components/layout/require-auth";
import ErrorBoundary from "@/components/layout/error-boundary";
import { GlobalLoadingIndicator, PageLoader } from "@/components/layout/loading-indicators";
import AIChatbot from "@/components/chatbot/ai-chatbot";

const Home = lazy(() => import("@/pages/home"));
const Login = lazy(() => import("@/pages/login"));
const Dashboard = lazy(() => import("@/pages/dashboard"));
const Session = lazy(() => import("@/pages/session"));
const Practice = lazy(() => import("@/pages/practice"));
const Analytics = lazy(() => import("@/pages/analytics"));
const News = lazy(() => import("@/pages/news"));
const Jobs = lazy(() => import("@/pages/jobs"));
const Projects = lazy(() => import("@/pages/projects"));
const Profile = lazy(() => import("@/pages/profile"));
const NotFound = lazy(() => import("@/pages/not-found"));

interface AppRoute {
  path: string;
  page: ComponentType;
  /** Wrap in the app shell (header + dock). */
  withLayout?: boolean;
  /** Only reachable when logged in. */
  requiresAuth?: boolean;
}

const ROUTES: AppRoute[] = [
  { path: "/", page: Home },
  { path: "/login", page: Login },
  { path: "/dashboard", page: Dashboard, withLayout: true, requiresAuth: true },
  { path: "/session", page: Session, withLayout: true, requiresAuth: true },
  { path: "/practice", page: Practice, withLayout: true, requiresAuth: true },
  { path: "/analytics", page: Analytics, withLayout: true, requiresAuth: true },
  { path: "/profile", page: Profile, withLayout: true, requiresAuth: true },
  { path: "/news", page: News, withLayout: true },
  { path: "/jobs", page: Jobs, withLayout: true },
  { path: "/projects", page: Projects, withLayout: true },
];

function renderRoute({ page: Page, withLayout, requiresAuth }: AppRoute) {
  let content = <Page />;
  if (requiresAuth) content = <RequireAuth>{content}</RequireAuth>;
  if (withLayout) content = <AppLayout>{content}</AppLayout>;
  return content;
}

function Router() {
  const [location] = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
      >
        <Suspense fallback={<PageLoader />}>
          <Switch>
            {ROUTES.map((route) => (
              <Route key={route.path} path={route.path}>
                {renderRoute(route)}
              </Route>
            ))}
            <Route component={NotFound} />
          </Switch>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <GlobalLoadingIndicator />
          <ErrorBoundary>
            <Router />
          </ErrorBoundary>
          <AIChatbot />
        </TooltipProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
}
