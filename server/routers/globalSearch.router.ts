/**
 * Global Search Router — P4-9
 *
 * Full-text search across tasks, projects, briefings, and voice notes.
 * Uses PostgreSQL ILIKE for case-insensitive substring matching.
 */
import { z } from "zod";
import { ilike, or, and, eq, desc } from "drizzle-orm";
import { protectedProcedure, router } from "../_core/trpc";
import { db } from "../db";
import { tasks, projects, briefings, voiceNotes } from "../../drizzle/schema";

export type SearchResultType = "task" | "project" | "briefing" | "voice_note";

export interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  excerpt: string;
  path: string;
  createdAt: string;
}

export const globalSearchRouter = router({
  /**
   * Search across tasks, projects, briefings, and voice notes.
   */
  search: protectedProcedure
    .input(
      z.object({
        query: z.string().min(1).max(200),
        types: z
          .array(z.enum(["task", "project", "briefing", "voice_note"]))
          .optional(),
        limit: z.number().min(1).max(50).default(20),
      })
    )
    .query(async ({ input, ctx }) => {
      const { query, types, limit } = input;
      const userId = ctx.user.id;
      const q = `%${query}%`;
      const results: SearchResult[] = [];
      const perType = Math.ceil(limit / (types?.length ?? 4));

      // ── Tasks ──────────────────────────────────────────────────────────────
      if (!types || types.includes("task")) {
        const rows = await db
          .select({
            id: tasks.id,
            title: tasks.title,
            description: tasks.description,
            status: tasks.status,
            createdAt: tasks.createdAt,
          })
          .from(tasks)
          .where(
            and(
              eq(tasks.userId, userId),
              or(ilike(tasks.title, q), ilike(tasks.description, q))
            )
          )
          .orderBy(desc(tasks.createdAt))
          .limit(perType);

        for (const row of rows) {
          results.push({
            id: `task-${row.id}`,
            type: "task",
            title: row.title,
            excerpt: row.description
              ? row.description.slice(0, 120)
              : `Status: ${row.status}`,
            path: `/tasks`,
            createdAt: row.createdAt.toISOString(),
          });
        }
      }

      // ── Projects ───────────────────────────────────────────────────────────
      if (!types || types.includes("project")) {
        const rows = await db
          .select({
            id: projects.id,
            name: projects.name,
            description: projects.description,
            status: projects.status,
            userId: projects.userId,
            createdAt: projects.createdAt,
          })
          .from(projects)
          .where(or(ilike(projects.name, q), ilike(projects.description, q)))
          .orderBy(desc(projects.createdAt))
          .limit(perType);

        for (const row of rows) {
          if (row.userId !== userId) continue;
          results.push({
            id: `project-${row.id}`,
            type: "project",
            title: row.name,
            excerpt: row.description
              ? row.description.slice(0, 120)
              : `Status: ${row.status}`,
            path: `/projects`,
            createdAt: row.createdAt.toISOString(),
          });
        }
      }

      // ── Briefings ──────────────────────────────────────────────────────────
      if (!types || types.includes("briefing")) {
        const rows = await db
          .select({
            id: briefings.id,
            title: briefings.title,
            userId: briefings.userId,
            createdAt: briefings.createdAt,
          })
          .from(briefings)
          .where(and(eq(briefings.userId, userId), ilike(briefings.title, q)))
          .orderBy(desc(briefings.createdAt))
          .limit(perType);

        for (const row of rows) {
          results.push({
            id: `briefing-${row.id}`,
            type: "briefing",
            title: row.title,
            excerpt: `Daily briefing — ${new Date(row.createdAt).toLocaleDateString()}`,
            path: `/daily-brief`,
            createdAt: row.createdAt.toISOString(),
          });
        }
      }

      // ── Voice Notes ────────────────────────────────────────────────────────
      if (!types || types.includes("voice_note")) {
        const rows = await db
          .select({
            id: voiceNotes.id,
            content: voiceNotes.content,
            userId: voiceNotes.userId,
            createdAt: voiceNotes.createdAt,
          })
          .from(voiceNotes)
          .where(
            and(eq(voiceNotes.userId, userId), ilike(voiceNotes.content, q))
          )
          .orderBy(desc(voiceNotes.createdAt))
          .limit(perType);

        for (const row of rows) {
          results.push({
            id: `voice_note-${row.id}`,
            type: "voice_note",
            title:
              row.content.slice(0, 60) + (row.content.length > 60 ? "…" : ""),
            excerpt: row.content ? row.content.slice(0, 120) : "",
            path: `/voice-notes`,
            createdAt: row.createdAt.toISOString(),
          });
        }
      }

      // Sort by createdAt descending and cap at limit
      results.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      return {
        results: results.slice(0, limit),
        total: results.length,
        query,
      };
    }),
});
