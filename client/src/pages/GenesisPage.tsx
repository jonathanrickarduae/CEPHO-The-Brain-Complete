import { ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const STAGES = [
  { id: "concept", label: "Concept", description: "What is the idea and why does it matter?" },
  { id: "market", label: "Market", description: "Who is the customer and how large is the opportunity?" },
  { id: "model", label: "Business Model", description: "How does this make money and at what margin?" },
  { id: "team", label: "Team", description: "Who is needed to execute and what is missing?" },
  { id: "risk", label: "Risk", description: "What are the top 5 risks and how are they mitigated?" },
  { id: "execution", label: "Execution", description: "What are the first 90 days and key milestones?" },
];

const QUESTIONS: Record<string, string[]> = {
  concept: [
    "Describe the idea in one sentence.",
    "What problem does it solve and for whom?",
    "Why now — what has changed to make this possible?",
    "What is your unfair advantage?",
  ],
  market: [
    "Who is the primary customer?",
    "What is the total addressable market?",
    "Who are the main competitors and how are you different?",
    "What does the customer pay today to solve this problem?",
  ],
  model: [
    "How does the business generate revenue?",
    "What is the unit economics — cost to acquire vs lifetime value?",
    "What is the path to profitability?",
    "What are the key cost drivers?",
  ],
  team: [
    "Who is leading this and what is their relevant experience?",
    "What key roles need to be filled in the first 6 months?",
    "What advisors or partners are needed?",
    "What is the equity and incentive structure?",
  ],
  risk: [
    "What is the single biggest risk to this business?",
    "What regulatory or legal risks exist?",
    "What happens if the lead customer says no?",
    "What is the worst-case scenario and can you survive it?",
  ],
  execution: [
    "What are the top 3 priorities in the first 30 days?",
    "What does success look like at 90 days?",
    "What is the funding requirement and how will it be used?",
    "What is the first milestone that proves the concept?",
  ],
};

export default function GenesisPage() {
  const [activeStage, setActiveStage] = useState("concept");
  const [answers, setAnswers] = useState<Record<string, Record<number, string>>>({});
  const [ideaTitle, setIdeaTitle] = useState("");

  const stageAnswers = answers[activeStage] || {};
  const questions = QUESTIONS[activeStage] || [];

  const stageComplete = (stageId: string) =>
    (QUESTIONS[stageId] || []).every((_, i) => (answers[stageId]?.[i] || "").trim().length > 0);

  const completedCount = STAGES.filter((s) => stageComplete(s.id)).length;

  return (
    <div className="flex h-full min-h-screen bg-background">
      {/* Stage sidebar */}
      <div className="w-64 border-r border-border bg-background flex flex-col">
        <div className="p-5 border-b border-border">
          <h1 className="text-base font-display font-bold text-foreground">Project Genesis</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Assess a new idea end-to-end</p>
          <div className="mt-3 h-1.5 rounded-full bg-border overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${(completedCount / STAGES.length) * 100}%` }}
            />
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">{completedCount} of {STAGES.length} stages complete</p>
        </div>

        <div className="flex-1 p-3 space-y-1">
          {STAGES.map((stage, i) => {
            const complete = stageComplete(stage.id);
            const isActive = activeStage === stage.id;
            return (
              <button
                key={stage.id}
                onClick={() => setActiveStage(stage.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                }`}
              >
                {complete ? (
                  <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                ) : (
                  <div className={`h-4 w-4 rounded-full border-2 shrink-0 flex items-center justify-center text-[9px] font-bold ${
                    isActive ? "border-primary text-primary" : "border-border text-muted-foreground"
                  }`}>
                    {i + 1}
                  </div>
                )}
                <p className="text-sm font-medium leading-none truncate">{stage.label}</p>
              </button>
            );
          })}
        </div>

        <div className="p-3 border-t border-border">
          <Button className="w-full gap-2 bg-primary hover:bg-primary/90" size="sm" disabled={completedCount < STAGES.length}>
            <ArrowRight className="h-3.5 w-3.5" />
            Generate Assessment
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto p-8">
          {activeStage === "concept" && (
            <div className="mb-8">
              <label className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                Idea Name
              </label>
              <input
                type="text"
                value={ideaTitle}
                onChange={(e) => setIdeaTitle(e.target.value)}
                placeholder="Give your idea a working title..."
                className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-lg font-medium"
              />
            </div>
          )}

          <div className="mb-6">
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">
              Stage {STAGES.findIndex((s) => s.id === activeStage) + 1} of {STAGES.length}
            </span>
            <h2 className="text-2xl font-display font-bold text-foreground mt-1">
              {STAGES.find((s) => s.id === activeStage)?.label}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {STAGES.find((s) => s.id === activeStage)?.description}
            </p>
          </div>

          <div className="space-y-6">
            {questions.map((q, i) => (
              <div key={i}>
                <label className="block text-sm font-medium text-foreground mb-2">{q}</label>
                <textarea
                  value={stageAnswers[i] || ""}
                  onChange={(e) =>
                    setAnswers((prev) => ({
                      ...prev,
                      [activeStage]: { ...(prev[activeStage] || {}), [i]: e.target.value },
                    }))
                  }
                  rows={3}
                  placeholder="Your answer..."
                  className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none text-sm"
                />
              </div>
            ))}
          </div>

          {activeStage !== "execution" && (
            <div className="mt-8 flex justify-end">
              <Button
                onClick={() => {
                  const idx = STAGES.findIndex((s) => s.id === activeStage);
                  if (idx < STAGES.length - 1) setActiveStage(STAGES[idx + 1].id);
                }}
                className="gap-2 bg-primary hover:bg-primary/90"
              >
                Next Stage
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
