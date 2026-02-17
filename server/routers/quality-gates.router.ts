/**
 * Quality Gates Router
 * QMS 4-Layer Quality Management System
 * Gates: G1-G6
 */

import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";

export const quality-gates.router = router({
  /**
   * Get all quality gate criteria for a specific gate
   */
  getCriteria: protectedProcedure
    .input(z.object({
      gateNumber: z.number().min(1).max(6),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      
      const result: any = await db.execute(
        `SELECT * FROM quality_gate_criteria WHERE gateNumber = ? ORDER BY weight DESC`,
        [input.gateNumber]
      );
      
      return result.rows || [];
    }),

  /**
   * Run quality gate evaluation for a project
   */
  runEvaluation: protectedProcedure
    .input(z.object({
      projectId: z.number(),
      gateNumber: z.number().min(1).max(6),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      
      // Get all criteria for this gate
      const criteriaResult: any = await db.execute(
        `SELECT * FROM quality_gate_criteria WHERE gateNumber = ?`,
        [input.gateNumber]
      );
      
      const criteria = criteriaResult.rows || [];
      
      if (criteria.length === 0) {
        throw new Error(`No criteria defined for Gate ${input.gateNumber}`);
      }
      
      // For now, return a placeholder evaluation
      // In production, this would run actual validation logic
      const results = criteria.map((criterion: any) => ({
        criteriaId: criterion.id,
        criteriaName: criterion.criteriaName,
        score: 75, // Placeholder score
        passed: 75 >= criterion.passingScore,
        evaluationNotes: "Automated evaluation pending implementation",
      }));
      
      // Save results
      for (const result of results) {
        await db.execute(
          `INSERT INTO quality_gate_results 
           (projectId, gateNumber, criteriaId, score, passed, evaluatedBy, evaluationNotes, createdAt, updatedAt) 
           VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [input.projectId, input.gateNumber, result.criteriaId, result.score, result.passed, ctx.user.id, result.evaluationNotes]
        );
      }
      
      // Calculate overall gate score
      const totalScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
      const overallPassed = results.every(r => r.passed);
      
      return {
        success: true,
        gateNumber: input.gateNumber,
        overallScore: Math.round(totalScore),
        passed: overallPassed,
        results,
        message: overallPassed 
          ? `Gate ${input.gateNumber} passed with score ${Math.round(totalScore)}/100`
          : `Gate ${input.gateNumber} failed. Review criteria and remediate.`,
      };
    }),

  /**
   * Get evaluation results for a project
   */
  getResults: protectedProcedure
    .input(z.object({
      projectId: z.number(),
      gateNumber: z.number().min(1).max(6).optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      
      let query = `
        SELECT qgr.*, qgc.criteriaName, qgc.description, qgc.weight, qgc.passingScore
        FROM quality_gate_results qgr
        JOIN quality_gate_criteria qgc ON qgr.criteriaId = qgc.id
        WHERE qgr.projectId = ?
      `;
      
      const params: any[] = [input.projectId];
      
      if (input.gateNumber) {
        query += ` AND qgr.gateNumber = ?`;
        params.push(input.gateNumber);
      }
      
      query += ` ORDER BY qgr.gateNumber, qgr.createdAt DESC`;
      
      const result: any = await db.execute(query, params);
      
      return result.rows || [];
    }),

  /**
   * Get quality gate summary for a project
   */
  getSummary: protectedProcedure
    .input(z.object({
      projectId: z.number(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      
      const result: any = await db.execute(
        `SELECT 
          gateNumber,
          COUNT(*) as totalCriteria,
          SUM(CASE WHEN passed = 1 THEN 1 ELSE 0 END) as passedCriteria,
          AVG(score) as averageScore,
          MAX(createdAt) as lastEvaluated
         FROM quality_gate_results
         WHERE projectId = ?
         GROUP BY gateNumber
         ORDER BY gateNumber`,
        [input.projectId]
      );
      
      const gates = result.rows || [];
      
      return gates.map((gate: any) => ({
        gateNumber: gate.gateNumber,
        totalCriteria: gate.totalCriteria,
        passedCriteria: gate.passedCriteria,
        averageScore: Math.round(gate.averageScore),
        passed: gate.passedCriteria === gate.totalCriteria,
        lastEvaluated: gate.lastEvaluated,
      }));
    }),

  /**
   * Create or update quality gate criteria (admin only)
   */
  upsertCriteria: protectedProcedure
    .input(z.object({
      gateNumber: z.number().min(1).max(6),
      gateName: z.string(),
      criteriaName: z.string(),
      description: z.string(),
      weight: z.number().default(1.0),
      passingScore: z.number().default(70),
      evaluationType: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      
      // Check if criteria already exists
      const existingResult: any = await db.execute(
        `SELECT id FROM quality_gate_criteria WHERE gateNumber = ? AND criteriaName = ?`,
        [input.gateNumber, input.criteriaName]
      );
      
      if (existingResult.rows && existingResult.rows.length > 0) {
        // Update existing
        await db.execute(
          `UPDATE quality_gate_criteria 
           SET gateName = ?, description = ?, weight = ?, passingScore = ?, evaluationType = ?, updatedAt = NOW()
           WHERE id = ?`,
          [input.gateName, input.description, input.weight, input.passingScore, input.evaluationType, existingResult.rows[0].id]
        );
        
        return {
          success: true,
          criteriaId: existingResult.rows[0].id,
          action: "updated",
        };
      } else {
        // Insert new
        const result = await db.execute(
          `INSERT INTO quality_gate_criteria 
           (gateNumber, gateName, criteriaName, description, weight, passingScore, evaluationType, createdAt, updatedAt) 
           VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [input.gateNumber, input.gateName, input.criteriaName, input.description, input.weight, input.passingScore, input.evaluationType]
        );
        
        return {
          success: true,
          criteriaId: (result as any).insertId,
          action: "created",
        };
      }
    }),
});
