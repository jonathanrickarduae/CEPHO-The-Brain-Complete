/**
 * Email Intelligence Router — Phase 3 (p3-6, p3-7, p3-8)
 *
 * Implements:
 *  - p3-6: Gmail/Outlook triage + AI summarisation
 *  - p3-7: AI email drafting (Victoria dictates → agent drafts)
 *  - p3-8: Smart follow-up reminders (unanswered email detection)
 *
 * Appendix references: GAP 4 (Email Intelligence), Appendix H Table 57
 */
import { z } from "zod";
import { desc, eq, and, lt, isNull } from "drizzle-orm";
import { protectedProcedure, router } from "../_core/trpc";
import { db } from "../db";
import {
  emailMessages,
  agentInsights,
} from "../../drizzle/schema";
import OpenAI from "openai";

const openai = new OpenAI();

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function triageEmail(
  subject: string,
  bodyText: string,
  fromAddress: string
): Promise<{
  summary: string;
  priority: "urgent" | "high" | "normal" | "low";
  action: "reply" | "delegate" | "archive" | "follow_up" | "none";
  actionReason: string;
}> {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are an AI Chief of Staff triaging emails for a senior executive. 
Analyse the email and return a JSON object with:
- summary: 1-2 sentence summary of the email
- priority: "urgent" | "high" | "normal" | "low"
- action: "reply" | "delegate" | "archive" | "follow_up" | "none"
- actionReason: brief explanation of the recommended action

Priority guide:
- urgent: requires response within 2 hours (board members, clients, legal, financial)
- high: requires response today (team leads, partners, deadlines)
- normal: respond within 48 hours
- low: FYI, newsletters, automated notifications

Respond ONLY with valid JSON.`,
      },
      {
        role: "user",
        content: `From: ${fromAddress}\nSubject: ${subject}\n\n${bodyText?.slice(0, 2000) ?? ""}`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(raw) as {
    summary?: string;
    priority?: string;
    action?: string;
    actionReason?: string;
  };

  return {
    summary: parsed.summary ?? "No summary available.",
    priority: (parsed.priority as "urgent" | "high" | "normal" | "low") ?? "normal",
    action: (parsed.action as "reply" | "delegate" | "archive" | "follow_up" | "none") ?? "none",
    actionReason: parsed.actionReason ?? "",
  };
}

async function draftEmailReply(
  originalSubject: string,
  originalBody: string,
  fromAddress: string,
  instruction: string,
  communicationStyle: { formality: number; verbosity: number } = { formality: 0.7, verbosity: 0.5 }
): Promise<string> {
  const formalityDesc = communicationStyle.formality > 0.7 ? "formal and professional" : communicationStyle.formality > 0.4 ? "semi-formal" : "conversational";
  const verbosityDesc = communicationStyle.verbosity > 0.7 ? "detailed" : communicationStyle.verbosity > 0.4 ? "concise" : "very brief";

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are drafting an email reply on behalf of a senior executive. 
Communication style: ${formalityDesc}, ${verbosityDesc}.
Write ONLY the email body — no subject line, no "Dear X" unless appropriate, no sign-off unless appropriate.
Match the tone and context of the original email.`,
      },
      {
        role: "user",
        content: `Original email from ${fromAddress}:\nSubject: ${originalSubject}\n\n${originalBody?.slice(0, 2000) ?? ""}\n\n---\nDrafting instruction: ${instruction}`,
      },
    ],
    temperature: 0.6,
  });

  return completion.choices[0]?.message?.content ?? "";
}

// ─── Router ──────────────────────────────────────────────────────────────────

export const emailIntelligenceRouter = router({
  /**
   * Ingest and triage a batch of emails from Gmail/Outlook.
   * p3-6: Email triage + AI summarisation
   */
  ingestEmails: protectedProcedure
    .input(
      z.object({
        provider: z.enum(["gmail", "outlook"]),
        emails: z.array(
          z.object({
            externalId: z.string(),
            threadId: z.string().optional(),
            fromAddress: z.string(),
            fromName: z.string().optional(),
            toAddresses: z.array(z.string()).optional(),
            subject: z.string(),
            bodyText: z.string(),
            receivedAt: z.string().optional(),
          })
        ),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const results: { externalId: string; id: number; priority: string; action: string }[] = [];

      for (const email of input.emails) {
        // Check if already ingested
        const existing = await db
          .select({ id: emailMessages.id })
          .from(emailMessages)
          .where(
            and(
              eq(emailMessages.userId, ctx.user.id),
              eq(emailMessages.externalId, email.externalId)
            )
          )
          .limit(1);

        if (existing.length > 0) {
          results.push({ externalId: email.externalId, id: existing[0].id, priority: "normal", action: "none" });
          continue;
        }

        // AI triage
        const triage = await triageEmail(
          email.subject,
          email.bodyText,
          email.fromAddress
        );

        // Calculate follow-up date for follow_up action
        const followUpAt =
          triage.action === "follow_up"
            ? new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
            : null;

        const [inserted] = await db
          .insert(emailMessages)
          .values({
            userId: ctx.user.id,
            provider: input.provider,
            externalId: email.externalId,
            threadId: email.threadId,
            fromAddress: email.fromAddress,
            fromName: email.fromName,
            toAddresses: email.toAddresses ?? [],
            subject: email.subject,
            bodyText: email.bodyText,
            aiSummary: triage.summary,
            aiPriority: triage.priority,
            aiAction: triage.action,
            aiActionReason: triage.actionReason,
            followUpAt,
            receivedAt: email.receivedAt ? new Date(email.receivedAt) : new Date(),
          })
          .returning({ id: emailMessages.id });

        results.push({
          externalId: email.externalId,
          id: inserted.id,
          priority: triage.priority,
          action: triage.action,
        });
      }

      return { ingested: results.length, results };
    }),

  /**
   * List triaged emails with optional priority filter.
   * p3-6: Email triage view
   */
  list: protectedProcedure
    .input(
      z.object({
        priority: z.enum(["urgent", "high", "normal", "low", "all"]).default("all"),
        isArchived: z.boolean().default(false),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      const conditions = [
        eq(emailMessages.userId, ctx.user.id),
        eq(emailMessages.isArchived, input.isArchived),
      ];

      if (input.priority !== "all") {
        conditions.push(eq(emailMessages.aiPriority, input.priority));
      }

      const rows = await db
        .select()
        .from(emailMessages)
        .where(and(...conditions))
        .orderBy(desc(emailMessages.receivedAt))
        .limit(input.limit)
        .offset(input.offset);

      return rows;
    }),

  /**
   * Draft an AI reply to an email.
   * p3-7: AI email drafting
   */
  draftReply: protectedProcedure
    .input(
      z.object({
        emailId: z.number(),
        instruction: z.string().min(1).max(1000),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const [email] = await db
        .select()
        .from(emailMessages)
        .where(
          and(
            eq(emailMessages.id, input.emailId),
            eq(emailMessages.userId, ctx.user.id)
          )
        )
        .limit(1);

      if (!email) {
        throw new Error("Email not found");
      }

      const draft = await draftEmailReply(
        email.subject ?? "",
        email.bodyText ?? "",
        email.fromAddress ?? "",
        input.instruction
      );

      // Save draft back to the email record
      await db
        .update(emailMessages)
        .set({ isDraft: true, draftContent: draft })
        .where(eq(emailMessages.id, input.emailId));

      return { draft, emailId: input.emailId };
    }),

  /**
   * Approve and finalise a draft (mark as ready to send).
   * p3-7: Draft approval
   */
  approveDraft: protectedProcedure
    .input(
      z.object({
        emailId: z.number(),
        finalContent: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const [email] = await db
        .select()
        .from(emailMessages)
        .where(
          and(
            eq(emailMessages.id, input.emailId),
            eq(emailMessages.userId, ctx.user.id)
          )
        )
        .limit(1);

      if (!email) throw new Error("Email not found");

      await db
        .update(emailMessages)
        .set({
          draftContent: input.finalContent ?? email.draftContent,
          aiAction: "reply",
          isRead: true,
        })
        .where(eq(emailMessages.id, input.emailId));

      return { success: true };
    }),

  /**
   * Mark email as read / archived.
   */
  markRead: protectedProcedure
    .input(z.object({ emailId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      await db
        .update(emailMessages)
        .set({ isRead: true })
        .where(
          and(
            eq(emailMessages.id, input.emailId),
            eq(emailMessages.userId, ctx.user.id)
          )
        );
      return { success: true };
    }),

  archive: protectedProcedure
    .input(z.object({ emailId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      await db
        .update(emailMessages)
        .set({ isArchived: true })
        .where(
          and(
            eq(emailMessages.id, input.emailId),
            eq(emailMessages.userId, ctx.user.id)
          )
        );
      return { success: true };
    }),

  /**
   * Get emails that need follow-up (followUpAt has passed and not yet replied).
   * p3-8: Smart follow-up reminders
   */
  getFollowUps: protectedProcedure.query(async ({ ctx }) => {
    const now = new Date();
    const rows = await db
      .select()
      .from(emailMessages)
      .where(
        and(
          eq(emailMessages.userId, ctx.user.id),
          eq(emailMessages.isArchived, false),
          lt(emailMessages.followUpAt, now)
        )
      )
      .orderBy(emailMessages.followUpAt)
      .limit(20);

    return rows;
  }),

  /**
   * Set a manual follow-up reminder on an email.
   * p3-8: Smart follow-up reminders
   */
  setFollowUp: protectedProcedure
    .input(
      z.object({
        emailId: z.number(),
        followUpAt: z.string(), // ISO date string
      })
    )
    .mutation(async ({ input, ctx }) => {
      await db
        .update(emailMessages)
        .set({ followUpAt: new Date(input.followUpAt), aiAction: "follow_up" })
        .where(
          and(
            eq(emailMessages.id, input.emailId),
            eq(emailMessages.userId, ctx.user.id)
          )
        );
      return { success: true };
    }),

  /**
   * Get email intelligence summary stats.
   */
  getSummaryStats: protectedProcedure.query(async ({ ctx }) => {
    const all = await db
      .select({
        aiPriority: emailMessages.aiPriority,
        aiAction: emailMessages.aiAction,
        isRead: emailMessages.isRead,
        isArchived: emailMessages.isArchived,
        isDraft: emailMessages.isDraft,
      })
      .from(emailMessages)
      .where(eq(emailMessages.userId, ctx.user.id));

    const stats = {
      total: all.length,
      unread: all.filter(e => !e.isRead && !e.isArchived).length,
      urgent: all.filter(e => e.aiPriority === "urgent" && !e.isArchived).length,
      high: all.filter(e => e.aiPriority === "high" && !e.isArchived).length,
      awaitingReply: all.filter(e => e.aiAction === "reply" && !e.isArchived).length,
      followUps: all.filter(e => e.aiAction === "follow_up" && !e.isArchived).length,
      drafts: all.filter(e => e.isDraft && !e.isArchived).length,
    };

    return stats;
  }),
});
