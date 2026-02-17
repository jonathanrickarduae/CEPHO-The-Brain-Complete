import { useState, useRef, useMemo } from "react";
import { useLocation } from "wouter";
import { 
  Sun, Users, Lock, 
  Mic, Send, 
  Fingerprint, Shield, ShieldCheck, FolderKanban, BookOpen, Brain, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LearningBadge } from "@/components/LearningIndicator";

import { Tooltip } from "@/components/Tooltip";
import { useMoodCheck } from "@/hooks/useMoodCheck";
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
import { TaskProgressTracker } from '@/components/TaskProgressTracker';
import { FavoriteContacts } from '@/components/FavoriteContacts';
import { OnboardingOverlay } from '@/components/OnboardingOverlay';
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
  const [showMobileInput, setShowMobileInput] = useState(false);

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

        mediaRecorder.ondataavailable = (event) => {
          // Handle audio blob
        };

        mediaRecorder.start();
        setIsRecording(true);

        // Timer
        let duration = 0;
        recordingTimerRef.current = setInterval(() => {
          duration += 1;
          setRecordingDuration(duration);
        }, 1000);
      } catch (error) {
        console.error("Microphone access denied:", error);
      }
    }
  };

  const isMobile = useIsMobile();
  const { activeProjects } = useOnboardingStatus();
  const inspiration = useMemo(() => getDailyQuote(), []);

  // Top Row - The Flow (The Signal → AI Expert Engine → Workflow)
  // Bottom Row - Support (Chief of Staff Training, Library, Vault)
  const buttons = [
    // TOP ROW - The Flow
    { 
      id: 1, 
      label: "THE SIGNAL", 
      sub: "Morning Briefing", 
      icon: Sun, 
      color: "#f59e0b",
      path: "/daily-brief",
      tooltip: "Start your day here! Get personalized briefings, action items, and intelligence updates."
    },
    { 
      id: 2, 
      label: "AI-SMEs", 
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
      label: "CHIEF OF STAFF", 
      sub: "Level 2: Learning", 
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
      // Navigate to Chief of Staff with the message
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
      
      {/* Header with Protocol Toggle and Status - Moved to top */}
      <div className="flex items-center justify-between mb-4 max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-2">
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
        <div className="flex items-center gap-3">
          {/* Mood indicator - just number and circle */}
          {(() => {
            const { todaysMoods } = useMoodCheck();
            const latestMood = todaysMoods.length > 0 ? todaysMoods[todaysMoods.length - 1] : null;
            if (!latestMood) return null;
            return (
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <span className="text-xs font-bold text-white">{latestMood.mood}</span>
              </div>
            );
          })()}
          
          {/* Voice Interface Toggle */}
          <VoiceInterfaceToggle />
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs font-mono tracking-wider">ONLINE</span>
          </div>
        </div>
      </div>

      {/* Quick Action Input - Manus Style */}
      <div className="max-w-3xl mx-auto w-full mb-6">
        {isMobile ? (
          /* Mobile: Tap to open bottom sheet */
          <QuickInputTrigger onClick={() => setShowMobileInput(true)} />
        ) : (
          /* Desktop: Full inline input */
          <>
            <div className="mb-2 flex items-center gap-2">
              <Mic className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold text-primary">VOICE CAPTURE</span>
            </div>
            <div className="flex items-center gap-3 bg-card/80 border-2 border-primary/30 rounded-2xl px-4 py-4 focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/20 transition-all duration-300 shadow-lg shadow-primary/5" data-tour="voice-input">
              <input 
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message Chief of Staff..."
                className="flex-1 bg-transparent text-foreground placeholder-muted-foreground outline-none text-sm md:text-base"
              />
              <button 
                onClick={toggleRecording}
                className={`p-2 rounded-lg transition-all relative group ${
                  isRecording 
                    ? 'bg-red-500/20 text-red-400 animate-pulse' 
                    : 'hover:bg-primary/10 text-muted-foreground hover:text-foreground hover:scale-110'
                }`}
                title="Hold to record voice input"
              >
                {/* Pulse ring on hover */}
                {!isRecording && (
                  <div className="absolute inset-0 rounded-lg border-2 border-primary/0 group-hover:border-primary/50 group-hover:animate-pulse transition-all"></div>
                )}
                {/* Recording indicator */}
                {isRecording && (
                  <div className="absolute inset-0 rounded-lg border-2 border-red-400/50 animate-pulse"></div>
                )}
                <Mic className="w-5 h-5 relative z-10" />
              </button>
              <button 
                onClick={handleSubmit}
                className="p-2 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </>
        )}
      </div>

      {/* Favorite Contacts Quick Access */}
      <div className="max-w-3xl mx-auto w-full mb-6">
        <FavoriteContacts maxDisplay={6} />
      </div>



      {/* Compact Header */}
      <div className="mb-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Brain className="w-6 h-6 text-primary" />
          <h1 className="text-2xl md:text-4xl font-display font-bold tracking-tight text-foreground">
            GETTING YOU TO A 10
          </h1>
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
              {/* Learning badge for Chief of Staff */}
              {btn.badge}
              
              {/* Glow on Hover */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{ boxShadow: `inset 0 0 15px ${btn.color}15, 0 0 10px ${btn.color}20` }}
              ></div>

              <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity" style={{ color: btn.color }}>
                <btn.icon className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16" />
              </div>

              <div className="relative z-10">
                <h3 className="font-bold text-sm sm:text-base md:text-lg tracking-tight text-foreground mb-1">
                  {btn.label}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {btn.sub}
                </p>
              </div>
            </button>
          </Tooltip>
        ))}
      </div>

      {/* Mobile Input Sheet */}
      {isMobile && (
        <MobileInputSheet 
          isOpen={showMobileInput} 
          onClose={() => setShowMobileInput(false)}
          onSubmit={(value) => {
            setInputValue(value);
            setShowMobileInput(false);
            setLocation(`/digital-twin?message=${encodeURIComponent(value)}`);
          }}
        />
      )}

      {/* Floating Elements */}
      <FloatingVoiceNoteButton />
      
      {/* Onboarding Overlay */}
      <OnboardingOverlay />
    </div>
    </PullToRefresh>
    </>
  );
}
