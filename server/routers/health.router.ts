import { Router } from "express";
import { db } from "../db";
import { sql } from "drizzle-orm";
import { cacheService } from "../services/cache/redis-cache.service";

/**
 * Health Check Router
 * Provides endpoints for monitoring application health and dependencies
 */

const router = Router();

/**
 * Basic health check - always returns 200 if server is running
 * GET /health
 */
router.get("/health", async (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
    version: process.env.npm_package_version || "1.0.0",
  });
});

/**
 * Readiness check - verifies all dependencies are ready
 * GET /health/ready
 */
router.get("/health/ready", async (req, res) => {
  const checks: Record<string, Record<string, unknown>> = {
    database: { status: "unknown" },
    cache: { status: "unknown" },
  };

  let allReady = true;

  // Check database
  try {
    await db.execute(sql`SELECT 1`);
    checks.database = { status: "ok" };
  } catch (error) {
    checks.database = {
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error",
    };
    allReady = false;
  }

  // Check Redis cache
  try {
    const cacheStats = await cacheService.getStats();
    if (cacheStats.connected) {
      checks.cache = { status: "ok" };
    } else {
      checks.cache = { status: "not_configured" };
    }
  } catch (error) {
    checks.cache = {
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error",
    };
    // Cache is optional, don't fail readiness check
  }

  const statusCode = allReady ? 200 : 503;

  res.status(statusCode).json({
    status: allReady ? "ready" : "not_ready",
    timestamp: new Date().toISOString(),
    checks,
  });
});

/**
 * Liveness check - verifies the application is alive
 * GET /health/live
 */
router.get("/health/live", (req, res) => {
  // Simple check - if we can respond, we're alive
  res.status(200).json({
    status: "alive",
    timestamp: new Date().toISOString(),
    pid: process.pid,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});

/**
 * Detailed health check - includes all system information
 * GET /health/detailed
 */
router.get("/health/detailed", async (req, res) => {
  const checks: Record<string, Record<string, unknown>> = {
    database: { status: "unknown" },
    cache: { status: "unknown" },
  };

  // Check database
  try {
    const start = Date.now();
    await db.execute(sql`SELECT 1`);
    const duration = Date.now() - start;
    checks.database = {
      status: "ok",
      responseTime: `${duration}ms`,
    };
  } catch (error) {
    checks.database = {
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }

  // Check Redis cache
  try {
    const cacheStats = await cacheService.getStats();
    checks.cache = cacheStats;
  } catch (error) {
    checks.cache = {
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }

  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
    version: process.env.npm_package_version || "unknown",
    node: process.version,
    memory: {
      rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
      external: `${Math.round(process.memoryUsage().external / 1024 / 1024)}MB`,
    },
    cpu: process.cpuUsage(),
    checks,
  });
});

export default router;
