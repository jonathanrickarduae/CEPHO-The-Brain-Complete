import { useState, useEffect } from 'react';
import { 
  FileText, Users, CheckCircle2, Clock, AlertCircle, 
  ChevronRight, Play, Pause, RotateCcw, Download,
  MessageSquare, Lightbulb, Target, TrendingUp, DollarSign,
  Shield, Scale, Briefcase, Globe, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

// Business plan sections with assigned expert categories
const BUSINESS_PLAN_SECTIONS = [
  {
    id: 'executive-summary',
    name: 'Executive Summary',
    icon: FileText,
    description: 'High-level overview and key value propositions',
    expertCategories: ['Strategy & Leadership', 'Investment & Finance'],
    keyQuestions: [
      'Is the value proposition clear and compelling?',
      'Does it capture the essence of the business?',
      'Are the key differentiators evident?'
    ]
  },
  {
    id: 'market-analysis',
    name: 'Market Analysis & Opportunity',
    icon: Globe,
    description: 'Market size, trends, and opportunity assessment',
    expertCategories: ['Strategy & Leadership', 'Investment & Finance'],
    keyQuestions: [
      'Is the TAM/SAM/SOM analysis credible?',
      'Are market trends properly identified?',
      'Is the timing opportunity validated?'
    ]
  },
  {
    id: 'competitive-landscape',
    name: 'Competitive Landscape',
    icon: Target,
    description: 'Competitor analysis and positioning strategy',
    expertCategories: ['Strategy & Leadership', 'Marketing & Growth'],
    keyQuestions: [
      'Are all key competitors identified?',
      'Is the competitive moat defensible?',
      'What are the barriers to entry?'
    ]
  },
  {
    id: 'go-to-market',
    name: 'Go-to-Market Strategy',
    icon: Zap,
    description: 'Launch strategy, channels, and customer acquisition',
    expertCategories: ['Marketing & Growth', 'Sales & Revenue'],
    keyQuestions: [
      'Is the GTM strategy realistic and executable?',
      'Are customer acquisition costs justified?',
      'What are the key milestones?'
    ]
  },
  {
    id: 'pricing-strategy',
    name: 'Pricing Strategy',
    icon: DollarSign,
    description: 'Pricing model, unit economics, and revenue projections',
    expertCategories: ['Investment & Finance', 'Sales & Revenue'],
    keyQuestions: [
      'Is the pricing competitive yet profitable?',
      'Are unit economics sustainable?',
      'What pricing power exists?'
    ]
  },
  {
    id: 'product-technology',
    name: 'Product & Technology',
    icon: Lightbulb,
    description: 'Product roadmap, technology stack, and IP',
    expertCategories: ['Technology & Innovation', 'Operations & Execution'],
    keyQuestions: [
      'Is the technology stack appropriate?',
      'What is the product differentiation?',
      'Is the roadmap achievable?'
    ]
  },
  {
    id: 'financial-projections',
    name: 'Financial Projections',
    icon: TrendingUp,
    description: 'Revenue forecasts, costs, and funding requirements',
    expertCategories: ['Investment & Finance'],
    keyQuestions: [
      'Are projections realistic and defensible?',
      'What are the key assumptions?',
      'Is the burn rate sustainable?'
    ]
  },
  {
    id: 'team-operations',
    name: 'Team & Operations',
    icon: Users,
    description: 'Leadership team, org structure, and operational plan',
    expertCategories: ['Operations & Execution', 'Strategy & Leadership'],
    keyQuestions: [
      'Does the team have the right capabilities?',
      'What are the key hires needed?',
      'Is the operational plan sound?'
    ]
  },
  {
    id: 'risk-assessment',
    name: 'Risk Assessment',
    icon: Shield,
    description: 'Risk identification and mitigation strategies',
    expertCategories: ['Legal & Compliance', 'Investment & Finance'],
    keyQuestions: [
      'Are all material risks identified?',
      'Are mitigation strategies adequate?',
      'What are the regulatory considerations?'
    ]
  },
  {
    id: 'funding-requirements',
    name: 'Funding Requirements',
    icon: Briefcase,
    description: 'Capital needs, use of funds, and investor terms',
    expertCategories: ['Investment & Finance'],
    keyQuestions: [
      'Is the funding ask justified?',
      'Is the use of funds clear?',
      'What is the expected ROI?'
    ]
  }
];

// Expert team for business plan review
const REVIEW_EXPERTS = [
  { id: 'inv-001', name: 'Victor Sterling', specialty: 'Value Investing', category: 'Investment & Finance', avatar: '👨‍💼' },
  { id: 'inv-002', name: 'Marcus Macro', specialty: 'Global Macro', category: 'Investment & Finance', avatar: '📊' },
  { id: 'str-001', name: 'Alexandra Strategy', specialty: 'Corporate Strategy', category: 'Strategy & Leadership', avatar: '🎯' },
  { id: 'mkt-001', name: 'Maya Marketing', specialty: 'Growth Marketing', category: 'Marketing & Growth', avatar: '📈' },
  { id: 'sal-001', name: 'Simon Sales', specialty: 'Enterprise Sales', category: 'Sales & Revenue', avatar: '🤝' },
  { id: 'tech-001', name: 'Theo Tech', specialty: 'Technology Strategy', category: 'Technology & Innovation', avatar: '💻' },
  { id: 'ops-001', name: 'Oliver Operations', specialty: 'Operations Excellence', category: 'Operations & Execution', avatar: '⚙️' },
  { id: 'leg-001', name: 'Laura Legal', specialty: 'Corporate Law', category: 'Legal & Compliance', avatar: '⚖️' },
];

interface SectionReview {
  sectionId: string;
  status: 'pending' | 'in-progress' | 'completed';
  expertInsights: ExpertInsight[];
  overallScore?: number;
  recommendations?: string[];
  concerns?: string[];
}

interface ExpertInsight {
  expertId: string;
  expertName: string;
  expertAvatar: string;
  insight: string;
  score: number;
  recommendations: string[];
  concerns: string[];
  timestamp: Date;
}

interface BusinessPlanReviewProps {
  businessPlanContent?: string;
  projectName?: string;
  onComplete?: (reviews: SectionReview[]) => void;
}

export function BusinessPlanReview({ 
  businessPlanContent, 
  projectName = 'Business Plan',
  onComplete 
}: BusinessPlanReviewProps) {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [sectionReviews, setSectionReviews] = useState<Map<string, SectionReview>>(new Map());
  const [isReviewing, setIsReviewing] = useState(false);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [selectedExpertInsight, setSelectedExpertInsight] = useState<ExpertInsight | null>(null);

  // Calculate overall progress
  const completedSections = Array.from(sectionReviews.values()).filter(r => r.status === 'completed').length;
  const progressPercent = (completedSections / BUSINESS_PLAN_SECTIONS.length) * 100;

  // Get experts for a section
  const getExpertsForSection = (sectionId: string) => {
    const section = BUSINESS_PLAN_SECTIONS.find(s => s.id === sectionId);
    if (!section) return [];
    return REVIEW_EXPERTS.filter(e => section.expertCategories.includes(e.category));
  };

  // tRPC mutation for analyzing sections
  const analyzeSectionMutation = trpc.businessPlanReview.analyzeSectionWithAllExperts.useMutation();

  // Start the review process
  const startReview = async () => {
    setIsReviewing(true);
    setCurrentReviewIndex(0);
    
    // Initialize all sections as pending
    const initialReviews = new Map<string, SectionReview>();
    BUSINESS_PLAN_SECTIONS.forEach(section => {
      initialReviews.set(section.id, {
        sectionId: section.id,
        status: 'pending',
        expertInsights: [],
      });
    });
    setSectionReviews(initialReviews);
    
    // Start reviewing sections sequentially
    await reviewNextSection(0, initialReviews);
  };

  // Review a single section with experts using real LLM
  const reviewNextSection = async (index: number, reviews: Map<string, SectionReview>) => {
    if (index >= BUSINESS_PLAN_SECTIONS.length) {
      setIsReviewing(false);
      toast.success('Business plan review complete!');
      if (onComplete) {
        onComplete(Array.from(reviews.values()));
      }
      return;
    }

    const section = BUSINESS_PLAN_SECTIONS[index];
    setActiveSection(section.id);
    setCurrentReviewIndex(index);

    // Update status to in-progress
    const updatedReview: SectionReview = {
      sectionId: section.id,
      status: 'in-progress',
      expertInsights: [],
    };
    reviews.set(section.id, updatedReview);
    setSectionReviews(new Map(reviews));

    try {
      // Call the backend to analyze this section with all assigned experts
      const result = await analyzeSectionMutation.mutateAsync({
        sectionId: section.id,
        sectionContent: businessPlanContent || undefined,
      });

      // Update with the result
      const finalReview: SectionReview = {
        sectionId: section.id,
        status: 'completed',
        expertInsights: result.expertInsights.map(i => ({
          ...i,
          timestamp: new Date(i.timestamp),
        })),
        overallScore: result.overallScore,
        recommendations: result.recommendations,
        concerns: result.concerns,
      };
      reviews.set(section.id, finalReview);
      setSectionReviews(new Map(reviews));

      toast.success(`${section.name} review complete`);
    } catch (error) {
      console.error('Error analyzing section:', error);
      toast.error(`Failed to analyze ${section.name}`);
      
      // Mark as completed with error state
      const errorReview: SectionReview = {
        sectionId: section.id,
        status: 'completed',
        expertInsights: [],
        overallScore: 0,
        recommendations: ['Unable to complete analysis'],
        concerns: ['Analysis failed - please retry'],
      };
      reviews.set(section.id, errorReview);
      setSectionReviews(new Map(reviews));
    }

    // Move to next section
    await reviewNextSection(index + 1, reviews);
  };

  // Pause/Resume review
  const toggleReview = () => {
    setIsReviewing(!isReviewing);
    if (!isReviewing) {
      // Resume from current index
      reviewNextSection(currentReviewIndex, sectionReviews);
    }
  };

  // Reset review
  const resetReview = () => {
    setIsReviewing(false);
    setCurrentReviewIndex(0);
    setActiveSection(null);
    setSectionReviews(new Map());
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="shrink-0 p-4 border-b border-white/10 bg-card/50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-400" />
              Business Plan Review
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {projectName} • SME Expert Team Analysis
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!isReviewing && completedSections === 0 && (
              <Button onClick={startReview} className="bg-purple-500 hover:bg-purple-600">
                <Play className="w-4 h-4 mr-2" />
                Start Review
              </Button>
            )}
            {isReviewing && (
              <Button onClick={toggleReview} variant="outline">
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </Button>
            )}
            {completedSections > 0 && (
              <>
                <Button onClick={resetReview} variant="outline" size="sm">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export Report
                </Button>
              </>
            )}
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Review Progress</span>
            <span className="text-foreground font-medium">
              {completedSections} / {BUSINESS_PLAN_SECTIONS.length} sections
            </span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="sections" className="h-full flex flex-col">
          <TabsList className="mx-4 mt-4 shrink-0">
            <TabsTrigger value="sections">Sections</TabsTrigger>
            <TabsTrigger value="experts">Expert Team</TabsTrigger>
            <TabsTrigger value="summary">Summary</TabsTrigger>
          </TabsList>

          <TabsContent value="sections" className="flex-1 overflow-hidden p-4">
            <ScrollArea className="h-full">
              <div className="space-y-3">
                {BUSINESS_PLAN_SECTIONS.map((section, index) => {
                  const review = sectionReviews.get(section.id);
                  const Icon = section.icon;
                  const isActive = activeSection === section.id;
                  
                  return (
                    <Card 
                      key={section.id}
                      className={`transition-all ${
                        isActive 
                          ? 'border-purple-500/50 bg-purple-500/5' 
                          : review?.status === 'completed'
                            ? 'border-green-500/30 bg-green-500/5'
                            : 'border-white/10'
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className={`p-2 rounded-lg ${
                            review?.status === 'completed' 
                              ? 'bg-green-500/20' 
                              : review?.status === 'in-progress'
                                ? 'bg-purple-500/20'
                                : 'bg-white/10'
                          }`}>
                            <Icon className={`w-5 h-5 ${
                              review?.status === 'completed' 
                                ? 'text-green-400' 
                                : review?.status === 'in-progress'
                                  ? 'text-purple-400'
                                  : 'text-muted-foreground'
                            }`} />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium text-foreground">{section.name}</h3>
                              <div className="flex items-center gap-2">
                                {review?.overallScore && (
                                  <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">
                                    {review.overallScore}%
                                  </Badge>
                                )}
                                {review?.status === 'completed' && (
                                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                                )}
                                {review?.status === 'in-progress' && (
                                  <Clock className="w-5 h-5 text-purple-400 animate-pulse" />
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{section.description}</p>
                            
                            {/* Expert Insights Preview */}
                            {review?.expertInsights && review.expertInsights.length > 0 && (
                              <div className="mt-3 space-y-2">
                                <div className="flex items-center gap-1">
                                  {review.expertInsights.map((insight, i) => (
                                    <Dialog key={i}>
                                      <DialogTrigger asChild>
                                        <button 
                                          className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm hover:bg-white/20 transition-colors"
                                          title={insight.expertName}
                                        >
                                          {insight.expertAvatar}
                                        </button>
                                      </DialogTrigger>
                                      <DialogContent className="max-w-2xl">
                                        <DialogHeader>
                                          <DialogTitle className="flex items-center gap-2">
                                            <span className="text-2xl">{insight.expertAvatar}</span>
                                            {insight.expertName}'s Analysis
                                          </DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4 mt-4">
                                          <div>
                                            <h4 className="font-medium text-foreground mb-2">Insight</h4>
                                            <p className="text-sm text-muted-foreground">{insight.insight}</p>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <span className="text-sm text-muted-foreground">Score:</span>
                                            <Badge variant="outline" className="bg-green-500/10 text-green-400">
                                              {insight.score}%
                                            </Badge>
                                          </div>
                                          {insight.recommendations.length > 0 && (
                                            <div>
                                              <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                                                <Lightbulb className="w-4 h-4 text-yellow-400" />
                                                Recommendations
                                              </h4>
                                              <ul className="space-y-1">
                                                {insight.recommendations.map((rec, j) => (
                                                  <li key={j} className="text-sm text-muted-foreground flex items-start gap-2">
                                                    <ChevronRight className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                                                    {rec}
                                                  </li>
                                                ))}
                                              </ul>
                                            </div>
                                          )}
                                          {insight.concerns.length > 0 && (
                                            <div>
                                              <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                                                <AlertCircle className="w-4 h-4 text-orange-400" />
                                                Concerns
                                              </h4>
                                              <ul className="space-y-1">
                                                {insight.concerns.map((concern, j) => (
                                                  <li key={j} className="text-sm text-muted-foreground flex items-start gap-2">
                                                    <ChevronRight className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                                                    {concern}
                                                  </li>
                                                ))}
                                              </ul>
                                            </div>
                                          )}
                                        </div>
                                      </DialogContent>
                                    </Dialog>
                                  ))}
                                </div>
                                
                                {/* Key Recommendations */}
                                {review.recommendations && review.recommendations.length > 0 && (
                                  <div className="text-xs text-muted-foreground">
                                    <span className="text-yellow-400">💡</span> {review.recommendations[0]}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="experts" className="flex-1 overflow-hidden p-4">
            <ScrollArea className="h-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {REVIEW_EXPERTS.map(expert => {
                  // Count how many sections this expert reviewed
                  const sectionsReviewed = Array.from(sectionReviews.values())
                    .filter(r => r.expertInsights.some(i => i.expertId === expert.id))
                    .length;
                  
                  return (
                    <Card key={expert.id} className="border-white/10">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center text-2xl">
                            {expert.avatar}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-foreground">{expert.name}</h3>
                            <p className="text-sm text-muted-foreground">{expert.specialty}</p>
                            <Badge variant="outline" className="mt-1 text-xs">
                              {expert.category}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-foreground">{sectionsReviewed}</div>
                            <div className="text-xs text-muted-foreground">sections</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="summary" className="flex-1 overflow-hidden p-4">
            <ScrollArea className="h-full">
              {completedSections === BUSINESS_PLAN_SECTIONS.length ? (
                <div className="space-y-6">
                  {/* Overall Score */}
                  <Card className="border-green-500/30 bg-green-500/5">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">Overall Assessment</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            Based on {REVIEW_EXPERTS.length} expert reviews across {BUSINESS_PLAN_SECTIONS.length} sections
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-4xl font-bold text-green-400">
                            {Math.round(
                              Array.from(sectionReviews.values())
                                .reduce((sum, r) => sum + (r.overallScore || 0), 0) / BUSINESS_PLAN_SECTIONS.length
                            )}%
                          </div>
                          <div className="text-sm text-muted-foreground">Average Score</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Top Recommendations */}
                  <Card className="border-white/10">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-yellow-400" />
                        Top Recommendations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {Array.from(sectionReviews.values())
                          .flatMap(r => r.recommendations || [])
                          .slice(0, 10)
                          .map((rec, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <ChevronRight className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                              {rec}
                            </li>
                          ))}
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Key Concerns */}
                  <Card className="border-white/10">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-orange-400" />
                        Key Concerns to Address
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {Array.from(sectionReviews.values())
                          .flatMap(r => r.concerns || [])
                          .slice(0, 5)
                          .map((concern, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <ChevronRight className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                              {concern}
                            </li>
                          ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <FileText className="w-16 h-16 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium text-foreground">Review Not Complete</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Complete all section reviews to see the summary
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {completedSections} of {BUSINESS_PLAN_SECTIONS.length} sections reviewed
                  </p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default BusinessPlanReview;
