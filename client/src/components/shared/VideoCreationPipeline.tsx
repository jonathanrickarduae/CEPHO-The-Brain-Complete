import { useState } from 'react';
import {
  Video, Film, Wand2, Play, Pause, SkipBack, SkipForward,
  Volume2, VolumeX, Download, Share2, Layers, Type, Image,
  Music, Mic, Clock, Settings, Plus, Trash2, Move, Copy,
  ChevronDown, ChevronRight, Sparkles, FileVideo, Upload,
  Instagram, Youtube, Linkedin, Twitter
} from 'lucide-react';

interface VideoProject {
  id: string;
  name: string;
  status: 'draft' | 'generating' | 'ready' | 'exported';
  duration: number; // seconds
  thumbnail?: string;
  createdAt: Date;
  scenes: Scene[];
}

interface Scene {
  id: string;
  type: 'text' | 'image' | 'video' | 'ai-generated';
  content: string;
  duration: number;
  voiceover?: string;
  transition: 'none' | 'fade' | 'slide' | 'zoom';
}

interface VideoTemplate {
  id: string;
  name: string;
  category: string;
  duration: number;
  thumbnail: string;
  description: string;
}

export function VideoCreationPipeline() {
  const [activeTab, setActiveTab] = useState<'projects' | 'create' | 'templates' | 'assets'>('projects');
  const [selectedProject, setSelectedProject] = useState<VideoProject | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [showExportModal, setShowExportModal] = useState(false);

  // Mock projects
  const [projects] = useState<VideoProject[]>([
    {
      id: 'proj-1',
      name: 'Project A Product Launch',
      status: 'ready',
      duration: 120,
      createdAt: new Date(Date.now() - 86400000),
      scenes: [
        { id: 's1', type: 'text', content: 'Introducing Project A', duration: 5, transition: 'fade' },
        { id: 's2', type: 'ai-generated', content: 'Product showcase animation', duration: 15, transition: 'slide' },
        { id: 's3', type: 'text', content: 'Key Features', duration: 10, voiceover: 'Our platform offers...', transition: 'fade' },
      ]
    },
    {
      id: 'proj-2',
      name: 'Weekly Update - Jan 11',
      status: 'draft',
      duration: 60,
      createdAt: new Date(),
      scenes: []
    }
  ]);

  const templates: VideoTemplate[] = [
    { id: 't1', name: 'Product Launch', category: 'Marketing', duration: 60, thumbnail: '', description: 'Professional product reveal with features highlight' },
    { id: 't2', name: 'Weekly Update', category: 'Internal', duration: 120, thumbnail: '', description: 'Team update format with key metrics' },
    { id: 't3', name: 'Social Clip', category: 'Social Media', duration: 30, thumbnail: '', description: 'Short-form content for Instagram/TikTok' },
    { id: 't4', name: 'Explainer', category: 'Educational', duration: 180, thumbnail: '', description: 'Step-by-step explanation with visuals' },
    { id: 't5', name: 'Testimonial', category: 'Marketing', duration: 45, thumbnail: '', description: 'Customer story with quote overlays' },
    { id: 't6', name: 'Event Promo', category: 'Marketing', duration: 30, thumbnail: '', description: 'Event announcement with countdown' },
  ];

  const exportFormats = [
    { id: 'mp4-1080', name: 'MP4 1080p', icon: FileVideo, description: 'Standard HD quality' },
    { id: 'mp4-4k', name: 'MP4 4K', icon: FileVideo, description: 'Ultra HD quality' },
    { id: 'instagram', name: 'Instagram', icon: Instagram, description: '1:1 or 9:16 format' },
    { id: 'youtube', name: 'YouTube', icon: Youtube, description: '16:9 optimized' },
    { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, description: 'Professional format' },
    { id: 'twitter', name: 'Twitter/X', icon: Twitter, description: 'Short-form optimized' },
  ];

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Video className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Video Studio</h1>
            <p className="text-sm text-muted-foreground">Create, edit, and export videos</p>
          </div>
        </div>
        <button
          onClick={() => setActiveTab('create')}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Video
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        {[
          { id: 'projects', label: 'My Projects', icon: Film },
          { id: 'create', label: 'Create', icon: Wand2 },
          { id: 'templates', label: 'Templates', icon: Layers },
          { id: 'assets', label: 'Assets', icon: Image },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {activeTab === 'projects' && (
          <div className="space-y-4">
            {projects.map(project => (
              <div
                key={project.id}
                onClick={() => setSelectedProject(project)}
                className={`p-4 bg-card border rounded-xl cursor-pointer transition-all hover:border-primary/50 ${
                  selectedProject?.id === project.id ? 'border-primary' : 'border-border'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-32 h-20 bg-gray-800 rounded-lg flex items-center justify-center">
                    <Film className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-foreground">{project.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        project.status === 'ready' ? 'bg-green-500/20 text-green-400' :
                        project.status === 'generating' ? 'bg-yellow-500/20 text-yellow-400' :
                        project.status === 'exported' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-gray-500/20 text-foreground/70'
                      }`}>
                        {project.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {project.scenes.length} scenes • {formatDuration(project.duration)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Created {project.createdAt.toLocaleDateString('en-GB')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                      <Play className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setShowExportModal(true); }}
                      className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'create' && (
          <div className="space-y-6">
            {/* AI Video Generation */}
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl p-6 border border-purple-500/30">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-6 h-6 text-purple-400" />
                <h2 className="text-lg font-semibold text-foreground">AI Video Generation</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Describe your video and let AI create it for you. Include details about style, tone, and content.
              </p>
              <textarea
                placeholder="E.g., Create a 60-second product launch video for Project A. Professional tone, modern visuals, highlight key features: AI integration, real-time analytics, team collaboration. Include animated transitions and upbeat background music."
                className="w-full h-32 px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:border-purple-500"
              />
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-4">
                  <select className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-foreground">
                    <option>30 seconds</option>
                    <option>60 seconds</option>
                    <option>90 seconds</option>
                    <option>2 minutes</option>
                  </select>
                  <select className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-foreground">
                    <option>Professional</option>
                    <option>Casual</option>
                    <option>Energetic</option>
                    <option>Minimal</option>
                  </select>
                </div>
                <button className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-2">
                  <Wand2 className="w-4 h-4" />
                  Generate Video
                </button>
              </div>
            </div>

            {/* Manual Creation Options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="p-6 bg-card border border-border rounded-xl hover:border-primary/50 transition-colors text-left">
                <Type className="w-8 h-8 text-cyan-400 mb-3" />
                <h3 className="font-semibold text-foreground mb-1">Text to Video</h3>
                <p className="text-sm text-muted-foreground">Convert script or text into animated video</p>
              </button>
              <button className="p-6 bg-card border border-border rounded-xl hover:border-primary/50 transition-colors text-left">
                <Image className="w-8 h-8 text-green-400 mb-3" />
                <h3 className="font-semibold text-foreground mb-1">Images to Video</h3>
                <p className="text-sm text-muted-foreground">Create slideshow from images with transitions</p>
              </button>
              <button className="p-6 bg-card border border-border rounded-xl hover:border-primary/50 transition-colors text-left">
                <Upload className="w-8 h-8 text-orange-400 mb-3" />
                <h3 className="font-semibold text-foreground mb-1">Upload & Edit</h3>
                <p className="text-sm text-muted-foreground">Upload existing video for editing</p>
              </button>
            </div>

            {/* Voice-over Options */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Mic className="w-5 h-5 text-primary" />
                Voice-over Options
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-800/50 rounded-lg">
                  <h4 className="font-medium text-foreground mb-2">AI Voice Generation</h4>
                  <p className="text-sm text-muted-foreground mb-3">Generate professional voice-over from your script</p>
                  <select className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-foreground">
                    <option>British Male - Professional</option>
                    <option>British Female - Professional</option>
                    <option>British Male - Casual</option>
                    <option>British Female - Casual</option>
                    <option>American Male - Professional</option>
                    <option>American Female - Professional</option>
                  </select>
                </div>
                <div className="p-4 bg-gray-800/50 rounded-lg">
                  <h4 className="font-medium text-foreground mb-2">Record Your Own</h4>
                  <p className="text-sm text-muted-foreground mb-3">Record voice-over directly in the browser</p>
                  <button className="w-full px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors flex items-center justify-center gap-2">
                    <Mic className="w-4 h-4" />
                    Start Recording
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map(template => (
              <div
                key={template.id}
                className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-colors cursor-pointer"
              >
                <div className="h-32 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                  <Film className="w-12 h-12 text-muted-foreground" />
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-foreground">{template.name}</h3>
                    <span className="text-xs px-2 py-0.5 bg-gray-700 text-muted-foreground rounded-full">
                      {formatDuration(template.duration)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                  <span className="text-xs text-primary">{template.category}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'assets' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Video Assets</h2>
              <button className="px-3 py-1.5 bg-gray-700 text-foreground rounded-lg hover:bg-gray-600 transition-colors text-sm flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Upload
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['Stock Videos', 'Music Library', 'Sound Effects', 'Brand Assets'].map((category, i) => (
                <div key={category} className="p-4 bg-card border border-border rounded-xl text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gray-700 flex items-center justify-center">
                    {i === 0 && <Video className="w-6 h-6 text-muted-foreground" />}
                    {i === 1 && <Music className="w-6 h-6 text-muted-foreground" />}
                    {i === 2 && <Volume2 className="w-6 h-6 text-muted-foreground" />}
                    {i === 3 && <Image className="w-6 h-6 text-muted-foreground" />}
                  </div>
                  <h3 className="font-medium text-foreground text-sm">{category}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {i === 0 ? '150+ clips' : i === 1 ? '80+ tracks' : i === 2 ? '200+ sounds' : '24 assets'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md">
            <div className="p-6 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">Export Video</h2>
              <p className="text-sm text-muted-foreground">Choose format and quality</p>
            </div>
            <div className="p-4 space-y-2 max-h-80 overflow-auto">
              {exportFormats.map(format => (
                <button
                  key={format.id}
                  className="w-full p-4 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl transition-colors flex items-center gap-4 text-left"
                >
                  <format.icon className="w-6 h-6 text-primary" />
                  <div>
                    <h3 className="font-medium text-foreground">{format.name}</h3>
                    <p className="text-sm text-muted-foreground">{format.description}</p>
                  </div>
                </button>
              ))}
            </div>
            <div className="p-4 border-t border-border flex justify-end gap-2">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                Export
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Compact video card for dashboard/library
export function VideoCard({ project }: { project: VideoProject }) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-colors">
      <div className="h-24 bg-gray-800 flex items-center justify-center relative">
        <Film className="w-8 h-8 text-muted-foreground" />
        <span className="absolute bottom-2 right-2 text-xs bg-black/70 px-1.5 py-0.5 rounded">
          {Math.floor(project.duration / 60)}:{(project.duration % 60).toString().padStart(2, '0')}
        </span>
      </div>
      <div className="p-3">
        <h3 className="font-medium text-foreground text-sm truncate">{project.name}</h3>
        <p className="text-xs text-muted-foreground">{project.scenes.length} scenes</p>
      </div>
    </div>
  );
}
