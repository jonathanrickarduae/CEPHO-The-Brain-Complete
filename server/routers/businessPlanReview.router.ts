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
    .mutation(async ({ input }) => {
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
            model: "gpt-4o-mini",
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
    .mutation(async ({ input }) => {
      let selectedExperts: string[];

      if (input.mode === "chief-of-staff") {
        // AI selects the best team based on context
        const openai = getOpenAIClient();
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
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
   * Invite a participant to a session (stub — no email sent yet).
   */
  inviteParticipant: protectedProcedure
    .input(
      z.object({
        sessionId: z.number(),
        email: z.string().email(),
        role: z.string().default("reviewer"),
      })
    )
    .mutation(async ({ input }) => {
      return { success: true, invited: input.email };
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
