/**
 * Application Performance Monitoring (APM) Service
 * Tracks application performance metrics using Prometheus
 *
 * Priority 1 - MON-02
 */

import { Request, Response, NextFunction } from "express";
import client from "prom-client";

// Create a Registry
const register = new client.Registry();

// Add default metrics (CPU, memory, event loop lag, etc.)
client.collectDefaultMetrics({ register });

/**
 * Custom Metrics
 */

// HTTP request duration histogram
const httpRequestDuration = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.1, 0.5, 1, 2, 5, 10], // seconds
});
register.registerMetric(httpRequestDuration);

// HTTP request counter
const httpRequestTotal = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"],
});
register.registerMetric(httpRequestTotal);

// Active connections gauge
const activeConnections = new client.Gauge({
  name: "active_connections",
  help: "Number of active connections",
});
register.registerMetric(activeConnections);

// Database query duration histogram
const dbQueryDuration = new client.Histogram({
  name: "db_query_duration_seconds",
  help: "Duration of database queries in seconds",
  labelNames: ["query_type", "table"],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
});
register.registerMetric(dbQueryDuration);

// Cache hit/miss counter
const cacheHits = new client.Counter({
  name: "cache_hits_total",
  help: "Total number of cache hits",
  labelNames: ["cache_key_prefix"],
});
register.registerMetric(cacheHits);

const cacheMisses = new client.Counter({
  name: "cache_misses_total",
  help: "Total number of cache misses",
  labelNames: ["cache_key_prefix"],
});
register.registerMetric(cacheMisses);

// Error counter
const errorTotal = new client.Counter({
  name: "errors_total",
  help: "Total number of errors",
  labelNames: ["error_type", "route"],
});
register.registerMetric(errorTotal);

// API response size histogram
const apiResponseSize = new client.Histogram({
  name: "api_response_size_bytes",
  help: "Size of API responses in bytes",
  labelNames: ["route"],
  buckets: [100, 1000, 10000, 100000, 1000000],
});
register.registerMetric(apiResponseSize);

/**
 * APM Middleware
 * Tracks HTTP request metrics
 */
export function apmMiddleware(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();

  // Track active connections
  activeConnections.inc();

  // Override res.end to capture metrics
  const originalEnd = res.end;
  res.end = function (...args: any[]) {
    const duration = (Date.now() - start) / 1000; // Convert to seconds
    const route = req.route?.path || req.path;
    const method = req.method;
    const statusCode = res.statusCode.toString();

    // Record metrics
    httpRequestDuration.labels(method, route, statusCode).observe(duration);
    httpRequestTotal.labels(method, route, statusCode).inc();

    // Track response size if available
    const contentLength = res.get("content-length");
    if (contentLength) {
      apiResponseSize.labels(route).observe(parseInt(contentLength));
    }

    // Decrement active connections
    activeConnections.dec();

    // Call original end
    return originalEnd.apply(res, args as [any, BufferEncoding, () => void]);
  };

  next();
}

/**
 * Database Query Tracker
 * Wraps database queries to track performance
 */
export async function trackDbQuery<T>(
  queryType: string,
  table: string,
  queryFn: () => Promise<T>
): Promise<T> {
  const start = Date.now();

  try {
    const result = await queryFn();
    const duration = (Date.now() - start) / 1000;
    dbQueryDuration.labels(queryType, table).observe(duration);
    return result;
  } catch (error) {
    const duration = (Date.now() - start) / 1000;
    dbQueryDuration.labels(queryType, table).observe(duration);
    errorTotal.labels("database_error", table).inc();
    throw error;
  }
}

/**
 * Cache Tracker
 * Tracks cache hits and misses
 */
export function trackCacheHit(keyPrefix: string) {
  cacheHits.labels(keyPrefix).inc();
}

export function trackCacheMiss(keyPrefix: string) {
  cacheMisses.labels(keyPrefix).inc();
}

/**
 * Error Tracker
 * Tracks application errors
 */
export function trackError(errorType: string, route: string) {
  errorTotal.labels(errorType, route).inc();
}

/**
 * Metrics Endpoint Handler
 * Returns Prometheus metrics
 */
export async function metricsHandler(req: Request, res: Response) {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
}

/**
 * Get current metrics as JSON
 */
export async function getMetricsJSON() {
  const metrics = await register.getMetricsAsJSON();
  return metrics;
}

/**
 * Reset all metrics (for testing)
 */
export function resetMetrics() {
  register.resetMetrics();
}

/**
 * Custom business metrics
 */

// User activity counter
const userActivity = new client.Counter({
  name: "user_activity_total",
  help: "Total number of user activities",
  labelNames: ["activity_type", "user_id"],
});
register.registerMetric(userActivity);

export function trackUserActivity(activityType: string, userId: string) {
  userActivity.labels(activityType, userId).inc();
}

// Document generation counter
const documentGeneration = new client.Counter({
  name: "document_generation_total",
  help: "Total number of documents generated",
  labelNames: ["document_type"],
});
register.registerMetric(documentGeneration);

export function trackDocumentGeneration(documentType: string) {
  documentGeneration.labels(documentType).inc();
}

// AI agent invocation counter
const aiAgentInvocations = new client.Counter({
  name: "ai_agent_invocations_total",
  help: "Total number of AI agent invocations",
  labelNames: ["agent_type"],
});
register.registerMetric(aiAgentInvocations);

export function trackAIAgentInvocation(agentType: string) {
  aiAgentInvocations.labels(agentType).inc();
}

// Export registry for external use
export { register };
