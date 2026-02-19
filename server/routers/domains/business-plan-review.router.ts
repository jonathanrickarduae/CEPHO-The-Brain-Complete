/**
 * Businessplanreview Router
 * 
 * Auto-extracted from monolithic routers.ts
 * 
 * @module routers/domains/business-plan-review
 */

import { router } from "../../_core/trpc";
import { z } from "zod";
import { businessPlanService } from "../../services/business-plan";
import { handleTRPCError } from "../../utils/error-handler";

export const businessPlanReviewRouter = router({
    // Get all business plan sections
    getSections: publicProcedure.query(() => {
      return BUSINESS_PLAN_SECTIONS;
    }),

    // Get all review experts
    getExperts: publicProcedure.query(() => {
      return REVIEW_EXPERTS.map(e => ({
        id: e.id,
        name: e.name,
        specialty: e.specialty,
        category: e.category,
        avatar: e.avatar,
      }));
    }),

    // Get experts for a specific section
    getExpertsForSection: publicProcedure
      .input(z.object({ sectionId: z.string() }))
      .query(({ input }) => {
        return getExpertsForSection(input.sectionId);
      }),

    // Analyze a single section with a specific expert
    analyzeSection: protectedProcedure
      .input(z.object({
        sectionId: z.string(),
        sectionContent: z.string().optional(),
        expertId: z.string(),
      }))
      .mutation(async ({ input }) => {
        const insight = await analyzeSection(
          input.sectionId,
          input.sectionContent || '',
          input.expertId
        );
        return insight;
      }),

    // Analyze a section with all assigned experts
    analyzeSectionWithAllExperts: protectedProcedure
      .input(z.object({
        sectionId: z.string(),
        sectionContent: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const experts = getExpertsForSection(input.sectionId);
        const insights: ExpertInsight[] = [];
        
        for (const expert of experts) {
          const insight = await analyzeSection(
            input.sectionId,
            input.sectionContent || '',
            expert.id
          );
          insights.push(insight);
        }

        // Calculate overall score
        const avgScore = Math.round(
          insights.reduce((sum, i) => sum + i.score, 0) / insights.length
        );

        // Aggregate recommendations and concerns
        const allRecommendations = insights.flatMap(i => i.recommendations);
        const allConcerns = insights.flatMap(i => i.concerns);

        const section = BUSINESS_PLAN_SECTIONS.find(s => s.id === input.sectionId);

        return {
          sectionId: input.sectionId,
          sectionName: section?.name || input.sectionId,
          status: 'completed' as const,
          expertInsights: insights,
          overallScore: avgScore,
          recommendations: Array.from(new Set(allRecommendations)).slice(0, 5),
          concerns: Array.from(new Set(allConcerns)).slice(0, 3),
        };
      }),

    // Generate consolidated report from reviews
    generateReport: protectedProcedure
      .input(z.object({
        reviews: z.array(z.object({
          sectionId: z.string(),
          sectionName: z.string(),
          status: z.enum(['pending', 'in-progress', 'completed']),
          expertInsights: z.array(z.object({
            expertId: z.string(),
            expertName: z.string(),
            expertAvatar: z.string(),
            insight: z.string(),
            score: z.number(),
            recommendations: z.array(z.string()),
            concerns: z.array(z.string()),
            timestamp: z.date().or(z.string()),
          })),
          overallScore: z.number().optional(),
          recommendations: z.array(z.string()).optional(),
          concerns: z.array(z.string()).optional(),
        })),
      }))
      .mutation(({ input }) => {
        const report = generateConsolidatedReport(input.reviews as SectionReview[]);
        return { report };
      }),

    // Chief of Staff: Select optimal expert team based on business plan content
    selectExpertTeam: protectedProcedure
      .input(z.object({
        businessPlanContent: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const result = await selectExpertTeam(input.businessPlanContent || '');
        return result;
      }),

    // Save review as a version
    saveVersion: protectedProcedure
      .input(z.object({
        projectName: z.string(),
        versionLabel: z.string().optional(),
        overallScore: z.number().optional(),
        sectionScores: z.record(z.string(), z.number()).optional(),
        reviewData: z.any(),
        expertTeam: z.array(z.string()),
        teamSelectionMode: z.string(),
        businessPlanContent: z.string().optional(),
        sectionDocuments: z.record(z.string(), z.object({
          fileName: z.string(),
          content: z.string(),
        })).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const latestVersion = await getLatestVersionNumber(ctx.user.id, input.projectName);
        const versionId = await createBusinessPlanReviewVersion({
          userId: ctx.user.id,
          projectName: input.projectName,
          versionNumber: latestVersion + 1,
          versionLabel: input.versionLabel,
          overallScore: input.overallScore,
          sectionScores: input.sectionScores,
          reviewData: input.reviewData,
          expertTeam: input.expertTeam,
          teamSelectionMode: input.teamSelectionMode,
          businessPlanContent: input.businessPlanContent,
          sectionDocuments: input.sectionDocuments,
        });
        return { versionId, versionNumber: latestVersion + 1 };
      }),

    // Get all versions for a project
    getVersions: protectedProcedure
      .input(z.object({
        projectName: z.string(),
      }))
      .query(async ({ ctx, input }) => {
        try {
          return getBusinessPlanReviewVersions(ctx.user.id, input.projectName);
        } catch (error) {
          handleTRPCError(error, "businessplanreview");
        }
      }),

    // Get a specific version by ID
    getVersionById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        try {
          return getBusinessPlanReviewVersionById(input.id);
        } catch (error) {
          handleTRPCError(error, "businessplanreview");
        }
      }),

    // Get all user's business plan projects
    getProjects: protectedProcedure
      .query(async ({ ctx }) => {
        return getUserBusinessPlanProjects(ctx.user.id);
      }),

    // Ask follow-up question to an expert
    askFollowUp: protectedProcedure
      .input(z.object({
        reviewVersionId: z.number(),
        sectionId: z.string(),
        expertId: z.string(),
        question: z.string(),
        originalInsight: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Create the question record
        const questionId = await createExpertFollowUpQuestion({
          userId: ctx.user.id,
          reviewVersionId: input.reviewVersionId,
          sectionId: input.sectionId,
          expertId: input.expertId,
          question: input.question,
        });

        // Get the expert info
        const expert = REVIEW_EXPERTS.find(e => e.id === input.expertId);
        if (!expert) {
          throw new Error('Expert not found');
        }

        // Generate answer using LLM
        const response = await invokeLLM({
          messages: [
            { 
              role: 'system', 
              content: `${expert.systemPrompt}\n\nYou previously provided this insight:\n"${input.originalInsight}"\n\nNow answer the follow-up question professionally and helpfully.` 
            },
            { role: 'user', content: input.question }
          ]
        });

        const rawContent = response.choices[0]?.message?.content;
        const answer = typeof rawContent === 'string' ? rawContent : 'Unable to generate response.';

        // Update the question with the answer
        if (questionId) {
          await answerExpertFollowUpQuestion(questionId, answer);
        }

        return { questionId, answer };
      }),

    // Get follow-up questions for a review
    getFollowUps: protectedProcedure
      .input(z.object({
        reviewVersionId: z.number(),
        sectionId: z.string().optional(),
        expertId: z.string().optional(),
      }))
      .query(async ({ input }) => {
        try {
          return getExpertFollowUpQuestions(input.reviewVersionId, {
          sectionId: input.sectionId,
          expertId: input.expertId,
        });
        } catch (error) {
          handleTRPCError(error, "businessplanreview");
        }
      }),

    // Generate PDF report markdown
    generateReportMarkdown: protectedProcedure
      .input(z.object({
        projectName: z.string(),
        templateId: z.string().optional(),
        overallScore: z.number(),
        sectionReviews: z.array(z.object({
          sectionId: z.string(),
          sectionName: z.string(),
          status: z.string(),
          overallScore: z.number().optional(),
          expertInsights: z.array(z.object({
            expertId: z.string(),
            expertName: z.string(),
            expertAvatar: z.string(),
            insight: z.string(),
            score: z.number(),
            recommendations: z.array(z.string()),
            concerns: z.array(z.string()),
          })),
          recommendations: z.array(z.string()).optional(),
          concerns: z.array(z.string()).optional(),
        })),
        expertTeam: z.array(z.string()),
        teamSelectionReasoning: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
//         const { generateReportMarkdown } = await import('../../services/pdfReportService');
        const markdown = generateReportMarkdown({
          ...input,
          reviewDate: new Date(),
        });
        return { markdown };
      }),

    // Get available templates
    getTemplates: publicProcedure.query(() => {
      return BUSINESS_TEMPLATES;
    }),
});
