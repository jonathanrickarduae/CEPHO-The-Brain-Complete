import { AnalyticsRepository } from './analytics.repository';
import {
  RevenueMetricsDto,
  QualityMetricsDto,
  CosLearningMetricsDto,
  DashboardOverviewDto,
  TimeSeriesDataDto,
  AnalyticsDateRangeDto,
} from './analytics.types';
import { logger } from '../../utils/logger';

const log = logger.module('AnalyticsService');

/**
 * Analytics Service
 * 
 * Handles business logic for analytics and metrics:
 * - Revenue tracking
 * - Quality metrics
 * - Learning progress
 * - Dashboard data aggregation
 */
export class AnalyticsService {
  constructor(private repository: AnalyticsRepository) {}

  // ===== Revenue Analytics =====

  async recordRevenueSnapshot(
    userId: number,
    data: {
      totalRevenue: number;
      monthlyRevenue: number;
      yearlyRevenue: number;
      revenueGrowth?: number;
      metadata?: Record<string, any>;
    }
  ): Promise<RevenueMetricsDto> {
    const snapshot = await this.repository.createRevenueSnapshot({
      userId,
      snapshotDate: new Date(),
      totalRevenue: data.totalRevenue,
      monthlyRevenue: data.monthlyRevenue,
      yearlyRevenue: data.yearlyRevenue,
      revenueGrowth: data.revenueGrowth || null,
      metadata: data.metadata ? JSON.stringify(data.metadata) : null,
    });

    log.info({ userId, totalRevenue: data.totalRevenue }, 'Revenue snapshot recorded');

    return this.toRevenueDto(snapshot);
  }

  async getLatestRevenueMetrics(userId: number): Promise<RevenueMetricsDto | null> {
    const snapshot = await this.repository.findLatestRevenueSnapshot(userId);
    return snapshot ? this.toRevenueDto(snapshot) : null;
  }

  async getRevenueTimeSeries(
    userId: number,
    dateRange: AnalyticsDateRangeDto
  ): Promise<TimeSeriesDataDto[]> {
    const snapshots = await this.repository.findRevenueSnapshotsByDateRange(
      userId,
      dateRange.startDate,
      dateRange.endDate
    );

    return snapshots.map(s => ({
      date: s.snapshotDate,
      value: s.totalRevenue,
      label: 'Total Revenue',
    }));
  }

  // ===== Quality Analytics =====

  async recordQualitySnapshot(
    userId: number,
    data: {
      overallScore: number;
      completenessScore: number;
      accuracyScore: number;
      timelinessScore: number;
      metadata?: Record<string, any>;
    }
  ): Promise<QualityMetricsDto> {
    this.validateScore(data.overallScore);
    this.validateScore(data.completenessScore);
    this.validateScore(data.accuracyScore);
    this.validateScore(data.timelinessScore);

    const snapshot = await this.repository.createQualitySnapshot({
      userId,
      snapshotDate: new Date(),
      overallScore: data.overallScore,
      completenessScore: data.completenessScore,
      accuracyScore: data.accuracyScore,
      timelinessScore: data.timelinessScore,
      metadata: data.metadata ? JSON.stringify(data.metadata) : null,
    });

    log.info({ userId, overallScore: data.overallScore }, 'Quality snapshot recorded');

    return this.toQualityDto(snapshot);
  }

  async getLatestQualityMetrics(userId: number): Promise<QualityMetricsDto | null> {
    const snapshot = await this.repository.findLatestQualitySnapshot(userId);
    return snapshot ? this.toQualityDto(snapshot) : null;
  }

  async getQualityTimeSeries(
    userId: number,
    dateRange: AnalyticsDateRangeDto
  ): Promise<TimeSeriesDataDto[]> {
    const snapshots = await this.repository.findQualitySnapshotsByDateRange(
      userId,
      dateRange.startDate,
      dateRange.endDate
    );

    return snapshots.map(s => ({
      date: s.snapshotDate,
      value: s.overallScore,
      label: 'Overall Quality Score',
    }));
  }

  // ===== Learning Analytics =====

  async recordLearningMetrics(
    userId: number,
    data: {
      learningScore: number;
      completedModules: number;
      totalModules: number;
      timeSpent: number;
      metadata?: Record<string, any>;
    }
  ): Promise<CosLearningMetricsDto> {
    this.validateScore(data.learningScore);

    const metrics = await this.repository.createLearningMetrics({
      userId,
      metricDate: new Date(),
      learningScore: data.learningScore,
      completedModules: data.completedModules,
      totalModules: data.totalModules,
      timeSpent: data.timeSpent,
      metadata: data.metadata ? JSON.stringify(data.metadata) : null,
    });

    log.info({ userId, learningScore: data.learningScore }, 'Learning metrics recorded');

    return this.toLearningDto(metrics);
  }

  async getLatestLearningMetrics(userId: number): Promise<CosLearningMetricsDto | null> {
    const metrics = await this.repository.findLatestLearningMetrics(userId);
    return metrics ? this.toLearningDto(metrics) : null;
  }

  async getLearningTimeSeries(
    userId: number,
    dateRange: AnalyticsDateRangeDto
  ): Promise<TimeSeriesDataDto[]> {
    const metrics = await this.repository.findLearningMetricsByDateRange(
      userId,
      dateRange.startDate,
      dateRange.endDate
    );

    return metrics.map(m => ({
      date: m.metricDate,
      value: m.learningScore,
      label: 'Learning Score',
    }));
  }

  // ===== Dashboard Overview =====

  async getDashboardOverview(userId: number): Promise<DashboardOverviewDto> {
    const [revenue, quality, learning] = await Promise.all([
      this.repository.findLatestRevenueSnapshot(userId),
      this.repository.findLatestQualitySnapshot(userId),
      this.repository.findLatestLearningMetrics(userId),
    ]);

    return {
      revenue: {
        total: revenue?.totalRevenue || 0,
        monthly: revenue?.monthlyRevenue || 0,
        growth: revenue?.revenueGrowth || 0,
      },
      quality: {
        overall: quality?.overallScore || 0,
        completeness: quality?.completenessScore || 0,
        accuracy: quality?.accuracyScore || 0,
        timeliness: quality?.timelinessScore || 0,
      },
      learning: {
        score: learning?.learningScore || 0,
        completed: learning?.completedModules || 0,
        total: learning?.totalModules || 0,
        progress: learning?.totalModules 
          ? Math.round((learning.completedModules / learning.totalModules) * 100)
          : 0,
      },
      projects: {
        total: 0,
        inProgress: 0,
        completed: 0,
        blocked: 0,
      },
      experts: {
        total: 0,
        active: 0,
        averageScore: 0,
      },
    };
  }

  // Private helper methods

  private validateScore(score: number): void {
    if (score < 0 || score > 100) {
      throw new Error('Score must be between 0 and 100');
    }
  }

  private toRevenueDto(snapshot: any): RevenueMetricsDto {
    return {
      id: snapshot.id,
      userId: snapshot.userId,
      snapshotDate: snapshot.snapshotDate,
      totalRevenue: snapshot.totalRevenue,
      monthlyRevenue: snapshot.monthlyRevenue,
      yearlyRevenue: snapshot.yearlyRevenue,
      revenueGrowth: snapshot.revenueGrowth,
      metadata: snapshot.metadata 
        ? (typeof snapshot.metadata === 'string' ? JSON.parse(snapshot.metadata) : snapshot.metadata)
        : null,
      createdAt: snapshot.createdAt,
    };
  }

  private toQualityDto(snapshot: any): QualityMetricsDto {
    return {
      id: snapshot.id,
      userId: snapshot.userId,
      snapshotDate: snapshot.snapshotDate,
      overallScore: snapshot.overallScore,
      completenessScore: snapshot.completenessScore,
      accuracyScore: snapshot.accuracyScore,
      timelinessScore: snapshot.timelinessScore,
      metadata: snapshot.metadata 
        ? (typeof snapshot.metadata === 'string' ? JSON.parse(snapshot.metadata) : snapshot.metadata)
        : null,
      createdAt: snapshot.createdAt,
    };
  }

  private toLearningDto(metrics: any): CosLearningMetricsDto {
    return {
      id: metrics.id,
      userId: metrics.userId,
      metricDate: metrics.metricDate,
      learningScore: metrics.learningScore,
      completedModules: metrics.completedModules,
      totalModules: metrics.totalModules,
      timeSpent: metrics.timeSpent,
      metadata: metrics.metadata 
        ? (typeof metrics.metadata === 'string' ? JSON.parse(metrics.metadata) : metrics.metadata)
        : null,
      createdAt: metrics.createdAt,
    };
  }
}

// Export singleton instance
import { AnalyticsRepository as AnalyticsRepo } from './analytics.repository';
export const analyticsService = new AnalyticsService(new AnalyticsRepo());
