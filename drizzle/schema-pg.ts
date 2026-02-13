import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json, boolean, float } from "drizzle-orm/mysql-core";

// PostgreSQL Enums
export const roleEnum = pgEnum("role", ["user", "admin"]);
export const themePreferenceEnum = pgEnum("themePreference", ["light", "dark", "system"]);
export const timeOfDayEnum = pgEnum("timeOfDay", ["morning", "afternoon", "evening"]);
export const contentTypeEnum = pgEnum("contentType", ["text", "voice", "action"]);
export const feedbackTypeEnum = pgEnum("feedbackType", ["positive", "negative", "neutral", "correction"]);
export const statusEnum = pgEnum("status", ["pending", "completed", "failed", "cancelled"]);
export const priorityEnum = pgEnum("priority", ["low", "medium", "high", "critical"]);
export const categoryEnum = pgEnum("category", ["key_insight", "meeting", "task", "intelligence", "recommendation"]);
export const themeEnum = pgEnum("theme", ["light", "dark", "mix"]);
export const governanceModeEnum = pgEnum("governanceMode", ["omni", "governed"]);
export const typeEnum = pgEnum("type", ["document", "image", "chart", "presentation", "data", "other"]);
export const threatLevelEnum = pgEnum("threatLevel", ["low", "medium", "high", "critical"]);
export const theBrainStatusEnum = pgEnum("theBrainStatus", ["not_started", "in_progress", "launched", "superior"]);
export const importanceEnum = pgEnum("importance", ["low", "medium", "high", "critical"]);
export const severityEnum = pgEnum("severity", ["low", "medium", "high", "critical"]);
export const complianceStatusEnum = pgEnum("complianceStatus", ["not_applicable", "non_compliant", "partial", "compliant"]);
export const moatPotentialEnum = pgEnum("moatPotential", ["none", "low", "medium", "high"]);
export const effortEnum = pgEnum("effort", ["low", "medium", "high"]);
export const taskTypeEnum = pgEnum("taskType", ["competitor_analysis", "feature_gap", "market_research", "pricing_review", "regulatory_check", "strategy_update"]);
export const methodEnum = pgEnum("method", ["email", "sms"]);
export const billingCycleEnum = pgEnum("billingCycle", ["monthly", "quarterly", "annual", "one_time", "usage_based"]);
export const repeatTypeEnum = pgEnum("repeatType", ["none", "daily", "weekly", "monthly", "custom"]);
export const qaStatusEnum = pgEnum("qaStatus", ["pending", "cos_reviewed", "secondary_reviewed", "approved", "rejected"]);
export const actorTypeEnum = pgEnum("actorType", ["user", "digital_twin", "ai_expert", "system"]);
export const sentimentEnum = pgEnum("sentiment", ["positive", "neutral", "negative"]);
export const memoryTypeEnum = pgEnum("memoryType", ["preference", "fact", "style", "context", "correction"]);
export const coachTypeEnum = pgEnum("coachType", ["chief_of_staff", "peer_expert", "user"]);
export const knowledgeLevelEnum = pgEnum("knowledgeLevel", ["basic", "intermediate", "advanced", "expert"]);
export const contactTypeEnum = pgEnum("contactType", ["expert", "corporate_partner", "ai_expert", "colleague"]);
export const reviewTypeEnum = pgEnum("reviewType", ["cos_review", "secondary_ai", "sme_feedback"]);
export const actionEnum = pgEnum("action", ["joined", "viewed_section", "commented", "reviewed_section", "completed_review"]);
export const codeEnum = pgEnum("code", ["blue_team", "left_field", "red_team"]);
export const panelTypeCodeEnum = pgEnum("panelTypeCode", ["blue_team", "left_field", "red_team"]);
export const level4DecisionEnum = pgEnum("level4Decision", ["go", "hold", "recycle", "kill"]);
export const impactEnum = pgEnum("impact", ["low", "medium", "high"]);
export const modeEnum = pgEnum("mode", ["manual", "auto_processed", "delegated"]);
export const decisionEnum = pgEnum("decision", ["accepted", "deferred", "rejected"]);
export const sourceTypeEnum = pgEnum("sourceType", ["evening_review", "overnight_task", "calendar", "news", "project_update", "manual"]);
export const sourceEnum = pgEnum("source", ["manual", "article", "trend", "conversation", "chief_of_staff", "sme_suggestion"]);
export const assessorTypeEnum = pgEnum("assessorType", ["chief_of_staff", "sme_expert", "framework", "user"]);
export const recommendationEnum = pgEnum("recommendation", ["proceed", "refine", "pivot", "reject", "needs_more_info"]);
export const triggeredByEnum = pgEnum("triggeredBy", ["assessment", "sme_feedback", "user_input", "chief_of_staff"]);
export const riskLevelEnum = pgEnum("riskLevel", ["low", "medium", "high", "very_high"]);
export const trendStrengthEnum = pgEnum("trendStrength", ["emerging", "growing", "mainstream", "declining"]);
export const potentialImpactEnum = pgEnum("potentialImpact", ["low", "medium", "high", "transformative"]);
export const classificationEnum = pgEnum("classification", ["public", "internal", "confidential", "restricted"]);
export const countryEnum = pgEnum("country", ["UAE", "UK", "EU", "US", "Other"]);
export const billingPeriodEnum = pgEnum("billingPeriod", ["one_time", "monthly", "quarterly", "annual"]);
export const customerTypeEnum = pgEnum("customerType", ["individual", "business", "enterprise"]);
export const periodTypeEnum = pgEnum("periodType", ["monthly", "quarterly", "annual"]);
export const confidenceEnum = pgEnum("confidence", ["low", "medium", "high"]);
export const genderEnum = pgEnum("gender", ["male", "female", "non_binary", "prefer_not_to_say"]);
export const jobLevelEnum = pgEnum("jobLevel", ["entry", "mid", "senior", "executive", "founder", "retired", "student"]);
export const companySizeEnum = pgEnum("companySize", ["solo", "startup", "small", "medium", "large", "enterprise"]);
export const buyingStyleEnum = pgEnum("buyingStyle", ["impulsive", "researcher", "bargain_hunter", "brand_loyal", "quality_focused", "value_seeker"]);
export const techSavvinessEnum = pgEnum("techSavviness", ["low", "medium", "high", "expert"]);
export const riskToleranceEnum = pgEnum("riskTolerance", ["conservative", "moderate", "aggressive"]);
export const tierEnum = pgEnum("tier", ["core", "extended", "niche"]);
export const overallSentimentEnum = pgEnum("overallSentiment", ["very_negative", "negative", "neutral", "positive", "very_positive"]);
export const willingnessToPayEnum = pgEnum("willingnessToPay", ["definitely_not", "unlikely", "maybe", "likely", "definitely"]);
export const goNoGoRecommendationEnum = pgEnum("goNoGoRecommendation", ["strong_go", "go", "conditional", "no_go", "strong_no_go"]);
export const confidenceLevelEnum = pgEnum("confidenceLevel", ["low", "medium", "high"]);
export const outlierTypeEnum = pgEnum("outlierType", ["high", "low"]);
export const reviewStatusEnum = pgEnum("reviewStatus", ["pending", "under_review", "resolved", "accepted"]);
export const consensusLevelEnum = pgEnum("consensusLevel", ["strong", "moderate", "weak", "divided"]);
export const complexityEnum = pgEnum("complexity", ["low", "medium", "high"]);


/**
 * Core user table backing auth flow.
 */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum.default("user").notNull(),
  themePreference: themePreferenceEnum.default("dark").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Mood history - tracks emotional state throughout the day
 * Only captured 3x daily: morning, afternoon, evening
 */
export const moodHistory = pgTable("mood_history", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  score: integer("score").notNull(), // 1-10
  timeOfDay: timeOfDayEnum.notNull(),
  note: text("note"), // Optional context
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MoodHistory = typeof moodHistory.$inferSelect;
export type InsertMoodHistory = typeof moodHistory.$inferInsert;

/**
 * Training conversations - full conversation logs with Digital Twin
 */
export const trainingConversations = pgTable("training_conversations", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  role: roleEnum.notNull(),
  content: text("content").notNull(),
  contentType: contentTypeEnum.default("text").notNull(),
  context: varchar("context", { length: 100 }), // e.g., "daily_brief", "ai_experts", "workflow"
  metadata: jsonb("metadata"), // Additional structured data
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TrainingConversation = typeof trainingConversations.$inferSelect;
export type InsertTrainingConversation = typeof trainingConversations.$inferInsert;

/**
 * Decision patterns - every choice the user makes
 */
export const decisionPatterns = pgTable("decision_patterns", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  decisionType: varchar("decisionType", { length: 50 }).notNull(), // "got_it", "defer", "delegate", "digital_twin"
  itemType: varchar("itemType", { length: 50 }).notNull(), // "email", "meeting", "project", "task"
  itemDescription: text("itemDescription"),
  context: varchar("context", { length: 100 }), // Where decision was made
  timeOfDay: varchar("timeOfDay", { length: 20 }), // When decision was made
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DecisionPattern = typeof decisionPatterns.$inferSelect;
export type InsertDecisionPattern = typeof decisionPatterns.$inferInsert;

/**
 * User preferences - extracted from behavior patterns
 */
export const userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  preferenceKey: varchar("preferenceKey", { length: 100 }).notNull(), // e.g., "preferred_meeting_time"
  preferenceValue: text("preferenceValue").notNull(),
  confidence: real("confidence").default(0.5), // 0-1 confidence score
  source: varchar("source", { length: 50 }), // "explicit", "inferred", "conversation"
  learnedAt: timestamp("learnedAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type UserPreference = typeof userPreferences.$inferSelect;
export type InsertUserPreference = typeof userPreferences.$inferInsert;

/**
 * Vocabulary patterns - user's specific terms and phrases
 */
export const vocabularyPatterns = pgTable("vocabulary_patterns", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  term: varchar("term", { length: 200 }).notNull(),
  meaning: text("meaning"), // What the user means by this term
  context: varchar("context", { length: 100 }), // Where this term is typically used
  frequency: integer("frequency").default(1), // How often used
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type VocabularyPattern = typeof vocabularyPatterns.$inferSelect;
export type InsertVocabularyPattern = typeof vocabularyPatterns.$inferInsert;

/**
 * Feedback history - user feedback on AI expert work
 */
export const feedbackHistory = pgTable("feedback_history", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  expertId: varchar("expertId", { length: 50 }), // AI expert who did the work
  projectId: varchar("projectId", { length: 50 }),
  rating: integer("rating"), // 1-5 stars
  feedbackType: feedbackTypeEnum.notNull(),
  feedbackText: text("feedbackText"),
  originalOutput: text("originalOutput"), // What the AI produced
  correctedOutput: text("correctedOutput"), // What user wanted instead
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type FeedbackHistory = typeof feedbackHistory.$inferSelect;
export type InsertFeedbackHistory = typeof feedbackHistory.$inferInsert;

/**
 * Digital Twin activity log - what the twin does autonomously
 */
export const twinActivityLog = pgTable("twin_activity_log", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  activityType: varchar("activityType", { length: 50 }).notNull(), // "email_sent", "task_completed", "meeting_scheduled"
  description: text("description").notNull(),
  status: statusEnum.default("completed").notNull(),
  autonomous: boolean("autonomous").default(false), // Was this done without user approval?
  metadata: jsonb("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TwinActivityLog = typeof twinActivityLog.$inferSelect;
export type InsertTwinActivityLog = typeof twinActivityLog.$inferInsert;

/**
 * AI Expert performance scores
 */
export const expertPerformance = pgTable("expert_performance", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  expertId: varchar("expertId", { length: 50 }).notNull(),
  score: real("score").default(80), // 0-100 performance score
  projectsCompleted: integer("projectsCompleted").default(0),
  positiveFeedback: integer("positiveFeedback").default(0),
  negativeFeedback: integer("negativeFeedback").default(0),
  lastUsed: timestamp("lastUsed"),
  notes: text("notes"), // User notes about this expert
  status: statusEnum.default("active").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type ExpertPerformance = typeof expertPerformance.$inferSelect;
export type InsertExpertPerformance = typeof expertPerformance.$inferInsert;

/**
 * Projects - user's active projects
 */
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  status: statusEnum.default("not_started").notNull(),
  priority: priorityEnum.default("medium").notNull(),
  progress: integer("progress").default(0), // 0-100
  dueDate: timestamp("dueDate"),
  blockerDescription: text("blockerDescription"),
  assignedExperts: jsonb("assignedExperts"), // Array of expert IDs
  metadata: jsonb("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

/**
 * Daily Brief items
 */
export const dailyBriefItems = pgTable("daily_brief_items", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  briefDate: timestamp("briefDate").notNull(),
  category: categoryEnum.notNull(),
  title: varchar("title", { length: 300 }).notNull(),
  description: text("description"),
  priority: priorityEnum.default("medium").notNull(),
  status: statusEnum.default("pending").notNull(),
  actionedAt: timestamp("actionedAt"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DailyBriefItem = typeof dailyBriefItems.$inferSelect;
export type InsertDailyBriefItem = typeof dailyBriefItems.$inferInsert;

/**
 * User settings and app state
 */
export const userSettings = pgTable("user_settings", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().unique(),
  theme: themeEnum.default("dark").notNull(),
  governanceMode: governanceModeEnum.default("governed").notNull(),
  dailyBriefTime: varchar("dailyBriefTime", { length: 10 }).default("07:00"),
  eveningReviewTime: varchar("eveningReviewTime", { length: 10 }).default("18:00"),
  lastMoodCheckMorning: timestamp("lastMoodCheckMorning"),
  lastMoodCheckAfternoon: timestamp("lastMoodCheckAfternoon"),
  lastMoodCheckEvening: timestamp("lastMoodCheckEvening"),
  twinAutonomyLevel: integer("twinAutonomyLevel").default(1), // 1-10, how autonomous the twin can be
  notificationsEnabled: boolean("notificationsEnabled").default(true),
  sidebarCollapsed: boolean("sidebarCollapsed").default(false),
  onboardingComplete: boolean("onboardingComplete").default(false),
  metadata: jsonb("metadata"),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type UserSettings = typeof userSettings.$inferSelect;
export type InsertUserSettings = typeof userSettings.$inferInsert;

/**
 * Library documents
 */
export const libraryDocuments = pgTable("library_documents", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  projectId: varchar("projectId", { length: 50 }), // null for personal items
  folder: varchar("folder", { length: 100 }).notNull(), // "celadon", "boundless", "personal", etc.
  subFolder: varchar("subFolder", { length: 100 }), // "documents", "ai_images", "charts", etc.
  name: varchar("name", { length: 300 }).notNull(),
  type: typeEnum.notNull(),
  status: statusEnum.default("draft").notNull(),
  fileUrl: text("fileUrl"),
  thumbnailUrl: text("thumbnailUrl"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type LibraryDocument = typeof libraryDocuments.$inferSelect;
export type InsertLibraryDocument = typeof libraryDocuments.$inferInsert;

/**
 * Digital Twin conversation history
 */
export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  role: roleEnum.notNull(),
  content: text("content").notNull(),
  metadata: jsonb("metadata"), // Store additional context like mood, voice input, etc.
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = typeof conversations.$inferInsert;


/**
 * Waitlist - users waiting for access
 */
export const waitlist = pgTable("waitlist", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  name: varchar("name", { length: 200 }),
  referralCode: varchar("referralCode", { length: 20 }).notNull().unique(),
  referredBy: varchar("referredBy", { length: 20 }), // Referral code of who referred them
  position: integer("position").notNull(),
  status: statusEnum.default("waiting").notNull(),
  invitedAt: timestamp("invitedAt"),
  joinedAt: timestamp("joinedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Waitlist = typeof waitlist.$inferSelect;
export type InsertWaitlist = typeof waitlist.$inferInsert;

/**
 * Referrals - track referral relationships and rewards
 */
export const referrals = pgTable("referrals", {
  id: serial("id").primaryKey(),
  referrerId: integer("referrerId").notNull(), // User who referred
  referredEmail: varchar("referredEmail", { length: 320 }).notNull(),
  referredUserId: integer("referredUserId"), // Filled when they join
  status: statusEnum.default("pending").notNull(),
  creditsAwarded: integer("creditsAwarded").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  convertedAt: timestamp("convertedAt"),
});

export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = typeof referrals.$inferInsert;

/**
 * User credits - earned through referrals and achievements
 */
export const userCredits = pgTable("user_credits", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  balance: integer("balance").default(0).notNull(),
  lifetimeEarned: integer("lifetimeEarned").default(0).notNull(),
  lifetimeSpent: integer("lifetimeSpent").default(0).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type UserCredits = typeof userCredits.$inferSelect;
export type InsertUserCredits = typeof userCredits.$inferInsert;

/**
 * Credit transactions - audit log of credit changes
 */
export const creditTransactions = pgTable("credit_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  amount: integer("amount").notNull(), // Positive for earn, negative for spend
  type: typeEnum.notNull(),
  description: varchar("description", { length: 500 }),
  referenceId: varchar("referenceId", { length: 100 }), // ID of related entity
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CreditTransaction = typeof creditTransactions.$inferSelect;
export type InsertCreditTransaction = typeof creditTransactions.$inferInsert;

/**
 * Training documents - uploaded files for Digital Twin training
 */
export const trainingDocuments = pgTable("training_documents", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  name: varchar("name", { length: 300 }).notNull(),
  type: typeEnum.notNull(),
  content: text("content"), // Text content or extracted text
  fileUrl: text("fileUrl"), // S3 URL if file uploaded
  fileSize: integer("fileSize"),
  tokenCount: integer("tokenCount"),
  processed: boolean("processed").default(false),
  processedAt: timestamp("processedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TrainingDocument = typeof trainingDocuments.$inferSelect;
export type InsertTrainingDocument = typeof trainingDocuments.$inferInsert;

/**
 * Memory bank - persistent facts the Digital Twin remembers
 */
export const memoryBank = pgTable("memory_bank", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  category: categoryEnum.notNull(),
  key: varchar("key", { length: 200 }).notNull(),
  value: text("value").notNull(),
  confidence: real("confidence").default(1.0),
  source: varchar("source", { length: 100 }), // Where this memory came from
  lastAccessed: timestamp("lastAccessed"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type MemoryBank = typeof memoryBank.$inferSelect;
export type InsertMemoryBank = typeof memoryBank.$inferInsert;

/**
 * Wellness scores - daily calculated wellness metrics
 */
export const wellnessScores = pgTable("wellness_scores", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  date: timestamp("date").notNull(),
  overallScore: real("overallScore").notNull(), // 0-10
  moodScore: real("moodScore"),
  productivityScore: real("productivityScore"),
  balanceScore: real("balanceScore"),
  momentumScore: real("momentumScore"),
  factors: jsonb("factors"), // Breakdown of contributing factors
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WellnessScore = typeof wellnessScores.$inferSelect;
export type InsertWellnessScore = typeof wellnessScores.$inferInsert;

/**
 * Streaks - gamification tracking
 */
export const streaks = pgTable("streaks", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  type: varchar("type", { length: 50 }).notNull(), // "daily_login", "mood_check", "task_complete"
  currentStreak: integer("currentStreak").default(0).notNull(),
  longestStreak: integer("longestStreak").default(0).notNull(),
  lastActivityDate: timestamp("lastActivityDate"),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type Streak = typeof streaks.$inferSelect;
export type InsertStreak = typeof streaks.$inferInsert;

/**
 * Achievements - unlocked achievements
 */
export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  achievementId: varchar("achievementId", { length: 100 }).notNull(),
  unlockedAt: timestamp("unlockedAt").defaultNow().notNull(),
});

export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = typeof achievements.$inferInsert;


/**
 * Competitors - tracked competitive landscape
 */
export const competitors = pgTable("competitors", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  website: varchar("website", { length: 500 }),
  description: text("description"),
  category: varchar("category", { length: 100 }), // "ai_assistant", "productivity", "calendar", etc.
  pricing: varchar("pricing", { length: 100 }), // "free", "$10/mo", "$30/mo", etc.
  targetMarket: varchar("targetMarket", { length: 200 }),
  strengths: jsonb("strengths"), // Array of strength descriptions
  weaknesses: jsonb("weaknesses"), // Array of weakness descriptions
  threatLevel: threatLevelEnum.default("medium"),
  lastAnalyzed: timestamp("lastAnalyzed"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type Competitor = typeof competitors.$inferSelect;
export type InsertCompetitor = typeof competitors.$inferInsert;

/**
 * Feature comparison - track features across competitors
 */
export const featureComparison = pgTable("feature_comparison", {
  id: serial("id").primaryKey(),
  featureName: varchar("featureName", { length: 200 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(), // "ai", "productivity", "integration", etc.
  description: text("description"),
  theBrainStatus: theBrainStatusEnum.default("not_started"),
  theBrainScore: integer("theBrainScore").default(0), // 0-100
  competitorData: jsonb("competitorData"), // { competitorId: score, ... }
  importance: importanceEnum.default("medium"),
  notes: text("notes"),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type FeatureComparison = typeof featureComparison.$inferSelect;
export type InsertFeatureComparison = typeof featureComparison.$inferInsert;

/**
 * Market position history - track competitive position over time
 */
export const marketPositionHistory = pgTable("market_position_history", {
  id: serial("id").primaryKey(),
  date: timestamp("date").notNull(),
  overallScore: real("overallScore").notNull(), // 0-100
  featureParityScore: real("featureParityScore"),
  uniqueValueScore: real("uniqueValueScore"),
  marketShareEstimate: real("marketShareEstimate"),
  competitorScores: jsonb("competitorScores"), // { competitorId: score, ... }
  factors: jsonb("factors"), // Breakdown of what contributed to score
  analysis: text("analysis"), // AI-generated analysis
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MarketPositionHistory = typeof marketPositionHistory.$inferSelect;
export type InsertMarketPositionHistory = typeof marketPositionHistory.$inferInsert;

/**
 * Competitive threats - detected threats and opportunities
 */
export const competitiveThreats = pgTable("competitive_threats", {
  id: serial("id").primaryKey(),
  type: typeEnum.notNull(),
  severity: severityEnum.default("medium"),
  competitorId: integer("competitorId"),
  title: varchar("title", { length: 300 }).notNull(),
  description: text("description").notNull(),
  impact: text("impact"), // How this affects The Brain
  recommendedAction: text("recommendedAction"),
  status: statusEnum.default("new"),
  detectedAt: timestamp("detectedAt").defaultNow().notNull(),
  addressedAt: timestamp("addressedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CompetitiveThreat = typeof competitiveThreats.$inferSelect;
export type InsertCompetitiveThreat = typeof competitiveThreats.$inferInsert;

/**
 * Regulatory landscape - track regulations and compliance
 */
export const regulatoryLandscape = pgTable("regulatory_landscape", {
  id: serial("id").primaryKey(),
  region: varchar("region", { length: 100 }).notNull(), // "US", "EU", "UK", "Global"
  regulation: varchar("regulation", { length: 300 }).notNull(), // "GDPR", "AI Act", "CCPA"
  category: varchar("category", { length: 100 }), // "data_privacy", "ai_governance", "consumer_protection"
  status: statusEnum.default("proposed"),
  effectiveDate: timestamp("effectiveDate"),
  complianceStatus: complianceStatusEnum.default("not_applicable"),
  moatPotential: moatPotentialEnum.default("none"),
  description: text("description"),
  requirements: jsonb("requirements"), // Array of specific requirements
  notes: text("notes"),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type RegulatoryLandscape = typeof regulatoryLandscape.$inferSelect;
export type InsertRegulatoryLandscape = typeof regulatoryLandscape.$inferInsert;

/**
 * Strategy recommendations - AI-generated strategic advice
 */
export const strategyRecommendations = pgTable("strategy_recommendations", {
  id: serial("id").primaryKey(),
  category: categoryEnum.notNull(),
  priority: priorityEnum.default("medium"),
  title: varchar("title", { length: 300 }).notNull(),
  recommendation: text("recommendation").notNull(),
  rationale: text("rationale"),
  expectedImpact: text("expectedImpact"),
  effort: effortEnum.default("medium"),
  timeframe: varchar("timeframe", { length: 100 }), // "immediate", "1-2 weeks", "1-3 months"
  status: statusEnum.default("proposed"),
  generatedBy: varchar("generatedBy", { length: 100 }), // AI expert who generated it
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type StrategyRecommendation = typeof strategyRecommendations.$inferSelect;
export type InsertStrategyRecommendation = typeof strategyRecommendations.$inferInsert;

/**
 * Commercialization tasks - Digital Twin's strategy work
 */
export const commercializationTasks = pgTable("commercialization_tasks", {
  id: serial("id").primaryKey(),
  taskType: taskTypeEnum.notNull(),
  title: varchar("title", { length: 300 }).notNull(),
  description: text("description"),
  status: statusEnum.default("pending"),
  priority: priorityEnum.default("medium"),
  assignedExpert: varchar("assignedExpert", { length: 100 }), // AI expert handling this
  result: text("result"), // Outcome of the task
  scheduledFor: timestamp("scheduledFor"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CommercializationTask = typeof commercializationTasks.$inferSelect;
export type InsertCommercializationTask = typeof commercializationTasks.$inferInsert;


/**
 * Two-Factor Authentication - Verification codes for Vault access
 */
export const vaultVerificationCodes = pgTable("vault_verification_codes", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  code: varchar("code", { length: 6 }).notNull(), // 6-digit code
  method: methodEnum.default("email").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  used: boolean("used").default(false),
  attempts: integer("attempts").default(0), // Failed verification attempts
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type VaultVerificationCode = typeof vaultVerificationCodes.$inferSelect;
export type InsertVaultVerificationCode = typeof vaultVerificationCodes.$inferInsert;

/**
 * Trusted devices - devices that can skip 2FA temporarily
 */
export const trustedDevices = pgTable("trusted_devices", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  deviceToken: varchar("deviceToken", { length: 64 }).notNull().unique(),
  deviceName: varchar("deviceName", { length: 200 }),
  userAgent: text("userAgent"),
  ipAddress: varchar("ipAddress", { length: 45 }),
  expiresAt: timestamp("expiresAt").notNull(),
  lastUsed: timestamp("lastUsed"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TrustedDevice = typeof trustedDevices.$inferSelect;
export type InsertTrustedDevice = typeof trustedDevices.$inferInsert;

/**
 * Vault access log - audit trail of all Vault access attempts
 */
export const vaultAccessLog = pgTable("vault_access_log", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  action: mysqlEnum("action", [
    "access_attempt", 
    "access_granted", 
    "access_denied", 
    "code_sent", 
    "code_verified",
    "code_failed",
    "session_expired",
    "device_trusted",
    "device_revoked"
  ]).notNull(),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  success: boolean("success").default(false),
  metadata: jsonb("metadata"), // Additional info like device, location
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type VaultAccessLog = typeof vaultAccessLog.$inferSelect;
export type InsertVaultAccessLog = typeof vaultAccessLog.$inferInsert;

/**
 * Vault sessions - active authenticated sessions
 */
export const vaultSessions = pgTable("vault_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  sessionToken: varchar("sessionToken", { length: 64 }).notNull().unique(),
  expiresAt: timestamp("expiresAt").notNull(), // Session timeout (e.g., 30 minutes)
  lastActivity: timestamp("lastActivity"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type VaultSession = typeof vaultSessions.$inferSelect;
export type InsertVaultSession = typeof vaultSessions.$inferInsert;

// ==================== INTEGRATIONS ====================

/**
 * External integrations - OAuth connections to third-party services
 */
export const integrations = pgTable("integrations", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  provider: varchar("provider", { length: 50 }).notNull(), // "asana", "google", "outlook", "slack", etc.
  providerAccountId: varchar("providerAccountId", { length: 200 }), // External account ID
  accessToken: text("accessToken"), // Encrypted
  refreshToken: text("refreshToken"), // Encrypted
  tokenExpiresAt: timestamp("tokenExpiresAt"),
  scopes: jsonb("scopes"), // Array of granted scopes
  status: statusEnum.default("active").notNull(),
  lastSyncAt: timestamp("lastSyncAt"),
  syncError: text("syncError"),
  metadata: jsonb("metadata"), // Provider-specific data
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type Integration = typeof integrations.$inferSelect;
export type InsertIntegration = typeof integrations.$inferInsert;

/**
 * Notifications - in-app notification system
 */
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  type: mysqlEnum("type", [
    "info", "success", "warning", "error",
    "task_assigned", "task_completed", "project_update",
    "integration_alert", "security_alert", "digital_twin",
    "daily_brief", "reminder", "achievement"
  ]).notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  message: text("message").notNull(),
  actionUrl: varchar("actionUrl", { length: 500 }), // Link to relevant page
  actionLabel: varchar("actionLabel", { length: 100 }), // Button text
  read: boolean("read").default(false),
  readAt: timestamp("readAt"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * Audit log - comprehensive activity tracking
 */
export const auditLog = pgTable("audit_log", {
  id: serial("id").primaryKey(),
  userId: integer("userId"),
  action: varchar("action", { length: 100 }).notNull(), // "login", "create_project", "update_settings", etc.
  resource: varchar("resource", { length: 100 }), // "project", "document", "integration", etc.
  resourceId: varchar("resourceId", { length: 100 }),
  details: jsonb("details"), // Action-specific data
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  success: boolean("success").default(true),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AuditLog = typeof auditLog.$inferSelect;
export type InsertAuditLog = typeof auditLog.$inferInsert;

/**
 * Subscriptions - SaaS subscription tracking with enhanced cost analysis
 */
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  name: varchar("name", { length: 200 }).notNull(), // "Asana", "Slack", "Zoom", etc.
  provider: varchar("provider", { length: 200 }), // Company name
  description: text("description"),
  category: mysqlEnum("category", [
    "ai_ml",
    "productivity",
    "development",
    "marketing",
    "design",
    "communication",
    "storage",
    "analytics",
    "finance",
    "security",
    "other"
  ]).default("other").notNull(),
  cost: real("cost").notNull(), // Cost in AED
  billingCycle: billingCycleEnum.default("monthly").notNull(),
  currency: varchar("currency", { length: 10 }).default("AED").notNull(),
  status: statusEnum.default("active").notNull(),
  startDate: timestamp("startDate"),
  renewalDate: timestamp("renewalDate"),
  trialEndDate: timestamp("trialEndDate"),
  usagePercent: integer("usagePercent"), // 0-100, how much of the subscription is used
  websiteUrl: text("websiteUrl"),
  logoUrl: text("logoUrl"),
  linkedIdeaId: integer("linkedIdeaId"), // Link to innovation idea if subscription is for a specific project
  linkedProjectId: integer("linkedProjectId"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

/**
 * Project Genesis - new opportunity/deal tracking
 */
export const projectGenesis = pgTable("project_genesis", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  name: varchar("name", { length: 300 }).notNull(),
  type: typeEnum.notNull(),
  stage: mysqlEnum("stage", [
    "discovery", "qualification", "due_diligence", 
    "negotiation", "documentation", "closing", "post_deal"
  ]).default("discovery").notNull(),
  status: statusEnum.default("active").notNull(),
  counterparty: varchar("counterparty", { length: 300 }),
  dealValue: real("dealValue"),
  currency: varchar("currency", { length: 3 }).default("USD"),
  probability: integer("probability").default(50), // 0-100
  expectedCloseDate: timestamp("expectedCloseDate"),
  description: text("description"),
  keyContacts: jsonb("keyContacts"), // Array of contact info
  documents: jsonb("documents"), // Array of document references
  tasks: jsonb("tasks"), // Array of task IDs
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type ProjectGenesisRecord = typeof projectGenesis.$inferSelect;
export type InsertProjectGenesis = typeof projectGenesis.$inferInsert;

/**
 * Universal Inbox - centralized intake for all incoming items
 */
export const universalInbox = pgTable("universal_inbox", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  source: mysqlEnum("source", [
    "email", "document", "voice_note", "whatsapp", 
    "slack", "asana", "calendar", "manual", "webhook"
  ]).notNull(),
  sourceId: varchar("sourceId", { length: 200 }), // External ID from source
  type: mysqlEnum("type", [
    "email", "document", "task", "meeting", "note", 
    "attachment", "message", "reminder", "other"
  ]).notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  preview: text("preview"), // First 500 chars or summary
  content: text("content"), // Full content
  sender: varchar("sender", { length: 300 }),
  priority: priorityEnum.default("medium"),
  status: mysqlEnum("status", [
    "unread", "read", "processing", "processed", 
    "archived", "deleted", "action_required"
  ]).default("unread").notNull(),
  processedBy: varchar("processedBy", { length: 100 }), // "digital_twin", "ai_expert", "user"
  processedResult: text("processedResult"),
  attachments: jsonb("attachments"), // Array of attachment URLs
  metadata: jsonb("metadata"),
  receivedAt: timestamp("receivedAt").defaultNow().notNull(),
  processedAt: timestamp("processedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UniversalInboxItem = typeof universalInbox.$inferSelect;
export type InsertUniversalInboxItem = typeof universalInbox.$inferInsert;

/**
 * Brand Kit - company branding assets
 */
export const brandKit = pgTable("brand_kit", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  companyName: varchar("companyName", { length: 200 }).notNull(),
  isDefault: boolean("isDefault").default(false),
  logoUrl: text("logoUrl"),
  logoLightUrl: text("logoLightUrl"), // For dark backgrounds
  primaryColor: varchar("primaryColor", { length: 20 }),
  secondaryColor: varchar("secondaryColor", { length: 20 }),
  accentColor: varchar("accentColor", { length: 20 }),
  fontFamily: varchar("fontFamily", { length: 100 }),
  tagline: varchar("tagline", { length: 500 }),
  description: text("description"),
  website: varchar("website", { length: 500 }),
  socialLinks: jsonb("socialLinks"), // { linkedin, twitter, etc. }
  templates: jsonb("templates"), // Document template settings
  metadata: jsonb("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type BrandKitRecord = typeof brandKit.$inferSelect;
export type InsertBrandKit = typeof brandKit.$inferInsert;

/**
 * Signatures - stored signatures for document signing
 */
export const signatures = pgTable("signatures", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  name: varchar("name", { length: 200 }).notNull(), // "Main Signature", "Initials", etc.
  type: typeEnum.notNull(),
  imageUrl: text("imageUrl").notNull(), // S3 URL of signature image
  fontFamily: varchar("fontFamily", { length: 100 }), // For typed signatures
  isDefault: boolean("isDefault").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type Signature = typeof signatures.$inferSelect;
export type InsertSignature = typeof signatures.$inferInsert;

/**
 * AI Provider settings - API keys and routing preferences
 */
export const aiProviderSettings = pgTable("ai_provider_settings", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  provider: varchar("provider", { length: 50 }).notNull(), // "openai", "anthropic", "perplexity", etc.
  apiKey: text("apiKey"), // Encrypted
  isEnabled: boolean("isEnabled").default(true),
  priority: integer("priority").default(1), // Lower = higher priority
  usageLimit: integer("usageLimit"), // Monthly token limit
  currentUsage: integer("currentUsage").default(0),
  domains: jsonb("domains"), // Array of domains this provider handles
  metadata: jsonb("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type AIProviderSetting = typeof aiProviderSettings.$inferSelect;
export type InsertAIProviderSetting = typeof aiProviderSettings.$inferInsert;

/**
 * Reminders - scheduled reminders and follow-ups
 */
export const reminders = pgTable("reminders", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  title: varchar("title", { length: 300 }).notNull(),
  description: text("description"),
  dueAt: timestamp("dueAt").notNull(),
  repeatType: repeatTypeEnum.default("none"),
  repeatInterval: integer("repeatInterval"), // For custom repeats
  status: statusEnum.default("pending"),
  snoozedUntil: timestamp("snoozedUntil"),
  relatedType: varchar("relatedType", { length: 50 }), // "project", "task", "inbox_item", etc.
  relatedId: integer("relatedId"),
  notificationSent: boolean("notificationSent").default(false),
  metadata: jsonb("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type Reminder = typeof reminders.$inferSelect;
export type InsertReminder = typeof reminders.$inferInsert;

/**
 * Tasks - granular task tracking within projects with QA workflow
 */
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  projectId: integer("projectId"),
  teamId: integer("teamId"), // Link to SME team
  parentTaskId: integer("parentTaskId"), // For subtasks
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  status: mysqlEnum("status", [
    "not_started", "in_progress", "blocked", 
    "review", "cos_approved", "verified", "completed", "cancelled"
  ]).default("not_started").notNull(),
  priority: priorityEnum.default("medium"),
  progress: integer("progress").default(0), // 0-100
  dueDate: timestamp("dueDate"),
  estimatedHours: real("estimatedHours"),
  actualHours: real("actualHours"),
  assignedTo: varchar("assignedTo", { length: 100 }), // "digital_twin", expert ID, or "user"
  assignedExperts: jsonb("assignedExperts"), // Array of expert IDs for team tasks
  dependencies: jsonb("dependencies"), // Array of task IDs this depends on
  blockerDescription: text("blockerDescription"),
  cosScore: integer("cosScore"), // Chief of Staff QA score (1-10)
  secondaryAiScore: integer("secondaryAiScore"), // Secondary AI verification score (1-10)
  qaStatus: qaStatusEnum.default("pending"),
  completedAt: timestamp("completedAt"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type Task = typeof tasks.$inferSelect;
export type InsertTask = typeof tasks.$inferInsert;

/**
 * Activity feed - project and system activity
 */
export const activityFeed = pgTable("activity_feed", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  projectId: integer("projectId"),
  actorType: actorTypeEnum.notNull(),
  actorId: varchar("actorId", { length: 100 }), // Expert ID or "system"
  actorName: varchar("actorName", { length: 200 }),
  action: varchar("action", { length: 100 }).notNull(), // "created", "updated", "completed", etc.
  targetType: varchar("targetType", { length: 50 }), // "task", "document", "project", etc.
  targetId: integer("targetId"),
  targetName: varchar("targetName", { length: 300 }),
  description: text("description"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ActivityFeedItem = typeof activityFeed.$inferSelect;
export type InsertActivityFeedItem = typeof activityFeed.$inferInsert;

/**
 * Data retention policies - compliance tracking
 */
export const dataRetentionPolicies = pgTable("data_retention_policies", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  dataType: varchar("dataType", { length: 100 }).notNull(), // "conversations", "documents", "audit_logs", etc.
  retentionDays: integer("retentionDays").notNull(),
  autoDelete: boolean("autoDelete").default(false),
  lastPurgeAt: timestamp("lastPurgeAt"),
  nextPurgeAt: timestamp("nextPurgeAt"),
  itemsDeleted: integer("itemsDeleted").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type DataRetentionPolicy = typeof dataRetentionPolicies.$inferSelect;
export type InsertDataRetentionPolicy = typeof dataRetentionPolicies.$inferInsert;

/**
 * PII detection log - flagged sensitive data
 */
export const piiDetectionLog = pgTable("pii_detection_log", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  sourceType: varchar("sourceType", { length: 50 }).notNull(), // "document", "conversation", "inbox", etc.
  sourceId: integer("sourceId").notNull(),
  piiType: varchar("piiType", { length: 50 }).notNull(), // "email", "phone", "ssn", "credit_card", etc.
  detectedText: text("detectedText"), // The flagged content (may be redacted)
  confidence: real("confidence"), // 0-1 confidence score
  status: statusEnum.default("detected"),
  reviewedBy: varchar("reviewedBy", { length: 100 }),
  reviewedAt: timestamp("reviewedAt"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PIIDetectionLog = typeof piiDetectionLog.$inferSelect;
export type InsertPIIDetectionLog = typeof piiDetectionLog.$inferInsert;

/**
 * Compliance checklists - project-specific compliance tracking
 */
export const complianceChecklists = pgTable("compliance_checklists", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  projectId: integer("projectId"),
  projectType: varchar("projectType", { length: 100 }).notNull(), // "investment", "partnership", etc.
  checklistName: varchar("checklistName", { length: 200 }).notNull(),
  items: jsonb("items").notNull(), // Array of { id, title, required, completed, completedAt, notes }
  completedCount: integer("completedCount").default(0),
  totalCount: integer("totalCount").notNull(),
  status: statusEnum.default("not_started"),
  dueDate: timestamp("dueDate"),
  completedAt: timestamp("completedAt"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type ComplianceChecklist = typeof complianceChecklists.$inferSelect;
export type InsertComplianceChecklist = typeof complianceChecklists.$inferInsert;


/**
 * Voice notes - captured throughout the day for Digital Twin context
 */
export const voiceNotes = pgTable("voice_notes", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  content: text("content").notNull(), // Transcribed text
  category: categoryEnum.default("observation").notNull(),
  audioUrl: varchar("audioUrl", { length: 500 }), // S3 URL to original audio
  duration: integer("duration"), // Duration in seconds
  projectId: integer("projectId"), // Optional link to project
  projectName: varchar("projectName", { length: 300 }),
  isActionItem: boolean("isActionItem").default(false),
  isProcessed: boolean("isProcessed").default(false), // Has Digital Twin processed this?
  extractedTasks: jsonb("extractedTasks"), // Array of task strings extracted
  metadata: jsonb("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type VoiceNote = typeof voiceNotes.$inferSelect;
export type InsertVoiceNote = typeof voiceNotes.$inferInsert;


// ============================================
// EXPERT EVOLUTION SYSTEM
// ============================================

/**
 * Expert conversations - full conversation history with each AI expert
 * Enables persistent memory and context for each expert
 */
export const expertConversations = pgTable("expert_conversations", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  expertId: varchar("expertId", { length: 50 }).notNull(),
  role: roleEnum.notNull(),
  content: text("content").notNull(),
  projectId: integer("projectId"), // Optional link to project
  taskId: varchar("taskId", { length: 100 }), // Task this conversation relates to
  sentiment: sentimentEnum,
  qualityScore: integer("qualityScore"), // 1-10 rating of this response
  metadata: jsonb("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ExpertConversation = typeof expertConversations.$inferSelect;
export type InsertExpertConversation = typeof expertConversations.$inferInsert;

/**
 * Expert memory - key learnings and preferences per expert
 * What each expert has learned about the user and their work
 */
export const expertMemory = pgTable("expert_memory", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  expertId: varchar("expertId", { length: 50 }).notNull(),
  memoryType: memoryTypeEnum.notNull(),
  key: varchar("key", { length: 200 }).notNull(),
  value: text("value").notNull(),
  confidence: real("confidence").default(0.8), // 0-1 confidence in this memory
  source: varchar("source", { length: 100 }), // "conversation", "feedback", "inferred"
  usageCount: integer("usageCount").default(0), // How often this memory has been used
  lastUsed: timestamp("lastUsed"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type ExpertMemory = typeof expertMemory.$inferSelect;
export type InsertExpertMemory = typeof expertMemory.$inferInsert;

/**
 * Expert prompt evolution - track how expert prompts change over time
 * Enables self-improvement based on feedback
 */
export const expertPromptEvolution = pgTable("expert_prompt_evolution", {
  id: serial("id").primaryKey(),
  expertId: varchar("expertId", { length: 50 }).notNull(),
  version: integer("version").notNull(),
  promptAdditions: text("promptAdditions"), // Additional instructions added
  communicationStyle: text("communicationStyle"), // Learned communication preferences
  strengthAdjustments: jsonb("strengthAdjustments"), // Adjusted strength scores
  weaknessAdjustments: jsonb("weaknessAdjustments"), // Adjusted weakness areas
  reason: text("reason"), // Why this change was made
  performanceBefore: real("performanceBefore"),
  performanceAfter: real("performanceAfter"),
  appliedAt: timestamp("appliedAt").defaultNow().notNull(),
  createdBy: varchar("createdBy", { length: 50 }), // "chief_of_staff", "user_feedback", "auto"
});

export type ExpertPromptEvolution = typeof expertPromptEvolution.$inferSelect;
export type InsertExpertPromptEvolution = typeof expertPromptEvolution.$inferInsert;

/**
 * Expert insights - shared knowledge repository
 * Insights generated by experts that can be referenced by others
 */
export const expertInsights = pgTable("expert_insights", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  expertId: varchar("expertId", { length: 50 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(), // "market", "strategy", "operations", etc.
  title: varchar("title", { length: 300 }).notNull(),
  insight: text("insight").notNull(),
  evidence: text("evidence"), // Supporting data/reasoning
  confidence: real("confidence").default(0.7),
  tags: jsonb("tags"), // Array of tags for searchability
  projectId: integer("projectId"),
  relatedExpertIds: jsonb("relatedExpertIds"), // Other experts who contributed
  usageCount: integer("usageCount").default(0), // How often referenced by other experts
  validatedBy: jsonb("validatedBy"), // Array of expert IDs who validated this
  status: statusEnum.default("draft"),
  expiresAt: timestamp("expiresAt"), // When this insight should be reviewed
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type ExpertInsight = typeof expertInsights.$inferSelect;
export type InsertExpertInsight = typeof expertInsights.$inferInsert;

/**
 * Expert research tasks - scheduled research for domain updates
 * Keeps experts current in their field
 */
export const expertResearchTasks = pgTable("expert_research_tasks", {
  id: serial("id").primaryKey(),
  expertId: varchar("expertId", { length: 50 }).notNull(),
  topic: varchar("topic", { length: 300 }).notNull(),
  description: text("description"),
  priority: priorityEnum.default("medium"),
  status: statusEnum.default("pending"),
  scheduledFor: timestamp("scheduledFor"),
  completedAt: timestamp("completedAt"),
  findings: text("findings"), // Research results
  sourcesUsed: jsonb("sourcesUsed"), // Array of sources consulted
  insightsGenerated: jsonb("insightsGenerated"), // IDs of insights created from this research
  assignedBy: varchar("assignedBy", { length: 50 }), // "chief_of_staff", "user", "auto"
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ExpertResearchTask = typeof expertResearchTasks.$inferSelect;
export type InsertExpertResearchTask = typeof expertResearchTasks.$inferInsert;

/**
 * Expert collaboration log - track how experts work together
 * Records cross-expert interactions and knowledge sharing
 */
export const expertCollaboration = pgTable("expert_collaboration", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  initiatorExpertId: varchar("initiatorExpertId", { length: 50 }).notNull(),
  collaboratorExpertIds: jsonb("collaboratorExpertIds").notNull(), // Array of expert IDs
  projectId: integer("projectId"),
  taskDescription: text("taskDescription").notNull(),
  outcome: text("outcome"),
  qualityScore: integer("qualityScore"), // 1-10 rating of collaboration
  lessonsLearned: text("lessonsLearned"), // What was learned from this collaboration
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ExpertCollaboration = typeof expertCollaboration.$inferSelect;
export type InsertExpertCollaboration = typeof expertCollaboration.$inferInsert;

/**
 * Expert coaching sessions - Chief of Staff training experts
 * Records coaching interactions to improve expert performance
 */
export const expertCoachingSessions = pgTable("expert_coaching_sessions", {
  id: serial("id").primaryKey(),
  expertId: varchar("expertId", { length: 50 }).notNull(),
  coachType: coachTypeEnum.notNull(),
  coachId: varchar("coachId", { length: 50 }), // ID of coaching expert if peer
  focusArea: varchar("focusArea", { length: 200 }).notNull(), // "communication", "accuracy", "speed", etc.
  feedbackGiven: text("feedbackGiven").notNull(),
  improvementPlan: text("improvementPlan"),
  metricsBeforeCoaching: jsonb("metricsBeforeCoaching"),
  metricsAfterCoaching: jsonb("metricsAfterCoaching"),
  status: statusEnum.default("scheduled"),
  scheduledAt: timestamp("scheduledAt"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ExpertCoachingSession = typeof expertCoachingSessions.$inferSelect;
export type InsertExpertCoachingSession = typeof expertCoachingSessions.$inferInsert;

/**
 * Expert domain knowledge - structured knowledge per expert domain
 * Tracks what each expert knows and when it was last updated
 */
export const expertDomainKnowledge = pgTable("expert_domain_knowledge", {
  id: serial("id").primaryKey(),
  expertId: varchar("expertId", { length: 50 }).notNull(),
  domain: varchar("domain", { length: 200 }).notNull(), // "private_equity", "strategy", "marketing", etc.
  subDomain: varchar("subDomain", { length: 200 }), // More specific area
  knowledgeLevel: knowledgeLevelEnum.default("advanced"),
  lastUpdated: timestamp("lastUpdated").defaultNow().notNull(),
  updateFrequency: varchar("updateFrequency", { length: 50 }).default("weekly"), // How often to refresh
  sources: jsonb("sources"), // Preferred sources for this domain
  keyFrameworks: jsonb("keyFrameworks"), // Frameworks this expert uses
  recentDevelopments: text("recentDevelopments"), // Latest updates in this domain
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type ExpertDomainKnowledge = typeof expertDomainKnowledge.$inferSelect;
export type InsertExpertDomainKnowledge = typeof expertDomainKnowledge.$inferInsert;


/**
 * Favorite contacts - quick access to frequently messaged contacts
 * Allows users to star/favorite contacts for quick access in the Message Chief of Staff section
 */
export const favoriteContacts = pgTable("favorite_contacts", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  contactType: contactTypeEnum.notNull(),
  contactId: varchar("contactId", { length: 100 }).notNull(), // ID of the expert, partner, or colleague
  contactName: varchar("contactName", { length: 200 }).notNull(), // Display name
  contactAvatar: varchar("contactAvatar", { length: 500 }), // Avatar URL
  order: integer("order").default(0), // For custom ordering
  isFavorited: boolean("isFavorited").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type FavoriteContact = typeof favoriteContacts.$inferSelect;
export type InsertFavoriteContact = typeof favoriteContacts.$inferInsert;


/**
 * SME Teams - assembled teams of AI experts for specific projects/tasks
 * Users can create and save teams for reuse
 */
export const smeTeams = pgTable("sme_teams", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  purpose: varchar("purpose", { length: 300 }), // What this team is for
  projectId: integer("projectId"), // Optional link to a project
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type SmeTeam = typeof smeTeams.$inferSelect;
export type InsertSmeTeam = typeof smeTeams.$inferInsert;

/**
 * SME Team Members - experts assigned to a team
 */
export const smeTeamMembers = pgTable("sme_team_members", {
  id: serial("id").primaryKey(),
  teamId: integer("teamId").notNull(),
  expertId: varchar("expertId", { length: 50 }).notNull(), // References AI expert ID
  role: varchar("role", { length: 100 }), // Role within the team (e.g., "Lead", "Reviewer")
  addedAt: timestamp("addedAt").defaultNow().notNull(),
});

export type SmeTeamMember = typeof smeTeamMembers.$inferSelect;
export type InsertSmeTeamMember = typeof smeTeamMembers.$inferInsert;

/**
 * Task QA Reviews - dual verification system (Chief of Staff + Secondary AI)
 * Tracks quality assurance reviews for each task
 */
export const taskQaReviews = pgTable("task_qa_reviews", {
  id: serial("id").primaryKey(),
  taskId: integer("taskId").notNull(),
  reviewType: reviewTypeEnum.notNull(),
  reviewerId: varchar("reviewerId", { length: 100 }), // "chief_of_staff" or AI expert ID
  score: integer("score"), // 1-10 quality score
  feedback: text("feedback"),
  status: statusEnum.default("pending").notNull(),
  improvements: jsonb("improvements"), // Suggested improvements
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type TaskQaReview = typeof taskQaReviews.$inferSelect;
export type InsertTaskQaReview = typeof taskQaReviews.$inferInsert;

/**
 * SME Feedback Log - feedback from Chief of Staff to individual SME experts
 * Helps experts learn and improve over time
 */
export const smeFeedbackLog = pgTable("sme_feedback_log", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  expertId: varchar("expertId", { length: 50 }).notNull(),
  taskId: integer("taskId"),
  feedbackType: feedbackTypeEnum.notNull(),
  feedback: text("feedback").notNull(),
  context: varchar("context", { length: 200 }), // What prompted this feedback
  applied: boolean("applied").default(false), // Whether the expert has "learned" from this
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SmeFeedbackLog = typeof smeFeedbackLog.$inferSelect;
export type InsertSmeFeedbackLog = typeof smeFeedbackLog.$inferInsert;


/**
 * Expert Consultation History - tracks which experts user has consulted
 * Stores summaries and recommendations for quick reference
 */
export const expertConsultations = pgTable("expert_consultations", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  expertId: varchar("expertId", { length: 50 }).notNull(),
  expertName: varchar("expertName", { length: 200 }).notNull(),
  expertCategory: varchar("expertCategory", { length: 100 }),
  topic: varchar("topic", { length: 300 }), // What was discussed
  summary: text("summary"), // AI-generated summary of the consultation
  recommendations: jsonb("recommendations"), // Key recommendations from the expert
  userRating: integer("userRating"), // 1-10 rating of the consultation
  userFeedback: text("userFeedback"), // Optional feedback
  duration: integer("duration"), // Duration in seconds
  messageCount: integer("messageCount").default(0), // Number of messages exchanged
  projectId: integer("projectId"), // Optional link to project
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type ExpertConsultation = typeof expertConsultations.$inferSelect;
export type InsertExpertConsultation = typeof expertConsultations.$inferInsert;

/**
 * Expert Chat Sessions - individual chat sessions with experts
 * Stores messages and context for each chat session
 */
export const expertChatSessions = pgTable("expert_chat_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  expertId: varchar("expertId", { length: 50 }).notNull(),
  expertName: varchar("expertName", { length: 200 }),
  systemPrompt: text("systemPrompt"),
  projectId: integer("projectId"),
  consultationId: integer("consultationId"), // Link to parent consultation
  status: statusEnum.default("active").notNull(),
  summary: text("summary"),
  lastMessageAt: timestamp("lastMessageAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ExpertChatSession = typeof expertChatSessions.$inferSelect;
export type InsertExpertChatSession = typeof expertChatSessions.$inferInsert;

/**
 * Expert Chat Messages - individual messages in a chat session
 */
export const expertChatMessages = pgTable("expert_chat_messages", {
  id: serial("id").primaryKey(),
  sessionId: integer("sessionId").notNull(),
  role: roleEnum.notNull(),
  content: text("content").notNull(),
  metadata: jsonb("metadata"), // Additional context like voice input, attachments
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ExpertChatMessage = typeof expertChatMessages.$inferSelect;
export type InsertExpertChatMessage = typeof expertChatMessages.$inferInsert;


/**
 * Business Plan Review Versions - track review history over time
 */
export const businessPlanReviewVersions = pgTable("business_plan_review_versions", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  projectName: varchar("projectName", { length: 300 }).notNull(),
  versionNumber: integer("versionNumber").notNull(),
  versionLabel: varchar("versionLabel", { length: 100 }), // e.g., "Initial Draft", "Post-Feedback"
  overallScore: integer("overallScore"), // 0-100
  sectionScores: jsonb("sectionScores"), // { sectionId: score, ... }
  reviewData: jsonb("reviewData"), // Full review data including expert insights
  expertTeam: jsonb("expertTeam"), // List of expert IDs used
  teamSelectionMode: varchar("teamSelectionMode", { length: 50 }), // "chief-of-staff" or "manual"
  businessPlanContent: text("businessPlanContent"), // The content that was reviewed
  sectionDocuments: jsonb("sectionDocuments"), // { sectionId: { fileName, content }, ... }
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type BusinessPlanReviewVersion = typeof businessPlanReviewVersions.$inferSelect;
export type InsertBusinessPlanReviewVersion = typeof businessPlanReviewVersions.$inferInsert;

/**
 * Expert Follow-up Questions - Q&A with experts after review
 */
export const expertFollowUpQuestions = pgTable("expert_follow_up_questions", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  reviewVersionId: integer("reviewVersionId").notNull(), // Link to review version
  sectionId: varchar("sectionId", { length: 100 }).notNull(),
  expertId: varchar("expertId", { length: 100 }).notNull(),
  question: text("question").notNull(),
  answer: text("answer"),
  status: statusEnum.default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  answeredAt: timestamp("answeredAt"),
});

export type ExpertFollowUpQuestion = typeof expertFollowUpQuestions.$inferSelect;
export type InsertExpertFollowUpQuestion = typeof expertFollowUpQuestions.$inferInsert;

/**
 * Collaborative Review Sessions - Multi-user review sessions
 */
export const collaborativeReviewSessions = pgTable("collaborative_review_sessions", {
  id: serial("id").primaryKey(),
  ownerId: integer("ownerId").notNull(), // User who created the session
  projectName: varchar("projectName", { length: 255 }).notNull(),
  templateId: varchar("templateId", { length: 100 }),
  status: statusEnum.default("active").notNull(),
  reviewData: jsonb("reviewData"), // Current state of the review
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type CollaborativeReviewSession = typeof collaborativeReviewSessions.$inferSelect;
export type InsertCollaborativeReviewSession = typeof collaborativeReviewSessions.$inferInsert;

/**
 * Collaborative Review Participants - Users invited to a review session
 */
export const collaborativeReviewParticipants = pgTable("collaborative_review_participants", {
  id: serial("id").primaryKey(),
  sessionId: integer("sessionId").notNull(),
  userId: integer("userId").notNull(),
  role: roleEnum.default("viewer").notNull(),
  invitedBy: integer("invitedBy"),
  invitedAt: timestamp("invitedAt").defaultNow().notNull(),
  joinedAt: timestamp("joinedAt"),
  lastActiveAt: timestamp("lastActiveAt"),
});

export type CollaborativeReviewParticipant = typeof collaborativeReviewParticipants.$inferSelect;
export type InsertCollaborativeReviewParticipant = typeof collaborativeReviewParticipants.$inferInsert;

/**
 * Collaborative Review Comments - Comments on sections from collaborators
 */
export const collaborativeReviewComments = pgTable("collaborative_review_comments", {
  id: serial("id").primaryKey(),
  sessionId: integer("sessionId").notNull(),
  userId: integer("userId").notNull(),
  sectionId: varchar("sectionId", { length: 100 }).notNull(),
  comment: text("comment").notNull(),
  parentCommentId: integer("parentCommentId"), // For threaded replies
  status: statusEnum.default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type CollaborativeReviewComment = typeof collaborativeReviewComments.$inferSelect;
export type InsertCollaborativeReviewComment = typeof collaborativeReviewComments.$inferInsert;

/**
 * Collaborative Review Activity - Track who reviewed what
 */
export const collaborativeReviewActivity = pgTable("collaborative_review_activity", {
  id: serial("id").primaryKey(),
  sessionId: integer("sessionId").notNull(),
  userId: integer("userId").notNull(),
  action: actionEnum.notNull(),
  sectionId: varchar("sectionId", { length: 100 }),
  metadata: jsonb("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CollaborativeReviewActivity = typeof collaborativeReviewActivity.$inferSelect;
export type InsertCollaborativeReviewActivity = typeof collaborativeReviewActivity.$inferInsert;


// ============================================================================
// PRODUCTIVITY ENGINE FRAMEWORK TABLES
// Based on the AI-Powered Productivity Engine Framework v2.0
// ============================================================================

/**
 * Value Chain Phases - The 7 phases of the productivity engine
 * 1. Ideation, 2. Innovation, 3. Development, 4. Go-to-Market, 5. Operations, 6. Retention, 7. Exit
 */
export const valueChainPhases = pgTable("value_chain_phases", {
  id: serial("id").primaryKey(),
  phaseNumber: integer("phaseNumber").notNull(), // 1-7
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  primaryFocus: text("primaryFocus"),
  keyExpertPanels: jsonb("keyExpertPanels"), // Array of panel categories
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ValueChainPhase = typeof valueChainPhases.$inferSelect;
export type InsertValueChainPhase = typeof valueChainPhases.$inferInsert;

/**
 * Blueprints - Standardized process documents that track through phases
 */
export const blueprints = pgTable("blueprints", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  projectId: integer("projectId"), // Link to projects table
  name: varchar("name", { length: 300 }).notNull(),
  description: text("description"),
  blueprintType: mysqlEnum("blueprintType", [
    "opportunity_brief",
    "concept_proposal",
    "business_case",
    "project_charter",
    "gtm_plan",
    "operations_playbook",
    "retention_plan",
    "exit_readiness",
    "process_document",
    "other"
  ]).notNull(),
  currentPhase: integer("currentPhase").default(1).notNull(), // 1-7
  status: mysqlEnum("status", [
    "draft",
    "in_review",
    "approved",
    "rejected",
    "archived"
  ]).default("draft").notNull(),
  version: integer("version").default(1).notNull(),
  content: jsonb("content"), // Structured content of the blueprint
  fileUrl: text("fileUrl"), // S3 URL if file uploaded
  qualityGateStatus: mysqlEnum("qualityGateStatus", [
    "not_started",
    "level_1_complete",
    "level_2_complete",
    "level_3_complete",
    "level_4_complete"
  ]).default("not_started").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type Blueprint = typeof blueprints.$inferSelect;
export type InsertBlueprint = typeof blueprints.$inferInsert;

/**
 * Blueprint Versions - Track document history
 */
export const blueprintVersions = pgTable("blueprint_versions", {
  id: serial("id").primaryKey(),
  blueprintId: integer("blueprintId").notNull(),
  version: integer("version").notNull(),
  content: jsonb("content"),
  fileUrl: text("fileUrl"),
  changeDescription: text("changeDescription"),
  createdBy: integer("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type BlueprintVersion = typeof blueprintVersions.$inferSelect;
export type InsertBlueprintVersion = typeof blueprintVersions.$inferInsert;

/**
 * SME Panel Types - Blue Team, Left-Field, Red Team (Devil's Advocate)
 */
export const smePanelTypes = pgTable("sme_panel_types", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  code: codeEnum.notNull(),
  description: text("description"),
  role: text("role"), // What this panel does
  typicalComposition: jsonb("typicalComposition"), // Array of expert categories
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SmePanelType = typeof smePanelTypes.$inferSelect;
export type InsertSmePanelType = typeof smePanelTypes.$inferInsert;

/**
 * SME Panels - Assembled panels for specific reviews
 */
export const smePanels = pgTable("sme_panels", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  blueprintId: integer("blueprintId"), // Optional link to blueprint
  projectId: integer("projectId"), // Optional link to project
  panelTypeCode: panelTypeCodeEnum.notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  purpose: text("purpose"),
  phase: integer("phase"), // Which value chain phase (1-7)
  status: statusEnum.default("assembling").notNull(),
  expertIds: jsonb("expertIds"), // Array of expert IDs assigned to this panel
  metadata: jsonb("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type SmePanel = typeof smePanels.$inferSelect;
export type InsertSmePanel = typeof smePanels.$inferInsert;

/**
 * SME Panel Consultations - Records of panel reviews and feedback
 */
export const smePanelConsultations = pgTable("sme_panel_consultations", {
  id: serial("id").primaryKey(),
  panelId: integer("panelId").notNull(),
  blueprintId: integer("blueprintId"),
  consultationType: mysqlEnum("consultationType", [
    "concept_review",
    "pre_mortem",
    "red_team_challenge",
    "validation_review",
    "quality_gate_review",
    "ad_hoc"
  ]).notNull(),
  question: text("question"), // What was asked of the panel
  findings: jsonb("findings"), // Structured findings from each expert
  recommendations: text("recommendations"),
  risksIdentified: jsonb("risksIdentified"), // Array of risks
  status: statusEnum.default("pending").notNull(),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SmePanelConsultation = typeof smePanelConsultations.$inferSelect;
export type InsertSmePanelConsultation = typeof smePanelConsultations.$inferInsert;

/**
 * Quality Gates - 4-level review protocol at each phase
 */
export const qualityGates = pgTable("quality_gates", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  blueprintId: integer("blueprintId").notNull(),
  phase: integer("phase").notNull(), // Which value chain phase (1-7)
  gateName: varchar("gateName", { length: 200 }).notNull(),
  level1Complete: boolean("level1Complete").default(false), // Completeness Check
  level1CompletedAt: timestamp("level1CompletedAt"),
  level1Notes: text("level1Notes"),
  level2Complete: boolean("level2Complete").default(false), // Expert Validation Review
  level2CompletedAt: timestamp("level2CompletedAt"),
  level2Notes: text("level2Notes"),
  level3Complete: boolean("level3Complete").default(false), // Strategic Fit & Feasibility
  level3CompletedAt: timestamp("level3CompletedAt"),
  level3Notes: text("level3Notes"),
  level4Decision: level4DecisionEnum,
  level4CompletedAt: timestamp("level4CompletedAt"),
  level4Rationale: text("level4Rationale"),
  gatekeeper: varchar("gatekeeper", { length: 100 }).default("Chief of Staff"),
  status: statusEnum.default("not_started").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type QualityGate = typeof qualityGates.$inferSelect;
export type InsertQualityGate = typeof qualityGates.$inferInsert;

/**
 * Process Playbooks - Templates for each phase's processes
 */
export const processPlaybooks = pgTable("process_playbooks", {
  id: serial("id").primaryKey(),
  phase: integer("phase").notNull(), // Which value chain phase (1-7)
  processNumber: varchar("processNumber", { length: 20 }).notNull(), // e.g., "1.1", "2.2"
  name: varchar("name", { length: 200 }).notNull(),
  objective: text("objective"),
  activities: jsonb("activities"), // Array of activity objects
  manusDelegation: jsonb("manusDelegation"), // What Manus can do for each activity
  tools: jsonb("tools"), // Tools used in this process
  expertPanels: jsonb("expertPanels"), // Which panels are involved
  qualityGateCriteria: jsonb("qualityGateCriteria"), // Criteria for passing quality gate
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type ProcessPlaybook = typeof processPlaybooks.$inferSelect;
export type InsertProcessPlaybook = typeof processPlaybooks.$inferInsert;

/**
 * Pre-Mortem Sessions - Proactive failure analysis
 */
export const preMortemSessions = pgTable("pre_mortem_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  blueprintId: integer("blueprintId"),
  projectId: integer("projectId"),
  sessionType: mysqlEnum("sessionType", [
    "concept_pre_mortem",
    "business_case_pre_mortem",
    "launch_pre_mortem",
    "churn_pre_mortem",
    "buyer_objection_pre_mortem"
  ]).notNull(),
  scenario: text("scenario"), // "Assume the project has failed..."
  failureReasons: jsonb("failureReasons"), // Array of identified failure reasons
  criticalAssumptions: jsonb("criticalAssumptions"), // Assumptions that must be tested
  mitigationStrategies: jsonb("mitigationStrategies"), // How to address each risk
  panelId: integer("panelId"), // Which SME panel conducted this
  status: statusEnum.default("scheduled").notNull(),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PreMortemSession = typeof preMortemSessions.$inferSelect;
export type InsertPreMortemSession = typeof preMortemSessions.$inferInsert;

/**
 * Lessons Learned - Post-project insights repository
 */
export const lessonsLearned = pgTable("lessons_learned", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  projectId: integer("projectId"),
  blueprintId: integer("blueprintId"),
  phase: integer("phase"), // Which phase this lesson applies to
  category: mysqlEnum("category", [
    "what_went_well",
    "what_didnt_work",
    "process_improvement",
    "tool_recommendation",
    "expert_insight",
    "risk_mitigation"
  ]).notNull(),
  title: varchar("title", { length: 300 }).notNull(),
  description: text("description").notNull(),
  impact: impactEnum.default("medium"),
  actionTaken: text("actionTaken"),
  tags: jsonb("tags"), // Array of tags for searchability
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type LessonLearned = typeof lessonsLearned.$inferSelect;
export type InsertLessonLearned = typeof lessonsLearned.$inferInsert;

/**
 * Tool Integrations - Connected external tools and their status
 */
export const toolIntegrations = pgTable("tool_integrations", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  toolName: varchar("toolName", { length: 100 }).notNull(),
  category: mysqlEnum("category", [
    "project_management",
    "ai_assistant",
    "development",
    "automation",
    "content_creation",
    "communication",
    "business_crm",
    "security",
    "other"
  ]).notNull(),
  purpose: text("purpose"),
  plan: varchar("plan", { length: 50 }), // "Free", "Pro", "Enterprise"
  status: statusEnum.default("pending").notNull(),
  apiKeyConfigured: boolean("apiKeyConfigured").default(false),
  lastSyncAt: timestamp("lastSyncAt"),
  healthScore: integer("healthScore").default(100), // 0-100
  alertMessage: text("alertMessage"),
  valueChainPhases: jsonb("valueChainPhases"), // Which phases this tool is used in
  metadata: jsonb("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type ToolIntegration = typeof toolIntegrations.$inferSelect;
export type InsertToolIntegration = typeof toolIntegrations.$inferInsert;

/**
 * Manus Delegation Log - Track what Manus does autonomously
 */
export const manusDelegationLog = pgTable("manus_delegation_log", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  blueprintId: integer("blueprintId"),
  projectId: integer("projectId"),
  phase: integer("phase"),
  processNumber: varchar("processNumber", { length: 20 }),
  activityName: varchar("activityName", { length: 200 }).notNull(),
  delegationType: mysqlEnum("delegationType", [
    "document_generation",
    "data_analysis",
    "research",
    "scheduling",
    "communication",
    "monitoring",
    "reporting",
    "quality_check"
  ]).notNull(),
  input: jsonb("input"), // What was provided to Manus
  output: jsonb("output"), // What Manus produced
  status: statusEnum.default("pending").notNull(),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ManusDelegationLog = typeof manusDelegationLog.$inferSelect;
export type InsertManusDelegationLog = typeof manusDelegationLog.$inferInsert;

/**
 * Expert Panel Assignments - Which experts are assigned to which panel type
 */
export const expertPanelAssignments = pgTable("expert_panel_assignments", {
  id: serial("id").primaryKey(),
  expertId: varchar("expertId", { length: 100 }).notNull(),
  panelTypeCode: panelTypeCodeEnum.notNull(),
  expertCategory: varchar("expertCategory", { length: 100 }), // e.g., "Strategy", "Finance", "Legal"
  strengthAreas: jsonb("strengthAreas"), // What this expert is good at for this panel type
  isDefault: boolean("isDefault").default(false), // Is this a default assignment?
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ExpertPanelAssignment = typeof expertPanelAssignments.$inferSelect;
export type InsertExpertPanelAssignment = typeof expertPanelAssignments.$inferInsert;


// ============================================================================
// EVENING REVIEW SYSTEM TABLES
// ============================================================================

/**
 * Evening Review Sessions - Track each evening review session
 */
export const eveningReviewSessions = pgTable("evening_review_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  reviewDate: timestamp("reviewDate").notNull(),
  startedAt: timestamp("startedAt").notNull(),
  completedAt: timestamp("completedAt"),
  mode: modeEnum.default("manual").notNull(),
  tasksAccepted: integer("tasksAccepted").default(0).notNull(),
  tasksDeferred: integer("tasksDeferred").default(0).notNull(),
  tasksRejected: integer("tasksRejected").default(0).notNull(),
  moodScore: integer("moodScore"), // 1-10
  wentWellNotes: text("wentWellNotes"),
  didntGoWellNotes: text("didntGoWellNotes"),
  signalItemsGenerated: integer("signalItemsGenerated").default(0),
  metadata: jsonb("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EveningReviewSession = typeof eveningReviewSessions.$inferSelect;
export type InsertEveningReviewSession = typeof eveningReviewSessions.$inferInsert;

/**
 * Evening Review Task Decisions - Individual task decisions from reviews
 */
export const eveningReviewTaskDecisions = pgTable("evening_review_task_decisions", {
  id: serial("id").primaryKey(),
  sessionId: integer("sessionId").notNull(),
  taskId: integer("taskId"), // Link to tasks table if applicable
  taskTitle: varchar("taskTitle", { length: 500 }).notNull(),
  projectName: varchar("projectName", { length: 200 }),
  decision: decisionEnum.notNull(),
  priority: varchar("priority", { length: 20 }),
  estimatedTime: varchar("estimatedTime", { length: 50 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EveningReviewTaskDecision = typeof eveningReviewTaskDecisions.$inferSelect;
export type InsertEveningReviewTaskDecision = typeof eveningReviewTaskDecisions.$inferInsert;

/**
 * Review Timing Patterns - Learn user's review habits
 */
export const reviewTimingPatterns = pgTable("review_timing_patterns", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  dayOfWeek: integer("dayOfWeek").notNull(), // 0-6 (Sunday-Saturday)
  averageStartTime: varchar("averageStartTime", { length: 10 }), // HH:MM format
  averageDuration: integer("averageDuration"), // minutes
  completionRate: real("completionRate").default(0), // 0-1
  autoProcessRate: real("autoProcessRate").default(0), // 0-1
  sampleCount: integer("sampleCount").default(0).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type ReviewTimingPattern = typeof reviewTimingPatterns.$inferSelect;
export type InsertReviewTimingPattern = typeof reviewTimingPatterns.$inferInsert;

/**
 * Signal Items - Items prepared for the morning Signal briefing
 */
export const signalItems = pgTable("signal_items", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  sourceType: sourceTypeEnum.notNull(),
  sourceId: integer("sourceId"), // ID of source record
  category: categoryEnum.notNull(),
  title: varchar("title", { length: 300 }).notNull(),
  description: text("description"),
  priority: priorityEnum.default("medium").notNull(),
  targetDate: timestamp("targetDate").notNull(), // Which morning this is for
  status: statusEnum.default("pending").notNull(),
  deliveredAt: timestamp("deliveredAt"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SignalItem = typeof signalItems.$inferSelect;
export type InsertSignalItem = typeof signalItems.$inferInsert;

/**
 * Calendar Events Cache - Cached calendar events for smart prompting
 */
export const calendarEventsCache = pgTable("calendar_events_cache", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  externalId: varchar("externalId", { length: 200 }), // ID from external calendar
  title: varchar("title", { length: 500 }).notNull(),
  startTime: timestamp("startTime").notNull(),
  endTime: timestamp("endTime").notNull(),
  isAllDay: boolean("isAllDay").default(false).notNull(),
  location: varchar("location", { length: 500 }),
  attendees: jsonb("attendees"),
  source: varchar("source", { length: 50 }), // "google", "outlook", "manual"
  metadata: jsonb("metadata"),
  syncedAt: timestamp("syncedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CalendarEventCache = typeof calendarEventsCache.$inferSelect;
export type InsertCalendarEventCache = typeof calendarEventsCache.$inferInsert;


/**
 * Innovation Ideas - Captured ideas for strategic assessment
 */
export const innovationIdeas = pgTable("innovation_ideas", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  title: varchar("title", { length: 300 }).notNull(),
  description: text("description"),
  source: sourceEnum.default("manual").notNull(),
  sourceUrl: text("sourceUrl"), // URL if from article
  sourceMetadata: jsonb("sourceMetadata"), // Additional source context
  status: statusEnum.default("captured").notNull(),
  currentStage: integer("currentStage").default(1).notNull(), // 1-5 flywheel stage
  priority: priorityEnum.default("medium").notNull(),
  category: varchar("category", { length: 100 }), // "business", "product", "investment", "trend", etc.
  tags: jsonb("tags"), // Array of tags
  estimatedInvestment: jsonb("estimatedInvestment"), // { min: number, max: number, currency: string }
  estimatedReturn: jsonb("estimatedReturn"), // { min: number, max: number, timeframe: string }
  confidenceScore: real("confidenceScore"), // 0-100 overall confidence
  briefDocument: text("briefDocument"), // Generated brief summary
  promotedToProjectId: integer("promotedToProjectId"), // If promoted to Project Genesis
  metadata: jsonb("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type InnovationIdea = typeof innovationIdeas.$inferSelect;
export type InsertInnovationIdea = typeof innovationIdeas.$inferInsert;

/**
 * Idea Assessments - Strategic framework evaluations
 */
export const ideaAssessments = pgTable("idea_assessments", {
  id: serial("id").primaryKey(),
  ideaId: integer("ideaId").notNull(),
  assessmentType: mysqlEnum("assessmentType", [
    "market_analysis",
    "feasibility",
    "competitive_landscape",
    "financial_viability",
    "resource_requirements",
    "risk_assessment",
    "timing_analysis",
    "strategic_fit",
    "sme_consultation"
  ]).notNull(),
  stage: integer("stage").notNull(), // Which flywheel stage (1-5)
  assessorType: assessorTypeEnum.default("framework").notNull(),
  assessorId: varchar("assessorId", { length: 100 }), // SME expert ID if applicable
  questions: jsonb("questions"), // Array of { question: string, answer: string, score: number }
  findings: text("findings"),
  score: real("score"), // 0-100 score for this assessment
  recommendation: recommendationEnum.default("needs_more_info").notNull(),
  refinementSuggestions: jsonb("refinementSuggestions"), // Array of suggestions
  metadata: jsonb("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type IdeaAssessment = typeof ideaAssessments.$inferSelect;
export type InsertIdeaAssessment = typeof ideaAssessments.$inferInsert;

/**
 * Idea Refinements - Flywheel iteration history
 */
export const ideaRefinements = pgTable("idea_refinements", {
  id: serial("id").primaryKey(),
  ideaId: integer("ideaId").notNull(),
  fromStage: integer("fromStage").notNull(),
  toStage: integer("toStage").notNull(),
  refinementType: mysqlEnum("refinementType", [
    "pivot",
    "scope_change",
    "target_market_change",
    "business_model_change",
    "investment_adjustment",
    "feature_addition",
    "feature_removal",
    "timeline_adjustment",
    "risk_mitigation"
  ]).notNull(),
  previousState: jsonb("previousState"), // Snapshot of idea before refinement
  changes: jsonb("changes"), // What changed
  rationale: text("rationale"), // Why this refinement was made
  triggeredBy: triggeredByEnum.default("assessment").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type IdeaRefinement = typeof ideaRefinements.$inferSelect;
export type InsertIdeaRefinement = typeof ideaRefinements.$inferInsert;

/**
 * Investment Scenarios - Budget-based analysis for ideas
 */
export const investmentScenarios = pgTable("investment_scenarios", {
  id: serial("id").primaryKey(),
  ideaId: integer("ideaId").notNull(),
  scenarioName: varchar("scenarioName", { length: 100 }).notNull(), // "Bootstrap", "Seed", "Growth"
  investmentAmount: real("investmentAmount").notNull(),
  currency: varchar("currency", { length: 10 }).default("GBP").notNull(),
  breakdown: jsonb("breakdown"), // { website: number, marketing: number, operations: number, etc. }
  projectedRevenue: jsonb("projectedRevenue"), // { month3: number, month6: number, year1: number }
  projectedProfit: jsonb("projectedProfit"),
  timeToBreakeven: integer("timeToBreakeven"), // Months
  riskLevel: riskLevelEnum.default("medium").notNull(),
  keyAssumptions: jsonb("keyAssumptions"), // Array of assumptions
  recommendations: text("recommendations"),
  isRecommended: boolean("isRecommended").default(false).notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type InvestmentScenario = typeof investmentScenarios.$inferSelect;
export type InsertInvestmentScenario = typeof investmentScenarios.$inferInsert;

/**
 * Trend Repository - Tracked trends for Chief of Staff deep dives
 */
export const trendRepository = pgTable("trend_repository", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  title: varchar("title", { length: 300 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }), // "technology", "market", "consumer", "regulatory", etc.
  source: varchar("source", { length: 200 }),
  sourceUrl: text("sourceUrl"),
  trendStrength: trendStrengthEnum.default("emerging").notNull(),
  relevanceScore: real("relevanceScore"), // 0-100 how relevant to user's interests
  potentialImpact: potentialImpactEnum.default("medium").notNull(),
  timeHorizon: varchar("timeHorizon", { length: 50 }), // "3 months", "1 year", "3-5 years"
  relatedIndustries: jsonb("relatedIndustries"), // Array of industries
  keyInsights: jsonb("keyInsights"), // Array of insights
  linkedIdeaIds: jsonb("linkedIdeaIds"), // Ideas generated from this trend
  lastAnalyzedAt: timestamp("lastAnalyzedAt"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type TrendRepository = typeof trendRepository.$inferSelect;
export type InsertTrendRepository = typeof trendRepository.$inferInsert;


/**
 * Generated Documents - Document Library for all CEPHO outputs
 */
export const generatedDocuments = pgTable("generated_documents", {
  id: serial("id").primaryKey(),
  documentId: varchar("documentId", { length: 100 }).notNull().unique(), // DOC-{timestamp}-{random}
  userId: integer("userId").notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  type: typeEnum.notNull(),
  content: text("content"), // JSON stringified content
  classification: classificationEnum.default("internal").notNull(),
  qaStatus: qaStatusEnum.default("pending").notNull(),
  qaApprover: varchar("qaApprover", { length: 200 }),
  qaApprovedAt: timestamp("qaApprovedAt"),
  qaNotes: text("qaNotes"),
  markdownUrl: text("markdownUrl"), // S3 URL to markdown version
  htmlUrl: text("htmlUrl"), // S3 URL to HTML version
  pdfUrl: text("pdfUrl"), // S3 URL to PDF version
  relatedIdeaId: integer("relatedIdeaId"), // Link to innovation idea
  relatedProjectId: integer("relatedProjectId"), // Link to project genesis
  metadata: jsonb("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type GeneratedDocument = typeof generatedDocuments.$inferSelect;
export type InsertGeneratedDocument = typeof generatedDocuments.$inferInsert;


/**
 * Funding Programs - Government funding programs database (UAE & UK)
 */
export const fundingPrograms = pgTable("funding_programs", {
  id: serial("id").primaryKey(),
  programId: varchar("programId", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 300 }).notNull(),
  country: countryEnum.notNull(),
  region: varchar("region", { length: 100 }), // e.g., "Dubai", "Abu Dhabi", "England"
  type: mysqlEnum("type", [
    "grant",
    "loan",
    "tax_credit",
    "equity",
    "accelerator",
    "incubator",
    "competition",
    "other"
  ]).notNull(),
  provider: varchar("provider", { length: 200 }).notNull(), // e.g., "MBRIF", "Innovate UK"
  description: text("description"),
  fundingMin: real("fundingMin"), // Minimum funding amount in AED
  fundingMax: real("fundingMax"), // Maximum funding amount in AED
  equityRequired: real("equityRequired"), // Percentage if applicable
  interestRate: real("interestRate"), // For loans
  repaymentTerms: text("repaymentTerms"),
  eligibilityCriteria: jsonb("eligibilityCriteria"), // Array of criteria
  requiredDocuments: jsonb("requiredDocuments"), // Array of required documents
  applicationProcess: jsonb("applicationProcess"), // Steps to apply
  deadlines: jsonb("deadlines"), // Application deadlines
  sectors: jsonb("sectors"), // Eligible sectors
  stages: jsonb("stages"), // Eligible business stages (pre-seed, seed, etc.)
  websiteUrl: text("websiteUrl"),
  applicationUrl: text("applicationUrl"),
  contactEmail: varchar("contactEmail", { length: 320 }),
  successRate: real("successRate"), // Historical success rate percentage
  averageProcessingDays: integer("averageProcessingDays"),
  isActive: boolean("isActive").default(true).notNull(),
  lastUpdated: timestamp("lastUpdated"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type FundingProgram = typeof fundingPrograms.$inferSelect;
export type InsertFundingProgram = typeof fundingPrograms.$inferInsert;

/**
 * Funding Assessments - Idea eligibility assessments for funding programs
 */
export const fundingAssessments = pgTable("funding_assessments", {
  id: serial("id").primaryKey(),
  assessmentId: varchar("assessmentId", { length: 100 }).notNull().unique(),
  userId: integer("userId").notNull(),
  ideaId: integer("ideaId").notNull(), // Link to innovation idea
  programId: varchar("programId", { length: 100 }).notNull(), // Link to funding program
  eligibilityScore: real("eligibilityScore"), // 0-100 score
  eligibilityStatus: mysqlEnum("eligibilityStatus", [
    "highly_eligible",
    "eligible",
    "partially_eligible",
    "not_eligible",
    "needs_review"
  ]).default("needs_review").notNull(),
  criteriaResults: jsonb("criteriaResults"), // Detailed results per criterion
  strengths: jsonb("strengths"), // Array of strengths for this program
  gaps: jsonb("gaps"), // Array of gaps/missing requirements
  recommendations: jsonb("recommendations"), // How to improve eligibility
  estimatedFunding: real("estimatedFunding"), // Estimated funding amount in AED
  applicationReadiness: real("applicationReadiness"), // 0-100 how ready to apply
  generatedDocuments: jsonb("generatedDocuments"), // Auto-generated application materials
  notes: text("notes"),
  assessedAt: timestamp("assessedAt").defaultNow().notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type FundingAssessment = typeof fundingAssessments.$inferSelect;
export type InsertFundingAssessment = typeof fundingAssessments.$inferInsert;


// ==================== REVENUE INFRASTRUCTURE ====================

/**
 * Revenue streams - tracks all sources of income across ventures
 */
export const revenueStreams = pgTable("revenue_streams", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  ventureName: varchar("ventureName", { length: 200 }).notNull(), // e.g., "Celadon", "Boundless", "CEPHO.Ai"
  streamName: varchar("streamName", { length: 200 }).notNull(), // e.g., "Subscription", "Consulting", "Licensing"
  streamType: mysqlEnum("streamType", [
    "subscription",
    "one_time",
    "recurring",
    "licensing",
    "consulting",
    "commission",
    "advertising",
    "affiliate",
    "other"
  ]).notNull(),
  status: statusEnum.default("planned").notNull(),
  currency: varchar("currency", { length: 10 }).default("AED").notNull(),
  monthlyRecurring: real("monthlyRecurring").default(0), // MRR for recurring streams
  annualRecurring: real("annualRecurring").default(0), // ARR
  averageTransactionValue: real("averageTransactionValue").default(0),
  transactionsPerMonth: integer("transactionsPerMonth").default(0),
  marginPercentage: real("marginPercentage").default(0), // Gross margin %
  paymentProcessor: varchar("paymentProcessor", { length: 100 }), // "Stripe", "PayPal", "Bank Transfer"
  processorConnected: boolean("processorConnected").default(false),
  pricingModel: text("pricingModel"), // Description of pricing structure
  targetCustomerSegment: varchar("targetCustomerSegment", { length: 200 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type RevenueStream = typeof revenueStreams.$inferSelect;
export type InsertRevenueStream = typeof revenueStreams.$inferInsert;

/**
 * Revenue transactions - individual revenue events
 */
export const revenueTransactions = pgTable("revenue_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  streamId: integer("streamId").notNull(), // FK to revenueStreams
  transactionDate: timestamp("transactionDate").notNull(),
  amount: real("amount").notNull(),
  currency: varchar("currency", { length: 10 }).default("AED").notNull(),
  status: statusEnum.default("pending").notNull(),
  customerName: varchar("customerName", { length: 200 }),
  customerEmail: varchar("customerEmail", { length: 320 }),
  description: text("description"),
  invoiceNumber: varchar("invoiceNumber", { length: 100 }),
  paymentMethod: varchar("paymentMethod", { length: 100 }),
  processorTransactionId: varchar("processorTransactionId", { length: 200 }), // External reference
  metadata: jsonb("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type RevenueTransaction = typeof revenueTransactions.$inferSelect;
export type InsertRevenueTransaction = typeof revenueTransactions.$inferInsert;

/**
 * Pipeline opportunities - potential revenue being tracked
 */
export const pipelineOpportunities = pgTable("pipeline_opportunities", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  ventureName: varchar("ventureName", { length: 200 }).notNull(),
  opportunityName: varchar("opportunityName", { length: 300 }).notNull(),
  customerName: varchar("customerName", { length: 200 }),
  customerContact: varchar("customerContact", { length: 320 }),
  stage: mysqlEnum("stage", [
    "lead",
    "qualified",
    "proposal",
    "negotiation",
    "verbal_yes",
    "contract_sent",
    "won",
    "lost"
  ]).default("lead").notNull(),
  probability: integer("probability").default(10), // 0-100%
  estimatedValue: real("estimatedValue").notNull(),
  currency: varchar("currency", { length: 10 }).default("AED").notNull(),
  expectedCloseDate: timestamp("expectedCloseDate"),
  actualCloseDate: timestamp("actualCloseDate"),
  lostReason: text("lostReason"),
  nextAction: text("nextAction"),
  nextActionDate: timestamp("nextActionDate"),
  assignedTo: varchar("assignedTo", { length: 200 }),
  source: varchar("source", { length: 200 }), // How the lead was generated
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type PipelineOpportunity = typeof pipelineOpportunities.$inferSelect;
export type InsertPipelineOpportunity = typeof pipelineOpportunities.$inferInsert;

/**
 * Pricing tiers - product/service pricing structures
 */
export const pricingTiers = pgTable("pricing_tiers", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  streamId: integer("streamId").notNull(), // FK to revenueStreams
  tierName: varchar("tierName", { length: 100 }).notNull(), // e.g., "Starter", "Pro", "Enterprise"
  price: real("price").notNull(),
  currency: varchar("currency", { length: 10 }).default("AED").notNull(),
  billingPeriod: billingPeriodEnum.notNull(),
  features: jsonb("features"), // Array of features included
  limitations: jsonb("limitations"), // Usage limits, etc.
  isActive: boolean("isActive").default(true).notNull(),
  displayOrder: integer("displayOrder").default(0),
  stripePriceId: varchar("stripePriceId", { length: 200 }), // For Stripe integration
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type PricingTier = typeof pricingTiers.$inferSelect;
export type InsertPricingTier = typeof pricingTiers.$inferInsert;

/**
 * Customer accounts - track customers across ventures
 */
export const customerAccounts = pgTable("customer_accounts", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  ventureName: varchar("ventureName", { length: 200 }).notNull(),
  customerName: varchar("customerName", { length: 200 }).notNull(),
  customerType: customerTypeEnum.default("individual").notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 50 }),
  company: varchar("company", { length: 200 }),
  industry: varchar("industry", { length: 100 }),
  country: varchar("country", { length: 100 }),
  city: varchar("city", { length: 100 }),
  status: statusEnum.default("prospect").notNull(),
  lifetimeValue: real("lifetimeValue").default(0),
  currency: varchar("currency", { length: 10 }).default("AED").notNull(),
  acquisitionSource: varchar("acquisitionSource", { length: 200 }),
  acquisitionDate: timestamp("acquisitionDate"),
  churnDate: timestamp("churnDate"),
  churnReason: text("churnReason"),
  stripeCustomerId: varchar("stripeCustomerId", { length: 200 }),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type CustomerAccount = typeof customerAccounts.$inferSelect;
export type InsertCustomerAccount = typeof customerAccounts.$inferInsert;

/**
 * Revenue forecasts - projected revenue by period
 */
export const revenueForecasts = pgTable("revenue_forecasts", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  ventureName: varchar("ventureName", { length: 200 }),
  streamId: integer("streamId"), // Optional FK to specific stream
  forecastPeriod: varchar("forecastPeriod", { length: 20 }).notNull(), // "2026-Q1", "2026-02"
  periodType: periodTypeEnum.notNull(),
  projectedRevenue: real("projectedRevenue").notNull(),
  actualRevenue: real("actualRevenue"),
  currency: varchar("currency", { length: 10 }).default("AED").notNull(),
  assumptions: text("assumptions"), // What the forecast is based on
  confidence: confidenceEnum.default("medium"),
  variance: real("variance"), // Calculated difference actual vs projected
  variancePercentage: real("variancePercentage"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type RevenueForecast = typeof revenueForecasts.$inferSelect;
export type InsertRevenueForecast = typeof revenueForecasts.$inferInsert;

/**
 * Revenue metrics snapshots - periodic KPI tracking
 */
export const revenueMetricsSnapshots = pgTable("revenue_metrics_snapshots", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  snapshotDate: timestamp("snapshotDate").notNull(),
  totalMRR: real("totalMRR").default(0),
  totalARR: real("totalARR").default(0),
  totalRevenueMTD: real("totalRevenueMTD").default(0),
  totalRevenueYTD: real("totalRevenueYTD").default(0),
  pipelineValue: real("pipelineValue").default(0),
  weightedPipelineValue: real("weightedPipelineValue").default(0),
  activeCustomers: integer("activeCustomers").default(0),
  newCustomersMTD: integer("newCustomersMTD").default(0),
  churnedCustomersMTD: integer("churnedCustomersMTD").default(0),
  averageRevenuePerCustomer: real("averageRevenuePerCustomer").default(0),
  currency: varchar("currency", { length: 10 }).default("AED").notNull(),
  ventureBreakdown: jsonb("ventureBreakdown"), // Revenue by venture
  streamBreakdown: jsonb("streamBreakdown"), // Revenue by stream type
  metadata: jsonb("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type RevenueMetricsSnapshot = typeof revenueMetricsSnapshots.$inferSelect;
export type InsertRevenueMetricsSnapshot = typeof revenueMetricsSnapshots.$inferInsert;


/**
 * Customer Focus Group System
 * 
 * Provides virtual customer personas for idea validation, pricing feedback,
 * and product development insights. Integrated into Innovation Flywheel Stage 3-4.
 */

/**
 * Customer personas - diverse virtual customers for focus group feedback
 */
export const customerPersonas = pgTable("customer_personas", {
  id: serial("id").primaryKey(),
  
  // Basic demographics
  name: varchar("name", { length: 100 }).notNull(),
  age: integer("age").notNull(),
  gender: genderEnum.notNull(),
  nationality: varchar("nationality", { length: 100 }).notNull(),
  ethnicity: varchar("ethnicity", { length: 100 }),
  location: varchar("location", { length: 200 }).notNull(), // City, Country
  
  // Professional profile
  occupation: varchar("occupation", { length: 200 }).notNull(),
  industry: varchar("industry", { length: 100 }).notNull(),
  jobLevel: jobLevelEnum.notNull(),
  companySize: companySizeEnum,
  annualIncome: mysqlEnum("annualIncome", [
    "under_25k", "25k_50k", "50k_75k", "75k_100k", "100k_150k", 
    "150k_250k", "250k_500k", "500k_1m", "over_1m"
  ]),
  
  // Psychographics
  personalityType: varchar("personalityType", { length: 50 }), // e.g., "INTJ", "Early Adopter", "Pragmatist"
  buyingStyle: buyingStyleEnum,
  techSavviness: techSavvinessEnum,
  riskTolerance: riskToleranceEnum,
  
  // Interests and pain points
  interests: jsonb("interests"), // Array of interest areas
  painPoints: jsonb("painPoints"), // Array of common frustrations
  goals: jsonb("goals"), // Array of personal/professional goals
  
  // Bio and context
  bio: text("bio").notNull(), // Detailed background story
  avatar: varchar("avatar", { length: 500 }), // Avatar image URL
  
  // Categorization
  segment: varchar("segment", { length: 100 }), // e.g., "Tech Professional", "Healthcare Worker", "Small Business Owner"
  tier: tierEnum.default("core").notNull(), // For phased rollout
  
  // Metadata
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type CustomerPersona = typeof customerPersonas.$inferSelect;
export type InsertCustomerPersona = typeof customerPersonas.$inferInsert;

/**
 * Customer surveys - templates for gathering feedback
 */
export const customerSurveys = pgTable("customer_surveys", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  
  // Survey details
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  surveyType: mysqlEnum("surveyType", [
    "idea_validation",
    "pricing_feedback", 
    "feature_priority",
    "product_feedback",
    "market_research",
    "competitor_comparison",
    "user_experience"
  ]).notNull(),
  
  // Associated context
  innovationIdeaId: integer("innovationIdeaId"), // FK to innovation_ideas if validating an idea
  ventureName: varchar("ventureName", { length: 200 }),
  productName: varchar("productName", { length: 200 }),
  
  // Survey configuration
  questions: jsonb("questions").notNull(), // Array of question objects
  targetSegments: jsonb("targetSegments"), // Which customer segments to survey
  sampleSize: integer("sampleSize").default(25), // How many personas to survey
  
  // Status
  status: statusEnum.default("draft").notNull(),
  
  // Metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
  completedAt: timestamp("completedAt"),
});

export type CustomerSurvey = typeof customerSurveys.$inferSelect;
export type InsertCustomerSurvey = typeof customerSurveys.$inferInsert;

/**
 * Customer survey responses - AI generated responses from personas
 */
export const customerSurveyResponses = pgTable("customer_survey_responses", {
  id: serial("id").primaryKey(),
  surveyId: integer("surveyId").notNull(), // FK to customerSurveys
  personaId: integer("personaId").notNull(), // FK to customerPersonas
  
  // Response data
  responses: jsonb("responses").notNull(), // Array of answer objects matching questions
  
  // Sentiment and analysis
  overallSentiment: overallSentimentEnum,
  willingnessToPay: willingnessToPayEnum,
  suggestedPricePoint: real("suggestedPricePoint"),
  currency: varchar("currency", { length: 10 }).default("AED"),
  
  // Key insights extracted
  keyInsights: jsonb("keyInsights"), // Array of insight strings
  concerns: jsonb("concerns"), // Array of concern strings
  suggestions: jsonb("suggestions"), // Array of suggestion strings
  
  // Metadata
  generatedAt: timestamp("generatedAt").defaultNow().notNull(),
});

export type CustomerSurveyResponse = typeof customerSurveyResponses.$inferSelect;
export type InsertCustomerSurveyResponse = typeof customerSurveyResponses.$inferInsert;

/**
 * Customer feedback aggregations - summarized insights from surveys
 */
export const customerFeedbackAggregations = pgTable("customer_feedback_aggregations", {
  id: serial("id").primaryKey(),
  surveyId: integer("surveyId").notNull(), // FK to customerSurveys
  userId: integer("userId").notNull(),
  
  // Aggregate metrics
  totalResponses: integer("totalResponses").default(0),
  averageSentimentScore: real("averageSentimentScore"), // -2 to +2
  
  // Willingness to pay distribution
  wtpDistribution: jsonb("wtpDistribution"), // { definitely_not: 5, unlikely: 10, ... }
  averageSuggestedPrice: real("averageSuggestedPrice"),
  priceRangeMin: real("priceRangeMin"),
  priceRangeMax: real("priceRangeMax"),
  
  // Segment breakdowns
  sentimentBySegment: jsonb("sentimentBySegment"), // { "Tech Professional": 1.5, ... }
  wtpBySegment: jsonb("wtpBySegment"),
  
  // Top insights
  topPositives: jsonb("topPositives"), // Most common positive feedback
  topConcerns: jsonb("topConcerns"), // Most common concerns
  topSuggestions: jsonb("topSuggestions"), // Most common suggestions
  
  // Recommendations
  goNoGoRecommendation: goNoGoRecommendationEnum,
  recommendedPricePoint: real("recommendedPricePoint"),
  keyRecommendations: jsonb("keyRecommendations"), // Array of recommendation strings
  
  // Metadata
  aggregatedAt: timestamp("aggregatedAt").defaultNow().notNull(),
});

export type CustomerFeedbackAggregation = typeof customerFeedbackAggregations.$inferSelect;
export type InsertCustomerFeedbackAggregation = typeof customerFeedbackAggregations.$inferInsert;

/**
 * Focus group sessions - structured feedback sessions with multiple personas
 */
export const focusGroupSessions = pgTable("focus_group_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  
  // Session details
  title: varchar("title", { length: 200 }).notNull(),
  objective: text("objective").notNull(),
  sessionType: mysqlEnum("sessionType", [
    "concept_testing",
    "pricing_research",
    "feature_prioritization",
    "competitive_analysis",
    "brand_perception",
    "user_journey_mapping"
  ]).notNull(),
  
  // Associated context
  innovationIdeaId: integer("innovationIdeaId"),
  ventureName: varchar("ventureName", { length: 200 }),
  
  // Participants
  participantPersonaIds: jsonb("participantPersonaIds").notNull(), // Array of persona IDs
  participantCount: integer("participantCount").default(0),
  
  // Discussion guide
  discussionGuide: jsonb("discussionGuide"), // Array of discussion topics/questions
  
  // Session output
  transcript: text("transcript"), // Full session transcript
  keyThemes: jsonb("keyThemes"), // Extracted themes
  consensusPoints: jsonb("consensusPoints"), // Points of agreement
  divergencePoints: jsonb("divergencePoints"), // Points of disagreement
  
  // Status
  status: statusEnum.default("planned").notNull(),
  
  // Metadata
  scheduledFor: timestamp("scheduledFor"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type FocusGroupSession = typeof focusGroupSessions.$inferSelect;
export type InsertFocusGroupSession = typeof focusGroupSessions.$inferInsert;

/**
 * Innovation validation checkpoints - tracks customer validation in the flywheel
 */
export const innovationValidationCheckpoints = pgTable("innovation_validation_checkpoints", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  innovationIdeaId: integer("innovationIdeaId").notNull(), // FK to innovation_ideas
  
  // Flywheel stage
  flywheelStage: mysqlEnum("flywheelStage", [
    "capture",
    "assess", 
    "validate",
    "develop",
    "commercialize"
  ]).notNull(),
  
  // Validation type
  validationType: mysqlEnum("validationType", [
    "customer_survey",
    "focus_group",
    "pricing_test",
    "concept_test",
    "prototype_feedback"
  ]).notNull(),
  
  // Associated validation
  surveyId: integer("surveyId"), // FK to customerSurveys
  focusGroupId: integer("focusGroupId"), // FK to focusGroupSessions
  
  // Validation results
  validationScore: real("validationScore"), // 0-100
  passedValidation: boolean("passedValidation"),
  
  // Decision
  decision: decisionEnum.default("pending").notNull(),
  decisionRationale: text("decisionRationale"),
  
  // Sign-offs
  smeReviewCompleted: boolean("smeReviewCompleted").default(false),
  smeReviewNotes: text("smeReviewNotes"),
  chiefOfStaffApproved: boolean("chiefOfStaffApproved").default(false),
  chiefOfStaffNotes: text("chiefOfStaffNotes"),
  
  // Metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type InnovationValidationCheckpoint = typeof innovationValidationCheckpoints.$inferSelect;
export type InsertInnovationValidationCheckpoint = typeof innovationValidationCheckpoints.$inferInsert;


/**
 * Individual SME Assessment System
 * 
 * Enables each SME expert to provide individual scores across all 20 KPI categories,
 * with outlier detection and Chief of Staff review for discrepancies.
 */

/**
 * KPI categories - the 20 benchmark categories for platform assessment
 */
export const kpiCategories = pgTable("kpi_categories", {
  id: serial("id").primaryKey(),
  
  // Category identification
  categoryNumber: integer("categoryNumber").notNull().unique(), // 1-20
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description").notNull(),
  
  // Scoring guidance
  scoringCriteria: jsonb("scoringCriteria"), // What constitutes each score level
  excellentThreshold: integer("excellentThreshold").default(90), // 90%+
  goodThreshold: integer("goodThreshold").default(75), // 75-89%
  adequateThreshold: integer("adequateThreshold").default(60), // 60-74%
  developingThreshold: integer("developingThreshold").default(40), // 40-59%
  
  // Which panels assess this category
  assessingPanels: jsonb("assessingPanels"), // Array of panel names
  
  // Weighting
  weight: real("weight").default(1.0), // For weighted averages
  priority: priorityEnum.default("medium"),
  
  // Metadata
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type KpiCategory = typeof kpiCategories.$inferSelect;
export type InsertKpiCategory = typeof kpiCategories.$inferInsert;

/**
 * Individual SME assessments - each expert's individual scores
 */
export const smeIndividualAssessments = pgTable("sme_individual_assessments", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  
  // Assessment period
  assessmentPeriod: varchar("assessmentPeriod", { length: 20 }).notNull(), // e.g., "2026-01", "2026-Q1"
  assessmentDate: timestamp("assessmentDate").notNull(),
  
  // Expert identification
  expertId: varchar("expertId", { length: 100 }).notNull(), // Reference to AI expert
  expertName: varchar("expertName", { length: 200 }).notNull(),
  expertPanel: varchar("expertPanel", { length: 100 }).notNull(), // e.g., "Strategic Advisory", "Technology", "UX"
  expertSpecialization: varchar("expertSpecialization", { length: 200 }),
  
  // Category being assessed
  categoryId: integer("categoryId").notNull(), // FK to kpiCategories
  categoryNumber: integer("categoryNumber").notNull(), // 1-20
  categoryName: varchar("categoryName", { length: 200 }).notNull(),
  
  // Individual score
  score: integer("score").notNull(), // 0-100 percentage
  scoreOutOf10: real("scoreOutOf10"), // Converted to 10-point scale
  
  // Rationale and evidence
  rationale: text("rationale").notNull(), // Why this score
  strengths: jsonb("strengths"), // Array of observed strengths
  weaknesses: jsonb("weaknesses"), // Array of observed weaknesses
  evidence: jsonb("evidence"), // Specific examples supporting the score
  recommendations: jsonb("recommendations"), // Suggestions for improvement
  
  // Confidence
  confidenceLevel: confidenceLevelEnum.default("medium"),
  
  // Metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type SmeIndividualAssessment = typeof smeIndividualAssessments.$inferSelect;
export type InsertSmeIndividualAssessment = typeof smeIndividualAssessments.$inferInsert;

/**
 * Assessment outliers - flagged discrepancies for review
 */
export const assessmentOutliers = pgTable("assessment_outliers", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  
  // Assessment reference
  assessmentId: integer("assessmentId").notNull(), // FK to smeIndividualAssessments
  assessmentPeriod: varchar("assessmentPeriod", { length: 20 }).notNull(),
  
  // Category
  categoryId: integer("categoryId").notNull(),
  categoryNumber: integer("categoryNumber").notNull(),
  categoryName: varchar("categoryName", { length: 200 }).notNull(),
  
  // Expert who gave outlier score
  expertId: varchar("expertId", { length: 100 }).notNull(),
  expertName: varchar("expertName", { length: 200 }).notNull(),
  expertPanel: varchar("expertPanel", { length: 100 }).notNull(),
  
  // Outlier details
  expertScore: integer("expertScore").notNull(),
  panelAverage: real("panelAverage").notNull(),
  overallAverage: real("overallAverage").notNull(),
  deviation: real("deviation").notNull(), // How far from average
  deviationPercentage: real("deviationPercentage").notNull(),
  
  // Classification
  outlierType: outlierTypeEnum.notNull(), // Above or below average
  severity: severityEnum.notNull(),
  
  // Review status
  reviewStatus: reviewStatusEnum.default("pending").notNull(),
  
  // Chief of Staff review
  chiefOfStaffReviewed: boolean("chiefOfStaffReviewed").default(false),
  chiefOfStaffNotes: text("chiefOfStaffNotes"),
  reviewedAt: timestamp("reviewedAt"),
  
  // One-on-one conversation
  conversationRequested: boolean("conversationRequested").default(false),
  conversationCompleted: boolean("conversationCompleted").default(false),
  conversationNotes: text("conversationNotes"),
  conversationOutcome: text("conversationOutcome"),
  
  // Resolution
  resolution: mysqlEnum("resolution", [
    "score_adjusted",
    "score_validated",
    "insight_captured",
    "system_improvement_identified",
    "dismissed"
  ]),
  resolutionNotes: text("resolutionNotes"),
  
  // Metadata
  flaggedAt: timestamp("flaggedAt").defaultNow().notNull(),
  resolvedAt: timestamp("resolvedAt"),
});

export type AssessmentOutlier = typeof assessmentOutliers.$inferSelect;
export type InsertAssessmentOutlier = typeof assessmentOutliers.$inferInsert;

/**
 * Panel assessment aggregations - aggregated scores per panel
 */
export const panelAssessmentAggregations = pgTable("panel_assessment_aggregations", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  
  // Assessment period
  assessmentPeriod: varchar("assessmentPeriod", { length: 20 }).notNull(),
  
  // Panel
  panelName: varchar("panelName", { length: 100 }).notNull(),
  
  // Category
  categoryId: integer("categoryId").notNull(),
  categoryNumber: integer("categoryNumber").notNull(),
  categoryName: varchar("categoryName", { length: 200 }).notNull(),
  
  // Aggregated scores
  averageScore: real("averageScore").notNull(),
  medianScore: real("medianScore"),
  minScore: integer("minScore"),
  maxScore: integer("maxScore"),
  standardDeviation: real("standardDeviation"),
  
  // Individual scores breakdown
  individualScores: jsonb("individualScores"), // Array of { expertId, expertName, score }
  expertCount: integer("expertCount").default(0),
  
  // Consensus level
  consensusLevel: consensusLevelEnum,
  
  // Metadata
  aggregatedAt: timestamp("aggregatedAt").defaultNow().notNull(),
});

export type PanelAssessmentAggregation = typeof panelAssessmentAggregations.$inferSelect;
export type InsertPanelAssessmentAggregation = typeof panelAssessmentAggregations.$inferInsert;

/**
 * Overall KPI snapshots - point-in-time platform scores
 */
export const kpiSnapshots = pgTable("kpi_snapshots", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  
  // Snapshot period
  snapshotPeriod: varchar("snapshotPeriod", { length: 20 }).notNull(),
  snapshotDate: timestamp("snapshotDate").notNull(),
  
  // Overall scores
  overallScore: real("overallScore").notNull(),
  previousScore: real("previousScore"),
  scoreChange: real("scoreChange"),
  
  // Category breakdown
  categoryScores: jsonb("categoryScores").notNull(), // Array of { categoryNumber, name, score, change }
  
  // Distribution
  excellentCount: integer("excellentCount").default(0), // 90%+
  goodCount: integer("goodCount").default(0), // 75-89%
  adequateCount: integer("adequateCount").default(0), // 60-74%
  developingCount: integer("developingCount").default(0), // 40-59%
  criticalCount: integer("criticalCount").default(0), // Below 40%
  
  // Key metrics
  highestCategory: varchar("highestCategory", { length: 200 }),
  highestScore: integer("highestScore"),
  lowestCategory: varchar("lowestCategory", { length: 200 }),
  lowestScore: integer("lowestScore"),
  
  // Targets
  targetScore: real("targetScore"),
  gapToTarget: real("gapToTarget"),
  
  // Expert participation
  totalExpertsAssessed: integer("totalExpertsAssessed").default(0),
  panelsParticipated: jsonb("panelsParticipated"), // Array of panel names
  
  // Outliers summary
  outliersIdentified: integer("outliersIdentified").default(0),
  outliersResolved: integer("outliersResolved").default(0),
  
  // Metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type KpiSnapshot = typeof kpiSnapshots.$inferSelect;
export type InsertKpiSnapshot = typeof kpiSnapshots.$inferInsert;

/**
 * Expert conversation logs - one-on-one discussions about scores
 */
export const expertConversationLogs = pgTable("expert_conversation_logs", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  
  // Context
  outlierId: integer("outlierId"), // FK to assessmentOutliers if from outlier
  assessmentId: integer("assessmentId"), // FK to smeIndividualAssessments
  
  // Expert
  expertId: varchar("expertId", { length: 100 }).notNull(),
  expertName: varchar("expertName", { length: 200 }).notNull(),
  expertPanel: varchar("expertPanel", { length: 100 }).notNull(),
  
  // Category discussed
  categoryNumber: integer("categoryNumber"),
  categoryName: varchar("categoryName", { length: 200 }),
  
  // Conversation
  conversationType: mysqlEnum("conversationType", [
    "outlier_investigation",
    "score_clarification",
    "deep_dive",
    "recommendation_discussion",
    "general_feedback"
  ]).notNull(),
  
  // Content
  messages: jsonb("messages").notNull(), // Array of { role, content, timestamp }
  
  // Outcomes
  keyInsights: jsonb("keyInsights"), // Array of insights captured
  actionItems: jsonb("actionItems"), // Array of actions to take
  scoreAdjustment: integer("scoreAdjustment"), // If score was adjusted
  
  // Status
  status: statusEnum.default("in_progress").notNull(),
  
  // Metadata
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type ExpertConversationLog = typeof expertConversationLogs.$inferSelect;
export type InsertExpertConversationLog = typeof expertConversationLogs.$inferInsert;


/**
 * Central Insights Repository
 * 
 * Captures and stores all insights from customer feedback, SME assessments,
 * expert conversations, and external research. Creates a searchable knowledge
 * base that builds over time and prevents duplicate research.
 */

/**
 * Insights repository - central store for all captured insights
 */
export const insightsRepository = pgTable("insights_repository", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  
  // Insight content
  title: varchar("title", { length: 300 }).notNull(),
  summary: text("summary").notNull(),
  fullContent: text("fullContent"),
  
  // Source tracking
  sourceType: mysqlEnum("sourceType", [
    "customer_survey",
    "focus_group",
    "sme_assessment",
    "expert_conversation",
    "external_research",
    "market_data",
    "competitor_analysis",
    "user_observation",
    "manual_entry"
  ]).notNull(),
  sourceId: integer("sourceId"), // FK to source table based on sourceType
  sourceReference: varchar("sourceReference", { length: 500 }), // URL or document reference
  sourceName: varchar("sourceName", { length: 300 }), // Human readable source name
  
  // Categorization
  category: mysqlEnum("category", [
    "customer_need",
    "pricing_insight",
    "feature_request",
    "market_trend",
    "competitive_intelligence",
    "user_behavior",
    "pain_point",
    "opportunity",
    "risk",
    "validation_result",
    "technical_feedback",
    "ux_feedback",
    "business_model",
    "regulatory",
    "other"
  ]).notNull(),
  
  // Tagging
  tags: jsonb("tags"), // Array of tag strings
  ventures: jsonb("ventures"), // Array of venture names this applies to
  products: jsonb("products"), // Array of product names
  
  // Relevance
  relevanceScore: real("relevanceScore").default(0.5), // 0-1 how relevant/important
  confidenceLevel: confidenceLevelEnum.default("medium"),
  
  // Validation
  validatedBy: varchar("validatedBy", { length: 200 }), // Who validated this insight
  validatedAt: timestamp("validatedAt"),
  
  // Usage tracking
  timesReferenced: integer("timesReferenced").default(0),
  lastReferencedAt: timestamp("lastReferencedAt"),
  
  // Relationships
  relatedInsightIds: jsonb("relatedInsightIds"), // Array of related insight IDs
  supersededBy: integer("supersededBy"), // If this insight was updated/replaced
  
  // Status
  status: statusEnum.default("active").notNull(),
  
  // Metadata
  capturedAt: timestamp("capturedAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type InsightRepository = typeof insightsRepository.$inferSelect;
export type InsertInsightRepository = typeof insightsRepository.$inferInsert;

/**
 * External research references - imported external sources
 */
export const externalResearchReferences = pgTable("external_research_references", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  
  // Reference details
  title: varchar("title", { length: 500 }).notNull(),
  authors: jsonb("authors"), // Array of author names
  publicationDate: timestamp("publicationDate"),
  
  // Source
  sourceType: mysqlEnum("sourceType", [
    "academic_paper",
    "industry_report",
    "news_article",
    "blog_post",
    "government_data",
    "market_research",
    "competitor_website",
    "social_media",
    "podcast",
    "video",
    "book",
    "other"
  ]).notNull(),
  url: varchar("url", { length: 1000 }),
  publisher: varchar("publisher", { length: 300 }),
  
  // Content
  abstract: text("abstract"),
  keyFindings: jsonb("keyFindings"), // Array of key finding strings
  relevantQuotes: jsonb("relevantQuotes"), // Array of quote objects
  
  // Categorization
  topics: jsonb("topics"), // Array of topic strings
  ventures: jsonb("ventures"), // Which ventures this relates to
  
  // Quality assessment
  credibilityScore: real("credibilityScore").default(0.5), // 0-1
  relevanceScore: real("relevanceScore").default(0.5), // 0-1
  
  // Linked insights
  linkedInsightIds: jsonb("linkedInsightIds"), // Insights derived from this
  
  // Status
  status: statusEnum.default("active").notNull(),
  
  // Metadata
  importedAt: timestamp("importedAt").defaultNow().notNull(),
  lastReviewedAt: timestamp("lastReviewedAt"),
});

export type ExternalResearchReference = typeof externalResearchReferences.$inferSelect;
export type InsertExternalResearchReference = typeof externalResearchReferences.$inferInsert;

/**
 * Prior research checks - log of what was checked before new research
 */
export const priorResearchChecks = pgTable("prior_research_checks", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  
  // What triggered the check
  triggerType: mysqlEnum("triggerType", [
    "new_survey",
    "new_focus_group",
    "new_assessment",
    "new_idea_validation",
    "manual_search"
  ]).notNull(),
  triggerId: integer("triggerId"), // FK to the triggering entity
  
  // Search parameters
  searchQuery: text("searchQuery"),
  searchCategories: jsonb("searchCategories"),
  searchVentures: jsonb("searchVentures"),
  searchTags: jsonb("searchTags"),
  
  // Results
  insightsFound: integer("insightsFound").default(0),
  relevantInsightIds: jsonb("relevantInsightIds"), // Array of matching insight IDs
  externalRefsFound: integer("externalRefsFound").default(0),
  relevantExternalIds: jsonb("relevantExternalIds"), // Array of matching external ref IDs
  
  // Summary
  summaryGenerated: text("summaryGenerated"), // AI generated summary of prior knowledge
  gapsIdentified: jsonb("gapsIdentified"), // What we don't know yet
  
  // Action taken
  actionTaken: mysqlEnum("actionTaken", [
    "proceeded_with_new_research",
    "used_existing_insights",
    "modified_research_scope",
    "cancelled_duplicate"
  ]),
  actionRationale: text("actionRationale"),
  
  // Metadata
  checkedAt: timestamp("checkedAt").defaultNow().notNull(),
});

export type PriorResearchCheck = typeof priorResearchChecks.$inferSelect;
export type InsertPriorResearchCheck = typeof priorResearchChecks.$inferInsert;

/**
 * Insight usage log - tracks when insights are referenced
 */
export const insightUsageLog = pgTable("insight_usage_log", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  insightId: integer("insightId").notNull(), // FK to insightsRepository
  
  // Usage context
  usageType: mysqlEnum("usageType", [
    "decision_support",
    "survey_design",
    "validation_reference",
    "report_citation",
    "strategy_input",
    "presentation",
    "conversation_reference",
    "search_result"
  ]).notNull(),
  usageContext: varchar("usageContext", { length: 300 }), // Where it was used
  
  // Related entities
  relatedEntityType: varchar("relatedEntityType", { length: 100 }),
  relatedEntityId: integer("relatedEntityId"),
  
  // Metadata
  usedAt: timestamp("usedAt").defaultNow().notNull(),
});

export type InsightUsageLog = typeof insightUsageLog.$inferSelect;
export type InsertInsightUsageLog = typeof insightUsageLog.$inferInsert;

/**
 * Knowledge topics - taxonomy for organizing insights
 */
export const knowledgeTopics = pgTable("knowledge_topics", {
  id: serial("id").primaryKey(),
  
  // Topic hierarchy
  name: varchar("name", { length: 200 }).notNull(),
  parentTopicId: integer("parentTopicId"), // For hierarchical topics
  path: varchar("path", { length: 500 }), // Full path like "Market/Healthcare/Telehealth"
  
  // Description
  description: text("description"),
  
  // Statistics
  insightCount: integer("insightCount").default(0),
  lastInsightAt: timestamp("lastInsightAt"),
  
  // Status
  isActive: boolean("isActive").default(true).notNull(),
  
  // Metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type KnowledgeTopic = typeof knowledgeTopics.$inferSelect;
export type InsertKnowledgeTopic = typeof knowledgeTopics.$inferInsert;


/**
 * User Behavior Analytics and Proactive Coaching
 * 
 * Tracks how the user interacts with the system to provide
 * proactive recommendations for improving effectiveness.
 */

/**
 * User activity tracking - captures navigation and feature usage
 */
export const userActivityTracking = pgTable("user_activity_tracking", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  
  // Activity details
  activityType: mysqlEnum("activityType", [
    "page_view",
    "feature_use",
    "button_click",
    "form_submit",
    "search",
    "report_generate",
    "conversation",
    "file_access",
    "integration_use"
  ]).notNull(),
  
  // Location
  pagePath: varchar("pagePath", { length: 500 }),
  featureName: varchar("featureName", { length: 200 }),
  componentId: varchar("componentId", { length: 200 }),
  
  // Context
  sessionId: varchar("sessionId", { length: 100 }),
  previousPage: varchar("previousPage", { length: 500 }),
  
  // Timing
  duration: integer("duration"), // Time spent in milliseconds
  
  // Additional data
  metadata: jsonb("metadata"), // Any additional context
  
  // Timestamp
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UserActivityTracking = typeof userActivityTracking.$inferSelect;
export type InsertUserActivityTracking = typeof userActivityTracking.$inferInsert;

/**
 * Workflow patterns - detected sequences of actions
 */
export const workflowPatterns = pgTable("workflow_patterns", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  
  // Pattern identification
  patternName: varchar("patternName", { length: 200 }).notNull(),
  patternType: mysqlEnum("patternType", [
    "repetitive_task",
    "inefficient_flow",
    "feature_discovery",
    "time_sink",
    "successful_workflow"
  ]).notNull(),
  
  // Pattern details
  actionSequence: jsonb("actionSequence").notNull(), // Array of actions in order
  frequency: integer("frequency").default(1), // How often this pattern occurs
  averageDuration: integer("averageDuration"), // Average time to complete
  
  // Analysis
  efficiencyScore: real("efficiencyScore"), // 0-1, how efficient this workflow is
  improvementPotential: real("improvementPotential"), // 0-1, how much could be improved
  
  // Status
  isAddressed: boolean("isAddressed").default(false),
  
  // Metadata
  firstDetectedAt: timestamp("firstDetectedAt").defaultNow().notNull(),
  lastOccurredAt: timestamp("lastOccurredAt").defaultNow().notNull(),
});

export type WorkflowPattern = typeof workflowPatterns.$inferSelect;
export type InsertWorkflowPattern = typeof workflowPatterns.$inferInsert;

/**
 * Proactive recommendations - suggestions from Chief of Staff
 */
export const proactiveRecommendations = pgTable("proactive_recommendations", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  
  // Recommendation details
  title: varchar("title", { length: 300 }).notNull(),
  description: text("description").notNull(),
  
  // Type and category
  recommendationType: mysqlEnum("recommendationType", [
    "workflow_improvement",
    "feature_suggestion",
    "integration_recommendation",
    "automation_opportunity",
    "efficiency_tip",
    "learning_resource"
  ]).notNull(),
  
  // Source
  triggeredBy: mysqlEnum("triggeredBy", [
    "usage_pattern",
    "time_analysis",
    "error_detection",
    "underutilization",
    "manual_observation"
  ]).notNull(),
  relatedPatternId: integer("relatedPatternId"), // FK to workflowPatterns
  
  // Priority
  priority: priorityEnum.default("medium"),
  estimatedTimeSaved: integer("estimatedTimeSaved"), // Minutes per week
  
  // Action
  actionUrl: varchar("actionUrl", { length: 500 }), // Where to go to implement
  actionSteps: jsonb("actionSteps"), // Array of steps to take
  
  // Status
  status: statusEnum.default("pending").notNull(),
  userResponse: text("userResponse"), // Why they accepted/rejected
  
  // Metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  viewedAt: timestamp("viewedAt"),
  respondedAt: timestamp("respondedAt"),
});

export type ProactiveRecommendation = typeof proactiveRecommendations.$inferSelect;
export type InsertProactiveRecommendation = typeof proactiveRecommendations.$inferInsert;

/**
 * Report Quality Scoring and Learning System
 * 
 * Allows user to rate outputs and captures feedback
 * to improve future generation quality.
 */

/**
 * Output quality scores - user ratings on generated content
 */
export const outputQualityScores = pgTable("output_quality_scores", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  
  // What was scored
  outputType: mysqlEnum("outputType", [
    "report",
    "document",
    "analysis",
    "presentation",
    "email_draft",
    "summary",
    "recommendation",
    "visualization",
    "other"
  ]).notNull(),
  outputId: varchar("outputId", { length: 100 }), // Reference to the specific output
  outputTitle: varchar("outputTitle", { length: 300 }),
  
  // Score
  score: integer("score").notNull(), // 1-10
  
  // Feedback for low scores (1-4)
  issueCategory: mysqlEnum("issueCategory", [
    "template_issue",
    "formatting_problem",
    "design_flaw",
    "content_inaccuracy",
    "missing_information",
    "wrong_tone",
    "too_long",
    "too_short",
    "unclear",
    "other"
  ]),
  issueDescription: text("issueDescription"),
  
  // Responsible area
  responsibleArea: mysqlEnum("responsibleArea", [
    "ai_generation",
    "template_design",
    "data_quality",
    "user_input",
    "system_bug",
    "unknown"
  ]),
  
  // Follow up
  requiresAction: boolean("requiresAction").default(false),
  actionTaken: text("actionTaken"),
  actionTakenAt: timestamp("actionTakenAt"),
  
  // Metadata
  scoredAt: timestamp("scoredAt").defaultNow().notNull(),
});

export type OutputQualityScore = typeof outputQualityScores.$inferSelect;
export type InsertOutputQualityScore = typeof outputQualityScores.$inferInsert;

/**
 * Quality improvement tickets - issues to be fixed
 */
export const qualityImprovementTickets = pgTable("quality_improvement_tickets", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  
  // Ticket details
  title: varchar("title", { length: 300 }).notNull(),
  description: text("description").notNull(),
  
  // Category
  category: mysqlEnum("category", [
    "template_fix",
    "formatting_update",
    "design_improvement",
    "content_accuracy",
    "feature_enhancement",
    "bug_fix"
  ]).notNull(),
  
  // Related scores
  relatedScoreIds: jsonb("relatedScoreIds"), // Array of outputQualityScores IDs
  occurrenceCount: integer("occurrenceCount").default(1), // How many times this issue occurred
  
  // Priority
  priority: priorityEnum.default("medium"),
  impactScore: real("impactScore"), // Calculated from frequency and severity
  
  // Assignment
  assignedTo: varchar("assignedTo", { length: 200 }), // Team or person responsible
  
  // Status
  status: statusEnum.default("open").notNull(),
  resolution: text("resolution"),
  
  // Metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
  resolvedAt: timestamp("resolvedAt"),
});

export type QualityImprovementTicket = typeof qualityImprovementTickets.$inferSelect;
export type InsertQualityImprovementTicket = typeof qualityImprovementTickets.$inferInsert;

/**
 * Quality metrics snapshots - track improvement over time
 */
export const qualityMetricsSnapshots = pgTable("quality_metrics_snapshots", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  
  // Period
  snapshotDate: timestamp("snapshotDate").notNull(),
  periodType: periodTypeEnum.notNull(),
  
  // Overall metrics
  totalOutputs: integer("totalOutputs").default(0),
  scoredOutputs: integer("scoredOutputs").default(0),
  averageScore: real("averageScore"),
  
  // Distribution
  scoreDistribution: jsonb("scoreDistribution"), // { "1": 2, "2": 5, ... "10": 20 }
  
  // By category
  scoresByOutputType: jsonb("scoresByOutputType"), // { "report": 7.5, "document": 8.2 }
  scoresByIssueCategory: jsonb("scoresByIssueCategory"), // Count of issues by category
  
  // Trends
  previousAverageScore: real("previousAverageScore"),
  scoreChange: real("scoreChange"),
  
  // Issues
  openTickets: integer("openTickets").default(0),
  resolvedTickets: integer("resolvedTickets").default(0),
  
  // Metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type QualityMetricsSnapshot = typeof qualityMetricsSnapshots.$inferSelect;
export type InsertQualityMetricsSnapshot = typeof qualityMetricsSnapshots.$inferInsert;


// =============================================================================
// COS DIGITAL TWIN LEARNING SYSTEM
// =============================================================================

/**
 * COS Training Progress - tracks training level and module completion
 */
export const cosTrainingProgress = pgTable("cos_training_progress", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  
  // Current level (1-5: Novice, Learning, Competent, Proficient, Expert)
  currentLevel: integer("currentLevel").default(1).notNull(),
  trainingPercentage: real("trainingPercentage").default(20).notNull(), // 0-100
  
  // Module tracking
  completedModules: jsonb("completedModules"), // Array of completed module IDs
  currentModuleId: integer("currentModuleId"),
  
  // Timestamps
  lastTrainingActivity: timestamp("lastTrainingActivity"),
  levelUpAt: timestamp("levelUpAt"), // When they reached current level
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});
export type CosTrainingProgress = typeof cosTrainingProgress.$inferSelect;
export type InsertCosTrainingProgress = typeof cosTrainingProgress.$inferInsert;

/**
 * COS Training Modules - individual training modules with content
 */
export const cosTrainingModules = pgTable("cos_training_modules", {
  id: serial("id").primaryKey(),
  
  // Module info
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  requiredLevel: integer("requiredLevel").default(1).notNull(), // Minimum level to access
  duration: varchar("duration", { length: 50 }), // e.g., "30 min"
  
  // Content
  content: text("content"), // Markdown content
  learningObjectives: jsonb("learningObjectives"), // Array of objectives
  
  // Assessment
  hasAssessment: boolean("hasAssessment").default(false),
  assessmentQuestions: jsonb("assessmentQuestions"), // Quiz questions
  passingScore: integer("passingScore").default(80), // Percentage to pass
  
  // Ordering
  sortOrder: integer("sortOrder").default(0),
  
  // Metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});
export type CosTrainingModule = typeof cosTrainingModules.$inferSelect;
export type InsertCosTrainingModule = typeof cosTrainingModules.$inferInsert;

/**
 * COS Interaction Log - captures ALL interactions for learning
 */
export const cosInteractionLog = pgTable("cos_interaction_log", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  
  // Interaction details
  interactionType: mysqlEnum("interactionType", [
    "question",      // User asked a question
    "clarification", // User asked for clarification
    "correction",    // User corrected COS output
    "approval",      // User approved something
    "rejection",     // User rejected something
    "feedback",      // User gave feedback
    "preference",    // User stated a preference
    "instruction"    // User gave an instruction
  ]).notNull(),
  
  // Content
  userInput: text("userInput").notNull(), // What user said/asked
  cosResponse: text("cosResponse"), // What COS responded (if applicable)
  context: varchar("context", { length: 200 }), // Where this happened
  
  // Learning extraction
  extractedLearning: text("extractedLearning"), // What was learned from this
  learningCategory: varchar("learningCategory", { length: 100 }), // Category of learning
  confidenceScore: real("confidenceScore").default(0.5), // How confident in the learning
  
  // Processing status
  processed: boolean("processed").default(false), // Has this been processed for learning?
  appliedToModel: boolean("appliedToModel").default(false), // Has learning been applied?
  
  // Metadata
  sessionId: varchar("sessionId", { length: 100 }), // Group interactions by session
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type CosInteractionLog = typeof cosInteractionLog.$inferSelect;
export type InsertCosInteractionLog = typeof cosInteractionLog.$inferInsert;

/**
 * COS Learned Patterns - patterns extracted from interactions
 */
export const cosLearnedPatterns = pgTable("cos_learned_patterns", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  
  // Pattern details
  patternType: mysqlEnum("patternType", [
    "thinking_style",      // How user approaches problems
    "decision_pattern",    // How user makes decisions
    "communication_style", // How user communicates
    "quality_standard",    // What user considers quality
    "priority_pattern",    // What user prioritizes
    "workflow_pattern",    // How user likes to work
    "format_preference",   // Formatting preferences
    "terminology",         // Specific terms user uses
    "value",               // Core values that guide decisions
    "pet_peeve"            // Things user dislikes
  ]).notNull(),
  
  // Pattern content
  patternName: varchar("patternName", { length: 200 }).notNull(),
  patternDescription: text("patternDescription").notNull(),
  examples: jsonb("examples"), // Array of example interactions
  
  // Confidence and validation
  confidenceScore: real("confidenceScore").default(0.5).notNull(), // 0-1
  validatedByUser: boolean("validatedByUser").default(false),
  occurrenceCount: integer("occurrenceCount").default(1), // How many times observed
  
  // Application
  active: boolean("active").default(true), // Is this pattern being applied?
  lastApplied: timestamp("lastApplied"),
  applicationCount: integer("applicationCount").default(0), // How many times applied
  
  // Source tracking
  sourceInteractionIds: jsonb("sourceInteractionIds"), // IDs of interactions that formed this pattern
  
  // Metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});
export type CosLearnedPattern = typeof cosLearnedPatterns.$inferSelect;
export type InsertCosLearnedPattern = typeof cosLearnedPatterns.$inferInsert;

/**
 * COS User Mental Model - comprehensive profile of user's thinking
 */
export const cosUserMentalModel = pgTable("cos_user_mental_model", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().unique(),
  
  // Core profile
  thinkingStyle: text("thinkingStyle"), // How user approaches problems
  communicationStyle: text("communicationStyle"), // How user communicates
  decisionMakingStyle: text("decisionMakingStyle"), // How user makes decisions
  
  // Priorities and values
  topPriorities: jsonb("topPriorities"), // Array of priorities
  coreValues: jsonb("coreValues"), // Array of values
  qualityStandards: jsonb("qualityStandards"), // What "good" looks like
  
  // Preferences
  formatPreferences: jsonb("formatPreferences"), // Document, communication format preferences
  workflowPreferences: jsonb("workflowPreferences"), // How user likes to work
  communicationPreferences: jsonb("communicationPreferences"), // Communication preferences
  
  // Pet peeves and dislikes
  petPeeves: jsonb("petPeeves"), // Things that annoy user
  avoidPatterns: jsonb("avoidPatterns"), // Things to avoid
  
  // Terminology
  customTerminology: jsonb("customTerminology"), // User-specific terms and meanings
  
  // Model confidence
  overallConfidence: real("overallConfidence").default(0.2), // How confident in the model
  lastMajorUpdate: timestamp("lastMajorUpdate"),
  interactionsProcessed: integer("interactionsProcessed").default(0),
  
  // Metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});
export type CosUserMentalModel = typeof cosUserMentalModel.$inferSelect;
export type InsertCosUserMentalModel = typeof cosUserMentalModel.$inferInsert;

/**
 * COS Learning Metrics - track how well COS is learning
 */
export const cosLearningMetrics = pgTable("cos_learning_metrics", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  
  // Period
  metricDate: timestamp("metricDate").notNull(),
  periodType: periodTypeEnum.notNull(),
  
  // Interaction metrics
  totalInteractions: integer("totalInteractions").default(0),
  correctionsReceived: integer("correctionsReceived").default(0),
  approvalsReceived: integer("approvalsReceived").default(0),
  
  // Learning metrics
  newPatternsLearned: integer("newPatternsLearned").default(0),
  patternsReinforced: integer("patternsReinforced").default(0),
  patternsInvalidated: integer("patternsInvalidated").default(0),
  
  // Performance metrics
  accuracyScore: real("accuracyScore"), // How often COS gets it right
  anticipationScore: real("anticipationScore"), // How well COS anticipates needs
  satisfactionScore: real("satisfactionScore"), // User satisfaction
  
  // Improvement tracking
  previousAccuracyScore: real("previousAccuracyScore"),
  accuracyChange: real("accuracyChange"),
  
  // Metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type CosLearningMetrics = typeof cosLearningMetrics.$inferSelect;
export type InsertCosLearningMetrics = typeof cosLearningMetrics.$inferInsert;


// Digital Twin Questionnaire Responses
export const questionnaireResponses = pgTable('questionnaire_responses', {
  id: integer('id').primaryKey().autoincrement(),
  userId: integer('user_id').notNull(),
  questionId: varchar('question_id', { length: 10 }).notNull(), // e.g., "A51", "B72"
  questionType: mysqlEnum('question_type', ['scale', 'boolean']).notNull(),
  scaleValue: integer('scale_value'), // 1-10 for scale questions
  booleanValue: boolean('boolean_value'), // true/false for Y/N questions
  section: varchar('section', { length: 100 }), // e.g., "Business Operations", "Innovation"
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
});
export type QuestionnaireResponse = typeof questionnaireResponses.$inferSelect;
export type InsertQuestionnaireResponse = typeof questionnaireResponses.$inferInsert;

// Digital Twin Profile (calculated from questionnaire)
export const digitalTwinProfile = pgTable('digital_twin_profile', {
  id: integer('id').primaryKey().autoincrement(),
  userId: integer('user_id').notNull().unique(),
  // Execution DNA
  measurementDriven: integer('measurement_driven'), // 1-10
  processStandardization: integer('process_standardization'),
  automationPreference: integer('automation_preference'),
  ambiguityTolerance: integer('ambiguity_tolerance'),
  // Technology Philosophy
  techAdoptionSpeed: integer('tech_adoption_speed'),
  aiBeliefLevel: integer('ai_belief_level'),
  dataVsIntuition: integer('data_vs_intuition'),
  buildVsBuy: mysqlEnum('build_vs_buy', ['build', 'buy', 'balanced']),
  // Market Strategy
  nicheVsMass: integer('niche_vs_mass'),
  firstMoverVsFollower: integer('first_mover_vs_follower'),
  organicVsMA: mysqlEnum('organic_vs_ma', ['organic', 'ma', 'balanced']),
  // Work Style
  structurePreference: integer('structure_preference'),
  interruptionTolerance: integer('interruption_tolerance'),
  batchingPreference: integer('batching_preference'),
  locationPreference: mysqlEnum('location_preference', ['home', 'office', 'varied']),
  // Strategic Mindset
  scenarioPlanningLevel: integer('scenario_planning_level'),
  pivotComfort: integer('pivot_comfort'),
  trendLeadership: integer('trend_leadership'),
  portfolioDiversification: integer('portfolio_diversification'),
  // Calculated Scores
  cosUnderstandingLevel: integer('cos_understanding_level').default(0), // 0-100
  questionnaireCompletion: integer('questionnaire_completion').default(0), // 0-100 percentage
  lastCalculated: timestamp('last_calculated'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
});
export type DigitalTwinProfile = typeof digitalTwinProfile.$inferSelect;
export type InsertDigitalTwinProfile = typeof digitalTwinProfile.$inferInsert;


// ============================================
// Expert Recommendation Tables - 18 Jan 2026
// ============================================

/**
 * NPS Tracking - Customer Net Promoter Score surveys
 */
export const npsResponses = pgTable('nps_responses', {
  id: integer('id').primaryKey().autoincrement(),
  userId: integer('user_id').notNull(),
  score: integer('score').notNull(), // 0-10 NPS scale
  category: mysqlEnum('category', ['detractor', 'passive', 'promoter']).notNull(),
  feedback: text('feedback'), // Optional open-ended feedback
  touchpoint: varchar('touchpoint', { length: 100 }), // Where survey was triggered
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
export type NpsResponse = typeof npsResponses.$inferSelect;
export type InsertNpsResponse = typeof npsResponses.$inferInsert;

/**
 * Customer Success Program - Track customer health and engagement
 */
export const customerHealth = pgTable('customer_health', {
  id: integer('id').primaryKey().autoincrement(),
  userId: integer('user_id').notNull(),
  healthScore: integer('health_score').notNull(), // 0-100
  engagementLevel: mysqlEnum('engagement_level', ['low', 'medium', 'high', 'champion']).notNull(),
  lastActiveDate: timestamp('last_active_date'),
  featureAdoption: jsonb('feature_adoption'), // Which features they use
  riskLevel: mysqlEnum('risk_level', ['low', 'medium', 'high', 'critical']).default('low'),
  nextCheckIn: timestamp('next_check_in'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
});
export type CustomerHealth = typeof customerHealth.$inferSelect;
export type InsertCustomerHealth = typeof customerHealth.$inferInsert;

/**
 * Strategic Partnerships - Partnership pipeline tracking
 */
export const partnerships = pgTable('partnerships', {
  id: integer('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 200 }).notNull(),
  type: mysqlEnum('type', ['technology', 'distribution', 'strategic', 'integration', 'referral']).notNull(),
  status: mysqlEnum('status', ['prospect', 'contacted', 'negotiating', 'active', 'inactive', 'churned']).notNull(),
  priority: mysqlEnum('priority', ['low', 'medium', 'high', 'critical']).default('medium'),
  contactName: varchar('contact_name', { length: 200 }),
  contactEmail: varchar('contact_email', { length: 320 }),
  value: varchar('value', { length: 100 }), // Estimated value
  notes: text('notes'),
  nextAction: text('next_action'),
  nextActionDate: timestamp('next_action_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
});
export type Partnership = typeof partnerships.$inferSelect;
export type InsertPartnership = typeof partnerships.$inferInsert;

/**
 * Team Capability Matrix - Track team skills and gaps
 */
export const teamCapabilities = pgTable('team_capabilities', {
  id: integer('id').primaryKey().autoincrement(),
  teamMember: varchar('team_member', { length: 200 }).notNull(),
  role: varchar('role', { length: 100 }).notNull(),
  skillCategory: varchar('skill_category', { length: 100 }).notNull(), // e.g., "Technical", "Leadership"
  skillName: varchar('skill_name', { length: 200 }).notNull(),
  currentLevel: integer('current_level').notNull(), // 1-5
  targetLevel: integer('target_level'), // 1-5
  gap: integer('gap'), // Calculated difference
  developmentPlan: text('development_plan'),
  lastAssessed: timestamp('last_assessed'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
});
export type TeamCapability = typeof teamCapabilities.$inferSelect;
export type InsertTeamCapability = typeof teamCapabilities.$inferInsert;

/**
 * SOC 2 Compliance Tracking - Security and compliance checklist
 */
export const complianceItems = pgTable('compliance_items', {
  id: integer('id').primaryKey().autoincrement(),
  framework: mysqlEnum('framework', ['soc2', 'gdpr', 'hipaa', 'iso27001', 'wcag']).notNull(),
  category: varchar('category', { length: 100 }).notNull(),
  requirement: text('requirement').notNull(),
  status: mysqlEnum('status', ['not_started', 'in_progress', 'implemented', 'verified', 'na']).notNull(),
  evidence: text('evidence'),
  owner: varchar('owner', { length: 200 }),
  dueDate: timestamp('due_date'),
  completedDate: timestamp('completed_date'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
});
export type ComplianceItem = typeof complianceItems.$inferSelect;
export type InsertComplianceItem = typeof complianceItems.$inferInsert;

/**
 * RAG Context Store - Retrieval Augmented Generation context
 */
export const ragContexts = pgTable('rag_contexts', {
  id: integer('id').primaryKey().autoincrement(),
  userId: integer('user_id').notNull(),
  contextType: mysqlEnum('context_type', ['conversation', 'document', 'preference', 'decision', 'memory']).notNull(),
  content: text('content').notNull(),
  embedding: jsonb('embedding'), // Vector embedding for similarity search
  metadata: jsonb('metadata'),
  relevanceScore: real('relevance_score'),
  accessCount: integer('access_count').default(0),
  lastAccessed: timestamp('last_accessed'),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
export type RagContext = typeof ragContexts.$inferSelect;
export type InsertRagContext = typeof ragContexts.$inferInsert;

// ===== PHASE 2 ADDITIONS: Architecture Alignment =====

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
export const projectGenesisPhases = pgTable("project_genesis_phases", {
  id: serial("id").primaryKey(),
  projectId: integer("projectId").notNull(), // FK to project_genesis
  phaseNumber: integer("phaseNumber").notNull(), // 1-6
  phaseName: varchar("phaseName", { length: 100 }).notNull(),
  status: statusEnum.default("not_started").notNull(),
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  assignedTeam: jsonb("assignedTeam"), // Array of user IDs and expert IDs
  deliverables: jsonb("deliverables"), // Array of deliverable objects
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type ProjectGenesisPhase = typeof projectGenesisPhases.$inferSelect;
export type InsertProjectGenesisPhase = typeof projectGenesisPhases.$inferInsert;

/**
 * Project Genesis Milestones - key milestones within each phase
 */
export const projectGenesisMilestones = pgTable("project_genesis_milestones", {
  id: serial("id").primaryKey(),
  phaseId: integer("phaseId").notNull(), // FK to project_genesis_phases
  projectId: integer("projectId").notNull(), // FK to project_genesis
  milestoneName: varchar("milestoneName", { length: 200 }).notNull(),
  description: text("description"),
  dueDate: timestamp("dueDate"),
  status: statusEnum.default("pending").notNull(),
  completedAt: timestamp("completedAt"),
  completedBy: integer("completedBy"), // User ID
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type ProjectGenesisMilestone = typeof projectGenesisMilestones.$inferSelect;
export type InsertProjectGenesisMilestone = typeof projectGenesisMilestones.$inferInsert;

/**
 * Project Genesis Deliverables - outputs from each phase
 */
export const projectGenesisDeliverables = pgTable("project_genesis_deliverables", {
  id: serial("id").primaryKey(),
  phaseId: integer("phaseId").notNull(), // FK to project_genesis_phases
  projectId: integer("projectId").notNull(), // FK to project_genesis
  deliverableName: varchar("deliverableName", { length: 200 }).notNull(),
  deliverableType: varchar("deliverableType", { length: 100 }).notNull(), // "document", "presentation", "model", "report"
  description: text("description"),
  fileUrl: varchar("fileUrl", { length: 500 }),
  status: statusEnum.default("draft").notNull(),
  createdBy: integer("createdBy"), // User ID
  reviewedBy: integer("reviewedBy"), // User ID
  approvedBy: integer("approvedBy"), // User ID
  reviewNotes: text("reviewNotes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type ProjectGenesisDeliverable = typeof projectGenesisDeliverables.$inferSelect;
export type InsertProjectGenesisDeliverable = typeof projectGenesisDeliverables.$inferInsert;

/**
 * Quality Gate Criteria - specific criteria for each gate (G1-G6)
 */
export const qualityGateCriteria = pgTable("quality_gate_criteria", {
  id: serial("id").primaryKey(),
  gateNumber: integer("gateNumber").notNull(), // 1-6 (G1-G6)
  gateName: varchar("gateName", { length: 100 }).notNull(),
  criteriaName: varchar("criteriaName", { length: 200 }).notNull(),
  description: text("description"),
  weight: real("weight").default(1.0), // Importance weight
  passingScore: integer("passingScore").default(70), // Minimum score to pass
  evaluationType: varchar("evaluationType", { length: 50 }).notNull(), // "automated", "manual", "hybrid"
  metadata: jsonb("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type QualityGateCriteria = typeof qualityGateCriteria.$inferSelect;
export type InsertQualityGateCriteria = typeof qualityGateCriteria.$inferInsert;

/**
 * Quality Gate Results - evaluation results for each project
 */
export const qualityGateResults = pgTable("quality_gate_results", {
  id: serial("id").primaryKey(),
  projectId: integer("projectId").notNull(), // FK to project_genesis
  gateNumber: integer("gateNumber").notNull(), // 1-6
  criteriaId: integer("criteriaId").notNull(), // FK to quality_gate_criteria
  score: integer("score").notNull(), // 0-100
  passed: boolean("passed").notNull(),
  evaluatedBy: integer("evaluatedBy"), // User ID or "system"
  evaluationNotes: text("evaluationNotes"),
  evidence: jsonb("evidence"), // Supporting evidence/documents
  metadata: jsonb("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type QualityGateResult = typeof qualityGateResults.$inferSelect;
export type InsertQualityGateResult = typeof qualityGateResults.$inferInsert;

/**
 * Blueprint Library - master library of all blueprints
 */
export const blueprintLibrary = pgTable("blueprint_library", {
  id: serial("id").primaryKey(),
  blueprintCode: varchar("blueprintCode", { length: 50 }).notNull().unique(), // e.g., "BP-001"
  title: varchar("title", { length: 300 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  description: text("description"),
  objectives: jsonb("objectives"), // Array of objectives
  phases: jsonb("phases"), // Array of phase objects
  deliverables: jsonb("deliverables"), // Array of deliverable templates
  resources: jsonb("resources"), // Required resources
  estimatedDuration: integer("estimatedDuration"), // Hours
  complexity: complexityEnum.default("medium"),
  tags: jsonb("tags"), // Array of tags
  fileUrl: varchar("fileUrl", { length: 500 }),
  version: varchar("version", { length: 20 }).default("1.0"),
  status: statusEnum.default("active").notNull(),
  createdBy: integer("createdBy"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type Blueprint = typeof blueprintLibrary.$inferSelect;
export type InsertBlueprint = typeof blueprintLibrary.$inferInsert;

/**
 * Blueprint Executions - instances of blueprints being executed
 */
export const blueprintExecutions = pgTable("blueprint_executions", {
  id: serial("id").primaryKey(),
  blueprintId: integer("blueprintId").notNull(), // FK to blueprint_library
  projectId: integer("projectId"), // FK to project_genesis (optional)
  userId: integer("userId").notNull(),
  executionName: varchar("executionName", { length: 300 }).notNull(),
  status: statusEnum.default("planning").notNull(),
  currentPhase: integer("currentPhase").default(1),
  progress: integer("progress").default(0), // 0-100
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  phaseData: jsonb("phaseData"), // Current state of each phase
  deliverableData: jsonb("deliverableData"), // Generated deliverables
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type BlueprintExecution = typeof blueprintExecutions.$inferSelect;
export type InsertBlueprintExecution = typeof blueprintExecutions.$inferInsert;

import { pgTable, uuid, text, integer, timestamp, boolean, jsonb, json, varchar } from 'drizzle-orm/pg-core';

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

// Phase 2 Completion: Missing Database Tables
// These tables complete the A0 Architecture database requirements

// ===== Chief of Staff Training System (Phase 2) =====
// Note: MySQL version exists earlier in file, this is PostgreSQL version

export const cosTrainingModulesPg = pgTable("cos_training_modules_pg", {
  id: uuid("id").primaryKey().defaultRandom(),
  moduleNumber: integer("module_number").notNull().unique(), // 1-8
  title: text("title").notNull(),
  objective: text("objective").notNull(),
  duration: integer("duration").notNull(), // hours
  topics: jsonb("topics").$type<string[]>(),
  requiredReading: jsonb("required_reading").$type<string[]>(),
  practicalExercises: jsonb("practical_exercises").$type<any[]>(),
  competencyAssessment: jsonb("competency_assessment").$type<string[]>(),
  prerequisites: jsonb("prerequisites").$type<number[]>(), // module numbers
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const cosModuleProgressPg = pgTable("cos_module_progress_pg", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  moduleId: uuid("module_id").references(() => cosTrainingModulesPg.id).notNull(),
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
  successDNA: jsonb("success_dna").$type<any>(), // 100+ factors
  learningStyle: varchar("learning_style", { length: 50 }),
  communicationPreferences: jsonb("communication_preferences").$type<any>(),
  workingStyle: jsonb("working_style").$type<any>(),
  strengthsWeaknesses: jsonb("strengths_weaknesses").$type<any>(),
  personalityProfile: jsonb("personality_profile").$type<any>(),
  careerAspirations: jsonb("career_aspirations").$type<any>(),
  skillMatrix: jsonb("skill_matrix").$type<any>(),
  experienceLevel: varchar("experience_level", { length: 50 }),
  industryExpertise: jsonb("industry_expertise").$type<string[]>(),
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
  milestones: jsonb("milestones").$type<any[]>(),
  metrics: jsonb("metrics").$type<any>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const digitalTwinPreferences = pgTable("digital_twin_preferences", {
  id: uuid("id").primaryKey().defaultRandom(),
  profileId: uuid("profile_id").references(() => digitalTwinProfiles.id).notNull(),
  category: varchar("category", { length: 100 }).notNull(), // briefing_time, notification_frequency, etc.
  preferenceKey: varchar("preference_key", { length: 100 }).notNull(),
  preferenceValue: jsonb("preference_value").$type<any>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ===== AI-SME Expert Team System =====

export const expertTeams = pgTable("expert_teams", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id").notNull(), // references projectGenesis
  teamName: varchar("team_name", { length: 255 }).notNull(),
  purpose: text("purpose"),
  expertIds: jsonb("expert_ids").$type<string[]>().notNull(), // array of expert IDs
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
  context: jsonb("context").$type<any>(),
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
  parameterValue: jsonb("parameter_value").$type<any>(),
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
  metadata: jsonb("metadata").$type<any>(),
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
  beforeState: jsonb("before_state").$type<any>(),
  afterState: jsonb("after_state").$type<any>(),
  metadata: jsonb("metadata").$type<any>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const qmsComplianceChecks = pgTable("qms_compliance_checks", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id").notNull(),
  checkType: varchar("check_type", { length: 100 }).notNull(), // regulatory, internal, industry_standard
  checkName: varchar("check_name", { length: 255 }).notNull(),
  checkDescription: text("check_description"),
  requirements: jsonb("requirements").$type<any[]>(),
  status: varchar("status", { length: 50 }).default('pending'), // pending, passed, failed, not_applicable
  score: integer("score"), // 0-100
  findings: jsonb("findings").$type<any[]>(),
  recommendations: jsonb("recommendations").$type<any[]>(),
  checkedBy: uuid("checked_by").references(() => users.id),
  checkedAt: timestamp("checked_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// =============================================================================
// DIGITAL TWIN PROFILES
// =============================================================================

/**
 * Digital Twins - User's AI Chief of Staff profile
 */
export const digitalTwins = pgTable("digital_twins", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().unique(),
  
  // Profile
  name: varchar("name", { length: 200 }),
  learningStyle: mysqlEnum("learningStyle", [
    "visual",
    "auditory",
    "reading",
    "kinesthetic",
    "mixed"
  ]).default("mixed"),
  
  // Competency scores (0-100)
  strategicThinking: integer("strategicThinking").default(20).notNull(),
  executiveCommunication: integer("executiveCommunication").default(20).notNull(),
  operationalExcellence: integer("operationalExcellence").default(20).notNull(),
  dataAnalytics: integer("dataAnalytics").default(20).notNull(),
  leadershipDevelopment: integer("leadershipDevelopment").default(20).notNull(),
  crisisManagement: integer("crisisManagement").default(20).notNull(),
  innovationStrategy: integer("innovationStrategy").default(20).notNull(),
  stakeholderManagement: integer("stakeholderManagement").default(20).notNull(),
  
  // Overall competency
  overallCompetency: integer("overallCompetency").default(20).notNull(),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});
export type DigitalTwin = typeof digitalTwins.$inferSelect;
export type InsertDigitalTwin = typeof digitalTwins.$inferInsert;

/**
 * Decision Log - tracks user decisions for learning
 */
export const decisionLog = pgTable("decision_log", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  
  // Decision details
  decisionType: varchar("decisionType", { length: 100 }).notNull(),
  decisionContext: text("decisionContext").notNull(),
  decisionMade: text("decisionMade").notNull(),
  reasoning: text("reasoning"),
  
  // Outcome tracking
  outcome: text("outcome"),
  outcomeRating: integer("outcomeRating"), // 1-5
  lessonsLearned: text("lessonsLearned"),
  
  // Metadata
  relatedModule: integer("relatedModule"), // Training module ID
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type DecisionLog = typeof decisionLog.$inferSelect;
export type InsertDecisionLog = typeof decisionLog.$inferInsert;

// =============================================================================
// AI-SME EXPERTS SYSTEM
// =============================================================================

/**
 * AI-SME Experts - Available expert consultants
 */
export const aiSmeExperts = pgTable("ai_sme_experts", {
  id: serial("id").primaryKey(),
  
  // Expert profile
  name: varchar("name", { length: 200 }).notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  domain: varchar("domain", { length: 100 }).notNull(), // finance, legal, marketing, etc.
  expertise: jsonb("expertise").$type<string[]>(), // Array of expertise areas
  
  // Description
  bio: text("bio"),
  specialization: text("specialization"),
  
  // Availability
  isActive: boolean("isActive").default(true).notNull(),
  consultationCount: integer("consultationCount").default(0).notNull(),
  
  // System prompt
  systemPrompt: text("systemPrompt").notNull(),
  
  // Metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});
export type AiSmeExpert = typeof aiSmeExperts.$inferSelect;
export type InsertAiSmeExpert = typeof aiSmeExperts.$inferInsert;

/**
 * AI-SME Consultations - User consultations with experts
 */
export const aiSmeConsultations = pgTable("ai_sme_consultations", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  expertId: integer("expertId").notNull(),
  
  // Consultation details
  topic: varchar("topic", { length: 255 }).notNull(),
  question: text("question").notNull(),
  response: text("response"),
  
  // Status
  status: mysqlEnum("status", [
    "pending",
    "in_progress",
    "completed",
    "cancelled"
  ]).default("pending").notNull(),
  
  // Conversation
  conversationHistory: jsonb("conversationHistory").$type<any[]>(),
  
  // Rating
  rating: integer("rating"), // 1-5
  feedback: text("feedback"),
  
  // Metadata
  duration: integer("duration"), // seconds
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});
export type AiSmeConsultation = typeof aiSmeConsultations.$inferSelect;
export type InsertAiSmeConsultation = typeof aiSmeConsultations.$inferInsert;
