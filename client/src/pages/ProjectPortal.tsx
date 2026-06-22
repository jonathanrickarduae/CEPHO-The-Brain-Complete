// ProjectPortal — Command Center (redesigned)
// 4 sections: Dashboard | Actions | Finance | Strategy
// Left sidebar navigation, no horizontal tab overflow
import { useParams, useLocation } from "wouter";
import {
  ArrowLeft, Plus, Loader2, Trash2, CheckCircle2, Circle,
  AlertTriangle, DollarSign, Target, BarChart3, Calendar,
  Users, Zap, BookOpen, MessageSquare, TrendingUp, TrendingDown,
  Clock, CheckSquare, ChevronRight, Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { format, isPast, differenceInDays } from "date-fns";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const RAG: Record<string, { dot: string; label: string }> = {
  green:  { dot: "bg-emerald-500", label: "On Track" },
  amber:  { dot: "bg-amber-500",   label: "At Risk"  },
  red:    { dot: "bg-red-500",     label: "Off Track" },
};

const PRIORITY_COLOR: Record<string, string> = {
  critical: "text-red-600",
  high:     "text-orange-500",
  medium:   "text-amber-500",
  low:      "text-gray-400",
};

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard",  icon: BarChart3   },
  { id: "actions",   label: "Actions",    icon: CheckSquare },
  { id: "finance",   label: "Finance",    icon: DollarSign  },
  { id: "strategy",  label: "Strategy",   icon: Target      },
];

// ─── Sub-components ───────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, trend, accent = false }: {
  label: string; value: string | number; sub?: string;
  trend?: "up" | "down" | "neutral"; accent?: boolean;
}) {
  return (
    <div className={`rounded-xl border p-4 flex flex-col gap-1 ${accent ? "bg-black text-white border-black" : "bg-white border-border/60"}`}>
      <p className={`text-xs font-medium ${accent ? "text-white/60" : "text-muted-foreground"}`}>{label}</p>
      <p className={`text-2xl font-bold tracking-tight ${accent ? "text-white" : ""}`}>{value}</p>
      {sub && (
        <p className={`text-xs flex items-center gap-1 ${accent ? "text-white/50" : "text-muted-foreground"}`}>
          {trend === "up" && <TrendingUp className="h-3 w-3 text-emerald-500" />}
          {trend === "down" && <TrendingDown className="h-3 w-3 text-red-500" />}
          {sub}
        </p>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ProjectPortal() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const projectId = parseInt(params.id ?? "0", 10);
  const [section, setSection] = useState<"dashboard" | "actions" | "finance" | "strategy">("dashboard");

  // ── Data ──
  const { data: project, isLoading: projectLoading } = trpc.projects.get.useQuery(
    { id: projectId }, { enabled: !!projectId }
  );
  const { data: overview, refetch: refetchOverview } = trpc.projectCommandCenter.getOverview.useQuery(
    { projectId }, { enabled: !!projectId }
  );
  const { data: allTasks = [], refetch: refetchTasks } = trpc.projectCommandCenter.getTasks.useQuery(
    { projectId }, { enabled: !!projectId }
  );
  const { data: milestones = [], refetch: refetchMilestones } = trpc.projectCommandCenter.getMilestones.useQuery(
    { projectId }, { enabled: !!projectId }
  );
  const { data: finance = [], refetch: refetchFinance } = trpc.projectCommandCenter.getFinance.useQuery(
    { projectId }, { enabled: !!projectId }
  );
  const { data: risks = [], refetch: refetchRisks } = trpc.projectCommandCenter.getRisks.useQuery(
    { projectId }, { enabled: !!projectId }
  );
  const { data: comms = [], refetch: refetchComms } = trpc.projectCommandCenter.getComms.useQuery(
    { projectId }, { enabled: !!projectId }
  );
  const { data: automations = [], refetch: refetchAuto } = trpc.projectCommandCenter.getAutomation.useQuery(
    { projectId }, { enabled: !!projectId }
  );
  const { data: decisionsData = [], refetch: refetchDecisions } = trpc.decisions.getAll.useQuery(
    { projectId }, { enabled: !!projectId }
  );

  // ── Mutations ──
  const completeTask = trpc.projectCommandCenter.updateTaskStatus.useMutation({
    onSuccess: () => { refetchTasks(); refetchOverview(); }
  });
  const createTask = trpc.projectCommandCenter.createTask.useMutation({
    onSuccess: () => { refetchTasks(); refetchOverview(); toast.success("Task added"); setTaskDialog(false); resetTask(); }
  });
  const completeMilestone = trpc.projectCommandCenter.completeMilestone.useMutation({
    onSuccess: () => { refetchMilestones(); refetchOverview(); }
  });
  const upsertFinance = trpc.projectCommandCenter.upsertFinanceLine.useMutation({
    onSuccess: () => { refetchFinance(); refetchOverview(); toast.success("Finance line saved"); setFinanceDialog(false); resetFinance(); }
  });
  const deleteFinance = trpc.projectCommandCenter.deleteFinanceLine.useMutation({
    onSuccess: () => { refetchFinance(); refetchOverview(); }
  });
  const upsertRisk = trpc.projectCommandCenter.upsertRisk.useMutation({
    onSuccess: () => { refetchRisks(); refetchOverview(); toast.success("Risk saved"); setRiskDialog(false); resetRisk(); }
  });
  const createComm = trpc.projectCommandCenter.createComm.useMutation({
    onSuccess: () => { refetchComms(); toast.success("Communication logged"); setCommDialog(false); resetComm(); }
  });
  const upsertMilestone = trpc.projectCommandCenter.upsertMilestone.useMutation({
    onSuccess: () => { refetchMilestones(); toast.success("Milestone saved"); setMilestoneDialog(false); resetMilestone(); }
  });
  const createDecision = trpc.decisions.create.useMutation({
    onSuccess: () => { refetchDecisions(); toast.success("Decision logged"); setDecisionDialog(false); resetDecision(); }
  });

  // ── Dialogs ──
  const [taskDialog, setTaskDialog] = useState(false);
  const [milestoneDialog, setMilestoneDialog] = useState(false);
  const [financeDialog, setFinanceDialog] = useState(false);
  const [riskDialog, setRiskDialog] = useState(false);
  const [commDialog, setCommDialog] = useState(false);
  const [decisionDialog, setDecisionDialog] = useState(false);

  // ── Form states ──
  const [newTask, setNewTask] = useState({ title: "", description: "", priority: "medium" as const, dueDate: "", assignee: "" });
  const resetTask = () => setNewTask({ title: "", description: "", priority: "medium", dueDate: "", assignee: "" });
  const [newMilestone, setNewMilestone] = useState({ title: "", description: "", dueDate: "", owner: "", phase: "" });
  const resetMilestone = () => setNewMilestone({ title: "", description: "", dueDate: "", owner: "", phase: "" });
  const [newFinance, setNewFinance] = useState({ category: "Operations", lineItem: "", budgeted: "", actual: "", forecast: "", currency: "GBP", notes: "" });
  const resetFinance = () => setNewFinance({ category: "Operations", lineItem: "", budgeted: "", actual: "", forecast: "", currency: "GBP", notes: "" });
  const [newRisk, setNewRisk] = useState({ title: "", description: "", likelihood: "medium" as const, impact: "medium" as const, owner: "", mitigation: "" });
  const resetRisk = () => setNewRisk({ title: "", description: "", likelihood: "medium", impact: "medium", owner: "", mitigation: "" });
  const [newComm, setNewComm] = useState({ type: "note", subject: "", body: "", from: "", to: "", dueDate: "" });
  const resetComm = () => setNewComm({ type: "note", subject: "", body: "", from: "", to: "", dueDate: "" });
  const [newDecision, setNewDecision] = useState({ title: "", context: "", rationale: "", impact: "medium" as const });
  const resetDecision = () => setNewDecision({ title: "", context: "", rationale: "", impact: "medium" });

  // ── Derived ──
  const openTasks = useMemo(() => (allTasks as any[]).filter((t: any) => t.status !== "done" && t.status !== "completed"), [allTasks]);
  const overdueTasks = useMemo(() => openTasks.filter((t: any) => t.dueDate && isPast(new Date(t.dueDate))), [openTasks]);
  const tasksByAssignee = useMemo(() => {
    const map: Record<string, any[]> = { "Unassigned": [] };
    openTasks.forEach((t: any) => {
      const key = t.assignee || "Unassigned";
      if (!map[key]) map[key] = [];
      map[key].push(t);
    });
    return map;
  }, [openTasks]);

  const totalBudgeted = useMemo(() => (finance as any[]).reduce((s: number, f: any) => s + (f.budgeted ?? 0), 0), [finance]);
  const totalActual = useMemo(() => (finance as any[]).reduce((s: number, f: any) => s + (f.actual ?? 0), 0), [finance]);
  const budgetVariance = totalBudgeted - totalActual;
  const budgetBurnPct = totalBudgeted > 0 ? Math.round((totalActual / totalBudgeted) * 100) : 0;

  const highRisks = useMemo(() => (risks as any[]).filter((r: any) => r.impact === "high" || r.likelihood === "high"), [risks]);
  const upcomingMilestones = useMemo(() =>
    (milestones as any[])
      .filter((m: any) => !m.completedAt && m.dueDate)
      .sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 4),
    [milestones]
  );
  const openComms = useMemo(() => (comms as any[]).filter((c: any) => c.status === "open"), [comms]);

  if (projectLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <p className="text-muted-foreground">Project not found.</p>
        <Button variant="outline" onClick={() => setLocation("/projects")}>Back to Projects</Button>
      </div>
    );
  }

  const rag = RAG[project.status] ?? RAG.green;
  const accentColor = (project as any).accentColor ?? "#00D4FF";

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-full bg-gray-50">
      {/* ── Left sidebar ── */}
      <aside className="w-52 shrink-0 bg-white border-r border-border/60 flex flex-col">
        {/* Project identity */}
        <div className="p-4 border-b border-border/60">
          <button
            onClick={() => setLocation("/projects")}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-3 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            All Projects
          </button>
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
              style={{ backgroundColor: accentColor }}
            >
              {(project as any).initials ?? project.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{project.name}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className={`inline-block w-2 h-2 rounded-full ${rag.dot}`} />
                <span className="text-xs text-muted-foreground">{rag.label}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-2 space-y-0.5">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setSection(id as any)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all ${
                section === id
                  ? "bg-black text-white font-medium"
                  : "text-muted-foreground hover:bg-gray-100 hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
              {id === "actions" && overdueTasks.length > 0 && (
                <span className="ml-auto text-xs bg-red-500 text-white rounded-full px-1.5 py-0.5 leading-none">
                  {overdueTasks.length}
                </span>
              )}
              {id === "finance" && budgetBurnPct > 90 && (
                <span className="ml-auto text-xs bg-amber-500 text-white rounded-full px-1.5 py-0.5 leading-none">!</span>
              )}
            </button>
          ))}
        </nav>

        {/* Quick stats */}
        <div className="p-3 border-t border-border/60 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{(project as any).progress ?? 0}%</span>
          </div>
          <Progress value={(project as any).progress ?? 0} className="h-1.5" />
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 overflow-y-auto">
        {/* ── DASHBOARD ── */}
        {section === "dashboard" && (
          <div className="p-6 space-y-6 max-w-5xl">
            <div>
              <h1 className="text-xl font-bold">{project.name}</h1>
              <p className="text-sm text-muted-foreground mt-0.5">{project.description}</p>
            </div>

            {/* KPI row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <KpiCard label="Open Tasks" value={openTasks.length} sub={overdueTasks.length > 0 ? `${overdueTasks.length} overdue` : "All on track"} trend={overdueTasks.length > 0 ? "down" : "neutral"} accent />
              <KpiCard label="Budget Burn" value={`${budgetBurnPct}%`} sub={`£${totalActual.toLocaleString()} of £${totalBudgeted.toLocaleString()}`} trend={budgetBurnPct > 80 ? "down" : "neutral"} />
              <KpiCard label="High Risks" value={highRisks.length} sub={highRisks.length === 0 ? "No critical risks" : "Needs attention"} trend={highRisks.length > 0 ? "down" : "neutral"} />
              <KpiCard label="Milestones" value={`${(milestones as any[]).filter((m: any) => m.completedAt).length}/${milestones.length}`} sub="completed" />
            </div>

            {/* Budget burn bar */}
            {totalBudgeted > 0 && (
              <Card className="border border-border/60 bg-white">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm font-medium">Budget Overview</p>
                    <span className={`text-xs font-medium ${budgetVariance >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                      {budgetVariance >= 0 ? "+" : ""}£{budgetVariance.toLocaleString()} variance
                    </span>
                  </div>
                  <Progress value={Math.min(budgetBurnPct, 100)} className={`h-2 ${budgetBurnPct > 90 ? "[&>div]:bg-red-500" : budgetBurnPct > 70 ? "[&>div]:bg-amber-500" : "[&>div]:bg-emerald-500"}`} />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1.5">
                    <span>Actual: £{totalActual.toLocaleString()}</span>
                    <span>Budget: £{totalBudgeted.toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              {/* Upcoming milestones */}
              <Card className="border border-border/60 bg-white">
                <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-semibold">Upcoming Milestones</CardTitle>
                  <button onClick={() => setSection("strategy")} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                    View all <ChevronRight className="h-3 w-3" />
                  </button>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-2">
                  {upcomingMilestones.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-2">No upcoming milestones</p>
                  ) : upcomingMilestones.map((m: any) => {
                    const daysLeft = differenceInDays(new Date(m.dueDate), new Date());
                    const isOverdue = daysLeft < 0;
                    return (
                      <div key={m.id} className="flex items-center gap-2.5 py-1.5 border-b border-border/40 last:border-0">
                        <Calendar className={`h-3.5 w-3.5 shrink-0 ${isOverdue ? "text-red-500" : "text-muted-foreground"}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{m.title}</p>
                          <p className={`text-xs ${isOverdue ? "text-red-500" : "text-muted-foreground"}`}>
                            {isOverdue ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`} · {m.owner || "No owner"}
                          </p>
                        </div>
                        <button onClick={() => completeMilestone.mutate({ id: m.id })} className="text-muted-foreground hover:text-emerald-600 transition-colors">
                          <Circle className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Top risks */}
              <Card className="border border-border/60 bg-white">
                <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-semibold">Key Risks</CardTitle>
                  <button onClick={() => setSection("strategy")} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                    View all <ChevronRight className="h-3 w-3" />
                  </button>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-2">
                  {risks.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-2">No risks logged</p>
                  ) : (risks as any[]).slice(0, 4).map((r: any) => (
                    <div key={r.id} className="flex items-start gap-2.5 py-1.5 border-b border-border/40 last:border-0">
                      <AlertTriangle className={`h-3.5 w-3.5 shrink-0 mt-0.5 ${r.impact === "high" ? "text-red-500" : r.impact === "medium" ? "text-amber-500" : "text-gray-400"}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{r.title}</p>
                        <p className="text-xs text-muted-foreground">{r.owner || "No owner"} · {r.likelihood}/{r.impact}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Open follow-ups */}
            {openComms.length > 0 && (
              <Card className="border border-border/60 bg-white">
                <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-semibold">Open Follow-ups</CardTitle>
                  <button onClick={() => setSection("actions")} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                    View all <ChevronRight className="h-3 w-3" />
                  </button>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-1.5">
                  {openComms.slice(0, 3).map((c: any) => (
                    <div key={c.id} className="flex items-center gap-2.5 py-1 border-b border-border/40 last:border-0">
                      <MessageSquare className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <p className="text-xs flex-1 truncate">{c.subject}</p>
                      {c.dueDate && (
                        <span className={`text-xs ${isPast(new Date(c.dueDate)) ? "text-red-500" : "text-muted-foreground"}`}>
                          {format(new Date(c.dueDate), "d MMM")}
                        </span>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* ── ACTIONS ── */}
        {section === "actions" && (
          <div className="p-6 space-y-5 max-w-4xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">Actions</h2>
                <p className="text-sm text-muted-foreground">{openTasks.length} open · {overdueTasks.length} overdue</p>
              </div>
              <Button size="sm" onClick={() => setTaskDialog(true)} className="bg-black text-white hover:bg-black/80">
                <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Task
              </Button>
            </div>

            {/* Overdue banner */}
            {overdueTasks.length > 0 && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 flex items-center gap-2.5">
                <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
                <p className="text-sm text-red-700 font-medium">{overdueTasks.length} overdue task{overdueTasks.length > 1 ? "s" : ""} need attention</p>
              </div>
            )}

            {/* Tasks by assignee */}
            {Object.entries(tasksByAssignee).filter(([, tasks]) => tasks.length > 0).map(([assignee, tasks]) => (
              <div key={assignee}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium">
                    {assignee === "Unassigned" ? "?" : assignee.charAt(0).toUpperCase()}
                  </div>
                  <p className="text-sm font-semibold">{assignee}</p>
                  <span className="text-xs text-muted-foreground">({tasks.length})</span>
                </div>
                <div className="space-y-1.5 pl-8">
                  {tasks.map((t: any) => {
                    const isOverdue = t.dueDate && isPast(new Date(t.dueDate));
                    return (
                      <div key={t.id} className={`flex items-center gap-2.5 p-2.5 rounded-lg border ${isOverdue ? "bg-red-50 border-red-200" : "bg-white border-border/60"}`}>
                        <button onClick={() => completeTask.mutate({ id: t.id, status: "done" })} className="shrink-0 text-muted-foreground hover:text-emerald-600 transition-colors">
                          <Circle className="h-4 w-4" />
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate">{t.title}</p>
                          {t.description && <p className="text-xs text-muted-foreground truncate">{t.description}</p>}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {t.priority && (
                            <span className={`text-xs font-medium ${PRIORITY_COLOR[t.priority] ?? "text-gray-400"}`}>
                              {t.priority}
                            </span>
                          )}
                          {t.dueDate && (
                            <span className={`text-xs ${isOverdue ? "text-red-600 font-medium" : "text-muted-foreground"}`}>
                              {format(new Date(t.dueDate), "d MMM")}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {openTasks.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-emerald-500" />
                <p className="text-sm font-medium">All tasks complete</p>
              </div>
            )}

            {/* Follow-up comms */}
            <div className="pt-2 border-t border-border/60">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">Follow-ups & Communications</h3>
                <Button size="sm" variant="outline" onClick={() => setCommDialog(true)}>
                  <Plus className="h-3.5 w-3.5 mr-1" /> Log
                </Button>
              </div>
              <div className="space-y-1.5">
                {(comms as any[]).length === 0 ? (
                  <p className="text-xs text-muted-foreground">No communications logged</p>
                ) : (comms as any[]).map((c: any) => (
                  <div key={c.id} className={`flex items-center gap-2.5 p-2.5 rounded-lg border ${c.status === "open" ? "bg-amber-50 border-amber-200" : "bg-white border-border/60"}`}>
                    <MessageSquare className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{c.subject}</p>
                      <p className="text-xs text-muted-foreground">{c.type} · {c.from || "—"}</p>
                    </div>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${c.status === "open" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-500"}`}>
                      {c.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── FINANCE ── */}
        {section === "finance" && (
          <div className="p-6 space-y-5 max-w-4xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">Finance</h2>
                <p className="text-sm text-muted-foreground">Budget vs actual by category</p>
              </div>
              <Button size="sm" onClick={() => setFinanceDialog(true)} className="bg-black text-white hover:bg-black/80">
                <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Line
              </Button>
            </div>

            {/* Summary KPIs */}
            <div className="grid grid-cols-3 gap-3">
              <KpiCard label="Total Budget" value={`£${totalBudgeted.toLocaleString()}`} />
              <KpiCard label="Actual Spend" value={`£${totalActual.toLocaleString()}`} sub={`${budgetBurnPct}% of budget`} trend={budgetBurnPct > 80 ? "down" : "neutral"} accent />
              <KpiCard label="Variance" value={`${budgetVariance >= 0 ? "+" : ""}£${budgetVariance.toLocaleString()}`} sub={budgetVariance >= 0 ? "Under budget" : "Over budget"} trend={budgetVariance >= 0 ? "up" : "down"} />
            </div>

            {/* Finance lines table */}
            <Card className="border border-border/60 bg-white overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/60 bg-gray-50">
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Category / Item</th>
                      <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">Budgeted</th>
                      <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">Actual</th>
                      <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">Variance</th>
                      <th className="px-4 py-2.5"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {finance.length === 0 ? (
                      <tr><td colSpan={5} className="text-center py-8 text-muted-foreground text-xs">No finance lines added yet</td></tr>
                    ) : (finance as any[]).map((f: any) => {
                      const variance = (f.budgeted ?? 0) - (f.actual ?? 0);
                      return (
                        <tr key={f.id} className="border-b border-border/40 last:border-0 hover:bg-gray-50">
                          <td className="px-4 py-2.5">
                            <p className="font-medium text-xs">{f.lineItem}</p>
                            <p className="text-xs text-muted-foreground">{f.category}</p>
                          </td>
                          <td className="px-4 py-2.5 text-right text-xs">£{(f.budgeted ?? 0).toLocaleString()}</td>
                          <td className="px-4 py-2.5 text-right text-xs">£{(f.actual ?? 0).toLocaleString()}</td>
                          <td className={`px-4 py-2.5 text-right text-xs font-medium ${variance >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                            {variance >= 0 ? "+" : ""}£{variance.toLocaleString()}
                          </td>
                          <td className="px-4 py-2.5 text-right">
                            <button onClick={() => deleteFinance.mutate({ id: f.id })} className="text-muted-foreground hover:text-red-500 transition-colors">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* ── STRATEGY ── */}
        {section === "strategy" && (
          <div className="p-6 space-y-6 max-w-4xl">
            <h2 className="text-lg font-bold">Strategy</h2>

            {/* Milestones */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold flex items-center gap-2"><Calendar className="h-4 w-4" /> Milestones</h3>
                <Button size="sm" variant="outline" onClick={() => setMilestoneDialog(true)}>
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add
                </Button>
              </div>
              <div className="space-y-1.5">
                {milestones.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No milestones added</p>
                ) : (milestones as any[]).map((m: any) => {
                  const daysLeft = m.dueDate ? differenceInDays(new Date(m.dueDate), new Date()) : null;
                  const isOverdue = daysLeft !== null && daysLeft < 0 && !m.completedAt;
                  return (
                    <div key={m.id} className={`flex items-center gap-2.5 p-3 rounded-lg border ${m.completedAt ? "bg-emerald-50 border-emerald-200" : isOverdue ? "bg-red-50 border-red-200" : "bg-white border-border/60"}`}>
                      <button onClick={() => !m.completedAt && completeMilestone.mutate({ id: m.id })} className={`shrink-0 ${m.completedAt ? "text-emerald-600" : "text-muted-foreground hover:text-emerald-600"} transition-colors`}>
                        {m.completedAt ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${m.completedAt ? "line-through text-muted-foreground" : ""}`}>{m.title}</p>
                        <p className="text-xs text-muted-foreground">{m.phase && `${m.phase} · `}{m.owner || "No owner"}</p>
                      </div>
                      {m.dueDate && (
                        <span className={`text-xs shrink-0 ${isOverdue ? "text-red-600 font-medium" : m.completedAt ? "text-emerald-600" : "text-muted-foreground"}`}>
                          {m.completedAt ? "Done" : daysLeft === 0 ? "Today" : daysLeft !== null && daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d`}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Risks */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Risks</h3>
                <Button size="sm" variant="outline" onClick={() => setRiskDialog(true)}>
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add
                </Button>
              </div>
              <div className="space-y-1.5">
                {risks.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No risks logged</p>
                ) : (risks as any[]).map((r: any) => (
                  <div key={r.id} className="flex items-start gap-2.5 p-3 rounded-lg border bg-white border-border/60">
                    <AlertTriangle className={`h-4 w-4 shrink-0 mt-0.5 ${r.impact === "high" ? "text-red-500" : r.impact === "medium" ? "text-amber-500" : "text-gray-400"}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{r.title}</p>
                      {r.description && <p className="text-xs text-muted-foreground">{r.description}</p>}
                      {r.mitigation && <p className="text-xs text-blue-600 mt-0.5">Mitigation: {r.mitigation}</p>}
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">{r.likelihood}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${r.impact === "high" ? "bg-red-100 text-red-700" : r.impact === "medium" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"}`}>{r.impact}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Decisions */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold flex items-center gap-2"><BookOpen className="h-4 w-4" /> Decisions</h3>
                <Button size="sm" variant="outline" onClick={() => setDecisionDialog(true)}>
                  <Plus className="h-3.5 w-3.5 mr-1" /> Log
                </Button>
              </div>
              <div className="space-y-1.5">
                {decisionsData.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No decisions logged</p>
                ) : (decisionsData as any[]).map((d: any) => (
                  <div key={d.id} className="p-3 rounded-lg border bg-white border-border/60">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium">{d.title}</p>
                      <span className={`text-xs px-1.5 py-0.5 rounded shrink-0 ${d.impact === "high" || d.impact === "critical" ? "bg-red-100 text-red-700" : d.impact === "medium" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"}`}>{d.impact}</span>
                    </div>
                    {d.rationale && <p className="text-xs text-muted-foreground mt-1">{d.rationale}</p>}
                  </div>
                ))}
              </div>
            </div>

            {/* Automation ideas */}
            {automations.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold flex items-center gap-2 mb-3"><Zap className="h-4 w-4" /> Automation Opportunities</h3>
                <div className="space-y-1.5">
                  {(automations as any[]).map((a: any) => (
                    <div key={a.id} className="flex items-start gap-2.5 p-3 rounded-lg border bg-white border-border/60">
                      <Zap className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{a.title}</p>
                        <p className="text-xs text-muted-foreground">{a.area} · {a.complexity} complexity{a.estimatedSaving ? ` · Saves: ${a.estimatedSaving}` : ""}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── Dialogs ── */}
      {/* Add Task */}
      <Dialog open={taskDialog} onOpenChange={setTaskDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Add Task</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label className="text-xs">Title</Label><Input value={newTask.title} onChange={e => setNewTask(p => ({ ...p, title: e.target.value }))} placeholder="Task title" /></div>
            <div><Label className="text-xs">Assignee</Label><Input value={newTask.assignee} onChange={e => setNewTask(p => ({ ...p, assignee: e.target.value }))} placeholder="Name" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Priority</Label>
                <Select value={newTask.priority} onValueChange={v => setNewTask(p => ({ ...p, priority: v as any }))}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>{["low","medium","high","critical"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs">Due Date</Label><Input type="date" value={newTask.dueDate} onChange={e => setNewTask(p => ({ ...p, dueDate: e.target.value }))} className="h-8 text-xs" /></div>
            </div>
            <div><Label className="text-xs">Description</Label><Textarea value={newTask.description} onChange={e => setNewTask(p => ({ ...p, description: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setTaskDialog(false)}>Cancel</Button>
            <Button size="sm" onClick={() => createTask.mutate({ projectId, ...newTask })} disabled={!newTask.title || createTask.isPending}>
              {createTask.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Add Task"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Milestone */}
      <Dialog open={milestoneDialog} onOpenChange={setMilestoneDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Add Milestone</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label className="text-xs">Title</Label><Input value={newMilestone.title} onChange={e => setNewMilestone(p => ({ ...p, title: e.target.value }))} placeholder="Milestone title" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Owner</Label><Input value={newMilestone.owner} onChange={e => setNewMilestone(p => ({ ...p, owner: e.target.value }))} /></div>
              <div><Label className="text-xs">Phase</Label><Input value={newMilestone.phase} onChange={e => setNewMilestone(p => ({ ...p, phase: e.target.value }))} placeholder="e.g. Q1 2025" /></div>
            </div>
            <div><Label className="text-xs">Due Date</Label><Input type="date" value={newMilestone.dueDate} onChange={e => setNewMilestone(p => ({ ...p, dueDate: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setMilestoneDialog(false)}>Cancel</Button>
            <Button size="sm" onClick={() => upsertMilestone.mutate({ projectId, ...newMilestone })} disabled={!newMilestone.title || upsertMilestone.isPending}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Finance Line */}
      <Dialog open={financeDialog} onOpenChange={setFinanceDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Add Finance Line</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Category</Label>
                <Select value={newFinance.category} onValueChange={v => setNewFinance(p => ({ ...p, category: v }))}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>{["Operations","Marketing","Sales","Technology","HR","Finance","Other"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs">Currency</Label>
                <Select value={newFinance.currency} onValueChange={v => setNewFinance(p => ({ ...p, currency: v }))}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>{["GBP","USD","EUR","BRL"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div><Label className="text-xs">Line Item</Label><Input value={newFinance.lineItem} onChange={e => setNewFinance(p => ({ ...p, lineItem: e.target.value }))} placeholder="Description" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Budgeted</Label><Input type="number" value={newFinance.budgeted} onChange={e => setNewFinance(p => ({ ...p, budgeted: e.target.value }))} /></div>
              <div><Label className="text-xs">Actual</Label><Input type="number" value={newFinance.actual} onChange={e => setNewFinance(p => ({ ...p, actual: e.target.value }))} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setFinanceDialog(false)}>Cancel</Button>
            <Button size="sm" onClick={() => upsertFinance.mutate({ projectId, ...newFinance, budgeted: Number(newFinance.budgeted), actual: Number(newFinance.actual), forecast: Number(newFinance.forecast) })} disabled={!newFinance.lineItem || upsertFinance.isPending}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Risk */}
      <Dialog open={riskDialog} onOpenChange={setRiskDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Log Risk</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label className="text-xs">Title</Label><Input value={newRisk.title} onChange={e => setNewRisk(p => ({ ...p, title: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Likelihood</Label>
                <Select value={newRisk.likelihood} onValueChange={v => setNewRisk(p => ({ ...p, likelihood: v as any }))}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>{["low","medium","high"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs">Impact</Label>
                <Select value={newRisk.impact} onValueChange={v => setNewRisk(p => ({ ...p, impact: v as any }))}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>{["low","medium","high"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div><Label className="text-xs">Owner</Label><Input value={newRisk.owner} onChange={e => setNewRisk(p => ({ ...p, owner: e.target.value }))} /></div>
            <div><Label className="text-xs">Mitigation</Label><Textarea value={newRisk.mitigation} onChange={e => setNewRisk(p => ({ ...p, mitigation: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setRiskDialog(false)}>Cancel</Button>
            <Button size="sm" onClick={() => upsertRisk.mutate({ projectId, ...newRisk })} disabled={!newRisk.title || upsertRisk.isPending}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Log Communication */}
      <Dialog open={commDialog} onOpenChange={setCommDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Log Communication</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label className="text-xs">Type</Label>
              <Select value={newComm.type} onValueChange={v => setNewComm(p => ({ ...p, type: v }))}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{["email","meeting","call","note","action","follow_up","escalation"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label className="text-xs">Subject</Label><Input value={newComm.subject} onChange={e => setNewComm(p => ({ ...p, subject: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">From</Label><Input value={newComm.from} onChange={e => setNewComm(p => ({ ...p, from: e.target.value }))} /></div>
              <div><Label className="text-xs">Due Date</Label><Input type="date" value={newComm.dueDate} onChange={e => setNewComm(p => ({ ...p, dueDate: e.target.value }))} className="h-8 text-xs" /></div>
            </div>
            <div><Label className="text-xs">Notes</Label><Textarea value={newComm.body} onChange={e => setNewComm(p => ({ ...p, body: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setCommDialog(false)}>Cancel</Button>
            <Button size="sm" onClick={() => createComm.mutate({ projectId, ...newComm })} disabled={!newComm.subject || createComm.isPending}>Log</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Log Decision */}
      <Dialog open={decisionDialog} onOpenChange={setDecisionDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Log Decision</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label className="text-xs">Decision</Label><Input value={newDecision.title} onChange={e => setNewDecision(p => ({ ...p, title: e.target.value }))} /></div>
            <div><Label className="text-xs">Context</Label><Textarea value={newDecision.context} onChange={e => setNewDecision(p => ({ ...p, context: e.target.value }))} rows={2} /></div>
            <div><Label className="text-xs">Rationale</Label><Textarea value={newDecision.rationale} onChange={e => setNewDecision(p => ({ ...p, rationale: e.target.value }))} rows={2} /></div>
            <div><Label className="text-xs">Impact</Label>
              <Select value={newDecision.impact} onValueChange={v => setNewDecision(p => ({ ...p, impact: v as any }))}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{["low","medium","high","critical"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setDecisionDialog(false)}>Cancel</Button>
            <Button size="sm" onClick={() => createDecision.mutate({ projectId, ...newDecision })} disabled={!newDecision.title || createDecision.isPending}>Log</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
