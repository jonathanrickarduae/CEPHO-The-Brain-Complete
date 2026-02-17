import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json, boolean, float } from "drizzle-orm/mysql-core";

// PostgreSQL Enums
export const roleEnum = pgEnum("role", ['user', 'admin']);
export const themePreferenceEnum = pgEnum("themePreference", ['light', 'dark', 'system']);
export const timeOfDayEnum = pgEnum("timeOfDay", ['morning', 'afternoon', 'evening']);
export const roleEnum = pgEnum("role", ['user', 'twin']);
export const contentTypeEnum = pgEnum("contentType", ['text', 'voice', 'action']);
export const feedbackTypeEnum = pgEnum("feedbackType", ['positive', 'negative', 'neutral', 'correction']);
export const statusEnum = pgEnum("status", ['pending', 'completed', 'failed', 'cancelled']);
export const statusEnum = pgEnum("status", ['active', 'training', 'fired']);
export const statusEnum = pgEnum("status", ['not_started', 'in_progress', 'blocked', 'review', 'complete']);
export const priorityEnum = pgEnum("priority", ['low', 'medium', 'high', 'critical']);
export const categoryEnum = pgEnum("category", ['key_insight', 'meeting', 'task', 'intelligence', 'recommendation']);
export const priorityEnum = pgEnum("priority", ['low', 'medium', 'high', 'critical']);
export const statusEnum = pgEnum("status", ['pending', 'got_it', 'deferred', 'delegated', 'digital_twin']);
export const themeEnum = pgEnum("theme", ['light', 'dark', 'mix']);
export const governanceModeEnum = pgEnum("governanceMode", ['omni', 'governed']);
export const typeEnum = pgEnum("type", ['document', 'image', 'chart', 'presentation', 'data', 'other']);
export const statusEnum = pgEnum("status", ['draft', 'review', 'signed_off']);
export const roleEnum = pgEnum("role", ['user', 'assistant', 'system']);
export const statusEnum = pgEnum("status", ['waiting', 'invited', 'joined', 'churned']);
export const statusEnum = pgEnum("status", ['pending', 'signed_up', 'active', 'churned']);
export const typeEnum = pgEnum("type", ['referral', 'achievement', 'purchase', 'spend', 'bonus']);
export const typeEnum = pgEnum("type", ['document', 'conversation', 'preference', 'memory']);
export const categoryEnum = pgEnum("category", ['personal', 'work', 'preference', 'relationship', 'fact']);
export const threatLevelEnum = pgEnum("threatLevel", ['low', 'medium', 'high', 'critical']);
export const theBrainStatusEnum = pgEnum("theBrainStatus", ['not_started', 'in_progress', 'launched', 'superior']);
export const importanceEnum = pgEnum("importance", ['low', 'medium', 'high', 'critical']);
export const typeEnum = pgEnum("type", ['threat', 'opportunity']);
export const severityEnum = pgEnum("severity", ['low', 'medium', 'high', 'critical']);
export const statusEnum = pgEnum("status", ['new', 'analyzing', 'action_required', 'addressed', 'monitoring']);
export const statusEnum = pgEnum("status", ['proposed', 'enacted', 'enforced']);
export const complianceStatusEnum = pgEnum("complianceStatus", ['not_applicable', 'non_compliant', 'partial', 'compliant']);
export const moatPotentialEnum = pgEnum("moatPotential", ['none', 'low', 'medium', 'high']);
export const categoryEnum = pgEnum("category", ['product', 'pricing', 'marketing', 'partnership', 'regulatory', 'technical']);
export const priorityEnum = pgEnum("priority", ['low', 'medium', 'high', 'critical']);
export const effortEnum = pgEnum("effort", ['low', 'medium', 'high']);
export const statusEnum = pgEnum("status", ['proposed', 'approved', 'in_progress', 'completed', 'rejected']);
export const taskTypeEnum = pgEnum("taskType", ['competitor_analysis', 'feature_gap', 'market_research', 'pricing_review', 'regulatory_check', 'strategy_update']);
export const statusEnum = pgEnum("status", ['pending', 'in_progress', 'completed', 'failed']);
export const priorityEnum = pgEnum("priority", ['low', 'medium', 'high']);
export const methodEnum = pgEnum("method", ['email', 'sms']);
export const statusEnum = pgEnum("status", ['active', 'expired', 'revoked', 'error']);
export const billingCycleEnum = pgEnum("billingCycle", ['monthly', 'quarterly', 'annual', 'one_time', 'usage_based']);
export const statusEnum = pgEnum("status", ['active', 'paused', 'cancelled', 'trial']);
export const typeEnum = pgEnum("type", ['investment', 'partnership', 'acquisition', 'joint_venture', 'other']);
export const statusEnum = pgEnum("status", ['active', 'on_hold', 'won', 'lost', 'abandoned']);
export const priorityEnum = pgEnum("priority", ['low', 'medium', 'high', 'urgent']);
export const typeEnum = pgEnum("type", ['drawn', 'typed', 'uploaded']);
export const repeatTypeEnum = pgEnum("repeatType", ['none', 'daily', 'weekly', 'monthly', 'custom']);
export const statusEnum = pgEnum("status", ['pending', 'triggered', 'snoozed', 'completed', 'cancelled']);
export const priorityEnum = pgEnum("priority", ['low', 'medium', 'high', 'critical']);
export const qaStatusEnum = pgEnum("qaStatus", ['pending', 'cos_reviewed', 'secondary_reviewed', 'approved', 'rejected']);
export const actorTypeEnum = pgEnum("actorType", ['user', 'digital_twin', 'ai_expert', 'system']);
export const statusEnum = pgEnum("status", ['detected', 'reviewed', 'false_positive', 'redacted']);
export const statusEnum = pgEnum("status", ['not_started', 'in_progress', 'completed', 'blocked']);
export const categoryEnum = pgEnum("category", ['task', 'idea', 'reminder', 'observation', 'question', 'follow_up']);
export const roleEnum = pgEnum("role", ['user', 'expert', 'system']);
export const sentimentEnum = pgEnum("sentiment", ['positive', 'neutral', 'negative']);
export const memoryTypeEnum = pgEnum("memoryType", ['preference', 'fact', 'style', 'context', 'correction']);
export const statusEnum = pgEnum("status", ['draft', 'validated', 'outdated', 'archived']);
export const priorityEnum = pgEnum("priority", ['low', 'medium', 'high', 'critical']);
export const statusEnum = pgEnum("status", ['pending', 'in_progress', 'completed', 'failed']);
export const coachTypeEnum = pgEnum("coachType", ['chief_of_staff', 'peer_expert', 'user']);
export const statusEnum = pgEnum("status", ['scheduled', 'in_progress', 'completed', 'follow_up_needed']);
export const knowledgeLevelEnum = pgEnum("knowledgeLevel", ['basic', 'intermediate', 'advanced', 'expert']);
export const contactTypeEnum = pgEnum("contactType", ['expert', 'corporate_partner', 'ai_expert', 'colleague']);
export const reviewTypeEnum = pgEnum("reviewType", ['cos_review', 'secondary_ai', 'sme_feedback']);
export const statusEnum = pgEnum("status", ['pending', 'approved', 'rejected', 'needs_revision']);
export const feedbackTypeEnum = pgEnum("feedbackType", ['positive', 'constructive', 'correction', 'training']);
export const statusEnum = pgEnum("status", ['active', 'paused', 'completed']);
export const roleEnum = pgEnum("role", ['user', 'expert', 'system']);
export const statusEnum = pgEnum("status", ['pending', 'answered']);
export const statusEnum = pgEnum("status", ['active', 'completed', 'archived']);
export const roleEnum = pgEnum("role", ['owner', 'reviewer', 'viewer']);
export const statusEnum = pgEnum("status", ['active', 'resolved', 'deleted']);
export const actionEnum = pgEnum("action", ['joined', 'viewed_section', 'commented', 'reviewed_section', 'completed_review']);
export const codeEnum = pgEnum("code", ['blue_team', 'left_field', 'red_team']);
export const panelTypeCodeEnum = pgEnum("panelTypeCode", ['blue_team', 'left_field', 'red_team']);
export const statusEnum = pgEnum("status", ['assembling', 'active', 'completed', 'disbanded']);
export const statusEnum = pgEnum("status", ['pending', 'in_progress', 'completed']);
export const level4DecisionEnum = pgEnum("level4Decision", ['go', 'hold', 'recycle', 'kill']);
export const statusEnum = pgEnum("status", ['not_started', 'in_progress', 'passed', 'failed']);
export const statusEnum = pgEnum("status", ['scheduled', 'in_progress', 'completed']);
export const impactEnum = pgEnum("impact", ['low', 'medium', 'high']);
export const statusEnum = pgEnum("status", ['active', 'inactive', 'pending', 'error']);
export const statusEnum = pgEnum("status", ['pending', 'in_progress', 'completed', 'failed']);
export const panelTypeCodeEnum = pgEnum("panelTypeCode", ['blue_team', 'left_field', 'red_team']);
export const modeEnum = pgEnum("mode", ['manual', 'auto_processed', 'delegated']);
export const decisionEnum = pgEnum("decision", ['accepted', 'deferred', 'rejected']);
export const sourceTypeEnum = pgEnum("sourceType", ['evening_review', 'overnight_task', 'calendar', 'news', 'project_update', 'manual']);
export const categoryEnum = pgEnum("category", ['task_summary', 'project_update', 'calendar_alert', 'intelligence', 'recommendation', 'reflection']);
export const priorityEnum = pgEnum("priority", ['low', 'medium', 'high', 'critical']);
export const statusEnum = pgEnum("status", ['pending', 'delivered', 'actioned', 'dismissed']);
export const sourceEnum = pgEnum("source", ['manual', 'article', 'trend', 'conversation', 'chief_of_staff', 'sme_suggestion']);
export const statusEnum = pgEnum("status", ['captured', 'assessing', 'refining', 'validated', 'rejected', 'archived', 'promoted_to_genesis']);
export const priorityEnum = pgEnum("priority", ['low', 'medium', 'high', 'critical']);
export const assessorTypeEnum = pgEnum("assessorType", ['chief_of_staff', 'sme_expert', 'framework', 'user']);
export const recommendationEnum = pgEnum("recommendation", ['proceed', 'refine', 'pivot', 'reject', 'needs_more_info']);
export const triggeredByEnum = pgEnum("triggeredBy", ['assessment', 'sme_feedback', 'user_input', 'chief_of_staff']);
export const riskLevelEnum = pgEnum("riskLevel", ['low', 'medium', 'high', 'very_high']);
export const trendStrengthEnum = pgEnum("trendStrength", ['emerging', 'growing', 'mainstream', 'declining']);
export const potentialImpactEnum = pgEnum("potentialImpact", ['low', 'medium', 'high', 'transformative']);
export const typeEnum = pgEnum("type", ['innovation_brief', 'project_genesis', 'report', 'other']);
export const classificationEnum = pgEnum("classification", ['public', 'internal', 'confidential', 'restricted']);
export const qaStatusEnum = pgEnum("qaStatus", ['pending', 'approved', 'rejected']);
export const countryEnum = pgEnum("country", ['UAE', 'UK', 'EU', 'US', 'Other']);
export const statusEnum = pgEnum("status", ['active', 'paused', 'planned', 'discontinued']);
export const statusEnum = pgEnum("status", ['pending', 'completed', 'failed', 'refunded']);
export const billingPeriodEnum = pgEnum("billingPeriod", ['one_time', 'monthly', 'quarterly', 'annual']);
export const customerTypeEnum = pgEnum("customerType", ['individual', 'business', 'enterprise']);
export const statusEnum = pgEnum("status", ['prospect', 'active', 'churned', 'paused']);
export const periodTypeEnum = pgEnum("periodType", ['monthly', 'quarterly', 'annual']);
export const confidenceEnum = pgEnum("confidence", ['low', 'medium', 'high']);
export const genderEnum = pgEnum("gender", ['male', 'female', 'non_binary', 'prefer_not_to_say']);
export const jobLevelEnum = pgEnum("jobLevel", ['entry', 'mid', 'senior', 'executive', 'founder', 'retired', 'student']);
export const companySizeEnum = pgEnum("companySize", ['solo', 'startup', 'small', 'medium', 'large', 'enterprise']);
export const buyingStyleEnum = pgEnum("buyingStyle", ['impulsive', 'researcher', 'bargain_hunter', 'brand_loyal', 'quality_focused', 'value_seeker']);
export const techSavvinessEnum = pgEnum("techSavviness", ['low', 'medium', 'high', 'expert']);
export const riskToleranceEnum = pgEnum("riskTolerance", ['conservative', 'moderate', 'aggressive']);
export const tierEnum = pgEnum("tier", ['core', 'extended', 'niche']);
export const statusEnum = pgEnum("status", ['draft', 'active', 'completed', 'archived']);
export const overallSentimentEnum = pgEnum("overallSentiment", ['very_negative', 'negative', 'neutral', 'positive', 'very_positive']);
export const willingnessToPayEnum = pgEnum("willingnessToPay", ['definitely_not', 'unlikely', 'maybe', 'likely', 'definitely']);
export const goNoGoRecommendationEnum = pgEnum("goNoGoRecommendation", ['strong_go', 'go', 'conditional', 'no_go', 'strong_no_go']);
export const statusEnum = pgEnum("status", ['planned', 'in_progress', 'completed', 'analyzed']);
export const decisionEnum = pgEnum("decision", ['proceed', 'pivot', 'iterate', 'abandon', 'pending']);
export const priorityEnum = pgEnum("priority", ['critical', 'high', 'medium', 'maintain']);
export const confidenceLevelEnum = pgEnum("confidenceLevel", ['low', 'medium', 'high']);
export const outlierTypeEnum = pgEnum("outlierType", ['high', 'low']);
export const severityEnum = pgEnum("severity", ['minor', 'moderate', 'significant', 'extreme']);
export const reviewStatusEnum = pgEnum("reviewStatus", ['pending', 'under_review', 'resolved', 'accepted']);
export const consensusLevelEnum = pgEnum("consensusLevel", ['strong', 'moderate', 'weak', 'divided']);
export const statusEnum = pgEnum("status", ['in_progress', 'completed', 'follow_up_needed']);
export const confidenceLevelEnum = pgEnum("confidenceLevel", ['low', 'medium', 'high', 'verified']);
export const statusEnum = pgEnum("status", ['active', 'archived', 'superseded', 'disputed']);
export const statusEnum = pgEnum("status", ['active', 'archived', 'outdated']);
export const priorityEnum = pgEnum("priority", ['low', 'medium', 'high', 'urgent']);
export const statusEnum = pgEnum("status", ['pending', 'viewed', 'accepted', 'rejected', 'implemented']);
export const priorityEnum = pgEnum("priority", ['low', 'medium', 'high', 'critical']);
export const statusEnum = pgEnum("status", ['open', 'in_progress', 'resolved', 'wont_fix']);
export const periodTypeEnum = pgEnum("periodType", ['daily', 'weekly', 'monthly']);
export const periodTypeEnum = pgEnum("periodType", ['daily', 'weekly', 'monthly']);
export const statusEnum = pgEnum("status", ['not_started', 'in_progress', 'completed', 'blocked']);
export const statusEnum = pgEnum("status", ['pending', 'in_progress', 'completed', 'overdue']);
export const statusEnum = pgEnum("status", ['draft', 'review', 'approved', 'rejected']);
export const complexityEnum = pgEnum("complexity", ['low', 'medium', 'high']);
export const statusEnum = pgEnum("status", ['draft', 'active', 'deprecated']);
export const statusEnum = pgEnum("status", ['planning', 'in_progress', 'completed', 'paused', 'cancelled']);


/**
 * Core user table backing auth flow.
 */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  themePreference: themePreferenceEnum("themePreference").default("dark").notNull(),
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
  userId: serial("userId").notNull(),
  score: serial("score").notNull(), // 1-10
  timeOfDay: timeOfDayEnum("timeOfDay").notNull(),
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
  userId: serial("userId").notNull(),
  role: roleEnum("role").notNull(),
  content: text("content").notNull(),
  contentType: contentTypeEnum("contentType").default("text").notNull(),
  context: varchar("context", { length: 100 }), // e.g., "daily_brief", "ai_experts", "workflow"
  metadata: json("metadata"), // Additional structured data
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TrainingConversation = typeof trainingConversations.$inferSelect;
export type InsertTrainingConversation = typeof trainingConversations.$inferInsert;

/**
 * Decision patterns - every choice the user makes
 */
export const decisionPatterns = pgTable("decision_patterns", {
  id: serial("id").primaryKey(),
  userId: serial("userId").notNull(),
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
  userId: serial("userId").notNull(),
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
  userId: serial("userId").notNull(),
  term: varchar("term", { length: 200 }).notNull(),
  meaning: text("meaning"), // What the user means by this term
  context: varchar("context", { length: 100 }), // Where this term is typically used
  frequency: serial("frequency").default(1), // How often used
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
  userId: serial("userId").notNull(),
  expertId: varchar("expertId", { length: 50 }), // AI expert who did the work
  projectId: varchar("projectId", { length: 50 }),
  rating: serial("rating"), // 1-5 stars
  feedbackType: feedbackTypeEnum("feedbackType").notNull(),
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
  userId: serial("userId").notNull(),
  activityType: varchar("activityType", { length: 50 }).notNull(), // "email_sent", "task_completed", "meeting_scheduled"
  description: text("description").notNull(),
  status: statusEnum("status").default("completed").notNull(),
  autonomous: boolean("autonomous").default(false), // Was this done without user approval?
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TwinActivityLog = typeof twinActivityLog.$inferSelect;
export type InsertTwinActivityLog = typeof twinActivityLog.$inferInsert;

/**
 * AI Expert performance scores
 */
export const expertPerformance = pgTable("expert_performance", {
  id: serial("id").primaryKey(),
  userId: serial("userId").notNull(),
  expertId: varchar("expertId", { length: 50 }).notNull(),
  score: real("score").default(80), // 0-100 performance score
  projectsCompleted: serial("projectsCompleted").default(0),
  positiveFeedback: serial("positiveFeedback").default(0),
  negativeFeedback: serial("negativeFeedback").default(0),
  lastUsed: timestamp("lastUsed"),
  notes: text("notes"), // User notes about this expert
  status: statusEnum("status").default("active").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type ExpertPerformance = typeof expertPerformance.$inferSelect;
export type InsertExpertPerformance = typeof expertPerformance.$inferInsert;

/**
 * Projects - user's active projects
 */
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  userId: serial("userId").notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  status: statusEnum("status").default("not_started").notNull(),
  priority: priorityEnum("priority").default("medium").notNull(),
  progress: serial("progress").default(0), // 0-100
  dueDate: timestamp("dueDate"),
  blockerDescription: text("blockerDescription"),
  assignedExperts: json("assignedExperts"), // Array of expert IDs
  metadata: json("metadata"),
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
  userId: serial("userId").notNull(),
  briefDate: timestamp("briefDate").notNull(),
  category: categoryEnum("category").notNull(),
  title: varchar("title", { length: 300 }).notNull(),
  description: text("description"),
  priority: priorityEnum("priority").default("medium").notNull(),
  status: statusEnum("status").default("pending").notNull(),
  actionedAt: timestamp("actionedAt"),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DailyBriefItem = typeof dailyBriefItems.$inferSelect;
export type InsertDailyBriefItem = typeof dailyBriefItems.$inferInsert;

/**
 * User settings and app state
 */
export const userSettings = pgTable("user_settings", {
  id: serial("id").primaryKey(),
  userId: serial("userId").notNull().unique(),
  theme: themeEnum("theme").default("dark").notNull(),
  governanceMode: governanceModeEnum("governanceMode").default("governed").notNull(),
  dailyBriefTime: varchar("dailyBriefTime", { length: 10 }).default("07:00"),
  eveningReviewTime: varchar("eveningReviewTime", { length: 10 }).default("18:00"),
  lastMoodCheckMorning: timestamp("lastMoodCheckMorning"),
  lastMoodCheckAfternoon: timestamp("lastMoodCheckAfternoon"),
  lastMoodCheckEvening: timestamp("lastMoodCheckEvening"),
  twinAutonomyLevel: serial("twinAutonomyLevel").default(1), // 1-10, how autonomous the twin can be
  notificationsEnabled: boolean("notificationsEnabled").default(true),
  sidebarCollapsed: boolean("sidebarCollapsed").default(false),
  onboardingComplete: boolean("onboardingComplete").default(false),
  metadata: json("metadata"),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type UserSettings = typeof userSettings.$inferSelect;
export type InsertUserSettings = typeof userSettings.$inferInsert;

/**
 * Library documents
 */
export const libraryDocuments = pgTable("library_documents", {
  id: serial("id").primaryKey(),
  userId: serial("userId").notNull(),
  projectId: varchar("projectId", { length: 50 }), // null for personal items
  folder: varchar("folder", { length: 100 }).notNull(), // "celadon", "boundless", "personal", etc.
  subFolder: varchar("subFolder", { length: 100 }), // "documents", "ai_images", "charts", etc.
  name: varchar("name", { length: 300 }).notNull(),
  type: typeEnum("type").notNull(),
  status: statusEnum("status").default("draft").notNull(),
  fileUrl: text("fileUrl"),
  thumbnailUrl: text("thumbnailUrl"),
  metadata: json("metadata"),
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
  userId: serial("userId").notNull(),
  role: roleEnum("role").notNull(),
  content: text("content").notNull(),
  metadata: json("metadata"), // Store additional context like mood, voice input, etc.
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
  position: serial("position").notNull(),
  status: statusEnum("status").default("waiting").notNull(),
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
  referrerId: serial("referrerId").notNull(), // User who referred
  referredEmail: varchar("referredEmail", { length: 320 }).notNull(),
  referredUserId: serial("referredUserId"), // Filled when they join
  status: statusEnum("status").default("pending").notNull(),
  creditsAwarded: serial("creditsAwarded").default(0),
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
  userId: serial("userId").notNull(),
  balance: serial("balance").default(0).notNull(),
  lifetimeEarned: serial("lifetimeEarned").default(0).notNull(),
  lifetimeSpent: serial("lifetimeSpent").default(0).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type UserCredits = typeof userCredits.$inferSelect;
export type InsertUserCredits = typeof userCredits.$inferInsert;

/**
 * Credit transactions - audit log of credit changes
 */
export const creditTransactions = pgTable("credit_transactions", {
  id: serial("id").primaryKey(),
  userId: serial("userId").notNull(),
  amount: serial("amount").notNull(), // Positive for earn, negative for spend
  type: typeEnum("type").notNull(),
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
  userId: serial("userId").notNull(),
  name: varchar("name", { length: 300 }).notNull(),
  type: typeEnum("type").notNull(),
  content: text("content"), // Text content or extracted text
  fileUrl: text("fileUrl"), // S3 URL if file uploaded
  fileSize: serial("fileSize"),
  tokenCount: serial("tokenCount"),
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
  userId: serial("userId").notNull(),
  category: categoryEnum("category").notNull(),
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
  userId: serial("userId").notNull(),
  date: timestamp("date").notNull(),
  overallScore: real("overallScore").notNull(), // 0-10
  moodScore: real("moodScore"),
  productivityScore: real("productivityScore"),
  balanceScore: real("balanceScore"),
  momentumScore: real("momentumScore"),
  factors: json("factors"), // Breakdown of contributing factors
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WellnessScore = typeof wellnessScores.$inferSelect;
export type InsertWellnessScore = typeof wellnessScores.$inferInsert;

/**
 * Streaks - gamification tracking
 */
export const streaks = pgTable("streaks", {
  id: serial("id").primaryKey(),
  userId: serial("userId").notNull(),
  type: varchar("type", { length: 50 }).notNull(), // "daily_login", "mood_check", "task_complete"
  currentStreak: serial("currentStreak").default(0).notNull(),
  longestStreak: serial("longestStreak").default(0).notNull(),
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
  userId: serial("userId").notNull(),
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
  strengths: json("strengths"), // Array of strength descriptions
  weaknesses: json("weaknesses"), // Array of weakness descriptions
  threatLevel: threatLevelEnum("threatLevel").default("medium"),
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
  theBrainStatus: theBrainStatusEnum("theBrainStatus").default("not_started"),
  theBrainScore: serial("theBrainScore").default(0), // 0-100
  competitorData: json("competitorData"), // { competitorId: score, ... }
  importance: importanceEnum("importance").default("medium"),
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
export const competitiveThreats = pgTable("competitive_threats", {
  id: serial("id").primaryKey(),
  type: typeEnum("type").notNull(),
  severity: severityEnum("severity").default("medium"),
  competitorId: serial("competitorId"),
  title: varchar("title", { length: 300 }).notNull(),
  description: text("description").notNull(),
  impact: text("impact"), // How this affects The Brain
  recommendedAction: text("recommendedAction"),
  status: statusEnum("status").default("new"),
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
  status: statusEnum("status").default("proposed"),
  effectiveDate: timestamp("effectiveDate"),
  complianceStatus: complianceStatusEnum("complianceStatus").default("not_applicable"),
  moatPotential: moatPotentialEnum("moatPotential").default("none"),
  description: text("description"),
  requirements: json("requirements"), // Array of specific requirements
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
  category: categoryEnum("category").notNull(),
  priority: priorityEnum("priority").default("medium"),
  title: varchar("title", { length: 300 }).notNull(),
  recommendation: text("recommendation").notNull(),
  rationale: text("rationale"),
  expectedImpact: text("expectedImpact"),
  effort: effortEnum("effort").default("medium"),
  timeframe: varchar("timeframe", { length: 100 }), // "immediate", "1-2 weeks", "1-3 months"
  status: statusEnum("status").default("proposed"),
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
  taskType: taskTypeEnum("taskType").notNull(),
  title: varchar("title", { length: 300 }).notNull(),
  description: text("description"),
  status: statusEnum("status").default("pending"),
  priority: priorityEnum("priority").default("medium"),
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
  userId: serial("userId").notNull(),
  code: varchar("code", { length: 6 }).notNull(), // 6-digit code
  method: methodEnum("method").default("email").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  used: boolean("used").default(false),
  attempts: serial("attempts").default(0), // Failed verification attempts
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type VaultVerificationCode = typeof vaultVerificationCodes.$inferSelect;
export type InsertVaultVerificationCode = typeof vaultVerificationCodes.$inferInsert;

/**
 * Trusted devices - devices that can skip 2FA temporarily
 */
export const trustedDevices = pgTable("trusted_devices", {
  id: serial("id").primaryKey(),
  userId: serial("userId").notNull(),
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
  userId: serial("userId").notNull(),
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
export const vaultSessions = pgTable("vault_sessions", {
  id: serial("id").primaryKey(),
  userId: serial("userId").notNull(),
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
  userId: serial("userId").notNull(),
  provider: varchar("provider", { length: 50 }).notNull(), // "asana", "google", "outlook", "slack", etc.
  providerAccountId: varchar("providerAccountId", { length: 200 }), // External account ID
  accessToken: text("accessToken"), // Encrypted
  refreshToken: text("refreshToken"), // Encrypted
  tokenExpiresAt: timestamp("tokenExpiresAt"),
  scopes: json("scopes"), // Array of granted scopes
  status: statusEnum("status").default("active").notNull(),
  lastSyncAt: timestamp("lastSyncAt"),
  syncError: text("syncError"),
  metadata: json("metadata"), // Provider-specific data
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
  userId: serial("userId").notNull(),
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
export const auditLog = pgTable("audit_log", {
  id: serial("id").primaryKey(),
  userId: serial("userId"),
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
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: serial("userId").notNull(),
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
  billingCycle: billingCycleEnum("billingCycle").default("monthly").notNull(),
  currency: varchar("currency", { length: 10 }).default("AED").notNull(),
  status: statusEnum("status").default("active").notNull(),
  startDate: timestamp("startDate"),
  renewalDate: timestamp("renewalDate"),
  trialEndDate: timestamp("trialEndDate"),
  usagePercent: serial("usagePercent"), // 0-100, how much of the subscription is used
  websiteUrl: text("websiteUrl"),
  logoUrl: text("logoUrl"),
  linkedIdeaId: serial("linkedIdeaId"), // Link to innovation idea if subscription is for a specific project
  linkedProjectId: serial("linkedProjectId"),
  notes: text("notes"),
  metadata: json("metadata"),
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
  userId: serial("userId").notNull(),
  name: varchar("name", { length: 300 }).notNull(),
  type: typeEnum("type").notNull(),
  stage: mysqlEnum("stage", [
    "discovery", "qualification", "due_diligence", 
    "negotiation", "documentation", "closing", "post_deal"
  ]).default("discovery").notNull(),
  status: statusEnum("status").default("active").notNull(),
  counterparty: varchar("counterparty", { length: 300 }),
  dealValue: real("dealValue"),
  currency: varchar("currency", { length: 3 }).default("USD"),
  probability: serial("probability").default(50), // 0-100
  expectedCloseDate: timestamp("expectedCloseDate"),
  description: text("description"),
  keyContacts: json("keyContacts"), // Array of contact info
  documents: json("documents"), // Array of document references
  tasks: json("tasks"), // Array of task IDs
  notes: text("notes"),
  metadata: json("metadata"),
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
  userId: serial("userId").notNull(),
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
  priority: priorityEnum("priority").default("medium"),
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
export const brandKit = pgTable("brand_kit", {
  id: serial("id").primaryKey(),
  userId: serial("userId").notNull(),
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
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type BrandKitRecord = typeof brandKit.$inferSelect;
export type InsertBrandKit = typeof brandKit.$inferInsert;

/**
 * Signatures - stored signatures for document signing
 */
export const signatures = pgTable("signatures", {
  id: serial("id").primaryKey(),
  userId: serial("userId").notNull(),
  name: varchar("name", { length: 200 }).notNull(), // "Main Signature", "Initials", etc.
  type: typeEnum("type").notNull(),
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
  userId: serial("userId").notNull(),
  provider: varchar("provider", { length: 50 }).notNull(), // "openai", "anthropic", "perplexity", etc.
  apiKey: text("apiKey"), // Encrypted
  isEnabled: boolean("isEnabled").default(true),
  priority: serial("priority").default(1), // Lower = higher priority
  usageLimit: serial("usageLimit"), // Monthly token limit
  currentUsage: serial("currentUsage").default(0),
  domains: json("domains"), // Array of domains this provider handles
  metadata: json("metadata"),
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
  userId: serial("userId").notNull(),
  title: varchar("title", { length: 300 }).notNull(),
  description: text("description"),
  dueAt: timestamp("dueAt").notNull(),
  repeatType: repeatTypeEnum("repeatType").default("none"),
  repeatInterval: serial("repeatInterval"), // For custom repeats
  status: statusEnum("status").default("pending"),
  snoozedUntil: timestamp("snoozedUntil"),
  relatedType: varchar("relatedType", { length: 50 }), // "project", "task", "inbox_item", etc.
  relatedId: serial("relatedId"),
  notificationSent: boolean("notificationSent").default(false),
  metadata: json("metadata"),
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
  userId: serial("userId").notNull(),
  projectId: serial("projectId"),
  teamId: serial("teamId"), // Link to SME team
  parentTaskId: serial("parentTaskId"), // For subtasks
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  status: mysqlEnum("status", [
    "not_started", "in_progress", "blocked", 
    "review", "cos_approved", "verified", "completed", "cancelled"
  ]).default("not_started").notNull(),
  priority: priorityEnum("priority").default("medium"),
  progress: serial("progress").default(0), // 0-100
  dueDate: timestamp("dueDate"),
  estimatedHours: real("estimatedHours"),
  actualHours: real("actualHours"),
  assignedTo: varchar("assignedTo", { length: 100 }), // "digital_twin", expert ID, or "user"
  assignedExperts: json("assignedExperts"), // Array of expert IDs for team tasks
  dependencies: json("dependencies"), // Array of task IDs this depends on
  blockerDescription: text("blockerDescription"),
  cosScore: serial("cosScore"), // Chief of Staff QA score (1-10)
  secondaryAiScore: serial("secondaryAiScore"), // Secondary AI verification score (1-10)
  qaStatus: qaStatusEnum("qaStatus").default("pending"),
  completedAt: timestamp("completedAt"),
  metadata: json("metadata"),
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
  userId: serial("userId").notNull(),
  projectId: serial("projectId"),
  actorType: actorTypeEnum("actorType").notNull(),
  actorId: varchar("actorId", { length: 100 }), // Expert ID or "system"
  actorName: varchar("actorName", { length: 200 }),
  action: varchar("action", { length: 100 }).notNull(), // "created", "updated", "completed", etc.
  targetType: varchar("targetType", { length: 50 }), // "task", "document", "project", etc.
  targetId: serial("targetId"),
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
export const dataRetentionPolicies = pgTable("data_retention_policies", {
  id: serial("id").primaryKey(),
  userId: serial("userId").notNull(),
  dataType: varchar("dataType", { length: 100 }).notNull(), // "conversations", "documents", "audit_logs", etc.
  retentionDays: serial("retentionDays").notNull(),
  autoDelete: boolean("autoDelete").default(false),
  lastPurgeAt: timestamp("lastPurgeAt"),
  nextPurgeAt: timestamp("nextPurgeAt"),
  itemsDeleted: serial("itemsDeleted").default(0),
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
  userId: serial("userId").notNull(),
  sourceType: varchar("sourceType", { length: 50 }).notNull(), // "document", "conversation", "inbox", etc.
  sourceId: serial("sourceId").notNull(),
  piiType: varchar("piiType", { length: 50 }).notNull(), // "email", "phone", "ssn", "credit_card", etc.
  detectedText: text("detectedText"), // The flagged content (may be redacted)
  confidence: real("confidence"), // 0-1 confidence score
  status: statusEnum("status").default("detected"),
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
export const complianceChecklists = pgTable("compliance_checklists", {
  id: serial("id").primaryKey(),
  userId: serial("userId").notNull(),
  projectId: serial("projectId"),
  projectType: varchar("projectType", { length: 100 }).notNull(), // "investment", "partnership", etc.
  checklistName: varchar("checklistName", { length: 200 }).notNull(),
  items: json("items").notNull(), // Array of { id, title, required, completed, completedAt, notes }
  completedCount: serial("completedCount").default(0),
  totalCount: serial("totalCount").notNull(),
  status: statusEnum("status").default("not_started"),
  dueDate: timestamp("dueDate"),
  completedAt: timestamp("completedAt"),
  metadata: json("metadata"),
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
  userId: serial("userId").notNull(),
  content: text("content").notNull(), // Transcribed text
  category: categoryEnum("category").default("observation").notNull(),
  audioUrl: varchar("audioUrl", { length: 500 }), // S3 URL to original audio
  duration: serial("duration"), // Duration in seconds
  projectId: serial("projectId"), // Optional link to project
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
export const expertConversations = pgTable("expert_conversations", {
  id: serial("id").primaryKey(),
  userId: serial("userId").notNull(),
  expertId: varchar("expertId", { length: 50 }).notNull(),
  role: roleEnum("role").notNull(),
  content: text("content").notNull(),
  projectId: serial("projectId"), // Optional link to project
  taskId: varchar("taskId", { length: 100 }), // Task this conversation relates to
  sentiment: sentimentEnum("sentiment"),
  qualityScore: serial("qualityScore"), // 1-10 rating of this response
  metadata: json("metadata"),
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
  userId: serial("userId").notNull(),
  expertId: varchar("expertId", { length: 50 }).notNull(),
  memoryType: memoryTypeEnum("memoryType").notNull(),
  key: varchar("key", { length: 200 }).notNull(),
  value: text("value").notNull(),
  confidence: real("confidence").default(0.8), // 0-1 confidence in this memory
  source: varchar("source", { length: 100 }), // "conversation", "feedback", "inferred"
  usageCount: serial("usageCount").default(0), // How often this memory has been used
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
  version: serial("version").notNull(),
  promptAdditions: text("promptAdditions"), // Additional instructions added
  communicationStyle: text("communicationStyle"), // Learned communication preferences
  strengthAdjustments: json("strengthAdjustments"), // Adjusted strength scores
  weaknessAdjustments: json("weaknessAdjustments"), // Adjusted weakness areas
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
  userId: serial("userId").notNull(),
  expertId: varchar("expertId", { length: 50 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(), // "market", "strategy", "operations", etc.
  title: varchar("title", { length: 300 }).notNull(),
  insight: text("insight").notNull(),
  evidence: text("evidence"), // Supporting data/reasoning
  confidence: real("confidence").default(0.7),
  tags: json("tags"), // Array of tags for searchability
  projectId: serial("projectId"),
  relatedExpertIds: json("relatedExpertIds"), // Other experts who contributed
  usageCount: serial("usageCount").default(0), // How often referenced by other experts
  validatedBy: json("validatedBy"), // Array of expert IDs who validated this
  status: statusEnum("status").default("draft"),
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
  priority: priorityEnum("priority").default("medium"),
  status: statusEnum("status").default("pending"),
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
export const expertCollaboration = pgTable("expert_collaboration", {
  id: serial("id").primaryKey(),
  userId: serial("userId").notNull(),
  initiatorExpertId: varchar("initiatorExpertId", { length: 50 }).notNull(),
  collaboratorExpertIds: json("collaboratorExpertIds").notNull(), // Array of expert IDs
  projectId: serial("projectId"),
  taskDescription: text("taskDescription").notNull(),
  outcome: text("outcome"),
  qualityScore: serial("qualityScore"), // 1-10 rating of collaboration
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
  coachType: coachTypeEnum("coachType").notNull(),
  coachId: varchar("coachId", { length: 50 }), // ID of coaching expert if peer
  focusArea: varchar("focusArea", { length: 200 }).notNull(), // "communication", "accuracy", "speed", etc.
  feedbackGiven: text("feedbackGiven").notNull(),
  improvementPlan: text("improvementPlan"),
  metricsBeforeCoaching: json("metricsBeforeCoaching"),
  metricsAfterCoaching: json("metricsAfterCoaching"),
  status: statusEnum("status").default("scheduled"),
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
  knowledgeLevel: knowledgeLevelEnum("knowledgeLevel").default("advanced"),
  lastUpdated: timestamp("lastUpdated").defaultNow().notNull(),
  updateFrequency: varchar("updateFrequency", { length: 50 }).default("weekly"), // How often to refresh
  sources: json("sources"), // Preferred sources for this domain
  keyFrameworks: json("keyFrameworks"), // Frameworks this expert uses
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
  userId: serial("userId").notNull(),
  contactType: contactTypeEnum("contactType").notNull(),
  contactId: varchar("contactId", { length: 100 }).notNull(), // ID of the expert, partner, or colleague
  contactName: varchar("contactName", { length: 200 }).notNull(), // Display name
  contactAvatar: varchar("contactAvatar", { length: 500 }), // Avatar URL
  order: serial("order").default(0), // For custom ordering
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
  userId: serial("userId").notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  purpose: varchar("purpose", { length: 300 }), // What this team is for
  projectId: serial("projectId"), // Optional link to a project
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
  teamId: serial("teamId").notNull(),
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
  taskId: serial("taskId").notNull(),
  reviewType: reviewTypeEnum("reviewType").notNull(),
  reviewerId: varchar("reviewerId", { length: 100 }), // "chief_of_staff" or AI expert ID
  score: serial("score"), // 1-10 quality score
  feedback: text("feedback"),
  status: statusEnum("status").default("pending").notNull(),
  improvements: json("improvements"), // Suggested improvements
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
  userId: serial("userId").notNull(),
  expertId: varchar("expertId", { length: 50 }).notNull(),
  taskId: serial("taskId"),
  feedbackType: feedbackTypeEnum("feedbackType").notNull(),
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
  userId: serial("userId").notNull(),
  expertId: varchar("expertId", { length: 50 }).notNull(),
  expertName: varchar("expertName", { length: 200 }).notNull(),
  expertCategory: varchar("expertCategory", { length: 100 }),
  topic: varchar("topic", { length: 300 }), // What was discussed
  summary: text("summary"), // AI-generated summary of the consultation
  recommendations: json("recommendations"), // Key recommendations from the expert
  userRating: serial("userRating"), // 1-10 rating of the consultation
  userFeedback: text("userFeedback"), // Optional feedback
  duration: serial("duration"), // Duration in seconds
  messageCount: serial("messageCount").default(0), // Number of messages exchanged
  projectId: serial("projectId"), // Optional link to project
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
  userId: serial("userId").notNull(),
  expertId: varchar("expertId", { length: 50 }).notNull(),
  expertName: varchar("expertName", { length: 200 }),
  systemPrompt: text("systemPrompt"),
  projectId: serial("projectId"),
  consultationId: serial("consultationId"), // Link to parent consultation
  status: statusEnum("status").default("active").notNull(),
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
  sessionId: serial("sessionId").notNull(),
  role: roleEnum("role").notNull(),
  content: text("content").notNull(),
  metadata: json("metadata"), // Additional context like voice input, attachments
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ExpertChatMessage = typeof expertChatMessages.$inferSelect;
export type InsertExpertChatMessage = typeof expertChatMessages.$inferInsert;


/**
 * Business Plan Review Versions - track review history over time
 */
export const businessPlanReviewVersions = pgTable("business_plan_review_versions", {
  id: serial("id").primaryKey(),
  userId: serial("userId").notNull(),
  projectName: varchar("projectName", { length: 300 }).notNull(),
  versionNumber: serial("versionNumber").notNull(),
  versionLabel: varchar("versionLabel", { length: 100 }), // e.g., "Initial Draft", "Post-Feedback"
  overallScore: serial("overallScore"), // 0-100
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
export const expertFollowUpQuestions = pgTable("expert_follow_up_questions", {
  id: serial("id").primaryKey(),
  userId: serial("userId").notNull(),
  reviewVersionId: serial("reviewVersionId").notNull(), // Link to review version
  sectionId: varchar("sectionId", { length: 100 }).notNull(),
  expertId: varchar("expertId", { length: 100 }).notNull(),
  question: text("question").notNull(),
  answer: text("answer"),
  status: statusEnum("status").default("pending").notNull(),
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
  ownerId: serial("ownerId").notNull(), // User who created the session
  projectName: varchar("projectName", { length: 255 }).notNull(),
  templateId: varchar("templateId", { length: 100 }),
  status: statusEnum("status").default("active").notNull(),
  reviewData: json("reviewData"), // Current state of the review
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
  sessionId: serial("sessionId").notNull(),
  userId: serial("userId").notNull(),
  role: roleEnum("role").default("viewer").notNull(),
  invitedBy: serial("invitedBy"),
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
  sessionId: serial("sessionId").notNull(),
  userId: serial("userId").notNull(),
  sectionId: varchar("sectionId", { length: 100 }).notNull(),
  comment: text("comment").notNull(),
  parentCommentId: serial("parentCommentId"), // For threaded replies
  status: statusEnum("status").default("active").notNull(),
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
  sessionId: serial("sessionId").notNull(),
  userId: serial("userId").notNull(),
  action: actionEnum("action").notNull(),
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
export const valueChainPhases = pgTable("value_chain_phases", {
  id: serial("id").primaryKey(),
  phaseNumber: serial("phaseNumber").notNull(), // 1-7
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
export const blueprints = pgTable("blueprints", {
  id: serial("id").primaryKey(),
  userId: serial("userId").notNull(),
  projectId: serial("projectId"), // Link to projects table
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
  currentPhase: serial("currentPhase").default(1).notNull(), // 1-7
  status: mysqlEnum("status", [
    "draft",
    "in_review",
    "approved",
    "rejected",
    "archived"
  ]).default("draft").notNull(),
  version: serial("version").default(1).notNull(),
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
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type Blueprint = typeof blueprints.$inferSelect;
export type InsertBlueprint = typeof blueprints.$inferInsert;

/**
 * Blueprint Versions - Track document history
 */
export const blueprintVersions = pgTable("blueprint_versions", {
  id: serial("id").primaryKey(),
  blueprintId: serial("blueprintId").notNull(),
  version: serial("version").notNull(),
  content: json("content"),
  fileUrl: text("fileUrl"),
  changeDescription: text("changeDescription"),
  createdBy: serial("createdBy").notNull(),
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
  code: codeEnum("code").notNull(),
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
export const smePanels = pgTable("sme_panels", {
  id: serial("id").primaryKey(),
  userId: serial("userId").notNull(),
  blueprintId: serial("blueprintId"), // Optional link to blueprint
  projectId: serial("projectId"), // Optional link to project
  panelTypeCode: panelTypeCodeEnum("panelTypeCode").notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  purpose: text("purpose"),
  phase: serial("phase"), // Which value chain phase (1-7)
  status: statusEnum("status").default("assembling").notNull(),
  expertIds: json("expertIds"), // Array of expert IDs assigned to this panel
  metadata: json("metadata"),
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
  panelId: serial("panelId").notNull(),
  blueprintId: serial("blueprintId"),
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
  status: statusEnum("status").default("pending").notNull(),
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
  userId: serial("userId").notNull(),
  blueprintId: serial("blueprintId").notNull(),
  phase: serial("phase").notNull(), // Which value chain phase (1-7)
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
  level4Decision: level4DecisionEnum("level4Decision"),
  level4CompletedAt: timestamp("level4CompletedAt"),
  level4Rationale: text("level4Rationale"),
  gatekeeper: varchar("gatekeeper", { length: 100 }).default("Chief of Staff"),
  status: statusEnum("status").default("not_started").notNull(),
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
  phase: serial("phase").notNull(), // Which value chain phase (1-7)
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
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type ProcessPlaybook = typeof processPlaybooks.$inferSelect;
export type InsertProcessPlaybook = typeof processPlaybooks.$inferInsert;

/**
 * Pre-Mortem Sessions - Proactive failure analysis
 */
export const preMortemSessions = pgTable("pre_mortem_sessions", {
  id: serial("id").primaryKey(),
  userId: serial("userId").notNull(),
  blueprintId: serial("blueprintId"),
  projectId: serial("projectId"),
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
  panelId: serial("panelId"), // Which SME panel conducted this
  status: statusEnum("status").default("scheduled").notNull(),
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
  userId: serial("userId").notNull(),
  projectId: serial("projectId"),
  blueprintId: serial("blueprintId"),
  phase: serial("phase"), // Which phase this lesson applies to
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
  impact: impactEnum("impact").default("medium"),
  actionTaken: text("actionTaken"),
  tags: json("tags"), // Array of tags for searchability
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type LessonLearned = typeof lessonsLearned.$inferSelect;
export type InsertLessonLearned = typeof lessonsLearned.$inferInsert;

/**
 * Tool Integrations - Connected external tools and their status
 */
export const toolIntegrations = pgTable("tool_integrations", {
  id: serial("id").primaryKey(),
  userId: serial("userId").notNull(),
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
  status: statusEnum("status").default("pending").notNull(),
  apiKeyConfigured: boolean("apiKeyConfigured").default(false),
  lastSyncAt: timestamp("lastSyncAt"),
  healthScore: serial("healthScore").default(100), // 0-100
  alertMessage: text("alertMessage"),
  valueChainPhases: json("valueChainPhases"), // Which phases this tool is used in
  metadata: json("metadata"),
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
  userId: serial("userId").notNull(),
  blueprintId: serial("blueprintId"),
  projectId: serial("projectId"),
  phase: serial("phase"),
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
  status: statusEnum("status").default("pending").notNull(),
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
  panelTypeCode: panelTypeCodeEnum("panelTypeCode").notNull(),
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
export const eveningReviewSessions = pgTable("evening_review_sessions", {
  id: serial("id").primaryKey(),
  userId: serial("userId").notNull(),
  reviewDate: timestamp("reviewDate").notNull(),
  startedAt: timestamp("startedAt").notNull(),
  completedAt: timestamp("completedAt"),
  mode: modeEnum("mode").default("manual").notNull(),
  tasksAccepted: serial("tasksAccepted").default(0).notNull(),
  tasksDeferred: serial("tasksDeferred").default(0).notNull(),
  tasksRejected: serial("tasksRejected").default(0).notNull(),
  moodScore: serial("moodScore"), // 1-10
  wentWellNotes: text("wentWellNotes"),
  didntGoWellNotes: text("didntGoWellNotes"),
  signalItemsGenerated: serial("signalItemsGenerated").default(0),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EveningReviewSession = typeof eveningReviewSessions.$inferSelect;
export type InsertEveningReviewSession = typeof eveningReviewSessions.$inferInsert;

/**
 * Evening Review Task Decisions - Individual task decisions from reviews
 */
export const eveningReviewTaskDecisions = pgTable("evening_review_task_decisions", {
  id: serial("id").primaryKey(),
  sessionId: serial("sessionId").notNull(),
  taskId: serial("taskId"), // Link to tasks table if applicable
  taskTitle: varchar("taskTitle", { length: 500 }).notNull(),
  projectName: varchar("projectName", { length: 200 }),
  decision: decisionEnum("decision").notNull(),
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
  userId: serial("userId").notNull(),
  dayOfWeek: serial("dayOfWeek").notNull(), // 0-6 (Sunday-Saturday)
  averageStartTime: varchar("averageStartTime", { length: 10 }), // HH:MM format
  averageDuration: serial("averageDuration"), // minutes
  completionRate: real("completionRate").default(0), // 0-1
  autoProcessRate: real("autoProcessRate").default(0), // 0-1
  sampleCount: serial("sampleCount").default(0).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type ReviewTimingPattern = typeof reviewTimingPatterns.$inferSelect;
export type InsertReviewTimingPattern = typeof reviewTimingPatterns.$inferInsert;

/**
 * Signal Items - Items prepared for the morning Signal briefing
 */
export const signalItems = pgTable("signal_items", {
  id: serial("id").primaryKey(),
  userId: serial("userId").notNull(),
  sourceType: sourceTypeEnum("sourceType").notNull(),
  sourceId: serial("sourceId"), // ID of source record
  category: categoryEnum("category").notNull(),
  title: varchar("title", { length: 300 }).notNull(),
  description: text("description"),
  priority: priorityEnum("priority").default("medium").notNull(),
  targetDate: timestamp("targetDate").notNull(), // Which morning this is for
  status: statusEnum("status").default("pending").notNull(),
  deliveredAt: timestamp("deliveredAt"),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SignalItem = typeof signalItems.$inferSelect;
export type InsertSignalItem = typeof signalItems.$inferInsert;

/**
 * Calendar Events Cache - Cached calendar events for smart prompting
 */
export const calendarEventsCache = pgTable("calendar_events_cache", {
  id: serial("id").primaryKey(),
  userId: serial("userId").notNull(),
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
export const innovationIdeas = pgTable("innovation_ideas", {
  id: serial("id").primaryKey(),
  userId: serial("userId").notNull(),
  title: varchar("title", { length: 300 }).notNull(),
  description: text("description"),
  source: sourceEnum("source").default("manual").notNull(),
  sourceUrl: text("sourceUrl"), // URL if from article
  sourceMetadata: json("sourceMetadata"), // Additional source context
  status: statusEnum("status").default("captured").notNull(),
  currentStage: serial("currentStage").default(1).notNull(), // 1-5 flywheel stage
  priority: priorityEnum("priority").default("medium").notNull(),
  category: varchar("category", { length: 100 }), // "business", "product", "investment", "trend", etc.
  tags: json("tags"), // Array of tags
  estimatedInvestment: json("estimatedInvestment"), // { min: number, max: number, currency: string }
  estimatedReturn: json("estimatedReturn"), // { min: number, max: number, timeframe: string }
  confidenceScore: real("confidenceScore"), // 0-100 overall confidence
  briefDocument: text("briefDocument"), // Generated brief summary
  promotedToProjectId: serial("promotedToProjectId"), // If promoted to Project Genesis
  metadata: json("metadata"),
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
  ideaId: serial("ideaId").notNull(),
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
  stage: serial("stage").notNull(), // Which flywheel stage (1-5)
  assessorType: assessorTypeEnum("assessorType").default("framework").notNull(),
  assessorId: varchar("assessorId", { length: 100 }), // SME expert ID if applicable
  questions: json("questions"), // Array of { question: string, answer: string, score: number }
  findings: text("findings"),
  score: real("score"), // 0-100 score for this assessment
  recommendation: recommendationEnum("recommendation").default("needs_more_info").notNull(),
  refinementSuggestions: json("refinementSuggestions"), // Array of suggestions
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type IdeaAssessment = typeof ideaAssessments.$inferSelect;
export type InsertIdeaAssessment = typeof ideaAssessments.$inferInsert;

/**
 * Idea Refinements - Flywheel iteration history
 */
export const ideaRefinements = pgTable("idea_refinements", {
  id: serial("id").primaryKey(),
  ideaId: serial("ideaId").notNull(),
  fromStage: serial("fromStage").notNull(),
  toStage: serial("toStage").notNull(),
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
  triggeredBy: triggeredByEnum("triggeredBy").default("assessment").notNull(),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type IdeaRefinement = typeof ideaRefinements.$inferSelect;
export type InsertIdeaRefinement = typeof ideaRefinements.$inferInsert;

/**
 * Investment Scenarios - Budget-based analysis for ideas
 */
export const investmentScenarios = pgTable("investment_scenarios", {
  id: serial("id").primaryKey(),
  ideaId: serial("ideaId").notNull(),
  scenarioName: varchar("scenarioName", { length: 100 }).notNull(), // "Bootstrap", "Seed", "Growth"
  investmentAmount: real("investmentAmount").notNull(),
  currency: varchar("currency", { length: 10 }).default("GBP").notNull(),
  breakdown: json("breakdown"), // { website: number, marketing: number, operations: number, etc. }
  projectedRevenue: json("projectedRevenue"), // { month3: number, month6: number, year1: number }
  projectedProfit: json("projectedProfit"),
  timeToBreakeven: serial("timeToBreakeven"), // Months
  riskLevel: riskLevelEnum("riskLevel").default("medium").notNull(),
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
export const trendRepository = pgTable("trend_repository", {
  id: serial("id").primaryKey(),
  userId: serial("userId").notNull(),
  title: varchar("title", { length: 300 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }), // "technology", "market", "consumer", "regulatory", etc.
  source: varchar("source", { length: 200 }),
  sourceUrl: text("sourceUrl"),
  trendStrength: trendStrengthEnum("trendStrength").default("emerging").notNull(),
  relevanceScore: real("relevanceScore"), // 0-100 how relevant to user's interests
  potentialImpact: potentialImpactEnum("potentialImpact").default("medium").notNull(),
  timeHorizon: varchar("timeHorizon", { length: 50 }), // "3 months", "1 year", "3-5 years"
  relatedIndustries: json("relatedIndustries"), // Array of industries
  keyInsights: json("keyInsights"), // Array of insights
  linkedIdeaIds: json("linkedIdeaIds"), // Ideas generated from this trend
  lastAnalyzedAt: timestamp("lastAnalyzedAt"),
  metadata: json("metadata"),
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
  userId: serial("userId").notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  type: typeEnum("type").notNull(),
  content: text("content"), // JSON stringified content
  classification: classificationEnum("classification").default("internal").notNull(),
  qaStatus: qaStatusEnum("qaStatus").default("pending").notNull(),
  qaApprover: varchar("qaApprover", { length: 200 }),
  qaApprovedAt: timestamp("qaApprovedAt"),
  qaNotes: text("qaNotes"),
  markdownUrl: text("markdownUrl"), // S3 URL to markdown version
  htmlUrl: text("htmlUrl"), // S3 URL to HTML version
  pdfUrl: text("pdfUrl"), // S3 URL to PDF version
  relatedIdeaId: serial("relatedIdeaId"), // Link to innovation idea
  relatedProjectId: serial("relatedProjectId"), // Link to project genesis
  metadata: json("metadata"),
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
  country: countryEnum("country").notNull(),
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
  eligibilityCriteria: json("eligibilityCriteria"), // Array of criteria
  requiredDocuments: json("requiredDocuments"), // Array of required documents
  applicationProcess: json("applicationProcess"), // Steps to apply
  deadlines: json("deadlines"), // Application deadlines
  sectors: json("sectors"), // Eligible sectors
  stages: json("stages"), // Eligible business stages (pre-seed, seed, etc.)
  websiteUrl: text("websiteUrl"),
  applicationUrl: text("applicationUrl"),
  contactEmail: varchar("contactEmail", { length: 320 }),
  successRate: real("successRate"), // Historical success rate percentage
  averageProcessingDays: serial("averageProcessingDays"),
  isActive: boolean("isActive").default(true).notNull(),
  lastUpdated: timestamp("lastUpdated"),
  metadata: json("metadata"),
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
  userId: serial("userId").notNull(),
  ideaId: serial("ideaId").notNull(), // Link to innovation idea
  programId: varchar("programId", { length: 100 }).notNull(), // Link to funding program
  eligibilityScore: real("eligibilityScore"), // 0-100 score
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
  estimatedFunding: real("estimatedFunding"), // Estimated funding amount in AED
  applicationReadiness: real("applicationReadiness"), // 0-100 how ready to apply
  generatedDocuments: json("generatedDocuments"), // Auto-generated application materials
  notes: text("notes"),
  assessedAt: timestamp("assessedAt").defaultNow().notNull(),
  metadata: json("metadata"),
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
  userId: serial("userId").notNull(),
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
  status: statusEnum("status").default("planned").notNull(),
  currency: varchar("currency", { length: 10 }).default("AED").notNull(),
  monthlyRecurring: real("monthlyRecurring").default(0), // MRR for recurring streams
  annualRecurring: real("annualRecurring").default(0), // ARR
  averageTransactionValue: real("averageTransactionValue").default(0),
  transactionsPerMonth: serial("transactionsPerMonth").default(0),
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
  userId: serial("userId").notNull(),
  streamId: serial("streamId").notNull(), // FK to revenueStreams
  transactionDate: timestamp("transactionDate").notNull(),
  amount: real("amount").notNull(),
  currency: varchar("currency", { length: 10 }).default("AED").notNull(),
  status: statusEnum("status").default("pending").notNull(),
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
export const pipelineOpportunities = pgTable("pipeline_opportunities", {
  id: serial("id").primaryKey(),
  userId: serial("userId").notNull(),
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
  probability: serial("probability").default(10), // 0-100%
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
  metadata: json("metadata"),
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
  userId: serial("userId").notNull(),
  streamId: serial("streamId").notNull(), // FK to revenueStreams
  tierName: varchar("tierName", { length: 100 }).notNull(), // e.g., "Starter", "Pro", "Enterprise"
  price: real("price").notNull(),
  currency: varchar("currency", { length: 10 }).default("AED").notNull(),
  billingPeriod: billingPeriodEnum("billingPeriod").notNull(),
  features: json("features"), // Array of features included
  limitations: json("limitations"), // Usage limits, etc.
  isActive: boolean("isActive").default(true).notNull(),
  displayOrder: serial("displayOrder").default(0),
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
  userId: serial("userId").notNull(),
  ventureName: varchar("ventureName", { length: 200 }).notNull(),
  customerName: varchar("customerName", { length: 200 }).notNull(),
  customerType: customerTypeEnum("customerType").default("individual").notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 50 }),
  company: varchar("company", { length: 200 }),
  industry: varchar("industry", { length: 100 }),
  country: varchar("country", { length: 100 }),
  city: varchar("city", { length: 100 }),
  status: statusEnum("status").default("prospect").notNull(),
  lifetimeValue: real("lifetimeValue").default(0),
  currency: varchar("currency", { length: 10 }).default("AED").notNull(),
  acquisitionSource: varchar("acquisitionSource", { length: 200 }),
  acquisitionDate: timestamp("acquisitionDate"),
  churnDate: timestamp("churnDate"),
  churnReason: text("churnReason"),
  stripeCustomerId: varchar("stripeCustomerId", { length: 200 }),
  notes: text("notes"),
  metadata: json("metadata"),
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
  userId: serial("userId").notNull(),
  ventureName: varchar("ventureName", { length: 200 }),
  streamId: serial("streamId"), // Optional FK to specific stream
  forecastPeriod: varchar("forecastPeriod", { length: 20 }).notNull(), // "2026-Q1", "2026-02"
  periodType: periodTypeEnum("periodType").notNull(),
  projectedRevenue: real("projectedRevenue").notNull(),
  actualRevenue: real("actualRevenue"),
  currency: varchar("currency", { length: 10 }).default("AED").notNull(),
  assumptions: text("assumptions"), // What the forecast is based on
  confidence: confidenceEnum("confidence").default("medium"),
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
  userId: serial("userId").notNull(),
  snapshotDate: timestamp("snapshotDate").notNull(),
  totalMRR: real("totalMRR").default(0),
  totalARR: real("totalARR").default(0),
  totalRevenueMTD: real("totalRevenueMTD").default(0),
  totalRevenueYTD: real("totalRevenueYTD").default(0),
  pipelineValue: real("pipelineValue").default(0),
  weightedPipelineValue: real("weightedPipelineValue").default(0),
  activeCustomers: serial("activeCustomers").default(0),
  newCustomersMTD: serial("newCustomersMTD").default(0),
  churnedCustomersMTD: serial("churnedCustomersMTD").default(0),
  averageRevenuePerCustomer: real("averageRevenuePerCustomer").default(0),
  currency: varchar("currency", { length: 10 }).default("AED").notNull(),
  ventureBreakdown: json("ventureBreakdown"), // Revenue by venture
  streamBreakdown: json("streamBreakdown"), // Revenue by stream type
  metadata: json("metadata"),
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
  age: serial("age").notNull(),
  gender: genderEnum("gender").notNull(),
  nationality: varchar("nationality", { length: 100 }).notNull(),
  ethnicity: varchar("ethnicity", { length: 100 }),
  location: varchar("location", { length: 200 }).notNull(), // City, Country
  
  // Professional profile
  occupation: varchar("occupation", { length: 200 }).notNull(),
  industry: varchar("industry", { length: 100 }).notNull(),
  jobLevel: jobLevelEnum("jobLevel").notNull(),
  companySize: companySizeEnum("companySize"),
  annualIncome: mysqlEnum("annualIncome", [
    "under_25k", "25k_50k", "50k_75k", "75k_100k", "100k_150k", 
    "150k_250k", "250k_500k", "500k_1m", "over_1m"
  ]),
  
  // Psychographics
  personalityType: varchar("personalityType", { length: 50 }), // e.g., "INTJ", "Early Adopter", "Pragmatist"
  buyingStyle: buyingStyleEnum("buyingStyle"),
  techSavviness: techSavvinessEnum("techSavviness"),
  riskTolerance: riskToleranceEnum("riskTolerance"),
  
  // Interests and pain points
  interests: json("interests"), // Array of interest areas
  painPoints: json("painPoints"), // Array of common frustrations
  goals: json("goals"), // Array of personal/professional goals
  
  // Bio and context
  bio: text("bio").notNull(), // Detailed background story
  avatar: varchar("avatar", { length: 500 }), // Avatar image URL
  
  // Categorization
  segment: varchar("segment", { length: 100 }), // e.g., "Tech Professional", "Healthcare Worker", "Small Business Owner"
  tier: tierEnum("tier").default("core").notNull(), // For phased rollout
  
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
  userId: serial("userId").notNull(),
  
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
  innovationIdeaId: serial("innovationIdeaId"), // FK to innovation_ideas if validating an idea
  ventureName: varchar("ventureName", { length: 200 }),
  productName: varchar("productName", { length: 200 }),
  
  // Survey configuration
  questions: json("questions").notNull(), // Array of question objects
  targetSegments: json("targetSegments"), // Which customer segments to survey
  sampleSize: serial("sampleSize").default(25), // How many personas to survey
  
  // Status
  status: statusEnum("status").default("draft").notNull(),
  
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
  surveyId: serial("surveyId").notNull(), // FK to customerSurveys
  personaId: serial("personaId").notNull(), // FK to customerPersonas
  
  // Response data
  responses: json("responses").notNull(), // Array of answer objects matching questions
  
  // Sentiment and analysis
  overallSentiment: overallSentimentEnum("overallSentiment"),
  willingnessToPay: willingnessToPayEnum("willingnessToPay"),
  suggestedPricePoint: real("suggestedPricePoint"),
  currency: varchar("currency", { length: 10 }).default("AED"),
  
  // Key insights extracted
  keyInsights: json("keyInsights"), // Array of insight strings
  concerns: json("concerns"), // Array of concern strings
  suggestions: json("suggestions"), // Array of suggestion strings
  
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
  surveyId: serial("surveyId").notNull(), // FK to customerSurveys
  userId: serial("userId").notNull(),
  
  // Aggregate metrics
  totalResponses: serial("totalResponses").default(0),
  averageSentimentScore: real("averageSentimentScore"), // -2 to +2
  
  // Willingness to pay distribution
  wtpDistribution: json("wtpDistribution"), // { definitely_not: 5, unlikely: 10, ... }
  averageSuggestedPrice: real("averageSuggestedPrice"),
  priceRangeMin: real("priceRangeMin"),
  priceRangeMax: real("priceRangeMax"),
  
  // Segment breakdowns
  sentimentBySegment: json("sentimentBySegment"), // { "Tech Professional": 1.5, ... }
  wtpBySegment: json("wtpBySegment"),
  
  // Top insights
  topPositives: json("topPositives"), // Most common positive feedback
  topConcerns: json("topConcerns"), // Most common concerns
  topSuggestions: json("topSuggestions"), // Most common suggestions
  
  // Recommendations
  goNoGoRecommendation: goNoGoRecommendationEnum("goNoGoRecommendation"),
  recommendedPricePoint: real("recommendedPricePoint"),
  keyRecommendations: json("keyRecommendations"), // Array of recommendation strings
  
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
  userId: serial("userId").notNull(),
  
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
  innovationIdeaId: serial("innovationIdeaId"),
  ventureName: varchar("ventureName", { length: 200 }),
  
  // Participants
  participantPersonaIds: json("participantPersonaIds").notNull(), // Array of persona IDs
  participantCount: serial("participantCount").default(0),
  
  // Discussion guide
  discussionGuide: json("discussionGuide"), // Array of discussion topics/questions
  
  // Session output
  transcript: text("transcript"), // Full session transcript
  keyThemes: json("keyThemes"), // Extracted themes
  consensusPoints: json("consensusPoints"), // Points of agreement
  divergencePoints: json("divergencePoints"), // Points of disagreement
  
  // Status
  status: statusEnum("status").default("planned").notNull(),
  
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
  userId: serial("userId").notNull(),
  innovationIdeaId: serial("innovationIdeaId").notNull(), // FK to innovation_ideas
  
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
  surveyId: serial("surveyId"), // FK to customerSurveys
  focusGroupId: serial("focusGroupId"), // FK to focusGroupSessions
  
  // Validation results
  validationScore: real("validationScore"), // 0-100
  passedValidation: boolean("passedValidation"),
  
  // Decision
  decision: decisionEnum("decision").default("pending").notNull(),
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
  categoryNumber: serial("categoryNumber").notNull().unique(), // 1-20
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description").notNull(),
  
  // Scoring guidance
  scoringCriteria: json("scoringCriteria"), // What constitutes each score level
  excellentThreshold: serial("excellentThreshold").default(90), // 90%+
  goodThreshold: serial("goodThreshold").default(75), // 75-89%
  adequateThreshold: serial("adequateThreshold").default(60), // 60-74%
  developingThreshold: serial("developingThreshold").default(40), // 40-59%
  
  // Which panels assess this category
  assessingPanels: json("assessingPanels"), // Array of panel names
  
  // Weighting
  weight: real("weight").default(1.0), // For weighted averages
  priority: priorityEnum("priority").default("medium"),
  
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
  userId: serial("userId").notNull(),
  
  // Assessment period
  assessmentPeriod: varchar("assessmentPeriod", { length: 20 }).notNull(), // e.g., "2026-01", "2026-Q1"
  assessmentDate: timestamp("assessmentDate").notNull(),
  
  // Expert identification
  expertId: varchar("expertId", { length: 100 }).notNull(), // Reference to AI expert
  expertName: varchar("expertName", { length: 200 }).notNull(),
  expertPanel: varchar("expertPanel", { length: 100 }).notNull(), // e.g., "Strategic Advisory", "Technology", "UX"
  expertSpecialization: varchar("expertSpecialization", { length: 200 }),
  
  // Category being assessed
  categoryId: serial("categoryId").notNull(), // FK to kpiCategories
  categoryNumber: serial("categoryNumber").notNull(), // 1-20
  categoryName: varchar("categoryName", { length: 200 }).notNull(),
  
  // Individual score
  score: serial("score").notNull(), // 0-100 percentage
  scoreOutOf10: real("scoreOutOf10"), // Converted to 10-point scale
  
  // Rationale and evidence
  rationale: text("rationale").notNull(), // Why this score
  strengths: json("strengths"), // Array of observed strengths
  weaknesses: json("weaknesses"), // Array of observed weaknesses
  evidence: json("evidence"), // Specific examples supporting the score
  recommendations: json("recommendations"), // Suggestions for improvement
  
  // Confidence
  confidenceLevel: confidenceLevelEnum("confidenceLevel").default("medium"),
  
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
  userId: serial("userId").notNull(),
  
  // Assessment reference
  assessmentId: serial("assessmentId").notNull(), // FK to smeIndividualAssessments
  assessmentPeriod: varchar("assessmentPeriod", { length: 20 }).notNull(),
  
  // Category
  categoryId: serial("categoryId").notNull(),
  categoryNumber: serial("categoryNumber").notNull(),
  categoryName: varchar("categoryName", { length: 200 }).notNull(),
  
  // Expert who gave outlier score
  expertId: varchar("expertId", { length: 100 }).notNull(),
  expertName: varchar("expertName", { length: 200 }).notNull(),
  expertPanel: varchar("expertPanel", { length: 100 }).notNull(),
  
  // Outlier details
  expertScore: serial("expertScore").notNull(),
  panelAverage: real("panelAverage").notNull(),
  overallAverage: real("overallAverage").notNull(),
  deviation: real("deviation").notNull(), // How far from average
  deviationPercentage: real("deviationPercentage").notNull(),
  
  // Classification
  outlierType: outlierTypeEnum("outlierType").notNull(), // Above or below average
  severity: severityEnum("severity").notNull(),
  
  // Review status
  reviewStatus: reviewStatusEnum("reviewStatus").default("pending").notNull(),
  
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
  userId: serial("userId").notNull(),
  
  // Assessment period
  assessmentPeriod: varchar("assessmentPeriod", { length: 20 }).notNull(),
  
  // Panel
  panelName: varchar("panelName", { length: 100 }).notNull(),
  
  // Category
  categoryId: serial("categoryId").notNull(),
  categoryNumber: serial("categoryNumber").notNull(),
  categoryName: varchar("categoryName", { length: 200 }).notNull(),
  
  // Aggregated scores
  averageScore: real("averageScore").notNull(),
  medianScore: real("medianScore"),
  minScore: serial("minScore"),
  maxScore: serial("maxScore"),
  standardDeviation: real("standardDeviation"),
  
  // Individual scores breakdown
  individualScores: json("individualScores"), // Array of { expertId, expertName, score }
  expertCount: serial("expertCount").default(0),
  
  // Consensus level
  consensusLevel: consensusLevelEnum("consensusLevel"),
  
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
  userId: serial("userId").notNull(),
  
  // Snapshot period
  snapshotPeriod: varchar("snapshotPeriod", { length: 20 }).notNull(),
  snapshotDate: timestamp("snapshotDate").notNull(),
  
  // Overall scores
  overallScore: real("overallScore").notNull(),
  previousScore: real("previousScore"),
  scoreChange: real("scoreChange"),
  
  // Category breakdown
  categoryScores: json("categoryScores").notNull(), // Array of { categoryNumber, name, score, change }
  
  // Distribution
  excellentCount: serial("excellentCount").default(0), // 90%+
  goodCount: serial("goodCount").default(0), // 75-89%
  adequateCount: serial("adequateCount").default(0), // 60-74%
  developingCount: serial("developingCount").default(0), // 40-59%
  criticalCount: serial("criticalCount").default(0), // Below 40%
  
  // Key metrics
  highestCategory: varchar("highestCategory", { length: 200 }),
  highestScore: serial("highestScore"),
  lowestCategory: varchar("lowestCategory", { length: 200 }),
  lowestScore: serial("lowestScore"),
  
  // Targets
  targetScore: real("targetScore"),
  gapToTarget: real("gapToTarget"),
  
  // Expert participation
  totalExpertsAssessed: serial("totalExpertsAssessed").default(0),
  panelsParticipated: json("panelsParticipated"), // Array of panel names
  
  // Outliers summary
  outliersIdentified: serial("outliersIdentified").default(0),
  outliersResolved: serial("outliersResolved").default(0),
  
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
  userId: serial("userId").notNull(),
  
  // Context
  outlierId: serial("outlierId"), // FK to assessmentOutliers if from outlier
  assessmentId: serial("assessmentId"), // FK to smeIndividualAssessments
  
  // Expert
  expertId: varchar("expertId", { length: 100 }).notNull(),
  expertName: varchar("expertName", { length: 200 }).notNull(),
  expertPanel: varchar("expertPanel", { length: 100 }).notNull(),
  
  // Category discussed
  categoryNumber: serial("categoryNumber"),
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
  messages: json("messages").notNull(), // Array of { role, content, timestamp }
  
  // Outcomes
  keyInsights: json("keyInsights"), // Array of insights captured
  actionItems: json("actionItems"), // Array of actions to take
  scoreAdjustment: serial("scoreAdjustment"), // If score was adjusted
  
  // Status
  status: statusEnum("status").default("in_progress").notNull(),
  
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
  userId: serial("userId").notNull(),
  
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
  sourceId: serial("sourceId"), // FK to source table based on sourceType
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
  tags: json("tags"), // Array of tag strings
  ventures: json("ventures"), // Array of venture names this applies to
  products: json("products"), // Array of product names
  
  // Relevance
  relevanceScore: real("relevanceScore").default(0.5), // 0-1 how relevant/important
  confidenceLevel: confidenceLevelEnum("confidenceLevel").default("medium"),
  
  // Validation
  validatedBy: varchar("validatedBy", { length: 200 }), // Who validated this insight
  validatedAt: timestamp("validatedAt"),
  
  // Usage tracking
  timesReferenced: serial("timesReferenced").default(0),
  lastReferencedAt: timestamp("lastReferencedAt"),
  
  // Relationships
  relatedInsightIds: json("relatedInsightIds"), // Array of related insight IDs
  supersededBy: serial("supersededBy"), // If this insight was updated/replaced
  
  // Status
  status: statusEnum("status").default("active").notNull(),
  
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
  userId: serial("userId").notNull(),
  
  // Reference details
  title: varchar("title", { length: 500 }).notNull(),
  authors: json("authors"), // Array of author names
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
  keyFindings: json("keyFindings"), // Array of key finding strings
  relevantQuotes: json("relevantQuotes"), // Array of quote objects
  
  // Categorization
  topics: json("topics"), // Array of topic strings
  ventures: json("ventures"), // Which ventures this relates to
  
  // Quality assessment
  credibilityScore: real("credibilityScore").default(0.5), // 0-1
  relevanceScore: real("relevanceScore").default(0.5), // 0-1
  
  // Linked insights
  linkedInsightIds: json("linkedInsightIds"), // Insights derived from this
  
  // Status
  status: statusEnum("status").default("active").notNull(),
  
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
  userId: serial("userId").notNull(),
  
  // What triggered the check
  triggerType: mysqlEnum("triggerType", [
    "new_survey",
    "new_focus_group",
    "new_assessment",
    "new_idea_validation",
    "manual_search"
  ]).notNull(),
  triggerId: serial("triggerId"), // FK to the triggering entity
  
  // Search parameters
  searchQuery: text("searchQuery"),
  searchCategories: json("searchCategories"),
  searchVentures: json("searchVentures"),
  searchTags: json("searchTags"),
  
  // Results
  insightsFound: serial("insightsFound").default(0),
  relevantInsightIds: json("relevantInsightIds"), // Array of matching insight IDs
  externalRefsFound: serial("externalRefsFound").default(0),
  relevantExternalIds: json("relevantExternalIds"), // Array of matching external ref IDs
  
  // Summary
  summaryGenerated: text("summaryGenerated"), // AI generated summary of prior knowledge
  gapsIdentified: json("gapsIdentified"), // What we don't know yet
  
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
  userId: serial("userId").notNull(),
  insightId: serial("insightId").notNull(), // FK to insightsRepository
  
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
  relatedEntityId: serial("relatedEntityId"),
  
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
  parentTopicId: serial("parentTopicId"), // For hierarchical topics
  path: varchar("path", { length: 500 }), // Full path like "Market/Healthcare/Telehealth"
  
  // Description
  description: text("description"),
  
  // Statistics
  insightCount: serial("insightCount").default(0),
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
  userId: serial("userId").notNull(),
  
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
  duration: serial("duration"), // Time spent in milliseconds
  
  // Additional data
  metadata: json("metadata"), // Any additional context
  
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
  userId: serial("userId").notNull(),
  
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
  actionSequence: json("actionSequence").notNull(), // Array of actions in order
  frequency: serial("frequency").default(1), // How often this pattern occurs
  averageDuration: serial("averageDuration"), // Average time to complete
  
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
  userId: serial("userId").notNull(),
  
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
  relatedPatternId: serial("relatedPatternId"), // FK to workflowPatterns
  
  // Priority
  priority: priorityEnum("priority").default("medium"),
  estimatedTimeSaved: serial("estimatedTimeSaved"), // Minutes per week
  
  // Action
  actionUrl: varchar("actionUrl", { length: 500 }), // Where to go to implement
  actionSteps: json("actionSteps"), // Array of steps to take
  
  // Status
  status: statusEnum("status").default("pending").notNull(),
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
  userId: serial("userId").notNull(),
  
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
  score: serial("score").notNull(), // 1-10
  
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
  userId: serial("userId").notNull(),
  
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
  relatedScoreIds: json("relatedScoreIds"), // Array of outputQualityScores IDs
  occurrenceCount: serial("occurrenceCount").default(1), // How many times this issue occurred
  
  // Priority
  priority: priorityEnum("priority").default("medium"),
  impactScore: real("impactScore"), // Calculated from frequency and severity
  
  // Assignment
  assignedTo: varchar("assignedTo", { length: 200 }), // Team or person responsible
  
  // Status
  status: statusEnum("status").default("open").notNull(),
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
  userId: serial("userId").notNull(),
  
  // Period
  snapshotDate: timestamp("snapshotDate").notNull(),
  periodType: periodTypeEnum("periodType").notNull(),
  
  // Overall metrics
  totalOutputs: serial("totalOutputs").default(0),
  scoredOutputs: serial("scoredOutputs").default(0),
  averageScore: real("averageScore"),
  
  // Distribution
  scoreDistribution: json("scoreDistribution"), // { "1": 2, "2": 5, ... "10": 20 }
  
  // By category
  scoresByOutputType: json("scoresByOutputType"), // { "report": 7.5, "document": 8.2 }
  scoresByIssueCategory: json("scoresByIssueCategory"), // Count of issues by category
  
  // Trends
  previousAverageScore: real("previousAverageScore"),
  scoreChange: real("scoreChange"),
  
  // Issues
  openTickets: serial("openTickets").default(0),
  resolvedTickets: serial("resolvedTickets").default(0),
  
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
  userId: serial("userId").notNull(),
  
  // Current level (1-5: Novice, Learning, Competent, Proficient, Expert)
  currentLevel: serial("currentLevel").default(1).notNull(),
  trainingPercentage: real("trainingPercentage").default(20).notNull(), // 0-100
  
  // Module tracking
  completedModules: json("completedModules"), // Array of completed module IDs
  currentModuleId: serial("currentModuleId"),
  
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
  requiredLevel: serial("requiredLevel").default(1).notNull(), // Minimum level to access
  duration: varchar("duration", { length: 50 }), // e.g., "30 min"
  
  // Content
  content: text("content"), // Markdown content
  learningObjectives: json("learningObjectives"), // Array of objectives
  
  // Assessment
  hasAssessment: boolean("hasAssessment").default(false),
  assessmentQuestions: json("assessmentQuestions"), // Quiz questions
  passingScore: serial("passingScore").default(80), // Percentage to pass
  
  // Ordering
  sortOrder: serial("sortOrder").default(0),
  
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
  userId: serial("userId").notNull(),
  
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
  userId: serial("userId").notNull(),
  
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
  examples: json("examples"), // Array of example interactions
  
  // Confidence and validation
  confidenceScore: real("confidenceScore").default(0.5).notNull(), // 0-1
  validatedByUser: boolean("validatedByUser").default(false),
  occurrenceCount: serial("occurrenceCount").default(1), // How many times observed
  
  // Application
  active: boolean("active").default(true), // Is this pattern being applied?
  lastApplied: timestamp("lastApplied"),
  applicationCount: serial("applicationCount").default(0), // How many times applied
  
  // Source tracking
  sourceInteractionIds: json("sourceInteractionIds"), // IDs of interactions that formed this pattern
  
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
  userId: serial("userId").notNull().unique(),
  
  // Core profile
  thinkingStyle: text("thinkingStyle"), // How user approaches problems
  communicationStyle: text("communicationStyle"), // How user communicates
  decisionMakingStyle: text("decisionMakingStyle"), // How user makes decisions
  
  // Priorities and values
  topPriorities: json("topPriorities"), // Array of priorities
  coreValues: json("coreValues"), // Array of values
  qualityStandards: json("qualityStandards"), // What "good" looks like
  
  // Preferences
  formatPreferences: json("formatPreferences"), // Document, communication format preferences
  workflowPreferences: json("workflowPreferences"), // How user likes to work
  communicationPreferences: json("communicationPreferences"), // Communication preferences
  
  // Pet peeves and dislikes
  petPeeves: json("petPeeves"), // Things that annoy user
  avoidPatterns: json("avoidPatterns"), // Things to avoid
  
  // Terminology
  customTerminology: json("customTerminology"), // User-specific terms and meanings
  
  // Model confidence
  overallConfidence: real("overallConfidence").default(0.2), // How confident in the model
  lastMajorUpdate: timestamp("lastMajorUpdate"),
  interactionsProcessed: serial("interactionsProcessed").default(0),
  
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
  userId: serial("userId").notNull(),
  
  // Period
  metricDate: timestamp("metricDate").notNull(),
  periodType: periodTypeEnum("periodType").notNull(),
  
  // Interaction metrics
  totalInteractions: serial("totalInteractions").default(0),
  correctionsReceived: serial("correctionsReceived").default(0),
  approvalsReceived: serial("approvalsReceived").default(0),
  
  // Learning metrics
  newPatternsLearned: serial("newPatternsLearned").default(0),
  patternsReinforced: serial("patternsReinforced").default(0),
  patternsInvalidated: serial("patternsInvalidated").default(0),
  
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
  id: int('id').primaryKey().autoincrement(),
  userId: int('user_id').notNull(),
  questionId: varchar('question_id', { length: 10 }).notNull(), // e.g., "A51", "B72"
  questionType: mysqlEnum('question_type', ['scale', 'boolean']).notNull(),
  scaleValue: int('scale_value'), // 1-10 for scale questions
  booleanValue: boolean('boolean_value'), // true/false for Y/N questions
  section: varchar('section', { length: 100 }), // e.g., "Business Operations", "Innovation"
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
});
export type QuestionnaireResponse = typeof questionnaireResponses.$inferSelect;
export type InsertQuestionnaireResponse = typeof questionnaireResponses.$inferInsert;

// Digital Twin Profile (calculated from questionnaire)
export const digitalTwinProfile = pgTable('digital_twin_profile', {
  id: int('id').primaryKey().autoincrement(),
  userId: int('user_id').notNull().unique(),
  // Execution DNA
  measurementDriven: int('measurement_driven'), // 1-10
  processStandardization: int('process_standardization'),
  automationPreference: int('automation_preference'),
  ambiguityTolerance: int('ambiguity_tolerance'),
  // Technology Philosophy
  techAdoptionSpeed: int('tech_adoption_speed'),
  aiBeliefLevel: int('ai_belief_level'),
  dataVsIntuition: int('data_vs_intuition'),
  buildVsBuy: mysqlEnum('build_vs_buy', ['build', 'buy', 'balanced']),
  // Market Strategy
  nicheVsMass: int('niche_vs_mass'),
  firstMoverVsFollower: int('first_mover_vs_follower'),
  organicVsMA: mysqlEnum('organic_vs_ma', ['organic', 'ma', 'balanced']),
  // Work Style
  structurePreference: int('structure_preference'),
  interruptionTolerance: int('interruption_tolerance'),
  batchingPreference: int('batching_preference'),
  locationPreference: mysqlEnum('location_preference', ['home', 'office', 'varied']),
  // Strategic Mindset
  scenarioPlanningLevel: int('scenario_planning_level'),
  pivotComfort: int('pivot_comfort'),
  trendLeadership: int('trend_leadership'),
  portfolioDiversification: int('portfolio_diversification'),
  // Calculated Scores
  cosUnderstandingLevel: int('cos_understanding_level').default(0), // 0-100
  questionnaireCompletion: int('questionnaire_completion').default(0), // 0-100 percentage
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
  id: int('id').primaryKey().autoincrement(),
  userId: int('user_id').notNull(),
  score: int('score').notNull(), // 0-10 NPS scale
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
  id: int('id').primaryKey().autoincrement(),
  userId: int('user_id').notNull(),
  healthScore: int('health_score').notNull(), // 0-100
  engagementLevel: mysqlEnum('engagement_level', ['low', 'medium', 'high', 'champion']).notNull(),
  lastActiveDate: timestamp('last_active_date'),
  featureAdoption: json('feature_adoption'), // Which features they use
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
  id: int('id').primaryKey().autoincrement(),
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
  id: int('id').primaryKey().autoincrement(),
  teamMember: varchar('team_member', { length: 200 }).notNull(),
  role: varchar('role', { length: 100 }).notNull(),
  skillCategory: varchar('skill_category', { length: 100 }).notNull(), // e.g., "Technical", "Leadership"
  skillName: varchar('skill_name', { length: 200 }).notNull(),
  currentLevel: int('current_level').notNull(), // 1-5
  targetLevel: int('target_level'), // 1-5
  gap: int('gap'), // Calculated difference
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
  id: int('id').primaryKey().autoincrement(),
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
  id: int('id').primaryKey().autoincrement(),
  userId: int('user_id').notNull(),
  contextType: mysqlEnum('context_type', ['conversation', 'document', 'preference', 'decision', 'memory']).notNull(),
  content: text('content').notNull(),
  embedding: json('embedding'), // Vector embedding for similarity search
  metadata: json('metadata'),
  relevanceScore: float('relevance_score'),
  accessCount: int('access_count').default(0),
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
  projectId: serial("projectId").notNull(), // FK to project_genesis
  phaseNumber: serial("phaseNumber").notNull(), // 1-6
  phaseName: varchar("phaseName", { length: 100 }).notNull(),
  status: statusEnum("status").default("not_started").notNull(),
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  assignedTeam: json("assignedTeam"), // Array of user IDs and expert IDs
  deliverables: json("deliverables"), // Array of deliverable objects
  notes: text("notes"),
  metadata: json("metadata"),
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
  phaseId: serial("phaseId").notNull(), // FK to project_genesis_phases
  projectId: serial("projectId").notNull(), // FK to project_genesis
  milestoneName: varchar("milestoneName", { length: 200 }).notNull(),
  description: text("description"),
  dueDate: timestamp("dueDate"),
  status: statusEnum("status").default("pending").notNull(),
  completedAt: timestamp("completedAt"),
  completedBy: serial("completedBy"), // User ID
  notes: text("notes"),
  metadata: json("metadata"),
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
  phaseId: serial("phaseId").notNull(), // FK to project_genesis_phases
  projectId: serial("projectId").notNull(), // FK to project_genesis
  deliverableName: varchar("deliverableName", { length: 200 }).notNull(),
  deliverableType: varchar("deliverableType", { length: 100 }).notNull(), // "document", "presentation", "model", "report"
  description: text("description"),
  fileUrl: varchar("fileUrl", { length: 500 }),
  status: statusEnum("status").default("draft").notNull(),
  createdBy: serial("createdBy"), // User ID
  reviewedBy: serial("reviewedBy"), // User ID
  approvedBy: serial("approvedBy"), // User ID
  reviewNotes: text("reviewNotes"),
  metadata: json("metadata"),
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
  gateNumber: serial("gateNumber").notNull(), // 1-6 (G1-G6)
  gateName: varchar("gateName", { length: 100 }).notNull(),
  criteriaName: varchar("criteriaName", { length: 200 }).notNull(),
  description: text("description"),
  weight: real("weight").default(1.0), // Importance weight
  passingScore: serial("passingScore").default(70), // Minimum score to pass
  evaluationType: varchar("evaluationType", { length: 50 }).notNull(), // "automated", "manual", "hybrid"
  metadata: json("metadata"),
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
  projectId: serial("projectId").notNull(), // FK to project_genesis
  gateNumber: serial("gateNumber").notNull(), // 1-6
  criteriaId: serial("criteriaId").notNull(), // FK to quality_gate_criteria
  score: serial("score").notNull(), // 0-100
  passed: boolean("passed").notNull(),
  evaluatedBy: serial("evaluatedBy"), // User ID or "system"
  evaluationNotes: text("evaluationNotes"),
  evidence: json("evidence"), // Supporting evidence/documents
  metadata: json("metadata"),
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
  objectives: json("objectives"), // Array of objectives
  phases: json("phases"), // Array of phase objects
  deliverables: json("deliverables"), // Array of deliverable templates
  resources: json("resources"), // Required resources
  estimatedDuration: serial("estimatedDuration"), // Hours
  complexity: complexityEnum("complexity").default("medium"),
  tags: json("tags"), // Array of tags
  fileUrl: varchar("fileUrl", { length: 500 }),
  version: varchar("version", { length: 20 }).default("1.0"),
  status: statusEnum("status").default("active").notNull(),
  createdBy: serial("createdBy"),
  metadata: json("metadata"),
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
  blueprintId: serial("blueprintId").notNull(), // FK to blueprint_library
  projectId: serial("projectId"), // FK to project_genesis (optional)
  userId: serial("userId").notNull(),
  executionName: varchar("executionName", { length: 300 }).notNull(),
  status: statusEnum("status").default("planning").notNull(),
  currentPhase: serial("currentPhase").default(1),
  progress: serial("progress").default(0), // 0-100
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  phaseData: json("phaseData"), // Current state of each phase
  deliverableData: json("deliverableData"), // Generated deliverables
  notes: text("notes"),
  metadata: json("metadata"),
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
  topics: json("topics").$type<string[]>(),
  requiredReading: json("required_reading").$type<string[]>(),
  practicalExercises: json("practical_exercises").$type<any[]>(),
  competencyAssessment: json("competency_assessment").$type<string[]>(),
  prerequisites: json("prerequisites").$type<number[]>(), // module numbers
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

// =============================================================================
// DIGITAL TWIN PROFILES
// =============================================================================

/**
 * Digital Twins - User's AI Chief of Staff profile
 */
export const digitalTwins = pgTable("digital_twins", {
  id: serial("id").primaryKey(),
  userId: serial("userId").notNull().unique(),
  
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
  strategicThinking: serial("strategicThinking").default(20).notNull(),
  executiveCommunication: serial("executiveCommunication").default(20).notNull(),
  operationalExcellence: serial("operationalExcellence").default(20).notNull(),
  dataAnalytics: serial("dataAnalytics").default(20).notNull(),
  leadershipDevelopment: serial("leadershipDevelopment").default(20).notNull(),
  crisisManagement: serial("crisisManagement").default(20).notNull(),
  innovationStrategy: serial("innovationStrategy").default(20).notNull(),
  stakeholderManagement: serial("stakeholderManagement").default(20).notNull(),
  
  // Overall competency
  overallCompetency: serial("overallCompetency").default(20).notNull(),
  
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
  userId: serial("userId").notNull(),
  
  // Decision details
  decisionType: varchar("decisionType", { length: 100 }).notNull(),
  decisionContext: text("decisionContext").notNull(),
  decisionMade: text("decisionMade").notNull(),
  reasoning: text("reasoning"),
  
  // Outcome tracking
  outcome: text("outcome"),
  outcomeRating: serial("outcomeRating"), // 1-5
  lessonsLearned: text("lessonsLearned"),
  
  // Metadata
  relatedModule: serial("relatedModule"), // Training module ID
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
  expertise: json("expertise").$type<string[]>(), // Array of expertise areas
  
  // Description
  bio: text("bio"),
  specialization: text("specialization"),
  
  // Availability
  isActive: boolean("isActive").default(true).notNull(),
  consultationCount: serial("consultationCount").default(0).notNull(),
  
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
  userId: serial("userId").notNull(),
  expertId: serial("expertId").notNull(),
  
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
  conversationHistory: json("conversationHistory").$type<any[]>(),
  
  // Rating
  rating: serial("rating"), // 1-5
  feedback: text("feedback"),
  
  // Metadata
  duration: serial("duration"), // seconds
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});
export type AiSmeConsultation = typeof aiSmeConsultations.$inferSelect;
export type InsertAiSmeConsultation = typeof aiSmeConsultations.$inferInsert;
