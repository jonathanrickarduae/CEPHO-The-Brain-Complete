import { useState } from "react";
import { 
  Moon, Sun, TrendingUp, TrendingDown, MessageSquare, 
  Mic, MicOff, Send, CheckCircle2, XCircle, Clock,
  Sparkles, Brain, Zap, Heart, Coffee, Users,
  ChevronRight, Fingerprint, Target, Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
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

// Day's accomplishments
const ACCOMPLISHMENTS = [
  { id: 1, text: "Closed the Henderson deal", impact: "high", category: "Sales" },
  { id: 2, text: "AI Expert team completed market research", impact: "high", category: "Research" },
  { id: 3, text: "Chief of Staff drafted 5 email responses", impact: "medium", category: "Communication" },
  { id: 4, text: "Reviewed and approved Q2 budget", impact: "high", category: "Finance" },
];

// Day's challenges
const CHALLENGES = [
  { id: 1, text: "11 AM meeting ran over, disrupted schedule", suggestion: "Block 30-min buffer after important meetings" },
  { id: 2, text: "Too many context switches between projects", suggestion: "Batch similar tasks together tomorrow" },
  { id: 3, text: "Energy dip after lunch", suggestion: "Schedule lighter tasks for 1-2 PM slot" },
];

// Chief of Staff suggestions for tomorrow
const TWIN_SUGGESTIONS = [
  { id: 1, text: "Move your 9 AM call to 10 AM - you perform better with a slower morning start", confidence: 89 },
  { id: 2, text: "Block 2-3 PM for deep work - your energy typically recovers by then", confidence: 92 },
  { id: 3, text: "Reduce meetings by 20% tomorrow - today's back-to-back calls drained you", confidence: 85 },
];

export default function EveningReview() {
  const [currentMood, setCurrentMood] = useState([6]);
  const [isRecording, setIsRecording] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [overnightTasks, setOvernightTasks] = useState("");
  const [acceptedSuggestions, setAcceptedSuggestions] = useState<number[]>([]);

  const averageMood = Math.round(EMOTION_TIMELINE.reduce((acc, e) => acc + e.score, 0) / EMOTION_TIMELINE.length * 10) / 10;
  const lowestPoint = EMOTION_TIMELINE.reduce((min, e) => e.score < min.score ? e : min, EMOTION_TIMELINE[0]);
  const highestPoint = EMOTION_TIMELINE.reduce((max, e) => e.score > max.score ? e : max, EMOTION_TIMELINE[0]);

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      toast.info("Recording your feedback...");
    } else {
      toast.success("Voice note captured");
      setFeedback(prev => prev + " [Voice note: Feeling tired but accomplished. Need more breaks tomorrow.]");
    }
  };

  const acceptSuggestion = (id: number) => {
    setAcceptedSuggestions(prev => [...prev, id]);
    toast.success("Suggestion accepted - Chief of Staff will implement tomorrow");
  };

  const submitReview = () => {
    toast.success("Evening review submitted! Chief of Staff is processing overnight tasks.");
  };

  return (
    <div className="h-full bg-background text-foreground overflow-auto">
      {/* Header */}
      <div className="border-b border-border bg-gradient-to-r from-indigo-500/10 to-purple-500/10 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30">
                <Moon className="w-6 h-6 md:w-8 md:h-8 text-indigo-400" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-display font-bold">Evening Review</h1>
                <p className="text-muted-foreground text-sm">Daily wash-up • {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge className="bg-indigo-500/20 text-indigo-400 border-0">
                <Clock className="w-3 h-3 mr-1" /> 6:00 PM Review
              </Badge>
              <div className="text-right hidden md:block">
                <div className="text-sm text-muted-foreground">Today's Average</div>
                <div className="text-2xl font-bold text-indigo-400">{averageMood}/10</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Emotion Timeline & Review */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Emotion Timeline */}
            <Card className="bg-card/60 border-border overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-pink-400" />
                  Today's Emotion Journey
                </CardTitle>
              </CardHeader>
              <CardContent>
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
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <span className="text-xs text-muted-foreground">Peak</span>
                    </div>
                    <div className="font-bold text-green-400">{highestPoint.score}/10 at {highestPoint.time}</div>
                    <p className="text-xs text-muted-foreground">{highestPoint.event}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingDown className="w-4 h-4 text-red-500" />
                      <span className="text-xs text-muted-foreground">Low Point</span>
                    </div>
                    <div className="font-bold text-red-400">{lowestPoint.score}/10 at {lowestPoint.time}</div>
                    <p className="text-xs text-muted-foreground">{lowestPoint.event}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* What Went Well / What Didn't */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-green-500/5 border-green-500/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    What Went Well
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {ACCOMPLISHMENTS.map((item) => (
                      <div key={item.id} className="p-2 rounded-lg bg-green-500/10 border border-green-500/20">
                        <div className="flex items-start justify-between">
                          <p className="text-sm">{item.text}</p>
                          <Badge variant="outline" className="text-xs shrink-0 ml-2">{item.category}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-amber-500/5 border-amber-500/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-amber-500" />
                    Challenges & Learnings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {CHALLENGES.map((item) => (
                      <div key={item.id} className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                        <p className="text-sm mb-1">{item.text}</p>
                        <p className="text-xs text-amber-400">💡 {item.suggestion}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Feedback to Chief of Staff */}
            <Card className="bg-card/60 border-border">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Fingerprint className="w-5 h-5 text-purple-400" />
                  Feedback to Chief of Staff
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Share your thoughts on today... What worked? What didn't? Any patterns you noticed?"
                  className="min-h-24 mb-3 bg-secondary/30"
                />
                <div className="flex items-center gap-2">
                  <Button
                    variant={isRecording ? "destructive" : "outline"}
                    size="sm"
                    onClick={toggleRecording}
                    className={isRecording ? "animate-pulse" : ""}
                  >
                    {isRecording ? <MicOff className="w-4 h-4 mr-2" /> : <Mic className="w-4 h-4 mr-2" />}
                    {isRecording ? "Stop Recording" : "Voice Note"}
                  </Button>
                  <span className="text-xs text-muted-foreground">or type your feedback above</span>
                </div>
              </CardContent>
            </Card>

            {/* Overnight Tasks */}
            <Card className="bg-card/60 border-border">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Moon className="w-5 h-5 text-indigo-400" />
                  Overnight Priorities
                  <Badge className="ml-2 bg-indigo-500/20 text-indigo-400 border-0">AI will work on these</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={overnightTasks}
                  onChange={(e) => setOvernightTasks(e.target.value)}
                  placeholder="What should the AI work on overnight? Research topics, prep for tomorrow, draft documents..."
                  className="min-h-20 mb-3 bg-secondary/30"
                />
                <p className="text-xs text-muted-foreground">
                  Your Chief of Staff and AI Expert team will process these while you rest. Results ready in tomorrow's Daily Brief.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Suggestions & Current State */}
          <div className="space-y-6">
            
            {/* Current Mood Check */}
            <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/30">
              <CardContent className="p-4">
                <div className="text-center mb-4">
                  <p className="text-sm text-muted-foreground mb-2">How are you feeling now?</p>
                  <div className="text-4xl font-bold text-indigo-400">{currentMood[0]}/10</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg">😔</span>
                  <Slider
                    value={currentMood}
                    onValueChange={setCurrentMood}
                    max={10}
                    min={1}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-lg">🔥</span>
                </div>
              </CardContent>
            </Card>

            {/* Chief of Staff Suggestions */}
            <Card className="bg-card/60 border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  Chief of Staff Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {TWIN_SUGGESTIONS.map((suggestion) => (
                    <div 
                      key={suggestion.id}
                      className={`p-3 rounded-xl border transition-all ${
                        acceptedSuggestions.includes(suggestion.id)
                          ? "bg-green-500/10 border-green-500/30"
                          : "bg-purple-500/5 border-purple-500/20"
                      }`}
                    >
                      <p className="text-sm mb-2">{suggestion.text}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {suggestion.confidence}% confidence
                        </Badge>
                        {acceptedSuggestions.includes(suggestion.id) ? (
                          <span className="text-xs text-green-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Accepted
                          </span>
                        ) : (
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-7 text-xs"
                            onClick={() => acceptSuggestion(suggestion.id)}
                          >
                            Accept
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tomorrow Preview */}
            <Card className="bg-card/60 border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Sun className="w-4 h-4 text-amber-400" />
                  Tomorrow's Goal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4">
                  <Target className="w-12 h-12 mx-auto mb-3 text-amber-400" />
                  <p className="text-2xl font-bold mb-1">Wake up at a 10</p>
                  <p className="text-sm text-muted-foreground">
                    Based on today's patterns, your Chief of Staff is optimizing tomorrow's schedule for peak performance.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <Button 
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
              size="lg"
              onClick={submitReview}
            >
              <Moon className="w-4 h-4 mr-2" />
              Complete Evening Review
            </Button>
            
            <p className="text-xs text-center text-muted-foreground">
              Your Chief of Staff will process everything overnight and have your Daily Brief ready by 7 AM.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
