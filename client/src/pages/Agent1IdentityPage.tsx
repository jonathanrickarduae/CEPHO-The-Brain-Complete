// @ts-nocheck
import { PageShell } from "@/components/layout/PageShell";
import { useState, useEffect } from "react";
import {
  User,
  Heart,
  Users,
  Settings2,
  Save,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";

const PROFILE_TABS = [
  {
    id: "identity",
    label: "identity.md",
    icon: User,
    description: "Who you are — background, roles, life stage, context",
    placeholder: `# Who I Am

## Background
[Your name, where you're from, current life stage]

## Roles
[CEO / parent / partner / founder / etc.]

## Current Context
[What's happening in your life right now — what you're building, navigating, or working through]

## Key Facts
- Age: 
- Location: 
- Industry: 
- Family: `,
  },
  {
    id: "values",
    label: "values.md",
    icon: Heart,
    description: "What you stand for — principles, priorities, non-negotiables",
    placeholder: `# My Values

## Core Principles
[The beliefs that guide your decisions]

## Priorities
[What matters most — in order]

## Non-Negotiables
[What you will never compromise on]

## What I'm Optimising For
[What does a good life look like for you?]`,
  },
  {
    id: "relationships",
    label: "relationships.md",
    icon: Users,
    description: "The people who matter — family, partners, team, mentors",
    placeholder: `# My Relationships

## Family
[Partner, children, parents — names and context]

## Key People
[Business partners, close friends, mentors]

## Team
[Direct reports, collaborators]

## Relationship Notes
[Anything Agent1 should know about how you navigate relationships]`,
  },
  {
    id: "preferences",
    label: "preferences.md",
    icon: Settings2,
    description: "How you work best — communication style, tools, rhythms",
    placeholder: `# My Preferences

## Communication Style
[How you like to receive information — direct, structured, concise, etc.]

## Work Rhythms
[When you're sharpest, how you like to plan your day]

## Decision-Making Style
[How you make decisions — fast/slow, data-driven/intuitive, etc.]

## Tools & Systems
[What you use to organise your life]

## What Frustrates Me
[What slows you down or drains your energy]`,
  },
] as const;

type TabId = (typeof PROFILE_TABS)[number]["id"];

const FIELD_MAP: Record<TabId, string> = {
  identity: "identityMd",
  values: "valuesMd",
  relationships: "relationshipsMd",
  preferences: "preferencesMd",
};

export default function Agent1IdentityPage() {
  const [activeTab, setActiveTab] = useState<TabId>("identity");
  const [drafts, setDrafts] = useState<Record<TabId, string>>({
    identity: "",
    values: "",
    relationships: "",
    preferences: "",
  });
  const [isDirty, setIsDirty] = useState(false);

  const { data: profile, refetch } = trpc.agent1.identity.get.useQuery();

  useEffect(() => {
    if (profile) {
      setDrafts({
        identity: profile.identityMd ?? "",
        values: profile.valuesMd ?? "",
        relationships: profile.relationshipsMd ?? "",
        preferences: profile.preferencesMd ?? "",
      });
    }
  }, [profile]);

  const saveMutation = trpc.agent1.identity.save.useMutation({
    onSuccess: () => {
      toast.success("Profile saved");
      setIsDirty(false);
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const handleChange = (value: string) => {
    setDrafts((prev) => ({ ...prev, [activeTab]: value }));
    setIsDirty(true);
  };

  const handleSave = () => {
    saveMutation.mutate({
      identityMd: drafts.identity,
      valuesMd: drafts.values,
      relationshipsMd: drafts.relationships,
      preferencesMd: drafts.preferences,
      onboardingComplete: true,
    });
  };

  const completedCount = PROFILE_TABS.filter(
    (t) => drafts[t.id]?.trim().length > 0
  ).length;

  return (
    <PageShell
      icon={User}
      title="Identity Profile"
      subtitle="The four files that make Agent1 yours"
    >
      <div className="max-w-4xl mx-auto flex flex-col gap-4">
        {/* Onboarding Progress */}
        <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-semibold">
                {completedCount === 4
                  ? "Profile complete"
                  : `${completedCount} of 4 files completed`}
              </span>
              {completedCount === 4 && (
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              )}
            </div>
            <div className="flex gap-1">
              {PROFILE_TABS.map((t) => (
                <div
                  key={t.id}
                  className={cn(
                    "h-1.5 flex-1 rounded-full transition-colors",
                    drafts[t.id]?.trim().length > 0
                      ? "bg-[var(--brain-magenta)]"
                      : "bg-muted"
                  )}
                />
              ))}
            </div>
          </div>
          {isDirty && (
            <div className="flex items-center gap-1.5 text-amber-400 text-xs">
              <AlertCircle className="h-3.5 w-3.5" />
              Unsaved changes
            </div>
          )}
          <Button
            onClick={handleSave}
            disabled={saveMutation.isPending || !isDirty}
            size="sm"
            className="gap-1.5 bg-[var(--brain-magenta)] hover:bg-[var(--brain-magenta)]/80 text-white"
          >
            <Save className="h-3.5 w-3.5" />
            Save All
          </Button>
        </div>

        <div className="grid grid-cols-[200px_1fr] gap-4">
          {/* Tab List */}
          <div className="flex flex-col gap-1">
            {PROFILE_TABS.map((tab) => {
              const Icon = tab.icon;
              const hasContent = drafts[tab.id]?.trim().length > 0;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all",
                    activeTab === tab.id
                      ? "bg-[var(--brain-magenta)]/10 border border-[var(--brain-magenta)]/20 text-[var(--brain-magenta)]"
                      : "hover:bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-mono font-medium truncate">
                      {tab.label}
                    </p>
                  </div>
                  {hasContent ? (
                    <CheckCircle2 className="h-3 w-3 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="h-3 w-3 opacity-40 flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Editor */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden flex flex-col">
            {PROFILE_TABS.filter((t) => t.id === activeTab).map((tab) => {
              const Icon = tab.icon;
              return (
                <div key={tab.id} className="flex flex-col h-full">
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
                    <Icon className="h-4 w-4 text-[var(--brain-magenta)]" />
                    <span className="font-mono text-sm font-medium">
                      {tab.label}
                    </span>
                    <Badge
                      variant="outline"
                      className="ml-auto text-[10px] text-muted-foreground"
                    >
                      Markdown
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground px-4 py-2 border-b border-border/50 bg-muted/20">
                    {tab.description}
                  </p>
                  <Textarea
                    value={drafts[tab.id]}
                    onChange={(e) => handleChange(e.target.value)}
                    placeholder={tab.placeholder}
                    className="flex-1 resize-none border-0 rounded-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 font-mono text-sm min-h-[400px] p-4"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
