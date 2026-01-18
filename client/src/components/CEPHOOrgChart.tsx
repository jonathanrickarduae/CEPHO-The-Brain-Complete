/**
 * CEPHO.Ai Organizational Chart
 * 
 * Visual representation of the unique CEPHO.Ai structure:
 * - One CEO (human at center)
 * - Virtual AI Chief of Staff (bridge layer)
 * - AI SME Expert Team (functional layer)
 * - Advisory Network (external world feeding in)
 * - AI Infrastructure (backend powering everything)
 * 
 * Structure: 1 Employee + 1 Virtual COS + AI SME Team
 */

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  User,
  Brain,
  Users,
  Globe,
  Server,
  ArrowDown,
  ArrowUp,
  Sparkles,
  Building2,
  Database,
  Network,
  Zap,
  MessageSquare,
  FileText,
  BarChart3,
  Shield,
  Briefcase,
  Scale,
  TrendingUp,
  Target,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Mic,
  Volume2
} from "lucide-react";

// =============================================================================
// TYPES
// =============================================================================

interface SMEExpert {
  id: string;
  name: string;
  role: string;
  icon: React.ElementType;
  color: string;
}

// =============================================================================
// DATA
// =============================================================================

const SME_EXPERTS: SMEExpert[] = [
  { id: "finance", name: "Finance", role: "CFO Expert", icon: BarChart3, color: "text-green-400" },
  { id: "legal", name: "Legal", role: "Legal Counsel", icon: Scale, color: "text-blue-400" },
  { id: "strategy", name: "Strategy", role: "Strategy Director", icon: Target, color: "text-purple-400" },
  { id: "operations", name: "Operations", role: "COO Expert", icon: Zap, color: "text-amber-400" },
  { id: "marketing", name: "Marketing", role: "CMO Expert", icon: TrendingUp, color: "text-pink-400" },
  { id: "hr", name: "People", role: "HR Director", icon: Users, color: "text-cyan-400" },
  { id: "tech", name: "Technology", role: "CTO Expert", icon: Server, color: "text-orange-400" },
  { id: "risk", name: "Risk", role: "Risk Manager", icon: Shield, color: "text-red-400" },
];

const ADVISORY_SOURCES = [
  "Industry Reports",
  "Market Data",
  "Expert Networks",
  "Research Papers",
  "News & Media",
  "Company Filings",
  "Economic Indicators",
  "Competitor Intel"
];

// =============================================================================
// MAIN COMPONENT
// =============================================================================

interface CEPHOOrgChartProps {
  variant?: "full" | "compact" | "minimal";
  showDetails?: boolean;
}

export function CEPHOOrgChart({ variant = "full", showDetails = true }: CEPHOOrgChartProps) {
  const [expanded, setExpanded] = useState(true);

  if (variant === "minimal") {
    return (
      <div className="flex flex-col items-center gap-4 p-6">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-[#E91E8C]/20 border-2 border-[#E91E8C] flex items-center justify-center mx-auto mb-2">
            <User className="h-8 w-8 text-[#E91E8C]" />
          </div>
          <p className="text-white font-bold">CEO</p>
          <p className="text-xs text-muted-foreground">1 Employee</p>
        </div>
        <ArrowDown className="h-6 w-6 text-gray-600" />
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-purple-500/20 border-2 border-purple-500 flex items-center justify-center mx-auto mb-2">
            <Brain className="h-8 w-8 text-purple-400" />
          </div>
          <p className="text-white font-bold">Virtual AI COS</p>
          <p className="text-xs text-muted-foreground">Chief of Staff</p>
        </div>
        <ArrowDown className="h-6 w-6 text-gray-600" />
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-cyan-500/20 border-2 border-cyan-500 flex items-center justify-center mx-auto mb-2">
            <Users className="h-8 w-8 text-cyan-400" />
          </div>
          <p className="text-white font-bold">AI SME Team</p>
          <p className="text-xs text-muted-foreground">8 Expert Domains</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">CEPHO.Ai Organization</h2>
        <p className="text-muted-foreground">The AI-Powered Executive Structure</p>
        <div className="flex justify-center gap-4 mt-4 flex-wrap">
          <Badge variant="outline" className="bg-[#E91E8C]/20 text-[#E91E8C] border-[#E91E8C]/30">
            1 Employee
          </Badge>
          <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
            Virtual COS
          </Badge>
          <Badge variant="outline" className="bg-amber-500/20 text-amber-400 border-amber-500/30">
            Head of Briefings
          </Badge>
          <Badge variant="outline" className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
            AI SME Team
          </Badge>
        </div>
      </div>

      {/* Main Org Chart */}
      <div className="relative">
        {/* Advisory Network - The World (Top Layer) */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Globe className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-400 uppercase tracking-wider">Advisory Network</span>
            <Globe className="h-5 w-5 text-gray-400" />
          </div>
          <div className="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto">
            {ADVISORY_SOURCES.map((source, idx) => (
              <Badge 
                key={idx} 
                variant="outline" 
                className="bg-gray-800/50 text-gray-400 border-gray-700 text-xs"
              >
                {source}
              </Badge>
            ))}
          </div>
          <div className="flex justify-center my-4">
            <div className="flex flex-col items-center">
              <ArrowDown className="h-6 w-6 text-gray-600" />
              <span className="text-xs text-gray-500">Data & Intelligence</span>
            </div>
          </div>
        </div>

        {/* CEO Box - The Human at Center */}
        <div className="flex justify-center mb-8">
          <Card className="bg-gradient-to-br from-[#E91E8C]/20 to-[#E91E8C]/5 border-2 border-[#E91E8C] w-64">
            <CardContent className="pt-6 text-center">
              <div className="w-20 h-20 rounded-full bg-[#E91E8C]/30 border-2 border-[#E91E8C] flex items-center justify-center mx-auto mb-4">
                <User className="h-10 w-10 text-[#E91E8C]" />
              </div>
              <h3 className="text-xl font-bold text-white">CEO</h3>
              <p className="text-sm text-[#E91E8C]">The Human at Center</p>
              <Badge className="mt-3 bg-[#E91E8C]">1 Employee</Badge>
            </CardContent>
          </Card>
        </div>

        {/* Connection Line */}
        <div className="flex justify-center mb-4">
          <div className="flex flex-col items-center">
            <div className="w-0.5 h-8 bg-gradient-to-b from-[#E91E8C] to-purple-500"></div>
            <div className="flex items-center gap-2 bg-gray-900 px-3 py-1 rounded-full border border-gray-700">
              <Sparkles className="h-3 w-3 text-purple-400" />
              <span className="text-xs text-gray-400">AI Executive Layer</span>
            </div>
          </div>
        </div>

        {/* AI Executive Layer - COS and Victoria side by side */}
        <div className="flex justify-center gap-6 mb-8 flex-wrap">
          {/* Virtual AI Chief of Staff */}
          <Card className="bg-gradient-to-br from-purple-500/20 to-purple-500/5 border-2 border-purple-500 w-72">
            <CardContent className="pt-6 text-center">
              <div className="w-16 h-16 rounded-full bg-purple-500/30 border-2 border-purple-500 flex items-center justify-center mx-auto mb-3">
                <Brain className="h-8 w-8 text-purple-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Virtual Chief of Staff</h3>
              <p className="text-sm text-purple-400">Research & Coordination</p>
              <div className="mt-3 flex flex-wrap justify-center gap-1">
                <Badge variant="outline" className="text-xs border-purple-500/30 text-purple-300">Analysis</Badge>
                <Badge variant="outline" className="text-xs border-purple-500/30 text-purple-300">Execution</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Victoria - Head of Briefings */}
          <Card className="bg-gradient-to-br from-amber-500/20 to-amber-500/5 border-2 border-amber-500 w-72">
            <CardContent className="pt-6 text-center">
              <div className="w-16 h-16 rounded-full bg-amber-500/30 border-2 border-amber-500 flex items-center justify-center mx-auto mb-3">
                <Mic className="h-8 w-8 text-amber-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Victoria</h3>
              <p className="text-sm text-amber-400">Head of Briefings</p>
              <div className="mt-3 flex flex-wrap justify-center gap-1">
                <Badge variant="outline" className="text-xs border-amber-500/30 text-amber-300">Voice Briefings</Badge>
                <Badge variant="outline" className="text-xs border-amber-500/30 text-amber-300">Updates</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Connection to SME Team */}
        <div className="flex justify-center mb-4">
          <div className="flex flex-col items-center">
            <div className="w-0.5 h-8 bg-gradient-to-b from-purple-500 to-cyan-500"></div>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-gray-700 text-gray-400"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? <ChevronUp className="h-4 w-4 mr-1" /> : <ChevronDown className="h-4 w-4 mr-1" />}
              {expanded ? "Collapse" : "Expand"} SME Team
            </Button>
          </div>
        </div>

        {/* AI SME Expert Team */}
        {expanded && (
          <div className="mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Users className="h-5 w-5 text-cyan-400" />
              <span className="text-sm text-cyan-400 uppercase tracking-wider">AI SME Expert Team</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
              {SME_EXPERTS.map((expert) => {
                const Icon = expert.icon;
                return (
                  <Card key={expert.id} className="bg-gray-900/50 border-gray-800 hover:border-cyan-500/50 transition-colors">
                    <CardContent className="pt-4 text-center">
                      <div className={`w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center mx-auto mb-2`}>
                        <Icon className={`h-5 w-5 ${expert.color}`} />
                      </div>
                      <p className="text-sm font-medium text-white">{expert.name}</p>
                      <p className="text-xs text-muted-foreground">{expert.role}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* AI Infrastructure - Backend Layer */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Server className="h-5 w-5 text-gray-500" />
            <span className="text-sm text-gray-500 uppercase tracking-wider">AI Infrastructure Layer</span>
          </div>
          <div className="flex justify-center gap-4 flex-wrap">
            <Badge variant="outline" className="bg-gray-900 text-gray-500 border-gray-800">
              <Database className="h-3 w-3 mr-1" /> Knowledge Base
            </Badge>
            <Badge variant="outline" className="bg-gray-900 text-gray-500 border-gray-800">
              <Network className="h-3 w-3 mr-1" /> Neural Networks
            </Badge>
            <Badge variant="outline" className="bg-gray-900 text-gray-500 border-gray-800">
              <Zap className="h-3 w-3 mr-1" /> Processing Engine
            </Badge>
            <Badge variant="outline" className="bg-gray-900 text-gray-500 border-gray-800">
              <Shield className="h-3 w-3 mr-1" /> Security Layer
            </Badge>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      {showDetails && (
        <Card className="bg-gray-900/50 border-gray-800 mt-8">
          <CardContent className="pt-6">
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-3xl font-bold text-[#E91E8C]">1</p>
                <p className="text-sm text-muted-foreground">Human Employee</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-purple-400">1</p>
                <p className="text-sm text-muted-foreground">Virtual COS</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-amber-400">1</p>
                <p className="text-sm text-muted-foreground">Head of Briefings</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-cyan-400">8+</p>
                <p className="text-sm text-muted-foreground">AI SME Experts</p>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-800 text-center">
              <p className="text-sm text-muted-foreground">
                <span className="text-white font-medium">The CEPHO Model:</span> One human CEO amplified by AI infrastructure, 
                with a Virtual Chief of Staff handling research and coordination, Victoria delivering all briefings, 
                and an unlimited AI expert team connected to the world's advisory network.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default CEPHOOrgChart;
