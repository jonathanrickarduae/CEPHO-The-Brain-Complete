import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { AlertCircle, ChevronRight, Sun, Inbox, Sparkles, ArrowRight, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import AnimatedBrainLogo from "@/components/AnimatedBrainLogo";

type RAGStatus = "red" | "amber" | "green";

const projects = [
  { id: "celadon", name: "Celadon", initials: "CE", color: "#10B981", status: "amber" as RAGStatus, issue: "Licence renewal pending", action: "Follow up on licence" },
  { id: "celanova", name: "Celanova", initials: "CN", color: "#8B5CF6", status: "green" as RAGStatus, issue: null, action: "Review Q3 roadmap" },
  { id: "perfect", name: "Perfect", initials: "PF", color: "#F59E0B", status: "red" as RAGStatus, issue: "3 deliverables overdue", action: "Escalate deliverables" },
  { id: "olmack", name: "Olmack", initials: "OL", color: "#3B82F6", status: "green" as RAGStatus, issue: null, action: "Monthly review prep" },
  { id: "boundless", name: "Boundless", initials: "BL", color: "#EF4444", status: "amber" as RAGStatus, issue: "Supplier contract review", action: "Review contract terms" },
  { id: "personal", name: "Personal", initials: "ME", color: "#EC4899", status: "green" as RAGStatus, issue: null, action: "Weekly review" },
];

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
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function NexusDashboard() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const firstName = user?.name ?? undefined;

  const redCount = projects.filter((p) => p.status === "red").length;
  const amberCount = projects.filter((p) => p.status === "amber").length;
  const greenCount = projects.filter((p) => p.status === "green").length;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">

      {/* Victoria greeting */}
      <div className="bg-white rounded-2xl border border-border shadow-sm p-5">
        <div className="flex items-start gap-4">
          <div className="shrink-0">
            <AnimatedBrainLogo size="sm" intensity="active" color="var(--color-primary)" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-primary uppercase tracking-wide">Victoria</span>
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-xs text-muted-foreground">AI Chief of Staff</span>
            </div>
            <h2 className="text-lg font-semibold text-foreground">
              {getGreeting(firstName)}
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">{getDateString()}</p>
            <p className="text-sm text-foreground/80 mt-2">
              {redCount > 0
                ? `You have ${redCount} project${redCount > 1 ? "s" : ""} needing immediate attention today. ${amberCount} in progress, ${greenCount} on track.`
                : `All projects are progressing well. ${amberCount} in progress, ${greenCount} on track.`}
            </p>
          </div>
          <Button
            size="sm"
            className="gap-2 shrink-0"
            onClick={() => setLocation("/morning-signal")}
          >
            <Sun className="h-3.5 w-3.5" />
            Morning Signal
          </Button>
        </div>
      </div>

      {/* Portfolio RAG summary */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-foreground">Portfolio Status</h3>
          <button
            onClick={() => setLocation("/projects")}
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            View all projects <ChevronRight className="h-3 w-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {projects.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-xl border border-border shadow-sm hover:shadow-md transition-all cursor-pointer group p-4"
              onClick={() => setLocation(`/projects/${p.id}`)}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="h-9 w-9 rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0"
                  style={{ backgroundColor: p.color }}
                >
                  {p.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                    {p.name}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`h-2 w-2 rounded-full ${ragDot[p.status]} inline-block shrink-0`} />
                    <span className={`text-xs ${ragTextColor[p.status]}`}>{ragLabel[p.status]}</span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0" />
              </div>

              {p.issue && (
                <div className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 rounded-lg px-2.5 py-1.5 mb-2">
                  <AlertCircle className="h-3 w-3 shrink-0" />
                  <span>{p.issue}</span>
                </div>
              )}

              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Target className="h-3 w-3 shrink-0" />
                <span className="truncate">{p.action}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={() => setLocation("/morning-signal")}
          className="bg-white rounded-xl border border-border shadow-sm p-4 text-left hover:border-primary/40 hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-2 mb-2">
            <Sun className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-semibold text-foreground">Morning Signal</span>
          </div>
          <p className="text-xs text-muted-foreground">Today's briefing, priorities and actions</p>
          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-primary mt-2 transition-colors" />
        </button>

        <button
          onClick={() => setLocation("/inbox")}
          className="bg-white rounded-xl border border-border shadow-sm p-4 text-left hover:border-primary/40 hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-2 mb-2">
            <Inbox className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Inbox</span>
          </div>
          <p className="text-xs text-muted-foreground">Emails and messages across all accounts</p>
          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-primary mt-2 transition-colors" />
        </button>

        <button
          onClick={() => setLocation("/digital-twin")}
          className="bg-white rounded-xl border border-border shadow-sm p-4 text-left hover:border-primary/40 hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-[oklch(0.58_0.26_340)]" />
            <span className="text-sm font-semibold text-foreground">Ask Victoria</span>
          </div>
          <p className="text-xs text-muted-foreground">Strategic advice and task delegation</p>
          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-primary mt-2 transition-colors" />
        </button>
      </div>
    </div>
  );
}
