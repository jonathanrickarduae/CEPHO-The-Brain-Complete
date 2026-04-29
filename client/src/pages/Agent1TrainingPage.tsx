// @ts-nocheck
import { PageShell } from "@/components/layout/PageShell";
import { useState } from "react";
import {
  Dumbbell,
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Target,
  Zap,
  Brain,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";

const WEEKS = [
  {
    week: 1,
    theme: "Foundation",
    icon: BookOpen,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    days: [
      {
        day: 1,
        title: "Identity Calibration",
        prompt:
          "Complete your identity.md file. Write honestly about who you are, your current context, and what you're building.",
      },
      {
        day: 2,
        title: "Values Mapping",
        prompt:
          "Complete your values.md. What do you stand for? What are your non-negotiables?",
      },
      {
        day: 3,
        title: "Relationship Architecture",
        prompt:
          "Complete your relationships.md. Map the key people in your life and what they mean to you.",
      },
      {
        day: 4,
        title: "Preference Profiling",
        prompt:
          "Complete your preferences.md. How do you work best? What frustrates you?",
      },
      {
        day: 5,
        title: "First Real Conversation",
        prompt:
          "Have your first full conversation with Agent1. Ask it something you've been thinking about for weeks.",
      },
      {
        day: 6,
        title: "Decision Archaeology",
        prompt:
          "Log 3 past decisions in the Decision Log. Include what you chose and why.",
      },
      {
        day: 7,
        title: "Week 1 Reflection",
        prompt:
          "What surprised you about Agent1 this week? What felt off? What felt right?",
      },
    ],
  },
  {
    week: 2,
    theme: "Operating Modes",
    icon: Zap,
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
    days: [
      {
        day: 1,
        title: "Life Optimiser Mode",
        prompt:
          "Use Life Optimiser mode for 20 minutes. Ask about one area of your life you want to improve.",
      },
      {
        day: 2,
        title: "Strategic Thinker Mode",
        prompt:
          "Use Strategic Thinker mode. Bring your biggest strategic question right now.",
      },
      {
        day: 3,
        title: "Systems Architect Mode",
        prompt:
          "Use Systems Architect mode. Map one system in your life or business that needs redesigning.",
      },
      {
        day: 4,
        title: "Research Analyst Mode",
        prompt:
          "Use Research Analyst mode. Ask it to help you understand something you've been confused about.",
      },
      {
        day: 5,
        title: "Emotional Translator Mode",
        prompt:
          "Use Emotional Translator mode. Share something emotionally complex you're navigating.",
      },
      {
        day: 6,
        title: "Simplifier Mode",
        prompt:
          "Use Simplifier mode. Take something complicated and ask Agent1 to make it clear.",
      },
      {
        day: 7,
        title: "Accountability Partner Mode",
        prompt:
          "Use Accountability Partner mode. Share a commitment you've been avoiding.",
      },
    ],
  },
  {
    week: 3,
    theme: "Council Activation",
    icon: Brain,
    color: "text-pink-400",
    bg: "bg-pink-500/10",
    border: "border-pink-500/20",
    days: [
      {
        day: 1,
        title: "Meet ARIA",
        prompt:
          "Enable Council view. Ask a research-heavy question and read ARIA's perspective.",
      },
      {
        day: 2,
        title: "Meet ABEL",
        prompt:
          "Enable Council view. Ask about a risk you're taking. Read ABEL's protection analysis.",
      },
      {
        day: 3,
        title: "Meet LEX",
        prompt:
          "Enable Council view. Ask about an ethical dilemma. Read LEX's honesty assessment.",
      },
      {
        day: 4,
        title: "Meet SAFI",
        prompt:
          "Enable Council view. Share a setback. Read SAFI's self-healing perspective.",
      },
      {
        day: 5,
        title: "Meet LUNA",
        prompt:
          "Enable Council view. Share something emotionally heavy. Read LUNA's empathy response.",
      },
      {
        day: 6,
        title: "Meet INDI & ODIN",
        prompt:
          "Enable Council view. Ask a practical strategy question. Read INDI and ODIN together.",
      },
      {
        day: 7,
        title: "Full Council Session",
        prompt:
          "Bring your most complex current challenge. Read all 7 council perspectives.",
      },
    ],
  },
  {
    week: 4,
    theme: "Decision Architecture",
    icon: Target,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    days: [
      {
        day: 1,
        title: "Pending Decisions Audit",
        prompt:
          "List every decision you're currently avoiding. Log them all in the Decision Log.",
      },
      {
        day: 2,
        title: "Risk Calibration",
        prompt:
          "For each pending decision, honestly assess your risk tolerance. Are you being too cautious or too bold?",
      },
      {
        day: 3,
        title: "Options Expansion",
        prompt:
          "Pick your hardest decision. Ask Agent1 to generate 5 options you haven't considered.",
      },
      {
        day: 4,
        title: "Second-Order Thinking",
        prompt:
          "Ask Agent1 to map the second and third-order consequences of your most important pending decision.",
      },
      {
        day: 5,
        title: "Pre-Mortem Analysis",
        prompt:
          "Pick a decision you've already made. Ask Agent1 to run a pre-mortem: what could go wrong?",
      },
      {
        day: 6,
        title: "Decision Criteria",
        prompt:
          "Ask Agent1 to help you build a personal decision-making framework based on your values.",
      },
      {
        day: 7,
        title: "Week 4 Retrospective",
        prompt:
          "Review your Decision Log. What patterns do you notice in how you make decisions?",
      },
    ],
  },
];

// Generate remaining 8 weeks with themes
const REMAINING_WEEKS = [
  { week: 5, theme: "Deep Work Integration", icon: Zap },
  { week: 6, theme: "Relationship Intelligence", icon: Brain },
  { week: 7, theme: "Energy & Performance", icon: Target },
  { week: 8, theme: "Strategic Planning", icon: BookOpen },
  { week: 9, theme: "Systems Thinking", icon: Brain },
  { week: 10, theme: "Communication Mastery", icon: Zap },
  { week: 11, theme: "Leadership & Influence", icon: Target },
  { week: 12, theme: "Integration & Evolution", icon: BookOpen },
].map((w) => ({
  ...w,
  color: "text-muted-foreground",
  bg: "bg-muted/30",
  border: "border-border",
  days: Array.from({ length: 7 }, (_, i) => ({
    day: i + 1,
    title: `Day ${i + 1} — ${w.theme}`,
    prompt: `Week ${w.week}, Day ${i + 1}: Continue your ${w.theme} practice. Ask Agent1 for today's focus area.`,
  })),
}));

const ALL_WEEKS = [...WEEKS, ...REMAINING_WEEKS];

export default function Agent1TrainingPage() {
  const [expandedWeek, setExpandedWeek] = useState<number | null>(1);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const { data: progress, refetch } = trpc.agent1.training.progress.useQuery();

  const completedDays = new Set(
    (progress ?? []).filter((p: any) => p.completed).map((p: any) => p.dayKey)
  );

  const toggleMutation = trpc.agent1.training.toggle.useMutation({
    onSuccess: () => refetch(),
    onError: (err) => toast.error(err.message),
  });

  const saveNotesMutation = trpc.agent1.training.saveNotes.useMutation({
    onSuccess: () => toast.success("Notes saved"),
    onError: (err) => toast.error(err.message),
  });

  const getDayKey = (week: number, day: number) => `w${week}d${day}`;

  const totalDays = 84;
  const completedCount = completedDays.size;
  const progressPct = Math.round((completedCount / totalDays) * 100);

  return (
    <PageShell
      icon={Dumbbell}
      title="Training Regime"
      subtitle="12 weeks to master your personal AI operating system"
    >
      <div className="max-w-4xl mx-auto flex flex-col gap-4">
        {/* Overall Progress */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm font-semibold">
                {completedCount} / {totalDays} days completed
              </p>
              <p className="text-xs text-muted-foreground">
                {progressPct}% through the 12-week programme
              </p>
            </div>
            <span className="text-2xl font-bold text-[var(--brain-magenta)]">
              {progressPct}%
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--brain-magenta)] rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Week List */}
        <div className="flex flex-col gap-3">
          {ALL_WEEKS.map((week) => {
            const weekDays = week.days;
            const weekCompleted = weekDays.filter((d) =>
              completedDays.has(getDayKey(week.week, d.day))
            ).length;
            const isExpanded = expandedWeek === week.week;

            return (
              <div
                key={week.week}
                className="bg-card border border-border rounded-2xl overflow-hidden"
              >
                {/* Week Header */}
                <div
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() =>
                    setExpandedWeek(isExpanded ? null : week.week)
                  }
                >
                  <div
                    className={cn(
                      "h-8 w-8 rounded-xl flex items-center justify-center",
                      week.bg
                    )}
                  >
                    <week.icon className={cn("h-4 w-4", week.color)} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">
                        Week {week.week}
                      </span>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] border",
                          week.border,
                          week.color
                        )}
                      >
                        {week.theme}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="h-1 w-24 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[var(--brain-magenta)] rounded-full"
                          style={{
                            width: `${(weekCompleted / 7) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {weekCompleted}/7
                      </span>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>

                {/* Days */}
                {isExpanded && (
                  <div className="border-t border-border divide-y divide-border/50">
                    {weekDays.map((d) => {
                      const dayKey = getDayKey(week.week, d.day);
                      const done = completedDays.has(dayKey);
                      const isExpDay = expandedDay === dayKey;

                      return (
                        <div key={d.day}>
                          <div
                            className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/20 transition-colors"
                            onClick={() =>
                              setExpandedDay(isExpDay ? null : dayKey)
                            }
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleMutation.mutate({ dayKey, completed: !done });
                              }}
                              className="flex-shrink-0"
                            >
                              {done ? (
                                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                              ) : (
                                <Circle className="h-5 w-5 text-muted-foreground/40" />
                              )}
                            </button>
                            <div className="flex-1 min-w-0">
                              <p
                                className={cn(
                                  "text-sm font-medium",
                                  done && "line-through text-muted-foreground"
                                )}
                              >
                                Day {d.day} — {d.title}
                              </p>
                            </div>
                            {isExpDay ? (
                              <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                            )}
                          </div>

                          {isExpDay && (
                            <div className="px-4 pb-4 flex flex-col gap-3">
                              <div className="bg-muted/30 rounded-xl p-3 border border-border/50">
                                <p className="text-xs font-semibold text-muted-foreground mb-1">
                                  TODAY'S PROMPT
                                </p>
                                <p className="text-sm text-foreground/80">
                                  {d.prompt}
                                </p>
                              </div>
                              <Textarea
                                value={notes[dayKey] ?? ""}
                                onChange={(e) =>
                                  setNotes((prev) => ({
                                    ...prev,
                                    [dayKey]: e.target.value,
                                  }))
                                }
                                placeholder="Your notes for today..."
                                rows={3}
                                className="text-sm resize-none"
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                className="self-end gap-1.5"
                                onClick={() =>
                                  saveNotesMutation.mutate({
                                    dayKey,
                                    notes: notes[dayKey] ?? "",
                                  })
                                }
                              >
                                Save Notes
                              </Button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </PageShell>
  );
}
