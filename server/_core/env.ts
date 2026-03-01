export const ENV = {
  // ── Core ─────────────────────────────────────────────────────────────────
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  sessionSecret: process.env.SESSION_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  port: parseInt(process.env.PORT ?? "3000", 10),

  // ── AI / LLM ─────────────────────────────────────────────────────────────
  aiEnabled: process.env.AI_ENABLED !== "false",
  defaultLlmProvider: process.env.DEFAULT_LLM_PROVIDER ?? "openai",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  openAiApiKey: process.env.OPENAI_API_KEY ?? "",
  anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? "",

  // ── Supabase ──────────────────────────────────────────────────────────────
  supabaseUrl: process.env.SUPABASE_URL ?? "",
  supabaseServiceKey:
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_SERVICE_KEY ??
    "",
  supabaseJwtSecret: process.env.SUPABASE_JWT_SECRET ?? "",

  // ── Google OAuth ──────────────────────────────────────────────────────────
  googleClientId: process.env.GOOGLE_CLIENT_ID ?? "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",

  // ── Email / SMTP ──────────────────────────────────────────────────────────
  smtpUser: process.env.SMTP_USER ?? process.env.GMAIL_EMAIL ?? "",
  smtpPass: process.env.SMTP_PASS ?? "",
  emailPrimary: process.env.EMAIL_PRIMARY ?? "",
  emailBusiness: process.env.EMAIL_BUSINESS ?? "",

  // ── Productivity Integrations ─────────────────────────────────────────────
  asanaApiKey: process.env.ASANA_API ?? "",
  asanaEmail: process.env.ASANA_EMAIL ?? "",
  todoistApiKey: process.env.TODOIST_API_KEY ?? "",
  notionApiKey: process.env.NOTION_API_KEY ?? "",
  trelloApiKey: process.env.TRELLO_API_KEY ?? "",
  trelloApiSecret: process.env.TRELLO_API_SECRET ?? "",
  githubToken: process.env.GITHUB_TOKEN ?? process.env.GITHUB_API_KEY ?? "",
  githubEmail: process.env.GITHUB_EMAIL ?? "",

  // ── Calendar / Scheduling ─────────────────────────────────────────────────
  calendlyApiKey: process.env.CALENDLY_API_KEY ?? "",

  // ── Communication ─────────────────────────────────────────────────────────
  zoomAccountId: process.env.ZOOM_ACCOUNT_ID ?? "",
  zoomClientId: process.env.ZOOM_CLIENT_ID ?? "",
  zoomClientSecret: process.env.ZOOM_CLIENT_SECRET ?? "",

  // ── Media / Voice ─────────────────────────────────────────────────────────
  elevenLabsApiKey: process.env.ELEVENLABS_API_KEY ?? "",
  synthesiaApiKey: process.env.SYNTHESIA_API_KEY ?? "",

  // ── Security ──────────────────────────────────────────────────────────────
  integrationEncryptionKey:
    process.env.INTEGRATION_ENCRYPTION_KEY ??
    "cepho-integration-key-2026-secure",
};
// Phase 2 — Startup Environment Validation
// Only validate at runtime, not during build
export function validateEnvironment() {
  const requiredEnv: string[] = [
    // DATABASE_URL is optional - app works without it, DB features return empty data
    // "DATABASE_URL",
    // Temporarily commented out to allow deployment without Forge API
    // "BUILT_IN_FORGE_API_URL",
    // "BUILT_IN_FORGE_API_KEY",
    // "OWNER_OPEN_ID",
  ];

  for (const key of requiredEnv) {
    if (!process.env[key]) {
      throw new Error(
        `Missing required environment variable: ${key}. Cepho cannot start safely without it.`
      );
    }
  }
}
