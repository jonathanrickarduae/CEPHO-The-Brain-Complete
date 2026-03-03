/**
 * Digital Twin Router — Real Implementation
 *
 * Manages the Digital Twin profile: reading questionnaire responses,
 * computing the cognitive model, and generating AI-powered calibration
 * insights using the Anthropic Claude API.
 */
import { z } from "zod";
import { eq } from "drizzle-orm";
import Anthropic from "@anthropic-ai/sdk";
import { protectedProcedure, router } from "../_core/trpc";
import { db } from "../db";
import {
  digitalTwinProfile,
  questionnaireResponses,
  userSettings,
  activityFeed,
  digitalTwinCognitiveModel,
  digitalTwinVocabulary,
  digitalTwinDecisionLog,
} from "../../drizzle/schema";
import {
  getCognitiveModelSnapshot,
  assembleDTPersonalityInjection,
} from "../services/dynamicPromptAssembler";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY ?? "",
});

// ─── Helper: build a cognitive summary from questionnaire responses ──────────
function buildCognitiveSummary(
  responses: {
    questionId: string;
    scaleValue: number | null;
    booleanValue: boolean | null;
  }[]
) {
  const map: Record<string, number | boolean | null> = {};
  for (const r of responses) {
    map[r.questionId] = r.scaleValue ?? r.booleanValue ?? null;
  }
  return map;
}

export const digitalTwinRouter = router({
  /**
   * Get the current Digital Twin profile for the user.
   * Creates a default profile if none exists.
   */
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const rows = await db
      .select()
      .from(digitalTwinProfile)
      .where(eq(digitalTwinProfile.userId, ctx.user.id))
      .limit(1);

    if (rows.length === 0) {
      const [created] = await db
        .insert(digitalTwinProfile)
        .values({ userId: ctx.user.id })
        .returning();
      return created;
    }
    return rows[0];
  }),

  /**
   * Recalibrate the Digital Twin by reading all questionnaire responses
   * and computing updated scores. Called by the scheduler daily.
   */
  recalibrate: protectedProcedure.mutation(async ({ ctx }) => {
    const responses = await db
      .select()
      .from(questionnaireResponses)
      .where(eq(questionnaireResponses.userId, ctx.user.id));

    const total = 100;
    const answered = responses.length;
    const completion = Math.min(100, Math.round((answered / total) * 100));

    // Map responses to profile fields
    const map = buildCognitiveSummary(responses);

    const profileUpdate: Record<string, number | null> = {
      questionnaireCompletion: completion,
      cosUnderstandingLevel: Math.min(100, completion + 10),
      measurementDriven:
        typeof map["q_measurement_driven"] === "number"
          ? map["q_measurement_driven"]
          : null,
      processStandardization:
        typeof map["q_process_std"] === "number" ? map["q_process_std"] : null,
      automationPreference:
        typeof map["q_automation"] === "number" ? map["q_automation"] : null,
      ambiguityTolerance:
        typeof map["q_ambiguity"] === "number" ? map["q_ambiguity"] : null,
      techAdoptionSpeed:
        typeof map["q_tech_adoption"] === "number"
          ? map["q_tech_adoption"]
          : null,
      aiBeliefLevel:
        typeof map["q_ai_belief"] === "number" ? map["q_ai_belief"] : null,
      dataVsIntuition:
        typeof map["q_data_intuition"] === "number"
          ? map["q_data_intuition"]
          : null,
      nicheVsMass:
        typeof map["q_niche_mass"] === "number" ? map["q_niche_mass"] : null,
      firstMoverVsFollower:
        typeof map["q_first_mover"] === "number" ? map["q_first_mover"] : null,
      structurePreference:
        typeof map["q_structure"] === "number" ? map["q_structure"] : null,
      interruptionTolerance:
        typeof map["q_interruption"] === "number"
          ? map["q_interruption"]
          : null,
      batchingPreference:
        typeof map["q_batching"] === "number" ? map["q_batching"] : null,
      scenarioPlanningLevel:
        typeof map["q_scenario_planning"] === "number"
          ? map["q_scenario_planning"]
          : null,
      pivotComfort:
        typeof map["q_pivot_comfort"] === "number"
          ? map["q_pivot_comfort"]
          : null,
      trendLeadership:
        typeof map["q_trend_leadership"] === "number"
          ? map["q_trend_leadership"]
          : null,
      portfolioDiversification:
        typeof map["q_portfolio_div"] === "number"
          ? map["q_portfolio_div"]
          : null,
    };

    // Upsert the profile
    const existing = await db
      .select()
      .from(digitalTwinProfile)
      .where(eq(digitalTwinProfile.userId, ctx.user.id))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(digitalTwinProfile).values({
        userId: ctx.user.id,
        ...profileUpdate,
        lastCalculated: new Date(),
      });
    } else {
      await db
        .update(digitalTwinProfile)
        .set({
          ...profileUpdate,
          lastCalculated: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(digitalTwinProfile.userId, ctx.user.id));
    }

    return { success: true, completion, answeredQuestions: answered };
  }),

  /**
   * Generate AI-powered insights about the user's cognitive profile
   * using Claude. Returns a narrative summary and recommendations.
   */
  generateInsights: protectedProcedure.mutation(async ({ ctx }) => {
    const [profile] = await db
      .select()
      .from(digitalTwinProfile)
      .where(eq(digitalTwinProfile.userId, ctx.user.id))
      .limit(1);

    if (!profile) {
      return {
        insights:
          "Complete the Digital Twin questionnaire to unlock personalised insights.",
        recommendations: [],
        generatedAt: new Date().toISOString(),
      };
    }

    const profileSummary = `
Digital Twin Profile:
- Measurement Driven: ${profile.measurementDriven ?? "not set"}/10
- Process Standardization: ${profile.processStandardization ?? "not set"}/10
- Automation Preference: ${profile.automationPreference ?? "not set"}/10
- Ambiguity Tolerance: ${profile.ambiguityTolerance ?? "not set"}/10
- Tech Adoption Speed: ${profile.techAdoptionSpeed ?? "not set"}/10
- AI Belief Level: ${profile.aiBeliefLevel ?? "not set"}/10
- Data vs Intuition: ${profile.dataVsIntuition ?? "not set"}/10
- Structure Preference: ${profile.structurePreference ?? "not set"}/10
- Pivot Comfort: ${profile.pivotComfort ?? "not set"}/10
- Questionnaire Completion: ${profile.questionnaireCompletion ?? 0}%
    `.trim();

    const message = await anthropic.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 800,
      messages: [
        {
          role: "user",
          content: `You are CEPHO, an elite AI Chief of Staff. Based on this executive's Digital Twin profile, provide:
1. A 2-sentence narrative insight about their leadership and decision-making style
2. Three specific, actionable recommendations to improve their effectiveness

${profileSummary}

Respond in JSON: { "insights": "narrative here", "recommendations": ["rec1", "rec2", "rec3"] }`,
        },
      ],
    });

    let result = { insights: "", recommendations: [] as string[] };
    try {
      const content = message.content[0];
      if (content.type === "text") {
        const parsed = JSON.parse(content.text);
        result = parsed;
      }
    } catch {
      result.insights =
        "Your Digital Twin profile is being calibrated. Check back after completing more of the questionnaire.";
      result.recommendations = [
        "Complete the Digital Twin questionnaire for personalised insights",
        "Connect your calendar to improve scheduling intelligence",
        "Review your weekly KPIs to align with strategic goals",
      ];
    }

    // Log to activity feed
    await db.insert(activityFeed).values({
      userId: ctx.user.id,
      actorType: "ai",
      action: "generated",
      targetType: "digital_twin_insights",
      targetId: profile.id,
      metadata: { completion: profile.questionnaireCompletion },
    });

    return { ...result, generatedAt: new Date().toISOString() };
  }),

  /**
   * Update specific profile fields directly (e.g. from the settings page).
   */
  updateProfile: protectedProcedure
    .input(
      z.object({
        measurementDriven: z.number().min(1).max(10).optional(),
        processStandardization: z.number().min(1).max(10).optional(),
        automationPreference: z.number().min(1).max(10).optional(),
        ambiguityTolerance: z.number().min(1).max(10).optional(),
        techAdoptionSpeed: z.number().min(1).max(10).optional(),
        aiBeliefLevel: z.number().min(1).max(10).optional(),
        dataVsIntuition: z.number().min(1).max(10).optional(),
        structurePreference: z.number().min(1).max(10).optional(),
        pivotComfort: z.number().min(1).max(10).optional(),
        trendLeadership: z.number().min(1).max(10).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const existing = await db
        .select()
        .from(digitalTwinProfile)
        .where(eq(digitalTwinProfile.userId, ctx.user.id))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(digitalTwinProfile).values({
          userId: ctx.user.id,
          ...input,
          lastCalculated: new Date(),
        });
      } else {
        await db
          .update(digitalTwinProfile)
          .set({ ...input, updatedAt: new Date() })
          .where(eq(digitalTwinProfile.userId, ctx.user.id));
      }

      return { success: true };
    }),

  /**
   * Get the autonomy level setting for the Digital Twin.
   */
  getAutonomyLevel: protectedProcedure.query(async ({ ctx }) => {
    const [settings] = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, ctx.user.id))
      .limit(1);
    return { level: settings?.twinAutonomyLevel ?? 1 };
  }),

  /**
   * Update the autonomy level for the Digital Twin.
   */
  setAutonomyLevel: protectedProcedure
    .input(z.object({ level: z.number().min(1).max(10) }))
    .mutation(async ({ input, ctx }) => {
      const existing = await db
        .select()
        .from(userSettings)
        .where(eq(userSettings.userId, ctx.user.id))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(userSettings).values({
          userId: ctx.user.id,
          theme: "dark",
          governanceMode: "standard",
          twinAutonomyLevel: input.level,
        });
      } else {
        await db
          .update(userSettings)
          .set({ twinAutonomyLevel: input.level, updatedAt: new Date() })
          .where(eq(userSettings.userId, ctx.user.id));
      }

      return { success: true, level: input.level };
    }),

  /**
   * DT-MOD-02: Get the Cognitive Model snapshot for the current user.
   */
  getCognitiveModel: protectedProcedure.query(async ({ ctx }) => {
    return getCognitiveModelSnapshot(ctx.user.id);
  }),

  /**
   * DT-MOD-02: Update the Cognitive Model with new values.
   */
  updateCognitiveModel: protectedProcedure
    .input(
      z.object({
        communicationStyle: z
          .object({
            formality: z.number().min(0).max(1),
            verbosity: z.number().min(0).max(1),
            humor: z.number().min(0).max(1),
            useEmoji: z.boolean(),
          })
          .optional(),
        riskTolerance: z.number().min(0).max(1).optional(),
        decisionHeuristics: z.array(z.string()).optional(),
        strategicPriorities: z
          .array(z.object({ priority: z.string(), weight: z.number() }))
          .optional(),
        values: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const existing = await db
        .select()
        .from(digitalTwinCognitiveModel)
        .where(eq(digitalTwinCognitiveModel.userId, ctx.user.id))
        .limit(1);

      const updateData: Record<string, unknown> = { updatedAt: new Date() };
      if (input.communicationStyle) updateData.communicationStyle = input.communicationStyle;
      if (input.riskTolerance !== undefined) updateData.riskTolerance = input.riskTolerance.toFixed(2);
      if (input.decisionHeuristics) updateData.decisionHeuristics = input.decisionHeuristics;
      if (input.strategicPriorities) updateData.strategicPriorities = input.strategicPriorities;
      if (input.values) updateData.values = input.values;

      if (existing.length === 0) {
        await db.insert(digitalTwinCognitiveModel).values({ userId: ctx.user.id, ...updateData });
      } else {
        await db
          .update(digitalTwinCognitiveModel)
          .set(updateData)
          .where(eq(digitalTwinCognitiveModel.userId, ctx.user.id));
      }
      return { success: true };
    }),

  /**
   * DT-MOD-02: Get the Vocabulary model for the current user.
   */
  getVocabulary: protectedProcedure.query(async ({ ctx }) => {
    const [vocab] = await db
      .select()
      .from(digitalTwinVocabulary)
      .where(eq(digitalTwinVocabulary.userId, ctx.user.id))
      .limit(1);
    return vocab ?? { preferredTerms: {}, avoidedTerms: [], commonPhrases: [], writingSamples: [] };
  }),

  /**
   * DT-MOD-02: Update the Vocabulary model.
   */
  updateVocabulary: protectedProcedure
    .input(
      z.object({
        preferredTerms: z.record(z.string(), z.string()).optional(),
        avoidedTerms: z.array(z.string()).optional(),
        commonPhrases: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const existing = await db
        .select()
        .from(digitalTwinVocabulary)
        .where(eq(digitalTwinVocabulary.userId, ctx.user.id))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(digitalTwinVocabulary).values({
          userId: ctx.user.id,
          preferredTerms: (input.preferredTerms ?? {}) as Record<string, string>,
          avoidedTerms: input.avoidedTerms ?? [],
          commonPhrases: input.commonPhrases ?? [],
        });
      } else {
        const setData: Record<string, unknown> = { updatedAt: new Date() };
        if (input.preferredTerms !== undefined) setData.preferredTerms = input.preferredTerms;
        if (input.avoidedTerms !== undefined) setData.avoidedTerms = input.avoidedTerms;
        if (input.commonPhrases !== undefined) setData.commonPhrases = input.commonPhrases;
        await db
          .update(digitalTwinVocabulary)
          .set(setData)
          .where(eq(digitalTwinVocabulary.userId, ctx.user.id));
      }
      return { success: true };
    }),

  /**
   * DT-MOD-02: Log a user decision for model calibration.
   */
  logDecision: protectedProcedure
    .input(
      z.object({
        scenarioType: z.string(),
        scenarioContext: z.any().optional(),
        agentProposal: z.string().optional(),
        agentId: z.string().optional(),
        decision: z.enum(["approved", "rejected", "modified", "deferred", "delegated"]),
        modifiedTo: z.string().optional(),
        decisionRationale: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const [log] = await db
        .insert(digitalTwinDecisionLog)
        .values({ userId: ctx.user.id, ...input })
        .returning();
      return { success: true, id: log.id };
    }),

  /**
   * DT-MOD-04: Get the assembled personality injection string.
   * Used by the frontend to preview how the Digital Twin personalises responses.
   */
  getPersonalityInjection: protectedProcedure.query(async ({ ctx }) => {
    const injection = await assembleDTPersonalityInjection(ctx.user.id);
    return { injection };
  }),
});
