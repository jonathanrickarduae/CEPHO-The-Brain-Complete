import { useState } from "react";
import { 
  Sun, Calendar, Users, TrendingUp, Brain, Zap, 
  CheckCircle2, Clock, ArrowRight, Download, Play, 
  Headphones, ChevronRight, AlertTriangle, Lightbulb,
  Mail, Phone, Video, FileText, ThumbsUp, RotateCcw, UserPlus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// Mock data for the daily brief
const BRIEF_DATA = {
  date: new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
  moodTarget: 10,
  currentMood: 7,
  
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
  ],
  
  intelligence: [
    { id: 1, source: "Market Watch", title: "Renewable Energy Stocks Up 12%", summary: "Overnight surge driven by policy announcements. Your portfolio exposure: 23%.", sentiment: "positive" },
    { id: 2, source: "Industry Alert", title: "New AI Regulations Proposed", summary: "Draft legislation could impact autonomous systems. Review by legal recommended.", sentiment: "neutral" },
    { id: 3, source: "Competitor Intel", title: "Competitor Y Hiring Spree", summary: "50+ engineering roles posted. Possible new product launch in 6 months.", sentiment: "warning" },
  ],
  
  twinRecommendations: [
    { id: 1, confidence: 92, title: "Delegate Budget Review Details", reason: "Based on your pattern, you typically delegate financial details to CFO. Suggest same approach today." },
    { id: 2, confidence: 87, title: "Prepare Investor Talking Points", reason: "Your successful investor meetings include 3 key metrics. I've drafted talking points." },
    { id: 3, confidence: 78, title: "Block Focus Time After 4 PM", reason: "Your productivity peaks in late afternoon. No meetings scheduled - protect this time." },
  ],
};

export default function DailyBrief() {
  const [actionedItems, setActionedItems] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<"overview" | "schedule" | "intelligence" | "actions">("overview");

  const handleAction = (itemId: string, action: "gotit" | "defer" | "delegate") => {
    setActionedItems(prev => new Set(prev).add(itemId));
    const messages = {
      gotit: "Got it! Added to your focus list.",
      defer: "Deferred to tomorrow's brief.",
      delegate: "Delegation request sent."
    };
    toast.success(messages[action]);
  };

  const handleExport = (format: "pdf" | "video" | "audio") => {
    const messages = {
      pdf: "Generating 2-page PDF brief...",
      video: "Preparing video presentation...",
      audio: "Creating podcast version..."
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "meeting": return <Video className="w-4 h-4" />;
      case "external": return <Users className="w-4 h-4" />;
      case "deadline": return <AlertTriangle className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30">
                <Sun className="w-8 h-8 text-blue-400" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-display font-bold">Daily Brief</h1>
                <p className="text-white/60 text-sm">{BRIEF_DATA.date} • 5 min read</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                className="border-white/20 hover:bg-white/10"
                onClick={() => handleExport("pdf")}
              >
                <Download className="w-4 h-4 mr-2" /> PDF
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="border-white/20 hover:bg-white/10"
                onClick={() => handleExport("video")}
              >
                <Play className="w-4 h-4 mr-2" /> Video
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="border-white/20 hover:bg-white/10"
                onClick={() => handleExport("audio")}
              >
                <Headphones className="w-4 h-4 mr-2" /> Podcast
              </Button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-1 mt-4 border-b border-white/10 -mb-px">
            {[
              { id: "overview", label: "Overview", icon: FileText },
              { id: "schedule", label: "Schedule", icon: Calendar },
              { id: "intelligence", label: "Intelligence", icon: TrendingUp },
              { id: "actions", label: "Action Engine", icon: Zap },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id 
                    ? "border-primary text-primary" 
                    : "border-transparent text-white/60 hover:text-white"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Key Things to Know - Main Column */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <AlertTriangle className="w-5 h-5 text-yellow-400" />
                    Key Things You Need to Know
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {BRIEF_DATA.keyThings.map((item) => (
                    <div 
                      key={item.id}
                      className={`p-4 rounded-xl border ${getPriorityColor(item.priority)} ${actionedItems.has(`key-${item.id}`) ? 'opacity-50' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className={getPriorityColor(item.priority)}>
                              {item.category}
                            </Badge>
                          </div>
                          <h3 className="font-bold text-white mb-1">{item.title}</h3>
                          <p className="text-sm text-white/70">{item.description}</p>
                        </div>
                        {!actionedItems.has(`key-${item.id}`) && (
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 px-2 hover:bg-green-500/20 hover:text-green-400"
                              onClick={() => handleAction(`key-${item.id}`, "gotit")}
                            >
                              <ThumbsUp className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 px-2 hover:bg-yellow-500/20 hover:text-yellow-400"
                              onClick={() => handleAction(`key-${item.id}`, "defer")}
                            >
                              <RotateCcw className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 px-2 hover:bg-blue-500/20 hover:text-blue-400"
                              onClick={() => handleAction(`key-${item.id}`, "delegate")}
                            >
                              <UserPlus className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Quick Schedule Preview */}
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Calendar className="w-5 h-5 text-blue-400" />
                      Today's Schedule
                    </CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab("schedule")}>
                      View All <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {BRIEF_DATA.schedule.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex items-center gap-4 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                        <div className="text-center min-w-[60px]">
                          <div className="text-lg font-bold text-white">{item.time}</div>
                          <div className="text-xs text-white/40">{item.duration}</div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            {getTypeIcon(item.type)}
                            <span className="font-medium text-white">{item.title}</span>
                          </div>
                          <div className="text-xs text-white/50 mt-1">{item.location}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - Digital Twin Recommendations */}
            <div className="space-y-6">
              <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Brain className="w-5 h-5 text-purple-400" />
                    Digital Twin Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {BRIEF_DATA.twinRecommendations.map((rec) => (
                    <div key={rec.id} className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <Lightbulb className="w-4 h-4 text-yellow-400" />
                        <Badge variant="outline" className="text-purple-400 border-purple-400/30 text-xs">
                          {rec.confidence}% confidence
                        </Badge>
                      </div>
                      <h4 className="font-bold text-white text-sm mb-1">{rec.title}</h4>
                      <p className="text-xs text-white/60">{rec.reason}</p>
                      {!actionedItems.has(`rec-${rec.id}`) && (
                        <div className="flex gap-2 mt-3">
                          <Button 
                            size="sm" 
                            className="flex-1 h-8 bg-purple-600 hover:bg-purple-700 text-xs"
                            onClick={() => handleAction(`rec-${rec.id}`, "gotit")}
                          >
                            Got it
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1 h-8 border-white/20 text-xs"
                            onClick={() => handleAction(`rec-${rec.id}`, "defer")}
                          >
                            Later
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary mb-1">
                      {BRIEF_DATA.schedule.length}
                    </div>
                    <div className="text-sm text-white/60">Events Today</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/10">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">{BRIEF_DATA.keyThings.filter(k => k.priority === "high").length}</div>
                      <div className="text-xs text-white/40">High Priority</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400">{BRIEF_DATA.intelligence.length}</div>
                      <div className="text-xs text-white/40">Intel Updates</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Schedule Tab */}
        {activeTab === "schedule" && (
          <div className="max-w-4xl mx-auto">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Calendar className="w-5 h-5 text-blue-400" />
                  Full Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <div className="absolute left-[30px] top-0 bottom-0 w-px bg-white/10"></div>
                  <div className="space-y-6">
                    {BRIEF_DATA.schedule.map((item, index) => (
                      <div key={item.id} className="relative flex gap-6 pl-16">
                        <div className="absolute left-0 top-0 w-[60px] text-right pr-4">
                          <div className="text-lg font-bold text-white">{item.time}</div>
                          <div className="text-xs text-white/40">{item.duration}</div>
                        </div>
                        <div className="absolute left-[26px] top-2 w-3 h-3 rounded-full bg-primary border-2 border-black"></div>
                        <div className="flex-1 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                {getTypeIcon(item.type)}
                                <h3 className="font-bold text-white">{item.title}</h3>
                              </div>
                              <div className="text-sm text-white/60 mb-2">{item.location}</div>
                              {item.attendees.length > 0 && (
                                <div className="flex items-center gap-2 text-xs text-white/40">
                                  <Users className="w-3 h-3" />
                                  {item.attendees.join(", ")}
                                </div>
                              )}
                            </div>
                            <Badge 
                              variant="outline" 
                              className={
                                item.type === "deadline" 
                                  ? "border-red-500/30 text-red-400" 
                                  : "border-white/20 text-white/60"
                              }
                            >
                              {item.type}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Intelligence Tab */}
        {activeTab === "intelligence" && (
          <div className="max-w-4xl mx-auto">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  Intelligence Feed
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {BRIEF_DATA.intelligence.map((item) => (
                  <div 
                    key={item.id} 
                    className={`p-5 rounded-xl border ${
                      item.sentiment === "positive" ? "bg-green-500/5 border-green-500/20" :
                      item.sentiment === "warning" ? "bg-yellow-500/5 border-yellow-500/20" :
                      "bg-white/5 border-white/10"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="outline" className="text-xs text-white/60 border-white/20">
                        {item.source}
                      </Badge>
                      <div className={`w-2 h-2 rounded-full ${
                        item.sentiment === "positive" ? "bg-green-500" :
                        item.sentiment === "warning" ? "bg-yellow-500" :
                        "bg-blue-500"
                      }`}></div>
                    </div>
                    <h3 className="font-bold text-white text-lg mb-2">{item.title}</h3>
                    <p className="text-white/70">{item.summary}</p>
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline" className="border-white/20 text-xs">
                        Read More
                      </Button>
                      <Button size="sm" variant="ghost" className="text-xs">
                        Investigate with AI Experts
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Action Engine Tab */}
        {activeTab === "actions" && (
          <div className="max-w-4xl mx-auto">
            <Card className="bg-gradient-to-br from-primary/10 to-purple-500/10 border-primary/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Zap className="w-5 h-5 text-primary" />
                  Action Engine
                </CardTitle>
                <p className="text-white/60 text-sm mt-1">
                  Quick-action your way through today's priorities. Your responses train your Digital Twin.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {[...BRIEF_DATA.keyThings, ...BRIEF_DATA.twinRecommendations.map(r => ({
                  id: `rec-${r.id}`,
                  priority: "medium",
                  title: r.title,
                  description: r.reason,
                  category: "AI Recommendation"
                }))].map((item) => {
                  const itemKey = typeof item.id === 'number' ? `action-${item.id}` : item.id;
                  const isActioned = actionedItems.has(itemKey);
                  
                  return (
                    <div 
                      key={itemKey}
                      className={`p-5 rounded-xl bg-white/5 border border-white/10 transition-all ${isActioned ? 'opacity-50 scale-98' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <Badge variant="outline" className="text-xs mb-2 border-white/20">
                            {item.category}
                          </Badge>
                          <h3 className="font-bold text-white mb-1">{item.title}</h3>
                          <p className="text-sm text-white/60">{item.description}</p>
                        </div>
                        {!isActioned ? (
                          <div className="flex flex-col gap-2">
                            <Button 
                              size="sm" 
                              className="bg-green-600 hover:bg-green-700 w-24"
                              onClick={() => handleAction(itemKey, "gotit")}
                            >
                              <ThumbsUp className="w-4 h-4 mr-1" /> Got it
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 w-24"
                              onClick={() => handleAction(itemKey, "defer")}
                            >
                              <RotateCcw className="w-4 h-4 mr-1" /> Defer
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10 w-24"
                              onClick={() => handleAction(itemKey, "delegate")}
                            >
                              <UserPlus className="w-4 h-4 mr-1" /> Delegate
                            </Button>
                          </div>
                        ) : (
                          <CheckCircle2 className="w-6 h-6 text-green-500" />
                        )}
                      </div>
                    </div>
                  );
                })}

                <div className="p-4 rounded-xl bg-primary/10 border border-primary/30 text-center mt-6">
                  <p className="text-white/80 mb-2">
                    <span className="font-bold text-primary">{actionedItems.size}</span> of {BRIEF_DATA.keyThings.length + BRIEF_DATA.twinRecommendations.length} items actioned
                  </p>
                  <p className="text-xs text-white/50">Your responses are training your Digital Twin</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

      </div>
    </div>
  );
}
