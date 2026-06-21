import { useState } from "react";
import { useLocation } from "wouter";
import { Plus, ChevronRight, AlertCircle, Clock, CheckCircle2, Target, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

type RAGStatus = "red" | "amber" | "green";

function dbStatusToRAG(status: string, progress: number): RAGStatus {
  if (status === "blocked") return "red";
  if (status === "complete") return "green";
  if (status === "in_progress") return progress < 30 ? "amber" : "green";
  if (status === "review") return "amber";
  return "amber";
}

const ACCENT_COLORS: Record<string, string> = {
  celadon: "#10B981",
  celanova: "#8B5CF6",
  perfect: "#F59E0B",
  olmack: "#3B82F6",
  boundless: "#EF4444",
  personal: "#EC4899",
};

function getAccentColor(name: string): string {
  const key = name.toLowerCase().replace(/\s+/g, "");
  return ACCENT_COLORS[key] || "#6366F1";
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const ragConfig: Record<RAGStatus, { label: string; color: string; bg: string; icon: React.FC<any> }> = {
  red: { label: "Needs Attention", color: "text-red-600", bg: "bg-red-50 border-red-200", icon: AlertCircle },
  amber: { label: "In Progress", color: "text-amber-600", bg: "bg-amber-50 border-amber-200", icon: Clock },
  green: { label: "On Track", color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200", icon: CheckCircle2 },
};

function RAGDot({ status }: { status: RAGStatus }) {
  const colors: Record<RAGStatus, string> = { red: "bg-red-500", amber: "bg-amber-400", green: "bg-emerald-500" };
  return <span className={`inline-block h-2.5 w-2.5 rounded-full ${colors[status]} shrink-0`} />;
}

function ProjectCard({ project, onClick }: { project: any; onClick: () => void }) {
  const ragStatus = dbStatusToRAG(project.status, project.progress ?? 0);
  const rag = ragConfig[ragStatus];
  const RagIcon = rag.icon;
  const accentColor = getAccentColor(project.name);
  const initials = getInitials(project.name);
  const progress = project.progress ?? 0;

  return (
    <div
      className="bg-white rounded-2xl border border-border shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group overflow-hidden"
      onClick={onClick}
    >
      <div className="h-1 w-full" style={{ backgroundColor: accentColor }} />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div
              className="h-11 w-11 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
              style={{ backgroundColor: accentColor }}
            >
              {initials}
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-base leading-tight group-hover:text-primary transition-colors">
                {project.name}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">{project.description || "No description"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <RAGDot status={ragStatus} />
            <span className={`text-xs font-medium ${rag.color}`}>{rag.label}</span>
          </div>
        </div>

        {project.blockerDescription && (
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs mb-3 ${rag.bg}`}>
            <RagIcon className={`h-3.5 w-3.5 shrink-0 ${rag.color}`} />
            <span className={`font-medium ${rag.color} truncate`}>{project.blockerDescription}</span>
          </div>
        )}

        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <span>Progress</span>
            <span className="font-medium text-foreground">{progress}%</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${progress}%`, backgroundColor: accentColor }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Target className="h-3 w-3" />
            <span className="truncate max-w-[180px]">
              {project.priority === "critical" ? "Critical priority" :
               project.priority === "high" ? "High priority" :
               project.priority === "medium" ? "Medium priority" : "Low priority"}
            </span>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary transition-colors shrink-0" />
        </div>
      </div>
    </div>
  );
}

export default function ProjectsHub() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");

  const utils = trpc.useUtils();

  const { data: projectsData, isLoading } = trpc.projects.list.useQuery(
    undefined,
    { enabled: !!user }
  );

  const createMutation = trpc.projects.create.useMutation({
    onSuccess: () => {
      utils.projects.list.invalidate();
      setShowAddDialog(false);
      setNewProjectName("");
      setNewProjectDesc("");
      toast.success("Project created");
    },
    onError: () => toast.error("Failed to create project"),
  });

  const projects = projectsData ?? [];
  const redCount = projects.filter((p) => dbStatusToRAG(p.status, p.progress ?? 0) === "red").length;
  const amberCount = projects.filter((p) => dbStatusToRAG(p.status, p.progress ?? 0) === "amber").length;
  const greenCount = projects.filter((p) => dbStatusToRAG(p.status, p.progress ?? 0) === "green").length;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Projects</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage and monitor all your businesses in one place
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="gap-2" size="sm">
          <Plus className="h-4 w-4" />
          Add Project
        </Button>
      </div>

      {/* RAG summary bar */}
      <div className="flex items-center gap-4 mb-6 p-4 bg-white rounded-xl border border-border shadow-sm">
        <span className="text-sm font-medium text-muted-foreground">Portfolio Status</span>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500 inline-block" />
          <span className="text-sm font-semibold text-foreground">{redCount}</span>
          <span className="text-xs text-muted-foreground">critical</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400 inline-block" />
          <span className="text-sm font-semibold text-foreground">{amberCount}</span>
          <span className="text-xs text-muted-foreground">in progress</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 inline-block" />
          <span className="text-sm font-semibold text-foreground">{greenCount}</span>
          <span className="text-xs text-muted-foreground">on track</span>
        </div>
      </div>

      {/* Project cards grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-lg font-medium mb-2">No projects yet</p>
          <p className="text-sm mb-4">Add your first project to get started.</p>
          <Button onClick={() => setShowAddDialog(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Project
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={() => setLocation(`/projects/${project.id}`)}
            />
          ))}
        </div>
      )}

      {/* Add Project Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="project-name">Project Name</Label>
              <Input
                id="project-name"
                placeholder="e.g. Celadon"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-desc">Description (optional)</Label>
              <Textarea
                id="project-desc"
                placeholder="Brief description of this project"
                value={newProjectDesc}
                onChange={(e) => setNewProjectDesc(e.target.value)}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() =>
                createMutation.mutate({
                  name: newProjectName.trim(),
                  description: newProjectDesc.trim() || undefined,
                })
              }
              disabled={!newProjectName.trim() || createMutation.isPending}
            >
              {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Create Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
