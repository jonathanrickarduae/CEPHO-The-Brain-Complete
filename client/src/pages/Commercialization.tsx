import { useState } from 'react';
import { 
  TrendingUp, TrendingDown, AlertTriangle, Shield, Target, 
  Users, Zap, Eye, FileText, Brain, Lightbulb, Scale,
  ChevronRight, RefreshCw, Plus, ExternalLink, Clock
} from 'lucide-react';
import { PageHeader } from '@/components/Breadcrumbs';

// Mock data - will be replaced with real API data
const mockCompetitors = [
  { id: 1, name: 'Superhuman', category: 'Email AI', threatLevel: 'high', score: 85, change: -2, features: ['AI Drafts', 'Keyboard-first', 'Social Insights'] },
  { id: 2, name: 'Motion', category: 'AI Scheduling', threatLevel: 'high', score: 82, change: 3, features: ['Auto-scheduling', 'Task Planner', 'Calendar AI'] },
  { id: 3, name: 'Personal AI', category: 'Chief of Staff', threatLevel: 'critical', score: 78, change: 5, features: ['Memory Bank', 'Training Studio', 'Voice Clone'] },
  { id: 4, name: 'Lindy', category: 'AI Agents', threatLevel: 'medium', score: 71, change: -1, features: ['Agent Builder', 'Autonomous Actions', 'Integrations'] },
  { id: 5, name: 'Granola', category: 'AI Notes', threatLevel: 'low', score: 65, change: 0, features: ['Meeting Notes', 'Human-AI Collab', 'Privacy-first'] },
];

const mockThreats = [
  { id: 1, type: 'threat', severity: 'critical', title: 'Personal AI launched voice cloning', description: 'Direct competition to Chief of Staff voice features', date: '2 days ago' },
  { id: 2, type: 'opportunity', severity: 'high', title: 'Motion lacks wellness tracking', description: 'Gap in market for productivity + wellness combination', date: '1 week ago' },
  { id: 3, type: 'threat', severity: 'medium', title: 'Superhuman expanding to calendar', description: 'Moving into adjacent market', date: '3 days ago' },
];

const mockRecommendations = [
  { id: 1, category: 'product', priority: 'critical', title: 'Accelerate voice clone feature', expert: 'Maxwell Patent', status: 'proposed' },
  { id: 2, category: 'regulatory', priority: 'high', title: 'File provisional patent for wellness algorithm', expert: 'Maxwell Patent', status: 'in_progress' },
  { id: 3, category: 'marketing', priority: 'medium', title: 'Position against Personal AI on privacy', expert: 'Brand Strategist', status: 'approved' },
];

const mockRegulations = [
  { id: 1, name: 'EU AI Act', region: 'EU', status: 'enacted', moatPotential: 'high', compliance: 'partial' },
  { id: 2, name: 'GDPR', region: 'EU', status: 'enforced', moatPotential: 'medium', compliance: 'compliant' },
  { id: 3, name: 'CCPA', region: 'US', status: 'enforced', moatPotential: 'low', compliance: 'compliant' },
];

export default function Commercialization() {
  const [activeTab, setActiveTab] = useState<'overview' | 'competitors' | 'threats' | 'strategy' | 'regulatory'>('overview');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const overallScore = 76;
  const scoreChange = -3;

  const runAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => setIsAnalyzing(false), 3000);
  };

  return (
    <div className="h-full flex flex-col p-4 md:p-6 overflow-auto">
      <PageHeader 
        title="Commercialization Intelligence" 
        subtitle="AI-powered competitive analysis and strategy"
      />

      {/* Value Score Hero */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-6 mb-6 border border-gray-700">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
                <div className="w-28 h-28 rounded-full bg-gray-900 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-white">{overallScore}%</div>
                    <div className="text-xs text-foreground/70">Market Value</div>
                  </div>
                </div>
              </div>
              <div className={`absolute -bottom-1 -right-1 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                scoreChange >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              }`}>
                {scoreChange >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {Math.abs(scoreChange)}%
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Cepho's Competitive Position</h2>
              <p className="text-foreground/70 mb-3">Based on feature parity, unique value, and market dynamics</p>
              <div className="flex gap-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-cyan-400">82%</div>
                  <div className="text-xs text-foreground/60">Feature Parity</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-400">71%</div>
                  <div className="text-xs text-foreground/60">Unique Value</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-400">68%</div>
                  <div className="text-xs text-foreground/60">Market Readiness</div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <button 
              onClick={runAnalysis}
              disabled={isAnalyzing}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-600 text-white rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
              {isAnalyzing ? 'Analyzing...' : 'Run Analysis'}
            </button>
            <div className="text-xs text-foreground/60 text-center">Last updated: 2 hours ago</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { id: 'overview', label: 'Overview', icon: Eye },
          { id: 'competitors', label: 'Competitors', icon: Users },
          { id: 'threats', label: 'Threats & Opportunities', icon: AlertTriangle },
          { id: 'strategy', label: 'Strategy', icon: Target },
          { id: 'regulatory', label: 'Regulatory Moat', icon: Shield },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                : 'bg-gray-800 text-foreground/70 hover:bg-gray-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Strategic Partners */}
          <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-xl p-6 border border-cyan-500/30">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-cyan-400" />
              Strategic Partners
            </h3>
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-4 bg-gray-900/50 rounded-xl p-4">
                <div className="w-16 h-16 rounded-xl bg-white flex items-center justify-center p-2">
                  <img 
                    src="/logos/cambridge-university.png" 
                    alt="University of Cambridge" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h4 className="font-semibold text-white">University of Cambridge</h4>
                  <p className="text-sm text-cyan-400">Research Partner</p>
                  <p className="text-xs text-foreground/70 mt-1">AI-human collaboration research</p>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-gray-900/50 rounded-xl p-4">
                <div className="w-16 h-16 rounded-xl bg-white flex items-center justify-center p-2">
                  <img 
                    src="/logos/oxford-university.png" 
                    alt="University of Oxford" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h4 className="font-semibold text-white">University of Oxford</h4>
                  <p className="text-sm text-purple-400">Strategic Partner</p>
                  <p className="text-xs text-foreground/70 mt-1">Ethical AI development</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Stats */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              Quick Stats
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-900 rounded-lg p-4">
                <div className="text-2xl font-bold text-white">{mockCompetitors.length}</div>
                <div className="text-sm text-foreground/70">Tracked Competitors</div>
              </div>
              <div className="bg-gray-900 rounded-lg p-4">
                <div className="text-2xl font-bold text-red-400">{mockThreats.filter(t => t.type === 'threat').length}</div>
                <div className="text-sm text-foreground/70">Active Threats</div>
              </div>
              <div className="bg-gray-900 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-400">{mockThreats.filter(t => t.type === 'opportunity').length}</div>
                <div className="text-sm text-foreground/70">Opportunities</div>
              </div>
              <div className="bg-gray-900 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-400">{mockRecommendations.length}</div>
                <div className="text-sm text-foreground/70">Pending Actions</div>
              </div>
            </div>
          </div>

          {/* Chief of Staff Tasks */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-400" />
              Chief of Staff Strategy Tasks
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-900 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-sm text-foreground/80">Daily competitor scan</span>
                </div>
                <span className="text-xs text-foreground/60">Running</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-900 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  <span className="text-sm text-foreground/80">Patent landscape analysis</span>
                </div>
                <span className="text-xs text-foreground/60">Scheduled 6pm</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-900 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-sm text-foreground/80">Feature gap assessment</span>
                </div>
                <span className="text-xs text-foreground/60">Weekly</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-900 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                  <span className="text-sm text-foreground/80">Regulatory update check</span>
                </div>
                <span className="text-xs text-foreground/60">Daily</span>
              </div>
            </div>
          </div>

          {/* Recent Threats */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              Recent Alerts
            </h3>
            <div className="space-y-3">
              {mockThreats.slice(0, 3).map((threat) => (
                <div key={threat.id} className="flex items-start gap-3 p-3 bg-gray-900 rounded-lg">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    threat.type === 'threat' ? 'bg-red-500' : 'bg-green-500'
                  }`}></div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white">{threat.title}</div>
                    <div className="text-xs text-foreground/60">{threat.date}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-foreground/60" />
                </div>
              ))}
            </div>
          </div>

          {/* AI Expert Panel */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-400" />
              Strategy AI Experts
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-900 rounded-lg">
                <span className="text-2xl">🔬</span>
                <div className="flex-1">
                  <div className="text-sm font-medium text-white">Maxwell Patent</div>
                  <div className="text-xs text-foreground/60">Patent Law & AI Innovation</div>
                </div>
                <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">Active</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-900 rounded-lg">
                <span className="text-2xl">📊</span>
                <div className="flex-1">
                  <div className="text-sm font-medium text-white">Marcus Macro</div>
                  <div className="text-xs text-foreground/60">Market Analysis</div>
                </div>
                <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">Active</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-900 rounded-lg">
                <span className="text-2xl">🎯</span>
                <div className="flex-1">
                  <div className="text-sm font-medium text-white">Strategic Advisor</div>
                  <div className="text-xs text-foreground/60">Business Strategy</div>
                </div>
                <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">Active</span>
              </div>
            </div>
          </div>
          </div>
        </div>
      )}

      {activeTab === 'competitors' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-white">Competitor Landscape</h3>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg">
              <Plus className="w-4 h-4" />
              Add Competitor
            </button>
          </div>
          <div className="grid gap-4">
            {mockCompetitors.map((competitor) => (
              <div key={competitor.id} className="bg-gray-800 rounded-xl p-5 border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gray-700 flex items-center justify-center text-xl font-bold text-white">
                      {competitor.name[0]}
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white">{competitor.name}</h4>
                      <p className="text-sm text-foreground/70">{competitor.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      competitor.threatLevel === 'critical' ? 'bg-red-500/20 text-red-400' :
                      competitor.threatLevel === 'high' ? 'bg-orange-500/20 text-orange-400' :
                      competitor.threatLevel === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {competitor.threatLevel.toUpperCase()} THREAT
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">{competitor.score}%</div>
                      <div className={`text-xs flex items-center gap-1 ${
                        competitor.change >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {competitor.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {Math.abs(competitor.change)}% this week
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {competitor.features.map((feature, i) => (
                    <span key={i} className="px-2 py-1 bg-gray-700 text-foreground/80 text-xs rounded-full">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'threats' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Threats */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                Active Threats
              </h3>
              <div className="space-y-3">
                {mockThreats.filter(t => t.type === 'threat').map((threat) => (
                  <div key={threat.id} className="bg-gray-800 rounded-xl p-4 border border-red-500/30">
                    <div className="flex items-start justify-between mb-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        threat.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                        threat.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {threat.severity.toUpperCase()}
                      </span>
                      <span className="text-xs text-foreground/60">{threat.date}</span>
                    </div>
                    <h4 className="text-white font-medium mb-1">{threat.title}</h4>
                    <p className="text-sm text-foreground/70">{threat.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Opportunities */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-green-400" />
                Opportunities
              </h3>
              <div className="space-y-3">
                {mockThreats.filter(t => t.type === 'opportunity').map((opp) => (
                  <div key={opp.id} className="bg-gray-800 rounded-xl p-4 border border-green-500/30">
                    <div className="flex items-start justify-between mb-2">
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-500/20 text-green-400">
                        OPPORTUNITY
                      </span>
                      <span className="text-xs text-foreground/60">{opp.date}</span>
                    </div>
                    <h4 className="text-white font-medium mb-1">{opp.title}</h4>
                    <p className="text-sm text-foreground/70">{opp.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'strategy' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-white">AI-Generated Recommendations</h3>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-cyan-500 hover:bg-cyan-600 text-white text-sm rounded-lg">
              <Brain className="w-4 h-4" />
              Generate New
            </button>
          </div>
          <div className="space-y-4">
            {mockRecommendations.map((rec) => (
              <div key={rec.id} className="bg-gray-800 rounded-xl p-5 border border-gray-700">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      rec.priority === 'critical' ? 'bg-red-500/20 text-red-400' :
                      rec.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {rec.priority.toUpperCase()}
                    </span>
                    <span className="px-2 py-0.5 rounded text-xs bg-gray-700 text-foreground/80">
                      {rec.category}
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    rec.status === 'in_progress' ? 'bg-yellow-500/20 text-yellow-400' :
                    rec.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                    'bg-gray-700 text-foreground/70'
                  }`}>
                    {rec.status.replace('_', ' ')}
                  </span>
                </div>
                <h4 className="text-lg font-medium text-white mb-2">{rec.title}</h4>
                <div className="flex items-center gap-2 text-sm text-foreground/70">
                  <span>Recommended by:</span>
                  <span className="text-cyan-400">{rec.expert}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'regulatory' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-xl p-6 border border-purple-500/30">
            <div className="flex items-center gap-3 mb-4">
              <Scale className="w-6 h-6 text-purple-400" />
              <h3 className="text-lg font-semibold text-white">Regulatory Moat Analysis</h3>
            </div>
            <p className="text-foreground/70 mb-4">
              Regulations can create defensible moats. Early compliance with strict regulations (like EU AI Act) 
              can be a competitive advantage as competitors struggle to catch up.
            </p>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-900 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-400">2</div>
                <div className="text-sm text-foreground/70">Compliant</div>
              </div>
              <div className="bg-gray-900 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-yellow-400">1</div>
                <div className="text-sm text-foreground/70">Partial</div>
              </div>
              <div className="bg-gray-900 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-400">1</div>
                <div className="text-sm text-foreground/70">High Moat Potential</div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {mockRegulations.map((reg) => (
              <div key={reg.id} className="bg-gray-800 rounded-xl p-5 border border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <h4 className="text-lg font-medium text-white">{reg.name}</h4>
                    <span className="px-2 py-0.5 rounded text-xs bg-gray-700 text-foreground/80">
                      {reg.region}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      reg.compliance === 'compliant' ? 'bg-green-500/20 text-green-400' :
                      reg.compliance === 'partial' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-gray-700 text-foreground/70'
                    }`}>
                      {reg.compliance}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      reg.moatPotential === 'high' ? 'bg-purple-500/20 text-purple-400' :
                      reg.moatPotential === 'medium' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-gray-700 text-foreground/70'
                    }`}>
                      {reg.moatPotential} moat potential
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-foreground/70">
                  <Clock className="w-4 h-4" />
                  Status: {reg.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
