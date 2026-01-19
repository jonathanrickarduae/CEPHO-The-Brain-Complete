import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Sparkles, 
  TrendingUp, 
  Cpu, 
  Globe, 
  Shield,
  Lightbulb,
  Building2,
  Rocket,
  Users,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  BookOpen,
  Video,
  Mic,
  FileText
} from 'lucide-react';

interface AIAdvisor {
  id: string;
  name: string;
  title: string;
  company: string;
  focusArea: string;
  expertise: string[];
  keyInsight: string;
  color: string;
  icon: any;
  priority: 'tier1' | 'tier2' | 'tier3';
}

const AI_ADVISORS: AIAdvisor[] = [
  {
    id: 'sam-altman',
    name: 'Sam Altman',
    title: 'CEO',
    company: 'OpenAI',
    focusArea: 'AGI Development & AI Safety',
    expertise: ['Large Language Models', 'AI Alignment', 'Startup Scaling', 'Product Vision'],
    keyInsight: 'AI will be the most transformative technology in human history',
    color: 'from-emerald-500 to-teal-600',
    icon: Brain,
    priority: 'tier1'
  },
  {
    id: 'jensen-huang',
    name: 'Jensen Huang',
    title: 'CEO',
    company: 'Nvidia',
    focusArea: 'AI Infrastructure & Computing',
    expertise: ['GPU Architecture', 'AI Hardware', 'Data Centers', 'Parallel Computing'],
    keyInsight: 'The more you buy, the more you save through accelerated computing',
    color: 'from-green-500 to-emerald-600',
    icon: Cpu,
    priority: 'tier1'
  },
  {
    id: 'demis-hassabis',
    name: 'Demis Hassabis',
    title: 'CEO',
    company: 'Google DeepMind',
    focusArea: 'Scientific AI & Research',
    expertise: ['Reinforcement Learning', 'Protein Folding', 'Game AI', 'Neuroscience'],
    keyInsight: 'AI can accelerate scientific discovery by orders of magnitude',
    color: 'from-blue-500 to-indigo-600',
    icon: Lightbulb,
    priority: 'tier1'
  },
  {
    id: 'satya-nadella',
    name: 'Satya Nadella',
    title: 'CEO',
    company: 'Microsoft',
    focusArea: 'Enterprise AI Integration',
    expertise: ['Cloud Computing', 'Enterprise Software', 'AI Copilots', 'Platform Strategy'],
    keyInsight: 'AI is the runtime that will reshape every software category',
    color: 'from-cyan-500 to-blue-600',
    icon: Building2,
    priority: 'tier1'
  },
  {
    id: 'mark-zuckerberg',
    name: 'Mark Zuckerberg',
    title: 'CEO',
    company: 'Meta',
    focusArea: 'Open Source AI & Metaverse',
    expertise: ['Social Platforms', 'Open Source LLMs', 'VR/AR', 'AI Assistants'],
    keyInsight: 'Open source AI will democratize access to intelligence',
    color: 'from-blue-600 to-purple-600',
    icon: Globe,
    priority: 'tier1'
  },
  {
    id: 'elon-musk',
    name: 'Elon Musk',
    title: 'CEO',
    company: 'Tesla / xAI',
    focusArea: 'Autonomous Systems & Truth-seeking AI',
    expertise: ['Autonomous Vehicles', 'Robotics', 'Space Tech', 'AI Safety'],
    keyInsight: 'AI must be developed to seek truth and benefit humanity',
    color: 'from-red-500 to-orange-600',
    icon: Rocket,
    priority: 'tier1'
  },
  {
    id: 'fei-fei-li',
    name: 'Fei-Fei Li',
    title: 'Professor / Co-founder',
    company: 'Stanford / World Labs',
    focusArea: 'Computer Vision & Spatial AI',
    expertise: ['ImageNet', 'Computer Vision', 'AI Ethics', 'Spatial Intelligence'],
    keyInsight: 'Visual intelligence is fundamental to understanding the world',
    color: 'from-purple-500 to-pink-600',
    icon: Sparkles,
    priority: 'tier2'
  },
  {
    id: 'mira-murati',
    name: 'Mira Murati',
    title: 'Founder',
    company: 'Thinking Machines Lab',
    focusArea: 'AI Product Development',
    expertise: ['Product Strategy', 'AI Safety', 'Engineering Leadership', 'Model Development'],
    keyInsight: 'The best AI products emerge from deep technical and product integration',
    color: 'from-pink-500 to-rose-600',
    icon: TrendingUp,
    priority: 'tier2'
  },
  {
    id: 'jony-ive',
    name: 'Jony Ive',
    title: 'Designer / Co-founder',
    company: 'LoveFrom / OpenAI Device',
    focusArea: 'AI Hardware Design',
    expertise: ['Industrial Design', 'User Experience', 'Hardware Innovation', 'Minimalism'],
    keyInsight: 'AI interfaces should disappear into natural human interaction',
    color: 'from-gray-400 to-gray-600',
    icon: Sparkles,
    priority: 'tier2'
  },
  {
    id: 'tekedra-mawakana',
    name: 'Tekedra Mawakana',
    title: 'Co-CEO',
    company: 'Waymo',
    focusArea: 'Autonomous Vehicles',
    expertise: ['Self-driving Technology', 'Regulatory Affairs', 'Safety Systems', 'Mobility'],
    keyInsight: 'Autonomous vehicles will fundamentally reshape urban mobility',
    color: 'from-teal-500 to-cyan-600',
    icon: Rocket,
    priority: 'tier2'
  },
  {
    id: 'palmer-luckey',
    name: 'Palmer Luckey',
    title: 'Founder',
    company: 'Anduril',
    focusArea: 'Defense AI & Autonomy',
    expertise: ['Defense Technology', 'VR/AR', 'Autonomous Systems', 'Hardware'],
    keyInsight: 'AI will transform defense capabilities and national security',
    color: 'from-slate-500 to-gray-700',
    icon: Shield,
    priority: 'tier2'
  },
  {
    id: 'cc-wei',
    name: 'CC Wei',
    title: 'CEO',
    company: 'TSMC',
    focusArea: 'Semiconductor Manufacturing',
    expertise: ['Chip Fabrication', 'Process Technology', 'Supply Chain', 'Advanced Nodes'],
    keyInsight: 'Advanced semiconductors are the foundation of AI progress',
    color: 'from-red-600 to-red-800',
    icon: Cpu,
    priority: 'tier3'
  },
  {
    id: 'liang-wenfeng',
    name: 'Liang Wenfeng',
    title: 'Founder',
    company: 'DeepSeek',
    focusArea: 'Efficient AI Models',
    expertise: ['Model Efficiency', 'Cost Optimization', 'Open Source AI', 'Research'],
    keyInsight: 'Breakthrough AI can be achieved with fraction of the compute',
    color: 'from-blue-700 to-indigo-800',
    icon: Brain,
    priority: 'tier3'
  },
  {
    id: 'david-sacks',
    name: 'David Sacks',
    title: 'AI & Crypto Tsar',
    company: 'White House',
    focusArea: 'AI Policy & Regulation',
    expertise: ['Venture Capital', 'Policy', 'SaaS', 'Startup Ecosystems'],
    keyInsight: 'AI policy must balance innovation with responsible development',
    color: 'from-amber-500 to-orange-600',
    icon: Building2,
    priority: 'tier3'
  }
];

export default function PersephoneAI() {
  const [expandedAdvisor, setExpandedAdvisor] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('board');

  const tier1Advisors = AI_ADVISORS.filter(a => a.priority === 'tier1');
  const tier2Advisors = AI_ADVISORS.filter(a => a.priority === 'tier2');
  const tier3Advisors = AI_ADVISORS.filter(a => a.priority === 'tier3');

  const toggleAdvisor = (id: string) => {
    setExpandedAdvisor(expandedAdvisor === id ? null : id);
  };

  const AdvisorCard = ({ advisor }: { advisor: AIAdvisor }) => {
    const isExpanded = expandedAdvisor === advisor.id;
    const Icon = advisor.icon;

    return (
      <Card 
        className="bg-black/40 border-white/10 hover:border-fuchsia-500/50 transition-all cursor-pointer"
        onClick={() => toggleAdvisor(advisor.id)}
      >
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${advisor.color} flex items-center justify-center`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-white text-lg">{advisor.name}</CardTitle>
                <CardDescription className="text-gray-400">
                  {advisor.title} at {advisor.company}
                </CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="text-gray-400">
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Badge className="bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/30 mb-3">
            {advisor.focusArea}
          </Badge>
          
          {isExpanded && (
            <div className="mt-4 space-y-4 animate-in fade-in duration-200">
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-2">Key Expertise</h4>
                <div className="flex flex-wrap gap-2">
                  {advisor.expertise.map((exp, i) => (
                    <Badge key={i} variant="outline" className="text-gray-300 border-gray-600">
                      {exp}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-2">Core Insight</h4>
                <p className="text-gray-300 italic">"{advisor.keyInsight}"</p>
              </div>
              
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="text-gray-300 border-gray-600">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Articles
                </Button>
                <Button variant="outline" size="sm" className="text-gray-300 border-gray-600">
                  <Video className="w-4 h-4 mr-2" />
                  Talks
                </Button>
                <Button variant="outline" size="sm" className="text-gray-300 border-gray-600">
                  <Mic className="w-4 h-4 mr-2" />
                  Podcasts
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center">
              <Brain className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-fuchsia-400 to-cyan-400 bg-clip-text text-transparent mb-2">
            Persephone-AI
          </h1>
          <p className="text-xl text-gray-400 mb-4">The AI Genius Board</p>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Virtual NED and Steering Committee composed of the 14 most influential AI leaders. 
            Their collective wisdom guides CEPHO.Ai's strategic direction, infrastructure decisions, 
            and technology roadmap.
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="bg-black/40 border border-white/10">
            <TabsTrigger value="board" className="data-[state=active]:bg-fuchsia-500/20">
              <Users className="w-4 h-4 mr-2" />
              The Board
            </TabsTrigger>
            <TabsTrigger value="insights" className="data-[state=active]:bg-fuchsia-500/20">
              <Lightbulb className="w-4 h-4 mr-2" />
              Key Insights
            </TabsTrigger>
            <TabsTrigger value="repository" className="data-[state=active]:bg-fuchsia-500/20">
              <FileText className="w-4 h-4 mr-2" />
              Knowledge Repository
            </TabsTrigger>
          </TabsList>

          <TabsContent value="board" className="mt-6">
            {/* Tier 1: Priority Advisors */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Tier 1</Badge>
                Priority Advisors
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tier1Advisors.map(advisor => (
                  <AdvisorCard key={advisor.id} advisor={advisor} />
                ))}
              </div>
            </div>

            {/* Tier 2: Strategic Advisors */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Tier 2</Badge>
                Strategic Advisors
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tier2Advisors.map(advisor => (
                  <AdvisorCard key={advisor.id} advisor={advisor} />
                ))}
              </div>
            </div>

            {/* Tier 3: Specialist Advisors */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">Tier 3</Badge>
                Specialist Advisors
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tier3Advisors.map(advisor => (
                  <AdvisorCard key={advisor.id} advisor={advisor} />
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="insights" className="mt-6">
            <Card className="bg-black/40 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Collective Wisdom</CardTitle>
                <CardDescription>Key insights synthesized from the AI Genius Board</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {AI_ADVISORS.map(advisor => (
                  <div key={advisor.id} className="flex items-start gap-4 p-4 bg-white/5 rounded-lg">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${advisor.color} flex items-center justify-center flex-shrink-0`}>
                      <advisor.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-gray-300 italic">"{advisor.keyInsight}"</p>
                      <p className="text-sm text-gray-500 mt-1">— {advisor.name}, {advisor.company}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="repository" className="mt-6">
            <Card className="bg-black/40 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Knowledge Repository</CardTitle>
                <CardDescription>Deep dive materials collected for each advisor</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 rounded-lg">
                    <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-fuchsia-400" />
                      Books & Publications
                    </h4>
                    <p className="text-gray-400 text-sm">Authored works, research papers, and published articles</p>
                    <Badge className="mt-2 bg-gray-700 text-gray-300">Coming Soon</Badge>
                  </div>
                  <div className="p-4 bg-white/5 rounded-lg">
                    <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                      <Video className="w-4 h-4 text-cyan-400" />
                      Keynotes & Talks
                    </h4>
                    <p className="text-gray-400 text-sm">Conference presentations, interviews, and public speeches</p>
                    <Badge className="mt-2 bg-gray-700 text-gray-300">Coming Soon</Badge>
                  </div>
                  <div className="p-4 bg-white/5 rounded-lg">
                    <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                      <Mic className="w-4 h-4 text-purple-400" />
                      Podcasts & Interviews
                    </h4>
                    <p className="text-gray-400 text-sm">Long-form discussions and podcast appearances</p>
                    <Badge className="mt-2 bg-gray-700 text-gray-300">Coming Soon</Badge>
                  </div>
                  <div className="p-4 bg-white/5 rounded-lg">
                    <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                      <ExternalLink className="w-4 h-4 text-emerald-400" />
                      Social & Commentary
                    </h4>
                    <p className="text-gray-400 text-sm">Twitter/X posts, blog entries, and public commentary</p>
                    <Badge className="mt-2 bg-gray-700 text-gray-300">Coming Soon</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
