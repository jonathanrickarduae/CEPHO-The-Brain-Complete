-- Migration 026: Persephone Board Knowledge Corpus (PB-01, PB-02)
-- Creates the board_knowledge_corpus table for storing RAG-indexed knowledge
-- for each of the 14 Persephone Board AI members.
-- Embeddings stored as JSON arrays (portable, no pgvector extension required).

CREATE TABLE IF NOT EXISTS "board_knowledge_corpus" (
  "id"          SERIAL PRIMARY KEY,
  "member_id"   VARCHAR(100) NOT NULL,          -- e.g. "altman", "huang", "musk"
  "member_name" VARCHAR(200) NOT NULL,
  "chunk_index" INTEGER NOT NULL DEFAULT 0,      -- Position within the corpus
  "content"     TEXT NOT NULL,                   -- The knowledge chunk text
  "source"      VARCHAR(500),                    -- e.g. "TED Talk 2023", "Interview Forbes"
  "content_type" VARCHAR(100) DEFAULT 'knowledge', -- "knowledge" | "quote" | "principle"
  "embedding"   JSONB,                           -- OpenAI text-embedding-3-small vector (1536-dim)
  "created_at"  TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at"  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "idx_board_knowledge_member_id"
  ON "board_knowledge_corpus" ("member_id");

CREATE INDEX IF NOT EXISTS "idx_board_knowledge_content_type"
  ON "board_knowledge_corpus" ("member_id", "content_type");
