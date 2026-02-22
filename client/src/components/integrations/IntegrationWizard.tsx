import { useState, useEffect } from 'react';
import { 
  ChevronRight, ChevronLeft, Check, X, Lock, Shield, 
  Calendar, Mail, FileText, Video, MessageSquare, 
  Briefcase, Key, Webhook, Bot, AlertTriangle,
  Sparkles, ExternalLink, Eye, EyeOff
} from 'lucide-react';
import { useGovernance } from '@/hooks/useGovernance';

// Integration definitions
interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  tier: 'basic' | 'standard' | 'advanced';
  category: 'productivity' | 'communication' | 'project' | 'ai' | 'custom';
  requiresApproval: boolean;
  setupSteps: SetupStep[];
  logo?: string;
}

interface SetupStep {
  id: string;
  title: string;
  description: string;
  type: 'info' | 'oauth' | 'apikey' | 'webhook' | 'config';
  fields?: SetupField[];
}

interface SetupField {
  id: string;
  label: string;
  type: 'text' | 'password' | 'select' | 'checkbox';
  placeholder?: string;
  options?: { value: string; label: string }[];
  required?: boolean;
  sensitive?: boolean;
}

// All available integrations
const INTEGRATIONS: Integration[] = [
  // Basic Tier
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    description: 'Sync your Google Calendar events and schedules',
    icon: <Calendar className="w-6 h-6" />,
    tier: 'basic',
    category: 'productivity',
    requiresApproval: false,
    logo: '📅',
    setupSteps: [
      { id: 'intro', title: 'Connect Google Calendar', description: 'We\'ll securely connect to your Google account to sync calendar events.', type: 'info' },
      { id: 'oauth', title: 'Sign in with Google', description: 'Click below to authorize access to your calendar.', type: 'oauth' },
      { id: 'config', title: 'Configure Sync', description: 'Choose which calendars to sync.', type: 'config', fields: [
        { id: 'sync_all', label: 'Sync all calendars', type: 'checkbox' },
        { id: 'sync_frequency', label: 'Sync frequency', type: 'select', options: [
          { value: '5', label: 'Every 5 minutes' },
          { value: '15', label: 'Every 15 minutes' },
          { value: '60', label: 'Every hour' },
        ]},
      ]},
    ],
  },
  {
    id: 'outlook-calendar',
    name: 'Outlook Calendar',
    description: 'Sync your Microsoft Outlook calendar',
    icon: <Calendar className="w-6 h-6" />,
    tier: 'basic',
    category: 'productivity',
    requiresApproval: true,
    logo: '📆',
    setupSteps: [
      { id: 'intro', title: 'Connect Outlook Calendar', description: 'We\'ll securely connect to your Microsoft account.', type: 'info' },
      { id: 'oauth', title: 'Sign in with Microsoft', description: 'Click below to authorize access.', type: 'oauth' },
      { id: 'config', title: 'Configure Sync', description: 'Choose sync options.', type: 'config', fields: [
        { id: 'sync_all', label: 'Sync all calendars', type: 'checkbox' },
      ]},
    ],
  },
  {
    id: 'gmail',
    name: 'Gmail',
    description: 'Connect your Gmail for email summaries and drafts',
    icon: <Mail className="w-6 h-6" />,
    tier: 'basic',
    category: 'productivity',
    requiresApproval: false,
    logo: '✉️',
    setupSteps: [
      { id: 'intro', title: 'Connect Gmail', description: 'Allow Cepho to read and draft emails on your behalf.', type: 'info' },
      { id: 'oauth', title: 'Sign in with Google', description: 'Authorize Gmail access.', type: 'oauth' },
    ],
  },
  {
    id: 'notion',
    name: 'Notion',
    description: 'Sync your Notion pages and databases',
    icon: <FileText className="w-6 h-6" />,
    tier: 'basic',
    category: 'productivity',
    requiresApproval: false,
    logo: '📝',
    setupSteps: [
      { id: 'intro', title: 'Connect Notion', description: 'Access your Notion workspace.', type: 'info' },
      { id: 'oauth', title: 'Authorize Notion', description: 'Click to connect your workspace.', type: 'oauth' },
    ],
  },
  
  // Presentation Tools
  {
    id: 'pitch',
    name: 'Pitch',
    description: 'Create beautiful presentations with Pitch.com',
    icon: <FileText className="w-6 h-6" />,
    tier: 'basic',
    category: 'productivity',
    requiresApproval: false,
    logo: '🎨',
    setupSteps: [
      { id: 'intro', title: 'Connect Pitch', description: 'Access your Pitch workspace for collaborative presentations.', type: 'info' },
      { id: 'oauth', title: 'Sign in with Pitch', description: 'Click to connect your Pitch account.', type: 'oauth' },
      { id: 'config', title: 'Workspace Settings', description: 'Choose sync options.', type: 'config', fields: [
        { id: 'sync_templates', label: 'Sync presentation templates', type: 'checkbox' },
        { id: 'auto_export', label: 'Auto-export to Library', type: 'checkbox' },
      ]},
    ],
  },
  {
    id: 'gamma',
    name: 'Gamma',
    description: 'AI-powered presentations with Gamma.app',
    icon: <Sparkles className="w-6 h-6" />,
    tier: 'basic',
    category: 'productivity',
    requiresApproval: false,
    logo: '✨',
    setupSteps: [
      { id: 'intro', title: 'Connect Gamma', description: 'Create AI-generated presentations directly from your content.', type: 'info' },
      { id: 'oauth', title: 'Sign in with Gamma', description: 'Click to connect your Gamma account.', type: 'oauth' },
      { id: 'config', title: 'Generation Settings', description: 'Configure AI presentation options.', type: 'config', fields: [
        { id: 'default_style', label: 'Default Style', type: 'select', options: [
          { value: 'professional', label: 'Professional' },
          { value: 'creative', label: 'Creative' },
          { value: 'minimal', label: 'Minimal' },
        ]},
        { id: 'auto_generate', label: 'Auto-generate from documents', type: 'checkbox' },
      ]},
    ],
  },
  
  // Standard Tier
  {
    id: 'zoom',
    name: 'Zoom',
    description: 'Schedule and join Zoom meetings',
    icon: <Video className="w-6 h-6" />,
    tier: 'standard',
    category: 'communication',
    requiresApproval: true,
    logo: '🎥',
    setupSteps: [
      { id: 'intro', title: 'Connect Zoom', description: 'Enable meeting scheduling and transcription.', type: 'info' },
      { id: 'oauth', title: 'Sign in with Zoom', description: 'Authorize Zoom access.', type: 'oauth' },
      { id: 'config', title: 'Meeting Settings', description: 'Configure default meeting options.', type: 'config', fields: [
        { id: 'auto_record', label: 'Auto-record meetings', type: 'checkbox' },
        { id: 'transcribe', label: 'Enable AI transcription', type: 'checkbox' },
      ]},
    ],
  },
  {
    id: 'teams',
    name: 'Microsoft Teams',
    description: 'Connect to Teams for chat and meetings',
    icon: <MessageSquare className="w-6 h-6" />,
    tier: 'standard',
    category: 'communication',
    requiresApproval: true,
    logo: '💬',
    setupSteps: [
      { id: 'intro', title: 'Connect Microsoft Teams', description: 'Integrate with your Teams workspace.', type: 'info' },
      { id: 'oauth', title: 'Sign in with Microsoft', description: 'Authorize Teams access.', type: 'oauth' },
    ],
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Connect Slack for notifications and commands',
    icon: <MessageSquare className="w-6 h-6" />,
    tier: 'standard',
    category: 'communication',
    requiresApproval: true,
    logo: '💬',
    setupSteps: [
      { id: 'intro', title: 'Connect Slack', description: 'Add Cepho to your Slack workspace.', type: 'info' },
      { id: 'oauth', title: 'Add to Slack', description: 'Click to install the Slack app.', type: 'oauth' },
      { id: 'config', title: 'Channel Settings', description: 'Choose notification channels.', type: 'config', fields: [
        { id: 'channel', label: 'Default channel', type: 'text', placeholder: '#general' },
      ]},
    ],
  },
  {
    id: 'asana',
    name: 'Asana',
    description: 'Sync projects, tasks, and team updates',
    icon: <Briefcase className="w-6 h-6" />,
    tier: 'standard',
    category: 'project',
    requiresApproval: true,
    logo: '📋',
    setupSteps: [
      { id: 'intro', title: 'Connect Asana', description: 'Sync your Asana projects and tasks to your dashboard. Your Chief of Staff will learn from project patterns.', type: 'info' },
      { id: 'oauth', title: 'Sign in with Asana', description: 'Click below to authorize access to your Asana workspaces.', type: 'oauth' },
      { id: 'workspaces', title: 'Select Workspaces', description: 'Choose which workspaces to sync (Project A, Sample Project, etc.).', type: 'config', fields: [
        { id: 'workspace_celadon', label: 'Project A Project', type: 'checkbox' },
        { id: 'workspace_boundless', label: 'Sample Project Project', type: 'checkbox' },
        { id: 'workspace_other', label: 'Other Workspaces', type: 'checkbox' },
      ]},
      { id: 'sync', title: 'Sync Settings', description: 'Configure how tasks sync to your dashboard.', type: 'config', fields: [
        { id: 'sync_assigned', label: 'Only tasks assigned to me', type: 'checkbox' },
        { id: 'sync_frequency', label: 'Sync frequency', type: 'select', options: [
          { value: 'realtime', label: 'Real-time (webhooks)' },
          { value: '5', label: 'Every 5 minutes' },
          { value: '15', label: 'Every 15 minutes' },
        ]},
        { id: 'notify_updates', label: 'Notify on task updates', type: 'checkbox' },
      ]},
    ],
  },
  
  // Security - NordVPN
  {
    id: 'nordvpn',
    name: 'NordVPN',
    description: 'Secure your connections with NordVPN for enhanced privacy and security',
    icon: <Shield className="w-6 h-6" />,
    tier: 'standard',
    category: 'productivity',
    requiresApproval: true,
    logo: '🔒',
    setupSteps: [
      { id: 'intro', title: 'Connect NordVPN', description: 'Enhance your security by routing sensitive API calls through NordVPN. This protects your data and masks your location.', type: 'info' },
      { id: 'apikey', title: 'NordVPN Credentials', description: 'Enter your NordVPN service credentials. Get these from your NordVPN account dashboard.', type: 'apikey', fields: [
        { id: 'nord_token', label: 'NordVPN Access Token', type: 'password', required: true, sensitive: true, placeholder: 'Enter your access token' },
      ]},
      { id: 'config', title: 'Security Settings', description: 'Configure when to use VPN protection.', type: 'config', fields: [
        { id: 'auto_connect', label: 'Auto-connect on sensitive operations', type: 'checkbox' },
        { id: 'api_routing', label: 'Route all API calls through VPN', type: 'checkbox' },
        { id: 'preferred_region', label: 'Preferred Region', type: 'select', options: [
          { value: 'auto', label: 'Auto (fastest)' },
          { value: 'uk', label: 'United Kingdom' },
          { value: 'eu', label: 'Europe (Netherlands)' },
          { value: 'us', label: 'United States' },
          { value: 'ch', label: 'Switzerland' },
        ]},
        { id: 'kill_switch', label: 'Enable kill switch (block if VPN drops)', type: 'checkbox' },
      ]},
    ],
  },

  // Project Management - iDeals Dataroom
  {
    id: 'ideals-dataroom',
    name: 'iDeals Virtual Data Room',
    description: 'Connect to your investor dataroom for seamless document management',
    icon: <Briefcase className="w-6 h-6" />,
    tier: 'standard',
    category: 'project',
    requiresApproval: true,
    logo: '🏦',
    setupSteps: [
      { id: 'intro', title: 'Connect iDeals VDR', description: 'Securely connect to your iDeals Virtual Data Room for automatic document sync with investors.', type: 'info' },
      { id: 'apikey', title: 'API Configuration', description: 'Enter your iDeals API key. Get it from iDeals VDR Settings > API Keys.', type: 'apikey', fields: [
        { id: 'api_key', label: 'iDeals API Key', type: 'password', required: true, sensitive: true, placeholder: 'Enter your API key' },
      ]},
      { id: 'project', title: 'Select Project', description: 'Choose which dataroom project to connect.', type: 'config', fields: [
        { id: 'project_id', label: 'Dataroom Project', type: 'select', options: [
          { value: 'auto', label: 'Auto-detect from API key' },
        ]},
      ]},
      { id: 'folders', title: 'Folder Mapping', description: 'Map Brain Library folders to iDeals dataroom folders.', type: 'config', fields: [
        { id: 'map_contracts', label: 'Sync Contracts folder', type: 'checkbox' },
        { id: 'map_financials', label: 'Sync Financial Models folder', type: 'checkbox' },
        { id: 'map_legal', label: 'Sync Legal Documents folder', type: 'checkbox' },
        { id: 'map_presentations', label: 'Sync Investor Presentations folder', type: 'checkbox' },
        { id: 'auto_publish', label: 'Auto-publish uploaded documents', type: 'checkbox' },
      ]},
    ],
  },

  // Advanced Tier
  {
    id: 'copilot',
    name: 'Microsoft Copilot',
    description: 'Connect to Microsoft 365 Copilot',
    icon: <Bot className="w-6 h-6" />,
    tier: 'advanced',
    category: 'ai',
    requiresApproval: true,
    logo: '🤖',
    setupSteps: [
      { id: 'intro', title: 'Connect Microsoft Copilot', description: 'Integrate with M365 Copilot for enhanced AI capabilities.', type: 'info' },
      { id: 'apikey', title: 'API Configuration', description: 'Enter your Copilot API credentials.', type: 'apikey', fields: [
        { id: 'tenant_id', label: 'Tenant ID', type: 'text', required: true },
        { id: 'client_id', label: 'Client ID', type: 'text', required: true },
        { id: 'client_secret', label: 'Client Secret', type: 'password', required: true, sensitive: true },
      ]},
    ],
  },
  {
    id: 'custom-api',
    name: 'Custom API',
    description: 'Connect any REST API with custom configuration',
    icon: <Key className="w-6 h-6" />,
    tier: 'advanced',
    category: 'custom',
    requiresApproval: true,
    logo: '🔑',
    setupSteps: [
      { id: 'intro', title: 'Custom API Integration', description: 'Connect any REST API to Cepho.', type: 'info' },
      { id: 'apikey', title: 'API Details', description: 'Enter your API configuration.', type: 'apikey', fields: [
        { id: 'api_name', label: 'Integration Name', type: 'text', required: true },
        { id: 'base_url', label: 'Base URL', type: 'text', placeholder: 'https://api.example.com', required: true },
        { id: 'api_key', label: 'API Key', type: 'password', required: true, sensitive: true },
        { id: 'auth_header', label: 'Auth Header', type: 'text', placeholder: 'Authorization' },
      ]},
    ],
  },
  {
    id: 'webhook',
    name: 'Custom Webhook',
    description: 'Set up incoming/outgoing webhooks',
    icon: <Webhook className="w-6 h-6" />,
    tier: 'advanced',
    category: 'custom',
    requiresApproval: true,
    logo: '🔗',
    setupSteps: [
      { id: 'intro', title: 'Webhook Configuration', description: 'Create webhooks to send/receive data.', type: 'info' },
      { id: 'webhook', title: 'Webhook Setup', description: 'Configure your webhook endpoints.', type: 'webhook', fields: [
        { id: 'webhook_name', label: 'Webhook Name', type: 'text', required: true },
        { id: 'webhook_type', label: 'Type', type: 'select', options: [
          { value: 'incoming', label: 'Incoming (receive data)' },
          { value: 'outgoing', label: 'Outgoing (send data)' },
        ]},
        { id: 'webhook_url', label: 'URL', type: 'text', placeholder: 'https://...', required: true },
        { id: 'webhook_secret', label: 'Secret (optional)', type: 'password', sensitive: true },
      ]},
    ],
  },
];

interface IntegrationWizardProps {
  onComplete?: () => void;
  initialIntegration?: string;
}

export function IntegrationWizard({ onComplete, initialIntegration }: IntegrationWizardProps) {
  const { mode: governanceMode } = useGovernance();
  const isGoverned = governanceMode === 'governed';
  
  const [step, setStep] = useState<'select' | 'setup' | 'approval' | 'complete'>('select');
  const [selectedTier, setSelectedTier] = useState<'all' | 'basic' | 'standard' | 'advanced'>('all');
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [currentSetupStep, setCurrentSetupStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
  const [pendingApprovals, setPendingApprovals] = useState<string[]>(() => {
    const saved = localStorage.getItem('brain_pending_approvals');
    return saved ? JSON.parse(saved) : [];
  });
  const [connectedIntegrations, setConnectedIntegrations] = useState<string[]>(() => {
    const saved = localStorage.getItem('brain_connected_integrations');
    return saved ? JSON.parse(saved) : [];
  });

  // Filter integrations by tier
  const filteredIntegrations = selectedTier === 'all' 
    ? INTEGRATIONS 
    : INTEGRATIONS.filter(i => i.tier === selectedTier);

  // Group by category
  const groupedIntegrations = filteredIntegrations.reduce((acc, integration) => {
    if (!acc[integration.category]) acc[integration.category] = [];
    acc[integration.category].push(integration);
    return acc;
  }, {} as Record<string, Integration[]>);

  const categoryLabels: Record<string, string> = {
    productivity: '📊 Productivity',
    communication: '💬 Communication',
    project: '📋 Project Management',
    ai: '🤖 AI & Automation',
    custom: '🔧 Custom',
  };

  const tierLabels = {
    basic: { label: 'Basic', color: 'text-green-400', bg: 'bg-green-500/10', desc: 'Essential integrations for getting started' },
    standard: { label: 'Standard', color: 'text-blue-400', bg: 'bg-blue-500/10', desc: 'Popular tools for teams' },
    advanced: { label: 'Advanced', color: 'text-purple-400', bg: 'bg-purple-500/10', desc: 'Custom APIs and advanced features' },
  };

  const startSetup = (integration: Integration) => {
    setSelectedIntegration(integration);
    setCurrentSetupStep(0);
    setFormData({});
    
    // Check if requires approval in governed mode
    if (isGoverned && integration.requiresApproval) {
      setStep('approval');
    } else {
      setStep('setup');
    }
  };

  const requestApproval = () => {
    if (!selectedIntegration) return;
    
    const newPending = [...pendingApprovals, selectedIntegration.id];
    setPendingApprovals(newPending);
    localStorage.setItem('brain_pending_approvals', JSON.stringify(newPending));
    
    // In real app, this would send approval request to admin
    setStep('select');
    setSelectedIntegration(null);
  };

  const completeSetup = () => {
    if (!selectedIntegration) return;
    
    // Save to connected integrations
    const newConnected = [...connectedIntegrations, selectedIntegration.id];
    setConnectedIntegrations(newConnected);
    localStorage.setItem('brain_connected_integrations', JSON.stringify(newConnected));
    
    // Save credentials to vault (in real app, would encrypt)
    const credentials = localStorage.getItem('brain_vault_credentials') || '{}';
    const parsed = JSON.parse(credentials);
    parsed[selectedIntegration.id] = formData;
    localStorage.setItem('brain_vault_credentials', JSON.stringify(parsed));
    
    setStep('complete');
  };

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const renderSetupStep = () => {
    if (!selectedIntegration) return null;
    const setupStep = selectedIntegration.setupSteps[currentSetupStep];
    if (!setupStep) return null;

    return (
      <div className="space-y-6">
        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6">
          {selectedIntegration.setupSteps.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                i < currentSetupStep ? 'bg-green-500 text-white' :
                i === currentSetupStep ? 'bg-primary text-white' :
                'bg-gray-700 text-foreground/70'
              }`}>
                {i < currentSetupStep ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              {i < selectedIntegration.setupSteps.length - 1 && (
                <div className={`w-8 h-0.5 ${i < currentSetupStep ? 'bg-green-500' : 'bg-gray-700'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-foreground mb-2">{setupStep.title}</h3>
          <p className="text-muted-foreground">{setupStep.description}</p>
        </div>

        {/* Step type specific content */}
        {setupStep.type === 'info' && (
          <div className="bg-primary/10 border border-primary/20 rounded-xl p-6 text-center">
            <div className="text-4xl mb-4">{selectedIntegration.logo}</div>
            <p className="text-foreground">Click "Next" to continue with the setup.</p>
          </div>
        )}

        {setupStep.type === 'oauth' && (
          <div className="space-y-4">
            <button className="w-full py-4 bg-white text-gray-900 rounded-xl font-medium hover:bg-gray-100 transition-colors flex items-center justify-center gap-3">
              <ExternalLink className="w-5 h-5" />
              Connect with {selectedIntegration.name}
            </button>
            <p className="text-xs text-muted-foreground text-center">
              You'll be redirected to {selectedIntegration.name} to authorize access.
              {isGoverned && selectedIntegration.requiresApproval && (
                <span className="block mt-1 text-yellow-400">
                  <AlertTriangle className="w-3 h-3 inline mr-1" />
                  This integration has been pre-approved by your administrator.
                </span>
              )}
            </p>
          </div>
        )}

        {(setupStep.type === 'apikey' || setupStep.type === 'config' || setupStep.type === 'webhook') && setupStep.fields && (
          <div className="space-y-4">
            {setupStep.fields.map(field => (
              <div key={field.id}>
                <label className="block text-sm text-muted-foreground mb-2">
                  {field.label}
                  {field.required && <span className="text-red-400 ml-1">*</span>}
                  {field.sensitive && (
                    <span className="ml-2 text-xs text-yellow-400">
                      <Lock className="w-3 h-3 inline mr-1" />
                      Stored securely in Vault
                    </span>
                  )}
                </label>
                
                {field.type === 'text' && (
                  <input
                    type="text"
                    value={formData[field.id] || ''}
                    onChange={(e) => handleFieldChange(field.id, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-foreground focus:outline-none focus:border-primary"
                  />
                )}
                
                {field.type === 'password' && (
                  <div className="relative">
                    <input
                      type={showPassword[field.id] ? 'text' : 'password'}
                      value={formData[field.id] || ''}
                      onChange={(e) => handleFieldChange(field.id, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-foreground focus:outline-none focus:border-primary pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(prev => ({ ...prev, [field.id]: !prev[field.id] }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword[field.id] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                )}
                
                {field.type === 'select' && field.options && (
                  <select
                    value={formData[field.id] || ''}
                    onChange={(e) => handleFieldChange(field.id, e.target.value)}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-foreground focus:outline-none focus:border-primary"
                  >
                    <option value="">Select...</option>
                    {field.options.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                )}
                
                {field.type === 'checkbox' && (
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData[field.id] || false}
                      onChange={(e) => handleFieldChange(field.id, e.target.checked)}
                      className="w-5 h-5 rounded border-gray-700 bg-gray-900 text-primary focus:ring-primary"
                    />
                    <span className="text-foreground">{field.label}</span>
                  </label>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-6">
          <button
            onClick={() => {
              if (currentSetupStep === 0) {
                setStep('select');
                setSelectedIntegration(null);
              } else {
                setCurrentSetupStep(prev => prev - 1);
              }
            }}
            className="px-6 py-2 text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
          
          <button
            onClick={() => {
              if (currentSetupStep === selectedIntegration.setupSteps.length - 1) {
                completeSetup();
              } else {
                setCurrentSetupStep(prev => prev + 1);
              }
            }}
            className="px-6 py-3 bg-primary hover:bg-primary/80 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            {currentSetupStep === selectedIntegration.setupSteps.length - 1 ? 'Complete Setup' : 'Next'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Integration Wizard</h2>
            <p className="text-sm text-muted-foreground">
              {step === 'select' && 'Connect your favorite tools and services'}
              {step === 'setup' && `Setting up ${selectedIntegration?.name}`}
              {step === 'approval' && 'Approval Required'}
              {step === 'complete' && 'Setup Complete!'}
            </p>
          </div>
        </div>
        
        {isGoverned && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/30 rounded-full">
            <Shield className="w-4 h-4 text-yellow-400" />
            <span className="text-xs text-yellow-400">Governed Mode</span>
          </div>
        )}
      </div>

      {/* Selection View */}
      {step === 'select' && (
        <>
          {/* Tier filter */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedTier('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                selectedTier === 'all' ? 'bg-primary text-white' : 'bg-gray-800 text-muted-foreground hover:text-foreground'
              }`}
            >
              All Integrations
            </button>
            {(['basic', 'standard', 'advanced'] as const).map(tier => (
              <button
                key={tier}
                onClick={() => setSelectedTier(tier)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedTier === tier ? `${tierLabels[tier].bg} ${tierLabels[tier].color}` : 'bg-gray-800 text-muted-foreground hover:text-foreground'
                }`}
              >
                {tierLabels[tier].label}
              </button>
            ))}
          </div>

          {/* Tier description */}
          {selectedTier !== 'all' && (
            <p className="text-sm text-muted-foreground mb-4">{tierLabels[selectedTier].desc}</p>
          )}

          {/* Integration list by category */}
          <div className="space-y-6 max-h-[500px] overflow-y-auto">
            {Object.entries(groupedIntegrations).map(([category, integrations]) => (
              <div key={category}>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">{categoryLabels[category]}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {integrations.map(integration => {
                    const isConnected = connectedIntegrations.includes(integration.id);
                    const isPending = pendingApprovals.includes(integration.id);
                    
                    return (
                      <button
                        key={integration.id}
                        onClick={() => !isConnected && !isPending && startSetup(integration)}
                        disabled={isConnected || isPending}
                        className={`p-4 rounded-xl border text-left transition-all ${
                          isConnected 
                            ? 'bg-green-500/10 border-green-500/30 cursor-default'
                            : isPending
                            ? 'bg-yellow-500/10 border-yellow-500/30 cursor-default'
                            : 'bg-gray-800/50 border-gray-700 hover:border-primary/50 hover:bg-gray-800'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${
                            isConnected ? 'bg-green-500/20' : isPending ? 'bg-yellow-500/20' : 'bg-primary/20'
                          }`}>
                            {integration.logo}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-foreground">{integration.name}</h4>
                              {isConnected && <Check className="w-4 h-4 text-green-400" />}
                              {isPending && <AlertTriangle className="w-4 h-4 text-yellow-400" />}
                              {isGoverned && integration.requiresApproval && !isConnected && !isPending && (
                                <Lock className="w-3 h-3 text-yellow-400" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground truncate">{integration.description}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className={`text-[10px] px-2 py-0.5 rounded ${tierLabels[integration.tier].bg} ${tierLabels[integration.tier].color}`}>
                                {tierLabels[integration.tier].label}
                              </span>
                              {isConnected && <span className="text-[10px] text-green-400">Connected</span>}
                              {isPending && <span className="text-[10px] text-yellow-400">Pending Approval</span>}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Approval Required View */}
      {step === 'approval' && selectedIntegration && (
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-yellow-400" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">Approval Required</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Connecting <strong>{selectedIntegration.name}</strong> requires approval from your organization's administrator.
            This ensures compliance with your company's security policies.
          </p>
          
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6 max-w-md mx-auto">
            <p className="text-sm text-yellow-400">
              <AlertTriangle className="w-4 h-4 inline mr-2" />
              Your IT/Compliance team will review this request and approve or deny access.
            </p>
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={() => {
                setStep('select');
                setSelectedIntegration(null);
              }}
              className="px-6 py-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={requestApproval}
              className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-black rounded-lg transition-colors font-medium"
            >
              Request Approval
            </button>
          </div>
        </div>
      )}

      {/* Setup View */}
      {step === 'setup' && renderSetupStep()}

      {/* Complete View */}
      {step === 'complete' && selectedIntegration && (
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-400" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">Successfully Connected!</h3>
          <p className="text-muted-foreground mb-6">
            <strong>{selectedIntegration.name}</strong> is now connected to Cepho.
            Your credentials are securely stored in the Vault.
          </p>
          
          <div className="flex justify-center gap-4">
            <button
              onClick={() => {
                setStep('select');
                setSelectedIntegration(null);
              }}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Connect Another
            </button>
            <button
              onClick={onComplete}
              className="px-6 py-3 bg-primary hover:bg-primary/80 text-white rounded-lg transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Compact integration status for sidebar/header
export function IntegrationStatus() {
  const [connected, setConnected] = useState<string[]>([]);
  
  useEffect(() => {
    const saved = localStorage.getItem('brain_connected_integrations');
    if (saved) setConnected(JSON.parse(saved));
  }, []);

  if (connected.length === 0) return null;

  return (
    <div className="flex items-center gap-1">
      {connected.slice(0, 3).map(id => {
        const integration = INTEGRATIONS.find(i => i.id === id);
        return integration ? (
          <span key={id} className="text-lg" title={integration.name}>
            {integration.logo}
          </span>
        ) : null;
      })}
      {connected.length > 3 && (
        <span className="text-xs text-muted-foreground">+{connected.length - 3}</span>
      )}
    </div>
  );
}
