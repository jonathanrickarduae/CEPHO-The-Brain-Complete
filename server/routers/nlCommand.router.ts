/**
 * Natural Language Command Router — AUTO-03
 *
 * Powers the Cmd+K command bar with AI-driven natural language execution.
 * Users can type free-form commands like:
 *   "Create a task to review the Q2 report by Friday"
 *   "Schedule a meeting with the marketing team next Tuesday"
 *   "Show me my top 3 overdue tasks"
 *   "Set my KPI for monthly revenue to £50,000"
 *
 * The router uses GPT-4.1-mini to parse intent and extract structured
 * parameters, then executes the appropriate action.
 */

import { z } from "zod";
import OpenAI from "openai";
import { protectedProcedure, router } from "../_core/trpc";
import { db } from "../db";
import {
  tasks,
  projects,
  kpis,
  okrs,
  okrKeyResults,
  notifications,
  activityFeed,
} from "../../drizzle/schema";
import { eq, and, desc, or, ilike } from "drizzle-orm";
import { logger } from "../utils/logger";
const log = logger.module("nlCommand");
import { eventBus } from "../services/eventBus";

function getOpenAI(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");
  return new OpenAI({ apiKey });
}

// ─── Intent Classification ────────────────────────────────────────────────────

const INTENT_SYSTEM_PROMPT = `You are CEPHO's natural language command parser. 
Parse the user's command and return a structured JSON object.

Supported intents:
- create_task: Create a new task
- update_task: Update an existing task
- list_tasks: List/search tasks
- create_project: Create a new project
- list_projects: List/search projects
- create_kpi: Create or update a KPI
- create_okr: Create an OKR with key results
- list_kpis: List KPIs
- navigate: Navigate to a page
- search: Search across all content
- unknown: Cannot parse the command

Return ONLY valid JSON in this format:
{
  "intent": "<intent>",
  "confidence": <0.0-1.0>,
  "params": {
    // intent-specific parameters
  },
  "humanResponse": "<friendly confirmation message>"
}

For create_task params: { title, description?, priority?, dueDate? (ISO string), assignedTo? }
For update_task params: { taskId?, taskTitle?, newStatus?, newPriority?, newTitle? }
For list_tasks params: { status?, priority?, limit? }
For create_project params: { name, description?, priority? }
For create_kpi params: { name, targetValue?, unit?, category? }
For create_okr params: { objective, quarter, keyResults: [{title, targetValue?, unit?}] }
For navigate params: { page: "dashboard"|"tasks"|"projects"|"kpis"|"agents"|"settings"|"evening-review"|"morning-brief" }
For search params: { query }`;

interface ParsedCommand {
  intent: string;
  confidence: number;
  params: Record<string, unknown>;
  humanResponse: string;
}

async function parseCommand(command: string): Promise<ParsedCommand> {
  const openai = getOpenAI();
  const response = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      { role: "system", content: INTENT_SYSTEM_PROMPT },
      { role: "user", content: command },
    ],
    response_format: { type: "json_object" },
    temperature: 0.1,
    max_tokens: 500,
  });

  const content = response.choices[0]?.message?.content ?? "{}";
  return JSON.parse(content) as ParsedCommand;
}

// ─── Command Executors ────────────────────────────────────────────────────────

async function executeCreateTask(
  userId: number,
  params: Record<string, unknown>
): Promise<{ success: boolean; data?: unknown; message: string }> {
  const title = String(params.title ?? "Untitled Task");
  const description = params.description
    ? String(params.description)
    : undefined;
  const priority = params.priority ? String(params.priority) : "medium";
  const dueDate = params.dueDate ? new Date(String(params.dueDate)) : undefined;

  const [task] = await db
    .insert(tasks)
    .values({
      userId,
      title,
      description,
      status: "pending",
      priority,
      dueDate,
      metadata: { source: "nl-command" },
    })
    .returning();

  await eventBus.publish({
    type: "agent.task_completed",
    userId,
    payload: {
      agentKey: "nl-command",
      taskTitle: title,
      output: "Task created via natural language command",
    },
    timestamp: new Date(),
    source: "nl-command",
  });

  return {
    success: true,
    data: task,
    message: `Task "${title}" created successfully.`,
  };
}

async function executeListTasks(
  userId: number,
  params: Record<string, unknown>
): Promise<{ success: boolean; data?: unknown; message: string }> {
  const status = params.status ? String(params.status) : undefined;
  const priority = params.priority ? String(params.priority) : undefined;
  const limit = params.limit ? Number(params.limit) : 5;

  const conditions = [eq(tasks.userId, userId)];
  if (status) conditions.push(eq(tasks.status, status));
  if (priority) conditions.push(eq(tasks.priority, priority));

  const results = await db
    .select()
    .from(tasks)
    .where(and(...conditions))
    .orderBy(desc(tasks.createdAt))
    .limit(limit);

  return {
    success: true,
    data: results,
    message: `Found ${results.length} task${results.length === 1 ? "" : "s"}.`,
  };
}

async function executeCreateKpi(
  userId: number,
  params: Record<string, unknown>
): Promise<{ success: boolean; data?: unknown; message: string }> {
  const name = String(params.name ?? "New KPI");
  const targetValue = params.targetValue
    ? String(params.targetValue)
    : undefined;
  const unit = params.unit ? String(params.unit) : undefined;
  const category = params.category ? String(params.category) : "operational";

  const [kpi] = await db
    .insert(kpis)
    .values({
      userId,
      name,
      targetValue,
      unit,
      category,
      status: "on_track",
      trend: "stable",
    })
    .returning();

  return {
    success: true,
    data: kpi,
    message: `KPI "${name}" created${targetValue ? ` with target ${targetValue}${unit ? ` ${unit}` : ""}` : ""}.`,
  };
}

async function executeCreateOkr(
  userId: number,
  params: Record<string, unknown>
): Promise<{ success: boolean; data?: unknown; message: string }> {
  const objective = String(params.objective ?? "New Objective");
  const quarter = String(params.quarter ?? "Q2-2026");
  const keyResultsRaw =
    (params.keyResults as Array<Record<string, unknown>>) ?? [];

  const [okr] = await db
    .insert(okrs)
    .values({
      userId,
      objective,
      quarter,
      status: "active",
      overallProgress: 0,
      suggestedByAgent: "nl-command",
    })
    .returning();

  const insertedKrs = [];
  for (const kr of keyResultsRaw) {
    const [keyResult] = await db
      .insert(okrKeyResults)
      .values({
        okrId: okr.id,
        userId,
        title: String(kr.title ?? "Key Result"),
        targetValue: kr.targetValue ? String(kr.targetValue) : undefined,
        unit: kr.unit ? String(kr.unit) : undefined,
        progress: 0,
        status: "active",
      })
      .returning();
    insertedKrs.push(keyResult);
  }

  return {
    success: true,
    data: { okr, keyResults: insertedKrs },
    message: `OKR "${objective}" created for ${quarter} with ${insertedKrs.length} key result${insertedKrs.length === 1 ? "" : "s"}.`,
  };
}

// ─── Router ───────────────────────────────────────────────────────────────────

export const nlCommandRouter = router({
  /**
   * Execute a natural language command.
   * Returns the parsed intent, execution result, and a human-readable response.
   */
  execute: protectedProcedure
    .input(
      z.object({
        command: z.string().min(1).max(500),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.id;
      const { command } = input;

      log.info(`[NLCommand] User ${userId}: "${command}"`);

      // Parse intent
      const parsed = await parseCommand(command);

      if (parsed.confidence < 0.5 || parsed.intent === "unknown") {
        return {
          intent: "unknown",
          confidence: parsed.confidence,
          success: false,
          message:
            'I couldn\'t understand that command. Try something like: "Create a task to review the Q2 report" or "Show my overdue tasks".',
          data: null,
          navigateTo: null,
        };
      }

      let result: { success: boolean; data?: unknown; message: string } = {
        success: false,
        message: "Command not yet supported.",
      };
      let navigateTo: string | null = null;

      switch (parsed.intent) {
        case "create_task":
          result = await executeCreateTask(userId, parsed.params);
          navigateTo = "/tasks";
          break;

        case "list_tasks":
          result = await executeListTasks(userId, parsed.params);
          navigateTo = "/tasks";
          break;

        case "create_kpi":
          result = await executeCreateKpi(userId, parsed.params);
          navigateTo = "/kpis";
          break;

        case "create_okr":
          result = await executeCreateOkr(userId, parsed.params);
          navigateTo = "/kpis";
          break;

        case "navigate": {
          const pageMap: Record<string, string> = {
            dashboard: "/nexus",
            tasks: "/tasks",
            projects: "/projects",
            kpis: "/kpis",
            agents: "/agent-monitoring",
            settings: "/settings",
            "evening-review": "/evening-review",
            "morning-brief": "/morning-brief",
          };
          const page = String(parsed.params.page ?? "dashboard");
          navigateTo = pageMap[page] ?? "/nexus";
          result = { success: true, message: `Navigating to ${page}...` };
          break;
        }

        default:
          result = {
            success: false,
            message: `The intent "${parsed.intent}" is recognised but not yet implemented.`,
          };
      }

      // Log to activity feed
      if (result.success) {
        await db.insert(activityFeed).values({
          userId,
          actorType: "user",
          actorId: String(userId),
          actorName: "You",
          action: "executed",
          targetType: "nl-command",
          targetName: command.slice(0, 100),
          description: result.message,
          metadata: {
            intent: parsed.intent,
            confidence: parsed.confidence,
            source: "command-bar",
          },
        });
      }

      return {
        intent: parsed.intent,
        confidence: parsed.confidence,
        success: result.success,
        message: parsed.humanResponse || result.message,
        data: result.data ?? null,
        navigateTo,
      };
    }),

  /**
   * Get command suggestions based on current context.
   */
  getSuggestions: protectedProcedure
    .input(
      z.object({
        context: z.string().optional(),
      })
    )
    .query(async ({ ctx }) => {
      const userId = ctx.user.id;

      // Get recent tasks for context-aware suggestions
      const recentTasks = await db
        .select({ title: tasks.title, status: tasks.status })
        .from(tasks)
        .where(eq(tasks.userId, userId))
        .orderBy(desc(tasks.createdAt))
        .limit(3);

      const suggestions = [
        "Create a task to...",
        "Show my overdue tasks",
        "Create a KPI for...",
        "Navigate to evening review",
        "Show my projects",
        "Create an OKR for Q2 2026",
        ...recentTasks.map(t => `Update task: ${t.title}`),
      ];

      return { suggestions: suggestions.slice(0, 8) };
    }),
});
