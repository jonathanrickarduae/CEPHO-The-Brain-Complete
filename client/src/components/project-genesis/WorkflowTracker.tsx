import {
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight,
  FileText,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface PhaseStatus {
  phaseNumber: number;
  phaseName: string;
  status:
    | "pending"
    | "in_progress"
    | "awaiting_cos_review"
    | "awaiting_user_approval"
    | "needs_revision"
    | "completed";
  startedAt?: Date;
  completedAt?: Date;
  deliverables: {
    name: string;
    status: "generated" | "reviewed" | "approved";
    content: string;
  }[];
  cosFeedback?: string;
  userFeedback?: string;
}

interface WorkflowTrackerProps {
  projectId: string;
  phases: PhaseStatus[];
  onCOSReview?: (
    phaseNumber: number,
    approved: boolean,
    feedback: string
  ) => void;
  onUserApprove?: (
    phaseNumber: number,
    approved: boolean,
    feedback: string
  ) => void;
  onViewDeliverable?: (deliverable: Record<string, unknown>) => void;
  userRole: "user" | "cos";
}

export function WorkflowTracker({
  phases,
  onCOSReview,
  onUserApprove,
  onViewDeliverable,
  userRole,
}: WorkflowTrackerProps) {
  const getStatusColor = (status: PhaseStatus["status"]) => {
    switch (status) {
      case "completed":
        return "text-emerald-400 bg-emerald-500/20 border-emerald-500/50";
      case "in_progress":
        return "text-primary bg-primary/20 border-blue-500/50";
      case "awaiting_cos_review":
        return "text-amber-400 bg-amber-500/20 border-amber-500/50";
      case "awaiting_user_approval":
        return "text-purple-400 bg-purple-500/20 border-purple-500/50";
      case "needs_revision":
        return "text-red-400 bg-red-500/20 border-red-500/50";
      default:
        return "text-muted-foreground bg-card border-border";
    }
  };

  const getStatusIcon = (status: PhaseStatus["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-5 h-5" />;
      case "in_progress":
        return <Clock className="w-5 h-5 animate-spin" />;
      case "awaiting_cos_review":
      case "awaiting_user_approval":
        return <AlertCircle className="w-5 h-5 animate-pulse" />;
      case "needs_revision":
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5 opacity-50" />;
    }
  };

  const getStatusLabel = (status: PhaseStatus["status"]) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "in_progress":
        return "In Progress";
      case "awaiting_cos_review":
        return "Awaiting COS Review";
      case "awaiting_user_approval":
        return "Awaiting Your Approval";
      case "needs_revision":
        return "Needs Revision";
      default:
        return "Pending";
    }
  };

  return (
    <div className="space-y-6">
      {/* Workflow Progress Bar */}
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-muted-foreground">
            PROJECT WORKFLOW
          </h3>
          <span className="text-xs text-muted-foreground">
            Phase {phases.filter(p => p.status === "completed").length} of{" "}
            {phases.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {phases.map((phase, idx) => (
            <div key={phase.phaseNumber} className="flex-1 flex items-center">
              <div
                className={`flex-1 h-2 rounded-full transition-all duration-500 ${
                  phase.status === "completed"
                    ? "bg-emerald-500"
                    : phase.status === "in_progress" ||
                        phase.status === "awaiting_cos_review" ||
                        phase.status === "awaiting_user_approval"
                      ? "bg-blue-500 animate-pulse"
                      : "bg-border"
                }`}
              />
              {idx < phases.length - 1 && (
                <ChevronRight className="w-4 h-4 text-muted-foreground mx-1" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Phase Cards */}
      <div className="space-y-4">
        {phases.map(phase => (
          <div
            key={phase.phaseNumber}
            className={`border-2 rounded-xl p-6 transition-all duration-300 ${getStatusColor(phase.status)}`}
          >
            {/* Phase Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-background/50">
                  {getStatusIcon(phase.status)}
                </div>
                <div>
                  <h3 className="text-lg font-bold">
                    Phase {phase.phaseNumber}: {phase.phaseName}
                  </h3>
                  <p className="text-sm opacity-70">
                    {getStatusLabel(phase.status)}
                  </p>
                </div>
              </div>
              {phase.status === "completed" && phase.completedAt && (
                <span className="text-xs opacity-70">
                  Completed {new Date(phase.completedAt).toLocaleDateString()}
                </span>
              )}
            </div>

            {/* Deliverables */}
            {phase.deliverables.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold mb-2">Deliverables:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {phase.deliverables.map((deliverable, idx) => (
                    <button
                      key={idx}
                      onClick={() => onViewDeliverable?.(deliverable)}
                      className="flex items-center gap-2 p-3 rounded-lg bg-background/50 hover:bg-background/70 transition-colors text-left"
                    >
                      <FileText className="w-4 h-4" />
                      <span className="text-sm flex-1">{deliverable.name}</span>
                      <Download className="w-4 h-4 opacity-50" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* COS Feedback */}
            {phase.cosFeedback && (
              <div className="mb-4 p-3 rounded-lg bg-background/50">
                <p className="text-xs font-semibold mb-1">
                  Chief of Staff Feedback:
                </p>
                <p className="text-sm opacity-80">{phase.cosFeedback}</p>
              </div>
            )}

            {/* User Feedback */}
            {phase.userFeedback && (
              <div className="mb-4 p-3 rounded-lg bg-background/50">
                <p className="text-xs font-semibold mb-1">Your Feedback:</p>
                <p className="text-sm opacity-80">{phase.userFeedback}</p>
              </div>
            )}

            {/* Action Buttons */}
            {phase.status === "awaiting_cos_review" &&
              userRole === "cos" &&
              onCOSReview && (
                <div className="flex gap-2">
                  <Button
                    onClick={() => onCOSReview(phase.phaseNumber, true, "")}
                    className="flex-1 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                  >
                    Approve & Send to User
                  </Button>
                  <Button
                    onClick={() =>
                      onCOSReview(phase.phaseNumber, false, "Needs revision")
                    }
                    className="flex-1 bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
                  >
                    Request Revisions
                  </Button>
                </div>
              )}

            {phase.status === "awaiting_user_approval" &&
              userRole === "user" &&
              onUserApprove && (
                <div className="flex gap-2">
                  <Button
                    onClick={() => onUserApprove(phase.phaseNumber, true, "")}
                    className="flex-1 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                  >
                    Approve & Continue to Next Phase
                  </Button>
                  <Button
                    onClick={() =>
                      onUserApprove(phase.phaseNumber, false, "Needs revision")
                    }
                    className="flex-1 bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
                  >
                    Send Back for Revision
                  </Button>
                </div>
              )}

            {phase.status === "in_progress" && (
              <div className="flex items-center gap-2 text-sm opacity-70">
                <Clock className="w-4 h-4 animate-spin" />
                <span>AI is generating deliverables...</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
