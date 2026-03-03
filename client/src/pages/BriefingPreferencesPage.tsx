/**
 * Briefing Preferences Page — Phase 3 (p3-12, p3-13)
 *
 * Provides:
 *  - p3-12: Victoria's Briefing Personalisation Engine
 *  - p3-13: Briefing Feedback Loop
 *
 * Also surfaces the Agent Insights panel (from 05:00 research run).
 */
import { useState } from "react";
import { trpc } from "../lib/trpc";
import { PageShell } from "../components/layout/PageShell";
import {
  Settings,
  Sparkles,
  Star,
  Clock,
  BarChart3,
  Brain,
  CheckCircle,
  Loader2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  MessageSquare,
} from "lucide-react";

// ─── Preference Toggle ────────────────────────────────────────────────────────

function ToggleOption<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="flex gap-2 flex-wrap">
        {options.map(opt => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              value === opt.value
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Section Toggle ───────────────────────────────────────────────────────────

const ALL_SECTIONS = [
  { key: "executive_summary", label: "Executive Summary" },
  { key: "agent_insights", label: "Agent Insights" },
  { key: "priority_tasks", label: "Priority Tasks" },
  { key: "email_follow_ups", label: "Email Follow-Ups" },
  { key: "strategic_focus", label: "Strategic Focus" },
  { key: "motivational_close", label: "Motivational Close" },
];

function SectionToggle({
  enabled,
  onChange,
}: {
  enabled: string[];
  onChange: (sections: string[]) => void;
}) {
  const toggle = (key: string) => {
    if (enabled.includes(key)) {
      onChange(enabled.filter(k => k !== key));
    } else {
      onChange([...enabled, key]);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Enabled Sections</label>
      <div className="grid grid-cols-2 gap-2">
        {ALL_SECTIONS.map(section => (
          <button
            key={section.key}
            onClick={() => toggle(section.key)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
              enabled.includes(section.key)
                ? "bg-blue-50 border-blue-200 text-blue-700"
                : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100"
            }`}
          >
            <CheckCircle className={`w-4 h-4 ${enabled.includes(section.key) ? "text-blue-500" : "text-gray-300"}`} />
            {section.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Briefing Card ────────────────────────────────────────────────────────────

function BriefingCard({
  briefing,
}: {
  briefing: {
    id: number;
    title: string;
    date: Date;
    status: string | null;
    content: Record<string, unknown>;
  };
}) {
  const [expanded, setExpanded] = useState(false);
  const [rating, setRating] = useState<number | null>(null);

  const submitFeedback = trpc.briefingPersonalisation.submitFeedback.useMutation();

  const content = briefing.content as Record<string, unknown>;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div
        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors flex items-center justify-between"
        onClick={() => setExpanded(!expanded)}
      >
        <div>
          <p className="font-semibold text-gray-900">{briefing.title}</p>
          <p className="text-sm text-gray-500 mt-0.5">
            {new Date(briefing.date).toLocaleDateString("en-GB", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
            briefing.status === "ready" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
          }`}>
            {briefing.status ?? "ready"}
          </span>
          {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 p-4 space-y-4">
          {content.executive_summary != null && (
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Executive Summary</h4>
              <p className="text-sm text-gray-700">{String(content.executive_summary)}</p>
            </div>
          )}

          {Array.isArray(content.agent_insights) && content.agent_insights.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Agent Insights</h4>
              <ul className="space-y-1">
                {(content.agent_insights as string[]).map((insight, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <Brain className="w-3 h-3 text-purple-500 flex-shrink-0 mt-0.5" />
                    {insight}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {Array.isArray(content.priority_tasks) && content.priority_tasks.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Priority Tasks</h4>
              <ul className="space-y-1">
                {(content.priority_tasks as string[]).map((task, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-3 h-3 text-blue-500 flex-shrink-0 mt-0.5" />
                    {task}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {content.strategic_focus != null && (
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
              <h4 className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">Strategic Focus</h4>
              <p className="text-sm text-blue-800">{String(content.strategic_focus)}</p>
            </div>
          )}

          {/* Feedback */}
          <div className="border-t border-gray-100 pt-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              Rate this briefing
            </p>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => {
                    setRating(star);
                    submitFeedback.mutate({
                      briefingId: briefing.id,
                      sectionId: "overall",
                      rating: star,
                    });
                  }}
                  className={`p-1 transition-colors ${
                    rating !== null && star <= rating ? "text-yellow-400" : "text-gray-300 hover:text-yellow-300"
                  }`}
                >
                  <Star className="w-5 h-5 fill-current" />
                </button>
              ))}
              {rating && (
                <span className="text-xs text-gray-500 ml-2">
                  {submitFeedback.isPending ? "Saving..." : "Feedback saved"}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Agent Insights Panel ─────────────────────────────────────────────────────

function AgentInsightsPanel() {
  const { data: insights, isLoading } = trpc.briefingPersonalisation.getAgentInsights.useQuery({ limit: 20 });

  const agentColors: Record<string, string> = {
    chief_of_staff: "bg-blue-100 text-blue-700",
    financial_analyst: "bg-green-100 text-green-700",
    marketing_strategist: "bg-pink-100 text-pink-700",
    technology_advisor: "bg-purple-100 text-purple-700",
    legal_counsel: "bg-red-100 text-red-700",
    hr_director: "bg-orange-100 text-orange-700",
    innovation_scout: "bg-yellow-100 text-yellow-700",
    competitor_intelligence: "bg-indigo-100 text-indigo-700",
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-5 h-5 text-purple-500" />
        <h3 className="font-semibold text-gray-900">Agent Insights</h3>
        <span className="text-xs text-gray-500 ml-auto">From 05:00 research run</span>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
        </div>
      ) : !insights || insights.length === 0 ? (
        <div className="text-center py-8">
          <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Agent insights will appear here after the 05:00 research run.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {insights.map((insight: { id: number; agentKey: string; insight: string; source: string | null; confidence: number | null }) => (
            <div key={insight.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${agentColors[insight.agentKey] ?? "bg-gray-100 text-gray-600"}`}>
                    {insight.agentKey.replace(/_/g, " ")}
                  </span>
                  <span className="text-xs text-gray-400">Confidence: {insight.confidence}%</span>
                </div>
                <p className="text-sm text-gray-700">{insight.insight}</p>
                {insight.source && (
                  <p className="text-xs text-gray-400 mt-1">Source: {insight.source}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BriefingPreferencesPage() {
  const [generating, setGenerating] = useState(false);
  const [latestBriefing, setLatestBriefing] = useState<{
    title: string;
    markdown: string;
  } | null>(null);

  const { data: prefs, refetch: refetchPrefs } = trpc.briefingPersonalisation.getPreferences.useQuery();
  const { data: briefings, refetch: refetchBriefings } = trpc.briefingPersonalisation.listBriefings.useQuery({ limit: 10 });

  const updatePrefs = trpc.briefingPersonalisation.updatePreferences.useMutation({
    onSuccess: () => refetchPrefs(),
  });

  const generateBriefing = trpc.briefingPersonalisation.generateBriefing.useMutation({
    onSuccess: (data: { briefingId: number; title: string; content: unknown; markdown: string }) => {
      setGenerating(false);
      setLatestBriefing({ title: data.title, markdown: data.markdown });
      refetchBriefings();
    },
    onError: () => setGenerating(false),
  });

  const handleUpdate = (updates: Parameters<typeof updatePrefs.mutate>[0]) => {
    updatePrefs.mutate(updates);
  };

  const enabledSections = (prefs?.enabledSections as string[] | null) ?? ALL_SECTIONS.map(s => s.key);

  return (
    <PageShell title="Briefing Preferences" subtitle="Personalise Victoria's morning briefing and review agent insights">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: Preferences + Generate */}
        <div className="xl:col-span-2 space-y-6">
          {/* Preferences Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-5">
              <Settings className="w-5 h-5 text-gray-500" />
              <h3 className="font-semibold text-gray-900">Briefing Preferences</h3>
            </div>

            <div className="space-y-5">
              <ToggleOption
                label="Briefing Length"
                value={(prefs?.preferredLength ?? "standard") as "brief" | "standard" | "detailed"}
                options={[
                  { value: "brief", label: "Brief (2-3 sentences)" },
                  { value: "standard", label: "Standard" },
                  { value: "detailed", label: "Detailed" },
                ]}
                onChange={v => handleUpdate({ preferredLength: v })}
              />

              <ToggleOption
                label="Tone"
                value={(prefs?.tone ?? "professional") as "professional" | "casual" | "motivational"}
                options={[
                  { value: "professional", label: "Professional" },
                  { value: "casual", label: "Casual" },
                  { value: "motivational", label: "Motivational" },
                ]}
                onChange={v => handleUpdate({ tone: v })}
              />

              <SectionToggle
                enabled={enabledSections}
                onChange={sections => handleUpdate({ enabledSections: sections })}
              />

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="text-sm text-gray-700">Include Weather</span>
                  <button
                    onClick={() => handleUpdate({ includeWeather: !prefs?.includeWeather })}
                    className={`w-10 h-5 rounded-full transition-colors ${prefs?.includeWeather ? "bg-blue-500" : "bg-gray-300"}`}
                  >
                    <span className={`block w-4 h-4 rounded-full bg-white shadow transition-transform mx-0.5 ${prefs?.includeWeather ? "translate-x-5" : "translate-x-0"}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="text-sm text-gray-700">Market Data</span>
                  <button
                    onClick={() => handleUpdate({ includeMarketData: !prefs?.includeMarketData })}
                    className={`w-10 h-5 rounded-full transition-colors ${prefs?.includeMarketData ? "bg-blue-500" : "bg-gray-300"}`}
                  >
                    <span className={`block w-4 h-4 rounded-full bg-white shadow transition-transform mx-0.5 ${prefs?.includeMarketData ? "translate-x-5" : "translate-x-0"}`} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={() => {
              setGenerating(true);
              generateBriefing.mutate();
            }}
            disabled={generating}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 font-semibold text-base shadow-lg"
          >
            {generating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Victoria is preparing your briefing...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Morning Briefing
              </>
            )}
          </button>

          {/* Latest Briefing Preview */}
          {latestBriefing && (
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border border-blue-100 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-blue-500" />
                <h3 className="font-semibold text-gray-900">{latestBriefing.title}</h3>
              </div>
              <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap text-sm">
                {latestBriefing.markdown}
              </div>
            </div>
          )}

          {/* Past Briefings */}
          {briefings && briefings.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-gray-500" />
                  Past Briefings
                </h3>
                <button
                  onClick={() => refetchBriefings()}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3">
                {briefings.map((b: { id: number; title: string; date: Date; status: string | null; content: unknown }) => (
                  <BriefingCard
                    key={b.id}
                    briefing={{
                      id: b.id,
                      title: b.title,
                      date: b.date,
                      status: b.status,
                      content: b.content as Record<string, unknown>,
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Agent Insights */}
        <div>
          <AgentInsightsPanel />
        </div>
      </div>
    </PageShell>
  );
}
