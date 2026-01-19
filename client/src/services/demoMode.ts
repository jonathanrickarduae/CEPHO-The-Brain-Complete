/**
 * Demo Mode Service
 * Initializes sample data for testing and demonstration
 */

export interface DemoProject {
  id: string;
  name: string;
  type: 'full_genesis' | 'financial_review' | 'due_diligence' | 'legal_docs' | 'strategic_review';
  status: 'active' | 'completed' | 'on_hold';
  progress: number;
  createdAt: Date;
  deliverables: DemoDeliverable[];
  team: string[];
}

export interface DemoDeliverable {
  id: string;
  name: string;
  type: string;
  status: 'pending' | 'in_progress' | 'review' | 'approved';
  assignedTo: string;
  dueDate: Date;
}

export interface DemoTask {
  id: string;
  title: string;
  description: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed';
  dueDate: Date;
  project?: string;
}

export interface DemoConversation {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Sample Projects
export const sampleProjects: DemoProject[] = [
  {
    id: 'proj-1',
    name: 'Celadon Capital Acquisition',
    type: 'full_genesis',
    status: 'active',
    progress: 65,
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    deliverables: [
      { id: 'd1', name: 'NDA Agreement', type: 'legal', status: 'approved', assignedTo: 'Legal Expert', dueDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      { id: 'd2', name: 'Financial Model', type: 'financial', status: 'review', assignedTo: 'Financial Analyst', dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) },
      { id: 'd3', name: 'Due Diligence Report', type: 'analysis', status: 'in_progress', assignedTo: 'DD Specialist', dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) },
      { id: 'd4', name: 'Investment Deck', type: 'presentation', status: 'pending', assignedTo: 'Strategy Consultant', dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000) },
    ],
    team: ['Legal Expert', 'Financial Analyst', 'DD Specialist', 'Strategy Consultant'],
  },
  {
    id: 'proj-2',
    name: 'Sample Project Ventures Partnership',
    type: 'strategic_review',
    status: 'active',
    progress: 40,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    deliverables: [
      { id: 'd5', name: 'Partnership Agreement Draft', type: 'legal', status: 'in_progress', assignedTo: 'Legal Expert', dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) },
      { id: 'd6', name: 'Market Analysis', type: 'research', status: 'review', assignedTo: 'Market Researcher', dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000) },
    ],
    team: ['Legal Expert', 'Market Researcher', 'Strategy Consultant'],
  },
  {
    id: 'proj-3',
    name: 'Perfect DXB Real Estate',
    type: 'financial_review',
    status: 'on_hold',
    progress: 25,
    createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
    deliverables: [
      { id: 'd7', name: 'Property Valuation', type: 'financial', status: 'approved', assignedTo: 'Real Estate Analyst', dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
      { id: 'd8', name: 'Cash Flow Projections', type: 'financial', status: 'pending', assignedTo: 'Financial Analyst', dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) },
    ],
    team: ['Real Estate Analyst', 'Financial Analyst'],
  },
];

// Sample Tasks
export const sampleTasks: DemoTask[] = [
  {
    id: 'task-1',
    title: 'Review Celadon financial model assumptions',
    description: 'Check revenue growth rates and margin assumptions against industry benchmarks',
    priority: 'high',
    status: 'pending',
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    project: 'Celadon Capital Acquisition',
  },
  {
    id: 'task-2',
    title: 'Schedule call with Sample Project legal team',
    description: 'Coordinate partnership agreement review meeting',
    priority: 'medium',
    status: 'in_progress',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    project: 'Sample Project Ventures Partnership',
  },
  {
    id: 'task-3',
    title: 'Prepare board presentation slides',
    description: 'Quarterly update on all active projects',
    priority: 'urgent',
    status: 'pending',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'task-4',
    title: 'Train Chief of Staff on negotiation patterns',
    description: 'Upload past negotiation transcripts for learning',
    priority: 'low',
    status: 'pending',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'task-5',
    title: 'Review DD report draft',
    description: 'QA review of due diligence findings before client submission',
    priority: 'high',
    status: 'pending',
    dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    project: 'Celadon Capital Acquisition',
  },
];

// Sample Chief of Staff Conversations
export const sampleConversations: DemoConversation[] = [
  {
    id: 'conv-1',
    role: 'user',
    content: 'What\'s the status on the Celadon deal?',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: 'conv-2',
    role: 'assistant',
    content: 'The Celadon Capital Acquisition is progressing well at 65% completion. The NDA has been signed, and the financial model is currently under review. The DD team is making good progress on their report, expected to complete in 5 days. Would you like me to schedule a status call with the team?',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 30000),
  },
  {
    id: 'conv-3',
    role: 'user',
    content: 'Yes, and also draft an email to the Celadon CFO requesting the Q3 financials',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
  },
  {
    id: 'conv-4',
    role: 'assistant',
    content: 'I\'ve drafted the email and scheduled a team call for tomorrow at 2 PM. Here\'s the email draft for your review:\n\n"Dear [CFO Name],\n\nI hope this message finds you well. As we progress through our due diligence process, we would appreciate receiving the Q3 2025 financial statements at your earliest convenience.\n\nThis will help us finalize our financial model and ensure accurate projections.\n\nBest regards"\n\nShall I send this, or would you like to make any changes?',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000 + 45000),
  },
];

// Sample Notifications
export const sampleNotifications = [
  {
    id: 'notif-1',
    type: 'task',
    title: 'Financial Model Review Due',
    message: 'The Celadon financial model needs your review before submission',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    read: false,
  },
  {
    id: 'notif-2',
    type: 'project',
    title: 'DD Report Ready for QA',
    message: 'The due diligence team has completed their initial report',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    read: false,
  },
  {
    id: 'notif-3',
    type: 'twin',
    title: 'Chief of Staff Suggestion',
    message: 'Based on patterns, I recommend scheduling a weekly project sync',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    read: true,
  },
];

// Sample Voice Notes
export const sampleVoiceNotes = [
  {
    id: 'vn-1',
    transcript: 'Remember to follow up with the Celadon team about the revised timeline. They mentioned concerns about the Q4 deadline.',
    category: 'reminder',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
  },
  {
    id: 'vn-2',
    transcript: 'Idea for the Sample Project partnership: propose a revenue share model instead of flat fee. Could be more attractive to both parties.',
    category: 'idea',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
  {
    id: 'vn-3',
    transcript: 'Need to check if the Perfect DXB property has any outstanding liens or encumbrances before proceeding.',
    category: 'task',
    timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000),
  },
];

// Demo mode state
let isDemoMode = false;

export function enableDemoMode() {
  isDemoMode = true;
  localStorage.setItem('brain-demo-mode', 'true');
  console.log('Demo mode enabled with sample data');
}

export function disableDemoMode() {
  isDemoMode = false;
  localStorage.removeItem('brain-demo-mode');
  console.log('Demo mode disabled');
}

export function isDemoModeEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('brain-demo-mode') === 'true';
}

export function getDemoData() {
  return {
    projects: sampleProjects,
    tasks: sampleTasks,
    conversations: sampleConversations,
    notifications: sampleNotifications,
    voiceNotes: sampleVoiceNotes,
  };
}

// Initialize demo mode on first visit (for testing)
export function initializeDemoModeIfNeeded() {
  if (typeof window === 'undefined') return;
  
  const hasVisited = localStorage.getItem('brain-has-visited');
  if (!hasVisited) {
    // First visit - enable demo mode
    enableDemoMode();
    localStorage.setItem('brain-has-visited', 'true');
  }
}
