/**
 * Scheduled Endpoint Handlers
 * These are called by the Manus Heartbeat platform on a cron schedule.
 * All endpoints live under /api/scheduled/* and authenticate via sdk.authenticateRequest.
 *
 * Three jobs:
 * 1. /api/scheduled/daily-ideas     — 06:00 UTC daily — generate 5 ideas, promote 1
 * 2. /api/scheduled/victoria-brief  — 07:00 UTC daily — Victoria morning brief digest
 * 3. /api/scheduled/weekly-reflect  — 03:00 UTC every Sunday — agent reflection distiller
 */
import type { Express, Request, Response } from "express";
import { sdk } from "./_core/sdk";
import { getDb } from "./db";
import { invokeLLM } from "./_core/llm";
import { innovations, ideaDailyCycles, agentReflections, agentRuns, learningEntries, tasks, projects } from "../drizzle/schema";
import { desc, gte, eq } from "drizzle-orm";
import { notifyOwner } from "./_core/notification";

// ─── Sector sources for daily idea generation ────────────────────────────────
const IDEA_SECTORS = [
  "pharmaceuticals & biotech",
  "clean energy & climate tech",
  "financial services & fintech",
  "AI & enterprise software",
  "healthcare & medtech",
  "logistics & supply chain",
  "education & workforce training",
  "real estate & proptech",
  "defence & security tech",
  "consumer brands & D2C",
];

const IDEA_SOURCES = [
  "emerging academic research",
  "regulatory changes in the UK/EU",
  "market gaps identified from customer complaints",
  "technology convergence opportunities",
  "demographic and societal shifts",
  "competitor failures and market exits",
  "cross-industry pattern transfer",
];

// ─── Handler 1: Daily Idea Generation ────────────────────────────────────────
async function handleDailyIdeas(req: Request, res: Response) {
  try {
    const user = await sdk.authenticateRequest(req);
    if (!user.isCron) return res.status(403).json({ error: "cron-only" });

    const db = await getDb();
    if (!db) return res.status(500).json({ error: "db-unavailable" });

    // Pick 2 random sectors and 2 random sources for today
    const sector1 = IDEA_SECTORS[Math.floor(Math.random() * IDEA_SECTORS.length)];
    const sector2 = IDEA_SECTORS[Math.floor(Math.random() * IDEA_SECTORS.length)];
    const source1 = IDEA_SOURCES[Math.floor(Math.random() * IDEA_SOURCES.length)];
    const source2 = IDEA_SOURCES[Math.floor(Math.random() * IDEA_SOURCES.length)];

    const today = new Date().toISOString().split("T")[0];

    const prompt = `You are the CEPHO Innovation Scout. Generate exactly 5 distinct, high-quality business ideas for today's review.

Focus sectors: ${sector1}, ${sector2}
Idea sources to draw from: ${source1}, ${source2}
Date: ${today}

For each idea, provide:
- TITLE: [concise idea name]
- SUMMARY: [2-3 sentences explaining the opportunity]
- SECTOR: [primary sector]
- SIGNAL: [what market signal or trend this responds to]
- SCORE: [estimated opportunity score 0-100]

Requirements:
- Ideas must be actionable for a UK-based entrepreneur with access to capital
- At least one idea should be an enhancement to an existing CEPHO business
- At least one idea should be a completely new venture
- Ideas should be specific, not generic ("AI for healthcare" is too vague)
- Reference real market dynamics, not hypotheticals

Output exactly 5 ideas in the format above, separated by ---`;

    const response = await invokeLLM({
      messages: [
        { role: "system", content: "You are a world-class innovation scout identifying high-value business opportunities." },
        { role: "user", content: prompt },
      ],
      max_tokens: 2000,
    });

    const content = typeof response.choices[0]?.message?.content === "string"
      ? response.choices[0].message.content
      : "";

    // Parse the 5 ideas from the response
    const ideaBlocks = content.split(/---+/).filter(b => b.trim().length > 50);
    const parsedIdeas: Array<{ title: string; summary: string; sector: string; score: number }> = [];

    for (const block of ideaBlocks.slice(0, 5)) {
      const titleMatch = block.match(/TITLE:\s*(.+)/i);
      const summaryMatch = block.match(/SUMMARY:\s*([\s\S]*?)(?=SECTOR:|SIGNAL:|SCORE:|$)/i);
      const sectorMatch = block.match(/SECTOR:\s*(.+)/i);
      const scoreMatch = block.match(/SCORE:\s*(\d+)/i);

      if (titleMatch) {
        parsedIdeas.push({
          title: titleMatch[1].trim(),
          summary: summaryMatch?.[1]?.trim() ?? "",
          sector: sectorMatch?.[1]?.trim() ?? sector1,
          score: parseInt(scoreMatch?.[1] ?? "70"),
        });
      }
    }

    if (parsedIdeas.length === 0) {
      return res.status(500).json({ error: "no-ideas-parsed" });
    }

    // Insert all 5 ideas with status "captured"
    const insertedIds: number[] = [];
    for (const idea of parsedIdeas) {
      const [result] = await db.insert(innovations).values({
        title: idea.title,
        description: idea.summary,
        category: "other",
        status: "idea",
        flywheelStage: "captured",
        autoGenerated: true,
        assessmentScore: idea.score,
        tags: JSON.stringify(["auto-generated", today, idea.sector]),
      });
      insertedIds.push((result as { insertId: number }).insertId);
    }

    // Pick the highest-scoring idea to promote to assessment
    type IdeaWithId = { title: string; summary: string; sector: string; score: number; dbId: number };
    const ideasWithIds: IdeaWithId[] = parsedIdeas.map((idea, idx) => ({ ...idea, dbId: insertedIds[idx] }));
    const bestIdea = ideasWithIds.reduce((best, idea) =>
      idea.score > best.score ? idea : best,
      ideasWithIds[0]
    );

    // Promote the best idea to "shortlisted" in the flywheel
    await db.update(innovations)
      .set({ flywheelStage: "shortlisted" })
      .where(eq(innovations.id, bestIdea.dbId));

    // Log the daily cycle
    await db.insert(ideaDailyCycles).values({
      cycleDate: today,
      candidateIds: JSON.stringify(insertedIds),
      selectedId: bestIdea.dbId,
      status: "promoted",
      agentNotes: `Generated ${parsedIdeas.length} ideas. Promoted: "${bestIdea.title}" (score: ${bestIdea.score}). Sectors: ${sector1}, ${sector2}`,
    });

    // Log to agent runs
    await db.insert(agentRuns).values({
      agentId: 0,
      prompt: `Daily idea generation for sectors: ${sector1}, ${sector2}`,
      result: `Generated ${parsedIdeas.length} ideas. Best: "${bestIdea.title}"`,
      status: "completed",
    });

    // Notify owner via Telegram
    await notifyOwner({
      title: "Daily Innovation Scout — Ideas Ready",
      content: `Generated ${parsedIdeas.length} ideas today.\n\nPromoted to assessment: **${bestIdea.title}**\n\nSectors: ${sector1}, ${sector2}\n\nView in Innovation Hub.`,
    });

    return res.json({
      ok: true,
      ideasGenerated: parsedIdeas.length,
      promoted: bestIdea.title,
      date: today,
    });
  } catch (err) {
    console.error("[Scheduled/daily-ideas] Error:", err);
    return res.status(500).json({
      error: String(err),
      timestamp: new Date().toISOString(),
    });
  }
}

// ─── Handler 2: Victoria Morning Brief ───────────────────────────────────────
async function handleVictoriaBrief(req: Request, res: Response) {
  try {
    const user = await sdk.authenticateRequest(req);
    if (!user.isCron) return res.status(403).json({ error: "cron-only" });

    const db = await getDb();
    if (!db) return res.status(500).json({ error: "db-unavailable" });

    const [allTasks, allProjects, recentIdeas] = await Promise.all([
      db.select().from(tasks).orderBy(desc(tasks.createdAt)).limit(50),
      db.select().from(projects).limit(20),
      db.select().from(innovations)
        .where(gte(innovations.createdAt, new Date(Date.now() - 24 * 60 * 60 * 1000)))
        .orderBy(desc(innovations.createdAt))
        .limit(10),
    ]);

    const blockedTasks = allTasks.filter(t => t.status === "blocked");
    const overdueTasks = allTasks.filter(t => {
      if (!t.dueDate || t.status === "done") return false;
      return new Date(t.dueDate) < new Date();
    });
    const highPriority = allTasks.filter(t =>
      (t.priority === "high" || t.priority === "critical") && t.status !== "done"
    );

    const briefContext = `
BLOCKED TASKS (${blockedTasks.length}):
${blockedTasks.slice(0, 5).map(t => `- ${t.title}`).join("\n") || "None"}

OVERDUE TASKS (${overdueTasks.length}):
${overdueTasks.slice(0, 5).map(t => `- ${t.title} (due: ${t.dueDate?.toISOString().split("T")[0] ?? "unknown"})`).join("\n") || "None"}

HIGH PRIORITY TASKS (${highPriority.length}):
${highPriority.slice(0, 5).map(t => `- [${t.priority}] ${t.title}`).join("\n") || "None"}

NEW IDEAS (last 24h): ${recentIdeas.length}
${recentIdeas.slice(0, 3).map(i => `- ${i.title}`).join("\n") || "None"}
`;

    const response = await invokeLLM({
      messages: [
        { role: "system", content: "You are Victoria, AI Chief of Staff for Jonathan Rickard at CEPHO. Be direct, data-led, no pleasantries." },
        { role: "user", content: `Generate a morning brief based on this data:\n${briefContext}\n\nProvide: 1) Top 3 actions for today 2) Key risks to address 3) One strategic observation. Maximum 200 words total.` },
      ],
      max_tokens: 400,
    });

    const brief = typeof response.choices[0]?.message?.content === "string"
      ? response.choices[0].message.content
      : "Morning brief unavailable.";

    await notifyOwner({
      title: "Victoria — Morning Brief",
      content: brief,
    });

    await db.insert(learningEntries).values({
      source: "victoria",
      category: "brief",
      insight: `Morning brief: ${blockedTasks.length} blocked, ${overdueTasks.length} overdue, ${recentIdeas.length} new ideas`,
      context: JSON.stringify({ blockedCount: blockedTasks.length, overdueCount: overdueTasks.length }),
      confidence: 90,
    });

    return res.json({ ok: true, brief: brief.slice(0, 200) });
  } catch (err) {
    console.error("[Scheduled/victoria-brief] Error:", err);
    return res.status(500).json({ error: String(err), timestamp: new Date().toISOString() });
  }
}

// ─── Handler 3: Weekly Agent Reflection ──────────────────────────────────────
async function handleWeeklyReflect(req: Request, res: Response) {
  try {
    const user = await sdk.authenticateRequest(req);
    if (!user.isCron) return res.status(403).json({ error: "cron-only" });

    const db = await getDb();
    if (!db) return res.status(500).json({ error: "db-unavailable" });

    const weekStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    const [recentRuns, recentLearnings] = await Promise.all([
      db.select().from(agentRuns)
        .where(gte(agentRuns.createdAt, new Date(weekStart)))
        .orderBy(desc(agentRuns.createdAt))
        .limit(50),
      db.select().from(learningEntries)
        .where(gte(learningEntries.createdAt, new Date(weekStart)))
        .orderBy(desc(learningEntries.createdAt))
        .limit(100),
    ]);

    if (recentRuns.length === 0 && recentLearnings.length === 0) {
      return res.json({ ok: true, skipped: "no-data" });
    }

    const runsContext = recentRuns.map(r =>
      `[${r.status}] ${r.prompt?.slice(0, 150) ?? ""} → ${r.result?.slice(0, 200) ?? ""}`
    ).join("\n");

    const learningsContext = recentLearnings.map(l =>
      `[${l.source}/${l.category}] ${l.insight?.slice(0, 150) ?? ""}`
    ).join("\n");

    const response = await invokeLLM({
      messages: [
        { role: "system", content: "You are a meta-learning system that improves AI agent performance through structured reflection." },
        { role: "user", content: `Analyse this week's agent activity and propose one specific improvement patch.\n\nRUNS:\n${runsContext}\n\nLEARNINGS:\n${learningsContext}\n\nFormat:\nTHINGS THAT WORKED WELL:\n[list]\n\nTHINGS THAT WERE MISSED:\n[list]\n\nPROPOSED PATCH:\n[specific actionable change]` },
      ],
      max_tokens: 1200,
    });

    const content = typeof response.choices[0]?.message?.content === "string"
      ? response.choices[0].message.content
      : "";

    const workedMatch = content.match(/THINGS THAT WORKED WELL:([\s\S]*?)(?=THINGS THAT WERE MISSED|$)/i);
    const missedMatch = content.match(/THINGS THAT WERE MISSED[^:]*:([\s\S]*?)(?=PROPOSED PATCH|$)/i);
    const patchMatch = content.match(/PROPOSED PATCH:([\s\S]*?)$/i);

    const [result] = await db.insert(agentReflections).values({
      weekStart,
      runsAnalysed: recentRuns.length,
      thingsWorked: workedMatch?.[1]?.trim() ?? "",
      thingsMissed: missedMatch?.[1]?.trim() ?? "",
      proposedPatch: patchMatch?.[1]?.trim() ?? content,
      status: "pending",
    });

    const reflectionId = (result as { insertId: number }).insertId;

    await notifyOwner({
      title: "Weekly Agent Reflection — Review Required",
      content: `This week's agent reflection is ready for review.\n\nRuns analysed: ${recentRuns.length}\nLearnings captured: ${recentLearnings.length}\n\nA patch has been proposed. Review and approve in The Brain → Agent Reflections.`,
    });

    return res.json({ ok: true, reflectionId, runsAnalysed: recentRuns.length });
  } catch (err) {
    console.error("[Scheduled/weekly-reflect] Error:", err);
    return res.status(500).json({ error: String(err), timestamp: new Date().toISOString() });
  }
}

// ─── Register all handlers ────────────────────────────────────────────────────
export function registerScheduledHandlers(app: Express) {
  app.post("/api/scheduled/daily-ideas", handleDailyIdeas);
  app.post("/api/scheduled/victoria-brief", handleVictoriaBrief);
  app.post("/api/scheduled/weekly-reflect", handleWeeklyReflect);
}
