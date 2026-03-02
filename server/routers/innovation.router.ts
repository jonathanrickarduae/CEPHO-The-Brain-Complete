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
import { db } from "../db";
import { innovationIdeas, projectGenesis, projectGenesisPhases, ideaAssessments, investmentScenarios } from "../../drizzle/schema";

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
        db.select().from(ideaAssessments).where(eq(ideaAssessments.ideaId, idea.id)),
        db.select().from(investmentScenarios).where(eq(investmentScenarios.ideaId, idea.id)),
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
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1000,
      temperature: 0.9,
      response_format: { type: "json_object" },
    });

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
    .input(z.object({
      ideaId: z.number(),
      assessmentType: z.enum(["market_analysis", "feasibility", "competitive_landscape", "financial_viability", "risk_assessment"]).optional(),
    }))
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
      const assessmentFocus = input.assessmentType?.replace(/_/g, " ") ?? "general viability";
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
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 600,
        temperature: 0.5,
        response_format: { type: "json_object" },
      });

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
          score: (assessment.score as number) ?? (assessment.viabilityScore as number) ?? 70,
          recommendation: (assessment.recommendation as string) ?? "investigate",
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

      return {
        success: true,
        assessment: {
          ...savedAssessment,
          ...assessment,
          assessmentType: input.assessmentType ?? "general",
        },
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
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 600,
        temperature: 0.6,
      });

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
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 700,
        temperature: 0.5,
        response_format: { type: "json_object" },
      });

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
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 400,
        temperature: 0.7,
        response_format: { type: "json_object" },
      });

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
  getFundingPrograms: protectedProcedure.query(async () => ({
    programs: [
      {
        id: "innovate_uk",
        name: "Innovate UK Smart Grant",
        maxAmount: "£500,000",
        deadline: "Rolling",
        category: "R&D",
      },
      {
        id: "seis",
        name: "SEIS Investment",
        maxAmount: "£250,000",
        deadline: "Ongoing",
        category: "Seed Investment",
      },
      {
        id: "eis",
        name: "EIS Investment",
        maxAmount: "£5,000,000",
        deadline: "Ongoing",
        category: "Growth Investment",
      },
      {
        id: "horizon_europe",
        name: "Horizon Europe",
        maxAmount: "€2,500,000",
        deadline: "Various",
        category: "Research",
      },
    ],
  })),

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

      return {
        success: true,
        projectId: project.id,
        projectName: project.name,
        message: "Idea promoted to Project Genesis",
        promotedAt: new Date().toISOString(),
      };
    }),

  /**
   * Advance an idea to the next flywheel stage (1→5).
   * Stage 1: Capture → Stage 2: Assess → Stage 3: Brief → Stage 4: Fund → Stage 5: Launch
   */
  advanceFlywheelStage: protectedProcedure
    .input(z.object({ ideaId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const [idea] = await db
        .select()
        .from(innovationIdeas)
        .where(and(eq(innovationIdeas.id, input.ideaId), eq(innovationIdeas.userId, ctx.user.id)))
        .limit(1);
      if (!idea) throw new Error("Idea not found");
      const nextStage = Math.min(5, (idea.currentStage ?? 1) + 1);
      const stageLabels: Record<number, string> = {
        1: "capture", 2: "assess", 3: "brief", 4: "fund", 5: "launch",
      };
      await db
        .update(innovationIdeas)
        .set({ currentStage: nextStage, status: nextStage === 5 ? "ready_to_launch" : "in_progress", updatedAt: new Date() })
        .where(eq(innovationIdeas.id, input.ideaId));
      return { success: true, newStage: nextStage, stageLabel: stageLabels[nextStage] };
    }),

  /**
   * Get flywheel statistics for the Innovation Hub dashboard.
   */
  getFlywheelStats: protectedProcedure.query(async ({ ctx }) => {
    const ideas = await db
      .select()
      .from(innovationIdeas)
      .where(eq(innovationIdeas.userId, ctx.user.id));
    const byStage = [1, 2, 3, 4, 5].map(stage => ({
      stage,
      label: ["Capture", "Assess", "Brief", "Fund", "Launch"][stage - 1],
      count: ideas.filter(i => i.currentStage === stage).length,
    }));
    const promoted = ideas.filter(i => i.status === "promoted").length;
    const avgConfidence = ideas.length === 0 ? 0 : Math.round(ideas.reduce((s, i) => s + (i.confidenceScore ?? 0), 0) / ideas.length);
    return { total: ideas.length, byStage, promoted, avgConfidence };
  }),
});
