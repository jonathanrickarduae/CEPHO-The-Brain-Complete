import { useState } from "react";
import DashboardLayout from '@/components/project-management/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Lightbulb, 
  TrendingUp, 
  DollarSign, 
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  Plus,
  Building2,
  CreditCard,
  Target,
  Rocket,
  FileText,
  Eye,
  MoreHorizontal
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import SubscriptionTracker from '@/components/shared/SubscriptionTracker';
import OptimizationAssessment from '@/components/expert-evolution/OptimizationAssessment';
import FundingAssessment from '@/components/expert-evolution/FundingAssessment';
import { ChiefOfStaffRoadmap } from '@/components/shared/ChiefOfStaffRoadmap';
import { FivePhaseRoadmap } from '@/components/shared/FivePhaseRoadmap';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Brain, Gauge, Map } from "lucide-react";

// Stage configuration for the development pipeline
const PIPELINE_STAGES = [
  { id: 1, name: "Captured", color: "bg-slate-500" },
  { id: 2, name: "Assessing", color: "bg-blue-500" },
  { id: 3, name: "Refining", color: "bg-amber-500" },
  { id: 4, name: "Validated", color: "bg-emerald-500" },
  { id: 5, name: "Promoted", color: "bg-purple-500" },
];

export default function DevelopmentPathway() {
  const [activeTab, setActiveTab] = useState("overview");
  
  // Fetch ideas from Innovation Hub
  const { data: ideas, isLoading: ideasLoading } = trpc.innovation.getIdeas.useQuery({});
  
  // Calculate pipeline statistics
  const pipelineStats = {
    total: ideas?.length || 0,
    captured: ideas?.filter(i => i.status === "captured").length || 0,
    assessing: ideas?.filter(i => i.status === "assessing").length || 0,
    validated: ideas?.filter(i => i.status === "validated").length || 0,
    promoted: ideas?.filter(i => i.status === "promoted_to_genesis").length || 0,
  };

  // Get recent ideas for quick view
  const recentIdeas = ideas?.slice(0, 5) || [];

  // Next review date (Monday or Thursday, whichever is next)
  const getNextReviewDate = () => {
    const now = new Date();
    const day = now.getDay();
    let daysUntilReview;
    
    if (day < 1) daysUntilReview = 1; // Sunday -> Monday
    else if (day < 4) daysUntilReview = 4 - day; // Mon-Wed -> Thursday
    else if (day === 4) daysUntilReview = 0; // Thursday
    else daysUntilReview = 8 - day; // Fri-Sat -> Monday
    
    const nextReview = new Date(now);
    nextReview.setDate(now.getDate() + daysUntilReview);
    return nextReview.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Development Pathway</h1>
            <p className="text-foreground/70 mt-1">Track ideas from capture to launch with Chief of Staff oversight</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-foreground/60">Next Review</p>
              <p className="text-sm font-medium text-cyan-400">{getNextReviewDate()}</p>
            </div>
            <Link href="/innovation-hub">
              <Button className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600">
                <Plus className="w-4 h-4 mr-2" />
                Capture Idea
              </Button>
            </Link>
          </div>
        </div>

        {/* Pipeline Overview Cards */}
        <div className="grid grid-cols-5 gap-4">
          {PIPELINE_STAGES.map((stage, index) => {
            const count = stage.id === 1 ? pipelineStats.captured :
                         stage.id === 2 ? pipelineStats.assessing :
                         stage.id === 4 ? pipelineStats.validated :
                         stage.id === 5 ? pipelineStats.promoted : 0;
            return (
              <Card key={stage.id} className="bg-gray-900/50 border-gray-800 relative overflow-hidden">
                <div className={`absolute top-0 left-0 right-0 h-1 ${stage.color}`} />
                <CardContent className="pt-4 pb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-foreground/70 text-sm">{stage.name}</span>
                    {index < PIPELINE_STAGES.length - 1 && (
                      <ArrowRight className="w-4 h-4 text-foreground/50" />
                    )}
                  </div>
                  <p className="text-2xl font-bold text-white mt-1">{count}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-gray-900/50 border border-gray-800">
            <TabsTrigger value="overview" className="data-[state=active]:bg-gray-800">
              <Target className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="innovation" className="data-[state=active]:bg-gray-800">
              <Lightbulb className="w-4 h-4 mr-2" />
              Innovation Hub
            </TabsTrigger>
            <TabsTrigger value="funding" className="data-[state=active]:bg-gray-800">
              <Building2 className="w-4 h-4 mr-2" />
              Government Funding
            </TabsTrigger>
            <TabsTrigger value="subscriptions" className="data-[state=active]:bg-gray-800">
              <CreditCard className="w-4 h-4 mr-2" />
              Subscriptions
            </TabsTrigger>
            <TabsTrigger value="reviews" className="data-[state=active]:bg-gray-800">
              <Calendar className="w-4 h-4 mr-2" />
              Chief of Staff Reviews
            </TabsTrigger>
            <TabsTrigger value="optimization" className="data-[state=active]:bg-gray-800">
              <Gauge className="w-4 h-4 mr-2" />
              System Optimization
            </TabsTrigger>
            <TabsTrigger value="5phase" className="data-[state=active]:bg-gray-800">
              <Rocket className="w-4 h-4 mr-2" />
              5-Phase Roadmap
            </TabsTrigger>
            <TabsTrigger value="roadmap" className="data-[state=active]:bg-gray-800">
              <Map className="w-4 h-4 mr-2" />
              CoS Roadmap
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {/* Pipeline Health */}
              <Card className="bg-gray-900/50 border-gray-800 col-span-2">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-cyan-400" />
                    Pipeline Health
                  </CardTitle>
                  <CardDescription>Current status of your development pipeline</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-gray-800/50 rounded-lg">
                      <div className="flex items-center gap-2 text-emerald-400 mb-2">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="text-sm">On Track</span>
                      </div>
                      <p className="text-2xl font-bold text-white">{pipelineStats.validated}</p>
                      <p className="text-xs text-foreground/60">Validated ideas ready for action</p>
                    </div>
                    <div className="p-4 bg-gray-800/50 rounded-lg">
                      <div className="flex items-center gap-2 text-amber-400 mb-2">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">In Progress</span>
                      </div>
                      <p className="text-2xl font-bold text-white">{pipelineStats.assessing}</p>
                      <p className="text-xs text-foreground/60">Ideas being assessed</p>
                    </div>
                    <div className="p-4 bg-gray-800/50 rounded-lg">
                      <div className="flex items-center gap-2 text-blue-400 mb-2">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm">Awaiting Review</span>
                      </div>
                      <p className="text-2xl font-bold text-white">{pipelineStats.captured}</p>
                      <p className="text-xs text-foreground/60">New ideas to review</p>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground/70">Pipeline Progress</span>
                      <span className="text-white">{pipelineStats.total > 0 ? Math.round((pipelineStats.validated / pipelineStats.total) * 100) : 0}% validated</span>
                    </div>
                    <Progress value={pipelineStats.total > 0 ? (pipelineStats.validated / pipelineStats.total) * 100 : 0} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Rocket className="w-5 h-5 text-purple-400" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href="/innovation-hub">
                    <Button variant="outline" className="w-full justify-start border-gray-700 hover:bg-gray-800">
                      <Lightbulb className="w-4 h-4 mr-2 text-cyan-400" />
                      Open Innovation Hub
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full justify-start border-gray-700 hover:bg-gray-800" onClick={() => setActiveTab("funding")}>
                    <Building2 className="w-4 h-4 mr-2 text-emerald-400" />
                    Check Funding Options
                  </Button>
                  <Button variant="outline" className="w-full justify-start border-gray-700 hover:bg-gray-800" onClick={() => setActiveTab("subscriptions")}>
                    <CreditCard className="w-4 h-4 mr-2 text-amber-400" />
                    Review Subscriptions
                  </Button>
                  <Button variant="outline" className="w-full justify-start border-gray-700 hover:bg-gray-800" onClick={() => setActiveTab("reviews")}>
                    <Calendar className="w-4 h-4 mr-2 text-purple-400" />
                    Schedule Review
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Recent Ideas */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-cyan-400" />
                    Recent Ideas
                  </CardTitle>
                  <CardDescription>Latest additions to your development pipeline</CardDescription>
                </div>
                <Link href="/innovation-hub">
                  <Button variant="ghost" size="sm" className="text-cyan-400 hover:text-cyan-300">
                    View All
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {ideasLoading ? (
                  <div className="text-center py-8 text-foreground/60">Loading ideas...</div>
                ) : recentIdeas.length === 0 ? (
                  <div className="text-center py-8">
                    <Lightbulb className="w-12 h-12 text-foreground/50 mx-auto mb-3" />
                    <p className="text-foreground/70">No ideas captured yet</p>
                    <Link href="/innovation-hub">
                      <Button className="mt-4" variant="outline">
                        <Plus className="w-4 h-4 mr-2" />
                        Capture Your First Idea
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentIdeas.map((idea) => (
                      <div key={idea.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${
                            idea.status === 'validated' ? 'bg-emerald-500' :
                            idea.status === 'assessing' ? 'bg-blue-500' :
                            idea.status === 'captured' ? 'bg-slate-500' : 'bg-gray-500'
                          }`} />
                          <div>
                            <p className="text-white font-medium">{idea.title}</p>
                            <p className="text-xs text-foreground/60">Stage {idea.currentStage} • {idea.status}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {idea.confidenceScore && (
                            <Badge variant="outline" className="border-gray-700">
                              {Math.round(idea.confidenceScore)}%
                            </Badge>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-gray-900 border-gray-800">
                              <Link href="/innovation-hub">
                                <DropdownMenuItem className="cursor-pointer">
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                              </Link>
                              <DropdownMenuItem className="cursor-pointer">
                                <FileText className="w-4 h-4 mr-2" />
                                Generate Brief
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Innovation Hub Tab */}
          <TabsContent value="innovation">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-cyan-400" />
                  Innovation Hub
                </CardTitle>
                <CardDescription>Capture, assess, and validate business ideas through the 5-stage flywheel</CardDescription>
              </CardHeader>
              <CardContent className="text-center py-8">
                <Lightbulb className="w-16 h-16 text-cyan-400/50 mx-auto mb-4" />
                <p className="text-foreground/70 mb-4">Access the full Innovation Hub to manage your ideas pipeline</p>
                <Link href="/innovation-hub">
                  <Button className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600">
                    <Lightbulb className="w-4 h-4 mr-2" />
                    Open Innovation Hub
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Government Funding Tab */}
          <TabsContent value="funding">
            <FundingAssessment />
          </TabsContent>

          {/* Subscriptions Tab */}
          <TabsContent value="subscriptions">
            <SubscriptionTracker />
          </TabsContent>

          {/* System Optimization Tab */}
          <TabsContent value="optimization">
            <OptimizationAssessment />
          </TabsContent>

          {/* 5-Phase Roadmap Tab */}
          <TabsContent value="5phase">
            <FivePhaseRoadmap />
          </TabsContent>

          {/* Chief of Staff Roadmap Tab */}
          <TabsContent value="roadmap">
            <ChiefOfStaffRoadmap />
          </TabsContent>

          {/* Chief of Staff Reviews Tab */}
          <TabsContent value="reviews">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-400" />
                  Chief of Staff Reviews
                </CardTitle>
                <CardDescription>Twice-weekly reviews of your development pathway</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  {/* Schedule */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Review Schedule</h3>
                    <div className="space-y-3">
                      <div className="p-4 bg-gray-800/50 rounded-lg border-l-4 border-cyan-500">
                        <div className="flex items-center justify-between">
                          <span className="text-white font-medium">Monday Review</span>
                          <Badge className="bg-cyan-500/20 text-cyan-400">Weekly</Badge>
                        </div>
                        <p className="text-sm text-foreground/70 mt-1">Start of week planning & priority setting</p>
                      </div>
                      <div className="p-4 bg-gray-800/50 rounded-lg border-l-4 border-purple-500">
                        <div className="flex items-center justify-between">
                          <span className="text-white font-medium">Thursday Review</span>
                          <Badge className="bg-purple-500/20 text-purple-400">Weekly</Badge>
                        </div>
                        <p className="text-sm text-foreground/70 mt-1">Mid-week progress check & adjustments</p>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-lg border border-cyan-500/20">
                      <p className="text-sm text-foreground/80">
                        <strong className="text-white">Next Review:</strong> {getNextReviewDate()}
                      </p>
                      <p className="text-xs text-foreground/60 mt-1">You'll receive a reminder notification</p>
                    </div>
                  </div>
                  
                  {/* Review Focus Areas */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Review Focus Areas</h3>
                    <div className="space-y-2">
                      {[
                        { icon: Lightbulb, label: "New Ideas to Review", count: pipelineStats.captured },
                        { icon: TrendingUp, label: "Ideas in Assessment", count: pipelineStats.assessing },
                        { icon: CheckCircle2, label: "Validated & Ready", count: pipelineStats.validated },
                        { icon: DollarSign, label: "Funding Opportunities", count: 8 },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <item.icon className="w-5 h-5 text-foreground/70" />
                            <span className="text-foreground/80">{item.label}</span>
                          </div>
                          <Badge variant="outline" className="border-gray-700">{item.count}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
