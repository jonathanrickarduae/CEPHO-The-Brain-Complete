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
 * Subscriptions - SaaS subscription tracking
 */
export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 200 }).notNull(), // "Asana", "Slack", "Zoom", etc.
  category: varchar("category", { length: 100 }), // "productivity", "communication", "storage", etc.
  cost: float("cost"), // Monthly cost in USD
  billingCycle: mysqlEnum("billingCycle", ["monthly", "annual", "one_time"]).default("monthly"),
  renewalDate: timestamp("renewalDate"),
  status: mysqlEnum("status", ["active", "cancelled", "paused", "trial"]).default("active"),
  usagePercent: int("usagePercent"), // 0-100, how much of the subscription is used
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
 * Tasks - granular task tracking within projects
 */
export const tasks = mysqlTable("tasks", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  projectId: int("projectId"),
  parentTaskId: int("parentTaskId"), // For subtasks
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  status: mysqlEnum("status", [
    "not_started", "in_progress", "blocked", 
    "review", "completed", "cancelled"
  ]).default("not_started").notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high", "critical"]).default("medium"),
  dueDate: timestamp("dueDate"),
  estimatedHours: float("estimatedHours"),
  actualHours: float("actualHours"),
  assignedTo: varchar("assignedTo", { length: 100 }), // "digital_twin", expert ID, or "user"
  dependencies: json("dependencies"), // Array of task IDs this depends on
  blockerDescription: text("blockerDescription"),
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
// DIGITAL TWIN CORE - Profile Vault & Learning Engine
// ============================================

/**
 * Digital Twin Profile - Core identity and personality model
 * This is the central vault storing who you are
 */
export const digitalTwinProfile = mysqlTable("digital_twin_profile", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  
  // Core Identity
  communicationStyle: mysqlEnum("communicationStyle", ["direct", "diplomatic", "analytical", "collaborative"]).default("direct"),
  decisionSpeed: mysqlEnum("decisionSpeed", ["fast", "measured", "deliberate"]).default("measured"),
  riskTolerance: mysqlEnum("riskTolerance", ["conservative", "moderate", "aggressive"]).default("moderate"),
  
  // Work Preferences
  preferredWorkHours: varchar("preferredWorkHours", { length: 50 }), // e.g., "6am-2pm"
  focusAreas: json("focusAreas"), // Array of priority areas
  delegationStyle: mysqlEnum("delegationStyle", ["hands-on", "trust-verify", "full-autonomy"]).default("trust-verify"),
  
  // Personality Traits (1-10 scale stored as JSON)
  personalityTraits: json("personalityTraits"), // { analytical: 8, creative: 6, detail_oriented: 7, ... }
  
  // Values & Priorities
  coreValues: json("coreValues"), // Array of key values
  priorities: json("priorities"), // Ranked list of what matters most
  
  // Thinking Frameworks
  thinkingFrameworks: json("thinkingFrameworks"), // Preferred mental models
  
  // Profile Completeness
  profileCompleteness: int("profileCompleteness").default(0), // 0-100%
  lastProfileUpdate: timestamp("lastProfileUpdate").defaultNow(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DigitalTwinProfile = typeof digitalTwinProfile.$inferSelect;
export type InsertDigitalTwinProfile = typeof digitalTwinProfile.$inferInsert;

/**
 * Digital Twin Decision Patterns - Deep patterns of how you make decisions
 * Learned from observing your choices over time
 */
export const dtDecisionPatterns = mysqlTable("dt_decision_patterns", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Pattern Classification
  category: mysqlEnum("category", [
    "strategic", "financial", "operational", "people", "risk", "creative", "technical"
  ]).notNull(),
  
  // The Pattern
  patternName: varchar("patternName", { length: 200 }).notNull(),
  patternDescription: text("patternDescription"),
  
  // When this pattern applies
  triggerConditions: json("triggerConditions"), // What situations trigger this pattern
  
  // The typical decision/response
  typicalResponse: text("typicalResponse"),
  
  // Confidence and frequency
  confidence: int("confidence").default(50), // 0-100 how confident we are in this pattern
  occurrences: int("occurrences").default(1), // How many times observed
  
  // Learning metadata
  learnedFrom: json("learnedFrom"), // Array of conversation/interaction IDs
  lastObserved: timestamp("lastObserved").defaultNow(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DTDecisionPattern = typeof dtDecisionPatterns.$inferSelect;
export type InsertDTDecisionPattern = typeof dtDecisionPatterns.$inferInsert;

/**
 * Communication Preferences - How you like to communicate
 */
export const communicationPreferences = mysqlTable("communication_preferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Preference Type
  preferenceType: mysqlEnum("preferenceType", [
    "tone", "length", "format", "timing", "channel", "frequency"
  ]).notNull(),
  
  // Context where this applies
  context: varchar("context", { length: 100 }), // e.g., "daily_brief", "urgent", "reports"
  
  // The preference
  preference: varchar("preference", { length: 200 }).notNull(),
  preferenceDetails: text("preferenceDetails"),
  
  // Examples
  examples: json("examples"), // Array of example phrases/formats you've used
  
  // Confidence
  confidence: int("confidence").default(50),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CommunicationPreference = typeof communicationPreferences.$inferSelect;
export type InsertCommunicationPreference = typeof communicationPreferences.$inferInsert;

/**
 * Learning Events - Every interaction that teaches the Digital Twin
 */
export const learningEvents = mysqlTable("learning_events", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Event Type
  eventType: mysqlEnum("eventType", [
    "conversation", "decision", "feedback", "correction", "preference", "behaviour"
  ]).notNull(),
  
  // Source
  source: varchar("source", { length: 100 }).notNull(), // e.g., "chief_of_staff", "project_genesis", "sme_chat"
  sourceId: varchar("sourceId", { length: 100 }), // Reference to the source record
  
  // What was learned
  learningType: mysqlEnum("learningType", [
    "pattern_new", "pattern_reinforced", "pattern_contradicted", 
    "preference_discovered", "value_expressed", "style_observed"
  ]).notNull(),
  
  // The learning content
  content: text("content").notNull(),
  extractedInsights: json("extractedInsights"), // Structured insights extracted
  
  // Impact
  impactedPatterns: json("impactedPatterns"), // Array of pattern IDs affected
  impactedPreferences: json("impactedPreferences"), // Array of preference IDs affected
  
  // Processing status
  isProcessed: boolean("isProcessed").default(false),
  processedAt: timestamp("processedAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type LearningEvent = typeof learningEvents.$inferSelect;
export type InsertLearningEvent = typeof learningEvents.$inferInsert;

/**
 * Autonomy Levels - Track progression toward autonomous operation
 */
export const autonomyLevels = mysqlTable("autonomy_levels", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Domain
  domain: varchar("domain", { length: 100 }).notNull(), // e.g., "email_drafting", "scheduling", "research"
  
  // Current Level (1-5)
  // 1: Always ask, 2: Ask for important, 3: Do and report, 4: Do silently, 5: Full autonomy
  currentLevel: int("currentLevel").default(1).notNull(),
  targetLevel: int("targetLevel").default(3),
  
  // Trust metrics
  successfulActions: int("successfulActions").default(0),
  correctedActions: int("correctedActions").default(0),
  trustScore: int("trustScore").default(0), // 0-100
  
  // Progression
  levelHistory: json("levelHistory"), // Array of { level, date, reason }
  lastLevelChange: timestamp("lastLevelChange"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AutonomyLevel = typeof autonomyLevels.$inferSelect;
export type InsertAutonomyLevel = typeof autonomyLevels.$inferInsert;

/**
 * Profile Questions - Structured onboarding questions for initial profile capture
 */
export const profileQuestions = mysqlTable("profile_questions", {
  id: int("id").autoincrement().primaryKey(),
  
  // Question details
  category: mysqlEnum("category", [
    "identity", "work_style", "communication", "decision_making", "values", "preferences"
  ]).notNull(),
  
  question: text("question").notNull(),
  questionType: mysqlEnum("questionType", ["choice", "scale", "text", "voice"]).notNull(),
  options: json("options"), // For choice questions
  
  // Mapping
  profileField: varchar("profileField", { length: 100 }), // Which profile field this updates
  patternCategory: varchar("patternCategory", { length: 100 }), // Which pattern category this informs
  
  // Ordering
  displayOrder: int("displayOrder").default(0),
  isRequired: boolean("isRequired").default(false),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ProfileQuestion = typeof profileQuestions.$inferSelect;
export type InsertProfileQuestion = typeof profileQuestions.$inferInsert;

/**
 * Profile Answers - User responses to profile questions
 */
export const profileAnswers = mysqlTable("profile_answers", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  questionId: int("questionId").notNull(),
  
  // The answer
  answer: text("answer").notNull(),
  answerMetadata: json("answerMetadata"), // Additional context
  
  // Processing
  isProcessed: boolean("isProcessed").default(false),
  extractedPatterns: json("extractedPatterns"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ProfileAnswer = typeof profileAnswers.$inferSelect;
export type InsertProfileAnswer = typeof profileAnswers.$inferInsert;


// ============================================================================
// INVESTOR DATABASE & CAPITAL MATCHING
// ============================================================================

/**
 * Investors - Database of potential investors (angels, HNWIs, VCs, etc.)
 */
export const investors = mysqlTable("investors", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // Owner of this contact
  
  // Basic Info
  name: varchar("name", { length: 200 }).notNull(),
  type: mysqlEnum("type", [
    "angel", "hnwi", "family_office", "vc", "pe", "bank", "government", "strategic"
  ]).notNull(),
  organization: varchar("organization", { length: 200 }),
  
  // Investment Parameters
  ticketSizeMin: int("ticketSizeMin"),
  ticketSizeMax: int("ticketSizeMax"),
  currency: varchar("currency", { length: 3 }).default("GBP"),
  
  // Focus Areas
  sectors: json("sectors"),
  stages: json("stages"),
  geographies: json("geographies"),
  dealTypes: json("dealTypes"),
  
  // Contact Information
  email: varchar("email", { length: 200 }),
  phone: varchar("phone", { length: 50 }),
  linkedin: varchar("linkedin", { length: 300 }),
  website: varchar("website", { length: 300 }),
  
  // Relationship
  relationshipStatus: mysqlEnum("relationshipStatus", [
    "cold", "warm", "hot", "active", "invested", "passed"
  ]).default("cold"),
  introducedBy: varchar("introducedBy", { length: 200 }),
  lastContactDate: timestamp("lastContactDate"),
  
  // Notes & Tags
  notes: text("notes"),
  tags: json("tags"),
  
  // Metadata
  source: varchar("source", { length: 100 }),
  isVerified: boolean("isVerified").default(false),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type Investor = typeof investors.$inferSelect;
export type InsertInvestor = typeof investors.$inferInsert;

/**
 * Capital Raises - Track fundraising rounds
 */
export const capitalRaises = mysqlTable("capital_raises", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  projectId: int("projectId"),
  
  // Round Details
  name: varchar("name", { length: 200 }).notNull(),
  roundType: mysqlEnum("roundType", [
    "pre_seed", "seed", "series_a", "series_b", "series_c", "growth", 
    "bridge", "debt", "grant", "convertible"
  ]).notNull(),
  
  // Target
  targetAmount: int("targetAmount").notNull(),
  currency: varchar("currency", { length: 3 }).default("GBP"),
  minTicket: int("minTicket"),
  maxTicket: int("maxTicket"),
  
  // Valuation
  preMoneyValuation: int("preMoneyValuation"),
  equityOffered: int("equityOffered"),
  
  // Timeline
  targetCloseDate: timestamp("targetCloseDate"),
  actualCloseDate: timestamp("actualCloseDate"),
  
  // Status
  status: mysqlEnum("status", [
    "planning", "preparing", "active", "closing", "closed", "cancelled"
  ]).default("planning"),
  
  // Progress
  amountRaised: int("amountRaised").default(0),
  investorCount: int("investorCount").default(0),
  
  // Materials
  pitchDeckUrl: varchar("pitchDeckUrl", { length: 500 }),
  dataRoomUrl: varchar("dataRoomUrl", { length: 500 }),
  termSheetUrl: varchar("termSheetUrl", { length: 500 }),
  
  // Notes
  notes: text("notes"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type CapitalRaise = typeof capitalRaises.$inferSelect;
export type InsertCapitalRaise = typeof capitalRaises.$inferInsert;

/**
 * Investor Interactions - Track all touchpoints with investors
 */
export const investorInteractions = mysqlTable("investor_interactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  investorId: int("investorId").notNull(),
  capitalRaiseId: int("capitalRaiseId"),
  
  // Interaction Details
  interactionType: mysqlEnum("interactionType", [
    "intro_email", "intro_call", "pitch_meeting", "follow_up", 
    "due_diligence", "term_sheet", "negotiation", "closing", "rejection"
  ]).notNull(),
  
  interactionDate: timestamp("interactionDate").notNull(),
  
  // Content
  subject: varchar("subject", { length: 300 }),
  notes: text("notes"),
  outcome: mysqlEnum("outcome", [
    "positive", "neutral", "negative", "pending"
  ]).default("pending"),
  
  // Next Steps
  nextAction: varchar("nextAction", { length: 300 }),
  nextActionDate: timestamp("nextActionDate"),
  
  // Attachments
  attachments: json("attachments"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type InvestorInteraction = typeof investorInteractions.$inferSelect;
export type InsertInvestorInteraction = typeof investorInteractions.$inferInsert;

/**
 * Investor Commitments - Track soft and hard commitments
 */
export const investorCommitments = mysqlTable("investor_commitments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  investorId: int("investorId").notNull(),
  capitalRaiseId: int("capitalRaiseId").notNull(),
  
  // Commitment Details
  commitmentType: mysqlEnum("commitmentType", [
    "interest", "soft_commit", "hard_commit", "signed", "funded"
  ]).notNull(),
  
  amount: int("amount").notNull(),
  currency: varchar("currency", { length: 3 }).default("GBP"),
  
  // Terms
  terms: text("terms"),
  specialConditions: text("specialConditions"),
  
  // Status
  status: mysqlEnum("status", [
    "pending", "confirmed", "cancelled", "completed"
  ]).default("pending"),
  
  // Dates
  commitmentDate: timestamp("commitmentDate"),
  fundingDate: timestamp("fundingDate"),
  
  // Notes
  notes: text("notes"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type InvestorCommitment = typeof investorCommitments.$inferSelect;
export type InsertInvestorCommitment = typeof investorCommitments.$inferInsert;

// ============================================================================
// PROJECT GENESIS BLUEPRINTS
// ============================================================================

/**
 * Project Blueprints - Store project configurations and progress
 */
export const projectBlueprints = mysqlTable("project_blueprints", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  projectId: int("projectId"),
  
  // Blueprint Info
  blueprintType: varchar("blueprintType", { length: 50 }).notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  
  // Intake Responses
  intakeResponses: json("intakeResponses"),
  intakeCompletedAt: timestamp("intakeCompletedAt"),
  
  // Progress Tracking
  currentStepId: varchar("currentStepId", { length: 100 }),
  completedSteps: json("completedSteps"),
  
  // QA Gates
  passedGates: json("passedGates"),
  pendingGates: json("pendingGates"),
  
  // Deliverables
  deliverables: json("deliverables"),
  
  // Team Assignment
  assignedSMEs: json("assignedSMEs"),
  
  // Status
  status: mysqlEnum("status", [
    "intake", "in_progress", "review", "completed", "on_hold", "cancelled"
  ]).default("intake"),
  
  // Timeline
  startedAt: timestamp("startedAt"),
  targetCompletionDate: timestamp("targetCompletionDate"),
  completedAt: timestamp("completedAt"),
  
  // Notes
  notes: text("notes"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type ProjectBlueprintRecord = typeof projectBlueprints.$inferSelect;
export type InsertProjectBlueprintRecord = typeof projectBlueprints.$inferInsert;

/**
 * Blueprint Step Progress - Track individual step completion
 */
export const blueprintStepProgress = mysqlTable("blueprint_step_progress", {
  id: int("id").autoincrement().primaryKey(),
  blueprintId: int("blueprintId").notNull(),
  stepId: varchar("stepId", { length: 100 }).notNull(),
  
  // Status
  status: mysqlEnum("status", [
    "not_started", "in_progress", "review", "completed", "blocked"
  ]).default("not_started"),
  
  // Progress
  progressPercent: int("progressPercent").default(0),
  
  // Assigned SMEs
  assignedSMEs: json("assignedSMEs"),
  
  // Outputs
  outputs: json("outputs"),
  
  // QA
  qaStatus: mysqlEnum("qaStatus", [
    "pending", "in_review", "approved", "rejected"
  ]).default("pending"),
  qaFeedback: text("qaFeedback"),
  qaApprovedBy: varchar("qaApprovedBy", { length: 100 }),
  qaApprovedAt: timestamp("qaApprovedAt"),
  
  // Timing
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  
  // Notes
  notes: text("notes"),
  blockerReason: text("blockerReason"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type BlueprintStepProgress = typeof blueprintStepProgress.$inferSelect;
export type InsertBlueprintStepProgress = typeof blueprintStepProgress.$inferInsert;

/**
 * Triple AI Validation - Track AI validation results
 */
export const tripleAIValidation = mysqlTable("triple_ai_validation", {
  id: int("id").autoincrement().primaryKey(),
  blueprintId: int("blueprintId").notNull(),
  stepId: varchar("stepId", { length: 100 }),
  gateId: varchar("gateId", { length: 100 }),
  deliverableId: varchar("deliverableId", { length: 100 }),
  
  // Validation Type
  validationType: mysqlEnum("validationType", [
    "step_output", "qa_gate", "deliverable", "final_review"
  ]).notNull(),
  
  // AI Validators
  validator1: varchar("validator1", { length: 100 }).notNull(),
  validator1Result: mysqlEnum("validator1Result", ["pass", "fail", "conditional"]),
  validator1Feedback: text("validator1Feedback"),
  validator1Score: int("validator1Score"),
  
  validator2: varchar("validator2", { length: 100 }).notNull(),
  validator2Result: mysqlEnum("validator2Result", ["pass", "fail", "conditional"]),
  validator2Feedback: text("validator2Feedback"),
  validator2Score: int("validator2Score"),
  
  validator3: varchar("validator3", { length: 100 }).notNull(),
  validator3Result: mysqlEnum("validator3Result", ["pass", "fail", "conditional"]),
  validator3Feedback: text("validator3Feedback"),
  validator3Score: int("validator3Score"),
  
  // Overall Result
  overallResult: mysqlEnum("overallResult", ["pass", "fail", "conditional"]),
  consensusScore: int("consensusScore"),
  consolidatedFeedback: text("consolidatedFeedback"),
  
  // User Override
  userOverride: boolean("userOverride").default(false),
  userOverrideReason: text("userOverrideReason"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type TripleAIValidationRecord = typeof tripleAIValidation.$inferSelect;
export type InsertTripleAIValidationRecord = typeof tripleAIValidation.$inferInsert;

// ============================================================================
// ENHANCED VAULT SECURITY
// ============================================================================

/**
 * Vault Credentials - Encrypted storage for sensitive credentials
 */
export const vaultCredentials = mysqlTable("vault_credentials", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Credential Info
  name: varchar("name", { length: 200 }).notNull(),
  category: mysqlEnum("category", [
    "api_key", "oauth_token", "password", "certificate", "ssh_key", "other"
  ]).notNull(),
  
  // Encrypted Data (encrypted client-side before storage)
  encryptedData: text("encryptedData").notNull(),
  encryptionVersion: int("encryptionVersion").default(1),
  
  // Metadata (not encrypted)
  service: varchar("service", { length: 100 }),
  username: varchar("username", { length: 200 }),
  url: varchar("url", { length: 500 }),
  
  // Expiry
  expiresAt: timestamp("expiresAt"),
  rotationReminder: boolean("rotationReminder").default(false),
  lastRotated: timestamp("lastRotated"),
  
  // Access Control
  accessLevel: mysqlEnum("accessLevel", ["personal", "shared", "system"]).default("personal"),
  
  // Audit
  lastAccessedAt: timestamp("lastAccessedAt"),
  accessCount: int("accessCount").default(0),
  
  // Notes
  notes: text("notes"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type VaultCredential = typeof vaultCredentials.$inferSelect;
export type InsertVaultCredential = typeof vaultCredentials.$inferInsert;

/**
 * Registered Devices - Devices authorized to access vault with WebAuthn
 */
export const registeredDevices = mysqlTable("registered_devices", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Device Info
  deviceId: varchar("deviceId", { length: 100 }).notNull(),
  deviceName: varchar("deviceName", { length: 200 }).notNull(),
  deviceType: mysqlEnum("deviceType", ["desktop", "mobile", "tablet"]).notNull(),
  
  // Browser/OS
  browser: varchar("browser", { length: 100 }),
  os: varchar("os", { length: 100 }),
  
  // WebAuthn Credential (for biometric/passkey)
  webauthnCredentialId: text("webauthnCredentialId"),
  webauthnPublicKey: text("webauthnPublicKey"),
  
  // Status
  status: mysqlEnum("status", ["active", "suspended", "revoked"]).default("active"),
  
  // Trust
  isTrusted: boolean("isTrusted").default(false),
  trustExpiresAt: timestamp("trustExpiresAt"),
  
  // Last Activity
  lastUsedAt: timestamp("lastUsedAt"),
  lastIpAddress: varchar("lastIpAddress", { length: 50 }),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type RegisteredDevice = typeof registeredDevices.$inferSelect;
export type InsertRegisteredDevice = typeof registeredDevices.$inferInsert;

/**
 * Security Settings - User security preferences
 */
export const securitySettings = mysqlTable("security_settings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  
  // Authentication Methods Enabled
  passwordEnabled: boolean("passwordEnabled").default(true),
  biometricEnabled: boolean("biometricEnabled").default(false),
  hardwareKeyEnabled: boolean("hardwareKeyEnabled").default(false),
  totpEnabled: boolean("totpEnabled").default(false),
  
  // TOTP Secret (encrypted)
  totpSecret: text("totpSecret"),
  
  // Session Settings
  sessionTimeout: int("sessionTimeout").default(30), // Minutes
  vaultTimeout: int("vaultTimeout").default(5), // Minutes before vault locks
  
  // Security Preferences
  requireReauthForVault: boolean("requireReauthForVault").default(true),
  allowRememberDevice: boolean("allowRememberDevice").default(true),
  maxTrustedDevices: int("maxTrustedDevices").default(5),
  
  // Alerts
  alertOnNewDevice: boolean("alertOnNewDevice").default(true),
  alertOnFailedAttempts: boolean("alertOnFailedAttempts").default(true),
  failedAttemptThreshold: int("failedAttemptThreshold").default(3),
  
  // Emergency
  emergencyLockEnabled: boolean("emergencyLockEnabled").default(false),
  emergencyLockCode: varchar("emergencyLockCode", { length: 100 }),
  
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type SecuritySetting = typeof securitySettings.$inferSelect;
export type InsertSecuritySetting = typeof securitySettings.$inferInsert;
