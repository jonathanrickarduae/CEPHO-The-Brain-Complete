import { useState, useRef } from 'react';
import { 
  Upload, FileText, MessageSquare, Brain, 
  Check, X, Loader2, Download, Trash2,
  ChevronRight, Info, Shield, Database
} from 'lucide-react';

interface TrainingDocument {
  id: string;
  name: string;
  type: 'document' | 'conversation' | 'preference';
  size: string;
  uploadedAt: Date;
  status: 'processing' | 'ready' | 'error';
  tokensExtracted?: number;
}

interface TrainingStats {
  totalDocuments: number;
  totalConversations: number;
  totalTokens: number;
  lastTrainingDate?: Date;
  modelVersion: string;
}

export function TrainingDataPipeline() {
  const [documents, setDocuments] = useState<TrainingDocument[]>([
    {
      id: '1',
      name: 'Work preferences.txt',
      type: 'preference',
      size: '2.4 KB',
      uploadedAt: new Date(Date.now() - 86400000),
      status: 'ready',
      tokensExtracted: 1250,
    },
    {
      id: '2',
      name: 'Meeting notes collection',
      type: 'document',
      size: '156 KB',
      uploadedAt: new Date(Date.now() - 172800000),
      status: 'ready',
      tokensExtracted: 45000,
    },
  ]);

  const [stats] = useState<TrainingStats>({
    totalDocuments: 12,
    totalConversations: 847,
    totalTokens: 125000,
    lastTrainingDate: new Date(Date.now() - 3600000),
    modelVersion: 'v2.3.1',
  });

  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'history' | 'export'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);

    for (const file of Array.from(files)) {
      const newDoc: TrainingDocument = {
        id: Math.random().toString(36).substring(7),
        name: file.name,
        type: 'document',
        size: formatFileSize(file.size),
        uploadedAt: new Date(),
        status: 'processing',
      };

      setDocuments(prev => [newDoc, ...prev]);

      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      setDocuments(prev => prev.map(doc => 
        doc.id === newDoc.id 
          ? { ...doc, status: 'ready', tokensExtracted: Math.floor(Math.random() * 10000) + 1000 }
          : doc
      ));
    }

    setUploading(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const deleteDocument = (id: string) => {
    setDocuments(documents.filter(d => d.id !== id));
  };

  const exportTrainingData = () => {
    // In production, this would generate and download a file
    const data = {
      exportDate: new Date().toISOString(),
      stats,
      documents: documents.map(d => ({
        name: d.name,
        type: d.type,
        tokens: d.tokensExtracted,
      })),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `brain-training-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'document': return FileText;
      case 'conversation': return MessageSquare;
      case 'preference': return Brain;
      default: return FileText;
    }
  };

  return (
    <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-cyan-400" />
            Training Data Pipeline
          </h3>
          <div className="flex items-center gap-2 text-sm text-foreground/70">
            <Shield className="w-4 h-4" />
            <span>Your data stays private</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-gray-900 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-white">{stats.totalDocuments}</div>
            <div className="text-xs text-foreground/60">Documents</div>
          </div>
          <div className="bg-gray-900 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-white">{stats.totalConversations}</div>
            <div className="text-xs text-foreground/60">Conversations</div>
          </div>
          <div className="bg-gray-900 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-white">{(stats.totalTokens / 1000).toFixed(0)}K</div>
            <div className="text-xs text-foreground/60">Tokens</div>
          </div>
          <div className="bg-gray-900 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-cyan-400">{stats.modelVersion}</div>
            <div className="text-xs text-foreground/60">Model</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-700">
        {[
          { id: 'upload', label: 'Upload' },
          { id: 'history', label: 'History' },
          { id: 'export', label: 'Export' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-foreground/70 hover:text-foreground/80'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'upload' && (
          <div>
            {/* Upload Area */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-700 hover:border-cyan-500/50 rounded-xl p-8 text-center cursor-pointer transition-colors"
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".txt,.md,.pdf,.doc,.docx,.json"
                onChange={(e) => handleFileUpload(e.target.files)}
                className="hidden"
              />
              
              {uploading ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
                  <p className="text-foreground/70">Processing files...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-cyan-500/10 flex items-center justify-center">
                    <Upload className="w-8 h-8 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Drop files here or click to upload</p>
                    <p className="text-sm text-foreground/60 mt-1">
                      Supports .txt, .md, .pdf, .doc, .docx, .json
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-3 gap-3 mt-6">
              <button className="flex items-center gap-2 p-3 bg-gray-900 hover:bg-gray-850 rounded-xl text-sm text-foreground/80 transition-colors">
                <MessageSquare className="w-4 h-4 text-purple-400" />
                <span>Import Conversations</span>
              </button>
              <button className="flex items-center gap-2 p-3 bg-gray-900 hover:bg-gray-850 rounded-xl text-sm text-foreground/80 transition-colors">
                <FileText className="w-4 h-4 text-blue-400" />
                <span>Connect Notes App</span>
              </button>
              <button className="flex items-center gap-2 p-3 bg-gray-900 hover:bg-gray-850 rounded-xl text-sm text-foreground/80 transition-colors">
                <Brain className="w-4 h-4 text-pink-400" />
                <span>Add Preferences</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-3">
            {documents.length === 0 ? (
              <div className="text-center py-8 text-foreground/60">
                No training data uploaded yet
              </div>
            ) : (
              documents.map(doc => {
                const TypeIcon = getTypeIcon(doc.type);
                return (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-4 bg-gray-900 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        doc.type === 'document' ? 'bg-blue-500/20' :
                        doc.type === 'conversation' ? 'bg-purple-500/20' :
                        'bg-pink-500/20'
                      }`}>
                        <TypeIcon className={`w-5 h-5 ${
                          doc.type === 'document' ? 'text-blue-400' :
                          doc.type === 'conversation' ? 'text-purple-400' :
                          'text-pink-400'
                        }`} />
                      </div>
                      <div>
                        <div className="font-medium text-white">{doc.name}</div>
                        <div className="text-xs text-foreground/60">
                          {doc.size} • {doc.tokensExtracted?.toLocaleString()} tokens
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {doc.status === 'processing' ? (
                        <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
                      ) : doc.status === 'ready' ? (
                        <Check className="w-5 h-5 text-green-400" />
                      ) : (
                        <X className="w-5 h-5 text-red-400" />
                      )}
                      <button
                        onClick={() => deleteDocument(doc.id)}
                        className="p-2 rounded-lg hover:bg-gray-800 text-foreground/70 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === 'export' && (
          <div className="space-y-4">
            <div className="bg-gray-900 rounded-xl p-4">
              <h4 className="font-medium text-white mb-2">Export Your Training Data</h4>
              <p className="text-sm text-foreground/70 mb-4">
                Download all your training data including documents, conversations, and preferences.
                This data can be used to migrate to another service or for backup purposes.
              </p>
              <button
                onClick={exportTrainingData}
                className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                Export as JSON
              </button>
            </div>

            <div className="bg-gray-900 rounded-xl p-4">
              <h4 className="font-medium text-white mb-2">Delete All Training Data</h4>
              <p className="text-sm text-foreground/70 mb-4">
                Permanently delete all your training data. This action cannot be undone.
                Your Chief of Staff will need to be retrained from scratch.
              </p>
              <button className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors">
                <Trash2 className="w-4 h-4" />
                Delete All Data
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-900/50 border-t border-gray-700">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-foreground/60">
            <Info className="w-4 h-4" />
            <span>Last trained: {stats.lastTrainingDate?.toLocaleString()}</span>
          </div>
          <button className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300">
            <span>Training Settings</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
