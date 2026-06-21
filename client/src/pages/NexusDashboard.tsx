import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { AlertCircle, ChevronRight, Sun, Inbox, Sparkles, ArrowRight, Target, TrendingUp, TrendingDown, Minus } from "lucide-react";
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

const ragConfig: Record<RAGStatus, { dot: string; label: string; text: string; bg: string; border: string; icon: React.ReactNode }> = {
  red: {
    dot: "bg-red-500",
    label: "Needs attention",
    text: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-200",
    icon: <TrendingDown className="h-3 w-3" />,
  },
  amber: {
    dot: "bg-amber-400",
    label: "In progress",
    text: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
    icon: <Minus className="h-3 w-3" />,
  },
  green: {
    dot: "bg-emerald-500",
    label: "On track",
    text: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    icon: <TrendingUp className="h-3 w-3" />,
  },
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

      {/* Victoria morning briefing strip */}
      <div
        className="rounded-2xl border border-border overflow-hidden"
        style={{
          background: "linear-gradient(135deg, oklch(0.99 0.01 85) 0%, oklch(0.96 0.03 200 / 0.4) 100%)",
          boxShadow: "0 2px 12px oklch(0.62 0.19 220 / 0.08), 0 1px 3px oklch(0.18 0.02 250 / 0.06)",
        }}
      >
        <div className="p-5">
          <div className="flex items-start gap-4">
            <div className="shrink-0 mt-0.5">
              <AnimatedBrainLogo size="sm" intensity="active" color="var(--color-primary)" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-primary uppercase tracking-widest">Victoria</span>
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-xs text-muted-foreground font-medium">AI Chief of Staff</span>
              </div>
              <h2 className="text-xl font-bold text-foreground tracking-tight">
                {getGreeting(firstName)}
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5 font-medium">{getDateString()}</p>
              <p className="text-sm text-foreground/75 mt-2 leading-relaxed">
                {redCount > 0
                  ? `${redCount} project${redCount > 1 ? "s" : ""} need your attention today. ${amberCount} in progress, ${greenCount} on track across the portfolio.`
                  : `All projects are progressing well. ${amberCount} in progress, ${greenCount} on track. No critical issues to flag.`}
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="gap-2 shrink-0 font-semibold border-primary/30 text-primary hover:bg-primary/5"
              onClick={() => setLocation("/morning-signal")}
            >
              <Sun className="h-3.5 w-3.5" />
              Signal
            </Button>
          </div>

          {/* RAG summary bar */}
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border/60">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500 shrink-0" />
              <span className="text-xs font-semibold text-red-600">{redCount} Critical</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400 shrink-0" />
              <span className="text-xs font-semibold text-amber-600">{amberCount} In Progress</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shrink-0" />
              <span className="text-xs font-semibold text-emerald-600">{greenCount} On Track</span>
            </div>
            <div className="ml-auto">
              <div className="flex h-2 w-32 rounded-full overflow-hidden gap-0.5">
                {redCount > 0 && (
                  <div
                    className="bg-red-400 rounded-l-full"
                    style={{ width: `${(redCount / 6) * 100}%` }}
                  />
                )}
                {amberCount > 0 && (
                  <div
                    className="bg-amber-400"
                    style={{ width: `${(amberCount / 6) * 100}%` }}
                  />
                )}
                {greenCount > 0 && (
                  <div
                    className="bg-emerald-400 rounded-r-full"
                    style={{ width: `${(greenCount / 6) * 100}%` }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Portfolio grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-foreground text-base">Portfolio</h3>
          <button
            onClick={() => setLocation("/projects")}
            className="text-xs text-primary hover:text-primary/80 font-semibold flex items-center gap-1 transition-colors"
          >
            All projects <ChevronRight className="h-3 w-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {projects.map((p) => {
            const rag = ragConfig[p.status];
            return (
              <div
                key={p.id}
                className="rounded-2xl border border-border bg-card cursor-pointer group p-4 transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  boxShadow: "0 1px 3px oklch(0.18 0.02 250 / 0.06)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 16px oklch(0.18 0.02 250 / 0.1)";
                  (e.currentTarget as HTMLDivElement).style.borderColor = `${p.color}40`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 3px oklch(0.18 0.02 250 / 0.06)";
                  (e.currentTarget as HTMLDivElement).style.borderColor = "";
                }}
                onClick={() => setLocation(`/projects/${p.id}`)}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center text-white font-bold text-xs shrink-0"
                    style={{ backgroundColor: p.color }}
                  >
                    {p.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">{p.name}</p>
                    <div className={`flex items-center gap-1.5 mt-0.5 ${rag.text}`}>
                      {rag.icon}
                      <span className="text-xs font-semibold">{rag.label}</span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary transition-colors shrink-0" />
                </div>

                {p.issue && (
                  <div className={`flex items-center gap-1.5 text-xs ${rag.text} ${rag.bg} rounded-lg px-2.5 py-1.5 mb-2 border ${rag.border}`}>
                    <AlertCircle className="h-3 w-3 shrink-0" />
                    <span className="font-medium">{p.issue}</span>
                  </div>
                )}

                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Target className="h-3 w-3 shrink-0 text-primary/50" />
                  <span className="truncate">{p.action}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={() => setLocation("/morning-signal")}
          className="rounded-2xl border border-border bg-card p-4 text-left group transition-all duration-200 hover:-translate-y-0.5"
          style={{ boxShadow: "0 1px 3px oklch(0.18 0.02 250 / 0.06)" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 16px oklch(0.18 0.02 250 / 0.1)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 1px 3px oklch(0.18 0.02 250 / 0.06)"; }}
        >
          <div className="flex items-center gap-2.5 mb-2">
            <div className="h-8 w-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
              <Sun className="h-4 w-4 text-amber-500" />
            </div>
            <span className="text-sm font-bold text-foreground">Morning Signal</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">Today's briefing, priorities and actions</p>
          <div className="flex items-center gap-1 mt-3 text-xs text-primary font-semibold">
            Open <ArrowRight className="h-3 w-3" />
          </div>
        </button>

        <button
          onClick={() => setLocation("/inbox")}
          className="rounded-2xl border border-border bg-card p-4 text-left group transition-all duration-200 hover:-translate-y-0.5"
          style={{ boxShadow: "0 1px 3px oklch(0.18 0.02 250 / 0.06)" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 16px oklch(0.18 0.02 250 / 0.1)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 1px 3px oklch(0.18 0.02 250 / 0.06)"; }}
        >
          <div className="flex items-center gap-2.5 mb-2">
            <div className="h-8 w-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <Inbox className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm font-bold text-foreground">Inbox</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">Emails and messages across all accounts</p>
          <div className="flex items-center gap-1 mt-3 text-xs text-primary font-semibold">
            Open <ArrowRight className="h-3 w-3" />
          </div>
        </button>

        <button
          onClick={() => setLocation("/digital-twin")}
          className="rounded-2xl border border-border bg-card p-4 text-left group transition-all duration-200 hover:-translate-y-0.5"
          style={{ boxShadow: "0 1px 3px oklch(0.18 0.02 250 / 0.06)" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 16px oklch(0.18 0.02 250 / 0.1)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 1px 3px oklch(0.18 0.02 250 / 0.06)"; }}
        >
          <div className="flex items-center gap-2.5 mb-2">
            <div className="h-8 w-8 rounded-xl bg-violet-50 border border-violet-200 flex items-center justify-center shrink-0">
              <Sparkles className="h-4 w-4 text-violet-500" />
            </div>
            <span className="text-sm font-bold text-foreground">Ask Victoria</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">Strategic advice and task delegation</p>
          <div className="flex items-center gap-1 mt-3 text-xs text-primary font-semibold">
            Open <ArrowRight className="h-3 w-3" />
          </div>
        </button>
      </div>
    </div>
  );
}
