import { useState, useEffect } from "react";
import { useSearch } from "wouter";
import { 
  Users, Brain, Zap, Clock, CheckCircle2, 
  ArrowRight, MessageSquare, Play, Pause, 
  Calendar, Target, Lightbulb, Send, ThumbsUp,
  ThumbsDown, RotateCcw, Sparkles, Timer, 
  FileText, Mail, Code, Presentation, Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

// Expert profiles database
const EXPERT_PROFILES = {
  strategy: { name: "Alex Chen", role: "Strategy Lead", avatar: "AC", specialty: "Business Strategy & Market Analysis" },
  engineering: { name: "Sarah Kim", role: "Engineering Lead", avatar: "SK", specialty: "Technical Architecture & Development" },
  marketing: { name: "Marcus Johnson", role: "Marketing Expert", avatar: "MJ", specialty: "Growth & Brand Strategy" },
  legal: { name: "Elena Rodriguez", role: "Legal Counsel", avatar: "ER", specialty: "Compliance & Contracts" },
  finance: { name: "David Park", role: "Finance Expert", avatar: "DP", specialty: "Financial Modeling & Funding" },
  design: { name: "Lisa Wang", role: "Design Lead", avatar: "LW", specialty: "UX/UI & Product Design" },
  operations: { name: "James Miller", role: "Operations Expert", avatar: "JM", specialty: "Process & Scaling" },
  research: { name: "Dr. Priya Sharma", role: "Research Lead", avatar: "PS", specialty: "Market Research & Data Analysis" },
};

// Mission templates for quick selection
const MISSION_TEMPLATES = [
  { id: 1, title: "Launch a Product", description: "Go-to-market strategy for a new product or service", icon: Target },
  { id: 2, title: "Build a Company", description: "Start a new business from scratch", icon: Sparkles },
  { id: 3, title: "Draft Communications", description: "Emails, presentations, or reports", icon: Mail },
  { id: 4, title: "Technical Project", description: "Software development or technical implementation", icon: Code },
  { id: 5, title: "Research & Analysis", description: "Deep dive into a topic or market", icon: Search },
  { id: 6, title: "Custom Mission", description: "Define your own objective", icon: Lightbulb },
];

type Phase = "mission" | "team" | "kickoff" | "timeline" | "active" | "review";
type Expert = keyof typeof EXPERT_PROFILES;

interface KickoffQuestion {
  id: number;
  question: string;
  answered?: boolean;
  answer?: "yes" | "no" | "skip";
  expertFrom: Expert;
}

interface ActionItem {
  id: number;
  title: string;
  status: "pending" | "in-progress" | "completed" | "needs-input";
  assignee: Expert;
  progress: number;
  question?: string;
}

export default function AIExperts() {
  const searchString = useSearch();
  const [phase, setPhase] = useState<Phase>("mission");
  const [mission, setMission] = useState("");
  
  // Check for pre-populated mission from URL (e.g., from Daily Brief)
  useEffect(() => {
    const params = new URLSearchParams(searchString);
    const missionParam = params.get("mission");
    if (missionParam) {
      setMission(missionParam);
      // Auto-select custom mission template
      setSelectedTemplate(6);
    }
  }, [searchString]);
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [recommendedTeam, setRecommendedTeam] = useState<Expert[]>([]);
  const [approvedTeam, setApprovedTeam] = useState<Expert[]>([]);
  const [kickoffQuestions, setKickoffQuestions] = useState<KickoffQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [deliverableTime, setDeliverableTime] = useState<number | null>(null);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isRunning, setIsRunning] = useState(false);
  const [chatInput, setChatInput] = useState("");

  // Simulate team recommendation based on mission
  const analyzeAndRecommendTeam = () => {
    const missionLower = mission.toLowerCase();
    const team: Expert[] = [];
    
    // Always include strategy
    team.push("strategy");
    
    if (missionLower.includes("social media") || missionLower.includes("marketing") || missionLower.includes("brand")) {
      team.push("marketing");
    }
    if (missionLower.includes("build") || missionLower.includes("develop") || missionLower.includes("app") || missionLower.includes("software")) {
      team.push("engineering");
      team.push("design");
    }
    if (missionLower.includes("company") || missionLower.includes("business") || missionLower.includes("startup")) {
      team.push("legal");
      team.push("finance");
    }
    if (missionLower.includes("research") || missionLower.includes("analyze") || missionLower.includes("market")) {
      team.push("research");
    }
    if (missionLower.includes("scale") || missionLower.includes("operations") || missionLower.includes("process")) {
      team.push("operations");
    }
    
    // Ensure at least 3 experts
    if (team.length < 3) {
      if (!team.includes("research")) team.push("research");
      if (!team.includes("operations") && team.length < 3) team.push("operations");
    }
    
    setRecommendedTeam(Array.from(new Set(team)).slice(0, 5));
    setPhase("team");
  };

  // Generate kickoff questions based on mission and team
  const generateKickoffQuestions = () => {
    const questions: KickoffQuestion[] = [
      { id: 1, question: "Do you have an existing budget allocated for this project?", expertFrom: "finance" },
      { id: 2, question: "Is there a specific deadline or event driving this timeline?", expertFrom: "strategy" },
      { id: 3, question: "Do you have existing brand guidelines we should follow?", expertFrom: "marketing" },
      { id: 4, question: "Should we prioritize speed over perfection for the first deliverable?", expertFrom: "strategy" },
      { id: 5, question: "Do you want us to proceed with our best recommendations, or wait for your approval on each step?", expertFrom: "strategy" },
    ];
    
    // Filter questions based on approved team
    const relevantQuestions = questions.filter(q => 
      approvedTeam.includes(q.expertFrom) || q.expertFrom === "strategy"
    ).slice(0, 5);
    
    setKickoffQuestions(relevantQuestions);
    setPhase("kickoff");
  };

  // Handle kickoff question answer
  const answerQuestion = (answer: "yes" | "no" | "skip") => {
    const updated = [...kickoffQuestions];
    updated[currentQuestionIndex] = {
      ...updated[currentQuestionIndex],
      answered: true,
      answer
    };
    setKickoffQuestions(updated);
    
    if (currentQuestionIndex < kickoffQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setPhase("timeline");
    }
  };

  // Start the action engine
  const startActionEngine = () => {
    if (!deliverableTime) return;
    
    // Generate action items based on mission
    const items: ActionItem[] = [
      { id: 1, title: "Initial research and competitive analysis", status: "in-progress", assignee: "research", progress: 0 },
      { id: 2, title: "Draft strategic framework", status: "pending", assignee: "strategy", progress: 0 },
      { id: 3, title: "Create preliminary recommendations", status: "pending", assignee: "strategy", progress: 0 },
      { id: 4, title: "Prepare first deliverable document", status: "pending", assignee: "strategy", progress: 0 },
    ];
    
    setActionItems(items);
    setTimeRemaining(deliverableTime * 60); // Convert to seconds
    setIsRunning(true);
    setPhase("active");
  };

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => prev - 1);
        
        // Simulate progress updates
        setActionItems(prev => prev.map(item => {
          if (item.status === "in-progress" && item.progress < 100) {
            const newProgress = Math.min(item.progress + Math.random() * 5, 100);
            if (newProgress >= 100) {
              return { ...item, progress: 100, status: "completed" };
            }
            return { ...item, progress: newProgress };
          }
          if (item.status === "pending" && prev.find(i => i.id === item.id - 1)?.status === "completed") {
            return { ...item, status: "in-progress" };
          }
          return item;
        }));
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isRunning, timeRemaining]);

  // Format time remaining
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle chat input
  const handleChatSend = () => {
    if (!chatInput.trim()) return;
    toast.success("Message sent to the expert team");
    setChatInput("");
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30">
                <Users className="w-8 h-8 text-cyan-400" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-display font-bold">AI Action Engine</h1>
                <p className="text-white/60 text-sm">Assemble your expert team and get things done</p>
              </div>
            </div>
            
            {phase === "active" && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30">
                  <Timer className="w-5 h-5 text-cyan-400" />
                  <span className="font-mono text-xl text-cyan-400">{formatTime(timeRemaining)}</span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsRunning(!isRunning)}
                  className="border-white/20"
                >
                  {isRunning ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                  {isRunning ? "Pause" : "Resume"}
                </Button>
              </div>
            )}
          </div>

          {/* Progress Steps */}
          <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-2">
            {[
              { id: "mission", label: "Mission" },
              { id: "team", label: "Team" },
              { id: "kickoff", label: "Kickoff" },
              { id: "timeline", label: "Timeline" },
              { id: "active", label: "Active" },
            ].map((step, index) => {
              const phases: Phase[] = ["mission", "team", "kickoff", "timeline", "active"];
              const currentIndex = phases.indexOf(phase);
              const stepIndex = phases.indexOf(step.id as Phase);
              const isComplete = stepIndex < currentIndex;
              const isCurrent = step.id === phase;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    isComplete ? "bg-green-500/20 text-green-400" :
                    isCurrent ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" :
                    "bg-white/5 text-white/40"
                  }`}>
                    {isComplete ? <CheckCircle2 className="w-4 h-4" /> : <span className="w-4 h-4 flex items-center justify-center text-xs">{index + 1}</span>}
                    {step.label}
                  </div>
                  {index < 4 && <ArrowRight className="w-4 h-4 mx-2 text-white/20" />}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        
        {/* Phase 1: Mission Input */}
        {phase === "mission" && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">What do you want to achieve?</h2>
              <p className="text-white/60">Describe your mission and we'll assemble the perfect expert team</p>
            </div>

            {/* Quick Templates */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              {MISSION_TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  onClick={() => {
                    setSelectedTemplate(template.id);
                    if (template.id !== 6) {
                      setMission(template.title + ": ");
                    }
                  }}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    selectedTemplate === template.id 
                      ? "bg-cyan-500/10 border-cyan-500/50" 
                      : "bg-white/5 border-white/10 hover:bg-white/10"
                  }`}
                >
                  <template.icon className={`w-6 h-6 mb-2 ${selectedTemplate === template.id ? "text-cyan-400" : "text-white/60"}`} />
                  <h3 className="font-bold text-white">{template.title}</h3>
                  <p className="text-xs text-white/50 mt-1">{template.description}</p>
                </button>
              ))}
            </div>

            {/* Mission Input */}
            <div className="relative">
              <textarea
                value={mission}
                onChange={(e) => setMission(e.target.value)}
                placeholder="e.g., Build a social media company focused on professional networking for creative industries..."
                className="w-full h-32 bg-white/5 border border-white/20 rounded-2xl px-6 py-4 text-lg text-white placeholder:text-white/30 outline-none focus:border-cyan-500/50 resize-none"
              />
              <div className="absolute bottom-4 right-4 text-xs text-white/30">
                {mission.length} characters
              </div>
            </div>

            <Button 
              onClick={analyzeAndRecommendTeam}
              disabled={mission.length < 10}
              className="w-full h-14 bg-cyan-600 hover:bg-cyan-700 text-lg font-bold"
            >
              <Zap className="w-5 h-5 mr-2" />
              Analyze & Recommend Team
            </Button>
          </div>
        )}

        {/* Phase 2: Team Assembly */}
        {phase === "team" && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Your Recommended Expert Team</h2>
              <p className="text-white/60">Based on your mission: "{mission.slice(0, 50)}..."</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendedTeam.map((expertKey) => {
                const expert = EXPERT_PROFILES[expertKey];
                const isApproved = approvedTeam.includes(expertKey);
                
                return (
                  <div
                    key={expertKey}
                    className={`p-5 rounded-xl border transition-all ${
                      isApproved 
                        ? "bg-green-500/10 border-green-500/30" 
                        : "bg-white/5 border-white/10"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold ${
                          isApproved ? "bg-green-500/20 text-green-400" : "bg-cyan-500/20 text-cyan-400"
                        }`}>
                          {expert.avatar}
                        </div>
                        <div>
                          <h3 className="font-bold text-white">{expert.name}</h3>
                          <p className="text-sm text-cyan-400">{expert.role}</p>
                          <p className="text-xs text-white/50 mt-1">{expert.specialty}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant={isApproved ? "default" : "outline"}
                        onClick={() => {
                          if (isApproved) {
                            setApprovedTeam(approvedTeam.filter(e => e !== expertKey));
                          } else {
                            setApprovedTeam([...approvedTeam, expertKey]);
                          }
                        }}
                        className={isApproved ? "bg-green-600 hover:bg-green-700" : "border-white/20"}
                      >
                        {isApproved ? <CheckCircle2 className="w-4 h-4 mr-1" /> : null}
                        {isApproved ? "Approved" : "Add"}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-4">
              <Button 
                variant="outline" 
                onClick={() => setPhase("mission")}
                className="flex-1 border-white/20"
              >
                Back to Mission
              </Button>
              <Button 
                onClick={generateKickoffQuestions}
                disabled={approvedTeam.length === 0}
                className="flex-1 bg-cyan-600 hover:bg-cyan-700"
              >
                Start Kickoff ({approvedTeam.length} experts)
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Phase 3: Kickoff Questions */}
        {phase === "kickoff" && kickoffQuestions.length > 0 && (
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Quick Kickoff</h2>
              <p className="text-white/60">Answer a few quick questions to align the team</p>
              <div className="flex justify-center gap-2 mt-4">
                {kickoffQuestions.map((_, index) => (
                  <div 
                    key={index}
                    className={`w-3 h-3 rounded-full ${
                      index < currentQuestionIndex ? "bg-green-500" :
                      index === currentQuestionIndex ? "bg-cyan-500" :
                      "bg-white/20"
                    }`}
                  />
                ))}
              </div>
            </div>

            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center text-sm font-bold text-cyan-400">
                    {EXPERT_PROFILES[kickoffQuestions[currentQuestionIndex].expertFrom].avatar}
                  </div>
                  <div>
                    <p className="text-sm text-cyan-400">{EXPERT_PROFILES[kickoffQuestions[currentQuestionIndex].expertFrom].name}</p>
                    <p className="text-xs text-white/40">{EXPERT_PROFILES[kickoffQuestions[currentQuestionIndex].expertFrom].role}</p>
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-white mb-8">
                  {kickoffQuestions[currentQuestionIndex].question}
                </h3>

                <div className="grid grid-cols-3 gap-4">
                  <Button 
                    onClick={() => answerQuestion("yes")}
                    className="h-16 bg-green-600 hover:bg-green-700 text-lg"
                  >
                    <ThumbsUp className="w-5 h-5 mr-2" />
                    Yes
                  </Button>
                  <Button 
                    onClick={() => answerQuestion("no")}
                    className="h-16 bg-red-600 hover:bg-red-700 text-lg"
                  >
                    <ThumbsDown className="w-5 h-5 mr-2" />
                    No
                  </Button>
                  <Button 
                    onClick={() => answerQuestion("skip")}
                    variant="outline"
                    className="h-16 border-white/20 text-lg"
                  >
                    <RotateCcw className="w-5 h-5 mr-2" />
                    Skip
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Phase 4: Timeline Selection */}
        {phase === "timeline" && (
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">When do you want the first deliverable?</h2>
              <p className="text-white/60">Your team is ready to start working</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { minutes: 30, label: "30 Minutes", description: "Quick initial findings" },
                { minutes: 60, label: "1 Hour", description: "Detailed first draft" },
                { minutes: 120, label: "2 Hours", description: "Comprehensive analysis" },
                { minutes: 240, label: "4 Hours", description: "Full deliverable" },
              ].map((option) => (
                <button
                  key={option.minutes}
                  onClick={() => setDeliverableTime(option.minutes)}
                  className={`p-6 rounded-xl border text-left transition-all ${
                    deliverableTime === option.minutes 
                      ? "bg-cyan-500/10 border-cyan-500/50" 
                      : "bg-white/5 border-white/10 hover:bg-white/10"
                  }`}
                >
                  <Clock className={`w-8 h-8 mb-3 ${deliverableTime === option.minutes ? "text-cyan-400" : "text-white/60"}`} />
                  <h3 className="text-xl font-bold text-white">{option.label}</h3>
                  <p className="text-sm text-white/50 mt-1">{option.description}</p>
                </button>
              ))}
            </div>

            <Button 
              onClick={startActionEngine}
              disabled={!deliverableTime}
              className="w-full h-14 bg-cyan-600 hover:bg-cyan-700 text-lg font-bold"
            >
              <Play className="w-5 h-5 mr-2" />
              Start Action Engine
            </Button>
          </div>
        )}

        {/* Phase 5: Active Engine */}
        {phase === "active" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Progress */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Zap className="w-5 h-5 text-cyan-400" />
                    Action Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {actionItems.map((item) => (
                    <div key={item.id} className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-xs font-bold text-cyan-400">
                            {EXPERT_PROFILES[item.assignee].avatar}
                          </div>
                          <div>
                            <h4 className="font-medium text-white">{item.title}</h4>
                            <p className="text-xs text-white/40">{EXPERT_PROFILES[item.assignee].name}</p>
                          </div>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={
                            item.status === "completed" ? "border-green-500/30 text-green-400" :
                            item.status === "in-progress" ? "border-cyan-500/30 text-cyan-400" :
                            item.status === "needs-input" ? "border-yellow-500/30 text-yellow-400" :
                            "border-white/20 text-white/40"
                          }
                        >
                          {item.status}
                        </Badge>
                      </div>
                      <Progress value={item.progress} className="h-2" />
                      {item.question && (
                        <div className="mt-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                          <p className="text-sm text-yellow-400">{item.question}</p>
                          <div className="flex gap-2 mt-2">
                            <Button size="sm" className="bg-green-600 hover:bg-green-700">Yes</Button>
                            <Button size="sm" variant="outline" className="border-white/20">No</Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Chat with Team */}
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <MessageSquare className="w-5 h-5 text-cyan-400" />
                    Message Your Team
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Ask a question or provide guidance..."
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 outline-none focus:border-cyan-500/50"
                      onKeyDown={(e) => e.key === "Enter" && handleChatSend()}
                    />
                    <Button onClick={handleChatSend} className="bg-cyan-600 hover:bg-cyan-700">
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Team Status Sidebar */}
            <div className="space-y-6">
              <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/30">
                <CardHeader>
                  <CardTitle className="text-white">Active Team</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {approvedTeam.map((expertKey) => {
                    const expert = EXPERT_PROFILES[expertKey];
                    const isWorking = actionItems.some(i => i.assignee === expertKey && i.status === "in-progress");
                    
                    return (
                      <div key={expertKey} className="flex items-center gap-3 p-2 rounded-lg bg-white/5">
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center text-sm font-bold text-cyan-400">
                            {expert.avatar}
                          </div>
                          {isWorking && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-black animate-pulse" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-white text-sm truncate">{expert.name}</p>
                          <p className="text-xs text-white/40">{isWorking ? "Working..." : "Standby"}</p>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-4 text-center">
                  <Calendar className="w-8 h-8 mx-auto mb-2 text-cyan-400" />
                  <p className="text-sm text-white/60">First deliverable ready at</p>
                  <p className="text-xl font-bold text-white">
                    {new Date(Date.now() + timeRemaining * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-purple-500/10 border-purple-500/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="w-5 h-5 text-purple-400" />
                    <span className="font-medium text-white">Digital Twin</span>
                  </div>
                  <p className="text-xs text-white/60">
                    Your Digital Twin is learning from this session. Over time, it will start answering routine questions automatically.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
