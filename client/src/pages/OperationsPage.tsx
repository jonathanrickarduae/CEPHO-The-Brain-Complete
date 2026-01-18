import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NPSSurvey } from '@/components/NPSSurvey';
import { PartnershipPipeline } from '@/components/PartnershipPipeline';
import { TeamCapabilityMatrix } from '@/components/TeamCapabilityMatrix';
import { PageHeader } from '@/components/PageHeader';
import { Users, Handshake, TrendingUp, BarChart3 } from 'lucide-react';

export default function OperationsPage() {
  const [activeTab, setActiveTab] = useState('nps');

  return (
    <div className="min-h-screen bg-background">
      <PageHeader 
        icon={BarChart3} 
        title="Operations" 
        subtitle="Customer success, partnerships, and team capabilities"
        iconColor="text-[#E91E8C]"
      />

      {/* Content */}
      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-muted/50 p-1">
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

          <TabsContent value="nps" className="mt-6">
            <NPSSurvey />
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
