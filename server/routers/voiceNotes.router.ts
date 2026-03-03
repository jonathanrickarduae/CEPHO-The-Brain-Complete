import { getModelForTask } from "../utils/modelRouter";
/**
 * Voice Notes Router — Real Implementation
 *
 * Manages voice notes: create, list, delete, convert to task.
 * Supports AI transcription and task extraction.
 */
import { z } from "zod";
import { desc, eq, and } from "drizzle-orm";
import OpenAI from "openai";
import { protectedProcedure, router } from "../_core/trpc";
import { db } from "../db";
import { voiceNotes, tasks } from "../../drizzle/schema";

function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");
  return new OpenAI({ apiKey });
}

export const voiceNotesRouter = router({
  /**
   * List voice notes for the current user.
   */
  list: protectedProcedure
    .input(
      z.object({
        category: z.string().optional(),
        limit: z.number().min(1).max(100).default(50),
      })
    )
    .query(async ({ input, ctx }) => {
      const rows = await db
        .select()
        .from(voiceNotes)
        .where(eq(voiceNotes.userId, ctx.user.id))
        .orderBy(desc(voiceNotes.createdAt))
        .limit(input.limit);

      const filtered = input.category
        ? rows.filter(r => r.category === input.category)
        : rows;

      return {
        notes: filtered.map(n => ({
          id: n.id,
          content: n.content,
          category: n.category,
          audioUrl: n.audioUrl,
          duration: n.duration,
          projectId: n.projectId,
          projectName: n.projectName,
          isActionItem: n.isActionItem,
          isProcessed: n.isProcessed,
          extractedTasks: n.extractedTasks,
          createdAt: n.createdAt.toISOString(),
        })),
      };
    }),

  /**
   * Create a new voice note (text or transcribed audio).
   */
  create: protectedProcedure
    .input(
      z.object({
        content: z.string().min(1),
        category: z.string().default("general"),
        audioUrl: z.string().optional(),
        duration: z.number().optional(),
        projectId: z.number().optional(),
        projectName: z.string().optional(),
        isActionItem: z.boolean().default(false),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Use OpenAI to extract tasks from the note content
      let extractedTasks: string[] = [];
      try {
        const openai = getOpenAIClient();
        const completion = await openai.chat.completions.create({
          model: getModelForTask("summarise"),
          messages: [
            {
              role: "user",
              content: `Extract any action items or tasks from this voice note. Return as JSON array of strings. If none, return empty array.

Voice note: "${input.content}"

Return only: ["task 1", "task 2", ...]`,
            },
          ],
          max_tokens: 200,
          temperature: 0.3,
        });
        const content = completion.choices[0]?.message?.content ?? "[]";
        extractedTasks = JSON.parse(
          content.replace(/```json\n?|\n?```/g, "").trim()
        );
        if (!Array.isArray(extractedTasks)) extractedTasks = [];
      } catch {
        extractedTasks = [];
      }

      const [note] = await db
        .insert(voiceNotes)
        .values({
          userId: ctx.user.id,
          content: input.content,
          category: input.category,
          audioUrl: input.audioUrl ?? null,
          duration: input.duration ?? null,
          projectId: input.projectId ?? null,
          projectName: input.projectName ?? null,
          isActionItem: input.isActionItem,
          isProcessed: extractedTasks.length > 0,
          extractedTasks: extractedTasks.length > 0 ? extractedTasks : null,
        })
        .returning();

      return {
        id: note.id,
        content: note.content,
        extractedTasks,
        createdAt: note.createdAt.toISOString(),
      };
    }),

  /**
   * Delete a voice note.
   */
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      await db
        .delete(voiceNotes)
        .where(
          and(eq(voiceNotes.id, input.id), eq(voiceNotes.userId, ctx.user.id))
        );

      return { success: true };
    }),

  /**
   * Convert a voice note's extracted tasks to real tasks in the DB.
   */
  convertToTask: protectedProcedure
    .input(
      z.object({
        noteId: z.number(),
        taskTitle: z.string().min(1),
        priority: z.string().default("medium"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const [task] = await db
        .insert(tasks)
        .values({
          userId: ctx.user.id,
          title: input.taskTitle,
          status: "pending",
          priority: input.priority,
        })
        .returning();

      // Mark note as processed
      await db
        .update(voiceNotes)
        .set({ isProcessed: true })
        .where(
          and(
            eq(voiceNotes.id, input.noteId),
            eq(voiceNotes.userId, ctx.user.id)
          )
        );

      return {
        taskId: task.id,
        taskTitle: task.title,
        createdAt: task.createdAt.toISOString(),
      };
    }),
});
