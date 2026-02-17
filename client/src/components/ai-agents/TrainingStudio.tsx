import { useState, useCallback } from 'react';
import { 
  Brain, Upload, FileText, MessageSquare, Settings2, 
  Trash2, Plus, Check, AlertCircle, Lock, Eye, EyeOff,
  Download, RefreshCw, Sparkles, Database, Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TrainingData {
  id: string;
  type: 'document' | 'conversation' | 'preference' | 'fact';
  title: string;
  content: string;
  source?: string;
  createdAt: Date;
  isPrivate: boolean;
  status: 'processing' | 'trained' | 'failed';
}

interface MemoryItem {
  id: string;
  category: 'personal' | 'work' | 'preferences' | 'relationships';
  key: string;
  value: string;
  confidence: number;
  lastUpdated: Date;
  isEditable: boolean;
}

interface TrainingStudioProps {
  className?: string;
}

export function TrainingStudio({ className }: TrainingStudioProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'memory' | 'preferences' | 'privacy'>('upload');
  const [trainingData, setTrainingData] = useState<TrainingData[]>([
    { id: '1', type: 'conversation', title: 'Chief of Staff Chat History', content: '47 conversations', createdAt: new Date(), isPrivate: true, status: 'trained' },
    { id: '2', type: 'preference', title: 'Communication Style', content: 'Professional, concise', createdAt: new Date(), isPrivate: true, status: 'trained' },
    { id: '3', type: 'fact', title: 'Work Schedule', content: '9 AM - 6 PM, Mon-Fri', createdAt: new Date(), isPrivate: false, status: 'trained' },
  ]);
  
  const [memories, setMemories] = useState<MemoryItem[]>([
    { id: '1', category: 'personal', key: 'Name', value: 'User', confidence: 1.0, lastUpdated: new Date(), isEditable: true },
    { id: '2', category: 'work', key: 'Role', value: 'Executive', confidence: 0.95, lastUpdated: new Date(), isEditable: true },
    { id: '3', category: 'preferences', key: 'Preferred meeting time', value: 'Morning', confidence: 0.85, lastUpdated: new Date(), isEditable: true },
    { id: '4', category: 'preferences', key: 'Communication style', value: 'Direct and concise', confidence: 0.9, lastUpdated: new Date(), isEditable: true },
    { id: '5', category: 'relationships', key: 'Team size', value: '12 direct reports', confidence: 0.8, lastUpdated: new Date(), isEditable: true },
  ]);

  const [newFact, setNewFact] = useState({ key: '', value: '' });
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = useCallback((files: FileList | null) => {
    if (!files) return;
    setIsUploading(true);
    
    // Simulate upload processing
    setTimeout(() => {
      const newData: TrainingData[] = Array.from(files).map((file, i) => ({
        id: `upload-${Date.now()}-${i}`,
        type: 'document' as const,
        title: file.name,
        content: `${(file.size / 1024).toFixed(1)} KB`,
        source: 'Upload',
        createdAt: new Date(),
        isPrivate: true,
        status: 'processing' as const,
      }));
      
      setTrainingData(prev => [...newData, ...prev]);
      setIsUploading(false);
      
      // Simulate processing completion
      setTimeout(() => {
        setTrainingData(prev => prev.map(d => 
          newData.find(n => n.id === d.id) ? { ...d, status: 'trained' as const } : d
        ));
      }, 3000);
    }, 1000);
  }, []);

  const addMemory = useCallback(() => {
    if (!newFact.key || !newFact.value) return;
    
    const memory: MemoryItem = {
      id: `memory-${Date.now()}`,
      category: 'preferences',
      key: newFact.key,
      value: newFact.value,
      confidence: 1.0,
      lastUpdated: new Date(),
      isEditable: true,
    };
    
    setMemories(prev => [memory, ...prev]);
    setNewFact({ key: '', value: '' });
  }, [newFact]);

  const deleteMemory = useCallback((id: string) => {
    setMemories(prev => prev.filter(m => m.id !== id));
  }, []);

  const deleteTrainingData = useCallback((id: string) => {
    setTrainingData(prev => prev.filter(d => d.id !== id));
  }, []);

  const tabs = [
    { id: 'upload', label: 'Upload Data', icon: Upload },
    { id: 'memory', label: 'Memory Bank', icon: Database },
    { id: 'preferences', label: 'Preferences', icon: Settings2 },
    { id: 'privacy', label: 'Privacy', icon: Shield },
  ] as const;

  const getStatusIcon = (status: TrainingData['status']) => {
    switch (status) {
      case 'trained': return <Check className="w-4 h-4 text-green-400" />;
      case 'processing': return <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />;
      case 'failed': return <AlertCircle className="w-4 h-4 text-red-400" />;
    }
  };

  const getCategoryColor = (category: MemoryItem['category']) => {
    switch (category) {
      case 'personal': return 'bg-purple-500/20 text-purple-400';
      case 'work': return 'bg-blue-500/20 text-blue-400';
      case 'preferences': return 'bg-amber-500/20 text-amber-400';
      case 'relationships': return 'bg-green-500/20 text-green-400';
    }
  };

  return (
    <div className={cn('bg-card/60 border border-white/10 rounded-xl overflow-hidden', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-emerald-400" />
          <h3 className="font-medium text-foreground">Training Studio</h3>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Sparkles className="w-3 h-3" />
          <span>{trainingData.filter(d => d.status === 'trained').length} items trained</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm transition-colors',
              activeTab === tab.id
                ? 'text-foreground border-b-2 border-emerald-500 bg-emerald-500/10'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/30'
            )}
          >
            <tab.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div className="space-y-4">
            {/* Upload Area */}
            <div
              className={cn(
                'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
                isUploading ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-white/20 hover:border-emerald-500/50'
              )}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); handleFileUpload(e.dataTransfer.files); }}
            >
              <input
                type="file"
                multiple
                className="hidden"
                id="file-upload"
                onChange={(e) => handleFileUpload(e.target.files)}
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                {isUploading ? (
                  <RefreshCw className="w-8 h-8 mx-auto mb-2 text-emerald-400 animate-spin" />
                ) : (
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                )}
                <p className="text-sm text-foreground mb-1">
                  {isUploading ? 'Processing...' : 'Drop files here or click to upload'}
                </p>
                <p className="text-xs text-muted-foreground">
                  Documents, PDFs, text files - your AI will learn from them
                </p>
              </label>
            </div>

            {/* Training Data List */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-foreground">Training Data</h4>
              {trainingData.map(data => (
                <div
                  key={data.id}
                  className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg border border-white/10"
                >
                  <div className="flex-shrink-0">
                    {data.type === 'document' && <FileText className="w-4 h-4 text-blue-400" />}
                    {data.type === 'conversation' && <MessageSquare className="w-4 h-4 text-purple-400" />}
                    {data.type === 'preference' && <Settings2 className="w-4 h-4 text-amber-400" />}
                    {data.type === 'fact' && <Database className="w-4 h-4 text-green-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-foreground truncate">{data.title}</div>
                    <div className="text-xs text-muted-foreground">{data.content}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {data.isPrivate && <Lock className="w-3 h-3 text-muted-foreground" />}
                    {getStatusIcon(data.status)}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteTrainingData(data.id)}
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-red-400"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Memory Bank Tab */}
        {activeTab === 'memory' && (
          <div className="space-y-4">
            {/* Add New Memory */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newFact.key}
                onChange={(e) => setNewFact(prev => ({ ...prev, key: e.target.value }))}
                placeholder="What should I remember?"
                className="flex-1 px-3 py-2 bg-secondary/30 border border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
              <input
                type="text"
                value={newFact.value}
                onChange={(e) => setNewFact(prev => ({ ...prev, value: e.target.value }))}
                placeholder="Value"
                className="flex-1 px-3 py-2 bg-secondary/30 border border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
              <Button onClick={addMemory} className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Memory List */}
            <div className="space-y-2">
              {Object.entries(
                memories.reduce((acc, m) => {
                  if (!acc[m.category]) acc[m.category] = [];
                  acc[m.category].push(m);
                  return acc;
                }, {} as Record<string, MemoryItem[]>)
              ).map(([category, items]) => (
                <div key={category}>
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 capitalize">
                    {category}
                  </h4>
                  <div className="space-y-1">
                    {items.map(memory => (
                      <div
                        key={memory.id}
                        className="flex items-center gap-3 p-2 bg-secondary/20 rounded-lg group"
                      >
                        <span className={cn('px-2 py-0.5 rounded text-xs', getCategoryColor(memory.category))}>
                          {memory.key}
                        </span>
                        <span className="flex-1 text-sm text-foreground">{memory.value}</span>
                        <span className="text-xs text-muted-foreground">
                          {Math.round(memory.confidence * 100)}%
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteMemory(memory.id)}
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-400"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Preferences Tab */}
        {activeTab === 'preferences' && (
          <div className="space-y-4">
            <div className="grid gap-4">
              {[
                { label: 'Response Length', options: ['Concise', 'Balanced', 'Detailed'], current: 'Balanced' },
                { label: 'Tone', options: ['Professional', 'Friendly', 'Casual'], current: 'Professional' },
                { label: 'Proactivity', options: ['Ask first', 'Suggest', 'Act autonomously'], current: 'Suggest' },
                { label: 'Learning Mode', options: ['Passive', 'Active', 'Aggressive'], current: 'Active' },
              ].map(pref => (
                <div key={pref.label} className="p-3 bg-secondary/30 rounded-lg border border-white/10">
                  <label className="text-sm font-medium text-foreground block mb-2">{pref.label}</label>
                  <div className="flex gap-2">
                    {pref.options.map(opt => (
                      <button
                        key={opt}
                        className={cn(
                          'flex-1 px-3 py-1.5 rounded text-xs transition-colors',
                          opt === pref.current
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'
                        )}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Privacy Tab */}
        {activeTab === 'privacy' && (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-emerald-400" />
                <h4 className="font-medium text-foreground">Your Data is Protected</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                All training data is encrypted and stored securely. You have full control over what your AI learns.
              </p>
            </div>

            <div className="space-y-3">
              {[
                { label: 'Store conversation history', description: 'Allow AI to learn from past conversations', enabled: true },
                { label: 'Learn from corrections', description: 'Improve based on your feedback', enabled: true },
                { label: 'Share anonymized patterns', description: 'Help improve the AI for everyone', enabled: false },
                { label: 'Third-party integrations', description: 'Allow connected apps to contribute data', enabled: false },
              ].map(setting => (
                <div key={setting.label} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-foreground">{setting.label}</div>
                    <div className="text-xs text-muted-foreground">{setting.description}</div>
                  </div>
                  <button
                    className={cn(
                      'w-10 h-6 rounded-full transition-colors relative',
                      setting.enabled ? 'bg-emerald-500' : 'bg-secondary'
                    )}
                  >
                    <div
                      className={cn(
                        'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                        setting.enabled ? 'translate-x-5' : 'translate-x-1'
                      )}
                    />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-4 border-t border-white/10">
              <Button variant="outline" className="flex-1 text-xs">
                <Download className="w-3 h-3 mr-1" />
                Export My Data
              </Button>
              <Button variant="outline" className="flex-1 text-xs text-red-400 hover:text-red-300">
                <Trash2 className="w-3 h-3 mr-1" />
                Delete All Data
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
