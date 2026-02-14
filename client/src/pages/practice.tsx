import { useState, useEffect, useRef, useCallback } from "react";
import Webcam from "react-webcam";
import { 
  Mic, MicOff, Video, VideoOff, Play, Square, Loader2, Sparkles, 
  Settings2, RotateCw, ArrowLeft, Pause, Save, Clock, BookOpen, 
  History, AlertTriangle, CheckCircle, X, Maximize2, Minimize2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import InterviewTimer from "@/components/interview-timer";
import DifficultySelector, { Difficulty as SelectorDifficulty, QuestionType as SelectorQuestionType } from "@/components/difficulty-selector";
import ConfidenceScore from "@/components/confidence-score";
import AnswerStructureAnalyzer from "@/components/answer-structure-analyzer";
import InterviewReplay from "@/components/interview-replay";
import RealTimeFeedback from "@/components/real-time-feedback";
import PracticeSetup from "@/components/practice-setup";
import { useLocation } from "wouter";
import { useAuthState } from "@/contexts/AuthStateContext";
import { generateQuestions, type QuestionType, type Difficulty } from "@/data/complete-questions-data";

const MOCK_TRANSCRIPT = [
  { role: "ai", text: "Hello! I'm your AI interviewer today. Let's start with the question on your screen." },
  { role: "user", text: "Sure, I'm ready to begin..." },
];

// Types
type Feedback = {
  metric: string;
  status: 'good' | 'warning' | 'bad';
  message: string;
};

type Session = {
  id: string;
  duration: number;
  date: string;
  notes: string;
};

type SetupData = {
  selectedDomain: string;
  experienceLevel: string;
  difficulty: string;
  questionType: string;
};

// Confirmation Modal Component
const ConfirmationModal = ({ 
  isOpen, 
  onConfirm, 
  onCancel, 
  title, 
  message 
}: { 
  isOpen: boolean; 
  onConfirm: () => void; 
  onCancel: () => void; 
  title: string; 
  message: string; 
}) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full border border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="w-6 h-6 text-yellow-500" />
          <h3 className="text-xl font-semibold">{title}</h3>
        </div>
        <p className="text-gray-300 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Confirm
          </Button>
        </div>
      </div>
    </div>
  );
};

export default function Practice() {
  const [, setLocation] = useLocation();
  const { isLoggedIn } = useAuthState();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoggedIn) {
      setLocation('/login');
    }
  }, [isLoggedIn, setLocation]);
  
  // Don't render if not logged in
  if (!isLoggedIn) {
    return null;
  }

  // State management for setup flow
  const [startInterview, setStartInterview] = useState(false);
  const [setupData, setSetupData] = useState<SetupData | null>(null);
  const [generatedQuestions, setGeneratedQuestions] = useState<string[]>([]);
  
  // Handle setup submission
  const handleSetupSubmit = (data: SetupData) => {
    setSetupData(data);
    
    // Generate questions based on user selections
    const questions = generateQuestions(
      data.selectedDomain,
      data.questionType as QuestionType,
      data.difficulty as Difficulty,
      20 // Generate 20 questions
    );
    
    setGeneratedQuestions(questions);
    setStartInterview(true);
  };

  // Reset to setup
  const handleBackToSetup = () => {
    setStartInterview(false);
    setSetupData(null);
    setGeneratedQuestions([]);
    setCurrentQuestionIndex(0);
    setIsActive(false);
    setIsPaused(false);
    setElapsedTime(0);
  };

  // Original session state
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [camReady, setCamReady] = useState(false);
  const [camError, setCamError] = useState<string | null>(null);
  const [camInstanceKey, setCamInstanceKey] = useState(0);
  const [showConfirmEnd, setShowConfirmEnd] = useState(false);
  const [notes, setNotes] = useState("");
  const [showNotes, setShowNotes] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [autoSave, setAutoSave] = useState<boolean>(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  interface SessionRef {
    startTime: number | null;
    totalPausedTime: number;
    lastResumeTime: number | null;
  }

  const sessionRef = useRef<SessionRef>({
    startTime: null,
    totalPausedTime: 0,
    lastResumeTime: null
  });
  
  const notesRef = useRef<HTMLTextAreaElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);

  // Question state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [transcript, setTranscript] = useState(MOCK_TRANSCRIPT);
  const [pressureMode, setPressureMode] = useState(false);
  const [showSettings, setShowSettings] = useState(true);
  const [showReplay, setShowReplay] = useState(false);
  const [feedback, setFeedback] = useState<{metric: string, status: 'good' | 'warning' | 'bad', message: string} | null>(null);

  // Get current question
  const currentQuestion = generatedQuestions[currentQuestionIndex] || "Loading question...";

  // Format time in HH:MM:SS
  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Save progress to localStorage
  const saveProgress = useCallback(() => {
    const sessionData = {
      id: Date.now().toString(),
      duration: elapsedTime,
      date: new Date().toISOString(),
      notes: notes
    };
    
    const updatedSessions = [sessionData, ...sessions].slice(0, 10);
    setSessions(updatedSessions);
    localStorage.setItem('sessionHistory', JSON.stringify(updatedSessions));
    localStorage.setItem('sessionNotes', notes);
    setLastSaved(new Date());
  }, [notes, elapsedTime, sessions]);

  // Session control functions
  const handleStartSession = useCallback(() => {
    sessionRef.current = {
      startTime: Date.now(),
      totalPausedTime: 0,
      lastResumeTime: Date.now()
    };
    setIsActive(true);
    setIsPaused(false);
    setTranscript(MOCK_TRANSCRIPT);
  }, []);

  const handlePauseSession = useCallback(() => {
    if (isActive && !isPaused) {
      setIsPaused(true);
      if (sessionRef.current.lastResumeTime) {
        const now = Date.now();
        const pauseDuration = now - sessionRef.current.lastResumeTime;
        sessionRef.current.totalPausedTime += pauseDuration;
      }
    }
  }, [isActive, isPaused]);

  const handleResumeSession = useCallback(() => {
    if (isActive && isPaused) {
      setIsPaused(false);
      sessionRef.current.lastResumeTime = Date.now();
    }
  }, [isActive, isPaused]);

  const handleEndSession = useCallback(() => {
    saveProgress();
    setIsActive(false);
    setIsPaused(false);
    setElapsedTime(0);
    sessionRef.current = { startTime: null, totalPausedTime: 0, lastResumeTime: null };
    setShowReplay(true);
  }, [saveProgress]);

  const handleResetSession = useCallback(() => {
    if (window.confirm('Are you sure you want to reset the session? This cannot be undone.')) {
      setIsActive(false);
      setIsPaused(false);
      setElapsedTime(0);
      sessionRef.current = { startTime: null, totalPausedTime: 0, lastResumeTime: null };
      setNotes('');
      localStorage.removeItem('sessionNotes');
    }
  }, []);

  const handleBack = useCallback(() => {
    if (startInterview) {
      if (isActive || notes.trim() !== '') {
        setShowConfirmEnd(true);
      } else {
        handleBackToSetup();
      }
    } else {
      setLocation("/");
    }
  }, [startInterview, isActive, notes, setLocation]);

  const handleToggleCamera = useCallback(() => {
    setCamOn((prev) => {
      const next = !prev;
      if (next) {
        setCamError(null);
        setCamReady(false);
        setCamInstanceKey((k) => k + 1);
      }
      return next;
    });
  }, []);

  // Next question
  const handleNextQuestion = useCallback(() => {
    if (currentQuestionIndex < generatedQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  }, [currentQuestionIndex, generatedQuestions.length]);

  // Previous question
  const handlePreviousQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  }, [currentQuestionIndex]);

  // Load saved data on mount and reset interview state
  useEffect(() => {
    const savedNotes = localStorage.getItem('sessionNotes');
    const savedSessions = localStorage.getItem('sessionHistory');
    if (savedNotes) setNotes(savedNotes);
    if (savedSessions) setSessions(JSON.parse(savedSessions));
    
    // Reset interview state to ensure setup page shows first
    setStartInterview(false);
    setSetupData(null);
    setGeneratedQuestions([]);
    setCurrentQuestionIndex(0);
    setIsActive(false);
    setIsPaused(false);
    setElapsedTime(0);
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle play/pause with spacebar (when not typing in notes)
      if (e.code === 'Space' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        if (isActive) {
          if (isPaused) handleResumeSession();
          else handlePauseSession();
        } else {
          handleStartSession();
        }
      }
      
      // Toggle notes with 'n' key
      if (e.code === 'KeyN' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setShowNotes(!showNotes);
        if (!showNotes && notesRef.current) {
          setTimeout(() => notesRef.current?.focus(), 100);
        }
      }
      
      // Save with Ctrl+S
      if ((e.ctrlKey || e.metaKey) && e.code === 'KeyS') {
        e.preventDefault();
        saveProgress();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, isPaused, showNotes, saveProgress]);

  // Timer logic
  useEffect(() => {
    if (isActive && !isPaused) {
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => {
          const now = Date.now();
          const start = sessionRef.current.startTime || now;
          const pausedTime = sessionRef.current.totalPausedTime;
          const currentElapsed = now - start - pausedTime;
          
          // Auto-save progress every minute
          if (autoSave && currentElapsed % 60000 < 100) {
            saveProgress();
          }
          
          return Math.floor(currentElapsed / 1000);
        });
      }, 100);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isActive, isPaused, autoSave, saveProgress]);
  
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(console.log);
      setIsFullscreen(true);
    } else if (document.exitFullscreen) {
      document.exitFullscreen().catch(console.log);
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [transcript]);

  useEffect(() => {
    if (!isActive) return;
    setTranscript((prev) => {
      const last = prev[prev.length - 1];
      const nextText = `Question: "${currentQuestion}"`;
      if (last?.role === "ai" && last?.text === nextText) return prev;
      return [...prev, { role: "ai", text: nextText }];
    });
  }, [currentQuestion, isActive]);

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

  // Show setup page if interview hasn't started
  if (!startInterview) {
    return <PracticeSetup onSubmit={handleSetupSubmit} />;
  }

  // Show camera interview page
  return (
    <div className="h-[calc(100vh-2rem)] p-6 gap-6 flex flex-col max-w-[1600px] mx-auto overflow-y-auto">
      <RealTimeFeedback isActive={isActive} />
      <InterviewReplay isOpen={showReplay} onClose={() => setShowReplay(false)} />
      
      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        <div className="lg:col-span-2 space-y-4">
          {/* Session Header */}
          <Card className="p-6 bg-card/60 backdrop-blur-md border-primary/20 shadow-[0_0_30px_rgba(0,0,0,0.3)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
            
            {/* Header with timer and controls */}
            <div className="flex flex-col space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-muted-foreground text-sm font-mono uppercase tracking-wider">
                    {setupData?.selectedDomain} • {setupData?.questionType} • {setupData?.difficulty}
                  </h2>
                  <div className="flex items-center mt-1 space-x-2">
                    <div className="flex items-center text-sm text-primary bg-primary/10 px-2 py-0.5 rounded">
                      <Clock className="w-3.5 h-3.5 mr-1" />
                      {formatTime(elapsedTime)}
                    </div>
                    {lastSaved && (
                      <span className="text-xs text-muted-foreground">
                        Auto-saved {Math.round((Date.now() - lastSaved.getTime()) / 60000)}m ago
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowSettings((v) => !v)}
                    className="p-1.5 text-muted-foreground hover:text-white transition-colors rounded-full hover:bg-white/5"
                    title={showSettings ? "Hide settings" : "Show settings"}
                    aria-label={showSettings ? "Hide settings" : "Show settings"}
                  >
                    <Settings2 size={16} />
                  </button>
                  <button
                    onClick={toggleFullscreen}
                    className="p-1.5 text-muted-foreground hover:text-white transition-colors rounded-full hover:bg-white/5"
                    title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
                  >
                    {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                  </button>
                  <button
                    onClick={handleBack}
                    className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-lg transition-all flex items-center gap-2 text-xs"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Back to Setup</span>
                  </button>
                </div>
              </div>

              {/* Question */}
              <div className="space-y-2">
                <p className="text-xl font-medium font-heading leading-tight">
                  "{currentQuestion}"
                </p>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Question {currentQuestionIndex + 1} of {generatedQuestions.length}</span>
                  <div className="w-32 bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${((currentQuestionIndex + 1) / generatedQuestions.length) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-700 rounded-full h-1.5">
                <div 
                  className="bg-primary h-1.5 rounded-full transition-all duration-300" 
                  style={{ width: `${Math.min(100, (elapsedTime / 3600) * 100)}%` }}
                />
              </div>

              {/* Session Controls */}
              <div className="flex flex-wrap gap-2 pt-2">
                {!isActive ? (
                  <Button 
                    onClick={handleStartSession}
                    className="gap-1.5 bg-primary hover:bg-primary/90"
                  >
                    <Play className="w-4 h-4" />
                    Start Session
                  </Button>
                ) : isPaused ? (
                  <Button 
                    onClick={handleResumeSession}
                    className="gap-1.5 bg-green-600 hover:bg-green-700"
                  >
                    <Play className="w-4 h-4" />
                    Resume
                  </Button>
                ) : (
                  <Button 
                    onClick={handlePauseSession}
                    variant="outline"
                    className="gap-1.5"
                  >
                    <Pause className="w-4 h-4" />
                    Pause
                  </Button>
                )}

                {/* Question Navigation */}
                <div className="flex items-center gap-1">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handlePreviousQuestion}
                    disabled={currentQuestionIndex === 0}
                    className="border-white/10 hover:bg-white/5"
                  >
                    Previous
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleNextQuestion}
                    disabled={currentQuestionIndex === generatedQuestions.length - 1}
                    className="border-white/10 hover:bg-white/5"
                  >
                    Next
                  </Button>
                </div>

                <div className="flex-1" />

                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowNotes(!showNotes)}
                  className="gap-1.5 border-white/10 hover:bg-white/5"
                  title="Toggle Notes (Ctrl+N)"
                >
                  <BookOpen className="w-4 h-4" />
                  <span className="hidden sm:inline">Notes</span>
                </Button>

                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowHistory(!showHistory)}
                  className="gap-1.5 border-white/10 hover:bg-white/5"
                >
                  <History className="w-4 h-4" />
                  <span className="hidden sm:inline">History</span>
                </Button>

                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={saveProgress}
                  className="gap-1.5 border-white/10 hover:bg-white/5"
                  disabled={!isActive && !notes.trim()}
                  title="Save (Ctrl+S)"
                >
                  <Save className="w-4 h-4" />
                  <span className="hidden sm:inline">Save</span>
                </Button>

                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleResetSession}
                  className="gap-1.5 border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-400"
                >
                  <RotateCw className="w-4 h-4" />
                  <span className="hidden sm:inline">Reset</span>
                </Button>

                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => setShowConfirmEnd(true)}
                  className="gap-1.5"
                  disabled={!isActive}
                >
                  <Square className="w-4 h-4" />
                  <span className="hidden sm:inline">End Session</span>
                </Button>
              </div>
            </div>
          </Card>

          {/* Webcam Area */}
          <div className="relative rounded-2xl overflow-hidden bg-black border border-white/10 shadow-2xl group min-h-[400px]">
            {camOn ? (
              <Webcam 
                className="w-full h-full object-cover opacity-90"
                audio={false}
                mirrored
                key={camInstanceKey}
                videoConstraints={{ facingMode: "user" }}
                onUserMedia={() => {
                  setCamReady(true);
                  setCamError(null);
                }}
                onUserMediaError={(err) => {
                  const anyErr = err as unknown as { name?: string; message?: string };
                  setCamError(anyErr?.name || anyErr?.message || "Camera access was blocked");
                  setCamReady(false);
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-zinc-900 min-h-[400px]">
                <VideoOff className="w-16 h-16 text-zinc-700" />
              </div>
            )}

            {camOn && !camReady && !camError && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <div className="flex items-center gap-2 text-sm text-white/80">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Starting camera…
                </div>
              </div>
            )}

            {camOn && camError && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 p-6">
                <div className="max-w-md w-full rounded-xl border border-white/10 bg-zinc-900/80 backdrop-blur p-4 text-center">
                  <div className="text-sm font-medium text-white mb-1">Camera not available</div>
                  <div className="text-xs text-white/70 mb-3">{camError}</div>
                  <div className="text-xs text-white/60 mb-4">
                    Allow camera permission for this site (browser address bar) and try again.
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-white/10 hover:bg-white/5"
                    onClick={() => {
                      setCamError(null);
                      setCamReady(false);
                      setCamInstanceKey((k) => k + 1);
                    }}
                  >
                    Retry
                  </Button>
                </div>
              </div>
            )}

            {/* Overlay Graphics */}
            {isActive && camOn && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 border border-primary/30 rounded-[50%] opacity-50" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-primary opacity-50">+</div>
                
                {/* Scanline */}
                <div className="w-full h-[2px] bg-primary/50 absolute top-0 animate-[scan_3s_linear_infinite] shadow-[0_0_10px_var(--color-primary)]" />
                
                {/* Corner brackets */}
                <div className="absolute top-8 left-8 w-12 h-12 border-t-2 border-l-2 border-primary/50" />
                <div className="absolute top-8 right-8 w-12 h-12 border-t-2 border-r-2 border-primary/50" />
                <div className="absolute bottom-8 left-8 w-12 h-12 border-b-2 border-l-2 border-primary/50" />
                <div className="absolute bottom-8 right-8 w-12 h-12 border-b-2 border-r-2 border-primary/50" />
              </div>
            )}

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
                onClick={handleToggleCamera}
                data-testid="button-camera"
              >
                {camOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* Transcript */}
          <Card className="bg-card/40 backdrop-blur-md border-white/5 h-64 md:h-72">
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
                <div ref={transcriptEndRef} />
              </div>
            </ScrollArea>
          </Card>

          {/* Notes Panel */}
          {showNotes && (
            <Card className="bg-gray-900/50 border-white/5">
              <div className="p-4 border-b border-white/5">
                <div className="flex items-center justify-between">
                  <h3 className="flex items-center gap-2 font-medium">
                    <BookOpen className="w-4 h-4 text-blue-400" />
                    Session Notes
                  </h3>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={autoSave} 
                        onChange={(e) => setAutoSave(e.target.checked)} 
                        className="rounded border-gray-600 bg-gray-700"
                      />
                      Auto-save
                    </label>
                    {lastSaved && (
                      <span className="text-xs text-muted-foreground">
                        Last saved: {lastSaved.toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="p-4 pt-0">
                <textarea
                  ref={notesRef}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Type your notes here... (Supports Markdown)"
                  className="w-full h-40 p-3 bg-gray-800/50 border border-gray-700 rounded-md text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent resize-none"
                />
                <div className="mt-2 flex justify-between items-center text-xs text-muted-foreground">
                  <span>Press Ctrl+S to save manually</span>
                  <span>{notes.length} characters</span>
                </div>
              </div>
            </Card>
          )}

          {/* Session History */}
          {showHistory && (
            <Card className="bg-gray-900/50 border-white/5">
              <div className="p-4 border-b border-white/5">
                <h3 className="flex items-center gap-2 font-medium">
                  <History className="w-4 h-4 text-purple-400" />
                  Session History
                </h3>
              </div>
              <div className="p-4">
                {sessions.length > 0 ? (
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                    {sessions.map((session) => (
                      <div key={session.id} className="p-3 bg-gray-800/50 rounded-md border border-gray-700/50">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-sm">
                            {new Date(session.date).toLocaleDateString()}
                          </span>
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                            {formatTime(session.duration)}
                          </span>
                        </div>
                        {session.notes && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {session.notes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground text-sm">
                    <p>No previous sessions found</p>
                    <p className="text-xs mt-1">Your session history will appear here</p>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4">
          {/* Timer */}
          <InterviewTimer isActive={isActive} pressureMode={pressureMode} />
          
          {/* AI Feedback Panel */}
          <Card className="bg-gray-900/50 border-white/5">
            <div className="p-4 border-b border-white/5">
              <h3 className="flex items-center gap-2 font-medium">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                AI Feedback
              </h3>
            </div>
            <div className="p-4 space-y-4">
              {feedback ? (
                <div className={`p-3 rounded-md ${
                  feedback.status === 'good' ? 'bg-green-900/30 border border-green-800/50' :
                  feedback.status === 'warning' ? 'bg-yellow-900/30 border border-yellow-800/50' :
                  'bg-red-900/30 border border-red-800/50'
                }`}>
                  <div className="flex items-start gap-2">
                    {feedback.status === 'good' ? (
                      <CheckCircle className="w-4 h-4 mt-0.5 text-green-400 flex-shrink-0" />
                    ) : feedback.status === 'warning' ? (
                      <AlertTriangle className="w-4 h-4 mt-0.5 text-yellow-400 flex-shrink-0" />
                    ) : (
                      <X className="w-4 h-4 mt-0.5 text-red-400 flex-shrink-0" />
                    )}
                    <div>
                      <div className="font-medium text-sm">{feedback.metric}</div>
                      <div className="text-xs text-muted-foreground mt-1">{feedback.message}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground text-sm py-4">
                  <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>AI feedback will appear here during your session</p>
                </div>
              )}
            </div>
          </Card>

          {/* Question Progress */}
          <Card className="bg-gray-900/50 border-white/5">
            <div className="p-4 border-b border-white/5">
              <h3 className="flex items-center gap-2 font-medium">
                <BookOpen className="w-4 h-4 text-blue-400" />
                Question Progress
              </h3>
            </div>
            <div className="p-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{currentQuestionIndex + 1}/{generatedQuestions.length}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${((currentQuestionIndex + 1) / generatedQuestions.length) * 100}%` }}
                  />
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  {generatedQuestions.length - currentQuestionIndex - 1} questions remaining
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmEnd}
        title="End Practice Session"
        message="Are you sure you want to end this practice session? Your progress will be saved."
        onConfirm={() => {
          setShowConfirmEnd(false);
          handleEndSession();
        }}
        onCancel={() => setShowConfirmEnd(false)}
      />
    </div>
  );
}
