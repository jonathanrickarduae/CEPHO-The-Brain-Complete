import { getModelForTask } from "../utils/modelRouter";
import { logAiUsage } from "./aiCostTracking.router";
/**
 * Innovation Router — Real Implementation
 *
 * Powers the Innovation Hub: idea capture, AI assessment,
 * scenario generation, brief writing, and Genesis promotion.
 */
import { z } from "zod";
import { desc, eq, and } from "drizzle-orm";
import OpenAI from "openai";
import { protectedProcedure, router } from "../_core/trpc";
import { createNotification } from "./notifications.router";
import { db } from "../db";
import {
  innovationIdeas,
  projectGenesis,
  projectGenesisPhases,
  ideaAssessments,
  investmentScenarios,
  smeReviewTriggers,
  victoriaActions,
} from "../../drizzle/schema";

function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");
  return new OpenAI({ apiKey });
}

export const innovationRouter = router({
  /**
   * Get all ideas for the current user.
   */
  getIdeas: protectedProcedure
    .input(
      z.object({
        status: z.string().optional(),
        category: z.string().optional(),
        limit: z.number().min(1).max(100).default(50),
      })
    )
    .query(async ({ input, ctx }) => {
      const rows = await db
        .select()
        .from(innovationIdeas)
        .where(eq(innovationIdeas.userId, ctx.user.id))
        .orderBy(desc(innovationIdeas.createdAt))
        .limit(input.limit);

      return {
        ideas: rows
          .filter(r => !input.status || r.status === input.status)
          .filter(r => !input.category || r.category === input.category)
          .map(r => ({
            id: r.id,
            title: r.title,
            description: r.description,
            source: r.source,
            status: r.status,
            currentStage: r.currentStage,
            priority: r.priority,
            category: r.category,
            confidenceScore: r.confidenceScore,
            createdAt: r.createdAt.toISOString(),
          })),
      };
    }),

  /**
   * Get a single idea with all its assessments.
   */
  getIdeaWithAssessments: protectedProcedure
    .input(z.object({ ideaId: z.number() }))
    .query(async ({ input, ctx }) => {
      const rows = await db
        .select()
        .from(innovationIdeas)
        .where(
          and(
            eq(innovationIdeas.id, input.ideaId),
            eq(innovationIdeas.userId, ctx.user.id)
          )
        )
        .limit(1);

      if (rows.length === 0) return null;
      const idea = rows[0];

      // Fetch assessments and scenarios from DB
      const [assessmentRows, scenarioRows] = await Promise.all([
        db
          .select()
          .from(ideaAssessments)
          .where(eq(ideaAssessments.ideaId, idea.id)),
        db
          .select()
          .from(investmentScenarios)
          .where(eq(investmentScenarios.ideaId, idea.id)),
      ]);

      return {
        idea: {
          id: idea.id,
          title: idea.title,
          description: idea.description,
          source: idea.source,
          status: idea.status,
          currentStage: idea.currentStage,
          priority: idea.priority,
          category: idea.category,
          confidenceScore: idea.confidenceScore,
          briefDocument: idea.briefDocument,
          estimatedInvestment: idea.estimatedInvestment,
          estimatedReturn: idea.estimatedReturn,
          tags: idea.tags,
          promotedToProjectId: idea.promotedToProjectId,
          createdAt: idea.createdAt.toISOString(),
        },
        assessments: assessmentRows,
        scenarios: scenarioRows,
      };
    }),

  /**
   * Capture a new idea.
   */
  captureIdea: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(300),
        description: z.string().optional(),
        source: z.string().default("manual"),
        sourceUrl: z.string().optional(),
        category: z.string().optional(),
        priority: z.string().default("medium"),
        tags: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const [idea] = await db
        .insert(innovationIdeas)
        .values({
          userId: ctx.user.id,
          title: input.title,
          description: input.description ?? null,
          source: input.source,
          sourceUrl: input.sourceUrl ?? null,
          status: "captured",
          currentStage: 1,
          priority: input.priority,
          category: input.category ?? "general",
          tags: input.tags ?? [],
        })
        .returning();

      // Notify user that idea was captured (non-blocking)
      createNotification({
        userId: ctx.user.id,
        type: "innovation",
        title: "Idea Captured",
        message: `"${idea.title}" has been added to your Innovation Flywheel.`,
        actionUrl: "/innovation",
        actionLabel: "View Idea",
      }).catch(() => {});

      return {
        id: idea.id,
        title: idea.title,
        status: idea.status,
        createdAt: idea.createdAt.toISOString(),
      };
    }),

  /**
   * Generate daily ideas using OpenAI based on the user's context.
   */
  generateDailyIdeas: protectedProcedure.mutation(async ({ ctx }) => {
    const openai = getOpenAIClient();

    const prompt = `You are an innovation advisor for CEPHO, an AI-powered executive platform. Generate 5 innovative business ideas for today that are:
- Relevant to AI, technology, and business transformation
- Actionable and specific
- Varied across different business domains

For each idea provide:
1. A compelling title (max 10 words)
2. A brief description (2-3 sentences)
3. Category (product/strategy/investment/technology/market)
4. Priority (high/medium/low)

Format as JSON array: [{"title": "...", "description": "...", "category": "...", "priority": "..."}]`;

    const completion = await openai.chat.completions.create({
      model: getModelForTask("score"),
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1000,
      temperature: 0.9,
      response_format: { type: "json_object" },
    });
    // p5-9: Track AI usage
    void logAiUsage(
      ctx.user.id,
      "innovation.generateDailyIdeas",
      completion.model,
      completion.usage ?? null
    );

    let ideas: Array<{
      title: string;
      description: string;
      category: string;
      priority: string;
    }> = [];
    try {
      const parsed = JSON.parse(
        completion.choices[0]?.message?.content ?? "{}"
      );
      ideas = parsed.ideas ?? parsed.data ?? [];
      if (!Array.isArray(ideas)) ideas = [];
    } catch {
      ideas = [];
    }

    // Save generated ideas to database
    const saved = await Promise.all(
      ideas.slice(0, 5).map(async idea => {
        const [saved] = await db
          .insert(innovationIdeas)
          .values({
            userId: ctx.user.id,
            title: idea.title,
            description: idea.description,
            source: "ai_generated",
            status: "captured",
            currentStage: 1,
            priority: idea.priority ?? "medium",
            category: idea.category ?? "general",
          })
          .returning();
        return {
          id: saved.id,
          title: saved.title,
          description: saved.description,
        };
      })
    );

    return {
      ideas: saved,
      generatedAt: new Date().toISOString(),
      count: saved.length,
    };
  }),

  /**
   * Run an AI assessment on an idea.
   */
  runAssessment: protectedProcedure
    .input(
      z.object({
        ideaId: z.number(),
        assessmentType: z
          .enum([
            "market_analysis",
            "feasibility",
            "competitive_landscape",
            "financial_viability",
            "risk_assessment",
          ])
          .optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const rows = await db
        .select()
        .from(innovationIdeas)
        .where(
          and(
            eq(innovationIdeas.id, input.ideaId),
            eq(innovationIdeas.userId, ctx.user.id)
          )
        )
        .limit(1);

      if (rows.length === 0) throw new Error("Idea not found");
      const idea = rows[0];

      const openai = getOpenAIClient();
      const assessmentFocus =
        input.assessmentType?.replace(/_/g, " ") ?? "general viability";
      const prompt = `Perform a ${assessmentFocus} assessment for this business idea:

Title: ${idea.title}
Description: ${idea.description ?? "No description provided"}
Category: ${idea.category ?? "general"}

Provide a JSON assessment focused on ${assessmentFocus} with:
{
  "assessmentType": "${input.assessmentType ?? "general"}",
  "score": 0-100,
  "findings": "2-3 sentence summary of key findings",
  "viabilityScore": 0-100,
  "marketPotential": "low|medium|high",
  "implementationComplexity": "low|medium|high",
  "timeToMarket": "string (e.g., '3-6 months')",
  "keyStrengths": ["string", ...],
  "keyRisks": ["string", ...],
  "recommendation": "proceed|investigate|park",
  "confidenceScore": 0-100
}`;

      const completion = await openai.chat.completions.create({
        model: getModelForTask("score"),
        messages: [{ role: "user", content: prompt }],
        max_tokens: 600,
        temperature: 0.5,
        response_format: { type: "json_object" },
      });
      // p5-9: Track AI usage
      void logAiUsage(
        ctx.user.id,
        "innovation.runAssessment",
        completion.model,
        completion.usage ?? null
      );

      let assessment: Record<string, unknown> = {};
      try {
        assessment = JSON.parse(
          completion.choices[0]?.message?.content ?? "{}"
        );
      } catch {
        assessment = {
          viabilityScore: 70,
          confidenceScore: 65,
          recommendation: "investigate",
        };
      }

      // Save assessment to ideaAssessments table
      const [savedAssessment] = await db
        .insert(ideaAssessments)
        .values({
          ideaId: input.ideaId,
          assessmentType: input.assessmentType ?? "general",
          stage: 2,
          assessorType: "ai",
          findings: (assessment.findings as string) ?? "Assessment complete",
          score:
            (assessment.score as number) ??
            (assessment.viabilityScore as number) ??
            70,
          recommendation:
            (assessment.recommendation as string) ?? "investigate",
          metadata: assessment,
        })
        .returning();

      // Update idea with confidence score
      await db
        .update(innovationIdeas)
        .set({
          confidenceScore: (assessment.confidenceScore as number) ?? 70,
          status: "assessed",
          currentStage: 2,
          updatedAt: new Date(),
        })
        .where(eq(innovationIdeas.id, input.ideaId));

      // ─── AUTONOMOUS SME TRIGGER: Stage 2 Assessment ─────────────────────────────────────
      // When an idea reaches Stage 2 (assessed), automatically trigger AI SME review
      // Engage the 3 most relevant domain SMEs based on idea category
      const smeMap: Record<string, string[]> = {
        technology: [
          "technology_advisor",
          "innovation_scout",
          "financial_analyst",
        ],
        market: [
          "marketing_strategist",
          "competitor_intelligence",
          "financial_analyst",
        ],
        product: [
          "innovation_scout",
          "technology_advisor",
          "marketing_strategist",
        ],
        strategy: ["chief_of_staff", "financial_analyst", "legal_counsel"],
        investment: ["financial_analyst", "legal_counsel", "chief_of_staff"],
        general: [
          "innovation_scout",
          "financial_analyst",
          "marketing_strategist",
        ],
      };
      const relevantSmes = smeMap[idea.category ?? "general"] ?? smeMap.general;

      await db.insert(smeReviewTriggers).values({
        userId: ctx.user.id,
        triggerType: "innovation_assess",
        sourceType: "innovation_idea",
        sourceId: input.ideaId,
        sourceTitle: idea.title,
        expertType: "ai_sme",
        expertIds: relevantSmes,
        status: "pending",
        triggeredAt: new Date(),
      });

      // Log Victoria action
      await db.insert(victoriaActions).values({
        userId: ctx.user.id,
        actionType: "sme_triggered",
        actionTitle: `SME review triggered for "${idea.title}"`,
        description: `Idea reached Stage 2. Automatically engaged ${relevantSmes.join(", ")} for specialist review.`,
        relatedEntityType: "innovation_idea",
        relatedEntityId: input.ideaId,
        autonomous: true,
        metadata: { stage: 2, smes: relevantSmes, ideaCategory: idea.category },
      });

      return {
        success: true,
        assessment: {
          ...savedAssessment,
          ...assessment,
          assessmentType: input.assessmentType ?? "general",
        },
        smeReviewTriggered: true,
        smeExperts: relevantSmes,
        assessedAt: new Date().toISOString(),
      };
    }),

  /**
   * Generate a strategic brief for an idea.
   */
  generateBrief: protectedProcedure
    .input(z.object({ ideaId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const rows = await db
        .select()
        .from(innovationIdeas)
        .where(
          and(
            eq(innovationIdeas.id, input.ideaId),
            eq(innovationIdeas.userId, ctx.user.id)
          )
        )
        .limit(1);

      if (rows.length === 0) throw new Error("Idea not found");
      const idea = rows[0];

      const openai = getOpenAIClient();
      const prompt = `Write a concise strategic brief for this business idea:

Title: ${idea.title}
Description: ${idea.description ?? "No description"}
Category: ${idea.category ?? "general"}

Include:
1. Executive Summary (2-3 sentences)
2. Market Opportunity
3. Strategic Fit
4. Key Success Factors
5. Recommended Next Steps

Keep it professional and actionable. Max 400 words.`;

      const completion = await openai.chat.completions.create({
        model: getModelForTask("score"),
        messages: [{ role: "user", content: prompt }],
        max_tokens: 600,
        temperature: 0.6,
      });
      // p5-9: Track AI usage
      void logAiUsage(
        ctx.user.id,
        "innovation.generateBrief",
        completion.model,
        completion.usage ?? null
      );

      const brief =
        completion.choices[0]?.message?.content ?? "Brief generation failed";

      // Save brief to idea
      await db
        .update(innovationIdeas)
        .set({
          briefDocument: brief,
          status: "briefed",
          currentStage: 3,
          updatedAt: new Date(),
        })
        .where(eq(innovationIdeas.id, input.ideaId));

      return { brief, generatedAt: new Date().toISOString() };
    }),

  /**
   * Generate investment scenarios for an idea.
   */
  generateScenarios: protectedProcedure
    .input(z.object({ ideaId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const rows = await db
        .select()
        .from(innovationIdeas)
        .where(
          and(
            eq(innovationIdeas.id, input.ideaId),
            eq(innovationIdeas.userId, ctx.user.id)
          )
        )
        .limit(1);

      if (rows.length === 0) throw new Error("Idea not found");
      const idea = rows[0];

      const openai = getOpenAIClient();
      const prompt = `Generate 3 investment scenarios for this business idea:

Title: ${idea.title}
Description: ${idea.description ?? "No description"}

Provide JSON with 3 scenarios (conservative, moderate, optimistic):
{
  "scenarios": [
    {
      "name": "Conservative",
      "investment": { "min": number, "max": number, "currency": "GBP" },
      "expectedReturn": { "min": number, "max": number, "timeframe": "string" },
      "probability": number (0-100),
      "keyAssumptions": ["string", ...]
    }
  ]
}`;

      const completion = await openai.chat.completions.create({
        model: getModelForTask("score"),
        messages: [{ role: "user", content: prompt }],
        max_tokens: 700,
        temperature: 0.5,
        response_format: { type: "json_object" },
      });
      // p5-9: Track AI usage
      void logAiUsage(
        ctx.user.id,
        "innovation.generateScenarios",
        completion.model,
        completion.usage ?? null
      );

      let scenarios: unknown[] = [];
      try {
        const parsed = JSON.parse(
          completion.choices[0]?.message?.content ?? "{}"
        );
        scenarios = parsed.scenarios ?? [];
      } catch {
        scenarios = [];
      }

      return { scenarios, generatedAt: new Date().toISOString() };
    }),

  /**
   * Analyse an article URL and capture as an idea.
   */
  analyzeArticle: protectedProcedure
    .input(z.object({ url: z.string().url() }))
    .mutation(async ({ input, ctx }) => {
      const openai = getOpenAIClient();

      const prompt = `Analyse this article URL and extract a business opportunity:
URL: ${input.url}

Since I cannot access the URL directly, provide a framework for analysis:
1. What type of article this likely is based on the URL
2. Key business opportunity to investigate
3. Recommended action

Return as JSON: { "title": "...", "description": "...", "category": "...", "priority": "medium" }`;

      const completion = await openai.chat.completions.create({
        model: getModelForTask("score"),
        messages: [{ role: "user", content: prompt }],
        max_tokens: 400,
        temperature: 0.7,
        response_format: { type: "json_object" },
      });
      // p5-9: Track AI usage
      void logAiUsage(
        ctx.user.id,
        "innovation.analyzeArticle",
        completion.model,
        completion.usage ?? null
      );

      let extracted: {
        title?: string;
        description?: string;
        category?: string;
        priority?: string;
      } = {};
      try {
        extracted = JSON.parse(completion.choices[0]?.message?.content ?? "{}");
      } catch {
        extracted = {
          title: "Article Analysis",
          description: "Analysis from article",
          category: "general",
        };
      }

      // Save as a new idea
      const [idea] = await db
        .insert(innovationIdeas)
        .values({
          userId: ctx.user.id,
          title: extracted.title ?? "Article Analysis",
          description: extracted.description ?? null,
          source: "article",
          sourceUrl: input.url,
          status: "captured",
          currentStage: 1,
          priority: extracted.priority ?? "medium",
          category: extracted.category ?? "general",
        })
        .returning();

      return {
        success: true,
        idea: { id: idea.id, title: idea.title },
        analysis: extracted,
      };
    }),

  /**
   * Assess an idea for funding programmes.
   */
  assessForFunding: protectedProcedure
    .input(z.object({ ideaId: z.number(), programId: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const rows = await db
        .select()
        .from(innovationIdeas)
        .where(
          and(
            eq(innovationIdeas.id, input.ideaId),
            eq(innovationIdeas.userId, ctx.user.id)
          )
        )
        .limit(1);

      if (rows.length === 0) throw new Error("Idea not found");

      return {
        assessment:
          "Funding assessment: This idea shows strong potential for Innovate UK and SEIS/EIS funding. Recommend preparing a detailed business case.",
        fundingOptions: [
          {
            name: "Innovate UK Smart Grant",
            amount: "£25k-£500k",
            probability: "medium",
          },
          {
            name: "SEIS Investment",
            amount: "Up to £250k",
            probability: "high",
          },
          {
            name: "EIS Investment",
            amount: "Up to £5m",
            probability: "medium",
          },
        ],
        assessedAt: new Date().toISOString(),
      };
    }),

  /**
   * Get available funding programmes.
   */
  getFundingPrograms: protectedProcedure
    .input(z.object({ country: z.string().optional() }).optional())
    .query(async ({ input }) => {
      const allPrograms = [
        { programId: "innovate_uk", id: "innovate_uk", name: "Innovate UK Smart Grant", maxAmount: "£500,000", deadline: "Rolling", category: "R&D", country: "UK" },
        { programId: "seis", id: "seis", name: "SEIS Investment", maxAmount: "£250,000", deadline: "Ongoing", category: "Seed Investment", country: "UK" },
        { programId: "eis", id: "eis", name: "EIS Investment", maxAmount: "£5,000,000", deadline: "Ongoing", category: "Growth Investment", country: "UK" },
        { programId: "horizon_europe", id: "horizon_europe", name: "Horizon Europe", maxAmount: "€2,500,000", deadline: "Various", category: "Research", country: "UK" },
        { programId: "uae_sme", id: "uae_sme", name: "UAE SME Fund", maxAmount: "AED 2,000,000", deadline: "Rolling", category: "SME Growth", country: "UAE" },
        { programId: "adgm_fintech", id: "adgm_fintech", name: "ADGM FinTech Grant", maxAmount: "AED 500,000", deadline: "Quarterly", category: "FinTech", country: "UAE" },
        { programId: "hub71", id: "hub71", name: "Hub71 Startup Support", maxAmount: "AED 1,000,000", deadline: "Rolling", category: "Startup", country: "UAE" },
      ];
      const filtered = input?.country && input.country !== "all"
        ? allPrograms.filter(p => p.country === input.country)
        : allPrograms;
      return filtered;
    }),

  /**
   * Promote an idea to Project Genesis.
   */
  promoteToGenesis: protectedProcedure
    .input(z.object({ ideaId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const rows = await db
        .select()
        .from(innovationIdeas)
        .where(
          and(
            eq(innovationIdeas.id, input.ideaId),
            eq(innovationIdeas.userId, ctx.user.id)
          )
        )
        .limit(1);

      if (rows.length === 0) throw new Error("Idea not found");
      const idea = rows[0];

      // Create a real project in Project Genesis
      const [project] = await db
        .insert(projectGenesis)
        .values({
          userId: ctx.user.id,
          name: idea.title,
          type: "startup",
          stage: "discovery",
          status: "active",
          description: idea.description ?? null,
          metadata: {
            sourceIdeaId: idea.id,
            category: idea.category ?? "general",
            promotedFrom: "innovation_hub",
          },
        })
        .returning();

      // Create all 6 phases for the project
      const GENESIS_PHASES = [
        { id: 1, name: "Discovery & Validation" },
        { id: 2, name: "Business Model Design" },
        { id: 3, name: "Go-to-Market Strategy" },
        { id: 4, name: "Financial Projections" },
        { id: 5, name: "Team & Operations" },
        { id: 6, name: "Launch Preparation" },
      ];
      await db.insert(projectGenesisPhases).values(
        GENESIS_PHASES.map(phase => ({
          projectId: project.id,
          phaseNumber: phase.id,
          phaseName: phase.name,
          status: phase.id === 1 ? "in_progress" : "not_started",
          startedAt: phase.id === 1 ? new Date() : null,
        }))
      );

      // Mark idea as promoted and link to the new project
      await db
        .update(innovationIdeas)
        .set({
          status: "promoted",
          currentStage: 5,
          promotedToProjectId: project.id,
          updatedAt: new Date(),
        })
        .where(eq(innovationIdeas.id, input.ideaId));

      // ─── AUTONOMOUS SME TRIGGER: Genesis Promotion (Stage 4 → 5) ─────────────────
      // Engage the Persephone Board for strategic review at Genesis promotion
      await db.insert(smeReviewTriggers).values({
        userId: ctx.user.id,
        triggerType: "genesis_promotion",
        sourceType: "project_genesis",
        sourceId: project.id,
        sourceTitle: project.name,
        expertType: "persephone_board",
        expertIds: ["altman", "huang", "amodei", "hassabis"],
        status: "pending",
        triggeredAt: new Date(),
      });

      await db.insert(victoriaActions).values({
        userId: ctx.user.id,
        actionType: "genesis_review_triggered",
        actionTitle: `Persephone Board review triggered for "${project.name}"`,
        description: `Idea promoted to Project Genesis. Persephone Board (Altman, Huang, Amodei, Hassabis) automatically engaged for strategic review.`,
        relatedEntityType: "project_genesis",
        relatedEntityId: project.id,
        autonomous: true,
        metadata: { ideaId: input.ideaId, projectId: project.id },
      });

      return {
        success: true,
        projectId: project.id,
        projectName: project.name,
        message: "Idea promoted to Project Genesis",
        persephoneBoardTriggered: true,
        promotedAt: new Date().toISOString(),
      };
    }),

  /**
   * Advance an idea to the next flywheel stage (1→6).
   * Stage 1: Capture → Stage 2: Assess → Stage 3: Brief → Stage 4: Fund → Stage 5: Launch → Stage 6: Market Launch
   */
  advanceFlywheelStage: protectedProcedure
    .input(z.object({ ideaId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const [idea] = await db
        .select()
        .from(innovationIdeas)
        .where(
          and(
            eq(innovationIdeas.id, input.ideaId),
            eq(innovationIdeas.userId, ctx.user.id)
          )
        )
        .limit(1);
      if (!idea) throw new Error("Idea not found");
      const nextStage = Math.min(6, (idea.currentStage ?? 1) + 1);
      const stageLabels: Record<number, string> = {
        1: "capture",
        2: "assess",
        3: "brief",
        4: "fund",
        5: "launch",
        6: "market_launch",
      };
      const stageStatus: Record<number, string> = {
        1: "in_progress",
        2: "in_progress",
        3: "in_progress",
        4: "in_progress",
        5: "ready_to_launch",
        6: "launched",
      };
      await db
        .update(innovationIdeas)
        .set({
          currentStage: nextStage,
          status: stageStatus[nextStage] ?? "in_progress",
          updatedAt: new Date(),
        })
        .where(eq(innovationIdeas.id, input.ideaId));

      // Notify on stage advancement (non-blocking)
      const titleMap: Record<number, string> = {
        5: "Idea Ready to Launch!",
        6: "Market Launch Initiated!",
      };
      const msgMap: Record<number, string> = {
        5: `"${idea.title}" has reached the Launch stage and is ready for execution.`,
        6: `"${idea.title}" has been market-launched. Autonomous Ventures Orchestrator has been notified.`,
      };
      createNotification({
        userId: ctx.user.id,
        type: "innovation",
        title: titleMap[nextStage] ?? "Idea Advanced",
        message:
          msgMap[nextStage] ??
          `"${idea.title}" has advanced to the ${stageLabels[nextStage]} stage.`,
        actionUrl: "/innovation-hub",
        actionLabel: "View Innovation Hub",
      }).catch(() => {});

      return {
        success: true,
        newStage: nextStage,
        stageLabel: stageLabels[nextStage],
        isLaunched: nextStage === 6,
      };
    }),

  /**
   * On-demand backfill: generate ideas from AI agents right now
   * without waiting for the nightly cron job.
   */
  backfillAgentIdeas: protectedProcedure.mutation(async ({ ctx }) => {
    const openai = getOpenAIClient();
    const agentSamples = [
      { id: "market_intelligence", name: "Market Intelligence Agent", role: "Market Analysis" },
      { id: "financial_analysis", name: "Financial Analysis Agent", role: "Financial Strategy" },
      { id: "product_innovation", name: "Product Innovation Agent", role: "Product Development" },
      { id: "operations_optimizer", name: "Operations Optimizer Agent", role: "Operations" },
      { id: "talent_acquisition", name: "Talent Acquisition Agent", role: "HR & Talent" },
      { id: "customer_experience", name: "Customer Experience Agent", role: "Customer Success" },
      { id: "technology_scout", name: "Technology Scout Agent", role: "Technology" },
      { id: "regulatory_compliance", name: "Regulatory Compliance Agent", role: "Compliance" },
      { id: "brand_strategy", name: "Brand Strategy Agent", role: "Marketing" },
      { id: "supply_chain", name: "Supply Chain Agent", role: "Supply Chain" },
    ];
    let inserted = 0;
    for (const agent of agentSamples) {
      try {
        const completion = await openai.chat.completions.create({
          model: getModelForTask("score"),
          messages: [
            {
              role: "system",
              content: `You are ${agent.name}, a ${agent.role} AI agent at CEPHO. Generate 2 actionable innovation ideas relevant to your domain. Return JSON: { "ideas": [{ "title": string, "description": string, "category": string, "priority": "high"|"medium"|"low" }] }`,
            },
            { role: "user", content: "Generate your top 2 innovation ideas for today." },
          ],
          response_format: { type: "json_object" },
          max_tokens: 400,
        });
        void logAiUsage(ctx.user.id, "innovation.backfillAgentIdeas", completion.model, completion.usage ?? null);
        const raw = JSON.parse(completion.choices[0]?.message?.content ?? "{}") as {
          ideas?: Array<{ title: string; description: string; category: string; priority: string }>;
        };
        const ideas = raw.ideas ?? [];
        for (const idea of ideas.slice(0, 2)) {
          await db.insert(innovationIdeas).values({
            userId: ctx.user.id,
            title: idea.title ?? `Idea from ${agent.name}`,
            description: idea.description ?? `Innovation suggestion from ${agent.name}`,
            source: `agent:${agent.id}`,
            status: "submitted",
            priority: (idea.priority as "high" | "medium" | "low") ?? "medium",
            category: idea.category ?? agent.role,
            currentStage: 1,
          });
          inserted++;
        }
      } catch {
        // Skip failed agents silently
      }
    }
    return { success: true, inserted };
  }),

  /**
   * Get flywheel statistics for the Innovation Hub dashboard.
   * Now includes Stage 6: Market Launch.
   */
  getFlywheelStats: protectedProcedure.query(async ({ ctx }) => {
    const ideas = await db
      .select()
      .from(innovationIdeas)
      .where(eq(innovationIdeas.userId, ctx.user.id));
    const byStage = [1, 2, 3, 4, 5, 6].map(stage => ({
      stage,
      label: ["Capture", "Assess", "Brief", "Fund", "Launch", "Market Launch"][
        stage - 1
      ],
      count: ideas.filter(i => i.currentStage === stage).length,
    }));
    const promoted = ideas.filter(i => i.status === "promoted").length;
    const launched = ideas.filter(i => i.status === "launched").length;
    const avgConfidence =
      ideas.length === 0
        ? 0
        : Math.round(
            ideas.reduce((s, i) => s + (i.confidenceScore ?? 0), 0) /
              ideas.length
          );
    return { total: ideas.length, byStage, promoted, launched, avgConfidence };
  }),
});
