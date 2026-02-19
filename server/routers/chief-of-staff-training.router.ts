import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { ChiefOfStaffTrainingService } from "../services/chief-of-staff-training.service";

const trainingService = new ChiefOfStaffTrainingService();

export const chiefOfStaffTrainingRouter = router({
  // ============================================
  // Training Sessions
  // ============================================

  createSession: publicProcedure
    .input(
      z.object({
        userId: z.number(),
        sessionType: z.string(),
        topic: z.string(),
        notes: z.string().optional(),
        metadata: z.any().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return trainingService.createTrainingSession(input);
    }),

  getSession: publicProcedure
    .input(z.object({ sessionId: z.number() }))
    .query(async ({ input }) => {
      return trainingService.getTrainingSession(input.sessionId);
    }),

  getSessions: publicProcedure
    .input(
      z.object({
        userId: z.number().optional(),
        sessionType: z.string().optional(),
        completionStatus: z.string().optional(),
        limit: z.number().optional(),
        offset: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      return trainingService.getTrainingSessions(input);
    }),

  completeSession: publicProcedure
    .input(
      z.object({
        sessionId: z.number(),
        effectivenessScore: z.number().optional(),
        decisionsReviewed: z.number().optional(),
        insightsGenerated: z.number().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { sessionId, ...data } = input;
      return trainingService.completeTrainingSession(sessionId, data);
    }),

  // ============================================
  // Decision Tracking
  // ============================================

  trackDecision: publicProcedure
    .input(
      z.object({
        userId: z.number(),
        trainingSessionId: z.number().optional(),
        decisionType: z.string(),
        decisionContext: z.string(),
        decisionMade: z.string(),
        reasoning: z.string(),
        confidenceLevel: z.number().optional(),
        alternativesConsidered: z.any().optional(),
        factorsAnalyzed: z.any().optional(),
        expectedOutcome: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return trainingService.trackDecision(input);
    }),

  recordOutcome: publicProcedure
    .input(
      z.object({
        decisionId: z.number(),
        actualOutcome: z.string(),
        outcomeRating: z.number(),
        outcomeNotes: z.string().optional(),
        lessonsLearned: z.string().optional(),
        wouldDecideDifferently: z.boolean().optional(),
        improvementAreas: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { decisionId, ...data } = input;
      return trainingService.recordDecisionOutcome(decisionId, data);
    }),

  getDecisions: publicProcedure
    .input(
      z.object({
        userId: z.number().optional(),
        decisionType: z.string().optional(),
        hasOutcome: z.boolean().optional(),
        minOutcomeRating: z.number().optional(),
        limit: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      return trainingService.getDecisions(input);
    }),

  // ============================================
  // Knowledge Base
  // ============================================

  addKnowledge: publicProcedure
    .input(
      z.object({
        userId: z.number(),
        knowledgeCategory: z.string(),
        domain: z.string(),
        title: z.string(),
        description: z.string(),
        applicability: z.string().optional(),
        confidence: z.number().optional(),
        source: z.string(),
        sourceReference: z.string().optional(),
        metadata: z.any().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return trainingService.addKnowledge(input);
    }),

  getKnowledge: publicProcedure
    .input(
      z.object({
        userId: z.number().optional(),
        knowledgeCategory: z.string().optional(),
        domain: z.string().optional(),
        minConfidence: z.number().optional(),
        minSuccessRate: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      return trainingService.getKnowledge(input);
    }),

  applyKnowledge: publicProcedure
    .input(
      z.object({
        knowledgeId: z.number(),
        successful: z.boolean(),
      })
    )
    .mutation(async ({ input }) => {
      return trainingService.applyKnowledge(input.knowledgeId, input.successful);
    }),

  validateKnowledge: publicProcedure
    .input(z.object({ knowledgeId: z.number() }))
    .mutation(async ({ input }) => {
      return trainingService.validateKnowledge(input.knowledgeId);
    }),

  // ============================================
  // Learning Feedback
  // ============================================

  submitFeedback: publicProcedure
    .input(
      z.object({
        userId: z.number(),
        feedbackType: z.string(),
        context: z.string(),
        feedbackContent: z.string(),
        rating: z.number().optional(),
        severity: z.string().optional(),
        relatedDecisionId: z.number().optional(),
        relatedKnowledgeId: z.number().optional(),
        metadata: z.any().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return trainingService.submitFeedback(input);
    }),

  processFeedback: publicProcedure
    .input(
      z.object({
        feedbackId: z.number(),
        actionTaken: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return trainingService.processFeedback(input.feedbackId, input.actionTaken);
    }),

  getPendingFeedback: publicProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      return trainingService.getPendingFeedback(input.userId);
    }),

  // ============================================
  // Skill Progress
  // ============================================

  recordProgress: publicProcedure
    .input(
      z.object({
        userId: z.number(),
        skillName: z.string(),
        previousScore: z.number(),
        newScore: z.number(),
        improvementReason: z.string().optional(),
        evidence: z.string().optional(),
        trainingSessionId: z.number().optional(),
        decisionId: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return trainingService.recordSkillProgress(input);
    }),

  getSkillHistory: publicProcedure
    .input(
      z.object({
        userId: z.number().optional(),
        skillName: z.string().optional(),
        limit: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      return trainingService.getSkillHistory(input);
    }),

  // ============================================
  // Training Scenarios
  // ============================================

  createScenario: publicProcedure
    .input(
      z.object({
        scenarioName: z.string(),
        scenarioType: z.string(),
        difficultyLevel: z.number().optional(),
        description: z.string(),
        scenarioData: z.any(),
        learningObjectives: z.any().optional(),
        successCriteria: z.any().optional(),
        estimatedDurationMinutes: z.number().optional(),
        prerequisites: z.any().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return trainingService.createScenario(input);
    }),

  getScenarios: publicProcedure
    .input(
      z.object({
        scenarioType: z.string().optional(),
        maxDifficulty: z.number().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .query(async ({ input }) => {
      return trainingService.getScenarios(input);
    }),

  startScenario: publicProcedure
    .input(
      z.object({
        userId: z.number(),
        scenarioId: z.number(),
        trainingSessionId: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return trainingService.startScenario(input);
    }),

  completeScenario: publicProcedure
    .input(
      z.object({
        completionId: z.number(),
        score: z.number().optional(),
        timeSpentMinutes: z.number().optional(),
        decisionsMade: z.number().optional(),
        qualityScore: z.number().optional(),
        feedback: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { completionId, ...data } = input;
      return trainingService.completeScenario(completionId, data);
    }),

  getScenarioCompletions: publicProcedure
    .input(
      z.object({
        userId: z.number().optional(),
        scenarioId: z.number().optional(),
        completionStatus: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      return trainingService.getScenarioCompletions(input);
    }),

  // ============================================
  // Performance Metrics
  // ============================================

  updateMetrics: publicProcedure
    .input(
      z.object({
        userId: z.number(),
        date: z.string(), // ISO date string
      })
    )
    .mutation(async ({ input }) => {
      const date = new Date(input.date);
      return trainingService.updatePerformanceMetrics(input.userId, date);
    }),

  getMetrics: publicProcedure
    .input(
      z.object({
        userId: z.number(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        limit: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      const filters: any = { userId: input.userId };
      if (input.startDate) filters.startDate = new Date(input.startDate);
      if (input.endDate) filters.endDate = new Date(input.endDate);
      if (input.limit) filters.limit = input.limit;
      return trainingService.getPerformanceMetrics(filters);
    }),

  // ============================================
  // Analytics & Reporting
  // ============================================

  getTrainingStats: publicProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      return trainingService.getTrainingStats(input.userId);
    }),
});
