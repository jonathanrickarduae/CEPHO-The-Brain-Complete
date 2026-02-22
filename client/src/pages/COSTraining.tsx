import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrainingModal } from "@/components/training/TrainingModal";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, CheckCircle2, Lock, ArrowRight, Trophy, 
  Target, Zap, BookOpen, Users, Briefcase, BarChart3
} from "lucide-react";
import { 
  COS_TRAINING_LEVELS, 
  getCOSLevel, 
  getProgressToNextLevel,
  calculateOverallScore
} from "@shared/cosTrainingScore";

// Mock current training state - would come from database
const CURRENT_COS_TRAINING = {
  percentage: 40,
  completedModules: 8,
  totalModules: 20,
  lastActivity: new Date().toISOString(),
};

// Training modules
const TRAINING_MODULES = [
  {
    id: 1,
    name: "CEPHO Foundation",
    description: "Understanding the CEPHO.Ai platform and philosophy",
    level: 1,
    duration: "30 min",
    completed: true,
    icon: Brain,
  },
  {
    id: 2,
    name: "The Signal System",
    description: "Morning and Evening briefing protocols",
    level: 1,
    duration: "25 min",
    completed: true,
    icon: Zap,
  },
  {
    id: 3,
    name: "SME Panel Management",
    description: "Coordinating AI Subject Matter Experts",
    level: 2,
    duration: "45 min",
    completed: true,
    icon: Users,
  },
  {
    id: 4,
    name: "Project Genesis Workflow",
    description: "7-phase project lifecycle management",
    level: 2,
    duration: "60 min",
    completed: true,
    icon: Briefcase,
  },
  {
    id: 5,
    name: "Quality Gate System",
    description: "4-level review and approval process",
    level: 2,
    duration: "40 min",
    completed: true,
    icon: CheckCircle2,
  },
  {
    id: 6,
    name: "KPI Assessment Framework",
    description: "50-category scoring methodology",
    level: 3,
    duration: "90 min",
    completed: true,
    icon: BarChart3,
  },
  {
    id: 7,
    name: "Document Generation",
    description: "CEPHO design guidelines and templates",
    level: 3,
    duration: "45 min",
    completed: true,
    icon: BookOpen,
  },
  {
    id: 8,
    name: "Innovation Hub Operations",
    description: "Idea scoring and pipeline management",
    level: 3,
    duration: "50 min",
    completed: true,
    icon: Target,
  },
  {
    id: 9,
    name: "Strategic Advisory Support",
    description: "Executive-level decision support",
    level: 4,
    duration: "75 min",
    completed: false,
    icon: Trophy,
  },
  {
    id: 10,
    name: "Cross-Domain Coordination",
    description: "Managing complex multi-team initiatives",
    level: 4,
    duration: "60 min",
    completed: false,
    icon: Users,
  },
];

export default function COSTraining() {
  const [selectedModule, setSelectedModule] = useState<number | null>(null);
  const [completedModules, setCompletedModules] = useState<Set<number>>(new Set([1, 2, 3, 4, 5, 6, 7, 8]));

  const handleCompleteModule = (moduleId: number) => {
    setCompletedModules(prev => new Set([...prev, moduleId]));
    const newCompleted = completedModules.size + 1;
    const newPercentage = Math.round((newCompleted / TRAINING_MODULES.length) * 100);
    toast.success(`Training module completed! Progress: ${newPercentage}%`);
    setSelectedModule(null);
  };
  
  const currentLevel = getCOSLevel(CURRENT_COS_TRAINING.percentage);
  const progress = getProgressToNextLevel(CURRENT_COS_TRAINING.percentage);
  
  // Example: Show how COS training affects a sample score
  const sampleScores = [63, 72, 58, 81, 45]; // Sample KPI scores
  const scoreImpact = calculateOverallScore(sampleScores, CURRENT_COS_TRAINING.percentage);

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">COS Training</h1>
          <p className="text-muted-foreground mt-1">
            Train your Chief of Staff to unlock full assessment accuracy
          </p>
        </div>
        <Badge 
          variant="outline" 
          className="text-lg px-4 py-2 bg-primary/10 border-primary/30"
        >
          Level {currentLevel.level}: {currentLevel.name}
        </Badge>
      </div>

      {/* Training Progress Overview */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Training Progress
            </CardTitle>
            <CardDescription>
              Complete training modules to increase COS effectiveness
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall Progress</span>
                <span className="font-medium">{CURRENT_COS_TRAINING.percentage}%</span>
              </div>
              <Progress value={CURRENT_COS_TRAINING.percentage} className="h-3" />
            </div>
            
            <div className="grid grid-cols-5 gap-2">
              {COS_TRAINING_LEVELS.map((level) => (
                <div 
                  key={level.level}
                  className={`p-3 rounded-lg text-center transition-all ${
                    level.level <= currentLevel.level 
                      ? 'bg-primary/20 border border-primary/30' 
                      : 'bg-muted/50 border border-border'
                  }`}
                >
                  <div className={`text-xs font-medium ${level.level <= currentLevel.level ? 'text-primary' : 'text-muted-foreground'}`}>
                    Level {level.level}
                  </div>
                  <div className={`text-sm font-bold mt-1 ${level.level <= currentLevel.level ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {level.name}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {level.weightMultiplier * 100}% weight
                  </div>
                </div>
              ))}
            </div>

            {progress.nextLevel && (
              <div className="bg-muted/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Progress to {progress.nextLevel.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {progress.percentageNeeded}% needed
                  </span>
                </div>
                <Progress value={progress.progressToNext} className="h-2" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Score Impact Card */}
        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-400">
              <Target className="h-5 w-5" />
              Score Impact
            </CardTitle>
            <CardDescription>
              How COS training affects your assessments
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Raw Score</span>
                <span className="font-bold">{scoreImpact.rawAverage}/100</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Weight Applied</span>
                <span className="font-medium text-amber-400">×{currentLevel.weightMultiplier}</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between">
                <span className="text-sm font-medium">Weighted Score</span>
                <span className="font-bold text-lg">{scoreImpact.weightedAverage}/100</span>
              </div>
            </div>
            
            <div className="text-xs text-muted-foreground bg-background/50 rounded p-2">
              {scoreImpact.message}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Training Modules */}
      <Card>
        <CardHeader>
          <CardTitle>Training Modules</CardTitle>
          <CardDescription>
            Complete modules in order to progress through training levels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {TRAINING_MODULES.map((module, index) => {
              const isCompleted = completedModules.has(module.id);
              const isLocked = module.level > currentLevel.level + 1;
              const isAvailable = !isLocked && !isCompleted;
              const Icon = module.icon;
              
              return (
                <div
                  key={module.id}
                  className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                    isCompleted 
                      ? 'bg-green-500/10 border-green-500/30' 
                      : isLocked 
                        ? 'bg-muted/30 border-border opacity-60' 
                        : 'bg-background border-border hover:border-primary/50 cursor-pointer'
                  }`}
                  onClick={() => isAvailable && setSelectedModule(module.id)}
                >
                  <div className={`p-2 rounded-lg ${
                    isCompleted 
                      ? 'bg-green-500/20' 
                      : isLocked 
                        ? 'bg-muted' 
                        : 'bg-primary/20'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : isLocked ? (
                      <Lock className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <Icon className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{module.name}</span>
                      <Badge variant="outline" className="text-xs">
                        Level {module.level}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {module.description}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">{module.duration}</div>
                    {isAvailable && (
                      <Button size="sm" className="mt-1">
                        Start <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Capabilities Unlocked */}
      <Card>
        <CardHeader>
          <CardTitle>Capabilities at Current Level</CardTitle>
          <CardDescription>
            What your COS can do at Level {currentLevel.level}: {currentLevel.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {currentLevel.capabilities.map((capability, index) => (
              <div 
                key={index}
                className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20"
              >
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                <span className="text-sm">{capability}</span>
              </div>
            ))}
          </div>
          
          {progress.nextLevel && (
            <div className="mt-6 pt-6 border-t border-border">
              <h4 className="text-sm font-medium mb-3 text-muted-foreground">
                Unlock at Level {progress.nextLevel.level}: {progress.nextLevel.name}
              </h4>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {progress.nextLevel.capabilities.map((capability, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border"
                  >
                    <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-sm text-muted-foreground">{capability}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Training Modal */}
      <TrainingModal
        module={TRAINING_MODULES.find(m => m.id === selectedModule)}
        onComplete={() => selectedModule && handleCompleteModule(selectedModule)}
        onClose={() => setSelectedModule(null)}
      />
    </div>
  );
}
