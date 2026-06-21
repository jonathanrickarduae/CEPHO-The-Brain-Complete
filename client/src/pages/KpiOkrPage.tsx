/**
 * KPI & OKR Dashboard — AUTO-05
 *
 * Displays AI-generated KPIs and OKR tracking.
 * Agents can suggest KPIs; users can accept, edit, and track them.
 */

import { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Plus,
  Sparkles,
  Target,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronDown,
  ChevronRight,
  Loader2,
  BarChart3,
  Edit2,
  Trash2,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { PageShell } from "@/components/layout/PageShell";
import { DashboardSkeleton } from "@/components/shared/LoadingSkeleton";

// ─── Types ────────────────────────────────────────────────────────────────────

interface KpiSuggestion {
  name: string;
  description?: string;
  unit?: string;
  targetValue?: string;
  category?: string;
  suggestedByAgent?: string;
}

interface OkrSuggestion {
  objective: string;
  quarter: string;
  keyResults: Array<{ title: string; targetValue?: string; unit?: string }>;
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({
  kpi,
  onUpdate,
  onDelete,
}: {
  kpi: {
    id: number;
    name: string;
    description?: string | null;
    unit?: string | null;
    currentValue?: string | null;
    targetValue?: string | null;
    status: string;
    trend: string;
    category?: string | null;
  };
  onUpdate: (id: number, currentValue: string, status: string) => void;
  onDelete: (id: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(kpi.currentValue ?? "");
  const [status, setStatus] = useState(kpi.status);

  const statusColors: Record<string, string> = {
    on_track: "text-green-400 bg-green-400/10 border-green-400/20",
    at_risk: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
    behind: "text-red-400 bg-red-400/10 border-red-400/20",
    achieved: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  };

  const statusLabels: Record<string, string> = {
    on_track: "On Track",
    at_risk: "At Risk",
    behind: "Behind",
    achieved: "Achieved",
  };

  const TrendIcon =
    kpi.trend === "up"
      ? TrendingUp
      : kpi.trend === "down"
        ? TrendingDown
        : Minus;

  const trendColor =
    kpi.trend === "up"
      ? "text-green-400"
      : kpi.trend === "down"
        ? "text-red-400"
        : "text-muted-foreground";

  return (
    <div className="bg-card border border-white/10 rounded-xl p-4 hover:border-white/20 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm text-foreground truncate">
            {kpi.name}
          </h3>
          {kpi.description && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
              {kpi.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1 ml-2">
          <TrendIcon className={cn("w-4 h-4", trendColor)} />
          <button
            onClick={() => setEditing(!editing)}
            className="p-1 hover:bg-secondary/50 rounded transition-colors"
          >
            <Edit2 className="w-3 h-3 text-muted-foreground" />
          </button>
          <button
            onClick={() => onDelete(kpi.id)}
            className="p-1 hover:bg-red-500/10 rounded transition-colors"
          >
            <Trash2 className="w-3 h-3 text-muted-foreground hover:text-red-400" />
          </button>
        </div>
      </div>

      <div className="flex items-end justify-between mb-3">
        <div>
          <div className="text-2xl font-bold text-foreground">
            {kpi.currentValue ?? "—"}
            {kpi.unit && (
              <span className="text-sm font-normal text-muted-foreground ml-1">
                {kpi.unit}
              </span>
            )}
          </div>
          {kpi.targetValue && (
            <div className="text-xs text-muted-foreground">
              Target: {kpi.targetValue} {kpi.unit}
            </div>
          )}
        </div>
        <span
          className={cn(
            "text-xs px-2 py-0.5 rounded-full border font-medium",
            statusColors[kpi.status] ??
              "text-muted-foreground bg-secondary/50 border-white/10"
          )}
        >
          {statusLabels[kpi.status] ?? kpi.status}
        </span>
      </div>

      {kpi.category && (
        <div className="text-xs text-muted-foreground capitalize mb-2">
          {kpi.category}
        </div>
      )}

      {editing && (
        <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={value}
              onChange={e => setValue(e.target.value)}
              placeholder="Current value"
              className="flex-1 bg-secondary/50 border border-white/10 rounded px-2 py-1 text-xs text-foreground focus:outline-none focus:border-primary/50"
            />
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              className="bg-secondary/50 border border-white/10 rounded px-2 py-1 text-xs text-foreground focus:outline-none"
            >
              <option value="on_track">On Track</option>
              <option value="at_risk">At Risk</option>
              <option value="behind">Behind</option>
              <option value="achieved">Achieved</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                onUpdate(kpi.id, value, status);
                setEditing(false);
              }}
              className="flex-1 bg-primary/20 hover:bg-primary/30 text-primary text-xs py-1 rounded transition-colors"
            >
              Save
            </button>
            <button
              onClick={() => setEditing(false)}
              className="flex-1 bg-secondary/50 hover:bg-secondary text-muted-foreground text-xs py-1 rounded transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── OKR Card ─────────────────────────────────────────────────────────────────

function OkrCard({
  okr,
  onUpdateKr,
  onDelete,
}: {
  okr: {
    id: number;
    objective: string;
    quarter: string;
    status: string;
    overallProgress: number | null;
    keyResults: Array<{
      id: number;
      title: string;
      targetValue?: string | null;
      currentValue?: string | null;
      unit?: string | null;
      progress: number | null;
      status: string;
    }>;
  };
  onUpdateKr: (id: number, progress: number, currentValue: string) => void;
  onDelete: (id: number) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const progress = okr.overallProgress ?? 0;

  const progressColor =
    progress >= 70
      ? "bg-green-500"
      : progress >= 40
        ? "bg-yellow-500"
        : "bg-red-500";

  return (
    <div className="bg-card border border-white/10 rounded-xl overflow-hidden">
      <div
        className="flex items-center gap-3 p-4 cursor-pointer hover:bg-secondary/20 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <button className="text-muted-foreground">
          {expanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              {okr.quarter}
            </span>
            <span
              className={cn(
                "text-xs px-2 py-0.5 rounded-full",
                okr.status === "active"
                  ? "bg-blue-500/10 text-blue-400"
                  : okr.status === "completed"
                    ? "bg-green-500/10 text-green-400"
                    : "bg-secondary/50 text-muted-foreground"
              )}
            >
              {okr.status}
            </span>
          </div>
          <h3 className="font-semibold text-sm text-foreground">
            {okr.objective}
          </h3>
        </div>
        <div className="flex items-center gap-3 ml-2">
          <div className="text-right">
            <div className="text-lg font-bold text-foreground">{progress}%</div>
            <div className="text-xs text-muted-foreground">
              {okr.keyResults.length} KRs
            </div>
          </div>
          <button
            onClick={e => {
              e.stopPropagation();
              onDelete(okr.id);
            }}
            className="p-1 hover:bg-red-500/10 rounded transition-colors"
          >
            <Trash2 className="w-3 h-3 text-muted-foreground hover:text-red-400" />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-4 pb-2">
        <div className="w-full bg-secondary/50 rounded-full h-1.5">
          <div
            className={cn("h-1.5 rounded-full transition-all", progressColor)}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Key Results */}
      {expanded && okr.keyResults.length > 0 && (
        <div className="border-t border-white/10 divide-y divide-white/5">
          {okr.keyResults.map(kr => (
            <KeyResultRow key={kr.id} kr={kr} onUpdate={onUpdateKr} />
          ))}
        </div>
      )}

      {expanded && okr.keyResults.length === 0 && (
        <div className="px-4 py-3 text-xs text-muted-foreground text-center border-t border-white/10">
          No key results defined
        </div>
      )}
    </div>
  );
}

function KeyResultRow({
  kr,
  onUpdate,
}: {
  kr: {
    id: number;
    title: string;
    targetValue?: string | null;
    currentValue?: string | null;
    unit?: string | null;
    progress: number | null;
    status: string;
  };
  onUpdate: (id: number, progress: number, currentValue: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(kr.currentValue ?? "");
  const [progress, setProgress] = useState(String(kr.progress ?? 0));

  const StatusIcon =
    kr.status === "completed"
      ? CheckCircle2
      : kr.status === "cancelled"
        ? XCircle
        : AlertTriangle;

  const statusColor =
    kr.status === "completed"
      ? "text-green-400"
      : kr.status === "cancelled"
        ? "text-red-400"
        : "text-yellow-400";

  return (
    <div className="px-4 py-3">
      <div className="flex items-start gap-3">
        <StatusIcon className={cn("w-4 h-4 mt-0.5 shrink-0", statusColor)} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-foreground font-medium">{kr.title}</p>
            <button
              onClick={() => setEditing(!editing)}
              className="p-0.5 hover:bg-secondary/50 rounded transition-colors"
            >
              <Edit2 className="w-3 h-3 text-muted-foreground" />
            </button>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 bg-secondary/50 rounded-full h-1">
              <div
                className="h-1 rounded-full bg-primary transition-all"
                style={{ width: `${kr.progress ?? 0}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {kr.currentValue ?? "—"} / {kr.targetValue ?? "—"} {kr.unit}
            </span>
            <span className="text-xs font-medium text-foreground">
              {kr.progress ?? 0}%
            </span>
          </div>
        </div>
      </div>

      {editing && (
        <div className="mt-2 ml-7 space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={value}
              onChange={e => setValue(e.target.value)}
              placeholder="Current value"
              className="flex-1 bg-secondary/50 border border-white/10 rounded px-2 py-1 text-xs text-foreground focus:outline-none focus:border-primary/50"
            />
            <input
              type="number"
              value={progress}
              onChange={e => setProgress(e.target.value)}
              placeholder="Progress %"
              min="0"
              max="100"
              className="w-20 bg-secondary/50 border border-white/10 rounded px-2 py-1 text-xs text-foreground focus:outline-none focus:border-primary/50"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                onUpdate(kr.id, parseInt(progress) || 0, value);
                setEditing(false);
              }}
              className="flex-1 bg-primary/20 hover:bg-primary/30 text-primary text-xs py-1 rounded transition-colors"
            >
              Save
            </button>
            <button
              onClick={() => setEditing(false)}
              className="flex-1 bg-secondary/50 hover:bg-secondary text-muted-foreground text-xs py-1 rounded transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function KpiOkrPage() {
  const [activeTab, setActiveTab] = useState<"kpis" | "okrs">("kpis");
  const [showAddKpi, setShowAddKpi] = useState(false);
  const [showAddOkr, setShowAddOkr] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [newKpi, setNewKpi] = useState({
    name: "",
    description: "",
    unit: "",
    targetValue: "",
    category: "operational",
  });
  const [newOkr, setNewOkr] = useState({
    objective: "",
    quarter: `Q${Math.ceil((new Date().getMonth() + 1) / 3)} ${new Date().getFullYear()}`,
    keyResults: [{ title: "", targetValue: "", unit: "" }],
  });

  // Queries
  const {
    data: kpiData,
    isLoading: kpisLoading,
    refetch: refetchKpis,
  } = trpc.kpiOkr.kpi.list.useQuery({ includeInactive: false });

  const {
    data: okrData,
    isLoading: okrsLoading,
    refetch: refetchOkrs,
  } = trpc.kpiOkr.okr.list.useQuery({});

  // Mutations
  const createKpi = trpc.kpiOkr.kpi.create.useMutation({
    onSuccess: () => {
      refetchKpis();
      setShowAddKpi(false);
      setNewKpi({
        name: "",
        description: "",
        unit: "",
        targetValue: "",
        category: "operational",
      });
    },
  });

  const updateKpi = trpc.kpiOkr.kpi.update.useMutation({
    onSuccess: () => refetchKpis(),
  });

  const deleteKpi = trpc.kpiOkr.kpi.delete.useMutation({
    onSuccess: () => refetchKpis(),
  });

  const createOkr = trpc.kpiOkr.okr.create.useMutation({
    onSuccess: () => {
      refetchOkrs();
      setShowAddOkr(false);
    },
  });

  const updateKr = trpc.kpiOkr.okr.updateKeyResult.useMutation({
    onSuccess: () => refetchOkrs(),
  });

  const deleteOkr = trpc.kpiOkr.okr.delete.useMutation({
    onSuccess: () => refetchOkrs(),
  });

  const suggestKpis = trpc.kpiOkr.kpi.suggestFromContext.useMutation();
  const suggestOkrs = trpc.kpiOkr.okr.suggestForQuarter.useMutation();

  const isLoading = kpisLoading || okrsLoading;

  if (isLoading) {
    return (
      <PageShell
        title="KPIs & OKRs"
        subtitle="Track your key metrics and objectives"
      >
        <DashboardSkeleton />
      </PageShell>
    );
  }

  const kpis = kpiData ?? [];
  const okrs = okrData ?? [];

  const kpiStats = {
    total: kpis.length,
    onTrack: kpis.filter(k => k.status === "on_track").length,
    atRisk: kpis.filter(k => k.status === "at_risk").length,
    behind: kpis.filter(k => k.status === "behind").length,
    achieved: kpis.filter(k => k.status === "achieved").length,
  };

  const okrStats = {
    total: okrs.length,
    avgProgress:
      okrs.length > 0
        ? Math.round(
            okrs.reduce((s, o) => s + (o.overallProgress ?? 0), 0) / okrs.length
          )
        : 0,
  };

  return (
    <PageShell
      title="KPIs & OKRs"
      subtitle="Track your key performance indicators and objectives"
    >
      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-card border border-white/10 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-foreground">
            {kpiStats.total}
          </div>
          <div className="text-xs text-muted-foreground">Total KPIs</div>
        </div>
        <div className="bg-card border border-green-500/20 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-400">
            {kpiStats.onTrack}
          </div>
          <div className="text-xs text-muted-foreground">On Track</div>
        </div>
        <div className="bg-card border border-yellow-500/20 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">
            {kpiStats.atRisk}
          </div>
          <div className="text-xs text-muted-foreground">At Risk</div>
        </div>
        <div className="bg-card border border-white/10 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-primary">
            {okrStats.avgProgress}%
          </div>
          <div className="text-xs text-muted-foreground">OKR Progress</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 bg-secondary/30 rounded-lg p-1 w-fit">
        <button
          onClick={() => setActiveTab("kpis")}
          className={cn(
            "px-4 py-1.5 rounded-md text-sm font-medium transition-colors",
            activeTab === "kpis"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <BarChart3 className="w-4 h-4 inline mr-1.5" />
          KPIs ({kpis.length})
        </button>
        <button
          onClick={() => setActiveTab("okrs")}
          className={cn(
            "px-4 py-1.5 rounded-md text-sm font-medium transition-colors",
            activeTab === "okrs"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Target className="w-4 h-4 inline mr-1.5" />
          OKRs ({okrs.length})
        </button>
      </div>

      {/* KPIs Tab */}
      {activeTab === "kpis" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Key Performance Indicators
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowSuggestions(true);
                  suggestKpis.mutate();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-xs rounded-lg transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                AI Suggest
              </button>
              <button
                onClick={() => setShowAddKpi(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-xs rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add KPI
              </button>
            </div>
          </div>

          {/* AI Suggestions Panel */}
          {showSuggestions && (
            <div className="mb-4 bg-primary/5 border border-primary/20 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  AI-Suggested KPIs
                </h3>
                <button
                  onClick={() => setShowSuggestions(false)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </div>
              {suggestKpis.isPending ? (
                <div className="flex items-center gap-2 py-4 justify-center">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">
                    Analysing your work context…
                  </span>
                </div>
              ) : (
                <div className="space-y-2">
                  {(suggestKpis.data?.suggestions ?? []).map(
                    (s: KpiSuggestion, i: number) => (
                      <div
                        key={i}
                        className="flex items-start justify-between gap-3 bg-card border border-white/10 rounded-lg p-3"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">
                            {s.name}
                          </p>
                          {s.description && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {s.description}
                            </p>
                          )}
                          <div className="flex gap-2 mt-1">
                            {s.unit && (
                              <span className="text-xs text-muted-foreground">
                                Unit: {s.unit}
                              </span>
                            )}
                            {s.targetValue && (
                              <span className="text-xs text-muted-foreground">
                                Target: {s.targetValue}
                              </span>
                            )}
                            {s.category && (
                              <span className="text-xs text-primary capitalize">
                                {s.category}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            createKpi.mutate({
                              name: s.name,
                              description: s.description,
                              unit: s.unit,
                              targetValue: s.targetValue,
                              category: s.category,
                              suggestedByAgent:
                                s.suggestedByAgent ?? "kpi-advisor",
                            })
                          }
                          className="shrink-0 px-2 py-1 bg-primary/20 hover:bg-primary/30 text-primary text-xs rounded transition-colors"
                        >
                          Add
                        </button>
                      </div>
                    )
                  )}
                  {!suggestKpis.isPending &&
                    (suggestKpis.data?.suggestions ?? []).length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-2">
                        No suggestions available yet. Add some tasks first.
                      </p>
                    )}
                </div>
              )}
            </div>
          )}

          {/* Add KPI Form */}
          {showAddKpi && (
            <div className="mb-4 bg-card border border-white/10 rounded-xl p-4">
              <h3 className="text-sm font-medium text-foreground mb-3">
                New KPI
              </h3>
              <div className="space-y-2">
                <input
                  type="text"
                  value={newKpi.name}
                  onChange={e =>
                    setNewKpi(p => ({ ...p, name: e.target.value }))
                  }
                  placeholder="KPI name *"
                  className="w-full bg-secondary/50 border border-white/10 rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50"
                />
                <input
                  type="text"
                  value={newKpi.description}
                  onChange={e =>
                    setNewKpi(p => ({ ...p, description: e.target.value }))
                  }
                  placeholder="Description"
                  className="w-full bg-secondary/50 border border-white/10 rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newKpi.unit}
                    onChange={e =>
                      setNewKpi(p => ({ ...p, unit: e.target.value }))
                    }
                    placeholder="Unit (£, %, count…)"
                    className="flex-1 bg-secondary/50 border border-white/10 rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50"
                  />
                  <input
                    type="text"
                    value={newKpi.targetValue}
                    onChange={e =>
                      setNewKpi(p => ({ ...p, targetValue: e.target.value }))
                    }
                    placeholder="Target value"
                    className="flex-1 bg-secondary/50 border border-white/10 rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50"
                  />
                  <select
                    value={newKpi.category}
                    onChange={e =>
                      setNewKpi(p => ({ ...p, category: e.target.value }))
                    }
                    className="bg-secondary/50 border border-white/10 rounded px-3 py-2 text-sm text-foreground focus:outline-none"
                  >
                    <option value="financial">Financial</option>
                    <option value="operational">Operational</option>
                    <option value="growth">Growth</option>
                    <option value="quality">Quality</option>
                    <option value="team">Team</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => createKpi.mutate(newKpi)}
                    disabled={!newKpi.name || createKpi.isPending}
                    className="flex-1 bg-primary text-primary-foreground text-sm py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
                  >
                    {createKpi.isPending ? "Creating…" : "Create KPI"}
                  </button>
                  <button
                    onClick={() => setShowAddKpi(false)}
                    className="flex-1 bg-secondary/50 text-muted-foreground text-sm py-2 rounded-lg hover:bg-secondary transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* KPI Grid */}
          {kpis.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No KPIs yet.</p>
              <p className="text-xs mt-1">
                Add your first KPI or let AI suggest some.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {kpis.map(kpi => (
                <KpiCard
                  key={kpi.id}
                  kpi={{
                    ...kpi,
                    status: kpi.status ?? "on_track",
                    trend: kpi.trend ?? "neutral",
                  }}
                  onUpdate={(id, currentValue, status) =>
                    updateKpi.mutate({
                      id,
                      currentValue,
                      status: status as
                        | "on_track"
                        | "at_risk"
                        | "behind"
                        | "achieved",
                    })
                  }
                  onDelete={id => deleteKpi.mutate({ id })}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* OKRs Tab */}
      {activeTab === "okrs" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Objectives & Key Results
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => suggestOkrs.mutate({ quarter: newOkr.quarter })}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-xs rounded-lg transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                AI Suggest
              </button>
              <button
                onClick={() => setShowAddOkr(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-xs rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add OKR
              </button>
            </div>
          </div>

          {/* AI OKR Suggestions */}
          {suggestOkrs.data && (
            <div className="mb-4 bg-primary/5 border border-primary/20 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  AI-Suggested OKRs for {suggestOkrs.data.quarter}
                </h3>
              </div>
              <div className="space-y-3">
                {(suggestOkrs.data.suggestions ?? []).map(
                  (s: OkrSuggestion, i: number) => (
                    <div
                      key={i}
                      className="bg-card border border-white/10 rounded-lg p-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">
                            {s.objective}
                          </p>
                          <div className="mt-1 space-y-0.5">
                            {s.keyResults.map((kr, j) => (
                              <p
                                key={j}
                                className="text-xs text-muted-foreground"
                              >
                                → {kr.title}
                                {kr.targetValue &&
                                  ` (target: ${kr.targetValue} ${kr.unit ?? ""})`}
                              </p>
                            ))}
                          </div>
                        </div>
                        <button
                          onClick={() => createOkr.mutate(s)}
                          className="shrink-0 px-2 py-1 bg-primary/20 hover:bg-primary/30 text-primary text-xs rounded transition-colors"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* Add OKR Form */}
          {showAddOkr && (
            <div className="mb-4 bg-card border border-white/10 rounded-xl p-4">
              <h3 className="text-sm font-medium text-foreground mb-3">
                New OKR
              </h3>
              <div className="space-y-2">
                <input
                  type="text"
                  value={newOkr.objective}
                  onChange={e =>
                    setNewOkr(p => ({ ...p, objective: e.target.value }))
                  }
                  placeholder="Objective *"
                  className="w-full bg-secondary/50 border border-white/10 rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50"
                />
                <input
                  type="text"
                  value={newOkr.quarter}
                  onChange={e =>
                    setNewOkr(p => ({ ...p, quarter: e.target.value }))
                  }
                  placeholder="Quarter (e.g. Q2 2026)"
                  className="w-full bg-secondary/50 border border-white/10 rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50"
                />
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Key Results</p>
                  {newOkr.keyResults.map((kr, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        type="text"
                        value={kr.title}
                        onChange={e => {
                          const updated = [...newOkr.keyResults];
                          updated[i] = { ...updated[i], title: e.target.value };
                          setNewOkr(p => ({ ...p, keyResults: updated }));
                        }}
                        placeholder={`Key result ${i + 1}`}
                        className="flex-1 bg-secondary/50 border border-white/10 rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50"
                      />
                      <input
                        type="text"
                        value={kr.targetValue}
                        onChange={e => {
                          const updated = [...newOkr.keyResults];
                          updated[i] = {
                            ...updated[i],
                            targetValue: e.target.value,
                          };
                          setNewOkr(p => ({ ...p, keyResults: updated }));
                        }}
                        placeholder="Target"
                        className="w-24 bg-secondary/50 border border-white/10 rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50"
                      />
                    </div>
                  ))}
                  <button
                    onClick={() =>
                      setNewOkr(p => ({
                        ...p,
                        keyResults: [
                          ...p.keyResults,
                          { title: "", targetValue: "", unit: "" },
                        ],
                      }))
                    }
                    className="text-xs text-primary hover:underline"
                  >
                    + Add key result
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      createOkr.mutate({
                        objective: newOkr.objective,
                        quarter: newOkr.quarter,
                        keyResults: newOkr.keyResults.filter(kr => kr.title),
                      })
                    }
                    disabled={!newOkr.objective || createOkr.isPending}
                    className="flex-1 bg-primary text-primary-foreground text-sm py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
                  >
                    {createOkr.isPending ? "Creating…" : "Create OKR"}
                  </button>
                  <button
                    onClick={() => setShowAddOkr(false)}
                    className="flex-1 bg-secondary/50 text-muted-foreground text-sm py-2 rounded-lg hover:bg-secondary transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* OKR List */}
          {okrs.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Target className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No OKRs yet.</p>
              <p className="text-xs mt-1">
                Create your first OKR or let AI suggest some for the quarter.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {okrs.map(okr => (
                <OkrCard
                  key={okr.id}
                  okr={{
                    ...okr,
                    status: okr.status ?? "active",
                    keyResults: okr.keyResults.map(kr => ({
                      ...kr,
                      status: kr.status ?? "in_progress",
                    })),
                  }}
                  onUpdateKr={(id, progress, currentValue) =>
                    updateKr.mutate({ id, progress, currentValue })
                  }
                  onDelete={id => deleteOkr.mutate({ id })}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </PageShell>
  );
}
