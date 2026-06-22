import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { innovations, ideaSources, ideaDailyCycles } from "../../drizzle/schema";
import { desc, eq, sql, inArray } from "drizzle-orm";
import { invokeLLM } from "../_core/llm";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SECTORS = [
  "Pharmaceuticals & Life Sciences",
  "Energy & Clean Tech",
  "Financial Services & Fintech",
  "Artificial Intelligence & Automation",
  "Healthcare Technology",
  "Supply Chain & Logistics",
  "Education Technology",
  "Real Estate & PropTech",
  "Cybersecurity",
  "Consumer Behaviour & Retail",
];

const DEFAULT_SOURCES = [
  { name: "Medium — Startup & Business", type: "medium" as const, url: "https://medium.com/tag/startup", sector: "General" },
  { name: "Medium — Artificial Intelligence", type: "medium" as const, url: "https://medium.com/tag/artificial-intelligence", sector: "Artificial Intelligence & Automation" },
  { name: "Medium — Healthcare", type: "medium" as const, url: "https://medium.com/tag/healthcare", sector: "Healthcare Technology" },
  { name: "Medium — Fintech", type: "medium" as const, url: "https://medium.com/tag/fintech", sector: "Financial Services & Fintech" },
  { name: "Medium — Energy", type: "medium" as const, url: "https://medium.com/tag/energy", sector: "Energy & Clean Tech" },
  { name: "Pharma Business Signals", type: "web" as const, url: "https://www.fiercepharma.com/", sector: "Pharmaceuticals & Life Sciences" },
  { name: "TechCrunch — Startups", type: "web" as const, url: "https://techcrunch.com/category/startups/", sector: "General" },
  { name: "MIT Technology Review", type: "web" as const, url: "https://www.technologyreview.com/", sector: "Artificial Intelligence & Automation" },
];

async function runFiveAssessments(title: string, description: string, sourceContext?: string): Promise<{ score: number; data: Record<string, unknown> }> {
  const prompt = `You are CEPHO's Innovation Assessment Engine. Assess this idea across 5 dimensions and return JSON only.

IDEA: "${title}"
DESCRIPTION: "${description}"
${sourceContext ? `SOURCE CONTEXT: ${sourceContext}` : ""}

Return this exact JSON structure:
{
  "marketOpportunity": { "score": 0-100, "summary": "2 sentences", "signals": ["signal1", "signal2"] },
  "strategicFit": { "score": 0-100, "summary": "2 sentences", "fit": ["fit1", "fit2"] },
  "innovationDifferentiation": { "score": 0-100, "summary": "2 sentences", "moat": "description" },
  "executionFeasibility": { "score": 0-100, "summary": "2 sentences", "risks": ["risk1", "risk2"] },
  "revenueModel": { "score": 0-100, "summary": "2 sentences", "models": ["model1", "model2"] },
  "overallScore": 0-100,
  "recommendation": "proceed|pivot|pause|stop",
  "headline": "One compelling sentence about this idea",
  "nextStep": "The single most important next action"
}`;

  const response = await invokeLLM({
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });

  const content = response.choices[0].message.content;
  const data = JSON.parse(typeof content === "string" ? content : JSON.stringify(content));
  return { score: data.overallScore ?? 50, data };
}

async function generateFiveCandidateIdeas(sectors: string[]): Promise<Array<{ title: string; description: string; sector: string; sourceContext: string }>> {
  const sectorList = sectors.slice(0, 5).join(", ");
  const prompt = `You are CEPHO's Idea Generation Agent. Today is ${new Date().toDateString()}.

Generate 5 distinct, high-potential business ideas inspired by current market signals, emerging trends, and opportunities across these sectors: ${sectorList}.

Each idea should be grounded in a real market gap, commercially viable, differentiable, and relevant to a growth-stage entrepreneur or investor.

Return JSON only:
{
  "ideas": [
    {
      "title": "Concise idea name (max 8 words)",
      "description": "2-3 sentence description of the opportunity, problem solved, and market",
      "sector": "sector name",
      "sourceContext": "The specific market signal or trend that inspired this idea"
    }
  ]
}`;

  const response = await invokeLLM({
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });

  const content = response.choices[0].message.content;
  const parsed = JSON.parse(typeof content === "string" ? content : JSON.stringify(content));
  return parsed.ideas ?? [];
}

// ─── Router ───────────────────────────────────────────────────────────────────

export const innovationRouter = router({
  // ── Existing procedures ──────────────────────────────────────────────────
  list: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(innovations).orderBy(desc(innovations.createdAt)).limit(100);
  }),

  create: protectedProcedure
    .input(z.object({
      title: z.string().min(1).max(256),
      description: z.string().optional(),
      projectName: z.string().optional(),
      stage: z.string().optional(),
      category: z.enum(["product", "process", "market", "technology", "partnership", "other"]).optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false };
      await db.insert(innovations).values({
        title: input.title,
        description: input.description ?? "",
        projectName: input.projectName ?? null,
        stage: input.stage ?? "Concept",
        status: "exploring",
        votes: 0,
        category: input.category ?? "other",
        tags: "[]",
        flywheelStage: "captured",
      });
      return { success: true };
    }),

  vote: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false };
      await db.update(innovations)
        .set({ votes: sql`votes + 1` })
        .where(eq(innovations.id, input.id));
      return { success: true };
    }),

  updateStatus: protectedProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["idea", "exploring", "testing", "adopted", "archived"]),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false };
      await db.update(innovations).set({ status: input.status }).where(eq(innovations.id, input.id));
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false };
      await db.delete(innovations).where(eq(innovations.id, input.id));
      return { success: true };
    }),

  // ── Flywheel: Capture from text ──────────────────────────────────────────
  captureFromText: protectedProcedure
    .input(z.object({
      title: z.string().min(1).max(256),
      description: z.string().min(1),
      category: z.enum(["product", "process", "market", "technology", "partnership", "other"]).optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false, id: null };
      const [result] = await db.insert(innovations).values({
        title: input.title,
        description: input.description,
        category: input.category ?? "other",
        status: "exploring",
        votes: 0,
        tags: "[]",
        flywheelStage: "captured",
        autoGenerated: false,
      });
      const id = (result as { insertId: number }).insertId;
      // Auto-assess in background
      runFiveAssessments(input.title, input.description).then(async ({ score, data }) => {
        const db2 = await getDb();
        if (!db2) return;
        await db2.update(innovations).set({
          assessmentScore: score,
          assessmentData: JSON.stringify(data),
          aiInsight: (data as Record<string, unknown>).headline as string ?? "",
          flywheelStage: "assessed",
        }).where(eq(innovations.id, id));
      }).catch(console.error);
      return { success: true, id };
    }),

  // ── Flywheel: Capture from URL ───────────────────────────────────────────
  captureFromUrl: protectedProcedure
    .input(z.object({ url: z.string().url() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false, id: null };
      const extractPrompt = `Extract a business idea from this article URL: ${input.url}
Return JSON only:
{
  "title": "Concise idea name (max 8 words)",
  "description": "2-3 sentence description of the business opportunity",
  "sector": "primary sector",
  "sourceContext": "Key insight that makes this a business opportunity"
}`;
      const response = await invokeLLM({
        messages: [{ role: "user", content: extractPrompt }],
        response_format: { type: "json_object" },
      });
      const content = response.choices[0].message.content;
      const extracted = JSON.parse(typeof content === "string" ? content : JSON.stringify(content));
      const [result] = await db.insert(innovations).values({
        title: extracted.title ?? "Idea from URL",
        description: extracted.description ?? "",
        category: "other",
        status: "exploring",
        votes: 0,
        tags: "[]",
        sourceUrl: input.url,
        sourceName: extracted.sector ?? "Web",
        flywheelStage: "captured",
        autoGenerated: false,
      });
      const id = (result as { insertId: number }).insertId;
      runFiveAssessments(extracted.title, extracted.description, extracted.sourceContext).then(async ({ score, data }) => {
        const db2 = await getDb();
        if (!db2) return;
        await db2.update(innovations).set({
          assessmentScore: score,
          assessmentData: JSON.stringify(data),
          aiInsight: (data as Record<string, unknown>).headline as string ?? "",
          flywheelStage: "assessed",
        }).where(eq(innovations.id, id));
      }).catch(console.error);
      return { success: true, id, title: extracted.title };
    }),

  // ── Flywheel: Capture from Telegram ─────────────────────────────────────
  captureFromTelegram: publicProcedure
    .input(z.object({
      text: z.string().min(1),
      chatId: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false, id: null };
      const structurePrompt = `A user sent this message via Telegram as a business idea or story: "${input.text}"
Extract and structure it as a business idea. Return JSON only:
{
  "title": "Concise idea name (max 8 words)",
  "description": "2-3 sentence structured description of the opportunity",
  "category": "product|process|market|technology|partnership|other"
}`;
      const response = await invokeLLM({
        messages: [{ role: "user", content: structurePrompt }],
        response_format: { type: "json_object" },
      });
      const content = response.choices[0].message.content;
      const structured = JSON.parse(typeof content === "string" ? content : JSON.stringify(content));
      const [result] = await db.insert(innovations).values({
        title: structured.title ?? input.text.slice(0, 100),
        description: structured.description ?? input.text,
        category: structured.category ?? "other",
        status: "exploring",
        votes: 0,
        tags: "[]",
        sourceName: "Telegram",
        flywheelStage: "captured",
        autoGenerated: false,
      });
      const id = (result as { insertId: number }).insertId;
      runFiveAssessments(structured.title, structured.description).then(async ({ score, data }) => {
        const db2 = await getDb();
        if (!db2) return;
        await db2.update(innovations).set({
          assessmentScore: score,
          assessmentData: JSON.stringify(data),
          aiInsight: (data as Record<string, unknown>).headline as string ?? "",
          flywheelStage: "assessed",
        }).where(eq(innovations.id, id));
      }).catch(console.error);
      return { success: true, id, title: structured.title };
    }),

  // ── Flywheel: Daily idea generation (called by cron at 06:00 UTC) ────────
  generateDaily: protectedProcedure
    .mutation(async () => {
      const db = await getDb();
      if (!db) return { success: false, cycleId: null };
      const today = new Date().toISOString().slice(0, 10);
      const existing = await db.select().from(ideaDailyCycles)
        .where(eq(ideaDailyCycles.cycleDate, today)).limit(1);
      if (existing.length > 0) {
        return { success: true, cycleId: existing[0].id, alreadyRan: true };
      }
      const [cycleResult] = await db.insert(ideaDailyCycles).values({
        cycleDate: today,
        candidateIds: "[]",
        status: "generating",
      });
      const cycleId = (cycleResult as { insertId: number }).insertId;
      const shuffled = [...SECTORS].sort(() => Math.random() - 0.5);
      const selectedSectors = shuffled.slice(0, 5);
      const candidates = await generateFiveCandidateIdeas(selectedSectors);
      const insertedIds: number[] = [];
      for (const candidate of candidates) {
        const { score, data } = await runFiveAssessments(candidate.title, candidate.description, candidate.sourceContext);
        const [r] = await db.insert(innovations).values({
          title: candidate.title,
          description: candidate.description,
          category: "other",
          status: "idea",
          votes: 0,
          tags: "[]",
          sourceName: `Daily Agent — ${candidate.sector}`,
          flywheelStage: "assessed",
          autoGenerated: true,
          dailyCycleId: cycleId,
          assessmentScore: score,
          assessmentData: JSON.stringify(data),
          aiInsight: (data as Record<string, unknown>).headline as string ?? "",
        });
        insertedIds.push((r as { insertId: number }).insertId);
      }
      const allInserted = await db.select().from(innovations)
        .where(inArray(innovations.id, insertedIds));
      const best = allInserted.reduce((a, b) =>
        (a.assessmentScore ?? 0) > (b.assessmentScore ?? 0) ? a : b
      );
      await db.update(ideaDailyCycles).set({
        candidateIds: JSON.stringify(insertedIds),
        selectedId: best.id,
        status: "selected",
      }).where(eq(ideaDailyCycles.id, cycleId));
      await db.update(innovations).set({ flywheelStage: "shortlisted" })
        .where(eq(innovations.id, best.id));
      return { success: true, cycleId, selectedId: best.id, candidateCount: insertedIds.length };
    }),

  // ── Flywheel: Promote selected idea into full flywheel ───────────────────
  promoteToFlywheel: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false };
      await db.update(innovations).set({
        flywheelStage: "promoted",
        status: "exploring",
      }).where(eq(innovations.id, input.id));
      return { success: true };
    }),

  // ── Daily cycle: get today's cycle ───────────────────────────────────────
  getTodayCycle: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) return null;
    const today = new Date().toISOString().slice(0, 10);
    const cycles = await db.select().from(ideaDailyCycles)
      .where(eq(ideaDailyCycles.cycleDate, today)).limit(1);
    if (cycles.length === 0) return null;
    const cycle = cycles[0];
    const candidateIds: number[] = JSON.parse(cycle.candidateIds ?? "[]");
    if (candidateIds.length === 0) return { cycle, candidates: [] };
    const candidates = await db.select().from(innovations)
      .where(inArray(innovations.id, candidateIds));
    return { cycle, candidates };
  }),

  // ── Idea Sources management ───────────────────────────────────────────────
  listSources: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    const sources = await db.select().from(ideaSources).orderBy(desc(ideaSources.createdAt));
    if (sources.length === 0) {
      for (const s of DEFAULT_SOURCES) {
        await db.insert(ideaSources).values(s).catch(() => {});
      }
      return db.select().from(ideaSources).orderBy(desc(ideaSources.createdAt));
    }
    return sources;
  }),

  createSource: protectedProcedure
    .input(z.object({
      name: z.string().min(1).max(128),
      type: z.enum(["rss", "web", "medium", "telegram", "manual"]),
      url: z.string().url().optional(),
      sector: z.string().min(1).max(128),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false };
      await db.insert(ideaSources).values(input);
      return { success: true };
    }),

  toggleSource: protectedProcedure
    .input(z.object({ id: z.number(), active: z.boolean() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false };
      await db.update(ideaSources).set({ active: input.active }).where(eq(ideaSources.id, input.id));
      return { success: true };
    }),

  // ── Re-assess an idea ─────────────────────────────────────────────────────
  reassess: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false };
      const [idea] = await db.select().from(innovations).where(eq(innovations.id, input.id));
      if (!idea) return { success: false };
      const { score, data } = await runFiveAssessments(idea.title, idea.description ?? "");
      await db.update(innovations).set({
        assessmentScore: score,
        assessmentData: JSON.stringify(data),
        aiInsight: (data as Record<string, unknown>).headline as string ?? "",
        flywheelStage: "assessed",
      }).where(eq(innovations.id, input.id));
      return { success: true, score, data };
    }),
});
