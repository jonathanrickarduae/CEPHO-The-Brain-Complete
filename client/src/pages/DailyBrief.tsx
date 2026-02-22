import { useState } from "react";
import { 
  Sun, Calendar, Users, TrendingUp, Brain, Zap, 
  CheckCircle2, Clock, ArrowRight, Download, Play, 
  Headphones, ChevronRight, AlertTriangle, Lightbulb,
  Video, FileText, ThumbsUp, RotateCcw, UserPlus, Fingerprint,
  ListChecks, Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QuickActionsPanel } from '@/components/shared/QuickActionsPanel';
import { toast } from "sonner";

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
  date: new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
  
  // Overview summary points
  overviewSummary: {
    headline: "Busy day ahead with key decision points",
    highlights: [
      "5 meetings scheduled, including investor lunch",
      "Q3 Budget requires your sign-off by 2 PM",
      "Market conditions favorable - renewable stocks up 12%",
      "Competitor activity detected - AI bid tool launch"
    ],
    moodTarget: 10,
    energyFocus: "High-stakes decisions in morning, creative work in afternoon"
  },
  
  keyThings: [
    { id: 1, priority: "high", title: "Q3 Budget Approval Deadline", description: "Finance team needs sign-off by 2:00 PM today", category: "Urgent" },
    { id: 2, priority: "medium", title: "Competitor X Launched AI Bid Tool", description: "Market intelligence suggests 15% efficiency gain claims - verify", category: "Intelligence" },
    { id: 3, priority: "low", title: "EU Energy Policy Update", description: "New regulations effective next quarter - review implications", category: "Regulatory" },
  ],
  
  schedule: [
    { id: 1, time: "09:00", duration: "30m", title: "Team Standup", type: "meeting", attendees: ["Sarah L.", "Marcus T.", "Dev Team"], location: "Zoom" },
    { id: 2, time: "10:00", duration: "1h", title: "Space Shuttle Blueprint Review", type: "meeting", attendees: ["Expert Panel", "Engineering"], location: "Conference Room A" },
    { id: 3, time: "12:00", duration: "1h", title: "Lunch with Investor", type: "external", attendees: ["James K. (VC Partner)"], location: "The Capital Grille" },
    { id: 4, time: "14:00", duration: "30m", title: "Budget Sign-off", type: "deadline", attendees: [], location: "Finance Portal" },
    { id: 5, time: "15:30", duration: "45m", title: "Product Roadmap Discussion", type: "meeting", attendees: ["Product Team"], location: "Teams" },
    { id: 6, time: "16:30", duration: "2h", title: "Focus Time (Protected)", type: "focus", attendees: [], location: "Office" },
  ],
  
  intelligence: [
    { id: 1, source: "Market Watch", title: "Renewable Energy Stocks Up 12%", summary: "Overnight surge driven by policy announcements. Your portfolio exposure: 23%.", sentiment: "positive", actionable: true },
    { id: 2, source: "Industry Alert", title: "New AI Regulations Proposed", summary: "Draft legislation could impact autonomous systems. Review by legal recommended.", sentiment: "neutral", actionable: true },
    { id: 3, source: "Competitor Intel", title: "Competitor Y Hiring Spree", summary: "50+ engineering roles posted. Possible new product launch in 6 months.", sentiment: "warning", actionable: true },
    { id: 4, source: "Internal", title: "Q4 Pipeline Looking Strong", summary: "Sales team reports 3 new enterprise leads from last week's conference.", sentiment: "positive", actionable: false },
  ],
  
  twinRecommendations: [
    { id: 1, confidence: 92, title: "Delegate Budget Review Details", reason: "Based on your pattern, you typically delegate financial details to CFO. Suggest same approach today.", autoAction: "delegate" },
    { id: 2, confidence: 87, title: "Prepare Investor Talking Points", reason: "Your successful investor meetings include 3 key metrics. I've drafted talking points.", autoAction: "twin" },
    { id: 3, confidence: 78, title: "Block Focus Time After 4 PM", reason: "Your productivity peaks in late afternoon. No meetings scheduled - protect this time.", autoAction: "gotit" },
  ],
  
  emailSummary: {
    unread: 23,
    highPriority: 5,
    requiresResponse: 8,
    urgent: [
      { id: 1, from: "James K. (VC Partner)", subject: "Lunch meeting confirmation", preview: "Looking forward to our lunch today at 12pm. I'll bring the term sheet drafts...", priority: "high", suggestedResponse: "Confirmed. See you at The Capital Grille at noon. Looking forward to discussing the terms." },
      { id: 2, from: "Sarah L. (CFO)", subject: "Q3 Budget - Final Review Needed", preview: "Attached is the final Q3 budget. Need your sign-off by 2pm today for board submission...", priority: "urgent", suggestedResponse: "Reviewed and approved. Please proceed with board submission. Great work on the cost optimizations." },
      { id: 3, from: "Legal Team", subject: "EU Regulations - Action Required", preview: "New EU energy regulations effective Q4. We need to review compliance implications...", priority: "high", suggestedResponse: "Let's schedule a 30-min call tomorrow to discuss compliance strategy. Please prepare impact assessment." },
    ],
    actionable: [
      { id: 4, from: "Marcus T. (Engineering)", subject: "Space Shuttle Blueprint - Ready for Review", preview: "Engineering team completed the blueprint review. Ready for your sign-off before presentation...", action: "Review and approve before 10am meeting" },
      { id: 5, from: "Product Team", subject: "Roadmap Discussion Prep", preview: "Agenda for 3:30pm roadmap discussion. Please review priorities and provide feedback...", action: "Review agenda and prepare feedback" },
    ]
  },
  
  strategyBriefing: {
    marketPosition: {
      status: "Strong",
      trend: "up",
      summary: "Market share increased 2.3% this quarter. Competitor activity stable."
    },
    keyMetrics: [
      { label: "Revenue Run Rate", value: "$4.2M ARR", change: "+12%", trend: "up" },
      { label: "Customer Acquisition", value: "23 new", change: "+8%", trend: "up" },
      { label: "Churn Rate", value: "2.1%", change: "-0.3%", trend: "down" },
      { label: "NPS Score", value: "72", change: "+5", trend: "up" },
    ],
    competitorAlerts: [
      { competitor: "Competitor X", alert: "Launched AI bid tool", impact: "medium", recommendation: "Accelerate our AI roadmap" },
      { competitor: "Competitor Y", alert: "Hiring spree (50+ roles)", impact: "low", recommendation: "Monitor for product launch" },
    ],
    strategicPriorities: [
      { priority: "Enterprise expansion", progress: 68, status: "on-track" },
      { priority: "AI feature rollout", progress: 45, status: "at-risk" },
      { priority: "International launch", progress: 82, status: "ahead" },
    ]
  }
};

export default function DailyBrief() {
  const [actionedItems, setActionedItems] = useState<ActionedItem[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "schedule" | "intelligence" | "strategy" | "actions">("overview");

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
    
    setActionedItems(prev => [...prev, { id: itemId, title, description, action, category, source }]);
    
    const messages = {
      gotit: "Got it! Added to your focus list.",
      defer: "Deferred to tomorrow's brief.",
      delegate: "Delegation request sent to team.",
      twin: "Assigned to Chief of Staff for autonomous handling."
    };
    toast.success(messages[action]);
  };

  const isActioned = (itemId: string) => actionedItems.some(item => item.id === itemId);

  const [showVideoBriefing, setShowVideoBriefing] = useState(false);

  const handleExport = (format: "pdf" | "video" | "audio") => {
    if (format === "video") {
      setShowVideoBriefing(true);
      return;
    }
    const messages = {
      pdf: "Generating 2-page PDF brief...",
      audio: "Creating podcast version with Victoria's voice..."
    };
    toast.info(messages[format]);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-red-400 bg-red-500/10 border-red-500/30";
      case "medium": return "text-yellow-400 bg-yellow-500/10 border-yellow-500/30";
      default: return "text-blue-400 bg-blue-500/10 border-blue-500/30";
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive": return "text-green-400 bg-green-500/10 border-green-500/30";
      case "warning": return "text-orange-400 bg-orange-500/10 border-orange-500/30";
      default: return "text-blue-400 bg-blue-500/10 border-blue-500/30";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "meeting": return <Video className="w-4 h-4" />;
      case "external": return <Users className="w-4 h-4" />;
      case "deadline": return <AlertTriangle className="w-4 h-4" />;
      case "focus": return <Brain className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case "gotit": return { label: "You'll Handle", color: "text-green-400 bg-green-500/20" };
      case "defer": return { label: "Deferred", color: "text-yellow-400 bg-yellow-500/20" };
      case "delegate": return { label: "Delegated", color: "text-blue-400 bg-blue-500/20" };
      case "twin": return { label: "Chief of Staff", color: "text-primary bg-primary/20" };
      default: return { label: "Pending", color: "text-foreground/70 bg-gray-500/20" };
    }
  };

  // Action buttons component for reuse
  const ActionButtons = ({ 
    itemId, 
    title, 
    description, 
    category, 
    source 
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
          onClick={(e) => { e.stopPropagation(); handleAction(itemId, "gotit", title, description, category, source); }}
          title="Got it - I'll handle this"
        >
          <ThumbsUp className="w-4 h-4" />
        </Button>
        <Button 
          size="sm" 
          variant="ghost" 
          className="h-8 px-2 hover:bg-yellow-500/20 hover:text-yellow-400"
          onClick={(e) => { e.stopPropagation(); handleAction(itemId, "defer", title, description, category, source); }}
          title="Defer to tomorrow"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
        <Button 
          size="sm" 
          variant="ghost" 
          className="h-8 px-2 hover:bg-blue-500/20 hover:text-blue-400"
          onClick={(e) => { e.stopPropagation(); handleAction(itemId, "delegate", title, description, category, source); }}
          title="Delegate to team"
        >
          <UserPlus className="w-4 h-4" />
        </Button>
        <Button 
          size="sm" 
          variant="ghost" 
          className="h-8 px-2 hover:bg-purple-500/20 hover:text-purple-400"
          onClick={(e) => { e.stopPropagation(); handleAction(itemId, "twin", title, description, category, source); }}
          title="Assign to Chief of Staff"
        >
          <Fingerprint className="w-4 h-4" />
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
                  <img alt="Daily brief illustration" 
                    src="/avatars/victoria-stirling.jpg" 
                    alt="Victoria Stirling" 
                    className="w-10 h-10 rounded-full border-2 border-blue-500"
                  />
                  <div>
                    <p className="text-white font-semibold">Victoria Stirling</p>
                    <p className="text-white/70 text-sm">Your Daily Signal Briefing</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 bg-card border-t border-border">
              <p className="text-muted-foreground text-sm text-center">
                Victoria delivers your personalized daily briefing with key priorities, market intelligence, and strategic recommendations.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="border-b border-border bg-card/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img alt="Insights summary graphic" 
                  src="/avatars/victoria-stirling.jpg" 
                  alt="Victoria Stirling" 
                  className="w-12 h-12 md:w-14 md:h-14 rounded-full object-cover border-2 border-blue-500/50 shadow-lg"
                />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-display font-bold">The Signal</h1>
                <p className="text-muted-foreground text-sm">Presented by <span className="text-blue-400">Victoria Stirling</span> • {BRIEF_DATA.date}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="border-border hover:bg-secondary"
                onClick={() => handleExport("pdf")}
              >
                <Download className="w-4 h-4 mr-2" /> PDF
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="border-border hover:bg-secondary"
                onClick={() => handleExport("video")}
              >
                <Play className="w-4 h-4 mr-2" /> Video
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="border-border hover:bg-secondary"
                onClick={() => handleExport("audio")}
              >
                <Headphones className="w-4 h-4 mr-2" /> Podcast
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
            ].map((tab) => (
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
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
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
                    <p className="text-center text-xs text-muted-foreground mt-2">Victoria Sterling</p>
                    <p className="text-center text-[10px] text-muted-foreground/60">Daily Brief Presenter</p>
                  </div>
                  
                  {/* Brief Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge className="bg-primary/20 text-primary border-0">
                        <Play className="w-3 h-3 mr-1" /> 2-3 min brief
                      </Badge>
                      <span className="text-xs text-muted-foreground">Ready to play</span>
                    </div>
                    
                    <p className="text-foreground/90 leading-relaxed mb-4">
                      "Good morning. Here's your brief for today. {BRIEF_DATA.overviewSummary.headline}. 
                      You have {BRIEF_DATA.schedule.filter(s => s.type === 'meeting').length} meetings scheduled, 
                      including your investor lunch at noon. {BRIEF_DATA.overviewSummary.energyFocus}."
                    </p>
                    
                    <div className="flex gap-2">
                      <Button 
                        size="lg" 
                        className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30 text-base"
                        disabled
                        title="Video generation requires backend implementation"
                      >
                        <Play className="w-5 h-5 mr-2" /> Watch Victoria's Brief
                      </Button>
                      <Button 
                        size="lg" 
                        variant="outline"
                        className="border-primary/30 hover:bg-primary/10 text-base"
                        disabled
                        title="Audio generation requires backend implementation"
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
                  <p className="text-lg font-medium text-foreground">{BRIEF_DATA.overviewSummary.headline}</p>
                  <p className="text-sm text-muted-foreground mt-1">{BRIEF_DATA.overviewSummary.energyFocus}</p>
                </div>
                <ul className="space-y-2">
                  {BRIEF_DATA.overviewSummary.highlights.map((highlight, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <span>{highlight}</span>
                    </li>
                  ))}
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
                {BRIEF_DATA.keyThings.map((item) => (
                  <div 
                    key={item.id}
                    className={`group p-4 rounded-xl border ${getPriorityColor(item.priority)} ${isActioned(`key-${item.id}`) ? 'opacity-60' : ''} hover:border-primary/50 transition-all cursor-pointer`}
                    onClick={() => window.location.href = `/ai-experts?mission=${encodeURIComponent(item.title + ': ' + item.description)}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className={getPriorityColor(item.priority)}>
                            {item.category}
                          </Badge>
                        </div>
                        <h3 className="font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                          {item.title}
                          <ArrowRight className="w-4 h-4 inline ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </h3>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
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

            {/* Email Summary - Chief of Staff Review */}
            <Card className="bg-card/60 border-border">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-foreground">
                  <div className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-blue-400" />
                    Email Review - Chief of Staff
                  </div>
                  <Badge className="bg-red-500/20 text-red-400 border-0">
                    {BRIEF_DATA.emailSummary.highPriority} urgent
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Email Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <p className="text-2xl font-bold text-blue-400">{BRIEF_DATA.emailSummary.unread}</p>
                    <p className="text-xs text-muted-foreground">Unread</p>
                  </div>
                  <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                    <p className="text-2xl font-bold text-orange-400">{BRIEF_DATA.emailSummary.requiresResponse}</p>
                    <p className="text-xs text-muted-foreground">Need Response</p>
                  </div>
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    <p className="text-2xl font-bold text-red-400">{BRIEF_DATA.emailSummary.highPriority}</p>
                    <p className="text-xs text-muted-foreground">High Priority</p>
                  </div>
                </div>

                {/* Urgent Emails with Suggested Responses */}
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    Urgent - Requires Your Attention
                  </h4>
                  <div className="space-y-3">
                    {BRIEF_DATA.emailSummary.urgent.map((email) => (
                      <div 
                        key={email.id}
                        className={`p-4 rounded-xl border ${email.priority === 'urgent' ? 'bg-red-500/5 border-red-500/20' : 'bg-orange-500/5 border-orange-500/20'} ${isActioned(`email-${email.id}`) ? 'opacity-60' : ''}`}
                      >
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className={email.priority === 'urgent' ? 'text-red-400 border-red-400/30' : 'text-orange-400 border-orange-400/30'}>
                                {email.priority}
                              </Badge>
                              <span className="text-xs text-muted-foreground truncate">{email.from}</span>
                            </div>
                            <h4 className="font-bold text-foreground text-sm mb-1">{email.subject}</h4>
                            <p className="text-xs text-muted-foreground line-clamp-2">{email.preview}</p>
                          </div>
                          <ActionButtons 
                            itemId={`email-${email.id}`}
                            title={email.subject}
                            description={email.preview}
                            category="Email"
                            source="key"
                          />
                        </div>
                        
                        {/* COS Suggested Response */}
                        {email.suggestedResponse && (
                          <div className="mt-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                            <div className="flex items-start gap-2 mb-2">
                              <Brain className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-blue-400 mb-1">COS Suggested Response:</p>
                                <p className="text-xs text-foreground/80 italic">"{email.suggestedResponse}"</p>
                              </div>
                            </div>
                            <div className="flex gap-2 mt-2">
                              <Button size="sm" variant="outline" className="h-7 text-xs border-blue-500/30 hover:bg-blue-500/10">
                                <CheckCircle2 className="w-3 h-3 mr-1" /> Use Draft
                              </Button>
                              <Button size="sm" variant="ghost" className="h-7 text-xs hover:bg-blue-500/10">
                                Edit
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actionable Emails */}
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <ListChecks className="w-4 h-4 text-blue-400" />
                    Action Required Today
                  </h4>
                  <div className="space-y-2">
                    {BRIEF_DATA.emailSummary.actionable.map((email) => (
                      <div 
                        key={email.id}
                        className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20 hover:border-blue-500/40 transition-colors cursor-pointer"
                      >
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">{email.from}: {email.subject}</p>
                            <p className="text-xs text-blue-400 mt-1">{email.action}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* View All Emails Button */}
                <Button 
                  variant="outline" 
                  className="w-full border-blue-500/30 hover:bg-blue-500/10"
                  onClick={() => window.location.href = '/email/inbox'}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  View All Emails ({BRIEF_DATA.emailSummary.unread} unread)
                </Button>
              </CardContent>
            </Card>

            {/* Chief of Staff Insights */}
            <Card className="bg-card/60 border-border">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Brain className="w-5 h-5 text-purple-400" />
                  Chief of Staff Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {BRIEF_DATA.twinRecommendations.map((rec) => (
                  <div 
                    key={rec.id}
                    className={`p-4 rounded-xl bg-purple-500/5 border border-purple-500/20 ${isActioned(`rec-${rec.id}`) ? 'opacity-60' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Lightbulb className="w-4 h-4 text-purple-400" />
                          <Badge className="bg-purple-500/20 text-purple-400 border-0">
                            {rec.confidence}% confidence
                          </Badge>
                        </div>
                        <h4 className="font-bold text-foreground mb-1">{rec.title}</h4>
                        <p className="text-sm text-muted-foreground">{rec.reason}</p>
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
                <Calendar className="w-5 h-5 text-blue-400" />
                Today's Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-[76px] top-0 bottom-0 w-px bg-border"></div>
                
                <div className="space-y-4">
                  {BRIEF_DATA.schedule.map((item, idx) => (
                    <div key={item.id} className="flex items-start gap-4 relative">
                      <div className="text-center min-w-[60px] shrink-0">
                        <div className="text-lg font-bold text-foreground">{item.time}</div>
                        <div className="text-xs text-muted-foreground">{item.duration}</div>
                      </div>
                      
                      {/* Timeline dot */}
                      <div className={`w-3 h-3 rounded-full mt-2 shrink-0 z-10 ${
                        item.type === "deadline" ? "bg-red-500" :
                        item.type === "external" ? "bg-green-500" :
                        item.type === "focus" ? "bg-purple-500" :
                        "bg-blue-500"
                      }`}></div>
                      
                      <div className={`flex-1 p-4 rounded-xl border transition-colors ${
                        item.type === "deadline" ? "bg-red-500/5 border-red-500/20" :
                        item.type === "external" ? "bg-green-500/5 border-green-500/20" :
                        item.type === "focus" ? "bg-purple-500/5 border-purple-500/20" :
                        "bg-card border-border hover:border-primary/30"
                      }`}>
                        <div className="flex items-center gap-2 mb-1">
                          {getTypeIcon(item.type)}
                          <span className="font-medium text-foreground">{item.title}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">{item.location}</div>
                        {item.attendees.length > 0 && (
                          <div className="flex items-center gap-1 mt-2">
                            <Users className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{item.attendees.join(", ")}</span>
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
          <Card className="bg-card/60 border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <TrendingUp className="w-5 h-5 text-cyan-400" />
                Intelligence Feed
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {BRIEF_DATA.intelligence.map((item) => (
                <div 
                  key={item.id}
                  className={`p-4 rounded-xl border ${getSentimentColor(item.sentiment)} ${isActioned(`intel-${item.id}`) ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {item.source}
                        </Badge>
                        <Badge className={getSentimentColor(item.sentiment)}>
                          {item.sentiment}
                        </Badge>
                      </div>
                      <h3 className="font-bold text-foreground mb-1">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.summary}</p>
                    </div>
                    {item.actionable && (
                      <ActionButtons 
                        itemId={`intel-${item.id}`}
                        title={item.title}
                        description={item.summary}
                        category={item.source}
                        source="intelligence"
                      />
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Strategy Tab */}
        {activeTab === "strategy" && (
          <div className="space-y-6">
            {/* Market Position */}
            <Card className="bg-card/60 border-border">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Market Position
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-green-400">{BRIEF_DATA.strategyBriefing.marketPosition.status}</span>
                    <TrendingUp className="w-5 h-5 text-green-400" />
                  </div>
                  <p className="text-muted-foreground">{BRIEF_DATA.strategyBriefing.marketPosition.summary}</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {BRIEF_DATA.strategyBriefing.keyMetrics.map((metric, i) => (
                    <div key={i} className="bg-background/50 rounded-lg p-4">
                      <div className="text-sm text-muted-foreground mb-1">{metric.label}</div>
                      <div className="text-xl font-bold text-foreground">{metric.value}</div>
                      <div className={`text-sm ${metric.trend === 'up' ? 'text-green-400' : metric.trend === 'down' ? 'text-red-400' : 'text-muted-foreground'}`}>
                        {metric.change}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Competitor Alerts */}
            <Card className="bg-card/60 border-border">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <AlertTriangle className="w-5 h-5 text-orange-400" />
                  Competitor Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {BRIEF_DATA.strategyBriefing.competitorAlerts.map((alert, i) => (
                    <div key={i} className="flex items-start justify-between p-4 bg-background/50 rounded-lg">
                      <div>
                        <div className="font-medium text-foreground">{alert.competitor}</div>
                        <div className="text-sm text-muted-foreground">{alert.alert}</div>
                        <div className="text-sm text-primary mt-1">→ {alert.recommendation}</div>
                      </div>
                      <Badge variant={alert.impact === 'high' ? 'destructive' : alert.impact === 'medium' ? 'default' : 'secondary'}>
                        {alert.impact} impact
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Strategic Priorities */}
            <Card className="bg-card/60 border-border">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Lightbulb className="w-5 h-5 text-yellow-400" />
                  Strategic Priorities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {BRIEF_DATA.strategyBriefing.strategicPriorities.map((priority, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-foreground">{priority.priority}</span>
                        <Badge variant={priority.status === 'ahead' ? 'default' : priority.status === 'on-track' ? 'secondary' : 'destructive'}>
                          {priority.status}
                        </Badge>
                      </div>
                      <div className="h-2 bg-background rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            priority.status === 'ahead' ? 'bg-green-500' : 
                            priority.status === 'on-track' ? 'bg-blue-500' : 'bg-orange-500'
                          }`}
                          style={{ width: `${priority.progress}%` }}
                        />
                      </div>
                      <div className="text-sm text-muted-foreground text-right">{priority.progress}% complete</div>
                    </div>
                  ))}
                </div>
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
                    toast.success('Opening calendar to schedule meeting...');
                  }}
                  onSendEmail={() => {
                    toast.success('Opening email draft with suggested recipients...');
                  }}
                  onCreateTask={() => {
                    toast.success('Adding task to your list with suggested priority...');
                  }}
                  onEscalate={() => {
                    toast.success('Escalating to expert team immediately...');
                  }}
                />
              </CardContent>
            </Card>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "You'll Handle", count: actionedItems.filter(i => i.action === "gotit").length, color: "text-green-400", bg: "bg-green-500/10" },
                { label: "Deferred", count: actionedItems.filter(i => i.action === "defer").length, color: "text-yellow-400", bg: "bg-yellow-500/10" },
                { label: "Delegated", count: actionedItems.filter(i => i.action === "delegate").length, color: "text-blue-400", bg: "bg-blue-500/10" },
                { label: "Chief of Staff", count: actionedItems.filter(i => i.action === "twin").length, color: "text-purple-400", bg: "bg-purple-500/10" },
              ].map((stat) => (
                <Card key={stat.label} className={`${stat.bg} border-border`}>
                  <CardContent className="p-4 text-center">
                    <div className={`text-3xl font-bold ${stat.color}`}>{stat.count}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
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
                    <p className="text-sm mt-1">Review the Overview, Schedule, and Intelligence tabs to action items</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {actionedItems.map((item) => {
                      const actionInfo = getActionLabel(item.action);
                      return (
                        <div 
                          key={item.id}
                          className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30 border border-border"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="text-xs">{item.category}</Badge>
                              <Badge className={`${actionInfo.color} border-0`}>
                                {actionInfo.label}
                              </Badge>
                            </div>
                            <h4 className="font-medium text-foreground">{item.title}</h4>
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setActionedItems(prev => prev.filter(i => i.id !== item.id))}
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
                        toast.success("Day plan confirmed! Your Chief of Staff and team are now working on assigned tasks.");
                        // Could navigate to dashboard or show confirmation
                      }}
                    >
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      Confirm & Start Day
                    </Button>
                    <p className="text-center text-sm text-muted-foreground mt-2">
                      This will notify your team and activate your Chief of Staff for assigned tasks
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
