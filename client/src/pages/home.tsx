import { useRef, useState } from "react";
import { motion, useScroll } from "framer-motion";
import DemoDialog from "@/components/home/demo-dialog";
import HeroSection from "@/components/home/hero-section";
import {
  FaqSection,
  FeaturesSection,
  HowItWorks,
  PlatformStats,
  TechCategories,
  TodayInTech,
} from "@/components/home/info-sections";
import NewsletterSection from "@/components/home/newsletter-section";
import { useProductPulse } from "@/hooks/use-product-pulse";

export default function Home() {
  const { pulse, summary } = useProductPulse();
  const [showDemo, setShowDemo] = useState(false);
  const statsRef = useRef<HTMLElement>(null);
  // Motion value, so scrolling animates the bar without re-rendering the page.
  const { scrollYProgress } = useScroll();

  return (
    <div className="relative min-h-screen flex flex-col">
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-blue-600 z-50 origin-left"
        style={{ scaleX: scrollYProgress }}
      />

      <HeroSection
        onWatchDemo={() => setShowDemo(true)}
        onScrollDown={() => statsRef.current?.scrollIntoView({ behavior: "smooth" })}
      />
      <PlatformStats ref={statsRef} pulse={pulse} />
      <TodayInTech summary={summary} />
      <HowItWorks />
      <FeaturesSection />
      <TechCategories />
      <FaqSection />
      <NewsletterSection />

      <DemoDialog open={showDemo} onOpenChange={setShowDemo} />
    </div>
  );
}
