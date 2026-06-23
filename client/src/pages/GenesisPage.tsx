import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowRight, CheckCircle, Loader2, Sparkles, Plus, ChevronDown, ChevronUp, Menu, X } from "lucide-react";
import { Streamdown } from "streamdown";

const STAGES = [
  { id: "concept",   label: "Concept",        description: "What is the idea and why does it matter?" },
  { id: "market",    label: "Market",          description: "Who is the customer and how large is the opportunity?" },
  { id: "model",     label: "Business Model",  description: "How does this make money and at what margin?" },
  { id: "team",      label: "Team",            description: "Who is needed to execute and what is missing?" },
  { id: "risk",      label: "Risk",            description: "What are the top 5 risks and how are they mitigated?" },
  { id: "execution", label: "Execution",       description: "What are the first 90 days and key milestones?" },
];

const QUESTIONS: Record<string, string[]> = {
  concept:   ["Describe the idea in one sentence.", "What problem does it solve and for whom?", "Why now — what has changed to make this possible?", "What is your unfair advantage?"],
  market:    ["Who is the primary customer?", "What is the total addressable market?", "Who are the main competitors and how are you different?", "What does the customer pay today to solve this problem?"],
  model:     ["How does the business generate revenue?", "What is the unit economics — cost to acquire vs lifetime value?", "What is the path to profitability?", "What are the key cost drivers?"],
  team:      ["Who is leading this and what is their relevant experience?", "What key roles need to be filled in the first 6 months?", "What advisors or partners are needed?", "What is the equity and incentive structure?"],
  risk:      ["What is the single biggest risk to this business?", "What regulatory or legal risks exist?", "What happens if the lead customer says no?", "What is the worst-case scenario and can you survive it?"],
  execution: ["What are the top 3 priorities in the first 30 days?", "What does success look like at 90 days?", "What is the funding requirement and how will it be used?", "What is the first milestone that proves the concept?"],
};

export default function GenesisPage() {
  const [activeStage, setActiveStage] = useState("concept");
  const [answers, setAnswers] = useState<Record<string, Record<number, string>>>({});
  const [ideaTitle, setIdeaTitle] = useState("");
  const [assessment, setAssessment] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedHistoryId, setSelectedHistoryId] = useState<number | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const { data: history = [], refetch } = trpc.genesis.list.useQuery();

  const saveMutation = trpc.genesis.save.useMutation({
    onSuccess: () => { toast.success("Progress saved"); refetch(); },
    onError: () => toast.error("Failed to save"),
  });

  const assessMutation = trpc.genesis.assess.useMutation({
    onSuccess: (data) => { setAssessment(data.analysis); toast.success("Assessment generated"); refetch(); },
    onError: () => toast.error("Assessment failed"),
  });

  const stageAnswers = answers[activeStage] || {};
  const questions = QUESTIONS[activeStage] || [];

  const stageComplete = (stageId: string) =>
    (QUESTIONS[stageId] || []).every((_, i) => (answers[stageId]?.[i] || "").trim().length > 0);

  const completedCount = STAGES.filter((s) => stageComplete(s.id)).length;
  const allComplete = completedCount === STAGES.length;

  const handleSave = () => {
    if (!ideaTitle.trim()) { toast.error("Please enter an idea title first"); return; }
    saveMutation.mutate({ ideaTitle, ideaSummary: answers.concept?.[0] ?? "", answers: JSON.stringify(answers) });
  };

  const handleAssess = () => {
    if (!ideaTitle.trim()) { toast.error("Please enter an idea title first"); return; }
    assessMutation.mutate({ ideaTitle, ideaSummary: answers.concept?.[0] ?? "", answers: JSON.stringify(answers) });
  };

  const loadHistory = (item: { id: number; ideaTitle: string; answers: string; aiAnalysis: string }) => {
    setIdeaTitle(item.ideaTitle);
    try { setAnswers(JSON.parse(item.answers)); } catch { /* ignore */ }
    if (item.aiAnalysis && item.aiAnalysis !== "{}") {
      try { const a = JSON.parse(item.aiAnalysis); setAssessment(a.analysis ?? null); } catch { /* ignore */ }
    }
    setSelectedHistoryId(item.id);
    setShowHistory(false);
  };

  const handleStageSelect = (stageId: string) => {
    setActiveStage(stageId);
    setMobileSidebarOpen(false);
  };

  const StageList = () => (
    <div className="flex flex-col h-full">
      <div className="p-5 border-b border-border">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-base font-bold text-foreground">Project Genesis</h1>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowHistory(v => !v)} className="text-muted-foreground hover:text-foreground transition-colors">
              {showHistory ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {/* Close button on mobile */}
            <button onClick={() => setMobileSidebarOpen(false)} className="md:hidden text-muted-foreground hover:text-foreground transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">Assess a new idea end-to-end</p>
        <div className="mt-3 h-1.5 rounded-full bg-border overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(completedCount / STAGES.length) * 100}%` }} />
        </div>
        <p className="text-[11px] text-muted-foreground mt-1">{completedCount} of {STAGES.length} stages complete</p>
      </div>

      {/* History panel */}
      {showHistory && (
        <div className="border-b border-border bg-muted/30 p-3 space-y-1 max-h-48 overflow-y-auto">
          <button
            onClick={() => { setIdeaTitle(""); setAnswers({}); setAssessment(null); setSelectedHistoryId(null); setShowHistory(false); }}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors">
            <Plus className="h-3 w-3" /> New Assessment
          </button>
          {(history as any[]).map((item) => (
            <button key={item.id} onClick={() => loadHistory(item)}
              className={`w-full text-left px-2 py-1.5 rounded-lg text-xs transition-colors truncate ${selectedHistoryId === item.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-accent/50"}`}>
              {item.ideaTitle}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 p-3 space-y-1 overflow-y-auto">
        {STAGES.map((stage, i) => {
          const complete = stageComplete(stage.id);
          const isActive = activeStage === stage.id;
          return (
            <button key={stage.id} onClick={() => handleStageSelect(stage.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-accent/50"}`}>
              {complete ? (
                <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
              ) : (
                <div className={`h-4 w-4 rounded-full border-2 shrink-0 flex items-center justify-center text-[9px] font-bold ${isActive ? "border-primary text-primary" : "border-border text-muted-foreground"}`}>
                  {i + 1}
                </div>
              )}
              <p className="text-sm font-medium leading-none truncate">{stage.label}</p>
            </button>
          );
        })}
      </div>

      <div className="p-3 border-t border-border space-y-2">
        <Button variant="outline" className="w-full gap-2" size="sm" onClick={handleSave} disabled={saveMutation.isPending}>
          {saveMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
          Save Progress
        </Button>
        <Button className="w-full gap-2" size="sm" disabled={!allComplete || assessMutation.isPending} onClick={handleAssess}>
          {assessMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
          Generate Assessment
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-full min-h-screen bg-background">
      {/* Desktop sidebar — hidden on mobile */}
      <div className="hidden md:flex w-64 border-r border-border bg-background flex-col shrink-0">
        <StageList />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileSidebarOpen(false)} />
          {/* Drawer */}
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-background border-r border-border flex flex-col shadow-xl">
            <StageList />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 overflow-y-auto min-w-0">
        {/* Mobile header bar */}
        <div className="md:hidden sticky top-0 z-10 bg-background border-b border-border px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="flex items-center gap-2 text-sm font-medium text-foreground"
          >
            <Menu className="h-4 w-4" />
            <span>{STAGES.find(s => s.id === activeStage)?.label}</span>
          </button>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">{completedCount}/{STAGES.length} stages</span>
            <div className="w-16 h-1.5 rounded-full bg-border overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(completedCount / STAGES.length) * 100}%` }} />
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto p-4 sm:p-6 md:p-8">
          {activeStage === "concept" && (
            <div className="mb-8">
              <label className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Idea Name</label>
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
            <h2 className="text-2xl font-bold text-foreground mt-1">{STAGES.find((s) => s.id === activeStage)?.label}</h2>
            <p className="text-sm text-muted-foreground mt-1">{STAGES.find((s) => s.id === activeStage)?.description}</p>
          </div>

          <div className="space-y-6">
            {questions.map((q, i) => (
              <div key={i}>
                <label className="block text-sm font-medium text-foreground mb-2">{q}</label>
                <textarea
                  value={stageAnswers[i] || ""}
                  onChange={(e) => setAnswers((prev) => ({ ...prev, [activeStage]: { ...(prev[activeStage] || {}), [i]: e.target.value } }))}
                  rows={3}
                  placeholder="Your answer..."
                  className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none text-sm"
                />
              </div>
            ))}
          </div>

          {activeStage !== "execution" && (
            <div className="mt-8 flex justify-end">
              <Button onClick={() => { const idx = STAGES.findIndex((s) => s.id === activeStage); if (idx < STAGES.length - 1) setActiveStage(STAGES[idx + 1].id); }} className="gap-2">
                Next Stage <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Mobile action buttons */}
          <div className="md:hidden mt-8 space-y-2 pb-4">
            <Button variant="outline" className="w-full gap-2" size="sm" onClick={handleSave} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
              Save Progress
            </Button>
            <Button className="w-full gap-2" size="sm" disabled={!allComplete || assessMutation.isPending} onClick={handleAssess}>
              {assessMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
              Generate Assessment
            </Button>
          </div>

          {/* AI Assessment output */}
          {assessment && (
            <div className="mt-10 p-6 rounded-2xl border border-primary/20 bg-primary/5">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Victoria's Assessment</h3>
              </div>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <Streamdown>{assessment}</Streamdown>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
