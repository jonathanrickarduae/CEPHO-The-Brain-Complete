import DesktopLayout from "@/components/DesktopLayout";
import { Button } from "@/components/ui/button";
import { 
  Mic, 
  FileText, 
  Paperclip, 
  Zap, 
  Globe, 
  TrendingUp, 
  Shield, 
  Users, 
  MessageSquare 
} from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

export default function Dashboard() {
  const [isRecording, setIsRecording] = useState(false);

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  const dashboardButtons = [
    { 
      id: 1, 
      label: "DAILY BRIEF", 
      sub: "Intelligence & Focus", 
      icon: Zap, 
      color: "var(--color-chart-1)", // AI Pink
      colSpan: "col-span-2 md:col-span-1" 
    },
    { 
      id: 2, 
      label: "GLOBAL INTEL", 
      sub: "Market Insights", 
      icon: Globe, 
      color: "var(--color-chart-2)", // Cyan
      colSpan: "col-span-1" 
    },
    { 
      id: 3, 
      label: "PIPELINE", 
      sub: "Lead Management", 
      icon: TrendingUp, 
      color: "var(--color-chart-4)", // Green
      colSpan: "col-span-1" 
    },
    { 
      id: 4, 
      label: "SECURITY", 
      sub: "Threat Analysis", 
      icon: Shield, 
      color: "var(--color-chart-5)", // Orange
      colSpan: "col-span-1" 
    },
    { 
      id: 5, 
      label: "TEAM", 
      sub: "Workforce Optimization", 
      icon: Users, 
      color: "var(--color-chart-3)", // Purple
      colSpan: "col-span-1" 
    },
    { 
      id: 6, 
      label: "COMMUNICATIONS", 
      sub: "Secure Channels", 
      icon: MessageSquare, 
      color: "var(--color-chart-2)", // Cyan
      colSpan: "col-span-2 md:col-span-1" 
    },
  ];

  return (
    <DesktopLayout>
      <div className="max-w-6xl mx-auto h-full flex flex-col">
        
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="font-display font-bold text-4xl mb-2">Command Center</h1>
          <p className="text-muted-foreground">System Status: <span className="text-primary">OPTIMAL</span> • Edge Nodes: <span className="text-primary">12 ACTIVE</span></p>
        </div>

        {/* 6-Button Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8 flex-1">
          {dashboardButtons.map((btn, index) => (
            <motion.button
              key={btn.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`
                ${btn.colSpan} relative group overflow-hidden rounded-xl border border-white/5 bg-card hover:bg-white/5 transition-all duration-300
                flex flex-col items-start justify-between p-6 text-left
              `}
            >
              {/* Hover Glow */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500"
                style={{ background: `radial-gradient(circle at center, ${btn.color}, transparent 70%)` }}
              ></div>
              
              <div className="relative z-10 p-3 rounded-lg bg-white/5 border border-white/10 mb-4 group-hover:scale-110 transition-transform duration-300">
                <btn.icon className="w-6 h-6" style={{ color: btn.color }} />
              </div>
              
              <div className="relative z-10">
                <h3 className="font-display font-bold text-2xl tracking-wide mb-1 group-hover:text-white transition-colors">{btn.label}</h3>
                <p className="text-sm text-muted-foreground font-mono uppercase tracking-wider">{btn.sub}</p>
              </div>

              {/* Corner Accent */}
              <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
                <span className="font-mono text-xs text-white/20">0{btn.id}</span>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Bottom Input Bar (Superhuman Style) */}
        <div className="relative mt-auto pt-6 border-t border-white/5">
          <div className="flex items-center gap-4 bg-black/40 border border-white/10 rounded-xl p-2 pr-4 backdrop-blur-md shadow-2xl">
            
            {/* Voice Button */}
            <Button 
              size="icon" 
              onClick={toggleRecording}
              className={`
                h-12 w-12 rounded-lg transition-all duration-300
                ${isRecording 
                  ? "bg-red-500/20 text-red-500 animate-pulse border border-red-500/50" 
                  : "bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-primary"}
              `}
            >
              <Mic className="w-5 h-5" />
            </Button>

            {/* Text Input */}
            <input 
              type="text" 
              placeholder="Type a command, ask a question, or set an action..." 
              className="flex-1 bg-transparent border-none outline-none text-lg placeholder:text-muted-foreground/50 h-12"
            />

            {/* Action Buttons */}
            <div className="flex items-center gap-2 border-l border-white/10 pl-4">
              <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-white">
                <Paperclip className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-white">
                <FileText className="w-5 h-5" />
              </Button>
            </div>
          </div>
          
          <div className="text-center mt-3">
            <p className="text-[10px] text-muted-foreground/40 font-mono uppercase tracking-widest">
              Press <span className="text-primary">Space</span> to talk • <span className="text-primary">Enter</span> to send
            </p>
          </div>
        </div>

      </div>
    </DesktopLayout>
  );
}
