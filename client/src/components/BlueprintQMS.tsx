import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  GitBranch, RefreshCw, AlertTriangle, Check, ChevronRight,
  FileText, Presentation, Share2, DollarSign, Megaphone, Settings,
  ArrowRight, Clock, User, Brain, Sparkles, Eye, Edit3
} from 'lucide-react';
import { GenesisBlueprint, LinkedBlueprint } from '@/data/genesisBlueprint';

interface BlueprintChange {
  id: string;
  field: string;
  oldValue: any;
  newValue: any;
  timestamp: Date;
  changedBy: 'user' | 'sme' | 'digital_twin';
  smeId?: string;
}

interface CascadeImpact {
  blueprintId: string;
  blueprintType: LinkedBlueprint['type'];
  affectedFields: string[];
  severity: 'low' | 'medium' | 'high';
  autoUpdateable: boolean;
  requiresReview: boolean;
}

interface BlueprintQMSProps {
  genesisBlueprint: Partial<GenesisBlueprint>;
  pendingChanges: BlueprintChange[];
  onApplyChanges: (changes: BlueprintChange[], cascadeTargets: string[]) => void;
  onRejectChanges: (changeIds: string[]) => void;
  onViewBlueprint: (blueprintId: string) => void;
}

export function BlueprintQMS({
  genesisBlueprint,
  pendingChanges,
  onApplyChanges,
  onRejectChanges,
  onViewBlueprint
}: BlueprintQMSProps) {
  const [selectedChanges, setSelectedChanges] = useState<string[]>([]);
  const [cascadeImpacts, setCascadeImpacts] = useState<CascadeImpact[]>([]);
  const [showImpactAnalysis, setShowImpactAnalysis] = useState(false);

  const linkedBlueprints = genesisBlueprint.linkedBlueprints || [];

  // Calculate cascade impacts when changes are selected
  useEffect(() => {
    if (selectedChanges.length > 0) {
      const impacts: CascadeImpact[] = [];
      
      selectedChanges.forEach(changeId => {
        const change = pendingChanges.find(c => c.id === changeId);
        if (!change) return;

        linkedBlueprints.forEach(blueprint => {
          // Check if this blueprint inherits the changed field
          if (blueprint.inheritedFields.some(f => change.field.includes(f))) {
            const existingImpact = impacts.find(i => i.blueprintId === blueprint.id);
            
            if (existingImpact) {
              if (!existingImpact.affectedFields.includes(change.field)) {
                existingImpact.affectedFields.push(change.field);
              }
            } else {
              impacts.push({
                blueprintId: blueprint.id,
                blueprintType: blueprint.type,
                affectedFields: [change.field],
                severity: determineSeverity(change.field, blueprint.type),
                autoUpdateable: isAutoUpdateable(change.field),
                requiresReview: requiresReview(change.field, blueprint.type)
              });
            }
          }
        });
      });

      setCascadeImpacts(impacts);
    } else {
      setCascadeImpacts([]);
    }
  }, [selectedChanges, pendingChanges, linkedBlueprints]);

  const determineSeverity = (field: string, blueprintType: string): CascadeImpact['severity'] => {
    // High severity fields
    if (['valueProposition', 'objectives', 'targetAudience'].some(f => field.includes(f))) {
      return 'high';
    }
    // Medium severity
    if (['businessInfo', 'revenueModel', 'keywords'].some(f => field.includes(f))) {
      return 'medium';
    }
    return 'low';
  };

  const isAutoUpdateable = (field: string): boolean => {
    // Simple text fields can be auto-updated
    return ['companyName', 'industry', 'description'].some(f => field.includes(f));
  };

  const requiresReview = (field: string, blueprintType: string): boolean => {
    // Strategic fields always require review
    if (['valueProposition', 'objectives', 'strategy'].some(f => field.includes(f))) {
      return true;
    }
    // Financial changes require review for financial blueprints
    if (blueprintType === 'financial_model' && field.includes('revenue')) {
      return true;
    }
    return false;
  };

  const getBlueprintIcon = (type: LinkedBlueprint['type']) => {
    switch (type) {
      case 'presentation': return <Presentation className="w-4 h-4" />;
      case 'social_media': return <Share2 className="w-4 h-4" />;
      case 'financial_model': return <DollarSign className="w-4 h-4" />;
      case 'marketing': return <Megaphone className="w-4 h-4" />;
      case 'operations': return <Settings className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getBlueprintLabel = (type: LinkedBlueprint['type']) => {
    switch (type) {
      case 'presentation': return 'Presentation Blueprint';
      case 'social_media': return 'Social Media Blueprint';
      case 'financial_model': return 'Financial Model Blueprint';
      case 'marketing': return 'Marketing Blueprint';
      case 'operations': return 'Operations Blueprint';
      default: return 'Blueprint';
    }
  };

  const getStatusColor = (status: LinkedBlueprint['status']) => {
    switch (status) {
      case 'completed': return 'text-green-400 border-green-500/30 bg-green-500/10';
      case 'in_progress': return 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10';
      case 'needs_update': return 'text-orange-400 border-orange-500/30 bg-orange-500/10';
      default: return 'text-foreground/70 border-white/20 bg-white/5';
    }
  };

  const toggleChangeSelection = (changeId: string) => {
    setSelectedChanges(prev => 
      prev.includes(changeId)
        ? prev.filter(id => id !== changeId)
        : [...prev, changeId]
    );
  };

  const handleApplyChanges = () => {
    const cascadeTargets = cascadeImpacts
      .filter(i => i.autoUpdateable || !i.requiresReview)
      .map(i => i.blueprintId);
    
    onApplyChanges(
      pendingChanges.filter(c => selectedChanges.includes(c.id)),
      cascadeTargets
    );
    setSelectedChanges([]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-500/20 to-fuchsia-500/20 flex items-center justify-center">
            <GitBranch className="w-5 h-5 text-fuchsia-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Quality Management System</h2>
            <p className="text-xs text-foreground/70">Blueprint interconnections & cascading updates</p>
          </div>
        </div>
        {pendingChanges.length > 0 && (
          <Badge className="bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30">
            {pendingChanges.length} pending changes
          </Badge>
        )}
      </div>

      {/* Blueprint Network Visualization */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
          <Brain className="w-4 h-4 text-cyan-400" />
          Blueprint Network
        </h3>

        <div className="relative">
          {/* Genesis Blueprint (Center) */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className={`w-32 h-32 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-fuchsia-500/20 border-2 ${
                genesisBlueprint.status === 'approved' 
                  ? 'border-green-500/50' 
                  : 'border-fuchsia-500/50'
              } flex flex-col items-center justify-center`}>
                <Brain className="w-8 h-8 text-fuchsia-400 mb-2" />
                <p className="text-xs font-medium text-white">Genesis Blueprint</p>
                <Badge 
                  variant="outline" 
                  className={`text-[10px] mt-1 ${
                    genesisBlueprint.status === 'approved'
                      ? 'border-green-500/30 text-green-400'
                      : genesisBlueprint.status === 'in_review'
                      ? 'border-yellow-500/30 text-yellow-400'
                      : 'border-white/20 text-foreground/70'
                  }`}
                >
                  {genesisBlueprint.status || 'Draft'}
                </Badge>
              </div>
              
              {/* Connection Lines */}
              <div className="absolute top-full left-1/2 w-px h-8 bg-gradient-to-b from-fuchsia-500/50 to-transparent" />
            </div>
          </div>

          {/* Sub-Blueprints */}
          <div className="grid grid-cols-3 gap-4">
            {linkedBlueprints.map((blueprint, index) => {
              const impact = cascadeImpacts.find(i => i.blueprintId === blueprint.id);
              const hasImpact = !!impact;

              return (
                <div 
                  key={blueprint.id}
                  className={`relative p-4 rounded-xl border transition-all cursor-pointer hover:border-fuchsia-500/50 ${
                    hasImpact 
                      ? 'bg-orange-500/10 border-orange-500/30' 
                      : 'bg-white/5 border-white/10'
                  }`}
                  onClick={() => onViewBlueprint(blueprint.id)}
                >
                  {/* Connection Line */}
                  <div className="absolute -top-8 left-1/2 w-px h-8 bg-gradient-to-b from-transparent to-white/20" />

                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      hasImpact ? 'bg-orange-500/20' : 'bg-white/10'
                    }`}>
                      {getBlueprintIcon(blueprint.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-white truncate">
                        {getBlueprintLabel(blueprint.type)}
                      </p>
                    </div>
                  </div>

                  <Badge 
                    variant="outline" 
                    className={`text-[10px] ${getStatusColor(blueprint.status)}`}
                  >
                    {blueprint.status?.replace('_', ' ') || 'Not Started'}
                  </Badge>

                  {/* Impact Indicator */}
                  {hasImpact && (
                    <div className="mt-2 pt-2 border-t border-orange-500/20">
                      <div className="flex items-center gap-1 text-[10px] text-orange-400">
                        <AlertTriangle className="w-3 h-3" />
                        {impact.affectedFields.length} field(s) affected
                      </div>
                    </div>
                  )}

                  {/* Inherited Fields */}
                  <div className="mt-2 flex flex-wrap gap-1">
                    {blueprint.inheritedFields.slice(0, 3).map(field => (
                      <span 
                        key={field}
                        className={`text-[9px] px-1.5 py-0.5 rounded ${
                          impact?.affectedFields.includes(field)
                            ? 'bg-orange-500/20 text-orange-300'
                            : 'bg-white/10 text-foreground/70'
                        }`}
                      >
                        {field}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Pending Changes */}
      {pendingChanges.length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-yellow-400" />
            Pending Changes
          </h3>

          <div className="space-y-3">
            {pendingChanges.map(change => (
              <div 
                key={change.id}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  selectedChanges.includes(change.id)
                    ? 'bg-fuchsia-500/10 border-fuchsia-500/30'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
                onClick={() => toggleChangeSelection(change.id)}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 ${
                    selectedChanges.includes(change.id)
                      ? 'bg-fuchsia-500 border-fuchsia-500'
                      : 'border-white/30'
                  }`}>
                    {selectedChanges.includes(change.id) && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-white">{change.field}</p>
                      <Badge variant="outline" className="text-[10px] border-white/20 text-foreground/70">
                        {change.changedBy === 'user' && <User className="w-2 h-2 mr-1" />}
                        {change.changedBy === 'sme' && <Sparkles className="w-2 h-2 mr-1" />}
                        {change.changedBy === 'digital_twin' && <Brain className="w-2 h-2 mr-1" />}
                        {change.changedBy}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-red-400 line-through truncate max-w-[150px]">
                        {String(change.oldValue).substring(0, 30)}...
                      </span>
                      <ArrowRight className="w-3 h-3 text-foreground/60 flex-shrink-0" />
                      <span className="text-green-400 truncate max-w-[150px]">
                        {String(change.newValue).substring(0, 30)}...
                      </span>
                    </div>

                    <p className="text-[10px] text-foreground/60 mt-1 flex items-center gap-1">
                      <Clock className="w-2 h-2" />
                      {new Date(change.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Impact Analysis */}
          {selectedChanges.length > 0 && cascadeImpacts.length > 0 && (
            <div className="mt-4 p-4 bg-orange-500/10 rounded-xl border border-orange-500/20">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-orange-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Cascade Impact Analysis
                </h4>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowImpactAnalysis(!showImpactAnalysis)}
                  className="h-6 text-xs text-orange-300 hover:text-orange-200"
                >
                  {showImpactAnalysis ? 'Hide Details' : 'Show Details'}
                </Button>
              </div>

              <p className="text-xs text-orange-200/70 mb-3">
                These changes will affect {cascadeImpacts.length} downstream blueprint(s)
              </p>

              {showImpactAnalysis && (
                <div className="space-y-2">
                  {cascadeImpacts.map(impact => (
                    <div 
                      key={impact.blueprintId}
                      className="flex items-center justify-between p-2 bg-white/5 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        {getBlueprintIcon(impact.blueprintType)}
                        <span className="text-xs text-white">
                          {getBlueprintLabel(impact.blueprintType)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className={`text-[10px] ${
                            impact.severity === 'high'
                              ? 'border-red-500/30 text-red-400'
                              : impact.severity === 'medium'
                              ? 'border-yellow-500/30 text-yellow-400'
                              : 'border-green-500/30 text-green-400'
                          }`}
                        >
                          {impact.severity} impact
                        </Badge>
                        {impact.requiresReview && (
                          <Badge variant="outline" className="text-[10px] border-fuchsia-500/30 text-fuchsia-400">
                            <Eye className="w-2 h-2 mr-1" />
                            Review needed
                          </Badge>
                        )}
                        {impact.autoUpdateable && (
                          <Badge variant="outline" className="text-[10px] border-green-500/30 text-green-400">
                            <RefreshCw className="w-2 h-2 mr-1" />
                            Auto-update
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          {selectedChanges.length > 0 && (
            <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-white/10">
              <Button
                variant="outline"
                onClick={() => onRejectChanges(selectedChanges)}
                className="border-red-500/30 text-red-400 hover:bg-red-500/10"
              >
                Reject Selected
              </Button>
              <Button
                onClick={handleApplyChanges}
                className="bg-gradient-to-r from-cyan-500 to-fuchsia-500 hover:opacity-90"
              >
                Apply & Cascade ({selectedChanges.length})
              </Button>
            </div>
          )}
        </div>
      )}

      {/* No Pending Changes */}
      {pendingChanges.length === 0 && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
          <Check className="w-12 h-12 mx-auto text-green-400 mb-3" />
          <p className="text-white font-medium">All blueprints are in sync</p>
          <p className="text-foreground/70 text-sm mt-1">
            No pending changes to review
          </p>
        </div>
      )}
    </div>
  );
}
