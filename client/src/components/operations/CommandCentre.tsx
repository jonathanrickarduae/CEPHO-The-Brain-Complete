import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import {
  ExternalLink,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  AlertCircle,
  Users,
  Target,
  Activity,
  ChevronRight,
  RefreshCw,
} from "lucide-react";

export function CommandCentre() {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  const { data: projectsData, isLoading: projectsLoading } =
    trpc.projects.list.useQuery({ limit: 50 });
  const { data: tasksData } = trpc.tasks.list.useQuery({ limit: 100 });

  const liveProjects = projectsData ?? [];
  const liveTasks = tasksData ?? [];

  // Derive KPI counts from live data
  const activeProjects = liveProjects.filter(p => p.status === "active").length;
  const onTrackProjects = liveProjects.filter(
    p => p.status === "active" && (p.progress ?? 0) >= 50
  ).length;
  const atRiskProjects = liveProjects.filter(
    p => p.status === "at-risk" || p.status === "delayed"
  ).length;
  const completedTasks = liveTasks.filter(t => t.status === "completed").length;
  const totalTasks = liveTasks.length;
  const avgProgress =
    liveProjects.length > 0
      ? Math.round(
          liveProjects.reduce((s, p) => s + (p.progress ?? 0), 0) /
            liveProjects.length
        )
      : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
      case "on-track":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "at-risk":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "delayed":
      case "blocked":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "completed":
        return "bg-primary/20 text-primary border-blue-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
      case "completed":
        return <CheckCircle2 className="w-4 h-4" />;
      case "at-risk":
        return <AlertCircle className="w-4 h-4" />;
      case "delayed":
      case "blocked":
        return <Clock className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getPriorityBadge = (priority: string | null) => {
    switch (priority) {
      case "high":
        return (
          <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
            High Priority
          </Badge>
        );
      case "medium":
        return (
          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
            Medium
          </Badge>
        );
      case "low":
        return (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            Low
          </Badge>
        );
      default:
        return null;
    }
  };

  if (projectsLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <RefreshCw className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <Button
          variant="outline"
          className="h-auto p-6 flex-col items-start bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/30 hover:border-cyan-500/50 transition-all"
        >
          <div className="flex items-center justify-between w-full mb-2">
            <Target className="w-8 h-8 text-[var(--brain-cyan)]" />
            <ChevronRight className="w-5 h-5 text-[var(--brain-cyan)]/50" />
          </div>
          <p className="text-sm text-muted-foreground">Active Projects</p>
          <p className="text-3xl font-bold text-[var(--brain-cyan)]">
            {activeProjects}
          </p>
        </Button>

        <Button
          variant="outline"
          className="h-auto p-6 flex-col items-start bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30 hover:border-green-500/50 transition-all"
        >
          <div className="flex items-center justify-between w-full mb-2">
            <CheckCircle2 className="w-8 h-8 text-green-400" />
            <ChevronRight className="w-5 h-5 text-green-400/50" />
          </div>
          <p className="text-sm text-muted-foreground">On Track</p>
          <p className="text-3xl font-bold text-green-400">{onTrackProjects}</p>
        </Button>

        <Button
          variant="outline"
          className="h-auto p-6 flex-col items-start bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30 hover:border-yellow-500/50 transition-all"
        >
          <div className="flex items-center justify-between w-full mb-2">
            <AlertCircle className="w-8 h-8 text-yellow-400" />
            <ChevronRight className="w-5 h-5 text-yellow-400/50" />
          </div>
          <p className="text-sm text-muted-foreground">At Risk / Delayed</p>
          <p className="text-3xl font-bold text-yellow-400">{atRiskProjects}</p>
        </Button>

        <Button
          variant="outline"
          className="h-auto p-6 flex-col items-start bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30 hover:border-purple-500/50 transition-all"
        >
          <div className="flex items-center justify-between w-full mb-2">
            <Activity className="w-8 h-8 text-purple-400" />
            <ChevronRight className="w-5 h-5 text-purple-400/50" />
          </div>
          <p className="text-sm text-muted-foreground">Avg Progress</p>
          <p className="text-3xl font-bold text-purple-400">{avgProgress}%</p>
        </Button>
      </div>

      {/* Task Summary */}
      {totalTasks > 0 && (
        <div className="bg-card rounded-lg p-4 border border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            <span className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">
                {completedTasks}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-foreground">
                {totalTasks}
              </span>{" "}
              tasks completed
            </span>
          </div>
          <Progress
            value={totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}
            className="w-32 h-2"
          />
        </div>
      )}

      {/* Projects Grid */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
          <Target className="w-6 h-6 text-[var(--brain-cyan)]" />
          Project Status
        </h2>

        {liveProjects.length === 0 ? (
          <div className="bg-card rounded-lg p-12 border border-border text-center">
            <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium text-foreground mb-2">
              No projects yet
            </p>
            <p className="text-sm text-muted-foreground">
              Create your first project in Project Genesis to see it here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:gap-4">
            {liveProjects.map(project => (
              <Button
                key={project.id}
                variant="outline"
                className={`h-auto p-6 flex-col items-start text-left bg-gray-900/50 border-border hover:border-cyan-500/50 transition-all ${
                  selectedProject === String(project.id)
                    ? "ring-2 ring-cyan-500 border-[var(--brain-cyan)]"
                    : ""
                }`}
                onClick={() =>
                  setSelectedProject(
                    String(project.id) === selectedProject
                      ? null
                      : String(project.id)
                  )
                }
              >
                <div className="w-full space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between w-full">
                    <div className="flex-1 space-y-2">
                      <h3 className="text-lg font-semibold text-foreground">
                        {project.name}
                      </h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        {getPriorityBadge(project.priority)}
                        <Badge
                          className={`${getStatusColor(project.status)} border`}
                        >
                          <span className="flex items-center gap-1">
                            {getStatusIcon(project.status)}
                            {project.status.replace(/-/g, " ")}
                          </span>
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="w-full">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-bold text-[var(--brain-cyan)]">
                        {project.progress ?? 0}%
                      </span>
                    </div>
                    <Progress
                      value={project.progress ?? 0}
                      className="h-3 bg-card"
                    />
                  </div>

                  {/* Meta Info */}
                  <div className="flex items-center justify-between text-sm w-full">
                    {project.dueDate && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>
                          Due: {new Date(project.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>
                        Created{" "}
                        {new Date(project.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {selectedProject === String(project.id) &&
                    project.description && (
                      <div className="pt-4 border-t border-border space-y-3 w-full">
                        <p className="text-sm text-muted-foreground">
                          {project.description}
                        </p>
                      </div>
                    )}
                </div>
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Team Performance — derived from tasks */}
      {liveTasks.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <Users className="w-6 h-6 text-[var(--brain-cyan)]" />
            Task Breakdown
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {(["not_started", "in_progress", "completed"] as const).map(
              status => {
                const count = liveTasks.filter(t => t.status === status).length;
                const pct =
                  totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0;
                const labels: Record<string, string> = {
                  not_started: "Not Started",
                  in_progress: "In Progress",
                  completed: "Completed",
                };
                const colors: Record<string, string> = {
                  not_started: "text-yellow-400",
                  in_progress: "text-blue-400",
                  completed: "text-green-400",
                };
                return (
                  <div
                    key={status}
                    className="bg-card rounded-lg p-4 border border-border"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">
                        {labels[status]}
                      </span>
                      <span className={`text-2xl font-bold ${colors[status]}`}>
                        {count}
                      </span>
                    </div>
                    <Progress value={pct} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {pct}% of all tasks
                    </p>
                  </div>
                );
              }
            )}
          </div>
        </div>
      )}
    </div>
  );
}
