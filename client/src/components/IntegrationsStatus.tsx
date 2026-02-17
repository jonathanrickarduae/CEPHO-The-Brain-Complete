import React, { useState } from 'react';
import { 
  Check, X, AlertCircle, Settings, ExternalLink, 
  RefreshCw, Key, Mail, MessageSquare, Video, Calendar,
  FileText, Database, Shield, Cpu, Sparkles, Lock
} from 'lucide-react';

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

const INTEGRATION_SERVICES: IntegrationService[] = [
  // AI Services
  {
    id: 'openai',
    name: 'OpenAI / ChatGPT',
    category: 'ai',
    icon: <Cpu className="w-5 h-5" />,
    status: 'connected',
    email: 'jonathanrickarduae@gmail.com',
    hasPassword: true,
    hasApiKey: true,
  },
  {
    id: 'claude',
    name: 'Claude AI',
    category: 'ai',
    icon: <Sparkles className="w-5 h-5" />,
    status: 'connected',
    email: 'jonathanrickarduae@gmail.com',
    hasPassword: true,
    hasApiKey: true,
  },
  {
    id: 'manus',
    name: 'Manus',
    category: 'ai',
    icon: <Cpu className="w-5 h-5" />,
    status: 'connected',
    email: 'nojrickard@aol.com',
    hasPassword: true,
    hasApiKey: true,
  },
  {
    id: 'copilot',
    name: 'Microsoft Copilot',
    category: 'ai',
    icon: <Cpu className="w-5 h-5" />,
    status: 'connected',
    email: 'jonathanrickarduae@gmail.com',
    hasPassword: false, // Uses Google Sign-in
  },
  {
    id: 'grok',
    name: 'Grok',
    category: 'ai',
    icon: <Sparkles className="w-5 h-5" />,
    status: 'connected',
    email: 'jonathanrickarduae@gmail.com',
    hasPassword: true,
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    category: 'ai',
    icon: <Sparkles className="w-5 h-5" />,
    status: 'connected',
    email: 'jonathanrickarduae@gmail.com',
    hasPassword: false, // Uses Google Sign-in
  },

  // Communication
  {
    id: 'gmail',
    name: 'Gmail',
    category: 'communication',
    icon: <Mail className="w-5 h-5" />,
    status: 'connected',
    email: 'jonathanrickarduae@gmail.com',
    hasPassword: true,
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    category: 'communication',
    icon: <MessageSquare className="w-5 h-5" />,
    status: 'connected',
    email: '+971 5678 75619',
  },
  {
    id: 'zoom',
    name: 'Zoom',
    category: 'communication',
    icon: <Video className="w-5 h-5" />,
    status: 'connected',
    email: 'jonathanrickarduae@gmail.com',
    hasPassword: true,
    hasApiKey: true,
  },
  {
    id: 'teams',
    name: 'Microsoft Teams',
    category: 'communication',
    icon: <MessageSquare className="w-5 h-5" />,
    status: 'connected',
    email: 'jonathanrickarduae@gmail.com',
    hasPassword: true,
  },
  {
    id: 'loom',
    name: 'Loom',
    category: 'communication',
    icon: <Video className="w-5 h-5" />,
    status: 'connected',
    email: 'jonathanrickarduae@gmail.com',
    hasPassword: true,
  },

  // Productivity
  {
    id: 'notion',
    name: 'Notion',
    category: 'productivity',
    icon: <FileText className="w-5 h-5" />,
    status: 'connected',
    email: 'jonathanrickarduae@gmail.com',
    hasPassword: true,
  },
  {
    id: 'asana',
    name: 'Asana',
    category: 'productivity',
    icon: <FileText className="w-5 h-5" />,
    status: 'connected',
    email: 'jonathanrickarduae@gmail.com',
    hasPassword: true,
  },
  {
    id: 'todoist',
    name: 'Todoist',
    category: 'productivity',
    icon: <FileText className="w-5 h-5" />,
    status: 'connected',
    email: 'jonathanrickarduae@gmail.com',
    hasPassword: true,
  },
  {
    id: 'calendly',
    name: 'Calendly',
    category: 'productivity',
    icon: <Calendar className="w-5 h-5" />,
    status: 'connected',
    email: 'jonathanrickarduae@gmail.com',
    hasPassword: true,
  },
  {
    id: 'zapier',
    name: 'Zapier',
    category: 'productivity',
    icon: <RefreshCw className="w-5 h-5" />,
    status: 'connected',
    email: 'jonathanrickarduae@gmail.com',
    hasPassword: true,
  },
  {
    id: 'grammarly',
    name: 'Grammarly',
    category: 'productivity',
    icon: <FileText className="w-5 h-5" />,
    status: 'connected',
    email: 'jonathanrickarduae@gmail.com',
    hasPassword: true,
  },
  {
    id: 'toggl',
    name: 'Toggl Track',
    category: 'productivity',
    icon: <RefreshCw className="w-5 h-5" />,
    status: 'connected',
    email: 'jonathanrickarduae@gmail.com',
    hasPassword: true,
  },

  // Security & Infrastructure
  {
    id: 'bitwarden',
    name: 'Bitwarden',
    category: 'security',
    icon: <Shield className="w-5 h-5" />,
    status: 'connected',
    email: 'jonathanrickarduae@gmail.com',
    hasPassword: true,
  },
  {
    id: 'ideals',
    name: 'iDeals VDR',
    category: 'security',
    icon: <Lock className="w-5 h-5" />,
    status: 'connected',
    email: 'jonathan@celadonpharma.com',
    hasPassword: true,
  },

  // Development
  {
    id: 'github',
    name: 'GitHub',
    category: 'development',
    icon: <Database className="w-5 h-5" />,
    status: 'connected',
    email: 'jonathanrickarduae@gmail.com',
    hasPassword: true,
    hasApiKey: true,
  },
  {
    id: 'supabase',
    name: 'Supabase',
    category: 'development',
    icon: <Database className="w-5 h-5" />,
    status: 'connected',
    email: 'jonathanrickarduae@gmail.com',
    hasPassword: true,
  },
  {
    id: 'render',
    name: 'Render',
    category: 'development',
    icon: <Database className="w-5 h-5" />,
    status: 'connected',
    email: 'jonathanrickarduse@gmail.com',
    hasPassword: true,
  },
];

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

export function IntegrationsStatus() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = Object.keys(categoryLabels) as Array<keyof typeof categoryLabels>;

  const filteredServices = selectedCategory === 'all' 
    ? INTEGRATION_SERVICES 
    : INTEGRATION_SERVICES.filter(s => s.category === selectedCategory);

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Integrations</h2>
          <p className="text-sm text-gray-400 mt-1">
            {INTEGRATION_SERVICES.filter(s => s.status === 'connected').length} of {INTEGRATION_SERVICES.length} services connected
          </p>
        </div>
        <button className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          Sync All
        </button>
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
          All ({INTEGRATION_SERVICES.length})
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
            {categoryLabels[cat]} ({INTEGRATION_SERVICES.filter(s => s.category === cat).length})
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
          <div className="text-2xl font-bold text-green-400">
            {INTEGRATION_SERVICES.filter(s => s.status === 'connected').length}
          </div>
          <div className="text-sm text-green-400/70">Connected</div>
        </div>
        <div className="bg-gray-500/10 border border-gray-500/20 rounded-xl p-4">
          <div className="text-2xl font-bold text-gray-400">
            {INTEGRATION_SERVICES.filter(s => s.status === 'disconnected').length}
          </div>
          <div className="text-sm text-gray-400/70">Disconnected</div>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
          <div className="text-2xl font-bold text-yellow-400">
            {INTEGRATION_SERVICES.filter(s => s.status === 'pending').length}
          </div>
          <div className="text-sm text-yellow-400/70">Pending</div>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <div className="text-2xl font-bold text-red-400">
            {INTEGRATION_SERVICES.filter(s => s.status === 'error').length}
          </div>
          <div className="text-sm text-red-400/70">Errors</div>
        </div>
      </div>
    </div>
  );
}
