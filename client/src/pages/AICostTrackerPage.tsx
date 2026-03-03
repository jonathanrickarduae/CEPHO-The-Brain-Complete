/**
 * p5-11: AI Cost Tracker Page
 *
 * Shows the user their LLM usage and estimated spend over the last 7/30/90 days.
 * Breaks down costs by feature (procedure) and model.
 *
 * Route: /ai-cost-tracker
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  DollarSign,
  Cpu,
  Activity,
  TrendingUp,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const DAY_OPTIONS = [
  { label: "Last 7 days", value: 7 },
  { label: "Last 30 days", value: 30 },
  { label: "Last 90 days", value: 90 },
];

export default function AICostTrackerPage() {
  const [days, setDays] = useState(30);

  const {
    data: summary,
    isLoading: summaryLoading,
    refetch: refetchSummary,
    error: summaryError,
  } = trpc.aiCostTracking.getSummary.useQuery({ days }, { retry: false });

  const {
    data: byFeature,
    isLoading: featureLoading,
    refetch: refetchFeature,
  } = trpc.aiCostTracking.getByFeature.useQuery({ days }, { retry: false });

  const {
    data: history,
    isLoading: historyLoading,
    refetch: refetchHistory,
  } = trpc.aiCostTracking.getHistory.useQuery(
    { limit: 20, offset: 0 },
    { retry: false }
  );

  const isLoading = summaryLoading || featureLoading || historyLoading;

  const handleRefresh = () => {
    refetchSummary();
    refetchFeature();
    refetchHistory();
  };

  const chartData = (byFeature ?? []).slice(0, 10).map(f => ({
    name: f.feature.length > 20 ? f.feature.slice(0, 20) + "…" : f.feature,
    cost: parseFloat(f.costUsd),
    calls: f.calls,
  }));

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-emerald-500" />
            AI Cost Tracker
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Monitor LLM usage and estimated spend across all CEPHO features.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            value={String(days)}
            onValueChange={v => setDays(Number(v))}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DAY_OPTIONS.map(o => (
                <SelectItem key={o.value} value={String(o.value)}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw
              className={`w-4 h-4 mr-1 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error state */}
      {summaryError && (
        <div className="flex items-center gap-2 p-4 rounded-lg bg-destructive/10 text-destructive text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>
            Could not load cost data. Usage logging will begin once you make AI
            calls.
          </span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5" />
              Estimated Cost
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">
              ${summary?.totalCostUsd ?? "0.0000"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Last {days} days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5" />
              Total Tokens
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(summary?.totalTokens ?? 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {(summary?.promptTokens ?? 0).toLocaleString()} prompt /{" "}
              {(summary?.completionTokens ?? 0).toLocaleString()} completion
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <Activity className="w-3.5 h-3.5" />
              AI Calls
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(summary?.totalCalls ?? 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all features
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              Avg Cost / Call
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              $
              {summary && summary.totalCalls > 0
                ? (
                    parseFloat(summary.totalCostUsd) / summary.totalCalls
                  ).toFixed(5)
                : "0.00000"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Per LLM call</p>
          </CardContent>
        </Card>
      </div>

      {/* Cost by Feature Chart */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cost by Feature</CardTitle>
            <CardDescription>
              Top 10 features by estimated USD spend
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={chartData}
                margin={{ top: 4, right: 16, left: 0, bottom: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "#888" }}
                  angle={-35}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#888" }}
                  tickFormatter={v => `$${v.toFixed(4)}`}
                />
                <Tooltip
                  formatter={(value: number) => [`$${value.toFixed(6)}`, "Cost"]}
                  contentStyle={{
                    background: "#1a1a2e",
                    border: "1px solid #333",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="cost" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Feature Breakdown Table */}
      {(byFeature ?? []).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Feature Breakdown</CardTitle>
            <CardDescription>
              All features sorted by cost (last {days} days)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Feature</TableHead>
                  <TableHead className="text-right">Calls</TableHead>
                  <TableHead className="text-right">Tokens</TableHead>
                  <TableHead className="text-right">Est. Cost (USD)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(byFeature ?? []).map(f => (
                  <TableRow key={f.feature}>
                    <TableCell>
                      <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                        {f.feature}
                      </code>
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {f.calls.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {f.tokens.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm text-emerald-500">
                      ${f.costUsd}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Recent History */}
      {(history ?? []).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent LLM Calls</CardTitle>
            <CardDescription>Last 20 logged AI calls</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Feature</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead className="text-right">Tokens</TableHead>
                  <TableHead className="text-right">Cost</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(history ?? []).map(h => (
                  <TableRow key={h.id}>
                    <TableCell>
                      <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                        {h.feature}
                      </code>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {h.model}
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {h.totalTokens.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm text-emerald-500">
                      ${h.estimatedCostUsd}
                    </TableCell>
                    <TableCell>
                      {h.errorCode ? (
                        <Badge variant="destructive" className="text-xs">
                          {h.errorCode}
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-xs text-emerald-500 border-emerald-500/30"
                        >
                          OK
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(h.createdAt).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {!isLoading &&
        !summaryError &&
        (summary?.totalCalls ?? 0) === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Cpu className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No usage data yet</h3>
              <p className="text-muted-foreground text-sm max-w-sm">
                AI cost data will appear here once you start using features like
                Voice Notes, Digital Twin, AI Experts, and other LLM-powered
                tools.
              </p>
            </CardContent>
          </Card>
        )}
    </div>
  );
}
