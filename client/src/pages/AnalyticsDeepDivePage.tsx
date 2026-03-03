import React, { useState } from "react";
import { PageShell } from "@/components/layout/PageShell";
import {
  BarChart3,
  TrendingUp,
  Eye,
  MousePointer,
  Activity,
  Calendar,
} from "lucide-react";
import { trpc } from "@/lib/trpc";

const PERIODS = [
  { label: "7 days", value: 7 },
  { label: "14 days", value: 14 },
  { label: "30 days", value: 30 },
  { label: "90 days", value: 90 },
];

function Bar({
  value,
  max,
  label,
}: {
  value: number;
  max: number;
  label: string;
}) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3 group">
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span
            className="text-xs text-muted-foreground truncate"
            title={label}
          >
            {label}
          </span>
          <span className="text-xs font-semibold ml-2 flex-shrink-0">
            {value.toLocaleString()}
          </span>
        </div>
        <div className="h-2 rounded-full bg-muted/30 overflow-hidden">
          <div
            className="h-full rounded-full bg-accent transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default function AnalyticsDeepDivePage() {
  const [days, setDays] = useState(30);

  const { data: summary, isLoading } = trpc.analytics.getSummary.useQuery({
    days,
  });

  const maxEventCount = Math.max(
    ...(summary?.topEvents?.map(e => Number(e.count)) ?? [1])
  );
  const maxPageCount = Math.max(
    ...(summary?.topPages?.map(p => Number(p.count)) ?? [1])
  );
  const maxDailyCount = Math.max(
    ...(summary?.dailyActivity?.map(d => Number(d.count)) ?? [1])
  );

  return (
    <PageShell
      title="Analytics Deep Dive"
      subtitle="Understand how CEPHO is being used — events, pages, and activity trends."
      icon={BarChart3}
    >
      {/* Period Selector */}
      <div className="flex items-center gap-2 mb-8 flex-wrap">
        {PERIODS.map(p => (
          <button
            key={p.value}
            onClick={() => setDays(p.value)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
              days === p.value
                ? "bg-accent text-white border-accent"
                : "bg-card text-muted-foreground border-border hover:border-accent/30"
            }`}
          >
            {p.label}
          </button>
        ))}
        <span className="ml-auto text-xs text-muted-foreground">
          Since{" "}
          {summary?.period?.since
            ? new Date(summary.period.since).toLocaleDateString()
            : "—"}
        </span>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-border bg-card">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
                <Activity className="w-3.5 h-3.5" />
                Total Events
              </div>
              <div className="text-2xl font-bold">
                {summary?.totalEvents?.toLocaleString() ?? 0}
              </div>
            </div>
            <div className="p-4 rounded-xl border border-border bg-card">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
                <MousePointer className="w-3.5 h-3.5" />
                Unique Events
              </div>
              <div className="text-2xl font-bold">
                {summary?.topEvents?.length ?? 0}
              </div>
            </div>
            <div className="p-4 rounded-xl border border-border bg-card">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
                <Eye className="w-3.5 h-3.5" />
                Pages Tracked
              </div>
              <div className="text-2xl font-bold">
                {summary?.topPages?.length ?? 0}
              </div>
            </div>
            <div className="p-4 rounded-xl border border-border bg-card">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
                <Calendar className="w-3.5 h-3.5" />
                Active Days
              </div>
              <div className="text-2xl font-bold">
                {summary?.dailyActivity?.filter(d => Number(d.count) > 0)
                  .length ?? 0}
              </div>
            </div>
          </div>

          {/* Top Events */}
          {summary?.topEvents && summary.topEvents.length > 0 && (
            <div className="p-5 rounded-xl border border-border bg-card">
              <div className="flex items-center gap-2 mb-4">
                <MousePointer className="w-4 h-4 text-accent" />
                <h3 className="font-semibold text-sm">Top Events</h3>
              </div>
              <div className="space-y-3">
                {summary.topEvents.map(e => (
                  <Bar
                    key={e.eventName}
                    label={e.eventName ?? "Unknown"}
                    value={Number(e.count)}
                    max={maxEventCount}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Top Pages */}
          {summary?.topPages && summary.topPages.length > 0 && (
            <div className="p-5 rounded-xl border border-border bg-card">
              <div className="flex items-center gap-2 mb-4">
                <Eye className="w-4 h-4 text-accent" />
                <h3 className="font-semibold text-sm">Top Pages</h3>
              </div>
              <div className="space-y-3">
                {summary.topPages.map(p => (
                  <Bar
                    key={p.pagePath}
                    label={p.pagePath ?? "/"}
                    value={Number(p.count)}
                    max={maxPageCount}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Daily Activity */}
          {summary?.dailyActivity && summary.dailyActivity.length > 0 && (
            <div className="p-5 rounded-xl border border-border bg-card">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 h-4 text-accent" />
                <h3 className="font-semibold text-sm">Daily Activity</h3>
              </div>
              <div className="flex items-end gap-1 h-32">
                {summary.dailyActivity.map(d => {
                  const pct =
                    maxDailyCount > 0
                      ? (Number(d.count) / maxDailyCount) * 100
                      : 0;
                  return (
                    <div
                      key={d.date}
                      className="flex-1 flex flex-col items-center gap-1 group"
                      title={`${d.date}: ${d.count} events`}
                    >
                      <div
                        className="w-full flex items-end justify-center"
                        style={{ height: "100px" }}
                      >
                        <div
                          className="w-full rounded-t bg-accent/60 group-hover:bg-accent transition-all"
                          style={{ height: `${Math.max(pct, 2)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span>{summary.dailyActivity[0]?.date}</span>
                <span>
                  {
                    summary.dailyActivity[summary.dailyActivity.length - 1]
                      ?.date
                  }
                </span>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!summary?.totalEvents && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <BarChart3 className="w-12 h-12 text-muted-foreground mb-4 opacity-40" />
              <p className="text-muted-foreground text-sm">
                No analytics data for this period yet
              </p>
            </div>
          )}
        </div>
      )}
    </PageShell>
  );
}
