import { useState, useRef } from 'react';
import { 
  Download, Share2, ZoomIn, ZoomOut, Maximize2, 
  FileText, Users, TrendingUp, Scale, Shield, 
  Building2, GitBranch, Layers, ArrowRight, 
  CheckCircle2, AlertTriangle, Clock, Target
} from 'lucide-react';

// Visual Blueprint - Single-page architectural diagram
// Shows all elements, processes, dependencies visually connected
// Replaces long PDF documents with clear visual mapping

interface BlueprintNode {
  id: string;
  type: 'core' | 'process' | 'document' | 'stakeholder' | 'risk' | 'milestone';
  label: string;
  description?: string;
  status?: 'complete' | 'in_progress' | 'pending' | 'blocked';
  connections?: string[];
  position: { x: number; y: number };
  category?: string;
}

interface BlueprintData {
  projectName: string;
  projectType: string;
  nodes: BlueprintNode[];
  layers: {
    id: string;
    name: string;
    color: string;
    nodes: string[];
  }[];
}

interface VisualBlueprintProps {
  projectName?: string;
  projectType?: string;
  data?: Partial<BlueprintData>;
}

// Sample blueprint structure for a Full Project Genesis
const SAMPLE_BLUEPRINT: BlueprintData = {
  projectName: 'Boundless AI',
  projectType: 'Full Project Genesis',
  layers: [
    { id: 'governance', name: 'Governance & Compliance', color: '#8B5CF6', nodes: ['gov1', 'gov2', 'gov3'] },
    { id: 'legal', name: 'Legal Structure', color: '#3B82F6', nodes: ['legal1', 'legal2', 'legal3', 'legal4'] },
    { id: 'financial', name: 'Financial Architecture', color: '#10B981', nodes: ['fin1', 'fin2', 'fin3', 'fin4'] },
    { id: 'operational', name: 'Operational Framework', color: '#F59E0B', nodes: ['ops1', 'ops2', 'ops3'] },
    { id: 'risk', name: 'Risk Management', color: '#EF4444', nodes: ['risk1', 'risk2', 'risk3'] },
  ],
  nodes: [
    // Governance Layer
    { id: 'gov1', type: 'core', label: 'Board Structure', description: 'Independent directors, committees', status: 'pending', position: { x: 100, y: 80 }, category: 'governance' },
    { id: 'gov2', type: 'document', label: 'Shareholder Agreement', description: 'Rights, obligations, transfers', status: 'in_progress', connections: ['gov1'], position: { x: 300, y: 80 }, category: 'governance' },
    { id: 'gov3', type: 'process', label: 'Decision Framework', description: 'Voting, consent matters', status: 'pending', connections: ['gov1', 'gov2'], position: { x: 500, y: 80 }, category: 'governance' },
    
    // Legal Layer
    { id: 'legal1', type: 'document', label: 'NDA', description: 'Mutual confidentiality', status: 'complete', position: { x: 50, y: 180 }, category: 'legal' },
    { id: 'legal2', type: 'document', label: 'Articles of Association', description: 'Corporate constitution', status: 'in_progress', connections: ['legal1'], position: { x: 200, y: 180 }, category: 'legal' },
    { id: 'legal3', type: 'document', label: 'IP Assignment', description: 'Intellectual property transfer', status: 'pending', connections: ['legal2'], position: { x: 350, y: 180 }, category: 'legal' },
    { id: 'legal4', type: 'document', label: 'Employment Contracts', description: 'Key personnel agreements', status: 'pending', connections: ['legal2'], position: { x: 500, y: 180 }, category: 'legal' },
    
    // Financial Layer
    { id: 'fin1', type: 'document', label: 'Financial Model', description: '3-statement projections', status: 'in_progress', position: { x: 100, y: 280 }, category: 'financial' },
    { id: 'fin2', type: 'document', label: 'DCF Valuation', description: 'Discounted cash flow analysis', status: 'pending', connections: ['fin1'], position: { x: 280, y: 280 }, category: 'financial' },
    { id: 'fin3', type: 'document', label: 'Cap Table', description: 'Equity ownership structure', status: 'pending', connections: ['fin1', 'gov2'], position: { x: 460, y: 280 }, category: 'financial' },
    { id: 'fin4', type: 'milestone', label: 'Funding Close', description: 'Target: Q2 2026', status: 'pending', connections: ['fin2', 'fin3'], position: { x: 620, y: 280 }, category: 'financial' },
    
    // Operational Layer
    { id: 'ops1', type: 'stakeholder', label: 'Management Team', description: 'CEO, CFO, CTO', status: 'complete', position: { x: 150, y: 380 }, category: 'operational' },
    { id: 'ops2', type: 'process', label: 'Key Processes', description: 'Sales, delivery, support', status: 'pending', connections: ['ops1'], position: { x: 350, y: 380 }, category: 'operational' },
    { id: 'ops3', type: 'document', label: 'Org Chart', description: 'Reporting structure', status: 'in_progress', connections: ['ops1'], position: { x: 550, y: 380 }, category: 'operational' },
    
    // Risk Layer
    { id: 'risk1', type: 'risk', label: 'Market Risk', description: 'Competition, demand', status: 'pending', position: { x: 100, y: 480 }, category: 'risk' },
    { id: 'risk2', type: 'risk', label: 'Regulatory Risk', description: 'Compliance requirements', status: 'pending', connections: ['risk1'], position: { x: 300, y: 480 }, category: 'risk' },
    { id: 'risk3', type: 'risk', label: 'Operational Risk', description: 'Key person, continuity', status: 'pending', connections: ['risk1', 'ops1'], position: { x: 500, y: 480 }, category: 'risk' },
  ]
};

export function VisualBlueprint({ projectName, projectType, data }: VisualBlueprintProps) {
  const [zoom, setZoom] = useState(1);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [showLegend, setShowLegend] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const blueprintRef = useRef<HTMLDivElement>(null);

  // Export blueprint as PNG
  const handleExportPNG = async () => {
    if (!blueprintRef.current) return;
    setIsExporting(true);
    try {
      // Use html2canvas for PNG export
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(blueprintRef.current, {
        backgroundColor: '#0a0a0a',
        scale: 2,
      });
      const link = document.createElement('a');
      link.download = `${blueprint.projectName.replace(/\s+/g, '_')}_blueprint.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // Export blueprint as SVG
  const handleExportSVG = () => {
    const svgElement = blueprintRef.current?.querySelector('svg');
    if (!svgElement) return;
    
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `${blueprint.projectName.replace(/\s+/g, '_')}_blueprint.svg`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };
  
  const blueprint = data?.nodes ? data as BlueprintData : {
    ...SAMPLE_BLUEPRINT,
    projectName: projectName || SAMPLE_BLUEPRINT.projectName,
    projectType: projectType || SAMPLE_BLUEPRINT.projectType
  };

  const getNodeIcon = (type: BlueprintNode['type']) => {
    switch (type) {
      case 'core': return <Building2 className="w-4 h-4" />;
      case 'process': return <GitBranch className="w-4 h-4" />;
      case 'document': return <FileText className="w-4 h-4" />;
      case 'stakeholder': return <Users className="w-4 h-4" />;
      case 'risk': return <AlertTriangle className="w-4 h-4" />;
      case 'milestone': return <Target className="w-4 h-4" />;
      default: return <Layers className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status?: BlueprintNode['status']) => {
    switch (status) {
      case 'complete': return 'border-green-500 bg-green-500/20';
      case 'in_progress': return 'border-blue-500 bg-blue-500/20';
      case 'blocked': return 'border-red-500 bg-red-500/20';
      default: return 'border-gray-500 bg-gray-500/20';
    }
  };

  const getStatusIcon = (status?: BlueprintNode['status']) => {
    switch (status) {
      case 'complete': return <CheckCircle2 className="w-3 h-3 text-green-500" />;
      case 'in_progress': return <Clock className="w-3 h-3 text-blue-500" />;
      case 'blocked': return <AlertTriangle className="w-3 h-3 text-red-500" />;
      default: return <Clock className="w-3 h-3 text-foreground/60" />;
    }
  };

  // Calculate SVG paths for connections
  const renderConnections = () => {
    const paths: React.ReactNode[] = [];
    
    blueprint.nodes.forEach(node => {
      if (node.connections) {
        node.connections.forEach(targetId => {
          const target = blueprint.nodes.find(n => n.id === targetId);
          if (target) {
            const startX = node.position.x + 60;
            const startY = node.position.y + 25;
            const endX = target.position.x + 60;
            const endY = target.position.y + 25;
            
            // Calculate control points for curved lines
            const midX = (startX + endX) / 2;
            const midY = (startY + endY) / 2;
            
            const layer = blueprint.layers.find(l => l.nodes.includes(node.id));
            const color = layer?.color || '#6B7280';
            
            paths.push(
              <g key={`${node.id}-${targetId}`}>
                <path
                  d={`M ${startX} ${startY} Q ${midX} ${startY} ${midX} ${midY} Q ${midX} ${endY} ${endX} ${endY}`}
                  fill="none"
                  stroke={color}
                  strokeWidth="2"
                  strokeOpacity="0.4"
                  strokeDasharray="4 2"
                />
                {/* Arrow head */}
                <circle
                  cx={endX}
                  cy={endY}
                  r="4"
                  fill={color}
                  fillOpacity="0.6"
                />
              </g>
            );
          }
        });
      }
    });
    
    return paths;
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-secondary/30">
        <div>
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary" />
            Visual Project Blueprint
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {blueprint.projectName} • {blueprint.projectType}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowLegend(!showLegend)}
            className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
              showLegend ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/50'
            }`}
          >
            Legend
          </button>
          <div className="flex items-center gap-1 border border-border rounded-lg p-1">
            <button
              onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}
              className="p-1.5 hover:bg-secondary rounded"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs text-muted-foreground w-12 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom(z => Math.min(2, z + 0.1))}
              className="p-1.5 hover:bg-secondary rounded"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
          <button className="p-1.5 hover:bg-secondary rounded border border-border">
            <Maximize2 className="w-4 h-4" />
          </button>
          <div className="relative group">
            <button 
              className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 flex items-center gap-1"
              disabled={isExporting}
            >
              {isExporting ? (
                <span className="animate-spin">⏳</span>
              ) : (
                <Download className="w-4 h-4" />
              )}
              Export
            </button>
            <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <button
                onClick={handleExportPNG}
                className="w-full px-4 py-2 text-sm text-left hover:bg-secondary flex items-center gap-2"
              >
                📷 Export as PNG
              </button>
              <button
                onClick={handleExportSVG}
                className="w-full px-4 py-2 text-sm text-left hover:bg-secondary flex items-center gap-2"
              >
                🎨 Export as SVG
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Legend Sidebar */}
        {showLegend && (
          <div className="w-64 border-r border-border p-4 bg-secondary/20">
            <h4 className="text-sm font-semibold text-foreground mb-3">Layers</h4>
            <div className="space-y-2">
              {blueprint.layers.map(layer => (
                <div key={layer.id} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: layer.color }}
                  />
                  <span className="text-sm text-muted-foreground">{layer.name}</span>
                </div>
              ))}
            </div>
            
            <h4 className="text-sm font-semibold text-foreground mt-6 mb-3">Node Types</h4>
            <div className="space-y-2">
              {[
                { type: 'core', label: 'Core Structure' },
                { type: 'process', label: 'Process' },
                { type: 'document', label: 'Document' },
                { type: 'stakeholder', label: 'Stakeholder' },
                { type: 'risk', label: 'Risk' },
                { type: 'milestone', label: 'Milestone' },
              ].map(item => (
                <div key={item.type} className="flex items-center gap-2 text-muted-foreground">
                  {getNodeIcon(item.type as BlueprintNode['type'])}
                  <span className="text-sm">{item.label}</span>
                </div>
              ))}
            </div>
            
            <h4 className="text-sm font-semibold text-foreground mt-6 mb-3">Status</h4>
            <div className="space-y-2">
              {[
                { status: 'complete', label: 'Complete', color: 'text-green-500' },
                { status: 'in_progress', label: 'In Progress', color: 'text-blue-500' },
                { status: 'pending', label: 'Pending', color: 'text-foreground/60' },
                { status: 'blocked', label: 'Blocked', color: 'text-red-500' },
              ].map(item => (
                <div key={item.status} className="flex items-center gap-2">
                  {getStatusIcon(item.status as BlueprintNode['status'])}
                  <span className={`text-sm ${item.color}`}>{item.label}</span>
                </div>
              ))}
            </div>

            {/* Selected Node Details */}
            {selectedNode && (
              <div className="mt-6 p-3 bg-card border border-border rounded-lg">
                <h4 className="text-sm font-semibold text-foreground mb-2">Selected Node</h4>
                {(() => {
                  const node = blueprint.nodes.find(n => n.id === selectedNode);
                  if (!node) return null;
                  return (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-foreground">{node.label}</p>
                      {node.description && (
                        <p className="text-xs text-muted-foreground">{node.description}</p>
                      )}
                      <div className="flex items-center gap-2">
                        {getStatusIcon(node.status)}
                        <span className="text-xs capitalize">{node.status || 'pending'}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}

        {/* Blueprint Canvas */}
        <div className="flex-1 overflow-auto bg-background/50 p-4" style={{ minHeight: '600px' }}>
          <div 
            className="relative" 
            style={{ 
              transform: `scale(${zoom})`, 
              transformOrigin: 'top left',
              width: '750px',
              height: '550px'
            }}
          >
            {/* SVG for connections */}
            <svg 
              className="absolute inset-0 pointer-events-none" 
              width="750" 
              height="550"
              style={{ overflow: 'visible' }}
            >
              {renderConnections()}
            </svg>

            {/* Layer backgrounds */}
            {blueprint.layers.map((layer, index) => (
              <div
                key={layer.id}
                className="absolute left-0 right-0 rounded-lg opacity-10"
                style={{
                  top: `${index * 100 + 50}px`,
                  height: '90px',
                  backgroundColor: layer.color,
                }}
              />
            ))}

            {/* Layer labels */}
            {blueprint.layers.map((layer, index) => (
              <div
                key={`label-${layer.id}`}
                className="absolute left-2 text-xs font-medium opacity-60"
                style={{
                  top: `${index * 100 + 55}px`,
                  color: layer.color,
                }}
              >
                {layer.name}
              </div>
            ))}

            {/* Nodes */}
            {blueprint.nodes.map(node => {
              const layer = blueprint.layers.find(l => l.nodes.includes(node.id));
              const isSelected = selectedNode === node.id;
              
              return (
                <div
                  key={node.id}
                  className={`absolute cursor-pointer transition-all duration-200 ${
                    isSelected ? 'z-10 scale-110' : 'hover:scale-105'
                  }`}
                  style={{
                    left: `${node.position.x}px`,
                    top: `${node.position.y}px`,
                  }}
                  onClick={() => setSelectedNode(isSelected ? null : node.id)}
                >
                  <div 
                    className={`px-3 py-2 rounded-lg border-2 bg-card shadow-lg min-w-[120px] ${
                      getStatusColor(node.status)
                    } ${isSelected ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`}
                    style={{ borderColor: layer?.color }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span style={{ color: layer?.color }}>
                        {getNodeIcon(node.type)}
                      </span>
                      <span className="text-xs font-semibold text-foreground truncate">
                        {node.label}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground truncate max-w-[80px]">
                        {node.description}
                      </span>
                      {getStatusIcon(node.status)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between p-3 border-t border-border bg-secondary/20 text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>{blueprint.nodes.length} nodes</span>
          <span>{blueprint.layers.length} layers</span>
          <span>
            {blueprint.nodes.filter(n => n.status === 'complete').length} complete
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span>Quality Management System Compliant</span>
          <Shield className="w-4 h-4 text-green-500" />
        </div>
      </div>
    </div>
  );
}

export default VisualBlueprint;
