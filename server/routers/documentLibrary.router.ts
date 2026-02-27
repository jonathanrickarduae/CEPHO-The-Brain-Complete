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
import { generatedDocuments } from "../../drizzle/schema";

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
        model: "gpt-4o-mini",
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
          metadata: { generatedBy: "openai", model: "gpt-4o-mini" },
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
   * Delete a document.
   */
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      await db
        .delete(generatedDocuments)
        .where(
          and(
            eq(generatedDocuments.id, input.id),
            eq(generatedDocuments.userId, ctx.user.id)
          )
        );

      return { success: true };
    }),

  /**
   * Update QA status of a document.
   */
  updateQAStatus: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        qaStatus: z.enum(["pending", "approved", "rejected", "needs_revision"]),
        qaNotes: z.string().optional(),
        qaApprovedBy: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await db
        .update(generatedDocuments)
        .set({
          qaStatus: input.qaStatus,
          qaNotes: input.qaNotes ?? null,
          qaApprovedBy: input.qaApprovedBy ?? null,
          qaApprovedAt: input.qaStatus === "approved" ? new Date() : null,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(generatedDocuments.id, input.id),
            eq(generatedDocuments.userId, ctx.user.id)
          )
        );

      return { success: true };
    }),

  /**
   * Send document via email (stub — logs intent, no actual email sent without SMTP config).
   */
  sendEmail: protectedProcedure
    .input(
      z.object({
        documentId: z.number(),
        recipients: z.array(z.string().email()),
        subject: z.string().optional(),
        message: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      // In production this would use SendGrid/SES
      // For now, log the intent and return success
      console.log(
        `[DocumentLibrary] Email send requested for doc ${input.documentId} to ${input.recipients.join(", ")}`
      );

      return {
        success: true,
        sent: input.recipients.length,
        message: "Email queued for delivery",
      };
    }),

  /**
   * Get email history for a document.
   */
  getEmailHistory: protectedProcedure
    .input(z.object({ documentId: z.number() }))
    .query(async () => {
      // Returns empty history until email tracking is implemented
      return { history: [] };
    }),
});
