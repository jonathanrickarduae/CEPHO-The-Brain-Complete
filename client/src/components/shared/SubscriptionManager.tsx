import { useState, useEffect } from 'react';
import { 
  CreditCard, TrendingDown, TrendingUp, AlertTriangle, 
  Check, X, ExternalLink, Calendar, DollarSign, 
  BarChart3, Zap, Shield, Clock, Users, RefreshCw,
  ChevronRight, Sparkles, PiggyBank, AlertCircle
} from 'lucide-react';

// Subscription data types
interface Subscription {
  id: string;
  name: string;
  logo: string;
  category: 'essential' | 'productivity' | 'communication' | 'storage' | 'other';
  plan: string;
  cost: number;
  billingCycle: 'monthly' | 'annual';
  renewalDate: Date;
  usagePercent: number;
  featuresUsed: number;
  featuresTotal: number;
  seats?: { used: number; total: number };
  status: 'active' | 'trial' | 'expiring' | 'cancelled';
  lastUsed: Date;
  connectedAccount?: string;
}

interface OptimizationSuggestion {
  id: string;
  subscriptionId: string;
  type: 'downgrade' | 'upgrade' | 'cancel' | 'switch' | 'consolidate';
  title: string;
  description: string;
  potentialSavings: number;
  alternative?: {
    name: string;
    cost: number;
    features: string[];
  };
  priority: 'high' | 'medium' | 'low';
}

// Mock subscription data
const MOCK_SUBSCRIPTIONS: Subscription[] = [
  {
    id: 'asana',
    name: 'Asana',
    logo: '📋',
    category: 'productivity',
    plan: 'Business',
    cost: 24.99,
    billingCycle: 'monthly',
    renewalDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    usagePercent: 45,
    featuresUsed: 12,
    featuresTotal: 35,
    seats: { used: 8, total: 15 },
    status: 'active',
    lastUsed: new Date(),
    connectedAccount: 'work@celadon.com',
  },
  {
    id: 'zoom',
    name: 'Zoom',
    logo: '📹',
    category: 'communication',
    plan: 'Pro',
    cost: 13.99,
    billingCycle: 'monthly',
    renewalDate: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000),
    usagePercent: 28,
    featuresUsed: 4,
    featuresTotal: 18,
    status: 'active',
    lastUsed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    connectedAccount: 'work@celadon.com',
  },
  {
    id: 'teams',
    name: 'Microsoft Teams',
    logo: '💬',
    category: 'communication',
    plan: 'Business Basic',
    cost: 5.00,
    billingCycle: 'monthly',
    renewalDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
    usagePercent: 72,
    featuresUsed: 15,
    featuresTotal: 22,
    seats: { used: 12, total: 25 },
    status: 'active',
    lastUsed: new Date(),
    connectedAccount: 'work@celadon.com',
  },
  {
    id: 'notion',
    name: 'Notion',
    logo: '📝',
    category: 'productivity',
    plan: 'Team',
    cost: 8.00,
    billingCycle: 'monthly',
    renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    usagePercent: 85,
    featuresUsed: 28,
    featuresTotal: 32,
    seats: { used: 5, total: 5 },
    status: 'active',
    lastUsed: new Date(),
  },
  {
    id: 'dropbox',
    name: 'Dropbox',
    logo: '📦',
    category: 'storage',
    plan: 'Business',
    cost: 15.00,
    billingCycle: 'monthly',
    renewalDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    usagePercent: 22,
    featuresUsed: 3,
    featuresTotal: 15,
    status: 'expiring',
    lastUsed: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'slack',
    name: 'Slack',
    logo: '💭',
    category: 'communication',
    plan: 'Pro',
    cost: 7.25,
    billingCycle: 'monthly',
    renewalDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
    usagePercent: 15,
    featuresUsed: 5,
    featuresTotal: 25,
    status: 'active',
    lastUsed: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'figma',
    name: 'Figma',
    logo: '🎨',
    category: 'productivity',
    plan: 'Professional',
    cost: 12.00,
    billingCycle: 'monthly',
    renewalDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
    usagePercent: 68,
    featuresUsed: 18,
    featuresTotal: 24,
    status: 'active',
    lastUsed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
];

// Mock optimization suggestions
const MOCK_SUGGESTIONS: OptimizationSuggestion[] = [
  {
    id: 'sug-1',
    subscriptionId: 'zoom',
    type: 'downgrade',
    title: 'Downgrade Zoom to Basic',
    description: 'You\'re only using 28% of Pro features. Basic plan covers your meeting needs.',
    potentialSavings: 13.99,
    priority: 'high',
  },
  {
    id: 'sug-2',
    subscriptionId: 'slack',
    type: 'cancel',
    title: 'Consider cancelling Slack',
    description: 'You have Teams for communication. Slack hasn\'t been used in 7 days.',
    potentialSavings: 7.25,
    alternative: {
      name: 'Microsoft Teams',
      cost: 0,
      features: ['Already included in your subscription', 'Similar features', 'Better integration with Office'],
    },
    priority: 'high',
  },
  {
    id: 'sug-3',
    subscriptionId: 'dropbox',
    type: 'switch',
    title: 'Switch from Dropbox to OneDrive',
    description: 'OneDrive is included with Teams. You\'re barely using Dropbox.',
    potentialSavings: 15.00,
    alternative: {
      name: 'OneDrive',
      cost: 0,
      features: ['1TB storage included', 'Office integration', 'Already in your Microsoft plan'],
    },
    priority: 'high',
  },
  {
    id: 'sug-4',
    subscriptionId: 'asana',
    type: 'downgrade',
    title: 'Reduce Asana seats',
    description: 'You have 15 seats but only 8 are active. Reduce to 10 seats.',
    potentialSavings: 8.33,
    priority: 'medium',
  },
  {
    id: 'sug-5',
    subscriptionId: 'notion',
    type: 'upgrade',
    title: 'Consider Notion Team upgrade',
    description: 'You\'re at seat capacity. Adding 2 more seats would cost £16/month but improve collaboration.',
    potentialSavings: -16,
    priority: 'low',
  },
];

interface SubscriptionManagerProps {
  compact?: boolean;
}

export function SubscriptionManager({ compact = false }: SubscriptionManagerProps) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(MOCK_SUBSCRIPTIONS);
  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>(MOCK_SUGGESTIONS);
  const [activeTab, setActiveTab] = useState<'overview' | 'subscriptions' | 'optimize' | 'vault'>('overview');
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);

  // Calculate totals
  const totalMonthly = subscriptions
    .filter(s => s.status !== 'cancelled')
    .reduce((sum, s) => sum + (s.billingCycle === 'monthly' ? s.cost : s.cost / 12), 0);
  
  const totalAnnual = totalMonthly * 12;
  
  const potentialSavings = suggestions
    .filter(s => s.potentialSavings > 0)
    .reduce((sum, s) => sum + s.potentialSavings, 0);

  const avgUsage = subscriptions.reduce((sum, s) => sum + s.usagePercent, 0) / subscriptions.length;

  const upcomingRenewals = subscriptions
    .filter(s => {
      const daysUntil = Math.ceil((s.renewalDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return daysUntil <= 7 && daysUntil > 0;
    });

  const categoryTotals = subscriptions.reduce((acc, s) => {
    if (s.status !== 'cancelled') {
      const monthly = s.billingCycle === 'monthly' ? s.cost : s.cost / 12;
      acc[s.category] = (acc[s.category] || 0) + monthly;
    }
    return acc;
  }, {} as Record<string, number>);

  const formatCurrency = (amount: number) => `£${amount.toFixed(2)}`;
  const formatDate = (date: Date) => date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

  const getDaysUntilRenewal = (date: Date) => {
    return Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  };

  const getUsageColor = (percent: number) => {
    if (percent >= 70) return 'text-green-400';
    if (percent >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getUsageBgColor = (percent: number) => {
    if (percent >= 70) return 'bg-green-500';
    if (percent >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (compact) {
    return (
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Subscriptions</h3>
          <span className="text-lg font-bold text-foreground">{formatCurrency(totalMonthly)}/mo</span>
        </div>
        
        {potentialSavings > 0 && (
          <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg mb-4">
            <PiggyBank className="w-5 h-5 text-green-400" />
            <span className="text-sm text-green-400">
              Save up to {formatCurrency(potentialSavings)}/mo
            </span>
          </div>
        )}

        <div className="space-y-2">
          {subscriptions.slice(0, 4).map(sub => (
            <div key={sub.id} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{sub.logo}</span>
                <span className="text-sm text-foreground">{sub.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs ${getUsageColor(sub.usagePercent)}`}>
                  {sub.usagePercent}%
                </span>
                <span className="text-sm text-muted-foreground">{formatCurrency(sub.cost)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500/20 via-cyan-500/20 to-blue-500/20 p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
              <CreditCard className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Subscription Intelligence</h2>
              <p className="text-sm text-muted-foreground">Track, analyze, and optimize your SaaS spend</p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-black/20 rounded-xl p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <DollarSign className="w-4 h-4" />
              <span className="text-xs">Monthly Spend</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{formatCurrency(totalMonthly)}</p>
            <p className="text-xs text-muted-foreground">{formatCurrency(totalAnnual)}/year</p>
          </div>

          <div className="bg-black/20 rounded-xl p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <PiggyBank className="w-4 h-4" />
              <span className="text-xs">Potential Savings</span>
            </div>
            <p className="text-2xl font-bold text-green-400">{formatCurrency(potentialSavings)}</p>
            <p className="text-xs text-muted-foreground">{suggestions.filter(s => s.potentialSavings > 0).length} optimizations</p>
          </div>

          <div className="bg-black/20 rounded-xl p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <BarChart3 className="w-4 h-4" />
              <span className="text-xs">Avg Usage</span>
            </div>
            <p className={`text-2xl font-bold ${getUsageColor(avgUsage)}`}>{avgUsage.toFixed(0)}%</p>
            <p className="text-xs text-muted-foreground">{subscriptions.length} subscriptions</p>
          </div>

          <div className="bg-black/20 rounded-xl p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Calendar className="w-4 h-4" />
              <span className="text-xs">Upcoming Renewals</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{upcomingRenewals.length}</p>
            <p className="text-xs text-muted-foreground">within 7 days</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        {(['overview', 'subscriptions', 'optimize', 'vault'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-4 py-3 text-sm font-medium capitalize transition-colors ${
              activeTab === tab
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Alerts */}
            {upcomingRenewals.length > 0 && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="w-5 h-5 text-yellow-400" />
                  <h3 className="font-semibold text-yellow-400">Upcoming Renewals</h3>
                </div>
                <div className="space-y-2">
                  {upcomingRenewals.map(sub => (
                    <div key={sub.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span>{sub.logo}</span>
                        <span className="text-foreground">{sub.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm text-foreground">{formatCurrency(sub.cost)}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          in {getDaysUntilRenewal(sub.renewalDate)} days
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top Suggestions */}
            <div>
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Top Optimization Opportunities
              </h3>
              <div className="space-y-3">
                {suggestions.filter(s => s.priority === 'high').slice(0, 3).map(sug => (
                  <div 
                    key={sug.id}
                    className="p-4 bg-gray-800/50 border border-gray-700 rounded-xl hover:border-primary/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {sug.type === 'downgrade' && <TrendingDown className="w-4 h-4 text-blue-400" />}
                          {sug.type === 'cancel' && <X className="w-4 h-4 text-red-400" />}
                          {sug.type === 'switch' && <RefreshCw className="w-4 h-4 text-purple-400" />}
                          <h4 className="font-medium text-foreground">{sug.title}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">{sug.description}</p>
                      </div>
                      <div className="text-right ml-4">
                        <span className="text-lg font-bold text-green-400">
                          Save {formatCurrency(sug.potentialSavings)}
                        </span>
                        <p className="text-xs text-muted-foreground">/month</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Spend by Category */}
            <div>
              <h3 className="font-semibold text-foreground mb-3">Spend by Category</h3>
              <div className="space-y-3">
                {Object.entries(categoryTotals)
                  .sort(([, a], [, b]) => b - a)
                  .map(([category, amount]) => (
                    <div key={category}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-foreground capitalize">{category}</span>
                        <span className="text-sm text-muted-foreground">{formatCurrency(amount)}/mo</span>
                      </div>
                      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-primary to-cyan-500"
                          style={{ width: `${(amount / totalMonthly) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'subscriptions' && (
          <div className="space-y-4">
            {subscriptions.map(sub => (
              <div 
                key={sub.id}
                className="p-4 bg-gray-800/50 border border-gray-700 rounded-xl hover:border-gray-600 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{sub.logo}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-foreground">{sub.name}</h4>
                        <span className="text-xs px-2 py-0.5 bg-gray-700 rounded-full text-muted-foreground">
                          {sub.plan}
                        </span>
                        {sub.status === 'expiring' && (
                          <span className="text-xs px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full">
                            Expiring Soon
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Renews {formatDate(sub.renewalDate)} • {sub.connectedAccount || 'Not connected'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-foreground">{formatCurrency(sub.cost)}</p>
                    <p className="text-xs text-muted-foreground">/{sub.billingCycle === 'monthly' ? 'mo' : 'yr'}</p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-4">
                  {/* Usage */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">Usage</span>
                      <span className={`text-xs font-medium ${getUsageColor(sub.usagePercent)}`}>
                        {sub.usagePercent}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${getUsageBgColor(sub.usagePercent)}`}
                        style={{ width: `${sub.usagePercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Features */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">Features</span>
                      <span className="text-xs text-foreground">
                        {sub.featuresUsed}/{sub.featuresTotal}
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500"
                        style={{ width: `${(sub.featuresUsed / sub.featuresTotal) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Seats (if applicable) */}
                  {sub.seats ? (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground">Seats</span>
                        <span className="text-xs text-foreground">
                          {sub.seats.used}/{sub.seats.total}
                        </span>
                      </div>
                      <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-purple-500"
                          style={{ width: `${(sub.seats.used / sub.seats.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <span className="text-xs text-muted-foreground">Last used</span>
                      <p className="text-xs text-foreground">{formatDate(sub.lastUsed)}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'optimize' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-foreground">All Optimization Suggestions</h3>
              <span className="text-sm text-green-400">
                Total savings: {formatCurrency(potentialSavings)}/mo
              </span>
            </div>

            {suggestions.map(sug => {
              const sub = subscriptions.find(s => s.id === sug.subscriptionId);
              return (
                <div 
                  key={sug.id}
                  className={`p-4 border rounded-xl ${
                    sug.priority === 'high' 
                      ? 'bg-green-500/5 border-green-500/30' 
                      : sug.priority === 'medium'
                      ? 'bg-yellow-500/5 border-yellow-500/30'
                      : 'bg-gray-800/50 border-gray-700'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{sub?.logo}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-foreground">{sug.title}</h4>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            sug.priority === 'high' 
                              ? 'bg-green-500/20 text-green-400'
                              : sug.priority === 'medium'
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-gray-700 text-muted-foreground'
                          }`}>
                            {sug.priority} priority
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{sug.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {sug.potentialSavings > 0 ? (
                        <>
                          <span className="text-lg font-bold text-green-400">
                            Save {formatCurrency(sug.potentialSavings)}
                          </span>
                          <p className="text-xs text-muted-foreground">/month</p>
                        </>
                      ) : (
                        <>
                          <span className="text-lg font-bold text-yellow-400">
                            +{formatCurrency(Math.abs(sug.potentialSavings))}
                          </span>
                          <p className="text-xs text-muted-foreground">/month</p>
                        </>
                      )}
                    </div>
                  </div>

                  {sug.alternative && (
                    <div className="mt-3 p-3 bg-black/20 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-foreground">
                          Suggested: {sug.alternative.name}
                        </span>
                        <span className="text-sm text-green-400">
                          {sug.alternative.cost === 0 ? 'Free' : formatCurrency(sug.alternative.cost) + '/mo'}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {sug.alternative.features.map((feature, i) => (
                          <span key={i} className="text-xs px-2 py-1 bg-gray-700 rounded text-muted-foreground">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-3 flex gap-2">
                    <button className="flex-1 py-2 bg-primary/10 border border-primary/30 rounded-lg text-primary text-sm hover:bg-primary/20 transition-colors">
                      Apply Suggestion
                    </button>
                    <button className="px-4 py-2 bg-gray-700 rounded-lg text-muted-foreground text-sm hover:bg-gray-600 transition-colors">
                      Dismiss
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'vault' && (
          <div className="space-y-4">
            <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <Shield className="w-6 h-6 text-purple-400" />
                <div>
                  <h3 className="font-semibold text-foreground">Secure Credential Storage</h3>
                  <p className="text-sm text-muted-foreground">
                    All subscription credentials are encrypted and stored in The Vault
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {subscriptions.map(sub => (
                <div 
                  key={sub.id}
                  className="p-4 bg-gray-800/50 border border-gray-700 rounded-xl"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{sub.logo}</span>
                      <div>
                        <h4 className="font-medium text-foreground">{sub.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {sub.connectedAccount || 'No account linked'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {sub.connectedAccount ? (
                        <span className="flex items-center gap-1 text-xs text-green-400">
                          <Check className="w-3 h-3" />
                          Stored
                        </span>
                      ) : (
                        <button className="text-xs px-3 py-1 bg-primary/10 border border-primary/30 rounded text-primary hover:bg-primary/20 transition-colors">
                          Link Account
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full py-3 bg-purple-500/10 border border-purple-500/30 rounded-xl text-purple-400 hover:bg-purple-500/20 transition-colors flex items-center justify-center gap-2">
              <Shield className="w-4 h-4" />
              Open The Vault
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ROI Calculator component
export function SubscriptionROI({ subscription }: { subscription: Subscription }) {
  // Mock ROI calculation
  const hoursSavedPerMonth = Math.round(subscription.usagePercent * 0.5);
  const hourlyRate = 50; // £50/hour assumed
  const valueGenerated = hoursSavedPerMonth * hourlyRate;
  const roi = ((valueGenerated - subscription.cost) / subscription.cost) * 100;

  return (
    <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-xl">
      <h4 className="font-medium text-foreground mb-3">ROI Analysis: {subscription.name}</h4>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <span className="text-xs text-muted-foreground">Time Saved</span>
          <p className="text-lg font-bold text-foreground">{hoursSavedPerMonth}hrs/mo</p>
        </div>
        <div>
          <span className="text-xs text-muted-foreground">Value Generated</span>
          <p className="text-lg font-bold text-green-400">£{valueGenerated}</p>
        </div>
        <div>
          <span className="text-xs text-muted-foreground">Cost</span>
          <p className="text-lg font-bold text-foreground">£{subscription.cost}</p>
        </div>
        <div>
          <span className="text-xs text-muted-foreground">ROI</span>
          <p className={`text-lg font-bold ${roi > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {roi > 0 ? '+' : ''}{roi.toFixed(0)}%
          </p>
        </div>
      </div>
    </div>
  );
}
