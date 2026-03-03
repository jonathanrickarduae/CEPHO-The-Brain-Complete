/**
 * Expert Consultation Router
 *
 * Tracks expert consultation sessions for analytics and history.
 */
import { z } from "zod";
import { desc, eq, count, sql } from "drizzle-orm";
import { protectedProcedure, router } from "../_core/trpc";
import { db } from "../db";
import { expertPerformance } from "../../drizzle/schema";

// Static expert name lookup
const EXPERT_NAMES: Record<string, string> = {
  pe_partner: "PE Partner",
  cfo_expert: "CFO Expert",
  strategy_consultant: "Strategy Consultant",
  ma_lawyer: "M&A Lawyer",
  tech_cto: "Tech CTO",
  marketing_cmo: "CMO Expert",
  hr_chro: "CHRO Expert",
  operations_coo: "COO Expert",
  data_scientist: "Data Scientist",
  product_manager: "Product Manager",
  vc_investor: "VC Investor",
};

export const expertConsultationRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        expertId: z.string(),
        rating: z.number().min(1).max(10).optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const score = input.rating ? input.rating * 10 : 80;

      await db
        .insert(expertPerformance)
        .values({
          userId: ctx.user.id,
          expertId: input.expertId,
          score,
          projectsCompleted: 1,
          positiveFeedback: input.rating && input.rating >= 7 ? 1 : 0,
          negativeFeedback: input.rating && input.rating < 5 ? 1 : 0,
          lastUsed: new Date(),
          notes: input.notes ?? null,
          status: "active",
        })
        .onConflictDoUpdate({
          target: [expertPerformance.userId, expertPerformance.expertId],
          set: {
            projectsCompleted: sql`${expertPerformance.projectsCompleted} + 1`,
            lastUsed: new Date(),
            updatedAt: new Date(),
          },
        });

      return {
        success: true,
        expertId: input.expertId,
        createdAt: new Date().toISOString(),
      };
    }),

  list: protectedProcedure
    .input(z.object({ limit: z.number().default(20) }))
    .query(async ({ ctx }) => {
      const rows = await db
        .select()
        .from(expertPerformance)
        .where(eq(expertPerformance.userId, ctx.user.id))
        .orderBy(desc(expertPerformance.lastUsed))
        .limit(20);

      return rows.map(r => ({
        id: r.id,
        expertId: r.expertId,
        expertName: EXPERT_NAMES[r.expertId] ?? r.expertId,
        score: r.score,
        projectsCompleted: r.projectsCompleted,
        positiveFeedback: r.positiveFeedback,
        lastUsed: r.lastUsed?.toISOString() ?? null,
        status: r.status,
        updatedAt:
          r.updatedAt?.toISOString() ??
          r.lastUsed?.toISOString() ??
          new Date().toISOString(),
      }));
    }),

  counts: protectedProcedure.query(async ({ ctx }) => {
    const [result] = await db
      .select({ total: count() })
      .from(expertPerformance)
      .where(eq(expertPerformance.userId, ctx.user.id));
    return { total: Number(result?.total ?? 0) };
  }),

  mostUsed: protectedProcedure
    .input(z.object({ limit: z.number().default(5) }))
    .query(async ({ input, ctx }) => {
      const rows = await db
        .select()
        .from(expertPerformance)
        .where(eq(expertPerformance.userId, ctx.user.id))
        .orderBy(desc(expertPerformance.projectsCompleted))
        .limit(input.limit);

      return rows.map(r => ({
        expertId: r.expertId,
        expertName: EXPERT_NAMES[r.expertId] ?? r.expertId,
        totalConsultations: r.projectsCompleted,
      }));
    }),

  topRated: protectedProcedure
    .input(z.object({ limit: z.number().default(5) }))
    .query(async ({ input, ctx }) => {
      const rows = await db
        .select()
        .from(expertPerformance)
        .where(eq(expertPerformance.userId, ctx.user.id))
        .orderBy(desc(expertPerformance.score))
        .limit(input.limit);

      return rows.map(r => ({
        expertId: r.expertId,
        expertName: EXPERT_NAMES[r.expertId] ?? r.expertId,
        averageRating: (r.score ?? 80) / 10,
      }));
    }),

  usageStats: protectedProcedure.query(async ({ ctx }) => {
    const rows = await db
      .select()
      .from(expertPerformance)
      .where(eq(expertPerformance.userId, ctx.user.id));

    const total = rows.reduce((s, r) => s + (r.projectsCompleted ?? 0), 0);
    const avgScore =
      rows.length > 0
        ? rows.reduce((s, r) => s + (r.score ?? 80), 0) / rows.length
        : 80;

    return {
      totalConsultations: total,
      uniqueExperts: rows.length,
      averageRating: Math.round((avgScore / 10) * 10) / 10,
    };
  }),
});
