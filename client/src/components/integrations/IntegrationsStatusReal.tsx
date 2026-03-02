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
  Eye,
  EyeOff,
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

// ─── Providers that require a user-supplied API key ───────────────────────────
const PROVIDERS_NEEDING_KEY: Record<string, { label: string; placeholder: string; hint: string }> = {
  notion: { label: "Notion API Key", placeholder: "secret_...", hint: "Get from notion.so/my-integrations" },
  asana: { label: "Asana Personal Access Token", placeholder: "1/...", hint: "Get from app.asana.com/0/my-apps" },
  calendly: { label: "Calendly API Key", placeholder: "eyJ...", hint: "Get from calendly.com/integrations/api_webhooks" },
  zoom: { label: "Zoom Account ID", placeholder: "Your Zoom Account ID", hint: "Get from marketplace.zoom.us" },
  github: { label: "GitHub Personal Access Token", placeholder: "ghp_...", hint: "Get from github.com/settings/tokens" },
  gmail: { label: "Gmail App Password", placeholder: "App password", hint: "Use an App Password from myaccount.google.com/security" },
};

function ApiKeyDialog({ provider, providerName, onConfirm, onCancel }: { provider: string; providerName: string; onConfirm: (token: string) => void; onCancel: () => void; }) {
  const [token, setToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const config = PROVIDERS_NEEDING_KEY[provider];
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
            <Key className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Connect {providerName}</h3>
            <p className="text-xs text-muted-foreground">{config?.hint}</p>
          </div>
        </div>
        <div className="space-y-3">
          <label className="text-sm font-medium text-muted-foreground">{config?.label ?? "API Key"}</label>
          <div className="relative">
            <input type={showToken ? "text" : "password"} value={token} onChange={e => setToken(e.target.value)} placeholder={config?.placeholder ?? "Paste your API key here"} className="w-full bg-muted border border-border rounded-lg px-3 py-2 pr-10 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500/50" autoFocus />
            <button type="button" onClick={() => setShowToken(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white">
              {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={onCancel} className="flex-1 px-4 py-2 bg-muted hover:bg-muted/80 text-muted-foreground rounded-lg text-sm transition-colors">Cancel</button>
          <button onClick={() => token.trim() && onConfirm(token.trim())} disabled={!token.trim()} className="flex-1 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            <Link className="w-4 h-4" />Connect
          </button>
        </div>
      </div>
    </div>
  );
}

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
  const [pendingConnect, setPendingConnect] = useState<{ provider: string; name: string } | null>(null);

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

  const handleConnectClick = (provider: string, name: string) => {
    if (PROVIDERS_NEEDING_KEY[provider]) {
      setPendingConnect({ provider, name });
    } else {
      connectMutation.mutate({ provider });
    }
  };

  const handleApiKeyConfirm = (token: string) => {
    if (!pendingConnect) return;
    connectMutation.mutate({ provider: pendingConnect.provider, accessToken: token });
    setPendingConnect(null);
  };

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
      <span className="flex items-center gap-1 px-2 py-1 bg-gray-500/10 text-muted-foreground rounded-full text-xs font-medium">
        <X className="w-3 h-3" />
        Disconnected
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {pendingConnect && (
        <ApiKeyDialog
          provider={pendingConnect.provider}
          providerName={pendingConnect.name}
          onConfirm={handleApiKeyConfirm}
          onCancel={() => setPendingConnect(null)}
        />
      )}
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Integrations</h2>
          <p className="text-sm text-muted-foreground mt-1">
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
            className="px-4 py-2 bg-muted hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2 text-sm"
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
                : "bg-card text-muted-foreground hover:bg-muted"
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
            <div key={i} className="bg-card border border-border rounded-xl p-4 animate-pulse">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-muted" />
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded w-2/3 mb-1" />
                  <div className="h-3 bg-muted rounded w-1/3" />
                </div>
              </div>
              <div className="h-8 bg-muted rounded" />
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
            const needsKey = !!PROVIDERS_NEEDING_KEY[service.id];

            return (
              <div
                key={service.id}
                className={`bg-card border rounded-xl p-4 transition-all ${
                  service.connected
                    ? "border-green-500/30 hover:border-green-500/50"
                    : "border-border hover:border-cyan-500/30"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${colorClass} flex items-center justify-center flex-shrink-0`}>
                      {icon}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{service.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{CATEGORY_LABELS[service.category] ?? service.category}</p>
                    </div>
                  </div>
                  {getStatusBadge(service.connected, service.status)}
                </div>

                {service.lastSyncAt && (
                  <p className="text-xs text-muted-foreground/70 mb-3">
                    Last sync: {new Date(service.lastSyncAt).toLocaleString()}
                  </p>
                )}

                {service.syncError && (
                  <p className="text-xs text-red-400 mb-3 truncate" title={service.syncError}>
                    {service.syncError}
                  </p>
                )}
                {needsKey && !service.connected && (
                  <p className="text-xs text-amber-400/70 mb-2 flex items-center gap-1">
                    <Key className="w-3 h-3" />
                    Requires your API key
                  </p>
                )}
                <div className="flex gap-2 mt-3">
                  {service.connected ? (
                    <button
                      onClick={() => disconnectMutation.mutate({ provider: service.id })}
                      disabled={disconnectMutation.isPending}
                      className="flex-1 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Link2Off className="w-4 h-4" />
                      Disconnect
                    </button>
                  ) : (
                    <button
                      onClick={() => handleConnectClick(service.id, service.name)}
                      disabled={connectMutation.isPending}
                      className="flex-1 px-3 py-2 bg-[var(--brain-cyan)]/10 hover:bg-[var(--brain-cyan)]/20 text-[var(--brain-cyan)] rounded-lg text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {needsKey ? <Key className="w-4 h-4" /> : <Link className="w-4 h-4" />}
                      {needsKey ? "Enter API Key" : "Connect"}
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border/50">
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
            <div className="text-2xl font-bold text-green-400">{connectedCount}</div>
            <div className="text-sm text-green-400/70">Connected</div>
          </div>
          <div className="bg-gray-500/10 border border-gray-500/20 rounded-xl p-4">
            <div className="text-2xl font-bold text-muted-foreground">
              {integrations.filter(i => !i.connected && i.status !== "error").length}
            </div>
            <div className="text-sm text-muted-foreground/70">Disconnected</div>
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
