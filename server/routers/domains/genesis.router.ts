/**
 * Genesis Router
 * 
 * Auto-extracted from monolithic routers.ts
 * 
 * @module routers/domains/genesis
 */

import { router } from "../_core/trpc";
import { z } from "zod";

export const genesisRouter = router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return getProjectGenesisRecords(ctx.user.id);
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const projects = await getProjectGenesisRecords(ctx.user.id);
        return projects.find((p: any) => p.id === input.id) || null;
      }),

    getProjectData: protectedProcedure
      .input(z.object({ projectId: z.string() }))
      .query(async ({ ctx, input }) => {
        // Fetch project data for presentation blueprint
        const projects = await getProjectGenesisRecords(ctx.user.id);
        const project = projects.find((p: any) => p.id.toString() === input.projectId || p.name.toLowerCase().includes(input.projectId.toLowerCase()));
        
        if (!project) return null;
        
        // Return structured data for presentation
        return {
          id: project.id,
          name: project.name,
          type: project.type,
          description: project.description,
          counterparty: project.counterparty,
          dealValue: project.dealValue,
          stage: project.stage,
          status: project.status,
          // Add default presentation data structure
          presentationData: {
            companyName: project.name,
            tagline: project.description || `${project.type} opportunity`,
            problem: `Market opportunity in ${project.type} sector`,
            solution: `Strategic ${project.type} with ${project.counterparty || 'target company'}`,
            market: {
              tam: project.dealValue ? `$${(project.dealValue * 10).toLocaleString()}` : 'TBD',
              sam: project.dealValue ? `$${(project.dealValue * 3).toLocaleString()}` : 'TBD',
              som: project.dealValue ? `$${project.dealValue.toLocaleString()}` : 'TBD',
              growth: '15% CAGR'
            },
            traction: {
              stage: project.stage,
              status: project.status,
              probability: project.probability
            },
            ask: {
              amount: project.dealValue ? `$${project.dealValue.toLocaleString()}` : 'TBD',
              stage: project.stage,
              useOfFunds: ['Strategic Investment', 'Growth Capital', 'Market Expansion']
            }
          }
        };
      }),

    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        type: z.enum(['investment', 'partnership', 'acquisition', 'joint_venture', 'other']),
        counterparty: z.string().optional(),
        dealValue: z.number().optional(),
        currency: z.string().optional(),
        description: z.string().optional(),
        expectedCloseDate: z.date().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return createProjectGenesis({
          userId: ctx.user.id,
          name: input.name,
          type: input.type,
          counterparty: input.counterparty,
          dealValue: input.dealValue,
          currency: input.currency || 'USD',
          description: input.description,
          expectedCloseDate: input.expectedCloseDate,
          stage: 'discovery',
          status: 'active',
          probability: 50,
        });
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        stage: z.enum(['discovery', 'qualification', 'due_diligence', 'negotiation', 'documentation', 'closing', 'post_deal']).optional(),
        status: z.enum(['active', 'on_hold', 'won', 'lost', 'abandoned']).optional(),
        probability: z.number().min(0).max(100).optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await updateProjectGenesis(id, data);
        return { success: true };
      }),
});
