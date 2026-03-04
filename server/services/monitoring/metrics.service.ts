/**
 * Prometheus Metrics Service (OR-4)
 *
 * Exposes application metrics at GET /metrics in Prometheus text format.
 * Scraped by Prometheus / Grafana / Render Metrics for dashboards and alerting.
 *
 * Default Node.js metrics (CPU, memory, GC, event loop lag) are collected
 * automatically via prom-client's collectDefaultMetrics().
 *
 * Custom application metrics:
 *   - http_requests_total          (counter, by method/route/status)
 *   - http_request_duration_ms     (histogram, by method/route)
 *   - trpc_requests_total          (counter, by procedure/status)
 *   - db_query_duration_ms         (histogram)
 *   - active_users_total           (gauge)
 *   - ai_tokens_used_total         (counter, by model)
 */

import {
  Registry,
  collectDefaultMetrics,
  Counter,
  Histogram,
  Gauge,
} from "prom-client";

class MetricsService {
  readonly registry: Registry;

  // HTTP metrics
  readonly httpRequestsTotal: Counter<string>;
  readonly httpRequestDurationMs: Histogram<string>;

  // tRPC metrics
  readonly trpcRequestsTotal: Counter<string>;

  // Database metrics
  readonly dbQueryDurationMs: Histogram<string>;

  // Application metrics
  readonly activeUsersTotal: Gauge<string>;
  readonly aiTokensUsedTotal: Counter<string>;

  constructor() {
    this.registry = new Registry();

    // Collect default Node.js metrics (CPU, memory, GC, event loop lag)
    collectDefaultMetrics({ register: this.registry });

    // ── HTTP ────────────────────────────────────────────────────────────────
    this.httpRequestsTotal = new Counter({
      name: "http_requests_total",
      help: "Total number of HTTP requests",
      labelNames: ["method", "route", "status_code"],
      registers: [this.registry],
    });

    this.httpRequestDurationMs = new Histogram({
      name: "http_request_duration_ms",
      help: "HTTP request duration in milliseconds",
      labelNames: ["method", "route"],
      buckets: [5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000],
      registers: [this.registry],
    });

    // ── tRPC ────────────────────────────────────────────────────────────────
    this.trpcRequestsTotal = new Counter({
      name: "trpc_requests_total",
      help: "Total number of tRPC procedure calls",
      labelNames: ["procedure", "status"],
      registers: [this.registry],
    });

    // ── Database ────────────────────────────────────────────────────────────
    this.dbQueryDurationMs = new Histogram({
      name: "db_query_duration_ms",
      help: "Database query duration in milliseconds",
      labelNames: ["operation"],
      buckets: [1, 5, 10, 25, 50, 100, 250, 500, 1000],
      registers: [this.registry],
    });

    // ── Application ─────────────────────────────────────────────────────────
    this.activeUsersTotal = new Gauge({
      name: "active_users_total",
      help: "Number of currently active users (sessions in last 15 minutes)",
      registers: [this.registry],
    });

    this.aiTokensUsedTotal = new Counter({
      name: "ai_tokens_used_total",
      help: "Total AI tokens consumed",
      labelNames: ["model", "type"],
      registers: [this.registry],
    });
  }

  /**
   * Record an HTTP request completion
   */
  recordHttpRequest(
    method: string,
    route: string,
    statusCode: number,
    durationMs: number
  ): void {
    this.httpRequestsTotal.inc({
      method,
      route,
      status_code: String(statusCode),
    });
    this.httpRequestDurationMs.observe({ method, route }, durationMs);
  }

  /**
   * Record a tRPC procedure call
   */
  recordTrpcCall(procedure: string, success: boolean): void {
    this.trpcRequestsTotal.inc({
      procedure,
      status: success ? "success" : "error",
    });
  }

  /**
   * Record a database query duration
   */
  recordDbQuery(operation: string, durationMs: number): void {
    this.dbQueryDurationMs.observe({ operation }, durationMs);
  }

  /**
   * Update active user count
   */
  setActiveUsers(count: number): void {
    this.activeUsersTotal.set(count);
  }

  /**
   * Record AI token usage
   */
  recordAiTokens(model: string, type: "input" | "output", count: number): void {
    this.aiTokensUsedTotal.inc({ model, type }, count);
  }

  /**
   * Get metrics in Prometheus text format
   */
  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }

  /**
   * Get content type for Prometheus response
   */
  getContentType(): string {
    return this.registry.contentType;
  }
}

// Export singleton
export const metricsService = new MetricsService();
