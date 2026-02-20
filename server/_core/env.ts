export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  supabaseUrl: process.env.SUPABASE_URL ?? "",
  supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY ?? "",
  elevenLabsApiKey: process.env.ELEVENLABS_API_KEY ?? "",
};
// Phase 2 — Startup Environment Validation
// Only validate at runtime, not during build
export function validateEnvironment() {
  const requiredEnv = [
    "DATABASE_URL",
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
