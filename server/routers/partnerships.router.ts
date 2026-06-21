/**
 * Partnerships Router — Real Implementation
 *
 * Manages the partnership pipeline: prospect, engaged, active, paused, inactive, churned.
 */
import { z } from "zod";
import { desc, eq } from "drizzle-orm";
import { protectedProcedure, router } from "../_core/trpc";
import { db } from "../db";
import { partnerships } from "../../drizzle/schema";

const PARTNERSHIP_STATUSES = [
  "prospect",
  "engaged",
  "active",
  "paused",
  "inactive",
  "churned",
] as const;

const PARTNERSHIP_TYPES = [
  "strategic",
  "technology",
  "distribution",
  "investment",
  "reseller",
  "referral",
  "joint_venture",
] as const;

export const partnershipsRouter = router({
  /**
   * List all partnerships, optionally filtered by status.
   */
  list: protectedProcedure
    .input(
      z
        .object({
          status: z.enum(PARTNERSHIP_STATUSES).optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const rows = await db
        .select()
        .from(partnerships)
        .orderBy(desc(partnerships.createdAt));

      const filtered = input?.status
        ? rows.filter(r => r.status === input.status)
        : rows;

      return filtered.map(p => ({
        id: p.id,
        name: p.name,
        type: p.type,
        status: p.status,
        priority: p.priority,
        contactName: p.contactName,
        contactEmail: p.contactEmail,
        value: p.value,
        notes: p.notes,
        nextAction: p.nextAction,
        nextActionDate: p.nextActionDate?.toISOString() ?? null,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      }));
    }),

  /**
   * Get a single partnership by ID.
   */
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const rows = await db
        .select()
        .from(partnerships)
        .where(eq(partnerships.id, input.id))
        .limit(1);

      if (rows.length === 0) return null;
      const p = rows[0];

      return {
        id: p.id,
        name: p.name,
        type: p.type,
        status: p.status,
        priority: p.priority,
        contactName: p.contactName,
        contactEmail: p.contactEmail,
        value: p.value,
        notes: p.notes,
        nextAction: p.nextAction,
        nextActionDate: p.nextActionDate?.toISOString() ?? null,
        createdAt: p.createdAt.toISOString(),
      };
    }),

  /**
   * Create a new partnership.
   */
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(200),
        type: z.enum(PARTNERSHIP_TYPES),
        status: z.enum(PARTNERSHIP_STATUSES).default("prospect"),
        priority: z.string().optional(),
        contactName: z.string().optional(),
        contactEmail: z.string().email().optional(),
        value: z.string().optional(),
        notes: z.string().optional(),
        nextAction: z.string().optional(),
        nextActionDate: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const [partnership] = await db
        .insert(partnerships)
        .values({
          name: input.name,
          type: input.type,
          status: input.status,
          priority: input.priority ?? "medium",
          contactName: input.contactName ?? null,
          contactEmail: input.contactEmail ?? null,
          value: input.value ?? null,
          notes: input.notes ?? null,
          nextAction: input.nextAction ?? null,
          nextActionDate: input.nextActionDate
            ? new Date(input.nextActionDate)
            : null,
        })
        .returning();

      return {
        id: partnership.id,
        name: partnership.name,
        status: partnership.status,
        createdAt: partnership.createdAt.toISOString(),
      };
    }),

  /**
   * Update a partnership.
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).max(200).optional(),
        type: z.enum(PARTNERSHIP_TYPES).optional(),
        status: z.enum(PARTNERSHIP_STATUSES).optional(),
        priority: z.string().optional(),
        contactName: z.string().optional(),
        contactEmail: z.string().email().optional(),
        value: z.string().optional(),
        notes: z.string().optional(),
        nextAction: z.string().optional(),
        nextActionDate: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, nextActionDate, ...rest } = input;

      await db
        .update(partnerships)
        .set({
          ...rest,
          nextActionDate: nextActionDate ? new Date(nextActionDate) : undefined,
          updatedAt: new Date(),
        })
        .where(eq(partnerships.id, id));

      return { success: true };
    }),

  /**
   * Delete a partnership.
   */
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.delete(partnerships).where(eq(partnerships.id, input.id));

      return { success: true };
    }),

  /**
   * Get pipeline summary stats.
   */
  getSummary: protectedProcedure.query(async () => {
    const rows = await db.select().from(partnerships);

    const byStatus = PARTNERSHIP_STATUSES.reduce(
      (acc, status) => {
        acc[status] = rows.filter(r => r.status === status).length;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      total: rows.length,
      byStatus,
      active: byStatus.active ?? 0,
      prospects: byStatus.prospect ?? 0,
    };
  }),
});
