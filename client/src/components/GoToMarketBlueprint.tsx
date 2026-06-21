import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Rocket,
  Target,
  Users,
  DollarSign,
  Megaphone,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Lightbulb,
  TrendingUp,
  Globe,
  Building2,
  UserCheck,
  MessageSquare,
  Calendar,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface GTMPhase {
  id: string;
  title: string;
  description: string;
  icon: typeof Rocket;
  color: string;
  tasks: GTMTask[];
}

interface GTMTask {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  output?: string;
}

const gtmPhases: GTMPhase[] = [
  {
    id: 'market',
    title: 'Market Definition',
    description: 'Define your target market and ideal customer profile',
    icon: Target,
    color: 'text-blue-400',
    tasks: [
      { id: 'm1', title: 'Total Addressable Market (TAM)', description: 'Calculate the total market size', completed: false },
      { id: 'm2', title: 'Serviceable Addressable Market (SAM)', description: 'Define the segment you can reach', completed: false },
      { id: 'm3', title: 'Serviceable Obtainable Market (SOM)', description: 'Realistic market share target', completed: false },
      { id: 'm4', title: 'Ideal Customer Profile (ICP)', description: 'Define your perfect customer', completed: false },
      { id: 'm5', title: 'Buyer Personas', description: 'Create detailed buyer personas', completed: false }
    ]
  },
  {
    id: 'positioning',
    title: 'Positioning & Messaging',
    description: 'Craft your unique value proposition and messaging',
    icon: MessageSquare,
    color: 'text-purple-400',
    tasks: [
      { id: 'p1', title: 'Value Proposition', description: 'Define your unique value', completed: false },
      { id: 'p2', title: 'Positioning Statement', description: 'How you want to be perceived', completed: false },
      { id: 'p3', title: 'Key Messages', description: 'Core messages for each persona', completed: false },
      { id: 'p4', title: 'Competitive Differentiation', description: 'What sets you apart', completed: false },
      { id: 'p5', title: 'Elevator Pitch', description: '30-second pitch', completed: false }
    ]
  },
  {
    id: 'channels',
    title: 'Channel Strategy',
    description: 'Identify and prioritize your go-to-market channels',
    icon: Globe,
    color: 'text-cyan-400',
    tasks: [
      { id: 'c1', title: 'Channel Identification', description: 'List all potential channels', completed: false },
      { id: 'c2', title: 'Channel Prioritization', description: 'Rank by potential ROI', completed: false },
      { id: 'c3', title: 'Direct Sales Strategy', description: 'If applicable', completed: false },
      { id: 'c4', title: 'Partner Strategy', description: 'Channel partners and resellers', completed: false },
      { id: 'c5', title: 'Digital Strategy', description: 'Online acquisition channels', completed: false }
    ]
  },
  {
    id: 'pricing',
    title: 'Pricing & Packaging',
    description: 'Define your pricing model and product packaging',
    icon: DollarSign,
    color: 'text-green-400',
    tasks: [
      { id: 'pr1', title: 'Pricing Model', description: 'Subscription, usage, one-time, etc.', completed: false },
      { id: 'pr2', title: 'Price Points', description: 'Specific pricing tiers', completed: false },
      { id: 'pr3', title: 'Packaging', description: 'Feature bundles per tier', completed: false },
      { id: 'pr4', title: 'Competitive Pricing Analysis', description: 'How you compare', completed: false },
      { id: 'pr5', title: 'Discount Strategy', description: 'When and how to discount', completed: false }
    ]
  },
  {
    id: 'launch',
    title: 'Launch Plan',
    description: 'Plan your market entry and launch activities',
    icon: Rocket,
    color: 'text-pink-400',
    tasks: [
      { id: 'l1', title: 'Launch Timeline', description: 'Key milestones and dates', completed: false },
      { id: 'l2', title: 'Launch Channels', description: 'Where to announce', completed: false },
      { id: 'l3', title: 'PR Strategy', description: 'Media and press plan', completed: false },
      { id: 'l4', title: 'Content Calendar', description: 'Supporting content', completed: false },
      { id: 'l5', title: 'Success Metrics', description: 'How to measure launch success', completed: false }
    ]
  },
  {
    id: 'sales',
    title: 'Sales Enablement',
    description: 'Equip your sales team for success',
    icon: UserCheck,
    color: 'text-amber-400',
    tasks: [
      { id: 's1', title: 'Sales Playbook', description: 'Process and best practices', completed: false },
      { id: 's2', title: 'Battle Cards', description: 'Competitive positioning', completed: false },
      { id: 's3', title: 'Demo Script', description: 'Product demonstration flow', completed: false },
      { id: 's4', title: 'Objection Handling', description: 'Common objections and responses', completed: false },
      { id: 's5', title: 'Case Studies', description: 'Customer success stories', completed: false }
    ]
  }
];

interface GoToMarketBlueprintProps {
  projectId?: string;
  projectName?: string;
  onComplete?: (blueprint: any) => void;
}

export function GoToMarketBlueprint({ projectId, projectName, onComplete }: GoToMarketBlueprintProps) {
  const [phases, setPhases] = useState<GTMPhase[]>(gtmPhases);
  const [activePhase, setActivePhase] = useState('market');
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [taskOutput, setTaskOutput] = useState('');

  const toggleTask = (phaseId: string, taskId: string) => {
    setPhases(phases.map(phase => {
      if (phase.id === phaseId) {
        return {
          ...phase,
          tasks: phase.tasks.map(task => 
            task.id === taskId ? { ...task, completed: !task.completed } : task
          )
        };
      }
      return phase;
    }));
  };

  const saveTaskOutput = (phaseId: string, taskId: string) => {
    setPhases(phases.map(phase => {
      if (phase.id === phaseId) {
        return {
          ...phase,
          tasks: phase.tasks.map(task => 
            task.id === taskId ? { ...task, output: taskOutput, completed: true } : task
          )
        };
      }
      return phase;
    }));
    setEditingTask(null);
    setTaskOutput('');
    toast.success('Task saved');
  };

  const totalTasks = phases.reduce((acc, p) => acc + p.tasks.length, 0);
  const completedTasks = phases.reduce((acc, p) => acc + p.tasks.filter(t => t.completed).length, 0);
  const progress = Math.round((completedTasks / totalTasks) * 100);

  const exportBlueprint = () => {
    const blueprint = {
      projectId,
      projectName,
      createdAt: new Date().toISOString(),
      progress,
      phases: phases.map(p => ({
        ...p,
        completedTasks: p.tasks.filter(t => t.completed).length,
        totalTasks: p.tasks.length
      }))
    };
    
    const blob = new Blob([JSON.stringify(blueprint, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gtm-blueprint-${projectName || 'project'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    onComplete?.(blueprint);
    toast.success('Blueprint exported');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 border-pink-500/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <Rocket className="w-6 h-6 text-pink-400" />
                Go-to-Market Blueprint
              </CardTitle>
              <CardDescription className="mt-1">
                {projectName ? `Building GTM strategy for ${projectName}` : 'Build your comprehensive go-to-market strategy'}
              </CardDescription>
            </div>
            <Button onClick={exportBlueprint} className="bg-pink-500 hover:bg-pink-600">
              Export Blueprint
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Overall Progress</span>
              <span className="text-white font-medium">{completedTasks}/{totalTasks} tasks ({progress}%)</span>
            </div>
            <Progress value={progress} className="h-3 [&>div]:bg-gradient-to-r [&>div]:from-pink-500 [&>div]:to-purple-500" />
          </div>
        </CardContent>
      </Card>

      {/* Phase Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {phases.map(phase => {
          const Icon = phase.icon;
          const phaseProgress = Math.round((phase.tasks.filter(t => t.completed).length / phase.tasks.length) * 100);
          
          return (
            <Button
              key={phase.id}
              variant={activePhase === phase.id ? 'default' : 'outline'}
              className={cn(
                'flex-shrink-0',
                activePhase === phase.id && 'bg-gradient-to-r from-pink-500 to-purple-500'
              )}
              onClick={() => setActivePhase(phase.id)}
            >
              <Icon className={cn('w-4 h-4 mr-2', activePhase !== phase.id && phase.color)} />
              {phase.title}
              <Badge variant="secondary" className="ml-2 text-xs">
                {phaseProgress}%
              </Badge>
            </Button>
          );
        })}
      </div>

      {/* Active Phase Content */}
      {phases.map(phase => {
        if (phase.id !== activePhase) return null;
        const Icon = phase.icon;
        
        return (
          <Card key={phase.id} className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className={cn('p-3 rounded-lg bg-gray-800', phase.color)}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle className="text-white">{phase.title}</CardTitle>
                  <CardDescription>{phase.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {phase.tasks.map(task => (
                <div 
                  key={task.id}
                  className={cn(
                    'p-4 rounded-lg border transition-all',
                    task.completed 
                      ? 'bg-green-500/10 border-green-500/30' 
                      : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleTask(phase.id, task.id)}
                      className={cn(
                        'mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors',
                        task.completed 
                          ? 'bg-green-500 border-green-500' 
                          : 'border-gray-600 hover:border-gray-500'
                      )}
                    >
                      {task.completed && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </button>
                    <div className="flex-1">
                      <h4 className={cn(
                        'font-medium',
                        task.completed ? 'text-green-400' : 'text-white'
                      )}>
                        {task.title}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                      
                      {task.output && (
                        <div className="mt-3 p-3 bg-gray-900/50 rounded-lg">
                          <p className="text-sm text-white whitespace-pre-wrap">{task.output}</p>
                        </div>
                      )}
                      
                      {editingTask === task.id ? (
                        <div className="mt-3 space-y-2">
                          <Textarea
                            value={taskOutput}
                            onChange={(e) => setTaskOutput(e.target.value)}
                            placeholder={`Enter your ${task.title.toLowerCase()}...`}
                            className="bg-gray-800 border-gray-700"
                          />
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              onClick={() => saveTaskOutput(phase.id, task.id)}
                            >
                              Save
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => { setEditingTask(null); setTaskOutput(''); }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="mt-2"
                          onClick={() => { 
                            setEditingTask(task.id); 
                            setTaskOutput(task.output || ''); 
                          }}
                        >
                          {task.output ? 'Edit' : 'Add Details'}
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}

      {/* AI Assistance */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Zap className="w-5 h-5 text-purple-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-white font-medium">Need help with your GTM strategy?</p>
              <p className="text-xs text-muted-foreground">Ask your AI SMEs for guidance on any section</p>
            </div>
            <Button variant="outline" size="sm">
              <MessageSquare className="w-4 h-4 mr-2" />
              Ask AI SME
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default GoToMarketBlueprint;
