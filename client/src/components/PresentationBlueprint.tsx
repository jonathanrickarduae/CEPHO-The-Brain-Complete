import { useState, useEffect } from 'react';
import { 
  PresentationIcon, ChevronRight, ChevronLeft, Check, Sparkles,
  FileText, Users, TrendingUp, DollarSign, Target, Lightbulb,
  BarChart3, Building2, Rocket, Download, Eye, Edit3,
  Palette, Layout, Wand2, RefreshCw, CheckCircle2, Clock,
  Brain, MessageSquare, AlertTriangle, Upload, FolderOpen, Link2, Plus, Loader2
} from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface SlideContent {
  id: string;
  type: SlideType;
  title: string;
  content: string;
  notes: string;
  aiSuggestions: string[];
  status: 'draft' | 'reviewed' | 'approved';
  smeReviewer?: string;
}

type SlideType = 'title' | 'problem' | 'solution' | 'market' | 'product' | 'traction' | 'business_model' | 'competition' | 'team' | 'financials' | 'ask' | 'appendix';

interface DesignTheme {
  id: string;
  name: string;
  description: string;
  colors: { primary: string; secondary: string; accent: string };
  style: 'professional' | 'bold' | 'minimal' | 'creative';
}

const slideTypes: { type: SlideType; label: string; icon: any; description: string }[] = [
  { type: 'title', label: 'Title Slide', icon: PresentationIcon, description: 'Company name, tagline, presenter' },
  { type: 'problem', label: 'Problem', icon: AlertTriangle, description: 'The pain point you\'re solving' },
  { type: 'solution', label: 'Solution', icon: Lightbulb, description: 'Your unique approach' },
  { type: 'market', label: 'Market Opportunity', icon: TrendingUp, description: 'TAM, SAM, SOM analysis' },
  { type: 'product', label: 'Product', icon: Rocket, description: 'Demo, features, screenshots' },
  { type: 'traction', label: 'Traction', icon: BarChart3, description: 'Metrics, growth, milestones' },
  { type: 'business_model', label: 'Business Model', icon: DollarSign, description: 'Revenue streams, pricing' },
  { type: 'competition', label: 'Competition', icon: Target, description: 'Competitive landscape, moat' },
  { type: 'team', label: 'Team', icon: Users, description: 'Founders, key hires, advisors' },
  { type: 'financials', label: 'Financials', icon: BarChart3, description: 'Projections, unit economics' },
  { type: 'ask', label: 'The Ask', icon: Building2, description: 'Funding amount, use of funds' },
  { type: 'appendix', label: 'Appendix', icon: FileText, description: 'Supporting materials' },
];

const designThemes: DesignTheme[] = [
  {
    id: 'professional',
    name: 'Professional',
    description: 'Clean, corporate look for institutional investors',
    colors: { primary: '#1e3a5f', secondary: '#4a90d9', accent: '#f0f4f8' },
    style: 'professional'
  },
  {
    id: 'bold',
    name: 'Bold',
    description: 'High-impact visuals for memorable pitches',
    colors: { primary: '#ff6b35', secondary: '#1a1a2e', accent: '#ffffff' },
    style: 'bold'
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Elegant simplicity that lets content shine',
    colors: { primary: '#2d3436', secondary: '#636e72', accent: '#ffffff' },
    style: 'minimal'
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Dynamic design for innovative startups',
    colors: { primary: '#6c5ce7', secondary: '#a29bfe', accent: '#ffeaa7' },
    style: 'creative'
  },
];

// Sample inherited data from Genesis Master
const genesisData = {
  companyName: 'Sample Project AI',
  tagline: 'The AI command center for strategic decision-making',
  problem: 'Business leaders are overwhelmed by fragmented tools, disconnected data, and the cognitive load of managing multiple AI assistants.',
  solution: 'A unified AI ecosystem that learns your patterns, manages your digital life, and proactively surfaces insights and opportunities.',
  market: {
    tam: '$50B',
    sam: '$12B',
    som: '$500M',
    growth: '35% CAGR'
  },
  traction: {
    users: '500+',
    revenue: '$50K MRR',
    growth: '25% MoM'
  },
  team: [
    { name: 'CEO', role: 'Former McKinsey Partner' },
    { name: 'CTO', role: 'Ex-Google AI Lead' },
    { name: 'CPO', role: 'Former Superhuman PM' }
  ],
  ask: {
    amount: '$5M',
    stage: 'Series A',
    useOfFunds: ['Product Development (40%)', 'Go-to-Market (35%)', 'Team Expansion (25%)']
  }
};

// Available projects from Genesis/Library
const availableProjects = [
  { id: 'boundless-ai', name: 'Sample Project AI', description: 'AI command center platform', lastUpdated: '2 days ago' },
  { id: 'short-circle-navigator', name: 'Short Circle Navigator', description: 'Investment navigation tool', lastUpdated: '1 week ago' },
  { id: 'celadon', name: 'Celadon', description: 'Sustainable technology venture', lastUpdated: '3 days ago' },
  { id: 'project-genesis', name: 'Project Genesis', description: 'Innovation incubator', lastUpdated: '5 days ago' },
];

export function PresentationBlueprint() {
  const [startMode, setStartMode] = useState<'select' | 'quick' | 'project' | null>(null);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [currentStep, setCurrentStep] = useState<'structure' | 'content' | 'design' | 'review'>('structure');
  const [selectedSlides, setSelectedSlides] = useState<SlideType[]>([
    'title', 'problem', 'solution', 'market', 'product', 'traction', 'business_model', 'team', 'financials', 'ask'
  ]);
  const [slides, setSlides] = useState<SlideContent[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<string>('professional');
  const [activeSlide, setActiveSlide] = useState<number>(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [projectData, setProjectData] = useState<any>(null);

  // Fetch projects list from Genesis
  const { data: genesisProjects, isLoading: loadingProjects } = trpc.genesis.list.useQuery();
  
  // Fetch specific project data when selected
  const { data: fetchedProjectData, isLoading: loadingProjectData } = trpc.genesis.getProjectData.useQuery(
    { projectId: selectedProject || '' },
    { enabled: !!selectedProject && startMode === 'project' }
  );

  // Update project data when fetched
  useEffect(() => {
    if (fetchedProjectData) {
      setProjectData(fetchedProjectData);
    }
  }, [fetchedProjectData]);

  // Map genesis projects to available projects format
  const dynamicProjects = genesisProjects?.map((p: any) => ({
    id: p.id.toString(),
    name: p.name,
    description: p.description || `${p.type} - ${p.counterparty || 'In progress'}`,
    lastUpdated: p.updatedAt ? new Date(p.updatedAt).toLocaleDateString('en-GB') : 'Recently'
  })) || availableProjects;

  const toggleSlide = (type: SlideType) => {
    setSelectedSlides(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const generateSlideContent = async () => {
    setIsGenerating(true);
    
    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const generatedSlides: SlideContent[] = selectedSlides.map(type => {
      const slideInfo = slideTypes.find(s => s.type === type)!;
      let content = '';
      let aiSuggestions: string[] = [];
      
      switch (type) {
        case 'title':
          content = `${genesisData.companyName}\n\n${genesisData.tagline}`;
          aiSuggestions = ['Add a compelling visual metaphor', 'Include a brief credibility statement'];
          break;
        case 'problem':
          content = genesisData.problem;
          aiSuggestions = ['Add specific statistics about the problem', 'Include a customer quote', 'Show the cost of inaction'];
          break;
        case 'solution':
          content = genesisData.solution;
          aiSuggestions = ['Add a product screenshot or demo', 'Highlight 3 key differentiators', 'Include a before/after comparison'];
          break;
        case 'market':
          content = `Total Addressable Market: ${genesisData.market.tam}\nServiceable Addressable Market: ${genesisData.market.sam}\nServiceable Obtainable Market: ${genesisData.market.som}\n\nMarket Growth: ${genesisData.market.growth}`;
          aiSuggestions = ['Add market trend visualization', 'Include analyst quotes', 'Show market timing rationale'];
          break;
        case 'traction':
          content = `Active Users: ${genesisData.traction.users}\nMonthly Recurring Revenue: ${genesisData.traction.revenue}\nGrowth Rate: ${genesisData.traction.growth}`;
          aiSuggestions = ['Add a growth chart', 'Include customer logos', 'Show retention metrics'];
          break;
        case 'team':
          content = genesisData.team.map(t => `${t.name}: ${t.role}`).join('\n');
          aiSuggestions = ['Add professional headshots', 'Highlight relevant experience', 'Include advisors and investors'];
          break;
        case 'ask':
          content = `Raising: ${genesisData.ask.amount} ${genesisData.ask.stage}\n\nUse of Funds:\n${genesisData.ask.useOfFunds.map(u => `• ${u}`).join('\n')}`;
          aiSuggestions = ['Add a timeline for milestones', 'Show what this funding unlocks', 'Include terms if appropriate'];
          break;
        default:
          content = `Content for ${slideInfo.label}`;
          aiSuggestions = ['Add relevant data points', 'Include visuals'];
      }
      
      return {
        id: `slide-${type}`,
        type,
        title: slideInfo.label,
        content,
        notes: '',
        aiSuggestions,
        status: 'draft'
      };
    });
    
    setSlides(generatedSlides);
    setIsGenerating(false);
    setCurrentStep('content');
  };

  const updateSlideContent = (index: number, field: keyof SlideContent, value: string) => {
    setSlides(prev => prev.map((slide, i) => 
      i === index ? { ...slide, [field]: value } : slide
    ));
  };

  const applySuggestion = (slideIndex: number, suggestion: string) => {
    const slide = slides[slideIndex];
    updateSlideContent(slideIndex, 'content', `${slide.content}\n\n[AI Suggestion Applied: ${suggestion}]`);
    setSlides(prev => prev.map((s, i) => 
      i === slideIndex 
        ? { ...s, aiSuggestions: s.aiSuggestions.filter(sug => sug !== suggestion) }
        : s
    ));
  };

  const approveSlide = (index: number) => {
    setSlides(prev => prev.map((slide, i) => 
      i === index ? { ...slide, status: 'approved' } : slide
    ));
  };

  const steps = [
    { id: 'structure', label: 'Structure', icon: Layout },
    { id: 'content', label: 'Content', icon: FileText },
    { id: 'design', label: 'Design', icon: Palette },
    { id: 'review', label: 'Review', icon: CheckCircle2 },
  ];

  const handleFileUpload = (files: FileList | null) => {
    if (files) {
      setUploadedFiles(prev => [...prev, ...Array.from(files)]);
    }
  };

  const startWithProject = (projectId: string) => {
    setSelectedProject(projectId);
    setStartMode('project');
  };

  const startQuick = () => {
    setStartMode('quick');
  };

  // Show mode selection if not yet selected
  if (!startMode) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-foreground flex items-center justify-center gap-2">
            <PresentationIcon className="w-7 h-7 text-blue-400" />
            Presentation Blueprint
          </h2>
          <p className="text-muted-foreground mt-2">
            Create investor-ready pitch decks with AI assistance
          </p>
        </div>

        {/* Start Mode Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Quick Start Option */}
          <button
            onClick={startQuick}
            className="p-6 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border-2 border-emerald-500/30 rounded-2xl text-left hover:border-emerald-400 hover:from-emerald-500/20 hover:to-cyan-500/20 transition-all group"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-emerald-500/20 rounded-xl">
                <Plus className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-foreground">Quick Start</h3>
                <p className="text-sm text-muted-foreground">Start fresh, upload documents</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Jump straight in and create a presentation from scratch. Upload your own documents, data, and research.
            </p>
            <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium group-hover:gap-3 transition-all">
              <Upload className="w-4 h-4" />
              <span>Upload & Start</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>

          {/* Link to Project Option */}
          <div className="p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-2 border-blue-500/30 rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <Link2 className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-foreground">Link to Project</h3>
                <p className="text-sm text-muted-foreground">Pull from existing data</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Connect to an existing project and automatically pull research, data, and documents from your Library.
            </p>
            
            {/* Project Dropdown */}
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Select a project:</label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {loadingProjects ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                    <span className="ml-2 text-sm text-muted-foreground">Loading projects...</span>
                  </div>
                ) : dynamicProjects.length > 0 ? (
                  dynamicProjects.map((project: any) => (
                    <button
                      key={project.id}
                      onClick={() => startWithProject(project.id)}
                      className="w-full p-3 bg-background/50 border border-white/10 rounded-lg text-left hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FolderOpen className="w-4 h-4 text-blue-400" />
                          <span className="font-medium text-foreground">{project.name}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-blue-400 transition-colors" />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 ml-6">{project.description}</p>
                      <p className="text-xs text-muted-foreground/60 mt-1 ml-6">Updated {project.lastUpdated}</p>
                    </button>
                  ))
                ) : (
                  <div className="text-center p-4 text-muted-foreground text-sm">
                    No projects found. Create a project in Genesis first.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Quick Start mode - show file upload
  if (startMode === 'quick' && currentStep === 'structure' && uploadedFiles.length === 0) {
    return (
      <div className="space-y-6">
        {/* Header with back button */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setStartMode(null)}
            className="p-2 hover:bg-secondary/50 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <PresentationIcon className="w-6 h-6 text-blue-400" />
              Quick Start
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Upload documents to get started
            </p>
          </div>
        </div>

        {/* Upload Area */}
        <div
          className="border-2 border-dashed border-white/20 rounded-2xl p-12 text-center hover:border-emerald-500/50 transition-colors cursor-pointer"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); handleFileUpload(e.dataTransfer.files); }}
        >
          <input
            type="file"
            multiple
            className="hidden"
            id="presentation-file-upload"
            onChange={(e) => handleFileUpload(e.target.files)}
          />
          <label htmlFor="presentation-file-upload" className="cursor-pointer">
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium text-foreground mb-2">Drop files here or click to upload</p>
            <p className="text-sm text-muted-foreground">
              PDFs, Word docs, PowerPoints, spreadsheets - we'll extract the key information
            </p>
          </label>
        </div>

        {/* Or continue without files */}
        <div className="text-center">
          <button
            onClick={() => setUploadedFiles([{ name: 'placeholder' } as File])}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Or continue without uploading files →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => { setStartMode(null); setSelectedProject(null); setUploadedFiles([]); }}
            className="p-2 hover:bg-secondary/50 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <PresentationIcon className="w-6 h-6 text-blue-400" />
              Presentation Blueprint
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {startMode === 'project' 
                ? `Linked to: ${availableProjects.find(p => p.id === selectedProject)?.name}`
                : 'Quick Start Mode'}
            </p>
          </div>
        </div>
        {selectedProject && (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30">
            <Brain className="w-3 h-3 mr-1" />
            {availableProjects.find(p => p.id === selectedProject)?.name}
          </Badge>
        )}
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between p-4 bg-card/50 rounded-xl border border-white/10">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <button
              onClick={() => setCurrentStep(step.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                currentStep === step.id
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <step.icon className="w-4 h-4" />
              <span className="font-medium">{step.label}</span>
            </button>
            {index < steps.length - 1 && (
              <ChevronRight className="w-4 h-4 mx-2 text-muted-foreground" />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Structure */}
      {currentStep === 'structure' && (
        <div className="space-y-6">
          <div className="p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-xl border border-blue-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-blue-400" />
              <span className="font-medium text-foreground">Inherited from Genesis Master</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Company info, value proposition, market analysis, and team data will be automatically populated from your Genesis Blueprint.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Select Slide Types</h3>
            <div className="grid grid-cols-3 gap-3">
              {slideTypes.map(slide => (
                <button
                  key={slide.type}
                  onClick={() => toggleSlide(slide.type)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    selectedSlides.includes(slide.type)
                      ? 'bg-blue-500/20 border-blue-500/30'
                      : 'bg-card/50 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <slide.icon className={`w-5 h-5 ${selectedSlides.includes(slide.type) ? 'text-blue-400' : 'text-muted-foreground'}`} />
                    <span className="font-medium text-foreground">{slide.label}</span>
                    {selectedSlides.includes(slide.type) && (
                      <Check className="w-4 h-4 text-blue-400 ml-auto" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{slide.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={generateSlideContent}
              disabled={selectedSlides.length === 0 || isGenerating}
              className="bg-gradient-to-r from-blue-500 to-cyan-500"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Generating Content...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
                  Generate Slide Content
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Content */}
      {currentStep === 'content' && slides.length > 0 && (
        <div className="grid grid-cols-3 gap-6">
          {/* Slide Navigator */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Slides</h3>
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                onClick={() => setActiveSlide(index)}
                className={`w-full p-3 rounded-lg border text-left transition-all ${
                  activeSlide === index
                    ? 'bg-blue-500/20 border-blue-500/30'
                    : 'bg-card/50 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{index + 1}. {slide.title}</span>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${
                      slide.status === 'approved' 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    }`}
                  >
                    {slide.status}
                  </Badge>
                </div>
              </button>
            ))}
          </div>

          {/* Content Editor */}
          <div className="col-span-2 space-y-4">
            <div className="p-6 bg-card/50 rounded-xl border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">
                  {slides[activeSlide]?.title}
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => approveSlide(activeSlide)}
                  disabled={slides[activeSlide]?.status === 'approved'}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Approve
                </Button>
              </div>

              <Textarea
                value={slides[activeSlide]?.content || ''}
                onChange={(e) => updateSlideContent(activeSlide, 'content', e.target.value)}
                className="min-h-[200px] bg-black/20 border-white/10 mb-4"
                placeholder="Slide content..."
              />

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Speaker Notes</label>
                <Textarea
                  value={slides[activeSlide]?.notes || ''}
                  onChange={(e) => updateSlideContent(activeSlide, 'notes', e.target.value)}
                  className="min-h-[100px] bg-black/20 border-white/10"
                  placeholder="Notes for the presenter..."
                />
              </div>
            </div>

            {/* AI Suggestions */}
            {slides[activeSlide]?.aiSuggestions.length > 0 && (
              <div className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-medium text-foreground">AI Suggestions</span>
                </div>
                <div className="space-y-2">
                  {slides[activeSlide].aiSuggestions.map((suggestion, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-black/20 rounded-lg">
                      <span className="text-sm text-muted-foreground">{suggestion}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => applySuggestion(activeSlide, suggestion)}
                        className="text-purple-400 hover:text-purple-300"
                      >
                        Apply
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 3: Design */}
      {currentStep === 'design' && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-foreground">Choose Design Theme</h3>
          <div className="grid grid-cols-2 gap-4">
            {designThemes.map(theme => (
              <button
                key={theme.id}
                onClick={() => setSelectedTheme(theme.id)}
                className={`p-6 rounded-xl border text-left transition-all ${
                  selectedTheme === theme.id
                    ? 'bg-blue-500/20 border-blue-500/30'
                    : 'bg-card/50 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex gap-1">
                    <div className="w-6 h-6 rounded" style={{ backgroundColor: theme.colors.primary }} />
                    <div className="w-6 h-6 rounded" style={{ backgroundColor: theme.colors.secondary }} />
                    <div className="w-6 h-6 rounded border border-white/20" style={{ backgroundColor: theme.colors.accent }} />
                  </div>
                  {selectedTheme === theme.id && (
                    <Check className="w-5 h-5 text-blue-400 ml-auto" />
                  )}
                </div>
                <h4 className="font-semibold text-foreground mb-1">{theme.name}</h4>
                <p className="text-sm text-muted-foreground">{theme.description}</p>
              </button>
            ))}
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setCurrentStep('content')}>
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Content
            </Button>
            <Button onClick={() => setCurrentStep('review')} className="bg-gradient-to-r from-blue-500 to-cyan-500">
              Continue to Review
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Review */}
      {currentStep === 'review' && (
        <div className="space-y-6">
          <div className="p-6 bg-card/50 rounded-xl border border-white/10">
            <h3 className="text-lg font-semibold text-foreground mb-4">Presentation Summary</h3>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-black/20 rounded-lg">
                <div className="text-2xl font-bold text-foreground">{slides.length}</div>
                <div className="text-sm text-muted-foreground">Total Slides</div>
              </div>
              <div className="p-4 bg-black/20 rounded-lg">
                <div className="text-2xl font-bold text-emerald-400">
                  {slides.filter(s => s.status === 'approved').length}
                </div>
                <div className="text-sm text-muted-foreground">Approved</div>
              </div>
              <div className="p-4 bg-black/20 rounded-lg">
                <div className="text-2xl font-bold text-amber-400">
                  {slides.filter(s => s.status === 'draft').length}
                </div>
                <div className="text-sm text-muted-foreground">Pending Review</div>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <Palette className="w-5 h-5 text-muted-foreground" />
              <span className="text-foreground">
                Theme: <strong>{designThemes.find(t => t.id === selectedTheme)?.name}</strong>
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Brain className="w-5 h-5 text-muted-foreground" />
              <span className="text-foreground">
                Source: <strong>Genesis Master - Sample Project AI</strong>
              </span>
            </div>
          </div>

          {/* SME Review Request */}
          <div className="p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-xl border border-amber-500/20">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-5 h-5 text-amber-400" />
              <span className="font-medium text-foreground">Request SME Review</span>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Send this presentation to relevant AI Experts for investor-readiness review.
            </p>
            <div className="flex gap-2">
              <Badge variant="outline" className="bg-white/5">Private Equity Partner</Badge>
              <Badge variant="outline" className="bg-white/5">Corporate Strategy Director</Badge>
              <Badge variant="outline" className="bg-white/5">McKinsey</Badge>
            </div>
          </div>

          {/* Export Options */}
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1">
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button variant="outline" className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Export PowerPoint
            </Button>
            <Button variant="outline" className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
            <Button className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Finalize & Save
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
