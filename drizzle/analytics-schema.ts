/**
 * Analytics and Feature Flags Schema
 * Remediation Tasks 6.1 (Analytics) and 6.3 (Feature Flags)
 *
 * Lightweight PostHog alternative — no external account needed.
 * All data stays in the existing PostgreSQL database.
 */

import {
  pgTable,
  serial,
  integer,
  varchar,
  text,
  boolean,
  jsonb,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { users } from "./schema";

// ── Analytics Events ──────────────────────────────────────────────────────────

export const analyticsEvents = pgTable(
  "analytics_events",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    sessionId: varchar("session_id", { length: 128 }),
    eventName: varchar("event_name", { length: 200 }).notNull(),
    eventCategory: varchar("event_category", { length: 100 })
      .notNull()
      .default("general"),
    properties: jsonb("properties").default({}),
    pagePath: varchar("page_path", { length: 500 }),
    referrer: varchar("referrer", { length: 500 }),
    userAgent: varchar("user_agent", { length: 500 }),
    ipHash: varchar("ip_hash", { length: 64 }), // SHA-256 of IP for privacy
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  table => ({
    userIdIdx: index("analytics_events_user_id_idx").on(table.userId),
    eventNameIdx: index("analytics_events_event_name_idx").on(table.eventName),
    createdAtIdx: index("analytics_events_created_at_idx").on(table.createdAt),
    sessionIdx: index("analytics_events_session_idx").on(table.sessionId),
  })
);

// ── Feature Flags ─────────────────────────────────────────────────────────────

export const featureFlags = pgTable(
  "feature_flags",
  {
    id: serial("id").primaryKey(),
    key: varchar("key", { length: 200 }).notNull().unique(),
    name: varchar("name", { length: 200 }).notNull(),
    description: text("description"),
    enabled: boolean("enabled").notNull().default(false),
    rolloutPercentage: integer("rollout_percentage").notNull().default(0),
    userIds: jsonb("user_ids").default([]), // specific user IDs to enable for
    conditions: jsonb("conditions").default({}), // arbitrary conditions
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  table => ({
    keyIdx: uniqueIndex("feature_flags_key_idx").on(table.key),
  })
);

export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
export type NewAnalyticsEvent = typeof analyticsEvents.$inferInsert;
export type FeatureFlag = typeof featureFlags.$inferSelect;
export type NewFeatureFlag = typeof featureFlags.$inferInsert;
