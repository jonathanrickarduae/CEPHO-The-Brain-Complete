-- Innovation Hub Workflow Tables
-- Connects AI agents, SMEs, Chief of Staff, and Digital Twin to Innovation Hub

-- Idea Suggestions Table
CREATE TABLE IF NOT EXISTS idea_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type VARCHAR(50) NOT NULL CHECK (source_type IN ('sme', 'ai_agent', 'chief_of_staff', 'digital_twin')),
  source_id VARCHAR(255) NOT NULL,
  source_name VARCHAR(255) NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  rationale TEXT NOT NULL,
  category VARCHAR(100) DEFAULT 'General',
  tags JSONB DEFAULT '[]'::jsonb,
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  confidence INTEGER DEFAULT 70 CHECK (confidence >= 0 AND confidence <= 100),
  supporting_data JSONB DEFAULT '{}'::jsonb,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'accepted', 'rejected', 'converted')),
  reviewed_by VARCHAR(255),
  reviewed_at TIMESTAMP,
  rejection_reason TEXT,
  converted_idea_id INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Idea Conversions Table
CREATE TABLE IF NOT EXISTS idea_conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  suggestion_id UUID NOT NULL REFERENCES idea_suggestions(id) ON DELETE CASCADE,
  idea_id INTEGER NOT NULL,
  converted_by VARCHAR(255) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_idea_suggestions_status ON idea_suggestions(status);
CREATE INDEX IF NOT EXISTS idx_idea_suggestions_source ON idea_suggestions(source_type, source_id);
CREATE INDEX IF NOT EXISTS idx_idea_suggestions_priority ON idea_suggestions(priority, confidence DESC);
CREATE INDEX IF NOT EXISTS idx_idea_suggestions_created_at ON idea_suggestions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_idea_conversions_suggestion ON idea_conversions(suggestion_id);
CREATE INDEX IF NOT EXISTS idx_idea_conversions_idea ON idea_conversions(idea_id);
