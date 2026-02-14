import { Link } from "wouter";
import {
  ArrowRight,
  Brain,
  Camera,
  LineChart,
  Zap,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  MapPin,
  Github,
  Linkedin,
  Play,
  Users,
  CheckCircle,
  MessageSquare,
  HelpCircle,
  X,
  Sparkles,
  Shield,
  Timer,
  Languages,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useAuthState } from "@/contexts/AuthStateContext";
import { toastInfo } from "@/hooks/use-toast";
import heroBg from "@assets/generated_images/futuristic_neural_network_data_flow_background.png";

export default function Landing() {
  const [expandedFeature, setExpandedFeature] = useState<number | null>(null);
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const { isLoggedIn } = useAuthState();
  const [typedHeadline, setTypedHeadline] = useState("");
  const [activePreview, setActivePreview] = useState<"dashboard" | "analytics" | "session">("dashboard");
  const [lang, setLang] = useState<"en" | "jp">("en");

  const copy = {
    en: {
      heroTag: "AI-powered session tracking",
      heroSubtitle:
        "Real-time AI feedback, a live session workspace, and analytics that turn practice into measurable improvement.",
      startFree: "Start Free Session",
      tryGuest: "Try as Guest",
      watchDemo: "Watch 60-sec Demo",
      goDashboard: "Go to Dashboard",
      howTitle: "How it works",
      howSubtitle: "Sign in, practice with AI, then track improvement with real analytics.",
      aiTitle: "Smarter Productivity with AI",
      aiSubtitle: "Real-time intelligence that highlights what matters and suggests what to do next.",
      liveTitle: "Live Preview",
      liveSubtitle:
        "Explore a static preview of the dashboard, analytics, and session timer experience.",
      trustTitle: "Achievements & Trust",
      trustSubtitle:
        "Built to feel recruiter-ready: secure, fast, and designed for real interview practice.",
      finalTitle: "Ready to boost your productivity?",
      finalSubtitle:
        "Start a practice session in seconds and let AI Coach guide your improvement.",
      startNow: "Start Now",
      login: "Login",
    },
    jp: {
      heroTag: "AIセッション追跡",
      heroSubtitle:
        "リアルタイムAIフィードバック、練習スペース、分析で成長を可視化します。",
      startFree: "無料で開始",
      tryGuest: "ゲストで試す",
      watchDemo: "60秒デモ",
      goDashboard: "ダッシュボードへ",
      howTitle: "使い方",
      howSubtitle: "ログイン→練習→AIフィードバック→分析で改善。",
      aiTitle: "AIで生産性を最適化",
      aiSubtitle: "重要ポイントを抽出し、次のアクションを提案します。",
      liveTitle: "プレビュー",
      liveSubtitle: "ダッシュボード/分析/タイマーを安全にプレビューできます。",
      trustTitle: "実績と信頼",
      trustSubtitle: "安心・高速・AIで、本番を見据えた練習体験。",
      finalTitle: "生産性をもっと上げませんか？",
      finalSubtitle: "数秒で練習を開始。AI Coachが改善をガイドします。",
      startNow: "今すぐ開始",
      login: "ログイン",
    },
  } as const;

  const t = copy[lang];

  const fullHeadline = "Master your productivity with AI precision.";

  useEffect(() => {
    setTypedHeadline("");
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setTypedHeadline(fullHeadline.slice(0, i));
      if (i >= fullHeadline.length) window.clearInterval(id);
    }, 22);
    return () => window.clearInterval(id);
  }, []);

  const featureDetails = {
    "Cognitive Analysis": {
      details: "Our advanced neural networks process your speech patterns in real-time, analyzing sentence structure, vocabulary complexity, and logical flow. The system identifies filler words, tracks response coherence, and provides instant feedback on clarity and confidence levels.",
      capabilities: ["Real-time speech processing", "Vocabulary assessment", "Logical flow analysis", "Confidence scoring"]
    },
    "Visual Cues": {
      details: "Computer vision algorithms monitor 47 facial points to track eye contact, posture, and micro-expressions. The system detects nervous habits, engagement levels, and professional presence indicators that hiring managers notice.",
      capabilities: ["47-point facial tracking", "Eye contact analysis", "Posture monitoring", "Micro-expression detection"]
    },
    "Performance Metrics": {
      details: "Comprehensive analytics dashboard tracking 12+ key performance indicators over time. Visualize your progress with detailed charts, compare sessions, and receive personalized improvement recommendations based on your unique patterns.",
      capabilities: ["12+ KPI tracking", "Progress visualization", "Session comparison", "AI-powered recommendations"]
    }
  };

  const faqs = [
    {
      question: "How accurate is the AI analysis?",
      answer: "Our AI analysis achieves 95%+ accuracy in speech pattern recognition and 92% accuracy in visual cue detection. The system is trained on thousands of real interview scenarios."
    },
    {
      question: "Is my data secure and private?",
      answer: "Absolutely. All your data is encrypted end-to-end and stored securely. We never share your personal information with third parties, and you can delete your data at any time."
    },
    {
      question: "Can I use AI Coach for different job types?",
      answer: "Yes! AI Coach adapts to various interview types including technical, behavioral, case studies, and system design interviews across all industries."
    },
    {
      question: "What equipment do I need?",
      answer: "Just a computer with webcam and microphone. Our platform works on all modern browsers with no additional software installation required."
    },
    {
      question: "How quickly will I see improvements?",
      answer: "Most users see noticeable improvements within 3-5 practice sessions. Our AI provides personalized recommendations that accelerate your learning curve."
    }
  ];

  const handleNewsletterSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    setIsSubscribing(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubscribing(false);
      setEmail("");
      alert("Thank you for subscribing! You'll receive our latest updates.");
    }, 1000);
  };

  const handleViewDemo = () => {
    setShowDemoModal(true);
  };

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Hero Section */}
      <div className="relative h-[92vh] flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-background/80 z-10 backdrop-blur-[2px]" />
          <motion.div
            className="absolute inset-0 z-10"
            initial={{ opacity: 0.55 }}
            animate={{ opacity: 0.75 }}
            transition={{ duration: 2.2, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
            style={{
              background:
                "radial-gradient(1200px 600px at 50% 20%, rgba(0,240,255,0.18), transparent 55%), radial-gradient(900px 520px at 20% 70%, rgba(168,85,247,0.18), transparent 55%)",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent z-10" />
          <img 
            src={heroBg} 
            alt="AI Neural Network" 
            className="w-full h-full object-cover opacity-60"
          />
        </div>

        <div className="absolute top-6 right-6 z-30 flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="border-white/10 bg-white/5 hover:bg-white/10 rounded-full text-white"
            onClick={() => setLang((v) => (v === "en" ? "jp" : "en"))}
            aria-label="Toggle language"
          >
            <Languages className="w-4 h-4" />
            {lang.toUpperCase()}
          </Button>
        </div>

        <div className="relative z-20 container mx-auto px-6 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-mono mb-6 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              {t.heroTag}
            </div>

            <h1 className="text-5xl md:text-6xl font-heading font-bold text-white mb-6 leading-tight">
              <span className="block">{typedHeadline}</span>
              <span className="inline-block align-middle ml-1 h-8 w-[2px] bg-primary/80 animate-pulse" aria-hidden="true" />
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 font-light">
              {t.heroSubtitle}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
              {[{ icon: Sparkles, label: "AI Powered" }, { icon: LineChart, label: "Real-Time Analytics" }, { icon: Shield, label: "Secure & Fast" }].map(
                (b, idx) => {
                  const Icon = b.icon;
                  return (
                    <motion.div
                      key={b.label}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.15 + idx * 0.08 }}
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80 backdrop-blur"
                    >
                      <Icon className="h-4 w-4 text-primary" />
                      {b.label}
                    </motion.div>
                  );
                },
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={isLoggedIn ? "/dashboard" : "/login"}>
                <Button
                  size="lg"
                  className="h-14 px-8 text-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-full shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all hover:scale-[1.03]"
                >
                  {isLoggedIn ? t.goDashboard : t.startFree}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>

              <Button
                size="lg"
                variant="outline"
                className="h-14 px-8 text-lg border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-full backdrop-blur-sm"
                onClick={() => {
                  toastInfo("Guest preview", "Explore features on this page. Login is required to start sessions.");
                  const featuresSection = document.getElementById("features-section");
                  featuresSection?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                {t.tryGuest}
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="h-14 px-8 text-lg border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-full backdrop-blur-sm flex items-center gap-2"
                onClick={handleViewDemo}
              >
                <Play className="w-4 h-4" />
                {t.watchDemo}
              </Button>
            </div>

            <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl mx-auto">
              {[
                { label: "100+ Sessions Tracked", icon: LineChart, value: 100 },
                { label: "95% Productivity Boost", icon: Sparkles, value: 95 },
                { label: "Built for Students & Developers", icon: Timer, value: 60 },
              ].map((s, idx) => {
                const Icon = s.icon;
                return (
                  <motion.div
                    key={s.label}
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: idx * 0.08 }}
                  >
                    <Card className="p-4 bg-card/40 backdrop-blur-md border border-white/5 hover:border-primary/20 transition-all duration-300">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <div className="text-left">
                          <div className="text-white font-semibold">{s.label}</div>
                          <div className="text-xs text-muted-foreground">Updated in real time</div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>

      <Dialog open={showDemoModal} onOpenChange={setShowDemoModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>60-second demo</DialogTitle>
            <DialogDescription>
              A quick preview of how AI Coach turns practice into measurable progress.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border bg-card/50 p-4">
            <div className="aspect-video w-full rounded-md bg-black/60 flex items-center justify-center">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">
                  <Play className="h-4 w-4 text-primary" />
                  Demo video placeholder
                </div>
                <div className="mt-3 text-sm text-muted-foreground">
                  Replace this with an embedded video when ready.
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* How it works */}
      <div id="how-it-works" className="container mx-auto px-6 py-20 relative z-20">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-heading font-bold text-white mb-3">{t.howTitle}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t.howSubtitle}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            {
              step: "01",
              title: "Sign In",
              desc: "Secure login to save sessions and track progress.",
              icon: Shield,
            },
            {
              step: "02",
              title: "Start a Session",
              desc: "Launch a practice session with a guided question flow.",
              icon: Play,
            },
            {
              step: "03",
              title: "Get AI Feedback",
              desc: "Receive real-time coaching to improve clarity and confidence.",
              icon: Sparkles,
            },
            {
              step: "04",
              title: "Analyze Performance",
              desc: "Review trends and insights across sessions and time.",
              icon: LineChart,
            },
          ].map((s, idx) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.08 }}
                viewport={{ once: true }}
              >
                <Card className="h-full p-6 bg-card/40 backdrop-blur-md border border-white/5 hover:border-primary/20 transition-all duration-300 group">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="text-left">
                        <div className="text-xs font-mono text-muted-foreground">STEP {s.step}</div>
                        <div className="text-lg font-semibold text-white">{s.title}</div>
                      </div>
                    </div>
                    <div className="text-xs font-mono text-white/30">{s.step}</div>
                  </div>

                  <div className="mt-4 text-sm text-white/70 leading-relaxed text-left">
                    {s.desc}
                  </div>

                  <div className="mt-5 h-1 w-full rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full w-0 bg-primary/60 group-hover:w-full transition-all duration-500" />
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* AI Intelligence Showcase */}
      <div className="container mx-auto px-6 py-20 relative z-20">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-heading font-bold text-white mb-3">{t.aiTitle}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t.aiSubtitle}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                title: "Real-Time Session Monitoring",
                desc: "Track timing, flow, and engagement while you practice.",
                icon: Timer,
              },
              {
                title: "AI-Based Performance Insights",
                desc: "Spot patterns in your sessions and find improvement opportunities.",
                icon: Sparkles,
              },
              {
                title: "Personalized Suggestions",
                desc: "Get next-step recommendations tailored to your practice style.",
                icon: Brain,
              },
            ].map((f, idx) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: idx * 0.08 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full p-6 bg-card/40 backdrop-blur-md border border-white/5 hover:border-primary/20 transition-all duration-300 group">
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="text-left">
                        <div className="text-white font-semibold">{f.title}</div>
                        <div className="mt-1 text-sm text-white/70 leading-relaxed">{f.desc}</div>
                      </div>
                    </div>
                    <div className="mt-5 h-1 w-full rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full w-0 bg-primary/60 group-hover:w-full transition-all duration-500" />
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.15 }}
            viewport={{ once: true }}
            className="h-full"
          >
            <Card className="h-full p-6 bg-gradient-to-b from-primary/10 to-card/40 backdrop-blur-md border border-primary/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-primary" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold text-white">AI Insight Preview</div>
                    <div className="text-xs text-muted-foreground">Example output</div>
                  </div>
                </div>
                <div className="text-xs font-mono text-primary/80">LIVE</div>
              </div>

              <div className="mt-5 rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="text-sm text-white/80 leading-relaxed">
                  {'"'}You were most productive between{" "}
                  <span className="text-white">4–6 PM</span>. Consider shorter sessions for better focus.{""}{'"'}
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <div className="rounded-lg border border-white/10 bg-white/5 p-2">
                    <div className="text-xs text-muted-foreground">Focus</div>
                    <div className="text-sm font-semibold text-white">High</div>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-white/5 p-2">
                    <div className="text-xs text-muted-foreground">Trend</div>
                    <div className="text-sm font-semibold text-white">Improving</div>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-white/5 p-2">
                    <div className="text-xs text-muted-foreground">Next</div>
                    <div className="text-sm font-semibold text-white">15–20m</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Actionable
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">
                  <LineChart className="h-4 w-4 text-primary" />
                  Data-driven
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">
                  <Shield className="h-4 w-4 text-primary" />
                  Privacy-first
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Live Preview */}
      <div className="container mx-auto px-6 py-20 relative z-20">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-heading font-bold text-white mb-3">{t.liveTitle}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t.liveSubtitle}
          </p>
        </motion.div>

        <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
          <Button
            variant={activePreview === "dashboard" ? "default" : "outline"}
            className={activePreview === "dashboard" ? "bg-primary hover:bg-primary/90" : "border-white/10 bg-white/5 hover:bg-white/10 text-white"}
            onClick={() => setActivePreview("dashboard")}
          >
            {lang === "jp" ? "ダッシュボード" : "Preview Dashboard"}
          </Button>
          <Button
            variant={activePreview === "analytics" ? "default" : "outline"}
            className={activePreview === "analytics" ? "bg-primary hover:bg-primary/90" : "border-white/10 bg-white/5 hover:bg-white/10 text-white"}
            onClick={() => setActivePreview("analytics")}
          >
            {lang === "jp" ? "分析" : "Preview Analytics"}
          </Button>
          <Button
            variant={activePreview === "session" ? "default" : "outline"}
            className={activePreview === "session" ? "bg-primary hover:bg-primary/90" : "border-white/10 bg-white/5 hover:bg-white/10 text-white"}
            onClick={() => setActivePreview("session")}
          >
            {lang === "jp" ? "タイマー" : "Preview Session Timer"}
          </Button>
        </div>

        <motion.div
          key={activePreview}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <Card className="p-6 bg-card/40 backdrop-blur-md border border-white/5">
            {activePreview === "dashboard" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <div className="text-sm text-muted-foreground">Dashboard</div>
                    <div className="text-xl font-semibold text-white">Today’s Overview</div>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">
                    <Sparkles className="h-4 w-4 text-primary" />
                    AI Summary
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[{ label: "Sessions", value: "3" }, { label: "Avg Score", value: "86" }, { label: "Practice Time", value: "42m" }].map((s) => (
                    <div key={s.label} className="rounded-xl border border-white/10 bg-white/5 p-4">
                      <div className="text-xs text-muted-foreground">{s.label}</div>
                      <div className="mt-1 text-2xl font-bold text-white">{s.value}</div>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-left">
                  <div className="text-xs text-muted-foreground">AI Insight</div>
                  <div className="mt-1 text-sm text-white/80">
                    Keep sessions under 20 minutes for maximum clarity. Your best performance is late afternoon.
                  </div>
                </div>
              </div>
            )}

            {activePreview === "analytics" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <div className="text-sm text-muted-foreground">Analytics</div>
                    <div className="text-xl font-semibold text-white">Sessions vs Scores</div>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">
                    <LineChart className="h-4 w-4 text-primary" />
                    Weekly
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {[34, 48, 52, 66, 61, 78, 72].map((h, idx) => (
                    <div key={idx} className="h-28 rounded-lg border border-white/10 bg-white/5 flex items-end overflow-hidden">
                      <div className="w-full bg-primary/50" style={{ height: `${h}%` }} />
                    </div>
                  ))}
                </div>
                <div className="text-left text-xs text-muted-foreground">
                  Dummy data preview. Full analytics become available after you complete sessions.
                </div>
              </div>
            )}

            {activePreview === "session" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <div className="text-sm text-muted-foreground">Session</div>
                    <div className="text-xl font-semibold text-white">Live Timer Preview</div>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">
                    <Timer className="h-4 w-4 text-primary" />
                    00:12:34
                  </div>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-left">
                  <div className="text-xs text-muted-foreground">Prompt</div>
                  <div className="mt-1 text-sm text-white/80">
                    "Tell me about a time you overcame a challenge."
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[{ label: "Pace", value: "Good" }, { label: "Clarity", value: "Improving" }, { label: "Confidence", value: "High" }].map((m) => (
                    <div key={m.label} className="rounded-xl border border-white/10 bg-white/5 p-4">
                      <div className="text-xs text-muted-foreground">{m.label}</div>
                      <div className="mt-1 text-lg font-semibold text-white">{m.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </motion.div>
      </div>

      {/* Achievements & Trust */}
      <div className="container mx-auto px-6 py-20 relative z-20">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-heading font-bold text-white mb-3">{t.trustTitle}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t.trustSubtitle}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Card className="h-full p-6 bg-card/40 backdrop-blur-md border border-white/5 hover:border-primary/20 transition-all duration-300">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <div className="text-white font-semibold">Used by 500+ Students</div>
                  <div className="mt-1 text-sm text-white/70 leading-relaxed">
                    A workflow that helps you practice consistently and see progress.
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08 }}
            viewport={{ once: true }}
          >
            <Card className="h-full p-6 bg-card/40 backdrop-blur-md border border-white/5 hover:border-primary/20 transition-all duration-300">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <div className="text-white font-semibold">Built using MERN + TypeScript</div>
                  <div className="mt-1 text-sm text-white/70 leading-relaxed">
                    Modern stack, fast iteration, and a clean developer experience.
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.16 }}
            viewport={{ once: true }}
          >
            <Card className="h-full p-6 bg-card/40 backdrop-blur-md border border-white/5 hover:border-primary/20 transition-all duration-300">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <div className="text-white font-semibold">Secure Authentication</div>
                  <div className="mt-1 text-sm text-white/70 leading-relaxed">
                    Your sessions and notes stay private and protected.
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          {[{ icon: Shield, label: "Secure" }, { icon: Zap, label: "Fast" }, { icon: Sparkles, label: "AI Powered" }].map(
            (b) => {
              const Icon = b.icon;
              return (
                <div
                  key={b.label}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80 backdrop-blur"
                >
                  <Icon className="h-4 w-4 text-primary" />
                  {b.label}
                </div>
              );
            },
          )}
        </div>
      </div>

      {/* Features Grid */}
      <div id="features-section" className="container mx-auto px-6 py-24 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: Brain,
              title: "Cognitive Analysis",
              desc: "Deep learning models analyze your answer structure and clarity in real-time."
            },
            {
              icon: Camera,
              title: "Visual Cues",
              desc: "Computer vision tracks eye contact, posture, and micro-expressions."
            },
            {
              icon: LineChart,
              title: "Performance Metrics",
              desc: "Detailed charts tracking your improvement over time across 12 key KPIs."
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div 
                className="relative p-8 rounded-2xl bg-card/40 backdrop-blur-md border border-white/5 hover:border-primary/20 transition-all duration-300 cursor-pointer group"
                onClick={() => setExpandedFeature(expandedFeature === index ? null : index)}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary p-[1px] flex items-center justify-center group-hover:scale-110 transition-transform">
                      <feature.icon className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-semibold text-white mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
                    </div>
                  </div>
                  <div className="transition-transform duration-200">
                    {expandedFeature === index ? (
                      <ChevronUp className="w-6 h-6 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>
                </div>

                <AnimatePresence>
                  {expandedFeature === index && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden mt-6"
                    >
                      <div className="p-6 rounded-xl bg-primary/10 border border-primary/20 backdrop-blur-md">
                        <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-4">Key Capabilities</p>
                        <div className="space-y-3">
                          {featureDetails[feature.title as keyof typeof featureDetails].capabilities.map((capability, idx) => (
                            <motion.div
                              key={idx}
                              initial={{ x: -20, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ delay: idx * 0.1 }}
                              className="flex items-center gap-2 text-sm text-white/60"
                            >
                              <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                              {capability}
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="container mx-auto px-6 py-24 relative z-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-heading font-bold text-white mb-4">Frequently Asked Questions</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Everything you need to know about AI Coach</p>
        </motion.div>
        
        <div className="max-w-4xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="overflow-hidden">
                <button
                  onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                  className="w-full p-6 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <HelpCircle className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold text-white">{faq.question}</h3>
                  </div>
                  {expandedFAQ === index ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>
                
                <AnimatePresence>
                  {expandedFAQ === index && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="px-6 pb-6"
                    >
                      <p className="text-white/80 leading-relaxed">{faq.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="container mx-auto px-6 py-24 relative z-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Card className="max-w-2xl mx-auto p-12 bg-card/40 backdrop-blur-md border border-white/5">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-heading font-bold text-white mb-4">Stay Updated</h2>
              <p className="text-lg text-muted-foreground">Get the latest interview tips and AI Coach updates delivered to your inbox</p>
            </div>
            
            <form onSubmit={handleNewsletterSubscribe} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
                required
              />
              <Button 
                type="submit" 
                size="lg" 
                disabled={isSubscribing}
                className="px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-full"
              >
                {isSubscribing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Subscribing...
                  </div>
                ) : (
                  "Subscribe"
                )}
              </Button>
            </form>
          </Card>
        </motion.div>
      </div>

      {/* Final CTA */}
      <div className="container mx-auto px-6 py-20 relative z-20">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
        >
          <Card
            className="p-10 md:p-12 overflow-hidden border bg-card/40 backdrop-blur-md border-white/5"
          >
            <div className="relative">
              <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-primary/10 blur-3xl" />
              <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-purple-500/10 blur-3xl" />

              <div className="relative grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 items-center">
                <div className="text-left">
                  <h2 className="text-3xl md:text-4xl font-heading font-bold text-white">
                    {t.finalTitle}
                  </h2>
                  <p className="mt-2 text-lg text-muted-foreground">
                    {t.finalSubtitle}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">
                      <Shield className="h-4 w-4 text-primary" />
                      Secure
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">
                      <Zap className="h-4 w-4 text-primary" />
                      Fast
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">
                      <Sparkles className="h-4 w-4 text-primary" />
                      AI Powered
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row lg:flex-col gap-3 justify-start lg:justify-end">
                  <Link href={isLoggedIn ? "/dashboard" : "/login"}>
                    <Button
                      size="lg"
                      className="h-12 px-8 rounded-full bg-primary hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      {isLoggedIn ? t.goDashboard : t.startNow}
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>

                  {!isLoggedIn && (
                    <Link href="/login">
                      <Button
                        size="lg"
                        variant="outline"
                        className="h-12 px-8 rounded-full focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring border-white/10 bg-white/5 hover:bg-white/10 text-white"
                      >
                        {t.login}
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-card/20 backdrop-blur-md py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">AI Coach</h3>
              <p className="text-white/60 leading-relaxed">Master your interview skills with AI-powered real-time feedback and personalized coaching.</p>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">Quick Links</h3>
              <div className="space-y-2">
                <a href="#" className="block text-white/60 hover:text-white transition-colors">About Us</a>
                <a href="#" className="block text-white/60 hover:text-white transition-colors">Features</a>
                <a href="#" className="block text-white/60 hover:text-white transition-colors">Pricing</a>
                <a href="#" className="block text-white/60 hover:text-white transition-colors">Support</a>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">Connect With Us</h3>
              <div className="flex gap-4">
                <a 
                  href="https://github.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition-colors"
                >
                  <Github className="w-6 h-6 text-white" />
                </a>
                <a 
                  href="https://linkedin.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition-colors"
                >
                  <Linkedin className="w-6 h-6 text-white" />
                </a>
                <a 
                  href="mailto:hello@aicoach.com" 
                  className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition-colors"
                >
                  <Mail className="w-6 h-6 text-white" />
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-white/10 mt-8 pt-8 text-center">
            <p className="text-white/60">© 2024 AI Coach. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Contact Modal */}
      <AnimatePresence>
        {showContactModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowContactModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-card rounded-2xl p-8 max-w-md w-full border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">Contact Us</h3>
                <button
                  onClick={() => setShowContactModal(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="text-white">hello@aicoach.com</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="text-white">+1 (555) 123-4567</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="text-white">123 Tech Street, San Francisco, CA 94105</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8">
                <Button 
                  onClick={() => setShowContactModal(false)}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-full"
                >
                  Close
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
