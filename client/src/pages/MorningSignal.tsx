import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import BrainLayout from "@/components/BrainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Sun,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Brain,
  Sparkles,
  Calendar,
  Target,
  TrendingUp,
  Coffee,
  ArrowRight,
  Play,
  Volume2,
  Pause,
  Loader2,
} from "lucide-react";
import { useLocation } from "wouter";

interface SignalItem {
  id: string;
  type: "accepted" | "deferred" | "insight" | "overnight";
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  source: string;
  actionUrl?: string;
}

export default function MorningSignal() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch evening review data
  const { data: eveningReviewData } = trpc.eveningReview.getLatest.useQuery(
    undefined,
    { enabled: !!user }
  );

  // Pattern data from evening review metadata
  const patternData = eveningReviewData?.metadata as any;

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const formatDate = () => {
    return currentTime.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  // Generate signal items from evening review
  const generateSignalItems = (): SignalItem[] => {
    const items: SignalItem[] = [];

    if (eveningReviewData) {
      // Add accepted tasks from metadata
      const meta = eveningReviewData.metadata as any;
      if (meta?.acceptedTasks) {
        (meta.acceptedTasks as any[]).forEach((task: any, index: number) => {
          items.push({
            id: `accepted-${index}`,
            type: "accepted",
            title: task.title || `Task ${index + 1}`,
            description: task.description || "Ready for today",
            priority: task.priority || "medium",
            source: task.project || "Evening Review",
            actionUrl: "/workflow",
          });
        });
      }

      // Add deferred tasks from metadata
      if (meta?.deferredTasks) {
        (meta.deferredTasks as any[]).forEach((task: any, index: number) => {
          items.push({
            id: `deferred-${index}`,
            type: "deferred",
            title: task.title || `Deferred Task ${index + 1}`,
            description: task.reason || "Needs attention",
            priority: "high",
            source: task.project || "Evening Review",
            actionUrl: "/workflow",
          });
        });
      }

      // Add insights from metadata
      const metadata = eveningReviewData.metadata as any;
      if (metadata?.insights) {
        (metadata.insights as any[]).forEach((insight: any, index: number) => {
          items.push({
            id: `insight-${index}`,
            type: "insight",
            title: insight.title || "Insight",
            description: insight.content || insight,
            priority: "medium",
            source: "Digital Twin Analysis",
          });
        });
      }

      // Add overnight work from metadata
      if (metadata?.overnightWork) {
        (metadata.overnightWork as any[]).forEach((work: any, index: number) => {
          items.push({
            id: `overnight-${index}`,
            type: "overnight",
            title: work.title || "Overnight Progress",
            description: work.summary || "Completed while you slept",
            priority: "low",
            source: "Chief of Staff",
          });
        });
      }
    }

    // Add default items if no data
    if (items.length === 0) {
      items.push(
        {
          id: "default-1",
          type: "insight",
          title: "Morning Signal Ready",
          description:
            "Complete your first Evening Review to populate your morning briefing with personalized insights.",
          priority: "medium",
          source: "System",
          actionUrl: "/evening-review",
        },
        {
          id: "default-2",
          type: "accepted",
          title: "Set Up Your Day",
          description:
            "Use the Daily Brief to review your schedule and priorities for today.",
          priority: "high",
          source: "Getting Started",
          actionUrl: "/daily-brief",
        }
      );
    }

    return items;
  };

  const signalItems = generateSignalItems();
  const acceptedItems = signalItems.filter((i) => i.type === "accepted");
  const deferredItems = signalItems.filter((i) => i.type === "deferred");
  const insightItems = signalItems.filter((i) => i.type === "insight");
  const overnightItems = signalItems.filter((i) => i.type === "overnight");

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "medium":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "low":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "accepted":
        return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
      case "deferred":
        return <Clock className="h-4 w-4 text-amber-400" />;
      case "insight":
        return <Sparkles className="h-4 w-4 text-cyan-400" />;
      case "overnight":
        return <Brain className="h-4 w-4 text-purple-400" />;
      default:
        return <Target className="h-4 w-4 text-slate-400" />;
    }
  };

  // TTS mutation for generating audio
  const generateVoiceMutation = trpc.expertEvolution.generateVoice.useMutation();

  // Generate brief text for TTS
  const generateBriefText = (): string => {
    const greeting = getGreeting();
    const userName = user?.name?.split(" ")[0] || "there";
    const date = formatDate();
    
    let briefText = `${greeting}, ${userName}. Here's your morning signal for ${date}. `;
    
    // Add summary stats
    briefText += `You have ${acceptedItems.length} tasks ready for today`;
    if (deferredItems.length > 0) {
      briefText += `, and ${deferredItems.length} items that need your attention`;
    }
    briefText += ". ";
    
    // Add top priority items
    const highPriorityItems = signalItems.filter(i => i.priority === "high");
    if (highPriorityItems.length > 0) {
      briefText += `Your high priority items are: `;
      highPriorityItems.slice(0, 3).forEach((item, index) => {
        briefText += `${index + 1}. ${item.title}. `;
      });
    }
    
    // Add insights if any
    if (insightItems.length > 0) {
      briefText += `I have ${insightItems.length} insights from your digital twin. `;
      insightItems.slice(0, 2).forEach((item) => {
        briefText += `${item.title}: ${item.description}. `;
      });
    }
    
    // Add overnight work if any
    if (overnightItems.length > 0) {
      briefText += `While you were away, ${overnightItems.length} items were processed. `;
    }
    
    briefText += "Have a productive day!";
    
    return briefText;
  };

  const handlePlayBrief = async () => {
    // If already playing, pause
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }
    
    // If we have cached audio, play it
    if (audioRef.current && audioRef.current.src) {
      audioRef.current.play();
      setIsPlaying(true);
      return;
    }
    
    // Generate new audio
    setIsGeneratingAudio(true);
    try {
      const briefText = generateBriefText();
      const result = await generateVoiceMutation.mutateAsync({
        text: briefText,
        expertId: "chief-of-staff", // Use Chief of Staff voice
      });
      
      // Create audio from base64
      const audioBlob = new Blob(
        [Uint8Array.from(atob(result.audio), c => c.charCodeAt(0))],
        { type: result.contentType }
      );
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Create and play audio element
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      audio.onended = () => {
        setIsPlaying(false);
      };
      
      audio.onerror = () => {
        toast.error("Failed to play audio");
        setIsPlaying(false);
      };
      
      await audio.play();
      setIsPlaying(true);
      toast.success(`Playing brief with ${result.voiceName} voice`);
    } catch (error) {
      console.error("Failed to generate audio:", error);
      toast.error("Failed to generate audio brief. Please try again.");
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        if (audioRef.current.src) {
          URL.revokeObjectURL(audioRef.current.src);
        }
      }
    };
  }, []);

  if (authLoading) {
    return (
      <BrainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-pulse text-cyan-400">Loading...</div>
        </div>
      </BrainLayout>
    );
  }

  return (
    <BrainLayout>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30">
                <Sun className="h-6 w-6 text-amber-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {getGreeting()}, {user?.name?.split(" ")[0] || "there"}
                </h1>
                <p className="text-sm text-slate-400">{formatDate()}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePlayBrief}
              disabled={isGeneratingAudio}
              className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
            >
              {isGeneratingAudio ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : isPlaying ? (
                <Pause className="h-4 w-4 mr-2" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              {isGeneratingAudio ? "Generating..." : isPlaying ? "Pause" : "Listen to Brief"}
            </Button>
            <Button
              onClick={() => setLocation("/daily-brief")}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
            >
              <Coffee className="h-4 w-4 mr-2" />
              Full Daily Brief
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-slate-900/50 border-emerald-500/30">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/20">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {acceptedItems.length}
                </p>
                <p className="text-xs text-slate-400">Tasks Ready</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-amber-500/30">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20">
                <AlertTriangle className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {deferredItems.length}
                </p>
                <p className="text-xs text-slate-400">Need Attention</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-cyan-500/30">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-500/20">
                <Sparkles className="h-5 w-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {insightItems.length}
                </p>
                <p className="text-xs text-slate-400">Insights</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-purple-500/30">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Brain className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {overnightItems.length}
                </p>
                <p className="text-xs text-slate-400">Overnight Work</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pattern Insights Banner */}
        {patternData && patternData.preferredTime && (
          <Card className="bg-gradient-to-r from-purple-900/30 to-cyan-900/30 border-purple-500/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-purple-400" />
                <div className="flex-1">
                  <p className="text-sm text-white">
                    <span className="text-purple-400 font-medium">
                      Pattern Insight:
                    </span>{" "}
                    You typically complete evening reviews around{" "}
                    <span className="text-cyan-400 font-medium">
                      {patternData.preferredTime}
                    </span>
                    {patternData.preferredDay && (
                      <>
                        , especially on{" "}
                        <span className="text-cyan-400 font-medium">
                          {patternData.preferredDay}s
                        </span>
                      </>
                    )}
                    .
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="today" className="space-y-4">
          <TabsList className="bg-slate-800/50 border border-slate-700/50">
            <TabsTrigger value="today" className="data-[state=active]:bg-cyan-500/20">
              Today's Focus
            </TabsTrigger>
            <TabsTrigger value="attention" className="data-[state=active]:bg-amber-500/20">
              Needs Attention
            </TabsTrigger>
            <TabsTrigger value="insights" className="data-[state=active]:bg-purple-500/20">
              Insights
            </TabsTrigger>
            <TabsTrigger value="overnight" className="data-[state=active]:bg-blue-500/20">
              Overnight
            </TabsTrigger>
          </TabsList>

          {/* Today's Focus Tab */}
          <TabsContent value="today" className="space-y-4">
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  Tasks Ready for Today
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {acceptedItems.length > 0 ? (
                  acceptedItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-emerald-500/30 transition-colors cursor-pointer"
                      onClick={() => item.actionUrl && setLocation(item.actionUrl)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          {getTypeIcon(item.type)}
                          <div>
                            <h4 className="font-medium text-white">
                              {item.title}
                            </h4>
                            <p className="text-sm text-slate-400 mt-1">
                              {item.description}
                            </p>
                            <p className="text-xs text-slate-500 mt-2">
                              Source: {item.source}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={getPriorityColor(item.priority)}
                          >
                            {item.priority}
                          </Badge>
                          {item.actionUrl && (
                            <ArrowRight className="h-4 w-4 text-slate-500" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-400">
                    <CheckCircle2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No tasks scheduled for today yet.</p>
                    <p className="text-sm mt-1">
                      Complete an Evening Review to populate your morning signal.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Needs Attention Tab */}
          <TabsContent value="attention" className="space-y-4">
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-400" />
                  Items Requiring Attention
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {deferredItems.length > 0 ? (
                  deferredItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-lg bg-amber-900/20 border border-amber-500/30 hover:border-amber-400/50 transition-colors cursor-pointer"
                      onClick={() => item.actionUrl && setLocation(item.actionUrl)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          {getTypeIcon(item.type)}
                          <div>
                            <h4 className="font-medium text-white">
                              {item.title}
                            </h4>
                            <p className="text-sm text-amber-300/80 mt-1">
                              {item.description}
                            </p>
                            <p className="text-xs text-slate-500 mt-2">
                              Source: {item.source}
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                        >
                          Review
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-400">
                    <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-emerald-400 opacity-50" />
                    <p>All clear! No items need immediate attention.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-4">
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-cyan-400" />
                  Digital Twin Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {insightItems.length > 0 ? (
                  insightItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-lg bg-gradient-to-r from-cyan-900/20 to-purple-900/20 border border-cyan-500/30"
                    >
                      <div className="flex items-start gap-3">
                        {getTypeIcon(item.type)}
                        <div>
                          <h4 className="font-medium text-white">
                            {item.title}
                          </h4>
                          <p className="text-sm text-slate-300 mt-1">
                            {item.description}
                          </p>
                          <p className="text-xs text-slate-500 mt-2">
                            Generated by: {item.source}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-400">
                    <Sparkles className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No insights available yet.</p>
                    <p className="text-sm mt-1">
                      Insights are generated from your Evening Reviews.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Overnight Tab */}
          <TabsContent value="overnight" className="space-y-4">
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-400" />
                  Overnight Work by Chief of Staff
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {overnightItems.length > 0 ? (
                  overnightItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-lg bg-purple-900/20 border border-purple-500/30"
                    >
                      <div className="flex items-start gap-3">
                        {getTypeIcon(item.type)}
                        <div>
                          <h4 className="font-medium text-white">
                            {item.title}
                          </h4>
                          <p className="text-sm text-slate-300 mt-1">
                            {item.description}
                          </p>
                          <p className="text-xs text-slate-500 mt-2">
                            Completed by: {item.source}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-400">
                    <Brain className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No overnight work completed yet.</p>
                    <p className="text-sm mt-1">
                      Delegate tasks to Chief of Staff during Evening Review for
                      overnight processing.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <Card className="bg-slate-900/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button
                variant="outline"
                onClick={() => setLocation("/daily-brief")}
                className="border-slate-600"
              >
                <Calendar className="h-4 w-4 mr-2" />
                View Schedule
              </Button>
              <Button
                variant="outline"
                onClick={() => setLocation("/workflow")}
                className="border-slate-600"
              >
                <Target className="h-4 w-4 mr-2" />
                Open Workflow
              </Button>
              <Button
                variant="outline"
                onClick={() => setLocation("/ai-experts")}
                className="border-slate-600"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                AI Experts
              </Button>
              <Button
                variant="outline"
                onClick={() => setLocation("/digital-twin")}
                className="border-slate-600"
              >
                <Brain className="h-4 w-4 mr-2" />
                Digital Twin
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </BrainLayout>
  );
}
