import React, { useState, useEffect } from 'react';
import { 
  Check, X, AlertCircle, Settings, ExternalLink, 
  RefreshCw, Key, Mail, MessageSquare, Video, Calendar,
  FileText, Database, Shield, Cpu, Sparkles, Lock, Loader2
} from 'lucide-react';
import { trpc } from '@/lib/trpc';

interface IntegrationService {
  id: string;
  name: string;
  category: 'ai' | 'communication' | 'productivity' | 'security' | 'development';
  icon: React.ReactNode;
  status: 'connected' | 'disconnected' | 'error' | 'pending';
  email?: string;
  lastSync?: string;
  hasApiKey?: boolean;
  hasPassword?: boolean;
}

const SERVICE_DEFINITIONS: Record<string, Omit<IntegrationService, 'status' | 'email' | 'hasApiKey' | 'hasPassword'>> = {
  openai: { id: 'openai', name: 'OpenAI / ChatGPT', category: 'ai', icon: <Cpu className="w-5 h-5" /> },
  claude: { id: 'claude', name: 'Claude AI', category: 'ai', icon: <Sparkles className="w-5 h-5" /> },
  manus: { id: 'manus', name: 'Manus', category: 'ai', icon: <Cpu className="w-5 h-5" /> },
  copilot: { id: 'copilot', name: 'Microsoft Copilot', category: 'ai', icon: <Cpu className="w-5 h-5" /> },
  grok: { id: 'grok', name: 'Grok', category: 'ai', icon: <Sparkles className="w-5 h-5" /> },
  gemini: { id: 'gemini', name: 'Google Gemini', category: 'ai', icon: <Sparkles className="w-5 h-5" /> },
  gmail: { id: 'gmail', name: 'Gmail', category: 'communication', icon: <Mail className="w-5 h-5" /> },
  whatsapp: { id: 'whatsapp', name: 'WhatsApp', category: 'communication', icon: <MessageSquare className="w-5 h-5" /> },
  zoom: { id: 'zoom', name: 'Zoom', category: 'communication', icon: <Video className="w-5 h-5" /> },
  teams: { id: 'teams', name: 'Microsoft Teams', category: 'communication', icon: <MessageSquare className="w-5 h-5" /> },
  loom: { id: 'loom', name: 'Loom', category: 'communication', icon: <Video className="w-5 h-5" /> },
  notion: { id: 'notion', name: 'Notion', category: 'productivity', icon: <FileText className="w-5 h-5" /> },
  asana: { id: 'asana', name: 'Asana', category: 'productivity', icon: <FileText className="w-5 h-5" /> },
  todoist: { id: 'todoist', name: 'Todoist', category: 'productivity', icon: <FileText className="w-5 h-5" /> },
  calendly: { id: 'calendly', name: 'Calendly', category: 'productivity', icon: <Calendar className="w-5 h-5" /> },
  zapier: { id: 'zapier', name: 'Zapier', category: 'productivity', icon: <RefreshCw className="w-5 h-5" /> },
  grammarly: { id: 'grammarly', name: 'Grammarly', category: 'productivity', icon: <FileText className="w-5 h-5" /> },
  toggl: { id: 'toggl', name: 'Toggl Track', category: 'productivity', icon: <RefreshCw className="w-5 h-5" /> },
  bitwarden: { id: 'bitwarden', name: 'Bitwarden', category: 'security', icon: <Shield className="w-5 h-5" /> },
  ideals: { id: 'ideals', name: 'iDeals VDR', category: 'security', icon: <Lock className="w-5 h-5" /> },
  github: { id: 'github', name: 'GitHub', category: 'development', icon: <Database className="w-5 h-5" /> },
  supabase: { id: 'supabase', name: 'Supabase', category: 'development', icon: <Database className="w-5 h-5" /> },
  render: { id: 'render', name: 'Render', category: 'development', icon: <Database className="w-5 h-5" /> },
};

const categoryLabels = {
  ai: 'AI Services',
  communication: 'Communication',
  productivity: 'Productivity',
  security: 'Security & Data',
  development: 'Development',
};

const categoryColors = {
  ai: 'from-purple-500 to-pink-500',
  communication: 'from-blue-500 to-cyan-500',
  productivity: 'from-green-500 to-emerald-500',
  security: 'from-red-500 to-orange-500',
  development: 'from-gray-500 to-slate-500',
};

export function IntegrationsStatusReal() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isInitializing, setIsInitializing] = useState(false);
  
  const { data: integrations, isLoading, refetch } = trpc.integrations.getAll.useQuery();
  const initializeAll = trpc.integrations.initializeAll.useMutation();

  const handleInitialize = async () => {
    setIsInitializing(true);
    try {
      await initializeAll.mutateAsync();
      await refetch();
    } catch (error) {
      console.error('Failed to initialize integrations:', error);
    }
    setIsInitializing(false);
  };

  // Build services list from API data
  const services: IntegrationService[] = Object.keys(SERVICE_DEFINITIONS).map(serviceId => {
    const def = SERVICE_DEFINITIONS[serviceId];
    const apiData = integrations?.find(i => i.service === serviceId);
    
    return {
      ...def,
      status: apiData?.status as any || 'disconnected',
      email: apiData?.email || undefined,
      hasApiKey: apiData?.hasApiKey || false,
      hasPassword: apiData?.hasPassword || false,
    };
  });

  const categories = Object.keys(categoryLabels) as Array<keyof typeof categoryLabels>;

  const filteredServices = selectedCategory === 'all' 
    ? services 
    : services.filter(s => s.category === selectedCategory);

  const getStatusBadge = (status: IntegrationService['status']) => {
    switch (status) {
      case 'connected':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-green-500/10 text-green-400 rounded-full text-xs">
            <Check className="w-3 h-3" />
            Connected
          </span>
        );
      case 'disconnected':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-gray-500/10 text-gray-400 rounded-full text-xs">
            <X className="w-3 h-3" />
            Disconnected
          </span>
        );
      case 'error':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-red-500/10 text-red-400 rounded-full text-xs">
            <AlertCircle className="w-3 h-3" />
            Error
          </span>
        );
      case 'pending':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-yellow-500/10 text-yellow-400 rounded-full text-xs">
            <RefreshCw className="w-3 h-3" />
            Pending
          </span>
        );
    }
  };

  const connectedCount = services.filter(s => s.status === 'connected').length;
  const disconnectedCount = services.filter(s => s.status === 'disconnected').length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Integrations</h2>
          <p className="text-sm text-gray-400 mt-1">
            {connectedCount} of {services.length} services connected
          </p>
        </div>
        <div className="flex gap-2">
          {disconnectedCount > 0 && (
            <button 
              onClick={handleInitialize}
              disabled={isInitializing}
              className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {isInitializing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Initializing...
                </>
              ) : (
                <>
                  <Key className="w-4 h-4" />
                  Initialize All
                </>
              )}
            </button>
          )}
          <button 
            onClick={() => refetch()}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
            selectedCategory === 'all'
              ? 'bg-cyan-500 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          All ({services.length})
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-cyan-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {categoryLabels[cat]} ({services.filter(s => s.category === cat).length})
          </button>
        ))}
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredServices.map((service) => (
          <div
            key={service.id}
            className="bg-gray-800 border border-gray-700 rounded-xl p-4 hover:border-cyan-500/50 transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${categoryColors[service.category]} flex items-center justify-center`}>
                  {service.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-white">{service.name}</h3>
                  <p className="text-xs text-gray-400">{categoryLabels[service.category]}</p>
                </div>
              </div>
              {getStatusBadge(service.status)}
            </div>

            {service.email && (
              <div className="text-xs text-gray-400 mb-2">
                <Mail className="w-3 h-3 inline mr-1" />
                {service.email}
              </div>
            )}

            <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
              {service.hasPassword && (
                <span className="flex items-center gap-1">
                  <Key className="w-3 h-3" />
                  Password
                </span>
              )}
              {service.hasApiKey && (
                <span className="flex items-center gap-1">
                  <Key className="w-3 h-3" />
                  API Key
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <button className="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors flex items-center justify-center gap-2">
                <Settings className="w-4 h-4" />
                Configure
              </button>
              <button className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors">
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
          <div className="text-2xl font-bold text-green-400">{connectedCount}</div>
          <div className="text-sm text-green-400/70">Connected</div>
        </div>
        <div className="bg-gray-500/10 border border-gray-500/20 rounded-xl p-4">
          <div className="text-2xl font-bold text-gray-400">{disconnectedCount}</div>
          <div className="text-sm text-gray-400/70">Disconnected</div>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
          <div className="text-2xl font-bold text-yellow-400">
            {services.filter(s => s.status === 'pending').length}
          </div>
          <div className="text-sm text-yellow-400/70">Pending</div>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <div className="text-2xl font-bold text-red-400">
            {services.filter(s => s.status === 'error').length}
          </div>
          <div className="text-sm text-red-400/70">Errors</div>
        </div>
      </div>
    </div>
  );
}
