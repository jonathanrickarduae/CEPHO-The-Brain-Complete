import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import fs from "node:fs";
import path from "path";
import { defineConfig } from "vite";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";

const plugins = [
  react(),
  tailwindcss(),
  ViteImageOptimizer({
    jpg: { quality: 80 },
    jpeg: { quality: 80 },
    png: { quality: 80, compressionLevel: 8 },
    webp: { quality: 80 },
    // Convert JPG/PNG to WebP for modern browsers
    includePublic: true,
  }),
];

export default defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
      "@components": path.resolve(
        import.meta.dirname,
        "client",
        "src",
        "components"
      ),
      "@expert-evolution": path.resolve(
        import.meta.dirname,
        "client",
        "src",
        "components",
        "expert-evolution"
      ),
      "@business-plan": path.resolve(
        import.meta.dirname,
        "client",
        "src",
        "components",
        "business-plan"
      ),
      "@document-library": path.resolve(
        import.meta.dirname,
        "client",
        "src",
        "components",
        "document-library"
      ),
      "@mood-tracking": path.resolve(
        import.meta.dirname,
        "client",
        "src",
        "components",
        "mood-tracking"
      ),
      "@team-management": path.resolve(
        import.meta.dirname,
        "client",
        "src",
        "components",
        "team-management"
      ),
      "@project-management": path.resolve(
        import.meta.dirname,
        "client",
        "src",
        "components",
        "project-management"
      ),
      "@review-system": path.resolve(
        import.meta.dirname,
        "client",
        "src",
        "components",
        "review-system"
      ),
      "@analytics": path.resolve(
        import.meta.dirname,
        "client",
        "src",
        "components",
        "analytics"
      ),
      "@integrations": path.resolve(
        import.meta.dirname,
        "client",
        "src",
        "components",
        "integrations"
      ),
      "@ai-agents": path.resolve(
        import.meta.dirname,
        "client",
        "src",
        "components",
        "ai-agents"
      ),
      "@content": path.resolve(
        import.meta.dirname,
        "client",
        "src",
        "components",
        "content"
      ),
      "@communication": path.resolve(
        import.meta.dirname,
        "client",
        "src",
        "components",
        "communication"
      ),
      "@settings": path.resolve(
        import.meta.dirname,
        "client",
        "src",
        "components",
        "settings"
      ),
      "@onboarding": path.resolve(
        import.meta.dirname,
        "client",
        "src",
        "components",
        "onboarding"
      ),
      "@layout": path.resolve(
        import.meta.dirname,
        "client",
        "src",
        "components",
        "layout"
      ),
      "@ui": path.resolve(
        import.meta.dirname,
        "client",
        "src",
        "components",
        "ui"
      ),
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
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Use content hash for cache busting
        entryFileNames: "assets/[name]-[hash].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",
        // Manual chunk splitting for better caching
        manualChunks(id) {
          // React core
          if (
            id.includes("node_modules/react/") ||
            id.includes("node_modules/react-dom/")
          ) {
            return "react-vendor";
          }
          // React Router
          if (id.includes("node_modules/react-router")) {
            return "router-vendor";
          }
          // UI libraries — split large ones for better caching
          if (id.includes("lucide-react")) {
            return "icons-vendor";
          }
          if (id.includes("recharts") || id.includes("d3-") || id.includes("victory")) {
            return "charts-vendor";
          }
          if (id.includes("framer-motion")) {
            return "animation-vendor";
          }
          if (id.includes("@radix-ui")) {
            return "radix-vendor";
          }
          // Data/API libraries
          if (id.includes("@tanstack/react-query") || id.includes("@trpc")) {
            return "data-vendor";
          }
          // Chart libraries — split cytoscape and mermaid (combined was 2320 KB)
          if (id.includes("cytoscape")) {
            return "cytoscape-vendor";
          }
          if (id.includes("mermaid")) {
            return "mermaid-vendor";
          }
          // PDF/Document libraries (large)
          if (id.includes("jspdf") || id.includes("html2canvas")) {
            return "document-vendor";
          }
          // Code editor (large)
          if (id.includes("monaco-editor")) {
            return "editor-vendor";
          }
          // CodeMirror language packs — each gets its own chunk (emacs-lisp was 764 KB)
          if (id.includes("@codemirror/lang-")) {
            const match = id.match(/@codemirror\/lang-([a-z-]+)/);
            if (match) return `cm-lang-${match[1]}`;
            return "cm-lang-misc";
          }
          // CodeMirror core
          if (id.includes("@codemirror/") || id.includes("/codemirror/")) {
            return "codemirror-vendor";
          }
          // Highlight.js (contributes to ExpertChatPage 832 KB)
          if (id.includes("highlight.js")) {
            return "highlight-vendor";
          }
          // WASM / binary assets — keep separate (wasm was 608 KB)
          if (id.includes(".wasm")) {
            return "wasm-vendor";
          }
          // Zod schema validation
          if (id.includes("node_modules/zod")) {
            return "zod-vendor";
          }
          // Date utilities
          if (
            id.includes("date-fns") ||
            id.includes("dayjs") ||
            id.includes("luxon")
          ) {
            return "date-vendor";
          }
        },
      },
    },
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
