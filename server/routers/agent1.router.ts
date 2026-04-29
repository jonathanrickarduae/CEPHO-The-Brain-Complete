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
} from "../../drizzle/schema";
import {
  buildSystemPrompt,
  buildCouncilPrompt,
  buildReflectionPrompt,
  OPERATING_MODES,
  RESPONSE_LEVELS,
  TRAINING_REGIME,
  type OperatingMode,
  type ResponseLevel,
  type CouncilData,
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

      // Build system prompt
      const systemPrompt = buildSystemPrompt(
        {
          identityMd: identity?.identityMd,
          valuesMd: identity?.valuesMd,
          relationshipsMd: identity?.relationshipsMd,
          preferencesMd: identity?.preferencesMd,
          systemPromptPatch: settings.systemPromptPatch,
        },
        mode,
        level
      );

      // Fetch recent conversation history (last 20 messages)
      const history = await db
        .select()
        .from(agent1Messages)
        .where(eq(agent1Messages.userId, userId))
        .orderBy(desc(agent1Messages.createdAt))
        .limit(20);

      const historyMessages = history.reverse().map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

      // Optionally run council
      let councilData: CouncilData | null = null;
      if (input.surfaceCouncil || settings.showCouncilByDefault) {
        try {
          const councilContext = identity
            ? `User identity: ${identity.identityMd?.slice(0, 200) ?? "not set"}`
            : "No identity profile loaded.";
          const councilPrompt = buildCouncilPrompt(input.message, councilContext);
          const councilResult = await invokeLLM({
            messages: [
              { role: "system", content: councilPrompt },
              { role: "user", content: input.message },
            ],
            response_format: { type: "json_object" },
          });
          const raw = councilResult.choices[0]?.message?.content ?? "{}";
          councilData = JSON.parse(raw) as CouncilData;
        } catch {
          // Council failure is non-fatal
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

      const assistantContent =
        completion.choices[0]?.message?.content ?? "I was unable to generate a response.";

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
      .map((m) => `[${m.role.toUpperCase()}]: ${m.content.slice(0, 300)}`)
      .join("\n");

    const reflectionPrompt = buildReflectionPrompt(summary);

    const result = await invokeLLM({
      messages: [
        { role: "system", content: reflectionPrompt },
        { role: "user", content: "Generate the weekly reflection now." },
      ],
      response_format: { type: "json_object" },
    });

    const raw = result.choices[0]?.message?.content ?? "{}";
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

// ─── Combined Agent1 Router ───────────────────────────────────────────────────
export const agent1Router = router({
  chat: chatRouter,
  identity: identityRouter,
  decisions: decisionLogRouter,
  training: trainingRouter,
  reflections: reflectionRouter,
  settings: settingsRouter,
});
