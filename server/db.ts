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
