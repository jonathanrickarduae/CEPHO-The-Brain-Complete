/**
 * Sample Data Service
 * Provides realistic demo data for testing and onboarding
 */

export const sampleProjects = [
  {
    id: 'demo-1',
    name: 'Acme Corp Acquisition',
    type: 'acquisition',
    status: 'in_progress',
    health: 'green',
    progress: 72,
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    team: ['Legal Expert', 'Financial Analyst', 'Due Diligence Specialist'],
    deliverables: [
      { name: 'NDA', status: 'completed', completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
      { name: 'Financial Model', status: 'in_review', progress: 85 },
      { name: 'Due Diligence Report', status: 'in_progress', progress: 45 },
      { name: 'Investment Memo', status: 'pending', progress: 0 },
    ],
    value: 2500000,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'demo-2',
    name: 'TechStart Series A',
    type: 'investment',
    status: 'in_progress',
    health: 'yellow',
    progress: 35,
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    team: ['Investment Analyst', 'Market Researcher'],
    deliverables: [
      { name: 'Term Sheet Review', status: 'completed', completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
      { name: 'Market Analysis', status: 'in_progress', progress: 60 },
      { name: 'Cap Table Verification', status: 'pending', progress: 0 },
    ],
    value: 500000,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'demo-3',
    name: 'GreenEnergy Partnership',
    type: 'partnership',
    status: 'review',
    health: 'green',
    progress: 90,
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    team: ['Legal Expert', 'Contract Specialist'],
    deliverables: [
      { name: 'Partnership Agreement', status: 'in_review', progress: 95 },
      { name: 'Risk Assessment', status: 'completed', completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
    ],
    value: 150000,
    createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
  },
];

export const sampleTasks = [
  {
    id: 'task-1',
    title: 'Review Acme Corp financial statements',
    project: 'Acme Corp Acquisition',
    priority: 'high',
    status: 'in_progress',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    assignedTo: 'Financial Analyst',
    estimatedHours: 4,
  },
  {
    id: 'task-2',
    title: 'Draft investment memo introduction',
    project: 'Acme Corp Acquisition',
    priority: 'medium',
    status: 'pending',
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    assignedTo: 'You',
    estimatedHours: 2,
  },
  {
    id: 'task-3',
    title: 'Schedule call with TechStart founders',
    project: 'TechStart Series A',
    priority: 'high',
    status: 'pending',
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    assignedTo: 'Chief of Staff',
    estimatedHours: 0.5,
  },
  {
    id: 'task-4',
    title: 'Final review of partnership agreement',
    project: 'GreenEnergy Partnership',
    priority: 'urgent',
    status: 'in_progress',
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    assignedTo: 'You',
    estimatedHours: 1,
  },
  {
    id: 'task-5',
    title: 'Prepare weekly summary report',
    project: null,
    priority: 'low',
    status: 'pending',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    assignedTo: 'Chief of Staff',
    estimatedHours: 0.5,
  },
];

export const sampleInboxItems = [
  {
    id: 'inbox-1',
    type: 'email',
    from: 'john.smith@acmecorp.com',
    subject: 'RE: Due Diligence Documents',
    preview: 'Thanks for the update. I\'ve attached the remaining financial documents you requested...',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    read: false,
    priority: 'high',
    suggestedAction: 'Review attachments and update DD checklist',
  },
  {
    id: 'inbox-2',
    type: 'calendar',
    title: 'TechStart Founders Call',
    time: new Date(Date.now() + 26 * 60 * 60 * 1000),
    duration: 60,
    attendees: ['Sarah Chen', 'Mike Johnson'],
    suggestedAction: 'Prepare questions about market strategy',
  },
  {
    id: 'inbox-3',
    type: 'notification',
    title: 'Document Ready for Review',
    message: 'Financial Model for Acme Corp is ready for your review',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    read: false,
    actionUrl: '/workflow/demo-1',
  },
  {
    id: 'inbox-4',
    type: 'task',
    title: 'Reminder: Partnership agreement due tomorrow',
    project: 'GreenEnergy Partnership',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    read: true,
  },
];

export const sampleConversations = [
  {
    role: 'user',
    content: 'What\'s the status of the Acme Corp deal?',
    timestamp: new Date(Date.now() - 60 * 60 * 1000),
  },
  {
    role: 'twin',
    content: 'The Acme Corp Acquisition is progressing well at 72% completion. The NDA has been signed, and the Financial Model is 85% complete and currently in review. The Due Diligence Report is 45% done with an expected completion in 5 days. The main blocker is waiting for additional financial documents from the seller, which John Smith mentioned he\'d send today.',
    timestamp: new Date(Date.now() - 59 * 60 * 1000),
    confidence: 0.92,
  },
  {
    role: 'user',
    content: 'Can you draft a follow-up email to John about the documents?',
    timestamp: new Date(Date.now() - 55 * 60 * 1000),
  },
  {
    role: 'twin',
    content: 'I\'ve drafted a follow-up email for John Smith. Here\'s the draft:\n\n---\n\nSubject: Follow-up: Outstanding Due Diligence Documents\n\nDear John,\n\nI hope this email finds you well. I wanted to follow up on the remaining financial documents we discussed for the due diligence process.\n\nSpecifically, we\'re still awaiting:\n• Audited financial statements for FY2024\n• Customer concentration analysis\n• Accounts receivable aging report\n\nWould you be able to share these by end of week? This will help us stay on track for our target closing date.\n\nBest regards',
    timestamp: new Date(Date.now() - 54 * 60 * 1000),
    confidence: 0.88,
    actions: ['Send Email', 'Edit Draft', 'Discard'],
  },
];

export const sampleMetrics = {
  weeklyStats: {
    tasksCompleted: 23,
    projectsAdvanced: 5,
    decisionsRecorded: 47,
    aiInteractions: 156,
    documentsGenerated: 8,
    hoursWorked: 42.5,
  },
  twinAccuracy: 87,
  twinConfidence: 0.85,
  trainingHours: 12.5,
  activeProjects: 3,
  pendingTasks: 8,
  upcomingDeadlines: 4,
};

export const sampleNotifications = [
  {
    id: 'notif-1',
    type: 'success',
    title: 'Document Generated',
    message: 'NDA for Acme Corp has been generated and is ready for review',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    read: false,
  },
  {
    id: 'notif-2',
    type: 'warning',
    title: 'Deadline Approaching',
    message: 'GreenEnergy Partnership agreement due in 3 days',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    read: false,
  },
  {
    id: 'notif-3',
    type: 'info',
    title: 'Chief of Staff Learning',
    message: 'Your feedback has improved accuracy by 2%',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    read: true,
  },
];

// Demo mode state management
const DEMO_MODE_KEY = 'brain-demo-mode';

export function isDemoMode(): boolean {
  return localStorage.getItem(DEMO_MODE_KEY) === 'true';
}

export function enableDemoMode(): void {
  localStorage.setItem(DEMO_MODE_KEY, 'true');
}

export function disableDemoMode(): void {
  localStorage.removeItem(DEMO_MODE_KEY);
}

export function toggleDemoMode(): boolean {
  const current = isDemoMode();
  if (current) {
    disableDemoMode();
  } else {
    enableDemoMode();
  }
  return !current;
}
