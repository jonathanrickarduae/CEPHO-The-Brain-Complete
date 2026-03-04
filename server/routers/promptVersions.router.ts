/**
 * Prompt Version History & Rollback Router — Phase 6 (p6-12)
 *
 * Provides full version control for agent system prompts:
 * - saveVersion: Save a new version of a prompt (auto-increments version number)
 * - listVersions: List all versions for a given agent/prompt key
 * - getVersion: Get a specific version by ID
 * - rollback: Roll back to a previous version (creates a new version entry)
 * - compareVersions: Side-by-side diff metadata for two versions
 * - deleteVersion: Remove a specific version (cannot delete active version)
 * - listPromptKeys: List all prompt keys that have saved versions
 *
 * All versions are persisted to the `prompt_versions` table (Migration 027).
 * Prompt keys follow the pattern: "agent:{agentId}", "board:{memberId}", or "system:{featureName}".
 */
import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { db } from "../db";
import { promptVersions } from "../../drizzle/schema";
import { eq, desc, and, max, sql } from "drizzle-orm";

export const promptVersionsRouter = router({
  /**
   * Save a new version of a prompt — persisted to DB (Migration 027)
   */
  saveVersion: protectedProcedure
    .input(
      z.object({
        promptKey: z
          .string()
          .regex(
            /^(agent|board|system):[a-zA-Z0-9_-]+$/,
            "promptKey must follow pattern: agent:id, board:id, or system:name"
          ),
        content: z.string().min(1).max(50000),
        description: z.string().max(500).optional(),
        setActive: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get the current max version for this key
      const [maxResult] = await db
        .select({ maxVersion: max(promptVersions.version) })
        .from(promptVersions)
        .where(
          and(
            eq(promptVersions.userId, ctx.user.id),
            eq(promptVersions.promptKey, input.promptKey)
          )
        );
      const nextVersion = (maxResult?.maxVersion ?? 0) + 1;

      // Deactivate all existing versions if this is being set as active
      if (input.setActive) {
        await db
          .update(promptVersions)
          .set({ isActive: false })
          .where(
            and(
              eq(promptVersions.userId, ctx.user.id),
              eq(promptVersions.promptKey, input.promptKey),
              eq(promptVersions.isActive, true)
            )
          );
      }

      const [newVersion] = await db
        .insert(promptVersions)
        .values({
          userId: ctx.user.id,
          promptKey: input.promptKey,
          version: nextVersion,
          content: input.content,
          description: input.description ?? null,
          isActive: input.setActive,
          createdBy: ctx.user.name ?? ctx.user.email ?? "unknown",
          tokenCount: Math.ceil(input.content.length / 4), // rough token estimate
        })
        .returning();

      // Count total versions
      const [countResult] = await db
        .select({ total: sql<number>`count(*)::int` })
        .from(promptVersions)
        .where(
          and(
            eq(promptVersions.userId, ctx.user.id),
            eq(promptVersions.promptKey, input.promptKey)
          )
        );

      return {
        success: true,
        version: newVersion,
        totalVersions: countResult?.total ?? 1,
      };
    }),

  /**
   * List all versions for a prompt key
   */
  listVersions: protectedProcedure
    .input(
      z.object({
        promptKey: z.string(),
        limit: z.number().int().min(1).max(100).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const versions = await db
        .select()
        .from(promptVersions)
        .where(
          and(
            eq(promptVersions.userId, ctx.user.id),
            eq(promptVersions.promptKey, input.promptKey)
          )
        )
        .orderBy(desc(promptVersions.version))
        .limit(input.limit);

      const [countResult] = await db
        .select({ total: sql<number>`count(*)::int` })
        .from(promptVersions)
        .where(
          and(
            eq(promptVersions.userId, ctx.user.id),
            eq(promptVersions.promptKey, input.promptKey)
          )
        );

      const activeVersion = versions.find(v => v.isActive)?.version ?? null;

      return {
        versions: versions.map(v => ({
          id: v.id,
          version: v.version,
          description: v.description,
          isActive: v.isActive,
          createdAt: v.createdAt,
          createdBy: v.createdBy,
          tokenCount: v.tokenCount,
          contentLength: v.content.length,
          contentPreview: v.content.slice(0, 200),
        })),
        total: countResult?.total ?? versions.length,
        activeVersion,
      };
    }),

  /**
   * Get a specific version by ID (full content)
   */
  getVersion: protectedProcedure
    .input(z.object({ id: z.number().int() }))
    .query(async ({ ctx, input }) => {
      const [version] = await db
        .select()
        .from(promptVersions)
        .where(
          and(
            eq(promptVersions.id, input.id),
            eq(promptVersions.userId, ctx.user.id)
          )
        );
      if (!version) throw new Error("Version not found");
      return { version };
    }),

  /**
   * Roll back to a previous version
   * Creates a new version entry with the old content (preserves full history)
   */
  rollback: protectedProcedure
    .input(
      z.object({
        id: z.number().int(),
        description: z.string().max(500).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Find the target version
      const [targetVersion] = await db
        .select()
        .from(promptVersions)
        .where(
          and(
            eq(promptVersions.id, input.id),
            eq(promptVersions.userId, ctx.user.id)
          )
        );
      if (!targetVersion) throw new Error("Version not found");

      // Get next version number
      const [maxResult] = await db
        .select({ maxVersion: max(promptVersions.version) })
        .from(promptVersions)
        .where(
          and(
            eq(promptVersions.userId, ctx.user.id),
            eq(promptVersions.promptKey, targetVersion.promptKey)
          )
        );
      const nextVersion = (maxResult?.maxVersion ?? 0) + 1;

      // Deactivate all existing active versions
      await db
        .update(promptVersions)
        .set({ isActive: false })
        .where(
          and(
            eq(promptVersions.userId, ctx.user.id),
            eq(promptVersions.promptKey, targetVersion.promptKey),
            eq(promptVersions.isActive, true)
          )
        );

      // Create new rollback version
      const [rollbackVersion] = await db
        .insert(promptVersions)
        .values({
          userId: ctx.user.id,
          promptKey: targetVersion.promptKey,
          version: nextVersion,
          content: targetVersion.content,
          description:
            input.description ??
            `Rolled back to v${targetVersion.version}`,
          isActive: true,
          createdBy: ctx.user.name ?? ctx.user.email ?? "unknown",
          parentVersionId: targetVersion.id,
          tokenCount: targetVersion.tokenCount,
        })
        .returning();

      return {
        success: true,
        rolledBackFrom: targetVersion.version,
        newVersion: rollbackVersion,
        message: `Successfully rolled back to content from v${targetVersion.version}. New version is v${nextVersion}.`,
      };
    }),

  /**
   * Compare two versions — returns metadata diff
   */
  compareVersions: protectedProcedure
    .input(
      z.object({
        idA: z.number().int(),
        idB: z.number().int(),
      })
    )
    .query(async ({ ctx, input }) => {
      const [versionA] = await db
        .select()
        .from(promptVersions)
        .where(
          and(
            eq(promptVersions.id, input.idA),
            eq(promptVersions.userId, ctx.user.id)
          )
        );
      const [versionB] = await db
        .select()
        .from(promptVersions)
        .where(
          and(
            eq(promptVersions.id, input.idB),
            eq(promptVersions.userId, ctx.user.id)
          )
        );

      if (!versionA || !versionB)
        throw new Error("One or both versions not found");

      const wordsA = versionA.content.split(/\s+/).length;
      const wordsB = versionB.content.split(/\s+/).length;
      const charsA = versionA.content.length;
      const charsB = versionB.content.length;

      return {
        versionA: {
          id: versionA.id,
          version: versionA.version,
          description: versionA.description,
          createdAt: versionA.createdAt,
          wordCount: wordsA,
          charCount: charsA,
          isActive: versionA.isActive,
        },
        versionB: {
          id: versionB.id,
          version: versionB.version,
          description: versionB.description,
          createdAt: versionB.createdAt,
          wordCount: wordsB,
          charCount: charsB,
          isActive: versionB.isActive,
        },
        diff: {
          wordCountDelta: wordsB - wordsA,
          charCountDelta: charsB - charsA,
          contentChanged: versionA.content !== versionB.content,
          percentageSimilarity:
            versionA.content === versionB.content
              ? 100
              : Math.round(
                  (1 -
                    Math.abs(charsA - charsB) / Math.max(charsA, charsB, 1)) *
                    100
                ),
        },
      };
    }),

  /**
   * Delete a specific version (cannot delete the active version)
   */
  deleteVersion: protectedProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ ctx, input }) => {
      const [version] = await db
        .select()
        .from(promptVersions)
        .where(
          and(
            eq(promptVersions.id, input.id),
            eq(promptVersions.userId, ctx.user.id)
          )
        );
      if (!version) throw new Error("Version not found");
      if (version.isActive) {
        throw new Error(
          "Cannot delete the active version. Activate another version first."
        );
      }
      await db
        .delete(promptVersions)
        .where(
          and(
            eq(promptVersions.id, input.id),
            eq(promptVersions.userId, ctx.user.id)
          )
        );
      return { success: true };
    }),

  /**
   * List all prompt keys that have versions saved
   */
  listPromptKeys: protectedProcedure.query(async ({ ctx }) => {
    const rows = await db
      .select({
        promptKey: promptVersions.promptKey,
        totalVersions: sql<number>`count(*)::int`,
        activeVersion: sql<number | null>`max(case when ${promptVersions.isActive} then ${promptVersions.version} end)`,
        lastModified: sql<string>`max(${promptVersions.createdAt})`,
      })
      .from(promptVersions)
      .where(eq(promptVersions.userId, ctx.user.id))
      .groupBy(promptVersions.promptKey)
      .orderBy(sql`max(${promptVersions.createdAt}) desc`);

    return { keys: rows, total: rows.length };
  }),
});
