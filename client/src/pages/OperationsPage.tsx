import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NPSSurvey, NPSStatsDashboard } from '@/components/shared/NPSSurvey';
import { PartnershipPipeline } from '@/components/communication/PartnershipPipeline';
import { TeamCapabilityMatrix } from '@/components/team-management/TeamCapabilityMatrix';
import { CommandCentre } from '@/components/operations/CommandCentre';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Handshake, TrendingUp, BarChart3 } from 'lucide-react';

export default function OperationsPage() {
  const [activeTab, setActiveTab] = useState('command');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-[#E91E8C]" />
              Chief of Staff Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Command centre for project oversight, team performance, and strategic operations
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-muted/50 p-1">
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

          <TabsContent value="command" className="mt-6">
            <CommandCentre />
          </TabsContent>

          <TabsContent value="nps" className="mt-6 space-y-6">
            <NPSStatsDashboard />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Collect Feedback</CardTitle>
                </CardHeader>
                <CardContent>
                  <NPSSurvey touchpoint="operations_dashboard" />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">NPS Best Practices</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                    <h4 className="font-medium text-green-500 mb-2">Promoters (9-10)</h4>
                    <p className="text-sm text-muted-foreground">
                      Ask for referrals, testimonials, and case studies. These customers are your advocates.
                    </p>
                  </div>
                  <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                    <h4 className="font-medium text-yellow-500 mb-2">Passives (7-8)</h4>
                    <p className="text-sm text-muted-foreground">
                      Identify what would make them promoters. They are satisfied but not enthusiastic.
                    </p>
                  </div>
                  <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                    <h4 className="font-medium text-red-500 mb-2">Detractors (0-6)</h4>
                    <p className="text-sm text-muted-foreground">
                      Follow up immediately. Understand pain points and work to resolve issues.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="partnerships" className="mt-6">
            <PartnershipPipeline />
          </TabsContent>

          <TabsContent value="team" className="mt-6">
            <TeamCapabilityMatrix />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
