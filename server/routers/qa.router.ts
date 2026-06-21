import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";

export const qaRouter = router({
  getTasksWithStatus: protectedProcedure.query(() => []),
  submitCoSReview: protectedProcedure.input(z.object({ taskId: z.number(), status: z.string(), notes: z.string().optional() })).mutation(() => ({ success: true })),
  submitSecondaryReview: protectedProcedure.input(z.object({ taskId: z.number(), approved: z.boolean(), notes: z.string().optional() })).mutation(() => ({ success: true })),
});
