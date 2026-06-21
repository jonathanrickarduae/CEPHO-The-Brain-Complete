-- Migration 021: Agent Memory Embeddings
-- Adds embedding support to memory_bank for semantic similarity search.
-- Uses JSON array as a portable embedding store (pgvector optional upgrade path).

-- Add embedding column to memory_bank if it doesn't exist
ALTER TABLE memory_bank ADD COLUMN IF NOT EXISTS embedding json;

-- Add index on category + userId for fast retrieval
CREATE INDEX IF NOT EXISTS idx_memory_bank_user_category 
  ON memory_bank (userId, category);

-- Add index on key for exact lookups
CREATE INDEX IF NOT EXISTS idx_memory_bank_user_key 
  ON memory_bank (userId, key);
