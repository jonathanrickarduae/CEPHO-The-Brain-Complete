import { useState } from "react";
import { Fingerprint, Brain, CheckCircle2, XCircle, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function DigitalTwin() {
  const [autonomyLevel, setAutonomyLevel] = useState(35);
  const [hoursLearned, setHoursLearned] = useState(42);

  return (
    <div className="min-h-screen bg-black p-8 text-white">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-purple-500/20 border border-purple-500/30">
            <Fingerprint className="w-12 h-12 text-purple-400" />
          </div>
          <div>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
              DIGITAL TWIN
            </h1>
            <p className="text-xl text-white/60">Training & Autonomy Center</p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white/60 text-sm uppercase tracking-wider">Autonomy Level</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-bold text-purple-400 mb-4">{autonomyLevel}%</div>
              <Progress value={autonomyLevel} className="h-2 bg-white/10 [&>div]:bg-purple-500" />
              <p className="text-xs text-white/40 mt-4">Target: 85% for full delegation</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white/60 text-sm uppercase tracking-wider">Hours Learned</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-bold text-pink-400 mb-4">{hoursLearned}</div>
              <p className="text-xs text-white/40">Total decision patterns analyzed</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white/60 text-sm uppercase tracking-wider">Active Models</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs border border-purple-500/30">Email Tone</span>
                <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs border border-purple-500/30">Scheduling</span>
                <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs border border-purple-500/30">Risk Assessment</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Brain className="w-6 h-6 text-purple-400" />
              Active Training
            </h2>
            
            <Card className="bg-white/5 border-white/10 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-4">Scenario #128: Client Negotiation</h3>
                <p className="text-white/80 mb-6 italic">"A long-term client asks for a 15% discount on renewal due to budget cuts. How do you respond?"</p>
                
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start h-auto py-4 border-white/10 hover:bg-purple-500/10 hover:border-purple-500/50 group">
                    <div className="flex items-start gap-3 text-left">
                      <div className="mt-1 w-5 h-5 rounded-full border border-white/30 group-hover:border-purple-500 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-purple-500 opacity-0 group-hover:opacity-100"></div>
                      </div>
                      <div>
                        <span className="font-bold block mb-1">Option A: Value Add</span>
                        <span className="text-sm text-white/60">Decline discount, but offer 2 months free service extension.</span>
                      </div>
                    </div>
                  </Button>

                  <Button variant="outline" className="w-full justify-start h-auto py-4 border-white/10 hover:bg-purple-500/10 hover:border-purple-500/50 group">
                    <div className="flex items-start gap-3 text-left">
                      <div className="mt-1 w-5 h-5 rounded-full border border-white/30 group-hover:border-purple-500 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-purple-500 opacity-0 group-hover:opacity-100"></div>
                      </div>
                      <div>
                        <span className="font-bold block mb-1">Option B: Conditional Discount</span>
                        <span className="text-sm text-white/60">Agree to 10% discount in exchange for 2-year contract.</span>
                      </div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-pink-400" />
              Performance Log
            </h2>
            
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <div>
                      <h4 className="font-bold text-sm">Email Draft Approved</h4>
                      <p className="text-xs text-white/40">Yesterday • 98% Match</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-green-400">+0.5% Autonomy</span>
                </div>
              ))}
              
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <XCircle className="w-5 h-5 text-red-500" />
                  <div>
                    <h4 className="font-bold text-sm">Meeting Schedule Rejected</h4>
                    <p className="text-xs text-white/40">2 days ago • Context Missing</p>
                  </div>
                </div>
                <span className="text-xs font-mono text-red-400">Correction Logged</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
