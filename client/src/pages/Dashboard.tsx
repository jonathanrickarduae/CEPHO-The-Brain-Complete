import { useState, useEffect } from "react";
import { 
  Sun, Users, Lightbulb, BarChart3, Lock, 
  Mic, Paperclip, Send, ArrowRight, X, 
  CheckCircle2, AlertTriangle, Calendar, FileText,
  Fingerprint, Activity, Shield, ShieldAlert, ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function Dashboard() {
  const [showDailyBrief, setShowDailyBrief] = useState(false);
  const [showExperts, setShowExperts] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [showDigitalTwin, setShowDigitalTwin] = useState(false);
  const [showWorkflow, setShowWorkflow] = useState(false);
  
  // Governance State
  const [governanceMode, setGovernanceMode] = useState<"omni" | "governed">("omni");

  // Daily Brief State
  const [briefFormat, setBriefFormat] = useState<"text" | "podcast" | "video">("text");
  const [briefGenerated, setBriefGenerated] = useState(false);

  // AI Experts State
  const [expertGoal, setExpertGoal] = useState("");
  const [teamAssembled, setTeamAssembled] = useState(false);
  const [blueprintReady, setBlueprintReady] = useState(false);

  // Inspiration Engine
  const [inspiration, setInspiration] = useState({
    quote: "The best way to predict the future is to create it.",
    author: "Peter Drucker"
  });

  const buttons = [
    { 
      id: 1, 
      label: "DAILY BRIEF", 
      sub: "7:00 AM • Ready", 
      icon: Sun, 
      color: "#3b82f6", // Bright Blue
      colSpan: "col-span-2 md:col-span-1",
      action: () => setShowDailyBrief(true)
    },
    { 
      id: 2, 
      label: "AI EXPERTS", 
      sub: "250+ World-Class Experts", 
      icon: Users, 
      color: "#06b6d4", // Bright Cyan
      colSpan: "col-span-2 md:col-span-1",
      action: () => setShowExperts(true)
    },
    { 
      id: 3, 
      label: "DIGITAL TWIN", 
      sub: "Training & Autonomy", 
      icon: Fingerprint, 
      color: "#a855f7", // Bright Purple
      colSpan: "col-span-2 md:col-span-1",
      action: () => setShowDigitalTwin(true)
    },
    { 
      id: 4, 
      label: "WORKFLOW", 
      sub: "Project Risk Radar", 
      icon: Activity, 
      color: "#ef4444", // Bright Red
      colSpan: "col-span-2 md:col-span-1",
      action: () => setShowWorkflow(true)
    },
    { 
      id: 5, 
      label: "INSIGHTS", 
      sub: "Proactive Learning", 
      icon: Lightbulb, 
      color: "#10b981", // Bright Emerald
      colSpan: "col-span-1",
      action: () => setShowInsights(true)
    },
    { 
      id: 6, 
      label: "THE VAULT", 
      sub: "Secure Credentials", 
      icon: Lock, 
      color: "#f59e0b", // Bright Amber
      colSpan: "col-span-2 md:col-span-1",
      action: () => window.location.href = "/vault"
    },
  ];

  return (
    <div className={`min-h-screen p-8 transition-colors duration-500 ${governanceMode === 'governed' ? 'bg-slate-950' : 'bg-black'}`}>
      
      {/* Governance Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
            <Shield className={`w-5 h-5 ${governanceMode === 'omni' ? 'text-purple-500' : 'text-blue-500'}`} />
            <span className="text-sm font-medium text-white/80">PROTOCOL:</span>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setGovernanceMode("omni")}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${governanceMode === 'omni' ? 'bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)]' : 'text-white/40 hover:text-white'}`}
              >
                OMNI (MAX)
              </button>
              <button 
                onClick={() => setGovernanceMode("governed")}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${governanceMode === 'governed' ? 'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'text-white/40 hover:text-white'}`}
              >
                GOVERNED
              </button>
            </div>
          </div>
          {governanceMode === 'governed' && (
            <Badge variant="outline" className="border-blue-500/50 text-blue-400 bg-blue-500/10">
              <ShieldCheck className="w-3 h-3 mr-1" /> COMPLIANCE MODE ACTIVE
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2 text-white/60">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-xs font-mono tracking-widest">SYSTEM ONLINE</span>
        </div>
      </div>

      {/* Main Header & Inspiration */}
      <div className="mb-12 text-center relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[200px] bg-primary/20 blur-[100px] rounded-full pointer-events-none"></div>
        
        <h1 className="relative text-6xl md:text-8xl font-display font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 mb-6 drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]">
          GETTING YOU TO A 10
        </h1>
        
        <div className="relative inline-block">
          <div className="flex flex-col items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <p className="text-2xl md:text-3xl font-light text-white/90 italic">"{inspiration.quote}"</p>
            <p className="text-sm font-bold text-primary tracking-widest uppercase">— {inspiration.author}</p>
          </div>
        </div>
      </div>

      {/* 6-Button Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {buttons.map((btn) => (
          <div 
            key={btn.id}
            onClick={btn.action}
            className={`
              ${btn.colSpan} 
              group relative p-6 rounded-2xl 
              bg-black/40 border border-white/10 
              hover:border-white/40 hover:bg-white/5
              transition-all duration-300 cursor-pointer
              overflow-hidden shadow-lg hover:shadow-xl
            `}
            style={{ boxShadow: `0 0 0 1px rgba(255,255,255,0.05)` }}
          >
            {/* Stronger Border Glow on Hover */}
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
              style={{ boxShadow: `inset 0 0 20px ${btn.color}20, 0 0 15px ${btn.color}30` }}
            ></div>

            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity" style={{ color: btn.color }}>
              <btn.icon className="w-20 h-20" />
            </div>
            
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div 
                className="p-3 w-fit rounded-xl bg-white/5 mb-4 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(0,0,0,0.5)]" 
                style={{ color: btn.color, border: `1px solid ${btn.color}40` }}
              >
                <btn.icon className="w-8 h-8" />
              </div>
              
              <div>
                <h3 className="font-display font-bold text-2xl mb-1 tracking-wide text-white group-hover:text-white transition-colors drop-shadow-md">{btn.label}</h3>
                <p className="text-sm font-medium text-muted-foreground group-hover:text-white/80 transition-colors">{btn.sub}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* High-Contrast Search / Input Area */}
      <div className="max-w-4xl mx-auto relative mt-8">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 blur-2xl opacity-30"></div>
        <div className="relative flex items-center bg-white/5 border border-white/20 rounded-2xl px-6 py-5 backdrop-blur-xl focus-within:border-white/50 focus-within:bg-black/60 transition-all duration-300 shadow-2xl">
          <div className="p-2 rounded-full bg-primary/20 mr-4">
            <Mic className="w-6 h-6 text-primary animate-pulse" />
          </div>
          <input 
            type="text" 
            placeholder="What's on your mind? Type or speak..." 
            className="flex-1 bg-transparent border-none outline-none text-xl text-white placeholder:text-white/40 font-medium"
          />
          <div className="flex gap-3">
            <Button size="icon" variant="ghost" className="hover:bg-white/10 rounded-xl text-white/70 hover:text-white">
              <Paperclip className="w-6 h-6" />
            </Button>
            <Button size="icon" className="h-12 w-12 rounded-xl bg-white text-black hover:bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all hover:scale-105">
              <Send className="w-6 h-6 ml-1" />
            </Button>
          </div>
        </div>
      </div>

      {/* --- MODALS --- */}

      {/* Daily Brief Modal */}
      <Dialog open={showDailyBrief} onOpenChange={setShowDailyBrief}>
        <DialogContent className="bg-black/90 border-white/10 text-white max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-3xl font-display font-bold">Daily Briefing</DialogTitle>
            <DialogDescription className="text-white/60">Generated at 7:00 AM • 10 min read</DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
            <div className="md:col-span-2 space-y-6">
              <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                <h3 className="text-xl font-bold mb-4 text-primary">Global Intelligence</h3>
                <ul className="space-y-3 text-white/80">
                  <li className="flex gap-3">
                    <span className="text-primary">•</span>
                    <span>Market volatility in renewable sector up 12% overnight.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary">•</span>
                    <span>Competitor X launched new AI bid tool.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary">•</span>
                    <span>Regulatory changes in EU energy policy announced.</span>
                  </li>
                </ul>
              </div>

              <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                <h3 className="text-xl font-bold mb-4 text-purple-400">Today's Focus</h3>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-xl">1</div>
                  <div>
                    <h4 className="font-bold">Review Space Shuttle Blueprint</h4>
                    <p className="text-sm text-white/60">10:00 AM with Expert Team</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-xl">2</div>
                  <div>
                    <h4 className="font-bold">Approve Q3 Budget</h4>
                    <p className="text-sm text-white/60">Deadline: 2:00 PM</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Format</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button 
                    variant={briefFormat === 'text' ? 'default' : 'outline'} 
                    className="w-full justify-start"
                    onClick={() => setBriefFormat('text')}
                  >
                    <FileText className="mr-2 h-4 w-4" /> Text Summary
                  </Button>
                  <Button 
                    variant={briefFormat === 'podcast' ? 'default' : 'outline'} 
                    className="w-full justify-start"
                    onClick={() => setBriefFormat('podcast')}
                  >
                    <Mic className="mr-2 h-4 w-4" /> Audio Podcast
                  </Button>
                  <Button 
                    variant={briefFormat === 'video' ? 'default' : 'outline'} 
                    className="w-full justify-start"
                    onClick={() => setBriefFormat('video')}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" /> Video Brief
                  </Button>
                </CardContent>
              </Card>

              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <h4 className="font-bold text-blue-400 mb-2">Action Engine</h4>
                <p className="text-xs text-white/60 mb-3">Dictate actions based on this brief.</p>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  <Mic className="mr-2 h-4 w-4" /> Record Actions
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Experts Modal */}
      <Dialog open={showExperts} onOpenChange={setShowExperts}>
        <DialogContent className="bg-black/90 border-white/10 text-white max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-3xl font-display font-bold text-cyan-400">AI Expert Assembly</DialogTitle>
            <DialogDescription className="text-white/60">Access 250+ World-Class Expert Agents</DialogDescription>
          </DialogHeader>

          {!teamAssembled ? (
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label className="text-lg">What is your mission?</Label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={expertGoal}
                    onChange={(e) => setExpertGoal(e.target.value)}
                    placeholder="e.g., Build a spaceship, Optimize tax strategy..." 
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-cyan-500 transition-colors"
                  />
                  <Button onClick={() => setTeamAssembled(true)} className="bg-cyan-600 hover:bg-cyan-700">
                    Assemble Team
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6 py-4 animate-in fade-in slide-in-from-bottom-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-white/5 border border-cyan-500/30 text-center">
                  <div className="w-16 h-16 mx-auto rounded-full bg-cyan-500/20 mb-3 flex items-center justify-center">
                    <Users className="w-8 h-8 text-cyan-400" />
                  </div>
                  <h4 className="font-bold text-white">Elon M.</h4>
                  <p className="text-xs text-cyan-400">Engineering Lead</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-cyan-500/30 text-center">
                  <div className="w-16 h-16 mx-auto rounded-full bg-purple-500/20 mb-3 flex items-center justify-center">
                    <Lock className="w-8 h-8 text-purple-400" />
                  </div>
                  <h4 className="font-bold text-white">Sarah L.</h4>
                  <p className="text-xs text-purple-400">Legal Counsel</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-cyan-500/30 text-center">
                  <div className="w-16 h-16 mx-auto rounded-full bg-green-500/20 mb-3 flex items-center justify-center">
                    <BarChart3 className="w-8 h-8 text-green-400" />
                  </div>
                  <h4 className="font-bold text-white">Marcus T.</h4>
                  <p className="text-xs text-green-400">Strategy</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <h3 className="font-bold mb-2">Blueprint Status</h3>
                {!blueprintReady ? (
                  <div className="flex items-center gap-3 text-white/60">
                    <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-cyan-500 animate-spin"></div>
                    Generating multi-perspective analysis...
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-green-400">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Blueprint Ready</span>
                    </div>
                    <Button className="w-full bg-white text-black hover:bg-white/90">
                      <Calendar className="mr-2 h-4 w-4" /> Book 1-Hour Review Session
                    </Button>
                  </div>
                )}
              </div>
              
              {!blueprintReady && (
                <Button onClick={() => setBlueprintReady(true)} variant="ghost" className="w-full text-xs text-white/20 hover:text-white">
                  (Simulate Generation)
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Digital Twin Modal */}
      <Dialog open={showDigitalTwin} onOpenChange={setShowDigitalTwin}>
        <DialogContent className="bg-black/90 border-white/10 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-3xl font-display font-bold text-purple-400">Digital Twin</DialogTitle>
            <DialogDescription className="text-white/60">Training & Autonomy Center</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-center">
                <h3 className="text-4xl font-bold text-white mb-1">42</h3>
                <p className="text-xs text-purple-300 uppercase tracking-wider">Hours Learned</p>
              </div>
              <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-center">
                <h3 className="text-4xl font-bold text-white mb-1">35%</h3>
                <p className="text-xs text-purple-300 uppercase tracking-wider">Autonomy Level</p>
              </div>
            </div>
            
            <div className="p-6 rounded-xl bg-white/5 border border-white/10">
              <h3 className="font-bold mb-4">Training Session</h3>
              <p className="text-sm text-white/80 mb-6">"How would you respond to a request for a discount from a long-term client?"</p>
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="h-auto py-4 text-left flex flex-col items-start gap-2 hover:bg-purple-500/20 hover:border-purple-500">
                  <span className="font-bold">Option A</span>
                  <span className="text-xs text-white/60 font-normal">Offer 5% loyalty discount but ask for longer term.</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 text-left flex flex-col items-start gap-2 hover:bg-purple-500/20 hover:border-purple-500">
                  <span className="font-bold">Option B</span>
                  <span className="text-xs text-white/60 font-normal">Politely decline but offer additional service value.</span>
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Workflow Modal */}
      <Dialog open={showWorkflow} onOpenChange={setShowWorkflow}>
        <DialogContent className="bg-black/90 border-white/10 text-white max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-3xl font-display font-bold text-red-400">Workflow Radar</DialogTitle>
            <DialogDescription className="text-white/60">Project Status & Risk Analysis</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <AlertTriangle className="w-8 h-8 text-red-500" />
                <div>
                  <h3 className="font-bold text-white">Project Alpha</h3>
                  <p className="text-sm text-red-300">Risk: High (Deadline Approaching)</p>
                </div>
              </div>
              <Badge variant="destructive">Action Required</Badge>
            </div>
            
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
                <div>
                  <h3 className="font-bold text-white">Website Redesign</h3>
                  <p className="text-sm text-green-300">Status: On Track</p>
                </div>
              </div>
              <Badge variant="outline" className="text-green-400 border-green-400/30">Healthy</Badge>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Insights Modal */}
      <Dialog open={showInsights} onOpenChange={setShowInsights}>
        <DialogContent className="bg-black/90 border-white/10 text-white max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-3xl font-display font-bold text-green-400">Proactive Insights</DialogTitle>
            <DialogDescription className="text-white/60">Learning & Opportunities</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-6 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer group">
              <div className="flex justify-between items-start mb-2">
                <Badge className="bg-green-500/20 text-green-400 hover:bg-green-500/30">Opportunity</Badge>
                <ArrowRight className="w-5 h-5 text-white/40 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-bold mb-2">Automate Bid Process</h3>
              <p className="text-white/60 mb-4">Competitor analysis suggests 40% efficiency gain by implementing AI bid automation.</p>
              <Button className="bg-green-600 hover:bg-green-700 w-full">
                Investigate with AI Experts
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
