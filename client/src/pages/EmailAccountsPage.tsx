import React, { useState } from "react";
import { PageShell } from "@/components/layout/PageShell";
import {
  Mail,
  Plus,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Inbox,
  Send,
  Settings2,
  Trash2,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

type EmailProvider = "gmail" | "outlook" | "imap" | "smtp";

const PROVIDERS: { id: EmailProvider; label: string; icon: string }[] = [
  { id: "gmail", label: "Gmail", icon: "G" },
  { id: "outlook", label: "Outlook / Microsoft 365", icon: "O" },
  { id: "imap", label: "IMAP / Custom", icon: "✉" },
];

export default function EmailAccountsPage() {
  const [showAdd, setShowAdd] = useState(false);
  const [selectedProvider, setSelectedProvider] =
    useState<EmailProvider>("gmail");

  const { data: accounts, refetch } =
    trpc.emailAccounts.getConnectedAccounts.useQuery();

  const connectMutation = trpc.emailAccounts.connectAccount.useMutation({
    onSuccess: () => {
      toast.success("Email account connected");
      setShowAdd(false);
      refetch();
    },
    onError: (err: { message?: string }) =>
      toast.error(err.message ?? "Failed to connect account"),
  });

  const disconnectMutation = trpc.emailAccounts.disconnectAccount.useMutation({
    onSuccess: () => {
      toast.success("Account disconnected");
      refetch();
    },
  });

  const syncMutation = trpc.emailAccounts.syncAccount.useMutation({
    onSuccess: () => {
      toast.success("Sync started");
      refetch();
    },
    onError: () => toast.error("Sync failed"),
  });

  return (
    <PageShell
      title="Email Accounts"
      subtitle="Connect and manage email accounts for AI-powered email intelligence."
      icon={Mail}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted-foreground">
          {accounts?.length ?? 0} account
          {accounts?.length !== 1 ? "s" : ""} connected
        </p>
        <button
          onClick={() => setShowAdd(v => !v)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/90 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Account
        </button>
      </div>

      {/* Add Account Panel */}
      {showAdd && (
        <div className="mb-8 p-6 rounded-xl border border-accent/30 bg-card space-y-4">
          <h3 className="font-semibold text-sm">Connect Email Account</h3>

          {/* Provider Selection */}
          <div className="grid grid-cols-3 gap-3">
            {PROVIDERS.map(p => (
              <button
                key={p.id}
                onClick={() => setSelectedProvider(p.id)}
                className={`p-3 rounded-xl border text-sm font-medium transition-all flex flex-col items-center gap-2 ${
                  selectedProvider === p.id
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border bg-card text-muted-foreground hover:border-accent/30"
                }`}
              >
                <span className="text-lg font-bold">{p.icon}</span>
                {p.label}
              </button>
            ))}
          </div>

          {/* OAuth Connect */}
          {(selectedProvider === "gmail" || selectedProvider === "outlook") && (
            <div className="p-4 rounded-lg bg-muted/20 border border-border text-sm text-muted-foreground">
              <p className="mb-3">
                Click below to connect via OAuth. You will be redirected to{" "}
                {selectedProvider === "gmail" ? "Google" : "Microsoft"} to
                authorise access.
              </p>
              <button
                onClick={() =>
                  connectMutation.mutate({
                    provider: selectedProvider,
                    authCode: "oauth_redirect",
                  })
                }
                disabled={connectMutation.isPending}
                className="px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/90 disabled:opacity-40 transition-all"
              >
                {connectMutation.isPending
                  ? "Connecting..."
                  : `Connect ${selectedProvider === "gmail" ? "Gmail" : "Outlook"}`}
              </button>
            </div>
          )}

          {/* IMAP Setup */}
          {selectedProvider === "imap" && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent/50"
                    aria-label="Email address"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">
                    Password / App Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent/50"
                    aria-label="Email password"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">
                    IMAP Host
                  </label>
                  <input
                    type="text"
                    placeholder="imap.example.com"
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent/50"
                    aria-label="IMAP host"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">
                    IMAP Port
                  </label>
                  <input
                    type="number"
                    defaultValue={993}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent/50"
                    aria-label="IMAP port"
                  />
                </div>
              </div>
              <button
                onClick={() =>
                  connectMutation.mutate({
                    provider: "imap",
                    authCode: "manual",
                  })
                }
                disabled={connectMutation.isPending}
                className="px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/90 disabled:opacity-40 transition-all"
              >
                {connectMutation.isPending ? "Connecting..." : "Connect IMAP"}
              </button>
            </div>
          )}

          <button
            onClick={() => setShowAdd(false)}
            className="px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:border-accent/30 transition-all"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Connected Accounts */}
      {!accounts || accounts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Mail className="w-12 h-12 text-muted-foreground mb-4 opacity-40" />
          <p className="text-muted-foreground text-sm">
            No email accounts connected yet
          </p>
          <button
            onClick={() => setShowAdd(true)}
            className="mt-4 px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/90 transition-all"
          >
            Connect your first account
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {accounts.map(
            (account: {
              id: number;
              email: string;
              provider: string;
              status: string;
              lastSynced?: string | null;
              inboxCount?: number;
              sentCount?: number;
            }) => (
              <div
                key={account.id}
                className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-accent/30 transition-all"
              >
                {/* Provider Icon */}
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0 font-bold text-accent">
                  {account.provider === "gmail"
                    ? "G"
                    : account.provider === "outlook"
                      ? "O"
                      : "✉"}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm">
                      {account.email}
                    </span>
                    {account.status === "active" ? (
                      <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" />
                        Connected
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                        <XCircle className="w-3 h-3" />
                        Error
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    {account.inboxCount !== undefined && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Inbox className="w-3 h-3" />
                        {account.inboxCount} inbox
                      </span>
                    )}
                    {account.sentCount !== undefined && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Send className="w-3 h-3" />
                        {account.sentCount} sent
                      </span>
                    )}
                    {account.lastSynced && (
                      <span className="text-xs text-muted-foreground">
                        Last sync:{" "}
                        {new Date(account.lastSynced).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() =>
                      syncMutation.mutate({ accountId: account.id })
                    }
                    disabled={syncMutation.isPending}
                    className="p-1.5 rounded-lg hover:bg-accent/10 text-muted-foreground hover:text-accent transition-all"
                    title="Sync now"
                    aria-label="Sync email account"
                  >
                    <RefreshCw
                      className={`w-3.5 h-3.5 ${syncMutation.isPending ? "animate-spin" : ""}`}
                    />
                  </button>
                  <button
                    className="p-1.5 rounded-lg hover:bg-accent/10 text-muted-foreground hover:text-accent transition-all"
                    title="Settings"
                    aria-label="Account settings"
                  >
                    <Settings2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() =>
                      disconnectMutation.mutate({ accountId: account.id })
                    }
                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-all"
                    title="Disconnect"
                    aria-label="Disconnect email account"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </PageShell>
  );
}
