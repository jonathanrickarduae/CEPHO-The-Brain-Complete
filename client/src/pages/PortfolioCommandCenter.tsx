import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StartupHealthDashboard from '@/components/project-management/StartupHealthDashboard';
import {
  Building2,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Clock,
  DollarSign,
  Users,
  Target,
  ArrowRight,
  BarChart3,
  Calendar,
  FileText,
  Briefcase,
  Rocket,
  Shield,
  Globe,
  Leaf,
  Phone,
  Home,
  Droplets,
  Sparkles,
} from "lucide-react";
import { Link } from "wouter";

// Venture data structure
interface Venture {
  id: string;
  name: string;
  description: string;
  status: "active" | "planning" | "on-hold" | "completed";
  health: "green" | "amber" | "red";
  stage: string;
  icon: React.ReactNode;
  metrics: {
    label: string;
    value: string;
    trend?: "up" | "down" | "neutral";
  }[];
  nextActions: string[];
  blockers: string[];
  runway?: string;
  fundingStage?: string;
  teamSize?: number;
  lastUpdated: string;
}

// Portfolio ventures data
const ventures: Venture[] = [
  {
    id: "celadon",
    name: "Project A Ajman",
    description: "Medical cannabis facility in UAE - manufacturing, testing, R&D",
    status: "active",
    health: "green",
    stage: "Series A",
    icon: <Leaf className="h-5 w-5 text-green-500" />,
    metrics: [
      { label: "Target Raise", value: "$12M", trend: "neutral" },
      { label: "Year 3 Revenue", value: "$65.3M", trend: "up" },
      { label: "Projected ROI", value: "27x", trend: "up" },
    ],
    nextActions: [
      "Finalize investor deck v2",
      "Schedule investor meetings",
      "Complete regulatory pathway documentation",
    ],
    blockers: [],
    fundingStage: "Series A - Active",
    teamSize: 8,
    lastUpdated: "2 hours ago",
  },
  {
    id: "boundless",
    name: "Sample Project Mobile",
    description: "eSIM/MVNO platform for GCC market - B2B and consumer",
    status: "active",
    health: "amber",
    stage: "Pre-Seed",
    icon: <Phone className="h-5 w-5 text-blue-500" />,
    metrics: [
      { label: "Target Raise", value: "$500K", trend: "neutral" },
      { label: "B2B Pipeline", value: "3 LOIs", trend: "up" },
      { label: "Launch Target", value: "Q2 2026", trend: "neutral" },
    ],
    nextActions: [
      "Complete technical architecture",
      "Finalize MVNO partnership terms",
      "Build MVP for B2B pilot",
    ],
    blockers: ["Awaiting telecom license approval"],
    fundingStage: "Pre-Seed - Preparing",
    teamSize: 3,
    lastUpdated: "1 day ago",
  },
  {
    id: "perfect-dxb",
    name: "Perfect DXB",
    description: "Premium real estate development and investment in Dubai",
    status: "active",
    health: "green",
    stage: "Operating",
    icon: <Home className="h-5 w-5 text-amber-500" />,
    metrics: [
      { label: "Active Projects", value: "2", trend: "neutral" },
      { label: "Portfolio Value", value: "$4.2M", trend: "up" },
      { label: "ROI YTD", value: "18%", trend: "up" },
    ],
    nextActions: [
      "Review Q1 property valuations",
      "Evaluate new acquisition opportunity",
    ],
    blockers: [],
    fundingStage: "Self-funded",
    teamSize: 2,
    lastUpdated: "3 days ago",
  },
  {
    id: "ampora",
    name: "Project C",
    description: "Water technology and sustainability solutions",
    status: "planning",
    health: "amber",
    stage: "Concept",
    icon: <Droplets className="h-5 w-5 text-cyan-500" />,
    metrics: [
      { label: "Market Size", value: "$2.1B", trend: "up" },
      { label: "Patent Status", value: "Pending", trend: "neutral" },
      { label: "Pilot Interest", value: "2 LOIs", trend: "up" },
    ],
    nextActions: [
      "Complete technical feasibility study",
      "Identify strategic partners",
      "Develop go-to-market strategy",
    ],
    blockers: ["Technical validation pending"],
    fundingStage: "Pre-revenue",
    teamSize: 1,
    lastUpdated: "1 week ago",
  },
  {
    id: "project-5",
    name: "Project Genesis Pipeline",
    description: "New venture ideas in Innovation Hub awaiting development",
    status: "planning",
    health: "green",
    stage: "Ideation",
    icon: <Sparkles className="h-5 w-5 text-purple-500" />,
    metrics: [
      { label: "Ideas in Hub", value: "12", trend: "up" },
      { label: "Ready for Brief", value: "3", trend: "neutral" },
      { label: "Avg. Score", value: "72%", trend: "up" },
    ],
    nextActions: [
      "Review top 3 ideas with SME panel",
      "Generate investment briefs",
      "Prioritize for Q2 development",
    ],
    blockers: [],
    lastUpdated: "Today",
  },
];

// Calculate portfolio summary
const portfolioSummary = {
  totalVentures: ventures.length,
  activeVentures: ventures.filter((v) => v.status === "active").length,
  healthyVentures: ventures.filter((v) => v.health === "green").length,
  totalBlockers: ventures.reduce((acc, v) => acc + v.blockers.length, 0),
  totalNextActions: ventures.reduce((acc, v) => acc + v.nextActions.length, 0),
};

function getHealthColor(health: string) {
  switch (health) {
    case "green":
      return "bg-green-500";
    case "amber":
      return "bg-amber-500";
    case "red":
      return "bg-red-500";
    default:
      return "bg-gray-500";
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case "active":
      return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Active</Badge>;
    case "planning":
      return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Planning</Badge>;
    case "on-hold":
      return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">On Hold</Badge>;
    case "completed":
      return <Badge className="bg-gray-500/20 text-foreground/70 border-gray-500/30">Completed</Badge>;
    default:
      return null;
  }
}

function VentureCard({ venture }: { venture: Venture }) {
  return (
    <Card className="bg-gray-900/50 border-gray-800 hover:border-gray-700 transition-all">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-800 rounded-lg">{venture.icon}</div>
            <div>
              <CardTitle className="text-lg font-semibold text-white">
                {venture.name}
              </CardTitle>
              <p className="text-sm text-foreground/70 mt-0.5">{venture.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${getHealthColor(venture.health)}`} />
            {getStatusBadge(venture.status)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Metrics */}
        <div className="grid grid-cols-3 gap-3">
          {venture.metrics.map((metric, idx) => (
            <div key={idx} className="bg-gray-800/50 rounded-lg p-2.5">
              <p className="text-xs text-foreground/60">{metric.label}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-sm font-semibold text-white">{metric.value}</span>
                {metric.trend === "up" && <TrendingUp className="h-3 w-3 text-green-500" />}
                {metric.trend === "down" && <TrendingDown className="h-3 w-3 text-red-500" />}
              </div>
            </div>
          ))}
        </div>

        {/* Next Actions */}
        {venture.nextActions.length > 0 && (
          <div>
            <p className="text-xs text-foreground/60 mb-2 flex items-center gap-1.5">
              <Target className="h-3 w-3" /> Next Actions
            </p>
            <ul className="space-y-1">
              {venture.nextActions.slice(0, 2).map((action, idx) => (
                <li key={idx} className="text-sm text-foreground/80 flex items-start gap-2">
                  <ArrowRight className="h-3 w-3 mt-1 text-fuchsia-500 shrink-0" />
                  {action}
                </li>
              ))}
              {venture.nextActions.length > 2 && (
                <li className="text-xs text-foreground/60">
                  +{venture.nextActions.length - 2} more actions
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Blockers */}
        {venture.blockers.length > 0 && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-2.5">
            <p className="text-xs text-red-400 mb-1.5 flex items-center gap-1.5">
              <AlertTriangle className="h-3 w-3" /> Blockers
            </p>
            <ul className="space-y-1">
              {venture.blockers.map((blocker, idx) => (
                <li key={idx} className="text-sm text-red-300">
                  {blocker}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-800">
          <div className="flex items-center gap-4 text-xs text-foreground/60">
            {venture.teamSize && (
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" /> {venture.teamSize}
              </span>
            )}
            {venture.fundingStage && (
              <span className="flex items-center gap-1">
                <DollarSign className="h-3 w-3" /> {venture.fundingStage}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" /> {venture.lastUpdated}
            </span>
          </div>
          <Button variant="ghost" size="sm" className="text-fuchsia-400 hover:text-fuchsia-300">
            View Details <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function PortfolioCommandCenter() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-br from-fuchsia-500/20 to-purple-500/20 rounded-lg">
            <Briefcase className="h-6 w-6 text-fuchsia-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Portfolio Command Center</h1>
            <p className="text-foreground/70 text-sm">
              Unified view of all ventures, investments, and strategic initiatives
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Building2 className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{portfolioSummary.totalVentures}</p>
                <p className="text-xs text-foreground/60">Total Ventures</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Rocket className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{portfolioSummary.activeVentures}</p>
                <p className="text-xs text-foreground/60">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{portfolioSummary.healthyVentures}</p>
                <p className="text-xs text-foreground/60">Healthy</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/20 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{portfolioSummary.totalBlockers}</p>
                <p className="text-xs text-foreground/60">Blockers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-fuchsia-500/20 rounded-lg">
                <Target className="h-5 w-5 text-fuchsia-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{portfolioSummary.totalNextActions}</p>
                <p className="text-xs text-foreground/60">Actions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-gray-900/50 border border-gray-800">
          <TabsTrigger value="overview" className="data-[state=active]:bg-fuchsia-500/20">
            <BarChart3 className="h-4 w-4 mr-2" /> Overview
          </TabsTrigger>
          <TabsTrigger value="ventures" className="data-[state=active]:bg-fuchsia-500/20">
            <Building2 className="h-4 w-4 mr-2" /> Ventures
          </TabsTrigger>
          <TabsTrigger value="actions" className="data-[state=active]:bg-fuchsia-500/20">
            <Target className="h-4 w-4 mr-2" /> Actions
          </TabsTrigger>
          <TabsTrigger value="blockers" className="data-[state=active]:bg-fuchsia-500/20">
            <AlertTriangle className="h-4 w-4 mr-2" /> Blockers
          </TabsTrigger>
          <TabsTrigger value="health" className="data-[state=active]:bg-fuchsia-500/20">
            <Rocket className="h-4 w-4 mr-2" /> Health
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Venture Cards Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {ventures.map((venture) => (
              <VentureCard key={venture.id} venture={venture} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="ventures" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {ventures.map((venture) => (
              <VentureCard key={venture.id} venture={venture} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="actions" className="space-y-4">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5 text-fuchsia-400" />
                All Next Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ventures.map((venture) =>
                  venture.nextActions.map((action, idx) => (
                    <div
                      key={`${venture.id}-${idx}`}
                      className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-lg"
                    >
                      <div className="p-1.5 bg-gray-700 rounded">{venture.icon}</div>
                      <div className="flex-1">
                        <p className="text-sm text-white">{action}</p>
                        <p className="text-xs text-foreground/60 mt-1">{venture.name}</p>
                      </div>
                      <Button variant="ghost" size="sm" className="text-fuchsia-400">
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="blockers" className="space-y-4">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-400" />
                Active Blockers
              </CardTitle>
            </CardHeader>
            <CardContent>
              {portfolioSummary.totalBlockers === 0 ? (
                <div className="text-center py-8 text-foreground/60">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-green-500" />
                  <p>No active blockers across portfolio</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {ventures
                    .filter((v) => v.blockers.length > 0)
                    .map((venture) =>
                      venture.blockers.map((blocker, idx) => (
                        <div
                          key={`${venture.id}-${idx}`}
                          className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg"
                        >
                          <div className="p-1.5 bg-red-500/20 rounded">
                            <AlertTriangle className="h-4 w-4 text-red-400" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-white">{blocker}</p>
                            <p className="text-xs text-foreground/60 mt-1">{venture.name}</p>
                          </div>
                          <Button variant="ghost" size="sm" className="text-red-400">
                            Resolve
                          </Button>
                        </div>
                      ))
                    )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health" className="space-y-4">
          <StartupHealthDashboard />
        </TabsContent>
      </Tabs>

      {/* Quick Links */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        <Link href="/innovation-hub">
          <Button variant="outline" className="w-full justify-start border-gray-800 hover:bg-gray-900">
            <Sparkles className="h-4 w-4 mr-2 text-purple-400" />
            Innovation Hub
          </Button>
        </Link>
        <Link href="/project-genesis">
          <Button variant="outline" className="w-full justify-start border-gray-800 hover:bg-gray-900">
            <Rocket className="h-4 w-4 mr-2 text-green-400" />
            Project Genesis
          </Button>
        </Link>
        <Link href="/workflow">
          <Button variant="outline" className="w-full justify-start border-gray-800 hover:bg-gray-900">
            <BarChart3 className="h-4 w-4 mr-2 text-blue-400" />
            Workflow
          </Button>
        </Link>
        <Link href="/library">
          <Button variant="outline" className="w-full justify-start border-gray-800 hover:bg-gray-900">
            <FileText className="h-4 w-4 mr-2 text-amber-400" />
            Library
          </Button>
        </Link>
      </div>
    </div>
  );
}
