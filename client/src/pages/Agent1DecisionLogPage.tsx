// @ts-nocheck
import { PageShell } from "@/components/layout/PageShell";
import { useState } from "react";
import {
  Scale,
  Plus,
  ChevronDown,
  ChevronUp,
  Trash2,
  Edit3,
  Save,
  X,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";

const RISK_LEVELS = ["Low", "Medium", "High"] as const;
const STATUS_OPTIONS = ["pending", "decided", "retrospective"] as const;

const STATUS_STYLES = {
  pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  decided: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  retrospective: "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

const RISK_STYLES = {
  Low: "bg-emerald-500/10 text-emerald-400",
  Medium: "bg-amber-500/10 text-amber-400",
  High: "bg-red-500/10 text-red-400",
};

type DecisionForm = {
  title: string;
  context: string;
  optionsConsidered: string;
  chosenPath: string;
  reasons: string;
  riskTolerance: "Low" | "Medium" | "High";
  successCriteria: string;
  retrospectiveNotes: string;
  status: "pending" | "decided" | "retrospective";
};

const EMPTY_FORM: DecisionForm = {
  title: "",
  context: "",
  optionsConsidered: "",
  chosenPath: "",
  reasons: "",
  riskTolerance: "Medium",
  successCriteria: "",
  retrospectiveNotes: "",
  status: "pending",
};

export default function Agent1DecisionLogPage() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<DecisionForm>(EMPTY_FORM);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<DecisionForm>(EMPTY_FORM);

  const { data: decisions, refetch } = trpc.agent1.decisions.list.useQuery();

  const createMutation = trpc.agent1.decisions.create.useMutation({
    onSuccess: () => {
      toast.success("Decision logged");
      setForm(EMPTY_FORM);
      setOpen(false);
      refetch();
    },
    onError: err => toast.error(err.message),
  });

  const updateMutation = trpc.agent1.decisions.update.useMutation({
    onSuccess: () => {
      toast.success("Decision updated");
      setEditingId(null);
      refetch();
    },
    onError: err => toast.error(err.message),
  });

  const deleteMutation = trpc.agent1.decisions.delete.useMutation({
    onSuccess: () => {
      toast.success("Decision deleted");
      refetch();
    },
    onError: err => toast.error(err.message),
  });

  const handleCreate = () => {
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }
    createMutation.mutate(form);
  };

  const startEdit = (d: any) => {
    setEditingId(d.id);
    setEditForm({
      title: d.title,
      context: d.context ?? "",
      optionsConsidered: d.optionsConsidered ?? "",
      chosenPath: d.chosenPath ?? "",
      reasons: d.reasons ?? "",
      riskTolerance: d.riskTolerance ?? "Medium",
      successCriteria: d.successCriteria ?? "",
      retrospectiveNotes: d.retrospectiveNotes ?? "",
      status: d.status ?? "pending",
    });
  };

  const handleUpdate = () => {
    if (!editingId) return;
    updateMutation.mutate({ id: editingId, ...editForm });
  };

  const StatusIcon = ({ status }: { status: string }) => {
    if (status === "decided") return <CheckCircle2 className="h-3.5 w-3.5" />;
    if (status === "retrospective") return <Clock className="h-3.5 w-3.5" />;
    return <AlertTriangle className="h-3.5 w-3.5" />;
  };

  return (
    <PageShell
      icon={Scale}
      title="Decision Log"
      subtitle="Record, track, and reflect on every significant decision"
    >
      <div className="max-w-4xl mx-auto flex flex-col gap-4">
        {/* Header actions */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {decisions?.length ?? 0} decisions logged
          </p>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="gap-1.5 bg-[var(--brain-magenta)] hover:bg-[var(--brain-magenta)]/80 text-white"
              >
                <Plus className="h-3.5 w-3.5" />
                Log Decision
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Log a New Decision</DialogTitle>
              </DialogHeader>
              <DecisionForm
                form={form}
                onChange={setForm}
                onSubmit={handleCreate}
                loading={createMutation.isPending}
                submitLabel="Log Decision"
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Decision List */}
        <div className="flex flex-col gap-3">
          {!decisions?.length && (
            <div className="text-center py-16 text-muted-foreground">
              <Scale className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No decisions logged yet</p>
              <p className="text-xs mt-1 opacity-70">
                Start recording the decisions that shape your path
              </p>
            </div>
          )}

          {decisions?.map((d: any) => (
            <div
              key={d.id}
              className="bg-card border border-border rounded-2xl overflow-hidden"
            >
              {/* Header */}
              <div
                className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => setExpandedId(expandedId === d.id ? null : d.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold truncate">{d.title}</p>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] gap-1 border",
                        STATUS_STYLES[d.status as keyof typeof STATUS_STYLES] ??
                          ""
                      )}
                    >
                      <StatusIcon status={d.status} />
                      {d.status}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px]",
                        RISK_STYLES[
                          d.riskTolerance as keyof typeof RISK_STYLES
                        ] ?? ""
                      )}
                    >
                      {d.riskTolerance} risk
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(d.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={e => {
                      e.stopPropagation();
                      startEdit(d);
                    }}
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 hover:text-destructive"
                    onClick={e => {
                      e.stopPropagation();
                      deleteMutation.mutate({ id: d.id });
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                  {expandedId === d.id ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </div>

              {/* Expanded */}
              {expandedId === d.id && editingId !== d.id && (
                <div className="border-t border-border px-4 py-4 grid grid-cols-2 gap-4 text-sm">
                  {[
                    ["Context", d.context],
                    ["Options Considered", d.optionsConsidered],
                    ["Chosen Path", d.chosenPath],
                    ["Reasons", d.reasons],
                    ["Success Criteria", d.successCriteria],
                    ["Retrospective Notes", d.retrospectiveNotes],
                  ]
                    .filter(([, v]) => v)
                    .map(([label, value]) => (
                      <div key={label} className="col-span-1">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                          {label}
                        </p>
                        <p className="text-sm text-foreground/80 whitespace-pre-wrap">
                          {value}
                        </p>
                      </div>
                    ))}
                </div>
              )}

              {/* Edit form inline */}
              {editingId === d.id && (
                <div className="border-t border-border px-4 py-4">
                  <DecisionForm
                    form={editForm}
                    onChange={setEditForm}
                    onSubmit={handleUpdate}
                    loading={updateMutation.isPending}
                    submitLabel="Save Changes"
                    onCancel={() => setEditingId(null)}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}

function DecisionForm({
  form,
  onChange,
  onSubmit,
  loading,
  submitLabel,
  onCancel,
}: {
  form: DecisionForm;
  onChange: (f: DecisionForm) => void;
  onSubmit: () => void;
  loading: boolean;
  submitLabel: string;
  onCancel?: () => void;
}) {
  const set = (key: keyof DecisionForm, value: string) =>
    onChange({ ...form, [key]: value });

  return (
    <div className="flex flex-col gap-3">
      <div>
        <label className="text-xs font-semibold text-muted-foreground mb-1 block">
          Decision Title *
        </label>
        <Input
          value={form.title}
          onChange={e => set("title", e.target.value)}
          placeholder="e.g. Hire a second developer"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {(
          [
            ["context", "Context", "What situation prompted this decision?"],
            [
              "optionsConsidered",
              "Options Considered",
              "What alternatives did you evaluate?",
            ],
            ["chosenPath", "Chosen Path", "What did you decide to do?"],
            ["reasons", "Reasons", "Why this option over others?"],
            [
              "successCriteria",
              "Success Criteria",
              "How will you know this was the right call?",
            ],
            [
              "retrospectiveNotes",
              "Retrospective Notes",
              "Looking back — what happened?",
            ],
          ] as const
        ).map(([key, label, placeholder]) => (
          <div key={key}>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">
              {label}
            </label>
            <Textarea
              value={form[key]}
              onChange={e => set(key, e.target.value)}
              placeholder={placeholder}
              rows={3}
              className="text-sm resize-none"
            />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-1 block">
            Risk Tolerance
          </label>
          <div className="flex gap-2">
            {RISK_LEVELS.map(r => (
              <button
                key={r}
                onClick={() => set("riskTolerance", r)}
                className={cn(
                  "flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all",
                  form.riskTolerance === r
                    ? cn(
                        "border-transparent",
                        RISK_STYLES[r as keyof typeof RISK_STYLES]
                      )
                    : "border-border text-muted-foreground hover:bg-muted"
                )}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-1 block">
            Status
          </label>
          <div className="flex gap-2">
            {STATUS_OPTIONS.map(s => (
              <button
                key={s}
                onClick={() => set("status", s)}
                className={cn(
                  "flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all",
                  form.status === s
                    ? cn(
                        "border-transparent",
                        STATUS_STYLES[s as keyof typeof STATUS_STYLES]
                      )
                    : "border-border text-muted-foreground hover:bg-muted"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        {onCancel && (
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            className="gap-1.5"
          >
            <X className="h-3.5 w-3.5" />
            Cancel
          </Button>
        )}
        <Button
          onClick={onSubmit}
          disabled={loading}
          size="sm"
          className="gap-1.5 bg-[var(--brain-magenta)] hover:bg-[var(--brain-magenta)]/80 text-white ml-auto"
        >
          <Save className="h-3.5 w-3.5" />
          {submitLabel}
        </Button>
      </div>
    </div>
  );
}
