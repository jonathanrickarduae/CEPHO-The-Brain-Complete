import { eq, desc, and, gte, lte, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, moodHistory, InsertMoodHistory, MoodHistory, conversations, InsertConversation, Conversation } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

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

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ==================== MOOD HISTORY ====================

export async function createMoodEntry(entry: InsertMoodHistory): Promise<MoodHistory | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create mood entry: database not available");
    return null;
  }

  try {
    const result = await db.insert(moodHistory).values(entry);
    const insertId = result[0].insertId;
    const [newEntry] = await db.select().from(moodHistory).where(eq(moodHistory.id, insertId));
    return newEntry;
  } catch (error) {
    console.error("[Database] Failed to create mood entry:", error);
    throw error;
  }
}

export async function getMoodHistory(
  userId: number,
  options?: { limit?: number; startDate?: Date; endDate?: Date }
): Promise<MoodHistory[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get mood history: database not available");
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
    console.error("[Database] Failed to get mood history:", error);
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
    console.error("[Database] Failed to get mood trends:", error);
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
    console.error("[Database] Failed to get last mood check:", error);
    return null;
  }
}

// ==================== CONVERSATIONS ====================

export async function saveConversation(entry: InsertConversation): Promise<Conversation | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot save conversation: database not available");
    return null;
  }

  try {
    const result = await db.insert(conversations).values(entry);
    const insertId = result[0].insertId;
    const [newEntry] = await db.select().from(conversations).where(eq(conversations.id, insertId));
    return newEntry;
  } catch (error) {
    console.error("[Database] Failed to save conversation:", error);
    throw error;
  }
}

export async function getConversationHistory(
  userId: number,
  limit: number = 50
): Promise<Conversation[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get conversation history: database not available");
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
    console.error("[Database] Failed to get conversation history:", error);
    return [];
  }
}

export async function clearConversationHistory(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    await db.delete(conversations).where(eq(conversations.userId, userId));
  } catch (error) {
    console.error("[Database] Failed to clear conversation history:", error);
  }
}

// TODO: add more feature queries here as your schema grows.


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
    console.error("[Database] Failed to create integration:", error);
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
    console.error("[Database] Failed to get integrations:", error);
    return [];
  }
}

export async function updateIntegration(id: number, data: Partial<InsertIntegration>): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    await db.update(integrations).set(data).where(eq(integrations.id, id));
  } catch (error) {
    console.error("[Database] Failed to update integration:", error);
    throw error;
  }
}

export async function deleteIntegration(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    await db.delete(integrations).where(eq(integrations.id, id));
  } catch (error) {
    console.error("[Database] Failed to delete integration:", error);
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
    console.error("[Database] Failed to create notification:", error);
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
    console.error("[Database] Failed to get notifications:", error);
    return [];
  }
}

export async function markNotificationRead(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    await db.update(notifications).set({ read: true, readAt: new Date() }).where(eq(notifications.id, id));
  } catch (error) {
    console.error("[Database] Failed to mark notification read:", error);
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
    console.error("[Database] Failed to mark all notifications read:", error);
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
    console.error("[Database] Failed to create project:", error);
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
    console.error("[Database] Failed to get projects:", error);
    return [];
  }
}

export async function updateProject(id: number, data: Partial<InsertProject>): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    await db.update(projects).set(data).where(eq(projects.id, id));
  } catch (error) {
    console.error("[Database] Failed to update project:", error);
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
    console.error("[Database] Failed to create project genesis:", error);
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
    console.error("[Database] Failed to get project genesis records:", error);
    return [];
  }
}

export async function updateProjectGenesis(id: number, data: Partial<InsertProjectGenesis>): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    await db.update(projectGenesis).set(data).where(eq(projectGenesis.id, id));
  } catch (error) {
    console.error("[Database] Failed to update project genesis:", error);
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
    console.error("[Database] Failed to get user settings:", error);
    return null;
  }
}

export async function upsertUserSettings(data: InsertUserSettings): Promise<UserSettings | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    await db.insert(userSettings).values(data).onDuplicateKeyUpdate({
      set: { ...data, updatedAt: new Date() },
    });
    return getUserSettings(data.userId);
  } catch (error) {
    console.error("[Database] Failed to upsert user settings:", error);
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
    console.error("[Database] Failed to create training document:", error);
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
    console.error("[Database] Failed to get training documents:", error);
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
    console.error("[Database] Failed to create memory:", error);
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
    console.error("[Database] Failed to get memories:", error);
    return [];
  }
}

export async function updateMemory(id: number, data: Partial<InsertMemoryBank>): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    await db.update(memoryBank).set({ ...data, lastAccessed: new Date() }).where(eq(memoryBank.id, id));
  } catch (error) {
    console.error("[Database] Failed to update memory:", error);
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
    console.error("[Database] Failed to record decision:", error);
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
    console.error("[Database] Failed to get decision patterns:", error);
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
    console.error("[Database] Failed to record feedback:", error);
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
    console.error("[Database] Failed to get feedback history:", error);
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
    console.error("[Database] Failed to create task:", error);
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
    console.error("[Database] Failed to get tasks:", error);
    return [];
  }
}

export async function updateTask(id: number, data: Partial<InsertTask>): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    await db.update(tasks).set(data).where(eq(tasks.id, id));
  } catch (error) {
    console.error("[Database] Failed to update task:", error);
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
    console.error("[Database] Failed to create inbox item:", error);
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
    console.error("[Database] Failed to get inbox items:", error);
    return [];
  }
}

export async function updateInboxItem(id: number, data: Partial<InsertUniversalInboxItem>): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    await db.update(universalInbox).set(data).where(eq(universalInbox.id, id));
  } catch (error) {
    console.error("[Database] Failed to update inbox item:", error);
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
    console.error("[Database] Failed to create audit entry:", error);
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
    console.error("[Database] Failed to get audit log:", error);
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


// ==================== DIGITAL TWIN PROFILE & ONBOARDING ====================

import { 
  digitalTwinProfile, InsertDigitalTwinProfile, DigitalTwinProfile,
  profileAnswers, InsertProfileAnswer, ProfileAnswer,
  dtDecisionPatterns, InsertDTDecisionPattern, DTDecisionPattern,
  communicationPreferences, InsertCommunicationPreference, CommunicationPreference,
  learningEvents, InsertLearningEvent, LearningEvent,
  autonomyLevels, InsertAutonomyLevel, AutonomyLevel,
} from "../drizzle/schema";

// ==================== DIGITAL TWIN PROFILE ====================

export async function getDigitalTwinProfile(userId: number): Promise<DigitalTwinProfile | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const [profile] = await db.select()
      .from(digitalTwinProfile)
      .where(eq(digitalTwinProfile.userId, userId))
      .limit(1);
    return profile || null;
  } catch (error) {
    console.error("[Database] Failed to get digital twin profile:", error);
    return null;
  }
}

export async function upsertDigitalTwinProfile(data: InsertDigitalTwinProfile): Promise<DigitalTwinProfile | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    // Check if profile exists
    const existing = await getDigitalTwinProfile(data.userId);
    
    if (existing) {
      // Update existing profile
      await db.update(digitalTwinProfile)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(digitalTwinProfile.userId, data.userId));
    } else {
      // Insert new profile
      await db.insert(digitalTwinProfile).values(data);
    }
    
    return getDigitalTwinProfile(data.userId);
  } catch (error) {
    console.error("[Database] Failed to upsert digital twin profile:", error);
    return null;
  }
}

export async function updateDigitalTwinTrainingHours(userId: number, additionalHours: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    // Update profile completeness as a proxy for training progress
    const profile = await getDigitalTwinProfile(userId);
    const currentCompleteness = profile?.profileCompleteness ?? 0;
    const newCompleteness = Math.min(100, currentCompleteness + Math.round(additionalHours * 10));
    
    await db.update(digitalTwinProfile)
      .set({ 
        profileCompleteness: newCompleteness,
        lastProfileUpdate: new Date(),
        updatedAt: new Date()
      })
      .where(eq(digitalTwinProfile.userId, userId));
  } catch (error) {
    console.error("[Database] Failed to update training hours:", error);
  }
}

// ==================== PROFILE ANSWERS (ONBOARDING) ====================

export async function saveProfileAnswer(data: InsertProfileAnswer): Promise<ProfileAnswer | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    // Check if answer already exists for this question
    const [existing] = await db.select()
      .from(profileAnswers)
      .where(and(
        eq(profileAnswers.userId, data.userId),
        eq(profileAnswers.questionId, data.questionId)
      ))
      .limit(1);

    if (existing) {
      // Update existing answer
      await db.update(profileAnswers)
        .set({ 
          answer: data.answer,
          answerMetadata: data.answerMetadata,
          isProcessed: false, // Reset processing status
          updatedAt: new Date()
        })
        .where(eq(profileAnswers.id, existing.id));
      
      const [updated] = await db.select()
        .from(profileAnswers)
        .where(eq(profileAnswers.id, existing.id));
      return updated;
    } else {
      // Insert new answer
      const result = await db.insert(profileAnswers).values(data);
      const insertId = result[0].insertId;
      const [newAnswer] = await db.select()
        .from(profileAnswers)
        .where(eq(profileAnswers.id, insertId));
      return newAnswer;
    }
  } catch (error) {
    console.error("[Database] Failed to save profile answer:", error);
    return null;
  }
}

export async function getProfileAnswers(userId: number): Promise<ProfileAnswer[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    return db.select()
      .from(profileAnswers)
      .where(eq(profileAnswers.userId, userId))
      .orderBy(profileAnswers.createdAt);
  } catch (error) {
    console.error("[Database] Failed to get profile answers:", error);
    return [];
  }
}

export async function bulkSaveProfileAnswers(
  userId: number, 
  answers: Array<{ questionId: string; answer: string; metadata?: any }>
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    for (const answer of answers) {
      await saveProfileAnswer({
        userId,
        questionId: parseInt(answer.questionId) || 0,
        answer: answer.answer,
        answerMetadata: answer.metadata,
      });
    }
  } catch (error) {
    console.error("[Database] Failed to bulk save profile answers:", error);
  }
}

// ==================== DECISION PATTERNS ====================

export async function saveDtDecisionPattern(data: InsertDTDecisionPattern): Promise<DTDecisionPattern | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.insert(dtDecisionPatterns).values(data);
    const insertId = result[0].insertId;
    const [newPattern] = await db.select()
      .from(dtDecisionPatterns)
      .where(eq(dtDecisionPatterns.id, insertId));
    return newPattern;
  } catch (error) {
    console.error("[Database] Failed to save decision pattern:", error);
    return null;
  }
}

export async function getDtDecisionPatterns(userId: number, category?: string): Promise<DTDecisionPattern[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    const conditions = [eq(dtDecisionPatterns.userId, userId)];
    if (category) {
      conditions.push(eq(dtDecisionPatterns.category, category as any));
    }
    
    return db.select()
      .from(dtDecisionPatterns)
      .where(and(...conditions))
      .orderBy(desc(dtDecisionPatterns.confidence));
  } catch (error) {
    console.error("[Database] Failed to get decision patterns:", error);
    return [];
  }
}

// ==================== COMMUNICATION PREFERENCES ====================

export async function upsertCommunicationPreference(data: InsertCommunicationPreference): Promise<CommunicationPreference | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const [existing] = await db.select()
      .from(communicationPreferences)
      .where(eq(communicationPreferences.userId, data.userId))
      .limit(1);

    if (existing) {
      await db.update(communicationPreferences)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(communicationPreferences.userId, data.userId));
    } else {
      await db.insert(communicationPreferences).values(data);
    }

    const [result] = await db.select()
      .from(communicationPreferences)
      .where(eq(communicationPreferences.userId, data.userId));
    return result;
  } catch (error) {
    console.error("[Database] Failed to upsert communication preference:", error);
    return null;
  }
}

export async function getCommunicationPreference(userId: number): Promise<CommunicationPreference | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const [pref] = await db.select()
      .from(communicationPreferences)
      .where(eq(communicationPreferences.userId, userId))
      .limit(1);
    return pref || null;
  } catch (error) {
    console.error("[Database] Failed to get communication preference:", error);
    return null;
  }
}

// ==================== LEARNING EVENTS ====================

export async function recordLearningEvent(data: InsertLearningEvent): Promise<LearningEvent | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.insert(learningEvents).values(data);
    const insertId = result[0].insertId;
    const [newEvent] = await db.select()
      .from(learningEvents)
      .where(eq(learningEvents.id, insertId));
    return newEvent;
  } catch (error) {
    console.error("[Database] Failed to record learning event:", error);
    return null;
  }
}

export async function getLearningEvents(
  userId: number, 
  options?: { eventType?: string; limit?: number; days?: number }
): Promise<LearningEvent[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    const conditions = [eq(learningEvents.userId, userId)];
    
    if (options?.eventType) {
      conditions.push(eq(learningEvents.eventType, options.eventType as any));
    }
    
    if (options?.days) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - options.days);
      conditions.push(gte(learningEvents.createdAt, startDate));
    }

    return db.select()
      .from(learningEvents)
      .where(and(...conditions))
      .orderBy(desc(learningEvents.createdAt))
      .limit(options?.limit || 100);
  } catch (error) {
    console.error("[Database] Failed to get learning events:", error);
    return [];
  }
}

// ==================== AUTONOMY LEVELS ====================

export async function getAutonomyLevel(userId: number, domain: string): Promise<AutonomyLevel | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const [level] = await db.select()
      .from(autonomyLevels)
      .where(and(
        eq(autonomyLevels.userId, userId),
        eq(autonomyLevels.domain, domain)
      ))
      .limit(1);
    return level || null;
  } catch (error) {
    console.error("[Database] Failed to get autonomy level:", error);
    return null;
  }
}

export async function upsertAutonomyLevel(data: InsertAutonomyLevel): Promise<AutonomyLevel | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const existing = await getAutonomyLevel(data.userId, data.domain);
    
    if (existing) {
      await db.update(autonomyLevels)
        .set({ ...data, updatedAt: new Date() })
        .where(and(
          eq(autonomyLevels.userId, data.userId),
          eq(autonomyLevels.domain, data.domain)
        ));
    } else {
      await db.insert(autonomyLevels).values(data);
    }

    return getAutonomyLevel(data.userId, data.domain);
  } catch (error) {
    console.error("[Database] Failed to upsert autonomy level:", error);
    return null;
  }
}

export async function getAllAutonomyLevels(userId: number): Promise<AutonomyLevel[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    return db.select()
      .from(autonomyLevels)
      .where(eq(autonomyLevels.userId, userId))
      .orderBy(autonomyLevels.domain);
  } catch (error) {
    console.error("[Database] Failed to get all autonomy levels:", error);
    return [];
  }
}

// ==================== ONBOARDING COMPLETION CHECK ====================

export async function getOnboardingProgress(userId: number): Promise<{
  profileComplete: boolean;
  answersCount: number;
  trainingHours: number;
  maturityLevel: number;
}> {
  const db = await getDb();
  if (!db) return { profileComplete: false, answersCount: 0, trainingHours: 0, maturityLevel: 1 };

  try {
    const profile = await getDigitalTwinProfile(userId);
    const answers = await getProfileAnswers(userId);
    
    return {
      profileComplete: !!profile && (profile.profileCompleteness ?? 0) >= 50,
      answersCount: answers.length,
      trainingHours: 0, // Training hours tracked elsewhere
      maturityLevel: 1, // Calculated from profile completeness
    };
  } catch (error) {
    console.error("[Database] Failed to get onboarding progress:", error);
    return { profileComplete: false, answersCount: 0, trainingHours: 0, maturityLevel: 1 };
  }
}


// ==================== INVESTOR DATABASE ====================

import { 
  investors, capitalRaises, investorInteractions, investorCommitments,
  type Investor, type InsertInvestor,
  type InvestorInteraction, type InsertInvestorInteraction,
  type InvestorCommitment, type InsertInvestorCommitment
} from "../drizzle/schema";

// Create a new investor
export async function createInvestor(data: InsertInvestor): Promise<Investor | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.insert(investors).values(data);
    const insertId = result[0].insertId;
    const [newInvestor] = await db.select()
      .from(investors)
      .where(eq(investors.id, insertId));
    return newInvestor;
  } catch (error) {
    console.error("[Database] Failed to create investor:", error);
    return null;
  }
}

// Get all investors for a user
export async function getInvestors(userId: number): Promise<Investor[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    return db.select()
      .from(investors)
      .where(eq(investors.userId, userId))
      .orderBy(desc(investors.createdAt));
  } catch (error) {
    console.error("[Database] Failed to get investors:", error);
    return [];
  }
}

// Get investor by ID
export async function getInvestorById(id: number, userId: number): Promise<Investor | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const [investor] = await db.select()
      .from(investors)
      .where(and(eq(investors.id, id), eq(investors.userId, userId)))
      .limit(1);
    return investor || null;
  } catch (error) {
    console.error("[Database] Failed to get investor:", error);
    return null;
  }
}

// Update investor
export async function updateInvestor(id: number, userId: number, data: Partial<InsertInvestor>): Promise<Investor | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    await db.update(investors)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(investors.id, id), eq(investors.userId, userId)));
    return getInvestorById(id, userId);
  } catch (error) {
    console.error("[Database] Failed to update investor:", error);
    return null;
  }
}

// Delete investor
export async function deleteInvestor(id: number, userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db.delete(investors)
      .where(and(eq(investors.id, id), eq(investors.userId, userId)));
    return true;
  } catch (error) {
    console.error("[Database] Failed to delete investor:", error);
    return false;
  }
}

// Get investors by type
export async function getInvestorsByType(userId: number, type: string): Promise<Investor[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    return db.select()
      .from(investors)
      .where(and(
        eq(investors.userId, userId),
        eq(investors.type, type as any)
      ))
      .orderBy(desc(investors.createdAt));
  } catch (error) {
    console.error("[Database] Failed to get investors by type:", error);
    return [];
  }
}

// Get investors matching capital raise criteria
export async function matchInvestorsForRaise(
  userId: number, 
  amount: number, 
  sector?: string,
  stage?: string
): Promise<Investor[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    // Get all investors for user
    const allInvestors = await getInvestors(userId);
    
    // Filter by ticket size
    return allInvestors.filter(inv => {
      const minOk = !inv.ticketSizeMin || inv.ticketSizeMin <= amount;
      const maxOk = !inv.ticketSizeMax || inv.ticketSizeMax >= amount;
      
      // Check sector match if provided
      let sectorOk = true;
      if (sector && inv.sectors) {
        const sectors = inv.sectors as string[];
        sectorOk = sectors.includes(sector) || sectors.includes('all');
      }
      
      // Check stage match if provided
      let stageOk = true;
      if (stage && inv.stages) {
        const stages = inv.stages as string[];
        stageOk = stages.includes(stage) || stages.includes('all');
      }
      
      return minOk && maxOk && sectorOk && stageOk;
    });
  } catch (error) {
    console.error("[Database] Failed to match investors:", error);
    return [];
  }
}

// Record investor interaction
export async function recordInvestorInteraction(data: InsertInvestorInteraction): Promise<InvestorInteraction | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.insert(investorInteractions).values(data);
    const insertId = result[0].insertId;
    const [interaction] = await db.select()
      .from(investorInteractions)
      .where(eq(investorInteractions.id, insertId));
    return interaction;
  } catch (error) {
    console.error("[Database] Failed to record investor interaction:", error);
    return null;
  }
}

// Get interactions for an investor
export async function getInvestorInteractions(investorId: number): Promise<InvestorInteraction[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    return db.select()
      .from(investorInteractions)
      .where(eq(investorInteractions.investorId, investorId))
      .orderBy(desc(investorInteractions.interactionDate));
  } catch (error) {
    console.error("[Database] Failed to get investor interactions:", error);
    return [];
  }
}

// Record investor commitment
export async function recordInvestorCommitment(data: InsertInvestorCommitment): Promise<InvestorCommitment | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.insert(investorCommitments).values(data);
    const insertId = result[0].insertId;
    const [commitment] = await db.select()
      .from(investorCommitments)
      .where(eq(investorCommitments.id, insertId));
    return commitment;
  } catch (error) {
    console.error("[Database] Failed to record investor commitment:", error);
    return null;
  }
}

// Get commitments for a capital raise
export async function getCommitmentsForRaise(capitalRaiseId: number): Promise<InvestorCommitment[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    return db.select()
      .from(investorCommitments)
      .where(eq(investorCommitments.capitalRaiseId, capitalRaiseId))
      .orderBy(desc(investorCommitments.createdAt));
  } catch (error) {
    console.error("[Database] Failed to get commitments:", error);
    return [];
  }
}
