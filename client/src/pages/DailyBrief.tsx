// @ts-nocheck
import { useState } from "react";
import {
  Calendar,
  Users,
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
  ThumbsUp,
  RotateCcw,
  UserPlus,
  User,
  ListChecks,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QuickActionsPanel } from "@/components/shared/QuickActionsPanel";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";

// Types for actioned items
interface ActionedItem {
  id: string;
  title: string;
  description: string;
  action: "gotit" | "defer" | "delegate" | "twin";
  category: string;
  source: "key" | "intelligence" | "recommendation";
}

// Mock data for the daily brief
const BRIEF_DATA = {
  date: new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }),

  // Overview summary points
  overviewSummary: {
    headline: "Busy day ahead with key decision points",
    highlights: [
      "5 meetings scheduled, including investor lunch",
      "Q3 Budget requires your sign-off by 2 PM",
      "Market conditions favorable - renewable stocks up 12%",
      "Competitor activity detected - AI bid tool launch",
    ],
    moodTarget: 10,
    energyFocus: "High-stakes decisions in morning, creative work in afternoon",
  },

  keyThings: [
    {
      id: 1,
      priority: "high",
      title: "Q3 Budget Approval Deadline",
      description: "Finance team needs sign-off by 2:00 PM today",
      category: "Urgent",
    },
    {
      id: 2,
      priority: "medium",
      title: "Competitor X Launched AI Bid Tool",
      description:
        "Market intelligence suggests 15% efficiency gain claims - verify",
      category: "Intelligence",
    },
    {
      id: 3,
      priority: "low",
      title: "EU Energy Policy Update",
      description:
        "New regulations effective next quarter - review implications",
      category: "Regulatory",
    },
  ],

  schedule: [
    {
      id: 1,
      time: "09:00",
      duration: "30m",
      title: "Team Standup",
      type: "meeting",
      attendees: ["Sarah L.", "Marcus T.", "Dev Team"],
      location: "Zoom",
    },
    {
      id: 2,
      time: "10:00",
      duration: "1h",
      title: "Space Shuttle Blueprint Review",
      type: "meeting",
      attendees: ["Expert Panel", "Engineering"],
      location: "Conference Room A",
    },
    {
      id: 3,
      time: "12:00",
      duration: "1h",
      title: "Lunch with Investor",
      type: "external",
      attendees: ["James K. (VC Partner)"],
      location: "The Capital Grille",
    },
    {
      id: 4,
      time: "14:00",
      duration: "30m",
      title: "Budget Sign-off",
      type: "deadline",
      attendees: [],
      location: "Finance Portal",
    },
    {
      id: 5,
      time: "15:30",
      duration: "45m",
      title: "Product Roadmap Discussion",
      type: "meeting",
      attendees: ["Product Team"],
      location: "Teams",
    },
    {
      id: 6,
      time: "16:30",
      duration: "2h",
      title: "Focus Time (Protected)",
      type: "focus",
      attendees: [],
      location: "Office",
    },
  ],

  intelligence: [
    {
      id: 1,
      source: "Market Watch",
      title: "Renewable Energy Stocks Up 12%",
      summary:
        "Overnight surge driven by policy announcements. Your portfolio exposure: 23%.",
      sentiment: "positive",
      actionable: true,
    },
    {
      id: 2,
      source: "Industry Alert",
      title: "New AI Regulations Proposed",
      summary:
        "Draft legislation could impact autonomous systems. Review by legal recommended.",
      sentiment: "neutral",
      actionable: true,
    },
    {
      id: 3,
      source: "Competitor Intel",
      title: "Competitor Y Hiring Spree",
      summary:
        "50+ engineering roles posted. Possible new product launch in 6 months.",
      sentiment: "warning",
      actionable: true,
    },
    {
      id: 4,
      source: "Internal",
      title: "Q4 Pipeline Looking Strong",
      summary:
        "Sales team reports 3 new enterprise leads from last week's conference.",
      sentiment: "positive",
      actionable: false,
    },
  ],

  twinRecommendations: [
    {
      id: 1,
      confidence: 92,
      title: "Delegate Budget Review Details",
      reason:
        "Based on your pattern, you typically delegate financial details to CFO. Suggest same approach today.",
      autoAction: "delegate",
    },
    {
      id: 2,
      confidence: 87,
      title: "Prepare Investor Talking Points",
      reason:
        "Your successful investor meetings include 3 key metrics. I've drafted talking points.",
      autoAction: "twin",
    },
    {
      id: 3,
      confidence: 78,
      title: "Block Focus Time After 4 PM",
      reason:
        "Your productivity peaks in late afternoon. No meetings scheduled - protect this time.",
      autoAction: "gotit",
    },
  ],

  emailSummary: {
    unread: 23,
    highPriority: 5,
    requiresResponse: 8,
    urgent: [
      {
        id: 1,
        from: "James K. (VC Partner)",
        subject: "Lunch meeting confirmation",
        preview:
          "Looking forward to our lunch today at 12pm. I'll bring the term sheet drafts...",
        priority: "high",
        suggestedResponse:
          "Confirmed. See you at The Capital Grille at noon. Looking forward to discussing the terms.",
      },
      {
        id: 2,
        from: "Sarah L. (CFO)",
        subject: "Q3 Budget - Final Review Needed",
        preview:
          "Attached is the final Q3 budget. Need your sign-off by 2pm today for board submission...",
        priority: "urgent",
        suggestedResponse:
          "Reviewed and approved. Please proceed with board submission. Great work on the cost optimizations.",
      },
      {
        id: 3,
        from: "Legal Team",
        subject: "EU Regulations - Action Required",
        preview:
          "New EU energy regulations effective Q4. We need to review compliance implications...",
        priority: "high",
        suggestedResponse:
          "Let's schedule a 30-min call tomorrow to discuss compliance strategy. Please prepare impact assessment.",
      },
    ],
    actionable: [
      {
        id: 4,
        from: "Marcus T. (Engineering)",
        subject: "Space Shuttle Blueprint - Ready for Review",
        preview:
          "Engineering team completed the blueprint review. Ready for your sign-off before presentation...",
        action: "Review and approve before 10am meeting",
      },
      {
        id: 5,
        from: "Product Team",
        subject: "Roadmap Discussion Prep",
        preview:
          "Agenda for 3:30pm roadmap discussion. Please review priorities and provide feedback...",
        action: "Review agenda and prepare feedback",
      },
    ],
  },

  strategyBriefing: {
    marketPosition: {
      status: "Strong",
      trend: "up",
      summary:
        "Market share increased 2.3% this quarter. Competitor activity stable.",
    },
    keyMetrics: [
      {
        label: "Revenue Run Rate",
        value: "$4.2M ARR",
        change: "+12%",
        trend: "up",
      },
      {
        label: "Customer Acquisition",
        value: "23 new",
        change: "+8%",
        trend: "up",
      },
      { label: "Churn Rate", value: "2.1%", change: "-0.3%", trend: "down" },
      { label: "NPS Score", value: "72", change: "+5", trend: "up" },
    ],
    competitorAlerts: [
      {
        competitor: "Competitor X",
        alert: "Launched AI bid tool",
        impact: "medium",
        recommendation: "Accelerate our AI roadmap",
      },
      {
        competitor: "Competitor Y",
        alert: "Hiring spree (50+ roles)",
        impact: "low",
        recommendation: "Monitor for product launch",
      },
    ],
    strategicPriorities: [
      { priority: "Enterprise expansion", progress: 68, status: "on-track" },
      { priority: "AI feature rollout", progress: 45, status: "at-risk" },
      { priority: "International launch", progress: 82, status: "ahead" },
    ],
  },
};

export default function DailyBrief() {
  const [actionedItems, setActionedItems] = useState<ActionedItem[]>([]);
  const [activeTab, setActiveTab] = useState<
    "overview" | "schedule" | "intelligence" | "strategy" | "actions"
  >("overview");

  const handleAction = (
    itemId: string,
    action: "gotit" | "defer" | "delegate" | "twin",
    title: string,
    description: string,
    category: string,
    source: "key" | "intelligence" | "recommendation"
  ) => {
    // Check if already actioned
    if (actionedItems.find(item => item.id === itemId)) return;

    setActionedItems(prev => [
      ...prev,
      { id: itemId, title, description, action, category, source },
    ]);

    const messages = {
      gotit: "Got it! Added to your focus list.",
      defer: "Deferred to tomorrow's brief.",
      delegate: "Delegation request sent to team.",
      twin: "Assigned to Chief of Staff for autonomous handling.",
    };
    toast.success(messages[action]);
  };

  const isActioned = (itemId: string) =>
    actionedItems.some(item => item.id === itemId);

  const [showVideoBriefing, setShowVideoBriefing] = useState(false);
  const [pendingVideoId, setPendingVideoId] = useState<string | null>(null);

  // Live data for Intelligence and Strategy tabs
  const { data: _emailStats } = trpc.emailIntelligence.getSummaryStats.useQuery();
  const { data: emailList } = trpc.emailIntelligence.list.useQuery({ limit: 5, priority: "high" });
  const { data: kpiList } = trpc.kpiOkr.list.useQuery();
  const { data: genesisProjects } = trpc.projectGenesis.listProjects.useQuery();

  // Live briefing data from AI
  const { data: liveBrief, isLoading: briefLoading } =
    trpc.victoriaBriefing.getDailyBriefing.useQuery(undefined, {
      staleTime: 5 * 60 * 1000, // Cache for 5 minutes
      retry: 1,
    });

  // Poll for video status when a video is being generated
  const { data: videoStatus } = trpc.victoriasBrief.getVideoStatus.useQuery(
    { videoId: pendingVideoId! },
    {
      enabled: !!pendingVideoId,
      refetchInterval: query => {
        const s = (query as unknown)?.state?.data?.status;
        if (s === "complete" || s === "error") return false;
        return 5000;
      },
    }
  );
  // Auto-open video when Synthesia finishes rendering
  if (
    videoStatus?.status === "complete" &&
    videoStatus?.downloadUrl &&
    pendingVideoId
  ) {
    window.open(videoStatus.downloadUrl, "_blank");
    toast.success("Your Victoria video brief is ready!");
    setPendingVideoId(null);
  }
  // Victoria autonomous stats and action log
  const { data: _victoriaStats } = trpc.victoria.getStats.useQuery();
  const { data: _victoriaActionLog } = trpc.victoria.getActionLog.useQuery({
    limit: 5,
  });
  const _generateMorningBriefingMutation =
    trpc.victoria.generateMorningBriefing.useMutation({
      onSuccess: () => {
        toast.success("Victoria is generating your morning briefing...");
      },
      onError: err => {
        toast.error(`Failed to generate briefing: ${err.message}`);
      },
    });
  const generatePdfMutation = trpc.victoriasBrief.generatePdf.useMutation();
  const generateVideoMutation = trpc.victoriasBrief.generateVideo.useMutation();
  const generateAudioMutation = trpc.victoriasBrief.generateAudio.useMutation();

  // Helper: trigger a browser download from a data URL or regular URL
  const triggerDownload = (url: string, filename: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => document.body.removeChild(a), 100);
  };

  const handleExport = async (format: "pdf" | "video" | "audio") => {
    const briefDate = liveBrief?.date ?? new Date().toISOString();
    const dateSlug = new Date().toISOString().slice(0, 10);
    const briefText =
      liveBrief?.briefing ??
      `Good morning! Here's your daily brief for ${new Date().toLocaleDateString()}.`;
    try {
      if (format === "pdf") {
        toast.info("Generating PDF brief...");
        const result = await generatePdfMutation.mutateAsync({
          date: briefDate,
          content: liveBrief ?? BRIEF_DATA,
        });
        if (result.pdfUrl) {
          triggerDownload(result.pdfUrl, `victoria-brief-${dateSlug}.pdf`);
          toast.success("PDF downloaded!");
        } else {
          toast.error(result.message || "PDF generation failed.");
        }
      } else if (format === "video") {
        toast.info("Creating video brief with Victoria...");
        const result = await generateVideoMutation.mutateAsync({
          script: briefText,
          avatarId: "victoria",
        });
        if (result.status === "processing" && result.videoId) {
          setPendingVideoId(result.videoId);
          toast.info("Video is being generated. You'll be notified when ready.");
        } else if (result.videoUrl) {
          triggerDownload(result.videoUrl, `victoria-brief-${dateSlug}.mp4`);
          toast.success("Video downloaded!");
        } else {
          toast.info(result.message || "Video generation requires Synthesia API key.");
        }
      } else if (format === "audio") {
        toast.info("Creating podcast version with Victoria's voice...");
        const result = await generateAudioMutation.mutateAsync({
          text: briefText.slice(0, 800),
          voiceId: "victoria",
        });
        if (result.audioUrl) {
          triggerDownload(result.audioUrl, `victoria-brief-${dateSlug}.mp3`);
          toast.success("Audio downloaded!");
        } else {
          toast.error(result.message || "Audio generation requires ElevenLabs API key. Check Integrations.");
        }
      }
    } catch {
      toast.error(`Failed to generate ${format}. Please try again.`);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-400 bg-red-500/10 border-red-500/30";
      case "medium":
        return "text-yellow-400 bg-yellow-500/10 border-yellow-500/30";
      default:
        return "text-primary bg-primary/10 border-blue-500/30";
    }
  };

  const _getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "text-green-400 bg-green-500/10 border-green-500/30";
      case "warning":
        return "text-orange-400 bg-orange-500/10 border-orange-500/30";
      default:
        return "text-primary bg-primary/10 border-blue-500/30";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "meeting":
        return <Video className="w-4 h-4" />;
      case "external":
        return <Users className="w-4 h-4" />;
      case "deadline":
        return <AlertTriangle className="w-4 h-4" />;
      case "focus":
        return <Brain className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case "gotit":
        return {
          label: "You'll Handle",
          color: "text-green-400 bg-green-500/20",
        };
      case "defer":
        return { label: "Deferred", color: "text-yellow-400 bg-yellow-500/20" };
      case "delegate":
        return { label: "Delegated", color: "text-primary bg-primary/20" };
      case "twin":
        return { label: "Chief of Staff", color: "text-primary bg-primary/20" };
      default:
        return { label: "Pending", color: "text-foreground/70 bg-gray-500/20" };
    }
  };

  // Action buttons component for reuse
  const ActionButtons = ({
    itemId,
    title,
    description,
    category,
    source,
  }: {
    itemId: string;
    title: string;
    description: string;
    category: string;
    source: "key" | "intelligence" | "recommendation";
  }) => {
    if (isActioned(itemId)) {
      const item = actionedItems.find(i => i.id === itemId);
      const actionInfo = getActionLabel(item?.action || "");
      return (
        <Badge className={`${actionInfo.color} border-0`}>
          <CheckCircle2 className="w-3 h-3 mr-1" />
          {actionInfo.label}
        </Badge>
      );
    }

    return (
      <div className="flex gap-1">
        <Button
          size="sm"
          variant="ghost"
          className="h-8 px-2 hover:bg-green-500/20 hover:text-green-400"
          onClick={e => {
            e.stopPropagation();
            handleAction(itemId, "gotit", title, description, category, source);
          }}
          title="Got it - I'll handle this"
        >
          <ThumbsUp className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-8 px-2 hover:bg-yellow-500/20 hover:text-yellow-400"
          onClick={e => {
            e.stopPropagation();
            handleAction(itemId, "defer", title, description, category, source);
          }}
          title="Defer to tomorrow"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-8 px-2 hover:bg-primary/20 hover:text-primary"
          onClick={e => {
            e.stopPropagation();
            handleAction(
              itemId,
              "delegate",
              title,
              description,
              category,
              source
            );
          }}
          title="Delegate to team"
        >
          <UserPlus className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-8 px-2 hover:bg-purple-500/20 hover:text-purple-400"
          onClick={e => {
            e.stopPropagation();
            handleAction(itemId, "twin", title, description, category, source);
          }}
          title="Assign to Chief of Staff"
        >
          <User className="w-4 h-4" />
        </Button>
      </div>
    );
  };

  return (
    <div className="h-full bg-background text-foreground overflow-auto">
      {/* Victoria Stirling Video Briefing Modal */}
      {showVideoBriefing && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl bg-card rounded-2xl overflow-hidden shadow-2xl border border-border">
            <div className="absolute top-4 right-4 z-10">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowVideoBriefing(false)}
                className="text-white hover:bg-white/20"
              >
                ✕ Close
              </Button>
            </div>
            <div className="aspect-video bg-black relative">
              <video
                src="/avatars/victoria-stirling-video.mp4"
                className="w-full h-full object-cover"
                autoPlay
                controls
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                <div className="flex items-center gap-3">
                  <img
                    src="/avatars/victoria-stirling.jpg"
                    alt="Victoria Stirling"
                    className="w-10 h-10 rounded-full border-2 border-primary"
                  />
                  <div>
                    <p className="text-foreground font-semibold">
                      Victoria Stirling
                    </p>
                    <p className="text-white/70 text-sm">
                      Your Daily Signal Briefing
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 bg-card border-t border-border">
              <p className="text-muted-foreground text-sm text-center">
                Victoria delivers your personalized daily briefing with key
                priorities, market intelligence, and strategic recommendations.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="border-b border-border bg-card/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl md:text-3xl font-bold text-foreground flex items-center gap-2">
                <Zap className="h-6 w-6 sm:h-8 sm:w-8 text-primary shrink-0" />
                <span className="truncate">Victoria's Briefing</span>
              </h1>
              <p className="text-muted-foreground mt-1 text-sm truncate">
                {liveBrief
                  ? new Date(liveBrief.date).toLocaleDateString("en-GB", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })
                  : BRIEF_DATA.date}
              </p>
            </div>

            {/* Export buttons — icon-only on mobile, labelled on desktop */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="border-border hover:bg-secondary px-2 sm:px-3"
                onClick={() => handleExport("pdf")}
                title="Export PDF"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline ml-2">PDF</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-border hover:bg-secondary px-2 sm:px-3"
                onClick={() => handleExport("video")}
                title="Watch Video"
              >
                <Play className="w-4 h-4" />
                <span className="hidden sm:inline ml-2">Video</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-border hover:bg-secondary px-2 sm:px-3"
                onClick={() => handleExport("audio")}
                title="Listen as Podcast"
              >
                <Headphones className="w-4 h-4" />
                <span className="hidden sm:inline ml-2">Podcast</span>
              </Button>
            </div>
          </div>

          {/* Tab Navigation - Reordered */}
          <div className="flex gap-1 mt-4 border-b border-border -mb-px overflow-x-auto">
            {[
              { id: "overview", label: "Overview", icon: Eye },
              { id: "schedule", label: "Schedule", icon: Calendar },
              { id: "intelligence", label: "Intelligence", icon: TrendingUp },
              { id: "strategy", label: "Strategy", icon: Brain },
              { id: "actions", label: "Action Engine", icon: Zap },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {tab.id === "actions" && actionedItems.length > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-1 h-5 px-1.5 text-xs"
                  >
                    {actionedItems.length}
                  </Badge>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        {/* Overview Tab - High-level listening summary */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Presenter Video Brief */}
            <Card className="relative bg-gradient-to-br from-primary/10 via-card/60 to-purple-500/10 border-2 border-primary/30 shadow-xl">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-purple-500/30 rounded-xl blur-xl opacity-20 -z-10" />
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  {/* Presenter Avatar */}
                  <div className="shrink-0">
                    <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden border-2 border-primary/40 shadow-lg">
                      <img
                        src="/avatars/victoria-stirling.jpg"
                        alt="Victoria Sterling"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-card" />
                    </div>
                    <p className="text-center text-xs text-muted-foreground mt-2">
                      Victoria Sterling
                    </p>
                    <p className="text-center text-[10px] text-muted-foreground/60">
                      Daily Brief Presenter
                    </p>
                  </div>

                  {/* Brief Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge className="bg-primary/20 text-primary border-0">
                        <Play className="w-3 h-3 mr-1" /> 2-3 min brief
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Ready to play
                      </span>
                    </div>

                    {briefLoading ? (
                      <div className="space-y-2 mb-4">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                        <Skeleton className="h-4 w-4/6" />
                      </div>
                    ) : liveBrief ? (
                      <div className="mb-4">
                        <p className="text-foreground/90 leading-relaxed font-medium mb-2">
                          {liveBrief.greeting}
                        </p>
                        <p
                          className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed"
                          dangerouslySetInnerHTML={{
                            __html: liveBrief.briefing
                              .replace(
                                /\*\*(.*?)\*\*/g,
                                '<strong class="font-medium text-foreground">$1</strong>'
                              )
                              .replace(/\n/g, "<br/>")
                              .replace(
                                /---/g,
                                '<hr class="border-border my-2" />'
                              ),
                          }}
                        />
                        {liveBrief.stats && (
                          <div className="flex flex-wrap gap-2 md:gap-4 mt-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-primary" />{" "}
                              {liveBrief.stats.activeProjects} active projects
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-yellow-400" />{" "}
                              {liveBrief.stats.pendingTasks} pending tasks
                            </span>
                            {liveBrief.stats.highPriorityTasks > 0 && (
                              <span className="flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3 text-red-400" />{" "}
                                {liveBrief.stats.highPriorityTasks} high
                                priority
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-foreground/90 leading-relaxed mb-4">
                        "Good morning. Here's your brief for today.{" "}
                        {BRIEF_DATA.overviewSummary.headline}. You have{" "}
                        {
                          BRIEF_DATA.schedule.filter(s => s.type === "meeting")
                            .length
                        }{" "}
                        meetings scheduled, including your investor lunch at
                        noon. {BRIEF_DATA.overviewSummary.energyFocus}."
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="lg"
                        className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30 text-base"
                        onClick={() => handleExport("video")}
                      >
                        <Play className="w-5 h-5 mr-2" /> Watch Victoria's
                        Briefing
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        className="border-primary/30 hover:bg-primary/10 text-base"
                        onClick={() => handleExport("audio")}
                      >
                        <Headphones className="w-5 h-5 mr-2" /> Listen
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Executive Summary */}
            <Card className="bg-card/60 border-border">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Eye className="w-5 h-5 text-primary" />
                  Today at a Glance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 mb-4">
                  <p className="text-lg font-medium text-foreground">
                    {BRIEF_DATA.overviewSummary.headline}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {BRIEF_DATA.overviewSummary.energyFocus}
                  </p>
                </div>
                <ul className="space-y-2">
                  {BRIEF_DATA.overviewSummary.highlights.map(
                    (highlight, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-3 text-muted-foreground"
                      >
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        <span>{highlight}</span>
                      </li>
                    )
                  )}
                </ul>
              </CardContent>
            </Card>

            {/* Key Things to Know */}
            <Card className="bg-card/60 border-border">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <AlertTriangle className="w-5 h-5 text-yellow-400" />
                  Key Things You Need to Know
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {BRIEF_DATA.keyThings.map(item => (
                  <div
                    key={item.id}
                    className={`group p-4 rounded-xl border ${getPriorityColor(item.priority)} ${isActioned(`key-${item.id}`) ? "opacity-60" : ""} hover:border-primary/50 transition-all cursor-pointer`}
                    onClick={() =>
                      (window.location.href = `/ai-experts?mission=${encodeURIComponent(item.title + ": " + item.description)}`)
                    }
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            variant="outline"
                            className={getPriorityColor(item.priority)}
                          >
                            {item.category}
                          </Badge>
                        </div>
                        <h3 className="font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                          {item.title}
                          <ArrowRight className="w-4 h-4 inline ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                      <ActionButtons
                        itemId={`key-${item.id}`}
                        title={item.title}
                        description={item.description}
                        category={item.category}
                        source="key"
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Email Summary section temporarily disabled */}

            {/* Chief of Staff Insights */}
            <Card className="bg-card/60 border-border">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Brain className="w-5 h-5 text-purple-400" />
                  Chief of Staff Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {BRIEF_DATA.twinRecommendations.map(rec => (
                  <div
                    key={rec.id}
                    className={`p-4 rounded-xl bg-purple-500/5 border border-purple-500/20 ${isActioned(`rec-${rec.id}`) ? "opacity-60" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Lightbulb className="w-4 h-4 text-purple-400" />
                          <Badge className="bg-purple-500/20 text-purple-400 border-0">
                            {rec.confidence}% confidence
                          </Badge>
                        </div>
                        <h4 className="font-bold text-foreground mb-1">
                          {rec.title}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {rec.reason}
                        </p>
                      </div>
                      <ActionButtons
                        itemId={`rec-${rec.id}`}
                        title={rec.title}
                        description={rec.reason}
                        category="Recommendation"
                        source="recommendation"
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Schedule Tab */}
        {activeTab === "schedule" && (
          <Card className="bg-card/60 border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Calendar className="w-5 h-5 text-primary" />
                Today's Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-[76px] top-0 bottom-0 w-px bg-border"></div>

                <div className="space-y-4">
                  {BRIEF_DATA.schedule.map(item => (
                    <div
                      key={item.id}
                      className="flex items-start gap-4 relative"
                    >
                      <div className="text-center min-w-[60px] shrink-0">
                        <div className="text-lg font-bold text-foreground">
                          {item.time}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {item.duration}
                        </div>
                      </div>

                      {/* Timeline dot */}
                      <div
                        className={`w-3 h-3 rounded-full mt-2 shrink-0 z-10 ${
                          item.type === "deadline"
                            ? "bg-red-500"
                            : item.type === "external"
                              ? "bg-green-500"
                              : item.type === "focus"
                                ? "bg-purple-500"
                                : "bg-primary"
                        }`}
                      ></div>

                      <div
                        className={`flex-1 p-4 rounded-xl border transition-colors ${
                          item.type === "deadline"
                            ? "bg-red-500/5 border-red-500/20"
                            : item.type === "external"
                              ? "bg-green-500/5 border-green-500/20"
                              : item.type === "focus"
                                ? "bg-purple-500/5 border-purple-500/20"
                                : "bg-card border-border hover:border-primary/30"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {getTypeIcon(item.type)}
                          <span className="font-medium text-foreground">
                            {item.title}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {item.location}
                        </div>
                        {item.attendees.length > 0 && (
                          <div className="flex items-center gap-1 mt-2">
                            <Users className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {item.attendees.join(", ")}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Intelligence Tab */}
        {activeTab === "intelligence" && (
          <div className="space-y-6">
            {/* Email Intelligence */}
            <Card className="bg-card/60 border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <TrendingUp className="w-5 h-5 text-[var(--brain-cyan)]" />
                  Intelligence Feed
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {emailList && emailList.length > 0 ? (
                  emailList.map(item => (
                    <div
                      key={item.id}
                      className={`p-4 rounded-xl border border-border bg-background/50 ${isActioned(`intel-${item.id}`) ? "opacity-60" : ""}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              {item.fromName ?? item.fromEmail ?? "Email"}
                            </Badge>
                            <Badge variant={item.aiPriority === "urgent" ? "destructive" : item.aiPriority === "high" ? "default" : "secondary"}>
                              {item.aiPriority}
                            </Badge>
                          </div>
                          <h3 className="font-bold text-foreground mb-1">
                            {item.subject}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {item.aiSummary ?? item.bodyPreview ?? ""}
                          </p>
                        </div>
                        <ActionButtons
                          itemId={`intel-${item.id}`}
                          title={item.subject}
                          description={item.aiSummary ?? item.bodyPreview ?? ""}
                          category="Email"
                          source="intelligence"
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <TrendingUp className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No high-priority intelligence yet</p>
                    <p className="text-sm mt-1">Connect your email in Integrations to see live intelligence</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Strategy Tab */}
        {activeTab === "strategy" && (
          <div className="space-y-6">
            {/* KPI Overview */}
            <Card className="bg-card/60 border-border">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  KPI Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                {kpiList && kpiList.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {kpiList.slice(0, 8).map((kpi) => (
                      <div key={kpi.id} className="bg-background/50 rounded-lg p-4">
                        <div className="text-sm text-muted-foreground mb-1">{kpi.name}</div>
                        <div className="text-xl font-bold text-foreground">
                          {kpi.currentValue !== null ? `${kpi.currentValue}${kpi.unit ?? ""}` : "—"}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Target: {kpi.targetValue}{kpi.unit ?? ""}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <p className="font-medium">No KPIs configured yet</p>
                    <p className="text-sm mt-1">Add KPIs in the KPI & OKR section</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Active Projects — Strategic Priorities */}
            <Card className="bg-card/60 border-border">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Lightbulb className="w-5 h-5 text-yellow-400" />
                  Active Projects
                </CardTitle>
              </CardHeader>
              <CardContent>
                {genesisProjects && genesisProjects.length > 0 ? (
                  <div className="space-y-4">
                    {genesisProjects.slice(0, 6).map((project) => {
                      const progress = project.currentPhase ? Math.round((project.currentPhase / 7) * 100) : 0;
                      const statusColor = project.status === "active" ? "bg-primary" : project.status === "completed" ? "bg-green-500" : "bg-orange-500";
                      return (
                        <div key={project.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-foreground">{project.name}</span>
                            <Badge variant={project.status === "active" ? "default" : project.status === "completed" ? "secondary" : "destructive"}>
                              {project.status}
                            </Badge>
                          </div>
                          <div className="h-2 bg-background rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${statusColor}`} style={{ width: `${progress}%` }} />
                          </div>
                          <div className="text-sm text-muted-foreground text-right">Phase {project.currentPhase ?? 0} of 7</div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <p className="font-medium">No active projects</p>
                    <p className="text-sm mt-1">Create a project in Genesis to see it here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Action Engine Tab - Final Review */}
        {activeTab === "actions" && (
          <div className="space-y-6">
            {/* Quick Actions Panel */}
            <Card className="bg-gradient-to-br from-primary/10 to-purple-500/10 border-primary/30">
              <CardHeader>
                <CardTitle className="text-foreground">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <QuickActionsPanel
                  onScheduleMeeting={() => {
                    toast.success("Opening calendar to schedule meeting...");
                  }}
                  onSendEmail={() => {
                    toast.success(
                      "Opening email draft with suggested recipients..."
                    );
                  }}
                  onCreateTask={() => {
                    toast.success(
                      "Adding task to your list with suggested priority..."
                    );
                  }}
                  onEscalate={() => {
                    toast.success("Escalating to expert team immediately...");
                  }}
                />
              </CardContent>
            </Card>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  label: "You'll Handle",
                  count: actionedItems.filter(i => i.action === "gotit").length,
                  color: "text-green-400",
                  bg: "bg-green-500/10",
                },
                {
                  label: "Deferred",
                  count: actionedItems.filter(i => i.action === "defer").length,
                  color: "text-yellow-400",
                  bg: "bg-yellow-500/10",
                },
                {
                  label: "Delegated",
                  count: actionedItems.filter(i => i.action === "delegate")
                    .length,
                  color: "text-primary",
                  bg: "bg-primary/10",
                },
                {
                  label: "Chief of Staff",
                  count: actionedItems.filter(i => i.action === "twin").length,
                  color: "text-purple-400",
                  bg: "bg-purple-500/10",
                },
              ].map(stat => (
                <Card key={stat.label} className={`${stat.bg} border-border`}>
                  <CardContent className="p-4 text-center">
                    <div className={`text-3xl font-bold ${stat.color}`}>
                      {stat.count}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {stat.label}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Actioned Items List */}
            <Card className="bg-card/60 border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <ListChecks className="w-5 h-5 text-primary" />
                  Today's Action Plan
                  {actionedItems.length > 0 && (
                    <Badge className="ml-2">{actionedItems.length} items</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {actionedItems.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Zap className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p className="text-lg font-medium">No items actioned yet</p>
                    <p className="text-sm mt-1">
                      Review the Overview, Schedule, and Intelligence tabs to
                      action items
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {actionedItems.map(item => {
                      const actionInfo = getActionLabel(item.action);
                      return (
                        <div
                          key={item.id}
                          className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30 border border-border"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="text-xs">
                                {item.category}
                              </Badge>
                              <Badge className={`${actionInfo.color} border-0`}>
                                {actionInfo.label}
                              </Badge>
                            </div>
                            <h4 className="font-medium text-foreground">
                              {item.title}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {item.description}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setActionedItems(prev =>
                                prev.filter(i => i.id !== item.id)
                              )
                            }
                            className="text-muted-foreground hover:text-destructive"
                          >
                            Undo
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Confirm and Start Day Button */}
                {actionedItems.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-border">
                    <Button
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 text-lg"
                      onClick={() => {
                        toast.success(
                          "Day plan confirmed! Your Chief of Staff and team are now working on assigned tasks."
                        );
                        // Could navigate to dashboard or show confirmation
                      }}
                    >
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      Confirm & Start Day
                    </Button>
                    <p className="text-center text-sm text-muted-foreground mt-2">
                      This will notify your team and activate your Chief of
                      Staff for assigned tasks
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
// Cache bust 1771752810
