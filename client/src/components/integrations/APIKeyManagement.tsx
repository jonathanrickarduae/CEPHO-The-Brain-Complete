import { useState } from 'react';
import { Shield, ShieldCheck, Plus, Trash2, Eye, EyeOff, Check, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { toast } from 'sonner';

interface APIKey {
  id: string;
  serviceName: string;
  serviceType: string;
  isApproved: boolean;
  approvedBy?: string;
  description: string;
  hasKey: boolean;
}

const AVAILABLE_SERVICES = [
  { name: 'Microsoft Copilot', type: 'ai', description: 'AI-powered coding assistant' },
  { name: 'Microsoft Outlook', type: 'email', description: 'Email and calendar integration' },
  { name: 'OpenAI GPT-4', type: 'ai', description: 'Advanced language model' },
  { name: 'ElevenLabs', type: 'voice', description: 'Text-to-speech generation' },
  { name: 'Synthesia', type: 'video', description: 'AI video generation' },
  { name: 'Google Workspace', type: 'productivity', description: 'Gmail, Drive, Calendar' },
  { name: 'Slack', type: 'communication', description: 'Team messaging' },
  { name: 'Asana', type: 'productivity', description: 'Project management' },
];

export function APIKeyManagement() {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([
    {
      id: '1',
      serviceName: 'OpenAI GPT-4',
      serviceType: 'ai',
      isApproved: true,
      approvedBy: 'Chief of Staff',
      description: 'Advanced language model',
      hasKey: true,
    },
    {
      id: '2',
      serviceName: 'ElevenLabs',
      serviceType: 'voice',
      isApproved: true,
      approvedBy: 'Chief of Staff',
      description: 'Text-to-speech generation',
      hasKey: true,
    },
    {
      id: '3',
      serviceName: 'Synthesia',
      serviceType: 'video',
      isApproved: true,
      approvedBy: 'Chief of Staff',
      description: 'AI video generation',
      hasKey: true,
    },
  ]);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedService, setSelectedService] = useState('');
  const [apiKeyValue, setApiKeyValue] = useState('');
  const [showKey, setShowKey] = useState<string | null>(null);

  const handleAddAPIKey = () => {
    if (!selectedService || !apiKeyValue) {
      toast.error('Please select a service and enter an API key');
      return;
    }

    const service = AVAILABLE_SERVICES.find(s => s.name === selectedService);
    if (!service) return;

    const newKey: APIKey = {
      id: Date.now().toString(),
      serviceName: service.name,
      serviceType: service.type,
      isApproved: false, // Requires approval
      description: service.description,
      hasKey: true,
    };

    setApiKeys([...apiKeys, newKey]);
    setShowAddModal(false);
    setSelectedService('');
    setApiKeyValue('');
    toast.success(`${service.name} API key added. Pending approval.`);
  };

  const handleApprove = (id: string) => {
    setApiKeys(apiKeys.map(key => 
      key.id === id ? { ...key, isApproved: true, approvedBy: 'Chief of Staff' } : key
    ));
    toast.success('API key approved for use in Governed Mode');
  };

  const handleRevoke = (id: string) => {
    setApiKeys(apiKeys.map(key => 
      key.id === id ? { ...key, isApproved: false, approvedBy: undefined } : key
    ));
    toast.warning('API key approval revoked');
  };

  const handleDelete = (id: string) => {
    setApiKeys(apiKeys.filter(key => key.id !== id));
    toast.success('API key deleted');
  };

  const approvedCount = apiKeys.filter(k => k.isApproved).length;
  const pendingCount = apiKeys.filter(k => !k.isApproved).length;

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            API Key Management
          </h2>
          <p className="text-muted-foreground mt-1">
            Control which external services can be used in Governed Mode
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add API Key
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Approved APIs</p>
                <p className="text-3xl font-bold text-emerald-500">{approvedCount}</p>
              </div>
              <ShieldCheck className="w-8 h-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Approval</p>
                <p className="text-3xl font-bold text-amber-500">{pendingCount}</p>
              </div>
              <Shield className="w-8 h-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* API Keys List */}
      <Card>
        <CardHeader>
          <CardTitle>Configured API Keys</CardTitle>
          <CardDescription>
            Approved keys can be used in Governed Mode. Unapproved keys require Chief of Staff approval.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {apiKeys.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No API keys configured. Click "Add API Key" to get started.
              </p>
            ) : (
              apiKeys.map((key) => (
                <div
                  key={key.id}
                  className={`p-4 rounded-lg border-2 ${
                    key.isApproved
                      ? 'border-emerald-500/50 bg-emerald-500/10'
                      : 'border-amber-500/50 bg-amber-500/10'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">{key.serviceName}</h3>
                        {key.isApproved ? (
                          <span className="flex items-center gap-1 text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
                            <ShieldCheck className="w-3 h-3" />
                            Approved
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">
                            <Shield className="w-3 h-3" />
                            Pending
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{key.description}</p>
                      {key.approvedBy && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Approved by: {key.approvedBy}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {!key.isApproved ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleApprove(key.id)}
                          className="text-emerald-500 hover:text-emerald-400"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRevoke(key.id)}
                          className="text-amber-500 hover:text-amber-400"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(key.id)}
                        className="text-red-500 hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add API Key Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Add API Key</CardTitle>
              <CardDescription>
                Select a service and enter its API key
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="service">Service</Label>
                <select
                  id="service"
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-md text-foreground"
                >
                  <option value="">Select a service...</option>
                  {AVAILABLE_SERVICES.map((service) => (
                    <option key={service.name} value={service.name}>
                      {service.name} - {service.description}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="apiKey">API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  value={apiKeyValue}
                  onChange={(e) => setApiKeyValue(e.target.value)}
                  placeholder="Enter API key..."
                  className="mt-1"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddAPIKey}>
                  Add API Key
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
