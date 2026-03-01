import React, { useState } from "react";
import {
  Check,
  X,
  AlertCircle,
  RefreshCw,
  Key,
  Mail,
  MessageSquare,
  Video,
  Calendar,
  FileText,
  Database,
  Shield,
  Cpu,
  Sparkles,
  Lock,
  Loader2,
  Link,
  Link2Off,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

// ─── Icon map for each provider ──────────────────────────────────────────────
const PROVIDER_ICONS: Record<string, React.ReactNode> = {
  openai: <Cpu className="w-5 h-5 text-white" />,
  anthropic: <Sparkles className="w-5 h-5 text-white" />,
  elevenlabs: <MessageSquare className="w-5 h-5 text-white" />,
  synthesia: <Video className="w-5 h-5 text-white" />,
  gmail: <Mail className="w-5 h-5 text-white" />,
  google: <Calendar className="w-5 h-5 text-white" />,
  outlook: <Mail className="w-5 h-5 text-white" />,
  calendly: <Calendar className="w-5 h-5 text-white" />,
  zoom: <Video className="w-5 h-5 text-white" />,
  slack: <MessageSquare className="w-5 h-5 text-white" />,
  asana: <FileText className="w-5 h-5 text-white" />,
  todoist: <FileText className="w-5 h-5 text-white" />,
  notion: <FileText className="w-5 h-5 text-white" />,
  trello: <FileText className="w-5 h-5 text-white" />,
  github: <Database className="w-5 h-5 text-white" />,
  salesforce: <Shield className="w-5 h-5 text-white" />,
  hubspot: <Lock className="w-5 h-5 text-white" />,
};

const CATEGORY_COLORS: Record<string, string> = {
  ai: "from-purple-500 to-pink-500",
  calendar: "from-blue-500 to-cyan-500",
  communication: "from-sky-500 to-blue-500",
  productivity: "from-green-500 to-emerald-500",
  development: "from-gray-500 to-slate-500",
  email: "from-orange-500 to-amber-500",
  crm: "from-rose-500 to-red-500",
};

const CATEGORY_LABELS: Record<string, string> = {
  all: "All",
  ai: "AI Services",
  calendar: "Calendar",
  communication: "Communication",
  productivity: "Productivity",
  development: "Development",
  email: "Email",
  crm: "CRM",
};

export function IntegrationsStatusReal() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isInitializing, setIsInitializing] = useState(false);

  const {
    data: integrations = [],
    isLoading,
    refetch,
  } = trpc.integrations.getAll.useQuery(undefined, {
    retry: 1,
    retryDelay: 1000,
  });

  const initializeAll = trpc.integrations.initializeAll.useMutation({
    onSuccess: data => {
      toast.success(`${data.count} provider${data.count !== 1 ? "s" : ""} auto-connected from environment keys.`);
      void refetch();
    },
  });

  const connectMutation = trpc.integrations.connect.useMutation({
    onSuccess: (_data, vars) => {
      toast.success(`${vars.provider} connected`);
      void refetch();
    },
    onError: (err, vars) => {
      toast.error(`Failed to connect ${vars.provider}: ${err.message}`);
    },
  });

  const disconnectMutation = trpc.integrations.disconnect.useMutation({
    onSuccess: (_data, vars) => {
      toast.success(`${vars.provider} disconnected`);
      void refetch();
    },
  });

  const handleInitialize = async () => {
    setIsInitializing(true);
    try {
      await initializeAll.mutateAsync();
    } finally {
      setIsInitializing(false);
    }
  };

  // All categories present in the data
  const categories = ["all", ...Array.from(new Set(integrations.map(i => i.category)))];

  const filtered =
    selectedCategory === "all"
      ? integrations
      : integrations.filter(i => i.category === selectedCategory);

  const connectedCount = integrations.filter(i => i.connected).length;

  const getStatusBadge = (connected: boolean, status: string) => {
    if (connected) {
      return (
        <span className="flex items-center gap-1 px-2 py-1 bg-green-500/10 text-green-400 rounded-full text-xs font-medium">
          <Check className="w-3 h-3" />
          Connected
        </span>
      );
    }
    if (status === "error") {
      return (
        <span className="flex items-center gap-1 px-2 py-1 bg-red-500/10 text-red-400 rounded-full text-xs font-medium">
          <AlertCircle className="w-3 h-3" />
          Error
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 px-2 py-1 bg-gray-500/10 text-gray-400 rounded-full text-xs font-medium">
        <X className="w-3 h-3" />
        Disconnected
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Integrations</h2>
          <p className="text-sm text-gray-400 mt-1">
            {isLoading
              ? "Loading..."
              : `${connectedCount} of ${integrations.length} services connected`}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleInitialize}
            disabled={isInitializing}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 text-sm"
          >
            {isInitializing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Initialising...
              </>
            ) : (
              <>
                <Key className="w-4 h-4" />
                Auto-Connect from Keys
              </>
            )}
          </button>
          <button
            onClick={() => void refetch()}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2 text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              selectedCategory === cat
                ? "bg-cyan-500 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            {CATEGORY_LABELS[cat] ?? cat}{" "}
            ({cat === "all" ? integrations.length : integrations.filter(i => i.category === cat).length})
          </button>
        ))}
      </div>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-gray-800 border border-gray-700 rounded-xl p-4 animate-pulse">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-gray-700" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-700 rounded w-2/3 mb-1" />
                  <div className="h-3 bg-gray-700 rounded w-1/3" />
                </div>
              </div>
              <div className="h-8 bg-gray-700 rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Services Grid */}
      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(service => {
            const colorClass = CATEGORY_COLORS[service.category] ?? "from-gray-500 to-slate-500";
            const icon = PROVIDER_ICONS[service.id] ?? <Cpu className="w-5 h-5 text-white" />;

            return (
              <div
                key={service.id}
                className={`bg-gray-800 border rounded-xl p-4 transition-all ${
                  service.connected
                    ? "border-green-500/30 hover:border-green-500/50"
                    : "border-gray-700 hover:border-cyan-500/30"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${colorClass} flex items-center justify-center flex-shrink-0`}>
                      {icon}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{service.name}</p>
                      <p className="text-xs text-gray-400 capitalize">{CATEGORY_LABELS[service.category] ?? service.category}</p>
                    </div>
                  </div>
                  {getStatusBadge(service.connected, service.status)}
                </div>

                {service.lastSyncAt && (
                  <p className="text-xs text-gray-500 mb-3">
                    Last sync: {new Date(service.lastSyncAt).toLocaleString()}
                  </p>
                )}

                {service.syncError && (
                  <p className="text-xs text-red-400 mb-3 truncate" title={service.syncError}>
                    {service.syncError}
                  </p>
                )}

                <div className="flex gap-2 mt-3">
                  {service.connected ? (
                    <button
                      onClick={() => disconnectMutation.mutate({ provider: service.id })}
                      disabled={disconnectMutation.isPending}
                      className="flex-1 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >                      <Link2Off className="w-4 h-4" />
                      Disconnect
                    </button>
                  ) : (
                    <button
                      onClick={() => connectMutation.mutate({ provider: service.id })}
                      disabled={connectMutation.isPending}
                      className="flex-1 px-3 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Link className="w-4 h-4" />
                      Connect
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Summary Stats */}
      {!isLoading && integrations.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-800">
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
            <div className="text-2xl font-bold text-green-400">{connectedCount}</div>
            <div className="text-sm text-green-400/70">Connected</div>
          </div>
          <div className="bg-gray-500/10 border border-gray-500/20 rounded-xl p-4">
            <div className="text-2xl font-bold text-gray-400">
              {integrations.filter(i => !i.connected && i.status !== "error").length}
            </div>
            <div className="text-sm text-gray-400/70">Disconnected</div>
          </div>
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
            <div className="text-2xl font-bold text-red-400">
              {integrations.filter(i => i.status === "error").length}
            </div>
            <div className="text-sm text-red-400/70">Errors</div>
          </div>
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
            <div className="text-2xl font-bold text-purple-400">{integrations.length}</div>
            <div className="text-sm text-purple-400/70">Total</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default IntegrationsStatusReal;
