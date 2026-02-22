import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { startAutomation } from "./services/automation-scheduler.js";
import { validateEnvironment } from "./_core/env.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  // Validate environment variables at startup
  validateEnvironment();
  
  const app = express();
  const server = createServer(app);

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  // Serve static files with proper cache headers
  app.use(express.static(staticPath, {
    maxAge: 0, // Don't cache HTML
    setHeaders: (res, filePath) => {
      // Cache assets with hash in filename for 1 year
      if (filePath.match(/\.(js|css|woff2?|ttf|eot)$/) && filePath.match(/-[a-f0-9]{8}\./)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      }
      // Cache images for 1 week
      else if (filePath.match(/\.(jpg|jpeg|png|gif|svg|webp|ico)$/)) {
        res.setHeader('Cache-Control', 'public, max-age=604800');
      }
      // Don't cache HTML files
      else if (filePath.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
      }
    }
  }));

  // Handle client-side routing - serve index.html for all routes
  app.get("*", (_req, res) => {
    // Prevent caching of index.html
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
    
    // Start 24-hour automation system
    console.log('[Server] Starting 24-hour automation system...');
    startAutomation();
    console.log('[Server] Automation system started');
  });
}

startServer().catch(console.error);
