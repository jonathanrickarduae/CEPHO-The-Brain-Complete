import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json, boolean, float } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  themePreference: mysqlEnum("themePreference", ["light", "dark", "system"]).default("system").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Mood history - tracks emotional state throughout the day
 * Only captured 3x daily: morning, afternoon, evening
 */
export const moodHistory = mysqlTable("mood_history", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  score: int("score").notNull(), // 1-10
  timeOfDay: mysqlEnum("timeOfDay", ["morning", "afternoon", "evening"]).notNull(),
  note: text("note"), // Optional context
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MoodHistory = typeof moodHistory.$inferSelect;
export type InsertMoodHistory = typeof moodHistory.$inferInsert;

/**
 * Training conversations - full conversation logs with Digital Twin
 */
export const trainingConversations = mysqlTable("training_conversations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  role: mysqlEnum("role", ["user", "twin"]).notNull(),
  content: text("content").notNull(),
  contentType: mysqlEnum("contentType", ["text", "voice", "action"]).default("text").notNull(),
  context: varchar("context", { length: 100 }), // e.g., "daily_brief", "ai_experts", "workflow"
  metadata: json("metadata"), // Additional structured data
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TrainingConversation = typeof trainingConversations.$inferSelect;
export type InsertTrainingConversation = typeof trainingConversations.$inferInsert;

/**
 * Decision patterns - every choice the user makes
 */
export const decisionPatterns = mysqlTable("decision_patterns", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
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
export const userPreferences = mysqlTable("user_preferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  preferenceKey: varchar("preferenceKey", { length: 100 }).notNull(), // e.g., "preferred_meeting_time"
  preferenceValue: text("preferenceValue").notNull(),
  confidence: float("confidence").default(0.5), // 0-1 confidence score
  source: varchar("source", { length: 50 }), // "explicit", "inferred", "conversation"
  learnedAt: timestamp("learnedAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserPreference = typeof userPreferences.$inferSelect;
export type InsertUserPreference = typeof userPreferences.$inferInsert;

/**
 * Vocabulary patterns - user's specific terms and phrases
 */
export const vocabularyPatterns = mysqlTable("vocabulary_patterns", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  term: varchar("term", { length: 200 }).notNull(),
  meaning: text("meaning"), // What the user means by this term
  context: varchar("context", { length: 100 }), // Where this term is typically used
  frequency: int("frequency").default(1), // How often used
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type VocabularyPattern = typeof vocabularyPatterns.$inferSelect;
export type InsertVocabularyPattern = typeof vocabularyPatterns.$inferInsert;

/**
 * Feedback history - user feedback on AI expert work
 */
export const feedbackHistory = mysqlTable("feedback_history", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  expertId: varchar("expertId", { length: 50 }), // AI expert who did the work
  projectId: varchar("projectId", { length: 50 }),
  rating: int("rating"), // 1-5 stars
  feedbackType: mysqlEnum("feedbackType", ["positive", "negative", "neutral", "correction"]).notNull(),
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
export const twinActivityLog = mysqlTable("twin_activity_log", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  activityType: varchar("activityType", { length: 50 }).notNull(), // "email_sent", "task_completed", "meeting_scheduled"
  description: text("description").notNull(),
  status: mysqlEnum("status", ["pending", "completed", "failed", "cancelled"]).default("completed").notNull(),
  autonomous: boolean("autonomous").default(false), // Was this done without user approval?
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TwinActivityLog = typeof twinActivityLog.$inferSelect;
export type InsertTwinActivityLog = typeof twinActivityLog.$inferInsert;

/**
 * AI Expert performance scores
 */
export const expertPerformance = mysqlTable("expert_performance", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  expertId: varchar("expertId", { length: 50 }).notNull(),
  score: float("score").default(80), // 0-100 performance score
  projectsCompleted: int("projectsCompleted").default(0),
  positiveFeedback: int("positiveFeedback").default(0),
  negativeFeedback: int("negativeFeedback").default(0),
  lastUsed: timestamp("lastUsed"),
  notes: text("notes"), // User notes about this expert
  status: mysqlEnum("status", ["active", "training", "fired"]).default("active").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ExpertPerformance = typeof expertPerformance.$inferSelect;
export type InsertExpertPerformance = typeof expertPerformance.$inferInsert;

/**
 * Projects - user's active projects
 */
export const projects = mysqlTable("projects", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["not_started", "in_progress", "blocked", "review", "complete"]).default("not_started").notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high", "critical"]).default("medium").notNull(),
  progress: int("progress").default(0), // 0-100
  dueDate: timestamp("dueDate"),
  blockerDescription: text("blockerDescription"),
  assignedExperts: json("assignedExperts"), // Array of expert IDs
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

/**
 * Daily Brief items
 */
export const dailyBriefItems = mysqlTable("daily_brief_items", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  briefDate: timestamp("briefDate").notNull(),
  category: mysqlEnum("category", ["key_insight", "meeting", "task", "intelligence", "recommendation"]).notNull(),
  title: varchar("title", { length: 300 }).notNull(),
  description: text("description"),
  priority: mysqlEnum("priority", ["low", "medium", "high", "critical"]).default("medium").notNull(),
  status: mysqlEnum("status", ["pending", "got_it", "deferred", "delegated", "digital_twin"]).default("pending").notNull(),
  actionedAt: timestamp("actionedAt"),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DailyBriefItem = typeof dailyBriefItems.$inferSelect;
export type InsertDailyBriefItem = typeof dailyBriefItems.$inferInsert;

/**
 * User settings and app state
 */
export const userSettings = mysqlTable("user_settings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  theme: mysqlEnum("theme", ["light", "dark", "mix"]).default("dark").notNull(),
  governanceMode: mysqlEnum("governanceMode", ["omni", "governed"]).default("governed").notNull(),
  dailyBriefTime: varchar("dailyBriefTime", { length: 10 }).default("07:00"),
  eveningReviewTime: varchar("eveningReviewTime", { length: 10 }).default("18:00"),
  lastMoodCheckMorning: timestamp("lastMoodCheckMorning"),
  lastMoodCheckAfternoon: timestamp("lastMoodCheckAfternoon"),
  lastMoodCheckEvening: timestamp("lastMoodCheckEvening"),
  twinAutonomyLevel: int("twinAutonomyLevel").default(1), // 1-10, how autonomous the twin can be
  notificationsEnabled: boolean("notificationsEnabled").default(true),
  sidebarCollapsed: boolean("sidebarCollapsed").default(false),
  onboardingComplete: boolean("onboardingComplete").default(false),
  metadata: json("metadata"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserSettings = typeof userSettings.$inferSelect;
export type InsertUserSettings = typeof userSettings.$inferInsert;

/**
 * Library documents
 */
export const libraryDocuments = mysqlTable("library_documents", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  projectId: varchar("projectId", { length: 50 }), // null for personal items
  folder: varchar("folder", { length: 100 }).notNull(), // "celadon", "boundless", "personal", etc.
  subFolder: varchar("subFolder", { length: 100 }), // "documents", "ai_images", "charts", etc.
  name: varchar("name", { length: 300 }).notNull(),
  type: mysqlEnum("type", ["document", "image", "chart", "presentation", "data", "other"]).notNull(),
  status: mysqlEnum("status", ["draft", "review", "signed_off"]).default("draft").notNull(),
  fileUrl: text("fileUrl"),
  thumbnailUrl: text("thumbnailUrl"),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LibraryDocument = typeof libraryDocuments.$inferSelect;
export type InsertLibraryDocument = typeof libraryDocuments.$inferInsert;

/**
 * Digital Twin conversation history
 */
export const conversations = mysqlTable("conversations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  role: mysqlEnum("role", ["user", "assistant", "system"]).notNull(),
  content: text("content").notNull(),
  metadata: json("metadata"), // Store additional context like mood, voice input, etc.
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = typeof conversations.$inferInsert;


/**
 * Waitlist - users waiting for access
 */
export const waitlist = mysqlTable("waitlist", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  name: varchar("name", { length: 200 }),
  referralCode: varchar("referralCode", { length: 20 }).notNull().unique(),
  referredBy: varchar("referredBy", { length: 20 }), // Referral code of who referred them
  position: int("position").notNull(),
  status: mysqlEnum("status", ["waiting", "invited", "joined", "churned"]).default("waiting").notNull(),
  invitedAt: timestamp("invitedAt"),
  joinedAt: timestamp("joinedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Waitlist = typeof waitlist.$inferSelect;
export type InsertWaitlist = typeof waitlist.$inferInsert;

/**
 * Referrals - track referral relationships and rewards
 */
export const referrals = mysqlTable("referrals", {
  id: int("id").autoincrement().primaryKey(),
  referrerId: int("referrerId").notNull(), // User who referred
  referredEmail: varchar("referredEmail", { length: 320 }).notNull(),
  referredUserId: int("referredUserId"), // Filled when they join
  status: mysqlEnum("status", ["pending", "signed_up", "active", "churned"]).default("pending").notNull(),
  creditsAwarded: int("creditsAwarded").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  convertedAt: timestamp("convertedAt"),
});

export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = typeof referrals.$inferInsert;

/**
 * User credits - earned through referrals and achievements
 */
export const userCredits = mysqlTable("user_credits", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  balance: int("balance").default(0).notNull(),
  lifetimeEarned: int("lifetimeEarned").default(0).notNull(),
  lifetimeSpent: int("lifetimeSpent").default(0).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserCredits = typeof userCredits.$inferSelect;
export type InsertUserCredits = typeof userCredits.$inferInsert;

/**
 * Credit transactions - audit log of credit changes
 */
export const creditTransactions = mysqlTable("credit_transactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  amount: int("amount").notNull(), // Positive for earn, negative for spend
  type: mysqlEnum("type", ["referral", "achievement", "purchase", "spend", "bonus"]).notNull(),
  description: varchar("description", { length: 500 }),
  referenceId: varchar("referenceId", { length: 100 }), // ID of related entity
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CreditTransaction = typeof creditTransactions.$inferSelect;
export type InsertCreditTransaction = typeof creditTransactions.$inferInsert;

/**
 * Training documents - uploaded files for Digital Twin training
 */
export const trainingDocuments = mysqlTable("training_documents", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 300 }).notNull(),
  type: mysqlEnum("type", ["document", "conversation", "preference", "memory"]).notNull(),
  content: text("content"), // Text content or extracted text
  fileUrl: text("fileUrl"), // S3 URL if file uploaded
  fileSize: int("fileSize"),
  tokenCount: int("tokenCount"),
  processed: boolean("processed").default(false),
  processedAt: timestamp("processedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TrainingDocument = typeof trainingDocuments.$inferSelect;
export type InsertTrainingDocument = typeof trainingDocuments.$inferInsert;

/**
 * Memory bank - persistent facts the Digital Twin remembers
 */
export const memoryBank = mysqlTable("memory_bank", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  category: mysqlEnum("category", ["personal", "work", "preference", "relationship", "fact"]).notNull(),
  key: varchar("key", { length: 200 }).notNull(),
  value: text("value").notNull(),
  confidence: float("confidence").default(1.0),
  source: varchar("source", { length: 100 }), // Where this memory came from
  lastAccessed: timestamp("lastAccessed"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MemoryBank = typeof memoryBank.$inferSelect;
export type InsertMemoryBank = typeof memoryBank.$inferInsert;

/**
 * Wellness scores - daily calculated wellness metrics
 */
export const wellnessScores = mysqlTable("wellness_scores", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  date: timestamp("date").notNull(),
  overallScore: float("overallScore").notNull(), // 0-10
  moodScore: float("moodScore"),
  productivityScore: float("productivityScore"),
  balanceScore: float("balanceScore"),
  momentumScore: float("momentumScore"),
  factors: json("factors"), // Breakdown of contributing factors
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WellnessScore = typeof wellnessScores.$inferSelect;
export type InsertWellnessScore = typeof wellnessScores.$inferInsert;

/**
 * Streaks - gamification tracking
 */
export const streaks = mysqlTable("streaks", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: varchar("type", { length: 50 }).notNull(), // "daily_login", "mood_check", "task_complete"
  currentStreak: int("currentStreak").default(0).notNull(),
  longestStreak: int("longestStreak").default(0).notNull(),
  lastActivityDate: timestamp("lastActivityDate"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Streak = typeof streaks.$inferSelect;
export type InsertStreak = typeof streaks.$inferInsert;

/**
 * Achievements - unlocked achievements
 */
export const achievements = mysqlTable("achievements", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  achievementId: varchar("achievementId", { length: 100 }).notNull(),
  unlockedAt: timestamp("unlockedAt").defaultNow().notNull(),
});

export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = typeof achievements.$inferInsert;


/**
 * Competitors - tracked competitive landscape
 */
export const competitors = mysqlTable("competitors", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  website: varchar("website", { length: 500 }),
  description: text("description"),
  category: varchar("category", { length: 100 }), // "ai_assistant", "productivity", "calendar", etc.
  pricing: varchar("pricing", { length: 100 }), // "free", "$10/mo", "$30/mo", etc.
  targetMarket: varchar("targetMarket", { length: 200 }),
  strengths: json("strengths"), // Array of strength descriptions
  weaknesses: json("weaknesses"), // Array of weakness descriptions
  threatLevel: mysqlEnum("threatLevel", ["low", "medium", "high", "critical"]).default("medium"),
  lastAnalyzed: timestamp("lastAnalyzed"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Competitor = typeof competitors.$inferSelect;
export type InsertCompetitor = typeof competitors.$inferInsert;

/**
 * Feature comparison - track features across competitors
 */
export const featureComparison = mysqlTable("feature_comparison", {
  id: int("id").autoincrement().primaryKey(),
  featureName: varchar("featureName", { length: 200 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(), // "ai", "productivity", "integration", etc.
  description: text("description"),
  theBrainStatus: mysqlEnum("theBrainStatus", ["not_started", "in_progress", "launched", "superior"]).default("not_started"),
  theBrainScore: int("theBrainScore").default(0), // 0-100
  competitorData: json("competitorData"), // { competitorId: score, ... }
  importance: mysqlEnum("importance", ["low", "medium", "high", "critical"]).default("medium"),
  notes: text("notes"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FeatureComparison = typeof featureComparison.$inferSelect;
export type InsertFeatureComparison = typeof featureComparison.$inferInsert;

/**
 * Market position history - track competitive position over time
 */
export const marketPositionHistory = mysqlTable("market_position_history", {
  id: int("id").autoincrement().primaryKey(),
  date: timestamp("date").notNull(),
  overallScore: float("overallScore").notNull(), // 0-100
  featureParityScore: float("featureParityScore"),
  uniqueValueScore: float("uniqueValueScore"),
  marketShareEstimate: float("marketShareEstimate"),
  competitorScores: json("competitorScores"), // { competitorId: score, ... }
  factors: json("factors"), // Breakdown of what contributed to score
  analysis: text("analysis"), // AI-generated analysis
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MarketPositionHistory = typeof marketPositionHistory.$inferSelect;
export type InsertMarketPositionHistory = typeof marketPositionHistory.$inferInsert;

/**
 * Competitive threats - detected threats and opportunities
 */
export const competitiveThreats = mysqlTable("competitive_threats", {
  id: int("id").autoincrement().primaryKey(),
  type: mysqlEnum("type", ["threat", "opportunity"]).notNull(),
  severity: mysqlEnum("severity", ["low", "medium", "high", "critical"]).default("medium"),
  competitorId: int("competitorId"),
  title: varchar("title", { length: 300 }).notNull(),
  description: text("description").notNull(),
  impact: text("impact"), // How this affects The Brain
  recommendedAction: text("recommendedAction"),
  status: mysqlEnum("status", ["new", "analyzing", "action_required", "addressed", "monitoring"]).default("new"),
  detectedAt: timestamp("detectedAt").defaultNow().notNull(),
  addressedAt: timestamp("addressedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CompetitiveThreat = typeof competitiveThreats.$inferSelect;
export type InsertCompetitiveThreat = typeof competitiveThreats.$inferInsert;

/**
 * Regulatory landscape - track regulations and compliance
 */
export const regulatoryLandscape = mysqlTable("regulatory_landscape", {
  id: int("id").autoincrement().primaryKey(),
  region: varchar("region", { length: 100 }).notNull(), // "US", "EU", "UK", "Global"
  regulation: varchar("regulation", { length: 300 }).notNull(), // "GDPR", "AI Act", "CCPA"
  category: varchar("category", { length: 100 }), // "data_privacy", "ai_governance", "consumer_protection"
  status: mysqlEnum("status", ["proposed", "enacted", "enforced"]).default("proposed"),
  effectiveDate: timestamp("effectiveDate"),
  complianceStatus: mysqlEnum("complianceStatus", ["not_applicable", "non_compliant", "partial", "compliant"]).default("not_applicable"),
  moatPotential: mysqlEnum("moatPotential", ["none", "low", "medium", "high"]).default("none"),
  description: text("description"),
  requirements: json("requirements"), // Array of specific requirements
  notes: text("notes"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type RegulatoryLandscape = typeof regulatoryLandscape.$inferSelect;
export type InsertRegulatoryLandscape = typeof regulatoryLandscape.$inferInsert;

/**
 * Strategy recommendations - AI-generated strategic advice
 */
export const strategyRecommendations = mysqlTable("strategy_recommendations", {
  id: int("id").autoincrement().primaryKey(),
  category: mysqlEnum("category", ["product", "pricing", "marketing", "partnership", "regulatory", "technical"]).notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high", "critical"]).default("medium"),
  title: varchar("title", { length: 300 }).notNull(),
  recommendation: text("recommendation").notNull(),
  rationale: text("rationale"),
  expectedImpact: text("expectedImpact"),
  effort: mysqlEnum("effort", ["low", "medium", "high"]).default("medium"),
  timeframe: varchar("timeframe", { length: 100 }), // "immediate", "1-2 weeks", "1-3 months"
  status: mysqlEnum("status", ["proposed", "approved", "in_progress", "completed", "rejected"]).default("proposed"),
  generatedBy: varchar("generatedBy", { length: 100 }), // AI expert who generated it
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type StrategyRecommendation = typeof strategyRecommendations.$inferSelect;
export type InsertStrategyRecommendation = typeof strategyRecommendations.$inferInsert;

/**
 * Commercialization tasks - Digital Twin's strategy work
 */
export const commercializationTasks = mysqlTable("commercialization_tasks", {
  id: int("id").autoincrement().primaryKey(),
  taskType: mysqlEnum("taskType", ["competitor_analysis", "feature_gap", "market_research", "pricing_review", "regulatory_check", "strategy_update"]).notNull(),
  title: varchar("title", { length: 300 }).notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["pending", "in_progress", "completed", "failed"]).default("pending"),
  priority: mysqlEnum("priority", ["low", "medium", "high"]).default("medium"),
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
export const vaultVerificationCodes = mysqlTable("vault_verification_codes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  code: varchar("code", { length: 6 }).notNull(), // 6-digit code
  method: mysqlEnum("method", ["email", "sms"]).default("email").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  used: boolean("used").default(false),
  attempts: int("attempts").default(0), // Failed verification attempts
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type VaultVerificationCode = typeof vaultVerificationCodes.$inferSelect;
export type InsertVaultVerificationCode = typeof vaultVerificationCodes.$inferInsert;

/**
 * Trusted devices - devices that can skip 2FA temporarily
 */
export const trustedDevices = mysqlTable("trusted_devices", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
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
export const vaultAccessLog = mysqlTable("vault_access_log", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
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
  metadata: json("metadata"), // Additional info like device, location
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type VaultAccessLog = typeof vaultAccessLog.$inferSelect;
export type InsertVaultAccessLog = typeof vaultAccessLog.$inferInsert;

/**
 * Vault sessions - active authenticated sessions
 */
export const vaultSessions = mysqlTable("vault_sessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
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
export const integrations = mysqlTable("integrations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  provider: varchar("provider", { length: 50 }).notNull(), // "asana", "google", "outlook", "slack", etc.
  providerAccountId: varchar("providerAccountId", { length: 200 }), // External account ID
  accessToken: text("accessToken"), // Encrypted
  refreshToken: text("refreshToken"), // Encrypted
  tokenExpiresAt: timestamp("tokenExpiresAt"),
  scopes: json("scopes"), // Array of granted scopes
  status: mysqlEnum("status", ["active", "expired", "revoked", "error"]).default("active").notNull(),
  lastSyncAt: timestamp("lastSyncAt"),
  syncError: text("syncError"),
  metadata: json("metadata"), // Provider-specific data
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Integration = typeof integrations.$inferSelect;
export type InsertIntegration = typeof integrations.$inferInsert;

/**
 * Notifications - in-app notification system
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
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
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * Audit log - comprehensive activity tracking
 */
export const auditLog = mysqlTable("audit_log", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  action: varchar("action", { length: 100 }).notNull(), // "login", "create_project", "update_settings", etc.
  resource: varchar("resource", { length: 100 }), // "project", "document", "integration", etc.
  resourceId: varchar("resourceId", { length: 100 }),
  details: json("details"), // Action-specific data
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
export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
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
  cost: float("cost").notNull(), // Cost in AED
  billingCycle: mysqlEnum("billingCycle", ["monthly", "quarterly", "annual", "one_time", "usage_based"]).default("monthly").notNull(),
  currency: varchar("currency", { length: 10 }).default("AED").notNull(),
  status: mysqlEnum("status", ["active", "paused", "cancelled", "trial"]).default("active").notNull(),
  startDate: timestamp("startDate"),
  renewalDate: timestamp("renewalDate"),
  trialEndDate: timestamp("trialEndDate"),
  usagePercent: int("usagePercent"), // 0-100, how much of the subscription is used
  websiteUrl: text("websiteUrl"),
  logoUrl: text("logoUrl"),
  linkedIdeaId: int("linkedIdeaId"), // Link to innovation idea if subscription is for a specific project
  linkedProjectId: int("linkedProjectId"),
  notes: text("notes"),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

/**
 * Project Genesis - new opportunity/deal tracking
 */
export const projectGenesis = mysqlTable("project_genesis", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 300 }).notNull(),
  type: mysqlEnum("type", ["investment", "partnership", "acquisition", "joint_venture", "other"]).notNull(),
  stage: mysqlEnum("stage", [
    "discovery", "qualification", "due_diligence", 
    "negotiation", "documentation", "closing", "post_deal"
  ]).default("discovery").notNull(),
  status: mysqlEnum("status", ["active", "on_hold", "won", "lost", "abandoned"]).default("active").notNull(),
  counterparty: varchar("counterparty", { length: 300 }),
  dealValue: float("dealValue"),
  currency: varchar("currency", { length: 3 }).default("USD"),
  probability: int("probability").default(50), // 0-100
  expectedCloseDate: timestamp("expectedCloseDate"),
  description: text("description"),
  keyContacts: json("keyContacts"), // Array of contact info
  documents: json("documents"), // Array of document references
  tasks: json("tasks"), // Array of task IDs
  notes: text("notes"),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ProjectGenesisRecord = typeof projectGenesis.$inferSelect;
export type InsertProjectGenesis = typeof projectGenesis.$inferInsert;

/**
 * Universal Inbox - centralized intake for all incoming items
 */
export const universalInbox = mysqlTable("universal_inbox", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
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
  priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium"),
  status: mysqlEnum("status", [
    "unread", "read", "processing", "processed", 
    "archived", "deleted", "action_required"
  ]).default("unread").notNull(),
  processedBy: varchar("processedBy", { length: 100 }), // "digital_twin", "ai_expert", "user"
  processedResult: text("processedResult"),
  attachments: json("attachments"), // Array of attachment URLs
  metadata: json("metadata"),
  receivedAt: timestamp("receivedAt").defaultNow().notNull(),
  processedAt: timestamp("processedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UniversalInboxItem = typeof universalInbox.$inferSelect;
export type InsertUniversalInboxItem = typeof universalInbox.$inferInsert;

/**
 * Brand Kit - company branding assets
 */
export const brandKit = mysqlTable("brand_kit", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
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
  socialLinks: json("socialLinks"), // { linkedin, twitter, etc. }
  templates: json("templates"), // Document template settings
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BrandKitRecord = typeof brandKit.$inferSelect;
export type InsertBrandKit = typeof brandKit.$inferInsert;

/**
 * Signatures - stored signatures for document signing
 */
export const signatures = mysqlTable("signatures", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 200 }).notNull(), // "Main Signature", "Initials", etc.
  type: mysqlEnum("type", ["drawn", "typed", "uploaded"]).notNull(),
  imageUrl: text("imageUrl").notNull(), // S3 URL of signature image
  fontFamily: varchar("fontFamily", { length: 100 }), // For typed signatures
  isDefault: boolean("isDefault").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Signature = typeof signatures.$inferSelect;
export type InsertSignature = typeof signatures.$inferInsert;

/**
 * AI Provider settings - API keys and routing preferences
 */
export const aiProviderSettings = mysqlTable("ai_provider_settings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  provider: varchar("provider", { length: 50 }).notNull(), // "openai", "anthropic", "perplexity", etc.
  apiKey: text("apiKey"), // Encrypted
  isEnabled: boolean("isEnabled").default(true),
  priority: int("priority").default(1), // Lower = higher priority
  usageLimit: int("usageLimit"), // Monthly token limit
  currentUsage: int("currentUsage").default(0),
  domains: json("domains"), // Array of domains this provider handles
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AIProviderSetting = typeof aiProviderSettings.$inferSelect;
export type InsertAIProviderSetting = typeof aiProviderSettings.$inferInsert;

/**
 * Reminders - scheduled reminders and follow-ups
 */
export const reminders = mysqlTable("reminders", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 300 }).notNull(),
  description: text("description"),
  dueAt: timestamp("dueAt").notNull(),
  repeatType: mysqlEnum("repeatType", ["none", "daily", "weekly", "monthly", "custom"]).default("none"),
  repeatInterval: int("repeatInterval"), // For custom repeats
  status: mysqlEnum("status", ["pending", "triggered", "snoozed", "completed", "cancelled"]).default("pending"),
  snoozedUntil: timestamp("snoozedUntil"),
  relatedType: varchar("relatedType", { length: 50 }), // "project", "task", "inbox_item", etc.
  relatedId: int("relatedId"),
  notificationSent: boolean("notificationSent").default(false),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Reminder = typeof reminders.$inferSelect;
export type InsertReminder = typeof reminders.$inferInsert;

/**
 * Tasks - granular task tracking within projects with QA workflow
 */
export const tasks = mysqlTable("tasks", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  projectId: int("projectId"),
  teamId: int("teamId"), // Link to SME team
  parentTaskId: int("parentTaskId"), // For subtasks
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  status: mysqlEnum("status", [
    "not_started", "in_progress", "blocked", 
    "review", "cos_approved", "verified", "completed", "cancelled"
  ]).default("not_started").notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high", "critical"]).default("medium"),
  progress: int("progress").default(0), // 0-100
  dueDate: timestamp("dueDate"),
  estimatedHours: float("estimatedHours"),
  actualHours: float("actualHours"),
  assignedTo: varchar("assignedTo", { length: 100 }), // "digital_twin", expert ID, or "user"
  assignedExperts: json("assignedExperts"), // Array of expert IDs for team tasks
  dependencies: json("dependencies"), // Array of task IDs this depends on
  blockerDescription: text("blockerDescription"),
  cosScore: int("cosScore"), // Chief of Staff QA score (1-10)
  secondaryAiScore: int("secondaryAiScore"), // Secondary AI verification score (1-10)
  qaStatus: mysqlEnum("qaStatus", ["pending", "cos_reviewed", "secondary_reviewed", "approved", "rejected"]).default("pending"),
  completedAt: timestamp("completedAt"),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Task = typeof tasks.$inferSelect;
export type InsertTask = typeof tasks.$inferInsert;

/**
 * Activity feed - project and system activity
 */
export const activityFeed = mysqlTable("activity_feed", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  projectId: int("projectId"),
  actorType: mysqlEnum("actorType", ["user", "digital_twin", "ai_expert", "system"]).notNull(),
  actorId: varchar("actorId", { length: 100 }), // Expert ID or "system"
  actorName: varchar("actorName", { length: 200 }),
  action: varchar("action", { length: 100 }).notNull(), // "created", "updated", "completed", etc.
  targetType: varchar("targetType", { length: 50 }), // "task", "document", "project", etc.
  targetId: int("targetId"),
  targetName: varchar("targetName", { length: 300 }),
  description: text("description"),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ActivityFeedItem = typeof activityFeed.$inferSelect;
export type InsertActivityFeedItem = typeof activityFeed.$inferInsert;

/**
 * Data retention policies - compliance tracking
 */
export const dataRetentionPolicies = mysqlTable("data_retention_policies", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  dataType: varchar("dataType", { length: 100 }).notNull(), // "conversations", "documents", "audit_logs", etc.
  retentionDays: int("retentionDays").notNull(),
  autoDelete: boolean("autoDelete").default(false),
  lastPurgeAt: timestamp("lastPurgeAt"),
  nextPurgeAt: timestamp("nextPurgeAt"),
  itemsDeleted: int("itemsDeleted").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DataRetentionPolicy = typeof dataRetentionPolicies.$inferSelect;
export type InsertDataRetentionPolicy = typeof dataRetentionPolicies.$inferInsert;

/**
 * PII detection log - flagged sensitive data
 */
export const piiDetectionLog = mysqlTable("pii_detection_log", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  sourceType: varchar("sourceType", { length: 50 }).notNull(), // "document", "conversation", "inbox", etc.
  sourceId: int("sourceId").notNull(),
  piiType: varchar("piiType", { length: 50 }).notNull(), // "email", "phone", "ssn", "credit_card", etc.
  detectedText: text("detectedText"), // The flagged content (may be redacted)
  confidence: float("confidence"), // 0-1 confidence score
  status: mysqlEnum("status", ["detected", "reviewed", "false_positive", "redacted"]).default("detected"),
  reviewedBy: varchar("reviewedBy", { length: 100 }),
  reviewedAt: timestamp("reviewedAt"),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PIIDetectionLog = typeof piiDetectionLog.$inferSelect;
export type InsertPIIDetectionLog = typeof piiDetectionLog.$inferInsert;

/**
 * Compliance checklists - project-specific compliance tracking
 */
export const complianceChecklists = mysqlTable("compliance_checklists", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  projectId: int("projectId"),
  projectType: varchar("projectType", { length: 100 }).notNull(), // "investment", "partnership", etc.
  checklistName: varchar("checklistName", { length: 200 }).notNull(),
  items: json("items").notNull(), // Array of { id, title, required, completed, completedAt, notes }
  completedCount: int("completedCount").default(0),
  totalCount: int("totalCount").notNull(),
  status: mysqlEnum("status", ["not_started", "in_progress", "completed", "blocked"]).default("not_started"),
  dueDate: timestamp("dueDate"),
  completedAt: timestamp("completedAt"),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ComplianceChecklist = typeof complianceChecklists.$inferSelect;
export type InsertComplianceChecklist = typeof complianceChecklists.$inferInsert;


/**
 * Voice notes - captured throughout the day for Digital Twin context
 */
export const voiceNotes = mysqlTable("voice_notes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  content: text("content").notNull(), // Transcribed text
  category: mysqlEnum("category", ["task", "idea", "reminder", "observation", "question", "follow_up"]).default("observation").notNull(),
  audioUrl: varchar("audioUrl", { length: 500 }), // S3 URL to original audio
  duration: int("duration"), // Duration in seconds
  projectId: int("projectId"), // Optional link to project
  projectName: varchar("projectName", { length: 300 }),
  isActionItem: boolean("isActionItem").default(false),
  isProcessed: boolean("isProcessed").default(false), // Has Digital Twin processed this?
  extractedTasks: json("extractedTasks"), // Array of task strings extracted
  metadata: json("metadata"),
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
export const expertConversations = mysqlTable("expert_conversations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  expertId: varchar("expertId", { length: 50 }).notNull(),
  role: mysqlEnum("role", ["user", "expert", "system"]).notNull(),
  content: text("content").notNull(),
  projectId: int("projectId"), // Optional link to project
  taskId: varchar("taskId", { length: 100 }), // Task this conversation relates to
  sentiment: mysqlEnum("sentiment", ["positive", "neutral", "negative"]),
  qualityScore: int("qualityScore"), // 1-10 rating of this response
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ExpertConversation = typeof expertConversations.$inferSelect;
export type InsertExpertConversation = typeof expertConversations.$inferInsert;

/**
 * Expert memory - key learnings and preferences per expert
 * What each expert has learned about the user and their work
 */
export const expertMemory = mysqlTable("expert_memory", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  expertId: varchar("expertId", { length: 50 }).notNull(),
  memoryType: mysqlEnum("memoryType", ["preference", "fact", "style", "context", "correction"]).notNull(),
  key: varchar("key", { length: 200 }).notNull(),
  value: text("value").notNull(),
  confidence: float("confidence").default(0.8), // 0-1 confidence in this memory
  source: varchar("source", { length: 100 }), // "conversation", "feedback", "inferred"
  usageCount: int("usageCount").default(0), // How often this memory has been used
  lastUsed: timestamp("lastUsed"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ExpertMemory = typeof expertMemory.$inferSelect;
export type InsertExpertMemory = typeof expertMemory.$inferInsert;

/**
 * Expert prompt evolution - track how expert prompts change over time
 * Enables self-improvement based on feedback
 */
export const expertPromptEvolution = mysqlTable("expert_prompt_evolution", {
  id: int("id").autoincrement().primaryKey(),
  expertId: varchar("expertId", { length: 50 }).notNull(),
  version: int("version").notNull(),
  promptAdditions: text("promptAdditions"), // Additional instructions added
  communicationStyle: text("communicationStyle"), // Learned communication preferences
  strengthAdjustments: json("strengthAdjustments"), // Adjusted strength scores
  weaknessAdjustments: json("weaknessAdjustments"), // Adjusted weakness areas
  reason: text("reason"), // Why this change was made
  performanceBefore: float("performanceBefore"),
  performanceAfter: float("performanceAfter"),
  appliedAt: timestamp("appliedAt").defaultNow().notNull(),
  createdBy: varchar("createdBy", { length: 50 }), // "chief_of_staff", "user_feedback", "auto"
});

export type ExpertPromptEvolution = typeof expertPromptEvolution.$inferSelect;
export type InsertExpertPromptEvolution = typeof expertPromptEvolution.$inferInsert;

/**
 * Expert insights - shared knowledge repository
 * Insights generated by experts that can be referenced by others
 */
export const expertInsights = mysqlTable("expert_insights", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  expertId: varchar("expertId", { length: 50 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(), // "market", "strategy", "operations", etc.
  title: varchar("title", { length: 300 }).notNull(),
  insight: text("insight").notNull(),
  evidence: text("evidence"), // Supporting data/reasoning
  confidence: float("confidence").default(0.7),
  tags: json("tags"), // Array of tags for searchability
  projectId: int("projectId"),
  relatedExpertIds: json("relatedExpertIds"), // Other experts who contributed
  usageCount: int("usageCount").default(0), // How often referenced by other experts
  validatedBy: json("validatedBy"), // Array of expert IDs who validated this
  status: mysqlEnum("status", ["draft", "validated", "outdated", "archived"]).default("draft"),
  expiresAt: timestamp("expiresAt"), // When this insight should be reviewed
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ExpertInsight = typeof expertInsights.$inferSelect;
export type InsertExpertInsight = typeof expertInsights.$inferInsert;

/**
 * Expert research tasks - scheduled research for domain updates
 * Keeps experts current in their field
 */
export const expertResearchTasks = mysqlTable("expert_research_tasks", {
  id: int("id").autoincrement().primaryKey(),
  expertId: varchar("expertId", { length: 50 }).notNull(),
  topic: varchar("topic", { length: 300 }).notNull(),
  description: text("description"),
  priority: mysqlEnum("priority", ["low", "medium", "high", "critical"]).default("medium"),
  status: mysqlEnum("status", ["pending", "in_progress", "completed", "failed"]).default("pending"),
  scheduledFor: timestamp("scheduledFor"),
  completedAt: timestamp("completedAt"),
  findings: text("findings"), // Research results
  sourcesUsed: json("sourcesUsed"), // Array of sources consulted
  insightsGenerated: json("insightsGenerated"), // IDs of insights created from this research
  assignedBy: varchar("assignedBy", { length: 50 }), // "chief_of_staff", "user", "auto"
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ExpertResearchTask = typeof expertResearchTasks.$inferSelect;
export type InsertExpertResearchTask = typeof expertResearchTasks.$inferInsert;

/**
 * Expert collaboration log - track how experts work together
 * Records cross-expert interactions and knowledge sharing
 */
export const expertCollaboration = mysqlTable("expert_collaboration", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  initiatorExpertId: varchar("initiatorExpertId", { length: 50 }).notNull(),
  collaboratorExpertIds: json("collaboratorExpertIds").notNull(), // Array of expert IDs
  projectId: int("projectId"),
  taskDescription: text("taskDescription").notNull(),
  outcome: text("outcome"),
  qualityScore: int("qualityScore"), // 1-10 rating of collaboration
  lessonsLearned: text("lessonsLearned"), // What was learned from this collaboration
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ExpertCollaboration = typeof expertCollaboration.$inferSelect;
export type InsertExpertCollaboration = typeof expertCollaboration.$inferInsert;

/**
 * Expert coaching sessions - Chief of Staff training experts
 * Records coaching interactions to improve expert performance
 */
export const expertCoachingSessions = mysqlTable("expert_coaching_sessions", {
  id: int("id").autoincrement().primaryKey(),
  expertId: varchar("expertId", { length: 50 }).notNull(),
  coachType: mysqlEnum("coachType", ["chief_of_staff", "peer_expert", "user"]).notNull(),
  coachId: varchar("coachId", { length: 50 }), // ID of coaching expert if peer
  focusArea: varchar("focusArea", { length: 200 }).notNull(), // "communication", "accuracy", "speed", etc.
  feedbackGiven: text("feedbackGiven").notNull(),
  improvementPlan: text("improvementPlan"),
  metricsBeforeCoaching: json("metricsBeforeCoaching"),
  metricsAfterCoaching: json("metricsAfterCoaching"),
  status: mysqlEnum("status", ["scheduled", "in_progress", "completed", "follow_up_needed"]).default("scheduled"),
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
export const expertDomainKnowledge = mysqlTable("expert_domain_knowledge", {
  id: int("id").autoincrement().primaryKey(),
  expertId: varchar("expertId", { length: 50 }).notNull(),
  domain: varchar("domain", { length: 200 }).notNull(), // "private_equity", "strategy", "marketing", etc.
  subDomain: varchar("subDomain", { length: 200 }), // More specific area
  knowledgeLevel: mysqlEnum("knowledgeLevel", ["basic", "intermediate", "advanced", "expert"]).default("advanced"),
  lastUpdated: timestamp("lastUpdated").defaultNow().notNull(),
  updateFrequency: varchar("updateFrequency", { length: 50 }).default("weekly"), // How often to refresh
  sources: json("sources"), // Preferred sources for this domain
  keyFrameworks: json("keyFrameworks"), // Frameworks this expert uses
  recentDevelopments: text("recentDevelopments"), // Latest updates in this domain
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ExpertDomainKnowledge = typeof expertDomainKnowledge.$inferSelect;
export type InsertExpertDomainKnowledge = typeof expertDomainKnowledge.$inferInsert;


/**
 * Favorite contacts - quick access to frequently messaged contacts
 * Allows users to star/favorite contacts for quick access in the Message Chief of Staff section
 */
export const favoriteContacts = mysqlTable("favorite_contacts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  contactType: mysqlEnum("contactType", ["expert", "corporate_partner", "ai_expert", "colleague"]).notNull(),
  contactId: varchar("contactId", { length: 100 }).notNull(), // ID of the expert, partner, or colleague
  contactName: varchar("contactName", { length: 200 }).notNull(), // Display name
  contactAvatar: varchar("contactAvatar", { length: 500 }), // Avatar URL
  order: int("order").default(0), // For custom ordering
  isFavorited: boolean("isFavorited").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FavoriteContact = typeof favoriteContacts.$inferSelect;
export type InsertFavoriteContact = typeof favoriteContacts.$inferInsert;


/**
 * SME Teams - assembled teams of AI experts for specific projects/tasks
 * Users can create and save teams for reuse
 */
export const smeTeams = mysqlTable("sme_teams", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  purpose: varchar("purpose", { length: 300 }), // What this team is for
  projectId: int("projectId"), // Optional link to a project
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SmeTeam = typeof smeTeams.$inferSelect;
export type InsertSmeTeam = typeof smeTeams.$inferInsert;

/**
 * SME Team Members - experts assigned to a team
 */
export const smeTeamMembers = mysqlTable("sme_team_members", {
  id: int("id").autoincrement().primaryKey(),
  teamId: int("teamId").notNull(),
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
export const taskQaReviews = mysqlTable("task_qa_reviews", {
  id: int("id").autoincrement().primaryKey(),
  taskId: int("taskId").notNull(),
  reviewType: mysqlEnum("reviewType", ["cos_review", "secondary_ai", "sme_feedback"]).notNull(),
  reviewerId: varchar("reviewerId", { length: 100 }), // "chief_of_staff" or AI expert ID
  score: int("score"), // 1-10 quality score
  feedback: text("feedback"),
  status: mysqlEnum("status", ["pending", "approved", "rejected", "needs_revision"]).default("pending").notNull(),
  improvements: json("improvements"), // Suggested improvements
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TaskQaReview = typeof taskQaReviews.$inferSelect;
export type InsertTaskQaReview = typeof taskQaReviews.$inferInsert;

/**
 * SME Feedback Log - feedback from Chief of Staff to individual SME experts
 * Helps experts learn and improve over time
 */
export const smeFeedbackLog = mysqlTable("sme_feedback_log", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  expertId: varchar("expertId", { length: 50 }).notNull(),
  taskId: int("taskId"),
  feedbackType: mysqlEnum("feedbackType", ["positive", "constructive", "correction", "training"]).notNull(),
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
export const expertConsultations = mysqlTable("expert_consultations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  expertId: varchar("expertId", { length: 50 }).notNull(),
  expertName: varchar("expertName", { length: 200 }).notNull(),
  expertCategory: varchar("expertCategory", { length: 100 }),
  topic: varchar("topic", { length: 300 }), // What was discussed
  summary: text("summary"), // AI-generated summary of the consultation
  recommendations: json("recommendations"), // Key recommendations from the expert
  userRating: int("userRating"), // 1-10 rating of the consultation
  userFeedback: text("userFeedback"), // Optional feedback
  duration: int("duration"), // Duration in seconds
  messageCount: int("messageCount").default(0), // Number of messages exchanged
  projectId: int("projectId"), // Optional link to project
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ExpertConsultation = typeof expertConsultations.$inferSelect;
export type InsertExpertConsultation = typeof expertConsultations.$inferInsert;

/**
 * Expert Chat Sessions - individual chat sessions with experts
 * Stores messages and context for each chat session
 */
export const expertChatSessions = mysqlTable("expert_chat_sessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  expertId: varchar("expertId", { length: 50 }).notNull(),
  expertName: varchar("expertName", { length: 200 }),
  systemPrompt: text("systemPrompt"),
  projectId: int("projectId"),
  consultationId: int("consultationId"), // Link to parent consultation
  status: mysqlEnum("status", ["active", "paused", "completed"]).default("active").notNull(),
  summary: text("summary"),
  lastMessageAt: timestamp("lastMessageAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ExpertChatSession = typeof expertChatSessions.$inferSelect;
export type InsertExpertChatSession = typeof expertChatSessions.$inferInsert;

/**
 * Expert Chat Messages - individual messages in a chat session
 */
export const expertChatMessages = mysqlTable("expert_chat_messages", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: int("sessionId").notNull(),
  role: mysqlEnum("role", ["user", "expert", "system"]).notNull(),
  content: text("content").notNull(),
  metadata: json("metadata"), // Additional context like voice input, attachments
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ExpertChatMessage = typeof expertChatMessages.$inferSelect;
export type InsertExpertChatMessage = typeof expertChatMessages.$inferInsert;


/**
 * Business Plan Review Versions - track review history over time
 */
export const businessPlanReviewVersions = mysqlTable("business_plan_review_versions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  projectName: varchar("projectName", { length: 300 }).notNull(),
  versionNumber: int("versionNumber").notNull(),
  versionLabel: varchar("versionLabel", { length: 100 }), // e.g., "Initial Draft", "Post-Feedback"
  overallScore: int("overallScore"), // 0-100
  sectionScores: json("sectionScores"), // { sectionId: score, ... }
  reviewData: json("reviewData"), // Full review data including expert insights
  expertTeam: json("expertTeam"), // List of expert IDs used
  teamSelectionMode: varchar("teamSelectionMode", { length: 50 }), // "chief-of-staff" or "manual"
  businessPlanContent: text("businessPlanContent"), // The content that was reviewed
  sectionDocuments: json("sectionDocuments"), // { sectionId: { fileName, content }, ... }
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type BusinessPlanReviewVersion = typeof businessPlanReviewVersions.$inferSelect;
export type InsertBusinessPlanReviewVersion = typeof businessPlanReviewVersions.$inferInsert;

/**
 * Expert Follow-up Questions - Q&A with experts after review
 */
export const expertFollowUpQuestions = mysqlTable("expert_follow_up_questions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  reviewVersionId: int("reviewVersionId").notNull(), // Link to review version
  sectionId: varchar("sectionId", { length: 100 }).notNull(),
  expertId: varchar("expertId", { length: 100 }).notNull(),
  question: text("question").notNull(),
  answer: text("answer"),
  status: mysqlEnum("status", ["pending", "answered"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  answeredAt: timestamp("answeredAt"),
});

export type ExpertFollowUpQuestion = typeof expertFollowUpQuestions.$inferSelect;
export type InsertExpertFollowUpQuestion = typeof expertFollowUpQuestions.$inferInsert;

/**
 * Collaborative Review Sessions - Multi-user review sessions
 */
export const collaborativeReviewSessions = mysqlTable("collaborative_review_sessions", {
  id: int("id").autoincrement().primaryKey(),
  ownerId: int("ownerId").notNull(), // User who created the session
  projectName: varchar("projectName", { length: 255 }).notNull(),
  templateId: varchar("templateId", { length: 100 }),
  status: mysqlEnum("status", ["active", "completed", "archived"]).default("active").notNull(),
  reviewData: json("reviewData"), // Current state of the review
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CollaborativeReviewSession = typeof collaborativeReviewSessions.$inferSelect;
export type InsertCollaborativeReviewSession = typeof collaborativeReviewSessions.$inferInsert;

/**
 * Collaborative Review Participants - Users invited to a review session
 */
export const collaborativeReviewParticipants = mysqlTable("collaborative_review_participants", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: int("sessionId").notNull(),
  userId: int("userId").notNull(),
  role: mysqlEnum("role", ["owner", "reviewer", "viewer"]).default("viewer").notNull(),
  invitedBy: int("invitedBy"),
  invitedAt: timestamp("invitedAt").defaultNow().notNull(),
  joinedAt: timestamp("joinedAt"),
  lastActiveAt: timestamp("lastActiveAt"),
});

export type CollaborativeReviewParticipant = typeof collaborativeReviewParticipants.$inferSelect;
export type InsertCollaborativeReviewParticipant = typeof collaborativeReviewParticipants.$inferInsert;

/**
 * Collaborative Review Comments - Comments on sections from collaborators
 */
export const collaborativeReviewComments = mysqlTable("collaborative_review_comments", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: int("sessionId").notNull(),
  userId: int("userId").notNull(),
  sectionId: varchar("sectionId", { length: 100 }).notNull(),
  comment: text("comment").notNull(),
  parentCommentId: int("parentCommentId"), // For threaded replies
  status: mysqlEnum("status", ["active", "resolved", "deleted"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CollaborativeReviewComment = typeof collaborativeReviewComments.$inferSelect;
export type InsertCollaborativeReviewComment = typeof collaborativeReviewComments.$inferInsert;

/**
 * Collaborative Review Activity - Track who reviewed what
 */
export const collaborativeReviewActivity = mysqlTable("collaborative_review_activity", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: int("sessionId").notNull(),
  userId: int("userId").notNull(),
  action: mysqlEnum("action", ["joined", "viewed_section", "commented", "reviewed_section", "completed_review"]).notNull(),
  sectionId: varchar("sectionId", { length: 100 }),
  metadata: json("metadata"),
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
export const valueChainPhases = mysqlTable("value_chain_phases", {
  id: int("id").autoincrement().primaryKey(),
  phaseNumber: int("phaseNumber").notNull(), // 1-7
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  primaryFocus: text("primaryFocus"),
  keyExpertPanels: json("keyExpertPanels"), // Array of panel categories
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ValueChainPhase = typeof valueChainPhases.$inferSelect;
export type InsertValueChainPhase = typeof valueChainPhases.$inferInsert;

/**
 * Blueprints - Standardized process documents that track through phases
 */
export const blueprints = mysqlTable("blueprints", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  projectId: int("projectId"), // Link to projects table
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
  currentPhase: int("currentPhase").default(1).notNull(), // 1-7
  status: mysqlEnum("status", [
    "draft",
    "in_review",
    "approved",
    "rejected",
    "archived"
  ]).default("draft").notNull(),
  version: int("version").default(1).notNull(),
  content: json("content"), // Structured content of the blueprint
  fileUrl: text("fileUrl"), // S3 URL if file uploaded
  qualityGateStatus: mysqlEnum("qualityGateStatus", [
    "not_started",
    "level_1_complete",
    "level_2_complete",
    "level_3_complete",
    "level_4_complete"
  ]).default("not_started").notNull(),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Blueprint = typeof blueprints.$inferSelect;
export type InsertBlueprint = typeof blueprints.$inferInsert;

/**
 * Blueprint Versions - Track document history
 */
export const blueprintVersions = mysqlTable("blueprint_versions", {
  id: int("id").autoincrement().primaryKey(),
  blueprintId: int("blueprintId").notNull(),
  version: int("version").notNull(),
  content: json("content"),
  fileUrl: text("fileUrl"),
  changeDescription: text("changeDescription"),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type BlueprintVersion = typeof blueprintVersions.$inferSelect;
export type InsertBlueprintVersion = typeof blueprintVersions.$inferInsert;

/**
 * SME Panel Types - Blue Team, Left-Field, Red Team (Devil's Advocate)
 */
export const smePanelTypes = mysqlTable("sme_panel_types", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  code: mysqlEnum("code", ["blue_team", "left_field", "red_team"]).notNull(),
  description: text("description"),
  role: text("role"), // What this panel does
  typicalComposition: json("typicalComposition"), // Array of expert categories
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SmePanelType = typeof smePanelTypes.$inferSelect;
export type InsertSmePanelType = typeof smePanelTypes.$inferInsert;

/**
 * SME Panels - Assembled panels for specific reviews
 */
export const smePanels = mysqlTable("sme_panels", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  blueprintId: int("blueprintId"), // Optional link to blueprint
  projectId: int("projectId"), // Optional link to project
  panelTypeCode: mysqlEnum("panelTypeCode", ["blue_team", "left_field", "red_team"]).notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  purpose: text("purpose"),
  phase: int("phase"), // Which value chain phase (1-7)
  status: mysqlEnum("status", ["assembling", "active", "completed", "disbanded"]).default("assembling").notNull(),
  expertIds: json("expertIds"), // Array of expert IDs assigned to this panel
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SmePanel = typeof smePanels.$inferSelect;
export type InsertSmePanel = typeof smePanels.$inferInsert;

/**
 * SME Panel Consultations - Records of panel reviews and feedback
 */
export const smePanelConsultations = mysqlTable("sme_panel_consultations", {
  id: int("id").autoincrement().primaryKey(),
  panelId: int("panelId").notNull(),
  blueprintId: int("blueprintId"),
  consultationType: mysqlEnum("consultationType", [
    "concept_review",
    "pre_mortem",
    "red_team_challenge",
    "validation_review",
    "quality_gate_review",
    "ad_hoc"
  ]).notNull(),
  question: text("question"), // What was asked of the panel
  findings: json("findings"), // Structured findings from each expert
  recommendations: text("recommendations"),
  risksIdentified: json("risksIdentified"), // Array of risks
  status: mysqlEnum("status", ["pending", "in_progress", "completed"]).default("pending").notNull(),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SmePanelConsultation = typeof smePanelConsultations.$inferSelect;
export type InsertSmePanelConsultation = typeof smePanelConsultations.$inferInsert;

/**
 * Quality Gates - 4-level review protocol at each phase
 */
export const qualityGates = mysqlTable("quality_gates", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  blueprintId: int("blueprintId").notNull(),
  phase: int("phase").notNull(), // Which value chain phase (1-7)
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
  level4Decision: mysqlEnum("level4Decision", ["go", "hold", "recycle", "kill"]),
  level4CompletedAt: timestamp("level4CompletedAt"),
  level4Rationale: text("level4Rationale"),
  gatekeeper: varchar("gatekeeper", { length: 100 }).default("Chief of Staff"),
  status: mysqlEnum("status", ["not_started", "in_progress", "passed", "failed"]).default("not_started").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type QualityGate = typeof qualityGates.$inferSelect;
export type InsertQualityGate = typeof qualityGates.$inferInsert;

/**
 * Process Playbooks - Templates for each phase's processes
 */
export const processPlaybooks = mysqlTable("process_playbooks", {
  id: int("id").autoincrement().primaryKey(),
  phase: int("phase").notNull(), // Which value chain phase (1-7)
  processNumber: varchar("processNumber", { length: 20 }).notNull(), // e.g., "1.1", "2.2"
  name: varchar("name", { length: 200 }).notNull(),
  objective: text("objective"),
  activities: json("activities"), // Array of activity objects
  manusDelegation: json("manusDelegation"), // What Manus can do for each activity
  tools: json("tools"), // Tools used in this process
  expertPanels: json("expertPanels"), // Which panels are involved
  qualityGateCriteria: json("qualityGateCriteria"), // Criteria for passing quality gate
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ProcessPlaybook = typeof processPlaybooks.$inferSelect;
export type InsertProcessPlaybook = typeof processPlaybooks.$inferInsert;

/**
 * Pre-Mortem Sessions - Proactive failure analysis
 */
export const preMortemSessions = mysqlTable("pre_mortem_sessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  blueprintId: int("blueprintId"),
  projectId: int("projectId"),
  sessionType: mysqlEnum("sessionType", [
    "concept_pre_mortem",
    "business_case_pre_mortem",
    "launch_pre_mortem",
    "churn_pre_mortem",
    "buyer_objection_pre_mortem"
  ]).notNull(),
  scenario: text("scenario"), // "Assume the project has failed..."
  failureReasons: json("failureReasons"), // Array of identified failure reasons
  criticalAssumptions: json("criticalAssumptions"), // Assumptions that must be tested
  mitigationStrategies: json("mitigationStrategies"), // How to address each risk
  panelId: int("panelId"), // Which SME panel conducted this
  status: mysqlEnum("status", ["scheduled", "in_progress", "completed"]).default("scheduled").notNull(),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PreMortemSession = typeof preMortemSessions.$inferSelect;
export type InsertPreMortemSession = typeof preMortemSessions.$inferInsert;

/**
 * Lessons Learned - Post-project insights repository
 */
export const lessonsLearned = mysqlTable("lessons_learned", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  projectId: int("projectId"),
  blueprintId: int("blueprintId"),
  phase: int("phase"), // Which phase this lesson applies to
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
  impact: mysqlEnum("impact", ["low", "medium", "high"]).default("medium"),
  actionTaken: text("actionTaken"),
  tags: json("tags"), // Array of tags for searchability
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type LessonLearned = typeof lessonsLearned.$inferSelect;
export type InsertLessonLearned = typeof lessonsLearned.$inferInsert;

/**
 * Tool Integrations - Connected external tools and their status
 */
export const toolIntegrations = mysqlTable("tool_integrations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
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
  status: mysqlEnum("status", ["active", "inactive", "pending", "error"]).default("pending").notNull(),
  apiKeyConfigured: boolean("apiKeyConfigured").default(false),
  lastSyncAt: timestamp("lastSyncAt"),
  healthScore: int("healthScore").default(100), // 0-100
  alertMessage: text("alertMessage"),
  valueChainPhases: json("valueChainPhases"), // Which phases this tool is used in
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ToolIntegration = typeof toolIntegrations.$inferSelect;
export type InsertToolIntegration = typeof toolIntegrations.$inferInsert;

/**
 * Manus Delegation Log - Track what Manus does autonomously
 */
export const manusDelegationLog = mysqlTable("manus_delegation_log", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  blueprintId: int("blueprintId"),
  projectId: int("projectId"),
  phase: int("phase"),
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
  input: json("input"), // What was provided to Manus
  output: json("output"), // What Manus produced
  status: mysqlEnum("status", ["pending", "in_progress", "completed", "failed"]).default("pending").notNull(),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ManusDelegationLog = typeof manusDelegationLog.$inferSelect;
export type InsertManusDelegationLog = typeof manusDelegationLog.$inferInsert;

/**
 * Expert Panel Assignments - Which experts are assigned to which panel type
 */
export const expertPanelAssignments = mysqlTable("expert_panel_assignments", {
  id: int("id").autoincrement().primaryKey(),
  expertId: varchar("expertId", { length: 100 }).notNull(),
  panelTypeCode: mysqlEnum("panelTypeCode", ["blue_team", "left_field", "red_team"]).notNull(),
  expertCategory: varchar("expertCategory", { length: 100 }), // e.g., "Strategy", "Finance", "Legal"
  strengthAreas: json("strengthAreas"), // What this expert is good at for this panel type
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
export const eveningReviewSessions = mysqlTable("evening_review_sessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  reviewDate: timestamp("reviewDate").notNull(),
  startedAt: timestamp("startedAt").notNull(),
  completedAt: timestamp("completedAt"),
  mode: mysqlEnum("mode", ["manual", "auto_processed", "delegated"]).default("manual").notNull(),
  tasksAccepted: int("tasksAccepted").default(0).notNull(),
  tasksDeferred: int("tasksDeferred").default(0).notNull(),
  tasksRejected: int("tasksRejected").default(0).notNull(),
  moodScore: int("moodScore"), // 1-10
  wentWellNotes: text("wentWellNotes"),
  didntGoWellNotes: text("didntGoWellNotes"),
  signalItemsGenerated: int("signalItemsGenerated").default(0),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EveningReviewSession = typeof eveningReviewSessions.$inferSelect;
export type InsertEveningReviewSession = typeof eveningReviewSessions.$inferInsert;

/**
 * Evening Review Task Decisions - Individual task decisions from reviews
 */
export const eveningReviewTaskDecisions = mysqlTable("evening_review_task_decisions", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: int("sessionId").notNull(),
  taskId: int("taskId"), // Link to tasks table if applicable
  taskTitle: varchar("taskTitle", { length: 500 }).notNull(),
  projectName: varchar("projectName", { length: 200 }),
  decision: mysqlEnum("decision", ["accepted", "deferred", "rejected"]).notNull(),
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
export const reviewTimingPatterns = mysqlTable("review_timing_patterns", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  dayOfWeek: int("dayOfWeek").notNull(), // 0-6 (Sunday-Saturday)
  averageStartTime: varchar("averageStartTime", { length: 10 }), // HH:MM format
  averageDuration: int("averageDuration"), // minutes
  completionRate: float("completionRate").default(0), // 0-1
  autoProcessRate: float("autoProcessRate").default(0), // 0-1
  sampleCount: int("sampleCount").default(0).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ReviewTimingPattern = typeof reviewTimingPatterns.$inferSelect;
export type InsertReviewTimingPattern = typeof reviewTimingPatterns.$inferInsert;

/**
 * Signal Items - Items prepared for the morning Signal briefing
 */
export const signalItems = mysqlTable("signal_items", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  sourceType: mysqlEnum("sourceType", ["evening_review", "overnight_task", "calendar", "news", "project_update", "manual"]).notNull(),
  sourceId: int("sourceId"), // ID of source record
  category: mysqlEnum("category", ["task_summary", "project_update", "calendar_alert", "intelligence", "recommendation", "reflection"]).notNull(),
  title: varchar("title", { length: 300 }).notNull(),
  description: text("description"),
  priority: mysqlEnum("priority", ["low", "medium", "high", "critical"]).default("medium").notNull(),
  targetDate: timestamp("targetDate").notNull(), // Which morning this is for
  status: mysqlEnum("status", ["pending", "delivered", "actioned", "dismissed"]).default("pending").notNull(),
  deliveredAt: timestamp("deliveredAt"),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SignalItem = typeof signalItems.$inferSelect;
export type InsertSignalItem = typeof signalItems.$inferInsert;

/**
 * Calendar Events Cache - Cached calendar events for smart prompting
 */
export const calendarEventsCache = mysqlTable("calendar_events_cache", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  externalId: varchar("externalId", { length: 200 }), // ID from external calendar
  title: varchar("title", { length: 500 }).notNull(),
  startTime: timestamp("startTime").notNull(),
  endTime: timestamp("endTime").notNull(),
  isAllDay: boolean("isAllDay").default(false).notNull(),
  location: varchar("location", { length: 500 }),
  attendees: json("attendees"),
  source: varchar("source", { length: 50 }), // "google", "outlook", "manual"
  metadata: json("metadata"),
  syncedAt: timestamp("syncedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CalendarEventCache = typeof calendarEventsCache.$inferSelect;
export type InsertCalendarEventCache = typeof calendarEventsCache.$inferInsert;


/**
 * Innovation Ideas - Captured ideas for strategic assessment
 */
export const innovationIdeas = mysqlTable("innovation_ideas", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 300 }).notNull(),
  description: text("description"),
  source: mysqlEnum("source", ["manual", "article", "trend", "conversation", "chief_of_staff", "sme_suggestion"]).default("manual").notNull(),
  sourceUrl: text("sourceUrl"), // URL if from article
  sourceMetadata: json("sourceMetadata"), // Additional source context
  status: mysqlEnum("status", ["captured", "assessing", "refining", "validated", "rejected", "archived", "promoted_to_genesis"]).default("captured").notNull(),
  currentStage: int("currentStage").default(1).notNull(), // 1-5 flywheel stage
  priority: mysqlEnum("priority", ["low", "medium", "high", "critical"]).default("medium").notNull(),
  category: varchar("category", { length: 100 }), // "business", "product", "investment", "trend", etc.
  tags: json("tags"), // Array of tags
  estimatedInvestment: json("estimatedInvestment"), // { min: number, max: number, currency: string }
  estimatedReturn: json("estimatedReturn"), // { min: number, max: number, timeframe: string }
  confidenceScore: float("confidenceScore"), // 0-100 overall confidence
  briefDocument: text("briefDocument"), // Generated brief summary
  promotedToProjectId: int("promotedToProjectId"), // If promoted to Project Genesis
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type InnovationIdea = typeof innovationIdeas.$inferSelect;
export type InsertInnovationIdea = typeof innovationIdeas.$inferInsert;

/**
 * Idea Assessments - Strategic framework evaluations
 */
export const ideaAssessments = mysqlTable("idea_assessments", {
  id: int("id").autoincrement().primaryKey(),
  ideaId: int("ideaId").notNull(),
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
  stage: int("stage").notNull(), // Which flywheel stage (1-5)
  assessorType: mysqlEnum("assessorType", ["chief_of_staff", "sme_expert", "framework", "user"]).default("framework").notNull(),
  assessorId: varchar("assessorId", { length: 100 }), // SME expert ID if applicable
  questions: json("questions"), // Array of { question: string, answer: string, score: number }
  findings: text("findings"),
  score: float("score"), // 0-100 score for this assessment
  recommendation: mysqlEnum("recommendation", ["proceed", "refine", "pivot", "reject", "needs_more_info"]).default("needs_more_info").notNull(),
  refinementSuggestions: json("refinementSuggestions"), // Array of suggestions
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type IdeaAssessment = typeof ideaAssessments.$inferSelect;
export type InsertIdeaAssessment = typeof ideaAssessments.$inferInsert;

/**
 * Idea Refinements - Flywheel iteration history
 */
export const ideaRefinements = mysqlTable("idea_refinements", {
  id: int("id").autoincrement().primaryKey(),
  ideaId: int("ideaId").notNull(),
  fromStage: int("fromStage").notNull(),
  toStage: int("toStage").notNull(),
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
  previousState: json("previousState"), // Snapshot of idea before refinement
  changes: json("changes"), // What changed
  rationale: text("rationale"), // Why this refinement was made
  triggeredBy: mysqlEnum("triggeredBy", ["assessment", "sme_feedback", "user_input", "chief_of_staff"]).default("assessment").notNull(),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type IdeaRefinement = typeof ideaRefinements.$inferSelect;
export type InsertIdeaRefinement = typeof ideaRefinements.$inferInsert;

/**
 * Investment Scenarios - Budget-based analysis for ideas
 */
export const investmentScenarios = mysqlTable("investment_scenarios", {
  id: int("id").autoincrement().primaryKey(),
  ideaId: int("ideaId").notNull(),
  scenarioName: varchar("scenarioName", { length: 100 }).notNull(), // "Bootstrap", "Seed", "Growth"
  investmentAmount: float("investmentAmount").notNull(),
  currency: varchar("currency", { length: 10 }).default("GBP").notNull(),
  breakdown: json("breakdown"), // { website: number, marketing: number, operations: number, etc. }
  projectedRevenue: json("projectedRevenue"), // { month3: number, month6: number, year1: number }
  projectedProfit: json("projectedProfit"),
  timeToBreakeven: int("timeToBreakeven"), // Months
  riskLevel: mysqlEnum("riskLevel", ["low", "medium", "high", "very_high"]).default("medium").notNull(),
  keyAssumptions: json("keyAssumptions"), // Array of assumptions
  recommendations: text("recommendations"),
  isRecommended: boolean("isRecommended").default(false).notNull(),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type InvestmentScenario = typeof investmentScenarios.$inferSelect;
export type InsertInvestmentScenario = typeof investmentScenarios.$inferInsert;

/**
 * Trend Repository - Tracked trends for Chief of Staff deep dives
 */
export const trendRepository = mysqlTable("trend_repository", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 300 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }), // "technology", "market", "consumer", "regulatory", etc.
  source: varchar("source", { length: 200 }),
  sourceUrl: text("sourceUrl"),
  trendStrength: mysqlEnum("trendStrength", ["emerging", "growing", "mainstream", "declining"]).default("emerging").notNull(),
  relevanceScore: float("relevanceScore"), // 0-100 how relevant to user's interests
  potentialImpact: mysqlEnum("potentialImpact", ["low", "medium", "high", "transformative"]).default("medium").notNull(),
  timeHorizon: varchar("timeHorizon", { length: 50 }), // "3 months", "1 year", "3-5 years"
  relatedIndustries: json("relatedIndustries"), // Array of industries
  keyInsights: json("keyInsights"), // Array of insights
  linkedIdeaIds: json("linkedIdeaIds"), // Ideas generated from this trend
  lastAnalyzedAt: timestamp("lastAnalyzedAt"),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TrendRepository = typeof trendRepository.$inferSelect;
export type InsertTrendRepository = typeof trendRepository.$inferInsert;


/**
 * Generated Documents - Document Library for all CEPHO outputs
 */
export const generatedDocuments = mysqlTable("generated_documents", {
  id: int("id").autoincrement().primaryKey(),
  documentId: varchar("documentId", { length: 100 }).notNull().unique(), // DOC-{timestamp}-{random}
  userId: int("userId").notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  type: mysqlEnum("type", ["innovation_brief", "project_genesis", "report", "other"]).notNull(),
  content: text("content"), // JSON stringified content
  classification: mysqlEnum("classification", ["public", "internal", "confidential", "restricted"]).default("internal").notNull(),
  qaStatus: mysqlEnum("qaStatus", ["pending", "approved", "rejected"]).default("pending").notNull(),
  qaApprover: varchar("qaApprover", { length: 200 }),
  qaApprovedAt: timestamp("qaApprovedAt"),
  qaNotes: text("qaNotes"),
  markdownUrl: text("markdownUrl"), // S3 URL to markdown version
  htmlUrl: text("htmlUrl"), // S3 URL to HTML version
  pdfUrl: text("pdfUrl"), // S3 URL to PDF version
  relatedIdeaId: int("relatedIdeaId"), // Link to innovation idea
  relatedProjectId: int("relatedProjectId"), // Link to project genesis
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type GeneratedDocument = typeof generatedDocuments.$inferSelect;
export type InsertGeneratedDocument = typeof generatedDocuments.$inferInsert;


/**
 * Funding Programs - Government funding programs database (UAE & UK)
 */
export const fundingPrograms = mysqlTable("funding_programs", {
  id: int("id").autoincrement().primaryKey(),
  programId: varchar("programId", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 300 }).notNull(),
  country: mysqlEnum("country", ["UAE", "UK", "EU", "US", "Other"]).notNull(),
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
  fundingMin: float("fundingMin"), // Minimum funding amount in AED
  fundingMax: float("fundingMax"), // Maximum funding amount in AED
  equityRequired: float("equityRequired"), // Percentage if applicable
  interestRate: float("interestRate"), // For loans
  repaymentTerms: text("repaymentTerms"),
  eligibilityCriteria: json("eligibilityCriteria"), // Array of criteria
  requiredDocuments: json("requiredDocuments"), // Array of required documents
  applicationProcess: json("applicationProcess"), // Steps to apply
  deadlines: json("deadlines"), // Application deadlines
  sectors: json("sectors"), // Eligible sectors
  stages: json("stages"), // Eligible business stages (pre-seed, seed, etc.)
  websiteUrl: text("websiteUrl"),
  applicationUrl: text("applicationUrl"),
  contactEmail: varchar("contactEmail", { length: 320 }),
  successRate: float("successRate"), // Historical success rate percentage
  averageProcessingDays: int("averageProcessingDays"),
  isActive: boolean("isActive").default(true).notNull(),
  lastUpdated: timestamp("lastUpdated"),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FundingProgram = typeof fundingPrograms.$inferSelect;
export type InsertFundingProgram = typeof fundingPrograms.$inferInsert;

/**
 * Funding Assessments - Idea eligibility assessments for funding programs
 */
export const fundingAssessments = mysqlTable("funding_assessments", {
  id: int("id").autoincrement().primaryKey(),
  assessmentId: varchar("assessmentId", { length: 100 }).notNull().unique(),
  userId: int("userId").notNull(),
  ideaId: int("ideaId").notNull(), // Link to innovation idea
  programId: varchar("programId", { length: 100 }).notNull(), // Link to funding program
  eligibilityScore: float("eligibilityScore"), // 0-100 score
  eligibilityStatus: mysqlEnum("eligibilityStatus", [
    "highly_eligible",
    "eligible",
    "partially_eligible",
    "not_eligible",
    "needs_review"
  ]).default("needs_review").notNull(),
  criteriaResults: json("criteriaResults"), // Detailed results per criterion
  strengths: json("strengths"), // Array of strengths for this program
  gaps: json("gaps"), // Array of gaps/missing requirements
  recommendations: json("recommendations"), // How to improve eligibility
  estimatedFunding: float("estimatedFunding"), // Estimated funding amount in AED
  applicationReadiness: float("applicationReadiness"), // 0-100 how ready to apply
  generatedDocuments: json("generatedDocuments"), // Auto-generated application materials
  notes: text("notes"),
  assessedAt: timestamp("assessedAt").defaultNow().notNull(),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FundingAssessment = typeof fundingAssessments.$inferSelect;
export type InsertFundingAssessment = typeof fundingAssessments.$inferInsert;


// ==================== REVENUE INFRASTRUCTURE ====================

/**
 * Revenue streams - tracks all sources of income across ventures
 */
export const revenueStreams = mysqlTable("revenue_streams", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
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
  status: mysqlEnum("status", ["active", "paused", "planned", "discontinued"]).default("planned").notNull(),
  currency: varchar("currency", { length: 10 }).default("AED").notNull(),
  monthlyRecurring: float("monthlyRecurring").default(0), // MRR for recurring streams
  annualRecurring: float("annualRecurring").default(0), // ARR
  averageTransactionValue: float("averageTransactionValue").default(0),
  transactionsPerMonth: int("transactionsPerMonth").default(0),
  marginPercentage: float("marginPercentage").default(0), // Gross margin %
  paymentProcessor: varchar("paymentProcessor", { length: 100 }), // "Stripe", "PayPal", "Bank Transfer"
  processorConnected: boolean("processorConnected").default(false),
  pricingModel: text("pricingModel"), // Description of pricing structure
  targetCustomerSegment: varchar("targetCustomerSegment", { length: 200 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type RevenueStream = typeof revenueStreams.$inferSelect;
export type InsertRevenueStream = typeof revenueStreams.$inferInsert;

/**
 * Revenue transactions - individual revenue events
 */
export const revenueTransactions = mysqlTable("revenue_transactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  streamId: int("streamId").notNull(), // FK to revenueStreams
  transactionDate: timestamp("transactionDate").notNull(),
  amount: float("amount").notNull(),
  currency: varchar("currency", { length: 10 }).default("AED").notNull(),
  status: mysqlEnum("status", ["pending", "completed", "failed", "refunded"]).default("pending").notNull(),
  customerName: varchar("customerName", { length: 200 }),
  customerEmail: varchar("customerEmail", { length: 320 }),
  description: text("description"),
  invoiceNumber: varchar("invoiceNumber", { length: 100 }),
  paymentMethod: varchar("paymentMethod", { length: 100 }),
  processorTransactionId: varchar("processorTransactionId", { length: 200 }), // External reference
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type RevenueTransaction = typeof revenueTransactions.$inferSelect;
export type InsertRevenueTransaction = typeof revenueTransactions.$inferInsert;

/**
 * Pipeline opportunities - potential revenue being tracked
 */
export const pipelineOpportunities = mysqlTable("pipeline_opportunities", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
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
  probability: int("probability").default(10), // 0-100%
  estimatedValue: float("estimatedValue").notNull(),
  currency: varchar("currency", { length: 10 }).default("AED").notNull(),
  expectedCloseDate: timestamp("expectedCloseDate"),
  actualCloseDate: timestamp("actualCloseDate"),
  lostReason: text("lostReason"),
  nextAction: text("nextAction"),
  nextActionDate: timestamp("nextActionDate"),
  assignedTo: varchar("assignedTo", { length: 200 }),
  source: varchar("source", { length: 200 }), // How the lead was generated
  notes: text("notes"),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PipelineOpportunity = typeof pipelineOpportunities.$inferSelect;
export type InsertPipelineOpportunity = typeof pipelineOpportunities.$inferInsert;

/**
 * Pricing tiers - product/service pricing structures
 */
export const pricingTiers = mysqlTable("pricing_tiers", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  streamId: int("streamId").notNull(), // FK to revenueStreams
  tierName: varchar("tierName", { length: 100 }).notNull(), // e.g., "Starter", "Pro", "Enterprise"
  price: float("price").notNull(),
  currency: varchar("currency", { length: 10 }).default("AED").notNull(),
  billingPeriod: mysqlEnum("billingPeriod", ["one_time", "monthly", "quarterly", "annual"]).notNull(),
  features: json("features"), // Array of features included
  limitations: json("limitations"), // Usage limits, etc.
  isActive: boolean("isActive").default(true).notNull(),
  displayOrder: int("displayOrder").default(0),
  stripePriceId: varchar("stripePriceId", { length: 200 }), // For Stripe integration
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PricingTier = typeof pricingTiers.$inferSelect;
export type InsertPricingTier = typeof pricingTiers.$inferInsert;

/**
 * Customer accounts - track customers across ventures
 */
export const customerAccounts = mysqlTable("customer_accounts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  ventureName: varchar("ventureName", { length: 200 }).notNull(),
  customerName: varchar("customerName", { length: 200 }).notNull(),
  customerType: mysqlEnum("customerType", ["individual", "business", "enterprise"]).default("individual").notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 50 }),
  company: varchar("company", { length: 200 }),
  industry: varchar("industry", { length: 100 }),
  country: varchar("country", { length: 100 }),
  city: varchar("city", { length: 100 }),
  status: mysqlEnum("status", ["prospect", "active", "churned", "paused"]).default("prospect").notNull(),
  lifetimeValue: float("lifetimeValue").default(0),
  currency: varchar("currency", { length: 10 }).default("AED").notNull(),
  acquisitionSource: varchar("acquisitionSource", { length: 200 }),
  acquisitionDate: timestamp("acquisitionDate"),
  churnDate: timestamp("churnDate"),
  churnReason: text("churnReason"),
  stripeCustomerId: varchar("stripeCustomerId", { length: 200 }),
  notes: text("notes"),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CustomerAccount = typeof customerAccounts.$inferSelect;
export type InsertCustomerAccount = typeof customerAccounts.$inferInsert;

/**
 * Revenue forecasts - projected revenue by period
 */
export const revenueForecasts = mysqlTable("revenue_forecasts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  ventureName: varchar("ventureName", { length: 200 }),
  streamId: int("streamId"), // Optional FK to specific stream
  forecastPeriod: varchar("forecastPeriod", { length: 20 }).notNull(), // "2026-Q1", "2026-02"
  periodType: mysqlEnum("periodType", ["monthly", "quarterly", "annual"]).notNull(),
  projectedRevenue: float("projectedRevenue").notNull(),
  actualRevenue: float("actualRevenue"),
  currency: varchar("currency", { length: 10 }).default("AED").notNull(),
  assumptions: text("assumptions"), // What the forecast is based on
  confidence: mysqlEnum("confidence", ["low", "medium", "high"]).default("medium"),
  variance: float("variance"), // Calculated difference actual vs projected
  variancePercentage: float("variancePercentage"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type RevenueForecast = typeof revenueForecasts.$inferSelect;
export type InsertRevenueForecast = typeof revenueForecasts.$inferInsert;

/**
 * Revenue metrics snapshots - periodic KPI tracking
 */
export const revenueMetricsSnapshots = mysqlTable("revenue_metrics_snapshots", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  snapshotDate: timestamp("snapshotDate").notNull(),
  totalMRR: float("totalMRR").default(0),
  totalARR: float("totalARR").default(0),
  totalRevenueMTD: float("totalRevenueMTD").default(0),
  totalRevenueYTD: float("totalRevenueYTD").default(0),
  pipelineValue: float("pipelineValue").default(0),
  weightedPipelineValue: float("weightedPipelineValue").default(0),
  activeCustomers: int("activeCustomers").default(0),
  newCustomersMTD: int("newCustomersMTD").default(0),
  churnedCustomersMTD: int("churnedCustomersMTD").default(0),
  averageRevenuePerCustomer: float("averageRevenuePerCustomer").default(0),
  currency: varchar("currency", { length: 10 }).default("AED").notNull(),
  ventureBreakdown: json("ventureBreakdown"), // Revenue by venture
  streamBreakdown: json("streamBreakdown"), // Revenue by stream type
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type RevenueMetricsSnapshot = typeof revenueMetricsSnapshots.$inferSelect;
export type InsertRevenueMetricsSnapshot = typeof revenueMetricsSnapshots.$inferInsert;
