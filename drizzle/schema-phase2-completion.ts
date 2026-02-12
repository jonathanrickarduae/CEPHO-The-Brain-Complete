// Phase 2 Completion: Missing Database Tables
// These tables complete the A0 Architecture database requirements

import { pgTable, uuid, text, integer, timestamp, json, boolean, varchar } from 'drizzle-orm/pg-core';
import { users } from './schema';

// ===== Chief of Staff Training System =====

export const cosTrainingModules = pgTable("cos_training_modules", {
  id: uuid("id").primaryKey().defaultRandom(),
  moduleNumber: integer("module_number").notNull().unique(), // 1-8
  title: text("title").notNull(),
  objective: text("objective").notNull(),
  duration: integer("duration").notNull(), // hours
  topics: json("topics").$type<string[]>(),
  requiredReading: json("required_reading").$type<string[]>(),
  practicalExercises: json("practical_exercises").$type<any[]>(),
  competencyAssessment: json("competency_assessment").$type<string[]>(),
  prerequisites: json("prerequisites").$type<number[]>(), // module numbers
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const cosModuleProgress = pgTable("cos_module_progress", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  moduleId: uuid("module_id").references(() => cosTrainingModules.id).notNull(),
  status: varchar("status", { length: 50 }).notNull().default('not_started'), // not_started, in_progress, completed
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  progressPercentage: integer("progress_percentage").default(0),
  assessmentScore: integer("assessment_score"), // 0-100
  assessmentAttempts: integer("assessment_attempts").default(0),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ===== Digital Twin System =====

export const digitalTwinProfiles = pgTable("digital_twin_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull().unique(),
  successDNA: json("success_dna").$type<any>(), // 100+ factors
  learningStyle: varchar("learning_style", { length: 50 }),
  communicationPreferences: json("communication_preferences").$type<any>(),
  workingStyle: json("working_style").$type<any>(),
  strengthsWeaknesses: json("strengths_weaknesses").$type<any>(),
  personalityProfile: json("personality_profile").$type<any>(),
  careerAspirations: json("career_aspirations").$type<any>(),
  skillMatrix: json("skill_matrix").$type<any>(),
  experienceLevel: varchar("experience_level", { length: 50 }),
  industryExpertise: json("industry_expertise").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const digitalTwinGoals = pgTable("digital_twin_goals", {
  id: uuid("id").primaryKey().defaultRandom(),
  profileId: uuid("profile_id").references(() => digitalTwinProfiles.id).notNull(),
  goalType: varchar("goal_type", { length: 50 }).notNull(), // short_term, long_term, career, personal
  title: text("title").notNull(),
  description: text("description"),
  targetDate: timestamp("target_date"),
  status: varchar("status", { length: 50 }).default('active'), // active, completed, abandoned
  progressPercentage: integer("progress_percentage").default(0),
  milestones: json("milestones").$type<any[]>(),
  metrics: json("metrics").$type<any>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const digitalTwinPreferences = pgTable("digital_twin_preferences", {
  id: uuid("id").primaryKey().defaultRandom(),
  profileId: uuid("profile_id").references(() => digitalTwinProfiles.id).notNull(),
  category: varchar("category", { length: 100 }).notNull(), // briefing_time, notification_frequency, etc.
  preferenceKey: varchar("preference_key", { length: 100 }).notNull(),
  preferenceValue: json("preference_value").$type<any>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ===== AI-SME Expert Team System =====

export const expertTeams = pgTable("expert_teams", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id").notNull(), // references projectGenesis
  teamName: varchar("team_name", { length: 255 }).notNull(),
  purpose: text("purpose"),
  expertIds: json("expert_ids").$type<string[]>().notNull(), // array of expert IDs
  teamLead: varchar("team_lead", { length: 255 }), // expert ID
  status: varchar("status", { length: 50 }).default('active'), // active, disbanded
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const expertConsultationHistory = pgTable("expert_consultation_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  projectId: uuid("project_id"),
  expertId: varchar("expert_id", { length: 255 }).notNull(),
  expertName: varchar("expert_name", { length: 255 }).notNull(),
  consultationType: varchar("consultation_type", { length: 50 }).notNull(), // individual, team, review
  question: text("question").notNull(),
  context: json("context").$type<any>(),
  response: text("response").notNull(),
  confidence: integer("confidence"), // 0-100
  helpful: boolean("helpful"),
  userFeedback: text("user_feedback"),
  rating: integer("rating"), // 1-5
  duration: integer("duration"), // seconds
  tokensUsed: integer("tokens_used"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ===== Blueprint System =====

export const blueprintParameters = pgTable("blueprint_parameters", {
  id: uuid("id").primaryKey().defaultRandom(),
  executionId: uuid("execution_id").notNull(), // references blueprintExecutions
  parameterKey: varchar("parameter_key", { length: 100 }).notNull(),
  parameterValue: json("parameter_value").$type<any>(),
  parameterType: varchar("parameter_type", { length: 50 }), // string, number, boolean, object
  createdAt: timestamp("created_at").defaultNow(),
});

export const blueprintOutputs = pgTable("blueprint_outputs", {
  id: uuid("id").primaryKey().defaultRandom(),
  executionId: uuid("execution_id").notNull(), // references blueprintExecutions
  outputType: varchar("output_type", { length: 100 }).notNull(), // document, presentation, model, report
  outputFormat: varchar("output_format", { length: 50 }), // pdf, pptx, xlsx, md
  outputName: varchar("output_name", { length: 255 }).notNull(),
  outputPath: text("output_path"), // S3 path or file path
  outputUrl: text("output_url"),
  outputSize: integer("output_size"), // bytes
  metadata: json("metadata").$type<any>(),
  createdAt: timestamp("created_at").defaultNow(),
});

// ===== QMS System =====

export const qmsAuditTrail = pgTable("qms_audit_trail", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id").notNull(),
  eventType: varchar("event_type", { length: 100 }).notNull(), // quality_gate, review, approval, rejection
  eventDescription: text("event_description").notNull(),
  performedBy: uuid("performed_by").references(() => users.id),
  performedByName: varchar("performed_by_name", { length: 255 }),
  phase: varchar("phase", { length: 50 }),
  gateId: varchar("gate_id", { length: 50 }),
  resultId: uuid("result_id"), // references qualityGateResults
  beforeState: json("before_state").$type<any>(),
  afterState: json("after_state").$type<any>(),
  metadata: json("metadata").$type<any>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const qmsComplianceChecks = pgTable("qms_compliance_checks", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id").notNull(),
  checkType: varchar("check_type", { length: 100 }).notNull(), // regulatory, internal, industry_standard
  checkName: varchar("check_name", { length: 255 }).notNull(),
  checkDescription: text("check_description"),
  requirements: json("requirements").$type<any[]>(),
  status: varchar("status", { length: 50 }).default('pending'), // pending, passed, failed, not_applicable
  score: integer("score"), // 0-100
  findings: json("findings").$type<any[]>(),
  recommendations: json("recommendations").$type<any[]>(),
  checkedBy: uuid("checked_by").references(() => users.id),
  checkedAt: timestamp("checked_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
