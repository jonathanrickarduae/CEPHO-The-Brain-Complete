import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FolderOpen, FileText, Image, BarChart3, Presentation, Search,
  Plus, Upload, Download, Star, Clock, Filter, Grid3X3, List,
  ChevronRight, X, File, Calendar, User, Briefcase, Home, Lock, Shield
} from 'lucide-react';

// Project data
const projects = [
  {
    id: 'celadon',
    name: 'Celadon Pharmaceuticals',
    icon: '💊',
    color: 'from-emerald-500/20 to-emerald-500/5',
    borderColor: 'border-emerald-500/30',
    documents: 24,
    images: 12,
    charts: 8,
    lastUpdated: '2024-01-10',
    status: 'active',
    subProjects: [
      {
        id: 'empower-farmer-dd',
        name: 'Empower Farmer DD',
        type: 'due-diligence',
        icon: '🌾',
        status: 'in_progress',
        progress: 15,
        documents: 0,
        lastUpdated: '2024-01-12',
        description: 'Due diligence review for Empower Farmer investment opportunity'
      }
    ]
  },
  {
    id: 'boundless',
    name: 'Boundless Telecom',
    icon: '📡',
    color: 'from-blue-500/20 to-blue-500/5',
    borderColor: 'border-blue-500/30',
    documents: 18,
    images: 6,
    charts: 15,
    lastUpdated: '2024-01-09',
    status: 'active'
  },
  {
    id: 'perfect-dxb',
    name: 'Perfect DXB',
    icon: '🏗️',
    color: 'from-amber-500/20 to-amber-500/5',
    borderColor: 'border-amber-500/30',
    documents: 31,
    images: 22,
    charts: 11,
    lastUpdated: '2024-01-10',
    status: 'active',
    subtitle: 'Perfect Technical Works, LLC'
  },
  {
    id: 'ampora',
    name: 'Ampora',
    icon: '🌊',
    color: 'from-cyan-500/20 to-cyan-500/5',
    borderColor: 'border-cyan-500/30',
    documents: 15,
    images: 8,
    charts: 6,
    lastUpdated: '2024-01-08',
    status: 'active'
  },
  {
    id: 'project-5',
    name: 'Project 5',
    icon: '🚀',
    color: 'from-purple-500/20 to-purple-500/5',
    borderColor: 'border-purple-500/30',
    documents: 9,
    images: 4,
    charts: 3,
    lastUpdated: '2024-01-07',
    status: 'active'
  },
  {
    id: 'project-6',
    name: 'Project 6',
    icon: '⚡',
    color: 'from-fuchsia-500/20 to-fuchsia-500/5',
    borderColor: 'border-fuchsia-500/30',
    documents: 7,
    images: 2,
    charts: 4,
    lastUpdated: '2024-01-06',
    status: 'active'
  }
];

// Secret/Locked Projects (only visible to owner)
const secretProjects = [
  {
    id: 'project-x',
    name: 'Project X',
    subtitle: 'Nexus Commercialization Strategy',
    icon: '🔐',
    color: 'from-red-500/20 to-red-500/5',
    borderColor: 'border-red-500/30',
    documents: 3,
    images: 0,
    charts: 2,
    lastUpdated: '2024-01-12',
    status: 'secret',
    isLocked: true,
    description: 'Three-tier corporate partnership model, revenue strategies, and investor materials'
  }
];

// Personal items
const personalItems = [
  { id: 'holiday', name: 'Holiday Planner', icon: '🏖️', type: 'calendar', items: 5 },
  { id: 'todo', name: 'Personal To-Do', icon: '✅', type: 'list', items: 12 },
  { id: 'reminders', name: 'Quick Reminders', icon: '🔔', type: 'reminders', items: 3 },
  { id: 'notes', name: 'Personal Notes', icon: '📝', type: 'notes', items: 8 }
];

// Sample files for a project
const sampleFiles = {
  documents: [
    { name: 'Q4 Strategy Report.pdf', size: '2.4 MB', date: '2024-01-10', status: 'signed' },
    { name: 'Investment Proposal v3.docx', size: '1.8 MB', date: '2024-01-09', status: 'draft' },
    { name: 'Board Presentation.pptx', size: '5.2 MB', date: '2024-01-08', status: 'signed' },
    { name: 'Due Diligence Checklist.xlsx', size: '890 KB', date: '2024-01-07', status: 'working' },
    { name: 'Legal Review Notes.pdf', size: '1.1 MB', date: '2024-01-06', status: 'signed' },
  ],
  images: [
    { name: 'Market Analysis Chart.png', size: '450 KB', date: '2024-01-10', source: 'AI Generated' },
    { name: 'Competitor Landscape.png', size: '380 KB', date: '2024-01-09', source: 'AI Generated' },
    { name: 'Brand Mockup v2.png', size: '1.2 MB', date: '2024-01-08', source: 'AI Generated' },
    { name: 'Office Photos.jpg', size: '2.8 MB', date: '2024-01-07', source: 'Uploaded' },
  ],
  charts: [
    { name: 'Revenue Projections', type: 'Line Chart', date: '2024-01-10' },
    { name: 'Market Share Analysis', type: 'Pie Chart', date: '2024-01-09' },
    { name: 'Growth Trajectory', type: 'Area Chart', date: '2024-01-08' },
    { name: 'Competitive Positioning', type: 'Scatter Plot', date: '2024-01-07' },
  ],
  presentations: [
    { name: 'Investor Deck Q4', slides: 24, date: '2024-01-10' },
    { name: 'Team Update', slides: 12, date: '2024-01-08' },
  ]
};

export default function Library() {
  const [selectedProject, setSelectedProject] = useState<typeof projects[0] | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-fuchsia-500 bg-clip-text text-transparent">
            Library
          </h1>
          <p className="text-gray-400 mt-1">All your documents, images, charts, and data organized by project</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-white/20">
            <Upload className="w-4 h-4 mr-2" />
            Upload
          </Button>
          <Button className="bg-gradient-to-r from-cyan-500 to-fuchsia-500">
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          placeholder="Search across all projects and files..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 py-6 text-lg bg-white/5 border-white/10"
        />
      </div>

      {selectedProject ? (
        // Project Detail View
        <div>
          {/* Breadcrumb */}
          <button 
            onClick={() => setSelectedProject(null)}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            Back to Projects
          </button>

          {/* Project Header */}
          <div className={`bg-gradient-to-br ${selectedProject.color} border ${selectedProject.borderColor} rounded-2xl p-6 mb-8`}>
            <div className="flex items-center gap-4">
              <span className="text-5xl">{selectedProject.icon}</span>
              <div>
                <h2 className="text-2xl font-bold text-white">{selectedProject.name}</h2>
                {selectedProject.subtitle && (
                  <p className="text-gray-400">{selectedProject.subtitle}</p>
                )}
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                  <span>{selectedProject.documents} documents</span>
                  <span>•</span>
                  <span>{selectedProject.images} images</span>
                  <span>•</span>
                  <span>{selectedProject.charts} charts</span>
                </div>
              </div>
            </div>
          </div>

          {/* Content Tabs */}
          <Tabs defaultValue="documents" className="space-y-6">
            <TabsList className="bg-white/5 border border-white/10">
              <TabsTrigger value="documents" className="data-[state=active]:bg-fuchsia-500/20">
                <FileText className="w-4 h-4 mr-2" />
                Documents ({sampleFiles.documents.length})
              </TabsTrigger>
              <TabsTrigger value="images" className="data-[state=active]:bg-fuchsia-500/20">
                <Image className="w-4 h-4 mr-2" />
                AI Images ({sampleFiles.images.length})
              </TabsTrigger>
              <TabsTrigger value="charts" className="data-[state=active]:bg-fuchsia-500/20">
                <BarChart3 className="w-4 h-4 mr-2" />
                Charts ({sampleFiles.charts.length})
              </TabsTrigger>
              <TabsTrigger value="presentations" className="data-[state=active]:bg-fuchsia-500/20">
                <Presentation className="w-4 h-4 mr-2" />
                Presentations ({sampleFiles.presentations.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="documents" className="space-y-4">
              {sampleFiles.documents.map((doc, index) => (
                <div key={index} className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl p-4 hover:border-fuchsia-500/50 transition-all cursor-pointer">
                  <div className="p-3 bg-blue-500/20 rounded-lg">
                    <FileText className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-white">{doc.name}</h3>
                    <p className="text-sm text-gray-400">{doc.size} • {doc.date}</p>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={
                      doc.status === 'signed' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                      doc.status === 'draft' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                      'bg-blue-500/20 text-blue-400 border-blue-500/30'
                    }
                  >
                    {doc.status}
                  </Badge>
                  <Button variant="ghost" size="icon">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="images" className="grid grid-cols-4 gap-4">
              {sampleFiles.images.map((img, index) => (
                <div key={index} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-fuchsia-500/50 transition-all cursor-pointer">
                  <div className="aspect-video bg-gradient-to-br from-fuchsia-500/20 to-cyan-500/20 flex items-center justify-center">
                    <Image className="w-12 h-12 text-white/30" />
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-white text-sm truncate">{img.name}</h3>
                    <p className="text-xs text-gray-400">{img.source} • {img.date}</p>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="charts" className="grid grid-cols-3 gap-4">
              {sampleFiles.charts.map((chart, index) => (
                <div key={index} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-fuchsia-500/50 transition-all cursor-pointer">
                  <div className="aspect-video bg-gradient-to-br from-cyan-500/10 to-fuchsia-500/10 rounded-lg flex items-center justify-center mb-3">
                    <BarChart3 className="w-12 h-12 text-cyan-400/50" />
                  </div>
                  <h3 className="font-medium text-white">{chart.name}</h3>
                  <p className="text-sm text-gray-400">{chart.type} • {chart.date}</p>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="presentations" className="grid grid-cols-2 gap-4">
              {sampleFiles.presentations.map((pres, index) => (
                <div key={index} className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-fuchsia-500/50 transition-all cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-fuchsia-500/20 rounded-xl">
                      <Presentation className="w-8 h-8 text-fuchsia-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white text-lg">{pres.name}</h3>
                      <p className="text-sm text-gray-400">{pres.slides} slides • {pres.date}</p>
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        // Projects Overview
        <div className="space-y-8">
          {/* Project Folders */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-fuchsia-400" />
              Projects
            </h2>
            <div className="grid grid-cols-3 gap-4">
              {projects.map(project => (
                <div
                  key={project.id}
                  onClick={() => setSelectedProject(project)}
                  className={`bg-gradient-to-br ${project.color} border ${project.borderColor} rounded-xl p-6 cursor-pointer hover:scale-[1.02] transition-all`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-4xl">{project.icon}</span>
                    <Badge variant="outline" className="bg-white/10 text-white border-white/20">
                      {project.status}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-semibold text-white">{project.name}</h3>
                  {project.subtitle && (
                    <p className="text-sm text-gray-400">{project.subtitle}</p>
                  )}
                  <div className="mt-4 flex items-center gap-4 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      {project.documents}
                    </span>
                    <span className="flex items-center gap-1">
                      <Image className="w-4 h-4" />
                      {project.images}
                    </span>
                    <span className="flex items-center gap-1">
                      <BarChart3 className="w-4 h-4" />
                      {project.charts}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    Updated {project.lastUpdated}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Secret Projects - Vault Level Security */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-red-400" />
              Secure Projects
              <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/30 text-xs">
                <Lock className="w-3 h-3 mr-1" />
                Vault Protected
              </Badge>
            </h2>
            <div className="grid grid-cols-3 gap-4">
              {secretProjects.map(project => (
                <div
                  key={project.id}
                  onClick={() => setSelectedProject(project)}
                  className={`bg-gradient-to-br ${project.color} border ${project.borderColor} rounded-xl p-6 cursor-pointer hover:scale-[1.02] transition-all relative overflow-hidden`}
                >
                  {/* Security overlay pattern */}
                  <div className="absolute inset-0 opacity-5">
                    <div className="absolute inset-0" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)' }} />
                  </div>
                  <div className="relative">
                    <div className="flex items-start justify-between mb-4">
                      <span className="text-4xl">{project.icon}</span>
                      <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/30">
                        <Lock className="w-3 h-3 mr-1" />
                        Secret
                      </Badge>
                    </div>
                    <h3 className="text-lg font-semibold text-white">{project.name}</h3>
                    {project.subtitle && (
                      <p className="text-sm text-gray-400">{project.subtitle}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">{project.description}</p>
                    <div className="mt-4 flex items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        {project.documents}
                      </span>
                      <span className="flex items-center gap-1">
                        <BarChart3 className="w-4 h-4" />
                        {project.charts}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-3">
                      Updated {project.lastUpdated}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Personal Section */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Home className="w-5 h-5 text-cyan-400" />
              Personal
            </h2>
            <div className="grid grid-cols-4 gap-4">
              {personalItems.map(item => (
                <div
                  key={item.id}
                  className="bg-white/5 border border-white/10 rounded-xl p-4 cursor-pointer hover:border-cyan-500/50 transition-all"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <h3 className="font-medium text-white">{item.name}</h3>
                      <p className="text-xs text-gray-400">{item.items} items</p>
                    </div>
                  </div>
                  <Progress value={Math.random() * 100} className="h-1" />
                </div>
              ))}
            </div>
          </div>

          {/* Recent Files */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" />
              Recent Files
            </h2>
            <div className="bg-white/5 border border-white/10 rounded-xl divide-y divide-white/10">
              {[...sampleFiles.documents.slice(0, 3), ...sampleFiles.images.slice(0, 2)].map((file, index) => (
                <div key={index} className="flex items-center gap-4 p-4 hover:bg-white/5 cursor-pointer">
                  <div className={`p-2 rounded-lg ${'size' in file ? 'bg-blue-500/20' : 'bg-fuchsia-500/20'}`}>
                    {'size' in file ? (
                      <FileText className="w-5 h-5 text-blue-400" />
                    ) : (
                      <Image className="w-5 h-5 text-fuchsia-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-white">{file.name}</h3>
                    <p className="text-sm text-gray-400">{'size' in file ? file.size : 'AI Generated'} • {file.date}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
