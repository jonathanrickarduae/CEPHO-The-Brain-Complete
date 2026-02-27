/**
 * Chat Router (Stub)
 * Placeholder until the AI chat service is fully implemented.
 */
import { z } from "zod";
import { publicProcedure, router } from "../../_core/trpc";

export const chatRouter = router({
  send: publicProcedure
    .input(
      z.object({
        message: z.string().min(1),
        context: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      // TODO: Wire to AI service
      return {
        id: crypto.randomUUID(),
        message: `[Chat service not yet implemented] You said: ${input.message}`,
        content: `[Chat service not yet implemented] You said: ${input.message}`,
        role: "assistant" as const,
        timestamp: new Date().toISOString(),
      };
    }),
});
