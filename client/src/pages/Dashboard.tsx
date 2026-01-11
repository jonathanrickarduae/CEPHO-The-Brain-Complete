import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { 
  Sun, Users, Lock, 
  Mic, Send, 
  Fingerprint, Shield, ShieldCheck, FolderKanban, BookOpen, Brain, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LearningBadge } from "@/components/LearningIndicator";
import { useMoodCheck } from "@/hooks/useMoodCheck";
import { WellnessScoreDashboard } from "@/components/WellnessScoreDashboard";
import { Share2 } from "lucide-react";

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
  
  // Mood tracking
  const { todaysMoods } = useMoodCheck();
  const latestMood = todaysMoods.length > 0 ? todaysMoods[todaysMoods.length - 1] : null;

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
      path: "/daily-brief"
    },
    { 
      id: 2, 
      label: "AI EXPERT ENGINE", 
      sub: "287 Experts Ready", 
      icon: Users, 
      color: "#06b6d4",
      path: "/ai-experts"
    },
    { 
      id: 3, 
      label: "WORKFLOW", 
      sub: "6 Active Projects", 
      icon: FolderKanban, 
      color: "#10b981",
      path: "/workflow"
    },
    // BOTTOM ROW - Support
    { 
      id: 4, 
      label: "DIGITAL TWIN", 
      sub: "12.5h Training", 
      icon: Fingerprint, 
      color: "#a855f7",
      path: "/digital-twin",
      badge: <LearningBadge className="absolute top-2 right-2" />
    },
    { 
      id: 5, 
      label: "LIBRARY", 
      sub: "Knowledge Base", 
      icon: BookOpen, 
      color: "#ec4899",
      path: "/library"
    },
    { 
      id: 6, 
      label: "THE VAULT", 
      sub: "Secure Storage", 
      icon: Lock, 
      color: "#64748b",
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

  return (
    <div className="h-full flex flex-col p-4 md:p-6 overflow-hidden">
      
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
          
          {/* Today's mood indicator */}
          {latestMood && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card/60 border border-border">
              <span className="text-lg">{['😫','😔','😐','🙂','😊','😄','🤩','🔥','💪','🚀'][latestMood.mood - 1]}</span>
              <span className="text-xs text-muted-foreground hidden sm:inline">Mood: {latestMood.mood}/10</span>
            </div>
          )}
          
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

      {/* 6-Button Grid - Reorganized for Flow */}
      <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-4 max-w-5xl mx-auto w-full">
        {buttons.map((btn) => (
          <button 
            key={btn.id}
            onClick={() => setLocation(btn.path)}
            className="group relative p-4 md:p-5 rounded-xl bg-card/60 border border-border hover:border-primary/50 hover:bg-card/80 transition-all duration-300 cursor-pointer overflow-hidden text-left min-h-0"
          >
            {/* Learning badge for Digital Twin */}
            {btn.badge}
            
            {/* Glow on Hover */}
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
              style={{ boxShadow: `inset 0 0 15px ${btn.color}15, 0 0 10px ${btn.color}20` }}
            ></div>

            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity" style={{ color: btn.color }}>
              <btn.icon className="w-12 h-12 md:w-16 md:h-16" />
            </div>

            <div className="relative z-10 flex flex-col h-full">
              <div 
                className="p-2 w-fit rounded-lg bg-secondary/50 mb-2 group-hover:scale-105 transition-transform duration-300" 
                style={{ color: btn.color, border: `1px solid ${btn.color}30` }}
              >
                <btn.icon className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              
              <div>
                <h3 className="font-display font-bold text-sm md:text-base mb-0.5 tracking-wide text-foreground">{btn.label}</h3>
                <p className="text-xs text-muted-foreground">{btn.sub}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Voice Input - Manus Style with Mic on Right */}
      <div className="max-w-3xl mx-auto w-full">
        <div className="flex items-center gap-3 bg-card/60 border border-border rounded-xl px-4 py-3 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-all duration-300">
          <input 
            type="text" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What's on your mind? Type or speak..." 
            className="flex-1 bg-transparent border-none outline-none text-base text-foreground placeholder:text-muted-foreground min-h-0"
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
              onClick={() => setIsRecording(!isRecording)}
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
  );
}
