import { useState } from 'react';
import { 
  Brain, Activity, Users, Heart, Sparkles,
  Database, Shield, Zap, Network, ChevronRight,
  Info, X
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ArchitectureNode {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  connections: string[];
  features: string[];
}

const ARCHITECTURE_NODES: ArchitectureNode[] = [
  {
    id: 'core',
    name: 'Core AI',
    description: 'Central intelligence engine that orchestrates all AI operations',
    icon: Brain,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
    connections: ['analytics', 'insights', 'wellness', 'experts'],
    features: ['Multi-model routing', 'Context management', 'Learning engine', 'Decision support']
  },
  {
    id: 'analytics',
    name: 'Analytics Engine',
    description: 'Real-time data processing and pattern recognition',
    icon: Activity,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
    connections: ['core', 'insights'],
    features: ['Workflow patterns', 'Performance metrics', 'Trend analysis', 'Anomaly detection']
  },
  {
    id: 'insights',
    name: 'User Insights',
    description: 'Personalized learning from user behavior and preferences',
    icon: Users,
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
    connections: ['core', 'analytics', 'wellness'],
    features: ['Preference learning', 'Behavior modeling', 'Personalization', 'Adaptive UI']
  },
  {
    id: 'wellness',
    name: 'Wellness AI',
    description: 'Health monitoring and burnout prevention system',
    icon: Heart,
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/20',
    connections: ['core', 'insights'],
    features: ['Stress detection', 'Break reminders', 'Sleep tracking', 'Energy optimization']
  },
  {
    id: 'experts',
    name: 'Expert Network',
    description: 'Specialized AI agents for domain-specific tasks',
    icon: Sparkles,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20',
    connections: ['core'],
    features: ['Legal expert', 'Financial analyst', 'Technical writer', 'Research lead']
  }
];

export function BrainArchitectureDiagram() {
  const [selectedNode, setSelectedNode] = useState<ArchitectureNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const isConnected = (nodeId: string) => {
    if (!hoveredNode) return false;
    const hovered = ARCHITECTURE_NODES.find(n => n.id === hoveredNode);
    return hovered?.connections.includes(nodeId) || nodeId === hoveredNode;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="bg-card/60 border-border">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Network className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Brain Architecture</h2>
              <p className="text-sm text-muted-foreground">Interactive system diagram - tap nodes to explore</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Diagram */}
      <Card className="bg-card/60 border-border overflow-hidden">
        <CardContent className="p-6">
          <div className="relative min-h-[400px]">
            {/* Connection Lines (SVG) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
              {/* Core to Analytics */}
              <line 
                x1="50%" y1="50%" x2="20%" y2="20%" 
                stroke={isConnected('analytics') ? '#3B82F6' : '#374151'} 
                strokeWidth="2" 
                strokeDasharray={hoveredNode ? '0' : '5,5'}
                className="transition-all duration-300"
              />
              {/* Core to Insights */}
              <line 
                x1="50%" y1="50%" x2="80%" y2="20%" 
                stroke={isConnected('insights') ? '#22C55E' : '#374151'} 
                strokeWidth="2" 
                strokeDasharray={hoveredNode ? '0' : '5,5'}
                className="transition-all duration-300"
              />
              {/* Core to Wellness */}
              <line 
                x1="50%" y1="50%" x2="20%" y2="80%" 
                stroke={isConnected('wellness') ? '#EC4899' : '#374151'} 
                strokeWidth="2" 
                strokeDasharray={hoveredNode ? '0' : '5,5'}
                className="transition-all duration-300"
              />
              {/* Core to Experts */}
              <line 
                x1="50%" y1="50%" x2="80%" y2="80%" 
                stroke={isConnected('experts') ? '#EAB308' : '#374151'} 
                strokeWidth="2" 
                strokeDasharray={hoveredNode ? '0' : '5,5'}
                className="transition-all duration-300"
              />
              {/* Analytics to Insights */}
              <line 
                x1="20%" y1="20%" x2="80%" y2="20%" 
                stroke={isConnected('analytics') && isConnected('insights') ? '#6366F1' : '#374151'} 
                strokeWidth="1" 
                strokeDasharray="3,3"
                className="transition-all duration-300"
              />
              {/* Insights to Wellness */}
              <line 
                x1="80%" y1="20%" x2="20%" y2="80%" 
                stroke={isConnected('insights') && isConnected('wellness') ? '#14B8A6' : '#374151'} 
                strokeWidth="1" 
                strokeDasharray="3,3"
                className="transition-all duration-300"
              />
            </svg>

            {/* Core AI Node (Center) */}
            <div 
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
              onMouseEnter={() => setHoveredNode('core')}
              onMouseLeave={() => setHoveredNode(null)}
              onClick={() => setSelectedNode(ARCHITECTURE_NODES.find(n => n.id === 'core') || null)}
            >
              <div className={`w-24 h-24 rounded-full ${ARCHITECTURE_NODES[0].bgColor} border-2 border-purple-500/50 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 ${hoveredNode === 'core' ? 'ring-4 ring-purple-500/30' : ''}`}>
                <Brain className="w-8 h-8 text-purple-400" />
                <span className="text-xs font-medium text-purple-400 mt-1">Core AI</span>
              </div>
            </div>

            {/* Analytics Node (Top Left) */}
            <div 
              className="absolute left-[20%] top-[20%] -translate-x-1/2 -translate-y-1/2 z-10"
              onMouseEnter={() => setHoveredNode('analytics')}
              onMouseLeave={() => setHoveredNode(null)}
              onClick={() => setSelectedNode(ARCHITECTURE_NODES.find(n => n.id === 'analytics') || null)}
            >
              <div className={`w-20 h-20 rounded-full ${ARCHITECTURE_NODES[1].bgColor} border-2 border-blue-500/50 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 ${hoveredNode === 'analytics' || isConnected('analytics') ? 'ring-4 ring-blue-500/30' : 'opacity-70'}`}>
                <Activity className="w-6 h-6 text-blue-400" />
                <span className="text-xs font-medium text-blue-400 mt-1">Analytics</span>
              </div>
            </div>

            {/* Insights Node (Top Right) */}
            <div 
              className="absolute left-[80%] top-[20%] -translate-x-1/2 -translate-y-1/2 z-10"
              onMouseEnter={() => setHoveredNode('insights')}
              onMouseLeave={() => setHoveredNode(null)}
              onClick={() => setSelectedNode(ARCHITECTURE_NODES.find(n => n.id === 'insights') || null)}
            >
              <div className={`w-20 h-20 rounded-full ${ARCHITECTURE_NODES[2].bgColor} border-2 border-green-500/50 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 ${hoveredNode === 'insights' || isConnected('insights') ? 'ring-4 ring-green-500/30' : 'opacity-70'}`}>
                <Users className="w-6 h-6 text-green-400" />
                <span className="text-xs font-medium text-green-400 mt-1">Insights</span>
              </div>
            </div>

            {/* Wellness Node (Bottom Left) */}
            <div 
              className="absolute left-[20%] top-[80%] -translate-x-1/2 -translate-y-1/2 z-10"
              onMouseEnter={() => setHoveredNode('wellness')}
              onMouseLeave={() => setHoveredNode(null)}
              onClick={() => setSelectedNode(ARCHITECTURE_NODES.find(n => n.id === 'wellness') || null)}
            >
              <div className={`w-20 h-20 rounded-full ${ARCHITECTURE_NODES[3].bgColor} border-2 border-pink-500/50 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 ${hoveredNode === 'wellness' || isConnected('wellness') ? 'ring-4 ring-pink-500/30' : 'opacity-70'}`}>
                <Heart className="w-6 h-6 text-pink-400" />
                <span className="text-xs font-medium text-pink-400 mt-1">Wellness</span>
              </div>
            </div>

            {/* Experts Node (Bottom Right) */}
            <div 
              className="absolute left-[80%] top-[80%] -translate-x-1/2 -translate-y-1/2 z-10"
              onMouseEnter={() => setHoveredNode('experts')}
              onMouseLeave={() => setHoveredNode(null)}
              onClick={() => setSelectedNode(ARCHITECTURE_NODES.find(n => n.id === 'experts') || null)}
            >
              <div className={`w-20 h-20 rounded-full ${ARCHITECTURE_NODES[4].bgColor} border-2 border-yellow-500/50 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 ${hoveredNode === 'experts' || isConnected('experts') ? 'ring-4 ring-yellow-500/30' : 'opacity-70'}`}>
                <Sparkles className="w-6 h-6 text-yellow-400" />
                <span className="text-xs font-medium text-yellow-400 mt-1">Experts</span>
              </div>
            </div>

            {/* Data Flow Indicators */}
            <div className="absolute bottom-2 left-2 flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="w-4 h-0.5 bg-gray-500" style={{ borderStyle: 'dashed' }} />
                <span>Data flow</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-0.5 bg-primary" />
                <span>Active</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Node Detail Panel */}
      {selectedNode && (
        <Card className="bg-card/60 border-border">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${selectedNode.bgColor} flex items-center justify-center`}>
                  <selectedNode.icon className={`w-5 h-5 ${selectedNode.color}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{selectedNode.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedNode.description}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedNode(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-foreground">Key Features:</h4>
              <div className="flex flex-wrap gap-2">
                {selectedNode.features.map((feature, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    <Zap className="w-3 h-3 mr-1" />
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>
            {selectedNode.connections.length > 0 && (
              <div className="mt-3 pt-3 border-t border-border">
                <h4 className="text-sm font-medium text-foreground mb-2">Connected to:</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedNode.connections.map((connId) => {
                    const conn = ARCHITECTURE_NODES.find(n => n.id === connId);
                    if (!conn) return null;
                    return (
                      <Badge 
                        key={connId} 
                        variant="outline" 
                        className={`cursor-pointer ${conn.color}`}
                        onClick={() => setSelectedNode(conn)}
                      >
                        <ChevronRight className="w-3 h-3 mr-1" />
                        {conn.name}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Legend */}
      <Card className="bg-card/60 border-border">
        <CardContent className="p-4">
          <h4 className="text-sm font-medium text-foreground mb-3">System Components</h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {ARCHITECTURE_NODES.map((node) => (
              <div 
                key={node.id}
                className="flex items-center gap-2 cursor-pointer hover:bg-background/50 p-2 rounded transition-colors"
                onClick={() => setSelectedNode(node)}
              >
                <div className={`w-6 h-6 rounded ${node.bgColor} flex items-center justify-center`}>
                  <node.icon className={`w-3 h-3 ${node.color}`} />
                </div>
                <span className="text-xs text-muted-foreground">{node.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default BrainArchitectureDiagram;
