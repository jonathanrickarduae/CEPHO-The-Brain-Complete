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
  UserPlus,
  Brain,
  BarChart3,
  Lightbulb,
  ArrowRight
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Dashboard() {
  const [isRecording, setIsRecording] = useState(false);
  const [showDailyBrief, setShowDailyBrief] = useState(false);
  const [showExperts, setShowExperts] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
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

  const handleInvestigateInsight = (topic: string) => {
    setExpertGoal(topic);
    setShowInsights(false);
    setShowExperts(true);
    setExpertStep("input");
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
      sub: "250+ World-Class Experts", 
      icon: Sparkles, 
      color: "var(--color-chart-2)", // Cyan
      colSpan: "col-span-1",
      action: () => setShowExperts(true)
    },
    { 
      id: 3, 
      label: "WORKFORCE", 
      sub: "Team Optimization", 
      icon: Users, 
      color: "var(--color-chart-4)", // Green
      colSpan: "col-span-1" 
    },
    { 
      id: 4, 
      label: "INSIGHTS", 
      sub: "Proactive Learning", 
      icon: Brain, 
      color: "var(--color-chart-1)", // Pink
      colSpan: "col-span-1",
      action: () => setShowInsights(true)
    },
    { 
      id: 5, 
      label: "DATA INTEL", 
      sub: "Deep Science Reports", 
      icon: BarChart3, 
      color: "var(--color-chart-2)", // Cyan
      colSpan: "col-span-1" 
    },
    { 
      id: 6, 
      label: "THE VAULT", 
      sub: "Secure Credentials", 
      icon: Lock, 
      color: "var(--color-chart-5)", // Orange
      colSpan: "col-span-2 md:col-span-1",
      action: () => window.location.href = "/vault"
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
                      New regulations on AI safety proposed in EU. Competitor X launched a new sustainability initiative.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right: Media & Actions */}
              <div className="w-80 bg-black/20 p-8 flex flex-col">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-6">Brief Formats</h3>
                
                <div className="space-y-4 mb-8">
                  <Button variant="outline" className="w-full justify-start h-12 border-white/10 hover:bg-white/5 group">
                    <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center mr-3 group-hover:bg-primary/30 transition-colors">
                      <Headphones className="w-4 h-4 text-primary" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-bold">Podcast Mode</div>
                      <div className="text-[10px] text-muted-foreground">Listen on the go (5m)</div>
                    </div>
                  </Button>

                  <Button variant="outline" className="w-full justify-start h-12 border-white/10 hover:bg-white/5 group">
                    <div className="w-8 h-8 rounded bg-purple-500/20 flex items-center justify-center mr-3 group-hover:bg-purple-500/30 transition-colors">
                      <Video className="w-4 h-4 text-purple-400" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-bold">Video Brief</div>
                      <div className="text-[10px] text-muted-foreground">Visual presentation</div>
                    </div>
                  </Button>
                </div>

                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <Button className="w-full bg-white text-black hover:bg-white/90">
                    <Play className="w-4 h-4 mr-2" /> Start Day
                  </Button>
                  <Button variant="ghost" className="w-full text-muted-foreground hover:text-white">
                    <Download className="w-4 h-4 mr-2" /> Export PDF
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Insights Modal */}
        <Dialog open={showInsights} onOpenChange={setShowInsights}>
          <DialogContent className="max-w-3xl bg-background/95 backdrop-blur-xl border-white/10">
            <DialogHeader>
              <DialogTitle className="font-display font-bold text-2xl flex items-center gap-3">
                <Brain className="w-6 h-6 text-pink-500" />
                THE BRAIN LEARNING
              </DialogTitle>
            </DialogHeader>
            
            <div className="py-6 space-y-6">
              <div className="p-6 rounded-xl bg-gradient-to-br from-pink-500/10 to-purple-500/10 border border-pink-500/20">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-pink-500/20 flex items-center justify-center shrink-0 animate-pulse">
                    <Lightbulb className="w-6 h-6 text-pink-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">Proactive Suggestion: Automate Bid Process</h3>
                    <p className="text-muted-foreground mb-4">
                      Based on recent workflow analysis, your team spends 15 hours/week on manual bid entry. 
                      We've identified a new AI-driven automation pattern used by top competitors.
                    </p>
                    <Button 
                      onClick={() => handleInvestigateInsight("Automate Bid Process")}
                      className="bg-pink-500 hover:bg-pink-600 text-white"
                    >
                      Investigate with AI Experts <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
                  <h4 className="font-bold text-sm mb-2 text-cyan-400">Corporate Solutions</h4>
                  <p className="text-xs text-muted-foreground">New framework for cross-departmental synergy detected in Q3 reports.</p>
                </div>
                <div className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
                  <h4 className="font-bold text-sm mb-2 text-green-400">Financial Optimization</h4>
                  <p className="text-xs text-muted-foreground">Tax efficiency strategies for the upcoming fiscal year.</p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* AI Experts Modal */}
        <Dialog open={showExperts} onOpenChange={setShowExperts}>
          <DialogContent className="max-w-2xl bg-background/95 backdrop-blur-xl border-white/10">
            <DialogHeader>
              <DialogTitle className="font-display font-bold text-2xl flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-primary" />
                AI EXPERT ASSEMBLY
              </DialogTitle>
            </DialogHeader>
            
            <div className="py-6">
              <AnimatePresence mode="wait">
                {expertStep === "input" && (
                  <motion.div
                    key="input"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-4"
                  >
                    <p className="text-lg text-muted-foreground">
                      What is your mission? I will assemble the perfect team of experts.
                    </p>
                    <Input 
                      value={expertGoal}
                      onChange={(e) => setExpertGoal(e.target.value)}
                      placeholder="e.g., Build a spaceship to Mars..."
                      className="bg-white/5 border-white/10 text-lg p-6 h-auto"
                    />
                    <div className="flex justify-end">
                      <Button onClick={handleExpertSubmit} size="lg" className="bg-primary hover:bg-primary/90">
                        Analyze & Assemble Team
                      </Button>
                    </div>
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
                    <div>
                      <h3 className="text-lg font-bold mb-4">Proposed Dream Team</h3>
                      <div className="grid grid-cols-1 gap-3">
                        <div className="flex items-center gap-4 p-3 rounded-lg bg-white/5 border border-white/10">
                          <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center font-bold text-purple-500">EM</div>
                          <div>
                            <div className="font-bold">Elon Musk (Persona)</div>
                            <div className="text-xs text-muted-foreground">Role: Visionary & Engineering Lead</div>
                          </div>
                          <CheckCircle2 className="w-5 h-5 text-green-500 ml-auto" />
                        </div>
                        <div className="flex items-center gap-4 p-3 rounded-lg bg-white/5 border border-white/10">
                          <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center font-bold text-cyan-500">MH</div>
                          <div>
                            <div className="font-bold">Margaret Hamilton (Persona)</div>
                            <div className="text-xs text-muted-foreground">Role: Software & Systems Architecture</div>
                          </div>
                          <CheckCircle2 className="w-5 h-5 text-green-500 ml-auto" />
                        </div>
                        <div className="flex items-center gap-4 p-3 rounded-lg bg-white/5 border border-white/10 border-dashed opacity-50 hover:opacity-100 cursor-pointer transition-opacity">
                          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                            <UserPlus className="w-5 h-5" />
                          </div>
                          <div className="text-sm font-medium">Add another expert...</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end gap-3">
                      <Button variant="ghost" onClick={() => setExpertStep("input")}>Back</Button>
                      <Button onClick={handleExpertConfirm} size="lg" className="bg-green-500 hover:bg-green-600 text-black">
                        Confirm & Activate Team
                      </Button>
                    </div>
                  </motion.div>
                )}

                {expertStep === "active" && (
                  <motion.div
                    key="active"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col h-[500px]"
                  >
                    <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
                      <div>
                        <h3 className="font-display font-bold text-2xl">BLUEPRINT GENERATION</h3>
                        <p className="text-xs text-muted-foreground">Mission: {expertGoal}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="border-white/10 text-xs">
                          <Calendar className="w-3 h-3 mr-2" />
                          BOOK REVIEW (1 HR)
                        </Button>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                      {/* Expert 1: Legal */}
                      <div className="p-4 rounded-lg bg-white/5 border-l-2 border-purple-400">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 rounded-full bg-purple-400/20 flex items-center justify-center text-xs font-bold text-purple-400">L</div>
                          <span className="font-bold text-sm">Legal Advisor</span>
                          <span className="text-[10px] text-muted-foreground ml-auto">Just now</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          <span className="text-white font-semibold">Risk Assessment:</span> Regulatory compliance for Mars colonization requires adherence to the Outer Space Treaty. We need to draft a liability waiver for early settlers immediately.
                        </p>
                      </div>

                      {/* Expert 2: IT/Tech */}
                      <div className="p-4 rounded-lg bg-white/5 border-l-2 border-cyan-400">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 rounded-full bg-cyan-400/20 flex items-center justify-center text-xs font-bold text-cyan-400">T</div>
                          <span className="font-bold text-sm">Tech Lead (Margaret H.)</span>
                          <span className="text-[10px] text-muted-foreground ml-auto">1 min ago</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          <span className="text-white font-semibold">System Architecture:</span> The guidance computer needs redundancy. I'm proposing a distributed edge-compute network to handle latency. Blueprint for the navigation module is ready for review.
                        </p>
                      </div>

                      {/* Expert 3: Strategy */}
                      <div className="p-4 rounded-lg bg-white/5 border-l-2 border-orange-400">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 rounded-full bg-orange-400/20 flex items-center justify-center text-xs font-bold text-orange-400">S</div>
                          <span className="font-bold text-sm">Strategy (Elon M.)</span>
                          <span className="text-[10px] text-muted-foreground ml-auto">2 mins ago</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          <span className="text-white font-semibold">Cost Analysis:</span> We need to reduce cost-per-ton to orbit. I've outlined a reusable rocket architecture. The financial model suggests a break-even point after 12 launches.
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/10">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <span className="text-xs font-bold uppercase tracking-wider text-primary">Blueprint Status</span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-primary w-[65%] animate-pulse"></div>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1 text-right">Compiling Expert Viewpoints... 65%</p>
                    </div>
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
