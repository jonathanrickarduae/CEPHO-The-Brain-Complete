import { Button } from "@/components/ui/button";
import { 
  Activity, 
  TrendingUp, 
  Zap, 
  Brain, 
  Server, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  ArrowUpRight,
  Cpu,
  Target,
  Sparkles,
  Calendar
} from "lucide-react";
import { PersonalAnalytics, ProductivityRing } from "@/components/PersonalAnalytics";
import { PageHeader } from "@/components/Breadcrumbs";
import { useMoodCheck } from "@/hooks/useMoodCheck";
import { MoodTimeline } from "@/components/MoodTimeline";
import { WellnessScoreDashboard } from "@/components/WellnessScoreDashboard";
import { ShareableInsight, generateProductivityInsight } from "@/components/ShareableInsight";
import { CollapsibleSection } from "@/components/CollapsibleSection";

export default function Statistics() {
  const { todaysMoods } = useMoodCheck();
  
  const kpis = [
    { id: 1, label: "Productivity Score", value: "94%", change: "+2.4%", status: "green", icon: Activity },
    { id: 2, label: "Task Completion", value: "12/15", change: "On Track", status: "green", icon: CheckCircle2 },
    { id: 3, label: "Focus Time", value: "4h 12m", change: "-15m", status: "amber", icon: Clock },
    { id: 4, label: "System Latency", value: "12ms", change: "Optimal", status: "green", icon: Zap },
  ];

  const evolutionTasks = [
    { id: 1, title: "Upgrade Context Window", desc: "Expand memory to 128k tokens for deeper analysis.", cost: "High Compute", status: "Recommended" },
    { id: 2, title: "Integrate Bloomberg Terminal", desc: "Real-time financial data ingestion for better insights.", cost: "API Key Req", status: "Pending" },
    { id: 3, title: "Optimize Neural Pathways", desc: "Refine decision trees based on last week's feedback.", cost: "Auto-Scheduled", status: "In Progress" },
  ];

  // Weekly mood data (mock)
  const weeklyMoods = [70, 80, 60, 70, 90, 80, todaysMoods.length > 0 ? todaysMoods[todaysMoods.length - 1].mood : 70]; // 0-100 scale

  return (
    <div className="p-4 md:p-6 overflow-auto">
      <div className="max-w-6xl mx-auto">
        <PageHeader 
          title="Statistics & Analytics" 
          subtitle="Personal performance metrics and system evolution"
        />

        {/* Personal Analytics Section */}
        <CollapsibleSection 
          title="Personal Analytics" 
          icon={<Activity className="w-5 h-5" />}
          defaultOpen={true}
          className="mb-6"
        >
          <PersonalAnalytics variant="full" />
        </CollapsibleSection>

        {/* Wellness Score Dashboard */}
        <CollapsibleSection 
          title="Wellness Score" 
          icon={<Target className="w-5 h-5" />}
          defaultOpen={true}
          className="mb-6"
        >
          <WellnessScoreDashboard />
        </CollapsibleSection>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: KPIs */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* KPI Grid */}
            <CollapsibleSection 
              title="Key Performance Indicators" 
              icon={<TrendingUp className="w-5 h-5" />}
              defaultOpen={true}
              className="mb-6"
            >
            <div className="grid grid-cols-2 gap-4">
              {kpis.map((kpi) => (
                <div key={kpi.id} className="p-6 rounded-xl bg-card/60 border border-white/10 relative overflow-hidden group">
                  <div className={`absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity ${
                    kpi.status === "green" ? "text-green-500" : "text-amber-500"
                  }`}>
                    <kpi.icon className="w-12 h-12" />
                  </div>
                  <div className="relative z-10">
                    <p className="text-sm text-muted-foreground font-medium mb-1">{kpi.label}</p>
                    <h3 className="text-3xl font-bold font-display mb-2 text-foreground">{kpi.value}</h3>
                    <div className={`inline-flex items-center text-xs font-bold px-2 py-1 rounded ${
                      kpi.status === "green" ? "bg-green-500/10 text-green-500" : "bg-amber-500/10 text-amber-500"
                    }`}>
                      {kpi.change}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            </CollapsibleSection>

            {/* Mood Timeline - Real Data */}
            <CollapsibleSection 
              title="Mood Timeline" 
              icon={<Calendar className="w-5 h-5" />}
              defaultOpen={true}
              className="mb-6"
            >
              <MoodTimeline days={7} />
            </CollapsibleSection>

            {/* Chief of Staff Training Progress */}
            <CollapsibleSection 
              title="Chief of Staff Training" 
              icon={<Brain className="w-5 h-5" />}
              defaultOpen={true}
            >
            <div className="p-6 rounded-xl bg-card/60 border border-white/10">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="w-5 h-5 text-cyan-400" />
                <h3 className="font-display font-bold">Chief of Staff Training</h3>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center p-4 rounded-lg bg-secondary/30">
                  <p className="text-2xl font-bold text-foreground">42h</p>
                  <p className="text-xs text-muted-foreground">Total Training</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-secondary/30">
                  <p className="text-2xl font-bold text-foreground">247</p>
                  <p className="text-xs text-muted-foreground">Patterns Learned</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-secondary/30">
                  <p className="text-2xl font-bold text-foreground">35%</p>
                  <p className="text-xs text-muted-foreground">Autonomy Level</p>
                </div>
              </div>
              
              {/* Progress to next level */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Progress to 50% Autonomy</span>
                  <span className="text-primary">15h remaining</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-cyan-500 to-primary w-[70%] rounded-full" />
                </div>
              </div>
            </div>
            </CollapsibleSection>
          </div>

          {/* Right Column: Self-Evolution */}
          <div className="lg:col-span-1">
            <div className="h-full rounded-xl bg-gradient-to-b from-purple-900/20 to-card/60 border border-purple-500/20 p-6 flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center animate-pulse">
                  <Brain className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-foreground">Self-Evolution</h3>
                  <p className="text-xs text-muted-foreground">System Upgrades</p>
                </div>
              </div>

              <div className="space-y-4 flex-1">
                {evolutionTasks.map((task) => (
                  <div key={task.id} className="p-4 rounded-lg bg-card/40 border border-white/10 hover:border-purple-500/50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-sm text-foreground">{task.title}</h4>
                      <span className="text-[10px] bg-white/10 px-2 py-1 rounded text-muted-foreground">{task.status}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">{task.desc}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-purple-400 flex items-center gap-1">
                        <Cpu className="w-3 h-3" /> {task.cost}
                      </span>
                      <Button size="sm" variant="ghost" className="h-6 text-xs hover:text-purple-400 min-h-0">
                        Approve <ArrowUpRight className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-white/10 text-center">
                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                  <Server className="w-4 h-4 mr-2" /> Run System Diagnostics
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
