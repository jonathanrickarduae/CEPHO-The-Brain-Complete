import React, { useState } from "react";
import { PageShell } from "@/components/layout/PageShell";
import {
  CreditCard,
  TrendingUp,
  AlertTriangle,
  Calendar,
  DollarSign,
  RefreshCw,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const STATUS_COLORS: Record<string, string> = {
  active: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  trial: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
  paused: "bg-amber-500/20 text-amber-400 border-amber-500/30",
};

export default function SubscriptionTrackerPage() {
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>(
    undefined
  );

  const { data: subscriptions, refetch } =
    trpc.subscriptionTracker.getAll.useQuery({
      category: categoryFilter,
    });

  const { data: summary } = trpc.subscriptionTracker.getSummary.useQuery();
  const { data: renewals } =
    trpc.subscriptionTracker.getRenewalSummary.useQuery();

  const deleteMutation = trpc.subscriptionTracker.delete.useMutation({
    onSuccess: () => {
      toast.success("Subscription removed");
      refetch();
    },
  });

  const categories = Array.from(
    new Set(subscriptions?.map(s => s.category).filter(Boolean) ?? [])
  );

  return (
    <PageShell
      title="Subscription Tracker"
      subtitle="Monitor all your SaaS subscriptions, costs, and renewal dates in one place."
      icon={CreditCard}
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
            <DollarSign className="w-3.5 h-3.5" />
            Monthly Cost
          </div>
          <div className="text-2xl font-bold text-emerald-400">
            ${summary?.totalMonthlyCost?.toFixed(2) ?? "0.00"}
          </div>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
            <TrendingUp className="w-3.5 h-3.5" />
            Annual Cost
          </div>
          <div className="text-2xl font-bold text-blue-400">
            ${summary?.totalAnnualCost?.toFixed(2) ?? "0.00"}
          </div>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
            <CreditCard className="w-3.5 h-3.5" />
            Active
          </div>
          <div className="text-2xl font-bold text-text">
            {summary?.activeCount ?? 0}
          </div>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
            <AlertTriangle className="w-3.5 h-3.5" />
            Renewing Soon
          </div>
          <div className="text-2xl font-bold text-amber-400">
            {renewals?.upcomingCount ?? 0}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setCategoryFilter(undefined)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
            !categoryFilter
              ? "bg-accent text-white border-accent"
              : "bg-card text-muted-foreground border-border hover:border-accent/30"
          }`}
        >
          All
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat ?? undefined)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
              categoryFilter === cat
                ? "bg-accent text-white border-accent"
                : "bg-card text-muted-foreground border-border hover:border-accent/30"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Subscription List */}
      {!subscriptions || subscriptions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <CreditCard className="w-12 h-12 text-muted-foreground mb-4 opacity-40" />
          <p className="text-muted-foreground text-sm">
            No subscriptions tracked yet
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {subscriptions.map(sub => (
            <div
              key={sub.id}
              className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-accent/30 transition-all"
            >
              {/* Icon */}
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                <CreditCard className="w-5 h-5 text-accent" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm">{sub.name}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                      STATUS_COLORS[sub.status ?? "active"] ??
                      STATUS_COLORS.active
                    }`}
                  >
                    {sub.status ?? "active"}
                  </span>
                  {sub.category && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-muted/20 text-muted-foreground border border-border">
                      {sub.category}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {sub.provider}
                  {sub.description ? ` — ${sub.description}` : ""}
                </p>
              </div>

              {/* Cost */}
              <div className="text-right flex-shrink-0">
                <div className="font-bold text-sm">
                  ${Number(sub.cost).toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {sub.billingCycle}
                </div>
              </div>

              {/* Renewal */}
              {sub.renewalDate && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
                  <Calendar className="w-3 h-3" />
                  {new Date(sub.renewalDate).toLocaleDateString()}
                </div>
              )}

              {/* Delete */}
              <button
                onClick={() => deleteMutation.mutate({ id: sub.id })}
                className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-all flex-shrink-0"
                title="Remove subscription"
                aria-label="Remove subscription"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
}
