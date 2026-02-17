import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle2, 
  Circle, 
  AlertCircle, 
  Clock,
  Shield,
  Code,
  Database,
  FileText,
  Palette,
  Zap,
  Users,
  Settings,
  Rocket
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  category: string;
  smeOwner: string;
  status: "pending" | "in_progress" | "passed" | "failed" | "blocked";
  priority: "critical" | "high" | "medium" | "low";
  notes?: string;
}

const CHECKLIST_ITEMS: ChecklistItem[] = [
  // Chief of Staff Review
  { id: "cos-1", title: "Design Guidelines Compliance", description: "All outputs follow CEPHO Master Design Guidelines", category: "Chief of Staff", smeOwner: "Chief of Staff", status: "pending", priority: "critical" },
  { id: "cos-2", title: "Quality Gate Validation", description: "All documents pass through quality gate before delivery", category: "Chief of Staff", smeOwner: "Chief of Staff", status: "pending", priority: "critical" },
  { id: "cos-3", title: "Process Documentation", description: "All processes clearly documented and optimized", category: "Chief of Staff", smeOwner: "Chief of Staff", status: "pending", priority: "high" },
  
  // UI/UX Review
  { id: "ux-1", title: "Design Consistency", description: "All UI elements follow consistent design language", category: "UI/UX", smeOwner: "UI/UX Expert", status: "pending", priority: "critical" },
  { id: "ux-2", title: "Responsive Design", description: "All pages work on mobile, tablet, and desktop", category: "UI/UX", smeOwner: "UI/UX Expert", status: "pending", priority: "high" },
  { id: "ux-3", title: "Accessibility", description: "WCAG 2.1 AA compliance for accessibility", category: "UI/UX", smeOwner: "UI/UX Expert", status: "pending", priority: "high" },
  { id: "ux-4", title: "Navigation Flow", description: "Clear navigation with no dead-ends", category: "UI/UX", smeOwner: "UI/UX Expert", status: "pending", priority: "high" },
  { id: "ux-5", title: "Loading States", description: "All async operations show proper loading states", category: "UI/UX", smeOwner: "UI/UX Expert", status: "pending", priority: "medium" },
  
  // Software Architecture
  { id: "arch-1", title: "System Architecture", description: "Clean architecture with proper separation of concerns", category: "Architecture", smeOwner: "Software Architect", status: "pending", priority: "critical" },
  { id: "arch-2", title: "Scalability Review", description: "System can handle expected load and growth", category: "Architecture", smeOwner: "Software Architect", status: "pending", priority: "high" },
  { id: "arch-3", title: "Integration Points", description: "All integrations documented and tested", category: "Architecture", smeOwner: "Software Architect", status: "pending", priority: "high" },
  
  // Backend Development
  { id: "be-1", title: "API Design", description: "RESTful/tRPC APIs follow best practices", category: "Backend", smeOwner: "Backend Developer", status: "pending", priority: "critical" },
  { id: "be-2", title: "Database Optimization", description: "Queries optimized, indexes in place", category: "Backend", smeOwner: "Backend Developer", status: "pending", priority: "high" },
  { id: "be-3", title: "Error Handling", description: "Proper error handling and logging", category: "Backend", smeOwner: "Backend Developer", status: "pending", priority: "critical" },
  { id: "be-4", title: "Security Review", description: "Authentication, authorization, input validation", category: "Backend", smeOwner: "Backend Developer", status: "pending", priority: "critical" },
  
  // Frontend Development
  { id: "fe-1", title: "Code Quality", description: "Clean, maintainable TypeScript code", category: "Frontend", smeOwner: "Frontend Developer", status: "pending", priority: "high" },
  { id: "fe-2", title: "Performance", description: "Fast load times, optimized bundle size", category: "Frontend", smeOwner: "Frontend Developer", status: "pending", priority: "high" },
  { id: "fe-3", title: "State Management", description: "Proper state handling, no memory leaks", category: "Frontend", smeOwner: "Frontend Developer", status: "pending", priority: "medium" },
  
  // Code Optimization
  { id: "opt-1", title: "Bundle Size", description: "JavaScript bundle under 500KB gzipped", category: "Optimization", smeOwner: "Code Optimization Expert", status: "pending", priority: "medium" },
  { id: "opt-2", title: "Load Time", description: "First contentful paint under 2 seconds", category: "Optimization", smeOwner: "Code Optimization Expert", status: "pending", priority: "high" },
  { id: "opt-3", title: "Image Optimization", description: "All images optimized and lazy-loaded", category: "Optimization", smeOwner: "Code Optimization Expert", status: "pending", priority: "medium" },
  
  // QA/Testing
  { id: "qa-1", title: "Unit Tests", description: "Critical paths covered by unit tests", category: "QA", smeOwner: "QA Expert", status: "pending", priority: "high" },
  { id: "qa-2", title: "Integration Tests", description: "Key flows tested end-to-end", category: "QA", smeOwner: "QA Expert", status: "pending", priority: "high" },
  { id: "qa-3", title: "Edge Cases", description: "Error states and edge cases handled", category: "QA", smeOwner: "QA Expert", status: "pending", priority: "medium" },
  { id: "qa-4", title: "Cross-Browser Testing", description: "Works on Chrome, Firefox, Safari, Edge", category: "QA", smeOwner: "QA Expert", status: "pending", priority: "medium" },
  
  // DevOps
  { id: "ops-1", title: "Deployment Ready", description: "CI/CD pipeline configured and tested", category: "DevOps", smeOwner: "DevOps", status: "pending", priority: "critical" },
  { id: "ops-2", title: "Monitoring", description: "Error tracking and performance monitoring", category: "DevOps", smeOwner: "DevOps", status: "pending", priority: "high" },
  { id: "ops-3", title: "Logging", description: "Structured logging for debugging", category: "DevOps", smeOwner: "DevOps", status: "pending", priority: "medium" },
];

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  "Chief of Staff": <Shield className="w-4 h-4" />,
  "UI/UX": <Palette className="w-4 h-4" />,
  "Architecture": <Settings className="w-4 h-4" />,
  "Backend": <Database className="w-4 h-4" />,
  "Frontend": <Code className="w-4 h-4" />,
  "Optimization": <Zap className="w-4 h-4" />,
  "QA": <FileText className="w-4 h-4" />,
  "DevOps": <Rocket className="w-4 h-4" />,
};

const STATUS_CONFIG = {
  pending: { icon: Circle, color: "text-muted-foreground", bg: "bg-muted" },
  in_progress: { icon: Clock, color: "text-yellow-500", bg: "bg-yellow-500/10" },
  passed: { icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10" },
  failed: { icon: AlertCircle, color: "text-red-500", bg: "bg-red-500/10" },
  blocked: { icon: AlertCircle, color: "text-orange-500", bg: "bg-orange-500/10" },
};

export function GoLiveChecklist() {
  const [items, setItems] = useState<ChecklistItem[]>(CHECKLIST_ITEMS);
  
  const passedCount = items.filter(i => i.status === "passed").length;
  const totalCount = items.length;
  const progress = (passedCount / totalCount) * 100;
  const criticalPending = items.filter(i => i.priority === "critical" && i.status !== "passed").length;
  
  const categories = Array.from(new Set(items.map(i => i.category)));
  
  const updateStatus = (id: string, status: ChecklistItem["status"]) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, status } : item
    ));
  };
  
  const isReadyToLaunch = criticalPending === 0 && progress >= 80;
  
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Go-Live Protocol</h1>
          <p className="text-muted-foreground">SME Review Checklist</p>
        </div>
        <Button 
          size="lg"
          disabled={!isReadyToLaunch}
          className={cn(
            "gap-2",
            isReadyToLaunch 
              ? "bg-green-600 hover:bg-green-700" 
              : "bg-muted text-muted-foreground"
          )}
        >
          <Rocket className="w-4 h-4" />
          {isReadyToLaunch ? "Ready to Launch" : "Not Ready"}
        </Button>
      </div>
      
      {/* Progress Overview */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-muted-foreground">
                {passedCount} of {totalCount} items passed
              </span>
            </div>
            <Progress value={progress} className="h-3" />
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span>Passed: {items.filter(i => i.status === "passed").length}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <span>In Progress: {items.filter(i => i.status === "in_progress").length}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span>Failed: {items.filter(i => i.status === "failed").length}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-muted" />
                <span>Pending: {items.filter(i => i.status === "pending").length}</span>
              </div>
            </div>
            {criticalPending > 0 && (
              <div className="flex items-center gap-2 text-red-500 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{criticalPending} critical items still pending</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Checklist by Category */}
      {categories.map(category => {
        const categoryItems = items.filter(i => i.category === category);
        const categoryPassed = categoryItems.filter(i => i.status === "passed").length;
        
        return (
          <Card key={category}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {CATEGORY_ICONS[category]}
                  <CardTitle className="text-lg">{category}</CardTitle>
                </div>
                <Badge variant="outline">
                  {categoryPassed}/{categoryItems.length} passed
                </Badge>
              </div>
              <CardDescription>
                Owner: {categoryItems[0]?.smeOwner}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {categoryItems.map(item => {
                  const StatusIcon = STATUS_CONFIG[item.status].icon;
                  return (
                    <div 
                      key={item.id}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg border",
                        STATUS_CONFIG[item.status].bg
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <StatusIcon className={cn("w-5 h-5", STATUS_CONFIG[item.status].color)} />
                        <div>
                          <p className="font-medium text-sm">{item.title}</p>
                          <p className="text-xs text-muted-foreground">{item.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.priority === "critical" && (
                          <Badge variant="destructive" className="text-xs">Critical</Badge>
                        )}
                        <select
                          value={item.status}
                          onChange={(e) => updateStatus(item.id, e.target.value as ChecklistItem["status"])}
                          className="text-xs bg-background border rounded px-2 py-1"
                        >
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="passed">Passed</option>
                          <option value="failed">Failed</option>
                          <option value="blocked">Blocked</option>
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export default GoLiveChecklist;
