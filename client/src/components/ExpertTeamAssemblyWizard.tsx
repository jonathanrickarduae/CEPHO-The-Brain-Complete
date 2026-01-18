import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, Brain, Sparkles, Check, ChevronRight, 
  Globe, Briefcase, Palette, Shield, BarChart3,
  MessageSquare, Lightbulb, Target, Zap, Crown
} from 'lucide-react';

interface ExpertRole {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: 'leadership' | 'cultural' | 'functional' | 'creative' | 'quality';
  required: boolean;
}

interface ExpertTeamTemplate {
  id: string;
  name: string;
  description: string;
  projectTypes: string[];
  roles: ExpertRole[];
  icon: React.ReactNode;
  color: string;
}

interface SelectedExpert {
  roleId: string;
  expertId: string;
  expertName: string;
  perspective: 'gcc' | 'western' | 'global';
}

interface ExpertTeamAssemblyWizardProps {
  projectType?: string;
  onComplete: (team: SelectedExpert[]) => void;
  onBack: () => void;
}

const EXPERT_ROLES: ExpertRole[] = [
  // Leadership
  { id: 'project_lead', title: 'Project Lead', description: 'Overall project coordination and decision making', icon: <Crown className="w-5 h-5" />, category: 'leadership', required: true },
  { id: 'domain_expert', title: 'Domain Expert', description: 'Subject matter expertise for the project area', icon: <Brain className="w-5 h-5" />, category: 'leadership', required: true },
  
  // Cultural
  { id: 'gcc_cultural', title: 'GCC Cultural Advisor', description: 'Local cultural awareness and regional insights', icon: <Globe className="w-5 h-5" />, category: 'cultural', required: true },
  { id: 'western_perspective', title: 'Western Perspective', description: 'Global best practices and international standards', icon: <Globe className="w-5 h-5" />, category: 'cultural', required: true },
  { id: 'gen_z_voice', title: 'Gen Z Voice', description: 'Fresh perspective from younger generation', icon: <Zap className="w-5 h-5" />, category: 'cultural', required: false },
  { id: 'recent_grad', title: 'Recent Graduate', description: 'Current market expectations and fresh insights', icon: <Lightbulb className="w-5 h-5" />, category: 'cultural', required: false },
  
  // Functional
  { id: 'strategy', title: 'Strategy Expert', description: 'Strategic planning and competitive positioning', icon: <Target className="w-5 h-5" />, category: 'functional', required: true },
  { id: 'operations', title: 'Operations Expert', description: 'Implementation and process optimization', icon: <Briefcase className="w-5 h-5" />, category: 'functional', required: false },
  { id: 'finance', title: 'Finance Expert', description: 'Budget, ROI, and financial modeling', icon: <BarChart3 className="w-5 h-5" />, category: 'functional', required: false },
  
  // Creative
  { id: 'storyteller', title: 'Storyteller', description: 'Narrative development and compelling messaging', icon: <MessageSquare className="w-5 h-5" />, category: 'creative', required: true },
  { id: 'visual_designer', title: 'Visual Designer', description: 'Visual identity and presentation design', icon: <Palette className="w-5 h-5" />, category: 'creative', required: true },
  
  // Quality
  { id: 'qa_reviewer', title: 'QA Reviewer', description: 'Quality assurance and standards compliance', icon: <Shield className="w-5 h-5" />, category: 'quality', required: true },
];

const TEAM_TEMPLATES: ExpertTeamTemplate[] = [
  {
    id: 'graduate_program',
    name: 'Graduate Program Team',
    description: 'Ideal for developing world class graduate and training programs',
    projectTypes: ['Graduate Program', 'Training Program', 'L&D Initiative'],
    roles: EXPERT_ROLES.filter(r => 
      ['project_lead', 'domain_expert', 'gcc_cultural', 'western_perspective', 'gen_z_voice', 'recent_grad', 'strategy', 'storyteller', 'visual_designer', 'qa_reviewer'].includes(r.id)
    ),
    icon: <Users className="w-6 h-6" />,
    color: 'from-cyan-500 to-blue-500'
  },
  {
    id: 'marketing_campaign',
    name: 'Marketing Campaign Team',
    description: 'Perfect for brand launches, campaigns, and market positioning',
    projectTypes: ['Marketing Campaign', 'Brand Launch', 'Product Launch'],
    roles: EXPERT_ROLES.filter(r => 
      ['project_lead', 'domain_expert', 'gcc_cultural', 'western_perspective', 'gen_z_voice', 'strategy', 'storyteller', 'visual_designer', 'qa_reviewer'].includes(r.id)
    ),
    icon: <Sparkles className="w-6 h-6" />,
    color: 'from-fuchsia-500 to-pink-500'
  },
  {
    id: 'product_launch',
    name: 'Product Launch Team',
    description: 'Comprehensive team for new product or service launches',
    projectTypes: ['Product Launch', 'Service Launch', 'Market Entry'],
    roles: EXPERT_ROLES.filter(r => 
      ['project_lead', 'domain_expert', 'gcc_cultural', 'western_perspective', 'strategy', 'operations', 'finance', 'storyteller', 'visual_designer', 'qa_reviewer'].includes(r.id)
    ),
    icon: <Target className="w-6 h-6" />,
    color: 'from-emerald-500 to-green-500'
  },
  {
    id: 'strategic_initiative',
    name: 'Strategic Initiative Team',
    description: 'For major business transformations and strategic projects',
    projectTypes: ['Strategic Initiative', 'Business Transformation', 'Digital Transformation'],
    roles: EXPERT_ROLES.filter(r => 
      ['project_lead', 'domain_expert', 'gcc_cultural', 'western_perspective', 'strategy', 'operations', 'finance', 'qa_reviewer'].includes(r.id)
    ),
    icon: <Brain className="w-6 h-6" />,
    color: 'from-amber-500 to-orange-500'
  },
  {
    id: 'custom',
    name: 'Custom Team',
    description: 'Build your own team from scratch',
    projectTypes: ['Custom', 'Other'],
    roles: EXPERT_ROLES,
    icon: <Briefcase className="w-6 h-6" />,
    color: 'from-gray-500 to-gray-600'
  }
];

export function ExpertTeamAssemblyWizard({ projectType, onComplete, onBack }: ExpertTeamAssemblyWizardProps) {
  const [step, setStep] = useState<'template' | 'customize' | 'review'>('template');
  const [selectedTemplate, setSelectedTemplate] = useState<ExpertTeamTemplate | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedExperts, setSelectedExperts] = useState<SelectedExpert[]>([]);

  // Auto-select template based on project type
  const suggestedTemplate = TEAM_TEMPLATES.find(t => 
    t.projectTypes.some(pt => projectType?.toLowerCase().includes(pt.toLowerCase()))
  ) || TEAM_TEMPLATES[0];

  const handleTemplateSelect = (template: ExpertTeamTemplate) => {
    setSelectedTemplate(template);
    setSelectedRoles(template.roles.filter(r => r.required).map(r => r.id));
    setStep('customize');
  };

  const toggleRole = (roleId: string) => {
    const role = EXPERT_ROLES.find(r => r.id === roleId);
    if (role?.required) return; // Cannot toggle required roles
    
    setSelectedRoles(prev => 
      prev.includes(roleId) 
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId]
    );
  };

  const handleContinueToReview = () => {
    // Auto-assign experts based on roles
    const experts: SelectedExpert[] = selectedRoles.map(roleId => ({
      roleId,
      expertId: `expert-${roleId}`,
      expertName: EXPERT_ROLES.find(r => r.id === roleId)?.title || 'Expert',
      perspective: roleId.includes('gcc') ? 'gcc' : roleId.includes('western') ? 'western' : 'global'
    }));
    setSelectedExperts(experts);
    setStep('review');
  };

  const getCategoryColor = (category: ExpertRole['category']) => {
    switch (category) {
      case 'leadership': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'cultural': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'functional': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'creative': return 'bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/30';
      case 'quality': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-cyan-500 to-fuchsia-500 flex items-center justify-center">
            <Users className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Expert Team Assembly</h1>
            <p className="text-foreground/70">Build your 12 person expert team for this project</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-4 mb-8">
          {['Select Template', 'Customize Team', 'Review & Confirm'].map((label, i) => {
            const stepNum = i + 1;
            const isActive = (step === 'template' && stepNum === 1) || 
                           (step === 'customize' && stepNum === 2) || 
                           (step === 'review' && stepNum === 3);
            const isComplete = (step === 'customize' && stepNum === 1) || 
                             (step === 'review' && stepNum <= 2);
            
            return (
              <div key={label} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  isComplete ? 'bg-green-500 text-white' :
                  isActive ? 'bg-fuchsia-500 text-white' :
                  'bg-white/10 text-foreground/70'
                }`}>
                  {isComplete ? <Check className="w-4 h-4" /> : stepNum}
                </div>
                <span className={`text-sm ${isActive ? 'text-white' : 'text-foreground/70'}`}>{label}</span>
                {i < 2 && <ChevronRight className="w-4 h-4 text-foreground/50" />}
              </div>
            );
          })}
        </div>

        {/* Step 1: Template Selection */}
        {step === 'template' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Choose a Team Template</h2>
              {projectType && (
                <Badge className="bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/30">
                  Suggested for: {projectType}
                </Badge>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {TEAM_TEMPLATES.map(template => (
                <button
                  key={template.id}
                  onClick={() => handleTemplateSelect(template)}
                  className={`p-6 rounded-2xl text-left transition-all ${
                    template.id === suggestedTemplate.id
                      ? `bg-gradient-to-br ${template.color}/20 border-2 border-fuchsia-500/50 hover:border-fuchsia-500`
                      : 'bg-white/5 border border-white/10 hover:border-white/30'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${template.color} flex items-center justify-center mb-4`}>
                    {template.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-1">{template.name}</h3>
                  <p className="text-sm text-foreground/70 mb-3">{template.description}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-white/5 text-foreground/80 border-white/20">
                      {template.roles.length} experts
                    </Badge>
                    {template.id === suggestedTemplate.id && (
                      <Badge className="bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/30">
                        Recommended
                      </Badge>
                    )}
                  </div>
                </button>
              ))}
            </div>
            
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={onBack} className="border-white/20 text-foreground/80">
                Back
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Customize Team */}
        {step === 'customize' && selectedTemplate && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Customize Your Team</h2>
              <Badge className="bg-white/10 text-foreground/80 border-white/20">
                {selectedRoles.length} of 12 roles selected
              </Badge>
            </div>

            {/* Role Categories */}
            {(['leadership', 'cultural', 'functional', 'creative', 'quality'] as const).map(category => {
              const categoryRoles = selectedTemplate.roles.filter(r => r.category === category);
              if (categoryRoles.length === 0) return null;
              
              return (
                <Card key={category} className="bg-white/5 border-white/10">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-white capitalize flex items-center gap-2">
                      <Badge variant="outline" className={getCategoryColor(category)}>
                        {category}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      {categoryRoles.map(role => {
                        const isSelected = selectedRoles.includes(role.id);
                        return (
                          <button
                            key={role.id}
                            onClick={() => toggleRole(role.id)}
                            disabled={role.required}
                            className={`p-4 rounded-xl text-left transition-all ${
                              isSelected
                                ? 'bg-fuchsia-500/20 border border-fuchsia-500/50'
                                : 'bg-white/5 border border-white/10 hover:border-white/30'
                            } ${role.required ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                isSelected ? 'bg-fuchsia-500/30 text-fuchsia-400' : 'bg-white/10 text-foreground/70'
                              }`}>
                                {role.icon}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium text-white text-sm">{role.title}</h4>
                                  {role.required && (
                                    <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">
                                      Required
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-foreground/70 mt-1">{role.description}</p>
                              </div>
                              {isSelected && (
                                <Check className="w-5 h-5 text-fuchsia-400 flex-shrink-0" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep('template')} className="border-white/20 text-foreground/80">
                Back
              </Button>
              <Button 
                onClick={handleContinueToReview}
                className="bg-gradient-to-r from-cyan-500 to-fuchsia-500"
              >
                Continue to Review
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 'review' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-white">Review Your Expert Team</h2>
            
            <Card className="bg-white/5 border-white/10">
              <CardContent className="pt-6">
                <div className="grid grid-cols-3 gap-4">
                  {selectedExperts.map(expert => {
                    const role = EXPERT_ROLES.find(r => r.id === expert.roleId);
                    return (
                      <div key={expert.roleId} className="bg-white/5 rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 flex items-center justify-center">
                            {role?.icon}
                          </div>
                          <div>
                            <h4 className="font-medium text-white text-sm">{role?.title}</h4>
                            <Badge variant="outline" className={getCategoryColor(role?.category || 'leadership')}>
                              {expert.perspective.toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <div className="bg-gradient-to-r from-cyan-500/10 to-fuchsia-500/10 border border-fuchsia-500/30 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <Sparkles className="w-6 h-6 text-fuchsia-400 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-white mb-1">Team Ready</h3>
                  <p className="text-foreground/70 text-sm">
                    Your {selectedExperts.length} person expert team is assembled and ready to begin work on your project. 
                    Each expert will contribute their unique perspective and expertise.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep('customize')} className="border-white/20 text-foreground/80">
                Back
              </Button>
              <Button 
                onClick={() => onComplete(selectedExperts)}
                className="bg-gradient-to-r from-cyan-500 to-fuchsia-500"
              >
                Confirm Team & Continue
                <Check className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ExpertTeamAssemblyWizard;
