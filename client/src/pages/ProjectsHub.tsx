import { useState } from "react";
import { useLocation } from "wouter";
import { Plus, ChevronRight, AlertCircle, Clock, CheckCircle2, TrendingUp, FileText, MessageSquare, Target, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type RAGStatus = "red" | "amber" | "green";

type Project = {
  id: string;
  name: string;
  description: string;
  status: RAGStatus;
  accentColor: string;
  initials: string;
  tasksTotal: number;
  tasksComplete: number;
  lastActivity: string;
  keyIssue?: string;
  nextAction: string;
};

const defaultProjects: Project[] = [
  {
    id: "celadon",
    name: "Celadon",
    description: "Pharmacy operations & growth",
    status: "amber",
    accentColor: "#10B981",
    initials: "CE",
    tasksTotal: 12,
    tasksComplete: 7,
    lastActivity: "2 hours ago",
    keyIssue: "Licence renewal pending",
    nextAction: "Follow up on licence application",
  },
  {
    id: "celanova",
    name: "Celanova",
    description: "Healthcare innovation",
    status: "green",
    accentColor: "#8B5CF6",
    initials: "CN",
    tasksTotal: 8,
    tasksComplete: 6,
    lastActivity: "1 hour ago",
    nextAction: "Review Q3 product roadmap",
  },
  {
    id: "perfect",
    name: "Perfect",
    description: "PMO client engagement",
    status: "red",
    accentColor: "#F59E0B",
    initials: "PF",
    tasksTotal: 15,
    tasksComplete: 4,
    lastActivity: "Yesterday",
    keyIssue: "3 deliverables overdue",
    nextAction: "Escalate delayed deliverables",
  },
  {
    id: "olmack",
    name: "Olmack",
    description: "Telecoms business",
    status: "green",
    accentColor: "#3B82F6",
    initials: "OL",
    tasksTotal: 6,
    tasksComplete: 5,
    lastActivity: "3 hours ago",
    nextAction: "Monthly review preparation",
  },
  {
    id: "boundless",
    name: "Boundless",
    description: "Energy business",
    status: "amber",
    accentColor: "#EF4444",
    initials: "BL",
    tasksTotal: 10,
    tasksComplete: 5,
    lastActivity: "4 hours ago",
    keyIssue: "Supplier contract review needed",
    nextAction: "Review supplier contract terms",
  },
  {
    id: "personal",
    name: "Personal",
    description: "Personal workspace & goals",
    status: "green",
    accentColor: "#EC4899",
    initials: "ME",
    tasksTotal: 5,
    tasksComplete: 4,
    lastActivity: "Today",
    nextAction: "Weekly personal review",
  },
];

const ragConfig: Record<RAGStatus, { label: string; color: string; bg: string; icon: React.FC<any> }> = {
  red: {
    label: "Needs Attention",
    color: "text-red-600",
    bg: "bg-red-50 border-red-200",
    icon: AlertCircle,
  },
  amber: {
    label: "In Progress",
    color: "text-amber-600",
    bg: "bg-amber-50 border-amber-200",
    icon: Clock,
  },
  green: {
    label: "On Track",
    color: "text-emerald-600",
    bg: "bg-emerald-50 border-emerald-200",
    icon: CheckCircle2,
  },
};

function RAGDot({ status }: { status: RAGStatus }) {
  const colors: Record<RAGStatus, string> = {
    red: "bg-red-500",
    amber: "bg-amber-400",
    green: "bg-emerald-500",
  };
  return <span className={`inline-block h-2.5 w-2.5 rounded-full ${colors[status]} shrink-0`} />;
}

function ProjectCard({ project, onClick }: { project: Project; onClick: () => void }) {
  const rag = ragConfig[project.status];
  const RagIcon = rag.icon;
  const progress = project.tasksTotal > 0 ? (project.tasksComplete / project.tasksTotal) * 100 : 0;

  return (
    <div
      className="bg-white rounded-2xl border border-border shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group overflow-hidden"
      onClick={onClick}
    >
      {/* Accent top bar */}
      <div className="h-1 w-full" style={{ backgroundColor: project.accentColor }} />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            {/* Project avatar */}
            <div
              className="h-11 w-11 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
              style={{ backgroundColor: project.accentColor }}
            >
              {project.initials}
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-base leading-tight group-hover:text-primary transition-colors">
                {project.name}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">{project.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <RAGDot status={project.status} />
            <span className={`text-xs font-medium ${rag.color}`}>{rag.label}</span>
          </div>
        </div>

        {/* Key issue */}
        {project.keyIssue && (
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs mb-3 ${rag.bg}`}>
            <RagIcon className={`h-3.5 w-3.5 shrink-0 ${rag.color}`} />
            <span className={`font-medium ${rag.color}`}>{project.keyIssue}</span>
          </div>
        )}

        {/* Progress */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <span>Tasks</span>
            <span className="font-medium text-foreground">{project.tasksComplete}/{project.tasksTotal}</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${progress}%`, backgroundColor: project.accentColor }}
            />
          </div>
        </div>

        {/* Next action */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Target className="h-3 w-3" />
            <span className="truncate max-w-[180px]">{project.nextAction}</span>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary transition-colors shrink-0" />
        </div>
      </div>
    </div>
  );
}

export default function ProjectsHub() {
  const [, setLocation] = useLocation();
  const [projects] = useState<Project[]>(defaultProjects);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");

  const redCount = projects.filter((p) => p.status === "red").length;
  const amberCount = projects.filter((p) => p.status === "amber").length;
  const greenCount = projects.filter((p) => p.status === "green").length;

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      {/* Page header */}
      <div className="flex items-start justify-between mb-4 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Projects</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage and monitor all your businesses in one place
          </p>
        </div>
        <Button
          onClick={() => setShowAddDialog(true)}
          className="gap-2"
          size="sm"
        >
          <Plus className="h-4 w-4" />
          Add Project
        </Button>
      </div>

      {/* RAG summary bar */}
      <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6 p-3 sm:p-4 bg-white rounded-xl border border-border shadow-sm flex-wrap">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onClick={() => setLocation(`/projects/${project.id}`)}
          />
        ))}
      </div>

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
                placeholder="e.g. Acme Corp"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setShowAddDialog(false);
                setNewProjectName("");
              }}
              disabled={!newProjectName.trim()}
            >
              Create Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
