import { pgTable, uuid, text, timestamp, boolean, integer, jsonb } from 'drizzle-orm/pg-core';
import { users } from '../schema';

// Email Accounts table
export const emailAccounts = pgTable('email_accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  emailAddress: text('email_address').notNull(),
  provider: text('provider').notNull().default('gmail'), // 'gmail', 'outlook', 'imap'
  displayName: text('display_name'),
  
  // OAuth tokens (encrypted in database)
  oauthAccessToken: text('oauth_access_token'),
  oauthRefreshToken: text('oauth_refresh_token'),
  oauthTokenExpiresAt: timestamp('oauth_token_expires_at'),
  oauthScope: text('oauth_scope'),
  
  // Account metadata
  company: text('company'),
  isPrimary: boolean('is_primary').default(false),
  isActive: boolean('is_active').default(true),
  
  // Sync status
  lastSyncAt: timestamp('last_sync_at'),
  lastSyncStatus: text('last_sync_status'), // 'success', 'failed', 'in_progress'
  lastSyncError: text('last_sync_error'),
  syncEnabled: boolean('sync_enabled').default(true),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Emails table
export const emails = pgTable('emails', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  accountId: uuid('account_id').notNull().references(() => emailAccounts.id, { onDelete: 'cascade' }),
  
  // Email identifiers
  messageId: text('message_id').notNull(),
  threadId: text('thread_id'),
  
  // Email metadata
  fromEmail: text('from_email').notNull(),
  fromName: text('from_name'),
  toEmails: text('to_emails').array().notNull(),
  ccEmails: text('cc_emails').array(),
  bccEmails: text('bcc_emails').array(),
  replyTo: text('reply_to'),
  
  // Content
  subject: text('subject'),
  bodyText: text('body_text'),
  bodyHtml: text('body_html'),
  snippet: text('snippet'),
  
  // Timestamps
  receivedAt: timestamp('received_at').notNull(),
  sentAt: timestamp('sent_at'),
  
  // Status flags
  isRead: boolean('is_read').default(false),
  isStarred: boolean('is_starred').default(false),
  isArchived: boolean('is_archived').default(false),
  isDeleted: boolean('is_deleted').default(false),
  isSpam: boolean('is_spam').default(false),
  isDraft: boolean('is_draft').default(false),
  
  // AI Analysis
  priority: text('priority'), // 'urgent', 'high', 'normal', 'low'
  category: text('category'), // 'project', 'personal', 'finance', etc.
  sentiment: text('sentiment'), // 'positive', 'neutral', 'negative'
  actionItems: text('action_items').array(),
  aiSummary: text('ai_summary'),
  aiAnalyzedAt: timestamp('ai_analyzed_at'),
  
  // Attachments
  hasAttachments: boolean('has_attachments').default(false),
  attachmentCount: integer('attachment_count').default(0),
  attachmentNames: text('attachment_names').array(),
  
  // Labels/Tags
  labels: text('labels').array(),
  
  // Sync metadata
  syncedAt: timestamp('synced_at').defaultNow(),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Email Tasks table
export const emailTasks = pgTable('email_tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  emailId: uuid('email_id').notNull().references(() => emails.id, { onDelete: 'cascade' }),
  taskId: uuid('task_id'), // References tasks table
  todoistTaskId: text('todoist_task_id'),
  asanaTaskId: text('asana_task_id'),
  
  taskTitle: text('task_title').notNull(),
  taskDescription: text('task_description'),
  taskPriority: text('task_priority'),
  taskDueDate: timestamp('task_due_date'),
  
  createdAt: timestamp('created_at').defaultNow(),
});

// Email Threads table
export const emailThreads = pgTable('email_threads', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  threadId: text('thread_id').notNull(),
  
  subject: text('subject'),
  participants: text('participants').array(),
  messageCount: integer('message_count').default(0),
  
  firstMessageAt: timestamp('first_message_at'),
  lastMessageAt: timestamp('last_message_at'),
  
  isRead: boolean('is_read').default(false),
  isStarred: boolean('is_starred').default(false),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Type exports
export type EmailAccount = typeof emailAccounts.$inferSelect;
export type NewEmailAccount = typeof emailAccounts.$inferInsert;

export type Email = typeof emails.$inferSelect;
export type NewEmail = typeof emails.$inferInsert;

export type EmailTask = typeof emailTasks.$inferSelect;
export type NewEmailTask = typeof emailTasks.$inferInsert;

export type EmailThread = typeof emailThreads.$inferSelect;
export type NewEmailThread = typeof emailThreads.$inferInsert;
