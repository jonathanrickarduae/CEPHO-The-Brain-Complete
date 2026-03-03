/**
 * Human Approval Gates Router
 *
 * Provides mandatory, non-bypassable checkpoints within autonomous workflows
 * where the system must halt and receive explicit user confirmation before
 * proceeding with irreversible, high-cost, or strategically significant actions.
 *
 * Phase 3 deliverable — spec: docs/specs/HumanApprovalGates.md
 */
import { z } from "zod";
import { eq, desc, and } from "drizzle-orm";
import { protectedProcedure, router } from "../_core/trpc";
import { db } from "../db";
import { approvalRequests } from "../../drizzle/schema";

export const humanApprovalGatesRouter = router({
  /**
   * Create a new approval request (called by the Orchestrator before a gated action).
   */
  create: protectedProcedure
    .input(
      z.object({
        workflowId: z.string(),
        gateName: z.string(),
        requestSummary: z.string(),
        outcomeDescription: z.string(),
        contextDocs: z.array(z.string()).optional().default([]),
        severity: z.enum(["low", "medium", "high", "critical"]).default("high"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [request] = await db
        .insert(approvalRequests)
        .values({
          userId: ctx.user.id,
          workflowId: input.workflowId,
          gateName: input.gateName,
          requestSummary: input.requestSummary,
          outcomeDescription: input.outcomeDescription,
          contextDocs: JSON.stringify(input.contextDocs),
          severity: input.severity,
          status: "pending",
        })
        .returning();
      return request;
    }),

  /**
   * List all pending approval requests for the current user.
   */
  listPending: protectedProcedure.query(async ({ ctx }) => {
    return db
      .select()
      .from(approvalRequests)
      .where(
        and(
          eq(approvalRequests.userId, ctx.user.id),
          eq(approvalRequests.status, "pending")
        )
      )
      .orderBy(desc(approvalRequests.createdAt));
  }),

  /**
   * List all approval requests (all statuses) for the current user.
   */
  listAll: protectedProcedure.query(async ({ ctx }) => {
    return db
      .select()
      .from(approvalRequests)
      .where(eq(approvalRequests.userId, ctx.user.id))
      .orderBy(desc(approvalRequests.createdAt));
  }),

  /**
   * Approve a pending request — resumes the workflow.
   */
  approve: protectedProcedure
    .input(z.object({ approvalId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const [updated] = await db
        .update(approvalRequests)
        .set({ status: "approved", resolvedAt: new Date() })
        .where(
          and(
            eq(approvalRequests.id, input.approvalId),
            eq(approvalRequests.userId, ctx.user.id),
            eq(approvalRequests.status, "pending")
          )
        )
        .returning();
      if (!updated)
        throw new Error("Approval request not found or already resolved.");
      return updated;
    }),

  /**
   * Reject a pending request — terminates the workflow and flags for review.
   */
  reject: protectedProcedure
    .input(
      z.object({
        approvalId: z.number(),
        rejectionReason: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [updated] = await db
        .update(approvalRequests)
        .set({
          status: "rejected",
          resolvedAt: new Date(),
          rejectionReason: input.rejectionReason ?? null,
        })
        .where(
          and(
            eq(approvalRequests.id, input.approvalId),
            eq(approvalRequests.userId, ctx.user.id),
            eq(approvalRequests.status, "pending")
          )
        )
        .returning();
      if (!updated)
        throw new Error("Approval request not found or already resolved.");
      return updated;
    }),

  /**
   * Get a single approval request by ID.
   */
  getById: protectedProcedure
    .input(z.object({ approvalId: z.number() }))
    .query(async ({ ctx, input }) => {
      const [request] = await db
        .select()
        .from(approvalRequests)
        .where(
          and(
            eq(approvalRequests.id, input.approvalId),
            eq(approvalRequests.userId, ctx.user.id)
          )
        );
      if (!request) throw new Error("Approval request not found.");
      return request;
    }),
});
