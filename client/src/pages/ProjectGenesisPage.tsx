// @ts-nocheck
import React, { useState, useEffect } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  FileText,
  Plus,
  ChevronRight,
  Sparkles,
  Clock,
  Check,
  DollarSign,
  Shield,
  BarChart3,
  Loader2,
  Rocket,
  TrendingUp,
  Layers,
  ArrowRight,
} from "lucide-react";
import { GenesisBlueprintWizard } from "@/components/business-plan/GenesisBlueprintWizard";
import { BlueprintQMS } from "@/components/business-plan/BlueprintQMS";
import { SocialMediaBlueprint } from "@/components/business-plan/SocialMediaBlueprint";
import { PresentationBlueprint } from "@/components/business-plan/PresentationBlueprint";
import { GenesisBlueprint } from "@/data/genesis-blueprint.data";
import {
  ValueChainProgress,
  ValueChainProgressCompact,
} from "@/components/ai-agents/ValueChainProgress";
import {
  valueChainPhases,
  type ProjectPhaseProgress,
  type ProjectPhaseStatus,
} from "@/data/value-chain.data";

import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

type ViewMode =
  | "dashboard"
  | "voice_intake"
  | "new_project"
  | "team_assembly"
  | "idea_scoring"
  | "validation"
  | "qms"
  | "legacy"
  | "social_media"
  | "presentation"
  | "financial"
  | "process_log"
  | "value_chain"
  | "blueprints"
  | "edit_blueprint";

interface ProjectBlueprint {
  templateId: string;
  templateName: string;
  phase: string;
  status: "draft" | "in_progress" | "review" | "approved";
  completedSections: number;
  totalSections: number;
}

interface SavedProject {
  id: string;
  name: string;
  status: GenesisBlueprint["status"];
  industry: string;
  createdAt: Date;
  updatedAt: Date;
  completionPercentage: number;
  // Value Chain tracking
  currentPhaseId: number;
  phaseProgress: ProjectPhaseProgress[];
  // Blueprint tracking
  blueprints?: ProjectBlueprint[];
}

export default function ProjectGenesisPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("dashboard");
  const [currentBlueprint, setCurrentBlueprint] =
    useState<Partial<GenesisBlueprint> | null>(null);

  // ===== NEW: Real API Integration =====
  // Fetch projects from backend
  const {
    data: apiProjects,
    isLoading: projectsLoading,
    refetch: refetchProjects,
  } = trpc.projectGenesis.listProjects.useQuery(undefined, {
    retry: 0,
    retryDelay: 0,
  });

  // Timeout to prevent infinite spinner if DB is unavailable
  const [loadingTimedOut, setLoadingTimedOut] = React.useState(false);
  React.useEffect(() => {
    if (projectsLoading) {
      const timer = setTimeout(() => setLoadingTimedOut(true), 3000);
      return () => clearTimeout(timer);
    } else {
      setLoadingTimedOut(false);
    }
  }, [projectsLoading]);

  // Create project mutation
  const createProjectMutation = trpc.projectGenesis.initiate.useMutation({
    onSuccess: data => {
      const agentMsg = data.assignedAgent
        ? ` ${data.assignedAgent.name} (${data.assignedAgent.role}) has been assigned as your lead agent.`
        : "";
      toast.success(`Project "${data.name}" created successfully!${agentMsg}`);
      refetchProjects();
    },
    onError: error => {
      toast.error(`Failed to create project: ${error.message}`);
    },
  });

  // Update phase mutation
  const updatePhaseMutation = trpc.projectGenesis.updatePhase.useMutation({
    onSuccess: () => {
      toast.success("Phase updated successfully!");
      refetchProjects();
      refetchPhases();
    },
    onError: error => {
      toast.error(`Failed to update phase: ${error.message}`);
    },
  });

  // Toggle quality gate check mutation
  const toggleCheckMutation =
    trpc.projectGenesis.toggleQualityCheck.useMutation({
      onSuccess: () => {
        refetchPhases();
      },
      onError: error => {
        toast.error(`Failed to update check: ${error.message}`);
      },
    });

  // Selected project ID for phase detail query — updated via useEffect (never during render)
  const [selectedProjectId, setSelectedProjectId] = React.useState<
    number | null
  >(null);
  // Fetch phases with completedChecks for the selected project
  const { data: projectPhasesData, refetch: refetchPhases } =
    trpc.projectGenesis.getProjectPhases.useQuery(
      { projectId: selectedProjectId! },
      { enabled: selectedProjectId !== null, refetchOnWindowFocus: false }
    );
  // Sync selectedProjectId when currentBlueprint changes (safe: in useEffect, not during render)
  React.useEffect(() => {
    if (currentBlueprint?.id != null) {
      setSelectedProjectId(Number(currentBlueprint.id));
    }
  }, [currentBlueprint?.id]);

  // Transform API data to match existing interface
  const [savedProjects, setSavedProjects] = useState<SavedProject[]>([]);

  useEffect(() => {
    if (apiProjects) {
      const transformed = apiProjects.map(project => ({
        id: project.id,
        name: project.name,
        status: project.status as GenesisBlueprint["status"],
        industry: project.industry,
        createdAt: new Date(project.createdAt),
        updatedAt: new Date(project.updatedAt),
        completionPercentage: project.completionPercentage,
        currentPhaseId: project.currentPhase,
        phaseProgress: valueChainPhases.map(phase => ({
          phaseId: phase.id,
          status:
            phase.id < project.currentPhase
              ? ("approved" as ProjectPhaseStatus)
              : phase.id === project.currentPhase
                ? ("in_progress" as ProjectPhaseStatus)
                : ("not_started" as ProjectPhaseStatus),
          completedChecks: [],
          startedAt:
            phase.id <= project.currentPhase
              ? new Date(project.createdAt)
              : undefined,
          completedAt:
            phase.id < project.currentPhase
              ? new Date(project.updatedAt)
              : undefined,
        })),
      }));
      setSavedProjects(transformed);
    }
  }, [apiProjects]);

  // ===== END: Real API Integration =====

  const handleBlueprintComplete = async (
    blueprint: Partial<GenesisBlueprint>
  ) => {
    setCurrentBlueprint(blueprint);

    // Create project via API
    try {
      const newProject = await createProjectMutation.mutateAsync({
        name: blueprint.name || "Untitled Project",
        industry: blueprint.businessInfo?.industry || "Unknown",
        description: blueprint.businessInfo?.description || "",
        targetMarket: blueprint.businessInfo?.targetMarket || "",
        uniqueValue: blueprint.businessInfo?.uniqueValue || "",
      });

      toast.success(
        `Project "${newProject.name}" created! Redirecting to dashboard...`
      );

      // Wait a moment for the success message, then go back to dashboard
      setTimeout(() => {
        setViewMode("dashboard");
      }, 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (
        msg.includes("10001") ||
        msg.toLowerCase().includes("login") ||
        msg.toLowerCase().includes("unauthorized")
      ) {
        toast.error(
          "Session not active. Please ensure PIN_GATE_ONLY is enabled on the server, then refresh and try again."
        );
      } else {
        toast.error(`Failed to create project: ${msg}`);
      }
    }
  };

  const getStatusColor = (status: GenesisBlueprint["status"]) => {
    switch (status) {
      case "draft":
        return "bg-gray-500/20 text-foreground/80";
      case "in_progress":
        return "bg-primary/20 text-blue-300";
      case "in_review":
        return "bg-yellow-500/20 text-yellow-300";
      case "approved":
        return "bg-green-500/20 text-green-300";
      default:
        return "bg-gray-500/20 text-foreground/80";
    }
  };

  const getStatusIcon = (status: GenesisBlueprint["status"]) => {
    switch (status) {
      case "draft":
        return <FileText className="w-4 h-4" />;
      case "in_progress":
        return <Clock className="w-4 h-4" />;
      case "in_review":
        return <Sparkles className="w-4 h-4" />;
      case "approved":
        return <Check className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  // Rest of the component remains the same...
  // (Keep all existing UI rendering logic)

  return (
    <PageShell
      icon={Brain}
      title="Project Genesis"
      subtitle="6-Phase Venture Development Framework"
      actions={
        viewMode === "dashboard" ? (
          <Button
            size="sm"
            onClick={() => setViewMode("new_project")}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
            disabled={createProjectMutation.isLoading}
          >
            {createProjectMutation.isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-1" />
                New Project
              </>
            )}
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setViewMode("dashboard")}
          >
            ← Back
          </Button>
        )
      }
      fillHeight
    >
      {viewMode === "dashboard" && (
        <div className="space-y-5">
          {/* Stats Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Total Projects",   value: savedProjects.length,                                                                                  icon: Layers,     color: "text-cyan-400",   bg: "bg-cyan-500/15" },
              { label: "In Progress",      value: savedProjects.filter(p => p.status === "in_progress").length,                                           icon: TrendingUp,  color: "text-blue-400",   bg: "bg-blue-500/15" },
              { label: "In Review",        value: savedProjects.filter(p => p.status === "in_review").length,                                             icon: Sparkles,   color: "text-yellow-400", bg: "bg-yellow-500/15" },
              { label: "Approved",         value: savedProjects.filter(p => p.status === "approved").length,                                              icon: Check,      color: "text-green-400",  bg: "bg-green-500/15" },
            ].map(stat => (
              <div key={stat.label} className="bg-card/50 border border-border/50 rounded-xl p-4 flex items-center gap-3">
                <div className={`p-2.5 rounded-lg ${stat.bg} shrink-0`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-2xl font-bold leading-none">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Loading State */}
          {projectsLoading && !loadingTimedOut && (
            <div className="grid gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-card/50 rounded-xl border border-border/50 p-6 space-y-4 animate-pulse"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="h-5 w-48 bg-muted rounded" />
                      <div className="h-4 w-64 bg-muted rounded" />
                    </div>
                    <div className="h-6 w-20 bg-muted rounded" />
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full" />
                  <div className="flex gap-2">
                    <div className="h-8 w-24 bg-muted rounded" />
                    <div className="h-8 w-24 bg-muted rounded" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Projects List */}
          {!projectsLoading && savedProjects.length > 0 && (
            <div className="grid gap-3">
              {savedProjects.map(project => (
                <div
                  key={project.id}
                  className="bg-card/50 backdrop-blur-sm rounded-xl border border-border/50 p-5 hover:border-purple-500/40 hover:bg-card/70 transition-all cursor-pointer group"
                  onClick={() => {
                    setCurrentBlueprint({ id: project.id, name: project.name, status: project.status });
                    setViewMode("qms");
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                        <h3 className="text-base font-semibold text-foreground truncate">{project.name}</h3>
                        <Badge className={`${getStatusColor(project.status)} flex items-center gap-1 text-[11px] py-0`}>
                          {getStatusIcon(project.status)}
                          <span className="capitalize">{project.status.replace("_", " ")}</span>
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">
                        {project.industry} · Created {project.createdAt.toLocaleDateString()}
                      </p>
                      {/* Progress Bar */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                            style={{ width: `${project.completionPercentage}%` }}
                          />
                        </div>
                        <span className="text-xs text-purple-400 font-medium shrink-0">{project.completionPercentage}%</span>
                      </div>
                      <ValueChainProgressCompact
                        phaseProgress={project.phaseProgress}
                        currentPhaseId={project.currentPhaseId}
                      />
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-muted-foreground shrink-0 mt-1 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {(!projectsLoading || loadingTimedOut) && savedProjects.length === 0 && (
            <div className="rounded-2xl border border-dashed border-purple-500/30 bg-purple-500/5 p-10 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-500/15">
                <Rocket className="h-8 w-8 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                Turn an idea from the Innovation Hub into a structured 6-phase venture plan. Agent1 will guide each phase.
              </p>
              <Button
                onClick={() => setViewMode("new_project")}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
              >
                <Plus className="w-4 h-4 mr-2" />
                Start Your First Project
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Other view modes remain the same */}
      {viewMode === "new_project" && (
        <GenesisBlueprintWizard
          onComplete={handleBlueprintComplete}
          onCancel={() => setViewMode("dashboard")}
        />
      )}

      {viewMode === "qms" &&
        currentBlueprint &&
        (() => {
          const qmsProject = savedProjects.find(
            p => String(p.id) === String(currentBlueprint.id)
          );
          // Merge completedChecks and real status from live DB data into phaseProgress
          const enrichedPhaseProgress: ProjectPhaseProgress[] =
            qmsProject?.phaseProgress.map(pp => {
              const livePhase = projectPhasesData?.find(
                lp => lp.phaseNumber === pp.phaseId
              );
              // Use real DB status if available
              const realStatus: ProjectPhaseStatus = livePhase
                ? livePhase.status === "completed"
                  ? "approved"
                  : livePhase.status === "in_progress"
                    ? "in_progress"
                    : livePhase.status === "blocked"
                      ? "blocked"
                      : "not_started"
                : pp.status;
              return {
                ...pp,
                status: realStatus,
                completedChecks:
                  livePhase?.completedChecks ?? pp.completedChecks,
              };
            }) ?? [];
          // Determine current phase from enriched data (first in_progress, or first not_started)
          const currentPhaseFromDb =
            enrichedPhaseProgress.find(p => p.status === "in_progress")
              ?.phaseId ??
            enrichedPhaseProgress.find(p => p.status === "not_started")
              ?.phaseId ??
            qmsProject?.currentPhaseId ??
            1;
          return (
            <div className="space-y-6 max-w-7xl mx-auto">
              {/* Back button */}
              <Button
                variant="outline"
                onClick={() => setViewMode("dashboard")}
                className="mb-2"
              >
                ← Back to Projects
              </Button>
              {/* Phase Progression — wired to live updatePhase endpoint */}
              {qmsProject && (
                <ValueChainProgress
                  phaseProgress={enrichedPhaseProgress}
                  currentPhaseId={currentPhaseFromDb}
                  projectName={qmsProject.name}
                  onStartPhase={phaseId => {
                    updatePhaseMutation.mutate({
                      projectId: Number(qmsProject.id),
                      phaseNumber: phaseId,
                      status: "in_progress",
                    });
                  }}
                  onRequestReview={phaseId => {
                    updatePhaseMutation.mutate({
                      projectId: Number(qmsProject.id),
                      phaseNumber: phaseId,
                      status: "completed",
                    });
                  }}
                  onToggleCheck={(phaseId, checkLabel) => {
                    toggleCheckMutation.mutate({
                      projectId: Number(qmsProject.id),
                      phaseNumber: phaseId,
                      checkLabel,
                    });
                  }}
                />
              )}
              <BlueprintQMS
                genesisBlueprint={currentBlueprint as GenesisBlueprint}
                pendingChanges={[]}
                onApplyChanges={(_changes, _cascadeTargets) => {
                  toast.success("Changes applied successfully!");
                }}
                onRejectChanges={_changeIds => {
                  toast.info("Changes rejected");
                }}
                onViewBlueprint={blueprintId => {
                  if (blueprintId === "edit") {
                    setViewMode("edit_blueprint");
                  } else if (blueprintId === "presentation") {
                    setViewMode("presentation");
                  } else if (blueprintId === "social") {
                    setViewMode("social_media");
                  } else if (blueprintId === "financial") {
                    setViewMode("financial");
                  } else {
                    toast.info(`Opening ${blueprintId} blueprint...`);
                  }
                }}
              />
            </div>
          );
        })()}

      {viewMode === "edit_blueprint" && currentBlueprint && (
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <Button
              onClick={() => setViewMode("qms")}
              variant="outline"
              className="mb-4"
            >
              ← Back to QMS
            </Button>
          </div>
          <GenesisBlueprintWizard
            initialData={currentBlueprint as GenesisBlueprint}
            onComplete={blueprint => {
              toast.success("Blueprint updated!");
              setCurrentBlueprint(blueprint);
              setViewMode("qms");
            }}
            onCancel={() => setViewMode("qms")}
          />
        </div>
      )}

      {viewMode === "presentation" && currentBlueprint && (
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <Button
              onClick={() => setViewMode("qms")}
              variant="outline"
              className="mb-4"
            >
              ← Back to QMS
            </Button>
          </div>
          <PresentationBlueprint
            genesisBlueprint={currentBlueprint as GenesisBlueprint}
            onComplete={() => {
              toast.success("Presentation generated!");
              setViewMode("qms");
            }}
          />
        </div>
      )}

      {viewMode === "social_media" && currentBlueprint && (
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <Button
              onClick={() => setViewMode("qms")}
              variant="outline"
              className="mb-4"
            >
              ← Back to QMS
            </Button>
          </div>
          <SocialMediaBlueprint
            genesisBlueprint={currentBlueprint as GenesisBlueprint}
            onComplete={() => {
              toast.success("Social media plan created!");
              setViewMode("qms");
            }}
          />
        </div>
      )}

      {/* Add other view mode components as needed */}
    </PageShell>
  );
}
