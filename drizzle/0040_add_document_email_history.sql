-- Migration 0040: Add document_email_history table
-- Tracks every time a document is emailed from the Document Library

CREATE TABLE IF NOT EXISTS "document_email_history" (
  "id"           SERIAL PRIMARY KEY,
  "documentId"   INTEGER NOT NULL,
  "userId"       INTEGER NOT NULL,
  "recipients"   JSONB NOT NULL DEFAULT '[]',
  "subject"      TEXT,
  "message"      TEXT,
  "sentAt"       TIMESTAMP DEFAULT NOW() NOT NULL,
  "status"       TEXT NOT NULL DEFAULT 'sent'
);

CREATE INDEX IF NOT EXISTS "idx_doc_email_history_document" ON "document_email_history" ("documentId");
CREATE INDEX IF NOT EXISTS "idx_doc_email_history_user" ON "document_email_history" ("userId");
