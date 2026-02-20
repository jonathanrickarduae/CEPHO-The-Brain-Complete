import { pgTable, serial, integer, text, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core';

export const emailAccounts = pgTable('email_accounts', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  email: text('email').notNull(),
  provider: text('provider').notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  tokenExpiry: timestamp('token_expiry'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const emails = pgTable('emails', {
  id: serial('id').primaryKey(),
  accountId: integer('account_id').notNull(),
  messageId: text('message_id').notNull(),
  threadId: text('thread_id'),
  subject: text('subject'),
  from: text('from').notNull(),
  to: text('to'),
  body: text('body'),
  snippet: text('snippet'),
  receivedAt: timestamp('received_at'),
  isRead: boolean('is_read').default(false),
  labels: jsonb('labels'),
  priority: text('priority'),
  category: text('category'),
  sentiment: text('sentiment'),
  actionItems: jsonb('action_items'),
  createdAt: timestamp('created_at').defaultNow()
});
