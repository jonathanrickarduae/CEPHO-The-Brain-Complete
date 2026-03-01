import { PageShell } from "@/components/layout/PageShell";
import { useState, useEffect } from "react";
import { useSearch } from "wouter";
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
  Mail,
  MessageSquare,
  Zap,
  FileText,
  Clock,
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
  | "vault";

// ─── Vault Panel (merged from /vault) ──────────────────────────────────────
function VaultPanel() {
  const integrations = [
    { id: 1, name: "Outlook 365", status: "healthy", health: 100, lastSync: "2 mins ago", icon: Mail, color: "text-primary", category: "Communication" },
    { id: 2, name: "Microsoft Teams", status: "healthy", health: 100, lastSync: "5 mins ago", icon: MessageSquare, color: "text-purple-400", category: "Communication" },
    { id: 3, name: "Gamma App", status: "warning", health: 85, lastSync: "1 hour ago", icon: Zap, color: "text-amber-400", category: "Productivity", alert: "Consider switching to Pitch.com" },
    { id: 4, name: "Manus AI", status: "healthy", health: 100, lastSync: "Just now", icon: Globe, color: "text-green-400", category: "AI Tools" },
    { id: 5, name: "Microsoft Copilot", status: "healthy", health: 100, lastSync: "Just now", icon: Globe, color: "text-cyan-400", category: "AI Tools" },
    { id: 6, name: "Salesforce", status: "broken", health: 0, lastSync: "Failed", icon: Globe, color: "text-red-400", category: "CRM", alert: "API Token Expired" },
  ];
  const contractRenewals = [
    { id: 1, name: "AWS Enterprise Agreement", vendor: "Amazon Web Services", renewalDate: "2026-02-15", value: "$45,000/yr", status: "upcoming", daysUntil: 29, autoRenew: true },
    { id: 2, name: "Salesforce CRM License", vendor: "Salesforce", renewalDate: "2026-01-25", value: "$12,000/yr", status: "urgent", daysUntil: 8, autoRenew: false },
    { id: 3, name: "Microsoft 365 Business", vendor: "Microsoft", renewalDate: "2026-03-01", value: "$8,400/yr", status: "upcoming", daysUntil: 43, autoRenew: true },
    { id: 4, name: "Slack Business+", vendor: "Slack", renewalDate: "2026-04-15", value: "$6,000/yr", status: "ok", daysUntil: 88, autoRenew: true },
    { id: 5, name: "Legal Retainer", vendor: "Henderson & Partners", renewalDate: "2026-01-31", value: "$25,000/yr", status: "urgent", daysUntil: 14, autoRenew: false },
  ];
  const securityEvents = [
    { id: 1, type: "blocked", message: "Suspicious login blocked", location: "Unknown IP", time: "2 hours ago", severity: "high" },
    { id: 2, type: "blocked", message: "Brute force prevented", location: "Bot Network", time: "5 hours ago", severity: "high" },
    { id: 3, type: "warning", message: "Unusual API pattern", location: "Internal", time: "Yesterday", severity: "medium" },
  ];
  const healthyCount = integrations.filter(i => i.status === "healthy").length;
  const warningCount = integrations.filter(i => i.status === "warning").length;
  const brokenCount = integrations.filter(i => i.status === "broken").length;
  const blockedThreats = securityEvents.filter(e => e.type === "blocked").length;
  const urgentContracts = contractRenewals.filter(c => c.status === "urgent").length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl border border-green-500/30 bg-green-500/10 flex items-center gap-3">
          <CheckCircle2 className="w-7 h-7 text-green-500 flex-shrink-0" />
          <div><div className="text-2xl font-bold text-green-500">{healthyCount}</div><div className="text-xs text-muted-foreground">Healthy</div></div>
        </div>
        <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 flex items-center gap-3">
          <AlertTriangle className="w-7 h-7 text-amber-500 flex-shrink-0" />
          <div><div className="text-2xl font-bold text-amber-500">{warningCount}</div><div className="text-xs text-muted-foreground">Warning</div></div>
        </div>
        <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 flex items-center gap-3">
          <XCircle className="w-7 h-7 text-red-500 flex-shrink-0" />
          <div><div className="text-2xl font-bold text-red-500">{brokenCount}</div><div className="text-xs text-muted-foreground">Broken</div></div>
        </div>
        <div className="p-4 rounded-xl border border-purple-500/30 bg-purple-500/10 flex items-center gap-3">
          <ShieldAlert className="w-7 h-7 text-purple-500 flex-shrink-0" />
          <div><div className="text-2xl font-bold text-purple-500">{blockedThreats}</div><div className="text-xs text-muted-foreground">Blocked</div></div>
        </div>
      </div>

      {/* Integrations */}
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2"><Activity className="w-4 h-4 text-cyan-400" /> Integrations</h3>
          <Button size="sm" variant="outline" className="h-7 gap-1 text-xs"><Plus className="w-3 h-3" /> Add</Button>
        </div>
        <div className="space-y-2">
          {integrations.map(integration => (
            <div key={integration.id} className={`p-3 rounded-lg border flex items-center justify-between ${
              integration.status === "healthy" ? "border-border bg-muted/20" :
              integration.status === "warning" ? "border-amber-500/30 bg-amber-500/5" :
              "border-red-500/30 bg-red-500/5"
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg bg-muted flex items-center justify-center ${integration.color}`}>
                  <integration.icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-medium text-sm text-foreground">{integration.name}</div>
                  <div className="text-xs text-muted-foreground">{integration.lastSync}</div>
                  {"alert" in integration && integration.alert && <div className="text-xs text-amber-400 mt-0.5">{integration.alert as string}</div>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className={`text-xs font-medium ${
                  integration.status === "healthy" ? "text-green-400" :
                  integration.status === "warning" ? "text-amber-400" : "text-red-400"
                }`}>{integration.health}%</div>
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0"><RefreshCw className="w-3 h-3" /></Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contract Renewals */}
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2"><FileText className="w-4 h-4 text-primary" /> Contract Renewals {urgentContracts > 0 && <Badge className="bg-red-500/20 text-red-400 border-0 text-xs">{urgentContracts} urgent</Badge>}</h3>
        </div>
        <div className="space-y-2">
          {contractRenewals.map(contract => (
            <div key={contract.id} className={`p-3 rounded-lg border flex items-center justify-between ${
              contract.status === "urgent" ? "border-red-500/30 bg-red-500/5" :
              contract.status === "upcoming" ? "border-amber-500/30 bg-amber-500/5" :
              "border-border bg-muted/20"
            }`}>
              <div>
                <div className="font-medium text-sm text-foreground">{contract.name}</div>
                <div className="text-xs text-muted-foreground">{contract.vendor} · {contract.value}</div>
              </div>
              <div className="text-right">
                <div className={`text-xs font-medium ${
                  contract.status === "urgent" ? "text-red-400" :
                  contract.status === "upcoming" ? "text-amber-400" : "text-green-400"
                }`}>{contract.daysUntil}d</div>
                <div className="text-xs text-muted-foreground">{contract.autoRenew ? "Auto-renews" : "Manual"}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security Events */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="font-semibold text-foreground flex items-center gap-2 mb-4"><Shield className="w-4 h-4 text-purple-400" /> Security Events</h3>
        <div className="space-y-2">
          {securityEvents.map(event => (
            <div key={event.id} className="p-3 rounded-lg border border-border bg-muted/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  event.severity === "high" ? "bg-red-500" : "bg-amber-500"
                }`} />
                <div>
                  <div className="text-sm font-medium text-foreground">{event.message}</div>
                  <div className="text-xs text-muted-foreground">{event.location}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                {event.time}
              </div>
            </div>
          ))}
        </div>
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
                      <button className="w-12 h-6 rounded-full transition-colors bg-muted">
                        <div className="w-5 h-5 rounded-full bg-white transition-transform translate-x-0.5" />
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

            {activeTab === "vault" && (
              <VaultPanel />
            )}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
