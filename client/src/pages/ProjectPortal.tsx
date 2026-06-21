import { useLocation, useParams } from "wouter";
import { ArrowLeft, AlertCircle, Clock, CheckCircle2, Plus, FileText, MessageSquare, Target, MoreHorizontal, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";

type RAGStatus = "red" | "amber" | "green";

const projectData: Record<string, {
  name: string;
  description: string;
  status: RAGStatus;
  accentColor: string;
  initials: string;
  overview: string;
  tasks: { id: string; title: string; done: boolean; priority: "high" | "medium" | "low"; due?: string }[];
  documents: { name: string; type: string; updated: string }[];
  decisions: { date: string; decision: string; rationale: string }[];
}> = {
  celadon: {
    name: "Celadon",
    description: "Pharmacy operations & growth",
    status: "amber",
    accentColor: "#10B981",
    initials: "CE",
    overview: "Celadon manages pharmacy operations including prescription fulfilment and geographic expansion. Current focus is on licence renewal and operational efficiency.",
    tasks: [
      { id: "1", title: "Follow up on licence renewal application", done: false, priority: "high", due: "Today" },
      { id: "2", title: "Review Q3 operational report", done: false, priority: "medium", due: "This week" },
      { id: "3", title: "Prepare board update presentation", done: true, priority: "medium" },
      { id: "4", title: "Confirm shipping partner contract", done: false, priority: "high", due: "Tomorrow" },
    ],
    documents: [
      { name: "Licence Application 2026", type: "PDF", updated: "2 days ago" },
      { name: "Q2 Operations Report", type: "DOC", updated: "1 week ago" },
      { name: "Shipping Partner Agreement", type: "PDF", updated: "3 days ago" },
    ],
    decisions: [
      { date: "Jun 10", decision: "Proceed with northern expansion", rationale: "Market analysis shows 40% growth opportunity" },
      { date: "May 28", decision: "Switch to new shipping partner", rationale: "Cost reduction of 18% with improved SLA" },
    ],
  },
  celanova: {
    name: "Celanova",
    description: "Healthcare innovation",
    status: "green",
    accentColor: "#8B5CF6",
    initials: "CN",
    overview: "Celanova is focused on healthcare innovation, developing new product lines and strategic partnerships. Currently on track with Q3 milestones.",
    tasks: [
      { id: "1", title: "Review Q3 product roadmap", done: false, priority: "medium", due: "This week" },
      { id: "2", title: "Partnership meeting with MedTech Co", done: false, priority: "high", due: "Tomorrow" },
      { id: "3", title: "Complete regulatory submission", done: true, priority: "high" },
    ],
    documents: [
      { name: "Product Roadmap Q3 2026", type: "DOC", updated: "Yesterday" },
      { name: "Regulatory Submission Pack", type: "PDF", updated: "1 week ago" },
    ],
    decisions: [
      { date: "Jun 15", decision: "Prioritise MedTech partnership", rationale: "Accelerates go-to-market by 6 months" },
    ],
  },
  perfect: {
    name: "Perfect",
    description: "PMO client engagement",
    status: "red",
    accentColor: "#F59E0B",
    initials: "PF",
    overview: "PMO engagement with 3 deliverables currently overdue. Immediate escalation required to get back on track.",
    tasks: [
      { id: "1", title: "Escalate delayed Phase 2 deliverables", done: false, priority: "high", due: "Today" },
      { id: "2", title: "Client status call — reschedule", done: false, priority: "high", due: "Today" },
      { id: "3", title: "Update project plan with revised dates", done: false, priority: "high", due: "Tomorrow" },
      { id: "4", title: "Risk register review", done: false, priority: "medium", due: "This week" },
    ],
    documents: [
      { name: "Project Plan v4", type: "DOC", updated: "3 days ago" },
      { name: "Risk Register", type: "XLS", updated: "1 week ago" },
      { name: "Client Brief", type: "PDF", updated: "2 weeks ago" },
    ],
    decisions: [
      { date: "Jun 18", decision: "Extend Phase 2 deadline by 2 weeks", rationale: "Resource constraints from client side" },
    ],
  },
  olmack: {
    name: "Olmack",
    description: "Telecoms business",
    status: "green",
    accentColor: "#3B82F6",
    initials: "OL",
    overview: "Olmack telecoms is performing well. Monthly review preparation is the current priority.",
    tasks: [
      { id: "1", title: "Monthly review preparation", done: false, priority: "medium", due: "This week" },
      { id: "2", title: "Network upgrade sign-off", done: true, priority: "high" },
      { id: "3", title: "Customer satisfaction survey review", done: true, priority: "medium" },
    ],
    documents: [
      { name: "Monthly Review Pack — June", type: "DOC", updated: "Today" },
      { name: "Network Upgrade Proposal", type: "PDF", updated: "1 week ago" },
    ],
    decisions: [
      { date: "Jun 12", decision: "Proceed with network upgrade", rationale: "Capacity planning requires 30% increase" },
    ],
  },
  boundless: {
    name: "Boundless",
    description: "Energy business",
    status: "amber",
    accentColor: "#EF4444",
    initials: "BL",
    overview: "Boundless energy business requires supplier contract review. Mid-term outlook positive with new contracts in pipeline.",
    tasks: [
      { id: "1", title: "Review supplier contract terms", done: false, priority: "high", due: "This week" },
      { id: "2", title: "Pipeline review — new contracts", done: false, priority: "medium", due: "This week" },
      { id: "3", title: "Q2 financial close", done: true, priority: "high" },
    ],
    documents: [
      { name: "Supplier Contract 2026", type: "PDF", updated: "2 days ago" },
      { name: "Pipeline Tracker", type: "XLS", updated: "Yesterday" },
    ],
    decisions: [
      { date: "Jun 14", decision: "Renegotiate supplier terms", rationale: "Market rates have shifted 12% since last agreement" },
    ],
  },
  personal: {
    name: "Personal",
    description: "Personal workspace & goals",
    status: "green",
    accentColor: "#EC4899",
    initials: "ME",
    overview: "Personal workspace for goals, learning, and life management.",
    tasks: [
      { id: "1", title: "Weekly personal review", done: false, priority: "medium", due: "Sunday" },
      { id: "2", title: "Read AI Agent Master Guide", done: false, priority: "medium" },
      { id: "3", title: "Gym — 3x this week", done: true, priority: "low" },
    ],
    documents: [
      { name: "Personal Goals 2026", type: "DOC", updated: "1 week ago" },
    ],
    decisions: [],
  },
};

const ragConfig: Record<RAGStatus, { label: string; color: string; dotColor: string }> = {
  red: { label: "Needs Attention", color: "text-red-600", dotColor: "bg-red-500" },
  amber: { label: "In Progress", color: "text-amber-600", dotColor: "bg-amber-400" },
  green: { label: "On Track", color: "text-emerald-600", dotColor: "bg-emerald-500" },
};

const priorityConfig = {
  high: { label: "High", className: "bg-red-50 text-red-700 border-red-200" },
  medium: { label: "Medium", className: "bg-amber-50 text-amber-700 border-amber-200" },
  low: { label: "Low", className: "bg-slate-50 text-slate-600 border-slate-200" },
};

const docTypeColors: Record<string, string> = {
  PDF: "bg-red-50 text-red-700",
  DOC: "bg-blue-50 text-blue-700",
  XLS: "bg-emerald-50 text-emerald-700",
};

export default function ProjectPortal() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const projectId = params.id;
  const project = projectData[projectId];

  const [tasks, setTasks] = useState(project?.tasks ?? []);

  if (!project) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Project not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => setLocation("/projects")}>
          Back to Projects
        </Button>
      </div>
    );
  }

  const rag = ragConfig[project.status];
  const completedTasks = tasks.filter((t) => t.done).length;
  const progress = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

  const toggleTask = (id: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => setLocation("/projects")}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-5"
      >
        <ArrowLeft className="h-4 w-4" />
        All Projects
      </button>

      {/* Project header */}
      <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden mb-6">
        <div className="h-1.5 w-full" style={{ backgroundColor: project.accentColor }} />
        <div className="p-5 flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className="h-14 w-14 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0"
              style={{ backgroundColor: project.accentColor }}
            >
              {project.initials}
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">{project.name}</h1>
              <p className="text-sm text-muted-foreground">{project.description}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`h-2 w-2 rounded-full ${rag.dotColor} inline-block`} />
                <span className={`text-xs font-medium ${rag.color}`}>{rag.label}</span>
                <span className="text-xs text-muted-foreground">·</span>
                <span className="text-xs text-muted-foreground">{completedTasks}/{tasks.length} tasks complete</span>
              </div>
            </div>
          </div>

          {/* Progress ring placeholder */}
          <div className="text-right shrink-0">
            <div className="text-2xl font-bold text-foreground">{Math.round(progress)}%</div>
            <div className="text-xs text-muted-foreground">complete</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="tasks">
        <TabsList className="mb-4">
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="decisions">Decisions</TabsTrigger>
          <TabsTrigger value="victoria">Ask Victoria</TabsTrigger>
        </TabsList>

        {/* Tasks */}
        <TabsContent value="tasks">
          <div className="bg-white rounded-2xl border border-border shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-foreground">Action List</h2>
              <Button size="sm" variant="outline" className="gap-1.5 h-8 text-xs">
                <Plus className="h-3.5 w-3.5" />
                Add Task
              </Button>
            </div>
            <div className="space-y-2">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={`flex items-start gap-3 p-3 rounded-xl border transition-colors ${
                    task.done ? "bg-muted/30 border-border/50" : "bg-white border-border hover:border-primary/30"
                  }`}
                >
                  <Checkbox
                    checked={task.done}
                    onCheckedChange={() => toggleTask(task.id)}
                    className="mt-0.5 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${task.done ? "line-through text-muted-foreground" : "text-foreground"}`}>
                      {task.title}
                    </p>
                    {task.due && !task.done && (
                      <p className="text-xs text-muted-foreground mt-0.5">Due: {task.due}</p>
                    )}
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 shrink-0 ${priorityConfig[task.priority].className}`}
                  >
                    {priorityConfig[task.priority].label}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Overview */}
        <TabsContent value="overview">
          <div className="bg-white rounded-2xl border border-border shadow-sm p-5">
            <h2 className="font-semibold text-foreground mb-3">Project Overview</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{project.overview}</p>
          </div>
        </TabsContent>

        {/* Documents */}
        <TabsContent value="documents">
          <div className="bg-white rounded-2xl border border-border shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-foreground">Documents</h2>
              <Button size="sm" variant="outline" className="gap-1.5 h-8 text-xs">
                <Plus className="h-3.5 w-3.5" />
                Upload
              </Button>
            </div>
            <div className="space-y-2">
              {project.documents.map((doc, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/30 transition-colors cursor-pointer">
                  <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">Updated {doc.updated}</p>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${docTypeColors[doc.type] ?? "bg-slate-50 text-slate-600"}`}>
                    {doc.type}
                  </span>
                </div>
              ))}
              {project.documents.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6">No documents yet.</p>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Decisions */}
        <TabsContent value="decisions">
          <div className="bg-white rounded-2xl border border-border shadow-sm p-5">
            <h2 className="font-semibold text-foreground mb-4">Decision Log</h2>
            <div className="space-y-3">
              {project.decisions.map((d, i) => (
                <div key={i} className="p-4 rounded-xl border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-muted-foreground">{d.date}</span>
                  </div>
                  <p className="text-sm font-medium text-foreground">{d.decision}</p>
                  <p className="text-xs text-muted-foreground mt-1">{d.rationale}</p>
                </div>
              ))}
              {project.decisions.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6">No decisions logged yet.</p>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Ask Victoria */}
        <TabsContent value="victoria">
          <div className="bg-white rounded-2xl border border-border shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-4 w-4 text-primary" />
              <h2 className="font-semibold text-foreground">Ask Victoria</h2>
            </div>
            <div className="bg-muted/40 rounded-xl p-4 text-center">
              <p className="text-sm text-muted-foreground">
                Victoria can analyse this project, suggest next actions, draft emails, and more.
              </p>
              <Button className="mt-4 gap-2" size="sm">
                <Sparkles className="h-3.5 w-3.5" />
                Start conversation
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
