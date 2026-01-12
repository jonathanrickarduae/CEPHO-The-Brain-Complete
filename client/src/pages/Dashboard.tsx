import { useState, useMemo, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { 
  Sun, Users, Lock, 
  Mic, Send, 
  Fingerprint, Shield, ShieldCheck, FolderKanban, BookOpen, Brain, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LearningBadge } from "@/components/LearningIndicator";
import { StreakBadge, useStreak } from "@/components/DailyStreak";
import { Tooltip } from "@/components/Tooltip";
import { useMoodCheck } from "@/hooks/useMoodCheck";
import { WellnessScoreDashboard } from "@/components/WellnessScoreDashboard";
import { Share2 } from "lucide-react";
import { MobileInputSheet, QuickInputTrigger } from "@/components/MobileInputSheet";
import { useIsMobile } from "@/hooks/useMobile";
import { PullToRefresh } from "@/components/PullToRefresh";
import { GettingStartedChecklist, useOnboardingStatus } from "@/components/GettingStartedChecklist";
import { InsightsPanel, InlineNudge, useNudgeEngine } from "@/components/IntelligentNudges";
import { VoiceInterfaceToggle } from "@/components/VoiceInterfaceToggle";
import { FloatingVoiceNoteButton } from "@/components/VoiceNotepad";
import { PerformanceBoost } from "@/components/PerformanceBoost";
import { TwinBreakApproval } from "@/components/TwinBreakApproval";
import { TourPrompt } from '@/components/TourAndDemoMode';
import { NeuralNetworkViz } from '@/components/NeuralNetworkViz';
import { isDemoModeEnabled, getDemoData, initializeDemoModeIfNeeded } from "@/services/demoMode";

// Daily rotating quotes - one for each day
const QUOTES = [
  { quote: "The best way to predict the future is to create it.", author: "Peter Drucker" },
  { quote: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { quote: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { quote: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs" },
  { quote: "Your time is limited, don't waste it living someone else's life.", author: "Steve Jobs" },
  { quote: "The greatest glory in living lies not in never falling, but in rising every time we fall.", author: "Nelson Mandela" },
  { quote: "In the middle of difficulty lies opportunity.", author: "Albert Einstein" },
  { quote: "It is during our darkest moments that we must focus to see the light.", author: "Aristotle" },
  { quote: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { quote: "Do not go where the path may lead, go instead where there is no path and leave a trail.", author: "Ralph Waldo Emerson" },
  { quote: "The only impossible journey is the one you never begin.", author: "Tony Robbins" },
  { quote: "Act as if what you do makes a difference. It does.", author: "William James" },
  { quote: "What you get by achieving your goals is not as important as what you become by achieving your goals.", author: "Zig Ziglar" },
  { quote: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { quote: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { quote: "I have not failed. I've just found 10,000 ways that won't work.", author: "Thomas Edison" },
  { quote: "Everything you've ever wanted is on the other side of fear.", author: "George Addair" },
  { quote: "The mind is everything. What you think you become.", author: "Buddha" },
  { quote: "Strive not to be a success, but rather to be of value.", author: "Albert Einstein" },
  { quote: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
  { quote: "Your limitation—it's only your imagination.", author: "Unknown" },
  { quote: "Push yourself, because no one else is going to do it for you.", author: "Unknown" },
  { quote: "Great things never come from comfort zones.", author: "Unknown" },
  { quote: "Dream it. Wish it. Do it.", author: "Unknown" },
  { quote: "Success doesn't just find you. You have to go out and get it.", author: "Unknown" },
  { quote: "The harder you work for something, the greater you'll feel when you achieve it.", author: "Unknown" },
  { quote: "Don't stop when you're tired. Stop when you're done.", author: "Unknown" },
  { quote: "Wake up with determination. Go to bed with satisfaction.", author: "Unknown" },
  { quote: "Do something today that your future self will thank you for.", author: "Sean Patrick Flanery" },
  { quote: "Little things make big days.", author: "Unknown" },
  { quote: "It's going to be hard, but hard does not mean impossible.", author: "Unknown" },
];

// Get quote based on day of year for daily rotation
function getDailyQuote() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  return QUOTES[dayOfYear % QUOTES.length];
}

export default function Dashboard() {
  const [, setLocation] = useLocation();
  // Governance State
  const [governanceMode, setGovernanceMode] = useState<"omni" | "governed">("omni");
  const [inputValue, setInputValue] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Tap-to-toggle voice recording
  const toggleRecording = async () => {
    if (isRecording) {
      // Stop recording
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      setIsRecording(false);
      setRecordingDuration(0);
    } else {
      // Start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        const chunks: Blob[] = [];
        
        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunks.push(e.data);
        };
        
        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'audio/webm' });
          stream.getTracks().forEach(track => track.stop());
          // In production: send blob to Whisper API for transcription
          console.log('Recording complete, ready for transcription', blob);
        };
        
        mediaRecorder.start();
        setIsRecording(true);
        setRecordingDuration(0);
        recordingTimerRef.current = setInterval(() => {
          setRecordingDuration(d => d + 1);
        }, 1000);
      } catch (err) {
        console.error('Microphone access denied:', err);
      }
    }
  };
  
  // Mood tracking
  const { todaysMoods } = useMoodCheck();
  
  // Daily streak tracking - only show, don't auto-mark on load
  const { current: streakDays } = useStreak();
  
  // Demo mode initialization
  useEffect(() => {
    initializeDemoModeIfNeeded();
  }, []);
  
  // Get demo data if in demo mode
  const demoData = isDemoModeEnabled() ? getDemoData() : null;
  const activeProjects = demoData?.projects.filter(p => p.status === 'active').length || 0;
  const pendingTasks = demoData?.tasks.filter(t => t.status === 'pending').length || 0;
  const latestMood = todaysMoods.length > 0 ? todaysMoods[todaysMoods.length - 1] : null;
  
  // Mobile detection and bottom sheet
  const isMobile = useIsMobile();
  const [showMobileInput, setShowMobileInput] = useState(false);
  
  const handleMobileSubmit = (value: string, type?: 'task' | 'question' | 'note') => {
    // Navigate to Digital Twin with the message
    setLocation(`/digital-twin?message=${encodeURIComponent(value)}`);
  };

  // Daily rotating inspiration - memoized to only change on day change
  const inspiration = useMemo(() => getDailyQuote(), []);

  // Top Row - The Flow (Daily Brief → AI Expert Engine → Workflow)
  // Bottom Row - Support (Digital Twin Training, Library, Vault)
  const buttons = [
    // TOP ROW - The Flow
    { 
      id: 1, 
      label: "DAILY BRIEF", 
      sub: "Briefing & Actions", 
      icon: Sun, 
      color: "#f59e0b",
      path: "/daily-brief",
      tooltip: "Start your day here! Get personalized briefings, action items, and intelligence updates."
    },
    { 
      id: 2, 
      label: "AI EXPERT ENGINE", 
      sub: "287 Experts Ready", 
      icon: Users, 
      color: "#06b6d4",
      path: "/ai-experts",
      tooltip: "Access 287+ AI specialists. Assemble expert teams for any project or challenge."
    },
    { 
      id: 3, 
      label: "WORKFLOW", 
      sub: activeProjects > 0 ? `${activeProjects} Active Projects` : "6 Active Projects", 
      icon: FolderKanban, 
      color: "#10b981",
      path: "/workflow",
      tooltip: "Track all your projects in one place. See status, blockers, and delivery timelines."
    },
    // BOTTOM ROW - Support
    { 
      id: 4, 
      label: "DIGITAL TWIN", 
      sub: "12.5h Training", 
      icon: Fingerprint, 
      color: "#a855f7",
      path: "/digital-twin",
      badge: <LearningBadge className="absolute top-2 right-2" />,
      tooltip: "Your AI counterpart that learns from you. Train it to handle tasks autonomously."
    },
    { 
      id: 5, 
      label: "LIBRARY", 
      sub: "Knowledge Base", 
      icon: BookOpen, 
      color: "#ec4899",
      path: "/library",
      tooltip: "Your knowledge repository. Store documents, AI images, charts, and project files."
    },
    { 
      id: 6, 
      label: "THE VAULT", 
      sub: "Secure Storage", 
      icon: Lock, 
      color: "#64748b",
      tooltip: "Secure, encrypted storage for sensitive data. Connect integrations and manage security.",
      path: "/vault"
    },
  ];

  const handleSubmit = () => {
    if (inputValue.trim()) {
      // Navigate to Digital Twin with the message
      setLocation(`/digital-twin?message=${encodeURIComponent(inputValue)}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleRefresh = async () => {
    // Simulate data refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    // In production, this would refetch dashboard data
  };

  return (
    <>
    <PullToRefresh onRefresh={handleRefresh} disabled={!isMobile}>
    <div className="h-full flex flex-col p-3 sm:p-4 md:p-6 overflow-y-auto md:overflow-hidden">
      
      {/* Quick Action Input - Manus Style - Front and Center */}
      <div className="max-w-3xl mx-auto w-full mb-6">
        {isMobile ? (
          /* Mobile: Tap to open bottom sheet */
          <QuickInputTrigger onClick={() => setShowMobileInput(true)} />
        ) : (
          /* Desktop: Full inline input */
          <>
            <div className="flex items-center gap-3 bg-card/80 border-2 border-primary/30 rounded-2xl px-4 py-4 focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/20 transition-all duration-300 shadow-lg shadow-primary/5">
              <input 
                type="text" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message Digital Twin..." 
                className="flex-1 bg-transparent border-none outline-none text-lg text-foreground placeholder:text-muted-foreground/50 min-h-0"
                autoFocus
              />
              <div className="flex items-center gap-2">
                <Button 
                  size="icon" 
                  variant="ghost" 
                  onClick={handleSubmit}
                  disabled={!inputValue.trim()}
                  className="h-10 w-10 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground disabled:opacity-50"
                >
                  <Send className="w-5 h-5" />
                </Button>
                <Button 
                  size="icon" 
                  onClick={toggleRecording}
                  className={`h-12 w-12 rounded-full transition-all hover:scale-105 ${
                    isRecording 
                      ? 'bg-red-500 hover:bg-red-600 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]' 
                      : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_rgba(255,16,240,0.3)]'
                  }`}
                >
                  <Mic className="w-6 h-6" />
                </Button>
              </div>
            </div>
            <p className="text-center text-xs text-muted-foreground/60 mt-2">
              Press <kbd className="px-1.5 py-0.5 bg-secondary/50 rounded text-[10px]">Enter</kbd> to send • <kbd className="px-1.5 py-0.5 bg-secondary/50 rounded text-[10px]">?</kbd> for shortcuts • <kbd className="px-1.5 py-0.5 bg-secondary/50 rounded text-[10px]">Cmd+K</kbd> command palette
            </p>
          </>
        )}
      </div>
      
      {/* Mobile Input Bottom Sheet */}
      <MobileInputSheet
        isOpen={showMobileInput}
        onClose={() => setShowMobileInput(false)}
        onSubmit={handleMobileSubmit}
        placeholder="What do you need?"
      />

      {/* Compact Header Row */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card/60 border border-border">
            <Shield className={`w-4 h-4 ${governanceMode === 'omni' ? 'text-purple-500' : 'text-blue-500'}`} />
            <span className="text-xs font-medium text-muted-foreground hidden sm:inline">PROTOCOL:</span>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setGovernanceMode("omni")}
                className={`px-2 py-0.5 rounded-full text-xs font-bold transition-all min-h-0 min-w-0 ${governanceMode === 'omni' ? 'bg-purple-500 text-white shadow-[0_0_10px_rgba(168,85,247,0.5)]' : 'text-muted-foreground hover:text-foreground'}`}
              >
                OMNI
              </button>
              <button 
                onClick={() => setGovernanceMode("governed")}
                className={`px-2 py-0.5 rounded-full text-xs font-bold transition-all min-h-0 min-w-0 ${governanceMode === 'governed' ? 'bg-blue-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'text-muted-foreground hover:text-foreground'}`}
              >
                GOVERNED
              </button>
            </div>
          </div>
          {governanceMode === 'governed' && (
            <Badge variant="outline" className="border-blue-500/50 text-blue-400 bg-blue-500/10 text-xs hidden md:flex">
              <ShieldCheck className="w-3 h-3 mr-1" /> COMPLIANCE
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          {/* Wellness Score Mini */}
          <button 
            onClick={() => setLocation('/statistics')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 hover:border-cyan-500/40 transition-colors"
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
              <span className="text-xs font-bold text-white">7.8</span>
            </div>
            <span className="text-xs text-muted-foreground hidden sm:inline">Wellness</span>
          </button>
          
          {/* Daily Streak Badge */}
          {streakDays > 0 && (
            <StreakBadge streak={streakDays} size="md" showLabel={true} />
          )}
          
          {/* Today's mood indicator */}
          {latestMood && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card/60 border border-border">
              <span className="text-lg">{['😫','😔','😐','🙂','😊','😄','🤩','🔥','💪','🚀'][latestMood.mood - 1]}</span>
              <span className="text-xs text-muted-foreground hidden sm:inline">Mood: {latestMood.mood}/10</span>
            </div>
          )}
          
          {/* Voice Interface Toggle */}
          <VoiceInterfaceToggle />
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs font-mono tracking-wider">ONLINE</span>
          </div>
        </div>
      </div>

      {/* Compact Header & Inspiration */}
      <div className="mb-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Brain className="w-6 h-6 text-primary" />
          <h1 className="text-2xl md:text-4xl font-display font-bold tracking-tight text-foreground">
            GETTING YOU TO A 10
          </h1>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary/60" />
            <p className="text-sm md:text-base font-light text-muted-foreground italic max-w-xl">"{inspiration.quote}"</p>
            <Sparkles className="w-4 h-4 text-primary/60" />
          </div>
          <p className="text-xs font-bold text-primary tracking-widest uppercase">— {inspiration.author}</p>
        </div>
      </div>

      {/* 6-Button Grid - Reorganized for Flow - Mobile Optimized */}
      <div className="flex-1 grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4 mb-4 max-w-5xl mx-auto w-full auto-rows-fr">
        {buttons.map((btn) => (
          <Tooltip 
            key={btn.id}
            content={btn.tooltip}
            position="bottom"
            showOnFirstVisit={true}
            tooltipKey={`dashboard_${btn.label.toLowerCase().replace(/\s+/g, '_')}`}
          >
            <button 
              onClick={() => setLocation(btn.path)}
              className="group relative p-3 sm:p-4 md:p-5 rounded-xl bg-card/60 border border-border hover:border-primary/50 hover:bg-card/80 transition-all duration-300 cursor-pointer overflow-hidden text-left min-h-[100px] sm:min-h-[120px] w-full h-full hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg hover:shadow-primary/10 touch-manipulation"
            >
              {/* Learning badge for Digital Twin */}
              {btn.badge}
              
              {/* Glow on Hover */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{ boxShadow: `inset 0 0 15px ${btn.color}15, 0 0 10px ${btn.color}20` }}
              ></div>

              <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity" style={{ color: btn.color }}>
                <btn.icon className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16" />
              </div>

              <div className="relative z-10 flex flex-col h-full">
                <div 
                  className="p-2 w-fit rounded-lg bg-secondary/50 mb-2 group-hover:scale-105 transition-transform duration-300" 
                  style={{ color: btn.color, border: `1px solid ${btn.color}30` }}
                >
                  <btn.icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                </div>
                
                <div>
                  <h3 className="font-display font-bold text-xs sm:text-sm md:text-base mb-0.5 tracking-wide text-foreground leading-tight">{btn.label}</h3>
                  <p className="text-[10px] sm:text-xs text-muted-foreground leading-tight">{btn.sub}</p>
                </div>
              </div>
            </button>
          </Tooltip>
         ))}
      </div>

      {/* Getting Started Checklist for new users */}
      <div className="max-w-3xl mx-auto w-full mb-6">
        <GettingStartedChecklist />
      </div>

      {/* Intelligent Nudges - Contextual Suggestions */}
      <div className="max-w-3xl mx-auto w-full mb-6">
        <InsightsPanel />
      </div>

      {/* Performance Boost - Quick 15-min interventions */}
      <div className="max-w-3xl mx-auto w-full mb-6">
        <PerformanceBoost />
      </div>

      {/* Tour Prompt for new users */}
      <div className="max-w-3xl mx-auto w-full mb-6">
        <TourPrompt onStartTour={() => console.log('Start tour')} />
      </div>

      {/* Neural Network Visualization */}
      <div className="max-w-3xl mx-auto w-full mb-6">
        <NeuralNetworkViz />
      </div>

      {/* Voice Input - Manus Style with Mic on Right */}
      <div className="max-w-3xl mx-auto w-full">
        <div className="flex items-center gap-3 bg-card/60 border border-border rounded-xl px-4 py-3 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-all duration-300">
          <input 
            type="text" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message Digital Twin..." 
            className="flex-1 bg-transparent border-none outline-none text-base text-foreground placeholder:text-muted-foreground/50 min-h-0"
          />
          <div className="flex items-center gap-2">
            <Button 
              size="icon" 
              variant="ghost" 
              onClick={handleSubmit}
              disabled={!inputValue.trim()}
              className="h-10 w-10 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </Button>
            <Button 
              size="icon" 
              onClick={toggleRecording}
              className={`h-12 w-12 rounded-full transition-all hover:scale-105 ${
                isRecording 
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]' 
                  : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_rgba(255,16,240,0.3)]'
              }`}
            >
              <Mic className="w-6 h-6" />
            </Button>
          </div>
        </div>
        
        {/* Keyboard shortcut hint */}
        <p className="text-center text-xs text-muted-foreground/60 mt-2">
          Press <kbd className="px-1.5 py-0.5 bg-secondary/50 rounded text-[10px]">Enter</kbd> to send • <kbd className="px-1.5 py-0.5 bg-secondary/50 rounded text-[10px]">?</kbd> for shortcuts
        </p>
      </div>
    </div>
    </PullToRefresh>
    
    {/* Floating Voice Note Button */}
    <FloatingVoiceNoteButton />
    </>
  );
}
