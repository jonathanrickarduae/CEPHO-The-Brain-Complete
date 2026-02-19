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
  log.debug('[dotenv] Loaded .env.production from:', envPath);
  log.debug('[dotenv] DATABASE_URL present:', !!process.env.DATABASE_URL);
} else {
  dotenv.config();
}

// Debug: Log auth bypass status at startup
log.debug('[Startup] AUTH_BYPASS:', process.env.AUTH_BYPASS);
log.debug('[Startup] VITE_AUTH_BYPASS:', process.env.VITE_AUTH_BYPASS);
log.debug('[Startup] NODE_ENV:', process.env.NODE_ENV);

// Now import other modules
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerGoogleOAuthRoutes } from "./google-oauth";
// import { appRouter } from "../routers"; // FULL ROUTER - all functionality restored
// import { appRouter } from "../routers-minimal"; // PHASE 0 - emergency minimal
// import { appRouter } from "../routers-phase1"; // PHASE 1 - core inline routers (STABLE)
// import { appRouter } from "../routers-phase2"; // PHASE 2 - core + domain routers
import { appRouter } from "../routers-batch4"; // BATCH 4 - Domain + first 7 non-domain routers
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { apiRateLimit } from "./rateLimit";
import { runMigrations } from "../migrations/run-migrations";
import { applySecurityMiddleware } from "../middleware/security-headers";
import { metricsHandler, metricsMiddleware } from "../services/metrics/prometheus";
import cookieParser from "cookie-parser";

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
  
  const app = express();
  const server = createServer(app);
  
  // Trust proxy for rate limiting behind reverse proxy
  app.set('trust proxy', 1);
  
  // CRITICAL: Security headers MUST be first
  applySecurityMiddleware(app);
  
  // Apply metrics middleware (before routes)
  app.use(metricsMiddleware);
  
  // Stripe webhook route - MUST be before body parser to get raw body
  app.post("/api/stripe/webhook", express.raw({ type: "application/json" }), async (req, res) => {
    const { handleStripeWebhook } = await import("../stripe/webhookHandler");
    return handleStripeWebhook(req, res);
  });
  
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  app.use(cookieParser());
  
  // Prometheus metrics endpoint (no rate limiting)
  app.get("/api/metrics", metricsHandler);
  
  // Apply rate limiting to ALL routes (not just /api)
  app.use(apiRateLimit);
  
  // Google OAuth routes (DISABLED - using email/password auth)
  // registerGoogleOAuthRoutes(app);
  
  // Simple email/password authentication
  const simpleAuthRoutes = await import("../routes/simple-auth");
  app.use("/api/auth", simpleAuthRoutes.default);
  
  // Workflow API routes
  const workflowRoutes = await import("../routes/workflows");
  app.use("/api/workflows", workflowRoutes.default);
  
  // AI Agents API routes
  const agentRoutes = await import("../routes/agents");
  app.use("/api/agents", agentRoutes.default);
  
  // Library API routes
  const libraryRoutes = await import("../routes/libraryRouter");
  app.use("/api/library", libraryRoutes.default);
  
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  
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

startServer().catch(console.error);
