/**
 * Mood Repository
 * 
 * Handles all database operations related to mood tracking and voice notes.
 * 
 * @module db/repositories/mood
 */

import { eq, and, desc, gte, sql } from "drizzle-orm";
import { BaseRepository } from "./base.repository";
import { 
  moodHistory,
  voiceNotes,
  type MoodHistory,
  type InsertMoodHistory,
  type VoiceNote,
  type InsertVoiceNote
} from "../../../drizzle/schema";

/**
 * Repository for mood and voice note database operations
 */
export class MoodRepository extends BaseRepository {
  constructor() {
    super("MoodRepository");
  }

  // ==================== Mood Tracking ====================

  /**
   * Create a mood entry
   */
  async createMoodEntry(entry: InsertMoodHistory): Promise<MoodHistory | null> {
    try {
      const db = await this.getDatabase();
      this.logOperation("createMoodEntry", { userId: entry.userId, mood: entry.mood });

      const [moodEntry] = await db
        .insert(moodHistory)
        .values(entry)
        .returning();

      return moodEntry || null;
    } catch (error) {
      this.handleError("createMoodEntry", error as Error, { entry });
    }
  }

  /**
   * Get mood history for a user
   */
  async getMoodHistory(
    userId: number,
    options?: { startDate?: Date; endDate?: Date; limit?: number }
  ): Promise<MoodHistory[]> {
    try {
      const db = await this.getDatabase();
      
      let query = db
        .select()
        .from(moodHistory)
        .where(eq(moodHistory.userId, userId));

      if (options?.startDate) {
        query = query.where(and(
          eq(moodHistory.userId, userId),
          gte(moodHistory.createdAt, options.startDate)
        )) as any;
      }

      query = query.orderBy(desc(moodHistory.createdAt)) as any;

      if (options?.limit) {
        query = query.limit(options.limit) as any;
      }

      return await query;
    } catch (error) {
      this.handleError("getMoodHistory", error as Error, { userId, options });
    }
  }

  /**
   * Get mood trends for analysis
   */
  async getMoodTrends(userId: number, days: number = 30): Promise<{
    averageMood: number;
    moodCounts: Record<string, number>;
    trend: string;
  }> {
    try {
      const db = await this.getDatabase();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const moods = await db
        .select()
        .from(moodHistory)
        .where(and(
          eq(moodHistory.userId, userId),
          gte(moodHistory.createdAt, startDate)
        ))
        .orderBy(desc(moodHistory.createdAt));

      if (moods.length === 0) {
        return { averageMood: 0, moodCounts: {}, trend: "insufficient_data" };
      }

      const moodValues: Record<string, number> = {
        "very_bad": 1,
        "bad": 2,
        "neutral": 3,
        "good": 4,
        "very_good": 5
      };

      const moodCounts: Record<string, number> = {};
      let totalMoodValue = 0;

      moods.forEach(entry => {
        const mood = entry.mood;
        moodCounts[mood] = (moodCounts[mood] || 0) + 1;
        totalMoodValue += moodValues[mood] || 3;
      });

      const averageMood = totalMoodValue / moods.length;

      // Calculate trend (improving/declining/stable)
      const recentMoods = moods.slice(0, Math.floor(moods.length / 2));
      const olderMoods = moods.slice(Math.floor(moods.length / 2));

      const recentAvg = recentMoods.reduce((sum, m) => sum + (moodValues[m.mood] || 3), 0) / recentMoods.length;
      const olderAvg = olderMoods.reduce((sum, m) => sum + (moodValues[m.mood] || 3), 0) / olderMoods.length;

      let trend = "stable";
      if (recentAvg > olderAvg + 0.3) trend = "improving";
      else if (recentAvg < olderAvg - 0.3) trend = "declining";

      return { averageMood, moodCounts, trend };
    } catch (error) {
      this.handleError("getMoodTrends", error as Error, { userId, days });
    }
  }

  /**
   * Get last mood check timestamp
   */
  async getLastMoodCheck(userId: number): Promise<Date | null> {
    try {
      const db = await this.getDatabase();
      
      const [lastMood] = await db
        .select({ createdAt: moodHistory.createdAt })
        .from(moodHistory)
        .where(eq(moodHistory.userId, userId))
        .orderBy(desc(moodHistory.createdAt))
        .limit(1);

      return lastMood?.createdAt || null;
    } catch (error) {
      this.handleError("getLastMoodCheck", error as Error, { userId });
    }
  }

  // ==================== Voice Notes ====================

  /**
   * Create a voice note
   */
  async createVoiceNote(data: InsertVoiceNote): Promise<VoiceNote | null> {
    try {
      const db = await this.getDatabase();
      this.logOperation("createVoiceNote", { userId: data.userId });

      const [note] = await db
        .insert(voiceNotes)
        .values(data)
        .returning();

      return note || null;
    } catch (error) {
      this.handleError("createVoiceNote", error as Error, { data });
    }
  }

  /**
   * Get voice notes for a user
   */
  async getVoiceNotes(
    userId: number,
    options?: { limit?: number; unprocessedOnly?: boolean }
  ): Promise<VoiceNote[]> {
    try {
      const db = await this.getDatabase();
      
      let query = db
        .select()
        .from(voiceNotes)
        .where(eq(voiceNotes.userId, userId));

      if (options?.unprocessedOnly) {
        query = query.where(and(
          eq(voiceNotes.userId, userId),
          eq(voiceNotes.processed, false)
        )) as any;
      }

      query = query.orderBy(desc(voiceNotes.createdAt)) as any;

      if (options?.limit) {
        query = query.limit(options.limit) as any;
      }

      return await query;
    } catch (error) {
      this.handleError("getVoiceNotes", error as Error, { userId, options });
    }
  }

  /**
   * Update a voice note
   */
  async updateVoiceNote(id: number, data: Partial<InsertVoiceNote>): Promise<void> {
    try {
      const db = await this.getDatabase();
      this.logOperation("updateVoiceNote", { id });

      await db
        .update(voiceNotes)
        .set(data)
        .where(eq(voiceNotes.id, id));
    } catch (error) {
      this.handleError("updateVoiceNote", error as Error, { id, data });
    }
  }

  /**
   * Delete a voice note
   */
  async deleteVoiceNote(id: number): Promise<void> {
    try {
      const db = await this.getDatabase();
      this.logOperation("deleteVoiceNote", { id });

      await db
        .delete(voiceNotes)
        .where(eq(voiceNotes.id, id));
    } catch (error) {
      this.handleError("deleteVoiceNote", error as Error, { id });
    }
  }
}

// Export singleton instance
export const moodRepository = new MoodRepository();
