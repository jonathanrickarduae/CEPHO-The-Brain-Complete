import React, { useState, useRef, useEffect } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {} from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Users,
  Calendar,
  Vote,
  TrendingUp,
  Brain,
  Cpu,
  Zap,
  Sparkles,
  Target,
  Shield,
  Rocket,
  Globe,
  Award,
  Video,
  MessageSquare,
  Send,
  Loader2,
  X,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface BoardMember {
  id: string;
  name: string;
  title: string;
  company: string;
  expertise: string;
  icon: React.ElementType;
  color: string;
  status: "active" | "available";
  lastConsultation?: string;
  contributionScore: number;
  achievements: string[];
}

interface ChatMessage {
  id: string;
  role: "user" | "expert";
  content: string;
  timestamp: string;
}

const BOARD_MEMBERS: BoardMember[] = [
  {
    id: "altman",
    name: "Sam Altman",
    title: "CEO",
    company: "OpenAI",
    expertise: "AGI Development & AI Safety",
    icon: Brain,
    color: "emerald",
    status: "active",
    lastConsultation: "2 days ago",
    contributionScore: 99,
    achievements: [
      "ChatGPT Launch",
      "GPT-4 Development",
      "AI Safety Leadership",
    ],
  },
  {
    id: "huang",
    name: "Jensen Huang",
    title: "CEO",
    company: "NVIDIA",
    expertise: "AI Hardware & Computing Infrastructure",
    icon: Cpu,
    color: "green",
    status: "active",
    lastConsultation: "1 week ago",
    contributionScore: 98,
    achievements: ["GPU Revolution", "AI Computing Platform", "CUDA Ecosystem"],
  },
  {
    id: "amodei",
    name: "Dario Amodei",
    title: "CEO",
    company: "Anthropic",
    expertise: "Constitutional AI & Safety Research",
    icon: Shield,
    color: "blue",
    status: "active",
    lastConsultation: "3 days ago",
    contributionScore: 97,
    achievements: ["Claude AI", "Constitutional AI", "AI Alignment Research"],
  },
  {
    id: "hassabis",
    name: "Sir Demis Hassabis",
    title: "CEO",
    company: "Google DeepMind",
    expertise: "AI Research & Nobel Prize Winner",
    icon: Award,
    color: "purple",
    status: "active",
    lastConsultation: "4 days ago",
    contributionScore: 99,
    achievements: ["AlphaGo", "AlphaFold", "Nobel Prize in Chemistry 2024"],
  },
  {
    id: "pichai",
    name: "Sundar Pichai",
    title: "CEO",
    company: "Alphabet & Google",
    expertise: "AI Integration & Product Strategy",
    icon: Globe,
    color: "red",
    status: "active",
    lastConsultation: "5 days ago",
    contributionScore: 96,
    achievements: ["Gemini AI", "Google AI Integration", "AI-First Strategy"],
  },
  {
    id: "musk",
    name: "Elon Musk",
    title: "Founder",
    company: "xAI",
    expertise: "AI Innovation & Grok Development",
    icon: Rocket,
    color: "orange",
    status: "active",
    lastConsultation: "1 week ago",
    contributionScore: 95,
    achievements: ["Grok AI", "Neuralink", "Tesla Autopilot"],
  },
  {
    id: "lecun",
    name: "Yann LeCun",
    title: "Chief AI Scientist",
    company: "Meta",
    expertise: "Deep Learning & Neural Networks",
    icon: Brain,
    color: "indigo",
    status: "active",
    lastConsultation: "6 days ago",
    contributionScore: 98,
    achievements: [
      "Turing Award",
      "Convolutional Neural Networks",
      "Meta AI Research",
    ],
  },
  {
    id: "hinton",
    name: "Geoffrey Hinton",
    title: "Godfather of AI",
    company: "Independent Researcher",
    expertise: "Neural Networks & AI Safety Advocacy",
    icon: Award,
    color: "amber",
    status: "active",
    lastConsultation: "1 week ago",
    contributionScore: 99,
    achievements: ["Turing Award", "Backpropagation", "AI Safety Advocacy"],
  },
  {
    id: "ng",
    name: "Andrew Ng",
    title: "Founder",
    company: "DeepLearning.AI",
    expertise: "AI Education & Democratization",
    icon: Sparkles,
    color: "cyan",
    status: "active",
    lastConsultation: "3 days ago",
    contributionScore: 96,
    achievements: ["Coursera AI Courses", "Google Brain", "Landing AI"],
  },
  {
    id: "li",
    name: "Fei-Fei Li",
    title: "Co-Director",
    company: "Stanford HAI",
    expertise: "Computer Vision & Human-Centered AI",
    icon: Target,
    color: "pink",
    status: "active",
    lastConsultation: "4 days ago",
    contributionScore: 97,
    achievements: ["ImageNet", "Stanford HAI", "Human-Centered AI"],
  },
  {
    id: "nadella",
    name: "Satya Nadella",
    title: "CEO",
    company: "Microsoft",
    expertise: "AI Enterprise Integration",
    icon: Globe,
    color: "blue",
    status: "active",
    lastConsultation: "1 week ago",
    contributionScore: 95,
    achievements: ["Microsoft Copilot", "Azure AI", "OpenAI Partnership"],
  },
  {
    id: "srinivas",
    name: "Aravind Srinivas",
    title: "CEO",
    company: "Perplexity AI",
    expertise: "AI Search & Information Retrieval",
    icon: Zap,
    color: "violet",
    status: "active",
    lastConsultation: "2 days ago",
    contributionScore: 93,
    achievements: ["Perplexity AI", "AI-Powered Search", "Answer Engine"],
  },
  {
    id: "jassy",
    name: "Andy Jassy",
    title: "CEO",
    company: "Amazon",
    expertise: "AI Cloud Infrastructure",
    icon: Cpu,
    color: "orange",
    status: "active",
    lastConsultation: "5 days ago",
    contributionScore: 94,
    achievements: ["AWS AI Services", "Amazon Bedrock", "Alexa AI"],
  },
  {
    id: "cook",
    name: "Tim Cook",
    title: "CEO",
    company: "Apple",
    expertise: "AI Privacy & On-Device Intelligence",
    icon: Shield,
    color: "slate",
    status: "active",
    lastConsultation: "1 week ago",
    contributionScore: 94,
    achievements: ["Apple Intelligence", "Privacy-First AI", "Neural Engine"],
  },
];

const UPCOMING_MEETINGS = [
  {
    id: 1,
    title: "AI Strategy & Market Positioning",
    date: "March 15, 2026",
    time: "10:00 AM",
    attendees: 14,
    agenda: [
      "AGI Timeline Discussion",
      "Competitive Landscape",
      "Safety & Ethics",
    ],
  },
  {
    id: 2,
    title: "Technology Roadmap Review",
    date: "April 1, 2026",
    time: "2:00 PM",
    attendees: 14,
    agenda: [
      "Infrastructure Scaling",
      "Model Architecture",
      "Research Priorities",
    ],
  },
];

const RECENT_DECISIONS = [
  {
    id: 1,
    title: "Adopt Constitutional AI Framework",
    date: "February 15, 2026",
    outcome: "Approved",
    votes: { for: 13, against: 1, abstain: 0 },
  },
  {
    id: 2,
    title: "Increase AI Safety Research Budget",
    date: "February 10, 2026",
    outcome: "Approved",
    votes: { for: 14, against: 0, abstain: 0 },
  },
];

export default function PersephoneBoard() {
  // Consultation modal state
  const [consultingMember, setConsultingMember] = useState<BoardMember | null>(
    null
  );
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isStarting, setIsStarting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // tRPC mutations
  const startSession = trpc.expertChat.startSession.useMutation();
  const sendMessage = trpc.expertChat.sendMessage.useMutation();

  // ─── Autonomous Execution Engine ─────────────────────────────────────────────────
  const [executionGoal, setExecutionGoal] = useState("");
  const [executionResult, setExecutionResult] = useState<null | {
    projectName: string;
    tasksCreated: number;
    phasesCreated: number;
    plan: {
      estimatedDuration: string;
      phases: { name: string; agent: string; taskCount: number }[];
    };
  }>(null);
  const executeGoal = trpc.autonomousExecution.execute.useMutation({
    onSuccess: data => {
      setExecutionResult(
        data.plan
          ? {
              projectName: data.project.name,
              tasksCreated: data.tasksCreated,
              phasesCreated: data.phasesCreated,
              plan: data.plan,
            }
          : null
      );
      toast.success(
        `Project "${data.project.name}" created with ${data.tasksCreated} tasks across ${data.phasesCreated} phases.`
      );
      setExecutionGoal("");
    },
    onError: () =>
      toast.error(
        "Execution failed: Could not process your goal. Please try again."
      ),
  });
  const { data: recentExecutions } =
    trpc.autonomousExecution.getRecentExecutions.useQuery();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleConsult = async (member: BoardMember) => {
    setConsultingMember(member);
    setMessages([]);
    setSessionId(null);
    setIsStarting(true);

    try {
      const session = await startSession.mutateAsync({
        expertId: member.id,
        expertName: member.name,
      });
      setSessionId(session.sessionId);
      setMessages([
        {
          id: crypto.randomUUID(),
          role: "expert",
          content: session.greeting,
          timestamp: session.startedAt,
        },
      ]);
    } catch {
      toast.error(
        "Connection failed: Could not connect to the board member. Please try again."
      );
      setConsultingMember(null);
    } finally {
      setIsStarting(false);
    }
  };

  const handleSend = async () => {
    if (!inputMessage.trim() || !consultingMember || sessionId === null) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: inputMessage.trim(),
      timestamp: new Date().toISOString(),
    };

    const history = messages
      .filter(m => m.role === "user" || m.role === "expert")
      .map(m => ({
        role: (m.role === "expert" ? "assistant" : "user") as
          | "user"
          | "assistant",
        content: m.content,
      }));

    setMessages(prev => [...prev, userMsg]);
    setInputMessage("");

    try {
      const response = await sendMessage.mutateAsync({
        sessionId,
        expertId: consultingMember.id,
        message: userMsg.content,
        conversationHistory: history,
      });
      setMessages(prev => [
        ...prev,
        {
          id: response.id,
          role: "expert",
          content: response.content,
          timestamp: response.timestamp,
        },
      ]);
    } catch {
      toast.error(
        "Message failed: Could not send your message. Please try again."
      );
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  const handleCloseConsultation = () => {
    setConsultingMember(null);
    setMessages([]);
    setSessionId(null);
    setInputMessage("");
  };

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; border: string }> =
      {
        emerald: {
          bg: "bg-emerald-500/10",
          text: "text-emerald-400",
          border: "border-emerald-500/30",
        },
        green: {
          bg: "bg-green-500/10",
          text: "text-green-400",
          border: "border-green-500/30",
        },
        blue: {
          bg: "bg-primary/10",
          text: "text-primary",
          border: "border-blue-500/30",
        },
        purple: {
          bg: "bg-purple-500/10",
          text: "text-purple-400",
          border: "border-purple-500/30",
        },
        red: {
          bg: "bg-red-500/10",
          text: "text-red-400",
          border: "border-red-500/30",
        },
        orange: {
          bg: "bg-orange-500/10",
          text: "text-orange-400",
          border: "border-orange-500/30",
        },
        indigo: {
          bg: "bg-indigo-500/10",
          text: "text-indigo-400",
          border: "border-indigo-500/30",
        },
        amber: {
          bg: "bg-amber-500/10",
          text: "text-amber-400",
          border: "border-amber-500/30",
        },
        cyan: {
          bg: "bg-cyan-500/10",
          text: "text-cyan-400",
          border: "border-cyan-500/30",
        },
        pink: {
          bg: "bg-pink-500/10",
          text: "text-pink-400",
          border: "border-pink-500/30",
        },
        violet: {
          bg: "bg-violet-500/10",
          text: "text-violet-400",
          border: "border-violet-500/30",
        },
        slate: {
          bg: "bg-slate-500/10",
          text: "text-slate-400",
          border: "border-slate-500/30",
        },
      };
    return colors[color] || colors.blue;
  };

  const activeMember = consultingMember;
  const activeColors = activeMember
    ? getColorClasses(activeMember.color)
    : null;
  const ActiveIcon = activeMember?.icon;

  return (
    <PageShell
      icon={Users}
      iconClass="bg-purple-500/15 text-purple-400"
      title="Persephone Board"
      subtitle="Virtual Board of 14 Top AI Leaders — Strategic Oversight & Industry Guidance"
    >
      <div className="space-y-5">
        {/* ─── Autonomous Execution Command Bar ─────────────────────────────── */}
        <Card className="border-primary/40 bg-gradient-to-br from-primary/10 via-purple-500/5 to-background">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Rocket className="w-5 h-5 text-primary" />
              Autonomous Execution Engine
              <Badge
                variant="outline"
                className="ml-auto text-xs border-primary/40 text-primary"
              >
                One-Sentence Execution
              </Badge>
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              State your goal in one sentence. CEPHO will consult your Digital
              Twin, decompose the goal, and create a full project plan with
              tasks assigned to specialist agents.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <input
                className="flex-1 bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="e.g. Launch a new B2B SaaS product in the UAE market within 6 months..."
                value={executionGoal}
                onChange={e => setExecutionGoal(e.target.value)}
                onKeyDown={e =>
                  e.key === "Enter" &&
                  !executeGoal.isPending &&
                  executionGoal.trim().length >= 5 &&
                  executeGoal.mutate({ goal: executionGoal, autoApprove: true })
                }
                disabled={executeGoal.isPending}
              />
              <Button
                onClick={() =>
                  executeGoal.mutate({ goal: executionGoal, autoApprove: true })
                }
                disabled={
                  executeGoal.isPending || executionGoal.trim().length < 5
                }
                className="gap-2"
              >
                {executeGoal.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Rocket className="w-4 h-4" />
                )}
                {executeGoal.isPending ? "Executing..." : "Execute"}
              </Button>
            </div>
            {executionResult && (
              <div className="rounded-md border border-emerald-500/30 bg-emerald-500/5 p-3 space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-emerald-400">
                  <Sparkles className="w-4 h-4" />
                  Project Created: {executionResult.projectName}
                </div>
                <div className="text-xs text-muted-foreground">
                  {executionResult.tasksCreated} tasks across{" "}
                  {executionResult.phasesCreated} phases &bull; Est.{" "}
                  {executionResult.plan.estimatedDuration}
                </div>
                <div className="flex flex-wrap gap-1">
                  {executionResult.plan.phases.map(p => (
                    <Badge key={p.name} variant="outline" className="text-xs">
                      {p.agent}: {p.taskCount} tasks
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {recentExecutions && recentExecutions.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-medium">
                  Recent Executions
                </p>
                {recentExecutions.slice(0, 3).map(ex => (
                  <div
                    key={ex.id}
                    className="flex items-center justify-between text-xs p-2 rounded bg-muted/30"
                  >
                    <span className="font-medium truncate max-w-[60%]">
                      {ex.name}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {ex.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Board Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-background">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="w-4 h-4" />
                AI Leaders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-400">14</div>
              <p className="text-xs text-muted-foreground mt-1">
                Active members
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-background">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Consultations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">247</div>
              <p className="text-xs text-muted-foreground mt-1">
                Total sessions
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-gradient-to-br from-muted/10 to-background">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Next Meeting
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">Mar 15</div>
              <p className="text-xs text-muted-foreground mt-1">
                AI Strategy Review
              </p>
            </CardContent>
          </Card>

          <Card className="border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-background">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Board Impact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-400">97%</div>
              <p className="text-xs text-muted-foreground mt-1">Avg score</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            variant="outline"
            className="h-auto py-4 border-purple-500/30 hover:bg-purple-500/10"
          >
            <div className="flex items-center gap-3">
              <Video className="w-5 h-5 text-purple-400" />
              <div className="text-left">
                <div className="font-semibold text-foreground">
                  Schedule Board Meeting
                </div>
                <div className="text-xs text-muted-foreground">
                  Convene all 14 leaders
                </div>
              </div>
            </div>
          </Button>
          <Button
            variant="outline"
            className="h-auto py-4 border-primary/30 hover:bg-primary/10"
          >
            <div className="flex items-center gap-3">
              <Vote className="w-5 h-5 text-primary" />
              <div className="text-left">
                <div className="font-semibold text-foreground">
                  Request Board Vote
                </div>
                <div className="text-xs text-muted-foreground">
                  Submit a resolution
                </div>
              </div>
            </div>
          </Button>
          <Button
            variant="outline"
            className="h-auto py-4 border-emerald-500/30 hover:bg-emerald-500/10"
          >
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-emerald-400" />
              <div className="text-left">
                <div className="font-semibold text-foreground">
                  Board Briefing
                </div>
                <div className="text-xs text-muted-foreground">
                  Submit strategic update
                </div>
              </div>
            </div>
          </Button>
        </div>

        {/* Board Members Grid */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg text-foreground flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-400" />
              Board Members
              <Badge variant="outline" className="ml-2 text-xs">
                Click to Consult
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {BOARD_MEMBERS.map(member => {
                const Icon = member.icon;
                const colors = getColorClasses(member.color);
                return (
                  <Card
                    key={member.id}
                    className={`border ${colors.border} ${colors.bg} cursor-pointer hover:scale-[1.02] transition-all duration-200 hover:shadow-lg hover:shadow-${member.color}-500/10`}
                    onClick={() => void handleConsult(member)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <div
                          className={`p-2 rounded-lg ${colors.bg} border ${colors.border} flex-shrink-0`}
                        >
                          <Icon className={`w-5 h-5 ${colors.text}`} />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-foreground text-sm leading-tight">
                            {member.name}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {member.title}
                          </p>
                          <p className={`text-xs font-medium ${colors.text}`}>
                            {member.company}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                        {member.expertise}
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge
                            className={`${colors.bg} ${colors.text} border-0 text-xs`}
                          >
                            Impact: {member.contributionScore}
                          </Badge>
                          {member.lastConsultation && (
                            <span className="text-xs text-muted-foreground">
                              {member.lastConsultation}
                            </span>
                          )}
                        </div>
                        <div className="pt-2 border-t border-border/30">
                          <ul className="space-y-0.5">
                            {member.achievements
                              .slice(0, 2)
                              .map((achievement, idx) => (
                                <li
                                  key={idx}
                                  className="text-xs text-muted-foreground truncate"
                                >
                                  • {achievement}
                                </li>
                              ))}
                          </ul>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className={`w-full mt-2 text-xs h-7 border ${colors.border} ${colors.text} hover:${colors.bg}`}
                          onClick={e => {
                            e.stopPropagation();
                            void handleConsult(member);
                          }}
                        >
                          <MessageSquare className="w-3 h-3 mr-1" />
                          Consult
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Meetings & Recent Decisions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg text-foreground flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Upcoming Board Meetings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {UPCOMING_MEETINGS.map(meeting => (
                <div
                  key={meeting.id}
                  className="p-4 border border-border/50 rounded-lg bg-muted/20"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-foreground">
                        {meeting.title}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {meeting.date} at {meeting.time}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {meeting.attendees} leaders attending
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-border/30">
                    <p className="text-xs text-muted-foreground mb-2">
                      Agenda:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {meeting.agenda.map((item, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg text-foreground flex items-center gap-2">
                <Vote className="w-5 h-5 text-emerald-400" />
                Recent Board Decisions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {RECENT_DECISIONS.map(decision => (
                <div
                  key={decision.id}
                  className="p-4 border border-border/50 rounded-lg bg-muted/20"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground">
                        {decision.title}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {decision.date}
                      </p>
                    </div>
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                      {decision.outcome}
                    </Badge>
                  </div>
                  <div className="pt-3 border-t border-border/30">
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-emerald-400">
                        For: {decision.votes.for}
                      </span>
                      <span className="text-red-400">
                        Against: {decision.votes.against}
                      </span>
                      {decision.votes.abstain > 0 && (
                        <span className="text-muted-foreground">
                          Abstain: {decision.votes.abstain}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* ─── Consultation Modal ─────────────────────────────────────────────── */}
        <Dialog
          open={consultingMember !== null}
          onOpenChange={open => {
            if (!open) handleCloseConsultation();
          }}
        >
          <DialogContent className="max-w-2xl h-[80vh] flex flex-col p-0 gap-0">
            {activeMember && activeColors && ActiveIcon && (
              <>
                {/* Modal Header */}
                <DialogHeader
                  className={`px-6 py-4 border-b border-border ${activeColors.bg} flex-shrink-0`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg border ${activeColors.border} ${activeColors.bg}`}
                      >
                        <ActiveIcon
                          className={`w-5 h-5 ${activeColors.text}`}
                        />
                      </div>
                      <div>
                        <DialogTitle className="text-foreground text-base font-bold">
                          {activeMember.name}
                        </DialogTitle>
                        <p className="text-xs text-muted-foreground">
                          {activeMember.title} · {activeMember.company}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={handleCloseConsultation}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 italic">
                    {activeMember.expertise}
                  </p>
                </DialogHeader>

                {/* Chat Messages */}
                <div
                  ref={scrollRef}
                  className="flex-1 overflow-y-auto px-6 py-4 space-y-4"
                >
                  {isStarting ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="flex flex-col items-center gap-3 text-muted-foreground">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <p className="text-sm">
                          Connecting to {activeMember.name}…
                        </p>
                      </div>
                    </div>
                  ) : (
                    messages.map(msg => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        {msg.role === "expert" && (
                          <div
                            className={`p-1.5 rounded-full border ${activeColors.border} ${activeColors.bg} mr-2 flex-shrink-0 self-start mt-1`}
                          >
                            <ActiveIcon
                              className={`w-3.5 h-3.5 ${activeColors.text}`}
                            />
                          </div>
                        )}
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                            msg.role === "user"
                              ? "bg-primary text-primary-foreground rounded-br-sm"
                              : `${activeColors.bg} border ${activeColors.border} text-foreground rounded-bl-sm`
                          }`}
                        >
                          {msg.content}
                        </div>
                      </div>
                    ))
                  )}
                  {sendMessage.isPending && (
                    <div className="flex justify-start">
                      <div
                        className={`p-1.5 rounded-full border ${activeColors.border} ${activeColors.bg} mr-2 flex-shrink-0 self-start mt-1`}
                      >
                        <ActiveIcon
                          className={`w-3.5 h-3.5 ${activeColors.text}`}
                        />
                      </div>
                      <div
                        className={`${activeColors.bg} border ${activeColors.border} rounded-2xl rounded-bl-sm px-4 py-3`}
                      >
                        <div className="flex gap-1 items-center">
                          <div
                            className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce"
                            style={{ animationDelay: "0ms" }}
                          />
                          <div
                            className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce"
                            style={{ animationDelay: "150ms" }}
                          />
                          <div
                            className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce"
                            style={{ animationDelay: "300ms" }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input Area */}
                <div className="px-6 py-4 border-t border-border flex-shrink-0">
                  <div className="flex gap-3 items-end">
                    <Textarea
                      value={inputMessage}
                      onChange={e => setInputMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={`Ask ${activeMember.name} anything…`}
                      className="flex-1 min-h-[60px] max-h-[120px] resize-none text-sm"
                      disabled={isStarting || sendMessage.isPending}
                    />
                    <Button
                      onClick={() => void handleSend()}
                      disabled={
                        !inputMessage.trim() ||
                        isStarting ||
                        sendMessage.isPending ||
                        sessionId === null
                      }
                      className="bg-primary hover:bg-primary/90 h-10 w-10 p-0 flex-shrink-0"
                    >
                      {sendMessage.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Press Enter to send · Shift+Enter for new line
                  </p>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </PageShell>
  );
}
