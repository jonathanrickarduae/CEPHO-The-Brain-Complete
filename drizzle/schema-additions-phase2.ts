import { mysqlTable, int, varchar, text, timestamp, json, mysqlEnum, float, boolean } from "drizzle-orm/mysql-core";

/**
 * PHASE 2 SCHEMA ADDITIONS
 * Architecture Alignment - Project Genesis 6-Phase Workflow
 */

/**
 * Project Genesis Phases - 6-phase venture development workflow
 * Phase 1: Initiation
 * Phase 2: Deep Dive
 * Phase 3: Business Plan
 * Phase 4: Expert Review
 * Phase 5: Quality Gate
 * Phase 6: Execution
 */
export const projectGenesisPhases = mysqlTable("project_genesis_phases", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(), // FK to project_genesis
  phaseNumber: int("phaseNumber").notNull(), // 1-6
  phaseName: varchar("phaseName", { length: 100 }).notNull(),
  status: mysqlEnum("status", ["not_started", "in_progress", "completed", "blocked"]).default("not_started").notNull(),
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  assignedTeam: json("assignedTeam"), // Array of user IDs and expert IDs
  deliverables: json("deliverables"), // Array of deliverable objects
  notes: text("notes"),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ProjectGenesisPhase = typeof projectGenesisPhases.$inferSelect;
export type InsertProjectGenesisPhase = typeof projectGenesisPhases.$inferInsert;

/**
 * Project Genesis Milestones - key milestones within each phase
 */
export const projectGenesisMilestones = mysqlTable("project_genesis_milestones", {
  id: int("id").autoincrement().primaryKey(),
  phaseId: int("phaseId").notNull(), // FK to project_genesis_phases
  projectId: int("projectId").notNull(), // FK to project_genesis
  milestoneName: varchar("milestoneName", { length: 200 }).notNull(),
  description: text("description"),
  dueDate: timestamp("dueDate"),
  status: mysqlEnum("status", ["pending", "in_progress", "completed", "overdue"]).default("pending").notNull(),
  completedAt: timestamp("completedAt"),
  completedBy: int("completedBy"), // User ID
  notes: text("notes"),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ProjectGenesisMilestone = typeof projectGenesisMilestones.$inferSelect;
export type InsertProjectGenesisMilestone = typeof projectGenesisMilestones.$inferInsert;

/**
 * Project Genesis Deliverables - outputs from each phase
 */
export const projectGenesisDeliverables = mysqlTable("project_genesis_deliverables", {
  id: int("id").autoincrement().primaryKey(),
  phaseId: int("phaseId").notNull(), // FK to project_genesis_phases
  projectId: int("projectId").notNull(), // FK to project_genesis
  deliverableName: varchar("deliverableName", { length: 200 }).notNull(),
  deliverableType: varchar("deliverableType", { length: 100 }).notNull(), // "document", "presentation", "model", "report"
  description: text("description"),
  fileUrl: varchar("fileUrl", { length: 500 }),
  status: mysqlEnum("status", ["draft", "review", "approved", "rejected"]).default("draft").notNull(),
  createdBy: int("createdBy"), // User ID
  reviewedBy: int("reviewedBy"), // User ID
  approvedBy: int("approvedBy"), // User ID
  reviewNotes: text("reviewNotes"),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ProjectGenesisDeliverable = typeof projectGenesisDeliverables.$inferSelect;
export type InsertProjectGenesisDeliverable = typeof projectGenesisDeliverables.$inferInsert;

/**
 * Quality Gate Criteria - specific criteria for each gate (G1-G6)
 */
export const qualityGateCriteria = mysqlTable("quality_gate_criteria", {
  id: int("id").autoincrement().primaryKey(),
  gateNumber: int("gateNumber").notNull(), // 1-6 (G1-G6)
  gateName: varchar("gateName", { length: 100 }).notNull(),
  criteriaName: varchar("criteriaName", { length: 200 }).notNull(),
  description: text("description"),
  weight: float("weight").default(1.0), // Importance weight
  passingScore: int("passingScore").default(70), // Minimum score to pass
  evaluationType: varchar("evaluationType", { length: 50 }).notNull(), // "automated", "manual", "hybrid"
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type QualityGateCriteria = typeof qualityGateCriteria.$inferSelect;
export type InsertQualityGateCriteria = typeof qualityGateCriteria.$inferInsert;

/**
 * Quality Gate Results - evaluation results for each project
 */
export const qualityGateResults = mysqlTable("quality_gate_results", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(), // FK to project_genesis
  gateNumber: int("gateNumber").notNull(), // 1-6
  criteriaId: int("criteriaId").notNull(), // FK to quality_gate_criteria
  score: int("score").notNull(), // 0-100
  passed: boolean("passed").notNull(),
  evaluatedBy: int("evaluatedBy"), // User ID or "system"
  evaluationNotes: text("evaluationNotes"),
  evidence: json("evidence"), // Supporting evidence/documents
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type QualityGateResult = typeof qualityGateResults.$inferSelect;
export type InsertQualityGateResult = typeof qualityGateResults.$inferInsert;

/**
 * Blueprint Library - master library of all blueprints
 */
export const blueprintLibrary = mysqlTable("blueprint_library", {
  id: int("id").autoincrement().primaryKey(),
  blueprintCode: varchar("blueprintCode", { length: 50 }).notNull().unique(), // e.g., "BP-001"
  title: varchar("title", { length: 300 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  description: text("description"),
  objectives: json("objectives"), // Array of objectives
  phases: json("phases"), // Array of phase objects
  deliverables: json("deliverables"), // Array of deliverable templates
  resources: json("resources"), // Required resources
  estimatedDuration: int("estimatedDuration"), // Hours
  complexity: mysqlEnum("complexity", ["low", "medium", "high"]).default("medium"),
  tags: json("tags"), // Array of tags
  fileUrl: varchar("fileUrl", { length: 500 }),
  version: varchar("version", { length: 20 }).default("1.0"),
  status: mysqlEnum("status", ["draft", "active", "deprecated"]).default("active").notNull(),
  createdBy: int("createdBy"),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Blueprint = typeof blueprintLibrary.$inferSelect;
export type InsertBlueprint = typeof blueprintLibrary.$inferInsert;

/**
 * Blueprint Executions - instances of blueprints being executed
 */
export const blueprintExecutions = mysqlTable("blueprint_executions", {
  id: int("id").autoincrement().primaryKey(),
  blueprintId: int("blueprintId").notNull(), // FK to blueprint_library
  projectId: int("projectId"), // FK to project_genesis (optional)
  userId: int("userId").notNull(),
  executionName: varchar("executionName", { length: 300 }).notNull(),
  status: mysqlEnum("status", ["planning", "in_progress", "completed", "paused", "cancelled"]).default("planning").notNull(),
  currentPhase: int("currentPhase").default(1),
  progress: int("progress").default(0), // 0-100
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  phaseData: json("phaseData"), // Current state of each phase
  deliverableData: json("deliverableData"), // Generated deliverables
  notes: text("notes"),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BlueprintExecution = typeof blueprintExecutions.$inferSelect;
export type InsertBlueprintExecution = typeof blueprintExecutions.$inferInsert;
