import { useState } from "react";
import { Link } from "wouter";
import {
  Mic,
  ScanFace,
  ChartNoAxesCombined,
  Newspaper,
  Briefcase,
  Code2,
} from "lucide-react";
import HeroSection from "@/components/home/hero-section";
import DemoDialog from "@/components/home/demo-dialog";
import { ExpandableCard } from "@/components/home/section";
import NewsletterSection from "@/components/home/newsletter-section";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
const features = [
  {
    Icon: Mic,
    title: "Hear yourself improve",
    text: "Practice technical and behavioral questions. Get feedback on speaking pace, filler words, and pauses.",
  },
  {
    Icon: ScanFace,
    title: "Show up with confidence",
    text: "Check your framing and camera presence with face detection that runs in your browser.",
  },
  {
    Icon: ChartNoAxesCombined,
    title: "Make progress visible",
    text: "Review your session, revisit your notes, and track the measurements captured during practice.",
  },
];
const faqs = [
  [
    "What do I need to get started?",
    "A username and password are enough to create an account. A microphone and camera enable live feedback. Speech recognition depends on browser support; you can still practice without it.",
  ],
  [
    "What does AICoach measure?",
    "It tracks speaking time, recognized words, filler words, speaking pace, and estimated camera presence. These are practice cues, not a hiring assessment or a measure of your ability.",
  ],
  [
    "Where is my practice data stored?",
    "Session summaries and notes are saved in this browser for your account, with the latest 10 sessions retained. They do not sync across devices. Camera analysis runs locally. Browser speech recognition may use your browser provider’s services. AI chat and insight requests are sent to the configured AI provider.",
  ],
  [
    "Can I practice for different roles?",
    "Choose from 12 fields, three difficulty levels, and technical, HR, or other question categories. Questions come from a built-in question bank.",
  ],
];
export default function Home() {
  const [showDemo, setShowDemo] = useState(false);
  const { isLoggedIn } = useAuth();
  return (
    <div className="bg-card min-h-screen">
      <header className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between border-b">
        <Link href="/" className="text-2xl font-semibold tracking-tight">
          aicoach<span className="text-primary">.</span>
        </Link>
        <nav
          className="flex items-center gap-6 text-sm"
          aria-label="Main navigation"
        >
          <a
            href="#how-it-works"
            className="hidden sm:block text-muted-foreground hover:text-primary"
          >
            How it works
          </a>
          <Link
            href="/projects"
            className="hidden sm:block text-muted-foreground hover:text-primary"
          >
            Resources
          </Link>
          <Button variant="outline" asChild>
            <Link href={isLoggedIn ? "/dashboard" : "/login"}>
              {isLoggedIn ? "Your workspace" : "Sign in"}
            </Link>
          </Button>
        </nav>
      </header>
      <HeroSection onWatchDemo={() => setShowDemo(true)} />
      <section id="how-it-works" className="border-y bg-background">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="max-w-xl mb-12">
            <p className="text-sm text-primary font-medium mb-3">
              PRACTICE THAT GOES SOMEWHERE
            </p>
            <h2 className="text-3xl sm:text-4xl font-semibold leading-tight">
              Less guessing.
              <br />
              More getting ready.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-10">
            {features.map(({ Icon, title, text }) => (
              <article key={title} className="border-t border-slate-300 pt-6">
                <Icon className="text-primary mb-6" size={24} />
                <h3 className="text-xl font-semibold">{title}</h3>
                <p className="mt-3 text-muted-foreground leading-relaxed">
                  {text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-[1fr_1.3fr] gap-12">
        <div>
          <p className="text-sm text-primary font-medium mb-3">
            BEYOND THE PRACTICE ROOM
          </p>
          <h2 className="text-3xl font-semibold">
            Stay curious.
            <br />
            Stay prepared.
          </h2>
          <p className="mt-4 text-muted-foreground max-w-sm">
            Keep up with your field and find something worth building next.
          </p>
        </div>
        <div className="divide-y border-y">
          {[
            {
              Icon: Newspaper,
              title: "Read what’s happening in tech",
              text: "News and summaries from across the industry.",
              path: "/news",
            },
            {
              Icon: Briefcase,
              title: "Explore career opportunities",
              text: "A sample job catalog to explore roles and skills.",
              path: "/jobs",
            },
            {
              Icon: Code2,
              title: "Find your next project",
              text: "Project ideas, open source, and research inspiration.",
              path: "/projects",
            },
          ].map(({ Icon, title, text, path }) => (
            <Link key={path} href={path} className="flex gap-5 py-6 group">
              <Icon className="text-muted-foreground mt-1 shrink-0" size={22} />
              <div>
                <h3 className="font-semibold group-hover:text-primary">
                  {title}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">{text}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
      <section className="border-t bg-background px-6 py-20">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-semibold mb-8">A few things to know</h2>
          <div className="space-y-3">
            {faqs.map(([q, a]) => (
              <ExpandableCard
                key={q}
                header={<h3 className="font-medium">{q}</h3>}
              >
                <p className="text-muted-foreground">{a}</p>
              </ExpandableCard>
            ))}
          </div>
        </div>
      </section>
      <NewsletterSection />
      <footer className="border-t max-w-7xl mx-auto px-6 py-8 flex flex-wrap gap-4 justify-between text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">aicoach.</span>
        <span>Make room for your next opportunity.</span>
        <Link href="/practice" className="hover:text-primary">
          Start practicing
        </Link>
      </footer>
      <DemoDialog open={showDemo} onOpenChange={setShowDemo} />
    </div>
  );
}
