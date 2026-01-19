/**
 * Simulation Data Service
 * 
 * Provides realistic sample data for productivity integrations
 * without requiring OAuth, webhooks, or background jobs.
 * 
 * Enables Project Genesis to run end-to-end:
 * idea → analysis → business plan → KPIs
 */

// ============================================================
// TYPES
// ============================================================

export interface SimulatedCalendarEvent {
  id: string;
  calendarId: string;
  title: string;
  description?: string;
  startTime: number;
  endTime: number;
  location?: string;
  isAllDay: boolean;
  attendees: {
    email: string;
    name?: string;
    responseStatus: 'accepted' | 'declined' | 'tentative' | 'needsAction';
  }[];
  status: 'confirmed' | 'tentative' | 'cancelled';
  source: 'google' | 'outlook' | 'simulation';
}

export interface SimulatedEmail {
  id: string;
  threadId: string;
  from: { email: string; name?: string };
  to: { email: string; name?: string }[];
  cc?: { email: string; name?: string }[];
  subject: string;
  snippet: string;
  bodyPlain?: string;
  receivedAt: number;
  isRead: boolean;
  isStarred: boolean;
  labels: string[];
  attachments: { filename: string; mimeType: string; size: number }[];
  importance: 'high' | 'normal' | 'low';
}

export interface SimulatedNotionPage {
  id: string;
  title: string;
  parentId?: string;
  parentType: 'workspace' | 'page' | 'database';
  createdAt: number;
  updatedAt: number;
  content: string;
  icon?: string;
  url: string;
}

export interface SimulatedTaskCard {
  id: string;
  boardId: string;
  boardName: string;
  columnId: string;
  columnName: string;
  title: string;
  description?: string;
  dueDate?: number;
  assignees: string[];
  labels: { name: string; color: string }[];
  checklists: { name: string; items: { text: string; isComplete: boolean }[] }[];
  createdAt: number;
  updatedAt: number;
}

// ============================================================
// SIMULATION MODE STATE
// ============================================================

let simulationModeEnabled = true; // Default to enabled for Phase 1

export function isSimulationMode(): boolean {
  return simulationModeEnabled;
}

export function setSimulationMode(enabled: boolean): void {
  simulationModeEnabled = enabled;
}

// ============================================================
// DATE HELPERS
// ============================================================

function today(): Date {
  return new Date();
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function setTime(date: Date, hours: number, minutes: number): Date {
  const result = new Date(date);
  result.setHours(hours, minutes, 0, 0);
  return result;
}

function randomId(): string {
  return `sim_${Math.random().toString(36).substring(2, 11)}`;
}

// ============================================================
// CALENDAR SIMULATION DATA
// ============================================================

export function getSimulatedCalendarEvents(): SimulatedCalendarEvent[] {
  const now = today();
  
  return [
    // Today's meetings
    {
      id: randomId(),
      calendarId: 'primary',
      title: 'Morning Standup',
      description: 'Daily team sync to review priorities and blockers',
      startTime: setTime(now, 9, 0).getTime(),
      endTime: setTime(now, 9, 30).getTime(),
      location: 'Google Meet',
      isAllDay: false,
      attendees: [
        { email: 'sarah.chen@company.com', name: 'Sarah Chen', responseStatus: 'accepted' },
        { email: 'mike.johnson@company.com', name: 'Mike Johnson', responseStatus: 'accepted' },
        { email: 'emma.wilson@company.com', name: 'Emma Wilson', responseStatus: 'tentative' }
      ],
      status: 'confirmed',
      source: 'simulation'
    },
    {
      id: randomId(),
      calendarId: 'primary',
      title: 'Investor Call: Series A Discussion',
      description: 'Follow up call with Sequoia regarding term sheet',
      startTime: setTime(now, 11, 0).getTime(),
      endTime: setTime(now, 12, 0).getTime(),
      location: 'Zoom',
      isAllDay: false,
      attendees: [
        { email: 'partner@sequoia.com', name: 'David Park', responseStatus: 'accepted' }
      ],
      status: 'confirmed',
      source: 'simulation'
    },
    {
      id: randomId(),
      calendarId: 'primary',
      title: 'Product Review: Q1 Roadmap',
      description: 'Review product roadmap and prioritize features for Q1',
      startTime: setTime(now, 14, 0).getTime(),
      endTime: setTime(now, 15, 30).getTime(),
      location: 'Conference Room A',
      isAllDay: false,
      attendees: [
        { email: 'product@company.com', name: 'Lisa Zhang', responseStatus: 'accepted' },
        { email: 'engineering@company.com', name: 'James Lee', responseStatus: 'accepted' },
        { email: 'design@company.com', name: 'Anna Smith', responseStatus: 'needsAction' }
      ],
      status: 'confirmed',
      source: 'simulation'
    },
    {
      id: randomId(),
      calendarId: 'primary',
      title: 'Focus Time: Strategy Document',
      description: 'Blocked time for strategic planning',
      startTime: setTime(now, 16, 0).getTime(),
      endTime: setTime(now, 18, 0).getTime(),
      isAllDay: false,
      attendees: [],
      status: 'confirmed',
      source: 'simulation'
    },
    // Tomorrow's meetings
    {
      id: randomId(),
      calendarId: 'primary',
      title: 'Board Meeting Prep',
      description: 'Prepare materials for upcoming board meeting',
      startTime: setTime(addDays(now, 1), 10, 0).getTime(),
      endTime: setTime(addDays(now, 1), 11, 30).getTime(),
      location: 'Office',
      isAllDay: false,
      attendees: [
        { email: 'cfo@company.com', name: 'Robert Kim', responseStatus: 'accepted' }
      ],
      status: 'confirmed',
      source: 'simulation'
    },
    {
      id: randomId(),
      calendarId: 'primary',
      title: 'Customer Success Review',
      description: 'Monthly review of key accounts and churn metrics',
      startTime: setTime(addDays(now, 1), 14, 0).getTime(),
      endTime: setTime(addDays(now, 1), 15, 0).getTime(),
      location: 'Google Meet',
      isAllDay: false,
      attendees: [
        { email: 'cs@company.com', name: 'Maria Garcia', responseStatus: 'accepted' }
      ],
      status: 'confirmed',
      source: 'simulation'
    },
    // This week
    {
      id: randomId(),
      calendarId: 'primary',
      title: 'Quarterly Planning Offsite',
      description: 'Full day strategic planning session with leadership team',
      startTime: setTime(addDays(now, 3), 9, 0).getTime(),
      endTime: setTime(addDays(now, 3), 17, 0).getTime(),
      location: 'The Ritz Carlton',
      isAllDay: false,
      attendees: [
        { email: 'cto@company.com', name: 'Alex Turner', responseStatus: 'accepted' },
        { email: 'cfo@company.com', name: 'Robert Kim', responseStatus: 'accepted' },
        { email: 'cmo@company.com', name: 'Jennifer Wu', responseStatus: 'accepted' }
      ],
      status: 'confirmed',
      source: 'simulation'
    }
  ];
}

// ============================================================
// EMAIL SIMULATION DATA
// ============================================================

export function getSimulatedEmails(): SimulatedEmail[] {
  const now = today();
  
  return [
    // High priority emails
    {
      id: randomId(),
      threadId: randomId(),
      from: { email: 'partner@sequoia.com', name: 'David Park' },
      to: [{ email: 'ceo@company.com', name: 'You' }],
      subject: 'RE: Series A Term Sheet - Final Review',
      snippet: 'Thanks for the call yesterday. I have reviewed the updated terms with our team and we are ready to proceed...',
      bodyPlain: 'Thanks for the call yesterday. I have reviewed the updated terms with our team and we are ready to proceed. Please find attached the final term sheet for your review. We would like to close by end of month if possible. Let me know if you have any questions.',
      receivedAt: setTime(now, 7, 23).getTime(),
      isRead: false,
      isStarred: true,
      labels: ['INBOX', 'IMPORTANT', 'STARRED'],
      attachments: [
        { filename: 'Term_Sheet_Final_v3.pdf', mimeType: 'application/pdf', size: 245000 }
      ],
      importance: 'high'
    },
    {
      id: randomId(),
      threadId: randomId(),
      from: { email: 'enterprise@bigcorp.com', name: 'Michael Thompson' },
      to: [{ email: 'sales@company.com', name: 'Sales Team' }],
      cc: [{ email: 'ceo@company.com', name: 'You' }],
      subject: 'Enterprise License Agreement - Ready to Sign',
      snippet: 'Our legal team has approved the contract. We are ready to proceed with the annual enterprise license...',
      bodyPlain: 'Our legal team has approved the contract. We are ready to proceed with the annual enterprise license for 500 seats. Please send the final invoice and we can process payment this week.',
      receivedAt: setTime(now, 6, 45).getTime(),
      isRead: false,
      isStarred: false,
      labels: ['INBOX', 'IMPORTANT'],
      attachments: [],
      importance: 'high'
    },
    // Normal priority emails
    {
      id: randomId(),
      threadId: randomId(),
      from: { email: 'hr@company.com', name: 'HR Team' },
      to: [{ email: 'all@company.com', name: 'All Staff' }],
      subject: 'Reminder: Performance Reviews Due Friday',
      snippet: 'This is a friendly reminder that all Q4 performance reviews are due by end of day Friday...',
      bodyPlain: 'This is a friendly reminder that all Q4 performance reviews are due by end of day Friday. Please ensure you have completed self-assessments and peer reviews in the HR system.',
      receivedAt: setTime(addDays(now, -1), 14, 30).getTime(),
      isRead: true,
      isStarred: false,
      labels: ['INBOX'],
      attachments: [],
      importance: 'normal'
    },
    {
      id: randomId(),
      threadId: randomId(),
      from: { email: 'product@company.com', name: 'Lisa Zhang' },
      to: [{ email: 'ceo@company.com', name: 'You' }],
      subject: 'Product Metrics Dashboard - Weekly Update',
      snippet: 'Here is this week\'s product metrics summary. DAU is up 12% week over week...',
      bodyPlain: 'Here is this week\'s product metrics summary. DAU is up 12% week over week. Retention has improved to 45% at day 7. See attached dashboard for full details.',
      receivedAt: setTime(addDays(now, -1), 9, 15).getTime(),
      isRead: true,
      isStarred: false,
      labels: ['INBOX'],
      attachments: [
        { filename: 'Product_Metrics_Week_3.pdf', mimeType: 'application/pdf', size: 1200000 }
      ],
      importance: 'normal'
    },
    {
      id: randomId(),
      threadId: randomId(),
      from: { email: 'newsletter@techcrunch.com', name: 'TechCrunch' },
      to: [{ email: 'ceo@company.com', name: 'You' }],
      subject: 'Daily Crunch: AI Startups Raise Record Funding',
      snippet: 'Today\'s top stories: AI startups have raised over $50B in 2025...',
      bodyPlain: 'Today\'s top stories: AI startups have raised over $50B in 2025, marking a new record. Plus: Apple announces new AI features, and more.',
      receivedAt: setTime(now, 5, 0).getTime(),
      isRead: false,
      isStarred: false,
      labels: ['INBOX', 'NEWSLETTERS'],
      attachments: [],
      importance: 'low'
    }
  ];
}

// ============================================================
// NOTION SIMULATION DATA
// ============================================================

export function getSimulatedNotionPages(): SimulatedNotionPage[] {
  const now = today();
  
  return [
    {
      id: randomId(),
      title: 'Company Wiki',
      parentType: 'workspace',
      createdAt: addDays(now, -90).getTime(),
      updatedAt: addDays(now, -2).getTime(),
      content: 'Central knowledge base for company policies, processes, and documentation.',
      icon: '📚',
      url: 'https://notion.so/company-wiki'
    },
    {
      id: randomId(),
      title: 'Q1 2026 OKRs',
      parentType: 'workspace',
      createdAt: addDays(now, -30).getTime(),
      updatedAt: addDays(now, -1).getTime(),
      content: `
## Company Objectives

### O1: Achieve Product Market Fit
- KR1: Reach 10,000 DAU by end of Q1
- KR2: Achieve 50% week 4 retention
- KR3: NPS score above 40

### O2: Close Series A Funding
- KR1: Complete due diligence with 3 top tier VCs
- KR2: Secure term sheet by February
- KR3: Close round by end of March

### O3: Build World Class Team
- KR1: Hire VP Engineering
- KR2: Hire VP Sales
- KR3: Grow team to 25 people
      `,
      icon: '🎯',
      url: 'https://notion.so/q1-okrs'
    },
    {
      id: randomId(),
      title: 'Product Roadmap',
      parentType: 'workspace',
      createdAt: addDays(now, -60).getTime(),
      updatedAt: now.getTime(),
      content: `
## Q1 2026 Roadmap

### January
- [ ] Launch mobile app beta
- [ ] Implement SSO for enterprise
- [ ] Add Slack integration

### February
- [ ] Public API launch
- [ ] Advanced analytics dashboard
- [ ] Team collaboration features

### March
- [ ] AI-powered recommendations
- [ ] Custom workflows
- [ ] Enterprise admin panel
      `,
      icon: '🗺️',
      url: 'https://notion.so/product-roadmap'
    },
    {
      id: randomId(),
      title: 'Meeting Notes: Board Meeting Jan 15',
      parentType: 'page',
      parentId: 'meetings',
      createdAt: addDays(now, -4).getTime(),
      updatedAt: addDays(now, -4).getTime(),
      content: `
## Attendees
- Board members: John Smith, Sarah Lee, Mark Chen
- Management: CEO, CFO, CTO

## Key Decisions
1. Approved Q1 budget of $2.5M
2. Greenlit Series A fundraise
3. Approved hiring plan for 10 new roles

## Action Items
- CEO: Finalize investor deck by Jan 20
- CFO: Update financial model with new projections
- CTO: Present technical roadmap at next meeting
      `,
      icon: '📝',
      url: 'https://notion.so/board-meeting-jan-15'
    },
    {
      id: randomId(),
      title: 'Competitor Analysis',
      parentType: 'workspace',
      createdAt: addDays(now, -45).getTime(),
      updatedAt: addDays(now, -7).getTime(),
      content: `
## Key Competitors

### Competitor A
- Funding: $50M Series B
- Strengths: Strong enterprise sales
- Weaknesses: Poor UX, slow innovation

### Competitor B
- Funding: $20M Series A
- Strengths: Great product, fast growth
- Weaknesses: Limited enterprise features

### Our Differentiation
- AI-first approach
- Superior user experience
- Faster time to value
      `,
      icon: '🔍',
      url: 'https://notion.so/competitor-analysis'
    }
  ];
}

// ============================================================
// TASK/TRELLO SIMULATION DATA
// ============================================================

export function getSimulatedTasks(): SimulatedTaskCard[] {
  const now = today();
  
  return [
    // Product Board
    {
      id: randomId(),
      boardId: 'board_product',
      boardName: 'Product Development',
      columnId: 'col_todo',
      columnName: 'To Do',
      title: 'Implement user onboarding flow',
      description: 'Create a guided onboarding experience for new users including tutorial, sample data, and first-run wizard.',
      dueDate: addDays(now, 5).getTime(),
      assignees: ['Lisa Zhang', 'James Lee'],
      labels: [
        { name: 'Feature', color: 'green' },
        { name: 'High Priority', color: 'red' }
      ],
      checklists: [
        {
          name: 'Implementation Steps',
          items: [
            { text: 'Design onboarding screens', isComplete: true },
            { text: 'Implement step-by-step wizard', isComplete: false },
            { text: 'Add sample data generation', isComplete: false },
            { text: 'Write onboarding copy', isComplete: false },
            { text: 'QA testing', isComplete: false }
          ]
        }
      ],
      createdAt: addDays(now, -10).getTime(),
      updatedAt: addDays(now, -1).getTime()
    },
    {
      id: randomId(),
      boardId: 'board_product',
      boardName: 'Product Development',
      columnId: 'col_inprogress',
      columnName: 'In Progress',
      title: 'API rate limiting and throttling',
      description: 'Implement rate limiting for public API to prevent abuse and ensure fair usage.',
      dueDate: addDays(now, 2).getTime(),
      assignees: ['James Lee'],
      labels: [
        { name: 'Backend', color: 'blue' },
        { name: 'Security', color: 'purple' }
      ],
      checklists: [
        {
          name: 'Tasks',
          items: [
            { text: 'Design rate limit tiers', isComplete: true },
            { text: 'Implement Redis-based counter', isComplete: true },
            { text: 'Add rate limit headers', isComplete: false },
            { text: 'Update API documentation', isComplete: false }
          ]
        }
      ],
      createdAt: addDays(now, -5).getTime(),
      updatedAt: now.getTime()
    },
    {
      id: randomId(),
      boardId: 'board_product',
      boardName: 'Product Development',
      columnId: 'col_review',
      columnName: 'In Review',
      title: 'Dashboard analytics widgets',
      description: 'Add customizable analytics widgets to the main dashboard.',
      dueDate: addDays(now, 1).getTime(),
      assignees: ['Anna Smith', 'Lisa Zhang'],
      labels: [
        { name: 'Feature', color: 'green' },
        { name: 'Frontend', color: 'cyan' }
      ],
      checklists: [],
      createdAt: addDays(now, -14).getTime(),
      updatedAt: addDays(now, -1).getTime()
    },
    // Sales Board
    {
      id: randomId(),
      boardId: 'board_sales',
      boardName: 'Sales Pipeline',
      columnId: 'col_qualified',
      columnName: 'Qualified',
      title: 'BigCorp Enterprise Deal',
      description: '500 seat enterprise license. Legal approved, ready to close.',
      dueDate: addDays(now, 3).getTime(),
      assignees: ['Sales Team'],
      labels: [
        { name: 'Enterprise', color: 'gold' },
        { name: 'Hot Lead', color: 'red' }
      ],
      checklists: [
        {
          name: 'Close Checklist',
          items: [
            { text: 'Discovery call', isComplete: true },
            { text: 'Demo', isComplete: true },
            { text: 'Security review', isComplete: true },
            { text: 'Legal review', isComplete: true },
            { text: 'Final negotiation', isComplete: false },
            { text: 'Contract signed', isComplete: false }
          ]
        }
      ],
      createdAt: addDays(now, -30).getTime(),
      updatedAt: now.getTime()
    },
    {
      id: randomId(),
      boardId: 'board_sales',
      boardName: 'Sales Pipeline',
      columnId: 'col_negotiation',
      columnName: 'Negotiation',
      title: 'TechStartup Pro Plan',
      description: '50 seat annual plan. Negotiating on price.',
      dueDate: addDays(now, 7).getTime(),
      assignees: ['Sales Team'],
      labels: [
        { name: 'SMB', color: 'blue' }
      ],
      checklists: [],
      createdAt: addDays(now, -14).getTime(),
      updatedAt: addDays(now, -2).getTime()
    },
    // Operations Board
    {
      id: randomId(),
      boardId: 'board_ops',
      boardName: 'Operations',
      columnId: 'col_urgent',
      columnName: 'Urgent',
      title: 'Prepare Series A Data Room',
      description: 'Compile all documents for investor due diligence.',
      dueDate: addDays(now, 4).getTime(),
      assignees: ['Robert Kim', 'CEO'],
      labels: [
        { name: 'Fundraising', color: 'green' },
        { name: 'Urgent', color: 'red' }
      ],
      checklists: [
        {
          name: 'Documents',
          items: [
            { text: 'Financial statements', isComplete: true },
            { text: 'Cap table', isComplete: true },
            { text: 'Customer contracts', isComplete: false },
            { text: 'Employee agreements', isComplete: false },
            { text: 'IP documentation', isComplete: false },
            { text: 'Corporate documents', isComplete: true }
          ]
        }
      ],
      createdAt: addDays(now, -7).getTime(),
      updatedAt: now.getTime()
    }
  ];
}

// ============================================================
// AGGREGATED DATA FOR PROJECT GENESIS
// ============================================================

export interface SimulationSummary {
  calendar: {
    todayMeetings: number;
    thisWeekMeetings: number;
    nextMeeting?: SimulatedCalendarEvent;
    focusTimeBlocked: number; // hours
  };
  email: {
    unreadCount: number;
    highPriorityCount: number;
    actionRequired: SimulatedEmail[];
  };
  notion: {
    recentlyUpdated: SimulatedNotionPage[];
    activeOKRs: string[];
  };
  tasks: {
    overdueCount: number;
    dueTodayCount: number;
    dueThisWeekCount: number;
    inProgressCount: number;
    blockedDeals: SimulatedTaskCard[];
  };
}

export function getSimulationSummary(): SimulationSummary {
  const now = today();
  const todayStart = setTime(now, 0, 0).getTime();
  const todayEnd = setTime(now, 23, 59).getTime();
  const weekEnd = addDays(now, 7).getTime();
  
  const events = getSimulatedCalendarEvents();
  const emails = getSimulatedEmails();
  const pages = getSimulatedNotionPages();
  const tasks = getSimulatedTasks();
  
  const todayEvents = events.filter(e => e.startTime >= todayStart && e.startTime <= todayEnd);
  const weekEvents = events.filter(e => e.startTime >= todayStart && e.startTime <= weekEnd);
  const focusEvents = todayEvents.filter(e => e.title.toLowerCase().includes('focus'));
  
  const unreadEmails = emails.filter(e => !e.isRead);
  const highPriorityEmails = emails.filter(e => e.importance === 'high' && !e.isRead);
  
  const overdueTasks = tasks.filter(t => t.dueDate && t.dueDate < todayStart);
  const dueTodayTasks = tasks.filter(t => t.dueDate && t.dueDate >= todayStart && t.dueDate <= todayEnd);
  const dueWeekTasks = tasks.filter(t => t.dueDate && t.dueDate >= todayStart && t.dueDate <= weekEnd);
  const inProgressTasks = tasks.filter(t => t.columnName === 'In Progress');
  
  return {
    calendar: {
      todayMeetings: todayEvents.length,
      thisWeekMeetings: weekEvents.length,
      nextMeeting: todayEvents.find(e => e.startTime > Date.now()),
      focusTimeBlocked: focusEvents.reduce((acc, e) => acc + (e.endTime - e.startTime) / 3600000, 0)
    },
    email: {
      unreadCount: unreadEmails.length,
      highPriorityCount: highPriorityEmails.length,
      actionRequired: highPriorityEmails
    },
    notion: {
      recentlyUpdated: pages.slice(0, 3),
      activeOKRs: ['Achieve Product Market Fit', 'Close Series A Funding', 'Build World Class Team']
    },
    tasks: {
      overdueCount: overdueTasks.length,
      dueTodayCount: dueTodayTasks.length,
      dueThisWeekCount: dueWeekTasks.length,
      inProgressCount: inProgressTasks.length,
      blockedDeals: tasks.filter(t => t.boardName === 'Sales Pipeline' && t.labels.some(l => l.name === 'Hot Lead'))
    }
  };
}

// ============================================================
// PROJECT GENESIS CONTEXT BUILDER
// ============================================================

export interface GenesisContext {
  businessContext: string;
  currentPriorities: string[];
  upcomingDeadlines: { title: string; date: string }[];
  keyMetrics: { name: string; value: string }[];
  teamCapacity: string;
  fundingStatus: string;
}

export function buildGenesisContext(): GenesisContext {
  const summary = getSimulationSummary();
  const tasks = getSimulatedTasks();
  const emails = getSimulatedEmails();
  
  // Extract business context from simulated data
  const hasInvestorActivity = emails.some(e => e.from.email.includes('sequoia'));
  const hasEnterpriseDeals = tasks.some(t => t.labels.some(l => l.name === 'Enterprise'));
  
  return {
    businessContext: `
      Active startup in growth phase. Currently raising Series A funding with strong investor interest.
      Product development ongoing with focus on enterprise features and user onboarding.
      Sales pipeline includes enterprise deals ready to close.
    `.trim(),
    currentPriorities: [
      'Close Series A funding round',
      'Land enterprise customers (BigCorp deal in final stage)',
      'Ship mobile app beta',
      'Hire VP Engineering and VP Sales'
    ],
    upcomingDeadlines: [
      { title: 'Series A Term Sheet Review', date: 'End of month' },
      { title: 'BigCorp Contract Signing', date: 'This week' },
      { title: 'Q1 OKR Review', date: 'End of Q1' },
      { title: 'Board Meeting', date: 'Next month' }
    ],
    keyMetrics: [
      { name: 'DAU', value: '8,500 (target: 10,000)' },
      { name: 'Week 4 Retention', value: '42% (target: 50%)' },
      { name: 'NPS', value: '38 (target: 40)' },
      { name: 'Pipeline Value', value: '$450K' },
      { name: 'Runway', value: '8 months' }
    ],
    teamCapacity: 'Team of 15, hiring 10 more in Q1. Engineering at 80% capacity.',
    fundingStatus: hasInvestorActivity 
      ? 'Series A in progress. Term sheet received from Sequoia, targeting close by end of month.'
      : 'Pre-Series A, preparing for fundraise.'
  };
}
