import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { 
  Rocket, CheckCircle2, Clock, AlertCircle, Play, Eye,
  TrendingUp, Shield, Brain, Users, DollarSign, FileText,
  BarChart3, ChevronRight, Loader2
} from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useLocation } from 'wouter';

interface Workflow {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'completed' | 'paused' | 'pending';
  currentPhase: number;
  currentStep: number;
  totalPhases: number;
  totalSteps: number;
  progress: number;
  createdAt: string;
  updatedAt: string;
}

const WORKFLOW_TYPES = {
  project_genesis: {
    icon: Rocket,
    label: 'Project Genesis',
    description: '6-Phase Venture Development',
    color: 'cyan',
    phases: 6,
    steps: 24,
  },
  quality_gates: {
    icon: Shield,
    label: 'Quality Gates',
    description: 'QMS Validation & Compliance',
    color: 'emerald',
    phases: 1,
    steps: 4,
  },
  digital_twin: {
    icon: Brain,
    label: 'Digital Twin',
    description: 'Daily AI Assistant',
    color: 'purple',
    phases: 1,
    steps: 4,
  },
  ai_sme: {
    icon: Users,
    label: 'AI-SME Consultation',
    description: 'Expert Consultation Process',
    color: 'amber',
    phases: 1,
    steps: 4,
  },
  due_diligence: {
    icon: FileText,
    label: 'Due Diligence',
    description: 'Comprehensive DD Process',
    color: 'blue',
    phases: 1,
    steps: 6,
  },
  financial_modeling: {
    icon: DollarSign,
    label: 'Financial Modeling',
    description: '3-5 Year Projections',
    color: 'green',
    phases: 1,
    steps: 5,
  },
};

export default function WorkflowDashboard() {
  const [, navigate] = useLocation();
  const [selectedType, setSelectedType] = useState<string | null>(null);

  // Mock data - will be replaced with real tRPC query
  const mockWorkflows: Workflow[] = [
    {
      id: '1',
      name: 'CEPHO.AI Platform Development',
      type: 'project_genesis',
      status: 'active',
      currentPhase: 2,
      currentStep: 7,
      totalPhases: 6,
      totalSteps: 24,
      progress: 29,
      createdAt: '2026-02-01',
      updatedAt: '2026-02-24',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50';
      case 'completed': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'paused': return 'bg-amber-500/20 text-amber-400 border-amber-500/50';
      case 'pending': return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Clock className="w-4 h-4" />;
      case 'completed': return <CheckCircle2 className="w-4 h-4" />;
      case 'paused': return <AlertCircle className="w-4 h-4" />;
      case 'pending': return <Loader2 className="w-4 h-4 animate-spin" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const startNewWorkflow = (type: string) => {
    // Navigate to workflow wizard
    navigate(`/workflow/${type}/new`);
  };

  const viewWorkflow = (workflowId: string, type: string) => {
    // Navigate to workflow detail
    navigate(`/workflow/${type}/${workflowId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <TrendingUp className="w-10 h-10 text-cyan-400" />
            Workflow Dashboard
          </h1>
          <p className="text-gray-400">
            Manage and track all your workflows and processes
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gray-800/50 border-gray-700/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Active Workflows</p>
                <p className="text-3xl font-bold text-white">{mockWorkflows.filter(w => w.status === 'active').length}</p>
              </div>
              <div className="p-3 rounded-lg bg-emerald-500/20">
                <Clock className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Completed</p>
                <p className="text-3xl font-bold text-white">{mockWorkflows.filter(w => w.status === 'completed').length}</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-500/20">
                <CheckCircle2 className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Avg Progress</p>
                <p className="text-3xl font-bold text-white">
                  {Math.round(mockWorkflows.reduce((sum, w) => sum + w.progress, 0) / mockWorkflows.length)}%
                </p>
              </div>
              <div className="p-3 rounded-lg bg-cyan-500/20">
                <TrendingUp className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Total Steps</p>
                <p className="text-3xl font-bold text-white">
                  {mockWorkflows.reduce((sum, w) => sum + w.totalSteps, 0)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-purple-500/20">
                <BarChart3 className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </Card>
        </div>

        {/* Start New Workflow */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Start New Workflow</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(WORKFLOW_TYPES).map(([type, config]) => {
              const Icon = config.icon;
              return (
                <Card
                  key={type}
                  className="bg-gray-800/30 border-gray-700/50 p-6 hover:border-cyan-500/50 transition-all cursor-pointer group"
                  onClick={() => startNewWorkflow(type)}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg bg-${config.color}-500/20`}>
                      <Icon className={`w-6 h-6 text-${config.color}-400`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-cyan-400 transition-colors">
                        {config.label}
                      </h3>
                      <p className="text-sm text-gray-400 mb-3">{config.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>{config.phases} Phases</span>
                        <span>•</span>
                        <span>{config.steps} Steps</span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-cyan-400 transition-colors" />
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Active Workflows */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Your Workflows</h2>
          <div className="space-y-4">
            {mockWorkflows.map((workflow) => {
              const config = WORKFLOW_TYPES[workflow.type as keyof typeof WORKFLOW_TYPES];
              const Icon = config?.icon || Rocket;
              
              return (
                <Card
                  key={workflow.id}
                  className="bg-gray-800/30 border-gray-700/50 p-6 hover:border-cyan-500/50 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg bg-${config?.color || 'cyan'}-500/20`}>
                        <Icon className={`w-6 h-6 text-${config?.color || 'cyan'}-400`} />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-1">{workflow.name}</h3>
                        <p className="text-sm text-gray-400 mb-2">{config?.label || workflow.type}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={getStatusColor(workflow.status)}>
                            {getStatusIcon(workflow.status)}
                            <span className="ml-1 capitalize">{workflow.status}</span>
                          </Badge>
                          <Badge variant="outline" className="bg-gray-700/50 text-gray-300 border-gray-600">
                            Phase {workflow.currentPhase}/{workflow.totalPhases}
                          </Badge>
                          <Badge variant="outline" className="bg-gray-700/50 text-gray-300 border-gray-600">
                            Step {workflow.currentStep}/{workflow.totalSteps}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => viewWorkflow(workflow.id, workflow.type)}
                        className="border-gray-600 hover:border-cyan-500 hover:text-cyan-400"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => viewWorkflow(workflow.id, workflow.type)}
                        className="bg-cyan-500 hover:bg-cyan-600 text-white"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Continue
                      </Button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-2">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-400">Progress</span>
                      <span className="text-cyan-400 font-semibold">{workflow.progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
                        style={{ width: `${workflow.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>Started: {new Date(workflow.createdAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>Updated: {new Date(workflow.updatedAt).toLocaleDateString()}</span>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
