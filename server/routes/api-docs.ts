/**
 * OpenAPI / Swagger UI Route
 *
 * Serves the interactive API documentation at /api/docs
 * The OpenAPI spec is loaded from docs/openapi.yaml
 */
import { Router } from "express";
import swaggerUi from "swagger-ui-express";
import yaml from "js-yaml";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const apiDocsRouter = Router();

// Load the OpenAPI spec from docs/openapi.yaml
function loadSpec() {
  try {
    // Try multiple paths to find the spec
    const possiblePaths = [
      path.resolve(__dirname, "../../docs/openapi.yaml"),
      path.resolve(process.cwd(), "docs/openapi.yaml"),
    ];

    for (const specPath of possiblePaths) {
      if (fs.existsSync(specPath)) {
        const content = fs.readFileSync(specPath, "utf8");
        return yaml.load(content) as Record<string, unknown>;
      }
    }

    // Fallback minimal spec if file not found
    return {
      openapi: "3.0.3",
      info: {
        title: "CEPHO.AI Platform API",
        version: "1.0.0",
        description: "CEPHO Brain API — see /api/trpc for tRPC procedures",
      },
      paths: {},
    };
  } catch {
    return null;
  }
}

const spec = loadSpec();

if (spec) {
  // Custom Swagger UI options
  const swaggerOptions: swaggerUi.SwaggerUiOptions = {
    customSiteTitle: "CEPHO Brain API Docs",
    customCss: `
      .swagger-ui .topbar { background-color: #1a1a2e; }
      .swagger-ui .topbar .download-url-wrapper { display: none; }
      .swagger-ui .info .title { color: #e91e8c; }
    `,
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      tryItOutEnabled: true,
    },
  };

  apiDocsRouter.use("/", swaggerUi.serve);
  apiDocsRouter.get("/", swaggerUi.setup(spec, swaggerOptions));

  // Also serve the raw JSON spec
  apiDocsRouter.get("/json", (_req, res) => {
    res.json(spec);
  });

  // Serve the raw YAML spec
  apiDocsRouter.get("/yaml", (_req, res) => {
    res.setHeader("Content-Type", "text/yaml");
    res.send(yaml.dump(spec));
  });
}

export default apiDocsRouter;
