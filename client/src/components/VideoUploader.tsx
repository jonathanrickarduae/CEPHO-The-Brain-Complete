import React, { useState, useRef, useCallback } from 'react';
import {
  Upload, Video, Link2, Youtube, Play, X, CheckCircle,
  AlertCircle, Loader2, Image, Trash2, ExternalLink
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

export interface UploadedVideo {
  id: string;
  type: 'upload' | 'youtube' | 'vimeo' | 'url';
  title: string;
  url: string;
  thumbnailUrl?: string;
  duration?: number;
  fileSize?: number;
  status: 'uploading' | 'processing' | 'ready' | 'error';
  progress?: number;
  error?: string;
}

interface VideoUploaderProps {
  onVideoUploaded: (video: UploadedVideo) => void;
  onVideoRemoved?: (videoId: string) => void;
  existingVideos?: UploadedVideo[];
  maxVideos?: number;
  acceptedFormats?: string[];
  maxFileSize?: number; // MB
}

// ============================================================================
// YOUTUBE/VIMEO URL PARSER
// ============================================================================

function parseVideoUrl(url: string): { type: 'youtube' | 'vimeo' | 'url'; videoId?: string } | null {
  // YouTube patterns
  const youtubePatterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/
  ];
  
  for (const pattern of youtubePatterns) {
    const match = url.match(pattern);
    if (match) {
      return { type: 'youtube', videoId: match[1] };
    }
  }
  
  // Vimeo patterns
  const vimeoPattern = /vimeo\.com\/(\d+)/;
  const vimeoMatch = url.match(vimeoPattern);
  if (vimeoMatch) {
    return { type: 'vimeo', videoId: vimeoMatch[1] };
  }
  
  // Generic video URL
  if (url.match(/\.(mp4|webm|mov|avi)$/i) || url.includes('video')) {
    return { type: 'url' };
  }
  
  return null;
}

function getYoutubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}

function getYoutubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}`;
}

function getVimeoEmbedUrl(videoId: string): string {
  return `https://player.vimeo.com/video/${videoId}`;
}

// ============================================================================
// VIDEO PREVIEW COMPONENT
// ============================================================================

function VideoPreview({ 
  video, 
  onRemove 
}: { 
  video: UploadedVideo; 
  onRemove?: () => void;
}) {
  const [showPlayer, setShowPlayer] = useState(false);
  
  const getEmbedUrl = () => {
    if (video.type === 'youtube') {
      const videoId = video.url.match(/embed\/([a-zA-Z0-9_-]{11})/)?.[1];
      return videoId ? getYoutubeEmbedUrl(videoId) : video.url;
    }
    if (video.type === 'vimeo') {
      const videoId = video.url.match(/video\/(\d+)/)?.[1];
      return videoId ? getVimeoEmbedUrl(videoId) : video.url;
    }
    return video.url;
  };
  
  return (
    <div className="relative bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden">
      {/* Thumbnail/Player */}
      <div className="relative aspect-video bg-black">
        {showPlayer ? (
          <iframe
            src={getEmbedUrl()}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <>
            {video.thumbnailUrl ? (
              <img 
                src={video.thumbnailUrl} 
                alt={video.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                <Video className="w-12 h-12 text-gray-600" />
              </div>
            )}
            
            {/* Play Button Overlay */}
            <button
              onClick={() => setShowPlayer(true)}
              className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/30 transition-colors group"
            >
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                <Play className="w-8 h-8 text-white fill-white ml-1" />
              </div>
            </button>
          </>
        )}
        
        {/* Status Badge */}
        {video.status === 'uploading' && (
          <div className="absolute top-2 left-2 px-2 py-1 bg-blue-500/80 text-white text-xs rounded-full flex items-center gap-1">
            <Loader2 className="w-3 h-3 animate-spin" />
            Uploading {video.progress}%
          </div>
        )}
        {video.status === 'processing' && (
          <div className="absolute top-2 left-2 px-2 py-1 bg-amber-500/80 text-white text-xs rounded-full flex items-center gap-1">
            <Loader2 className="w-3 h-3 animate-spin" />
            Processing
          </div>
        )}
        {video.status === 'error' && (
          <div className="absolute top-2 left-2 px-2 py-1 bg-red-500/80 text-white text-xs rounded-full flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Error
          </div>
        )}
        
        {/* Type Badge */}
        <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 text-white text-xs rounded-full flex items-center gap-1">
          {video.type === 'youtube' && <Youtube className="w-3 h-3 text-red-500" />}
          {video.type === 'vimeo' && <Video className="w-3 h-3 text-blue-400" />}
          {video.type === 'upload' && <Upload className="w-3 h-3" />}
          {video.type === 'url' && <Link2 className="w-3 h-3" />}
          <span className="capitalize">{video.type}</span>
        </div>
        
        {/* Remove Button */}
        {onRemove && (
          <button
            onClick={onRemove}
            className="absolute bottom-2 right-2 p-2 bg-red-500/80 hover:bg-red-500 text-white rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
      
      {/* Info */}
      <div className="p-3">
        <h4 className="font-medium text-white truncate">{video.title}</h4>
        <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
          {video.duration && (
            <span>{Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}</span>
          )}
          {video.fileSize && (
            <span>{(video.fileSize / (1024 * 1024)).toFixed(1)} MB</span>
          )}
        </div>
      </div>
      
      {/* Upload Progress Bar */}
      {video.status === 'uploading' && video.progress !== undefined && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
          <div 
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${video.progress}%` }}
          />
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MAIN VIDEO UPLOADER COMPONENT
// ============================================================================

export default function VideoUploader({
  onVideoUploaded,
  onVideoRemoved,
  existingVideos = [],
  maxVideos = 4,
  acceptedFormats = ['video/mp4', 'video/webm', 'video/quicktime'],
  maxFileSize = 500 // MB
}: VideoUploaderProps) {
  const [videos, setVideos] = useState<UploadedVideo[]>(existingVideos);
  const [urlInput, setUrlInput] = useState('');
  const [urlError, setUrlError] = useState('');
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const canAddMore = videos.length < maxVideos;
  
  // Handle file upload
  const handleFileUpload = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    for (const file of Array.from(files)) {
      // Validate file type
      if (!acceptedFormats.includes(file.type)) {
        alert(`Invalid file type: ${file.type}. Accepted formats: ${acceptedFormats.join(', ')}`);
        continue;
      }
      
      // Validate file size
      if (file.size > maxFileSize * 1024 * 1024) {
        alert(`File too large: ${(file.size / (1024 * 1024)).toFixed(1)} MB. Max size: ${maxFileSize} MB`);
        continue;
      }
      
      // Create video entry
      const videoId = `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newVideo: UploadedVideo = {
        id: videoId,
        type: 'upload',
        title: file.name.replace(/\.[^/.]+$/, ''),
        url: '',
        fileSize: file.size,
        status: 'uploading',
        progress: 0
      };
      
      setVideos(prev => [...prev, newVideo]);
      
      // Simulate upload progress (replace with actual S3 upload)
      const uploadVideo = async () => {
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise(resolve => setTimeout(resolve, 200));
          setVideos(prev => prev.map(v => 
            v.id === videoId ? { ...v, progress } : v
          ));
        }
        
        // Create object URL for preview (in production, this would be S3 URL)
        const objectUrl = URL.createObjectURL(file);
        
        // Generate thumbnail (in production, use server-side processing)
        const thumbnailUrl = await generateVideoThumbnail(file);
        
        // Update video as ready
        const completedVideo: UploadedVideo = {
          ...newVideo,
          url: objectUrl,
          thumbnailUrl,
          status: 'ready',
          progress: 100
        };
        
        setVideos(prev => prev.map(v => 
          v.id === videoId ? completedVideo : v
        ));
        
        onVideoUploaded(completedVideo);
      };
      
      uploadVideo();
    }
  }, [acceptedFormats, maxFileSize, onVideoUploaded]);
  
  // Generate video thumbnail
  const generateVideoThumbnail = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.src = URL.createObjectURL(file);
      
      video.onloadedmetadata = () => {
        video.currentTime = Math.min(1, video.duration / 2);
      };
      
      video.onseeked = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(video, 0, 0);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
        URL.revokeObjectURL(video.src);
      };
      
      video.onerror = () => {
        resolve('');
      };
    });
  };
  
  // Handle URL submission
  const handleUrlSubmit = () => {
    setUrlError('');
    
    if (!urlInput.trim()) {
      setUrlError('Please enter a video URL');
      return;
    }
    
    const parsed = parseVideoUrl(urlInput);
    if (!parsed) {
      setUrlError('Invalid video URL. Supported: YouTube, Vimeo, or direct video links');
      return;
    }
    
    const videoId = `${parsed.type}-${Date.now()}`;
    let embedUrl = urlInput;
    let thumbnailUrl = '';
    
    if (parsed.type === 'youtube' && parsed.videoId) {
      embedUrl = getYoutubeEmbedUrl(parsed.videoId);
      thumbnailUrl = getYoutubeThumbnail(parsed.videoId);
    } else if (parsed.type === 'vimeo' && parsed.videoId) {
      embedUrl = getVimeoEmbedUrl(parsed.videoId);
    }
    
    const newVideo: UploadedVideo = {
      id: videoId,
      type: parsed.type,
      title: `Video from ${parsed.type}`,
      url: embedUrl,
      thumbnailUrl,
      status: 'ready'
    };
    
    setVideos(prev => [...prev, newVideo]);
    onVideoUploaded(newVideo);
    setUrlInput('');
  };
  
  // Handle video removal
  const handleRemoveVideo = (videoId: string) => {
    setVideos(prev => prev.filter(v => v.id !== videoId));
    onVideoRemoved?.(videoId);
  };
  
  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
  };
  
  return (
    <div className="space-y-6">
      {/* Existing Videos */}
      {videos.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {videos.map(video => (
            <VideoPreview
              key={video.id}
              video={video}
              onRemove={() => handleRemoveVideo(video.id)}
            />
          ))}
        </div>
      )}
      
      {/* Upload Section */}
      {canAddMore && (
        <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6">
          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'upload'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-400 hover:text-white'
              }`}
            >
              <Upload className="w-4 h-4 inline mr-2" />
              Upload File
            </button>
            <button
              onClick={() => setActiveTab('url')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'url'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-400 hover:text-white'
              }`}
            >
              <Link2 className="w-4 h-4 inline mr-2" />
              Paste URL
            </button>
          </div>
          
          {/* Upload Tab */}
          {activeTab === 'upload' && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                isDragging
                  ? 'border-purple-500 bg-purple-500/10'
                  : 'border-gray-600 hover:border-gray-500'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={acceptedFormats.join(',')}
                onChange={(e) => handleFileUpload(e.target.files)}
                className="hidden"
                multiple
              />
              
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-700 flex items-center justify-center">
                <Upload className="w-8 h-8 text-gray-400" />
              </div>
              
              <p className="text-white font-medium mb-2">
                {isDragging ? 'Drop your video here' : 'Drag and drop your video'}
              </p>
              <p className="text-sm text-gray-400 mb-4">
                or click to browse • Max {maxFileSize}MB • MP4, WebM, MOV
              </p>
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors"
              >
                Choose File
              </button>
            </div>
          )}
          
          {/* URL Tab */}
          {activeTab === 'url' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Paste YouTube, Vimeo, or direct video URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    className="flex-1 px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  />
                  <button
                    onClick={handleUrlSubmit}
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors"
                  >
                    Add Video
                  </button>
                </div>
                {urlError && (
                  <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {urlError}
                  </p>
                )}
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Youtube className="w-4 h-4 text-red-500" />
                  YouTube
                </span>
                <span className="flex items-center gap-1">
                  <Video className="w-4 h-4 text-blue-400" />
                  Vimeo
                </span>
                <span className="flex items-center gap-1">
                  <Link2 className="w-4 h-4" />
                  Direct URL
                </span>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Max Videos Reached */}
      {!canAddMore && (
        <div className="text-center py-4 text-gray-400">
          <CheckCircle className="w-6 h-6 mx-auto mb-2 text-green-500" />
          Maximum {maxVideos} videos reached
        </div>
      )}
    </div>
  );
}
