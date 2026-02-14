import React, { useState } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useIsFetching } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthStateProvider } from "@/contexts/AuthStateContext";
import NotFound from "@/pages/not-found";
import Layout from "@/components/layout";
import Home from "@/pages/home";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Session from "@/pages/session";
import Practice from "@/pages/practice";
import EnhancedAnalytics from "@/pages/analytics-enhanced";
import Profile from "@/pages/profile";
import News from "@/pages/news";
import Jobs from "@/pages/jobs";
import Projects from "@/pages/projects";
import AIChatbot from "@/components/ai-chatbot";
import { AnimatePresence, motion } from "framer-motion";

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: unknown }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: unknown) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full flex items-center justify-center bg-background text-foreground px-4">
          <div className="w-full max-w-lg rounded-lg border bg-card p-6">
            <h1 className="text-xl font-semibold">Something went wrong</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Please try refreshing the page. If the problem persists, go back to Home.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium border px-4 py-2"
                onClick={() => window.location.reload()}
              >
                Refresh
              </button>
              <button
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium border px-4 py-2"
                onClick={() => (window.location.href = "/")}
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function GlobalLoadingIndicator() {
  const isFetching = useIsFetching();

  return (
    <AnimatePresence>
      {isFetching > 0 ? (
        <motion.div
          key="global-loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed top-3 right-3 z-[110]"
          aria-label="Loading"
          role="status"
        >
          <div className="h-9 w-9 rounded-full border bg-background/80 backdrop-blur flex items-center justify-center shadow-sm">
            <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/40 border-t-primary animate-spin" />
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function Router() {
  const [location] = useLocation();
  const [profileName, setProfileName] = useState("Alex Chan");

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
      >
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/login" component={Login} />
          <Route path="/dashboard" component={() => <Layout profileName={profileName}><Dashboard profileName={profileName} /></Layout>} />
          <Route path="/session" component={() => <Layout><Session /></Layout>} />
          <Route path="/practice" component={() => <Layout><Practice /></Layout>} />
          <Route path="/analytics" component={() => <Layout><EnhancedAnalytics /></Layout>} />
          <Route path="/news" component={() => <Layout><News /></Layout>} />
          <Route path="/jobs" component={() => <Layout><Jobs /></Layout>} />
          <Route path="/projects" component={() => <Layout><Projects /></Layout>} />
          <Route path="/profile" component={() => <Layout profileName={profileName} setProfileName={setProfileName}><Profile profileName={profileName} setProfileName={setProfileName} /></Layout>} />
          <Route component={NotFound} />
        </Switch>
      </motion.div>
    </AnimatePresence>
  );
}

function App() {
  return (
    <AuthStateProvider>
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
    </AuthStateProvider>
  );
}

export default App;
