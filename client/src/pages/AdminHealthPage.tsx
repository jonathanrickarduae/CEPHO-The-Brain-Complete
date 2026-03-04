import { useEffect, useState } from "react";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Database,
  Server,
  Cpu,
  Clock,
  Activity,
  Shield,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ServiceCheck {
  name: string;
  status: "ok" | "error" | "unknown";
  latencyMs?: number;
  detail?: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface HealthResponse {
  status: string;
  timestamp: string;
  uptime: number;
  environment: string;
  version: string;
}

interface ReadinessResponse {
  status: string;
  checks: Record<
    string,
    { status: string; latencyMs?: number; error?: string }
  >;
}

function StatusBadge({ status }: { status: "ok" | "error" | "unknown" }) {
  if (status === "ok")
    return (
      <span className="flex items-center gap-1.5 text-emerald-400 text-sm font-semibold">
        <CheckCircle2 className="w-4 h-4" />
        Healthy
      </span>
    );
  if (status === "error")
    return (
      <span className="flex items-center gap-1.5 text-red-400 text-sm font-semibold">
        <XCircle className="w-4 h-4" />
        Error
      </span>
    );
  return (
    <span className="flex items-center gap-1.5 text-yellow-400 text-sm font-semibold">
      <AlertCircle className="w-4 h-4" />
      Unknown
    </span>
  );
}

function ServiceCard({ check }: { check: ServiceCheck }) {
  const Icon = check.icon;
  const borderColor =
    check.status === "ok"
      ? "border-emerald-500/30"
      : check.status === "error"
        ? "border-red-500/30"
        : "border-yellow-500/30";
  const bgColor =
    check.status === "ok"
      ? "bg-emerald-500/5"
      : check.status === "error"
        ? "bg-red-500/5"
        : "bg-yellow-500/5";

  return (
    <div
      className={`rounded-xl border ${borderColor} ${bgColor} p-5 flex flex-col gap-3`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-muted-foreground" />
          <span className="font-semibold text-sm">{check.name}</span>
        </div>
        <StatusBadge status={check.status} />
      </div>
      {check.latencyMs !== undefined && (
        <p className="text-xs text-muted-foreground">
          Latency:{" "}
          <span className="font-mono font-semibold text-foreground">
            {check.latencyMs}ms
          </span>
        </p>
      )}
      {check.detail && (
        <p className="text-xs text-muted-foreground truncate">{check.detail}</p>
      )}
    </div>
  );
}

function UptimeDisplay({ seconds }: { seconds: number }) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return (
    <span className="font-mono text-emerald-400 font-bold">
      {d}d {h}h {m}m {s}s
    </span>
  );
}

export default function AdminHealthPage() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [readiness, setReadiness] = useState<ReadinessResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const [hRes, rRes] = await Promise.all([
        fetch("/health"),
        fetch("/health/ready"),
      ]);
      const hData = (await hRes.json()) as HealthResponse;
      const rData = (await rRes.json()) as ReadinessResponse;
      setHealth(hData);
      setReadiness(rData);
      setLastChecked(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch health");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchHealth();
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => void fetchHealth(), 30_000);
    return () => clearInterval(interval);
  }, []);

  const serviceChecks: ServiceCheck[] = [
    {
      name: "API Server",
      status: health ? "ok" : error ? "error" : "unknown",
      latencyMs: undefined,
      detail: health
        ? `v${health.version} · ${health.environment}`
        : undefined,
      icon: Server,
    },
    {
      name: "Database (PostgreSQL)",
      status:
        (readiness?.checks?.database?.status as "ok" | "error" | "unknown") ??
        "unknown",
      latencyMs: readiness?.checks?.database?.latencyMs,
      detail: readiness?.checks?.database?.error,
      icon: Database,
    },
    {
      name: "Cache (Redis)",
      status:
        (readiness?.checks?.cache?.status as "ok" | "error" | "unknown") ??
        "unknown",
      latencyMs: readiness?.checks?.cache?.latencyMs,
      detail: readiness?.checks?.cache?.error,
      icon: Zap,
    },
    {
      name: "AI Services",
      status:
        (readiness?.checks?.ai?.status as "ok" | "error" | "unknown") ??
        "unknown",
      detail: readiness?.checks?.ai?.error ?? "OpenAI + Anthropic",
      icon: Cpu,
    },
    {
      name: "Error Tracking (Sentry)",
      status:
        (readiness?.checks?.sentry?.status as "ok" | "error" | "unknown") ??
        "unknown",
      detail: readiness?.checks?.sentry?.error ?? "Check SENTRY_DSN env var",
      icon: Shield,
    },
    {
      name: "Log Shipping (BetterStack)",
      status:
        (readiness?.checks?.logtail?.status as "ok" | "error" | "unknown") ??
        "unknown",
      detail:
        readiness?.checks?.logtail?.error ??
        "Check LOGTAIL_SOURCE_TOKEN env var",
      icon: Activity,
    },
  ];

  const allHealthy = serviceChecks.every((c) => c.status === "ok");
  const hasErrors = serviceChecks.some((c) => c.status === "error");

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">System Health</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time status of all CEPHO services and dependencies
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void fetchHealth()}
          disabled={loading}
          className="gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Overall status banner */}
      <div
        className={`rounded-xl border p-5 flex items-center gap-4 ${
          allHealthy
            ? "border-emerald-500/40 bg-emerald-500/10"
            : hasErrors
              ? "border-red-500/40 bg-red-500/10"
              : "border-yellow-500/40 bg-yellow-500/10"
        }`}
      >
        {allHealthy ? (
          <CheckCircle2 className="w-8 h-8 text-emerald-400 flex-shrink-0" />
        ) : hasErrors ? (
          <XCircle className="w-8 h-8 text-red-400 flex-shrink-0" />
        ) : (
          <AlertCircle className="w-8 h-8 text-yellow-400 flex-shrink-0" />
        )}
        <div className="flex-1">
          <p className="font-bold text-lg">
            {allHealthy
              ? "All Systems Operational"
              : hasErrors
                ? "Service Degradation Detected"
                : "Partial Service Information"}
          </p>
          <p className="text-sm text-muted-foreground">
            {lastChecked
              ? `Last checked: ${lastChecked.toLocaleTimeString()} · Auto-refreshes every 30s`
              : "Checking..."}
          </p>
        </div>
        {health && (
          <div className="text-right hidden sm:block">
            <p className="text-xs text-muted-foreground">Uptime</p>
            <UptimeDisplay seconds={health.uptime} />
          </div>
        )}
      </div>

      {/* Service grid */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Service Status
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {serviceChecks.map((check) => (
            <ServiceCard key={check.name} check={check} />
          ))}
        </div>
      </div>

      {/* System info */}
      {health && (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            System Information
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              {
                label: "Environment",
                value: health.environment,
                icon: Server,
              },
              { label: "Version", value: `v${health.version}`, icon: Cpu },
              {
                label: "Uptime",
                value: <UptimeDisplay seconds={health.uptime} />,
                icon: Clock,
              },
              {
                label: "Timestamp",
                value: new Date(health.timestamp).toLocaleTimeString(),
                icon: Activity,
              },
            ].map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="bg-card border border-border rounded-xl p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">
                    {label}
                  </span>
                </div>
                <p className="text-sm font-semibold">{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-5">
          <p className="text-red-400 font-semibold">Failed to fetch health</p>
          <p className="text-sm text-muted-foreground mt-1">{error}</p>
        </div>
      )}
    </div>
  );
}
