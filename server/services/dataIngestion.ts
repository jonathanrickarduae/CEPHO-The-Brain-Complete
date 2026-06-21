/**
 * Data Ingestion Service
 *
 * P2-9: PDF, Word, Excel → knowledge base
 * P2-10: URL scrape → embed → knowledge base
 * P2-11: CSV data import (financial, project data)
 *
 * Each ingestion method:
 * 1. Extracts text from the source
 * 2. Chunks the text into ~500-token segments
 * 3. Embeds each chunk using OpenAI text-embedding-3-small
 * 4. Stores in memory_bank with category="knowledge_base" and source metadata
 */

import OpenAI from "openai";
import { db } from "../db";
import { memoryBank } from "../../drizzle/schema";
import { and, eq } from "drizzle-orm";
import { getEmbeddingModel } from "../utils/modelRouter";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface IngestionResult {
  chunksStored: number;
  source: string;
  title: string;
  wordCount: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");
  return new OpenAI({ apiKey });
}

/**
 * Generate an embedding vector for a text string.
 */
async function embed(text: string): Promise<number[]> {
  const openai = getOpenAIClient();
  const response = await openai.embeddings.create({
    model: getEmbeddingModel(),
    input: text.slice(0, 8000),
  });
  return response.data[0].embedding;
}

/**
 * Split text into chunks of approximately maxWords words with overlap.
 */
function chunkText(text: string, maxWords = 400, overlapWords = 50): string[] {
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const chunks: string[] = [];
  let start = 0;
  while (start < words.length) {
    const end = Math.min(start + maxWords, words.length);
    chunks.push(words.slice(start, end).join(" "));
    if (end >= words.length) break;
    start = end - overlapWords;
  }
  return chunks.filter(c => c.trim().length > 20);
}

/**
 * Store a text chunk in the memory_bank with an embedding.
 */
async function storeChunk(
  userId: number,
  title: string,
  chunkIndex: number,
  chunkText: string,
  source: string
): Promise<void> {
  const key = `${title.slice(0, 150)}_chunk_${chunkIndex}`;
  const embedding = await embed(chunkText);

  // Upsert: delete existing chunk with same key then insert fresh
  await db
    .delete(memoryBank)
    .where(and(eq(memoryBank.userId, userId), eq(memoryBank.key, key)));

  await db.insert(memoryBank).values({
    userId,
    category: "knowledge_base",
    key,
    value: chunkText,
    confidence: 1.0,
    source,
    embedding: embedding as number[] & { toSQL: () => string },
  });
}

// ─── PDF Ingestion ────────────────────────────────────────────────────────────

/**
 * Ingest a PDF buffer into the knowledge base.
 * P2-9: PDF → extract text → chunk → embed → store
 */
export async function ingestPdf(
  userId: number,
  buffer: Buffer,
  filename: string
): Promise<IngestionResult> {
  // Dynamic import to avoid issues when pdf-parse is not installed
  const pdfParse = require("pdf-parse") as (
    buf: Buffer
  ) => Promise<{ text: string }>;
  const data = await pdfParse(buffer);
  const text = data.text;
  const chunks = chunkText(text);
  const title = filename.replace(/\.[^.]+$/, "");

  for (let i = 0; i < chunks.length; i++) {
    await storeChunk(userId, title, i, chunks[i], `pdf:${filename}`);
  }

  return {
    chunksStored: chunks.length,
    source: `pdf:${filename}`,
    title,
    wordCount: text.split(/\s+/).length,
  };
}

// ─── Word Document Ingestion ──────────────────────────────────────────────────

/**
 * Ingest a Word (.docx) buffer into the knowledge base.
 * P2-9: Word → extract text → chunk → embed → store
 */
export async function ingestWord(
  userId: number,
  buffer: Buffer,
  filename: string
): Promise<IngestionResult> {
  const mammoth = await import("mammoth");
  const result = await mammoth.extractRawText({ buffer });
  const text = result.value;
  const chunks = chunkText(text);
  const title = filename.replace(/\.[^.]+$/, "");

  for (let i = 0; i < chunks.length; i++) {
    await storeChunk(userId, title, i, chunks[i], `word:${filename}`);
  }

  return {
    chunksStored: chunks.length,
    source: `word:${filename}`,
    title,
    wordCount: text.split(/\s+/).length,
  };
}

// ─── Excel / Spreadsheet Ingestion ───────────────────────────────────────────

/**
 * Ingest an Excel (.xlsx/.xls) or CSV buffer into the knowledge base.
 * P2-9/P2-11: Spreadsheet → convert rows to text → chunk → embed → store
 */
export async function ingestSpreadsheet(
  userId: number,
  buffer: Buffer,
  filename: string
): Promise<IngestionResult> {
  const XLSX = await import("xlsx");
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const textParts: string[] = [];

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const rows: string[][] = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      defval: "",
    }) as string[][];

    if (rows.length === 0) continue;

    // First row as headers
    const headers = rows[0].map(h => String(h).trim());
    textParts.push(`Sheet: ${sheetName}`);

    for (let r = 1; r < rows.length; r++) {
      const row = rows[r];
      const rowText = headers
        .map((h, i) => `${h}: ${String(row[i] ?? "").trim()}`)
        .filter(pair => !pair.endsWith(": "))
        .join(", ");
      if (rowText.length > 10) {
        textParts.push(rowText);
      }
    }
  }

  const text = textParts.join("\n");
  const chunks = chunkText(text, 300, 30);
  const title = filename.replace(/\.[^.]+$/, "");

  for (let i = 0; i < chunks.length; i++) {
    await storeChunk(userId, title, i, chunks[i], `spreadsheet:${filename}`);
  }

  return {
    chunksStored: chunks.length,
    source: `spreadsheet:${filename}`,
    title,
    wordCount: text.split(/\s+/).length,
  };
}

// ─── URL Ingestion ────────────────────────────────────────────────────────────

// Blocklist for SSRF prevention
const SSRF_BLOCKLIST = [
  /^https?:\/\/localhost/i,
  /^https?:\/\/127\./,
  /^https?:\/\/10\./,
  /^https?:\/\/172\.(1[6-9]|2\d|3[01])\./,
  /^https?:\/\/192\.168\./,
  /^https?:\/\/169\.254\./,
  /^https?:\/\/0\./,
  /^https?:\/\/\[::1\]/,
  /^https?:\/\/metadata\./i,
];

function isSsrfBlocked(url: string): boolean {
  return SSRF_BLOCKLIST.some(pattern => pattern.test(url));
}

/**
 * Ingest a URL by scraping its text content into the knowledge base.
 * P2-10: URL → fetch → extract text → chunk → embed → store
 */
export async function ingestUrl(
  userId: number,
  url: string
): Promise<IngestionResult> {
  if (isSsrfBlocked(url)) {
    throw new Error(
      "URL is not allowed: internal/private addresses are blocked"
    );
  }

  const cheerio = await import("cheerio");

  const response = await fetch(url, {
    headers: {
      "User-Agent": "CEPHO-Knowledge-Bot/1.0 (+https://cepho.ai/bot)",
      Accept: "text/html,application/xhtml+xml",
    },
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch URL: ${response.status} ${response.statusText}`
    );
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  // Remove non-content elements
  $(
    "script, style, nav, footer, header, aside, [role=navigation], .cookie-banner, .ad, .advertisement"
  ).remove();

  // Extract title
  const title =
    $("h1").first().text().trim() ||
    $("title").text().trim() ||
    new URL(url).hostname;

  // Extract main content
  const mainContent =
    $("main, article, [role=main], .content, .post-content, #content").text() ||
    $("body").text();

  const text = mainContent.replace(/\s+/g, " ").trim();
  const chunks = chunkText(text);

  for (let i = 0; i < chunks.length; i++) {
    await storeChunk(userId, title, i, chunks[i], `url:${url}`);
  }

  return {
    chunksStored: chunks.length,
    source: `url:${url}`,
    title,
    wordCount: text.split(/\s+/).length,
  };
}

// ─── CSV Ingestion ────────────────────────────────────────────────────────────

/**
 * Ingest a CSV string into the knowledge base.
 * P2-11: CSV → parse rows → convert to text → chunk → embed → store
 */
export async function ingestCsv(
  userId: number,
  csvText: string,
  filename: string
): Promise<IngestionResult> {
  // Simple CSV parser (handles quoted fields)
  const lines = csvText.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length < 2) {
    throw new Error("CSV must have at least a header row and one data row");
  }

  const parseRow = (line: string): string[] => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const headers = parseRow(lines[0]);
  const textParts: string[] = [];

  for (let r = 1; r < lines.length; r++) {
    const values = parseRow(lines[r]);
    const rowText = headers
      .map((h, i) => `${h}: ${values[i] ?? ""}`)
      .filter(pair => !pair.endsWith(": "))
      .join(", ");
    if (rowText.length > 10) {
      textParts.push(rowText);
    }
  }

  const text = textParts.join("\n");
  const chunks = chunkText(text, 300, 30);
  const title = filename.replace(/\.[^.]+$/, "");

  for (let i = 0; i < chunks.length; i++) {
    await storeChunk(userId, title, i, chunks[i], `csv:${filename}`);
  }

  return {
    chunksStored: chunks.length,
    source: `csv:${filename}`,
    title,
    wordCount: text.split(/\s+/).length,
  };
}
