// @ts-nocheck
import { PageShell } from "@/components/layout/PageShell";
import { useState, useEffect } from "react";
import {
  Settings,
  Save,
  Layers,
  Users,
  FileText,
  Info,
  Shield,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";

const OPERATING_MODES = [
  "Life Optimiser",
  "Strategic Thinker",
  "Systems Architect",
  "Research Analyst",
  "Emotional Translator",
  "Simplifier",
  "Accountability Partner",
];

const RESPONSE_LEVELS = ["Simple", "Practical", "Full"];

const CONSTITUTIONAL_ARTICLES = [
  {
    id: "no-loss-law",
    title: "No-Loss Law",
    description:
      "Agent1 will never recommend, suggest, or facilitate any action that results in the permanent loss of resources, relationships, health, or freedom — even if asked to.",
    icon: Shield,
    color: "text-red-400",
    bg: "bg-red-500/10",
  },
  {
    id: "autonomy-protection",
    title: "Autonomy Protection",
    description:
      "Agent1 protects your right to make your own decisions. It will present options, risks, and perspectives — but will never manipulate, pressure, or override your judgment.",
    icon: Eye,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    id: "honesty-rules",
    title: "Honesty Rules",
    description:
      "Agent1 will always tell you the truth, even when it is uncomfortable. It will not flatter, validate poor decisions, or tell you what you want to hear at the expense of what you need to hear.",
    icon: FileText,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
];

const COCPIS_FIELDS = [
  { key: "context", label: "Context", placeholder: "What is the situation?" },
  {
    key: "objective",
    label: "Objective",
    placeholder: "What do you want to achieve?",
  },
  {
    key: "constraints",
    label: "Constraints",
    placeholder: "What limits or boundaries apply?",
  },
  {
    key: "preferences",
    label: "Preferences",
    placeholder: "How do you prefer this to be handled?",
  },
  {
    key: "importance",
    label: "Importance",
    placeholder: "Why does this matter?",
  },
  {
    key: "successCriteria",
    label: "Success criteria",
    placeholder: "How will you know this worked?",
  },
] as const;

export default function Agent1SettingsPage() {
  const [defaultMode, setDefaultMode] = useState("Life Optimiser");
  const [defaultLevel, setDefaultLevel] = useState("Practical");
  const [showCouncil, setShowCouncil] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [showSystemPrompt, setShowSystemPrompt] = useState(false);
  const [cocpisValues, setCocpisValues] = useState<Record<string, string>>({});

  const { data: settings, refetch } = trpc.agent1.settings.get.useQuery();
  const { data: systemPrompt } = trpc.agent1.settings.systemPrompt.useQuery();

  useEffect(() => {
    if (settings) {
      setDefaultMode(settings.defaultOperatingMode ?? "Life Optimiser");
      setDefaultLevel(settings.defaultResponseLevel ?? "Practical");
      setShowCouncil(settings.showCouncilByDefault ?? false);
    }
  }, [settings]);

  const saveMutation = trpc.agent1.settings.save.useMutation({
    onSuccess: () => {
      toast.success("Settings saved");
      setIsDirty(false);
      refetch();
    },
    onError: err => toast.error(err.message),
  });

  const handleSave = () => {
    saveMutation.mutate({
      defaultOperatingMode: defaultMode,
      defaultResponseLevel: defaultLevel,
      showCouncilByDefault: showCouncil,
    });
  };

  return (
    <PageShell
      icon={Settings}
      title="Agent1 Settings"
      subtitle="Configure your personal AI operating system"
    >
      <div className="max-w-3xl mx-auto flex flex-col gap-6">
        {/* Defaults */}
        <Section title="Defaults" icon={Layers}>
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-2 block">
                Default Operating Mode
              </label>
              <div className="flex flex-wrap gap-2">
                {OPERATING_MODES.map(mode => (
                  <button
                    key={mode}
                    onClick={() => {
                      setDefaultMode(mode);
                      setIsDirty(true);
                    }}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                      defaultMode === mode
                        ? "bg-[var(--brain-magenta)]/10 border-[var(--brain-magenta)]/30 text-[var(--brain-magenta)]"
                        : "border-border text-muted-foreground hover:bg-muted"
                    )}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-2 block">
                Default Response Level
              </label>
              <div className="flex gap-2">
                {RESPONSE_LEVELS.map(level => (
                  <button
                    key={level}
                    onClick={() => {
                      setDefaultLevel(level);
                      setIsDirty(true);
                    }}
                    className={cn(
                      "flex-1 py-2 rounded-lg text-xs font-medium border transition-all",
                      defaultLevel === level
                        ? "bg-[var(--brain-cyan)]/10 border-[var(--brain-cyan)]/30 text-[var(--brain-cyan)]"
                        : "border-border text-muted-foreground hover:bg-muted"
                    )}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Show Council by Default</p>
                <p className="text-xs text-muted-foreground">
                  Surface all 7 sub-agent perspectives on every response
                </p>
              </div>
              <Switch
                checked={showCouncil}
                onCheckedChange={v => {
                  setShowCouncil(v);
                  setIsDirty(true);
                }}
              />
            </div>

            <Button
              onClick={handleSave}
              disabled={!isDirty || saveMutation.isPending}
              size="sm"
              className="self-end gap-1.5 bg-[var(--brain-magenta)] hover:bg-[var(--brain-magenta)]/80 text-white"
            >
              <Save className="h-3.5 w-3.5" />
              Save Settings
            </Button>
          </div>
        </Section>

        {/* Context Builder (C/O/C/P/I/S) */}
        <Section title="Context Builder (C/O/C/P/I/S)" icon={FileText}>
          <p className="text-xs text-muted-foreground mb-3">
            Use this structured template to frame complex questions before
            sending them to Agent1. Fill in the fields and copy the output into
            the chat.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {COCPIS_FIELDS.map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                  {label}
                </label>
                <Textarea
                  value={cocpisValues[key] ?? ""}
                  onChange={e =>
                    setCocpisValues(prev => ({
                      ...prev,
                      [key]: e.target.value,
                    }))
                  }
                  placeholder={placeholder}
                  rows={2}
                  className="text-sm resize-none"
                />
              </div>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-3 gap-1.5 text-xs"
            onClick={() => {
              const text = COCPIS_FIELDS.filter(({ key }) =>
                cocpisValues[key]?.trim()
              )
                .map(({ label, key }) => `**${label}:** ${cocpisValues[key]}`)
                .join("\n");
              navigator.clipboard.writeText(text);
              toast.success("Context copied to clipboard");
            }}
          >
            Copy Context to Clipboard
          </Button>
        </Section>

        {/* Constitutional Articles */}
        <Section title="Constitutional Articles" icon={Shield}>
          <p className="text-xs text-muted-foreground mb-3">
            These rules are permanently embedded in Agent1's system prompt and
            cannot be overridden by any conversation or instruction.
          </p>
          <div className="flex flex-col gap-3">
            {CONSTITUTIONAL_ARTICLES.map(article => {
              const Icon = article.icon;
              return (
                <div
                  key={article.id}
                  className={cn(
                    "flex gap-3 p-3 rounded-xl border",
                    article.bg,
                    "border-current/20"
                  )}
                >
                  <div
                    className={cn(
                      "h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0",
                      article.bg
                    )}
                  >
                    <Icon className={cn("h-4 w-4", article.color)} />
                  </div>
                  <div>
                    <p className={cn("text-sm font-semibold", article.color)}>
                      {article.title}
                    </p>
                    <p className="text-xs text-foreground/70 mt-0.5">
                      {article.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </Section>

        {/* System Prompt Viewer */}
        <Section title="System Prompt" icon={Info}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-muted-foreground">
              The master system prompt currently active for Agent1
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={() => setShowSystemPrompt(!showSystemPrompt)}
            >
              {showSystemPrompt ? (
                <EyeOff className="h-3.5 w-3.5" />
              ) : (
                <Eye className="h-3.5 w-3.5" />
              )}
              {showSystemPrompt ? "Hide" : "View"}
            </Button>
          </div>
          {showSystemPrompt && systemPrompt && (
            <pre className="text-xs text-foreground/70 whitespace-pre-wrap font-mono bg-muted/30 rounded-xl p-4 border border-border max-h-96 overflow-y-auto">
              {systemPrompt}
            </pre>
          )}
        </Section>
      </div>
    </PageShell>
  );
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: any;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-card border border-border rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="h-4 w-4 text-[var(--brain-magenta)]" />
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      {children}
    </div>
  );
}
