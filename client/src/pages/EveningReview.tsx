import { useState } from "react";
import { 
  Moon, Sun, TrendingUp, TrendingDown, 
  Mic, MicOff, Send, CheckCircle2, XCircle, Clock,
  Sparkles, Target, Plus, ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

// Mock emotion data throughout the day
const EMOTION_TIMELINE = [
  { time: "7:00 AM", score: 8, label: "Morning energy", event: "Started day" },
  { time: "9:00 AM", score: 7, label: "Focused", event: "Deep work session" },
  { time: "11:00 AM", score: 5, label: "Stressed", event: "Difficult meeting" },
  { time: "1:00 PM", score: 6, label: "Recovering", event: "Lunch break" },
  { time: "3:00 PM", score: 4, label: "Drained", event: "Back-to-back calls" },
  { time: "5:00 PM", score: 6, label: "Winding down", event: "Wrapping up" },
];

// Chief of Staff suggestions for tomorrow
const TWIN_SUGGESTIONS = [
  { id: 1, text: "Move your 9 AM call to 10 AM - you perform better with a slower morning start", confidence: 89 },
  { id: 2, text: "Block 2-3 PM for deep work - your energy typically recovers by then", confidence: 92 },
  { id: 3, text: "Reduce meetings by 20% tomorrow - today's back-to-back calls drained you", confidence: 85 },
];

export default function EveningReview() {
  const [currentMood, setCurrentMood] = useState([6]);
  const [isRecordingWentWell, setIsRecordingWentWell] = useState(false);
  const [isRecordingDidntGo, setIsRecordingDidntGo] = useState(false);
  const [wentWellText, setWentWellText] = useState("");
  const [didntGoText, setDidntGoText] = useState("");
  const [actionsForTomorrow, setActionsForTomorrow] = useState<string[]>([]);
  const [newAction, setNewAction] = useState("");
  const [acceptedSuggestions, setAcceptedSuggestions] = useState<number[]>([]);

  const averageMood = Math.round(EMOTION_TIMELINE.reduce((acc, e) => acc + e.score, 0) / EMOTION_TIMELINE.length * 10) / 10;
  const lowestPoint = EMOTION_TIMELINE.reduce((min, e) => e.score < min.score ? e : min, EMOTION_TIMELINE[0]);
  const highestPoint = EMOTION_TIMELINE.reduce((max, e) => e.score > max.score ? e : max, EMOTION_TIMELINE[0]);

  const toggleRecordingWentWell = () => {
    setIsRecordingWentWell(!isRecordingWentWell);
    if (!isRecordingWentWell) {
      toast.info("Recording what went well...");
    } else {
      toast.success("Voice note captured");
      setWentWellText(prev => prev + (prev ? "\n" : "") + "[Voice note: Great progress on the Henderson deal, team collaboration was excellent.]");
    }
  };

  const toggleRecordingDidntGo = () => {
    setIsRecordingDidntGo(!isRecordingDidntGo);
    if (!isRecordingDidntGo) {
      toast.info("Recording what didn't go well...");
    } else {
      toast.success("Voice note captured");
      setDidntGoText(prev => prev + (prev ? "\n" : "") + "[Voice note: Too many meetings, need better time blocking.]");
    }
  };

  const addAction = () => {
    if (newAction.trim()) {
      setActionsForTomorrow(prev => [...prev, newAction.trim()]);
      setNewAction("");
      toast.success("Action added for tomorrow");
    }
  };

  const acceptSuggestion = (id: number) => {
    setAcceptedSuggestions(prev => [...prev, id]);
    const suggestion = TWIN_SUGGESTIONS.find(s => s.id === id);
    if (suggestion) {
      setActionsForTomorrow(prev => [...prev, suggestion.text]);
    }
    toast.success("Suggestion accepted - added to tomorrow's actions");
  };

  const submitReview = () => {
    toast.success("Evening review submitted! Chief of Staff is processing overnight tasks.");
  };

  // Format date in UK format
  const formatDate = () => {
    const now = new Date();
    return now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  return (
    <div className="h-full bg-background text-foreground overflow-auto">
      {/* Header */}
      <div className="border-b border-border bg-gradient-to-r from-indigo-500/10 to-purple-500/10 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30">
                <Moon className="w-6 h-6 md:w-8 md:h-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-display font-bold text-foreground">Evening Review</h1>
                <p className="text-muted-foreground text-sm">{formatDate()}</p>
              </div>
            </div>
            
            <Badge className="bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border-0">
              <Clock className="w-3 h-3 mr-1" /> Daily Wash-up
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 space-y-6">
        
        {/* Top Row: What Went Well & What Didn't */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* What Went Well */}
          <Card className="bg-green-50 dark:bg-green-500/10 border-green-300 dark:border-green-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-300">
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                What Went Well Today
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                value={wentWellText}
                onChange={(e) => setWentWellText(e.target.value)}
                placeholder="Type or record what went well today..."
                className="min-h-32 bg-white dark:bg-green-500/5 border-green-300 dark:border-green-500/20 text-foreground placeholder:text-muted-foreground"
              />
              <Button
                variant={isRecordingWentWell ? "destructive" : "outline"}
                size="sm"
                onClick={toggleRecordingWentWell}
                className={`w-full ${isRecordingWentWell ? "animate-pulse" : "border-green-400 dark:border-green-500/30 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-500/20"}`}
              >
                {isRecordingWentWell ? <MicOff className="w-4 h-4 mr-2" /> : <Mic className="w-4 h-4 mr-2" />}
                {isRecordingWentWell ? "Stop Recording" : "Record Voice Note"}
              </Button>
            </CardContent>
          </Card>

          {/* What Didn't Go Well */}
          <Card className="bg-amber-50 dark:bg-amber-500/10 border-amber-300 dark:border-amber-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
                <XCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                What Didn't Go Well
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                value={didntGoText}
                onChange={(e) => setDidntGoText(e.target.value)}
                placeholder="Type or record what could have been better..."
                className="min-h-32 bg-white dark:bg-amber-500/5 border-amber-300 dark:border-amber-500/20 text-foreground placeholder:text-muted-foreground"
              />
              <Button
                variant={isRecordingDidntGo ? "destructive" : "outline"}
                size="sm"
                onClick={toggleRecordingDidntGo}
                className={`w-full ${isRecordingDidntGo ? "animate-pulse" : "border-amber-400 dark:border-amber-500/30 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-500/20"}`}
              >
                {isRecordingDidntGo ? <MicOff className="w-4 h-4 mr-2" /> : <Mic className="w-4 h-4 mr-2" />}
                {isRecordingDidntGo ? "Stop Recording" : "Record Voice Note"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Mood Score */}
        <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-500/10 dark:to-purple-500/10 border-indigo-300 dark:border-indigo-500/30">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="text-center md:text-left">
                <p className="text-muted-foreground text-sm mb-1">How are you feeling right now?</p>
                <div className="text-5xl font-bold text-indigo-600 dark:text-indigo-300">{currentMood[0]}/10</div>
              </div>
              <div className="flex-1 w-full">
                <div className="flex items-center gap-4">
                  <span className="text-2xl">😔</span>
                  <Slider
                    value={currentMood}
                    onValueChange={setCurrentMood}
                    max={10}
                    min={1}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-2xl">🔥</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions for Tomorrow */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Target className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              Actions for Tomorrow
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add new action */}
            <div className="flex gap-2">
              <Textarea
                value={newAction}
                onChange={(e) => setNewAction(e.target.value)}
                placeholder="Add an action for tomorrow..."
                className="min-h-12 bg-secondary/30 text-foreground placeholder:text-muted-foreground"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    addAction();
                  }
                }}
              />
              <Button 
                onClick={addAction}
                className="bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-600 text-white shrink-0"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Action list */}
            {actionsForTomorrow.length > 0 && (
              <div className="space-y-2">
                {actionsForTomorrow.map((action, index) => (
                  <div key={index} className="p-3 rounded-lg bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-300 dark:border-cyan-500/20 flex items-start gap-3">
                    <ArrowRight className="w-4 h-4 text-cyan-600 dark:text-cyan-400 mt-0.5 shrink-0" />
                    <p className="text-foreground text-sm">{action}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Chief of Staff Suggestions */}
            <div className="pt-4 border-t border-border">
              <p className="text-muted-foreground text-sm mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                Chief of Staff Suggestions
              </p>
              <div className="space-y-2">
                {TWIN_SUGGESTIONS.map((suggestion) => (
                  <div 
                    key={suggestion.id}
                    className={`p-3 rounded-lg border transition-all ${
                      acceptedSuggestions.includes(suggestion.id)
                        ? "bg-green-50 dark:bg-green-500/10 border-green-300 dark:border-green-500/30"
                        : "bg-purple-50 dark:bg-purple-500/5 border-purple-200 dark:border-purple-500/20"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-foreground text-sm flex-1">{suggestion.text}</p>
                      {acceptedSuggestions.includes(suggestion.id) ? (
                        <span className="text-xs text-green-700 dark:text-green-400 flex items-center gap-1 shrink-0">
                          <CheckCircle2 className="w-3 h-3" /> Added
                        </span>
                      ) : (
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-7 text-xs text-purple-700 dark:text-purple-300 hover:text-purple-800 dark:hover:text-purple-200 hover:bg-purple-100 dark:hover:bg-purple-500/20 shrink-0"
                          onClick={() => acceptSuggestion(suggestion.id)}
                        >
                          Accept
                        </Button>
                      )}
                    </div>
                    <Badge variant="outline" className="text-xs mt-2 text-muted-foreground border-muted-foreground/30">
                      {suggestion.confidence}% confidence
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trend Chart (collapsed by default) */}
        <details className="group">
          <summary className="cursor-pointer list-none">
            <Card className="bg-card/40 border-border hover:bg-card/60 transition-colors">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-foreground">View Today's Mood Trend</span>
                </div>
                <span className="text-muted-foreground text-sm">Average: {averageMood}/10</span>
              </CardContent>
            </Card>
          </summary>
          <Card className="mt-2 bg-card border-border">
            <CardContent className="p-4">
              {/* Visual Timeline */}
              <div className="relative h-32 mb-4">
                <div className="absolute inset-0 flex items-end justify-between px-2">
                  {EMOTION_TIMELINE.map((point, i) => (
                    <div key={i} className="flex flex-col items-center gap-1 flex-1">
                      <div 
                        className={`w-full max-w-8 rounded-t-lg transition-all ${
                          point.score >= 7 ? "bg-green-500" :
                          point.score >= 5 ? "bg-amber-500" :
                          "bg-red-500"
                        }`}
                        style={{ height: `${point.score * 10}%` }}
                      />
                      <span className="text-xs text-muted-foreground">{point.time.split(' ')[0]}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Key Moments */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-xl bg-green-50 dark:bg-green-500/10 border border-green-300 dark:border-green-500/20">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-500" />
                    <span className="text-xs text-muted-foreground">Peak</span>
                  </div>
                  <div className="font-bold text-green-700 dark:text-green-400">{highestPoint.score}/10 at {highestPoint.time}</div>
                  <p className="text-xs text-muted-foreground">{highestPoint.event}</p>
                </div>
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-300 dark:border-red-500/20">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-500" />
                    <span className="text-xs text-muted-foreground">Low Point</span>
                  </div>
                  <div className="font-bold text-red-700 dark:text-red-400">{lowestPoint.score}/10 at {lowestPoint.time}</div>
                  <p className="text-xs text-muted-foreground">{lowestPoint.event}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </details>

        {/* Submit Button */}
        <div className="pt-4 pb-20 md:pb-4">
          <Button 
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-6"
            size="lg"
            onClick={submitReview}
          >
            <Send className="w-5 h-5 mr-2" />
            Submit Evening Review
          </Button>
          <p className="text-xs text-center text-muted-foreground mt-3">
            Your Chief of Staff will process everything overnight and have your Signal ready by 7 AM.
          </p>
        </div>
      </div>
    </div>
  );
}
