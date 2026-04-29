/**
 * SME Intelligence Router
 *
 * Powers the AI SME (Subject Matter Expert) intelligence layer for CEPHO.
 * 323 specialist AI agents continuously scan their domains and surface
 * enhancement ideas that feed into the Innovation Hub for Agent1 assessment.
 *
 * Endpoints:
 *   smeIntelligence.submit          — SME submits an enhancement idea
 *   smeIntelligence.list            — List SME submissions with filters
 *   smeIntelligence.getStats        — Aggregate stats (submissions, verdicts, top experts)
 *   smeIntelligence.assess          — Trigger Agent1 Council assessment for a submission
 *   smeIntelligence.runIntelligenceScan — SME scans its domain and auto-submits ideas
 *   smeIntelligence.runBatchScan    — Run scans for multiple SMEs at once
 *   smeIntelligence.promote         — Promote an assessed submission to Innovation Hub
 */
import { z } from "zod";
import { desc, eq, and, sql } from "drizzle-orm";
import { protectedProcedure, aiProcedure, router } from "../_core/trpc";
import { db } from "../db";
import { invokeLLM } from "../_core/llm";
import { smeIdeaSubmissions, smeActivityLog } from "../../drizzle/schema";
import { buildIdeaAssessmentPrompt } from "../agent1/agentEngine";

// ─── Zod Schemas ─────────────────────────────────────────────────────────────

const SubmitIdeaInput = z.object({
  expertId: z.string().min(1).max(50),
  expertName: z.string().min(1).max(200),
  expertCategory: z.string().min(1).max(100),
  title: z.string().min(5).max(300),
  description: z.string().min(20).max(5000),
  sourceUrl: z.string().url().optional(),
  sourceTitle: z.string().max(300).optional(),
  cephoArea: z.string().max(100).optional(),
  toolName: z.string().max(200).optional(),
  toolUrl: z.string().url().optional(),
  confidenceScore: z.number().min(0).max(100).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

const ListIdeasInput = z.object({
  status: z
    .enum(["pending", "assessed", "approved", "archived", "integrated"])
    .optional(),
  expertId: z.string().optional(),
  expertCategory: z.string().optional(),
  cephoArea: z.string().optional(),
  verdict: z
    .enum(["integrate_now", "explore_further", "archive", "already_covered"])
    .optional(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
});

const RunScanInput = z.object({
  expertId: z.string().min(1).max(50),
  expertName: z.string().min(1).max(200),
  expertCategory: z.string().min(1).max(100),
  expertSpecialty: z.string().min(1).max(300),
  expertBio: z.string().max(1000).optional(),
  maxIdeas: z.number().min(1).max(5).default(3),
});

// ─── Helper: Build SME scan prompt ───────────────────────────────────────────

function buildSmeScanPrompt(
  expertName: string,
  expertCategory: string,
  expertSpecialty: string,
  expertBio: string,
  maxIdeas: number
): string {
  return `You are ${expertName}, an AI Subject Matter Expert in ${expertCategory} with deep expertise in ${expertSpecialty}.
${expertBio ? `Background: ${expertBio}` : ""}

Your mission: Identify ${maxIdeas} specific, actionable enhancement ideas for CEPHO — an AI superlearner platform that helps business leaders make better decisions, manage their day, and continuously improve.

CEPHO's core modules include:
- Agent1 (Chief of Staff AI): daily briefs, decision log, evening reviews, task delegation
- Innovation Hub: idea capture, assessment, and promotion to projects
- AI SME Panel: 323 specialist agents for expert consultation
- Training Regime: daily skill-building exercises
- Digital Twin: autonomous task execution
- Voice Notes: AI-powered voice capture and processing
- Project Genesis: strategic project management

As ${expertName}, draw on your ${expertSpecialty} expertise to identify tools, methodologies, frameworks, or integrations that would make CEPHO significantly more powerful.

Focus on:
1. Specific tools or APIs that CEPHO should integrate (e.g., a specific research database, analytics platform, or AI model)
2. Methodologies from your domain that Agent1 should apply
3. Data sources your domain uses that CEPHO could tap into
4. Workflow improvements specific to your domain expertise

Return a JSON object with this exact structure:
{
  "ideas": [
    {
      "title": "Concise idea title (max 80 chars)",
      "description": "Detailed explanation of what this is, why it matters for CEPHO, and how it would work (150-300 words)",
      "sourceUrl": "URL of a specific article, tool homepage, or research paper supporting this idea (or null)",
      "sourceTitle": "Title of the source (or null)",
      "cephoArea": "Which CEPHO module this enhances: Agent1 | Innovation Hub | AI SMEs | Training | Digital Twin | Voice Notes | Project Genesis | Core Platform",
      "toolName": "Specific tool or framework name (or null)",
      "toolUrl": "Tool homepage URL (or null)",
      "confidenceScore": 85
    }
  ],
  "searchQueries": ["query 1", "query 2"],
  "sourcesScanned": ["domain or URL 1", "domain or URL 2"],
  "summary": "One paragraph summarising what you found and why these ideas matter for CEPHO"
}`.trim();
}

// ─── Helper: Build Agent1 SME assessment prompt ───────────────────────────────

function buildSmeAssessmentPrompt(
  submission: typeof smeIdeaSubmissions.$inferSelect
): string {
  return `You are Agent1, the Chief of Staff for CEPHO. An AI SME agent has submitted an enhancement idea for CEPHO.

SME EXPERT: ${submission.expertName} (${submission.expertCategory})
IDEA TITLE: ${submission.title}
DESCRIPTION: ${submission.description}
${submission.cephoArea ? `TARGET AREA: ${submission.cephoArea}` : ""}
${submission.toolName ? `RECOMMENDED TOOL: ${submission.toolName}${submission.toolUrl ? ` (${submission.toolUrl})` : ""}` : ""}
${submission.sourceUrl ? `SOURCE: ${submission.sourceTitle ?? submission.sourceUrl}` : ""}
CONFIDENCE SCORE: ${submission.confidenceScore ?? "Not provided"}/100

Assess this idea using the Council of Sub-Agents framework. Consider:
- Is this technically feasible for CEPHO's current stack (React 19, Express, tRPC, PostgreSQL)?
- Does it genuinely add value to CEPHO users (business leaders, entrepreneurs)?
- Is it already covered by existing CEPHO features?
- What is the implementation complexity vs. user value ratio?

Return a JSON object with this exact structure:
{
  "council": {
    "ARIA": "Evidence-based assessment: what data supports or refutes this idea?",
    "ABEL": "Key risks, downsides, or implementation challenges",
    "LEX": "Any ethical, privacy, or compliance concerns",
    "SAFI": "What assumptions might be wrong about this idea?",
    "LUNA": "What user need does this address? What emotional/strategic pull does it have?",
    "INDI": "Most practical next step if we proceed",
    "ODIN": "What does CEPHO look like in 12 months with vs without this?"
  },
  "verdict": "integrate_now | explore_further | archive | already_covered",
  "verdictReason": "One clear sentence explaining the verdict",
  "implementationComplexity": "low | medium | high",
  "userValueScore": 85,
  "priorityRank": "critical | high | medium | low",
  "nextStep": "Single most important action in the next 48 hours if proceeding"
}`.trim();
}

// ─── Router ───────────────────────────────────────────────────────────────────

export const smeIntelligenceRouter = router({
  /**
   * Submit an enhancement idea from an AI SME agent.
   * Can be called manually (from AISMEsPage) or programmatically (from runIntelligenceScan).
   */
  submit: protectedProcedure
    .input(SubmitIdeaInput)
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.id;

      const [submissionRow] = await db
        .insert(smeIdeaSubmissions)
        .values({
          userId,
          expertId: input.expertId,
          expertName: input.expertName,
          expertCategory: input.expertCategory,
          title: input.title,
          description: input.description,
          sourceUrl: input.sourceUrl ?? null,
          sourceTitle: input.sourceTitle ?? null,
          cephoArea: input.cephoArea ?? null,
          toolName: input.toolName ?? null,
          toolUrl: input.toolUrl ?? null,
          confidenceScore: input.confidenceScore ?? null,
          status: "pending",
          metadata: input.metadata ?? null,
        })
          .returning();
      const submissionId = submissionRow.id;

      // Log the activity
      await db.insert(smeActivityLog).values({
        userId,
        expertId: input.expertId,
        expertName: input.expertName,
        activityType: "submission",
        summary: `Submitted idea: "${input.title}"`,
        ideasSubmitted: 1,
        ideasApproved: 0,
      });

      return { success: true, submissionId };
    }),

  /**
   * List SME idea submissions with optional filters.
   */
  list: protectedProcedure
    .input(ListIdeasInput)
    .query(async ({ input, ctx }) => {
      const userId = ctx.user.id;

      let query = db
        .select()
        .from(smeIdeaSubmissions)
        .where(eq(smeIdeaSubmissions.userId, userId))
        .orderBy(desc(smeIdeaSubmissions.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      const rows = await query;

      // Apply filters in JS (simpler than building dynamic where clauses)
      const filtered = rows
        .filter(r => !input.status || r.status === input.status)
        .filter(r => !input.expertId || r.expertId === input.expertId)
        .filter(
          r => !input.expertCategory || r.expertCategory === input.expertCategory
        )
        .filter(r => !input.cephoArea || r.cephoArea === input.cephoArea)
        .filter(r => !input.verdict || r.agent1Verdict === input.verdict);

      return {
        submissions: filtered.map(r => ({
          id: r.id,
          expertId: r.expertId,
          expertName: r.expertName,
          expertCategory: r.expertCategory,
          title: r.title,
          description: r.description,
          sourceUrl: r.sourceUrl,
          sourceTitle: r.sourceTitle,
          cephoArea: r.cephoArea,
          toolName: r.toolName,
          toolUrl: r.toolUrl,
          confidenceScore: r.confidenceScore,
          status: r.status,
          agent1Assessment: r.agent1Assessment,
          agent1Verdict: r.agent1Verdict,
          agent1AssessedAt: r.agent1AssessedAt?.toISOString() ?? null,
          promotedToIdeaId: r.promotedToIdeaId,
          createdAt: r.createdAt.toISOString(),
        })),
        total: filtered.length,
      };
    }),

  /**
   * Get aggregate stats for the SME Intelligence Feed.
   */
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;

    const allRows = await db
      .select()
      .from(smeIdeaSubmissions)
      .where(eq(smeIdeaSubmissions.userId, userId));

    const total = allRows.length;
    const pending = allRows.filter(r => r.status === "pending").length;
    const assessed = allRows.filter(r => r.status === "assessed").length;
    const approved = allRows.filter(r => r.status === "approved").length;
    const integrated = allRows.filter(r => r.status === "integrated").length;

    // Verdict breakdown
    const verdicts = {
      integrate_now: allRows.filter(r => r.agent1Verdict === "integrate_now")
        .length,
      explore_further: allRows.filter(
        r => r.agent1Verdict === "explore_further"
      ).length,
      archive: allRows.filter(r => r.agent1Verdict === "archive").length,
      already_covered: allRows.filter(r => r.agent1Verdict === "already_covered")
        .length,
    };

    // Top contributing categories
    const categoryMap: Record<string, number> = {};
    for (const r of allRows) {
      categoryMap[r.expertCategory] =
        (categoryMap[r.expertCategory] ?? 0) + 1;
    }
    const topCategories = Object.entries(categoryMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([category, count]) => ({ category, count }));

    // Top contributing experts
    const expertMap: Record<string, { name: string; count: number }> = {};
    for (const r of allRows) {
      if (!expertMap[r.expertId]) {
        expertMap[r.expertId] = { name: r.expertName, count: 0 };
      }
      expertMap[r.expertId].count += 1;
    }
    const topExperts = Object.entries(expertMap)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5)
      .map(([expertId, { name, count }]) => ({ expertId, name, count }));

    return {
      total,
      pending,
      assessed,
      approved,
      integrated,
      verdicts,
      topCategories,
      topExperts,
    };
  }),

  /**
   * Trigger Agent1 Council assessment for a specific SME submission.
   * Uses the same Council framework as the Innovation Hub assessment.
   */
  assess: aiProcedure
    .input(z.object({ submissionId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.id;

      const [submission] = await db
        .select()
        .from(smeIdeaSubmissions)
        .where(
          and(
            eq(smeIdeaSubmissions.id, input.submissionId),
            eq(smeIdeaSubmissions.userId, userId)
          )
        )
        .limit(1);

      if (!submission) throw new Error("Submission not found.");

      const assessmentPrompt = buildSmeAssessmentPrompt(submission);

      const result = await invokeLLM({
        messages: [
          { role: "system", content: assessmentPrompt },
          {
            role: "user",
            content: "Assess this SME idea submission for CEPHO now.",
          },
        ],
        response_format: { type: "json_object" },
      });

      const raw = String(result.choices[0]?.message?.content ?? "{}");
      let assessment: Record<string, unknown>;
      try {
        assessment = JSON.parse(raw);
      } catch {
        assessment = { error: "Failed to parse assessment", raw };
      }

      const verdict = (assessment.verdict as string) ?? "explore_further";

      // Persist the assessment
      await db
        .update(smeIdeaSubmissions)
        .set({
          status: "assessed",
          agent1Assessment: JSON.stringify(assessment),
          agent1Verdict: verdict,
          agent1AssessedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(smeIdeaSubmissions.id, input.submissionId));

      // Log the assessment activity
      await db.insert(smeActivityLog).values({
        userId,
        expertId: submission.expertId,
        expertName: submission.expertName,
        activityType: "assessment",
        summary: `Agent1 assessed "${submission.title}" → verdict: ${verdict}`,
        ideasSubmitted: 0,
        ideasApproved: verdict === "integrate_now" ? 1 : 0,
      });

      return {
        submissionId: input.submissionId,
        verdict,
        assessment,
      };
    }),

  /**
   * Run an intelligence scan for a specific SME agent.
   * The agent uses its domain expertise to identify 3-5 enhancement ideas for CEPHO,
   * then auto-submits them as pending submissions.
   */
  runIntelligenceScan: aiProcedure
    .input(RunScanInput)
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.id;

      const scanPrompt = buildSmeScanPrompt(
        input.expertName,
        input.expertCategory,
        input.expertSpecialty,
        input.expertBio ?? "",
        input.maxIdeas
      );

      const result = await invokeLLM({
        messages: [
          { role: "system", content: scanPrompt },
          {
            role: "user",
            content: `As ${input.expertName}, identify ${input.maxIdeas} specific enhancement ideas for CEPHO based on your ${input.expertSpecialty} expertise. Focus on actionable, high-value improvements.`,
          },
        ],
        response_format: { type: "json_object" },
      });

      const raw = String(result.choices[0]?.message?.content ?? "{}");
      let scanResult: {
        ideas: Array<{
          title: string;
          description: string;
          sourceUrl?: string;
          sourceTitle?: string;
          cephoArea?: string;
          toolName?: string;
          toolUrl?: string;
          confidenceScore?: number;
        }>;
        searchQueries?: string[];
        sourcesScanned?: string[];
        summary?: string;
      };

      try {
        scanResult = JSON.parse(raw);
      } catch {
        scanResult = { ideas: [] };
      }

      const ideas = scanResult.ideas ?? [];
      const submittedIds: number[] = [];

      // Auto-submit each idea
      for (const idea of ideas) {
        if (!idea.title || !idea.description) continue;

        const [sub] = await db
              .insert(smeIdeaSubmissions)
              .values({
                userId,
                expertId: input.expertId,
                expertName: input.expertName,
                expertCategory: input.expertCategory,
                title: idea.title.slice(0, 300),
                description: idea.description.slice(0, 5000),
                sourceUrl: idea.sourceUrl ?? null,
                sourceTitle: idea.sourceTitle ?? null,
                cephoArea: idea.cephoArea ?? null,
                toolName: idea.toolName ?? null,
                toolUrl: idea.toolUrl ?? null,
                confidenceScore: idea.confidenceScore ?? null,
                status: "pending",
              })
              .returning();

        submittedIds.push(sub.id);
      }

      // Log the scan activity
      await db.insert(smeActivityLog).values({
        userId,
        expertId: input.expertId,
        expertName: input.expertName,
        activityType: "scan",
        summary:
          scanResult.summary ??
          `Scanned ${input.expertCategory} domain and found ${ideas.length} ideas`,
        ideasSubmitted: submittedIds.length,
        ideasApproved: 0,
        searchQueries: scanResult.searchQueries ?? [],
        sourcesScanned: scanResult.sourcesScanned ?? [],
      });

      return {
        expertId: input.expertId,
        expertName: input.expertName,
        ideasFound: ideas.length,
        submittedIds,
        summary: scanResult.summary ?? null,
        searchQueries: scanResult.searchQueries ?? [],
      };
    }),

  /**
   * Run intelligence scans for multiple SME agents in sequence.
   * Useful for batch-scanning a category of experts.
   */
  runBatchScan: aiProcedure
    .input(
      z.object({
        experts: z
          .array(
            z.object({
              expertId: z.string(),
              expertName: z.string(),
              expertCategory: z.string(),
              expertSpecialty: z.string(),
              expertBio: z.string().optional(),
            })
          )
          .min(1)
          .max(10),
        maxIdeasPerExpert: z.number().min(1).max(3).default(2),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.id;
      const results: Array<{
        expertId: string;
        expertName: string;
        ideasFound: number;
        submittedIds: number[];
      }> = [];

      for (const expert of input.experts) {
        const scanPrompt = buildSmeScanPrompt(
          expert.expertName,
          expert.expertCategory,
          expert.expertSpecialty,
          expert.expertBio ?? "",
          input.maxIdeasPerExpert
        );

        try {
          const result = await invokeLLM({
            messages: [
              { role: "system", content: scanPrompt },
              {
                role: "user",
                content: `As ${expert.expertName}, identify ${input.maxIdeasPerExpert} enhancement ideas for CEPHO.`,
              },
            ],
            response_format: { type: "json_object" },
          });

          const raw = String(result.choices[0]?.message?.content ?? "{}");
          const scanResult = JSON.parse(raw) as {
            ideas?: Array<{
              title: string;
              description: string;
              sourceUrl?: string;
              sourceTitle?: string;
              cephoArea?: string;
              toolName?: string;
              toolUrl?: string;
              confidenceScore?: number;
            }>;
            summary?: string;
            searchQueries?: string[];
            sourcesScanned?: string[];
          };

          const ideas = scanResult.ideas ?? [];
          const submittedIds: number[] = [];

          for (const idea of ideas) {
            if (!idea.title || !idea.description) continue;
            const [sub] = await db
              .insert(smeIdeaSubmissions)
              .values({
                userId,
                expertId: expert.expertId,
                expertName: expert.expertName,
                expertCategory: expert.expertCategory,
                title: idea.title.slice(0, 300),
                description: idea.description.slice(0, 5000),
                sourceUrl: idea.sourceUrl ?? null,
                sourceTitle: idea.sourceTitle ?? null,
                cephoArea: idea.cephoArea ?? null,
                toolName: idea.toolName ?? null,
                toolUrl: idea.toolUrl ?? null,
                confidenceScore: idea.confidenceScore ?? null,
                status: "pending",
              })
              .returning();
            submittedIds.push(sub.id);
          }

          await db.insert(smeActivityLog).values({
            userId,
            expertId: expert.expertId,
            expertName: expert.expertName,
            activityType: "scan",
            summary:
              scanResult.summary ??
              `Batch scan: found ${ideas.length} ideas`,
            ideasSubmitted: submittedIds.length,
            ideasApproved: 0,
            searchQueries: scanResult.searchQueries ?? [],
            sourcesScanned: scanResult.sourcesScanned ?? [],
          });

          results.push({
            expertId: expert.expertId,
            expertName: expert.expertName,
            ideasFound: ideas.length,
            submittedIds,
          });
        } catch {
          results.push({
            expertId: expert.expertId,
            expertName: expert.expertName,
            ideasFound: 0,
            submittedIds: [],
          });
        }
      }

      return {
        totalExperts: input.experts.length,
        totalIdeasFound: results.reduce((sum, r) => sum + r.ideasFound, 0),
        results,
      };
    }),

  /**
   * Promote an assessed SME submission to the Innovation Hub as a full idea.
   * Updates the submission status to "integrated" and links to the new idea.
   */
  promote: protectedProcedure
    .input(
      z.object({
        submissionId: z.number(),
        innovationIdeaId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.id;

      await db
        .update(smeIdeaSubmissions)
        .set({
          status: "integrated",
          promotedToIdeaId: input.innovationIdeaId,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(smeIdeaSubmissions.id, input.submissionId),
            eq(smeIdeaSubmissions.userId, userId)
          )
        );

      return { success: true };
    }),

  /**
   * Get recent activity log for SME agents.
   */
  getActivityLog: protectedProcedure
    .input(
      z.object({
        expertId: z.string().optional(),
        limit: z.number().min(1).max(50).default(20),
      })
    )
    .query(async ({ input, ctx }) => {
      const userId = ctx.user.id;

      const rows = await db
        .select()
        .from(smeActivityLog)
        .where(eq(smeActivityLog.userId, userId))
        .orderBy(desc(smeActivityLog.createdAt))
        .limit(input.limit);

      const filtered = rows.filter(
        r => !input.expertId || r.expertId === input.expertId
      );

      return {
        activities: filtered.map(r => ({
          id: r.id,
          expertId: r.expertId,
          expertName: r.expertName,
          activityType: r.activityType,
          summary: r.summary,
          ideasSubmitted: r.ideasSubmitted,
          ideasApproved: r.ideasApproved,
          createdAt: r.createdAt.toISOString(),
        })),
      };
    }),
});
