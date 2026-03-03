/**
 * Integration Hub Page (p2-13)
 *
 * Provides a unified UI for connecting Google Workspace, Microsoft 365,
 * Slack, Notion, Trello, Asana, and other integrations.
 *
 * Backed by the integrationsRouter which supports:
 * - getAll / list: fetch current integration statuses
 * - connect / disconnect: toggle integrations
 * - testConnection: verify a connection is live
 * - sendSlackMessage, exportToNotion, syncToTrello
 */

import React, { useState } from "react";
import { trpc } from "../lib/trpc";
import { PageShell } from "../components/layout/PageShell";
import { DashboardSkeleton } from "../components/shared/LoadingSkeleton";
import {
  CheckCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  Link2,
  Link2Off,
  Zap,
  Globe,
  MessageSquare,
  Calendar,
  FileText,
  Trello,
  LayoutGrid,
} from "lucide-react";

// ─── Integration Definitions ─────────────────────────────────────────────────

interface IntegrationDef {
  id: string;
  name: string;
  description: string;
  category: "productivity" | "calendar" | "communication" | "email" | "crm";
  icon: React.ReactNode;
  docsUrl?: string;
  envKey?: string;
}

const INTEGRATION_DEFS: IntegrationDef[] = [
  // Productivity
  {
    id: "notion",
    name: "Notion",
    description: "Sync pages, databases, and knowledge base content.",
    category: "productivity",
    icon: <FileText className="h-6 w-6" />,
    envKey: "NOTION_API_KEY",
  },
  {
    id: "trello",
    name: "Trello",
    description: "Sync boards, cards, and project tasks.",
    category: "productivity",
    icon: <Trello className="h-6 w-6" />,
    envKey: "TRELLO_API_KEY",
  },
  {
    id: "asana",
    name: "Asana",
    description: "Sync projects, tasks, and team workloads.",
    category: "productivity",
    icon: <LayoutGrid className="h-6 w-6" />,
    envKey: "ASANA_API_KEY",
  },
  // Calendar
  {
    id: "google",
    name: "Google Calendar",
    description: "Sync Google Calendar events and meeting intelligence.",
    category: "calendar",
    icon: <Calendar className="h-6 w-6" />,
    envKey: "GOOGLE_CLIENT_ID",
  },
  {
    id: "outlook",
    name: "Microsoft Outlook",
    description: "Sync Outlook calendar, email, and Teams meetings.",
    category: "calendar",
    icon: <Globe className="h-6 w-6" />,
    envKey: "MICROSOFT_CLIENT_ID",
  },
  {
    id: "calendly",
    name: "Calendly",
    description: "Sync Calendly scheduling links and upcoming bookings.",
    category: "calendar",
    icon: <Calendar className="h-6 w-6" />,
    envKey: "CALENDLY_API_KEY",
  },
  // Communication
  {
    id: "slack",
    name: "Slack",
    description: "Send messages, alerts, and briefings to Slack channels.",
    category: "communication",
    icon: <MessageSquare className="h-6 w-6" />,
    envKey: "SLACK_BOT_TOKEN",
  },
  // Email
  {
    id: "gmail",
    name: "Gmail / SMTP",
    description: "Send emails and briefings via Gmail or SMTP.",
    category: "email",
    icon: <MessageSquare className="h-6 w-6" />,
    envKey: "SMTP_USER",
  },
];

const CATEGORY_LABELS: Record<string, string> = {
  productivity: "Productivity",
  calendar: "Calendar & Scheduling",
  communication: "Communication",
  email: "Email",
  crm: "CRM",
};

const CATEGORY_ORDER = ["productivity", "calendar", "communication", "email", "crm"];

// ─── Component ────────────────────────────────────────────────────────────────

export default function IntegrationHubPage() {
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<
    Record<string, { success: boolean; message: string }>
  >({});
  const [toasts, setToasts] = useState<
    { id: string; type: "success" | "error"; text: string }[]
  >([]);

  // ─── Queries ──────────────────────────────────────────────────────────────

  const {
    data: integrationsData,
    isLoading,
    refetch,
  } = trpc.integrations.list.useQuery();

  // ─── Mutations ────────────────────────────────────────────────────────────

  const connectMutation = trpc.integrations.connect.useMutation({
    onSuccess: (_, vars) => {
      addToast("success", `Connected to ${vars.provider}`);
      void refetch();
    },
    onError: err => addToast("error", err.message),
  });

  const disconnectMutation = trpc.integrations.disconnect.useMutation({
    onSuccess: (_, vars) => {
      addToast("success", `Disconnected from ${vars.provider}`);
      void refetch();
    },
    onError: err => addToast("error", err.message),
  });

  const testConnectionMutation = trpc.integrations.testConnection.useMutation({
    onSuccess: (result, vars) => {
      setTestResults(prev => ({
        ...prev,
        [vars.provider]: {
          success: result.success,
          message: result.message ?? (result.success ? "Connection verified" : "Connection failed"),
        },
      }));
      setTestingId(null);
    },
    onError: (err, vars) => {
      setTestResults(prev => ({
        ...prev,
        [vars.provider]: { success: false, message: err.message },
      }));
      setTestingId(null);
    },
  });

  const initMutation = trpc.integrations.initializeAll.useMutation({
    onSuccess: result => {
      addToast(
        "success",
        `Auto-connected ${result.initialized?.length ?? 0} integration(s)`
      );
      void refetch();
    },
    onError: err => addToast("error", err.message),
  });

  // ─── Helpers ──────────────────────────────────────────────────────────────

  function addToast(type: "success" | "error", text: string) {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { id, type, text }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
  }

  function getStatus(integrationId: string) {
    if (!integrationsData) return "disconnected";
    const item = integrationsData.find(
      (i: { provider: string; status: string }) =>
        i.provider === integrationId
    );
    return item?.status ?? "disconnected";
  }

  function isConnected(integrationId: string) {
    // list query returns only active rows; getStatus returns 'active' or 'disconnected'
    return getStatus(integrationId) === "active";
  }

  function handleTest(id: string) {
    setTestingId(id);
    testConnectionMutation.mutate({ provider: id });
  }

  function handleToggle(id: string) {
    if (isConnected(id)) {
      disconnectMutation.mutate({ provider: id });
    } else {
      connectMutation.mutate({ provider: id });
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <PageShell title="Integration Hub">
        <DashboardSkeleton />
      </PageShell>
    );
  }

  const connectedCount = INTEGRATION_DEFS.filter(d => isConnected(d.id)).length;
  const groupedDefs = CATEGORY_ORDER.reduce<Record<string, IntegrationDef[]>>(
    (acc, cat) => {
      const items = INTEGRATION_DEFS.filter(d => d.category === cat);
      if (items.length > 0) acc[cat] = items;
      return acc;
    },
    {}
  );

  return (
    <PageShell title="Integration Hub">
      {/* Toast notifications */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm shadow-lg ${
              t.type === "success"
                ? "bg-green-900/90 text-green-200"
                : "bg-red-900/90 text-red-200"
            }`}
          >
            {t.type === "success" ? (
              <CheckCircle className="h-4 w-4 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0" />
            )}
            {t.text}
          </div>
        ))}
      </div>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Integration Hub</h1>
            <p className="mt-1 text-sm text-gray-400">
              Connect your tools to give CEPHO full context of your work.{" "}
              <span className="text-purple-400 font-medium">
                {connectedCount} of {INTEGRATION_DEFS.length} connected
              </span>
            </p>
          </div>
          <button
            onClick={() => initMutation.mutate()}
            disabled={initMutation.isPending}
            className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700 disabled:opacity-50"
          >
            {initMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Zap className="h-4 w-4" />
            )}
            Auto-Connect All
          </button>
        </div>

        {/* Status bar */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-3">
            <div className="h-2 flex-1 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
                style={{
                  width: `${(connectedCount / INTEGRATION_DEFS.length) * 100}%`,
                }}
              />
            </div>
            <span className="text-sm text-gray-400 whitespace-nowrap">
              {connectedCount}/{INTEGRATION_DEFS.length} active
            </span>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Connections are established using API keys configured in your
            environment. Contact your administrator to add missing credentials.
          </p>
        </div>

        {/* Integration groups */}
        {Object.entries(groupedDefs).map(([category, defs]) => (
          <div key={category}>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
              {CATEGORY_LABELS[category] ?? category}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {defs.map(def => {
                const connected = isConnected(def.id);
                const status = getStatus(def.id);
                const isTesting = testingId === def.id;
                const testResult = testResults[def.id];
                const isToggling =
                  connectMutation.isPending || disconnectMutation.isPending;

                return (
                  <div
                    key={def.id}
                    className={`rounded-xl border p-4 transition-colors ${
                      connected
                        ? "border-green-500/30 bg-green-500/5"
                        : "border-white/10 bg-white/5"
                    }`}
                  >
                    {/* Header row */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                            connected
                              ? "bg-green-500/20 text-green-400"
                              : "bg-white/10 text-gray-400"
                          }`}
                        >
                          {def.icon}
                        </div>
                        <div>
                          <p className="font-medium text-white">{def.name}</p>
                          <p className="text-xs text-gray-500">
                            {def.envKey && (
                              <span className="font-mono">{def.envKey}</span>
                            )}
                          </p>
                        </div>
                      </div>
                      {/* Status badge */}
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                          connected
                            ? "bg-green-500/20 text-green-400"
                            : status === "error"
                              ? "bg-red-500/20 text-red-400"
                              : "bg-gray-500/20 text-gray-400"
                        }`}
                      >
                        {connected ? "Connected" : status === "error" ? "Error" : "Disconnected"}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="mt-3 text-xs text-gray-400">{def.description}</p>

                    {/* Test result */}
                    {testResult && (
                      <div
                        className={`mt-2 flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs ${
                          testResult.success
                            ? "bg-green-500/10 text-green-400"
                            : "bg-red-500/10 text-red-400"
                        }`}
                      >
                        {testResult.success ? (
                          <CheckCircle className="h-3 w-3 shrink-0" />
                        ) : (
                          <AlertCircle className="h-3 w-3 shrink-0" />
                        )}
                        {testResult.message}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => handleToggle(def.id)}
                        disabled={isToggling}
                        className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${
                          connected
                            ? "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                            : "bg-purple-600/80 text-white hover:bg-purple-600"
                        }`}
                      >
                        {isToggling ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : connected ? (
                          <Link2Off className="h-3 w-3" />
                        ) : (
                          <Link2 className="h-3 w-3" />
                        )}
                        {connected ? "Disconnect" : "Connect"}
                      </button>
                      {connected && (
                        <button
                          onClick={() => handleTest(def.id)}
                          disabled={isTesting}
                          className="flex items-center justify-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-gray-300 transition-colors hover:bg-white/20 disabled:opacity-50"
                          title="Test connection"
                        >
                          {isTesting ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <RefreshCw className="h-3 w-3" />
                          )}
                          Test
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Footer note */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-xs text-gray-500">
          <p>
            <strong className="text-gray-400">Note:</strong> Integrations are
            activated using API keys and OAuth tokens stored as environment
            variables on the server. The &quot;Auto-Connect All&quot; button
            will automatically establish connections for all integrations where
            credentials are already configured. For OAuth-based integrations
            (Google, Microsoft), a redirect flow will be initiated.
          </p>
        </div>
      </div>
    </PageShell>
  );
}
