import { z } from "zod";
import { publicProcedure, router } from "../../_core/trpc";
import { DigitalTwinTrainingService } from "../../services/digital-twin-training.service";

const trainingService = new DigitalTwinTrainingService();

export const digitalTwinTrainingRouter = router({
  // ============================================
  // Training Sessions
  // ============================================

  createSession: publicProcedure
    .input(
      z.object({
        userId: z.number(),
        digitalTwinId: z.number(),
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
        digitalTwinId: z.number().optional(),
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
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { sessionId, ...data } = input;
      return trainingService.completeTrainingSession(sessionId, data);
    }),

  // ============================================
  // Training Interactions
  // ============================================

  logInteraction: publicProcedure
    .input(
      z.object({
        sessionId: z.number(),
        userId: z.number(),
        interactionType: z.string(),
        content: z.string(),
        context: z.string().optional(),
        confidenceScore: z.number().optional(),
        userSatisfaction: z.number().optional(),
        learningValue: z.number().optional(),
        metadata: z.any().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return trainingService.logInteraction(input);
    }),

  getSessionInteractions: publicProcedure
    .input(z.object({ sessionId: z.number() }))
    .query(async ({ input }) => {
      return trainingService.getSessionInteractions(input.sessionId);
    }),

  // ============================================
  // Knowledge Management
  // ============================================

  addKnowledge: publicProcedure
    .input(
      z.object({
        userId: z.number(),
        digitalTwinId: z.number(),
        knowledgeType: z.string(),
        category: z.string(),
        key: z.string(),
        value: z.string(),
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
        digitalTwinId: z.number().optional(),
        knowledgeType: z.string().optional(),
        category: z.string().optional(),
        key: z.string().optional(),
        minConfidence: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      return trainingService.getKnowledge(input);
    }),

  validateKnowledge: publicProcedure
    .input(z.object({ knowledgeId: z.number() }))
    .mutation(async ({ input }) => {
      return trainingService.validateKnowledge(input.knowledgeId);
    }),

  contradictKnowledge: publicProcedure
    .input(z.object({ knowledgeId: z.number() }))
    .mutation(async ({ input }) => {
      return trainingService.contradictKnowledge(input.knowledgeId);
    }),

  // ============================================
  // Learning Feedback
  // ============================================

  submitFeedback: publicProcedure
    .input(
      z.object({
        userId: z.number(),
        digitalTwinId: z.number(),
        feedbackType: z.string(),
        context: z.string(),
        feedbackContent: z.string(),
        severity: z.string().optional(),
        relatedKnowledgeId: z.number().optional(),
        relatedSessionId: z.number().optional(),
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
    .input(z.object({ digitalTwinId: z.number() }))
    .query(async ({ input }) => {
      return trainingService.getPendingFeedback(input.digitalTwinId);
    }),

  // ============================================
  // Competency Progress
  // ============================================

  recordProgress: publicProcedure
    .input(
      z.object({
        userId: z.number(),
        digitalTwinId: z.number(),
        competencyName: z.string(),
        previousScore: z.number(),
        newScore: z.number(),
        improvementReason: z.string().optional(),
        evidence: z.string().optional(),
        trainingSessionId: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return trainingService.recordCompetencyProgress(input);
    }),

  getCompetencyHistory: publicProcedure
    .input(
      z.object({
        userId: z.number().optional(),
        digitalTwinId: z.number().optional(),
        competencyName: z.string().optional(),
        limit: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      return trainingService.getCompetencyHistory(input);
    }),

  // ============================================
  // Training Modules
  // ============================================

  createModule: publicProcedure
    .input(
      z.object({
        moduleName: z.string(),
        moduleType: z.string(),
        competencyFocus: z.string(),
        description: z.string(),
        content: z.any(),
        prerequisites: z.any().optional(),
        estimatedDurationMinutes: z.number().optional(),
        difficultyLevel: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return trainingService.createTrainingModule(input);
    }),

  getModules: publicProcedure
    .input(
      z.object({
        moduleType: z.string().optional(),
        competencyFocus: z.string().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .query(async ({ input }) => {
      return trainingService.getTrainingModules(input);
    }),

  startModule: publicProcedure
    .input(
      z.object({
        userId: z.number(),
        digitalTwinId: z.number(),
        moduleId: z.number(),
        trainingSessionId: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return trainingService.startModule(input);
    }),

  completeModule: publicProcedure
    .input(
      z.object({
        completionId: z.number(),
        score: z.number().optional(),
        timeSpentMinutes: z.number().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { completionId, ...data } = input;
      return trainingService.completeModule(completionId, data);
    }),

  getModuleCompletions: publicProcedure
    .input(
      z.object({
        userId: z.number().optional(),
        digitalTwinId: z.number().optional(),
        moduleId: z.number().optional(),
        completionStatus: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      return trainingService.getModuleCompletions(input);
    }),

  // ============================================
  // Analytics & Reporting
  // ============================================

  getTrainingStats: publicProcedure
    .input(
      z.object({
        userId: z.number(),
        digitalTwinId: z.number(),
      })
    )
    .query(async ({ input }) => {
      return trainingService.getTrainingStats(input.userId, input.digitalTwinId);
    }),
});
