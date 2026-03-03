/**
 * Questionnaire Router — Real Implementation
 *
 * Saves questionnaire responses to the database and
 * retrieves completion status for the Digital Twin profile.
 * Also provides syncToProfile to materialise questionnaire answers
 * into the digital_twin_profile table for AI injection.
 */
import { z } from "zod";
import { eq, count } from "drizzle-orm";
import { protectedProcedure, router } from "../_core/trpc";
import { db } from "../db";
import {
  questionnaireResponses,
  digitalTwinProfile,
} from "../../drizzle/schema";

// Question ID → digital_twin_profile column mapping.
// Scale questions (1-10) map to integer columns.
// Boolean questions map to text columns (build_vs_buy, organic_vs_ma, location_preference).
const SCALE_QUESTION_MAP: Record<string, string> = {
  // Business Operations (Section 6)
  A52: "measurementDriven",
  A53: "processStandardization",
  A58: "ambiguityTolerance",
  // Innovation & Technology (Section 7)
  B61: "techAdoptionSpeed",
  B62: "aiBeliefLevel",
  B63: "dataVsIntuition",
  // Market & Competition (Section 8)
  C71: "nicheVsMass",
  C72: "firstMoverVsFollower",
  // Personal Productivity (Section 9)
  D81: "structurePreference",
  D82: "interruptionTolerance",
  D83: "batchingPreference",
  // Strategic Thinking (Section 10)
  E91: "scenarioPlanningLevel",
  E92: "pivotComfort",
  E93: "trendLeadership",
  E94: "portfolioDiversification",
};

const BOOL_TEXT_QUESTION_MAP: Record<
  string,
  { column: string; trueVal: string; falseVal: string }
> = {
  B64: { column: "buildVsBuy", trueVal: "build", falseVal: "buy" },
  C73: { column: "organicVsMA", trueVal: "organic", falseVal: "m&a" },
  D84: { column: "locationPreference", trueVal: "office", falseVal: "remote" },
};

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
          target: [
            questionnaireResponses.userId,
            questionnaireResponses.questionId,
          ],
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

    return rows.map(r => ({
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

  /**
   * Sync questionnaire responses into the digital_twin_profile table.
   * Called after the user completes the questionnaire (or a section of it).
   * Maps question IDs to profile columns and upserts the profile row.
   */
  syncToProfile: protectedProcedure.mutation(async ({ ctx }) => {
    const TOTAL_QUESTIONS = 100;
    const userId = ctx.user.id;

    // Fetch all responses for this user
    const rows = await db
      .select()
      .from(questionnaireResponses)
      .where(eq(questionnaireResponses.userId, userId));

    // Build profile update object from responses
    const profileUpdate: Record<string, number | string | null> = {};

    for (const row of rows) {
      const scaleCol = SCALE_QUESTION_MAP[row.questionId];
      if (scaleCol && row.scaleValue !== null) {
        profileUpdate[scaleCol] = row.scaleValue;
        continue;
      }
      const boolMap = BOOL_TEXT_QUESTION_MAP[row.questionId];
      if (boolMap && row.booleanValue !== null) {
        profileUpdate[boolMap.column] = row.booleanValue
          ? boolMap.trueVal
          : boolMap.falseVal;
      }
    }

    const answered = rows.length;
    const percentage = Math.min(
      100,
      Math.round((answered / TOTAL_QUESTIONS) * 100)
    );
    profileUpdate["questionnaireCompletion"] = percentage;
    profileUpdate["lastCalculated"] = new Date() as unknown as string;

    // Upsert the digital_twin_profile row
    const existing = await db
      .select({ id: digitalTwinProfile.id })
      .from(digitalTwinProfile)
      .where(eq(digitalTwinProfile.userId, userId))
      .limit(1);

    if (existing.length === 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await db.insert(digitalTwinProfile).values({
        userId,
        ...profileUpdate,
      } as any);
    } else {
      await db
        .update(digitalTwinProfile)
        .set({ ...profileUpdate, updatedAt: new Date() })
        .where(eq(digitalTwinProfile.userId, userId));
    }

    return {
      success: true,
      answered,
      percentage,
      syncedFields: Object.keys(profileUpdate).filter(
        k => k !== "questionnaireCompletion" && k !== "lastCalculated"
      ),
    };
  }),
});
