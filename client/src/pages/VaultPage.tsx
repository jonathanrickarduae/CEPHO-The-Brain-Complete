import { Lock, Brain, TrendingUp, MessageSquare, BookOpen, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const learnings = [
  { id: 1, category: "Decision Pattern", text: "Consistently delays equity decisions until external pressure forces action. Recommend earlier structured review.", date: "18 Jun", source: "Decisions Log" },
  { id: 2, category: "Communication Style", text: "Prefers direct, data-first briefings. Responds poorly to hedged language. Victoria should lead with numbers.", date: "15 Jun", source: "Signal interactions" },
  { id: 3, category: "Risk Appetite", text: "Higher risk tolerance on technology bets than on people decisions. Slower to act on underperformance.", date: "12 Jun", source: "Project reviews" },
  { id: 4, category: "Strategic Priority", text: "Celadon is the primary focus. All other companies are secondary when Celadon requires attention.", date: "10 Jun", source: "Calendar patterns" },
  { id: 5, category: "Working Pattern", text: "Most productive decisions made before 10am. Afternoon sessions tend toward deferral. Schedule critical reviews in the morning.", date: "8 Jun", source: "Task completion data" },
];

const scores = [
  { label: "Strategic Clarity", value: 78, trend: "+4" },
  { label: "Decision Velocity", value: 62, trend: "-2" },
  { label: "Execution Follow-through", value: 71, trend: "+7" },
  { label: "Risk Management", value: 84, trend: "+1" },
  { label: "Delegation Effectiveness", value: 55, trend: "+9" },
];

export default function VaultPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Lock className="h-4 w-4 text-primary" />
          </div>
          <h1 className="text-xl font-display font-bold text-foreground">The Vault</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Constant learning engine. Every decision, pattern, and insight captured and used to improve performance over time.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Digital Twin Scores */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Digital Twin · Performance Scores</h2>
          </div>
          <div className="space-y-3">
            {scores.map((s) => (
              <div key={s.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">{s.label}</span>
                  <div className="flex items-center gap-2">
                    <span className={"text-[10px] font-medium " + (s.trend.startsWith("+") ? "text-emerald-600" : "text-red-500")}>{s.trend}</span>
                    <span className="text-xs font-bold text-foreground">{s.value}</span>
                  </div>
                </div>
                <div className="h-1.5 rounded-full bg-border overflow-hidden">
                  <div className={"h-full rounded-full transition-all " + (s.value >= 75 ? "bg-emerald-500" : s.value >= 60 ? "bg-amber-500" : "bg-red-500")} style={{ width: s.value + "%" }} />
                </div>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground mt-4">Scores update as new decisions and outcomes are captured. Last updated: today.</p>
        </div>

        {/* Learning stats */}
        <div className="space-y-3">
          {[
            { icon: BookOpen, label: "Decisions Captured", value: "47", sub: "Since inception" },
            { icon: MessageSquare, label: "Interactions Analysed", value: "1,203", sub: "Victoria conversations" },
            { icon: Zap, label: "Patterns Identified", value: "23", sub: "Behavioural insights" },
            { icon: TrendingUp, label: "Accuracy Improving", value: "+12%", sub: "Month on month" },
          ].map((stat) => (
            <div key={stat.label} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <stat.icon className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="text-sm font-bold text-foreground">{stat.value}</p>
              </div>
              <span className="text-[10px] text-muted-foreground">{stat.sub}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent learnings */}
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-3">Recent Learnings</h2>
        <div className="space-y-2">
          {learnings.map((l) => (
            <div key={l.id} className="p-4 rounded-xl border border-border bg-card">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-primary/5 text-primary border-primary/20">{l.category}</Badge>
                    <span className="text-[10px] text-muted-foreground">{l.source}</span>
                  </div>
                  <p className="text-sm text-foreground">{l.text}</p>
                </div>
                <span className="text-[11px] text-muted-foreground shrink-0">{l.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
