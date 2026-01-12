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

type ViewMode = 'dashboard' | 'new_project' | 'qms' | 'legacy' | 'social_media' | 'presentation' | 'financial' | 'process_log';

interface SavedProject {
  id: string;
  name: string;
  status: GenesisBlueprint['status'];
  industry: string;
  createdAt: Date;
  updatedAt: Date;
  completionPercentage: number;
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
      completionPercentage: 75
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
      completionPercentage: 100
    };
    
    setSavedProjects(prev => [newProject, ...prev]);
    setViewMode('qms');
  };

  const getStatusColor = (status: GenesisBlueprint['status']) => {
    switch (status) {
      case 'approved': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'in_review': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'needs_update': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default: return 'bg-white/10 text-gray-400 border-white/20';
    }
  };

  // Dashboard View
  if (viewMode === 'dashboard') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-cyan-500 to-fuchsia-500 flex items-center justify-center">
                <Rocket className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Project Genesis</h1>
                <p className="text-gray-400">Strategic blueprint creation & management</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setViewMode('qms')}
                className="border-white/20 text-gray-300 hover:bg-white/5"
              >
                <GitBranch className="w-4 h-4 mr-2" />
                Quality Management
              </Button>
              <Button
                onClick={() => setViewMode('new_project')}
                className="bg-gradient-to-r from-cyan-500 to-fuchsia-500 hover:opacity-90"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </Button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <button
              onClick={() => setViewMode('new_project')}
              className="p-6 bg-gradient-to-br from-cyan-500/10 to-fuchsia-500/10 border border-fuchsia-500/30 rounded-2xl text-left hover:border-fuchsia-500/50 transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-fuchsia-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Brain className="w-6 h-6 text-fuchsia-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">Genesis Blueprint</h3>
              <p className="text-sm text-gray-400">
                Intelligent wizard with SME collaboration and adaptive questioning
              </p>
            </button>

            <button
              onClick={() => setViewMode('legacy')}
              className="p-6 bg-white/5 border border-white/10 rounded-2xl text-left hover:border-white/20 transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">Classic Mode</h3>
              <p className="text-sm text-gray-400">
                Traditional project setup with deliverable selection
              </p>
            </button>

            <button
              onClick={() => setViewMode('process_log')}
              className="p-6 bg-white/5 border border-white/10 rounded-2xl text-left hover:border-white/20 transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Shield className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">QMS Process Log</h3>
              <p className="text-sm text-gray-400">
                Master document control, audit trail, and version management
              </p>
            </button>
          </div>

          {/* Sub-Blueprints */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <button
              onClick={() => setViewMode('social_media')}
              className="p-4 bg-gradient-to-br from-pink-500/10 to-purple-500/10 border border-pink-500/30 rounded-xl text-left hover:border-pink-500/50 transition-all group"
            >
              <Share2 className="w-6 h-6 text-pink-400 mb-2 group-hover:scale-110 transition-transform" />
              <h4 className="font-medium text-white text-sm">Social Media Blueprint</h4>
              <p className="text-xs text-gray-400 mt-1">Platform strategy & content</p>
            </button>

            <button
              onClick={() => setViewMode('presentation')}
              className="p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-xl text-left hover:border-blue-500/50 transition-all group"
            >
              <PresentationIcon className="w-6 h-6 text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
              <h4 className="font-medium text-white text-sm">Presentation Blueprint</h4>
              <p className="text-xs text-gray-400 mt-1">Investor decks & pitches</p>
            </button>

            <button
              onClick={() => setViewMode('financial')}
              className="p-4 bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-500/30 rounded-xl text-left hover:border-emerald-500/50 transition-all group"
            >
              <DollarSign className="w-6 h-6 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
              <h4 className="font-medium text-white text-sm">Financial Model Blueprint</h4>
              <p className="text-xs text-gray-400 mt-1">Projections & valuations</p>
            </button>

            <button
              onClick={() => setViewMode('qms')}
              className="p-4 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl text-left hover:border-amber-500/50 transition-all group"
            >
              <GitBranch className="w-6 h-6 text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
              <h4 className="font-medium text-white text-sm">Blueprint Network</h4>
              <p className="text-xs text-gray-400 mt-1">Cascading updates</p>
            </button>
          </div>

          {/* Recent Projects */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-400" />
                Recent Projects
              </h2>
              <Button variant="ghost" className="text-gray-400 hover:text-white">
                View All
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            {savedProjects.length > 0 ? (
              <div className="space-y-3">
                {savedProjects.map(project => (
                  <div 
                    key={project.id}
                    className="flex items-center gap-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
                    onClick={() => {
                      // Load project into QMS view
                      setViewMode('qms');
                    }}
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-cyan-500/20 to-fuchsia-500/20 flex items-center justify-center">
                      <Rocket className="w-6 h-6 text-fuchsia-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-white truncate">{project.name}</h3>
                        <Badge variant="outline" className={getStatusColor(project.status)}>
                          {project.status?.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span>{project.industry}</span>
                        <span>•</span>
                        <span>Updated {project.updatedAt.toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-white mb-1">
                        {project.completionPercentage}%
                      </div>
                      <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 rounded-full"
                          style={{ width: `${project.completionPercentage}%` }}
                        />
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-500" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Sparkles className="w-12 h-12 mx-auto text-gray-600 mb-4" />
                <p className="text-gray-400 mb-2">No projects yet</p>
                <p className="text-gray-500 text-sm mb-4">
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

  // New Project (Genesis Blueprint Wizard)
  if (viewMode === 'new_project') {
    return (
      <div className="relative">
        {/* Back Button */}
        <button
          onClick={() => setViewMode('dashboard')}
          className="absolute top-4 left-4 z-20 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
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
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
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
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
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
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
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
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            Back to Dashboard
          </button>
          <div className="text-center py-20">
            <DollarSign className="w-16 h-16 mx-auto text-emerald-400 mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Financial Model Blueprint</h2>
            <p className="text-gray-400 mb-6">Revenue projections, valuations, and financial scenarios</p>
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
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            Back to Dashboard
          </button>
          <QMSProcessLog />
        </div>
      </div>
    );
  }

  // Legacy View (Original ProjectGenesis)
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800">
      {/* Back Button */}
      <div className="p-4">
        <button
          onClick={() => setViewMode('dashboard')}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
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
