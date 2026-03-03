/**
 * Data Ingestion Router
 *
 * P2-9: ingestDocument — upload PDF, Word, or Excel file → knowledge base
 * P2-10: ingestUrl — scrape a URL → knowledge base
 * P2-11: ingestCsv — upload CSV text → knowledge base
 * list — list all ingested knowledge base entries for a user
 * delete — remove an ingested document from the knowledge base
 */

import { z } from "zod";
import { eq, and, like, desc } from "drizzle-orm";
import { protectedProcedure, router } from "../_core/trpc";
import { db } from "../db";
import { memoryBank } from "../../drizzle/schema";
import {
  ingestPdf,
  ingestWord,
  ingestSpreadsheet,
  ingestUrl,
  ingestCsv,
} from "../services/dataIngestion";

export const dataIngestionRouter = router({
  /**
   * Ingest a document (PDF, Word, Excel) from a base64-encoded buffer.
   * The client sends the file as base64 with a filename and MIME type.
   */
  ingestDocument: protectedProcedure
    .input(
      z.object({
        filename: z.string().min(1).max(255),
        mimeType: z.string().min(1),
        base64Content: z.string().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const buffer = Buffer.from(input.base64Content, "base64");
      const filename = input.filename.toLowerCase();
      const mime = input.mimeType.toLowerCase();

      let result;

      if (
        mime === "application/pdf" ||
        filename.endsWith(".pdf")
      ) {
        result = await ingestPdf(ctx.user.id, buffer, input.filename);
      } else if (
        mime ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        mime === "application/msword" ||
        filename.endsWith(".docx") ||
        filename.endsWith(".doc")
      ) {
        result = await ingestWord(ctx.user.id, buffer, input.filename);
      } else if (
        mime ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        mime === "application/vnd.ms-excel" ||
        filename.endsWith(".xlsx") ||
        filename.endsWith(".xls")
      ) {
        result = await ingestSpreadsheet(ctx.user.id, buffer, input.filename);
      } else {
        throw new Error(
          `Unsupported file type: ${input.mimeType}. Supported types: PDF, Word (.docx), Excel (.xlsx/.xls)`
        );
      }

      return result;
    }),

  /**
   * Ingest a URL by scraping its text content.
   * P2-10: URL → fetch → extract → embed → store
   */
  ingestUrl: protectedProcedure
    .input(
      z.object({
        url: z.string().url("Must be a valid URL"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const result = await ingestUrl(ctx.user.id, input.url);
      return result;
    }),

  /**
   * Ingest a CSV file from text content.
   * P2-11: CSV → parse → embed → store
   */
  ingestCsv: protectedProcedure
    .input(
      z.object({
        filename: z.string().min(1).max(255),
        csvContent: z.string().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const result = await ingestCsv(
        ctx.user.id,
        input.csvContent,
        input.filename
      );
      return result;
    }),

  /**
   * List all knowledge base entries for the current user.
   * Groups by source document for a clean UI.
   */
  listDocuments: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      const rows = await db
        .select({
          id: memoryBank.id,
          key: memoryBank.key,
          source: memoryBank.source,
          createdAt: memoryBank.createdAt,
        })
        .from(memoryBank)
        .where(
          and(
            eq(memoryBank.userId, ctx.user.id),
            eq(memoryBank.category, "knowledge_base")
          )
        )
        .orderBy(desc(memoryBank.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      // Group chunks by source document
      const docMap = new Map<
        string,
        { source: string; chunkCount: number; createdAt: Date; firstId: number }
      >();

      for (const row of rows) {
        const src = row.source ?? "unknown";
        if (!docMap.has(src)) {
          docMap.set(src, {
            source: src,
            chunkCount: 0,
            createdAt: row.createdAt,
            firstId: row.id,
          });
        }
        docMap.get(src)!.chunkCount++;
      }

      return {
        documents: Array.from(docMap.values()).map(d => ({
          source: d.source,
          chunkCount: d.chunkCount,
          createdAt: d.createdAt.toISOString(),
          type: d.source.split(":")[0] ?? "unknown",
          title: d.source.split(":").slice(1).join(":"),
        })),
        total: docMap.size,
      };
    }),

  /**
   * Delete all chunks for a specific source document.
   */
  deleteDocument: protectedProcedure
    .input(
      z.object({
        source: z.string().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await db
        .delete(memoryBank)
        .where(
          and(
            eq(memoryBank.userId, ctx.user.id),
            eq(memoryBank.category, "knowledge_base"),
            like(memoryBank.source, input.source)
          )
        );
      return { success: true };
    }),
});
