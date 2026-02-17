import { useState } from 'react';
import { 
  Brain, 
  TrendingUp, 
  Target, 
  Award, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Zap,
  BookOpen,
  MessageSquare,
  Shield,
  Eye,
  ChevronRight,
  Star,
  Activity
} from 'lucide-react';
import { MATURITY_MODEL, MaturityLevel } from '@/data/digital-twin-job-description.data';

interface DevelopmentMetrics {
  hoursLogged: number;
  decisionsValidated: number;
  accuracyScore: number;
  userTrustScore: number;
  escalationRate: number;
  learningVelocity: number;
  proactiveValueScore: number;
}

interface LearningEvent {
  id: string;
  type: 'active' | 'passive' | 'corrective' | 'expert';
  description: string;
  timestamp: Date;
  impact: 'high' | 'medium' | 'low';
}

export function DigitalTwinDevelopment() {
  const [activeTab, setActiveTab] = useState<'overview' | 'maturity' | 'learning' | 'audit'>('overview');
  
  // Current development state (would be fetched from database in production)
  const [currentLevel] = useState<number>(2);
  const [metrics] = useState<DevelopmentMetrics>({
    hoursLogged: 24,
    decisionsValidated: 87,
    accuracyScore: 78,
    userTrustScore: 65,
    escalationRate: 68,
    learningVelocity: 12,
    proactiveValueScore: 45
  });

  const [recentLearning] = useState<LearningEvent[]>([
    {
      id: '1',
      type: 'active',
      description: 'User provided feedback on presentation format preferences',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      impact: 'high'
    },
    {
      id: '2',
      type: 'corrective',
      description: 'Corrected assumption about financial reporting frequency',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      impact: 'high'
    },
    {
      id: '3',
      type: 'passive',
      description: 'Observed preference for bullet points over paragraphs in briefs',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      impact: 'medium'
    },
    {
      id: '4',
      type: 'expert',
      description: 'Learned market analysis framework from McKinsey Chief of Staff',
      timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000),
      impact: 'medium'
    }
  ]);

  const currentMaturity = MATURITY_MODEL[currentLevel - 1];
  const nextMaturity = MATURITY_MODEL[currentLevel] || null;

  // Calculate progress to next level
  const calculateProgress = () => {
    if (!nextMaturity) return 100;
    const criteria = nextMaturity.unlockCriteria;
    const progress = {
      hours: Math.min(100, (metrics.hoursLogged / criteria.hoursLogged) * 100),
      decisions: Math.min(100, (metrics.decisionsValidated / criteria.decisionsValidated) * 100),
      accuracy: Math.min(100, (metrics.accuracyScore / criteria.accuracyScore) * 100),
      trust: Math.min(100, (metrics.userTrustScore / criteria.userTrustScore) * 100)
    };
    return Math.round((progress.hours + progress.decisions + progress.accuracy + progress.trust) / 4);
  };

  const overallProgress = calculateProgress();

  const getLevelColor = (level: number) => {
    const colors = ['gray', 'blue', 'emerald', 'purple', 'amber'];
    return colors[level - 1] || 'gray';
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-green-400';
      case 'medium': return 'text-blue-400';
      case 'low': return 'text-foreground/70';
      default: return 'text-foreground/70';
    }
  };

  const getLearningTypeIcon = (type: string) => {
    switch (type) {
      case 'active': return <BookOpen className="w-4 h-4 text-purple-400" />;
      case 'passive': return <Eye className="w-4 h-4 text-blue-400" />;
      case 'corrective': return <AlertCircle className="w-4 h-4 text-amber-400" />;
      case 'expert': return <Brain className="w-4 h-4 text-emerald-400" />;
      default: return <Zap className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-[#1a1a2e] rounded-xl border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Chief of Staff Development</h2>
              <p className="text-sm text-foreground/70">Track growth from Infant to Autonomous</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 rounded-lg border border-purple-500/30">
            <Star className="w-5 h-5 text-purple-400" />
            <span className="text-purple-300 font-medium">Level {currentLevel}: {currentMaturity.name}</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2">
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'maturity', label: 'Maturity Model', icon: TrendingUp },
            { id: 'learning', label: 'Learning Log', icon: BookOpen },
            { id: 'audit', label: 'Weekly Audit', icon: Shield }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white/10 text-white'
                  : 'text-foreground/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Progress to Next Level */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-white">Progress to Level {currentLevel + 1}</h3>
                <span className="text-2xl font-bold text-purple-400">{overallProgress}%</span>
              </div>
              <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden mb-4">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
              {nextMaturity && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-sm text-foreground/70 mb-1">Hours Logged</div>
                    <div className="text-white font-medium">{metrics.hoursLogged} / {nextMaturity.unlockCriteria.hoursLogged}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-foreground/70 mb-1">Decisions Validated</div>
                    <div className="text-white font-medium">{metrics.decisionsValidated} / {nextMaturity.unlockCriteria.decisionsValidated}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-foreground/70 mb-1">Accuracy Score</div>
                    <div className="text-white font-medium">{metrics.accuracyScore}% / {nextMaturity.unlockCriteria.accuracyScore}%</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-foreground/70 mb-1">Trust Score</div>
                    <div className="text-white font-medium">{metrics.userTrustScore} / {nextMaturity.unlockCriteria.userTrustScore}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-foreground/70">Training Hours</span>
                </div>
                <div className="text-2xl font-bold text-white">{metrics.hoursLogged}h</div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-foreground/70">Accuracy</span>
                </div>
                <div className="text-2xl font-bold text-white">{metrics.accuracyScore}%</div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  <span className="text-sm text-foreground/70">Escalation Rate</span>
                </div>
                <div className="text-2xl font-bold text-white">{metrics.escalationRate}%</div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-foreground/70">Learning Velocity</span>
                </div>
                <div className="text-2xl font-bold text-white">+{metrics.learningVelocity}%</div>
              </div>
            </div>

            {/* Current Capabilities */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-medium text-white mb-4">Current Capabilities</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentMaturity.capabilities.map((capability, index) => (
                  <div key={index} className="flex items-center gap-2 text-foreground/80">
                    <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <span className="text-sm">{capability}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Training Focus */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-medium text-white mb-4">Current Training Focus</h3>
              <div className="space-y-3">
                {currentMaturity.trainingFocus.map((focus, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Target className="w-4 h-4 text-purple-400" />
                    <span className="text-foreground/80 text-sm">{focus}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'maturity' && (
          <div className="space-y-4">
            {MATURITY_MODEL.map((level, index) => {
              const isCurrentLevel = level.level === currentLevel;
              const isUnlocked = level.level <= currentLevel;
              const color = getLevelColor(level.level);
              
              return (
                <div 
                  key={level.level}
                  className={`bg-white/5 rounded-xl p-6 border transition-all ${
                    isCurrentLevel 
                      ? 'border-purple-500/50 ring-1 ring-purple-500/30' 
                      : isUnlocked 
                        ? 'border-white/20' 
                        : 'border-white/5 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        isUnlocked ? `bg-${color}-500/20` : 'bg-white/5'
                      }`}>
                        <span className={`text-lg font-bold ${isUnlocked ? `text-${color}-400` : 'text-foreground/60'}`}>
                          {level.level}
                        </span>
                      </div>
                      <div>
                        <h3 className={`text-lg font-medium ${isUnlocked ? 'text-white' : 'text-foreground/60'}`}>
                          {level.name}
                        </h3>
                        <p className="text-sm text-foreground/70">{level.description}</p>
                      </div>
                    </div>
                    {isCurrentLevel && (
                      <span className="px-3 py-1 bg-purple-500/20 text-purple-300 text-xs font-medium rounded-full">
                        Current Level
                      </span>
                    )}
                    {isUnlocked && !isCurrentLevel && (
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-foreground/70 mb-2">Capabilities</h4>
                      <ul className="space-y-1">
                        {level.capabilities.slice(0, 4).map((cap, i) => (
                          <li key={i} className="text-sm text-foreground/80 flex items-center gap-2">
                            <ChevronRight className="w-3 h-3 text-foreground/60" />
                            {cap}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-foreground/70 mb-2">Autonomy Level</h4>
                      <p className="text-sm text-foreground/80 mb-3">{level.autonomyLevel}</p>
                      <h4 className="text-sm font-medium text-foreground/70 mb-2">Escalation</h4>
                      <p className="text-sm text-foreground/80">{level.escalationThreshold}</p>
                    </div>
                  </div>

                  {!isUnlocked && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <h4 className="text-sm font-medium text-foreground/70 mb-2">Unlock Criteria</h4>
                      <div className="grid grid-cols-4 gap-4 text-center">
                        <div>
                          <div className="text-xs text-foreground/60">Hours</div>
                          <div className="text-sm text-foreground/70">{level.unlockCriteria.hoursLogged}h</div>
                        </div>
                        <div>
                          <div className="text-xs text-foreground/60">Decisions</div>
                          <div className="text-sm text-foreground/70">{level.unlockCriteria.decisionsValidated}</div>
                        </div>
                        <div>
                          <div className="text-xs text-foreground/60">Accuracy</div>
                          <div className="text-sm text-foreground/70">{level.unlockCriteria.accuracyScore}%</div>
                        </div>
                        <div>
                          <div className="text-xs text-foreground/60">Trust</div>
                          <div className="text-sm text-foreground/70">{level.unlockCriteria.userTrustScore}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'learning' && (
          <div className="space-y-6">
            {/* Learning Methods */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { type: 'active', label: 'Active Training', icon: BookOpen, color: 'purple', count: 12 },
                { type: 'passive', label: 'Passive Learning', icon: Eye, color: 'blue', count: 45 },
                { type: 'corrective', label: 'Corrections', icon: AlertCircle, color: 'amber', count: 8 },
                { type: 'expert', label: 'Expert Learning', icon: Brain, color: 'emerald', count: 22 }
              ].map(method => (
                <div key={method.type} className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <method.icon className={`w-4 h-4 text-${method.color}-400`} />
                    <span className="text-sm text-foreground/70">{method.label}</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{method.count}</div>
                </div>
              ))}
            </div>

            {/* Recent Learning Events */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-medium text-white mb-4">Recent Learning Events</h3>
              <div className="space-y-4">
                {recentLearning.map(event => (
                  <div key={event.id} className="flex items-start gap-4 p-4 bg-white/5 rounded-lg">
                    <div className="mt-1">
                      {getLearningTypeIcon(event.type)}
                    </div>
                    <div className="flex-1">
                      <p className="text-foreground/80 text-sm">{event.description}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs text-foreground/60">
                          {event.timestamp.toLocaleString()}
                        </span>
                        <span className={`text-xs ${getImpactColor(event.impact)}`}>
                          {event.impact.charAt(0).toUpperCase() + event.impact.slice(1)} Impact
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Add Training Session */}
            <button className="w-full py-4 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-xl text-purple-300 font-medium transition-all flex items-center justify-center gap-2">
              <BookOpen className="w-5 h-5" />
              Start Training Session
            </button>
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="space-y-6">
            {/* Next Audit */}
            <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl p-6 border border-purple-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-white mb-1">Next Weekly Audit</h3>
                  <p className="text-foreground/70">Sunday Evening (Automated)</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">5 days</div>
                  <div className="text-sm text-foreground/70">until next audit</div>
                </div>
              </div>
            </div>

            {/* Audit Scope */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-medium text-white mb-4">Audit Scope</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-purple-400 mb-3">Project Genesis</h4>
                  <ul className="space-y-2">
                    <li className="text-sm text-foreground/80 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-foreground/60" />
                      Review all active blueprints
                    </li>
                    <li className="text-sm text-foreground/80 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-foreground/60" />
                      Check document control compliance
                    </li>
                    <li className="text-sm text-foreground/80 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-foreground/60" />
                      Verify version control accuracy
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-blue-400 mb-3">AI Expert Team</h4>
                  <ul className="space-y-2">
                    <li className="text-sm text-foreground/80 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-foreground/60" />
                      Review expert performance metrics
                    </li>
                    <li className="text-sm text-foreground/80 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-foreground/60" />
                      Check for conflicting outputs
                    </li>
                    <li className="text-sm text-foreground/80 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-foreground/60" />
                      Validate QA effectiveness
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Previous Audit Summary */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-white">Previous Audit</h3>
                <span className="text-sm text-foreground/70">January 5, 2025</span>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center p-3 bg-green-500/10 rounded-lg">
                  <div className="text-2xl font-bold text-green-400">12</div>
                  <div className="text-xs text-foreground/70">Items Reviewed</div>
                </div>
                <div className="text-center p-3 bg-amber-500/10 rounded-lg">
                  <div className="text-2xl font-bold text-amber-400">3</div>
                  <div className="text-xs text-foreground/70">Issues Found</div>
                </div>
                <div className="text-center p-3 bg-purple-500/10 rounded-lg">
                  <div className="text-2xl font-bold text-purple-400">5</div>
                  <div className="text-xs text-foreground/70">Enhancements</div>
                </div>
              </div>
              <button className="w-full py-2 text-sm text-purple-400 hover:text-purple-300 transition-colors">
                View Full Audit Report →
              </button>
            </div>

            {/* Run Manual Audit */}
            <button className="w-full py-4 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-xl text-purple-300 font-medium transition-all flex items-center justify-center gap-2">
              <Shield className="w-5 h-5" />
              Run Manual Audit Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
