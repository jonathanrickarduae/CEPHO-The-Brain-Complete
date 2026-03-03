/**
 * CEPHO.AI — Database Seed Script
 * ================================
 * Populates the database with essential reference data and a default admin user.
 * Run with: pnpm tsx scripts/seed.ts
 *
 * IMPORTANT: This script is idempotent — it uses upsert logic and can be run
 * multiple times safely without creating duplicates.
 */

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../drizzle/schema.ts";
import { eq } from "drizzle-orm";

// ─────────────────────────────────────────────
// Database Connection
// ─────────────────────────────────────────────
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("❌ DATABASE_URL environment variable is not set.");
  process.exit(1);
}

const client = postgres(connectionString);
const db = drizzle(client, { schema });

// ─────────────────────────────────────────────
// Seed Data
// ─────────────────────────────────────────────

async function seedAdminUser() {
  console.log("👤 Seeding admin user...");

  const adminEmail = process.env.ADMIN_EMAIL || "admin@cepho.ai";
  const adminName = process.env.ADMIN_NAME || "Admin";

  const existing = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, adminEmail))
    .limit(1);

  if (existing.length > 0) {
    console.log(`   ✓ Admin user already exists: ${adminEmail}`);
    return existing[0];
  }

  const [admin] = await db
    .insert(schema.users)
    .values({
      email: adminEmail,
      name: adminName,
      role: "admin",
      subscriptionTier: "pro",
      onboardingCompleted: true,
    })
    .returning();

  console.log(`   ✓ Created admin user: ${adminEmail} (id: ${admin.id})`);
  return admin;
}

async function seedUserSettings(userId: number) {
  console.log("⚙️  Seeding default user settings...");

  const existing = await db
    .select()
    .from(schema.userSettings)
    .where(eq(schema.userSettings.userId, userId))
    .limit(1);

  if (existing.length > 0) {
    console.log("   ✓ User settings already exist");
    return;
  }

  await db.insert(schema.userSettings).values({
    userId,
    theme: "dark",
    language: "en",
    timezone: "UTC",
    notificationsEnabled: true,
    emailNotifications: true,
    aiEnabled: true,
    defaultLlmProvider: "openai",
  });

  console.log("   ✓ Created default user settings");
}

async function seedAiProviderSettings(userId: number) {
  console.log("🤖 Seeding AI provider settings...");

  const existing = await db
    .select()
    .from(schema.aiProviderSettings)
    .where(eq(schema.aiProviderSettings.userId, userId))
    .limit(1);

  if (existing.length > 0) {
    console.log("   ✓ AI provider settings already exist");
    return;
  }

  await db.insert(schema.aiProviderSettings).values({
    userId,
    provider: "openai",
    model: "gpt-4o",
    temperature: 0.7,
    maxTokens: 4096,
    isDefault: true,
  });

  console.log("   ✓ Created default AI provider settings");
}

async function seedExpertPerformance(userId: number) {
  console.log("🏆 Seeding expert performance records...");

  // Core expert IDs from AI_SME_Experts.json
  const expertIds = [
    "victoria",
    "cfo",
    "cmo",
    "cto",
    "coo",
    "cso",
    "chro",
    "clo",
    "strategy",
    "innovation",
    "legal",
    "compliance",
    "data_scientist",
    "product_manager",
    "ux_designer",
    "growth_hacker",
    "brand_strategist",
    "investor_relations",
    "supply_chain",
    "sustainability",
  ];

  for (const expertId of expertIds) {
    const existing = await db
      .select()
      .from(schema.expertPerformance)
      .where(eq(schema.expertPerformance.expertId, expertId))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(schema.expertPerformance).values({
        userId,
        expertId,
        score: 80,
        projectsCompleted: 0,
        positiveFeedback: 0,
        negativeFeedback: 0,
      });
    }
  }

  console.log(`   ✓ Seeded ${expertIds.length} expert performance records`);
}

async function seedSubscription(userId: number) {
  console.log("💳 Seeding default subscription...");

  const existing = await db
    .select()
    .from(schema.subscriptions)
    .where(eq(schema.subscriptions.userId, userId))
    .limit(1);

  if (existing.length > 0) {
    console.log("   ✓ Subscription already exists");
    return;
  }

  await db.insert(schema.subscriptions).values({
    userId,
    tier: "pro",
    status: "active",
    currentPeriodStart: new Date(),
    currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
  });

  console.log("   ✓ Created default pro subscription");
}

async function seedUserCredits(userId: number) {
  console.log("💰 Seeding user credits...");

  const existing = await db
    .select()
    .from(schema.userCredits)
    .where(eq(schema.userCredits.userId, userId))
    .limit(1);

  if (existing.length > 0) {
    console.log("   ✓ User credits already exist");
    return;
  }

  await db.insert(schema.userCredits).values({
    userId,
    balance: 1000,
    lifetimeEarned: 1000,
    lifetimeSpent: 0,
  });

  console.log("   ✓ Created initial credit balance (1000 credits)");
}

async function seedStreaks(userId: number) {
  console.log("🔥 Seeding streak records...");

  const existing = await db
    .select()
    .from(schema.streaks)
    .where(eq(schema.streaks.userId, userId))
    .limit(1);

  if (existing.length > 0) {
    console.log("   ✓ Streak records already exist");
    return;
  }

  await db.insert(schema.streaks).values({
    userId,
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: new Date(),
  });

  console.log("   ✓ Created streak record");
}

async function seedWellnessScore(userId: number) {
  console.log("💚 Seeding wellness score...");

  const existing = await db
    .select()
    .from(schema.wellnessScores)
    .where(eq(schema.wellnessScores.userId, userId))
    .limit(1);

  if (existing.length > 0) {
    console.log("   ✓ Wellness score already exists");
    return;
  }

  await db.insert(schema.wellnessScores).values({
    userId,
    overallScore: 75,
    workloadScore: 75,
    focusScore: 75,
    balanceScore: 75,
    stressLevel: "moderate",
  });

  console.log("   ✓ Created initial wellness score");
}

// ─────────────────────────────────────────────
// Main Seed Runner
// ─────────────────────────────────────────────
async function main() {
  console.log("\n🌱 CEPHO.AI — Running database seed...\n");

  try {
    // 1. Seed admin user first (all other records depend on userId)
    const admin = await seedAdminUser();
    const userId = admin.id;

    // 2. Seed all user-dependent records
    await seedUserSettings(userId);
    await seedAiProviderSettings(userId);
    await seedExpertPerformance(userId);
    await seedSubscription(userId);
    await seedUserCredits(userId);
    await seedStreaks(userId);
    await seedWellnessScore(userId);

    console.log("\n✅ Seed completed successfully.\n");
  } catch (error) {
    console.error("\n❌ Seed failed:", error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
