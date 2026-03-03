import { useParams, useLocation } from "wouter";
import { PageShell } from "@/components/layout/PageShell";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  ArrowLeft,
  Play,
  Pause,
  CheckCircle,
  Clock,
  FileText,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

export default function WorkflowDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();

  const {
    data: workflow,
    isLoading,
    refetch,
  } = trpc.workflows.get.useQuery({ id: id ?? "" }, { enabled: !!id });

  // Determine the current in-progress step number
  const currentStepNumber =
    workflow?.steps?.find(s => s.status === "in_progress")?.phaseNumber ?? null;

  const { data: stepGuidance } = trpc.workflows.getStepGuidance.useQuery(
    { workflowId: id ?? "", stepNumber: currentStepNumber ?? 1 },
    { enabled: !!id && currentStepNumber !== null }
  );

  const startMutation = trpc.workflows.start.useMutation({
    onSuccess: () => refetch(),
  });
  const pauseMutation = trpc.workflows.pause.useMutation({
    onSuccess: () => refetch(),
  });
  const resumeMutation = trpc.workflows.resume.useMutation({
    onSuccess: () => refetch(),
  });

  const handleStart = async () => {
    if (!id) return;
    try {
      await startMutation.mutateAsync({ id });
      toast.success("Workflow started");
    } catch {
      toast.error("Failed to start workflow");
    }
  };

  const handlePause = async () => {
    if (!id) return;
    try {
      await pauseMutation.mutateAsync({ id });
      toast.success("Workflow paused");
    } catch {
      toast.error("Failed to pause workflow");
    }
  };

  const handleResume = async () => {
    if (!id) return;
    try {
      await resumeMutation.mutateAsync({ id });
      toast.success("Workflow resumed");
    } catch {
      toast.error("Failed to resume workflow");
    }
  };

  const getStepStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "in_progress":
        return <Play className="w-5 h-5 text-primary" />;
      case "failed":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-muted-foreground" />;
    }
  };

  if (isLoading || !workflow) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <RefreshCw className="animate-spin h-10 w-10 text-primary" />
      </div>
    );
  }

  const steps = workflow.steps ?? [];
  const completedSteps = steps.filter(s => s.status === "completed").length;
  const totalSteps = steps.length;
  const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;
  const currentStep = steps.find(s => s.status === "in_progress");

  return (
    <PageShell
      icon={FileText}
      title={workflow.name}
      subtitle={workflow.status
        .replace(/_/g, " ")
        .replace(/\b\w/g, l => l.toUpperCase())}
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLocation("/workflows")}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground border border-border rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          {workflow.status === "not_started" && (
            <button
              onClick={handleStart}
              disabled={startMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors disabled:opacity-50"
            >
              <Play className="w-5 h-5" />
              Start
            </button>
          )}
          {workflow.status === "in_progress" && (
            <button
              onClick={handlePause}
              disabled={pauseMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <Pause className="w-5 h-5" />
              Pause
            </button>
          )}
          {workflow.status === "paused" && (
            <button
              onClick={handleResume}
              disabled={resumeMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-primary/80 hover:bg-primary text-primary-foreground rounded-lg transition-colors disabled:opacity-50"
            >
              <Play className="w-5 h-5" />
              Resume
            </button>
          )}
        </div>
      }
      fillHeight
    >
      <div className="space-y-6">
        {/* Progress Bar */}
        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">
                Overall Progress
              </h3>
              <p className="text-sm text-muted-foreground">
                {completedSteps} of {totalSteps} phases completed
              </p>
            </div>
            <div className="text-3xl font-bold text-primary">
              {Math.round(progress)}%
            </div>
          </div>
          <div className="w-full bg-muted rounded-full h-3">
            <div
              className="bg-primary h-3 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Steps List */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              Workflow Phases
            </h2>
            <div className="space-y-4">
              {steps.map(step => (
                <div
                  key={step.phaseNumber}
                  className={`bg-card rounded-lg p-6 border ${
                    step.status === "in_progress"
                      ? "border-fuchsia-500"
                      : "border-border"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {getStepStatusIcon(step.status)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-foreground">
                          {step.phaseNumber}. {step.phaseName}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            step.status === "completed"
                              ? "bg-green-500/20 text-green-400"
                              : step.status === "in_progress"
                                ? "bg-primary/20 text-primary"
                                : "bg-gray-500/20 text-muted-foreground"
                          }`}
                        >
                          {step.status.replace(/_/g, " ")}
                        </span>
                      </div>
                      {step.completedAt && (
                        <p className="text-sm text-muted-foreground">
                          Completed{" "}
                          {new Date(step.completedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {steps.length === 0 && (
                <div className="bg-card rounded-lg p-8 border border-border text-center text-muted-foreground">
                  No phases found. Start the workflow to initialise phases.
                </div>
              )}
            </div>
          </div>

          {/* Current Step Guidance */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">
              Current Phase
            </h2>
            {currentStep && stepGuidance ? (
              <div className="bg-card rounded-lg p-6 border border-border sticky top-4">
                <h3 className="text-xl font-semibold text-foreground mb-4">
                  {currentStep.phaseName}
                </h3>

                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase mb-2">
                    Guidance
                  </h4>
                  <p className="text-foreground/80 whitespace-pre-line">
                    {stepGuidance.guidance}
                  </p>
                </div>

                {stepGuidance.recommendations.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase mb-2">
                      Recommendations
                    </h4>
                    <ul className="space-y-2">
                      {stepGuidance.recommendations.map(
                        (rec: string, index: number) => (
                          <li
                            key={index}
                            className="flex items-start gap-2 text-foreground/80"
                          >
                            <span className="text-primary mt-1">•</span>
                            <span>{rec}</span>
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}

                {stepGuidance.deliverables.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase mb-2">
                      Deliverables
                    </h4>
                    <ul className="space-y-2">
                      {stepGuidance.deliverables.map(
                        (deliverable: string, index: number) => (
                          <li
                            key={index}
                            className="flex items-center gap-2 text-foreground/80"
                          >
                            <FileText className="w-4 h-4 text-primary" />
                            <span>{deliverable}</span>
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-card rounded-lg p-6 border border-border text-center">
                <p className="text-muted-foreground">
                  No active phase. Start the workflow to begin.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
