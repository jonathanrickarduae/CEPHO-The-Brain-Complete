import BrainLayout from '../components/BrainLayout';
import { IntegrationsDashboard } from '../components/IntegrationOAuth';
import { Link2, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useLocation } from 'wouter';

export default function IntegrationsPage() {
  const [, setLocation] = useLocation();

  return (
    
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => setLocation('/settings')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Settings
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Link2 className="w-8 h-8 text-primary" />
            Integrations
          </h1>
          <p className="text-muted-foreground mt-2">
            Connect your email, calendar, and productivity tools to centralize everything in Cepho.
          </p>
        </div>

        <IntegrationsDashboard />

        {/* Integration Status Summary */}
        <div className="mt-8 p-4 border border-border rounded-xl bg-card">
          <h3 className="font-medium text-foreground mb-3">How Integrations Work</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              <strong className="text-foreground">Email:</strong> Once connected, emails sync automatically to your Universal Inbox. 
              You can read, reply, and manage emails without leaving Cepho.
            </p>
            <p>
              <strong className="text-foreground">Calendar:</strong> Your events appear in The Signal and can be used for 
              smart scheduling and meeting prep.
            </p>
            <p>
              <strong className="text-foreground">Asana:</strong> Tasks sync both ways - create tasks in Cepho that appear 
              in Asana, and vice versa.
            </p>
          </div>
        </div>
      </div>
    
  );
}
