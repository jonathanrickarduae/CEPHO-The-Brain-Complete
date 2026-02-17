/**
 * Document Template Selector
 * 
 * UI component for selecting and generating CEPHO branded documents
 */

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  FileText,
  BarChart3,
  Briefcase,
  Users,
  Sun,
  TrendingUp,
  Target,
  ChevronRight,
  Download,
  Eye,
  Sparkles
} from "lucide-react";

// =============================================================================
// TYPES
// =============================================================================

interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  category: "executive" | "operational" | "strategic" | "investor";
  icon: React.ElementType;
  fields: string[];
  sampleUseCase: string;
}

// =============================================================================
// TEMPLATE DEFINITIONS
// =============================================================================

const DOCUMENT_TEMPLATES: DocumentTemplate[] = [
  {
    id: "ceo-kpi-scorecard",
    name: "CEO KPI Scorecard",
    description: "Comprehensive performance scorecard with category breakdowns and trend analysis",
    category: "executive",
    icon: BarChart3,
    fields: ["Company Name", "Report Date", "Overall Score", "Category Scores", "Executive Summary", "Priority Actions"],
    sampleUseCase: "Monthly board reporting, performance reviews, strategic planning sessions"
  },
  {
    id: "briefing-paper",
    name: "Chief of Staff Briefing Paper",
    description: "Structured briefing document with executive summary, findings, and recommendations",
    category: "executive",
    icon: FileText,
    fields: ["Title", "Prepared For", "Classification", "Executive Summary", "Background", "Key Findings", "Recommendations"],
    sampleUseCase: "Decision support, stakeholder briefings, issue analysis"
  },
  {
    id: "sme-panel-review",
    name: "SME Panel Review Report",
    description: "Expert panel assessment with individual verdicts and consolidated recommendations",
    category: "operational",
    icon: Users,
    fields: ["Project Name", "Panel Members", "Overall Verdict", "Strengths", "Areas for Improvement", "Expert Comments"],
    sampleUseCase: "Quality gates, project reviews, expert assessments"
  },
  {
    id: "morning-signal",
    name: "Morning Signal Briefing",
    description: "Daily executive briefing with priorities, schedule, and overnight updates",
    category: "operational",
    icon: Sun,
    fields: ["Date", "Wellness Score", "Priorities", "Calendar", "Insights", "Overnight Updates"],
    sampleUseCase: "Daily start routine, executive preparation, day planning"
  },
  {
    id: "investor-update",
    name: "Investor Update",
    description: "Periodic investor communication with metrics, achievements, and outlook",
    category: "investor",
    icon: TrendingUp,
    fields: ["Company Name", "Period", "Highlights", "Key Metrics", "Achievements", "Challenges", "Outlook"],
    sampleUseCase: "Quarterly updates, fundraising communications, stakeholder reporting"
  },
  {
    id: "strategic-review",
    name: "Strategic Review",
    description: "Comprehensive strategic analysis with SWOT, options evaluation, and implementation timeline",
    category: "strategic",
    icon: Target,
    fields: ["Title", "Executive Summary", "Current State", "SWOT Analysis", "Strategic Options", "Recommendation", "Timeline"],
    sampleUseCase: "Strategic planning, market entry analysis, business pivots"
  }
];

const CATEGORY_COLORS = {
  executive: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  operational: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  strategic: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  investor: "bg-green-500/20 text-green-400 border-green-500/30"
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

interface DocumentTemplateSelectorProps {
  onSelectTemplate?: (templateId: string) => void;
  onGenerateDocument?: (templateId: string, data: Record<string, unknown>) => void;
}

export function DocumentTemplateSelector({ onSelectTemplate, onGenerateDocument }: DocumentTemplateSelectorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [filter, setFilter] = useState<string>("all");

  const filteredTemplates = filter === "all" 
    ? DOCUMENT_TEMPLATES 
    : DOCUMENT_TEMPLATES.filter(t => t.category === filter);

  const handleSelectTemplate = (template: DocumentTemplate) => {
    setSelectedTemplate(template);
    onSelectTemplate?.(template.id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-[#E91E8C]/20 to-purple-500/20 border border-[#E91E8C]/30">
            <FileText className="h-6 w-6 text-[#E91E8C]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Document Templates</h2>
            <p className="text-sm text-muted-foreground">CEPHO branded professional documents</p>
          </div>
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
          className={filter === "all" ? "bg-[#E91E8C]" : ""}
        >
          All Templates
        </Button>
        <Button
          variant={filter === "executive" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("executive")}
          className={filter === "executive" ? "bg-purple-500" : ""}
        >
          Executive
        </Button>
        <Button
          variant={filter === "operational" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("operational")}
          className={filter === "operational" ? "bg-blue-500" : ""}
        >
          Operational
        </Button>
        <Button
          variant={filter === "strategic" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("strategic")}
          className={filter === "strategic" ? "bg-amber-500" : ""}
        >
          Strategic
        </Button>
        <Button
          variant={filter === "investor" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("investor")}
          className={filter === "investor" ? "bg-green-500" : ""}
        >
          Investor
        </Button>
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map(template => {
          const Icon = template.icon;
          return (
            <Card 
              key={template.id} 
              className="bg-gray-900/50 border-gray-800 hover:border-[#E91E8C]/50 transition-all cursor-pointer group"
              onClick={() => handleSelectTemplate(template)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="p-2 rounded-lg bg-gray-800 group-hover:bg-[#E91E8C]/20 transition-colors">
                    <Icon className="h-5 w-5 text-[#E91E8C]" />
                  </div>
                  <Badge variant="outline" className={CATEGORY_COLORS[template.category]}>
                    {template.category}
                  </Badge>
                </div>
                <CardTitle className="text-white text-base mt-3">{template.name}</CardTitle>
                <CardDescription className="text-sm">{template.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{template.fields.length} fields</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-[#E91E8C] transition-colors" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Template Detail Dialog */}
      <Dialog open={!!selectedTemplate} onOpenChange={(open) => !open && setSelectedTemplate(null)}>
        <DialogContent className="bg-gray-900 border-gray-800 max-w-2xl">
          {selectedTemplate && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#E91E8C]/20">
                    <selectedTemplate.icon className="h-6 w-6 text-[#E91E8C]" />
                  </div>
                  <div>
                    <DialogTitle className="text-white">{selectedTemplate.name}</DialogTitle>
                    <DialogDescription>{selectedTemplate.description}</DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              
              <div className="space-y-4 mt-4">
                {/* Required Fields */}
                <div>
                  <h4 className="text-sm font-medium text-white mb-2">Required Fields</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedTemplate.fields.map(field => (
                      <Badge key={field} variant="outline" className="text-gray-300 border-gray-700">
                        {field}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                {/* Sample Use Case */}
                <div>
                  <h4 className="text-sm font-medium text-white mb-2">Sample Use Cases</h4>
                  <p className="text-sm text-muted-foreground">{selectedTemplate.sampleUseCase}</p>
                </div>
                
                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-gray-800">
                  <Button 
                    className="flex-1 bg-[#E91E8C] hover:bg-[#E91E8C]/90"
                    onClick={() => onGenerateDocument?.(selectedTemplate.id, {})}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate with AI
                  </Button>
                  <Button variant="outline" className="border-gray-700">
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                  <Button variant="outline" className="border-gray-700">
                    <Download className="h-4 w-4 mr-2" />
                    Download Blank
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default DocumentTemplateSelector;
