import { useAuth } from "@/_core/hooks/useAuth";
import { AlertCircle, ChevronRight, Sun, Inbox, Sparkles, ArrowRight, CheckCircle2, UserCheck, AlertTriangle, Bot, Calendar, TrendingUp } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";
import AnimatedBrainLogo from "@/components/AnimatedBrainLogo";
import { toast } from "sonner";

type RAGStatus = "red" | "amber" | "green";

const projects = [
  { id: "celadon", name: "Celadon", initials: "CE", color: "#10B981", status: "amber" as RAGStatus, issue: "Licence renewal pending", action: "Follow up on licence", urgency: "Today" },
  { id: "celanova", name: "Celanova", initials: "CN", color: "#8B5CF6", status: "green" as RAGStatus, issue: null, action: "Review Q3 roadmap", urgency: "This week" },
  { id: "perfect", name: "Perfect", initials: "PF", color: "#F59E0B", status: "red" as RAGStatus, issue: "3 deliverables overdue", action: "Escalate deliverables", urgency: "Urgent" },
  { id: "olmack", name: "Olmack", initials: "OL", color: "#3B82F6", status: "green" as RAGStatus, issue: null, action: "Monthly review prep", urgency: "This week" },
  { id: "boundless", name: "Boundless", initials: "BL", color: "#EF4444", status: "amber" as RAGStatus, issue: "Supplier contract review", action: "Review contract terms", urgency: "Today" },
  { id: "personal", name: "Personal", initials: "ME", color: "#EC4899", status: "green" as RAGStatus, issue: null, action: "Weekly review", urgency: "This week" },
];

const ragBorder: Record<RAGStatus, string> = {
  red: "border-l-red-500",
  amber: "border-l-amber-400",
  green: "border-l-emerald-500",
};

const ragDot: Record<RAGStatus, string> = {
  red: "bg-red-500",
  amber: "bg-amber-400",
  green: "bg-emerald-500",
};

const ragLabel: Record<RAGStatus, string> = {
  red: "Needs attention",
  amber: "In progress",
  green: "On track",
};

const ragTextColor: Record<RAGStatus, string> = {
  red: "text-red-600",
  amber: "text-amber-600",
  green: "text-emerald-600",
};

function getGreeting(name?: string) {
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  return `${timeGreeting}${name ? `, ${name.split(" ")[0]}` : ""}`;
}

function getDateString() {
  return new Date().toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

export default function NexusDashboard() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const firstName = user?.name ?? undefined;
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [actioned, setActioned] = useState<Set<string>>(new Set());

  const redProjects = projects.filter((p) => p.status === "red" && !dismissed.has(p.id));
  const amberProjects = projects.filter((p) => p.status === "amber" && !dismissed.has(p.id));
  const allActive = projects.filter((p) => !dismissed.has(p.id));

  const handleAction = (id: string, type: "approve" | "delegate" | "escalate") => {
    const labels = { approve: "Action approved", delegate: "Delegated to team", escalate: "Escalated to Victoria" };
    toast.success(labels[type]);
    setActioned(prev => { const s = new Set(prev); s.add(id); return s; });
    setTimeout(() => setDismissed(prev => { const s = new Set(prev); s.add(id); return s; }), 600);
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-5">

      {/* Victoria greeting — compact on mobile */}
      <div className="bg-white rounded-2xl border border-border shadow-sm p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="shrink-0 mt-0.5">
            <AnimatedBrainLogo size="sm" intensity="active" color="var(--color-primary)" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-primary uppercase tracking-wide">Victoria</span>
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-xs text-muted-foreground hidden sm:inline">AI Chief of Staff</span>
            </div>
            <h2 className="text-base sm:text-lg font-semibold text-foreground">
              {getGreeting(firstName)}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">{getDateString()}</p>
            <p className="text-sm text-foreground/80 mt-1.5">
              {redProjects.length > 0
                ? `${redProjects.length} project${redProjects.length > 1 ? "s" : ""} need immediate action. ${amberProjects.length} in progress.`
                : `All projects progressing. ${amberProjects.length} in progress, ${allActive.filter(p => p.status === "green").length} on track.`}
            </p>
          </div>
          <button
            onClick={() => setLocation("/morning-signal")}
            className="shrink-0 flex items-center gap-1.5 h-8 px-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-xs font-medium hover:bg-amber-100 active:scale-95 transition-all"
          >
            <Sun className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Signal</span>
          </button>
        </div>
      </div>

      {/* Action-required cards — RED first */}
      {redProjects.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-red-500 mb-2 px-1">
            Action Required
          </p>
          <div className="space-y-2">
            {redProjects.map((p) => (
              <ActionCard
                key={p.id}
                project={p}
                actioned={actioned.has(p.id)}
                onAction={handleAction}
                onOpen={() => setLocation(`/projects/${p.id}`)}
              />
            ))}
          </div>
        </div>
      )}

      {/* In progress — AMBER */}
      {amberProjects.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-500 mb-2 px-1">
            In Progress
          </p>
          <div className="space-y-2">
            {amberProjects.map((p) => (
              <ActionCard
                key={p.id}
                project={p}
                actioned={actioned.has(p.id)}
                onAction={handleAction}
                onOpen={() => setLocation(`/projects/${p.id}`)}
              />
            ))}
          </div>
        </div>
      )}

      {/* On track — GREEN — compact list */}
      {allActive.filter(p => p.status === "green").length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2 px-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600">
              On Track
            </p>
            <button
              onClick={() => setLocation("/projects")}
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              All projects <ChevronRight className="h-3 w-3" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {allActive.filter(p => p.status === "green").map((p) => (
              <button
                key={p.id}
                onClick={() => setLocation(`/projects/${p.id}`)}
                className="flex items-center gap-3 bg-white rounded-xl border border-border p-3 text-left hover:border-primary/30 active:scale-[0.98] transition-all group"
              >
                <div
                  className="h-8 w-8 rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0"
                  style={{ backgroundColor: p.color }}
                >
                  {p.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{p.action}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quick nav — desktop only (mobile uses bottom nav) */}
      <div className="hidden sm:grid grid-cols-3 gap-3">
        {[
          { icon: Sun, label: "Signal", sub: "Today's briefing and priorities", path: "/morning-signal", color: "text-amber-500" },
          { icon: Bot, label: "Ask Victoria", sub: "Strategic advice and task delegation", path: "/victoria", color: "text-primary" },
          { icon: TrendingUp, label: "Financial Pulse", sub: "Cash, burn, and runway", path: "/financial", color: "text-emerald-600" },
        ].map((item) => (
          <button
            key={item.path}
            onClick={() => setLocation(item.path)}
            className="bg-white rounded-xl border border-border shadow-sm p-4 text-left hover:border-primary/40 hover:shadow-md active:scale-[0.98] transition-all group"
          >
            <div className="flex items-center gap-2 mb-2">
              <item.icon className={`h-4 w-4 ${item.color}`} />
              <span className="text-sm font-semibold text-foreground">{item.label}</span>
            </div>
            <p className="text-xs text-muted-foreground">{item.sub}</p>
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-primary mt-2 transition-colors" />
          </button>
        ))}
      </div>
    </div>
  );
}

// Action card with approve / delegate / escalate buttons
function ActionCard({
  project,
  actioned,
  onAction,
  onOpen,
}: {
  project: typeof projects[0];
  actioned: boolean;
  onAction: (id: string, type: "approve" | "delegate" | "escalate") => void;
  onOpen: () => void;
}) {
  return (
    <div
      className={`bg-white rounded-xl border-l-4 border border-border shadow-sm overflow-hidden transition-all ${
        ragBorder[project.status]
      } ${actioned ? "opacity-50 scale-[0.98]" : ""}`}
    >
      <div className="p-3 sm:p-4">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="h-8 w-8 rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0"
            style={{ backgroundColor: project.color }}
          >
            {project.initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-foreground">{project.name}</p>
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                project.status === "red" ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"
              }`}>
                {project.urgency}
              </span>
            </div>
            {project.issue && (
              <p className="text-xs text-red-600 mt-0.5 flex items-center gap-1">
                <AlertCircle className="h-3 w-3 shrink-0" />
                {project.issue}
              </p>
            )}
          </div>
          <button
            onClick={onOpen}
            className="shrink-0 h-7 w-7 flex items-center justify-center rounded-lg hover:bg-muted active:scale-90 transition-all"
          >
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Next action */}
        <p className="text-xs text-foreground/70 mb-3 pl-11">
          Next: {project.action}
        </p>

        {/* Action buttons — large touch targets for iPhone */}
        <div className="flex gap-2 pl-11">
          <button
            onClick={() => onAction(project.id, "approve")}
            className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium hover:bg-emerald-100 active:scale-95 transition-all"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Approve
          </button>
          <button
            onClick={() => onAction(project.id, "delegate")}
            className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium hover:bg-blue-100 active:scale-95 transition-all"
          >
            <UserCheck className="h-3.5 w-3.5" />
            Delegate
          </button>
          <button
            onClick={() => onAction(project.id, "escalate")}
            className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg bg-[oklch(0.58_0.26_340)]/8 border border-[oklch(0.58_0.26_340)]/20 text-[oklch(0.58_0.26_340)] text-xs font-medium hover:bg-[oklch(0.58_0.26_340)]/15 active:scale-95 transition-all"
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            Escalate
          </button>
        </div>
      </div>
    </div>
  );
}
