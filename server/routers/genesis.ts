import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { invokeLLM } from "../_core/llm";
import { genesisAssessments } from "../../drizzle/schema";
import { desc, eq } from "drizzle-orm";

export const genesisRouter = router({
  list: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(genesisAssessments).orderBy(desc(genesisAssessments.createdAt)).limit(20);
  }),

  save: protectedProcedure
    .input(z.object({
      id: z.number().optional(),
      ideaTitle: z.string().min(1).max(256),
      ideaSummary: z.string(),
      answers: z.string(), // JSON string
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false, id: null };

      if (input.id) {
        await db.update(genesisAssessments)
          .set({ ideaTitle: input.ideaTitle, ideaSummary: input.ideaSummary, answers: input.answers })
          .where(eq(genesisAssessments.id, input.id));
        return { success: true, id: input.id };
      }

      const result = await db.insert(genesisAssessments).values({
        ideaTitle: input.ideaTitle,
        ideaSummary: input.ideaSummary,
        answers: input.answers,
        stage: "concept",
        aiAnalysis: "{}",
      });
      return { success: true, id: (result as any).insertId ?? null };
    }),

  assess: protectedProcedure
    .input(z.object({
      id: z.number().optional(),
      ideaTitle: z.string().min(1).max(256),
      ideaSummary: z.string(),
      answers: z.string(), // JSON string
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();

      let parsedAnswers: Record<string, Record<number, string>> = {};
      try { parsedAnswers = JSON.parse(input.answers); } catch { /* ignore */ }

      const answersText = Object.entries(parsedAnswers)
        .map(([stage, stageAnswers]) => {
          const lines = Object.values(stageAnswers).filter(Boolean).join("\n- ");
          return `**${stage.toUpperCase()}**\n- ${lines}`;
        })
        .join("\n\n");

      const prompt = `You are Victoria, Chief of Staff AI for Jonathan Rickard, a founder running 6 companies.

Assess the following business idea comprehensively:

**Idea: ${input.ideaTitle}**

${answersText}

Provide a structured assessment covering:
1. **Overall Verdict** — Go / Conditional Go / No Go with a one-sentence rationale
2. **Strengths** — Top 3 genuine strengths
3. **Critical Risks** — Top 3 risks that could kill this
4. **Key Unknowns** — What needs to be validated first
5. **Recommended Next Steps** — Concrete actions for the next 30 days
6. **Fit with Existing Portfolio** — How this relates to Celadon, Celanova, Perfect, Olmack, Boundless

Be direct, specific, and honest. Do not hedge. If the idea is weak, say so.`;

      const result = await invokeLLM({
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1500,
      });

      const analysis = typeof result.choices[0]?.message?.content === "string"
        ? result.choices[0].message.content
        : "Unable to generate assessment.";

      // Save analysis to DB
      if (db) {
        const aiAnalysis = JSON.stringify({ analysis });
        if (input.id) {
          await db.update(genesisAssessments)
            .set({ aiAnalysis, stage: "complete" })
            .where(eq(genesisAssessments.id, input.id));
        } else {
          await db.insert(genesisAssessments).values({
            ideaTitle: input.ideaTitle,
            ideaSummary: input.ideaSummary,
            answers: input.answers,
            stage: "complete",
            aiAnalysis,
          });
        }
      }

      return { analysis };
    }),
});
