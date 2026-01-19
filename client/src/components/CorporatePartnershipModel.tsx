import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2,
  Users,
  Handshake,
  DollarSign,
  Target,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  Download,
  Star,
  Crown,
  Gem
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

/**
 * Three-Tier Corporate Partnership Model
 * 
 * Tier 1: Strategic Partners - Deep integration, co-development, revenue share
 * Tier 2: Channel Partners - Resellers, referrals, affiliate relationships
 * Tier 3: Technology Partners - API integrations, ecosystem connections
 */

interface PartnershipTier {
  id: string;
  name: string;
  icon: typeof Building2;
  color: string;
  bgColor: string;
  description: string;
  benefits: string[];
  requirements: string[];
  revenueModel: string;
  examples: string[];
  commitment: string;
  targetCount: string;
}

const partnershipTiers: PartnershipTier[] = [
  {
    id: 'strategic',
    name: 'Strategic Partners',
    icon: Crown,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/20',
    description: 'Deep, long-term partnerships with co-development and shared go-to-market',
    benefits: [
      'Co-branded solutions and joint marketing',
      'Revenue share on joint customers (20-30%)',
      'Early access to product roadmap',
      'Dedicated partner success manager',
      'Joint case studies and PR',
      'Executive sponsorship and QBRs'
    ],
    requirements: [
      'Minimum $500K annual commitment',
      'Dedicated partnership team',
      'Joint business plan',
      'Technical integration capability',
      'Aligned customer base'
    ],
    revenueModel: '20-30% revenue share on joint deals',
    examples: ['Salesforce', 'Microsoft', 'AWS'],
    commitment: '2+ year agreement',
    targetCount: '3-5 partners'
  },
  {
    id: 'channel',
    name: 'Channel Partners',
    icon: Handshake,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
    description: 'Resellers and referral partners who extend market reach',
    benefits: [
      'Referral commission (10-20%)',
      'Partner portal access',
      'Sales enablement materials',
      'Lead registration protection',
      'Partner certification program',
      'Marketing development funds'
    ],
    requirements: [
      'Minimum 5 referrals per quarter',
      'Completed partner training',
      'Active customer base in target market',
      'Sales team capacity'
    ],
    revenueModel: '10-20% commission on referred deals',
    examples: ['Consulting firms', 'VARs', 'System integrators'],
    commitment: '1 year agreement',
    targetCount: '20-50 partners'
  },
  {
    id: 'technology',
    name: 'Technology Partners',
    icon: Gem,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/20',
    description: 'API and integration partners that enhance the ecosystem',
    benefits: [
      'API access and documentation',
      'Integration marketplace listing',
      'Technical support channel',
      'Co-marketing opportunities',
      'Developer community access'
    ],
    requirements: [
      'Completed API integration',
      'Maintained integration quality',
      'Customer support capability',
      'Documentation provided'
    ],
    revenueModel: 'Free tier + premium API access fees',
    examples: ['Zapier', 'Slack', 'HubSpot'],
    commitment: 'Ongoing',
    targetCount: '100+ integrations'
  }
];

interface CorporatePartnershipModelProps {
  onTierSelect?: (tier: PartnershipTier) => void;
}

export function CorporatePartnershipModel({ onTierSelect }: CorporatePartnershipModelProps) {
  const [activeTier, setActiveTier] = useState('strategic');

  const exportModel = () => {
    const markdown = `# Three-Tier Corporate Partnership Model

## Overview
A structured approach to building strategic partnerships that drive growth and expand market reach.

${partnershipTiers.map(tier => `
## ${tier.name}
**Description:** ${tier.description}

**Target:** ${tier.targetCount}
**Commitment:** ${tier.commitment}
**Revenue Model:** ${tier.revenueModel}

### Benefits
${tier.benefits.map(b => `- ${b}`).join('\n')}

### Requirements
${tier.requirements.map(r => `- ${r}`).join('\n')}

### Examples
${tier.examples.map(e => `- ${e}`).join('\n')}
`).join('\n---\n')}

## Partnership Lifecycle

1. **Identification** - Research and identify potential partners
2. **Qualification** - Assess fit and mutual value
3. **Engagement** - Initial conversations and alignment
4. **Agreement** - Contract negotiation and signing
5. **Onboarding** - Technical and commercial setup
6. **Activation** - Launch joint activities
7. **Growth** - Expand relationship and revenue
8. **Review** - Quarterly business reviews and optimization
`;

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'corporate-partnership-model.md';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Partnership model exported');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-cyan-500/10 border-gray-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#E91E8C]" />
                Three-Tier Corporate Partnership Model
              </CardTitle>
              <CardDescription>
                Strategic framework for building and managing corporate partnerships
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={exportModel}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Tier Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {partnershipTiers.map(tier => {
          const Icon = tier.icon;
          const isActive = activeTier === tier.id;
          
          return (
            <Card 
              key={tier.id}
              className={cn(
                'cursor-pointer transition-all',
                isActive 
                  ? `${tier.bgColor} border-2` 
                  : 'bg-gray-900/50 border-gray-800 hover:border-gray-700'
              )}
              style={{ borderColor: isActive ? tier.color.replace('text-', '').replace('-400', '') : undefined }}
              onClick={() => {
                setActiveTier(tier.id);
                onTierSelect?.(tier);
              }}
            >
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className={cn('w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4', tier.bgColor)}>
                    <Icon className={cn('w-8 h-8', tier.color)} />
                  </div>
                  <h3 className={cn('text-lg font-semibold', tier.color)}>{tier.name}</h3>
                  <p className="text-sm text-muted-foreground mt-2">{tier.description}</p>
                  <div className="mt-4 space-y-2">
                    <Badge variant="outline" className="text-xs">
                      {tier.targetCount}
                    </Badge>
                    <p className="text-xs text-muted-foreground">{tier.commitment}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Detailed Tier View */}
      {partnershipTiers.map(tier => {
        if (tier.id !== activeTier) return null;
        const Icon = tier.icon;
        
        return (
          <Card key={tier.id} className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className={cn('p-3 rounded-lg', tier.bgColor)}>
                  <Icon className={cn('w-6 h-6', tier.color)} />
                </div>
                <div>
                  <CardTitle className="text-white">{tier.name}</CardTitle>
                  <CardDescription>{tier.revenueModel}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Benefits */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-white flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-400" />
                    Partner Benefits
                  </h4>
                  <ul className="space-y-2">
                    {tier.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Requirements */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-white flex items-center gap-2">
                    <Target className="w-4 h-4 text-cyan-400" />
                    Requirements
                  </h4>
                  <ul className="space-y-2">
                    {tier.requirements.map((req, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <ArrowRight className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Examples */}
              <div className="mt-6 p-4 bg-gray-800/50 rounded-lg">
                <h4 className="text-sm font-medium text-white mb-3">Example Partners</h4>
                <div className="flex flex-wrap gap-2">
                  {tier.examples.map((example, index) => (
                    <Badge key={index} variant="outline" className={cn(tier.bgColor, tier.color, 'border-0')}>
                      {example}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Partnership Lifecycle */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            Partnership Lifecycle
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 items-center">
            {[
              { step: 'Identify', color: 'bg-blue-500/20 text-blue-400' },
              { step: 'Qualify', color: 'bg-purple-500/20 text-purple-400' },
              { step: 'Engage', color: 'bg-pink-500/20 text-pink-400' },
              { step: 'Agreement', color: 'bg-amber-500/20 text-amber-400' },
              { step: 'Onboard', color: 'bg-cyan-500/20 text-cyan-400' },
              { step: 'Activate', color: 'bg-green-500/20 text-green-400' },
              { step: 'Grow', color: 'bg-emerald-500/20 text-emerald-400' },
              { step: 'Review', color: 'bg-indigo-500/20 text-indigo-400' }
            ].map((item, index, arr) => (
              <div key={item.step} className="flex items-center gap-2">
                <Badge className={cn('border-0', item.color)}>
                  {index + 1}. {item.step}
                </Badge>
                {index < arr.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-gray-600" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-green-400" />
            Key Partnership Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Partner-Sourced Revenue', target: '30%', desc: 'of total revenue' },
              { label: 'Partner Activation Rate', target: '80%', desc: 'within 90 days' },
              { label: 'Partner NPS', target: '50+', desc: 'satisfaction score' },
              { label: 'Co-Sell Win Rate', target: '40%', desc: 'on joint deals' }
            ].map((metric, index) => (
              <div key={index} className="p-3 bg-gray-800/50 rounded-lg text-center">
                <p className="text-2xl font-bold text-white">{metric.target}</p>
                <p className="text-sm text-muted-foreground">{metric.label}</p>
                <p className="text-xs text-muted-foreground">{metric.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default CorporatePartnershipModel;
