// Blueprints Router - BP-001 to BP-016+ Blueprint Library & Execution
import { router, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import { getDb } from '../db';
import { blueprintLibrary, blueprintExecutions, blueprintParameters, blueprintOutputs } from '../../drizzle/schema';
import { eq, and } from 'drizzle-orm';

export const blueprintsRouter = router({
  // List all blueprints
  listBlueprints: protectedProcedure
    .input(z.object({
      category: z.string().optional(),
      search: z.string().optional(),
    }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const blueprints = await db.select().from(blueprintLibrary);
      
      let filtered = blueprints;
      
      if (input.category) {
        filtered = filtered.filter(bp => bp.category === input.category);
      }
      
      if (input.search) {
        const searchLower = input.search.toLowerCase();
        filtered = filtered.filter(bp => 
          bp.name?.toLowerCase().includes(searchLower) ||
          bp.description?.toLowerCase().includes(searchLower)
        );
      }
      
      return {
        blueprints: filtered,
        total: filtered.length,
        categories: [...new Set(blueprints.map(bp => bp.category))],
      };
    }),

  // Get blueprint details
  getBlueprint: protectedProcedure
    .input(z.object({ 
      blueprintId: z.string(),
    }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const blueprint = await db.select()
        .from(blueprintLibrary)
        .where(eq(blueprintLibrary.id, input.blueprintId))
        .limit(1);
      
      if (!blueprint || blueprint.length === 0) {
        throw new Error('Blueprint not found');
      }
      
      // Get execution history
      const executions = await db.select()
        .from(blueprintExecutions)
        .where(eq(blueprintExecutions.blueprintId, input.blueprintId))
        .orderBy(blueprintExecutions.createdAt);
      
      return {
        blueprint: blueprint[0],
        executions,
        totalExecutions: executions.length,
      };
    }),

  // Execute blueprint
  executeBlueprint: protectedProcedure
    .input(z.object({
      blueprintId: z.string(),
      projectId: z.string(),
      parameters: z.record(z.any()).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      // Create execution record
      const execution = await db.insert(blueprintExecutions).values({
        blueprintId: input.blueprintId,
        projectId: input.projectId,
        executedBy: ctx.user.id,
        status: 'running',
        startedAt: new Date(),
      }).returning();
      
      const executionId = execution[0].id;
      
      // Store parameters
      if (input.parameters) {
        const paramRecords = Object.entries(input.parameters).map(([key, value]) => ({
          executionId,
          parameterKey: key,
          parameterValue: value,
          parameterType: typeof value,
        }));
        
        await db.insert(blueprintParameters).values(paramRecords);
      }
      
      // Execute blueprint logic (simplified - would be more complex in production)
      try {
        // Get blueprint details
        const blueprint = await db.select()
          .from(blueprintLibrary)
          .where(eq(blueprintLibrary.id, input.blueprintId))
          .limit(1);
        
        if (!blueprint || blueprint.length === 0) {
          throw new Error('Blueprint not found');
        }
        
        // Generate outputs based on blueprint type
        const outputs = await generateBlueprintOutputs(
          blueprint[0],
          input.parameters || {},
          executionId
        );
        
        // Store outputs
        if (outputs.length > 0) {
          await db.insert(blueprintOutputs).values(outputs);
        }
        
        // Update execution status
        await db.update(blueprintExecutions)
          .set({
            status: 'completed',
            completedAt: new Date(),
            result: { success: true, outputCount: outputs.length },
          })
          .where(eq(blueprintExecutions.id, executionId));
        
        return {
          executionId,
          status: 'completed',
          outputs,
        };
      } catch (error) {
        // Update execution with error
        await db.update(blueprintExecutions)
          .set({
            status: 'failed',
            completedAt: new Date(),
            result: { success: false, error: error.message },
          })
          .where(eq(blueprintExecutions.id, executionId));
        
        throw error;
      }
    }),

  // Get blueprint outputs
  getBlueprintOutputs: protectedProcedure
    .input(z.object({
      executionId: z.string(),
    }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const outputs = await db.select()
        .from(blueprintOutputs)
        .where(eq(blueprintOutputs.executionId, input.executionId));
      
      return {
        outputs,
        total: outputs.length,
      };
    }),
});

// Helper function to generate blueprint outputs
async function generateBlueprintOutputs(
  blueprint: any,
  parameters: Record<string, any>,
  executionId: string
): Promise<any[]> {
  const outputs = [];
  
  // Example output generation based on blueprint type
  if (blueprint.category === 'business_plan') {
    outputs.push({
      executionId,
      outputType: 'document',
      outputFormat: 'md',
      outputName: `Business_Plan_${Date.now()}.md`,
      outputPath: `/blueprints/${executionId}/business_plan.md`,
      outputUrl: `https://storage.example.com/blueprints/${executionId}/business_plan.md`,
      outputSize: 0,
      metadata: { generated: true, template: blueprint.name },
    });
  }
  
  if (blueprint.category === 'financial_model') {
    outputs.push({
      executionId,
      outputType: 'model',
      outputFormat: 'xlsx',
      outputName: `Financial_Model_${Date.now()}.xlsx`,
      outputPath: `/blueprints/${executionId}/financial_model.xlsx`,
      outputUrl: `https://storage.example.com/blueprints/${executionId}/financial_model.xlsx`,
      outputSize: 0,
      metadata: { generated: true, template: blueprint.name },
    });
  }
  
  return outputs;
}
