import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Brain, ArrowRight, ArrowLeft, Check, Mic, MicOff,
  Target, Users, MessageSquare, Zap, Shield, Clock,
  Lightbulb, TrendingUp, BarChart3, Briefcase
} from "lucide-react";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { toast } from "sonner";

// Learning session structure - designed to be engaging, not boring questionnaires
interface LearningQuestion {
  id: string;
  category: 'identity' | 'decision_making' | 'communication' | 'work_style' | 'values' | 'leadership';
  question: string;
  subtext?: string;
  type: 'choice' | 'scale' | 'scenario' | 'open';
  options?: { value: string; label: string; description?: string }[];
  scenario?: string;
  roleContext?: string; // "As a CSO, how would you..." 
  timeEstimate: number; // seconds
}

const LEARNING_SESSIONS = {
  initial: {
    title: "Getting to Know You",
    description: "A 30-minute session to understand how you think and work",
    estimatedTime: 30,
    questions: [
      // Demographic Baseline
      {
        id: "age_range",
        category: "identity" as const,
        question: "What age bracket are you in?",
        type: "choice" as const,
        options: [
          { value: "25-34", label: "25-34" },
          { value: "35-44", label: "35-44" },
          { value: "45-54", label: "45-54" },
          { value: "55-64", label: "55-64" },
          { value: "65+", label: "65+" },
        ],
        timeEstimate: 10,
      },
      {
        id: "background",
        category: "identity" as const,
        question: "What's your professional background?",
        type: "choice" as const,
        options: [
          { value: "finance", label: "Finance & Accounting", description: "Numbers, models, analysis" },
          { value: "consulting", label: "Consulting & Advisory", description: "Strategy, problem-solving" },
          { value: "operations", label: "Operations & Execution", description: "Getting things done" },
          { value: "sales", label: "Sales & Commercial", description: "Revenue, relationships" },
          { value: "technical", label: "Technical & Engineering", description: "Building, creating" },
          { value: "creative", label: "Creative & Marketing", description: "Brand, communication" },
        ],
        timeEstimate: 20,
      },
      {
        id: "strengths",
        category: "identity" as const,
        question: "What are you genuinely good at? Pick your top strength.",
        type: "choice" as const,
        options: [
          { value: "financial_modeling", label: "Financial Modelling", description: "Building models, forecasting" },
          { value: "strategic_thinking", label: "Strategic Thinking", description: "Seeing the big picture" },
          { value: "deal_making", label: "Deal Making", description: "Negotiations, closing" },
          { value: "people_leadership", label: "People Leadership", description: "Building and leading teams" },
          { value: "problem_solving", label: "Problem Solving", description: "Finding solutions" },
          { value: "execution", label: "Execution", description: "Making things happen" },
        ],
        timeEstimate: 20,
      },
      {
        id: "weaknesses",
        category: "identity" as const,
        question: "What's NOT your strength? Be honest - I need to know where to support you.",
        type: "choice" as const,
        options: [
          { value: "copywriting", label: "Copywriting", description: "Writing marketing content" },
          { value: "design", label: "Design & Visuals", description: "Making things look good" },
          { value: "technical", label: "Technical Implementation", description: "Coding, building" },
          { value: "admin", label: "Admin & Detail", description: "Paperwork, follow-up" },
          { value: "networking", label: "Networking", description: "Building new relationships" },
          { value: "patience", label: "Patience", description: "Waiting for results" },
        ],
        timeEstimate: 20,
      },
      // Decision Making - CSO/COO perspective
      {
        id: "decision_speed",
        category: "decision_making" as const,
        question: "When a critical decision lands on your desk, what's your natural instinct?",
        roleContext: "Think like a Chief Strategy Officer",
        type: "choice" as const,
        options: [
          { value: "fast", label: "Decide quickly", description: "Trust your gut, move fast, adjust later" },
          { value: "measured", label: "Take a moment", description: "Quick analysis, then commit" },
          { value: "deliberate", label: "Deep analysis", description: "Gather all data before deciding" },
        ],
        timeEstimate: 30,
      },
      {
        id: "risk_scenario",
        category: "decision_making" as const,
        question: "You have an opportunity that could 3x revenue but has a 40% chance of failing. What do you do?",
        roleContext: "Think like a CEO evaluating risk",
        type: "choice" as const,
        options: [
          { value: "go_all_in", label: "Go all in", description: "High risk, high reward" },
          { value: "hedge", label: "Hedge the bet", description: "Partial commitment, limit downside" },
          { value: "pass", label: "Pass", description: "Too risky, wait for better odds" },
          { value: "more_info", label: "Need more data", description: "Can't decide without more analysis" },
        ],
        timeEstimate: 45,
      },
      // Communication Style
      {
        id: "communication_preference",
        category: "communication" as const,
        question: "How do you prefer to receive information?",
        type: "choice" as const,
        options: [
          { value: "direct", label: "Direct and brief", description: "Bottom line up front, no fluff" },
          { value: "structured", label: "Structured with context", description: "Background, analysis, recommendation" },
          { value: "conversational", label: "Conversational", description: "Discussion-based, back and forth" },
          { value: "visual", label: "Visual and data-driven", description: "Charts, dashboards, metrics" },
        ],
        timeEstimate: 30,
      },
      {
        id: "bad_news_delivery",
        category: "communication" as const,
        question: "A project is going to miss its deadline by 2 weeks. How should this be communicated to you?",
        roleContext: "As a COO receiving updates",
        type: "choice" as const,
        options: [
          { value: "immediate_direct", label: "Immediately, directly", description: "Tell me now, no sugar coating" },
          { value: "with_solutions", label: "With solutions ready", description: "Problem + proposed fixes" },
          { value: "full_context", label: "Full context first", description: "Why it happened, what we learned" },
          { value: "written_first", label: "Written summary first", description: "Let me digest before discussing" },
        ],
        timeEstimate: 45,
      },
      // Work Style
      {
        id: "delegation_style",
        category: "work_style" as const,
        question: "When you delegate a task, how do you prefer to stay involved?",
        type: "choice" as const,
        options: [
          { value: "hands_on", label: "Hands-on", description: "Regular check-ins, involved in details" },
          { value: "trust_verify", label: "Trust but verify", description: "Set expectations, check milestones" },
          { value: "full_autonomy", label: "Full autonomy", description: "Delegate and step back completely" },
        ],
        timeEstimate: 30,
      },
      {
        id: "morning_priority",
        category: "work_style" as const,
        question: "It's 7am. What's the first thing you want to know?",
        type: "choice" as const,
        options: [
          { value: "fires", label: "Any fires to put out?", description: "Urgent issues that need attention" },
          { value: "priorities", label: "What are my top 3 priorities?", description: "Focus areas for the day" },
          { value: "calendar", label: "What's on my calendar?", description: "Meetings and commitments" },
          { value: "metrics", label: "How are the numbers?", description: "Key metrics and performance" },
        ],
        timeEstimate: 30,
      },
      // Leadership & Values
      {
        id: "team_conflict",
        category: "leadership" as const,
        question: "Two senior team members have a fundamental disagreement on strategy. What's your approach?",
        roleContext: "As a leader resolving conflict",
        type: "choice" as const,
        options: [
          { value: "decide", label: "Make the call", description: "Listen to both, then decide" },
          { value: "facilitate", label: "Facilitate resolution", description: "Help them find common ground" },
          { value: "data", label: "Let data decide", description: "Test both approaches, measure results" },
          { value: "delegate", label: "Delegate the decision", description: "Empower them to figure it out" },
        ],
        timeEstimate: 45,
      },
      {
        id: "core_value",
        category: "values" as const,
        question: "If you could only optimize for one thing in your business, what would it be?",
        type: "choice" as const,
        options: [
          { value: "speed", label: "Speed", description: "Move fast, iterate quickly" },
          { value: "quality", label: "Quality", description: "Excellence in everything" },
          { value: "efficiency", label: "Efficiency", description: "Maximum output, minimum waste" },
          { value: "innovation", label: "Innovation", description: "Always pushing boundaries" },
          { value: "people", label: "People", description: "Team and culture first" },
        ],
        timeEstimate: 30,
      },
      // Scenario-based learning
      {
        id: "scenario_investor",
        category: "decision_making" as const,
        question: "An investor offers £5M but wants 30% equity and a board seat. Your current runway is 8 months. What's your thinking?",
        roleContext: "Walk me through your decision process",
        type: "open" as const,
        subtext: "Speak or type your thought process - I want to understand HOW you think, not just what you decide",
        timeEstimate: 120,
      },
      {
        id: "scenario_crisis",
        category: "leadership" as const,
        question: "Your biggest client (40% of revenue) just called - they're considering leaving. You have 24 hours. What do you do first?",
        roleContext: "Think through your immediate actions",
        type: "open" as const,
        subtext: "I'm learning your crisis response pattern",
        timeEstimate: 90,
      },
    ],
  },
  daily: {
    title: "Daily Check-in",
    description: "15 minutes to keep learning and improving",
    estimatedTime: 15,
    questions: [
      {
        id: "daily_focus",
        category: "work_style" as const,
        question: "What's the one thing that would make today a success?",
        type: "open" as const,
        timeEstimate: 60,
      },
      {
        id: "daily_energy",
        category: "identity" as const,
        question: "Where's your energy level right now?",
        type: "scale" as const,
        options: Array.from({ length: 10 }, (_, i) => ({ 
          value: String(i + 1), 
          label: String(i + 1) 
        })),
        timeEstimate: 15,
      },
    ],
  },
};

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  identity: Brain,
  decision_making: Target,
  communication: MessageSquare,
  work_style: Briefcase,
  values: Shield,
  leadership: Users,
};

const CATEGORY_COLORS: Record<string, string> = {
  identity: "text-purple-400",
  decision_making: "text-pink-400",
  communication: "text-blue-400",
  work_style: "text-green-400",
  values: "text-yellow-400",
  leadership: "text-orange-400",
};

export default function DigitalTwinOnboarding() {
  const [sessionType] = useState<'initial' | 'daily'>('initial');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isComplete, setIsComplete] = useState(false);
  const [openAnswer, setOpenAnswer] = useState("");
  
  const { isListening, transcript, startListening, stopListening, resetTranscript } = useVoiceInput();
  
  const session = LEARNING_SESSIONS[sessionType];
  const questions = session.questions;
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const CategoryIcon = CATEGORY_ICONS[currentQuestion?.category] || Brain;
  
  // Handle voice input
  useEffect(() => {
    if (transcript && currentQuestion?.type === 'open') {
      setOpenAnswer(prev => prev + ' ' + transcript);
    }
  }, [transcript, currentQuestion?.type]);

  const handleAnswer = (value: string) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: value }));
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setOpenAnswer("");
      resetTranscript();
    } else {
      handleComplete();
    }
  };

  const handleOpenSubmit = () => {
    if (openAnswer.trim()) {
      handleAnswer(openAnswer.trim());
    }
  };

  const handleComplete = () => {
    setIsComplete(true);
    // TODO: Save answers to Digital Twin profile via API
    toast.success("Session complete! Your Digital Twin is learning...");
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setOpenAnswer(answers[questions[currentQuestionIndex - 1]?.id] || "");
    }
  };

  if (isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-slate-900/50 border-pink-500/20 backdrop-blur">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 rounded-full bg-pink-500/20 flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-pink-400" />
              </div>
              <h2 className="text-2xl font-light text-white mb-4">Session Complete</h2>
              <p className="text-slate-400 mb-8">
                Your Digital Twin has captured {Object.keys(answers).length} insights about how you think and work.
                It will continue learning from every interaction.
              </p>
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="p-4 bg-slate-800/50 rounded-lg">
                  <div className="text-2xl font-light text-pink-400">{Object.keys(answers).length}</div>
                  <div className="text-xs text-slate-500">Insights Captured</div>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-lg">
                  <div className="text-2xl font-light text-pink-400">30%</div>
                  <div className="text-xs text-slate-500">Profile Complete</div>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-lg">
                  <div className="text-2xl font-light text-pink-400">L1</div>
                  <div className="text-xs text-slate-500">Autonomy Level</div>
                </div>
              </div>
              <Button 
                onClick={() => window.location.href = '/digital-twin'}
                className="bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border border-pink-500/30"
              >
                Continue to Chief of Staff
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Brain className="w-6 h-6 text-pink-400" />
            <h1 className="text-xl font-light text-white">{session.title}</h1>
          </div>
          <p className="text-slate-400 text-sm">{session.description}</p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-slate-500 mb-2">
            <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="h-1 bg-slate-800" />
        </div>

        {/* Question Card */}
        <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur mb-6">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-lg bg-slate-800/50 ${CATEGORY_COLORS[currentQuestion.category]}`}>
                <CategoryIcon className="w-5 h-5" />
              </div>
              <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">
                {currentQuestion.category.replace('_', ' ')}
              </Badge>
              {(currentQuestion as any).roleContext && (
                <Badge variant="outline" className="text-xs border-pink-500/30 text-pink-400">
                  {(currentQuestion as any).roleContext}
                </Badge>
              )}
            </div>
            <CardTitle className="text-xl font-light text-white leading-relaxed">
              {currentQuestion.question}
            </CardTitle>
            {(currentQuestion as any).subtext && (
              <p className="text-sm text-slate-400 mt-2">{(currentQuestion as any).subtext}</p>
            )}
          </CardHeader>
          <CardContent>
            {/* Choice Questions */}
            {currentQuestion.type === 'choice' && currentQuestion.options && (
              <div className="space-y-3">
                {currentQuestion.options.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleAnswer(option.value)}
                    className={`w-full p-4 rounded-lg border text-left transition-all duration-300
                      ${answers[currentQuestion.id] === option.value
                        ? 'bg-pink-500/20 border-pink-500/50 text-white'
                        : 'bg-slate-800/30 border-slate-700/50 text-slate-300 hover:bg-slate-800/50 hover:border-slate-600'
                      }`}
                  >
                    <div className="font-medium">{option.label}</div>
                    {(option as any).description && (
                      <div className="text-sm text-slate-400 mt-1">{(option as any).description}</div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Scale Questions */}
            {currentQuestion.type === 'scale' && currentQuestion.options && (
              <div className="flex justify-between gap-2">
                {currentQuestion.options.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleAnswer(option.value)}
                    className={`flex-1 py-4 rounded-lg border transition-all duration-300
                      ${answers[currentQuestion.id] === option.value
                        ? 'bg-pink-500/20 border-pink-500/50 text-white'
                        : 'bg-slate-800/30 border-slate-700/50 text-slate-300 hover:bg-slate-800/50'
                      }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}

            {/* Open Questions */}
            {currentQuestion.type === 'open' && (
              <div className="space-y-4">
                <Textarea
                  value={openAnswer}
                  onChange={(e) => setOpenAnswer(e.target.value)}
                  placeholder="Speak or type your response..."
                  className="min-h-[150px] bg-slate-800/30 border-slate-700/50 text-white placeholder:text-slate-500 resize-none"
                />
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={isListening ? stopListening : startListening}
                    className={`${isListening ? 'bg-pink-500/20 border-pink-500/50 text-pink-300' : 'border-slate-600 text-slate-400'}`}
                  >
                    {isListening ? <MicOff className="w-4 h-4 mr-2" /> : <Mic className="w-4 h-4 mr-2" />}
                    {isListening ? 'Stop Recording' : 'Voice Input'}
                  </Button>
                  <Button
                    onClick={handleOpenSubmit}
                    disabled={!openAnswer.trim()}
                    className="bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border border-pink-500/30"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="ghost"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Clock className="w-4 h-4" />
            ~{Math.ceil(currentQuestion.timeEstimate / 60)} min
          </div>
        </div>
      </div>
    </div>
  );
}
