import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { 
  Sun, Users, Lock, Mic, MicOff, Send, 
  Fingerprint, FolderKanban, BookOpen, Brain, LayoutDashboard,
  ChevronRight
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { LearningBadge } from "@/components/LearningIndicator";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { toast } from "sonner";

export default function NexusDashboard() {
  const [, setLocation] = useLocation();
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
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

  // Navigation buttons with Project Genesis styling
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
      path: "/daily-brief"
    },
    { 
      id: 2, 
      label: "AI-SMEs", 
      sub: "287 Experts Ready", 
      icon: Users, 
      gradient: "from-cyan-500/20 to-blue-500/20",
      border: "border-cyan-500/50 hover:border-cyan-400",
      iconBg: "bg-cyan-500/30",
      iconColor: "text-cyan-400",
      path: "/ai-experts"
    },
    { 
      id: 3, 
      label: "WORKFLOW", 
      sub: "6 Active Projects", 
      icon: FolderKanban, 
      gradient: "from-emerald-500/20 to-green-500/20",
      border: "border-emerald-500/50 hover:border-emerald-400",
      iconBg: "bg-emerald-500/30",
      iconColor: "text-emerald-400",
      path: "/workflow"
    },
    { 
      id: 4, 
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
      id: 5, 
      label: "LIBRARY", 
      sub: "Knowledge Base", 
      icon: BookOpen, 
      gradient: "from-pink-500/20 to-rose-500/20",
      border: "border-pink-500/50 hover:border-pink-400",
      iconBg: "bg-pink-500/30",
      iconColor: "text-pink-400",
      path: "/library"
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
    <div className="h-[calc(100vh-56px)] md:h-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800">
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-4 sm:p-6 overflow-hidden">
        {/* Title */}
        <div className="text-center mb-4 sm:mb-6">
          <div className="flex items-center justify-center gap-2 mb-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-500 to-fuchsia-500 flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-bold tracking-tight text-white mt-3">
            GETTING YOU TO A 10
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">Your AI-powered command center</p>
        </div>

        {/* 6-Button Grid - Project Genesis Style */}
        <div className="flex-1 grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 max-w-5xl mx-auto w-full auto-rows-fr min-h-0">
          {buttons.map((btn) => (
            <button 
              key={btn.id}
              onClick={() => setLocation(btn.path)}
              className={`group relative p-4 sm:p-5 rounded-2xl bg-gradient-to-br ${btn.gradient} border-2 ${btn.border} transition-all duration-300 cursor-pointer overflow-hidden text-left hover:scale-[1.02] active:scale-[0.98]`}
            >
              {btn.badge}
              
              {/* Icon Container */}
              <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl ${btn.iconBg} flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform`}>
                <btn.icon className={`w-6 h-6 sm:w-7 sm:h-7 ${btn.iconColor}`} />
              </div>

              {/* Content */}
              <div className="relative z-10">
                <h3 className="font-bold text-sm sm:text-base md:text-lg tracking-tight mb-1 text-white">
                  {btn.label}
                </h3>
                <p className="text-xs sm:text-sm text-gray-400">
                  {btn.sub}
                </p>
              </div>

              {/* Hover Arrow */}
              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRight className={`w-5 h-5 ${btn.iconColor}`} />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Voice Input - Fixed at bottom (Manus style) */}
      <div className="shrink-0 border-t border-white/10 bg-gray-900/90 backdrop-blur-xl px-4 py-3">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white/5 border border-white/20 rounded-2xl overflow-hidden">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Message Chief of Staff..."
              rows={1}
              className="w-full px-4 py-3 bg-transparent resize-none focus:outline-none text-sm text-white placeholder:text-gray-500"
              style={{ minHeight: '44px', maxHeight: '100px' }}
            />
            <div className="flex items-center justify-between px-3 py-2 border-t border-white/10">
              <div className="flex items-center gap-1">
                <button
                  onClick={toggleRecording}
                  className={`p-2 rounded-lg transition-colors ${
                    isListening 
                      ? "text-red-400 bg-red-500/20 animate-pulse" 
                      : "text-gray-400 hover:text-white hover:bg-white/10"
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
