// @ts-check
// ESLint is scoped to the critical server path files only.
// Client files and legacy code are excluded until they are actively refactored.
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import prettierConfig from "eslint-config-prettier";
import globals from "globals";

export default tseslint.config(
  // Base JS recommended rules
  js.configs.recommended,

  // TypeScript recommended rules
  ...tseslint.configs.recommended,

  // Node globals for server files
  {
    files: [
      "server/_core/**/*.ts",
      "server/middleware/**/*.ts",
      "server/routes/**/*.ts",
      "server/utils/**/*.ts",
    ],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },

  // Disable rules that conflict with Prettier formatting
  prettierConfig,

  // Ignore everything except the critical server path
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "build/**",
      "coverage/**",
      "*.tsbuildinfo",
      "drizzle/**",
      // Ignore all client code until it is actively refactored
      "client/**",
      // Ignore legacy server files not on the critical path
      "server/services/**",
      "server/workflows/**",
      "server/routers/**",
      "server/stripe/**",
      "server/db.ts",
      "server/migrate.ts",
      // Ignore config and shared files
      "shared/**",
      "*.config.*",
      "*.config.ts",
      "*.config.mjs",
      "vite.config.ts",
      "vitest.config.ts",
      "jest.config.ts",
      "tailwind.config.*",
      "postcss.config.*",
    ],
  }
);
