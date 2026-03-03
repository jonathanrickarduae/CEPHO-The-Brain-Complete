import { getModelForTask } from "../utils/modelRouter";
/**
 * Document Library Router — Real Implementation
 *
 * Manages generated documents: list, generate PDF, delete, QA status, send email.
 */
import { z } from "zod";
import { desc, eq, and } from "drizzle-orm";
import OpenAI from "openai";
import { protectedProcedure, router } from "../_core/trpc";
import { db } from "../db";
import { generatedDocuments, documentEmailHistory } from "../../drizzle/schema";
import { emailService } from "../services/email.service";

function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");
  return new OpenAI({ apiKey });
}

function generateDocId(): string {
  return `DOC-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
}

export const documentLibraryRouter = router({
  /**
   * List documents with optional filters.
   */
  list: protectedProcedure
    .input(
      z.object({
        type: z.string().optional(),
        qaStatus: z.string().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      const rows = await db
        .select()
        .from(generatedDocuments)
        .where(eq(generatedDocuments.userId, ctx.user.id))
        .orderBy(desc(generatedDocuments.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      const filtered = rows
        .filter(r => !input.type || r.type === input.type)
        .filter(r => !input.qaStatus || r.qaStatus === input.qaStatus);

      return {
        documents: filtered.map(d => ({
          id: d.id,
          documentId: d.documentId,
          title: d.title,
          type: d.type,
          classification: d.classification,
          qaStatus: d.qaStatus,
          qaApprovedBy: d.qaApprovedBy,
          qaApprovedAt: d.qaApprovedAt?.toISOString() ?? null,
          qaNotes: d.qaNotes,
          markdownUrl: d.markdownUrl,
          htmlUrl: d.htmlUrl,
          pdfUrl: d.pdfUrl,
          metadata: d.metadata,
          createdAt: d.createdAt.toISOString(),
          updatedAt: d.updatedAt.toISOString(),
        })),
        total: filtered.length,
      };
    }),

  /**
   * Generate a document using OpenAI and save to the library.
   */
  generatePDF: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        type: z.string().default("report"),
        classification: z.string().default("internal"),
        prompt: z.string().min(1),
        context: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const openai = getOpenAIClient();

      const systemPrompt = `You are a professional document writer for CEPHO, an AI-powered executive intelligence platform. 
Generate a well-structured, professional document in Markdown format.
The document should be comprehensive, well-organized, and suitable for executive review.`;

      const userPrompt = `Generate a ${input.type} document titled "${input.title}".
${input.context ? `Context: ${input.context}` : ""}
Request: ${input.prompt}

Format as a professional Markdown document with:
- Executive summary
- Main sections with clear headings
- Key findings or recommendations
- Next steps (if applicable)`;

      const completion = await openai.chat.completions.create({
        model: getModelForTask("generate"),
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 2000,
        temperature: 0.7,
      });

      const markdownContent =
        completion.choices[0]?.message?.content ??
        `# ${input.title}\n\nDocument generation failed.`;

      const docId = generateDocId();

      const [doc] = await db
        .insert(generatedDocuments)
        .values({
          documentId: docId,
          userId: ctx.user.id,
          title: input.title,
          type: input.type,
          content: markdownContent,
          classification: input.classification,
          qaStatus: "pending",
          metadata: {
            generatedBy: "openai",
            model: getModelForTask("generate"),
          },
        })
        .returning();

      // Create a data URL for the markdown content (no S3 needed)
      const markdownDataUrl = `data:text/markdown;charset=utf-8,${encodeURIComponent(markdownContent)}`;

      return {
        id: doc.id,
        documentId: doc.documentId,
        title: doc.title,
        markdownUrl: markdownDataUrl,
        content: markdownContent,
        createdAt: doc.createdAt.toISOString(),
      };
    }),

  /**
   * Delete a document — accepts either numeric id or string documentId.
   */
  delete: protectedProcedure
    .input(
      z.object({
        id: z.number().optional(),
        documentId: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (input.id) {
        await db
          .delete(generatedDocuments)
          .where(
            and(
              eq(generatedDocuments.id, input.id),
              eq(generatedDocuments.userId, ctx.user.id)
            )
          );
      } else if (input.documentId) {
        await db
          .delete(generatedDocuments)
          .where(
            and(
              eq(generatedDocuments.documentId, input.documentId),
              eq(generatedDocuments.userId, ctx.user.id)
            )
          );
      }
      return { success: true };
    }),

  /**
   * Update QA status — accepts either numeric id or string documentId.
   */
  updateQAStatus: protectedProcedure
    .input(
      z.object({
        id: z.number().optional(),
        documentId: z.string().optional(),
        qaStatus: z
          .enum(["pending", "approved", "rejected", "needs_revision"])
          .optional(),
        status: z
          .enum(["pending", "approved", "rejected", "needs_revision"])
          .optional(),
        qaNotes: z.string().optional(),
        notes: z.string().optional(),
        qaApprovedBy: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const newStatus = input.qaStatus ?? input.status ?? "pending";
      const newNotes = input.qaNotes ?? input.notes ?? null;

      const updateData = {
        qaStatus: newStatus,
        qaNotes: newNotes,
        qaApprovedBy: input.qaApprovedBy ?? null,
        qaApprovedAt: newStatus === "approved" ? new Date() : null,
        updatedAt: new Date(),
      };

      if (input.id) {
        await db
          .update(generatedDocuments)
          .set(updateData)
          .where(
            and(
              eq(generatedDocuments.id, input.id),
              eq(generatedDocuments.userId, ctx.user.id)
            )
          );
      } else if (input.documentId) {
        await db
          .update(generatedDocuments)
          .set(updateData)
          .where(
            and(
              eq(generatedDocuments.documentId, input.documentId),
              eq(generatedDocuments.userId, ctx.user.id)
            )
          );
      }

      return { success: true };
    }),

  /**
   * Send document via email — uses SMTP when configured, otherwise records intent.
   */
  sendEmail: protectedProcedure
    .input(
      z.object({
        documentId: z.union([z.number(), z.string()]),
        recipients: z.array(
          z.union([
            z.string().email(),
            z.object({
              email: z.string().email(),
              name: z.string().optional(),
            }),
          ])
        ),
        subject: z.string().optional(),
        message: z.string().optional(),
        includeAsLink: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Normalise recipients to {email, name?} objects
      const normalised = input.recipients.map(r =>
        typeof r === "string" ? { email: r } : r
      );
      const docId =
        typeof input.documentId === "string"
          ? parseInt(input.documentId, 10)
          : input.documentId;

      // Fetch document details for the email body
      const [doc] = await db
        .select()
        .from(generatedDocuments)
        .where(eq(generatedDocuments.id, docId))
        .limit(1);

      const subject =
        input.subject ??
        (doc ? `Document: ${doc.title}` : "Document from CEPHO");
      const emailBody = input.message
        ? `${input.message}\n\n${doc?.content ? doc.content.substring(0, 500) + "..." : ""}`
        : (doc?.content ?? "Please find the attached document.");

      // Attempt real email delivery if SMTP is configured
      let emailStatus: "sent" | "failed" | "queued" = "queued";
      if (emailService.isConfigured()) {
        const toAddresses = normalised.map(r => r.email);
        const result = await emailService.send({
          to: toAddresses,
          subject,
          text: emailBody,
          html: doc?.content
            ? `<pre style="font-family:sans-serif;white-space:pre-wrap">${emailBody}</pre>`
            : undefined,
        });
        emailStatus = result.success ? "sent" : "failed";
      }

      // Record the email send in the history table
      await db.insert(documentEmailHistory).values({
        documentId: docId,
        userId: ctx.user.id,
        recipients: normalised,
        subject,
        message: input.message ?? null,
        status: emailStatus,
      });

      return {
        success: emailStatus !== "failed",
        sent: normalised.length,
        message:
          emailStatus === "sent"
            ? `Email sent to ${normalised.length} recipient${normalised.length !== 1 ? "s" : ""}`
            : emailStatus === "queued"
              ? `Email queued (SMTP not configured) — ${normalised.length} recipient${normalised.length !== 1 ? "s" : ""} recorded`
              : `Email delivery failed`,
      };
    }),

  /**
   * Get email history for a document.
   */
  getEmailHistory: protectedProcedure
    .input(z.object({ documentId: z.union([z.number(), z.string()]) }))
    .query(async ({ input }) => {
      const docId =
        typeof input.documentId === "string"
          ? parseInt(input.documentId, 10)
          : input.documentId;
      const history = await db
        .select()
        .from(documentEmailHistory)
        .where(eq(documentEmailHistory.documentId, docId))
        .orderBy(desc(documentEmailHistory.sentAt))
        .limit(50);
      return { history };
    }),
});
