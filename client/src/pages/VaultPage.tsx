import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, Brain, BookOpen, MessageSquare, Zap, TrendingUp, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";

const CATEGORY_OPTIONS = ["insight", "decision", "task", "note", "document", "pattern"] as const;
type Category = typeof CATEGORY_OPTIONS[number];

export default function VaultPage() {
  const utils = trpc.useUtils();
  const [showAdd, setShowAdd] = useState(false);
  const [newInsight, setNewInsight] = useState("");
  const [newContext, setNewContext] = useState("");
  const [newCategory, setNewCategory] = useState<Category>("insight");

  const { data: entries = [] } = trpc.vault.getLearnings.useQuery({ limit: 50 });
  const { data: stats } = trpc.vault.getStats.useQuery();

  const addMutation = trpc.vault.add.useMutation({
    onSuccess: () => {
      utils.vault.getLearnings.invalidate();
      utils.vault.getStats.invalidate();
      setNewInsight("");
      setNewContext("");
      setNewCategory("insight");
      setShowAdd(false);
      toast.success("Learning captured");
    },
    onError: () => toast.error("Failed to save"),
  });

  const deleteMutation = trpc.vault.delete.useMutation({
    onSuccess: () => {
      utils.vault.getLearnings.invalidate();
      utils.vault.getStats.invalidate();
      toast.success("Removed");
    },
    onError: () => toast.error("Failed to remove"),
  });

  const decisions = stats?.decisions ?? 0;
  const interactions = stats?.interactions ?? 0;
  const patterns = stats?.patterns ?? 0;

  const scores = [
    { label: "Strategic Clarity",       value: Math.min(100, 50 + decisions * 2),        trend: decisions > 0 ? `+${decisions}` : "0" },
    { label: "Decision Velocity",        value: Math.min(100, 40 + decisions * 3),        trend: decisions > 5 ? "+3" : "-1" },
    { label: "Execution Follow-through", value: Math.min(100, 55 + patterns * 4),         trend: patterns > 0 ? `+${patterns}` : "0" },
    { label: "Risk Management",          value: Math.min(100, 60 + patterns * 3),         trend: "+1" },
    { label: "Delegation Effectiveness", value: Math.min(100, 45 + interactions / 20),    trend: interactions > 50 ? "+5" : "+1" },
  ];

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Lock className="h-4 w-4 text-primary" />
            </div>
            <h1 className="text-xl font-bold text-foreground">The Vault</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Constant learning engine — every decision, pattern, and insight captured.
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => setShowAdd(v => !v)}
          className="shrink-0"
        >
          {showAdd ? <X className="h-3.5 w-3.5 mr-1.5" /> : <Plus className="h-3.5 w-3.5 mr-1.5" />}
          {showAdd ? "Cancel" : "Add"}
        </Button>
      </div>

      {/* Add learning form */}
      {showAdd && (
        <div className="mb-6 p-4 rounded-xl border border-border bg-card space-y-3">
          <div className="flex gap-2 flex-wrap">
            {CATEGORY_OPTIONS.map(c => (
              <button
                key={c}
                onClick={() => setNewCategory(c)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                  newCategory === c
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <Input
            placeholder="Insight or learning (required)"
            value={newInsight}
            onChange={e => setNewInsight(e.target.value)}
            className="text-sm"
            maxLength={500}
          />
          <Input
            placeholder="Context (optional)"
            value={newContext}
            onChange={e => setNewContext(e.target.value)}
            className="text-sm"
          />
          <Button
            size="sm"
            disabled={!newInsight.trim() || addMutation.isPending}
            onClick={() => addMutation.mutate({ category: newCategory, insight: newInsight.trim(), context: newContext.trim() || undefined })}
          >
            {addMutation.isPending ? "Saving..." : "Save Learning"}
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        {/* Digital Twin Scores */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Digital Twin · Performance</h2>
          </div>
          <div className="space-y-3">
            {scores.map((s) => (
              <div key={s.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">{s.label}</span>
                  <div className="flex items-center gap-2">
                    <span className={"text-[10px] font-medium " + (s.trend.startsWith("+") ? "text-emerald-600" : "text-red-500")}>{s.trend}</span>
                    <span className="text-xs font-bold text-foreground">{s.value}</span>
                  </div>
                </div>
                <div className="h-1.5 rounded-full bg-border overflow-hidden">
                  <div
                    className={"h-full rounded-full transition-all " + (s.value >= 75 ? "bg-emerald-500" : s.value >= 60 ? "bg-amber-500" : "bg-red-500")}
                    style={{ width: s.value + "%" }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground mt-4">Updates as decisions and outcomes are captured.</p>
        </div>

        {/* Stats */}
        <div className="space-y-3">
          {[
            { icon: BookOpen,      label: "Decisions Captured",    value: decisions.toString(),            sub: "Since inception" },
            { icon: MessageSquare, label: "Interactions Analysed", value: interactions.toLocaleString(),   sub: "Victoria conversations" },
            { icon: Zap,           label: "Patterns Identified",   value: patterns.toString(),             sub: "Behavioural insights" },
            { icon: TrendingUp,    label: "Accuracy Improving",    value: interactions > 10 ? "+12%" : "—", sub: "Month on month" },
          ].map((stat) => (
            <div key={stat.label} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <stat.icon className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="text-sm font-bold text-foreground">{stat.value}</p>
              </div>
              <span className="text-[10px] text-muted-foreground">{stat.sub}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent learnings */}
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-3">
          Recent Learnings
          {entries.length > 0 && <span className="ml-2 text-xs text-muted-foreground font-normal">{entries.length}</span>}
        </h2>
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center rounded-xl border border-dashed border-border">
            <Lock className="h-8 w-8 text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground">No learnings yet.</p>
            <p className="text-xs text-muted-foreground mt-1">Victoria populates this as you make decisions. You can also add manually.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {entries.map((l: { id: number; category: string; source: string; insight: string; context?: string | null; createdAt: Date }) => (
              <div key={l.id} className="p-4 rounded-xl border border-border bg-card group">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-primary/5 text-primary border-primary/20">{l.category}</Badge>
                      <span className="text-[10px] text-muted-foreground">{l.source}</span>
                    </div>
                    <p className="text-sm text-foreground">{l.insight}</p>
                    {l.context && <p className="text-xs text-muted-foreground mt-1">{l.context}</p>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] text-muted-foreground">
                      {new Date(l.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                    </span>
                    <button
                      onClick={() => deleteMutation.mutate({ id: l.id })}
                      disabled={deleteMutation.isPending}
                      className="opacity-0 group-hover:opacity-100 h-6 w-6 rounded flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-all"
                      title="Remove"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
