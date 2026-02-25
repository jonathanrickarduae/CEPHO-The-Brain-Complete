import { useState } from 'react';
import { Shield, ShieldCheck, Lock, CheckCircle2, Info, Filter } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useGovernance } from '@/hooks/useGovernance';
import { toast } from 'sonner';

// Real integrations with actual governance rules
const REAL_INTEGRATIONS = [
  // Microsoft 365 - Allowed in governed mode
  { id: 'copilot', name: 'Microsoft Copilot', category: 'AI Assistant', governedAllowed: true },
  { id: 'outlook', name: 'Microsoft Outlook', category: 'Email', governedAllowed: true },
  { id: 'teams', name: 'Microsoft Teams', category: 'Communication', governedAllowed: true },
  { id: 'onedrive', name: 'Microsoft OneDrive', category: 'Storage', governedAllowed: true },
  
  // External AI - Blocked in governed mode
  { id: 'openai', name: 'OpenAI GPT-4', category: 'AI Models', governedAllowed: false },
  { id: 'claude', name: 'Anthropic Claude', category: 'AI Models', governedAllowed: false },
  { id: 'gemini', name: 'Google Gemini', category: 'AI Models', governedAllowed: false },
  
  // Other services
  { id: 'gmail', name: 'Gmail', category: 'Email', governedAllowed: false },
  { id: 'slack', name: 'Slack', category: 'Communication', governedAllowed: false },
  { id: 'notion', name: 'Notion', category: 'Productivity', governedAllowed: false },
];

export function GovernanceSettings() {
  const { mode, requestModeChange } = useGovernance();
  const [filterMode, setFilterMode] = useState<'all' | 'allowed' | 'blocked'>('all');

  const handleModeToggle = () => {
    const newMode = mode === 'omni' ? 'governed' : 'omni';
    requestModeChange(newMode);
    toast.success(`Switched to ${newMode === 'omni' ? 'Everything' : 'Governed'} mode`);
  };

  const filteredIntegrations = REAL_INTEGRATIONS.filter(integration => {
    const isAllowed = mode === 'omni' ? true : integration.governedAllowed;
    if (filterMode === 'allowed') return isAllowed;
    if (filterMode === 'blocked') return !isAllowed;
    return true;
  });

  const allowedCount = REAL_INTEGRATIONS.filter(i => mode === 'omni' ? true : i.governedAllowed).length;
  const blockedCount = REAL_INTEGRATIONS.length - allowedCount;

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
                  Control which tools and integrations are available
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm font-medium text-foreground">
                  {mode === 'governed' ? 'GOVERNED' : 'EVERYTHING'}
                </div>
                <div className="text-xs text-muted-foreground">
                  {mode === 'governed' ? 'Microsoft 365 only' : 'All tools available'}
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
                    ? 'Only Microsoft 365 tools (Copilot, Outlook, Teams, OneDrive) are available. External AI models and third-party services are disabled for compliance.'
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
            All ({REAL_INTEGRATIONS.length})
          </Button>
          <Button
            variant={filterMode === 'allowed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterMode('allowed')}
            className={filterMode === 'allowed' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
          >
            <CheckCircle2 className="w-4 h-4 mr-1" />
            Allowed ({allowedCount})
          </Button>
          <Button
            variant={filterMode === 'blocked' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterMode('blocked')}
            className={filterMode === 'blocked' ? 'bg-red-600 hover:bg-red-700' : ''}
          >
            <Lock className="w-4 h-4 mr-1" />
            Blocked ({blockedCount})
          </Button>
        </div>
      </div>

      {/* Integrations List */}
      <div className="space-y-2">
        {filteredIntegrations.map((integration) => {
          const isAllowed = mode === 'omni' ? true : integration.governedAllowed;
          
          return (
            <div
              key={integration.id}
              className={`flex items-center justify-between p-4 rounded-lg border ${
                isAllowed 
                  ? 'border-emerald-500/30 bg-emerald-500/5' 
                  : 'border-red-500/30 bg-red-500/5'
              }`}
            >
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
