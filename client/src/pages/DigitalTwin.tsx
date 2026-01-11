import { useState, useEffect } from "react";
import { 
  Fingerprint, Brain, CheckCircle2, XCircle, BarChart3, 
  Mic, MicOff, MessageSquare, Users, Clock, Calendar,
  TrendingUp, Sparkles, Play, Pause, Volume2, Send,
  ChevronRight, Star, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

// AI Expert profiles for coaching sessions
const AI_EXPERTS = [
  { id: "strategy", name: "Alex Chen", role: "Strategy Lead", avatar: "AC", proactivity: 92, lastSession: "2 hours ago", suggestions: 12 },
  { id: "research", name: "Dr. Priya Sharma", role: "Research Lead", avatar: "PS", proactivity: 88, lastSession: "4 hours ago", suggestions: 8 },
  { id: "marketing", name: "Marcus Johnson", role: "Marketing Expert", avatar: "MJ", proactivity: 76, lastSession: "Yesterday", suggestions: 5 },
  { id: "finance", name: "David Park", role: "Finance Expert", avatar: "DP", proactivity: 71, lastSession: "Yesterday", suggestions: 3 },
  { id: "engineering", name: "Sarah Kim", role: "Engineering Lead", avatar: "SK", proactivity: 68, lastSession: "2 days ago", suggestions: 4 },
];

// Conversation history with Digital Twin
const INITIAL_CONVERSATIONS = [
  { id: 1, from: "twin", message: "Good morning! I've been analyzing your patterns overnight. I noticed you tend to be most productive on strategic decisions between 9-11 AM. Should I prioritize those items in your Daily Brief?", time: "7:00 AM" },
  { id: 2, from: "user", message: "Yes, that makes sense. Also prioritize anything from the finance team.", time: "7:02 AM" },
  { id: 3, from: "twin", message: "Noted. I've also identified a potential opportunity - based on market trends and your previous interest in renewable energy, there's a partnership opportunity with SolarTech that aligns with your Q2 goals. Should I have the Strategy team research this?", time: "7:03 AM" },
];

// Activity log showing Twin's autonomous work
const ACTIVITY_LOG = [
  { id: 1, action: "Drafted 3 email responses", status: "pending_review", time: "6:45 AM", type: "email" },
  { id: 2, action: "Scheduled coaching session with Alex Chen", status: "completed", time: "6:30 AM", type: "coaching" },
  { id: 3, action: "Analyzed competitor report from Research team", status: "completed", time: "5:15 AM", type: "analysis" },
  { id: 4, action: "Suggested new project: Market Expansion APAC", status: "awaiting_approval", time: "4:30 AM", type: "suggestion" },
  { id: 5, action: "Reviewed and approved routine scheduling requests", status: "completed", time: "3:00 AM", type: "autonomous" },
];

export default function DigitalTwin() {
  const [autonomyLevel, setAutonomyLevel] = useState(35);
  const [hoursLearned, setHoursLearned] = useState(42);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [conversations, setConversations] = useState(INITIAL_CONVERSATIONS);
  const [messageInput, setMessageInput] = useState("");
  const [activeTab, setActiveTab] = useState("conversation");
  const [nextTrainingTime, setNextTrainingTime] = useState("2:30 PM");

  // Toggle voice recording
  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      toast.info("Listening... speak to your Digital Twin");
    } else {
      toast.success("Voice captured - processing...");
      // Simulate adding a voice message
      setTimeout(() => {
        const newMessage = {
          id: conversations.length + 1,
          from: "user" as const,
          message: "[Voice Note] I want to focus more on the renewable energy sector this quarter. Can you start identifying opportunities?",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setConversations(prev => [...prev, newMessage]);
        
        // Twin response
        setTimeout(() => {
          const twinResponse = {
            id: conversations.length + 2,
            from: "twin" as const,
            message: "Understood! I'll prioritize renewable energy opportunities. I'll have the Research team compile a market analysis and ask Strategy to identify potential partnerships. I'll present findings in tomorrow's Daily Brief.",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setConversations(prev => [...prev, twinResponse]);
        }, 2000);
      }, 1500);
    }
  };

  // Send text message
  const sendMessage = () => {
    if (!messageInput.trim()) return;
    
    const newMessage = {
      id: conversations.length + 1,
      from: "user" as const,
      message: messageInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setConversations(prev => [...prev, newMessage]);
    setMessageInput("");
    
    // Simulate twin response
    setTimeout(() => {
      const twinResponse = {
        id: conversations.length + 2,
        from: "twin" as const,
        message: "I understand. I'll incorporate this into my learning and adjust my approach accordingly. Is there anything specific you'd like me to prioritize?",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setConversations(prev => [...prev, twinResponse]);
    }, 1500);
  };

  // Start coaching session with expert
  const startCoachingSession = (expertId: string) => {
    const expert = AI_EXPERTS.find(e => e.id === expertId);
    toast.success(`Starting 30-minute coaching session with ${expert?.name}`);
  };

  return (
    <div className="h-full bg-background text-foreground overflow-auto">
      {/* Header */}
      <div className="border-b border-border bg-card/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
                <Fingerprint className="w-6 h-6 md:w-8 md:h-8 text-purple-400" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-display font-bold">Digital Twin</h1>
                <p className="text-muted-foreground text-sm">Your AI extension • Working 24/7</p>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="hidden md:flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">{autonomyLevel}%</div>
                <div className="text-xs text-muted-foreground">Autonomy</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-400">{hoursLearned}h</div>
                <div className="text-xs text-muted-foreground">Trained</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-400">5</div>
                <div className="text-xs text-muted-foreground">Pending Review</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Conversation & Training */}
          <div className="lg:col-span-2 space-y-6">
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full grid grid-cols-3 bg-card/60">
                <TabsTrigger value="conversation" className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" /> Conversation
                </TabsTrigger>
                <TabsTrigger value="training" className="flex items-center gap-2">
                  <Brain className="w-4 h-4" /> Training
                </TabsTrigger>
                <TabsTrigger value="activity" className="flex items-center gap-2">
                  <Zap className="w-4 h-4" /> Activity
                </TabsTrigger>
              </TabsList>

              {/* Conversation Tab */}
              <TabsContent value="conversation" className="mt-4">
                <Card className="bg-card/60 border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Fingerprint className="w-5 h-5 text-purple-400" />
                        Talk to Your Digital Twin
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="gap-2"
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                        {isPlaying ? "Pause" : "Listen"}
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-80 pr-4 mb-4">
                      <div className="space-y-4">
                        {conversations.map((msg) => (
                          <div key={msg.id} className={`flex gap-3 ${msg.from === "user" ? "flex-row-reverse" : ""}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                              msg.from === "twin" 
                                ? "bg-purple-500/20 text-purple-400" 
                                : "bg-primary/20 text-primary"
                            }`}>
                              {msg.from === "twin" ? <Fingerprint className="w-4 h-4" /> : "Y"}
                            </div>
                            <div className={`flex-1 max-w-[80%] ${msg.from === "user" ? "text-right" : ""}`}>
                              <div className={`inline-block p-3 rounded-2xl ${
                                msg.from === "twin" 
                                  ? "bg-purple-500/10 border border-purple-500/20" 
                                  : "bg-primary/10 border border-primary/20"
                              }`}>
                                <p className="text-sm">{msg.message}</p>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">{msg.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                    
                    {/* Input Area */}
                    <div className="flex gap-2 pt-4 border-t border-border">
                      <Button
                        size="icon"
                        variant={isRecording ? "destructive" : "outline"}
                        onClick={toggleRecording}
                        className={isRecording ? "animate-pulse" : ""}
                      >
                        {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                      </Button>
                      <input
                        type="text"
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                        placeholder="Type or speak to your Digital Twin..."
                        className="flex-1 px-4 py-2 rounded-xl bg-secondary/50 border border-border focus:border-primary focus:outline-none"
                      />
                      <Button onClick={sendMessage} disabled={!messageInput.trim()}>
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Training Tab */}
              <TabsContent value="training" className="mt-4">
                <Card className="bg-card/60 border-border">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Brain className="w-5 h-5 text-purple-400" />
                        Active Training Module
                      </CardTitle>
                      <Badge className="bg-purple-500/20 text-purple-400 border-0">
                        <Clock className="w-3 h-3 mr-1" /> 15 min session
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20">
                      <h3 className="font-bold mb-2">Scenario #128: Client Negotiation</h3>
                      <p className="text-muted-foreground text-sm italic mb-4">
                        "A long-term client asks for a 15% discount on renewal due to budget cuts. How do you respond?"
                      </p>
                      
                      <div className="space-y-3">
                        <Button variant="outline" className="w-full justify-start h-auto py-3 hover:bg-purple-500/10 hover:border-purple-500/50">
                          <div className="flex items-start gap-3 text-left">
                            <div className="mt-0.5 w-5 h-5 rounded-full border border-muted-foreground flex items-center justify-center">A</div>
                            <div>
                              <span className="font-bold block text-sm">Value Add Approach</span>
                              <span className="text-xs text-muted-foreground">Decline discount, offer 2 months free service.</span>
                            </div>
                          </div>
                        </Button>
                        
                        <Button variant="outline" className="w-full justify-start h-auto py-3 hover:bg-purple-500/10 hover:border-purple-500/50">
                          <div className="flex items-start gap-3 text-left">
                            <div className="mt-0.5 w-5 h-5 rounded-full border border-muted-foreground flex items-center justify-center">B</div>
                            <div>
                              <span className="font-bold block text-sm">Conditional Discount</span>
                              <span className="text-xs text-muted-foreground">Agree to 10% for 2-year contract commitment.</span>
                            </div>
                          </div>
                        </Button>
                      </div>
                    </div>
                    
                    {/* Next Training Reminder */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Next scheduled training</p>
                          <p className="text-xs text-muted-foreground">{nextTrainingTime} today</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">Reschedule</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Activity Tab */}
              <TabsContent value="activity" className="mt-4">
                <Card className="bg-card/60 border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-cyan-400" />
                      Overnight Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-80">
                      <div className="space-y-3">
                        {ACTIVITY_LOG.map((item) => (
                          <div key={item.id} className={`p-3 rounded-xl border ${
                            item.status === "pending_review" ? "bg-yellow-500/5 border-yellow-500/30" :
                            item.status === "awaiting_approval" ? "bg-cyan-500/5 border-cyan-500/30" :
                            "bg-secondary/30 border-border"
                          }`}>
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3">
                                <div className={`mt-0.5 w-2 h-2 rounded-full ${
                                  item.status === "completed" ? "bg-green-500" :
                                  item.status === "pending_review" ? "bg-yellow-500" :
                                  "bg-cyan-500"
                                }`} />
                                <div>
                                  <p className="text-sm font-medium">{item.action}</p>
                                  <p className="text-xs text-muted-foreground">{item.time}</p>
                                </div>
                              </div>
                              {item.status === "pending_review" && (
                                <Button size="sm" variant="outline" className="text-xs">Review</Button>
                              )}
                              {item.status === "awaiting_approval" && (
                                <Button size="sm" className="text-xs bg-cyan-500 hover:bg-cyan-600">Approve</Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Team & Stats */}
          <div className="space-y-6">
            
            {/* Autonomy Progress */}
            <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium">Autonomy Level</span>
                  <span className="text-2xl font-bold text-purple-400">{autonomyLevel}%</span>
                </div>
                <Progress value={autonomyLevel} className="h-2 mb-2" />
                <p className="text-xs text-muted-foreground">Target: 85% for full delegation</p>
              </CardContent>
            </Card>

            {/* AI Expert Team - Coaching Sessions */}
            <Card className="bg-card/60 border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Users className="w-4 h-4 text-cyan-400" />
                  Expert Team Relationships
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {AI_EXPERTS.map((expert) => (
                  <div 
                    key={expert.id}
                    className="p-3 rounded-xl bg-secondary/30 border border-border hover:border-primary/30 transition-all cursor-pointer"
                    onClick={() => startCoachingSession(expert.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-xs font-bold text-cyan-400">
                          {expert.avatar}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{expert.name}</p>
                          <p className="text-xs text-muted-foreground">{expert.role}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500" />
                        <span className="text-xs font-bold">{expert.proactivity}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Last session: {expert.lastSession}</span>
                      <span>{expert.suggestions} suggestions</span>
                    </div>
                  </div>
                ))}
                
                <Button variant="outline" className="w-full mt-2" size="sm">
                  <Play className="w-3 h-3 mr-2" /> Start Coaching Session
                </Button>
              </CardContent>
            </Card>

            {/* Performance Log */}
            <Card className="bg-card/60 border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-pink-400" />
                  Recent Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-xs">Email Draft Approved</span>
                  </div>
                  <span className="text-xs text-green-400">+0.5%</span>
                </div>
                <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-xs">Schedule Optimized</span>
                  </div>
                  <span className="text-xs text-green-400">+0.3%</span>
                </div>
                <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-500" />
                    <span className="text-xs">Meeting Rejected</span>
                  </div>
                  <span className="text-xs text-red-400">Logged</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
