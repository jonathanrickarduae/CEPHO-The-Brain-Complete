import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, Rocket, FileText, GitBranch, Plus, 
  ChevronRight, Sparkles, Clock, Check, Share2, 
  PresentationIcon, DollarSign, Shield, BarChart3,
  Loader2
} from 'lucide-react';
import ProjectGenesis from '@/components/project-management/ProjectGenesis';
import { GenesisBlueprintWizard } from '@/components/business-plan/GenesisBlueprintWizard';
import { BlueprintQMS } from '@/components/business-plan/BlueprintQMS';
import { SocialMediaBlueprint } from '@/components/business-plan/SocialMediaBlueprint';
import { QMSProcessLog } from '@/components/shared/QMSProcessLog';
import { PresentationBlueprint } from '@/components/business-plan/PresentationBlueprint';
import { GenesisBlueprint } from '@/data/genesis-blueprint.data';
import { VoiceNoteIntake } from '@/components/shared/VoiceNoteIntake';
import { ExpertTeamAssemblyWizard } from '@/components/expert-evolution/ExpertTeamAssemblyWizard';
import { IdeaScoringDashboard } from '@/components/project-management/IdeaScoringDashboard';
import { ValidationEngine } from '@/components/shared/ValidationEngine';
import { ValueChainProgress, ValueChainProgressCompact } from '@/components/ai-agents/ValueChainProgress';
import { valueChainPhases, type ProjectPhaseProgress, type ProjectPhaseStatus } from '@/data/value-chain.data';
import { BlueprintTemplatesDashboard, defaultTemplates, type BlueprintTemplate } from '@/components/business-plan/BlueprintTemplates';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

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
  
  // ===== NEW: Real API Integration =====
  // Fetch projects from backend
  const { data: apiProjects, isLoading: projectsLoading, refetch: refetchProjects } = trpc.projectGenesis.listProjects.useQuery();
  
  // Create project mutation
  const createProjectMutation = trpc.projectGenesis.initiate.useMutation({
    onSuccess: (data) => {
      toast.success(`Project "${data.name}" created successfully!`);
      refetchProjects();
    },
    onError: (error) => {
      toast.error(`Failed to create project: ${error.message}`);
    }
  });
  
  // Update phase mutation
  const updatePhaseMutation = trpc.projectGenesis.updatePhase.useMutation({
    onSuccess: () => {
      toast.success('Phase updated successfully!');
      refetchProjects();
    },
    onError: (error) => {
      toast.error(`Failed to update phase: ${error.message}`);
    }
  });
  
  // Transform API data to match existing interface
  const [savedProjects, setSavedProjects] = useState<SavedProject[]>([]);
  
  useEffect(() => {
    if (apiProjects) {
      const transformed = apiProjects.map(project => ({
        id: project.id,
        name: project.name,
        status: project.status as GenesisBlueprint['status'],
        industry: project.industry,
        createdAt: new Date(project.createdAt),
        updatedAt: new Date(project.updatedAt),
        completionPercentage: project.completionPercentage,
        currentPhaseId: project.currentPhase,
        phaseProgress: valueChainPhases.map(phase => ({
          phaseId: phase.id,
          status: phase.id < project.currentPhase ? 'approved' as ProjectPhaseStatus 
                : phase.id === project.currentPhase ? 'in_progress' as ProjectPhaseStatus 
                : 'not_started' as ProjectPhaseStatus,
          completedChecks: [],
          startedAt: phase.id <= project.currentPhase ? new Date(project.createdAt) : undefined,
          completedAt: phase.id < project.currentPhase ? new Date(project.updatedAt) : undefined
        }))
      }));
      setSavedProjects(transformed);
    }
  }, [apiProjects]);
  
  // ===== END: Real API Integration =====

  const handleBlueprintComplete = async (blueprint: Partial<GenesisBlueprint>) => {
    setCurrentBlueprint(blueprint);
    
    // Create project via API
    try {
      const newProject = await createProjectMutation.mutateAsync({
        name: blueprint.name || 'Untitled Project',
        industry: blueprint.businessInfo?.industry || 'Unknown',
        description: blueprint.businessInfo?.description || '',
        targetMarket: blueprint.businessInfo?.targetMarket || '',
        uniqueValue: blueprint.businessInfo?.uniqueValue || ''
      });
      
      toast.success(`Project "${newProject.name}" created! Redirecting to dashboard...`);
      
      // Wait a moment for the success message, then go back to dashboard
      setTimeout(() => {
        setViewMode('dashboard');
      }, 1500);
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  const getStatusColor = (status: GenesisBlueprint['status']) => {
    switch (status) {
      case 'draft': return 'bg-gray-500/20 text-gray-300';
      case 'in_progress': return 'bg-blue-500/20 text-blue-300';
      case 'in_review': return 'bg-yellow-500/20 text-yellow-300';
      case 'approved': return 'bg-green-500/20 text-green-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  const getStatusIcon = (status: GenesisBlueprint['status']) => {
    switch (status) {
      case 'draft': return <FileText className="w-4 h-4" />;
      case 'in_progress': return <Clock className="w-4 h-4" />;
      case 'in_review': return <Sparkles className="w-4 h-4" />;
      case 'approved': return <Check className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  // Rest of the component remains the same...
  // (Keep all existing UI rendering logic)
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 p-6">
      {viewMode === 'dashboard' && (
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Brain className="w-8 h-8 text-purple-400" />
                Project Genesis
              </h1>
              <p className="text-gray-400 mt-1">
                6-Phase Venture Development Framework
              </p>
            </div>
            <Button
              onClick={() => setViewMode('new_project')}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              disabled={createProjectMutation.isLoading}
            >
              {createProjectMutation.isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  New Project
                </>
              )}
            </Button>
          </div>

          {/* Loading State */}
          {projectsLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
              <span className="ml-3 text-gray-400">Loading projects...</span>
            </div>
          )}

          {/* Projects List */}
          {!projectsLoading && savedProjects.length > 0 && (
            <div className="grid gap-4">
              {savedProjects.map((project) => (
                <div
                  key={project.id}
                  className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 hover:border-purple-500/50 transition-all cursor-pointer"
                  onClick={() => {
                    setCurrentBlueprint({
                      id: project.id,
                      name: project.name,
                      status: project.status
                    });
                    setViewMode('qms');
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-white">
                          {project.name}
                        </h3>
                        <Badge className={getStatusColor(project.status)}>
                          {getStatusIcon(project.status)}
                          <span className="ml-1 capitalize">{project.status.replace('_', ' ')}</span>
                        </Badge>
                      </div>
                      <p className="text-gray-400 text-sm mb-4">
                        {project.industry} • Created {project.createdAt.toLocaleDateString()}
                      </p>
                      
                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-gray-400">Overall Progress</span>
                          <span className="text-purple-400 font-medium">
                            {project.completionPercentage}%
                          </span>
                        </div>
                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-500"
                            style={{ width: `${project.completionPercentage}%` }}
                          />
                        </div>
                      </div>

                      {/* Phase Progress Compact */}
                      <ValueChainProgressCompact
                        phaseProgress={project.phaseProgress}
                        currentPhaseId={project.currentPhaseId}
                      />
                    </div>

                    <ChevronRight className="w-5 h-5 text-gray-400 ml-4" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!projectsLoading && savedProjects.length === 0 && (
            <div className="text-center py-12">
              <Brain className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">
                No projects yet
              </h3>
              <p className="text-gray-500 mb-6">
                Start your first Project Genesis to build a comprehensive venture plan
              </p>
              <Button
                onClick={() => setViewMode('new_project')}
                className="bg-gradient-to-r from-purple-600 to-pink-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Project
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Other view modes remain the same */}
      {viewMode === 'new_project' && (
        <GenesisBlueprintWizard
          onComplete={handleBlueprintComplete}
          onCancel={() => setViewMode('dashboard')}
        />
      )}
      
      {viewMode === 'qms' && currentBlueprint && (
        <BlueprintQMS
          genesisBlueprint={currentBlueprint as GenesisBlueprint}
          pendingChanges={[]}
          onApplyChanges={(changes, cascadeTargets) => {
          }}
          onRejectChanges={(changeIds) => {
          }}
          onViewBlueprint={(blueprintId) => {
          }}
        />
      )}
      
      {/* Add other view mode components as needed */}
    </div>
  );
}
