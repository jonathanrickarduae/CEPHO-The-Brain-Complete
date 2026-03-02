/**
 * Public API Keys Router
 * Allows users to generate and manage API keys for programmatic access.
 * Phase 6 — Enhancements
 */
import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { db } from "../db";
import { apiKeys } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";

function generateApiKey(): { key: string; prefix: string; hash: string } {
  const key = `cepho_${crypto.randomBytes(32).toString("hex")}`;
  const prefix = key.substring(0, 14); // "cepho_" + 8 chars
  const hash = crypto.createHash("sha256").update(key).digest("hex");
  return { key, prefix, hash };
}

export const apiKeysRouter = router({
  /**
   * List all API keys for the current user (never returns the full key)
   */
  listKeys: protectedProcedure.query(async ({ ctx }) => {
    const keys = await db
      .select({
        id: apiKeys.id,
        name: apiKeys.name,
        keyPrefix: apiKeys.keyPrefix,
        scopes: apiKeys.scopes,
        lastUsedAt: apiKeys.lastUsedAt,
        expiresAt: apiKeys.expiresAt,
        isActive: apiKeys.isActive,
        createdAt: apiKeys.createdAt,
        revokedAt: apiKeys.revokedAt,
      })
      .from(apiKeys)
      .where(and(eq(apiKeys.userId, ctx.user.id), eq(apiKeys.isActive, true)));

    return { keys };
  }),

  /**
   * Create a new API key — returns the full key ONCE, never again
   */
  createKey: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(200),
        scopes: z.array(z.string()).default(["read"]),
        expiresInDays: z.number().int().min(1).max(365).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { key, prefix, hash } = generateApiKey();

      const expiresAt = input.expiresInDays
        ? new Date(Date.now() + input.expiresInDays * 24 * 60 * 60 * 1000)
        : null;

      const [created] = await db
        .insert(apiKeys)
        .values({
          userId: ctx.user.id,
          name: input.name,
          keyHash: hash,
          keyPrefix: prefix,
          scopes: input.scopes,
          expiresAt: expiresAt ?? undefined,
          isActive: true,
        })
        .returning({
          id: apiKeys.id,
          name: apiKeys.name,
          keyPrefix: apiKeys.keyPrefix,
          scopes: apiKeys.scopes,
          expiresAt: apiKeys.expiresAt,
          createdAt: apiKeys.createdAt,
        });

      // Return the full key ONCE — it cannot be retrieved again
      return {
        success: true,
        key, // Full key shown only on creation
        ...created,
        warning: "Save this key now. It will not be shown again.",
      };
    }),

  /**
   * Revoke an API key
   */
  revokeKey: protectedProcedure
    .input(z.object({ keyId: z.number().int() }))
    .mutation(async ({ ctx, input }) => {
      await db
        .update(apiKeys)
        .set({ isActive: false, revokedAt: new Date() })
        .where(
          and(eq(apiKeys.id, input.keyId), eq(apiKeys.userId, ctx.user.id))
        );

      return { success: true };
    }),
});
