import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NPSSurvey, NPSStatsDashboard } from "@/components/shared/NPSSurvey";
import { PartnershipPipeline } from "@/components/communication/PartnershipPipeline";
import { TeamCapabilityMatrix } from "@/components/team-management/TeamCapabilityMatrix";
import { CommandCentre } from "@/components/operations/CommandCentre";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Handshake, TrendingUp, BarChart3 } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";

export default function OperationsPage() {
  const [activeTab, setActiveTab] = useState("command");

  return (
    <PageShell
      icon={BarChart3}
      iconClass="bg-blue-500/15 text-blue-400"
      title="Operations Dashboard"
      subtitle="Command centre for project oversight, team performance, and strategic operations"
    >
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="bg-muted/50 p-1 flex-wrap h-auto gap-1">
          <TabsTrigger value="command" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Command Centre
          </TabsTrigger>
          <TabsTrigger value="nps" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            NPS Tracking
          </TabsTrigger>
          <TabsTrigger value="partnerships" className="flex items-center gap-2">
            <Handshake className="w-4 h-4" />
            Partnerships
          </TabsTrigger>
          <TabsTrigger value="team" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Team Capabilities
          </TabsTrigger>
        </TabsList>

        <TabsContent value="command">
          <CommandCentre />
        </TabsContent>

        <TabsContent value="nps" className="space-y-5">
          <NPSStatsDashboard />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Collect Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                <NPSSurvey touchpoint="operations_dashboard" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">NPS Best Practices</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                  <h4 className="text-sm font-medium text-green-500 mb-1">
                    Promoters (9–10)
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Ask for referrals, testimonials, and case studies. These
                    customers are your advocates.
                  </p>
                </div>
                <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                  <h4 className="text-sm font-medium text-yellow-500 mb-1">
                    Passives (7–8)
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Identify what would make them promoters. They are satisfied
                    but not enthusiastic.
                  </p>
                </div>
                <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                  <h4 className="text-sm font-medium text-red-500 mb-1">
                    Detractors (0–6)
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Follow up immediately. Understand pain points and work to
                    resolve issues.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="partnerships">
          <PartnershipPipeline />
        </TabsContent>

        <TabsContent value="team">
          <TeamCapabilityMatrix />
        </TabsContent>
      </Tabs>
    </PageShell>
  );
}
