import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  useIdealsDataroom, 
  type IdealsProject, 
  type IdealsFolder,
  type IdealsDocument,
  type FolderMapping 
} from '@/lib/idealsDataroom';
import {
  Database,
  FolderOpen,
  FileText,
  Upload,
  Link2,
  Unlink,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
  Plus,
  ExternalLink,
  Shield,
  Key,
  FolderPlus,
  ArrowRight,
  Settings
} from 'lucide-react';

export function IdealsDataroomIntegration() {
  const {
    isConnected,
    isLoading,
    error,
    projects,
    selectedProject,
    folders,
    documents,
    uploadProgress,
    connect,
    disconnect,
    selectProject,
    loadFolders,
    loadDocuments,
    uploadDocument,
    createFolder,
    mappings,
    addMapping,
    removeMapping,
  } = useIdealsDataroom();

  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedBrainFolder, setSelectedBrainFolder] = useState<string>('');
  const [selectedIdealsFolder, setSelectedIdealsFolder] = useState<string>('');

  const handleConnect = async () => {
    if (!apiKeyInput.trim()) return;
    try {
      await connect(apiKeyInput);
      setApiKeyInput('');
    } catch (e) {
      // Error is handled by the hook
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedIdealsFolder) return;

    try {
      await uploadDocument(selectedIdealsFolder, file);
      await loadDocuments(selectedIdealsFolder);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    try {
      await createFolder(newFolderName);
      setNewFolderName('');
    } catch (error) {
      console.error('Failed to create folder:', error);
    }
  };

  // Mock Brain folders for demo
  const brainFolders = [
    { id: 'contracts', name: 'Contracts' },
    { id: 'financials', name: 'Financial Models' },
    { id: 'legal', name: 'Legal Documents' },
    { id: 'presentations', name: 'Investor Presentations' },
    { id: 'due-diligence', name: 'Due Diligence' },
  ];

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            iDeals Virtual Data Room
          </CardTitle>
          <CardDescription>
            Connect to your investor dataroom for seamless document management
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isConnected ? (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-amber-500" />
                  <span className="font-medium">Secure Connection</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Your API key is stored locally and used only to authenticate with iDeals.
                  Get your API key from{' '}
                  <a 
                    href="https://www.idealsvdr.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    iDeals VDR Settings
                  </a>
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="apiKey"
                      type={showApiKey ? 'text' : 'password'}
                      value={apiKeyInput}
                      onChange={(e) => setApiKeyInput(e.target.value)}
                      placeholder="Enter your iDeals API key"
                      className="pl-10"
                    />
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? 'Hide' : 'Show'}
                  </Button>
                </div>
              </div>

              <Button 
                onClick={handleConnect} 
                disabled={!apiKeyInput.trim() || isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Link2 className="h-4 w-4 mr-2" />
                    Connect to iDeals
                  </>
                )}
              </Button>

              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-sm">
                  {error}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                <div className="flex items-center gap-2 text-green-500">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Connected to iDeals</span>
                </div>
                <Button variant="outline" size="sm" onClick={disconnect}>
                  <Unlink className="h-4 w-4 mr-2" />
                  Disconnect
                </Button>
              </div>

              {/* Project Selection */}
              <div className="space-y-2">
                <Label>Select Project</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {projects.map((project) => (
                    <button
                      key={project.id}
                      onClick={() => selectProject(project.id)}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        selectedProject?.id === project.id
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{project.name}</span>
                        <Badge variant={project.status === 'Active' ? 'default' : 'secondary'}>
                          {project.status}
                        </Badge>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Project Content */}
      {isConnected && selectedProject && (
        <Tabs defaultValue="folders" className="space-y-4">
          <TabsList>
            <TabsTrigger value="folders">
              <FolderOpen className="h-4 w-4 mr-2" />
              Folders
            </TabsTrigger>
            <TabsTrigger value="documents">
              <FileText className="h-4 w-4 mr-2" />
              Documents
            </TabsTrigger>
            <TabsTrigger value="mappings">
              <Link2 className="h-4 w-4 mr-2" />
              Folder Mappings
            </TabsTrigger>
            <TabsTrigger value="upload">
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </TabsTrigger>
          </TabsList>

          <TabsContent value="folders">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Dataroom Folders</span>
                  <div className="flex gap-2">
                    <Input
                      placeholder="New folder name"
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      className="w-48"
                    />
                    <Button size="sm" onClick={handleCreateFolder}>
                      <FolderPlus className="h-4 w-4 mr-2" />
                      Create
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : folders.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No folders found. Create one to get started.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {folders.map((folder) => (
                      <div
                        key={folder.id}
                        onClick={() => {
                          setSelectedIdealsFolder(folder.id);
                          loadDocuments(folder.id);
                        }}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          selectedIdealsFolder === folder.id
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <FolderOpen className="h-5 w-5 text-amber-500" />
                          <div>
                            <div className="font-medium">{folder.name}</div>
                            <div className="text-xs text-muted-foreground">
                              Index: {folder.index}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Documents</span>
                  <Button variant="outline" size="sm" onClick={() => loadDocuments(selectedIdealsFolder)}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : documents.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No documents in this folder.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {documents.filter(d => d.dataType === 'File').map((doc) => (
                      <div
                        key={doc.id}
                        className="p-3 rounded-lg border border-border hover:border-primary/50 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-blue-500" />
                            <div>
                              <div className="font-medium">{doc.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {doc.fileExtensionType} • {(doc.size / 1024).toFixed(1)} KB
                              </div>
                            </div>
                          </div>
                          <Badge variant={doc.publicationStatus === 'Published' ? 'default' : 'secondary'}>
                            {doc.publicationStatus}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mappings">
            <Card>
              <CardHeader>
                <CardTitle>Folder Mappings</CardTitle>
                <CardDescription>
                  Link Brain Library folders to iDeals dataroom folders for automatic sync
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Create New Mapping */}
                <div className="p-4 rounded-lg border border-dashed border-border">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div className="space-y-2">
                      <Label>Brain Folder</Label>
                      <select
                        value={selectedBrainFolder}
                        onChange={(e) => setSelectedBrainFolder(e.target.value)}
                        className="w-full px-3 py-2 rounded-md border border-input bg-background"
                      >
                        <option value="">Select folder...</option>
                        {brainFolders.map((f) => (
                          <option key={f.id} value={f.id}>{f.name}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="flex items-center justify-center">
                      <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>iDeals Folder</Label>
                      <select
                        value={selectedIdealsFolder}
                        onChange={(e) => setSelectedIdealsFolder(e.target.value)}
                        className="w-full px-3 py-2 rounded-md border border-input bg-background"
                      >
                        <option value="">Select folder...</option>
                        {folders.map((f) => (
                          <option key={f.id} value={f.id}>{f.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <Button
                    className="mt-4 w-full"
                    disabled={!selectedBrainFolder || !selectedIdealsFolder}
                    onClick={() => {
                      const brainFolder = brainFolders.find(f => f.id === selectedBrainFolder);
                      const idealsFolder = folders.find(f => f.id === selectedIdealsFolder);
                      if (brainFolder && idealsFolder) {
                        addMapping({
                          brainFolderId: brainFolder.id,
                          brainFolderName: brainFolder.name,
                          idealsFolderId: idealsFolder.id,
                          idealsFolderName: idealsFolder.name,
                          autoSync: false,
                        });
                        setSelectedBrainFolder('');
                        setSelectedIdealsFolder('');
                      }
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Mapping
                  </Button>
                </div>

                {/* Existing Mappings */}
                {mappings.length > 0 ? (
                  <div className="space-y-2">
                    {mappings.map((mapping) => (
                      <div
                        key={mapping.brainFolderId}
                        className="p-3 rounded-lg border border-border flex items-center justify-between"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <FolderOpen className="h-4 w-4 text-cyan-500" />
                            <span>{mapping.brainFolderName}</span>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          <div className="flex items-center gap-2">
                            <FolderOpen className="h-4 w-4 text-amber-500" />
                            <span>{mapping.idealsFolderName}</span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMapping(mapping.brainFolderId)}
                        >
                          <XCircle className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No folder mappings configured yet.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="upload">
            <Card>
              <CardHeader>
                <CardTitle>Upload Documents</CardTitle>
                <CardDescription>
                  Upload documents directly to your iDeals dataroom
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!selectedIdealsFolder ? (
                  <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-600">
                    Please select a folder from the Folders tab first.
                  </div>
                ) : (
                  <>
                    <div className="p-4 rounded-lg border border-dashed border-border text-center">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mb-3">
                        Select a file to upload to the dataroom
                      </p>
                      <Input
                        type="file"
                        onChange={handleFileUpload}
                        className="max-w-xs mx-auto"
                      />
                    </div>

                    {uploadProgress && (
                      <div className="p-4 rounded-lg border border-border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{uploadProgress.fileName}</span>
                          <Badge variant={
                            uploadProgress.status === 'completed' ? 'default' :
                            uploadProgress.status === 'failed' ? 'destructive' :
                            'secondary'
                          }>
                            {uploadProgress.status}
                          </Badge>
                        </div>
                        <Progress 
                          value={(uploadProgress.uploadedSize / uploadProgress.totalSize) * 100} 
                        />
                        <div className="text-xs text-muted-foreground mt-1">
                          {(uploadProgress.uploadedSize / 1024 / 1024).toFixed(2)} MB / 
                          {(uploadProgress.totalSize / 1024 / 1024).toFixed(2)} MB
                          {uploadProgress.chunksTotal > 1 && (
                            <span> • Chunk {uploadProgress.chunksUploaded}/{uploadProgress.chunksTotal}</span>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Quick Actions */}
      {isConnected && selectedProject && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button variant="outline" className="h-auto py-3 flex-col">
                <Upload className="h-5 w-5 mb-1" />
                <span className="text-xs">Sync All</span>
              </Button>
              <Button variant="outline" className="h-auto py-3 flex-col">
                <RefreshCw className="h-5 w-5 mb-1" />
                <span className="text-xs">Refresh</span>
              </Button>
              <Button variant="outline" className="h-auto py-3 flex-col" asChild>
                <a href="https://www.idealsvdr.com" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-5 w-5 mb-1" />
                  <span className="text-xs">Open iDeals</span>
                </a>
              </Button>
              <Button variant="outline" className="h-auto py-3 flex-col">
                <FileText className="h-5 w-5 mb-1" />
                <span className="text-xs">Activity Log</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default IdealsDataroomIntegration;
