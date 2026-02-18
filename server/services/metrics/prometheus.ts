/**
 * Prometheus Metrics Service
 * 
 * Exposes application metrics for monitoring and alerting.
 * Access metrics at /api/metrics endpoint.
 */

import { Request, Response } from 'express';
import client from 'prom-client';
import { logger } from '../../utils/logger';

const log = logger.module('Prometheus');

// Create a Registry
const register = new client.Registry();

// Add default metrics (CPU, memory, event loop lag, etc.)
client.collectDefaultMetrics({
  register,
  prefix: 'cepho_',
  gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5],
});

// Custom metrics
export const httpRequestDuration = new client.Histogram({
  name: 'cepho_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
  registers: [register],
});

export const httpRequestTotal = new client.Counter({
  name: 'cepho_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

export const activeUsers = new client.Gauge({
  name: 'cepho_active_users',
  help: 'Number of currently active users',
  registers: [register],
});

export const databaseQueryDuration = new client.Histogram({
  name: 'cepho_database_query_duration_seconds',
  help: 'Duration of database queries in seconds',
  labelNames: ['operation', 'table'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 5],
  registers: [register],
});

export const cacheHitRate = new client.Counter({
  name: 'cepho_cache_operations_total',
  help: 'Total number of cache operations',
  labelNames: ['operation', 'result'], // operation: get/set, result: hit/miss
  registers: [register],
});

export const expertConsultations = new client.Counter({
  name: 'cepho_expert_consultations_total',
  help: 'Total number of expert consultations',
  labelNames: ['expert_id', 'status'],
  registers: [register],
});

export const aiAgentTasks = new client.Counter({
  name: 'cepho_ai_agent_tasks_total',
  help: 'Total number of AI agent tasks',
  labelNames: ['agent_id', 'status'],
  registers: [register],
});

export const llmApiCalls = new client.Counter({
  name: 'cepho_llm_api_calls_total',
  help: 'Total number of LLM API calls',
  labelNames: ['provider', 'model', 'status'],
  registers: [register],
});

export const llmTokensUsed = new client.Counter({
  name: 'cepho_llm_tokens_used_total',
  help: 'Total number of LLM tokens used',
  labelNames: ['provider', 'model', 'type'], // type: prompt/completion
  registers: [register],
});

/**
 * Express middleware to track HTTP request metrics
 */
export function metricsMiddleware(req: Request, res: Response, next: Function) {
  const start = Date.now();

  // Track response
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route?.path || req.path;
    const labels = {
      method: req.method,
      route,
      status_code: res.statusCode.toString(),
    };

    httpRequestDuration.observe(labels, duration);
    httpRequestTotal.inc(labels);
  });

  next();
}

/**
 * Metrics endpoint handler
 */
export async function metricsHandler(req: Request, res: Response) {
  try {
    res.set('Content-Type', register.contentType);
    const metrics = await register.metrics();
    res.end(metrics);
  } catch (error) {
    log.error('Failed to generate metrics:', error);
    res.status(500).end('Failed to generate metrics');
  }
}

/**
 * Get current metrics as JSON (for debugging)
 */
export async function getMetricsJson(): Promise<any> {
  const metrics = await register.getMetricsAsJSON();
  return metrics;
}

log.info('Prometheus metrics initialized');
