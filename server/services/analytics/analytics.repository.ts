import { getDb } from '../../db';
import {
  revenueMetricsSnapshots,
  qualityMetricsSnapshots,
  cosLearningMetrics,
  InsertRevenueMetricsSnapshot,
  InsertQualityMetricsSnapshot,
  InsertCosLearningMetrics,
  RevenueMetricsSnapshot,
  QualityMetricsSnapshot,
  CosLearningMetrics,
} from '../../../drizzle/schema';
import { eq, and, desc, gte, lte, between } from 'drizzle-orm';

/**
 * Analytics Repository
 * 
 * Handles all database operations for analytics and metrics.
 */
export class AnalyticsRepository {
  // ===== Revenue Metrics =====

  async createRevenueSnapshot(data: InsertRevenueMetricsSnapshot): Promise<RevenueMetricsSnapshot> {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    const [snapshot] = await db
      .insert(revenueMetricsSnapshots)
      .values(data)
      .returning();

    return snapshot;
  }

  async findLatestRevenueSnapshot(userId: number): Promise<RevenueMetricsSnapshot | null> {
    const db = await getDb();
    if (!db) return null;

    const [snapshot] = await db
      .select()
      .from(revenueMetricsSnapshots)
      .where(eq(revenueMetricsSnapshots.userId, userId))
      .orderBy(desc(revenueMetricsSnapshots.snapshotDate))
      .limit(1);

    return snapshot || null;
  }

  async findRevenueSnapshotsByDateRange(
    userId: number,
    startDate: Date,
    endDate: Date
  ): Promise<RevenueMetricsSnapshot[]> {
    const db = await getDb();
    if (!db) return [];

    return await db
      .select()
      .from(revenueMetricsSnapshots)
      .where(
        and(
          eq(revenueMetricsSnapshots.userId, userId),
          between(revenueMetricsSnapshots.snapshotDate, startDate, endDate)
        )
      )
      .orderBy(revenueMetricsSnapshots.snapshotDate);
  }

  // ===== Quality Metrics =====

  async createQualitySnapshot(data: InsertQualityMetricsSnapshot): Promise<QualityMetricsSnapshot> {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    const [snapshot] = await db
      .insert(qualityMetricsSnapshots)
      .values(data)
      .returning();

    return snapshot;
  }

  async findLatestQualitySnapshot(userId: number): Promise<QualityMetricsSnapshot | null> {
    const db = await getDb();
    if (!db) return null;

    const [snapshot] = await db
      .select()
      .from(qualityMetricsSnapshots)
      .where(eq(qualityMetricsSnapshots.userId, userId))
      .orderBy(desc(qualityMetricsSnapshots.snapshotDate))
      .limit(1);

    return snapshot || null;
  }

  async findQualitySnapshotsByDateRange(
    userId: number,
    startDate: Date,
    endDate: Date
  ): Promise<QualityMetricsSnapshot[]> {
    const db = await getDb();
    if (!db) return [];

    return await db
      .select()
      .from(qualityMetricsSnapshots)
      .where(
        and(
          eq(qualityMetricsSnapshots.userId, userId),
          between(qualityMetricsSnapshots.snapshotDate, startDate, endDate)
        )
      )
      .orderBy(qualityMetricsSnapshots.snapshotDate);
  }

  // ===== Learning Metrics =====

  async createLearningMetrics(data: InsertCosLearningMetrics): Promise<CosLearningMetrics> {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    const [metrics] = await db
      .insert(cosLearningMetrics)
      .values(data)
      .returning();

    return metrics;
  }

  async findLatestLearningMetrics(userId: number): Promise<CosLearningMetrics | null> {
    const db = await getDb();
    if (!db) return null;

    const [metrics] = await db
      .select()
      .from(cosLearningMetrics)
      .where(eq(cosLearningMetrics.userId, userId))
      .orderBy(desc(cosLearningMetrics.metricDate))
      .limit(1);

    return metrics || null;
  }

  async findLearningMetricsByDateRange(
    userId: number,
    startDate: Date,
    endDate: Date
  ): Promise<CosLearningMetrics[]> {
    const db = await getDb();
    if (!db) return [];

    return await db
      .select()
      .from(cosLearningMetrics)
      .where(
        and(
          eq(cosLearningMetrics.userId, userId),
          between(cosLearningMetrics.metricDate, startDate, endDate)
        )
      )
      .orderBy(cosLearningMetrics.metricDate);
  }

  async updateLearningMetrics(
    id: number,
    userId: number,
    data: Partial<InsertCosLearningMetrics>
  ): Promise<CosLearningMetrics | null> {
    const db = await getDb();
    if (!db) return null;

    const [updated] = await db
      .update(cosLearningMetrics)
      .set(data)
      .where(
        and(
          eq(cosLearningMetrics.id, id),
          eq(cosLearningMetrics.userId, userId)
        )
      )
      .returning();

    return updated || null;
  }
}
