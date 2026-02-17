import { getDb } from '../../db';
import {
  businessPlanReviewVersions,
  InsertBusinessPlanReviewVersion,
  BusinessPlanReviewVersion,
} from '../../../drizzle/schema';
import { eq, and, desc } from 'drizzle-orm';

/**
 * Business Plan Repository
 * 
 * Handles all database operations for business plan reviews.
 */
export class BusinessPlanRepository {
  /**
   * Create a new business plan review version
   */
  async create(data: InsertBusinessPlanReviewVersion): Promise<BusinessPlanReviewVersion> {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    const [review] = await db
      .insert(businessPlanReviewVersions)
      .values(data)
      .returning();

    return review;
  }

  /**
   * Find review by ID
   */
  async findById(id: number, userId: number): Promise<BusinessPlanReviewVersion | null> {
    const db = await getDb();
    if (!db) return null;

    const [review] = await db
      .select()
      .from(businessPlanReviewVersions)
      .where(
        and(
          eq(businessPlanReviewVersions.id, id),
          eq(businessPlanReviewVersions.userId, userId)
        )
      )
      .limit(1);

    return review || null;
  }

  /**
   * Find all reviews for a user
   */
  async findByUserId(userId: number): Promise<BusinessPlanReviewVersion[]> {
    const db = await getDb();
    if (!db) return [];

    return await db
      .select()
      .from(businessPlanReviewVersions)
      .where(eq(businessPlanReviewVersions.userId, userId))
      .orderBy(desc(businessPlanReviewVersions.versionNumber));
  }

  /**
   * Find latest review for a user
   */
  async findLatest(userId: number): Promise<BusinessPlanReviewVersion | null> {
    const db = await getDb();
    if (!db) return null;

    const [latest] = await db
      .select()
      .from(businessPlanReviewVersions)
      .where(eq(businessPlanReviewVersions.userId, userId))
      .orderBy(desc(businessPlanReviewVersions.versionNumber))
      .limit(1);

    return latest || null;
  }

  /**
   * Find review by version number
   */
  async findByVersion(userId: number, versionNumber: number): Promise<BusinessPlanReviewVersion | null> {
    const db = await getDb();
    if (!db) return null;

    const [review] = await db
      .select()
      .from(businessPlanReviewVersions)
      .where(
        and(
          eq(businessPlanReviewVersions.userId, userId),
          eq(businessPlanReviewVersions.versionNumber, versionNumber)
        )
      )
      .limit(1);

    return review || null;
  }

  /**
   * Update review
   */
  async update(
    id: number,
    userId: number,
    data: Partial<InsertBusinessPlanReviewVersion>
  ): Promise<BusinessPlanReviewVersion | null> {
    const db = await getDb();
    if (!db) return null;

    const [updated] = await db
      .update(businessPlanReviewVersions)
      .set(data)
      .where(
        and(
          eq(businessPlanReviewVersions.id, id),
          eq(businessPlanReviewVersions.userId, userId)
        )
      )
      .returning();

    return updated || null;
  }

  /**
   * Delete review
   */
  async delete(id: number, userId: number): Promise<boolean> {
    const db = await getDb();
    if (!db) return false;

    const result = await db
      .delete(businessPlanReviewVersions)
      .where(
        and(
          eq(businessPlanReviewVersions.id, id),
          eq(businessPlanReviewVersions.userId, userId)
        )
      )
      .returning();

    return result.length > 0;
  }

  /**
   * Get next version number for a user
   */
  async getNextVersionNumber(userId: number): Promise<number> {
    const latest = await this.findLatest(userId);
    return latest ? latest.versionNumber + 1 : 1;
  }

  /**
   * Count total reviews for a user
   */
  async countByUserId(userId: number): Promise<number> {
    const reviews = await this.findByUserId(userId);
    return reviews.length;
  }
}
