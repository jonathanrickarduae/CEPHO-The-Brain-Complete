// @ts-nocheck
import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Lightbulb,
  Plus,
  ArrowRight,
  Search,
  DollarSign,
  FileText,
  Rocket,
  RefreshCw,
  ExternalLink,
  CheckCircle,
  Sparkles,
  Brain,
  Users,
  Zap,
  AlertCircle,
  CheckCircle2,
  Eye,
  Loader2,
  TrendingUp,
  Filter,
} from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";

// Flywheel stages
const FLYWHEEL_STAGES = [
  { id: 1, name: "Capture",  icon: Lightbulb,  color: "text-yellow-400", bg: "bg-yellow-500/15", border: "border-yellow-500/30", description: "Idea intake" },
  { id: 2, name: "Assess",   icon: Search,     color: "text-blue-400",   bg: "bg-blue-500/15",   border: "border-blue-500/30",   description: "Strategic eval" },
  { id: 3, name: "Consult",  icon: Users,      color: "text-purple-400", bg: "bg-purple-500/15", border: "border-purple-500/30", description: "SME feedback" },
  { id: 4, name: "Refine",   icon: RefreshCw,  color: "text-orange-400", bg: "bg-orange-500/15", border: "border-orange-500/30", description: "Iterate" },
  { id: 5, name: "Brief",    icon: FileText,   color: "text-green-400",  bg: "bg-green-500/15",  border: "border-green-500/30",  description: "Actionable summary" },
];

const STATUS_COLORS: Record<string, string> = {
  captured: "bg-yellow-500/20 text-yellow-400",
  assessing: "bg-primary/20 text-primary",
  refining: "bg-orange-500/20 text-orange-400",
  validated: "bg-green-500/20 text-green-400",
  rejected: "bg-red-500/20 text-red-400",
  archived: "bg-gray-500/20 text-foreground/70",
  promoted_to_genesis: "bg-purple-500/20 text-purple-400",
};

export default function InnovationHub() {
  const [, setLocation] = useLocation();
  const [_activeTab, _setActiveTab] = useState("ideas");
  const [sourceFilter, setSourceFilter] = useState<
    "all" | "manual" | "agent" | "sme"
  >("all");
  const [showNewIdeaDialog, setShowNewIdeaDialog] = useState(false);
  const [showArticleDialog, setShowArticleDialog] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState<number | null>(null);

  // Form states
  const [newIdeaTitle, setNewIdeaTitle] = useState("");
  const [newIdeaDescription, setNewIdeaDescription] = useState("");
  const [newIdeaCategory, setNewIdeaCategory] = useState("");
  const [articleUrl, setArticleUrl] = useState("");
  const [articleContext, setArticleContext] = useState("");

  // API calls
  const { data: ideasData, refetch: refetchIdeas } =
    trpc.innovation.getIdeas.useQuery({});
  const ideas = ideasData?.ideas;
  const { data: selectedIdeaData, refetch: refetchSelectedIdea } =
    trpc.innovation.getIdeaWithAssessments.useQuery(
      { ideaId: selectedIdea! },
      { enabled: !!selectedIdea }
    );

  const captureIdeaMutation = trpc.innovation.captureIdea.useMutation({
    onSuccess: data => {
      toast.success("Idea captured! Running initial assessment...");
      setShowNewIdeaDialog(false);
      setNewIdeaTitle("");
      setNewIdeaDescription("");
      setNewIdeaCategory("");
      refetchIdeas();
      // Auto-trigger initial assessment after capture
      if (data?.id) {
        setSelectedIdea(data.id);
        runAssessmentMutation.mutate({
          ideaId: data.id,
          assessmentType: "market_analysis",
        });
      }
    },
    onError: error => toast.error(error.message),
  });

  const analyzeArticleMutation = trpc.innovation.analyzeArticle.useMutation({
    onSuccess: data => {
      toast.success(`Found ${data.opportunities.length} opportunities!`);
      setShowArticleDialog(false);
      setArticleUrl("");
      setArticleContext("");
      // Delay refetch slightly to ensure DB write is committed before re-querying
      setTimeout(() => refetchIdeas(), 600);
    },
    onError: error => toast.error(error.message),
  });

  const generateDailyIdeasMutation =
    trpc.innovation.generateDailyIdeas.useMutation({
      onSuccess: data => {
        toast.success(`Generated ${data.length} new ideas!`);
        refetchIdeas();
      },
      onError: error => toast.error(error.message),
    });
  const backfillAgentIdeasMutation =
    trpc.innovation.backfillAgentIdeas.useMutation({
      onSuccess: data => {
        toast.success(`Generated ${data.inserted} ideas from AI agents!`);
        refetchIdeas();
      },
      onError: error => toast.error(error.message),
    });

  const runAssessmentMutation = trpc.innovation.runAssessment.useMutation({
    onSuccess: () => {
      toast.success("Assessment completed!");
      refetchSelectedIdea();
    },
    onError: error => toast.error(error.message),
  });

  const generateScenariosMutation =
    trpc.innovation.generateScenarios.useMutation({
      onSuccess: () => {
        toast.success("Investment scenarios generated!");
        refetchSelectedIdea();
      },
      onError: error => toast.error(error.message),
    });

  const generateBriefMutation = trpc.innovation.generateBrief.useMutation({
    onSuccess: () => {
      toast.success("Idea brief generated!");
      refetchSelectedIdea();
    },
    onError: error => toast.error(error.message),
  });

  const promoteToGenesisMutation = trpc.innovation.promoteToGenesis.useMutation(
    {
      onSuccess: _data => {
        toast.success("Idea promoted to Project Genesis!");
        refetchIdeas();
        setSelectedIdea(null);
        // Navigate to Project Genesis to see the new project
        setTimeout(() => setLocation("/project-genesis"), 1000);
      },
      onError: error => toast.error(error.message),
    }
  );

  // Create a task/action directly from an idea
  const createTaskFromIdeaMutation = trpc.tasks.create.useMutation({
    onSuccess: () => {
      toast.success("Action created! View it in Chief of Staff → Tasks.");
    },
    onError: error => toast.error(`Failed to create action: ${error.message}`),
  });

  // SME Intelligence Feed
  const [smeActiveTab, setSmeActiveTab] = useState<"pending" | "assessed" | "approved">("pending");
  const { data: smeSubmissionsData, refetch: refetchSmeSubmissions } =
    trpc.smeIntelligence.list.useQuery({ status: smeActiveTab, limit: 20 });
  const { data: smeStats, refetch: refetchSmeStats } =
    trpc.smeIntelligence.getStats.useQuery();
  const assessSmeMutation = trpc.smeIntelligence.assess.useMutation({
    onSuccess: () => {
      toast.success("Agent1 assessed the SME idea!");
      refetchSmeSubmissions();
      refetchSmeStats();
    },
    onError: (error) => toast.error(error.message),
  });

  // Flywheel stats and stage advancement
  const { data: _flywheelStats, refetch: refetchFlywheelStats } =
    trpc.innovation.getFlywheelStats.useQuery();
  const _advanceStageMutation =
    trpc.innovation.advanceFlywheelStage.useMutation({
      onSuccess: data => {
        toast.success(
          `Idea advanced to stage ${data.newStage}: ${data.stageLabel}`
        );
        refetchIdeas();
        refetchFlywheelStats();
      },
      onError: error => toast.error(error.message),
    });

  const handleCaptureIdea = () => {
    if (!newIdeaTitle.trim()) {
      toast.error("Please enter an idea title");
      return;
    }
    captureIdeaMutation.mutate({
      title: newIdeaTitle,
      description: newIdeaDescription,
      category: newIdeaCategory || undefined,
      source: "manual",
    });
  };

  const handleAnalyzeArticle = () => {
    if (!articleUrl.trim()) {
      toast.error("Please enter an article URL");
      return;
    }
    analyzeArticleMutation.mutate({
      url: articleUrl,
      context: articleContext || undefined,
    });
  };

  // Stats - memoized to avoid recomputing on every render
  const { totalIdeas, activeIdeas, validatedIdeas, promotedIdeas } = useMemo(
    () => ({
      totalIdeas: ideas?.length || 0,
      activeIdeas:
        ideas?.filter(
          i =>
            !["rejected", "archived", "promoted_to_genesis"].includes(i.status)
        ).length || 0,
      validatedIdeas: ideas?.filter(i => i.status === "validated").length || 0,
      promotedIdeas:
        ideas?.filter(i => i.status === "promoted_to_genesis").length || 0,
    }),
    [ideas]
  );

  return (
    <PageShell
      icon={Sparkles}
      iconClass="bg-cyan-500/15 text-cyan-400"
      title="Innovation Hub"
      subtitle="Capture, assess, and refine ideas through the strategic flywheel"
      actions={
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => generateDailyIdeasMutation.mutate()}
            disabled={generateDailyIdeasMutation.isPending}
          >
            <Sparkles className="h-4 w-4" />
            {generateDailyIdeasMutation.isPending ? "Generating..." : "Daily Ideas"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 hidden sm:flex"
            onClick={() => backfillAgentIdeasMutation.mutate()}
            disabled={backfillAgentIdeasMutation.isPending}
          >
            <Brain className="h-4 w-4" />
            {backfillAgentIdeasMutation.isPending ? "Generating..." : "Agent Ideas"}
          </Button>
          <Dialog open={showArticleDialog} onOpenChange={setShowArticleDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <ExternalLink className="h-4 w-4" />
                Analyze Article
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Analyze Article for Opportunities</DialogTitle>
                <DialogDescription>
                  Paste an article URL and the AI will identify potential
                  business opportunities
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <Input
                  placeholder="Article URL"
                  value={articleUrl}
                  onChange={e => setArticleUrl(e.target.value)}
                />
                <Textarea
                  placeholder="Additional context (optional)"
                  value={articleContext}
                  onChange={e => setArticleContext(e.target.value)}
                  rows={3}
                />
                <Button
                  onClick={handleAnalyzeArticle}
                  className="w-full"
                  disabled={analyzeArticleMutation.isPending}
                >
                  {analyzeArticleMutation.isPending
                    ? "Analyzing..."
                    : "Analyze for Opportunities"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showNewIdeaDialog} onOpenChange={setShowNewIdeaDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
                <Plus className="h-4 w-4" />
                Capture Idea
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Capture New Idea</DialogTitle>
                <DialogDescription>
                  Add a new idea to the innovation flywheel for assessment
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <Input
                  placeholder="Idea title"
                  value={newIdeaTitle}
                  onChange={e => setNewIdeaTitle(e.target.value)}
                />
                <Textarea
                  placeholder="Description (optional)"
                  value={newIdeaDescription}
                  onChange={e => setNewIdeaDescription(e.target.value)}
                  rows={4}
                />
                <Select
                  value={newIdeaCategory}
                  onValueChange={setNewIdeaCategory}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="product">Product</SelectItem>
                    <SelectItem value="investment">Investment</SelectItem>
                    <SelectItem value="trend">Trend</SelectItem>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="market">Market Opportunity</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleCaptureIdea}
                  className="w-full"
                  disabled={captureIdeaMutation.isPending}
                >
                  {captureIdeaMutation.isPending
                    ? "Capturing..."
                    : "Capture Idea"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Total Ideas",        value: totalIdeas,     icon: Lightbulb,   color: "text-yellow-400", bg: "bg-yellow-500/15" },
            { label: "In Progress",         value: activeIdeas,    icon: TrendingUp,  color: "text-blue-400",   bg: "bg-blue-500/15" },
            { label: "Validated",           value: validatedIdeas, icon: CheckCircle, color: "text-green-400",  bg: "bg-green-500/15" },
            { label: "Promoted to Genesis", value: promotedIdeas,  icon: Rocket,      color: "text-purple-400", bg: "bg-purple-500/15" },
          ].map(stat => (
            <Card key={stat.label} className="bg-card/50 border-border/50">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`p-2.5 rounded-lg ${stat.bg} shrink-0`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-2xl font-bold leading-none">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Flywheel Visualization */}
        <Card className="bg-card/50 border-border/50">
          <CardContent className="py-4 px-5">
            <div className="flex items-center gap-1 mb-3">
              <RefreshCw className="h-3.5 w-3.5 text-cyan-400" />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Innovation Flywheel</span>
            </div>
            <div className="overflow-x-auto">
              <div className="flex items-center justify-between min-w-[420px]">
                {FLYWHEEL_STAGES.map((stage, index) => {
                  const count = ideas?.filter(i => i.currentStage === stage.id).length || 0;
                  return (
                    <div key={stage.id} className="flex items-center">
                      <div className="flex flex-col items-center gap-1.5">
                        <div className={`relative p-2.5 rounded-xl border ${stage.bg} ${stage.border}`}>
                          <stage.icon className={`h-5 w-5 ${stage.color}`} />
                          {count > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                              {count}
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-medium">{stage.name}</p>
                        <p className="text-[10px] text-muted-foreground">{stage.description}</p>
                      </div>
                      {index < FLYWHEEL_STAGES.length - 1 && (
                        <ArrowRight className="h-4 w-4 text-muted-foreground/30 mx-2 shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Ideas List */}
          <div className="col-span-2">
            <Card className="bg-card/50 border-border/50 h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-yellow-400" />
                    Ideas Pipeline
                  </CardTitle>
                  <div className="flex gap-1 flex-wrap">
                    {(["all", "manual", "agent", "sme"] as const).map(f => (
                      <button
                        key={f}
                        onClick={() => setSourceFilter(f)}
                        className={`px-2 py-0.5 text-[11px] rounded-full transition-colors ${
                          sourceFilter === f
                            ? "bg-primary text-primary-foreground font-medium"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        {f === "all" ? `All (${ideas?.length ?? 0})` : f === "manual" ? "Manual" : f === "agent" ? "Agents" : "SMEs"}
                      </button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 max-h-[500px] overflow-y-auto">
                {(() => {
                  const filtered = (ideas ?? []).filter(i =>
                    sourceFilter === "all"
                      ? true
                      : sourceFilter === "manual"
                        ? !i.source ||
                          i.source === "manual" ||
                          i.source === "ai_generated"
                        : sourceFilter === "agent"
                          ? (i.source ?? "").startsWith("agent:")
                          : (i.source ?? "").startsWith("sme:")
                  );
                  return filtered.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Lightbulb className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No ideas yet</p>
                      <p className="text-sm">
                        Capture your first idea to get started
                      </p>
                    </div>
                  ) : (
                    filtered.map(idea => (
                      <div
                        key={idea.id}
                        onClick={() => setSelectedIdea(idea.id)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          selectedIdea === idea.id
                            ? "border-[var(--brain-cyan)] bg-[var(--brain-cyan)]/10"
                            : "border-border hover:border-border/80 hover:bg-card"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <h4 className="font-medium text-foreground line-clamp-1">
                            {idea.title}
                          </h4>
                          <Badge
                            className={
                              STATUS_COLORS[idea.status] || "bg-gray-500/20"
                            }
                          >
                            {idea.status.replace(/_/g, " ")}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <span>Stage {idea.currentStage}/5</span>
                          {idea.confidenceScore && (
                            <>
                              <span>•</span>
                              <span>
                                {idea.confidenceScore.toFixed(0)}% confidence
                              </span>
                            </>
                          )}
                          {idea.source && idea.source !== "manual" && (
                            <>
                              <span>•</span>
                              <span className="capitalize text-cyan-400">
                                {idea.source.startsWith("agent:")
                                  ? `🤖 ${idea.source.replace("agent:", "").replace(/_/g, " ")}`
                                  : idea.source.startsWith("sme:")
                                    ? `👥 SME`
                                    : idea.source}
                              </span>
                            </>
                          )}
                        </div>
                        <Progress
                          value={(idea.currentStage / 5) * 100}
                          className="h-1 mt-2"
                        />
                      </div>
                    ))
                  );
                })()}{" "}
              </CardContent>
            </Card>
          </div>

          {/* Idea Details */}
          <div className="col-span-3">
            {selectedIdea && selectedIdeaData ? (
              <Card className="bg-card/50 border-border/50">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{selectedIdeaData.idea.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {selectedIdeaData.idea.description ||
                          "No description provided"}
                      </CardDescription>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {/* Create Action — available for any idea */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          createTaskFromIdeaMutation.mutate({
                            title: selectedIdeaData.idea.title,
                            description:
                              selectedIdeaData.idea.description ||
                              `Action from Innovation Hub idea: ${selectedIdeaData.idea.title}`,
                          })
                        }
                        disabled={createTaskFromIdeaMutation.isPending}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Create Action
                      </Button>
                      {selectedIdeaData.idea.currentStage >= 4 &&
                        !selectedIdeaData.idea.briefDocument && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              generateBriefMutation.mutate({
                                ideaId: selectedIdea,
                              })
                            }
                            disabled={generateBriefMutation.isPending}
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            Generate Brief
                          </Button>
                        )}
                      {selectedIdeaData.idea.status === "validated" && (
                        <Button
                          size="sm"
                          className="bg-purple-600 hover:bg-purple-700"
                          onClick={() =>
                            promoteToGenesisMutation.mutate({
                              ideaId: selectedIdea,
                            })
                          }
                          disabled={promoteToGenesisMutation.isPending}
                        >
                          <Rocket className="h-4 w-4 mr-1" />
                          Promote to Genesis
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="assessments">
                    <TabsList className="mb-4">
                      <TabsTrigger value="assessments">Assessments</TabsTrigger>
                      <TabsTrigger value="scenarios">
                        Investment Scenarios
                      </TabsTrigger>
                      <TabsTrigger value="brief">Brief</TabsTrigger>
                    </TabsList>

                    <TabsContent value="assessments" className="space-y-4">
                      {/* Run Assessment Buttons */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {[
                          "market_analysis",
                          "feasibility",
                          "competitive_landscape",
                          "financial_viability",
                          "risk_assessment",
                        ].map(type => {
                          const hasAssessment =
                            selectedIdeaData.assessments.some(
                              a => a.assessmentType === type
                            );
                          return (
                            <Button
                              key={type}
                              variant={hasAssessment ? "secondary" : "outline"}
                              size="sm"
                              onClick={() =>
                                runAssessmentMutation.mutate({
                                  ideaId: selectedIdea,
                                  assessmentType: type as
                                    | "market"
                                    | "financial"
                                    | "technical"
                                    | "risk"
                                    | "competitive",
                                })
                              }
                              disabled={runAssessmentMutation.isPending}
                            >
                              {hasAssessment && (
                                <CheckCircle className="h-3 w-3 mr-1 text-green-400" />
                              )}
                              {type.replace(/_/g, " ")}
                            </Button>
                          );
                        })}
                      </div>

                      {/* Assessment Results */}
                      {selectedIdeaData.assessments.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
                          <p>No assessments yet</p>
                          <p className="text-sm">
                            Run an assessment to evaluate this idea
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {selectedIdeaData.assessments.map(assessment => (
                            <div
                              key={assessment.id}
                              className="p-4 rounded-lg border border-border bg-card/50"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium capitalize">
                                  {assessment.assessmentType.replace(/_/g, " ")}
                                </h4>
                                <div className="flex items-center gap-2">
                                  <Badge
                                    variant={
                                      assessment.recommendation === "proceed"
                                        ? "default"
                                        : assessment.recommendation === "refine"
                                          ? "secondary"
                                          : assessment.recommendation ===
                                              "reject"
                                            ? "destructive"
                                            : "outline"
                                    }
                                  >
                                    {assessment.recommendation}
                                  </Badge>
                                  <span className="text-sm font-medium">
                                    {assessment.score?.toFixed(0)}/100
                                  </span>
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-3">
                                {assessment.findings}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="scenarios" className="space-y-4">
                      {selectedIdeaData.scenarios.length === 0 ? (
                        <div className="text-center py-8">
                          <DollarSign className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                          <p className="text-muted-foreground">
                            No investment scenarios yet
                          </p>
                          <Button
                            className="mt-4"
                            onClick={() =>
                              generateScenariosMutation.mutate({
                                ideaId: selectedIdea,
                                budgets: [500, 5000, 20000],
                              })
                            }
                            disabled={generateScenariosMutation.isPending}
                          >
                            {generateScenariosMutation.isPending
                              ? "Generating..."
                              : "Generate Investment Scenarios"}
                          </Button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                          {selectedIdeaData.scenarios.map(scenario => (
                            <Card
                              key={scenario.id}
                              className={`${scenario.isRecommended ? "border-[var(--brain-cyan)] bg-[var(--brain-cyan)]/5" : "border-border"}`}
                            >
                              <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                  <CardTitle className="text-lg">
                                    {scenario.scenarioName}
                                  </CardTitle>
                                  {scenario.isRecommended && (
                                    <Badge className="bg-[var(--brain-cyan)]/90">
                                      Recommended
                                    </Badge>
                                  )}
                                </div>
                                <CardDescription>
                                  £{scenario.investmentAmount.toLocaleString()}
                                </CardDescription>
                              </CardHeader>
                              <CardContent className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    Break-even
                                  </span>
                                  <span>{scenario.timeToBreakeven} months</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    Risk Level
                                  </span>
                                  <Badge
                                    variant={
                                      scenario.riskLevel === "low"
                                        ? "default"
                                        : scenario.riskLevel === "medium"
                                          ? "secondary"
                                          : "destructive"
                                    }
                                  >
                                    {scenario.riskLevel}
                                  </Badge>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    Year 1 Profit
                                  </span>
                                  <span className="text-green-400">
                                    £
                                    {(
                                      (
                                        scenario.projectedProfit as {
                                          year1?: number;
                                        }
                                      )?.year1 || 0
                                    ).toLocaleString()}
                                  </span>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="brief">
                      {selectedIdeaData.idea.briefDocument ? (
                        <div className="space-y-4">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                generateBriefMutation.mutate({
                                  ideaId: selectedIdea!,
                                })
                              }
                              disabled={generateBriefMutation.isPending}
                            >
                              {generateBriefMutation.isPending ? (
                                <>
                                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />{" "}
                                  Regenerating...
                                </>
                              ) : (
                                <>
                                  <RefreshCw className="h-4 w-4 mr-2" />{" "}
                                  Regenerate Brief
                                </>
                              )}
                            </Button>
                          </div>
                          <div className="prose prose-invert max-w-none">
                            <div
                              className="whitespace-pre-wrap text-sm text-foreground"
                              dangerouslySetInnerHTML={{
                                __html:
                                  selectedIdeaData.idea.briefDocument.replace(
                                    /\n/g,
                                    "<br/>"
                                  ),
                              }}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                          <p className="text-muted-foreground">
                            No brief generated yet
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {selectedIdeaData.assessments.length >= 5 &&
                            selectedIdeaData.scenarios.length > 0
                              ? "All assessments complete. Ready to generate brief."
                              : "Complete assessments and generate investment scenarios first"}
                          </p>
                          {selectedIdeaData.assessments.length >= 5 &&
                            selectedIdeaData.scenarios.length > 0 && (
                              <Button
                                className="mt-4 bg-cyan-500 hover:bg-cyan-600 text-black"
                                onClick={() =>
                                  generateBriefMutation.mutate({
                                    ideaId: selectedIdea!,
                                  })
                                }
                                disabled={generateBriefMutation.isPending}
                              >
                                {generateBriefMutation.isPending ? (
                                  <>
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />{" "}
                                    Generating...
                                  </>
                                ) : (
                                  <>
                                    <FileText className="h-4 w-4 mr-2" />{" "}
                                    Generate Innovation Brief
                                  </>
                                )}
                              </Button>
                            )}
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-card/50 border-border/50 h-full flex items-center justify-center">
                <div className="text-center py-8">
                  <Brain className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-medium text-foreground">
                    Select an Idea
                  </h3>
                  <p className="text-muted-foreground mt-1">
                    Choose an idea from the pipeline to view details and run
                    assessments
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* SME Intelligence Feed */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-400" />
                  SME Intelligence Feed
                </CardTitle>
                <CardDescription>
                  Ideas surfaced by AI SME agents — {smeStats?.total ?? 0} total submissions
                </CardDescription>
              </div>
              <div className="flex gap-3 text-sm">
                <span className="flex items-center gap-1 text-yellow-400">
                  <AlertCircle className="h-4 w-4" />
                  {smeStats?.pending ?? 0} pending
                </span>
                <span className="flex items-center gap-1 text-primary">
                  <Eye className="h-4 w-4" />
                  {smeStats?.assessed ?? 0} assessed
                </span>
                <span className="flex items-center gap-1 text-green-400">
                  <CheckCircle2 className="h-4 w-4" />
                  {smeStats?.verdicts?.integrate_now ?? 0} integrate now
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-1 mb-4">
              {(["pending", "assessed", "approved"] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setSmeActiveTab(tab)}
                  className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-colors ${
                    smeActiveTab === tab
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            {!smeSubmissionsData?.submissions?.length ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-40" />
                <p className="text-muted-foreground text-sm">
                  No SME submissions yet. Go to the AI SMEs page and run an Intelligence Scan to populate this feed.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {smeSubmissionsData.submissions.map(sub => (
                  <div
                    key={sub.id}
                    className="border border-border/50 rounded-lg p-4 bg-background/30 hover:bg-background/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-xs font-medium text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full">
                            {sub.expertName}
                          </span>
                          {sub.cephoArea && (
                            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                              {sub.cephoArea}
                            </span>
                          )}
                          {sub.agent1Verdict && (
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              sub.agent1Verdict === "integrate_now"
                                ? "bg-green-500/20 text-green-400"
                                : sub.agent1Verdict === "explore_further"
                                ? "bg-yellow-500/20 text-yellow-400"
                                : sub.agent1Verdict === "archive"
                                ? "bg-gray-500/20 text-muted-foreground"
                                : "bg-blue-500/20 text-blue-400"
                            }`}>
                              {sub.agent1Verdict?.replace(/_/g, " ")}
                            </span>
                          )}
                        </div>
                        <p className="font-medium text-sm text-foreground">{sub.title}</p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{sub.description}</p>
                        {sub.toolName && (
                          <p className="text-xs text-primary mt-1">
                            Tool: {sub.toolName}
                            {sub.toolUrl && (
                              <a href={sub.toolUrl} target="_blank" rel="noopener noreferrer" className="ml-1 underline">
                                (link)
                              </a>
                            )}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col gap-1 shrink-0">
                        {sub.status === "pending" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-7"
                            onClick={() => assessSmeMutation.mutate({ submissionId: sub.id })}
                            disabled={assessSmeMutation.isPending && assessSmeMutation.variables?.submissionId === sub.id}
                          >
                            {assessSmeMutation.isPending && assessSmeMutation.variables?.submissionId === sub.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <><Brain className="h-3 w-3 mr-1" />Assess</>
                            )}
                          </Button>
                        )}
                        {sub.agent1Verdict === "integrate_now" && (
                          <Button
                            size="sm"
                            className="text-xs h-7 bg-green-600 hover:bg-green-700 text-white"
                            onClick={() =>
                              captureIdeaMutation.mutate({
                                title: sub.title,
                                description: sub.description,
                                source: "sme",
                                category: sub.cephoArea?.toLowerCase() ?? "technology",
                              })
                            }
                            disabled={captureIdeaMutation.isPending}
                          >
                            <Zap className="h-3 w-3 mr-1" />Promote
                          </Button>
                        )}
                      </div>
                    </div>
                    {sub.agent1Assessment && (() => {
                      let parsed: Record<string, unknown> | null = null;
                      try { parsed = JSON.parse(sub.agent1Assessment as string); } catch {}
                      return parsed?.verdictReason ? (
                        <div className="mt-2 pt-2 border-t border-border/30">
                          <p className="text-xs text-muted-foreground">
                            <span className="font-medium text-foreground">Agent1:</span>{" "}
                            {parsed.verdictReason as string}
                          </p>
                        </div>
                      ) : null;
                    })()}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
