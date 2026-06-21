import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Loader2, Calendar, User, CheckSquare, Square } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import type { Task } from "../../../drizzle/schema";

const PRIORITIES = ["low", "medium", "high", "critical"] as const;

const PRIORITY_STYLES: Record<string, string> = {
  critical: "bg-rose-100 text-rose-700 border-rose-200",
  high: "bg-orange-100 text-orange-700 border-orange-200",
  medium: "bg-amber-100 text-amber-700 border-amber-200",
  low: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

const STATUS_STYLES: Record<string, string> = {
  todo: "bg-gray-100 text-gray-600",
  in_progress: "bg-blue-100 text-blue-700",
  done: "bg-emerald-100 text-emerald-700",
  blocked: "bg-rose-100 text-rose-700",
};

const RAG_BORDER: Record<string, string> = {
  critical: "border-l-rose-600",
  high: "border-l-orange-500",
  medium: "border-l-amber-500",
  low: "border-l-emerald-500",
};

interface NewTask {
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "critical";
  dueDate: string;
  assignee: string;
}

export default function TasksPage() {
  const { data: tasks = [], refetch, isLoading } = trpc.tasks.getAll.useQuery({});
  const createTask = trpc.tasks.create.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Task created");
      setShowNew(false);
      setNewTask({ title: "", description: "", priority: "medium", dueDate: "", assignee: "" });
    },
    onError: () => toast.error("Failed to create task"),
  });
  const updateStatus = trpc.tasks.updateStatus.useMutation({ onSuccess: () => refetch() });
  const deleteTask = trpc.tasks.delete.useMutation({ onSuccess: () => { refetch(); toast.success("Task deleted"); } });

  const [showNew, setShowNew] = useState(false);
  const [filterStatus, setFilterStatus] = useState("All");
  const [showDone, setShowDone] = useState(false);
  const [newTask, setNewTask] = useState<NewTask>({ title: "", description: "", priority: "medium", dueDate: "", assignee: "" });

  const activeTasks = (tasks as Task[]).filter(t => t.status !== "done");
  const doneTasks = (tasks as Task[]).filter(t => t.status === "done");

  const filtered = activeTasks.filter(t => {
    if (filterStatus !== "All" && t.status !== filterStatus) return false;
    return true;
  });

  const handleCreate = () => {
    if (!newTask.title.trim()) return;
    createTask.mutate({
      title: newTask.title,
      description: newTask.description || undefined,
      priority: newTask.priority,
      dueDate: newTask.dueDate || undefined,
      assignee: newTask.assignee || undefined,
    });
  };

  const toggleDone = (task: Task) => {
    updateStatus.mutate({ id: task.id, status: task.status === "done" ? "todo" : "done" });
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Tasks</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {activeTasks.filter(t => t.status === "blocked").length > 0
              ? `${activeTasks.length} active · ${activeTasks.filter(t => t.status === "blocked").length} blocked`
              : `${activeTasks.length} active · ${doneTasks.length} completed`}
          </p>
        </div>
        <Button onClick={() => setShowNew(true)} className="bg-[oklch(0.78_0.18_195)] text-white hover:bg-[oklch(0.68_0.18_195)] gap-1.5">
          <Plus className="w-4 h-4" /> New Task
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <div className="rounded-xl border border-border bg-white p-3 sm:p-4">
          <p className="text-xs text-muted-foreground">Active</p>
          <p className="text-xl sm:text-2xl font-bold text-foreground">{activeTasks.filter(t => t.status === "todo" || t.status === "in_progress").length}</p>
        </div>
        <div className={`rounded-xl border bg-white p-3 sm:p-4 ${activeTasks.filter(t => t.status === "blocked").length > 0 ? "border-rose-200" : "border-border"}`}>
          <p className={`text-xs ${activeTasks.filter(t => t.status === "blocked").length > 0 ? "text-rose-600" : "text-muted-foreground"}`}>Blocked</p>
          <p className={`text-xl sm:text-2xl font-bold ${activeTasks.filter(t => t.status === "blocked").length > 0 ? "text-rose-600" : "text-foreground"}`}>{activeTasks.filter(t => t.status === "blocked").length}</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-3 sm:p-4">
          <p className="text-xs text-muted-foreground">Completed</p>
          <p className="text-xl sm:text-2xl font-bold text-emerald-600">{doneTasks.length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40 text-sm h-9"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Statuses</SelectItem>
            <SelectItem value="todo">To Do</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="blocked">Blocked</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Task list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-[oklch(0.78_0.18_195)]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-sm font-medium text-foreground mb-1">No active tasks</p>
          <p className="text-xs text-muted-foreground">Create your first task to get started.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(task => (
            <div key={task.id} className={`rounded-xl border-l-4 border border-border bg-white p-4 flex items-start gap-3 ${RAG_BORDER[task.priority]} active:bg-muted/30 transition-colors`} style={{ minHeight: 64 }}>
              <button onClick={() => toggleDone(task)} className="mt-0.5 shrink-0 text-muted-foreground hover:text-[oklch(0.78_0.18_195)] transition-colors" style={{ minWidth: 32, minHeight: 32 }}>
                <Square className="w-5 h-5" />
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium text-foreground">{task.title}</p>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Badge className={`text-[10px] border ${PRIORITY_STYLES[task.priority]}`}>{task.priority}</Badge>
                    <Badge className={`text-[10px] ${STATUS_STYLES[task.status]}`}>{task.status.replace("_", " ")}</Badge>
                  </div>
                </div>
                {task.description && <p className="text-xs text-muted-foreground mt-0.5">{task.description}</p>}
                <div className="flex items-center gap-4 mt-2">
                  {task.assignee && <span className="text-[11px] text-muted-foreground flex items-center gap-1"><User className="w-3 h-3" />{task.assignee}</span>}
                  {task.dueDate && <span className="text-[11px] text-muted-foreground flex items-center gap-1"><Calendar className="w-3 h-3" />{format(new Date(task.dueDate), "d MMM")}</span>}
                </div>
              </div>
              <button onClick={() => deleteTask.mutate({ id: task.id })} className="text-muted-foreground hover:text-rose-500 transition-colors shrink-0" style={{ minWidth: 36, minHeight: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="text-sm">✕</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Completed toggle */}
      {doneTasks.length > 0 && (
        <button onClick={() => setShowDone(!showDone)} className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
          <CheckSquare className="h-4 w-4" />
          {showDone ? "Hide" : "Show"} completed ({doneTasks.length})
        </button>
      )}
      {showDone && (
        <div className="space-y-2 opacity-60">
          {doneTasks.map(task => (
            <div key={task.id} className="rounded-xl border border-border bg-white p-4 flex items-center gap-3">
              <button onClick={() => toggleDone(task)} className="shrink-0 text-emerald-500">
                <CheckSquare className="w-4 h-4" />
              </button>
              <p className="text-sm line-through text-muted-foreground flex-1">{task.title}</p>
            </div>
          ))}
        </div>
      )}

      {/* New Task Dialog */}
      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>New Task</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Title *</Label>
              <Input value={newTask.title} onChange={e => setNewTask(p => ({ ...p, title: e.target.value }))} placeholder="Task title" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Description</Label>
              <Input value={newTask.description} onChange={e => setNewTask(p => ({ ...p, description: e.target.value }))} placeholder="Optional details" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Priority</Label>
                <Select value={newTask.priority} onValueChange={v => setNewTask(p => ({ ...p, priority: v as typeof newTask.priority }))}>
                  <SelectTrigger className="text-sm h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map(p => <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs flex items-center gap-1"><Calendar className="w-3 h-3" /> Due Date</Label>
                <Input type="date" value={newTask.dueDate} onChange={e => setNewTask(p => ({ ...p, dueDate: e.target.value }))} className="text-sm" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs flex items-center gap-1"><User className="w-3 h-3" /> Assigned To</Label>
              <Input value={newTask.assignee} onChange={e => setNewTask(p => ({ ...p, assignee: e.target.value }))} placeholder="Name or team" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNew(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!newTask.title.trim() || createTask.isPending} className="bg-[oklch(0.78_0.18_195)] text-white hover:bg-[oklch(0.68_0.18_195)]">
              {createTask.isPending ? "Creating..." : "Create Task"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
