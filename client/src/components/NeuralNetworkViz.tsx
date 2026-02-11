import { useState } from 'react';
import { Brain, TrendingUp, Users, Heart, Sparkles, Globe } from 'lucide-react';

/**
 * Neural Network Visualization
 * Interactive diagram showing how different components work together
 * Inspired by Amporah's "The Neural Network in Action" design
 */

interface NetworkNode {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  description: string;
  position: { x: number; y: number };
}

const NETWORK_NODES: NetworkNode[] = [
  {
    id: 'core',
    label: 'Core AI',
    icon: Brain,
    color: 'text-pink-500',
    bgColor: 'bg-pink-100',
    description: 'Central intelligence that orchestrates all components',
    position: { x: 50, y: 15 }
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: TrendingUp,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-100',
    description: 'Pattern recognition and business insights',
    position: { x: 15, y: 40 }
  },
  {
    id: 'insights',
    label: 'User Insights',
    icon: Users,
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-100',
    description: 'Learns your preferences and working style',
    position: { x: 85, y: 40 }
  },
  {
    id: 'wellness',
    label: 'Wellness AI',
    icon: Heart,
    color: 'text-rose-400',
    bgColor: 'bg-rose-100',
    description: 'Monitors wellbeing and suggests balance',
    position: { x: 20, y: 75 }
  },
  {
    id: 'experts',
    label: 'Expert Network',
    icon: Sparkles,
    color: 'text-green-500',
    bgColor: 'bg-green-100',
    description: '287+ AI specialists ready to help',
    position: { x: 80, y: 75 }
  },
  {
    id: 'global',
    label: 'Global Intel',
    icon: Globe,
    color: 'text-purple-500',
    bgColor: 'bg-purple-100',
    description: 'Market trends and competitive intelligence',
    position: { x: 50, y: 90 }
  }
];

// Connection lines between nodes
const CONNECTIONS = [
  { from: 'core', to: 'analytics' },
  { from: 'core', to: 'insights' },
  { from: 'core', to: 'wellness' },
  { from: 'core', to: 'experts' },
  { from: 'core', to: 'global' },
  { from: 'analytics', to: 'insights' },
  { from: 'wellness', to: 'experts' },
];

export function NeuralNetworkViz() {
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const getNodePosition = (id: string) => {
    const node = NETWORK_NODES.find(n => n.id === id);
    return node?.position || { x: 50, y: 50 };
  };

  return (
    <div className="relative bg-card/50 rounded-2xl border border-border/50 p-6 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">The Neural Network in Action</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-6">
        Watch how different components work together as a unified intelligence
      </p>

      {/* Network Visualization */}
      <div className="relative h-64 md:h-80">
        {/* Connection Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {CONNECTIONS.map((conn, i) => {
            const from = getNodePosition(conn.from);
            const to = getNodePosition(conn.to);
            const isActive = activeNode === conn.from || activeNode === conn.to ||
                            hoveredNode === conn.from || hoveredNode === conn.to;
            return (
              <line
                key={i}
                x1={`${from.x}%`}
                y1={`${from.y}%`}
                x2={`${to.x}%`}
                y2={`${to.y}%`}
                stroke={isActive ? 'rgba(6, 182, 212, 0.6)' : 'rgba(100, 116, 139, 0.2)'}
                strokeWidth={isActive ? 2 : 1}
                strokeDasharray={isActive ? '0' : '4 4'}
                className="transition-all duration-300"
              />
            );
          })}
        </svg>

        {/* Central Brain */}
        <div 
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-cyan-400/20 to-primary/20 flex items-center justify-center z-10"
        >
          <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-cyan-500 to-primary flex items-center justify-center animate-pulse">
            <Brain className="w-8 h-8 md:w-10 md:h-10 text-white" />
          </div>
        </div>

        {/* Network Nodes */}
        {NETWORK_NODES.filter(n => n.id !== 'core').map((node) => {
          const Icon = node.icon;
          const isActive = activeNode === node.id || hoveredNode === node.id;
          
          return (
            <button
              key={node.id}
              className={`
                absolute transform -translate-x-1/2 -translate-y-1/2
                transition-all duration-300 z-20
                ${isActive ? 'scale-110' : 'scale-100'}
              `}
              style={{ left: `${node.position.x}%`, top: `${node.position.y}%` }}
              onClick={() => setActiveNode(activeNode === node.id ? null : node.id)}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
            >
              <div className={`
                w-14 h-14 md:w-16 md:h-16 rounded-full ${node.bgColor}
                flex flex-col items-center justify-center
                border-2 ${isActive ? 'border-primary shadow-lg shadow-primary/20' : 'border-transparent'}
                transition-all duration-300
              `}>
                <Icon className={`w-6 h-6 ${node.color}`} />
              </div>
              <span className={`
                block text-xs mt-1 font-medium text-center
                ${isActive ? node.color : 'text-muted-foreground'}
              `}>
                {node.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Node Description */}
      {activeNode && (
        <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/20 animate-fade-in">
          <p className="text-sm text-foreground">
            <span className="font-semibold text-primary">
              {NETWORK_NODES.find(n => n.id === activeNode)?.label}:
            </span>{' '}
            {NETWORK_NODES.find(n => n.id === activeNode)?.description}
          </p>
        </div>
      )}

      {/* Interaction hint */}
      {!activeNode && (
        <p className="text-xs text-muted-foreground/60 text-center mt-4">
          Click on any node to learn more
        </p>
      )}
    </div>
  );
}

// Feature Cards Component (One Brain, Many Minds, etc.)
interface FeatureCardProps {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
}

export function FeatureCard({ icon: Icon, iconBg, iconColor, title, description }: FeatureCardProps) {
  return (
    <div className="bg-card/50 rounded-xl border border-border/50 p-6 text-center hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
      <div className={`w-16 h-16 ${iconBg} rounded-full flex items-center justify-center mx-auto mb-4`}>
        <Icon className={`w-8 h-8 ${iconColor}`} />
      </div>
      <h4 className="font-semibold text-foreground mb-2">{title}</h4>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

// Pre-built feature cards
export function FeatureCardsSection() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <FeatureCard
        icon={Brain}
        iconBg="bg-cyan-100"
        iconColor="text-cyan-600"
        title="One Brain, Many Minds"
        description="Every user interaction feeds into a single, unified intelligence that grows exponentially smarter."
      />
      <FeatureCard
        icon={Sparkles}
        iconBg="bg-green-100"
        iconColor="text-green-600"
        title="Privacy-Preserved Learning"
        description="We learn patterns and preferences without exposing individual data - intelligence grows while privacy remains."
      />
      <FeatureCard
        icon={Users}
        iconBg="bg-cyan-100"
        iconColor="text-cyan-600"
        title="Contextual Expert Assembly"
        description="The right experts are automatically assembled based on your specific needs and project context."
      />
    </div>
  );
}

// Collective Intelligence Section
export function CollectiveIntelligenceSection() {
  return (
    <div className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 rounded-2xl p-8 text-center">
      {/* Animated Brain */}
      <div className="relative w-24 h-24 mx-auto mb-6">
        <div className="absolute inset-0 bg-yellow-400/30 rounded-full animate-ping" />
        <div className="relative w-24 h-24 bg-yellow-400 rounded-full flex items-center justify-center">
          <Brain className="w-12 h-12 text-yellow-900" />
        </div>
        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-float"
            style={{
              left: `${20 + Math.random() * 60}%`,
              top: `${20 + Math.random() * 60}%`,
              animationDelay: `${i * 0.3}s`,
            }}
          />
        ))}
      </div>

      <h3 className="text-2xl font-bold text-primary mb-2">Collective Intelligence</h3>
      <p className="text-muted-foreground mb-6">How the unified brain grows smarter</p>

      <ul className="space-y-3 text-left max-w-xs mx-auto">
        <li className="flex items-center gap-3">
          <span className="w-2 h-2 bg-yellow-400 rounded-full" />
          <span className="text-sm text-foreground">Network effect visualization</span>
        </li>
        <li className="flex items-center gap-3">
          <span className="w-2 h-2 bg-yellow-400 rounded-full" />
          <span className="text-sm text-foreground">Intelligence scaling</span>
        </li>
        <li className="flex items-center gap-3">
          <span className="w-2 h-2 bg-yellow-400 rounded-full" />
          <span className="text-sm text-foreground">Every interaction matters</span>
        </li>
      </ul>

      {/* Progress bar */}
      <div className="mt-6 h-1 bg-yellow-200 rounded-full overflow-hidden max-w-xs mx-auto">
        <div className="h-full bg-yellow-400 rounded-full animate-pulse" style={{ width: '75%' }} />
      </div>
    </div>
  );
}
