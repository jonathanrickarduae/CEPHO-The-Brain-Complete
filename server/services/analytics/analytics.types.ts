/**
 * Analytics Service Types and DTOs
 * 
 * Data Transfer Objects for analytics and metrics services.
 */

/**
 * DTO for revenue metrics snapshot
 */
export interface RevenueMetricsDto {
  id: number;
  userId: number;
  snapshotDate: Date;
  totalRevenue: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
  revenueGrowth: number | null;
  metadata: Record<string, any> | null;
  createdAt: Date;
}

/**
 * DTO for quality metrics snapshot
 */
export interface QualityMetricsDto {
  id: number;
  userId: number;
  snapshotDate: Date;
  overallScore: number;
  completenessScore: number;
  accuracyScore: number;
  timelinessScore: number;
  metadata: Record<string, any> | null;
  createdAt: Date;
}

/**
 * DTO for COS learning metrics
 */
export interface CosLearningMetricsDto {
  id: number;
  userId: number;
  metricDate: Date;
  learningScore: number;
  completedModules: number;
  totalModules: number;
  timeSpent: number;
  metadata: Record<string, any> | null;
  createdAt: Date;
}

/**
 * DTO for dashboard overview
 */
export interface DashboardOverviewDto {
  revenue: {
    total: number;
    monthly: number;
    growth: number;
  };
  quality: {
    overall: number;
    completeness: number;
    accuracy: number;
    timeliness: number;
  };
  learning: {
    score: number;
    completed: number;
    total: number;
    progress: number;
  };
  projects: {
    total: number;
    inProgress: number;
    completed: number;
    blocked: number;
  };
  experts: {
    total: number;
    active: number;
    averageScore: number;
  };
}

/**
 * DTO for time-series analytics
 */
export interface TimeSeriesDataDto {
  date: Date;
  value: number;
  label?: string;
}

/**
 * DTO for analytics date range
 */
export interface AnalyticsDateRangeDto {
  startDate: Date;
  endDate: Date;
  granularity?: 'day' | 'week' | 'month' | 'year';
}
