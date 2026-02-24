import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Rocket, CheckCircle2, Circle, ChevronRight, ChevronLeft,
  FileText, Download, Upload, AlertCircle, Sparkles, Loader2
} from 'lucide-react';
import { useLocation, useParams } from 'wouter';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

// Import the workflow definition
const PROJECT_GENESIS_PHASES = [
  {
    phaseNumber: 1,
    phaseName: 'Discovery',
    steps: [
      { stepNumber: 1, stepName: 'Market Research', description: 'Conduct comprehensive market research to identify opportunities and validate market size', deliverables: ['Market Research Report'] },
      { stepNumber: 2, stepName: 'Competitor Analysis', description: 'Analyze competitors to understand competitive landscape and identify differentiation opportunities', deliverables: ['Competitor Analysis Matrix'] },
      { stepNumber: 3, stepName: 'Customer Discovery', description: 'Conduct customer interviews and surveys to validate problem and solution fit', deliverables: ['Customer Personas', 'Interview Insights Report'] },
      { stepNumber: 4, stepName: 'Problem Validation', description: 'Validate that the identified problem is significant and worth solving', deliverables: ['Problem Validation Report'] },
    ],
  },
  {
    phaseNumber: 2,
    phaseName: 'Definition',
    steps: [
      { stepNumber: 5, stepName: 'Business Model Canvas', description: 'Define business model using Business Model Canvas framework', deliverables: ['Business Model Canvas'] },
      { stepNumber: 6, stepName: 'Value Proposition', description: 'Craft compelling value proposition that resonates with target customers', deliverables: ['Value Proposition Canvas'] },
      { stepNumber: 7, stepName: 'Revenue Model', description: 'Define revenue streams and pricing strategy', deliverables: ['Revenue Model Document'] },
      { stepNumber: 8, stepName: 'Financial Projections', description: 'Create 3-5 year financial projections', deliverables: ['Financial Projections Spreadsheet'] },
    ],
  },
  {
    phaseNumber: 3,
    phaseName: 'Design',
    steps: [
      { stepNumber: 9, stepName: 'Feature Prioritization', description: 'Prioritize features for MVP using MoSCoW or similar framework', deliverables: ['Feature Prioritization Matrix'] },
      { stepNumber: 10, stepName: 'UX Design', description: 'Design user experience and create wireframes', deliverables: ['Wireframes', 'User Flow Diagrams'] },
      { stepNumber: 11, stepName: 'Technical Architecture', description: 'Define technical architecture and technology stack', deliverables: ['Technical Architecture Document'] },
      { stepNumber: 12, stepName: 'Prototype Development', description: 'Build clickable prototype or proof of concept', deliverables: ['Interactive Prototype'] },
    ],
  },
  {
    phaseNumber: 4,
    phaseName: 'Development',
    steps: [
      { stepNumber: 13, stepName: 'MVP Development', description: 'Build minimum viable product with core features', deliverables: ['MVP Application'] },
      { stepNumber: 14, stepName: 'Quality Assurance', description: 'Test MVP for bugs and usability issues', deliverables: ['QA Test Report'] },
      { stepNumber: 15, stepName: 'User Testing', description: 'Conduct user testing sessions with target customers', deliverables: ['User Testing Report'] },
      { stepNumber: 16, stepName: 'Iteration', description: 'Iterate on MVP based on user feedback', deliverables: ['Iteration Report'] },
    ],
  },
  {
    phaseNumber: 5,
    phaseName: 'Deployment',
    steps: [
      { stepNumber: 17, stepName: 'Go-to-Market Strategy', description: 'Define go-to-market strategy and launch plan', deliverables: ['Go-to-Market Plan'] },
      { stepNumber: 18, stepName: 'Marketing Plan', description: 'Create comprehensive marketing plan and materials', deliverables: ['Marketing Plan', 'Marketing Materials'] },
      { stepNumber: 19, stepName: 'Sales Strategy', description: 'Define sales process and build sales pipeline', deliverables: ['Sales Playbook'] },
      { stepNumber: 20, stepName: 'Partnership Development', description: 'Identify and establish strategic partnerships', deliverables: ['Partnership Strategy Document'] },
    ],
  },
  {
    phaseNumber: 6,
    phaseName: 'Delivery',
    steps: [
      { stepNumber: 21, stepName: 'Launch Execution', description: 'Execute launch plan and go live', deliverables: ['Launch Report'] },
      { stepNumber: 22, stepName: 'Performance Monitoring', description: 'Monitor key metrics and performance indicators', deliverables: ['KPI Dashboard'] },
      { stepNumber: 23, stepName: 'Customer Acquisition', description: 'Execute customer acquisition strategy', deliverables: ['Customer Acquisition Report'] },
      { stepNumber: 24, stepName: 'Scaling Strategy', description: 'Plan and execute scaling strategy', deliverables: ['Scaling Plan Document'] },
    ],
  },
];

export default function ProjectGenesisWizard() {
  const [, navigate] = useLocation();
  const params = useParams();
  const workflowId = params.workflowId;

  const [currentPhase, setCurrentPhase] = useState(1);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Record<number, any>>({});

  // Load workflow if workflowId exists
  const { data: workflow, isLoading: isLoadingWorkflow } = trpc.workflows.get.useQuery(
    { id: workflowId || '' },
    { enabled: !!workflowId }
  );

  // Load workflow data when available
  useEffect(() => {
    if (workflow) {
      setCurrentPhase(workflow.currentPhase);
      setCurrentStep(workflow.currentStep);
      
      // Load form data from workflow steps
      const stepData: Record<number, any> = {};
      workflow.steps?.forEach((step: any) => {
        if (step.formData) {
          stepData[step.stepNumber] = step.formData;
        }
      });
      setFormData(stepData);
    }
  }, [workflow]);

  // Mutations
  const updateStepMutation = trpc.workflows.updateStep.useMutation();
  const updateProgressMutation = trpc.workflows.updateProgress.useMutation();
  const completeStepMutation = trpc.workflows.completeStep.useMutation();
  const generateDeliverableMutation = trpc.workflows.generateDeliverable.useMutation({
    onSuccess: (data) => {
      toast.success(`Generated: ${data.deliverableName}`);
      // TODO: Show deliverable content in modal
      console.log('Deliverable content:', data.content);
    },
    onError: (error) => {
      toast.error(`Failed to generate: ${error.message}`);
    },
  });

  const phase = PROJECT_GENESIS_PHASES.find(p => p.phaseNumber === currentPhase);
  const step = phase?.steps.find(s => s.stepNumber === currentStep);
  const stepIndex = phase?.steps.findIndex(s => s.stepNumber === currentStep) || 0;
  const isLastStepInPhase = stepIndex === (phase?.steps.length || 0) - 1;
  const isLastPhase = currentPhase === PROJECT_GENESIS_PHASES.length;

  const handleNext = async () => {
    // Save current step data
    if (workflowId && formData[currentStep]) {
      await updateStepMutation.mutateAsync({
        workflowId,
        stepNumber: currentStep,
        formData: formData[currentStep],
        status: 'completed',
      });

      await completeStepMutation.mutateAsync({
        workflowId,
        stepNumber: currentStep,
      });
    }

    // Move to next step
    if (isLastStepInPhase) {
      if (!isLastPhase) {
        const nextPhase = currentPhase + 1;
        const nextStep = PROJECT_GENESIS_PHASES[currentPhase].steps[0].stepNumber;
        setCurrentPhase(nextPhase);
        setCurrentStep(nextStep);

        if (workflowId) {
          await updateProgressMutation.mutateAsync({
            id: workflowId,
            currentPhase: nextPhase,
            currentStep: nextStep,
            progress: Math.round((nextStep / 24) * 100),
          });
        }
      }
    } else {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);

      if (workflowId) {
        await updateProgressMutation.mutateAsync({
          id: workflowId,
          currentPhase,
          currentStep: nextStep,
          progress: Math.round((nextStep / 24) * 100),
        });
      }
    }
  };

  const handlePrevious = () => {
    if (stepIndex === 0) {
      if (currentPhase > 1) {
        const prevPhase = PROJECT_GENESIS_PHASES[currentPhase - 2];
        setCurrentPhase(currentPhase - 1);
        setCurrentStep(prevPhase.steps[prevPhase.steps.length - 1].stepNumber);
      }
    } else {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    const newFormData = {
      ...formData,
      [currentStep]: {
        ...formData[currentStep],
        [field]: value,
      },
    };
    setFormData(newFormData);

    // Auto-save to backend if workflow exists
    if (workflowId) {
      updateStepMutation.mutate({
        workflowId,
        stepNumber: currentStep,
        formData: newFormData[currentStep],
      });
    }
  };

  const generateDeliverable = (deliverable: string) => {
    if (!workflowId) {
      toast.error('Please save workflow first');
      return;
    }

    generateDeliverableMutation.mutate({
      workflowId,
      stepNumber: currentStep,
      deliverableName: deliverable,
    });
  };

  const progress = Math.round((currentStep / 24) * 100);

  if (isLoadingWorkflow) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/workflows')}
            className="mb-4 text-gray-400 hover:text-white"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Workflows
          </Button>
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Rocket className="w-10 h-10 text-cyan-400" />
            {workflow?.name || 'Project Genesis Wizard'}
          </h1>
          <p className="text-gray-400">
            6-Phase Venture Development Process
          </p>
        </div>

        {/* Progress Bar */}
        <Card className="bg-gray-800/50 border-gray-700/50 p-6 mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Overall Progress</span>
            <span className="text-sm font-semibold text-cyan-400">{progress}%</span>
          </div>
          <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden mb-4">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Phase {currentPhase}/6: {phase?.phaseName}</span>
            <span>Step {currentStep}/24</span>
          </div>
        </Card>

        {/* Phase Navigation */}
        <div className="grid grid-cols-6 gap-2 mb-8">
          {PROJECT_GENESIS_PHASES.map((p) => (
            <div
              key={p.phaseNumber}
              className={`p-3 rounded-lg border transition-all cursor-pointer ${
                p.phaseNumber === currentPhase
                  ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
                  : p.phaseNumber < currentPhase
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                  : 'bg-gray-800/30 border-gray-700/50 text-gray-500'
              }`}
              onClick={() => {
                setCurrentPhase(p.phaseNumber);
                setCurrentStep(p.steps[0].stepNumber);
              }}
            >
              <div className="text-xs font-semibold mb-1">Phase {p.phaseNumber}</div>
              <div className="text-xs">{p.phaseName}</div>
            </div>
          ))}
        </div>

        {/* Step Content */}
        <Card className="bg-gray-800/30 border-gray-700/50 p-8 mb-8">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="bg-cyan-500/20 text-cyan-400 border-cyan-500/50">
                Step {currentStep}
              </Badge>
              <h2 className="text-2xl font-bold text-white">{step?.stepName}</h2>
            </div>
            <p className="text-gray-400">{step?.description}</p>
          </div>

          {/* Step Form */}
          <div className="space-y-6">
            {/* Dynamic form fields based on step */}
            {currentStep === 1 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Target Market Definition
                  </label>
                  <Textarea
                    placeholder="Describe your target market..."
                    className="bg-gray-900/50 border-gray-700 text-white"
                    rows={4}
                    value={formData[currentStep]?.target_market || ''}
                    onChange={(e) => handleInputChange('target_market', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Market Size Estimate (TAM, SAM, SOM)
                  </label>
                  <Input
                    placeholder="e.g., TAM: $10B, SAM: $1B, SOM: $100M"
                    className="bg-gray-900/50 border-gray-700 text-white"
                    value={formData[currentStep]?.market_size || ''}
                    onChange={(e) => handleInputChange('market_size', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Key Market Trends
                  </label>
                  <Textarea
                    placeholder="List key trends affecting your market..."
                    className="bg-gray-900/50 border-gray-700 text-white"
                    rows={4}
                    value={formData[currentStep]?.trends || ''}
                    onChange={(e) => handleInputChange('trends', e.target.value)}
                  />
                </div>
              </>
            )}

            {/* Generic form for other steps */}
            {currentStep !== 1 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Notes & Findings
                  </label>
                  <Textarea
                    placeholder={`Enter your notes for ${step?.stepName}...`}
                    className="bg-gray-900/50 border-gray-700 text-white"
                    rows={6}
                    value={formData[currentStep]?.notes || ''}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Upload Supporting Documents
                  </label>
                  <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center hover:border-cyan-500/50 transition-all cursor-pointer">
                    <Upload className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-500 mt-1">PDF, DOC, XLS, or images</p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Deliverables */}
          {step?.deliverables && step.deliverables.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-400" />
                Deliverables
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {step.deliverables.map((deliverable, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700/50"
                  >
                    <span className="text-sm text-gray-300">{deliverable}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => generateDeliverable(deliverable)}
                      disabled={generateDeliverableMutation.isLoading}
                      className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/20"
                    >
                      {generateDeliverableMutation.isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Generate
                        </>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentPhase === 1 && stepIndex === 0}
            className="border-gray-600 hover:border-cyan-500 hover:text-cyan-400"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          <Button
            onClick={handleNext}
            disabled={currentPhase === 6 && isLastStepInPhase}
            className="bg-cyan-500 hover:bg-cyan-600 text-white"
          >
            {isLastStepInPhase && isLastPhase ? 'Complete' : 'Next'}
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
