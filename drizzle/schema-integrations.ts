import { pgTable, text, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core';

// Integration credentials table
export const integrationCredentials = pgTable('integration_credentials', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  service: text('service').notNull(), // 'notion', 'github', 'openai', etc.
  email: text('email'),
  password: text('password'), // Encrypted
  apiKey: text('api_key'), // Encrypted
  apiSecret: text('api_secret'), // Encrypted
  accessToken: text('access_token'), // Encrypted, for OAuth
  refreshToken: text('refresh_token'), // Encrypted, for OAuth
  tokenExpiry: timestamp('token_expiry'),
  metadata: jsonb('metadata'), // Service-specific data
  status: text('status').notNull().default('disconnected'), // 'connected', 'disconnected', 'error', 'pending'
  lastChecked: timestamp('last_checked'),
  lastError: text('last_error'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Integration connection logs
export const integrationLogs = pgTable('integration_logs', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  service: text('service').notNull(),
  action: text('action').notNull(), // 'connect', 'disconnect', 'test', 'sync', 'error'
  success: boolean('success').notNull(),
  errorMessage: text('error_message'),
  metadata: jsonb('metadata'),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});
