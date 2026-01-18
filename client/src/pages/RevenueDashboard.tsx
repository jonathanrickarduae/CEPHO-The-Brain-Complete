import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Users, 
  Target,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Building2,
  CreditCard,
  PieChart,
  BarChart3,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Zap,
  RefreshCw
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

// Demo data for initial display
const demoVentures = [
  { name: "CEPHO.Ai", mrr: 0, arr: 0, status: "pre_revenue", customers: 1, stage: "MVP" },
  { name: "Celadon", mrr: 45000, arr: 540000, status: "active", customers: 12, stage: "Growth" },
  { name: "Boundless AI", mrr: 0, arr: 0, status: "planned", customers: 0, stage: "Concept" },
  { name: "Perfect DXB", mrr: 28000, arr: 336000, status: "active", customers: 8, stage: "Established" },
];

const demoPipeline = [
  { name: "Enterprise Client A", venture: "Celadon", value: 120000, stage: "proposal", probability: 60 },
  { name: "Government Contract B", venture: "Perfect DXB", value: 450000, stage: "negotiation", probability: 40 },
  { name: "SaaS Pilot C", venture: "CEPHO.Ai", value: 24000, stage: "qualified", probability: 25 },
  { name: "Consulting Project D", venture: "Celadon", value: 85000, stage: "verbal_yes", probability: 80 },
];

const stageColors: Record<string, string> = {
  lead: "bg-gray-500",
  qualified: "bg-blue-500",
  proposal: "bg-yellow-500",
  negotiation: "bg-orange-500",
  verbal_yes: "bg-green-500",
  contract_sent: "bg-emerald-500",
  won: "bg-green-600",
  lost: "bg-red-500",
};

const stageLabels: Record<string, string> = {
  lead: "Lead",
  qualified: "Qualified",
  proposal: "Proposal",
  negotiation: "Negotiation",
  verbal_yes: "Verbal Yes",
  contract_sent: "Contract Sent",
  won: "Won",
  lost: "Lost",
};

export default function RevenueDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [showAddStream, setShowAddStream] = useState(false);
  const [showAddOpportunity, setShowAddOpportunity] = useState(false);
  // Using sonner toast directly

  // Calculate totals from demo data
  const totalMRR = demoVentures.reduce((sum, v) => sum + v.mrr, 0);
  const totalARR = demoVentures.reduce((sum, v) => sum + v.arr, 0);
  const totalCustomers = demoVentures.reduce((sum, v) => sum + v.customers, 0);
  const pipelineValue = demoPipeline.reduce((sum, p) => sum + p.value, 0);
  const weightedPipeline = demoPipeline.reduce((sum, p) => sum + (p.value * p.probability / 100), 0);

  // Revenue infrastructure score
  const infrastructureScore = 35; // Current score from KPI report
  const projectedScore = 75; // After Stripe integration

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Revenue Dashboard</h1>
            <p className="text-muted-foreground">
              Track revenue streams, pipeline, and financial health across all ventures
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <AlertTriangle className="h-3 w-3 text-amber-500" />
              Infrastructure Score: {infrastructureScore}%
            </Badge>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Sync
            </Button>
          </div>
        </div>

        {/* Infrastructure Alert */}
        <Card className="border-amber-500/50 bg-amber-500/5">
          <CardContent className="pt-4">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-amber-600 dark:text-amber-400">Revenue Infrastructure Gap Identified</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Current score: {infrastructureScore}% → Projected after integration: {projectedScore}%
                </p>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>Stripe sandbox needs to be claimed for payment processing</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Zap className="h-4 w-4 text-muted-foreground" />
                    <span>No automated invoicing or subscription billing configured</span>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button size="sm" className="bg-amber-600 hover:bg-amber-700">
                    Claim Stripe Sandbox
                  </Button>
                  <Button size="sm" variant="outline">
                    View Full Analysis
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Recurring</p>
                  <p className="text-2xl font-bold">AED {totalMRR.toLocaleString()}</p>
                </div>
                <div className="p-2 rounded-lg bg-green-500/10">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                <span className="text-green-500">+12%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Annual Recurring</p>
                  <p className="text-2xl font-bold">AED {totalARR.toLocaleString()}</p>
                </div>
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <DollarSign className="h-5 w-5 text-blue-500" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Across {demoVentures.filter(v => v.status === "active").length} active ventures
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pipeline Value</p>
                  <p className="text-2xl font-bold">AED {pipelineValue.toLocaleString()}</p>
                </div>
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Target className="h-5 w-5 text-purple-500" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Weighted: AED {weightedPipeline.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Customers</p>
                  <p className="text-2xl font-bold">{totalCustomers}</p>
                </div>
                <div className="p-2 rounded-lg bg-cyan-500/10">
                  <Users className="h-5 w-5 text-cyan-500" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Avg. revenue: AED {totalCustomers > 0 ? Math.round(totalMRR / totalCustomers).toLocaleString() : 0}/mo
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="streams">Revenue Streams</TabsTrigger>
            <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
            <TabsTrigger value="forecasts">Forecasts</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Venture Revenue Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Revenue by Venture
                </CardTitle>
                <CardDescription>Monthly recurring revenue across portfolio</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {demoVentures.map((venture) => (
                    <div key={venture.name} className="flex items-center gap-4">
                      <div className="w-32 font-medium">{venture.name}</div>
                      <div className="flex-1">
                        <Progress 
                          value={totalMRR > 0 ? (venture.mrr / totalMRR) * 100 : 0} 
                          className="h-2"
                        />
                      </div>
                      <div className="w-32 text-right">
                        <span className="font-semibold">AED {venture.mrr.toLocaleString()}</span>
                        <span className="text-xs text-muted-foreground ml-1">/mo</span>
                      </div>
                      <Badge variant={venture.status === "active" ? "default" : "secondary"}>
                        {venture.stage}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setShowAddStream(true)}>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-500/10">
                      <Plus className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="font-medium">Add Revenue Stream</p>
                      <p className="text-sm text-muted-foreground">Define a new income source</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setShowAddOpportunity(true)}>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-500/10">
                      <Target className="h-5 w-5 text-purple-500" />
                    </div>
                    <div>
                      <p className="font-medium">Add Pipeline Deal</p>
                      <p className="text-sm text-muted-foreground">Track a new opportunity</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:border-primary/50 transition-colors">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <CreditCard className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="font-medium">Connect Stripe</p>
                      <p className="text-sm text-muted-foreground">Enable payment processing</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="streams" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Revenue Streams</h3>
              <Button onClick={() => setShowAddStream(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Stream
              </Button>
            </div>

            <div className="grid gap-4">
              {/* Demo revenue streams */}
              {[
                { name: "Celadon Consulting", venture: "Celadon", type: "consulting", mrr: 35000, status: "active" },
                { name: "Celadon Retainers", venture: "Celadon", type: "recurring", mrr: 10000, status: "active" },
                { name: "Perfect DXB Services", venture: "Perfect DXB", type: "recurring", mrr: 28000, status: "active" },
                { name: "CEPHO.Ai Subscriptions", venture: "CEPHO.Ai", type: "subscription", mrr: 0, status: "planned" },
              ].map((stream, idx) => (
                <Card key={idx}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <DollarSign className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{stream.name}</p>
                          <p className="text-sm text-muted-foreground">{stream.venture} • {stream.type}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">AED {stream.mrr.toLocaleString()}/mo</p>
                        <Badge variant={stream.status === "active" ? "default" : "secondary"}>
                          {stream.status}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="pipeline" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Sales Pipeline</h3>
              <Button onClick={() => setShowAddOpportunity(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Opportunity
              </Button>
            </div>

            {/* Pipeline stages visualization */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              {["qualified", "proposal", "negotiation", "verbal_yes"].map((stage) => {
                const stageDeals = demoPipeline.filter(p => p.stage === stage);
                const stageValue = stageDeals.reduce((sum, p) => sum + p.value, 0);
                return (
                  <Card key={stage} className="text-center">
                    <CardContent className="pt-4 pb-2">
                      <p className="text-xs text-muted-foreground uppercase">{stageLabels[stage]}</p>
                      <p className="text-lg font-bold">{stageDeals.length}</p>
                      <p className="text-xs text-muted-foreground">AED {stageValue.toLocaleString()}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="space-y-3">
              {demoPipeline.map((opp, idx) => (
                <Card key={idx}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-2 h-12 rounded-full ${stageColors[opp.stage]}`} />
                        <div>
                          <p className="font-medium">{opp.name}</p>
                          <p className="text-sm text-muted-foreground">{opp.venture}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-semibold">AED {opp.value.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">{opp.probability}% probability</p>
                        </div>
                        <Badge className={stageColors[opp.stage]}>
                          {stageLabels[opp.stage]}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="forecasts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Forecast</CardTitle>
                <CardDescription>Projected revenue for the next 12 months</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Quarterly projections */}
                  {[
                    { period: "Q1 2026", projected: 250000, confidence: "high" },
                    { period: "Q2 2026", projected: 320000, confidence: "medium" },
                    { period: "Q3 2026", projected: 450000, confidence: "medium" },
                    { period: "Q4 2026", projected: 580000, confidence: "low" },
                  ].map((forecast, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{forecast.period}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-semibold">AED {forecast.projected.toLocaleString()}</span>
                        <Badge variant={
                          forecast.confidence === "high" ? "default" : 
                          forecast.confidence === "medium" ? "secondary" : "outline"
                        }>
                          {forecast.confidence} confidence
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 rounded-lg border border-dashed">
                  <p className="text-sm text-muted-foreground text-center">
                    Connect Stripe and add more revenue streams to improve forecast accuracy
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add Revenue Stream Dialog */}
        <Dialog open={showAddStream} onOpenChange={setShowAddStream}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Revenue Stream</DialogTitle>
              <DialogDescription>Define a new source of income for your ventures</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Venture</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select venture" />
                  </SelectTrigger>
                  <SelectContent>
                    {demoVentures.map(v => (
                      <SelectItem key={v.name} value={v.name}>{v.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Stream Name</Label>
                <Input placeholder="e.g., SaaS Subscriptions" />
              </div>
              <div className="space-y-2">
                <Label>Stream Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="subscription">Subscription</SelectItem>
                    <SelectItem value="recurring">Recurring</SelectItem>
                    <SelectItem value="one_time">One Time</SelectItem>
                    <SelectItem value="consulting">Consulting</SelectItem>
                    <SelectItem value="licensing">Licensing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Monthly Value (AED)</Label>
                  <Input type="number" placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="planned">Planned</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button className="w-full" onClick={() => {
                toast.success("Revenue stream added");
                setShowAddStream(false);
              }}>
                Add Revenue Stream
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Pipeline Opportunity Dialog */}
        <Dialog open={showAddOpportunity} onOpenChange={setShowAddOpportunity}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Pipeline Opportunity</DialogTitle>
              <DialogDescription>Track a new sales opportunity</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Opportunity Name</Label>
                <Input placeholder="e.g., Enterprise Client A" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Venture</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select venture" />
                    </SelectTrigger>
                    <SelectContent>
                      {demoVentures.map(v => (
                        <SelectItem key={v.name} value={v.name}>{v.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Stage</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select stage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lead">Lead</SelectItem>
                      <SelectItem value="qualified">Qualified</SelectItem>
                      <SelectItem value="proposal">Proposal</SelectItem>
                      <SelectItem value="negotiation">Negotiation</SelectItem>
                      <SelectItem value="verbal_yes">Verbal Yes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Estimated Value (AED)</Label>
                  <Input type="number" placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label>Probability (%)</Label>
                  <Input type="number" placeholder="50" min="0" max="100" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Customer Name</Label>
                <Input placeholder="Company or contact name" />
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea placeholder="Additional context..." />
              </div>
              <Button className="w-full" onClick={() => {
                toast.success("Opportunity added");
                setShowAddOpportunity(false);
              }}>
                Add Opportunity
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
