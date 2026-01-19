import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { 
  Lightbulb, 
  Plus, 
  ArrowRight, 
  Search, 
  TrendingUp, 
  Target, 
  DollarSign,
  FileText,
  Rocket,
  RefreshCw,
  ExternalLink,
  CheckCircle,
  XCircle,
  Clock,
  Sparkles,
  Brain,
  Users,
  BarChart3,
  AlertTriangle
} from "lucide-react";

// Flywheel stages
const FLYWHEEL_STAGES = [
  { id: 1, name: "Capture", icon: Lightbulb, color: "text-yellow-500", description: "Idea intake from various sources" },
  { id: 2, name: "Assess", icon: Search, color: "text-blue-500", description: "Strategic framework evaluation" },
  { id: 3, name: "Consult", icon: Users, color: "text-purple-500", description: "SME expert feedback" },
  { id: 4, name: "Refine", icon: RefreshCw, color: "text-orange-500", description: "Iterate based on findings" },
  { id: 5, name: "Brief", icon: FileText, color: "text-green-500", description: "Generate actionable summary" },
];

const STATUS_COLORS: Record<string, string> = {
  captured: "bg-yellow-500/20 text-yellow-400",
  assessing: "bg-blue-500/20 text-blue-400",
  refining: "bg-orange-500/20 text-orange-400",
  validated: "bg-green-500/20 text-green-400",
  rejected: "bg-red-500/20 text-red-400",
  archived: "bg-gray-500/20 text-foreground/70",
  promoted_to_genesis: "bg-purple-500/20 text-purple-400",
};

export default function InnovationHub() {
  const [activeTab, setActiveTab] = useState("ideas");
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
  const { data: ideas, refetch: refetchIdeas } = trpc.innovation.getIdeas.useQuery({});
  const { data: selectedIdeaData, refetch: refetchSelectedIdea } = trpc.innovation.getIdeaWithAssessments.useQuery(
    { ideaId: selectedIdea! },
    { enabled: !!selectedIdea }
  );

  const captureIdeaMutation = trpc.innovation.captureIdea.useMutation({
    onSuccess: () => {
      toast.success("Idea captured successfully!");
      setShowNewIdeaDialog(false);
      setNewIdeaTitle("");
      setNewIdeaDescription("");
      setNewIdeaCategory("");
      refetchIdeas();
    },
    onError: (error) => toast.error(error.message),
  });

  const analyzeArticleMutation = trpc.innovation.analyzeArticle.useMutation({
    onSuccess: (data) => {
      toast.success(`Found ${data.opportunities.length} opportunities!`);
      setShowArticleDialog(false);
      setArticleUrl("");
      setArticleContext("");
      refetchIdeas();
    },
    onError: (error) => toast.error(error.message),
  });

  const runAssessmentMutation = trpc.innovation.runAssessment.useMutation({
    onSuccess: () => {
      toast.success("Assessment completed!");
      refetchSelectedIdea();
    },
    onError: (error) => toast.error(error.message),
  });

  const generateScenariosMutation = trpc.innovation.generateScenarios.useMutation({
    onSuccess: () => {
      toast.success("Investment scenarios generated!");
      refetchSelectedIdea();
    },
    onError: (error) => toast.error(error.message),
  });

  const generateBriefMutation = trpc.innovation.generateBrief.useMutation({
    onSuccess: () => {
      toast.success("Idea brief generated!");
      refetchSelectedIdea();
    },
    onError: (error) => toast.error(error.message),
  });

  const promoteToGenesisMutation = trpc.innovation.promoteToGenesis.useMutation({
    onSuccess: () => {
      toast.success("Idea promoted to Project Genesis!");
      refetchIdeas();
      setSelectedIdea(null);
    },
    onError: (error) => toast.error(error.message),
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

  // Stats
  const totalIdeas = ideas?.length || 0;
  const activeIdeas = ideas?.filter(i => !["rejected", "archived", "promoted_to_genesis"].includes(i.status)).length || 0;
  const validatedIdeas = ideas?.filter(i => i.status === "validated").length || 0;
  const promotedIdeas = ideas?.filter(i => i.status === "promoted_to_genesis").length || 0;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Sparkles className="h-8 w-8 text-cyan-400" />
              Innovation Hub
            </h1>
            <p className="text-muted-foreground mt-1">
              Capture, assess, and refine ideas through the strategic flywheel
            </p>
          </div>
          <div className="flex gap-3">
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
                    Paste an article URL and the AI will identify potential business opportunities
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <Input
                    placeholder="Article URL"
                    value={articleUrl}
                    onChange={(e) => setArticleUrl(e.target.value)}
                  />
                  <Textarea
                    placeholder="Additional context (optional)"
                    value={articleContext}
                    onChange={(e) => setArticleContext(e.target.value)}
                    rows={3}
                  />
                  <Button 
                    onClick={handleAnalyzeArticle} 
                    className="w-full"
                    disabled={analyzeArticleMutation.isPending}
                  >
                    {analyzeArticleMutation.isPending ? "Analyzing..." : "Analyze for Opportunities"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={showNewIdeaDialog} onOpenChange={setShowNewIdeaDialog}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-cyan-600 hover:bg-cyan-700">
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
                    onChange={(e) => setNewIdeaTitle(e.target.value)}
                  />
                  <Textarea
                    placeholder="Description (optional)"
                    value={newIdeaDescription}
                    onChange={(e) => setNewIdeaDescription(e.target.value)}
                    rows={4}
                  />
                  <Select value={newIdeaCategory} onValueChange={setNewIdeaCategory}>
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
                    {captureIdeaMutation.isPending ? "Capturing..." : "Capture Idea"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-yellow-500/20">
                <Lightbulb className="h-6 w-6 text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalIdeas}</p>
                <p className="text-sm text-muted-foreground">Total Ideas</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-500/20">
                <RefreshCw className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeIdeas}</p>
                <p className="text-sm text-muted-foreground">In Progress</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-500/20">
                <CheckCircle className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{validatedIdeas}</p>
                <p className="text-sm text-muted-foreground">Validated</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-500/20">
                <Rocket className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{promotedIdeas}</p>
                <p className="text-sm text-muted-foreground">Promoted to Genesis</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Flywheel Visualization */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-cyan-400" />
              Innovation Flywheel
            </CardTitle>
            <CardDescription>
              Ideas progress through 5 stages of strategic assessment and refinement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between px-8 py-4">
              {FLYWHEEL_STAGES.map((stage, index) => (
                <div key={stage.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={`p-4 rounded-full bg-card border-2 border-border ${stage.color}`}>
                      <stage.icon className="h-6 w-6" />
                    </div>
                    <p className="mt-2 font-medium text-foreground">{stage.name}</p>
                    <p className="text-xs text-muted-foreground text-center max-w-[100px]">
                      {stage.description}
                    </p>
                    <Badge variant="outline" className="mt-2">
                      {ideas?.filter(i => i.currentStage === stage.id).length || 0}
                    </Badge>
                  </div>
                  {index < FLYWHEEL_STAGES.length - 1 && (
                    <ArrowRight className="h-6 w-6 text-muted-foreground mx-4" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-3 gap-6">
          {/* Ideas List */}
          <div className="col-span-1">
            <Card className="bg-card/50 border-border/50 h-full">
              <CardHeader>
                <CardTitle className="text-lg">Ideas Pipeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 max-h-[500px] overflow-y-auto">
                {ideas?.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Lightbulb className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No ideas yet</p>
                    <p className="text-sm">Capture your first idea to get started</p>
                  </div>
                ) : (
                  ideas?.map((idea) => (
                    <div
                      key={idea.id}
                      onClick={() => setSelectedIdea(idea.id)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedIdea === idea.id
                          ? "border-cyan-500 bg-cyan-500/10"
                          : "border-border hover:border-border/80 hover:bg-card"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <h4 className="font-medium text-foreground line-clamp-1">{idea.title}</h4>
                        <Badge className={STATUS_COLORS[idea.status] || "bg-gray-500/20"}>
                          {idea.status.replace(/_/g, " ")}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <span>Stage {idea.currentStage}/5</span>
                        {idea.confidenceScore && (
                          <>
                            <span>•</span>
                            <span>{idea.confidenceScore.toFixed(0)}% confidence</span>
                          </>
                        )}
                      </div>
                      <Progress 
                        value={(idea.currentStage / 5) * 100} 
                        className="h-1 mt-2"
                      />
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Idea Details */}
          <div className="col-span-2">
            {selectedIdea && selectedIdeaData ? (
              <Card className="bg-card/50 border-border/50">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{selectedIdeaData.idea.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {selectedIdeaData.idea.description || "No description provided"}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      {selectedIdeaData.idea.currentStage >= 4 && !selectedIdeaData.idea.briefDocument && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => generateBriefMutation.mutate({ ideaId: selectedIdea })}
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
                          onClick={() => promoteToGenesisMutation.mutate({ ideaId: selectedIdea })}
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
                      <TabsTrigger value="scenarios">Investment Scenarios</TabsTrigger>
                      <TabsTrigger value="brief">Brief</TabsTrigger>
                    </TabsList>

                    <TabsContent value="assessments" className="space-y-4">
                      {/* Run Assessment Buttons */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {["market_analysis", "feasibility", "competitive_landscape", "financial_viability", "risk_assessment"].map((type) => {
                          const hasAssessment = selectedIdeaData.assessments.some(a => a.assessmentType === type);
                          return (
                            <Button
                              key={type}
                              variant={hasAssessment ? "secondary" : "outline"}
                              size="sm"
                              onClick={() => runAssessmentMutation.mutate({ 
                                ideaId: selectedIdea, 
                                assessmentType: type as any 
                              })}
                              disabled={runAssessmentMutation.isPending}
                            >
                              {hasAssessment && <CheckCircle className="h-3 w-3 mr-1 text-green-400" />}
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
                          <p className="text-sm">Run an assessment to evaluate this idea</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {selectedIdeaData.assessments.map((assessment) => (
                            <div key={assessment.id} className="p-4 rounded-lg border border-border bg-card/50">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium capitalize">
                                  {assessment.assessmentType.replace(/_/g, " ")}
                                </h4>
                                <div className="flex items-center gap-2">
                                  <Badge variant={
                                    assessment.recommendation === "proceed" ? "default" :
                                    assessment.recommendation === "refine" ? "secondary" :
                                    assessment.recommendation === "reject" ? "destructive" : "outline"
                                  }>
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
                          <p className="text-muted-foreground">No investment scenarios yet</p>
                          <Button
                            className="mt-4"
                            onClick={() => generateScenariosMutation.mutate({ 
                              ideaId: selectedIdea,
                              budgets: [500, 5000, 20000]
                            })}
                            disabled={generateScenariosMutation.isPending}
                          >
                            {generateScenariosMutation.isPending ? "Generating..." : "Generate Investment Scenarios"}
                          </Button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-3 gap-4">
                          {selectedIdeaData.scenarios.map((scenario) => (
                            <Card 
                              key={scenario.id} 
                              className={`${scenario.isRecommended ? "border-cyan-500 bg-cyan-500/5" : "border-border"}`}
                            >
                              <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                  <CardTitle className="text-lg">{scenario.scenarioName}</CardTitle>
                                  {scenario.isRecommended && (
                                    <Badge className="bg-cyan-600">Recommended</Badge>
                                  )}
                                </div>
                                <CardDescription>
                                  £{scenario.investmentAmount.toLocaleString()}
                                </CardDescription>
                              </CardHeader>
                              <CardContent className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Break-even</span>
                                  <span>{scenario.timeToBreakeven} months</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Risk Level</span>
                                  <Badge variant={
                                    scenario.riskLevel === "low" ? "default" :
                                    scenario.riskLevel === "medium" ? "secondary" :
                                    "destructive"
                                  }>
                                    {scenario.riskLevel}
                                  </Badge>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Year 1 Profit</span>
                                  <span className="text-green-400">
                                    £{((scenario.projectedProfit as any)?.year1 || 0).toLocaleString()}
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
                              onClick={() => generateBriefMutation.mutate({ ideaId: selectedIdea! })}
                              disabled={generateBriefMutation.isPending}
                            >
                              {generateBriefMutation.isPending ? (
                                <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Regenerating...</>
                              ) : (
                                <><RefreshCw className="h-4 w-4 mr-2" /> Regenerate Brief</>
                              )}
                            </Button>
                          </div>
                          <div className="prose prose-invert max-w-none">
                            <div 
                              className="whitespace-pre-wrap text-sm text-foreground"
                              dangerouslySetInnerHTML={{ 
                                __html: selectedIdeaData.idea.briefDocument.replace(/\n/g, '<br/>') 
                              }}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                          <p className="text-muted-foreground">No brief generated yet</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {selectedIdeaData.assessments.length >= 5 && selectedIdeaData.scenarios.length > 0
                              ? "All assessments complete. Ready to generate brief."
                              : "Complete assessments and generate investment scenarios first"}
                          </p>
                          {selectedIdeaData.assessments.length >= 5 && selectedIdeaData.scenarios.length > 0 && (
                            <Button
                              className="mt-4 bg-cyan-500 hover:bg-cyan-600 text-black"
                              onClick={() => generateBriefMutation.mutate({ ideaId: selectedIdea! })}
                              disabled={generateBriefMutation.isPending}
                            >
                              {generateBriefMutation.isPending ? (
                                <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Generating...</>
                              ) : (
                                <><FileText className="h-4 w-4 mr-2" /> Generate Innovation Brief</>
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
                <div className="text-center py-16">
                  <Brain className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-medium text-foreground">Select an Idea</h3>
                  <p className="text-muted-foreground mt-1">
                    Choose an idea from the pipeline to view details and run assessments
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
