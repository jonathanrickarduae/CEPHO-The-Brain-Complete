/**
 * Audit Log Router
 * Records and retrieves all significant platform actions for security and compliance.
 * Phase 5 — Operational Excellence
 */
import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { db } from "../db";
import { auditLogs } from "../../drizzle/schema";
import { eq, desc, and, gte } from "drizzle-orm";
import { logger } from "../utils/logger";

export const auditLogRouter = router({
  /**
   * Get audit log entries for the current user
   */
  getMyLogs: protectedProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(200).default(50),
        severity: z.enum(["info", "warning", "critical"]).optional(),
        sinceDate: z.string().optional(), // ISO date string
      })
    )
    .query(async ({ ctx, input }) => {
      const conditions = [eq(auditLogs.userId, ctx.user.id)];

      if (input.severity) {
        conditions.push(eq(auditLogs.severity, input.severity));
      }

      if (input.sinceDate) {
        conditions.push(gte(auditLogs.createdAt, new Date(input.sinceDate)));
      }

      const logs = await db
        .select()
        .from(auditLogs)
        .where(and(...conditions))
        .orderBy(desc(auditLogs.createdAt))
        .limit(input.limit);

      return { logs };
    }),

  /**
   * Get all audit logs (admin only)
   */
  getAllLogs: protectedProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(500).default(100),
        severity: z.enum(["info", "warning", "critical"]).optional(),
        sinceDate: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Only admin users can access all logs
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized: Admin access required.");
      }

      const conditions: ReturnType<typeof eq>[] = [];

      if (input.severity) {
        conditions.push(eq(auditLogs.severity, input.severity));
      }

      if (input.sinceDate) {
        conditions.push(gte(auditLogs.createdAt, new Date(input.sinceDate)));
      }

      const logs = await db
        .select()
        .from(auditLogs)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(auditLogs.createdAt))
        .limit(input.limit);

      return { logs };
    }),
});

/**
 * Helper function to write an audit log entry.
 * Call this from any router to record significant actions.
 */
export async function writeAuditLog(entry: {
  userId?: number;
  action: string;
  resourceType?: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
  severity?: "info" | "warning" | "critical";
}): Promise<void> {
  try {
    await db.insert(auditLogs).values({
      userId: entry.userId,
      action: entry.action,
      resourceType: entry.resourceType,
      resourceId: entry.resourceId,
      ipAddress: entry.ipAddress,
      userAgent: entry.userAgent,
      metadata: entry.metadata,
      severity: entry.severity ?? "info",
    });
  } catch (err) {
    // Audit log failures should never crash the main flow
    logger.error("[AuditLog] Failed to write audit log", err);
  }
}
