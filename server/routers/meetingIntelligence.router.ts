/**
 * Meeting Intelligence Router — Phase 3 (p3-9, p3-10, p3-11)
 *
 * Implements:
 *  - p3-9:  Pre-meeting brief generation (attendees, agenda, context)
 *  - p3-10: Post-meeting extraction (summary, decisions, action items)
 *  - p3-11: Zoom/Teams transcript ingestion → structured notes
 *
 * Appendix references: GAP 5 (Meeting Intelligence), Appendix H Table 57
 */
import { z } from "zod";
import { desc, eq, and } from "drizzle-orm";
import { protectedProcedure, router } from "../_core/trpc";
import { db } from "../db";
import { meetingNotes } from "../../drizzle/schema";
import OpenAI from "openai";

let _openai: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _openai;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function generatePreMeetingBrief(
  title: string,
  attendees: string[],
  agenda: string,
  context: string
): Promise<string> {
  const completion = await getOpenAI().chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are an AI Chief of Staff preparing a pre-meeting brief for a senior executive.
Create a concise, actionable pre-meeting brief that includes:
1. **Meeting Purpose** — why this meeting matters
2. **Key Attendees** — who's attending and their likely agenda
3. **Talking Points** — 3-5 key points to cover or raise
4. **Watch Out For** — potential risks, sensitivities, or hidden agendas
5. **Desired Outcome** — what a successful meeting looks like

Format in clean Markdown. Be direct and executive-level.`,
      },
      {
        role: "user",
        content: `Meeting: ${title}\nAttendees: ${attendees.join(", ")}\nAgenda: ${agenda}\nContext: ${context}`,
      },
    ],
    temperature: 0.5,
  });

  return completion.choices[0]?.message?.content ?? "Brief unavailable.";
}

async function extractMeetingNotes(
  transcript: string,
  title: string
): Promise<{
  summary: string;
  keyDecisions: string[];
  actionItems: { task: string; owner: string; dueDate?: string }[];
  nextSteps: string[];
}> {
  const completion = await getOpenAI().chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are an AI Chief of Staff extracting structured notes from a meeting transcript.
Return a JSON object with:
- summary: 2-3 paragraph executive summary
- keyDecisions: array of key decisions made (strings)
- actionItems: array of { task: string, owner: string, dueDate?: string }
- nextSteps: array of next steps (strings)

Be specific, actionable, and concise. Respond ONLY with valid JSON.`,
      },
      {
        role: "user",
        content: `Meeting: ${title}\n\nTranscript:\n${transcript.slice(0, 8000)}`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
  });

  const raw = JSON.parse(completion.choices[0]?.message?.content ?? "{}") as {
    summary?: string;
    keyDecisions?: string[];
    actionItems?: { task: string; owner: string; dueDate?: string }[];
    nextSteps?: string[];
  };

  return {
    summary: raw.summary ?? "No summary available.",
    keyDecisions: raw.keyDecisions ?? [],
    actionItems: raw.actionItems ?? [],
    nextSteps: raw.nextSteps ?? [],
  };
}

// ─── Router ──────────────────────────────────────────────────────────────────

export const meetingIntelligenceRouter = router({
  /**
   * Generate a pre-meeting brief.
   * p3-9: Pre-meeting brief generation
   */
  generatePreBrief: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(500),
        attendees: z.array(z.string()).default([]),
        agenda: z.string().default(""),
        context: z.string().default(""),
        meetingAt: z.string().optional(),
        durationMinutes: z.number().optional(),
        saveNote: z.boolean().default(true),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const brief = await generatePreMeetingBrief(
        input.title,
        input.attendees,
        input.agenda,
        input.context
      );

      let noteId: number | null = null;
      if (input.saveNote) {
        const [inserted] = await db
          .insert(meetingNotes)
          .values({
            userId: ctx.user.id,
            title: input.title,
            attendees: input.attendees,
            preMeetingBrief: brief,
            source: "manual",
            meetingAt: input.meetingAt ? new Date(input.meetingAt) : null,
            durationMinutes: input.durationMinutes,
          })
          .returning({ id: meetingNotes.id });
        noteId = inserted.id;
      }

      return { brief, noteId };
    }),

  /**
   * Process a meeting transcript to extract structured notes.
   * p3-10: Post-meeting extraction
   * p3-11: Zoom/Teams transcript ingestion
   */
  processTranscript: protectedProcedure
    .input(
      z.object({
        noteId: z.number().optional(),
        title: z.string().min(1).max(500),
        transcript: z.string().min(10),
        attendees: z.array(z.string()).default([]),
        source: z
          .enum(["zoom", "teams", "google_meet", "manual"])
          .default("manual"),
        meetingAt: z.string().optional(),
        durationMinutes: z.number().optional(),
        externalMeetingId: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const extracted = await extractMeetingNotes(
        input.transcript,
        input.title
      );

      if (input.noteId) {
        // Update existing note
        await db
          .update(meetingNotes)
          .set({
            transcript: input.transcript,
            aiSummary: extracted.summary,
            keyDecisions: extracted.keyDecisions,
            actionItems: extracted.actionItems,
            nextSteps: extracted.nextSteps,
            attendees: input.attendees.length > 0 ? input.attendees : undefined,
            source: input.source,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(meetingNotes.id, input.noteId),
              eq(meetingNotes.userId, ctx.user.id)
            )
          );

        return { noteId: input.noteId, ...extracted };
      } else {
        // Create new note
        const [inserted] = await db
          .insert(meetingNotes)
          .values({
            userId: ctx.user.id,
            title: input.title,
            transcript: input.transcript,
            aiSummary: extracted.summary,
            keyDecisions: extracted.keyDecisions,
            actionItems: extracted.actionItems,
            nextSteps: extracted.nextSteps,
            attendees: input.attendees,
            source: input.source,
            externalMeetingId: input.externalMeetingId,
            meetingAt: input.meetingAt ? new Date(input.meetingAt) : null,
            durationMinutes: input.durationMinutes,
          })
          .returning({ id: meetingNotes.id });

        return { noteId: inserted.id, ...extracted };
      }
    }),

  /**
   * Create a manual meeting note (no transcript yet).
   */
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(500),
        attendees: z.array(z.string()).default([]),
        source: z
          .enum(["zoom", "teams", "google_meet", "manual"])
          .default("manual"),
        meetingAt: z.string().optional(),
        durationMinutes: z.number().optional(),
        externalMeetingId: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const [inserted] = await db
        .insert(meetingNotes)
        .values({
          userId: ctx.user.id,
          title: input.title,
          attendees: input.attendees,
          source: input.source,
          externalMeetingId: input.externalMeetingId,
          meetingAt: input.meetingAt ? new Date(input.meetingAt) : null,
          durationMinutes: input.durationMinutes,
        })
        .returning({ id: meetingNotes.id });

      return { noteId: inserted.id };
    }),

  /**
   * List all meeting notes.
   */
  list: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      const rows = await db
        .select()
        .from(meetingNotes)
        .where(eq(meetingNotes.userId, ctx.user.id))
        .orderBy(desc(meetingNotes.meetingAt))
        .limit(input.limit)
        .offset(input.offset);

      return rows;
    }),

  /**
   * Get a single meeting note by ID.
   */
  getById: protectedProcedure
    .input(z.object({ noteId: z.number() }))
    .query(async ({ input, ctx }) => {
      const [note] = await db
        .select()
        .from(meetingNotes)
        .where(
          and(
            eq(meetingNotes.id, input.noteId),
            eq(meetingNotes.userId, ctx.user.id)
          )
        )
        .limit(1);

      if (!note) throw new Error("Meeting note not found");
      return note;
    }),

  /**
   * Update a meeting note manually.
   */
  update: protectedProcedure
    .input(
      z.object({
        noteId: z.number(),
        title: z.string().optional(),
        attendees: z.array(z.string()).optional(),
        aiSummary: z.string().optional(),
        keyDecisions: z.array(z.string()).optional(),
        actionItems: z
          .array(
            z.object({
              task: z.string(),
              owner: z.string(),
              dueDate: z.string().optional(),
            })
          )
          .optional(),
        nextSteps: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { noteId, ...updates } = input;

      await db
        .update(meetingNotes)
        .set({ ...updates, updatedAt: new Date() })
        .where(
          and(eq(meetingNotes.id, noteId), eq(meetingNotes.userId, ctx.user.id))
        );

      return { success: true };
    }),

  /**
   * Delete a meeting note.
   */
  delete: protectedProcedure
    .input(z.object({ noteId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      await db
        .delete(meetingNotes)
        .where(
          and(
            eq(meetingNotes.id, input.noteId),
            eq(meetingNotes.userId, ctx.user.id)
          )
        );

      return { success: true };
    }),

  /**
   * Re-generate AI summary for an existing note.
   */
  regenerateSummary: protectedProcedure
    .input(z.object({ noteId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const [note] = await db
        .select()
        .from(meetingNotes)
        .where(
          and(
            eq(meetingNotes.id, input.noteId),
            eq(meetingNotes.userId, ctx.user.id)
          )
        )
        .limit(1);

      if (!note) throw new Error("Meeting note not found");
      if (!note.transcript)
        throw new Error("No transcript available to summarise");

      const extracted = await extractMeetingNotes(note.transcript, note.title);

      await db
        .update(meetingNotes)
        .set({
          aiSummary: extracted.summary,
          keyDecisions: extracted.keyDecisions,
          actionItems: extracted.actionItems,
          nextSteps: extracted.nextSteps,
          updatedAt: new Date(),
        })
        .where(eq(meetingNotes.id, input.noteId));

      return extracted;
    }),
});
