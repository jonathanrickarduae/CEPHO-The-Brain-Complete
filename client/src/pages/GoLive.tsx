import { useState } from 'react';
import { 
  Rocket, Check, Circle, ExternalLink, ChevronRight, 
  Calendar, Mail, Video, MessageSquare, FileText, CreditCard,
  Globe, Bell, Lock, Database, Zap, ArrowRight
} from 'lucide-react';
import { PageHeader } from '@/components/layout/Breadcrumbs';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  category: 'essential' | 'recommended' | 'optional';
  status: 'not_started' | 'in_progress' | 'completed' | 'skipped';
  setupUrl?: string;
  envKeys: string[];
  instructions: string[];
}

const integrations: Integration[] = [
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    description: 'Sync events and enable smart scheduling',
    icon: Calendar,
    category: 'essential',
    status: 'not_started',
    setupUrl: 'https://console.cloud.google.com/apis/credentials',
    envKeys: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'],
    instructions: [
      'Go to Google Cloud Console',
      'Create a new project or select existing',
      'Enable Google Calendar API',
      'Create OAuth 2.0 credentials',
      'Add authorized redirect URIs',
      'Copy Client ID and Client Secret'
    ]
  },
  {
    id: 'google-gmail',
    name: 'Gmail',
    description: 'AI email drafts and inbox management',
    icon: Mail,
    category: 'essential',
    status: 'not_started',
    setupUrl: 'https://console.cloud.google.com/apis/credentials',
    envKeys: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'],
    instructions: [
      'Use same Google Cloud project',
      'Enable Gmail API',
      'Add Gmail scopes to OAuth consent',
      'Credentials are shared with Calendar'
    ]
  },
  {
    id: 'microsoft-outlook',
    name: 'Microsoft Outlook',
    description: 'Calendar and email for Microsoft users',
    icon: Mail,
    category: 'recommended',
    status: 'not_started',
    setupUrl: 'https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps',
    envKeys: ['MICROSOFT_CLIENT_ID', 'MICROSOFT_CLIENT_SECRET'],
    instructions: [
      'Go to Azure Portal > App Registrations',
      'Register a new application',
      'Add Microsoft Graph API permissions',
      'Create client secret',
      'Configure redirect URIs'
    ]
  },
  {
    id: 'zoom',
    name: 'Zoom',
    description: 'Meeting scheduling and integration',
    icon: Video,
    category: 'recommended',
    status: 'not_started',
    setupUrl: 'https://marketplace.zoom.us/develop/create',
    envKeys: ['ZOOM_CLIENT_ID', 'ZOOM_CLIENT_SECRET'],
    instructions: [
      'Go to Zoom App Marketplace',
      'Create a new OAuth app',
      'Add required scopes (meeting:write)',
      'Set redirect URL',
      'Copy credentials'
    ]
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Team notifications and commands',
    icon: MessageSquare,
    category: 'recommended',
    status: 'not_started',
    setupUrl: 'https://api.slack.com/apps',
    envKeys: ['SLACK_CLIENT_ID', 'SLACK_CLIENT_SECRET', 'SLACK_SIGNING_SECRET'],
    instructions: [
      'Go to Slack API portal',
      'Create new app from scratch',
      'Add OAuth scopes',
      'Install to workspace',
      'Copy Bot Token and Signing Secret'
    ]
  },
  {
    id: 'notion',
    name: 'Notion',
    description: 'Sync notes and documents',
    icon: FileText,
    category: 'optional',
    status: 'not_started',
    setupUrl: 'https://www.notion.so/my-integrations',
    envKeys: ['NOTION_API_KEY'],
    instructions: [
      'Go to Notion Integrations',
      'Create new integration',
      'Copy Internal Integration Token',
      'Share pages with integration'
    ]
  },
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Payment processing for subscriptions',
    icon: CreditCard,
    category: 'essential',
    status: 'not_started',
    setupUrl: 'https://dashboard.stripe.com/apikeys',
    envKeys: ['STRIPE_SECRET_KEY', 'STRIPE_PUBLISHABLE_KEY', 'STRIPE_WEBHOOK_SECRET'],
    instructions: [
      'Go to Stripe Dashboard',
      'Get API keys from Developers section',
      'Create webhook endpoint',
      'Copy webhook signing secret'
    ]
  },
  {
    id: 'sendgrid',
    name: 'SendGrid',
    description: 'Transactional emails and notifications',
    icon: Bell,
    category: 'essential',
    status: 'not_started',
    setupUrl: 'https://app.sendgrid.com/settings/api_keys',
    envKeys: ['SENDGRID_API_KEY'],
    instructions: [
      'Go to SendGrid Dashboard',
      'Create API key with Mail Send permissions',
      'Verify sender identity',
      'Copy API key'
    ]
  },
  {
    id: 'custom-domain',
    name: 'Custom Domain',
    description: 'Use your own domain for the app',
    icon: Globe,
    category: 'optional',
    status: 'not_started',
    envKeys: ['CUSTOM_DOMAIN'],
    instructions: [
      'Purchase domain from registrar',
      'Configure DNS records',
      'Add domain in Settings > Domains',
      'Wait for SSL certificate'
    ]
  },
];

export default function GoLive() {
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [integrationStatuses, setIntegrationStatuses] = useState<Record<string, Integration['status']>>(
    Object.fromEntries(integrations.map(i => [i.id, i.status]))
  );

  const categories = [
    { id: 'essential', label: 'Essential', description: 'Required for core functionality' },
    { id: 'recommended', label: 'Recommended', description: 'Enhances user experience' },
    { id: 'optional', label: 'Optional', description: 'Nice to have features' },
  ];

  const getProgress = () => {
    const completed = Object.values(integrationStatuses).filter(s => s === 'completed').length;
    return Math.round((completed / integrations.length) * 100);
  };

  const updateStatus = (id: string, status: Integration['status']) => {
    setIntegrationStatuses(prev => ({ ...prev, [id]: status }));
  };

  return (
    <div className="h-full flex flex-col p-4 md:p-6 overflow-auto">
      <PageHeader 
        title="Go Live Wizard" 
        subtitle="Set up external integrations to launch your app"
      />

      {/* Progress Overview */}
      <div className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 rounded-2xl p-6 mb-6 border border-cyan-500/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Rocket className="w-8 h-8 text-cyan-400" />
            <div>
              <h2 className="text-xl font-bold text-white">Launch Readiness</h2>
              <p className="text-foreground/70">Complete integrations to go live</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-white">{getProgress()}%</div>
            <div className="text-sm text-foreground/70">Complete</div>
          </div>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-cyan-500 to-purple-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${getProgress()}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-foreground/60">
          <span>{Object.values(integrationStatuses).filter(s => s === 'completed').length} of {integrations.length} integrations</span>
          <span>{getProgress() === 100 ? 'Ready to publish!' : 'Keep going...'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Integration List */}
        <div className="lg:col-span-2 space-y-6">
          {categories.map((category) => (
            <div key={category.id}>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-lg font-semibold text-white">{category.label}</h3>
                <span className="text-xs text-foreground/60">— {category.description}</span>
              </div>
              <div className="space-y-2">
                {integrations
                  .filter(i => i.category === category.id)
                  .map((integration) => {
                    const status = integrationStatuses[integration.id];
                    return (
                      <button
                        key={integration.id}
                        onClick={() => setSelectedIntegration(integration)}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
                          selectedIntegration?.id === integration.id
                            ? 'bg-cyan-500/10 border-cyan-500/50'
                            : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          status === 'completed' ? 'bg-green-500/20' :
                          status === 'in_progress' ? 'bg-yellow-500/20' :
                          'bg-gray-700'
                        }`}>
                          <integration.icon className={`w-5 h-5 ${
                            status === 'completed' ? 'text-green-400' :
                            status === 'in_progress' ? 'text-yellow-400' :
                            'text-foreground/70'
                          }`} />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-medium text-white">{integration.name}</div>
                          <div className="text-sm text-foreground/70">{integration.description}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          {status === 'completed' ? (
                            <span className="flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                              <Check className="w-3 h-3" />
                              Done
                            </span>
                          ) : status === 'in_progress' ? (
                            <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
                              In Progress
                            </span>
                          ) : status === 'skipped' ? (
                            <span className="px-2 py-1 bg-gray-700 text-foreground/70 text-xs rounded-full">
                              Skipped
                            </span>
                          ) : (
                            <Circle className="w-4 h-4 text-foreground/60" />
                          )}
                          <ChevronRight className="w-4 h-4 text-foreground/60" />
                        </div>
                      </button>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>

        {/* Integration Details */}
        <div className="lg:col-span-1">
          {selectedIntegration ? (
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 sticky top-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gray-700 flex items-center justify-center">
                  <selectedIntegration.icon className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{selectedIntegration.name}</h3>
                  <p className="text-sm text-foreground/70">{selectedIntegration.description}</p>
                </div>
              </div>

              {/* Required Environment Variables */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-foreground/80 mb-2">Required Keys</h4>
                <div className="space-y-1">
                  {selectedIntegration.envKeys.map((key) => (
                    <code key={key} className="block text-xs bg-gray-900 text-cyan-400 px-2 py-1 rounded">
                      {key}
                    </code>
                  ))}
                </div>
              </div>

              {/* Setup Instructions */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-foreground/80 mb-2">Setup Steps</h4>
                <ol className="space-y-2">
                  {selectedIntegration.instructions.map((step, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-foreground/70">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-700 text-foreground/80 text-xs flex items-center justify-center">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                {selectedIntegration.setupUrl && (
                  <a
                    href={selectedIntegration.setupUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open Setup Page
                  </a>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => updateStatus(selectedIntegration.id, 'completed')}
                    className="flex items-center justify-center gap-1 px-3 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg text-sm transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    Mark Done
                  </button>
                  <button
                    onClick={() => updateStatus(selectedIntegration.id, 'skipped')}
                    className="flex items-center justify-center gap-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-foreground/80 rounded-lg text-sm transition-colors"
                  >
                    Skip
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 text-center">
              <Zap className="w-12 h-12 text-foreground/50 mx-auto mb-3" />
              <p className="text-foreground/70">Select an integration to see setup instructions</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
