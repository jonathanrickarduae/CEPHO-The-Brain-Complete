import express, { type Express, type Request, type Response } from "express";
import fs from "fs";
import { type Server } from "http";
import { nanoid } from "nanoid";
import path from "path";
import { createServer as createViteServer } from "vite";
import viteConfig from "../../vite.config";

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req: Request, res: Response, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );

      // always reload the index.html file from disk in case it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );

      // Inject the per-request CSP nonce into inline <script> tags so they are
      // permitted by the nonce-based Content-Security-Policy header.
      const nonce = (res.locals.cspNonce as string) || "";
      if (nonce) {
        // Add nonce to any <script> tag that does not already have one
        template = template.replace(
          /<script(?![^>]*\snonce=)([^>]*)>/g,
          `<script nonce="${nonce}"$1>`
        );
      }

      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath =
    process.env.NODE_ENV === "development"
      ? path.resolve(import.meta.dirname, "../..", "dist", "public")
      : process.cwd() + "/dist/public";
  if (!fs.existsSync(distPath)) {
  }

  // index: false prevents express.static from serving index.html directly for GET /.
  // Without this, express.static intercepts the request and sends index.html without the
  // per-request CSP nonce, causing the inline service-worker script to be blocked by CSP
  // and React to never mount (blank white screen).
  app.use(express.static(distPath, { index: false }));

  // S1-01 FIX: Serve index.html with CSP nonce injected into all inline <script> tags.
  // All HTML requests (including GET /) fall through to here so the nonce is always injected.
  app.use("*", (req: Request, res: Response) => {
    const indexPath = path.resolve(distPath, "index.html");
    fs.readFile(indexPath, "utf-8", (err, html) => {
      if (err) {
        res.status(500).send("Internal Server Error");
        return;
      }
      const nonce = (res.locals.cspNonce as string) || "";
      if (nonce) {
        // Inject nonce into any <script> tag that does not already have one
        html = html.replace(
          /<script(?![^>]*\snonce=)([^>]*)>/g,
          `<script nonce="${nonce}"$1>`
        );
      }
      res.status(200).set({ "Content-Type": "text/html" }).end(html);
    });
  });
}
