import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ContentCalendar } from '@/components/integrations/ContentCalendar';
import { CustomerValidationScheduler } from '@/components/shared/CustomerValidationScheduler';
import { PageHeader } from '@/components/layout/PageHeader';
import { TrendingUp, Calendar, Users, Target } from 'lucide-react';

export default function GrowthPage() {
  const [activeTab, setActiveTab] = useState('content');

  return (
    <div className="min-h-screen bg-background">
      <PageHeader 
        icon={TrendingUp} 
        title="Growth & Marketing" 
        subtitle="Brand awareness, content strategy, and customer validation"
        iconColor="text-[#E91E8C]"
      />

      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="content" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Content Calendar
            </TabsTrigger>
            <TabsTrigger value="validation" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Customer Validation
            </TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="mt-6">
            <ContentCalendar />
          </TabsContent>

          <TabsContent value="validation" className="mt-6">
            <CustomerValidationScheduler />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
