import { useState } from 'react';
import { 
  Sparkles, Calendar, Mail, FileText, Shield, 
  Activity, Briefcase, Cloud, Database, Zap,
  ChevronRight, Check, X, Star, TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

interface IntegrationSuggestion {
  id: string;
  name: string;
  description: string;
  icon: typeof Calendar;
  category: 'productivity' | 'communication' | 'security' | 'wellness' | 'business';
  priority: 'essential' | 'recommended' | 'optional';
  setupTime: string;
  benefits: string[];
  usersConnected: number;
  matchScore: number; // 0-100 based on user profile
}

const SUGGESTED_INTEGRATIONS: IntegrationSuggestion[] = [
  {
    id: 'calendar',
    name: 'Calendar Sync',
    description: 'Connect Google Calendar or Outlook to enable smart scheduling and meeting prep',
    icon: Calendar,
    category: 'productivity',
    priority: 'essential',
    setupTime: '2 min',
    benefits: ['Auto-generate meeting briefs', 'Smart scheduling suggestions', 'Time blocking optimization'],
    usersConnected: 89,
    matchScore: 98
  },
  {
    id: 'email',
    name: 'Email Integration',
    description: 'Connect your email to enable AI-powered inbox management and smart replies',
    icon: Mail,
    category: 'communication',
    priority: 'essential',
    setupTime: '3 min',
    benefits: ['Smart email prioritization', 'AI draft suggestions', 'Automatic follow-up reminders'],
    usersConnected: 85,
    matchScore: 95
  },
  {
    id: 'vault',
    name: 'Secure Vault',
    description: 'Enable encrypted storage for sensitive documents and credentials',
    icon: Shield,
    category: 'security',
    priority: 'essential',
    setupTime: '1 min',
    benefits: ['Military-grade encryption', 'Secure credential storage', 'Audit logging'],
    usersConnected: 92,
    matchScore: 92
  },
  {
    id: 'documents',
    name: 'Document Library',
    description: 'Connect cloud storage to centralize and search all your documents',
    icon: FileText,
    category: 'productivity',
    priority: 'recommended',
    setupTime: '5 min',
    benefits: ['AI-powered search', 'Auto-categorization', 'Version control'],
    usersConnected: 76,
    matchScore: 88
  },
  {
    id: 'wellness',
    name: 'Wellness Tracking',
    description: 'Connect wearables to optimize your performance based on health data',
    icon: Activity,
    category: 'wellness',
    priority: 'recommended',
    setupTime: '3 min',
    benefits: ['Recovery-based scheduling', 'Energy optimization', 'Stress management'],
    usersConnected: 45,
    matchScore: 75
  },
  {
    id: 'crm',
    name: 'CRM Integration',
    description: 'Connect your CRM to enhance relationship intelligence',
    icon: Briefcase,
    category: 'business',
    priority: 'optional',
    setupTime: '10 min',
    benefits: ['Contact enrichment', 'Deal tracking', 'Relationship insights'],
    usersConnected: 34,
    matchScore: 65
  }
];

interface IntegrationSuggestionsProps {
  onConnect?: (integrationId: string) => void;
  onDismiss?: (integrationId: string) => void;
  compact?: boolean;
}

export function IntegrationSuggestions({ onConnect, onDismiss, compact = false }: IntegrationSuggestionsProps) {
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [connectedIds, setConnectedIds] = useState<string[]>(['vault']); // Vault is pre-connected

  const visibleSuggestions = SUGGESTED_INTEGRATIONS.filter(
    s => !dismissedIds.includes(s.id) && !connectedIds.includes(s.id)
  );

  const handleConnect = (id: string) => {
    setConnectedIds(prev => [...prev, id]);
    onConnect?.(id);
    toast.success('Integration connected! Configure in Settings.');
  };

  const handleDismiss = (id: string) => {
    setDismissedIds(prev => [...prev, id]);
    onDismiss?.(id);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'essential': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'recommended': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'productivity': return 'text-cyan-400';
      case 'communication': return 'text-blue-400';
      case 'security': return 'text-green-400';
      case 'wellness': return 'text-purple-400';
      case 'business': return 'text-orange-400';
      default: return 'text-foreground/70';
    }
  };

  // Calculate setup progress
  const totalEssential = SUGGESTED_INTEGRATIONS.filter(s => s.priority === 'essential').length;
  const connectedEssential = SUGGESTED_INTEGRATIONS.filter(
    s => s.priority === 'essential' && connectedIds.includes(s.id)
  ).length;
  const setupProgress = (connectedEssential / totalEssential) * 100;

  if (compact) {
    const topSuggestion = visibleSuggestions[0];
    if (!topSuggestion) return null;

    return (
      <div className="p-3 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-lg border border-primary/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <topSuggestion.icon className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground">{topSuggestion.name}</span>
              <Badge variant="outline" className={`${getPriorityColor(topSuggestion.priority)} text-xs`}>
                {topSuggestion.priority}
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground">{topSuggestion.setupTime} setup</div>
          </div>
          <Button size="sm" onClick={() => handleConnect(topSuggestion.id)}>
            Connect
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Card className="bg-card/60 border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Sparkles className="w-5 h-5 text-primary" />
            Recommended Integrations
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Setup Progress</span>
            <div className="w-24">
              <Progress value={setupProgress} className="h-2" />
            </div>
            <span className="text-sm font-medium text-foreground">{Math.round(setupProgress)}%</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {visibleSuggestions.length === 0 ? (
          <div className="text-center py-8">
            <Check className="w-12 h-12 text-green-400 mx-auto mb-3" />
            <h3 className="font-medium text-foreground mb-1">All Set!</h3>
            <p className="text-sm text-muted-foreground">
              You've connected all recommended integrations. Explore more in Settings.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {visibleSuggestions.map((suggestion) => (
              <div 
                key={suggestion.id}
                className="p-4 rounded-lg bg-background/50 border border-border hover:border-primary/30 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-lg bg-background flex items-center justify-center ${getCategoryColor(suggestion.category)}`}>
                    <suggestion.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-foreground">{suggestion.name}</h4>
                      <Badge variant="outline" className={`${getPriorityColor(suggestion.priority)} text-xs`}>
                        {suggestion.priority}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
                        <TrendingUp className="w-3 h-3" />
                        {suggestion.matchScore}% match
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{suggestion.description}</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {suggestion.benefits.map((benefit, i) => (
                        <span key={i} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                          {benefit}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          {suggestion.setupTime}
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          {suggestion.usersConnected}% of users
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDismiss(suggestion.id)}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Later
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => handleConnect(suggestion.id)}
                        >
                          <ChevronRight className="w-4 h-4 mr-1" />
                          Connect
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default IntegrationSuggestions;
