// ProjectPortal — Full PMO Command Center
import { useParams, useLocation } from "wouter";
import {
  ArrowLeft, Plus, Loader2, Trash2, CheckSquare, Calendar,
  Users, DollarSign, AlertTriangle, MessageSquare, Zap,
  BarChart3, Target, CheckCircle2, Circle,
  FileText, FolderOpen, Bot, BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { format, isPast } from "date-fns";

// ─── Colour helpers ────────────────────────────────────────────────────────────
const PRIORITY_BADGE: Record<string, string> = {
  critical: "bg-red-100 text-red-700 border-red-200",
  high: "bg-orange-100 text-orange-700 border-orange-200",
  medium: "bg-amber-100 text-amber-700 border-amber-200",
  low: "bg-gray-100 text-gray-500 border-gray-200",
};
const STATUS_BADGE: Record<string, string> = {
  todo: "bg-gray-100 text-gray-600",
  in_progress: "bg-blue-100 text-blue-700",
  done: "bg-emerald-100 text-emerald-700",
  blocked: "bg-red-100 text-red-700",
  completed: "bg-emerald-100 text-emerald-700",
  pending: "bg-gray-100 text-gray-600",
  open: "bg-amber-100 text-amber-700",
  closed: "bg-gray-100 text-gray-500",
  idea: "bg-purple-100 text-purple-700",
  in_review: "bg-blue-100 text-blue-700",
  approved: "bg-emerald-100 text-emerald-700",
  active: "bg-emerald-100 text-emerald-700",
  planning: "bg-blue-100 text-blue-700",
  on_hold: "bg-amber-100 text-amber-700",
  cancelled: "bg-red-100 text-red-700",
};
const RISK_BADGE: Record<string, string> = {
  low: "bg-emerald-100 text-emerald-700",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-red-100 text-red-700",
};

function StatCard({ label, value, sub, icon: Icon, color = "text-foreground" }: {
  label: string; value: string | number; sub?: string; icon: React.ElementType; color?: string;
}) {
  return (
    <Card className="border border-border/60">
      <CardContent className="p-4 flex items-start gap-3">
        <div className="p-2 rounded-lg bg-muted/60">
          <Icon className={`h-4 w-4 ${color}`} />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className={`text-xl font-semibold ${color}`}>{value}</p>
          {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

export default function ProjectPortal() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const projectId = parseInt(params.id ?? "0", 10);

  // ── Project meta ──
  const { data: project, isLoading: projectLoading } = trpc.projects.get.useQuery(
    { id: projectId }, { enabled: !!projectId }
  );

  // ── Overview ──
  const { data: overview, refetch: refetchOverview } = trpc.projectCommandCenter.getOverview.useQuery(
    { projectId }, { enabled: !!projectId }
  );

  // ── Tasks ──
  const { data: allTasks = [], refetch: refetchTasks } = trpc.projectCommandCenter.getAllTasks.useQuery(
    { projectId }, { enabled: !!projectId }
  );
  const createTask = trpc.tasks.create.useMutation({
    onSuccess: () => { refetchTasks(); refetchOverview(); toast.success("Task created"); setTaskDialog(false); resetTask(); }
  });
  const updateTaskStatus = trpc.tasks.updateStatus.useMutation({ onSuccess: () => { refetchTasks(); refetchOverview(); } });
  const deleteTask = trpc.tasks.delete.useMutation({ onSuccess: () => { refetchTasks(); refetchOverview(); toast.success("Task deleted"); } });

  // ── Milestones ──
  const { data: milestones = [], refetch: refetchMilestones } = trpc.projectCommandCenter.getMilestones.useQuery(
    { projectId }, { enabled: !!projectId }
  );
  const createMilestone = trpc.projectCommandCenter.createMilestone.useMutation({
    onSuccess: () => { refetchMilestones(); refetchOverview(); toast.success("Milestone added"); setMilestoneDialog(false); resetMilestone(); }
  });
  const updateMilestone = trpc.projectCommandCenter.updateMilestone.useMutation({ onSuccess: () => { refetchMilestones(); refetchOverview(); } });
  const deleteMilestone = trpc.projectCommandCenter.deleteMilestone.useMutation({ onSuccess: () => { refetchMilestones(); refetchOverview(); toast.success("Milestone removed"); } });

  // ── Team ──
  const { data: team = [], refetch: refetchTeam } = trpc.projectCommandCenter.getTeam.useQuery(
    { projectId }, { enabled: !!projectId }
  );
  const addMember = trpc.projectCommandCenter.addTeamMember.useMutation({
    onSuccess: () => { refetchTeam(); refetchOverview(); toast.success("Team member added"); setTeamDialog(false); resetMember(); }
  });
  const removeMember = trpc.projectCommandCenter.removeTeamMember.useMutation({ onSuccess: () => { refetchTeam(); refetchOverview(); } });

  // ── Finance ──
  const { data: finance, refetch: refetchFinance } = trpc.projectCommandCenter.getFinance.useQuery(
    { projectId }, { enabled: !!projectId }
  );
  const upsertFinance = trpc.projectCommandCenter.upsertFinanceLine.useMutation({
    onSuccess: () => { refetchFinance(); refetchOverview(); toast.success("Finance updated"); setFinanceDialog(false); resetFinance(); }
  });
  const deleteFinance = trpc.projectCommandCenter.deleteFinanceLine.useMutation({ onSuccess: () => { refetchFinance(); refetchOverview(); } });

  // ── Risks ──
  const { data: risks = [], refetch: refetchRisks } = trpc.projectCommandCenter.getRisks.useQuery(
    { projectId }, { enabled: !!projectId }
  );
  const upsertRisk = trpc.projectCommandCenter.upsertRisk.useMutation({
    onSuccess: () => { refetchRisks(); refetchOverview(); toast.success("Risk saved"); setRiskDialog(false); resetRisk(); }
  });
  const deleteRisk = trpc.projectCommandCenter.deleteRisk.useMutation({ onSuccess: () => { refetchRisks(); refetchOverview(); } });

  // ── Comms ──
  const { data: comms = [], refetch: refetchComms } = trpc.projectCommandCenter.getComms.useQuery(
    { projectId }, { enabled: !!projectId }
  );
  const createComm = trpc.projectCommandCenter.createComm.useMutation({
    onSuccess: () => { refetchComms(); toast.success("Communication logged"); setCommDialog(false); resetComm(); }
  });
  const updateCommStatus = trpc.projectCommandCenter.updateCommStatus.useMutation({ onSuccess: () => refetchComms() });

  // ── Automation ──
  const { data: automations = [], refetch: refetchAuto } = trpc.projectCommandCenter.getAutomation.useQuery(
    { projectId }, { enabled: !!projectId }
  );
  const upsertAuto = trpc.projectCommandCenter.upsertAutomation.useMutation({
    onSuccess: () => { refetchAuto(); toast.success("Automation idea saved"); setAutoDialog(false); resetAuto(); }
  });
  const deleteAuto = trpc.projectCommandCenter.deleteAutomation.useMutation({ onSuccess: () => { refetchAuto(); } });

  // ── Decisions (legacy tab) ──
  const { data: decisionsData = [], refetch: refetchDecisions } = trpc.decisions.getAll.useQuery(
    { projectId }, { enabled: !!projectId }
  );
  const createDecision = trpc.decisions.create.useMutation({
    onSuccess: () => { refetchDecisions(); toast.success("Decision logged"); setDecisionDialog(false); resetDecision(); }
  });

  // ── Dialog states ──
  const [taskDialog, setTaskDialog] = useState(false);
  const [milestoneDialog, setMilestoneDialog] = useState(false);
  const [teamDialog, setTeamDialog] = useState(false);
  const [financeDialog, setFinanceDialog] = useState(false);
  const [riskDialog, setRiskDialog] = useState(false);
  const [commDialog, setCommDialog] = useState(false);
  const [autoDialog, setAutoDialog] = useState(false);
  const [decisionDialog, setDecisionDialog] = useState(false);

  // ── Form states ──
  const [newTask, setNewTask] = useState({ title: "", description: "", priority: "medium" as const, dueDate: "", assignee: "" });
  const resetTask = () => setNewTask({ title: "", description: "", priority: "medium", dueDate: "", assignee: "" });

  const [newMilestone, setNewMilestone] = useState({ title: "", description: "", dueDate: "", owner: "", phase: "" });
  const resetMilestone = () => setNewMilestone({ title: "", description: "", dueDate: "", owner: "", phase: "" });

  const [newMember, setNewMember] = useState({ name: "", role: "", email: "", department: "", isExternal: false });
  const resetMember = () => setNewMember({ name: "", role: "", email: "", department: "", isExternal: false });

  const [newFinance, setNewFinance] = useState({ category: "Operations", lineItem: "", budgeted: "", actual: "", forecast: "", currency: "BRL", notes: "" });
  const resetFinance = () => setNewFinance({ category: "Operations", lineItem: "", budgeted: "", actual: "", forecast: "", currency: "BRL", notes: "" });

  const [newRisk, setNewRisk] = useState({ title: "", description: "", likelihood: "medium" as const, impact: "medium" as const, owner: "", mitigation: "" });
  const resetRisk = () => setNewRisk({ title: "", description: "", likelihood: "medium", impact: "medium", owner: "", mitigation: "" });

  const [newComm, setNewComm] = useState({ type: "note", subject: "", body: "", from: "", to: "", dueDate: "" });
  const resetComm = () => setNewComm({ type: "note", subject: "", body: "", from: "", to: "", dueDate: "" });

  const [newAuto, setNewAuto] = useState({ title: "", description: "", area: "operations", estimatedSaving: "", complexity: "medium" as const, priority: "medium" as const });
  const resetAuto = () => setNewAuto({ title: "", description: "", area: "operations", estimatedSaving: "", complexity: "medium", priority: "medium" });

  const [newDecision, setNewDecision] = useState({ title: "", context: "", rationale: "", impact: "medium" as const });
  const resetDecision = () => setNewDecision({ title: "", context: "", rationale: "", impact: "medium" });

  // ── Derived ──
  const overdueTasks = useMemo(() => (allTasks as any[]).filter((t: any) => t.dueDate && isPast(new Date(t.dueDate)) && t.status !== "done"), [allTasks]);
  const tasksByAssignee = useMemo(() => {
    const map: Record<string, any[]> = {};
    for (const t of allTasks as any[]) {
      const key = (t as any).assignee || "Unassigned";
      if (!map[key]) map[key] = [];
      map[key].push(t);
    }
    return map;
  }, [allTasks]);

  if (projectLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground mb-4">Project not found.</p>
        <Button variant="outline" onClick={() => setLocation("/projects")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Projects
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* ── Header ── */}
      <div className="bg-black text-white px-4 py-3 flex items-center gap-3 shrink-0">
        <button onClick={() => setLocation("/projects")} className="p-1.5 rounded hover:bg-white/10 transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-semibold text-sm truncate">{project.name}</h1>
          <p className="text-xs text-white/60">Command Center · PMO</p>
        </div>
        {overview && (
          <div className="flex items-center gap-3 text-xs text-white/70 shrink-0">
            <span>{(overview as any).openTasks ?? 0} open</span>
            {(overview as any).overdueTasks > 0 && (
              <span className="text-red-400">{(overview as any).overdueTasks} overdue</span>
            )}
          </div>
        )}
      </div>

      {/* ── Tabs ── */}
      <Tabs defaultValue="overview" className="flex-1 flex flex-col overflow-hidden">
        <div className="border-b border-border bg-background px-2 shrink-0 overflow-x-auto">
          <TabsList className="h-10 bg-transparent gap-0 rounded-none w-max">
            {[
              { value: "overview", label: "Overview", icon: BarChart3 },
              { value: "tasks", label: "Tasks", icon: CheckSquare },
              { value: "timeline", label: "Timeline", icon: Calendar },
              { value: "team", label: "Team", icon: Users },
              { value: "finance", label: "Finance", icon: DollarSign },
              { value: "risks", label: "Risks", icon: AlertTriangle },
              { value: "comms", label: "Comms", icon: MessageSquare },
              { value: "automation", label: "Automation", icon: Zap },
              { value: "decisions", label: "Decisions", icon: BookOpen },
            ].map(({ value, label, icon: Icon }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="h-10 px-3 text-xs rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent gap-1.5 whitespace-nowrap"
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="flex-1 overflow-y-auto">

          {/* ── OVERVIEW ── */}
          <TabsContent value="overview" className="p-4 space-y-4 mt-0">
            {overview ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <StatCard label="Open Tasks" value={(overview as any).openTasks ?? 0} sub={`${(overview as any).overdueTasks ?? 0} overdue`} icon={CheckSquare} color={(overview as any).overdueTasks > 0 ? "text-red-500" : "text-foreground"} />
                  <StatCard label="Milestones" value={`${(overview as any).completedMilestones ?? 0}/${(overview as any).totalMilestones ?? 0}`} sub="completed" icon={Target} />
                  <StatCard label="Team Size" value={(overview as any).teamSize ?? 0} sub="members" icon={Users} />
                  <StatCard label="High Risks" value={(overview as any).highRisks ?? 0} sub="open" icon={AlertTriangle} color={(overview as any).highRisks > 0 ? "text-amber-500" : "text-foreground"} />
                </div>

                {(overview as any).totalBudgeted > 0 && (
                  <Card className="border border-border/60">
                    <CardHeader className="pb-2 pt-4 px-4">
                      <CardTitle className="text-sm">Budget Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4 space-y-2">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Spent: {(overview as any).totalActual?.toLocaleString()}</span>
                        <span>Budget: {(overview as any).totalBudgeted?.toLocaleString()}</span>
                      </div>
                      <Progress value={Math.min(100, ((overview as any).totalActual / (overview as any).totalBudgeted) * 100)} className="h-2" />
                      <p className="text-xs text-muted-foreground">Variance: {((overview as any).totalBudgeted - (overview as any).totalActual).toLocaleString()} remaining</p>
                    </CardContent>
                  </Card>
                )}

                {(overview as any).recentTasks?.length > 0 && (
                  <Card className="border border-border/60">
                    <CardHeader className="pb-2 pt-4 px-4">
                      <CardTitle className="text-sm">Recent Tasks</CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4 space-y-2">
                      {(overview as any).recentTasks.map((t: any) => (
                        <div key={t.id} className="flex items-center gap-2 text-sm">
                          <span className={`inline-flex px-1.5 py-0.5 rounded text-xs font-medium ${STATUS_BADGE[t.status] ?? "bg-gray-100 text-gray-600"}`}>{t.status}</span>
                          <span className="flex-1 truncate">{t.title}</span>
                          {t.assignee && <span className="text-xs text-muted-foreground shrink-0">{t.assignee}</span>}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {(overview as any).upcomingMilestones?.length > 0 && (
                  <Card className="border border-border/60">
                    <CardHeader className="pb-2 pt-4 px-4">
                      <CardTitle className="text-sm">Upcoming Milestones</CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4 space-y-2">
                      {(overview as any).upcomingMilestones.map((m: any) => (
                        <div key={m.id} className="flex items-center gap-2 text-sm">
                          <Target className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span className="flex-1 truncate">{m.title}</span>
                          {m.dueDate && (
                            <span className={`text-xs shrink-0 ${isPast(new Date(m.dueDate)) ? "text-red-500" : "text-muted-foreground"}`}>
                              {format(new Date(m.dueDate), "d MMM")}
                            </span>
                          )}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            )}
          </TabsContent>

          {/* ── TASKS ── */}
          <TabsContent value="tasks" className="p-4 space-y-4 mt-0">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">{(allTasks as any[]).length} tasks · {overdueTasks.length} overdue</div>
              <Button size="sm" className="h-8 gap-1.5" onClick={() => setTaskDialog(true)}>
                <Plus className="h-3.5 w-3.5" /> Add Task
              </Button>
            </div>

            {Object.entries(tasksByAssignee).map(([assignee, tasks]) => (
              <div key={assignee} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Users className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{assignee}</span>
                  <span className="text-xs text-muted-foreground">({tasks.length})</span>
                </div>
                {tasks.map((t: any) => (
                  <Card key={t.id} className="border border-border/60">
                    <CardContent className="p-3 flex items-start gap-3">
                      <button
                        onClick={() => updateTaskStatus.mutate({ id: t.id, status: t.status === "done" ? "todo" : "done" })}
                        className="mt-0.5 shrink-0"
                      >
                        {t.status === "done"
                          ? <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          : <Circle className="h-4 w-4 text-muted-foreground" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${t.status === "done" ? "line-through text-muted-foreground" : ""}`}>{t.title}</p>
                        {t.description && <p className="text-xs text-muted-foreground mt-0.5 truncate">{t.description}</p>}
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span className={`inline-flex px-1.5 py-0.5 rounded text-xs font-medium border ${PRIORITY_BADGE[t.priority] ?? ""}`}>{t.priority}</span>
                          {t.dueDate && (
                            <span className={`text-xs ${isPast(new Date(t.dueDate)) && t.status !== "done" ? "text-red-500 font-medium" : "text-muted-foreground"}`}>
                              Due {format(new Date(t.dueDate), "d MMM")}
                            </span>
                          )}
                        </div>
                      </div>
                      <button onClick={() => deleteTask.mutate({ id: t.id })} className="p-1 rounded hover:bg-muted transition-colors shrink-0">
                        <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ))}

            {(allTasks as any[]).length === 0 && (
              <div className="text-center py-12 text-muted-foreground text-sm">No tasks yet. Add the first one.</div>
            )}
          </TabsContent>

          {/* ── TIMELINE ── */}
          <TabsContent value="timeline" className="p-4 space-y-4 mt-0">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">{milestones.length} milestones</div>
              <Button size="sm" className="h-8 gap-1.5" onClick={() => setMilestoneDialog(true)}>
                <Plus className="h-3.5 w-3.5" /> Add Milestone
              </Button>
            </div>
            <div className="relative">
              {milestones.length > 0 && <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />}
              <div className="space-y-3">
                {(milestones as any[]).map((m: any) => {
                  const isComplete = m.status === "completed";
                  const isOverdue = m.dueDate && isPast(new Date(m.dueDate)) && !isComplete;
                  return (
                    <div key={m.id} className="flex items-start gap-3 pl-8 relative">
                      <div className={`absolute left-2.5 top-2 w-3 h-3 rounded-full border-2 ${isComplete ? "bg-emerald-500 border-emerald-500" : isOverdue ? "bg-red-500 border-red-500" : "bg-background border-border"}`} />
                      <Card className="flex-1 border border-border/60">
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium ${isComplete ? "line-through text-muted-foreground" : ""}`}>{m.title}</p>
                              {m.phase && <p className="text-xs text-muted-foreground mt-0.5">Phase: {m.phase}</p>}
                              {m.description && <p className="text-xs text-muted-foreground mt-0.5">{m.description}</p>}
                              <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                                {m.owner && <span className="text-xs text-muted-foreground">Owner: {m.owner}</span>}
                                {m.dueDate && (
                                  <span className={`text-xs ${isOverdue ? "text-red-500 font-medium" : "text-muted-foreground"}`}>
                                    {isOverdue ? "Overdue · " : "Due "}{format(new Date(m.dueDate), "d MMM yyyy")}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              {!isComplete && (
                                <button onClick={() => updateMilestone.mutate({ id: m.id, status: "completed" })} className="p-1 rounded hover:bg-muted transition-colors text-emerald-600" title="Mark complete">
                                  <CheckCircle2 className="h-4 w-4" />
                                </button>
                              )}
                              <button onClick={() => deleteMilestone.mutate({ id: m.id })} className="p-1 rounded hover:bg-muted transition-colors">
                                <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                              </button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  );
                })}
              </div>
            </div>
            {milestones.length === 0 && (
              <div className="text-center py-12 text-muted-foreground text-sm">No milestones yet. Build the timeline.</div>
            )}
          </TabsContent>

          {/* ── TEAM ── */}
          <TabsContent value="team" className="p-4 space-y-4 mt-0">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">{(team as any[]).length} members</div>
              <Button size="sm" className="h-8 gap-1.5" onClick={() => setTeamDialog(true)}>
                <Plus className="h-3.5 w-3.5" /> Add Member
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {(team as any[]).map((m: any) => (
                <Card key={m.id} className="border border-border/60">
                  <CardContent className="p-3 flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-sm font-semibold shrink-0">
                      {m.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{m.name}</p>
                      <p className="text-xs text-muted-foreground">{m.role}</p>
                      {m.department && <p className="text-xs text-muted-foreground">{m.department}</p>}
                      {m.email && <p className="text-xs text-muted-foreground truncate">{m.email}</p>}
                      {m.isExternal && <Badge variant="outline" className="text-xs mt-1">External</Badge>}
                    </div>
                    <button onClick={() => removeMember.mutate({ id: m.id })} className="p-1 rounded hover:bg-muted transition-colors shrink-0">
                      <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  </CardContent>
                </Card>
              ))}
            </div>
            {(team as any[]).length === 0 && (
              <div className="text-center py-12 text-muted-foreground text-sm">No team members yet.</div>
            )}
          </TabsContent>

          {/* ── FINANCE ── */}
          <TabsContent value="finance" className="p-4 space-y-4 mt-0">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {finance ? `Budget: ${(finance as any).totalBudgeted?.toLocaleString()} · Actual: ${(finance as any).totalActual?.toLocaleString()}` : ""}
              </div>
              <Button size="sm" className="h-8 gap-1.5" onClick={() => setFinanceDialog(true)}>
                <Plus className="h-3.5 w-3.5" /> Add Line
              </Button>
            </div>
            {finance && Object.entries((finance as any).byCategory ?? {}).map(([cat, rows]) => (
              <Card key={cat} className="border border-border/60">
                <CardHeader className="pb-2 pt-3 px-4">
                  <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{cat}</CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-3 space-y-2">
                  {(rows as any[]).map((r: any) => (
                    <div key={r.id} className="flex items-center gap-2 text-sm">
                      <span className="flex-1 truncate">{r.lineItem}</span>
                      <span className="text-xs text-muted-foreground shrink-0">B: {(r.budgeted ?? 0).toLocaleString()}</span>
                      <span className="text-xs shrink-0" style={{ color: (r.actual ?? 0) > (r.budgeted ?? 0) ? "#ef4444" : "#10b981" }}>
                        A: {(r.actual ?? 0).toLocaleString()}
                      </span>
                      <button onClick={() => deleteFinance.mutate({ id: r.id })} className="p-1 rounded hover:bg-muted transition-colors shrink-0">
                        <Trash2 className="h-3 w-3 text-muted-foreground" />
                      </button>
                    </div>
                  ))}
                  <div className="flex items-center gap-2 text-xs font-medium border-t border-border/60 pt-2 mt-2">
                    <span className="flex-1">Subtotal</span>
                    <span className="text-muted-foreground">{(rows as any[]).reduce((s: number, r: any) => s + (r.budgeted ?? 0), 0).toLocaleString()}</span>
                    <span>{(rows as any[]).reduce((s: number, r: any) => s + (r.actual ?? 0), 0).toLocaleString()}</span>
                    <span className="w-6" />
                  </div>
                </CardContent>
              </Card>
            ))}
            {(!finance || (finance as any).rows?.length === 0) && (
              <div className="text-center py-12 text-muted-foreground text-sm">No finance lines yet.</div>
            )}
          </TabsContent>

          {/* ── RISKS ── */}
          <TabsContent value="risks" className="p-4 space-y-4 mt-0">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">{(risks as any[]).filter((r: any) => r.status === "open").length} open risks</div>
              <Button size="sm" className="h-8 gap-1.5" onClick={() => setRiskDialog(true)}>
                <Plus className="h-3.5 w-3.5" /> Add Risk
              </Button>
            </div>
            <div className="space-y-3">
              {(risks as any[]).map((r: any) => (
                <Card key={r.id} className="border border-border/60">
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{r.title}</p>
                        {r.description && <p className="text-xs text-muted-foreground mt-0.5">{r.description}</p>}
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span className={`inline-flex px-1.5 py-0.5 rounded text-xs font-medium ${RISK_BADGE[r.likelihood ?? "medium"]}`}>L: {r.likelihood}</span>
                          <span className={`inline-flex px-1.5 py-0.5 rounded text-xs font-medium ${RISK_BADGE[r.impact ?? "medium"]}`}>I: {r.impact}</span>
                          {r.owner && <span className="text-xs text-muted-foreground">Owner: {r.owner}</span>}
                        </div>
                        {r.mitigation && <p className="text-xs text-muted-foreground mt-1.5 italic">Mitigation: {r.mitigation}</p>}
                      </div>
                      <button onClick={() => deleteRisk.mutate({ id: r.id })} className="p-1 rounded hover:bg-muted transition-colors shrink-0">
                        <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {(risks as any[]).length === 0 && (
              <div className="text-center py-12 text-muted-foreground text-sm">No risks logged yet.</div>
            )}
          </TabsContent>

          {/* ── COMMS ── */}
          <TabsContent value="comms" className="p-4 space-y-4 mt-0">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">{(comms as any[]).filter((c: any) => c.status === "open").length} open items</div>
              <Button size="sm" className="h-8 gap-1.5" onClick={() => setCommDialog(true)}>
                <Plus className="h-3.5 w-3.5" /> Log Comms
              </Button>
            </div>
            <div className="space-y-3">
              {(comms as any[]).map((c: any) => (
                <Card key={c.id} className="border border-border/60">
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs capitalize">{c.type}</Badge>
                          <span className={`inline-flex px-1.5 py-0.5 rounded text-xs font-medium ${STATUS_BADGE[c.status ?? "open"]}`}>{c.status}</span>
                        </div>
                        <p className="text-sm font-medium mt-1">{c.subject}</p>
                        {c.body && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{c.body}</p>}
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground flex-wrap">
                          {c.from && <span>From: {c.from}</span>}
                          {c.to && <span>To: {c.to}</span>}
                          {c.dueDate && <span>Due: {format(new Date(c.dueDate), "d MMM")}</span>}
                        </div>
                      </div>
                      {c.status === "open" && (
                        <button onClick={() => updateCommStatus.mutate({ id: c.id, status: "closed" })} className="p-1 rounded hover:bg-muted transition-colors shrink-0 text-emerald-600" title="Mark closed">
                          <CheckCircle2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {(comms as any[]).length === 0 && (
              <div className="text-center py-12 text-muted-foreground text-sm">No communications logged yet.</div>
            )}
          </TabsContent>

          {/* ── AUTOMATION ── */}
          <TabsContent value="automation" className="p-4 space-y-4 mt-0">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">{(automations as any[]).length} ideas · {(automations as any[]).filter((a: any) => a.status === "approved").length} approved</div>
              <Button size="sm" className="h-8 gap-1.5" onClick={() => setAutoDialog(true)}>
                <Plus className="h-3.5 w-3.5" /> Add Idea
              </Button>
            </div>
            <div className="space-y-3">
              {(automations as any[]).map((a: any) => (
                <Card key={a.id} className="border border-border/60">
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`inline-flex px-1.5 py-0.5 rounded text-xs font-medium ${STATUS_BADGE[a.status ?? "idea"]}`}>{a.status}</span>
                          <Badge variant="outline" className="text-xs capitalize">{a.area}</Badge>
                          <span className={`inline-flex px-1.5 py-0.5 rounded text-xs font-medium border ${PRIORITY_BADGE[a.priority ?? "medium"]}`}>{a.priority}</span>
                        </div>
                        <p className="text-sm font-medium mt-1">{a.title}</p>
                        {a.description && <p className="text-xs text-muted-foreground mt-0.5">{a.description}</p>}
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                          <span>Complexity: {a.complexity}</span>
                          {a.estimatedSaving && <span className="text-emerald-600 font-medium">Saving: {a.estimatedSaving}</span>}
                        </div>
                      </div>
                      <button onClick={() => deleteAuto.mutate({ id: a.id })} className="p-1 rounded hover:bg-muted transition-colors shrink-0">
                        <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {(automations as any[]).length === 0 && (
              <div className="text-center py-12 text-muted-foreground text-sm">No automation ideas yet. What can be streamlined?</div>
            )}
          </TabsContent>

          {/* ── DECISIONS ── */}
          <TabsContent value="decisions" className="p-4 space-y-4 mt-0">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">{(decisionsData as any[]).length} logged</div>
              <Button size="sm" className="h-8 gap-1.5" onClick={() => setDecisionDialog(true)}>
                <Plus className="h-3.5 w-3.5" /> Log Decision
              </Button>
            </div>
            <div className="space-y-3">
              {(decisionsData as any[]).map((d: any) => (
                <Card key={d.id} className="border border-border/60">
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{d.title}</p>
                        {d.context && <p className="text-xs text-muted-foreground mt-0.5">{d.context}</p>}
                        {d.rationale && <p className="text-xs text-muted-foreground mt-0.5 italic">"{d.rationale}"</p>}
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className={`inline-flex px-1.5 py-0.5 rounded text-xs font-medium border ${PRIORITY_BADGE[d.impact] ?? ""}`}>{d.impact}</span>
                          <span className="text-xs text-muted-foreground">{d.createdAt ? format(new Date(d.createdAt), "d MMM yyyy") : ""}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {(decisionsData as any[]).length === 0 && (
              <div className="text-center py-12 text-muted-foreground text-sm">No decisions logged yet.</div>
            )}
          </TabsContent>

        </div>
      </Tabs>

      {/* ── DIALOGS ── */}

      {/* Task */}
      <Dialog open={taskDialog} onOpenChange={setTaskDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>New Task</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label className="text-xs">Title *</Label><Input value={newTask.title} onChange={e => setNewTask(p => ({ ...p, title: e.target.value }))} placeholder="Task title" /></div>
            <div><Label className="text-xs">Description</Label><Textarea value={newTask.description} onChange={e => setNewTask(p => ({ ...p, description: e.target.value }))} rows={2} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Assignee</Label><Input value={newTask.assignee} onChange={e => setNewTask(p => ({ ...p, assignee: e.target.value }))} placeholder="Name" /></div>
              <div><Label className="text-xs">Due Date</Label><Input type="date" value={newTask.dueDate} onChange={e => setNewTask(p => ({ ...p, dueDate: e.target.value }))} /></div>
            </div>
            <div><Label className="text-xs">Priority</Label>
              <Select value={newTask.priority} onValueChange={(v: any) => setNewTask(p => ({ ...p, priority: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["low", "medium", "high", "critical"].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTaskDialog(false)}>Cancel</Button>
            <Button onClick={() => createTask.mutate({ ...newTask, projectId, description: newTask.description || undefined, dueDate: newTask.dueDate || undefined, assignee: newTask.assignee || undefined })} disabled={!newTask.title.trim() || createTask.isPending}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Milestone */}
      <Dialog open={milestoneDialog} onOpenChange={setMilestoneDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>New Milestone</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label className="text-xs">Title *</Label><Input value={newMilestone.title} onChange={e => setNewMilestone(p => ({ ...p, title: e.target.value }))} placeholder="Milestone title" /></div>
            <div><Label className="text-xs">Phase</Label><Input value={newMilestone.phase} onChange={e => setNewMilestone(p => ({ ...p, phase: e.target.value }))} placeholder="e.g. Phase 1, Launch" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Owner</Label><Input value={newMilestone.owner} onChange={e => setNewMilestone(p => ({ ...p, owner: e.target.value }))} /></div>
              <div><Label className="text-xs">Due Date</Label><Input type="date" value={newMilestone.dueDate} onChange={e => setNewMilestone(p => ({ ...p, dueDate: e.target.value }))} /></div>
            </div>
            <div><Label className="text-xs">Description</Label><Textarea value={newMilestone.description} onChange={e => setNewMilestone(p => ({ ...p, description: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMilestoneDialog(false)}>Cancel</Button>
            <Button onClick={() => createMilestone.mutate({ projectId, ...newMilestone, dueDate: newMilestone.dueDate || undefined })} disabled={!newMilestone.title.trim() || createMilestone.isPending}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Team */}
      <Dialog open={teamDialog} onOpenChange={setTeamDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Team Member</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Name *</Label><Input value={newMember.name} onChange={e => setNewMember(p => ({ ...p, name: e.target.value }))} /></div>
              <div><Label className="text-xs">Role *</Label><Input value={newMember.role} onChange={e => setNewMember(p => ({ ...p, role: e.target.value }))} /></div>
            </div>
            <div><Label className="text-xs">Email</Label><Input value={newMember.email} onChange={e => setNewMember(p => ({ ...p, email: e.target.value }))} /></div>
            <div><Label className="text-xs">Department</Label><Input value={newMember.department} onChange={e => setNewMember(p => ({ ...p, department: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTeamDialog(false)}>Cancel</Button>
            <Button onClick={() => addMember.mutate({ projectId, ...newMember })} disabled={!newMember.name.trim() || !newMember.role.trim() || addMember.isPending}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Finance */}
      <Dialog open={financeDialog} onOpenChange={setFinanceDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Finance Line</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Category *</Label><Input value={newFinance.category} onChange={e => setNewFinance(p => ({ ...p, category: e.target.value }))} /></div>
              <div><Label className="text-xs">Line Item *</Label><Input value={newFinance.lineItem} onChange={e => setNewFinance(p => ({ ...p, lineItem: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div><Label className="text-xs">Budgeted</Label><Input type="number" value={newFinance.budgeted} onChange={e => setNewFinance(p => ({ ...p, budgeted: e.target.value }))} /></div>
              <div><Label className="text-xs">Actual</Label><Input type="number" value={newFinance.actual} onChange={e => setNewFinance(p => ({ ...p, actual: e.target.value }))} /></div>
              <div><Label className="text-xs">Forecast</Label><Input type="number" value={newFinance.forecast} onChange={e => setNewFinance(p => ({ ...p, forecast: e.target.value }))} /></div>
            </div>
            <div><Label className="text-xs">Currency</Label>
              <Select value={newFinance.currency} onValueChange={v => setNewFinance(p => ({ ...p, currency: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["BRL", "GBP", "USD", "EUR"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFinanceDialog(false)}>Cancel</Button>
            <Button onClick={() => upsertFinance.mutate({ projectId, category: newFinance.category, lineItem: newFinance.lineItem, budgeted: parseInt(newFinance.budgeted) || 0, actual: parseInt(newFinance.actual) || 0, forecast: parseInt(newFinance.forecast) || 0, currency: newFinance.currency, notes: newFinance.notes })} disabled={!newFinance.category.trim() || !newFinance.lineItem.trim() || upsertFinance.isPending}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Risk */}
      <Dialog open={riskDialog} onOpenChange={setRiskDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Log Risk</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label className="text-xs">Title *</Label><Input value={newRisk.title} onChange={e => setNewRisk(p => ({ ...p, title: e.target.value }))} /></div>
            <div><Label className="text-xs">Description</Label><Textarea value={newRisk.description} onChange={e => setNewRisk(p => ({ ...p, description: e.target.value }))} rows={2} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Likelihood</Label>
                <Select value={newRisk.likelihood} onValueChange={(v: any) => setNewRisk(p => ({ ...p, likelihood: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["low", "medium", "high"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs">Impact</Label>
                <Select value={newRisk.impact} onValueChange={(v: any) => setNewRisk(p => ({ ...p, impact: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["low", "medium", "high"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div><Label className="text-xs">Owner</Label><Input value={newRisk.owner} onChange={e => setNewRisk(p => ({ ...p, owner: e.target.value }))} /></div>
            <div><Label className="text-xs">Mitigation</Label><Textarea value={newRisk.mitigation} onChange={e => setNewRisk(p => ({ ...p, mitigation: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRiskDialog(false)}>Cancel</Button>
            <Button onClick={() => upsertRisk.mutate({ projectId, ...newRisk })} disabled={!newRisk.title.trim() || upsertRisk.isPending}>Log Risk</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Comms */}
      <Dialog open={commDialog} onOpenChange={setCommDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Log Communication</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label className="text-xs">Type</Label>
              <Select value={newComm.type} onValueChange={v => setNewComm(p => ({ ...p, type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["note", "email", "meeting", "action", "follow-up", "escalation"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label className="text-xs">Subject *</Label><Input value={newComm.subject} onChange={e => setNewComm(p => ({ ...p, subject: e.target.value }))} /></div>
            <div><Label className="text-xs">Body</Label><Textarea value={newComm.body} onChange={e => setNewComm(p => ({ ...p, body: e.target.value }))} rows={3} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">From</Label><Input value={newComm.from} onChange={e => setNewComm(p => ({ ...p, from: e.target.value }))} /></div>
              <div><Label className="text-xs">To</Label><Input value={newComm.to} onChange={e => setNewComm(p => ({ ...p, to: e.target.value }))} /></div>
            </div>
            <div><Label className="text-xs">Due Date</Label><Input type="date" value={newComm.dueDate} onChange={e => setNewComm(p => ({ ...p, dueDate: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCommDialog(false)}>Cancel</Button>
            <Button onClick={() => createComm.mutate({ projectId, ...newComm, dueDate: newComm.dueDate || undefined })} disabled={!newComm.subject.trim() || createComm.isPending}>Log</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Automation */}
      <Dialog open={autoDialog} onOpenChange={setAutoDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Automation Idea</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label className="text-xs">Title *</Label><Input value={newAuto.title} onChange={e => setNewAuto(p => ({ ...p, title: e.target.value }))} /></div>
            <div><Label className="text-xs">Description</Label><Textarea value={newAuto.description} onChange={e => setNewAuto(p => ({ ...p, description: e.target.value }))} rows={2} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Area</Label>
                <Select value={newAuto.area} onValueChange={v => setNewAuto(p => ({ ...p, area: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["operations", "finance", "marketing", "sales", "hr", "communications", "reporting"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs">Est. Saving</Label><Input value={newAuto.estimatedSaving} onChange={e => setNewAuto(p => ({ ...p, estimatedSaving: e.target.value }))} placeholder="e.g. 5h/week" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Complexity</Label>
                <Select value={newAuto.complexity} onValueChange={(v: any) => setNewAuto(p => ({ ...p, complexity: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["low", "medium", "high"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs">Priority</Label>
                <Select value={newAuto.priority} onValueChange={(v: any) => setNewAuto(p => ({ ...p, priority: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["low", "medium", "high", "critical"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAutoDialog(false)}>Cancel</Button>
            <Button onClick={() => upsertAuto.mutate({ projectId, ...newAuto })} disabled={!newAuto.title.trim() || upsertAuto.isPending}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Decision */}
      <Dialog open={decisionDialog} onOpenChange={setDecisionDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Log Decision</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label className="text-xs">Title *</Label><Input value={newDecision.title} onChange={e => setNewDecision(p => ({ ...p, title: e.target.value }))} /></div>
            <div><Label className="text-xs">Context</Label><Textarea value={newDecision.context} onChange={e => setNewDecision(p => ({ ...p, context: e.target.value }))} rows={2} /></div>
            <div><Label className="text-xs">Rationale</Label><Textarea value={newDecision.rationale} onChange={e => setNewDecision(p => ({ ...p, rationale: e.target.value }))} rows={2} /></div>
            <div><Label className="text-xs">Impact</Label>
              <Select value={newDecision.impact} onValueChange={(v: any) => setNewDecision(p => ({ ...p, impact: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["low", "medium", "high", "critical"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDecisionDialog(false)}>Cancel</Button>
            <Button onClick={() => createDecision.mutate({ ...newDecision, projectId })} disabled={!newDecision.title.trim() || createDecision.isPending}>Log</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
