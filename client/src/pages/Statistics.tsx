import DesktopLayout from "@/components/DesktopLayout";
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
  Cpu
} from "lucide-react";
import { motion } from "framer-motion";

export default function Statistics() {
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

  return (
    <DesktopLayout>
      <div className="max-w-6xl mx-auto h-full flex flex-col">
        <div className="mb-8">
          <h1 className="font-display font-bold text-3xl mb-2">System Statistics & Evolution</h1>
          <p className="text-muted-foreground">Self-Optimization Hub • <span className="text-primary">Learning Rate: 0.004</span></p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: KPIs */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* KPI Grid */}
            <div className="grid grid-cols-2 gap-4">
              {kpis.map((kpi) => (
                <div key={kpi.id} className="p-6 rounded-xl bg-white/5 border border-white/10 relative overflow-hidden group">
                  <div className={`absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity ${
                    kpi.status === "green" ? "text-green-500" : "text-amber-500"
                  }`}>
                    <kpi.icon className="w-12 h-12" />
                  </div>
                  <div className="relative z-10">
                    <p className="text-sm text-muted-foreground font-medium mb-1">{kpi.label}</p>
                    <h3 className="text-3xl font-bold font-display mb-2">{kpi.value}</h3>
                    <div className={`inline-flex items-center text-xs font-bold px-2 py-1 rounded ${
                      kpi.status === "green" ? "bg-green-500/10 text-green-500" : "bg-amber-500/10 text-amber-500"
                    }`}>
                      {kpi.change}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Performance Graph Placeholder */}
            <div className="p-6 rounded-xl bg-white/5 border border-white/10 h-64 flex flex-col justify-center items-center text-muted-foreground">
              <Activity className="w-12 h-12 mb-4 opacity-20" />
              <p>Real-time Neural Activity Graph</p>
              <p className="text-xs opacity-50">(Visualization Placeholder)</p>
            </div>
          </div>

          {/* Right Column: Self-Evolution */}
          <div className="lg:col-span-1">
            <div className="h-full rounded-xl bg-gradient-to-b from-purple-900/20 to-black border border-purple-500/20 p-6 flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center animate-pulse">
                  <Brain className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Self-Evolution</h3>
                  <p className="text-xs text-muted-foreground">System Upgrades</p>
                </div>
              </div>

              <div className="space-y-4 flex-1">
                {evolutionTasks.map((task) => (
                  <div key={task.id} className="p-4 rounded-lg bg-black/40 border border-white/10 hover:border-purple-500/50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-sm">{task.title}</h4>
                      <span className="text-[10px] bg-white/10 px-2 py-1 rounded text-muted-foreground">{task.status}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">{task.desc}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-purple-400 flex items-center gap-1">
                        <Cpu className="w-3 h-3" /> {task.cost}
                      </span>
                      <Button size="sm" variant="ghost" className="h-6 text-xs hover:text-purple-400">
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
    </DesktopLayout>
  );
}
