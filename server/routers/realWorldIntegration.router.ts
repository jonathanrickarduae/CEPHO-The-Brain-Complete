/**
 * Real-World Integration Layer Router
 *
 * Acts as a bridge between the platform's internal autonomous agents and
 * external third-party APIs. Manages integration configurations, credentials
 * vault references, and execution of real-world actions such as payments,
 * domain registration, and advertising campaigns.
 *
 * Phase 3 deliverable — spec: docs/specs/Real-WorldIntegrationLayer.md
 */
import { z } from "zod";
import { eq, desc, and } from "drizzle-orm";
import { protectedProcedure, router } from "../_core/trpc";
import { db } from "../db";
import { realWorldIntegrations } from "../../drizzle/schema";

const SUPPORTED_PROVIDERS = [
  "stripe",
  "aws",
  "godaddy",
  "namecheap",
  "google_ads",
  "facebook_ads",
  "mailchimp",
  "sendgrid",
  "twilio",
  "zapier",
] as const;

export const realWorldIntegrationRouter = router({
  /**
   * Register a new third-party integration.
   */
  register: protectedProcedure
    .input(
      z.object({
        provider: z.enum(SUPPORTED_PROVIDERS),
        displayName: z.string().optional(),
        credentialsVaultKey: z.string(),
        metadata: z.record(z.string(), z.string()).optional().default({}),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [integration] = await db
        .insert(realWorldIntegrations)
        .values({
          userId: ctx.user.id,
          provider: input.provider,
          displayName: input.displayName ?? input.provider,
          credentialsVaultKey: input.credentialsVaultKey,
          metadata: JSON.stringify(input.metadata),
          status: "active",
        })
        .returning();

      return integration;
    }),

  /**
   * List all integrations for the current user.
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    return db
      .select()
      .from(realWorldIntegrations)
      .where(eq(realWorldIntegrations.userId, ctx.user.id))
      .orderBy(desc(realWorldIntegrations.createdAt));
  }),

  /**
   * Get a single integration by ID.
   */
  getById: protectedProcedure
    .input(z.object({ integrationId: z.number() }))
    .query(async ({ ctx, input }) => {
      const [integration] = await db
        .select()
        .from(realWorldIntegrations)
        .where(
          and(
            eq(realWorldIntegrations.id, input.integrationId),
            eq(realWorldIntegrations.userId, ctx.user.id)
          )
        );
      if (!integration) throw new Error("Integration not found.");
      return integration;
    }),

  /**
   * Update integration status (active, inactive, error).
   */
  updateStatus: protectedProcedure
    .input(
      z.object({
        integrationId: z.number(),
        status: z.enum(["active", "inactive", "error"]),
        errorMessage: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [updated] = await db
        .update(realWorldIntegrations)
        .set({
          status: input.status,
          errorMessage: input.errorMessage ?? null,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(realWorldIntegrations.id, input.integrationId),
            eq(realWorldIntegrations.userId, ctx.user.id)
          )
        )
        .returning();
      if (!updated) throw new Error("Integration not found.");
      return updated;
    }),

  /**
   * Remove an integration.
   */
  remove: protectedProcedure
    .input(z.object({ integrationId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await db
        .delete(realWorldIntegrations)
        .where(
          and(
            eq(realWorldIntegrations.id, input.integrationId),
            eq(realWorldIntegrations.userId, ctx.user.id)
          )
        );
      return { success: true };
    }),

  /**
   * List all supported integration providers.
   */
  listProviders: protectedProcedure.query(() => {
    return SUPPORTED_PROVIDERS.map(p => ({
      id: p,
      name: p
        .split("_")
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" "),
    }));
  }),
});
