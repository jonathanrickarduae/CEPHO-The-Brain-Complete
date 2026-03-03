/**
 * Email Intelligence Page — Phase 3 (p3-6, p3-7, p3-8)
 *
 * Provides:
 *  - p3-6: Email triage and prioritisation
 *  - p3-7: AI email summarisation
 *  - p3-8: Smart draft generation and follow-up tracking
 */
import { useState } from "react";
import { trpc } from "../lib/trpc";
import { PageShell } from "../components/layout/PageShell";
import {
  Mail,
  Inbox,
  Send,
  AlertCircle,
  Clock,
  CheckCircle,
  RefreshCw,
  Sparkles,
  Tag,
  ChevronDown,
  ChevronUp,
  Reply,
  Archive,
  Loader2,
  Plus,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type EmailRow = {
  id: number;
  subject: string | null;
  fromAddress: string | null;
  fromName: string | null;
  aiPriority: string | null;
  aiAction: string | null;
  aiSummary: string | null;
  draftContent: string | null;
  isDraft: boolean | null;
  isRead: boolean | null;
  isArchived: boolean | null;
  followUpAt: Date | null;
  receivedAt: Date | null;
};

// ─── Priority Badge ───────────────────────────────────────────────────────────

function PriorityBadge({ priority }: { priority: string | null }) {
  const map: Record<string, { label: string; cls: string }> = {
    urgent: { label: "Urgent", cls: "bg-red-100 text-red-700 border-red-200" },
    high: {
      label: "High",
      cls: "bg-orange-100 text-orange-700 border-orange-200",
    },
    normal: {
      label: "Normal",
      cls: "bg-yellow-100 text-yellow-700 border-yellow-200",
    },
    low: { label: "Low", cls: "bg-green-100 text-green-700 border-green-200" },
  };
  const cfg = map[priority ?? "normal"] ?? map.normal;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.cls}`}
    >
      {cfg.label}
    </span>
  );
}

// ─── Action Badge ─────────────────────────────────────────────────────────────

function ActionBadge({ action }: { action: string | null }) {
  const map: Record<
    string,
    { label: string; cls: string; icon: React.ReactNode }
  > = {
    reply: {
      label: "Reply",
      cls: "bg-blue-100 text-blue-700",
      icon: <Reply className="w-3 h-3" />,
    },
    follow_up: {
      label: "Follow Up",
      cls: "bg-purple-100 text-purple-700",
      icon: <Clock className="w-3 h-3" />,
    },
    delegate: {
      label: "Delegate",
      cls: "bg-indigo-100 text-indigo-700",
      icon: <Send className="w-3 h-3" />,
    },
    archive: {
      label: "Archive",
      cls: "bg-gray-100 text-gray-600",
      icon: <Archive className="w-3 h-3" />,
    },
    none: {
      label: "No Action",
      cls: "bg-gray-100 text-gray-500",
      icon: <CheckCircle className="w-3 h-3" />,
    },
  };
  const cfg = map[action ?? "none"] ?? map.none;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.cls}`}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

// ─── Email Card ───────────────────────────────────────────────────────────────

function EmailCard({
  email,
  onRefresh,
}: {
  email: EmailRow;
  onRefresh: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [draftInstruction, setDraftInstruction] = useState("");
  const [showDraftInput, setShowDraftInput] = useState(false);

  const draftReply = trpc.emailIntelligence.draftReply.useMutation({
    onSuccess: () => {
      onRefresh();
      setShowDraftInput(false);
      setDraftInstruction("");
    },
  });

  const archive = trpc.emailIntelligence.archive.useMutation({
    onSuccess: onRefresh,
  });
  const markRead = trpc.emailIntelligence.markRead.useMutation({
    onSuccess: onRefresh,
  });

  return (
    <div
      className={`bg-white rounded-xl border ${!email.isRead ? "border-blue-200 shadow-sm" : "border-gray-100"} p-4 transition-all`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            {!email.isRead && (
              <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
            )}
            <span className="font-semibold text-gray-900 truncate">
              {email.subject ?? "(No subject)"}
            </span>
            <PriorityBadge priority={email.aiPriority} />
            <ActionBadge action={email.aiAction} />
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>
              {email.fromName ?? email.fromAddress ?? "Unknown sender"}
            </span>
            {email.receivedAt && (
              <>
                <span>·</span>
                <span>{new Date(email.receivedAt).toLocaleDateString()}</span>
              </>
            )}
          </div>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-gray-400 hover:text-gray-600 flex-shrink-0"
        >
          {expanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
      </div>

      {email.aiSummary && (
        <p className="mt-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-3 border border-gray-100">
          <span className="font-medium text-gray-700">AI Summary: </span>
          {email.aiSummary}
        </p>
      )}

      {expanded && (
        <div className="mt-3 space-y-3">
          {email.draftContent && (
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
              <p className="text-xs font-semibold text-blue-700 mb-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                AI Draft Reply
              </p>
              <p className="text-sm text-blue-900 whitespace-pre-wrap">
                {email.draftContent}
              </p>
            </div>
          )}

          {showDraftInput && (
            <div className="space-y-2">
              <input
                type="text"
                value={draftInstruction}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setDraftInstruction(e.target.value)
                }
                placeholder="Drafting instruction (e.g. 'Accept the meeting, suggest Thursday 2pm')"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    draftReply.mutate({
                      emailId: email.id,
                      instruction: draftInstruction,
                    })
                  }
                  disabled={draftReply.isPending || !draftInstruction.trim()}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {draftReply.isPending ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Sparkles className="w-3 h-3" />
                  )}
                  Generate
                </button>
                <button
                  onClick={() => setShowDraftInput(false)}
                  className="px-3 py-1.5 bg-gray-100 text-gray-600 text-sm rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            {!showDraftInput && (
              <button
                onClick={() => setShowDraftInput(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
              >
                <Sparkles className="w-3 h-3" />
                {email.draftContent ? "Re-draft" : "Draft Reply"}
              </button>
            )}
            {!email.isRead && (
              <button
                onClick={() => markRead.mutate({ emailId: email.id })}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200"
              >
                <CheckCircle className="w-3 h-3" />
                Mark Read
              </button>
            )}
            {!email.isArchived && (
              <button
                onClick={() => archive.mutate({ emailId: email.id })}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200"
              >
                <Archive className="w-3 h-3" />
                Archive
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Add Email Modal ──────────────────────────────────────────────────────────

function AddEmailModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState({
    subject: "",
    fromAddress: "",
    fromName: "",
    bodyText: "",
  });

  const ingest = trpc.emailIntelligence.ingestEmails.useMutation({
    onSuccess: () => {
      onSuccess();
      onClose();
    },
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">
            Add Email for Triage
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Paste an email to have Victoria analyse and prioritise it.
          </p>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject
            </label>
            <input
              type="text"
              value={form.subject}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setForm(f => ({ ...f, subject: e.target.value }))
              }
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Email subject"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From Name
              </label>
              <input
                type="text"
                value={form.fromName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setForm(f => ({ ...f, fromName: e.target.value }))
                }
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="John Smith"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From Email
              </label>
              <input
                type="email"
                value={form.fromAddress}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setForm(f => ({ ...f, fromAddress: e.target.value }))
                }
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="john@company.com"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Body
            </label>
            <textarea
              value={form.bodyText}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setForm(f => ({ ...f, bodyText: e.target.value }))
              }
              rows={6}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Paste the email content here..."
            />
          </div>
        </div>
        <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={() =>
              ingest.mutate({
                provider: "gmail",
                emails: [
                  {
                    externalId: `manual-${Date.now()}`,
                    fromAddress: form.fromAddress,
                    fromName: form.fromName,
                    subject: form.subject,
                    bodyText: form.bodyText,
                  },
                ],
              })
            }
            disabled={ingest.isPending || !form.bodyText.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {ingest.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            Triage with AI
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function EmailIntelligencePage() {
  const [priorityFilter, setPriorityFilter] = useState<
    "all" | "urgent" | "high" | "normal" | "low"
  >("all");
  const [showAddModal, setShowAddModal] = useState(false);

  const {
    data: emails,
    refetch,
    isLoading,
  } = trpc.emailIntelligence.list.useQuery({
    priority: priorityFilter,
    limit: 50,
  });

  const stats = {
    total: (emails as EmailRow[] | undefined)?.length ?? 0,
    unread:
      (emails as EmailRow[] | undefined)?.filter(e => !e.isRead).length ?? 0,
    urgent:
      (emails as EmailRow[] | undefined)?.filter(e => e.aiPriority === "urgent")
        .length ?? 0,
    followUp:
      (emails as EmailRow[] | undefined)?.filter(
        e => e.aiAction === "follow_up"
      ).length ?? 0,
  };

  return (
    <PageShell
      title="Email Intelligence"
      subtitle="AI-powered email triage, summarisation, and smart drafts"
    >
      {showAddModal && (
        <AddEmailModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => refetch()}
        />
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: "Total Emails",
            value: stats.total,
            icon: <Mail className="w-5 h-5 text-gray-500" />,
            color: "bg-gray-50",
          },
          {
            label: "Unread",
            value: stats.unread,
            icon: <Inbox className="w-5 h-5 text-blue-500" />,
            color: "bg-blue-50",
          },
          {
            label: "Urgent",
            value: stats.urgent,
            icon: <AlertCircle className="w-5 h-5 text-red-500" />,
            color: "bg-red-50",
          },
          {
            label: "Follow-Ups",
            value: stats.followUp,
            icon: <Clock className="w-5 h-5 text-purple-500" />,
            color: "bg-purple-50",
          },
        ].map(stat => (
          <div
            key={stat.label}
            className={`${stat.color} rounded-xl p-4 border border-white/50`}
          >
            <div className="flex items-center gap-2 mb-1">
              {stat.icon}
              <span className="text-sm text-gray-600">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Actions Bar */}
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          {(["all", "urgent", "high", "normal", "low"] as const).map(f => (
            <button
              key={f}
              onClick={() => setPriorityFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                priorityFilter === f
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add Email
          </button>
        </div>
      </div>

      {/* Email List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : !emails || emails.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <Mail className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-700 mb-1">
            No emails yet
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Add emails to have Victoria triage, summarise, and draft replies.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add Your First Email
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {(emails as EmailRow[]).map(email => (
            <EmailCard
              key={email.id}
              email={email}
              onRefresh={() => refetch()}
            />
          ))}
        </div>
      )}

      {/* Legend */}
      <div className="mt-6 bg-gray-50 rounded-xl p-4 border border-gray-100">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
          <Tag className="w-3 h-3" />
          AI Action Guide
        </p>
        <div className="flex flex-wrap gap-3">
          {[
            { action: "reply", desc: "Needs a response from you" },
            { action: "follow_up", desc: "Track for reply" },
            { action: "delegate", desc: "Can be handled by someone else" },
            { action: "archive", desc: "FYI only, no action needed" },
            { action: "none", desc: "No action required" },
          ].map(item => (
            <div key={item.action} className="flex items-center gap-2">
              <ActionBadge action={item.action} />
              <span className="text-xs text-gray-500">{item.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
