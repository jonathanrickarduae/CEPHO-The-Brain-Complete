import { useState, useCallback } from 'react';
import {
  Inbox, Upload, Mail, MessageSquare, FileText, Image,
  Mic, Link2, Filter, Search, Check, X, FolderPlus,
  MoreHorizontal, Clock, Tag, User, Sparkles, ChevronDown,
  File, Play, Pause, Volume2, ExternalLink, Trash2
} from 'lucide-react';

type ItemType = 'email' | 'document' | 'voice' | 'image' | 'link' | 'text' | 'whatsapp';
type ItemStatus = 'new' | 'processing' | 'ready' | 'archived';

interface InboxItem {
  id: string;
  type: ItemType;
  title: string;
  preview?: string;
  sender?: string;
  source: 'email' | 'upload' | 'whatsapp' | 'api';
  status: ItemStatus;
  extractedText?: string;
  tags: string[];
  projectId?: string;
  createdAt: Date;
  fileSize?: string;
  duration?: number; // for voice notes
}

interface Project {
  id: string;
  name: string;
  itemCount: number;
}

export function UniversalInbox() {
  const [items, setItems] = useState<InboxItem[]>([
    {
      id: 'item-1',
      type: 'document',
      title: 'WasteGen_Investment_Memo.pdf',
      preview: 'Investment opportunity in waste-to-energy sector...',
      sender: 'James Wilson',
      source: 'email',
      status: 'ready',
      extractedText: 'WasteGen Ltd is a waste-to-energy company seeking Series A funding...',
      tags: ['investment', 'energy', 'new-opportunity'],
      createdAt: new Date(),
      fileSize: '2.4 MB'
    },
    {
      id: 'item-2',
      type: 'voice',
      title: 'Voice note from Sarah',
      preview: 'Discussion about WasteGen due diligence requirements...',
      sender: 'Sarah Chen',
      source: 'upload',
      status: 'ready',
      extractedText: 'Transcription: We need to look at their financials for the last three years...',
      tags: ['wastegen', 'due-diligence'],
      createdAt: new Date(Date.now() - 3600000),
      duration: 142
    },
    {
      id: 'item-3',
      type: 'email',
      title: 'Re: WasteGen Introduction',
      preview: 'Following up on our conversation about the opportunity...',
      sender: 'Mark Thompson',
      source: 'email',
      status: 'new',
      tags: ['wastegen'],
      createdAt: new Date(Date.now() - 7200000)
    },
    {
      id: 'item-4',
      type: 'image',
      title: 'WasteGen_Facility_Photo.jpg',
      preview: 'Image of processing facility',
      source: 'email',
      status: 'processing',
      tags: ['wastegen', 'facility'],
      createdAt: new Date(Date.now() - 10800000),
      fileSize: '1.8 MB'
    },
    {
      id: 'item-5',
      type: 'link',
      title: 'WasteGen Company Website',
      preview: 'https://wastegen.example.com',
      source: 'upload',
      status: 'ready',
      extractedText: 'Scraped content: WasteGen is a leading waste-to-energy provider...',
      tags: ['wastegen', 'research'],
      createdAt: new Date(Date.now() - 14400000)
    }
  ]);

  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [filter, setFilter] = useState<ItemType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const projects: Project[] = [
    { id: 'proj-1', name: 'WasteGen Opportunity', itemCount: 3 },
    { id: 'proj-2', name: 'Celadon Development', itemCount: 12 },
  ];

  const typeConfig: Record<ItemType, { icon: typeof FileText; color: string; label: string }> = {
    email: { icon: Mail, color: 'text-blue-400', label: 'Email' },
    document: { icon: FileText, color: 'text-orange-400', label: 'Document' },
    voice: { icon: Mic, color: 'text-purple-400', label: 'Voice Note' },
    image: { icon: Image, color: 'text-green-400', label: 'Image' },
    link: { icon: Link2, color: 'text-cyan-400', label: 'Link' },
    text: { icon: MessageSquare, color: 'text-yellow-400', label: 'Text' },
    whatsapp: { icon: MessageSquare, color: 'text-green-500', label: 'WhatsApp' },
  };

  const statusConfig: Record<ItemStatus, { color: string; label: string }> = {
    new: { color: 'bg-blue-500', label: 'New' },
    processing: { color: 'bg-yellow-500', label: 'Processing' },
    ready: { color: 'bg-green-500', label: 'Ready' },
    archived: { color: 'bg-gray-500', label: 'Archived' },
  };

  const filteredItems = items.filter(item => {
    if (filter !== 'all' && item.type !== filter) return false;
    if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const toggleSelect = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedItems.length === filteredItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredItems.map(i => i.id));
    }
  };

  const createProjectFromSelection = () => {
    if (!newProjectName.trim() || selectedItems.length === 0) return;
    
    // In production, this would create a project and link items
    console.log('Creating project:', newProjectName, 'with items:', selectedItems);
    
    setShowCreateProject(false);
    setNewProjectName('');
    setSelectedItems([]);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    files.forEach(file => {
      const type: ItemType = 
        file.type.includes('audio') ? 'voice' :
        file.type.includes('image') ? 'image' :
        file.type.includes('pdf') || file.type.includes('document') ? 'document' : 'document';
      
      const newItem: InboxItem = {
        id: `item-${Date.now()}-${Math.random()}`,
        type,
        title: file.name,
        source: 'upload',
        status: 'processing',
        tags: [],
        createdAt: new Date(),
        fileSize: `${(file.size / 1024 / 1024).toFixed(1)} MB`
      };
      
      setItems(prev => [newItem, ...prev]);
      
      // Simulate processing
      setTimeout(() => {
        setItems(prev => prev.map(i => 
          i.id === newItem.id ? { ...i, status: 'ready' as ItemStatus } : i
        ));
      }, 2000);
    });
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
              <Inbox className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Inbox</h1>
              <p className="text-sm text-muted-foreground">{items.filter(i => i.status === 'new').length} new items</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 bg-gray-700 text-foreground rounded-lg hover:bg-gray-600 transition-colors text-sm flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Connect Email
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search inbox..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary text-sm"
            />
          </div>
          <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded text-sm transition-colors ${
                filter === 'all' ? 'bg-gray-700 text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              All
            </button>
            {(['email', 'document', 'voice', 'image'] as ItemType[]).map(type => {
              const config = typeConfig[type];
              return (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={`px-3 py-1.5 rounded text-sm transition-colors flex items-center gap-1 ${
                    filter === type ? 'bg-gray-700 text-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <config.icon className={`w-3 h-3 ${config.color}`} />
                  {config.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selection Actions */}
      {selectedItems.length > 0 && (
        <div className="px-4 py-2 bg-primary/10 border-b border-primary/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={selectAll}
              className="text-sm text-primary hover:underline"
            >
              {selectedItems.length === filteredItems.length ? 'Deselect all' : 'Select all'}
            </button>
            <span className="text-sm text-foreground">{selectedItems.length} selected</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCreateProject(true)}
              className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm flex items-center gap-2"
            >
              <FolderPlus className="w-4 h-4" />
              Create Project
            </button>
            <button className="px-3 py-1.5 bg-gray-700 text-foreground rounded-lg hover:bg-gray-600 transition-colors text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Analyse
            </button>
          </div>
        </div>
      )}

      {/* Drop Zone / Item List */}
      <div 
        className={`flex-1 overflow-auto ${isDragging ? 'bg-primary/5' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        {isDragging ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <Upload className="w-16 h-16 text-primary mx-auto mb-4" />
              <p className="text-lg font-medium text-foreground">Drop files here</p>
              <p className="text-sm text-muted-foreground">Documents, images, voice notes</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredItems.map(item => {
              const config = typeConfig[item.type];
              const Icon = config.icon;
              const isSelected = selectedItems.includes(item.id);

              return (
                <div
                  key={item.id}
                  className={`p-4 hover:bg-gray-800/50 transition-colors ${
                    isSelected ? 'bg-primary/5' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Checkbox */}
                    <button
                      onClick={() => toggleSelect(item.id)}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                        isSelected 
                          ? 'bg-primary border-primary' 
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </button>

                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-5 h-5 ${config.color}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-foreground truncate">{item.title}</h3>
                        <span className={`w-2 h-2 rounded-full ${statusConfig[item.status].color}`} />
                        {item.status === 'processing' && (
                          <span className="text-xs text-yellow-400">Processing...</span>
                        )}
                      </div>
                      
                      {item.preview && (
                        <p className="text-sm text-muted-foreground truncate mb-2">{item.preview}</p>
                      )}

                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {item.sender && (
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {item.sender}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {item.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {item.fileSize && <span>{item.fileSize}</span>}
                        {item.duration && (
                          <span className="flex items-center gap-1">
                            <Play className="w-3 h-3" />
                            {formatDuration(item.duration)}
                          </span>
                        )}
                      </div>

                      {/* Tags */}
                      {item.tags.length > 0 && (
                        <div className="flex items-center gap-1 mt-2">
                          {item.tags.map(tag => (
                            <span 
                              key={tag}
                              className="px-2 py-0.5 bg-gray-700 text-muted-foreground rounded text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Extracted Content Preview */}
                      {item.extractedText && item.status === 'ready' && (
                        <div className="mt-2 p-2 bg-gray-800/50 rounded-lg">
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {item.extractedText}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                        <Sparkles className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                        <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Upload Button (Mobile) */}
      <div className="p-4 border-t border-border">
        <label className="w-full py-3 bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer">
          <Upload className="w-5 h-5 text-muted-foreground" />
          <span className="text-foreground">Upload files</span>
          <input type="file" multiple className="hidden" onChange={(e) => {
            // Handle file upload
            const files = e.target.files;
            if (files) {
              Array.from(files).forEach(file => {
                const type: ItemType = 
                  file.type.includes('audio') ? 'voice' :
                  file.type.includes('image') ? 'image' : 'document';
                
                const newItem: InboxItem = {
                  id: `item-${Date.now()}-${Math.random()}`,
                  type,
                  title: file.name,
                  source: 'upload',
                  status: 'processing',
                  tags: [],
                  createdAt: new Date(),
                  fileSize: `${(file.size / 1024 / 1024).toFixed(1)} MB`
                };
                
                setItems(prev => [newItem, ...prev]);
              });
            }
          }} />
        </label>
      </div>

      {/* Create Project Modal */}
      {showCreateProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-foreground mb-2">Create Project</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Group {selectedItems.length} items into a new project for analysis.
            </p>
            
            <input
              type="text"
              placeholder="Project name (e.g., WasteGen Opportunity)"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary mb-4"
            />

            <div className="bg-gray-800/50 rounded-lg p-3 mb-4">
              <p className="text-xs text-muted-foreground mb-2">Chief of Staff will:</p>
              <ul className="text-sm text-foreground space-y-1">
                <li>• Extract and analyse all content</li>
                <li>• Create initial assessment summary</li>
                <li>• Identify key information and contacts</li>
                <li>• Suggest next steps</li>
              </ul>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => { setShowCreateProject(false); setNewProjectName(''); }}
                className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createProjectFromSelection}
                disabled={!newProjectName.trim()}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                Create & Analyse
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
