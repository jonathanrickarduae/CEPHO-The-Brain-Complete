-- Phase 6: AI Agents System Database Schema
-- Date: February 14, 2026

-- AI Agents Registry
CREATE TABLE IF NOT EXISTS ai_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  specialization TEXT NOT NULL,
  description TEXT,
  performance_rating INTEGER DEFAULT 50 CHECK (performance_rating >= 0 AND performance_rating <= 100),
  tasks_completed INTEGER DEFAULT 0,
  success_rate DECIMAL(5,2) DEFAULT 0 CHECK (success_rate >= 0 AND success_rate <= 100),
  avg_response_time INTEGER DEFAULT 0,
  user_satisfaction DECIMAL(5,2) DEFAULT 50,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'learning', 'idle', 'disabled')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_agents_category ON ai_agents(category);
CREATE INDEX IF NOT EXISTS idx_ai_agents_status ON ai_agents(status);
CREATE INDEX IF NOT EXISTS idx_ai_agents_performance ON ai_agents(performance_rating DESC);

-- Agent Skills & Capabilities
CREATE TABLE IF NOT EXISTS agent_capabilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES ai_agents(id) ON DELETE CASCADE,
  capability_type VARCHAR(50) NOT NULL CHECK (capability_type IN ('skill', 'tool', 'api', 'framework')),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  version VARCHAR(50),
  cost_per_month DECIMAL(10,2) DEFAULT 0,
  added_date TIMESTAMP DEFAULT NOW(),
  approved_by VARCHAR(100),
  approved_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_agent_capabilities_agent ON agent_capabilities(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_capabilities_type ON agent_capabilities(capability_type);

-- Daily Reports
CREATE TABLE IF NOT EXISTS agent_daily_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES ai_agents(id) ON DELETE CASCADE,
  report_date DATE NOT NULL,
  tasks_completed INTEGER DEFAULT 0,
  success_rate DECIMAL(5,2) DEFAULT 0,
  avg_response_time INTEGER DEFAULT 0,
  user_satisfaction DECIMAL(5,2) DEFAULT 0,
  improvements_made JSONB DEFAULT '[]'::jsonb,
  learning_outcomes JSONB DEFAULT '{}'::jsonb,
  approval_requests JSONB DEFAULT '[]'::jsonb,
  recommendations JSONB DEFAULT '[]'::jsonb,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'approved', 'rejected')),
  reviewed_by VARCHAR(100),
  reviewed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(agent_id, report_date)
);

CREATE INDEX IF NOT EXISTS idx_agent_reports_agent ON agent_daily_reports(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_reports_date ON agent_daily_reports(report_date DESC);
CREATE INDEX IF NOT EXISTS idx_agent_reports_status ON agent_daily_reports(status);

-- Learning History
CREATE TABLE IF NOT EXISTS agent_learning_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES ai_agents(id) ON DELETE CASCADE,
  learning_date DATE NOT NULL,
  source VARCHAR(200),
  source_url TEXT,
  concepts_learned TEXT[],
  articles_read INTEGER DEFAULT 0,
  knowledge_added TEXT,
  relevance_score DECIMAL(5,2) DEFAULT 0,
  applied BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_learning_agent ON agent_learning_history(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_learning_date ON agent_learning_history(learning_date DESC);

-- Approval Requests
CREATE TABLE IF NOT EXISTS agent_approval_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES ai_agents(id) ON DELETE CASCADE,
  request_type VARCHAR(50) NOT NULL CHECK (request_type IN ('capability', 'tool', 'api', 'framework', 'process_change')),
  request_title VARCHAR(200) NOT NULL,
  request_details JSONB NOT NULL,
  cost_estimate DECIMAL(10,2) DEFAULT 0,
  benefit_estimate TEXT,
  risk_level VARCHAR(20) DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'implemented')),
  approved_by VARCHAR(100),
  approved_at TIMESTAMP,
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_approvals_agent ON agent_approval_requests(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_approvals_status ON agent_approval_requests(status);
CREATE INDEX IF NOT EXISTS idx_agent_approvals_risk ON agent_approval_requests(risk_level);

-- Agent Performance History
CREATE TABLE IF NOT EXISTS agent_performance_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES ai_agents(id) ON DELETE CASCADE,
  measurement_date DATE NOT NULL,
  performance_rating INTEGER CHECK (performance_rating >= 0 AND performance_rating <= 100),
  tasks_completed INTEGER DEFAULT 0,
  success_rate DECIMAL(5,2) DEFAULT 0,
  user_satisfaction DECIMAL(5,2) DEFAULT 0,
  learning_rate DECIMAL(5,2) DEFAULT 0,
  innovation_score DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(agent_id, measurement_date)
);

CREATE INDEX IF NOT EXISTS idx_agent_performance_agent ON agent_performance_history(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_performance_date ON agent_performance_history(measurement_date DESC);

-- Agent Tasks (for tracking individual task execution)
CREATE TABLE IF NOT EXISTS agent_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES ai_agents(id) ON DELETE CASCADE,
  task_type VARCHAR(100) NOT NULL,
  task_description TEXT,
  input_data JSONB,
  output_data JSONB,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  response_time INTEGER, -- milliseconds
  error_message TEXT,
  user_feedback INTEGER CHECK (user_feedback >= 1 AND user_feedback <= 5),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_tasks_agent ON agent_tasks(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_status ON agent_tasks(status);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_created ON agent_tasks(created_at DESC);

-- Agent Knowledge Base
CREATE TABLE IF NOT EXISTS agent_knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES ai_agents(id) ON DELETE CASCADE,
  category VARCHAR(100) NOT NULL,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  source VARCHAR(200),
  source_url TEXT,
  tags TEXT[],
  relevance_score DECIMAL(5,2) DEFAULT 0,
  last_accessed TIMESTAMP,
  access_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_knowledge_agent ON agent_knowledge_base(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_knowledge_category ON agent_knowledge_base(category);
CREATE INDEX IF NOT EXISTS idx_agent_knowledge_relevance ON agent_knowledge_base(relevance_score DESC);

-- Comments
COMMENT ON TABLE ai_agents IS 'Registry of all AI agents in the system';
COMMENT ON TABLE agent_capabilities IS 'Skills, tools, APIs, and frameworks available to each agent';
COMMENT ON TABLE agent_daily_reports IS 'Daily performance and learning reports from agents';
COMMENT ON TABLE agent_learning_history IS 'Historical record of agent learning activities';
COMMENT ON TABLE agent_approval_requests IS 'Requests from agents for new capabilities or changes';
COMMENT ON TABLE agent_performance_history IS 'Historical performance metrics for trend analysis';
COMMENT ON TABLE agent_tasks IS 'Individual tasks executed by agents';
COMMENT ON TABLE agent_knowledge_base IS 'Agent-specific knowledge and learnings';
