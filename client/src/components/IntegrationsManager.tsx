import { useState } from 'react';
import { 
  Key, Eye, EyeOff, Save, Plus, Trash2, AlertCircle, 
  CheckCircle2, Settings, ExternalLink, RefreshCw,
  Mail, MessageSquare, Video, Calendar, FileText, 
  Database, Shield, Cpu, Sparkles, Lock, Globe
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';

interface APIKey {
  id: string;
  name: string;
  category: 'ai' | 'communication' | 'productivity' | 'security' | 'development';
  icon: React.ReactNode;
  key?: string;
  status: 'active' | 'inactive' | 'error';
  lastUsed?: string;
  usageCount?: number;
  description: string;
  documentationUrl?: string;
}

const API_SERVICES: APIKey[] = [
  // AI Services
  {
    id: 'openai',
    name: 'OpenAI',
    category: 'ai',
    icon: <Cpu className="w-4 h-4" />,
    status: 'active',
    description: 'GPT-4, GPT-3.5, DALL-E, Whisper APIs',
    documentationUrl: 'https://platform.openai.com/docs',
    lastUsed: '2 hours ago',
    usageCount: 1247
  },
  {
    id: 'claude',
    name: 'Anthropic Claude',
    category: 'ai',
    icon: <Sparkles className="w-4 h-4" />,
    status: 'active',
    description: 'Claude 3 Opus, Sonnet, Haiku',
    documentationUrl: 'https://docs.anthropic.com',
    lastUsed: '5 hours ago',
    usageCount: 892
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    category: 'ai',
    icon: <Sparkles className="w-4 h-4" />,
    status: 'active',
    description: 'Gemini Pro, Gemini Ultra',
    documentationUrl: 'https://ai.google.dev/docs',
    lastUsed: '1 day ago',
    usageCount: 456
  },
  {
    id: 'perplexity',
    name: 'Perplexity AI',
    category: 'ai',
    icon: <Globe className="w-4 h-4" />,
    status: 'inactive',
    description: 'Real-time search and reasoning',
    documentationUrl: 'https://docs.perplexity.ai'
  },
  {
    id: 'elevenlabs',
    name: 'ElevenLabs',
    category: 'ai',
    icon: <MessageSquare className="w-4 h-4" />,
    status: 'active',
    description: 'Voice synthesis and cloning',
    documentationUrl: 'https://elevenlabs.io/docs',
    lastUsed: '3 days ago',
    usageCount: 78
  },
  
  // Communication
  {
    id: 'gmail',
    name: 'Gmail API',
    category: 'communication',
    icon: <Mail className="w-4 h-4" />,
    status: 'active',
    description: 'Email management and automation',
    documentationUrl: 'https://developers.google.com/gmail/api',
    lastUsed: '1 hour ago',
    usageCount: 2341
  },
  {
    id: 'sendgrid',
    name: 'SendGrid',
    category: 'communication',
    icon: <Mail className="w-4 h-4" />,
    status: 'inactive',
    description: 'Transactional email service',
    documentationUrl: 'https://docs.sendgrid.com'
  },
  {
    id: 'twilio',
    name: 'Twilio',
    category: 'communication',
    icon: <MessageSquare className="w-4 h-4" />,
    status: 'inactive',
    description: 'SMS, voice, and messaging',
    documentationUrl: 'https://www.twilio.com/docs'
  },
  {
    id: 'slack',
    name: 'Slack',
    category: 'communication',
    icon: <MessageSquare className="w-4 h-4" />,
    status: 'active',
    description: 'Team communication and bots',
    documentationUrl: 'https://api.slack.com',
    lastUsed: '30 minutes ago',
    usageCount: 567
  },
  
  // Productivity
  {
    id: 'notion',
    name: 'Notion',
    category: 'productivity',
    icon: <FileText className="w-4 h-4" />,
    status: 'active',
    description: 'Database and content management',
    documentationUrl: 'https://developers.notion.com',
    lastUsed: '6 hours ago',
    usageCount: 234
  },
  {
    id: 'airtable',
    name: 'Airtable',
    category: 'productivity',
    icon: <Database className="w-4 h-4" />,
    status: 'inactive',
    description: 'Spreadsheet-database hybrid',
    documentationUrl: 'https://airtable.com/developers'
  },
  {
    id: 'asana',
    name: 'Asana',
    category: 'productivity',
    icon: <CheckCircle2 className="w-4 h-4" />,
    status: 'active',
    description: 'Project and task management',
    documentationUrl: 'https://developers.asana.com',
    lastUsed: '2 days ago',
    usageCount: 145
  },
  {
    id: 'todoist',
    name: 'Todoist',
    category: 'productivity',
    icon: <CheckCircle2 className="w-4 h-4" />,
    status: 'active',
    description: 'Task management and tracking',
    documentationUrl: 'https://developer.todoist.com',
    lastUsed: '4 hours ago',
    usageCount: 678
  },
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    category: 'productivity',
    icon: <Calendar className="w-4 h-4" />,
    status: 'active',
    description: 'Calendar and event management',
    documentationUrl: 'https://developers.google.com/calendar',
    lastUsed: '1 hour ago',
    usageCount: 1892
  },
  {
    id: 'zoom',
    name: 'Zoom',
    category: 'productivity',
    icon: <Video className="w-4 h-4" />,
    status: 'active',
    description: 'Video conferencing API',
    documentationUrl: 'https://marketplace.zoom.us/docs',
    lastUsed: '1 day ago',
    usageCount: 89
  },
  
  // Security
  {
    id: 'auth0',
    name: 'Auth0',
    category: 'security',
    icon: <Shield className="w-4 h-4" />,
    status: 'inactive',
    description: 'Authentication and authorization',
    documentationUrl: 'https://auth0.com/docs'
  },
  {
    id: 'vault',
    name: 'HashiCorp Vault',
    category: 'security',
    icon: <Lock className="w-4 h-4" />,
    status: 'inactive',
    description: 'Secrets management',
    documentationUrl: 'https://www.vaultproject.io/docs'
  },
  
  // Development
  {
    id: 'github',
    name: 'GitHub',
    category: 'development',
    icon: <Database className="w-4 h-4" />,
    status: 'active',
    description: 'Repository and CI/CD management',
    documentationUrl: 'https://docs.github.com',
    lastUsed: '3 hours ago',
    usageCount: 456
  },
  {
    id: 'vercel',
    name: 'Vercel',
    category: 'development',
    icon: <Globe className="w-4 h-4" />,
    status: 'active',
    description: 'Deployment and hosting',
    documentationUrl: 'https://vercel.com/docs',
    lastUsed: '5 hours ago',
    usageCount: 123
  },
  {
    id: 'stripe',
    name: 'Stripe',
    category: 'development',
    icon: <Database className="w-4 h-4" />,
    status: 'inactive',
    description: 'Payment processing',
    documentationUrl: 'https://stripe.com/docs'
  },
  {
    id: 'aws',
    name: 'AWS',
    category: 'development',
    icon: <Database className="w-4 h-4" />,
    status: 'inactive',
    description: 'Cloud infrastructure',
    documentationUrl: 'https://docs.aws.amazon.com'
  },
  {
    id: 'supabase',
    name: 'Supabase',
    category: 'development',
    icon: <Database className="w-4 h-4" />,
    status: 'active',
    description: 'Backend as a service',
    documentationUrl: 'https://supabase.com/docs',
    lastUsed: '30 minutes ago',
    usageCount: 3456
  }
];

export function IntegrationsManager() {
  const [services, setServices] = useState<APIKey[]>(API_SERVICES);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingService, setEditingService] = useState<string | null>(null);
  const [showKey, setShowKey] = useState<{ [key: string]: boolean }>({});
  const [apiKeys, setApiKeys] = useState<{ [key: string]: string }>({});

  const categories = [
    { value: 'all', label: 'All Services', count: services.length },
    { value: 'ai', label: 'AI Services', count: services.filter(s => s.category === 'ai').length },
    { value: 'communication', label: 'Communication', count: services.filter(s => s.category === 'communication').length },
    { value: 'productivity', label: 'Productivity', count: services.filter(s => s.category === 'productivity').length },
    { value: 'security', label: 'Security', count: services.filter(s => s.category === 'security').length },
    { value: 'development', label: 'Development', count: services.filter(s => s.category === 'development').length }
  ];

  const filteredServices = selectedCategory === 'all' 
    ? services 
    : services.filter(s => s.category === selectedCategory);

  const activeServices = services.filter(s => s.status === 'active').length;
  const inactiveServices = services.filter(s => s.status === 'inactive').length;

  const handleSaveKey = (serviceId: string) => {
    const key = apiKeys[serviceId];
    if (!key || key.trim() === '') {
      toast.error('Please enter a valid API key');
      return;
    }

    setServices(services.map(s => 
      s.id === serviceId 
        ? { ...s, status: 'active' as const, key, lastUsed: 'Just now', usageCount: 0 }
        : s
    ));
    
    setEditingService(null);
    toast.success(`API key saved for ${services.find(s => s.id === serviceId)?.name}`);
  };

  const handleRemoveKey = (serviceId: string) => {
    setServices(services.map(s => 
      s.id === serviceId 
        ? { ...s, status: 'inactive' as const, key: undefined }
        : s
    ));
    
    setApiKeys({ ...apiKeys, [serviceId]: '' });
    toast.success('API key removed');
  };

  const handleTestConnection = async (serviceId: string) => {
    toast.info('Testing connection...');
    
    // Simulate API test
    setTimeout(() => {
      const service = services.find(s => s.id === serviceId);
      if (service?.status === 'active') {
        toast.success(`${service.name} connection successful`);
      } else {
        toast.error('Please configure API key first');
      }
    }, 1000);
  };

  const toggleShowKey = (serviceId: string) => {
    setShowKey({ ...showKey, [serviceId]: !showKey[serviceId] });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Integrations Manager</h2>
        <p className="text-muted-foreground mt-2">
          Manage API keys and credentials for all connected services
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Services</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{services.length}</div>
            <p className="text-xs text-muted-foreground">
              Available integrations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeServices}</div>
            <p className="text-xs text-muted-foreground">
              Connected and configured
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inactiveServices}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting configuration
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-6">
          {categories.map(cat => (
            <TabsTrigger key={cat.value} value={cat.value}>
              {cat.label} ({cat.count})
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="space-y-4 mt-6">
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-4">
              {filteredServices.map(service => (
                <Card key={service.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          {service.icon}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{service.name}</CardTitle>
                          <CardDescription className="mt-1">
                            {service.description}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={service.status === 'active' ? 'default' : 'secondary'}>
                          {service.status === 'active' ? (
                            <><CheckCircle2 className="w-3 h-3 mr-1" /> Active</>
                          ) : (
                            <><AlertCircle className="w-3 h-3 mr-1" /> Inactive</>
                          )}
                        </Badge>
                        {service.documentationUrl && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(service.documentationUrl, '_blank')}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Usage Stats */}
                    {service.status === 'active' && (
                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <div>
                          <span className="font-medium">Last used:</span> {service.lastUsed}
                        </div>
                        <div>
                          <span className="font-medium">Requests:</span> {service.usageCount?.toLocaleString()}
                        </div>
                      </div>
                    )}

                    {/* API Key Management */}
                    {editingService === service.id ? (
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label htmlFor={`api-key-${service.id}`}>API Key</Label>
                          <div className="flex gap-2">
                            <div className="relative flex-1">
                              <Input
                                id={`api-key-${service.id}`}
                                type={showKey[service.id] ? 'text' : 'password'}
                                placeholder="Enter your API key..."
                                value={apiKeys[service.id] || ''}
                                onChange={(e) => setApiKeys({ ...apiKeys, [service.id]: e.target.value })}
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                className="absolute right-1 top-1/2 -translate-y-1/2"
                                onClick={() => toggleShowKey(service.id)}
                              >
                                {showKey[service.id] ? (
                                  <EyeOff className="w-4 h-4" />
                                ) : (
                                  <Eye className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={() => handleSaveKey(service.id)}>
                            <Save className="w-4 h-4 mr-2" />
                            Save Key
                          </Button>
                          <Button variant="outline" onClick={() => setEditingService(null)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        {service.status === 'active' ? (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingService(service.id)}
                            >
                              <Key className="w-4 h-4 mr-2" />
                              Update Key
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleTestConnection(service.id)}
                            >
                              <RefreshCw className="w-4 h-4 mr-2" />
                              Test Connection
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveKey(service.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Remove
                            </Button>
                          </>
                        ) : (
                          <Button
                            onClick={() => setEditingService(service.id)}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add API Key
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
