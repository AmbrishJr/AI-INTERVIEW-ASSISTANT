import { useState, useEffect } from "react";
import Webcam from "react-webcam";
import { Mic, MicOff, Video, VideoOff, Play, Square, Loader2, Sparkles, Settings2, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import InterviewTimer from "@/components/interview-timer";
import DifficultySelector, { Difficulty, QuestionType } from "@/components/difficulty-selector";
import ConfidenceScore from "@/components/confidence-score";
import AnswerStructureAnalyzer from "@/components/answer-structure-analyzer";
import InterviewReplay from "@/components/interview-replay";
import RealTimeFeedback from "@/components/real-time-feedback";

const QUESTIONS = {
  easy: {
    behavioral: [
      "Tell me about yourself and your background.",
      "Describe a time you worked in a team.",
      "What are your strengths?"
    ],
    technical: [
      "Explain what an API is.",
      "What is the difference between SQL and NoSQL?",
      "How do you debug code?"
    ],
    hr: [
      "Why do you want to work here?",
      "Where do you see yourself in 5 years?",
      "What motivates you?"
    ]
  },
  medium: {
    behavioral: [
      "Tell me about a time you overcame a major challenge.",
      "Describe a situation where you had to deal with conflicting priorities.",
      "Give an example of when you showed leadership."
    ],
    technical: [
      "Design a system to handle high traffic.",
      "Explain the difference between REST and GraphQL.",
      "How would you optimize a slow database query?"
    ],
    hr: [
      "How do you handle feedback?",
      "Describe your ideal work environment.",
      "Tell me about a time you failed."
    ]
  },
  hard: {
    behavioral: [
      "Tell me about your most complex project and your role in it.",
      "Describe a time you had to make a difficult decision with incomplete information.",
      "Give an example of when you had to adapt your approach mid-project."
    ],
    technical: [
      "Design a distributed system architecture for a social media platform.",
      "How would you build a real-time collaborative editor?",
      "Explain how you would scale a microservices architecture."
    ],
    hr: [
      "How do you balance innovation with shipping products?",
      "Tell me about a time you changed someone's mind.",
      "Describe your approach to mentoring junior developers."
    ]
  }
};

const MOCK_TRANSCRIPT = [
  { role: "ai", text: "Hello! I'm your AI interviewer today. Let's start with the question on your screen." },
  { role: "user", text: "Sure, I'm ready to begin..." },
];

export default function Session() {
  const [isActive, setIsActive] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [transcript, setTranscript] = useState(MOCK_TRANSCRIPT);
  const [pressureMode, setPressureMode] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [questionType, setQuestionType] = useState<QuestionType>("behavioral");
  const [showSettings, setShowSettings] = useState(true);
  const [showReplay, setShowReplay] = useState(false);
  const [feedback, setFeedback] = useState<{metric: string, status: 'good' | 'warning' | 'bad', message: string} | null>(null);

  // Get questions based on difficulty and type
  const questions = QUESTIONS[difficulty][questionType];
  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    if (isActive) {
      const interval = setInterval(() => {
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

  const handleStartSession = () => {
    setIsActive(true);
    setShowSettings(false);
  };

  const handleEndSession = () => {
    setIsActive(false);
    setShowReplay(true);
  };

  return (
    <div className="h-[calc(100vh-2rem)] p-6 gap-6 flex flex-col max-w-[1600px] mx-auto overflow-hidden">
      <RealTimeFeedback isActive={isActive} />
      <InterviewReplay isOpen={showReplay} onClose={() => setShowReplay(false)} />
      
      {/* Top Bar - Timer & Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        <div className="lg:col-span-2">
          <Card className="p-6 bg-card/60 backdrop-blur-md border-primary/20 shadow-[0_0_30px_rgba(0,0,0,0.3)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
            <h2 className="text-muted-foreground text-sm font-mono mb-2 uppercase tracking-wider">
              {difficulty.toUpperCase()} • {questionType.toUpperCase()}
            </h2>
            <p className="text-2xl font-medium font-heading leading-tight">
              "{currentQuestion}"
            </p>
            <div className="flex gap-2 mt-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentQuestionIndex((p) => (p + 1) % questions.length)}
                className="text-xs ml-auto border-white/10 hover:bg-white/5"
                data-testid="button-skip-question"
              >
                Skip Question
              </Button>
            </div>
          </Card>
        </div>

        {/* Timer */}
        <InterviewTimer isActive={isActive} pressureMode={pressureMode} />
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
        
        {/* Left Column - Main Interaction */}
        <div className="lg:col-span-2 flex flex-col gap-6 overflow-hidden">
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

            {/* Overlay Graphics */}
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

            {/* Feedback Toast */}
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
                data-testid="button-mic"
              >
                {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </Button>
              
              <Button
                variant={isActive ? "destructive" : "default"}
                size="lg"
                className={`rounded-full px-8 font-semibold shadow-[0_0_20px_rgba(0,240,255,0.3)] ${isActive ? 'bg-red-500 hover:bg-red-600 shadow-red-500/30' : 'bg-primary hover:bg-primary/90 text-primary-foreground'}`}
                onClick={() => isActive ? handleEndSession() : handleStartSession()}
                data-testid="button-session-control"
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
                data-testid="button-camera"
              >
                {camOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* Transcript */}
          <Card className="bg-card/40 backdrop-blur-md border-white/5 h-40">
            <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
              <h3 className="font-heading font-semibold flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                Live Transcript
              </h3>
            </div>
            <ScrollArea className="p-4 h-[calc(100%-60px)]">
              <div className="space-y-4">
                {transcript.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'ai' ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                      msg.role === 'ai' 
                        ? 'bg-white/10 text-white rounded-tl-none' 
                        : 'bg-primary/20 text-primary-foreground border border-primary/20 rounded-tr-none'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </Card>
        </div>

        {/* Right Column - Analytics & Controls */}
        <div className="flex flex-col gap-6 overflow-y-auto">
          {/* Settings / Analytics Toggle */}
          <Tabs defaultValue={showSettings ? "settings" : "analytics"} onValueChange={(v) => setShowSettings(v === "settings")}>
            <TabsList className="grid w-full grid-cols-2 bg-white/5 border-white/10">
              <TabsTrigger value="settings" data-testid="tab-settings">
                <Settings2 className="w-4 h-4 mr-2" />
                Setup
              </TabsTrigger>
              <TabsTrigger value="analytics" data-testid="tab-analytics">
                📊 Analytics
              </TabsTrigger>
            </TabsList>

            {/* Settings Panel */}
            <TabsContent value="settings" className="space-y-4 mt-4">
              <DifficultySelector
                difficulty={difficulty}
                questionType={questionType}
                onDifficultyChange={setDifficulty}
                onTypeChange={setQuestionType}
              />

              {/* Pressure Mode Toggle */}
              <Card className="bg-card/40 backdrop-blur-md border-white/5 p-6">
                <h3 className="text-sm font-mono text-muted-foreground uppercase tracking-wider mb-4">Pressure Mode</h3>
                <button
                  onClick={() => setPressureMode(!pressureMode)}
                  className={`w-full p-4 rounded-lg border-2 transition-all ${
                    pressureMode
                      ? "bg-red-500/10 border-red-500/50 text-red-200"
                      : "bg-white/5 border-white/10 text-muted-foreground hover:border-white/20"
                  }`}
                  data-testid="button-pressure-mode"
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded border-2 ${pressureMode ? "bg-red-500 border-red-500" : "border-white/20"}`} />
                    <span className="font-semibold">{pressureMode ? "🔴 ON - No Pause Allowed" : "⚪ OFF - Standard Mode"}</span>
                  </div>
                  <p className="text-xs mt-2 text-left">{pressureMode ? "Realistic interview conditions" : "Enable for challenging practice"}</p>
                </button>
              </Card>

              {/* Replay Session */}
              {!isActive && (
                <Button
                  onClick={() => setShowReplay(true)}
                  className="w-full bg-gradient-to-r from-secondary to-primary hover:opacity-90 text-white font-semibold"
                  data-testid="button-replay-session"
                >
                  <RotateCw className="w-4 h-4 mr-2" />
                  Review Session Replay
                </Button>
              )}
            </TabsContent>

            {/* Analytics Panel */}
            <TabsContent value="analytics" className="space-y-4 mt-4">
              <ConfidenceScore isActive={isActive} />
              <AnswerStructureAnalyzer isActive={isActive} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}