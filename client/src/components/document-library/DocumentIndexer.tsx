import { useState } from 'react';
import { 
  Search, FileText, Database, Zap, RefreshCw,
  CheckCircle2, Clock, AlertTriangle, Filter,
  BarChart3, File, Image, FileSpreadsheet, Presentation
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

interface IndexedDocument {
  id: string;
  name: string;
  type: 'document' | 'spreadsheet' | 'presentation' | 'image' | 'ai_output' | 'contract';
  project?: string;
  indexedAt: string;
  chunks: number;
  relevanceScore?: number;
  preview?: string;
}

interface IndexStats {
  totalDocuments: number;
  totalChunks: number;
  lastIndexed: string;
  indexSize: string;
  avgQueryTime: string;
}

interface SearchResult {
  document: IndexedDocument;
  matchedChunk: string;
  score: number;
}

// Mock data
const MOCK_DOCUMENTS: IndexedDocument[] = [
  {
    id: 'd1',
    name: 'Investment_Memo_Celadon.pdf',
    type: 'document',
    project: 'Project A',
    indexedAt: '2 hours ago',
    chunks: 45,
    preview: 'Project A represents a compelling investment opportunity in the sustainable energy sector...'
  },
  {
    id: 'd2',
    name: 'Financial_Model_Q4.xlsx',
    type: 'spreadsheet',
    project: 'Project A',
    indexedAt: '1 day ago',
    chunks: 28,
    preview: 'Revenue projections, EBITDA margins, DCF valuation model...'
  },
  {
    id: 'd3',
    name: 'NDA_Sample_Signed.pdf',
    type: 'contract',
    project: 'Project B',
    indexedAt: '3 days ago',
    chunks: 12,
    preview: 'Non-disclosure agreement between parties regarding confidential information...'
  },
  {
    id: 'd4',
    name: 'Market_Analysis_Report.docx',
    type: 'ai_output',
    project: 'Perfect DXB',
    indexedAt: '5 hours ago',
    chunks: 67,
    preview: 'AI-generated market analysis covering competitive landscape, market size, and growth projections...'
  },
  {
    id: 'd5',
    name: 'Board_Presentation.pptx',
    type: 'presentation',
    project: 'Project C',
    indexedAt: '1 week ago',
    chunks: 34,
    preview: 'Q3 board presentation covering strategic initiatives, financial performance, and roadmap...'
  }
];

const MOCK_STATS: IndexStats = {
  totalDocuments: 156,
  totalChunks: 4823,
  lastIndexed: '2 hours ago',
  indexSize: '128 MB',
  avgQueryTime: '45ms'
};

export function DocumentIndexer() {
  const [documents] = useState<IndexedDocument[]>(MOCK_DOCUMENTS);
  const [stats] = useState<IndexStats>(MOCK_STATS);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isIndexing, setIsIndexing] = useState(false);
  const [indexProgress, setIndexProgress] = useState(0);
  const [filterType, setFilterType] = useState<string>('all');

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'document': return FileText;
      case 'spreadsheet': return FileSpreadsheet;
      case 'presentation': return Presentation;
      case 'image': return Image;
      case 'ai_output': return Zap;
      case 'contract': return File;
      default: return FileText;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'document': return 'bg-blue-500/20 text-blue-400';
      case 'spreadsheet': return 'bg-green-500/20 text-green-400';
      case 'presentation': return 'bg-orange-500/20 text-orange-400';
      case 'image': return 'bg-purple-500/20 text-purple-400';
      case 'ai_output': return 'bg-cyan-500/20 text-cyan-400';
      case 'contract': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-foreground/70';
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    // Simulate semantic search
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const results: SearchResult[] = documents
      .filter(d => 
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.preview?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .map(d => ({
        document: d,
        matchedChunk: d.preview || '',
        score: Math.random() * 0.5 + 0.5 // Mock relevance score
      }))
      .sort((a, b) => b.score - a.score);
    
    setSearchResults(results);
    setIsSearching(false);
    toast.success(`Found ${results.length} relevant documents`);
  };

  const handleReindex = async () => {
    setIsIndexing(true);
    setIndexProgress(0);
    
    // Simulate indexing progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setIndexProgress(i);
    }
    
    setIsIndexing(false);
    toast.success('Document index updated successfully');
  };

  const filteredDocuments = filterType === 'all' 
    ? documents 
    : documents.filter(d => d.type === filterType);

  return (
    <div className="space-y-4">
      {/* Stats Overview */}
      <Card className="bg-card/60 border-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Database className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Document Index</h2>
                <p className="text-sm text-muted-foreground">Semantic search across all your documents</p>
              </div>
            </div>
            <Button onClick={handleReindex} disabled={isIndexing}>
              {isIndexing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Indexing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reindex
                </>
              )}
            </Button>
          </div>
          
          {isIndexing && (
            <div className="mb-4">
              <Progress value={indexProgress} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">Processing documents... {indexProgress}%</p>
            </div>
          )}
          
          <div className="grid grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-xl font-bold text-foreground">{stats.totalDocuments}</div>
              <div className="text-xs text-muted-foreground">Documents</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-foreground">{stats.totalChunks.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Chunks</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-foreground">{stats.indexSize}</div>
              <div className="text-xs text-muted-foreground">Index Size</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-foreground">{stats.avgQueryTime}</div>
              <div className="text-xs text-muted-foreground">Avg Query</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-green-400">{stats.lastIndexed}</div>
              <div className="text-xs text-muted-foreground">Last Updated</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Semantic Search */}
      <Card className="bg-card/60 border-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-foreground text-base">
            <Search className="w-4 h-4 text-primary" />
            Semantic Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search across all documents using natural language..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-9"
              />
            </div>
            <Button onClick={handleSearch} disabled={isSearching}>
              {isSearching ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                'Search'
              )}
            </Button>
          </div>
          
          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-foreground">Results ({searchResults.length})</h4>
              {searchResults.map((result) => {
                const TypeIcon = getTypeIcon(result.document.type);
                return (
                  <div key={result.document.id} className="p-3 bg-background/50 rounded-lg border border-border">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded flex items-center justify-center ${getTypeColor(result.document.type)}`}>
                          <TypeIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-medium text-foreground">{result.document.name}</span>
                          {result.document.project && (
                            <span className="text-xs text-muted-foreground ml-2">• {result.document.project}</span>
                          )}
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-green-500/20 text-green-400">
                        {Math.round(result.score * 100)}% match
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{result.matchedChunk}</p>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Document Type Filter */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'document', 'spreadsheet', 'presentation', 'ai_output', 'contract'].map((type) => (
          <Button
            key={type}
            variant={filterType === type ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType(type)}
          >
            {type === 'all' ? 'All' : type.replace('_', ' ')}
          </Button>
        ))}
      </div>

      {/* Indexed Documents */}
      <Card className="bg-card/60 border-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-foreground text-base">
            <FileText className="w-4 h-4 text-primary" />
            Indexed Documents ({filteredDocuments.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {filteredDocuments.map((doc) => {
            const TypeIcon = getTypeIcon(doc.type);
            return (
              <div key={doc.id} className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getTypeColor(doc.type)}`}>
                    <TypeIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-medium text-foreground">{doc.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {doc.project && <span>{doc.project} • </span>}
                      {doc.chunks} chunks • Indexed {doc.indexedAt}
                    </div>
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs">
                  <CheckCircle2 className="w-3 h-3 mr-1 text-green-400" />
                  Indexed
                </Badge>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

export default DocumentIndexer;
