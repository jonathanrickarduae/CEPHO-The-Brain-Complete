import { useState, useMemo } from 'react';
import type { LibraryDocument } from '@shared/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/layout/PageHeader';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { Streamdown } from 'streamdown';
import { 
  FolderOpen, FileText, Image, BarChart3, Presentation, Search,
  Plus, Upload, Download, Clock, LayoutGrid, List,
  ChevronRight, ChevronLeft, File, ArrowUpRight, BookOpen,
  MessageSquare, User, Trash2, Calendar, Loader2, Eye, FolderPlus
} from 'lucide-react';

// Project data with brand colours (matching Workflow)
const projects = [
  {
    id: 'celadon',
    name: 'Celadon Pharmaceuticals',
    color: '#10B981',
    documents: 24,
    images: 12,
    charts: 8,
    lastUpdated: 'Jan 10',
  },
  {
    id: 'boundless',
    name: 'Sample Project Telecom',
    color: '#3B82F6',
    documents: 18,
    images: 6,
    charts: 15,
    lastUpdated: 'Jan 9',
  },
  {
    id: 'perfect-dxb',
    name: 'Perfect DXB',
    color: '#F59E0B',
    documents: 31,
    images: 22,
    charts: 11,
    lastUpdated: 'Jan 10',
  },
  {
    id: 'ampora',
    name: 'Ampora',
    color: '#06B6D4',
    documents: 15,
    images: 8,
    charts: 6,
    lastUpdated: 'Jan 8',
  },
  {
    id: 'project-5',
    name: 'Project 5',
    color: '#8B5CF6',
    documents: 9,
    images: 4,
    charts: 3,
    lastUpdated: 'Jan 7',
  },
  {
    id: 'project-6',
    name: 'Project 6',
    color: '#EC4899',
    documents: 7,
    images: 2,
    charts: 4,
    lastUpdated: 'Jan 6',
  }
];

// Sample files for project detail view
const sampleFiles = {
  documents: [
    { name: 'Investment Memo v3.docx', size: '2.4 MB', date: 'Jan 10', status: 'final' },
    { name: 'Due Diligence Report.pdf', size: '5.1 MB', date: 'Jan 8', status: 'draft' },
    { name: 'Financial Model.xlsx', size: '1.8 MB', date: 'Jan 6', status: 'final' },
    { name: 'Board Presentation.pptx', size: '12.3 MB', date: 'Jan 4', status: 'draft' },
  ],
  images: [
    { name: 'Market Analysis Chart.png', source: 'AI Generated', date: 'Jan 9' },
    { name: 'Competitive Landscape.png', source: 'AI Generated', date: 'Jan 7' },
    { name: 'Growth Projections.png', source: 'AI Generated', date: 'Jan 5' },
  ],
  charts: [
    { name: 'Revenue Forecast', type: 'Line Chart', date: 'Jan 10' },
    { name: 'Market Share', type: 'Pie Chart', date: 'Jan 8' },
    { name: 'Cost Breakdown', type: 'Bar Chart', date: 'Jan 6' },
  ],
};

export default function Library() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'projects' | 'consultations'>('projects');
  const [selectedConsultation, setSelectedConsultation] = useState<LibraryDocument | null>(null);
  const [consultationSearch, setConsultationSearch] = useState('');

  // Fetch consultations from library
  const { data: consultations, isLoading: consultationsLoading, refetch: refetchConsultations } = 
    trpc.library.list.useQuery(
      { folder: 'Expert Consultations' },
      { enabled: activeTab === 'consultations' }
    );

  // Delete consultation mutation
  const deleteConsultation = trpc.library.delete.useMutation({
    onSuccess: () => {
      toast.success('Consultation deleted');
      refetchConsultations();
      setSelectedConsultation(null);
    },
    onError: () => {
      toast.error('Failed to delete consultation');
    }
  });

  // Filter consultations based on search
  const filteredConsultations = useMemo(() => {
    if (!consultations) return [];
    if (!consultationSearch.trim()) return consultations;
    
    const query = consultationSearch.toLowerCase();
    return consultations.filter((c: LibraryDocument) => 
      c.name.toLowerCase().includes(query) ||
      c.subFolder?.toLowerCase().includes(query) ||
      (c.metadata as any)?.content?.toLowerCase().includes(query)
    );
  }, [consultations, consultationSearch]);

  const currentProject = projects.find(p => p.id === selectedProject);
  const totalFiles = projects.reduce((acc, p) => acc + p.documents + p.images + p.charts, 0);

  // Consultation detail modal
  const ConsultationViewer = () => {
    if (!selectedConsultation) return null;
    
    return (
      <Dialog open={!!selectedConsultation} onOpenChange={() => setSelectedConsultation(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-fuchsia-400" />
              {selectedConsultation.name}
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center gap-4 text-sm text-muted-foreground border-b border-border pb-4">
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              {selectedConsultation.subFolder || 'Expert Consultation'}
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(selectedConsultation.createdAt).toLocaleDateString('en-GB')}
            </div>
          </div>
          <ScrollArea className="flex-1 pr-4">
            <div className="prose prose-invert max-w-none">
              <Streamdown>{(selectedConsultation.metadata as any)?.content || ''}</Streamdown>
            </div>
          </ScrollArea>
          <div className="flex justify-between items-center pt-4 border-t border-border">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                if (confirm('Are you sure you want to delete this consultation?')) {
                  deleteConsultation.mutate({ id: selectedConsultation.id });
                }
              }}
              disabled={deleteConsultation.isPending}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const content = (selectedConsultation.metadata as any)?.content || '';
                const blob = new Blob([content], { type: 'text/markdown' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${selectedConsultation.name.replace(/[^a-z0-9]/gi, '_')}.md`;
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  // Project detail view
  if (selectedProject && currentProject) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 p-6">
        {/* Back button */}
        <button
          onClick={() => setSelectedProject(null)}
          className="flex items-center gap-2 text-foreground/70 hover:text-white mb-6 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Library
        </button>

        {/* Project Header */}
        <div className="bg-white/5 border-2 border-white/10 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-4">
            <div 
              className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg"
              style={{ backgroundColor: currentProject.color }}
            >
              {currentProject.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-foreground">{currentProject.name}</h2>
              <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                <span>{currentProject.documents} documents</span>
                <span>{currentProject.images} images</span>
                <span>{currentProject.charts} charts</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="documents" className="space-y-6">
          <TabsList className="bg-white/5 border border-white/10">
            <TabsTrigger value="documents" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-rose-500 data-[state=active]:text-white">
              <FileText className="w-4 h-4 mr-2" />
              Documents
            </TabsTrigger>
            <TabsTrigger value="images" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-rose-500 data-[state=active]:text-white">
              <Image className="w-4 h-4 mr-2" />
              Images
            </TabsTrigger>
            <TabsTrigger value="charts" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-rose-500 data-[state=active]:text-white">
              <BarChart3 className="w-4 h-4 mr-2" />
              Charts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="documents" className="space-y-3">
            {sampleFiles.documents.map((doc, index) => (
              <div key={index} className="flex items-center gap-4 bg-white/5 border-2 border-white/10 rounded-2xl p-4 hover:border-pink-500/50 transition-all cursor-pointer">
                <div className="p-3 bg-secondary rounded-lg">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-foreground">{doc.name}</h3>
                  <p className="text-sm text-muted-foreground">{doc.size} · {doc.date}</p>
                </div>
                <Badge 
                  variant="outline" 
                  className={doc.status === 'final' ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'}
                >
                  {doc.status}
                </Badge>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="hover:bg-pink-500/20 hover:text-pink-400"
                  onClick={() => toast.info(`Preview: ${doc.name}`, { description: 'Document preview coming soon' })}
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="images" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sampleFiles.images.map((img, index) => (
              <div key={index} className="bg-white/5 border-2 border-white/10 rounded-2xl overflow-hidden hover:border-pink-500/50 transition-all cursor-pointer">
                <div className="aspect-video bg-secondary flex items-center justify-center">
                  <Image className="w-12 h-12 text-muted-foreground/30" />
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-foreground">{img.name}</h3>
                  <p className="text-sm text-muted-foreground">{img.source} · {img.date}</p>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="charts" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sampleFiles.charts.map((chart, index) => (
              <div key={index} className="bg-white/5 border-2 border-white/10 rounded-2xl p-4 hover:border-pink-500/50 transition-all cursor-pointer">
                <div className="aspect-video bg-secondary rounded-lg flex items-center justify-center mb-3">
                  <BarChart3 className="w-12 h-12 text-muted-foreground/30" />
                </div>
                <h3 className="font-medium text-foreground">{chart.name}</h3>
                <p className="text-sm text-muted-foreground">{chart.type} · {chart.date}</p>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  // Main library view
  return (
    <div className="h-[calc(100vh-56px)] md:h-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800">
      {/* Header */}
      <PageHeader 
        icon={BookOpen} 
        title="Library"
        subtitle="All your project files and consultations"
        iconColor="text-pink-400"
      >
        <div className="flex items-center gap-2 md:gap-3 flex-wrap justify-end">
          {activeTab === 'projects' ? (
            <>
              {/* Upload button - always visible, positioned first on mobile */}
              <Button size="sm" className="gap-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:opacity-90 order-first sm:order-last">
                <Upload className="w-4 h-4" />
                <span>Upload</span>
              </Button>
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-48 md:w-64 bg-card border-border"
                />
              </div>
              <div className="hidden sm:flex items-center bg-white/5 border border-white/20 rounded-lg p-1">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded transition-colors ${viewMode === 'grid' ? 'bg-pink-500/20 text-pink-400' : 'text-foreground/70 hover:text-white'}`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded transition-colors ${viewMode === 'list' ? 'bg-pink-500/20 text-pink-400' : 'text-foreground/70 hover:text-white'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                className="gap-2 hidden md:flex"
                onClick={() => toast.info('Create Folder', { description: 'Folder organization coming soon' })}
              >
                <FolderPlus className="w-4 h-4" />
                <span className="hidden md:inline">New Folder</span>
              </Button>
              <Button 
                size="sm" 
                className="gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:opacity-90"
                onClick={() => window.location.href = '/project-genesis'}
              >
                <Plus className="w-4 h-4" />
                <span>New Project</span>
              </Button>
            </>
          ) : (
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search consultations..."
                value={consultationSearch}
                onChange={(e) => setConsultationSearch(e.target.value)}
                className="pl-9 w-full sm:w-48 md:w-64 bg-card border-border"
              />
            </div>
          )}
        </div>
      </PageHeader>

      {/* Tab Navigation - Horizontally scrollable on mobile */}
      <div className="px-4 sm:px-6 pt-4 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 min-w-max pb-2">
          <Button
            variant={activeTab === 'projects' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('projects')}
            className={activeTab === 'projects' ? 'bg-gradient-to-r from-pink-500 to-rose-500' : ''}
          >
            <FolderOpen className="w-4 h-4 mr-2" />
            Projects
          </Button>
          <Button
            variant={activeTab === 'consultations' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('consultations')}
            className={activeTab === 'consultations' ? 'bg-gradient-to-r from-fuchsia-500 to-purple-500' : ''}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Expert Consultations
            {consultations && consultations.length > 0 && (
              <Badge variant="secondary" className="ml-2 bg-white/10">
                {consultations.length}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'projects' ? (
          <>
            {/* Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div className="bg-white/5 border-2 border-white/10 rounded-2xl p-4">
                <div className="text-3xl font-bold text-white">{projects.length}</div>
                <div className="text-sm text-foreground/70">Projects</div>
              </div>
              <div className="bg-gradient-to-br from-pink-500/10 to-rose-500/10 border-2 border-pink-500/30 rounded-2xl p-4">
                <div className="text-3xl font-bold text-pink-400">{totalFiles}</div>
                <div className="text-sm text-foreground/70">Total Files</div>
              </div>
              <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-2 border-blue-500/30 rounded-2xl p-4">
                <div className="text-3xl font-bold text-blue-400">{projects.reduce((acc, p) => acc + p.documents, 0)}</div>
                <div className="text-sm text-foreground/70">Documents</div>
              </div>
              <div className="bg-gradient-to-br from-purple-500/10 to-fuchsia-500/10 border-2 border-purple-500/30 rounded-2xl p-4">
                <div className="text-3xl font-bold text-purple-400">{projects.reduce((acc, p) => acc + p.images, 0)}</div>
                <div className="text-sm text-foreground/70">Images</div>
              </div>
            </div>

            {/* Projects Grid */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map(project => (
                  <div
                    key={project.id}
                    onClick={() => setSelectedProject(project.id)}
                    className="bg-white/5 border-2 border-white/10 rounded-2xl p-5 hover:border-pink-500/50 transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold text-sm"
                          style={{ backgroundColor: project.color }}
                        >
                          {project.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                            {project.name}
                          </h3>
                          <p className="text-xs text-muted-foreground">Updated {project.lastUpdated}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>

                    <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-foreground">{project.documents}</div>
                        <div className="text-xs text-muted-foreground">Docs</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-foreground">{project.images}</div>
                        <div className="text-xs text-muted-foreground">Images</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-foreground">{project.charts}</div>
                        <div className="text-xs text-muted-foreground">Charts</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* List View */
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Project</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Documents</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Images</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Charts</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Updated</th>
                      <th className="p-4"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map(project => (
                      <tr 
                        key={project.id} 
                        onClick={() => setSelectedProject(project.id)}
                        className="border-b border-border last:border-0 hover:bg-secondary/50 cursor-pointer transition-colors"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-semibold text-xs"
                              style={{ backgroundColor: project.color }}
                            >
                              {project.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                            </div>
                            <span className="font-medium text-foreground">{project.name}</span>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">{project.documents}</td>
                        <td className="p-4 text-sm text-muted-foreground">{project.images}</td>
                        <td className="p-4 text-sm text-muted-foreground">{project.charts}</td>
                        <td className="p-4 text-sm text-muted-foreground">{project.lastUpdated}</td>
                        <td className="p-4">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <ArrowUpRight className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : (
          /* Consultations Tab */
          <div className="space-y-4">
            {/* Header with Export */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Expert Consultations</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (!consultations || consultations.length === 0) {
                    toast.error('No consultations to export');
                    return;
                  }
                  // Generate CSV
                  const headers = ['Expert', 'Category', 'Date', 'Summary'];
                  const rows = consultations.map((c: LibraryDocument) => [
                    c.subFolder || 'Unknown Expert',
                    (c.metadata as { expertCategory?: string })?.expertCategory || 'General',
                    new Date(c.createdAt).toLocaleDateString('en-GB'),
                    c.name.replace(/,/g, ';').substring(0, 100)
                  ]);
                  const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
                  const blob = new Blob([csv], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `consultations-${new Date().toISOString().split('T')[0]}.csv`;
                  a.click();
                  URL.revokeObjectURL(url);
                  toast.success('Exported consultations to CSV');
                }}
                className="border-fuchsia-500/50 text-fuchsia-400 hover:bg-fuchsia-500/10"
                disabled={consultationsLoading || !consultations?.length}
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-br from-fuchsia-500/10 to-purple-500/10 border-2 border-fuchsia-500/30 rounded-2xl p-4">
                <div className="text-3xl font-bold text-fuchsia-400">
                  {consultationsLoading ? '...' : consultations?.length || 0}
                </div>
                <div className="text-sm text-foreground/70">Saved Consultations</div>
              </div>
              <div className="bg-white/5 border-2 border-white/10 rounded-2xl p-4">
                <div className="text-3xl font-bold text-white">
                  {consultationsLoading ? '...' : new Set(consultations?.map((c: LibraryDocument) => c.subFolder)).size || 0}
                </div>
                <div className="text-sm text-foreground/70">Unique Experts</div>
              </div>
              <div className="bg-white/5 border-2 border-white/10 rounded-2xl p-4">
                <div className="text-3xl font-bold text-white">
                  {consultationsLoading ? '...' : 
                    consultations?.length ? 
                      new Date(Math.max(...consultations.map((c: LibraryDocument) => new Date(c.createdAt).getTime()))).toLocaleDateString('en-GB') 
                      : '-'
                  }
                </div>
                <div className="text-sm text-foreground/70">Last Consultation</div>
              </div>
            </div>

            {/* Consultations List */}
            {consultationsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 bg-white/5 border-2 border-white/10 rounded-2xl p-4 animate-pulse">
                    <div className="w-12 h-12 rounded-xl bg-white/10" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-48 bg-white/10 rounded" />
                      <div className="h-3 w-32 bg-white/10 rounded" />
                    </div>
                    <div className="h-6 w-16 bg-white/10 rounded-full" />
                  </div>
                ))}
              </div>
            ) : filteredConsultations.length === 0 ? (
              <div className="text-center py-12 bg-white/5 border-2 border-white/10 rounded-2xl">
                <MessageSquare className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No consultations saved yet</h3>
                <p className="text-muted-foreground text-sm">
                  Export your expert chat conversations to save them here
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredConsultations.map((consultation: LibraryDocument) => (
                  <div
                    key={consultation.id}
                    onClick={() => setSelectedConsultation(consultation)}
                    className="flex items-center gap-4 bg-white/5 border-2 border-white/10 rounded-2xl p-4 hover:border-fuchsia-500/50 transition-all cursor-pointer group"
                  >
                    <div className="p-3 bg-gradient-to-br from-fuchsia-500/20 to-purple-500/20 rounded-lg">
                      <MessageSquare className="w-5 h-5 text-fuchsia-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground group-hover:text-fuchsia-400 transition-colors truncate">
                        {consultation.name}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {consultation.subFolder || 'Expert'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(consultation.createdAt).toLocaleDateString('en-GB')}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-fuchsia-400 hover:text-fuchsia-300 hover:bg-fuchsia-500/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedConsultation(consultation);
                      }}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Consultation Viewer Modal */}
      <ConsultationViewer />
    </div>
  );
}
