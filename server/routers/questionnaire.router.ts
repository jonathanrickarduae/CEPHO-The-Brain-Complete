/**
 * Questionnaire Router — Real Implementation
 *
 * Saves questionnaire responses to the database and
 * retrieves completion status for the Digital Twin profile.
 */
import { z } from "zod";
import { eq, and, count } from "drizzle-orm";
import { protectedProcedure, router } from "../_core/trpc";
import { db } from "../db";
import { questionnaireResponses } from "../../drizzle/schema";

export const questionnaireRouter = router({
  /**
   * Save a single questionnaire response.
   * Uses upsert so re-answering a question updates the existing record.
   */
  saveResponse: protectedProcedure
    .input(
      z.object({
        questionId: z.string().min(1).max(10),
        questionType: z.enum(["scale", "boolean", "text"]),
        scaleValue: z.number().min(1).max(10).optional(),
        booleanValue: z.boolean().optional(),
        section: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.id;

      const [saved] = await db
        .insert(questionnaireResponses)
        .values({
          userId,
          questionId: input.questionId,
          questionType: input.questionType,
          scaleValue: input.scaleValue ?? null,
          booleanValue: input.booleanValue ?? null,
          section: input.section ?? null,
        })
        .onConflictDoUpdate({
          target: [questionnaireResponses.userId, questionnaireResponses.questionId],
          set: {
            scaleValue: input.scaleValue ?? null,
            booleanValue: input.booleanValue ?? null,
            section: input.section ?? null,
            updatedAt: new Date(),
          },
        })
        .returning();

      return {
        success: true,
        id: saved.id,
        questionId: saved.questionId,
        savedAt: saved.updatedAt.toISOString(),
      };
    }),

  /**
   * Get all responses for the current user.
   */
  getResponses: protectedProcedure.query(async ({ ctx }) => {
    const rows = await db
      .select()
      .from(questionnaireResponses)
      .where(eq(questionnaireResponses.userId, ctx.user.id));

    return rows.map((r) => ({
      id: r.id,
      questionId: r.questionId,
      questionType: r.questionType,
      scaleValue: r.scaleValue,
      booleanValue: r.booleanValue,
      section: r.section,
      answeredAt: r.updatedAt.toISOString(),
    }));
  }),

  /**
   * Get completion percentage for the questionnaire.
   * Assumes 100 total questions (can be adjusted).
   */
  getCompletion: protectedProcedure.query(async ({ ctx }) => {
    const TOTAL_QUESTIONS = 100;

    const [result] = await db
      .select({ count: count() })
      .from(questionnaireResponses)
      .where(eq(questionnaireResponses.userId, ctx.user.id));

    const answered = Number(result?.count ?? 0);
    const percentage = Math.min(
      100,
      Math.round((answered / TOTAL_QUESTIONS) * 100)
    );

    return {
      answered,
      total: TOTAL_QUESTIONS,
      percentage,
      isComplete: percentage >= 100,
    };
  }),
});
