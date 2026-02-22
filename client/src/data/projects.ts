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

// Project definitions - Empty until real projects are added
export const PROJECTS: Project[] = [];

// Personal items
export const PERSONAL_ITEMS = [
  { id: 'holiday', name: 'Holiday Planner', icon: '🏖️', type: 'calendar', items: 0 },
  { id: 'todo', name: 'Personal To-Do', icon: '✅', type: 'list', items: 0 },
  { id: 'reminders', name: 'Quick Reminders', icon: '🔔', type: 'reminders', items: 0 },
  { id: 'notes', name: 'Personal Notes', icon: '📝', type: 'notes', items: 0 },
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
