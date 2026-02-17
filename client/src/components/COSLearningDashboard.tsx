/**
 * COS Learning Dashboard
 * 
 * Visualizes what the Chief of Staff has learned about the user,
 * including preferences, patterns, and training progress.
 */

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Brain,
  Sparkles,
  TrendingUp,
  Clock,
  MessageSquare,
  Target,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  BookOpen,
  Settings,
  RefreshCw,
  ChevronRight,
  User,
  Calendar,
  Zap
} from "lucide-react";

// =============================================================================
// TYPES
// =============================================================================

interface TrainingProgress {
  level: "novice" | "learning" | "proficient" | "expert" | "master";
  totalInteractions: number;
  correctPredictions: number;
  userCorrections: number;
  overallConfidence: number;
  milestones: {
    communicationStyleLearned: boolean;
    priorityPatternsLearned: boolean;
    workingHoursLearned: boolean;
    decisionPatternsLearned: boolean;
  };
}

interface LearnedLesson {
  id: string;
  type: "preference" | "correction" | "pattern" | "exception" | "context_rule" | "communication_style";
  title: string;
  description: string;
  category: string;
  confidence: number;
  timesApplied: number;
  lastApplied?: string;
}

interface UserPreference {
  category: string;
  preference: string;
  value: string;
  confidence: number;
  source: string;
}

interface Pattern {
  id: string;
  type: "time_based" | "context_based" | "content_based" | "decision_based" | "communication_based";
  name: string;
  description: string;
  confidence: number;
  occurrences: number;
}

// =============================================================================
// MOCK DATA (Replace with actual tRPC calls)
// =============================================================================

const mockTrainingProgress: TrainingProgress = {
  level: "learning",
  totalInteractions: 47,
  correctPredictions: 38,
  userCorrections: 5,
  overallConfidence: 72,
  milestones: {
    communicationStyleLearned: true,
    priorityPatternsLearned: false,
    workingHoursLearned: true,
    decisionPatternsLearned: false
  }
};

const mockLessons: LearnedLesson[] = [
  {
    id: "1",
    type: "preference",
    title: "Prefers direct, concise communication",
    description: "User responds better to bullet points and short paragraphs rather than lengthy explanations",
    category: "communication",
    confidence: 85,
    timesApplied: 12,
    lastApplied: "2 hours ago"
  },
  {
    id: "2",
    type: "correction",
    title: "Don't use personalized greetings",
    description: "User corrected the use of 'Good morning, John' - prefers neutral greetings",
    category: "communication",
    confidence: 95,
    timesApplied: 8,
    lastApplied: "1 day ago"
  },
  {
    id: "3",
    type: "pattern",
    title: "Morning focus time preference",
    description: "User prefers deep work in the morning, meetings in the afternoon",
    category: "scheduling",
    confidence: 78,
    timesApplied: 5,
    lastApplied: "3 hours ago"
  },
  {
    id: "4",
    type: "context_rule",
    title: "Urgent items need immediate attention",
    description: "When something is marked urgent, user expects it to be surfaced immediately",
    category: "priorities",
    confidence: 90,
    timesApplied: 15,
    lastApplied: "30 minutes ago"
  }
];

const mockPreferences: UserPreference[] = [
  { category: "Communication", preference: "Tone", value: "Professional but warm", confidence: 85, source: "12 interactions" },
  { category: "Communication", preference: "Length", value: "Concise", confidence: 90, source: "Explicit feedback" },
  { category: "Communication", preference: "Format", value: "Mixed (bullets + paragraphs)", confidence: 75, source: "8 interactions" },
  { category: "Working Style", preference: "Peak Hours", value: "9 AM - 12 PM", confidence: 82, source: "Activity patterns" },
  { category: "Working Style", preference: "Meeting Preference", value: "Afternoon", confidence: 70, source: "5 observations" },
  { category: "Decisions", preference: "Risk Tolerance", value: "Moderate", confidence: 65, source: "3 decisions" },
  { category: "Decisions", preference: "Speed", value: "Balanced", confidence: 60, source: "Pattern analysis" },
  { category: "Content", preference: "Report Detail", value: "Executive summary", confidence: 88, source: "Explicit preference" },
];

const mockPatterns: Pattern[] = [
  { id: "1", type: "time_based", name: "Morning Review Routine", description: "User checks Morning Signal between 8:30-9:00 AM", confidence: 85, occurrences: 12 },
  { id: "2", type: "context_based", name: "Project Focus Periods", description: "Deep focus on single project for 2-3 hour blocks", confidence: 72, occurrences: 8 },
  { id: "3", type: "communication_based", name: "Quick Acknowledgments", description: "Prefers brief confirmations over detailed explanations", confidence: 88, occurrences: 15 },
  { id: "4", type: "decision_based", name: "Data-Driven Decisions", description: "Requests supporting data before major decisions", confidence: 78, occurrences: 6 },
];

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

const getLevelColor = (level: TrainingProgress["level"]) => {
  switch (level) {
    case "master": return "text-purple-400 bg-purple-500/20 border-purple-500/30";
    case "expert": return "text-blue-400 bg-blue-500/20 border-blue-500/30";
    case "proficient": return "text-green-400 bg-green-500/20 border-green-500/30";
    case "learning": return "text-amber-400 bg-amber-500/20 border-amber-500/30";
    default: return "text-gray-400 bg-gray-500/20 border-gray-500/30";
  }
};

const getLessonTypeIcon = (type: LearnedLesson["type"]) => {
  switch (type) {
    case "preference": return <Settings className="h-4 w-4 text-blue-400" />;
    case "correction": return <AlertCircle className="h-4 w-4 text-amber-400" />;
    case "pattern": return <TrendingUp className="h-4 w-4 text-green-400" />;
    case "exception": return <Zap className="h-4 w-4 text-purple-400" />;
    case "context_rule": return <Target className="h-4 w-4 text-cyan-400" />;
    case "communication_style": return <MessageSquare className="h-4 w-4 text-pink-400" />;
  }
};

const getPatternTypeIcon = (type: Pattern["type"]) => {
  switch (type) {
    case "time_based": return <Clock className="h-4 w-4 text-amber-400" />;
    case "context_based": return <Target className="h-4 w-4 text-blue-400" />;
    case "content_based": return <BookOpen className="h-4 w-4 text-green-400" />;
    case "decision_based": return <Lightbulb className="h-4 w-4 text-purple-400" />;
    case "communication_based": return <MessageSquare className="h-4 w-4 text-pink-400" />;
  }
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function COSLearningDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const progress = mockTrainingProgress;

  const accuracyRate = progress.totalInteractions > 0 
    ? Math.round((progress.correctPredictions / progress.totalInteractions) * 100) 
    : 0;

  const milestonesCompleted = Object.values(progress.milestones).filter(Boolean).length;
  const totalMilestones = Object.keys(progress.milestones).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-[#E91E8C]/20 to-purple-500/20 border border-[#E91E8C]/30">
            <Brain className="h-6 w-6 text-[#E91E8C]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">What COS Has Learned</h2>
            <p className="text-sm text-muted-foreground">Training progress and personalization insights</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="border-[#E91E8C]/30 text-[#E91E8C]">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Analysis
        </Button>
      </div>

      {/* Training Level Card */}
      <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className={`px-4 py-2 rounded-lg border ${getLevelColor(progress.level)}`}>
                <span className="text-lg font-bold capitalize">{progress.level}</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Training Level</p>
                <p className="text-2xl font-bold text-white">{progress.overallConfidence}% Confidence</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">{progress.totalInteractions} interactions</p>
              <p className="text-sm text-green-400">{accuracyRate}% accuracy</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress to next level</span>
              <span className="text-white">{progress.overallConfidence}%</span>
            </div>
            <Progress value={progress.overallConfidence} className="h-2" />
          </div>

          {/* Milestones */}
          <div className="mt-4 pt-4 border-t border-gray-700">
            <p className="text-sm text-muted-foreground mb-3">Learning Milestones ({milestonesCompleted}/{totalMilestones})</p>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(progress.milestones).map(([key, achieved]) => (
                <div key={key} className={`flex items-center gap-2 p-2 rounded-lg ${achieved ? 'bg-green-500/10' : 'bg-gray-800'}`}>
                  {achieved ? (
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                  ) : (
                    <Clock className="h-4 w-4 text-gray-500" />
                  )}
                  <span className={`text-xs ${achieved ? 'text-green-400' : 'text-gray-500'}`}>
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-900/50 border border-gray-800">
          <TabsTrigger value="overview" className="data-[state=active]:bg-gray-800">
            <Sparkles className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="lessons" className="data-[state=active]:bg-gray-800">
            <BookOpen className="h-4 w-4 mr-2" />
            Lessons ({mockLessons.length})
          </TabsTrigger>
          <TabsTrigger value="preferences" className="data-[state=active]:bg-gray-800">
            <User className="h-4 w-4 mr-2" />
            Preferences
          </TabsTrigger>
          <TabsTrigger value="patterns" className="data-[state=active]:bg-gray-800">
            <TrendingUp className="h-4 w-4 mr-2" />
            Patterns
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Recent Lessons */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white text-base flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-amber-400" />
                  Recent Lessons
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockLessons.slice(0, 3).map(lesson => (
                    <div key={lesson.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-800/50">
                      {getLessonTypeIcon(lesson.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-medium truncate">{lesson.title}</p>
                        <p className="text-xs text-muted-foreground">{lesson.confidence}% confidence</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Preferences */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white text-base flex items-center gap-2">
                  <Settings className="h-4 w-4 text-blue-400" />
                  Key Preferences
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockPreferences.slice(0, 4).map((pref, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50">
                      <div>
                        <p className="text-sm text-white">{pref.preference}</p>
                        <p className="text-xs text-muted-foreground">{pref.category}</p>
                      </div>
                      <Badge variant="outline" className="text-cyan-400 border-cyan-500/30">
                        {pref.value}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Lessons Tab */}
        <TabsContent value="lessons" className="mt-4">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Learned Lessons</CardTitle>
              <CardDescription>Specific insights COS has learned from interactions</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {mockLessons.map(lesson => (
                    <div key={lesson.id} className="p-4 rounded-lg bg-gray-800/50 border border-gray-700 hover:border-gray-600 transition-colors">
                      <div className="flex items-start gap-3">
                        {getLessonTypeIcon(lesson.type)}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="text-sm font-medium text-white">{lesson.title}</h4>
                            <Badge variant="outline" className="text-xs">
                              {lesson.confidence}% confidence
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{lesson.description}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Category: {lesson.category}</span>
                            <span>Applied {lesson.timesApplied}x</span>
                            {lesson.lastApplied && <span>Last: {lesson.lastApplied}</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="mt-4">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Preference Profile</CardTitle>
              <CardDescription>Your working style and communication preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {["Communication", "Working Style", "Decisions", "Content"].map(category => (
                  <div key={category}>
                    <h4 className="text-sm font-medium text-white mb-3">{category}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {mockPreferences.filter(p => p.category === category).map((pref, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-muted-foreground">{pref.preference}</span>
                            <span className="text-xs text-muted-foreground">{pref.confidence}%</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-white font-medium">{pref.value}</span>
                            <span className="text-xs text-muted-foreground">{pref.source}</span>
                          </div>
                          <Progress value={pref.confidence} className="h-1 mt-2" />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Patterns Tab */}
        <TabsContent value="patterns" className="mt-4">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Identified Patterns</CardTitle>
              <CardDescription>Behavioral patterns detected from your interactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockPatterns.map(pattern => (
                  <div key={pattern.id} className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
                    <div className="flex items-start gap-3">
                      {getPatternTypeIcon(pattern.type)}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-medium text-white">{pattern.name}</h4>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs capitalize">
                              {pattern.type.replace("_", " ")}
                            </Badge>
                            <Badge variant="outline" className="text-xs text-green-400 border-green-500/30">
                              {pattern.confidence}%
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{pattern.description}</p>
                        <p className="text-xs text-muted-foreground mt-2">Observed {pattern.occurrences} times</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default COSLearningDashboard;
