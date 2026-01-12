import { useState } from 'react';
import { Mail, Calendar, CheckSquare, ExternalLink, Check, X, Loader2, RefreshCw, Settings, Unlink } from 'lucide-react';
import { Button } from './ui/button';
import { trpc } from '@/lib/trpc';

// Integration types
type IntegrationType = 'email_outlook' | 'email_gmail' | 'calendar_outlook' | 'calendar_google' | 'asana' | 'whatsapp';

interface Integration {
  id: string;
  type: IntegrationType;
  name: string;
  description: string;
  icon: React.ReactNode;
  connected: boolean;
  lastSync?: Date;
  accountName?: string;
  features: string[];
}

// OAuth URLs (placeholders - would be configured in backend)
const OAUTH_URLS: Record<IntegrationType, string> = {
  email_outlook: '/api/integrations/oauth/outlook',
  email_gmail: '/api/integrations/oauth/gmail',
  calendar_outlook: '/api/integrations/oauth/outlook-calendar',
  calendar_google: '/api/integrations/oauth/google-calendar',
  asana: '/api/integrations/oauth/asana',
  whatsapp: '/api/integrations/whatsapp/setup',
};

// Hook for managing integrations
export function useIntegrations() {
  const { data: integrations, refetch, isLoading } = trpc.integrations.list.useQuery();
  
  const connectMutation = trpc.integrations.connect.useMutation({
    onSuccess: () => refetch(),
  });

  const disconnectMutation = trpc.integrations.disconnect.useMutation({
    onSuccess: () => refetch(),
  });

  const syncMutation = trpc.integrations.sync.useMutation({
    onSuccess: () => refetch(),
  });

  return {
    integrations: integrations ?? [],
    isLoading,
    connect: connectMutation.mutate,
    disconnect: disconnectMutation.mutate,
    sync: syncMutation.mutate,
    refetch,
  };
}

// Individual integration card
interface IntegrationCardProps {
  integration: Integration;
  onConnect: () => void;
  onDisconnect: () => void;
  onSync: () => void;
  isConnecting?: boolean;
  isSyncing?: boolean;
}

function IntegrationCard({ 
  integration, 
  onConnect, 
  onDisconnect, 
  onSync,
  isConnecting,
  isSyncing 
}: IntegrationCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className={`p-4 border rounded-xl transition-all ${
      integration.connected 
        ? 'border-green-500/30 bg-green-500/5' 
        : 'border-border bg-card hover:border-primary/30'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className={`p-2.5 rounded-lg ${
            integration.connected ? 'bg-green-500/20' : 'bg-secondary'
          }`}>
            {integration.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-foreground">{integration.name}</h4>
              {integration.connected && (
                <span className="flex items-center gap-1 text-xs text-green-400">
                  <Check className="w-3 h-3" />
                  Connected
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">{integration.description}</p>
            {integration.connected && integration.accountName && (
              <p className="text-xs text-muted-foreground mt-1">
                Account: {integration.accountName}
              </p>
            )}
            {integration.connected && integration.lastSync && (
              <p className="text-xs text-muted-foreground">
                Last synced: {new Date(integration.lastSync).toLocaleString()}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {integration.connected ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={onSync}
                disabled={isSyncing}
                className="h-8"
              >
                {isSyncing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
                className="h-8"
              >
                <Settings className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onDisconnect}
                className="h-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
              >
                <Unlink className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              onClick={onConnect}
              disabled={isConnecting}
              className="h-8"
            >
              {isConnecting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <ExternalLink className="w-4 h-4 mr-2" />
              )}
              Connect
            </Button>
          )}
        </div>
      </div>

      {/* Features list */}
      {showDetails && integration.connected && (
        <div className="mt-4 pt-4 border-t border-border">
          <h5 className="text-sm font-medium text-foreground mb-2">Features enabled:</h5>
          <ul className="space-y-1">
            {integration.features.map((feature, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="w-3 h-3 text-green-400" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// Email Integration Panel
export function EmailIntegrationPanel() {
  const [connectingType, setConnectingType] = useState<IntegrationType | null>(null);
  const { integrations, connect, disconnect, sync } = useIntegrations();

  const emailIntegrations: Integration[] = [
    {
      id: 'outlook',
      type: 'email_outlook',
      name: 'Microsoft Outlook',
      description: 'Connect your Outlook inbox for unified email management',
      icon: <Mail className="w-5 h-5 text-blue-400" />,
      connected: integrations.some(i => i.provider === 'email_outlook' && i.status === 'active'),
      accountName: integrations.find(i => i.provider === 'email_outlook')?.providerAccountId ?? undefined,
      lastSync: integrations.find(i => i.provider === 'email_outlook')?.lastSyncAt ?? undefined,
      features: [
        'Read and send emails from Cepho',
        'Auto-categorize incoming messages',
        'Smart reply suggestions',
        'Meeting scheduling from emails',
      ],
    },
    {
      id: 'gmail',
      type: 'email_gmail',
      name: 'Google Gmail',
      description: 'Connect your Gmail account for unified inbox',
      icon: <Mail className="w-5 h-5 text-red-400" />,
      connected: integrations.some(i => i.provider === 'email_gmail' && i.status === 'active'),
      accountName: integrations.find(i => i.provider === 'email_gmail')?.providerAccountId ?? undefined,
      lastSync: integrations.find(i => i.provider === 'email_gmail')?.lastSyncAt ?? undefined,
      features: [
        'Read and send emails from Cepho',
        'Auto-categorize incoming messages',
        'Smart reply suggestions',
        'Label and filter management',
      ],
    },
  ];

  const handleConnect = (type: IntegrationType) => {
    setConnectingType(type);
    // In production, this would open OAuth popup
    window.open(OAUTH_URLS[type], '_blank', 'width=600,height=700');
    // Simulate connection for demo
    setTimeout(() => {
      connect({ type, config: {} });
      setConnectingType(null);
    }, 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Mail className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Email Integrations</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Connect your email accounts to manage all communications from Cepho's Universal Inbox.
      </p>
      <div className="space-y-3">
        {emailIntegrations.map(integration => (
          <IntegrationCard
            key={integration.id}
            integration={integration}
            onConnect={() => handleConnect(integration.type)}
            onDisconnect={() => disconnect({ type: integration.type })}
            onSync={() => sync({ type: integration.type })}
            isConnecting={connectingType === integration.type}
          />
        ))}
      </div>
    </div>
  );
}

// Calendar Integration Panel
export function CalendarIntegrationPanel() {
  const [connectingType, setConnectingType] = useState<IntegrationType | null>(null);
  const { integrations, connect, disconnect, sync } = useIntegrations();

  const calendarIntegrations: Integration[] = [
    {
      id: 'outlook-calendar',
      type: 'calendar_outlook',
      name: 'Microsoft Outlook Calendar',
      description: 'Sync your Outlook calendar for scheduling and reminders',
      icon: <Calendar className="w-5 h-5 text-blue-400" />,
      connected: integrations.some(i => i.provider === 'calendar_outlook' && i.status === 'active'),
      accountName: integrations.find(i => i.provider === 'calendar_outlook')?.providerAccountId ?? undefined,
      lastSync: integrations.find(i => i.provider === 'calendar_outlook')?.lastSyncAt ?? undefined,
      features: [
        'View all calendar events in The Signal',
        'Auto-schedule meetings from emails',
        'Meeting prep reminders',
        'Conflict detection',
      ],
    },
    {
      id: 'google-calendar',
      type: 'calendar_google',
      name: 'Google Calendar',
      description: 'Sync your Google Calendar for unified scheduling',
      icon: <Calendar className="w-5 h-5 text-green-400" />,
      connected: integrations.some(i => i.provider === 'calendar_google' && i.status === 'active'),
      accountName: integrations.find(i => i.provider === 'calendar_google')?.providerAccountId ?? undefined,
      lastSync: integrations.find(i => i.provider === 'calendar_google')?.lastSyncAt ?? undefined,
      features: [
        'View all calendar events in The Signal',
        'Auto-schedule meetings from emails',
        'Meeting prep reminders',
        'Multi-calendar support',
      ],
    },
  ];

  const handleConnect = (type: IntegrationType) => {
    setConnectingType(type);
    window.open(OAUTH_URLS[type], '_blank', 'width=600,height=700');
    setTimeout(() => {
      connect({ type, config: {} });
      setConnectingType(null);
    }, 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Calendar Integrations</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Connect your calendars to see events in your The Signal and enable smart scheduling.
      </p>
      <div className="space-y-3">
        {calendarIntegrations.map(integration => (
          <IntegrationCard
            key={integration.id}
            integration={integration}
            onConnect={() => handleConnect(integration.type)}
            onDisconnect={() => disconnect({ type: integration.type })}
            onSync={() => sync({ type: integration.type })}
            isConnecting={connectingType === integration.type}
          />
        ))}
      </div>
    </div>
  );
}

// Asana Integration Panel
export function AsanaIntegrationPanel() {
  const [isConnecting, setIsConnecting] = useState(false);
  const { integrations, connect, disconnect, sync } = useIntegrations();

  const asanaIntegration: Integration = {
    id: 'asana',
    type: 'asana',
    name: 'Asana',
    description: 'Connect Asana for project and task management',
    icon: <CheckSquare className="w-5 h-5 text-pink-400" />,
    connected: integrations.some(i => i.provider === 'asana' && i.status === 'active'),
    accountName: integrations.find(i => i.provider === 'asana')?.providerAccountId ?? undefined,
    lastSync: integrations.find(i => i.provider === 'asana')?.lastSyncAt ?? undefined,
    features: [
      'Sync tasks to Cepho workflow',
      'Create Asana tasks from Cepho',
      'Project status updates',
      'Team collaboration visibility',
      'Due date and priority sync',
    ],
  };

  const handleConnect = () => {
    setIsConnecting(true);
    window.open(OAUTH_URLS.asana, '_blank', 'width=600,height=700');
    setTimeout(() => {
      connect({ type: 'asana', config: {} });
      setIsConnecting(false);
    }, 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <CheckSquare className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Asana Integration</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Connect Asana to sync your projects and tasks with Cepho's workflow system.
      </p>
      <IntegrationCard
        integration={asanaIntegration}
        onConnect={handleConnect}
        onDisconnect={() => disconnect({ type: 'asana' })}
        onSync={() => sync({ type: 'asana' })}
        isConnecting={isConnecting}
      />
    </div>
  );
}

// Combined Integrations Dashboard
export function IntegrationsDashboard() {
  return (
    <div className="space-y-8">
      <EmailIntegrationPanel />
      <CalendarIntegrationPanel />
      <AsanaIntegrationPanel />
    </div>
  );
}
