/**
 * Agent1 Router
 * Handles all Agent1 Personal AI operations:
 *   - chat (streaming-compatible, with council and operating mode)
 *   - identity profile (CRUD for 4 profile files)
 *   - decision log (CRUD)
 *   - training progress (CRUD)
 *   - reflections (weekly self-improvement loop)
 *   - settings (defaults, system prompt patch)
 */
import { z } from "zod";
import { eq, desc, and } from "drizzle-orm";
import { protectedProcedure, aiProcedure, router } from "../_core/trpc";
import { db } from "../db";
import { invokeLLM } from "../_core/llm";
import {
  agent1Messages,
  agent1IdentityProfiles,
  agent1DecisionLog,
  agent1TrainingProgress,
  agent1Reflections,
  agent1Settings,
  eveningReviewSessions,
  innovationIdeas,
  projects,
  tasks,
} from "../../drizzle/schema";
import {
  buildSystemPrompt,
  buildCouncilPrompt,
  buildReflectionPrompt,
  buildIdeaAssessmentPrompt,
  OPERATING_MODES,
  RESPONSE_LEVELS,
  TRAINING_REGIME,
  type OperatingMode,
  type ResponseLevel,
  type CouncilData,
  type DecisionEntry,
  type EveningReviewContext,
  type PlatformContext,
} from "../agent1/agentEngine";

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function getOrCreateSettings(userId: number) {
  const existing = await db
    .select()
    .from(agent1Settings)
    .where(eq(agent1Settings.userId, userId))
    .limit(1);

  if (existing.length > 0) return existing[0]!;

  await db.insert(agent1Settings).values({ userId });
  const created = await db
    .select()
    .from(agent1Settings)
    .where(eq(agent1Settings.userId, userId))
    .limit(1);
  return created[0]!;
}

async function getIdentityProfile(userId: number) {
  const rows = await db
    .select()
    .from(agent1IdentityProfiles)
    .where(eq(agent1IdentityProfiles.userId, userId))
    .limit(1);
  return rows[0] ?? null;
}

// ─── Chat Router ──────────────────────────────────────────────────────────────
const chatRouter = router({
  send: aiProcedure
    .input(
      z.object({
        message: z.string().min(1).max(8000),
        operatingMode: z.enum(OPERATING_MODES).optional(),
        responseLevel: z.enum(RESPONSE_LEVELS).optional(),
        surfaceCouncil: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.id;
      const settings = await getOrCreateSettings(userId);
      const identity = await getIdentityProfile(userId);

      const mode: OperatingMode =
        (input.operatingMode as OperatingMode) ??
        (settings.defaultOperatingMode as OperatingMode) ??
        "Life Optimiser";
      const level: ResponseLevel =
        (input.responseLevel as ResponseLevel) ??
        (settings.defaultResponseLevel as ResponseLevel) ??
        "Practical";

      // ── Fetch enrichment context in parallel ─────────────────────────────
      const [
        recentDecisions,
        lastReview,
        activeProjects,
        pendingTasks,
        recentIdeas,
      ] = await Promise.all([
        db
          .select()
          .from(agent1DecisionLog)
          .where(eq(agent1DecisionLog.userId, userId))
          .orderBy(desc(agent1DecisionLog.createdAt))
          .limit(5),
        db
          .select()
          .from(eveningReviewSessions)
          .where(eq(eveningReviewSessions.userId, userId))
          .orderBy(desc(eveningReviewSessions.createdAt))
          .limit(1)
          .then(rows => rows[0] ?? null),
        db
          .select({
            name: projects.name,
            status: projects.status,
            progress: projects.progress,
          })
          .from(projects)
          .where(
            and(eq(projects.userId, userId), eq(projects.status, "active"))
          )
          .limit(5),
        db
          .select({
            title: tasks.title,
            priority: tasks.priority,
            status: tasks.status,
          })
          .from(tasks)
          .where(and(eq(tasks.userId, userId), eq(tasks.status, "not_started")))
          .orderBy(desc(tasks.createdAt))
          .limit(8),
        db
          .select({
            title: innovationIdeas.title,
            stage: innovationIdeas.currentStage,
          })
          .from(innovationIdeas)
          .where(eq(innovationIdeas.userId, userId))
          .orderBy(desc(innovationIdeas.createdAt))
          .limit(5),
      ]);

      const decisionsForPrompt: DecisionEntry[] = recentDecisions.map(d => ({
        date: d.date,
        decision: d.decision,
        chosen: d.chosen,
        reasons: Array.isArray(d.reasons) ? (d.reasons as string[]) : [],
        tolerance: d.tolerance,
        whatIdChange: d.whatIdChange,
      }));

      const eveningReviewForPrompt: EveningReviewContext | null = lastReview
        ? {
            reviewDate: lastReview.reviewDate.toISOString().split("T")[0]!,
            moodScore: lastReview.moodScore,
            wentWellNotes: lastReview.wentWellNotes,
            didntGoWellNotes: lastReview.didntGoWellNotes,
            tasksAccepted: lastReview.tasksAccepted,
            tasksDeferred: lastReview.tasksDeferred,
            tasksRejected: lastReview.tasksRejected,
          }
        : null;

      const platformForPrompt: PlatformContext = {
        activeProjects: activeProjects.map(p => ({
          name: p.name,
          status: p.status,
          progress: p.progress,
        })),
        pendingTasks: pendingTasks.map(t => ({
          title: t.title,
          priority: t.priority ?? "normal",
          status: t.status,
        })),
        recentIdeas: recentIdeas.map(i => ({
          title: i.title,
          stage: `Stage ${i.stage}`,
        })),
      };

      // Build system prompt with full context
      const systemPrompt = buildSystemPrompt(
        {
          identityMd: identity?.identityMd,
          valuesMd: identity?.valuesMd,
          relationshipsMd: identity?.relationshipsMd,
          preferencesMd: identity?.preferencesMd,
          systemPromptPatch: settings.systemPromptPatch,
        },
        mode,
        level,
        decisionsForPrompt,
        eveningReviewForPrompt,
        platformForPrompt
      );

      // Fetch recent conversation history (last 20 messages)
      const history = await db
        .select()
        .from(agent1Messages)
        .where(eq(agent1Messages.userId, userId))
        .orderBy(desc(agent1Messages.createdAt))
        .limit(20);

      const historyMessages = history.reverse().map(m => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

      // Optionally run council
      let councilData: CouncilData | null = null;
      if (input.surfaceCouncil || settings.showCouncilByDefault) {
        try {
          const councilContext = [
            identity?.identityMd
              ? `Identity: ${identity.identityMd.slice(0, 200)}`
              : "No identity profile.",
            decisionsForPrompt.length > 0
              ? `Recent decisions: ${decisionsForPrompt
                  .slice(0, 2)
                  .map(d => d.decision)
                  .join("; ")}`
              : "",
            eveningReviewForPrompt?.wentWellNotes
              ? `Last evening: went well — ${eveningReviewForPrompt.wentWellNotes.slice(0, 100)}`
              : "",
          ]
            .filter(Boolean)
            .join(" | ");
          const councilPrompt = buildCouncilPrompt(
            input.message,
            councilContext
          );
          const councilResult = await invokeLLM({
            messages: [
              { role: "system", content: councilPrompt },
              { role: "user", content: input.message },
            ],
            response_format: { type: "json_object" },
          });
          const raw = String(
            councilResult.choices[0]?.message?.content ?? "{}"
          );
          councilData = JSON.parse(raw) as CouncilData;
        } catch {
          councilData = null;
        }
      }

      // Save user message
      await db.insert(agent1Messages).values({
        userId,
        role: "user",
        content: input.message,
        operatingMode: mode,
        responseLevel: level,
      });

      // Call LLM
      const completion = await invokeLLM({
        messages: [
          { role: "system", content: systemPrompt },
          ...historyMessages,
          { role: "user", content: input.message },
        ],
      });

      const assistantContent = String(
        completion.choices[0]?.message?.content ??
          "I was unable to generate a response."
      );

      // Save assistant message
      await db.insert(agent1Messages).values({
        userId,
        role: "assistant",
        content: assistantContent,
        operatingMode: mode,
        responseLevel: level,
        councilData: councilData ?? undefined,
      });

      return {
        content: assistantContent,
        operatingMode: mode,
        responseLevel: level,
        council: councilData,
      };
    }),

  history: protectedProcedure
    .input(z.object({ limit: z.number().min(1).max(100).default(50) }))
    .query(async ({ input, ctx }) => {
      const rows = await db
        .select()
        .from(agent1Messages)
        .where(eq(agent1Messages.userId, ctx.user.id))
        .orderBy(desc(agent1Messages.createdAt))
        .limit(input.limit);
      return rows.reverse();
    }),

  clear: protectedProcedure.mutation(async ({ ctx }) => {
    await db
      .delete(agent1Messages)
      .where(eq(agent1Messages.userId, ctx.user.id));
    return { success: true };
  }),
});

// ─── Identity Router ──────────────────────────────────────────────────────────
const identityRouter = router({
  get: protectedProcedure.query(async ({ ctx }) => {
    return await getIdentityProfile(ctx.user.id);
  }),

  save: protectedProcedure
    .input(
      z.object({
        identityMd: z.string().optional(),
        valuesMd: z.string().optional(),
        relationshipsMd: z.string().optional(),
        preferencesMd: z.string().optional(),
        onboardingComplete: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.id;
      const existing = await getIdentityProfile(userId);

      if (existing) {
        await db
          .update(agent1IdentityProfiles)
          .set({ ...input, updatedAt: new Date() })
          .where(eq(agent1IdentityProfiles.userId, userId));
      } else {
        await db.insert(agent1IdentityProfiles).values({ userId, ...input });
      }

      return await getIdentityProfile(userId);
    }),
});

// ─── Decision Log Router ──────────────────────────────────────────────────────
const decisionLogRouter = router({
  list: protectedProcedure
    .input(z.object({ limit: z.number().min(1).max(100).default(50) }))
    .query(async ({ input, ctx }) => {
      return await db
        .select()
        .from(agent1DecisionLog)
        .where(eq(agent1DecisionLog.userId, ctx.user.id))
        .orderBy(desc(agent1DecisionLog.createdAt))
        .limit(input.limit);
    }),

  create: protectedProcedure
    .input(
      z.object({
        date: z.string(),
        decision: z.string().min(1),
        optionsConsidered: z.array(z.string()),
        chosen: z.string().min(1),
        reasons: z.array(z.string()),
        tolerance: z.enum(["low", "medium", "high"]),
        whatIdChange: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const [row] = await db
        .insert(agent1DecisionLog)
        .values({ userId: ctx.user.id, ...input })
        .returning();
      return row;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        whatIdChange: z.string().optional(),
        decision: z.string().optional(),
        optionsConsidered: z.array(z.string()).optional(),
        chosen: z.string().optional(),
        reasons: z.array(z.string()).optional(),
        tolerance: z.enum(["low", "medium", "high"]).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, ...updates } = input;
      await db
        .update(agent1DecisionLog)
        .set({ ...updates, updatedAt: new Date() })
        .where(
          and(
            eq(agent1DecisionLog.id, id),
            eq(agent1DecisionLog.userId, ctx.user.id)
          )
        );
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      await db
        .delete(agent1DecisionLog)
        .where(
          and(
            eq(agent1DecisionLog.id, input.id),
            eq(agent1DecisionLog.userId, ctx.user.id)
          )
        );
      return { success: true };
    }),
});

// ─── Training Router ──────────────────────────────────────────────────────────
const trainingRouter = router({
  regime: protectedProcedure.query(() => TRAINING_REGIME),

  progress: protectedProcedure.query(async ({ ctx }) => {
    return await db
      .select()
      .from(agent1TrainingProgress)
      .where(eq(agent1TrainingProgress.userId, ctx.user.id));
  }),

  markComplete: protectedProcedure
    .input(
      z.object({
        phase: z.enum(["foundation", "sharpening"]),
        dayOrWeek: z.number(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.id;
      const existing = await db
        .select()
        .from(agent1TrainingProgress)
        .where(
          and(
            eq(agent1TrainingProgress.userId, userId),
            eq(agent1TrainingProgress.phase, input.phase),
            eq(agent1TrainingProgress.dayOrWeek, input.dayOrWeek)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(agent1TrainingProgress)
          .set({
            completed: true,
            notes: input.notes,
            completedAt: new Date(),
          })
          .where(eq(agent1TrainingProgress.id, existing[0]!.id));
      } else {
        await db.insert(agent1TrainingProgress).values({
          userId,
          phase: input.phase,
          dayOrWeek: input.dayOrWeek,
          completed: true,
          notes: input.notes,
          completedAt: new Date(),
        });
      }
      return { success: true };
    }),

  markIncomplete: protectedProcedure
    .input(
      z.object({
        phase: z.enum(["foundation", "sharpening"]),
        dayOrWeek: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await db
        .update(agent1TrainingProgress)
        .set({ completed: false, completedAt: null })
        .where(
          and(
            eq(agent1TrainingProgress.userId, ctx.user.id),
            eq(agent1TrainingProgress.phase, input.phase),
            eq(agent1TrainingProgress.dayOrWeek, input.dayOrWeek)
          )
        );
      return { success: true };
    }),
  // Convenience aliases for frontend which uses dayKey (e.g. "w1d3") format
  toggle: protectedProcedure
    .input(z.object({ dayKey: z.string(), completed: z.boolean() }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.id;
      // Parse dayKey: w1d3 → phase=foundation, dayOrWeek=3 (week 1 day 3)
      const match = input.dayKey.match(/^w(\d+)d(\d+)$/);
      const phase = "foundation";
      const dayOrWeek = match ? parseInt(match[2]!) : 0;
      const existing = await db
        .select()
        .from(agent1TrainingProgress)
        .where(
          and(
            eq(agent1TrainingProgress.userId, userId),
            eq(agent1TrainingProgress.phase, phase),
            eq(agent1TrainingProgress.dayOrWeek, dayOrWeek)
          )
        )
        .limit(1);
      if (existing.length > 0) {
        await db
          .update(agent1TrainingProgress)
          .set({
            completed: input.completed,
            completedAt: input.completed ? new Date() : null,
          })
          .where(eq(agent1TrainingProgress.id, existing[0]!.id));
      } else if (input.completed) {
        await db.insert(agent1TrainingProgress).values({
          userId,
          phase,
          dayOrWeek,
          completed: true,
          completedAt: new Date(),
        });
      }
      return { success: true };
    }),
  saveNotes: protectedProcedure
    .input(z.object({ dayKey: z.string(), notes: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.id;
      const match = input.dayKey.match(/^w(\d+)d(\d+)$/);
      const phase = "foundation";
      const dayOrWeek = match ? parseInt(match[2]!) : 0;
      const existing = await db
        .select()
        .from(agent1TrainingProgress)
        .where(
          and(
            eq(agent1TrainingProgress.userId, userId),
            eq(agent1TrainingProgress.phase, phase),
            eq(agent1TrainingProgress.dayOrWeek, dayOrWeek)
          )
        )
        .limit(1);
      if (existing.length > 0) {
        await db
          .update(agent1TrainingProgress)
          .set({ notes: input.notes })
          .where(eq(agent1TrainingProgress.id, existing[0]!.id));
      } else {
        await db.insert(agent1TrainingProgress).values({
          userId,
          phase,
          dayOrWeek,
          completed: false,
          notes: input.notes,
        });
      }
      return { success: true };
    }),
});
// ─── Reflection Router ────────────────────────────────────────────────────────
const reflectionRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return await db
      .select()
      .from(agent1Reflections)
      .where(eq(agent1Reflections.userId, ctx.user.id))
      .orderBy(desc(agent1Reflections.createdAt));
  }),

  generate: aiProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.user.id;

    // Get last 7 days of messages
    const messages = await db
      .select()
      .from(agent1Messages)
      .where(eq(agent1Messages.userId, userId))
      .orderBy(desc(agent1Messages.createdAt))
      .limit(100);

    if (messages.length === 0) {
      throw new Error("No conversation history to reflect on.");
    }

    const summary = messages
      .reverse()
      .map(m => `[${m.role.toUpperCase()}]: ${m.content.slice(0, 300)}`)
      .join("\n");

    const reflectionPrompt = buildReflectionPrompt(summary);

    const result = await invokeLLM({
      messages: [
        { role: "system", content: reflectionPrompt },
        { role: "user", content: "Generate the weekly reflection now." },
      ],
      response_format: { type: "json_object" },
    });

    const raw = String(result.choices[0]?.message?.content ?? "{}");
    const parsed = JSON.parse(raw);

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekStartStr = weekStart.toISOString().split("T")[0]!;

    const [reflection] = await db
      .insert(agent1Reflections)
      .values({
        userId,
        weekStart: weekStartStr,
        wellDone: parsed.wellDone ?? [],
        missed: parsed.missed ?? [],
        proposedPatch: parsed.proposedPatch ?? "",
        status: "pending",
      })
      .returning();

    return reflection;
  }),

  review: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        action: z.enum(["accept", "reject"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.id;

      const [reflection] = await db
        .select()
        .from(agent1Reflections)
        .where(
          and(
            eq(agent1Reflections.id, input.id),
            eq(agent1Reflections.userId, userId)
          )
        )
        .limit(1);

      if (!reflection) throw new Error("Reflection not found.");

      await db
        .update(agent1Reflections)
        .set({
          status: input.action === "accept" ? "accepted" : "rejected",
          reviewedAt: new Date(),
        })
        .where(eq(agent1Reflections.id, input.id));

      // If accepted, apply the proposed patch to agent1_settings
      if (input.action === "accept" && reflection.proposedPatch) {
        const settings = await getOrCreateSettings(userId);
        const existingPatch = settings.systemPromptPatch ?? "";
        const newPatch = existingPatch
          ? `${existingPatch}\n\n---\n\n${reflection.proposedPatch}`
          : reflection.proposedPatch;

        await db
          .update(agent1Settings)
          .set({ systemPromptPatch: newPatch, updatedAt: new Date() })
          .where(eq(agent1Settings.userId, userId));
      }

      return { success: true };
    }),
  // Convenience aliases so frontend can call approve/reject directly
  approve: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.id;
      const [reflection] = await db
        .select()
        .from(agent1Reflections)
        .where(
          and(
            eq(agent1Reflections.id, input.id),
            eq(agent1Reflections.userId, userId)
          )
        )
        .limit(1);
      if (!reflection) throw new Error("Reflection not found.");
      await db
        .update(agent1Reflections)
        .set({ status: "accepted", reviewedAt: new Date() })
        .where(eq(agent1Reflections.id, input.id));
      if (reflection.proposedPatch) {
        const settings = await getOrCreateSettings(userId);
        const existingPatch = settings.systemPromptPatch ?? "";
        const newPatch = existingPatch
          ? `${existingPatch}\n\n---\n\n${reflection.proposedPatch}`
          : reflection.proposedPatch;
        await db
          .update(agent1Settings)
          .set({ systemPromptPatch: newPatch, updatedAt: new Date() })
          .where(eq(agent1Settings.userId, userId));
      }
      return { success: true };
    }),
  reject: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.id;
      await db
        .update(agent1Reflections)
        .set({ status: "rejected", reviewedAt: new Date() })
        .where(
          and(
            eq(agent1Reflections.id, input.id),
            eq(agent1Reflections.userId, userId)
          )
        );
      return { success: true };
    }),
});

// ─── Settings Router ──────────────────────────────────────────────────────────
const settingsRouter = router({
  get: protectedProcedure.query(async ({ ctx }) => {
    return await getOrCreateSettings(ctx.user.id);
  }),

  update: protectedProcedure
    .input(
      z.object({
        defaultResponseLevel: z.enum(RESPONSE_LEVELS).optional(),
        defaultOperatingMode: z.enum(OPERATING_MODES).optional(),
        showCouncilByDefault: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.id;
      await getOrCreateSettings(userId);
      await db
        .update(agent1Settings)
        .set({ ...input, updatedAt: new Date() })
        .where(eq(agent1Settings.userId, userId));
      return await getOrCreateSettings(userId);
    }),

  clearPatch: protectedProcedure.mutation(async ({ ctx }) => {
    await db
      .update(agent1Settings)
      .set({ systemPromptPatch: null, updatedAt: new Date() })
      .where(eq(agent1Settings.userId, ctx.user.id));
    return { success: true };
  }),
});

// ─── Ideas Router (Agent1 assesses Innovation Hub ideas) ─────────────────────
const ideasRouter = router({
  assess: aiProcedure
    .input(z.object({ ideaId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.id;
      const [idea] = await db
        .select()
        .from(innovationIdeas)
        .where(
          and(
            eq(innovationIdeas.id, input.ideaId),
            eq(innovationIdeas.userId, userId)
          )
        )
        .limit(1);
      if (!idea) throw new Error("Idea not found.");
      const identity = await getIdentityProfile(userId);
      const userContext = identity?.identityMd
        ? `User identity: ${identity.identityMd.slice(0, 300)}`
        : "No identity profile loaded.";
      const assessmentPrompt = buildIdeaAssessmentPrompt(
        idea.title,
        idea.description ?? "",
        userContext
      );
      const result = await invokeLLM({
        messages: [
          { role: "system", content: assessmentPrompt },
          { role: "user", content: "Assess this idea now." },
        ],
        response_format: { type: "json_object" },
      });
      const raw = String(result.choices[0]?.message?.content ?? "{}");
      const assessment = JSON.parse(raw);
      return { ideaId: input.ideaId, ideaTitle: idea.title, assessment };
    }),
});

// ─── Orchestrate Router (Agent1 delegates to specialist agents) ───────────────
const orchestrateRouter = router({
  /**
   * Agent1 analyses the user's request, picks the best specialist agent,
   * runs the task, and returns a synthesised response.
   */
  delegate: aiProcedure
    .input(
      z.object({
        task: z.string().min(1).max(4000),
        context: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.id;
      const identity = await getIdentityProfile(userId);

      // Step 1 — Agent1 picks the best agent for this task
      const routingPrompt = `You are Agent1, the Chief of Staff for CEPHO. You have access to 51 specialist agents.
Given the user's task, choose the SINGLE best agent to handle it.
Respond with a JSON object: { "agentId": "<agent_key>", "agentName": "<name>", "reason": "<one sentence>" }

Available agents (key → name):
email_composer → Email Composer
meeting_summariser → Meeting Summariser
stakeholder_comms → Stakeholder Communications
proposal_writer → Proposal Writer
market_analyst → Market Analyst
financial_analyst → Financial Analyst
competitive_intelligence → Competitive Intelligence
data_interpreter → Data Interpreter
risk_assessor → Risk Assessor
trend_spotter → Trend Spotter
research_synthesiser → Research Synthesiser
kpi_tracker → KPI Tracker
calendar_manager → Calendar Manager
task_manager → Task Manager
inbox_manager → Inbox Manager
document_organiser → Document Organiser
expense_tracker → Expense Tracker
travel_coordinator → Travel Coordinator
feedback_collector → Feedback Collector
performance_tracker → Performance Tracker
meeting_preparer → Meeting Preparer
daily_summariser → Daily Summariser
goal_strategist → Goal Strategist
decision_analyst → Decision Analyst
scenario_planner → Scenario Planner
resource_allocator → Resource Allocator
innovation_scout → Innovation Scout
strategic_advisor → Strategic Advisor
knowledge_manager → Knowledge Manager
workflow_automator → Workflow Automator
process_documenter → Process Documenter
qa_specialist → QA Specialist
workflow_orchestrator → Workflow Orchestrator
integration_specialist → Integration Specialist
process_optimiser → Process Optimiser
continuous_learner → Continuous Learner
best_practice_researcher → Best Practice Researcher
morning_briefing_specialist → Morning Briefing Specialist
blog_writer → Blog Writer
social_media_manager → Social Media Manager
video_scriptwriter → Video Scriptwriter
case_study_writer → Case Study Writer
seo_specialist → SEO Specialist
brand_voice_guardian → Brand Voice Guardian
newsletter_editor → Newsletter Editor
linkedin_manager → LinkedIn Manager
press_release_writer → Press Release Writer
crisis_comms → Crisis Communications
report_writer → Report Writer

User identity context: ${identity?.identityMd?.slice(0, 200) ?? "Not set"}
User task: ${input.task}`;

      const routingResult = await invokeLLM({
        messages: [
          { role: "system", content: routingPrompt },
          { role: "user", content: input.task },
        ],
        response_format: { type: "json_object" },
      });
      const routing = JSON.parse(
        String(routingResult.choices[0]?.message?.content ?? "{}")
      ) as { agentId: string; agentName: string; reason: string };

      // Step 2 — Run the task with the chosen agent via invokeLLM
      const agentSystemPrompts: Record<string, string> = {
        email_composer:
          "You are an expert Email Composer. Write clear, professional, and effective emails.",
        meeting_summariser:
          "You are a Meeting Summariser. Extract key decisions, action items, and insights from meeting content.",
        market_analyst:
          "You are a Market Analyst. Provide data-driven market insights, trends, and competitive analysis.",
        financial_analyst:
          "You are a Financial Analyst. Analyse financial data, identify trends, and provide investment insights.",
        decision_analyst:
          "You are a Decision Analyst. Break down complex decisions using structured frameworks.",
        strategic_advisor:
          "You are a Strategic Advisor. Provide high-level strategic guidance aligned with long-term goals.",
        goal_strategist:
          "You are a Goal Strategist. Help set, prioritise, and achieve meaningful goals.",
        risk_assessor:
          "You are a Risk Assessor. Identify, quantify, and mitigate risks in plans and decisions.",
        research_synthesiser:
          "You are a Research Synthesiser. Gather, analyse, and synthesise information into clear insights.",
        task_manager:
          "You are a Task Manager. Organise, prioritise, and track tasks for maximum productivity.",
      };
      const agentPrompt =
        agentSystemPrompts[routing.agentId] ??
        `You are ${routing.agentName}, a specialist AI agent. Complete the user's task with expertise and precision.`;

      const taskResult = await invokeLLM({
        messages: [
          { role: "system", content: agentPrompt },
          {
            role: "user",
            content: input.context
              ? `Context: ${input.context}\n\nTask: ${input.task}`
              : input.task,
          },
        ],
      });
      const agentResponse = String(
        taskResult.choices[0]?.message?.content ?? "No response generated."
      );

      // Step 3 — Agent1 synthesises and returns
      return {
        delegatedTo: {
          agentId: routing.agentId,
          agentName: routing.agentName,
          reason: routing.reason,
        },
        response: agentResponse,
      };
    }),
});

// ─── Combined Agent1 Router ───────────────────────────────────────────────────
export const agent1Router = router({
  chat: chatRouter,
  identity: identityRouter,
  decisions: decisionLogRouter,
  training: trainingRouter,
  reflections: reflectionRouter,
  settings: settingsRouter,
  ideas: ideasRouter,
  orchestrate: orchestrateRouter,
});
