import { pgTable, text, timestamp, boolean, uuid } from "drizzle-orm/pg-core";

/**
 * Governance Mode Settings
 * Controls whether the platform operates in "Everything Mode" or "Governed Mode"
 */
export const governanceSettings = pgTable("governance_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  mode: text("mode").notNull().default("everything"), // 'everything' or 'governed'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Approved API Keys and Integrations
 * Stores which external services are approved for use in Governed Mode
 */
export const approvedIntegrations = pgTable("approved_integrations", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  serviceName: text("service_name").notNull(), // 'copilot', 'outlook', 'openai', etc.
  serviceType: text("service_type").notNull(), // 'ai', 'email', 'productivity', etc.
  apiKey: text("api_key"), // Encrypted API key
  isApproved: boolean("is_approved").default(false).notNull(),
  approvedBy: text("approved_by"), // Admin/Chief of Staff who approved
  approvedAt: timestamp("approved_at"),
  description: text("description"), // What this integration is used for
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Integration Usage Logs
 * Tracks which integrations are being used for audit purposes
 */
export const integrationUsageLogs = pgTable("integration_usage_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  integrationId: uuid("integration_id").notNull(),
  serviceName: text("service_name").notNull(),
  action: text("action").notNull(), // 'api_call', 'data_access', etc.
  success: boolean("success").notNull(),
  errorMessage: text("error_message"),
  metadata: text("metadata"), // JSON string with additional context
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});
