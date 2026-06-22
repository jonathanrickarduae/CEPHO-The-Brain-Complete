/**
 * Agent Reflection Loop
 * Weekly self-improvement cycle for all CEPHO agents.
 * Reads agent run logs → proposes patches → routes for approval.
 */
import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { invokeLLM } from "../_core/llm";
import { agentReflections, agentRuns, learningEntries } from "../../drizzle/schema";
import { eq, desc, gte, and } from "drizzle-orm";

// ─── Router ───────────────────────────────────────────────────────────────────
export const agentReflectionRouter = router({
  // List all reflections (pending first)
  list: protectedProcedure
    .input(z.object({
      status: z.enum(["pending", "accepted", "rejected", "all"]).default("all"),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      if (input.status === "all") {
        return db.select().from(agentReflections).orderBy(desc(agentReflections.createdAt)).limit(50);
      }
      return db.select().from(agentReflections)
        .where(eq(agentReflections.status, input.status))
        .orderBy(desc(agentReflections.createdAt))
        .limit(50);
    }),

  // Run the weekly reflection distiller manually (also called by cron)
  runDistiller: protectedProcedure
    .input(z.object({ weekStart: z.string().optional() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false, reflectionId: null };

      const weekStart = input.weekStart ?? new Date(
        Date.now() - 7 * 24 * 60 * 60 * 1000
      ).toISOString().split("T")[0];

      // Pull last 7 days of agent runs and learning entries
      const cutoff = new Date(weekStart);
      const [recentRuns, recentLearnings] = await Promise.all([
        db.select().from(agentRuns)
          .where(gte(agentRuns.createdAt, cutoff))
          .orderBy(desc(agentRuns.createdAt))
          .limit(50),
        db.select().from(learningEntries)
          .where(gte(learningEntries.createdAt, cutoff))
          .orderBy(desc(learningEntries.createdAt))
          .limit(100),
      ]);

      if (recentRuns.length === 0 && recentLearnings.length === 0) {
        return { success: false, reflectionId: null, reason: "No data to analyse" };
      }

      // Build analysis context
      const runsContext = recentRuns.map(r =>
        `[${r.status}] ${r.prompt?.slice(0, 200) ?? "no prompt"} → ${r.result?.slice(0, 300) ?? "no result"}`
      ).join("\n");

      const learningsContext = recentLearnings.map(l =>
        `[${l.source}/${l.category}] ${l.insight?.slice(0, 200) ?? ""}`
      ).join("\n");

      const reflectionPrompt = `You are the CEPHO Agent Improvement System. Analyse the following agent activity from the past week and produce a structured improvement report.

AGENT RUNS (${recentRuns.length} runs):
${runsContext || "No runs recorded"}

LEARNING ENTRIES (${recentLearnings.length} entries):
${learningsContext || "No learnings recorded"}

Produce a structured reflection:

**THINGS THAT WORKED WELL:**
(List 3-5 specific patterns, approaches, or outputs that were effective)

**THINGS THAT WERE MISSED OR COULD IMPROVE:**
(List 3-5 specific gaps, errors, or missed opportunities)

**PROPOSED PATCH:**
(Write a specific, actionable improvement to the agent's behaviour, instructions, or process. Be concrete — this will be reviewed and applied if approved. Format as: "CHANGE: [what to change] → BECAUSE: [why] → EXPECTED IMPROVEMENT: [what gets better]")

**PRIORITY:** high | medium | low

Be specific. Reference actual runs or learnings where possible. Do not be vague.`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: "You are a meta-learning system that improves AI agent performance through structured reflection." },
          { role: "user", content: reflectionPrompt },
        ],
        max_tokens: 1500,
      });

      const content = typeof response.choices[0]?.message?.content === "string"
        ? response.choices[0].message.content
        : "No reflection generated.";

      // Parse sections from the response
      const workedMatch = content.match(/THINGS THAT WORKED WELL:([\s\S]*?)(?=THINGS THAT WERE MISSED|$)/i);
      const missedMatch = content.match(/THINGS THAT WERE MISSED[^:]*:([\s\S]*?)(?=PROPOSED PATCH|$)/i);
      const patchMatch = content.match(/PROPOSED PATCH:([\s\S]*?)(?=PRIORITY|$)/i);

      const thingsWorked = workedMatch?.[1]?.trim() ?? "";
      const thingsMissed = missedMatch?.[1]?.trim() ?? "";
      const proposedPatch = patchMatch?.[1]?.trim() ?? content;

      const [result] = await db.insert(agentReflections).values({
        weekStart,
        runsAnalysed: recentRuns.length,
        thingsWorked,
        thingsMissed,
        proposedPatch,
        status: "pending",
      });

      const reflectionId = (result as { insertId: number }).insertId;

      return { success: true, reflectionId, runsAnalysed: recentRuns.length };
    }),

  // Review a reflection — accept or reject the proposed patch
  review: protectedProcedure
    .input(z.object({
      id: z.number(),
      decision: z.enum(["accepted", "rejected"]),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false };

      await db.update(agentReflections).set({
        status: input.decision,
        reviewedAt: new Date(),
        appliedAt: input.decision === "accepted" ? new Date() : null,
      }).where(eq(agentReflections.id, input.id));

      // If accepted, log to Vault as a verified learning
      if (input.decision === "accepted") {
        const [reflection] = await db.select().from(agentReflections)
          .where(eq(agentReflections.id, input.id));
        if (reflection) {
          await db.insert(learningEntries).values({
            source: "victoria",
            category: "system",
            insight: `Agent patch accepted: ${reflection.proposedPatch?.slice(0, 200) ?? ""}`,
            context: JSON.stringify({ reflectionId: input.id, weekStart: reflection.weekStart }),
            confidence: 95,
            isVerified: 1,
          });
        }
      }

      return { success: true };
    }),

  // Get reflection stats
  stats: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) return { pending: 0, accepted: 0, rejected: 0, total: 0 };
    const all = await db.select().from(agentReflections).limit(500);
    return {
      pending: all.filter(r => r.status === "pending").length,
      accepted: all.filter(r => r.status === "accepted").length,
      rejected: all.filter(r => r.status === "rejected").length,
      total: all.length,
    };
  }),
});
