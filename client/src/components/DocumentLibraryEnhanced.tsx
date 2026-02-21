import { useState } from 'react';
import { 
  FileText, Download, Eye, Search, Filter, Plus, 
  Trash2, Edit, Share2, Clock, CheckCircle2, 
  AlertCircle, XCircle, MoreHorizontal, Calendar,
  Tag, User, FileDown, Mail, History
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Document {
  id: string;
  title: string;
  type: 'innovation_brief' | 'project_genesis' | 'report' | 'analysis' | 'other';
  status: 'draft' | 'pending_review' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  fileSize?: number;
  tags?: string[];
  description?: string;
  downloadUrl?: string;
  previewUrl?: string;
}

// Mock data - replace with actual API calls
const MOCK_DOCUMENTS: Document[] = [
  {
    id: 'doc-001',
    title: 'Q1 2026 Innovation Brief - AI Integration',
    type: 'innovation_brief',
    status: 'approved',
    createdAt: '2026-02-15T10:30:00Z',
    updatedAt: '2026-02-16T14:20:00Z',
    createdBy: 'CEPHO Innovation Engine',
    fileSize: 2456789,
    tags: ['AI', 'Innovation', 'Q1 2026'],
    description: 'Comprehensive analysis of AI integration opportunities for Q1 2026',
  },
  {
    id: 'doc-002',
    title: 'Project Genesis - Customer Portal Redesign',
    type: 'project_genesis',
    status: 'approved',
    createdAt: '2026-02-18T09:15:00Z',
    updatedAt: '2026-02-19T11:45:00Z',
    createdBy: 'Project Genesis System',
    fileSize: 3789456,
    tags: ['Project Genesis', 'UX', 'Portal'],
    description: 'Complete project initiation document for customer portal redesign',
  },
  {
    id: 'doc-003',
    title: 'Market Analysis Report - Emerging Technologies',
    type: 'report',
    status: 'pending_review',
    createdAt: '2026-02-20T13:00:00Z',
    updatedAt: '2026-02-20T16:30:00Z',
    createdBy: 'Chief of Staff',
    fileSize: 1234567,
    tags: ['Market Analysis', 'Technology', 'Research'],
    description: 'Deep dive into emerging technology trends and market opportunities',
  },
  {
    id: 'doc-004',
    title: 'Competitive Analysis - Industry Benchmarking',
    type: 'analysis',
    status: 'approved',
    createdAt: '2026-02-12T08:00:00Z',
    updatedAt: '2026-02-13T10:00:00Z',
    createdBy: 'AI-SME Team',
    fileSize: 4567890,
    tags: ['Competitive Analysis', 'Benchmarking'],
    description: 'Comprehensive competitive landscape analysis and benchmarking study',
  },
  {
    id: 'doc-005',
    title: 'Strategic Planning Document - 2026 Roadmap',
    type: 'report',
    status: 'draft',
    createdAt: '2026-02-21T07:30:00Z',
    updatedAt: '2026-02-21T07:30:00Z',
    createdBy: 'Victoria AI',
    fileSize: 987654,
    tags: ['Strategy', '2026', 'Roadmap'],
    description: 'Draft strategic planning document for 2026 business roadmap',
  },
];

export function DocumentLibraryEnhanced() {
  const [documents] = useState<Document[]>(MOCK_DOCUMENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);

  // Filter documents
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType = selectedType === 'all' || doc.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || doc.status === selectedStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  // Stats
  const stats = {
    total: documents.length,
    approved: documents.filter(d => d.status === 'approved').length,
    pending: documents.filter(d => d.status === 'pending_review').length,
    draft: documents.filter(d => d.status === 'draft').length,
  };

  const handleDownload = (doc: Document) => {
    toast.success(`Downloading ${doc.title}...`);
    // Implement actual download logic
  };

  const handlePreview = (doc: Document) => {
    setSelectedDocument(doc);
    setIsPreviewOpen(true);
  };

  const handleShare = (doc: Document) => {
    setSelectedDocument(doc);
    setIsShareDialogOpen(true);
  };

  const handleDelete = (doc: Document) => {
    toast.success(`Document "${doc.title}" deleted`);
    // Implement actual delete logic
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  const getStatusIcon = (status: Document['status']) => {
    switch (status) {
      case 'approved':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'pending_review':
        return <Clock className="w-4 h-4 text-amber-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: Document['status']) => {
    const variants: Record<Document['status'], 'default' | 'secondary' | 'destructive' | 'outline'> = {
      approved: 'default',
      pending_review: 'secondary',
      rejected: 'destructive',
      draft: 'outline',
    };
    
    return (
      <Badge variant={variants[status]} className="flex items-center gap-1">
        {getStatusIcon(status)}
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const getTypeIcon = (type: Document['type']) => {
    switch (type) {
      case 'innovation_brief':
        return '💡';
      case 'project_genesis':
        return '🚀';
      case 'report':
        return '📊';
      case 'analysis':
        return '🔍';
      default:
        return '📄';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Document Library</h2>
          <p className="text-muted-foreground mt-2">
            Manage and access all your generated documents
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Document
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approved}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
            <Edit className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.draft}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Tabs value={selectedType} onValueChange={setSelectedType} className="w-auto">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="innovation_brief">Innovation</TabsTrigger>
                <TabsTrigger value="project_genesis">Projects</TabsTrigger>
                <TabsTrigger value="report">Reports</TabsTrigger>
                <TabsTrigger value="analysis">Analysis</TabsTrigger>
              </TabsList>
            </Tabs>

            <Tabs value={selectedStatus} onValueChange={setSelectedStatus} className="w-auto">
              <TabsList>
                <TabsTrigger value="all">All Status</TabsTrigger>
                <TabsTrigger value="approved">Approved</TabsTrigger>
                <TabsTrigger value="pending_review">Pending</TabsTrigger>
                <TabsTrigger value="draft">Draft</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <ScrollArea className="h-[600px]">
        <div className="space-y-4">
          {filteredDocuments.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No documents found</p>
              </CardContent>
            </Card>
          ) : (
            filteredDocuments.map(doc => (
              <Card key={doc.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="text-3xl">{getTypeIcon(doc.type)}</div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{doc.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {doc.description}
                        </CardDescription>
                        <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {doc.createdBy}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {format(new Date(doc.createdAt), 'MMM dd, yyyy')}
                          </div>
                          <div className="flex items-center gap-1">
                            <FileDown className="w-4 h-4" />
                            {formatFileSize(doc.fileSize)}
                          </div>
                        </div>
                        {doc.tags && doc.tags.length > 0 && (
                          <div className="flex items-center gap-2 mt-3">
                            {doc.tags.map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                <Tag className="w-3 h-3 mr-1" />
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(doc.status)}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handlePreview(doc)}>
                            <Eye className="w-4 h-4 mr-2" />
                            Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDownload(doc)}>
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleShare(doc)}>
                            <Share2 className="w-4 h-4 mr-2" />
                            Share
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <History className="w-4 h-4 mr-2" />
                            View History
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDelete(doc)}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{selectedDocument?.title}</DialogTitle>
            <DialogDescription>
              Document preview
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">
              Document preview will be displayed here
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
              Close
            </Button>
            <Button onClick={() => selectedDocument && handleDownload(selectedDocument)}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Document</DialogTitle>
            <DialogDescription>
              Share "{selectedDocument?.title}" with others
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email addresses</label>
              <Input placeholder="Enter email addresses..." />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Message (optional)</label>
              <Input placeholder="Add a message..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsShareDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              toast.success('Document shared successfully');
              setIsShareDialogOpen(false);
            }}>
              <Mail className="w-4 h-4 mr-2" />
              Share
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
