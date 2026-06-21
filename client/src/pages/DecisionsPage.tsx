import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Loader2, User, BookOpen, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import type { Decision } from "../../../drizzle/schema";

const IMPACT_STYLES: Record<string, string> = {
  critical: "bg-rose-100 text-rose-700 border-rose-200",
  high: "bg-orange-100 text-orange-700 border-orange-200",
  medium: "bg-amber-100 text-amber-700 border-amber-200",
  low: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

const STATUS_STYLES: Record<string, string> = {
  active: "bg-blue-100 text-blue-700",
  superseded: "bg-gray-100 text-gray-500",
  reversed: "bg-rose-100 text-rose-600",
};

const RAG_BORDER: Record<string, string> = {
  critical: "border-l-rose-600",
  high: "border-l-orange-500",
  medium: "border-l-amber-500",
  low: "border-l-emerald-500",
};

interface NewDecision {
  title: string;
  context: string;
  rationale: string;
  outcome: string;
  impact: "low" | "medium" | "high" | "critical";
}

export default function DecisionsPage() {
  const { data: decisionsData = [], refetch, isLoading } = trpc.decisions.getAll.useQuery({});
  const createDecision = trpc.decisions.create.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Decision logged and captured in The Vault");
      setShowNew(false);
      setNewDecision({ title: "", context: "", rationale: "", outcome: "", impact: "medium" });
    },
    onError: () => toast.error("Failed to log decision"),
  });
  const updateOutcome = trpc.decisions.updateOutcome.useMutation({
    onSuccess: () => { refetch(); toast.success("Decision updated"); },
  });

  const [showNew, setShowNew] = useState(false);
  const [filterImpact, setFilterImpact] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [newDecision, setNewDecision] = useState<NewDecision>({ title: "", context: "", rationale: "", outcome: "", impact: "medium" });

  const decisions = decisionsData as Decision[];
  const filtered = decisions.filter(d => {
    if (filterImpact !== "All" && d.impact !== filterImpact) return false;
    if (filterStatus !== "All" && d.status !== filterStatus) return false;
    return true;
  });

  const handleCreate = () => {
    if (!newDecision.title.trim()) return;
    createDecision.mutate({
      title: newDecision.title,
      context: newDecision.context || undefined,
      rationale: newDecision.rationale || undefined,
      outcome: newDecision.outcome || undefined,
      impact: newDecision.impact,
    });
  };

  const activeCount = decisions.filter(d => d.status === "active").length;
  const highImpactCount = decisions.filter(d => d.impact === "critical" || d.impact === "high").length;

  return (
    <div className="p-6 space-y-5 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Decisions Log</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Every major decision — context, rationale, and outcome. Feeds The Vault.</p>
        </div>
        <Button onClick={() => setShowNew(true)} className="bg-[oklch(0.78_0.18_195)] text-white hover:bg-[oklch(0.68_0.18_195)] gap-1.5">
          <Plus className="w-4 h-4" /> Log Decision
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-white p-4">
          <p className="text-xs text-muted-foreground">Total Logged</p>
          <p className="text-2xl font-bold text-foreground">{decisions.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-4">
          <p className="text-xs text-muted-foreground">Active</p>
          <p className="text-2xl font-bold text-blue-600">{activeCount}</p>
        </div>
        <div className={`rounded-xl border bg-white p-4 ${highImpactCount > 0 ? "border-orange-200" : "border-border"}`}>
          <p className={`text-xs ${highImpactCount > 0 ? "text-orange-600" : "text-muted-foreground"}`}>High Impact</p>
          <p className={`text-2xl font-bold ${highImpactCount > 0 ? "text-orange-600" : "text-foreground"}`}>{highImpactCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <Select value={filterImpact} onValueChange={setFilterImpact}>
          <SelectTrigger className="w-36 text-sm h-9"><SelectValue placeholder="Impact" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Impact</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-36 text-sm h-9"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="superseded">Superseded</SelectItem>
            <SelectItem value="reversed">Reversed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Decisions list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-[oklch(0.78_0.18_195)]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground mb-1">No decisions logged yet</p>
          <p className="text-xs text-muted-foreground">Start capturing your key decisions. Context and rationale feed directly into The Vault.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(decision => (
            <div key={decision.id} className={`rounded-xl border-l-4 border border-border bg-white overflow-hidden ${RAG_BORDER[decision.impact]}`}>
              <button
                className="w-full text-left p-4 hover:bg-gray-50 transition-colors"
                onClick={() => setExpandedId(expandedId === decision.id ? null : decision.id)}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium text-foreground">{decision.title}</p>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Badge className={`text-[10px] border ${IMPACT_STYLES[decision.impact]}`}>{decision.impact}</Badge>
                    <Badge className={`text-[10px] ${STATUS_STYLES[decision.status]}`}>{decision.status}</Badge>
                    <ChevronRight className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${expandedId === decision.id ? "rotate-90" : ""}`} />
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <User className="w-3 h-3" />{decision.madeBy}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {format(new Date(decision.createdAt), "d MMM yyyy")}
                  </span>
                </div>
              </button>

              {expandedId === decision.id && (
                <div className="px-4 pb-4 border-t border-border pt-3 space-y-3 bg-gray-50/50">
                  {decision.context && (
                    <div>
                      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Context</p>
                      <p className="text-sm text-foreground">{decision.context}</p>
                    </div>
                  )}
                  {decision.rationale && (
                    <div>
                      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Rationale</p>
                      <p className="text-sm text-foreground">{decision.rationale}</p>
                    </div>
                  )}
                  {decision.outcome && (
                    <div>
                      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Expected Outcome</p>
                      <p className="text-sm text-foreground">{decision.outcome}</p>
                    </div>
                  )}
                  {decision.status === "active" && (
                    <div className="flex gap-2 pt-1">
                      <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => updateOutcome.mutate({ id: decision.id, outcome: "Decision superseded by new information", status: "superseded" })}>
                        Mark Superseded
                      </Button>
                      <Button size="sm" variant="outline" className="text-xs h-7 text-rose-600 border-rose-200 hover:bg-rose-50" onClick={() => updateOutcome.mutate({ id: decision.id, outcome: "Decision reversed", status: "reversed" })}>
                        Mark Reversed
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* New Decision Dialog */}
      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Log a Decision</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Decision *</Label>
              <Input value={newDecision.title} onChange={e => setNewDecision(p => ({ ...p, title: e.target.value }))} placeholder="What was decided?" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Context</Label>
              <Textarea value={newDecision.context} onChange={e => setNewDecision(p => ({ ...p, context: e.target.value }))} placeholder="What situation led to this decision?" rows={2} className="text-sm resize-none" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Rationale</Label>
              <Textarea value={newDecision.rationale} onChange={e => setNewDecision(p => ({ ...p, rationale: e.target.value }))} placeholder="Why was this the right call?" rows={2} className="text-sm resize-none" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Expected Outcome</Label>
              <Input value={newDecision.outcome} onChange={e => setNewDecision(p => ({ ...p, outcome: e.target.value }))} placeholder="What do you expect to happen?" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Impact Level</Label>
              <Select value={newDecision.impact} onValueChange={v => setNewDecision(p => ({ ...p, impact: v as typeof newDecision.impact }))}>
                <SelectTrigger className="text-sm h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNew(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!newDecision.title.trim() || createDecision.isPending} className="bg-[oklch(0.78_0.18_195)] text-white hover:bg-[oklch(0.68_0.18_195)]">
              {createDecision.isPending ? "Logging..." : "Log Decision"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
