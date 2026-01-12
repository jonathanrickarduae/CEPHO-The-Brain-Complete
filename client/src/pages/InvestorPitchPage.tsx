import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation } from 'wouter';
import {
  Play, Pause, Volume2, VolumeX, Maximize, ChevronRight,
  Download, ExternalLink, Linkedin, Twitter, Instagram, Youtube, Globe,
  Mail, Phone, Lock, Eye, Clock, FileText, BarChart3, Users, Rocket,
  CheckCircle, Share2
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface PitchVideo {
  id: string;
  title: string;
  type: 'overview' | 'product' | 'team' | 'traction';
  description: string;
  duration: number;
  videoUrl: string;
  thumbnailUrl: string;
}

interface PitchPack {
  id: string;
  companyName: string;
  tagline: string;
  description: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  
  // Social Links
  websiteUrl?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  instagramUrl?: string;
  youtubeUrl?: string;
  
  // Contact
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  
  // Videos
  videos: PitchVideo[];
  
  // Downloadable Materials
  materials?: Array<{
    name: string;
    type: 'deck' | 'onepager' | 'financials' | 'other';
    url: string;
  }>;
}

// ============================================================================
// DEMO DATA (Replace with API call)
// ============================================================================

const DEMO_PITCH_PACK: PitchPack = {
  id: 'demo-1',
  companyName: 'TechVenture AI',
  tagline: 'Revolutionizing enterprise automation with intelligent AI agents',
  description: 'TechVenture AI builds autonomous AI agents that handle complex business processes, reducing operational costs by 60% while improving accuracy and speed.',
  logoUrl: '',
  primaryColor: '#8B5CF6',
  secondaryColor: '#EC4899',
  
  websiteUrl: 'https://techventure.ai',
  linkedinUrl: 'https://linkedin.com/company/techventure',
  twitterUrl: 'https://twitter.com/techventure',
  
  contactName: 'Sarah Chen',
  contactEmail: 'sarah@techventure.ai',
  contactPhone: '+1 (555) 123-4567',
  
  videos: [
    {
      id: 'v1',
      title: 'Company Overview',
      type: 'overview',
      description: 'A 2-minute introduction to TechVenture AI and our mission',
      duration: 120,
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      thumbnailUrl: ''
    },
    {
      id: 'v2',
      title: 'Product Deep Dive',
      type: 'product',
      description: 'See our AI agents in action across real enterprise use cases',
      duration: 150,
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      thumbnailUrl: ''
    },
    {
      id: 'v3',
      title: 'Team & Vision',
      type: 'team',
      description: 'Meet the founders and learn about our long-term vision',
      duration: 120,
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      thumbnailUrl: ''
    }
  ],
  
  materials: [
    { name: 'Investor Deck', type: 'deck', url: '#' },
    { name: 'One-Pager', type: 'onepager', url: '#' },
    { name: 'Financial Projections', type: 'financials', url: '#' }
  ]
};

// ============================================================================
// VIDEO TYPE ICONS
// ============================================================================

const VIDEO_TYPE_ICONS: Record<string, React.ReactNode> = {
  overview: <Rocket className="w-5 h-5" />,
  product: <BarChart3 className="w-5 h-5" />,
  team: <Users className="w-5 h-5" />,
  traction: <BarChart3 className="w-5 h-5" />
};

const VIDEO_TYPE_LABELS: Record<string, string> = {
  overview: 'Overview',
  product: 'Product',
  team: 'Team & Vision',
  traction: 'Traction'
};

// ============================================================================
// PASSWORD GATE COMPONENT
// ============================================================================

function PasswordGate({ 
  onSuccess, 
  companyName 
}: { 
  onSuccess: () => void; 
  companyName: string;
}) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    // Simulate password check (replace with API call)
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (password === 'demo123') {
      onSuccess();
    } else {
      setError('Incorrect password. Please try again.');
    }
    setIsLoading(false);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-purple-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Protected Content</h1>
            <p className="text-gray-400">
              Enter the password to view {companyName}'s investor materials
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                autoFocus
              />
              {error && (
                <p className="mt-2 text-sm text-red-400">{error}</p>
              )}
            </div>
            
            <button
              type="submit"
              disabled={isLoading || !password}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:from-purple-500 hover:to-pink-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Verifying...' : 'Access Content'}
            </button>
          </form>
          
          <p className="mt-6 text-center text-sm text-gray-500">
            Don't have the password? Contact the sender.
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// VIDEO PLAYER COMPONENT
// ============================================================================

function VideoPlayer({ video, autoPlay = false }: { video: PitchVideo; autoPlay?: boolean }) {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  
  // For demo, using iframe embed. In production, use a proper video player
  return (
    <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
      <iframe
        src={`${video.videoUrl}${autoPlay ? '?autoplay=1' : ''}`}
        title={video.title}
        className="absolute inset-0 w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}

// ============================================================================
// VIDEO THUMBNAIL COMPONENT
// ============================================================================

function VideoThumbnail({ 
  video, 
  isActive, 
  onClick 
}: { 
  video: PitchVideo; 
  isActive: boolean;
  onClick: () => void;
}) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl transition-all ${
        isActive 
          ? 'bg-purple-500/20 border-2 border-purple-500' 
          : 'bg-gray-800/50 border-2 border-transparent hover:bg-gray-800 hover:border-gray-700'
      }`}
    >
      <div className="flex items-start gap-4">
        <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
          isActive ? 'bg-purple-500 text-white' : 'bg-gray-700 text-gray-400'
        }`}>
          {VIDEO_TYPE_ICONS[video.type]}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              isActive ? 'bg-purple-500/30 text-purple-300' : 'bg-gray-700 text-gray-400'
            }`}>
              {VIDEO_TYPE_LABELS[video.type]}
            </span>
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDuration(video.duration)}
            </span>
          </div>
          
          <h3 className={`font-medium truncate ${isActive ? 'text-white' : 'text-gray-300'}`}>
            {video.title}
          </h3>
          
          <p className="text-sm text-gray-500 line-clamp-2 mt-1">
            {video.description}
          </p>
        </div>
        
        {isActive && (
          <div className="flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
              <Play className="w-4 h-4 text-white fill-white" />
            </div>
          </div>
        )}
      </div>
    </button>
  );
}

// ============================================================================
// MAIN INVESTOR PITCH PAGE
// ============================================================================

export default function InvestorPitchPage() {
  const params = useParams();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pitchPack, setPitchPack] = useState<PitchPack | null>(null);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load pitch pack data
  useEffect(() => {
    const loadPitchPack = async () => {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setPitchPack(DEMO_PITCH_PACK);
      setIsLoading(false);
      
      // For demo, auto-authenticate. In production, check access type
      setIsAuthenticated(true);
    };
    
    loadPitchPack();
  }, [params.slug]);
  
  // Track page view
  useEffect(() => {
    if (isAuthenticated && pitchPack) {
      // Log page view (replace with API call)
      console.log('Page view logged:', pitchPack.id);
    }
  }, [isAuthenticated, pitchPack]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }
  
  if (!pitchPack) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Content Not Found</h1>
          <p className="text-gray-400">This pitch page may have expired or been removed.</p>
        </div>
      </div>
    );
  }
  
  // Show password gate if not authenticated
  // if (!isAuthenticated) {
  //   return <PasswordGate onSuccess={() => setIsAuthenticated(true)} companyName={pitchPack.companyName} />;
  // }
  
  const activeVideo = pitchPack.videos[activeVideoIndex];
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
      {/* Header */}
      <header className="border-b border-gray-800/50 backdrop-blur-xl bg-gray-900/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {pitchPack.logoUrl ? (
                <img src={pitchPack.logoUrl} alt={pitchPack.companyName} className="h-10 w-auto" />
              ) : (
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                  style={{ background: `linear-gradient(135deg, ${pitchPack.primaryColor}, ${pitchPack.secondaryColor})` }}
                >
                  {pitchPack.companyName.charAt(0)}
                </div>
              )}
              <div>
                <h1 className="text-lg font-bold text-white">{pitchPack.companyName}</h1>
                <p className="text-sm text-gray-400 hidden sm:block">{pitchPack.tagline}</p>
              </div>
            </div>
            
            {/* Social Links */}
            <div className="flex items-center gap-2">
              {pitchPack.websiteUrl && (
                <a href={pitchPack.websiteUrl} target="_blank" rel="noopener noreferrer" 
                   className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
                  <Globe className="w-5 h-5" />
                </a>
              )}
              {pitchPack.linkedinUrl && (
                <a href={pitchPack.linkedinUrl} target="_blank" rel="noopener noreferrer"
                   className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-800 rounded-lg transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
              )}
              {pitchPack.twitterUrl && (
                <a href={pitchPack.twitterUrl} target="_blank" rel="noopener noreferrer"
                   className="p-2 text-gray-400 hover:text-sky-400 hover:bg-gray-800 rounded-lg transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
              )}
              {pitchPack.instagramUrl && (
                <a href={pitchPack.instagramUrl} target="_blank" rel="noopener noreferrer"
                   className="p-2 text-gray-400 hover:text-pink-400 hover:bg-gray-800 rounded-lg transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Player Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Video */}
            <div className="space-y-4">
              <VideoPlayer video={activeVideo} />
              
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-purple-500/20 text-purple-300">
                    {VIDEO_TYPE_LABELS[activeVideo.type]}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white">{activeVideo.title}</h2>
                <p className="text-gray-400 mt-2">{activeVideo.description}</p>
              </div>
            </div>
            
            {/* Company Description */}
            <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
              <h3 className="text-lg font-semibold text-white mb-3">About {pitchPack.companyName}</h3>
              <p className="text-gray-300 leading-relaxed">{pitchPack.description}</p>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Video List */}
            <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 px-2">
                Videos ({pitchPack.videos.length})
              </h3>
              <div className="space-y-3">
                {pitchPack.videos.map((video, index) => (
                  <VideoThumbnail
                    key={video.id}
                    video={video}
                    isActive={index === activeVideoIndex}
                    onClick={() => setActiveVideoIndex(index)}
                  />
                ))}
              </div>
            </div>
            
            {/* Downloadable Materials */}
            {pitchPack.materials && pitchPack.materials.length > 0 && (
              <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 px-2">
                  Materials
                </h3>
                <div className="space-y-2">
                  {pitchPack.materials.map((material, index) => (
                    <a
                      key={index}
                      href={material.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-lg hover:bg-gray-800 transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-purple-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-300 group-hover:text-white truncate">
                          {material.name}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">{material.type}</p>
                      </div>
                      <Download className="w-5 h-5 text-gray-500 group-hover:text-purple-400" />
                    </a>
                  ))}
                </div>
              </div>
            )}
            
            {/* Contact Card */}
            <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-6 border border-purple-500/30">
              <h3 className="text-lg font-semibold text-white mb-4">Get in Touch</h3>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <span className="text-lg font-bold text-white">
                      {pitchPack.contactName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-white">{pitchPack.contactName}</p>
                    <p className="text-sm text-gray-400">Founder</p>
                  </div>
                </div>
                
                <a 
                  href={`mailto:${pitchPack.contactEmail}`}
                  className="flex items-center gap-3 p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <Mail className="w-5 h-5 text-purple-400" />
                  <span className="text-gray-300 text-sm">{pitchPack.contactEmail}</span>
                </a>
                
                {pitchPack.contactPhone && (
                  <a 
                    href={`tel:${pitchPack.contactPhone}`}
                    className="flex items-center gap-3 p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                  >
                    <Phone className="w-5 h-5 text-purple-400" />
                    <span className="text-gray-300 text-sm">{pitchPack.contactPhone}</span>
                  </a>
                )}
              </div>
              
              <button className="w-full mt-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:from-purple-500 hover:to-pink-500 transition-all flex items-center justify-center gap-2">
                <Mail className="w-4 h-4" />
                Schedule a Call
              </button>
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="border-t border-gray-800/50 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              Powered by The Brain • Secure Investor Portal
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Lock className="w-4 h-4" />
                Secure & Confidential
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                View tracked
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
