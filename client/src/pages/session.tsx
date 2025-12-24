import { useState, useEffect, useRef } from "react";
import Webcam from "react-webcam";
import { Mic, MicOff, Video, VideoOff, Play, Square, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";

const QUESTIONS = [
  "Tell me about a time you had to deal with a difficult conflict at work.",
  "Describe the architecture of your last major project.",
  "What is your biggest weakness as a developer?"
];

const MOCK_TRANSCRIPT = [
  { role: "ai", text: "Hello! I'm your AI interviewer today. Let's start with a classic. Tell me about yourself." },
  { role: "user", text: "Hi, sure. I'm a full-stack developer with 5 years of experience..." },
];

export default function Session() {
  const [isActive, setIsActive] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [transcript, setTranscript] = useState(MOCK_TRANSCRIPT);
  
  // Mock realtime feedback
  const [feedback, setFeedback] = useState<{metric: string, status: 'good' | 'warning' | 'bad', message: string} | null>(null);

  useEffect(() => {
    if (isActive) {
      const interval = setInterval(() => {
        // Random feedback simulation
        const types = [
          { metric: "Eye Contact", status: "good", message: "Great eye contact maintained." },
          { metric: "Pace", status: "warning", message: "You're speaking a bit fast." },
          { metric: "Tone", status: "good", message: "Confident and clear tone." },
          { metric: "Filler Words", status: "bad", message: "Avoid using 'um' and 'like'." }
        ];
        setFeedback(types[Math.floor(Math.random() * types.length)] as any);
        
        setTimeout(() => setFeedback(null), 3000);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isActive]);

  return (
    <div className="h-[calc(100vh-2rem)] p-6 gap-6 grid grid-cols-1 lg:grid-cols-3 max-w-[1600px] mx-auto">
      
      {/* Left Column - Main Interaction */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        {/* Question Card */}
        <Card className="p-6 bg-card/60 backdrop-blur-md border-primary/20 shadow-[0_0_30px_rgba(0,0,0,0.3)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
          <h2 className="text-muted-foreground text-sm font-mono mb-2 uppercase tracking-wider">Current Question</h2>
          <p className="text-2xl font-medium font-heading leading-tight">
            "{QUESTIONS[currentQuestionIndex]}"
          </p>
          <div className="flex gap-2 mt-4">
             <Button 
               variant="outline" 
               size="sm" 
               onClick={() => setCurrentQuestionIndex((p) => (p + 1) % QUESTIONS.length)}
               className="text-xs ml-auto border-white/10 hover:bg-white/5"
             >
               Skip Question
             </Button>
          </div>
        </Card>

        {/* Webcam Area */}
        <div className="flex-1 relative rounded-2xl overflow-hidden bg-black border border-white/10 shadow-2xl group">
          {camOn ? (
            <Webcam 
              className="w-full h-full object-cover opacity-90"
              audio={false}
              mirrored
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-zinc-900">
              <VideoOff className="w-16 h-16 text-zinc-700" />
            </div>
          )}

          {/* Overlay Graphics (Face Mesh Simulation) */}
          {isActive && camOn && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-80 border border-primary/30 rounded-[50%] opacity-50" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-primary opacity-50">+</div>
              
              {/* Scanline */}
              <div className="w-full h-[2px] bg-primary/50 absolute top-0 animate-[scan_3s_linear_infinite] shadow-[0_0_10px_var(--color-primary)]" />
              
              {/* Corner brackets */}
              <div className="absolute top-8 left-8 w-8 h-8 border-t-2 border-l-2 border-primary/50" />
              <div className="absolute top-8 right-8 w-8 h-8 border-t-2 border-r-2 border-primary/50" />
              <div className="absolute bottom-8 left-8 w-8 h-8 border-b-2 border-l-2 border-primary/50" />
              <div className="absolute bottom-8 right-8 w-8 h-8 border-b-2 border-r-2 border-primary/50" />
            </div>
          )}

          {/* Feedback Toast Overlay */}
          <AnimatePresence>
            {feedback && (
              <motion.div 
                initial={{ opacity: 0, y: 20, x: "-50%" }}
                animate={{ opacity: 1, y: 0, x: "-50%" }}
                exit={{ opacity: 0, y: -20, x: "-50%" }}
                className={`absolute bottom-24 left-1/2 px-6 py-3 rounded-full backdrop-blur-md border ${
                  feedback.status === 'good' ? 'bg-green-500/20 border-green-500/50 text-green-200' :
                  feedback.status === 'warning' ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-200' :
                  'bg-red-500/20 border-red-500/50 text-red-200'
                } font-medium flex items-center gap-2 shadow-lg`}
              >
                {feedback.status === 'good' ? <Sparkles className="w-4 h-4" /> : <Loader2 className="w-4 h-4 animate-spin" />}
                <span className="font-mono text-sm uppercase mr-2">{feedback.metric}:</span>
                {feedback.message}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Controls Bar */}
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/90 to-transparent flex items-center justify-center gap-4">
            <Button
              variant={micOn ? "secondary" : "destructive"}
              size="icon"
              className="rounded-full w-12 h-12"
              onClick={() => setMicOn(!micOn)}
            >
              {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </Button>
            
            <Button
              variant={isActive ? "destructive" : "default"}
              size="lg"
              className={`rounded-full px-8 font-semibold shadow-[0_0_20px_rgba(0,240,255,0.3)] ${isActive ? 'bg-red-500 hover:bg-red-600 shadow-red-500/30' : 'bg-primary hover:bg-primary/90 text-primary-foreground'}`}
              onClick={() => setIsActive(!isActive)}
            >
              {isActive ? (
                <><Square className="w-4 h-4 mr-2 fill-current" /> End Session</>
              ) : (
                <><Play className="w-4 h-4 mr-2 fill-current" /> Start Session</>
              )}
            </Button>

            <Button
              variant={camOn ? "secondary" : "destructive"}
              size="icon"
              className="rounded-full w-12 h-12"
              onClick={() => setCamOn(!camOn)}
            >
              {camOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Right Column - Analytics & Transcript */}
      <div className="flex flex-col gap-6 h-full">
        {/* Live Metrics */}
        <div className="grid grid-cols-2 gap-4">
           <Card className="bg-card/40 backdrop-blur-md border-white/5 p-4 flex flex-col items-center">
             <span className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Confidence</span>
             <span className="text-3xl font-bold text-primary font-mono">87%</span>
           </Card>
           <Card className="bg-card/40 backdrop-blur-md border-white/5 p-4 flex flex-col items-center">
             <span className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Clarity</span>
             <span className="text-3xl font-bold text-secondary font-mono">92%</span>
           </Card>
        </div>

        {/* Transcript Log */}
        <Card className="flex-1 bg-card/40 backdrop-blur-md border-white/5 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-white/5 bg-white/5">
            <h3 className="font-heading font-semibold flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Live Transcript
            </h3>
          </div>
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {transcript.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'ai' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                    msg.role === 'ai' 
                      ? 'bg-white/10 text-white rounded-tl-none' 
                      : 'bg-primary/20 text-primary-foreground border border-primary/20 rounded-tr-none'
                  }`}>
                    {msg.role === 'ai' && <p className="text-[10px] text-muted-foreground mb-1 font-mono">AI_INTERVIEWER_BOT</p>}
                    {msg.text}
                  </div>
                </div>
              ))}
              {isActive && (
                <div className="flex justify-end">
                  <div className="max-w-[85%] p-3 rounded-2xl bg-primary/10 border border-primary/10 rounded-tr-none">
                     <div className="flex gap-1">
                       <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce" />
                       <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce [animation-delay:0.2s]" />
                       <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce [animation-delay:0.4s]" />
                     </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </Card>
      </div>
    </div>
  );
}