import { Activity, AlertTriangle, CheckCircle2, Clock, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function Workflow() {
  return (
    <div className="min-h-screen bg-black p-8 text-white">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-red-500/20 border border-red-500/30">
            <Activity className="w-12 h-12 text-red-400" />
          </div>
          <div>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-600">
              WORKFLOW RADAR
            </h1>
            <p className="text-xl text-white/60">Mission Control & Risk Analysis</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Risk Radar Column */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-red-400" />
              Active Risks
            </h2>

            <Card className="bg-red-950/20 border-red-500/30 overflow-hidden relative">
              <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">Project Alpha Launch</h3>
                    <p className="text-red-300 text-sm">Deadline: Tomorrow, 9:00 AM</p>
                  </div>
                  <Badge variant="destructive" className="animate-pulse">CRITICAL</Badge>
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-sm text-white/80">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <span>Legal approval pending for T&C update.</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-white/80">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <span>Marketing assets incomplete.</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button className="bg-red-600 hover:bg-red-700 text-white">
                    Escalate to Legal
                  </Button>
                  <Button variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10">
                    View Timeline
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-orange-950/20 border-orange-500/30 overflow-hidden relative">
              <div className="absolute top-0 left-0 w-1 h-full bg-orange-500"></div>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">Q3 Hiring Plan</h3>
                    <p className="text-orange-300 text-sm">Deadline: Friday</p>
                  </div>
                  <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">AT RISK</Badge>
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-sm text-white/80">
                    <Clock className="w-4 h-4 text-orange-400" />
                    <span>Budget approval delayed by Finance.</span>
                  </div>
                </div>

                <Button variant="outline" className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10">
                  Send Reminder
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Project Status Column */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-green-400" />
              On Track
            </h2>

            <div className="space-y-4">
              {[
                { name: "Website Redesign", status: "Dev Phase", progress: 75 },
                { name: "Client Onboarding", status: "Docs Signed", progress: 90 },
                { name: "Team Retreat", status: "Booked", progress: 100 },
              ].map((project, i) => (
                <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group cursor-pointer">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-bold text-white">{project.name}</h4>
                    <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white transition-colors" />
                  </div>
                  <div className="flex justify-between items-center text-xs text-white/60 mb-2">
                    <span>{project.status}</span>
                    <span>{project.progress}%</span>
                  </div>
                  <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500" 
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
