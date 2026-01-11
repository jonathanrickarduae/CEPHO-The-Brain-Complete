import React, { useEffect, useRef, useState } from 'react';
import { Download, ZoomIn, ZoomOut, Maximize2, Copy, Check, RefreshCw } from 'lucide-react';

interface MermaidDiagramProps {
  code: string;
  title?: string;
  onExport?: (format: 'svg' | 'png') => void;
}

// Mermaid diagram component that renders diagrams from Mermaid syntax
export function MermaidDiagram({ code, title, onExport }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [svgContent, setSvgContent] = useState<string>('');

  useEffect(() => {
    renderDiagram();
  }, [code]);

  const renderDiagram = async () => {
    if (!containerRef.current || !code) return;

    try {
      // Dynamic import mermaid
      const mermaid = (await import('mermaid')).default;
      
      mermaid.initialize({
        startOnLoad: false,
        theme: 'dark',
        themeVariables: {
          primaryColor: '#a855f7',
          primaryTextColor: '#fff',
          primaryBorderColor: '#7c3aed',
          lineColor: '#6b7280',
          secondaryColor: '#1f2937',
          tertiaryColor: '#111827',
          background: '#0a0a0a',
          mainBkg: '#1f2937',
          nodeBorder: '#4b5563',
          clusterBkg: '#1f2937',
          clusterBorder: '#4b5563',
          titleColor: '#f9fafb',
          edgeLabelBackground: '#1f2937',
        },
        flowchart: {
          htmlLabels: true,
          curve: 'basis',
        },
      });

      const id = `mermaid-${Date.now()}`;
      const { svg } = await mermaid.render(id, code);
      setSvgContent(svg);
      setError(null);
      
      if (containerRef.current) {
        containerRef.current.innerHTML = svg;
      }
    } catch (err) {
      console.error('Mermaid render error:', err);
      setError(err instanceof Error ? err.message : 'Failed to render diagram');
    }
  };

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportSVG = () => {
    if (!svgContent) return;
    
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || 'diagram'}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPNG = async () => {
    if (!svgContent) return;

    // Create canvas and convert SVG to PNG
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    const svgBlob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      canvas.width = img.width * 2; // 2x for better quality
      canvas.height = img.height * 2;
      ctx.scale(2, 2);
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      
      const pngUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = pngUrl;
      a.download = `${title || 'diagram'}.png`;
      a.click();
      URL.revokeObjectURL(url);
    };

    img.src = url;
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border bg-secondary/30">
        <div className="flex items-center gap-2">
          {title && <h4 className="font-medium text-foreground text-sm">{title}</h4>}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyCode}
            className="p-1.5 hover:bg-secondary rounded text-muted-foreground hover:text-foreground transition-colors"
            title="Copy Mermaid code"
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          </button>
          <button
            onClick={renderDiagram}
            className="p-1.5 hover:bg-secondary rounded text-muted-foreground hover:text-foreground transition-colors"
            title="Refresh diagram"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-1 border border-border rounded-lg p-0.5">
            <button
              onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}
              className="p-1 hover:bg-secondary rounded"
            >
              <ZoomOut className="w-3 h-3" />
            </button>
            <span className="text-xs text-muted-foreground w-10 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom(z => Math.min(2, z + 0.1))}
              className="p-1 hover:bg-secondary rounded"
            >
              <ZoomIn className="w-3 h-3" />
            </button>
          </div>
          <button
            onClick={handleExportSVG}
            className="px-2 py-1 text-xs bg-secondary hover:bg-secondary/80 rounded flex items-center gap-1"
          >
            <Download className="w-3 h-3" />
            SVG
          </button>
          <button
            onClick={handleExportPNG}
            className="px-2 py-1 text-xs bg-primary text-primary-foreground hover:bg-primary/90 rounded flex items-center gap-1"
          >
            <Download className="w-3 h-3" />
            PNG
          </button>
        </div>
      </div>

      {/* Diagram Container */}
      <div className="overflow-auto bg-background/50 p-4" style={{ minHeight: '300px', maxHeight: '600px' }}>
        {error ? (
          <div className="flex items-center justify-center h-full text-red-500 text-sm">
            <p>Error: {error}</p>
          </div>
        ) : (
          <div
            ref={containerRef}
            className="flex items-center justify-center"
            style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
          />
        )}
      </div>
    </div>
  );
}

// Helper function to generate Mermaid code from project data
export function generateProjectMermaid(projectData: {
  name: string;
  type: string;
  stages?: string[];
  stakeholders?: string[];
  documents?: string[];
  risks?: string[];
}): string {
  const { name, type, stages, stakeholders, documents, risks } = projectData;

  // Generate a flowchart showing project structure
  let mermaid = `flowchart TB
    subgraph Project["${name}"]
        direction TB
        TYPE["${type}"]
    end
`;

  if (stages && stages.length > 0) {
    mermaid += `
    subgraph Stages["Project Stages"]
        direction LR
`;
    stages.forEach((stage, i) => {
      mermaid += `        S${i}["${stage}"]\n`;
      if (i > 0) {
        mermaid += `        S${i-1} --> S${i}\n`;
      }
    });
    mermaid += `    end
    Project --> Stages
`;
  }

  if (stakeholders && stakeholders.length > 0) {
    mermaid += `
    subgraph Stakeholders["Key Stakeholders"]
        direction TB
`;
    stakeholders.forEach((sh, i) => {
      mermaid += `        SH${i}(["${sh}"])\n`;
    });
    mermaid += `    end
    Project --> Stakeholders
`;
  }

  if (documents && documents.length > 0) {
    mermaid += `
    subgraph Documents["Deliverables"]
        direction TB
`;
    documents.forEach((doc, i) => {
      mermaid += `        D${i}[/"${doc}"/]\n`;
    });
    mermaid += `    end
    Stages --> Documents
`;
  }

  if (risks && risks.length > 0) {
    mermaid += `
    subgraph Risks["Risk Areas"]
        direction TB
`;
    risks.forEach((risk, i) => {
      mermaid += `        R${i}{{"${risk}"}}\n`;
    });
    mermaid += `    end
    Project -.-> Risks
`;
  }

  return mermaid;
}

// Generate architecture diagram
export function generateArchitectureMermaid(layers: {
  name: string;
  components: string[];
}[]): string {
  let mermaid = `flowchart TB
`;

  layers.forEach((layer, layerIdx) => {
    mermaid += `
    subgraph L${layerIdx}["${layer.name}"]
        direction LR
`;
    layer.components.forEach((comp, compIdx) => {
      mermaid += `        L${layerIdx}C${compIdx}["${comp}"]\n`;
    });
    mermaid += `    end
`;
    if (layerIdx > 0) {
      mermaid += `    L${layerIdx-1} --> L${layerIdx}\n`;
    }
  });

  return mermaid;
}

// Generate process flow diagram
export function generateProcessFlowMermaid(steps: {
  id: string;
  label: string;
  type: 'start' | 'process' | 'decision' | 'end';
  next?: string[];
}[]): string {
  let mermaid = `flowchart TD
`;

  steps.forEach(step => {
    switch (step.type) {
      case 'start':
        mermaid += `    ${step.id}(("${step.label}"))\n`;
        break;
      case 'end':
        mermaid += `    ${step.id}((("${step.label}")))\n`;
        break;
      case 'decision':
        mermaid += `    ${step.id}{"${step.label}"}\n`;
        break;
      default:
        mermaid += `    ${step.id}["${step.label}"]\n`;
    }

    if (step.next) {
      step.next.forEach(nextId => {
        mermaid += `    ${step.id} --> ${nextId}\n`;
      });
    }
  });

  return mermaid;
}

// Generate entity relationship diagram
export function generateERDMermaid(entities: {
  name: string;
  attributes: string[];
  relationships?: { target: string; type: string; label?: string }[];
}[]): string {
  let mermaid = `erDiagram
`;

  entities.forEach(entity => {
    mermaid += `    ${entity.name.toUpperCase().replace(/\s+/g, '_')} {\n`;
    entity.attributes.forEach(attr => {
      mermaid += `        string ${attr.replace(/\s+/g, '_')}\n`;
    });
    mermaid += `    }\n`;
  });

  entities.forEach(entity => {
    if (entity.relationships) {
      entity.relationships.forEach(rel => {
        const fromName = entity.name.toUpperCase().replace(/\s+/g, '_');
        const toName = rel.target.toUpperCase().replace(/\s+/g, '_');
        mermaid += `    ${fromName} ${rel.type} ${toName} : "${rel.label || ''}"\n`;
      });
    }
  });

  return mermaid;
}

export default MermaidDiagram;
