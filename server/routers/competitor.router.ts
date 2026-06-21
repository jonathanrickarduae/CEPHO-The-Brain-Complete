/**
 * Competitor Intelligence Router — Phase 6 (p6-2)
 *
 * Provides full CRUD and AI-powered analysis for the competitive intelligence engine:
 * - listCompetitors / getCompetitor / addCompetitor / updateCompetitor / deleteCompetitor
 * - analyzeCompetitor: AI-powered SWOT + threat-level assessment
 * - getFeatureComparison / updateFeatureComparison: Feature parity matrix
 * - getMarketPosition: Latest market position score + history
 * - getThreats / resolveThreeat: Competitive threat management
 * - generateIntelligenceReport: Full AI-written competitive landscape report
 */
import { z } from "zod";
import OpenAI from "openai";
import { router, protectedProcedure } from "../_core/trpc";
import { db } from "../db";
import {
  competitors,
  featureComparison,
  marketPositionHistory,
  competitiveThreats,
} from "../../drizzle/schema";
import { eq, desc, asc } from "drizzle-orm";
import { getModelForTask } from "../utils/modelRouter";
import { logAiUsage } from "./aiCostTracking.router";

function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");
  return new OpenAI({ apiKey });
}

export const competitorRouter = router({
  /**
   * List all tracked competitors
   */
  listCompetitors: protectedProcedure
    .input(
      z.object({
        category: z.string().optional(),
        threatLevel: z.enum(["critical", "high", "medium", "low"]).optional(),
      })
    )
    .query(async ({ input }) => {
      const rows = await db
        .select()
        .from(competitors)
        .orderBy(asc(competitors.name));
      let filtered = rows;
      if (input.category) {
        filtered = filtered.filter(c => c.category === input.category);
      }
      if (input.threatLevel) {
        filtered = filtered.filter(c => c.threatLevel === input.threatLevel);
      }
      return { competitors: filtered, total: filtered.length };
    }),

  /**
   * Get a single competitor by ID
   */
  getCompetitor: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ input }) => {
      const [competitor] = await db
        .select()
        .from(competitors)
        .where(eq(competitors.id, input.id))
        .limit(1);
      if (!competitor) throw new Error("Competitor not found");
      // Fetch related threats
      const threats = await db
        .select()
        .from(competitiveThreats)
        .where(eq(competitiveThreats.competitorId, input.id))
        .orderBy(desc(competitiveThreats.detectedAt))
        .limit(10);
      return { competitor, threats };
    }),

  /**
   * Add a new competitor to track
   */
  addCompetitor: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(200),
        website: z.string().url().optional(),
        description: z.string().optional(),
        category: z.string().optional(),
        pricing: z.string().optional(),
        targetMarket: z.string().optional(),
        threatLevel: z
          .enum(["critical", "high", "medium", "low"])
          .default("medium"),
      })
    )
    .mutation(async ({ input }) => {
      const [competitor] = await db
        .insert(competitors)
        .values({
          name: input.name,
          website: input.website,
          description: input.description,
          category: input.category,
          pricing: input.pricing,
          targetMarket: input.targetMarket,
          threatLevel: input.threatLevel,
        })
        .returning();
      return { success: true, competitor };
    }),

  /**
   * Update competitor details
   */
  updateCompetitor: protectedProcedure
    .input(
      z.object({
        id: z.number().int().positive(),
        name: z.string().min(1).max(200).optional(),
        website: z.string().url().optional(),
        description: z.string().optional(),
        category: z.string().optional(),
        pricing: z.string().optional(),
        targetMarket: z.string().optional(),
        threatLevel: z.enum(["critical", "high", "medium", "low"]).optional(),
        strengths: z.array(z.string()).optional(),
        weaknesses: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...updates } = input;
      const [updated] = await db
        .update(competitors)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(competitors.id, id))
        .returning();
      return { success: true, competitor: updated };
    }),

  /**
   * Delete a competitor
   */
  deleteCompetitor: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      await db.delete(competitors).where(eq(competitors.id, input.id));
      return { success: true };
    }),

  /**
   * AI-powered competitor analysis: SWOT + threat level + strategic recommendations
   */
  analyzeCompetitor: protectedProcedure
    .input(
      z.object({
        competitorId: z.number().int().positive(),
        additionalContext: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [competitor] = await db
        .select()
        .from(competitors)
        .where(eq(competitors.id, input.competitorId))
        .limit(1);
      if (!competitor) throw new Error("Competitor not found");

      const openai = getOpenAIClient();
      const prompt = `You are a world-class competitive intelligence analyst. Analyse the following competitor and provide a comprehensive strategic assessment.

Competitor: ${competitor.name}
Website: ${competitor.website ?? "Unknown"}
Category: ${competitor.category ?? "Unknown"}
Pricing: ${competitor.pricing ?? "Unknown"}
Target Market: ${competitor.targetMarket ?? "Unknown"}
Description: ${competitor.description ?? "No description available"}
${input.additionalContext ? `Additional Context: ${input.additionalContext}` : ""}

Provide a JSON response with:
{
  "strengths": ["strength 1", "strength 2", ...],
  "weaknesses": ["weakness 1", "weakness 2", ...],
  "opportunities": ["opportunity 1", ...],
  "threats": ["threat 1", ...],
  "threatLevel": "critical|high|medium|low",
  "threatReasoning": "explanation of threat level",
  "strategicRecommendations": ["recommendation 1", ...],
  "differentiationOpportunities": ["opportunity 1", ...],
  "summary": "2-3 sentence executive summary"
}`;

      const completion = await openai.chat.completions.create({
        model: getModelForTask("analyse"),
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        max_tokens: 1500,
        temperature: 0.3,
      });

      void logAiUsage(
        ctx.user.id,
        "competitor.analyzeCompetitor",
        completion.model,
        completion.usage
      );

      const analysis = JSON.parse(
        completion.choices[0]?.message?.content ?? "{}"
      ) as {
        strengths?: string[];
        weaknesses?: string[];
        opportunities?: string[];
        threats?: string[];
        threatLevel?: string;
        threatReasoning?: string;
        strategicRecommendations?: string[];
        differentiationOpportunities?: string[];
        summary?: string;
      };

      // Update competitor with analysis results
      await db
        .update(competitors)
        .set({
          strengths: analysis.strengths ?? [],
          weaknesses: analysis.weaknesses ?? [],
          threatLevel: analysis.threatLevel ?? competitor.threatLevel,
          lastAnalyzed: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(competitors.id, input.competitorId));

      // Create a threat entry if threat level is high/critical
      if (
        analysis.threatLevel === "critical" ||
        analysis.threatLevel === "high"
      ) {
        await db.insert(competitiveThreats).values({
          type: "competitor_analysis",
          severity: analysis.threatLevel,
          competitorId: input.competitorId,
          title: `${competitor.name} — ${analysis.threatLevel.toUpperCase()} threat detected`,
          description:
            analysis.threatReasoning ??
            `${competitor.name} poses a ${analysis.threatLevel} threat based on AI analysis.`,
          impact: analysis.threats?.join("; ") ?? null,
          recommendedAction: analysis.strategicRecommendations?.[0] ?? null,
          status: "open",
        });
      }

      return { success: true, analysis };
    }),

  /**
   * Get the feature comparison matrix
   */
  getFeatureComparison: protectedProcedure.query(async () => {
    const features = await db
      .select()
      .from(featureComparison)
      .orderBy(
        asc(featureComparison.category),
        asc(featureComparison.featureName)
      );
    const allCompetitors = await db
      .select({ id: competitors.id, name: competitors.name })
      .from(competitors)
      .orderBy(asc(competitors.name));
    return { features, competitors: allCompetitors };
  }),

  /**
   * Update a feature comparison entry
   */
  updateFeatureComparison: protectedProcedure
    .input(
      z.object({
        id: z.number().int().positive(),
        theBrainStatus: z
          .enum(["implemented", "in_progress", "planned", "not_planned"])
          .optional(),
        theBrainScore: z.number().int().min(0).max(100).optional(),
        competitorData: z.record(z.string(), z.number()).optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...updates } = input;
      const [updated] = await db
        .update(featureComparison)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(featureComparison.id, id))
        .returning();
      return { success: true, feature: updated };
    }),

  /**
   * Get market position history and current score
   */
  getMarketPosition: protectedProcedure
    .input(z.object({ limit: z.number().int().min(1).max(52).default(12) }))
    .query(async ({ input }) => {
      const history = await db
        .select()
        .from(marketPositionHistory)
        .orderBy(desc(marketPositionHistory.date))
        .limit(input.limit);
      const latest = history[0] ?? null;
      return { history: history.reverse(), latest };
    }),

  /**
   * Get all open competitive threats
   */
  getThreats: protectedProcedure
    .input(
      z.object({
        status: z.enum(["open", "in_progress", "resolved"]).optional(),
        severity: z.enum(["critical", "high", "medium", "low"]).optional(),
      })
    )
    .query(async ({ input }) => {
      const rows = await db
        .select()
        .from(competitiveThreats)
        .orderBy(desc(competitiveThreats.detectedAt));
      let filtered = rows;
      if (input.status) {
        filtered = filtered.filter(t => t.status === input.status);
      }
      if (input.severity) {
        filtered = filtered.filter(t => t.severity === input.severity);
      }
      return { threats: filtered, total: filtered.length };
    }),

  /**
   * Resolve a competitive threat
   */
  resolveThreat: protectedProcedure
    .input(
      z.object({
        id: z.number().int().positive(),
        resolution: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const [updated] = await db
        .update(competitiveThreats)
        .set({
          status: "resolved",
          addressedAt: new Date(),
          ...(input.resolution ? { recommendedAction: input.resolution } : {}),
        })
        .where(eq(competitiveThreats.id, input.id))
        .returning();
      return { success: true, threat: updated };
    }),

  /**
   * Generate a full competitive intelligence report
   */
  generateIntelligenceReport: protectedProcedure
    .input(
      z.object({
        focusArea: z
          .enum([
            "full_landscape",
            "feature_gaps",
            "pricing_strategy",
            "market_positioning",
          ])
          .default("full_landscape"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const allCompetitors = await db
        .select()
        .from(competitors)
        .orderBy(asc(competitors.name));
      const openThreats = await db
        .select()
        .from(competitiveThreats)
        .where(eq(competitiveThreats.status, "open"))
        .orderBy(desc(competitiveThreats.detectedAt))
        .limit(10);
      const latestPosition = await db
        .select()
        .from(marketPositionHistory)
        .orderBy(desc(marketPositionHistory.date))
        .limit(1)
        .then(rows => rows[0] ?? null);

      const openai = getOpenAIClient();
      const prompt = `You are a world-class competitive intelligence analyst producing an executive-grade report.

Focus Area: ${input.focusArea.replace(/_/g, " ").toUpperCase()}

Tracked Competitors (${allCompetitors.length}):
${allCompetitors
  .map(
    c =>
      `- ${c.name} (${c.category ?? "unknown"}, ${c.threatLevel ?? "unknown"} threat): ${c.description ?? "No description"}`
  )
  .join("\n")}

Open Threats (${openThreats.length}):
${openThreats
  .map(t => `- [${t.severity?.toUpperCase()}] ${t.title}: ${t.description}`)
  .join("\n")}

Current Market Position Score: ${latestPosition?.overallScore ?? "Not yet calculated"}/100

Write a comprehensive competitive intelligence report in Markdown format covering:
1. Executive Summary (3-4 sentences)
2. Competitive Landscape Overview
3. Key Threats & Opportunities
4. Strategic Recommendations (top 5, prioritised)
5. Immediate Actions Required

Be specific, data-driven, and actionable. Write for a CEO/founder audience.`;

      const completion = await openai.chat.completions.create({
        model: getModelForTask("generate"),
        messages: [{ role: "user", content: prompt }],
        max_tokens: 2000,
        temperature: 0.4,
      });

      void logAiUsage(
        ctx.user.id,
        "competitor.generateIntelligenceReport",
        completion.model,
        completion.usage
      );

      const report =
        completion.choices[0]?.message?.content ??
        "Unable to generate report. Please try again.";

      // Record market position snapshot
      await db.insert(marketPositionHistory).values({
        date: new Date(),
        overallScore: latestPosition?.overallScore ?? 50,
        analysis: report.slice(0, 1000),
        factors: {
          competitorCount: allCompetitors.length,
          openThreats: openThreats.length,
          focusArea: input.focusArea,
        },
      });

      return {
        success: true,
        report,
        generatedAt: new Date().toISOString(),
        competitorCount: allCompetitors.length,
        openThreatCount: openThreats.length,
      };
    }),
});
