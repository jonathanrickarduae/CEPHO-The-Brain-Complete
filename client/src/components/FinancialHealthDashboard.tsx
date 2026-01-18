import { useState } from 'react';
import { 
  DollarSign, TrendingUp, TrendingDown, Target, PiggyBank,
  CreditCard, AlertTriangle, CheckCircle2, BarChart3,
  ArrowUpRight, ArrowDownRight, Wallet, Calculator
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

interface FinancialGoal {
  id: string;
  name: string;
  target: number;
  current: number;
  deadline: string;
  category: 'savings' | 'investment' | 'debt' | 'income';
  status: 'on-track' | 'behind' | 'ahead';
}

interface BudgetCategory {
  id: string;
  name: string;
  budgeted: number;
  spent: number;
  trend: 'up' | 'down' | 'stable';
}

interface CostEstimate {
  taskType: string;
  avgCost: number;
  queriesThisMonth: number;
  totalCost: number;
}

// Mock data
const MOCK_GOALS: FinancialGoal[] = [
  {
    id: 'g1',
    name: 'Emergency Fund',
    target: 50000,
    current: 35000,
    deadline: 'Dec 2024',
    category: 'savings',
    status: 'on-track'
  },
  {
    id: 'g2',
    name: 'Investment Portfolio',
    target: 250000,
    current: 180000,
    deadline: 'Dec 2025',
    category: 'investment',
    status: 'ahead'
  },
  {
    id: 'g3',
    name: 'Property Down Payment',
    target: 100000,
    current: 45000,
    deadline: 'Jun 2025',
    category: 'savings',
    status: 'behind'
  }
];

const MOCK_BUDGET: BudgetCategory[] = [
  { id: 'b1', name: 'AI Services', budgeted: 500, spent: 420, trend: 'up' },
  { id: 'b2', name: 'Software Subscriptions', budgeted: 300, spent: 285, trend: 'stable' },
  { id: 'b3', name: 'Cloud Infrastructure', budgeted: 200, spent: 175, trend: 'down' },
  { id: 'b4', name: 'Professional Services', budgeted: 1000, spent: 650, trend: 'stable' }
];

const MOCK_COST_ESTIMATES: CostEstimate[] = [
  { taskType: 'Research & Analysis', avgCost: 0.45, queriesThisMonth: 156, totalCost: 70.20 },
  { taskType: 'Document Generation', avgCost: 0.35, queriesThisMonth: 89, totalCost: 31.15 },
  { taskType: 'Code Assistance', avgCost: 0.25, queriesThisMonth: 234, totalCost: 58.50 },
  { taskType: 'Creative Writing', avgCost: 0.40, queriesThisMonth: 67, totalCost: 26.80 },
  { taskType: 'Data Analysis', avgCost: 0.55, queriesThisMonth: 45, totalCost: 24.75 }
];

export function FinancialHealthDashboard() {
  const [goals] = useState<FinancialGoal[]>(MOCK_GOALS);
  const [budget] = useState<BudgetCategory[]>(MOCK_BUDGET);
  const [costEstimates] = useState<CostEstimate[]>(MOCK_COST_ESTIMATES);
  const [activeTab, setActiveTab] = useState<'overview' | 'goals' | 'budget' | 'costs'>('overview');

  // Calculate health score
  const goalsOnTrack = goals.filter(g => g.status !== 'behind').length;
  const budgetHealth = budget.filter(b => b.spent <= b.budgeted).length;
  const healthScore = Math.round(((goalsOnTrack / goals.length) * 50) + ((budgetHealth / budget.length) * 50));

  const totalBudgeted = budget.reduce((sum, b) => sum + b.budgeted, 0);
  const totalSpent = budget.reduce((sum, b) => sum + b.spent, 0);
  const totalAICost = costEstimates.reduce((sum, c) => sum + c.totalCost, 0);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'savings': return PiggyBank;
      case 'investment': return TrendingUp;
      case 'debt': return CreditCard;
      case 'income': return DollarSign;
      default: return Wallet;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'ahead': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'behind': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-foreground/70 border-gray-500/30';
    }
  };

  return (
    <div className="space-y-4">
      {/* Health Score */}
      <Card className="bg-card/60 border-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                healthScore >= 80 ? 'bg-green-500/20' :
                healthScore >= 60 ? 'bg-yellow-500/20' :
                'bg-red-500/20'
              }`}>
                <DollarSign className={`w-6 h-6 ${
                  healthScore >= 80 ? 'text-green-400' :
                  healthScore >= 60 ? 'text-yellow-400' :
                  'text-red-400'
                }`} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Financial Health Score</h2>
                <p className="text-sm text-muted-foreground">
                  {healthScore >= 80 ? 'Excellent financial position' :
                   healthScore >= 60 ? 'Good, with room for improvement' :
                   'Needs attention'}
                </p>
              </div>
            </div>
            <div className={`text-3xl font-bold ${
              healthScore >= 80 ? 'text-green-400' :
              healthScore >= 60 ? 'text-yellow-400' :
              'text-red-400'
            }`}>{healthScore}%</div>
          </div>
          <Progress value={healthScore} className="h-2" />
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'goals', label: 'Goals', icon: Target },
          { id: 'budget', label: 'Budget', icon: Wallet },
          { id: 'costs', label: 'AI Costs', icon: Calculator }
        ].map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
          >
            <tab.icon className="w-4 h-4 mr-2" />
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-card/60 border-border">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-foreground">
                £{totalBudgeted.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Monthly Budget</div>
              <div className="flex items-center justify-center gap-1 mt-1 text-sm">
                <span className={totalSpent <= totalBudgeted ? 'text-green-400' : 'text-red-400'}>
                  £{totalSpent.toLocaleString()} spent
                </span>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/60 border-border">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-foreground">
                {goalsOnTrack}/{goals.length}
              </div>
              <div className="text-sm text-muted-foreground">Goals On Track</div>
              <div className="flex items-center justify-center gap-1 mt-1 text-sm text-green-400">
                <CheckCircle2 className="w-3 h-3" />
                {Math.round((goalsOnTrack / goals.length) * 100)}% success rate
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/60 border-border">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-foreground">
                £{totalAICost.toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">AI Costs This Month</div>
              <div className="flex items-center justify-center gap-1 mt-1 text-sm text-blue-400">
                {costEstimates.reduce((sum, c) => sum + c.queriesThisMonth, 0)} queries
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/60 border-border">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-foreground">
                £{Math.round(totalBudgeted - totalSpent).toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Budget Remaining</div>
              <div className="flex items-center justify-center gap-1 mt-1 text-sm text-green-400">
                <ArrowUpRight className="w-3 h-3" />
                {Math.round(((totalBudgeted - totalSpent) / totalBudgeted) * 100)}% available
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Goals Tab */}
      {activeTab === 'goals' && (
        <div className="space-y-3">
          {goals.map((goal) => {
            const GoalIcon = getCategoryIcon(goal.category);
            const progress = (goal.current / goal.target) * 100;
            return (
              <Card key={goal.id} className="bg-card/60 border-border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                        <GoalIcon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">{goal.name}</h3>
                        <span className="text-xs text-muted-foreground">Target: {goal.deadline}</span>
                      </div>
                    </div>
                    <Badge variant="outline" className={getStatusColor(goal.status)}>
                      {goal.status === 'on-track' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                      {goal.status === 'ahead' && <ArrowUpRight className="w-3 h-3 mr-1" />}
                      {goal.status === 'behind' && <AlertTriangle className="w-3 h-3 mr-1" />}
                      {goal.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <Progress value={progress} className="flex-1 h-2" />
                    <span className="text-sm font-medium text-foreground">{Math.round(progress)}%</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>£{goal.current.toLocaleString()}</span>
                    <span>£{goal.target.toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          <Button variant="outline" className="w-full">
            <Target className="w-4 h-4 mr-2" />
            Add New Goal
          </Button>
        </div>
      )}

      {/* Budget Tab */}
      {activeTab === 'budget' && (
        <div className="space-y-3">
          {budget.map((category) => {
            const progress = (category.spent / category.budgeted) * 100;
            const isOverBudget = category.spent > category.budgeted;
            return (
              <Card key={category.id} className="bg-card/60 border-border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-foreground">{category.name}</span>
                    <div className="flex items-center gap-2">
                      {category.trend === 'up' && <TrendingUp className="w-4 h-4 text-red-400" />}
                      {category.trend === 'down' && <TrendingDown className="w-4 h-4 text-green-400" />}
                      <span className={`text-sm font-medium ${isOverBudget ? 'text-red-400' : 'text-foreground'}`}>
                        £{category.spent} / £{category.budgeted}
                      </span>
                    </div>
                  </div>
                  <Progress 
                    value={Math.min(progress, 100)} 
                    className={`h-2 ${isOverBudget ? '[&>div]:bg-red-500' : ''}`} 
                  />
                  {isOverBudget && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-red-400">
                      <AlertTriangle className="w-3 h-3" />
                      Over budget by £{category.spent - category.budgeted}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
          <Card className="bg-card/60 border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground">Total</span>
                <span className={`font-bold ${totalSpent > totalBudgeted ? 'text-red-400' : 'text-green-400'}`}>
                  £{totalSpent} / £{totalBudgeted}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* AI Costs Tab */}
      {activeTab === 'costs' && (
        <div className="space-y-3">
          <Card className="bg-card/60 border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-foreground">Cost per Query by Task Type</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {costEstimates.map((estimate) => (
                <div key={estimate.taskType} className="flex items-center justify-between p-2 bg-background/50 rounded">
                  <div>
                    <span className="font-medium text-foreground">{estimate.taskType}</span>
                    <div className="text-xs text-muted-foreground">
                      {estimate.queriesThisMonth} queries this month
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-foreground">£{estimate.totalCost.toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground">~£{estimate.avgCost.toFixed(2)}/query</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card className="bg-primary/10 border-primary/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-foreground">Total AI Spend</h3>
                  <p className="text-sm text-muted-foreground">
                    {costEstimates.reduce((sum, c) => sum + c.queriesThisMonth, 0)} total queries
                  </p>
                </div>
                <div className="text-2xl font-bold text-primary">£{totalAICost.toFixed(2)}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default FinancialHealthDashboard;
