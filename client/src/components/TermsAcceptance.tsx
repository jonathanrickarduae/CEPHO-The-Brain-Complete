import { useState } from 'react';
import { 
  FileText, Shield, AlertTriangle, Check, X,
  ExternalLink, ChevronDown, ChevronUp, Lock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

interface TermsDocument {
  id: string;
  title: string;
  version: string;
  lastUpdated: string;
  summary: string;
  keyPoints: string[];
  fullTextUrl: string;
  required: boolean;
}

interface ToolTerms {
  toolId: string;
  toolName: string;
  category: 'ai' | 'integration' | 'storage' | 'communication';
  governanceLevel: 'standard' | 'governed' | 'restricted';
  terms: TermsDocument[];
  dataUsage: {
    collected: string[];
    shared: string[];
    retention: string;
  };
  acceptedAt?: Date;
}

// Mock terms data
const MOCK_TOOL_TERMS: ToolTerms[] = [
  {
    toolId: 'claude-ai',
    toolName: 'Claude AI Assistant',
    category: 'ai',
    governanceLevel: 'standard',
    terms: [
      {
        id: 't1',
        title: 'AI Usage Terms',
        version: '2.1',
        lastUpdated: '2024-01-15',
        summary: 'Terms governing the use of AI-powered features within The Brain platform.',
        keyPoints: [
          'AI responses are generated based on your inputs and context',
          'Conversations may be used to improve AI quality (anonymized)',
          'You retain ownership of your inputs and outputs',
          'AI should not be used for illegal or harmful purposes'
        ],
        fullTextUrl: '#',
        required: true
      }
    ],
    dataUsage: {
      collected: ['Conversation history', 'User preferences', 'Usage patterns'],
      shared: ['Anonymized data with AI provider for improvement'],
      retention: '90 days for active data, 2 years for backups'
    }
  },
  {
    toolId: 'ideals-integration',
    toolName: 'iDeals Data Room',
    category: 'integration',
    governanceLevel: 'governed',
    terms: [
      {
        id: 't2',
        title: 'Data Room Integration Terms',
        version: '1.3',
        lastUpdated: '2024-02-01',
        summary: 'Terms for connecting and syncing data with iDeals virtual data room.',
        keyPoints: [
          'Documents synced are subject to iDeals security policies',
          'Access permissions are inherited from iDeals settings',
          'Audit logs are maintained for all document access',
          'Integration can be revoked at any time'
        ],
        fullTextUrl: '#',
        required: true
      },
      {
        id: 't3',
        title: 'Data Processing Agreement',
        version: '1.0',
        lastUpdated: '2024-01-01',
        summary: 'GDPR-compliant data processing agreement for EU users.',
        keyPoints: [
          'Data processed in accordance with GDPR requirements',
          'Sub-processors listed and updated regularly',
          'Data subject rights fully supported'
        ],
        fullTextUrl: '#',
        required: true
      }
    ],
    dataUsage: {
      collected: ['Document metadata', 'Access logs', 'User activity'],
      shared: ['Document access with iDeals platform'],
      retention: 'As per your iDeals retention settings'
    }
  },
  {
    toolId: 'digital-twin',
    toolName: 'Chief of Staff AI',
    category: 'ai',
    governanceLevel: 'restricted',
    terms: [
      {
        id: 't4',
        title: 'Chief of Staff Terms of Service',
        version: '3.0',
        lastUpdated: '2024-03-01',
        summary: 'Terms governing the Chief of Staff AI that learns and acts on your behalf.',
        keyPoints: [
          'Chief of Staff learns from your behavior and preferences',
          'Actions taken by Twin require your approval (configurable)',
          'Training data is encrypted and stored securely',
          'You can reset or delete Twin data at any time'
        ],
        fullTextUrl: '#',
        required: true
      }
    ],
    dataUsage: {
      collected: ['Behavioral patterns', 'Communication style', 'Decision history'],
      shared: ['None - all Twin data is private'],
      retention: 'Until you delete your account or reset Twin'
    },
    acceptedAt: new Date('2024-01-10')
  }
];

interface TermsAcceptanceProps {
  toolId?: string;
  onAccept?: (toolId: string) => void;
  onDecline?: (toolId: string) => void;
}

export function TermsAcceptance({ toolId, onAccept, onDecline }: TermsAcceptanceProps) {
  const [selectedTool, setSelectedTool] = useState<ToolTerms | null>(
    toolId ? MOCK_TOOL_TERMS.find(t => t.toolId === toolId) || null : null
  );
  const [expandedTerms, setExpandedTerms] = useState<string[]>([]);
  const [acceptedTerms, setAcceptedTerms] = useState<string[]>([]);

  const getGovernanceColor = (level: string) => {
    switch (level) {
      case 'standard': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'governed': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'restricted': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-foreground/70 border-gray-500/30';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'ai': return Shield;
      case 'integration': return ExternalLink;
      case 'storage': return Lock;
      default: return FileText;
    }
  };

  const toggleTermExpanded = (termId: string) => {
    setExpandedTerms(prev => 
      prev.includes(termId) 
        ? prev.filter(id => id !== termId)
        : [...prev, termId]
    );
  };

  const toggleTermAccepted = (termId: string) => {
    setAcceptedTerms(prev => 
      prev.includes(termId) 
        ? prev.filter(id => id !== termId)
        : [...prev, termId]
    );
  };

  const handleAcceptAll = () => {
    if (!selectedTool) return;
    
    const allRequired = selectedTool.terms.filter(t => t.required).every(t => acceptedTerms.includes(t.id));
    if (!allRequired) {
      toast.error('Please accept all required terms');
      return;
    }
    
    onAccept?.(selectedTool.toolId);
    toast.success(`Terms accepted for ${selectedTool.toolName}`);
    setSelectedTool(null);
    setAcceptedTerms([]);
  };

  const handleDecline = () => {
    if (!selectedTool) return;
    onDecline?.(selectedTool.toolId);
    toast.info(`${selectedTool.toolName} will not be enabled`);
    setSelectedTool(null);
    setAcceptedTerms([]);
  };

  if (selectedTool) {
    const CategoryIcon = getCategoryIcon(selectedTool.category);
    const allRequiredAccepted = selectedTool.terms.filter(t => t.required).every(t => acceptedTerms.includes(t.id));
    
    return (
      <div className="space-y-4">
        {/* Tool Header */}
        <Card className="bg-card/60 border-border">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                  <CategoryIcon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">{selectedTool.toolName}</h2>
                  <p className="text-sm text-muted-foreground capitalize">{selectedTool.category} Tool</p>
                </div>
              </div>
              <Badge variant="outline" className={getGovernanceColor(selectedTool.governanceLevel)}>
                {selectedTool.governanceLevel}
              </Badge>
            </div>
            {selectedTool.acceptedAt && (
              <div className="mt-3 flex items-center gap-2 text-sm text-green-400">
                <Check className="w-4 h-4" />
                Terms accepted on {selectedTool.acceptedAt.toLocaleDateString('en-GB')}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Terms Documents */}
        <Card className="bg-card/60 border-border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-foreground text-base">
              <FileText className="w-4 h-4 text-primary" />
              Terms & Conditions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {selectedTool.terms.map((term) => (
              <div 
                key={term.id}
                className="border border-border rounded-lg overflow-hidden"
              >
                <div 
                  className="flex items-center justify-between p-3 bg-background/50 cursor-pointer"
                  onClick={() => toggleTermExpanded(term.id)}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={acceptedTerms.includes(term.id)}
                      onCheckedChange={() => toggleTermAccepted(term.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">{term.title}</span>
                        {term.required && (
                          <Badge variant="outline" className="text-xs bg-red-500/20 text-red-400 border-red-500/30">
                            Required
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        v{term.version} • Updated {term.lastUpdated}
                      </div>
                    </div>
                  </div>
                  {expandedTerms.includes(term.id) ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
                
                {expandedTerms.includes(term.id) && (
                  <div className="p-3 border-t border-border">
                    <p className="text-sm text-muted-foreground mb-3">{term.summary}</p>
                    <div className="space-y-2 mb-3">
                      <h5 className="text-sm font-medium text-foreground">Key Points:</h5>
                      <ul className="space-y-1">
                        {term.keyPoints.map((point, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-primary">•</span>
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <Button variant="link" size="sm" className="p-0 h-auto">
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Read Full Terms
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Data Usage */}
        <Card className="bg-card/60 border-border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-foreground text-base">
              <Shield className="w-4 h-4 text-primary" />
              Data Usage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <h5 className="font-medium text-foreground mb-1">Data Collected:</h5>
              <ul className="text-muted-foreground">
                {selectedTool.dataUsage.collected.map((item, i) => (
                  <li key={i}>• {item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-foreground mb-1">Data Shared:</h5>
              <ul className="text-muted-foreground">
                {selectedTool.dataUsage.shared.map((item, i) => (
                  <li key={i}>• {item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-foreground mb-1">Retention:</h5>
              <p className="text-muted-foreground">{selectedTool.dataUsage.retention}</p>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        {!selectedTool.acceptedAt && (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleDecline}
              className="flex-1"
            >
              <X className="w-4 h-4 mr-2" />
              Decline
            </Button>
            <Button 
              onClick={handleAcceptAll}
              disabled={!allRequiredAccepted}
              className="flex-1"
            >
              <Check className="w-4 h-4 mr-2" />
              Accept & Enable
            </Button>
          </div>
        )}

        <Button 
          variant="ghost" 
          onClick={() => setSelectedTool(null)}
          className="w-full"
        >
          Back to Tools
        </Button>
      </div>
    );
  }

  return (
    <Card className="bg-card/60 border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-foreground">
          <FileText className="w-5 h-5 text-primary" />
          Terms & Conditions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {MOCK_TOOL_TERMS.map((tool) => {
            const CategoryIcon = getCategoryIcon(tool.category);
            return (
              <div 
                key={tool.toolId}
                onClick={() => setSelectedTool(tool)}
                className="flex items-center gap-3 p-3 rounded-lg bg-background/50 hover:bg-background/80 cursor-pointer transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <CategoryIcon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-foreground truncate">{tool.toolName}</div>
                  <div className="text-xs text-muted-foreground">
                    {tool.terms.length} document{tool.terms.length !== 1 ? 's' : ''}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {tool.acceptedAt ? (
                    <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
                      <Check className="w-3 h-3 mr-1" />
                      Accepted
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Pending
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export default TermsAcceptance;
