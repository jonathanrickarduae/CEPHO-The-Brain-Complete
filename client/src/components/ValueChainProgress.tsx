import { useState } from 'react';
import { 
  Check, ChevronRight, Lock, AlertTriangle, 
  Clock, Users, FileText, Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  valueChainPhases, 
  qualityGateLevels,
  type ValueChainPhase,
  type ProjectPhaseProgress,
  type ProjectPhaseStatus
} from '@/data/valueChain';
import { panelTypes, type PanelType } from '@/data/smePanels';

interface ValueChainProgressProps {
  projectName: string;
  currentPhaseId: number;
  phaseProgress: ProjectPhaseProgress[];
  onPhaseClick?: (phase: ValueChainPhase) => void;
  onStartPhase?: (phaseId: number) => void;
  onRequestReview?: (phaseId: number) => void;
}

export function ValueChainProgress({
  projectName,
  currentPhaseId,
  phaseProgress,
  onPhaseClick,
  onStartPhase,
  onRequestReview
}: ValueChainProgressProps) {
  const [expandedPhase, setExpandedPhase] = useState<number | null>(currentPhaseId);

  const getPhaseStatus = (phaseId: number): ProjectPhaseStatus => {
    const progress = phaseProgress.find(p => p.phaseId === phaseId);
    return progress?.status || 'not_started';
  };

  const getPhaseCompletedChecks = (phaseId: number): string[] => {
    const progress = phaseProgress.find(p => p.phaseId === phaseId);
    return progress?.completedChecks || [];
  };

  const getStatusBadge = (status: ProjectPhaseStatus) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Approved</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">In Progress</Badge>;
      case 'pending_review':
        return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Pending Review</Badge>;
      case 'blocked':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Blocked</Badge>;
      default:
        return <Badge className="bg-gray-500/20 text-foreground/70 border-gray-500/30">Not Started</Badge>;
    }
  };

  const getStatusIcon = (status: ProjectPhaseStatus) => {
    switch (status) {
      case 'approved':
        return <Check className="w-5 h-5 text-emerald-400" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-blue-400 animate-pulse" />;
      case 'pending_review':
        return <Shield className="w-5 h-5 text-amber-400" />;
      case 'blocked':
        return <AlertTriangle className="w-5 h-5 text-red-400" />;
      default:
        return <Lock className="w-5 h-5 text-foreground/60" />;
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-white/10 bg-gradient-to-r from-cyan-500/10 to-fuchsia-500/10">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-cyan-400" />
          Value Chain Progress
        </h2>
        <p className="text-sm text-foreground/70 mt-1">{projectName}</p>
      </div>

      {/* Phase Timeline */}
      <div className="p-4">
        <div className="relative">
          {/* Connection Line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-white/10" />

          {/* Phases */}
          <div className="space-y-2">
            {valueChainPhases.map((phase, index) => {
              const status = getPhaseStatus(phase.id);
              const completedChecks = getPhaseCompletedChecks(phase.id);
              const isExpanded = expandedPhase === phase.id;
              const isCurrent = phase.id === currentPhaseId;
              const isLocked = status === 'not_started' && phase.id > currentPhaseId;
              const checkProgress = phase.qualityGateChecks.length > 0 
                ? Math.round((completedChecks.length / phase.qualityGateChecks.length) * 100)
                : 0;

              return (
                <div key={phase.id} className="relative">
                  {/* Phase Header */}
                  <div
                    className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all ${
                      isCurrent 
                        ? `${phase.bgColor} border ${phase.borderColor}` 
                        : isLocked 
                          ? 'bg-white/5 opacity-50' 
                          : 'bg-white/5 hover:bg-white/10'
                    }`}
                    onClick={() => {
                      setExpandedPhase(isExpanded ? null : phase.id);
                      if (onPhaseClick && !isLocked) onPhaseClick(phase);
                    }}
                  >
                    {/* Status Icon */}
                    <div className={`relative z-10 w-12 h-12 rounded-xl flex items-center justify-center ${
                      status === 'approved' 
                        ? 'bg-emerald-500/20' 
                        : status === 'in_progress'
                          ? phase.bgColor
                          : 'bg-white/10'
                    }`}>
                      {status === 'approved' ? (
                        <Check className="w-6 h-6 text-emerald-400" />
                      ) : (
                        <span className="text-2xl">{phase.icon}</span>
                      )}
                    </div>

                    {/* Phase Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-medium ${phase.color}`}>Phase {phase.id}</span>
                        {getStatusBadge(status)}
                      </div>
                      <h3 className="font-semibold text-white">{phase.name}</h3>
                      <p className="text-sm text-foreground/70 truncate">{phase.description}</p>
                    </div>

                    {/* Progress */}
                    {(status === 'in_progress' || status === 'pending_review' || status === 'blocked') && (
                      <div className="text-right">
                        <div className="text-sm font-medium text-white mb-1">{checkProgress}%</div>
                        <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-fuchsia-500"
                            style={{ width: `${checkProgress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <ChevronRight className={`w-5 h-5 text-foreground/70 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && !isLocked && (
                    <div className="mt-2 ml-16 p-4 bg-white/5 rounded-xl border border-white/10">
                      {/* Objectives */}
                      <div className="mb-4">
                        <h4 className="text-xs font-semibold text-foreground/70 uppercase tracking-wider mb-2">Objectives</h4>
                        <ul className="space-y-1">
                          {phase.objectives.map((obj, i) => (
                            <li key={i} className="text-sm text-foreground/80 flex items-start gap-2">
                              <span className={`w-1.5 h-1.5 rounded-full ${phase.bgColor} mt-1.5 shrink-0`} />
                              {obj}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Quality Gate Checks */}
                      <div className="mb-4">
                        <h4 className="text-xs font-semibold text-foreground/70 uppercase tracking-wider mb-2">Quality Gate Checks</h4>
                        <div className="space-y-2">
                          {phase.qualityGateChecks.map((check, i) => {
                            const isComplete = completedChecks.includes(check);
                            return (
                              <div 
                                key={i}
                                className={`flex items-center gap-2 p-2 rounded-lg ${
                                  isComplete ? 'bg-emerald-500/10' : 'bg-white/5'
                                }`}
                              >
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                                  isComplete ? 'bg-emerald-500' : 'border border-white/20'
                                }`}>
                                  {isComplete && <Check className="w-3 h-3 text-white" />}
                                </div>
                                <span className={`text-sm ${isComplete ? 'text-emerald-400' : 'text-foreground/70'}`}>
                                  {check}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Recommended Experts */}
                      <div className="mb-4">
                        <h4 className="text-xs font-semibold text-foreground/70 uppercase tracking-wider mb-2">Recommended Experts</h4>
                        <div className="flex flex-wrap gap-2">
                          {phase.recommendedExperts.map((expert, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {expert}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Duration */}
                      <div className="flex items-center gap-2 text-sm text-foreground/70 mb-4">
                        <Clock className="w-4 h-4" />
                        Estimated Duration: {phase.estimatedDuration}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        {status === 'not_started' && phase.id === currentPhaseId && (
                          <Button 
                            size="sm"
                            onClick={() => onStartPhase?.(phase.id)}
                            className="bg-gradient-to-r from-cyan-500 to-fuchsia-500"
                          >
                            Start Phase
                          </Button>
                        )}
                        {status === 'in_progress' && checkProgress === 100 && (
                          <Button 
                            size="sm"
                            onClick={() => onRequestReview?.(phase.id)}
                            className="bg-gradient-to-r from-amber-500 to-orange-500"
                          >
                            <Shield className="w-4 h-4 mr-2" />
                            Request Review
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quality Gate Levels Legend */}
      <div className="p-4 border-t border-white/10 bg-white/5">
        <h4 className="text-xs font-semibold text-foreground/70 uppercase tracking-wider mb-3">Quality Gate Levels</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {qualityGateLevels.map(level => (
            <div key={level.level} className="p-2 bg-white/5 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 flex items-center justify-center text-xs font-bold">
                  {level.level}
                </div>
                <span className="text-xs font-medium text-white">{level.name}</span>
              </div>
              <p className="text-[10px] text-foreground/70">{level.approver}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Compact version for sidebar/overview
export function ValueChainProgressCompact({
  currentPhaseId,
  phaseProgress
}: {
  currentPhaseId: number;
  phaseProgress: ProjectPhaseProgress[];
}) {
  const getPhaseStatus = (phaseId: number): ProjectPhaseStatus => {
    const progress = phaseProgress.find(p => p.phaseId === phaseId);
    return progress?.status || 'not_started';
  };

  return (
    <div className="flex items-center gap-1">
      {valueChainPhases.map((phase, index) => {
        const status = getPhaseStatus(phase.id);
        const isCurrent = phase.id === currentPhaseId;
        
        return (
          <div key={phase.id} className="flex items-center">
            <div 
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
                status === 'approved' 
                  ? 'bg-emerald-500/20 text-emerald-400' 
                  : isCurrent
                    ? `${phase.bgColor} ${phase.color}`
                    : 'bg-white/10 text-foreground/60'
              }`}
              title={phase.name}
            >
              {status === 'approved' ? <Check className="w-4 h-4" /> : phase.icon}
            </div>
            {index < valueChainPhases.length - 1 && (
              <div className={`w-4 h-0.5 ${
                status === 'approved' ? 'bg-emerald-500/50' : 'bg-white/10'
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
