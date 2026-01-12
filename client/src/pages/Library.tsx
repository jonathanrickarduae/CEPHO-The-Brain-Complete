import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FolderOpen, FileText, Image, BarChart3, Presentation, Search,
  Plus, Upload, Download, Clock, LayoutGrid, List,
  ChevronRight, ChevronLeft, File, ArrowUpRight
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
    name: 'Boundless Telecom',
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

  const currentProject = projects.find(p => p.id === selectedProject);
  const totalFiles = projects.reduce((acc, p) => acc + p.documents + p.images + p.charts, 0);

  // Project detail view
  if (selectedProject && currentProject) {
    return (
      <div className="min-h-screen bg-background p-6">
        {/* Back button */}
        <button
          onClick={() => setSelectedProject(null)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Library
        </button>

        {/* Project Header */}
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
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
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="documents" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <FileText className="w-4 h-4 mr-2" />
              Documents
            </TabsTrigger>
            <TabsTrigger value="images" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Image className="w-4 h-4 mr-2" />
              Images
            </TabsTrigger>
            <TabsTrigger value="charts" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <BarChart3 className="w-4 h-4 mr-2" />
              Charts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="documents" className="space-y-3">
            {sampleFiles.documents.map((doc, index) => (
              <div key={index} className="flex items-center gap-4 bg-card border border-border rounded-xl p-4 hover:border-primary/50 transition-all cursor-pointer">
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
                <Button variant="ghost" size="icon">
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="images" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sampleFiles.images.map((img, index) => (
              <div key={index} className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-all cursor-pointer">
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
              <div key={index} className="bg-card border border-border rounded-xl p-4 hover:border-primary/50 transition-all cursor-pointer">
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
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Library</h1>
          <p className="text-muted-foreground text-sm mt-1">All your project files in one place</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-64 bg-card border-border"
            />
          </div>
          <div className="flex items-center bg-card border border-border rounded-lg p-1">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition-colors ${viewMode === 'grid' ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-colors ${viewMode === 'list' ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          <Button size="sm" className="gap-2">
            <Upload className="w-4 h-4" />
            Upload
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="text-3xl font-bold text-foreground">{projects.length}</div>
          <div className="text-sm text-muted-foreground">Projects</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="text-3xl font-bold text-foreground">{totalFiles}</div>
          <div className="text-sm text-muted-foreground">Total Files</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="text-3xl font-bold text-foreground">{projects.reduce((acc, p) => acc + p.documents, 0)}</div>
          <div className="text-sm text-muted-foreground">Documents</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="text-3xl font-bold text-foreground">{projects.reduce((acc, p) => acc + p.images, 0)}</div>
          <div className="text-sm text-muted-foreground">Images</div>
        </div>
      </div>

      {/* Projects Grid */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(project => (
            <div
              key={project.id}
              onClick={() => setSelectedProject(project.id)}
              className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-all cursor-pointer group"
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
    </div>
  );
}
