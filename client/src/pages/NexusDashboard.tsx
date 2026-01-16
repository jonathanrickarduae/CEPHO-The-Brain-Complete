import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { 
  Sun, Users, Lock, Mic, MicOff, Send, 
  Fingerprint, FolderKanban, BookOpen, Brain, LayoutDashboard,
  ChevronRight, Sparkles, Activity
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/PageHeader";
import { LearningBadge } from "@/components/LearningIndicator";
import { useIsMobile } from "@/hooks/useMobile";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { toast } from "sonner";

export default function NexusDashboard() {
  const [, setLocation] = useLocation();
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const isMobile = useIsMobile();
  
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

  // Navigation buttons
  const buttons = [
    { 
      id: 1, 
      label: "THE SIGNAL", 
      sub: "Morning Briefing", 
      icon: Sun, 
      color: "#f59e0b",
      path: "/daily-brief"
    },
    { 
      id: 2, 
      label: "AI-SMEs", 
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
    { 
      id: 4, 
      label: "CHIEF OF STAFF", 
      sub: "Level 2: Learning", 
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

  return (
    <div className="h-[calc(100vh-56px)] md:h-screen flex flex-col bg-background">
      {/* Header */}
      <PageHeader 
        icon={LayoutDashboard} 
        title="The Nexus"
        subtitle="Command Center"
        iconColor="text-cyan-400"
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs text-white/70 font-mono">ONLINE</span>
        </div>
      </PageHeader>

      {/* Main Content - No scroll on page, only content area if needed */}
      <div className="flex-1 flex flex-col p-4 sm:p-6 overflow-hidden">
        {/* Title */}
        <div className="text-center mb-4 sm:mb-6">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-bold tracking-tight">
              GETTING YOU TO A 10
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">Your AI-powered command center</p>
        </div>

        {/* 6-Button Grid */}
        <div className="flex-1 grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 max-w-5xl mx-auto w-full auto-rows-fr min-h-0">
          {buttons.map((btn) => (
            <button 
              key={btn.id}
              onClick={() => setLocation(btn.path)}
              className="group relative p-3 sm:p-4 rounded-xl bg-card/60 border border-border hover:border-primary/50 hover:bg-card/80 transition-all duration-300 cursor-pointer overflow-hidden text-left hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg hover:shadow-primary/10"
            >
              {btn.badge}
              
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{ boxShadow: `inset 0 0 15px ${btn.color}15, 0 0 10px ${btn.color}20` }}
              />

              <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity" style={{ color: btn.color }}>
                <btn.icon className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" />
              </div>

              <div className="relative z-10">
                <h3 className="font-bold text-xs sm:text-sm md:text-base tracking-tight mb-0.5 sm:mb-1">
                  {btn.label}
                </h3>
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  {btn.sub}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Voice Input - Fixed at bottom (Manus style) */}
      <div className="shrink-0 border-t border-border bg-card/90 backdrop-blur-xl px-4 py-3">
        <div className="max-w-3xl mx-auto">
          <div className="bg-secondary/30 border border-border rounded-2xl overflow-hidden">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Message Chief of Staff..."
              rows={1}
              className="w-full px-4 py-3 bg-transparent resize-none focus:outline-none text-sm"
              style={{ minHeight: '44px', maxHeight: '100px' }}
            />
            <div className="flex items-center justify-between px-3 py-2 border-t border-border/50">
              <div className="flex items-center gap-1">
                <button
                  onClick={toggleRecording}
                  className={`p-2 rounded-lg transition-colors ${
                    isListening 
                      ? "text-red-400 bg-red-500/20 animate-pulse" 
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
              </div>
              <button
                onClick={handleSubmit}
                disabled={!inputValue.trim()}
                className="p-2 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 disabled:opacity-40 transition-colors"
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
