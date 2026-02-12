/**
 * Project Genesis Router
 * 6-Phase Venture Development Workflow
 * 
 * Phase 1: Initiation
 * Phase 2: Deep Dive
 * Phase 3: Business Plan
 * Phase 4: Expert Review
 * Phase 5: Quality Gate
 * Phase 6: Execution
 */

import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";

export const projectGenesisRouter = router({
  /**
   * Phase 1: Initiation
   * Create a new Project Genesis project and initialize Phase 1
   */
  initiate: protectedProcedure
    .input(z.object({
      name: z.string(),
      type: z.enum(["investment", "partnership", "acquisition", "joint_venture", "other"]),
      description: z.string(),
      counterparty: z.string().optional(),
      dealValue: z.number().optional(),
      currency: z.string().default("USD"),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      
      // Create project
      const projectResult = await db.execute(
        `INSERT INTO project_genesis 
         (userId, name, type, stage, status, counterparty, dealValue, currency, description, createdAt, updatedAt) 
         VALUES (?, ?, ?, 'discovery', 'active', ?, ?, ?, ?, NOW(), NOW())`,
        [ctx.user.id, input.name, input.type, input.counterparty, input.dealValue, input.currency, input.description]
      );
      
      const projectId = (projectResult as any).insertId;
      
      // Initialize all 6 phases
      const phases = [
        { number: 1, name: "Initiation", status: "in_progress" },
        { number: 2, name: "Deep Dive", status: "not_started" },
        { number: 3, name: "Business Plan", status: "not_started" },
        { number: 4, name: "Expert Review", status: "not_started" },
        { number: 5, name: "Quality Gate", status: "not_started" },
        { number: 6, name: "Execution", status: "not_started" },
      ];
      
      for (const phase of phases) {
        await db.execute(
          `INSERT INTO project_genesis_phases 
           (projectId, phaseNumber, phaseName, status, createdAt, updatedAt) 
           VALUES (?, ?, ?, ?, NOW(), NOW())`,
          [projectId, phase.number, phase.name, phase.status]
        );
      }
      
      return {
        success: true,
        projectId,
        message: `Project "${input.name}" initiated successfully`,
        currentPhase: 1,
        nextSteps: [
          "Complete intake assessment",
          "Define project scope",
          "Assign initial team",
          "Set key milestones",
        ],
      };
    }),

  /**
   * Get project details with all phases
   */
  getProject: protectedProcedure
    .input(z.object({
      projectId: z.number(),
    }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      
      // Get project
      const projectResult: any = await db.execute(
        `SELECT * FROM project_genesis WHERE id = ? AND userId = ?`,
        [input.projectId, ctx.user.id]
      );
      
      if (!projectResult.rows || projectResult.rows.length === 0) {
        throw new Error("Project not found");
      }
      
      const project = projectResult.rows[0];
      
      // Get all phases
      const phasesResult: any = await db.execute(
        `SELECT * FROM project_genesis_phases WHERE projectId = ? ORDER BY phaseNumber`,
        [input.projectId]
      );
      
      const phases = phasesResult.rows || [];
      
      // Get milestones
      const milestonesResult: any = await db.execute(
        `SELECT * FROM project_genesis_milestones WHERE projectId = ? ORDER BY dueDate`,
        [input.projectId]
      );
      
      const milestones = milestonesResult.rows || [];
      
      // Get deliverables
      const deliverablesResult: any = await db.execute(
        `SELECT * FROM project_genesis_deliverables WHERE projectId = ? ORDER BY createdAt DESC`,
        [input.projectId]
      );
      
      const deliverables = deliverablesResult.rows || [];
      
      return {
        project,
        phases,
        milestones,
        deliverables,
      };
    }),

  /**
   * Get all projects for current user
   */
  listProjects: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      
      try {
        const result: any = await db.execute(
          `SELECT pg.* 
           FROM project_genesis pg
           WHERE pg.userId = ?
           ORDER BY pg.createdAt DESC`,
          [ctx.user.id]
        );
        
        return result.rows || [];
      } catch (error) {
        console.error('[projectGenesis.listProjects] Error:', error);
        // Return empty array if table doesn't exist yet
        return [];
      }
    }),

  /**
   * Advance to next phase
   */
  advancePhase: protectedProcedure
    .input(z.object({
      projectId: z.number(),
      currentPhaseNumber: z.number(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      
      // Mark current phase as completed
      await db.execute(
        `UPDATE project_genesis_phases 
         SET status = 'completed', completedAt = NOW(), updatedAt = NOW()
         WHERE projectId = ? AND phaseNumber = ?`,
        [input.projectId, input.currentPhaseNumber]
      );
      
      // Start next phase
      const nextPhaseNumber = input.currentPhaseNumber + 1;
      
      if (nextPhaseNumber <= 6) {
        await db.execute(
          `UPDATE project_genesis_phases 
           SET status = 'in_progress', startedAt = NOW(), updatedAt = NOW()
           WHERE projectId = ? AND phaseNumber = ?`,
          [input.projectId, nextPhaseNumber]
        );
      }
      
      return {
        success: true,
        currentPhase: nextPhaseNumber,
        message: `Advanced to Phase ${nextPhaseNumber}`,
      };
    }),

  /**
   * Add milestone to phase
   */
  addMilestone: protectedProcedure
    .input(z.object({
      projectId: z.number(),
      phaseId: z.number(),
      milestoneName: z.string(),
      description: z.string().optional(),
      dueDate: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      
      const result = await db.execute(
        `INSERT INTO project_genesis_milestones 
         (phaseId, projectId, milestoneName, description, dueDate, status, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, ?, 'pending', NOW(), NOW())`,
        [input.phaseId, input.projectId, input.milestoneName, input.description, input.dueDate]
      );
      
      return {
        success: true,
        milestoneId: (result as any).insertId,
      };
    }),

  /**
   * Complete milestone
   */
  completeMilestone: protectedProcedure
    .input(z.object({
      milestoneId: z.number(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      
      await db.execute(
        `UPDATE project_genesis_milestones 
         SET status = 'completed', completedAt = NOW(), completedBy = ?, updatedAt = NOW()
         WHERE id = ?`,
        [ctx.user.id, input.milestoneId]
      );
      
      return {
        success: true,
      };
    }),

  /**
   * Add deliverable to phase
   */
  addDeliverable: protectedProcedure
    .input(z.object({
      projectId: z.number(),
      phaseId: z.number(),
      deliverableName: z.string(),
      deliverableType: z.string(),
      description: z.string().optional(),
      fileUrl: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      
      const result = await db.execute(
        `INSERT INTO project_genesis_deliverables 
         (phaseId, projectId, deliverableName, deliverableType, description, fileUrl, status, createdBy, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, ?, ?, 'draft', ?, NOW(), NOW())`,
        [input.phaseId, input.projectId, input.deliverableName, input.deliverableType, input.description, input.fileUrl, ctx.user.id]
      );
      
      return {
        success: true,
        deliverableId: (result as any).insertId,
      };
    }),

  /**
   * Update deliverable status
   */
  updateDeliverableStatus: protectedProcedure
    .input(z.object({
      deliverableId: z.number(),
      status: z.enum(["draft", "review", "approved", "rejected"]),
      reviewNotes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      
      await db.execute(
        `UPDATE project_genesis_deliverables 
         SET status = ?, reviewNotes = ?, reviewedBy = ?, updatedAt = NOW()
         WHERE id = ?`,
        [input.status, input.reviewNotes, ctx.user.id, input.deliverableId]
      );
      
      return {
        success: true,
      };
    }),
});
