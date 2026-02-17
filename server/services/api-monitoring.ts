import { getDb } from '../db';

export interface APIUsageMetrics {
  userId: number;
  skillType: string;
  provider: 'openai' | 'claude' | 'manus';
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cost: number;
  responseTime: number; // milliseconds
  cached: boolean;
  timestamp: Date;
}

export interface APIError {
  userId: number;
  skillType: string;
  provider: string;
  errorType: string;
  errorMessage: string;
  timestamp: Date;
}

export class APIMonitoringService {
  private static instance: APIMonitoringService | null = null;

  // Pricing per 1M tokens (as of Feb 2026)
  private pricing = {
    openai: {
      'gpt-4': { input: 30, output: 60 },
      'gpt-4-turbo': { input: 10, output: 30 },
      'gpt-3.5-turbo': { input: 0.5, output: 1.5 },
    },
    claude: {
      'claude-3-5-sonnet-20241022': { input: 3, output: 15 },
      'claude-3-opus': { input: 15, output: 75 },
      'claude-3-sonnet': { input: 3, output: 15 },
    },
  };

  static getInstance(): APIMonitoringService {
    if (!APIMonitoringService.instance) {
      APIMonitoringService.instance = new APIMonitoringService();
    }
    return APIMonitoringService.instance;
  }

  async trackUsage(metrics: APIUsageMetrics): Promise<void> {
    try {
      const db = await getDb();
      if (!db) {
        console.error('[Monitoring] Database not available');
        return;
      }

      await db.execute(
        `INSERT INTO api_usage 
         (userId, skillType, provider, promptTokens, completionTokens, totalTokens, cost, responseTime, cached, createdAt) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          metrics.userId,
          metrics.skillType,
          metrics.provider,
          metrics.promptTokens,
          metrics.completionTokens,
          metrics.totalTokens,
          metrics.cost,
          metrics.responseTime,
          metrics.cached ? 1 : 0,
        ]
      );

      console.log(`[Monitoring] Tracked usage: ${metrics.provider} - ${metrics.totalTokens} tokens - $${metrics.cost.toFixed(4)}`);
    } catch (error: any) {
      console.error('[Monitoring] Failed to track usage:', error.message);
    }
  }

  async trackError(error: APIError): Promise<void> {
    try {
      const db = await getDb();
      if (!db) return;

      await db.execute(
        `INSERT INTO api_errors 
         (userId, skillType, provider, errorType, errorMessage, createdAt) 
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [
          error.userId,
          error.skillType,
          error.provider,
          error.errorType,
          error.errorMessage.substring(0, 500), // Limit message length
        ]
      );

      console.log(`[Monitoring] Tracked error: ${error.provider} - ${error.errorType}`);
    } catch (err: any) {
      console.error('[Monitoring] Failed to track error:', err.message);
    }
  }

  calculateCost(provider: 'openai' | 'claude', model: string, promptTokens: number, completionTokens: number): number {
    const pricing = this.pricing[provider]?.[model as keyof typeof this.pricing.openai];
    if (!pricing) {
      console.warn(`[Monitoring] Unknown pricing for ${provider}/${model}`);
      return 0;
    }

    const inputCost = (promptTokens / 1_000_000) * pricing.input;
    const outputCost = (completionTokens / 1_000_000) * pricing.output;
    return inputCost + outputCost;
  }

  async getUsageStats(userId: number, days: number = 30): Promise<{
    totalCost: number;
    totalTokens: number;
    totalRequests: number;
    cacheHitRate: number;
    avgResponseTime: number;
    byProvider: Record<string, { cost: number; tokens: number; requests: number }>;
    bySkill: Record<string, { cost: number; tokens: number; requests: number }>;
  }> {
    try {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const result: any = await db.execute(
        `SELECT 
          SUM(cost) as totalCost,
          SUM(totalTokens) as totalTokens,
          COUNT(*) as totalRequests,
          SUM(CASE WHEN cached = 1 THEN 1 ELSE 0 END) as cachedRequests,
          AVG(responseTime) as avgResponseTime,
          provider,
          skillType
         FROM api_usage 
         WHERE userId = ? AND createdAt >= DATE_SUB(NOW(), INTERVAL ? DAY)
         GROUP BY provider, skillType`,
        [userId, days]
      );

      const rows = result.rows || [];
      
      const stats = {
        totalCost: 0,
        totalTokens: 0,
        totalRequests: 0,
        cacheHitRate: 0,
        avgResponseTime: 0,
        byProvider: {} as Record<string, { cost: number; tokens: number; requests: number }>,
        bySkill: {} as Record<string, { cost: number; tokens: number; requests: number }>,
      };

      let cachedRequests = 0;

      for (const row of rows) {
        stats.totalCost += parseFloat(row.totalCost || 0);
        stats.totalTokens += parseInt(row.totalTokens || 0);
        stats.totalRequests += parseInt(row.totalRequests || 0);
        cachedRequests += parseInt(row.cachedRequests || 0);
        stats.avgResponseTime += parseFloat(row.avgResponseTime || 0);

        const provider = row.provider;
        const skill = row.skillType;

        if (!stats.byProvider[provider]) {
          stats.byProvider[provider] = { cost: 0, tokens: 0, requests: 0 };
        }
        stats.byProvider[provider].cost += parseFloat(row.totalCost || 0);
        stats.byProvider[provider].tokens += parseInt(row.totalTokens || 0);
        stats.byProvider[provider].requests += parseInt(row.totalRequests || 0);

        if (!stats.bySkill[skill]) {
          stats.bySkill[skill] = { cost: 0, tokens: 0, requests: 0 };
        }
        stats.bySkill[skill].cost += parseFloat(row.totalCost || 0);
        stats.bySkill[skill].tokens += parseInt(row.totalTokens || 0);
        stats.bySkill[skill].requests += parseInt(row.totalRequests || 0);
      }

      if (stats.totalRequests > 0) {
        stats.cacheHitRate = (cachedRequests / stats.totalRequests) * 100;
        stats.avgResponseTime = stats.avgResponseTime / rows.length;
      }

      return stats;
    } catch (error: any) {
      console.error('[Monitoring] Failed to get usage stats:', error.message);
      throw error;
    }
  }

  async getErrorStats(userId: number, days: number = 30): Promise<{
    totalErrors: number;
    byProvider: Record<string, number>;
    byErrorType: Record<string, number>;
    recentErrors: Array<{ provider: string; errorType: string; message: string; timestamp: Date }>;
  }> {
    try {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const result: any = await db.execute(
        `SELECT provider, errorType, errorMessage, createdAt
         FROM api_errors 
         WHERE userId = ? AND createdAt >= DATE_SUB(NOW(), INTERVAL ? DAY)
         ORDER BY createdAt DESC
         LIMIT 100`,
        [userId, days]
      );

      const rows = result.rows || [];
      
      const stats = {
        totalErrors: rows.length,
        byProvider: {} as Record<string, number>,
        byErrorType: {} as Record<string, number>,
        recentErrors: [] as Array<{ provider: string; errorType: string; message: string; timestamp: Date }>,
      };

      for (const row of rows) {
        const provider = row.provider;
        const errorType = row.errorType;

        stats.byProvider[provider] = (stats.byProvider[provider] || 0) + 1;
        stats.byErrorType[errorType] = (stats.byErrorType[errorType] || 0) + 1;

        if (stats.recentErrors.length < 10) {
          stats.recentErrors.push({
            provider,
            errorType,
            message: row.errorMessage,
            timestamp: row.createdAt,
          });
        }
      }

      return stats;
    } catch (error: any) {
      console.error('[Monitoring] Failed to get error stats:', error.message);
      throw error;
    }
  }
}

export function getAPIMonitoring(): APIMonitoringService {
  return APIMonitoringService.getInstance();
}
