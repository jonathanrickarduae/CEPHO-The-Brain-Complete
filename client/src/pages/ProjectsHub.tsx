import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Plus, ChevronRight, AlertCircle, Clock, CheckCircle2, Target, Loader2, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

type RAGStatus = "red" | "amber" | "green";

const RAG_CONFIG: Record<RAGStatus, { label: string; dotClass: string; textClass: string; alertClass: string }> = {
  red:   { label: "Needs Attention", dotClass: "bg-red-500",     textClass: "text-red-500",     alertClass: "bg-red-500/10 border-red-500/20 text-red-400" },
  amber: { label: "In Progress",     dotClass: "bg-amber-400",   textClass: "text-amber-400",   alertClass: "bg-amber-400/10 border-amber-400/20 text-amber-400" },
  green: { label: "On Track",        dotClass: "bg-emerald-500", textClass: "text-emerald-500", alertClass: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" },
};

const RAG_ICONS: Record<RAGStatus, React.ElementType> = { red: AlertCircle, amber: Clock, green: CheckCircle2 };

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function initialsFrom(name: string) {
  return name.split(/\s+/).map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

type ProjectItem = {
  id: number;
  name: string;
  description?: string | null;
  accentColor?: string | null;
  initials?: string | null;
  status: string;
  tasksTotal: number;
  tasksComplete: number;
  blocked?: number;
  lastActivity?: string | null;
};

export default function ProjectsHub() {
  const [, setLocation] = useLocation();

  // Create dialog state
  const [showAdd, setShowAdd]   = useState(false);
  const [newName, setNewName]   = useState("");
  const [newDesc, setNewDesc]   = useState("");
  const [newColor, setNewColor] = useState("#00D4FF");

  // Edit dialog state
  const [editProject, setEditProject] = useState<ProjectItem | null>(null);
  const [editName, setEditName]       = useState("");
  const [editDesc, setEditDesc]       = useState("");
  const [editColor, setEditColor]     = useState("#00D4FF");
  const [editStatus, setEditStatus]   = useState<RAGStatus>("green");

  // Delete confirmation state
  const [deleteProject, setDeleteProject] = useState<ProjectItem | null>(null);

  const utils = trpc.useUtils();
  const { data: projects, isLoading } = trpc.projects.listWithStats.useQuery();

  const createProject = trpc.projects.create.useMutation({
    onSuccess: () => {
      utils.projects.listWithStats.invalidate();
      setShowAdd(false);
      setNewName(""); setNewDesc(""); setNewColor("#00D4FF");
      toast.success("Project created");
    },
    onError: e => toast.error(e.message),
  });

  const updateProject = trpc.projects.update.useMutation({
    onSuccess: () => {
      utils.projects.listWithStats.invalidate();
      setEditProject(null);
      toast.success("Project updated");
    },
    onError: e => toast.error(e.message),
  });

  const deleteProjectMutation = trpc.projects.delete.useMutation({
    onSuccess: () => {
      utils.projects.listWithStats.invalidate();
      setDeleteProject(null);
      toast.success("Project deleted");
    },
    onError: e => toast.error(e.message),
  });

  function openEdit(project: ProjectItem, e: React.MouseEvent) {
    e.stopPropagation();
    setEditProject(project);
    setEditName(project.name);
    setEditDesc(project.description ?? "");
    setEditColor(project.accentColor ?? "#00D4FF");
    setEditStatus((project.status as RAGStatus) ?? "green");
  }

  function openDelete(project: ProjectItem, e: React.MouseEvent) {
    e.stopPropagation();
    setDeleteProject(project);
  }

  const list = (projects ?? []) as ProjectItem[];
  const redCount   = list.filter(p => p.status === "red").length;
  const amberCount = list.filter(p => p.status === "amber").length;
  const greenCount = list.filter(p => p.status === "green").length;

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Projects</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage and monitor all your businesses in one place</p>
        </div>
        <Button size="sm" className="gap-1.5 shrink-0" onClick={() => setShowAdd(true)}>
          <Plus className="h-4 w-4" /> Add Project
        </Button>
      </div>

      {/* RAG summary strip */}
      <div className="flex items-center gap-4 mb-5 px-4 py-3 bg-card rounded-xl border border-border flex-wrap">
        <span className="text-sm font-medium text-muted-foreground">Portfolio Status</span>
        {[
          { count: redCount,   dot: "bg-red-500",     label: "critical"    },
          { count: amberCount, dot: "bg-amber-400",   label: "in progress" },
          { count: greenCount, dot: "bg-emerald-500", label: "on track"    },
        ].map(s => (
          <div key={s.label} className="flex items-center gap-1.5">
            <span className={`h-2.5 w-2.5 rounded-full ${s.dot}`} />
            <span className="text-sm font-semibold text-foreground">{s.count}</span>
            <span className="text-xs text-muted-foreground">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Cards grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-48 bg-muted/30 rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
          {list.map(project => {
            const rag      = RAG_CONFIG[project.status as RAGStatus] ?? RAG_CONFIG.green;
            const RagIcon  = RAG_ICONS[project.status as RAGStatus] ?? CheckCircle2;
            const progress = project.tasksTotal > 0 ? Math.round((project.tasksComplete / project.tasksTotal) * 100) : 0;
            const color    = project.accentColor ?? "#00D4FF";

            return (
              <div key={project.id}
                className="bg-card rounded-2xl border border-border shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group overflow-hidden"
                onClick={() => setLocation(`/projects/${project.id}`)}>

                {/* Accent top bar */}
                <div className="h-1 w-full" style={{ backgroundColor: color }} />

                <div className="p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
                        style={{ backgroundColor: color }}>
                        {project.initials}
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground text-base leading-tight group-hover:text-primary transition-colors">
                          {project.name}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{project.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`h-2.5 w-2.5 rounded-full ${rag.dotClass}`} />
                      <span className={`text-xs font-medium ${rag.textClass}`}>{rag.label}</span>
                      {/* 3-dot menu */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            className="h-6 w-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors opacity-0 group-hover:opacity-100 ml-1"
                            onClick={e => e.stopPropagation()}
                          >
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" onClick={e => e.stopPropagation()}>
                          <DropdownMenuItem onClick={e => openEdit(project, e)}>
                            <Pencil className="h-3.5 w-3.5 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-500 focus:text-red-500"
                            onClick={e => openDelete(project, e)}
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Blocked alert */}
                  {(project.blocked ?? 0) > 0 && (
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs mb-3 ${rag.alertClass}`}>
                      <RagIcon className="h-3.5 w-3.5 shrink-0" />
                      <span className="font-medium">{project.blocked} task{(project.blocked ?? 0) > 1 ? "s" : ""} blocked</span>
                    </div>
                  )}

                  {/* Progress */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                      <span>Tasks</span>
                      <span className="font-medium text-foreground">{project.tasksComplete}/{project.tasksTotal}</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: color }} />
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Target className="h-3 w-3" />
                      <span>{project.lastActivity ?? "No activity"}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary transition-colors shrink-0" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Project Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>New Project</DialogTitle></DialogHeader>
          <div className="space-y-3 py-1">
            <Input placeholder="Project name" value={newName} onChange={e => setNewName(e.target.value)} autoFocus />
            <Input placeholder="Short description" value={newDesc} onChange={e => setNewDesc(e.target.value)} />
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Accent colour</span>
              <input type="color" value={newColor} onChange={e => setNewColor(e.target.value)}
                className="h-7 w-10 rounded cursor-pointer border-0 bg-transparent" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button size="sm"
              disabled={!newName.trim() || createProject.isPending}
              onClick={() => createProject.mutate({
                name: newName.trim(),
                slug: slugify(newName.trim()),
                description: newDesc.trim() || undefined,
                accentColor: newColor,
                initials: initialsFrom(newName.trim()),
              })}>
              {createProject.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Project Dialog */}
      <Dialog open={!!editProject} onOpenChange={open => { if (!open) setEditProject(null); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Edit Project</DialogTitle></DialogHeader>
          <div className="space-y-3 py-1">
            <Input placeholder="Project name" value={editName} onChange={e => setEditName(e.target.value)} autoFocus />
            <Input placeholder="Short description" value={editDesc} onChange={e => setEditDesc(e.target.value)} />
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Accent colour</span>
              <input type="color" value={editColor} onChange={e => setEditColor(e.target.value)}
                className="h-7 w-10 rounded cursor-pointer border-0 bg-transparent" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Status</span>
              <div className="flex gap-2">
                {(["green", "amber", "red"] as RAGStatus[]).map(s => (
                  <button
                    key={s}
                    onClick={() => setEditStatus(s)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border transition-colors ${
                      editStatus === s
                        ? "border-current font-semibold " + RAG_CONFIG[s].textClass
                        : "border-border text-muted-foreground hover:border-foreground/30"
                    }`}
                  >
                    <span className={`h-2 w-2 rounded-full ${RAG_CONFIG[s].dotClass}`} />
                    {RAG_CONFIG[s].label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setEditProject(null)}>Cancel</Button>
            <Button size="sm"
              disabled={!editName.trim() || updateProject.isPending}
              onClick={() => editProject && updateProject.mutate({
                id: editProject.id,
                name: editName.trim(),
                description: editDesc.trim() || undefined,
                accentColor: editColor,
                status: editStatus,
              })}>
              {updateProject.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteProject} onOpenChange={open => { if (!open) setDeleteProject(null); }}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader><DialogTitle>Delete Project</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground py-1">
            Are you sure you want to delete <span className="font-semibold text-foreground">{deleteProject?.name}</span>?
            This will also remove all associated tasks, decisions, and documents.
          </p>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setDeleteProject(null)}>Cancel</Button>
            <Button
              size="sm"
              variant="destructive"
              disabled={deleteProjectMutation.isPending}
              onClick={() => deleteProject && deleteProjectMutation.mutate({ id: deleteProject.id })}
            >
              {deleteProjectMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
