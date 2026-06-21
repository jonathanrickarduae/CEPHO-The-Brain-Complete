// ProjectPortal — Live data from tRPC
import { useLocation, useParams } from "wouter";
import {
  ArrowLeft,
  Plus,
  FileText,
  Target,
  Loader2,
  Trash2,
  CheckSquare,
  BookOpen,
  FolderOpen,
  Bot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { format } from "date-fns";

const STATUS_COLORS: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700 border-emerald-200",
  planning: "bg-blue-100 text-blue-700 border-blue-200",
  on_hold: "bg-amber-100 text-amber-700 border-amber-200",
  completed: "bg-gray-100 text-gray-600 border-gray-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
};

const PRIORITY_COLORS: Record<string, string> = {
  critical: "bg-red-100 text-red-700 border-red-200",
  high: "bg-orange-100 text-orange-700 border-orange-200",
  medium: "bg-amber-100 text-amber-700 border-amber-200",
  low: "bg-gray-100 text-gray-500 border-gray-200",
};

export default function ProjectPortal() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const projectId = parseInt(params.id ?? "0", 10);

  const { data: project, isLoading: projectLoading } = trpc.projects.get.useQuery(
    { id: projectId },
    { enabled: !!projectId }
  );
  const { data: tasksData = [], refetch: refetchTasks } = trpc.tasks.getAll.useQuery(
    { projectId },
    { enabled: !!projectId }
  );
  const { data: decisionsData = [], refetch: refetchDecisions } = trpc.decisions.getAll.useQuery(
    { projectId },
    { enabled: !!projectId }
  );
  const { data: docsData = [], refetch: refetchDocs } = trpc.documents.getAll.useQuery(
    { projectId },
    { enabled: !!projectId }
  );

  const createTask = trpc.tasks.create.useMutation({ onSuccess: () => { refetchTasks(); toast.success("Task created"); setShowNewTask(false); setNewTask({ title: "", description: "", priority: "medium", dueDate: "", assignee: "" }); } });
  const updateTaskStatus = trpc.tasks.updateStatus.useMutation({ onSuccess: () => refetchTasks() });
  const deleteTask = trpc.tasks.delete.useMutation({ onSuccess: () => { refetchTasks(); toast.success("Task deleted"); } });
  const createDecision = trpc.decisions.create.useMutation({ onSuccess: () => { refetchDecisions(); toast.success("Decision logged"); setShowNewDecision(false); setNewDecision({ title: "", context: "", rationale: "", impact: "medium" }); } });

  const [showNewTask, setShowNewTask] = useState(false);
  const [showNewDecision, setShowNewDecision] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", description: "", priority: "medium" as "low" | "medium" | "high" | "critical", dueDate: "", assignee: "" });
  const [newDecision, setNewDecision] = useState({ title: "", context: "", rationale: "", impact: "medium" as "low" | "medium" | "high" | "critical" });

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
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Projects
        </Button>
      </div>
    );
  }

  const activeTasks = (tasksData as any[]).filter(t => t.status !== "done" && t.status !== "completed");
  const doneTasks = (tasksData as any[]).filter(t => t.status === "done" || t.status === "completed");

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="border-b border-border bg-white px-4 py-3 flex items-center gap-3">
        <button onClick={() => setLocation("/projects")} className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-muted active:scale-95 transition-all">
          <ArrowLeft className="h-4 w-4 text-muted-foreground" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-semibold text-foreground text-base truncate">{project.name}</h1>
          {project.description && <p className="text-xs text-muted-foreground truncate">{project.description}</p>}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge className={`text-[10px] border ${STATUS_COLORS[project.status] ?? STATUS_COLORS.active}`}>{project.status}</Badge>
        </div>
      </div>

      <div className="flex items-center gap-0 border-b border-border bg-white/60 px-4 py-2">
        <div className="flex items-center gap-1.5 flex-1 justify-center">
          <CheckSquare className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{activeTasks.length} tasks</span>
        </div>
        <div className="w-px h-4 bg-border" />
        <div className="flex items-center gap-1.5 flex-1 justify-center">
          <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{(decisionsData as any[]).length} decisions</span>
        </div>
        <div className="w-px h-4 bg-border" />
        <div className="flex items-center gap-1.5 flex-1 justify-center">
          <FolderOpen className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{(docsData as any[]).length} docs</span>
        </div>
        {project.progress != null && (
          <>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-1.5 flex-1 justify-center">
              <Target className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{project.progress}%</span>
            </div>
          </>
        )}
      </div>

      <Tabs defaultValue="tasks" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="grid grid-cols-4 mx-4 mt-3 h-9 shrink-0">
          <TabsTrigger value="tasks" className="text-xs">Tasks</TabsTrigger>
          <TabsTrigger value="decisions" className="text-xs">Decisions</TabsTrigger>
          <TabsTrigger value="docs" className="text-xs">Docs</TabsTrigger>
          <TabsTrigger value="victoria" className="text-xs">Victoria</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{activeTasks.length} active</p>
            <Button size="sm" onClick={() => setShowNewTask(true)} className="h-7 px-3 text-xs bg-[oklch(0.78_0.18_195)] hover:bg-[oklch(0.68_0.18_195)] text-white">
              <Plus className="h-3 w-3 mr-1" />Add Task
            </Button>
          </div>
          {activeTasks.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <CheckSquare className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No active tasks</p>
            </div>
          )}
          {activeTasks.map((task: any) => (
            <div key={task.id} className="flex items-start gap-3 p-3 rounded-xl border border-border bg-white">
              <Checkbox checked={false} onCheckedChange={() => updateTaskStatus.mutate({ id: task.id, status: "done" })} className="mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{task.title}</p>
                {task.description && <p className="text-xs text-muted-foreground mt-0.5">{task.description}</p>}
                <div className="flex items-center gap-2 mt-1.5">
                  {task.priority && <Badge className={`text-[10px] border ${PRIORITY_COLORS[task.priority] ?? PRIORITY_COLORS.medium}`}>{task.priority}</Badge>}
                  {task.dueDate && <span className="text-[11px] text-muted-foreground">{format(new Date(task.dueDate), "d MMM")}</span>}
                  {task.assignee && <span className="text-[11px] text-muted-foreground truncate">{task.assignee}</span>}
                </div>
              </div>
              <button onClick={() => deleteTask.mutate({ id: task.id })} className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-red-50 hover:text-red-500 text-muted-foreground transition-colors shrink-0">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          {doneTasks.length > 0 && (
            <div className="space-y-2 opacity-50 mt-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground px-1">Completed ({doneTasks.length})</p>
              {doneTasks.map((task: any) => (
                <div key={task.id} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-white">
                  <Checkbox checked={true} onCheckedChange={() => updateTaskStatus.mutate({ id: task.id, status: "todo" })} className="shrink-0" />
                  <p className="text-sm text-muted-foreground line-through flex-1">{task.title}</p>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="decisions" className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{(decisionsData as any[]).length} logged</p>
            <Button size="sm" onClick={() => setShowNewDecision(true)} className="h-7 px-3 text-xs bg-[oklch(0.78_0.18_195)] hover:bg-[oklch(0.68_0.18_195)] text-white">
              <Plus className="h-3 w-3 mr-1" />Log Decision
            </Button>
          </div>
          {(decisionsData as any[]).length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No decisions logged yet</p>
            </div>
          )}
          {(decisionsData as any[]).map((d: any) => (
            <div key={d.id} className="p-3 rounded-xl border border-border bg-white">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-foreground">{d.title}</p>
                <Badge className={`text-[10px] border shrink-0 ${PRIORITY_COLORS[d.impact] ?? PRIORITY_COLORS.medium}`}>{d.impact}</Badge>
              </div>
              {d.context && <p className="text-xs text-muted-foreground mt-1">{d.context}</p>}
              {d.rationale && <p className="text-xs text-muted-foreground mt-1 italic">"{d.rationale}"</p>}
              <p className="text-[10px] text-muted-foreground/60 mt-1.5">{d.createdAt ? format(new Date(d.createdAt), "d MMM yyyy") : ""}</p>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="docs" className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{(docsData as any[]).length} documents</p>
          </div>
          {(docsData as any[]).length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <FolderOpen className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No documents uploaded</p>
              <p className="text-xs mt-1">Upload from the Document Library</p>
            </div>
          )}
          {(docsData as any[]).map((doc: any) => (
            <div key={doc.id} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-white">
              <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <FileText className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{doc.name}</p>
                <p className="text-xs text-muted-foreground">{doc.fileType} · {doc.createdAt ? format(new Date(doc.createdAt), "d MMM") : ""}</p>
              </div>
              {doc.storageUrl && <a href={doc.storageUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-[oklch(0.78_0.18_195)] hover:underline shrink-0">View</a>}
            </div>
          ))}
        </TabsContent>

        <TabsContent value="victoria" className="flex-1 overflow-y-auto px-4 py-3">
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center py-8">
            <div className="h-12 w-12 rounded-full bg-[oklch(0.78_0.18_195)]/10 flex items-center justify-center">
              <Bot className="h-6 w-6 text-[oklch(0.78_0.18_195)]" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Ask Victoria about {project.name}</p>
              <p className="text-xs text-muted-foreground mt-1">Strategic advice, risk analysis, prioritisation</p>
            </div>
            <Button onClick={() => setLocation("/victoria")} className="bg-[oklch(0.78_0.18_195)] hover:bg-[oklch(0.68_0.18_195)] text-white">Open Victoria</Button>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={showNewTask} onOpenChange={setShowNewTask}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>New Task</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1"><Label className="text-xs">Title *</Label><Input value={newTask.title} onChange={e => setNewTask(p => ({ ...p, title: e.target.value }))} placeholder="Task title" /></div>
            <div className="space-y-1"><Label className="text-xs">Description</Label><Input value={newTask.description} onChange={e => setNewTask(p => ({ ...p, description: e.target.value }))} placeholder="Optional" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label className="text-xs">Priority</Label><Select value={newTask.priority} onValueChange={v => setNewTask(p => ({ ...p, priority: v as any }))}><SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger><SelectContent>{["low","medium","high","critical"].map(p => <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-1"><Label className="text-xs">Due Date</Label><Input type="date" value={newTask.dueDate} onChange={e => setNewTask(p => ({ ...p, dueDate: e.target.value }))} className="text-sm h-9" /></div>
            </div>
            <div className="space-y-1"><Label className="text-xs">Assigned To</Label><Input value={newTask.assignee} onChange={e => setNewTask(p => ({ ...p, assignee: e.target.value }))} placeholder="Name or team" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewTask(false)}>Cancel</Button>
            <Button onClick={() => { if (!newTask.title.trim()) return; createTask.mutate({ ...newTask, projectId }); }} disabled={!newTask.title.trim() || createTask.isPending} className="bg-[oklch(0.78_0.18_195)] text-white hover:bg-[oklch(0.68_0.18_195)]">{createTask.isPending ? "Creating..." : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showNewDecision} onOpenChange={setShowNewDecision}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Log Decision</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1"><Label className="text-xs">Decision *</Label><Input value={newDecision.title} onChange={e => setNewDecision(p => ({ ...p, title: e.target.value }))} placeholder="What was decided?" /></div>
            <div className="space-y-1"><Label className="text-xs">Context</Label><Textarea value={newDecision.context} onChange={e => setNewDecision(p => ({ ...p, context: e.target.value }))} placeholder="Background" rows={2} className="text-sm resize-none" /></div>
            <div className="space-y-1"><Label className="text-xs">Rationale</Label><Textarea value={newDecision.rationale} onChange={e => setNewDecision(p => ({ ...p, rationale: e.target.value }))} placeholder="Why?" rows={2} className="text-sm resize-none" /></div>
            <div className="space-y-1"><Label className="text-xs">Impact</Label><Select value={newDecision.impact} onValueChange={v => setNewDecision(p => ({ ...p, impact: v as any }))}><SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger><SelectContent>{["low","medium","high","critical"].map(i => <SelectItem key={i} value={i} className="capitalize">{i}</SelectItem>)}</SelectContent></Select></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDecision(false)}>Cancel</Button>
            <Button onClick={() => { if (!newDecision.title.trim()) return; createDecision.mutate({ ...newDecision, projectId }); }} disabled={!newDecision.title.trim() || createDecision.isPending} className="bg-[oklch(0.78_0.18_195)] text-white hover:bg-[oklch(0.68_0.18_195)]">{createDecision.isPending ? "Saving..." : "Log Decision"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
