import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, Shield, Target, Clock, CheckCircle2, XCircle, 
  AlertTriangle, Plus, Edit2, Save, Trash2, ChevronRight,
  MessageSquare, Calendar, FileText, Users, TrendingUp,
  Lock, Unlock, Settings, Zap, Briefcase
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
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 space-y-6">
        {/* Header - Manus Style */}
        <div className="border-b border-border pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                <Briefcase className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">Chief of Staff</h1>
                <p className="text-muted-foreground text-sm mt-1">Configure responsibilities, boundaries, and autonomy levels</p>
              </div>
            </div>
            <Button size="sm" className="bg-primary hover:bg-primary/90">
              <Save className="w-4 h-4 mr-2" />
              Save Configuration
            </Button>
          </div>
        </div>

        {/* Maturity Level Card - Cleaner Design */}
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Maturity Level</h2>
              <p className="text-muted-foreground text-sm">Based on training hours and interaction patterns</p>
            </div>
            <Badge variant="outline" className="text-base px-4 py-2">
              Level {currentLevel}: {MATURITY_LEVELS[currentLevel - 1].name}
            </Badge>
          </div>

          {/* Progress through levels */}
          <div className="grid grid-cols-5 gap-2">
            {MATURITY_LEVELS.map((level, index) => (
              <div 
                key={level.level}
                className={`p-3 rounded-md border transition-all ${
                  index + 1 <= currentLevel 
                    ? 'bg-primary/15 border-primary/40 shadow-sm' 
                    : 'bg-secondary/30 border-border'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-medium ${index + 1 <= currentLevel ? 'text-primary' : 'text-muted-foreground'}`}>
                    L{level.level}
                  </span>
                  {index + 1 <= currentLevel && <CheckCircle2 className="w-3 h-3 text-primary" />}
                </div>
                <p className={`text-xs font-medium ${index + 1 <= currentLevel ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {level.name}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{level.hours} hrs</p>
              </div>
            ))}
          </div>

          {/* Training Progress */}
          <div className="flex items-center gap-4 pt-2">
            <div className="flex-1">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">Training Progress</span>
                <span className="font-medium text-foreground">{trainingHours} hours logged</span>
              </div>
              <Progress value={(trainingHours / 200) * 100} className="h-2" />
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Next level in</p>
              <p className="text-lg font-semibold text-primary">{200 - trainingHours} hrs</p>
            </div>
          </div>
        </div>

        {/* Tabs - Manus Style */}
        <Tabs defaultValue="responsibilities" className="space-y-4">
          <TabsList className="bg-secondary/50 border border-border">
            <TabsTrigger value="responsibilities" className="data-[state=active]:bg-primary/15 data-[state=active]:text-primary">
              <Target className="w-4 h-4 mr-2" />
              Responsibilities
            </TabsTrigger>
            <TabsTrigger value="boundaries" className="data-[state=active]:bg-primary/15 data-[state=active]:text-primary">
              <Shield className="w-4 h-4 mr-2" />
              Boundaries
            </TabsTrigger>
            <TabsTrigger value="communication" className="data-[state=active]:bg-primary/15 data-[state=active]:text-primary">
              <MessageSquare className="w-4 h-4 mr-2" />
              Communication
            </TabsTrigger>
          </TabsList>

          {/* Responsibilities Tab */}
          <TabsContent value="responsibilities" className="space-y-4">
            {categories.map(category => (
              <div key={category} className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="p-4 border-b border-border bg-secondary/30">
                  <h3 className="font-semibold text-foreground">{category} Functions</h3>
                </div>
                <div className="divide-y divide-border">
                  {responsibilities.filter(r => r.category === category).map(resp => {
                    const AutonomyIcon = AUTONOMY_CONFIG[resp.autonomyLevel].icon;
                    return (
                      <div key={resp.id} className="p-4 flex items-center justify-between hover:bg-secondary/20 transition-colors">
                        <div className="flex items-center gap-4 flex-1">
                          <button
                            onClick={() => toggleResponsibility(resp.id)}
                            className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
                              resp.enabled 
                                ? 'bg-primary border-primary' 
                                : 'border-border hover:border-primary/50'
                            }`}
                          >
                            {resp.enabled && <CheckCircle2 className="w-4 h-4 text-primary-foreground" />}
                          </button>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground">{resp.title}</p>
                            <p className="text-sm text-muted-foreground">{resp.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                          <div className="flex gap-1">
                            {(['ask', 'inform', 'autonomous'] as const).map(level => (
                              <button
                                key={level}
                                onClick={() => updateAutonomy(resp.id, level)}
                                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                                  resp.autonomyLevel === level
                                    ? AUTONOMY_CONFIG[level].color
                                    : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'
                                }`}
                              >
                                {level === 'ask' ? 'Ask' : level === 'inform' ? 'Inform' : 'Auto'}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </TabsContent>

          {/* Boundaries Tab */}
          <TabsContent value="boundaries" className="space-y-4">
            <div className="space-y-3">
              {boundaries.map(boundary => {
                const BoundaryIcon = BOUNDARY_CONFIG[boundary.type].icon;
                return (
                  <div key={boundary.id} className="bg-card border border-border rounded-lg p-4">
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-md flex-shrink-0 ${BOUNDARY_CONFIG[boundary.type].color}`}>
                        <BoundaryIcon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-foreground">{boundary.title}</h3>
                          <Badge variant="outline" className="text-xs">
                            {BOUNDARY_CONFIG[boundary.type].label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{boundary.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          {/* Communication Tab */}
          <TabsContent value="communication" className="space-y-4">
            <div className="bg-card border border-border rounded-lg p-6 space-y-4">
              <div>
                <h3 className="font-semibold text-foreground mb-2">Communication Protocol</h3>
                <p className="text-sm text-muted-foreground mb-4">Define how your Chief of Staff should communicate with you</p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-md border border-border">
                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Daily Summary</p>
                      <p className="text-xs text-muted-foreground">Receive a daily briefing of key decisions and actions</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-md border border-border">
                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Real-time Alerts</p>
                      <p className="text-xs text-muted-foreground">Notify me immediately of urgent issues or decisions</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-md border border-border">
                    <input type="checkbox" className="w-4 h-4 rounded" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Weekly Review</p>
                      <p className="text-xs text-muted-foreground">Comprehensive weekly review of all decisions and outcomes</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
