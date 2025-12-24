import { Link } from "wouter";
import { ArrowRight, Brain, Camera, LineChart, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import heroBg from "@assets/generated_images/futuristic_neural_network_data_flow_background.png";

export default function Landing() {
  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Hero Section */}
      <div className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-background/80 z-10 backdrop-blur-[2px]" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent z-10" />
          <img 
            src={heroBg} 
            alt="AI Neural Network" 
            className="w-full h-full object-cover opacity-60"
          />
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
              SYS.ONLINE // V2.4.0
            </div>
            
            <h1 className="text-5xl md:text-7xl font-heading font-bold mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/50">
              Master the Interview <br/>
              <span className="text-primary text-glow">With AI Precision</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 font-light">
              Real-time analysis of your speech patterns, eye contact, and emotional cues.
              Get hired faster with data-driven feedback.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/session">
                <Button size="lg" className="h-14 px-8 text-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-full shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all hover:scale-105">
                  Start Simulation <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-full backdrop-blur-sm">
                  View Analytics
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-6 py-24 relative z-20">
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
          ].map((feature, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="p-8 rounded-2xl bg-card/50 border border-white/5 hover:border-primary/30 transition-all group backdrop-blur-sm"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-heading font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}