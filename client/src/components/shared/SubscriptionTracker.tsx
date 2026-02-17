import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  CreditCard, 
  Plus, 
  Trash2, 
  Edit2, 
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  MoreHorizontal,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  LineChart,
  RefreshCw
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { trpc } from "@/lib/trpc";

// Subscription categories with colors
const CATEGORIES = [
  { value: "ai_ml", label: "AI & Machine Learning", color: "bg-purple-500" },
  { value: "productivity", label: "Productivity", color: "bg-blue-500" },
  { value: "development", label: "Development Tools", color: "bg-emerald-500" },
  { value: "marketing", label: "Marketing", color: "bg-pink-500" },
  { value: "communication", label: "Communication", color: "bg-cyan-500" },
  { value: "storage", label: "Storage & Cloud", color: "bg-amber-500" },
  { value: "design", label: "Design", color: "bg-red-500" },
  { value: "analytics", label: "Analytics", color: "bg-indigo-500" },
  { value: "finance", label: "Finance", color: "bg-teal-500" },
  { value: "security", label: "Security", color: "bg-orange-500" },
  { value: "other", label: "Other", color: "bg-gray-500" },
] as const;

type CategoryValue = typeof CATEGORIES[number]['value'];

// Billing cycles
const BILLING_CYCLES = [
  { value: "monthly", label: "Monthly" },
  { value: "annual", label: "Annual" },
  { value: "quarterly", label: "Quarterly" },
  { value: "one_time", label: "One-time" },
  { value: "usage_based", label: "Usage-based" },
] as const;

type BillingCycleValue = typeof BILLING_CYCLES[number]['value'];

// Status options
const STATUS_OPTIONS = [
  { value: "active", label: "Active", color: "text-emerald-400" },
  { value: "paused", label: "Paused", color: "text-amber-400" },
  { value: "cancelled", label: "Cancelled", color: "text-red-400" },
  { value: "trial", label: "Trial", color: "text-cyan-400" },
] as const;

type StatusValue = typeof STATUS_OPTIONS[number]['value'];

interface FormData {
  name: string;
  provider: string;
  cost: string;
  billingCycle: BillingCycleValue;
  category: CategoryValue;
  status: StatusValue;
  notes: string;
}

const initialFormData: FormData = {
  name: "",
  provider: "",
  cost: "",
  billingCycle: "monthly",
  category: "productivity",
  status: "active",
  notes: "",
};

// Simple line chart component
function CostTrendChart({ data }: { data: { month: string; totalCost: number; subscriptionCount: number }[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-foreground/60">
        No cost history available
      </div>
    );
  }

  const maxCost = Math.max(...data.map(d => d.totalCost), 1);
  const chartHeight = 160;
  const chartWidth = 100; // percentage
  const padding = 20;

  // Calculate points for the line
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1 || 1)) * (chartWidth - 10) + 5;
    const y = chartHeight - padding - ((d.totalCost / maxCost) * (chartHeight - padding * 2));
    return { x, y, ...d };
  });

  // Create SVG path
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x}% ${p.y}`).join(' ');
  
  // Create area path (for gradient fill)
  const areaD = `${pathD} L ${points[points.length - 1]?.x || 0}% ${chartHeight - padding} L ${points[0]?.x || 0}% ${chartHeight - padding} Z`;

  return (
    <div className="relative">
      <svg 
        viewBox={`0 0 100 ${chartHeight}`} 
        className="w-full h-48"
        preserveAspectRatio="none"
      >
        {/* Gradient definition */}
        <defs>
          <linearGradient id="costGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgb(6, 182, 212)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="rgb(6, 182, 212)" stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map(pct => (
          <line
            key={pct}
            x1="0%"
            y1={chartHeight - padding - ((pct / 100) * (chartHeight - padding * 2))}
            x2="100%"
            y2={chartHeight - padding - ((pct / 100) * (chartHeight - padding * 2))}
            stroke="rgb(55, 65, 81)"
            strokeWidth="0.5"
            strokeDasharray="2,2"
          />
        ))}
        
        {/* Area fill */}
        <path d={areaD} fill="url(#costGradient)" />
        
        {/* Line */}
        <path
          d={pathD}
          fill="none"
          stroke="rgb(6, 182, 212)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Data points */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={`${p.x}%`}
            cy={p.y}
            r="3"
            fill="rgb(6, 182, 212)"
            stroke="rgb(17, 24, 39)"
            strokeWidth="2"
          />
        ))}
      </svg>
      
      {/* X-axis labels */}
      <div className="flex justify-between px-2 text-xs text-foreground/60 mt-1">
        {data.filter((_, i) => i % Math.ceil(data.length / 6) === 0 || i === data.length - 1).map((d, i) => (
          <span key={i}>{d.month}</span>
        ))}
      </div>
    </div>
  );
}

export default function SubscriptionTracker() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const utils = trpc.useUtils();

  // Fetch subscriptions from database
  const { data: subscriptions, isLoading, refetch } = trpc.subscriptionTracker.getAll.useQuery({});
  
  // Fetch summary statistics
  const { data: summary } = trpc.subscriptionTracker.getSummary.useQuery();
  
  // Fetch cost history for trend chart
  const { data: costHistory } = trpc.subscriptionTracker.getCostHistory.useQuery({ months: 12 });
  
  // Fetch upcoming renewals
  const { data: renewalSummary } = trpc.subscriptionTracker.getRenewalSummary.useQuery();

  // Mutations
  const createMutation = trpc.subscriptionTracker.create.useMutation({
    onSuccess: () => {
      utils.subscriptionTracker.getAll.invalidate();
      utils.subscriptionTracker.getSummary.invalidate();
      utils.subscriptionTracker.getCostHistory.invalidate();
      setIsAddDialogOpen(false);
      setFormData(initialFormData);
    },
  });

  const updateMutation = trpc.subscriptionTracker.update.useMutation({
    onSuccess: () => {
      utils.subscriptionTracker.getAll.invalidate();
      utils.subscriptionTracker.getSummary.invalidate();
      utils.subscriptionTracker.getCostHistory.invalidate();
      setEditingId(null);
      setFormData(initialFormData);
    },
  });

  const deleteMutation = trpc.subscriptionTracker.delete.useMutation({
    onSuccess: () => {
      utils.subscriptionTracker.getAll.invalidate();
      utils.subscriptionTracker.getSummary.invalidate();
      utils.subscriptionTracker.getCostHistory.invalidate();
      setDeleteConfirmId(null);
    },
  });

  // Calculate local totals from subscriptions data
  const { monthlyTotal, annualTotal, categoryTotals } = useMemo(() => {
    if (!subscriptions) return { monthlyTotal: 0, annualTotal: 0, categoryTotals: [] };

    let monthly = 0;
    const catMap: Record<string, { total: number; count: number }> = {};

    subscriptions.forEach(sub => {
      if (sub.status === 'active' || sub.status === 'trial') {
        let monthlyCost = sub.cost;
        if (sub.billingCycle === 'annual') monthlyCost = sub.cost / 12;
        else if (sub.billingCycle === 'quarterly') monthlyCost = sub.cost / 3;

        monthly += monthlyCost;

        const cat = sub.category || 'other';
        if (!catMap[cat]) catMap[cat] = { total: 0, count: 0 };
        catMap[cat].total += monthlyCost;
        catMap[cat].count++;
      }
    });

    const catTotals = CATEGORIES
      .map(cat => ({
        ...cat,
        total: catMap[cat.value]?.total || 0,
        count: catMap[cat.value]?.count || 0,
      }))
      .filter(cat => cat.count > 0)
      .sort((a, b) => b.total - a.total);

    return { monthlyTotal: monthly, annualTotal: monthly * 12, categoryTotals: catTotals };
  }, [subscriptions]);

  const handleSubmit = () => {
    if (!formData.name || !formData.cost) {
      alert("Please fill in all required fields");
      return;
    }

    const data = {
      name: formData.name,
      provider: formData.provider || undefined,
      cost: parseFloat(formData.cost),
      billingCycle: formData.billingCycle,
      category: formData.category,
      status: formData.status,
      notes: formData.notes || undefined,
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (sub: typeof subscriptions extends (infer T)[] | undefined ? T : never) => {
    if (!sub) return;
    setEditingId(sub.id);
    setFormData({
      name: sub.name,
      provider: sub.provider || "",
      cost: sub.cost.toString(),
      billingCycle: sub.billingCycle as BillingCycleValue,
      category: sub.category as CategoryValue,
      status: sub.status as StatusValue,
      notes: sub.notes || "",
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate({ id });
  };

  const getCategoryInfo = (categoryValue: string) => {
    return CATEGORIES.find(c => c.value === categoryValue) || CATEGORIES[CATEGORIES.length - 1];
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amount);
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground/70">Monthly Spend</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(summary?.totalMonthly || monthlyTotal)}</p>
              </div>
              <div className="p-3 bg-amber-500/20 rounded-full">
                <DollarSign className="w-6 h-6 text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground/70">Annual Spend</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(summary?.totalAnnual || annualTotal)}</p>
              </div>
              <div className="p-3 bg-purple-500/20 rounded-full">
                <TrendingUp className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground/70">Active Subscriptions</p>
                <p className="text-2xl font-bold text-white">{summary?.activeCount || subscriptions?.filter(s => s.status === 'active').length || 0}</p>
              </div>
              <div className="p-3 bg-emerald-500/20 rounded-full">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground/70">On Trial</p>
                <p className="text-2xl font-bold text-white">{subscriptions?.filter(s => s.status === 'trial').length || 0}</p>
              </div>
              <div className="p-3 bg-cyan-500/20 rounded-full">
                <Calendar className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Renewals Alert */}
      {renewalSummary && renewalSummary.upcomingCount > 0 && (
        <Card className="bg-amber-900/20 border-amber-800/50">
          <CardContent className="pt-4">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-amber-500/20 rounded-full">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-amber-200">Upcoming Renewals</h3>
                <p className="text-sm text-amber-300/80 mt-1">
                  {renewalSummary.upcomingCount} subscription{renewalSummary.upcomingCount > 1 ? 's' : ''} renewing in the next 30 days
                  {renewalSummary.nextRenewal && (
                    <span> — Next: <strong>{renewalSummary.nextRenewal.subscriptionName}</strong> in {renewalSummary.nextRenewal.daysUntilRenewal} day{renewalSummary.nextRenewal.daysUntilRenewal !== 1 ? 's' : ''} ({formatCurrency(renewalSummary.nextRenewal.cost)})</span>
                  )}
                </p>
                {renewalSummary.renewals.length > 1 && (
                  <div className="mt-3 space-y-2">
                    {renewalSummary.renewals.slice(0, 5).map((renewal) => (
                      <div key={renewal.subscriptionId} className="flex items-center justify-between text-sm bg-amber-950/30 rounded px-3 py-2">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${
                            renewal.daysUntilRenewal <= 1 ? 'bg-red-500' :
                            renewal.daysUntilRenewal <= 3 ? 'bg-orange-500' :
                            renewal.daysUntilRenewal <= 7 ? 'bg-yellow-500' : 'bg-blue-500'
                          }`} />
                          <span className="text-amber-100">{renewal.subscriptionName}</span>
                          <span className="text-amber-400/60">({renewal.provider})</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-amber-200">{formatCurrency(renewal.cost)}</span>
                          <span className="text-amber-400/80">
                            {renewal.daysUntilRenewal === 0 ? 'Today' :
                             renewal.daysUntilRenewal === 1 ? 'Tomorrow' :
                             `${renewal.daysUntilRenewal} days`}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cost Trend Chart */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              <LineChart className="w-5 h-5 text-cyan-400" />
              Cost Trends
            </CardTitle>
            <CardDescription>Monthly subscription spend over the last 12 months</CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetch()}
            className="border-gray-700"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          <CostTrendChart data={costHistory || []} />
          {costHistory && costHistory.length > 1 && (
            <div className="mt-4 flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-cyan-500" />
                <span className="text-foreground/70">Monthly Cost</span>
              </div>
              {costHistory.length >= 2 && (
                <div className="flex items-center gap-2">
                  {costHistory[costHistory.length - 1].totalCost >= costHistory[costHistory.length - 2].totalCost ? (
                    <TrendingUp className="w-4 h-4 text-red-400" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-emerald-400" />
                  )}
                  <span className={costHistory[costHistory.length - 1].totalCost >= costHistory[costHistory.length - 2].totalCost ? "text-red-400" : "text-emerald-400"}>
                    {Math.abs(
                      ((costHistory[costHistory.length - 1].totalCost - costHistory[costHistory.length - 2].totalCost) / 
                      (costHistory[costHistory.length - 2].totalCost || 1)) * 100
                    ).toFixed(1)}% vs last month
                  </span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-3 gap-6">
        {/* Subscriptions List */}
        <Card className="bg-gray-900/50 border-gray-800 col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-amber-400" />
                Your Subscriptions
              </CardTitle>
              <CardDescription>Manage all your productivity tools and services</CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
              setIsAddDialogOpen(open);
              if (!open) {
                setEditingId(null);
                setFormData(initialFormData);
              }
            }}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Subscription
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-900 border-gray-800">
                <DialogHeader>
                  <DialogTitle className="text-white">
                    {editingId ? 'Edit Subscription' : 'Add New Subscription'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingId ? 'Update subscription details' : 'Track a new productivity tool or service'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label className="text-white">Service Name *</Label>
                    <Input 
                      placeholder="e.g., Notion, Slack, GitHub"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Provider</Label>
                    <Input 
                      placeholder="e.g., Microsoft, Google"
                      value={formData.provider}
                      onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-white">Cost (£) *</Label>
                      <Input 
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.cost}
                        onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Billing Cycle</Label>
                      <Select 
                        value={formData.billingCycle} 
                        onValueChange={(v) => setFormData({ ...formData, billingCycle: v as BillingCycleValue })}
                      >
                        <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          {BILLING_CYCLES.map(cycle => (
                            <SelectItem key={cycle.value} value={cycle.value} className="text-white">
                              {cycle.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-white">Category</Label>
                      <Select 
                        value={formData.category} 
                        onValueChange={(v) => setFormData({ ...formData, category: v as CategoryValue })}
                      >
                        <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          {CATEGORIES.map(cat => (
                            <SelectItem key={cat.value} value={cat.value} className="text-white">
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Status</Label>
                      <Select 
                        value={formData.status} 
                        onValueChange={(v) => setFormData({ ...formData, status: v as StatusValue })}
                      >
                        <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          {STATUS_OPTIONS.map(status => (
                            <SelectItem key={status.value} value={status.value} className="text-white">
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Notes</Label>
                    <Input 
                      placeholder="Optional notes..."
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsAddDialogOpen(false);
                      setEditingId(null);
                      setFormData(initialFormData);
                    }} 
                    className="border-gray-700"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSubmit} 
                    className="bg-cyan-500 hover:bg-cyan-600"
                    disabled={isSubmitting}
                  >
                    {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {editingId ? 'Update' : 'Add'} Subscription
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
              </div>
            ) : !subscriptions || subscriptions.length === 0 ? (
              <div className="text-center py-12">
                <CreditCard className="w-12 h-12 text-foreground/50 mx-auto mb-4" />
                <p className="text-foreground/70 mb-4">No subscriptions tracked yet</p>
                <Button 
                  onClick={() => setIsAddDialogOpen(true)}
                  className="bg-gradient-to-r from-cyan-500 to-purple-500"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Subscription
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {subscriptions.map((sub) => {
                  const category = getCategoryInfo(sub.category);
                  const statusInfo = STATUS_OPTIONS.find(s => s.value === sub.status);
                  return (
                    <div 
                      key={sub.id} 
                      className={`p-4 bg-gray-800/50 rounded-lg border-l-4 ${
                        sub.status === 'trial' ? 'border-cyan-500' :
                        sub.status === 'paused' ? 'border-amber-500' :
                        sub.status === 'cancelled' ? 'border-red-500' :
                        'border-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg ${category.color} flex items-center justify-center`}>
                            <CreditCard className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-white font-medium">{sub.name}</span>
                              {sub.status !== 'active' && (
                                <Badge className={`${
                                  sub.status === 'trial' ? 'bg-cyan-500/20 text-cyan-400' :
                                  sub.status === 'paused' ? 'bg-amber-500/20 text-amber-400' :
                                  'bg-red-500/20 text-red-400'
                                } text-xs`}>
                                  {statusInfo?.label}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-foreground/70">{sub.provider || sub.name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-white font-medium">{formatCurrency(sub.cost)}</p>
                            <p className="text-xs text-foreground/60">
                              {BILLING_CYCLES.find(c => c.value === sub.billingCycle)?.label}
                            </p>
                          </div>
                          <Badge variant="outline" className={`${category.color.replace('bg-', 'border-')}/50 ${category.color.replace('bg-', 'text-').replace('-500', '-400')}`}>
                            {category.label}
                          </Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="w-4 h-4 text-foreground/70" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
                              <DropdownMenuItem 
                                className="text-white hover:bg-gray-700 cursor-pointer"
                                onClick={() => handleEdit(sub)}
                              >
                                <Edit2 className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-red-400 hover:bg-gray-700 cursor-pointer"
                                onClick={() => setDeleteConfirmId(sub.id)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Remove
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              Spend by Category
            </CardTitle>
            <CardDescription>Monthly breakdown by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryTotals.length === 0 ? (
                <p className="text-foreground/60 text-center py-4">No data available</p>
              ) : (
                categoryTotals.map((cat) => (
                  <div key={cat.value} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${cat.color}`} />
                        <span className="text-sm text-foreground/80">{cat.label}</span>
                      </div>
                      <span className="text-sm font-medium text-white">{formatCurrency(cat.total)}</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${cat.color} transition-all duration-500`}
                        style={{ width: `${monthlyTotal > 0 ? (cat.total / monthlyTotal) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Optimization Tips */}
            {categoryTotals.length > 0 && (
              <div className="mt-6 p-4 bg-gradient-to-r from-amber-500/10 to-purple-500/10 rounded-lg border border-amber-500/20">
                <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-amber-400" />
                  Optimization Tip
                </h4>
                <p className="text-sm text-foreground/70">
                  {categoryTotals[0]?.label} accounts for {monthlyTotal > 0 ? ((categoryTotals[0]?.total / monthlyTotal) * 100).toFixed(0) : 0}% of your spend. 
                  Consider reviewing these subscriptions for potential consolidation.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmId !== null} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent className="bg-gray-900 border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-white">Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this subscription? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)} className="border-gray-700">
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
