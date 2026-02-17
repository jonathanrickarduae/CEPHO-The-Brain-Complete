import { pgTable, text, timestamp, integer, boolean, uuid } from "drizzle-orm/pg-core";
import { users } from "./schema";

// Waitlist entries for users waiting to join
export const waitlist = pgTable("waitlist", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  referralCode: text("referral_code").notNull().unique(),
  referredBy: text("referred_by"), // referral code of the person who referred them
  position: integer("position").notNull(),
  status: text("status").notNull().default("waiting"), // waiting, invited, converted
  createdAt: timestamp("created_at").defaultNow().notNull(),
  invitedAt: timestamp("invited_at"),
  convertedAt: timestamp("converted_at"),
});

// Referral tracking for active users
export const referrals = pgTable("referrals", {
  id: uuid("id").defaultRandom().primaryKey(),
  referrerId: text("referrer_id").notNull().references(() => users.id),
  referredEmail: text("referred_email").notNull(),
  referralCode: text("referral_code").notNull(),
  status: text("status").notNull().default("pending"), // pending, joined, converted
  creditsAwarded: integer("credits_awarded").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  joinedAt: timestamp("joined_at"),
  convertedAt: timestamp("converted_at"),
});

// User credits for gamification
export const userCredits = pgTable("user_credits", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull().references(() => users.id).unique(),
  totalCredits: integer("total_credits").notNull().default(0),
  usedCredits: integer("used_credits").notNull().default(0),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Credit transactions log
export const creditTransactions = pgTable("credit_transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  amount: integer("amount").notNull(), // positive for earned, negative for spent
  type: text("type").notNull(), // referral_sent, referral_joined, referral_converted, ai_usage, bonus
  description: text("description"),
  referenceId: text("reference_id"), // ID of related referral or action
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Shareable insights for viral content
export const sharedInsights = pgTable("shared_insights", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // productivity_report, mood_summary, goal_achievement, ai_consultation
  title: text("title").notNull(),
  content: text("content").notNull(), // JSON content of the insight
  shareCode: text("share_code").notNull().unique(),
  isPublic: boolean("is_public").notNull().default(true),
  viewCount: integer("view_count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
});
