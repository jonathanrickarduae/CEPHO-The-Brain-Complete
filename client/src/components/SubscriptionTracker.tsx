import { useState } from "react";
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
  CheckCircle2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { trpc } from "@/lib/trpc";
// Toast notifications handled via simple alerts for now

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
  { value: "other", label: "Other", color: "bg-gray-500" },
];

// Billing cycles
const BILLING_CYCLES = [
  { value: "monthly", label: "Monthly" },
  { value: "annual", label: "Annual" },
  { value: "quarterly", label: "Quarterly" },
  { value: "one_time", label: "One-time" },
];

// Default subscriptions for demo
const DEFAULT_SUBSCRIPTIONS = [
  { id: 1, name: "Manus AI", provider: "Manus", cost: 20, billingCycle: "monthly", category: "ai_ml", status: "active", nextBilling: new Date(2026, 1, 1) },
  { id: 2, name: "Microsoft 365", provider: "Microsoft", cost: 12.50, billingCycle: "monthly", category: "productivity", status: "active", nextBilling: new Date(2026, 1, 15) },
  { id: 3, name: "Notion", provider: "Notion Labs", cost: 10, billingCycle: "monthly", category: "productivity", status: "active", nextBilling: new Date(2026, 1, 20) },
  { id: 4, name: "GitHub Copilot", provider: "GitHub", cost: 19, billingCycle: "monthly", category: "development", status: "active", nextBilling: new Date(2026, 1, 5) },
  { id: 5, name: "Figma", provider: "Figma", cost: 15, billingCycle: "monthly", category: "design", status: "active", nextBilling: new Date(2026, 1, 10) },
  { id: 6, name: "Slack Pro", provider: "Salesforce", cost: 8.75, billingCycle: "monthly", category: "communication", status: "active", nextBilling: new Date(2026, 1, 25) },
  { id: 7, name: "ChatGPT Plus", provider: "OpenAI", cost: 20, billingCycle: "monthly", category: "ai_ml", status: "active", nextBilling: new Date(2026, 1, 8) },
  { id: 8, name: "Gamma App", provider: "Gamma", cost: 10, billingCycle: "monthly", category: "productivity", status: "warning", nextBilling: new Date(2026, 1, 3) },
];

interface Subscription {
  id: number;
  name: string;
  provider: string;
  cost: number;
  billingCycle: string;
  category: string;
  status: string;
  nextBilling: Date;
}

export default function SubscriptionTracker() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(DEFAULT_SUBSCRIPTIONS);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [newSubscription, setNewSubscription] = useState({
    name: "",
    provider: "",
    cost: "",
    billingCycle: "monthly",
    category: "productivity",
  });

  // Calculate totals
  const monthlyTotal = subscriptions
    .filter(s => s.status === "active" || s.status === "warning")
    .reduce((sum, s) => {
      if (s.billingCycle === "monthly") return sum + s.cost;
      if (s.billingCycle === "annual") return sum + (s.cost / 12);
      if (s.billingCycle === "quarterly") return sum + (s.cost / 3);
      return sum;
    }, 0);

  const annualTotal = monthlyTotal * 12;

  // Group by category
  const categoryTotals = CATEGORIES.map(cat => ({
    ...cat,
    total: subscriptions
      .filter(s => s.category === cat.value && (s.status === "active" || s.status === "warning"))
      .reduce((sum, s) => {
        if (s.billingCycle === "monthly") return sum + s.cost;
        if (s.billingCycle === "annual") return sum + (s.cost / 12);
        if (s.billingCycle === "quarterly") return sum + (s.cost / 3);
        return sum;
      }, 0),
    count: subscriptions.filter(s => s.category === cat.value).length,
  })).filter(cat => cat.count > 0);

  const handleAddSubscription = () => {
    if (!newSubscription.name || !newSubscription.cost) {
      alert("Please fill in all required fields");
      return;
    }

    const subscription: Subscription = {
      id: Date.now(),
      name: newSubscription.name,
      provider: newSubscription.provider || newSubscription.name,
      cost: parseFloat(newSubscription.cost),
      billingCycle: newSubscription.billingCycle,
      category: newSubscription.category,
      status: "active",
      nextBilling: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    };

    setSubscriptions([...subscriptions, subscription]);
    setNewSubscription({ name: "", provider: "", cost: "", billingCycle: "monthly", category: "productivity" });
    setIsAddDialogOpen(false);
    console.log(`${subscription.name} has been added to your subscriptions.`);
  };

  const handleDeleteSubscription = (id: number) => {
    const sub = subscriptions.find(s => s.id === id);
    setSubscriptions(subscriptions.filter(s => s.id !== id));
    console.log(`${sub?.name} has been removed.`);
  };

  const getCategoryInfo = (categoryValue: string) => {
    return CATEGORIES.find(c => c.value === categoryValue) || CATEGORIES[CATEGORIES.length - 1];
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Monthly Spend</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(monthlyTotal)}</p>
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
                <p className="text-sm text-gray-400">Annual Spend</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(annualTotal)}</p>
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
                <p className="text-sm text-gray-400">Active Subscriptions</p>
                <p className="text-2xl font-bold text-white">{subscriptions.filter(s => s.status === "active").length}</p>
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
                <p className="text-sm text-gray-400">Needs Attention</p>
                <p className="text-2xl font-bold text-white">{subscriptions.filter(s => s.status === "warning").length}</p>
              </div>
              <div className="p-3 bg-red-500/20 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Subscription
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-900 border-gray-800">
                <DialogHeader>
                  <DialogTitle className="text-white">Add New Subscription</DialogTitle>
                  <DialogDescription>Track a new productivity tool or service</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label className="text-white">Service Name *</Label>
                    <Input 
                      placeholder="e.g., Notion, Slack, GitHub"
                      value={newSubscription.name}
                      onChange={(e) => setNewSubscription({ ...newSubscription, name: e.target.value })}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Provider</Label>
                    <Input 
                      placeholder="e.g., Notion Labs, Salesforce"
                      value={newSubscription.provider}
                      onChange={(e) => setNewSubscription({ ...newSubscription, provider: e.target.value })}
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
                        value={newSubscription.cost}
                        onChange={(e) => setNewSubscription({ ...newSubscription, cost: e.target.value })}
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Billing Cycle</Label>
                      <Select 
                        value={newSubscription.billingCycle} 
                        onValueChange={(v) => setNewSubscription({ ...newSubscription, billingCycle: v })}
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
                  <div className="space-y-2">
                    <Label className="text-white">Category</Label>
                    <Select 
                      value={newSubscription.category} 
                      onValueChange={(v) => setNewSubscription({ ...newSubscription, category: v })}
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
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="border-gray-700">
                    Cancel
                  </Button>
                  <Button onClick={handleAddSubscription} className="bg-cyan-500 hover:bg-cyan-600">
                    Add Subscription
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {subscriptions.map((sub) => {
                const category = getCategoryInfo(sub.category);
                return (
                  <div 
                    key={sub.id} 
                    className={`p-4 bg-gray-800/50 rounded-lg border-l-4 ${
                      sub.status === "warning" ? "border-amber-500" : "border-gray-700"
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
                            {sub.status === "warning" && (
                              <Badge className="bg-amber-500/20 text-amber-400 text-xs">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                Review
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-400">{sub.provider}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-white font-medium">{formatCurrency(sub.cost)}</p>
                          <p className="text-xs text-gray-500">
                            {BILLING_CYCLES.find(c => c.value === sub.billingCycle)?.label}
                          </p>
                        </div>
                        <Badge variant="outline" className={`${category.color.replace('bg-', 'border-')}/50 ${category.color.replace('bg-', 'text-').replace('-500', '-400')}`}>
                          {category.label}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="w-4 h-4 text-gray-400" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
                            <DropdownMenuItem className="text-white hover:bg-gray-700">
                              <Edit2 className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-400 hover:bg-gray-700"
                              onClick={() => handleDeleteSubscription(sub.id)}
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
              {categoryTotals.sort((a, b) => b.total - a.total).map((cat) => (
                <div key={cat.value} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${cat.color}`} />
                      <span className="text-sm text-gray-300">{cat.label}</span>
                    </div>
                    <span className="text-sm font-medium text-white">{formatCurrency(cat.total)}</span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${cat.color} transition-all duration-500`}
                      style={{ width: `${(cat.total / monthlyTotal) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Optimization Tips */}
            <div className="mt-6 p-4 bg-gradient-to-r from-amber-500/10 to-purple-500/10 rounded-lg border border-amber-500/20">
              <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-amber-400" />
                Optimization Tip
              </h4>
              <p className="text-sm text-gray-400">
                Consider reviewing your AI & ML subscriptions. You have multiple AI tools that may have overlapping features.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
