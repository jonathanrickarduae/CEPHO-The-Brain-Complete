import { gmailService } from './gmail.service';
import { todoistService } from './todoist.service';
import { innovationHubAggregationService } from './innovation-hub-aggregation.service';
import { projectGenesisAggregationService } from './project-genesis-aggregation.service';
import { documentLibraryAggregationService } from './document-library-aggregation.service';
import { getDb } from '../db';
import { emails, emailAccounts } from '../../drizzle/schema/email.schema';
import { eq, and, desc, gte } from 'drizzle-orm';
import { logger } from '../utils/logger';

const log = logger.module('DataAggregationService');

export interface AggregatedEmail {
  id: string;
  from: string;
  subject: string;
  snippet: string;
  receivedAt: Date;
  isRead: boolean;
  isStarred: boolean;
  priority?: string;
  category?: string;
  actionItems?: string[];
  account: string;
}

export interface AggregatedTask {
  id: string;
  title: string;
  description?: string;
  priority: 'urgent' | 'high' | 'normal' | 'low';
  dueDate?: Date;
  isCompleted: boolean;
  source: 'todoist' | 'asana' | 'genesis' | 'email';
  project?: string;
  labels?: string[];
}

export interface AggregatedData {
  emails: AggregatedEmail[];
  tasks: AggregatedTask[];
  stats: {
    emailsUnread: number;
    emailsUrgent: number;
    tasksOverdue: number;
    tasksDueToday: number;
    tasksHighPriority: number;
  };
  aggregatedAt: Date;
}

export class DataAggregationService {
  
  /**
   * Aggregate emails from all accounts
   */
  async aggregateEmails(userId: string, options?: {
    limit?: number;
    unreadOnly?: boolean;
    since?: Date;
  }): Promise<AggregatedEmail[]> {
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    
    try {
      const conditions = [eq(emails.userId, userId)];
      
      if (options?.unreadOnly) {
        conditions.push(eq(emails.isRead, false));
      }
      
      if (options?.since) {
        conditions.push(gte(emails.receivedAt, options.since));
      }
      
      const userEmails = await db
        .select({
          email: emails,
          account: emailAccounts,
        })
        .from(emails)
        .leftJoin(emailAccounts, eq(emails.accountId, emailAccounts.id))
        .where(and(...conditions))
        .orderBy(desc(emails.receivedAt))
        .limit(options?.limit || 100);
      
      return userEmails.map(({ email, account }) => ({
        id: email.id,
        from: email.fromEmail,
        subject: email.subject || '(no subject)',
        snippet: email.snippet || email.aiSummary || '',
        receivedAt: email.receivedAt,
        isRead: email.isRead,
        isStarred: email.isStarred,
        priority: email.priority || undefined,
        category: email.category || undefined,
        actionItems: email.actionItems || undefined,
        account: account?.emailAddress || 'unknown',
      }));
    } catch (error: any) {
      log.error('Failed to aggregate emails:', error);
      return [];
    }
  }
  
  /**
   * Aggregate tasks from all sources
   */
  async aggregateTasks(userId: string): Promise<AggregatedTask[]> {
    const tasks: AggregatedTask[] = [];
    
    // Get Todoist tasks
    try {
      const todoistTasks = await todoistService.getTasks();
      
      for (const task of todoistTasks) {
        if (task.is_completed) continue;
        
        tasks.push({
          id: task.id,
          title: task.content,
          description: task.description || undefined,
          priority: todoistService.convertPriority(task.priority),
          dueDate: task.due?.datetime ? new Date(task.due.datetime) : 
                   task.due?.date ? new Date(task.due.date) : undefined,
          isCompleted: task.is_completed,
          source: 'todoist',
          labels: task.labels,
        });
      }
      
      log.info(`Aggregated ${todoistTasks.length} Todoist tasks`);
    } catch (error: any) {
      log.error('Failed to get Todoist tasks:', error);
    }
    
    // TODO: Add Asana tasks
    // TODO: Add Project Genesis tasks
    // TODO: Add tasks from emails
    
    return tasks;
  }
  
  /**
   * Aggregate all data for a user
   */
  async aggregateAll(userId: string): Promise<AggregatedData> {
    log.info(`Aggregating all data for user ${userId}`);
    
    const [emails, tasks] = await Promise.all([
      this.aggregateEmails(userId, { limit: 100 }),
      this.aggregateTasks(userId),
    ]);
    
    // Calculate stats
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const stats = {
      emailsUnread: emails.filter(e => !e.isRead).length,
      emailsUrgent: emails.filter(e => e.priority === 'urgent' || e.priority === 'high').length,
      tasksOverdue: tasks.filter(t => t.dueDate && t.dueDate < today && !t.isCompleted).length,
      tasksDueToday: tasks.filter(t => t.dueDate && t.dueDate >= today && t.dueDate < tomorrow && !t.isCompleted).length,
      tasksHighPriority: tasks.filter(t => (t.priority === 'urgent' || t.priority === 'high') && !t.isCompleted).length,
    };
    
    log.info(`Aggregation complete: ${emails.length} emails, ${tasks.length} tasks`);
    
    return {
      emails,
      tasks,
      stats,
      aggregatedAt: new Date(),
    };
  }
  
  /**
   * Get summary for Chief of Staff
   */
  async getSummary(userId: string): Promise<string> {
    const data = await this.aggregateAll(userId);
    
    const summary = `
## Data Summary

**Emails:**
- Total: ${data.emails.length}
- Unread: ${data.stats.emailsUnread}
- Urgent/High Priority: ${data.stats.emailsUrgent}

**Tasks:**
- Total Active: ${data.tasks.length}
- Overdue: ${data.stats.tasksOverdue}
- Due Today: ${data.stats.tasksDueToday}
- High Priority: ${data.stats.tasksHighPriority}

**Top Priority Emails:**
${data.emails
  .filter(e => !e.isRead && (e.priority === 'urgent' || e.priority === 'high'))
  .slice(0, 5)
  .map(e => `- From: ${e.from}\n  Subject: ${e.subject}\n  Account: ${e.account}`)
  .join('\n\n') || '(none)'}

**Urgent Tasks:**
${data.tasks
  .filter(t => t.priority === 'urgent' && !t.isCompleted)
  .slice(0, 5)
  .map(t => `- ${t.title}${t.dueDate ? ` (Due: ${t.dueDate.toLocaleDateString()})` : ''}\n  Source: ${t.source}`)
  .join('\n\n') || '(none)'}

**Overdue Tasks:**
${data.tasks
  .filter(t => t.dueDate && t.dueDate < new Date() && !t.isCompleted)
  .slice(0, 5)
  .map(t => `- ${t.title} (Due: ${t.dueDate.toLocaleDateString()})\n  Source: ${t.source}`)
  .join('\n\n') || '(none)'}
`;
    
    return summary.trim();
  }
  
  /**
   * Get context for Chief of Staff AI
   */
  async getContext(userId: string): Promise<string> {
    const data = await this.aggregateAll(userId);
    
    // Get additional context from all sources
    const [innovationContext, projectsContext, documentsContext] = await Promise.all([
      innovationHubAggregationService.getContext(userId),
      projectGenesisAggregationService.getContext(userId),
      documentLibraryAggregationService.getContext(userId),
    ]);
    
    const context = `
# User Context for Chief of Staff

## Current Date: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}

## Email Summary
- **Total Emails:** ${data.emails.length}
- **Unread:** ${data.stats.emailsUnread}
- **Urgent/High Priority:** ${data.stats.emailsUrgent}

### Recent Important Emails (Last 24 hours)
${data.emails
  .filter(e => {
    const dayAgo = new Date();
    dayAgo.setDate(dayAgo.getDate() - 1);
    return e.receivedAt >= dayAgo && (!e.isRead || e.priority === 'urgent' || e.priority === 'high');
  })
  .slice(0, 10)
  .map(e => `
**From:** ${e.from} (${e.account})
**Subject:** ${e.subject}
**Priority:** ${e.priority || 'normal'}
**Category:** ${e.category || 'uncategorized'}
**Read:** ${e.isRead ? 'Yes' : 'No'}
**Summary:** ${e.snippet}
${e.actionItems && e.actionItems.length > 0 ? `**Action Items:** ${e.actionItems.join(', ')}` : ''}
`)
  .join('\n---\n') || '(no recent important emails)'}

## Task Summary
- **Total Active Tasks:** ${data.tasks.length}
- **Overdue:** ${data.stats.tasksOverdue}
- **Due Today:** ${data.stats.tasksDueToday}
- **High Priority:** ${data.stats.tasksHighPriority}

### Tasks Requiring Attention
${data.tasks
  .filter(t => !t.isCompleted && (
    (t.dueDate && t.dueDate < new Date()) || // Overdue
    (t.dueDate && t.dueDate.toDateString() === new Date().toDateString()) || // Due today
    t.priority === 'urgent' || t.priority === 'high' // High priority
  ))
  .sort((a, b) => {
    // Sort by: overdue first, then by priority, then by due date
    if (a.dueDate && a.dueDate < new Date() && !(b.dueDate && b.dueDate < new Date())) return -1;
    if (b.dueDate && b.dueDate < new Date() && !(a.dueDate && a.dueDate < new Date())) return 1;
    
    const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    
    if (a.dueDate && b.dueDate) return a.dueDate.getTime() - b.dueDate.getTime();
    return 0;
  })
  .slice(0, 15)
  .map(t => `
**Task:** ${t.title}
**Priority:** ${t.priority}
**Due:** ${t.dueDate ? t.dueDate.toLocaleDateString() : 'No due date'}
**Source:** ${t.source}
${t.description ? `**Description:** ${t.description}` : ''}
${t.labels && t.labels.length > 0 ? `**Labels:** ${t.labels.join(', ')}` : ''}
`)
  .join('\n---\n') || '(no urgent tasks)'}

---

${innovationContext}

---

${projectsContext}

---

${documentsContext}
`;
    
    return context.trim();
  }
}

export const dataAggregationService = new DataAggregationService();
