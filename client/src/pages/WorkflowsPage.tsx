import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  Plus,
  Workflow,
  Clock,
  CheckCircle,
  AlertCircle,
  Play,
  ArrowRight,
} from "lucide-react";

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
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    try {
      const response = await fetch("/api/workflows");
      const data = await response.json();
      if (data.success) {
        setWorkflows(data.workflows || []);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case "in_progress":
        return <Play className="w-5 h-5 text-primary" />;
      case "paused":
        return <Clock className="w-5 h-5 text-yellow-400" />;
      case "failed":
        return <AlertCircle className="w-5 h-5 text-destructive" />;
      default:
        return <Workflow className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      case "in_progress":
        return "bg-primary/10 text-primary border-primary/20";
      case "paused":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      case "failed":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getSkillTypeLabel = (skillType: string) => {
    const labels: Record<string, string> = {
      project_genesis: "Project Genesis",
      ai_sme: "AI-SME Consultation",
      quality_gates: "Quality Gates",
      due_diligence: "Due Diligence",
      financial_modeling: "Financial Modeling",
      data_room: "Data Room",
      digital_twin: "Digital Twin",
    };
    return labels[skillType] || skillType;
  };

  const filteredWorkflows = workflows.filter(w => {
    if (filter === "all") return true;
    return w.status === filter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
              Workflows
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Manage your process workflows and track progress
            </p>
          </div>
          <button
            onClick={() => setLocation("/workflows/new")}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">New Workflow</span>
            <span className="sm:hidden">New</span>
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-6">
        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {["all", "not_started", "in_progress", "paused", "completed", "failed"].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                filter === status
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-card text-muted-foreground hover:bg-muted hover:text-foreground border border-border"
              }`}
            >
              {status === "all"
                ? "All"
                : status.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
            </button>
          ))}
        </div>

        {/* Workflows Grid */}
        {filteredWorkflows.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-8 sm:p-12 text-center">
            <Workflow className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
              No workflows found
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-6">
              {filter === "all"
                ? "Get started by creating your first workflow"
                : `No workflows with status "${filter.replace("_", " ")}"`}
            </p>
            {filter === "all" && (
              <button
                onClick={() => setLocation("/workflows/new")}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors font-medium"
              >
                <Plus className="w-5 h-5" />
                Create Workflow
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredWorkflows.map(workflow => (
              <button
                key={workflow.id}
                onClick={() => setLocation(`/workflows/${workflow.id}`)}
                className="group bg-card border border-border hover:border-primary/50 rounded-xl p-4 sm:p-6 text-left transition-all hover:shadow-lg hover:translate-y-[-2px]"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(workflow.status)}
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {workflow.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                        {getSkillTypeLabel(workflow.skillType)}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-all group-hover:translate-x-1" />
                </div>

                {/* Status Badge */}
                <div
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border mb-4 ${getStatusColor(workflow.status)}`}
                >
                  {workflow.status.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
                </div>

                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs sm:text-sm text-muted-foreground">
                    <span>Phase {workflow.currentPhase}</span>
                    <span>Step {workflow.currentStep}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${(workflow.currentStep / 10) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-4 pt-4 border-t border-border flex justify-between text-xs text-muted-foreground">
                  <span>Created {new Date(workflow.createdAt).toLocaleDateString()}</span>
                  <span>Updated {new Date(workflow.updatedAt).toLocaleDateString()}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
