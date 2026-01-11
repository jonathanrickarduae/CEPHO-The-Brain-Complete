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
