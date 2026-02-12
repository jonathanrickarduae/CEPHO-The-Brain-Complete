/**
 * Blueprint Library Router
 * Manage and execute blueprints (BP-001 to BP-016+)
 */

import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";

export const blueprintRouter = router({
  /**
   * Get all blueprints
   */
  list: protectedProcedure
    .input(z.object({
      category: z.string().optional(),
      status: z.enum(["draft", "active", "deprecated"]).optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      
      let query = `SELECT * FROM blueprint_library WHERE 1=1`;
      const params: any[] = [];
      
      if (input.category) {
        query += ` AND category = ?`;
        params.push(input.category);
      }
      
      if (input.status) {
        query += ` AND status = ?`;
        params.push(input.status);
      }
      
      query += ` ORDER BY blueprintCode`;
      
      const result: any = await db.execute(query, params);
      
      return result.rows || [];
    }),

  /**
   * Get blueprint by code (e.g., BP-001)
   */
  getByCode: protectedProcedure
    .input(z.object({
      blueprintCode: z.string(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      
      const result: any = await db.execute(
        `SELECT * FROM blueprint_library WHERE blueprintCode = ?`,
        [input.blueprintCode]
      );
      
      if (!result.rows || result.rows.length === 0) {
        throw new Error(`Blueprint ${input.blueprintCode} not found`);
      }
      
      return result.rows[0];
    }),

  /**
   * Create new blueprint
   */
  create: protectedProcedure
    .input(z.object({
      blueprintCode: z.string(),
      title: z.string(),
      category: z.string(),
      description: z.string(),
      objectives: z.array(z.string()),
      phases: z.array(z.any()),
      deliverables: z.array(z.any()),
      resources: z.any().optional(),
      estimatedDuration: z.number().optional(),
      complexity: z.enum(["low", "medium", "high"]).default("medium"),
      tags: z.array(z.string()).optional(),
      fileUrl: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      
      const result = await db.execute(
        `INSERT INTO blueprint_library 
         (blueprintCode, title, category, description, objectives, phases, deliverables, resources, estimatedDuration, complexity, tags, fileUrl, status, createdBy, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, NOW(), NOW())`,
        [
          input.blueprintCode,
          input.title,
          input.category,
          input.description,
          JSON.stringify(input.objectives),
          JSON.stringify(input.phases),
          JSON.stringify(input.deliverables),
          input.resources ? JSON.stringify(input.resources) : null,
          input.estimatedDuration,
          input.complexity,
          input.tags ? JSON.stringify(input.tags) : null,
          input.fileUrl,
          ctx.user.id,
        ]
      );
      
      return {
        success: true,
        blueprintId: (result as any).insertId,
        blueprintCode: input.blueprintCode,
      };
    }),

  /**
   * Start blueprint execution
   */
  execute: protectedProcedure
    .input(z.object({
      blueprintId: z.number(),
      executionName: z.string(),
      projectId: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      
      // Get blueprint
      const blueprintResult: any = await db.execute(
        `SELECT * FROM blueprint_library WHERE id = ?`,
        [input.blueprintId]
      );
      
      if (!blueprintResult.rows || blueprintResult.rows.length === 0) {
        throw new Error("Blueprint not found");
      }
      
      const blueprint = blueprintResult.rows[0];
      
      // Create execution
      const result = await db.execute(
        `INSERT INTO blueprint_executions 
         (blueprintId, projectId, userId, executionName, status, currentPhase, progress, startedAt, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, 'in_progress', 1, 0, NOW(), NOW(), NOW())`,
        [input.blueprintId, input.projectId, ctx.user.id, input.executionName]
      );
      
      return {
        success: true,
        executionId: (result as any).insertId,
        blueprint: {
          code: blueprint.blueprintCode,
          title: blueprint.title,
          estimatedDuration: blueprint.estimatedDuration,
        },
        message: `Started executing ${blueprint.blueprintCode}: ${blueprint.title}`,
      };
    }),

  /**
   * Get execution status
   */
  getExecution: protectedProcedure
    .input(z.object({
      executionId: z.number(),
    }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      
      const result: any = await db.execute(
        `SELECT be.*, bl.blueprintCode, bl.title, bl.phases, bl.deliverables
         FROM blueprint_executions be
         JOIN blueprint_library bl ON be.blueprintId = bl.id
         WHERE be.id = ? AND be.userId = ?`,
        [input.executionId, ctx.user.id]
      );
      
      if (!result.rows || result.rows.length === 0) {
        throw new Error("Execution not found");
      }
      
      return result.rows[0];
    }),

  /**
   * List user's blueprint executions
   */
  listExecutions: protectedProcedure
    .input(z.object({
      status: z.enum(["planning", "in_progress", "completed", "paused", "cancelled"]).optional(),
    }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      
      let query = `
        SELECT be.*, bl.blueprintCode, bl.title
        FROM blueprint_executions be
        JOIN blueprint_library bl ON be.blueprintId = bl.id
        WHERE be.userId = ?
      `;
      
      const params: any[] = [ctx.user.id];
      
      if (input.status) {
        query += ` AND be.status = ?`;
        params.push(input.status);
      }
      
      query += ` ORDER BY be.createdAt DESC`;
      
      const result: any = await db.execute(query, params);
      
      return result.rows || [];
    }),

  /**
   * Update execution progress
   */
  updateProgress: protectedProcedure
    .input(z.object({
      executionId: z.number(),
      currentPhase: z.number().optional(),
      progress: z.number().min(0).max(100).optional(),
      status: z.enum(["planning", "in_progress", "completed", "paused", "cancelled"]).optional(),
      phaseData: z.any().optional(),
      deliverableData: z.any().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      
      const updates: string[] = [];
      const params: any[] = [];
      
      if (input.currentPhase !== undefined) {
        updates.push("currentPhase = ?");
        params.push(input.currentPhase);
      }
      
      if (input.progress !== undefined) {
        updates.push("progress = ?");
        params.push(input.progress);
      }
      
      if (input.status) {
        updates.push("status = ?");
        params.push(input.status);
        
        if (input.status === "completed") {
          updates.push("completedAt = NOW()");
        }
      }
      
      if (input.phaseData) {
        updates.push("phaseData = ?");
        params.push(JSON.stringify(input.phaseData));
      }
      
      if (input.deliverableData) {
        updates.push("deliverableData = ?");
        params.push(JSON.stringify(input.deliverableData));
      }
      
      if (input.notes) {
        updates.push("notes = ?");
        params.push(input.notes);
      }
      
      updates.push("updatedAt = NOW()");
      
      params.push(input.executionId);
      params.push(ctx.user.id);
      
      await db.execute(
        `UPDATE blueprint_executions SET ${updates.join(", ")} WHERE id = ? AND userId = ?`,
        params
      );
      
      return {
        success: true,
      };
    }),
});
