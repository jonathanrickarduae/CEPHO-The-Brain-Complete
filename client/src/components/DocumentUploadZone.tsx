import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, FileText, File, FileSpreadsheet, Presentation,
  Check, X, Loader2, Brain, Sparkles, AlertCircle
} from 'lucide-react';

interface UploadedDocument {
  id: string;
  name: string;
  type: 'pdf' | 'doc' | 'ppt' | 'xls' | 'other';
  size: number;
  status: 'uploading' | 'processing' | 'extracted' | 'error';
  progress: number;
  extractedData?: ExtractedData;
  aiSummary?: string;
}

interface ExtractedData {
  companyName?: string;
  industry?: string;
  stage?: string;
  description?: string;
  objectives?: string[];
  competitors?: string[];
  financials?: {
    revenue?: string;
    funding?: string;
    projections?: string;
  };
  keywords?: string[];
  keyInsights?: string[];
}

interface DocumentUploadZoneProps {
  onExtractedData: (data: ExtractedData, documentId: string) => void;
  onDocumentsChange: (documents: UploadedDocument[]) => void;
}

export function DocumentUploadZone({ onExtractedData, onDocumentsChange }: DocumentUploadZoneProps) {
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText className="w-5 h-5 text-red-400" />;
      case 'doc': return <File className="w-5 h-5 text-blue-400" />;
      case 'ppt': return <Presentation className="w-5 h-5 text-orange-400" />;
      case 'xls': return <FileSpreadsheet className="w-5 h-5 text-green-400" />;
      default: return <File className="w-5 h-5 text-foreground/70" />;
    }
  };

  const getFileType = (fileName: string): UploadedDocument['type'] => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return 'pdf';
    if (['doc', 'docx'].includes(ext || '')) return 'doc';
    if (['ppt', 'pptx'].includes(ext || '')) return 'ppt';
    if (['xls', 'xlsx'].includes(ext || '')) return 'xls';
    return 'other';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const simulateExtraction = useCallback((doc: UploadedDocument) => {
    // Simulate AI extraction based on file type
    const mockExtractions: Record<string, ExtractedData> = {
      'pitch_deck': {
        companyName: 'Extracted Company Name',
        industry: 'Technology',
        stage: 'Seed',
        description: 'AI-powered platform for business intelligence and strategic planning.',
        objectives: ['Raise Series A', 'Expand to US market', 'Reach 1000 customers'],
        competitors: ['Competitor A', 'Competitor B', 'Competitor C'],
        financials: {
          revenue: '$500K ARR',
          funding: '$2M raised',
          projections: '$5M ARR by 2025'
        },
        keywords: ['AI', 'Business Intelligence', 'SaaS', 'Enterprise'],
        keyInsights: [
          'Strong product-market fit in enterprise segment',
          'Differentiated by proprietary AI technology',
          'Clear path to profitability'
        ]
      },
      'business_plan': {
        companyName: 'Extracted Company Name',
        industry: 'Technology',
        description: 'Comprehensive business plan with detailed market analysis.',
        objectives: ['Market expansion', 'Product development', 'Team growth'],
        competitors: ['Market Leader', 'Emerging Player'],
        keyInsights: [
          'Detailed go-to-market strategy',
          'Strong unit economics',
          'Scalable business model'
        ]
      },
      'financial_model': {
        financials: {
          revenue: '$1.2M projected',
          funding: 'Seeking $3M',
          projections: '3x growth YoY'
        },
        keyInsights: [
          'Conservative revenue assumptions',
          'Clear path to break-even',
          'Strong gross margins'
        ]
      }
    };

    // Determine extraction type based on filename
    let extractionType = 'pitch_deck';
    const lowerName = doc.name.toLowerCase();
    if (lowerName.includes('business') || lowerName.includes('plan')) {
      extractionType = 'business_plan';
    } else if (lowerName.includes('financial') || lowerName.includes('model')) {
      extractionType = 'financial_model';
    }

    return {
      ...mockExtractions[extractionType],
      companyName: mockExtractions[extractionType].companyName || undefined
    };
  }, []);

  const processFile = useCallback(async (file: File) => {
    const newDoc: UploadedDocument = {
      id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      type: getFileType(file.name),
      size: file.size,
      status: 'uploading',
      progress: 0
    };

    setDocuments(prev => [...prev, newDoc]);

    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 100));
      setDocuments(prev => prev.map(d => 
        d.id === newDoc.id ? { ...d, progress: i } : d
      ));
    }

    // Update to processing status
    setDocuments(prev => prev.map(d => 
      d.id === newDoc.id ? { ...d, status: 'processing', progress: 0 } : d
    ));

    // Simulate AI processing
    for (let i = 0; i <= 100; i += 5) {
      await new Promise(resolve => setTimeout(resolve, 150));
      setDocuments(prev => prev.map(d => 
        d.id === newDoc.id ? { ...d, progress: i } : d
      ));
    }

    // Extract data
    const extractedData = simulateExtraction(newDoc);
    const aiSummary = `This ${newDoc.type.toUpperCase()} document contains ${
      extractedData.keyInsights?.length || 0
    } key insights about the business. ${
      extractedData.companyName ? `Company: ${extractedData.companyName}. ` : ''
    }${
      extractedData.industry ? `Industry: ${extractedData.industry}. ` : ''
    }${
      extractedData.financials?.revenue ? `Revenue: ${extractedData.financials.revenue}.` : ''
    }`;

    // Update with extracted data
    setDocuments(prev => {
      const updated = prev.map(d => 
        d.id === newDoc.id 
          ? { ...d, status: 'extracted' as const, extractedData, aiSummary } 
          : d
      );
      onDocumentsChange(updated);
      return updated;
    });

    // Notify parent of extracted data
    onExtractedData(extractedData, newDoc.id);

  }, [simulateExtraction, onExtractedData, onDocumentsChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    files.forEach(processFile);
  }, [processFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(processFile);
  }, [processFile]);

  const removeDocument = (id: string) => {
    setDocuments(prev => {
      const updated = prev.filter(d => d.id !== id);
      onDocumentsChange(updated);
      return updated;
    });
  };

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
          isDragging
            ? 'border-fuchsia-500 bg-fuchsia-500/10'
            : 'border-white/20 hover:border-white/40 bg-white/5'
        }`}
      >
        <input
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          id="document-upload"
          accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
        />
        <label htmlFor="document-upload" className="cursor-pointer block">
          <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-all ${
            isDragging ? 'bg-fuchsia-500/20' : 'bg-white/10'
          }`}>
            <Upload className={`w-8 h-8 ${isDragging ? 'text-fuchsia-400' : 'text-foreground/70'}`} />
          </div>
          <p className="text-lg font-medium text-white mb-2">
            {isDragging ? 'Drop files here' : 'Upload your documents'}
          </p>
          <p className="text-foreground/70 text-sm mb-4">
            Drag and drop or click to browse
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Badge variant="outline" className="border-white/20 text-foreground/70">PDF</Badge>
            <Badge variant="outline" className="border-white/20 text-foreground/70">Word</Badge>
            <Badge variant="outline" className="border-white/20 text-foreground/70">PowerPoint</Badge>
            <Badge variant="outline" className="border-white/20 text-foreground/70">Excel</Badge>
          </div>
        </label>
      </div>

      {/* Uploaded Documents */}
      {documents.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground/70 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Uploaded Documents ({documents.length})
          </h4>

          {documents.map(doc => (
            <div 
              key={doc.id}
              className="bg-white/5 border border-white/10 rounded-xl p-4"
            >
              <div className="flex items-start gap-3">
                {getFileIcon(doc.type)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-white truncate">{doc.name}</p>
                    <span className="text-xs text-foreground/60">{formatFileSize(doc.size)}</span>
                  </div>

                  {/* Status */}
                  {doc.status === 'uploading' && (
                    <div className="mt-2">
                      <div className="flex items-center gap-2 text-xs text-foreground/70 mb-1">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Uploading...
                      </div>
                      <Progress value={doc.progress} className="h-1" />
                    </div>
                  )}

                  {doc.status === 'processing' && (
                    <div className="mt-2">
                      <div className="flex items-center gap-2 text-xs text-cyan-400 mb-1">
                        <Brain className="w-3 h-3 animate-pulse" />
                        AI extracting insights...
                      </div>
                      <Progress value={doc.progress} className="h-1" />
                    </div>
                  )}

                  {doc.status === 'extracted' && (
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center gap-2 text-xs text-green-400">
                        <Check className="w-3 h-3" />
                        Extraction complete
                      </div>

                      {/* AI Summary */}
                      {doc.aiSummary && (
                        <div className="p-2 bg-gradient-to-r from-cyan-500/10 to-fuchsia-500/10 rounded-lg border border-white/10">
                          <div className="flex items-start gap-2">
                            <Sparkles className="w-3 h-3 text-fuchsia-400 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-foreground/80">{doc.aiSummary}</p>
                          </div>
                        </div>
                      )}

                      {/* Extracted Fields */}
                      {doc.extractedData && (
                        <div className="flex flex-wrap gap-1">
                          {doc.extractedData.companyName && (
                            <Badge variant="outline" className="text-[10px] border-green-500/30 text-green-400">
                              Company Name ✓
                            </Badge>
                          )}
                          {doc.extractedData.industry && (
                            <Badge variant="outline" className="text-[10px] border-green-500/30 text-green-400">
                              Industry ✓
                            </Badge>
                          )}
                          {doc.extractedData.objectives && (
                            <Badge variant="outline" className="text-[10px] border-green-500/30 text-green-400">
                              Objectives ✓
                            </Badge>
                          )}
                          {doc.extractedData.competitors && (
                            <Badge variant="outline" className="text-[10px] border-green-500/30 text-green-400">
                              Competitors ✓
                            </Badge>
                          )}
                          {doc.extractedData.financials && (
                            <Badge variant="outline" className="text-[10px] border-green-500/30 text-green-400">
                              Financials ✓
                            </Badge>
                          )}
                          {doc.extractedData.keyInsights && (
                            <Badge variant="outline" className="text-[10px] border-fuchsia-500/30 text-fuchsia-400">
                              {doc.extractedData.keyInsights.length} Insights
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {doc.status === 'error' && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-red-400">
                      <AlertCircle className="w-3 h-3" />
                      Failed to process document
                    </div>
                  )}
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => removeDocument(doc.id)}
                  className="text-foreground/60 hover:text-red-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Help Text */}
      <div className="flex items-start gap-2 p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
        <Brain className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-cyan-200">
          <p className="font-medium mb-1">AI Document Analysis</p>
          <p className="text-cyan-300/70">
            Upload existing business plans, pitch decks, or market research. 
            I'll extract key information and pre-fill relevant sections, 
            saving you time and ensuring consistency.
          </p>
        </div>
      </div>
    </div>
  );
}
