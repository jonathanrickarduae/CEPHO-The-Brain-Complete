/**
 * API Usage Analytics Service
 * 
 * Tracks API usage metrics including request counts, response times,
 * error rates, and endpoint popularity.
 * 
 * Priority 2 - MON-02: API Usage Analytics
 * 
 * @module services/monitoring/api-analytics
 */

import { Request, Response } from 'express';
import { loggerService } from './logger.service';

/**
 * Represents API usage statistics for a specific endpoint.
 */
interface EndpointStats {
  /**
   * The endpoint path (e.g., "/api/users")
   */
  endpoint: string;
  
  /**
   * HTTP method (GET, POST, etc.)
   */
  method: string;
  
  /**
   * Total number of requests
   */
  requestCount: number;
  
  /**
   * Number of successful requests (2xx status)
   */
  successCount: number;
  
  /**
   * Number of client errors (4xx status)
   */
  clientErrorCount: number;
  
  /**
   * Number of server errors (5xx status)
   */
  serverErrorCount: number;
  
  /**
   * Average response time in milliseconds
   */
  avgResponseTime: number;
  
  /**
   * Minimum response time in milliseconds
   */
  minResponseTime: number;
  
  /**
   * Maximum response time in milliseconds
   */
  maxResponseTime: number;
  
  /**
   * When this endpoint was first accessed
   */
  firstAccess: Date;
  
  /**
   * When this endpoint was last accessed
   */
  lastAccess: Date;
}

/**
 * Represents aggregated API usage analytics.
 */
interface ApiAnalytics {
  /**
   * Total number of API requests
   */
  totalRequests: number;
  
  /**
   * Total number of unique endpoints accessed
   */
  uniqueEndpoints: number;
  
  /**
   * Overall success rate (percentage)
   */
  successRate: number;
  
  /**
   * Overall error rate (percentage)
   */
  errorRate: number;
  
  /**
   * Average response time across all endpoints
   */
  avgResponseTime: number;
  
  /**
   * Statistics per endpoint
   */
  endpoints: EndpointStats[];
  
  /**
   * Most popular endpoints (by request count)
   */
  topEndpoints: Array<{
    endpoint: string;
    method: string;
    count: number;
  }>;
  
  /**
   * Slowest endpoints (by avg response time)
   */
  slowestEndpoints: Array<{
    endpoint: string;
    method: string;
    avgTime: number;
  }>;
  
  /**
   * Endpoints with highest error rates
   */
  errorProneEndpoints: Array<{
    endpoint: string;
    method: string;
    errorRate: number;
  }>;
}

/**
 * In-memory storage for API metrics.
 * In production, this should be stored in Redis or a database.
 */
const metricsStore = new Map<string, EndpointStats>();

/**
 * Service for tracking and analyzing API usage.
 * 
 * @class
 * @example
 * ```typescript
 * const analytics = new ApiAnalyticsService();
 * 
 * // Track a request
 * app.use(analytics.trackRequest());
 * 
 * // Get analytics
 * const stats = analytics.getAnalytics();
 * console.log(`Total requests: ${stats.totalRequests}`);
 * ```
 */
export class ApiAnalyticsService {
  /**
   * Creates a middleware function to track API requests.
   * 
   * Automatically measures response time and records metrics.
   * 
   * @returns Express middleware function
   * 
   * @example
   * ```typescript
   * app.use(analytics.trackRequest());
   * ```
   */
  trackRequest() {
    return (req: Request, res: Response, next: Function) => {
      const startTime = Date.now();
      const endpoint = this.normalizeEndpoint(req.path);
      const method = req.method;
      
      // Track response
      res.on('finish', () => {
        const responseTime = Date.now() - startTime;
        const statusCode = res.statusCode;
        
        this.recordMetric(endpoint, method, statusCode, responseTime);
      });
      
      next();
    };
  }
  
  /**
   * Records a metric for an API endpoint.
   * 
   * @private
   * @param endpoint - The endpoint path
   * @param method - The HTTP method
   * @param statusCode - The response status code
   * @param responseTime - The response time in milliseconds
   */
  private recordMetric(
    endpoint: string,
    method: string,
    statusCode: number,
    responseTime: number
  ): void {
    const key = `${method}:${endpoint}`;
    const existing = metricsStore.get(key);
    
    if (existing) {
      // Update existing stats
      existing.requestCount++;
      
      if (statusCode >= 200 && statusCode < 300) {
        existing.successCount++;
      } else if (statusCode >= 400 && statusCode < 500) {
        existing.clientErrorCount++;
      } else if (statusCode >= 500) {
        existing.serverErrorCount++;
      }
      
      // Update response time stats
      const totalTime = existing.avgResponseTime * (existing.requestCount - 1) + responseTime;
      existing.avgResponseTime = totalTime / existing.requestCount;
      existing.minResponseTime = Math.min(existing.minResponseTime, responseTime);
      existing.maxResponseTime = Math.max(existing.maxResponseTime, responseTime);
      existing.lastAccess = new Date();
      
      metricsStore.set(key, existing);
    } else {
      // Create new stats
      const stats: EndpointStats = {
        endpoint,
        method,
        requestCount: 1,
        successCount: statusCode >= 200 && statusCode < 300 ? 1 : 0,
        clientErrorCount: statusCode >= 400 && statusCode < 500 ? 1 : 0,
        serverErrorCount: statusCode >= 500 ? 1 : 0,
        avgResponseTime: responseTime,
        minResponseTime: responseTime,
        maxResponseTime: responseTime,
        firstAccess: new Date(),
        lastAccess: new Date()
      };
      
      metricsStore.set(key, stats);
    }
    
    loggerService.debug('API metric recorded', {
      endpoint,
      method,
      statusCode,
      responseTime
    });
  }
  
  /**
   * Normalizes an endpoint path by removing IDs and query parameters.
   * 
   * @private
   * @param path - The request path
   * @returns Normalized endpoint path
   * 
   * @example
   * ```typescript
   * normalizeEndpoint('/api/users/123'); // '/api/users/:id'
   * normalizeEndpoint('/api/projects/abc-def'); // '/api/projects/:id'
   * ```
   */
  private normalizeEndpoint(path: string): string {
    return path
      // Remove query parameters
      .split('?')[0]
      // Replace UUIDs
      .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, ':id')
      // Replace numeric IDs
      .replace(/\/\d+/g, '/:id')
      // Replace alphanumeric IDs
      .replace(/\/[a-z0-9]{8,}/gi, '/:id');
  }
  
  /**
   * Gets comprehensive API analytics.
   * 
   * @returns Aggregated API analytics
   * 
   * @example
   * ```typescript
   * const analytics = service.getAnalytics();
   * console.log(`Success rate: ${analytics.successRate}%`);
   * console.log(`Top endpoint: ${analytics.topEndpoints[0].endpoint}`);
   * ```
   */
  getAnalytics(): ApiAnalytics {
    const endpoints = Array.from(metricsStore.values());
    
    const totalRequests = endpoints.reduce((sum, e) => sum + e.requestCount, 0);
    const totalSuccess = endpoints.reduce((sum, e) => sum + e.successCount, 0);
    const totalErrors = endpoints.reduce(
      (sum, e) => sum + e.clientErrorCount + e.serverErrorCount,
      0
    );
    const totalResponseTime = endpoints.reduce(
      (sum, e) => sum + e.avgResponseTime * e.requestCount,
      0
    );
    
    // Top endpoints by request count
    const topEndpoints = endpoints
      .map(e => ({
        endpoint: e.endpoint,
        method: e.method,
        count: e.requestCount
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    // Slowest endpoints
    const slowestEndpoints = endpoints
      .map(e => ({
        endpoint: e.endpoint,
        method: e.method,
        avgTime: e.avgResponseTime
      }))
      .sort((a, b) => b.avgTime - a.avgTime)
      .slice(0, 10);
    
    // Error-prone endpoints
    const errorProneEndpoints = endpoints
      .map(e => ({
        endpoint: e.endpoint,
        method: e.method,
        errorRate: ((e.clientErrorCount + e.serverErrorCount) / e.requestCount) * 100
      }))
      .filter(e => e.errorRate > 0)
      .sort((a, b) => b.errorRate - a.errorRate)
      .slice(0, 10);
    
    return {
      totalRequests,
      uniqueEndpoints: endpoints.length,
      successRate: totalRequests > 0 ? (totalSuccess / totalRequests) * 100 : 0,
      errorRate: totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0,
      avgResponseTime: totalRequests > 0 ? totalResponseTime / totalRequests : 0,
      endpoints,
      topEndpoints,
      slowestEndpoints,
      errorProneEndpoints
    };
  }
  
  /**
   * Gets analytics for a specific endpoint.
   * 
   * @param endpoint - The endpoint path
   * @param method - The HTTP method (optional)
   * @returns Endpoint statistics or null if not found
   * 
   * @example
   * ```typescript
   * const stats = service.getEndpointAnalytics('/api/users', 'GET');
   * console.log(`Avg response time: ${stats.avgResponseTime}ms`);
   * ```
   */
  getEndpointAnalytics(endpoint: string, method?: string): EndpointStats | null {
    if (method) {
      const key = `${method}:${endpoint}`;
      return metricsStore.get(key) || null;
    }
    
    // Return stats for all methods combined
    const allMethods = Array.from(metricsStore.values())
      .filter(e => e.endpoint === endpoint);
    
    if (allMethods.length === 0) return null;
    
    // Aggregate stats across all methods
    const totalRequests = allMethods.reduce((sum, e) => sum + e.requestCount, 0);
    
    return {
      endpoint,
      method: 'ALL',
      requestCount: totalRequests,
      successCount: allMethods.reduce((sum, e) => sum + e.successCount, 0),
      clientErrorCount: allMethods.reduce((sum, e) => sum + e.clientErrorCount, 0),
      serverErrorCount: allMethods.reduce((sum, e) => sum + e.serverErrorCount, 0),
      avgResponseTime: allMethods.reduce(
        (sum, e) => sum + e.avgResponseTime * e.requestCount,
        0
      ) / totalRequests,
      minResponseTime: Math.min(...allMethods.map(e => e.minResponseTime)),
      maxResponseTime: Math.max(...allMethods.map(e => e.maxResponseTime)),
      firstAccess: new Date(Math.min(...allMethods.map(e => e.firstAccess.getTime()))),
      lastAccess: new Date(Math.max(...allMethods.map(e => e.lastAccess.getTime())))
    };
  }
  
  /**
   * Resets all analytics data.
   * 
   * @example
   * ```typescript
   * service.reset();
   * console.log('Analytics reset');
   * ```
   */
  reset(): void {
    metricsStore.clear();
    loggerService.info('API analytics reset');
  }
  
  /**
   * Exports analytics data as JSON.
   * 
   * @returns JSON string of analytics data
   * 
   * @example
   * ```typescript
   * const json = service.export();
   * fs.writeFileSync('analytics.json', json);
   * ```
   */
  export(): string {
    return JSON.stringify(this.getAnalytics(), null, 2);
  }
}

/**
 * Singleton instance of the API analytics service.
 */
export const apiAnalytics = new ApiAnalyticsService();
