import { useState, useMemo } from 'react';
import { 
  BookOpen, Plus, Search, Filter, FileText, Link2, 
  ExternalLink, CheckCircle, AlertTriangle, Clock,
  Upload, Trash2, Edit, Eye, Download, Shield,
  Fingerprint, Quote, Scale, Database, FileSpreadsheet,
  Users, ChevronDown, ChevronRight, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { 
  type Reference, 
  type VerificationStatus,
  VERIFICATION_STATUS_LABELS,
} from '@/lib/insightValidation';
import { 
  VerificationBadge, 
  ReferenceTable,
  ValidationSummary,
} from '@/components/InsightValidation';
import { useReferenceLibrary } from '@/hooks/useReferenceLibrary';
import { FeatureGate, RestrictedBadge } from '@/hooks/useGovernance';

// Reference type icons and labels
const REFERENCE_TYPES = {
  financial_model: { icon: FileSpreadsheet, label: 'Financial Model', color: 'text-green-500' },
  contract: { icon: Scale, label: 'Contract', color: 'text-blue-500' },
  quote: { icon: Quote, label: 'Quote', color: 'text-purple-500' },
  research_paper: { icon: FileText, label: 'Research Paper', color: 'text-cyan-500' },
  legal_document: { icon: Scale, label: 'Legal Document', color: 'text-orange-500' },
  data_source: { icon: Database, label: 'Data Source', color: 'text-yellow-500' },
  expert_statement: { icon: Users, label: 'Expert Statement', color: 'text-pink-500' },
  other: { icon: FileText, label: 'Other', color: 'text-foreground/60' },
};

export default function ReferenceLibrary() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedReference, setSelectedReference] = useState<Reference | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['all']));
  
  // Form state for adding new reference
  const [newReference, setNewReference] = useState({
    title: '',
    type: 'other' as Reference['type'],
    sourceUrl: '',
    author: '',
    organization: '',
    datePublished: '',
    excerpt: '',
    notes: '',
  });
  
  const {
    references,
    insights,
    stats,
    addReference,
    updateReferenceStatus,
    deleteReference,
  } = useReferenceLibrary({ projectId: 'current-project' });
  
  // Filter references
  const filteredReferences = useMemo(() => {
    return references.filter(ref => {
      const matchesSearch = searchQuery === '' || 
        ref.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ref.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ref.organization?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = filterType === 'all' || ref.type === filterType;
      const matchesStatus = filterStatus === 'all' || ref.verificationStatus === filterStatus;
      
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [references, searchQuery, filterType, filterStatus]);
  
  // Group references by type
  const groupedReferences = useMemo(() => {
    const groups: Record<string, Reference[]> = {};
    filteredReferences.forEach(ref => {
      if (!groups[ref.type]) {
        groups[ref.type] = [];
      }
      groups[ref.type].push(ref);
    });
    return groups;
  }, [filteredReferences]);
  
  const handleAddReference = () => {
    if (!newReference.title.trim()) {
      toast.error('Please enter a title');
      return;
    }
    
    addReference({
      title: newReference.title,
      type: newReference.type,
      sourceUrl: newReference.sourceUrl || undefined,
      author: newReference.author || undefined,
      organization: newReference.organization || undefined,
      datePublished: newReference.datePublished || undefined,
      excerpt: newReference.excerpt || undefined,
      notes: newReference.notes || undefined,
    });
    
    // Reset form
    setNewReference({
      title: '',
      type: 'other',
      sourceUrl: '',
      author: '',
      organization: '',
      datePublished: '',
      excerpt: '',
      notes: '',
    });
    setShowAddForm(false);
    toast.success('Reference added successfully');
  };
  
  const handleVerify = (referenceId: string) => {
    updateReferenceStatus(referenceId, 'verified', 'user');
    toast.success('Reference verified');
  };
  
  const handleDelete = (referenceId: string) => {
    deleteReference(referenceId);
    toast.success('Reference deleted');
  };
  
  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };
  
  return (
    <FeatureGate feature="aiExperts" showOverlay={true}>
      <div className="h-full bg-background text-foreground overflow-auto">
        {/* Header */}
        <div className="border-b border-border bg-card/80 backdrop-blur-xl sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30">
                  <BookOpen className="w-6 h-6 md:w-8 md:h-8 text-amber-400" />
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-display font-bold">Reference Library</h1>
                  <p className="text-muted-foreground text-sm">
                    {stats.totalReferences} references · {stats.verifiedReferences} verified
                  </p>
                </div>
              </div>
              
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Reference
              </Button>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar - Filters & Stats */}
            <div className="space-y-6">
              {/* Search */}
              <Card className="bg-card/60 border-border">
                <CardContent className="p-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search references..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </CardContent>
              </Card>
              
              {/* Filters */}
              <Card className="bg-card/60 border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Filters
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Type</label>
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger>
                        <SelectValue placeholder="All types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        {Object.entries(REFERENCE_TYPES).map(([key, { label }]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Status</label>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder="All statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="verified">Verified</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="challenged">Challenged</SelectItem>
                        <SelectItem value="unverified">Unverified</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
              
              {/* Stats */}
              <Card className="bg-card/60 border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Validation Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total References</span>
                    <span className="font-medium">{stats.totalReferences}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Verified</span>
                    <span className="font-medium text-green-500">{stats.verifiedReferences}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Pending</span>
                    <span className="font-medium text-yellow-500">
                      {stats.totalReferences - stats.verifiedReferences}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Citations</span>
                    <span className="font-medium">{stats.totalCitations}</span>
                  </div>
                </CardContent>
              </Card>
              
              {/* Quick Actions */}
              <Card className="bg-card/60 border-border">
                <CardContent className="p-4 space-y-2">
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <Upload className="w-4 h-4 mr-2" />
                    Import from Library
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export Citations
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <Fingerprint className="w-4 h-4 mr-2" />
                    Twin Verification
                  </Button>
                </CardContent>
              </Card>
            </div>
            
            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
              {/* Reference List by Category */}
              {Object.entries(groupedReferences).length === 0 ? (
                <Card className="bg-card/60 border-border">
                  <CardContent className="py-12 text-center">
                    <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-30" />
                    <h3 className="font-medium text-foreground mb-2">No references found</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {searchQuery || filterType !== 'all' || filterStatus !== 'all'
                        ? 'Try adjusting your filters'
                        : 'Add your first reference to start building your library'}
                    </p>
                    <Button onClick={() => setShowAddForm(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Reference
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                Object.entries(groupedReferences).map(([type, refs]) => {
                  const typeConfig = REFERENCE_TYPES[type as keyof typeof REFERENCE_TYPES];
                  const TypeIcon = typeConfig?.icon || FileText;
                  const isExpanded = expandedCategories.has(type) || expandedCategories.has('all');
                  
                  return (
                    <Card key={type} className="bg-card/60 border-border">
                      <CardHeader 
                        className="cursor-pointer hover:bg-secondary/30 transition-colors"
                        onClick={() => toggleCategory(type)}
                      >
                        <CardTitle className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <TypeIcon className={`w-5 h-5 ${typeConfig?.color || 'text-foreground/60'}`} />
                            <span>{typeConfig?.label || type}</span>
                            <Badge variant="outline">{refs.length}</Badge>
                          </div>
                          {isExpanded ? (
                            <ChevronDown className="w-5 h-5 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-muted-foreground" />
                          )}
                        </CardTitle>
                      </CardHeader>
                      
                      {isExpanded && (
                        <CardContent className="pt-0">
                          <div className="space-y-3">
                            {refs.map(ref => (
                              <div 
                                key={ref.id}
                                className="p-4 rounded-xl bg-secondary/30 border border-border hover:border-primary/30 transition-all"
                              >
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h4 className="font-medium text-foreground truncate">
                                        {ref.title}
                                      </h4>
                                      <VerificationBadge status={ref.verificationStatus} showLabel={false} />
                                    </div>
                                    
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                                      {ref.author && <span>{ref.author}</span>}
                                      {ref.organization && <span>• {ref.organization}</span>}
                                      {ref.datePublished && (
                                        <span>• {new Date(ref.datePublished).getFullYear()}</span>
                                      )}
                                    </div>
                                    
                                    {ref.excerpt && (
                                      <p className="text-sm text-muted-foreground line-clamp-2">
                                        "{ref.excerpt}"
                                      </p>
                                    )}
                                  </div>
                                  
                                  <div className="flex items-center gap-1">
                                    {ref.sourceUrl && (
                                      <Button 
                                        variant="ghost" 
                                        size="sm"
                                        onClick={() => window.open(ref.sourceUrl, '_blank')}
                                      >
                                        <ExternalLink className="w-4 h-4" />
                                      </Button>
                                    )}
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => setSelectedReference(ref)}
                                    >
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                    {ref.verificationStatus !== 'verified' && (
                                      <Button 
                                        variant="ghost" 
                                        size="sm"
                                        onClick={() => handleVerify(ref.id)}
                                      >
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                      </Button>
                                    )}
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => handleDelete(ref.id)}
                                    >
                                      <Trash2 className="w-4 h-4 text-red-500" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        </div>
        
        {/* Add Reference Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-lg bg-card border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Add Reference</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowAddForm(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Title *</label>
                  <Input
                    value={newReference.title}
                    onChange={(e) => setNewReference(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Reference title"
                  />
                </div>
                
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Type</label>
                  <Select 
                    value={newReference.type} 
                    onValueChange={(value) => setNewReference(prev => ({ 
                      ...prev, 
                      type: value as Reference['type'] 
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(REFERENCE_TYPES).map(([key, { label }]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Author</label>
                    <Input
                      value={newReference.author}
                      onChange={(e) => setNewReference(prev => ({ ...prev, author: e.target.value }))}
                      placeholder="Author name"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Organization</label>
                    <Input
                      value={newReference.organization}
                      onChange={(e) => setNewReference(prev => ({ ...prev, organization: e.target.value }))}
                      placeholder="Organization"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Source URL</label>
                  <Input
                    value={newReference.sourceUrl}
                    onChange={(e) => setNewReference(prev => ({ ...prev, sourceUrl: e.target.value }))}
                    placeholder="https://..."
                  />
                </div>
                
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Date Published</label>
                  <Input
                    type="date"
                    value={newReference.datePublished}
                    onChange={(e) => setNewReference(prev => ({ ...prev, datePublished: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Key Excerpt</label>
                  <Textarea
                    value={newReference.excerpt}
                    onChange={(e) => setNewReference(prev => ({ ...prev, excerpt: e.target.value }))}
                    placeholder="Relevant quote or excerpt..."
                    rows={2}
                  />
                </div>
                
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Notes</label>
                  <Textarea
                    value={newReference.notes}
                    onChange={(e) => setNewReference(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional notes..."
                    rows={2}
                  />
                </div>
                
                <div className="flex gap-3 pt-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setShowAddForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    className="flex-1"
                    onClick={handleAddReference}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Reference
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        {/* Reference Detail Modal */}
        {selectedReference && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-lg bg-card border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {(() => {
                      const TypeIcon = REFERENCE_TYPES[selectedReference.type]?.icon || FileText;
                      return <TypeIcon className={`w-5 h-5 ${REFERENCE_TYPES[selectedReference.type]?.color}`} />;
                    })()}
                    <CardTitle className="text-lg">{selectedReference.title}</CardTitle>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setSelectedReference(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <VerificationBadge status={selectedReference.verificationStatus} />
                  <Badge variant="outline">
                    {REFERENCE_TYPES[selectedReference.type]?.label}
                  </Badge>
                </div>
                
                {selectedReference.author && (
                  <div>
                    <label className="text-xs text-muted-foreground">Author</label>
                    <p className="text-foreground">{selectedReference.author}</p>
                  </div>
                )}
                
                {selectedReference.organization && (
                  <div>
                    <label className="text-xs text-muted-foreground">Organization</label>
                    <p className="text-foreground">{selectedReference.organization}</p>
                  </div>
                )}
                
                {selectedReference.excerpt && (
                  <div>
                    <label className="text-xs text-muted-foreground">Key Excerpt</label>
                    <p className="text-foreground italic">"{selectedReference.excerpt}"</p>
                  </div>
                )}
                
                {selectedReference.notes && (
                  <div>
                    <label className="text-xs text-muted-foreground">Notes</label>
                    <p className="text-muted-foreground">{selectedReference.notes}</p>
                  </div>
                )}
                
                <div className="text-xs text-muted-foreground">
                  Added: {new Date(selectedReference.dateAccessed).toLocaleDateString('en-GB')}
                  {selectedReference.verifiedAt && (
                    <> · Verified: {new Date(selectedReference.verifiedAt).toLocaleDateString('en-GB')}</>
                  )}
                </div>
                
                <div className="flex gap-2 pt-2">
                  {selectedReference.sourceUrl && (
                    <Button 
                      variant="outline"
                      onClick={() => window.open(selectedReference.sourceUrl, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open Source
                    </Button>
                  )}
                  {selectedReference.verificationStatus !== 'verified' && (
                    <Button onClick={() => {
                      handleVerify(selectedReference.id);
                      setSelectedReference(null);
                    }}>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Mark Verified
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </FeatureGate>
  );
}
