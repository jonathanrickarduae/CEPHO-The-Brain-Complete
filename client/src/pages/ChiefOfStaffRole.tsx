import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, Shield, Target, Clock, CheckCircle2, XCircle, 
  AlertTriangle, Plus, Edit2, Save, Trash2, ChevronRight,
  MessageSquare, Calendar, FileText, Users, TrendingUp,
  Lock, Unlock, Settings, Zap
} from 'lucide-react';

interface Responsibility {
  id: string;
  category: string;
  title: string;
  description: string;
  enabled: boolean;
  autonomyLevel: 'ask' | 'inform' | 'autonomous';
}

interface Boundary {
  id: string;
  title: string;
  description: string;
  type: 'must_not' | 'must_ask' | 'escalate';
}

const MATURITY_LEVELS = [
  { level: 1, name: 'Infant', hours: '0-50', description: 'Observes and records, asks clarifying questions on everything' },
  { level: 2, name: 'Learning', hours: '50-200', description: 'Suggests actions, assembles teams with approval, flags patterns' },
  { level: 3, name: 'Assistant', hours: '200-500', description: 'Proactively identifies opportunities, drafts for review, manages routine tasks' },
  { level: 4, name: 'Partner', hours: '500-1000', description: 'Challenges thinking, runs AI-SMEs independently, predicts needs' },
  { level: 5, name: 'Autonomous', hours: '1000+', description: 'Full Chief of Staff capability, makes decisions within boundaries' },
];

const DEFAULT_RESPONSIBILITIES: Responsibility[] = [
  { id: '1', category: 'Strategic', title: 'Decision Support', description: 'Provide objective, evidence-based analysis for key decisions', enabled: true, autonomyLevel: 'inform' },
  { id: '2', category: 'Strategic', title: 'Challenge Assumptions', description: 'Push back on weak reasoning and flag risks others might avoid', enabled: true, autonomyLevel: 'autonomous' },
  { id: '3', category: 'Strategic', title: 'Stakeholder Briefings', description: 'Prepare meeting briefs with attendee backgrounds and talking points', enabled: true, autonomyLevel: 'autonomous' },
  { id: '4', category: 'Operations', title: 'Calendar Management', description: 'Schedule meetings, resolve conflicts, optimize time allocation', enabled: true, autonomyLevel: 'ask' },
  { id: '5', category: 'Operations', title: 'Email Triage', description: 'Priority flagging, draft responses, manage inbox flow', enabled: true, autonomyLevel: 'inform' },
  { id: '6', category: 'Operations', title: 'Task Prioritization', description: 'Organize and prioritize daily tasks based on impact and urgency', enabled: true, autonomyLevel: 'autonomous' },
  { id: '7', category: 'Intelligence', title: 'Research Synthesis', description: 'Gather, verify, and distill information from multiple sources', enabled: true, autonomyLevel: 'autonomous' },
  { id: '8', category: 'Intelligence', title: 'Market Monitoring', description: 'Track relevant news, competitors, and industry trends', enabled: true, autonomyLevel: 'autonomous' },
  { id: '9', category: 'Intelligence', title: 'Gap Identification', description: 'Flag missing information and recommend next research steps', enabled: true, autonomyLevel: 'autonomous' },
  { id: '10', category: 'Quality', title: 'Fact Verification', description: 'Verify all outputs with sources before presenting', enabled: true, autonomyLevel: 'autonomous' },
  { id: '11', category: 'Quality', title: 'Document Review', description: 'Proof and quality-check all documents before they go out', enabled: true, autonomyLevel: 'inform' },
  { id: '12', category: 'Coordination', title: 'AI-SME Orchestration', description: 'Assemble and manage expert teams for complex tasks', enabled: true, autonomyLevel: 'inform' },
];

const DEFAULT_BOUNDARIES: Boundary[] = [
  { id: '1', title: 'Financial Commitments', description: 'Never commit to any financial expenditure without explicit approval', type: 'must_not' },
  { id: '2', title: 'External Communications', description: 'Do not send emails or messages to external parties without review', type: 'must_ask' },
  { id: '3', title: 'Legal Documents', description: 'Escalate any legal agreements or contracts immediately', type: 'escalate' },
  { id: '4', title: 'Personnel Decisions', description: 'Never make hiring, firing, or HR decisions autonomously', type: 'must_not' },
  { id: '5', title: 'Confidential Information', description: 'Never share Project X or other confidential materials externally', type: 'must_not' },
  { id: '6', title: 'Meeting Acceptance', description: 'Ask before accepting meetings that require significant time commitment', type: 'must_ask' },
];

const AUTONOMY_CONFIG = {
  ask: { label: 'Ask First', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', icon: Lock },
  inform: { label: 'Do & Inform', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: MessageSquare },
  autonomous: { label: 'Fully Autonomous', color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: Unlock },
};

const BOUNDARY_CONFIG = {
  must_not: { label: 'Must Not Do', color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: XCircle },
  must_ask: { label: 'Must Ask', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', icon: AlertTriangle },
  escalate: { label: 'Escalate', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', icon: TrendingUp },
};

export default function ChiefOfStaffRole() {
  const [responsibilities, setResponsibilities] = useState(DEFAULT_RESPONSIBILITIES);
  const [boundaries, setBoundaries] = useState(DEFAULT_BOUNDARIES);
  const [currentLevel, setCurrentLevel] = useState(2); // Learning level
  const [trainingHours, setTrainingHours] = useState(127);
  const [editingId, setEditingId] = useState<string | null>(null);

  const toggleResponsibility = (id: string) => {
    setResponsibilities(prev => prev.map(r => 
      r.id === id ? { ...r, enabled: !r.enabled } : r
    ));
  };

  const updateAutonomy = (id: string, level: Responsibility['autonomyLevel']) => {
    setResponsibilities(prev => prev.map(r => 
      r.id === id ? { ...r, autonomyLevel: level } : r
    ));
  };

  const categories = Array.from(new Set(responsibilities.map(r => r.category)));

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Brain className="w-8 h-8 text-fuchsia-400" />
              Chief of Staff Role Definition
            </h1>
            <p className="text-gray-400 mt-1">
              Configure responsibilities, boundaries, and autonomy levels
            </p>
          </div>
          <Button className="bg-fuchsia-600 hover:bg-fuchsia-700">
            <Save className="w-4 h-4 mr-2" />
            Save Configuration
          </Button>
        </div>

        {/* Maturity Level Card */}
        <div className="bg-gradient-to-br from-fuchsia-500/10 to-purple-500/10 border border-fuchsia-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-white">Maturity Level</h2>
              <p className="text-gray-400 text-sm">Based on training hours and interaction patterns</p>
            </div>
            <Badge className="bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/30 text-lg px-4 py-2">
              Level {currentLevel}: {MATURITY_LEVELS[currentLevel - 1].name}
            </Badge>
          </div>

          {/* Progress through levels */}
          <div className="grid grid-cols-5 gap-2 mb-4">
            {MATURITY_LEVELS.map((level, index) => (
              <div 
                key={level.level}
                className={`p-3 rounded-lg border ${
                  index + 1 <= currentLevel 
                    ? 'bg-fuchsia-500/20 border-fuchsia-500/50' 
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm font-medium ${index + 1 <= currentLevel ? 'text-fuchsia-400' : 'text-gray-500'}`}>
                    Level {level.level}
                  </span>
                  {index + 1 <= currentLevel && <CheckCircle2 className="w-4 h-4 text-fuchsia-400" />}
                </div>
                <p className={`text-xs ${index + 1 <= currentLevel ? 'text-white' : 'text-gray-500'}`}>
                  {level.name}
                </p>
                <p className="text-xs text-gray-500 mt-1">{level.hours} hrs</p>
              </div>
            ))}
          </div>

          {/* Training Progress */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-400">Training Progress</span>
                <span className="text-white font-medium">{trainingHours} hours logged</span>
              </div>
              <Progress value={(trainingHours / 200) * 100} className="h-2" />
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">Next level in</p>
              <p className="text-lg font-semibold text-fuchsia-400">{200 - trainingHours} hours</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="responsibilities" className="space-y-4">
          <TabsList className="bg-white/5 border border-white/10">
            <TabsTrigger value="responsibilities" className="data-[state=active]:bg-fuchsia-500/20">
              <Target className="w-4 h-4 mr-2" />
              Responsibilities
            </TabsTrigger>
            <TabsTrigger value="boundaries" className="data-[state=active]:bg-fuchsia-500/20">
              <Shield className="w-4 h-4 mr-2" />
              Boundaries
            </TabsTrigger>
            <TabsTrigger value="communication" className="data-[state=active]:bg-fuchsia-500/20">
              <MessageSquare className="w-4 h-4 mr-2" />
              Communication Style
            </TabsTrigger>
          </TabsList>

          {/* Responsibilities Tab */}
          <TabsContent value="responsibilities" className="space-y-6">
            {categories.map(category => (
              <div key={category} className="bg-card/50 border border-border rounded-xl overflow-hidden">
                <div className="p-4 border-b border-border bg-white/5">
                  <h3 className="font-semibold text-white">{category} Functions</h3>
                </div>
                <div className="divide-y divide-border/50">
                  {responsibilities.filter(r => r.category === category).map(resp => {
                    const AutonomyIcon = AUTONOMY_CONFIG[resp.autonomyLevel].icon;
                    return (
                      <div key={resp.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                        <div className="flex items-center gap-4 flex-1">
                          <button
                            onClick={() => toggleResponsibility(resp.id)}
                            className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                              resp.enabled 
                                ? 'bg-fuchsia-500 border-fuchsia-500' 
                                : 'border-gray-500 hover:border-gray-400'
                            }`}
                          >
                            {resp.enabled && <CheckCircle2 className="w-4 h-4 text-white" />}
                          </button>
                          <div>
                            <h4 className={`font-medium ${resp.enabled ? 'text-white' : 'text-gray-500'}`}>
                              {resp.title}
                            </h4>
                            <p className={`text-sm ${resp.enabled ? 'text-gray-400' : 'text-gray-600'}`}>
                              {resp.description}
                            </p>
                          </div>
                        </div>
                        {resp.enabled && (
                          <div className="flex items-center gap-2">
                            {(['ask', 'inform', 'autonomous'] as const).map(level => (
                              <button
                                key={level}
                                onClick={() => updateAutonomy(resp.id, level)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                                  resp.autonomyLevel === level
                                    ? AUTONOMY_CONFIG[level].color
                                    : 'bg-white/5 text-gray-400 border-white/10 hover:border-white/20'
                                }`}
                              >
                                {AUTONOMY_CONFIG[level].label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            <Button variant="outline" className="w-full border-dashed border-white/20 text-gray-400 hover:text-white hover:border-white/40">
              <Plus className="w-4 h-4 mr-2" />
              Add Custom Responsibility
            </Button>
          </TabsContent>

          {/* Boundaries Tab */}
          <TabsContent value="boundaries" className="space-y-4">
            <div className="bg-card/50 border border-border rounded-xl overflow-hidden">
              <div className="p-4 border-b border-border bg-white/5">
                <h3 className="font-semibold text-white">What Chief of Staff Must NOT Do</h3>
                <p className="text-sm text-gray-400">Hard boundaries that cannot be crossed</p>
              </div>
              <div className="divide-y divide-border/50">
                {boundaries.map(boundary => {
                  const BoundaryIcon = BOUNDARY_CONFIG[boundary.type].icon;
                  return (
                    <div key={boundary.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${BOUNDARY_CONFIG[boundary.type].color.split(' ')[0]}`}>
                          <BoundaryIcon className={`w-5 h-5 ${BOUNDARY_CONFIG[boundary.type].color.split(' ')[1]}`} />
                        </div>
                        <div>
                          <h4 className="font-medium text-white">{boundary.title}</h4>
                          <p className="text-sm text-gray-400">{boundary.description}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className={BOUNDARY_CONFIG[boundary.type].color}>
                        {BOUNDARY_CONFIG[boundary.type].label}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>

            <Button variant="outline" className="w-full border-dashed border-white/20 text-gray-400 hover:text-white hover:border-white/40">
              <Plus className="w-4 h-4 mr-2" />
              Add Custom Boundary
            </Button>
          </TabsContent>

          {/* Communication Style Tab */}
          <TabsContent value="communication" className="space-y-4">
            <div className="bg-card/50 border border-border rounded-xl p-6">
              <h3 className="font-semibold text-white mb-4">Communication Protocol</h3>
              
              <div className="space-y-4">
                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <h4 className="font-medium text-green-400 mb-2 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    What Chief of Staff SHOULD Do
                  </h4>
                  <ul className="text-sm text-gray-300 space-y-2">
                    <li>• Be direct and professional - no fluff or filler</li>
                    <li>• Challenge weak reasoning: "I'd challenge that because..."</li>
                    <li>• Demand missing information: "Before proceeding, I need..."</li>
                    <li>• Slow down rushed decisions: "Have you stress-tested this against..."</li>
                    <li>• Provide evidence-based recommendations with sources</li>
                    <li>• Flag concerns others might avoid mentioning</li>
                  </ul>
                </div>

                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <h4 className="font-medium text-red-400 mb-2 flex items-center gap-2">
                    <XCircle className="w-4 h-4" />
                    What Chief of Staff Must NOT Do
                  </h4>
                  <ul className="text-sm text-gray-300 space-y-2">
                    <li>• No sycophancy - never say "Great idea!" without reasoning</li>
                    <li>• No empty validation - earn agreement through logic</li>
                    <li>• No casual chat - keep it professional and crisp</li>
                    <li>• No hedged language - be direct with statements</li>
                    <li>• No opinions without evidence - facts and data first</li>
                  </ul>
                </div>

                <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                  <h4 className="font-medium text-white mb-2">Tone Standard</h4>
                  <p className="text-sm text-gray-400">
                    Think McKinsey consultant, not personal assistant. Think boardroom, not coffee chat. 
                    Respectful, rigorous, results-focused. A trusted advisor who respects you enough to be honest.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
