// @ts-nocheck
import { useState } from "react";
import { useLocation } from "wouter";
import {
  Sun,
  Calendar,
  TrendingUp,
  Brain,
  Zap,
  CheckCircle2,
  Clock,
  ArrowRight,
  Download,
  Play,
  Headphones,
  AlertTriangle,
  Lightbulb,
  Video,
  FileText,
  ThumbsUp,
  RotateCcw,
  UserPlus,
  User,
  ListChecks,
  Eye,
  Mail,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface ActionItem {
  id: string;
  title: string;
  description: string;
  priority: "urgent" | "high" | "medium" | "low";
  category: string;
  source: "schedule" | "email" | "intelligence" | "recommendation";
  time?: string;
  status?: "pending" | "delegated" | "in_progress" | "completed";
  assignedTo?: string;
}

export default function TheSignal() {
  const [, setLocation] = useLocation();
  const [showVictoriaBrief, setShowVictoriaBrief] = useState(true);
  const [actionItems, setActionItems] = useState<ActionItem[]>([
    // From Schedule
    {
      id: "1",
      title: "Team Standup",
      description: "09:00 - 30m with Sarah L., Marcus T., Dev Team",
      priority: "medium",
      category: "Meeting",
      source: "schedule",
      time: "09:00",
      status: "pending",
    },
    {
      id: "2",
      title: "Space Shuttle Blueprint Review",
      description: "10:00 - 1h with Expert Panel, Engineering",
      priority: "high",
      category: "Meeting",
      source: "schedule",
      time: "10:00",
      status: "pending",
    },
    {
      id: "3",
      title: "Lunch with Investor",
      description:
        "12:00 - 1h with James K. (VC Partner) at The Capital Grille",
      priority: "high",
      category: "External",
      source: "schedule",
      time: "12:00",
      status: "pending",
    },
    {
      id: "4",
      title: "Q3 Budget Sign-off",
      description: "14:00 - DEADLINE: Finance team needs approval",
      priority: "urgent",
      category: "Deadline",
      source: "schedule",
      time: "14:00",
      status: "pending",
    },

    // From Emails
    {
      id: "5",
      title: "Respond to VC Partner",
      description: "James K.: Lunch meeting confirmation - term sheet drafts",
      priority: "high",
      category: "Email",
      source: "email",
      status: "pending",
    },
    {
      id: "6",
      title: "Approve Q3 Budget",
      description: "Sarah L. (CFO): Final review needed by 2pm",
      priority: "urgent",
      category: "Email",
      source: "email",
      status: "pending",
    },
    {
      id: "7",
      title: "EU Regulations Review",
      description: "Legal Team: Action required for Q4 compliance",
      priority: "high",
      category: "Email",
      source: "email",
      status: "pending",
    },

    // From Intelligence
    {
      id: "8",
      title: "Review Competitor AI Tool Launch",
      description:
        "Competitor X launched AI bid tool - verify 15% efficiency claims",
      priority: "medium",
      category: "Intelligence",
      source: "intelligence",
      status: "pending",
    },
    {
      id: "9",
      title: "Assess AI Regulation Impact",
      description: "New draft legislation could impact autonomous systems",
      priority: "medium",
      category: "Intelligence",
      source: "intelligence",
      status: "pending",
    },

    // From Twin Recommendations
    {
      id: "10",
      title: "Delegate Budget Details to CFO",
      description: "Based on your pattern - 92% confidence",
      priority: "low",
      category: "Recommendation",
      source: "recommendation",
      status: "pending",
    },
    {
      id: "11",
      title: "Prepare Investor Talking Points",
      description: "Draft ready - 3 key metrics prepared - 87% confidence",
      priority: "medium",
      category: "Recommendation",
      source: "recommendation",
      status: "pending",
    },
  ]);

  const delegateTaskMutation = trpc.cosTasks.delegateTask.useMutation({
    onSuccess: data => {
      toast.success(`Delegated to Chief of Staff: ${data.task.title}`);
      if (data.assignedAgent) {
        toast.info(`Assigned to ${data.assignedAgent.name}`);
      }
    },
    onError: error => {
      toast.error(`Failed to delegate: ${error.message}`);
    },
  });

  const handleDelegate = (item: ActionItem) => {
    // Delegate to Chief of Staff via tRPC
    delegateTaskMutation.mutate({
      title: item.title,
      description: item.description,
      priority: item.priority,
      category: item.category,
      source: item.source,
      time: item.time,
    });

    // Update local state
    setActionItems(prev =>
      prev.map(i =>
        i.id === item.id
          ? { ...i, status: "delegated", assignedTo: "Chief of Staff" }
          : i
      )
    );
  };

  const handleTakeitOn = (item: ActionItem) => {
    // Mark as in progress
    setActionItems(prev =>
      prev.map(i =>
        i.id === item.id
          ? { ...i, status: "in_progress", assignedTo: "You" }
          : i
      )
    );
    toast.info(`You're working on: ${item.title}`);
  };

  const handleComplete = (item: ActionItem) => {
    setActionItems(prev =>
      prev.map(i => (i.id === item.id ? { ...i, status: "completed" } : i))
    );
    toast.success(`Completed: ${item.title}`);
  };

  const getPriorityColor = (priority: ActionItem["priority"]) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500/20 border-red-500/50 text-red-400";
      case "high":
        return "bg-amber-500/20 border-amber-500/50 text-amber-400";
      case "medium":
        return "bg-blue-500/20 border-blue-500/50 text-blue-400";
      case "low":
        return "bg-emerald-500/20 border-emerald-500/50 text-emerald-400";
    }
  };

  const getStatusBadge = (status: ActionItem["status"]) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-emerald-500/20 text-emerald-400">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Done
          </Badge>
        );
      case "in_progress":
        return (
          <Badge className="bg-blue-500/20 text-blue-400">
            <Clock className="w-3 h-3 mr-1 animate-spin" />
            Working
          </Badge>
        );
      case "delegated":
        return (
          <Badge className="bg-purple-500/20 text-purple-400">
            <User className="w-3 h-3 mr-1" />
            With COS
          </Badge>
        );
      default:
        return (
          <Badge className="bg-border text-muted-foreground">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  const pendingCount = actionItems.filter(i => i.status === "pending").length;
  const delegatedCount = actionItems.filter(
    i => i.status === "delegated"
  ).length;
  const inProgressCount = actionItems.filter(
    i => i.status === "in_progress"
  ).length;
  const completedCount = actionItems.filter(
    i => i.status === "completed"
  ).length;

  return (
    <div className="h-[calc(100vh-56px)] md:h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20">
              <Sun className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">The Signal</h1>
              <p className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString("en-GB", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-muted-foreground">
                  {pendingCount} pending
                </span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-purple-500" />
                <span className="text-muted-foreground">
                  {delegatedCount} with COS
                </span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-muted-foreground">
                  {inProgressCount} working
                </span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-muted-foreground">
                  {completedCount} done
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        {/* Victoria's Brief - Collapsible */}
        <div className="mb-6">
          <button
            onClick={() => setShowVictoriaBrief(!showVictoriaBrief)}
            className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-primary/50 bg-gradient-to-br from-primary/10 to-primary/5 hover:from-primary/15 hover:to-primary/10 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                <span className="text-white font-bold">V</span>
              </div>
              <div className="text-left">
                <h3 className="text-lg font-bold text-foreground">
                  Victoria's Brief
                </h3>
                <p className="text-sm text-muted-foreground">
                  Busy day ahead with key decision points
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={e => {
                  e.stopPropagation();
                  toast.info("Playing audio...");
                }}
              >
                <Headphones className="w-4 h-4 mr-1" />
                Listen
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={e => {
                  e.stopPropagation();
                  toast.info("Opening video...");
                }}
              >
                <Video className="w-4 h-4 mr-1" />
                Watch
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={e => {
                  e.stopPropagation();
                  toast.info("Downloading PDF...");
                }}
              >
                <Download className="w-4 h-4 mr-1" />
                PDF
              </Button>
              {showVictoriaBrief ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </div>
          </button>

          {showVictoriaBrief && (
            <div className="mt-4 p-4 rounded-xl border-2 border-border bg-card space-y-3">
              <div className="grid grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-primary/10">
                  <p className="text-xs text-muted-foreground">Meetings</p>
                  <p className="text-2xl font-bold text-foreground">5</p>
                </div>
                <div className="p-3 rounded-lg bg-amber-500/10">
                  <p className="text-xs text-muted-foreground">Urgent</p>
                  <p className="text-2xl font-bold text-amber-400">2</p>
                </div>
                <div className="p-3 rounded-lg bg-emerald-500/10">
                  <p className="text-xs text-muted-foreground">Energy</p>
                  <p className="text-2xl font-bold text-emerald-400">10</p>
                </div>
                <div className="p-3 rounded-lg bg-blue-500/10">
                  <p className="text-xs text-muted-foreground">Focus Time</p>
                  <p className="text-2xl font-bold text-blue-400">2h</p>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>• 5 meetings scheduled, including investor lunch at noon</p>
                <p>• Q3 Budget requires sign-off by 2 PM (urgent)</p>
                <p>• Market conditions favorable - renewable stocks up 12%</p>
                <p>• Competitor activity detected - AI bid tool launch</p>
              </div>
            </div>
          )}
        </div>

        {/* Today's Action Items */}
        <div>
          <h2 className="text-lg font-bold text-foreground mb-4">
            Today's Action Items
          </h2>
          <div className="space-y-3">
            {actionItems.map(item => (
              <div
                key={item.id}
                className={`flex items-start gap-4 p-4 rounded-xl border-2 ${getPriorityColor(item.priority)} transition-all ${
                  item.status === "completed" ? "opacity-50" : ""
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-foreground">{item.title}</h3>
                    {getStatusBadge(item.status)}
                    <Badge variant="outline" className="text-xs">
                      {item.category}
                    </Badge>
                    {item.time && (
                      <Badge variant="outline" className="text-xs">
                        <Clock className="w-3 h-3 mr-1" />
                        {item.time}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm opacity-80">{item.description}</p>
                  {item.assignedTo && (
                    <p className="text-xs opacity-60 mt-1">
                      Assigned to: {item.assignedTo}
                    </p>
                  )}
                </div>

                {item.status === "pending" && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleDelegate(item)}
                      className="bg-purple-500/20 text-purple-400 hover:bg-purple-500/30"
                    >
                      <User className="w-4 h-4 mr-1" />
                      Delegate to COS
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleTakeitOn(item)}
                      className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                    >
                      <UserPlus className="w-4 h-4 mr-1" />
                      I'll Take It
                    </Button>
                  </div>
                )}

                {item.status === "in_progress" && (
                  <Button
                    size="sm"
                    onClick={() => handleComplete(item)}
                    className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    Mark Complete
                  </Button>
                )}

                {item.status === "delegated" && (
                  <Button
                    size="sm"
                    onClick={() => setLocation("/chief-of-staff")}
                    className="bg-primary/20 text-primary hover:bg-primary/30"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View in COS
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
