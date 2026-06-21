import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, Rocket, FileText, GitBranch, Plus, 
  ChevronRight, Sparkles, Clock, Check, Share2, 
  PresentationIcon, DollarSign, Shield, BarChart3
} from 'lucide-react';
import ProjectGenesis from '@/components/ProjectGenesis';
import { GenesisBlueprintWizard } from '@/components/GenesisBlueprintWizard';
import { BlueprintQMS } from '@/components/BlueprintQMS';
import { SocialMediaBlueprint } from '@/components/SocialMediaBlueprint';
import { QMSProcessLog } from '@/components/QMSProcessLog';
import { PresentationBlueprint } from '@/components/PresentationBlueprint';
import { GenesisBlueprint } from '@/data/genesisBlueprint';
import { VoiceNoteIntake } from '@/components/VoiceNoteIntake';
import { ExpertTeamAssemblyWizard } from '@/components/ExpertTeamAssemblyWizard';
import { IdeaScoringDashboard } from '@/components/IdeaScoringDashboard';
import { ValidationEngine } from '@/components/ValidationEngine';
import { ValueChainProgress, ValueChainProgressCompact } from '@/components/ValueChainProgress';
import { valueChainPhases, type ProjectPhaseProgress, type ProjectPhaseStatus } from '@/data/valueChain';
import { BlueprintTemplatesDashboard, defaultTemplates, type BlueprintTemplate } from '@/components/BlueprintTemplates';

type ViewMode = 'dashboard' | 'voice_intake' | 'new_project' | 'team_assembly' | 'idea_scoring' | 'validation' | 'qms' | 'legacy' | 'social_media' | 'presentation' | 'financial' | 'process_log' | 'value_chain' | 'blueprints';

interface ProjectBlueprint {
  templateId: string;
  templateName: string;
  phase: string;
  status: 'draft' | 'in_progress' | 'review' | 'approved';
  completedSections: number;
  totalSections: number;
}

interface SavedProject {
  id: string;
  name: string;
  status: GenesisBlueprint['status'];
  industry: string;
  createdAt: Date;
  updatedAt: Date;
  completionPercentage: number;
  // Value Chain tracking
  currentPhaseId: number;
  phaseProgress: ProjectPhaseProgress[];
  // Blueprint tracking
  blueprints?: ProjectBlueprint[];
}

export default function ProjectGenesisPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [currentBlueprint, setCurrentBlueprint] = useState<Partial<GenesisBlueprint> | null>(null);
  const [savedProjects, setSavedProjects] = useState<SavedProject[]>([
    {
      id: 'demo-1',
      name: 'Boundless AI',
      status: 'in_review',
      industry: 'Technology',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-20'),
      completionPercentage: 75,
      currentPhaseId: 3,
      phaseProgress: [
        { phaseId: 1, status: 'approved', completedChecks: ['Market opportunity validated', 'Problem clearly defined', 'Initial solution concept documented', 'Key assumptions identified'], startedAt: new Date('2024-01-15'), completedAt: new Date('2024-01-16') },
        { phaseId: 2, status: 'approved', completedChecks: ['Value proposition validated with customers', 'Business model economics viable', 'Technical approach confirmed', 'IP position assessed'], startedAt: new Date('2024-01-16'), completedAt: new Date('2024-01-18') },
        { phaseId: 3, status: 'in_progress', completedChecks: ['MVP meets core requirements', 'Quality systems operational'], startedAt: new Date('2024-01-18') },
        { phaseId: 4, status: 'not_started', completedChecks: [] },
        { phaseId: 5, status: 'not_started', completedChecks: [] },
        { phaseId: 6, status: 'not_started', completedChecks: [] },
        { phaseId: 7, status: 'not_started', completedChecks: [] }
      ]
    }
  ]);

  const handleBlueprintComplete = (blueprint: Partial<GenesisBlueprint>) => {
    setCurrentBlueprint(blueprint);
    
    // Add to saved projects
    const newProject: SavedProject = {
      id: blueprint.id || `project-${Date.now()}`,
      name: blueprint.name || 'Untitled Project',
      status: blueprint.status || 'draft',
      industry: blueprint.businessInfo?.industry || 'Unknown',
      createdAt: new Date(),
      updatedAt: new Date(),
      completionPercentage: 100,
      currentPhaseId: 1,
      phaseProgress: valueChainPhases.map(phase => ({
        phaseId: phase.id,
        status: phase.id === 1 ? 'in_progress' as ProjectPhaseStatus : 'not_started' as ProjectPhaseStatus,
        completedChecks: [],
        startedAt: phase.id === 1 ? new Date() : undefined
      }))
    };
    
    setSavedProjects(prev => [newProject, ...prev]);
    setViewMode('qms');
  };

  const getStatusColor = (status: GenesisBlueprint['status']) => {
    switch (status) {
      case 'approved': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'in_review': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'needs_update': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default: return 'bg-white/10 text-foreground/70 border-white/20';
    }
  };

  // Dashboard View
  if (viewMode === 'dashboard') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header - Mobile responsive */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-r from-cyan-500 to-fuchsia-500 flex items-center justify-center shrink-0">
                <Rocket className="w-6 h-6 md:w-7 md:h-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-white">Project Genesis</h1>
                <p className="text-sm md:text-base text-foreground/70">Strategic blueprint creation</p>
              </div>
            </div>
            <div className="flex gap-2 md:gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode('value_chain')}
                className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
              >
                <BarChart3 className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">Value Chain</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode('blueprints')}
                className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
              >
                <FileText className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">Blueprints</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode('qms')}
                className="border-white/20 text-foreground/80 hover:bg-white/5"
              >
                <GitBranch className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">Quality Management</span>
              </Button>
              <Button
                size="sm"
                onClick={() => setViewMode('new_project')}
                className="bg-gradient-to-r from-cyan-500 to-fuchsia-500 hover:opacity-90"
              >
                <Plus className="w-4 h-4 md:mr-2" />
                <span className="hidden sm:inline">New Project</span>
              </Button>
            </div>
          </div>

          {/* Quick Actions - Mobile responsive grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
            <button
              onClick={() => setViewMode('voice_intake')}
              className="p-4 md:p-6 bg-gradient-to-br from-cyan-500/10 to-fuchsia-500/10 border-2 border-cyan-500/50 rounded-2xl text-left hover:border-cyan-500 transition-all group"
            >
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center mb-3 md:mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5 md:w-6 md:h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <h3 className="text-sm md:text-lg font-semibold text-white mb-1">Start with Voice</h3>
              <p className="text-xs md:text-sm text-foreground/70 hidden sm:block">
                Record a voice note and let AI pre-populate
              </p>
              <span className="inline-block mt-1 md:mt-2 text-xs text-cyan-400 font-medium">Recommended</span>
            </button>

            <button
              onClick={() => setViewMode('new_project')}
              className="p-4 md:p-6 bg-gradient-to-br from-fuchsia-500/10 to-purple-500/10 border border-fuchsia-500/30 rounded-2xl text-left hover:border-fuchsia-500/50 transition-all group"
            >
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-fuchsia-500/20 flex items-center justify-center mb-3 md:mb-4 group-hover:scale-110 transition-transform">
                <Brain className="w-5 h-5 md:w-6 md:h-6 text-fuchsia-400" />
              </div>
              <h3 className="text-sm md:text-lg font-semibold text-white mb-1">Genesis Blueprint</h3>
              <p className="text-xs md:text-sm text-foreground/70 hidden sm:block">
                Intelligent wizard with SME collaboration
              </p>
            </button>

            <button
              onClick={() => setViewMode('legacy')}
              className="p-4 md:p-6 bg-white/5 border border-white/10 rounded-2xl text-left hover:border-white/20 transition-all group"
            >
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white/10 flex items-center justify-center mb-3 md:mb-4 group-hover:scale-110 transition-transform">
                <FileText className="w-5 h-5 md:w-6 md:h-6 text-foreground/70" />
              </div>
              <h3 className="text-sm md:text-lg font-semibold text-white mb-1">Classic Mode</h3>
              <p className="text-xs md:text-sm text-foreground/70 hidden sm:block">
                Traditional project setup
              </p>
            </button>

            <button
              onClick={() => setViewMode('process_log')}
              className="p-4 md:p-6 bg-white/5 border border-white/10 rounded-2xl text-left hover:border-white/20 transition-all group"
            >
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white/10 flex items-center justify-center mb-3 md:mb-4 group-hover:scale-110 transition-transform">
                <Shield className="w-5 h-5 md:w-6 md:h-6 text-foreground/70" />
              </div>
              <h3 className="text-sm md:text-lg font-semibold text-white mb-1">QMS Process Log</h3>
              <p className="text-xs md:text-sm text-foreground/70 hidden sm:block">
                Document control & audit
              </p>
            </button>
          </div>

          {/* Sub-Blueprints - Scrollable on mobile */}
          <div className="overflow-x-auto scrollbar-hide mb-6 md:mb-8 -mx-4 px-4 md:mx-0 md:px-0">
            <div className="flex md:grid md:grid-cols-4 gap-3 md:gap-4 min-w-max md:min-w-0">
            <button
              onClick={() => setViewMode('social_media')}
              className="p-4 bg-gradient-to-br from-pink-500/10 to-purple-500/10 border border-pink-500/30 rounded-xl text-left hover:border-pink-500/50 transition-all group"
            >
              <Share2 className="w-6 h-6 text-pink-400 mb-2 group-hover:scale-110 transition-transform" />
              <h4 className="font-medium text-white text-sm">Social Media Blueprint</h4>
              <p className="text-xs text-foreground/70 mt-1">Platform strategy & content</p>
            </button>

            <button
              onClick={() => setViewMode('presentation')}
              className="p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-xl text-left hover:border-blue-500/50 transition-all group"
            >
              <PresentationIcon className="w-6 h-6 text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
              <h4 className="font-medium text-white text-sm">Presentation Blueprint</h4>
              <p className="text-xs text-foreground/70 mt-1">Investor decks & pitches</p>
            </button>

            <button
              onClick={() => setViewMode('financial')}
              className="p-4 bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-500/30 rounded-xl text-left hover:border-emerald-500/50 transition-all group"
            >
              <DollarSign className="w-6 h-6 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
              <h4 className="font-medium text-white text-sm">Financial Model Blueprint</h4>
              <p className="text-xs text-foreground/70 mt-1">Projections & valuations</p>
            </button>

            <button
              onClick={() => setViewMode('qms')}
              className="p-4 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl text-left hover:border-amber-500/50 transition-all group"
            >
              <GitBranch className="w-6 h-6 text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
              <h4 className="font-medium text-white text-sm">Blueprint Network</h4>
              <p className="text-xs text-foreground/70 mt-1">Cascading updates</p>
            </button>
            </div>
          </div>

          {/* Recent Projects */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-foreground/70" />
                Recent Projects
              </h2>
              <Button variant="ghost" className="text-foreground/70 hover:text-white">
                View All
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            {savedProjects.length > 0 ? (
              <div className="space-y-3">
                {savedProjects.map(project => {
                  const currentPhase = valueChainPhases.find(p => p.id === project.currentPhaseId);
                  return (
                    <div 
                      key={project.id}
                      className="p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
                      onClick={() => {
                        setViewMode('qms');
                      }}
                    >
                      {/* Top row - Project info */}
                      <div className="flex items-center gap-4 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-cyan-500/20 to-fuchsia-500/20 flex items-center justify-center shrink-0">
                          <Rocket className="w-6 h-6 text-fuchsia-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-white truncate">{project.name}</h3>
                            <Badge variant="outline" className={getStatusColor(project.status)}>
                              {project.status?.replace('_', ' ')}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-foreground/70">
                            <span>{project.industry}</span>
                            <span>•</span>
                            <span>Updated {project.updatedAt.toLocaleDateString('en-GB')}</span>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-foreground/60 shrink-0" />
                      </div>
                      
                      {/* Value Chain Progress */}
                      <div className="pl-16">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs text-foreground/60">Current Phase:</span>
                          <span className={`text-xs font-medium ${currentPhase?.color || 'text-foreground/70'}`}>
                            {currentPhase?.icon} {currentPhase?.name || 'Not Started'}
                          </span>
                        </div>
                        <ValueChainProgressCompact 
                          currentPhaseId={project.currentPhaseId}
                          phaseProgress={project.phaseProgress}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Sparkles className="w-12 h-12 mx-auto text-foreground/50 mb-4" />
                <p className="text-foreground/70 mb-2">No projects yet</p>
                <p className="text-foreground/60 text-sm mb-4">
                  Start your first Genesis Blueprint to build a strategic foundation
                </p>
                <Button
                  onClick={() => setViewMode('new_project')}
                  className="bg-gradient-to-r from-cyan-500 to-fuchsia-500"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Project
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Voice Note Intake
  if (viewMode === 'voice_intake') {
    return (
      <VoiceNoteIntake
        onComplete={(result) => {
          // Store extracted fields and move to wizard
          console.log('Voice intake complete:', result);
          setViewMode('team_assembly');
        }}
        onSkip={() => setViewMode('new_project')}
      />
    );
  }

  // Expert Team Assembly
  if (viewMode === 'team_assembly') {
    return (
      <ExpertTeamAssemblyWizard
        projectType="Graduate Program"
        onComplete={(team) => {
          console.log('Team assembled:', team);
          setViewMode('new_project');
        }}
        onBack={() => setViewMode('voice_intake')}
      />
    );
  }

  // Idea Scoring Dashboard
  if (viewMode === 'idea_scoring') {
    return (
      <IdeaScoringDashboard
        projectId="demo-project"
        projectName={currentBlueprint?.name || 'Project'}
        onComplete={(approvedIdeas) => {
          console.log('Approved ideas:', approvedIdeas);
          setViewMode('validation');
        }}
        onBack={() => setViewMode('new_project')}
      />
    );
  }

  // Chief of Staff Validation
  if (viewMode === 'validation') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => setViewMode('idea_scoring')}
            className="flex items-center gap-2 text-foreground/70 hover:text-white transition-colors mb-6"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            Back to Idea Scoring
          </button>

          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-8 h-8 text-cyan-400" />
              <h1 className="text-3xl font-bold text-white">Chief of Staff Validation</h1>
            </div>
            <p className="text-foreground/70">
              All outputs are cross-validated, fact-checked, and source-referenced before delivery.
            </p>
          </div>

          <ValidationEngine
            projectId="demo-project"
            projectName={currentBlueprint?.name || 'Project'}
            content=""
            onValidationComplete={(report) => {
              console.log('Validation complete:', report);
              if (report.overallStatus === 'verified') {
                setViewMode('qms');
              }
            }}
          />
        </div>
      </div>
    );
  }

  // New Project (Genesis Blueprint Wizard)
  if (viewMode === 'new_project') {
    return (
      <div className="relative">
        {/* Back Button */}
        <button
          onClick={() => setViewMode('dashboard')}
          className="absolute top-4 left-4 z-20 flex items-center gap-2 text-foreground/70 hover:text-white transition-colors"
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
          Back to Dashboard
        </button>
        
        <GenesisBlueprintWizard 
          onComplete={handleBlueprintComplete}
        />
      </div>
    );
  }

  // Quality Management System View
  if (viewMode === 'qms') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => setViewMode('dashboard')}
            className="flex items-center gap-2 text-foreground/70 hover:text-white transition-colors mb-6"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            Back to Dashboard
          </button>

          <BlueprintQMS
            genesisBlueprint={currentBlueprint || {
              id: 'demo-blueprint',
              name: 'Boundless AI',
              status: 'in_review',
              linkedBlueprints: [
                { id: 'presentation', type: 'presentation', name: 'Presentation Blueprint', status: 'in_progress', inheritedFields: ['businessInfo', 'valueProposition', 'objectives'] },
                { id: 'social_media', type: 'social_media', name: 'Social Media Blueprint', status: 'not_started', inheritedFields: ['businessInfo', 'targetAudience', 'keywords'] },
                { id: 'financial_model', type: 'financial_model', name: 'Financial Model Blueprint', status: 'not_started', inheritedFields: ['revenueModel', 'objectives', 'timeline'] }
              ]
            }}
            pendingChanges={[
              {
                id: 'change-1',
                field: 'valueProposition.headline',
                oldValue: 'AI-powered business intelligence',
                newValue: 'The AI command center for strategic decision-making',
                timestamp: new Date(),
                changedBy: 'sme',
                smeId: 'strategy-expert'
              },
              {
                id: 'change-2',
                field: 'objectives.primary',
                oldValue: 'Raise Series A',
                newValue: 'Achieve product-market fit and raise Series A',
                timestamp: new Date(),
                changedBy: 'digital_twin'
              }
            ]}
            onApplyChanges={(changes, targets) => {
              console.log('Applying changes:', changes, 'to targets:', targets);
            }}
            onRejectChanges={(ids) => {
              console.log('Rejecting changes:', ids);
            }}
            onViewBlueprint={(id) => {
              console.log('Viewing blueprint:', id);
            }}
          />
        </div>
      </div>
    );
  }

  // Social Media Blueprint View
  if (viewMode === 'social_media') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 p-6">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => setViewMode('dashboard')}
            className="flex items-center gap-2 text-foreground/70 hover:text-white transition-colors mb-6"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            Back to Dashboard
          </button>
          <SocialMediaBlueprint />
        </div>
      </div>
    );
  }

  // Presentation Blueprint View
  if (viewMode === 'presentation') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 p-6">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => setViewMode('dashboard')}
            className="flex items-center gap-2 text-foreground/70 hover:text-white transition-colors mb-6"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            Back to Dashboard
          </button>
          <PresentationBlueprint />
        </div>
      </div>
    );
  }

  // Financial Model Blueprint View (Coming Soon)
  if (viewMode === 'financial') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 p-6">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => setViewMode('dashboard')}
            className="flex items-center gap-2 text-foreground/70 hover:text-white transition-colors mb-6"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            Back to Dashboard
          </button>
          <div className="text-center py-20">
            <DollarSign className="w-16 h-16 mx-auto text-emerald-400 mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Financial Model Blueprint</h2>
            <p className="text-foreground/70 mb-6">Revenue projections, valuations, and financial scenarios</p>
            <Badge variant="outline" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
              Coming Soon - Inherits from Genesis Master
            </Badge>
          </div>
        </div>
      </div>
    );
  }

  // QMS Process Log View
  if (viewMode === 'process_log') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 p-6">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => setViewMode('dashboard')}
            className="flex items-center gap-2 text-foreground/70 hover:text-white transition-colors mb-6"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            Back to Dashboard
          </button>
          <QMSProcessLog />
        </div>
      </div>
    );
  }

  // Blueprints Dashboard View
  if (viewMode === 'blueprints') {
    const selectedProject = savedProjects[0]; // For now, use first project
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => setViewMode('dashboard')}
            className="flex items-center gap-2 text-foreground/70 hover:text-white transition-colors mb-6"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            Back to Dashboard
          </button>

          <BlueprintTemplatesDashboard
            projectId={selectedProject?.id || 'new-project'}
            projectName={selectedProject?.name || 'New Project'}
            currentPhase={selectedProject?.currentPhaseId || 1}
            onSelectTemplate={(template) => {
              console.log('Selected template:', template);
              // Auto-generate blueprint for project
              const newBlueprint: ProjectBlueprint = {
                templateId: template.id,
                templateName: template.name,
                phase: template.phase,
                status: 'draft',
                completedSections: 0,
                totalSections: template.sections.length
              };
              // Update project with new blueprint
              setSavedProjects(prev => prev.map(p => 
                p.id === selectedProject?.id 
                  ? { ...p, blueprints: [...(p.blueprints || []), newBlueprint] }
                  : p
              ));
            }}
            onCreateBlueprint={(templateId, projectId) => {
              console.log('Creating blueprint from template:', templateId, 'for project:', projectId);
            }}
          />
        </div>
      </div>
    );
  }

  // Value Chain Detail View
  if (viewMode === 'value_chain') {
    const selectedProject = savedProjects[0]; // For now, use first project
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => setViewMode('dashboard')}
            className="flex items-center gap-2 text-foreground/70 hover:text-white transition-colors mb-6"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            Back to Dashboard
          </button>

          <ValueChainProgress
            projectName={selectedProject?.name || 'Project'}
            currentPhaseId={selectedProject?.currentPhaseId || 1}
            phaseProgress={selectedProject?.phaseProgress || []}
            onPhaseClick={(phase) => {
              console.log('Phase clicked:', phase);
            }}
            onStartPhase={(phaseId) => {
              console.log('Starting phase:', phaseId);
            }}
            onRequestReview={(phaseId) => {
              console.log('Requesting review for phase:', phaseId);
            }}
          />
        </div>
      </div>
    );
  }

  // Legacy Project Genesis View
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800">
      {/* Back Button */}
      <div className="p-4">
        <button
          onClick={() => setViewMode('dashboard')}
          className="flex items-center gap-2 text-foreground/70 hover:text-white transition-colors"
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
          Back to Dashboard
        </button>
      </div>
      
      <div className="p-6 max-w-5xl mx-auto">
        <ProjectGenesis />
      </div>
    </div>
  );
}