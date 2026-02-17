import { useState } from 'react';
import { 
  FileText, Clock, User, CheckCircle2, AlertTriangle,
  GitBranch, GitCommit, RefreshCw, Link2, Eye, Edit3,
  ChevronRight, ChevronDown, Search, Filter, Download,
  Shield, Zap, Bell, Calendar, ArrowRight, History
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

export type DocumentStatus = 'draft' | 'in_review' | 'approved' | 'published' | 'archived';
export type SignOffType = 'digital_twin' | 'user' | 'both' | 'sme';

export interface DocumentVersion {
  version: string;
  date: string;
  author: SignOffType;
  changes: string;
  signedOffBy: SignOffType[];
}

export interface ProcessDocument {
  id: string;
  code: string; // e.g., "PG-BP-001" for Project Genesis Blueprint 001
  name: string;
  type: 'blueprint' | 'process' | 'policy' | 'template' | 'checklist';
  category: string; // e.g., "Project Genesis", "Social Media", "Presentation"
  status: DocumentStatus;
  currentVersion: string;
  versions: DocumentVersion[];
  linkedDocuments: string[]; // IDs of related documents
  lastUpdated: string;
  lastReviewedBy: SignOffType;
  nextReviewDate: string;
  owner: string;
  description: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: 'created' | 'updated' | 'reviewed' | 'approved' | 'linked' | 'cascaded';
  documentId: string;
  documentName: string;
  actor: SignOffType;
  details: string;
  cascadedTo?: string[]; // Documents affected by cascading update
}

// Sample data
const sampleDocuments: ProcessDocument[] = [
  {
    id: 'pg-master',
    code: 'PG-BP-001',
    name: 'Project Genesis Master Blueprint',
    type: 'blueprint',
    category: 'Project Genesis',
    status: 'published',
    currentVersion: '1.2.0',
    versions: [
      { version: '1.2.0', date: '2024-01-12', author: 'digital_twin', changes: 'Added SME collaboration framework', signedOffBy: ['digital_twin', 'user'] },
      { version: '1.1.0', date: '2024-01-10', author: 'user', changes: 'Enhanced QA requirements', signedOffBy: ['user'] },
      { version: '1.0.0', date: '2024-01-08', author: 'digital_twin', changes: 'Initial release', signedOffBy: ['digital_twin', 'user'] },
    ],
    linkedDocuments: ['pg-social', 'pg-presentation', 'pg-financial'],
    lastUpdated: '2024-01-12 14:30',
    lastReviewedBy: 'both',
    nextReviewDate: '2024-01-19',
    owner: 'Chief of Staff',
    description: 'Master document defining the Project Genesis methodology and all sub-processes'
  },
  {
    id: 'pg-social',
    code: 'PG-BP-002',
    name: 'Social Media Blueprint',
    type: 'blueprint',
    category: 'Project Genesis',
    status: 'in_review',
    currentVersion: '0.9.0',
    versions: [
      { version: '0.9.0', date: '2024-01-12', author: 'digital_twin', changes: 'Added platform intelligence layer', signedOffBy: ['digital_twin'] },
      { version: '0.8.0', date: '2024-01-11', author: 'digital_twin', changes: 'Initial draft', signedOffBy: ['digital_twin'] },
    ],
    linkedDocuments: ['pg-master'],
    lastUpdated: '2024-01-12 16:00',
    lastReviewedBy: 'digital_twin',
    nextReviewDate: '2024-01-13',
    owner: 'Chief of Staff',
    description: 'End-to-end social media strategy and content generation process'
  },
  {
    id: 'pg-presentation',
    code: 'PG-BP-003',
    name: 'Presentation Blueprint',
    type: 'blueprint',
    category: 'Project Genesis',
    status: 'draft',
    currentVersion: '0.5.0',
    versions: [
      { version: '0.5.0', date: '2024-01-12', author: 'digital_twin', changes: 'Initial structure', signedOffBy: [] },
    ],
    linkedDocuments: ['pg-master'],
    lastUpdated: '2024-01-12 10:00',
    lastReviewedBy: 'digital_twin',
    nextReviewDate: '2024-01-14',
    owner: 'Chief of Staff',
    description: 'Investor presentation and pitch deck creation process'
  },
  {
    id: 'pg-financial',
    code: 'PG-BP-004',
    name: 'Financial Model Blueprint',
    type: 'blueprint',
    category: 'Project Genesis',
    status: 'draft',
    currentVersion: '0.3.0',
    versions: [
      { version: '0.3.0', date: '2024-01-11', author: 'digital_twin', changes: 'Added valuation frameworks', signedOffBy: [] },
    ],
    linkedDocuments: ['pg-master'],
    lastUpdated: '2024-01-11 18:00',
    lastReviewedBy: 'digital_twin',
    nextReviewDate: '2024-01-15',
    owner: 'Chief of Staff',
    description: 'Financial modeling and projections process'
  },
  {
    id: 'dt-job-desc',
    code: 'DT-POL-001',
    name: 'Chief of Staff Job Description',
    type: 'policy',
    category: 'Chief of Staff',
    status: 'published',
    currentVersion: '1.0.0',
    versions: [
      { version: '1.0.0', date: '2024-01-12', author: 'both', changes: 'Comprehensive role definition', signedOffBy: ['digital_twin', 'user'] },
    ],
    linkedDocuments: [],
    lastUpdated: '2024-01-12 15:00',
    lastReviewedBy: 'both',
    nextReviewDate: '2024-01-19',
    owner: 'User',
    description: 'Defines all responsibilities, communication protocols, and QA duties of the Chief of Staff'
  },
];

const sampleAuditLog: AuditLogEntry[] = [
  { id: '1', timestamp: '2024-01-12 16:00', action: 'updated', documentId: 'pg-social', documentName: 'Social Media Blueprint', actor: 'digital_twin', details: 'Added platform intelligence layer for Instagram, YouTube, TikTok, LinkedIn' },
  { id: '2', timestamp: '2024-01-12 15:30', action: 'cascaded', documentId: 'pg-master', documentName: 'Project Genesis Master Blueprint', actor: 'digital_twin', details: 'SME framework update cascaded to linked documents', cascadedTo: ['pg-social', 'pg-presentation', 'pg-financial'] },
  { id: '3', timestamp: '2024-01-12 14:30', action: 'approved', documentId: 'pg-master', documentName: 'Project Genesis Master Blueprint', actor: 'user', details: 'User approved version 1.2.0' },
  { id: '4', timestamp: '2024-01-12 14:00', action: 'reviewed', documentId: 'pg-master', documentName: 'Project Genesis Master Blueprint', actor: 'digital_twin', details: 'Weekly audit completed, 3 enhancement suggestions' },
  { id: '5', timestamp: '2024-01-12 10:00', action: 'created', documentId: 'pg-presentation', documentName: 'Presentation Blueprint', actor: 'digital_twin', details: 'Initial document created' },
];

const statusConfig: Record<DocumentStatus, { label: string; color: string; bgColor: string; borderColor: string }> = {
  draft: { label: 'Draft', color: 'text-foreground/70', bgColor: 'bg-gray-500/10', borderColor: 'border-gray-500/30' },
  in_review: { label: 'In Review', color: 'text-amber-400', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/30' },
  approved: { label: 'Approved', color: 'text-blue-400', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/30' },
  published: { label: 'Published', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/30' },
  archived: { label: 'Archived', color: 'text-foreground/60', bgColor: 'bg-gray-500/10', borderColor: 'border-gray-500/30' },
};

const actorLabels: Record<SignOffType, string> = {
  digital_twin: 'Chief of Staff',
  user: 'You',
  both: 'Both',
  sme: 'SME',
};

export function QMSProcessLog() {
  const [activeTab, setActiveTab] = useState<'documents' | 'audit' | 'dependencies'>('documents');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null);
  const [documents] = useState<ProcessDocument[]>(sampleDocuments);
  const [auditLog] = useState<AuditLogEntry[]>(sampleAuditLog);
  
  const filteredDocs = documents.filter(doc => 
    doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.category.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const getActionIcon = (action: AuditLogEntry['action']) => {
    switch (action) {
      case 'created': return FileText;
      case 'updated': return Edit3;
      case 'reviewed': return Eye;
      case 'approved': return CheckCircle2;
      case 'linked': return Link2;
      case 'cascaded': return RefreshCw;
      default: return FileText;
    }
  };
  
  const getActionColor = (action: AuditLogEntry['action']) => {
    switch (action) {
      case 'created': return 'text-cyan-400';
      case 'updated': return 'text-blue-400';
      case 'reviewed': return 'text-purple-400';
      case 'approved': return 'text-emerald-400';
      case 'linked': return 'text-amber-400';
      case 'cascaded': return 'text-pink-400';
      default: return 'text-foreground/70';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Shield className="w-6 h-6 text-purple-400" />
            Quality Management System
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Master Process Log • Document Control • Audit Trail
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            {documents.filter(d => d.status === 'published').length} Published
          </Badge>
          <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30">
            <AlertTriangle className="w-3 h-3 mr-1" />
            {documents.filter(d => d.status === 'in_review' || d.status === 'draft').length} Pending
          </Badge>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-card/50 rounded-lg border border-white/10">
        {[
          { id: 'documents', label: 'Documents', icon: FileText },
          { id: 'audit', label: 'Audit Log', icon: History },
          { id: 'dependencies', label: 'Dependencies', icon: GitBranch },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-foreground border border-purple-500/30'
                : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* Documents Tab */}
      {activeTab === 'documents' && (
        <div className="space-y-4">
          {/* Search */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-card/50 border-white/10"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
          
          {/* Document List */}
          <div className="space-y-3">
            {filteredDocs.map(doc => {
              const isExpanded = expandedDoc === doc.id;
              const statusConf = statusConfig[doc.status];
              
              return (
                <div key={doc.id} className="bg-card/50 rounded-xl border border-white/10 overflow-hidden">
                  <button
                    onClick={() => setExpandedDoc(isExpanded ? null : doc.id)}
                    className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                        <FileText className="w-6 h-6 text-purple-400" />
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-muted-foreground">{doc.code}</span>
                          <Badge variant="outline" className={`${statusConf.bgColor} ${statusConf.color} ${statusConf.borderColor}`}>
                            {statusConf.label}
                          </Badge>
                        </div>
                        <h4 className="font-semibold text-foreground">{doc.name}</h4>
                        <p className="text-xs text-muted-foreground">{doc.category} • v{doc.currentVersion}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right text-xs text-muted-foreground">
                        <div>Updated: {doc.lastUpdated}</div>
                        <div>Review: {doc.nextReviewDate}</div>
                      </div>
                      {isExpanded ? <ChevronDown className="w-5 h-5 text-muted-foreground" /> : <ChevronRight className="w-5 h-5 text-muted-foreground" />}
                    </div>
                  </button>
                  
                  {isExpanded && (
                    <div className="p-4 border-t border-white/10 bg-black/20">
                      <p className="text-sm text-muted-foreground mb-4">{doc.description}</p>
                      
                      {/* Version History */}
                      <div className="mb-4">
                        <h5 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                          <GitCommit className="w-4 h-4 text-cyan-400" />
                          Version History
                        </h5>
                        <div className="space-y-2">
                          {doc.versions.map((v, i) => (
                            <div key={i} className="flex items-center gap-3 text-sm p-2 bg-black/20 rounded-lg">
                              <Badge variant="outline" className="font-mono">v{v.version}</Badge>
                              <span className="text-muted-foreground">{v.date}</span>
                              <span className="text-foreground flex-1">{v.changes}</span>
                              <div className="flex items-center gap-1">
                                {v.signedOffBy.map((actor, j) => (
                                  <Badge key={j} variant="outline" className="text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    {actorLabels[actor]}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Linked Documents */}
                      {doc.linkedDocuments.length > 0 && (
                        <div>
                          <h5 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                            <Link2 className="w-4 h-4 text-amber-400" />
                            Linked Documents
                          </h5>
                          <div className="flex flex-wrap gap-2">
                            {doc.linkedDocuments.map(linkedId => {
                              const linkedDoc = documents.find(d => d.id === linkedId);
                              return linkedDoc ? (
                                <Badge key={linkedId} variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30">
                                  {linkedDoc.code}: {linkedDoc.name}
                                </Badge>
                              ) : null;
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Audit Log Tab */}
      {activeTab === 'audit' && (
        <div className="space-y-3">
          {auditLog.map(entry => {
            const Icon = getActionIcon(entry.action);
            const color = getActionColor(entry.action);
            
            return (
              <div key={entry.id} className="p-4 bg-card/50 rounded-xl border border-white/10 flex items-start gap-4">
                <div className={`w-10 h-10 rounded-lg bg-black/20 flex items-center justify-center ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-foreground capitalize">{entry.action}</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">{entry.documentName}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{entry.details}</p>
                  {entry.cascadedTo && entry.cascadedTo.length > 0 && (
                    <div className="mt-2 flex items-center gap-2 text-xs">
                      <ArrowRight className="w-3 h-3 text-pink-400" />
                      <span className="text-pink-400">Cascaded to:</span>
                      {entry.cascadedTo.map(id => {
                        const doc = documents.find(d => d.id === id);
                        return doc ? (
                          <Badge key={id} variant="outline" className="text-xs">
                            {doc.name}
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  <div>{entry.timestamp}</div>
                  <div className="mt-1">by {actorLabels[entry.actor]}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Dependencies Tab */}
      {activeTab === 'dependencies' && (
        <div className="p-8 bg-card/50 rounded-xl border border-white/10">
          <div className="text-center mb-6">
            <GitBranch className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Document Dependencies</h3>
            <p className="text-muted-foreground">
              Visual map of how documents are linked and how changes cascade
            </p>
          </div>
          
          {/* Simple dependency visualization */}
          <div className="flex flex-col items-center gap-4">
            {/* Master */}
            <div className="p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-500/30 w-64 text-center">
              <div className="text-xs text-purple-400 mb-1">PG-BP-001</div>
              <div className="font-semibold text-foreground">Project Genesis Master</div>
              <Badge className="mt-2 bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Published</Badge>
            </div>
            
            {/* Connector */}
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="w-px h-8 bg-white/20" />
            </div>
            
            {/* Sub-blueprints */}
            <div className="flex gap-4">
              {['Social Media', 'Presentation', 'Financial Model'].map((name, i) => (
                <div key={i} className="p-3 bg-card/50 rounded-lg border border-white/10 w-40 text-center">
                  <div className="text-xs text-muted-foreground mb-1">PG-BP-00{i + 2}</div>
                  <div className="text-sm font-medium text-foreground">{name}</div>
                  <Badge className="mt-2 text-xs" variant="outline">
                    {i === 0 ? 'In Review' : 'Draft'}
                  </Badge>
                </div>
              ))}
            </div>
            
            <p className="text-xs text-muted-foreground mt-4">
              Changes to the Master Blueprint automatically trigger review of linked documents
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
