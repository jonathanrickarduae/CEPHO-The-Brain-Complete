import { useState } from "react";
import { useLocation } from "wouter";
import { 
  Users, Brain, Search, Star, MessageSquare, Award,
  ChevronRight, Sparkles, Target, Clock, BarChart3, 
  Shield, Zap, Globe, Rocket, Cpu, Video, TrendingUp,
  Filter, Grid, List, Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from '@/components/layout/PageHeader';
import { toast } from "sonner";

type ViewMode = 'overview' | 'ai-smes' | 'persephone-board';

interface BoardMember {
  id: string;
  name: string;
  title: string;
  company: string;
  expertise: string;
  icon: any;
  color: string;
  status: 'active' | 'available';
  lastConsultation?: string;
  contributionScore: number;
  achievements: string[];
}

interface SMEExpert {
  id: string;
  name: string;
  role: string;
  category: string;
  expertise: string[];
  performance: number;
  projectsCompleted: number;
  availability: 'available' | 'busy' | 'offline';
}

const BOARD_MEMBERS: BoardMember[] = [
  {
    id: 'altman',
    name: 'Sam Altman',
    title: 'CEO',
    company: 'OpenAI',
    expertise: 'AGI Development & AI Safety',
    icon: Brain,
    color: 'emerald',
    status: 'active',
    lastConsultation: '2 days ago',
    contributionScore: 99,
    achievements: ['ChatGPT Launch', 'GPT-4 Development', 'AI Safety Leadership']
  },
  {
    id: 'huang',
    name: 'Jensen Huang',
    title: 'CEO',
    company: 'NVIDIA',
    expertise: 'AI Hardware & Computing Infrastructure',
    icon: Cpu,
    color: 'green',
    status: 'active',
    lastConsultation: '1 week ago',
    contributionScore: 98,
    achievements: ['GPU Revolution', 'AI Computing Platform', 'CUDA Ecosystem']
  },
  {
    id: 'amodei',
    name: 'Dario Amodei',
    title: 'CEO',
    company: 'Anthropic',
    expertise: 'Constitutional AI & Safety Research',
    icon: Shield,
    color: 'blue',
    status: 'active',
    lastConsultation: '3 days ago',
    contributionScore: 97,
    achievements: ['Claude AI', 'Constitutional AI', 'AI Alignment Research']
  },
  {
    id: 'hassabis',
    name: 'Sir Demis Hassabis',
    title: 'CEO',
    company: 'Google DeepMind',
    expertise: 'AI Research & Nobel Prize Winner',
    icon: Award,
    color: 'purple',
    status: 'active',
    lastConsultation: '4 days ago',
    contributionScore: 99,
    achievements: ['AlphaGo', 'AlphaFold', 'Nobel Prize in Chemistry 2024']
  },
  {
    id: 'pichai',
    name: 'Sundar Pichai',
    title: 'CEO',
    company: 'Alphabet & Google',
    expertise: 'AI Integration & Product Strategy',
    icon: Globe,
    color: 'red',
    status: 'active',
    lastConsultation: '5 days ago',
    contributionScore: 96,
    achievements: ['Gemini AI', 'Google AI Integration', 'AI-First Strategy']
  },
  {
    id: 'musk',
    name: 'Elon Musk',
    title: 'Founder',
    company: 'xAI',
    expertise: 'AI Innovation & Grok Development',
    icon: Rocket,
    color: 'orange',
    status: 'active',
    lastConsultation: '1 week ago',
    contributionScore: 95,
    achievements: ['xAI Launch', 'Grok AI', 'Neuralink']
  }
];

const SME_EXPERTS: SMEExpert[] = [
  {
    id: 'sme-1',
    name: 'Dr. Sarah Chen',
    role: 'Financial Strategy Expert',
    category: 'Finance',
    expertise: ['Financial Modeling', 'Investment Strategy', 'Risk Management'],
    performance: 98,
    projectsCompleted: 156,
    availability: 'available'
  },
  {
    id: 'sme-2',
    name: 'Marcus Thompson',
    role: 'Legal Counsel',
    category: 'Legal',
    expertise: ['Corporate Law', 'IP Protection', 'Compliance'],
    performance: 96,
    projectsCompleted: 134,
    availability: 'available'
  },
  {
    id: 'sme-3',
    name: 'Emily Rodriguez',
    role: 'Marketing Strategist',
    category: 'Marketing',
    expertise: ['Brand Strategy', 'Digital Marketing', 'Growth Hacking'],
    performance: 94,
    projectsCompleted: 189,
    availability: 'busy'
  },
  {
    id: 'sme-4',
    name: 'Dr. James Wilson',
    role: 'Technology Architect',
    category: 'Technology',
    expertise: ['System Design', 'Cloud Architecture', 'AI Integration'],
    performance: 97,
    projectsCompleted: 142,
    availability: 'available'
  },
  {
    id: 'sme-5',
    name: 'Lisa Park',
    role: 'Operations Expert',
    category: 'Operations',
    expertise: ['Process Optimization', 'Supply Chain', 'Quality Management'],
    performance: 95,
    projectsCompleted: 167,
    availability: 'available'
  }
];

export default function ExpertNetwork() {
  const [, setLocation] = useLocation();
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const handleConsultExpert = (expertId: string, type: 'board' | 'sme') => {
    toast.success(`Opening consultation with expert...`);
    // Navigate to expert chat or consultation page
  };

  const filteredSMEs = SME_EXPERTS.filter(expert => {
    const matchesSearch = searchQuery === '' || 
      expert.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expert.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expert.expertise.some(e => e.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || expert.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const filteredBoard = BOARD_MEMBERS.filter(member => {
    return searchQuery === '' || 
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.expertise.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="h-[calc(100vh-56px)] md:h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Users className="h-8 w-8 text-cyan-400" />
              Expert Network
            </h1>
            <p className="text-muted-foreground mt-1">
              Access AI-SME specialists and Persephone Board advisors
            </p>
          </div>
        </div>
      </div>

      {/* View Mode Tabs */}
      <div className="border-b border-border bg-card/50">
        <div className="flex items-center gap-2 px-6 py-3">
          <Button
            variant={viewMode === 'overview' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('overview')}
          >
            <Target className="w-4 h-4 mr-2" />
            Overview
          </Button>
          <Button
            variant={viewMode === 'ai-smes' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('ai-smes')}
          >
            <Brain className="w-4 h-4 mr-2" />
            AI-SME Specialists ({SME_EXPERTS.length})
          </Button>
          <Button
            variant={viewMode === 'persephone-board' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('persephone-board')}
          >
            <Award className="w-4 h-4 mr-2" />
            Persephone Board ({BOARD_MEMBERS.length})
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        {/* Overview Mode */}
        {viewMode === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Experts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{SME_EXPERTS.length + BOARD_MEMBERS.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">Available for consultation</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">AI-SME Specialists</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{SME_EXPERTS.length}</div>
                  <p className="text-xs text-emerald-400 mt-1">{SME_EXPERTS.filter(e => e.availability === 'available').length} available now</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Persephone Board</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{BOARD_MEMBERS.length}</div>
                  <p className="text-xs text-blue-400 mt-1">Industry leaders</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Avg Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">96.5%</div>
                  <p className="text-xs text-amber-400 mt-1">Across all experts</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Access Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* AI-SME Preview */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="w-5 h-5 text-primary" />
                      AI-SME Specialists
                    </CardTitle>
                    <Button size="sm" variant="ghost" onClick={() => setViewMode('ai-smes')}>
                      View All <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {SME_EXPERTS.slice(0, 3).map(expert => (
                    <div key={expert.id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">{expert.name}</h4>
                        <p className="text-xs text-muted-foreground">{expert.role}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">{expert.category}</Badge>
                          <span className="text-xs text-muted-foreground">{expert.performance}% performance</span>
                        </div>
                      </div>
                      <Button size="sm" onClick={() => handleConsultExpert(expert.id, 'sme')}>
                        <MessageSquare className="w-4 h-4 mr-1" />
                        Consult
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Persephone Board Preview */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-amber-400" />
                      Persephone Board
                    </CardTitle>
                    <Button size="sm" variant="ghost" onClick={() => setViewMode('persephone-board')}>
                      View All <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {BOARD_MEMBERS.slice(0, 3).map(member => (
                    <div key={member.id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">{member.name}</h4>
                        <p className="text-xs text-muted-foreground">{member.title}, {member.company}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">{member.contributionScore}/100</Badge>
                          <span className="text-xs text-muted-foreground">{member.lastConsultation}</span>
                        </div>
                      </div>
                      <Button size="sm" onClick={() => handleConsultExpert(member.id, 'board')}>
                        <Video className="w-4 h-4 mr-1" />
                        Consult
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* AI-SME Specialists Mode */}
        {viewMode === 'ai-smes' && (
          <div className="space-y-4">
            {/* Search and Filters */}
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search AI-SME specialists..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 rounded-lg border border-border bg-background"
              >
                <option value="all">All Categories</option>
                <option value="Finance">Finance</option>
                <option value="Legal">Legal</option>
                <option value="Marketing">Marketing</option>
                <option value="Technology">Technology</option>
                <option value="Operations">Operations</option>
              </select>
            </div>

            {/* SME Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSMEs.map(expert => (
                <Card key={expert.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{expert.name}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">{expert.role}</p>
                      </div>
                      <Badge variant={expert.availability === 'available' ? 'default' : 'secondary'}>
                        {expert.availability}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Expertise:</p>
                      <div className="flex flex-wrap gap-1">
                        {expert.expertise.map((skill, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">{skill}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div>
                        <p className="text-muted-foreground">Performance</p>
                        <p className="font-bold text-emerald-400">{expert.performance}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Projects</p>
                        <p className="font-bold">{expert.projectsCompleted}</p>
                      </div>
                    </div>
                    <Button className="w-full" onClick={() => handleConsultExpert(expert.id, 'sme')}>
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Start Consultation
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Persephone Board Mode */}
        {viewMode === 'persephone-board' && (
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search Persephone Board members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Board Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredBoard.map(member => {
                const IconComponent = member.icon;
                return (
                  <Card key={member.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <div className={`w-16 h-16 rounded-full bg-${member.color}-500/20 flex items-center justify-center`}>
                          <IconComponent className={`w-8 h-8 text-${member.color}-400`} />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg">{member.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">{member.title}</p>
                          <p className="text-sm font-semibold text-primary">{member.company}</p>
                        </div>
                        <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                          {member.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-sm font-semibold mb-1">Expertise:</p>
                        <p className="text-sm text-muted-foreground">{member.expertise}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold mb-1">Key Achievements:</p>
                        <div className="flex flex-wrap gap-1">
                          {member.achievements.map((achievement, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">{achievement}</Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground">Contribution Score</p>
                          <p className="text-lg font-bold text-amber-400">{member.contributionScore}/100</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Last Consultation</p>
                          <p className="text-sm font-semibold">{member.lastConsultation}</p>
                        </div>
                      </div>
                      <Button className="w-full" onClick={() => handleConsultExpert(member.id, 'board')}>
                        <Video className="w-4 h-4 mr-2" />
                        Request Consultation
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
