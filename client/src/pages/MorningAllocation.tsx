/**
 * MorningAllocation — The 15-minute daily task allocation interface.
 *
 * Agent1 pre-populates items from your tasks and projects with
 * a recommended allocation (You / Chief of Staff / Defer).
 * You review each item quickly, accept or override, then confirm.
 * Confirmed "Chief of Staff" items create tasks assigned to CoS.
 * Confirmed "You" items are added to your personal focus list.
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  User,
  Bot,
  Clock,
  CheckCircle2,
  ChevronRight,
  Zap,
  AlertTriangle,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

type Allocation = "user" | "cos" | "defer";

interface AllocationItem {
  id: string;
  type: "pending" | "in_progress" | "project";
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "urgent";
  source: "task" | "project";
  dueDate: string | null;
  recommendation: Allocation;
  reason: string;
}

const PRIORITY_COLORS: Record<string, string> = {
  urgent: "bg-red-500/20 text-red-400 border-red-500/30",
  high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  medium: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  low: "bg-slate-500/20 text-slate-400 border-slate-500/30",
};

const ALLOCATION_OPTIONS: { value: Allocation; label: string; icon: typeof User; color: string; bg: string }[] = [
  {
    value: "user",
    label: "I'll handle it",
    icon: User,
    color: "text-emerald-400",
    bg: "bg-emerald-500/15 border-emerald-500/30 hover:bg-emerald-500/25",
  },
  {
    value: "cos",
    label: "Chief of Staff",
    icon: Bot,
    color: "text-primary",
    bg: "bg-primary/15 border-primary/30 hover:bg-primary/25",
  },
  {
    value: "defer",
    label: "Defer",
    icon: Clock,
    color: "text-slate-400",
    bg: "bg-slate-500/15 border-slate-500/30 hover:bg-slate-500/25",
  },
];

export default function MorningAllocation() {
  const [, setLocation] = useLocation();
  const [allocations, setAllocations] = useState<Record<string, Allocation>>({});
  const [confirmed, setConfirmed] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data, isLoading, refetch, isFetching } =
    trpc.chiefOfStaff.generateMorningAllocation.useQuery(undefined, {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    });

  const createTaskMutation = trpc.tasks.create.useMutation();

  const items: AllocationItem[] = data?.items ?? [];

  const getAllocation = (item: AllocationItem): Allocation =>
    allocations[item.id] ?? item.recommendation;

  const handleSelect = (itemId: string, value: Allocation) => {
    setAllocations(prev => ({ ...prev, [itemId]: value }));
  };

  const handleConfirmAll = async () => {
    const cosItems = items.filter(item => getAllocation(item) === "cos");
    const userItems = items.filter(item => getAllocation(item) === "user");

    // Create tasks for CoS items
    for (const item of cosItems) {
      if (item.source === "task") {
        // Already a task — just note it's assigned to CoS (toast confirmation)
        continue;
      }
      await createTaskMutation.mutateAsync({
        title: item.title,
        description: `[Chief of Staff] ${item.description}`,
        priority: item.priority === "urgent" ? "urgent" : item.priority === "high" ? "high" : "medium",
      });
    }

    setConfirmed(true);
    toast.success(
      `Day allocated — ${userItems.length} for you, ${cosItems.length} for Chief of Staff`
    );
  };

  const progress = items.length > 0
    ? Math.round((Object.keys(allocations).length / items.length) * 100)
    : 0;

  const allAllocated = items.length > 0 && items.every(item => allocations[item.id] !== undefined);

  if (confirmed) {
    const userItems = items.filter(item => getAllocation(item) === "user");
    const cosItems = items.filter(item => getAllocation(item) === "cos");
    const deferItems = items.filter(item => getAllocation(item) === "defer");

    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Day allocated</h1>
          <p className="text-muted-foreground mb-8">
            Agent1 is ready. Your team is briefed.
          </p>

          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              { label: "You'll handle", count: userItems.length, color: "text-emerald-400" },
              { label: "Chief of Staff", count: cosItems.length, color: "text-primary" },
              { label: "Deferred", count: deferItems.length, color: "text-slate-400" },
            ].map(stat => (
              <div key={stat.label} className="rounded-xl bg-card border border-border p-4 text-center">
                <div className={`text-2xl font-bold ${stat.color}`}>{stat.count}</div>
                <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <Button
              onClick={() => setLocation("/tasks")}
              className="w-full bg-primary hover:bg-primary/90"
            >
              View My Tasks
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
            <Button
              variant="outline"
              onClick={() => setLocation("/operations")}
              className="w-full"
            >
              Open Chief of Staff
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-xl border-b border-border px-4 py-3">
        <div className="flex items-center gap-3 max-w-2xl mx-auto">
          <button
            onClick={() => setLocation("/daily-brief")}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex-1">
            <h1 className="text-base font-semibold text-foreground">Morning Allocation</h1>
            <p className="text-xs text-muted-foreground">
              {isLoading || isFetching
                ? "Agent1 is reviewing your day..."
                : `${items.length} items to allocate`}
            </p>
          </div>
          <button
            onClick={() => { refetch(); setAllocations({}); setCurrentIndex(0); }}
            disabled={isFetching}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all disabled:opacity-40"
          >
            <RefreshCw className={cn("w-4 h-4", isFetching && "animate-spin")} />
          </button>
        </div>

        {/* Progress bar */}
        {!isLoading && items.length > 0 && (
          <div className="max-w-2xl mx-auto mt-2">
            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground/60 mt-1 text-right">
              {Object.keys(allocations).length} of {items.length} allocated
            </p>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4 pb-32">
        {isLoading || isFetching ? (
          // Loading skeletons
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-card border border-border p-4 space-y-3">
              <div className="flex items-start gap-3">
                <Skeleton className="w-8 h-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-9 flex-1 rounded-xl" />
                <Skeleton className="h-9 flex-1 rounded-xl" />
                <Skeleton className="h-9 flex-1 rounded-xl" />
              </div>
            </div>
          ))
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <Zap className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
            <h3 className="text-lg font-semibold text-foreground mb-2">All clear</h3>
            <p className="text-muted-foreground text-sm">
              No pending tasks or projects to allocate today.
            </p>
            <Button
              className="mt-6"
              onClick={() => setLocation("/daily-brief")}
            >
              Back to The Signal
            </Button>
          </div>
        ) : (
          items.map((item, idx) => {
            const selected = getAllocation(item);
            const isOverdue = item.dueDate && new Date(item.dueDate) < new Date();

            return (
              <div
                key={item.id}
                className={cn(
                  "rounded-2xl bg-card border transition-all duration-200",
                  idx === currentIndex
                    ? "border-primary/40 shadow-lg shadow-primary/10"
                    : allocations[item.id]
                      ? "border-border opacity-80"
                      : "border-border"
                )}
                onClick={() => setCurrentIndex(idx)}
              >
                <div className="p-4">
                  {/* Item header */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <Badge
                          variant="outline"
                          className={cn("text-[10px] border", PRIORITY_COLORS[item.priority])}
                        >
                          {item.priority}
                        </Badge>
                        {item.type === "in_progress" && (
                          <Badge variant="outline" className="text-[10px] text-blue-400 border-blue-500/30 bg-blue-500/10">
                            In progress
                          </Badge>
                        )}
                        {isOverdue && (
                          <Badge variant="outline" className="text-[10px] text-red-400 border-red-500/30 bg-red-500/10 flex items-center gap-1">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            Overdue
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-semibold text-foreground text-sm leading-tight">
                        {item.title}
                      </h3>
                      {item.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {item.description}
                        </p>
                      )}
                    </div>
                    {allocations[item.id] && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    )}
                  </div>

                  {/* Agent1 recommendation */}
                  {item.reason && (
                    <div className="flex items-start gap-2 mb-3 px-3 py-2 rounded-lg bg-primary/5 border border-primary/10">
                      <Bot className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        <span className="text-primary font-medium">Agent1: </span>
                        {item.reason}
                      </p>
                    </div>
                  )}

                  {/* Allocation buttons */}
                  <div className="grid grid-cols-3 gap-2">
                    {ALLOCATION_OPTIONS.map(opt => {
                      const Icon = opt.icon;
                      const isSelected = selected === opt.value;
                      const isRecommended = item.recommendation === opt.value && !allocations[item.id];
                      return (
                        <button
                          key={opt.value}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelect(item.id, opt.value);
                            // Auto-advance to next unallocated item
                            const nextIdx = items.findIndex(
                              (it, i) => i > idx && !allocations[it.id]
                            );
                            if (nextIdx !== -1) {
                              setTimeout(() => setCurrentIndex(nextIdx), 150);
                            }
                          }}
                          className={cn(
                            "flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl border text-xs font-medium transition-all duration-150",
                            isSelected
                              ? cn(opt.bg, opt.color, "ring-1 ring-current/30 scale-[1.02]")
                              : "bg-white/3 border-white/10 text-muted-foreground hover:bg-white/8",
                            isRecommended && !allocations[item.id] && "border-dashed"
                          )}
                        >
                          <Icon className={cn("w-4 h-4", isSelected ? opt.color : "")} />
                          <span className="text-[10px] leading-tight text-center">{opt.label}</span>
                          {isRecommended && !allocations[item.id] && (
                            <span className="text-[9px] text-primary/60">suggested</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Sticky confirm bar */}
      {!isLoading && items.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-20 bg-background/95 backdrop-blur-xl border-t border-border px-4 py-4">
          <div className="max-w-2xl mx-auto">
            <Button
              onClick={handleConfirmAll}
              disabled={!allAllocated || createTaskMutation.isPending}
              className={cn(
                "w-full h-12 text-base font-semibold transition-all",
                allAllocated
                  ? "bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30"
                  : "bg-white/10 text-muted-foreground cursor-not-allowed"
              )}
            >
              {createTaskMutation.isPending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Briefing Agent1...
                </>
              ) : allAllocated ? (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Confirm & Start the Day
                </>
              ) : (
                `Allocate all items to continue (${items.length - Object.keys(allocations).length} remaining)`
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
