import { getDb } from '../../db';
import { moodHistory, InsertMoodHistory, MoodHistory } from '../../../drizzle/schema';
import { eq, and, gte, desc, sql } from 'drizzle-orm';

/**
 * Mood Repository
 * 
 * Handles all database operations for mood tracking.
 * Follows the repository pattern to separate data access from business logic.
 */
export class MoodRepository {
  /**
   * Create a new mood entry
   */
  async create(data: InsertMoodHistory): Promise<MoodHistory> {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    const [entry] = await db
      .insert(moodHistory)
      .values(data)
      .returning();

    return entry;
  }

  /**
   * Find mood entries by user ID
   * 
   * @param userId - User ID
   * @param days - Number of days to retrieve
   * @returns Array of mood entries
   */
  async findByUserId(userId: number, days: number = 30): Promise<MoodHistory[]> {
    const db = await getDb();
    if (!db) return [];

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return await db
      .select()
      .from(moodHistory)
      .where(
        and(
          eq(moodHistory.userId, userId),
          gte(moodHistory.createdAt, cutoffDate)
        )
      )
      .orderBy(desc(moodHistory.createdAt));
  }

  /**
   * Find mood entries for a specific date
   * 
   * @param userId - User ID
   * @param date - Date to query
   * @returns Array of mood entries for that date
   */
  async findByUserIdAndDate(userId: number, date: Date): Promise<MoodHistory[]> {
    const db = await getDb();
    if (!db) return [];

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await db
      .select()
      .from(moodHistory)
      .where(
        and(
          eq(moodHistory.userId, userId),
          gte(moodHistory.createdAt, startOfDay),
          sql`${moodHistory.createdAt} <= ${endOfDay}`
        )
      )
      .orderBy(desc(moodHistory.createdAt));
  }

  /**
   * Find mood entry by user ID, time of day, and date
   * 
   * @param userId - User ID
   * @param timeOfDay - Time of day (morning/afternoon/evening)
   * @param date - Date to query
   * @returns Mood entry if exists, null otherwise
   */
  async findByUserIdAndTimeOfDay(
    userId: number,
    timeOfDay: 'morning' | 'afternoon' | 'evening',
    date: Date
  ): Promise<MoodHistory | null> {
    const db = await getDb();
    if (!db) return null;

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const [entry] = await db
      .select()
      .from(moodHistory)
      .where(
        and(
          eq(moodHistory.userId, userId),
          eq(moodHistory.timeOfDay, timeOfDay),
          gte(moodHistory.createdAt, startOfDay),
          sql`${moodHistory.createdAt} <= ${endOfDay}`
        )
      )
      .limit(1);

    return entry || null;
  }

  /**
   * Delete mood entry by ID
   * 
   * @param id - Mood entry ID
   * @param userId - User ID (for authorization)
   * @returns Deleted entry
   */
  async delete(id: number, userId: number): Promise<MoodHistory | null> {
    const db = await getDb();
    if (!db) return null;

    const [deleted] = await db
      .delete(moodHistory)
      .where(
        and(
          eq(moodHistory.id, id),
          eq(moodHistory.userId, userId)
        )
      )
      .returning();

    return deleted || null;
  }

  /**
   * Update mood entry
   * 
   * @param id - Mood entry ID
   * @param userId - User ID (for authorization)
   * @param data - Updated data
   * @returns Updated entry
   */
  async update(
    id: number,
    userId: number,
    data: Partial<InsertMoodHistory>
  ): Promise<MoodHistory | null> {
    const db = await getDb();
    if (!db) return null;

    const [updated] = await db
      .update(moodHistory)
      .set(data)
      .where(
        and(
          eq(moodHistory.id, id),
          eq(moodHistory.userId, userId)
        )
      )
      .returning();

    return updated || null;
  }
}
