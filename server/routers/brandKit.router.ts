import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { db } from "../db";
import { brandKit } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export const brandKitRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const rows = await db
      .select()
      .from(brandKit)
      .where(eq(brandKit.userId, ctx.user.id));
    return rows;
  }),

  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const [row] = await db
        .select()
        .from(brandKit)
        .where(eq(brandKit.id, input.id));
      if (!row || row.userId !== ctx.user.id) return null;
      return row ?? null;
    }),

  getDefault: protectedProcedure.query(async ({ ctx }) => {
    const [row] = await db
      .select()
      .from(brandKit)
      .where(eq(brandKit.userId, ctx.user.id));
    return row ?? null;
  }),

  create: protectedProcedure
    .input(
      z.object({
        companyName: z.string().min(1),
        isDefault: z.boolean().optional().default(false),
        logoUrl: z.string().optional(),
        logoLightUrl: z.string().optional(),
        primaryColor: z.string().optional(),
        secondaryColor: z.string().optional(),
        accentColor: z.string().optional(),
        fontFamily: z.string().optional(),
        tagline: z.string().optional(),
        description: z.string().optional(),
        website: z.string().optional(),
        socialLinks: z.record(z.string(), z.string()).optional(),
        templates: z.record(z.string(), z.unknown()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // If setting as default, unset all others first
      if (input.isDefault) {
        await db
          .update(brandKit)
          .set({ isDefault: false })
          .where(eq(brandKit.userId, ctx.user.id));
      }
      const [row] = await db
        .insert(brandKit)
        .values({ ...input, userId: ctx.user.id })
        .returning();
      return row;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        companyName: z.string().min(1).optional(),
        isDefault: z.boolean().optional(),
        logoUrl: z.string().optional(),
        logoLightUrl: z.string().optional(),
        primaryColor: z.string().optional(),
        secondaryColor: z.string().optional(),
        accentColor: z.string().optional(),
        fontFamily: z.string().optional(),
        tagline: z.string().optional(),
        description: z.string().optional(),
        website: z.string().optional(),
        socialLinks: z.record(z.string(), z.string()).optional(),
        templates: z.record(z.string(), z.unknown()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      // If setting as default, unset all others first
      if (data.isDefault) {
        await db
          .update(brandKit)
          .set({ isDefault: false })
          .where(eq(brandKit.userId, ctx.user.id));
      }
      const [row] = await db
        .update(brandKit)
        .set(data)
        .where(eq(brandKit.id, id))
        .returning();
      const owned = row?.userId === ctx.user.id ? row : null;
      return owned;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await db.delete(brandKit).where(eq(brandKit.id, input.id));
      return { success: true };
    }),
});
