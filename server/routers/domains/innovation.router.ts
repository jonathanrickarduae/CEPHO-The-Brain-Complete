/**
 * Innovation Router
 * 
 * Auto-extracted from monolithic routers.ts
 * 
 * @module routers/domains/innovation
 */

import { router } from "../../_core/trpc";
import { z } from "zod";
import { projectService } from "../../services/project";

export const innovationRouter = router({
    // Capture a new idea
    captureIdea: protectedProcedure
      .input(z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        source: z.enum(["manual", "article", "trend", "conversation", "chief_of_staff", "sme_suggestion"]).optional(),
        sourceUrl: z.string().optional(),
        category: z.string().optional(),
        tags: z.array(z.string()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
// //         const { captureIdea } = await import('../../services/innovationEngineService');
        return captureIdea(ctx.user.id, input);
      }),

    // Get all ideas
    getIdeas: protectedProcedure
      .input(z.object({
        status: z.string().optional(),
        stage: z.number().optional(),
        limit: z.number().optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
//         const { getIdeas } = await import('../../services/innovationEngineService');
        return getIdeas(ctx.user.id, input);
      }),

    // Get single idea with assessments
    getIdeaWithAssessments: protectedProcedure
      .input(z.object({ ideaId: z.number() }))
      .query(async ({ input }) => {
//         const { getIdeaWithAssessments } = await import('../../services/innovationEngineService');
        return getIdeaWithAssessments(input.ideaId);
      }),

    // Run strategic assessment
    runAssessment: protectedProcedure
      .input(z.object({
        ideaId: z.number(),
        assessmentType: z.enum(["market_analysis", "feasibility", "competitive_landscape", "financial_viability", "risk_assessment"]),
      }))
      .mutation(async ({ input }) => {
//         const { runStrategicAssessment } = await import('../../services/innovationEngineService');
        return runStrategicAssessment(input.ideaId, input.assessmentType);
      }),

    // Advance to next stage
    advanceStage: protectedProcedure
      .input(z.object({
        ideaId: z.number(),
        rationale: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
//         const { advanceToNextStage } = await import('../../services/innovationEngineService');
        return advanceToNextStage(input.ideaId, input.rationale);
      }),

    // Generate investment scenarios
    generateScenarios: protectedProcedure
      .input(z.object({
        ideaId: z.number(),
        budgets: z.array(z.number()).optional(),
      }))
      .mutation(async ({ input }) => {
//         const { generateInvestmentScenarios } = await import('../../services/innovationEngineService');
        return generateInvestmentScenarios(input.ideaId, input.budgets);
      }),

    // Generate idea brief
    generateBrief: protectedProcedure
      .input(z.object({ ideaId: z.number() }))
      .mutation(async ({ input }) => {
//         const { generateIdeaBrief } = await import('../../services/innovationEngineService');
        return generateIdeaBrief(input.ideaId);
      }),

    // Promote to Project Genesis
    promoteToGenesis: protectedProcedure
      .input(z.object({ ideaId: z.number() }))
      .mutation(async ({ input }) => {
//         const { promoteToGenesis } = await import('../../services/innovationEngineService');
        return promoteToGenesis(input.ideaId);
      }),

    // Analyze article for opportunities
    analyzeArticle: protectedProcedure
      .input(z.object({
        url: z.string(),
        context: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
//         const { analyzeArticleForOpportunities } = await import('../../services/innovationEngineService');
        return analyzeArticleForOpportunities(ctx.user.id, input.url, input.context);
      }),

    // Get strategic framework questions
    getFrameworkQuestions: publicProcedure
      .input(z.object({
        assessmentType: z.enum(["market_analysis", "feasibility", "competitive_landscape", "financial_viability", "risk_assessment"]),
      }))
      .query(async ({ input }) => {
//         const { STRATEGIC_FRAMEWORK } = await import('../../services/innovationEngineService');
        return STRATEGIC_FRAMEWORK[input.assessmentType];
      }),

    // === Government Funding Assessment ===
    
    // Get all funding programs
    getFundingPrograms: publicProcedure
      .input(z.object({
        country: z.enum(["UAE", "UK"]).optional(),
        type: z.string().optional(),
      }).optional())
      .query(async ({ input }) => {
//         const { ALL_FUNDING_PROGRAMS } = await import('../../services/fundingAssessmentService');
        let programs = ALL_FUNDING_PROGRAMS;
        if (input?.country) {
          programs = programs.filter(p => p.country === input.country);
        }
        if (input?.type) {
          programs = programs.filter(p => p.type === input.type);
        }
        return programs;
      }),

    // Get eligible programs for an idea
    getEligiblePrograms: protectedProcedure
      .input(z.object({
        ideaId: z.number(),
        country: z.enum(["UAE", "UK"]).optional(),
      }))
      .query(async ({ input }) => {
//         const { getEligiblePrograms } = await import('../../services/fundingAssessmentService');
//         const { getIdeaWithAssessments } = await import('../../services/innovationEngineService');
        const idea = await getIdeaWithAssessments(input.ideaId);
        if (!idea) return [];
        return getEligiblePrograms(idea.idea?.category || 'Technology', idea.idea?.currentStage?.toString() || 'seed', input.country);
      }),

    // Assess idea for a specific funding program
    assessForFunding: protectedProcedure
      .input(z.object({
        ideaId: z.number(),
        programId: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
//         const { assessIdeaForProgram } = await import('../../services/fundingAssessmentService');
        return assessIdeaForProgram(ctx.user.id, input.ideaId, input.programId);
      }),

    // Get all funding assessments for an idea
    getIdeaFundingAssessments: protectedProcedure
      .input(z.object({ ideaId: z.number() }))
      .query(async ({ input }) => {
//         const { getIdeaFundingAssessments } = await import('../../services/fundingAssessmentService');
        return getIdeaFundingAssessments(input.ideaId);
      }),

    // Generate application documents for a funding program
    generateFundingDocuments: protectedProcedure
      .input(z.object({
        ideaId: z.number(),
        programId: z.string(),
        documentTypes: z.array(z.string()),
      }))
      .mutation(async ({ input }) => {
//         const { generateApplicationDocuments } = await import('../../services/fundingAssessmentService');
        return generateApplicationDocuments(input.ideaId, input.programId, input.documentTypes);
      }),
});
