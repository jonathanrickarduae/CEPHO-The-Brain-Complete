// Shared project data for Library and Reference integration

export interface ProjectDocument {
  id: string;
  name: string;
  type: 'document' | 'image' | 'chart' | 'presentation' | 'data';
  size?: string;
  date: string;
  status?: 'signed' | 'draft' | 'working' | 'final';
  source?: string;
  path?: string;
  mimeType?: string;
}

export interface Project {
  id: string;
  name: string;
  icon: string;
  color: string;
  borderColor: string;
  documents: ProjectDocument[];
  subtitle?: string;
  status: 'active' | 'archived' | 'completed';
  lastUpdated: string;
}

// Project definitions
export const PROJECTS: Project[] = [
  {
    id: 'celadon',
    name: 'Celadon Pharmaceuticals',
    icon: '💊',
    color: 'from-emerald-500/20 to-emerald-500/5',
    borderColor: 'border-emerald-500/30',
    status: 'active',
    lastUpdated: '2024-01-10',
    documents: [
      { id: 'cel-1', name: 'Q4 Strategy Report.pdf', type: 'document', size: '2.4 MB', date: '2024-01-10', status: 'signed' },
      { id: 'cel-2', name: 'Investment Proposal v3.docx', type: 'document', size: '1.8 MB', date: '2024-01-09', status: 'draft' },
      { id: 'cel-3', name: 'Board Presentation.pptx', type: 'presentation', size: '5.2 MB', date: '2024-01-08', status: 'signed' },
      { id: 'cel-4', name: 'Due Diligence Checklist.xlsx', type: 'data', size: '890 KB', date: '2024-01-07', status: 'working' },
      { id: 'cel-5', name: 'Legal Review Notes.pdf', type: 'document', size: '1.1 MB', date: '2024-01-06', status: 'signed' },
      { id: 'cel-6', name: 'Financial Model 2024.xlsx', type: 'data', size: '3.2 MB', date: '2024-01-10', status: 'final' },
      { id: 'cel-7', name: 'Market Analysis Chart.png', type: 'image', size: '450 KB', date: '2024-01-10', source: 'AI Generated' },
      { id: 'cel-8', name: 'Competitor Landscape.png', type: 'image', size: '380 KB', date: '2024-01-09', source: 'AI Generated' },
      { id: 'cel-9', name: 'Revenue Projections', type: 'chart', date: '2024-01-10' },
      { id: 'cel-10', name: 'Market Share Analysis', type: 'chart', date: '2024-01-09' },
    ],
  },
  {
    id: 'boundless',
    name: 'Boundless Telecom',
    icon: '📡',
    color: 'from-blue-500/20 to-blue-500/5',
    borderColor: 'border-blue-500/30',
    status: 'active',
    lastUpdated: '2024-01-09',
    documents: [
      { id: 'bnd-1', name: 'Network Expansion Plan.pdf', type: 'document', size: '4.1 MB', date: '2024-01-09', status: 'signed' },
      { id: 'bnd-2', name: 'Regulatory Compliance Report.pdf', type: 'document', size: '2.8 MB', date: '2024-01-08', status: 'final' },
      { id: 'bnd-3', name: 'Infrastructure Investment Model.xlsx', type: 'data', size: '5.5 MB', date: '2024-01-07', status: 'working' },
      { id: 'bnd-4', name: 'Spectrum License Agreement.pdf', type: 'document', size: '1.2 MB', date: '2024-01-06', status: 'signed' },
      { id: 'bnd-5', name: 'Customer Growth Forecast.xlsx', type: 'data', size: '2.1 MB', date: '2024-01-09', status: 'draft' },
      { id: 'bnd-6', name: 'Coverage Map.png', type: 'image', size: '1.8 MB', date: '2024-01-08', source: 'AI Generated' },
    ],
  },
  {
    id: 'perfect-dxb',
    name: 'Perfect DXB',
    icon: '🏗️',
    color: 'from-amber-500/20 to-amber-500/5',
    borderColor: 'border-amber-500/30',
    subtitle: 'Perfect Technical Works, LLC',
    status: 'active',
    lastUpdated: '2024-01-10',
    documents: [
      { id: 'pdxb-1', name: 'Construction Timeline.pdf', type: 'document', size: '3.2 MB', date: '2024-01-10', status: 'working' },
      { id: 'pdxb-2', name: 'Contractor Agreements.pdf', type: 'document', size: '4.5 MB', date: '2024-01-09', status: 'signed' },
      { id: 'pdxb-3', name: 'Budget Breakdown.xlsx', type: 'data', size: '1.9 MB', date: '2024-01-08', status: 'final' },
      { id: 'pdxb-4', name: 'Site Survey Report.pdf', type: 'document', size: '8.2 MB', date: '2024-01-07', status: 'signed' },
      { id: 'pdxb-5', name: 'Permit Documentation.pdf', type: 'document', size: '2.1 MB', date: '2024-01-06', status: 'signed' },
      { id: 'pdxb-6', name: 'Architectural Renders.png', type: 'image', size: '12.5 MB', date: '2024-01-10', source: 'AI Generated' },
      { id: 'pdxb-7', name: 'Project Cost Analysis', type: 'chart', date: '2024-01-09' },
    ],
  },
  {
    id: 'ampora',
    name: 'Ampora',
    icon: '🌊',
    color: 'from-cyan-500/20 to-cyan-500/5',
    borderColor: 'border-cyan-500/30',
    status: 'active',
    lastUpdated: '2024-01-08',
    documents: [
      { id: 'amp-1', name: 'Product Roadmap.pdf', type: 'document', size: '2.2 MB', date: '2024-01-08', status: 'draft' },
      { id: 'amp-2', name: 'User Research Summary.pdf', type: 'document', size: '1.5 MB', date: '2024-01-07', status: 'final' },
      { id: 'amp-3', name: 'Technical Architecture.pdf', type: 'document', size: '3.8 MB', date: '2024-01-06', status: 'working' },
      { id: 'amp-4', name: 'Go-to-Market Strategy.pptx', type: 'presentation', size: '4.2 MB', date: '2024-01-05', status: 'draft' },
      { id: 'amp-5', name: 'User Flow Diagram.png', type: 'image', size: '680 KB', date: '2024-01-08', source: 'AI Generated' },
    ],
  },
  {
    id: 'green-waste-energy',
    name: 'Green Waste Energy',
    icon: '♻️',
    color: 'from-green-500/20 to-green-500/5',
    borderColor: 'border-green-500/30',
    status: 'active',
    lastUpdated: '2024-01-10',
    documents: [
      { id: 'gwe-1', name: 'Sustainability Report.pdf', type: 'document', size: '3.5 MB', date: '2024-01-10', status: 'final' },
      { id: 'gwe-2', name: 'Environmental Impact Assessment.pdf', type: 'document', size: '4.2 MB', date: '2024-01-09', status: 'signed' },
      { id: 'gwe-3', name: 'Carbon Offset Projections.xlsx', type: 'data', size: '1.8 MB', date: '2024-01-08', status: 'working' },
      { id: 'gwe-4', name: 'Regulatory Permits.pdf', type: 'document', size: '2.1 MB', date: '2024-01-07', status: 'signed' },
      { id: 'gwe-5', name: 'Facility Design Renders.png', type: 'image', size: '8.5 MB', date: '2024-01-10', source: 'AI Generated' },
    ],
  },
  {
    id: 'project-6',
    name: 'Project 6',
    icon: '⚡',
    color: 'from-fuchsia-500/20 to-fuchsia-500/5',
    borderColor: 'border-fuchsia-500/30',
    status: 'active',
    lastUpdated: '2024-01-06',
    documents: [
      { id: 'p6-1', name: 'Feasibility Study.pdf', type: 'document', size: '2.1 MB', date: '2024-01-06', status: 'draft' },
      { id: 'p6-2', name: 'Risk Assessment.xlsx', type: 'data', size: '890 KB', date: '2024-01-05', status: 'working' },
    ],
  },
];

// Personal items
export const PERSONAL_ITEMS = [
  { id: 'holiday', name: 'Holiday Planner', icon: '🏖️', type: 'calendar', items: 5 },
  { id: 'todo', name: 'Personal To-Do', icon: '✅', type: 'list', items: 12 },
  { id: 'reminders', name: 'Quick Reminders', icon: '🔔', type: 'reminders', items: 3 },
  { id: 'notes', name: 'Personal Notes', icon: '📝', type: 'notes', items: 8 },
];

// Helper functions
export function getProjectById(id: string): Project | undefined {
  return PROJECTS.find(p => p.id === id);
}

export function getProjectDocuments(projectId: string): ProjectDocument[] {
  const project = getProjectById(projectId);
  return project?.documents || [];
}

export function getDocumentById(projectId: string, documentId: string): ProjectDocument | undefined {
  const docs = getProjectDocuments(projectId);
  return docs.find(d => d.id === documentId);
}

export function searchDocuments(query: string): { project: Project; document: ProjectDocument }[] {
  const results: { project: Project; document: ProjectDocument }[] = [];
  const lowerQuery = query.toLowerCase();
  
  PROJECTS.forEach(project => {
    project.documents.forEach(doc => {
      if (doc.name.toLowerCase().includes(lowerQuery)) {
        results.push({ project, document: doc });
      }
    });
  });
  
  return results;
}

export function getDocumentsByType(type: ProjectDocument['type']): { project: Project; document: ProjectDocument }[] {
  const results: { project: Project; document: ProjectDocument }[] = [];
  
  PROJECTS.forEach(project => {
    project.documents.forEach(doc => {
      if (doc.type === type) {
        results.push({ project, document: doc });
      }
    });
  });
  
  return results;
}

// Map document to reference type
export function documentToReferenceType(doc: ProjectDocument): 'financial_model' | 'contract' | 'quote' | 'research_paper' | 'legal_document' | 'data_source' | 'expert_statement' | 'other' {
  const name = doc.name.toLowerCase();
  
  if (name.includes('financial') || name.includes('budget') || name.includes('model') || name.includes('forecast')) {
    return 'financial_model';
  }
  if (name.includes('contract') || name.includes('agreement') || name.includes('license')) {
    return 'contract';
  }
  if (name.includes('legal') || name.includes('compliance') || name.includes('permit')) {
    return 'legal_document';
  }
  if (name.includes('research') || name.includes('study') || name.includes('analysis')) {
    return 'research_paper';
  }
  if (doc.type === 'data' || name.includes('.xlsx') || name.includes('.csv')) {
    return 'data_source';
  }
  
  return 'other';
}
