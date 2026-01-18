import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ChevronRight, ChevronLeft, Upload, FileText, Check, X,
  Brain, Users, Target, TrendingUp, Shield, Lightbulb,
  MessageSquare, Sparkles, AlertCircle, HelpCircle
} from 'lucide-react';
import { 
  genesisWizardQuestions, 
  WizardQuestion, 
  smeMapping, 
  corporatePartnerMapping,
  GenesisBlueprint 
} from '@/data/genesisBlueprint';
import { allExperts, corporatePartners, AIExpert } from '@/data/aiExperts';

interface GenesisBlueprintWizardProps {
  onComplete: (blueprint: Partial<GenesisBlueprint>) => void;
  existingBlueprint?: Partial<GenesisBlueprint>;
}

interface ActiveSME {
  id: string;
  name: string;
  avatar: string;
  specialty: string;
  status: 'listening' | 'thinking' | 'contributing';
  contribution?: string;
}

interface DigitalTwinMessage {
  id: string;
  type: 'question' | 'insight' | 'suggestion' | 'escalation';
  message: string;
  timestamp: Date;
  requiresResponse?: boolean;
  options?: string[];
}

export function GenesisBlueprintWizard({ onComplete, existingBlueprint }: GenesisBlueprintWizardProps) {
  const [currentSection, setCurrentSection] = useState('entry');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [activeSMEs, setActiveSMEs] = useState<ActiveSME[]>([]);
  const [activeCorporates, setActiveCorporates] = useState<string[]>([]);
  const [digitalTwinMessages, setDigitalTwinMessages] = useState<DigitalTwinMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [showTwinChat, setShowTwinChat] = useState(true);

  const sections = ['entry', 'business', 'objectives', 'market', 'differentiation', 'revenue', 'resources'];
  const sectionLabels: Record<string, string> = {
    entry: 'Getting Started',
    business: 'Business Basics',
    objectives: 'Objectives',
    market: 'Market & Customers',
    differentiation: 'Differentiation',
    revenue: 'Revenue Model',
    resources: 'Resources & Challenges'
  };

  const sectionIcons: Record<string, any> = {
    entry: Sparkles,
    business: FileText,
    objectives: Target,
    market: Users,
    differentiation: Lightbulb,
    revenue: TrendingUp,
    resources: Shield
  };

  // Get questions for current section
  const sectionQuestions = genesisWizardQuestions.filter(q => q.section === currentSection);
  
  // Filter questions based on dependencies and skip conditions
  const visibleQuestions = sectionQuestions.filter(q => {
    if (q.dependsOn) {
      const dependentAnswer = answers[q.dependsOn.questionId];
      if (Array.isArray(q.dependsOn.value)) {
        return q.dependsOn.value.includes(dependentAnswer);
      }
      return dependentAnswer === q.dependsOn.value;
    }
    return true;
  });

  const currentQuestion = visibleQuestions[currentQuestionIndex];
  const totalQuestions = genesisWizardQuestions.length;
  const answeredQuestions = Object.keys(answers).length;
  const progress = (answeredQuestions / totalQuestions) * 100;

  // Auto-engage SMEs based on current question
  useEffect(() => {
    if (currentQuestion?.smeRelevant) {
      const relevantSMEs: ActiveSME[] = [];
      
      currentQuestion.smeRelevant.forEach(smeType => {
        // Find matching experts
        const matchingExperts = allExperts.filter((e: AIExpert) => 
          e.category.toLowerCase().includes(smeType.replace('_', ' ')) ||
          e.specialty.toLowerCase().includes(smeType.replace('_', ' '))
        ).slice(0, 2);

        matchingExperts.forEach((expert: AIExpert) => {
          if (!relevantSMEs.find(s => s.id === expert.id)) {
            relevantSMEs.push({
              id: expert.id,
              name: expert.name,
              avatar: expert.avatar,
              specialty: expert.specialty,
              status: 'listening'
            });
          }
        });
      });

      setActiveSMEs(relevantSMEs);

      // Simulate SME thinking after a delay
      setTimeout(() => {
        setActiveSMEs(prev => prev.map(sme => ({
          ...sme,
          status: Math.random() > 0.5 ? 'thinking' : 'listening'
        })));
      }, 1500);
    }
  }, [currentQuestion]);

  // Auto-engage corporate partners based on industry
  useEffect(() => {
    const industry = answers['industry'];
    if (industry && corporatePartnerMapping[industry]) {
      setActiveCorporates(corporatePartnerMapping[industry]);
    }
  }, [answers['industry']]);

  // Chief of Staff proactive messaging
  useEffect(() => {
    if (currentQuestion && !digitalTwinMessages.find(m => m.id === `q-${currentQuestion.id}`)) {
      // Add contextual help
      if (currentQuestion.helpText) {
        setTimeout(() => {
          addDigitalTwinMessage({
            id: `q-${currentQuestion.id}`,
            type: 'insight',
            message: currentQuestion.helpText!,
            timestamp: new Date()
          });
        }, 500);
      }

      // Add proactive suggestions based on previous answers
      if (currentQuestion.id === 'unique_advantage' && answers['industry']) {
        setTimeout(() => {
          addDigitalTwinMessage({
            id: `suggest-${currentQuestion.id}`,
            type: 'suggestion',
            message: `Based on your ${answers['industry']} focus, I've engaged ${activeCorporates.join(' and ')} to provide sector-specific perspective on differentiation.`,
            timestamp: new Date()
          });
        }, 2000);
      }
    }
  }, [currentQuestion, answers]);

  const addDigitalTwinMessage = (message: DigitalTwinMessage) => {
    setDigitalTwinMessages(prev => [...prev, message]);
  };

  const handleAnswer = (value: any) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }));

    // Simulate SME contribution
    if (activeSMEs.length > 0 && Math.random() > 0.6) {
      const contributingSME = activeSMEs[Math.floor(Math.random() * activeSMEs.length)];
      setTimeout(() => {
        setActiveSMEs(prev => prev.map(sme => 
          sme.id === contributingSME.id 
            ? { ...sme, status: 'contributing', contribution: getSmEContribution(currentQuestion, value) }
            : sme
        ));
      }, 1000);
    }
  };

  const getSmEContribution = (question: WizardQuestion, answer: any): string => {
    const contributions: Record<string, string[]> = {
      'industry': [
        'I recommend focusing on the key growth drivers in this sector.',
        'Consider the regulatory landscape - it\'s evolving rapidly.',
        'The competitive dynamics here favor first movers with strong tech.'
      ],
      'primary_objective': [
        'This objective aligns well with current market conditions.',
        'I\'d suggest breaking this into quarterly milestones.',
        'Have you considered the resource implications of this goal?'
      ],
      'unique_advantage': [
        'Strong differentiator. Let\'s validate this with market data.',
        'Consider how defensible this is over 3-5 years.',
        'This resonates well with investor priorities.'
      ],
      'revenue_model': [
        'This model has strong unit economics potential.',
        'Consider hybrid approaches for faster growth.',
        'Benchmark against industry leaders for pricing.'
      ]
    };

    const questionContributions = contributions[question.id] || [
      'Interesting approach. Let me analyze the implications.',
      'I\'d recommend validating this assumption.',
      'This aligns with best practices in the field.'
    ];

    return questionContributions[Math.floor(Math.random() * questionContributions.length)];
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < visibleQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Move to next section
      const currentSectionIndex = sections.indexOf(currentSection);
      if (currentSectionIndex < sections.length - 1) {
        setCurrentSection(sections[currentSectionIndex + 1]);
        setCurrentQuestionIndex(0);
      } else {
        // Wizard complete
        handleComplete();
      }
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    } else {
      // Move to previous section
      const currentSectionIndex = sections.indexOf(currentSection);
      if (currentSectionIndex > 0) {
        setCurrentSection(sections[currentSectionIndex - 1]);
        const prevSectionQuestions = genesisWizardQuestions.filter(
          q => q.section === sections[currentSectionIndex - 1]
        );
        setCurrentQuestionIndex(prevSectionQuestions.length - 1);
      }
    }
  };

  const handleComplete = () => {
    setIsProcessing(true);
    
    // Build blueprint from answers
    const blueprint: Partial<GenesisBlueprint> = {
      id: `genesis-${Date.now()}`,
      name: answers['company_name'] || 'Untitled Project',
      status: 'draft',
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      projectType: mapProjectType(answers['project_goal']),
      businessInfo: {
        companyName: answers['company_name'] || '',
        industry: answers['industry'] || '',
        stage: mapStage(answers['stage']),
        description: answers['description'] || ''
      },
      objectives: {
        primary: answers['primary_objective'] || '',
        secondary: [],
        timeframe: mapTimeframe(answers['timeframe']),
        successMetrics: [{
          name: 'Primary Success Metric',
          target: answers['success_definition'] || '',
          measurementMethod: 'TBD'
        }]
      },
      targetAudience: {
        primaryPersonas: [{
          name: 'Primary Customer',
          role: answers['target_customer'] || '',
          demographics: '',
          goals: [],
          frustrations: [answers['problem_solved'] || ''],
          preferredChannels: [],
          decisionFactors: []
        }],
        secondaryPersonas: [],
        painPoints: [answers['problem_solved'] || ''],
        desiredOutcomes: []
      },
      valueProposition: {
        headline: answers['unique_advantage'] || '',
        subheadline: '',
        keyBenefits: [],
        differentiators: answers['moat'] || []
      },
      revenueModel: {
        type: mapRevenueType(answers['revenue_model']),
        pricingStrategy: answers['pricing'] || '',
        revenueStreams: [],
        projections: []
      },
      smeReviews: activeSMEs.map(sme => ({
        id: `review-${sme.id}`,
        expertId: sme.id,
        expertName: sme.name,
        expertAvatar: sme.avatar,
        section: currentSection,
        status: 'pending',
        comments: sme.contribution ? [sme.contribution] : [],
        recommendations: [],
        weight: 7
      })),
      decisions: Object.entries(answers).map(([key, value]) => ({
        id: `decision-${key}`,
        timestamp: new Date(),
        section: genesisWizardQuestions.find(q => q.id === key)?.section || 'unknown',
        question: genesisWizardQuestions.find(q => q.id === key)?.question || key,
        options: genesisWizardQuestions.find(q => q.id === key)?.options || [],
        selectedOption: String(value),
        decidedBy: 'user',
        reasoning: 'User input during wizard',
        confidence: 100
      })),
      linkedBlueprints: [
        { id: 'presentation', type: 'presentation', name: 'Presentation Blueprint', status: 'not_started', inheritedFields: ['businessInfo', 'valueProposition', 'objectives'] },
        { id: 'social_media', type: 'social_media', name: 'Social Media Blueprint', status: 'not_started', inheritedFields: ['businessInfo', 'targetAudience', 'keywords'] },
        { id: 'financial_model', type: 'financial_model', name: 'Financial Model Blueprint', status: 'not_started', inheritedFields: ['revenueModel', 'objectives', 'timeline'] }
      ]
    };

    setTimeout(() => {
      setIsProcessing(false);
      onComplete(blueprint);
    }, 2000);
  };

  const mapProjectType = (answer: string): GenesisBlueprint['projectType'] => {
    if (answer?.includes('new company')) return 'new_company';
    if (answer?.includes('existing business')) return 'existing_business';
    if (answer?.includes('specific deliverable')) return 'specific_deliverable';
    return 'unknown';
  };

  const mapStage = (answer: string): GenesisBlueprint['businessInfo']['stage'] => {
    if (answer?.includes('idea')) return 'idea';
    if (answer?.includes('Pre-seed')) return 'pre_seed';
    if (answer?.includes('Seed')) return 'seed';
    if (answer?.includes('Series A')) return 'series_a';
    if (answer?.includes('Series B')) return 'series_b';
    if (answer?.includes('Established')) return 'established';
    return 'idea';
  };

  const mapTimeframe = (answer: string): GenesisBlueprint['objectives']['timeframe'] => {
    if (answer?.includes('3 months')) return '3_months';
    if (answer?.includes('6 months')) return '6_months';
    if (answer?.includes('1 year')) return '1_year';
    if (answer?.includes('3 years')) return '3_years';
    return '1_year';
  };

  const mapRevenueType = (answer: string): GenesisBlueprint['revenueModel']['type'] => {
    if (answer?.includes('Subscription')) return 'subscription';
    if (answer?.includes('Transaction')) return 'transactional';
    if (answer?.includes('Freemium')) return 'freemium';
    if (answer?.includes('Marketplace')) return 'marketplace';
    if (answer?.includes('Licensing')) return 'licensing';
    return 'hybrid';
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadedFiles(prev => [...prev, ...files]);
    
    // Simulate AI extraction
    addDigitalTwinMessage({
      id: `upload-${Date.now()}`,
      type: 'insight',
      message: `I'm analyzing ${files.length} document(s). I'll extract key information and pre-fill relevant sections.`,
      timestamp: new Date()
    });

    setTimeout(() => {
      addDigitalTwinMessage({
        id: `extracted-${Date.now()}`,
        type: 'suggestion',
        message: 'I found company information, market data, and financial projections. I\'ve pre-filled some sections - you can review and adjust as needed.',
        timestamp: new Date()
      });
    }, 3000);
  };

  const renderQuestionInput = () => {
    if (!currentQuestion) return null;

    switch (currentQuestion.type) {
      case 'text':
        return (
          <Input
            value={answers[currentQuestion.id] || ''}
            onChange={(e) => handleAnswer(e.target.value)}
            placeholder={currentQuestion.placeholder}
            className="bg-white/5 border-white/20 text-white text-lg py-6"
          />
        );

      case 'textarea':
        return (
          <Textarea
            value={answers[currentQuestion.id] || ''}
            onChange={(e) => handleAnswer(e.target.value)}
            placeholder={currentQuestion.placeholder}
            className="bg-white/5 border-white/20 text-white min-h-[120px]"
          />
        );

      case 'select':
        return (
          <div className="grid gap-3">
            {currentQuestion.options?.map(option => (
              <button
                key={option}
                onClick={() => handleAnswer(option)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  answers[currentQuestion.id] === option
                    ? 'bg-gradient-to-r from-cyan-500/20 to-fuchsia-500/20 border-fuchsia-500/50 text-white'
                    : 'bg-white/5 border-white/10 text-foreground/80 hover:border-white/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    answers[currentQuestion.id] === option
                      ? 'border-fuchsia-500 bg-fuchsia-500'
                      : 'border-white/30'
                  }`}>
                    {answers[currentQuestion.id] === option && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <span>{option}</span>
                </div>
              </button>
            ))}
          </div>
        );

      case 'multiselect':
        const selectedValues = answers[currentQuestion.id] || [];
        return (
          <div className="grid grid-cols-2 gap-3">
            {currentQuestion.options?.map(option => (
              <button
                key={option}
                onClick={() => {
                  const newValues = selectedValues.includes(option)
                    ? selectedValues.filter((v: string) => v !== option)
                    : [...selectedValues, option];
                  handleAnswer(newValues);
                }}
                className={`p-3 rounded-xl border text-left transition-all text-sm ${
                  selectedValues.includes(option)
                    ? 'bg-gradient-to-r from-cyan-500/20 to-fuchsia-500/20 border-fuchsia-500/50 text-white'
                    : 'bg-white/5 border-white/10 text-foreground/80 hover:border-white/30'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                    selectedValues.includes(option)
                      ? 'border-fuchsia-500 bg-fuchsia-500'
                      : 'border-white/30'
                  }`}>
                    {selectedValues.includes(option) && (
                      <Check className="w-2.5 h-2.5 text-white" />
                    )}
                  </div>
                  <span>{option}</span>
                </div>
              </button>
            ))}
          </div>
        );

      case 'yesno':
        return (
          <div className="flex gap-4">
            {['yes', 'no'].map(option => (
              <button
                key={option}
                onClick={() => handleAnswer(option)}
                className={`flex-1 p-4 rounded-xl border text-center transition-all ${
                  answers[currentQuestion.id] === option
                    ? 'bg-gradient-to-r from-cyan-500/20 to-fuchsia-500/20 border-fuchsia-500/50 text-white'
                    : 'bg-white/5 border-white/10 text-foreground/80 hover:border-white/30'
                }`}
              >
                {option === 'yes' ? 'Yes' : 'No'}
              </button>
            ))}
          </div>
        );

      case 'upload':
        return (
          <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-fuchsia-500/50 transition-colors">
            <input
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload className="w-12 h-12 mx-auto text-foreground/70 mb-4" />
              <p className="text-foreground/80 mb-2">Drop files here or click to upload</p>
              <p className="text-foreground/60 text-sm">PDF, Word, PowerPoint, Excel</p>
            </label>
            {uploadedFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                {uploadedFiles.map((file, i) => (
                  <div key={i} className="flex items-center gap-2 bg-white/5 rounded-lg p-2">
                    <FileText className="w-4 h-4 text-fuchsia-400" />
                    <span className="text-sm text-foreground/80">{file.name}</span>
                    <Check className="w-4 h-4 text-green-400 ml-auto" />
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const SectionIcon = sectionIcons[currentSection] || FileText;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800">
      {/* Progress Header */}
      <div className="border-b border-white/10 bg-black/20 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-500 to-fuchsia-500 flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-white">Genesis Blueprint</h1>
                <p className="text-xs text-foreground/70">Building your strategic foundation</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-foreground/70">{Math.round(progress)}% complete</p>
              <p className="text-xs text-foreground/60">{answeredQuestions} of {totalQuestions} questions</p>
            </div>
          </div>
          <Progress value={progress} className="h-1" />
          
          {/* Section Navigation */}
          <div className="flex gap-1 mt-4 overflow-x-auto pb-2">
            {sections.map((section, index) => {
              const Icon = sectionIcons[section];
              const isActive = section === currentSection;
              const isCompleted = sections.indexOf(currentSection) > index;
              
              return (
                <button
                  key={section}
                  onClick={() => {
                    setCurrentSection(section);
                    setCurrentQuestionIndex(0);
                  }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/20 to-fuchsia-500/20 text-white border border-fuchsia-500/30'
                      : isCompleted
                      ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                      : 'bg-white/5 text-foreground/70 border border-transparent hover:border-white/10'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    <Icon className="w-3 h-3" />
                  )}
                  {sectionLabels[section]}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-3 gap-8">
          {/* Main Question Area */}
          <div className="col-span-2">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
              {/* Section Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-cyan-500/20 to-fuchsia-500/20 flex items-center justify-center">
                  <SectionIcon className="w-6 h-6 text-fuchsia-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">{sectionLabels[currentSection]}</h2>
                  <p className="text-sm text-foreground/70">
                    Question {currentQuestionIndex + 1} of {visibleQuestions.length}
                  </p>
                </div>
              </div>

              {/* Question */}
              {currentQuestion && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-medium text-white">
                    {currentQuestion.question}
                  </h3>

                  {renderQuestionInput()}

                  {/* Navigation */}
                  <div className="flex items-center justify-between pt-6 border-t border-white/10">
                    <Button
                      variant="outline"
                      onClick={prevQuestion}
                      disabled={currentSection === 'entry' && currentQuestionIndex === 0}
                      className="border-white/20 text-foreground/80 hover:bg-white/5"
                    >
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Previous
                    </Button>

                    <Button
                      onClick={nextQuestion}
                      disabled={currentQuestion.required && !answers[currentQuestion.id]}
                      className="bg-gradient-to-r from-cyan-500 to-fuchsia-500 hover:opacity-90"
                    >
                      {currentSection === 'resources' && currentQuestionIndex === visibleQuestions.length - 1
                        ? 'Complete Blueprint'
                        : 'Continue'}
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar - SME Panel & Chief of Staff */}
          <div className="space-y-6">
            {/* Active SMEs */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-fuchsia-400" />
                <h3 className="font-semibold text-white">Active Experts</h3>
              </div>

              {activeSMEs.length > 0 ? (
                <div className="space-y-3">
                  {activeSMEs.map(sme => (
                    <div key={sme.id} className="bg-white/5 rounded-xl p-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{sme.avatar}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{sme.name}</p>
                          <p className="text-xs text-foreground/70 truncate">{sme.specialty}</p>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={`text-[10px] ${
                            sme.status === 'contributing' 
                              ? 'border-green-500/50 text-green-400'
                              : sme.status === 'thinking'
                              ? 'border-yellow-500/50 text-yellow-400'
                              : 'border-white/20 text-foreground/70'
                          }`}
                        >
                          {sme.status === 'contributing' ? '💬 Contributing' : 
                           sme.status === 'thinking' ? '🤔 Thinking' : '👂 Listening'}
                        </Badge>
                      </div>
                      {sme.contribution && (
                        <div className="mt-2 p-2 bg-green-500/10 rounded-lg border border-green-500/20">
                          <p className="text-xs text-green-300">"{sme.contribution}"</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-foreground/60 text-center py-4">
                  Experts will join based on your answers
                </p>
              )}

              {/* Corporate Partners */}
              {activeCorporates.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-xs text-foreground/70 mb-2">Sector Perspective From:</p>
                  <div className="flex flex-wrap gap-2">
                    {activeCorporates.map(name => {
                      const corp = corporatePartners.find(c => c.name === name);
                      return corp ? (
                        <Badge key={name} variant="outline" className="border-fuchsia-500/30 text-fuchsia-300">
                          {corp.logo} {corp.name}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Chief of Staff Chat */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-cyan-400" />
                  <h3 className="font-semibold text-white">Chief of Staff</h3>
                </div>
                <button 
                  onClick={() => setShowTwinChat(!showTwinChat)}
                  className="text-foreground/70 hover:text-white"
                >
                  {showTwinChat ? <X className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
                </button>
              </div>

              {showTwinChat && (
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {digitalTwinMessages.slice(-5).map(msg => (
                    <div 
                      key={msg.id}
                      className={`p-3 rounded-xl text-sm ${
                        msg.type === 'insight' 
                          ? 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-200'
                          : msg.type === 'suggestion'
                          ? 'bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-200'
                          : msg.type === 'escalation'
                          ? 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-200'
                          : 'bg-white/5 border border-white/10 text-foreground/80'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {msg.type === 'insight' && <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                        {msg.type === 'suggestion' && <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                        {msg.type === 'escalation' && <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                        {msg.type === 'question' && <HelpCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                        <p>{msg.message}</p>
                      </div>
                    </div>
                  ))}

                  {digitalTwinMessages.length === 0 && (
                    <div className="text-center py-4">
                      <Brain className="w-8 h-8 mx-auto text-foreground/60 mb-2" />
                      <p className="text-sm text-foreground/60">
                        I'm here to help guide you through this process
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Processing Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-white/10 rounded-2xl p-8 max-w-md text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 flex items-center justify-center animate-pulse">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Building Your Blueprint</h3>
            <p className="text-foreground/70 mb-4">
              Compiling insights, engaging experts, and preparing your strategic foundation...
            </p>
            <Progress value={75} className="h-2" />
          </div>
        </div>
      )}
    </div>
  );
}
