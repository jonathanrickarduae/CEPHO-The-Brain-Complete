import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";

export const smeTeamRouter = router({
  list: protectedProcedure.query(() => []),
  create: protectedProcedure.input(z.object({ name: z.string(), description: z.string().optional() })).mutation(() => ({ id: 0, name: "" })),
  addMember: protectedProcedure.input(z.object({ teamId: z.number(), smeId: z.string() })).mutation(() => ({ success: true })),
  delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(() => ({ success: true })),
});
