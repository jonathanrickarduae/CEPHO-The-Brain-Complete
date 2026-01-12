import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Rocket, ArrowRight, ArrowLeft, Check, Mic, MicOff,
  Target, TrendingUp, Search, Briefcase, Package,
  Users, FileText, BarChart3, Shield, Clock,
  CheckCircle2, Circle, Sparkles
} from "lucide-react";
import { PROJECT_TYPES, BLUEPRINTS, getProjectType, getBlueprintsForProjectType } from "@/data/projectBlueprints";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { toast } from "sonner";

interface WizardStep {
  id: string;
  title: string;
  description: string;
}

const WIZARD_STEPS: WizardStep[] = [
  { id: "type", title: "Project Type", description: "What kind of project is this?" },
  { id: "details", title: "Project Details", description: "Name and describe your project" },
  { id: "questions", title: "Quick Scoping", description: "Answer a few quick questions" },
  { id: "team", title: "SME Team", description: "Review your assigned experts" },
  { id: "deliverables", title: "Deliverables", description: "Confirm what you'll receive" },
  { id: "review", title: "Launch", description: "Review and start your project" },
];

const PROJECT_TYPE_ICONS: Record<string, React.ElementType> = {
  'revenue-business': TrendingUp,
  'funding-seeking': Briefcase,
  'due-diligence': Search,
  'strategic-initiative': Target,
  'product-launch': Package,
};

export default function ProjectGenesis() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [questionAnswers, setQuestionAnswers] = useState<Record<number, string>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  const { isListening, transcript, startListening, stopListening, resetTranscript } = useVoiceInput();
  
  const selectedProjectType = selectedType ? getProjectType(selectedType) : null;
  const blueprints = selectedType ? getBlueprintsForProjectType(selectedType) : [];
  const progress = ((currentStep + 1) / WIZARD_STEPS.length) * 100;

  // Handle voice input for current question
  useEffect(() => {
    if (transcript && currentStep === 2) {
      setQuestionAnswers(prev => ({ ...prev, [currentQuestionIndex]: transcript }));
    }
  }, [transcript, currentStep, currentQuestionIndex]);

  const handleNextStep = () => {
    if (currentStep < WIZARD_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleQuestionAnswer = (answer: string) => {
    setQuestionAnswers(prev => ({ ...prev, [currentQuestionIndex]: answer }));
    if (selectedProjectType && currentQuestionIndex < selectedProjectType.quickQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      resetTranscript();
    } else {
      handleNextStep();
    }
  };

  const handleLaunchProject = () => {
    toast.success("Project created successfully!", {
      description: `${projectName} has been added to your Workflow`
    });
    // In production, this would create the project in the database
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return !!selectedType;
      case 1: return projectName.trim().length > 0;
      case 2: return Object.keys(questionAnswers).length >= (selectedProjectType?.quickQuestions.length || 0);
      default: return true;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/50 bg-card/30 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 border border-primary/30 flex items-center justify-center">
                <Rocket className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-display font-bold text-foreground">Project Genesis</h1>
                <p className="text-sm text-muted-foreground">Launch a new project</p>
              </div>
            </div>
            <Badge variant="outline" className="border-primary/30 text-primary">
              Step {currentStep + 1} of {WIZARD_STEPS.length}
            </Badge>
          </div>
          
          {/* Progress bar */}
          <div className="mt-4">
            <Progress value={progress} className="h-1 bg-border" />
          </div>
          
          {/* Step indicators */}
          <div className="flex items-center justify-between mt-4 overflow-x-auto pb-2">
            {WIZARD_STEPS.map((step, index) => (
              <div 
                key={step.id}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                  index === currentStep 
                    ? 'bg-primary/10 border border-primary/30' 
                    : index < currentStep 
                      ? 'text-primary' 
                      : 'text-muted-foreground/50'
                }`}
              >
                {index < currentStep ? (
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                ) : index === currentStep ? (
                  <Circle className="w-4 h-4 text-primary fill-primary" />
                ) : (
                  <Circle className="w-4 h-4" />
                )}
                <span className="text-xs font-medium whitespace-nowrap">{step.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Step 1: Project Type */}
        {currentStep === 0 && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-display font-bold text-foreground mb-2">
                What kind of project is this?
              </h2>
              <p className="text-muted-foreground">
                Select the type that best describes your project
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {PROJECT_TYPES.map((type) => {
                const Icon = PROJECT_TYPE_ICONS[type.id] || Target;
                const isSelected = selectedType === type.id;
                
                return (
                  <Card 
                    key={type.id}
                    className={`cursor-pointer transition-all duration-300 hover:border-primary/50 ${
                      isSelected 
                        ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
                        : 'border-border/50 hover:bg-card/80'
                    }`}
                    onClick={() => setSelectedType(type.id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                          isSelected 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-primary/10 text-primary'
                        }`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground mb-1">{type.name}</h3>
                          <p className="text-sm text-muted-foreground">{type.description}</p>
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
        {currentStep === 1 && (
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
                    Project Name
                  </label>
                  <Input
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="e.g., Celadon Q1 Expansion"
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
                
                <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-sm text-muted-foreground">
                    Chief of Staff will help fill in any gaps
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 3: Quick Scoping Questions */}
        {currentStep === 2 && selectedProjectType && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-display font-bold text-foreground mb-2">
                Quick scoping
              </h2>
              <p className="text-muted-foreground">
                Answer these questions to help scope your project
              </p>
            </div>
            
            <Card className="border-border/50 max-w-2xl mx-auto">
              <CardContent className="p-8">
                {selectedProjectType.quickQuestions.map((q: { question: string; type: 'yes-no' | 'choice' | 'voice'; options?: string[] }, index: number) => {
                  if (index !== currentQuestionIndex) return null;
                  
                  return (
                    <div key={index} className="space-y-6">
                      <div className="flex items-center justify-between mb-4">
                        <Badge variant="outline" className="border-primary/30 text-primary">
                          Question {index + 1} of {selectedProjectType.quickQuestions.length}
                        </Badge>
                        {q.type === 'voice' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={isListening ? stopListening : startListening}
                            className={`border-primary/30 ${isListening ? 'bg-primary/10 text-primary' : ''}`}
                          >
                            {isListening ? <MicOff className="w-4 h-4 mr-2" /> : <Mic className="w-4 h-4 mr-2" />}
                            {isListening ? 'Stop' : 'Voice'}
                          </Button>
                        )}
                      </div>
                      
                      <h3 className="text-xl font-semibold text-foreground">
                        {q.question}
                      </h3>
                      
                      {q.type === 'yes-no' && (
                        <div className="flex gap-4">
                          <Button
                            variant={questionAnswers[index] === 'Yes' ? 'default' : 'outline'}
                            className="flex-1 h-14 text-lg"
                            onClick={() => handleQuestionAnswer('Yes')}
                          >
                            Yes
                          </Button>
                          <Button
                            variant={questionAnswers[index] === 'No' ? 'default' : 'outline'}
                            className="flex-1 h-14 text-lg"
                            onClick={() => handleQuestionAnswer('No')}
                          >
                            No
                          </Button>
                        </div>
                      )}
                      
                      {q.type === 'choice' && q.options && (
                        <div className="grid grid-cols-2 gap-3">
                          {q.options.map((option: string) => (
                            <Button
                              key={option}
                              variant={questionAnswers[index] === option ? 'default' : 'outline'}
                              className="h-12"
                              onClick={() => handleQuestionAnswer(option)}
                            >
                              {option}
                            </Button>
                          ))}
                        </div>
                      )}
                      
                      {q.type === 'voice' && (
                        <div className="space-y-4">
                          <Textarea
                            value={questionAnswers[index] || transcript || ''}
                            onChange={(e) => setQuestionAnswers(prev => ({ ...prev, [index]: e.target.value }))}
                            placeholder="Speak or type your answer..."
                            className="min-h-[100px] bg-background border-border/50 focus:border-primary"
                          />
                          <Button
                            onClick={() => handleQuestionAnswer(questionAnswers[index] || transcript)}
                            disabled={!questionAnswers[index] && !transcript}
                            className="w-full"
                          >
                            Continue
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 4: SME Team */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-display font-bold text-foreground mb-2">
                Your Expert Team
              </h2>
              <p className="text-muted-foreground">
                These SMEs have been assigned based on your project type
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
              {blueprints.slice(0, 1).flatMap((blueprint: typeof blueprints[0]) => 
                blueprint.smeTeam.map((sme: { role: string; expertId: string; expertName: string; responsibility: string }, index: number) => (
                  <Card key={index} className="border-border/50">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 border border-primary/30 flex items-center justify-center">
                          <span className="text-lg font-bold text-primary">
                            {sme.expertName.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-foreground">{sme.expertName}</h3>
                            <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                              {sme.role}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{sme.responsibility}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
            
            <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20 max-w-xl mx-auto">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">
                You can add or change team members after launch
              </span>
            </div>
          </div>
        )}

        {/* Step 5: Deliverables */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-display font-bold text-foreground mb-2">
                Project Deliverables
              </h2>
              <p className="text-muted-foreground">
                What you'll receive from this project
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
              {blueprints.map((blueprint: typeof blueprints[0]) => (
                <Card key={blueprint.id} className="border-border/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <FileText className="w-5 h-5 text-primary" />
                      {blueprint.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ul className="space-y-2">
                      {blueprint.standardDeliverables.map((deliverable: string, index: number) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                          <span>{deliverable}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border/50">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        Est. {blueprint.estimatedDuration}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Step 6: Review & Launch */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-display font-bold text-foreground mb-2">
                Ready to Launch
              </h2>
              <p className="text-muted-foreground">
                Review your project details and launch
              </p>
            </div>
            
            <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-purple-500/5 max-w-2xl mx-auto">
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-4 pb-6 border-b border-border/50">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 border border-primary/30 flex items-center justify-center">
                      <Rocket className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-display font-bold text-foreground">{projectName}</h3>
                      <p className="text-muted-foreground">{selectedProjectType?.name}</p>
                    </div>
                  </div>
                  
                  {projectDescription && (
                    <div>
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Description</label>
                      <p className="text-foreground mt-1">{projectDescription}</p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Team Size</label>
                      <p className="text-foreground mt-1">{blueprints[0]?.smeTeam.length || 0} SMEs assigned</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Deliverables</label>
                      <p className="text-foreground mt-1">{blueprints.reduce((acc: number, b: typeof blueprints[0]) => acc + b.standardDeliverables.length, 0)} items</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 p-4 rounded-xl bg-primary/10 border border-primary/20">
                    <Shield className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">QA Checkpoints Enabled</p>
                      <p className="text-xs text-muted-foreground">Chief of Staff will manage quality gates</p>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handleLaunchProject}
                    className="w-full h-14 text-lg bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90"
                  >
                    <Rocket className="w-5 h-5 mr-2" />
                    Launch Project
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-12 pt-6 border-t border-border/50">
          <Button
            variant="outline"
            onClick={handlePrevStep}
            disabled={currentStep === 0}
            className="border-border/50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          {currentStep < WIZARD_STEPS.length - 1 && (
            <Button
              onClick={handleNextStep}
              disabled={!canProceed()}
              className="bg-primary hover:bg-primary/90"
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
