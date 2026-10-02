import type { Ref } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  Activity, ArrowRight, BarChart3, Brain, Briefcase, CheckCircle, Cloud, Code, Cpu, Database, Globe, Newspaper, Shield, TrendingUp, Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FAQS, FEATURES } from "@/data/home-content";
import type { ProductPulse } from "@/hooks/use-product-pulse";
import { ExpandableCard, Reveal, Section } from "./section";

const compactNumber = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });

export function PlatformStats({ pulse, ref }: { pulse?: ProductPulse; ref?: Ref<HTMLElement> }) {
  const stats = [
    { label: "Active Users", value: compactNumber.format(pulse?.activeUsers ?? 1247), Icon: Users, change: pulse?.userGrowth.daily ?? 23, color: "text-blue-600" },
    { label: "Jobs Tracked", value: compactNumber.format(pulse?.jobsTracked ?? 3847), Icon: Briefcase, change: 156, color: "text-green-600" },
    { label: "News Updates", value: compactNumber.format(pulse?.newsUpdates ?? 156), Icon: Newspaper, change: 89, color: "text-purple-600" },
    { label: "Engagement", value: `${pulse?.engagementRate ?? 78}%`, Icon: Activity, change: 5, color: "text-orange-600" },
  ];

  return (
    <Section ref={ref} title="Live Platform Stats" subtitle="Real-time metrics from our tech intelligence engine">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map(({ label, value, Icon, change, color }, index) => (
          <Reveal key={label} delay={0.1 + index * 0.1}>
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <Icon className={`h-8 w-8 mx-auto mb-3 ${color}`} />
                <div className="text-2xl font-bold mb-1">{value}</div>
                <div className="text-sm text-muted-foreground mb-2">{label}</div>
                <div className="flex items-center justify-center text-xs">
                  <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                  <span className="text-green-600">+{change}</span>
                  <span className="text-muted-foreground ml-1">today</span>
                </div>
              </CardContent>
            </Card>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

export function TodayInTech({ summary }: { summary: string }) {
  const [, setLocation] = useLocation();
  return (
    <Section>
      <Reveal>
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-4">
              <Brain className="h-8 w-8" />
              <h2 className="text-2xl font-bold">Today in Tech</h2>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                AI-Generated
              </Badge>
            </div>
            <p className="text-lg leading-relaxed opacity-95">{summary}</p>
            <Button
              variant="secondary"
              onClick={() => setLocation("/news")}
              className="mt-6 bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              Read Full Analysis
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </Reveal>
    </Section>
  );
}

const STEPS = [
  { Icon: Users, title: "Sign In", description: "Create your account and set up your profile" },
  { Icon: Brain, title: "Practice with AI", description: "Get real-time feedback during mock interviews" },
  { Icon: BarChart3, title: "Track Progress", description: "Monitor your improvement with detailed analytics" },
];

export function HowItWorks() {
  return (
    <Section title="How it works" subtitle="Sign in, practice with AI, then track improvement with real analytics.">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {STEPS.map(({ Icon, title, description }, index) => (
          <Reveal key={title} delay={0.1 + index * 0.1}>
            <Card className="text-center h-full">
              <CardContent className="p-6">
                <Icon className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-2">{title}</h3>
                <p className="text-muted-foreground">{description}</p>
              </CardContent>
            </Card>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

export function FeaturesSection() {
  return (
    <Section title="Smarter Productivity with AI" subtitle="Real-time intelligence that highlights what matters and suggests what to do next.">
      <div className="space-y-6">
        {FEATURES.map((feature, index) => (
          <Reveal key={feature.title} delay={0.1 + index * 0.1}>
            <ExpandableCard
              header={
                <>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.details}</p>
                </>
              }
            >
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Capabilities:</h4>
                <ul className="grid grid-cols-2 gap-2">
                  {feature.capabilities.map((capability) => (
                    <li key={capability} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      {capability}
                    </li>
                  ))}
                </ul>
              </div>
            </ExpandableCard>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

const TECH_CATEGORIES = [
  { Icon: Code, label: "Development", color: "text-blue-600" },
  { Icon: Cloud, label: "Cloud", color: "text-green-600" },
  { Icon: Shield, label: "Security", color: "text-red-600" },
  { Icon: Database, label: "Data", color: "text-purple-600" },
  { Icon: Cpu, label: "AI/ML", color: "text-orange-600" },
  { Icon: Globe, label: "Web3", color: "text-cyan-600" },
];

export function TechCategories() {
  const [, setLocation] = useLocation();
  return (
    <Section title="Explore Tech Categories" subtitle="Deep dive into specific technology domains">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {TECH_CATEGORIES.map(({ Icon, label, color }, index) => (
          <motion.button
            key={label}
            type="button"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            viewport={{ once: true }}
            onClick={() => setLocation("/news")}
          >
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <Icon className={`h-8 w-8 mx-auto mb-3 ${color}`} />
                <div className="text-sm font-medium">{label}</div>
              </CardContent>
            </Card>
          </motion.button>
        ))}
      </div>
    </Section>
  );
}

export function FaqSection() {
  return (
    <Section title="Frequently Asked Questions" subtitle="Everything you need to know about AI Coach">
      <div className="max-w-3xl mx-auto space-y-4">
        {FAQS.map((faq, index) => (
          <Reveal key={faq.question} delay={index * 0.05}>
            <ExpandableCard header={<h3 className="font-semibold">{faq.question}</h3>}>
              <p className="text-muted-foreground">{faq.answer}</p>
            </ExpandableCard>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
