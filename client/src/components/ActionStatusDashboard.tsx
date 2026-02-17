/**
 * Action Status Dashboard
 * 
 * Clear landing page dashboard showing action status across all areas
 */

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  Calendar,
  Target,
  Zap,
  ChevronRight,
  Play,
  Pause,
  RotateCcw
} from "lucide-react";

// =============================================================================
// TYPES
// =============================================================================

interface ActionItem {
  id: string;
  title: string;
  description: string;
  status: "completed" | "in_progress" | "pending" | "blocked";
  priority: "high" | "medium" | "low";
  category: string;
  dueDate?: string;
  progress?: number;
  assignee?: string;
}

interface CategorySummary {
  name: string;
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
  blocked: number;
}

// =============================================================================
// MOCK DATA
// =============================================================================

const mockActions: ActionItem[] = [
  { id: "1", title: "Complete CEO KPI Report", description: "Generate monthly scorecard with all 75 categories", status: "completed", priority: "high", category: "Executive", progress: 100 },
  { id: "2", title: "Wire NPS Survey to Dashboard", description: "Connect NPS component to user touchpoints", status: "completed", priority: "high", category: "Operations", progress: 100 },
  { id: "3", title: "Implement COS Learning System", description: "Build pattern analysis and preference modeling", status: "in_progress", priority: "high", category: "Technology", progress: 75 },
  { id: "4", title: "Create Document Templates", description: "CEPHO branded templates for all report types", status: "in_progress", priority: "medium", category: "Content", progress: 85 },
  { id: "5", title: "Claim Stripe Sandbox", description: "Activate payment processing for subscriptions", status: "pending", priority: "high", category: "Finance", dueDate: "Mar 18, 2026" },
  { id: "6", title: "Voice Integration", description: "Connect ElevenLabs to Morning Signal", status: "pending", priority: "medium", category: "Technology" },
  { id: "7", title: "Brand Awareness Campaign", description: "Launch content calendar and social strategy", status: "pending", priority: "medium", category: "Growth" },
  { id: "8", title: "Customer Validation Interviews", description: "Schedule and conduct 10 customer interviews", status: "blocked", priority: "high", category: "Growth", dueDate: "Jan 25, 2026" },
];

const mockCategories: CategorySummary[] = [
  { name: "Executive", total: 5, completed: 3, inProgress: 1, pending: 1, blocked: 0 },
  { name: "Technology", total: 12, completed: 7, inProgress: 3, pending: 2, blocked: 0 },
  { name: "Operations", total: 8, completed: 5, inProgress: 2, pending: 1, blocked: 0 },
  { name: "Growth", total: 6, completed: 1, inProgress: 1, pending: 3, blocked: 1 },
  { name: "Finance", total: 4, completed: 2, inProgress: 0, pending: 2, blocked: 0 },
  { name: "Content", total: 7, completed: 4, inProgress: 2, pending: 1, blocked: 0 },
];

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

const getStatusIcon = (status: ActionItem["status"]) => {
  switch (status) {
    case "completed": return <CheckCircle2 className="h-4 w-4 text-green-400" />;
    case "in_progress": return <Play className="h-4 w-4 text-blue-400" />;
    case "pending": return <Clock className="h-4 w-4 text-amber-400" />;
    case "blocked": return <AlertCircle className="h-4 w-4 text-red-400" />;
  }
};

const getStatusColor = (status: ActionItem["status"]) => {
  switch (status) {
    case "completed": return "bg-green-500/20 text-green-400 border-green-500/30";
    case "in_progress": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    case "pending": return "bg-amber-500/20 text-amber-400 border-amber-500/30";
    case "blocked": return "bg-red-500/20 text-red-400 border-red-500/30";
  }
};

const getPriorityColor = (priority: ActionItem["priority"]) => {
  switch (priority) {
    case "high": return "text-red-400";
    case "medium": return "text-amber-400";
    case "low": return "text-gray-400";
  }
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function ActionStatusDashboard() {
  const [filter, setFilter] = useState<"all" | "in_progress" | "pending" | "blocked">("all");
  
  const totalActions = mockActions.length;
  const completedActions = mockActions.filter(a => a.status === "completed").length;
  const inProgressActions = mockActions.filter(a => a.status === "in_progress").length;
  const pendingActions = mockActions.filter(a => a.status === "pending").length;
  const blockedActions = mockActions.filter(a => a.status === "blocked").length;
  
  const overallProgress = Math.round((completedActions / totalActions) * 100);
  
  const filteredActions = filter === "all" 
    ? mockActions.filter(a => a.status !== "completed")
    : mockActions.filter(a => a.status === filter);

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-white">{overallProgress}%</p>
                <p className="text-sm text-muted-foreground">Overall Progress</p>
              </div>
              <div className="p-3 rounded-xl bg-[#E91E8C]/20">
                <TrendingUp className="h-6 w-6 text-[#E91E8C]" />
              </div>
            </div>
            <Progress value={overallProgress} className="mt-3 h-2" />
          </CardContent>
        </Card>
        
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-400">{completedActions}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-400/50" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-blue-400">{inProgressActions}</p>
                <p className="text-sm text-muted-foreground">In Progress</p>
              </div>
              <Play className="h-8 w-8 text-blue-400/50" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-amber-400">{pendingActions + blockedActions}</p>
                <p className="text-sm text-muted-foreground">Pending / Blocked</p>
              </div>
              <Clock className="h-8 w-8 text-amber-400/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Action List */}
        <div className="lg:col-span-2">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white">Action Items</CardTitle>
                  <CardDescription>Track progress on priority actions</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant={filter === "all" ? "default" : "outline"} 
                    size="sm"
                    onClick={() => setFilter("all")}
                    className={filter === "all" ? "bg-[#E91E8C]" : ""}
                  >
                    Active
                  </Button>
                  <Button 
                    variant={filter === "in_progress" ? "default" : "outline"} 
                    size="sm"
                    onClick={() => setFilter("in_progress")}
                    className={filter === "in_progress" ? "bg-blue-500" : ""}
                  >
                    In Progress
                  </Button>
                  <Button 
                    variant={filter === "blocked" ? "default" : "outline"} 
                    size="sm"
                    onClick={() => setFilter("blocked")}
                    className={filter === "blocked" ? "bg-red-500" : ""}
                  >
                    Blocked
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {filteredActions.map(action => (
                    <div 
                      key={action.id} 
                      className="p-4 rounded-lg bg-gray-800/50 border border-gray-700 hover:border-gray-600 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        {getStatusIcon(action.status)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="text-sm font-medium text-white truncate">{action.title}</h4>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={getStatusColor(action.status)}>
                                {action.status.replace("_", " ")}
                              </Badge>
                              <span className={`text-xs ${getPriorityColor(action.priority)}`}>
                                {action.priority.toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{action.description}</p>
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="text-xs">{action.category}</Badge>
                            {action.progress !== undefined && action.progress < 100 && (
                              <div className="flex items-center gap-2">
                                <Progress value={action.progress} className="w-20 h-1.5" />
                                <span className="text-xs text-muted-foreground">{action.progress}%</span>
                              </div>
                            )}
                            {action.dueDate && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {action.dueDate}
                              </span>
                            )}
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="shrink-0">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Category Breakdown */}
        <div>
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">By Category</CardTitle>
              <CardDescription>Progress across business areas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockCategories.map(category => {
                  const progress = Math.round((category.completed / category.total) * 100);
                  return (
                    <div key={category.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-white">{category.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {category.completed}/{category.total}
                        </span>
                      </div>
                      <Progress value={progress} className="h-2" />
                      <div className="flex gap-2 text-xs">
                        {category.inProgress > 0 && (
                          <span className="text-blue-400">{category.inProgress} active</span>
                        )}
                        {category.blocked > 0 && (
                          <span className="text-red-400">{category.blocked} blocked</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-gray-900/50 border-gray-800 mt-4">
            <CardHeader>
              <CardTitle className="text-white text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start border-gray-700 hover:border-[#E91E8C]/50">
                  <Zap className="h-4 w-4 mr-2 text-[#E91E8C]" />
                  Start Next Priority
                </Button>
                <Button variant="outline" className="w-full justify-start border-gray-700 hover:border-[#E91E8C]/50">
                  <Target className="h-4 w-4 mr-2 text-[#E91E8C]" />
                  Review Blocked Items
                </Button>
                <Button variant="outline" className="w-full justify-start border-gray-700 hover:border-[#E91E8C]/50">
                  <RotateCcw className="h-4 w-4 mr-2 text-[#E91E8C]" />
                  Refresh Status
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default ActionStatusDashboard;
