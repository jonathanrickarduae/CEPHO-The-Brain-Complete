import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Target,
  AlertTriangle,
  CheckCircle2,
  Clock,
  BarChart3,
  PieChart,
  ArrowRight,
  Plus,
  Edit,
  Sparkles,
  Users,
  Rocket,
} from "lucide-react";

interface StartupMetrics {
  id: string;
  name: string;
  monthlyBurn: number;
  cashOnHand: number;
  runway: number; // months
  mrr: number;
  mrrGrowth: number; // percentage
  customers: number;
  customerGrowth: number;
  churnRate: number;
  cac: number;
  ltv: number;
  teamSize: number;
  lastUpdated: string;
  targets: {
    mrr: number;
    customers: number;
    runway: number;
  };
  milestones: {
    name: string;
    target: string;
    status: "completed" | "in-progress" | "upcoming";
  }[];
}

// Sample data - in production this would come from the database
const sampleStartups: StartupMetrics[] = [
  {
    id: "celadon",
    name: "Project A Ajman",
    monthlyBurn: 85000,
    cashOnHand: 250000,
    runway: 3,
    mrr: 0,
    mrrGrowth: 0,
    customers: 0,
    customerGrowth: 0,
    churnRate: 0,
    cac: 0,
    ltv: 0,
    teamSize: 8,
    lastUpdated: "2 hours ago",
    targets: {
      mrr: 500000,
      customers: 50,
      runway: 18,
    },
    milestones: [
      { name: "Series A Close", target: "Q2 2026", status: "in-progress" },
      { name: "Facility Construction", target: "Q3 2026", status: "upcoming" },
      { name: "First Production", target: "Q4 2026", status: "upcoming" },
      { name: "Revenue Start", target: "Q1 2027", status: "upcoming" },
    ],
  },
  {
    id: "boundless",
    name: "Sample Project Mobile",
    monthlyBurn: 25000,
    cashOnHand: 75000,
    runway: 3,
    mrr: 0,
    mrrGrowth: 0,
    customers: 0,
    customerGrowth: 0,
    churnRate: 0,
    cac: 0,
    ltv: 0,
    teamSize: 3,
    lastUpdated: "1 day ago",
    targets: {
      mrr: 50000,
      customers: 1000,
      runway: 12,
    },
    milestones: [
      { name: "MVP Launch", target: "Q1 2026", status: "in-progress" },
      { name: "First B2B Client", target: "Q2 2026", status: "upcoming" },
      { name: "Pre-seed Close", target: "Q2 2026", status: "upcoming" },
      { name: "Consumer Launch", target: "Q3 2026", status: "upcoming" },
    ],
  },
];

function formatCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`;
  }
  return `$${amount}`;
}

function getRunwayColor(months: number): string {
  if (months <= 3) return "text-red-500";
  if (months <= 6) return "text-amber-500";
  if (months <= 12) return "text-yellow-500";
  return "text-green-500";
}

function getRunwayBgColor(months: number): string {
  if (months <= 3) return "bg-red-500";
  if (months <= 6) return "bg-amber-500";
  if (months <= 12) return "bg-yellow-500";
  return "bg-green-500";
}

function StartupCard({ startup }: { startup: StartupMetrics }) {
  const runwayPercent = Math.min((startup.runway / startup.targets.runway) * 100, 100);
  const mrrPercent = startup.targets.mrr > 0 
    ? Math.min((startup.mrr / startup.targets.mrr) * 100, 100) 
    : 0;
  const customersPercent = startup.targets.customers > 0 
    ? Math.min((startup.customers / startup.targets.customers) * 100, 100) 
    : 0;

  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <Rocket className="h-5 w-5 text-fuchsia-400" />
            {startup.name}
          </CardTitle>
          <Badge 
            className={`${
              startup.runway <= 3 
                ? "bg-red-500/20 text-red-400 border-red-500/30" 
                : startup.runway <= 6 
                ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                : "bg-green-500/20 text-green-400 border-green-500/30"
            }`}
          >
            {startup.runway}mo runway
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-foreground/70 text-xs mb-1">
              <DollarSign className="h-3 w-3" />
              Monthly Burn
            </div>
            <p className="text-lg font-semibold text-white">
              {formatCurrency(startup.monthlyBurn)}
            </p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-foreground/70 text-xs mb-1">
              <BarChart3 className="h-3 w-3" />
              Cash on Hand
            </div>
            <p className="text-lg font-semibold text-white">
              {formatCurrency(startup.cashOnHand)}
            </p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-foreground/70 text-xs mb-1">
              <Users className="h-3 w-3" />
              Team Size
            </div>
            <p className="text-lg font-semibold text-white">{startup.teamSize}</p>
          </div>
        </div>

        {/* Runway Progress */}
        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-foreground/70">Runway Progress</span>
            <span className={getRunwayColor(startup.runway)}>
              {startup.runway} / {startup.targets.runway} months
            </span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className={`h-full ${getRunwayBgColor(startup.runway)} transition-all`}
              style={{ width: `${runwayPercent}%` }}
            />
          </div>
        </div>

        {/* MRR Progress (if applicable) */}
        {startup.targets.mrr > 0 && (
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-foreground/70">MRR Target</span>
              <span className="text-white">
                {formatCurrency(startup.mrr)} / {formatCurrency(startup.targets.mrr)}
              </span>
            </div>
            <Progress value={mrrPercent} className="h-2" />
          </div>
        )}

        {/* Milestones */}
        <div>
          <p className="text-sm text-foreground/70 mb-2 flex items-center gap-1.5">
            <Target className="h-3 w-3" /> Key Milestones
          </p>
          <div className="space-y-2">
            {startup.milestones.slice(0, 3).map((milestone, idx) => (
              <div 
                key={idx} 
                className="flex items-center justify-between text-sm bg-gray-800/30 rounded-lg px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  {milestone.status === "completed" ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : milestone.status === "in-progress" ? (
                    <Clock className="h-4 w-4 text-amber-500" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border-2 border-gray-600" />
                  )}
                  <span className="text-foreground/80">{milestone.name}</span>
                </div>
                <span className="text-foreground/60 text-xs">{milestone.target}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-800">
          <span className="text-xs text-foreground/60 flex items-center gap-1">
            <Clock className="h-3 w-3" /> Updated {startup.lastUpdated}
          </span>
          <Button variant="ghost" size="sm" className="text-fuchsia-400 hover:text-fuchsia-300">
            <Edit className="h-3 w-3 mr-1" /> Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface StartupHealthDashboardProps {
  projectId?: string;
  projectName?: string;
}

export default function StartupHealthDashboard({ projectId, projectName }: StartupHealthDashboardProps) {
  const [startups, setStartups] = useState<StartupMetrics[]>(sampleStartups);
  const [showAddDialog, setShowAddDialog] = useState(false);

  // Calculate portfolio totals
  const totalBurn = startups.reduce((acc, s) => acc + s.monthlyBurn, 0);
  const totalCash = startups.reduce((acc, s) => acc + s.cashOnHand, 0);
  const avgRunway = startups.length > 0 
    ? startups.reduce((acc, s) => acc + s.runway, 0) / startups.length 
    : 0;
  const criticalRunway = startups.filter(s => s.runway <= 3).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-fuchsia-400" />
            Startup Health Dashboard
          </h2>
          <p className="text-sm text-foreground/70 mt-1">
            Track runway, burn rate, and key metrics across your ventures
          </p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="bg-fuchsia-500 hover:bg-fuchsia-600">
              <Plus className="h-4 w-4 mr-2" /> Add Startup
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-gray-800">
            <DialogHeader>
              <DialogTitle>Add New Startup</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label>Startup Name</Label>
                <Input placeholder="Enter startup name" className="bg-gray-800 border-gray-700" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Monthly Burn ($)</Label>
                  <Input type="number" placeholder="50000" className="bg-gray-800 border-gray-700" />
                </div>
                <div>
                  <Label>Cash on Hand ($)</Label>
                  <Input type="number" placeholder="500000" className="bg-gray-800 border-gray-700" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Team Size</Label>
                  <Input type="number" placeholder="5" className="bg-gray-800 border-gray-700" />
                </div>
                <div>
                  <Label>Target Runway (months)</Label>
                  <Input type="number" placeholder="18" className="bg-gray-800 border-gray-700" />
                </div>
              </div>
              <Button className="w-full bg-fuchsia-500 hover:bg-fuchsia-600" onClick={() => setShowAddDialog(false)}>
                Add Startup
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <TrendingDown className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <p className="text-xl font-bold text-white">{formatCurrency(totalBurn)}</p>
                <p className="text-xs text-foreground/60">Total Monthly Burn</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-xl font-bold text-white">{formatCurrency(totalCash)}</p>
                <p className="text-xs text-foreground/60">Total Cash</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-xl font-bold text-white">{avgRunway.toFixed(1)}mo</p>
                <p className="text-xs text-foreground/60">Avg Runway</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 ${criticalRunway > 0 ? "bg-red-500/20" : "bg-green-500/20"} rounded-lg`}>
                <AlertTriangle className={`h-5 w-5 ${criticalRunway > 0 ? "text-red-400" : "text-green-400"}`} />
              </div>
              <div>
                <p className="text-xl font-bold text-white">{criticalRunway}</p>
                <p className="text-xs text-foreground/60">Critical (&lt;3mo)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Startup Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        {startups.map((startup) => (
          <StartupCard key={startup.id} startup={startup} />
        ))}
      </div>

      {/* Empty State */}
      {startups.length === 0 && (
        <Card className="bg-gray-900/50 border-gray-800 border-dashed">
          <CardContent className="p-8 text-center">
            <Rocket className="h-12 w-12 mx-auto mb-4 text-foreground/50" />
            <h3 className="text-lg font-semibold text-white mb-2">No startups tracked yet</h3>
            <p className="text-foreground/70 mb-4">
              Add your first startup to track runway, burn rate, and key metrics
            </p>
            <Button 
              className="bg-fuchsia-500 hover:bg-fuchsia-600"
              onClick={() => setShowAddDialog(true)}
            >
              <Plus className="h-4 w-4 mr-2" /> Add Your First Startup
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
