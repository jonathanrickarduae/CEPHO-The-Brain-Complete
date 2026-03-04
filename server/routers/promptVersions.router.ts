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
 *
 * Prompt keys follow the pattern: "agent:{agentId}" or "board:{memberId}"
 * or "system:{featureName}" for system-level prompts.
 *
 * Storage: In-memory per user (production would use a DB table).
 * A future migration will add a `prompt_versions` table.
 */
import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";

interface PromptVersion {
  id: string;
  userId: number;
  promptKey: string;
  version: number;
  content: string;
  label: string;
  isActive: boolean;
  changeNote: string;
  createdAt: string;
  createdBy: string;
}

// In-memory store: userId → promptKey → versions[]
const versionStore = new Map<number, Map<string, PromptVersion[]>>();

function getUserStore(userId: number): Map<string, PromptVersion[]> {
  if (!versionStore.has(userId)) {
    versionStore.set(userId, new Map());
  }
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return versionStore.get(userId)!;
}

function getPromptVersions(userId: number, promptKey: string): PromptVersion[] {
  const store = getUserStore(userId);
  if (!store.has(promptKey)) {
    store.set(promptKey, []);
  }
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return store.get(promptKey)!;
}

function getNextVersion(versions: PromptVersion[]): number {
  if (versions.length === 0) return 1;
  return Math.max(...versions.map(v => v.version)) + 1;
}

export const promptVersionsRouter = router({
  /**
   * Save a new version of a prompt
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
        label: z.string().max(100).optional(),
        changeNote: z.string().max(500).optional(),
        setActive: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const versions = getPromptVersions(ctx.user.id, input.promptKey);
      const nextVersion = getNextVersion(versions);

      // Deactivate all existing versions if this is being set as active
      if (input.setActive) {
        versions.forEach(v => (v.isActive = false));
      }

      const newVersion: PromptVersion = {
        id: `pv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        userId: ctx.user.id,
        promptKey: input.promptKey,
        version: nextVersion,
        content: input.content,
        label: input.label ?? `v${nextVersion}`,
        isActive: input.setActive,
        changeNote: input.changeNote ?? "",
        createdAt: new Date().toISOString(),
        createdBy: ctx.user.name ?? ctx.user.email ?? "unknown",
      };

      versions.push(newVersion);

      return {
        success: true,
        version: newVersion,
        totalVersions: versions.length,
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
      const versions = getPromptVersions(ctx.user.id, input.promptKey);
      const sorted = [...versions]
        .sort((a, b) => b.version - a.version)
        .slice(0, input.limit);

      return {
        versions: sorted.map(v => ({
          id: v.id,
          version: v.version,
          label: v.label,
          isActive: v.isActive,
          changeNote: v.changeNote,
          createdAt: v.createdAt,
          createdBy: v.createdBy,
          contentLength: v.content.length,
          contentPreview: v.content.slice(0, 200),
        })),
        total: versions.length,
        activeVersion: versions.find(v => v.isActive)?.version ?? null,
      };
    }),

  /**
   * Get a specific version by ID
   */
  getVersion: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const store = getUserStore(ctx.user.id);
      for (const versions of Array.from(store.values())) {
        const found = versions.find(v => v.id === input.id);
        if (found) {
          return { version: found };
        }
      }
      throw new Error("Version not found");
    }),

  /**
   * Roll back to a previous version
   * Creates a new version entry with the old content (preserves history)
   */
  rollback: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        changeNote: z.string().max(500).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const store = getUserStore(ctx.user.id);
      let targetVersion: PromptVersion | undefined;
      let promptKey: string | undefined;

      for (const [key, versions] of Array.from(store.entries())) {
        const found = versions.find(v => v.id === input.id);
        if (found) {
          targetVersion = found;
          promptKey = key;
          break;
        }
      }

      if (!targetVersion || !promptKey) {
        throw new Error("Version not found");
      }

      const versions = getPromptVersions(ctx.user.id, promptKey);
      const nextVersion = getNextVersion(versions);

      // Deactivate all existing versions
      versions.forEach(v => (v.isActive = false));

      const rollbackVersion: PromptVersion = {
        id: `pv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        userId: ctx.user.id,
        promptKey,
        version: nextVersion,
        content: targetVersion.content,
        label: `Rollback to v${targetVersion.version}`,
        isActive: true,
        changeNote:
          input.changeNote ??
          `Rolled back to version ${targetVersion.version} (${targetVersion.label})`,
        createdAt: new Date().toISOString(),
        createdBy: ctx.user.name ?? ctx.user.email ?? "unknown",
      };

      versions.push(rollbackVersion);

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
        idA: z.string(),
        idB: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const store = getUserStore(ctx.user.id);
      let versionA: PromptVersion | undefined;
      let versionB: PromptVersion | undefined;

      for (const versions of Array.from(store.values())) {
        for (const v of versions) {
          if (v.id === input.idA) versionA = v;
          if (v.id === input.idB) versionB = v;
        }
      }

      if (!versionA || !versionB) {
        throw new Error("One or both versions not found");
      }

      const wordsA = versionA.content.split(/\s+/).length;
      const wordsB = versionB.content.split(/\s+/).length;
      const charsA = versionA.content.length;
      const charsB = versionB.content.length;

      return {
        versionA: {
          id: versionA.id,
          version: versionA.version,
          label: versionA.label,
          createdAt: versionA.createdAt,
          wordCount: wordsA,
          charCount: charsA,
          isActive: versionA.isActive,
        },
        versionB: {
          id: versionB.id,
          version: versionB.version,
          label: versionB.label,
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
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const store = getUserStore(ctx.user.id);

      for (const [key, versions] of Array.from(store.entries())) {
        const idx = versions.findIndex(v => v.id === input.id);
        if (idx !== -1) {
          if (versions[idx].isActive) {
            throw new Error(
              "Cannot delete the active version. Activate another version first."
            );
          }
          versions.splice(idx, 1);
          store.set(key, versions);
          return { success: true };
        }
      }

      throw new Error("Version not found");
    }),

  /**
   * List all prompt keys that have versions saved
   */
  listPromptKeys: protectedProcedure.query(async ({ ctx }) => {
    const store = getUserStore(ctx.user.id);
    const keys = Array.from(store.entries())
      .filter(([, versions]) => versions.length > 0)
      .map(([key, versions]) => ({
        promptKey: key,
        totalVersions: versions.length,
        activeVersion: versions.find(v => v.isActive)?.version ?? null,
        lastModified: versions
          .map(v => v.createdAt)
          .sort()
          .reverse()[0],
      }));

    return { keys, total: keys.length };
  }),
});
