import { useState, useEffect } from "react";
import { useSearch } from "wouter";
import { ExpertDirectory } from "@/components/ExpertDirectory";
import { MyBoard } from "@/components/MyBoard";
import { WarRoom } from "@/components/WarRoom";
import { ExpertAnalytics } from "@/components/ExpertAnalytics";
import { ExpertScheduling } from "@/components/ExpertScheduling";
import { ExternalResources } from "@/components/ExternalResources";
import { ExpertPerformanceRating, generateMockPerformance } from "@/components/ExpertPerformanceRating";
import { 
  Users, Brain, Zap, Clock, CheckCircle2, 
  ArrowRight, MessageSquare, Play, Pause, 
  Calendar, Target, Lightbulb, Send, ThumbsUp,
  ThumbsDown, RotateCcw, Sparkles, Timer, 
  FileText, Mail, Code, Search, Mic, MicOff,
  Fingerprint, Eye, ChevronRight, AlertCircle,
  ListChecks, RefreshCw, Star, BarChart3, Swords, Globe
} from "lucide-react";
import { 
  AI_EXPERTS, 
  categories, 
  searchExperts, 
  getTopPerformers,
  getExpertsByCategory,
  generateExpertSystemPrompt,
  TOTAL_EXPERTS 
} from "@/data/aiExperts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGovernance, FeatureGate, RestrictedBadge } from "@/hooks/useGovernance";
import { 
  InsightCard, 
  ValidationSummary, 
  DigitalTwinQA,
  ConfidenceBadge,
  VerificationBadge 
} from "@/components/InsightValidation";
import { 
  BatchVerificationPanel,
  TruthVerificationSummary,
  ClassificationBadge,
  type ClassifiedStatement,
  type StatementClassification
} from "@/components/TruthVerification";
import { 
  type Insight,
  type ConfidenceLevel,
  type VerificationStatus,
  QA_CHALLENGE_PROMPTS 
} from "@/lib/insightValidation";

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

// Task types
type TaskType = "twin" | "team";
type TaskStatus = "pending" | "active" | "review" | "completed";

interface PendingTask {
  id: string;
  title: string;
  description: string;
  category: string;
  source: "daily-brief" | "manual";
  type: TaskType;
  status: TaskStatus;
  progress: number;
  assignedTo?: string[];
  dialogue: DialogueMessage[];
  deliverable?: string;
}

interface DialogueMessage {
  id: number;
  from: "twin" | "expert" | "user";
  name: string;
  message: string;
  timestamp: Date;
  needsResponse?: boolean;
}

// Mock pending tasks from The Signal
const MOCK_PENDING_TASKS: PendingTask[] = [
  {
    id: "task-1",
    title: "Draft email responses",
    description: "5 emails need responses based on overnight communications",
    category: "Communications",
    source: "daily-brief",
    type: "twin",
    status: "pending",
    progress: 0,
    dialogue: []
  },
  {
    id: "task-2", 
    title: "Q3 Budget Analysis",
    description: "Review and prepare summary for 2 PM sign-off deadline",
    category: "Finance",
    source: "daily-brief",
    type: "team",
    status: "pending",
    progress: 0,
    dialogue: []
  },
  {
    id: "task-3",
    title: "Competitor AI Bid Tool Research",
    description: "Deep dive into Competitor X's new AI bid tool - verify 15% efficiency claims",
    category: "Research",
    source: "daily-brief",
    type: "team",
    status: "pending",
    progress: 0,
    dialogue: []
  },
  {
    id: "task-4",
    title: "Investor Meeting Prep",
    description: "Prepare talking points and 3 key metrics for lunch meeting",
    category: "Strategy",
    source: "daily-brief",
    type: "twin",
    status: "pending",
    progress: 0,
    dialogue: []
  },
];

// Mission templates
const MISSION_TEMPLATES = [
  { id: 1, title: "Draft Communications", description: "Emails, presentations, or reports", icon: Mail, type: "twin" as TaskType },
  { id: 2, title: "Research & Analysis", description: "Deep dive into a topic or market", icon: Search, type: "team" as TaskType },
  { id: 3, title: "Custom Mission", description: "Define your own objective", icon: Lightbulb, type: "team" as TaskType },
];

type Phase = "queue" | "mission" | "team" | "kickoff" | "timeline" | "active" | "review";
type Expert = keyof typeof EXPERT_PROFILES;

interface KickoffQuestion {
  id: number;
  question: string;
  answered?: boolean;
  answer?: "yes" | "no";
  expertFrom: Expert;
}

export default function AIExperts() {
  const { mode, isFeatureAvailable } = useGovernance();
  const searchString = useSearch();
  const [phase, setPhase] = useState<Phase>("queue");
  const [tasks, setTasks] = useState<PendingTask[]>(MOCK_PENDING_TASKS);
  const [activeTask, setActiveTask] = useState<PendingTask | null>(null);
  const [mission, setMission] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [recommendedTeam, setRecommendedTeam] = useState<Expert[]>([]);
  const [approvedTeam, setApprovedTeam] = useState<Expert[]>([]);
  const [kickoffQuestions, setKickoffQuestions] = useState<KickoffQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [deliverableTime, setDeliverableTime] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  // View mode: action engine, expert directory, my board, war room, analytics, scheduling, or external resources
  const [viewMode, setViewMode] = useState<'action' | 'directory' | 'board' | 'warroom' | 'analytics' | 'scheduling' | 'external'>('action');
  
  // Insight Validation State
  const [validationMode, setValidationMode] = useState<'off' | 'review' | 'challenge'>('off');
  const [pendingInsights, setPendingInsights] = useState<ClassifiedStatement[]>([]);
  const [validatedInsights, setValidatedInsights] = useState<ClassifiedStatement[]>([]);

  // Check for pre-populated mission from URL
  useEffect(() => {
    const params = new URLSearchParams(searchString);
    const missionParam = params.get("mission");
    if (missionParam) {
      setMission(missionParam);
      setSelectedTemplate(3); // Custom mission
      setPhase("mission");
    }
  }, [searchString]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => prev - 1);
        // Simulate progress
        if (activeTask) {
          setActiveTask(prev => prev ? { ...prev, progress: Math.min(prev.progress + 0.5, 95) } : null);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeRemaining, activeTask]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Start a task
  const startTask = (task: PendingTask) => {
    setActiveTask(task);
    if (task.type === "twin") {
      // Chief of Staff handles directly - skip to active phase
      setPhase("active");
      setDeliverableTime(30); // 30 minutes for twin tasks
      setTimeRemaining(30 * 60);
      setIsRunning(true);
      
      // Add initial dialogue
      const updatedTask = {
        ...task,
        status: "active" as TaskStatus,
        dialogue: [{
          id: 1,
          from: "twin" as const,
          name: "Chief of Staff",
          message: `Starting work on "${task.title}". I'll analyze the context and prepare the deliverable based on your patterns and preferences.`,
          timestamp: new Date()
        }]
      };
      setActiveTask(updatedTask);
      updateTaskInList(updatedTask);
      
      toast.success("Chief of Staff is now working on this task");
    } else {
      // Expert team needed - go through team assembly
      setMission(task.title + ": " + task.description);
      setPhase("team");
      analyzeAndRecommendTeam(task);
    }
  };

  // Update task in the list
  const updateTaskInList = (updatedTask: PendingTask) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
  };

  // Analyze and recommend team
  const analyzeAndRecommendTeam = (task?: PendingTask) => {
    const missionText = task ? task.title + " " + task.description : mission;
    const missionLower = missionText.toLowerCase();
    const team: Expert[] = [];
    
    team.push("strategy");
    
    if (missionLower.includes("marketing") || missionLower.includes("brand") || missionLower.includes("social")) {
      team.push("marketing");
    }
    if (missionLower.includes("build") || missionLower.includes("develop") || missionLower.includes("technical")) {
      team.push("engineering");
      team.push("design");
    }
    if (missionLower.includes("budget") || missionLower.includes("finance") || missionLower.includes("investor")) {
      team.push("finance");
    }
    if (missionLower.includes("research") || missionLower.includes("analyze") || missionLower.includes("competitor")) {
      team.push("research");
    }
    if (missionLower.includes("legal") || missionLower.includes("contract") || missionLower.includes("compliance")) {
      team.push("legal");
    }
    
    if (team.length < 3) {
      if (!team.includes("research")) team.push("research");
      if (!team.includes("operations") && team.length < 3) team.push("operations");
    }
    
    setRecommendedTeam(Array.from(new Set(team)).slice(0, 5));
  };

  // Generate kickoff questions
  const generateKickoffQuestions = () => {
    const questions: KickoffQuestion[] = [
      { id: 1, question: "Do you have specific requirements or constraints we should know about?", expertFrom: "strategy" },
      { id: 2, question: "Should we prioritize speed over comprehensiveness?", expertFrom: "strategy" },
      { id: 3, question: "Can we proceed with our recommendations if you're unavailable?", expertFrom: "strategy" },
    ];
    
    if (approvedTeam.includes("research")) {
      questions.push({ id: 4, question: "Should we include competitor analysis in our research?", expertFrom: "research" });
    }
    if (approvedTeam.includes("finance")) {
      questions.push({ id: 5, question: "Do you need detailed financial projections?", expertFrom: "finance" });
    }
    
    setKickoffQuestions(questions);
    setCurrentQuestionIndex(0);
    setPhase("kickoff");
  };

  // Answer kickoff question
  const answerQuestion = (answer: "yes" | "no") => {
    const updated = [...kickoffQuestions];
    updated[currentQuestionIndex] = { ...updated[currentQuestionIndex], answered: true, answer };
    setKickoffQuestions(updated);
    
    if (currentQuestionIndex < kickoffQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setPhase("timeline");
    }
  };

  // Start active work
  const startActiveWork = () => {
    if (!deliverableTime || !activeTask) return;
    
    setTimeRemaining(deliverableTime * 60);
    setIsRunning(true);
    setPhase("active");
    
    // Add initial dialogue from team
    const initialDialogue: DialogueMessage[] = [
      {
        id: 1,
        from: "twin",
        name: "Chief of Staff",
        message: `I'm coordinating the team for "${activeTask.title}". Here's the plan based on your kickoff answers.`,
        timestamp: new Date()
      },
      {
        id: 2,
        from: "expert",
        name: EXPERT_PROFILES[approvedTeam[0]]?.name || "Team Lead",
        message: "Team is assembled and ready. We'll deliver the first draft within the timeline.",
        timestamp: new Date()
      }
    ];
    
    const updatedTask = {
      ...activeTask,
      status: "active" as TaskStatus,
      assignedTo: approvedTeam,
      dialogue: initialDialogue
    };
    setActiveTask(updatedTask);
    updateTaskInList(updatedTask);
    
    toast.success("Expert team is now working!");
  };

  // Send message to team
  const sendMessage = (message: string) => {
    if (!activeTask || !message.trim()) return;
    
    const newMessage: DialogueMessage = {
      id: activeTask.dialogue.length + 1,
      from: "user",
      name: "You",
      message: message.trim(),
      timestamp: new Date()
    };
    
    const updatedTask = {
      ...activeTask,
      dialogue: [...activeTask.dialogue, newMessage]
    };
    setActiveTask(updatedTask);
    updateTaskInList(updatedTask);
    
    // Simulate response
    setTimeout(() => {
      const response: DialogueMessage = {
        id: updatedTask.dialogue.length + 1,
        from: activeTask.type === "twin" ? "twin" : "expert",
        name: activeTask.type === "twin" ? "Chief of Staff" : EXPERT_PROFILES[approvedTeam[0]]?.name || "Team",
        message: "Understood. I'll incorporate that feedback into the deliverable.",
        timestamp: new Date()
      };
      
      const withResponse = {
        ...updatedTask,
        dialogue: [...updatedTask.dialogue, response]
      };
      setActiveTask(withResponse);
      updateTaskInList(withResponse);
    }, 1500);
  };

  // Move to review phase
  const moveToReview = () => {
    if (!activeTask) return;
    
    setIsRunning(false);
    setPhase("review");
    
    const reviewDialogue: DialogueMessage = {
      id: activeTask.dialogue.length + 1,
      from: "twin",
      name: "Chief of Staff",
      message: "The deliverable is ready for your review. I've conducted a quality check and have some recommendations.",
      timestamp: new Date(),
      needsResponse: true
    };
    
    const updatedTask = {
      ...activeTask,
      status: "review" as TaskStatus,
      progress: 100,
      dialogue: [...activeTask.dialogue, reviewDialogue],
      deliverable: "Draft deliverable ready for review..."
    };
    setActiveTask(updatedTask);
    updateTaskInList(updatedTask);
  };

  // Complete task
  const completeTask = () => {
    if (!activeTask) return;
    
    const updatedTask = {
      ...activeTask,
      status: "completed" as TaskStatus
    };
    updateTaskInList(updatedTask);
    
    toast.success("Task completed successfully!");
    setActiveTask(null);
    setPhase("queue");
    setApprovedTeam([]);
    setRecommendedTeam([]);
    setKickoffQuestions([]);
  };

  // Voice recording toggle
  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      toast.info("Voice recording started...");
    } else {
      toast.success("Voice note captured");
    }
  };

  // Create new task from voice/template
  const createNewTask = () => {
    if (!mission.trim()) return;
    
    const newTask: PendingTask = {
      id: `task-${Date.now()}`,
      title: mission,
      description: "Custom task created from Action Engine",
      category: selectedTemplate === 1 ? "Communications" : selectedTemplate === 2 ? "Research" : "Custom",
      source: "manual",
      type: selectedTemplate === 1 ? "twin" : "team",
      status: "pending",
      progress: 0,
      dialogue: []
    };
    
    setTasks(prev => [newTask, ...prev]);
    setMission("");
    setSelectedTemplate(null);
    setPhase("queue");
    toast.success("Task added to queue");
  };

  // If viewing expert directory, show that instead
  if (viewMode === 'directory') {
    return (
      <FeatureGate feature="aiExperts" showOverlay={true}>
        <ExpertDirectory onBack={() => setViewMode('action')} />
      </FeatureGate>
    );
  }

  // If viewing My Board, show that instead
  if (viewMode === 'board') {
    return (
      <FeatureGate feature="aiExperts" showOverlay={true}>
        <div className="h-full bg-background text-foreground overflow-auto">
          <div className="border-b border-border bg-card/80 backdrop-blur-xl sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30">
                  <Star className="w-6 h-6 md:w-8 md:h-8 text-yellow-400" />
                </div>
                <div className="flex-1">
                  <h1 className="text-xl md:text-2xl font-display font-bold">My Board</h1>
                  <p className="text-muted-foreground text-sm">Your favorite experts for quick access</p>
                </div>
                <button
                  onClick={() => setViewMode('action')}
                  className="px-3 py-1 text-sm bg-primary/10 hover:bg-primary/20 text-primary rounded-full border border-primary/20 transition-colors"
                >
                  Back
                </button>
              </div>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6">
            <MyBoard />
          </div>
        </div>
      </FeatureGate>
    );
  }

  // If viewing War Room, show that instead
  if (viewMode === 'warroom') {
    return (
      <FeatureGate feature="aiExperts" showOverlay={true}>
        <div className="h-full bg-background text-foreground overflow-auto">
          <div className="border-b border-border bg-card/80 backdrop-blur-xl sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30">
                  <Swords className="w-6 h-6 md:w-8 md:h-8 text-orange-400" />
                </div>
                <div className="flex-1">
                  <h1 className="text-xl md:text-2xl font-display font-bold">War Room</h1>
                  <p className="text-muted-foreground text-sm">Multi-expert collaborative problem solving</p>
                </div>
                <button
                  onClick={() => setViewMode('action')}
                  className="px-3 py-1 text-sm bg-primary/10 hover:bg-primary/20 text-primary rounded-full border border-primary/20 transition-colors"
                >
                  Back
                </button>
              </div>
            </div>
          </div>
          <WarRoom />
        </div>
      </FeatureGate>
    );
  }

  // If viewing Analytics, show that instead
  if (viewMode === 'analytics') {
    return (
      <FeatureGate feature="aiExperts" showOverlay={true}>
        <div className="h-full bg-background text-foreground overflow-auto">
          <ExpertAnalytics />
        </div>
      </FeatureGate>
    );
  }

  // If viewing Scheduling, show that instead
  if (viewMode === 'scheduling') {
    return (
      <FeatureGate feature="aiExperts" showOverlay={true}>
        <div className="h-full bg-background text-foreground overflow-auto">
          <ExpertScheduling />
        </div>
      </FeatureGate>
    );
  }

  // If viewing External Resources, show that instead
  if (viewMode === 'external') {
    return (
      <FeatureGate feature="aiExperts" showOverlay={true}>
        <ExternalResources onBack={() => setViewMode('action')} />
      </FeatureGate>
    );
  }

  return (
    <FeatureGate feature="aiExperts" showOverlay={true}>
    <div className="h-full bg-background text-foreground overflow-auto">
      {/* Header */}
      <div className="border-b border-border bg-card/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            {mode === 'governed' && <RestrictedBadge />}
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30">
                <Zap className="w-6 h-6 md:w-8 md:h-8 text-cyan-400" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl md:text-2xl font-display font-bold">AI Action Engine</h1>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setViewMode('directory')}
                      className={`px-3 py-1 text-sm rounded-full border transition-colors flex items-center gap-1 ${
                        // @ts-ignore - viewMode type is correct
                        viewMode === 'directory'
                          ? 'bg-purple-500/30 text-purple-400 border-purple-500/50'
                          : 'bg-purple-500/10 hover:bg-purple-500/20 text-purple-400/70 border-purple-500/20'
                      }`}
                    >
                      <Users className="w-3 h-3" />
                      Directory
                    </button>
                    <button
                      onClick={() => setViewMode('board')}
                      className={`px-3 py-1 text-sm rounded-full border transition-colors flex items-center gap-1 ${
                        // @ts-ignore - viewMode type is correct
                        viewMode === 'board'
                          ? 'bg-yellow-500/30 text-yellow-400 border-yellow-500/50'
                          : 'bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400/70 border-yellow-500/20'
                      }`}
                    >
                      <Star className="w-3 h-3" />
                      My Board
                    </button>
                    <button
                      onClick={() => setViewMode('warroom')}
                      className={`px-3 py-1 text-sm rounded-full border transition-colors flex items-center gap-1 ${
                        // @ts-ignore - viewMode type is correct
                        viewMode === 'warroom'
                          ? 'bg-orange-500/30 text-orange-400 border-orange-500/50'
                          : 'bg-orange-500/10 hover:bg-orange-500/20 text-orange-400/70 border-orange-500/20'
                      }`}
                    >
                      <Swords className="w-3 h-3" />
                      War Room
                    </button>
                    <button
                      onClick={() => setViewMode('analytics')}
                      className={`px-3 py-1 text-sm rounded-full border transition-colors flex items-center gap-1 ${
                        // @ts-ignore - viewMode type is correct
                        viewMode === 'analytics'
                          ? 'bg-blue-500/30 text-blue-400 border-blue-500/50'
                          : 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-400/70 border-blue-500/20'
                      }`}
                    >
                      <BarChart3 className="w-3 h-3" />
                      Analytics
                    </button>
                    <button
                      onClick={() => setViewMode('scheduling')}
                      className={`px-3 py-1 text-sm rounded-full border transition-colors flex items-center gap-1 ${
                        // @ts-ignore - viewMode type is correct
                        viewMode === 'scheduling'
                          ? 'bg-green-500/30 text-green-400 border-green-500/50'
                          : 'bg-green-500/10 hover:bg-green-500/20 text-green-400/70 border-green-500/20'
                      }`}
                    >
                      <Calendar className="w-3 h-3" />
                      Schedule
                    </button>
                    <button
                      onClick={() => setViewMode('external')}
                      className={`px-3 py-1 text-sm rounded-full border transition-colors flex items-center gap-1 ${
                        // @ts-ignore - viewMode type is correct
                        viewMode === 'external'
                          ? 'bg-emerald-500/30 text-emerald-400 border-emerald-500/50'
                          : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400/70 border-emerald-500/20'
                      }`}
                    >
                      <Globe className="w-3 h-3" />
                      External
                    </button>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm">
                  {phase === "queue" ? "Your task queue" : 
                   phase === "active" ? "Task in progress" :
                   phase === "review" ? "Quality review" :
                   "Configure your mission"}
                </p>
              </div>
            </div>
            
            {/* Phase indicator */}
            <div className="hidden md:flex items-center gap-2">
              {["queue", "team", "kickoff", "timeline", "active", "review"].map((p, idx) => (
                <div key={p} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    phase === p ? "bg-primary text-primary-foreground" :
                    ["queue", "team", "kickoff", "timeline", "active", "review"].indexOf(phase) > idx ? "bg-primary/20 text-primary" :
                    "bg-secondary text-muted-foreground"
                  }`}>
                    {idx + 1}
                  </div>
                  {idx < 5 && <div className="w-4 h-px bg-border mx-1" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6">
        
        {/* Queue Phase - Show all pending tasks */}
        {phase === "queue" && (
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {MISSION_TEMPLATES.map((template) => (
                <Card 
                  key={template.id}
                  className={`cursor-pointer transition-all hover:border-primary/50 ${
                    selectedTemplate === template.id ? "border-primary bg-primary/5" : "bg-card/60 border-border"
                  }`}
                  onClick={() => {
                    setSelectedTemplate(template.id);
                    setPhase("mission");
                  }}
                >
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${
                      template.type === "twin" ? "bg-purple-500/20" : "bg-cyan-500/20"
                    }`}>
                      <template.icon className={`w-5 h-5 ${
                        template.type === "twin" ? "text-purple-400" : "text-cyan-400"
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-foreground">{template.title}</h3>
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                    </div>
                    <Badge className={template.type === "twin" ? "bg-purple-500/20 text-purple-400" : "bg-cyan-500/20 text-cyan-400"}>
                      {template.type === "twin" ? "Chief of Staff" : "Expert Team"}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Task Queue */}
            <Card className="bg-card/60 border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <ListChecks className="w-5 h-5 text-primary" />
                  Task Queue
                  <Badge className="ml-2">{tasks.filter(t => t.status === "pending").length} pending</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {tasks.filter(t => t.status !== "completed").length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Zap className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p>No pending tasks. Create a new mission above or action items from The Signal.</p>
                  </div>
                ) : (
                  tasks.filter(t => t.status !== "completed").map((task) => (
                    <div 
                      key={task.id}
                      className={`p-4 rounded-xl border transition-all ${
                        task.status === "active" ? "bg-cyan-500/5 border-cyan-500/30" :
                        task.status === "review" ? "bg-yellow-500/5 border-yellow-500/30" :
                        "bg-secondary/30 border-border hover:border-primary/30"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">{task.category}</Badge>
                            <Badge className={task.type === "twin" ? "bg-purple-500/20 text-purple-400 border-0" : "bg-cyan-500/20 text-cyan-400 border-0"}>
                              {task.type === "twin" ? <><Fingerprint className="w-3 h-3 mr-1" /> Chief of Staff</> : <><Users className="w-3 h-3 mr-1" /> Expert Team</>}
                            </Badge>
                            {task.status === "active" && (
                              <Badge className="bg-green-500/20 text-green-400 border-0">
                                <Play className="w-3 h-3 mr-1" /> Active
                              </Badge>
                            )}
                            {task.status === "review" && (
                              <Badge className="bg-yellow-500/20 text-yellow-400 border-0">
                                <Eye className="w-3 h-3 mr-1" /> Review
                              </Badge>
                            )}
                          </div>
                          <h3 className="font-bold text-foreground">{task.title}</h3>
                          <p className="text-sm text-muted-foreground">{task.description}</p>
                          
                          {task.status !== "pending" && (
                            <div className="mt-3">
                              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                                <span>Progress</span>
                                <span>{Math.round(task.progress)}%</span>
                              </div>
                              <Progress value={task.progress} className="h-2" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          {task.status === "pending" && (
                            <Button 
                              onClick={() => startTask(task)}
                              className="bg-primary hover:bg-primary/90"
                            >
                              <Play className="w-4 h-4 mr-2" /> Start
                            </Button>
                          )}
                          {(task.status === "active" || task.status === "review") && (
                            <Button 
                              variant="outline"
                              onClick={() => {
                                setActiveTask(task);
                                setPhase(task.status === "review" ? "review" : "active");
                                if (task.status === "active") {
                                  setIsRunning(true);
                                  setTimeRemaining(Math.max(0, (deliverableTime || 30) * 60 - Math.floor(task.progress * 0.6 * 60)));
                                }
                              }}
                            >
                              <Eye className="w-4 h-4 mr-2" /> View
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Voice Input */}
            <Card className="bg-card/60 border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Button
                    size="lg"
                    className={`h-14 w-14 rounded-full ${isRecording ? "bg-red-500 hover:bg-red-600" : "bg-primary hover:bg-primary/90"}`}
                    onClick={toggleRecording}
                  >
                    {isRecording ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                  </Button>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">
                      {isRecording ? "Recording... tap to stop" : "Tap to add a task by voice"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Describe what you need done and I'll route it appropriately
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Mission Phase - Define the task */}
        {phase === "mission" && (
          <div className="max-w-2xl mx-auto space-y-6">
            <Card className="bg-card/60 border-border">
              <CardHeader>
                <CardTitle className="text-foreground">What do you need done?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <textarea
                  value={mission}
                  onChange={(e) => setMission(e.target.value)}
                  placeholder="Describe your task..."
                  className="w-full h-32 p-4 rounded-xl bg-secondary/50 border border-border focus:border-primary focus:outline-none resize-none text-foreground placeholder:text-muted-foreground"
                />
                
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => { setPhase("queue"); setMission(""); setSelectedTemplate(null); }}>
                    Cancel
                  </Button>
                  <Button 
                    className="flex-1 bg-primary hover:bg-primary/90"
                    onClick={() => {
                      if (selectedTemplate === 1) {
                        // Communications - Chief of Staff
                        const newTask: PendingTask = {
                          id: `task-${Date.now()}`,
                          title: mission || "Draft Communications",
                          description: "Email or document drafting",
                          category: "Communications",
                          source: "manual",
                          type: "twin",
                          status: "pending",
                          progress: 0,
                          dialogue: []
                        };
                        setTasks(prev => [newTask, ...prev]);
                        startTask(newTask);
                      } else {
                        // Research or Custom - Expert Team
                        analyzeAndRecommendTeam();
                        setPhase("team");
                      }
                    }}
                    disabled={!mission.trim()}
                  >
                    <ArrowRight className="w-4 h-4 mr-2" />
                    {selectedTemplate === 1 ? "Start with Chief of Staff" : "Assemble Expert Team"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Team Phase */}
        {phase === "team" && (
          <div className="max-w-3xl mx-auto space-y-6">
            <Card className="bg-card/60 border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Recommended Expert Team</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground mb-4">
                  Based on your mission, I recommend these experts. Tap to add or remove.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(Object.keys(EXPERT_PROFILES) as Expert[]).map((key) => {
                    const expert = EXPERT_PROFILES[key];
                    const isRecommended = recommendedTeam.includes(key);
                    const isApproved = approvedTeam.includes(key);
                    
                    return (
                      <div
                        key={key}
                        onClick={() => {
                          if (isApproved) {
                            setApprovedTeam(prev => prev.filter(e => e !== key));
                          } else {
                            setApprovedTeam(prev => [...prev, key]);
                          }
                        }}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                          isApproved ? "bg-primary/10 border-primary" :
                          isRecommended ? "bg-cyan-500/5 border-cyan-500/30 hover:border-primary" :
                          "bg-secondary/30 border-border hover:border-primary/30"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                            isApproved ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                          }`}>
                            {expert.avatar}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-foreground">{expert.name}</p>
                            <p className="text-xs text-muted-foreground">{expert.role}</p>
                          </div>
                          {isRecommended && !isApproved && (
                            <Badge className="bg-cyan-500/20 text-cyan-400 border-0 text-xs">Recommended</Badge>
                          )}
                          {isApproved && (
                            <CheckCircle2 className="w-5 h-5 text-primary" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Button variant="outline" onClick={() => setPhase("queue")}>
                    Cancel
                  </Button>
                  <Button 
                    className="flex-1 bg-primary hover:bg-primary/90"
                    onClick={() => {
                      if (approvedTeam.length === 0) {
                        setApprovedTeam(recommendedTeam);
                      }
                      generateKickoffQuestions();
                    }}
                    disabled={approvedTeam.length === 0 && recommendedTeam.length === 0}
                  >
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Start Kickoff ({approvedTeam.length || recommendedTeam.length} experts)
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Kickoff Phase */}
        {phase === "kickoff" && kickoffQuestions.length > 0 && (
          <div className="max-w-2xl mx-auto space-y-6">
            <Card className="bg-card/60 border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-foreground">Quick Kickoff</CardTitle>
                  <Badge>{currentQuestionIndex + 1} / {kickoffQuestions.length}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <Progress value={((currentQuestionIndex + 1) / kickoffQuestions.length) * 100} className="h-2" />
                
                <div className="p-6 rounded-xl bg-secondary/30 border border-border">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-sm text-primary">
                      {EXPERT_PROFILES[kickoffQuestions[currentQuestionIndex].expertFrom]?.avatar}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {EXPERT_PROFILES[kickoffQuestions[currentQuestionIndex].expertFrom]?.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {EXPERT_PROFILES[kickoffQuestions[currentQuestionIndex].expertFrom]?.role}
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-lg text-foreground mb-6">
                    {kickoffQuestions[currentQuestionIndex].question}
                  </p>
                  
                  <div className="flex gap-4">
                    <Button 
                      size="lg"
                      className="flex-1 bg-green-500 hover:bg-green-600"
                      onClick={() => answerQuestion("yes")}
                    >
                      <ThumbsUp className="w-5 h-5 mr-2" /> Yes
                    </Button>
                    <Button 
                      size="lg"
                      className="flex-1 bg-red-500 hover:bg-red-600"
                      onClick={() => answerQuestion("no")}
                    >
                      <ThumbsDown className="w-5 h-5 mr-2" /> No
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Timeline Phase */}
        {phase === "timeline" && (
          <div className="max-w-2xl mx-auto space-y-6">
            <Card className="bg-card/60 border-border">
              <CardHeader>
                <CardTitle className="text-foreground">When do you need the first deliverable?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { value: 30, label: "30 min" },
                    { value: 60, label: "1 hour" },
                    { value: 120, label: "2 hours" },
                    { value: 240, label: "4 hours" },
                  ].map((option) => (
                    <Button
                      key={option.value}
                      variant={deliverableTime === option.value ? "default" : "outline"}
                      className={`h-16 ${deliverableTime === option.value ? "bg-primary" : ""}`}
                      onClick={() => setDeliverableTime(option.value)}
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      {option.label}
                    </Button>
                  ))}
                </div>
                
                <Button 
                  className="w-full h-12 bg-primary hover:bg-primary/90 mt-4"
                  onClick={startActiveWork}
                  disabled={!deliverableTime}
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Start Action Engine
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Active Phase */}
        {phase === "active" && activeTask && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Progress */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-card/60 border-border">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-foreground">{activeTask.title}</CardTitle>
                    <div className="flex items-center gap-4">
                      <div className="text-2xl font-mono font-bold text-primary">
                        {formatTime(timeRemaining)}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsRunning(!isRunning)}
                      >
                        {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                      <span>Progress</span>
                      <span>{Math.round(activeTask.progress)}%</span>
                    </div>
                    <Progress value={activeTask.progress} className="h-3" />
                  </div>
                  
                  {activeTask.progress >= 90 && (
                    <Button 
                      className="w-full bg-yellow-500 hover:bg-yellow-600 text-black"
                      onClick={moveToReview}
                    >
                      <Eye className="w-4 h-4 mr-2" /> Move to Review
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Dialogue */}
              <Card className="bg-card/60 border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <MessageSquare className="w-5 h-5" />
                    Activity & Dialogue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64 pr-4">
                    <div className="space-y-4">
                      {activeTask.dialogue.map((msg) => (
                        <div key={msg.id} className={`flex gap-3 ${msg.from === "user" ? "flex-row-reverse" : ""}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                            msg.from === "twin" ? "bg-purple-500/20 text-purple-400" :
                            msg.from === "user" ? "bg-primary text-primary-foreground" :
                            "bg-cyan-500/20 text-cyan-400"
                          }`}>
                            {msg.from === "twin" ? <Fingerprint className="w-4 h-4" /> :
                             msg.from === "user" ? "Y" :
                             msg.name.charAt(0)}
                          </div>
                          <div className={`flex-1 p-3 rounded-xl ${
                            msg.from === "user" ? "bg-primary/10" : "bg-secondary/50"
                          }`}>
                            <p className="text-xs text-muted-foreground mb-1">{msg.name}</p>
                            <p className="text-sm text-foreground">{msg.message}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  
                  {/* Message input */}
                  <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                    <Button
                      variant="outline"
                      size="icon"
                      className={isRecording ? "bg-red-500 text-white" : ""}
                      onClick={toggleRecording}
                    >
                      {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </Button>
                    <input
                      type="text"
                      placeholder="Send a message to the team..."
                      className="flex-1 px-4 py-2 rounded-lg bg-secondary/50 border border-border focus:border-primary focus:outline-none text-foreground"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && e.currentTarget.value) {
                          sendMessage(e.currentTarget.value);
                          e.currentTarget.value = "";
                        }
                      }}
                    />
                    <Button size="icon">
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Team */}
              {activeTask.type === "team" && approvedTeam.length > 0 && (
                <Card className="bg-card/60 border-border">
                  <CardHeader>
                    <CardTitle className="text-sm text-foreground">Active Team</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {approvedTeam.map((key) => {
                      const expert = EXPERT_PROFILES[key];
                      return (
                        <div key={key} className="flex items-center gap-2 p-2 rounded-lg bg-secondary/30">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                            {expert.avatar}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{expert.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{expert.role}</p>
                          </div>
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              )}

              {/* Chief of Staff Status */}
              {activeTask.type === "twin" && (
                <Card className="bg-purple-500/5 border-purple-500/30">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-purple-500/20">
                        <Fingerprint className="w-6 h-6 text-purple-400" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Chief of Staff</p>
                        <p className="text-sm text-purple-400">Working autonomously</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Back to Queue */}
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setPhase("queue")}
              >
                <ArrowRight className="w-4 h-4 mr-2 rotate-180" /> Back to Queue
              </Button>
            </div>
          </div>
        )}

        {/* Review Phase */}
        {phase === "review" && activeTask && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Review Mode Tabs */}
            <div className="flex gap-2 mb-4">
              <Button
                variant={validationMode === 'off' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setValidationMode('off')}
              >
                <Eye className="w-4 h-4 mr-2" />
                Standard Review
              </Button>
              <Button
                variant={validationMode === 'review' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setValidationMode('review')}
                className={validationMode === 'review' ? 'bg-amber-500 hover:bg-amber-600' : ''}
              >
                <FileText className="w-4 h-4 mr-2" />
                Truth Verification
              </Button>
              <Button
                variant={validationMode === 'challenge' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setValidationMode('challenge')}
                className={validationMode === 'challenge' ? 'bg-purple-500 hover:bg-purple-600' : ''}
              >
                <Fingerprint className="w-4 h-4 mr-2" />
                Chief of Staff QA
              </Button>
            </div>

            {/* Standard Review Mode */}
            {validationMode === 'off' && (
              <>
                <Card className="bg-yellow-500/5 border-yellow-500/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-foreground">
                      <Eye className="w-5 h-5 text-yellow-400" />
                      Quality Review
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 rounded-xl bg-secondary/30 border border-border">
                      <h3 className="font-bold text-foreground mb-2">{activeTask.title}</h3>
                      <p className="text-muted-foreground">{activeTask.deliverable || "Deliverable content here..."}</p>
                    </div>

                    {/* Chief of Staff Feedback */}
                    <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30">
                      <div className="flex items-center gap-3 mb-3">
                        <Fingerprint className="w-5 h-5 text-purple-400" />
                        <span className="font-medium text-foreground">Chief of Staff Review</span>
                      </div>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5" />
                          <span>Content aligns with your communication style</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5" />
                          <span>Key points are addressed</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5" />
                          <span>Consider adding more specific metrics (optional)</span>
                        </li>
                      </ul>
                    </div>

                    <div className="flex gap-3">
                      <Button 
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          toast.info("Sending back for revision...");
                          setPhase("active");
                          setIsRunning(true);
                        }}
                      >
                        <RefreshCw className="w-4 h-4 mr-2" /> Request Revision
                      </Button>
                      <Button 
                        className="flex-1 bg-green-500 hover:bg-green-600"
                        onClick={completeTask}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" /> Approve & Complete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Truth Verification Mode */}
            {validationMode === 'review' && (
              <>
                <Card className="bg-amber-500/5 border-amber-500/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-foreground">
                      <FileText className="w-5 h-5 text-amber-400" />
                      Truth Verification & Citation Check
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Each statement is classified as Fact, Analysis, Opinion, or Speculation. 
                      Facts require source citations. All claims must be verifiable.
                    </p>
                    
                    {/* Sample statements for verification */}
                    <div className="space-y-3">
                      {[
                        { content: "Market size is projected to reach $50B by 2027", classification: 'fact' as StatementClassification, confidence: 'high' as ConfidenceLevel, needsSource: true },
                        { content: "Based on the data, we recommend focusing on enterprise clients", classification: 'analysis' as StatementClassification, confidence: 'medium' as ConfidenceLevel, needsSource: false },
                        { content: "The competitor's approach seems less efficient", classification: 'opinion' as StatementClassification, confidence: 'low' as ConfidenceLevel, needsSource: false },
                      ].map((stmt, idx) => (
                        <div key={idx} className="p-4 rounded-xl bg-secondary/30 border border-border">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <p className="text-foreground flex-1">{stmt.content}</p>
                            <div className="flex items-center gap-2">
                              <ClassificationBadge classification={stmt.classification} size="sm" />
                              <ConfidenceBadge confidence={stmt.confidence} size="sm" showLabel={false} />
                            </div>
                          </div>
                          {stmt.needsSource && (
                            <div className="flex items-center gap-2 text-xs text-orange-400">
                              <AlertCircle className="w-3 h-3" />
                              <span>Requires source citation</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-3">
                      <Button 
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          toast.info("Requesting source citations...");
                        }}
                      >
                        <FileText className="w-4 h-4 mr-2" /> Request Citations
                      </Button>
                      <Button 
                        className="flex-1 bg-green-500 hover:bg-green-600"
                        onClick={completeTask}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" /> All Verified
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Chief of Staff QA Mode */}
            {validationMode === 'challenge' && (
              <>
                <Card className="bg-purple-500/5 border-purple-500/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-foreground">
                      <Fingerprint className="w-5 h-5 text-purple-400" />
                      Chief of Staff QA Challenge
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Your Chief of Staff will challenge each expert's statements to verify accuracy 
                      and identify potential hallucinations or unsupported claims.
                    </p>
                    
                    {/* QA Challenge Questions */}
                    <div className="space-y-3">
                      {QA_CHALLENGE_PROMPTS.hallucination_detection.slice(0, 3).map((question, idx) => (
                        <div key={idx} className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30">
                          <div className="flex items-center gap-2 mb-2">
                            <Fingerprint className="w-4 h-4 text-purple-400" />
                            <span className="text-sm font-medium text-purple-400">Chief of Staff Challenge #{idx + 1}</span>
                          </div>
                          <p className="text-foreground text-sm">{question}</p>
                          <div className="flex gap-2 mt-3">
                            <Button size="sm" variant="outline" className="text-xs">
                              <ThumbsUp className="w-3 h-3 mr-1" /> Verified
                            </Button>
                            <Button size="sm" variant="outline" className="text-xs text-orange-500">
                              <AlertCircle className="w-3 h-3 mr-1" /> Needs Revision
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-4 rounded-xl bg-secondary/30 border border-border">
                      <div className="flex items-center gap-2 mb-2">
                        <Brain className="w-4 h-4 text-cyan-400" />
                        <span className="text-sm font-medium text-foreground">Expert Response Required</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        The expert must respond to each challenge with evidence or clarification. 
                        Unsubstantiated claims will be flagged for revision.
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <Button 
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          toast.info("Running full QA challenge sequence...");
                        }}
                      >
                        <Fingerprint className="w-4 h-4 mr-2" /> Run Full QA
                      </Button>
                      <Button 
                        className="flex-1 bg-green-500 hover:bg-green-600"
                        onClick={completeTask}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" /> QA Passed
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Dialogue History - Always visible */}
            <Card className="bg-card/60 border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Full Dialogue History</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-48">
                  <div className="space-y-3">
                    {activeTask.dialogue.map((msg) => (
                      <div key={msg.id} className="flex gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          msg.from === "twin" ? "bg-purple-500/20 text-purple-400" :
                          msg.from === "user" ? "bg-primary/20 text-primary" :
                          "bg-cyan-500/20 text-cyan-400"
                        }`}>
                          {msg.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">{msg.name}</p>
                          <p className="text-sm text-foreground">{msg.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
    </FeatureGate>
  );
}
