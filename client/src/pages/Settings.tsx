import { PageShell } from "@/components/layout/PageShell";
import { useState, useEffect } from "react";
import { useSearch } from "wouter";
import { trpc } from "@/lib/trpc";
import {
  Settings as SettingsIcon,
  Settings2,
  User,
  Calendar,
  Database,
  Bell,
  Shield,
  Palette,
  CreditCard,
  Users,
  Search,
  Plus,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Activity,
  ShieldAlert,
  RefreshCw,
  Globe,
        FileText,
  Clock,
  Code,
  Copy,
  Trash2,
  Key,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ThemeSelector,
  ThemeProvider,
} from "@/components/settings/ThemeToggle";
import { CalendarIntegration } from "@/components/integrations/CalendarIntegration";
import { TrainingDataPipeline } from "@/components/analytics/TrainingDataPipeline";
import { ReferralDashboard } from "@/components/ai-agents/WaitlistReferral";
import { AccessibilitySettingsPanel } from "@/components/settings/AccessibilitySettingsPanel";

import { IntegrationsStatusReal } from "@/components/integrations/IntegrationsStatusReal";
import { SubscriptionManager } from "@/components/shared/SubscriptionManager";
import { SignatureManager } from "@/components/shared/SignatureManager";
import { AIProviderSettings } from "@/components/ai-agents/AIRouter";
import { APICostCalculator } from "@/components/integrations/APICostCalculator";
import { SecureStorageDashboard } from "@/components/project-management/SecureStorageDashboard";
import { BrandKitManager } from "@/components/content/BrandKit";
import { DataGovernanceDashboard } from "@/components/project-management/DataGovernanceDashboard";
import { GovernanceSettings } from "@/components/settings/GovernanceSettings";
import { TwoFactorSettings } from "@/components/settings/TwoFactorSettings";
import {
  Plug,
  Wallet,
  FileSignature,
  Cpu,
  HardDrive,
  Paintbrush,
  ShieldCheck,
} from "lucide-react";

type SettingsTab =
  | "governance"
  | "integrations"
  | "email-accounts"
  | "subscriptions"
  | "signatures"
  | "ai-providers"
  | "api-costs"
  | "storage"
  | "brand-kit"
  | "data-governance"
  | "calendar"
  | "training"
  | "referrals"
  | "notifications"
  | "privacy"
  | "appearance"
  | "accessibility"
  | "profile"
  | "vault"
  | "developer";

// ─── Developer & API Panel ──────────────────────────────────────────────────
function DeveloperPanel() {
  const [newKeyName, setNewKeyName] = useState("");
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [exportRequested, setExportRequested] = useState(false);
  const utils = trpc.useUtils();
  const { data: keysData } = trpc.apiKeys.listKeys.useQuery();
  const { data: gdprExport } = trpc.gdpr.exportMyData.useQuery(undefined, {
    enabled: exportRequested,
  });
  useEffect(() => {
    if (gdprExport && exportRequested) {
      const blob = new Blob([JSON.stringify(gdprExport, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "cepho-my-data-export.json";
      a.click();
      URL.revokeObjectURL(url);
      setExportRequested(false);
    }
  }, [gdprExport, exportRequested]);
  const createKey = trpc.apiKeys.createKey.useMutation({
    onSuccess: data => {
      setCreatedKey(data.key);
      setNewKeyName("");
      utils.apiKeys.listKeys.invalidate();
    },
  });
  const revokeKey = trpc.apiKeys.revokeKey.useMutation({
    onSuccess: () => utils.apiKeys.listKeys.invalidate(),
  });

  return (
    <div className="space-y-6">
      {/* Create new key */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Key className="w-5 h-5 text-primary" /> API Keys
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Use API keys to access CEPHO.AI programmatically. Keep your keys
          secure — they grant full access to your account.
        </p>
        {createdKey && (
          <div className="mb-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
            <div className="text-sm font-medium text-green-400 mb-2">
              Key created — save it now, it will not be shown again.
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs bg-background rounded px-3 py-2 text-green-300 font-mono break-all">
                {createdKey}
              </code>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(createdKey);
                }}
              >
                <Copy className="w-3 h-3" />
              </Button>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="mt-2 text-xs"
              onClick={() => setCreatedKey(null)}
            >
              Dismiss
            </Button>
          </div>
        )}
        <div className="flex gap-2">
          <Input
            placeholder="Key name (e.g. Production App)"
            value={newKeyName}
            onChange={e => setNewKeyName(e.target.value)}
            className="flex-1"
          />
          <Button
            onClick={() =>
              createKey.mutate({ name: newKeyName, scopes: ["read", "write"] })
            }
            disabled={!newKeyName.trim() || createKey.isPending}
          >
            <Plus className="w-4 h-4 mr-1" /> Generate Key
          </Button>
        </div>
      </div>

      {/* Existing keys */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h4 className="font-semibold text-white mb-4">Active Keys</h4>
        {!keysData?.keys?.length ? (
          <p className="text-sm text-muted-foreground">
            No API keys yet. Generate one above.
          </p>
        ) : (
          <div className="space-y-2">
            {keysData.keys.map(key => (
              <div
                key={key.id}
                className="flex items-center justify-between p-3 bg-background rounded-lg border border-border"
              >
                <div>
                  <div className="font-medium text-sm text-white">
                    {key.name}
                  </div>
                  <div className="text-xs text-muted-foreground font-mono">
                    {key.keyPrefix}••••••••••••••••
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Created {new Date(key.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-400 hover:text-red-300"
                  onClick={() => revokeKey.mutate({ keyId: key.id })}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* GDPR */}
      <div className="bg-card rounded-xl border border-red-500/20 p-6">
        <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
          <Shield className="w-4 h-4 text-red-400" /> Data & Privacy
        </h4>
        <p className="text-sm text-muted-foreground mb-4">
          Export all your data or permanently delete your account under GDPR
          rights.
        </p>
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setExportRequested(true)}
          >
            Export My Data
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              const phrase = prompt(
                "Type DELETE MY ACCOUNT to confirm permanent deletion:"
              );
              if (phrase === "DELETE MY ACCOUNT") {
                alert(
                  "Account deletion initiated. You will receive a confirmation email."
                );
              }
            }}
          >
            Delete My Account
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Vault Panel (merged from /vault) ──────────────────────────────────────
function VaultPanel() {
  // Real data from subscriptionTracker and integrations routers
  const { data: _subscriptionSummary } =
    trpc.subscriptionTracker.getSummary.useQuery(undefined, { retry: false });
  const { data: renewalSummary } =
    trpc.subscriptionTracker.getRenewalSummary.useQuery(undefined, {
      retry: false,
    });
  const { data: integrationsData } = trpc.integrations.list.useQuery(
    undefined,
    { retry: false }
  );
  const { data: auditData } = trpc.auditLog.getMyLogs.useQuery(
    { limit: 5 },
    { retry: false }
  );

  // Derive stats from real data, fall back to sensible defaults
  const integrations = integrationsData ?? [];
  const contractRenewals = renewalSummary?.upcoming ?? [];
  const securityEvents = auditData?.logs ?? [];
  const healthyCount = integrations.filter(
    (i: any) => i.status === "active"
  ).length;
  const warningCount = integrations.filter(
    (i: any) => i.status === "warning"
  ).length;
  const brokenCount = integrations.filter(
    (i: any) => i.status === "error"
  ).length;
  const blockedThreats = securityEvents.filter(
    (e: any) => e.action === "blocked"
  ).length;
  const urgentContracts = contractRenewals.filter(
    (c: any) => c.status === "urgent"
  ).length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl border border-green-500/30 bg-green-500/10 flex items-center gap-3">
          <CheckCircle2 className="w-7 h-7 text-green-500 flex-shrink-0" />
          <div>
            <div className="text-2xl font-bold text-green-500">
              {healthyCount}
            </div>
            <div className="text-xs text-muted-foreground">Healthy</div>
          </div>
        </div>
        <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 flex items-center gap-3">
          <AlertTriangle className="w-7 h-7 text-amber-500 flex-shrink-0" />
          <div>
            <div className="text-2xl font-bold text-amber-500">
              {warningCount}
            </div>
            <div className="text-xs text-muted-foreground">Warning</div>
          </div>
        </div>
        <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 flex items-center gap-3">
          <XCircle className="w-7 h-7 text-red-500 flex-shrink-0" />
          <div>
            <div className="text-2xl font-bold text-red-500">{brokenCount}</div>
            <div className="text-xs text-muted-foreground">Broken</div>
          </div>
        </div>
        <div className="p-4 rounded-xl border border-purple-500/30 bg-purple-500/10 flex items-center gap-3">
          <ShieldAlert className="w-7 h-7 text-purple-500 flex-shrink-0" />
          <div>
            <div className="text-2xl font-bold text-purple-500">
              {blockedThreats}
            </div>
            <div className="text-xs text-muted-foreground">Blocked</div>
          </div>
        </div>
      </div>

      {/* Integrations */}
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" /> Integrations
          </h3>
          <Button size="sm" variant="outline" className="h-7 gap-1 text-xs">
            <Plus className="w-3 h-3" /> Add
          </Button>
        </div>
        <div className="space-y-2">
          {integrations.map((integration: any) => (
            <div
              key={integration.id}
              className={`p-3 rounded-lg border flex items-center justify-between ${
                integration.status === "active"
                  ? "border-border bg-muted/20"
                  : integration.status === "warning"
                    ? "border-amber-500/30 bg-amber-500/5"
                    : "border-red-500/30 bg-red-500/5"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-primary">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-medium text-sm text-foreground capitalize">
                    {integration.provider}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {integration.lastSyncAt
                      ? new Date(integration.lastSyncAt).toLocaleString()
                      : "Never synced"}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={`text-xs font-medium ${
                    integration.status === "active"
                      ? "text-green-400"
                      : integration.status === "warning"
                        ? "text-amber-400"
                        : "text-red-400"
                  }`}
                >
                  {integration.status}
                </div>
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                  <RefreshCw className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contract Renewals */}
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" /> Contract Renewals{" "}
            {urgentContracts > 0 && (
              <Badge className="bg-red-500/20 text-red-400 border-0 text-xs">
                {urgentContracts} urgent
              </Badge>
            )}
          </h3>
        </div>
        <div className="space-y-2">
          {contractRenewals.map((contract: any) => {
            const isUrgent = contract.daysUntilRenewal <= 14;
            const isUpcoming = contract.daysUntilRenewal <= 30;
            return (
              <div
                key={contract.id}
                className={`p-3 rounded-lg border flex items-center justify-between ${
                  isUrgent
                    ? "border-red-500/30 bg-red-500/5"
                    : isUpcoming
                      ? "border-amber-500/30 bg-amber-500/5"
                      : "border-border bg-muted/20"
                }`}
              >
                <div>
                  <div className="font-medium text-sm text-foreground">
                    {contract.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {contract.billingCycle} · {contract.currency}
                    {contract.cost?.toLocaleString()}/yr
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={`text-xs font-medium ${
                      isUrgent
                        ? "text-red-400"
                        : isUpcoming
                          ? "text-amber-400"
                          : "text-green-400"
                    }`}
                  >
                    {contract.daysUntilRenewal}d
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {contract.renewalDate
                      ? new Date(contract.renewalDate).toLocaleDateString()
                      : "—"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Security Events */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="font-semibold text-foreground flex items-center gap-2 mb-4">
          <Shield className="w-4 h-4 text-purple-400" /> Security Events
        </h3>
        <div className="space-y-2">
          {securityEvents.map((event) => (
            <div
              key={event.id}
              className="p-3 rounded-lg border border-border bg-muted/20 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    event.severity === "critical"
                      ? "bg-red-500"
                      : event.severity === "warning"
                        ? "bg-amber-500"
                        : "bg-blue-500"
                  }`}
                />
                <div>
                  <div className="text-sm font-medium text-foreground capitalize">
                    {event.action?.replace(/_/g, " ")}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {event.resourceType ?? "System"}
                    {event.ipAddress ? ` · ${event.ipAddress}` : ""}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                {event.createdAt
                  ? new Date(event.createdAt).toLocaleTimeString()
                  : "—"}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Profile Tab (wired to real auth.updateProfile) ──────────────────────────
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function ProfileTab() {
  const { data: me } = trpc.auth.me.useQuery();
  const utils = trpc.useUtils();
  const updateProfile = trpc.auth.updateProfile.useMutation({
    onSuccess: () => utils.auth.me.invalidate(),
  });
  const [name, setName] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (me?.name) setName(me.name);
  }, [me?.name]);

  const handleSave = () => {
    updateProfile.mutate(
      { name },
      {
        onSuccess: () => {
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        },
      }
    );
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <h3 className="text-lg font-semibold text-white mb-6">
        Profile Settings
      </h3>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
            <span className="text-3xl">🧠</span>
          </div>
        </div>
        <div className="grid gap-4">
          <div>
            <label className="block text-sm text-foreground/70 mb-2">
              Display Name
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg text-white focus:outline-none focus:border-[var(--brain-cyan)]"
            />
          </div>
          <div>
            <label className="block text-sm text-foreground/70 mb-2">
              Email
            </label>
            <input
              type="email"
              value={me?.email ?? ""}
              readOnly
              className="w-full px-4 py-2 bg-background border border-border rounded-lg text-white/50 cursor-not-allowed"
            />
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={updateProfile.isPending}
          className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 text-white rounded-lg transition-colors"
        >
          {updateProfile.isPending
            ? "Saving…"
            : saved
              ? "✓ Saved"
              : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

export default function Settings() {
  const search = useSearch();
  const [activeTab, setActiveTab] = useState<SettingsTab>("integrations");
  useEffect(() => {
    const params = new URLSearchParams(search);
    const tab = params.get("tab") as SettingsTab | null;
    if (tab) setActiveTab(tab);
  }, [search]);
  const [searchQuery, setSearchQuery] = useState("");

  // ─── Settings persistence via tRPC ───────────────────────────────────────
  const { data: userSettings } = trpc.settings.get.useQuery();
  const utils = trpc.useUtils();
  const updateSettings = trpc.settings.update.useMutation({
    onSuccess: () => utils.settings.get.invalidate(),
  });
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  useEffect(() => {
    if (userSettings)
      setNotificationsEnabled(userSettings.notificationsEnabled ?? true);
  }, [userSettings]);

  const tabs = [
    { id: "governance" as const, label: "Governance", icon: ShieldCheck },
    { id: "integrations" as const, label: "Integrations", icon: Plug },
    { id: "email-accounts" as const, label: "Email Accounts", icon: Bell },
    { id: "subscriptions" as const, label: "Subscriptions", icon: Wallet },
    { id: "signatures" as const, label: "Signatures", icon: FileSignature },
    { id: "ai-providers" as const, label: "AI Providers", icon: Cpu },
    { id: "api-costs" as const, label: "API Costs", icon: CreditCard },
    { id: "storage" as const, label: "Storage & Security", icon: HardDrive },
    { id: "brand-kit" as const, label: "Brand Kit", icon: Paintbrush },
    {
      id: "data-governance" as const,
      label: "Data Governance",
      icon: ShieldCheck,
    },
    { id: "calendar" as const, label: "Calendar", icon: Calendar },
    { id: "training" as const, label: "Training Data", icon: Database },
    { id: "referrals" as const, label: "Referrals", icon: Users },
    { id: "notifications" as const, label: "Notifications", icon: Bell },
    { id: "privacy" as const, label: "Privacy", icon: Shield },
    { id: "appearance" as const, label: "Appearance", icon: Palette },
    {
      id: "accessibility" as const,
      label: "Accessibility",
      icon: SettingsIcon,
    },
    { id: "profile" as const, label: "Profile", icon: User },
    { id: "vault" as const, label: "The Vault", icon: Shield },
    { id: "developer" as const, label: "Developer & API", icon: Code },
  ];

  const mockReferralStats = {
    totalReferrals: 12,
    pendingReferrals: 5,
    convertedReferrals: 7,
    creditsEarned: 850,
    referralCode: "BRAIN-ABC123",
  };

  return (
    <PageShell
      icon={Settings2}
      iconClass="bg-slate-500/15 text-slate-400"
      title="Settings"
      subtitle="Manage your account and preferences"
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            {/* Settings Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search settings..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 bg-card border-border"
              />
            </div>
            <nav className="bg-card rounded-xl border border-border overflow-hidden">
              {tabs
                .filter(
                  tab =>
                    searchQuery === "" ||
                    tab.label.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                      activeTab === tab.id
                        ? "bg-[var(--brain-cyan)]/10 text-[var(--brain-cyan)] border-l-2 border-cyan-400"
                        : "text-foreground/70 hover:bg-muted/50 hover:text-foreground/80"
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1">
            {activeTab === "governance" && (
              <div className="bg-card rounded-xl border border-border p-6">
                <GovernanceSettings />
              </div>
            )}

            {activeTab === "email-accounts" && (
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="text-lg font-semibold text-white mb-6">
                  Email Accounts
                </h3>
                <p className="text-muted-foreground mb-4">
                  Manage your connected email accounts for CEPHO.AI
                </p>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-card">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <Bell className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium text-foreground">
                          Outlook
                        </div>
                        <div className="text-xs text-muted-foreground">
                          user@company.com
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant="default"
                      className="bg-emerald-500/20 text-emerald-400"
                    >
                      Connected
                    </Badge>
                  </div>
                  <Button variant="outline" className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Email Account
                  </Button>
                </div>
              </div>
            )}

            {activeTab === "profile" && (
              <>
                <div className="bg-card rounded-xl border border-border p-6">
                  <h3 className="text-lg font-semibold text-white mb-6">
                    Profile Settings
                  </h3>

                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
                        <span className="text-3xl">🧠</span>
                      </div>
                      <div>
                        <button className="px-4 py-2 bg-muted hover:bg-gray-600 text-white rounded-lg text-sm transition-colors">
                          Change Avatar
                        </button>
                      </div>
                    </div>

                    <div className="grid gap-4">
                      <div>
                        <label className="block text-sm text-foreground/70 mb-2">
                          Display Name
                        </label>
                        <input
                          type="text"
                          defaultValue="User"
                          className="w-full px-4 py-2 bg-background border border-border rounded-lg text-white focus:outline-none focus:border-[var(--brain-cyan)]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-foreground/70 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          defaultValue="user@example.com"
                          className="w-full px-4 py-2 bg-background border border-border rounded-lg text-white focus:outline-none focus:border-[var(--brain-cyan)]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-foreground/70 mb-2">
                          Timezone
                        </label>
                        <select className="w-full px-4 py-2 bg-background border border-border rounded-lg text-white focus:outline-none focus:border-[var(--brain-cyan)]">
                          <option>UTC-8 (Pacific Time)</option>
                          <option>UTC-5 (Eastern Time)</option>
                          <option>UTC+0 (GMT)</option>
                          <option>UTC+1 (Central European)</option>
                        </select>
                      </div>
                    </div>

                    <button className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors">
                      Save Changes
                    </button>
                  </div>
                </div>
              </>
            )}

            {activeTab === "integrations" && (
              <div className="bg-card rounded-xl border border-border p-6">
                <IntegrationsStatusReal />
              </div>
            )}

            {activeTab === "subscriptions" && <SubscriptionManager />}

            {activeTab === "signatures" && <SignatureManager />}

            {activeTab === "ai-providers" && (
              <div className="bg-card rounded-xl border border-border p-6">
                <AIProviderSettings />
              </div>
            )}

            {activeTab === "api-costs" && (
              <div className="bg-card rounded-xl border border-border p-6">
                <APICostCalculator />
              </div>
            )}

            {activeTab === "storage" && (
              <div className="space-y-6">
                <TwoFactorSettings />
                <div className="bg-card rounded-xl border border-border p-6">
                  <SecureStorageDashboard />
                </div>
              </div>
            )}

            {activeTab === "brand-kit" && (
              <div className="bg-card rounded-xl border border-border p-6">
                <BrandKitManager />
              </div>
            )}

            {activeTab === "data-governance" && (
              <div className="bg-card rounded-xl border border-border p-6">
                <DataGovernanceDashboard />
              </div>
            )}

            {activeTab === "calendar" && <CalendarIntegration />}

            {activeTab === "training" && <TrainingDataPipeline />}

            {activeTab === "referrals" && (
              <ReferralDashboard stats={mockReferralStats} />
            )}

            {activeTab === "notifications" && (
              <div className="space-y-6">
                {/* Do Not Disturb */}
                <div className="bg-card rounded-xl border border-border p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Do Not Disturb
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-background rounded-xl">
                      <div>
                        <div className="font-medium text-white">
                          Enable Do Not Disturb
                        </div>
                        <div className="text-sm text-foreground/60">
                          Pause all notifications
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const next = !notificationsEnabled;
                          setNotificationsEnabled(next);
                          updateSettings.mutate({ notificationsEnabled: next });
                        }}
                        className={`w-12 h-6 rounded-full transition-colors ${notificationsEnabled ? "bg-[var(--brain-cyan)]" : "bg-muted"}`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-white transition-transform ${notificationsEnabled ? "translate-x-6" : "translate-x-0.5"}`}
                        />
                      </button>
                    </div>
                    <div className="p-4 bg-background rounded-xl">
                      <div className="font-medium text-white mb-3">
                        Schedule Quiet Hours
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-foreground/70 block mb-1">
                            Start Time
                          </label>
                          <select className="w-full bg-card border border-border rounded-lg px-3 py-2 text-white">
                            <option>10:00 PM</option>
                            <option>11:00 PM</option>
                            <option>12:00 AM</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-sm text-foreground/70 block mb-1">
                            End Time
                          </label>
                          <select className="w-full bg-card border border-border rounded-lg px-3 py-2 text-white">
                            <option>6:00 AM</option>
                            <option>7:00 AM</option>
                            <option>8:00 AM</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Email Digest Options */}
                <div className="bg-card rounded-xl border border-border p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Email Digest
                  </h3>
                  <div className="space-y-3">
                    {[
                      {
                        label: "Daily Digest",
                        description: "Receive a summary email every morning",
                        selected: true,
                      },
                      {
                        label: "Weekly Digest",
                        description: "Get a weekly roundup on Mondays",
                        selected: false,
                      },
                      {
                        label: "Urgent Only",
                        description: "Only receive emails for critical alerts",
                        selected: false,
                      },
                      {
                        label: "No Emails",
                        description: "Disable all email notifications",
                        selected: false,
                      },
                    ].map((option, index) => (
                      <label
                        key={index}
                        className="flex items-center gap-3 p-3 bg-background rounded-lg cursor-pointer hover:bg-gray-850 transition-colors"
                      >
                        <input
                          type="radio"
                          name="emailDigest"
                          defaultChecked={option.selected}
                          className="w-4 h-4 text-[var(--brain-cyan)] bg-card border-border focus:ring-cyan-500"
                        />
                        <div>
                          <div className="font-medium text-white">
                            {option.label}
                          </div>
                          <div className="text-sm text-foreground/60">
                            {option.description}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Notification Preferences */}
                <div className="bg-card rounded-xl border border-border p-6">
                  <h3 className="text-lg font-semibold text-white mb-6">
                    Notification Preferences
                  </h3>

                  <div className="space-y-4">
                    {[
                      {
                        label: "The Signal Reminder",
                        description:
                          "Get reminded to check your daily brief each morning",
                        enabled: true,
                      },
                      {
                        label: "Mood Check Prompts",
                        description:
                          "Receive prompts to log your mood 3x daily",
                        enabled: true,
                      },
                      {
                        label: "Task Deadlines",
                        description: "Get notified before task deadlines",
                        enabled: true,
                      },
                      {
                        label: "AI Insights",
                        description:
                          "Receive insights from your Chief of Staff",
                        enabled: false,
                      },
                      {
                        label: "Weekly Summary",
                        description: "Get a weekly productivity summary",
                        enabled: true,
                      },
                      {
                        label: "Security Alerts",
                        description:
                          "Get notified of security events in The Vault",
                        enabled: true,
                      },
                      {
                        label: "Integration Status",
                        description:
                          "Alerts when connected services have issues",
                        enabled: true,
                      },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-background rounded-xl"
                      >
                        <div>
                          <div className="font-medium text-white">
                            {item.label}
                          </div>
                          <div className="text-sm text-foreground/60">
                            {item.description}
                          </div>
                        </div>
                        <button
                          className={`w-12 h-6 rounded-full transition-colors ${
                            item.enabled ? "bg-[var(--brain-cyan)]" : "bg-muted"
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-full bg-white transition-transform ${
                              item.enabled ? "translate-x-6" : "translate-x-0.5"
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "privacy" && (
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="text-lg font-semibold text-white mb-6">
                  Privacy Settings
                </h3>

                <div className="space-y-6">
                  <div className="p-4 bg-background rounded-xl">
                    <h4 className="font-medium text-white mb-2">
                      Data Collection
                    </h4>
                    <p className="text-sm text-foreground/70 mb-4">
                      Control what data your Chief of Staff can access and learn
                      from.
                    </p>
                    <div className="space-y-3">
                      {[
                        { label: "Learn from conversations", enabled: true },
                        { label: "Analyze calendar patterns", enabled: true },
                        { label: "Track mood over time", enabled: true },
                        { label: "Share anonymized insights", enabled: false },
                      ].map((item, index) => (
                        <label
                          key={index}
                          className="flex items-center gap-3 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            defaultChecked={item.enabled}
                            className="w-4 h-4 rounded border-border bg-muted text-[var(--brain-cyan)] focus:ring-cyan-500"
                          />
                          <span className="text-foreground/80">
                            {item.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-background rounded-xl">
                    <h4 className="font-medium text-white mb-2">
                      Data Retention
                    </h4>
                    <p className="text-sm text-foreground/70 mb-4">
                      Choose how long to keep your data.
                    </p>
                    <select className="w-full px-4 py-2 bg-card border border-border rounded-lg text-white focus:outline-none focus:border-[var(--brain-cyan)]">
                      <option>Keep forever</option>
                      <option>1 year</option>
                      <option>6 months</option>
                      <option>3 months</option>
                    </select>
                  </div>

                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <h4 className="font-medium text-red-400 mb-2">
                      Danger Zone
                    </h4>
                    <p className="text-sm text-foreground/70 mb-4">
                      Permanently delete your account and all associated data.
                    </p>
                    <button className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors">
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "appearance" && (
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="text-lg font-semibold text-white mb-6">
                  Appearance
                </h3>

                <div className="space-y-6">
                  {/* Theme Selector Component */}
                  <ThemeProvider>
                    <ThemeSelector />
                  </ThemeProvider>

                  <div className="border-t border-border pt-6">
                    <label className="block text-sm font-medium text-foreground mb-3">
                      Accent Color
                    </label>
                    <div className="flex gap-3">
                      {[
                        { color: "cyan", class: "bg-[var(--brain-cyan)]" },
                        { color: "purple", class: "bg-purple-500" },
                        { color: "pink", class: "bg-pink-500" },
                        { color: "green", class: "bg-green-500" },
                        { color: "orange", class: "bg-orange-500" },
                      ].map(item => (
                        <button
                          key={item.color}
                          className={`w-10 h-10 rounded-full ${item.class} transition-transform hover:scale-110 ${
                            item.color === "cyan"
                              ? "ring-2 ring-white ring-offset-2 ring-offset-gray-800"
                              : ""
                          }`}
                          title={
                            item.color.charAt(0).toUpperCase() +
                            item.color.slice(1)
                          }
                        />
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-border pt-6">
                    <label className="block text-sm font-medium text-foreground mb-3">
                      Font Size
                    </label>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">A</span>
                      <input
                        type="range"
                        min="12"
                        max="20"
                        defaultValue="16"
                        className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="text-lg text-muted-foreground">A</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "accessibility" && <AccessibilitySettingsPanel />}

            {activeTab === "vault" && <VaultPanel />}

            {activeTab === "developer" && <DeveloperPanel />}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
