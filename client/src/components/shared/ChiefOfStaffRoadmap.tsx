import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Brain,
  Briefcase,
  User,
  Building2,
  CheckCircle2,
  Clock,
  Lock,
  Sparkles,
  Bot,
  MessageSquare,
  Search,
  Mail,
  FileText,
  Star,
  Utensils,
  Plane,
  Calendar,
  Phone,
  Globe,
  Zap,
  ArrowRight,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface Capability {
  id: string;
  name: string;
  description: string;
  status: 'available' | 'in_development' | 'planned' | 'future';
  phase: number;
  icon: any;
  features?: string[];
  aiAgentIntegration?: boolean;
}

interface CapabilityCategory {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  capabilities: Capability[];
}

// Personal/Lifestyle SMEs for Phase 4
const PERSONAL_SMES = [
  { id: 'travel', name: 'Travel & Hospitality Expert', description: 'Flights, hotels, experiences, and travel logistics', icon: Plane },
  { id: 'dining', name: 'Dining & Entertainment Specialist', description: 'Restaurants, events, venues, and reservations', icon: Utensils },
  { id: 'wellness', name: 'Wellness & Health Advisor', description: 'Fitness, medical appointments, and wellbeing', icon: User },
  { id: 'home', name: 'Home & Lifestyle Manager', description: 'Services, maintenance, and personal errands', icon: Building2 },
  { id: 'concierge', name: 'Concierge Specialist', description: 'Luxury services and special requests', icon: Star },
];

const CAPABILITY_CATEGORIES: CapabilityCategory[] = [
  {
    id: 'business',
    name: 'CEPHO.Ai for Business',
    description: 'Core business management with AI SME experts',
    icon: Briefcase,
    color: 'text-blue-500',
    capabilities: [
      { id: 'b1', name: 'Task Management', description: 'Manage and prioritize tasks across projects', status: 'available', phase: 1, icon: CheckCircle2 },
      { id: 'b2', name: 'Document Generation', description: 'Create reports, briefs, and presentations', status: 'available', phase: 1, icon: FileText },
      { id: 'b3', name: 'Meeting Preparation', description: 'Prepare agendas, briefings, and follow-ups', status: 'available', phase: 2, icon: Calendar },
      { id: 'b4', name: 'Strategic Analysis', description: 'Market research and competitive intelligence', status: 'available', phase: 2, icon: Search },
      { id: 'b5', name: 'Email Drafting', description: 'Draft and manage professional correspondence', status: 'in_development', phase: 3, icon: Mail },
    ]
  },
  {
    id: 'personal',
    name: 'CEPHO.Ai Personal',
    description: 'Personal life management with lifestyle SME experts (Phase 4)',
    icon: User,
    color: 'text-purple-500',
    capabilities: [
      { id: 'p1', name: 'Calendar Management', description: 'Schedule and coordinate appointments', status: 'available', phase: 1, icon: Calendar },
      { id: 'p2', name: 'Reminder System', description: 'Smart reminders and follow-ups', status: 'available', phase: 2, icon: Clock },
      { id: 'p3', name: 'Travel Planning', description: 'Research and plan travel arrangements', status: 'in_development', phase: 3, icon: Plane },
      { 
        id: 'p4', 
        name: 'Restaurant Booking', 
        description: 'Autonomous restaurant research, outreach, and booking workflow',
        status: 'planned', 
        phase: 4, 
        icon: Utensils,
        aiAgentIntegration: true,
        features: [
          'Research restaurants based on preferences and occasion',
          'Find contact information and booking channels',
          'Email restaurants and fill out inquiry forms automatically',
          'Track responses and availability from multiple venues',
          'Compile pros and cons analysis for each option',
          'Generate recommendation report with ranked choices',
          'Execute booking upon approval',
          'Communicate with restaurant AI agents where available'
        ]
      },
      { 
        id: 'p5', 
        name: 'Service Booking', 
        description: 'Book appointments, services, and reservations',
        status: 'future', 
        phase: 5, 
        icon: Phone,
        aiAgentIntegration: true,
        features: [
          'Healthcare appointments',
          'Home services coordination',
          'Professional services booking',
          'AI agent-to-agent communication'
        ]
      },
    ]
  },
  {
    id: 'ai_integration',
    name: 'AI Agent Integration',
    description: 'Communicate with external AI systems on your behalf',
    icon: Bot,
    color: 'text-cyan-500',
    capabilities: [
      { id: 'a1', name: 'Internal AI Coordination', description: 'Coordinate with CEPHO AI SME experts', status: 'available', phase: 1, icon: Brain },
      { id: 'a2', name: 'Quality Assurance Review', description: 'Multi-layer AI review and approval', status: 'available', phase: 2, icon: CheckCircle2 },
      { 
        id: 'a3', 
        name: 'External AI Communication', 
        description: 'Speak to external AI agents on behalf of the user',
        status: 'planned', 
        phase: 4, 
        icon: MessageSquare,
        aiAgentIntegration: true,
        features: [
          'Detect and connect with business AI agents',
          'Negotiate and transact through AI interfaces',
          'Handle authentication and verification',
          'Maintain conversation context across sessions',
          'Report outcomes and seek approval for decisions'
        ]
      },
      { 
        id: 'a4', 
        name: 'Multi-Agent Orchestration', 
        description: 'Coordinate multiple AI agents for complex tasks',
        status: 'future', 
        phase: 5, 
        icon: Globe,
        aiAgentIntegration: true
      },
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise Features',
    description: 'Advanced capabilities for business operations',
    icon: Building2,
    color: 'text-amber-500',
    capabilities: [
      { id: 'e1', name: 'Team Coordination', description: 'Manage team tasks and communications', status: 'in_development', phase: 3, icon: User },
      { id: 'e2', name: 'Vendor Management', description: 'Track and manage vendor relationships', status: 'planned', phase: 4, icon: Building2 },
      { id: 'e3', name: 'Contract Analysis', description: 'Review and summarize legal documents', status: 'future', phase: 5, icon: FileText },
    ]
  },
  {
    id: 'productivity',
    name: 'In-house Productivity Apps',
    description: 'Phase 5: Build productivity tools to our own standards',
    icon: Zap,
    color: 'text-emerald-500',
    capabilities: [
      { 
        id: 'prod1', 
        name: 'Task & Project Management', 
        description: 'Custom task management built to CEPHO standards',
        status: 'future', 
        phase: 5, 
        icon: CheckCircle2,
        features: [
          'Integrated with Chief of Staff workflow',
          'AI-powered prioritization',
          'SME assignment and tracking',
          'Quality gate integration'
        ]
      },
      { 
        id: 'prod2', 
        name: 'Document Management', 
        description: 'Document creation, versioning, and collaboration',
        status: 'future', 
        phase: 5, 
        icon: FileText,
        features: [
          'CEPHO branded templates',
          'AI-assisted writing',
          'Jim Short quality review',
          'Version control and audit trail'
        ]
      },
      { 
        id: 'prod3', 
        name: 'Communication Hub', 
        description: 'Unified messaging and notification system',
        status: 'future', 
        phase: 5, 
        icon: MessageSquare,
        features: [
          'Email integration',
          'Internal messaging',
          'AI-drafted responses',
          'Priority inbox management'
        ]
      },
      { 
        id: 'prod4', 
        name: 'Analytics Dashboard', 
        description: 'Business intelligence and KPI tracking',
        status: 'future', 
        phase: 5, 
        icon: Search,
        features: [
          'Real-time KPI monitoring',
          'CEO scorecard generation',
          'Trend analysis and forecasting',
          'Custom report builder'
        ]
      },
    ]
  },
  {
    id: 'commercialization',
    name: 'Commercialization',
    description: 'Phase 6: Taking CEPHO.Ai to market',
    icon: Globe,
    color: 'text-pink-500',
    capabilities: [
      { 
        id: 'com1', 
        name: 'Multi-tenant Platform', 
        description: 'Support multiple organizations on single platform',
        status: 'future', 
        phase: 6, 
        icon: Building2,
        features: [
          'Organization isolation',
          'Custom branding per tenant',
          'Usage-based billing',
          'Admin dashboards'
        ]
      },
      { 
        id: 'com2', 
        name: 'Subscription Management', 
        description: 'Tiered pricing and subscription handling',
        status: 'future', 
        phase: 6, 
        icon: Star,
        features: [
          'Free tier with limits',
          'Professional tier',
          'Enterprise tier',
          'Stripe integration'
        ]
      },
      { 
        id: 'com3', 
        name: 'Marketplace', 
        description: 'SME expert marketplace and custom integrations',
        status: 'future', 
        phase: 6, 
        icon: Globe,
        features: [
          'Third-party SME experts',
          'Integration marketplace',
          'Revenue sharing model',
          'Quality certification'
        ]
      },
      { 
        id: 'com4', 
        name: 'White-label Solution', 
        description: 'Offer CEPHO as white-label to enterprises',
        status: 'future', 
        phase: 6, 
        icon: Briefcase,
        features: [
          'Custom branding',
          'Dedicated infrastructure',
          'SLA guarantees',
          'Enterprise support'
        ]
      },
    ]
  }
];

const getStatusBadge = (status: Capability['status']) => {
  switch (status) {
    case 'available':
      return <Badge className="bg-green-500/20 text-green-500 border-green-500/30">Available</Badge>;
    case 'in_development':
      return <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/30">In Development</Badge>;
    case 'planned':
      return <Badge className="bg-purple-500/20 text-purple-500 border-purple-500/30">Planned</Badge>;
    case 'future':
      return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">Future</Badge>;
  }
};

const getPhaseLabel = (phase: number) => {
  switch (phase) {
    case 1: return 'Phase 1: Foundation';
    case 2: return 'Phase 2: Enhancement';
    case 3: return 'Phase 3: Market Entry';
    case 4: return 'Phase 4: Personal (AI Integration)';
    case 5: return 'Phase 5: In-house Productivity Apps';
    case 6: return 'Phase 6: Commercialization';
    default: return `Phase ${phase}`;
  }
};

export function ChiefOfStaffRoadmap() {
  const [activeCategory, setActiveCategory] = useState('personal');
  const [expandedCapability, setExpandedCapability] = useState<string | null>('p4');
  const [expandedPhases, setExpandedPhases] = useState<number[]>([1, 2]); // Default: show current phases

  const togglePhase = (phase: number) => {
    setExpandedPhases(prev => 
      prev.includes(phase) 
        ? prev.filter(p => p !== phase)
        : [...prev, phase]
    );
  };

  const totalCapabilities = CAPABILITY_CATEGORIES.reduce((acc, cat) => acc + cat.capabilities.length, 0);
  const availableCapabilities = CAPABILITY_CATEGORIES.reduce(
    (acc, cat) => acc + cat.capabilities.filter(c => c.status === 'available').length, 0
  );
  const inDevelopment = CAPABILITY_CATEGORIES.reduce(
    (acc, cat) => acc + cat.capabilities.filter(c => c.status === 'in_development').length, 0
  );

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">{totalCapabilities}</div>
              <div className="text-sm text-muted-foreground">Total Capabilities</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-500">{availableCapabilities}</div>
              <div className="text-sm text-muted-foreground">Available Now</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-500">{inDevelopment}</div>
              <div className="text-sm text-muted-foreground">In Development</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-500">6</div>
              <div className="text-sm text-muted-foreground">Development Phases</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#E91E8C]" />
            Capability Development Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{availableCapabilities} of {totalCapabilities} capabilities available</span>
              <span className="text-white">{Math.round((availableCapabilities / totalCapabilities) * 100)}%</span>
            </div>
            <Progress value={(availableCapabilities / totalCapabilities) * 100} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Category Tabs */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="bg-gray-900/50 border border-gray-800 w-full justify-start">
          {CAPABILITY_CATEGORIES.map(cat => (
            <TabsTrigger key={cat.id} value={cat.id} className="data-[state=active]:bg-gray-800">
              <cat.icon className={`w-4 h-4 mr-2 ${cat.color}`} />
              {cat.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {CAPABILITY_CATEGORIES.map(category => (
          <TabsContent key={category.id} value={category.id} className="mt-4">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <category.icon className={`h-5 w-5 ${category.color}`} />
                  {category.name}
                </CardTitle>
                <CardDescription>{category.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {category.capabilities.map(capability => (
                  <div
                    key={capability.id}
                    className={`p-4 rounded-lg border transition-all ${
                      expandedCapability === capability.id 
                        ? 'bg-gray-800 border-[#E91E8C]/50' 
                        : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <div 
                      className="flex items-start justify-between cursor-pointer"
                      onClick={() => setExpandedCapability(expandedCapability === capability.id ? null : capability.id)}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-lg bg-gray-700 flex items-center justify-center ${
                          capability.status === 'available' ? 'text-green-500' :
                          capability.status === 'in_development' ? 'text-blue-500' :
                          capability.status === 'planned' ? 'text-purple-500' : 'text-gray-500'
                        }`}>
                          <capability.icon className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-white">{capability.name}</h4>
                            {capability.aiAgentIntegration && (
                              <Badge variant="outline" className="border-cyan-500/50 text-cyan-400 text-xs">
                                <Bot className="h-3 w-3 mr-1" />
                                AI Agent
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{capability.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            {getStatusBadge(capability.status)}
                            <Badge variant="outline" className="border-gray-600 text-gray-400">
                              {getPhaseLabel(capability.phase)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        {expandedCapability === capability.id ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    {expandedCapability === capability.id && capability.features && (
                      <div className="mt-4 pt-4 border-t border-gray-700">
                        <h5 className="text-sm font-medium text-white mb-3">Workflow Features:</h5>
                        <div className="space-y-2">
                          {capability.features.map((feature, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <ArrowRight className="h-4 w-4 text-[#E91E8C] mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-muted-foreground">{feature}</span>
                            </div>
                          ))}
                        </div>
                        {capability.aiAgentIntegration && (
                          <div className="mt-4 p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                            <div className="flex items-center gap-2 text-cyan-400 mb-2">
                              <Bot className="h-4 w-4" />
                              <span className="text-sm font-medium">AI Agent Integration</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              This capability includes the ability to communicate with external AI agents. 
                              When a business has an AI agent, the Chief of Staff can speak directly to it 
                              to negotiate, gather information, and complete transactions on your behalf.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Phase 4 Highlight */}
      <Card className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Zap className="h-5 w-5 text-purple-400" />
            Phase 4: CEPHO.Ai Personal
          </CardTitle>
          <CardDescription>
            Expanding from business to personal life management
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* New Personal SMEs */}
          <div>
            <h4 className="font-medium text-white mb-3">New Lifestyle SME Experts</h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {PERSONAL_SMES.map(sme => (
                <div key={sme.id} className="p-3 bg-gray-800/50 rounded-lg text-center">
                  <sme.icon className="h-6 w-6 text-purple-400 mx-auto mb-2" />
                  <p className="text-xs font-medium text-white">{sme.name}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-800/50 rounded-lg">
              <h4 className="font-medium text-white mb-2 flex items-center gap-2">
                <Utensils className="h-4 w-4 text-purple-400" />
                Autonomous Booking Workflow
              </h4>
              <p className="text-sm text-muted-foreground">
                Full end-to-end booking automation: research venues, contact them via email and forms, 
                collect responses, analyze options with pros and cons, present recommendations, 
                and execute bookings upon approval.
              </p>
            </div>
            <div className="p-4 bg-gray-800/50 rounded-lg">
              <h4 className="font-medium text-white mb-2 flex items-center gap-2">
                <Bot className="h-4 w-4 text-cyan-400" />
                AI-to-AI Communication
              </h4>
              <p className="text-sm text-muted-foreground">
                When businesses deploy their own AI agents, your Chief of Staff will be able to 
                communicate directly with them, handling negotiations and transactions seamlessly 
                in the background.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ChiefOfStaffRoadmap;
