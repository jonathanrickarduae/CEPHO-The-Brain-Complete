/**
 * Scheduled Endpoint Handlers
 * These are called by the Manus Heartbeat platform on a cron schedule.
 * All endpoints live under /api/scheduled/* and authenticate via sdk.authenticateRequest.
 *
 * Four jobs:
 * 1. /api/scheduled/daily-ideas     — 06:00 UTC daily — generate 5 ideas, promote 1
 * 2. /api/scheduled/victoria-brief  — 07:00 UTC daily — Victoria morning brief digest
 * 3. /api/scheduled/weekly-reflect  — 03:00 UTC every Sunday — agent reflection distiller
 * 4. /api/scheduled/agent-ideas     — triggered by Manus cron agent after web browsing
 */
import type { Express, Request, Response } from "express";
import { sdk } from "./_core/sdk";
import { getDb } from "./db";
import { invokeLLM } from "./_core/llm";
import { innovations, ideaDailyCycles, agentReflections, agentRuns, learningEntries, tasks, projects } from "../drizzle/schema";
import { desc, gte, eq } from "drizzle-orm";
import { notifyOwner } from "./_core/notification";

// ─── Telegram direct-send helper ─────────────────────────────────────────────
// Sends a message directly to the owner's Telegram chat.
// Falls back silently if the bot token or chat ID is not configured.
async function sendTelegramMessage(text: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_OWNER_CHAT_ID;
  if (!token || !chatId) {
    console.warn("[Telegram] TELEGRAM_BOT_TOKEN or TELEGRAM_OWNER_CHAT_ID not set — skipping direct send");
    return;
  }
  // Telegram max message length is 4096 chars — split if needed
  const MAX_LEN = 4000;
  const chunks: string[] = [];
  let remaining = text;
  while (remaining.length > 0) {
    if (remaining.length <= MAX_LEN) {
      chunks.push(remaining);
      break;
    }
    const splitAt = remaining.lastIndexOf("\n", MAX_LEN);
    const cutAt = splitAt > MAX_LEN / 2 ? splitAt : MAX_LEN;
    chunks.push(remaining.slice(0, cutAt));
    remaining = remaining.slice(cutAt).trimStart();
  }
  for (const chunk of chunks) {
    try {
      const resp = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text: chunk, parse_mode: "Markdown" }),
      });
      if (!resp.ok) {
        const detail = await resp.text().catch(() => "");
        console.warn(`[Telegram] sendMessage failed (${resp.status}): ${detail}`);
      }
    } catch (err) {
      console.warn("[Telegram] sendMessage error:", err);
    }
  }
}

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

    type IdeaWithId = { title: string; summary: string; sector: string; score: number; dbId: number };
    const ideasWithIds: IdeaWithId[] = parsedIdeas.map((idea, idx) => ({ ...idea, dbId: insertedIds[idx] }));
    const bestIdea = ideasWithIds.reduce((best, idea) =>
      idea.score > best.score ? idea : best,
      ideasWithIds[0]
    );

    await db.update(innovations)
      .set({ flywheelStage: "shortlisted" })
      .where(eq(innovations.id, bestIdea.dbId));

    await db.insert(ideaDailyCycles).values({
      cycleDate: today,
      candidateIds: JSON.stringify(insertedIds),
      selectedId: bestIdea.dbId,
      status: "promoted",
      agentNotes: `Generated ${parsedIdeas.length} ideas. Promoted: "${bestIdea.title}" (score: ${bestIdea.score}). Sectors: ${sector1}, ${sector2}`,
    });

    await db.insert(agentRuns).values({
      agentId: 0,
      prompt: `Daily idea generation for sectors: ${sector1}, ${sector2}`,
      result: `Generated ${parsedIdeas.length} ideas. Best: "${bestIdea.title}"`,
      status: "completed",
    });

    const notifyMsg = `💡 *Daily Innovation Scout — Ideas Ready*\n\nGenerated ${parsedIdeas.length} ideas today.\n\n🏆 *Promoted:* ${bestIdea.title}\n\n📊 Sectors: ${sector1}, ${sector2}\n\nView in Innovation Hub.`;
    await sendTelegramMessage(notifyMsg);
    await notifyOwner({
      title: "Daily Innovation Scout — Ideas Ready",
      content: notifyMsg,
    }).catch(err => console.warn("[notifyOwner] daily-ideas:", err));

    return res.json({
      ok: true,
      ideasGenerated: parsedIdeas.length,
      promoted: bestIdea.title,
      date: today,
    });
  } catch (err) {
    console.error("[Scheduled/daily-ideas] Error:", err);
    return res.status(500).json({ error: String(err), timestamp: new Date().toISOString() });
  }
}

// ─── MCP helper (module-level) ───────────────────────────────────────────────
import { exec as _exec } from "child_process";
import { promisify as _promisify } from "util";
const _execAsync = _promisify(_exec);
async function callMCP(server: string, toolName: string, input: Record<string, unknown>) {
  try {
    const inputJson = JSON.stringify(input).replace(/'/g, "'\\''" );
    const { stdout } = await _execAsync(
      `manus-mcp-cli tool call ${toolName} --server ${server} --input '${inputJson}'`,
      { timeout: 20000 }
    );
    const lines = stdout.trim().split("\n");
    for (let i = lines.length - 1; i >= 0; i--) {
      const l = lines[i].trim();
      if (l.startsWith("{") || l.startsWith("[")) return JSON.parse(l);
    }
    return JSON.parse(stdout.trim());
  } catch { return null; }
}

// ─── Handler 2: Victoria Daily Brief ─────────────────────────────────────────
// Six pillars: UK news, today's meetings, overnight emails, tasks/actions,
// projects status, and overnight ideas.
// Delivered directly to Telegram (primary) + Manus notification service (secondary).
// DB is optional — brief fires even if database is unavailable.
async function handleVictoriaBrief(req: Request, res: Response) {
  try {
    const user = await sdk.authenticateRequest(req);
    if (!user.isCron) return res.status(403).json({ error: "cron-only" });

    const now = new Date();
    const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0);
    const todayEnd   = new Date(now); todayEnd.setHours(23, 59, 59, 999);
    const yesterday  = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // ── Pillar 1: BBC UK News headlines ───────────────────────────────────────
    let newsSection = "";
    try {
      const bbcRss = await fetch("https://feeds.bbci.co.uk/news/rss.xml", { signal: AbortSignal.timeout(8000) });
      const xml = await bbcRss.text();
      const headlines = Array.from(xml.matchAll(/<title><!\[CDATA\[([^\]]+)\]\]><\/title>/g))
        .map(m => m[1]).filter(h => !h.includes("BBC")).slice(0, 3);
      if (headlines.length) {
        newsSection = `📰 *UK NEWS*\n${headlines.map((h, i) => `${i + 1}. ${h}`).join("\n")}`;
      }
    } catch { newsSection = "📰 *UK NEWS*\nUnavailable"; }

    // ── Pillar 2: Today's meetings from Outlook ────────────────────────────────
    let meetingsSection = "";
    const calResult = await callMCP("outlook-calendar", "outlook_calendar_search_events", {
      time_min: todayStart.toISOString(),
      time_max: todayEnd.toISOString(),
      max_results: 10,
    });
    const meetings = calResult?.events ?? calResult?.value ?? [];
    if (meetings.length > 0) {
      const meetingLines = meetings.slice(0, 5).map((m: any) => {
        const start = m.start?.dateTime
          ? new Date(m.start.dateTime).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Dubai" })
          : "All day";
        return `• ${start} — ${m.subject ?? m.summary ?? "Meeting"}`;
      }).join("\n");
      meetingsSection = `📅 *TODAY'S MEETINGS (${meetings.length})*\n${meetingLines}`;
    } else {
      meetingsSection = "📅 *TODAY'S MEETINGS*\nNo meetings scheduled";
    }

    // ── Pillar 3: Overnight emails ────────────────────────────────────────────
    let emailsSection = "";
    const gmailResult = await callMCP("gmail", "gmail_search_messages", {
      q: `in:inbox is:unread after:${Math.floor(yesterday.getTime() / 1000)}`,
      max_results: 20,
    });
    const emails = gmailResult?.messages ?? [];
    const emailCount = gmailResult?.resultSizeEstimate ?? emails.length;
    if (emails.length > 0) {
      const emailLines = emails.slice(0, 5).map((e: any) => {
        const from = e.from ?? e.payload?.headers?.find((h: any) => h.name === "From")?.value ?? "Unknown";
        const subject = e.subject ?? e.payload?.headers?.find((h: any) => h.name === "Subject")?.value ?? "(no subject)";
        return `• ${from.split("<")[0].trim()}: ${subject.slice(0, 60)}`;
      }).join("\n");
      emailsSection = `📧 *OVERNIGHT EMAILS (${emailCount} unread)*\n${emailLines}${emailCount > 5 ? `\n  ...and ${emailCount - 5} more` : ""}`;
    } else {
      emailsSection = "📧 *OVERNIGHT EMAILS*\nInbox clear";
    }

    // ── Pillars 4–6: Tasks, Projects, Ideas (DB — graceful degradation) ───────
    let tasksSection = "🎯 *TASKS*\nNo urgent items";
    let projectsSection = "🚦 *PROJECTS*\nNo data";
    let ideasSection = "";
    let allTasksCount = 0;
    let todayDueCount = 0;
    let overdueCount = 0;
    let needsApprovalCount = 0;
    let redProjectNames: string[] = [];
    let recentIdeasCount = 0;

    const db = await getDb();
    if (db) {
      try {
        const [allTasks, allProjects, recentIdeas] = await Promise.all([
          db.select().from(tasks).orderBy(desc(tasks.createdAt)).limit(100),
          db.select().from(projects).limit(20),
          db.select().from(innovations)
            .where(gte(innovations.createdAt, yesterday))
            .orderBy(desc(innovations.createdAt)).limit(10),
        ]);
        allTasksCount = allTasks.length;

        const todayDue = allTasks.filter(t => {
          if (!t.dueDate || t.status === "done") return false;
          const d = new Date(t.dueDate);
          return d >= todayStart && d <= todayEnd;
        });
        const overdueTasks = allTasks.filter(t => {
          if (!t.dueDate || t.status === "done") return false;
          return new Date(t.dueDate) < todayStart;
        });
        const needsApproval = allTasks.filter(t => t.status === "blocked");
        const completedYesterday = allTasks.filter(t => {
          if (t.status !== "done") return false;
          return t.updatedAt && new Date(t.updatedAt) >= yesterday;
        });
        const highPriority = allTasks.filter(t =>
          (t.priority === "high" || t.priority === "critical") && t.status !== "done"
        ).slice(0, 5);

        todayDueCount = todayDue.length;
        overdueCount = overdueTasks.length;
        needsApprovalCount = needsApproval.length;

        tasksSection = [
          completedYesterday.length > 0
            ? `✅ *COMPLETED (last 24h)*\n${completedYesterday.slice(0, 3).map(t => `• ${t.title}`).join("\n")}`
            : null,
          needsApproval.length > 0
            ? `⚠️ *NEEDS YOUR APPROVAL (${needsApproval.length})*\n${needsApproval.slice(0, 3).map(t => `• ${t.title}`).join("\n")}`
            : null,
          todayDue.length > 0
            ? `🎯 *DUE TODAY (${todayDue.length})*\n${todayDue.slice(0, 3).map(t => `• [${t.priority ?? "med"}] ${t.title}`).join("\n")}`
            : null,
          overdueTasks.length > 0
            ? `🔴 *OVERDUE (${overdueTasks.length})*\n${overdueTasks.slice(0, 3).map(t => `• ${t.title}`).join("\n")}`
            : null,
          highPriority.length > 0
            ? `⚡ *HIGH PRIORITY*\n${highPriority.map(t => `• ${t.title}`).join("\n")}`
            : null,
        ].filter(Boolean).join("\n\n") || "🎯 *TASKS*\nNo urgent items";

        const redProjects = allProjects.filter(p => p.status === "red");
        const amberProjects = allProjects.filter(p => p.status === "amber");
        redProjectNames = redProjects.map(p => p.name);
        projectsSection = (redProjects.length > 0 || amberProjects.length > 0)
          ? `🚦 *PROJECTS*\n${redProjects.map(p => `🔴 ${p.name}`).join("\n")}${redProjects.length && amberProjects.length ? "\n" : ""}${amberProjects.map(p => `🟡 ${p.name}`).join("\n")}`
          : `🚦 *PROJECTS*\nAll ${allProjects.length} projects on track`;

        recentIdeasCount = recentIdeas.length;
        ideasSection = recentIdeas.length > 0
          ? `💡 *OVERNIGHT IDEAS (${recentIdeas.length})*\n${recentIdeas.slice(0, 3).map(i => `• ${i.title}`).join("\n")}`
          : "";
      } catch (dbErr) {
        console.warn("[victoria-brief] DB query error (non-fatal):", dbErr);
        tasksSection = "🎯 *TASKS*\nDatabase temporarily unavailable";
        projectsSection = "🚦 *PROJECTS*\nDatabase temporarily unavailable";
      }
    } else {
      console.warn("[victoria-brief] DB unavailable — brief will still be sent without task/project data");
      tasksSection = "🎯 *TASKS*\nDatabase not connected — check Render env vars";
      projectsSection = "🚦 *PROJECTS*\nDatabase not connected";
    }

    // ── Victoria's synthesis — top 3 actions ──────────────────────────────────
    const contextForLLM = `Date: ${now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: "Asia/Dubai" })}
Meetings today: ${meetings.length}
Unread emails: ${emailCount}
Due today: ${todayDueCount}, Overdue: ${overdueCount}, Needs approval: ${needsApprovalCount}
Red projects: ${redProjectNames.join(", ") || "none"}
New ideas overnight: ${recentIdeasCount}`;

    let synthesis = "";
    try {
      const llmResp = await invokeLLM({
        messages: [
          { role: "system", content: "You are Victoria, AI Chief of Staff for Jonathan Rickard at CEPHO. You are direct, sharp, and action-oriented. No pleasantries. Jonathan is based in UAE." },
          { role: "user", content: `Based on this data, give Jonathan his top 3 actions for today and one strategic observation. Maximum 80 words. Be specific.\n\n${contextForLLM}` },
        ],
        max_tokens: 200,
      });
      synthesis = typeof llmResp.choices[0]?.message?.content === "string"
        ? llmResp.choices[0].message.content
        : "";
    } catch (llmErr) {
      console.warn("[victoria-brief] LLM synthesis failed (non-fatal):", llmErr);
    }

    // ── Assemble the full brief ────────────────────────────────────────────────
    const dateStr = now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: "Asia/Dubai" });
    const sections = [
      `🌅 *VICTORIA — DAILY BRIEF*\n_${dateStr}_`,
      synthesis ? `🧠 *VICTORIA'S TAKE*\n${synthesis}` : null,
      newsSection,
      meetingsSection,
      emailsSection,
      tasksSection,
      projectsSection,
      ideasSection,
    ].filter(Boolean).join("\n\n─────────────────\n\n");

    // ── Deliver: Telegram (primary) + Manus notification (secondary) ──────────
    await sendTelegramMessage(sections);
    await notifyOwner({
      title: `Victoria — Daily Brief — ${dateStr}`,
      content: sections,
    }).catch(err => console.warn("[notifyOwner] victoria-brief:", err));

    // ── Log to DB if available ─────────────────────────────────────────────────
    if (db) {
      try {
        await db.insert(learningEntries).values({
          source: "victoria",
          category: "brief",
          insight: `Daily brief: ${meetings.length} meetings, ${emailCount} emails, ${todayDueCount} due today, ${recentIdeasCount} new ideas`,
          context: JSON.stringify({ meetings: meetings.length, emails: emailCount, due: todayDueCount, overdue: overdueCount }),
          confidence: 90,
        });
      } catch (logErr) {
        console.warn("[victoria-brief] Failed to log learning entry (non-fatal):", logErr);
      }
    }

    return res.json({ ok: true, pillars: { news: !!newsSection, meetings: meetings.length, emails: emailCount, tasks: allTasksCount, ideas: recentIdeasCount } });
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
    const reflectMsg = `🔍 *Weekly Agent Reflection — Review Required*\n\nRuns analysed: ${recentRuns.length}\nLearnings captured: ${recentLearnings.length}\n\nA patch has been proposed. Review and approve in The Brain → Agent Reflections.`;
    await sendTelegramMessage(reflectMsg);
    await notifyOwner({
      title: "Weekly Agent Reflection — Review Required",
      content: reflectMsg,
    }).catch(err => console.warn("[notifyOwner] weekly-reflect:", err));
    return res.json({ ok: true, reflectionId, runsAnalysed: recentRuns.length });
  } catch (err) {
    console.error("[Scheduled/weekly-reflect] Error:", err);
    return res.status(500).json({ error: String(err), timestamp: new Date().toISOString() });
  }
}

// ─── Handler 4: Agent-submitted ideas (from Manus agent cron browsing session) ─
// The Manus agent cron browses Medium + sector feeds, then POSTs here with its findings.
// Auth: the agent must include the CEPHO_AGENT_SECRET header (set in Render env vars).
async function handleAgentIdeas(req: Request, res: Response) {
  try {
    const secret = req.headers["x-agent-secret"];
    const expectedSecret = process.env.CEPHO_AGENT_SECRET || "cepho-agent-2026";
    if (secret !== expectedSecret) {
      return res.status(403).json({ error: "invalid-agent-secret" });
    }
    const db = await getDb();
    const { ideas } = req.body as {
      ideas: Array<{
        title: string;
        summary: string;
        sector: string;
        sourceUrl?: string;
        sourceTitle?: string;
      }>;
    };
    if (!Array.isArray(ideas) || ideas.length === 0) {
      return res.status(400).json({ error: "ideas array required" });
    }
    const today = new Date().toISOString().split("T")[0];
    const inserted: number[] = [];
    if (db) {
      for (const idea of ideas.slice(0, 5)) {
        const scorePrompt = `Score this business idea on 5 dimensions (0-10 each):
Title: ${idea.title}
Summary: ${idea.summary}
Sector: ${idea.sector}
Source: ${idea.sourceTitle || "agent research"}
Dimensions:
1. Market size & opportunity
2. Feasibility (can CEPHO build/deliver this?)
3. Strategic alignment with CEPHO's mission
4. Timing (is the market ready now?)
5. Competitive differentiation
Return JSON only: { "marketSize": 0-10, "feasibility": 0-10, "strategicFit": 0-10, "timing": 0-10, "differentiation": 0-10, "overallScore": 0-100, "recommendation": "promote|hold|discard", "rationale": "one sentence" }`;
        let scores = { marketSize: 7, feasibility: 7, strategicFit: 7, timing: 7, differentiation: 7, overallScore: 70, recommendation: "hold", rationale: "Agent-sourced idea pending manual review" };
        try {
          const scoreResp = await invokeLLM({
            messages: [{ role: "user", content: scorePrompt }],
            response_format: { type: "json_object" } as any,
          });
          const raw = scoreResp.choices[0]?.message?.content;
          if (raw && typeof raw === "string") scores = { ...scores, ...JSON.parse(raw) };
        } catch (_) { /* use defaults */ }
        try {
          const [row] = await db.insert(innovations).values({
            title: idea.title,
            description: idea.summary,
            category: "other" as const,
            status: "idea" as const,
            flywheelStage: scores.recommendation === "promote" ? "shortlisted" as const : "captured" as const,
            assessmentScore: scores.overallScore,
            assessmentData: JSON.stringify(scores),
            tags: JSON.stringify([idea.sector, "agent-sourced", today]),
            sourceUrl: idea.sourceUrl || null,
            sourceName: idea.sourceTitle || "agent research",
            autoGenerated: true,
            aiInsight: `Sector: ${idea.sector}. ${scores.rationale}`,
          }).$returningId();
          inserted.push(row.id);
        } catch (dbErr) {
          console.warn("[agent-ideas] DB insert failed for idea:", idea.title, dbErr);
        }
      }
    } else {
      console.warn("[agent-ideas] DB unavailable — ideas received via Telegram only");
    }
    const ideasList = ideas.slice(0, 5).map((idea, i) => `${i + 1}. *${idea.title}* (${idea.sector})`).join("\n");
    const agentMsg = `🤖 *Agent Ideas In — ${today}*\n\nThe daily browsing agent found ${inserted.length} ideas from real sources:\n\n${ideasList}\n\nCheck Innovation Hub → Flywheel.`;
    await sendTelegramMessage(agentMsg);
    await notifyOwner({
      title: `🤖 Agent Ideas In — ${today}`,
      content: agentMsg,
    }).catch(err => console.warn("[notifyOwner] agent-ideas:", err));
    return res.json({ ok: true, inserted: inserted.length, ids: inserted });
  } catch (err) {
    console.error("[Scheduled/agent-ideas] Error:", err);
    return res.status(500).json({ error: String(err), timestamp: new Date().toISOString() });
  }
}

// ─── Register all handlers ────────────────────────────────────────────────────
export function registerScheduledHandlers(app: Express) {
  app.post("/api/scheduled/daily-ideas", handleDailyIdeas);
  app.post("/api/scheduled/victoria-brief", handleVictoriaBrief);
  app.post("/api/scheduled/weekly-reflect", handleWeeklyReflect);
  app.post("/api/scheduled/agent-ideas", handleAgentIdeas);
}
