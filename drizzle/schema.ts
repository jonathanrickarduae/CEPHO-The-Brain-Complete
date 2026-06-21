import {
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
  boolean,
} from "drizzle-orm/pg-core";

// ─── Enums ────────────────────────────────────────────────────────────────────
export const roleEnum = pgEnum("role", ["user", "admin"]);
export const priorityEnum = pgEnum("priority", ["low", "medium", "high", "critical"]);
export const taskStatusEnum = pgEnum("task_status", ["todo", "in_progress", "done", "blocked"]);
export const decisionStatusEnum = pgEnum("decision_status", ["active", "superseded", "reversed"]);
export const impactEnum = pgEnum("impact", ["low", "medium", "high", "critical"]);
export const projectStatusEnum = pgEnum("project_status", ["red", "amber", "green"]);
export const genesisStageEnum = pgEnum("genesis_stage", ["concept", "market", "model", "team", "risk", "execution", "complete"]);
export const genesisRecommendationEnum = pgEnum("genesis_recommendation", ["proceed", "pivot", "pause", "stop"]);
export const innovationCategoryEnum = pgEnum("innovation_category", ["product", "process", "market", "technology", "partnership", "other"]);
export const innovationStatusEnum = pgEnum("innovation_status", ["idea", "exploring", "testing", "adopted", "archived"]);
export const learningSourceEnum = pgEnum("learning_source", ["victoria", "sme", "genesis", "project", "user"]);
export const victoriaStyleEnum = pgEnum("victoria_style", ["direct", "detailed", "brief"]);

// ─── Users ────────────────────────────────────────────────────────────────────
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Projects ────────────────────────────────────────────────────────────────
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 128 }).notNull(),
  description: text("description"),
  status: projectStatusEnum("status").default("green").notNull(),
  accentColor: varchar("accentColor", { length: 16 }).default("#00D4FF").notNull(),
  initials: varchar("initials", { length: 4 }).notNull(),
  overview: text("overview"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});
export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

// ─── Project Genesis Assessments ─────────────────────────────────────────────
export const genesisAssessments = pgTable("genesis_assessments", {
  id: serial("id").primaryKey(),
  ideaTitle: varchar("ideaTitle", { length: 256 }).notNull(),
  ideaSummary: text("ideaSummary").notNull(),
  stage: genesisStageEnum("stage").default("concept").notNull(),
  answers: text("answers").default("{}").notNull(),
  aiAnalysis: text("aiAnalysis").default("{}").notNull(),
  overallScore: integer("overallScore"),
  recommendation: genesisRecommendationEnum("recommendation"),
  convertedToProjectId: integer("convertedToProjectId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});
export type GenesisAssessment = typeof genesisAssessments.$inferSelect;

// ─── Innovation Hub ───────────────────────────────────────────────────────────
export const innovations = pgTable("innovations", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 256 }).notNull(),
  description: text("description"),
  category: innovationCategoryEnum("category").default("other").notNull(),
  status: innovationStatusEnum("status").default("idea").notNull(),
  linkedProjectId: integer("linkedProjectId"),
  aiInsight: text("aiInsight"),
  tags: text("tags").default("[]").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});
export type Innovation = typeof innovations.$inferSelect;

// ─── AI SMEs ─────────────────────────────────────────────────────────────────
export const aiSmes = pgTable("ai_smes", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  title: varchar("title", { length: 256 }).notNull(),
  domain: varchar("domain", { length: 64 }).notNull(),
  subDomain: varchar("subDomain", { length: 128 }),
  expertise: text("expertise").default("[]").notNull(),
  systemPrompt: text("systemPrompt").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  consultCount: integer("consultCount").default(0).notNull(),
  avgRating: integer("avgRating"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type AiSme = typeof aiSmes.$inferSelect;

// ─── Consultations ────────────────────────────────────────────────────────────
export const consultations = pgTable("consultations", {
  id: serial("id").primaryKey(),
  smeId: integer("smeId").notNull(),
  smeName: varchar("smeName", { length: 128 }).notNull(),
  projectId: integer("projectId"),
  messages: text("messages").default("[]").notNull(),
  rating: integer("rating"),
  feedback: text("feedback"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});
export type Consultation = typeof consultations.$inferSelect;

// ─── Documents ───────────────────────────────────────────────────────────────
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  projectId: integer("projectId"),
  name: varchar("name", { length: 256 }).notNull(),
  fileType: varchar("fileType", { length: 16 }).notNull(),
  fileSize: integer("fileSize"),
  storageKey: varchar("storageKey", { length: 512 }).notNull(),
  storageUrl: text("storageUrl"),
  isConfidential: boolean("isConfidential").default(false).notNull(),
  uploadedBy: varchar("uploadedBy", { length: 64 }),
  tags: text("tags").default("[]").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});
export type Document = typeof documents.$inferSelect;

// ─── The Vault — Constant Learning ───────────────────────────────────────────
export const learningEntries = pgTable("learning_entries", {
  id: serial("id").primaryKey(),
  source: learningSourceEnum("source").notNull(),
  sourceId: varchar("sourceId", { length: 64 }),
  category: varchar("category", { length: 64 }).notNull(),
  insight: text("insight").notNull(),
  context: text("context").default("{}").notNull(),
  confidence: integer("confidence").default(50).notNull(),
  appliedCount: integer("appliedCount").default(0).notNull(),
  isVerified: boolean("isVerified").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type LearningEntry = typeof learningEntries.$inferSelect;

// ─── Victoria Conversations ───────────────────────────────────────────────────
export const victoriaConversations = pgTable("victoria_conversations", {
  id: serial("id").primaryKey(),
  projectId: integer("projectId"),
  context: varchar("context", { length: 64 }).default("general").notNull(),
  messages: text("messages").default("[]").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});
export type VictoriaConversation = typeof victoriaConversations.$inferSelect;

// ─── Tasks ───────────────────────────────────────────────────────────────────
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 256 }).notNull(),
  description: text("description").default(""),
  projectId: integer("projectId"),
  assignee: varchar("assignee", { length: 128 }).default(""),
  dueDate: timestamp("dueDate"),
  priority: priorityEnum("priority").default("medium").notNull(),
  status: taskStatusEnum("status").default("todo").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});
export type Task = typeof tasks.$inferSelect;

// ─── Decisions ────────────────────────────────────────────────────────────────
export const decisions = pgTable("decisions", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 256 }).notNull(),
  context: text("context").default(""),
  rationale: text("rationale").default(""),
  outcome: text("outcome").default(""),
  projectId: integer("projectId"),
  impact: impactEnum("impact").default("medium").notNull(),
  status: decisionStatusEnum("status").default("active").notNull(),
  madeBy: varchar("madeBy", { length: 128 }).default("Jonathan"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});
export type Decision = typeof decisions.$inferSelect;

// ─── Calendar Events ──────────────────────────────────────────────────────────
export const calendarEvents = pgTable("calendar_events", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 256 }).notNull(),
  startTime: timestamp("startTime").notNull(),
  endTime: timestamp("endTime").notNull(),
  projectSlug: varchar("projectSlug", { length: 64 }).default(""),
  location: varchar("location", { length: 256 }).default(""),
  notes: text("notes").default(""),
  isAllDay: boolean("isAllDay").default(false).notNull(),
  source: varchar("source", { length: 32 }).default("manual").notNull(),
  externalId: varchar("externalId", { length: 256 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type CalendarEvent = typeof calendarEvents.$inferSelect;

// ─── Financial Data ───────────────────────────────────────────────────────────
export const financialData = pgTable("financial_data", {
  id: serial("id").primaryKey(),
  companySlug: varchar("companySlug", { length: 64 }).notNull().unique(),
  companyName: varchar("companyName", { length: 128 }).notNull(),
  cashGbp: integer("cashGbp").default(0).notNull(),
  burnMonthlyGbp: integer("burnMonthlyGbp").default(0).notNull(),
  revenueMonthlyGbp: integer("revenueMonthlyGbp").default(0).notNull(),
  notes: text("notes").default(""),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});
export type FinancialData = typeof financialData.$inferSelect;

// ─── Settings ─────────────────────────────────────────────────────────────────
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().unique(),
  victoriaStyle: victoriaStyleEnum("victoriaStyle").default("direct").notNull(),
  victoriaAutobrief: boolean("victoriaAutobrief").default(true).notNull(),
  notificationsEmail: boolean("notificationsEmail").default(true).notNull(),
  notificationsPush: boolean("notificationsPush").default(true).notNull(),
  googleCalendarConnected: boolean("googleCalendarConnected").default(false).notNull(),
  outlookConnected: boolean("outlookConnected").default(false).notNull(),
  gmailConnected: boolean("gmailConnected").default(false).notNull(),
  timezone: varchar("timezone", { length: 64 }).default("Europe/London").notNull(),
  currency: varchar("currency", { length: 8 }).default("GBP").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});
export type Settings = typeof settings.$inferSelect;

// ─── Additional tables required by sub-routers ────────────────────────────────

export const activityFeed = pgTable("activity_feed", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  type: varchar("type", { length: 100 }).notNull().default("activity"),
  title: text("title").notNull().default(""),
  description: text("description"),
  metadata: text("metadata"),
  actorType: varchar("actor_type", { length: 64 }),
  actorName: varchar("actor_name", { length: 128 }),
  action: varchar("action", { length: 100 }),
  targetType: varchar("target_type", { length: 100 }),
  targetId: integer("target_id"),
  targetName: varchar("target_name", { length: 256 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const agentInsights = pgTable("agent_insights", {
  id: serial("id").primaryKey(),
  agentId: varchar("agent_id", { length: 100 }).notNull(),
  agentName: varchar("agent_name", { length: 255 }).notNull(),
  insight: text("insight").notNull(),
  category: varchar("category", { length: 100 }),
  confidence: integer("confidence").default(80),
  createdAt: timestamp("created_at").defaultNow(),
});

export const agentImprovements = pgTable("agent_improvements", {
  id: serial("id").primaryKey(),
  agentId: varchar("agent_id", { length: 100 }).notNull(),
  suggestion: text("suggestion").notNull(),
  status: varchar("status", { length: 50 }).default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const agentDailyReports = pgTable("agent_daily_reports", {
  id: serial("id").primaryKey(),
  agentId: varchar("agent_id", { length: 100 }).notNull(),
  reportDate: timestamp("report_date").defaultNow(),
  summary: text("summary").notNull(),
  tasksCompleted: integer("tasks_completed").default(0),
  insights: text("insights"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const agentPerformanceMetrics = pgTable("agent_performance_metrics", {
  id: serial("id").primaryKey(),
  agentId: varchar("agent_id", { length: 100 }).notNull(),
  metricDate: timestamp("metric_date").defaultNow(),
  tasksCompleted: integer("tasks_completed").default(0),
  avgResponseTime: integer("avg_response_time"),
  successRate: integer("success_rate").default(100),
  createdAt: timestamp("created_at").defaultNow(),
});

export const agentRatings = pgTable("agent_ratings", {
  id: serial("id").primaryKey(),
  agentId: varchar("agent_id", { length: 100 }).notNull(),
  userId: integer("user_id"),
  rating: integer("rating").default(5),
  feedback: text("feedback"),
  taskDescription: text("task_description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const aiUsageLogs = pgTable("ai_usage_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  model: varchar("model", { length: 100 }),
  promptTokens: integer("prompt_tokens").default(0),
  completionTokens: integer("completion_tokens").default(0),
  totalTokens: integer("total_tokens").default(0),
  costUsd: text("cost_usd"),
  feature: varchar("feature", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: varchar("type", { length: 50 }).default("info"),
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const projectGenesis = pgTable("project_genesis", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id"),
  stage: varchar("stage", { length: 100 }).default("concept"),
  recommendation: varchar("recommendation", { length: 50 }),
  viabilityScore: integer("viability_score"),
  marketAnalysis: text("market_analysis"),
  businessModel: text("business_model"),
  teamAssessment: text("team_assessment"),
  riskAnalysis: text("risk_analysis"),
  executionPlan: text("execution_plan"),
  summary: text("summary"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const projectGenesisPhases = pgTable("project_genesis_phases", {
  id: serial("id").primaryKey(),
  genesisId: integer("genesis_id"),
  phase: varchar("phase", { length: 100 }).notNull(),
  status: varchar("status", { length: 50 }).default("pending"),
  analysis: text("analysis"),
  score: integer("score"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const innovationIdeas = pgTable("innovation_ideas", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }),
  status: varchar("status", { length: 50 }).default("idea"),
  submittedBy: integer("submitted_by"),
  aiScore: integer("ai_score"),
  aiAnalysis: text("ai_analysis"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const ideaAssessments = pgTable("idea_assessments", {
  id: serial("id").primaryKey(),
  ideaId: integer("idea_id"),
  marketPotential: integer("market_potential"),
  feasibility: integer("feasibility"),
  strategicFit: integer("strategic_fit"),
  overallScore: integer("overall_score"),
  recommendation: text("recommendation"),
  assessedAt: timestamp("assessed_at").defaultNow(),
});

export const investmentScenarios = pgTable("investment_scenarios", {
  id: serial("id").primaryKey(),
  ideaId: integer("idea_id"),
  scenarioName: varchar("scenario_name", { length: 255 }),
  investmentAmount: text("investment_amount"),
  projectedReturn: text("projected_return"),
  timeframe: varchar("timeframe", { length: 100 }),
  assumptions: text("assumptions"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const smeReviewTriggers = pgTable("sme_review_triggers", {
  id: serial("id").primaryKey(),
  ideaId: integer("idea_id"),
  smeDomain: varchar("sme_domain", { length: 255 }),
  triggerReason: text("trigger_reason"),
  status: varchar("status", { length: 50 }).default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const victoriaActions = pgTable("victoria_actions", {
  id: serial("id").primaryKey(),
  actionType: varchar("action_type", { length: 100 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 50 }).default("pending"),
  result: text("result"),
  createdAt: timestamp("created_at").defaultNow(),
});
