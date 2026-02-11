import { useState } from 'react';
import { 
  CheckCircle2, XCircle, Clock, AlertTriangle, ChevronRight, 
  MessageSquare, FileText, Users, Shield, ArrowRight,
  ThumbsUp, ThumbsDown, RotateCcw, Eye
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';

// Quality Gate Review Levels
export type ReviewLevel = 'automated' | 'expert' | 'strategic' | 'final';

export type GateStatus = 'pending' | 'in_review' | 'approved' | 'rejected' | 'needs_revision';

export interface QualityGateCheck {
  id: string;
  name: string;
  description: string;
  level: ReviewLevel;
  status: GateStatus;
  reviewer?: string;
  reviewedAt?: Date;
  comments?: string;
  score?: number;
}

export interface QualityGate {
  id: string;
  projectId: string;
  projectName: string;
  fromPhase: string;
  toPhase: string;
  status: GateStatus;
  createdAt: Date;
  updatedAt: Date;
  checks: QualityGateCheck[];
  requestedBy: string;
  approvedBy?: string;
  rejectedBy?: string;
  finalDecision?: 'approved' | 'rejected';
  auditTrail: AuditEntry[];
}

export interface AuditEntry {
  id: string;
  action: string;
  actor: string;
  timestamp: Date;
  details?: string;
}

// Review level configuration
const reviewLevelConfig: Record<ReviewLevel, { 
  label: string; 
  color: string; 
  icon: React.ReactNode;
  description: string;
}> = {
  automated: { 
    label: 'Automated Check', 
    color: 'text-blue-400 bg-blue-500/20 border-blue-500/30',
    icon: <Shield className="w-4 h-4" />,
    description: 'System-verified criteria and compliance checks'
  },
  expert: { 
    label: 'Expert Validation', 
    color: 'text-purple-400 bg-purple-500/20 border-purple-500/30',
    icon: <Users className="w-4 h-4" />,
    description: 'SME panel review and technical validation'
  },
  strategic: { 
    label: 'Strategic Review', 
    color: 'text-orange-400 bg-orange-500/20 border-orange-500/30',
    icon: <Eye className="w-4 h-4" />,
    description: 'Business alignment and strategic fit assessment'
  },
  final: { 
    label: 'Final Decision', 
    color: 'text-cyan-400 bg-cyan-500/20 border-cyan-500/30',
    icon: <CheckCircle2 className="w-4 h-4" />,
    description: 'Chief of Staff final approval'
  },
};

// Status configuration
const statusConfig: Record<GateStatus, { 
  label: string; 
  color: string; 
  icon: React.ReactNode;
}> = {
  pending: { 
    label: 'Pending', 
    color: 'text-foreground/70 bg-gray-500/20',
    icon: <Clock className="w-4 h-4" />
  },
  in_review: { 
    label: 'In Review', 
    color: 'text-yellow-400 bg-yellow-500/20',
    icon: <Eye className="w-4 h-4" />
  },
  approved: { 
    label: 'Approved', 
    color: 'text-green-400 bg-green-500/20',
    icon: <CheckCircle2 className="w-4 h-4" />
  },
  rejected: { 
    label: 'Rejected', 
    color: 'text-red-400 bg-red-500/20',
    icon: <XCircle className="w-4 h-4" />
  },
  needs_revision: { 
    label: 'Needs Revision', 
    color: 'text-orange-400 bg-orange-500/20',
    icon: <AlertTriangle className="w-4 h-4" />
  },
};

// Individual Check Card
interface CheckCardProps {
  check: QualityGateCheck;
  onApprove: (checkId: string, comments: string) => void;
  onReject: (checkId: string, comments: string) => void;
  onRequestRevision: (checkId: string, comments: string) => void;
  isReviewer: boolean;
}

function CheckCard({ check, onApprove, onReject, onRequestRevision, isReviewer }: CheckCardProps) {
  const [showActions, setShowActions] = useState(false);
  const [comments, setComments] = useState('');
  const levelConfig = reviewLevelConfig[check.level];
  const status = statusConfig[check.status];

  return (
    <div className={`p-4 rounded-xl border ${
      check.status === 'approved' ? 'border-green-500/30 bg-green-500/5' :
      check.status === 'rejected' ? 'border-red-500/30 bg-red-500/5' :
      'border-white/10 bg-white/5'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${levelConfig.color}`}>
            {levelConfig.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-white">{check.name}</h4>
              <Badge className={`${status.color} border-0 text-xs`}>
                {status.icon}
                <span className="ml-1">{status.label}</span>
              </Badge>
            </div>
            <p className="text-sm text-foreground/70 mt-1">{check.description}</p>
            <p className="text-xs text-foreground/60 mt-1">{levelConfig.description}</p>
            
            {check.reviewer && (
              <p className="text-xs text-foreground/60 mt-2">
                Reviewed by: {check.reviewer} • {check.reviewedAt?.toLocaleString('en-GB')}
              </p>
            )}
            {check.comments && (
              <div className="mt-2 p-2 bg-white/5 rounded-lg">
                <p className="text-sm text-foreground/80">{check.comments}</p>
              </div>
            )}
            {check.score !== undefined && (
              <div className="mt-2">
                <span className="text-xs text-foreground/60">Score: </span>
                <span className={`text-sm font-medium ${
                  check.score >= 80 ? 'text-green-400' :
                  check.score >= 60 ? 'text-yellow-400' :
                  'text-red-400'
                }`}>{check.score}%</span>
              </div>
            )}
          </div>
        </div>

        {isReviewer && check.status === 'pending' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowActions(!showActions)}
            className="text-foreground/70 hover:text-white"
          >
            <ChevronRight className={`w-4 h-4 transition-transform ${showActions ? 'rotate-90' : ''}`} />
          </Button>
        )}
      </div>

      {/* Review Actions */}
      {showActions && isReviewer && check.status === 'pending' && (
        <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
          <Textarea
            placeholder="Add review comments..."
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            className="bg-white/5 border-white/10 text-white placeholder:text-foreground/60"
            rows={2}
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => {
                onApprove(check.id, comments);
                setShowActions(false);
                setComments('');
              }}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              <ThumbsUp className="w-4 h-4 mr-1" />
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                onRequestRevision(check.id, comments);
                setShowActions(false);
                setComments('');
              }}
              className="border-orange-500/50 text-orange-400 hover:bg-orange-500/10"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Request Revision
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                onReject(check.id, comments);
                setShowActions(false);
                setComments('');
              }}
              className="border-red-500/50 text-red-400 hover:bg-red-500/10"
            >
              <ThumbsDown className="w-4 h-4 mr-1" />
              Reject
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Quality Gate Card
interface QualityGateCardProps {
  gate: QualityGate;
  onApproveCheck: (gateId: string, checkId: string, comments: string) => void;
  onRejectCheck: (gateId: string, checkId: string, comments: string) => void;
  onRequestRevision: (gateId: string, checkId: string, comments: string) => void;
  onFinalApprove: (gateId: string) => void;
  onFinalReject: (gateId: string) => void;
  isChiefOfStaff: boolean;
}

export function QualityGateCard({ 
  gate, 
  onApproveCheck, 
  onRejectCheck, 
  onRequestRevision,
  onFinalApprove,
  onFinalReject,
  isChiefOfStaff 
}: QualityGateCardProps) {
  const [expanded, setExpanded] = useState(true);
  
  const approvedCount = gate.checks.filter(c => c.status === 'approved').length;
  const totalCount = gate.checks.length;
  const allApproved = approvedCount === totalCount;
  const hasRejection = gate.checks.some(c => c.status === 'rejected');

  return (
    <div className="border border-white/10 rounded-xl overflow-hidden">
      {/* Header */}
      <div 
        className="p-4 bg-white/5 cursor-pointer hover:bg-white/10 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              gate.status === 'approved' ? 'bg-green-500/20' :
              gate.status === 'rejected' ? 'bg-red-500/20' :
              'bg-cyan-500/20'
            }`}>
              <FileText className={`w-5 h-5 ${
                gate.status === 'approved' ? 'text-green-400' :
                gate.status === 'rejected' ? 'text-red-400' :
                'text-cyan-400'
              }`} />
            </div>
            <div>
              <h3 className="font-medium text-white">{gate.projectName}</h3>
              <div className="flex items-center gap-2 text-sm text-foreground/70">
                <span>{gate.fromPhase}</span>
                <ArrowRight className="w-4 h-4" />
                <span className="text-cyan-400">{gate.toPhase}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm text-foreground/70">Progress</div>
              <div className="text-lg font-bold text-white">{approvedCount}/{totalCount}</div>
            </div>
            <Badge className={statusConfig[gate.status].color}>
              {statusConfig[gate.status].icon}
              <span className="ml-1">{statusConfig[gate.status].label}</span>
            </Badge>
            <ChevronRight className={`w-5 h-5 text-foreground/70 transition-transform ${expanded ? 'rotate-90' : ''}`} />
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-2 bg-white/10 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all ${
              hasRejection ? 'bg-red-500' :
              allApproved ? 'bg-green-500' :
              'bg-cyan-500'
            }`}
            style={{ width: `${(approvedCount / totalCount) * 100}%` }}
          />
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="p-4 space-y-4">
          {/* Review Levels */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {(['automated', 'expert', 'strategic', 'final'] as ReviewLevel[]).map(level => {
              const levelChecks = gate.checks.filter(c => c.level === level);
              const levelApproved = levelChecks.filter(c => c.status === 'approved').length;
              const config = reviewLevelConfig[level];
              
              return (
                <div key={level} className={`p-2 rounded-lg border ${config.color}`}>
                  <div className="flex items-center gap-1 text-xs">
                    {config.icon}
                    <span>{config.label}</span>
                  </div>
                  <div className="text-lg font-bold text-white mt-1">
                    {levelApproved}/{levelChecks.length}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Checks */}
          <div className="space-y-3">
            {gate.checks.map(check => (
              <CheckCard
                key={check.id}
                check={check}
                onApprove={(checkId, comments) => onApproveCheck(gate.id, checkId, comments)}
                onReject={(checkId, comments) => onRejectCheck(gate.id, checkId, comments)}
                onRequestRevision={(checkId, comments) => onRequestRevision(gate.id, checkId, comments)}
                isReviewer={isChiefOfStaff || check.level !== 'final'}
              />
            ))}
          </div>

          {/* Final Decision (Chief of Staff only) */}
          {isChiefOfStaff && allApproved && gate.status !== 'approved' && gate.status !== 'rejected' && (
            <div className="pt-4 border-t border-white/10">
              <h4 className="text-sm font-medium text-white mb-3">Final Decision</h4>
              <div className="flex gap-3">
                <Button
                  onClick={() => onFinalApprove(gate.id)}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:opacity-90"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Approve Phase Transition
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onFinalReject(gate.id)}
                  className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
              </div>
            </div>
          )}

          {/* Audit Trail */}
          {gate.auditTrail.length > 0 && (
            <div className="pt-4 border-t border-white/10">
              <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Audit Trail
              </h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {gate.auditTrail.map(entry => (
                  <div key={entry.id} className="flex items-start gap-2 text-sm">
                    <span className="text-foreground/60 text-xs whitespace-nowrap">
                      {entry.timestamp.toLocaleString('en-GB')}
                    </span>
                    <span className="text-foreground/70">
                      <span className="text-white">{entry.actor}</span> {entry.action}
                      {entry.details && <span className="text-foreground/60"> - {entry.details}</span>}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Quality Gate Approval Queue (Chief of Staff Dashboard)
interface ApprovalQueueProps {
  isChiefOfStaff?: boolean;
}

export function QualityGateApprovalQueue({ isChiefOfStaff = true }: ApprovalQueueProps) {
  // Notification mutations
  const notifyApproval = trpc.qualityGate.notifyApproval.useMutation();
  const notifyRejection = trpc.qualityGate.notifyRejection.useMutation();

  const [gates, setGates] = useState<QualityGate[]>([
    // Demo data
    {
      id: '1',
      projectId: 'boundless',
      projectName: 'Sample Project AI',
      fromPhase: 'Development',
      toPhase: 'Go-to-Market',
      status: 'in_review',
      createdAt: new Date(),
      updatedAt: new Date(),
      requestedBy: 'Project Lead',
      checks: [
        {
          id: 'c1',
          name: 'Technical Completeness',
          description: 'All development milestones achieved',
          level: 'automated',
          status: 'approved',
          reviewer: 'System',
          reviewedAt: new Date(),
          score: 95,
        },
        {
          id: 'c2',
          name: 'Code Quality Review',
          description: 'Code meets quality standards and best practices',
          level: 'expert',
          status: 'approved',
          reviewer: 'Tech Lead',
          reviewedAt: new Date(),
          comments: 'Code quality is excellent. All tests passing.',
          score: 92,
        },
        {
          id: 'c3',
          name: 'Market Readiness',
          description: 'Product ready for market launch',
          level: 'strategic',
          status: 'pending',
        },
        {
          id: 'c4',
          name: 'Final Approval',
          description: 'Chief of Staff sign-off for phase transition',
          level: 'final',
          status: 'pending',
        },
      ],
      auditTrail: [
        { id: 'a1', action: 'requested phase transition', actor: 'Project Lead', timestamp: new Date(Date.now() - 86400000) },
        { id: 'a2', action: 'approved Technical Completeness', actor: 'System', timestamp: new Date(Date.now() - 72000000) },
        { id: 'a3', action: 'approved Code Quality Review', actor: 'Tech Lead', timestamp: new Date(Date.now() - 36000000), details: 'All tests passing' },
      ],
    },
  ]);

  const handleApproveCheck = (gateId: string, checkId: string, comments: string) => {
    setGates(prev => prev.map(gate => {
      if (gate.id !== gateId) return gate;
      return {
        ...gate,
        checks: gate.checks.map(check => {
          if (check.id !== checkId) return check;
          return {
            ...check,
            status: 'approved' as GateStatus,
            reviewer: 'Chief of Staff',
            reviewedAt: new Date(),
            comments,
          };
        }),
        auditTrail: [
          ...gate.auditTrail,
          { 
            id: `a${Date.now()}`, 
            action: `approved ${gate.checks.find(c => c.id === checkId)?.name}`, 
            actor: 'Chief of Staff', 
            timestamp: new Date(),
            details: comments || undefined,
          },
        ],
      };
    }));
    toast.success('Check approved');
  };

  const handleRejectCheck = (gateId: string, checkId: string, comments: string) => {
    setGates(prev => prev.map(gate => {
      if (gate.id !== gateId) return gate;
      return {
        ...gate,
        status: 'rejected' as GateStatus,
        checks: gate.checks.map(check => {
          if (check.id !== checkId) return check;
          return {
            ...check,
            status: 'rejected' as GateStatus,
            reviewer: 'Chief of Staff',
            reviewedAt: new Date(),
            comments,
          };
        }),
        auditTrail: [
          ...gate.auditTrail,
          { 
            id: `a${Date.now()}`, 
            action: `rejected ${gate.checks.find(c => c.id === checkId)?.name}`, 
            actor: 'Chief of Staff', 
            timestamp: new Date(),
            details: comments || undefined,
          },
        ],
      };
    }));
    toast.error('Check rejected');
  };

  const handleRequestRevision = (gateId: string, checkId: string, comments: string) => {
    setGates(prev => prev.map(gate => {
      if (gate.id !== gateId) return gate;
      return {
        ...gate,
        checks: gate.checks.map(check => {
          if (check.id !== checkId) return check;
          return {
            ...check,
            status: 'needs_revision' as GateStatus,
            reviewer: 'Chief of Staff',
            reviewedAt: new Date(),
            comments,
          };
        }),
        auditTrail: [
          ...gate.auditTrail,
          { 
            id: `a${Date.now()}`, 
            action: `requested revision for ${gate.checks.find(c => c.id === checkId)?.name}`, 
            actor: 'Chief of Staff', 
            timestamp: new Date(),
            details: comments || undefined,
          },
        ],
      };
    }));
    toast.info('Revision requested');
  };

  const handleFinalApprove = (gateId: string) => {
    const gate = gates.find(g => g.id === gateId);
    setGates(prev => prev.map(g => {
      if (g.id !== gateId) return g;
      return {
        ...g,
        status: 'approved' as GateStatus,
        finalDecision: 'approved',
        approvedBy: 'Chief of Staff',
        auditTrail: [
          ...g.auditTrail,
          { 
            id: `a${Date.now()}`, 
            action: 'approved phase transition', 
            actor: 'Chief of Staff', 
            timestamp: new Date(),
          },
        ],
      };
    }));
    
    // Send notification
    if (gate) {
      notifyApproval.mutate({
        projectId: gate.projectId,
        projectName: gate.projectName,
        phase: gate.toPhase,
        approvedBy: 'Chief of Staff',
      });
    }
    toast.success('Phase transition approved!');
  };

  const handleFinalReject = (gateId: string) => {
    const gate = gates.find(g => g.id === gateId);
    setGates(prev => prev.map(g => {
      if (g.id !== gateId) return g;
      return {
        ...g,
        status: 'rejected' as GateStatus,
        finalDecision: 'rejected',
        rejectedBy: 'Chief of Staff',
        auditTrail: [
          ...g.auditTrail,
          { 
            id: `a${Date.now()}`, 
            action: 'rejected phase transition', 
            actor: 'Chief of Staff', 
            timestamp: new Date(),
          },
        ],
      };
    }));
    
    // Send notification
    if (gate) {
      notifyRejection.mutate({
        projectId: gate.projectId,
        projectName: gate.projectName,
        phase: gate.toPhase,
        rejectedBy: 'Chief of Staff',
        reason: 'Phase transition requirements not met',
      });
    }
    toast.error('Phase transition rejected');
  };

  const pendingCount = gates.filter(g => g.status === 'pending' || g.status === 'in_review').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Quality Gate Approvals</h2>
          <p className="text-sm text-foreground/70">Review and approve phase transitions</p>
        </div>
        {pendingCount > 0 && (
          <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
            {pendingCount} pending
          </Badge>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
          <div className="text-2xl font-bold text-white">{gates.length}</div>
          <div className="text-sm text-foreground/70">Total Gates</div>
        </div>
        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
          <div className="text-2xl font-bold text-yellow-400">{pendingCount}</div>
          <div className="text-sm text-foreground/70">Pending Review</div>
        </div>
        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
          <div className="text-2xl font-bold text-green-400">
            {gates.filter(g => g.status === 'approved').length}
          </div>
          <div className="text-sm text-foreground/70">Approved</div>
        </div>
        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
          <div className="text-2xl font-bold text-red-400">
            {gates.filter(g => g.status === 'rejected').length}
          </div>
          <div className="text-sm text-foreground/70">Rejected</div>
        </div>
      </div>

      {/* Gates */}
      <div className="space-y-4">
        {gates.map(gate => (
          <QualityGateCard
            key={gate.id}
            gate={gate}
            onApproveCheck={handleApproveCheck}
            onRejectCheck={handleRejectCheck}
            onRequestRevision={handleRequestRevision}
            onFinalApprove={handleFinalApprove}
            onFinalReject={handleFinalReject}
            isChiefOfStaff={isChiefOfStaff}
          />
        ))}
      </div>

      {gates.length === 0 && (
        <div className="text-center py-12 text-foreground/70">
          <CheckCircle2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No pending quality gates</p>
        </div>
      )}
    </div>
  );
}

export default QualityGateApprovalQueue;
