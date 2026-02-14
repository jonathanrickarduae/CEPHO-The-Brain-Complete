import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Plus, Workflow, Clock, CheckCircle, AlertCircle, Play } from 'lucide-react';

interface Workflow {
  id: string;
  name: string;
  skillType: string;
  status: string;
  currentPhase: number;
  currentStep: number;
  createdAt: string;
  updatedAt: string;
}

export default function WorkflowsPage() {
  const [, setLocation] = useLocation();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    try {
      const response = await fetch('/api/workflows');
      const data = await response.json();
      if (data.success) {
        setWorkflows(data.workflows || []);
      }
    } catch (error) {
      console.error('Failed to fetch workflows:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'in_progress':
        return <Play className="w-5 h-5 text-blue-500" />;
      case 'paused':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Workflow className="w-5 h-5 text-gray-400" />;
    }
  };

  const getSkillTypeLabel = (skillType: string) => {
    const labels: Record<string, string> = {
      project_genesis: 'Project Genesis',
      ai_sme: 'AI-SME Consultation',
      quality_gates: 'Quality Gates',
      due_diligence: 'Due Diligence',
      financial_modeling: 'Financial Modeling',
      data_room: 'Data Room',
      digital_twin: 'Digital Twin',
    };
    return labels[skillType] || skillType;
  };

  const filteredWorkflows = workflows.filter(w => {
    if (filter === 'all') return true;
    return w.status === filter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fuchsia-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Workflows</h1>
          <p className="text-gray-400">Manage your process workflows and track progress</p>
        </div>
        <button
          onClick={() => setLocation('/workflows/new')}
          className="flex items-center gap-2 px-4 py-2 bg-fuchsia-500 hover:bg-fuchsia-600 text-white rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Workflow
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {['all', 'not_started', 'in_progress', 'paused', 'completed', 'failed'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === status
                ? 'bg-fuchsia-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {status.replace('_', ' ').charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Workflows Grid */}
      {filteredWorkflows.length === 0 ? (
        <div className="text-center py-12">
          <Workflow className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No workflows found</h3>
          <p className="text-gray-500 mb-6">
            {filter === 'all' 
              ? 'Get started by creating your first workflow'
              : `No ${filter.replace('_', ' ')} workflows`
            }
          </p>
          {filter === 'all' && (
            <button
              onClick={() => setLocation('/workflows/new')}
              className="px-6 py-3 bg-fuchsia-500 hover:bg-fuchsia-600 text-white rounded-lg transition-colors"
            >
              Create Workflow
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorkflows.map((workflow) => (
            <div
              key={workflow.id}
              onClick={() => setLocation(`/workflows/${workflow.id}`)}
              className="bg-gray-800 rounded-lg p-6 hover:bg-gray-750 transition-colors cursor-pointer border border-gray-700"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getStatusIcon(workflow.status)}
                  <div>
                    <h3 className="text-lg font-semibold text-white">{workflow.name}</h3>
                    <p className="text-sm text-gray-400">{getSkillTypeLabel(workflow.skillType)}</p>
                  </div>
                </div>
              </div>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
                  <span>Phase {workflow.currentPhase}</span>
                  <span>Step {workflow.currentStep}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-fuchsia-500 h-2 rounded-full transition-all"
                    style={{ width: `${(workflow.currentStep / 24) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    workflow.status === 'completed'
                      ? 'bg-green-500/20 text-green-400'
                      : workflow.status === 'in_progress'
                      ? 'bg-blue-500/20 text-blue-400'
                      : workflow.status === 'paused'
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : workflow.status === 'failed'
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-gray-500/20 text-gray-400'
                  }`}
                >
                  {workflow.status.replace('_', ' ')}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(workflow.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
