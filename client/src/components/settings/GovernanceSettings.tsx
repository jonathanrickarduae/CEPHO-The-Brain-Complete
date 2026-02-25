import { useState } from 'react';
import { Shield, ShieldCheck, Lock, Unlock, AlertTriangle, CheckCircle2, Info, Filter } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useGovernance } from '@/hooks/useGovernance';
import { toast } from 'sonner';

export function GovernanceSettings() {
  const { mode, requestModeChange, features } = useGovernance();
  const [filterMode, setFilterMode] = useState<'all' | 'allowed' | 'blocked'>('all');

  const integrations = [
    { id: 'openai', name: 'OpenAI GPT-4', category: 'AI Models', omniAllowed: true, governedAllowed: false },
    { id: 'claude', name: 'Anthropic Claude', category: 'AI Models', omniAllowed: true, governedAllowed: false },
    { id: 'gemini', name: 'Google Gemini', category: 'AI Models', omniAllowed: true, governedAllowed: false },
    { id: 'copilot', name: 'Microsoft Copilot', category: 'AI Tools', omniAllowed: true, governedAllowed: true },
    { id: 'ai-smes', name: 'AI-SME Experts', category: 'Expert Network', omniAllowed: true, governedAllowed: false },
    { id: 'digital-twin', name: 'Digital Twin', category: 'AI Agents', omniAllowed: true, governedAllowed: true },
    { id: 'voice-input', name: 'Voice Input', category: 'Input Methods', omniAllowed: true, governedAllowed: true },
    { id: 'training-studio', name: 'Training Studio', category: 'AI Training', omniAllowed: true, governedAllowed: false },
    { id: 'data-export', name: 'Data Export', category: 'Data Management', omniAllowed: true, governedAllowed: false },
    { id: 'autonomous-agents', name: 'Autonomous Agents', category: 'AI Agents', omniAllowed: true, governedAllowed: false },
  ];

  const handleModeToggle = () => {
    const newMode = mode === 'omni' ? 'governed' : 'omni';
    requestModeChange(newMode);
    toast.success(`Switching to ${newMode === 'omni' ? 'Everything' : 'Governed'} mode`);
  };

  const filteredIntegrations = integrations.filter(integration => {
    const isAllowed = mode === 'omni' ? integration.omniAllowed : integration.governedAllowed;
    if (filterMode === 'allowed') return isAllowed;
    if (filterMode === 'blocked') return !isAllowed;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Governance Mode Toggle */}
      <Card className="border-2 border-border bg-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {mode === 'governed' ? (
                <ShieldCheck className="w-6 h-6 text-emerald-500" />
              ) : (
                <Shield className="w-6 h-6 text-amber-500" />
              )}
              <div>
                <CardTitle className="text-xl">Governance Mode</CardTitle>
                <CardDescription>
                  Control which AI tools and integrations are available
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm font-medium text-foreground">
                  {mode === 'governed' ? 'GOVERNED' : 'EVERYTHING'}
                </div>
                <div className="text-xs text-muted-foreground">
                  {mode === 'governed' ? 'Company approved only' : 'All tools available'}
                </div>
              </div>
              <Switch
                checked={mode === 'governed'}
                onCheckedChange={handleModeToggle}
                className="data-[state=checked]:bg-emerald-500"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className={`p-4 rounded-lg border-2 ${
            mode === 'governed' 
              ? 'bg-emerald-500/10 border-emerald-500/50' 
              : 'bg-amber-500/10 border-amber-500/50'
          }`}>
            <div className="flex items-start gap-3">
              <Info className={`w-5 h-5 mt-0.5 ${mode === 'governed' ? 'text-emerald-400' : 'text-amber-400'}`} />
              <div className="flex-1">
                <p className={`font-medium ${mode === 'governed' ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {mode === 'governed' ? 'Governed Mode Active' : 'Everything Mode Active'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {mode === 'governed' 
                    ? 'Only company-approved AI tools like Microsoft Copilot are available. External AI models and autonomous agents are disabled for compliance.'
                    : 'All AI tools, models, and integrations are available. Use this mode for maximum flexibility and access to all platform features.'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Integration Filters */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-foreground">Filter:</span>
        <div className="flex gap-2">
          <Button
            variant={filterMode === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterMode('all')}
          >
            All ({integrations.length})
          </Button>
          <Button
            variant={filterMode === 'allowed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterMode('allowed')}
            className={filterMode === 'allowed' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
          >
            <CheckCircle2 className="w-4 h-4 mr-1" />
            Allowed ({filteredIntegrations.filter(i => mode === 'omni' ? i.omniAllowed : i.governedAllowed).length})
          </Button>
          <Button
            variant={filterMode === 'blocked' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterMode('blocked')}
            className={filterMode === 'blocked' ? 'bg-red-600 hover:bg-red-700' : ''}
          >
            <Lock className="w-4 h-4 mr-1" />
            Blocked ({integrations.filter(i => mode === 'omni' ? !i.omniAllowed : !i.governedAllowed).length})
          </Button>
        </div>
      </div>

      {/* Integrations List */}
      <div className="grid gap-3">
        {filteredIntegrations.map((integration) => {
          const isAllowed = mode === 'omni' ? integration.omniAllowed : integration.governedAllowed;
          
          return (
            <Card key={integration.id} className={`border ${
              isAllowed 
                ? 'border-emerald-500/30 bg-emerald-500/5' 
                : 'border-red-500/30 bg-red-500/5'
            }`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {isAllowed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <Lock className="w-5 h-5 text-red-500" />
                    )}
                    <div>
                      <div className="font-medium text-foreground">{integration.name}</div>
                      <div className="text-xs text-muted-foreground">{integration.category}</div>
                    </div>
                  </div>
                  <Badge variant={isAllowed ? 'default' : 'destructive'} className={
                    isAllowed ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' : ''
                  }>
                    {isAllowed ? 'Allowed' : 'Blocked'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredIntegrations.length === 0 && (
        <div className="text-center py-12">
          <Filter className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No integrations match this filter</p>
        </div>
      )}
    </div>
  );
}
