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

import { router, protectedProcedure } from "../../_core/trpc";
import { z } from "zod";
import { getRawClient } from "../../db";

export const projectGenesisRouter = router({
  /**
   * Phase 1: Initiation
   * Create a new Project Genesis project and initialize Phase 1
   */
  initiate: protectedProcedure
    .input(z.object({
      name: z.string(),
      industry: z.string().optional(),
      description: z.string(),
      targetMarket: z.string().optional(),
      uniqueValue: z.string().optional(),
      type: z.enum(["investment", "partnership", "acquisition", "joint_venture", "other"]).optional(),
      counterparty: z.string().optional(),
      dealValue: z.number().optional(),
      currency: z.string().default("USD"),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getRawClient();
      if (!db) throw new Error('Database connection not available');
      
      // Ensure user exists in database first
      const userCheck = await db`
        SELECT id FROM users WHERE id = ${ctx.user.id}
      `;
      
      if (userCheck.length === 0) {
        // Create user if doesn't exist (for auth bypass scenarios)
        const openId = `bypass-${ctx.user.id}`;
        const userEmail = ctx.user.email || 'test@example.com';
        const userName = ctx.user.name || 'Test User';
        await db`
          INSERT INTO users (id, "openId", email, name, role, "themePreference", "createdAt", "updatedAt", "lastSignedIn")
          VALUES (${ctx.user.id}, ${openId}, ${userEmail}, ${userName}, 'user', 'dark', NOW(), NOW(), NOW())
          ON CONFLICT (id) DO NOTHING
        `;
      }
      
      // Create project with PostgreSQL RETURNING clause
      const projectResult = await db`
        INSERT INTO project_genesis 
        ("userId", name, type, industry, stage, status, counterparty, "dealValue", currency, description, "targetMarket", "uniqueValue", "currentPhase", "completionPercentage", "createdAt", "updatedAt") 
        VALUES (${ctx.user.id}, ${input.name}, ${input.type || 'other'}, ${input.industry || ''}, 'discovery', 'active', ${input.counterparty || null}, ${input.dealValue || null}, ${input.currency}, ${input.description}, ${input.targetMarket || ''}, ${input.uniqueValue || ''}, 1, 0, NOW(), NOW())
        RETURNING id
      `;
      
      const projectId = projectResult[0].id;
      
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
        await db`
          INSERT INTO project_genesis_phases 
          ("projectId", "phaseNumber", "phaseName", status, "createdAt", "updatedAt") 
          VALUES (${projectId}, ${phase.number}, ${phase.name}, ${phase.status}, NOW(), NOW())
        `;
      }
      
      return {
        success: true,
        id: projectId,
        name: input.name,
        industry: input.industry || '',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        completionPercentage: 0,
        currentPhase: 1,
        message: `Project "${input.name}" initiated successfully`,
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
      const db = await getRawClient();
      if (!db) throw new Error('Database connection not available');
      
      // Get project
      const projectResult = await db`
        SELECT * FROM project_genesis WHERE id = ${input.projectId} AND "userId" = ${ctx.user.id}
      `;
      
      if (!projectResult || projectResult.length === 0) {
        throw new Error("Project not found");
      }
      
      const project = projectResult[0];
      
      // Get all phases
      const phases = await db`
        SELECT * FROM project_genesis_phases WHERE "projectId" = ${input.projectId} ORDER BY "phaseNumber"
      `;
      
      // Get milestones
      const milestones = await db`
        SELECT * FROM project_genesis_milestones WHERE "projectId" = ${input.projectId} ORDER BY "dueDate"
      `;
      
      // Get deliverables
      const deliverables = await db`
        SELECT * FROM project_genesis_deliverables WHERE "projectId" = ${input.projectId} ORDER BY "createdAt" DESC
      `;
      
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
      const db = await getRawClient();
      if (!db) throw new Error('Database connection not available');
      
      try {
        const projects = await db`
          SELECT * FROM project_genesis
          WHERE "userId" = ${ctx.user.id}
          ORDER BY "createdAt" DESC
        `;
        
        return projects;
      } catch (error) {
        console.error('[projectGenesis.listProjects] Error:', error);
        // Return empty array if table doesn't exist yet
        return [];
      }
    }),

  /**
   * Update phase status
   */
  updatePhase: protectedProcedure
    .input(z.object({
      projectId: z.number(),
      phaseNumber: z.number(),
      status: z.enum(['not_started', 'in_progress', 'completed', 'blocked']),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getRawClient();
      if (!db) throw new Error('Database connection not available');
      
      // Update phase status
      await db`
        UPDATE project_genesis_phases 
        SET status = ${input.status}, 
            "startedAt" = CASE WHEN ${input.status} = 'in_progress' AND "startedAt" IS NULL THEN NOW() ELSE "startedAt" END,
            "completedAt" = CASE WHEN ${input.status} = 'completed' THEN NOW() ELSE "completedAt" END,
            "updatedAt" = NOW()
        WHERE "projectId" = ${input.projectId} AND "phaseNumber" = ${input.phaseNumber}
      `;
      
      // Update project completion percentage
      const phases = await db`
        SELECT COUNT(*) as total, 
               SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
        FROM project_genesis_phases
        WHERE "projectId" = ${input.projectId}
      `;
      
      const completionPercentage = Math.round((phases[0].completed / phases[0].total) * 100);
      
      await db`
        UPDATE project_genesis
        SET "completionPercentage" = ${completionPercentage},
            "currentPhase" = ${input.phaseNumber},
            "updatedAt" = NOW()
        WHERE id = ${input.projectId}
      `;
      
      return {
        success: true,
        completionPercentage,
      };
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
      const db = await getRawClient();
      if (!db) throw new Error('Database connection not available');
      
      // Mark current phase as completed
      await db`
        UPDATE project_genesis_phases 
        SET status = 'completed', "completedAt" = NOW(), "updatedAt" = NOW()
        WHERE "projectId" = ${input.projectId} AND "phaseNumber" = ${input.currentPhaseNumber}
      `;
      
      // Start next phase
      const nextPhaseNumber = input.currentPhaseNumber + 1;
      
      if (nextPhaseNumber <= 6) {
        await db`
          UPDATE project_genesis_phases 
          SET status = 'in_progress', "startedAt" = NOW(), "updatedAt" = NOW()
          WHERE "projectId" = ${input.projectId} AND "phaseNumber" = ${nextPhaseNumber}
        `;
        
        // Update project current phase
        await db`
          UPDATE project_genesis
          SET "currentPhase" = ${nextPhaseNumber}, "updatedAt" = NOW()
          WHERE id = ${input.projectId}
        `;
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
      const db = await getRawClient();
      if (!db) throw new Error('Database connection not available');
      
      const result = await db`
        INSERT INTO project_genesis_milestones 
        ("phaseId", "projectId", "milestoneName", description, "dueDate", status, "createdAt", "updatedAt") 
        VALUES (${input.phaseId}, ${input.projectId}, ${input.milestoneName}, ${input.description || null}, ${input.dueDate || null}, 'pending', NOW(), NOW())
        RETURNING id
      `;
      
      return {
        success: true,
        milestoneId: result[0].id,
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
      const db = await getRawClient();
      if (!db) throw new Error('Database connection not available');
      
      await db`
        UPDATE project_genesis_milestones 
        SET status = 'completed', "completedAt" = NOW(), "completedBy" = ${ctx.user.id}, "updatedAt" = NOW()
        WHERE id = ${input.milestoneId}
      `;
      
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
      const db = await getRawClient();
      if (!db) throw new Error('Database connection not available');
      
      const result = await db`
        INSERT INTO project_genesis_deliverables 
        ("phaseId", "projectId", "deliverableName", "deliverableType", description, "fileUrl", status, "createdBy", "createdAt", "updatedAt") 
        VALUES (${input.phaseId}, ${input.projectId}, ${input.deliverableName}, ${input.deliverableType}, ${input.description || null}, ${input.fileUrl || null}, 'draft', ${ctx.user.id}, NOW(), NOW())
        RETURNING id
      `;
      
      return {
        success: true,
        deliverableId: result[0].id,
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
      const db = await getRawClient();
      if (!db) throw new Error('Database connection not available');
      
      await db`
        UPDATE project_genesis_deliverables 
        SET status = ${input.status}, "reviewNotes" = ${input.reviewNotes || null}, "reviewedBy" = ${ctx.user.id}, "updatedAt" = NOW()
        WHERE id = ${input.deliverableId}
      `;
      
      return {
        success: true,
      };
    }),
});
