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

// ─── API Keys ─────────────────────────────────────────────────────────────────
export const apiKeys = pgTable("api_keys", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  name: varchar("name", { length: 128 }).notNull(),
  keyHash: varchar("key_hash", { length: 256 }).notNull(),
  keyPrefix: varchar("key_prefix", { length: 16 }),
  isActive: boolean("is_active").default(true),
  lastUsedAt: timestamp("last_used_at"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── Mood History ─────────────────────────────────────────────────────────────
export const moodHistory = pgTable("mood_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  score: integer("score").notNull(),
  note: text("note"),
  timeOfDay: varchar("time_of_day", { length: 32 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── Brand Kit ───────────────────────────────────────────────────────────────
export const brandKit = pgTable("brand_kit", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  companyName: varchar("company_name", { length: 128 }),
  isDefault: boolean("is_default").default(false),
  logoUrl: text("logo_url"),
  logoLightUrl: text("logo_light_url"),
  primaryColor: varchar("primary_color", { length: 16 }),
  secondaryColor: varchar("secondary_color", { length: 16 }),
  accentColor: varchar("accent_color", { length: 16 }),
  fontFamily: varchar("font_family", { length: 64 }),
  tagline: text("tagline"),
  description: text("description"),
  website: varchar("website", { length: 256 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ─── Briefing Preferences ─────────────────────────────────────────────────────
export const briefingPreferences = pgTable("briefing_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  preferredLength: varchar("preferred_length", { length: 32 }).default("standard"),
  tone: varchar("tone", { length: 32 }).default("professional"),
  enabledSections: text("enabled_sections"),
  deliveryTime: varchar("delivery_time", { length: 8 }),
  includeWeather: boolean("include_weather").default(true),
  includeMarketData: boolean("include_market_data").default(true),
  maxInsightsPerSection: integer("max_insights_per_section").default(3),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ─── Briefing Feedback ────────────────────────────────────────────────────────
export const briefingFeedback = pgTable("briefing_feedback", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  briefingId: integer("briefing_id"),
  sectionId: varchar("section_id", { length: 64 }),
  rating: integer("rating"),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── Digital Twin Profile ─────────────────────────────────────────────────────
export const digitalTwinProfile = pgTable("digital_twin_profile", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  questionnaireCompletion: integer("questionnaire_completion").default(0),
  cosUnderstandingLevel: integer("cos_understanding_level").default(0),
  measurementDriven: integer("measurement_driven"),
  processStandardization: integer("process_standardization"),
  automationPreference: integer("automation_preference"),
  ambiguityTolerance: integer("ambiguity_tolerance"),
  techAdoptionSpeed: integer("tech_adoption_speed"),
  aiBeliefLevel: integer("ai_belief_level"),
  dataVsIntuition: integer("data_vs_intuition"),
  nicheVsMass: integer("niche_vs_mass"),
  firstMoverVsFollower: integer("first_mover_vs_follower"),
  structurePreference: integer("structure_preference"),
  interruptionTolerance: integer("interruption_tolerance"),
  batchingPreference: integer("batching_preference"),
  scenarioPlanningLevel: integer("scenario_planning_level"),
  pivotComfort: integer("pivot_comfort"),
  trendLeadership: integer("trend_leadership"),
  portfolioDiversification: integer("portfolio_diversification"),
  lastCalculated: timestamp("last_calculated"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ─── Briefings ────────────────────────────────────────────────────────────────
export const briefings = pgTable("briefings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  date: timestamp("date").defaultNow(),
  title: text("title").notNull().default(""),
  content: text("content").notNull().default("{}"),
  status: varchar("status", { length: 32 }).default("ready"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── Email Messages ───────────────────────────────────────────────────────────
export const emailMessages = pgTable("email_messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  provider: varchar("provider", { length: 32 }),
  externalId: varchar("external_id", { length: 256 }).notNull(),
  threadId: varchar("thread_id", { length: 256 }),
  fromAddress: varchar("from_address", { length: 320 }),
  fromName: varchar("from_name", { length: 128 }),
  toAddresses: text("to_addresses"),
  subject: text("subject"),
  bodyText: text("body_text"),
  aiSummary: text("ai_summary"),
  aiPriority: varchar("ai_priority", { length: 32 }),
  aiAction: varchar("ai_action", { length: 64 }),
  aiActionReason: text("ai_action_reason"),
  followUpAt: timestamp("follow_up_at"),
  isArchived: boolean("is_archived").default(false),
  receivedAt: timestamp("received_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── Library Documents ────────────────────────────────────────────────────────
export const libraryDocuments = pgTable("library_documents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: varchar("name", { length: 256 }).notNull(),
  folder: varchar("folder", { length: 64 }).default("personal"),
  type: varchar("type", { length: 32 }).default("document"),
  status: varchar("status", { length: 32 }).default("active"),
  fileUrl: text("file_url"),
  metadata: text("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ─── Questionnaire Responses ──────────────────────────────────────────────────
export const questionnaireResponses = pgTable("questionnaire_responses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  questionId: varchar("question_id", { length: 64 }).notNull(),
  questionType: varchar("question_type", { length: 32 }),
  scaleValue: integer("scale_value"),
  booleanValue: boolean("boolean_value"),
  section: varchar("section", { length: 64 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ─── Conversations ────────────────────────────────────────────────────────────
export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  role: varchar("role", { length: 32 }).notNull(),
  content: text("content").notNull(),
  metadata: text("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── Memory Bank ──────────────────────────────────────────────────────────────
export const memoryBank = pgTable("memory_bank", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  category: varchar("category", { length: 64 }).notNull(),
  key: varchar("key", { length: 256 }).notNull(),
  value: text("value").notNull(),
  confidence: integer("confidence").default(80),
  source: varchar("source", { length: 128 }),
  embedding: text("embedding"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ─── Digital Twin Cognitive Model ─────────────────────────────────────────────
export const digitalTwinCognitiveModel = pgTable("digital_twin_cognitive_model", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  communicationStyle: varchar("communication_style", { length: 64 }),
  riskTolerance: varchar("risk_tolerance", { length: 16 }),
  decisionHeuristics: text("decision_heuristics"),
  strategicPriorities: text("strategic_priorities"),
  values: text("values"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ─── Digital Twin Vocabulary ──────────────────────────────────────────────────
export const digitalTwinVocabulary = pgTable("digital_twin_vocabulary", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  preferredTerms: text("preferred_terms").default("{}"),
  avoidedTerms: text("avoided_terms").default("[]"),
  commonPhrases: text("common_phrases").default("[]"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ─── User Settings ────────────────────────────────────────────────────────────
export const userSettings = pgTable("user_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  theme: varchar("theme", { length: 16 }).default("dark"),
  governanceMode: varchar("governance_mode", { length: 32 }).default("standard"),
  onboardingComplete: boolean("onboarding_complete").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ─── Digital Twin Decision Log ────────────────────────────────────────────────
export const digitalTwinDecisionLog = pgTable("digital_twin_decision_log", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  scenarioType: varchar("scenario_type", { length: 64 }).notNull(),
  scenarioContext: text("scenario_context"),
  agentProposal: text("agent_proposal"),
  agentId: varchar("agent_id", { length: 100 }),
  decision: varchar("decision", { length: 32 }),
  modifiedTo: text("modified_to"),
  decisionRationale: text("decision_rationale"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── Generated Documents ──────────────────────────────────────────────────────
export const generatedDocuments = pgTable("generated_documents", {
  id: serial("id").primaryKey(),
  documentId: varchar("document_id", { length: 64 }).notNull(),
  userId: integer("user_id").notNull(),
  title: varchar("title", { length: 256 }).notNull(),
  type: varchar("type", { length: 64 }),
  content: text("content"),
  classification: varchar("classification", { length: 32 }),
  qaStatus: varchar("qa_status", { length: 32 }).default("pending"),
  metadata: text("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ─── Document Email History ───────────────────────────────────────────────────
export const documentEmailHistory = pgTable("document_email_history", {
  id: serial("id").primaryKey(),
  documentId: varchar("document_id", { length: 64 }).notNull(),
  userId: integer("user_id").notNull(),
  recipients: text("recipients"),
  subject: text("subject"),
  message: text("message"),
  status: varchar("status", { length: 32 }).default("sent"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── Email Accounts ───────────────────────────────────────────────────────────
export const emailAccounts = pgTable("email_accounts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  provider: varchar("provider", { length: 32 }),
  status: varchar("status", { length: 32 }).default("active"),
  imapHost: varchar("imap_host", { length: 256 }),
  imapPort: integer("imap_port"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ─── Evening Review Sessions ──────────────────────────────────────────────────
export const eveningReviewSessions = pgTable("evening_review_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  reviewDate: timestamp("review_date").defaultNow(),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  mode: varchar("mode", { length: 32 }),
  tasksAccepted: integer("tasks_accepted").default(0),
  tasksDeferred: integer("tasks_deferred").default(0),
  tasksRejected: integer("tasks_rejected").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── Training Conversations ───────────────────────────────────────────────────
export const trainingConversations = pgTable("training_conversations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  role: varchar("role", { length: 32 }).notNull(),
  content: text("content").notNull(),
  contentType: varchar("content_type", { length: 64 }),
  context: varchar("context", { length: 128 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── Expert Performance ───────────────────────────────────────────────────────
export const expertPerformance = pgTable("expert_performance", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  expertId: varchar("expert_id", { length: 100 }).notNull(),
  score: integer("score").default(80),
  projectsCompleted: integer("projects_completed").default(0),
  positiveFeedback: integer("positive_feedback").default(0),
  negativeFeedback: integer("negative_feedback").default(0),
  lastUsed: timestamp("last_used"),
  notes: text("notes"),
  status: varchar("status", { length: 32 }).default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ─── Calendar Events Cache ────────────────────────────────────────────────────
export const calendarEventsCache = pgTable("calendar_events_cache", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  externalId: varchar("external_id", { length: 256 }),
  title: varchar("title", { length: 256 }).notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  location: varchar("location", { length: 256 }),
  description: text("description"),
  provider: varchar("provider", { length: 32 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── Integrations ─────────────────────────────────────────────────────────────
export const integrations = pgTable("integrations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  provider: varchar("provider", { length: 64 }).notNull(),
  status: varchar("status", { length: 32 }).default("active"),
  accessToken: text("access_token"),
  metadata: text("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ─── SME Teams ────────────────────────────────────────────────────────────────
export const smeTeams = pgTable("sme_teams", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: varchar("name", { length: 128 }).notNull(),
  description: text("description"),
  purpose: text("purpose"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ─── NPS Responses ────────────────────────────────────────────────────────────
export const npsResponses = pgTable("nps_responses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  score: integer("score").notNull(),
  category: varchar("category", { length: 64 }).default("general"),
  feedback: text("feedback"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── Feedback History ─────────────────────────────────────────────────────────
export const feedbackHistory = pgTable("feedback_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  expertId: varchar("expert_id", { length: 100 }),
  rating: integer("rating"),
  feedbackType: varchar("feedback_type", { length: 64 }).default("general"),
  feedbackText: text("feedback_text"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── Favorite Contacts ────────────────────────────────────────────────────────
export const favoriteContacts = pgTable("favorite_contacts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  contactId: varchar("contact_id", { length: 128 }).notNull(),
  contactType: varchar("contact_type", { length: 64 }),
  contactName: varchar("contact_name", { length: 256 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── Team Capabilities ────────────────────────────────────────────────────────
export const teamCapabilities = pgTable("team_capabilities", {
  id: serial("id").primaryKey(),
  teamMember: varchar("team_member", { length: 128 }).notNull(),
  role: varchar("role", { length: 128 }),
  skillCategory: varchar("skill_category", { length: 64 }),
  skillName: varchar("skill_name", { length: 128 }).notNull(),
  currentLevel: integer("current_level").default(0),
  targetLevel: integer("target_level"),
  gap: integer("gap"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ─── KPIs ─────────────────────────────────────────────────────────────────────
export const kpis = pgTable("kpis", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  unit: varchar("unit", { length: 32 }),
  targetValue: varchar("target_value", { length: 64 }),
  currentValue: varchar("current_value", { length: 64 }),
  category: varchar("category", { length: 64 }),
  suggestedByAgent: varchar("suggested_by_agent", { length: 100 }),
  status: varchar("status", { length: 32 }).default("on_track"),
  trend: varchar("trend", { length: 32 }).default("stable"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ─── OKRs ─────────────────────────────────────────────────────────────────────
export const okrs = pgTable("okrs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  objective: text("objective").notNull(),
  quarter: varchar("quarter", { length: 16 }),
  status: varchar("status", { length: 32 }).default("active"),
  overallProgress: integer("overall_progress").default(0),
  suggestedByAgent: varchar("suggested_by_agent", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ─── OKR Key Results ──────────────────────────────────────────────────────────
export const okrKeyResults = pgTable("okr_key_results", {
  id: serial("id").primaryKey(),
  okrId: integer("okr_id").notNull(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  targetValue: varchar("target_value", { length: 64 }),
  currentValue: varchar("current_value", { length: 64 }),
  unit: varchar("unit", { length: 32 }),
  progress: integer("progress").default(0),
  status: varchar("status", { length: 32 }).default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ─── Meeting Notes ────────────────────────────────────────────────────────────
export const meetingNotes = pgTable("meeting_notes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: varchar("title", { length: 256 }).notNull(),
  attendees: text("attendees"),
  preMeetingBrief: text("pre_meeting_brief"),
  transcript: text("transcript"),
  summary: text("summary"),
  actionItems: text("action_items"),
  source: varchar("source", { length: 32 }).default("manual"),
  meetingAt: timestamp("meeting_at"),
  durationMinutes: integer("duration_minutes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ─── Subscriptions ────────────────────────────────────────────────────────────
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: varchar("name", { length: 128 }).notNull(),
  provider: varchar("provider", { length: 128 }),
  description: text("description"),
  category: varchar("category", { length: 64 }),
  cost: varchar("cost", { length: 32 }),
  billingCycle: varchar("billing_cycle", { length: 32 }),
  currency: varchar("currency", { length: 8 }),
  status: varchar("status", { length: 32 }).default("active"),
  renewalDate: timestamp("renewal_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ─── Voice Notes ──────────────────────────────────────────────────────────────
export const voiceNotes = pgTable("voice_notes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  content: text("content").notNull(),
  category: varchar("category", { length: 64 }),
  audioUrl: text("audio_url"),
  duration: integer("duration"),
  projectId: integer("project_id"),
  projectName: varchar("project_name", { length: 128 }),
  isActionItem: boolean("is_action_item").default(false),
  isProcessed: boolean("is_processed").default(false),
  extractedTasks: text("extracted_tasks"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ─── Project Milestones ───────────────────────────────────────────────────────
export const projectMilestones = pgTable("project_milestones", {
  id: serial("id").primaryKey(),
  projectId: integer("projectId").notNull(),
  title: varchar("title", { length: 256 }).notNull(),
  description: text("description").default(""),
  dueDate: timestamp("dueDate"),
  completedAt: timestamp("completedAt"),
  status: varchar("status", { length: 32 }).default("pending").notNull(),
  owner: varchar("owner", { length: 128 }).default(""),
  phase: varchar("phase", { length: 64 }).default(""),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

// ─── Project Team Members ─────────────────────────────────────────────────────
export const projectTeamMembers = pgTable("project_team_members", {
  id: serial("id").primaryKey(),
  projectId: integer("projectId").notNull(),
  name: varchar("name", { length: 128 }).notNull(),
  role: varchar("role", { length: 128 }).notNull(),
  email: varchar("email", { length: 320 }).default(""),
  department: varchar("department", { length: 64 }).default(""),
  isExternal: boolean("isExternal").default(false),
  status: varchar("status", { length: 32 }).default("active"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Project Finance ──────────────────────────────────────────────────────────
export const projectFinance = pgTable("project_finance", {
  id: serial("id").primaryKey(),
  projectId: integer("projectId").notNull(),
  category: varchar("category", { length: 64 }).notNull(),
  lineItem: varchar("lineItem", { length: 256 }).notNull(),
  budgeted: integer("budgeted").default(0),
  actual: integer("actual").default(0),
  forecast: integer("forecast").default(0),
  currency: varchar("currency", { length: 8 }).default("BRL"),
  period: varchar("period", { length: 16 }).default(""),
  notes: text("notes").default(""),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

// ─── Project Risks ────────────────────────────────────────────────────────────
export const projectRisks = pgTable("project_risks", {
  id: serial("id").primaryKey(),
  projectId: integer("projectId").notNull(),
  title: varchar("title", { length: 256 }).notNull(),
  description: text("description").default(""),
  likelihood: varchar("likelihood", { length: 16 }).default("medium"),
  impact: varchar("impact", { length: 16 }).default("medium"),
  status: varchar("status", { length: 32 }).default("open"),
  owner: varchar("owner", { length: 128 }).default(""),
  mitigation: text("mitigation").default(""),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

// ─── Project Comms ────────────────────────────────────────────────────────────
export const projectComms = pgTable("project_comms", {
  id: serial("id").primaryKey(),
  projectId: integer("projectId").notNull(),
  type: varchar("type", { length: 32 }).default("note").notNull(),
  subject: varchar("subject", { length: 256 }).notNull(),
  body: text("body").default(""),
  from: varchar("from", { length: 128 }).default(""),
  to: text("to").default(""),
  status: varchar("status", { length: 32 }).default("open"),
  dueDate: timestamp("dueDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

// ─── Project Automation Ideas ─────────────────────────────────────────────────
export const projectAutomation = pgTable("project_automation", {
  id: serial("id").primaryKey(),
  projectId: integer("projectId").notNull(),
  title: varchar("title", { length: 256 }).notNull(),
  description: text("description").default(""),
  area: varchar("area", { length: 64 }).default("operations"),
  estimatedSaving: varchar("estimated_saving", { length: 64 }).default(""),
  complexity: varchar("complexity", { length: 16 }).default("medium"),
  status: varchar("status", { length: 32 }).default("idea"),
  priority: varchar("priority", { length: 16 }).default("medium"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});
