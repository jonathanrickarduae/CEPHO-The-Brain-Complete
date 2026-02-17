import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import {
  ArrowLeft,
  Play,
  Pause,
  CheckCircle,
  Clock,
  FileText,
  Download,
  AlertCircle,
} from 'lucide-react';

interface Workflow {
  id: string;
  name: string;
  skillType: string;
  status: string;
  currentPhase: number;
  currentStep: number;
  data: Record<string, any>;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

interface WorkflowStep {
  id: string;
  workflowId: string;
  stepNumber: number;
  stepName: string;
  status: string;
  data: Record<string, any>;
  completedAt: string | null;
  createdAt: string;
}

interface StepGuidance {
  guidance: string;
  recommendations: string[];
  deliverables: string[];
}

export default function WorkflowDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [currentStepGuidance, setCurrentStepGuidance] = useState<StepGuidance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchWorkflow();
      fetchSteps();
    }
  }, [id]);

  const fetchWorkflow = async () => {
    try {
      const response = await fetch(`/api/workflows/${id}`);
      const data = await response.json();
      if (data.success) {
        setWorkflow(data.workflow);
      }
    } catch (error) {
      console.error('Failed to fetch workflow:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSteps = async () => {
    try {
      const response = await fetch(`/api/workflows/${id}/steps`);
      const data = await response.json();
      if (data.success) {
        setSteps(data.steps || []);
        
        // Fetch guidance for current step
        const currentStep = data.steps.find((s: WorkflowStep) => s.status === 'in_progress');
        if (currentStep) {
          fetchStepGuidance(currentStep.id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch steps:', error);
    }
  };

  const fetchStepGuidance = async (stepId: string) => {
    try {
      const response = await fetch(`/api/workflows/${id}/steps/${stepId}/guidance`);
      const data = await response.json();
      if (data.success) {
        setCurrentStepGuidance({
          guidance: data.guidance,
          recommendations: data.recommendations,
          deliverables: data.deliverables,
        });
      }
    } catch (error) {
      console.error('Failed to fetch step guidance:', error);
    }
  };

  const handleStartWorkflow = async () => {
    try {
      const response = await fetch(`/api/workflows/${id}/start`, { method: 'POST' });
      const data = await response.json();
      if (data.success) {
        fetchWorkflow();
        fetchSteps();
      }
    } catch (error) {
      console.error('Failed to start workflow:', error);
    }
  };

  const handlePauseWorkflow = async () => {
    try {
      const response = await fetch(`/api/workflows/${id}/pause`, { method: 'POST' });
      const data = await response.json();
      if (data.success) {
        fetchWorkflow();
      }
    } catch (error) {
      console.error('Failed to pause workflow:', error);
    }
  };

  const handleResumeWorkflow = async () => {
    try {
      const response = await fetch(`/api/workflows/${id}/resume`, { method: 'POST' });
      const data = await response.json();
      if (data.success) {
        fetchWorkflow();
      }
    } catch (error) {
      console.error('Failed to resume workflow:', error);
    }
  };

  const getStepStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'in_progress':
        return <Play className="w-5 h-5 text-blue-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-gray-400" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  if (loading || !workflow) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fuchsia-500"></div>
      </div>
    );
  }

  const currentStep = steps.find(s => s.status === 'in_progress');
  const completedSteps = steps.filter(s => s.status === 'completed').length;
  const totalSteps = steps.length;
  const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => setLocation('/workflows')}
          className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-400" />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-white mb-2">{workflow.name}</h1>
          <p className="text-gray-400">
            {workflow.skillType.replace('_', ' ').charAt(0).toUpperCase() + 
             workflow.skillType.slice(1).replace('_', ' ')}
          </p>
        </div>
        <div className="flex gap-2">
          {workflow.status === 'not_started' && (
            <button
              onClick={handleStartWorkflow}
              className="flex items-center gap-2 px-4 py-2 bg-fuchsia-500 hover:bg-fuchsia-600 text-white rounded-lg transition-colors"
            >
              <Play className="w-5 h-5" />
              Start
            </button>
          )}
          {workflow.status === 'in_progress' && (
            <button
              onClick={handlePauseWorkflow}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors"
            >
              <Pause className="w-5 h-5" />
              Pause
            </button>
          )}
          {workflow.status === 'paused' && (
            <button
              onClick={handleResumeWorkflow}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              <Play className="w-5 h-5" />
              Resume
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-gray-800 rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">Overall Progress</h3>
            <p className="text-sm text-gray-400">
              {completedSteps} of {totalSteps} steps completed
            </p>
          </div>
          <div className="text-3xl font-bold text-fuchsia-500">{Math.round(progress)}%</div>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3">
          <div
            className="bg-fuchsia-500 h-3 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Steps List */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold text-white mb-6">Workflow Steps</h2>
          <div className="space-y-4">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`bg-gray-800 rounded-lg p-6 border ${
                  step.status === 'in_progress'
                    ? 'border-fuchsia-500'
                    : 'border-gray-700'
                }`}
              >
                <div className="flex items-start gap-4">
                  {getStepStatusIcon(step.status)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-white">
                        {step.stepNumber}. {step.stepName}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          step.status === 'completed'
                            ? 'bg-green-500/20 text-green-400'
                            : step.status === 'in_progress'
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-gray-500/20 text-gray-400'
                        }`}
                      >
                        {step.status.replace('_', ' ')}
                      </span>
                    </div>
                    {step.completedAt && (
                      <p className="text-sm text-gray-400">
                        Completed {new Date(step.completedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Current Step Guidance */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Current Step</h2>
          {currentStep && currentStepGuidance ? (
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 sticky top-4">
              <h3 className="text-xl font-semibold text-white mb-4">{currentStep.stepName}</h3>
              
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-400 uppercase mb-2">Guidance</h4>
                <p className="text-gray-300 whitespace-pre-line">{currentStepGuidance.guidance}</p>
              </div>

              {currentStepGuidance.recommendations.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-400 uppercase mb-2">
                    Recommendations
                  </h4>
                  <ul className="space-y-2">
                    {currentStepGuidance.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2 text-gray-300">
                        <span className="text-fuchsia-500 mt-1">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {currentStepGuidance.deliverables.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-400 uppercase mb-2">
                    Deliverables
                  </h4>
                  <ul className="space-y-2">
                    {currentStepGuidance.deliverables.map((deliverable, index) => (
                      <li key={index} className="flex items-center gap-2 text-gray-300">
                        <FileText className="w-4 h-4 text-fuchsia-500" />
                        <span>{deliverable}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                onClick={() => setLocation(`/workflows/${id}/steps/${currentStep.id}`)}
                className="w-full mt-6 px-4 py-3 bg-fuchsia-500 hover:bg-fuchsia-600 text-white rounded-lg transition-colors font-semibold"
              >
                Work on This Step
              </button>
            </div>
          ) : (
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 text-center">
              <p className="text-gray-400">No active step. Start the workflow to begin.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
