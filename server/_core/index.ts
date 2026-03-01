// Load environment variables FIRST before any other imports
import { logger } from "../utils/logger";
const log = logger.module("CoreIndex");
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.env.NODE_ENV === "production") {
  const envPath = path.resolve(__dirname, ".env.production");
  dotenv.config({ path: envPath });
  log.debug("[dotenv] Loaded .env.production from:", envPath);
  log.debug("[dotenv] DATABASE_URL present:", !!process.env.DATABASE_URL);
} else {
  dotenv.config();
}

// Debug: Log auth bypass status at startup
log.debug("[Startup] AUTH_BYPASS:", process.env.AUTH_BYPASS);
log.debug("[Startup] VITE_AUTH_BYPASS:", process.env.VITE_AUTH_BYPASS);
log.debug("[Startup] NODE_ENV:", process.env.NODE_ENV);

// Now import other modules
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../routers"; // FULL ROUTER - all functionality restored
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { apiRateLimit } from "./rateLimit";
import { runMigrations } from "../migrations/run-migrations";
import {
  metricsHandler,
  metricsMiddleware,
} from "../services/metrics/prometheus";
import cookieParser from "cookie-parser";
import { setupMiddleware, setupErrorHandlers } from "../setup-middleware";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  // Run database migrations first
  await runMigrations();

  log.info("[Server] Starting Priority 1 middleware initialization...");

  // Register all services with DI container
  const { registerServices } = await import("./service-registry");
  registerServices();
  log.info("[DI] Dependency injection container initialized");

  const app = express();
  const server = createServer(app);

  // Trust proxy for rate limiting behind reverse proxy
  app.set("trust proxy", 1);

  // Stripe webhook route - MUST be before body parser to get raw body
  app.post(
    "/api/stripe/webhook",
    express.raw({ type: "application/json" }),
    async (req, res) => {
      const { handleStripeWebhook } = await import("../stripe/webhookHandler");
      return handleStripeWebhook(req, res);
    }
  );

  // Configure body parser and cookie parser BEFORE all middleware
  // (CSRF middleware needs req.cookies to be populated)
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  app.use(cookieParser());

  // Setup Priority 1 middleware (security, performance, monitoring)
  // cookieParser must be registered first so req.cookies is available for CSRF
  await setupMiddleware(app);

  // Apply metrics middleware (before routes)
  app.use(metricsMiddleware);

  // Prometheus metrics endpoint (no rate limiting)
  app.get("/api/metrics", metricsHandler);

  // Health check endpoints are registered in setupMiddleware
  // See server/routers/health.router.ts for all health endpoints

  // Apply rate limiting to ALL routes (not just /api)
  app.use(apiRateLimit);

  // Simple email/password authentication
  const simpleAuthRoutes = await import("../routes/simple-auth");
  app.use("/api/auth", simpleAuthRoutes.default);
  // API v1 versioned alias (backwards-compatible)
  app.use("/api/v1/auth", simpleAuthRoutes.default);

  // AI Agents REST routes (for AgentDetailPage)
  const agentsRoutes = await import("../routes/agents");
  app.use("/api/agents", agentsRoutes.default);

  // tRPC API (mounted at both /api/trpc and /api/v1/trpc for versioning)
  const trpcMiddleware = createExpressMiddleware({
    router: appRouter,
    createContext,
  });
  app.use("/api/trpc", trpcMiddleware);
  app.use("/api/v1/trpc", trpcMiddleware);

  // API version info endpoint
  app.get("/api/v1", (_req, res) => {
    res.json({
      version: "1",
      status: "ok",
      description: "CEPHO Brain API v1",
      docs: "/api/docs",
    });
  });

  // OpenAPI / Swagger UI docs
  const apiDocsRoute = await import("../routes/api-docs");
  app.use("/api/docs", apiDocsRoute.default);

  // Setup error handlers (must be after all routes)
  setupErrorHandlers(app);

  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    log.debug(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    log.debug(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch((err: unknown) => {
  process.stderr.write(`[CEPHO.AI] Fatal startup error: ${String(err)}\n`);
  process.exit(1);
});
