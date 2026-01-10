import DesktopLayout from "@/components/DesktopLayout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { 
  Mic, 
  FileText, 
  Paperclip, 
  Zap, 
  Globe, 
  TrendingUp, 
  Shield, 
  Users, 
  MessageSquare,
  Headphones,
  Video,
  Play,
  Download,
  Calendar,
  Mail,
  Lock,
  Sparkles,
  CheckCircle2,
  UserPlus
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Dashboard() {
  const [isRecording, setIsRecording] = useState(false);
  const [showDailyBrief, setShowDailyBrief] = useState(false);
  const [showExperts, setShowExperts] = useState(false);
  const [expertGoal, setExpertGoal] = useState("");
  const [expertStep, setExpertStep] = useState<"input" | "proposal" | "active">("input");

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  const handleExpertSubmit = () => {
    setExpertStep("proposal");
  };

  const handleExpertConfirm = () => {
    setExpertStep("active");
  };

  const dashboardButtons = [
    { 
      id: 1, 
      label: "DAILY BRIEF", 
      sub: "Intelligence & Focus", 
      icon: Zap, 
      color: "var(--color-chart-1)", // AI Pink
      colSpan: "col-span-2 md:col-span-1",
      action: () => setShowDailyBrief(true)
    },
    { 
      id: 2, 
      label: "AI EXPERTS", 
      sub: "Community & Teams", 
      icon: Sparkles, 
      color: "var(--color-chart-2)", // Cyan
      colSpan: "col-span-1",
      action: () => setShowExperts(true)
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
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="font-display font-bold text-4xl mb-2">Command Center</h1>
            <p className="text-muted-foreground">System Status: <span className="text-primary">OPTIMAL</span> • Edge Nodes: <span className="text-primary">12 ACTIVE</span></p>
          </div>
          <div className="flex gap-2">
             <Button variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10 text-xs font-mono">
               <Lock className="w-3 h-3 mr-2 text-primary" />
               VAULT LOCKED
             </Button>
          </div>
        </div>

        {/* 6-Button Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8 flex-1">
          {dashboardButtons.map((btn, index) => (
            <motion.button
              key={btn.id}
              onClick={btn.action}
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

        {/* Daily Brief Modal */}
        <Dialog open={showDailyBrief} onOpenChange={setShowDailyBrief}>
          <DialogContent className="max-w-4xl bg-background/95 backdrop-blur-xl border-white/10 p-0 overflow-hidden">
            <div className="flex h-[600px]">
              {/* Left: Brief Content */}
              <div className="flex-1 p-8 overflow-y-auto border-r border-white/10">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display font-bold text-3xl tracking-wide">DAILY BRIEF</h2>
                  <span className="text-xs font-mono text-primary border border-primary/30 px-2 py-1 rounded">07:00 AM GENERATED</span>
                </div>

                <div className="space-y-6">
                  <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <h3 className="text-sm font-bold text-muted-foreground mb-3 uppercase tracking-wider flex items-center gap-2">
                      <Zap className="w-4 h-4 text-primary" /> Focus of the Day
                    </h3>
                    <p className="text-lg leading-relaxed">
                      Prioritize the <span className="text-white font-semibold">Project Alpha merger</span> discussions. Market sentiment is shifting favorably in the APAC region.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                      <h3 className="text-xs font-bold text-muted-foreground mb-3 uppercase tracking-wider flex items-center gap-2">
                        <Calendar className="w-3 h-3" /> Key Meetings
                      </h3>
                      <ul className="space-y-2 text-sm">
                        <li className="flex justify-between">
                          <span>Board Review</span>
                          <span className="text-muted-foreground">10:00 AM</span>
                        </li>
                        <li className="flex justify-between">
                          <span>Investor Call</span>
                          <span className="text-muted-foreground">02:30 PM</span>
                        </li>
                      </ul>
                    </div>
                    <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                      <h3 className="text-xs font-bold text-muted-foreground mb-3 uppercase tracking-wider flex items-center gap-2">
                        <Mail className="w-3 h-3" /> Critical Comms
                      </h3>
                      <ul className="space-y-2 text-sm">
                        <li className="flex justify-between">
                          <span>From: Sarah J.</span>
                          <span className="text-red-400 text-[10px] border border-red-400/30 px-1 rounded">URGENT</span>
                        </li>
                        <li className="flex justify-between">
                          <span>From: Legal Team</span>
                          <span className="text-muted-foreground text-[10px]">Review</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <h3 className="text-sm font-bold text-muted-foreground mb-3 uppercase tracking-wider flex items-center gap-2">
                      <Globe className="w-4 h-4 text-blue-400" /> Global Intel
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Competitor X has announced a delay in their Q3 rollout. Opportunity to capture market share in the logistics sector is elevated by 15%.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right: Media & Actions */}
              <div className="w-80 bg-black/20 p-6 flex flex-col">
                <div className="mb-8">
                  <h3 className="text-xs font-bold text-muted-foreground mb-4 uppercase tracking-wider">Media Formats</h3>
                  <div className="space-y-3">
                    <Button className="w-full justify-between bg-white/5 hover:bg-white/10 border border-white/10 group">
                      <span className="flex items-center gap-2"><Headphones className="w-4 h-4 text-primary" /> Podcast Mode</span>
                      <Download className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Button>
                    <Button className="w-full justify-between bg-white/5 hover:bg-white/10 border border-white/10 group">
                      <span className="flex items-center gap-2"><Video className="w-4 h-4 text-purple-400" /> Video Brief</span>
                      <Play className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Button>
                  </div>
                </div>

                <div className="mt-auto">
                  <h3 className="text-xs font-bold text-muted-foreground mb-4 uppercase tracking-wider">Quick Actions</h3>
                  <div className="space-y-3">
                    <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                      <Mic className="w-4 h-4 mr-2" /> Dictate Actions
                    </Button>
                    <p className="text-[10px] text-muted-foreground text-center">
                      "Draft email to Sarah..."
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* AI Experts Modal */}
        <Dialog open={showExperts} onOpenChange={setShowExperts}>
          <DialogContent className="max-w-3xl bg-background/95 backdrop-blur-xl border-white/10 p-8">
            <DialogHeader>
              <DialogTitle className="font-display font-bold text-3xl tracking-wide mb-2">AI EXPERT ASSEMBLY</DialogTitle>
              <p className="text-muted-foreground">Define your objective. The Brain will recruit the optimal intelligence team.</p>
            </DialogHeader>

            <div className="mt-6">
              <AnimatePresence mode="wait">
                {expertStep === "input" && (
                  <motion.div
                    key="input"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-6"
                  >
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Mission Objective</label>
                      <Input 
                        value={expertGoal}
                        onChange={(e) => setExpertGoal(e.target.value)}
                        placeholder="e.g., Build a reusable rocket capable of reaching Mars..."
                        className="bg-white/5 border-white/10 h-14 text-lg"
                      />
                    </div>
                    <Button 
                      onClick={handleExpertSubmit}
                      disabled={!expertGoal}
                      className="w-full py-6 bg-primary hover:bg-primary/90 text-primary-foreground font-bold tracking-widest"
                    >
                      ANALYZE & ASSEMBLE TEAM
                    </Button>
                  </motion.div>
                )}

                {expertStep === "proposal" && (
                  <motion.div
                    key="proposal"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-white">Proposed Dream Team</h3>
                      <span className="text-xs font-mono text-primary border border-primary/30 px-2 py-1 rounded">MATCH SCORE: 98%</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { name: "Elon Musk (AI Persona)", role: "Propulsion & Strategy", color: "text-purple-400" },
                        { name: "Margaret Hamilton (AI Persona)", role: "Software Engineering", color: "text-cyan-400" },
                        { name: "Wernher von Braun (AI Persona)", role: "Aerospace Architecture", color: "text-orange-400" },
                        { name: "Richard Feynman (AI Persona)", role: "Problem Solving & Physics", color: "text-green-400" }
                      ].map((expert, i) => (
                        <div key={i} className="p-4 rounded-lg bg-white/5 border border-white/10 flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold ${expert.color}`}>
                            {expert.name[0]}
                          </div>
                          <div>
                            <p className="font-bold text-sm">{expert.name}</p>
                            <p className="text-xs text-muted-foreground">{expert.role}</p>
                          </div>
                          <CheckCircle2 className="w-5 h-5 text-primary ml-auto" />
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-4">
                      <Button variant="outline" className="flex-1 py-6 border-white/10 hover:bg-white/5">
                        <UserPlus className="w-4 h-4 mr-2" /> MODIFY TEAM
                      </Button>
                      <Button 
                        onClick={handleExpertConfirm}
                        className="flex-[2] py-6 bg-primary hover:bg-primary/90 text-primary-foreground font-bold tracking-widest"
                      >
                        CONFIRM & ACTIVATE
                      </Button>
                    </div>
                  </motion.div>
                )}

                {expertStep === "active" && (
                  <motion.div
                    key="active"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <div className="w-24 h-24 mx-auto bg-primary/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
                      <Sparkles className="w-12 h-12 text-primary" />
                    </div>
                    <h3 className="font-display font-bold text-2xl mb-2">TEAM ACTIVATED</h3>
                    <p className="text-muted-foreground mb-8">The board is now in session. Initial strategy generation in progress...</p>
                    <Button variant="outline" onClick={() => setShowExperts(false)} className="border-white/10">
                      RETURN TO DASHBOARD
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </DesktopLayout>
  );
}
