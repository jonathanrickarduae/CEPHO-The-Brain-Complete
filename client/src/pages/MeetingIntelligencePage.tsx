/**
 * Meeting Intelligence Page — Phase 3 (p3-9, p3-10, p3-11)
 *
 * Provides:
 *  - p3-9:  Pre-meeting brief generation
 *  - p3-10: Post-meeting extraction (summary, decisions, action items)
 *  - p3-11: Zoom/Teams transcript ingestion → structured notes
 */
import { useState } from "react";
import { trpc } from "../lib/trpc";
import { PageShell } from "../components/layout/PageShell";
import {
  Video,
  Calendar,
  FileText,
  Users,
  CheckSquare,
  Sparkles,
  Plus,
  ChevronDown,
  ChevronUp,
  Loader2,
  Trash2,
  RefreshCw,
  Clock,
  ArrowRight,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type ActionItem = { task: string; owner: string; dueDate?: string };

type MeetingNote = {
  id: number;
  title: string;
  source: string | null;
  attendees: string[] | null;
  preMeetingBrief: string | null;
  aiSummary: string | null;
  keyDecisions: string[] | null;
  actionItems: ActionItem[] | null;
  nextSteps: string[] | null;
  meetingAt: Date | null;
  durationMinutes: number | null;
};

// ─── Source Badge ─────────────────────────────────────────────────────────────

function SourceBadge({ source }: { source: string | null }) {
  const map: Record<string, { label: string; cls: string }> = {
    zoom: { label: "Zoom", cls: "bg-blue-100 text-blue-700" },
    teams: { label: "Teams", cls: "bg-purple-100 text-purple-700" },
    google_meet: { label: "Google Meet", cls: "bg-green-100 text-green-700" },
    manual: { label: "Manual", cls: "bg-gray-100 text-gray-600" },
  };
  const cfg = map[source ?? "manual"] ?? map.manual;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

// ─── Meeting Card ─────────────────────────────────────────────────────────────

function MeetingCard({ note, onRefresh }: { note: MeetingNote; onRefresh: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<"brief" | "summary" | "actions">("brief");

  const deleteMutation = trpc.meetingIntelligence.delete.useMutation({ onSuccess: onRefresh });
  const regenerate = trpc.meetingIntelligence.regenerateSummary.useMutation({ onSuccess: onRefresh });

  const hasPostMeeting = !!(note.aiSummary || (note.keyDecisions && note.keyDecisions.length > 0));

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div
        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-semibold text-gray-900">{note.title}</span>
              <SourceBadge source={note.source} />
              {hasPostMeeting && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                  Notes Ready
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              {note.meetingAt && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(note.meetingAt).toLocaleDateString()}
                </span>
              )}
              {note.durationMinutes && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />{note.durationMinutes}m
                </span>
              )}
              {note.attendees && note.attendees.length > 0 && (
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />{note.attendees.length} attendees
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={(e: React.MouseEvent) => { e.stopPropagation(); deleteMutation.mutate({ noteId: note.id }); }}
              className="text-gray-400 hover:text-red-500 p-1"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
          </div>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-100">
          <div className="flex border-b border-gray-100">
            {([
              { key: "brief" as const, label: "Pre-Meeting Brief", show: !!note.preMeetingBrief },
              { key: "summary" as const, label: "Summary", show: hasPostMeeting },
              { key: "actions" as const, label: "Action Items", show: !!(note.actionItems && note.actionItems.length > 0) },
            ] as const)
              .filter(t => t.show)
              .map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.key ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
          </div>

          <div className="p-4">
            {activeTab === "brief" && note.preMeetingBrief && (
              <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">{note.preMeetingBrief}</div>
            )}

            {activeTab === "summary" && (
              <div className="space-y-4">
                {note.aiSummary && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Executive Summary</h4>
                    <p className="text-sm text-gray-600">{note.aiSummary}</p>
                  </div>
                )}
                {note.keyDecisions && note.keyDecisions.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Key Decisions</h4>
                    <ul className="space-y-1">
                      {note.keyDecisions.map((d: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                          <CheckSquare className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />{d}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {note.nextSteps && note.nextSteps.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Next Steps</h4>
                    <ul className="space-y-1">
                      {note.nextSteps.map((s: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                          <ArrowRight className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />{s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <button
                  onClick={() => regenerate.mutate({ noteId: note.id })}
                  disabled={regenerate.isPending}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 disabled:opacity-50"
                >
                  {regenerate.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                  Regenerate Summary
                </button>
              </div>
            )}

            {activeTab === "actions" && note.actionItems && note.actionItems.length > 0 && (
              <div className="space-y-2">
                {note.actionItems.map((item: ActionItem, i: number) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <CheckSquare className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800">{item.task}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">Owner: {item.owner}</span>
                        {item.dueDate && (
                          <><span className="text-xs text-gray-400">·</span><span className="text-xs text-gray-500">Due: {item.dueDate}</span></>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── New Meeting Modal ────────────────────────────────────────────────────────

function NewMeetingModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [mode, setMode] = useState<"brief" | "transcript">("brief");
  const [form, setForm] = useState({
    title: "",
    attendees: "",
    agenda: "",
    context: "",
    transcript: "",
    source: "manual" as "zoom" | "teams" | "google_meet" | "manual",
    meetingAt: "",
    durationMinutes: "",
  });

  const generateBrief = trpc.meetingIntelligence.generatePreBrief.useMutation({
    onSuccess: () => { onSuccess(); onClose(); },
  });

  const processTranscript = trpc.meetingIntelligence.processTranscript.useMutation({
    onSuccess: () => { onSuccess(); onClose(); },
  });

  const isLoading = generateBrief.isPending || processTranscript.isPending;

  const handleSubmit = () => {
    const attendeeList = form.attendees.split(",").map((a: string) => a.trim()).filter(Boolean);
    if (mode === "brief") {
      generateBrief.mutate({
        title: form.title,
        attendees: attendeeList,
        agenda: form.agenda,
        context: form.context,
        meetingAt: form.meetingAt || undefined,
        durationMinutes: form.durationMinutes ? parseInt(form.durationMinutes) : undefined,
      });
    } else {
      processTranscript.mutate({
        title: form.title,
        transcript: form.transcript,
        attendees: attendeeList,
        source: form.source,
        meetingAt: form.meetingAt || undefined,
        durationMinutes: form.durationMinutes ? parseInt(form.durationMinutes) : undefined,
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">New Meeting</h2>
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setMode("brief")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${mode === "brief" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"}`}
            >
              Pre-Meeting Brief
            </button>
            <button
              onClick={() => setMode("transcript")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${mode === "transcript" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"}`}
            >
              Process Transcript
            </button>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, title: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Q4 Strategy Review"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="datetime-local"
                value={form.meetingAt}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, meetingAt: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration (mins)</label>
              <input
                type="number"
                value={form.durationMinutes}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, durationMinutes: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="60"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Attendees (comma-separated)</label>
            <input
              type="text"
              value={form.attendees}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, attendees: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="John Smith, Sarah Jones, CEO"
            />
          </div>
          {mode === "brief" ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Agenda</label>
                <textarea
                  value={form.agenda}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm(f => ({ ...f, agenda: e.target.value }))}
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="1. Q4 results review&#10;2. 2025 strategy"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Context / Background</label>
                <textarea
                  value={form.context}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm(f => ({ ...f, context: e.target.value }))}
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Any relevant background or context..."
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                <select
                  value={form.source}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setForm(f => ({ ...f, source: e.target.value as typeof form.source }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="zoom">Zoom</option>
                  <option value="teams">Microsoft Teams</option>
                  <option value="google_meet">Google Meet</option>
                  <option value="manual">Manual / Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Transcript *</label>
                <textarea
                  value={form.transcript}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm(f => ({ ...f, transcript: e.target.value }))}
                  rows={8}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Paste the meeting transcript here..."
                />
              </div>
            </>
          )}
        </div>
        <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || !form.title.trim() || (mode === "transcript" && !form.transcript.trim())}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {mode === "brief" ? "Generate Brief" : "Process Transcript"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MeetingIntelligencePage() {
  const [showModal, setShowModal] = useState(false);

  const { data: rawNotes, refetch, isLoading } = trpc.meetingIntelligence.list.useQuery({ limit: 30 });

  const notes: MeetingNote[] = (rawNotes ?? []).map((n: {
    id: number;
    title: string;
    source: string | null;
    attendees: unknown;
    preMeetingBrief: string | null;
    aiSummary: string | null;
    keyDecisions: unknown;
    actionItems: unknown;
    nextSteps: unknown;
    meetingAt: Date | null;
    durationMinutes: number | null;
  }) => ({
    ...n,
    attendees: Array.isArray(n.attendees) ? (n.attendees as string[]) : null,
    keyDecisions: Array.isArray(n.keyDecisions) ? (n.keyDecisions as string[]) : null,
    actionItems: Array.isArray(n.actionItems) ? (n.actionItems as ActionItem[]) : null,
    nextSteps: Array.isArray(n.nextSteps) ? (n.nextSteps as string[]) : null,
  }));

  const stats = {
    total: notes.length,
    withBrief: notes.filter((n: MeetingNote) => n.preMeetingBrief).length,
    withSummary: notes.filter((n: MeetingNote) => n.aiSummary).length,
    actionItems: notes.reduce((sum: number, n: MeetingNote) => sum + (n.actionItems?.length ?? 0), 0),
  };

  return (
    <PageShell title="Meeting Intelligence" subtitle="Pre-meeting briefs, post-meeting extraction, and transcript analysis">
      {showModal && <NewMeetingModal onClose={() => setShowModal(false)} onSuccess={() => refetch()} />}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Meetings", value: stats.total, icon: <Video className="w-5 h-5 text-gray-500" />, color: "bg-gray-50" },
          { label: "With Pre-Brief", value: stats.withBrief, icon: <FileText className="w-5 h-5 text-blue-500" />, color: "bg-blue-50" },
          { label: "With Summary", value: stats.withSummary, icon: <Sparkles className="w-5 h-5 text-green-500" />, color: "bg-green-50" },
          { label: "Action Items", value: stats.actionItems, icon: <CheckSquare className="w-5 h-5 text-purple-500" />, color: "bg-purple-50" },
        ].map(stat => (
          <div key={stat.label} className={`${stat.color} rounded-xl p-4 border border-white/50`}>
            <div className="flex items-center gap-2 mb-1">{stat.icon}<span className="text-sm text-gray-600">{stat.label}</span></div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Header Actions */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-gray-800">Meeting Notes</h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />New Meeting
        </button>
      </div>

      {/* Notes List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <Video className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-700 mb-1">No meetings yet</h3>
          <p className="text-sm text-gray-500 mb-4">Generate a pre-meeting brief or paste a transcript to extract structured notes.</p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />Add Your First Meeting
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map((note: MeetingNote) => (
            <MeetingCard key={note.id} note={note} onRefresh={() => refetch()} />
          ))}
        </div>
      )}
    </PageShell>
  );
}
