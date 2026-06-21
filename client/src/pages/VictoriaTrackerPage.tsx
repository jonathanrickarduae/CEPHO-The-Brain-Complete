/**
 * VictoriaTrackerPage — Sub-Phase Auditable Dashboard
 *
 * This page provides a complete, auditable view of:
 * 1. All 13 DT-COS sub-phase tasks and their live status
 * 2. Victoria's recent autonomous actions (action log)
 * 3. Quality control check results
 * 4. Victoria's skills (SOPs) and their last run times
 * 5. Manual trigger buttons for each autonomous procedure
 *
 * Route: /victoria-tracker
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Shield,
  Brain,
  FileSearch,
  Users,
  FolderOpen,
  Calendar,
  Zap,
  BookOpen,
  BarChart3,
  Activity,
  ChevronRight,
  Play,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type TaskStatus = "not_started" | "in_progress" | "complete" | "blocked";

interface SubphaseTask {
  id: number;
  taskId: string;
  domain: string;
  title: string;
  description: string | null;
  status: string;
  commitSha: string | null;
  evidence: string | null;
  startedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: TaskStatus }) {
  const config = {
    complete: {
      icon: CheckCircle2,
      label: "Complete",
      className: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    },
    in_progress: {
      icon: Clock,
      label: "In Progress",
      className: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    },
    blocked: {
      icon: AlertTriangle,
      label: "Blocked",
      className: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    },
    not_started: {
      icon: XCircle,
      label: "Not Started",
      className: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
    },
  };
  const { icon: Icon, label, className } = config[status] ?? config.not_started;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${className}`}
    >
      <Icon size={12} />
      {label}
    </span>
  );
}

// ─── Domain Icon ──────────────────────────────────────────────────────────────
function DomainIcon({ domain }: { domain: string }) {
  const icons: Record<string, typeof Brain> = {
    Identity: Brain,
    "Quality Control": Shield,
    Calendar: Calendar,
    Projects: FolderOpen,
    Email: Zap,
    Meetings: Users,
    Documents: FileSearch,
    Delegation: Users,
    Workflows: Activity,
    Skills: BookOpen,
    Scheduler: Clock,
    Dashboard: BarChart3,
    Deployment: CheckCircle2,
  };
  const Icon = icons[domain] ?? Brain;
  return <Icon size={16} className="text-violet-400" />;
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function VictoriaTrackerPage() {
  const [activeTab, setActiveTab] = useState<
    "tasks" | "actions" | "qc" | "skills"
  >("tasks");
  const [runningAction, setRunningAction] = useState<string | null>(null);

  // Queries
  const subphaseTasks = trpc.victoria.getSubphaseTasks.useQuery();
  const actionLog = trpc.victoria.getActionLog.useQuery({ limit: 50 });
  const qcChecks = trpc.victoria.getQcChecks.useQuery({ limit: 30 });
  const skills = trpc.victoria.getSkills.useQuery();
  const stats = trpc.victoria.getStats.useQuery();

  // Mutations
  const reviewProjects = trpc.victoria.reviewProjects.useMutation();
  const reviewDocuments = trpc.victoria.reviewDocuments.useMutation();
  const delegateTasks = trpc.victoria.delegateTasks.useMutation();
  const prepareMeetingBriefs = trpc.victoria.prepareMeetingBriefs.useMutation();
  const generateBriefing = trpc.victoria.generateMorningBriefing.useMutation();
  const seedSkills = trpc.victoria.seedDefaultSkills.useMutation();

  const utils = trpc.useUtils();

  const runAction = async (actionName: string, fn: () => Promise<unknown>) => {
    setRunningAction(actionName);
    try {
      await fn();
      await utils.victoria.getActionLog.invalidate();
      await utils.victoria.getQcChecks.invalidate();
      await utils.victoria.getStats.invalidate();
    } finally {
      setRunningAction(null);
    }
  };

  // Summary stats
  const tasks = subphaseTasks.data ?? [];
  const complete = tasks.filter(
    t => (t.status as TaskStatus) === "complete"
  ).length;
  const inProgress = tasks.filter(
    t => (t.status as TaskStatus) === "in_progress"
  ).length;
  const notStarted = tasks.filter(
    t => (t.status as TaskStatus) === "not_started"
  ).length;
  const blocked = tasks.filter(
    t => (t.status as TaskStatus) === "blocked"
  ).length;
  const pct =
    tasks.length > 0 ? Math.round((complete / tasks.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center shrink-0">
            <Brain size={20} className="text-violet-400" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              Victoria — Sub-Phase Tracker
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400">
              Auditable record of all DT-COS tasks and Victoria's autonomous
              activity
            </p>
          </div>
        </div>
      </div>

      {/* Progress Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="col-span-2 md:col-span-1 bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex flex-col items-center justify-center">
          <div className="text-4xl font-bold text-violet-400">{pct}%</div>
          <div className="text-xs text-zinc-400 mt-1">Overall Complete</div>
          <div className="w-full bg-zinc-800 rounded-full h-1.5 mt-3">
            <div
              className="bg-violet-500 h-1.5 rounded-full transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
        {[
          { label: "Complete", value: complete, color: "text-emerald-400" },
          { label: "In Progress", value: inProgress, color: "text-blue-400" },
          { label: "Not Started", value: notStarted, color: "text-zinc-400" },
          { label: "Blocked", value: blocked, color: "text-amber-400" },
        ].map(s => (
          <div
            key={s.label}
            className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex flex-col items-center justify-center"
          >
            <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-zinc-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Victoria Stats */}
      {stats.data && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Autonomous Actions (30d)",
              value: stats.data.autonomousActionsLast30Days,
            },
            {
              label: "Agent Reports Approved (30d)",
              value: stats.data.agentReportsApprovedLast30Days,
            },
            {
              label: "Agent Reports Pending",
              value: stats.data.agentReportsPendingApproval,
            },
            {
              label: "SME Reviews Completed (30d)",
              value: stats.data.smeReviewsCompletedLast30Days,
            },
          ].map(s => (
            <div
              key={s.label}
              className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4"
            >
              <div className="text-2xl font-bold text-white">{s.value}</div>
              <div className="text-xs text-zinc-400 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Manual Trigger Buttons */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 mb-8">
        <h2 className="text-sm font-semibold text-zinc-300 mb-4 flex items-center gap-2">
          <Play size={14} className="text-violet-400" />
          Manual Triggers — Run Victoria's Autonomous Procedures Now
        </h2>
        <div className="flex flex-wrap gap-3">
          {[
            {
              id: "briefing",
              label: "Morning Briefing",
              fn: () =>
                runAction("briefing", () => generateBriefing.mutateAsync()),
            },
            {
              id: "projects",
              label: "Review Projects",
              fn: () =>
                runAction("projects", () => reviewProjects.mutateAsync()),
            },
            {
              id: "documents",
              label: "Review Documents",
              fn: () =>
                runAction("documents", () => reviewDocuments.mutateAsync()),
            },
            {
              id: "delegation",
              label: "Delegate Tasks",
              fn: () =>
                runAction("delegation", () => delegateTasks.mutateAsync()),
            },
            {
              id: "meetings",
              label: "Meeting Pre-Briefs",
              fn: () =>
                runAction("meetings", () => prepareMeetingBriefs.mutateAsync()),
            },
            {
              id: "skills",
              label: "Seed Default Skills",
              fn: () => runAction("skills", () => seedSkills.mutateAsync()),
            },
          ].map(btn => (
            <button
              key={btn.id}
              onClick={btn.fn}
              disabled={runningAction !== null}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-500/20 border border-violet-500/30 text-violet-300 text-sm font-medium hover:bg-violet-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {runningAction === btn.id ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : (
                <Play size={14} />
              )}
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-zinc-900/50 border border-zinc-800 rounded-xl p-1 w-fit">
        {[
          { id: "tasks" as const, label: "DT-COS Tasks", count: tasks.length },
          {
            id: "actions" as const,
            label: "Action Log",
            count: actionLog.data?.length ?? 0,
          },
          {
            id: "qc" as const,
            label: "QC Checks",
            count: qcChecks.data?.length ?? 0,
          },
          {
            id: "skills" as const,
            label: "Skills (SOPs)",
            count: skills.data?.length ?? 0,
          },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id ? "bg-violet-500/20 text-violet-300 border border-violet-500/30" : "text-zinc-400 hover:text-zinc-200"}`}
          >
            {tab.label}
            <span className="ml-2 text-xs opacity-60">({tab.count})</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "tasks" && (
        <div className="space-y-3">
          {subphaseTasks.isLoading ? (
            <div className="text-zinc-400 text-sm">Loading tasks...</div>
          ) : (
            tasks.map((task: SubphaseTask) => (
              <div
                key={task.taskId}
                className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 flex items-start gap-4"
              >
                <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <DomainIcon domain={task.domain} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <span className="text-xs font-mono text-zinc-500">
                      {task.taskId}
                    </span>
                    <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded">
                      {task.domain}
                    </span>
                    <StatusBadge status={task.status as TaskStatus} />
                  </div>
                  <div className="font-medium text-white text-sm mb-1">
                    {task.title}
                  </div>
                  {task.description && (
                    <div className="text-xs text-zinc-400 mb-2">
                      {task.description}
                    </div>
                  )}
                  {task.evidence && (
                    <div className="text-xs text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 size={12} />
                      {task.evidence}
                    </div>
                  )}
                  {task.commitSha && (
                    <div className="text-xs text-zinc-500 flex items-center gap-1 mt-1">
                      <ChevronRight size={12} />
                      Commit:{" "}
                      <code className="font-mono">
                        {task.commitSha.slice(0, 7)}
                      </code>
                    </div>
                  )}
                </div>
                <div className="text-xs text-zinc-500 text-right flex-shrink-0">
                  {task.completedAt ? (
                    <div className="text-emerald-400">
                      Completed
                      <br />
                      {new Date(task.completedAt).toLocaleDateString()}
                    </div>
                  ) : task.startedAt ? (
                    <div className="text-blue-400">
                      Started
                      <br />
                      {new Date(task.startedAt).toLocaleDateString()}
                    </div>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "actions" && (
        <div className="space-y-2">
          {actionLog.isLoading ? (
            <div className="text-zinc-400 text-sm">Loading action log...</div>
          ) : actionLog.data?.length === 0 ? (
            <div className="text-zinc-400 text-sm text-center py-12">
              No actions logged yet. Victoria will start logging actions once
              the scheduler runs.
            </div>
          ) : (
            actionLog.data?.map(action => (
              <div
                key={action.id}
                className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex items-start gap-3"
              >
                <div
                  className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${action.autonomous ? "bg-violet-400" : "bg-blue-400"}`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="text-xs font-mono text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded">
                      {action.actionType}
                    </span>
                    {action.autonomous && (
                      <span className="text-xs text-violet-400">
                        autonomous
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-white font-medium">
                    {action.actionTitle}
                  </div>
                  {(action.description ?? null) && (
                    <div className="text-xs text-zinc-400 mt-0.5">
                      {action.description}
                    </div>
                  )}
                </div>
                <div className="text-xs text-zinc-500 flex-shrink-0">
                  {new Date(action.createdAt).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "qc" && (
        <div className="space-y-2">
          {qcChecks.isLoading ? (
            <div className="text-zinc-400 text-sm">Loading QC checks...</div>
          ) : qcChecks.data?.length === 0 ? (
            <div className="text-zinc-400 text-sm text-center py-12">
              No QC checks yet. Run "Review Projects" or "Review Documents" to
              start.
            </div>
          ) : (
            qcChecks.data?.map(check => (
              <div
                key={check.id}
                className={`bg-zinc-900/50 border rounded-xl p-4 flex items-start gap-4 ${check.passed ? "border-zinc-800" : "border-amber-500/30"}`}
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-lg font-bold ${check.passed ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}`}
                >
                  {check.grade ?? "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs font-mono text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded">
                      {check.checkType}
                    </span>
                    <span
                      className={`text-xs font-medium ${check.passed ? "text-emerald-400" : "text-amber-400"}`}
                    >
                      {check.score ?? 0}/100 —{" "}
                      {check.passed ? "Passed" : "Failed"}
                    </span>
                  </div>
                  <div className="text-sm text-white font-medium">
                    {check.targetTitle ?? "Untitled"}
                  </div>
                  {Array.isArray(check.issues) && check.issues.length > 0 && (
                    <div className="text-xs text-amber-400 mt-1">
                      {(
                        check.issues as {
                          category: string;
                          description: string;
                        }[]
                      )
                        .slice(0, 2)
                        .map((issue, i) => (
                          <div key={i}>⚠ {issue.description}</div>
                        ))}
                    </div>
                  )}
                  {Array.isArray(check.recommendations) &&
                    check.recommendations.length > 0 && (
                      <div className="text-xs text-zinc-400 mt-1">
                        →{" "}
                        {(check.recommendations as string[])
                          .slice(0, 1)
                          .join("")}
                      </div>
                    )}
                </div>
                <div className="text-xs text-zinc-500 flex-shrink-0">
                  {new Date(check.checkedAt).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "skills" && (
        <div className="space-y-3">
          {skills.isLoading ? (
            <div className="text-zinc-400 text-sm">Loading skills...</div>
          ) : skills.data?.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-zinc-400 text-sm mb-4">
                No skills defined yet.
              </div>
              <button
                onClick={() =>
                  runAction("skills", () => seedSkills.mutateAsync())
                }
                disabled={runningAction !== null}
                className="px-4 py-2 rounded-lg bg-violet-500/20 border border-violet-500/30 text-violet-300 text-sm font-medium hover:bg-violet-500/30 transition-colors"
              >
                Seed Default Skills
              </button>
            </div>
          ) : (
            skills.data?.map(skill => (
              <div
                key={skill.id}
                className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded">
                        {skill.category}
                      </span>
                      <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded">
                        trigger: {skill.trigger}
                      </span>
                      {skill.isActive && (
                        <span className="text-xs text-emerald-400">active</span>
                      )}
                    </div>
                    <div className="font-medium text-white">{skill.name}</div>
                    {skill.description && (
                      <div className="text-xs text-zinc-400 mt-0.5">
                        {skill.description}
                      </div>
                    )}
                  </div>
                  <div className="text-right text-xs text-zinc-500 flex-shrink-0">
                    <div>Run count: {skill.runCount}</div>
                    {skill.lastRunAt && (
                      <div>
                        Last run:{" "}
                        {new Date(skill.lastRunAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
                {Array.isArray(skill.steps) && (
                  <div className="space-y-1">
                    {(
                      skill.steps as {
                        order: number;
                        action: string;
                        details?: string;
                      }[]
                    ).map(step => (
                      <div
                        key={step.order}
                        className="flex items-start gap-2 text-xs text-zinc-400"
                      >
                        <span className="text-violet-400 font-mono w-4 flex-shrink-0">
                          {step.order}.
                        </span>
                        <span>
                          {step.action}
                          {step.details ? ` — ${step.details}` : ""}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
