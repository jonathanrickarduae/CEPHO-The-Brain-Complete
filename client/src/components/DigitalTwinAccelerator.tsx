import { useState, useEffect, useCallback } from 'react';
import { 
  Brain, Sparkles, ChevronRight, ChevronLeft, Check, X,
  Upload, FileText, Mail, MessageSquare, Clock, Target,
  Mic, Volume2, Palette, User, Zap, Trophy, Play, Pause
} from 'lucide-react';
import { useCelebration } from './CelebrationAnimations';

// Training hour equivalents
const TRAINING_VALUES = {
  quickFireQuestion: 2, // 2 hours per question answered
  scenarioQuestion: 5, // 5 hours per scenario
  emailUpload: 0.5, // 0.5 hours per email
  documentUpload: 10, // 10 hours per document
  voiceSample: 20, // 20 hours per voice sample
  dailyCheckIn: 1, // 1 hour per daily check-in
  feedbackCorrection: 3, // 3 hours per correction
};

const TARGET_HOURS = 5000;

// Quick-fire questions for rapid training
const QUICK_FIRE_QUESTIONS = [
  // Communication Style
  { id: 'comm-1', category: 'communication', question: 'Do you prefer direct, concise communication?', type: 'yesno' },
  { id: 'comm-2', category: 'communication', question: 'Do you use emojis in professional messages?', type: 'yesno' },
  { id: 'comm-3', category: 'communication', question: 'Do you prefer bullet points over paragraphs?', type: 'yesno' },
  { id: 'comm-4', category: 'communication', question: 'Do you start emails with small talk?', type: 'yesno' },
  { id: 'comm-5', category: 'communication', question: 'Do you sign off emails formally?', type: 'yesno' },
  
  // Decision Making
  { id: 'dec-1', category: 'decisions', question: 'Do you prefer data over intuition for decisions?', type: 'yesno' },
  { id: 'dec-2', category: 'decisions', question: 'Do you consult others before major decisions?', type: 'yesno' },
  { id: 'dec-3', category: 'decisions', question: 'Do you prefer quick decisions over thorough analysis?', type: 'yesno' },
  { id: 'dec-4', category: 'decisions', question: 'Do you document your decision rationale?', type: 'yesno' },
  
  // Work Style
  { id: 'work-1', category: 'work', question: 'Do you prefer working in the morning?', type: 'yesno' },
  { id: 'work-2', category: 'work', question: 'Do you multitask frequently?', type: 'yesno' },
  { id: 'work-3', category: 'work', question: 'Do you prefer scheduled meetings over ad-hoc calls?', type: 'yesno' },
  { id: 'work-4', category: 'work', question: 'Do you take breaks every hour?', type: 'yesno' },
  { id: 'work-5', category: 'work', question: 'Do you work on weekends?', type: 'yesno' },
  
  // Priorities
  { id: 'pri-1', category: 'priorities', question: 'Is work-life balance your top priority?', type: 'yesno' },
  { id: 'pri-2', category: 'priorities', question: 'Do you prioritize family over career advancement?', type: 'yesno' },
  { id: 'pri-3', category: 'priorities', question: 'Is financial security more important than passion?', type: 'yesno' },
  { id: 'pri-4', category: 'priorities', question: 'Do you value recognition over compensation?', type: 'yesno' },
  
  // Personality
  { id: 'per-1', category: 'personality', question: 'Are you an introvert?', type: 'yesno' },
  { id: 'per-2', category: 'personality', question: 'Do you prefer planning over spontaneity?', type: 'yesno' },
  { id: 'per-3', category: 'personality', question: 'Are you risk-averse?', type: 'yesno' },
  { id: 'per-4', category: 'personality', question: 'Do you handle stress well?', type: 'yesno' },
  { id: 'per-5', category: 'personality', question: 'Are you competitive?', type: 'yesno' },
];

// Scenario questions for deeper understanding
const SCENARIO_QUESTIONS = [
  {
    id: 'scen-1',
    category: 'conflict',
    scenario: 'A team member misses a deadline that affects your project.',
    question: 'How would you respond?',
    options: [
      { id: 'a', text: 'Address it directly and privately', style: 'direct' },
      { id: 'b', text: 'Escalate to management immediately', style: 'formal' },
      { id: 'c', text: 'Help them catch up without mentioning it', style: 'supportive' },
      { id: 'd', text: 'Document it and discuss in next 1:1', style: 'measured' },
    ],
  },
  {
    id: 'scen-2',
    category: 'leadership',
    scenario: 'You need to deliver bad news to your team.',
    question: 'What\'s your approach?',
    options: [
      { id: 'a', text: 'Be direct and factual, no sugarcoating', style: 'direct' },
      { id: 'b', text: 'Frame it positively with silver linings', style: 'optimistic' },
      { id: 'c', text: 'Gather the team and discuss openly', style: 'collaborative' },
      { id: 'd', text: 'Send a detailed email with context', style: 'formal' },
    ],
  },
  {
    id: 'scen-3',
    category: 'innovation',
    scenario: 'You have an innovative idea that challenges the status quo.',
    question: 'How do you proceed?',
    options: [
      { id: 'a', text: 'Build a prototype first, then present', style: 'action' },
      { id: 'b', text: 'Get buy-in from stakeholders first', style: 'political' },
      { id: 'c', text: 'Present data and research to leadership', style: 'analytical' },
      { id: 'd', text: 'Start small and prove the concept', style: 'iterative' },
    ],
  },
  {
    id: 'scen-4',
    category: 'pressure',
    scenario: 'Multiple urgent tasks arrive simultaneously.',
    question: 'How do you prioritize?',
    options: [
      { id: 'a', text: 'Handle the quickest wins first', style: 'efficient' },
      { id: 'b', text: 'Focus on highest business impact', style: 'strategic' },
      { id: 'c', text: 'Delegate what you can, focus on critical', style: 'leadership' },
      { id: 'd', text: 'Work through them in order received', style: 'systematic' },
    ],
  },
  {
    id: 'scen-5',
    category: 'feedback',
    scenario: 'You receive critical feedback on your work.',
    question: 'What\'s your initial reaction?',
    options: [
      { id: 'a', text: 'Thank them and reflect on it', style: 'growth' },
      { id: 'b', text: 'Ask for specific examples', style: 'analytical' },
      { id: 'c', text: 'Defend your approach with reasoning', style: 'confident' },
      { id: 'd', text: 'Take time to process before responding', style: 'measured' },
    ],
  },
];

// Avatar options
const AVATAR_OPTIONS = [
  { id: 'professional', emoji: '👔', label: 'Professional' },
  { id: 'casual', emoji: '😊', label: 'Casual' },
  { id: 'creative', emoji: '🎨', label: 'Creative' },
  { id: 'tech', emoji: '💻', label: 'Tech' },
  { id: 'executive', emoji: '👑', label: 'Executive' },
  { id: 'friendly', emoji: '🤝', label: 'Friendly' },
];

// Voice tone options
const VOICE_OPTIONS = [
  { id: 'formal', label: 'Formal', description: 'Professional and structured' },
  { id: 'casual', label: 'Casual', description: 'Friendly and approachable' },
  { id: 'adaptive', label: 'Adaptive', description: 'Matches the context' },
  { id: 'concise', label: 'Concise', description: 'Brief and to the point' },
  { id: 'detailed', label: 'Detailed', description: 'Thorough explanations' },
];

interface TrainingProgress {
  totalHours: number;
  quickFireAnswered: number;
  scenariosCompleted: number;
  emailsUploaded: number;
  documentsUploaded: number;
  voiceSamples: number;
  dailyCheckIns: number;
  corrections: number;
  avatar: string;
  voiceTone: string;
  answers: Record<string, any>;
}

interface DigitalTwinAcceleratorProps {
  onComplete?: () => void;
}

export function DigitalTwinAccelerator({ onComplete }: DigitalTwinAcceleratorProps) {
  const { showAchievement, celebrate } = useCelebration();
  
  const [mode, setMode] = useState<'overview' | 'quickfire' | 'scenarios' | 'upload' | 'customize' | 'daily'>('overview');
  const [progress, setProgress] = useState<TrainingProgress>(() => {
    const saved = localStorage.getItem('brain_twin_training');
    if (saved) return JSON.parse(saved);
    return {
      totalHours: 0,
      quickFireAnswered: 0,
      scenariosCompleted: 0,
      emailsUploaded: 0,
      documentsUploaded: 0,
      voiceSamples: 0,
      dailyCheckIns: 0,
      corrections: 0,
      avatar: 'professional',
      voiceTone: 'adaptive',
      answers: {},
    };
  });

  // Quick-fire state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);

  // Scenario state
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);

  // Save progress
  useEffect(() => {
    localStorage.setItem('brain_twin_training', JSON.stringify(progress));
  }, [progress]);

  const addTrainingHours = useCallback((hours: number, type: string) => {
    setProgress(prev => {
      const newTotal = prev.totalHours + hours;
      const newProgress = { ...prev, totalHours: newTotal };
      
      // Check for milestones
      const milestones = [100, 500, 1000, 2500, 5000];
      for (const milestone of milestones) {
        if (prev.totalHours < milestone && newTotal >= milestone) {
          showAchievement({
            title: `${milestone} Hours Trained!`,
            description: `Your Chief of Staff is ${Math.round((milestone / TARGET_HOURS) * 100)}% trained`,
            icon: '🧠',
          });
          if (milestone === 5000) {
            celebrate('confetti');
          }
        }
      }
      
      return newProgress;
    });
  }, [showAchievement, celebrate]);

  const handleQuickFireAnswer = (answer: boolean) => {
    const question = QUICK_FIRE_QUESTIONS[currentQuestionIndex];
    
    setProgress(prev => ({
      ...prev,
      quickFireAnswered: prev.quickFireAnswered + 1,
      answers: { ...prev.answers, [question.id]: answer },
    }));
    
    addTrainingHours(TRAINING_VALUES.quickFireQuestion, 'quickfire');
    
    if (currentQuestionIndex < QUICK_FIRE_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Session complete
      setIsSessionActive(false);
      showAchievement({
        title: 'Quick-Fire Complete!',
        description: `Answered ${QUICK_FIRE_QUESTIONS.length} questions`,
        icon: '⚡',
      });
      setMode('overview');
    }
  };

  const handleScenarioAnswer = (optionId: string) => {
    const scenario = SCENARIO_QUESTIONS[currentScenarioIndex];
    const option = scenario.options.find(o => o.id === optionId);
    
    setProgress(prev => ({
      ...prev,
      scenariosCompleted: prev.scenariosCompleted + 1,
      answers: { 
        ...prev.answers, 
        [scenario.id]: { optionId, style: option?.style } 
      },
    }));
    
    addTrainingHours(TRAINING_VALUES.scenarioQuestion, 'scenario');
    
    if (currentScenarioIndex < SCENARIO_QUESTIONS.length - 1) {
      setCurrentScenarioIndex(prev => prev + 1);
    } else {
      showAchievement({
        title: 'Scenarios Complete!',
        description: 'Your Chief of Staff understands your decision style',
        icon: '🎯',
      });
      setMode('overview');
    }
  };

  const handleFileUpload = (type: 'email' | 'document') => {
    // Simulate file upload
    const hours = type === 'email' ? TRAINING_VALUES.emailUpload : TRAINING_VALUES.documentUpload;
    const count = type === 'email' ? 10 : 1; // Simulate batch upload for emails
    
    setProgress(prev => ({
      ...prev,
      [type === 'email' ? 'emailsUploaded' : 'documentsUploaded']: 
        prev[type === 'email' ? 'emailsUploaded' : 'documentsUploaded'] + count,
    }));
    
    addTrainingHours(hours * count, type);
    
    showAchievement({
      title: `${type === 'email' ? 'Emails' : 'Document'} Uploaded!`,
      description: `+${hours * count} training hours added`,
      icon: type === 'email' ? '📧' : '📄',
    });
  };

  const progressPercentage = Math.min(100, (progress.totalHours / TARGET_HOURS) * 100);

  const startQuickFireSession = () => {
    setCurrentQuestionIndex(0);
    setSessionStartTime(Date.now());
    setIsSessionActive(true);
    setMode('quickfire');
  };

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/20 via-purple-500/20 to-cyan-500/20 p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Chief of Staff Accelerator</h2>
              <p className="text-sm text-muted-foreground">Train your AI to think like you</p>
            </div>
          </div>
          
          {/* Training Hours Counter */}
          <div className="text-right">
            <div className="text-3xl font-bold text-foreground">
              {progress.totalHours.toLocaleString()}
              <span className="text-lg text-muted-foreground">/{TARGET_HOURS.toLocaleString()}</span>
            </div>
            <p className="text-xs text-muted-foreground">Training Hours</p>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>{progressPercentage.toFixed(1)}% Complete</span>
            <span>{(TARGET_HOURS - progress.totalHours).toLocaleString()} hours to full autonomy</span>
          </div>
          <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary via-purple-500 to-cyan-500 transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {mode === 'overview' && (
          <div className="space-y-6">
            {/* Training Methods Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Quick-Fire Interview */}
              <button
                onClick={startQuickFireSession}
                className="p-5 bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-xl text-left hover:border-orange-500/50 transition-all group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Zap className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Quick-Fire Interview</h3>
                    <p className="text-xs text-muted-foreground">15 min • Yes/No questions</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Rapid questions about your preferences, habits, and communication style.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-orange-400">+{TRAINING_VALUES.quickFireQuestion}hrs per question</span>
                  <span className="text-xs text-muted-foreground">{progress.quickFireAnswered}/{QUICK_FIRE_QUESTIONS.length} answered</span>
                </div>
              </button>

              {/* Scenario Training */}
              <button
                onClick={() => setMode('scenarios')}
                className="p-5 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-xl text-left hover:border-blue-500/50 transition-all group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Target className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Scenario Training</h3>
                    <p className="text-xs text-muted-foreground">10 min • Multiple choice</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Real-world scenarios to understand your decision-making style.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-blue-400">+{TRAINING_VALUES.scenarioQuestion}hrs per scenario</span>
                  <span className="text-xs text-muted-foreground">{progress.scenariosCompleted}/{SCENARIO_QUESTIONS.length} completed</span>
                </div>
              </button>

              {/* Document Upload */}
              <button
                onClick={() => setMode('upload')}
                className="p-5 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl text-left hover:border-green-500/50 transition-all group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Upload className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Upload & Learn</h3>
                    <p className="text-xs text-muted-foreground">Instant • Bulk training</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Upload emails, documents, and texts to learn your writing style.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-green-400">Up to +200hrs per batch</span>
                  <span className="text-xs text-muted-foreground">{progress.emailsUploaded + progress.documentsUploaded} files</span>
                </div>
              </button>

              {/* Customize Avatar */}
              <button
                onClick={() => setMode('customize')}
                className="p-5 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl text-left hover:border-purple-500/50 transition-all group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Palette className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Customize Twin</h3>
                    <p className="text-xs text-muted-foreground">5 min • Appearance & Voice</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Choose how your Chief of Staff looks and communicates.
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{AVATAR_OPTIONS.find(a => a.id === progress.avatar)?.emoji}</span>
                  <span className="text-xs text-muted-foreground">{VOICE_OPTIONS.find(v => v.id === progress.voiceTone)?.label} voice</span>
                </div>
              </button>

              {/* Daily Check-in */}
              <button
                onClick={() => setMode('daily')}
                className="p-5 bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border border-yellow-500/30 rounded-xl text-left hover:border-yellow-500/50 transition-all group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Clock className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Daily Micro-Training</h3>
                    <p className="text-xs text-muted-foreground">2 min • Compounds daily</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Quick daily check-ins that compound over time.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-yellow-400">+{TRAINING_VALUES.dailyCheckIn}hr per check-in</span>
                  <span className="text-xs text-muted-foreground">{progress.dailyCheckIns} check-ins</span>
                </div>
              </button>

              {/* Training Stats */}
              <div className="p-5 bg-gray-800/50 border border-gray-700 rounded-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-gray-700 flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-foreground/70" />
                  </div>
                  <h3 className="font-semibold text-foreground">Training Breakdown</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Quick-fire answers</span>
                    <span className="text-foreground">{progress.quickFireAnswered * TRAINING_VALUES.quickFireQuestion}hrs</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Scenarios</span>
                    <span className="text-foreground">{progress.scenariosCompleted * TRAINING_VALUES.scenarioQuestion}hrs</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Emails analyzed</span>
                    <span className="text-foreground">{(progress.emailsUploaded * TRAINING_VALUES.emailUpload).toFixed(0)}hrs</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Documents</span>
                    <span className="text-foreground">{progress.documentsUploaded * TRAINING_VALUES.documentUpload}hrs</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Daily check-ins</span>
                    <span className="text-foreground">{progress.dailyCheckIns * TRAINING_VALUES.dailyCheckIn}hrs</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick-Fire Mode */}
        {mode === 'quickfire' && (
          <div className="max-w-xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setMode('overview')}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
              <div className="text-sm text-muted-foreground">
                {currentQuestionIndex + 1} / {QUICK_FIRE_QUESTIONS.length}
              </div>
            </div>

            {/* Progress */}
            <div className="h-1 bg-gray-800 rounded-full mb-8">
              <div 
                className="h-full bg-orange-500 rounded-full transition-all"
                style={{ width: `${((currentQuestionIndex + 1) / QUICK_FIRE_QUESTIONS.length) * 100}%` }}
              />
            </div>

            {/* Question */}
            <div className="text-center mb-8">
              <span className="text-xs text-orange-400 uppercase tracking-wider mb-2 block">
                {QUICK_FIRE_QUESTIONS[currentQuestionIndex].category}
              </span>
              <h3 className="text-2xl font-semibold text-foreground">
                {QUICK_FIRE_QUESTIONS[currentQuestionIndex].question}
              </h3>
            </div>

            {/* Yes/No Buttons */}
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => handleQuickFireAnswer(false)}
                className="w-32 h-32 rounded-2xl bg-red-500/10 border-2 border-red-500/30 hover:border-red-500 hover:bg-red-500/20 transition-all flex flex-col items-center justify-center gap-2 group"
              >
                <X className="w-10 h-10 text-red-400 group-hover:scale-110 transition-transform" />
                <span className="text-lg font-semibold text-red-400">No</span>
              </button>
              <button
                onClick={() => handleQuickFireAnswer(true)}
                className="w-32 h-32 rounded-2xl bg-green-500/10 border-2 border-green-500/30 hover:border-green-500 hover:bg-green-500/20 transition-all flex flex-col items-center justify-center gap-2 group"
              >
                <Check className="w-10 h-10 text-green-400 group-hover:scale-110 transition-transform" />
                <span className="text-lg font-semibold text-green-400">Yes</span>
              </button>
            </div>

            <p className="text-center text-xs text-muted-foreground mt-6">
              Press <kbd className="px-1.5 py-0.5 bg-gray-800 rounded">Y</kbd> for Yes or <kbd className="px-1.5 py-0.5 bg-gray-800 rounded">N</kbd> for No
            </p>
          </div>
        )}

        {/* Scenarios Mode */}
        {mode === 'scenarios' && (
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setMode('overview')}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
              <div className="text-sm text-muted-foreground">
                Scenario {currentScenarioIndex + 1} / {SCENARIO_QUESTIONS.length}
              </div>
            </div>

            {/* Progress */}
            <div className="h-1 bg-gray-800 rounded-full mb-8">
              <div 
                className="h-full bg-blue-500 rounded-full transition-all"
                style={{ width: `${((currentScenarioIndex + 1) / SCENARIO_QUESTIONS.length) * 100}%` }}
              />
            </div>

            {/* Scenario */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6 mb-6">
              <span className="text-xs text-blue-400 uppercase tracking-wider mb-2 block">
                {SCENARIO_QUESTIONS[currentScenarioIndex].category}
              </span>
              <p className="text-lg text-foreground mb-2">
                {SCENARIO_QUESTIONS[currentScenarioIndex].scenario}
              </p>
              <p className="text-xl font-semibold text-foreground">
                {SCENARIO_QUESTIONS[currentScenarioIndex].question}
              </p>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {SCENARIO_QUESTIONS[currentScenarioIndex].options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleScenarioAnswer(option.id)}
                  className="w-full p-4 bg-gray-800/50 border border-gray-700 rounded-xl text-left hover:border-blue-500/50 hover:bg-gray-800 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-gray-700 flex items-center justify-center text-sm font-medium text-muted-foreground group-hover:bg-blue-500/20 group-hover:text-blue-400 transition-colors">
                      {option.id.toUpperCase()}
                    </span>
                    <span className="text-foreground">{option.text}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Upload Mode */}
        {mode === 'upload' && (
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setMode('overview')}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
            </div>

            <h3 className="text-xl font-semibold text-foreground mb-2">Upload & Learn</h3>
            <p className="text-muted-foreground mb-6">
              Upload your communications to accelerate training. Your Chief of Staff will learn your writing style, vocabulary, and tone.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Email Upload */}
              <div className="p-6 bg-gray-800/50 border border-gray-700 rounded-xl">
                <div className="flex items-center gap-3 mb-4">
                  <Mail className="w-6 h-6 text-green-400" />
                  <h4 className="font-semibold text-foreground">Email Export</h4>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Export your sent emails from Gmail or Outlook. Each email = {TRAINING_VALUES.emailUpload} training hours.
                </p>
                <button
                  onClick={() => handleFileUpload('email')}
                  className="w-full py-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 hover:bg-green-500/20 transition-colors"
                >
                  <Upload className="w-4 h-4 inline mr-2" />
                  Upload Email Export
                </button>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  {progress.emailsUploaded} emails uploaded
                </p>
              </div>

              {/* Document Upload */}
              <div className="p-6 bg-gray-800/50 border border-gray-700 rounded-xl">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="w-6 h-6 text-purple-400" />
                  <h4 className="font-semibold text-foreground">Documents</h4>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Upload reports, memos, or any documents you've written. Each doc = {TRAINING_VALUES.documentUpload} training hours.
                </p>
                <button
                  onClick={() => handleFileUpload('document')}
                  className="w-full py-3 bg-purple-500/10 border border-purple-500/30 rounded-lg text-purple-400 hover:bg-purple-500/20 transition-colors"
                >
                  <Upload className="w-4 h-4 inline mr-2" />
                  Upload Documents
                </button>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  {progress.documentsUploaded} documents uploaded
                </p>
              </div>

              {/* Voice Sample */}
              <div className="p-6 bg-gray-800/50 border border-gray-700 rounded-xl">
                <div className="flex items-center gap-3 mb-4">
                  <Mic className="w-6 h-6 text-orange-400" />
                  <h4 className="font-semibold text-foreground">Voice Samples</h4>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Record voice samples to train speech patterns. Each sample = {TRAINING_VALUES.voiceSample} training hours.
                </p>
                <button className="w-full py-3 bg-orange-500/10 border border-orange-500/30 rounded-lg text-orange-400 hover:bg-orange-500/20 transition-colors">
                  <Mic className="w-4 h-4 inline mr-2" />
                  Record Voice Sample
                </button>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  {progress.voiceSamples} samples recorded
                </p>
              </div>

              {/* Text Messages */}
              <div className="p-6 bg-gray-800/50 border border-gray-700 rounded-xl">
                <div className="flex items-center gap-3 mb-4">
                  <MessageSquare className="w-6 h-6 text-cyan-400" />
                  <h4 className="font-semibold text-foreground">Text Messages</h4>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Export WhatsApp or iMessage conversations to learn casual communication.
                </p>
                <button className="w-full py-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400 hover:bg-cyan-500/20 transition-colors">
                  <Upload className="w-4 h-4 inline mr-2" />
                  Upload Chat Export
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Customize Mode */}
        {mode === 'customize' && (
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setMode('overview')}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
            </div>

            <h3 className="text-xl font-semibold text-foreground mb-6">Customize Your Chief of Staff</h3>

            {/* Avatar Selection */}
            <div className="mb-8">
              <h4 className="font-medium text-foreground mb-3">Avatar Style</h4>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {AVATAR_OPTIONS.map((avatar) => (
                  <button
                    key={avatar.id}
                    onClick={() => setProgress(prev => ({ ...prev, avatar: avatar.id }))}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      progress.avatar === avatar.id
                        ? 'border-primary bg-primary/10'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <span className="text-3xl block mb-1">{avatar.emoji}</span>
                    <span className="text-xs text-muted-foreground">{avatar.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Voice Tone Selection */}
            <div>
              <h4 className="font-medium text-foreground mb-3">Voice Tone</h4>
              <div className="space-y-2">
                {VOICE_OPTIONS.map((voice) => (
                  <button
                    key={voice.id}
                    onClick={() => setProgress(prev => ({ ...prev, voiceTone: voice.id }))}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      progress.voiceTone === voice.id
                        ? 'border-primary bg-primary/10'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium text-foreground">{voice.label}</span>
                        <p className="text-sm text-muted-foreground">{voice.description}</p>
                      </div>
                      {progress.voiceTone === voice.id && (
                        <Check className="w-5 h-5 text-primary" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Daily Check-in Mode */}
        {mode === 'daily' && (
          <div className="max-w-xl mx-auto text-center">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setMode('overview')}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
            </div>

            <div className="w-20 h-20 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-4">
              <Clock className="w-10 h-10 text-yellow-400" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Daily Micro-Training</h3>
            <p className="text-muted-foreground mb-6">
              Quick 2-minute check-ins that compound over time. Your Chief of Staff learns from your daily patterns.
            </p>

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 mb-6">
              <p className="text-lg text-foreground mb-4">How are you feeling about your workload today?</p>
              <div className="flex justify-center gap-2">
                {['😫', '😔', '😐', '🙂', '😊'].map((emoji, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setProgress(prev => ({ ...prev, dailyCheckIns: prev.dailyCheckIns + 1 }));
                      addTrainingHours(TRAINING_VALUES.dailyCheckIn, 'daily');
                      showAchievement({
                        title: 'Check-in Complete!',
                        description: '+1 training hour added',
                        icon: '✅',
                      });
                      setMode('overview');
                    }}
                    className="w-12 h-12 text-2xl hover:scale-125 transition-transform"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              {progress.dailyCheckIns} check-ins completed • {progress.dailyCheckIns * TRAINING_VALUES.dailyCheckIn} hours earned
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
