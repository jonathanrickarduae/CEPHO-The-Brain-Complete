import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import fs from "node:fs";
import path from "path";
import { defineConfig } from "vite";

const plugins = [react(), tailwindcss()];

export default defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
      "@components": path.resolve(import.meta.dirname, "client", "src", "components"),
      "@expert-evolution": path.resolve(import.meta.dirname, "client", "src", "components", "expert-evolution"),
      "@business-plan": path.resolve(import.meta.dirname, "client", "src", "components", "business-plan"),
      "@document-library": path.resolve(import.meta.dirname, "client", "src", "components", "document-library"),
      "@mood-tracking": path.resolve(import.meta.dirname, "client", "src", "components", "mood-tracking"),
      "@team-management": path.resolve(import.meta.dirname, "client", "src", "components", "team-management"),
      "@project-management": path.resolve(import.meta.dirname, "client", "src", "components", "project-management"),
      "@review-system": path.resolve(import.meta.dirname, "client", "src", "components", "review-system"),
      "@analytics": path.resolve(import.meta.dirname, "client", "src", "components", "analytics"),
      "@integrations": path.resolve(import.meta.dirname, "client", "src", "components", "integrations"),
      "@ai-agents": path.resolve(import.meta.dirname, "client", "src", "components", "ai-agents"),
      "@content": path.resolve(import.meta.dirname, "client", "src", "components", "content"),
      "@communication": path.resolve(import.meta.dirname, "client", "src", "components", "communication"),
      "@settings": path.resolve(import.meta.dirname, "client", "src", "components", "settings"),
      "@onboarding": path.resolve(import.meta.dirname, "client", "src", "components", "onboarding"),
      "@layout": path.resolve(import.meta.dirname, "client", "src", "components", "layout"),
      "@ui": path.resolve(import.meta.dirname, "client", "src", "components", "ui"),
      "@hooks": path.resolve(import.meta.dirname, "client", "src", "hooks"),
      "@lib": path.resolve(import.meta.dirname, "client", "src", "lib"),
      "@data": path.resolve(import.meta.dirname, "client", "src", "data"),
      "@pages": path.resolve(import.meta.dirname, "client", "src", "pages"),
    },
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    host: true,
    allowedHosts: [
      ".manuspre.computer",
      ".manus.computer",
      ".manus-asia.computer",
      ".manuscomputer.ai",
      ".manusvm.computer",
      "localhost",
      "127.0.0.1",
    ],
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
