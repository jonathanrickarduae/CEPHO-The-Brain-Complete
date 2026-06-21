import { FlaskConical, Plus, Lightbulb, ArrowRight, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

const PROJECT_COLORS: Record<string, string> = {
  Celadon: "bg-emerald-100 text-emerald-700",
  Celanova: "bg-violet-100 text-violet-700",
  Perfect: "bg-rose-100 text-rose-700",
  Olmack: "bg-amber-100 text-amber-700",
  Boundless: "bg-sky-100 text-sky-700",
  Personal: "bg-slate-100 text-slate-600",
};

const ideas = [
  { id: 1, title: "AI-powered site selection tool for Olmack", project: "Olmack", status: "exploring", stage: "Research", votes: 4, linked: true },
  { id: 2, title: "White-label Perfect for enterprise clients", project: "Perfect", status: "validated", stage: "Business Case", votes: 7, linked: false },
  { id: 3, title: "Celadon loyalty programme with blockchain rewards", project: "Celadon", status: "exploring", stage: "Concept", votes: 2, linked: false },
  { id: 4, title: "Celanova B2B distribution partnership model", project: "Celanova", status: "active", stage: "Pilot", votes: 9, linked: true },
  { id: 5, title: "Boundless subscription box for recurring revenue", project: "Boundless", status: "paused", stage: "Concept", votes: 3, linked: false },
  { id: 6, title: "Cross-company data intelligence layer", project: "Personal", status: "exploring", stage: "Research", votes: 6, linked: false },
];

const STATUS_STYLES: Record<string, string> = {
  exploring: "bg-amber-50 text-amber-600 border-amber-200",
  validated: "bg-sky-50 text-sky-600 border-sky-200",
  active: "bg-emerald-50 text-emerald-600 border-emerald-200",
  paused: "bg-slate-50 text-slate-500 border-slate-200",
};

export default function InnovationPage() {
  const [filter, setFilter] = useState("All");

  const filtered = ideas.filter((i) => filter === "All" || i.project === filter);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-display font-bold text-foreground">Innovation Hub</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Ideas and experiments across all companies</p>
        </div>
        <Button size="sm" className="gap-1.5 bg-primary hover:bg-primary/90">
          <Plus className="h-3.5 w-3.5" />
          New Idea
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Ideas", value: ideas.length, icon: Lightbulb },
          { label: "Active Pilots", value: ideas.filter(i => i.status === "active").length, icon: FlaskConical },
          { label: "Validated", value: ideas.filter(i => i.status === "validated").length, icon: CheckCircle },
          { label: "Linked to Projects", value: ideas.filter(i => i.linked).length, icon: ArrowRight },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border bg-card p-4">
            <stat.icon className="h-4 w-4 text-primary mb-2" />
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 flex-wrap mb-5">
        {["All", "Celadon", "Celanova", "Perfect", "Olmack", "Boundless", "Personal"].map((p) => (
          <button key={p} onClick={() => setFilter(p)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${filter === p ? "bg-primary text-white border-primary" : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"}`}>{p}</button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((idea) => (
          <div key={idea.id} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/30 transition-colors cursor-pointer">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Lightbulb className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{idea.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className={"text-[10px] px-1.5 py-0 " + (PROJECT_COLORS[idea.project] || "")}>{idea.project}</Badge>
                <span className={"text-[10px] px-2 py-0.5 rounded-full border font-medium " + (STATUS_STYLES[idea.status] || "")}>{idea.status}</span>
                <span className="text-[11px] text-muted-foreground">{idea.stage}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {idea.linked && <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">Linked</span>}
              <span className="text-xs text-muted-foreground">{idea.votes} votes</span>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
