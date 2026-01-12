import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Rocket, ArrowRight, ArrowLeft, Check, Mic, MicOff,
  Target, TrendingUp, Search, Briefcase, Package,
  Users, FileText, BarChart3, Shield, Clock, Upload,
  CheckCircle2, Circle, Sparkles, Building2, Scale,
  Lightbulb, Banknote, ChevronRight, AlertCircle,
  Wallet, Globe, DollarSign
} from "lucide-react";
import { 
  PROJECT_BLUEPRINTS, 
  BLUEPRINT_CATEGORIES,
  getBlueprintById,
  SME_EXPERTS,
  matchInvestors,
  INVESTOR_CATEGORIES,
  type ProjectBlueprint,
  type IntakeQuestion,
  type CapitalMatchCriteria
} from "@/lib/projectBlueprints";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { toast } from "sonner";

// Project type cards with icons
const PROJECT_TYPE_CONFIG = [
  { 
    id: 'new_business', 
    icon: TrendingUp, 
    color: 'from-emerald-500/20 to-green-500/20',
    borderColor: 'border-emerald-500/30'
  },
  { 
    id: 'due_diligence', 
    icon: Search, 
    color: 'from-blue-500/20 to-cyan-500/20',
    borderColor: 'border-blue-500/30'
  },
  { 
    id: 'investor_presentation', 
    icon: Briefcase, 
    color: 'from-purple-500/20 to-violet-500/20',
    borderColor: 'border-purple-500/30'
  },
  { 
    id: 'strategic_investment', 
    icon: Target, 
    color: 'from-orange-500/20 to-amber-500/20',
    borderColor: 'border-orange-500/30'
  },
  { 
    id: 'go_to_market', 
    icon: Package, 
    color: 'from-pink-500/20 to-rose-500/20',
    borderColor: 'border-pink-500/30'
  },
  { 
    id: 'deep_research', 
    icon: Lightbulb, 
    color: 'from-yellow-500/20 to-amber-500/20',
    borderColor: 'border-yellow-500/30'
  },
  { 
    id: 'financial_model', 
    icon: BarChart3, 
    color: 'from-indigo-500/20 to-blue-500/20',
    borderColor: 'border-indigo-500/30'
  },
  { 
    id: 'legal_compliance', 
    icon: Scale, 
    color: 'from-slate-500/20 to-gray-500/20',
    borderColor: 'border-slate-500/30'
  },
  { 
    id: 'custom', 
    icon: Sparkles, 
    color: 'from-primary/20 to-purple-500/20',
    borderColor: 'border-primary/30'
  },
];

interface WizardStep {
  id: string;
  title: string;
  description: string;
}

const WIZARD_STEPS: WizardStep[] = [
  { id: "type", title: "Project Type", description: "What kind of project is this?" },
  { id: "details", title: "Project Details", description: "Name and describe your project" },
  { id: "intake", title: "Intake Questions", description: "Answer scoping questions" },
  { id: "data", title: "Data Upload", description: "Upload relevant materials" },
  { id: "team", title: "SME Team", description: "Review your assigned experts" },
  { id: "process", title: "Process & QA", description: "Review workflow and checkpoints" },
  { id: "capital", title: "Capital Strategy", description: "Funding recommendations" },
  { id: "review", title: "Launch", description: "Review and start your project" },
];

export default function ProjectGenesisWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedBlueprintId, setSelectedBlueprintId] = useState<string | null>(null);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [intakeAnswers, setIntakeAnswers] = useState<Record<string, string | string[]>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [capitalCriteria, setCapitalCriteria] = useState<Partial<CapitalMatchCriteria>>({});
  
  const { isListening, transcript, startListening, stopListening, resetTranscript } = useVoiceInput();
  
  const selectedBlueprint = selectedBlueprintId ? getBlueprintById(selectedBlueprintId) : null;
  const progress = ((currentStep + 1) / WIZARD_STEPS.length) * 100;
  
  // Get visible intake questions (respecting conditionals)
  const visibleQuestions = selectedBlueprint?.intakeQuestions.filter(q => {
    if (!q.conditionalOn) return true;
    const dependentAnswer = intakeAnswers[q.conditionalOn.questionId];
    if (Array.isArray(q.conditionalOn.answer)) {
      return q.conditionalOn.answer.includes(dependentAnswer as string);
    }
    return dependentAnswer === q.conditionalOn.answer;
  }) || [];

  // Handle voice input for current question
  useEffect(() => {
    if (transcript && currentStep === 2 && visibleQuestions[currentQuestionIndex]?.type === 'text') {
      setIntakeAnswers(prev => ({ 
        ...prev, 
        [visibleQuestions[currentQuestionIndex].id]: transcript 
      }));
    }
  }, [transcript, currentStep, currentQuestionIndex, visibleQuestions]);

  // Check if capital strategy step should be shown
  const showCapitalStep = selectedBlueprint?.category === 'capital' || 
    ['new_business', 'investor_presentation', 'strategic_investment'].includes(selectedBlueprintId || '');

  // Get filtered steps based on project type
  const activeSteps = WIZARD_STEPS.filter(step => {
    if (step.id === 'capital' && !showCapitalStep) return false;
    return true;
  });

  const handleNextStep = () => {
    const currentActiveIndex = activeSteps.findIndex(s => s.id === WIZARD_STEPS[currentStep].id);
    if (currentActiveIndex < activeSteps.length - 1) {
      const nextStep = activeSteps[currentActiveIndex + 1];
      const nextStepIndex = WIZARD_STEPS.findIndex(s => s.id === nextStep.id);
      setCurrentStep(nextStepIndex);
    }
  };

  const handlePrevStep = () => {
    const currentActiveIndex = activeSteps.findIndex(s => s.id === WIZARD_STEPS[currentStep].id);
    if (currentActiveIndex > 0) {
      const prevStep = activeSteps[currentActiveIndex - 1];
      const prevStepIndex = WIZARD_STEPS.findIndex(s => s.id === prevStep.id);
      setCurrentStep(prevStepIndex);
    }
  };

  const handleIntakeAnswer = (questionId: string, answer: string | string[]) => {
    setIntakeAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < visibleQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      resetTranscript();
    } else {
      handleNextStep();
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadedFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const handleLaunchProject = () => {
    toast.success("Project created successfully!", {
      description: `${projectName} has been added to your Workflow`
    });
    // In production, this would create the project in the database
  };

  const canProceed = () => {
    switch (WIZARD_STEPS[currentStep].id) {
      case 'type': return !!selectedBlueprintId;
      case 'details': return projectName.trim().length > 0;
      case 'intake': {
        const requiredQuestions = visibleQuestions.filter(q => q.required);
        return requiredQuestions.every(q => intakeAnswers[q.id]);
      }
      default: return true;
    }
  };

  // Get capital matches if applicable
  const capitalMatches = capitalCriteria.amount ? matchInvestors(capitalCriteria as CapitalMatchCriteria) : [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/50 bg-card/30 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 border border-primary/30 flex items-center justify-center">
                <Rocket className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-display font-bold text-foreground">Project Genesis</h1>
                <p className="text-sm text-muted-foreground">Launch a new project with QMS blueprints</p>
              </div>
            </div>
            <Badge variant="outline" className="border-primary/30 text-primary">
              Step {activeSteps.findIndex(s => s.id === WIZARD_STEPS[currentStep].id) + 1} of {activeSteps.length}
            </Badge>
          </div>
          
          {/* Progress bar */}
          <div className="mt-4">
            <Progress value={progress} className="h-1 bg-border" />
          </div>
          
          {/* Step indicators */}
          <div className="flex items-center justify-between mt-4 overflow-x-auto pb-2">
            {activeSteps.map((step, index) => {
              const stepIndex = WIZARD_STEPS.findIndex(s => s.id === step.id);
              const isActive = stepIndex === currentStep;
              const isComplete = stepIndex < currentStep;
              
              return (
                <div 
                  key={step.id}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                    isActive 
                      ? 'bg-primary/10 border border-primary/30' 
                      : isComplete 
                        ? 'text-primary' 
                        : 'text-muted-foreground/50'
                  }`}
                >
                  {isComplete ? (
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                  ) : isActive ? (
                    <Circle className="w-4 h-4 text-primary fill-primary" />
                  ) : (
                    <Circle className="w-4 h-4" />
                  )}
                  <span className="text-xs font-medium whitespace-nowrap">{step.title}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Step 1: Project Type Selection */}
        {WIZARD_STEPS[currentStep].id === 'type' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-display font-bold text-foreground mb-2">
                What kind of project is this?
              </h2>
              <p className="text-muted-foreground">
                Select the blueprint that best matches your project
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {PROJECT_TYPE_CONFIG.map((config) => {
                const blueprint = PROJECT_BLUEPRINTS[config.id];
                if (!blueprint) return null;
                
                const Icon = config.icon;
                const isSelected = selectedBlueprintId === config.id;
                
                return (
                  <Card 
                    key={config.id}
                    className={`cursor-pointer transition-all duration-300 hover:border-primary/50 ${
                      isSelected 
                        ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
                        : 'border-border/50 hover:bg-card/80'
                    }`}
                    onClick={() => setSelectedBlueprintId(config.id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${config.color} border ${config.borderColor}`}>
                          <Icon className="w-6 h-6 text-foreground" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground mb-1">{blueprint.name}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">{blueprint.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {blueprint.estimatedDuration}
                            </Badge>
                            <Badge variant="outline" className="text-xs capitalize">
                              {blueprint.complexity}
                            </Badge>
                          </div>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Project Details */}
        {WIZARD_STEPS[currentStep].id === 'details' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-display font-bold text-foreground mb-2">
                Name your project
              </h2>
              <p className="text-muted-foreground">
                Give your project a clear, memorable name
              </p>
            </div>
            
            <Card className="border-border/50 max-w-2xl mx-auto">
              <CardContent className="p-8 space-y-6">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Project Name *
                  </label>
                  <Input
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="e.g., Celadon Series A Raise"
                    className="h-12 text-lg bg-background border-border/50 focus:border-primary"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Brief Description (optional)
                  </label>
                  <Textarea
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    placeholder="What's the objective of this project?"
                    className="min-h-[100px] bg-background border-border/50 focus:border-primary resize-none"
                  />
                </div>
                
                {selectedBlueprint && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-sm text-muted-foreground">
                      Using <strong>{selectedBlueprint.name}</strong> blueprint • {selectedBlueprint.estimatedDuration}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 3: Intake Questions */}
        {WIZARD_STEPS[currentStep].id === 'intake' && selectedBlueprint && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-display font-bold text-foreground mb-2">
                Scoping Questions
              </h2>
              <p className="text-muted-foreground">
                Answer these questions to help scope your project
              </p>
            </div>
            
            <Card className="border-border/50 max-w-2xl mx-auto">
              <CardContent className="p-8">
                {visibleQuestions.length > 0 && visibleQuestions[currentQuestionIndex] && (
                  <IntakeQuestionCard
                    question={visibleQuestions[currentQuestionIndex]}
                    answer={intakeAnswers[visibleQuestions[currentQuestionIndex].id]}
                    onAnswer={(answer) => handleIntakeAnswer(visibleQuestions[currentQuestionIndex].id, answer)}
                    onNext={handleNextQuestion}
                    onPrev={handlePrevQuestion}
                    isFirst={currentQuestionIndex === 0}
                    isLast={currentQuestionIndex === visibleQuestions.length - 1}
                    questionNumber={currentQuestionIndex + 1}
                    totalQuestions={visibleQuestions.length}
                    isListening={isListening}
                    onStartListening={startListening}
                    onStopListening={stopListening}
                    transcript={transcript}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 4: Data Upload */}
        {WIZARD_STEPS[currentStep].id === 'data' && selectedBlueprint && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-display font-bold text-foreground mb-2">
                Upload Materials
              </h2>
              <p className="text-muted-foreground">
                Share any existing documents or data
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {/* Required Materials */}
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-500" />
                    Required Materials
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {selectedBlueprint.dataRequirements.required.map((req, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <Circle className="w-3 h-3 text-muted-foreground" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              
              {/* Optional Materials */}
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                    Optional Materials
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {selectedBlueprint.dataRequirements.optional.map((opt, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Circle className="w-3 h-3" />
                        {opt}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
            
            {/* Upload Area */}
            <Card className="border-border/50 max-w-2xl mx-auto">
              <CardContent className="p-8">
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-foreground font-medium mb-2">
                    Drag and drop files here
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    or click to browse
                  </p>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload">
                    <Button variant="outline" asChild>
                      <span>Browse Files</span>
                    </Button>
                  </label>
                </div>
                
                {uploadedFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {uploadedFiles.map((file, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 rounded bg-muted/50">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{file.name}</span>
                        <Badge variant="outline" className="ml-auto text-xs">
                          {(file.size / 1024).toFixed(1)} KB
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 5: SME Team */}
        {WIZARD_STEPS[currentStep].id === 'team' && selectedBlueprint && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-display font-bold text-foreground mb-2">
                Your Expert Team
              </h2>
              <p className="text-muted-foreground">
                These SMEs have been assigned based on your project type
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
              {/* Lead */}
              {selectedBlueprint.recommendedTeam.lead && SME_EXPERTS[selectedBlueprint.recommendedTeam.lead as keyof typeof SME_EXPERTS] && (
                <Card className="border-primary/30 bg-primary/5">
                  <CardContent className="p-5">
                    <Badge className="mb-3 bg-primary">Lead</Badge>
                    <SMECard smeId={selectedBlueprint.recommendedTeam.lead} />
                  </CardContent>
                </Card>
              )}
              
              {/* Core Team */}
              {selectedBlueprint.recommendedTeam.core.map((smeId) => {
                const sme = SME_EXPERTS[smeId as keyof typeof SME_EXPERTS];
                if (!sme) return null;
                return (
                  <Card key={smeId} className="border-border/50">
                    <CardContent className="p-5">
                      <Badge variant="outline" className="mb-3">Core</Badge>
                      <SMECard smeId={smeId} />
                    </CardContent>
                  </Card>
                );
              })}
              
              {/* Specialists */}
              {selectedBlueprint.recommendedTeam.specialists.map((smeId) => {
                const sme = SME_EXPERTS[smeId as keyof typeof SME_EXPERTS];
                if (!sme) return null;
                return (
                  <Card key={smeId} className="border-border/50 opacity-75">
                    <CardContent className="p-5">
                      <Badge variant="secondary" className="mb-3">Specialist</Badge>
                      <SMECard smeId={smeId} />
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            
            <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20 max-w-xl mx-auto">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">
                You can add or change team members after launch
              </span>
            </div>
          </div>
        )}

        {/* Step 6: Process & QA */}
        {WIZARD_STEPS[currentStep].id === 'process' && selectedBlueprint && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-display font-bold text-foreground mb-2">
                Process & QA Gates
              </h2>
              <p className="text-muted-foreground">
                Review the workflow and quality checkpoints
              </p>
            </div>
            
            <div className="max-w-4xl mx-auto">
              {/* Process Steps */}
              <div className="space-y-4">
                {selectedBlueprint.processSteps.map((step, index) => (
                  <Card key={step.id} className="border-border/50">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-foreground">{step.name}</h3>
                            <Badge variant="outline" className="text-xs">
                              {step.estimatedDuration}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{step.description}</p>
                          
                          {/* Outputs */}
                          <div className="flex flex-wrap gap-2 mb-2">
                            {step.outputs.map((output, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {output}
                              </Badge>
                            ))}
                          </div>
                          
                          {/* QA Gate */}
                          {step.qaGate && (
                            <div className="mt-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                              <div className="flex items-center gap-2 text-amber-500 text-sm font-medium">
                                <Shield className="w-4 h-4" />
                                QA Gate: {step.qaGate.name}
                              </div>
                              <ul className="mt-2 space-y-1">
                                {step.qaGate.criteria.map((c, i) => (
                                  <li key={i} className="text-xs text-muted-foreground flex items-center gap-2">
                                    <Check className="w-3 h-3 text-amber-500" />
                                    {c}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                        
                        {/* Assigned SMEs */}
                        <div className="flex -space-x-2">
                          {step.assignedSMEs.slice(0, 3).map((smeId, i) => (
                            <div 
                              key={i}
                              className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 border-2 border-background flex items-center justify-center text-xs font-bold text-primary"
                              title={SME_EXPERTS[smeId as keyof typeof SME_EXPERTS]?.name || smeId}
                            >
                              {(SME_EXPERTS[smeId as keyof typeof SME_EXPERTS]?.name || smeId).split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 7: Capital Strategy (conditional) */}
        {WIZARD_STEPS[currentStep].id === 'capital' && showCapitalStep && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-display font-bold text-foreground mb-2">
                Capital Strategy
              </h2>
              <p className="text-muted-foreground">
                Based on your inputs, here are funding recommendations
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {/* Capital Input */}
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-primary" />
                    Funding Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Target Raise Amount</label>
                    <Input
                      type="number"
                      placeholder="e.g., 500000"
                      value={capitalCriteria.amount || ''}
                      onChange={(e) => setCapitalCriteria(prev => ({ ...prev, amount: parseInt(e.target.value) || 0 }))}
                      className="bg-background"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Location</label>
                    <Input
                      placeholder="e.g., UK, UAE, US"
                      value={capitalCriteria.location || ''}
                      onChange={(e) => setCapitalCriteria(prev => ({ ...prev, location: e.target.value }))}
                      className="bg-background"
                    />
                  </div>
                </CardContent>
              </Card>
              
              {/* Investor Categories */}
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-primary" />
                    Recommended Investor Types
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-3">
                      {capitalMatches.length > 0 ? capitalMatches.map((match, i) => (
                        <div key={i} className="p-3 rounded-lg bg-muted/50">
                          <div className="font-medium text-sm">
                            {INVESTOR_CATEGORIES[match.category as keyof typeof INVESTOR_CATEGORIES]?.name}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {match.reasoning}
                          </div>
                        </div>
                      )) : (
                        <p className="text-sm text-muted-foreground">
                          Enter a target raise amount to see recommendations
                        </p>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Step 8: Review & Launch */}
        {WIZARD_STEPS[currentStep].id === 'review' && selectedBlueprint && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-display font-bold text-foreground mb-2">
                Ready to Launch
              </h2>
              <p className="text-muted-foreground">
                Review your project setup before launching
              </p>
            </div>
            
            <Card className="border-border/50 max-w-3xl mx-auto">
              <CardContent className="p-8 space-y-6">
                {/* Project Summary */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <div>
                      <div className="text-sm text-muted-foreground">Project Name</div>
                      <div className="font-semibold text-lg">{projectName}</div>
                    </div>
                    <Badge className="bg-primary">{selectedBlueprint.name}</Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-muted/50">
                      <div className="text-sm text-muted-foreground">Duration</div>
                      <div className="font-medium">{selectedBlueprint.estimatedDuration}</div>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50">
                      <div className="text-sm text-muted-foreground">Complexity</div>
                      <div className="font-medium capitalize">{selectedBlueprint.complexity}</div>
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="text-sm text-muted-foreground mb-2">Deliverables</div>
                    <div className="flex flex-wrap gap-2">
                      {selectedBlueprint.deliverables.map((d) => (
                        <Badge key={d.id} variant="outline">{d.name}</Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="text-sm text-muted-foreground mb-2">Team Size</div>
                    <div className="font-medium">
                      {1 + selectedBlueprint.recommendedTeam.core.length + selectedBlueprint.recommendedTeam.specialists.length} SME Experts
                    </div>
                  </div>
                </div>
                
                <Button 
                  onClick={handleLaunchProject}
                  className="w-full h-14 text-lg bg-gradient-to-r from-primary to-purple-500"
                >
                  <Rocket className="w-5 h-5 mr-2" />
                  Launch Project
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 max-w-4xl mx-auto">
          <Button
            variant="outline"
            onClick={handlePrevStep}
            disabled={activeSteps.findIndex(s => s.id === WIZARD_STEPS[currentStep].id) === 0}
            className="border-border/50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          {WIZARD_STEPS[currentStep].id !== 'review' && (
            <Button
              onClick={handleNextStep}
              disabled={!canProceed()}
              className="bg-primary"
            >
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// Intake Question Card Component
function IntakeQuestionCard({
  question,
  answer,
  onAnswer,
  onNext,
  onPrev,
  isFirst,
  isLast,
  questionNumber,
  totalQuestions,
  isListening,
  onStartListening,
  onStopListening,
  transcript
}: {
  question: IntakeQuestion;
  answer: string | string[] | undefined;
  onAnswer: (answer: string | string[]) => void;
  onNext: () => void;
  onPrev: () => void;
  isFirst: boolean;
  isLast: boolean;
  questionNumber: number;
  totalQuestions: number;
  isListening: boolean;
  onStartListening: () => void;
  onStopListening: () => void;
  transcript: string;
}) {
  const [localAnswer, setLocalAnswer] = useState(answer || '');
  
  useEffect(() => {
    setLocalAnswer(answer || '');
  }, [answer]);

  useEffect(() => {
    if (transcript && question.type === 'text') {
      setLocalAnswer(transcript);
    }
  }, [transcript, question.type]);

  const handleSubmit = () => {
    if (localAnswer) {
      onAnswer(localAnswer);
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <Badge variant="outline" className="border-primary/30 text-primary">
          Question {questionNumber} of {totalQuestions}
        </Badge>
        {question.smeSource && (
          <Badge variant="secondary" className="text-xs">
            From: {SME_EXPERTS[question.smeSource as keyof typeof SME_EXPERTS]?.name || question.smeSource}
          </Badge>
        )}
      </div>
      
      <h3 className="text-xl font-semibold text-foreground">
        {question.question}
        {question.required && <span className="text-red-500 ml-1">*</span>}
      </h3>
      
      {question.helpText && (
        <p className="text-sm text-muted-foreground">{question.helpText}</p>
      )}
      
      {/* Yes/No */}
      {question.type === 'yes_no' && (
        <div className="flex gap-4">
          <Button
            variant={localAnswer === 'yes' ? 'default' : 'outline'}
            className="flex-1 h-14 text-lg"
            onClick={() => {
              onAnswer('yes');
              onNext();
            }}
          >
            Yes
          </Button>
          <Button
            variant={localAnswer === 'no' ? 'default' : 'outline'}
            className="flex-1 h-14 text-lg"
            onClick={() => {
              onAnswer('no');
              onNext();
            }}
          >
            No
          </Button>
        </div>
      )}
      
      {/* Choice */}
      {question.type === 'choice' && question.options && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {question.options.map((option) => (
            <Button
              key={option.value}
              variant={localAnswer === option.value ? 'default' : 'outline'}
              className="h-auto py-3 px-4 justify-start text-left"
              onClick={() => {
                onAnswer(option.value);
                onNext();
              }}
            >
              <div>
                <div className="font-medium">{option.label}</div>
                {option.description && (
                  <div className="text-xs text-muted-foreground mt-1">{option.description}</div>
                )}
              </div>
            </Button>
          ))}
        </div>
      )}
      
      {/* Multi-select */}
      {question.type === 'multi_select' && question.options && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {question.options.map((option) => {
              const selected = Array.isArray(localAnswer) && localAnswer.includes(option.value);
              return (
                <Button
                  key={option.value}
                  variant={selected ? 'default' : 'outline'}
                  className="h-auto py-3 px-4 justify-start text-left"
                  onClick={() => {
                    const current = Array.isArray(localAnswer) ? localAnswer : [];
                    const updated = selected 
                      ? current.filter(v => v !== option.value)
                      : [...current, option.value];
                    setLocalAnswer(updated as any);
                    onAnswer(updated);
                  }}
                >
                  <div className="flex items-center gap-2">
                    {selected ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                    <span>{option.label}</span>
                  </div>
                </Button>
              );
            })}
          </div>
          <Button onClick={onNext} className="w-full" disabled={!Array.isArray(localAnswer) || localAnswer.length === 0}>
            Continue
          </Button>
        </div>
      )}
      
      {/* Text */}
      {question.type === 'text' && (
        <div className="space-y-4">
          <div className="relative">
            <Textarea
              value={localAnswer as string}
              onChange={(e) => setLocalAnswer(e.target.value)}
              placeholder="Type your answer..."
              className="min-h-[100px] bg-background border-border/50 focus:border-primary pr-12"
            />
            <Button
              variant="ghost"
              size="icon"
              className={`absolute right-2 top-2 ${isListening ? 'text-primary' : ''}`}
              onClick={isListening ? onStopListening : onStartListening}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
          </div>
          <Button onClick={handleSubmit} className="w-full" disabled={!localAnswer}>
            Continue
          </Button>
        </div>
      )}
      
      {/* Number */}
      {question.type === 'number' && (
        <div className="space-y-4">
          <Input
            type="number"
            value={localAnswer as string}
            onChange={(e) => setLocalAnswer(e.target.value)}
            placeholder="Enter a number..."
            className="h-12 bg-background border-border/50 focus:border-primary"
            min={question.validationRules?.min}
            max={question.validationRules?.max}
          />
          <Button onClick={handleSubmit} className="w-full" disabled={!localAnswer}>
            Continue
          </Button>
        </div>
      )}
      
      {/* File Upload */}
      {question.type === 'file_upload' && (
        <div className="space-y-4">
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
            <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Drag and drop or click to upload
            </p>
            <input type="file" className="hidden" id={`upload-${question.id}`} multiple />
            <label htmlFor={`upload-${question.id}`}>
              <Button variant="outline" size="sm" className="mt-2" asChild>
                <span>Browse Files</span>
              </Button>
            </label>
          </div>
          <Button onClick={onNext} variant="outline" className="w-full">
            Skip for now
          </Button>
        </div>
      )}
      
      {/* Navigation for non-auto-advance types */}
      {!['yes_no', 'choice'].includes(question.type) && (
        <div className="flex justify-between pt-4">
          <Button variant="ghost" onClick={onPrev} disabled={isFirst}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
        </div>
      )}
    </div>
  );
}

// SME Card Component
function SMECard({ smeId }: { smeId: string }) {
  const sme = SME_EXPERTS[smeId as keyof typeof SME_EXPERTS];
  if (!sme) return null;
  
  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 border border-primary/30 flex items-center justify-center">
          <span className="text-sm font-bold text-primary">
            {sme.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </span>
        </div>
        <div>
          <h4 className="font-semibold text-foreground text-sm">{sme.name}</h4>
        </div>
      </div>
      <div className="flex flex-wrap gap-1 mt-2">
        {sme.expertise.slice(0, 3).map((exp, i) => (
          <Badge key={i} variant="outline" className="text-xs">
            {exp}
          </Badge>
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-2 italic">
        {sme.thinkingStyle}
      </p>
    </div>
  );
}
