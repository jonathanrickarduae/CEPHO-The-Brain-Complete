import { eq, desc, and, gte, lte, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { ENV } from "./_core/env";
import { logger } from "./utils/logger";

const log = logger.module('Database');
import { InsertUser, users, moodHistory, InsertMoodHistory, MoodHistory, conversations, InsertConversation, Conversation,
  expertConversations, InsertExpertConversation, ExpertConversation,
  expertMemory, InsertExpertMemory, ExpertMemory,
  expertPromptEvolution, InsertExpertPromptEvolution, ExpertPromptEvolution,
  expertInsights, InsertExpertInsight, ExpertInsight,
  expertResearchTasks, InsertExpertResearchTask, ExpertResearchTask,
  expertCollaboration, InsertExpertCollaboration, ExpertCollaboration,
  expertCoachingSessions, InsertExpertCoachingSession, ExpertCoachingSession,
  expertDomainKnowledge, InsertExpertDomainKnowledge, ExpertDomainKnowledge,
  expertConsultations, InsertExpertConsultation, ExpertConsultation,
  expertChatSessions, InsertExpertChatSession, ExpertChatSession,
  expertChatMessages, InsertExpertChatMessage, ExpertChatMessage,
  businessPlanReviewVersions, InsertBusinessPlanReviewVersion, BusinessPlanReviewVersion,
  expertFollowUpQuestions, InsertExpertFollowUpQuestion, ExpertFollowUpQuestion,
  collaborativeReviewSessions, InsertCollaborativeReviewSession, CollaborativeReviewSession,
  collaborativeReviewParticipants, InsertCollaborativeReviewParticipant, CollaborativeReviewParticipant,
  collaborativeReviewComments, InsertCollaborativeReviewComment, CollaborativeReviewComment,
  collaborativeReviewActivity, InsertCollaborativeReviewActivity, CollaborativeReviewActivity,
  eveningReviewSessions, InsertEveningReviewSession, EveningReviewSession,
  eveningReviewTaskDecisions, InsertEveningReviewTaskDecision, EveningReviewTaskDecision,
  reviewTimingPatterns, InsertReviewTimingPattern, ReviewTimingPattern,
  signalItems, InsertSignalItem, SignalItem,
  calendarEventsCache, InsertCalendarEventCache, CalendarEventCache,
  generatedDocuments, InsertGeneratedDocument, GeneratedDocument
} from "../drizzle/schema";

import {
  cephoWorkflows,
  CephoWorkflow,
  InsertCephoWorkflow,
  cephoWorkflowSteps,
  CephoWorkflowStep,
  InsertCephoWorkflowStep,
  cephoWorkflowValidations,
  CephoWorkflowValidation,
  InsertCephoWorkflowValidation
} from "../drizzle/workflow-schema";

let _db: ReturnType<typeof drizzle> | null = null;
let _client: ReturnType<typeof postgres> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db) {
    if (!process.env.DATABASE_URL) {
      log.error("DATABASE_URL is not set");
      return null;
    }
    
    try {
      log.info("Initializing database connection");
      // Configure postgres client for Supabase/PgBouncer compatibility
      // Use PgBouncer port (6543) with proper configuration
      _client = postgres(process.env.DATABASE_URL, {
        prepare: false, // Required for PgBouncer - disables prepared statements
        ssl: process.env.NODE_ENV === 'production' ? 'require' : false,
        connection: {
          application_name: 'cepho-brain',
        },
        max: 10, // Connection pool size
        idle_timeout: 20, // Close idle connections after 20s
        connect_timeout: 10, // Connection timeout
      });
      _db = drizzle(_client);
      log.info("Database connection initialized");
    } catch (error) {
      log.error("Failed to connect to database", error);
      _db = null;
    }
  }
  return _db;
}

// Get raw postgres client for SQL queries
export async function getRawClient() {
  if (!_client) {
    await getDb(); // Initialize if not already done
  }
  return _client;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    log.warn("Cannot upsert user: database not available");
    return;
  }

  // Declare values and updateSet outside try block for error logging
  let values: InsertUser = {
    openId: user.openId,
  };
  let updateSet: Record<string, unknown> = {};

  try {

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }
    
    // Always update updatedAt on conflict
    updateSet.updatedAt = new Date();

    // Log values before insert for debugging
    log.debug('Upserting user with values:', JSON.stringify({
      openId: values.openId,
      name: values.name,
      email: values.email,
      loginMethod: values.loginMethod,
      lastSignedIn: values.lastSignedIn
    }, null, 2));

    // Use Drizzle's insert with onConflictDoUpdate
    // This uses the existing db connection which is already configured correctly
    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.openId,
      set: updateSet,
    });
    
    log.debug('User upserted successfully');
  } catch (error) {
    log.error("Failed to upsert user:", error);
    log.error("Error details:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : 'N/A',
      code: (error as any)?.code,
      detail: (error as any)?.detail,
      constraint: (error as any)?.constraint,
    });
    log.error("Attempted values:", JSON.stringify(values, null, 2));
    log.error("Update set:", JSON.stringify(updateSet, null, 2));
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    log.warn("Cannot get user: database not available");
    return undefined;
  }

  try {
    const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error(`[Database] getUserByOpenId error:`, error);
    throw error;
  }
}

// ==================== MOOD HISTORY ====================

export async function createMoodEntry(entry: InsertMoodHistory): Promise<MoodHistory | null> {
  const db = await getDb();
  if (!db) {
    log.warn("Cannot create mood entry: database not available");
    return null;
  }

  try {
    const result = await db.insert(moodHistory).values(entry);
    const insertId = result[0].insertId;
    const [newEntry] = await db.select().from(moodHistory).where(eq(moodHistory.id, insertId));
    return newEntry;
  } catch (error) {
    log.error("Failed to create mood entry:", error);
    throw error;
  }
}

export async function getMoodHistory(
  userId: number,
  options?: { limit?: number; startDate?: Date; endDate?: Date }
): Promise<MoodHistory[]> {
  const db = await getDb();
  if (!db) {
    log.warn("Cannot get mood history: database not available");
    return [];
  }

  try {
    // Build conditions array
    const conditions = [eq(moodHistory.userId, userId)];
    
    if (options?.startDate) {
      conditions.push(gte(moodHistory.createdAt, options.startDate));
    }
    if (options?.endDate) {
      conditions.push(lte(moodHistory.createdAt, options.endDate));
    }
    
    const results = await db.select()
      .from(moodHistory)
      .where(and(...conditions))
      .orderBy(desc(moodHistory.createdAt))
      .limit(options?.limit || 100);
    
    return results;
  } catch (error) {
    log.error("Failed to get mood history:", error);
    return [];
  }
}

export async function getMoodTrends(userId: number, days: number = 30): Promise<{
  averageScore: number;
  moodByTimeOfDay: Record<string, number>;
  trend: 'improving' | 'declining' | 'stable';
  totalEntries: number;
}> {
  const db = await getDb();
  if (!db) {
    return { averageScore: 0, moodByTimeOfDay: {}, trend: 'stable', totalEntries: 0 };
  }

  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const entries = await db.select()
      .from(moodHistory)
      .where(and(
        eq(moodHistory.userId, userId),
        gte(moodHistory.createdAt, startDate)
      ))
      .orderBy(moodHistory.createdAt);

    if (entries.length === 0) {
      return { averageScore: 0, moodByTimeOfDay: {}, trend: 'stable', totalEntries: 0 };
    }

    // Calculate average
    const averageScore = entries.reduce((sum, e) => sum + e.score, 0) / entries.length;

    // Calculate by time of day
    const moodByTimeOfDay: Record<string, { sum: number; count: number }> = {
      morning: { sum: 0, count: 0 },
      afternoon: { sum: 0, count: 0 },
      evening: { sum: 0, count: 0 },
    };
    
    entries.forEach(e => {
      if (moodByTimeOfDay[e.timeOfDay]) {
        moodByTimeOfDay[e.timeOfDay].sum += e.score;
        moodByTimeOfDay[e.timeOfDay].count++;
      }
    });

    const averagedByTime: Record<string, number> = {};
    Object.entries(moodByTimeOfDay).forEach(([key, val]) => {
      averagedByTime[key] = val.count > 0 ? val.sum / val.count : 0;
    });

    // Calculate trend (compare first half to second half)
    const midpoint = Math.floor(entries.length / 2);
    const firstHalf = entries.slice(0, midpoint);
    const secondHalf = entries.slice(midpoint);
    
    const firstAvg = firstHalf.length > 0 
      ? firstHalf.reduce((sum, e) => sum + e.score, 0) / firstHalf.length 
      : 0;
    const secondAvg = secondHalf.length > 0 
      ? secondHalf.reduce((sum, e) => sum + e.score, 0) / secondHalf.length 
      : 0;
    
    let trend: 'improving' | 'declining' | 'stable' = 'stable';
    if (secondAvg - firstAvg > 0.5) trend = 'improving';
    else if (firstAvg - secondAvg > 0.5) trend = 'declining';

    return {
      averageScore: Math.round(averageScore * 10) / 10,
      moodByTimeOfDay: averagedByTime,
      trend,
      totalEntries: entries.length,
    };
  } catch (error) {
    log.error("Failed to get mood trends:", error);
    return { averageScore: 0, moodByTimeOfDay: {}, trend: 'stable', totalEntries: 0 };
  }
}

export async function getLastMoodCheck(
  userId: number,
  timeOfDay: 'morning' | 'afternoon' | 'evening'
): Promise<MoodHistory | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const [entry] = await db.select()
      .from(moodHistory)
      .where(and(
        eq(moodHistory.userId, userId),
        eq(moodHistory.timeOfDay, timeOfDay),
        gte(moodHistory.createdAt, today)
      ))
      .limit(1);
    
    return entry || null;
  } catch (error) {
    log.error("Failed to get last mood check:", error);
    return null;
  }
}

// ==================== CONVERSATIONS ====================

export async function saveConversation(entry: InsertConversation): Promise<Conversation | null> {
  const db = await getDb();
  if (!db) {
    log.warn("Cannot save conversation: database not available");
    return null;
  }

  try {
    const result = await db.insert(conversations).values(entry);
    const insertId = result[0].insertId;
    const [newEntry] = await db.select().from(conversations).where(eq(conversations.id, insertId));
    return newEntry;
  } catch (error) {
    log.error("Failed to save conversation:", error);
    throw error;
  }
}

export async function getConversationHistory(
  userId: number,
  limit: number = 50
): Promise<Conversation[]> {
  const db = await getDb();
  if (!db) {
    log.warn("Cannot get conversation history: database not available");
    return [];
  }

  try {
    const results = await db.select()
      .from(conversations)
      .where(eq(conversations.userId, userId))
      .orderBy(desc(conversations.createdAt))
      .limit(limit);
    
    // Return in chronological order
    return results.reverse();
  } catch (error) {
    log.error("Failed to get conversation history:", error);
    return [];
  }
}

export async function clearConversationHistory(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    await db.delete(conversations).where(eq(conversations.userId, userId));
  } catch (error) {
    log.error("Failed to clear conversation history:", error);
  }
}

// Add feature-specific database queries as needed


// ==================== INTEGRATIONS ====================

import { 
  integrations, InsertIntegration, Integration,
  notifications, InsertNotification, Notification,
  projects, InsertProject, Project,
  projectGenesis, InsertProjectGenesis, ProjectGenesisRecord,
  userSettings, InsertUserSettings, UserSettings,
  trainingDocuments, InsertTrainingDocument, TrainingDocument,
  memoryBank, InsertMemoryBank, MemoryBank,
  decisionPatterns, InsertDecisionPattern, DecisionPattern,
  feedbackHistory, InsertFeedbackHistory, FeedbackHistory,
  tasks, InsertTask, Task,
  universalInbox, InsertUniversalInboxItem, UniversalInboxItem,
  auditLog, InsertAuditLog, AuditLog,
} from "../drizzle/schema";

// ==================== INTEGRATIONS ====================

export async function createIntegration(data: InsertIntegration): Promise<Integration | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.insert(integrations).values(data);
    const insertId = result[0].insertId;
    const [newEntry] = await db.select().from(integrations).where(eq(integrations.id, insertId));
    return newEntry;
  } catch (error) {
    log.error("Failed to create integration:", error);
    throw error;
  }
}

export async function getIntegrations(userId: number): Promise<Integration[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select()
      .from(integrations)
      .where(eq(integrations.userId, userId))
      .orderBy(desc(integrations.updatedAt));
  } catch (error) {
    log.error("Failed to get integrations:", error);
    return [];
  }
}

export async function updateIntegration(id: number, data: Partial<InsertIntegration>): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    await db.update(integrations).set(data).where(eq(integrations.id, id));
  } catch (error) {
    log.error("Failed to update integration:", error);
    throw error;
  }
}

export async function deleteIntegration(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    await db.delete(integrations).where(eq(integrations.id, id));
  } catch (error) {
    log.error("Failed to delete integration:", error);
    throw error;
  }
}

// ==================== NOTIFICATIONS ====================

export async function createNotification(data: InsertNotification): Promise<Notification | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.insert(notifications).values(data);
    const insertId = result[0].insertId;
    const [newEntry] = await db.select().from(notifications).where(eq(notifications.id, insertId));
    return newEntry;
  } catch (error) {
    log.error("Failed to create notification:", error);
    throw error;
  }
}

export async function getNotifications(userId: number, options?: { unreadOnly?: boolean; limit?: number }): Promise<Notification[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    const conditions = [eq(notifications.userId, userId)];
    if (options?.unreadOnly) {
      conditions.push(eq(notifications.read, false));
    }

    return await db.select()
      .from(notifications)
      .where(and(...conditions))
      .orderBy(desc(notifications.createdAt))
      .limit(options?.limit || 50);
  } catch (error) {
    log.error("Failed to get notifications:", error);
    return [];
  }
}

export async function markNotificationRead(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    await db.update(notifications).set({ read: true, readAt: new Date() }).where(eq(notifications.id, id));
  } catch (error) {
    log.error("Failed to mark notification read:", error);
  }
}

export async function markAllNotificationsRead(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    await db.update(notifications)
      .set({ read: true, readAt: new Date() })
      .where(and(eq(notifications.userId, userId), eq(notifications.read, false)));
  } catch (error) {
    log.error("Failed to mark all notifications read:", error);
  }
}

// ==================== PROJECTS ====================

export async function createProject(data: InsertProject): Promise<Project | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.insert(projects).values(data);
    const insertId = result[0].insertId;
    const [newEntry] = await db.select().from(projects).where(eq(projects.id, insertId));
    return newEntry;
  } catch (error) {
    log.error("Failed to create project:", error);
    throw error;
  }
}

export async function getProjects(userId: number, options?: { status?: string; limit?: number }): Promise<Project[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    const conditions = [eq(projects.userId, userId)];
    // Note: status filter would need type casting, simplified for now

    return await db.select()
      .from(projects)
      .where(and(...conditions))
      .orderBy(desc(projects.updatedAt))
      .limit(options?.limit || 100);
  } catch (error) {
    log.error("Failed to get projects:", error);
    return [];
  }
}

export async function updateProject(id: number, data: Partial<InsertProject>): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    await db.update(projects).set(data).where(eq(projects.id, id));
  } catch (error) {
    log.error("Failed to update project:", error);
    throw error;
  }
}

// ==================== PROJECT GENESIS ====================

export async function createProjectGenesis(data: InsertProjectGenesis): Promise<ProjectGenesisRecord | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.insert(projectGenesis).values(data);
    const insertId = result[0].insertId;
    const [newEntry] = await db.select().from(projectGenesis).where(eq(projectGenesis.id, insertId));
    return newEntry;
  } catch (error) {
    log.error("Failed to create project genesis:", error);
    throw error;
  }
}

export async function getProjectGenesisRecords(userId: number): Promise<ProjectGenesisRecord[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select()
      .from(projectGenesis)
      .where(eq(projectGenesis.userId, userId))
      .orderBy(desc(projectGenesis.updatedAt));
  } catch (error) {
    log.error("Failed to get project genesis records:", error);
    return [];
  }
}

export async function updateProjectGenesis(id: number, data: Partial<InsertProjectGenesis>): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    await db.update(projectGenesis).set(data).where(eq(projectGenesis.id, id));
  } catch (error) {
    log.error("Failed to update project genesis:", error);
    throw error;
  }
}

// ==================== USER SETTINGS ====================

export async function getUserSettings(userId: number): Promise<UserSettings | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const [settings] = await db.select()
      .from(userSettings)
      .where(eq(userSettings.userId, userId))
      .limit(1);
    return settings || null;
  } catch (error) {
    log.error("Failed to get user settings:", error);
    return null;
  }
}

export async function upsertUserSettings(data: InsertUserSettings): Promise<UserSettings | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    await db.insert(userSettings).values(data).onConflictDoUpdate({
      target: userSettings.userId,
      set: { ...data, updatedAt: new Date() },
    });
    return getUserSettings(data.userId);
  } catch (error) {
    log.error("Failed to upsert user settings:", error);
    throw error;
  }
}

// ==================== TRAINING DOCUMENTS ====================

export async function createTrainingDocument(data: InsertTrainingDocument): Promise<TrainingDocument | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.insert(trainingDocuments).values(data);
    const insertId = result[0].insertId;
    const [newEntry] = await db.select().from(trainingDocuments).where(eq(trainingDocuments.id, insertId));
    return newEntry;
  } catch (error) {
    log.error("Failed to create training document:", error);
    throw error;
  }
}

export async function getTrainingDocuments(userId: number): Promise<TrainingDocument[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select()
      .from(trainingDocuments)
      .where(eq(trainingDocuments.userId, userId))
      .orderBy(desc(trainingDocuments.createdAt));
  } catch (error) {
    log.error("Failed to get training documents:", error);
    return [];
  }
}

// ==================== MEMORY BANK ====================

export async function createMemory(data: InsertMemoryBank): Promise<MemoryBank | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.insert(memoryBank).values(data);
    const insertId = result[0].insertId;
    const [newEntry] = await db.select().from(memoryBank).where(eq(memoryBank.id, insertId));
    return newEntry;
  } catch (error) {
    log.error("Failed to create memory:", error);
    throw error;
  }
}

export async function getMemories(userId: number, category?: string): Promise<MemoryBank[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    const conditions = [eq(memoryBank.userId, userId)];
    // Category filter would need type casting

    return await db.select()
      .from(memoryBank)
      .where(and(...conditions))
      .orderBy(desc(memoryBank.updatedAt));
  } catch (error) {
    log.error("Failed to get memories:", error);
    return [];
  }
}

export async function updateMemory(id: number, data: Partial<InsertMemoryBank>): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    await db.update(memoryBank).set({ ...data, lastAccessed: new Date() }).where(eq(memoryBank.id, id));
  } catch (error) {
    log.error("Failed to update memory:", error);
  }
}

// ==================== DECISION PATTERNS ====================

export async function recordDecision(data: InsertDecisionPattern): Promise<DecisionPattern | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.insert(decisionPatterns).values(data);
    const insertId = result[0].insertId;
    const [newEntry] = await db.select().from(decisionPatterns).where(eq(decisionPatterns.id, insertId));
    return newEntry;
  } catch (error) {
    log.error("Failed to record decision:", error);
    throw error;
  }
}

export async function getDecisionPatterns(userId: number, limit: number = 100): Promise<DecisionPattern[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select()
      .from(decisionPatterns)
      .where(eq(decisionPatterns.userId, userId))
      .orderBy(desc(decisionPatterns.createdAt))
      .limit(limit);
  } catch (error) {
    log.error("Failed to get decision patterns:", error);
    return [];
  }
}

// ==================== FEEDBACK HISTORY ====================

export async function recordFeedback(data: InsertFeedbackHistory): Promise<FeedbackHistory | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.insert(feedbackHistory).values(data);
    const insertId = result[0].insertId;
    const [newEntry] = await db.select().from(feedbackHistory).where(eq(feedbackHistory.id, insertId));
    return newEntry;
  } catch (error) {
    log.error("Failed to record feedback:", error);
    throw error;
  }
}

export async function getFeedbackHistory(userId: number, options?: { expertId?: string; limit?: number }): Promise<FeedbackHistory[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    const conditions = [eq(feedbackHistory.userId, userId)];
    if (options?.expertId) {
      conditions.push(eq(feedbackHistory.expertId, options.expertId));
    }

    return await db.select()
      .from(feedbackHistory)
      .where(and(...conditions))
      .orderBy(desc(feedbackHistory.createdAt))
      .limit(options?.limit || 100);
  } catch (error) {
    log.error("Failed to get feedback history:", error);
    return [];
  }
}

// ==================== TASKS ====================

export async function createTask(data: InsertTask): Promise<Task | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.insert(tasks).values(data);
    const insertId = result[0].insertId;
    const [newEntry] = await db.select().from(tasks).where(eq(tasks.id, insertId));
    return newEntry;
  } catch (error) {
    log.error("Failed to create task:", error);
    throw error;
  }
}

export async function getTasks(userId: number, options?: { projectId?: number; status?: string; limit?: number }): Promise<Task[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    const conditions = [eq(tasks.userId, userId)];
    if (options?.projectId) {
      conditions.push(eq(tasks.projectId, options.projectId));
    }

    return await db.select()
      .from(tasks)
      .where(and(...conditions))
      .orderBy(desc(tasks.updatedAt))
      .limit(options?.limit || 100);
  } catch (error) {
    log.error("Failed to get tasks:", error);
    return [];
  }
}

export async function updateTask(id: number, data: Partial<InsertTask>): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    await db.update(tasks).set(data).where(eq(tasks.id, id));
  } catch (error) {
    log.error("Failed to update task:", error);
    throw error;
  }
}

// ==================== UNIVERSAL INBOX ====================

export async function createInboxItem(data: InsertUniversalInboxItem): Promise<UniversalInboxItem | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.insert(universalInbox).values(data);
    const insertId = result[0].insertId;
    const [newEntry] = await db.select().from(universalInbox).where(eq(universalInbox.id, insertId));
    return newEntry;
  } catch (error) {
    log.error("Failed to create inbox item:", error);
    throw error;
  }
}

export async function getInboxItems(userId: number, options?: { status?: string; limit?: number }): Promise<UniversalInboxItem[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    const conditions = [eq(universalInbox.userId, userId)];

    return await db.select()
      .from(universalInbox)
      .where(and(...conditions))
      .orderBy(desc(universalInbox.receivedAt))
      .limit(options?.limit || 100);
  } catch (error) {
    log.error("Failed to get inbox items:", error);
    return [];
  }
}

export async function updateInboxItem(id: number, data: Partial<InsertUniversalInboxItem>): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    await db.update(universalInbox).set(data).where(eq(universalInbox.id, id));
  } catch (error) {
    log.error("Failed to update inbox item:", error);
    throw error;
  }
}

// ==================== AUDIT LOG ====================

export async function createAuditEntry(data: InsertAuditLog): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    await db.insert(auditLog).values(data);
  } catch (error) {
    log.error("Failed to create audit entry:", error);
    // Don't throw - audit logging should not break main flow
  }
}

export async function getAuditLog(userId: number, options?: { limit?: number; action?: string }): Promise<AuditLog[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    const conditions = [eq(auditLog.userId, userId)];
    if (options?.action) {
      conditions.push(eq(auditLog.action, options.action));
    }

    return await db.select()
      .from(auditLog)
      .where(and(...conditions))
      .orderBy(desc(auditLog.createdAt))
      .limit(options?.limit || 100);
  } catch (error) {
    log.error("Failed to get audit log:", error);
    return [];
  }
}


// ==================== VOICE NOTES ====================
import { voiceNotes, InsertVoiceNote, VoiceNote } from "../drizzle/schema";

export async function createVoiceNote(data: InsertVoiceNote) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.insert(voiceNotes).values(data);
  return { id: result[0].insertId, ...data };
}

export async function getVoiceNotes(userId: number, options?: { 
  category?: string; 
  search?: string;
  limit?: number;
  projectId?: number;
}) {
  const db = await getDb();
  if (!db) return [];
  
  // Build conditions array
  const conditions = [eq(voiceNotes.userId, userId)];
  
  if (options?.category) {
    conditions.push(eq(voiceNotes.category, options.category as any));
  }
  
  if (options?.projectId) {
    conditions.push(eq(voiceNotes.projectId, options.projectId));
  }
  
  const results = await db.select().from(voiceNotes)
    .where(and(...conditions))
    .orderBy(desc(voiceNotes.createdAt))
    .limit(options?.limit || 100);
  
  // Filter by search if provided (client-side for now)
  if (options?.search) {
    const searchLower = options.search.toLowerCase();
    return results.filter(n => n.content.toLowerCase().includes(searchLower));
  }
  
  return results;
}

export async function updateVoiceNote(id: number, data: Partial<InsertVoiceNote>) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(voiceNotes).set(data).where(eq(voiceNotes.id, id));
}

export async function deleteVoiceNote(id: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.delete(voiceNotes).where(eq(voiceNotes.id, id));
}

export async function getUnprocessedVoiceNotes(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(voiceNotes)
    .where(and(eq(voiceNotes.userId, userId), eq(voiceNotes.isProcessed, false)))
    .orderBy(desc(voiceNotes.createdAt));
}


// ==================== EXPERT EVOLUTION SYSTEM ====================

// Expert Conversations - persistent memory for each expert
export async function createExpertConversation(entry: InsertExpertConversation): Promise<ExpertConversation | null> {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.insert(expertConversations).values(entry);
  const id = result[0].insertId;
  const created = await db.select().from(expertConversations).where(eq(expertConversations.id, id)).limit(1);
  return created[0] || null;
}

export async function getExpertConversations(
  userId: number, 
  expertId: string, 
  options?: { limit?: number; projectId?: number }
): Promise<ExpertConversation[]> {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [
    eq(expertConversations.userId, userId),
    eq(expertConversations.expertId, expertId)
  ];
  
  if (options?.projectId) {
    conditions.push(eq(expertConversations.projectId, options.projectId));
  }
  
  return db.select().from(expertConversations)
    .where(and(...conditions))
    .orderBy(desc(expertConversations.createdAt))
    .limit(options?.limit || 50);
}

export async function getExpertConversationContext(
  userId: number, 
  expertId: string, 
  limit: number = 20
): Promise<string> {
  const conversations = await getExpertConversations(userId, expertId, { limit });
  
  // Format conversations for context injection
  return conversations
    .reverse()
    .map(c => `${c.role === 'user' ? 'User' : 'Expert'}: ${c.content}`)
    .join('\n');
}

// Expert Memory - key learnings per expert
export async function createExpertMemory(entry: InsertExpertMemory): Promise<ExpertMemory | null> {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.insert(expertMemory).values(entry);
  const id = result[0].insertId;
  const created = await db.select().from(expertMemory).where(eq(expertMemory.id, id)).limit(1);
  return created[0] || null;
}

export async function getExpertMemories(
  userId: number, 
  expertId: string, 
  options?: { memoryType?: string; limit?: number }
): Promise<ExpertMemory[]> {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [
    eq(expertMemory.userId, userId),
    eq(expertMemory.expertId, expertId)
  ];
  
  return db.select().from(expertMemory)
    .where(and(...conditions))
    .orderBy(desc(expertMemory.confidence), desc(expertMemory.usageCount))
    .limit(options?.limit || 100);
}

export async function updateExpertMemory(id: number, data: Partial<InsertExpertMemory>) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(expertMemory).set({
    ...data,
    usageCount: sql`${expertMemory.usageCount} + 1`,
    lastUsed: new Date()
  }).where(eq(expertMemory.id, id));
}

export async function getExpertMemoryContext(userId: number, expertId: string): Promise<string> {
  const memories = await getExpertMemories(userId, expertId, { limit: 30 });
  
  if (memories.length === 0) return '';
  
  // Group by type for organized context
  const grouped: Record<string, ExpertMemory[]> = {};
  memories.forEach(m => {
    if (!grouped[m.memoryType]) grouped[m.memoryType] = [];
    grouped[m.memoryType].push(m);
  });
  
  let context = '## What I Know About You:\n';
  
  if (grouped.preference) {
    context += '\n### Preferences:\n';
    grouped.preference.forEach(m => {
      context += `- ${m.key}: ${m.value}\n`;
    });
  }
  
  if (grouped.style) {
    context += '\n### Communication Style:\n';
    grouped.style.forEach(m => {
      context += `- ${m.key}: ${m.value}\n`;
    });
  }
  
  if (grouped.fact) {
    context += '\n### Key Facts:\n';
    grouped.fact.forEach(m => {
      context += `- ${m.key}: ${m.value}\n`;
    });
  }
  
  if (grouped.correction) {
    context += '\n### Past Corrections (avoid these mistakes):\n';
    grouped.correction.forEach(m => {
      context += `- ${m.key}: ${m.value}\n`;
    });
  }
  
  return context;
}

// Expert Prompt Evolution - track how prompts improve
export async function createExpertPromptEvolution(entry: InsertExpertPromptEvolution): Promise<ExpertPromptEvolution | null> {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.insert(expertPromptEvolution).values(entry);
  const id = result[0].insertId;
  const created = await db.select().from(expertPromptEvolution).where(eq(expertPromptEvolution.id, id)).limit(1);
  return created[0] || null;
}

export async function getLatestExpertPromptEvolution(expertId: string): Promise<ExpertPromptEvolution | null> {
  const db = await getDb();
  if (!db) return null;
  
  const results = await db.select().from(expertPromptEvolution)
    .where(eq(expertPromptEvolution.expertId, expertId))
    .orderBy(desc(expertPromptEvolution.version))
    .limit(1);
  
  return results[0] || null;
}

export async function getExpertPromptHistory(expertId: string, limit: number = 10): Promise<ExpertPromptEvolution[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(expertPromptEvolution)
    .where(eq(expertPromptEvolution.expertId, expertId))
    .orderBy(desc(expertPromptEvolution.version))
    .limit(limit);
}

// Expert Insights - shared knowledge repository
export async function createExpertInsight(entry: InsertExpertInsight): Promise<ExpertInsight | null> {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.insert(expertInsights).values(entry);
  const id = result[0].insertId;
  const created = await db.select().from(expertInsights).where(eq(expertInsights.id, id)).limit(1);
  return created[0] || null;
}

export async function getExpertInsights(
  userId: number,
  options?: { expertId?: string; category?: string; projectId?: number; limit?: number }
): Promise<ExpertInsight[]> {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [eq(expertInsights.userId, userId)];
  
  if (options?.expertId) {
    conditions.push(eq(expertInsights.expertId, options.expertId));
  }
  
  if (options?.projectId) {
    conditions.push(eq(expertInsights.projectId, options.projectId));
  }
  
  return db.select().from(expertInsights)
    .where(and(...conditions))
    .orderBy(desc(expertInsights.confidence), desc(expertInsights.usageCount))
    .limit(options?.limit || 50);
}

export async function updateExpertInsight(id: number, data: Partial<InsertExpertInsight>) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(expertInsights).set(data).where(eq(expertInsights.id, id));
}

export async function incrementInsightUsage(id: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(expertInsights).set({
    usageCount: sql`${expertInsights.usageCount} + 1`
  }).where(eq(expertInsights.id, id));
}

// Expert Research Tasks - scheduled research
export async function createExpertResearchTask(entry: InsertExpertResearchTask): Promise<ExpertResearchTask | null> {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.insert(expertResearchTasks).values(entry);
  const id = result[0].insertId;
  const created = await db.select().from(expertResearchTasks).where(eq(expertResearchTasks.id, id)).limit(1);
  return created[0] || null;
}

export async function getExpertResearchTasks(
  expertId: string,
  options?: { status?: string; limit?: number }
): Promise<ExpertResearchTask[]> {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [eq(expertResearchTasks.expertId, expertId)];
  
  return db.select().from(expertResearchTasks)
    .where(and(...conditions))
    .orderBy(desc(expertResearchTasks.scheduledFor))
    .limit(options?.limit || 20);
}

export async function updateExpertResearchTask(id: number, data: Partial<InsertExpertResearchTask>) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(expertResearchTasks).set(data).where(eq(expertResearchTasks.id, id));
}

export async function getPendingResearchTasks(limit: number = 10): Promise<ExpertResearchTask[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(expertResearchTasks)
    .where(eq(expertResearchTasks.status, 'pending'))
    .orderBy(expertResearchTasks.scheduledFor)
    .limit(limit);
}

// Expert Collaboration - track how experts work together
export async function createExpertCollaboration(entry: InsertExpertCollaboration): Promise<ExpertCollaboration | null> {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.insert(expertCollaboration).values(entry);
  const id = result[0].insertId;
  const created = await db.select().from(expertCollaboration).where(eq(expertCollaboration.id, id)).limit(1);
  return created[0] || null;
}

export async function getExpertCollaborations(
  userId: number,
  options?: { expertId?: string; projectId?: number; limit?: number }
): Promise<ExpertCollaboration[]> {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [eq(expertCollaboration.userId, userId)];
  
  if (options?.expertId) {
    conditions.push(eq(expertCollaboration.initiatorExpertId, options.expertId));
  }
  
  if (options?.projectId) {
    conditions.push(eq(expertCollaboration.projectId, options.projectId));
  }
  
  return db.select().from(expertCollaboration)
    .where(and(...conditions))
    .orderBy(desc(expertCollaboration.createdAt))
    .limit(options?.limit || 20);
}

// Expert Coaching Sessions - Chief of Staff training experts
export async function createExpertCoachingSession(entry: InsertExpertCoachingSession): Promise<ExpertCoachingSession | null> {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.insert(expertCoachingSessions).values(entry);
  const id = result[0].insertId;
  const created = await db.select().from(expertCoachingSessions).where(eq(expertCoachingSessions.id, id)).limit(1);
  return created[0] || null;
}

export async function getExpertCoachingSessions(
  expertId: string,
  options?: { status?: string; limit?: number }
): Promise<ExpertCoachingSession[]> {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [eq(expertCoachingSessions.expertId, expertId)];
  
  return db.select().from(expertCoachingSessions)
    .where(and(...conditions))
    .orderBy(desc(expertCoachingSessions.createdAt))
    .limit(options?.limit || 10);
}

export async function updateExpertCoachingSession(id: number, data: Partial<InsertExpertCoachingSession>) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(expertCoachingSessions).set(data).where(eq(expertCoachingSessions.id, id));
}

// Expert Domain Knowledge - track expertise areas
export async function createExpertDomainKnowledge(entry: InsertExpertDomainKnowledge): Promise<ExpertDomainKnowledge | null> {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.insert(expertDomainKnowledge).values(entry);
  const id = result[0].insertId;
  const created = await db.select().from(expertDomainKnowledge).where(eq(expertDomainKnowledge.id, id)).limit(1);
  return created[0] || null;
}

export async function getExpertDomainKnowledge(expertId: string): Promise<ExpertDomainKnowledge[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(expertDomainKnowledge)
    .where(eq(expertDomainKnowledge.expertId, expertId))
    .orderBy(desc(expertDomainKnowledge.lastUpdated));
}

export async function updateExpertDomainKnowledge(id: number, data: Partial<InsertExpertDomainKnowledge>) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(expertDomainKnowledge).set({
    ...data,
    lastUpdated: new Date()
  }).where(eq(expertDomainKnowledge.id, id));
}

export async function getStaleExpertDomains(daysOld: number = 7): Promise<ExpertDomainKnowledge[]> {
  const db = await getDb();
  if (!db) return [];
  
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  
  return db.select().from(expertDomainKnowledge)
    .where(lte(expertDomainKnowledge.lastUpdated, cutoffDate))
    .orderBy(expertDomainKnowledge.lastUpdated);
}


// ==================== SME TEAM MANAGEMENT ====================

import { smeTeams, InsertSmeTeam, SmeTeam, smeTeamMembers, InsertSmeTeamMember, SmeTeamMember, taskQaReviews, InsertTaskQaReview, TaskQaReview, smeFeedbackLog, InsertSmeFeedbackLog, SmeFeedbackLog } from "../drizzle/schema";

// Create a new SME team
export async function createSmeTeam(entry: InsertSmeTeam): Promise<SmeTeam | null> {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.insert(smeTeams).values(entry);
  const id = result[0].insertId;
  const created = await db.select().from(smeTeams).where(eq(smeTeams.id, id)).limit(1);
  return created[0] || null;
}

// Get all SME teams for a user
export async function getSmeTeams(userId: number): Promise<SmeTeam[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(smeTeams)
    .where(and(eq(smeTeams.userId, userId), eq(smeTeams.isActive, true)))
    .orderBy(desc(smeTeams.updatedAt));
}

// Get a single SME team by ID
export async function getSmeTeamById(teamId: number): Promise<SmeTeam | null> {
  const db = await getDb();
  if (!db) return null;
  
  const results = await db.select().from(smeTeams).where(eq(smeTeams.id, teamId)).limit(1);
  return results[0] || null;
}

// Update an SME team
export async function updateSmeTeam(teamId: number, data: Partial<InsertSmeTeam>) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(smeTeams).set(data).where(eq(smeTeams.id, teamId));
}

// Delete an SME team (soft delete)
export async function deleteSmeTeam(teamId: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(smeTeams).set({ isActive: false }).where(eq(smeTeams.id, teamId));
}

// Add a member to an SME team
export async function addSmeTeamMember(entry: InsertSmeTeamMember): Promise<SmeTeamMember | null> {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.insert(smeTeamMembers).values(entry);
  const id = result[0].insertId;
  const created = await db.select().from(smeTeamMembers).where(eq(smeTeamMembers.id, id)).limit(1);
  return created[0] || null;
}

// Get all members of an SME team
export async function getSmeTeamMembers(teamId: number): Promise<SmeTeamMember[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(smeTeamMembers)
    .where(eq(smeTeamMembers.teamId, teamId))
    .orderBy(smeTeamMembers.addedAt);
}

// Remove a member from an SME team
export async function removeSmeTeamMember(teamId: number, expertId: string) {
  const db = await getDb();
  if (!db) return;
  
  await db.delete(smeTeamMembers)
    .where(and(eq(smeTeamMembers.teamId, teamId), eq(smeTeamMembers.expertId, expertId)));
}

// Get team with members
export async function getSmeTeamWithMembers(teamId: number): Promise<{ team: SmeTeam; members: SmeTeamMember[] } | null> {
  const team = await getSmeTeamById(teamId);
  if (!team) return null;
  
  const members = await getSmeTeamMembers(teamId);
  return { team, members };
}


// ==================== QA WORKFLOW ====================

// Create a QA review for a task
export async function createTaskQaReview(entry: InsertTaskQaReview): Promise<TaskQaReview | null> {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.insert(taskQaReviews).values(entry);
  const id = result[0].insertId;
  const created = await db.select().from(taskQaReviews).where(eq(taskQaReviews.id, id)).limit(1);
  return created[0] || null;
}

// Get all QA reviews for a task
export async function getTaskQaReviews(taskId: number): Promise<TaskQaReview[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(taskQaReviews)
    .where(eq(taskQaReviews.taskId, taskId))
    .orderBy(desc(taskQaReviews.createdAt));
}

// Update a QA review
export async function updateTaskQaReview(reviewId: number, data: Partial<InsertTaskQaReview>) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(taskQaReviews).set(data).where(eq(taskQaReviews.id, reviewId));
}

// Get tasks with QA status for a user
export async function getTasksWithQaStatus(userId: number, options?: { projectId?: number; status?: string }) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [eq(tasks.userId, userId)];
  
  if (options?.projectId) {
    conditions.push(eq(tasks.projectId, options.projectId));
  }
  
  return db.select().from(tasks)
    .where(and(...conditions))
    .orderBy(desc(tasks.updatedAt));
}

// Update task QA status after review
export async function updateTaskQaStatus(taskId: number, qaStatus: string, cosScore?: number, secondaryAiScore?: number) {
  const db = await getDb();
  if (!db) return;
  
  const updateData: Record<string, unknown> = { qaStatus };
  if (cosScore !== undefined) updateData.cosScore = cosScore;
  if (secondaryAiScore !== undefined) updateData.secondaryAiScore = secondaryAiScore;
  
  // Update task status based on QA status
  if (qaStatus === 'approved') {
    updateData.status = 'verified';
  } else if (qaStatus === 'cos_reviewed') {
    updateData.status = 'cos_approved';
  }
  
  await db.update(tasks).set(updateData).where(eq(tasks.id, taskId));
}


// ==================== SME FEEDBACK ====================

// Create feedback for an SME expert
export async function createSmeFeedback(entry: InsertSmeFeedbackLog): Promise<SmeFeedbackLog | null> {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.insert(smeFeedbackLog).values(entry);
  const id = result[0].insertId;
  const created = await db.select().from(smeFeedbackLog).where(eq(smeFeedbackLog.id, id)).limit(1);
  return created[0] || null;
}

// Get feedback for an expert
export async function getSmeFeedback(userId: number, expertId: string): Promise<SmeFeedbackLog[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(smeFeedbackLog)
    .where(and(eq(smeFeedbackLog.userId, userId), eq(smeFeedbackLog.expertId, expertId)))
    .orderBy(desc(smeFeedbackLog.createdAt));
}

// Mark feedback as applied (expert has "learned")
export async function markFeedbackApplied(feedbackId: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(smeFeedbackLog).set({ applied: true }).where(eq(smeFeedbackLog.id, feedbackId));
}


// ==================== EXPERT CONSULTATIONS ====================

// Create a new consultation record
export async function createExpertConsultation(entry: InsertExpertConsultation): Promise<ExpertConsultation | null> {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.insert(expertConsultations).values(entry);
  const id = result[0].insertId;
  const created = await db.select().from(expertConsultations).where(eq(expertConsultations.id, id)).limit(1);
  return created[0] || null;
}

// Get consultation history for a user
export async function getExpertConsultationHistory(
  userId: number, 
  options?: { expertId?: string; limit?: number }
): Promise<ExpertConsultation[]> {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [eq(expertConsultations.userId, userId)];
  
  if (options?.expertId) {
    conditions.push(eq(expertConsultations.expertId, options.expertId));
  }
  
  return db.select().from(expertConsultations)
    .where(and(...conditions))
    .orderBy(desc(expertConsultations.updatedAt))
    .limit(options?.limit || 50);
}

// Get consultation count per expert for a user
export async function getExpertConsultationCounts(userId: number): Promise<{ expertId: string; count: number; lastConsulted: Date }[]> {
  const db = await getDb();
  if (!db) return [];
  
  const results = await db.select({
    expertId: expertConsultations.expertId,
    count: sql<number>`COUNT(*)`,
    lastConsulted: sql<Date>`MAX(${expertConsultations.updatedAt})`
  })
    .from(expertConsultations)
    .where(eq(expertConsultations.userId, userId))
    .groupBy(expertConsultations.expertId);
  
  return results;
}

// Update consultation record
export async function updateExpertConsultation(id: number, data: Partial<InsertExpertConsultation>) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(expertConsultations).set(data).where(eq(expertConsultations.id, id));
}

// ==================== EXPERT CHAT SESSIONS ====================

// Create a new chat session
export async function createExpertChatSession(entry: InsertExpertChatSession): Promise<ExpertChatSession | null> {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.insert(expertChatSessions).values(entry);
  const id = result[0].insertId;
  const created = await db.select().from(expertChatSessions).where(eq(expertChatSessions.id, id)).limit(1);
  return created[0] || null;
}

// Get active chat session for user and expert
export async function getActiveExpertChatSession(userId: number, expertId: string): Promise<ExpertChatSession | null> {
  const db = await getDb();
  if (!db) return null;
  
  const sessions = await db.select().from(expertChatSessions)
    .where(and(
      eq(expertChatSessions.userId, userId),
      eq(expertChatSessions.expertId, expertId),
      eq(expertChatSessions.status, 'active')
    ))
    .orderBy(desc(expertChatSessions.createdAt))
    .limit(1);
  
  return sessions[0] || null;
}

// Get all chat sessions for a user
export async function getExpertChatSessions(userId: number, options?: { expertId?: string; limit?: number }): Promise<ExpertChatSession[]> {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [eq(expertChatSessions.userId, userId)];
  
  if (options?.expertId) {
    conditions.push(eq(expertChatSessions.expertId, options.expertId));
  }
  
  return db.select().from(expertChatSessions)
    .where(and(...conditions))
    .orderBy(desc(expertChatSessions.createdAt))
    .limit(options?.limit || 50);
}

// Update chat session
export async function updateExpertChatSession(id: number, data: Partial<InsertExpertChatSession>) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(expertChatSessions).set(data).where(eq(expertChatSessions.id, id));
}

// ==================== EXPERT CHAT MESSAGES ====================

// Add a message to a chat session
export async function createExpertChatMessage(entry: InsertExpertChatMessage): Promise<ExpertChatMessage | null> {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.insert(expertChatMessages).values(entry);
  const id = result[0].insertId;
  const created = await db.select().from(expertChatMessages).where(eq(expertChatMessages.id, id)).limit(1);
  
  // Update session's lastMessageAt
  if (entry.sessionId) {
    await db.update(expertChatSessions)
      .set({ lastMessageAt: new Date() })
      .where(eq(expertChatSessions.id, entry.sessionId));
  }
  
  return created[0] || null;
}

// Get messages for a chat session
export async function getExpertChatMessages(sessionId: number, options?: { limit?: number }): Promise<ExpertChatMessage[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(expertChatMessages)
    .where(eq(expertChatMessages.sessionId, sessionId))
    .orderBy(expertChatMessages.createdAt)
    .limit(options?.limit || 100);
}

// Get recent messages across all sessions for an expert
export async function getRecentExpertMessages(userId: number, expertId: string, limit: number = 20): Promise<ExpertChatMessage[]> {
  const db = await getDb();
  if (!db) return [];
  
  // First get session IDs for this user and expert
  const sessions = await db.select({ id: expertChatSessions.id })
    .from(expertChatSessions)
    .where(and(
      eq(expertChatSessions.userId, userId),
      eq(expertChatSessions.expertId, expertId)
    ));
  
  if (sessions.length === 0) return [];
  
  const sessionIds = sessions.map(s => s.id);
  
  // Get messages from these sessions
  const messages: ExpertChatMessage[] = [];
  for (const sessionId of sessionIds) {
    const sessionMessages = await db.select().from(expertChatMessages)
      .where(eq(expertChatMessages.sessionId, sessionId))
      .orderBy(desc(expertChatMessages.createdAt))
      .limit(limit);
    messages.push(...sessionMessages);
  }
  
  // Sort by createdAt and limit
  return messages
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit)
    .reverse();
}

// ==================== LIBRARY DOCUMENTS ====================

import { libraryDocuments, InsertLibraryDocument, LibraryDocument } from "../drizzle/schema";

// Create a new library document
export async function createLibraryDocument(entry: InsertLibraryDocument): Promise<LibraryDocument | null> {
  const db = await getDb();
  if (!db) return null;
  
  const [newEntry] = await db.insert(libraryDocuments).values(entry).$returningId();
  return { ...entry, id: newEntry.id, createdAt: new Date(), updatedAt: new Date() } as LibraryDocument;
}

// Get library documents for a user
export async function getLibraryDocuments(
  userId: number, 
  options?: { folder?: string; subFolder?: string; type?: string; limit?: number; offset?: number }
): Promise<LibraryDocument[]> {
  const db = await getDb();
  if (!db) return [];
  
  // Build conditions array
  const conditions = [eq(libraryDocuments.userId, userId)];
  if (options?.folder) {
    conditions.push(eq(libraryDocuments.folder, options.folder));
  }
  if (options?.subFolder) {
    conditions.push(eq(libraryDocuments.subFolder, options.subFolder));
  }
  
  let query = db.select().from(libraryDocuments)
    .where(and(...conditions))
    .orderBy(desc(libraryDocuments.createdAt))
    .limit(options?.limit || 100);
  
  if (options?.offset) {
    query = query.offset(options.offset);
  }
  
  return query;
}

// Get library document by ID
export async function getLibraryDocumentById(id: number): Promise<LibraryDocument | null> {
  const db = await getDb();
  if (!db) return null;
  
  const [doc] = await db.select().from(libraryDocuments).where(eq(libraryDocuments.id, id));
  return doc || null;
}

// Update library document
export async function updateLibraryDocument(id: number, data: Partial<InsertLibraryDocument>) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(libraryDocuments).set(data).where(eq(libraryDocuments.id, id));
}

// Delete library document
export async function deleteLibraryDocument(id: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.delete(libraryDocuments).where(eq(libraryDocuments.id, id));
}


// ==================== Business Plan Review Versions ====================

// Create a new review version
export async function createBusinessPlanReviewVersion(data: InsertBusinessPlanReviewVersion): Promise<number | null> {
  const db = await getDb();
  if (!db) return null;
  
  const [result] = await db.insert(businessPlanReviewVersions).values(data);
  return result.insertId;
}

// Get all review versions for a user and project
export async function getBusinessPlanReviewVersions(
  userId: number, 
  projectName: string
): Promise<BusinessPlanReviewVersion[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(businessPlanReviewVersions)
    .where(and(
      eq(businessPlanReviewVersions.userId, userId),
      eq(businessPlanReviewVersions.projectName, projectName)
    ))
    .orderBy(desc(businessPlanReviewVersions.versionNumber));
}

// Get a specific review version by ID
export async function getBusinessPlanReviewVersionById(id: number): Promise<BusinessPlanReviewVersion | null> {
  const db = await getDb();
  if (!db) return null;
  
  const [version] = await db.select().from(businessPlanReviewVersions)
    .where(eq(businessPlanReviewVersions.id, id));
  return version || null;
}

// Get the latest version number for a project
export async function getLatestVersionNumber(userId: number, projectName: string): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  
  const [result] = await db.select({ maxVersion: sql<number>`MAX(${businessPlanReviewVersions.versionNumber})` })
    .from(businessPlanReviewVersions)
    .where(and(
      eq(businessPlanReviewVersions.userId, userId),
      eq(businessPlanReviewVersions.projectName, projectName)
    ));
  
  return result?.maxVersion || 0;
}

// Get all unique project names for a user
export async function getUserBusinessPlanProjects(userId: number): Promise<string[]> {
  const db = await getDb();
  if (!db) return [];
  
  const results = await db.selectDistinct({ projectName: businessPlanReviewVersions.projectName })
    .from(businessPlanReviewVersions)
    .where(eq(businessPlanReviewVersions.userId, userId));
  
  return results.map(r => r.projectName);
}

// ==================== Expert Follow-up Questions ====================

// Create a follow-up question
export async function createExpertFollowUpQuestion(data: InsertExpertFollowUpQuestion): Promise<number | null> {
  const db = await getDb();
  if (!db) return null;
  
  const [result] = await db.insert(expertFollowUpQuestions).values(data);
  return result.insertId;
}

// Get follow-up questions for a review version
export async function getExpertFollowUpQuestions(
  reviewVersionId: number,
  options?: { sectionId?: string; expertId?: string }
): Promise<ExpertFollowUpQuestion[]> {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [eq(expertFollowUpQuestions.reviewVersionId, reviewVersionId)];
  
  if (options?.sectionId) {
    conditions.push(eq(expertFollowUpQuestions.sectionId, options.sectionId));
  }
  if (options?.expertId) {
    conditions.push(eq(expertFollowUpQuestions.expertId, options.expertId));
  }
  
  return db.select().from(expertFollowUpQuestions)
    .where(and(...conditions))
    .orderBy(desc(expertFollowUpQuestions.createdAt));
}

// Update follow-up question with answer
export async function answerExpertFollowUpQuestion(id: number, answer: string) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(expertFollowUpQuestions).set({
    answer,
    status: 'answered',
    answeredAt: new Date()
  }).where(eq(expertFollowUpQuestions.id, id));
}

// ============================================
// Collaborative Review Functions
// ============================================

// Create a collaborative review session
export async function createCollaborativeReviewSession(data: {
  ownerId: number;
  projectName: string;
  templateId?: string;
  reviewData?: any;
}): Promise<number | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.insert(collaborativeReviewSessions).values({
    ownerId: data.ownerId,
    projectName: data.projectName,
    templateId: data.templateId,
    reviewData: data.reviewData,
  });
  
  const insertId = result[0]?.insertId;
  
  // Add owner as participant
  if (insertId) {
    await db.insert(collaborativeReviewParticipants).values({
      sessionId: insertId,
      userId: data.ownerId,
      role: 'owner',
      invitedBy: data.ownerId,
      joinedAt: new Date(),
    });
  }
  
  return insertId;
}

// Get collaborative review sessions for a user
export async function getCollaborativeReviewSessions(userId: number): Promise<CollaborativeReviewSession[]> {
  const db = await getDb();
  if (!db) return [];
  
  // Get sessions where user is a participant
  const participantSessions = await db.select({ sessionId: collaborativeReviewParticipants.sessionId })
    .from(collaborativeReviewParticipants)
    .where(eq(collaborativeReviewParticipants.userId, userId));
  
  const sessionIds = participantSessions.map(p => p.sessionId);
  if (sessionIds.length === 0) return [];
  
  return db.select().from(collaborativeReviewSessions)
    .where(sql`${collaborativeReviewSessions.id} IN (${sql.join(sessionIds.map(id => sql`${id}`), sql`, `)})`)
    .orderBy(desc(collaborativeReviewSessions.updatedAt));
}

// Get a specific collaborative review session
export async function getCollaborativeReviewSessionById(sessionId: number): Promise<CollaborativeReviewSession | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const results = await db.select().from(collaborativeReviewSessions)
    .where(eq(collaborativeReviewSessions.id, sessionId))
    .limit(1);
  
  return results[0];
}

// Update collaborative review session
export async function updateCollaborativeReviewSession(sessionId: number, data: {
  status?: 'active' | 'completed' | 'archived';
  reviewData?: any;
}): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db.update(collaborativeReviewSessions).set(data)
    .where(eq(collaborativeReviewSessions.id, sessionId));
}

// Add participant to a collaborative review session
export async function addCollaborativeReviewParticipant(data: {
  sessionId: number;
  userId: number;
  role: 'reviewer' | 'viewer';
  invitedBy: number;
}): Promise<number | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  // Check if already a participant
  const existing = await db.select().from(collaborativeReviewParticipants)
    .where(and(
      eq(collaborativeReviewParticipants.sessionId, data.sessionId),
      eq(collaborativeReviewParticipants.userId, data.userId)
    ))
    .limit(1);
  
  if (existing.length > 0) return existing[0].id;
  
  const result = await db.insert(collaborativeReviewParticipants).values({
    sessionId: data.sessionId,
    userId: data.userId,
    role: data.role,
    invitedBy: data.invitedBy,
  });
  
  return result[0]?.insertId;
}

// Get participants for a session
export async function getCollaborativeReviewParticipants(sessionId: number): Promise<CollaborativeReviewParticipant[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(collaborativeReviewParticipants)
    .where(eq(collaborativeReviewParticipants.sessionId, sessionId));
}

// Update participant (e.g., when they join)
export async function updateCollaborativeReviewParticipant(participantId: number, data: {
  role?: 'owner' | 'reviewer' | 'viewer';
  joinedAt?: Date;
  lastActiveAt?: Date;
}): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db.update(collaborativeReviewParticipants).set(data)
    .where(eq(collaborativeReviewParticipants.id, participantId));
}

// Check if user is participant in a session
export async function isSessionParticipant(sessionId: number, userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  
  const results = await db.select().from(collaborativeReviewParticipants)
    .where(and(
      eq(collaborativeReviewParticipants.sessionId, sessionId),
      eq(collaborativeReviewParticipants.userId, userId)
    ))
    .limit(1);
  
  return results.length > 0;
}

// Get participant role
export async function getParticipantRole(sessionId: number, userId: number): Promise<string | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const results = await db.select({ role: collaborativeReviewParticipants.role })
    .from(collaborativeReviewParticipants)
    .where(and(
      eq(collaborativeReviewParticipants.sessionId, sessionId),
      eq(collaborativeReviewParticipants.userId, userId)
    ))
    .limit(1);
  
  return results[0]?.role;
}

// Add comment to a section
export async function createCollaborativeReviewComment(data: {
  sessionId: number;
  userId: number;
  sectionId: string;
  comment: string;
  parentCommentId?: number;
}): Promise<number | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.insert(collaborativeReviewComments).values({
    sessionId: data.sessionId,
    userId: data.userId,
    sectionId: data.sectionId,
    comment: data.comment,
    parentCommentId: data.parentCommentId,
  });
  
  return result[0]?.insertId;
}

// Get comments for a session
export async function getCollaborativeReviewComments(sessionId: number, sectionId?: string): Promise<CollaborativeReviewComment[]> {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [eq(collaborativeReviewComments.sessionId, sessionId)];
  if (sectionId) {
    conditions.push(eq(collaborativeReviewComments.sectionId, sectionId));
  }
  
  return db.select().from(collaborativeReviewComments)
    .where(and(...conditions))
    .orderBy(desc(collaborativeReviewComments.createdAt));
}

// Update comment status
export async function updateCollaborativeReviewComment(commentId: number, data: {
  comment?: string;
  status?: 'active' | 'resolved' | 'deleted';
}): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db.update(collaborativeReviewComments).set(data)
    .where(eq(collaborativeReviewComments.id, commentId));
}

// Log activity
export async function logCollaborativeReviewActivity(data: {
  sessionId: number;
  userId: number;
  action: 'joined' | 'viewed_section' | 'commented' | 'reviewed_section' | 'completed_review';
  sectionId?: string;
  metadata?: any;
}): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db.insert(collaborativeReviewActivity).values({
    sessionId: data.sessionId,
    userId: data.userId,
    action: data.action,
    sectionId: data.sectionId,
    metadata: data.metadata,
  });
}

// Get activity for a session
export async function getCollaborativeReviewActivity(sessionId: number, limit: number = 50): Promise<CollaborativeReviewActivity[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(collaborativeReviewActivity)
    .where(eq(collaborativeReviewActivity.sessionId, sessionId))
    .orderBy(desc(collaborativeReviewActivity.createdAt))
    .limit(limit);
}

// Get session with participants and comments
export async function getCollaborativeReviewSessionWithDetails(sessionId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const session = await getCollaborativeReviewSessionById(sessionId);
  if (!session) return null;
  
  const participants = await getCollaborativeReviewParticipants(sessionId);
  const comments = await getCollaborativeReviewComments(sessionId);
  const activity = await getCollaborativeReviewActivity(sessionId, 20);
  
  return {
    ...session,
    participants,
    comments,
    recentActivity: activity,
  };
}


// ============================================
// Evening Review System Functions
// ============================================

// Create an evening review session
export async function createEveningReviewSession(data: InsertEveningReviewSession): Promise<number | null> {
  const db = await getDb();
  if (!db) return null;
  
  const [result] = await db.insert(eveningReviewSessions).values(data);
  return result.insertId;
}

// Get evening review sessions for a user
export async function getEveningReviewSessions(
  userId: number,
  options?: { limit?: number; startDate?: Date; endDate?: Date }
): Promise<EveningReviewSession[]> {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [eq(eveningReviewSessions.userId, userId)];
  
  if (options?.startDate) {
    conditions.push(gte(eveningReviewSessions.reviewDate, options.startDate));
  }
  if (options?.endDate) {
    conditions.push(lte(eveningReviewSessions.reviewDate, options.endDate));
  }
  
  return db.select().from(eveningReviewSessions)
    .where(and(...conditions))
    .orderBy(desc(eveningReviewSessions.reviewDate))
    .limit(options?.limit || 30);
}

// Get the latest evening review session
export async function getLatestEveningReviewSession(userId: number): Promise<EveningReviewSession | null> {
  const db = await getDb();
  if (!db) return null;
  
  const [session] = await db.select().from(eveningReviewSessions)
    .where(eq(eveningReviewSessions.userId, userId))
    .orderBy(desc(eveningReviewSessions.reviewDate))
    .limit(1);
  
  return session || null;
}

// Update evening review session
export async function updateEveningReviewSession(id: number, data: Partial<InsertEveningReviewSession>) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(eveningReviewSessions).set(data).where(eq(eveningReviewSessions.id, id));
}

// Create task decisions for a review session
export async function createEveningReviewTaskDecisions(decisions: InsertEveningReviewTaskDecision[]): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  if (decisions.length > 0) {
    await db.insert(eveningReviewTaskDecisions).values(decisions);
  }
}

// Get task decisions for a session
export async function getEveningReviewTaskDecisions(sessionId: number): Promise<EveningReviewTaskDecision[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(eveningReviewTaskDecisions)
    .where(eq(eveningReviewTaskDecisions.sessionId, sessionId))
    .orderBy(desc(eveningReviewTaskDecisions.createdAt));
}

// ============================================
// Review Timing Pattern Functions
// ============================================

// Get or create timing pattern for a day
export async function getReviewTimingPattern(userId: number, dayOfWeek: number): Promise<ReviewTimingPattern | null> {
  const db = await getDb();
  if (!db) return null;
  
  const [pattern] = await db.select().from(reviewTimingPatterns)
    .where(and(
      eq(reviewTimingPatterns.userId, userId),
      eq(reviewTimingPatterns.dayOfWeek, dayOfWeek)
    ));
  
  return pattern || null;
}

// Get all timing patterns for a user
export async function getAllReviewTimingPatterns(userId: number): Promise<ReviewTimingPattern[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(reviewTimingPatterns)
    .where(eq(reviewTimingPatterns.userId, userId))
    .orderBy(reviewTimingPatterns.dayOfWeek);
}

// Update timing pattern based on new review data
export async function updateReviewTimingPattern(
  userId: number,
  dayOfWeek: number,
  startTime: string,
  duration: number,
  wasAutoProcessed: boolean
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  const existing = await getReviewTimingPattern(userId, dayOfWeek);
  
  if (existing) {
    // Calculate new averages
    const newSampleCount = existing.sampleCount + 1;
    const newAutoProcessRate = ((existing.autoProcessRate || 0) * existing.sampleCount + (wasAutoProcessed ? 1 : 0)) / newSampleCount;
    const newCompletionRate = ((existing.completionRate || 0) * existing.sampleCount + (wasAutoProcessed ? 0 : 1)) / newSampleCount;
    
    // Calculate average start time (simplified - just use latest for now)
    await db.update(reviewTimingPatterns).set({
      averageStartTime: startTime,
      averageDuration: Math.round(((existing.averageDuration || 0) * existing.sampleCount + duration) / newSampleCount),
      completionRate: newCompletionRate,
      autoProcessRate: newAutoProcessRate,
      sampleCount: newSampleCount,
    }).where(eq(reviewTimingPatterns.id, existing.id));
  } else {
    // Create new pattern
    await db.insert(reviewTimingPatterns).values({
      userId,
      dayOfWeek,
      averageStartTime: startTime,
      averageDuration: duration,
      completionRate: wasAutoProcessed ? 0 : 1,
      autoProcessRate: wasAutoProcessed ? 1 : 0,
      sampleCount: 1,
    });
  }
}

// Get predicted review time for a day
export async function getPredictedReviewTime(userId: number, dayOfWeek: number): Promise<string | null> {
  const pattern = await getReviewTimingPattern(userId, dayOfWeek);
  return pattern?.averageStartTime || null;
}

// ============================================
// Signal Items Functions
// ============================================

// Create signal items
export async function createSignalItems(items: InsertSignalItem[]): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  if (items.length > 0) {
    await db.insert(signalItems).values(items);
  }
}

// Get signal items for a date
export async function getSignalItems(
  userId: number,
  targetDate: Date,
  options?: { status?: string; category?: string }
): Promise<SignalItem[]> {
  const db = await getDb();
  if (!db) return [];
  
  // Get items for the target date (same day)
  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);
  
  const conditions = [
    eq(signalItems.userId, userId),
    gte(signalItems.targetDate, startOfDay),
    lte(signalItems.targetDate, endOfDay),
  ];
  
  if (options?.status) {
    conditions.push(eq(signalItems.status, options.status as any));
  }
  if (options?.category) {
    conditions.push(eq(signalItems.category, options.category as any));
  }
  
  return db.select().from(signalItems)
    .where(and(...conditions))
    .orderBy(desc(signalItems.priority), desc(signalItems.createdAt));
}

// Get pending signal items for morning brief
export async function getPendingSignalItems(userId: number): Promise<SignalItem[]> {
  const db = await getDb();
  if (!db) return [];
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return db.select().from(signalItems)
    .where(and(
      eq(signalItems.userId, userId),
      eq(signalItems.status, 'pending'),
      gte(signalItems.targetDate, today)
    ))
    .orderBy(desc(signalItems.priority), desc(signalItems.createdAt));
}

// Update signal item status
export async function updateSignalItemStatus(id: number, status: 'pending' | 'delivered' | 'actioned' | 'dismissed') {
  const db = await getDb();
  if (!db) return;
  
  const updateData: any = { status };
  if (status === 'delivered') {
    updateData.deliveredAt = new Date();
  }
  
  await db.update(signalItems).set(updateData).where(eq(signalItems.id, id));
}

// Generate signal items from evening review
export async function generateSignalItemsFromReview(
  userId: number,
  sessionId: number,
  decisions: EveningReviewTaskDecision[],
  moodScore?: number,
  reflectionNotes?: { wentWell?: string; didntGoWell?: string }
): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(7, 0, 0, 0); // 7 AM tomorrow
  
  const items: InsertSignalItem[] = [];
  
  // Summarize accepted tasks
  const acceptedTasks = decisions.filter(d => d.decision === 'accepted');
  if (acceptedTasks.length > 0) {
    const highPriorityCount = acceptedTasks.filter(t => t.priority === 'high' || t.priority === 'critical').length;
    items.push({
      userId,
      sourceType: 'evening_review',
      sourceId: sessionId,
      category: 'task_summary',
      title: `${acceptedTasks.length} tasks queued for overnight processing`,
      description: highPriorityCount > 0 
        ? `Including ${highPriorityCount} high-priority items. Chief of Staff will process these while you rest.`
        : 'Chief of Staff will process these while you rest.',
      priority: highPriorityCount > 0 ? 'high' : 'medium',
      targetDate: tomorrow,
    });
  }
  
  // Summarize deferred tasks
  const deferredTasks = decisions.filter(d => d.decision === 'deferred');
  if (deferredTasks.length > 0) {
    items.push({
      userId,
      sourceType: 'evening_review',
      sourceId: sessionId,
      category: 'task_summary',
      title: `${deferredTasks.length} tasks deferred to tomorrow`,
      description: `These items need your attention: ${deferredTasks.slice(0, 3).map(t => t.taskTitle).join(', ')}${deferredTasks.length > 3 ? '...' : ''}`,
      priority: 'medium',
      targetDate: tomorrow,
    });
  }
  
  // Add reflection insight if mood was low
  if (moodScore && moodScore <= 4) {
    items.push({
      userId,
      sourceType: 'evening_review',
      sourceId: sessionId,
      category: 'reflection',
      title: 'Yesterday was challenging',
      description: reflectionNotes?.didntGoWell || 'Consider scheduling lighter tasks today to recover.',
      priority: 'medium',
      targetDate: tomorrow,
    });
  }
  
  // Add positive reflection if mood was high
  if (moodScore && moodScore >= 8) {
    items.push({
      userId,
      sourceType: 'evening_review',
      sourceId: sessionId,
      category: 'reflection',
      title: 'Great day yesterday!',
      description: reflectionNotes?.wentWell || 'Momentum is building. Keep it up!',
      priority: 'low',
      targetDate: tomorrow,
    });
  }
  
  if (items.length > 0) {
    await createSignalItems(items);
  }
  
  return items.length;
}

// ============================================
// Calendar Events Cache Functions
// ============================================

// Cache calendar events
export async function cacheCalendarEvents(events: InsertCalendarEventCache[]): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  if (events.length > 0) {
    await db.insert(calendarEventsCache).values(events);
  }
}

// Get cached calendar events for a time range
export async function getCachedCalendarEvents(
  userId: number,
  startTime: Date,
  endTime: Date
): Promise<CalendarEventCache[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(calendarEventsCache)
    .where(and(
      eq(calendarEventsCache.userId, userId),
      gte(calendarEventsCache.startTime, startTime),
      lte(calendarEventsCache.endTime, endTime)
    ))
    .orderBy(calendarEventsCache.startTime);
}

// Check if user has events during a time window
export async function hasEventsInWindow(
  userId: number,
  windowStart: Date,
  windowEnd: Date
): Promise<boolean> {
  const events = await getCachedCalendarEvents(userId, windowStart, windowEnd);
  return events.length > 0;
}

// Clear old cached events
export async function clearOldCachedEvents(userId: number, beforeDate: Date): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db.delete(calendarEventsCache)
    .where(and(
      eq(calendarEventsCache.userId, userId),
      lte(calendarEventsCache.endTime, beforeDate)
    ));
}


// ============================================
// Generated Documents Functions
// ============================================

// Create a new document
export async function createDocument(data: InsertGeneratedDocument): Promise<number | null> {
  const db = await getDb();
  if (!db) return null;
  
  const [result] = await db.insert(generatedDocuments).values(data);
  return result.insertId;
}

// Get documents for a user
export async function getDocuments(
  userId: number,
  filters?: { type?: string; qaStatus?: string; limit?: number; offset?: number }
): Promise<GeneratedDocument[]> {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [eq(generatedDocuments.userId, userId)];
  
  if (filters?.type && filters.type !== 'all') {
    conditions.push(eq(generatedDocuments.type, filters.type as any));
  }
  
  if (filters?.qaStatus && filters.qaStatus !== 'all') {
    conditions.push(eq(generatedDocuments.qaStatus, filters.qaStatus as any));
  }
  
  return db.select().from(generatedDocuments)
    .where(and(...conditions))
    .orderBy(desc(generatedDocuments.createdAt))
    .limit(filters?.limit || 50)
    .offset(filters?.offset || 0);
}

// Get a document by ID
export async function getDocumentById(documentId: string): Promise<GeneratedDocument | null> {
  const db = await getDb();
  if (!db) return null;
  
  const [doc] = await db.select().from(generatedDocuments)
    .where(eq(generatedDocuments.documentId, documentId))
    .limit(1);
  
  return doc || null;
}

// Update a document
export async function updateDocument(documentId: string, data: Partial<InsertGeneratedDocument>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db.update(generatedDocuments).set(data)
    .where(eq(generatedDocuments.documentId, documentId));
}

// Delete a document
export async function deleteDocument(documentId: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db.delete(generatedDocuments)
    .where(eq(generatedDocuments.documentId, documentId));
}

// Get document count by type
export async function getDocumentCounts(userId: number): Promise<{ type: string; count: number }[]> {
  const db = await getDb();
  if (!db) return [];
  
  const docs = await db.select().from(generatedDocuments)
    .where(eq(generatedDocuments.userId, userId));
  
  const counts: Record<string, number> = {};
  docs.forEach(doc => {
    counts[doc.type] = (counts[doc.type] || 0) + 1;
  });
  
  return Object.entries(counts).map(([type, count]) => ({ type, count }));
}


// ============================================
// Subscription Functions
// ============================================

import { subscriptions, type Subscription, type InsertSubscription } from "../drizzle/schema";

// Create a new subscription
export async function createSubscription(data: InsertSubscription): Promise<number | null> {
  const db = await getDb();
  if (!db) return null;
  
  const [result] = await db.insert(subscriptions).values(data);
  return result.insertId;
}

// Get subscriptions for a user
export async function getSubscriptions(
  userId: number,
  filters?: { status?: string; category?: string; limit?: number; offset?: number }
): Promise<Subscription[]> {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [eq(subscriptions.userId, userId)];
  
  if (filters?.status && filters.status !== 'all') {
    conditions.push(sql`${subscriptions.status} = ${filters.status}`);
  }
  
  if (filters?.category && filters.category !== 'all') {
    conditions.push(sql`${subscriptions.category} = ${filters.category}`);
  }
  
  return db.select().from(subscriptions)
    .where(and(...conditions))
    .orderBy(desc(subscriptions.createdAt))
    .limit(filters?.limit || 100)
    .offset(filters?.offset || 0);
}

// Get a subscription by ID
export async function getSubscriptionById(id: number): Promise<Subscription | null> {
  const db = await getDb();
  if (!db) return null;
  
  const [sub] = await db.select().from(subscriptions)
    .where(eq(subscriptions.id, id))
    .limit(1);
  
  return sub || null;
}

// Update a subscription
export async function updateSubscription(id: number, data: Partial<InsertSubscription>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db.update(subscriptions).set(data)
    .where(eq(subscriptions.id, id));
}

// Delete a subscription
export async function deleteSubscription(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db.delete(subscriptions)
    .where(eq(subscriptions.id, id));
}

// Get subscription summary statistics
export async function getSubscriptionSummary(userId: number): Promise<{
  totalMonthly: number;
  totalAnnual: number;
  activeCount: number;
  byCategory: { category: string; count: number; totalCost: number }[];
}> {
  const db = await getDb();
  if (!db) return { totalMonthly: 0, totalAnnual: 0, activeCount: 0, byCategory: [] };
  
  const subs = await db.select().from(subscriptions)
    .where(eq(subscriptions.userId, userId));
  
  let totalMonthly = 0;
  let activeCount = 0;
  const categoryMap: Record<string, { count: number; totalCost: number }> = {};
  
  subs.forEach(sub => {
    if (sub.status === 'active') {
      activeCount++;
      
      // Convert to monthly cost
      let monthlyCost = sub.cost;
      if (sub.billingCycle === 'annual') {
        monthlyCost = sub.cost / 12;
      } else if (sub.billingCycle === 'quarterly') {
        monthlyCost = sub.cost / 3;
      }
      
      totalMonthly += monthlyCost;
      
      // Track by category
      const cat = sub.category || 'other';
      if (!categoryMap[cat]) {
        categoryMap[cat] = { count: 0, totalCost: 0 };
      }
      categoryMap[cat].count++;
      categoryMap[cat].totalCost += monthlyCost;
    }
  });
  
  return {
    totalMonthly,
    totalAnnual: totalMonthly * 12,
    activeCount,
    byCategory: Object.entries(categoryMap).map(([category, data]) => ({
      category,
      ...data
    }))
  };
}

// Get subscription cost history (for trend chart)
export async function getSubscriptionCostHistory(
  userId: number,
  months: number = 12
): Promise<{ month: string; totalCost: number; subscriptionCount: number }[]> {
  const db = await getDb();
  if (!db) return [];
  
  const subs = await db.select().from(subscriptions)
    .where(eq(subscriptions.userId, userId));
  
  const now = new Date();
  const history: { month: string; totalCost: number; subscriptionCount: number }[] = [];
  
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStr = date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
    
    let totalCost = 0;
    let subscriptionCount = 0;
    
    subs.forEach(sub => {
      // Check if subscription was active during this month
      const startDate = sub.startDate ? new Date(sub.startDate) : sub.createdAt;
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      if (startDate <= endOfMonth && (sub.status === 'active' || sub.status === 'paused')) {
        subscriptionCount++;
        
        // Convert to monthly cost
        let monthlyCost = sub.cost;
        if (sub.billingCycle === 'annual') {
          monthlyCost = sub.cost / 12;
        } else if (sub.billingCycle === 'quarterly') {
          monthlyCost = sub.cost / 3;
        }
        
        totalCost += monthlyCost;
      }
    });
    
    history.push({ month: monthStr, totalCost, subscriptionCount });
  }
  
  return history;
}


// ============================================
// Expert Analytics Functions
// ============================================

// Get expert usage statistics for a user
export async function getExpertUsageStats(userId: number): Promise<{
  expertId: string;
  expertName: string;
  expertCategory: string | null;
  consultationCount: number;
  totalMessages: number;
  averageRating: number | null;
  lastConsulted: Date;
}[]> {
  const db = await getDb();
  if (!db) return [];
  
  const results = await db.select({
    expertId: expertConsultations.expertId,
    expertName: expertConsultations.expertName,
    expertCategory: expertConsultations.expertCategory,
    consultationCount: sql<number>`COUNT(*)`,
    totalMessages: sql<number>`COALESCE(SUM(${expertConsultations.messageCount}), 0)`,
    averageRating: sql<number | null>`AVG(${expertConsultations.userRating})`,
    lastConsulted: sql<Date>`MAX(${expertConsultations.updatedAt})`
  })
    .from(expertConsultations)
    .where(eq(expertConsultations.userId, userId))
    .groupBy(expertConsultations.expertId, expertConsultations.expertName, expertConsultations.expertCategory)
    .orderBy(desc(sql`COUNT(*)`));
  
  return results;
}

// Get top performing experts by rating
export async function getTopRatedExperts(userId: number, limit: number = 10): Promise<{
  expertId: string;
  expertName: string;
  averageRating: number;
  consultationCount: number;
}[]> {
  const db = await getDb();
  if (!db) return [];
  
  const results = await db.select({
    expertId: expertConsultations.expertId,
    expertName: expertConsultations.expertName,
    averageRating: sql<number>`AVG(${expertConsultations.userRating})`,
    consultationCount: sql<number>`COUNT(*)`
  })
    .from(expertConsultations)
    .where(and(
      eq(expertConsultations.userId, userId),
      sql`${expertConsultations.userRating} IS NOT NULL`
    ))
    .groupBy(expertConsultations.expertId, expertConsultations.expertName)
    .having(sql`COUNT(*) >= 1`)
    .orderBy(desc(sql`AVG(${expertConsultations.userRating})`))
    .limit(limit);
  
  return results;
}

// Get most used experts
export async function getMostUsedExperts(userId: number, limit: number = 10): Promise<{
  expertId: string;
  expertName: string;
  consultationCount: number;
  totalMessages: number;
}[]> {
  const db = await getDb();
  if (!db) return [];
  
  const results = await db.select({
    expertId: expertConsultations.expertId,
    expertName: expertConsultations.expertName,
    consultationCount: sql<number>`COUNT(*)`,
    totalMessages: sql<number>`COALESCE(SUM(${expertConsultations.messageCount}), 0)`
  })
    .from(expertConsultations)
    .where(eq(expertConsultations.userId, userId))
    .groupBy(expertConsultations.expertId, expertConsultations.expertName)
    .orderBy(desc(sql`COUNT(*)`))
    .limit(limit);
  
  return results;
}

// Get expert consultation trends over time
export async function getExpertConsultationTrends(
  userId: number,
  months: number = 6
): Promise<{ month: string; consultationCount: number; uniqueExperts: number }[]> {
  const db = await getDb();
  if (!db) return [];
  
  const consultations = await db.select().from(expertConsultations)
    .where(eq(expertConsultations.userId, userId));
  
  const now = new Date();
  const trends: { month: string; consultationCount: number; uniqueExperts: number }[] = [];
  
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const monthStr = date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
    
    const monthConsultations = consultations.filter(c => {
      const consultDate = new Date(c.createdAt);
      return consultDate >= date && consultDate <= endOfMonth;
    });
    
    const uniqueExperts = new Set(monthConsultations.map(c => c.expertId)).size;
    
    trends.push({
      month: monthStr,
      consultationCount: monthConsultations.length,
      uniqueExperts
    });
  }
  
  return trends;
}

// Rate an expert consultation
export async function rateExpertConsultation(
  consultationId: number,
  rating: number,
  feedback?: string
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db.update(expertConsultations).set({
    userRating: rating,
    userFeedback: feedback
  }).where(eq(expertConsultations.id, consultationId));
}


// ============================================
// KPI Assessment & Customer Focus Group Functions
// ============================================

import {
  kpiCategories, InsertKpiCategory, KpiCategory,
  smeIndividualAssessments, InsertSmeIndividualAssessment, SmeIndividualAssessment,
  assessmentOutliers, InsertAssessmentOutlier, AssessmentOutlier,
  panelAssessmentAggregations, InsertPanelAssessmentAggregation, PanelAssessmentAggregation,
  kpiSnapshots, InsertKpiSnapshot, KpiSnapshot,
  expertConversationLogs, InsertExpertConversationLog, ExpertConversationLog,
  customerPersonas, InsertCustomerPersona, CustomerPersona,
  customerSurveys, InsertCustomerSurvey, CustomerSurvey,
  customerSurveyResponses, InsertCustomerSurveyResponse, CustomerSurveyResponse,
  customerFeedbackAggregations, InsertCustomerFeedbackAggregation, CustomerFeedbackAggregation,
  focusGroupSessions, InsertFocusGroupSession, FocusGroupSession,
  innovationValidationCheckpoints, InsertInnovationValidationCheckpoint, InnovationValidationCheckpoint,
  insightsRepository, InsertInsightRepository, InsightRepository,
  externalResearchReferences, InsertExternalResearchReference, ExternalResearchReference,
  priorResearchChecks, InsertPriorResearchCheck, PriorResearchCheck,
  insightUsageLog, InsertInsightUsageLog, InsightUsageLog,
  knowledgeTopics, InsertKnowledgeTopic, KnowledgeTopic,
  userActivityTracking, InsertUserActivityTracking, UserActivityTracking,
  workflowPatterns, InsertWorkflowPattern, WorkflowPattern,
  proactiveRecommendations, InsertProactiveRecommendation, ProactiveRecommendation,
  outputQualityScores, InsertOutputQualityScore, OutputQualityScore,
  qualityImprovementTickets, InsertQualityImprovementTicket, QualityImprovementTicket,
  qualityMetricsSnapshots, InsertQualityMetricsSnapshot, QualityMetricsSnapshot
} from "../drizzle/schema";

// KPI Categories
export async function createKpiCategory(data: InsertKpiCategory): Promise<KpiCategory | null> {
  const db = await getDb();
  if (!db) return null;
  
  const [result] = await db.insert(kpiCategories).values(data);
  const [category] = await db.select().from(kpiCategories).where(eq(kpiCategories.id, result.insertId));
  return category;
}

export async function getKpiCategories(): Promise<KpiCategory[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(kpiCategories).orderBy(kpiCategories.categoryNumber);
}

// SME Individual Assessments
export async function createSmeAssessment(data: InsertSmeIndividualAssessment): Promise<SmeIndividualAssessment | null> {
  const db = await getDb();
  if (!db) return null;
  
  const [result] = await db.insert(smeIndividualAssessments).values(data);
  const [assessment] = await db.select().from(smeIndividualAssessments).where(eq(smeIndividualAssessments.id, result.insertId));
  return assessment;
}

export async function getSmeAssessments(categoryId?: number, expertId?: string): Promise<SmeIndividualAssessment[]> {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select().from(smeIndividualAssessments);
  
  if (categoryId && expertId) {
    return db.select().from(smeIndividualAssessments)
      .where(and(
        eq(smeIndividualAssessments.categoryId, categoryId),
        eq(smeIndividualAssessments.expertId, expertId)
      ));
  } else if (categoryId) {
    return db.select().from(smeIndividualAssessments)
      .where(eq(smeIndividualAssessments.categoryId, categoryId));
  } else if (expertId) {
    return db.select().from(smeIndividualAssessments)
      .where(eq(smeIndividualAssessments.expertId, expertId));
  }
  
  return db.select().from(smeIndividualAssessments);
}

export async function getAssessmentsBySnapshot(assessmentPeriod: string): Promise<SmeIndividualAssessment[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(smeIndividualAssessments)
    .where(eq(smeIndividualAssessments.assessmentPeriod, assessmentPeriod));
}

// Assessment Outliers
export async function createAssessmentOutlier(data: InsertAssessmentOutlier): Promise<AssessmentOutlier | null> {
  const db = await getDb();
  if (!db) return null;
  
  const [result] = await db.insert(assessmentOutliers).values(data);
  const [outlier] = await db.select().from(assessmentOutliers).where(eq(assessmentOutliers.id, result.insertId));
  return outlier;
}

export async function getUnresolvedOutliers(): Promise<AssessmentOutlier[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(assessmentOutliers)
    .where(eq(assessmentOutliers.reviewStatus, 'pending'))
    .orderBy(desc(assessmentOutliers.deviation));
}

export async function resolveOutlier(id: number, resolution: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db.update(assessmentOutliers).set({
    reviewStatus: 'resolved',
    resolutionNotes: resolution,
    resolvedAt: new Date()
  }).where(eq(assessmentOutliers.id, id));
}

// KPI Snapshots
export async function createKpiSnapshot(data: InsertKpiSnapshot): Promise<KpiSnapshot | null> {
  const db = await getDb();
  if (!db) return null;
  
  const [result] = await db.insert(kpiSnapshots).values(data);
  const [snapshot] = await db.select().from(kpiSnapshots).where(eq(kpiSnapshots.id, result.insertId));
  return snapshot;
}

export async function getKpiSnapshots(limit: number = 10): Promise<KpiSnapshot[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(kpiSnapshots)
    .orderBy(desc(kpiSnapshots.createdAt))
    .limit(limit);
}

export async function getLatestKpiSnapshot(): Promise<KpiSnapshot | null> {
  const db = await getDb();
  if (!db) return null;
  
  const [snapshot] = await db.select().from(kpiSnapshots)
    .orderBy(desc(kpiSnapshots.createdAt))
    .limit(1);
  return snapshot || null;
}

// Customer Personas
export async function createCustomerPersona(data: InsertCustomerPersona): Promise<CustomerPersona | null> {
  const db = await getDb();
  if (!db) return null;
  
  const [result] = await db.insert(customerPersonas).values(data);
  const [persona] = await db.select().from(customerPersonas).where(eq(customerPersonas.id, result.insertId));
  return persona;
}

export async function getCustomerPersonas(filters?: {
  industry?: string;
  incomeLevel?: string;
  minAge?: number;
  maxAge?: number;
}): Promise<CustomerPersona[]> {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select().from(customerPersonas).where(eq(customerPersonas.isActive, true));
  
  // Note: For complex filtering, we'd need to build conditions dynamically
  // For now, return all active personas
  return db.select().from(customerPersonas).where(eq(customerPersonas.isActive, true));
}

// Customer Surveys
export async function createCustomerSurvey(data: InsertCustomerSurvey): Promise<CustomerSurvey | null> {
  const db = await getDb();
  if (!db) return null;
  
  const [result] = await db.insert(customerSurveys).values(data);
  const [survey] = await db.select().from(customerSurveys).where(eq(customerSurveys.id, result.insertId));
  return survey;
}

export async function getCustomerSurveys(status?: 'draft' | 'active' | 'completed' | 'archived'): Promise<CustomerSurvey[]> {
  const db = await getDb();
  if (!db) return [];
  
  if (status) {
    return db.select().from(customerSurveys).where(eq(customerSurveys.status, status));
  }
  return db.select().from(customerSurveys).orderBy(desc(customerSurveys.createdAt));
}

export async function updateSurveyStatus(id: number, status: 'draft' | 'active' | 'completed' | 'archived'): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db.update(customerSurveys).set({ status }).where(eq(customerSurveys.id, id));
}

// Survey Responses
export async function createSurveyResponse(data: InsertCustomerSurveyResponse): Promise<CustomerSurveyResponse | null> {
  const db = await getDb();
  if (!db) return null;
  
  const [result] = await db.insert(customerSurveyResponses).values(data);
  const [response] = await db.select().from(customerSurveyResponses).where(eq(customerSurveyResponses.id, result.insertId));
  return response;
}

export async function getSurveyResponses(surveyId: number): Promise<CustomerSurveyResponse[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(customerSurveyResponses)
    .where(eq(customerSurveyResponses.surveyId, surveyId));
}

// Focus Group Sessions
export async function createFocusGroupSession(data: InsertFocusGroupSession): Promise<FocusGroupSession | null> {
  const db = await getDb();
  if (!db) return null;
  
  const [result] = await db.insert(focusGroupSessions).values(data);
  const [session] = await db.select().from(focusGroupSessions).where(eq(focusGroupSessions.id, result.insertId));
  return session;
}

export async function getFocusGroupSessions(status?: 'planned' | 'in_progress' | 'completed' | 'analyzed'): Promise<FocusGroupSession[]> {
  const db = await getDb();
  if (!db) return [];
  
  if (status) {
    return db.select().from(focusGroupSessions).where(eq(focusGroupSessions.status, status));
  }
  return db.select().from(focusGroupSessions).orderBy(desc(focusGroupSessions.createdAt));
}

// Insights Repository
export async function createInsight(data: InsertInsightRepository): Promise<InsightRepository | null> {
  const db = await getDb();
  if (!db) return null;
  
  const [result] = await db.insert(insightsRepository).values(data);
  const [insight] = await db.select().from(insightsRepository).where(eq(insightsRepository.id, result.insertId));
  return insight;
}

export async function getInsights(filters?: {
  category?: 'customer_need' | 'pricing_insight' | 'feature_request' | 'market_trend' | 'competitive_intelligence' | 'user_behavior' | 'pain_point' | 'opportunity' | 'risk' | 'validation_result' | 'technical_feedback' | 'ux_feedback' | 'business_model' | 'regulatory' | 'other';
  sourceType?: string;
  search?: string;
}): Promise<InsightRepository[]> {
  const db = await getDb();
  if (!db) return [];
  
  if (filters?.category) {
    return db.select().from(insightsRepository)
      .where(eq(insightsRepository.category, filters.category))
      .orderBy(desc(insightsRepository.capturedAt));
  }
  
  return db.select().from(insightsRepository)
    .orderBy(desc(insightsRepository.capturedAt));
}

export async function incrementInsightUsageCount(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db.update(insightsRepository).set({
    timesReferenced: sql`${insightsRepository.timesReferenced} + 1`,
    lastReferencedAt: new Date()
  }).where(eq(insightsRepository.id, id));
}

// Prior Research Checks
export async function createPriorResearchCheck(data: InsertPriorResearchCheck): Promise<PriorResearchCheck | null> {
  const db = await getDb();
  if (!db) return null;
  
  const [result] = await db.insert(priorResearchChecks).values(data);
  const [check] = await db.select().from(priorResearchChecks).where(eq(priorResearchChecks.id, result.insertId));
  return check;
}

export async function getPriorResearchChecks(topic?: string): Promise<PriorResearchCheck[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(priorResearchChecks)
    .orderBy(desc(priorResearchChecks.checkedAt));
}

// User Activity Tracking
export async function trackUserActivity(data: InsertUserActivityTracking): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db.insert(userActivityTracking).values(data);
}

export async function getUserActivityHistory(userId: number, limit: number = 100): Promise<UserActivityTracking[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(userActivityTracking)
    .where(eq(userActivityTracking.userId, userId))
    .orderBy(desc(userActivityTracking.createdAt))
    .limit(limit);
}

// Proactive Recommendations
export async function createProactiveRecommendation(data: InsertProactiveRecommendation): Promise<ProactiveRecommendation | null> {
  const db = await getDb();
  if (!db) return null;
  
  const [result] = await db.insert(proactiveRecommendations).values(data);
  const [rec] = await db.select().from(proactiveRecommendations).where(eq(proactiveRecommendations.id, result.insertId));
  return rec;
}

export async function getPendingRecommendations(userId: number): Promise<ProactiveRecommendation[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(proactiveRecommendations)
    .where(and(
      eq(proactiveRecommendations.userId, userId),
      eq(proactiveRecommendations.status, 'pending')
    ))
    .orderBy(desc(proactiveRecommendations.priority));
}

export async function updateRecommendationStatus(id: number, status: 'pending' | 'viewed' | 'accepted' | 'rejected' | 'implemented'): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db.update(proactiveRecommendations).set({ status }).where(eq(proactiveRecommendations.id, id));
}

// Output Quality Scores
export async function createOutputQualityScore(data: InsertOutputQualityScore): Promise<OutputQualityScore | null> {
  const db = await getDb();
  if (!db) return null;
  
  const [result] = await db.insert(outputQualityScores).values(data);
  const [score] = await db.select().from(outputQualityScores).where(eq(outputQualityScores.id, result.insertId));
  return score;
}

export async function getOutputQualityScores(filters?: {
  userId?: number;
  outputType?: string;
  minScore?: number;
  maxScore?: number;
}): Promise<OutputQualityScore[]> {
  const db = await getDb();
  if (!db) return [];
  
  if (filters?.userId) {
    return db.select().from(outputQualityScores)
      .where(eq(outputQualityScores.userId, filters.userId))
      .orderBy(desc(outputQualityScores.scoredAt));
  }
  
  return db.select().from(outputQualityScores)
    .orderBy(desc(outputQualityScores.scoredAt));
}

export async function getLowQualityOutputs(threshold: number = 4): Promise<OutputQualityScore[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(outputQualityScores)
    .where(lte(outputQualityScores.score, threshold))
    .orderBy(outputQualityScores.score);
}

// Quality Improvement Tickets
export async function createQualityTicket(data: InsertQualityImprovementTicket): Promise<QualityImprovementTicket | null> {
  const db = await getDb();
  if (!db) return null;
  
  const [result] = await db.insert(qualityImprovementTickets).values(data);
  const [ticket] = await db.select().from(qualityImprovementTickets).where(eq(qualityImprovementTickets.id, result.insertId));
  return ticket;
}

export async function getOpenQualityTickets(): Promise<QualityImprovementTicket[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(qualityImprovementTickets)
    .where(eq(qualityImprovementTickets.status, 'open'))
    .orderBy(desc(qualityImprovementTickets.priority));
}

export async function updateQualityTicket(id: number, updates: Partial<QualityImprovementTicket>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db.update(qualityImprovementTickets).set(updates).where(eq(qualityImprovementTickets.id, id));
}

// Quality Metrics Snapshots
export async function createQualityMetricsSnapshot(data: InsertQualityMetricsSnapshot): Promise<QualityMetricsSnapshot | null> {
  const db = await getDb();
  if (!db) return null;
  
  const [result] = await db.insert(qualityMetricsSnapshots).values(data);
  const [snapshot] = await db.select().from(qualityMetricsSnapshots).where(eq(qualityMetricsSnapshots.id, result.insertId));
  return snapshot;
}

export async function getQualityMetricsHistory(limit: number = 30): Promise<QualityMetricsSnapshot[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(qualityMetricsSnapshots)
    .orderBy(desc(qualityMetricsSnapshots.snapshotDate))
    .limit(limit);
}


// ==================== DIGITAL TWIN QUESTIONNAIRE ====================
import { questionnaireResponses, InsertQuestionnaireResponse, QuestionnaireResponse, digitalTwinProfile, InsertDigitalTwinProfile, DigitalTwinProfile } from "../drizzle/schema";

export async function saveQuestionnaireResponse(response: InsertQuestionnaireResponse): Promise<QuestionnaireResponse | null> {
  const db = await getDb();
  if (!db) {
    log.warn("Cannot save questionnaire response: database not available");
    return null;
  }

  try {
    // Upsert - update if exists, insert if not
    const existing = await db.select()
      .from(questionnaireResponses)
      .where(and(
        eq(questionnaireResponses.userId, response.userId),
        eq(questionnaireResponses.questionId, response.questionId)
      ))
      .limit(1);

    if (existing.length > 0) {
      await db.update(questionnaireResponses)
        .set({
          scaleValue: response.scaleValue,
          booleanValue: response.booleanValue,
          section: response.section,
        })
        .where(eq(questionnaireResponses.id, existing[0].id));
      
      const [updated] = await db.select().from(questionnaireResponses).where(eq(questionnaireResponses.id, existing[0].id));
      return updated;
    } else {
      const result = await db.insert(questionnaireResponses).values(response);
      const insertId = result[0].insertId;
      const [newEntry] = await db.select().from(questionnaireResponses).where(eq(questionnaireResponses.id, insertId));
      return newEntry;
    }
  } catch (error) {
    log.error("Failed to save questionnaire response:", error);
    throw error;
  }
}

export async function saveBulkQuestionnaireResponses(userId: number, responses: Array<{
  questionId: string;
  questionType: 'scale' | 'boolean';
  scaleValue?: number;
  booleanValue?: boolean;
  section?: string;
}>): Promise<number> {
  const db = await getDb();
  if (!db) {
    log.warn("Cannot save questionnaire responses: database not available");
    return 0;
  }

  try {
    let savedCount = 0;
    for (const response of responses) {
      await saveQuestionnaireResponse({
        userId,
        questionId: response.questionId,
        questionType: response.questionType,
        scaleValue: response.scaleValue,
        booleanValue: response.booleanValue,
        section: response.section,
      });
      savedCount++;
    }
    return savedCount;
  } catch (error) {
    log.error("Failed to save bulk questionnaire responses:", error);
    throw error;
  }
}

export async function getQuestionnaireResponses(userId: number): Promise<QuestionnaireResponse[]> {
  const db = await getDb();
  if (!db) {
    log.warn("Cannot get questionnaire responses: database not available");
    return [];
  }

  try {
    const results = await db.select()
      .from(questionnaireResponses)
      .where(eq(questionnaireResponses.userId, userId))
      .orderBy(questionnaireResponses.questionId);
    
    return results;
  } catch (error) {
    log.error("Failed to get questionnaire responses:", error);
    return [];
  }
}

export async function getQuestionnaireCompletionPercentage(userId: number): Promise<number> {
  const db = await getDb();
  if (!db) {
    return 0;
  }

  try {
    const responses = await db.select()
      .from(questionnaireResponses)
      .where(eq(questionnaireResponses.userId, userId));
    
    // Total questions is 200
    const totalQuestions = 200;
    const completedQuestions = responses.length;
    
    return Math.round((completedQuestions / totalQuestions) * 100);
  } catch (error) {
    log.error("Failed to get questionnaire completion:", error);
    return 0;
  }
}

export async function getDigitalTwinProfile(userId: number): Promise<DigitalTwinProfile | null> {
  const db = await getDb();
  if (!db) {
    log.warn("Cannot get digital twin profile: database not available");
    return null;
  }

  try {
    const [profile] = await db.select()
      .from(digitalTwinProfile)
      .where(eq(digitalTwinProfile.userId, userId))
      .limit(1);
    
    return profile || null;
  } catch (error) {
    log.error("Failed to get digital twin profile:", error);
    return null;
  }
}

export async function upsertDigitalTwinProfile(profile: InsertDigitalTwinProfile): Promise<DigitalTwinProfile | null> {
  const db = await getDb();
  if (!db) {
    log.warn("Cannot upsert digital twin profile: database not available");
    return null;
  }

  try {
    const existing = await db.select()
      .from(digitalTwinProfile)
      .where(eq(digitalTwinProfile.userId, profile.userId))
      .limit(1);

    if (existing.length > 0) {
      await db.update(digitalTwinProfile)
        .set({
          ...profile,
          lastCalculated: new Date(),
        })
        .where(eq(digitalTwinProfile.id, existing[0].id));
      
      const [updated] = await db.select().from(digitalTwinProfile).where(eq(digitalTwinProfile.id, existing[0].id));
      return updated;
    } else {
      const result = await db.insert(digitalTwinProfile).values({
        ...profile,
        lastCalculated: new Date(),
      });
      const insertId = result[0].insertId;
      const [newEntry] = await db.select().from(digitalTwinProfile).where(eq(digitalTwinProfile.id, insertId));
      return newEntry;
    }
  } catch (error) {
    log.error("Failed to upsert digital twin profile:", error);
    throw error;
  }
}

export async function calculateDigitalTwinProfile(userId: number): Promise<DigitalTwinProfile | null> {
  const db = await getDb();
  if (!db) {
    return null;
  }

  try {
    // Get all questionnaire responses
    const responses = await getQuestionnaireResponses(userId);
    
    if (responses.length === 0) {
      return null;
    }

    // Calculate profile scores from responses
    // Map question IDs to profile fields
    const profileData: Partial<InsertDigitalTwinProfile> = {
      userId,
      cosUnderstandingLevel: Math.round((responses.length / 200) * 100),
      questionnaireCompletion: responses.length,
    };

    // Map specific questions to profile fields
    for (const response of responses) {
      if (response.questionType === 'scale' && response.scaleValue !== null) {
        switch (response.questionId) {
          case 'A52':
            profileData.measurementDriven = response.scaleValue;
            break;
          case 'A53':
            profileData.processStandardization = response.scaleValue;
            break;
          case 'A60':
            profileData.automationPreference = response.scaleValue;
            break;
          case 'A58':
            profileData.ambiguityTolerance = response.scaleValue;
            break;
          case 'A61':
            profileData.techAdoptionSpeed = response.scaleValue;
            break;
          case 'A62':
            profileData.aiBeliefLevel = response.scaleValue;
            break;
          case 'A70':
            profileData.dataVsIntuition = response.scaleValue;
            break;
          case 'A65':
            profileData.nicheVsMass = response.scaleValue;
            break;
          case 'A51':
            profileData.firstMoverVsFollower = response.scaleValue;
            break;
          case 'A57':
            profileData.structurePreference = response.scaleValue;
            break;
          case 'A66':
            profileData.scenarioPlanningLevel = response.scaleValue;
            break;
          case 'A59':
            profileData.pivotComfort = response.scaleValue;
            break;
        }
      }
    }

    // Upsert the profile
    return await upsertDigitalTwinProfile(profileData as InsertDigitalTwinProfile);
  } catch (error) {
    log.error("Failed to calculate digital twin profile:", error);
    return null;
  }
}


// ============================================
// Expert Recommendation Functions - 18 Jan 2026
// ============================================

import * as schema from "../drizzle/schema";

// NPS Tracking
export async function saveNpsResponse(userId: number, score: number, feedback?: string, touchpoint?: string) {
  const db = await getDb();
  if (!db) return null;
  
  const category = score >= 9 ? 'promoter' : score >= 7 ? 'passive' : 'detractor';
  const result = await db.insert(schema.npsResponses).values({
    userId,
    score,
    category: category as 'promoter' | 'passive' | 'detractor',
    feedback,
    touchpoint,
  });
  return result;
}

export async function getNpsStats() {
  const db = await getDb();
  if (!db) return { promoters: 0, passives: 0, detractors: 0, npsScore: 0, totalResponses: 0 };
  
  const responses = await db.select().from(schema.npsResponses);
  const promoters = responses.filter(r => r.category === 'promoter').length;
  const passives = responses.filter(r => r.category === 'passive').length;
  const detractors = responses.filter(r => r.category === 'detractor').length;
  const total = responses.length;
  const npsScore = total > 0 ? Math.round(((promoters - detractors) / total) * 100) : 0;
  
  return { promoters, passives, detractors, npsScore, totalResponses: total };
}

// Customer Health
export async function updateCustomerHealth(userId: number, healthScore: number, engagementLevel: 'low' | 'medium' | 'high' | 'champion') {
  const db = await getDb();
  if (!db) return null;
  
  const existing = await db.select().from(schema.customerHealth).where(eq(schema.customerHealth.userId, userId)).limit(1);
  if (existing.length > 0) {
    await db.update(schema.customerHealth)
      .set({ healthScore, engagementLevel, lastActiveDate: new Date() })
      .where(eq(schema.customerHealth.userId, userId));
  } else {
    await db.insert(schema.customerHealth).values({
      userId,
      healthScore,
      engagementLevel,
      lastActiveDate: new Date(),
    });
  }
}

export async function getCustomerHealthStats() {
  const db = await getDb();
  if (!db) return { totalCustomers: 0, avgHealthScore: 0, atRisk: 0, champions: 0 };
  
  const records = await db.select().from(schema.customerHealth);
  const total = records.length;
  const avgHealth = total > 0 ? Math.round(records.reduce((sum, r) => sum + r.healthScore, 0) / total) : 0;
  const atRisk = records.filter(r => r.riskLevel === 'high' || r.riskLevel === 'critical').length;
  const champions = records.filter(r => r.engagementLevel === 'champion').length;
  
  return { totalCustomers: total, avgHealthScore: avgHealth, atRisk, champions };
}

// Partnerships
export async function getPartnerships(status?: string) {
  const db = await getDb();
  if (!db) return [];
  
  if (status) {
    return db.select().from(schema.partnerships).where(eq(schema.partnerships.status, status as any));
  }
  return db.select().from(schema.partnerships).orderBy(desc(schema.partnerships.updatedAt));
}

export async function createPartnership(data: {
  name: string;
  type: 'technology' | 'distribution' | 'strategic' | 'integration' | 'referral';
  status: 'prospect' | 'contacted' | 'negotiating' | 'active' | 'inactive' | 'churned';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  contactName?: string;
  contactEmail?: string;
  notes?: string;
}) {
  const db = await getDb();
  if (!db) return null;
  
  return db.insert(schema.partnerships).values(data);
}

// Team Capabilities
export async function getTeamCapabilities() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(schema.teamCapabilities).orderBy(schema.teamCapabilities.skillCategory);
}

export async function addTeamCapability(data: {
  teamMember: string;
  role: string;
  skillCategory: string;
  skillName: string;
  currentLevel: number;
  targetLevel?: number;
  developmentPlan?: string;
}) {
  const db = await getDb();
  if (!db) return null;
  
  const gap = data.targetLevel ? data.targetLevel - data.currentLevel : null;
  return db.insert(schema.teamCapabilities).values({
    ...data,
    gap,
    lastAssessed: new Date(),
  });
}

// Compliance Items
export async function getComplianceItems(framework?: string) {
  const db = await getDb();
  if (!db) return [];
  
  if (framework) {
    return db.select().from(schema.complianceItems).where(eq(schema.complianceItems.framework, framework as any));
  }
  return db.select().from(schema.complianceItems).orderBy(schema.complianceItems.category);
}

export async function createComplianceItem(data: {
  framework: 'soc2' | 'gdpr' | 'hipaa' | 'iso27001' | 'wcag';
  category: string;
  requirement: string;
  status: 'not_started' | 'in_progress' | 'implemented' | 'verified' | 'na';
  owner?: string;
  dueDate?: Date;
}) {
  const db = await getDb();
  if (!db) return null;
  
  return db.insert(schema.complianceItems).values(data);
}

export async function updateComplianceStatus(id: number, status: 'not_started' | 'in_progress' | 'implemented' | 'verified' | 'na', evidence?: string) {
  const db = await getDb();
  if (!db) return null;
  
  const completedDate = status === 'verified' ? new Date() : null;
  return db.update(schema.complianceItems)
    .set({ status, evidence, completedDate })
    .where(eq(schema.complianceItems.id, id));
}

// RAG Context
export async function saveRagContext(userId: number, contextType: 'conversation' | 'document' | 'preference' | 'decision' | 'memory', content: string, metadata?: any) {
  const db = await getDb();
  if (!db) return null;
  
  return db.insert(schema.ragContexts).values({
    userId,
    contextType,
    content,
    metadata,
  });
}

export async function getRagContexts(userId: number, contextType?: string, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [eq(schema.ragContexts.userId, userId)];
  if (contextType) {
    conditions.push(eq(schema.ragContexts.contextType, contextType as any));
  }
  return db.select()
    .from(schema.ragContexts)
    .where(and(...conditions))
    .orderBy(desc(schema.ragContexts.createdAt))
    .limit(limit);
}
