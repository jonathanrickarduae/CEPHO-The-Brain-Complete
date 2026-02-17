import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { 
  Save, Download, CheckCircle2, Target, Users, DollarSign, 
  Rocket, TrendingUp, Shield, FileText, ChevronDown, ChevronUp
} from 'lucide-react';

interface Question {
  id: string;
  section: string;
  sectionIcon: typeof Target;
  question: string;
  hint: string;
  prepopulated: string;
}

const QUESTIONS: Question[] = [
  // Section 1: Purpose and Identity
  {
    id: '1.1',
    section: 'Purpose and Identity',
    sectionIcon: Target,
    question: 'Mission Statement: What is the core purpose of CEPHO.Ai? What problem does it solve and for whom?',
    hint: 'Focus on the fundamental problem you solve and who benefits most.',
    prepopulated: 'To free founders and CEOs from the burden of "you only know what you know" by providing AI amplified executive intelligence that handles everything else, so they can focus entirely on building their business.'
  },
  {
    id: '1.2',
    section: 'Purpose and Identity',
    sectionIcon: Target,
    question: 'Vision Statement: Where do you see CEPHO.Ai in 5 to 10 years? What does success look like at scale?',
    hint: 'Think big. What does the world look like when CEPHO.Ai succeeds?',
    prepopulated: 'To become the platform that gives every ambitious founder the mental bandwidth of a Fortune 500 CEO, not through more resources, but through intelligent amplification of what they already have. Our measure of being number one is the mental bandwidth we return to founders.'
  },
  {
    id: '1.3',
    section: 'Purpose and Identity',
    sectionIcon: Target,
    question: 'Core Values: What are the 3 to 5 non negotiable principles that guide how CEPHO.Ai operates?',
    hint: 'These should be principles you would never compromise, even if it cost you business.',
    prepopulated: 'Excellence Without Compromise (Jim Short as the 100/100 quality gatekeeper)\nContinuous Learning (Chief of Staff learns from every interaction)\nTransparent Partnership (honest assessments, no hidden agendas)\nAccessible Innovation (cutting edge AI for all businesses, not just enterprises)'
  },
  // Section 2: Market Position
  {
    id: '2.1',
    section: 'Market Position',
    sectionIcon: Users,
    question: 'Target Customer: Who is the ideal customer for CEPHO.Ai? Be specific about company stage, size, and characteristics.',
    hint: 'Be specific. "Everyone" is not a target customer.',
    prepopulated: 'Primary: Solo founders and CEOs of early stage to growth stage businesses who need executive support but cannot justify traditional hires.\n\nSecondary: Small to medium enterprises seeking to augment existing leadership with AI powered intelligence.\n\nTertiary: Corporate innovation teams exploring AI transformation of executive functions.'
  },
  {
    id: '2.2',
    section: 'Market Position',
    sectionIcon: Users,
    question: 'Unique Value Proposition: In one sentence, what makes CEPHO.Ai different from every other solution in the market?',
    hint: 'This should be something competitors cannot easily copy.',
    prepopulated: 'The One Employee Model: CEPHO.Ai enables a single CEO to operate with the capability of a full executive team through an integrated, always on AI support system that learns and improves with every interaction.'
  },
  {
    id: '2.3',
    section: 'Market Position',
    sectionIcon: Users,
    question: 'Competitive Landscape: Who are the main competitors or alternatives? What is CEPHO.Ai\'s defensible advantage?',
    hint: 'Include both direct competitors and alternative solutions customers might use.',
    prepopulated: 'Unlike consulting firms that provide periodic advice or point solutions that address single functions, CEPHO.Ai delivers an integrated executive support system. Key differentiators:\n\n1. Digital Twin personalization that learns user preferences\n2. AI SME Expert Panel covering all business functions\n3. Quality gate system with Jim Short as ultimate gatekeeper\n4. Continuous learning from every interaction'
  },
  // Section 3: Business Model
  {
    id: '3.1',
    section: 'Business Model',
    sectionIcon: DollarSign,
    question: 'Revenue Model: How does CEPHO.Ai generate revenue? What are the pricing tiers and target price points?',
    hint: 'Be specific about pricing structure and target price points.',
    prepopulated: 'Subscription based SaaS with three tiers:\n\n1. Founder Tier: Early stage companies\n2. Growth Tier: Scaling businesses\n3. Enterprise Tier: Bespoke solutions for larger organizations\n\n[Specific pricing to be determined based on market research]'
  },
  {
    id: '3.2',
    section: 'Business Model',
    sectionIcon: DollarSign,
    question: 'Key Metrics: What are the 3 to 5 metrics that matter most for measuring success?',
    hint: 'Focus on metrics that directly indicate business health and customer value.',
    prepopulated: '1. Customer retention rate\n2. Net Promoter Score (NPS)\n3. Time saved per user (hours per week)\n4. Decision quality improvement\n5. Revenue per customer'
  },
  {
    id: '3.3',
    section: 'Business Model',
    sectionIcon: DollarSign,
    question: 'Unit Economics: What is the target customer acquisition cost, lifetime value, and payback period?',
    hint: 'These numbers drive the sustainability of your growth model.',
    prepopulated: '[To be determined based on initial customer data]\n\nTarget LTV:CAC ratio: 3:1 or higher\nTarget payback period: Under 12 months'
  },
  // Section 4: Strategic Priorities
  {
    id: '4.1',
    section: 'Strategic Priorities',
    sectionIcon: Rocket,
    question: 'Current Phase Focus: What is the single most important objective for the current phase?',
    hint: 'If you could only achieve one thing this phase, what would it be?',
    prepopulated: 'Phase 1 (Foundation): Build the core platform with AI Chief of Staff and SME Expert Panel, establish the Digital Twin personalization engine, and validate product market fit with initial users.'
  },
  {
    id: '4.2',
    section: 'Strategic Priorities',
    sectionIcon: Rocket,
    question: 'Key Milestones: What are the critical milestones that must be achieved before moving to the next phase?',
    hint: 'These should be measurable and time bound.',
    prepopulated: 'Phase 1 Milestones:\n- Core platform functional with all key features\n- Chief of Staff learning system operational\n- 10+ active users providing feedback\n- Quality gate system with Jim Short validated\n- Morning Signal and workflow automation live'
  },
  {
    id: '4.3',
    section: 'Strategic Priorities',
    sectionIcon: Rocket,
    question: 'Biggest Risks: What are the top 3 risks that could prevent CEPHO.Ai from succeeding?',
    hint: 'Be honest about what could go wrong.',
    prepopulated: '1. Technology Risk: AI capabilities may not meet user expectations for quality and accuracy\n2. Market Risk: Target customers may not be willing to pay for AI executive support\n3. Execution Risk: Building a comprehensive platform requires significant development resources'
  },
  // Section 5: Resource Requirements
  {
    id: '5.1',
    section: 'Resource Requirements',
    sectionIcon: Shield,
    question: 'Team Requirements: What roles or capabilities are needed to execute the strategy?',
    hint: 'Think about both immediate needs and future scaling.',
    prepopulated: 'Current: Solo founder with AI amplification (the CEPHO model)\n\nFuture phases may require:\n- Technical co-founder or lead developer\n- Customer success specialist\n- Marketing and growth lead'
  },
  {
    id: '5.2',
    section: 'Resource Requirements',
    sectionIcon: Shield,
    question: 'Technology Requirements: What technology investments or partnerships are required?',
    hint: 'Include both build and buy decisions.',
    prepopulated: '- LLM infrastructure (currently using Manus platform)\n- Voice synthesis (ElevenLabs integration)\n- Database and storage infrastructure\n- Integration APIs for external data sources\n- Phase 5: In-house productivity apps development'
  },
  {
    id: '5.3',
    section: 'Resource Requirements',
    sectionIcon: Shield,
    question: 'Funding Requirements: What is the total funding needed across all phases? How will it be allocated?',
    hint: 'Be specific about amounts and allocation.',
    prepopulated: 'See 5 Phase Roadmap for detailed funding requirements:\n\nPhase 1 (Foundation): Development costs, infrastructure\nPhase 2 (Enhancement): Feature expansion, integrations\nPhase 3 (Market Entry): AI SME Enhancement, data absorption\nPhase 4 (Personal): Lifestyle SMEs, agent to agent communication\nPhase 5 (Productivity Apps): In-house tool development\nPhase 6 (Commercialization): Digital Twin Management Agency'
  },
  // Section 6: Go to Market
  {
    id: '6.1',
    section: 'Go to Market',
    sectionIcon: TrendingUp,
    question: 'Launch Strategy: How will CEPHO.Ai acquire its first 100 customers?',
    hint: 'Focus on channels that reach your target customer directly.',
    prepopulated: '[To be defined]\n\nPotential channels:\n- Direct outreach to founder networks\n- Content marketing demonstrating AI executive capabilities\n- Strategic partnerships with accelerators and incubators\n- Referral program from early adopters'
  },
  {
    id: '6.2',
    section: 'Go to Market',
    sectionIcon: TrendingUp,
    question: 'Growth Strategy: What is the primary growth lever for scaling beyond early adopters?',
    hint: 'What will drive sustainable, repeatable growth?',
    prepopulated: '[To be defined]\n\nPotential growth levers:\n- Product led growth through free tier or trial\n- Word of mouth from satisfied users\n- Content and thought leadership\n- Strategic partnerships'
  },
  {
    id: '6.3',
    section: 'Go to Market',
    sectionIcon: TrendingUp,
    question: 'Partnership Strategy: What strategic partnerships would accelerate growth?',
    hint: 'Think about partners who serve your target customers.',
    prepopulated: 'Potential partners:\n- Startup accelerators and incubators\n- Business coaching and mentoring organizations\n- Professional services firms\n- Technology platforms (integrations)\n\nPhase 6: Digital Twin Management Agency partnerships with corporations'
  },
  // Section 7: Exit and Returns
  {
    id: '7.1',
    section: 'Exit and Returns',
    sectionIcon: FileText,
    question: 'Exit Strategy: What is the intended exit path (IPO, acquisition, other)?',
    hint: 'This informs how you build and position the company.',
    prepopulated: '[To be defined]\n\nPotential exit paths:\n- Strategic acquisition by enterprise software company\n- Acquisition by consulting firm seeking AI capabilities\n- IPO if scale warrants\n- Remain private and profitable'
  },
  {
    id: '7.2',
    section: 'Exit and Returns',
    sectionIcon: FileText,
    question: 'Target Returns: What returns are you targeting for investors?',
    hint: 'Be realistic but ambitious.',
    prepopulated: '[To be defined based on funding structure]\n\nTarget: Significant value creation through the delivery of the platform and commercialization of the Digital Twin Management Agency model.'
  }
];

export default function StrategicFrameworkQuestionnaire() {
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['Purpose and Identity']));
  const [isSaving, setIsSaving] = useState(false);

  // Initialize with prepopulated values
  useEffect(() => {
    const initial: Record<string, string> = {};
    QUESTIONS.forEach(q => {
      initial[q.id] = q.prepopulated;
    });
    
    // Try to load saved responses from localStorage
    const saved = localStorage.getItem('cepho-strategic-framework');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        Object.assign(initial, parsed);
      } catch (e) {
        console.error('Failed to load saved responses');
      }
    }
    
    setResponses(initial);
  }, []);

  const handleResponseChange = (id: string, value: string) => {
    setResponses(prev => ({ ...prev, [id]: value }));
  };

  const handleSave = () => {
    setIsSaving(true);
    localStorage.setItem('cepho-strategic-framework', JSON.stringify(responses));
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Responses saved locally');
    }, 500);
  };

  const handleDownload = () => {
    let content = '# CEPHO.Ai Strategic Framework Questionnaire\n\n';
    content += `Completed: ${new Date().toLocaleDateString()}\n\n`;
    content += '---\n\n';

    let currentSection = '';
    QUESTIONS.forEach(q => {
      if (q.section !== currentSection) {
        content += `## ${q.section}\n\n`;
        currentSection = q.section;
      }
      content += `### ${q.id}. ${q.question}\n\n`;
      content += `${responses[q.id] || '[Not answered]'}\n\n`;
    });

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CEPHO_Strategic_Framework_${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Questionnaire downloaded');
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  const completedCount = QUESTIONS.filter(q => responses[q.id]?.trim()).length;
  const progress = (completedCount / QUESTIONS.length) * 100;

  const sections = Array.from(new Set(QUESTIONS.map(q => q.section)));

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/95 backdrop-blur border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">Strategic Framework Questionnaire</h1>
              <p className="text-sm text-white/60">CEPHO.Ai Strategy Development</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
                className="border-white/20 text-white hover:bg-white/10"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="border-pink-500/50 text-pink-400 hover:bg-pink-500/20"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
          
          {/* Progress */}
          <div className="flex items-center gap-4">
            <Progress value={progress} className="flex-1 h-2" />
            <Badge variant="outline" className="text-white/70 border-white/20">
              {completedCount} / {QUESTIONS.length}
            </Badge>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {sections.map(section => {
          const sectionQuestions = QUESTIONS.filter(q => q.section === section);
          const sectionIcon = sectionQuestions[0].sectionIcon;
          const isExpanded = expandedSections.has(section);
          const sectionComplete = sectionQuestions.every(q => responses[q.id]?.trim());

          return (
            <Card key={section} className="bg-white/5 border-white/10">
              <CardHeader 
                className="cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() => toggleSection(section)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-pink-500/20">
                      {(() => { const Icon = sectionIcon; return <Icon className="w-5 h-5 text-pink-400" />; })()}
                    </div>
                    <CardTitle className="text-lg text-white">{section}</CardTitle>
                    {sectionComplete && (
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                    )}
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-white/60" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-white/60" />
                  )}
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="space-y-6">
                  {sectionQuestions.map(q => (
                    <div key={q.id} className="space-y-2">
                      <label className="block">
                        <span className="text-sm font-medium text-white">
                          {q.id}. {q.question}
                        </span>
                        <span className="block text-xs text-white/50 mt-1">
                          {q.hint}
                        </span>
                      </label>
                      <Textarea
                        value={responses[q.id] || ''}
                        onChange={(e) => handleResponseChange(q.id, e.target.value)}
                        placeholder="Enter your response..."
                        className="min-h-[120px] bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-pink-500/50"
                      />
                    </div>
                  ))}
                </CardContent>
              )}
            </Card>
          );
        })}

        {/* Footer */}
        <div className="text-center py-8 text-white/50 text-sm">
          <p>Your responses are saved locally in your browser.</p>
          <p>Download to export your completed questionnaire.</p>
        </div>
      </div>
    </div>
  );
}
