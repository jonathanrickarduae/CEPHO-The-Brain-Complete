import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { startAutomation } from "./services/automation-scheduler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  // Handle client-side routing - serve index.html for all routes
  app.get("*", (_req, res) => {
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
