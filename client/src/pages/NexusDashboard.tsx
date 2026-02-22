import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { 
  Sun, Users, Lock, Mic, MicOff, Send, 
  Fingerprint, FolderKanban, BookOpen, Brain, LayoutDashboard,
  ChevronRight, AlertCircle
} from "lucide-react";
import { PageHeader } from '@/components/layout/PageHeader';
import { LearningBadge } from '@/components/expert-evolution/LearningIndicator';
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import OpenClawChat from '@/components/ai-agents/OpenClawChat';
import SkillCards from '@/components/expert-evolution/SkillCards';


// Notification badge component
function NotificationBadge({ count, urgent = false }: { count: number; urgent?: boolean }) {
  if (count === 0) return null;
  return (
    <div className={`absolute top-2 right-2 min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center text-xs font-bold text-white ${
      urgent ? 'bg-red-500 animate-pulse' : 'bg-primary'
    }`}>
      {count > 99 ? '99+' : count}
    </div>
  );
}

export default function NexusDashboard() {
  const [, setLocation] = useLocation();
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  // Dynamic notification counts - would come from API/database
  const [unreadSignals, setUnreadSignals] = useState(0); // Changed from hardcoded 3 to 0
  const [expertRecommendations, setExpertRecommendations] = useState(5);
  const [urgentTasks, setUrgentTasks] = useState(2);
  const [newDocuments, setNewDocuments] = useState(1);
  
  // Voice input
  const { 
    isListening, 
    transcript, 
    startListening, 
    stopListening, 
    isSupported: voiceSupported 
  } = useVoiceInput({
    onResult: (text) => setInputValue(prev => prev + text),
    continuous: false,
  });

  const toggleRecording = () => {
    if (isListening) {
      stopListening();
    } else {
      if (!voiceSupported) {
        toast.error("Voice input not supported");
        return;
      }
      startListening();
      toast.info("Listening...");
    }
  };

  const handleSubmit = () => {
    if (inputValue.trim()) {
      setLocation(`/digital-twin?message=${encodeURIComponent(inputValue)}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
  };

  // Navigation buttons - Ordered by workflow priority:
  // Signal → Chief of Staff → AI SMEs → Workflow → Project Genesis → Library → Vault
  const buttons = [
    { 
      id: 1, 
      label: "THE SIGNAL", 
      sub: "Morning Briefing", 
      icon: Sun, 
      gradient: "from-amber-500/20 to-orange-500/20",
      border: "border-amber-500/50 hover:border-amber-400",
      iconBg: "bg-amber-500/30",
      iconColor: "text-amber-400",
      path: "/daily-brief",
      badge: <NotificationBadge count={unreadSignals} /> // Dynamic unread briefings
    },
    { 
      id: 2, 
      label: "CHIEF OF STAFF", 
      sub: "Level 2: Learning", 
      icon: Fingerprint, 
      gradient: "from-fuchsia-500/20 to-purple-500/20",
      border: "border-fuchsia-500/50 hover:border-fuchsia-400",
      iconBg: "bg-fuchsia-500/30",
      iconColor: "text-fuchsia-400",
      path: "/digital-twin",
      badge: <LearningBadge className="absolute top-2 right-2" />
    },
    { 
      id: 3, 
      label: "AI-SMEs", 
      sub: "287 Experts Ready", 
      icon: Users, 
      gradient: "from-cyan-500/20 to-blue-500/20",
      border: "border-cyan-500/50 hover:border-cyan-400",
      iconBg: "bg-cyan-500/30",
      iconColor: "text-cyan-400",
      path: "/ai-experts",
      badge: <NotificationBadge count={expertRecommendations} /> // Dynamic expert recommendations
    },
    { 
      id: 4, 
      label: "WORKFLOW", 
      sub: "6 Active Projects", 
      icon: FolderKanban, 
      gradient: "from-emerald-500/20 to-green-500/20",
      border: "border-emerald-500/50 hover:border-emerald-400",
      iconBg: "bg-emerald-500/30",
      iconColor: "text-emerald-400",
      path: "/workflow",
      badge: <NotificationBadge count={urgentTasks} urgent /> // Dynamic urgent tasks
    },
    { 
      id: 5, 
      label: "LIBRARY", 
      sub: "Knowledge Base", 
      icon: BookOpen, 
      gradient: "from-pink-500/20 to-rose-500/20",
      border: "border-pink-500/50 hover:border-pink-400",
      iconBg: "bg-pink-500/30",
      iconColor: "text-pink-400",
      path: "/library",
      badge: <NotificationBadge count={newDocuments} /> // Dynamic new documents
    },
    { 
      id: 6, 
      label: "THE VAULT", 
      sub: "Secure Storage", 
      icon: Lock, 
      gradient: "from-slate-500/20 to-gray-500/20",
      border: "border-slate-500/50 hover:border-slate-400",
      iconBg: "bg-slate-500/30",
      iconColor: "text-slate-400",
      path: "/vault"
    },
  ];

  return (
    <div className="h-[calc(100vh-56px)] md:h-screen flex flex-col bg-background">
      {/* Header */}
      <PageHeader 
        icon={LayoutDashboard} 
        title="The Nexus"
        iconColor="text-cyan-400"
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs text-foreground/70 font-mono">ONLINE</span>
        </div>
      </PageHeader>

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-4 sm:p-6 overflow-hidden">
        {/* Title with Animated Brain */}
        <div className="text-center mb-4 sm:mb-6 mt-8 sm:mt-12">
          <div className="flex items-center justify-center gap-2 mb-2">
            {/* Animated Neuron Brain - Cyan/Neon Green, No Circle */}
            <div className="relative w-12 h-12 sm:w-14 sm:h-14">
              <Brain className="w-12 h-12 sm:w-14 sm:h-14 text-cyan-400" style={{ filter: 'drop-shadow(0 0 8px rgba(34, 211, 238, 0.5))' }} />
              {/* Subtle neural glow particles */}
              <div className="absolute -top-1 left-1/2 w-1 h-1 rounded-full bg-cyan-400/60" style={{ animation: 'pulse 3s ease-in-out infinite' }} />
              <div className="absolute top-1/4 -right-1 w-1 h-1 rounded-full bg-emerald-400/60" style={{ animation: 'pulse 3.5s ease-in-out infinite', animationDelay: '0.5s' }} />
              <div className="absolute bottom-1/4 -right-1 w-1 h-1 rounded-full bg-cyan-400/60" style={{ animation: 'pulse 4s ease-in-out infinite', animationDelay: '1s' }} />
              <div className="absolute -bottom-1 left-1/2 w-1 h-1 rounded-full bg-emerald-400/60" style={{ animation: 'pulse 3.2s ease-in-out infinite', animationDelay: '1.5s' }} />
              <div className="absolute bottom-1/4 -left-1 w-1 h-1 rounded-full bg-cyan-400/60" style={{ animation: 'pulse 3.8s ease-in-out infinite', animationDelay: '0.8s' }} />
              <div className="absolute top-1/4 -left-1 w-1 h-1 rounded-full bg-emerald-400/60" style={{ animation: 'pulse 3.3s ease-in-out infinite', animationDelay: '1.2s' }} />
            </div>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-bold tracking-tight text-white mt-2">
            GETTING YOU TO 100
          </h1>
          <p className="text-sm sm:text-base text-foreground/70 mt-1">Your headspace, reclaimed</p>
        </div>

        {/* 6-Button Grid - Project Genesis Style */}
        <div className="flex-1 grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 max-w-5xl mx-auto w-full auto-rows-fr min-h-0">
          {buttons.map((btn) => (
            <button 
              key={btn.id}
              onClick={() => setLocation(btn.path)}
              className={`group relative p-4 sm:p-5 rounded-2xl bg-gradient-to-br ${btn.gradient} border-2 ${btn.border} transition-all duration-300 cursor-pointer overflow-hidden text-left hover:scale-[1.03] hover:shadow-xl hover:shadow-primary/10 active:scale-[0.98]`}
            >
              {btn.badge}
              
              {/* Hover glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Icon Container */}
              <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl ${btn.iconBg} flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                <btn.icon className={`w-6 h-6 sm:w-7 sm:h-7 ${btn.iconColor} group-hover:animate-pulse`} />
              </div>

              {/* Content */}
              <div className="relative z-10">
                <h3 className="font-bold text-sm sm:text-base md:text-lg tracking-tight mb-1 text-white group-hover:text-primary transition-colors">
                  {btn.label}
                </h3>
                <p className="text-xs sm:text-sm text-foreground/60 group-hover:text-foreground/80 transition-colors">
                  {btn.sub}
                </p>
              </div>

              {/* Hover Arrow with slide animation */}
              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                <ChevronRight className={`w-5 h-5 ${btn.iconColor}`} />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* OpenClaw Skills Section */}
      <div className="px-4 sm:px-6 lg:px-8 mb-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">CEPHO Skills</h2>
          <p className="text-sm text-muted-foreground">Quick access to all 7 autonomous capabilities</p>
        </div>
        <SkillCards />
      </div>

      {/* OpenClaw Chat Section */}
      <div className="px-4 sm:px-6 lg:px-8 mb-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">Conversational Interface</h2>
          <p className="text-sm text-muted-foreground">Chat with CEPHO to execute any skill</p>
        </div>
        <div className="h-[500px]">
          <OpenClawChat />
        </div>
      </div>

      {/* Voice Input - Fixed at bottom (Manus style) */}
      <div className="shrink-0 border-t border-border bg-card/90 backdrop-blur-xl px-4 py-3">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white/5 border border-white/20 rounded-2xl overflow-hidden">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Message Chief of Staff..."
              rows={1}
              className="w-full px-4 py-3 bg-transparent resize-none focus:outline-none text-sm text-white placeholder:text-foreground/50"
              style={{ minHeight: '44px', maxHeight: '100px' }}
            />
            <div className="flex items-center justify-between px-3 py-2 border-t border-white/10">
              <div className="flex items-center gap-1">
                <button
                  onClick={toggleRecording}
                  className={`p-2 rounded-lg transition-colors ${
                    isListening 
                      ? "text-red-400 bg-red-500/20 animate-pulse" 
                      : "text-foreground/70 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
              </div>
              <button
                onClick={handleSubmit}
                disabled={!inputValue.trim()}
                className="p-2 rounded-lg bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white hover:opacity-90 disabled:opacity-40 transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
          {isListening && (
            <div className="mt-2 flex items-center gap-2 text-xs text-red-400">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              Listening... {transcript && `"${transcript}"`}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
