import { getModelForTask } from "../utils/modelRouter";
import { logAiUsage } from "./aiCostTracking.router";
/**
 * Business Plan Review Router — Real Implementation
 *
 * AI-powered business plan analysis with expert team review,
 * version management, and section scoring.
 */
import { z } from "zod";
import { desc, eq, and } from "drizzle-orm";
import OpenAI from "openai";
import { protectedProcedure, router } from "../_core/trpc";
import { db } from "../db";
import {
  businessPlanReviewVersions,
  collaborativeReviewSessions,
  collaborativeReviewComments,
  collaborativeReviewParticipants,
} from "../../drizzle/schema";

function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");
  return new OpenAI({ apiKey });
}

const EXPERT_PROFILES: Record<
  string,
  { name: string; role: string; focus: string }
> = {
  "strategic-advisor": {
    name: "Dr. Sarah Chen",
    role: "Strategic Advisor",
    focus: "market positioning and competitive strategy",
  },
  "financial-analyst": {
    name: "Marcus Thompson",
    role: "Financial Analyst",
    focus: "financial projections and unit economics",
  },
  "marketing-expert": {
    name: "Elena Rodriguez",
    role: "Marketing Expert",
    focus: "go-to-market strategy and customer acquisition",
  },
  "operations-specialist": {
    name: "James Okafor",
    role: "Operations Specialist",
    focus: "operational efficiency and scalability",
  },
  "legal-counsel": {
    name: "Priya Patel",
    role: "Legal Counsel",
    focus: "regulatory compliance and risk management",
  },
};

// ─── Business Plan Review Router ─────────────────────────────────────────────
export const businessPlanReviewRouter = router({
  /**
   * Get all versions for a project.
   */
  getVersions: protectedProcedure
    .input(z.object({ projectName: z.string() }))
    .query(async ({ input, ctx }) => {
      const rows = await db
        .select()
        .from(businessPlanReviewVersions)
        .where(
          and(
            eq(businessPlanReviewVersions.userId, ctx.user.id),
            eq(businessPlanReviewVersions.projectName, input.projectName)
          )
        )
        .orderBy(desc(businessPlanReviewVersions.createdAt));

      return rows.map(v => ({
        id: v.id,
        projectName: v.projectName,
        versionNumber: v.versionNumber,
        versionLabel: v.versionLabel,
        overallScore: v.overallScore,
        sectionScores: v.sectionScores,
        expertTeam: v.expertTeam,
        teamSelectionMode: v.teamSelectionMode,
        createdAt: v.createdAt.toISOString(),
      }));
    }),

  /**
   * Get a specific version by ID.
   */
  getVersionById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const rows = await db
        .select()
        .from(businessPlanReviewVersions)
        .where(
          and(
            eq(businessPlanReviewVersions.id, input.id),
            eq(businessPlanReviewVersions.userId, ctx.user.id)
          )
        )
        .limit(1);

      if (rows.length === 0) return null;
      return rows[0];
    }),

  /**
   * Analyze a section with all selected experts using OpenAI.
   */
  analyzeSectionWithAllExperts: protectedProcedure
    .input(
      z.object({
        sectionId: z.string(),
        sectionTitle: z.string(),
        sectionContent: z.string(),
        projectName: z.string(),
        expertIds: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const openai = getOpenAIClient();
      const experts = input.expertIds?.length
        ? input.expertIds.map(
            id =>
              EXPERT_PROFILES[id] ?? {
                name: id,
                role: "Expert",
                focus: "general analysis",
              }
          )
        : Object.values(EXPERT_PROFILES);

      const analyses = await Promise.all(
        experts.map(async expert => {
          const completion = await openai.chat.completions.create({
            model: getModelForTask("generate"),
            messages: [
              {
                role: "system",
                content: `You are ${expert.name}, a ${expert.role} specializing in ${expert.focus}. 
Provide a concise, expert analysis of the business plan section provided. 
Be specific, actionable, and professional. Score the section 0-100.`,
              },
              {
                role: "user",
                content: `Analyze this section of "${input.projectName}":

## ${input.sectionTitle}
${input.sectionContent}

Provide:
1. Score (0-100)
2. Key strengths (2-3 points)
3. Areas for improvement (2-3 points)
4. Specific recommendations (2-3 actionable items)

Format as JSON: { "score": number, "strengths": string[], "improvements": string[], "recommendations": string[] }`,
              },
            ],
            max_tokens: 600,
            temperature: 0.7,
          });
          // p5-9: Track AI usage
          void logAiUsage(ctx.user.id, "businessPlanReview.analyzeSectionWithAllExperts", completion.model, completion.usage ?? null);

          const content = completion.choices[0]?.message?.content ?? "{}";
          let analysis: Record<string, unknown> = {};
          try {
            analysis = JSON.parse(
              content.replace(/```json\n?|\n?```/g, "").trim()
            );
          } catch {
            analysis = {
              score: 70,
              strengths: ["Good foundation"],
              improvements: ["Needs more detail"],
              recommendations: ["Expand this section"],
            };
          }

          return {
            expertId: expert.role.toLowerCase().replace(/ /g, "-"),
            expertName: expert.name,
            expertRole: expert.role,
            ...analysis,
          };
        })
      );

      const avgScore = Math.round(
        analyses.reduce(
          (sum, a) =>
            sum + (((a as Record<string, unknown>).score as number) ?? 70),
          0
        ) / analyses.length
      );

      return {
        sectionId: input.sectionId,
        sectionTitle: input.sectionTitle,
        overallScore: avgScore,
        expertAnalyses: analyses,
        analyzedAt: new Date().toISOString(),
      };
    }),

  /**
   * Select an expert team (Chief of Staff AI recommendation or manual).
   */
  selectExpertTeam: protectedProcedure
    .input(
      z.object({
        projectName: z.string(),
        mode: z.enum(["chief-of-staff", "manual"]),
        manualExpertIds: z.array(z.string()).optional(),
        businessContext: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      let selectedExperts: string[];

      if (input.mode === "chief-of-staff") {
        // AI selects the best team based on context
        const openai = getOpenAIClient();
        const completion = await openai.chat.completions.create({
          model: getModelForTask("generate"),
          messages: [
            {
              role: "user",
              content: `For a business plan review of "${input.projectName}"${input.businessContext ? ` (${input.businessContext})` : ""}, 
select the 3-4 most relevant expert IDs from: ${Object.keys(EXPERT_PROFILES).join(", ")}.
Return only a JSON array of IDs: ["id1", "id2", ...]`,
            },
          ],
          max_tokens: 100,
          temperature: 0.3,
        });
        // p5-9: Track AI usage
        void logAiUsage(ctx.user.id, "businessPlanReview.selectExpertTeam", completion.model, completion.usage ?? null);
        const content = completion.choices[0]?.message?.content ?? "[]";
        try {
          selectedExperts = JSON.parse(
            content.replace(/```json\n?|\n?```/g, "").trim()
          );
        } catch {
          selectedExperts = [
            "strategic-advisor",
            "financial-analyst",
            "marketing-expert",
          ];
        }
      } else {
        selectedExperts = input.manualExpertIds ?? Object.keys(EXPERT_PROFILES);
      }

      return {
        selectedExperts,
        experts: selectedExperts.map(id => ({
          id,
          ...EXPERT_PROFILES[id],
        })),
        mode: input.mode,
      };
    }),

  /**
   * Save a review version to the database.
   */
  saveVersion: protectedProcedure
    .input(
      z.object({
        projectName: z.string(),
        versionLabel: z.string().optional(),
        overallScore: z.number().optional(),
        sectionScores: z.record(z.string(), z.number()).optional(),
        reviewData: z.unknown().optional(),
        expertTeam: z.array(z.string()).optional(),
        teamSelectionMode: z.string().optional(),
        businessPlanContent: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Get next version number
      const existing = await db
        .select()
        .from(businessPlanReviewVersions)
        .where(
          and(
            eq(businessPlanReviewVersions.userId, ctx.user.id),
            eq(businessPlanReviewVersions.projectName, input.projectName)
          )
        );

      const versionNumber = existing.length + 1;

      const [version] = await db
        .insert(businessPlanReviewVersions)
        .values({
          userId: ctx.user.id,
          projectName: input.projectName,
          versionNumber,
          versionLabel: input.versionLabel ?? `Version ${versionNumber}`,
          overallScore: input.overallScore ?? null,
          sectionScores: input.sectionScores ?? null,
          reviewData: input.reviewData ?? null,
          expertTeam: input.expertTeam ?? null,
          teamSelectionMode: input.teamSelectionMode ?? null,
          businessPlanContent: input.businessPlanContent ?? null,
        })
        .returning();

      return {
        id: version.id,
        versionNumber: version.versionNumber,
        versionLabel: version.versionLabel,
        createdAt: version.createdAt.toISOString(),
      };
    }),

  /**
   * Ask a follow-up question to a specific expert about their insight.
   */
  askFollowUp: protectedProcedure
    .input(
      z.object({
        reviewVersionId: z.number(),
        sectionId: z.string().optional(),
        expertId: z.string(),
        question: z.string().min(1),
        originalInsight: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { default: OpenAI } = await import("openai");
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      // Match by key (e.g. 'strategic-advisor') or by name
      const expert =
        EXPERT_PROFILES[input.expertId] ??
        Object.values(EXPERT_PROFILES).find(
          e =>
            e.name.toLowerCase().replace(/[^a-z]/g, "") ===
            input.expertId.toLowerCase().replace(/[^a-z]/g, "")
        ) ??
        Object.values(EXPERT_PROFILES)[0];

      const prompt = `You are ${expert.name}, ${expert.role} specializing in ${expert.focus}.

Original insight: ${input.originalInsight ?? "Not provided"}

Follow-up question: ${input.question}

Provide a concise, expert response (2-3 sentences).`;

      const completion = await openai.chat.completions.create({
        model: getModelForTask("generate"),
        messages: [{ role: "user", content: prompt }],
        max_tokens: 200,
        temperature: 0.7,
      });
      // p5-9: Track AI usage
      void logAiUsage(ctx.user.id, "businessPlanReview.askFollowUp", completion.model, completion.usage ?? null);

      return {
        answer:
          completion.choices[0]?.message?.content ??
          "I'd be happy to elaborate on that point further.",
        expertName: expert.name,
        expertRole: expert.role,
      };
    }),

  /**
   * Generate a full report as markdown.
   */
  generateReportMarkdown: protectedProcedure
    .input(
      z.object({
        projectName: z.string(),
        templateId: z.string().optional(),
        overallScore: z.number().optional(),
        sectionReviews: z.array(z.any()).optional(),
        expertTeam: z.array(z.any()).optional(),
        teamSelectionReasoning: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const date = new Date().toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      const sections = (input.sectionReviews ?? [])
        .map((s: Record<string, unknown>) => {
          const sectionTitle = String(
            s.sectionTitle ?? s.sectionId ?? "Section"
          );
          const score = s.overallScore ? `**Score: ${s.overallScore}/10**` : "";
          const insights = Array.isArray(s.expertInsights)
            ? s.expertInsights
                .map(
                  (i: Record<string, unknown>) =>
                    `- **${i.expertName}**: ${i.insight}`
                )
                .join("\n")
            : "";
          return `## ${sectionTitle}\n${score}\n\n${insights}`;
        })
        .join("\n\n");

      const experts = (input.expertTeam ?? [])
        .map((e: Record<string, unknown>) => `- ${e.name} (${e.role})`)
        .join("\n");

      const markdown = `# Business Plan Review: ${input.projectName}\n\n**Date:** ${date}\n**Overall Score:** ${input.overallScore ?? "N/A"}/10\n\n## Expert Team\n${experts || "Standard expert panel"}\n\n${input.teamSelectionReasoning ? `**Team Selection Reasoning:** ${input.teamSelectionReasoning}\n\n` : ""}---\n\n${sections}\n\n---\n*Generated by CEPHO The Brain*`;

      return { markdown, generatedAt: new Date().toISOString() };
    }),
});

// ─── Collaborative Review Router ─────────────────────────────────────────────
export const collaborativeReviewRouter = router({
  /**
   * Get all sessions for the current user.
   */
  getSessions: protectedProcedure
    .input(z.object({ projectName: z.string().optional() }))
    .query(async ({ input, ctx }) => {
      const rows = await db
        .select()
        .from(collaborativeReviewSessions)
        .where(eq(collaborativeReviewSessions.ownerId, ctx.user.id))
        .orderBy(desc(collaborativeReviewSessions.createdAt));

      const filtered = input.projectName
        ? rows.filter(r => r.projectName === input.projectName)
        : rows;

      return filtered.map(s => ({
        id: s.id,
        projectName: s.projectName,
        templateId: s.templateId,
        status: s.status,
        createdAt: s.createdAt.toISOString(),
        updatedAt: s.updatedAt.toISOString(),
      }));
    }),

  /**
   * Get a specific session by ID.
   */
  getSession: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const rows = await db
        .select()
        .from(collaborativeReviewSessions)
        .where(eq(collaborativeReviewSessions.id, input.id))
        .limit(1);

      if (rows.length === 0) return null;
      const session = rows[0];

      const comments = await db
        .select()
        .from(collaborativeReviewComments)
        .where(eq(collaborativeReviewComments.sessionId, input.id))
        .orderBy(collaborativeReviewComments.createdAt);

      return {
        id: session.id,
        projectName: session.projectName,
        templateId: session.templateId,
        status: session.status,
        reviewData: session.reviewData,
        comments: comments.map(c => ({
          id: c.id,
          sectionId: c.sectionId,
          comment: c.comment,
          status: c.status,
          createdAt: c.createdAt.toISOString(),
        })),
        createdAt: session.createdAt.toISOString(),
      };
    }),

  /**
   * Create a new collaborative review session.
   */
  createSession: protectedProcedure
    .input(
      z.object({
        projectName: z.string().min(1),
        templateId: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const [session] = await db
        .insert(collaborativeReviewSessions)
        .values({
          ownerId: ctx.user.id,
          projectName: input.projectName,
          templateId: input.templateId ?? null,
          status: "active",
        })
        .returning();

      return {
        id: session.id,
        projectName: session.projectName,
        status: session.status,
        createdAt: session.createdAt.toISOString(),
      };
    }),

  /**
   * Invite a participant to a review session.
   * Records the invitation in the database.
   */
  inviteParticipant: protectedProcedure
    .input(
      z.object({
        sessionId: z.number(),
        email: z.string().email(),
        role: z.string().default("reviewer"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Find the user by email if they exist in the system
      const { users } = await import("../../drizzle/schema");
      const [invitedUser] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, input.email))
        .limit(1);
      if (invitedUser) {
        // Record the participant invitation
        await db
          .insert(collaborativeReviewParticipants)
          .values({
            sessionId: input.sessionId,
            userId: invitedUser.id,
            role: input.role,
            invitedBy: ctx.user.id,
          })
          .onConflictDoNothing();
      }
      // In production: send email invitation via SendGrid/SES
      return { success: true, invited: input.email, userFound: !!invitedUser };
    }),

  /**
   * Add a comment to a session.
   */
  addComment: protectedProcedure
    .input(
      z.object({
        sessionId: z.number(),
        sectionId: z.string(),
        comment: z.string().min(1),
        parentCommentId: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const [comment] = await db
        .insert(collaborativeReviewComments)
        .values({
          sessionId: input.sessionId,
          userId: ctx.user.id,
          sectionId: input.sectionId,
          comment: input.comment,
          parentCommentId: input.parentCommentId ?? null,
          status: "open",
        })
        .returning();

      return {
        id: comment.id,
        sectionId: comment.sectionId,
        comment: comment.comment,
        createdAt: comment.createdAt.toISOString(),
      };
    }),
});
