-- Migration: Add trading tables for Project Genesis
-- Created: 2026-02-15

-- Trading signals table
CREATE TABLE IF NOT EXISTS trading_signals (
  id VARCHAR(100) PRIMARY KEY,
  project_id INTEGER,
  user_id INTEGER NOT NULL,
  timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
  symbol VARCHAR(10) NOT NULL,
  action VARCHAR(10) NOT NULL CHECK (action IN ('BUY', 'SELL', 'HOLD')),
  price DECIMAL(10, 2) NOT NULL,
  confidence INTEGER NOT NULL CHECK (confidence >= 0 AND confidence <= 100),
  indicators JSONB NOT NULL,
  reasoning TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_trading_signals_user ON trading_signals(user_id);
CREATE INDEX idx_trading_signals_project ON trading_signals(project_id);
CREATE INDEX idx_trading_signals_timestamp ON trading_signals(timestamp DESC);
CREATE INDEX idx_trading_signals_symbol ON trading_signals(symbol);

-- Trading positions table
CREATE TABLE IF NOT EXISTS trading_positions (
  id SERIAL PRIMARY KEY,
  project_id INTEGER,
  user_id INTEGER NOT NULL,
  symbol VARCHAR(10) NOT NULL,
  entry_price DECIMAL(10, 2) NOT NULL,
  exit_price DECIMAL(10, 2),
  quantity INTEGER NOT NULL,
  profit_loss DECIMAL(10, 2),
  status VARCHAR(20) NOT NULL CHECK (status IN ('OPEN', 'CLOSED', 'CANCELLED')),
  entry_signal_id VARCHAR(100),
  exit_signal_id VARCHAR(100),
  opened_at TIMESTAMP NOT NULL,
  closed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (entry_signal_id) REFERENCES trading_signals(id) ON DELETE SET NULL,
  FOREIGN KEY (exit_signal_id) REFERENCES trading_signals(id) ON DELETE SET NULL
);

CREATE INDEX idx_trading_positions_user ON trading_positions(user_id);
CREATE INDEX idx_trading_positions_project ON trading_positions(project_id);
CREATE INDEX idx_trading_positions_status ON trading_positions(status);
CREATE INDEX idx_trading_positions_symbol ON trading_positions(symbol);

-- Victoria briefings table
CREATE TABLE IF NOT EXISTS victoria_briefings (
  id VARCHAR(100) PRIMARY KEY,
  project_id INTEGER,
  user_id INTEGER NOT NULL,
  briefing_type VARCHAR(50) NOT NULL CHECK (briefing_type IN ('morning', 'hourly', 'evening', 'alert')),
  subject VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  summary VARCHAR(1000),
  signals JSONB,
  performance JSONB,
  sent_at TIMESTAMP NOT NULL,
  email_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_victoria_briefings_user ON victoria_briefings(user_id);
CREATE INDEX idx_victoria_briefings_project ON victoria_briefings(project_id);
CREATE INDEX idx_victoria_briefings_type ON victoria_briefings(briefing_type);
CREATE INDEX idx_victoria_briefings_sent_at ON victoria_briefings(sent_at DESC);

-- Trading performance metrics table
CREATE TABLE IF NOT EXISTS trading_performance (
  id SERIAL PRIMARY KEY,
  project_id INTEGER,
  user_id INTEGER NOT NULL,
  date DATE NOT NULL,
  symbol VARCHAR(10) NOT NULL,
  total_trades INTEGER DEFAULT 0,
  profitable_trades INTEGER DEFAULT 0,
  losing_trades INTEGER DEFAULT 0,
  total_pnl DECIMAL(10, 2) DEFAULT 0,
  roi DECIMAL(10, 4) DEFAULT 0,
  win_rate DECIMAL(5, 2) DEFAULT 0,
  avg_profit DECIMAL(10, 2) DEFAULT 0,
  avg_loss DECIMAL(10, 2) DEFAULT 0,
  max_drawdown DECIMAL(10, 2) DEFAULT 0,
  sharpe_ratio DECIMAL(10, 4),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, project_id, date, symbol)
);

CREATE INDEX idx_trading_performance_user ON trading_performance(user_id);
CREATE INDEX idx_trading_performance_project ON trading_performance(project_id);
CREATE INDEX idx_trading_performance_date ON trading_performance(date DESC);

-- Trading workflow logs table
CREATE TABLE IF NOT EXISTS trading_workflow_logs (
  id SERIAL PRIMARY KEY,
  project_id INTEGER,
  user_id INTEGER NOT NULL,
  workflow_type VARCHAR(50) NOT NULL,
  signal_id VARCHAR(100),
  status VARCHAR(20) NOT NULL CHECK (status IN ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED')),
  step VARCHAR(100),
  message TEXT,
  error TEXT,
  metadata JSONB,
  started_at TIMESTAMP NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (signal_id) REFERENCES trading_signals(id) ON DELETE SET NULL
);

CREATE INDEX idx_trading_workflow_logs_user ON trading_workflow_logs(user_id);
CREATE INDEX idx_trading_workflow_logs_project ON trading_workflow_logs(project_id);
CREATE INDEX idx_trading_workflow_logs_status ON trading_workflow_logs(status);
CREATE INDEX idx_trading_workflow_logs_started_at ON trading_workflow_logs(started_at DESC);

-- Add comments for documentation
COMMENT ON TABLE trading_signals IS 'Stores all trading signals generated by the system';
COMMENT ON TABLE trading_positions IS 'Tracks open and closed trading positions';
COMMENT ON TABLE victoria_briefings IS 'Stores Victoria AI briefings sent to users';
COMMENT ON TABLE trading_performance IS 'Daily performance metrics for trading activities';
COMMENT ON TABLE trading_workflow_logs IS 'Logs for trading workflow execution';
