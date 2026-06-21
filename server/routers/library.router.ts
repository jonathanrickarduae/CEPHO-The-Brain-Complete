import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";

export const libraryRouter = router({
  list: protectedProcedure.input(z.object({ type: z.string().optional(), search: z.string().optional() }).optional()).query(() => ({ documents: [], total: 0 })),
  exportExpertChat: protectedProcedure.input(z.object({ chatId: z.number().optional(), title: z.string(), content: z.string() })).mutation(() => ({ success: true, id: 0 })),
});
