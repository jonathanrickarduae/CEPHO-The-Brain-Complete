import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Users, Calendar, FileText, Vote, TrendingUp,
  Brain, Cpu, Zap, Sparkles, Target, Shield,
  Rocket, Globe, Award, Video, MessageSquare
} from 'lucide-react';
import { PageHeader } from '@/components/layout/Breadcrumbs';

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
    achievements: ['Grok AI', 'Neuralink', 'Tesla Autopilot']
  },
  {
    id: 'lecun',
    name: 'Yann LeCun',
    title: 'Chief AI Scientist',
    company: 'Meta',
    expertise: 'Deep Learning & Neural Networks',
    icon: Brain,
    color: 'indigo',
    status: 'active',
    lastConsultation: '6 days ago',
    contributionScore: 98,
    achievements: ['Turing Award', 'Convolutional Neural Networks', 'Meta AI Research']
  },
  {
    id: 'hinton',
    name: 'Geoffrey Hinton',
    title: 'Godfather of AI',
    company: 'Independent Researcher',
    expertise: 'Neural Networks & AI Safety Advocacy',
    icon: Award,
    color: 'amber',
    status: 'active',
    lastConsultation: '1 week ago',
    contributionScore: 99,
    achievements: ['Turing Award', 'Backpropagation', 'AI Safety Advocacy']
  },
  {
    id: 'ng',
    name: 'Andrew Ng',
    title: 'Founder',
    company: 'DeepLearning.AI',
    expertise: 'AI Education & Democratization',
    icon: Sparkles,
    color: 'cyan',
    status: 'active',
    lastConsultation: '3 days ago',
    contributionScore: 96,
    achievements: ['Coursera AI Courses', 'Google Brain', 'Landing AI']
  },
  {
    id: 'li',
    name: 'Fei-Fei Li',
    title: 'Co-Director',
    company: 'Stanford HAI',
    expertise: 'Computer Vision & Human-Centered AI',
    icon: Target,
    color: 'pink',
    status: 'active',
    lastConsultation: '4 days ago',
    contributionScore: 97,
    achievements: ['ImageNet', 'Stanford HAI', 'Human-Centered AI']
  },
  {
    id: 'nadella',
    name: 'Satya Nadella',
    title: 'CEO',
    company: 'Microsoft',
    expertise: 'AI Enterprise Integration',
    icon: Globe,
    color: 'blue',
    status: 'active',
    lastConsultation: '1 week ago',
    contributionScore: 95,
    achievements: ['Microsoft Copilot', 'Azure AI', 'OpenAI Partnership']
  },
  {
    id: 'srinivas',
    name: 'Aravind Srinivas',
    title: 'CEO',
    company: 'Perplexity AI',
    expertise: 'AI Search & Information Retrieval',
    icon: Zap,
    color: 'violet',
    status: 'active',
    lastConsultation: '2 days ago',
    contributionScore: 93,
    achievements: ['Perplexity AI', 'AI-Powered Search', 'Answer Engine']
  },
  {
    id: 'jassy',
    name: 'Andy Jassy',
    title: 'CEO',
    company: 'Amazon',
    expertise: 'AI Cloud Infrastructure',
    icon: Cpu,
    color: 'orange',
    status: 'active',
    lastConsultation: '5 days ago',
    contributionScore: 94,
    achievements: ['AWS AI Services', 'Amazon Bedrock', 'Alexa AI']
  },
  {
    id: 'cook',
    name: 'Tim Cook',
    title: 'CEO',
    company: 'Apple',
    expertise: 'AI Privacy & On-Device Intelligence',
    icon: Shield,
    color: 'slate',
    status: 'active',
    lastConsultation: '1 week ago',
    contributionScore: 94,
    achievements: ['Apple Intelligence', 'Privacy-First AI', 'Neural Engine']
  }
];

const UPCOMING_MEETINGS = [
  {
    id: 1,
    title: 'AI Strategy & Market Positioning',
    date: 'February 28, 2026',
    time: '10:00 AM',
    attendees: 14,
    agenda: ['AGI Timeline Discussion', 'Competitive Landscape', 'Safety & Ethics']
  },
  {
    id: 2,
    title: 'Technology Roadmap Review',
    date: 'March 15, 2026',
    time: '2:00 PM',
    attendees: 14,
    agenda: ['Infrastructure Scaling', 'Model Architecture', 'Research Priorities']
  }
];

const RECENT_DECISIONS = [
  {
    id: 1,
    title: 'Adopt Constitutional AI Framework',
    date: 'February 15, 2026',
    outcome: 'Approved',
    votes: { for: 13, against: 1, abstain: 0 }
  },
  {
    id: 2,
    title: 'Increase AI Safety Research Budget',
    date: 'February 10, 2026',
    outcome: 'Approved',
    votes: { for: 14, against: 0, abstain: 0 }
  }
];

export default function PersephoneBoard() {
  const [selectedMember, setSelectedMember] = useState<BoardMember | null>(null);

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
      green: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/30' },
      blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
      purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
      red: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' },
      orange: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30' },
      indigo: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/30' },
      amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
      cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/30' },
      pink: { bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/30' },
      violet: { bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/30' },
      slate: { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/30' },
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHeader 
        title="Persephone-AI: The AI Genius Board" 
        description="Virtual Board of 14 Top AI Leaders - Strategic Oversight & Industry Guidance"
      />

      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Board Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-background">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="w-4 h-4" />
                AI Leaders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-400">14</div>
              <p className="text-xs text-muted-foreground mt-1">Industry Titans</p>
            </CardContent>
          </Card>

          <Card className="border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-background">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Next Meeting
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-400">Feb 28</div>
              <p className="text-xs text-muted-foreground mt-1">AI Strategy Review</p>
            </CardContent>
          </Card>

          <Card className="border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-background">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Vote className="w-4 h-4" />
                Recent Decisions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-400">{RECENT_DECISIONS.length}</div>
              <p className="text-xs text-muted-foreground mt-1">This month</p>
            </CardContent>
          </Card>

          <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-background">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Board Impact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-400">97%</div>
              <p className="text-xs text-muted-foreground mt-1">Average Score</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button className="h-auto py-4 bg-purple-500/20 hover:bg-purple-500/30 border-purple-500/30">
            <div className="flex items-center gap-3">
              <Video className="w-5 h-5 text-purple-400" />
              <div className="text-left">
                <div className="font-semibold text-foreground">Convene Board Meeting</div>
                <div className="text-xs text-muted-foreground">Strategic discussion with all 14 leaders</div>
              </div>
            </div>
          </Button>

          <Button className="h-auto py-4 bg-blue-500/20 hover:bg-blue-500/30 border-blue-500/30">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-blue-400" />
              <div className="text-left">
                <div className="font-semibold text-foreground">Consult Individual Leader</div>
                <div className="text-xs text-muted-foreground">1-on-1 expert guidance</div>
              </div>
            </div>
          </Button>

          <Button className="h-auto py-4 bg-emerald-500/20 hover:bg-emerald-500/30 border-emerald-500/30">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-emerald-400" />
              <div className="text-left">
                <div className="font-semibold text-foreground">Generate Board Report</div>
                <div className="text-xs text-muted-foreground">Strategic recommendations</div>
              </div>
            </div>
          </Button>
        </div>

        {/* AI Leaders Grid */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-xl text-foreground flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-400" />
              The AI Genius Board - Top 14 Leaders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {BOARD_MEMBERS.map((member) => {
                const Icon = member.icon;
                const colors = getColorClasses(member.color);
                return (
                  <Card 
                    key={member.id} 
                    className={`border ${colors.border} ${colors.bg} hover:bg-opacity-20 transition-all cursor-pointer`}
                    onClick={() => setSelectedMember(member)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <div className={`p-2 rounded-lg ${colors.bg}`}>
                          <Icon className={`w-5 h-5 ${colors.text}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-foreground text-sm">{member.name}</h3>
                          <p className="text-xs text-muted-foreground">{member.title}</p>
                          <p className="text-xs font-semibold text-foreground/80 mt-0.5">{member.company}</p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{member.expertise}</p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge className={`${colors.bg} ${colors.text} border-0 text-xs`}>
                            Impact: {member.contributionScore}
                          </Badge>
                          {member.lastConsultation && (
                            <span className="text-xs text-muted-foreground">{member.lastConsultation}</span>
                          )}
                        </div>
                        <div className="pt-2 border-t border-border/30">
                          <p className="text-xs font-semibold text-muted-foreground mb-1">Key Achievements:</p>
                          <ul className="space-y-0.5">
                            {member.achievements.slice(0, 2).map((achievement, idx) => (
                              <li key={idx} className="text-xs text-muted-foreground truncate">• {achievement}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Meetings & Recent Decisions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg text-foreground flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-400" />
                Upcoming Board Meetings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {UPCOMING_MEETINGS.map((meeting) => (
                <div key={meeting.id} className="p-4 border border-border/50 rounded-lg bg-muted/20">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-foreground">{meeting.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {meeting.date} at {meeting.time}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{meeting.attendees} leaders attending</span>
                      </div>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-border/30">
                    <p className="text-xs text-muted-foreground mb-2">Agenda:</p>
                    <div className="flex flex-wrap gap-2">
                      {meeting.agenda.map((item, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg text-foreground flex items-center gap-2">
                <Vote className="w-5 h-5 text-emerald-400" />
                Recent Board Decisions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {RECENT_DECISIONS.map((decision) => (
                <div key={decision.id} className="p-4 border border-border/50 rounded-lg bg-muted/20">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground">{decision.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{decision.date}</p>
                    </div>
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                      {decision.outcome}
                    </Badge>
                  </div>
                  <div className="pt-3 border-t border-border/30">
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-emerald-400">For: {decision.votes.for}</span>
                      <span className="text-red-400">Against: {decision.votes.against}</span>
                      {decision.votes.abstain > 0 && (
                        <span className="text-muted-foreground">Abstain: {decision.votes.abstain}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
