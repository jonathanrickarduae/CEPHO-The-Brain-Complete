# Integration Readiness Checklist

**Phase 1 | Dev Preview Environment**

This document defines what "integration ready" means for each productivity app. No live integrations are enabled. This serves as the specification for future implementation.

---

## 1. Google Calendar

### Status: CONNECTED (OAuth working)

### Expected Data Inputs
- [ ] Calendar events (title, start, end, location, description)
- [ ] Attendees list with response status
- [ ] Recurring event patterns
- [ ] Calendar metadata (name, timezone, color)
- [ ] Free/busy blocks

### Data Schema
```typescript
interface CalendarEvent {
  id: string;
  calendarId: string;
  title: string;
  description?: string;
  startTime: number;        // UTC timestamp
  endTime: number;          // UTC timestamp
  location?: string;
  isAllDay: boolean;
  recurrence?: string;      // RRULE format
  attendees: {
    email: string;
    name?: string;
    responseStatus: 'accepted' | 'declined' | 'tentative' | 'needsAction';
  }[];
  status: 'confirmed' | 'tentative' | 'cancelled';
  source: 'google' | 'outlook';
}
```

### Trigger Points in System
- [ ] Morning Signal: Pull today's events for schedule section
- [ ] Evening Review: Show completed vs missed meetings
- [ ] Digital Twin: Context for "What's on my calendar today?"
- [ ] Workflow: Auto-create calendar blocks for project deadlines
- [ ] Notifications: 5-min meeting reminders

### Project Genesis Consumption
- [ ] Initial setup: Import existing calendar to understand user's schedule patterns
- [ ] Business hours detection: Analyze when user typically has meetings
- [ ] Conflict detection: Warn if new project deadlines conflict with existing commitments

---

## 2. Gmail

### Status: NOT CONNECTED (OAuth endpoint exists, needs credentials)

### Expected Data Inputs
- [ ] Email metadata (from, to, subject, date, labels)
- [ ] Email body (plain text and HTML)
- [ ] Thread information (conversation grouping)
- [ ] Attachment metadata (filename, size, mime type)
- [ ] Unread count and priority inbox status
- [ ] Contact information from email headers

### Data Schema
```typescript
interface EmailMessage {
  id: string;
  threadId: string;
  from: {
    email: string;
    name?: string;
  };
  to: {
    email: string;
    name?: string;
  }[];
  cc?: {
    email: string;
    name?: string;
  }[];
  subject: string;
  snippet: string;          // First 100 chars
  bodyPlain?: string;
  bodyHtml?: string;
  receivedAt: number;       // UTC timestamp
  isRead: boolean;
  isStarred: boolean;
  labels: string[];
  attachments: {
    filename: string;
    mimeType: string;
    size: number;
  }[];
  importance: 'high' | 'normal' | 'low';
}
```

### Trigger Points in System
- [ ] Morning Signal: Summarize overnight emails, highlight VIP senders
- [ ] Digital Twin: Draft email responses, summarize threads
- [ ] Action Engine: "Reply to this email" creates draft
- [ ] Intelligence Feed: Extract action items from emails
- [ ] Notifications: Alert on emails from VIP contacts

### Project Genesis Consumption
- [ ] Contact extraction: Build contact list from email history
- [ ] Communication patterns: Identify key stakeholders by email frequency
- [ ] Business context: Extract company names, project references from email content

---

## 3. Notion

### Status: NOT CONNECTED (No OAuth endpoint)

### Expected Data Inputs
- [ ] Pages (title, content, parent, created/updated dates)
- [ ] Databases (schema, rows, properties)
- [ ] Blocks (text, headings, lists, toggles, callouts)
- [ ] Comments and mentions
- [ ] Workspace structure (pages hierarchy)

### Data Schema
```typescript
interface NotionPage {
  id: string;
  title: string;
  parentId?: string;
  parentType: 'workspace' | 'page' | 'database';
  createdAt: number;
  updatedAt: number;
  createdBy: string;
  lastEditedBy: string;
  icon?: string;
  cover?: string;
  url: string;
}

interface NotionDatabase {
  id: string;
  title: string;
  parentId?: string;
  properties: {
    name: string;
    type: 'title' | 'text' | 'number' | 'select' | 'multi_select' | 
          'date' | 'checkbox' | 'url' | 'email' | 'phone' | 'relation';
    options?: string[];      // For select/multi_select
  }[];
}

interface NotionDatabaseRow {
  id: string;
  databaseId: string;
  properties: Record<string, any>;
  createdAt: number;
  updatedAt: number;
}
```

### Trigger Points in System
- [ ] Library: Sync Notion pages as documents
- [ ] Workflow: Import Notion databases as project trackers
- [ ] Digital Twin: Search and retrieve Notion content
- [ ] Morning Signal: Surface recently updated pages
- [ ] Action Engine: Create new Notion pages from tasks

### Project Genesis Consumption
- [ ] Knowledge base import: Pull existing documentation into project context
- [ ] Process documentation: Extract SOPs and workflows from Notion
- [ ] Project structure: Mirror Notion database schemas for project setup

---

## 4. Trello (or Equivalent: Asana, Monday.com)

### Status: NOT CONNECTED (No OAuth endpoint)

### Expected Data Inputs
- [ ] Boards (name, description, members)
- [ ] Lists/Columns (name, position)
- [ ] Cards/Tasks (title, description, due date, assignees, labels)
- [ ] Checklists within cards
- [ ] Comments and activity
- [ ] Attachments

### Data Schema
```typescript
interface TaskBoard {
  id: string;
  name: string;
  description?: string;
  source: 'trello' | 'asana' | 'monday';
  members: {
    id: string;
    name: string;
    email?: string;
  }[];
  columns: TaskColumn[];
}

interface TaskColumn {
  id: string;
  boardId: string;
  name: string;
  position: number;
  cardCount: number;
}

interface TaskCard {
  id: string;
  boardId: string;
  columnId: string;
  title: string;
  description?: string;
  position: number;
  dueDate?: number;         // UTC timestamp
  assignees: string[];      // Member IDs
  labels: {
    name: string;
    color: string;
  }[];
  checklists: {
    name: string;
    items: {
      text: string;
      isComplete: boolean;
    }[];
  }[];
  attachmentCount: number;
  commentCount: number;
  createdAt: number;
  updatedAt: number;
}
```

### Trigger Points in System
- [ ] Workflow: Sync boards as project views
- [ ] Morning Signal: Show due today and overdue tasks
- [ ] Evening Review: Tasks completed vs remaining
- [ ] Digital Twin: "What tasks are due this week?"
- [ ] Action Engine: Create cards, move between columns, mark complete

### Project Genesis Consumption
- [ ] Project import: Convert existing Trello boards into Genesis projects
- [ ] Task templates: Extract common task patterns for new project setup
- [ ] Team structure: Identify collaborators and their typical assignments

---

## Integration Readiness Summary

| Integration | OAuth Ready | Schema Defined | Triggers Mapped | Genesis Points |
|-------------|-------------|----------------|-----------------|----------------|
| Google Calendar | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| Gmail | ⚠️ Partial | ✅ Yes | ✅ Yes | ✅ Yes |
| Notion | ❌ No | ✅ Yes | ✅ Yes | ✅ Yes |
| Trello | ❌ No | ✅ Yes | ✅ Yes | ✅ Yes |

---

## Next Steps (Phase 2)

1. **Gmail**: Add Gmail OAuth scopes to existing Google OAuth flow
2. **Notion**: Create OAuth application in Notion developer portal
3. **Trello**: Create Power-Up or use API key authentication
4. **Unified Sync**: Build background sync service for all integrations
5. **Data Pipeline**: Create ETL process to normalize data into unified schema

---

## Database Tables Required

```sql
-- Already exists
integrations (id, userId, provider, accessToken, refreshToken, active, lastSyncAt)

-- To be created
calendar_events (id, userId, integrationId, externalId, title, startTime, endTime, ...)
email_messages (id, userId, integrationId, externalId, threadId, from, subject, ...)
notion_pages (id, userId, integrationId, externalId, title, parentId, content, ...)
task_cards (id, userId, integrationId, externalId, boardId, title, dueDate, ...)
```

---

*Document Version: 1.0*
*Created: 19 January 2026*
*Status: Phase 1 Specification (No Live Integrations)*
