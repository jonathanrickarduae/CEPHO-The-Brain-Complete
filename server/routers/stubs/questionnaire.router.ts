/**
 * Questionnaire Router (Stub)
 * Placeholder until the questionnaire service is implemented.
 */
import { z } from "zod";
import { publicProcedure, router } from "../../_core/trpc";

export const questionnaireRouter = router({
  saveResponse: publicProcedure
    .input(
      z.object({
        questionId: z.string().optional(),
        questionType: z.string().optional(),
        scaleValue: z.number().optional(),
        booleanValue: z.boolean().optional(),
        section: z.string().optional(),
        responses: z.record(z.string(), z.unknown()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      // TODO: Wire to questionnaire persistence service
      return {
        success: true,
        savedAt: new Date().toISOString(),
      };
    }),
});
