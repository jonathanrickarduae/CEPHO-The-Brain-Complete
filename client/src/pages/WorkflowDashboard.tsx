// @ts-nocheck
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Rocket,
  CheckCircle2,
  Clock,
  AlertCircle,
  Play,
  Eye,
  TrendingUp,
  Shield,
  Brain,
  Users,
  DollarSign,
  FileText,
  BarChart3,
  ChevronRight,
  Loader2,
  Plus,
  X,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { toast } from "sonner";

const WORKFLOW_TYPES = {
  project_genesis: {
    icon: Rocket,
    label: "Project Genesis",
    description: "6-Phase Venture Development",
    color: "cyan",
    phases: 6,
    steps: 24,
  },
  quality_gates: {
    icon: Shield,
    label: "Quality Gates",
    description: "QMS Validation & Compliance",
    color: "emerald",
    phases: 1,
    steps: 4,
  },
  digital_twin: {
    icon: Brain,
    label: "Digital Twin",
    description: "Daily AI Assistant",
    color: "purple",
    phases: 1,
    steps: 4,
  },
  ai_sme: {
    icon: Users,
    label: "AI-SME Consultation",
    description: "Expert Consultation Process",
    color: "amber",
    phases: 1,
    steps: 4,
  },
  due_diligence: {
    icon: FileText,
    label: "Due Diligence",
    description: "Comprehensive DD Process",
    color: "blue",
    phases: 1,
    steps: 6,
  },
  financial_modeling: {
    icon: DollarSign,
    label: "Financial Modeling",
    description: "3-5 Year Projections",
    color: "green",
    phases: 1,
    steps: 5,
  },
};

export default function WorkflowDashboard() {
  const [, navigate] = useLocation();
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedWorkflowType, setSelectedWorkflowType] = useState<string>("");
  const [workflowName, setWorkflowName] = useState("");
  const [workflowDescription, setWorkflowDescription] = useState("");

  // Fetch workflows from backend
  const {
    data: workflows = [],
    isLoading,
    refetch,
  } = trpc.workflows.list.useQuery({
    status: selectedStatus === "all" ? undefined : (selectedStatus as any),
  });

  // Create workflow mutation
  const createWorkflowMutation = trpc.workflows.create.useMutation({
    onSuccess: data => {
      toast.success(`Created workflow: ${data.name}`);
      setShowCreateModal(false);
      setWorkflowName("");
      setWorkflowDescription("");
      setSelectedWorkflowType("");
      refetch();
      // Navigate to the new workflow
      navigate(`/workflow/${data.type}/${data.id}`);
    },
    onError: error => {
      toast.error(`Failed to create workflow: ${error.message}`);
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in_progress":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/50";
      case "completed":
        return "bg-blue-500/20 text-blue-400 border-blue-500/50";
      case "paused":
        return "bg-amber-500/20 text-amber-400 border-amber-500/50";
      case "not_started":
        return "bg-gray-500/20 text-gray-400 border-gray-500/50";
      case "failed":
        return "bg-red-500/20 text-red-400 border-red-500/50";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/50";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "in_progress":
        return <Clock className="w-4 h-4" />;
      case "completed":
        return <CheckCircle2 className="w-4 h-4" />;
      case "paused":
        return <AlertCircle className="w-4 h-4" />;
      case "not_started":
        return <Loader2 className="w-4 h-4" />;
      case "failed":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const handleCreateWorkflow = () => {
    if (!workflowName.trim()) {
      toast.error("Please enter a workflow name");
      return;
    }
    if (!selectedWorkflowType) {
      toast.error("Please select a workflow type");
      return;
    }

    createWorkflowMutation.mutate({
      name: workflowName,
      type: selectedWorkflowType,
      description: workflowDescription,
    });
  };

  const viewWorkflow = (workflowId: string, type: string) => {
    navigate(`/workflow/${type}/${workflowId}`);
  };

  const activeCount = workflows.filter(w => w.status === "in_progress").length;
  const completedCount = workflows.filter(w => w.status === "completed").length;
  const avgProgress =
    workflows.length > 0
      ? Math.round(
          workflows.reduce((sum, w) => sum + w.progress, 0) / workflows.length
        )
      : 0;
  const totalSteps = workflows.reduce((sum, w) => sum + w.totalSteps, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-cyan-400" />
              Workflow Dashboard
            </h1>
            <p className="text-gray-400 mt-1">
              Manage and track all your workflows and processes
            </p>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-cyan-500 hover:bg-cyan-600 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Workflow
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gray-800/50 border-gray-700/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Active Workflows</p>
                <p className="text-3xl font-bold text-white">{activeCount}</p>
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
                <p className="text-3xl font-bold text-white">
                  {completedCount}
                </p>
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
                <p className="text-3xl font-bold text-white">{avgProgress}%</p>
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
                <p className="text-3xl font-bold text-white">{totalSteps}</p>
              </div>
              <div className="p-3 rounded-lg bg-purple-500/20">
                <BarChart3 className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mb-8">
          {[
            "all",
            "not_started",
            "in_progress",
            "paused",
            "completed",
            "failed",
          ].map(status => (
            <Button
              key={status}
              variant={selectedStatus === status ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedStatus(status)}
              className={
                selectedStatus === status
                  ? "bg-cyan-500 hover:bg-cyan-600"
                  : "border-gray-600 hover:border-cyan-500"
              }
            >
              {status.replace("_", " ").charAt(0).toUpperCase() +
                status.slice(1).replace("_", " ")}
            </Button>
          ))}
        </div>

        {/* Workflows List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          </div>
        ) : workflows.length === 0 ? (
          <Card className="bg-gray-800/30 border-gray-700/50 p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 rounded-full bg-gray-700/50 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-gray-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                No workflows found
              </h3>
              <p className="text-gray-400 mb-6">
                Get started by creating your first workflow
              </p>
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-cyan-500 hover:bg-cyan-600 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Workflow
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {workflows.map(workflow => {
              const config =
                WORKFLOW_TYPES[workflow.type as keyof typeof WORKFLOW_TYPES];
              const Icon = config?.icon || Rocket;

              return (
                <Card
                  key={workflow.id}
                  className="bg-gray-800/30 border-gray-700/50 p-6 hover:border-cyan-500/50 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <div
                        className={`p-3 rounded-lg bg-${config?.color || "cyan"}-500/20`}
                      >
                        <Icon
                          className={`w-6 h-6 text-${config?.color || "cyan"}-400`}
                        />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-1">
                          {workflow.name}
                        </h3>
                        <p className="text-sm text-gray-400 mb-2">
                          {config?.label || workflow.type}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={getStatusColor(workflow.status)}
                          >
                            {getStatusIcon(workflow.status)}
                            <span className="ml-1 capitalize">
                              {workflow.status.replace("_", " ")}
                            </span>
                          </Badge>
                          <Badge
                            variant="outline"
                            className="bg-gray-700/50 text-gray-300 border-gray-600"
                          >
                            Phase {workflow.currentPhase}/{workflow.totalPhases}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="bg-gray-700/50 text-gray-300 border-gray-600"
                          >
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
                      <span className="text-cyan-400 font-semibold">
                        {workflow.progress}%
                      </span>
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
                    <span>
                      Started:{" "}
                      {new Date(workflow.createdAt).toLocaleDateString()}
                    </span>
                    <span>•</span>
                    <span>
                      Updated:{" "}
                      {new Date(workflow.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Workflow Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Create New Workflow</DialogTitle>
            <DialogDescription className="text-gray-400">
              Choose a workflow type and give it a name to get started
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Workflow Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Workflow Name *
              </label>
              <Input
                placeholder="e.g., CEPHO.AI Platform Development"
                value={workflowName}
                onChange={e => setWorkflowName(e.target.value)}
                className="bg-gray-900/50 border-gray-700 text-white"
              />
            </div>

            {/* Workflow Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description (Optional)
              </label>
              <Textarea
                placeholder="Describe the purpose of this workflow..."
                value={workflowDescription}
                onChange={e => setWorkflowDescription(e.target.value)}
                className="bg-gray-900/50 border-gray-700 text-white"
                rows={3}
              />
            </div>

            {/* Workflow Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Workflow Type *
              </label>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(WORKFLOW_TYPES).map(([type, config]) => {
                  const Icon = config.icon;
                  const isSelected = selectedWorkflowType === type;
                  return (
                    <div
                      key={type}
                      onClick={() => setSelectedWorkflowType(type)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        isSelected
                          ? "border-cyan-500 bg-cyan-500/10"
                          : "border-gray-700 bg-gray-900/30 hover:border-gray-600"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`p-2 rounded-lg bg-${config.color}-500/20`}
                        >
                          <Icon
                            className={`w-5 h-5 text-${config.color}-400`}
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-white mb-1">
                            {config.label}
                          </h4>
                          <p className="text-xs text-gray-400 mb-2">
                            {config.description}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span>{config.phases} Phases</span>
                            <span>•</span>
                            <span>{config.steps} Steps</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateModal(false)}
              className="border-gray-600 hover:border-gray-500"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateWorkflow}
              disabled={createWorkflowMutation.isLoading}
              className="bg-cyan-500 hover:bg-cyan-600 text-white"
            >
              {createWorkflowMutation.isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Workflow
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
