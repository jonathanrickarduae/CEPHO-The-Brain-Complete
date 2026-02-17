import { pgTable, serial, text, timestamp, varchar, jsonb } from "drizzle-orm/pg-core";

/**
 * Workflow instances - tracks active and completed workflows
 */
export const cephoWorkflows = pgTable("cepho_workflows", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  skillType: varchar("skillType", { length: 100 }).notNull(), // project_genesis, ai_sme, etc.
  status: varchar("status", { length: 50 }).notNull().default("not_started"), // not_started, in_progress, paused, completed, failed
  currentPhase: varchar("currentPhase", { length: 100 }),
  currentStep: varchar("currentStep", { length: 100 }),
  data: jsonb("data"), // Workflow-specific data
  metadata: jsonb("metadata"), // Additional metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type CephoWorkflow = typeof cephoWorkflows.$inferSelect;
export type InsertCephoWorkflow = typeof cephoWorkflows.$inferInsert;

/**
 * Workflow steps - tracks progress through workflow steps
 */
export const cephoWorkflowSteps = pgTable("cepho_workflow_steps", {
  id: serial("id").primaryKey(),
  workflowId: serial("workflowId").notNull(),
  stepNumber: serial("stepNumber").notNull(),
  stepName: varchar("stepName", { length: 255 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, in_progress, completed, skipped, failed
  data: jsonb("data"), // Step-specific data
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type CephoWorkflowStep = typeof cephoWorkflowSteps.$inferSelect;
export type InsertCephoWorkflowStep = typeof cephoWorkflowSteps.$inferInsert;

/**
 * Workflow validations - tracks validation results for audit trail
 */
export const cephoWorkflowValidations = pgTable("cepho_workflow_validations", {
  id: serial("id").primaryKey(),
  workflowId: serial("workflowId").notNull(),
  stepId: serial("stepId"),
  validationType: varchar("validationType", { length: 100 }).notNull(),
  result: varchar("result", { length: 50 }).notNull(), // pass, fail, warning
  message: text("message"),
  details: jsonb("details"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CephoWorkflowValidation = typeof cephoWorkflowValidations.$inferSelect;
export type InsertCephoWorkflowValidation = typeof cephoWorkflowValidations.$inferInsert;
