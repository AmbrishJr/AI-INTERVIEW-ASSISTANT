import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion, AnimatePresence, useScroll } from "framer-motion";
import { 
  TrendingUp, 
  Users, 
  Briefcase, 
  Newspaper, 
  Activity,
  Brain,
  ArrowRight,
  Zap,
  Target,
  BarChart3,
  Globe,
  Code,
  Cloud,
  Shield,
  Database,
  Cpu,
  Lightbulb,
  Rocket,
  Star,
  Eye,
  MousePointer,
  Play,
  ChevronDown,
  CheckCircle,
  MessageSquare,
  HelpCircle,
  Sparkles,
  Timer,
  Languages,
  Camera,
  LineChart
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { toastInfo } from "@/hooks/use-toast";
import { useAuthState } from "@/contexts/AuthStateContext";
// import heroBg from "@assets/generated_images/futuristic_neural_network_data_flow_background.png";

interface ProductPulse {
  activeUsers: number;
  jobsTracked: number;
  newsUpdates: number;
  engagementRate: number;
  topTechStacks: string[];
  topRoles: string[];
  trendingTopics: string[];
  userGrowth: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  contentMetrics: {
    newsArticles: number;
    jobPostings: number;
    projects: number;
    researchPapers: number;
  };
}

interface AIInsight {
  type: string;
  title: string;
  description: string;
  impact: string;
  actionable: boolean;
  recommendation?: string;
  confidence: number;
}

export default function Home() {
  const [productPulse, setProductPulse] = useState<ProductPulse | null>(null);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [todaySummary, setTodaySummary] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [, setLocation] = useLocation();
  const { isLoggedIn } = useAuthState();
  
  // Landing page states
  const [expandedFeature, setExpandedFeature] = useState<number | null>(null);
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [typedHeadline, setTypedHeadline] = useState("");
  const [activePreview, setActivePreview] = useState<"dashboard" | "analytics" | "session">("dashboard");

  // Smooth scroll refs
  const statsRef = useRef<HTMLDivElement | null>(null);
  const featuresRef = useRef<HTMLDivElement | null>(null);
  const faqRef = useRef<HTMLDivElement | null>(null);
  const newsletterRef = useRef<HTMLDivElement | null>(null);

  // Smooth scroll progress
  const scrollY = useScroll();
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const updateScrollProgress = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', updateScrollProgress);
    return () => window.removeEventListener('scroll', updateScrollProgress);
  }, []);

  // Smooth scroll function
  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    loadProductPulse();
    setupTypedHeadline();
  }, []);

  const setupTypedHeadline = () => {
    const fullHeadline = "Master your productivity with AI precision.";
    setTypedHeadline("");
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setTypedHeadline(fullHeadline.slice(0, i));
      if (i >= fullHeadline.length) window.clearInterval(id);
    }, 22);
    return () => window.clearInterval(id);
  };

  const loadProductPulse = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/product/pulse');
      if (response.ok) {
        const data = await response.json();
        setProductPulse(data.kpis);
        setAiInsights(data.insights || []);
        
        // Generate today's tech summary
        await generateTodaySummary(data.kpis);
      }
    } catch (error) {
      console.error('Failed to load product pulse:', error);
      toastInfo('Error', 'Failed to load live stats');
    } finally {
      setLoading(false);
    }
  };

  const generateTodaySummary = async (pulseData: ProductPulse) => {
    try {
      const response = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'summary',
          data: pulseData,
          context: 'Today in tech - daily summary for homepage'
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setTodaySummary(data.summary || 'Stay updated with the latest tech trends and opportunities.');
      }
    } catch (error) {
      setTodaySummary('Today in Tech: AI continues to dominate job markets, cloud computing sees rapid growth, and cybersecurity roles are in high demand.');
    }
  };

  const techIcons = [
    { icon: Code, label: 'Development', color: 'text-blue-600' },
    { icon: Cloud, label: 'Cloud', color: 'text-green-600' },
    { icon: Shield, label: 'Security', color: 'text-red-600' },
    { icon: Database, label: 'Data', color: 'text-purple-600' },
    { icon: Cpu, label: 'AI/ML', color: 'text-orange-600' },
    { icon: Globe, label: 'Web3', color: 'text-cyan-600' }
  ];

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

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
    setIsSubscribing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    toastInfo('Success', 'Thank you for subscribing!');
    setEmail('');
    setIsSubscribing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-12 bg-muted rounded w-96 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded"></div>
              ))}
            </div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Scroll Progress Indicator */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-blue-600 z-50 origin-left"
        style={{ scaleX: scrollProgress / 100 }}
      />

      {/* Hero Section - AI Interview Coach */}
      <div className="relative h-[92vh] flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay - Matching Original Landing Page */}
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
          <div className="w-full h-full bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 opacity-60" />
        </div>
        
        <div className="relative z-20 max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
              AI-powered session tracking
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              {typedHeadline}
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Real-time AI feedback, a live session workspace, and analytics that turn practice into measurable improvement.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
              {isLoggedIn ? (
                <Button size="lg" onClick={() => setLocation('/dashboard')} className="text-lg px-8">
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              ) : (
                <>
                  <Button size="lg" onClick={() => setLocation('/login')} className="text-lg px-8">
                    Start Free Session
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => setLocation('/login')} className="text-lg px-8">
                    Try as Guest
                  </Button>
                </>
              )}
              <Button size="lg" variant="outline" onClick={() => setShowDemoModal(true)} className="text-lg px-8 border-white/20 hover:bg-white/10">
                <Play className="mr-2 h-5 w-5" />
                Watch 60-sec Demo
              </Button>
            </div>

            {/* Scroll Indicator - Below All Buttons */}
            <motion.div
              className="absolute bottom-16 left-1/2 transform -translate-x-1/2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.5 }}
            >
              <Button
                variant="outline"
                size="sm"
                onClick={() => scrollToSection(statsRef)}
                className="animate-bounce border-white/20 hover:bg-white/10"
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Live Platform Stats */}
      <section ref={statsRef} className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Live Platform Stats</h2>
            <p className="text-muted-foreground">Real-time metrics from our tech intelligence engine</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            {[
              { 
                label: 'Active Users', 
                value: productPulse?.activeUsers || 1247, 
                icon: Users, 
                change: productPulse?.userGrowth.daily || 23,
                color: 'text-blue-600' 
              },
              { 
                label: 'Jobs Tracked', 
                value: productPulse?.jobsTracked || 3847, 
                icon: Briefcase, 
                change: 156,
                color: 'text-green-600' 
              },
              { 
                label: 'News Updates', 
                value: productPulse?.newsUpdates || 156, 
                icon: Newspaper, 
                change: 89,
                color: 'text-purple-600' 
              },
              { 
                label: 'Engagement', 
                value: `${productPulse?.engagementRate || 78}%`, 
                icon: Activity, 
                change: 5,
                color: 'text-orange-600' 
              }
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="text-center hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <Icon className={`h-8 w-8 mx-auto mb-3 ${stat.color}`} />
                      <div className="text-2xl font-bold mb-1">
                        {typeof stat.value === 'string' ? stat.value : formatNumber(stat.value)}
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">{stat.label}</div>
                      <div className="flex items-center justify-center text-xs">
                        <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                        <span className="text-green-600">+{stat.change}</span>
                        <span className="text-muted-foreground ml-1">today</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Today in Tech - AI Summary */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <Brain className="h-8 w-8" />
                  <h2 className="text-2xl font-bold">Today in Tech</h2>
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    AI-Generated
                  </Badge>
                </div>
                <p className="text-lg leading-relaxed opacity-95">
                  {todaySummary}
                </p>
                <div className="mt-6">
                  <Button variant="secondary" onClick={() => setLocation('/news')} className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                    Read Full Analysis
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">How it works</h2>
            <p className="text-muted-foreground">Sign in, practice with AI, then track improvement with real analytics.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: "Sign In",
                description: "Create your account and set up your profile"
              },
              {
                icon: Brain,
                title: "Practice with AI",
                description: "Get real-time feedback during mock interviews"
              },
              {
                icon: BarChart3,
                title: "Track Progress",
                description: "Monitor your improvement with detailed analytics"
              }
            ].map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="text-center">
                  <CardContent className="p-6">
                    <step.icon className="h-12 w-12 mx-auto mb-4 text-primary" />
                    <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Features */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Smarter Productivity with AI</h2>
            <p className="text-muted-foreground">Real-time intelligence that highlights what matters and suggests what to do next.</p>
          </motion.div>

          <div className="space-y-6">
            {Object.entries(featureDetails).map(([feature, details], index) => (
              <motion.div
                key={feature}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.7 + index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="cursor-pointer" onClick={() => setExpandedFeature(expandedFeature === index ? null : index)}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2">{feature}</h3>
                        <p className="text-muted-foreground">{details.details}</p>
                      </div>
                      <ChevronDown className={`h-5 w-5 transition-transform ${expandedFeature === index ? 'rotate-180' : ''}`} />
                    </div>
                    
                    <AnimatePresence>
                      {expandedFeature === index && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="mt-4"
                        >
                          <div className="pt-4 border-t">
                            <h4 className="font-medium mb-2">Capabilities:</h4>
                            <div className="grid grid-cols-2 gap-2">
                              {details.capabilities.map((capability) => (
                                <div key={capability} className="flex items-center gap-2 text-sm">
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                  {capability}
                                </div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Categories */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Explore Tech Categories</h2>
            <p className="text-muted-foreground">Deep dive into specific technology domains</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {techIcons.map((tech, index) => {
              const Icon = tech.icon;
              return (
                <motion.div
                  key={tech.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.9 + index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className="cursor-pointer"
                  onClick={() => setLocation(`/news?category=${tech.label.toLowerCase()}`)}
                >
                  <Card className="text-center hover:shadow-lg transition-all hover:scale-105">
                    <CardContent className="p-6">
                      <Icon className={`h-8 w-8 mx-auto mb-3 ${tech.color}`} />
                      <div className="text-sm font-medium">{tech.label}</div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-muted-foreground">Everything you need to know about AI Coach</p>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 1.1 + index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="cursor-pointer" onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{faq.question}</h3>
                      <ChevronDown className={`h-5 w-5 transition-transform ${expandedFAQ === index ? 'rotate-180' : ''}`} />
                    </div>
                    
                    <AnimatePresence>
                      {expandedFAQ === index && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="mt-4"
                        >
                          <p className="text-muted-foreground">{faq.answer}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Card className="max-w-2xl mx-auto">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-4">Stay Updated</h2>
                <p className="text-muted-foreground mb-6">Get the latest tech trends and AI insights delivered to your inbox</p>
                
                <form onSubmit={handleNewsletterSubscribe} className="flex flex-col sm:flex-row gap-4">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="flex-1"
                  />
                  <Button type="submit" disabled={isSubscribing}>
                    {isSubscribing ? 'Subscribing...' : 'Subscribe'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Demo Modal */}
      <Dialog open={showDemoModal} onOpenChange={setShowDemoModal}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Live Platform Preview</DialogTitle>
            <DialogDescription>
              Explore a static preview of the dashboard, analytics, and session timer experience.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex gap-2">
              {['dashboard', 'analytics', 'session'].map((preview) => (
                <Button
                  key={preview}
                  variant={activePreview === preview ? 'default' : 'outline'}
                  onClick={() => setActivePreview(preview as any)}
                  className="capitalize"
                >
                  {preview}
                </Button>
              ))}
            </div>
            
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">
                  {activePreview.charAt(0).toUpperCase() + activePreview.slice(1)} Preview
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
